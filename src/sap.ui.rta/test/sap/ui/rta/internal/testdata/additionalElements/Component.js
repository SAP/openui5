/*global URI*/

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPAccess",
	"sap/ui/model/json/JSONModel",
	"sap/m/App",
	"sap/ui/core/library",
	"sap/ui/core/mvc/XMLView"
], function(
	UIComponent,
	ABAPAccess,
	JSONModel,
	App,
	library,
	XMLView
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
			ABAPAccess.getExtensionData = function(sServiceUri, sEntityTypeName, sEntitySetName) {
				return Promise.resolve({
					BusinessContexts: [{ BusinessContext: sEntityTypeName + " EntityTypeContext", BusinessContextDescription: "Other BusinessContext description" }, { BusinessContext: sEntitySetName + " EntitySetContext", BusinessContextDescription: "Some BusinessContext description"}],
					ServiceName: sServiceUri,
					ServiceVersion: "some dummy ServiceVersion 0.0.1",
					EntityType: sEntityTypeName
				});
			};

			ABAPAccess.isExtensibilityEnabled = function() {
				return Promise.resolve(true);
			};

			sap.ushell = Object.assign({}, sap.ushell, {
				Container: {
					getService: function() {
						return {
							hrefForExternal: function(mData) {
								return "./testdata/additionalElements/extensibilityTool.html?" + URI.encodeQuery(JSON.stringify(mData));
							},
							parseShellHash: function() {
								//dummy
							},
							registerNavigationFilter: function() {
								//dummy
							},
							unregisterNavigationFilter: function() {
								//dummy
							},
							getUser: function() {
								//dummy
							}

						};
					},
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
					},
					setDirtyFlag: function() {
						return true;
					}
				}
			});

			sap.ui.getCore().getEventBus().subscribe("sap.ui.core.UnrecoverableClientStateCorruption", "RequestReload", function() {
				sap.m.MessageBox.warning("Service Outdated, Please restart the UI - In real world other dialog will come up, that can restart the UI");
			});
		}
	});
});
