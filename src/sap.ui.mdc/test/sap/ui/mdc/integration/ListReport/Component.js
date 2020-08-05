/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/mdc/link/FakeFlpConnector"
], function (UIComponent, FakeLrepConnectorLocalStorage, FakeFlpConnector) {
	"use strict";

	return UIComponent.extend("sap.ui.v4demo.Component", {

		metadata : {
			manifest: "json"
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			this.getRouter().initialize();

			FakeLrepConnectorLocalStorage.enableFakeConnector();
			this.__initFakeFlpConnector();
		},
		__initFakeFlpConnector: function() {
			FakeFlpConnector.enableFakeConnector({
				'FakeFlpSemanticObject': {
					links: [
						{
							action: "action_01",
							intent: "?testsuite_mdc_internal_LinkInTable_MainNavigationAction_00#link",
							text: "{title}",
							icon: "/testsuite/test-resources/sap/ui/documentation/sdk/images/HT-1031.jpg",
							description: "{author/name}"
						},
						{
							action: "action_02",
							intent: "?testsuite_mdc_internal_LinkInTable_Actions_01#link",
							text: "Display Description",
							description: "Transaction code DD"
						},
						{
							action: "action_03",
							text: "Review Description",
							description: "Transaction code DR",
							icon: "sap-icon://to-be-reviewed",
							intent: "?testsuite_mdc_internal_LinkInTable_Actions_02#link"
						},
						{
							action: "action_04",
							text: "Edit Description",
							description: "Transaction code DE",
							icon: "sap-icon://user-edit",
							intent: "?testsuite_mdc_internal_LinkInTable_Actions_03#link"
						},
						{
							action: "action_05",
							text: "Superior",
							description: "Transaction SHELL",
							icon: "sap-icon://mileage",
							intent: "?testsuite_mdc_internal_LinkInTable_Actions_04#link",
							isSuperior: true
						},
						{
							action: "action_06",
							text: "Edit Description (Additional)",
							icon: "sap-icon://edit",
							intent: "?testsuite_mdc_internal_LinkInTable_AdditionalActions_01#link",
							isSuperior: true
						},
						{
							action: "action_07",
							text: "Review Description (Additional)",
							icon: "sap-icon://pixelate",
							intent: "?testsuite_mdc_internal_LinkInTable_AdditionalActions_02#link",
							isSuperior: true
						}
					]
				}
			});
		}

	});
});
