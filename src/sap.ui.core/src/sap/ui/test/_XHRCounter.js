/*!
 * ${copyright}
 */

/*global XMLHttpRequest */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/thirdparty/sinon"
], function ($, sinon) {
	"use strict";

	var oLogger = $.sap.log.getLogger("sap.ui.test._XHRCounter", 4);
	var aXHRs = [];
	var aFakeXHRs = [];
	var fnUseFakeOriginal = sinon.useFakeXMLHttpRequest;

	// restore seems to be a new function everytime you call useFakeXmlHttpRequest so hook it everytime
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
				aFakeXHRs.length = 0;
				return vReturn;
			};
		}
	}

	// Check if sinon is already faking the Xhr
	hookIntoSinonRestore();

	// Hook into Xhr send for regular Xhrs
	var fnOriginalSend = XMLHttpRequest.prototype.send;
	XMLHttpRequest.prototype.send = function () {
		this.addEventListener("readystatechange", function() {
			if (this.readyState === 4) {
				aXHRs.splice(aXHRs.indexOf(this), 1);
			}
		});
		aXHRs.push(this);

		return fnOriginalSend.apply(this, arguments);
	};

	// Hook into Xhr open to get the url and method
	var fnOriginalOpen = XMLHttpRequest.prototype.open;
	XMLHttpRequest.prototype.open = function (sMethod, sUrl) {
		this.method = sMethod;
		this.url = sUrl;
		return fnOriginalOpen.apply(this, arguments);
	};

	// Hook into Xhr send for sinon Xhrs
	var fnOriginalFakeSend = sinon.FakeXMLHttpRequest.prototype.send;
	sinon.FakeXMLHttpRequest.prototype.send = function () {
		this.addEventListener("readystatechange", function() {
			if (this.readyState === 4) {
				aFakeXHRs.splice(aXHRs.indexOf(this), 1);
			}
		});
		aFakeXHRs.push(this);

		return fnOriginalFakeSend.apply(this, arguments);
	};

	function logPendingRequests () {
		var sLogMessage = "There are '" + aXHRs.length + "' open XHRs and '" + aFakeXHRs.length + "' open FakeXHRs.";
		aXHRs.forEach(function (oXHR) {
			sLogMessage += createLogForSingleRequest(oXHR);
		});
		aFakeXHRs.forEach(function (oXHR) {
			sLogMessage += createLogForSingleRequest(oXHR, true);
		});

		oLogger.debug(sLogMessage);
	}

	function createLogForSingleRequest (oXHR, bIsFake) {
		var sMessage = bIsFake ? "\nFakeXHR: " : "\nXHR: ";
		sMessage += "URL: '" + oXHR.url + "' Method: '" + oXHR.method  + "'";
		return sMessage;
	}

	return {
		hasPendingRequests: function () {
			var bHasPendingRequests = aXHRs.length > 0 || aFakeXHRs.length > 0;
			if (bHasPendingRequests) {
				logPendingRequests();
			}
			return bHasPendingRequests;
		}
	};
}, true);