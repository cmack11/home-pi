import { LedMatrix, GpioMapping, LedMatrixUtils, PixelMapperType } from 'rpi-led-matrix';

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

const matrix = new LedMatrix({
	...LedMatrix.defaultMatrixOptions(),
	rows: 32,
	cols: 64,
	chainLength: 2,
	hardwareMapping: GpioMapping.AdafruitHat,
	pixelMapperConfig: LedMatrixUtils.encodeMappers({
		type: PixelMapperType.VZ,
	})

},{
	...LedMatrix.defaultRuntimeOptions(),
	gpioSlowdown: 1
})

matrix.afterSync((mat, dt, t) => {
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
  .clear()
  .sync();

(async () => {
	await wait(10*1000);
})();
