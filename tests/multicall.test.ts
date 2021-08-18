import { JsonRpcProvider } from '@ethersproject/providers';
// import { Wallet } from '@ethersproject/wallet';
const erc20Abi =  require('./ERC20.json')
import { testnetRpc, tRifAddress } from './constants'
import { Contract, Provider } from '../src/index'

describe('Multicall', () => {

  // it('sendAll', async() => {
  //   // Given
  //   const provider = new JsonRpcProvider(testnetRpc)
  //   const signer = new Wallet(privateKey);
  //   const account = '0x6bD1970A31a66F2b20D46f68c80BA1e69fB3847D';

  //   const ethcallProvider = new Provider();
  //   await ethcallProvider.init(provider);

  //   const rifContract = new Contract(tRifAddress, erc20Abi);
  //   //Calls
  //   // const rbtcBalanceCall = ethcallProvider.getEthBalance(account);
  //   const rifBalanceCall = rifContract.balanceOf(account);

  //   // When
  //   const transaction = await ethcallProvider.sendAll([rifBalanceCall ], signer);
  //   const receipt = await transaction.getReceipt() // wait for transaction to be mined
  //   console.log('transaction.hash', transaction.hash)

  //   expect(transaction.hash).not.toBeNull()
  //   expect(receipt.status).toBe(1)

  // }, 150000)

  it('all', async() => {
    // Given
    const provider = new JsonRpcProvider(testnetRpc)
    const account = '0x6bD1970A31a66F2b20D46f68c80BA1e69fB3847D';

    const ethcallProvider = new Provider();
    await ethcallProvider.init(provider);

    const rifContract = new Contract(tRifAddress, erc20Abi);
    //Calls
    const rbtcBalanceCall = ethcallProvider.getEthBalance(account);
    const rifBalanceCall = rifContract.balanceOf(account);

    // When
    const data = await ethcallProvider.all([ rbtcBalanceCall, rifBalanceCall ]);

    const rbtcBalance = data[0];
    const rifBalance = data[1];

    console.log('rbtc balance', rbtcBalance.toString());
    console.log('rif balance', rifBalance.toString());

    expect(rbtcBalance.toString()).not.toBe('0')
    expect(rifBalance.toString()).not.toBe('0')
  })

  it('tryAll', async() => {
    // Given
    const provider = new JsonRpcProvider(testnetRpc)
    const account = '0x6bD1970A31a66F2b20D46f68c80BA1e69fB3847D';

    const ethcallProvider = new Provider();
    await ethcallProvider.init(provider);

    const rifContract = new Contract(tRifAddress, erc20Abi);
    //Calls
    const rbtcBalanceCall = ethcallProvider.getEthBalance(account);
    const rifBalanceCall = rifContract.balanceOf(account);

    // When
    const data = await ethcallProvider.tryAll([ rbtcBalanceCall, rifBalanceCall ]);

    const rbtcBalance = data[0];
    const rifBalance = data[1];

    console.log('rbtc balance', rbtcBalance.toString());
    console.log('rif balance', rifBalance.toString());

    expect(rbtcBalance.toString()).not.toBe('0')
    expect(rifBalance.toString()).not.toBe('0')
  })
})