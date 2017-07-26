/*!
 * ${copyright}
 */

sap.ui.define([
  "jquery.sap.global",
  "sap/ui/rta/Utils"
], function(jQuery, RtaUtils) {
  "use strict";

	var _oPromise;

	var oManageAppsDialog;
	return {
		load: function(sRootControl) {
			var oRootControl = sap.ui.getCore().byId(sRootControl);

			if (!_oPromise) {
				_oPromise = new Promise(function(resolve) {
					sap.ui.require(["sap/ui/rta/appVariant/ManageAppsDialog"], function(ManageAppsDialog) {
						return resolve(ManageAppsDialog);
					});
				});
			}

			return _oPromise.then(function(ManageAppsDialog) {

				if (!oManageAppsDialog) {
					oManageAppsDialog = new ManageAppsDialog({
						rootControl: oRootControl,
						close: function() {
							this.destroy();
							oManageAppsDialog = null;
						}
					});
				}
				return oManageAppsDialog.open();

			});
		},
		// App variant functionality is only supported in S/4 Hana Cloud Platform with 'sap-ui-xx-rta-save-as=true' (feature switch) as a part of url.
		hasAppVariantsSupport: function(sLayer, bIsAtoAvailableAndEnabled) {
			if (bIsAtoAvailableAndEnabled && RtaUtils.getUshellContainer() && sLayer === "CUSTOMER") {
				var oUriParams = jQuery.sap.getUriParameters();
				var aUriLayer = oUriParams.mParams["sap-ui-xx-rta-save-as"];
				if (aUriLayer && aUriLayer.length > 0) {
					return aUriLayer[0] === 'true' ? true : false;
				}
			}

			return false;
		}
	};

});