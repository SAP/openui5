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
		metadata : {
			library : "sap.ui.rta",
			properties : {
				/** The root control which is needed for the Flex Persistence */
				rootControl : {
					type: "sap.ui.core.Control"
				},
				commandSerializer : {
					type: "object" // has to be of type sap.ui.rta.command.LrepSerializer
				},
				layer: {
					type: "string"
				}
			}
		}
	});

	/**
	 * Opens the 'Save As' dialog.
	 * @private
	 */
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
			idRunningApp: oDescriptor["sap.app"].id,
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
	 * @returns {Promise[]} returns all the descriptor inline changes
	 * @description Creates all the descriptor inline changes for different change types.
	 */
	AppVariantManager.prototype.createAllInlineChanges = function(oAppVariantSpecificData) {
		var sAppVariantId = AppVariantUtils.getId(oAppVariantSpecificData.idRunningApp);
		var aAllInlineChangeOperations = [];
		var oPropertyChange;

		// create a inline change using a change type 'appdescr_app_setTitle'
		oPropertyChange = AppVariantUtils.getInlinePropertyChange("title", oAppVariantSpecificData.title);
		aAllInlineChangeOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_setTitle", this.getRootControl()));

		// create a inline change using a change type 'appdescr_app_setSubTitle'
		oPropertyChange = AppVariantUtils.getInlinePropertyChange("subtitle", oAppVariantSpecificData.subTitle);
		aAllInlineChangeOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_setSubTitle", this.getRootControl()));

		// create a inline change using a change type 'create_app_setDescription'
		oPropertyChange = AppVariantUtils.getInlinePropertyChange("description", oAppVariantSpecificData.description);
		aAllInlineChangeOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_setDescription", this.getRootControl()));

		// create a inline change using a change type 'appdescr_ui_setIcon'
		oPropertyChange = AppVariantUtils.getInlineChangeInputIcon(oAppVariantSpecificData.icon);
		aAllInlineChangeOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_ui_setIcon", this.getRootControl()));

		// ***********************************************************Inbounds handling******************************************************************
		var oInboundInfo = AppVariantUtils.getInboundInfo(oAppVariantSpecificData.inbounds);
		var sCurrentRunningInboundId = oInboundInfo.currentRunningInbound;
		var bAddNewInboundRequired = oInboundInfo.addNewInboundRequired;

		// If there is no inbound, create a new inbound
		if (sCurrentRunningInboundId === "customer.savedAsAppVariant" && bAddNewInboundRequired) {
			oPropertyChange = AppVariantUtils.getInlineChangeCreateInbound(sCurrentRunningInboundId);
			// create a inline change using a change type 'appdescr_app_addNewInbound'
			aAllInlineChangeOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_addNewInbound", this.getRootControl()));
		}

		// create a inline change using a change type 'appdescr_app_changeInbound'
		oPropertyChange = AppVariantUtils.getInlineChangeForInboundPropertySaveAs(sCurrentRunningInboundId, sAppVariantId);
		aAllInlineChangeOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_changeInbound", this.getRootControl()));

		// create a inline change using a change type 'appdescr_app_removeAllInboundsExceptOne'
		oPropertyChange = AppVariantUtils.getInlineChangeRemoveInbounds(sCurrentRunningInboundId);
		aAllInlineChangeOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_removeAllInboundsExceptOne", this.getRootControl()));

		// create a inline change using a change type 'appdescr_app_changeInbound'
		oPropertyChange = AppVariantUtils.getInlineChangesForInboundProperties(sCurrentRunningInboundId, oAppVariantSpecificData.idRunningApp, "title", oAppVariantSpecificData.title);
		aAllInlineChangeOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_changeInbound", this.getRootControl()));

		// create a inline change using a change type 'appdescr_app_changeInbound'
		oPropertyChange = AppVariantUtils.getInlineChangesForInboundProperties(sCurrentRunningInboundId, oAppVariantSpecificData.idRunningApp, "subTitle", oAppVariantSpecificData.subTitle);
		aAllInlineChangeOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_changeInbound", this.getRootControl()));

		// create a inline change using a change type 'appdescr_app_changeInbound'
		oPropertyChange = AppVariantUtils.getInlineChangesForInboundProperties(sCurrentRunningInboundId, oAppVariantSpecificData.idRunningApp, "icon", oAppVariantSpecificData.icon);
		aAllInlineChangeOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_changeInbound", this.getRootControl()));

		return Promise.all(aAllInlineChangeOperations);
	};

	/**
	 * @param {String} sAppVariantId - Application variant ID
	 * @returns {Promise} Resolved promise
	 * @description Creates the app variant with all inline changes in backend.
	 */
	AppVariantManager.prototype.createAppVariant = function(sAppVariantId) {
		var mPropertyBag = {
			id: sAppVariantId,
			layer: this.getLayer()
		};
		return AppVariantUtils.createAppVariant(this.getRootControl(), mPropertyBag)
			.catch(function(oError) {
				var sMessageKey = oError.messageKey;
				if (!sMessageKey) {
					sMessageKey = "MSG_SAVE_APP_VARIANT_FAILED";
				}
				return AppVariantUtils.catchErrorDialog(oError, sMessageKey, sAppVariantId);
			});
	};

	/**
	 * @param {String} sAppVariantId - Application variant ID
	 * @returns {Promise} Resolved promise
	 * @description Deletes the app variant from backend.
	 */
	AppVariantManager.prototype.deleteAppVariant = function(sAppVariantId) {
		return AppVariantUtils.deleteAppVariant({
			appId: sAppVariantId
		})
			.catch(function(oError) {
				var sMessageKey = oError.messageKey;
				if (!sMessageKey) {
					sMessageKey = "MSG_DELETE_APP_VARIANT_FAILED";
				}
				return AppVariantUtils.catchErrorDialog(oError, sMessageKey, sAppVariantId);
			});
	};

	/**
	 *
	 * @param {Object} oDescriptor - Contains the app variant descriptor information
	 * @param {Boolean} bSaveAsTriggeredFromRtaToolbar - Boolean value which tells if 'Save As' is triggered from the UI adaptation header bar
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
	 * @private
	 */
	AppVariantManager.prototype._clearRTACommandStack = function() {
		return this.getCommandSerializer().clearCommandStack();
	};

	/**
	 *
	 * @param {Boolean} bCopyUnsavedChanges - Boolean value which tells whether the dirty changes exist and need to be copied
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
	 * @param {String} sAppVariantId - Contains the application variant ID
	 * @param {String} sReferenceAppId - Contains the reference application ID
	 * @param {Boolean} bSaveAs - Indicates whether the app is currently being saved
	 * @returns {Promise} Server response
	 * @description In 'Save As' scenario: The app variant gets assigned to the same catalog(s) as the original app;
	 * In 'Deletion' scenario: The app variant is unassigned from all catalogs.
	 */
	AppVariantManager.prototype.triggerCatalogPublishing = function(sAppVariantId, sReferenceAppId, bSaveAs) {
		var fnTriggerCatalogOperation = bSaveAs ? AppVariantUtils.triggerCatalogAssignment : AppVariantUtils.triggerCatalogUnAssignment;
		return fnTriggerCatalogOperation(sAppVariantId, sReferenceAppId)
		.catch(function(oError) {
			var sMessageKey = bSaveAs ? "MSG_CATALOG_ASSIGNMENT_FAILED" : "MSG_DELETE_APP_VARIANT_FAILED";
			return AppVariantUtils.catchErrorDialog(oError, sMessageKey, sAppVariantId);
		});
	};

	/**
	 *
	 * @param {String} sIamId - Identity Access Management ID of SAP Fiori app
	 * @param {String} sAppVariantId - Application variant ID
	 * @param {Boolean} bCreation - Indicates that app is being created
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