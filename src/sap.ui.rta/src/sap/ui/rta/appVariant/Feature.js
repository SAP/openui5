/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/EventBus",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/_internal/appVariant/AppVariantFactory",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/Utils",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/util/showMessageBox"
], function(
	merge,
	BusyIndicator,
	EventBus,
	FlexRuntimeInfoAPI,
	AppVariantFactory,
	FeaturesAPI,
	FlexUtils,
	AppVariantUtils,
	showMessageBox
) {
	"use strict";

	let oAppVariantOverviewDialog;
	let oAppVariantManager;
	let oRootControlRunningApp;
	let oCommandSerializer;
	let _oldUnloadHandler;

	const fnGetManifest = function() {
		return FlexUtils.getAppDescriptor(oRootControlRunningApp);
	};

	const fnS4HanaRemoveBrowserCloseWarning = function() {
		window.onbeforeunload = _oldUnloadHandler;
	};

	const fnS4HanaAddBrowserCloseWarning = function(bCurrentlyAdapting) {
		const sMessageKey = bCurrentlyAdapting ? "MSG_DO_NOT_CLOSE_BROWSER_CURRENTLY_ADAPTING" : "MSG_DO_NOT_CLOSE_BROWSER";
		_oldUnloadHandler = window.onbeforeunload;
		window.onbeforeunload = AppVariantUtils.handleBeforeUnloadEvent;
		return AppVariantUtils.showMessage(sMessageKey);
	};

	const fnTriggerCatalogAssignment = function(sAppVariantId, sReferenceAppId) {
		return oAppVariantManager.triggerCatalogPublishing(sAppVariantId, sReferenceAppId, true);
	};

	const fnTriggerCatalogUnAssignment = function(sAppVariantId) {
		return oAppVariantManager.triggerCatalogPublishing(sAppVariantId, null, false);
	};

	const fnReloadOverviewDialog = function(bIsReloadNeeded, sCurrentLayer) {
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

	const fnTriggerActionFlow = function(bSaveAsTriggeredFromRtaToolbar, bIsS4HanaCloud, sCurrentLayer) {
		return bSaveAsTriggeredFromRtaToolbar ? AppVariantUtils.navigateToFLPHomepage() : fnReloadOverviewDialog.call(this, !bIsS4HanaCloud, sCurrentLayer);
	};

	const fnTriggerPollingTileCreation = function(oResult, sAppVariantId) {
		// In case of S/4HANA Cloud, oResult is filled from catalog assignment call
		if (oResult && oResult.response && oResult.response.IAMId) {
			if (!Array.isArray(oResult.response.CatalogIds) || oResult.response.CatalogIds.length === 0) {
				const sMessage = AppVariantUtils.getText("MSG_BASE_APP_CATALOGS_NOT_FOUND", sAppVariantId);
				const sTitle = AppVariantUtils.getText("HEADER_SAVE_APP_VARIANT_FAILED");
				showMessageBox(sMessage, {title: sTitle}, "error");
				return Promise.reject();
			}
			return oAppVariantManager.notifyKeyUserWhenPublishingIsReady(oResult.response.IAMId, sAppVariantId, true);
		}
		return Promise.resolve();
	};

	const fnTriggerPollingTileDeletion = function(oResult, sAppVariantId) {
		// In case of S/4HANA Cloud, oResult is filled from catalog unassignment call, do polling only if inProgress === true
		if (oResult && oResult.response && oResult.response.IAMId && oResult.response.inProgress) {
			return oAppVariantManager.notifyKeyUserWhenPublishingIsReady(oResult.response.IAMId, sAppVariantId, false);
		}
		return Promise.resolve();
	};

	EventBus.getInstance().subscribe("sap.ui.rta.appVariant.manageApps.controller.ManageApps", "navigate", function() {
		if (oAppVariantOverviewDialog) {
			oAppVariantOverviewDialog.destroy();
			oAppVariantOverviewDialog = null;
		}
	});

	return {
		// To see the overview of app variants, a key user has created from an app
		onGetOverview(bAsKeyUser, sLayer) {
			const oManifest = fnGetManifest();

			return new Promise(function(resolve) {
				const fnCancel = function() {
					AppVariantUtils.closeOverviewDialog();
				};

				const sOverviewPath = "sap/ui/rta/appVariant/AppVariantOverviewDialog";
				const oProperties = {
					idRunningApp: oManifest["sap.app"].id,
					isOverviewForKeyUser: bAsKeyUser,
					layer: sLayer
				};

				sap.ui.require([sOverviewPath], function(AppVariantOverviewDialog) {
					oAppVariantOverviewDialog ||= new AppVariantOverviewDialog(oProperties);

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
		isOverviewExtended() {
			const oUriParams = new URLSearchParams(window.location.search);
			const sMode = oUriParams.get("sap-ui-xx-app-variant-overview-extended");
			if (!sMode) {
				return false;
			}

			return sMode.toLowerCase() === "true";
		},
		isManifestSupported() {
			const oManifest = fnGetManifest();
			return AppVariantUtils.getManifirstSupport(oManifest["sap.app"].id);
		},
		/**
		 * @param {object} oRootControl - Root control of an app (variant)
		 * @param {string} sCurrentLayer - Current working layer
		 * @param {object} oLrepSerializer - Layered repository serializer
		 * @returns {boolean} Boolean value
		 */
		isSaveAsAvailable(oRootControl, sCurrentLayer, oLrepSerializer) {
			oRootControlRunningApp = oRootControl;
			oCommandSerializer = oLrepSerializer;

			const oManifest = fnGetManifest();

			if (oManifest["sap.app"] && oManifest["sap.app"].id) {
				return FeaturesAPI.isSaveAsAvailable(sCurrentLayer).then(function(bIsSaveAsAvailable) {
					if (bIsSaveAsAvailable) {
						if (oManifest["sap.app"].crossNavigation && oManifest["sap.app"].crossNavigation.inbounds) {
							return AppVariantUtils.getInboundInfo(oManifest["sap.app"].crossNavigation.inbounds);
						}
						return AppVariantUtils.getInboundInfo();
					}
					return undefined;
				}).then(function(oInboundInfo) {
					return !!oInboundInfo;
				});
			}
			return Promise.resolve(false);
		},
		/**
		 * @param {object} oRootControl - Root control of an app (variant)
		 * @returns {Promise} Resolved promise with an app variant manifest
		 * @description Getting here an app variant manifest from the layered repository.
		 */
		getAppVariantManifest(oRootControl) {
			oRootControlRunningApp = oRootControl;
			const oManifest = fnGetManifest();
			if (oManifest["sap.app"] && oManifest["sap.app"].id) {
				return AppVariantFactory.load({
					id: oManifest["sap.app"].id
				});
			}
			return Promise.resolve(false);
		},
		_determineSelector(bIsRunningApp, oManifest) {
			return bIsRunningApp ? oRootControlRunningApp : {
				appId: oManifest["sap.app"].id,
				appVersion: oManifest["sap.app"].applicationVersion.version
			};
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
		onSaveAs(bSaveAsFromRta, bCopyUnsavedChanges, sCurrentLayer, oSelectedAppVariant) {
			let bIsS4HanaCloud;
			let oAppVariantSaveClosure;
			let oManifest = fnGetManifest();
			let bIsRunningApp = true;

			if (
				oSelectedAppVariant
				&& oSelectedAppVariant["sap.app"].id === oManifest["sap.app"].id
			) {
				// When an app variant is created on top of base app/app variant from the app variant overview dialog and root control is from the latter
				bCopyUnsavedChanges = true;
				oManifest = merge({}, oSelectedAppVariant);
				oSelectedAppVariant = null;
			} else if (oSelectedAppVariant) {
				// When an app variant is created on top of app variant from the app variant overview dialog and root control is from base application
				bIsRunningApp = false;
				oManifest = merge({}, oSelectedAppVariant);
				oSelectedAppVariant = null;
			}

			// Determine the selector
			const vSelector = this._determineSelector(bIsRunningApp, oManifest);

			return new Promise(function(resolve) {
				const fnProcessSaveAsDialog = function() {
					return oAppVariantManager.processSaveAsDialog(oManifest, bSaveAsFromRta);
				};

				const fnCreateInlineChanges = function(oAppVariantSpecificData) {
					BusyIndicator.show();
					return oAppVariantManager.createAllInlineChanges(oAppVariantSpecificData, vSelector);
				};

				const fnAddChangesToPersistence = function(aChanges) {
					const aAllInlineChanges = aChanges.slice();
					return AppVariantUtils.addChangesToPersistence(aAllInlineChanges, vSelector);
				};

				const fnCreateAppVariant = function() {
					const sAppVariantId = AppVariantUtils.getNewAppVariantId();

					// Based on the key user provided info, app variant manifest is created
					return oAppVariantManager.createAppVariant(sAppVariantId, vSelector)
					.catch(function(oError) {
						let sMessageKey = oError.messageKey;
						sMessageKey ||= "MSG_SAVE_APP_VARIANT_FAILED";

						return AppVariantUtils.catchErrorDialog(oError, sMessageKey, sAppVariantId);
					});
				};

				const fnClearRTACommandStack = function(oResult) {
					oAppVariantSaveClosure = null;
					oAppVariantSaveClosure = merge({}, oResult.response);

					// If there are any unsaved changes, should be taken away for the new created app variant
					return oAppVariantManager.clearRTACommandStack(bCopyUnsavedChanges);
				};

				const fnResetDirtyFlag = function() {
					const oUshellContainer = FlexUtils.getUshellContainer();
					if (oUshellContainer && bCopyUnsavedChanges) {
						// Tell FLP that no UI change is booked for the currently adapting app
						oUshellContainer.setDirtyFlag(false);
					}
				};

				var fnTriggerSuccessMessage = function() {
					fnResetDirtyFlag();
					bIsS4HanaCloud = FlexRuntimeInfoAPI.isAtoEnabled();
					// Shows the success message and closes the current app (if 'Save As' triggered from UI adaptation toolbar)
					// or opens the app variant overview list (if 'Save As' triggered from App variant overview List)
					const oSuccessInfo = AppVariantUtils.buildSuccessInfo(oAppVariantSaveClosure.id, bSaveAsFromRta, bIsS4HanaCloud);
					return oAppVariantManager.showSuccessMessage(oSuccessInfo);
				};

				const fnShowCatalogAssignmentSuccessMessage = function() {
					const oSuccessInfo = AppVariantUtils.buildFinalSuccessInfoS4HANACloud();
					return oAppVariantManager.showSuccessMessage(oSuccessInfo);
				};

				const fnTriggerPlatformDependentFlow = function() {
					BusyIndicator.show();
					if (bIsS4HanaCloud) {
						let oIAMResponse;
						return fnS4HanaAddBrowserCloseWarning()
						.then(function() {
							return fnTriggerCatalogAssignment(oAppVariantSaveClosure.id, oAppVariantSaveClosure.reference);
						})
						.then(function(oResult) {
							oIAMResponse = { ...oResult };
							BusyIndicator.hide();
							return fnTriggerActionFlow.call(this, bSaveAsFromRta, null, sCurrentLayer);
						}.bind(this))
						.then(function() {
							return fnTriggerPollingTileCreation(oIAMResponse, oAppVariantSaveClosure.id);
						})
						.then(function() {
							fnS4HanaRemoveBrowserCloseWarning();
							return fnShowCatalogAssignmentSuccessMessage();
						})
						.then(function() {
							return bSaveAsFromRta ? resolve() : fnTriggerActionFlow.call(this, bSaveAsFromRta, bIsS4HanaCloud, sCurrentLayer);
						}.bind(this));
					}
					BusyIndicator.hide();
					return fnTriggerActionFlow.call(this, bSaveAsFromRta, bIsS4HanaCloud, sCurrentLayer);
				};

				sap.ui.require(["sap/ui/rta/appVariant/AppVariantManager"], function(AppVariantManager) {
					oAppVariantManager ||= new AppVariantManager({
						commandSerializer: oCommandSerializer,
						layer: sCurrentLayer
					});

					return fnProcessSaveAsDialog()
					.then(fnCreateInlineChanges) // Create the inline changes for application variant
					.then(fnAddChangesToPersistence) // Adds the manifest inline changes to the persistence
					.then(fnCreateAppVariant) // Creates the application variant and saves it to the layered repository
					.then(fnClearRTACommandStack)
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
		onDeleteFromOverviewDialog(sAppVariantId, bCurrentlyAdapting, sCurrentLayer) {
			let bIsS4HanaCloud;
			return new Promise(function(resolve) {
				sap.ui.require(["sap/ui/rta/appVariant/AppVariantManager"], function(AppVariantManager) {
					oAppVariantManager ||= new AppVariantManager({
						rootControl: oRootControlRunningApp,
						commandSerializer: oCommandSerializer,
						layer: sCurrentLayer
					});

					const fnDeleteAppVariant = function() {
						return oAppVariantManager.deleteAppVariant(sAppVariantId)
						.catch(function(oError) {
							if (oError === "cancel") {
								return Promise.reject("cancel");
							}
							let sMessageKey = oError.messageKey;
							sMessageKey ||= "MSG_DELETE_APP_VARIANT_FAILED";
							return AppVariantUtils.catchErrorDialog(oError, sMessageKey, sAppVariantId);
						});
					};

					const fnDeleteSuccessMessage = function() {
						AppVariantUtils.closeOverviewDialog();
						const oSuccessInfo = AppVariantUtils.buildDeleteSuccessMessage(sAppVariantId, bIsS4HanaCloud);
						return oAppVariantManager.showSuccessMessage(oSuccessInfo);
					};

					const fnTriggerS4HanaPolling = function() {
						bIsS4HanaCloud = FlexRuntimeInfoAPI.isAtoEnabled();
						if (bIsS4HanaCloud) {
							let oIAMResponse;
							return fnS4HanaAddBrowserCloseWarning(bCurrentlyAdapting)
							.then(function() {
								return fnTriggerCatalogUnAssignment(sAppVariantId);
							})
							.then(function(oResult) {
								oIAMResponse = { ...oResult };
								return fnReloadOverviewDialog.call(this, !bCurrentlyAdapting, sCurrentLayer);
							}.bind(this))
							.then(function() {
								return fnTriggerPollingTileDeletion(oIAMResponse, sAppVariantId);
							});
						}
						BusyIndicator.show();
						return Promise.resolve();
					};

					const fnTriggerS4HanaRefresh = function() {
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

					return fnTriggerS4HanaPolling.call(this)
					.then(fnDeleteAppVariant)
					.then(fnDeleteSuccessMessage)
					.then(fnTriggerS4HanaRefresh.bind(this))
					.catch(function(oError) {
						if (oError === "cancel") {
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