/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.comp.smartform.GroupElement control
sap.ui.define([
	"sap/m/Dialog",
	"sap/m/Select",
	"sap/m/HBox",
	"sap/m/Button",
	"sap/ui/core/Item",
	"sap/ui/fl/Utils"
], function(
	Dialog,
	Select,
	HBox,
	Button,
	Item,
	FlUtils
) {
	"use strict";

	return {
		actions: {
			settings: {
				icon: "sap-icon://popup-window",
				handler: function (oSelectedElement, mPropertyBag) {
					var oAppComponent = FlUtils.getAppComponentForControl(oSelectedElement);
					var oDialog;
					return new Promise(function (resolve) {
						oAppComponent.runAsOwner(function () {
							oDialog = new Dialog("testDialog", {
								endButton: new Button({
									text: "Close",
									press: function () {
										oDialog.destroy();
										resolve([]);
									}
								})
							});
							var oSelectionField = new Select("testselect", {
								items: [
									new Item({ key: "testitem1", text: "testitem1" }),
									new Item({ key: "testitem2", text: "testitem2" })
								]
							});
							var oHBox = new HBox("hboxindialog", { items: [oSelectionField] });
							oDialog.addContent(oHBox);
						});
						oDialog.isPopupAdaptationAllowed = function() {
							return false;
						};
						oDialog.addStyleClass(mPropertyBag.styleClass);
						oDialog.open();
					});
				}
			}
		}
	};
}, /* bExport= */true);
