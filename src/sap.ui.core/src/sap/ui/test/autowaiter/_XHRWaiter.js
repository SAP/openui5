/*!
 * ${copyright}
 */

/*global XMLHttpRequest */
sap.ui.define([
	"sap/ui/thirdparty/sinon",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/autowaiter/_utils"
], function (sinon, _OpaLogger, _utils) {
	"use strict";

	var oLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._XHRWaiter");
	var oHasPendingLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._XHRWaiter#hasPending");
	var aXHRs = [];

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

	function hookIntoXHRSend(bIsFake) {
		var sXHRType = bIsFake ? "FakeXHR" : "XHR";
		var oNewPendingXHRInfo = {url: this.url, method: this.method, fake: bIsFake, trace: _utils.resolveStackTrace()};
		var oNewPendingXHRLog = createLogForSingleRequest(oNewPendingXHRInfo);

		aXHRs.push(oNewPendingXHRInfo);
		oLogger.trace("New pending " + sXHRType + ":" + oNewPendingXHRLog);

		this.addEventListener("readystatechange", function() {
			if (this.readyState === 4) {
				aXHRs.splice(aXHRs.indexOf(oNewPendingXHRInfo), 1);
				oLogger.trace(sXHRType + " finished:" + oNewPendingXHRLog);
			}
		});
	}

	// Hook into Xhr open to get the url and method
	var fnOriginalOpen = XMLHttpRequest.prototype.open;
	XMLHttpRequest.prototype.open = function (sMethod, sUrl) {
		this.method = sMethod;
		this.url = sUrl;
		return fnOriginalOpen.apply(this, arguments);
	};

	function createLogForSingleRequest (oXHR) {
		var sMessage = oXHR.fake ? "\nFakeXHR: " : "\nXHR: ";
		sMessage += "URL: '" + oXHR.url + "' Method: '" + oXHR.method + "'\nStack: " + oXHR.trace;
		return sMessage;
	}

	function logPendingRequests() {
		var iFakeXHRLength = filterFakeXHRs(true).length;
		var sLogMessage = "There are " + (aXHRs.length - iFakeXHRLength) + " open XHRs and " + iFakeXHRLength + " open FakeXHRs.";
		aXHRs.forEach(function (oXHR) {
			sLogMessage += createLogForSingleRequest(oXHR);
		});

		oHasPendingLogger.debug(sLogMessage);
	}

	function filterFakeXHRs(bIsFake) {
		return aXHRs.filter(function (oXHR) {
			return bIsFake ? oXHR.fake : !oXHR.fake;
		});
	}

	return {
		hasPending: function () {
			var bHasPendingRequests = aXHRs.length > 0;
			if (bHasPendingRequests) {
				logPendingRequests();
			}
			return bHasPendingRequests;
		}
	};
}, true);
