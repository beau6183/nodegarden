/// <reference path="./typings/tsd.d.ts" />
"use strict";
var fs = require('fs'),
	fsx = require('fs-extra'),
	path = require('path'),
	ts = require('ntypescript'),
	source = path.resolve('./scripts'),
	dest = path.resolve('./public/lib'),
	cp = require('child_process'),
	tmp = "./tmp",
	cfile = path.resolve('./scripts/shared-components.ts');

function doit(p) {
	var stat = fs.lstatSync(p);
	if (stat.isDirectory()) {
		fs.readdirSync(p).forEach(function (x) {
			doit(p + path.sep + x);
		});
	}
	else {
		if (path.basename(p) === path.basename(cfile))
			return;
		var buffer = ["// " + cfile];
		buffer.push(fs.readFileSync(cfile).toString());
		buffer.push("// " + p);
		buffer.push(fs.readFileSync(p).toString());
		var rd = path.dirname(p).replace(source, "");
		if (!fs.existsSync(tmp + path.sep + rd))
			fs.mkdirSync(tmp + path.sep + rd);
		fs.writeFileSync(tmp + path.sep + rd + path.sep + path.basename(p), buffer.join("\n"));
		var destFile = dest + path.sep + rd;
		if (!fs.existsSync(destFile))
			fs.mkdirSync(destFile);
		destFile = path.resolve(destFile + path.sep + path.basename(p));
		var tfile = path.resolve(tmp + path.sep + rd + path.sep + path.basename(p));
		cp.execSync('ntsc --target ES5 --outFile "' + destFile.replace(/\.ts$/, '.js') + '" "' + tfile + '"');
		cp.execSync('uglifyjs -cmo "' + destFile.replace(/\.ts$/, '.min.js') + '" "' + destFile.replace(/\.ts$/, '.js') + '"');
	}
}

fsx.remove(path.resolve(tmp), function (err) {
	if (err) process.exit(1);
	tmp = path.resolve(tmp);
	fs.mkdirSync(tmp)
	doit(source, dest);
	fsx.remove(path.resolve(tmp), function (err2) {
		process.exit(0);
	});
});