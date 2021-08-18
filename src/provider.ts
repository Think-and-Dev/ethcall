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

	async init(provider: BaseProvider) {
		this.provider = provider;
		const network = await provider.getNetwork();
		this.multicallAddress = getMulticall2Address(network.chainId);
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
		56: '0x4c6bb7c24b6f3dfdfb548e54b7c5ea4cb52a0069',
		100: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
		137: '0xf43a7be1b284aa908cdfed8b3e286961956b4d2c',
	};
	return addressMap[chainId];
}
