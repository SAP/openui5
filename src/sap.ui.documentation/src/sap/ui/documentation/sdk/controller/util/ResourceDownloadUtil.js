/*!
 * ${copyright}
 */

/*global location, XMLHttpRequest, Uint8Array */
sap.ui.define([], function() {
		"use strict";

		var _fetchPromises = {};

		var AJAXUtils = {
			fetch: function (sUrl, bTreatAsText) {
				if (!(sUrl in _fetchPromises)) {
					_fetchPromises[sUrl] = this._fetch(sUrl, bTreatAsText);
				}
				return _fetchPromises[sUrl];
			},

			_fetch: function(sUrl, bTreatAsText) {
				return new Promise(function(resolve, reject) {
					var oReq,
						bSuccess,
						sResponseType = this._getExpectedResponseType(sUrl, bTreatAsText);

					function fnHandler(oEvent) {
						// Note for a URL using file:// protocol, a status code of 0 is reported on success
						bSuccess = oEvent.type === "load" && (oReq.status === 200 || oReq.status === 0);

						if (!bSuccess) {
							reject(new Error("could not fetch '" + sUrl + "': " + oReq.status));
							return;
						}

						resolve(AJAXUtils._readResponse(oReq));
					}

					oReq = new XMLHttpRequest();
					oReq.open("GET", sUrl, true);
					oReq.responseType = sResponseType;
					oReq.onload = oReq.onerror = fnHandler;

					oReq.send();
				}.bind(this));
			},

			_readResponse: function(oReq) {
				var sRespType = oReq.responseType,
					oResult = (sRespType === "text") ? oReq.responseText : oReq.response;

				if (sRespType === "arraybuffer") {
					try {
						oResult = new Uint8Array(oResult);
					} catch (e) {
						// IE11 does not support Uint8Array from response array,
						// in that case it is enough to keep the raw response
						// (to be able to add it to the download zip, if download is requested)
					}
				}

				return oResult;
			},

			_getExpectedResponseType: function(sResourceUrl, bTreatAsText) {
				if (sResourceUrl.match(/.+(.js|.json|.less|.xml|.html|.properties|.css|.svg|.md|.txt|.yaml|.yml)$/i) || bTreatAsText) { // supported text types
					return "text";
				}

				return "arraybuffer"; // default
			}

		};

		return AJAXUtils;
	}, /* bExport= */ true);