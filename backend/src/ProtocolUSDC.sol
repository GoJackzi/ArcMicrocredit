// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC20Token
 * @dev Minimal ERC20 interface for ARC USDC token (to avoid naming conflict)
 */
interface IERC20Token {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

/**
 * @title ProtocolUSDC
 * @dev USDC contract that allows the protocol to mint unlimited tokens
 * @notice Only the protocol contract can mint - not regular users
 */
contract ProtocolUSDC {
    string public name = "Protocol USDC";
    string public symbol = "USDC";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    address public protocolContract; // Only protocol can mint
    
    // Exchange rate: 1 ARC USDC = 500 ProtocolUSDC
    uint256 public constant EXCHANGE_RATE = 500;
    
    // ARC USDC token contract address
    address public constant ARC_USDC = 0x3600000000000000000000000000000000000000;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Deposit(address indexed user, uint256 arcUSDCAmount, uint256 tokensMinted);
    
    constructor(address _protocolContract) {
        protocolContract = _protocolContract;
    }
    
    modifier onlyProtocol() {
        require(msg.sender == protocolContract, "Only protocol can call this");
        _;
    }
    
    /**
     * @dev Update protocol contract address (only called once during deployment)
     * @notice This allows setting the protocol contract after both contracts are deployed
     */
    function setProtocolContract(address _protocolContract) external {
        require(protocolContract == address(0) || protocolContract == msg.sender, "Unauthorized");
        protocolContract = _protocolContract;
    }
    
    /**
     * @dev Mint tokens to an address (only protocol can call)
     * @notice Unlimited minting capability for the protocol
     */
    function mint(address to, uint256 amount) external onlyProtocol {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }
    
    /**
     * @dev Transfer tokens
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    /**
     * @dev Approve spender to transfer tokens
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    /**
     * @dev Transfer tokens from one address to another (requires approval)
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    /**
     * @dev Deposit ARC USDC token and receive ProtocolUSDC tokens
     * @param amount Amount of ARC USDC to deposit
     * @notice Exchange rate: 1 ARC USDC = 500 ProtocolUSDC
     * @notice User must approve this contract to spend ARC USDC first
     * @notice OR the contract must already have received ARC USDC via transferFrom
     */
    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        
        // Check if contract has ARC USDC (already received via transferFrom from ReputationCredit)
        uint256 contractBalance = IERC20Token(ARC_USDC).balanceOf(address(this));
        require(contractBalance >= amount, "Insufficient ARC USDC in contract");
        
        // If not enough in contract, try to transfer from msg.sender
        if (contractBalance < amount) {
            require(
                IERC20Token(ARC_USDC).transferFrom(msg.sender, address(this), amount),
                "ARC USDC transfer failed"
            );
        }
        
        // Calculate ProtocolUSDC to mint (1:500 ratio)
        uint256 tokensToMint = amount * EXCHANGE_RATE;
        
        // Mint tokens to depositor
        balanceOf[msg.sender] += tokensToMint;
        totalSupply += tokensToMint;
        
        emit Transfer(address(0), msg.sender, tokensToMint);
        emit Deposit(msg.sender, amount, tokensToMint);
    }
    
    /**
     * @dev Deposit ARC USDC for a specific recipient
     * @param amount Amount of ARC USDC to deposit
     * @param recipient Address to receive ProtocolUSDC tokens
     * @notice Used when ReputationCredit deposits on behalf of user
     */
    function depositFor(uint256 amount, address recipient) external {
        require(amount > 0, "Amount must be greater than 0");
        require(recipient != address(0), "Invalid recipient");
        
        // Check contract has ARC USDC (sent by ReputationCredit)
        uint256 contractBalance = IERC20Token(ARC_USDC).balanceOf(address(this));
        require(contractBalance >= amount, "Insufficient ARC USDC in contract");
        
        // Calculate ProtocolUSDC to mint (1:500 ratio)
        uint256 tokensToMint = amount * EXCHANGE_RATE;
        
        // Mint tokens to recipient
        balanceOf[recipient] += tokensToMint;
        totalSupply += tokensToMint;
        
        emit Transfer(address(0), recipient, tokensToMint);
        emit Deposit(recipient, amount, tokensToMint);
    }
}

