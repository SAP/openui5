/*!
 * ${copyright}
 */
// Provides the Design Time Metadata for the sap.ui.webc.main.Link
sap.ui.define([
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/Core",
		"sap/ui/core/Fragment"
	],
	function (JSONModel, Core, Fragment) {
		"use strict";
		var oSelectTargetDialog = function(oControl, mPropertyBag) {
			var oTextResources = Core.getLibraryResourceBundle("sap.ui.webc.main.designtime");
			return new Promise(function(fnResolve) {

				var data = {
					selectedKey : oControl.getTarget(),
					titleText : oTextResources.getText("LINK_DIALOG_TITLE_CHANGE_TARGET"),
					cancelBtn : oTextResources.getText("LINK_DIALOG_CANCEL_BTN"),
					okBtn : oTextResources.getText("LINK_DIALOG_OK_BTN")
				};
				var oModel = new JSONModel();
				oModel.setData(data);

				Fragment.load({
					name: "sap.m.designtime.LinkTargetSelectDialog",
					controller: this
				}).then(function (oDialog) {
					oDialog.setModel(oModel);

					oDialog.getBeginButton().attachPress(function(oEvent) {
						var sTargetValue = Core.byId("targetCombo").getValue();

						fnResolve(sTargetValue);
						oDialog.close();
					});

					oDialog.getEndButton().attachPress(function(oEvent) {
						oDialog.close();
					});

					oDialog.attachEventOnce("afterClose", function(oEvent) {
						oDialog.destroy();
					});

					oDialog.addStyleClass(mPropertyBag.styleClass);
					oDialog.open();
				});
			}).then(
				function (sTargetValue) {
					return [{
						selectorControl : oControl,
						changeSpecificData : {
							changeType : "changeLinkTarget",
							content : sTargetValue
						}
					}];
				}
			);
	};
		return {
			name: {
				singular: "LINK_NAME",
				plural: "LINK_NAME_PLURAL"
			},
			actions: {
				remove: {
					changeType: "hideControl"
				},
				reveal: {
					changeType: "unhideControl"
				},
				rename: function () {
					return {
						changeType: "rename",
						domRef: function (oControl) {
							return oControl.getDomRef();
						}
					};
				},
				settings: function () {
					return {
						"changeLinkTarget": {
							name: "LINK_CHANGE_TARGET",
							isEnabled: function(oControl){
								return !!oControl.getHref();
							},
							handler: oSelectTargetDialog
						}
					};
				}
			}
		};
	});
