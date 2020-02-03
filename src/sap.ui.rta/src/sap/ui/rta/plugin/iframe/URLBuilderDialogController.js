/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/rta/Utils",
	"sap/base/Log",
	"sap/ui/rta/plugin/iframe/urlCleaner"
], function(
	Controller,
	Filter,
	FilterOperator,
	Utils,
	Log,
	urlCleaner
) {
	"use strict";

	return Controller.extend("sap.ui.rta.plugin.iframe.URLBuilderDialogController", {
		constructor: function(oJSONModel, mParameters) {
			this._oJSONModel = oJSONModel;
			this._importParameters(mParameters);
			this._mParameterHashMap = this._buildParameterHashMap(mParameters);
		},

		/**
		 * Event handler for Show Preview button
		 */
		onShowPreview: function() {
			var sURL = this._buildPreviewURL(this._buildReturnedURL());
			var oIframe = sap.ui.getCore().byId("sapUiRtaUrlBuilderIframe");
			oIframe.setUrl("about:blank"); // Resets the preview first
			try {
				this._oJSONModel.setProperty("/previewUrl/value", sURL);
				oIframe.setUrl(sURL);
			} catch (oError) {
				Log.error("Error previewing the URL: ", oError);
			}
		},

		/**
		 * Event handler for pressing a parameter
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onParameterPress: function(oEvent) {
			var sKey = oEvent.getSource().getBindingContext().getObject().key;
			this._oJSONModel.setProperty("/editURL/value", this._addURLParameter(sKey));
		},

		/**
		 * Event handler for search
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onSearch: function(oEvent) {
			var oFilter = new Filter("label", FilterOperator.Contains, oEvent.getParameter("query"));
			var oBinding = sap.ui.getCore().byId("sapUiRtaUrlBuilderParameterTable").getBinding("items");
			oBinding.filter([oFilter]);
		},

		/**
		 * Event handler for OK button
		 */
		onSavePress: function() {
			this._close(this._buildReturnedURL());
		},

		/**
		 * Event handler for Cancel button
		 */
		onCancelPress: function() {
			this._close();
		},

		/**
		 * Close URL Builder Dialog
		 *
		 * @param {object|undefined} mReturnedURL - URL to be returned
		 * @private
		 */
		_close: function(mReturnedURL) {
			var oURLBuilderDialog = sap.ui.getCore().byId("sapUiRtaURLBuilderDialog");
			this._mReturnedURL = mReturnedURL;
			oURLBuilderDialog.close();
		},

		/**
		 * Get built URL
		 *
		 * @returns {object|undefined} Built URL
		 * @public
		 */
		getURL: function() {
			return this._mReturnedURL;
		},

		/**
		 * Import parameters
		 *
		 * @param {object} mParameters - URL parameters
		 * @private
		 */
		_importParameters: function(mParameters) {
			if (mParameters) {
				Object.keys(mParameters).forEach(function(sFieldName) {
					this._oJSONModel.setProperty("/" + sFieldName + "/value", mParameters[sFieldName]);
				}, this);
			}
		},

		/**
		 * Build preview URL
		 *
		 * @param {string} sEditURL - URL with parameters in braces
		 * @returns {string} URL with parameters and values
		 * @private
		 */
		_buildPreviewURL: function(sEditURL) {
			return sEditURL.replace(/{(.*?)}/g, function(sMatch) {
				return this._mParameterHashMap[sMatch];
			}.bind(this));
		},

		/**
		 * Add URL parameter
		 *
		 * @param {string} sParameter - URL parameter
		 * @returns {string} URL with the added parameter
		 * @private
		 */
		_addURLParameter: function(sParameter) {
			return this._buildReturnedURL() + sParameter;
		},

		/**
		 * Build URL to be returned
		 *
		 * @returns {string} URL to be returned
		 * @private
		 */
		_buildReturnedURL: function() {
			return urlCleaner(this._oJSONModel.getProperty("/editURL/value"));
		},

		/**
		 * Build hashmap for parameters
		 *
		 * @param {object} mParameters - URL parameters
		 * @returns {object} Parameter hashmap
		 * @private
		 */
		_buildParameterHashMap: function(mParameters) {
			if (mParameters && mParameters.parameters) {
				return Utils.buildHashMapFromArray(mParameters.parameters, "key", "value");
			}
			return {};
		}
	});
});
