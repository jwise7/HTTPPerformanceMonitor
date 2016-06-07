//var perfMon = require('./performanceMonitor'),
var	http = require('http'),
	express = require('express'),
	bodyParser = require('body-parser'),
	app = express();

app.set('port', process.env.PORT || 4005);

app.use(bodyParser.json({strict:false}))
app.use(function(req,res,next){ //NOTE: allowing cors.
	var origin = req.headers['origin'];
	var originWhitelist = ['http://aclj.org', 'https://aclj.org', 'http://dev.aclj.org', 'https://dev.aclj.org', 'http://localhost:4000'];
	if(originWhitelist.indexOf(origin)!=-1){
		res.setHeader('Access-Control-Allow-Origin', origin);
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	}
	
	next();
})
app.post('/timings',function(req,res){
	var timings=[];
	if(typeof req.body !== "undefined"){
		timings = cleansePerformanceData(req.body);
	}
	else{
		return res.status(400).end();
	}
	if(timings.length>0){
		var perfData={
			userAgent:req.headers['user-agent'],
			timings:timings
		};
		return dbClient.collection('performanceTimings').save(perfData,function(err,record){
			debugger;
			if(err==null){
				return res.status(200).end();
			}
			return res.status(400).end();
		});
	}
	else{
		return res.status(400).end();
	}
});
app.get('/benchmark',function(req,res){
	//TODO: implement this.
	//perfMon.pageBenchmark(url,count,pause);
	res.status(404).end();
});

function cleansePerformanceData(data){
	debugger;
	//var whitelist=['connectEnd','connectStart','domainLookupEnd','domainLookupStart','duration','fetchStart','name','redirectEnd','redirectStart','requestStart','requestEnd','responseEnd','responseStart','secureConnectionStart','startTime'];
	var whitelist=['duration','name']; //NOTE: trying to save db space.
	if(!Array.isArray(data)) return []; //NOTE: checking for array before continuing.
	var cleanedTimings=[];
	for(var i=0;i<data.length;i++){
		var timing=data[i];
		var cleanedTiming={};
		for(var j=0;j<whitelist.length;j++){
			if(typeof timing[whitelist[j]] === 'string' || (!isNaN(timing[whitelist[j]]) && timing[whitelist[j]] != 0)){ //NOTE: checking for numeric before adding.
				cleanedTiming[whitelist[j]]=timing[whitelist[j]];
			}
		}
		if(Object.keys(cleanedTiming).length>0){ //NOTE: checking for the existence of fields before adding.
			cleanedTimings.push(cleanedTiming);
		}
	}
	return cleanedTimings;
}

//Note: Setup db connection
var mongoClient = require('mongodb').MongoClient;

//WARNING: global variable!!!!
//NOTE: it looks like people either remove async or use a global variable... I (Jesse) prefer keeping the async and I (David) concur
dbClient=null;
var password=process.env.password;
mongoClient.connect("mongodb://badf0rm:" + password + "@ds015713.mlab.com:15713/badf0rm",{
		db:{w:-1},
		server:{socketOptions:{keepAlive: 100}}
	},function(err, db){
		if(err) { 
			console.log(err); //handling errors elsewhere
			//return console.dir(err);
		}
		dbClient = db;
		http.createServer(app).listen(app.get('port'),function(){
			console.log('Server running on port ' + app.get('port'));
		});
});