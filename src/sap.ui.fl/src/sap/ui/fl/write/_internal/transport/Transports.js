/*!
 * ${copyright}
 */
/*global Promise */

sap.ui.define([
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/Utils"
], function(LrepConnector, FlexUtils) {
	"use strict";

	/**
	 * Entity that handles ABAP transport related information.
	 * @constructor
	 * @alias sap.ui.fl.write._internal.transport.Transports
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.74.0
	 */
	var Transports = function() {
	};

	/**
	 * Reads the transports of the current user from the back end.
	 * The "locked" attribute indicates that the provided file (package/name/type) is already locked on this transport.
	 *
	 * @param {object} mParameters map of parameters, see below
	 * @param {string} mParameters.package - abap package; only relevant for VENDOR layer
	 * @param {string} mParameters.name - name of the lrep document
	 * @param {string} mParameters.namespace - namespace of the lrep document
	 * @param {string} mParameters.type - file extension of the lrep document
	 * @returns {Promise} with parameter <code>oResult</code>
	 * 					which is an object that has the attributes "transports", "localonly" and "errorCode".
	 * 					"localonly" tells the consumer if only local development is valid and no transport selection should take place.
	 * 					"transports" is an array of objects with attributes "transportId", "owner", "description", "locked"(true/false).
	 * 					"errorCode" can have the values "INVALID_PACKAGE" or "NO_TRANSPORTS" or is an empty string if there is no error.
	 * @public
	 */
	Transports.prototype.getTransports = function(mParameters) {
		var sUri;
		var sClient;
		var oLrepConnector;
		var oPromise;
		sUri = '/sap/bc/lrep/actions/gettransports/';
		if (mParameters['package']) {
			sUri += '&package=' + mParameters['package'];
		}
		if (mParameters.name) {
			sUri += '&name=' + mParameters.name;
		}
		if (mParameters.namespace) {
			sUri += '&namespace=' + mParameters.namespace;
		}
		if (mParameters.type) {
			sUri += '&type=' + mParameters.type;
		}
		sClient = FlexUtils.getClient();
		if (sClient) {
			sUri += '&sap-client=' + sClient;
		}
		//Replace first & with ?
		sUri = sUri.replace('&', '?');

		oLrepConnector = LrepConnector.createConnector();
		oPromise = oLrepConnector.send(sUri);
		return oPromise.then(function(oResponse) {
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
	};

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
	Transports.prototype.makeChangesTransportable = function(mParameters) {
		var sUri;
		var sClient;
		var oLrepConnector;
		sUri = '/sap/bc/lrep/actions/make_changes_transportable/';
		sClient = FlexUtils.getClient();
		if (sClient) {
			sUri += '?sap-client=' + sClient;
		}
		if (!mParameters.transportId) {
			return Promise.reject(new Error("no transportId provided as attribute of mParameters"));
		}
		if (!mParameters.changeIds) {
			return Promise.reject(new Error("no changeIds provided as attribute of mParameters"));
		}
		oLrepConnector = LrepConnector.createConnector();
		return oLrepConnector.send(sUri, 'POST', mParameters);
	};

	/**
	 * Get list of changes which should be added to a transport
	 *
	 * @param {Array} aLocalChanges List of changes which data have to be extracted
	 * @param {Array} [aAppVariantDescriptors] List of app variant descriptors which data have to be extracted
	 * @returns {Array} Returns an array of object containing all required data to transport the existing local changes
	 */
	Transports.prototype._convertToChangeTransportData = function(aLocalChanges, aAppVariantDescriptors) {
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
	};

	return Transports;
}, /* bExport= */true);
