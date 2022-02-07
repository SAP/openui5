/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/rta/appVariant/AppVariantDialog",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/appVariant/S4HanaCloudBackend"
], function(
	ManagedObject,
	AppVariantDialog,
	AppVariantUtils,
	RtaAppVariantFeature,
	S4HanaCloudBackend
) {
	"use strict";

	/**
	 * Basic implementation for the AppVariantManager.
	 *
	 * @class
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.53
	 * @alias sap.ui.rta.appVariant.AppVariantManager
	 * @experimental Since 1.53. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var AppVariantManager = ManagedObject.extend("sap.ui.rta.appVariant.AppVariantManager", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				commandSerializer: {
					type: "object" // has to be of type sap.ui.rta.command.LrepSerializer
				},
				layer: {
					type: "string"
				}
			}
		}
	});

	AppVariantManager.prototype._openDialog = function(fnCreate, fnCancel) {
		var oDialog = new AppVariantDialog("appVariantDialog");

		oDialog.attachCreate(fnCreate);
		oDialog.attachCancel(fnCancel);

		oDialog.attachAfterClose(function() {
			this.destroy();
		});

		oDialog.open();

		return oDialog;
	};

	/**
	 * Returns the info required to create the app variant
	 * @private
	 */
	AppVariantManager.prototype._prepareAppVariantData = function(oDescriptor, mParameters) {
		return {
			referenceAppId: oDescriptor["sap.app"].id,
			title: mParameters.title,
			subTitle: mParameters.subTitle,
			description: mParameters.description,
			icon: mParameters.icon,
			inbounds: oDescriptor["sap.app"].crossNavigation && oDescriptor["sap.app"].crossNavigation.inbounds ? oDescriptor["sap.app"].crossNavigation.inbounds : null
		};
	};

	/**
	 *
	 * @param {Object} oAppVariantSpecificData - Contains the specific info needed to create the inline changes for the app variant
	 * @param {sap.ui.fl.Selector} vSelector - Managed object or selector object
	 * @returns {Promise[]} returns all the descriptor inline changes
	 * @description Creates all the descriptor inline changes for different change types.
	 */
	AppVariantManager.prototype.createAllInlineChanges = function(oAppVariantSpecificData, vSelector) {
		var sAppVariantId = AppVariantUtils.getId(oAppVariantSpecificData.referenceAppId);
		var aAllInlineChangeOperations = [];
		var oPropertyChange = {};

		// create a inline change using a change type 'appdescr_app_setTitle'
		oPropertyChange.content = AppVariantUtils.prepareTextsChange("title", oAppVariantSpecificData.title);
		aAllInlineChangeOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_setTitle", vSelector));

		// create a inline change using a change type 'appdescr_app_setSubTitle'
		oPropertyChange.content = AppVariantUtils.prepareTextsChange("subtitle", oAppVariantSpecificData.subTitle);
		aAllInlineChangeOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_setSubTitle", vSelector));

		// create a inline change using a change type 'create_app_setDescription'
		oPropertyChange.content = AppVariantUtils.prepareTextsChange("description", oAppVariantSpecificData.description);
		aAllInlineChangeOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_setDescription", vSelector));

		// create a inline change using a change type 'appdescr_ui_setIcon'
		oPropertyChange = AppVariantUtils.getInlineChangeInputIcon(oAppVariantSpecificData.icon);
		aAllInlineChangeOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_ui_setIcon", vSelector));

		/***********************************************************Inbounds handling******************************************************************/
		return AppVariantUtils.getInboundInfo(oAppVariantSpecificData.inbounds)
			.then(function(oInboundInfo) {
				var sCurrentRunningInboundId = oInboundInfo.currentRunningInbound;

				// If there is no inbound, create a new inbound
				if (oInboundInfo.addNewInboundRequired) {
					// create a inline change using a change type 'appdescr_app_addNewInbound'
					var oInlineChangePromise = AppVariantUtils.prepareAddNewInboundChange(sCurrentRunningInboundId, sAppVariantId, oAppVariantSpecificData)
						.then(function(oPropertyChange) {
							return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_addNewInbound", vSelector);
						});

					aAllInlineChangeOperations.push(oInlineChangePromise);

					// create a inline change using a change type 'appdescr_app_removeAllInboundsExceptOne'
					oPropertyChange = AppVariantUtils.prepareRemoveAllInboundsExceptOneChange(sCurrentRunningInboundId);
					aAllInlineChangeOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_removeAllInboundsExceptOne", vSelector));
				} else {
					// create a inline change using a change type 'appdescr_app_changeInbound'
					oPropertyChange = AppVariantUtils.prepareChangeInboundChange(sCurrentRunningInboundId, sAppVariantId, oAppVariantSpecificData);
					aAllInlineChangeOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_changeInbound", vSelector));
				}

				return Promise.all(aAllInlineChangeOperations);
			});
	};

	/**
	 * @param {string} sAppVariantId - Application variant ID
	 * @param {sap.ui.fl.Selector} vSelector - Selector
	 * @returns {Promise} Resolved promise
	 * @description Creates the app variant with all inline changes in backend.
	 */
	AppVariantManager.prototype.createAppVariant = function(sAppVariantId, vSelector) {
		var mPropertyBag = {
			id: sAppVariantId,
			layer: this.getLayer()
		};
		return AppVariantUtils.createAppVariant(vSelector, mPropertyBag);
	};

	/**
	 * @param {string} sAppVariantId - Application variant ID
	 * @returns {Promise} Resolved promise
	 * @description Deletes the app variant from backend.
	 */
	AppVariantManager.prototype.deleteAppVariant = function(sAppVariantId) {
		return AppVariantUtils.deleteAppVariant({
			appId: sAppVariantId
		}, this.getLayer());
	};

	/**
	 *
	 * @param {Object} oDescriptor - Contains the app variant descriptor information
	 * @param {boolean} bSaveAsTriggeredFromRtaToolbar - Boolean value which tells if 'Save As' is triggered from the UI adaptation header bar
	 * @returns {Object} Contains the information to create the app variant
	 * @description Processes the Save As Dialog and consolidates the input parameters from the 'Save As' dialog as an object.
	 */
	AppVariantManager.prototype.processSaveAsDialog = function(oDescriptor, bSaveAsTriggeredFromRtaToolbar) {
		return new Promise(function(resolve, reject) {
			var fnCreate = function(oResult) {
				var mParameters = oResult.getParameters();
				var oAppVariantData = this._prepareAppVariantData(oDescriptor, mParameters);

				resolve(oAppVariantData);
			}.bind(this);

			var fnCancel = function() {
				if (!bSaveAsTriggeredFromRtaToolbar) {
					return RtaAppVariantFeature.onGetOverview(true, this.getLayer());
				}
				reject();
			}.bind(this);
			// open app variant creation dialog
			return this._openDialog(fnCreate, fnCancel);
		}.bind(this));
	};

	/**
	 * Dirty changes get taken over by the app variant.
	 * @returns {Promise} Resolves as soon as the command stack is cleared
	 * @private
	 */
	AppVariantManager.prototype._clearRTACommandStack = function() {
		return this.getCommandSerializer().clearCommandStack();
	};

	/**
	 *
	 * @param {boolean} bCopyUnsavedChanges - Boolean value which tells whether the dirty changes exist and need to be copied
	 * @returns {Promise} Server response
	 * @description Clears the RTA command stack
	 */
	AppVariantManager.prototype.clearRTACommandStack = function(bCopyUnsavedChanges) {
		var oCommandStack = this.getCommandSerializer().getCommandStack();
		if (bCopyUnsavedChanges && oCommandStack.getAllExecutedCommands().length) {
			return this._clearRTACommandStack();
		}

		return Promise.resolve();
	};

	/**
	 *
	 * @param {string} sAppVariantId - Contains the application variant ID
	 * @param {string} sReferenceAppId - Contains the reference application ID
	 * @param {boolean} bSaveAs - Indicates whether the app is currently being saved
	 * @returns {Promise} Server response
	 * @description In 'Save As' scenario: The app variant gets assigned to the same catalog(s) as the original app;
	 * In 'Deletion' scenario: The app variant is unassigned from all catalogs.
	 */
	AppVariantManager.prototype.triggerCatalogPublishing = function(sAppVariantId, sReferenceAppId, bSaveAs) {
		var fnTriggerCatalogOperation = bSaveAs ? AppVariantUtils.triggerCatalogAssignment : AppVariantUtils.triggerCatalogUnAssignment;
		return fnTriggerCatalogOperation(sAppVariantId, this.getLayer(), sReferenceAppId)
			.catch(function(oError) {
				var sMessageKey = bSaveAs ? "MSG_CATALOG_ASSIGNMENT_FAILED" : "MSG_DELETE_APP_VARIANT_FAILED";
				return AppVariantUtils.catchErrorDialog(oError, sMessageKey, sAppVariantId);
			});
	};

	/**
	 *
	 * @param {string} sIamId - Identity Access Management ID of SAP Fiori app
	 * @param {string} sAppVarId - Application variant ID
	 * @param {boolean} bCreation - Indicates that app is being created
	 * @returns {Promise} Resolved promise
	 * @description When the app variant creation/deletion and catalog assignment/unassignment are executed successfully, this asynchronous process gets triggered. It talks to the server every 2.5 secs.
	 * In case of creation: It checks whether the new FLP tile is available.
	 * In case of deletion: It checks whether the catalogs bound to the app variant have been unpublished and the deletion can be started.
	 */
	AppVariantManager.prototype.notifyKeyUserWhenPublishingIsReady = function(sIamId, sAppVarId, bCreation) {
		var oS4HanaCloudBackend = new S4HanaCloudBackend();
		return oS4HanaCloudBackend.notifyFlpCustomizingIsReady(sIamId, bCreation).catch(function(oError) {
			var sMessageKey = bCreation ? "MSG_TILE_CREATION_FAILED" : "MSG_DELETE_APP_VARIANT_FAILED";
			if (!bCreation && oError.error === "locked") {
				sMessageKey = "MSG_CATALOGS_LOCKED";
			}
			return AppVariantUtils.catchErrorDialog(oError, sMessageKey, sAppVarId);
		});
	};

	/**
	 *
	 * @param {Object} oSuccessInfo - Contains the success text and success message information
	 * @returns {Promise} Resolved promise
	 * @description Frames the success message depending on different platforms (S/4HANA Cloud Platform or S/4HANA on Premise) and shows it on the dialog.
	 * If a user chooses 'Save As' from the UI adaptation header bar, it closes the current running app and navigates to the SAP Fiori Launchpad.
	 * If a user chooses 'Save As' from app variant overview dialog, it opens the app variant overview dialog again to show the 'Just Created' app variant.
	 */
	AppVariantManager.prototype.showSuccessMessage = function(oSuccessInfo) {
		return AppVariantUtils.showRelevantDialog(oSuccessInfo, true);
	};

	return AppVariantManager;
}, true);