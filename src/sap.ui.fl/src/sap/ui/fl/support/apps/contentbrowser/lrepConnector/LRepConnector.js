/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/Utils", "sap/ui/thirdparty/jquery"], function(Utils, jQuery) {
	"use strict";

	/**
	 * Provides the connectivity to the layered repository REST service.
	 *
	 * @constructor
	 * @alias sap.ui.fl.support.apps.contentbrowser.lrepConnector.LRepConnector
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.45
	 */
	var LrepConnector = {};

	LrepConnector.sContentPathPrefix = "/sap/bc/lrep/content";
	LrepConnector.sGetXcsrfTokenUrl = "/sap/bc/lrep/actions/getcsrftoken/";
	LrepConnector._sXcsrfToken = undefined;

	/**
	 * Gets content from the layered repository.
	 *
	 * @param {string} sLayer - Determines the layer for obtaining the content
	 * @param {string} sContentSuffix - Namespace plus filename and file type of content
	 * @param {boolean} bReadContextMetadata - Read content plus metadata information
	 * @param {boolean} bReadRuntimeContext - Gets the content in runtime instead of design time
	 * @param {boolean} bRequestAsText - Gets content data as plain text
	 * @returns {Promise} Promise of GET content request to the back end
	 * @public
	 */
	LrepConnector.getContent = function (sLayer, sContentSuffix, bReadContextMetadata, bReadRuntimeContext, bRequestAsText) {
		var that = this;

		var oGetContentPromise = new Promise(function (fnResolve, fnReject) {
			sContentSuffix = encodeURI(sContentSuffix);
			var sLayerSuffix = that._getLayerSuffix(sLayer);
			var sContextSuffix = that._getContextSuffix(sLayerSuffix, bReadRuntimeContext, bReadContextMetadata);
			var sUrl = LrepConnector.sContentPathPrefix + (sContentSuffix ? "" : "/") + sContentSuffix + sLayerSuffix + sContextSuffix;

			that._sendContentRequest(sUrl, fnResolve, fnReject, bRequestAsText);
		});

		return oGetContentPromise;
	};

	/**
	 * Saves a file to the layered repository.
	 *
	 * @param {string} sLayer - Determines the layer for saving the content
	 * @param {string} sNamespace - Namespace of the file
	 * @param {string} sFilename - Name of the file
	 * @param {string} sFileType - Type of the file
	 * @param {string} sContent - Content of the file saved to the layered repository
	 * @param {string} sTransportId - ID of an ABAP transport or ATO_NOTIFICATION
	 * @param {string} sPackageName - Name of an ABAP package
	 * @param [boolean] bSupport - Save file with support mode for activated version
	 * @returns {Promise} Promise of the SAVE content request to the back end
	 * @public
	 */
	LrepConnector.saveFile = function (sLayer, sNamespace, sFilename, sFileType, sContent, sTransportId, sPackageName, bSupport) {
		return new Promise(function (fnResolve, fnReject) {
			if (!sLayer || sNamespace === undefined || !sFilename || !sFileType) {
				fnReject();
			}

			var sContentSuffix = sNamespace + sFilename + "." + sFileType;
			sContentSuffix = encodeURI(sContentSuffix);
			var sLayerSuffix = this._getLayerSuffix(sLayer);
			var sChangeListSuffix = this._getChangeListSuffix(sTransportId);
			var sPackageSuffix = this._getPackageSuffix(sPackageName);
			var sUrl = LrepConnector.sContentPathPrefix + sContentSuffix + sLayerSuffix + sChangeListSuffix + sPackageSuffix;
			if (bSupport) {
				sUrl = sUrl + "&support=true";
			}
			this._getTokenAndSendPutRequest(sUrl, sContent, fnResolve, fnReject);
		}.bind(this));
	};

	/**
	 * Deletes a file from the layered repository.
	 *
	 * @param {string} sLayer - Determines the layer for deleting the content
	 * @param {string} sNamespace - Namespace of the file
	 * @param {string} sFileName - Name of the file
	 * @param {string} sFileType - Type of the file
	 * @param {string} sTransportId - ID of the ABAP transport or ATO_NOTIFICATION
	 * @param [boolean] bSupport - Delete file with support mode for activated version
	 * @returns {Promise} Promise of DELETE content request to the back end
	 * @public
	 */
	LrepConnector.deleteFile = function (sLayer, sNamespace, sFileName, sFileType, sTransportId, bSupport) {
		return new Promise(function (fnResolve, fnReject) {
			if (!sLayer || sNamespace === undefined || !sFileName || !sFileType) {
				fnReject();
			}

			var sContentSuffix = sNamespace + sFileName + "." + sFileType;
			sContentSuffix = encodeURI(sContentSuffix);
			var sLayerSuffix = this._getLayerSuffix(sLayer);
			var sChangeListSuffix = this._getChangeListSuffix(sTransportId);
			var sUrl = LrepConnector.sContentPathPrefix + sContentSuffix + sLayerSuffix + sChangeListSuffix;
			if (bSupport) {
				sUrl = sUrl + "&support=true";
			}
			this._getTokenAndSendDeletionRequest(sUrl, fnResolve, fnReject);
		}.bind(this));
	};

	/**
	 * Gets a XCSRF token for a REST request.
	 *
	 * @returns {Promise} Promise of the GET token HEAD request to back end
	 * @private
	 */
	LrepConnector._getXcsrfToken = function () {
		var that = this;
		return new Promise(function (sResolve, fnReject) {
			if (that._sXcsrfToken) {
				sResolve(that._sXcsrfToken);
			}

			jQuery.ajax({
				url: LrepConnector.sGetXcsrfTokenUrl,
				type: "HEAD",
				beforeSend: function (oRequest) {
					oRequest.setRequestHeader("X-CSRF-Token", "fetch");
					var client = Utils.getClient();
					if (client) {
						oRequest.setRequestHeader("sap-client", client);
					}
				},
				success: function (sData, sMsg, oJqXHR) {
					that._sXcsrfToken = oJqXHR.getResponseHeader("x-csrf-token");
					sResolve(that._sXcsrfToken);
				},
				error: function (jqXHR, sTextStatus, sErrorThrown) {
					LrepConnector._reportError(jqXHR, sTextStatus, sErrorThrown);
					fnReject(sErrorThrown);
				}
			});
		});
	};

	/**
	 * Get layer suffix for request URL;
	 * If all layers are selected, the layer suffix is empty.
	 * @param {string} sLayer - Normal layer plus 'All'
	 * @returns {string} Correct layer suffix
	 * @private
	 */
	LrepConnector._getLayerSuffix = function (sLayer) {
		if (sLayer === "All") {
			return "";
		}
		return "?layer=" + sLayer;
	};

	/**
	 * Get changelist suffix for request URL;
	 * @param {string} sChangeList - Transport ID
	 * @returns {string} Correct changelist suffix
	 * @private
	 */
	LrepConnector._getChangeListSuffix = function (sChangeList) {
		return sChangeList ? "&changelist=" + sChangeList : "";
	};

	/**
	 * Get package suffix for request URL;
	 * @param {string} sPackage - Package name
	 * @returns {string} Correct package suffix
	 * @private
	 */
	LrepConnector._getPackageSuffix = function (sPackage) {
		return sPackage ? "&package=" + sPackage : "";
	};

	/**
	 * Get context suffix for request URL.
	 *
	 * @param {string} sLayerSuffix - Layer suffix based on selected layer
	 * @param {boolean} bReadRuntimeContext - Gets content in runtime instead of design time
	 * @param {boolean} bReadContextMetadata - Reads content plus metadata information
	 * @returns {string} Correct context suffix for URL request
	 * @private
	 */
	LrepConnector._getContextSuffix = function (sLayerSuffix, bReadRuntimeContext, bReadContextMetadata) {
		var sReadRuntimeContextSuffix = "";
		if (!bReadRuntimeContext) {
			sReadRuntimeContextSuffix += (sLayerSuffix ? "&" : "?");
			sReadRuntimeContextSuffix += "dt=true";
		}
		if (bReadContextMetadata) {
			sReadRuntimeContextSuffix += (sLayerSuffix || sReadRuntimeContextSuffix ? "&" : "?");
			sReadRuntimeContextSuffix += "metadata=true";
		}
		return sReadRuntimeContextSuffix;
	};

	/**
	 * Reports an error during back-end request.
	 *
	 * @param {object} oJqXHR - <code>jqXHR</code> object which is returned from ajax request
	 * @param {string} sTextStatus - Status text of the error
	 * @param {object} oErrorThrown - Object that contains the error description
	 * @private
	 */
	LrepConnector._reportError = function (oJqXHR, sTextStatus, oErrorThrown) {
		sap.ui.require(["sap/ui/fl/support/apps/contentbrowser/utils/ErrorUtils"], function (ErrorUtils) {
			ErrorUtils.displayError("Error", oJqXHR.status, sTextStatus + ": " + oErrorThrown);
		});
	};

	/**
	 * Sends a GET content request to the back end.
	 *
	 * @param {string} sUrl - Request URL
	 * @param {function} fnResolve - Callback function if request was resolved
	 * @param {function} fnReject - Callback function if request was rejected
	 * @param {boolean} bRequestAsText - Sends ajax request with data type as plain text
	 * @private
	 */
	LrepConnector._sendContentRequest = function (sUrl, fnResolve, fnReject, bRequestAsText) {
		var oRequest = {
			url: sUrl,
			type: "GET",
			success: function (oData) {
				fnResolve(oData);
			},
			error: function (oJqXHR, sTextStatus, oErrorThrown) {
				LrepConnector._reportError(oJqXHR, sTextStatus, oErrorThrown);
				fnReject(oErrorThrown);
			}
		};
		//code extension content should be treated as plain text to avoid parser error.
		if (bRequestAsText) {
			oRequest.dataType = "text";
		}
		jQuery.ajax(oRequest);
	};

	/**
	 * Gets the token and sends an updating request.
	 *
	 * @param {string} sUrl - Request URL
	 * @param {object} oData - Data for PUT request
	 * @param {function} fnResolve - Callback function if request was resolved
	 * @param {function} fnReject - Callback function if request was rejected
	 * @private
	 */
	LrepConnector._getTokenAndSendPutRequest = function (sUrl, oData, fnResolve, fnReject) {
		var that = this;
		LrepConnector._getXcsrfToken().then(function (oXcsrfToken) {
			that._sendPutRequest(oXcsrfToken, sUrl, oData, fnResolve, fnReject);
		});
	};

	/**
	 * Sends PUT content request to the back end.
	 *
	 * @param {object} oXcsrfToken - Token object
	 * @param {string} sUrl - Request URL
	 * @param {object} oData - Data of PUT request
	 * @param {function} fnResolve - Callback function if request was resolved
	 * @param {function} fnReject - Callback function if request was rejected
	 * @private
	 */
	LrepConnector._sendPutRequest = function (oXcsrfToken, sUrl, oData, fnResolve, fnReject) {
		jQuery.ajax({
			url: sUrl,
			contentType: "text/plain",
			dataType: "text",
			data: oData,
			beforeSend: function (oRequest) {
				oRequest.setRequestHeader("X-CSRF-Token", oXcsrfToken);
			},
			type: "PUT",
			success: function () {
				fnResolve();
			},
			error: function (oJqXHR, sTextStatus, oErrorThrown) {
				LrepConnector._reportError(oJqXHR, sTextStatus, oErrorThrown);
				fnReject(oErrorThrown);
			}
		});
	};

	/**
	 * Gets token and sends DELETE content request to the back end.
	 *
	 * @param {string} sUrl - Request URL
	 * @param {function} fnResolve - Callback function if request was resolved
	 * @param {function} fnReject - Callback function if request was rejected
	 * @private
	 */
	LrepConnector._getTokenAndSendDeletionRequest = function (sUrl, fnResolve, fnReject) {
		var that = this;
		this._getXcsrfToken().then(function (sXcsrfToken) {
			that._sendDeletionRequest(sXcsrfToken, sUrl, fnResolve, fnReject);
		});
	};

	/**
	 * Sends DELETE request to the back end.
	 *
	 * @param {object} oXcsrfToken - Token object
	 * @param {string} sUrl - Request URL
	 * @param {function} fnResolve - Callback function if request was resolved
	 * @param {function} fnReject - Callback function if request was rejected
	 * @private
	 */
	LrepConnector._sendDeletionRequest = function (oXcsrfToken, sUrl, fnResolve, fnReject) {
		jQuery.ajax({
			url: sUrl,
			beforeSend: function (oRequest) {
				oRequest.setRequestHeader("X-CSRF-Token", oXcsrfToken);
			},
			type: "DELETE",
			success: function (oData) {
				fnResolve(oData);
			},
			error: function (oJqXHR, sTextStatus, oErrorThrown) {
				LrepConnector._reportError(oJqXHR, sTextStatus, oErrorThrown);
				fnReject(oErrorThrown);
			}
		});
	};

	return LrepConnector;
});