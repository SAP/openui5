sap.ui.define([
	'jquery.sap.global',
	'sap/ui/thirdparty/sinon'
], function (jQuery, sinon) {
	"use strict";

	var oSandbox = sinon.sandbox.create();

	return {

		start : function () {
			var aUsers,
				sMetadata,
				sBaseUrl = "http://services.odata.org/TripPinRESTierService/(S(euc2jaq2ryeoswu4hs4unp33))/",
				// Need to escape the brackets in the base URL for using it in a RegExp
				sEscapedBaseUrl = sBaseUrl.replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\./g, "\\."),
				rBaseUrl = new RegExp(sEscapedBaseUrl);

			function readData() {
				var oResult;

				// Read metadata file
				oResult = jQuery.sap.sjax({
					url : "./localService/metadata.xml",
					dataType : "text"
				});
				if (!oResult.success) {
					throw new Error("'./localService/metadata.xml'" + ": resource not found");
				} else {
					sMetadata = oResult.data;
				}

				oResult = jQuery.sap.sjax({
					url : "./localService/mockdata/people.json",
					dataType : "text"
				});
				if (!oResult.success) {
					throw new Error("'./localService/mockdata/people.json'" + ": resource not found");
				} else {
					aUsers = JSON.parse(oResult.data).value;
				}
			}

			function applySkipTop(oXhr, aResultSet) {
				var iSkip,
					iTop,
					aReducedUsers = [].concat(aResultSet),
					aMatches = oXhr.url.match(/\$skip=(\d+)&\$top=(\d+)/);

				if (aMatches && aMatches.length && aMatches.length >= 3) {
					iSkip = aMatches[1];
					iTop = aMatches[2];
					return aResultSet.slice(iSkip, iSkip + iTop);
				}

				return aReducedUsers;
			}

			function applySort(oXhr, aResultSet) {
				var sFieldName,
					sDirection,
					aSortedUsers = [].concat(aResultSet), // work with a copy
					aMatches = oXhr.url.match(/\$orderby=(\w*)(?:\%20(\w*))?/);

				if (!aMatches || !aMatches.length || aMatches.length < 2) {
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

			function applyFilter(oXhr, aResultSet) {
				var sFieldName,
					sQuery,
					aFilteredUsers = [].concat(aResultSet), // work with a copy
					aMatches = oXhr.url.match(/\$filter\=.*\((.*),'(.*)'\)/);

				// If the request contains a filter command, apply the filter
				if (aMatches && aMatches.length && aMatches.length >= 3) {
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

			function getMetadataResponse() {
				return [
					200,
					{
						"Content-Type" : "application/xml",
						"odata-version" : "4.0"
					}, sMetadata
				];
			}

			function getCountResponse() {
				return [
					200,
					{
						"Content-Type" : "text/plain;charset=UTF-8;IEEE754Compatible=true",
						"OData-Version" : "4.0"
					},
					aUsers.length.toString()
				];
			}

			function getDataResponse(oXhr, bCount) {
				var aResult,
					sResponse;

				// Get the data filtered, sorted and reduced according to skip + top
				aResult = applyFilter(oXhr, aUsers);
				var iCount=aResult.length;
				aResult = applySort(oXhr, aResult);
				aResult = applySkipTop(oXhr, aResult);
				var sCount="";
				if (bCount) {
					sCount='"@odata.count": '+ iCount + ',';
				}

				sResponse = '{"@odata.context": "' + sBaseUrl + '$metadata#People(Age,FirstName,LastName,UserName)",'+ sCount + '"value": ' +
					JSON.stringify(aResult) +
					"}";

				return [
					200,
					{
						"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true",
						"OData-Version" : "4.0"
					},
					sResponse
				];
			}

			function handleRequest(oXhr) {
				var aResponse;

				// Log the request
				jQuery.sap.log.info(
					"Mockserver: Received request",
					oXhr.url,
					"sap.ui.demo.odatav4");

				if (/\$metadata/.test(oXhr.url)) {
					aResponse = getMetadataResponse();
				} else if (/\/\$count/.test(oXhr.url)) {
					aResponse = getCountResponse();
				} else if (/People\?/.test(oXhr.url)) {
					aResponse = getDataResponse(oXhr, /\$count=true/.test(oXhr.url));
				}

				oXhr.respond(aResponse[0], aResponse[1], aResponse[2]);

				// Log the response
				jQuery.sap.log.info(
					"Mockserver: Sent response",
					aResponse[0] + ", " + JSON.stringify(aResponse[1]) + ", " + aResponse[2],
					"sap.ui.demo.odatav4");
			}

			// Read the mock data
			readData();
			// Initialize the sinon fake server
			oSandbox.useFakeServer();
			// Make sure that requests are responded to automatically. Otherwise we would need to do that manually.
			oSandbox.server.autoRespond = true;

			// Register the requests for which responses should be faked.
			oSandbox.server.respondWith(rBaseUrl, handleRequest);

			// Apply a filter to the fake XmlHttpRequest. Otherwise, ALL requests (e.g. our component, views etc.) would be intercepted.
			sinon.FakeXMLHttpRequest.useFilters = true;
			sinon.FakeXMLHttpRequest.addFilter(function (sMethod, sUrl) {
				// If the filter returns true, the request will NOT be faked.
				// if (sUrl.indexOf("odata.org") !== -1) {
				return !rBaseUrl.test(sUrl);
			});
		},

		stop : function () {
			sinon.FakeXMLHttpRequest.filters = [];
			sinon.FakeXMLHttpRequest.useFilters = false;
			oSandbox.restore();
			oSandbox = null;
		}
	};

});
