/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/base/Object",
		"sap/m/MessageBox"
	], function (UI5Object, MessageBox) {
		"use strict";

		return UI5Object.extend("sap.ui.documentation.sdk.controller.ErrorHandler", {

			/**
			 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
			 * @class
			 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
			 * @public
			 * @alias sap.ui.documentation.sdk.controller.ErrorHandler
			 */
			constructor : function (oComponent) {
				this._oComponent = oComponent;
				this._oModel = oComponent.getModel();
				this._bMessageOpen = false;
				this._sErrorText = "Sorry, a technical error occurred! Please try again later.";
			},

			/**
			 * Shows a {@link sap.m.MessageBox} when the metadata call has failed.
			 * The user can try to refresh the metadata.
			 * @param {string} sDetails a technical error to be displayed on request
			 * @private
			 */
			_showMetadataError : function (sDetails) {
				MessageBox.error(
					this._sErrorText,
					{
						id : "metadataErrorMessageBox",
						details : sDetails,
						styleClass : this._oComponent.getContentDensityClass(),
						actions : [MessageBox.Action.RETRY, MessageBox.Action.CLOSE],
						onClose : function (sAction) {
							if (sAction === MessageBox.Action.RETRY) {
								this._oModel.refreshMetadata();
							}
						}.bind(this)
					}
				);
			},

			/**
			 * Shows a {@link sap.m.MessageBox} when a service call has failed.
			 * Only the first error message will be display.
			 * @param {string} sDetails a technical error to be displayed on request
			 * @private
			 */
			_showServiceError : function (sDetails) {
				if (this._bMessageOpen) {
					return;
				}
				this._bMessageOpen = true;
				MessageBox.error(
					this._sErrorText,
					{
						id : "serviceErrorMessageBox",
						details : sDetails,
						styleClass : this._oComponent.getContentDensityClass(),
						actions : [MessageBox.Action.CLOSE],
						onClose : function () {
							this._bMessageOpen = false;
						}.bind(this)
					}
				);
			}

		});

	}
);
