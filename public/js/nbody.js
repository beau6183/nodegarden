function main() {
	var container = document.getElementById('container'),
		sc = new NBodyController(container);
	sc.init();
	window.addEventListener('resize', sc.init.bind(sc));
}
window.addEventListener("DOMContentLoaded", main);