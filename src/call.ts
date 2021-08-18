import { Contract } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';

import * as multicall2Abi from './abi/multicall2.json';

import Abi from './abi';

export interface Call {
	contract: {
		address: string;
	};
	name: string
	inputs: any[]
	outputs: any[];
	params: any[];
}

export interface Result {
	success: boolean;
	returnData: any;
}

function _callRequests(calls: Call[]) {
	return calls.map(call => {
		const callData = Abi.encode(call.name, call.inputs, call.params);
		return {
			target: call.contract.address,
			callData,
		};
	});
}

export async function sendAll(provider: Provider, signer: Signer, multicallAddress: string, calls: Call[], overrides: any={}) {
	const multicall = new Contract(multicallAddress, multicall2Abi, signer.connect(provider));
	const callRequests = _callRequests(calls);
	// dry run
    try {
		await multicall.callStatic.aggregate(callRequests)
	} catch(err) {
		throw new Error(`Fail to sendAll Calls:${JSON.stringify(calls)} \n Error:${err}`)
	}
	const transactionObject = await multicall.aggregate(callRequests);
	return {
		hash: transactionObject.hash,
		getReceipt: async () => provider.waitForTransaction(transactionObject.hash)
	  }
}

export async function all(provider: Provider, multicallAddress: string, calls: Call[], block?: number) {
	const multicall = new Contract(multicallAddress, multicall2Abi, provider);
	const callRequests = _callRequests(calls);
	const overrides = {
		blockTag: block,
	};
	const response = await multicall.callStatic.aggregate(callRequests, overrides);
	const callCount = calls.length;
	const callResult = [];
	for (let i = 0; i < callCount; i++) {
		const outputs = calls[i].outputs;
		const returnData = response.returnData[i];
		const params = Abi.decode(outputs, returnData);
		const result = outputs.length === 1
			? params[0]
			: params;
		callResult.push(result);
	}
	return callResult;
}

export async function tryAll(provider: Provider, multicall2Address: string, calls: Call[], block?: number) {
	const multicall2 = new Contract(multicall2Address, multicall2Abi, provider);
	const callRequests = _callRequests(calls);
	const overrides = {
		blockTag: block,
	};
	const response: Result[] = await multicall2.callStatic.tryAggregate(false, callRequests, overrides);
	const callCount = calls.length;
	const callResult = [];
	for (let i = 0; i < callCount; i++) {
		const outputs = calls[i].outputs;
		const result = response[i];
		if (!result.success) {
			callResult.push(null);
		} else {
			const params = Abi.decode(outputs, result.returnData);
			const data = outputs.length === 1
				? params[0]
				: params;
			callResult.push(data);
		}
	}
	return callResult;
}

