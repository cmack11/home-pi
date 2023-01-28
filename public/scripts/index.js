


function startStars() {
	const requestBase = window.location.href;

	console.log('ccm','starting stars');
	fetch(`${requestBase}applications/stars`, {
		method: 'POST',
	})
}