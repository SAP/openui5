/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/core/BusyIndicator",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/UriParameters"
], function(
	FlexUtils,
	AppVariantUtils,
	BusyIndicator,
	jQuery,
	UriParameters
) {
  "use strict";

	var oAppVariantOverviewDialog,
		oAppVariantManager,
		oRootControlRunningApp,
		oCommandSerializer,
		oChosenAppVariantDescriptor,
		oDescriptorVariantClosure;

	var fnGetDescriptor = function() {
		return FlexUtils.getAppDescriptor(oRootControlRunningApp);
	};

	var fnTriggerCreateDescriptor = function(oAppVariantData) {
		// Based on the key user provided info, app variant descriptor is created
		return oAppVariantManager.createDescriptor(oAppVariantData);
	};

	var fnTriggerSaveAppVariantToLREP = function(oDescriptorVariant) {
		if (oDescriptorVariant) {
			oDescriptorVariantClosure = null;

			BusyIndicator.show();
			oDescriptorVariantClosure = jQuery.extend({}, oDescriptorVariant);
			// App variant descriptor is saved to the layered repository
			return oAppVariantManager.saveAppVariantToLREP(oDescriptorVariant);
		} else {
			return Promise.reject();
		}
	};

	var fnTriggerCatalogAssignment = function() {
		// In case of S4 Hana Cloud, trigger automatic catalog assignment
		return oAppVariantManager.triggerCatalogAssignment(oDescriptorVariantClosure);
	};

	var fnTriggerS4HanaAsynchronousCall = function(oResult) {
		if (oResult && oResult.response && oResult.response.IAMId) {
			// In case of S4 Hana Cloud, notify the key user to refresh the FLP Homepage manually
			return oAppVariantManager.notifyKeyUserWhenTileIsReady(oResult.response.IAMId, oDescriptorVariantClosure.getId());
		}
		return Promise.resolve();
	};

	sap.ui.getCore().getEventBus().subscribe("sap.ui.rta.appVariant.manageApps.controller.ManageApps", "navigate", function() {
		if (oAppVariantOverviewDialog) {
			oAppVariantOverviewDialog.destroy();
			oAppVariantOverviewDialog = null;
		}
	});

	return {
		// To see the overview of app variants, a key user has created from an app
		onGetOverview : function(bAsKeyUser) {
			var oDescriptor = fnGetDescriptor();

			return new Promise(function(resolve) {
				var fnCancel = function() {
					AppVariantUtils.publishEventBus();
				};
				sap.ui.require(["sap/ui/rta/appVariant/AppVariantOverviewDialog"], function(AppVariantOverviewDialog) {
					if (!oAppVariantOverviewDialog) {
						oAppVariantOverviewDialog = new AppVariantOverviewDialog({
							idRunningApp: oDescriptor["sap.app"].id,
							isOverviewForKeyUser: bAsKeyUser
						});
					}

					oAppVariantOverviewDialog.attachCancel(fnCancel);

					oAppVariantOverviewDialog.oPopup.attachOpened(function() {
						resolve(oAppVariantOverviewDialog);
					});

					oAppVariantOverviewDialog.open();
				});
			});
		},
		/**
		 * @returns {boolean} returns a boolean value
		 * @description The app variant overview is modified to be shown for SAP developer and a key user
		 * The calculation of which control (a button or a drop down menu button) should be shown on the UI is done here
		 * This calculation is done with the help of a query parameter 'sap-ui-xx-app-variant-overview-extended'
		 * When this method returns true then a drop down menu button on the UI is shown where a user can choose app variant overview for either a key user or SAP developer
		 * When this method returns false, an app variant overview is shown only for a key user
		 */
		isOverviewExtended: function() {
			var oUriParams = new UriParameters(window.location.href);
			if (!oUriParams.get("sap-ui-xx-app-variant-overview-extended")) {
				return false;
			} else {
				var aMode = oUriParams.get("sap-ui-xx-app-variant-overview-extended", true);

				if (aMode && aMode.length) {
					var sMode = aMode[0].toLowerCase();
					return sMode === 'true';
				}
			}
		},
		isManifestSupported: function() {
			var oDescriptor = fnGetDescriptor();
			return AppVariantUtils.getManifirstSupport(oDescriptor["sap.app"].id).then(function(oResult) {
				return oResult.response;
			}).catch(function(oError) {
				var oErrorInfo = AppVariantUtils.buildErrorInfo("MSG_APP_VARIANT_FEATURE_FAILED", oError);
				oErrorInfo.overviewDialog = true;
				return AppVariantUtils.showRelevantDialog(oErrorInfo, false);
			});
		},
		/**
		 * @param {object} oRootControl
		 * @param {string} sCurrentLayer
		 * @param {object} oLrepSerializer
		 * @returns {boolean} returns a boolean value
		 * @description App variant functionality is only supported in S/4 Hana Cloud Platform & S/4 Hana (On Premise)
		 * App variant functionality should be available if folowing conditions are met:
		 * When it is an FLP app;
		 * When the current layer is 'CUSTOMER';
		 * When it is not a standalone app runing on NEO Cloud;
		 */
		isPlatFormEnabled : function(oRootControl, sCurrentLayer, oLrepSerializer) {
			oRootControlRunningApp = oRootControl;
			oCommandSerializer = oLrepSerializer;

			var oDescriptor = fnGetDescriptor();

			if (oDescriptor["sap.app"] && oDescriptor["sap.app"].id) {
				if (FlexUtils.getUshellContainer() && !AppVariantUtils.isStandAloneApp() && sCurrentLayer === "CUSTOMER") {
					var oInboundInfo;

					if (oDescriptor["sap.app"].crossNavigation && oDescriptor["sap.app"].crossNavigation.inbounds) {
						oInboundInfo = AppVariantUtils.getInboundInfo(oDescriptor["sap.app"].crossNavigation.inbounds);
					} else {
						oInboundInfo = AppVariantUtils.getInboundInfo();
					}

					if (oInboundInfo) {
						return true;
					}
				}
			}

			return false;
		},
		/**
		 * @param {object} oRootControl
		 * @returns {Promise} returns a resolved Promise with an app variant descriptor
		 * @description Getting here an app variant descriptor from the layered repository
		 */
		getAppVariantDescriptor : function(oRootControl) {
			oRootControlRunningApp = oRootControl;
			var oDescriptor = fnGetDescriptor();
			if (oDescriptor["sap.app"] && oDescriptor["sap.app"].id) {
				return AppVariantUtils.getDescriptorFromLREP(oDescriptor["sap.app"].id);
			}
			return Promise.resolve(false);
		},
		// When 'Save As' triggered from RTA toolbar, we set both flags bSaveAsTriggeredFromRtaToolbar and bCopyUnsavedChanges equal to true
		onSaveAsFromRtaToolbar : function(bSaveAsTriggeredFromRtaToolbar, bCopyUnsavedChanges) {
			var oDescriptor;

			if (bSaveAsTriggeredFromRtaToolbar) {
				oDescriptor = fnGetDescriptor();
			} else {
				oDescriptor = jQuery.extend(true, {}, oChosenAppVariantDescriptor);
				oChosenAppVariantDescriptor = null;
			}

			return new Promise(function(resolve) {
				var fnProcessSaveAsDialog = function() {
					return oAppVariantManager.processSaveAsDialog(oDescriptor, bSaveAsTriggeredFromRtaToolbar);
				};

				var fnTriggerCopyUnsavedChangesToLREP = function() {
					if (bCopyUnsavedChanges) {
						// If there are any unsaved changes, should be taken away for the new created app variant
						return oAppVariantManager.copyUnsavedChangesToLREP(oDescriptorVariantClosure.getId(), bCopyUnsavedChanges, oDescriptorVariantClosure.getVersion());
					}
					return Promise.resolve();
				};

				var fnTriggerPlatformDependentFlow = function(oResult) {
					var oUshellContainer = FlexUtils.getUshellContainer();
					if (oUshellContainer && bCopyUnsavedChanges) {
						// Tell FLP that no UI change is booked for the currently adapting app
						oUshellContainer.setDirtyFlag(false);
					}
					// Shows the success message and closes the current app (if 'Save As' triggered from RTA toolbar) or opens the app variant overview list (if 'Save As' triggered from App variant overview List)
					return oAppVariantManager.showSuccessMessageAndTriggerActionFlow(oDescriptorVariantClosure, bSaveAsTriggeredFromRtaToolbar).then(function() {
						return fnTriggerS4HanaAsynchronousCall(oResult).then(resolve);
					});
				};

				sap.ui.require(["sap/ui/rta/appVariant/AppVariantManager"], function(AppVariantManager) {
					if (!oAppVariantManager) {
						oAppVariantManager = new AppVariantManager({
							rootControl : oRootControlRunningApp,
							commandSerializer : oCommandSerializer
						});
					}

					// List of promises to be executed sequentially
					var aPromiseChain = [
						fnProcessSaveAsDialog,
						fnTriggerCreateDescriptor,
						fnTriggerSaveAppVariantToLREP,
						fnTriggerCopyUnsavedChangesToLREP,
						fnTriggerCatalogAssignment,
						fnTriggerPlatformDependentFlow
					];

					// Execute a list of Promises
					function processArray(aPromises) {
						return aPromises.reduce(function(pacc, fn) {
							return pacc.then(fn);
						}, Promise.resolve())
						.catch(function() {
							return Promise.resolve(false);
						});
					}

					processArray(aPromiseChain);
				});
			});
		},
		// When 'Save As' triggered from App variant overview dialog, we set flag bSaveAsTriggeredFromRtaToolbar equal to false
		// The flag bCopyUnsavedChanges is true if a key user presses 'Save As' from the running app entry on App variant overview dialog
		onSaveAsFromOverviewDialog : function(oAppVariantDescriptor, bSaveAsTriggeredFromRtaToolbar) {
			var bCopyUnsavedChanges = false;

			var oDescriptor = fnGetDescriptor();

			if (oAppVariantDescriptor["sap.app"].id === oDescriptor["sap.app"].id) {
				bCopyUnsavedChanges = true;
			}

			oChosenAppVariantDescriptor = jQuery.extend(true, {}, oAppVariantDescriptor);
			oAppVariantDescriptor = null;

			return this.onSaveAsFromRtaToolbar(bSaveAsTriggeredFromRtaToolbar, bCopyUnsavedChanges);
		}
	};
});