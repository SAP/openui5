sap.ui.define(["sap/ui/integration/Extension", 'sap/m/MessageToast'
], function (Extension, MessageToast) {
	"use strict";

	var CustomizedActionsExtension = Extension.extend("adaptivecard.embedded.CustomizedActionsExtension");

	CustomizedActionsExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);
		this.attachAction(this._handleAction.bind(this));
	};

	/* Custom event handler for the submit event.
	Intercepts submit action, performs validation and data modifications. */
	CustomizedActionsExtension.prototype._handleAction = function (oEvent) {
		var oCard = this.getCard(),
			sActionType = oEvent.getParameter("type"),
			mParams = oEvent.getParameter("parameters"),
			mSubmitData = mParams.data;

		if (sActionType !== "Submit") {
			return;
		}

		oEvent.preventDefault();

		// Validates and modifies data before submitting it
		if (mSubmitData.Name === "Enter you name") {
			oCard.showMessage("Please enter you name", "Error");
		} else if (mSubmitData.Name === "") {
			oCard.showMessage("You can't submit an empty name", "Error");
		} else {
			// Submits to a mock server
			oCard.request({
				"url": "../adaptive/extensionSample/MOCK.json",
				"method": "GET",
				"parameters": mSubmitData
			}).then(function () {
				oCard.showMessage("Your name has been submitted successfully", "Success");
			}).catch(function(sErrorMessage) {
				oCard.showMessage(sErrorMessage, "Error");
			});
		}

		MessageToast.show("This submit action was modified with extension module", {
			at: "center center",
			width: "25rem"
		});
	};

	return CustomizedActionsExtension;
});
