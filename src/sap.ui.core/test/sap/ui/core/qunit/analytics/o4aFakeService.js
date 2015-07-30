/**
 * Keeps track of all possible responses for the Sinon Fake Service
 * 
 * Important notes:
 * 1. Sinon and QUnit are not completely compatible. Sinon replaces the default 
 *    window.setTimeout function and this might break QUnit, especially the "asyncTests".
 * 
 *    To fix this problem, it's adviced by the Sinon Community to use the following statement
 *    in your asyncTests:
 *    this.clock.restore();
 * 
 * 2. datajs expects CR+LF as line endings not just LF
 *    Make sure that you use "\r\n" in your batch responses, otherwise the datajs parser can not
 *    handle your mocked data strings.
 *    This might be a problem if you use an editor which autoescapes JS strings only with "\n".
 */
var o4aFakeService =  {
	// default base URL
	baseURI: "http://o4aFakeService:8080/",
	
	/**
	 * The predefined default headers used for OData Responses
	 * 
	 * Same as in test/sap/ui/core/qunit/ODataModelFakeService.js
	 * Additional BATCH header added:
	 *   - The boundary parameter is used by "datajs" to parse the response
	 *     use the predefined value below in the batch mock data
	 */
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
		BATCH: {
			"Content-Type": "multipart/mixed; boundary=AAD136757C5CF75E21C04F59B8682CEA0",
			"DataServiceVersion": "2.0"
		},
		COUNT: {
			"Content-Type": "text/plain;charset=utf-8",
			"DataServiceVersion": "2.0;"
		}
	},
	
	_aResponses: [],
	/**
	 * Adds a response to the response pool.
	 */
	addResponse: function (oResponse) {
		//remove prepending slash if necessary
		if (oResponse.uri[0] === "/") {
			oResponse.uri = oResponse.uri.substring(1, oResponse.uri.length);
		}
		this._aResponses.push(oResponse);
	},
	
	/**
	 * Retrieves a response for the given request.
	 * The correct response is matched against the URI of the original request
	 */
	findResponse: function (oRequest) {
		var sURI = oRequest.url;
		//check if the requested URI needs a batch response
		var bBatch = sURI.indexOf("$batch") >= 0;
		
		for (var i = 0; i < this._aResponses.length; i++) {
			var oResponse = this._aResponses[i];
			
			//handle batch responses
			if (bBatch && oResponse.batch) {
				//WHAT'S IN THE BATCH?
				//iterate the response URIs and check if they are requested inside the batch
				var iNumberOfContainedSubRequests = 0;
				
				for (var j = 0; j < oResponse.uri.length; j++) {
					var sSingleUriFromBatch = oResponse.uri[j];
					
					//count how many sub requests match with the batch request
					if (oRequest.requestBody.indexOf(sSingleUriFromBatch) >= 0) {
						iNumberOfContainedSubRequests++;
					}
				}
				//if all requested uris have been found in the batch response, return it
				if (iNumberOfContainedSubRequests === oResponse.uri.length) {
					return oResponse;
				}
				
			} else if (!bBatch && !oResponse.batch) {
				var sFinalURI = this.baseURI + oResponse.uri; 
				// check if request URI matches the responses URI
				if (sURI === sFinalURI) {
					return oResponse;
				}
			}
		}
		
		//if no response was found, the function does not return anything
	},
	
	/**
	 * Sets the base URI component of the fake service
	 * default is: http://o4aFakeService:8080/
	 */
	setBaseURI: function (sBaseURI) {
		this.baseURI = sBaseURI || this.baseURI;
		//append "/" to the base URI if needed
		if (this.baseURI[this.baseURI.length-1] !== "/") {
			this.baseURI += "/";
		}
	},
	
	//response delay in [ms]
	_iResponseDelay: 200,
	/**
	 * Set the standard response delay time in [ms]
	 */
	setResponseDelay: function (iDelayTime) {
		this._iResponseDelay = iDelayTime;
	},
	
	/**
	 * Setup the sinon fake HTTP Requests
	 * and additionally define some parameters, like response delay time
	 * 
	 * Same as in test/sap/ui/core/qunit/ODataModelFakeService.js
	 */
	fake: function (mParams) {

		
		mParams = mParams || {};
		this.setBaseURI(mParams.baseURI);
		this.setResponseDelay(mParams.responseDelay || 200);
		
		// sinon captures all XHRs
		var xhr = sinon.useFakeXMLHttpRequest(),
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
				var oResponse = that.findResponse(request);
				//if there was one, return it
				if (oResponse) {
					if (request.async === true) {
						_setTimeout(function() {
							request.respond(200, oResponse.header, oResponse.content);
						}, that._iResponseDelay);
					} else {
						request.respond(200, oResponse.header, oResponse.content);
					}
				}
			}
		};
	}
};