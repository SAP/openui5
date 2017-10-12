/*!
 * ${copyright}
 */

sap.ui.define([
  "jquery.sap.global",
  "sap/ui/rta/Utils",
  "sap/ui/fl/Utils",
  "sap/ui/rta/appVariant/AppVariantUtils",
  "sap/m/MessageBox"
], function(jQuery, RtaUtils, FlexUtils, AppVariantUtils, MessageBox) {
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

						if (aUriLayer && aUriLayer.length > 0) {
							var oInboundInfo;
							if (oDescriptor["sap.app"].crossNavigation && oDescriptor["sap.app"].crossNavigation.inbounds) {
								oInboundInfo = AppVariantUtils.getInboundInfo(oDescriptor["sap.app"].crossNavigation.inbounds);
							}

							if (oInboundInfo) {
								return aUriLayer[0] === 'true' ? true : false;
							}
						}
					}
					return false;
				}).catch(function(oError) {

					var sErrorMessage = "";
					if (oError.messages && oError.messages.length) {
						if (oError.messages.length > 1) {
							oError.messages.forEach(function(oError) {
								sErrorMessage += oError.text + "\n";
							});
						} else {
							sErrorMessage += oError.messages[0].text;
						}
					} else {
						sErrorMessage += oError.stack || oError.message || oError.status || oError;
					}

					var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

					var sMsg = oTextResources.getText("MSG_CREATE_APP_VARIANT_ERROR") + "\n\n"
						+ oTextResources.getText("MSG_CREATE_APP_VARIANT_ERROR_REASON") + "\n"
						+ sErrorMessage;

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