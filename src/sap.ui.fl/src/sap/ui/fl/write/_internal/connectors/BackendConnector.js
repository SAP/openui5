/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/BackendConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/base/util/restricted/_pick"
], function(
	merge,
	BaseConnector,
	ApplyConnector,
	ApplyUtils,
	WriteUtils,
	_pick
) {
	"use strict";

	/**
	 * Send request to a back end to write or update flex data.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.method - POST for writing new data and PUT for update an existing data
	 * @param {object[]} [mPropertyBag.flexObjects] - Objects to be written (i.e. change definitions, variant definitions etc.)
	 * @param {object} [mPropertyBag.flexObject] - Object to be updated
	 * @param {string} mPropertyBag.url Configured - url for the connector
	 * @param {boolean} [mPropertyBag.draft=false] - Indicates if changes should be written as a draft
	 * @returns {Promise} Promise resolves as soon as the writing was completed
	 */
	function _doWrite(mPropertyBag) {
		var mParameters = {};
		if (mPropertyBag.draft) {
			// TODO: As soon as drafts can be based on other versions the parentVersion must be passed down from higher layers
			mParameters.parentVersion = "";
		}

		var sWriteUrl = ApplyUtils.getUrl(this.ROUTES.CHANGES, mPropertyBag, mParameters);
		delete mPropertyBag.fileName;
		var sTokenUrl = ApplyUtils.getUrl(this.ROUTES.TOKEN, mPropertyBag, mParameters);

		var oRequestOption = WriteUtils.getRequestOptions(
			this.applyConnector,
			sTokenUrl,
			mPropertyBag.flexObjects || mPropertyBag.flexObject,
			"application/json; charset=utf-8",
			"json"
		);
		return WriteUtils.sendRequest(sWriteUrl, mPropertyBag.method, oRequestOption);
	}

	/**
	 * Send request to a back end to write or update a single flex data.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.method - POST for writing new data and PUT for update an existing data
	 * @param {object} mPropertyBag.flexObject - Object to be updated
	 * @param {string} mPropertyBag.url - Configured url for the connector
	 * @returns {Promise} Promise resolves as soon as the writing was completed
	 */
	function _doSingleWrite(mPropertyBag) {
		mPropertyBag.fileName = mPropertyBag.flexObject.fileName;
		return _doWrite.call(this, mPropertyBag);
	}

	/**
	 * Base connector for saving and deleting data flexibility data from an back end.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.BackendConnector
	 * @since 1.72
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.connectors
	 */
	var BackendConnector = merge({}, BaseConnector, /** @lends sap.ui.fl.write._internal.connectors.BackendConnector */ {

		xsrfToken: null,

		/**
		 * Resets flexibility files for a given application.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} mPropertyBag.reference - Flex reference of the application
		 * @param {string} mPropertyBag.url - Configured url for the connector
		 * @param {string} [mPropertyBag.appVersion] - Version of the application for which the reset takes place
		 * @param {string} [mPropertyBag.generator] - Generator with which the changes were created
		 * @param {string} [mPropertyBag.selectorIds] - Selector IDs of controls for which the reset should filter (comma-separated list)
		 * @param {string} [mPropertyBag.changeTypes] - Change types of the changes which should be reset (comma-separated list)
		 * @returns {Promise} Promise resolves as soon as the reset has completed
		 */
		reset: function (mPropertyBag) {
			var aParameters = ["reference", "appVersion", "generator"];
			var mParameters = _pick(mPropertyBag, aParameters);
			if (mPropertyBag.selectorIds) {
				mParameters.selector = mPropertyBag.selectorIds;
			}
			if (mPropertyBag.changeTypes) {
				mParameters.changeType = mPropertyBag.changeTypes;
			}
			delete mPropertyBag.reference;

			var sResetUrl = ApplyUtils.getUrl(this.ROUTES.CHANGES, mPropertyBag, mParameters);

			var sTokenUrl = ApplyUtils.getUrl(this.ROUTES.TOKEN, mPropertyBag);

			var oRequestOption = WriteUtils.getRequestOptions(
				this.applyConnector,
				sTokenUrl
			);
			return WriteUtils.sendRequest(sResetUrl, "DELETE", oRequestOption);
		},

		/**
		 * Write flex data into a back end; This method is called with a list of entities like changes, variants,
		 * control variants, variant changes and variant management changes.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {object[]} mPropertyBag.flexObjects - Objects to be written (i.e. change definitions, variant definitions etc.)
		 * @param {string} mPropertyBag.url - Configured url for the connector
		 * @param {boolean} [mPropertyBag.draft=false] - Indicates if changes should be written as a draft
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 */
		write: function (mPropertyBag) {
			mPropertyBag.method = "POST";
			return _doWrite.call(this, mPropertyBag);
		},

		/**
		 * Update an existing flex data stored in the back end.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {object} mPropertyBag.flexObject - Flex Object to be updated
		 * @param {string} mPropertyBag.url - Configured url for the connector
		 * @returns {Promise} Resolves as soon as the writing is completed without data
		 */
		update: function (mPropertyBag) {
			mPropertyBag.method = "PUT";
			return _doSingleWrite.call(this, mPropertyBag);
		},

		/**
		 * Delete an existing flex data stored in the back end.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {object} mPropertyBag.flexObject - Flex Object to be deleted
		 * @param {string} mPropertyBag.url - Configured url for the connector
		 * @returns {Promise} Resolves as soon as the deletion is completed without data
		 */
		remove: function (mPropertyBag) {
			var mParameters = {
				namespace: mPropertyBag.flexObject.namespace
			};
			mPropertyBag.fileName = mPropertyBag.flexObject.fileName;
			var sDeleteUrl = ApplyUtils.getUrl(this.ROUTES.CHANGES, mPropertyBag, mParameters);
			delete mPropertyBag.fileName;
			var sTokenUrl = ApplyUtils.getUrl(this.ROUTES.TOKEN, mPropertyBag);

			var oRequestOption = WriteUtils.getRequestOptions(
				this.applyConnector,
				sTokenUrl,
				undefined,
				"application/json; charset=utf-8",
				"json"
			);
			return WriteUtils.sendRequest(sDeleteUrl, "DELETE", oRequestOption);
		},

		/**
		 * Called to get the flex features.
		 *
		 * @returns {Promise<object>} Promise resolves with an object containing the flex features
		 */
		loadFeatures: function (mPropertyBag) {
			if (this.applyConnector.settings) {
				return Promise.resolve({response: this.applyConnector.settings});
			}
			var sFeaturesUrl = ApplyUtils.getUrl(this.ROUTES.SETTINGS, mPropertyBag);
			return ApplyUtils.sendRequest(sFeaturesUrl).then(function (oResult) {
				return oResult.response;
			});
		}
	});

	BackendConnector.applyConnector = ApplyConnector;
	return BackendConnector;
}, true);
