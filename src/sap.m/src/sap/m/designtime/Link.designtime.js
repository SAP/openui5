/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Link control
sap.ui.define(["sap/base/util/Deferred", "sap/ui/core/Fragment", "sap/ui/model/json/JSONModel"],
	function (Deferred, Fragment, JSONModel) {
		"use strict";

	var fnSelectTargetDialog = function(oControl, mPropertyBag) {
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.m.designtime");
		return Fragment.load({
			name: "sap.m.designtime.LinkTargetSelectDialog"
		}).then(function(oDialog) {

			var oModel = new JSONModel({
				selectedKey : oControl.getTarget(),
				titleText : oTextResources.getText("LINK_DIALOG_TITLE_CHANGE_TARGET"),
				cancelBtn : oTextResources.getText("LINK_DIALOG_CANCEL_BTN"),
				okBtn : oTextResources.getText("LINK_DIALOG_OK_BTN")
			});

			oDialog.setModel(oModel);

			var oDeferred = new Deferred();

			oDialog.getBeginButton().attachPress(function(oEvent) {
				var sTargetValue = sap.ui.getCore().byId("targetCombo").getValue();

				oDeferred.resolve(sTargetValue);
				oDialog.close();
			});

			oDialog.getEndButton().attachPress(function(oEvent) {
				oDeferred.resolve(undefined);
				oDialog.close();
			});

			oDialog.attachEventOnce("afterClose", function(oEvent) {
				oDialog.destroy();
			});

			oDialog.addStyleClass(mPropertyBag.styleClass);
			oDialog.open();

			return oDeferred.promise;
		}).then(
				function (sTargetValue) {
					if ( sTargetValue === undefined ) {
						// no change (cancel)
						return [];
					}
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
		name : {
			singular : "LINK_NAME",
			plural : "LINK_NAME_PLURAL"
		},
		palette : {
			group : "ACTION",
			icons : {
				svg : "sap/m/designtime/Link.icon.svg"
			}
		},
		actions : {
			remove : {
				changeType : "hideControl"
			},
			reveal : {
				changeType : "unhideControl"
			},
			rename: {
				changeType: "rename",
				domRef: function (oControl) {
					return oControl.$()[0];
				}
			},
			settings: function () {
				return {
					"changeLinkTarget": {
						name: "LINK_CHANGE_TARGET",
						isEnabled: function(oControl){
							return !!oControl.getHref();
						},
						handler: fnSelectTargetDialog
					}
				};
			}
		},
		templates: {
			create: "sap/m/designtime/Link.create.fragment.xml"
		}
	};
});