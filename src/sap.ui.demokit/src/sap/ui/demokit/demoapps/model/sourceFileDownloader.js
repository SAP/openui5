/*!
 * ${copyright}
 */

/*global Promise*/
sap.ui.define(['jquery.sap.global'], function (jQuery) {
	"use strict";

	var oCodeCache = {};
	return function (sUrl) {
		return new Promise(function (fnResolve) {
			var fnSuccess = function (result) {
				oCodeCache[sUrl] = result;
				fnResolve(result);
			};
			var fnError = function () {
				fnResolve({errorMessage: "FIle not found: '" + sUrl + "'"});
			};

			if (!(sUrl in oCodeCache)) {
				jQuery.ajax(sUrl, {
					dataType: "text",
					success: fnSuccess,
					error: fnError
				});
			} else {
				fnResolve(oCodeCache[sUrl]);
			}
		});
	};
});
