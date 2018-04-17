/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/ui/performance/XHRInterceptor", "sap/ui/thirdparty/URI"], function(XHRInterceptor, URI) {
	"use strict";


	var iE2eTraceLevel;
	var sTransactionId;
	var ROOT_ID;
	var HOST = window.location.host;

	// old methods taken over from E2eTraceLib
	function getBytesFromString(s) {
		var bytes = [];
		for (var i = 0; i < s.length; ++i) {
			bytes.push(s.charCodeAt(i));
		}
		return bytes;
	}

	function createHexString(arr) {
		var result = "";

		for (var i = 0; i < arr.length; i++) {
			var str = arr[i].toString(16);
			str = Array(2 - str.length + 1).join("0") + str;
			result += str;
		}

		return result;
	}


	/**
	 * Passport implementation, former EppLib.js <br>
	 *
	 * Provides functionality which was formerly located in the EppLib.js, but as the PASSPORT header is mandatory
	 * for correct assignment of the FESR headers, some functionality had to be moved to here. The actual tracing
	 * functionality of EppLib.js remained in the original file.
	 *
	 * @name sap.ui.performance.E2ETrace.Passport
	 * @static
	 * @private
	 */
	var Passport = {};

	/**
	 * @returns {String} a generated a passport header
	 * @private
	 */
	Passport.header = function(trcLvl, RootID, TransID, component, action) {

		// Following code is a representation of this string:
		// *TH* SAP_E2E_TA_PlugIn SAP_E2E_TA_User                 SAP_E2E_TA_Request SAP_E2E_TA_PlugIn               4635000000311EE0A5D250999C392B68 F5 1 *TH*
		var SAPEPPTemplateLow = [
			0x2A, 0x54, 0x48, 0x2A, 0x03, 0x00, 0xE6, 0x00, 0x00, 0x53, 0x41, 0x50, 0x5F, 0x45, 0x32, 0x45, 0x5F, 0x54, 0x41, 0x5F, 0x50, 0x6C, 0x75, 0x67,
			0x49, 0x6E, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x00, 0x00, 0x53, 0x41, 0x50, 0x5F, 0x45,
			0x32, 0x45, 0x5F, 0x54, 0x41, 0x5F, 0x55, 0x73, 0x65, 0x72, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
			0x20, 0x20, 0x20, 0x53, 0x41, 0x50, 0x5F, 0x45, 0x32, 0x45, 0x5F, 0x54, 0x41, 0x5F, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x20, 0x20, 0x20,
			0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x00, 0x05, 0x53, 0x41, 0x50,
			0x5F, 0x45, 0x32, 0x45, 0x5F, 0x54, 0x41, 0x5F, 0x50, 0x6C, 0x75, 0x67, 0x49, 0x6E, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
			0x20, 0x20, 0x20, 0x20, 0x20, 0x34, 0x36, 0x33, 0x35, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x33, 0x31, 0x31, 0x45, 0x45, 0x30, 0x41, 0x35, 0x44,
			0x32, 0x35, 0x30, 0x39, 0x39, 0x39, 0x43, 0x33, 0x39, 0x32, 0x42, 0x36, 0x38, 0x20, 0x20, 0x20, 0x00, 0x07, 0x46, 0x35, 0x00, 0x00, 0x00, 0x31,
			0x1E, 0xE0, 0xA5, 0xD2, 0x4E, 0xDB, 0xB2, 0xE4, 0x4B, 0x68, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xE2, 0x2A, 0x54, 0x48, 0x2A
		];

		var RootIDPosLen = [
			372, 32
		];

		var TransIDPosLen = [
			149, 32
		];

		var CompNamePosLEn = [
			9, 32
		];

		var PreCompNamePosLEn = [
			117, 32
		];

		var actionOffset = [
			75, 40
		];

		var traceFlgsOffset = [
			7, 2
		];

		var prefix = getBytesFromString("SAP_E2E_TA_UI5LIB");
		prefix = prefix.concat(getBytesFromString(new Array(32 + 1 - prefix.length).join(' ')));

		if (component) {
			component = getBytesFromString(component.substr(-32,32));
			component = component.concat(getBytesFromString(new Array(32 + 1 - component.length).join(' ')));
			SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, CompNamePosLEn.concat(component));
			SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, PreCompNamePosLEn.concat(component));
		} else {
			SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, CompNamePosLEn.concat(prefix));
			SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, PreCompNamePosLEn.concat(prefix));
		}

		SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, TransIDPosLen.concat(getBytesFromString(TransID)));
		SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, traceFlgsOffset.concat(trcLvl));

		if (action) {
			action = getBytesFromString(action.substr(-40,40));
			action = action.concat(getBytesFromString(new Array(40 + 1 - action.length).join(' ')));
			SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, actionOffset.concat(action));
		}

		var retVal = createHexString(SAPEPPTemplateLow).toUpperCase();

		return retVal.substring(0, RootIDPosLen[0]).concat(RootID) + retVal.substring(RootIDPosLen[0] + RootIDPosLen[1]);
	};

	/**
	 * @param {String} lvl Tracing level to be calculated
	 * @return {int[]} Array with two int representations of characters for trace level
	 * @private
	 */
	Passport.traceFlags = function(lvl) {
		switch (lvl) {
			case 'low':
				iE2eTraceLevel = [0x00, 0x00];
				break;
			case 'medium':
				iE2eTraceLevel = [0x89, 0x0A];
				break;
			case 'high':
				iE2eTraceLevel = [0x9F, 0x0D];
				break;
			default:
				iE2eTraceLevel = [];
				iE2eTraceLevel.push((parseInt(lvl, 16) & 0xFF00) / 256);
				iE2eTraceLevel.push((parseInt(lvl, 16) & 0xFF));
		}
		return iE2eTraceLevel;
	};

	/**
	 * @returns {String} a generated GUID
	 * @private
	 */
	Passport.createGUID = function() {
		var S4 = function() {
			var temp = Math.floor(Math.random() * 0x10000 /* 65536 */ );
			return (new Array(4 + 1 - temp.toString(16).length)).join('0') + temp.toString(16);
		};

		var S5 = function() {
			var temp = (Math.floor(Math.random() * 0x10000 /* 65536 */ ) & 0x0fff) + 0x4000;
			return (new Array(4 + 1 - temp.toString(16).length)).join('0') + temp.toString(16);
		};

		var S6 = function() {
			var temp = (Math.floor(Math.random() * 0x10000 /* 65536 */ ) & 0x3fff) + 0x8000;
			return (new Array(4 + 1 - temp.toString(16).length)).join('0') + temp.toString(16);
		};

		var retVal = (S4() + S4() + //"-" +
			S4() + //"-" +
			S5() + //"-" +
			S6() + //"-" +
			S4() + S4() + S4());

		return retVal.toUpperCase();
	};

	Passport.getRootId = function() {
		return ROOT_ID;
	};

	Passport.getTransactionId = function() {
		return sTransactionId;
	};

	function isCORSRequest(sUrl) {
		var sHost = new URI(sUrl).host();
		// url is relative or with same host
		return sHost && sHost !== HOST;
	}

	/**
	 * @param {boolean} bActive State of the Passport header creation
	 * @private
	 */
	Passport.setActive = function(bActive) {
		if (bActive) {
			XHRInterceptor.register("PASSPORT_ID", "open", function() {
				if (!isCORSRequest(arguments[1])) {
					sTransactionId = Passport.createGUID();
				}
			});
			XHRInterceptor.register("PASSPORT_HEADER", "open", function() {
				if (!isCORSRequest(arguments[1])) {
					// set passport with Root Context ID, Transaction ID for Trace
					this.setRequestHeader("SAP-PASSPORT", Passport.header(iE2eTraceLevel, ROOT_ID, sTransactionId));
				}
			});
		}
	};

	Passport.traceFlags();

	ROOT_ID = Passport.createGUID();

	return Passport;
});