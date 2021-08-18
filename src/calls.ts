import * as multicallAbi from './abi/multicall2.json';

import Contract from './contract';

export function getEthBalance(address: string, multicallAddress: string) {
	const multicall = new Contract(multicallAddress, multicallAbi);
	return multicall.getEthBalance(address);
}
