// var phantom = require('phantom');
// var driver=require('node-phantom-simple');

// function benchmarkWithPhantom(url,cb){
//     var _ph, _page, _resources={};

//     phantom.create().then(ph => {
//       _ph = ph;
//       return _ph.createPage();
//     }).then(page => {
//       _page = page;
      
//       page.on('onResourceRequested', function(requestData, networkRequest) {
//         var urlKey = requestData.url.split('?')[0];
//         if(typeof _resources[urlKey] === 'undefined') _resources[urlKey] = {};
//         _resources[urlKey].start=new Date();
//       });
//       page.on('onResourceReceived', function(responseData) {
//         var urlKey = responseData.url.split('?')[0];
//         if(typeof _resources[urlKey] === 'undefined') _resources[urlKey] = {};
//         if(responseData.stage=='start'){
//             _resources[urlKey].startReply=new Date();
//         }else if(responseData.stage=='end'){
//             _resources[urlKey].endReply=new Date();
//         }
//       });
//       return _page.open(url);
//     }).then(status => {
//         return _resources;
//     }).then(resources => {
//         for(var i in resources){
//             resources[i].waiting=resources[i].startReply-resources[i].start;
//             resources[i].receiving=resources[i].endReply-resources[i].startReply;
//         }
//       cb(resources);
//       _page.close();
//       _ph.exit();
//     });
// }
// function benchmarkWithSlimer(url,cb){
//     driver.create({path:'./slimerjs-0.10.0/slimerjs'},function(err,sl) {
//         return sl.createPage(function(err,page) {
//             return page.open(url, function(err,status) {
//                 return page.evaluate(
//                     function() { var timings = performance.getEntries();timings.unshift(performance.timing);return timings; },
//                     function(err,result){
//                         debugger;
//                         sl.exit();
//                         return cb(result);
//                 });
//             });
//         });
//     });
// }
// exports.pageBenchmark = function(url,count,msPause){
//     _statsBenchmarks(url,count,msPause,[]);
// }
// function _statsBenchmarks(url,count,msPause,stats){
//     if(count==0){
//         return _outputStats(stats,'slimer');
//     }else{
//         return benchmarkWithSlimer(url,function(resources){
//             stats.push(resources);
//             setTimeout(function(url,count,msPause,stats){ return function(){ return _statsBenchmarks(url,count,msPause,stats)}}(url,count-1,msPause,stats),msPause);
//         })
//     }
// }
// function _outputStats(stats,type){
//     var finalStats = {};
//     if(type=='phantom'){
//         for(var i=0;i<stats.length;i++){
//             for(var j in stats[i]){
//                 if(typeof finalStats[j] == "undefined"){
//                     finalStats[j] = {waitings:[],receivings:[],timings:[]};
//                 }
//                 finalStats[j].waitings.push(stats[i][j].waiting);
//                 finalStats[j].receivings.push(stats[i][j].receiving);
//                 finalStats[j].timings.push(stats[i][j].timings);
//             }
//         }
//         for(var k in finalStats){
//             finalStats[k].averageWaiting = _averageArray(finalStats[k].waitings);
//             finalStats[k].averageReceiving = _averageArray(finalStats[k].receivings);
//             finalStats[k].averageTotal = finalStats[k].averageWaiting+finalStats[k].averageReceiving;
//         }
//     }else if(type=='slimer'){
//         finalStats=stats;
//     }
//     console.log(finalStats);
//     setTimeout(process.exit,1000);
// }
// function _averageArray(arr){
//     return arr.reduce(function(p,c){ return p + c; }) / arr.length;
// }
