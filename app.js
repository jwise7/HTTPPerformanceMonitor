var perfMon = require('./performanceMonitor');
var argv = require('yargs').argv;

if(typeof argv._ === "undefined" || typeof argv._[0] === "undefined" || argv._[0] == ""){
	console.error("please provide a url");
	process.exit();
}
if(typeof argv.count === "undefined"){
	argv.count = 10;
}
if(typeof argv.pause === "undefined"){
	argv.pause = 1000;
}
perfMon.pageBenchmark(argv._[0],argv.count,argv.pause);