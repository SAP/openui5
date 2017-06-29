/*!
 * ${copyright}
 */
//Provides mixin sap.ui.model.odata.v4.lib._V2Requestor
sap.ui.define([
], function () {
	"use strict";

	/**
	 * A mixin for a requestor using an OData V2 service.
	 *
	 * @alias sap.ui.model.odata.v4.lib._V2Requestor
	 * @mixin
	 */
	function _V2Requestor() {}

	/**
	 * Final (cannot be overridden) request headers for OData V2.
	 */
	_V2Requestor.prototype.mFinalHeaders = {
		"Content-Type" : "application/json;charset=UTF-8"
	};

	/**
	 * Predefined request headers in $batch parts for OData V2.
	 */
	_V2Requestor.prototype.mPredefinedPartHeaders = {
		"Accept" : "application/json"
	};

	/**
	 * Predefined request headers for all requests for OData V2.
	 */
	_V2Requestor.prototype.mPredefinedRequestHeaders = {
		"Accept" : "application/json",
		"MaxDataServiceVersion" : "2.0",
		"DataServiceVersion" : "2.0",
		"X-CSRF-Token" : "Fetch"
	};

	/**
	 * Converts an OData V2 response payload to an OData V4 response payload.
	 *
	 * @param {object} oResponsePayload
	 *   The OData V2 response payload
	 * @returns {object}
	 *   The OData V4 response payload
	 */
	_V2Requestor.prototype.doConvertResponseToV4 = function (oResponsePayload) {
		if (oResponsePayload.d.results) {
			return {
				value : oResponsePayload.d.results
			};
		}
		return oResponsePayload.d;
	};

	return function (oObject) {
		jQuery.extend(oObject, _V2Requestor.prototype);
	};

}, /* bExport= */ false);