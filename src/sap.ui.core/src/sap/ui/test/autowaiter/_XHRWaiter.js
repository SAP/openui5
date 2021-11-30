/*!
 * ${copyright}
 */

/*global XMLHttpRequest */
sap.ui.define([
	"sap/ui/thirdparty/sinon",
	"sap/ui/test/autowaiter/_utils",
	"./WaiterBase"
], function (sinon, _utils, WaiterBase) {
	"use strict";

	var aXHRs = [];

	var XHRWaiter = WaiterBase.extend("sap.ui.test.autowaiter._XHRWaiter", {
		hasPending: function () {
			var bHasPendingRequests = aXHRs.length > 0;
			if (bHasPendingRequests) {
				logPendingRequests();
			}
			return bHasPendingRequests;
		}
	});
	var oXHRWaiter = new XHRWaiter();

	// restore seems to be a new function everytime you call useFakeXmlHttpRequest so hook it everytime
	var fnUseFakeOriginal = sinon.useFakeXMLHttpRequest;
	sinon.useFakeXMLHttpRequest = function () {
		var FakeXmlHttpRequest = fnUseFakeOriginal.apply(this, arguments);
		hookIntoSinonRestore();
		return FakeXmlHttpRequest;
	};

	// Clear the Xhrs blocking the execution since sinon will not respond to them anymore anyways
	function hookIntoSinonRestore () {
		var fnOriginalRestore = XMLHttpRequest.restore;

		if (fnOriginalRestore) {
			XMLHttpRequest.restore = function () {
				var vReturn = fnOriginalRestore.apply(this, arguments);
				aXHRs = filterFakeXHRs();
				return vReturn;
			};
		}
	}

	// Check if sinon is already faking the Xhr
	hookIntoSinonRestore();

	// Hook into XHR open for sinon XHRs
	var fnOriginalFakeOpen = sinon.FakeXMLHttpRequest.prototype.open;
	sinon.FakeXMLHttpRequest.prototype.open = function () {
		return fnOriginalFakeOpen.apply(this, hookIntoXHROpen.apply(this, arguments));
	};

	// Hook into XHR open for regular XHRs
	var fnOriginalOpen = XMLHttpRequest.prototype.open;
	XMLHttpRequest.prototype.open = function () {
		return fnOriginalOpen.apply(this, hookIntoXHROpen.apply(this, arguments));
	};

	// Hook into Xhr send for sinon Xhrs
	var fnOriginalFakeSend = sinon.FakeXMLHttpRequest.prototype.send;
	sinon.FakeXMLHttpRequest.prototype.send = function () {
		hookIntoXHRSend.call(this, true);
		return fnOriginalFakeSend.apply(this, arguments);
	};

	// Hook into Xhr send for regular Xhrs
	var fnOriginalSend = XMLHttpRequest.prototype.send;
	XMLHttpRequest.prototype.send = function () {
		hookIntoXHRSend.call(this);
		return fnOriginalSend.apply(this, arguments);
	};

	function hookIntoXHROpen(sMethod, sUrl, bAsync) {
		var sIgnoreTag = "XHR_WAITER_IGNORE:";

		// attach arguments to XHR object
		this.url = sUrl;
		this.method = sMethod;
		this.async = bAsync;

		// mark OPA XHRs 'ignored'
		if (sMethod.startsWith(sIgnoreTag)) {
			var sMethodWithoutTag = sMethod.substring(sIgnoreTag.length);
			arguments[0] = sMethodWithoutTag;
			this.method = sMethodWithoutTag;
			this.ignored = true;
		}

		return arguments;
	}

	function hookIntoXHRSend(bIsFake) {
		if (this.ignored) {
			return;
		}

		var oNewPendingXHRInfo = {
			url: this.url,
			method: this.method,
			async: this.async,
			fake: bIsFake,
			trace: _utils.resolveStackTrace()
		};
		var oNewPendingXHRLog = createLogForSingleRequest(oNewPendingXHRInfo);

		if (this.async) {
			aXHRs.push(oNewPendingXHRInfo);
			oXHRWaiter._oLogger.trace("New pending:" + oNewPendingXHRLog);

			this.addEventListener("readystatechange", function() {
				if (this.readyState === 4) {
					aXHRs.splice(aXHRs.indexOf(oNewPendingXHRInfo), 1);
					oXHRWaiter._oLogger.trace("Finished:" + oNewPendingXHRLog);
				}
			});
		} else {
			oXHRWaiter._oLogger.trace("Finished:" + oNewPendingXHRLog);
		}
	}

	function createLogForSingleRequest (oXHR) {
		var sMessage = oXHR.fake ? "\nFakeXHR: " : "\nXHR: ";
		sMessage += "URL: '" + oXHR.url + "' Method: '" + oXHR.method + "' Async: '" + oXHR.async + "'\nStack: " + oXHR.trace;
		return sMessage;
	}

	function logPendingRequests() {
		var iFakeXHRLength = filterFakeXHRs(true).length;
		var sLogMessage = "There are " + (aXHRs.length - iFakeXHRLength) + " open XHRs and " + iFakeXHRLength + " open FakeXHRs.";
		aXHRs.forEach(function (oXHR) {
			sLogMessage += createLogForSingleRequest(oXHR);
		});

		oXHRWaiter._oHasPendingLogger.debug(sLogMessage);
	}

	function filterFakeXHRs(bIsFake) {
		return aXHRs.filter(function (oXHR) {
			return bIsFake ? oXHR.fake : !oXHR.fake;
		});
	}

	return oXHRWaiter;
}, true);
