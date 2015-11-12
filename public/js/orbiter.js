function main() {
	var SolarSystem = new Array();
	SolarSystem.push(
		new SpaceObject(
		"Sol",
		0,
		0,
		"yellow",
		1.989e+30,
		1410,
		20
		)
		// ,new SpaceObject(
		// 	"Mercury",
		// 	47.362,
		// 	(69816900 + 46001200) / 2, // Average of Aphelion and Perihelion
		// 	"purple",
		// 	3.3011e+23,
		// 	5427,
		// 	1000
		// )
		// ,new SpaceObject(
		// 	"Venus",
		// 	35.02,
		// 	(108939000 + 107477000) / 2,
		// 	"green",
		// 	4.8675e+24,
		// 	5243,
		// 	1000
		// )
		,new SpaceObject(
		"Earth",
		29.78,
		(151930000 + 147095000) / 2,
		"blue",
		5.97237e+24,
		5514,
		1000
		)
		// ,new SpaceObject(
		// 	"Mars",
		// 	24.077,
		// 	(249200000 + 206700000) / 2,
		// 	"red",
		// 	6.4171e+23,
		// 	3933.5,
		// 	1000
		// )
		// ,new SpaceObject(
		// 	"Jupiter",
		// 	13.07,
		// 	(816520800 + 740573600) / 2,
		// 	"brown",
		// 	1.8986e+27,
		// 	1326,
		// 	1000
		// )
		// ,new SpaceObject(
		// 	"Saturn",
		// 	9.69,
		// 	(1513325783 + 1353572956) / 2,
		// 	"orange",
		// 	5.6836e+26,
		// 	687,
		// 	1000
		// )
		// ,new SpaceObject(
		// 	"Uranus",
		// 	6.80,
		// 	(3006224700 + 2735118100) / 2,
		// 	"green",
		// 	8.6810e+25,
		// 	127,
		// 	1000
		// )
		// ,new SpaceObject(
		// 	"Neptune",
		// 	5.43,
		// 	(4537580900 + 4459504400) / 2,
		// 	"aquamarine",
		// 	1.0243e+26,
		// 	1638,
		// 	1000
		// )
		);
	
	var container = document.getElementById('container'),
		oc = new OrbitalController(container, SolarSystem);
	oc.init();
}
main();