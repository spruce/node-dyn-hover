// rename file to config.js
module.exports = { 
	"hover":{
		"username": "username", // hover Username
		"password": "secret_password", // hover Password
	},
	"site":{
  	"users":[
      {
        "user":"siteUsername",
        "pw":"sitePassword",
        "domains": ["first.domain.com"]
      },
      {
        "user":"siteUsername2",
        "pw":"sitePassword2",
        "domains": ["second.domain.com", "third.domain.com"]
      }	
  	],
  	"port":1234
	}
}