var querystring = require('querystring');
var http = require('http');
const { prototype } = require('events');

// function performRequest(host, port, endpoint, method, accesstoken, data, success) {
    //var dataString = JSON.stringify(data);
    var headers = {};
    
    if (method == 'GET') {
      //endpoint += '?' + querystring.stringify(data);
      headers = {
//        'Authorization' : 'bearer ' + accesstoken,
      };
    }
    // else {
    //   headers = {
    //     'Content-Type': 'application/json',
    //     'Content-Length': dataString.length,
    //     'Authorization' : 'bearer ' + accesstoken,
    //   };
    //}
    var options = {
      host: host,
      port: port,
      path: endpoint,
      method: method,
      headers: headers
    };
  
    var req = http.request(options, function(res) {
        
        console.log(`API Call statusCode: ${res.statusCode}`);

        res.setEncoding('utf-8');
  
        var responseString = '';
  
        res.on('data', function(data) {
            responseString += data;
        });
  
        res.on('end', function() {
            console.log("API Call responseString = " + responseString);
            //var responseObject = JSON.parse(responseString);
            //success(responseObject);
            success(responseString);
        });
    });
  
    //req.write(dataString);
    req.end();
}

///////////////////
// Exports
//////////////////
exports.performRequest = performRequest;
