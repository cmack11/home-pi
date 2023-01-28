import { getMatrix as getPiMatrix } from './pi-matrix'
import { getMatrix as getTestMatrix } from './test-matrix'

export const getMatrix = () => {
	if(process.env.STATUS !== 'stubbed') {
		console.log('ccm', 'using real matrix');
		return getPiMatrix();
	}
	else {
		console.log('ccm','using stubbed matrix');
		return getTestMatrix();
	}
}