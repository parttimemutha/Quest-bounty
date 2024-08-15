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


```

### Setting Up Environment Variables
A `.env` file is used to store sensitive information like the RPC URL and private key. These are loaded into the script to create a provider and wallet instance.

```javascript
require("dotenv").config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
```

## 2. Token Swap on Uniswap

### a. Approve Token for Swap
The `approveToken` function is responsible for approving the Uniswap Swap Router to spend a specified amount of USDC on behalf of the user. This step is crucial to ensure that the Swap Router has the necessary permissions to execute the swap.

```javascript
async function approveToken(tokenAddress, tokenABI, amount, wallet) {
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);
    const approveAmount = ethers.utils.parseUnits(amount.toString(), 6); // Assuming USDC has 6 decimals
    const approveTransaction = await tokenContract.approve(UNISWAP_ROUTER_ADDRESS, approveAmount);
    await approveTransaction.wait();
}
```

### b. Retrieve Pool Information
The `getPoolInfo` function fetches the necessary details about the liquidity pool for the USDC-LINK pair on Uniswap. This includes the pool address, token addresses, and the fee tier.

```javascript
async function getPoolInfo(factoryContract, tokenIn, tokenOut) {
    const poolAddress = await factoryContract.getPool(tokenIn.address, tokenOut.address, 3000);
    const poolContract = new ethers.Contract(poolAddress, UNISWAP_POOL_ABI, provider);
    const [token0, token1, fee] = await Promise.all([poolContract.token0(), poolContract.token1(), poolContract.fee()]);
    return { poolContract, token0, token1, fee };
}
```

### c. Prepare Swap Parameters
The `prepareSwapParams` function constructs the parameters needed to execute the token swap on Uniswap. This includes the addresses of the input and output tokens, the fee, and the amount to be swapped.

```javascript
async function prepareSwapParams(poolContract, signer, amountIn) {
    return {
        tokenIn: USDC.address,
        tokenOut: LINK.address,
        fee: await poolContract.fee(),
        recipient: signer.address,
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    };
}
```

### d. Execute the Swap
The `executeSwap` function carries out the actual token swap on Uniswap. It sends the transaction to the blockchain and waits for confirmation.

```javascript
async function executeSwap(swapRouter, params, signer) {
    const transaction = await swapRouter.exactInputSingle(params);
    const receipt = await signer.sendTransaction(transaction);
    console.log(`Swap executed: ${receipt.transactionHash}`);
}
```

## 3. Supplying LINK to Aave

### a. Approve LINK for Aave
Similar to the Uniswap approval, the `approveToken` function is reused to grant Aave permission to spend the LINK tokens that were acquired through the swap.

### b. Deposit LINK into Aave
The `supplyToAave` function deposits the LINK tokens into Aave’s lending pool. Once deposited, these tokens start earning interest according to Aave’s rates.

```javascript
async function supplyToAave(aaveContract, amount, wallet) {
    const depositTransaction = await aaveContract.deposit(LINK.address, amount, wallet.address, 0);
    await depositTransaction.wait();
    console.log(`LINK supplied to Aave: ${depositTransaction.transactionHash}`);
}
```

## 4. Main Function Execution

The `main` function orchestrates the entire workflow. It begins by approving the necessary tokens, then executes the swap on Uniswap, and finally supplies the swapped LINK tokens to Aave.

```javascript
async function main() {
    const swapAmount = 1; // Amount of USDC to swap
    await approveToken(USDC.address, USDC_ABI, swapAmount, wallet);
    const poolInfo = await getPoolInfo(factoryContract, USDC, LINK);
    const swapParams = await prepareSwapParams(poolInfo.poolContract, wallet, swapAmount);
    await executeSwap(swapRouter, swapParams, wallet);
    const linkBalance = await getLinkBalance(wallet.address);
    await supplyToAave(aaveContract, linkBalance, wallet);
}
```

## Conclusion

This script demonstrates how to interact with multiple DeFi protocols in a seamless manner. By combining Uniswap for token swaps and Aave for interest generation, it showcases the power of composability in DeFi. Each function in the script is designed to handle specific tasks, ensuring a smooth flow from token swap to asset lending.

```

