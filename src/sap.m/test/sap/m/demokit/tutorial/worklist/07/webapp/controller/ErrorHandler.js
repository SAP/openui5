sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/MessageBox"
], function(Object, MessageBox) {
	"use strict";

	return Object.extend("myCompany.myApp.controller.ErrorHandler", {

		/**
		 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
		 * @class
		 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
		 * @public
		 * @alias myCompany.myApp.controller.ErrorHandler
		 */
		constructor: function(oComponent) {
			this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
			this._oComponent = oComponent;
			this._oModel = oComponent.getModel();
			this._bMessageOpen = false;
			this._sErrorText = this._oResourceBundle.getText("errorText");

			this._oModel.attachMetadataFailed(function(oEvent) {
				var oParams = oEvent.getParameters();
				this._showMetadataError(oParams.response);
			}, this);

			this._oModel.attachRequestFailed(function(oEvent) {
				var oParams = oEvent.getParameters();

				// An entity that was not found in the service is also throwing a 404 error in oData.
				// We already cover this case with a notFound target so we skip it here.
				// A request that cannot be sent to the server is a technical error that we have to handle though
				if (oParams.response.statusCode !== "404" || (oParams.response.statusCode === 404 && oParams.response.responseText.indexOf(
					"Cannot POST") === 0)) {
					this._showServiceError(oParams.response);
				}
			}, this);
		},

		/**
		 * Shows a {@link sap.m.MessageBox} when the metadata call has failed.
		 * The user can try to refresh the metadata.
		 * @param {string} sDetails a technical error to be displayed on request
		 * @private
		 */
		_showMetadataError: function(sDetails) {
			MessageBox.error(
				this._sErrorText, {
					id: "metadataErrorMessageBox",
					details: sDetails,
					styleClass: this._oComponent.getContentDensityClass(),
					actions: [MessageBox.Action.RETRY, MessageBox.Action.CLOSE],
					onClose: function(sAction) {
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
		_showServiceError: function(sDetails) {
			if (this._bMessageOpen) {
				return;
			}
			this._bMessageOpen = true;
			MessageBox.error(
				this._sErrorText, {
					id: "serviceErrorMessageBox",
					details: sDetails,
					styleClass: this._oComponent.getContentDensityClass(),
					actions: [MessageBox.Action.CLOSE],
					onClose: function() {
						this._bMessageOpen = false;
					}.bind(this)
				}
			);
		}
	});
});