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
				fnResolve({errorMessage: "File not found: '" + sUrl + "'"});
			};

			if (!(sUrl in oCodeCache)) {
				jQuery.ajax({
					url: sUrl,
					type: "GET",
					dataType: "text",
					beforeSend: function(request) {
						request.overrideMimeType("text/plain; charset=x-user-defined");
					}
				}).done(fnSuccess).fail(fnError);
			} else {
				fnResolve(oCodeCache[sUrl]);
			}
		});
	};
});
