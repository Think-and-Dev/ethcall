import { BaseProvider } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import { Call, all as callAll, tryAll as callTryAll, sendAll as callSendAll } from './call';
import { getEthBalance } from './calls';

const DEFAULT_CHAIN_ID = 1;

export default class Provider {
	provider?: BaseProvider;
	multicallAddress: string;

	constructor() {
		this.multicallAddress = getMulticall2Address(DEFAULT_CHAIN_ID);
	}

	async init(provider: BaseProvider, chainId?: number) {
		this.provider = provider;
		chainId = chainId || (await provider.getNetwork()).chainId;
		this.multicallAddress = getMulticall2Address(chainId);
	}

	/**
	 * Makes one call to the multicall contract to retrieve eth balance of the given address.
	 * @param address  Address of the account you want to look up
	 * @param multicallAddress	Address of the Multicall instance to use
	 */
	getEthBalance(address: string, multicallAddress?: string) {
		if (!this.provider) {
			throw Error('Provider should be initialized before use.');
		}
		return getEthBalance(address, multicallAddress || this.multicallAddress);
	}

	/**
	 * Aggregates multiple calls into one call. Reverts when any of the calls fails. For
	 * ignoring the success of each call, use {@link tryAll} instead.
	 * @param calls  Array of Call objects containing information about each read call
	 * @param block  Block number for this call
	 */
	async all(calls: Call[], block?: number) {
		if (!this.provider) {
			throw Error('Provider should be initialized before use.');
		}
		const provider = this.provider as BaseProvider;
		return await callAll(provider, this.multicallAddress, calls, block);
	}

	/**
	 * Aggregates multiple calls into one and send the transaction to the blockchain.
	 * Reverts when any of the calls fails.
	 * @param calls  Array of Call objects containing information about each read call
	 * @param signer  Signer that will send the transaction
	 */
	 async sendAll(calls: Call[], signer: Signer, overrides: any={}) {
		if (!this.provider) {
			throw Error('Provider should be initialized before use.');
		}
		return await callSendAll(this.provider, signer, this.multicallAddress, calls, overrides);
	}

	/**
	 * Aggregates multiple calls into one call. If any of the calls fail, it returns a null value
	 * in place of the failed call's return data.
	 * @param calls  Array of Call objects containing information about each read call
	 * @param block  Block number for this call
	 */
	async tryAll(calls: Call[], block?: number) {
		if (!this.provider) {
			throw Error('Provider should be initialized before use.');
		}
		const provider = this.provider as BaseProvider;
		return await callTryAll(provider, this.multicallAddress, calls, block);
	}
}

function getMulticall2Address(chainId: number): string {
	const addressMap: Record<number, string> = {
		1: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
		4: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
		5: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
		30: '0x8f344c3b2a02a801c24635f594c5652c8a2eb02a',
		31: '0xaf7be1ef9537018feda5397d9e3bb9a1e4e27ac8',
		42: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
		56: '0x1Ee38d535d541c55C9dae27B12edf090C608E6Fb',
  		66: '0x94fEadE0D3D832E4A05d459eBeA9350c6cDd3bCa',
  		97: '0x3A09ad1B8535F25b48e6Fa0CFd07dB6B017b31B2',
  		100: '0xb5b692a88bdfc81ca69dcb1d924f59f0413a602a',
  		128: '0x2C55D51804CF5b436BA5AF37bD7b8E5DB70EBf29',
  		137: '0x11ce4B23bD875D7F5C6a31084f55fDe1e9A87507',
  		250: '0x0118EF741097D0d3cc88e46233Da1e407d9ac139',
  		1337: '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e',
 		42161: '0x813715eF627B01f4931d8C6F8D2459F26E19137E',
  		43114: '0x7f3aC7C283d7E6662D886F494f7bc6F1993cDacf',
  		80001: '0x08411ADd0b5AA8ee47563b146743C13b3556c9Cc',
	};
	return addressMap[chainId];
}
