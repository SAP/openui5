/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/core/BusyIndicator",
	"sap/base/util/UriParameters",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory",
	"sap/base/util/merge"
], function(
	FlexUtils,
	Layer,
	AppVariantUtils,
	BusyIndicator,
	UriParameters,
	Settings,
	DescriptorVariantFactory,
	merge
) {
	"use strict";

	var oAppVariantOverviewDialog;
	var oAppVariantManager;
	var oRootControlRunningApp;
	var oCommandSerializer;
	var _oldUnloadHandler;

	var fnGetDescriptor = function() {
		return FlexUtils.getAppDescriptor(oRootControlRunningApp);
	};

	var fnGetFlexSettings = function() {
		return Settings.getInstance();
	};

	var fnS4HanaRemoveBrowserCloseWarning = function() {
		window.onbeforeunload = _oldUnloadHandler;
	};

	var fnS4HanaAddBrowserCloseWarning = function(bCurrentlyAdapting) {
		var sMessageKey = bCurrentlyAdapting ? "MSG_DO_NOT_CLOSE_BROWSER_CURRENTLY_ADAPTING" : "MSG_DO_NOT_CLOSE_BROWSER";
		_oldUnloadHandler = window.onbeforeunload;
		window.onbeforeunload = AppVariantUtils.handleBeforeUnloadEvent;
		return AppVariantUtils.showMessage(sMessageKey);
	};

	var fnTriggerCatalogAssignment = function(sAppVariantId, sReferenceAppId) {
		return oAppVariantManager.triggerCatalogPublishing(sAppVariantId, sReferenceAppId, true);
	};

	var fnTriggerCatalogUnAssignment = function(sAppVariantId) {
		return oAppVariantManager.triggerCatalogPublishing(sAppVariantId, null, false);
	};

	var fnReloadOverviewDialog = function(bIsReloadNeeded, sCurrentLayer) {
		if (oAppVariantOverviewDialog) {
			// in case of S/4HANA Cloud when customer did not close overview
			AppVariantUtils.closeOverviewDialog();
			return this.onGetOverview(true, sCurrentLayer);
		} else if (!oAppVariantOverviewDialog && bIsReloadNeeded) {
			BusyIndicator.hide();
			return this.onGetOverview(true, sCurrentLayer);
		}
		return Promise.resolve();
	};

	var fnTriggerActionFlow = function(bSaveAsTriggeredFromRtaToolbar, bIsS4HanaCloud, sCurrentLayer) {
		return bSaveAsTriggeredFromRtaToolbar ? AppVariantUtils.navigateToFLPHomepage() : fnReloadOverviewDialog.call(this, !bIsS4HanaCloud, sCurrentLayer);
	};

	var fnTriggerPollingTileCreation = function(oResult, sAppVariantId) {
		// In case of S/4HANA Cloud, oResult is filled from catalog assignment call
		if (oResult && oResult.response && oResult.response.IAMId) {
			return oAppVariantManager.notifyKeyUserWhenPublishingIsReady(oResult.response.IAMId, sAppVariantId, true);
		}
		return Promise.resolve();
	};

	var fnTriggerPollingTileDeletion = function(oResult, sAppVariantId) {
		// In case of S/4HANA Cloud, oResult is filled from catalog unassignment call, do polling only if inProgress === true
		if (oResult && oResult.response && oResult.response.IAMId && oResult.response.inProgress) {
			return oAppVariantManager.notifyKeyUserWhenPublishingIsReady(oResult.response.IAMId, sAppVariantId, false);
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
		onGetOverview: function(bAsKeyUser, sLayer) {
			var oDescriptor = fnGetDescriptor();

			return new Promise(function(resolve) {
				var fnCancel = function() {
					AppVariantUtils.closeOverviewDialog();
				};
				sap.ui.require(["sap/ui/rta/appVariant/AppVariantOverviewDialog"], function(AppVariantOverviewDialog) {
					if (!oAppVariantOverviewDialog) {
						oAppVariantOverviewDialog = new AppVariantOverviewDialog({
							idRunningApp: oDescriptor["sap.app"].id,
							isOverviewForKeyUser: bAsKeyUser,
							layer: sLayer
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
			var oUriParams = UriParameters.fromQuery(window.location.search);
			var sMode = oUriParams.get("sap-ui-xx-app-variant-overview-extended");
			if (!sMode) {
				return false;
			}

			return sMode.toLowerCase() === 'true';
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
		isPlatFormEnabled: function(oRootControl, sCurrentLayer, oLrepSerializer) {
			oRootControlRunningApp = oRootControl;
			oCommandSerializer = oLrepSerializer;

			var oDescriptor = fnGetDescriptor();

			if (oDescriptor["sap.app"] && oDescriptor["sap.app"].id) {
				if (FlexUtils.getUshellContainer() && !AppVariantUtils.isStandAloneApp() && sCurrentLayer === Layer.CUSTOMER) {
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
		getAppVariantDescriptor: function(oRootControl) {
			oRootControlRunningApp = oRootControl;
			var oDescriptor = fnGetDescriptor();
			if (oDescriptor["sap.app"] && oDescriptor["sap.app"].id) {
				return DescriptorVariantFactory.loadAppVariant(oDescriptor["sap.app"].id, false);
			}
			return Promise.resolve(false);
		},
		/**
		 * @param {boolean} bSaveAsFromRta - Boolean value which tells if 'Save As' is triggered from the UI adaptation header bar
		 * @param {boolean} bCopyUnsavedChanges - Boolean value which tells if the UI changes needs to be copied
		 * @param {string} sCurrentLayer - Current working layer
		 * @param {Object} oSelectedAppVariant - Contains the selected app variant from app variant overview dialog
		 * @returns {Promise} Resolved promise
		 * @description Creates the app variant when 'Save As' is triggered from the UI adaptation header bar.
		 * When 'Save As' triggered from the UI adaptation header bar, we set both flags <code>bSaveAsFromRta</code> and <code>bCopyUnsavedChanges</code> equal to <code>true</code>.
		 * The flag <code>bCopyUnsavedChanges</code> is <code>true</code> if a key user presses 'Save As' from the running app entry in the app variant overview dialog.
		 */
		onSaveAs: function(bSaveAsFromRta, bCopyUnsavedChanges, sCurrentLayer, oSelectedAppVariant) {
			var bIsS4HanaCloud;
			var oAppVariantSaveClosure;
			var oDescriptor = fnGetDescriptor();

			if (oSelectedAppVariant && oSelectedAppVariant["sap.app"].id === oDescriptor["sap.app"].id) {
				bCopyUnsavedChanges = true;
				oDescriptor = merge({}, oSelectedAppVariant);
				oSelectedAppVariant = null;
			}

			return new Promise(function(resolve) {
				var fnProcessSaveAsDialog = function() {
					return oAppVariantManager.processSaveAsDialog(oDescriptor, bSaveAsFromRta);
				};

				var fnCreateInlineChanges = function(oAppVariantSpecificData) {
					BusyIndicator.show();
					return oAppVariantManager.createAllInlineChanges(oAppVariantSpecificData);
				};

				var fnAddChangesToPersistence = function(aChanges) {
					var aAllInlineChanges = aChanges.slice();
					return AppVariantUtils.addChangesToPersistence(aAllInlineChanges, oRootControlRunningApp);
				};

				var fnCreateAppVariant = function() {
					var sAppVariantId = AppVariantUtils.getNewAppVariantId();
					// Based on the key user provided info, app variant descriptor is created
					return oAppVariantManager.createAppVariant(sAppVariantId)
						.catch(function(oError) {
							var sMessageKey = oError.messageKey;
							if (!sMessageKey) {
								sMessageKey = "MSG_SAVE_APP_VARIANT_FAILED";
							}

							return AppVariantUtils.catchErrorDialog(oError, sMessageKey, sAppVariantId);
						});
				};

				var fnClearRTACommandStack = function(oResult) {
					oAppVariantSaveClosure = null;
					oAppVariantSaveClosure = merge({}, oResult.response);

					// If there are any unsaved changes, should be taken away for the new created app variant
					return oAppVariantManager.clearRTACommandStack(bCopyUnsavedChanges);
				};

				var fnResetDirtyFlag = function() {
					var oUshellContainer = FlexUtils.getUshellContainer();
					if (oUshellContainer && bCopyUnsavedChanges) {
						// Tell FLP that no UI change is booked for the currently adapting app
						oUshellContainer.setDirtyFlag(false);
					}
				};

				var fnTriggerSuccessMessage = function(oSettings) {
					fnResetDirtyFlag();
					bIsS4HanaCloud = AppVariantUtils.isS4HanaCloud(oSettings);
					// Shows the success message and closes the current app (if 'Save As' triggered from UI adaptation toolbar)
					// or opens the app variant overview list (if 'Save As' triggered from App variant overview List)
					var oSuccessInfo = AppVariantUtils.buildSuccessInfo(oAppVariantSaveClosure.id, bSaveAsFromRta, bIsS4HanaCloud);
					return oAppVariantManager.showSuccessMessage(oSuccessInfo);
				};

				var fnShowCatalogAssignmentSuccessMessage = function() {
					var oSuccessInfo = AppVariantUtils.buildFinalSuccessInfoS4HANACloud();
					return oAppVariantManager.showSuccessMessage(oSuccessInfo);
				};


				var fnTriggerPlatformDependentFlow = function() {
					BusyIndicator.show();
					if (bIsS4HanaCloud) {
						var oIAMResponse;
						return fnS4HanaAddBrowserCloseWarning()
							.then(function() {
								return fnTriggerCatalogAssignment(oAppVariantSaveClosure.id, oAppVariantSaveClosure.reference);
							})
							.then(function(oResult) {
								oIAMResponse = Object.assign({}, oResult);
								BusyIndicator.hide();
								return fnTriggerActionFlow.call(this, bSaveAsFromRta, null, sCurrentLayer);
							}.bind(this))
							.then(function() {
								return fnTriggerPollingTileCreation(oIAMResponse, oAppVariantSaveClosure.id);
							})
							.then(function() {
								return fnShowCatalogAssignmentSuccessMessage();
							})
							.then(function() {
								fnS4HanaRemoveBrowserCloseWarning();
								return bSaveAsFromRta ? resolve() : fnTriggerActionFlow.call(this, bSaveAsFromRta, bIsS4HanaCloud, sCurrentLayer);
							}.bind(this));
					}
					BusyIndicator.hide();
					return fnTriggerActionFlow.call(this, bSaveAsFromRta, bIsS4HanaCloud, sCurrentLayer);
				};

				sap.ui.require(["sap/ui/rta/appVariant/AppVariantManager"], function(AppVariantManager) {
					if (!oAppVariantManager) {
						oAppVariantManager = new AppVariantManager({
							rootControl: oRootControlRunningApp,
							commandSerializer: oCommandSerializer,
							layer: sCurrentLayer
						});
					}

					return fnProcessSaveAsDialog()
						.then(fnCreateInlineChanges) // Create the inline changes for application variant
						.then(fnAddChangesToPersistence) // Adds the descriptor inline changes to the persistence
						.then(fnCreateAppVariant) // Creates the application variant and saves it to the layered repository
						.then(fnClearRTACommandStack)
						.then(fnGetFlexSettings)
						.then(fnTriggerSuccessMessage)
						.then(fnTriggerPlatformDependentFlow.bind(this)).then(resolve)
						.catch(function(oError) {
							if (!oError) {// Cancelling Save As Dialog
								return false;
							}
							if (bIsS4HanaCloud) {
								fnS4HanaRemoveBrowserCloseWarning();
							}
							return fnTriggerActionFlow.call(this, null, bIsS4HanaCloud, sCurrentLayer).then(resolve);
						}.bind(this));
				}.bind(this));
			}.bind(this));
		},
		/**
		 * @param {string} sAppVariantId - Application variant ID
		 * @param {boolean} bCurrentlyAdapting - Boolean value which tells if the running application is currently being adapted
		 * @param {string} sCurrentLayer - Current working layer
		 * @returns {Promise} Resolved promise
		 * @description Triggers a delete operation of the app variant.
		 */
		onDeleteFromOverviewDialog: function(sAppVariantId, bCurrentlyAdapting, sCurrentLayer) {
			var bIsS4HanaCloud;
			return new Promise(function(resolve) {
				sap.ui.require(["sap/ui/rta/appVariant/AppVariantManager"], function(AppVariantManager) {
					if (!oAppVariantManager) {
						oAppVariantManager = new AppVariantManager({
							rootControl: oRootControlRunningApp,
							commandSerializer: oCommandSerializer,
							layer: sCurrentLayer
						});
					}

					var fnDeleteAppVariant = function() {
						return oAppVariantManager.deleteAppVariant(sAppVariantId)
							.catch(function(oError) {
								if (oError === 'cancel') {
									return Promise.reject("cancel");
								}
								var sMessageKey = oError.messageKey;
								if (!sMessageKey) {
									sMessageKey = "MSG_DELETE_APP_VARIANT_FAILED";
								}
								return AppVariantUtils.catchErrorDialog(oError, sMessageKey, sAppVariantId);
							});
					};

					var fnDeleteSuccessMessage = function() {
						AppVariantUtils.closeOverviewDialog();
						var oSuccessInfo = AppVariantUtils.buildDeleteSuccessMessage(sAppVariantId, bIsS4HanaCloud);
						return oAppVariantManager.showSuccessMessage(oSuccessInfo);
					};


					var fnTriggerS4HanaPolling = function(oSettings) {
						bIsS4HanaCloud = AppVariantUtils.isS4HanaCloud(oSettings);
						if (bIsS4HanaCloud) {
							var oIAMResponse;
							return fnS4HanaAddBrowserCloseWarning(bCurrentlyAdapting)
								.then(function() {
									return fnTriggerCatalogUnAssignment(sAppVariantId);
								})
								.then(function(oResult) {
									oIAMResponse = Object.assign({}, oResult);
									return fnReloadOverviewDialog.call(this, !bCurrentlyAdapting, sCurrentLayer);
								}.bind(this))
								.then(function() {
									return fnTriggerPollingTileDeletion(oIAMResponse, sAppVariantId);
								});
						}
						BusyIndicator.show();
						return Promise.resolve();
					};

					var fnTriggerS4HanaRefresh = function() {
						if (bIsS4HanaCloud) {
							fnS4HanaRemoveBrowserCloseWarning();
						}
						BusyIndicator.hide();
						return bCurrentlyAdapting ? resolve() : fnReloadOverviewDialog.call(this, !bIsS4HanaCloud, bIsS4HanaCloud, sCurrentLayer).then(resolve);
					};

					if (bCurrentlyAdapting) {
						AppVariantUtils.closeOverviewDialog();
						AppVariantUtils.navigateToFLPHomepage();
					}

					return fnGetFlexSettings()
						.then(fnTriggerS4HanaPolling.bind(this))
						.then(fnDeleteAppVariant)
						.then(fnDeleteSuccessMessage)
						.then(fnTriggerS4HanaRefresh.bind(this))
						.catch(function(oError) {
							if (oError === 'cancel') {
								return false;
							}
							if (bIsS4HanaCloud) {
								fnS4HanaRemoveBrowserCloseWarning();
							}
							return fnReloadOverviewDialog.call(this, null, bIsS4HanaCloud, sCurrentLayer).then(resolve);
						}.bind(this));
				}.bind(this));
			}.bind(this));
		}
	};
});