/*!
 * ${copyright}
 */

/*global Promise*/
sap.ui.define([], function () {
	"use strict";

	var codeCache = {};
	return function (sUrl) {
		return new Promise(function (fnResolve, fnReject) {
			var fnSuccess = function (result) {
				codeCache[sUrl] = result;
				fnResolve(result);
			};
			var fnError = function () {
				fnReject("not found: '" + sUrl + "'");
			};

			if (!(sUrl in codeCache)) {
				codeCache[sUrl] = "";
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
