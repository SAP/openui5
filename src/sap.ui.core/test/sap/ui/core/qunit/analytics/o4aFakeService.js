/**
 * Keeps track of all possible responses for the Sinon Fake Service
 */
var o4aFakeService =  {
	// default base URL
	baseURI: "http://o4aFakeService:8080/",
	
	// default headers
	headers: {
		METADATA: {
			"Content-Type": "application/xml;charset=utf-8",
			"DataServiceVersion": "1.0;"
		},
		XML: {
			"Content-Type": "application/atom+xml;charset=utf-8",
			"DataServiceVersion": "2.0;"
		},
		JSON: {
			"Content-Type": "application/json;charset=utf-8",
			"DataServiceVersion": "2.0;"
		},
		COUNT: {
			"Content-Type": "text/plain;charset=utf-8",
			"DataServiceVersion": "2.0;"
		}
	},
	
	// simple response handling via URI string matching
	_aResponses: [],
	addResponse: function (oResponse) {
		//remove prepending slash if necessary
		if (oResponse.uri[0] === "/") {
			oResponse.uri = oResponse.uri.substring(1, oResponse.uri.length);
		}
		this._aResponses.push(oResponse);
	},
	findResponse: function (sURI) {
		for (var i = 0; i < this._aResponses.length; i++) {
			var oResponse = this._aResponses[i],
				sFinalURI = this.baseURI + oResponse.uri; 
			// check if request URI matches the responses URI
			if (oResponse) {
				if (!oResponse.batch && sURI === sFinalURI) {
					//NO batch
					return oResponse;
				} else if (oResponse.batch) {
					//Batch-Support is missing
					//TODO: WHAT IS IN THE BATCH?
				}
			}
		}
	},
	
	//setting the base uri
	setBaseURI: function (sBaseURI) {
		this.baseURI = sBaseURI || this.baseURI;
		//append "/" to the base URI if needed
		if (this.baseURI[this.baseURI.length-1] !== "/") {
			this.baseURI += "/";
		}
	},
	
	// setup the sinon fake HTTP Requests
	fake: function (mParams) {
		mParams = mParams || {};
		this.setBaseURI(mParams.baseURI);
		
		// sinon captures all XHRs
		var xhr = sinon.useFakeXMLHttpRequest(), 
			responseDelay = 200, 
			_setTimeout = window.setTimeout,
			that = this;

		//let through all requests which are not against the base URL
		xhr.useFilters = true;
		xhr.addFilter(function(method, url) {
			return url.indexOf(that.baseURI) != 0;
		});
		
		//faking the response starts here:
		xhr.onCreate = function(request) {
			request.onSend = function() {
				//find a matching response
				var oResponse = that.findResponse(request.url);
				//if there was one, return it
				if (oResponse) {
					if (request.async === true) {
						_setTimeout(function() {
							request.respond(200, oResponse.header, oResponse.content);
						}, responseDelay);
					} else {
						request.respond(200, oResponse.header, oResponse.content);
					}
				}
			}
		};
	}
};