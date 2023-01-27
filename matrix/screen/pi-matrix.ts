import { LedMatrix, GpioMapping, LedMatrixUtils, PixelMapperType } from 'rpi-led-matrix';

export const getMatrix = () => new LedMatrix({
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


