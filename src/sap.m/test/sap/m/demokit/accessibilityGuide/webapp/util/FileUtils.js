sap.ui.define([
	"sap/base/strings/formatMessage",
	"sap/ui/thirdparty/jquery"
], function (
	formatMessage,
	jQuery
) {
	"use strict";

	var oFileUtils = {
		fetch: function (sUrl) {
			if (oFileUtils.isBlob(sUrl)) {
				return oFileUtils._fetchBlob(sUrl);
			}

			return new Promise(function (resolve, reject) {
				jQuery.ajax(sUrl, {
					dataType: "text"
				}).done(function (oData) {
					resolve(oData);
				}).fail(function (jqXHR, sTextStatus, sError) {
					reject(formatMessage("Error {0} {1} ({2})", [jqXHR.status, sUrl, sError]));
				});
			});
		},

		isBlob: function (sName) {
			return (sName.match(/\.(jpeg|jpg|gif|png)$/) !== null);
		},

		_fetchBlob: function (sUrl) {
			return new Promise(function (resolve, reject) {
				jQuery.ajax(sUrl, {
					xhrFields: {
						responseType: "text" // don't use 'blob' because MockServer doesn't support it
					},
					mimeType: "text/plain; charset=x-user-defined"
				}).done(function (sData) {

					var sBase64EncodedData = 'data:image/png; base64,' + oFileUtils._base64Encode(sData);

					resolve(sBase64EncodedData);

				}).fail(function (jqXHR, sTextStatus, sError) {
					reject(sError);
				});
			});
		},

		// Used to encode images returned as text to base64
		_base64Encode: function (sToEncode) {
			var sCHARSList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
			var sResult = "", iIndex = 0, c1, c2, c3;
			while (iIndex < sToEncode.length) {
				c1 = sToEncode.charCodeAt(iIndex++) & 0xff;
				if (iIndex == sToEncode.length) {
					sResult += sCHARSList.charAt(c1 >> 2);
					sResult += sCHARSList.charAt((c1 & 0x3) << 4);
					sResult += "==";
					break;
				}
				c2 = sToEncode.charCodeAt(iIndex++);
				if (iIndex == sToEncode.length) {
					sResult += sCHARSList.charAt(c1 >> 2);
					sResult += sCHARSList.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
					sResult += sCHARSList.charAt((c2 & 0xF) << 2);
					sResult += "=";
					break;
				}
				c3 = sToEncode.charCodeAt(iIndex++);
				sResult += sCHARSList.charAt(c1 >> 2);
				sResult += sCHARSList.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
				sResult += sCHARSList.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
				sResult += sCHARSList.charAt(c3 & 0x3F);
			}
			return sResult;
		}
	};

	return oFileUtils;
});
