sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var SampleExtension = Extension.extend("card.explorer.object.formWithExtension.SampleExtension");

	SampleExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);
		this.attachAction(this._handleAction.bind(this));
	};

	/* Custom event handler for the submit event.
	Intercepts submit action, performs validation and/or data modifications. */
	SampleExtension.prototype._handleAction = function (oEvent) {
		var oCard = this.getCard(),
			sActionType = oEvent.getParameter("type"),
			mFormData = oEvent.getParameter("formData");

		if (sActionType !== "Submit") {
			return;
		}

		oEvent.preventDefault();

		// Validation
		if (!oCard.validateControls()) {
			oCard.showMessage("{i18n>ERROR_PLEASE_FILL_REQUIRED_FIELDS}", "Error");
			return;
		}

		// Submits to a mock server
		oCard.request({
			"url": "./MOCK.json",
			"method": "GET",
			"parameters": {
				reason: mFormData.reason.key,
				comment: mFormData.comment
			}
		}).then(function () {
			oCard.showMessage("{i18n>SUCCESSFUL_SUBMIT}", "Success");
		}).catch(function (sErrorMessage) {
			oCard.showMessage(sErrorMessage, "Error");
		});
	};

	SampleExtension.prototype.validateAge = function (sValue) {
		return parseInt(sValue) >= 18;
	};

	return SampleExtension;
});
