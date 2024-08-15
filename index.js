require('dotenv').config();
const { ethers } = require('ethers');

// Load environment variables
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Initialize provider and signer
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY);
const signer = wallet.connect(provider);

// Addresses
const UNISWAP_V3_SWAP_ROUTER_ADDRESS = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45';
const AAVE_POOL_ADDRESS = '0x4ffb273DF4cdFfFc7C7b89C09C2C70A4244332A9';

// Token Addresses
const WETH_ADDRESS = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
const DAI_ADDRESS = '0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844';

// ABIs
// Uniswap V3 Swap Router ABI (Partial, exactInputSingle)
const UNISWAP_V3_SWAP_ROUTER_ABI = [
    'function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)'
];

// ERC20 ABI (Partial)
const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function balanceOf(address account) external view returns (uint256)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function decimals() external view returns (uint8)'
];

// Aave Pool ABI (Partial)
const AAVE_POOL_ABI = [
    'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external'
];

async function swapETHForDAI(amountInETH) {
    const swapRouterContract = new ethers.Contract(
        UNISWAP_V3_SWAP_ROUTER_ADDRESS,
        UNISWAP_V3_SWAP_ROUTER_ABI,
        signer
    );

    // Set the necessary parameters
    const params = {
        tokenIn: WETH_ADDRESS,
        tokenOut: DAI_ADDRESS,
        fee: 3000, // 0.3%
        recipient: await signer.getAddress(),
        amountIn: ethers.utils.parseEther(amountInETH.toString()),
        amountOutMinimum: 0, // For simplicity, set to 0. In production, set to avoid slippage.
        sqrtPriceLimitX96: 0 // No price limit
    };

    // The amount of ETH to send is amountIn
    const value = params.amountIn;

    // Call the exactInputSingle function
    console.log('Swapping ETH for DAI...');

    const tx = await swapRouterContract.exactInputSingle(
        params,
        { value: value } // send ETH with transaction
    );

    console.log(`Swap transaction submitted. Hash: ${tx.hash}`);
    console.log('Waiting for confirmation...');

    const receipt = await tx.wait();

    console.log(`Swap transaction confirmed. Hash: ${receipt.transactionHash}`);

    // Retrieve the amount of DAI received.
    const daiContract = new ethers.Contract(DAI_ADDRESS, ERC20_ABI, provider);

    const daiBalance = await daiContract.balanceOf(await signer.getAddress());

    const daiDecimals = await daiContract.decimals();

    console.log(`DAI balance after swap: ${ethers.utils.formatUnits(daiBalance, daiDecimals)} DAI`);
}

async function approveToken(tokenAddress, spenderAddress, amount) {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

    // Check current allowance
    const allowance = await tokenContract.allowance(await signer.getAddress(), spenderAddress);

    if (allowance.gte(amount)) {
        console.log(`Allowance already sufficient: ${ethers.utils.formatUnits(allowance)} >= ${ethers.utils.formatUnits(amount)}`);
        return;
    }

    console.log(`Approving ${ethers.utils.formatUnits(amount)} tokens for ${spenderAddress}...`);

    const tx = await tokenContract.approve(spenderAddress, amount);

    console.log(`Approve transaction submitted. Hash: ${tx.hash}`);
    console.log('Waiting for confirmation...');

    const receipt = await tx.wait();

    console.log(`Approve transaction confirmed. Hash: ${receipt.transactionHash}`);
}

async function supplyDAIToAave(amountDAI) {
    const aavePoolContract = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, signer);

    console.log(`Supplying ${ethers.utils.formatUnits(amountDAI)} DAI to Aave...`);

    const tx = await aavePoolContract.supply(
        DAI_ADDRESS,
        amountDAI,
        await signer.getAddress(),
        0 // Referral code
    );

    console.log(`Supply transaction submitted. Hash: ${tx.hash}`);
    console.log('Waiting for confirmation...');

    const receipt = await tx.wait();

    console.log(`Supply transaction confirmed. Hash: ${receipt.transactionHash}`);
}

async function main() {
    try {
        // Define amount of ETH to swap
        const amountInETH = 0.1; // Example: 0.1 ETH

        // Swap ETH for DAI
        await swapETHForDAI(amountInETH);

        // After swap, get DAI balance
        const daiContract = new ethers.Contract(DAI_ADDRESS, ERC20_ABI, signer);

        const daiBalance = await daiContract.balanceOf(await signer.getAddress());

        const daiDecimals = await daiContract.decimals();

        console.log(`DAI balance: ${ethers.utils.formatUnits(daiBalance, daiDecimals)} DAI`);

        if (daiBalance.eq(0)) {
            console.log('No DAI received from swap. Exiting.');
            return;
        }

        // Approve Aave Pool to spend DAI
        await approveToken(DAI_ADDRESS, AAVE_POOL_ADDRESS, daiBalance);

        // Supply DAI to Aave
        await supplyDAIToAave(daiBalance);

        // Done
        console.log('Process completed successfully.');

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
