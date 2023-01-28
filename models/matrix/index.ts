import { getMatrix } from './screen';

export const start = () => {
	console.log('ccm','starting script');
	const matrix = getMatrix();

	// @ts-expect-error 
	if(!matrix.afterSync) return;

	// @ts-expect-error 
	matrix?.afterSync((mat, dt, t) => {
	mat
		.fgColor({
			r: Math.round(Math.random() * 255),
			g: Math.round(Math.random() * 255),
			b: Math.round(Math.random() * 255),
		})
		.setPixel(
			Math.round(Math.random() * mat.width()),
			Math.round(Math.random() * mat.height())
		);
	
	setTimeout(() => mat.sync(), .1*1000);
})

matrix
// @ts-expect-error 
  .clear()
  .sync();
}