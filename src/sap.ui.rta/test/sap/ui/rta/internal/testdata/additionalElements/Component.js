/*global URI*/

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/fieldExt/Access",
	"sap/ui/model/json/JSONModel",
	"sap/m/App",
	"sap/ui/core/library"
], function(
	UIComponent,
	Access,
	JSONModel,
	App,
	library
) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = library.mvc.ViewType;

	return UIComponent.extend("sap.ui.rta.test.additionalElements.Component", {

		metadata: {
			manifest: "json"
		},

		init : function() {
			// app specific setup
			this._enableExtensibility();

			// default init methods
			this._bShowAdaptButton = this.getComponentData().showAdaptButton ? this.getComponentData().showAdaptButton : false;
			UIComponent.prototype.init.apply(this, arguments);
		},

		/**
		 * Initialize the application
		 *
		 * @returns {sap.ui.core.Control} the content
		 */
		createContent : function() {
			var oApp = new App();

			var oModel = new JSONModel({
				showAdaptButton : this._bShowAdaptButton
			});

			var oPage = sap.ui.view(this.createId("idMain1"), {
				viewName : "sap.ui.rta.test.additionalElements.ComplexTest",
				type : ViewType.XML,
				async: true
			});

			oPage.setModel(oModel, "view");

			oApp.addPage(oPage);

			return oApp;
		},

		/**
		 * Create stub answers from extensibility service
		 * @private
		 */
		_enableExtensibility: function () {
			Access.getBusinessContexts = function(sServiceUri, sEntityTypeName, sEntitySetName) {
				return Promise.resolve({
					BusinessContexts: [{ BusinessContext: sEntityTypeName + " EntityTypeContext", BusinessContextDescription: "Other BusinessContext description" }, { BusinessContext: sEntitySetName + " EntitySetContext", BusinessContextDescription: "Some BusinessContext description"}],
					ServiceName: sServiceUri,
					ServiceVersion: "some dummy ServiceVersion 0.0.1",
					EntityType : sEntityTypeName
				});
			};

			sap.ushell = Object.assign({}, sap.ushell, {
				Container : {
					getService : function() {
						return {
							hrefForExternal : function(mData) {
								return "./testdata/additionalElements/extensibilityTool.html?" + URI.encodeQuery(JSON.stringify(mData));
							},
							parseShellHash : function() {
								//dummy
							},
							registerNavigationFilter : function() {
								//dummy
							},
							unregisterNavigationFilter : function() {
								//dummy
							}
						};
					},
					getLogonSystem : function() {
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
					setDirtyFlag : function() {
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
