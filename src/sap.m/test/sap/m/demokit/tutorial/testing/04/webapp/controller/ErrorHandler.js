sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/MessageBox"
], function (BaseObject, MessageBox) {
	"use strict";

	return BaseObject.extend("sap.ui.demo.bulletinboard.controller.ErrorHandler", {

		/**
		 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
		 *
		 * @class
		 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
		 * @public
		 * @alias sap.ui.demo.mdtemplate.controller.ErrorHandler
		 */
		constructor: function (oComponent) {
			this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
			this._oComponent = oComponent;
			this._oModel = oComponent.getModel();
			this._bMessageOpen = false;
			this._sErrorTitle = this._oResourceBundle.getText("errorTitle");
			this._sErrorText = this._oResourceBundle.getText("errorText");

			this._oModel.attachEvent("metadataFailed", function (oEvent) {
				var oParams = oEvent.getParameters();

				this._showMetadataError(
					oParams.statusCode + " (" + oParams.statusText + ")\r\n" +
					oParams.message + "\r\n" +
					oParams.responseText + "\r\n"
				);
			}, this);

			this._oModel.attachEvent("requestFailed", function (oEvent) {
				var oParams = oEvent.getParameters();

				// An entity that was not found in the service is also throwing a 404 error in oData.
				// We already cover this case with a notFound target so we skip it here.
				// A request that cannot be sent to the server is a technical error that we have to handle though
				if (oParams.response.statusCode !== "404" || (oParams.response.statusCode === 404 && oParams.response.responseText.indexOf("Cannot POST") === 0)) {
					this._showServiceError(
						oParams.response.statusCode + " (" + oParams.response.statusText + ")\r\n" +
						oParams.response.message + "\r\n" +
						oParams.response.responseText + "\r\n"
					);
				}
			}, this);
		},

		/**
		 * Shows a {@link sap.m.MessageBox} when the metadata call has failed.
		 * The user can try to refresh the metadata.
		 *
		 * @param {string} sDetails a technical error to be displayed on request
		 * @private
		 */
		_showMetadataError: function (sDetails) {
			MessageBox.show(
				this._sErrorText,
				{
					id: "metadataErrorMessageBox",
					icon: MessageBox.Icon.ERROR,
					title: this._sErrorTitle,
					details: sDetails,
					styleClass: this._oComponent.getCompactCozyClass(),
					actions: [MessageBox.Action.RETRY, MessageBox.Action.CLOSE],
					onClose: function (sAction) {
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
		 *
		 * @param {string} sDetails a technical error to be displayed on request
		 * @private
		 */
		_showServiceError: function (sDetails) {
			if (this._bMessageOpen) {
				return;
			}
			this._bMessageOpen = true;
			MessageBox.show(
				this._sErrorText,
				{
					id: "serviceErrorMessageBox",
					icon: MessageBox.Icon.ERROR,
					title: this._sErrorTitle,
					details: sDetails,
					styleClass: this._oComponent.getCompactCozyClass(),
					actions: [MessageBox.Action.CLOSE],
					onClose: function () {
						this._bMessageOpen = false;
					}.bind(this)
				}
			);
		}

	});

});
