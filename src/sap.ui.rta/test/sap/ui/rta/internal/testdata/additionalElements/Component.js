sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/Element",
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPAccess",
	"sap/ui/model/json/JSONModel",
	"sap/m/App",
	"sap/m/MessageBox",
	"sap/ui/core/mvc/XMLView"
], function(
	UIComponent,
	Element,
	ABAPAccess,
	JSONModel,
	App,
	MessageBox,
	XMLView
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
			const oApp = new App();

			const oModel = new JSONModel({
				showAdaptButton: this._bShowAdaptButton,
				extensibilityEnabled: !!this._bExtensibilityEnabled
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
			ABAPAccess.getExtensionData = function(sServiceUri, sEntityTypeName, sEntitySetName) {
				if (Element.getElementById("application-masterDetail-display-component---idMain1--ExtensionDataRadioButtonGroup")
				.getSelectedIndex() === 3) {
					return Promise.resolve(undefined);
				}
				const aExtensionData = [
					{ businessContext: `${sEntityTypeName} EntityTypeContext`, description: "Other BusinessContext description" },
					{ businessContext: `${sEntitySetName} EntitySetContext`, description: "Some BusinessContext description"}
				];
				return Promise.resolve({
					extensionData: aExtensionData,
					entityType: sEntityTypeName,
					serviceVersion: "some dummy ServiceVersion 0.0.1",
					serviceName: sServiceUri
				});
			};

			ABAPAccess.getTexts = function() {
				let oExtensionData;
				switch (
					Element.getElementById("application-masterDetail-display-component---idMain1--ExtensionDataRadioButtonGroup")
					.getSelectedIndex()
				) {
					// Scenario 1: ExtensionData with Options
					case 0:
						oExtensionData = {
							tooltip: "Create",
							buttonText: "Create",
							headerText: "Multiple Options",
							options: [
								{
									actionKey: "CustomField",
									text: "Create Custom Field",
									tooltip: "Create Custom Field in the Model"
								},
								{
									actionKey: "CustomLogic",
									text: "Create Custom Logic",
									tooltip: "Create Custom Logic in the Model"
								}
							]
						};
						break;
					// Scenario 2: ExtensionData with one Option
					case 1:
						oExtensionData = {
							headerText: "One Option",
							tooltip: "Add Custom Tooltip",
							buttonText: "Create",
							options: [
								{
									actionKey: "OneOptionCustomField",
									text: "Create Custom Field",
									tooltip: "only one option tooltip"
								}
							]
						};
						break;
					// Scenario 3 (Legacy): ExtensionData with no Options
					case 2:
						oExtensionData = {
							headerText: "No Options",
							tooltip: "Legacy Tooltip"
						};
						break;
					default:
						oExtensionData = {};
						break;
				}
				return Promise.resolve(oExtensionData);
			};

			ABAPAccess.onTriggerCreateExtensionData = function(oExtensibilityInfo, sRtaStyleClassName, sActionKey) {
				MessageBox.information(`
					Header Text: ${oExtensibilityInfo.UITexts.headerText}
					Style Class: ${sRtaStyleClassName}
					Uri Action Key: ${sActionKey}
				`);
			};

			const oUshellContainer = sap.ui.require("sap/ushell/Container");
			if (oUshellContainer) {
				ABAPAccess.isExtensibilityEnabled = function() {
					return Promise.resolve(true);
				};
				this._bExtensibilityEnabled = true;
			}
		}
	});
});
