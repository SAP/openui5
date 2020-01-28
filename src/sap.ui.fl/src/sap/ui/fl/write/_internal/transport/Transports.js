/*!
 * ${copyright}
 */
/*global Promise */

sap.ui.define([
	"sap/ui/fl/apply/_internal/connectors/LrepConnector",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils"
], function(
	ApplyLrepConnector,
	FlexUtils,
	ApplyUtils,
	WriteUtils
) {
	"use strict";

	var LREP_CONNECTOR_CONFIG_URL = "/sap/bc/lrep";
	var ROUTES = {
		ACTION_GET_TRANSPORTS: "/actions/gettransports/",
		ACTION_MAKE_CHANGE_TRANSPORTABLE: "/actions/make_changes_transportable/",
		ACTION_GET_TOKEN: "/actions/getcsrftoken/"
	};

	/**
	 * Entity that handles ABAP transport related information.
	 * @alias sap.ui.fl.write._internal.transport.Transports
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.74.0
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.transport
	 */

	return {

		/**
		 * Reads the transports of the current user from the back end.
		 * The "locked" attribute indicates that the provided file (package/name/type) is already locked on this transport.
		 *
		 * @param {object} mParameters - Map of parameters
		 * @param {string} mParameters.package - ABAP package; only relevant for VENDOR layer
		 * @param {string} mParameters.name - Name of the LREP entity
		 * @param {string} mParameters.namespace - Namespace of the LREP entity
		 * @param {string} mParameters.type - File type of the LREP entity
		 * @returns {Promise} with parameter <code>oResult</code>
		 * 					which is an object that has the attributes "transports", "localonly" and "errorCode".
		 * 					"localonly" tells the consumer if only local development is valid and no transport selection should take place.
		 * 					"transports" is an array of objects with attributes "transportId", "owner", "description", "locked"(true/false).
		 * 					"errorCode" can have the values "INVALID_PACKAGE" or "NO_TRANSPORTS" or is an empty string if there is no error.
		 * @public
		 */
		getTransports: function (mParameters) {
			if (FlexUtils.getClient()) {
				mParameters["sap-client"] = FlexUtils.getClient();
			}
			var sGetTransportsUrl = ApplyUtils.getUrl(ROUTES.ACTION_GET_TRANSPORTS, {url: LREP_CONNECTOR_CONFIG_URL}, mParameters);
			//decode url before sending to ABAP back end which does not expect encoded special character such as "/" in the package name
			sGetTransportsUrl = decodeURIComponent(sGetTransportsUrl);
			return ApplyUtils.sendRequest(sGetTransportsUrl, "GET").then(function (oResponse) {
				if (oResponse.response) {
					if (!oResponse.response.localonly) {
						oResponse.response.localonly = false;
					}
					if (!oResponse.response.errorCode) {
						oResponse.response.errorCode = "";
					}
					return Promise.resolve(oResponse.response);
				}

				return Promise.reject('response is empty');
			});
		},

		/**
		 * Reads the transports of the current user from the back end;
		 * The "locked" attribute indicates that the provided file (package/name/type) is already locked on this transport.
		 *
		 * @param {object} mParameters Map of parameters, see below
		 * @param {string} mParameters.transportId ABAP transport ID
		 * @param {string} mParameters.changeIds Array of change ID objects with attributes "namespace", "fileName", "fileType"
		 * @param {string} mParameters.reference Application ID of the changes which should be transported
		 * @returns {Promise} without parameters
		 * @public
		 */
		makeChangesTransportable: function (mParameters) {
			if (!mParameters.transportId) {
				return Promise.reject(new Error("no transportId provided as attribute of mParameters"));
			}
			if (!mParameters.changeIds) {
				return Promise.reject(new Error("no changeIds provided as attribute of mParameters"));
			}
			if (!mParameters.reference) {
				return Promise.reject(new Error("no reference provided as attribute of mParameters"));
			}
			var mUrlParams = FlexUtils.getClient() ? {"sap-client" : FlexUtils.getClient()} : {};

			var sMakeChangesTransportableUrl = ApplyUtils.getUrl(ROUTES.ACTION_MAKE_CHANGE_TRANSPORTABLE, {url: LREP_CONNECTOR_CONFIG_URL}, mUrlParams);
			var sTokenUrl = ApplyUtils.getUrl(ROUTES.ACTION_GET_TOKEN, {url: LREP_CONNECTOR_CONFIG_URL});
			var oRequestOption = WriteUtils.getRequestOptions(
				ApplyLrepConnector,
				sTokenUrl,
				mParameters,
				"application/json; charset=utf-8", "json"
			);
			return WriteUtils.sendRequest(sMakeChangesTransportableUrl, "POST", oRequestOption);
		},

		/**
		 * Get list of changes which should be added to a transport
		 *
		 * @param {Array} aLocalChanges List of changes which data have to be extracted
		 * @param {Array} [aAppVariantDescriptors] List of app variant descriptors which data have to be extracted
		 * @returns {Array} Returns an array of object containing all required data to transport the existing local changes
		 */
		convertToChangeTransportData: function (aLocalChanges, aAppVariantDescriptors) {
			var aTransportData = [];
			var i;

			if (aAppVariantDescriptors && aAppVariantDescriptors.length) {
				for (i = 0; i < aAppVariantDescriptors.length; i++) {
					var oAppVariantDescriptor = aAppVariantDescriptors[i];
					var oPreparedData = {};
					oPreparedData.namespace = oAppVariantDescriptor.getNamespace();
					oPreparedData.fileName = oAppVariantDescriptor.getDefinition().fileName;
					oPreparedData.fileType = oAppVariantDescriptor.getDefinition().fileType;
					aTransportData.push(oPreparedData);
				}
			}

			var len = aLocalChanges.length;
			for (i = 0; i < len; i++) {
				var oCurrentChange = aLocalChanges[i];
				var oData = {};
				oData.namespace = oCurrentChange.getNamespace();
				oData.fileName = oCurrentChange.getId();
				oData.fileType = oCurrentChange.getDefinition().fileType;
				aTransportData.push(oData);
			}
			return aTransportData;
		}
	};
}, true);
