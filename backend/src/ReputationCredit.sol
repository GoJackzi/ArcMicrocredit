// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC20
 * @dev Minimal ERC20 interface for token transfers
 */
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function mint(address to, uint256 amount) external; // For ProtocolUSDC minting
}

/**
 * @title ReputationCredit
 * @dev A reputation-based microcredit protocol for Arc Testnet
 * @notice Enables users to build credit scores and access loans based on reputation
 */
contract ReputationCredit {
    // ============ STRUCTS ============
    
    struct CreditProfile {
        uint256 creditScore;           // 0-1000 scale
        uint256 totalBorrowed;        // Total amount ever borrowed
        uint256 totalRepaid;          // Total amount repaid
        uint256 activeLoans;          // Number of active loans
        uint256 lastLoanTime;         // Timestamp of last loan
        bool isActive;                // Whether profile is active
        uint256 reputationPoints;     // Additional reputation points
    }
    
    struct Loan {
        uint256 amount;               // Loan amount in USDC
        uint256 interestRate;         // Annual interest rate (basis points)
        uint256 termDays;             // Loan term in days
        uint256 startTime;            // Loan start timestamp
        uint256 dueDate;              // Loan due date
        bool isActive;                // Whether loan is active
        bool isRepaid;                // Whether loan is repaid
        uint256 repaidAmount;         // Amount repaid so far
    }
    
    // ============ STATE VARIABLES ============
    
    address public owner;
    IERC20 public usdcToken; // USDC token address
    
    uint256 public totalLoansIssued;
    uint256 public totalVolumeBorrowed;
    uint256 public totalVolumeRepaid;
    
    // Interest rate parameters
    uint256 public baseInterestRate = 500;  // 5% base rate
    uint256 public maxInterestRate = 2000;  // 20% max rate
    uint256 public minInterestRate = 200;   // 2% min rate
    
    // Loan limits based on credit score
    uint256 public maxLoanAmount = 10000 * 10**6;  // 10,000 USDC max
    uint256 public minLoanAmount = 100 * 10**6;   // 100 USDC min
    
    // Credit score thresholds
    uint256 public excellentScore = 800;
    uint256 public goodScore = 600;
    uint256 public fairScore = 400;
    uint256 public poorScore = 200;
    
    // ============ MAPPINGS ============
    
    mapping(address => CreditProfile) public creditProfiles;
    mapping(address => Loan[]) public userLoans;
    mapping(address => bool) public authorizedLenders;
    
    // ============ EVENTS ============
    
    event CreditProfileCreated(address indexed user, uint256 initialScore);
    event CreditScoreUpdated(address indexed user, uint256 newScore, uint256 oldScore);
    event LoanRequested(address indexed borrower, uint256 amount, uint256 interestRate);
    event LoanApproved(address indexed borrower, uint256 loanId, uint256 amount);
    event LoanRepaid(address indexed borrower, uint256 loanId, uint256 amount);
    event LoanDefaulted(address indexed borrower, uint256 loanId);
    event ReputationPointsAdded(address indexed user, uint256 points, string reason);
    event USDCDeposited(address indexed user, uint256 nativeAmount, uint256 tokensReceived);
    
    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorizedLender() {
        require(authorizedLenders[msg.sender] || msg.sender == owner, "Not authorized lender");
        _;
    }
    
    modifier validAmount(uint256 amount) {
        require(amount >= minLoanAmount && amount <= maxLoanAmount, "Invalid loan amount");
        _;
    }
    
    modifier hasActiveProfile(address user) {
        require(creditProfiles[user].isActive, "No active credit profile");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _usdcToken) {
        owner = msg.sender;
        usdcToken = IERC20(_usdcToken);
        authorizedLenders[msg.sender] = true;
    }
    
    /**
     * @dev Update USDC token address (in case we need to change it)
     */
    function setUSDCToken(address _usdcToken) external onlyOwner {
        usdcToken = IERC20(_usdcToken);
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Create a new credit profile for yourself (decentralized)
     * @param initialScore The initial credit score (0-1000)
     * @notice Users can create their own profiles with a starting score
     */
    function createCreditProfile(uint256 initialScore) external {
        _createCreditProfileFor(msg.sender, initialScore);
    }

    /**
     * @dev Create a credit profile for yourself with default score (convenience function)
     * @notice Creates profile with starting score of 500 (fair credit)
     */
    function createCreditProfile() external {
        _createCreditProfileFor(msg.sender, 500);
    }

    /**
     * @dev Internal function to create a credit profile
     */
    function _createCreditProfileFor(address user, uint256 initialScore) internal {
        require(!creditProfiles[user].isActive, "Profile already exists");
        require(initialScore <= 1000, "Invalid initial score");
        
        creditProfiles[user] = CreditProfile({
            creditScore: initialScore,
            totalBorrowed: 0,
            totalRepaid: 0,
            activeLoans: 0,
            lastLoanTime: 0,
            isActive: true,
            reputationPoints: 0
        });
        
        emit CreditProfileCreated(user, initialScore);
    }

    /**
     * @dev Create a credit profile for a user (admin function - kept for backward compatibility)
     * @param user The address to create a profile for
     * @param initialScore The initial credit score (0-1000)
     * @notice Admin can create profiles for users, but users can also create their own
     */
    function createCreditProfileFor(address user, uint256 initialScore) external onlyOwner {
        _createCreditProfileFor(user, initialScore);
    }
    
    /**
     * @dev Get the current credit score for a user
     * @param user The user's address
     * @return The current credit score
     */
    function getCreditScore(address user) external view returns (uint256) {
        return creditProfiles[user].creditScore;
    }
    
    /**
     * @dev Calculate the maximum loan amount for a user based on their credit score
     * @param user The user's address
     * @return The maximum loan amount in USDC
     */
    function getLoanLimit(address user) external view returns (uint256) {
        uint256 score = creditProfiles[user].creditScore;
        
        if (score >= excellentScore) {
            return maxLoanAmount;  // 10,000 USDC
        } else if (score >= goodScore) {
            return maxLoanAmount * 7 / 10;  // 7,000 USDC
        } else if (score >= fairScore) {
            return maxLoanAmount * 5 / 10;  // 5,000 USDC
        } else if (score >= poorScore) {
            return maxLoanAmount * 3 / 10;  // 3,000 USDC
        } else {
            return minLoanAmount;  // 100 USDC
        }
    }
    
    /**
     * @dev Calculate interest rate based on credit score
     * @param user The user's address
     * @return The interest rate in basis points
     */
    function calculateInterestRate(address user) public view returns (uint256) {
        uint256 score = creditProfiles[user].creditScore;
        
        // Lower credit score = higher interest rate
        if (score >= excellentScore) {
            return baseInterestRate;  // 5%
        } else if (score >= goodScore) {
            return baseInterestRate + 200;  // 7%
        } else if (score >= fairScore) {
            return baseInterestRate + 500;  // 10%
        } else if (score >= poorScore) {
            return baseInterestRate + 1000;  // 15%
        } else {
            return maxInterestRate;  // 20%
        }
    }
    
    /**
     * @dev Request and auto-approve a loan
     * @param amount The loan amount in USDC
     * @param termDays The loan term in days
     * @notice Automatically approves and mints USDC to borrower if within limits
     */
    function requestLoan(uint256 amount, uint256 termDays) external hasActiveProfile(msg.sender) validAmount(amount) {
        require(termDays >= 7 && termDays <= 365, "Invalid loan term");
        
        uint256 maxAllowed = this.getLoanLimit(msg.sender);
        require(amount <= maxAllowed, "Amount exceeds loan limit");

        uint256 interestRate = calculateInterestRate(msg.sender);
        
        // AUTO-APPROVE: Mint USDC directly to borrower
        usdcToken.mint(msg.sender, amount);
        
        // Create and activate loan immediately
        uint256 loanId = userLoans[msg.sender].length;
        Loan memory newLoan = Loan({
            amount: amount,
            interestRate: interestRate,
            termDays: termDays,
            startTime: block.timestamp,
            dueDate: block.timestamp + (termDays * 1 days),
            isActive: true,
            isRepaid: false,
            repaidAmount: 0
        });
        
        userLoans[msg.sender].push(newLoan);
        
        // Update borrower profile
        creditProfiles[msg.sender].totalBorrowed += amount;
        creditProfiles[msg.sender].activeLoans += 1;
        creditProfiles[msg.sender].lastLoanTime = block.timestamp;
        
        // Update global stats
        totalLoansIssued += 1;
        totalVolumeBorrowed += amount;
        
        emit LoanRequested(msg.sender, amount, interestRate);
        emit LoanApproved(msg.sender, loanId, amount);
    }
    
    /**
     * @dev Approve a loan (called by authorized lenders)
     * @param borrower The borrower's address
     * @param loanId The loan ID to approve
     * @notice Transfers USDC tokens to the borrower upon approval
     */
    function approveLoan(address borrower, uint256 loanId) external onlyAuthorizedLender hasActiveProfile(borrower) {
        require(loanId < userLoans[borrower].length, "Invalid loan ID");
        Loan storage loan = userLoans[borrower][loanId];
        
        require(!loan.isActive, "Loan already active");
        require(!loan.isRepaid, "Loan already processed");
        
        // Check contract has enough USDC
        require(usdcToken.balanceOf(address(this)) >= loan.amount, "Insufficient funds in contract");
        
        // Set loan details
        loan.startTime = block.timestamp;
        loan.dueDate = block.timestamp + (loan.termDays * 1 days);
        loan.isActive = true;
        
        // Transfer USDC to borrower
        require(usdcToken.transfer(borrower, loan.amount), "USDC transfer failed");
        
        // Update borrower profile
        creditProfiles[borrower].totalBorrowed += loan.amount;
        creditProfiles[borrower].activeLoans += 1;
        creditProfiles[borrower].lastLoanTime = block.timestamp;
        
        // Update global stats
        totalLoansIssued += 1;
        totalVolumeBorrowed += loan.amount;
        
        emit LoanApproved(borrower, loanId, loan.amount);
    }
    
    /**
     * @dev Repay a loan using USDC tokens
     * @param loanId The loan ID to repay
     * @notice Borrower must approve this contract to spend USDC first
     */
    function repayLoan(uint256 loanId) external hasActiveProfile(msg.sender) {
        require(loanId < userLoans[msg.sender].length, "Invalid loan ID");
        Loan storage loan = userLoans[msg.sender][loanId];
        
        require(loan.isActive, "Loan not active");
        require(!loan.isRepaid, "Loan already repaid");
        
        // Calculate repayment amount (principal + interest)
        uint256 timeElapsed = block.timestamp - loan.startTime;
        uint256 interestAmount = (loan.amount * loan.interestRate * timeElapsed) / (365 days * 10000);
        uint256 totalRepayment = loan.amount + interestAmount;
        
        // Check borrower has approved enough USDC
        require(usdcToken.allowance(msg.sender, address(this)) >= totalRepayment, "Insufficient USDC allowance");
        
        // Transfer USDC from borrower to contract
        require(usdcToken.transferFrom(msg.sender, address(this), totalRepayment), "USDC transfer failed");
        
        // Update loan
        loan.isRepaid = true;
        loan.isActive = false;
        loan.repaidAmount = totalRepayment;
        
        // Update borrower profile
        creditProfiles[msg.sender].totalRepaid += totalRepayment;
        creditProfiles[msg.sender].activeLoans -= 1;
        
        // Update global stats
        totalVolumeRepaid += totalRepayment;
        
        // Update credit score based on repayment
        _updateCreditScore(msg.sender, true);
        
        emit LoanRepaid(msg.sender, loanId, totalRepayment);
    }
    
    /**
     * @dev Add reputation points to a user
     * @param user The user's address
     * @param points The points to add
     * @param reason The reason for adding points
     */
    function addReputationPoints(address user, uint256 points, string calldata reason) external onlyOwner hasActiveProfile(user) {
        creditProfiles[user].reputationPoints += points;
        
        // Update credit score based on reputation
        _updateCreditScore(user, false);
        
        emit ReputationPointsAdded(user, points, reason);
    }
    
    /**
     * @dev Update credit score based on repayment history and reputation
     * @param user The user's address
     * @param isRepayment Whether this is triggered by a repayment
     */
    function _updateCreditScore(address user, bool isRepayment) internal {
        CreditProfile storage profile = creditProfiles[user];
        uint256 oldScore = profile.creditScore;
        uint256 newScore = oldScore;
        
        // Base score calculation
        if (profile.totalBorrowed > 0) {
            uint256 repaymentRatio = (profile.totalRepaid * 100) / profile.totalBorrowed;
            
            if (repaymentRatio >= 100) {
                newScore = Math.min(1000, newScore + 50);  // Excellent repayment
            } else if (repaymentRatio >= 90) {
                newScore = Math.min(1000, newScore + 25);  // Good repayment
            } else if (repaymentRatio >= 80) {
                newScore = Math.min(1000, newScore + 10);  // Fair repayment
            } else if (repaymentRatio < 50) {
                newScore = Math.max(0, newScore - 100);    // Poor repayment
            }
        }
        
        // Reputation points bonus
        if (profile.reputationPoints > 0) {
            uint256 reputationBonus = Math.min(100, profile.reputationPoints / 10);
            newScore = Math.min(1000, newScore + reputationBonus);
        }
        
        // Active loans penalty
        if (profile.activeLoans > 3) {
            newScore = Math.max(0, newScore - (profile.activeLoans - 3) * 20);
        }
        
        // Recent activity bonus
        if (isRepayment && block.timestamp - profile.lastLoanTime < 30 days) {
            newScore = Math.min(1000, newScore + 10);
        }
        
        profile.creditScore = newScore;
        
        if (newScore != oldScore) {
            emit CreditScoreUpdated(user, newScore, oldScore);
        }
    }
    
    /**
     * @dev Fund the contract with USDC (for lending)
     * @param amount The amount of USDC to deposit
     */
    function fundContract(uint256 amount) external {
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");
    }
    
    /**
     * @dev Get contract USDC balance
     * @return The contract's USDC balance
     */
    function getContractBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }
    
    /**
     * @dev Deposit ARC USDC token and receive ProtocolUSDC tokens (1:500 rate)
     * @param amount Amount of ARC USDC to deposit
     * @notice User must approve this contract to spend ARC USDC first
     */
    function depositNativeUSDC(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        
        // ARC USDC token address
        address arcUSDC = 0x3600000000000000000000000000000000000000;
        
        // Transfer ARC USDC from user to this contract
        require(
            IERC20(arcUSDC).transferFrom(msg.sender, address(this), amount),
            "ARC USDC transfer failed"
        );
        
        // Transfer ARC USDC from this contract to ProtocolUSDC
        require(
            IERC20(arcUSDC).transfer(address(usdcToken), amount),
            "ARC USDC transfer to ProtocolUSDC failed"
        );
        
        // Call ProtocolUSDC depositFor function to mint tokens to the original user
        (bool success, ) = address(usdcToken).call(
            abi.encodeWithSignature("depositFor(uint256,address)", amount, msg.sender)
        );
        require(success, "Deposit failed");
        
        // Calculate tokens received for event
        uint256 tokensReceived = amount * 500; // 1:500 rate
        emit USDCDeposited(msg.sender, amount, tokensReceived);
    }
    
    /**
     * @dev Get detailed loan approval calculation
     * @param user The user's address
     * @param requestedAmount The requested loan amount
     * @return creditScore The user's credit score
     * @return maxLoanLimit Maximum loan limit for this user
     * @return approvedAmount The amount that would be approved
     * @return interestRate The interest rate (basis points)
     * @return riskScore The risk score (0-1000, higher = riskier)
     * @return reason Explanation of approval decision
     */
    function getLoanApprovalDetails(address user, uint256 requestedAmount) external view returns (
        uint256 creditScore,
        uint256 maxLoanLimit,
        uint256 approvedAmount,
        uint256 interestRate,
        uint256 riskScore,
        string memory reason
    ) {
        creditScore = creditProfiles[user].creditScore;
        maxLoanLimit = this.getLoanLimit(user);
        interestRate = calculateInterestRate(user);
        riskScore = _calculateRiskScore(user);
        
        // Determine approval
        if (requestedAmount <= maxLoanLimit) {
            approvedAmount = requestedAmount;
        } else {
            approvedAmount = maxLoanLimit;
        }
        
        reason = _getApprovalReason(creditScore, riskScore, requestedAmount, maxLoanLimit);
    }
    
    /**
     * @dev Calculate risk score (0-1000, higher = riskier)
     */
    function _calculateRiskScore(address user) internal view returns (uint256) {
        CreditProfile storage profile = creditProfiles[user];
        uint256 baseRisk = 1000 - profile.creditScore; // Invert credit score
        
        // Adjust risk based on repayment history
        if (profile.totalBorrowed > 0) {
            uint256 repaymentRatio = (profile.totalRepaid * 100) / profile.totalBorrowed;
            if (repaymentRatio < 50) {
                baseRisk += 300; // High risk
            } else if (repaymentRatio >= 100) {
                baseRisk = baseRisk > 200 ? baseRisk - 200 : 0; // Low risk
            }
        }
        
        // Active loans penalty
        if (profile.activeLoans > 2) {
            baseRisk += profile.activeLoans * 50;
        }
        
        return baseRisk > 1000 ? 1000 : baseRisk;
    }
    
    /**
     * @dev Get human-readable approval reason
     */
    function _getApprovalReason(
        uint256 score,
        uint256 /* risk */,
        uint256 requested,
        uint256 maxAllowed
    ) internal view returns (string memory) {
        if (requested > maxAllowed) {
            return "Requested amount exceeds your loan limit based on credit score";
        }
        
        if (score >= excellentScore) {
            return "Excellent credit score (800+) - Full approval up to 10,000 USDC";
        } else if (score >= goodScore) {
            return "Good credit score (600+) - Approved up to 70% of max limit (7,000 USDC)";
        } else if (score >= fairScore) {
            return "Fair credit score (400+) - Approved up to 50% of max limit (5,000 USDC)";
        } else if (score >= poorScore) {
            return "Poor credit score (200+) - Approved up to 30% of max limit (3,000 USDC)";
        } else {
            return "Very low credit score - Minimum loan only (100 USDC)";
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Add an authorized lender
     * @param lender The lender's address
     */
    function addAuthorizedLender(address lender) external onlyOwner {
        authorizedLenders[lender] = true;
    }
    
    /**
     * @dev Remove an authorized lender
     * @param lender The lender's address
     */
    function removeAuthorizedLender(address lender) external onlyOwner {
        authorizedLenders[lender] = false;
    }
    
    /**
     * @dev Update interest rate parameters
     * @param _baseRate New base interest rate
     * @param _maxRate New maximum interest rate
     * @param _minRate New minimum interest rate
     */
    function updateInterestRates(uint256 _baseRate, uint256 _maxRate, uint256 _minRate) external onlyOwner {
        require(_minRate <= _baseRate && _baseRate <= _maxRate, "Invalid rate configuration");
        baseInterestRate = _baseRate;
        maxInterestRate = _maxRate;
        minInterestRate = _minRate;
    }
    
    /**
     * @dev Update loan limits
     * @param _maxAmount New maximum loan amount
     * @param _minAmount New minimum loan amount
     */
    function updateLoanLimits(uint256 _maxAmount, uint256 _minAmount) external onlyOwner {
        require(_minAmount < _maxAmount, "Invalid loan limits");
        maxLoanAmount = _maxAmount;
        minLoanAmount = _minAmount;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user's loan history
     * @param user The user's address
     * @return Array of loans
     */
    function getUserLoans(address user) external view returns (Loan[] memory) {
        return userLoans[user];
    }
    
    /**
     * @dev Get user's credit profile
     * @param user The user's address
     * @return The credit profile
     */
    function getUserProfile(address user) external view returns (CreditProfile memory) {
        return creditProfiles[user];
    }
    
    /**
     * @dev Get protocol statistics
     * @return totalLoans Total loans issued
     * @return totalBorrowed Total volume borrowed
     * @return totalRepaid Total volume repaid
     */
    function getProtocolStats() external view returns (uint256 totalLoans, uint256 totalBorrowed, uint256 totalRepaid) {
        return (totalLoansIssued, totalVolumeBorrowed, totalVolumeRepaid);
    }
    
    /**
     * @dev Check if a user has an active profile
     * @param user The user's address
     * @return Whether the user has an active profile
     */
    function checkActiveProfile(address user) external view returns (bool) {
        return creditProfiles[user].isActive;
    }
}

// Math library for safe operations
library Math {
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }
}

