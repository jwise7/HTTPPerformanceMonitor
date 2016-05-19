var phantom = require('phantom');

function benchmark(url,cb){
    var _ph, _page, _resources={};

    phantom.create().then(ph => {
      _ph = ph;
      return _ph.createPage();
    }).then(page => {
      _page = page;
      
      page.on('onResourceRequested', function(requestData, networkRequest) {
        var urlKey = requestData.url.split('?')[0];
        if(typeof _resources[urlKey] === 'undefined') _resources[urlKey] = {};
        _resources[urlKey].start=new Date();
      });
      page.on('onResourceReceived', function(responseData, networkResponse) {
        var urlKey = responseData.url.split('?')[0];
        if(typeof _resources[urlKey] === 'undefined') _resources[urlKey] = {};
        if(responseData.stage=='start'){
            _resources[urlKey].startReply=new Date();
        }else if(responseData.stage=='end'){
            _resources[urlKey].endReply=new Date();
        }
      });
      return _page.open(url);
    }).then(status => {
        return _resources;
    }).then(resources => {
        for(var i in resources){
            resources[i].waiting=resources[i].startReply-resources[i].start;
            resources[i].receiving=resources[i].endReply-resources[i].startReply;
        }
      cb(resources);
      _page.close();
      _ph.exit();
    });
}
exports.pageBenchmark = function(url,count,msPause){
    _statsBenchmarks(url,count,msPause,[]);
}
function _statsBenchmarks(url,count,msPause,stats){
    if(count==0){
        _outputStats(stats);
    }
    benchmark(url,function(resources){
        stats.push(resources);
        setTimeout(function(url,count,msPause,stats){ return function(){ return _statsBenchmarks(url,count,msPause,stats)}}(url,count-1,msPause,stats),msPause);
    })
}
function _outputStats(stats){
    var finalStats = {};
    for(var i=0;i<stats.length;i++){
        for(var j in stats[i]){
            if(typeof finalStats[j] == "undefined"){
                finalStats[j] = {waitings:[],receivings:[]};
            }
            finalStats[j].waitings.push(stats[i][j].waiting);
            finalStats[j].receivings.push(stats[i][j].receiving);
        }
    }
    for(var k in finalStats){
        finalStats[k].averageWaiting = _averageArray(finalStats[k].waitings);
        finalStats[k].averageReceiving = _averageArray(finalStats[k].receivings);
        finalStats[k].averageTotal = finalStats[k].averageWaiting+finalStats[k].averageReceiving;
    }
    console.log(finalStats);
    setTimeout(process.exit,1000);
}
function _averageArray(arr){
    return arr.reduce(function(p,c){ return p + c; }) / arr.length;
}
