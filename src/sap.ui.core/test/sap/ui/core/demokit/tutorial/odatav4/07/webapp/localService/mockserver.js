sap.ui.define([
	"sap/ui/model/json/JSONModel",
	'sap/ui/thirdparty/sinon',
	"sap/base/Log"
], function (JSONModel, sinon, Log) {
	"use strict";

	var oSandbox = sinon.sandbox.create(),
		aUsers, // The array that holds the cached user data
		sMetadata, // The string that holds the cached mock service metadata
		sNamespace = "sap/ui/core/tutorial/odatav4",
		sLogComponent = "sap.ui.core.tutorial.odatav4.mockserver", // Component for writing logs into the console
		rBaseUrl = /services.odata.org\/TripPinRESTierService/;

	return {

		/**
		 * Creates a Sinon fake service, intercepting all http requests to
		 * the URL defined in variable sBaseUrl above.
		 * @returns{Promise} a promise that is resolved when the mock server is started
		 */
		init : function () {
			// Read the mock data
			return readData().then(function () {
				// Initialize the sinon fake server
				oSandbox.useFakeServer();
				// Make sure that requests are responded to automatically. Otherwise we would need to do that manually.
				oSandbox.server.autoRespond = true;

				// Register the requests for which responses should be faked.
				oSandbox.server.respondWith(rBaseUrl, handleAllRequests);

				// Apply a filter to the fake XmlHttpRequest.
				// Otherwise, ALL requests (e.g. for the component, views etc.) would be intercepted.
				sinon.FakeXMLHttpRequest.useFilters = true;
				sinon.FakeXMLHttpRequest.addFilter(function (sMethod, sUrl) {
					// If the filter returns true, the request will NOT be faked.
					// We only want to fake requests that go to the intended service.
					return !rBaseUrl.test(sUrl);
				});

				// Set the logging level for console entries from the mock server
				Log.setLevel(3, sLogComponent);

				Log.info("Running the app with mock data", sLogComponent);
			});
		},

		/**
		 * Stops the request interception and deletes the Sinon fake server.
		 */
		stop : function () {
			sinon.FakeXMLHttpRequest.filters = [];
			sinon.FakeXMLHttpRequest.useFilters = false;
			oSandbox.restore();
			oSandbox = null;
		}
	};

	/**
	 * Returns the base URL from a given URL.
	 * @param {string} sUrl - the complete URL
	 * @returns {string} the base URL
	 */
	function getBaseUrl(sUrl) {
		var aMatches = sUrl.match(/http.+\(S\(.+\)\)\//);

		if (!Array.isArray(aMatches) || aMatches.length < 1) {
			throw new Error("Could not find a base URL in " + sUrl);
		}

		return aMatches[0];
	}

	/**
	 * Looks for a user with a given user name and returns its index in the user array.
	 * @param {string} sUserName - the user name to look for.
	 * @returns {int} index of that user in the array, or -1 if the user was not found.
	 */
	function findUserIndex(sUserName) {
		for (var i = 0; i < aUsers.length; i++) {
			if (aUsers[i].UserName === sUserName) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * Retrieves any user data from a given http request body.
	 * @param {string} sBody - the http request body.
	 * @returns {Object} the parsed user data.
	 */
	function getUserDataFromRequestBody(sBody) {
		var aMatches = sBody.match(/({.+})/);
		if (!Array.isArray(aMatches) || aMatches.length !== 2) {
			throw new Error("Could not find any user data in " + sBody);
		}
		return JSON.parse(aMatches[1]);
	}

	/**
	 * Retrieves a user name from a given request URL.
	 * @param {string} sUrl - the request URL.
	 * @returns {string} the user name.
	 */
	function getUserKeyFromUrl(sUrl) {
		var aMatches = sUrl.match(/People\('(.*)'\)/);
		if (!Array.isArray(aMatches) || aMatches.length !== 2) {
			throw new Error("Could not find a user key in " + sUrl);
		}
		return aMatches[1];
	}

	/**
	 * Checks if a given UserName is unique or already used
	 * @param {string} sUserName - the UserName to be checked
	 * @returns {boolean} True if the UserName is unique (not used), false otherwise
	 */
	function isUnique(sUserName) {
		return findUserIndex(sUserName) < 0;
	}

	/**
	 * Returns a proper HTTP response body for "duplicate key" errors
	 * @param {string} sKey - the duplicate key
	 * @returns {string} the proper response body
	 */
	function duplicateKeyError(sKey) {
		return JSON.stringify({
			error : {
				code : "409",
				message : "There is already a user with user name '" + sKey + "'.",
				target : "UserName"
			}
		});
	}

	function invalidKeyError(sKey) {
		return JSON.stringify({
			error : {
				code : "404",
				message : "There is no user with user name '" + sKey + "'.",
				target : "UserName"
			}
		});
	}

	function getSuccessResponse(sResponseBody) {
		return [
			200,
			{
				"Content-Type" : "application/json; odata.metadata=minimal",
				"OData-Version" : "4.0"
			},
			sResponseBody
		];
	}

	/**
	 * Reads and caches the fake service metadata and data from their
	 * respective files.
	 * @returns{Promise} a promise that is resolved when the data is loaded
	 */
	function readData() {
		var oMetadataPromise = new Promise(function (fnResolve, fnReject) {
			var sResourcePath = sap.ui.require.toUrl(sNamespace + "/localService/metadata.xml");
			var oRequest = new XMLHttpRequest();

			oRequest.onload = function () {
				// 404 is not an error for XMLHttpRequest so we need to handle it here
				if (oRequest.status === 404) {
					var sError = "resource " + sResourcePath + " not found";
					Log.error(sError, sLogComponent);
					fnReject(new Error(sError, sLogComponent));
				}
				sMetadata = this.responseText;
				fnResolve();
			};
			oRequest.onerror = function() {
				var sError = "error loading resource '" + sResourcePath + "'";
				Log.error(sError, sLogComponent);
				fnReject(new Error(sError, sLogComponent));
			};
			oRequest.open("GET", sResourcePath);
			oRequest.send();
		});

		var oMockDataPromise = new Promise(function (fnResolve, fnReject) {
			var sResourcePath = sap.ui.require.toUrl(sNamespace + "/localService/mockdata/people.json");
			var oMockDataModel = new JSONModel(sResourcePath);

			oMockDataModel.attachRequestCompleted(function (oEvent) {
				// 404 is not an error for JSONModel so we need to handle it here
				if (oEvent.getParameter("errorobject") && oEvent.getParameter("errorobject").statusCode === 404) {
					var sError = "resource '" + sResourcePath + "' not found";
					Log.error(sError, sLogComponent);
					fnReject(new Error(sError, sLogComponent));
				}
				aUsers = this.getData().value;
				fnResolve();
			});

			oMockDataModel.attachRequestFailed(function () {
				var sError = "error loading resource '" + sResourcePath + "'";
				Log.error(sError, sLogComponent);
				fnReject(new Error(sError, sLogComponent));
			});
		});

		return Promise.all([oMetadataPromise, oMockDataPromise]);
	}

	/**
	 * Reduces a given result set by applying the OData URL parameters 'skip' and 'top' to it.
	 * Does NOT change the given result set but returns a new array.
	 * @param {Object} oXhr - the Sinon fake XMLHttpRequest
	 * @param {Array} aResultSet - the result set to be reduced.
	 * @returns {Array} the reduced result set.
	 */
	function applySkipTop(oXhr, aResultSet) {
		var iSkip,
			iTop,
			aReducedUsers = [].concat(aResultSet),
			aMatches = oXhr.url.match(/\$skip=(\d+)&\$top=(\d+)/);

		if (Array.isArray(aMatches) && aMatches.length >= 3) {
			iSkip = aMatches[1];
			iTop = aMatches[2];
			return aResultSet.slice(iSkip, iSkip + iTop);
		}

		return aReducedUsers;
	}

	/**
	 * Sorts a given result set by applying the OData URL parameter 'orderby'.
	 * Does NOT change the given result set but returns a new array.
	 * @param {Object} oXhr - the Sinon fake XMLHttpRequest
	 * @param {Array} aResultSet - the result set to be sorted.
	 * @returns {Array} the sorted result set.
	 */
	function applySort(oXhr, aResultSet) {
		var sFieldName,
			sDirection,
			aSortedUsers = [].concat(aResultSet), // work with a copy
			aMatches = oXhr.url.match(/\$orderby=(\w*)(?:%20(\w*))?/);

		if (!Array.isArray(aMatches) || aMatches.length < 2) {
			return aSortedUsers;
		} else {
			sFieldName = aMatches[1];
			sDirection = aMatches[2] || "asc";

			if (sFieldName !== "LastName") {
				throw new Error("Filters on field " + sFieldName + " are not supported.");
			}

			aSortedUsers.sort(function (a, b) {
				var nameA = a.LastName.toUpperCase();
				var nameB = b.LastName.toUpperCase();
				var bAsc = sDirection === "asc";

				if (nameA < nameB) {
					return bAsc ? -1 : 1;
				}
				if (nameA > nameB) {
					return bAsc ? 1 : -1;
				}
				return 0;
			});

			return aSortedUsers;
		}
	}

	/**
	 * Filters a given result set by applying the OData URL parameter 'filter'.
	 * Does NOT change the given result set but returns a new array.
	 * @param {Object} oXhr - the Sinon fake XMLHttpRequest
	 * @param {Array} aResultSet - the result set to be filtered.
	 * @returns {Array} the filtered result set.
	 */
	function applyFilter(oXhr, aResultSet) {
		var sFieldName,
			sQuery,
			aFilteredUsers = [].concat(aResultSet), // work with a copy
			aMatches = oXhr.url.match(/\$filter=.*\((.*),'(.*)'\)/);

		// If the request contains a filter command, apply the filter
		if (Array.isArray(aMatches) && aMatches.length >= 3) {
			sFieldName = aMatches[1];
			sQuery = aMatches[2];

			if (sFieldName !== "LastName") {
				throw new Error("Filters on field " + sFieldName + " are not supported.");
			}

			aFilteredUsers = aUsers.filter(function (oUser) {
				return oUser.LastName.indexOf(sQuery) !== -1;
			});
		}

		return aFilteredUsers;
	}

	/**
	 * Handles GET requests for metadata.
	 * @returns {Array} an array with the response information needed by Sinon's respond() function
	 */
	function handleGetMetadataRequests() {
		return [
			200,
			{
				"Content-Type" : "application/xml",
				"odata-version" : "4.0"
			}, sMetadata
		];
	}

	/**
	 * Handles GET requests for a pure user count and returns a fitting response.
	 * @returns {Array} an array with the response information needed by Sinon's respond() function
	 */
	function handleGetCountRequests() {
		return getSuccessResponse(aUsers.length.toString());
	}

	/**
	 * Handles GET requests for user data and returns a fitting response.
	 * @param {Object} oXhr - the Sinon fake XMLHttpRequest
	 * @param {boolean} bCount - true if the request should include a counter
	 * @returns {Array} an array with the response information needed by Sinon's respond() function
	 */
	function handleGetUserRequests(oXhr, bCount) {
		var iCount,
			sKey,
			iIndex,
			sCount = "",
			aResult,
			sResponseBody;

		// Check if an individual user or a user range is requested
		try {
			sKey = getUserKeyFromUrl(oXhr.url); // If this throws an error, then a user range was requested

			iIndex = findUserIndex(sKey);
			if (iIndex > -1) {
				sResponseBody = '{"@odata.context": "' + getBaseUrl(oXhr.url) +
					'$metadata#People(Age,FirstName,LastName,UserName)/$entity",' +
					JSON.stringify(aUsers[iIndex]).slice(1);
				return getSuccessResponse(sResponseBody);
			} else {
				sResponseBody = invalidKeyError(sKey);
				return [
					400,
					{
						"Content-Type" : "application/json; charset=utf-8"
					},
					sResponseBody
				];
			}
		} catch (oException) {
			// If getUserKeyFromUrl throws an error, then a user range was requested
			// Get the data filtered, sorted and reduced according to skip + top
			aResult = applyFilter(oXhr, aUsers);
			iCount = aResult.length; // the total no. of people found, after filtering
			aResult = applySort(oXhr, aResult);
			aResult = applySkipTop(oXhr, aResult);

			if (bCount) {
				sCount = '"@odata.count": ' + iCount + ',';
			}

			sResponseBody = '{"@odata.context": "' + getBaseUrl(oXhr.url) +
				'$metadata#People(Age,FirstName,LastName,UserName)",' +
				sCount +
				'"value": ' + JSON.stringify(aResult) +
				"}";
			return getSuccessResponse(sResponseBody);
		}
	}

	/**
	 * Handles PATCH requests for users and returns a fitting response.
	 * Changes the user data according to the request.
	 * @param {Object} oXhr - the Sinon fake XMLHttpRequest
	 * @returns {Array} an array with the response information needed by Sinon's respond() function
	 */
	function handlePatchUserRequests(oXhr) {
		var sKey,
			oUser,
			oChanges,
			sResponseBody;

		// Get the key of the person to change
		sKey = getUserKeyFromUrl(oXhr.url);

		// Get the list of changes
		oChanges = getUserDataFromRequestBody(oXhr.requestBody);

		// Check if the UserName is changed to a duplicate.
		// If the UserName is "changed" to its current value, that is not an error.
		if (oChanges.hasOwnProperty("UserName") && oChanges.UserName !== sKey && !isUnique(oChanges.UserName)) {
			// Error
			sResponseBody = duplicateKeyError(oChanges.UserName);
			return [
				400,
				{
					"Content-Type" : "application/json; charset=utf-8"
				},
				sResponseBody
			];
		} else {
			// No error: make the change(s)
			oUser = aUsers[findUserIndex(sKey)];
			for (var sFieldName in oChanges) {
				if (oChanges.hasOwnProperty(sFieldName)) {
					oUser[sFieldName] = oChanges[sFieldName];
				}
			}

			// The response to PATCH requests is always http 204 (No Content)
			sResponseBody = null;
			return [
				204,
				{
					"OData-Version" : "4.0"
				},
				sResponseBody];
		}
	}

	/**
	 * Handles DELETE requests for users and returns a fitting response.
	 * Deletes the user according to the request.
	 * @param {Object} oXhr - the Sinon fake XMLHttpRequest
	 * @returns {Array} an array with the response information needed by Sinon's respond() function
	 */
	function handleDeleteUserRequests(oXhr) {
		var sKey;

		sKey = getUserKeyFromUrl(oXhr.url);
		aUsers.splice(findUserIndex(sKey), 1);

		// The response to DELETE requests is always http 204 (No Content)
		return [
			204,
			{
				"OData-Version" : "4.0"
			},
			null
		];
	}

	/**
	 * Handles POST requests for users and returns a fitting response.
	 * Creates a new user according to the request.
	 * Does NOT check for duplicate user names because that is how the live service behaves.
	 * @param {Object} oXhr - the Sinon fake XMLHttpRequest
	 * @returns {Array} an array with the response information needed by Sinon's respond() function
	 */
	function handlePostUserRequests(oXhr) {
		var oUser,
			sResponseBody;

		oUser = getUserDataFromRequestBody(oXhr.requestBody);

		// Check if that user already exists
		if (isUnique(oUser.UserName)) {
			aUsers.push(oUser);

			sResponseBody = '{"@odata.context": "' + getBaseUrl(oXhr.url) + '$metadata#People/$entity",';
			sResponseBody += JSON.stringify(oUser).slice(1);

			// The response to POST requests is http 201 (Created)
			return [
				201,
				{
					"Content-Type" : "application/json; odata.metadata=minimal",
					"OData-Version" : "4.0"
				},
				sResponseBody
			];
		} else {
			// Error
			sResponseBody = duplicateKeyError(oUser.UserName);
			return [
				400,
				{
					"Content-Type" : "application/json; charset=utf-8"
				},
				sResponseBody
			];
		}
	}

	/**
	 * Handles POST requests for resetting the data and returns a fitting response.
	 * Reloads the base user data from file.
	 * Does NOT check for duplicate user names because that is how the live service behaves.
	 * @returns {Array} an array with the response information needed by Sinon's respond() function
	 */
	function handleResetDataRequest() {
		readData();

		return [
			204,
			{
				"OData-Version" : "4.0"
			},
			null
		];
	}

	/**
	 * Builds a response to direct (= non-batch) requests.
	 * Supports GET, PATCH, DELETE and POST requests.
	 * @param {Object} oXhr - the Sinon fake XMLHttpRequest
	 * @returns {Array} an array with the response information needed by Sinon's respond() function
	 */
	function handleDirectRequest(oXhr) {
		var aResponse;

		switch (oXhr.method) {
			case "GET":
				if (/\$metadata/.test(oXhr.url)) {
					aResponse = handleGetMetadataRequests();
				} else if (/\/\$count/.test(oXhr.url)) {
					aResponse = handleGetCountRequests();
				} else if (/People.*\?/.test(oXhr.url)) {
					aResponse = handleGetUserRequests(oXhr, /\$count=true/.test(oXhr.url));
				}
				break;
			case "PATCH":
				if (/People/.test(oXhr.url)) {
					aResponse = handlePatchUserRequests(oXhr);
				}
				break;
			case "POST":
				if (/People/.test(oXhr.url)) {
					aResponse = handlePostUserRequests(oXhr);
				} else if (/ResetDataSource/.test(oXhr.url)) {
					aResponse = handleResetDataRequest();
				}
				break;
			case "DELETE":
				if (/People/.test(oXhr.url)) {
					aResponse = handleDeleteUserRequests(oXhr);
				}
				break;
			default:
				break;
		}

		return aResponse;
	}

	/**
	 * Builds a response to batch requests.
	 * Unwraps batch request, gets a response for each individual part and
	 * constructs a fitting batch response.
	 * @param {Object} oXhr - the Sinon fake XMLHttpRequest
	 * @returns {Array} an array with the response information needed by Sinon's respond() function
	 */
	function handleBatchRequest(oXhr) {
		var aResponse,
			sResponseBody = "",
			sOuterBoundary = oXhr.requestBody.match(/(.*)/)[1], // First line of the body
			sInnerBoundary,
			sPartBoundary,
			aOuterParts = oXhr.requestBody.split(sOuterBoundary).slice(1, -1), // The individual requests
			aParts,
			aMatches;

		aMatches = aOuterParts[0].match(/multipart\/mixed;boundary=(.+)/);
		// If this request has several change sets, then we need to handle the inner and outer boundaries
		// (change sets have an additional boundary)
		if (aMatches && aMatches.length > 0) {
			sInnerBoundary = aMatches[1];
			aParts = aOuterParts[0].split("--" + sInnerBoundary).slice(1, -1);
		} else {
			aParts = aOuterParts;
		}

		// If this request has several change sets, then the response must start with the outer boundary and
		// content header
		if (sInnerBoundary) {
			sPartBoundary = "--" + sInnerBoundary;
			sResponseBody += sOuterBoundary + "\r\n" +
				"Content-Type: multipart/mixed; boundary=" + sInnerBoundary + "\r\n\r\n";
		} else {
			sPartBoundary = sOuterBoundary;
		}

		aParts.forEach(function (sPart, iIndex) {
			// Construct the batch response body out of the single batch request parts.
			// The RegExp looks for a request body at the end of the string, framed by two line breaks.
			var aMatches = sPart.match(/(GET|DELETE|PATCH|POST) (\S+)(?:.|\r?\n)+\r?\n(.*)\r?\n$/);
			var aPartResponse = handleDirectRequest({
				method : aMatches[1],
				url : getBaseUrl(oXhr.url) + aMatches[2],
				requestBody : aMatches[3]
			});
			sResponseBody += sPartBoundary + "\r\n" +
				"Content-Type: application/http\r\n";
			// If there are several change sets, we need to add a Content ID header
			if (sInnerBoundary) {
				sResponseBody += "Content-ID:" + iIndex + ".0\r\n";
			}
			sResponseBody += "\r\nHTTP/1.1 " + aPartResponse[0] + "\r\n";
			// Add any headers from the request - unless this response is 204 (no content)
			if (aPartResponse[1] && aPartResponse[0] !== 204) {
				for (var sHeader in aPartResponse[1]) {
					if (aPartResponse[1].hasOwnProperty(sHeader)) {
						sResponseBody += sHeader + ": " + aPartResponse[1][sHeader] + "\r\n";
					}
				}
			}
			sResponseBody += "\r\n";

			if (aPartResponse[2]) {
				sResponseBody += aPartResponse[2];
			}
			sResponseBody += "\r\n";
		});

		// Check if we need to add the inner boundary again at the end
		if (sInnerBoundary) {
			sResponseBody += "--" + sInnerBoundary + "--\r\n";
		}
		// Add a final boundary to the batch response body
		sResponseBody += sOuterBoundary + "--";

		// Build the final batch response
		aResponse = [
			200,
			{
				"Content-Type" : "multipart/mixed;boundary=" + sOuterBoundary.slice(2),
				"OData-Version" : "4.0"
			},
			sResponseBody
		];

		return aResponse;
	}

	/**
	 * Handles any type of intercepted request and sends a fake response.
	 * Logs the request and response to the console.
	 * Manages batch requests.
	 * @param {Object} oXhr - the Sinon fake XMLHttpRequest
	 */
	function handleAllRequests(oXhr) {
		var aResponse;

		// Log the request
		Log.info(
			"Mockserver: Received " + oXhr.method + " request to URL " + oXhr.url,
			(oXhr.requestBody ? "Request body is:\n" + oXhr.requestBody : "No request body.") + "\n",
			sLogComponent);

		if (oXhr.method === "POST" && /\$batch$/.test(oXhr.url)) {
			aResponse = handleBatchRequest(oXhr);
		} else {
			aResponse = handleDirectRequest(oXhr);
		}

		oXhr.respond(aResponse[0], aResponse[1], aResponse[2]);

		// Log the response
		Log.info(
			"Mockserver: Sent response with return code " + aResponse[0],
			("Response headers: " + JSON.stringify(aResponse[1]) + "\n\nResponse body:\n" + aResponse[2]) + "\n",
			sLogComponent);
	}
});