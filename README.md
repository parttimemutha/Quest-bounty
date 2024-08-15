# DeFi Script: Uniswap and Aave Integration

## Overview of Script

This script is designed to demonstrate the integration of two major DeFi protocols: **Uniswap** and **Aave**. The script facilitates a token swap from USDC to LINK using Uniswap and then supplies the swapped LINK tokens to Aave's lending pool to start earning interest. The entire process is executed on the Ethereum Sepolia testnet.

### Key Features:

1. **Token Swap (Uniswap)**: 
   - The script initiates a token swap from USDC to LINK.
   - It handles token approval, retrieves pool information, prepares swap parameters, and executes the swap.

2. **Supply LINK to Aave**:
   - After the token swap, the script approves and supplies the LINK tokens to Aave's lending pool.
   - The supplied LINK tokens start accruing interest based on Aave's lending rates.

3. **Blockchain Confirmation**:
   - The script includes steps for transaction confirmation on Etherscan, ensuring that each step is successfully recorded on the blockchain.

## Workflow

1. **User Initiates Token Swap**:
   - The user starts by initiating a swap of USDC for LINK.
   - The script approves the Uniswap Swap Router to spend USDC on behalf of the user.

2. **Retrieve Pool Information**:
   - The script queries Uniswap to retrieve the necessary pool data for the USDC-LINK pair.

3. **Execute the Swap**:
   - With the pool information and swap parameters prepared, the script executes the swap, converting USDC to LINK.

4. **Supply LINK to Aave**:
   - After the swap, the script approves Aave to spend the LINK tokens.
   - The LINK tokens are then deposited into Aave's lending pool, where they begin earning interest.

5. **Confirmation on Etherscan**:
   - Throughout the process, the script ensures that each transaction is confirmed on the blockchain via Etherscan, providing transparency and verification.

## Diagram Illustration

Below is a diagram that illustrates the sequence of steps and interactions between Uniswap and Aave in this DeFi script:

![Sample diagram](Sample_diagram/Sample%20diagram.png)

# Code Explanation

This document provides a detailed explanation of the DeFi script, highlighting key functions, logic, and the interactions with the Uniswap and Aave protocols. The script is designed to facilitate a token swap from USDC to LINK on Uniswap and subsequently supply the LINK tokens to Aave's lending pool to start earning interest.

## 1. Initial Setup

### Importing Required Libraries
The script begins by importing essential libraries such as `ethers.js`, which is used for interacting with the Ethereum blockchain. Additionally, ABI files for the Uniswap and Aave smart contracts are imported to facilitate interaction with these protocols.

```javascript
const { ethers } = require("ethers");
const { UNISWAP_ABI, AAVE_ABI } = require("./abis");
