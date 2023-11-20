sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], (UIComponent, JSONModel) => {
	"use strict";

	return UIComponent.extend("ui5.walkthrough.Component", {
		metadata: {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		},

		init() {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// set data model on view
			const oData = {
				recipient: {
					name: "World"
				}
			};
			const oModel = new JSONModel(oData);
			this.setModel(oModel);

			// Show an alert, if service is not reachable (see step 25 for details)
			this.getModel("invoice").attachEventOnce("metadataFailed", function (oEvent) {
				/*eslint-disable no-alert */
				alert("Request to the OData remote service failed.\nDownload the sample to your local machine and read the Walkthrough Tutorial Step 25 to see any data here.");
				/*eslint-enable no-alert */
			});
		}
	});
});
