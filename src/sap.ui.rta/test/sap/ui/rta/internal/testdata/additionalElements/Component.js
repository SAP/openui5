sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPAccess",
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPExtensibilityVariant",
	"sap/ui/model/json/JSONModel",
	"sap/m/App",
	"sap/m/MessageBox",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Core"
], function(
	UIComponent,
	ABAPAccess,
	ABAPExtensibilityVariant,
	JSONModel,
	App,
	MessageBox,
	XMLView,
	oCore
) {
	"use strict";

	return UIComponent.extend("sap.ui.rta.test.additionalElements.Component", {
		metadata: {
			manifest: "json"
		},

		init(...aArgs) {
			this._enableExtensibility();

			this._bShowAdaptButton = !!this.getComponentData().showAdaptButton;
			UIComponent.prototype.init.apply(this, aArgs);
		},

		/**
		 * Initialize the application
		 *
		 * @returns {sap.ui.core.Control} the content
		 */
		createContent() {
			var oApp = new App();

			var oModel = new JSONModel({
				showAdaptButton: this._bShowAdaptButton
			});
			this.oView = XMLView.create({
				id: this.createId("idMain1"),
				viewName: "sap.ui.rta.test.additionalElements.ComplexTest"
			}).then(function(oPage) {
				oPage.setModel(oModel, "view");
				oApp.addPage(oPage);
				return oPage;
			});

			return oApp;
		},

		/**
		 * Create stub answers from extensibility service
		 * @private
		 */
		_enableExtensibility() {
			var aExtensionData;
			ABAPAccess.getExtensionData = function(sServiceUri, sEntityTypeName, sEntitySetName) {
				aExtensionData = [{ businessContext: `${sEntityTypeName} EntityTypeContext`, description: "Other BusinessContext description" }, { businessContext: `${sEntitySetName} EntitySetContext`, description: "Some BusinessContext description"}];
				return Promise.resolve({
					extensionData: aExtensionData,
					entityType: sEntityTypeName,
					serviceVersion: "some dummy ServiceVersion 0.0.1",
					serviceName: sServiceUri
				});
			};

			ABAPExtensibilityVariant.prototype.getNavigationUri = function() {
				return Promise.resolve("./extensibilityTool.html");
			};

			var oUshellContainer = sap.ui.require("sap/ushell/Container");
			if (oUshellContainer) {
				ABAPAccess.isExtensibilityEnabled = function() {
					return Promise.resolve(true);
				};
			}

			oCore.getEventBus().subscribe("sap.ui.core.UnrecoverableClientStateCorruption", "RequestReload", function() {
				MessageBox.warning("Service Outdated, Please restart the UI - In real world other dialog will come up, that can restart the UI");
			});
		}
	});
});
