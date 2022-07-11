sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPAccess",
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPExtensibilityVariant",
	"sap/ui/model/json/JSONModel",
	"sap/m/App",
	"sap/m/MessageBox",
	"sap/ui/core/mvc/XMLView",
	"sap/base/util/ObjectPath",
	"sap/ui/core/Core"
], function(
	UIComponent,
	ABAPAccess,
	ABAPExtensibilityVariant,
	JSONModel,
	App,
	MessageBox,
	XMLView,
	ObjectPath,
	oCore
) {
	"use strict";

	return UIComponent.extend("sap.ui.rta.test.additionalElements.Component", {
		metadata: {
			manifest: "json"
		},

		init: function() {
			this._enableExtensibility();

			this._bShowAdaptButton = !!this.getComponentData().showAdaptButton;
			UIComponent.prototype.init.apply(this, arguments);
		},

		/**
		 * Initialize the application
		 *
		 * @returns {sap.ui.core.Control} the content
		 */
		createContent: function() {
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
		_enableExtensibility: function () {
			var aExtensionData;
			ABAPAccess.getExtensionData = function(sServiceUri, sEntityTypeName, sEntitySetName) {
				aExtensionData = [{ businessContext: sEntityTypeName + " EntityTypeContext", description: "Other BusinessContext description" }, { businessContext: sEntitySetName + " EntitySetContext", description: "Some BusinessContext description"}];
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

			var oUshellContainer = ObjectPath.get("sap.ushell.Container");
			if (oUshellContainer) {
				ABAPAccess.isExtensibilityEnabled = function() {
					return Promise.resolve(true);
				};
				sap.ushell.Container = Object.assign({}, sap.ushell.Container, {
					getLogonSystem: function() {
						return {
							getName: function() {
								return "ABC";
							},
							getClient: function() {
								return "123";
							},
							isTrial: function() {
								return false;
							}
						};
					}
				});
			}

			oCore.getEventBus().subscribe("sap.ui.core.UnrecoverableClientStateCorruption", "RequestReload", function() {
				MessageBox.warning("Service Outdated, Please restart the UI - In real world other dialog will come up, that can restart the UI");
			});
		}
	});
});
