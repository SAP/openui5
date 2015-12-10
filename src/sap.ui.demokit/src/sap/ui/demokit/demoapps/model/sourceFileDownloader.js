/*!
 * ${copyright}
 */

/*global Promise*/
sap.ui.define(['jquery.sap.global'], function (jQuery) {
	"use strict";

	var codeCache = {};
	return function (sUrl) {
		return new Promise(function (fnResolve) {
			var fnSuccess = function (result) {
				codeCache[sUrl] = result;
				fnResolve(result);
			};
			var fnError = function () {
				fnResolve({ errorMessage: "not found: '" + sUrl + "'" });
			};

			if (!(sUrl in codeCache)) {
				jQuery.ajax(sUrl, {
					dataType: "text",
					success: fnSuccess,
					error: fnError
				});
			} else {
				fnResolve(codeCache[sUrl]);
			}
		});
	};
});
