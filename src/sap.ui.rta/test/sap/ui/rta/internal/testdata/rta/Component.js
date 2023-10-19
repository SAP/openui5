sap.ui.define([
	"sap/m/App",
	"sap/ui/core/UIComponent",
	"sap/ui/rta/test/SmartLinkUtil",
	"sap/ui/core/CustomData",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel"
], function(
	App,
	UIComponent,
	SmartLinkUtil,
	CustomData,
	XMLView,
	JSONModel
) {
	"use strict";

	return UIComponent.extend("sap.ui.rta.test.Component", {
		metadata: {
			manifest: "json"
		},

		init(...aArgs) {
			this._bShowAdaptButton = !!this.getComponentData().showAdaptButton;
			UIComponent.prototype.init.apply(this, aArgs);
		},

		/**
		 * Initialize the application
		 *
		 * @returns {sap.ui.core.Control} the content
		 */
		createContent() {
			SmartLinkUtil.mockUShellServices();

			// app specific setup
			var oApp = new App({
				id: this.createId("app"),
				customData: [new CustomData({
					key: "sap-ui-custom-settings",
					value: {
						"sap.ui.dt": {
							designtime: "sap/ui/rta/test/InstanceSpecificScopedRoot.designtime"
						}
					}
				})]
			});

			var oModel = new JSONModel({
				showAdaptButton: this._bShowAdaptButton
			});

			this.oView = XMLView.create({
				id: this.createId("idMain1"),
				viewName: "sap.ui.rta.test.ComplexTest"
			}).then(function(oPage) {
				oPage.setModel(oModel, "view");
				oApp.addPage(oPage);
				return oPage;
			});

			return oApp;
		}
	});
});
