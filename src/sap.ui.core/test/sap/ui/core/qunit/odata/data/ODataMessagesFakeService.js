sap.ui.define([
	"sap/base/Log",
	"sap/base/util/extend"
], function (Log, extend) {
	"use strict";

var mHeaderTypes = {
	xml: {
		"Content-Type" : "application/xml;charset=utf-8",
		"DataServiceVersion" : "1.0;"
	},
	atom: {
		"Content-Type" : "application/atom+xml;charset=utf-8",
		"DataServiceVersion" : "2.0;"
	},
	json: {
		"Content-Type" : "application/json;charset=utf-8",
		"DataServiceVersion" : "2.0;"
	},
	text: {
		"Content-Type" : "text/plain;charset=utf-8",
		"DataServiceVersion" : "2.0;"
	}
};

var mPredefinedServiceResponses = {
	// Defined at the end of this file
};


(function(sinon) {

	var mServiceData = {
		serviceUrl: "fakeservice://testdata/odata/northwind/",
		collections: {
			"Products": {
				count: 20,
				type: "NorthwindModel.Product",
				properties: {
					"ProductID": { type: "id" },
					"ProductName": { type: "string" },
					"SupplierID": { type: "int", maxValue: 5 },
					"CategoryID": { type: "int", maxValue: 20 },
					"QuantityPerUnit":  { type: "string", choices: ["kg", "pcs", "ml"] },
					"UnitPrice":  { type: "float" },
					"UnitsInStock": { type: "int" },
					"UnitsOnOrder": { type: "int" },
					"ReorderLevel": { type: "int" },
					"Discontinued": { type: "bool" }
				},
				navigationProperties: {
					"Supplier": { entitySet: "Suppliers", key: "4", multiple: false }
				},
				itemMessages: [{ // Messages per Item
					"target": "ProductName",
					"code": "Item",
					"message": "This Item is very doof",
					"severity": "error"
				}],
				collectionMessages: [{ // Messages per collection
					"code": "BL/308",
					"message": "Steward(ess) Miss Piggy is ill and not available",
					"severity": "info"
				}]
			},
			"Suppliers": {
				count: 5,
				type: "NorthwindModel.Supplier",
				properties: {
					"SupplierID": { type: "id" },
					"SupplierName": { type: "string" }
				},
				itemMessages: [{ // Messages per Item
					"target": "SupplierName",
					"code": "Item",
					"message": "This supplier has a name I cannot accept",
					"severity": "error"
				}],
				collectionMessages: [{ // Messages per collection
					"code": "XY/123",
					"message": "What the...?",
					"severity": "info"
				}]
			}
		},

		metadata: mPredefinedServiceResponses.northwindMetadata
	};

	var oRandomService = new ODataRandomService(mServiceData);

	var xhr = sinon.useFakeXMLHttpRequest(), responseDelay = 50, _setTimeout = window.setTimeout;

	xhr.useFilters = true;
	xhr.addFilter(function(method, url) {
		return url.indexOf("fakeservice://") != 0;
	});
	xhr.onCreate = function(request) {
		request.onSend = function() {
			// Default request answer values:

			var sUrl = request.url;
			var bJson = request.url.indexOf("$format=json") > -1 || request.requestHeaders["Accept"].indexOf("application/json") > -1;

			var sRandomServiceUrl = null;
			var iResponseDelay = 200;
			var iStatus = 404;
			var mResponseHeaders = [];
			var sAnswer = "Not found";

			switch (sUrl) {
				case "fakeservice://testdata/odata/northwind/Products(1)?$expand=Supplier":
					iStatus = 200;
					mResponseHeaders = extend({}, mHeaderTypes["json"]);
					mResponseHeaders["sap-message"] = JSON.stringify({
						"code":		"999",
						"message":	"This is a server test message",
						"severity":	"error",
						"target":	"/Suppliers(1)/Name",
						"details": []
					});
					sAnswer = mPredefinedServiceResponses.ProductsExpandSupplier;
					break;
				case "fakeservice://testdata/odata/function-imports/":
					iStatus = 200;
					mResponseHeaders = extend({}, mHeaderTypes["xml"]);
					mResponseHeaders["sap-message"] = JSON.stringify({
						"code":		"999",
						"message":	"This is a server wide test message",
						"severity":	"error",
						"target":	"",
						"details": []
					});
					sAnswer = mPredefinedServiceResponses.functionImportMain;
					break;

				case "fakeservice://testdata/odata/function-imports/$metadata":
					iStatus = 200;
					mResponseHeaders = extend({}, mHeaderTypes["xml"]);
					sAnswer = mPredefinedServiceResponses.functionImportMetadata;
					break;

				case "fakeservice://testdata/odata/function-imports/EditProduct?ProductUUID=guid'00000000-0000-0000-0000-000000000001'":
					iStatus = 200;
					mResponseHeaders = extend({}, mHeaderTypes["atom"]);
					mResponseHeaders["sap-message"] = JSON.stringify({
						"code":		"999",
						"message":	"This is FunctionImport specific test message",
						"severity":	"error",
						"target":	"",
						"details": []
					});
					mResponseHeaders["location"] = "fakeservice://testdata/odata/function-imports/Products(guid'10000000-0000-0000-0000-000000000000')";
					sAnswer = mPredefinedServiceResponses.functionImportProduct1;
					break;

				case "fakeservice://testdata/odata/function-imports/EditProduct?ProductUUID=guid'00000000-0000-0000-0000-000000000002'":
					iStatus = 200;
					mResponseHeaders = extend({}, mHeaderTypes["atom"]);
					mResponseHeaders["sap-message"] = JSON.stringify({
						"code":		"999",
						"message":	"This is FunctionImport specific test message",
						"severity":	"error",
						"target":	"/Products(guid'20000000-0000-0000-0000-000000000000')",
						"details": []
					});
					sAnswer = mPredefinedServiceResponses.functionImportProduct1;
					break;

				case "fakeservice://testdata/odata/function-imports/EditProduct?ProductUUID=guid'30000000-0000-0000-0000-000000000003'":
					iStatus = 200;
					mResponseHeaders = extend({}, mHeaderTypes["atom"]);
					mResponseHeaders["sap-message"] = JSON.stringify({
						"code":		"999",
						"message":	"This is FunctionImport specific test message",
						"severity":	"error",
						"details": []
					});
					sAnswer = mPredefinedServiceResponses.functionImportProduct1;
					break;

				case "fakeservice://testdata/odata/technical-errors/Error(400)":
					iStatus = 400;
					sAnswer = bJson ? mPredefinedServiceResponses.technicalError400Json : mPredefinedServiceResponses.technicalError400Xml;
					mResponseHeaders = extend({}, mHeaderTypes[bJson ? "json" : "xml"]);
					break;

				case "fakeservice://testdata/odata/technical-errors/Error(500)":
					iStatus = 500;
					sAnswer = bJson ? mPredefinedServiceResponses.technicalError500Json : mPredefinedServiceResponses.technicalError500Xml;
					mResponseHeaders = extend({}, mHeaderTypes[bJson ? "json" : "xml"]);
					break;

				case "fakeservice://testdata/odata/technical-errors/$metadata":
					iStatus = 200;
					mResponseHeaders = extend({}, mHeaderTypes["xml"]);
					sAnswer = mPredefinedServiceResponses.functionImportMetadata;
					break;

				case "fakeservice://testdata/odata/technical-errors/Error2(400)":
					iStatus = 400;
					sAnswer = bJson ? mPredefinedServiceResponses.technicalError400Json2 : mPredefinedServiceResponses.technicalError400Xml2;
					mResponseHeaders = extend({}, mHeaderTypes[bJson ? "json" : "xml"]);
					break;

				case "fakeservice://testdata/odata/function-imports/ActionForFunction?SupplierUUID=guid'00000000-0000-0000-0000-000000000001'":
					iStatus = 200;
					mResponseHeaders = extend({}, mHeaderTypes["atom"]);
					mResponseHeaders["sap-message"] = JSON.stringify({
						"code":		"999",
						"message":	"This is FunctionImport specific test message",
						"severity":	"error",
						"target": "",
						"details": []
					});
					sAnswer = mPredefinedServiceResponses.functionImportProduct1;
					break;

				case "fakeservice://testdata/odata/function-imports/ActionForFunction?SupplierUUID=guid'00000000-0000-0000-0000-000000000002'":
					iStatus = 200;
					mResponseHeaders = extend({}, mHeaderTypes["atom"]);
					mResponseHeaders["sap-message"] = JSON.stringify({
						"code":		"999",
						"message":	"This is FunctionImport specific test message",
						"severity":	"error",
						"target": "/Products(999)/ProductName",
						"details": []
					});
					sAnswer = mPredefinedServiceResponses.functionImportProduct1;
					break;

				// Special function import for showing use of invalid targets
				case "fakeservice://testdata/odata/northwind/functionWithInvalidTarget":
					iStatus = 204;
					mResponseHeaders = extend({}, mHeaderTypes["atom"]);
					mResponseHeaders["sap-message"] = JSON.stringify({
						"code":		Date.now(),
						"message":	"This is FunctionImport specific message that will stay until the function is called again.",
						"severity":	"error",
						"target": "/PersistedMessages/functionWithInvalidTarget",
						"details": [{
							"code":		Date.now(),
							"message":	"This is a message for '/Products(1)'.",
							"severity":	"warning",
							"target": "/Products(1)/SupplierID"
						}]
					});
					mResponseHeaders["location"] = "fakeservice://testdata/odata/northwind/Products(1)";
					sAnswer = "";
					break;

				case "fakeservice://testdata/odata/northwind/functionWithInvalidReturnType":
				iStatus = 204;
				mResponseHeaders = extend({}, mHeaderTypes["atom"]);
				mResponseHeaders["location"] = "fakeservice://testdata/odata/northwind";
				mResponseHeaders["sap-message"] = JSON.stringify({
					"code":		Date.now(),
					"message":	"This is FunctionImport specific message with an invalid return type.",
					"severity":	"error"
				});
				sAnswer = "";
				break;

				case "fakeservice://testdata/odata/northwind/functionWithInvalidEntitySet":
				iStatus = 204;
				mResponseHeaders = extend({}, mHeaderTypes["atom"]);
				mResponseHeaders["location"] = "fakeservice://testdata/odata/northwind";
				mResponseHeaders["sap-message"] = JSON.stringify({
					"code":		Date.now(),
					"message":	"This is FunctionImport specific message with an invalid entityset.",
					"severity":	"error"
				});
				sAnswer = "";
				break;

				// Special case that delivers transient messages
				case "fakeservice://testdata/odata/northwind/TransientTest1":
					var iDate = Date.now();
					iStatus = 200;
					mResponseHeaders = extend({}, mHeaderTypes["json"]);
					mResponseHeaders["sap-message"] = JSON.stringify({
						"code":		iDate,
						"message":	"This is a normal message.",
						"severity":	"error",
						"target": "/TransientTest1/SupplierID",
						"details": [{
							"code":		iDate + 1,
							"message":	"This is a transient message using /#TRANSIENT# notation.",
							"severity":	"error",
							"target": "/#TRANSIENT#/TransientTest1/SupplierID"
						}, {
							"code":		iDate + 2,
							"message":	"This is a transient message using transient flag.",
							"severity":	"error",
							"transient": true,
							"target": "/TransientTest1/SupplierID"
						}]
					});
					sAnswer = JSON.stringify({
						"d": {
							"results": [
								{
									"__metadata": {
										"id": "fakeservice://testdata/odata/northwind/TransientTest1",
										"uri": "fakeservice://testdata/odata/northwind/TransientTest1",
										"type": "NorthwindModel.Product"
									},
									"ProductID": "transient-1",
									"ProductName": "snoyweh",
									"SupplierID": 0,
									"CategoryID": 17,
									"QuantityPerUnit": "ml",
									"UnitPrice": 25.35128231184987,
									"UnitsInStock": 12,
									"UnitsOnOrder": 2,
									"ReorderLevel": 75,
									"Discontinued": false
								}
							]
						}
					});
					break;

				default:
					if (sUrl.startsWith(mServiceData["serviceUrl"])) {
						// This one's for us...
						sRandomServiceUrl = sUrl.substr(mServiceData["serviceUrl"].length);
					} else {
						/* eslint-disable no-debugger */
						debugger;
						/* eslint-enable no-debugger */
						throw new Error("Unknown Fakeservice URL");
					}

			}

			if (sRandomServiceUrl !== null) {
				// Use RandomService
				oRandomService.serveUrl({
					url: sRandomServiceUrl,
					request: request,
					json: bJson
				});
			} else if (request.async === true) {
				var oRequest = request;
				_setTimeout(function() {
					oRequest.respond(iStatus, mResponseHeaders, sAnswer);
				}, iResponseDelay);
			} else {
				request.respond(iStatus, mResponseHeaders, sAnswer);
			}
		};
	};









	function ODataRandomService(oServiceConfig) {
		this._config = oServiceConfig;
		this._serviceUrl = this._config["serviceUrl"];
	}

	ODataRandomService.prototype.serveUrl = function(mOptions) {
		this._url     = mOptions.url;
		this._request = mOptions.request;
		this._useJson = !!mOptions.json;
		this._urlInfo = this._parseUrl(mOptions.url);

		var mResponse = this._createResponse(this._urlInfo, mOptions);

		this._answer(mResponse);
	};


	ODataRandomService.prototype._createResponse = function(mUrlInfo, mOptions) {
		var mResponse;
		var mCollection = mServiceData.collections[mUrlInfo.collection];

		if (mUrlInfo.path == "") {
			// Main service document
			mResponse = this._answerService(mServiceData);
		} else if (mUrlInfo.path == "$metadata") {
			mResponse = this._answerMetadata();
		} else if (mUrlInfo.path == "$batch") {
			// TODO: Implement batch mode;
			mResponse = this.handleBatchRequest(mOptions);
		} else if (mUrlInfo.postfix == "$count" && mCollection) {
			mResponse = this._answerCollectionCount(mCollection);
		} else if (!mUrlInfo.item && mCollection) {
			// Return the whole collection
			mResponse = this._answerCollection(mUrlInfo.collection, mCollection);
		} else if (mUrlInfo.item && mCollection && mUrlInfo.postfix && mCollection.navigationProperties[mUrlInfo.postfix]) {
			var sResolvedPath = this.resolveNavigationProperty(mCollection, mUrlInfo.item, mUrlInfo.postfix);
			var mResolvedUrlInfo = this._parseUrl(sResolvedPath);
			mOptions.useAboluteMessagePath = true;
			mResponse = this._createResponse(mResolvedUrlInfo, mOptions);
		} else if (mUrlInfo.item && mCollection) {
			// return Data for one Item
			mResponse = this._answerCollectionItem(mUrlInfo.item, mUrlInfo.collection, mCollection, mOptions);
		} else {
			mResponse = this._answerError();
		}

		return mResponse;
	};


	ODataRandomService.prototype.resolveNavigationProperty = function(mCollection, sItem, sNavigationProperty) {
		var mNavigationProperty = mCollection.navigationProperties[sNavigationProperty];
		return mNavigationProperty.entitySet + "(" + mNavigationProperty.key + ")";
	};

	// TODO: !!! Batch support is very shaky and only works for the specific tests - this should be built more robust and standards compliant

	ODataRandomService.prototype.handleBatchRequest = function(mOptions) {
		var mBatchResponse = {};
		var aSubRequests = this.parseBatchRequest(mOptions.request.requestBody);


		// TODO: boundary is from odata example http://www.odata.org/documentation/odata-version-2-0/batch-processing/
		var sBatchSeparator = "batch_36522ad7-fc75-4b56-8c71-56071383e77b";

		mBatchResponse.status = 202;
		mBatchResponse.headers = {
			"DataServiceVersion": "2.0",
			"Content-Type": "multipart/mixed; boundary=" + sBatchSeparator
		};
		mBatchResponse.body = "";


		function createHeaderString(mHeaders) {
			return Object.keys(mHeaders).map(function(sKey) {
				return sKey + ": " + mHeaders[sKey];
			}).join("\r\n");
		}


		var bInChangeset = false;
		for (var i = 0; i < aSubRequests.length; ++i) {

			var mRequest = aSubRequests[i];

			var mResponse = this._createResponse(this._parseUrl(mRequest.url), mOptions);

			var sBatchContentType = "Content-Type: application/http\r\n";

			if (mRequest.method == "GET") {
				// All is good
				bInChangeset = false;

			} else if (mRequest.method === "HEAD") {
				bInChangeset = false;

				mResponse.status = 204;
				mResponse.body = "";
			} else {
				Log.warning("ODataRandomService ignores writes...");
				if (!bInChangeset) {
					mBatchResponse.body += "\r\n--" + sBatchSeparator + "\r\n";
					mBatchResponse.body += "Content-Type: multipart/mixed; boundary=changeset_" + sBatchSeparator + "\r\n";
					// TODO: Content-Length: ###
				}
				bInChangeset = true;

				mResponse.status = 204;
				mResponse.body = "";
				delete mResponse.headers["Content-Type"];
			}

			// Start new sub request
			mBatchResponse.body += "\r\n--" + (bInChangeset ? "changeset_" : "") + sBatchSeparator + "\r\n";
			// Add batch headers

			mBatchResponse.body += sBatchContentType;
			mBatchResponse.body += "Content-Transfer-Encoding:binary\r\n";
			mBatchResponse.body += "\r\n";

			mBatchResponse.body += "HTTP/1.1 " + mResponse.status + " Ok\r\n";

			mBatchResponse.body += createHeaderString(mResponse.headers) + "\r\n\r\n";
			mBatchResponse.body += mResponse.body + "\r\n\r\n";
		}

		if (bInChangeset) {
			mBatchResponse.body += "--changeset_" + sBatchSeparator + "--\r\n";
		}

		mBatchResponse.body += "--" + sBatchSeparator + "--";

		return mBatchResponse;
	};


	ODataRandomService.prototype.parseBatchRequest = function(sBatchContent) {
		function parseHeaders(vHeaders) {
			var mHeaders = {};

			var aHeaders = Array.isArray(vHeaders) ? vHeaders : vHeaders.split("\n");
			for (var i = 0; i < aHeaders.length; ++i) {
				var aSingleHeader = aHeaders[i].toLowerCase().split(":");
				mHeaders[aSingleHeader[0].trim()] = aSingleHeader[1].trim();
			}


			return mHeaders;
		}

		// TODO: The following replaces all instances of \r\n - even in the payload... not sure this is ok even for our tests...
		// The separator is the first line of the body (or second if only return in first one)
		var aMatches = sBatchContent.match(/^[\r\n]*([^\n]*)/m);

		if (!aMatches || !aMatches[1]) {
			throw new Error("Batch request did not contain separator");
		}

		var sSeparator = aMatches[1].trim();

		var aContentParts = sBatchContent.replace(sSeparator + "--", "").trim().split(sSeparator).slice(1);

		// TODO: Handle changesets correctly
		if (aContentParts.length == 1) {
			sBatchContent = aContentParts[0];
			aMatches = sBatchContent.match(/^.*boundary=([^\n]*)/m);

			if (!aMatches || !aMatches[1]) {
				throw new Error("Changeset did not contain separator");
			}

			sSeparator = aMatches[1].trim();

			aContentParts = aContentParts[0].replace(sSeparator + "--", "").trim().split(sSeparator).slice(2);
		}


		var aRequests = aContentParts.map(function(sSingleRequest) {
			var mRequest = {};

			// Replace \r\n and \r with just \n so we can split easier
			sSingleRequest = sSingleRequest.replace(/\r\n|\r/g, "\n").trim();
			if (sSingleRequest.length === 0) {
				return {};
			}

			var aSplitted = sSingleRequest.trim().split("\n\n");

			mRequest.batchHeaders = parseHeaders(aSplitted[0]);

			var aLines = aSplitted[1].trim().split("\n");

			var sRequestLine = aLines.shift();
			var aMatches = /([^ ]*) (.*) (HTTP.*)/.exec(sRequestLine);

			mRequest.method = aMatches[1];
			mRequest.url = aMatches[2];
			mRequest.headers = parseHeaders(aLines);
			mRequest.body = aSplitted[2] ? aSplitted[2] : "";

			return mRequest;
		});

		return aRequests;
	};

	ODataRandomService.prototype._answer = function(mResponse) {
		function fnRespond(oRequest, mResponse) {
			oRequest.respond(mResponse.status, mResponse.headers, mResponse.body);
		}

		if (this._request.async === true) {
			_setTimeout(fnRespond.bind(this, this._request, mResponse), responseDelay);
		} else {
			fnRespond(this._request, mResponse);
		}
	};

	ODataRandomService.prototype._parseUrl = function(sUrl) {
		var sPath = "",
			sCollection = "",
			sItem = "",
			sPostfix = "",
			sParams = "";

		var aMatches = sUrl.match(/^(.*)\?(.*)$/);
		if (aMatches) {
			sPath   = aMatches[1];
			sParams = aMatches[2];
		} else {
			sPath   = sUrl;
			sParams = "";
		}

		aMatches = sPath.match(/^([A-Za-z0-9]+)([\(\)(A-Za-z0-9=_%'\-)]*)\/{0,1}(.*)$/);
		if (aMatches && aMatches.length === 3) {
			sCollection = aMatches[1];
			sPostfix = aMatches[2];
		} else if (aMatches && aMatches.length === 4) {
			sCollection = aMatches[1];
			sItem = aMatches[2].replace(/^\(|\)$/g, "");
			sPostfix = aMatches[3];
		} else {
			sCollection = sPath;
		}

		return {
			path: sPath,
			collection: sCollection,
			item: sItem,
			postfix: sPostfix,
			parameters: sParams
		};
	};


	ODataRandomService.prototype._answerCollectionItem = function(sItem, sCollection, mCollection, mOptions) {
		var mMessage, aMessages = [];

		var sTargetPrefix = mOptions.useAboluteMessagePath ? "/" + sCollection + "(" + sItem + ")/" : "";

		var sItemUrl = this._serviceUrl + sCollection + "(" + sItem + ")";

		var mItem = {
			"__metadata": {
				"id": sItemUrl,
				"uri": sItemUrl,
				"type": mCollection.type
			}
		};

		for (var sName in mCollection.properties) {
			mItem[sName] = this._createData(mCollection.properties[sName], sItem);
		}


		if (mCollection.itemMessages) {
			for (var n = 0; n < mCollection.itemMessages.length; ++n) {
				mMessage = extend({}, mCollection.itemMessages[n]);
				mMessage.target = sTargetPrefix + mCollection.itemMessages[n].target;
				aMessages.push(mMessage);
			}
		}


		var mAnswer = {
			d: {
				results: [ mItem ]
			}
		};

		if (mCollection.message) {
			aMessages.push(mCollection.message);
		}

		if (mCollection.collectionMessages) {
			for (var i = 0; i < mCollection.collectionMessages.length; ++i) {
				mMessage = extend({}, mCollection.collectionMessages[i]);
				mMessage.target = "/" + sCollection;
				aMessages.push(mMessage);
			}
		}

		var sType = this._useJson ? "json" : "atom";
		var sAnswer = this._useJson ? JSON.stringify(mAnswer) : this._createXmlAnswer(mAnswer, "collection");

		var mHead = extend({}, mHeaderTypes[sType]);
		mHead["sap-message"] = this._createMessageHeader(aMessages);

		return {
			status: 200,
			headers: mHead,
			body: sAnswer
		};
	};

	ODataRandomService.prototype._answerError = function() {
		var mAnswer = {
			error: {
				code: "GNARF/42",
				message: {
					lang: "en-US",
					value: "Good news everyone: Something horrible happened!"
				}
			}
		};

		var sType = this._useJson ? "json" : "atom";
		var sAnswer = this._useJson ? JSON.stringify(mAnswer) : this._createXmlAnswer(mAnswer, "error");

		return {
			status: 200,
			headers: mHeaderTypes[sType],
			body: sAnswer
		};
	};

	ODataRandomService.prototype._createXmlAnswer = function(mAnswer, sType) {
		var i;
		var sAnswer = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";

		if (sType === "error") {
			// This is an error response
			sAnswer += "<m:error xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\">";
			sAnswer += "<m:code>" + mAnswer.error.code + "</m:code>";
			sAnswer += "<m:message xml:lang=\"" +  mAnswer.error.message.lang + "\">" + mAnswer.error.message.value + "</m:message>";
			sAnswer += "</m:error>";
		} else if (sType === "service") {
			sAnswer += "<service xmlns=\"http://www.w3.org/2007/app\" xmlns:atom=\"http://www.w3.org/2005/Atom\" xml:base=\"http://services.odata.org/V3/Northwind/Northwind.svc/\">";
			sAnswer += "<workspace>";
			sAnswer += "<atom:title>Default</atom:title>";

			for (i = 0; i < mAnswer.d.EntitySets.length; ++i) {
				var sName = mAnswer.d.EntitySets[i];
				sAnswer += "<collection href=\"" + sName + "\">";
				sAnswer += "<atom:title>" + sName + "</atom:title>";
				sAnswer += "</collection>";
			}

			sAnswer += "</workspace>";
			sAnswer += "</service>";
		} else if (sType === "collection") {
			sAnswer += "<feed xmlns=\"http://www.w3.org/2005/Atom\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\">"; // TODO: xml:base needed?
			// sAnswer += "<id>" + NOTINJSON. + "</id>";
			// sAnswer += "<title>" + NOTINJSON. + "</title>";
			// sAnswer += "<updated>" + NOTINJSON. + "</updated>";
			// sAnswer += "<link rel=\"self\" title=\"" + NOTINJSON. + "\" href=\"" + NOTINJSON + "\" />";

			for (i = 0; i < mAnswer.d.results.length; ++i) {
				var mEntry = mAnswer.d.results[i];
				sAnswer += "<entry>";

				sAnswer += "<id>" + mEntry.__metadata.id + "</id>";
				sAnswer += "<content type=\"application/xml\">";
				sAnswer += "<m:properties>";

				for (var sProp in mEntry) {
					if (sProp === "__metadata") {
						continue;
					}

					sAnswer += "<d:" + sProp + ">";
					sAnswer += mEntry[sProp];
					sAnswer += "</d:" + sProp + ">";
				}

				sAnswer += "</m:properties>";
				sAnswer += "</content>";

				sAnswer += "</entry>";
			}

			sAnswer += "</feed>";


		} else if (sType === "entity") {
			throw "nö";
		}

		return sAnswer;
	};

	ODataRandomService.prototype._answerMetadata = function() {
		return {
			status: 200,
			headers: mHeaderTypes["xml"],
			body: mPredefinedServiceResponses.northwindMetadata
		};
	};

	ODataRandomService.prototype._answerService = function(oServiceData) {
		var mAnswer = {
			d: {
				EntitySets: oServiceData.collections
			}
		};

		var sType = this._useJson ? "json" : "atom";
		var sAnswer = this._useJson ? JSON.stringify(mAnswer) : this._createXmlAnswer(mAnswer, "service");

		return {
			status: 200,
			headers: mHeaderTypes[sType],
			body: sAnswer
		};
	};

	ODataRandomService.prototype._answerCollectionCount = function(oColData) {
		return {
			status: 200,
			headers: mHeaderTypes[mHeaderTypes["text"]],
			body: "" + oColData.count
		};
	};

	ODataRandomService.prototype._answerCollection = function(sColName, oColData) {
		var aItems = [];
		var aMessages = [];
		var mMessage, i;

		for (i = 0; i < oColData.count; ++i) {
			var sItemUrl = this._serviceUrl + sColName + "(" + (i + 1) + ")";

			var mItem = {
				"__metadata": {
					"id": sItemUrl,
					"uri": sItemUrl,
					"type": oColData.type
				}
			};

			for (var sName in oColData.properties) {
				mItem[sName] = this._createData(oColData.properties[sName], i + 1);
			}

			aItems.push(mItem);

			if (oColData.itemMessages) {
				for (var n = 0; n < oColData.itemMessages.length; ++n) {
					mMessage = extend({}, oColData.itemMessages[n]);
					mMessage.code = oColData.itemMessages[n].code + i;
					mMessage.target = "(" + (i + 1) + ")/" + oColData.itemMessages[n].target;
					mMessage.propertyRef = "(" + (i + 1) + ")/" + oColData.itemMessages[n].target;
					aMessages.push(mMessage);
				}
			}
		}


		var mAnswer = {
			d: {
				results: aItems
			}
		};

		if (oColData.message) {
			aMessages.push(oColData.message);
		}

		if (oColData.collectionMessages) {
			for (i = 0; i < oColData.collectionMessages.length; ++i) {
				mMessage = extend({}, oColData.collectionMessages[i]);
				mMessage.target = "/" + sColName;
				aMessages.push(mMessage);
			}
		}

		var sType = this._useJson ? "json" : "atom";
		var sAnswer = this._useJson ? JSON.stringify(mAnswer) : this._createXmlAnswer(mAnswer, "collection");

		var mHead = extend({}, mHeaderTypes[sType]);
		mHead["sap-message"] = this._createMessageHeader(aMessages);

		return {
			status: 200,
			headers: mHead,
			body: sAnswer
		};
	};

	ODataRandomService.prototype._createMessageHeader = function(aMessages) {
		var mMessage = {
			"code": aMessages[0].code,
			"message": aMessages[0].message,
			"severity": aMessages[0].severity,
			"target": aMessages[0].target,
			"details": []
		};

		for (var i = 1; i < aMessages.length; ++i) { // i = 1 => skip first
			mMessage.details.push({
				"code": aMessages[i].code,
				"message": aMessages[i].message,
				"severity": aMessages[i].severity,
				"target": aMessages[i].target
			});
		}

		return JSON.stringify(mMessage);
	};

	ODataRandomService.prototype._createData = function(mOptions, sId) {
		var sResult, iMax;

		switch (mOptions.type) {
			case "string":
				if (mOptions.choices) {
					sResult = mOptions.choices[Math.floor(Math.random() * mOptions.choices.length)];
				} else {
					sResult = this._createRandomString();
				}
			break;

			case "id":
				sResult = sId;
			break;

			case "int":
				iMax = mOptions.maxValue ? mOptions.maxValue : 99;
				sResult = Math.round(Math.random() * iMax);
			break;

			case "float":
				iMax = mOptions.maxValue ? mOptions.maxValue : 99;
				sResult = Math.random() * iMax;
			break;

			case "bool":
				sResult = Math.random >= 0.5;
			break;

			default:
				sResult = "INVALID DATA TYPE!!!";
			break;
		}

		return sResult;
	};

	ODataRandomService.prototype._createRandomString = function(iSyllables) {
		var aSyllables = [[
			"b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "y", "z",
			"th", "sh", "ph",
			"bl", "cl", "kl", "pl", "sl",
			"gn", "kn", "pn", "sn",
			"br", "cr", "dr", "fr", "gr", "kr", "pr", "tr"
		], [
			"a", "e", "i", "o", "u", "y",
			"ai", "au", "ay",
			"ei", "ey",
			"ou", "oy"
		]];
		var iSizes = [
			aSyllables[0].length, aSyllables[1].length
		];

		if (iSyllables === undefined) {
			iSyllables = 5;
		}

		var sString = "";

		var s = 0;
		for (var i = 0; i < iSyllables; i++) {
			sString += aSyllables[s][Math.floor(Math.random() * iSizes[s])];
			s = s == 0 ? 1 : 0;
		}

		return sString;
	};


})(window.sinon);

mPredefinedServiceResponses.northwindMetadata = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx">\
	<edmx:DataServices m:DataServiceVersion="1.0" m:MaxDataServiceVersion="3.0"\
		xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"\
		xmlns:sap="http://www.sap.com/Protocols/SAPData">\
		<Schema Namespace="NorthwindModel" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
			<EntityType Name="Category">\
				<Key>\
					<PropertyRef Name="CategoryID" />\
				</Key>\
				<Property Name="CategoryID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
				<Property Name="Description" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
				<Property Name="Picture" Type="Edm.Binary" MaxLength="Max" FixedLength="false" />\
				<NavigationProperty Name="Products" Relationship="NorthwindModel.FK_Products_Categories" ToRole="Products"\
					FromRole="Categories" />\
			</EntityType>\
			<EntityType Name="CustomerDemographic">\
				<Key>\
					<PropertyRef Name="CustomerTypeID" />\
				</Key>\
				<Property Name="CustomerTypeID" Type="Edm.String" Nullable="false" MaxLength="10" FixedLength="true"\
					Unicode="true" />\
				<Property Name="CustomerDesc" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Customers" Relationship="NorthwindModel.CustomerCustomerDemo" ToRole="Customers"\
					FromRole="CustomerDemographics" />\
			</EntityType>\
			<EntityType Name="Customer">\
				<Key>\
					<PropertyRef Name="CustomerID" />\
				</Key>\
				<Property Name="CustomerID" Type="Edm.String" Nullable="false" MaxLength="5" FixedLength="true" Unicode="true" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="ContactTitle" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<Property Name="Fax" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Customers" ToRole="Orders"\
					FromRole="Customers" />\
				<NavigationProperty Name="CustomerDemographics" Relationship="NorthwindModel.CustomerCustomerDemo"\
					ToRole="CustomerDemographics" FromRole="Customers" />\
			</EntityType>\
			<EntityType Name="Employee">\
				<Key>\
					<PropertyRef Name="EmployeeID" />\
				</Key>\
				<Property Name="EmployeeID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="LastName" Type="Edm.String" Nullable="false" MaxLength="20" FixedLength="false" Unicode="true" />\
				<Property Name="FirstName" Type="Edm.String" Nullable="false" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Title" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="TitleOfCourtesy" Type="Edm.String" MaxLength="25" FixedLength="false" Unicode="true" />\
				<Property Name="BirthDate" Type="Edm.DateTime" />\
				<Property Name="HireDate" Type="Edm.DateTime" />\
				<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="HomePhone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<Property Name="Extension" Type="Edm.String" MaxLength="4" FixedLength="false" Unicode="true" />\
				<Property Name="Photo" Type="Edm.Binary" MaxLength="Max" FixedLength="false" />\
				<Property Name="Notes" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
				<Property Name="ReportsTo" Type="Edm.Int32" />\
				<Property Name="PhotoPath" Type="Edm.String" MaxLength="255" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Employees1" Relationship="NorthwindModel.FK_Employees_Employees"\
					ToRole="Employees1" FromRole="Employees" />\
				<NavigationProperty Name="Employee1" Relationship="NorthwindModel.FK_Employees_Employees" ToRole="Employees"\
					FromRole="Employees1" />\
				<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Employees" ToRole="Orders"\
					FromRole="Employees" />\
				<NavigationProperty Name="Territories" Relationship="NorthwindModel.EmployeeTerritories" ToRole="Territories"\
					FromRole="Employees" />\
			</EntityType>\
			<EntityType Name="Order_Detail">\
				<Key>\
					<PropertyRef Name="OrderID" />\
					<PropertyRef Name="ProductID" />\
				</Key>\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
				<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
				<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
				<NavigationProperty Name="Order" Relationship="NorthwindModel.FK_Order_Details_Orders" ToRole="Orders"\
					FromRole="Order_Details" />\
				<NavigationProperty Name="Product" Relationship="NorthwindModel.FK_Order_Details_Products"\
					ToRole="Products" FromRole="Order_Details" />\
			</EntityType>\
			<EntityType Name="Order">\
				<Key>\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
				<Property Name="EmployeeID" Type="Edm.Int32" />\
				<Property Name="OrderDate" Type="Edm.DateTime" />\
				<Property Name="RequiredDate" Type="Edm.DateTime" />\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
				<Property Name="ShipVia" Type="Edm.Int32" />\
				<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Customer" Relationship="NorthwindModel.FK_Orders_Customers" ToRole="Customers"\
					FromRole="Orders" />\
				<NavigationProperty Name="Employee" Relationship="NorthwindModel.FK_Orders_Employees" ToRole="Employees"\
					FromRole="Orders" />\
				<NavigationProperty Name="Order_Details" Relationship="NorthwindModel.FK_Order_Details_Orders"\
					ToRole="Order_Details" FromRole="Orders" />\
				<NavigationProperty Name="Shipper" Relationship="NorthwindModel.FK_Orders_Shippers" ToRole="Shippers"\
					FromRole="Orders" />\
			</EntityType>\
			<EntityType Name="Product">\
				<Key>\
					<PropertyRef Name="ProductID" />\
				</Key>\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="SupplierID" Type="Edm.Int32" />\
				<Property Name="CategoryID" Type="Edm.Int32" />\
				<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="UnitsInStock" Type="Edm.Int16" />\
				<Property Name="UnitsOnOrder" Type="Edm.Int16" />\
				<Property Name="ReorderLevel" Type="Edm.Int16" />\
				<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
				<NavigationProperty Name="Category" Relationship="NorthwindModel.FK_Products_Categories" ToRole="Categories"\
					FromRole="Products" />\
				<NavigationProperty Name="Order_Details" Relationship="NorthwindModel.FK_Order_Details_Products"\
					ToRole="Order_Details" FromRole="Products" />\
				<NavigationProperty Name="Supplier" Relationship="NorthwindModel.FK_Products_Suppliers" ToRole="Suppliers"\
					FromRole="Products" />\
			</EntityType>\
			<EntityType Name="Region">\
				<Key>\
					<PropertyRef Name="RegionID" />\
				</Key>\
				<Property Name="RegionID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="RegionDescription" Type="Edm.String" Nullable="false" MaxLength="50" FixedLength="true"\
					Unicode="true" />\
				<NavigationProperty Name="Territories" Relationship="NorthwindModel.FK_Territories_Region"\
					ToRole="Territories" FromRole="Region" />\
			</EntityType>\
			<EntityType Name="Shipper">\
				<Key>\
					<PropertyRef Name="ShipperID" />\
				</Key>\
				<Property Name="ShipperID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Shippers" ToRole="Orders"\
					FromRole="Shippers" />\
			</EntityType>\
			<EntityType Name="Supplier">\
				<Key>\
					<PropertyRef Name="SupplierID" />\
				</Key>\
				<Property Name="SupplierID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="ContactTitle" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<Property Name="Fax" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<Property Name="HomePage" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Products" Relationship="NorthwindModel.FK_Products_Suppliers" ToRole="Products"\
					FromRole="Suppliers" />\
			</EntityType>\
			<EntityType Name="Territory">\
				<Key>\
					<PropertyRef Name="TerritoryID" />\
				</Key>\
				<Property Name="TerritoryID" Type="Edm.String" Nullable="false" MaxLength="20" FixedLength="false" Unicode="true" />\
				<Property Name="TerritoryDescription" Type="Edm.String" Nullable="false" MaxLength="50" FixedLength="true"\
					Unicode="true" />\
				<Property Name="RegionID" Type="Edm.Int32" Nullable="false" />\
				NavigationProperty Name="Region" Relationship="NorthwindModel.FK_Territories_Region" ToRole="Region"\
				FromRole="Territories" />\
				<NavigationProperty Name="Employees" Relationship="NorthwindModel.EmployeeTerritories" ToRole="Employees"\
					FromRole="Territories" />\
			</EntityType>\
			<EntityType Name="Alphabetical_list_of_product">\
				<Key>\
					<PropertyRef Name="CategoryName" />\
					<PropertyRef Name="Discontinued" />\
					<PropertyRef Name="ProductID" />\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="SupplierID" Type="Edm.Int32" />\
				<Property Name="CategoryID" Type="Edm.Int32" />\
				<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="UnitsInStock" Type="Edm.Int16" />\
				<Property Name="UnitsOnOrder" Type="Edm.Int16" />\
				<Property Name="ReorderLevel" Type="Edm.Int16" />\
				<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
			</EntityType>\
			<EntityType Name="Category_Sales_for_1997">\
				<Key>\
					<PropertyRef Name="CategoryName" />\
				</Key>\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
				<Property Name="CategorySales" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Current_Product_List">\
				<Key>\
					<PropertyRef Name="ProductID" />\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
			</EntityType>\
			<EntityType Name="Customer_and_Suppliers_by_City">\
				<Key>\
					<PropertyRef Name="CompanyName" />\
					<PropertyRef Name="Relationship" />\
				</Key>\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="Relationship" Type="Edm.String" Nullable="false" MaxLength="9" FixedLength="false" Unicode="false" />\
			</EntityType>\
			<EntityType Name="Invoice">\
				<Key>\
					<PropertyRef Name="CustomerName" />\
					<PropertyRef Name="Discount" />\
					<PropertyRef Name="OrderID" />\
					<PropertyRef Name="ProductID" />\
					<PropertyRef Name="ProductName" />\
					<PropertyRef Name="Quantity" />\
					<PropertyRef Name="Salesperson" />\
					<PropertyRef Name="ShipperName" />\
					<PropertyRef Name="UnitPrice" />\
				</Key>\
				<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
				<Property Name="CustomerName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false"\
					Unicode="true" />\
				<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Salesperson" Type="Edm.String" Nullable="false" MaxLength="31" FixedLength="false" Unicode="true" />\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="OrderDate" Type="Edm.DateTime" />\
				<Property Name="RequiredDate" Type="Edm.DateTime" />\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
				<Property Name="ShipperName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
				<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
				<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
				<Property Name="ExtendedPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Order_Details_Extended">\
				<Key>\
					<PropertyRef Name="Discount" />\
					<PropertyRef Name="OrderID" />\
					<PropertyRef Name="ProductID" />\
					<PropertyRef Name="ProductName" />\
					<PropertyRef Name="Quantity" />\
					<PropertyRef Name="UnitPrice" />\
				</Key>\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
				<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
				<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
				<Property Name="ExtendedPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Order_Subtotal">\
				<Key>\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Orders_Qry">\
				<Key>\
					<PropertyRef Name="CompanyName" />\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
				<Property Name="EmployeeID" Type="Edm.Int32" />\
				<Property Name="OrderDate" Type="Edm.DateTime" />\
				<Property Name="RequiredDate" Type="Edm.DateTime" />\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
				<Property Name="ShipVia" Type="Edm.Int32" />\
				<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
			</EntityType>\
			<EntityType Name="Product_Sales_for_1997">\
				<Key>\
					<PropertyRef Name="CategoryName" />\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
				Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ProductSales" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Products_Above_Average_Price">\
				<Key>\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Products_by_Category">\
				<Key>\
					<PropertyRef Name="CategoryName" />\
					<PropertyRef Name="Discontinued" />\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
				<Property Name="UnitsInStock" Type="Edm.Int16" />\
				<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
			</EntityType>\
			<EntityType Name="Sales_by_Category">\
				<Key>\
					<PropertyRef Name="CategoryID" />\
					<PropertyRef Name="CategoryName" />\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="CategoryID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ProductSales" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Sales_Totals_by_Amount">\
				<Key>\
					<PropertyRef Name="CompanyName" />\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="SaleAmount" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
			</EntityType>\
			<EntityType Name="Summary_of_Sales_by_Quarter">\
				<Key>\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Summary_of_Sales_by_Year">\
				<Key>\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<Association Name="FK_Products_Categories">\
				<End Type="NorthwindModel.Category" Role="Categories" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Product" Role="Products" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Categories">\
						<PropertyRef Name="CategoryID" />\
					</Principal>\
					<Dependent Role="Products">\
						<PropertyRef Name="CategoryID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="CustomerCustomerDemo">\
				<End Type="NorthwindModel.Customer" Role="Customers" Multiplicity="*" />\
				<End Type="NorthwindModel.CustomerDemographic" Role="CustomerDemographics" Multiplicity="*" />\
			</Association>\
			<Association Name="FK_Orders_Customers">\
				<End Type="NorthwindModel.Customer" Role="Customers" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Customers">\
						<PropertyRef Name="CustomerID" />\
					</Principal>\
					<Dependent Role="Orders">\
						<PropertyRef Name="CustomerID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="FK_Employees_Employees">\
				<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Employee" Role="Employees1" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Employees">\
						<PropertyRef Name="EmployeeID" />\
					</Principal>\
					<Dependent Role="Employees1">\
						<PropertyRef Name="ReportsTo" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="FK_Orders_Employees">\
				<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Employees">\
						<PropertyRef Name="EmployeeID" />\
					</Principal>\
					<Dependent Role="Orders">\
						<PropertyRef Name="EmployeeID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="EmployeeTerritories">\
				<End Type="NorthwindModel.Territory" Role="Territories" Multiplicity="*" />\
				<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="*" />\
			</Association>\
			<Association Name="FK_Order_Details_Orders">\
				<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="1" />\
				<End Type="NorthwindModel.Order_Detail" Role="Order_Details" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Orders">\
						<PropertyRef Name="OrderID" />\
					</Principal>\
					<Dependent Role="Order_Details">\
						<PropertyRef Name="OrderID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="FK_Order_Details_Products">\
				<End Type="NorthwindModel.Product" Role="Products" Multiplicity="1" />\
				<End Type="NorthwindModel.Order_Detail" Role="Order_Details" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Products">\
						<PropertyRef Name="ProductID" />\
					</Principal>\
					<Dependent Role="Order_Details">\
						<PropertyRef Name="ProductID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="FK_Orders_Shippers">\
				<End Type="NorthwindModel.Shipper" Role="Shippers" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Shippers">\
						<PropertyRef Name="ShipperID" />\
					</Principal>\
					<Dependent Role="Orders">\
						<PropertyRef Name="ShipVia" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="FK_Products_Suppliers">\
				<End Type="NorthwindModel.Supplier" Role="Suppliers" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Product" Role="Products" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Suppliers">\
						<PropertyRef Name="SupplierID" />\
					</Principal>\
					<Dependent Role="Products">\
						<PropertyRef Name="SupplierID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="FK_Territories_Region">\
				<End Type="NorthwindModel.Region" Role="Region" Multiplicity="1" />\
				<End Type="NorthwindModel.Territory" Role="Territories" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Region">\
						<PropertyRef Name="RegionID" />\
					</Principal>\
					<Dependent Role="Territories">\
						<PropertyRef Name="RegionID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<EntityContainer Name="FunctionImports">\
				<FunctionImport Name="functionWithInvalidTarget" m:HttpMethod="POST">\
				</FunctionImport>\
				<FunctionImport Name="functionWithInvalidReturnType" ReturnType="InvalidReturnType" m:HttpMethod="POST">\
				</FunctionImport>\
				<FunctionImport Name="functionWithInvalidEntitySet" EntitySet="InvalidEntitySet" m:HttpMethod="POST">\
				</FunctionImport>\
			</EntityContainer>\
		</Schema>\
		<Schema Namespace="ODataWebV3.Northwind.Model" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
			<EntityContainer Name="NorthwindEntities" m:IsDefaultEntityContainer="true" p6:LazyLoadingEnabled="true"\
				xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation">\
				<EntitySet Name="Categories" EntityType="NorthwindModel.Category" />\
				<EntitySet Name="CustomerDemographics" EntityType="NorthwindModel.CustomerDemographic" />\
				<EntitySet Name="Customers" EntityType="NorthwindModel.Customer" />\
				<EntitySet Name="Employees" EntityType="NorthwindModel.Employee" />\
				<EntitySet Name="Order_Details" EntityType="NorthwindModel.Order_Detail" />\
				<EntitySet Name="Orders" EntityType="NorthwindModel.Order" />\
				<EntitySet Name="Products" EntityType="NorthwindModel.Product" />\
				<EntitySet Name="Regions" EntityType="NorthwindModel.Region" />\
				<EntitySet Name="Shippers" EntityType="NorthwindModel.Shipper" />\
				<EntitySet Name="Suppliers" EntityType="NorthwindModel.Supplier" />\
				<EntitySet Name="Territories" EntityType="NorthwindModel.Territory" />\
				<EntitySet Name="Alphabetical_list_of_products" EntityType="NorthwindModel.Alphabetical_list_of_product" />\
				<EntitySet Name="Category_Sales_for_1997" EntityType="NorthwindModel.Category_Sales_for_1997" />\
				<EntitySet Name="Current_Product_Lists" EntityType="NorthwindModel.Current_Product_List" />\
				<EntitySet Name="Customer_and_Suppliers_by_Cities" EntityType="NorthwindModel.Customer_and_Suppliers_by_City" />\
				<EntitySet Name="Invoices" EntityType="NorthwindModel.Invoice" />\
				<EntitySet Name="Order_Details_Extendeds" EntityType="NorthwindModel.Order_Details_Extended" />\
				<EntitySet Name="Order_Subtotals" EntityType="NorthwindModel.Order_Subtotal" />\
				<EntitySet Name="Orders_Qries" EntityType="NorthwindModel.Orders_Qry" />\
				<EntitySet Name="Product_Sales_for_1997" EntityType="NorthwindModel.Product_Sales_for_1997" />\
				<EntitySet Name="Products_Above_Average_Prices" EntityType="NorthwindModel.Products_Above_Average_Price" />\
				<EntitySet Name="Products_by_Categories" EntityType="NorthwindModel.Products_by_Category" />\
				<EntitySet Name="Sales_by_Categories" EntityType="NorthwindModel.Sales_by_Category" />\
				<EntitySet Name="Sales_Totals_by_Amounts" EntityType="NorthwindModel.Sales_Totals_by_Amount" />\
				<EntitySet Name="Summary_of_Sales_by_Quarters" EntityType="NorthwindModel.Summary_of_Sales_by_Quarter" />\
				<EntitySet Name="Summary_of_Sales_by_Years" EntityType="NorthwindModel.Summary_of_Sales_by_Year" />\
				<AssociationSet Name="FK_Products_Categories" Association="NorthwindModel.FK_Products_Categories">\
					<End Role="Categories" EntitySet="Categories" />\
					<End Role="Products" EntitySet="Products" />\
				</AssociationSet>\
				<AssociationSet Name="CustomerCustomerDemo" Association="NorthwindModel.CustomerCustomerDemo">\
					<End Role="CustomerDemographics" EntitySet="CustomerDemographics" />\
					<End Role="Customers" EntitySet="Customers" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Orders_Customers" Association="NorthwindModel.FK_Orders_Customers">\
					<End Role="Customers" EntitySet="Customers" />\
					<End Role="Orders" EntitySet="Orders" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Employees_Employees" Association="NorthwindModel.FK_Employees_Employees">\
					<End Role="Employees" EntitySet="Employees" />\
					<End Role="Employees1" EntitySet="Employees" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Orders_Employees" Association="NorthwindModel.FK_Orders_Employees">\
					<End Role="Employees" EntitySet="Employees" />\
					<End Role="Orders" EntitySet="Orders" />\
				</AssociationSet>\
				<AssociationSet Name="EmployeeTerritories" Association="NorthwindModel.EmployeeTerritories">\
					<End Role="Employees" EntitySet="Employees" />\
					<End Role="Territories" EntitySet="Territories" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Order_Details_Orders" Association="NorthwindModel.FK_Order_Details_Orders">\
					<End Role="Order_Details" EntitySet="Order_Details" />\
					<End Role="Orders" EntitySet="Orders" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Order_Details_Products" Association="NorthwindModel.FK_Order_Details_Products">\
					<End Role="Order_Details" EntitySet="Order_Details" />\
					<End Role="Products" EntitySet="Products" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Orders_Shippers" Association="NorthwindModel.FK_Orders_Shippers">\
					<End Role="Orders" EntitySet="Orders" />\
					<End Role="Shippers" EntitySet="Shippers" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Products_Suppliers" Association="NorthwindModel.FK_Products_Suppliers">\
					<End Role="Products" EntitySet="Products" />\
					<End Role="Suppliers" EntitySet="Suppliers" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Territories_Region" Association="NorthwindModel.FK_Territories_Region">\
					<End Role="Region" EntitySet="Regions" />\
					<End Role="Territories" EntitySet="Territories" />\
				</AssociationSet>\
			</EntityContainer>\
		</Schema>\
	</edmx:DataServices>\
</edmx:Edmx>';

mPredefinedServiceResponses.functionImportMain = '\
<?xml version="1.0" encoding="utf-8"?>\
<app:service xml:lang="en"\
	xml:base="https://https:/sap/opu/odata/sap/SEPMRA_PROD_MAN/" xmlns:app="http://www.w3.org/2007/app"\
	xmlns:atom="http://www.w3.org/2005/Atom"\
	xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"\
	xmlns:sap="http://www.sap.com/Protocols/SAPData">\
	<app:workspace>\
		<atom:title type="text">Data</atom:title>\
		<app:collection sap:creatable="false" sap:updatable="false"\
			sap:deletable="false" sap:searchable="true" sap:content-version="1"\
			href="DimensionUnits">\
			<atom:title type="text">DimensionUnits</atom:title>\
			<sap:member-title>DimensionUnit</sap:member-title>\
			<atom:link href="DimensionUnits/OpenSearchDescription.xml"\
				rel="search" type="application/opensearchdescription+xml" title="searchDimensionUnits" />\
		</app:collection>\
		<app:collection sap:creatable="false" sap:updatable="false"\
			sap:deletable="false" sap:searchable="true" sap:content-version="1"\
			href="QuantityUnits">\
			<atom:title type="text">QuantityUnits</atom:title>\
			<sap:member-title>QuantityUnit</sap:member-title>\
			<atom:link href="QuantityUnits/OpenSearchDescription.xml"\
				rel="search" type="application/opensearchdescription+xml" title="searchQuantityUnits" />\
		</app:collection>\
		<app:collection sap:creatable="false" sap:updatable="false"\
			sap:deletable="false" sap:searchable="true" sap:content-version="1"\
			href="WeightUnits">\
			<atom:title type="text">WeightUnits</atom:title>\
			<sap:member-title>WeightUnit</sap:member-title>\
			<atom:link href="WeightUnits/OpenSearchDescription.xml"\
				rel="search" type="application/opensearchdescription+xml" title="searchWeightUnits" />\
		</app:collection>\
		<app:collection sap:creatable="false" sap:updatable="false"\
			sap:deletable="false" sap:searchable="true" sap:content-version="1"\
			href="Suppliers">\
			<atom:title type="text">Suppliers</atom:title>\
			<sap:member-title>Supplier</sap:member-title>\
			<atom:link href="Suppliers/OpenSearchDescription.xml" rel="search"\
				type="application/opensearchdescription+xml" title="searchSuppliers" />\
		</app:collection>\
		<app:collection sap:searchable="true"\
			sap:content-version="1" href="Products">\
			<atom:title type="text">Products</atom:title>\
			<sap:member-title>Product</sap:member-title>\
			<atom:link href="Products/OpenSearchDescription.xml" rel="search"\
				type="application/opensearchdescription+xml" title="searchProducts" />\
		</app:collection>\
		<app:collection sap:creatable="false" sap:updatable="false"\
			sap:deletable="false" sap:searchable="true" sap:addressable="false"\
			sap:content-version="1" href="DraftAdministrativeData">\
			<atom:title type="text">DraftAdministrativeData</atom:title>\
			<sap:member-title>DraftAdministrativeData</sap:member-title>\
			<atom:link href="DraftAdministrativeData/OpenSearchDescription.xml"\
				rel="search" type="application/opensearchdescription+xml" title="searchDraftAdministrativeData" />\
		</app:collection>\
		<app:collection sap:searchable="true" sap:addressable="false"\
			sap:content-version="1" href="Attachments">\
			<atom:title type="text">Attachments</atom:title>\
			<sap:member-title>Attachment</sap:member-title>\
			<atom:link href="Attachments/OpenSearchDescription.xml"\
				rel="search" type="application/opensearchdescription+xml" title="searchAttachments" />\
		</app:collection>\
		<app:collection sap:creatable="false" sap:updatable="false"\
			sap:deletable="false" sap:pageable="false" sap:addressable="false"\
			sap:content-version="1" href="ProductCategories">\
			<atom:title type="text">ProductCategories</atom:title>\
			<sap:member-title>ProductCategory</sap:member-title>\
		</app:collection>\
		<app:collection sap:creatable="false" sap:updatable="false"\
			sap:deletable="false" sap:pageable="false" sap:addressable="false"\
			sap:content-version="1" href="MainProductCategories">\
			<atom:title type="text">MainProductCategories</atom:title>\
			<sap:member-title>MainProductCategory</sap:member-title>\
		</app:collection>\
		<app:collection sap:creatable="false" sap:updatable="false"\
			sap:deletable="false" sap:searchable="true" sap:content-version="1"\
			href="SalesDataSet">\
			<atom:title type="text">SalesDataSet</atom:title>\
			<sap:member-title>SalesData</sap:member-title>\
			<atom:link href="SalesDataSet/OpenSearchDescription.xml"\
				rel="search" type="application/opensearchdescription+xml" title="searchSalesDataSet" />\
		</app:collection>\
		<app:collection sap:creatable="false" sap:updatable="false"\
			sap:deletable="false" sap:searchable="true" sap:content-version="1"\
			href="Currencies">\
			<atom:title type="text">Currencies</atom:title>\
			<sap:member-title>Currency</sap:member-title>\
			<atom:link href="Currencies/OpenSearchDescription.xml" rel="search"\
				type="application/opensearchdescription+xml" title="searchCurrencies" />\
		</app:collection>\
	</app:workspace>\
	<atom:link rel="self"\
		href="https://https:/sap/opu/odata/sap/SEPMRA_PROD_MAN/" />\
	<atom:link rel="latest-version"\
		href="https://https:/sap/opu/odata/sap/SEPMRA_PROD_MAN/" />\
</app:service>';

mPredefinedServiceResponses.functionImportMetadata = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0"\
	xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"\
	xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"\
	xmlns:sap="http://www.sap.com/Protocols/SAPData">\
	<edmx:Reference\
		Uri="https://https:/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName=\'%2FIWBEP%2FVOC_COMMON\',Version=\'0001\',SAP__Origin=\'LOCAL\')/$value"\
		xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" />\
	<edmx:DataServices m:DataServiceVersion="2.0">\
		<Schema Namespace="SEPMRA_PROD_MAN" xml:lang="en"\
			sap:schema-version="1" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
			<EntityType Name="Currency" sap:content-version="1">\
				<Key>\
					<PropertyRef Name="Code" />\
				</Key>\
				<Property Name="Code" Type="Edm.String" Nullable="false"\
					MaxLength="5" sap:label="Currency" sap:creatable="false"\
					sap:updatable="false" sap:semantics="currency-code" />\
				<Property Name="Text" Type="Edm.String" Nullable="false"\
					MaxLength="15" sap:label="Short text" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="LongText" Type="Edm.String" Nullable="false"\
					MaxLength="40" sap:label="Long Text" sap:creatable="false"\
					sap:updatable="false" />\
			</EntityType>\
			<EntityType Name="DimensionUnit" sap:content-version="1">\
				<Key>\
					<PropertyRef Name="Unit" />\
				</Key>\
				<Property Name="Dimension" Type="Edm.String" Nullable="false"\
					MaxLength="6" sap:label="Dimension" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="ISOCode" Type="Edm.String" Nullable="false"\
					MaxLength="3" sap:label="ISO code" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="Unit" Type="Edm.String" Nullable="false"\
					MaxLength="3" sap:label="Int. meas. unit" sap:creatable="false"\
					sap:updatable="false" sap:semantics="unit-of-measure" />\
				<Property Name="CommercialName" Type="Edm.String" Nullable="false"\
					MaxLength="3" sap:label="Commercial" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="ShortText" Type="Edm.String" Nullable="false"\
					MaxLength="10" sap:label="Meas. unit text" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="TechnicalName" Type="Edm.String" Nullable="false"\
					MaxLength="6" sap:label="Technical" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="Text" Type="Edm.String" Nullable="false"\
					MaxLength="30" sap:label="Unit text" sap:creatable="false"\
					sap:updatable="false" />\
			</EntityType>\
			<EntityType Name="QuantityUnit" sap:content-version="1">\
				<Key>\
					<PropertyRef Name="Unit" />\
				</Key>\
				<Property Name="Dimension" Type="Edm.String" Nullable="false"\
					MaxLength="6" sap:label="Dimension" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="ISOCode" Type="Edm.String" Nullable="false"\
					MaxLength="3" sap:label="ISO code" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="Unit" Type="Edm.String" Nullable="false"\
					MaxLength="3" sap:label="Int. meas. unit" sap:creatable="false"\
					sap:updatable="false" sap:semantics="unit-of-measure" />\
				<Property Name="CommercialName" Type="Edm.String" Nullable="false"\
					MaxLength="3" sap:label="Commercial" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="ShortText" Type="Edm.String" Nullable="false"\
					MaxLength="10" sap:label="Meas. unit text" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="TechnicalName" Type="Edm.String" Nullable="false"\
					MaxLength="6" sap:label="Technical" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="Text" Type="Edm.String" Nullable="false"\
					MaxLength="30" sap:label="Unit text" sap:creatable="false"\
					sap:updatable="false" />\
			</EntityType>\
			<EntityType Name="WeightUnit" sap:content-version="1">\
				<Key>\
					<PropertyRef Name="Unit" />\
				</Key>\
				<Property Name="Dimension" Type="Edm.String" Nullable="false"\
					MaxLength="6" sap:label="Dimension" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="ISOCode" Type="Edm.String" Nullable="false"\
					MaxLength="3" sap:label="ISO code" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="Unit" Type="Edm.String" Nullable="false"\
					MaxLength="3" sap:label="Int. meas. unit" sap:creatable="false"\
					sap:updatable="false" sap:semantics="unit-of-measure" />\
				<Property Name="CommercialName" Type="Edm.String" Nullable="false"\
					MaxLength="3" sap:label="Commercial" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="ShortText" Type="Edm.String" Nullable="false"\
					MaxLength="10" sap:label="Meas. unit text" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="TechnicalName" Type="Edm.String" Nullable="false"\
					MaxLength="6" sap:label="Technical" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="Text" Type="Edm.String" Nullable="false"\
					MaxLength="30" sap:label="Unit text" sap:creatable="false"\
					sap:updatable="false" />\
			</EntityType>\
			<EntityType Name="Supplier" sap:content-version="1">\
				<Key>\
					<PropertyRef Name="SupplierUUID" />\
				</Key>\
				<Property Name="SupplierUUID" Type="Edm.Guid" Nullable="false"\
					sap:label="Busi. Partner UUID" sap:creatable="false" sap:updatable="false"\
					sap:filterable="false" />\
				<Property Name="SupplierId" Type="Edm.String" Nullable="false"\
					MaxLength="10" sap:label="Business Partner ID" sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="Name" Type="Edm.String" Nullable="false"\
					MaxLength="80" sap:label="Supplier" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="EmailAddress" Type="Edm.String" Nullable="false"\
					MaxLength="255" sap:label="E-Mail" sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="FaxNumber" Type="Edm.String" Nullable="false"\
					MaxLength="30" sap:label="Phone No." sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="PhoneNumber" Type="Edm.String" Nullable="false"\
					MaxLength="30" sap:label="Phone No." sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="Url" Type="Edm.String" Nullable="false"\
					sap:label="URI" sap:creatable="false" sap:updatable="false"\
					sap:filterable="false" />\
				<Property Name="FormattedAddress" Type="Edm.String"\
					Nullable="false" MaxLength="164" sap:label="Address" sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="FormattedContactName" Type="Edm.String"\
					Nullable="false" MaxLength="88" sap:label="Contact Name"\
					sap:creatable="false" sap:updatable="false" sap:filterable="false" />\
				<Property Name="ContactPhone1" Type="Edm.String" Nullable="false"\
					MaxLength="30" sap:label="Phone No." sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="ContactPhone2" Type="Edm.String" Nullable="false"\
					MaxLength="30" sap:label="Phone No." sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="ContactEmail" Type="Edm.String" Nullable="false"\
					MaxLength="255" sap:label="E-Mail" sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
			</EntityType>\
			<EntityType Name="Product" sap:content-version="1">\
				<Key>\
					<PropertyRef Name="ProductUUID" />\
				</Key>\
				<Property Name="ExclusiveBy" Type="Edm.String" Nullable="false"\
					MaxLength="12" sap:label="Exclusive For" sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="IsDraft" Type="Edm.Boolean" Nullable="false"\
					sap:label="Is Draft" sap:creatable="false" sap:updatable="false"\
					sap:sortable="false" sap:filterable="false" />\
				<Property Name="HasTwin" Type="Edm.Boolean" Nullable="false"\
					sap:label="Has Twin" sap:creatable="false" sap:updatable="false"\
					sap:sortable="false" sap:filterable="false" />\
				<Property Name="ProductUUID" Type="Edm.Guid" Nullable="false"\
					sap:label="Node Key" sap:creatable="false" sap:updatable="false"\
					sap:filterable="false" />\
				<Property Name="ExclusiveSince" Type="Edm.DateTime"\
					Precision="7" sap:label="Exclusive Since" sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="SupplierUUID" Type="Edm.Guid" sap:label="Node Key"\
					sap:creatable="false" sap:updatable="false" sap:filterable="false" />\
				<Property Name="SupplierId" Type="Edm.String" MaxLength="10"\
					sap:label="Supplier" sap:creatable="false" />\
				<Property Name="ProductId" Type="Edm.String" Nullable="false"\
					MaxLength="10" sap:label="Product ID" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="ProductType" Type="Edm.String" Nullable="false"\
					MaxLength="2" sap:label="Type Code" sap:creatable="false" />\
				<Property Name="ProductTypeName" Type="Edm.String"\
					Nullable="false" MaxLength="60" sap:label="Short Descript."\
					sap:creatable="false" sap:updatable="false" sap:filterable="false" />\
				<Property Name="Category" Type="Edm.String" Nullable="false"\
					MaxLength="40" sap:label="Category" sap:creatable="false" />\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false"\
					MaxLength="40" sap:label="Category" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="MainCategory" Type="Edm.String" Nullable="false"\
					MaxLength="40" sap:label="Main Category" sap:creatable="false" />\
				<Property Name="MainCategoryName" Type="Edm.String"\
					Nullable="false" MaxLength="40" sap:label="Main Category"\
					sap:creatable="false" sap:updatable="false" />\
				<Property Name="Name" Type="Edm.String" Nullable="false"\
					MaxLength="255" sap:label="Name" />\
				<Property Name="Description" Type="Edm.String" Nullable="false"\
					MaxLength="255" sap:label="Description" sap:filterable="false" />\
				<Property Name="Price" Type="Edm.Decimal" Nullable="false"\
					Precision="15" Scale="2" sap:unit="Currency" sap:label="Price" />\
				<Property Name="Currency" Type="Edm.String" Nullable="false"\
					MaxLength="5" sap:label="Currency Code" sap:creatable="false"\
					sap:semantics="currency-code" />\
				<Property Name="ValueAddedTax" Type="Edm.Int32" Nullable="false"\
					sap:filterable="false" />\
				<Property Name="ValueAddedTaxName" Type="Edm.String"\
					Nullable="false" MaxLength="60" sap:label="Short Descript."\
					sap:creatable="false" sap:updatable="false" sap:filterable="false" />\
				<Property Name="HeightInDimensionUnit" Type="Edm.Decimal"\
					Nullable="false" Precision="13" Scale="3" sap:unit="DimensionUnit"\
					sap:label="Height" sap:creatable="false" sap:filterable="false" />\
				<Property Name="WidthInDimensionUnit" Type="Edm.Decimal"\
					Nullable="false" Precision="13" Scale="3" sap:unit="DimensionUnit"\
					sap:label="Width" sap:creatable="false" sap:filterable="false" />\
				<Property Name="LengthInDimensionUnit" Type="Edm.Decimal"\
					Nullable="false" Precision="13" Scale="3" sap:unit="DimensionUnit"\
					sap:label="Depth" sap:creatable="false" sap:filterable="false" />\
				<Property Name="DimensionUnit" Type="Edm.String" Nullable="false"\
					MaxLength="3" sap:label="Dimension Unit" sap:creatable="false"\
					sap:filterable="false" sap:semantics="unit-of-measure" />\
				<Property Name="DimensionUnitName" Type="Edm.String"\
					Nullable="false" MaxLength="10" sap:label="Meas. unit text"\
					sap:creatable="false" sap:updatable="false" sap:filterable="false" />\
				<Property Name="Weight" Type="Edm.Decimal" Nullable="false"\
					Precision="13" Scale="3" sap:unit="WeightUnit" sap:label="Weight"\
					sap:filterable="false" />\
				<Property Name="WeightUnit" Type="Edm.String" Nullable="false"\
					MaxLength="3" sap:label="Unit of Measure" sap:creatable="false"\
					sap:filterable="false" sap:semantics="unit-of-measure" />\
				<Property Name="WeightUnitName" Type="Edm.String" Nullable="false"\
					MaxLength="10" sap:label="Meas. unit text" sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="StockQuantityInBaseUnit" Type="Edm.Decimal"\
					Nullable="false" Precision="13" Scale="3" sap:unit="BaseUnit"\
					sap:label="Stock Quantity" />\
				<Property Name="BaseUnit" Type="Edm.String" Nullable="false"\
					MaxLength="3" sap:label="Unit of Measure" sap:creatable="false"\
					sap:filterable="false" sap:semantics="unit-of-measure" />\
				<Property Name="BaseUnitName" Type="Edm.String" Nullable="false"\
					MaxLength="10" sap:label="Meas. unit text" sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="ImageUrl" Type="Edm.String" Nullable="false"\
					MaxLength="255" sap:label="Image" sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="AverageRating" Type="Edm.Decimal" Nullable="false"\
					Precision="4" Scale="2" sap:label="Average Rating" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="NumberOfRatings" Type="Edm.Int32" Nullable="false"\
					sap:label="Number of Reviews" sap:creatable="false" sap:updatable="false" />\
				<Property Name="SupplierName" Type="Edm.String" MaxLength="80"\
					sap:label="Supplier" sap:creatable="false" sap:updatable="false" />\
				<Property Name="EditState" Type="Edm.Int32" Nullable="false"\
					sap:creatable="false" sap:updatable="false" />\
				<NavigationProperty Name="SalesDataSet"\
					Relationship="SEPMRA_PROD_MAN.Product2SalesData" FromRole="FromRole_Product2SalesData"\
					ToRole="ToRole_Product2SalesData" />\
				<NavigationProperty Name="ProductCategory"\
					Relationship="SEPMRA_PROD_MAN.Product2ProductCategory" FromRole="ToRole_Product2ProductCategory"\
					ToRole="FromRole_Product2ProductCategory" />\
				<NavigationProperty Name="Attachments"\
					Relationship="SEPMRA_PROD_MAN.Product2Attachment" FromRole="FromRole_Product2Attachment"\
					ToRole="ToRole_Product2Attachment" />\
				<NavigationProperty Name="Supplier"\
					Relationship="SEPMRA_PROD_MAN.Product2Supplier" FromRole="ToRole_Product2Supplier"\
					ToRole="FromRole_Product2Supplier" />\
				<NavigationProperty Name="DraftAdministrativeData"\
					Relationship="SEPMRA_PROD_MAN.Product2DraftAdministrativeData"\
					FromRole="ToRole_Product2DraftAdministrativeData" ToRole="FromRole_Product2DraftAdministrativeData" />\
				<NavigationProperty Name="TwinEntity"\
					Relationship="SEPMRA_PROD_MAN.Product2TwinEntity" FromRole="FromRole_Product2TwinEntity"\
					ToRole="ToRole_Product2TwinEntity" />\
			</EntityType>\
			<EntityType Name="DraftAdministrativeData"\
				sap:content-version="1">\
				<Key>\
					<PropertyRef Name="DraftEntityUUID" />\
				</Key>\
				<Property Name="DraftEntityUUID" Type="Edm.Guid" Nullable="false"\
					sap:label="Draft Document UUID" sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="EditState" Type="Edm.Byte" Nullable="false"\
					sap:label="Edit State" sap:creatable="false" sap:updatable="false"\
					sap:filterable="false" />\
				<Property Name="CreatedAt" Type="Edm.DateTime" Nullable="false"\
					Precision="7" sap:label="Created" sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="CreatedBy" Type="Edm.String" Nullable="false"\
					MaxLength="12" sap:label="Created by" sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="ChangedAt" Type="Edm.DateTime" Precision="7"\
					sap:label="Last Changed" sap:creatable="false" sap:updatable="false"\
					sap:filterable="false" />\
				<Property Name="ChangedBy" Type="Edm.String" Nullable="false"\
					MaxLength="12" sap:label="Last Changed by" sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="ExclusiveBy" Type="Edm.String" Nullable="false"\
					MaxLength="12" sap:label="Exclusive For" sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
				<Property Name="ExclusiveSince" Type="Edm.DateTime"\
					Precision="7" sap:label="Exclusive Since" sap:creatable="false"\
					sap:updatable="false" sap:filterable="false" />\
			</EntityType>\
			<EntityType Name="Attachment" m:HasStream="true"\
				sap:content-version="1">\
				<Key>\
					<PropertyRef Name="ActiveAttachmentObjectUUID" />\
					<PropertyRef Name="ActiveAttachmentId" />\
					<PropertyRef Name="DraftAttachmentUUID" />\
				</Key>\
				<Property Name="ActiveAttachmentObjectUUID" Type="Edm.Guid"\
					Nullable="false" sap:creatable="false" sap:updatable="false" />\
				<Property Name="ActiveAttachmentId" Type="Edm.String"\
					Nullable="false" MaxLength="70" sap:label="Instance ID"\
					sap:creatable="false" sap:updatable="false" />\
				<Property Name="DraftAttachmentUUID" Type="Edm.Guid"\
					Nullable="false" sap:creatable="false" sap:updatable="false" />\
				<Property Name="Type" Type="Edm.String" Nullable="false"\
					MaxLength="3" sap:label="File extension" sap:creatable="false"\
					sap:updatable="false" sap:sortable="false" sap:filterable="false" />\
				<Property Name="FileName" Type="Edm.String" Nullable="false"\
					MaxLength="255" sap:creatable="false" sap:updatable="false"\
					sap:sortable="false" sap:filterable="false" />\
				<Property Name="MimeType" Type="Edm.String" Nullable="false"\
					MaxLength="100" sap:creatable="false" sap:updatable="false"\
					sap:sortable="false" sap:filterable="false" />\
				<Property Name="CreatedBy" Type="Edm.String" Nullable="false"\
					MaxLength="136" sap:creatable="false" sap:updatable="false" />\
				<Property Name="CreatedAt" Type="Edm.DateTime" Nullable="false"\
					Precision="7" sap:label="Created" sap:creatable="false"\
					sap:updatable="false" sap:sortable="false" sap:filterable="false" />\
				<Property Name="ChangedBy" Type="Edm.String" Nullable="false"\
					MaxLength="136" sap:creatable="false" sap:updatable="false" />\
				<Property Name="ChangedAt" Type="Edm.DateTime" Nullable="false"\
					Precision="7" sap:label="Last Changed" sap:creatable="false"\
					sap:updatable="false" sap:sortable="false" sap:filterable="false" />\
				<Property Name="EditState" Type="Edm.Byte" Nullable="false"\
					sap:creatable="false" sap:updatable="false" />\
			</EntityType>\
			<EntityType Name="ProductCategory" sap:content-version="1">\
				<Key>\
					<PropertyRef Name="Id" />\
				</Key>\
				<Property Name="Id" Type="Edm.String" Nullable="false"\
					MaxLength="40" sap:label="Category" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="Name" Type="Edm.String" Nullable="false"\
					MaxLength="40" sap:label="Category" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="MainCategoryId" Type="Edm.String" Nullable="false"\
					MaxLength="40" sap:label="Main Category" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="MainCategoryName" Type="Edm.String"\
					Nullable="false" MaxLength="40" sap:label="Main Category"\
					sap:creatable="false" sap:updatable="false" />\
				<NavigationProperty Name="MainCategory"\
					Relationship="SEPMRA_PROD_MAN.MainProductCategory2ProductCategory"\
					FromRole="ToRole_MainProductCategory2ProductCategory" ToRole="FromRole_MainProductCategory2ProductCategory" />\
			</EntityType>\
			<EntityType Name="MainProductCategory"\
				sap:content-version="1">\
				<Key>\
					<PropertyRef Name="Id" />\
				</Key>\
				<Property Name="Id" Type="Edm.String" Nullable="false"\
					MaxLength="40" sap:label="Main Category" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="Name" Type="Edm.String" Nullable="false"\
					MaxLength="40" sap:label="Main Category" sap:creatable="false"\
					sap:updatable="false" />\
				<NavigationProperty Name="Categories"\
					Relationship="SEPMRA_PROD_MAN.MainProductCategory2ProductCategory"\
					FromRole="FromRole_MainProductCategory2ProductCategory" ToRole="ToRole_MainProductCategory2ProductCategory" />\
			</EntityType>\
			<EntityType Name="SalesData" sap:content-version="1">\
				<Key>\
					<PropertyRef Name="ProductUUID" />\
				</Key>\
				<Property Name="ProductUUID" Type="Edm.Guid" Nullable="false"\
					sap:label="Node Key" sap:creatable="false" sap:updatable="false"\
					sap:filterable="false" />\
				<Property Name="ProductId" Type="Edm.String" Nullable="false"\
					MaxLength="10" sap:label="Product ID" sap:creatable="false"\
					sap:updatable="false" />\
				<Property Name="DeliveryYear" Type="Edm.String" Nullable="false"\
					MaxLength="4" sap:label="Delivery Year" sap:creatable="false"\
					sap:updatable="false" sap:sortable="false" sap:filterable="false" />\
				<Property Name="DeliveryMonthName" Type="Edm.String"\
					Nullable="false" MaxLength="10" sap:label="Delivery Month"\
					sap:creatable="false" sap:updatable="false" sap:sortable="false"\
					sap:filterable="false" />\
				<Property Name="DeliveryDateTime" Type="Edm.DateTime"\
					Nullable="false" Precision="0" sap:label="Delivery Date"\
					sap:creatable="false" sap:updatable="false" />\
				<Property Name="Revenue" Type="Edm.Decimal" Nullable="false"\
					Precision="15" Scale="2" sap:label="Revenue" sap:creatable="false"\
					sap:updatable="false" sap:sortable="false" sap:filterable="false" />\
			</EntityType>\
			<Association Name="Product2DraftAdministrativeData"\
				sap:content-version="1">\
				<End Type="SEPMRA_PROD_MAN.DraftAdministrativeData"\
					Multiplicity="0..1" Role="FromRole_Product2DraftAdministrativeData" />\
				<End Type="SEPMRA_PROD_MAN.Product" Multiplicity="1"\
					Role="ToRole_Product2DraftAdministrativeData" />\
			</Association>\
			<Association Name="Product2Supplier" sap:content-version="1">\
				<End Type="SEPMRA_PROD_MAN.Supplier" Multiplicity="1"\
					Role="FromRole_Product2Supplier" />\
				<End Type="SEPMRA_PROD_MAN.Product" Multiplicity="*"\
					Role="ToRole_Product2Supplier" />\
				<ReferentialConstraint>\
					<Principal Role="FromRole_Product2Supplier">\
						<PropertyRef Name="SupplierUUID" />\
					</Principal>\
					<Dependent Role="ToRole_Product2Supplier">\
						<PropertyRef Name="SupplierUUID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="Product2TwinEntity"\
				sap:content-version="1">\
				<End Type="SEPMRA_PROD_MAN.Product" Multiplicity="0..1"\
					Role="FromRole_Product2TwinEntity" />\
				<End Type="SEPMRA_PROD_MAN.Product" Multiplicity="0..1"\
					Role="ToRole_Product2TwinEntity" />\
			</Association>\
			<Association Name="Product2Attachment"\
				sap:content-version="1">\
				<End Type="SEPMRA_PROD_MAN.Product" Multiplicity="1"\
					Role="FromRole_Product2Attachment" />\
				<End Type="SEPMRA_PROD_MAN.Attachment" Multiplicity="*"\
					Role="ToRole_Product2Attachment" />\
			</Association>\
			<Association Name="Product2SalesData"\
				sap:content-version="1">\
				<End Type="SEPMRA_PROD_MAN.Product" Multiplicity="1"\
					Role="FromRole_Product2SalesData" />\
				<End Type="SEPMRA_PROD_MAN.SalesData" Multiplicity="*"\
					Role="ToRole_Product2SalesData" />\
			</Association>\
			<Association Name="Product2ProductCategory"\
				sap:content-version="1">\
				<End Type="SEPMRA_PROD_MAN.ProductCategory" Multiplicity="1"\
					Role="FromRole_Product2ProductCategory" />\
				<End Type="SEPMRA_PROD_MAN.Product" Multiplicity="*"\
					Role="ToRole_Product2ProductCategory" />\
				<ReferentialConstraint>\
					<Principal Role="FromRole_Product2ProductCategory">\
						<PropertyRef Name="Id" />\
					</Principal>\
					<Dependent Role="ToRole_Product2ProductCategory">\
						<PropertyRef Name="Category" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="MainProductCategory2ProductCategory"\
				sap:content-version="1">\
				<End Type="SEPMRA_PROD_MAN.MainProductCategory" Multiplicity="1"\
					Role="FromRole_MainProductCategory2ProductCategory" />\
				<End Type="SEPMRA_PROD_MAN.ProductCategory" Multiplicity="*"\
					Role="ToRole_MainProductCategory2ProductCategory" />\
				<ReferentialConstraint>\
					<Principal Role="FromRole_MainProductCategory2ProductCategory">\
						<PropertyRef Name="Id" />\
					</Principal>\
					<Dependent Role="ToRole_MainProductCategory2ProductCategory">\
						<PropertyRef Name="MainCategoryId" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<EntityContainer Name="SEPMRA_PROD_MAN_Entities"\
				m:IsDefaultEntityContainer="true" sap:supported-formats="atom json xlsx">\
				<EntitySet Name="DimensionUnits" EntityType="SEPMRA_PROD_MAN.DimensionUnit"\
					sap:creatable="false" sap:updatable="false" sap:deletable="false"\
					sap:searchable="true" sap:content-version="1" />\
				<EntitySet Name="QuantityUnits" EntityType="SEPMRA_PROD_MAN.QuantityUnit"\
					sap:creatable="false" sap:updatable="false" sap:deletable="false"\
					sap:searchable="true" sap:content-version="1" />\
				<EntitySet Name="WeightUnits" EntityType="SEPMRA_PROD_MAN.WeightUnit"\
					sap:creatable="false" sap:updatable="false" sap:deletable="false"\
					sap:searchable="true" sap:content-version="1" />\
				<EntitySet Name="Suppliers" EntityType="SEPMRA_PROD_MAN.Supplier"\
					sap:creatable="false" sap:updatable="false" sap:deletable="false"\
					sap:searchable="true" sap:content-version="1" />\
				<EntitySet Name="Products" EntityType="SEPMRA_PROD_MAN.Product"\
					sap:searchable="true" sap:content-version="1" />\
				<EntitySet Name="DraftAdministrativeData" EntityType="SEPMRA_PROD_MAN.DraftAdministrativeData"\
					sap:creatable="false" sap:updatable="false" sap:deletable="false"\
					sap:searchable="true" sap:addressable="false" sap:content-version="1" />\
				<EntitySet Name="Attachments" EntityType="SEPMRA_PROD_MAN.Attachment"\
					sap:searchable="true" sap:addressable="false" sap:content-version="1" />\
				<EntitySet Name="ProductCategories" EntityType="SEPMRA_PROD_MAN.ProductCategory"\
					sap:creatable="false" sap:updatable="false" sap:deletable="false"\
					sap:pageable="false" sap:addressable="false" sap:content-version="1" />\
				<EntitySet Name="MainProductCategories" EntityType="SEPMRA_PROD_MAN.MainProductCategory"\
					sap:creatable="false" sap:updatable="false" sap:deletable="false"\
					sap:pageable="false" sap:addressable="false" sap:content-version="1" />\
				<EntitySet Name="SalesDataSet" EntityType="SEPMRA_PROD_MAN.SalesData"\
					sap:creatable="false" sap:updatable="false" sap:deletable="false"\
					sap:searchable="true" sap:content-version="1" />\
				<EntitySet Name="Currencies" EntityType="SEPMRA_PROD_MAN.Currency"\
					sap:creatable="false" sap:updatable="false" sap:deletable="false"\
					sap:searchable="true" sap:content-version="1" />\
				<AssociationSet Name="MainProductCategory2ProductCategorySet"\
					Association="SEPMRA_PROD_MAN.MainProductCategory2ProductCategory"\
					sap:creatable="false" sap:updatable="false" sap:deletable="false"\
					sap:content-version="1">\
					<End EntitySet="MainProductCategories" Role="FromRole_MainProductCategory2ProductCategory" />\
					<End EntitySet="ProductCategories" Role="ToRole_MainProductCategory2ProductCategory" />\
				</AssociationSet>\
				<AssociationSet Name="Product2DraftAdministrativeDataSet"\
					Association="SEPMRA_PROD_MAN.Product2DraftAdministrativeData"\
					sap:creatable="false" sap:updatable="false" sap:deletable="false"\
					sap:content-version="1">\
					<End EntitySet="DraftAdministrativeData" Role="FromRole_Product2DraftAdministrativeData" />\
					<End EntitySet="Products" Role="ToRole_Product2DraftAdministrativeData" />\
				</AssociationSet>\
				<AssociationSet Name="Product2SalesDataSet"\
					Association="SEPMRA_PROD_MAN.Product2SalesData" sap:creatable="false"\
					sap:updatable="false" sap:deletable="false" sap:content-version="1">\
					<End EntitySet="Products" Role="FromRole_Product2SalesData" />\
					<End EntitySet="SalesDataSet" Role="ToRole_Product2SalesData" />\
				</AssociationSet>\
				<AssociationSet Name="Product2SupplierSet"\
					Association="SEPMRA_PROD_MAN.Product2Supplier" sap:creatable="false"\
					sap:updatable="false" sap:deletable="false" sap:content-version="1">\
					<End EntitySet="Suppliers" Role="FromRole_Product2Supplier" />\
					<End EntitySet="Products" Role="ToRole_Product2Supplier" />\
				</AssociationSet>\
				<AssociationSet Name="Product2AttachmentSet"\
					Association="SEPMRA_PROD_MAN.Product2Attachment" sap:creatable="false"\
					sap:updatable="false" sap:deletable="false" sap:content-version="1">\
					<End EntitySet="Products" Role="FromRole_Product2Attachment" />\
					<End EntitySet="Attachments" Role="ToRole_Product2Attachment" />\
				</AssociationSet>\
				<AssociationSet Name="Product2ProductCategorySet"\
					Association="SEPMRA_PROD_MAN.Product2ProductCategory"\
					sap:creatable="false" sap:updatable="false" sap:deletable="false"\
					sap:content-version="1">\
					<End EntitySet="ProductCategories" Role="FromRole_Product2ProductCategory" />\
					<End EntitySet="Products" Role="ToRole_Product2ProductCategory" />\
				</AssociationSet>\
				<AssociationSet Name="Product2TwinEntitySet"\
					Association="SEPMRA_PROD_MAN.Product2TwinEntity" sap:creatable="false"\
					sap:updatable="false" sap:deletable="false" sap:content-version="1">\
					<End EntitySet="Products" Role="FromRole_Product2TwinEntity" />\
					<End EntitySet="Products" Role="ToRole_Product2TwinEntity" />\
				</AssociationSet>\
				<FunctionImport Name="ActivateProduct" ReturnType="SEPMRA_PROD_MAN.Product"\
					EntitySet="Products" m:HttpMethod="POST" sap:action-for="SEPMRA_PROD_MAN.Product">\
					<Parameter Name="ProductUUID" Type="Edm.Guid" Mode="In" />\
				</FunctionImport>\
				<FunctionImport Name="CopyProduct" ReturnType="SEPMRA_PROD_MAN.Product"\
					EntitySet="Products" m:HttpMethod="POST" sap:action-for="SEPMRA_PROD_MAN.Product">\
					<Parameter Name="ProductUUID" Type="Edm.Guid" Mode="In" />\
				</FunctionImport>\
				<FunctionImport Name="EditProduct" ReturnType="SEPMRA_PROD_MAN.Product"\
					EntitySet="Products" m:HttpMethod="POST" sap:action-for="SEPMRA_PROD_MAN.Product">\
					<Parameter Name="ProductUUID" Type="Edm.Guid" Mode="In" />\
				</FunctionImport>\
				<FunctionImport Name="ActionForFunction" ReturnType="SEPMRA_PROD_MAN.Category"\
					EntitySet="Categories" m:HttpMethod="POST" sap:action-for="SEPMRA_PROD_MAN.Supplier">\
					<Parameter Name="SupplierUUID" Type="Edm.Guid" Mode="In" />\
				</FunctionImport>\
			</EntityContainer>\
			<Annotations Target="SEPMRA_PROD_MAN.Product/SupplierName"\
				xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotation Term="com.sap.vocabularies.Common.v1.ValueList">\
					<Record>\
						<PropertyValue Property="CollectionPath" String="Suppliers" />\
						<PropertyValue Property="SearchSupported" Bool="true" />\
						<PropertyValue Property="Parameters">\
							<Collection>\
								<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut">\
									<PropertyValue Property="LocalDataProperty"\
										PropertyPath="SupplierName" />\
									<PropertyValue Property="ValueListProperty"\
										String="Name" />\
								</Record>\
								<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterOut">\
									<PropertyValue Property="LocalDataProperty"\
										PropertyPath="SupplierUUID" />\
									<PropertyValue Property="ValueListProperty"\
										String="SupplierUUID" />\
								</Record>\
								<Record\
									Type="com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly">\
									<PropertyValue Property="ValueListProperty"\
										String="FormattedAddress" />\
								</Record>\
							</Collection>\
						</PropertyValue>\
					</Record>\
				</Annotation>\
			</Annotations>\
			<Annotations Target="SEPMRA_PROD_MAN.Product/SupplierId"\
				xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotation Term="com.sap.vocabularies.Common.v1.ValueList">\
					<Record>\
						<PropertyValue Property="CollectionPath" String="Suppliers" />\
						<PropertyValue Property="SearchSupported" Bool="true" />\
						<PropertyValue Property="Parameters">\
							<Collection>\
								<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut">\
									<PropertyValue Property="LocalDataProperty"\
										PropertyPath="SupplierId" />\
									<PropertyValue Property="ValueListProperty"\
										String="SupplierId" />\
								</Record>\
								<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterOut">\
									<PropertyValue Property="LocalDataProperty"\
										PropertyPath="SupplierName" />\
									<PropertyValue Property="ValueListProperty"\
										String="Name" />\
								</Record>\
								<Record\
									Type="com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly">\
									<PropertyValue Property="ValueListProperty"\
										String="FormattedAddress" />\
								</Record>\
							</Collection>\
						</PropertyValue>\
					</Record>\
				</Annotation>\
			</Annotations>\
			<Annotations Target="SEPMRA_PROD_MAN.Product/Currency"\
				xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotation Term="com.sap.vocabularies.Common.v1.ValueList">\
					<Record>\
						<PropertyValue Property="CollectionPath" String="Currencies" />\
						<PropertyValue Property="SearchSupported" Bool="true" />\
						<PropertyValue Property="Parameters">\
							<Collection>\
								<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut">\
									<PropertyValue Property="LocalDataProperty"\
										PropertyPath="Currency" />\
									<PropertyValue Property="ValueListProperty"\
										String="Code" />\
								</Record>\
								<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterOut">\
									<PropertyValue Property="LocalDataProperty"\
										PropertyPath="Currency" />\
									<PropertyValue Property="ValueListProperty"\
										String="Code" />\
								</Record>\
								<Record\
									Type="com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly">\
									<PropertyValue Property="ValueListProperty"\
										String="Text" />\
								</Record>\
							</Collection>\
						</PropertyValue>\
					</Record>\
				</Annotation>\
			</Annotations>\
			<Annotations Target="SEPMRA_PROD_MAN.Product/BaseUnit"\
				xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotation Term="com.sap.vocabularies.Common.v1.ValueList">\
					<Record>\
						<PropertyValue Property="CollectionPath" String="QuantityUnits" />\
						<PropertyValue Property="SearchSupported" Bool="true" />\
						<PropertyValue Property="Parameters">\
							<Collection>\
								<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut">\
									<PropertyValue Property="LocalDataProperty"\
										PropertyPath="BaseUnit" />\
									<PropertyValue Property="ValueListProperty"\
										String="Unit" />\
								</Record>\
								<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterOut">\
									<PropertyValue Property="LocalDataProperty"\
										PropertyPath="BaseUnitName" />\
									<PropertyValue Property="ValueListProperty"\
										String="Text" />\
								</Record>\
							</Collection>\
						</PropertyValue>\
					</Record>\
				</Annotation>\
			</Annotations>\
			<Annotations Target="SEPMRA_PROD_MAN.Product/WeightUnit"\
				xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotation Term="com.sap.vocabularies.Common.v1.ValueList">\
					<Record>\
						<PropertyValue Property="CollectionPath" String="WeightUnits" />\
						<PropertyValue Property="SearchSupported" Bool="true" />\
						<PropertyValue Property="Parameters">\
							<Collection>\
								<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut">\
									<PropertyValue Property="LocalDataProperty"\
										PropertyPath="WeightUnit" />\
									<PropertyValue Property="ValueListProperty"\
										String="Unit" />\
								</Record>\
								<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterOut">\
									<PropertyValue Property="LocalDataProperty"\
										PropertyPath="WeightUnitName" />\
									<PropertyValue Property="ValueListProperty"\
										String="Text" />\
								</Record>\
							</Collection>\
						</PropertyValue>\
					</Record>\
				</Annotation>\
			</Annotations>\
			<Annotations Target="SEPMRA_PROD_MAN.Product/DimensionUnit"\
				xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotation Term="com.sap.vocabularies.Common.v1.ValueList">\
					<Record>\
						<PropertyValue Property="CollectionPath" String="DimensionUnits" />\
						<PropertyValue Property="SearchSupported" Bool="true" />\
						<PropertyValue Property="Parameters">\
							<Collection>\
								<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut">\
									<PropertyValue Property="LocalDataProperty"\
										PropertyPath="DimensionUnit" />\
									<PropertyValue Property="ValueListProperty"\
										String="ISOCode" />\
								</Record>\
								<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterOut">\
									<PropertyValue Property="LocalDataProperty"\
										PropertyPath="DimensionUnitName" />\
									<PropertyValue Property="ValueListProperty"\
										String="Text" />\
								</Record>\
							</Collection>\
						</PropertyValue>\
					</Record>\
				</Annotation>\
			</Annotations>\
			<Annotations Target="SEPMRA_PROD_MAN.Product/MainCategory"\
				xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotation Term="com.sap.vocabularies.Common.v1.ValueList">\
					<Record>\
						<PropertyValue Property="CollectionPath" String="MainProductCategories" />\
						<PropertyValue Property="SearchSupported" Bool="true" />\
						<PropertyValue Property="Parameters">\
							<Collection>\
								<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut">\
									<PropertyValue Property="LocalDataProperty"\
										PropertyPath="MainCategory" />\
									<PropertyValue Property="ValueListProperty"\
										String="Id" />\
								</Record>\
							</Collection>\
						</PropertyValue>\
					</Record>\
				</Annotation>\
			</Annotations>\
			<Annotations Target="SEPMRA_PROD_MAN.Product/Category"\
				xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotation Term="com.sap.vocabularies.Common.v1.ValueList">\
					<Record>\
						<PropertyValue Property="CollectionPath" String="ProductCategories" />\
						<PropertyValue Property="SearchSupported" Bool="true" />\
						<PropertyValue Property="Parameters">\
							<Collection>\
								<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut">\
									<PropertyValue Property="LocalDataProperty"\
										PropertyPath="Category" />\
									<PropertyValue Property="ValueListProperty"\
										String="Id" />\
								</Record>\
								<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterIn">\
									<PropertyValue Property="LocalDataProperty"\
										PropertyPath="MainCategory" />\
									<PropertyValue Property="ValueListProperty"\
										String="MainCategoryId" />\
								</Record>\
							</Collection>\
						</PropertyValue>\
					</Record>\
				</Annotation>\
			</Annotations>\
			<Annotations Target="SEPMRA_PROD_MAN.SEPMRA_PROD_MAN_Entities/Products"\
				xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotation Term="com.sap.vocabularies.Common.v1.DraftRoot">\
					<Record>\
						<PropertyValue Property="ActivationAction"\
							String="SEPMRA_PROD_MAN.SEPMRA_PROD_MAN_Entities/ActivateProduct" />\
						<PropertyValue Property="EditAction"\
							String="SEPMRA_PROD_MAN.SEPMRA_PROD_MAN_Entities/EditProduct" />\
					</Record>\
				</Annotation>\
			</Annotations>\
			<Annotations Target="SEPMRA_PROD_MAN.Product"\
				xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotation Term="com.sap.vocabularies.Common.v1.SemanticKey">\
					<Collection>\
						<PropertyPath>ProductId</PropertyPath>\
					</Collection>\
				</Annotation>\
			</Annotations>\
			<Annotations Target="SEPMRA_PROD_MAN.SEPMRA_PROD_MAN_Entities/Attachment"\
				xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotation Term="com.sap.vocabularies.Common.v1.DraftActivationVia">\
					<Collection>\
						<String>SEPMRA_PROD_MAN.SEPMRA_PROD_MAN_Entities/Products</String>\
					</Collection>\
				</Annotation>\
			</Annotations>\
			<Annotations Target="SEPMRA_PROD_MAN.Supplier"\
				xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotation Term="com.sap.vocabularies.Common.v1.SemanticKey">\
					<Collection>\
						<PropertyPath>SupplierId</PropertyPath>\
					</Collection>\
				</Annotation>\
			</Annotations>\
			<atom:link rel="self"\
				href="https://https:/sap/opu/odata/sap/SEPMRA_PROD_MAN/$metadata"\
				xmlns:atom="http://www.w3.org/2005/Atom" />\
			<atom:link rel="latest-version"\
				href="https://https:/sap/opu/odata/sap/SEPMRA_PROD_MAN/$metadata"\
				xmlns:atom="http://www.w3.org/2005/Atom" />\
		</Schema>\
	</edmx:DataServices>\
</edmx:Edmx>';


mPredefinedServiceResponses.functionImportProduct1 = '\
<?xml version="1.0" encoding="utf-8"?>\
<entry xml:base="https://https:/sap/opu/odata/sap/SEPMRA_PROD_MAN/"\
	xmlns="http://www.w3.org/2005/Atom" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"\
	xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices">\
	<id>https://https:/sap/opu/odata/sap/SEPMRA_PROD_MAN/Products(guid\'005056A7-004E-1ED4-BCD3-08AB3F15C97E\')\
	</id>\
	<title type="text">Products(guid\'005056A7-004E-1ED4-BCD3-08AB3F15C97E\')\
	</title>\
	<updated>2015-05-05T09:05:16Z</updated>\
	<category term="SEPMRA_PROD_MAN.Product"\
		scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
	<link href="Products(guid\'005056A7-004E-1ED4-BCD3-08AB3F15C97E\')"\
		rel="edit" title="Product" />\
	<link\
		href="Products(guid\'005056A7-004E-1ED4-BCD3-08AB3F15C97E\')/SalesDataSet"\
		rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/SalesDataSet"\
		type="application/atom+xml;type=feed" title="SalesDataSet" />\
	<link\
		href="Products(guid\'005056A7-004E-1ED4-BCD3-08AB3F15C97E\')/ProductCategory"\
		rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/ProductCategory"\
		type="application/atom+xml;type=entry" title="ProductCategory" />\
	<link\
		href="Products(guid\'005056A7-004E-1ED4-BCD3-08AB3F15C97E\')/Attachments"\
		rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Attachments"\
		type="application/atom+xml;type=feed" title="Attachments" />\
	<link href="Products(guid\'005056A7-004E-1ED4-BCD3-08AB3F15C97E\')/Supplier"\
		rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier"\
		type="application/atom+xml;type=entry" title="Supplier" />\
	<link\
		href="Products(guid\'005056A7-004E-1ED4-BCD3-08AB3F15C97E\')/DraftAdministrativeData"\
		rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/DraftAdministrativeData"\
		type="application/atom+xml;type=entry" title="DraftAdministrativeData" />\
	<link href="Products(guid\'005056A7-004E-1ED4-BCD3-08AB3F15C97E\')/TwinEntity"\
		rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/TwinEntity"\
		type="application/atom+xml;type=entry" title="TwinEntity" />\
	<content type="application/xml">\
		<m:properties>\
			<d:ExclusiveBy />\
			<d:IsDraft>false</d:IsDraft>\
			<d:HasTwin>false</d:HasTwin>\
			<d:ProductUUID>005056A7-004E-1ED4-BCD3-08AB3F15C97E</d:ProductUUID>\
			<d:ExclusiveSince m:null="true" />\
			<d:SupplierUUID>005056A7-004E-1ED4-BCD3-08AB3ED0C97E</d:SupplierUUID>\
			<d:SupplierId>100000000</d:SupplierId>\
			<d:ProductId>HT-1000</d:ProductId>\
			<d:ProductType>PR</d:ProductType>\
			<d:ProductTypeName>Product</d:ProductTypeName>\
			<d:Category>Notebooks</d:Category>\
			<d:CategoryName>Notebooks</d:CategoryName>\
			<d:MainCategory>Computer Systems</d:MainCategory>\
			<d:MainCategoryName>Computer Systems</d:MainCategoryName>\
			<d:Name>Notebook Basic 15</d:Name>\
			<d:Description>Notebook Basic 15 with 2,80 GHz quad core, 15" LCD, 4\
				GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro</d:Description>\
			<d:Price>956.00</d:Price>\
			<d:Currency>USD</d:Currency>\
			<d:ValueAddedTax>1</d:ValueAddedTax>\
			<d:ValueAddedTaxName>Regular VAT</d:ValueAddedTaxName>\
			<d:HeightInDimensionUnit>3.000</d:HeightInDimensionUnit>\
			<d:WidthInDimensionUnit>30.000</d:WidthInDimensionUnit>\
			<d:LengthInDimensionUnit>18.000</d:LengthInDimensionUnit>\
			<d:DimensionUnit>CM</d:DimensionUnit>\
			<d:DimensionUnitName>cm</d:DimensionUnitName>\
			<d:Weight>4.200</d:Weight>\
			<d:WeightUnit>KG</d:WeightUnit>\
			<d:WeightUnitName>kg</d:WeightUnitName>\
			<d:StockQuantityInBaseUnit>145</d:StockQuantityInBaseUnit>\
			<d:BaseUnit>EA</d:BaseUnit>\
			<d:BaseUnitName>each</d:BaseUnitName>\
			<d:ImageUrl>/sap/public/bc/NWDEMO_MODEL/IMAGES/HT-1000.jpg\
			</d:ImageUrl>\
			<d:AverageRating>3.33</d:AverageRating>\
			<d:NumberOfRatings>3</d:NumberOfRatings>\
			<d:SupplierName>SAP</d:SupplierName>\
			<d:EditState>0</d:EditState>\
		</m:properties>\
	</content>\
</entry>';


mPredefinedServiceResponses.technicalError400Xml = '\
<?xml version="1.0" encoding="utf-8"?>\
<error xmlns="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">\
	<code>/BOBF/FRW_COMMON/118</code>\
	<message xml:lang="en">Field "SALESORDERID" cannot be changed since it is read only</message>\
	<innererror>\
		<transactionid>55025622675C2E69E10000000A4450F0</transactionid>\
		<timestamp>20150318080838.2106030</timestamp>\
		<Error_Resolution>\
			<SAP_Transaction>Run transaction /IWFND/ERROR_LOG on SAP NW Gateway hub system and search for entries with the timestamp above for more details</SAP_Transaction>\
			<SAP_Note>See SAP Note 1797736 for error analysis (https://service.sap.com/sap/support/notes/1797736)</SAP_Note>\
			<Batch_SAP_Note>See SAP Note 1869434 for details about working with $batch (https://service.sap.com/sap/support/notes/1869434)</Batch_SAP_Note>\
		</Error_Resolution>\
		<errordetails>\
			<errordetail>\
				<code>/BOBF/FRW_COMMON/118</code>\
				<message>Field "SALESORDERID" cannot be changed since it is read only</message>\
				<propertyref></propertyref>\
				<severity>error</severity>\
				<target></target>\
				<longtext_url>/sap/opu/odata/iwbep/message_text;o=G1Y_400_BEP/T100_longtexts(MSGID=\'%2FIWBEP%2FCM_TEA\',MSGNO=\'010\',MESSAGE_V1=\'RAISE_BUSI_EXCEPTION_DETAILS\',MESSAGE_V2=\'\',MESSAGE_V3=\'\',MESSAGE_V4=\'\')/$value</longtext_url>\
			</errordetail>\
			<errordetail>\
				<code>/IWBEP/CX_MGW_BUSI_EXCEPTION</code>\
				<message>Some other error</message>\
				<propertyref></propertyref>\
				<severity>error</severity>\
				<target></target>\
				<longtext_url>/sap/opu/odata/iwbep/message_text;o=G1Y_400_BEP/T100_longtexts(MSGID=\'%2FIWBEP%2FCM_TEA\',MSGNO=\'010\',MESSAGE_V1=\'RAISE_BUSI_EXCEPTION_DETAILS\',MESSAGE_V2=\'\',MESSAGE_V3=\'\',MESSAGE_V4=\'\')/$value</longtext_url>\
			</errordetail>\
		</errordetails>\
	</innererror>\
</error>';


mPredefinedServiceResponses.technicalError500Xml = mPredefinedServiceResponses.technicalError400Xml;

mPredefinedServiceResponses.technicalError400Json = '\
{\
	"error": {\
		"code": "/BOBF/FRW_COMMON/118",\
		"message": {\
			"lang": "en",\
			"value": "Field \\"SALESORDERID\\" cannot be changed since it is read only"\
		},\
		"innererror": {\
			"transactionid": "55025622675C2E69E10000000A4450F0",\
			"timestamp": "20150318080838.2106030",\
			"Error_Resolution": {\
				"SAP_Transaction": "Run transaction /IWFND/ERROR_LOG on SAP NW Gateway hub system and search for entries with the timestamp above for more details",\
				"SAP_Note": "See SAP Note 1797736 for error analysis (https://service.sap.com/sap/support/notes/1797736)",\
				"Batch_SAP_Note": "See SAP Note 1869434 for details about working with $batch (https://service.sap.com/sap/support/notes/1869434)"\
			},\
			"errordetails": [{\
				"code": "/BOBF/FRW_COMMON/118",\
				"message": "Field \\"SALESORDERID\\" cannot be changed since it is read only",\
				"propertyref": "",\
				"severity": "error",\
				"target": "",\
				"longtext_url": "/sap/opu/odata/iwbep/message_text;o=G1Y_400_BEP/T100_longtexts(MSGID=\'%2FIWBEP%2FCM_TEA\',MSGNO=\'010\',MESSAGE_V1=\'RAISE_BUSI_EXCEPTION_DETAILS\',MESSAGE_V2=\'\',MESSAGE_V3=\'\',MESSAGE_V4=\'\')/$value"\
			}, {\
				"code": "/IWBEP/CX_MGW_BUSI_EXCEPTION",\
				"message": "Some other error",\
				"propertyref": "",\
				"severity": "error",\
				"target": "",\
				"longtext_url": "/sap/opu/odata/iwbep/message_text;o=G1Y_400_BEP/T100_longtexts(MSGID=\'%2FIWBEP%2FCM_TEA\',MSGNO=\'010\',MESSAGE_V1=\'RAISE_BUSI_EXCEPTION_DETAILS\',MESSAGE_V2=\'\',MESSAGE_V3=\'\',MESSAGE_V4=\'\')/$value"\
			}]\
		}\
	}\
}';

mPredefinedServiceResponses.technicalError500Json = mPredefinedServiceResponses.technicalError400Json;

mPredefinedServiceResponses.technicalError400Json2 = '\
{\
	"error": {\
		"code": "SY/530",\
		"message": {\
			"lang": "en",\
			"value": "Warning"\
		},\
		"innererror": {\
			"transactionid": "5570DDCFC85D6352E10000000A445279",\
			"timestamp": "20150610070411.9523060",\
			"Error_Resolution": {\
				"SAP_Transaction": "Run transaction /IWFND/ERROR_LOG on SAP NW Gateway hub system and search for entries with the timestamp above for more details",\
				"SAP_Note": "See SAP Note 1797736 for error analysis (https://service.sap.com/sap/support/notes/1797736)",\
				"Batch_SAP_Note": "See SAP Note 1869434 for details about working with $batch (https://service.sap.com/sap/support/notes/1869434)"\
			},\
			"errordetails": [{\
				"code": "",\
				"message": "Multiple error/warning messages",\
				"propertyref": "",\
				"severity": "error",\
				"target": "Property"\
			}, {\
				"code": "",\
				"message": "Inner error",\
				"propertyref": "",\
				"severity": "error",\
				"target": "Message"\
			}, {\
				"code": "",\
				"message": "Inner error 2",\
				"propertyref": "",\
				"severity": "error",\
				"target": "Type"\
			}, {\
				"code": "",\
				"message": "Warning",\
				"propertyref": "",\
				"severity": "warning",\
				"target": "Type"\
			},{\
				"code": "/IWBEP/CX_MGW_BUSI_EXCEPTION",\
				"message": "Business Error with details in TEA application",\
				"propertyref": "",\
				"severity": "error",\
				"target":""\
			}]\
		}\
	}\
}';
mPredefinedServiceResponses.expandedData =

mPredefinedServiceResponses.technicalError400Xml2 = '\
<?xml version="1.0" encoding="utf-8"?>\
<error xmlns="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">\
	<code>SY/530</code>\
	<message xml:lang="en">Warning</message>\
	<innererror>\
		<transactionid>55755400750A3A92E10000000A445279</transactionid>\
		<timestamp>20150610072313.5174130</timestamp>\
		<Error_Resolution>\
			<SAP_Transaction>Run transaction /IWFND/ERROR_LOG on SAP NW Gateway hub system and search for entries with the timestamp above for more details</SAP_Transaction>\
			<SAP_Note>See SAP Note 1797736 for error analysis (https://service.sap.com/sap/support/notes/1797736)</SAP_Note>\
		</Error_Resolution>\
		<errordetails>\
			<errordetail>\
				<code/>\
				<message>Multiple error/warning messages</message>\
				<propertyref/>\
				<severity>error</severity>\
				<target>Property</target>\
			</errordetail>\
			<errordetail>\
				<code/>\
				<message>Inner error</message>\
				<propertyref/>\
				<severity>error</severity>\
				<target>Message</target>\
			</errordetail>\
			<errordetail>\
				<code/>\
				<message>Inner error 2</message>\
				<propertyref/>\
				<severity>error</severity>\
				<target>Type</target>\
			</errordetail>\
			<errordetail>\
				<code/>\
				<message>Warning</message>\
				<propertyref/>\
				<severity>warning</severity>\
				<target>Type</target>\
			</errordetail>\
			<errordetail>\
				<code>/IWBEP/CX_MGW_BUSI_EXCEPTION</code>\
				<message>Business Error with details in TEA application</message>\
				<propertyref/>\
				<severity>error</severity>\
				<target/>\
			</errordetail>\
		</errordetails>\
	</innererror>\
</error>';

mPredefinedServiceResponses.ProductsExpandSupplier = '\
{\
"d" : {\
"__metadata": {\
"uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)", "type": "NorthwindModel.Product"\
}\, "ProductID": 1, "ProductName": "Chai", "SupplierID": 1, "CategoryID": 1, "QuantityPerUnit": "10 boxes x 20 bags", "UnitPrice": "18.0000", "UnitsInStock": 39, "UnitsOnOrder": 0, "ReorderLevel": 10, "Discontinued": false, "Category": {\
"__deferred": {\
"uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)/Category"\
}\
}\, "Order_Details": {\
"__deferred": {\
"uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)/Order_Details"\
}\
}\, "Supplier": {\
"__metadata": {\
"uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(1)", "type": "NorthwindModel.Supplier"\
}\, "SupplierID": 1, "CompanyName": "Exotic Liquids", "ContactName": "Charlotte Cooper", "ContactTitle": "Purchasing Manager", "Address": "49 Gilbert St.", "City": "London", "Region": null, "PostalCode": "EC1 4SD", "Country": "UK", "Phone": "(171) 555-2222", "Fax": null, "HomePage": null, "Products": {\
"__deferred": {\
"uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(1)/Products"\
}\
}\
}\
}\
}';
});