/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/rta/appVariant/AppVariantDialog",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/appVariant/S4HanaCloudBackend",
	"sap/ui/core/BusyIndicator"
], function(
	ManagedObject,
	AppVariantDialog,
	AppVariantUtils,
	RtaAppVariantFeature,
	S4HanaCloudBackend,
	BusyIndicator
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
				/** The root control which is needed for the Flex Controller */
				rootControl : {
					type: "sap.ui.core.Control"
				},
				commandSerializer : {
					type: "object" // has to be of type sap.ui.rta.command.LrepSerializer
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
	 * Returns the info required to create the app variant descriptor.
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
	 * @param {Object} oAppVariantData - Contains the info needed to create an app variant descriptor
	 * @returns {Promise[]} returns all the descriptor inline changes
	 * @description Creates all the descriptor inline changes for different change types.
	 */
	AppVariantManager.prototype.createAllInlineChanges = function(oAppVariantData) {
		var sAppVariantId, aBackendOperations = [], oPropertyChange;

		sAppVariantId = AppVariantUtils.getId(oAppVariantData.idRunningApp);

		var oAppVariantDescriptor = {
			id: sAppVariantId,
			reference: oAppVariantData.idRunningApp
		};

		// creates the app variant descriptor
		aBackendOperations.push(AppVariantUtils.createDescriptorVariant(oAppVariantDescriptor));

		// create a inline change using a change type 'appdescr_app_setTitle'
		oPropertyChange = AppVariantUtils.getInlinePropertyChange("title", oAppVariantData.title);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "title"));

		// create a inline change using a change type 'appdescr_app_setSubTitle'
		oPropertyChange = AppVariantUtils.getInlinePropertyChange("subtitle", oAppVariantData.subTitle);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "subtitle"));

		// create a inline change using a change type 'create_app_setDescription'
		oPropertyChange = AppVariantUtils.getInlinePropertyChange("description", oAppVariantData.description);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "description"));

		// create a inline change using a change type 'appdescr_ui_setIcon'
		oPropertyChange = AppVariantUtils.getInlineChangeInputIcon(oAppVariantData.icon);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "icon"));

		// ***********************************************************Inbounds handling******************************************************************
		var oInboundInfo = AppVariantUtils.getInboundInfo(oAppVariantData.inbounds);
		var sCurrentRunningInboundId = oInboundInfo.currentRunningInbound;
		var bAddNewInboundRequired = oInboundInfo.addNewInboundRequired;

		// If there is no inbound, create a new inbound
		if (sCurrentRunningInboundId === "customer.savedAsAppVariant" && bAddNewInboundRequired) {
			oPropertyChange = AppVariantUtils.getInlineChangeCreateInbound(sCurrentRunningInboundId);
			// create a inline change using a change type 'appdescr_app_addNewInbound'
			aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "createInbound"));
		}

		// create a inline change using a change type 'appdescr_app_changeInbound'
		oPropertyChange = AppVariantUtils.getInlineChangeForInboundPropertySaveAs(sCurrentRunningInboundId);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "inbound"));

		// create a inline change using a change type 'appdescr_app_removeAllInboundsExceptOne'
		oPropertyChange = AppVariantUtils.getInlineChangeRemoveInbounds(sCurrentRunningInboundId);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "removeInbound"));

		// create a inline change using a change type 'appdescr_app_changeInbound'
		oPropertyChange = AppVariantUtils.getInlineChangesForInboundProperties(sCurrentRunningInboundId, sAppVariantId, "title", oAppVariantData.title);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "inboundTitle"));

		// create a inline change using a change type 'appdescr_app_changeInbound'
		oPropertyChange = AppVariantUtils.getInlineChangesForInboundProperties(sCurrentRunningInboundId, sAppVariantId, "subTitle", oAppVariantData.subTitle);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "inboundSubtitle"));

		// create a inline change using a change type 'appdescr_app_changeInbound'
		oPropertyChange = AppVariantUtils.getInlineChangesForInboundProperties(sCurrentRunningInboundId, sAppVariantId, "icon", oAppVariantData.icon);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "inboundIcon"));

		return aBackendOperations;
	};

	/**
	 *
	 * @param {Object} oAppVariantData - Contains the info needed to create an app variant descriptor
	 * @returns {Promise} Resolved promise
	 * @description Creates the descriptor variant from the descriptor inline changes and takes the transport ID from the transport dialog.
	 */
	AppVariantManager.prototype.createDescriptor = function(oAppVariantData) {
		var aInlineChanges = this.createAllInlineChanges(oAppVariantData);

		var oAppVariantDescriptor;
		return Promise.all(aInlineChanges).then(function(aResponses) {
			oAppVariantDescriptor = aResponses.shift();
			aInlineChanges = [];

			aResponses.forEach(function(oInlineChange) {
				aInlineChanges.push(oAppVariantDescriptor.addDescriptorInlineChange(oInlineChange));
			});

			return Promise.all(aInlineChanges);
		}).then(function() {
			var sNamespace = oAppVariantDescriptor.getNamespace();
			var oSettings = oAppVariantDescriptor.getSettings();

			if (AppVariantUtils.isS4HanaCloud(oSettings)) {
				var oTransportInput = AppVariantUtils.getTransportInput("", sNamespace, "manifest", "appdescr_variant");
				return AppVariantUtils.openTransportSelection(oTransportInput);
			}
			return Promise.resolve({
				packageName: "$TMP",
				transport: ""
			});
		}).then(function(oTransportInfo) {
			return AppVariantUtils.onTransportInDialogSelected(oAppVariantDescriptor, oTransportInfo);
		}).catch(function(oError) {
			var oErrorInfo = AppVariantUtils.buildErrorInfo("MSG_CREATE_DESCRIPTOR_FAILED", oError, oAppVariantDescriptor.getId());
			BusyIndicator.hide();
			return AppVariantUtils.showRelevantDialog(oErrorInfo, false);
		});
	};

	/**
	 *
	 * @param {Object} oDescriptor - Contains the app variant descriptor information
	 * @param {Boolean} bSaveAsTriggeredFromRtaToolbar - Boolean value which tells if 'Save As' is triggered from the UI adaptation header bar
	 * @returns {Object} Contains the information to create the app variant
	 * @description Consolidates the input parameters from the 'Save As' dialog as an object.
	 */
	AppVariantManager.prototype.processSaveAsDialog = function(oDescriptor, bSaveAsTriggeredFromRtaToolbar) {
		return new Promise(function(resolve) {
			var fnCreate = function(oResult) {
				var mParameters = oResult.getParameters();
				var oAppVariantData = this._prepareAppVariantData(oDescriptor, mParameters);

				resolve(oAppVariantData);
			}.bind(this);

			var fnCancel = function() {
				if (!bSaveAsTriggeredFromRtaToolbar) {
					return RtaAppVariantFeature.onGetOverview(true);
				}
			};
			// open app variant creation dialog
			return this._openDialog(fnCreate, fnCancel);
		}.bind(this));
	};

	/**
	 *
	 * @param {Object} oAppVariantDescriptor - Contains the app variant descriptor information
	 * @returns {Promise} Server response
	 * @description Persists the new created app variant into the layered repository.
	 */
	AppVariantManager.prototype.saveAppVariantToLREP = function(oAppVariantDescriptor) {
		return oAppVariantDescriptor.submit().catch(function(oError) {
			return AppVariantUtils.catchErrorDialog(oError, "MSG_SAVE_APP_VARIANT_FAILED", oAppVariantDescriptor.getId());
		});
	};

	/**
	 * Dirty changes get taken over by the app variant.
	 * @private
	 */
	AppVariantManager.prototype._takeOverDirtyChangesByAppVariant = function(sReferenceAppIdForChanges) {
		return this.getCommandSerializer().saveAsCommands(sReferenceAppIdForChanges);
	};

	/**
	 *
	 * @param {String} sAppVariantId
	 */
	AppVariantManager.prototype._deleteAppVariantFromLREP = function(sAppVariantId) {
		return AppVariantUtils.triggerDeleteAppVariantFromLREP(sAppVariantId);
	};

	/**
	 *
	 * @param {String} sAppVariantId - Application variant ID
	 * @param {Boolean} bCopyUnsavedChanges - Boolean value which tells whether the dirty changes exist and need to be copied
	 * @returns {Promise} Server response
	 * @description Saves the unsaved changes for the new app variant and persists these changes in the layered repository.
	 */
	AppVariantManager.prototype.copyUnsavedChangesToLREP = function(sAppVariantId, bCopyUnsavedChanges) {
		var oCommandStack = this.getCommandSerializer().getCommandStack();
		if (bCopyUnsavedChanges && oCommandStack.getAllExecutedCommands().length) {
			return this._takeOverDirtyChangesByAppVariant(sAppVariantId).catch(function(oError) {
				return this._deleteAppVariantFromLREP(sAppVariantId).catch(function(oError) {
					return AppVariantUtils.catchErrorDialog(oError, "SAVE_AS_MSG_DELETE_APP_VARIANT", sAppVariantId);
				}).then(function() {
					return AppVariantUtils.catchErrorDialog(oError, "MSG_COPY_UNSAVED_CHANGES_FAILED");
				});
			}.bind(this));
		}

		return Promise.resolve();
	};

	/**
	 *
	 * @param {Object} oAppVariantDescriptor - Contains the app variant descriptor information
	 * @param {Boolean} bSaveAs - Indicates whether the app is currently being saved
	 * @returns {Promise} Server response
	 * @description In 'Save As' scenario: The app variant gets assigned to the same catalog(s) as the original app;
	 * In 'Deletion' scenario: The app variant is unassigned from all catalogs.
	 */
	AppVariantManager.prototype.triggerCatalogPublishing = function(oAppVariantDescriptor, bSaveAs) {
		var fnTriggerCatalogOperation = bSaveAs ? AppVariantUtils.triggerCatalogAssignment : AppVariantUtils.triggerCatalogUnAssignment;
		return fnTriggerCatalogOperation(oAppVariantDescriptor.getId(), oAppVariantDescriptor.getReference())
		.catch(function(oError) {
			var sMessageKey = bSaveAs ? "MSG_CATALOG_ASSIGNMENT_FAILED" : "MSG_DELETE_APP_VARIANT_FAILED";
			return AppVariantUtils.catchErrorDialog(oError, sMessageKey, oAppVariantDescriptor.getId());
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
			BusyIndicator.hide();
			var sMessageKey = bCreation ? "MSG_TILE_CREATION_FAILED" : "MSG_DELETE_APP_VARIANT_FAILED";
			if (!bCreation && oError.error === "locked") {
				sMessageKey = "MSG_CATALOGS_LOCKED";
			}
			return AppVariantUtils.catchErrorDialog(oError, sMessageKey, sAppVarId);
		});
	};

	/**
	 *
	 * @param {Object} oAppVariantDescriptor - Contains the app variant descriptor information
	 * @param {Boolean} bSaveAsTriggeredFromRtaToolbar - Boolean value which tells if 'Save As' is triggered from UI adaptation header bar
	 * @returns {Promise} Resolved promise
	 * @description Frames the success message depending on different platforms (S/4HANA Cloud Platform or S/4HANA on Premise) and shows it on the dialog.
	 * If a user chooses 'Save As' from the UI adaptation header bar, it closes the current running app and navigates to the SAP Fiori Launchpad.
	 * If a user chooses 'Save As' from app variant overview dialog, it opens the app variant overview dialog again to show the 'Just Created' app variant.
	 */
	AppVariantManager.prototype.showSuccessMessage = function(oAppVariantDescriptor, bSaveAsTriggeredFromRtaToolbar) {
		var oSuccessInfo = AppVariantUtils.buildSuccessInfo(oAppVariantDescriptor, bSaveAsTriggeredFromRtaToolbar);
		BusyIndicator.hide();
		return AppVariantUtils.showRelevantDialog(oSuccessInfo, true);
	};

	return AppVariantManager;
}, true);