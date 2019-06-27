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
		oDescriptorVariantSaveClosure,
		oDescriptorVariantDeleteClosure,
		sNewAppVariantID,
		_oldUnloadHandler;

	var fnGetDescriptor = function() {
		return FlexUtils.getAppDescriptor(oRootControlRunningApp);
	};

	var fnTriggerCreateDescriptor = function(oAppVariantData) {
		return oAppVariantManager.createDescriptor(oAppVariantData).then(function(oDescriptorVariant) {
			if (oDescriptorVariant) {
				oDescriptorVariantSaveClosure = null;
				oDescriptorVariantSaveClosure = jQuery.extend({}, oDescriptorVariant);
				sNewAppVariantID = oDescriptorVariantSaveClosure.getId();
				return oDescriptorVariantSaveClosure;
			}
			return Promise.reject();
		});
	};

	var fnTriggerCreateDescriptorForDeletion = function(sAppVariantId) {
		return AppVariantUtils.createDeletion(sAppVariantId).then(function(oDescriptorVariant) {
			if (oDescriptorVariant) {
				oDescriptorVariantDeleteClosure = null;
				oDescriptorVariantDeleteClosure = jQuery.extend({}, oDescriptorVariant);
				return oDescriptorVariantDeleteClosure;
			}
			return Promise.reject();
		});
	};

	var fnTriggerSaveAppVariantToLREP = function(oDescriptorVariant) {
		BusyIndicator.show();
		return oAppVariantManager.saveAppVariantToLREP(oDescriptorVariant);
	};

	var fnS4HanaAddBrowserCloseWarning = function(bCurrentlyAdapting) {
		var sMessageKey = bCurrentlyAdapting ? "MSG_DO_NOT_CLOSE_BROWSER_CURRENTLY_ADAPTING" : "MSG_DO_NOT_CLOSE_BROWSER";
		_oldUnloadHandler = window.onbeforeunload;
		window.onbeforeunload = AppVariantUtils.handleBeforeUnloadEvent;
		return AppVariantUtils.showMessage(sMessageKey);
	};

	var fnS4HanaRemoveBrowserCloseWarning = function() {
		window.onbeforeunload = _oldUnloadHandler;
	};

	var fnTriggerCatalogAssignment = function() {
		return oAppVariantManager.triggerCatalogPublishing(oDescriptorVariantSaveClosure, true);
	};

	var fnTriggerCatalogUnAssignment = function() {
		return oAppVariantManager.triggerCatalogPublishing(oDescriptorVariantDeleteClosure, false);
	};

	var fnReloadOverviewDialog = function(bIsS4HanaOnPremise) {
		if (oAppVariantOverviewDialog) {
			AppVariantUtils.closeOverviewDialog();
			return this.onGetOverview(true);
		} else if (!oAppVariantOverviewDialog && bIsS4HanaOnPremise) {
			// in case of S/4HANA on Premise
			BusyIndicator.hide();
			return this.onGetOverview(true);
		}
		return Promise.resolve();
	};

	var fnTriggerActionFlow = function(bSaveAsTriggeredFromRtaToolbar, bIsS4HanaCloud) {
		return bSaveAsTriggeredFromRtaToolbar ? AppVariantUtils.navigateToFLPHomepage() : fnReloadOverviewDialog.call(this, !bIsS4HanaCloud);
	};

	var fnTriggerPollingTileCreation = function(oResult, sAppVarId) {
		// In case of S/4HANA Cloud, oResult is filled from catalog assignment call
		if (oResult && oResult.response && oResult.response.IAMId) {
			return oAppVariantManager.notifyKeyUserWhenPublishingIsReady(oResult.response.IAMId, sAppVarId, true);
		}
		return Promise.resolve();
	};

	var fnTriggerPollingTileDeletion = function(oResult, sAppVarId) {
		// In case of S/4HANA Cloud, oResult is filled from catalog unassignment call, do polling only if inProgress === true
		if (oResult && oResult.response && oResult.response.IAMId && oResult.response.inProgress) {
			return oAppVariantManager.notifyKeyUserWhenPublishingIsReady(oResult.response.IAMId, sAppVarId, false);
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
		getNewAppVariantId : function() {
			return sNewAppVariantID;
		},
		setNewAppVariantId : function(sNewValue) {
			sNewAppVariantID = sNewValue;
		},
		// To see the overview of app variants, a key user has created from an app
		onGetOverview : function(bAsKeyUser) {
			var oDescriptor = fnGetDescriptor();

			return new Promise(function(resolve) {
				var fnCancel = function() {
					AppVariantUtils.closeOverviewDialog();
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
		 * @returns {boolean} Boolean value
		 * @description The app variant overview is modified to be shown for SAP developer and a key user.
		 * The calculation of which control (a button or a drop down menu button) should be shown on the UI is done here.
		 * This calculation is done with the help of a query parameter <code>sap-ui-xx-app-variant-overview-extended</code>.
		 * When this method returns <code>true</code> then a drop down menu button on the UI is shown where a user can choose app variant overview for either a key user or SAP developer.
		 * When this method returns <code>false</code>, an app variant overview is shown only for a key user.
		 */
		isOverviewExtended: function() {
			var oUriParams = new UriParameters(window.location.href);
			if (!oUriParams.get("sap-ui-xx-app-variant-overview-extended")) {
				return false;
			}

			var aMode = oUriParams.get("sap-ui-xx-app-variant-overview-extended", true);
			if (aMode && aMode.length) {
				var sMode = aMode[0].toLowerCase();
				return sMode === 'true';
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
		 * @param {object} oRootControl - Root control of an app (variant)
		 * @param {string} sCurrentLayer - Current working layer
		 * @param {object} oLrepSerializer - Layered repository serializer
		 * @returns {boolean} Boolean value
		 * @description App variant functionality is only supported in S/4HANA Cloud Platform & S/4HANA on Premise.
		 * App variant functionality should be available if the following conditions are met:
		 * When it is an FLP app.
		 * When the current layer is 'CUSTOMER'.
		 * When it is not a standalone app runing on Neo Cloud.
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
		 * @param {object} oRootControl - Root control of an app (variant)
		 * @returns {Promise} Resolved promise with an app variant descriptor
		 * @description Getting here an app variant descriptor from the layered repository.
		 */
		getAppVariantDescriptor : function(oRootControl) {
			oRootControlRunningApp = oRootControl;
			var oDescriptor = fnGetDescriptor();
			if (oDescriptor["sap.app"] && oDescriptor["sap.app"].id) {
				return AppVariantUtils.getDescriptorFromLREP(oDescriptor["sap.app"].id);
			}
			return Promise.resolve(false);
		},
		/**
		 * @param {boolean} bSaveAsTriggeredFromRtaToolbar - Boolean value which tells if 'Save As' is triggered from the UI adaptation header bar
		 * @param {boolean} bCopyUnsavedChanges - Boolean value which tells if the UI changes needs to be copied
		 * @returns {Promise} Resolved promise
		 * @description Creates the app variant when 'Save As' is triggered from the UI adaptation header bar.
		 * When 'Save As' triggered from the UI adaptation header bar, we set both flags <code>bSaveAsTriggeredFromRtaToolbar</code> and <code>bCopyUnsavedChanges</code> equal to <code>true</code>.
		 */
		onSaveAsFromRtaToolbar : function(bSaveAsTriggeredFromRtaToolbar, bCopyUnsavedChanges) {
			var oDescriptor, bIsS4HanaCloud;

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
						return oAppVariantManager.copyUnsavedChangesToLREP(oDescriptorVariantSaveClosure.getId(), bCopyUnsavedChanges);
					}
					return Promise.resolve();
				};

				var fnResetDirtyFlag = function() {
					var oUshellContainer = FlexUtils.getUshellContainer();
					if (oUshellContainer && bCopyUnsavedChanges) {
						// Tell FLP that no UI change is booked for the currently adapting app
						oUshellContainer.setDirtyFlag(false);
					}
				};

				var fnTriggerSuccessMessage = function() {
					fnResetDirtyFlag();
					// Shows the success message and closes the current app (if 'Save As' triggered from UI adaptation toolbar)
					// or opens the app variant overview list (if 'Save As' triggered from App variant overview List)
					return oAppVariantManager.showSuccessMessage(oDescriptorVariantSaveClosure, bSaveAsTriggeredFromRtaToolbar);
				};


				var fnTriggerPlatformDependentFlow = function() {
					BusyIndicator.show();
					bIsS4HanaCloud = AppVariantUtils.isS4HanaCloud(oDescriptorVariantSaveClosure.getSettings());
					if (bIsS4HanaCloud) {
						return fnTriggerCatalogAssignment()
								.then(function(oResult) {
									BusyIndicator.hide();
									return fnTriggerActionFlow.call(this, bSaveAsTriggeredFromRtaToolbar).then(function() {
										bSaveAsTriggeredFromRtaToolbar = false;
										return fnTriggerPollingTileCreation(oResult, oDescriptorVariantSaveClosure.getId());
									});
								}.bind(this));
					}
					return Promise.resolve();
				};

				sap.ui.require(["sap/ui/rta/appVariant/AppVariantManager"], function(AppVariantManager) {
					if (!oAppVariantManager) {
						oAppVariantManager = new AppVariantManager({
							rootControl : oRootControlRunningApp,
							commandSerializer : oCommandSerializer
						});
					}

					return fnProcessSaveAsDialog()
					.then(fnTriggerCreateDescriptor)
					.then(fnTriggerSaveAppVariantToLREP)
					.then(fnTriggerCopyUnsavedChangesToLREP)
					.then(fnTriggerSuccessMessage)
					.then(fnTriggerPlatformDependentFlow.bind(this))
					.then(function() {
						return fnTriggerActionFlow.call(this, bSaveAsTriggeredFromRtaToolbar, bIsS4HanaCloud).then(resolve);
					}.bind(this))
					.catch(function() {
						return resolve(false);
					});
				}.bind(this));
			}.bind(this));
		},
		/**
		 * @param {object} oAppVariantDescriptor - Contains the app variant desciptor
		 * @param {boolean} bSaveAsTriggeredFromRtaToolbar - Boolean value which tells if 'Save As' is triggered from the UI adaptation header bar
		 * @returns {Promise} Resolved promise
		 * @description Creates the app variant when 'Save As' is triggered from the app variant overview dialog.
		 * When 'Save As' triggered from the app variant overview dialog, we set flag <code>bSaveAsTriggeredFromRtaToolbar</code> equal to <code>false</code>.
		 * The flag <code>bCopyUnsavedChanges</code> is <code>true</code> if a key user presses 'Save As' from the running app entry in the app variant overview dialog.
		 */
		onSaveAsFromOverviewDialog : function(oAppVariantDescriptor, bSaveAsTriggeredFromRtaToolbar) {
			var bCopyUnsavedChanges = false;

			var oDescriptor = fnGetDescriptor();

			if (oAppVariantDescriptor["sap.app"].id === oDescriptor["sap.app"].id) {
				bCopyUnsavedChanges = true;
			}

			oChosenAppVariantDescriptor = jQuery.extend(true, {}, oAppVariantDescriptor);
			oAppVariantDescriptor = null;

			return this.onSaveAsFromRtaToolbar(bSaveAsTriggeredFromRtaToolbar, bCopyUnsavedChanges);
		},
		/**
		 * @param {string} sAppVarId - Application variant ID
		 * @param {boolean} bCurrentlyAdapting - Boolean value which tells if the running application is currently being adapted
		 * @returns {Promise} Resolved promise
		 * @description Triggers a delete operation of the app variant.
		 */
		onDeleteFromOverviewDialog : function(sAppVarId, bCurrentlyAdapting) {
			var bIsS4HanaCloud;
			return new Promise(function(resolve) {
				sap.ui.require(["sap/ui/rta/appVariant/AppVariantManager"], function(AppVariantManager) {
					if (!oAppVariantManager) {
						oAppVariantManager = new AppVariantManager({
							rootControl : oRootControlRunningApp,
							commandSerializer : oCommandSerializer
						});
					}

					var fnTriggerDeletion = function() {
						return AppVariantUtils.triggerDeleteAppVariantFromLREP(oDescriptorVariantDeleteClosure);
					};

					var fnTriggerS4HanaPolling = function() {
						bIsS4HanaCloud = AppVariantUtils.isS4HanaCloud(oDescriptorVariantDeleteClosure.getSettings());
						if (bIsS4HanaCloud) {
							return fnS4HanaAddBrowserCloseWarning(bCurrentlyAdapting)
								.then(fnTriggerCatalogUnAssignment)
								.then(function(oResult) {
									return fnReloadOverviewDialog.call(this).then(function() {
										return fnTriggerPollingTileDeletion(oResult, oDescriptorVariantDeleteClosure.getId());
									});
								}.bind(this));
						}
						BusyIndicator.show();
						return Promise.resolve();
					};

					var fnTriggerS4HanaRefresh = function() {
						if (bIsS4HanaCloud) {
							fnS4HanaRemoveBrowserCloseWarning();
						}
						BusyIndicator.hide();
						return fnReloadOverviewDialog.call(this).then(resolve);
					};

					if (bCurrentlyAdapting) {
						AppVariantUtils.closeOverviewDialog();
						AppVariantUtils.navigateToFLPHomepage();
					}

					return fnTriggerCreateDescriptorForDeletion(sAppVarId)
						.then(fnTriggerS4HanaPolling.bind(this))
						.then(fnTriggerDeletion)
						.then(fnTriggerS4HanaRefresh.bind(this))
						.catch(function() {
							return resolve(false);
						});
				}.bind(this));
			}.bind(this));
		}
	};
});