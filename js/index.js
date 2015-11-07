function main(){
	var container = document.getElementById('container'),
		sc = new SpaceController(container);
	sc.init();
	window.addEventListener('resize', sc.init.bind(sc));
}
window.addEventListener("DOMContentLoaded", main);