var config = require('./config.js');
var request = require('request');
var express = require('express');


var app = express();
app.use(express.urlencoded());
app.use(express.json());

app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

app.get('/', function(req, res){
  if(req.query.user == config.site.user && req.query.pw == config.site.pw){
    update_dns(req.query.domain, req.query.ip, function(err,value){
      if(err){
        console.log("Error:", err);
        res.send(500);
      }
      else if(!value){
        console.log("Something went wrong.");
        res.send(503);
      }
      else{
        // everything worked just fine
        console.log("updated DNS-entry");
        res.send(200);
      }
    })
  }
  else{
    console.log("wrong username/pw");
    res.send(401);
  }
});

app.listen(config.site.port);



function update_dns(url, ip, cb){
  login(config.hover.username, config.hover.password,function(err,value){
    if(err){if(cb){return cb(err);}else{return;}}
    getDnsIdFromDomainName(url,function(err,value){
      if(err){if(cb){return cb(err);}else{return;}}
      updateDnsId(value, ip, cb);
    });
  });
}

function updateDnsId(dns_id, ip, callback){
  var opt = {url:'https://www.hover.com/api/dns/' + dns_id,
    jar: true, 
    form:{content:ip}};
    
  request.put(opt, function (error, response, body2) {
    if (!error && response.statusCode == 200) {
      if(body2.indexOf('"succeeded":true') > -1){
        return callback(null, true);
      }
      else{
        return callback(error, false);
      }
    }
  });
}// end updateDnsId

function getDnsIdFromDomainName(domainName, callback){
  // must be subdomain or @ from existing Domain (must not be within of *.domain.TLD)
  // request must be already logged in
  
  
  // parse the domainName into subdomain and Domain
  var domainNameParts = domainName.split('.');
  var subDomain = ""
  if(domainNameParts.length == 3){
    subDomain = domainNameParts.shift();
  }
  else if(domainNameParts.length == 2){
    subDomain = "@";
  }
  else{
    callback(new Error('Domain name should be Subdomain.Domain.TLD or Domain.TLD'));
  }
  var domain = domainNameParts.join('.');

  
  
  
  var options = {url: 'https://www.hover.com/api/dns/',
  	method: "get",
  	jar: true
  };
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      if(body.indexOf('"succeeded":true') > -1){
        var jsonDns = JSON.parse(body);
        for (var i = 0, l = jsonDns.domains.length; i < l; i++){
          if(domain == jsonDns.domains[i].domain_name){
            // we found our domain
            for (var j = 0, li = jsonDns.domains[i].entries.length; j < li; j++){
              if(jsonDns.domains[i].entries[j].name == subDomain){
                //we found the correct subdomain
                callback(null, jsonDns.domains[i].entries[j].id);
              }
            }   
          }
          
        }
        
      }
      else{
        callback(error, false);
      }
    }
  });// end request

  
  
}// end getDnsIdFromDomainName

function login(username, password, callback){
  var options = {url: 'https://www.hover.com/api/login',
  	method: "post",
  	jar: true,
  	form: {"username": username,
      "password": password}	
  	};
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      if(body.indexOf('"succeeded":true') > -1){
        callback(null, true);
      }
      else{
        callback(error, false);
      }
    }
  });
}// end login