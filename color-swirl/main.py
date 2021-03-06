import time
import sys

from colorgrid import ColorGrid
from swirlline import SwirlLine
from rgbmatrix import RGBMatrix, RGBMatrixOptions, graphics
class SwirlAnimationOptions:
	def __init__(self):
		self.options = RGBMatrixOptions()
		self.options.rows = 32
		self.options.cols = 64
		self.options.chain_length = 2
		self.options.parallel = 1
		self.options.hardware_mapping = 'adafruit-hat'  # If you have an Adafruit HAT: 'adafruit-hat'
		self.options.gpio_slowdown = 1
		self.options.pixel_mapper_config = 'V-mapper:Z'

		self.matrix = RGBMatrix(options = self.options)

		self.numSpots = 0
		self.maxSpots = (64*64) // 4

		self.colorGrid = ColorGrid(64,64,self.numSpots)
		self.swirlLine = SwirlLine(0,0, (255,255,255), 64,64)

	def onSwirlLineReset(self):
		self.matrix.Clear()
		self.numSpots += 1
		self.numSpots %= self.maxSpots
		self.colorGrid = ColorGrid(64,64,self.numSpots)
		for point in self.colorGrid.getPoints():
			self.matrix.SetPixel(point['x'],point['y'],point['color']['r'],point['color']['g'],point['color']['b'])

def main():
	swirlAnimationOptions = SwirlAnimationOptions()
	swirlAnimationOptions.swirlLine.onReset = swirlAnimationOptions.onSwirlLineReset
	for point in swirlAnimationOptions.colorGrid.getPoints():
		swirlAnimationOptions.matrix.SetPixel(point['x'],point['y'],point['color']['r'],point['color']['g'],point['color']['b'])

	try:
		print("Press CTRL-C to stop.")
		while True:
			point = swirlAnimationOptions.swirlLine.nextPoint()
			x = point[0]
			y = point[1]
			color = point[2]
			if swirlAnimationOptions.colorGrid.getPoint(x,y) != None:
				newColor = swirlAnimationOptions.colorGrid.getPoint(x,y)
				color = (newColor['r'], newColor['g'], newColor['b'])
				swirlAnimationOptions.swirlLine.color = color
			swirlAnimationOptions.matrix.SetPixel(x, y, color[0], color[1], color[2])

			time.sleep(.01)

	except KeyboardInterrupt:
		sys.exit(0)


if __name__ == '__main__':
	main()
