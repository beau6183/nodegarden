/// <reference path="typings/tsd.d.ts" />
var cp = require('child_process'),
    chokidar = require('chokidar'),
    connect = require('connect'),
    path = require('path'),
    serveStatic = require('serve-static');
    
connect().use(serveStatic(path.resolve(__dirname, 'public'))).listen(8080);
console.log("Webserver up at localhost:8080");

watch('css/**/*.styl', 'npm run build-css')
watch('scripts/*.ts', 'npm run build-ts')
watch('views/**/*.jade', 'npm run build-html')

function watch (path, cmd, cb) {
  chokidar.watch(path)
    .on('change', execCurry(cmd, cb))
}

function execCurry (cmd, cb) {
  return function () {
    exec(cmd, cb)
  }
}

function exec (cmd, cb) {
  cp.exec(cmd, function (err, stdout, stderr) {
    err && console.error(err)
    stdout && console.log(stdout)
    stderr && console.error(stderr)

    cb && cb(err, stdout, stderr)
  })
}
