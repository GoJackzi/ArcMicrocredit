// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ReputationCredit.sol";
import "../src/ProtocolUSDC.sol";

contract DeployReputationCredit is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts...");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy ReputationCredit first (needed for ProtocolUSDC constructor)
        console.log("\nDeploying ReputationCredit (temporary)...");
        // We need to deploy ProtocolUSDC first, but it needs ReputationCredit address
        // So we deploy a temporary ReputationCredit, then ProtocolUSDC, then update ReputationCredit
        
        // For now, deploy ProtocolUSDC with a placeholder, then deploy ReputationCredit
        // Actually, better approach: deploy ReputationCredit first with a dummy address,
        // then deploy ProtocolUSDC, then update ReputationCredit to use ProtocolUSDC
        
        // Even better: Deploy ReputationCredit with a temporary address, deploy ProtocolUSDC,
        // then use setUSDCToken to update it
        
        // Deploy ProtocolUSDC with deployer as temporary protocol
        address tempProtocol = deployer; // Temporary
        ProtocolUSDC protocolUSDC = new ProtocolUSDC(tempProtocol);
        console.log("ProtocolUSDC deployed at:", address(protocolUSDC));
        
        // Deploy ReputationCredit with ProtocolUSDC address
        console.log("\nDeploying ReputationCredit...");
        ReputationCredit reputationCredit = new ReputationCredit(address(protocolUSDC));
        console.log("ReputationCredit deployed at:", address(reputationCredit));
        
        // Update ProtocolUSDC to use ReputationCredit as protocol contract
        protocolUSDC.setProtocolContract(address(reputationCredit));
        console.log("ProtocolUSDC protocolContract updated to ReputationCredit address");
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Summary ===");
        console.log("ProtocolUSDC:", address(protocolUSDC));
        console.log("ReputationCredit:", address(reputationCredit));
        console.log("Contract owner:", reputationCredit.owner());
        console.log("USDC Token:", address(reputationCredit.usdcToken()));
        console.log("\nNOTE: ProtocolUSDC protocolContract will be updated to ReputationCredit address");
        console.log("Deployment successful!");
        
        // Verify deployment
        require(reputationCredit.owner() == deployer, "Owner not set correctly");
        require(address(reputationCredit.usdcToken()) == address(protocolUSDC), "USDC token not set correctly");
    }
}

