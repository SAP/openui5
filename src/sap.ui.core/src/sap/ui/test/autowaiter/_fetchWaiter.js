/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/autowaiter/_utils",
	"./WaiterBase"
], function (_utils, WaiterBase) {
	"use strict";

	var aRequests = [];

	var fetchWaiter = WaiterBase.extend("sap.ui.test.autowaiter._fetchWaiter", {
		hasPending: function () {
			var bHasPendingRequests = aRequests.length > 0;
			if (bHasPendingRequests) {
				logPendingRequests();
			}
			return bHasPendingRequests;
		}
	});
	var oFetchWaiter = new fetchWaiter();

	// Preserve original fetch API
	var fnOriginalFetch = window.fetch;

	// Override original fetch API
	window.fetch = function (resource, options) {
		// Request object or URL
		var bIsObjectRequest = typeof resource === "object",
			oNewPendingFetchInfo = {
				url: bIsObjectRequest ? resource.url : resource,
				method: bIsObjectRequest ? resource.method : options && options.method || "GET"
			},
		oFetchLog = createLogForSingleRequest(oNewPendingFetchInfo);

		aRequests.push(oNewPendingFetchInfo);

		oFetchWaiter._oLogger.trace("New pending: " + oFetchLog);

		var response = fnOriginalFetch(resource, options);
		response.then(function (res) {
			oFetchWaiter._oLogger.trace("Finished: " + oFetchLog);
			aRequests.splice(aRequests.indexOf(oNewPendingFetchInfo), 1);
		})
		.catch(function (err) {
			oFetchWaiter._oLogger.trace("Finished with error: " + oFetchLog);
			aRequests.splice(aRequests.indexOf(oNewPendingFetchInfo), 1);
		});

		return response;
	};

	function createLogForSingleRequest (oFetchInfo) {
		var sMessage = "\nFetch: ";
		sMessage += "URL: '" + oFetchInfo.url + "' Method: '" + oFetchInfo.method;

		return sMessage;
	}

	function logPendingRequests() {
		var sLogMessage = "There are " + (aRequests.length) + " open fetch requests";
		aRequests.forEach(function (oFetch) {
			sLogMessage += createLogForSingleRequest(oFetch);
		});

		oFetchWaiter._oHasPendingLogger.debug(sLogMessage);
	}

	return oFetchWaiter;
}, true);