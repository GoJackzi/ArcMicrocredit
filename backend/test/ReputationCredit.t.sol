// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ReputationCredit.sol";
import "../src/TestUSDC.sol";

contract ReputationCreditTest is Test {
    ReputationCredit public reputationCredit;
    TestUSDC public testUSDC;
    
    address public owner = address(0x1);
    address public borrower = address(0x2);
    address public lender = address(0x3);
    
    function setUp() public {
        // Deploy TestUSDC first
        testUSDC = new TestUSDC();
        
        // Deploy ReputationCredit with USDC address
        vm.prank(owner);
        reputationCredit = new ReputationCredit(address(testUSDC));
        
        // Add lender as authorized
        vm.prank(owner);
        reputationCredit.addAuthorizedLender(lender);
        
        // Fund contract with USDC
        vm.prank(owner);
        testUSDC.mint(owner, 1000000 * 10**6); // 1M USDC
        vm.prank(owner);
        testUSDC.approve(address(reputationCredit), 1000000 * 10**6);
        vm.prank(owner);
        reputationCredit.fundContract(1000000 * 10**6);
    }
    
    function testCreateCreditProfile() public {
        vm.prank(owner);
        reputationCredit.createCreditProfileFor(borrower, 500);
        
        assertTrue(reputationCredit.checkActiveProfile(borrower));
        assertEq(reputationCredit.getCreditScore(borrower), 500);
    }
    
    function testGetLoanLimit() public {
        vm.prank(owner);
        reputationCredit.createCreditProfileFor(borrower, 800); // Excellent score
        
        uint256 limit = reputationCredit.getLoanLimit(borrower);
        assertEq(limit, 10000 * 10**6); // Max loan amount
    }
    
    function testCalculateInterestRate() public {
        vm.prank(owner);
        reputationCredit.createCreditProfileFor(borrower, 600); // Good score
        
        uint256 rate = reputationCredit.calculateInterestRate(borrower);
        assertEq(rate, 700); // Base rate + 200 for good score
    }
    
    function testRequestLoan() public {
        vm.prank(owner);
        reputationCredit.createCreditProfileFor(borrower, 500);
        
        vm.prank(borrower);
        reputationCredit.requestLoan(1000 * 10**6, 30); // 1000 USDC for 30 days
        
        // Check that loan was created
        ReputationCredit.Loan[] memory loans = reputationCredit.getUserLoans(borrower);
        assertEq(loans.length, 1);
        assertEq(loans[0].amount, 1000 * 10**6);
        assertEq(loans[0].termDays, 30);
        assertFalse(loans[0].isActive);
    }
    
    function testApproveLoan() public {
        vm.prank(owner);
        reputationCredit.createCreditProfileFor(borrower, 500);
        
        vm.prank(borrower);
        reputationCredit.requestLoan(1000 * 10**6, 30);
        
        vm.prank(lender);
        reputationCredit.approveLoan(borrower, 0);
        
        ReputationCredit.Loan[] memory loans = reputationCredit.getUserLoans(borrower);
        assertTrue(loans[0].isActive);
        assertEq(loans[0].startTime, block.timestamp);
    }
    
    function testRepayLoan() public {
        vm.prank(owner);
        reputationCredit.createCreditProfileFor(borrower, 500);
        
        vm.prank(borrower);
        reputationCredit.requestLoan(1000 * 10**6, 30);
        
        vm.prank(lender);
        reputationCredit.approveLoan(borrower, 0);
        
        // Calculate repayment amount (principal + interest)
        uint256 interestRate = reputationCredit.calculateInterestRate(borrower);
        uint256 interestAmount = (1000 * 10**6 * interestRate * 30 days) / (365 days * 10000);
        uint256 totalRepayment = 1000 * 10**6 + interestAmount;
        
        // Give borrower USDC for repayment
        vm.prank(owner);
        testUSDC.mint(borrower, totalRepayment);
        
        // Approve contract to spend USDC
        vm.prank(borrower);
        testUSDC.approve(address(reputationCredit), totalRepayment);
        
        vm.prank(borrower);
        reputationCredit.repayLoan(0);
        
        ReputationCredit.Loan[] memory loans = reputationCredit.getUserLoans(borrower);
        assertTrue(loans[0].isRepaid);
        assertFalse(loans[0].isActive);
    }
    
    function testAddReputationPoints() public {
        vm.prank(owner);
        reputationCredit.createCreditProfileFor(borrower, 500);
        
        uint256 initialScore = reputationCredit.getCreditScore(borrower);
        
        vm.prank(owner);
        reputationCredit.addReputationPoints(borrower, 50, "Good behavior");
        
        uint256 newScore = reputationCredit.getCreditScore(borrower);
        assertGt(newScore, initialScore);
    }
    
    function testCreditScoreUpdateAfterRepayment() public {
        vm.prank(owner);
        reputationCredit.createCreditProfileFor(borrower, 500);
        
        uint256 initialScore = reputationCredit.getCreditScore(borrower);
        
        // Complete loan cycle
        vm.prank(borrower);
        reputationCredit.requestLoan(1000 * 10**6, 30);
        
        vm.prank(lender);
        reputationCredit.approveLoan(borrower, 0);
        
        uint256 interestRate = reputationCredit.calculateInterestRate(borrower);
        uint256 interestAmount = (1000 * 10**6 * interestRate * 30 days) / (365 days * 10000);
        uint256 totalRepayment = 1000 * 10**6 + interestAmount;
        
        // Give borrower USDC for repayment
        vm.prank(owner);
        testUSDC.mint(borrower, totalRepayment);
        
        // Approve contract to spend USDC
        vm.prank(borrower);
        testUSDC.approve(address(reputationCredit), totalRepayment);
        
        vm.prank(borrower);
        reputationCredit.repayLoan(0);
        
        uint256 finalScore = reputationCredit.getCreditScore(borrower);
        assertGt(finalScore, initialScore);
    }
    
    function testProtocolStats() public {
        vm.prank(owner);
        reputationCredit.createCreditProfileFor(borrower, 500);
        
        // Complete loan cycle
        vm.prank(borrower);
        reputationCredit.requestLoan(1000 * 10**6, 30);
        
        vm.prank(lender);
        reputationCredit.approveLoan(borrower, 0);
        
        uint256 interestRate = reputationCredit.calculateInterestRate(borrower);
        uint256 interestAmount = (1000 * 10**6 * interestRate * 30 days) / (365 days * 10000);
        uint256 totalRepayment = 1000 * 10**6 + interestAmount;
        
        // Give borrower USDC for repayment
        vm.prank(owner);
        testUSDC.mint(borrower, totalRepayment);
        
        // Approve contract to spend USDC
        vm.prank(borrower);
        testUSDC.approve(address(reputationCredit), totalRepayment);
        
        vm.prank(borrower);
        reputationCredit.repayLoan(0);
        
        (uint256 totalLoans, uint256 totalBorrowed, uint256 totalRepaid) = reputationCredit.getProtocolStats();
        
        assertEq(totalLoans, 1);
        assertEq(totalBorrowed, 1000 * 10**6);
        assertEq(totalRepaid, totalRepayment);
    }
    
    function testFailCreateProfileTwice() public {
        vm.prank(owner);
        reputationCredit.createCreditProfileFor(borrower, 500);
        
        vm.prank(owner);
        vm.expectRevert("Profile already exists");
        reputationCredit.createCreditProfileFor(borrower, 600);
    }
    
    function testFailRequestLoanWithoutProfile() public {
        vm.prank(borrower);
        vm.expectRevert("No active credit profile");
        reputationCredit.requestLoan(1000 * 10**6, 30);
    }
    
    function testFailRequestLoanExceedsLimit() public {
        vm.prank(owner);
        reputationCredit.createCreditProfileFor(borrower, 200); // Poor score
        
        vm.prank(borrower);
        vm.expectRevert("Amount exceeds loan limit");
        reputationCredit.requestLoan(5000 * 10**6, 30); // Too much for poor score
    }
    
    function testFailApproveLoanUnauthorized() public {
        address unauthorized = address(0x4);
        
        vm.prank(owner);
        reputationCredit.createCreditProfileFor(borrower, 500);
        
        vm.prank(borrower);
        reputationCredit.requestLoan(1000 * 10**6, 30);
        
        vm.prank(unauthorized);
        vm.expectRevert("Not authorized lender");
        reputationCredit.approveLoan(borrower, 0);
    }
}

