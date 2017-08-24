/*!
 * ${copyright}
 */

sap.ui.define([
  "jquery.sap.global",
  "sap/ui/rta/Utils",
  "sap/ui/fl/Utils",
  "sap/ui/rta/appVariant/AppVariantUtils",
  "sap/m/MessageBox",
  "sap/ui/core/BusyIndicator"
], function(jQuery, RtaUtils, FlexUtils, AppVariantUtils, MessageBox, BusyIndicator) {
  "use strict";

	var oAppVariantOverviewDialog, oAppVariantManager;
	sap.ui.getCore().getEventBus().subscribe("sap.ui.rta.appVariant.manageApps.controller.ManageApps", "navigate", function() {
		if (oAppVariantOverviewDialog) {
			oAppVariantOverviewDialog.destroy();
			oAppVariantOverviewDialog = null;
		}
	});

	return {
		onGetOverview: function(oRootControl) {
			return new Promise( function(resolve) {
				var fnCancel = function() {
					sap.ui.getCore().getEventBus().publish("sap.ui.rta.appVariant.manageApps.controller.ManageApps", "navigate");
				};
				sap.ui.require(["sap/ui/rta/appVariant/ManageAppsDialog"], function(AppVariantOverviewDialog) {
					if (!oAppVariantOverviewDialog) {
						oAppVariantOverviewDialog = new AppVariantOverviewDialog("appVariantOverviewDialog", {
							rootControl: oRootControl
						});
					}
					oAppVariantOverviewDialog.attachCancel(fnCancel);
					resolve(oAppVariantOverviewDialog.open());
				});
			});
		},
		// App variant functionality is only supported in S/4 Hana Cloud Platform with 'sap-ui-xx-rta-save-as=true' (feature switch) as a part of url.
		isPlatFormEnabled: function(sLayer, bIsAtoAvailableAndEnabled, oRootControl) {
			var oDescriptor = FlexUtils.getAppDescriptor(oRootControl);

			if (oDescriptor["sap.app"] && oDescriptor["sap.app"].id) {
				return AppVariantUtils.getManifirstSupport(oDescriptor["sap.app"].id).then(function(oResult) {
					if (bIsAtoAvailableAndEnabled && RtaUtils.getUshellContainer() && sLayer === "CUSTOMER" && oResult.response) {
						var oUriParams = jQuery.sap.getUriParameters();
						var aUriLayer = oUriParams.mParams["sap-ui-xx-rta-save-as"];

						var oInboundInfo;
						if (oDescriptor["sap.app"].crossNavigation && oDescriptor["sap.app"].crossNavigation.inbounds) {
							oInboundInfo = AppVariantUtils.getInboundInfo(oDescriptor["sap.app"].crossNavigation.inbounds);
						}

						if (aUriLayer && aUriLayer.length > 0 && oInboundInfo) {
							return aUriLayer[0] === 'true' ? true : false;
						}
					}
					return false;
				}).catch(function(oError) {
					var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
					var sMsg = oTextResources.getText("MSG_CREATE_APP_VARIANT_ERROR");

					return new Promise(function(resolve) {
						MessageBox.error(sMsg, {
							onClose: function() {
								resolve(false);
							},
							styleClass: RtaUtils.getRtaStyleClassName()
						});
					});
				});
			}

			return Promise.resolve(false);
		},
		onSaveAs: function(oRootControlRunningApp, oAppVariantDescriptor) {
			var oDescriptor, bCloseRunningApp = false;

			if (oAppVariantDescriptor) {
				oDescriptor = oAppVariantDescriptor;
			} else {
				oDescriptor = FlexUtils.getAppDescriptor(oRootControlRunningApp);
				bCloseRunningApp = true;
			}
			return new Promise( function(resolve) {
				sap.ui.require(["sap/ui/rta/appVariant/AppVariantManager"], function(AppVariantManager) {
					if (!oAppVariantManager) {
						oAppVariantManager = new AppVariantManager();
					}
					return oAppVariantManager.processSaveAsDialog(oDescriptor).then(function(oAppVariantData) {
						if (oAppVariantData) {
							return oAppVariantManager.createDescriptor(oAppVariantData).then(function(oAppVariantDescriptor) {
								resolve(oAppVariantManager.saveDescriptorAndFlexChangesToLREP(oAppVariantDescriptor, oRootControlRunningApp, bCloseRunningApp));
							});
						} else {
							resolve(false);
						}
					});
				});
			});
		}
	};

});