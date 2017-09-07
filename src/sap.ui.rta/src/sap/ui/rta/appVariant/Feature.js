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


	var oManageAppsDialog, oAppVariantManager;
	return {
		onGetOverview: function(sRootControl) {
			var oRootControl = sap.ui.getCore().byId(sRootControl);

			return new Promise( function(resolve) {
				sap.ui.require(["sap/ui/rta/appVariant/ManageAppsDialog"], function(AppVariantOverviewDialog) {
					if (!oManageAppsDialog) {
						oManageAppsDialog = new AppVariantOverviewDialog({
							rootControl: oRootControl,
							close: function() {
								this.destroy();
								oManageAppsDialog = null;
							}
						});
					}
					resolve( oManageAppsDialog.open() );
				});
			});
		},
		// App variant functionality is only supported in S/4 Hana Cloud Platform with 'sap-ui-xx-rta-save-as=true' (feature switch) as a part of url.
		isPlatFormEnabled: function(sLayer, bIsAtoAvailableAndEnabled, oRootControl) {
			var oDescriptor = FlexUtils.getAppDescriptor(oRootControl);

			return AppVariantUtils.getManifirstSupport(oDescriptor["sap.app"].id).then(function(oResult) {
				if (bIsAtoAvailableAndEnabled && RtaUtils.getUshellContainer() && sLayer === "CUSTOMER" && oResult.response) {
					var oUriParams = jQuery.sap.getUriParameters();
					var aUriLayer = oUriParams.mParams["sap-ui-xx-rta-save-as"];
					var oInboundInfo = AppVariantUtils.getInboundInfo(oDescriptor["sap.app"].crossNavigation.inbounds);
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
		},
		onSaveAs: function(sRootControl, fnStopRta) {
			var oRootControl = sap.ui.getCore().byId(sRootControl);

			return new Promise( function(resolve) {
				sap.ui.require(["sap/ui/rta/appVariant/AppVariantManager"], function(AppVariantManager) {
					oAppVariantManager = new AppVariantManager();
					return oAppVariantManager.processSaveAsDialog(FlexUtils.getAppDescriptor(oRootControl)).then(function(oAppVariantData) {
						if (oAppVariantData) {
							return oAppVariantManager.createDescriptor(oAppVariantData).then(function(oAppVariantDescriptor) {
								resolve(oAppVariantManager.saveDescriptorAndFlexChangesToLREP(oAppVariantDescriptor, oRootControl, fnStopRta));
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