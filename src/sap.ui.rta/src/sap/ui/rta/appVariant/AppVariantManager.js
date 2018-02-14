/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/rta/appVariant/AppVariantDialog",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/fl/FlexControllerFactory",
	"sap/m/MessageBox",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/fl/transport/TransportSelection",
	"sap/ui/rta/appVariant/S4HanaCloudBackend",
	"sap/ui/rta/Utils",
	"sap/ui/core/BusyIndicator"
], function(
	ManagedObject,
	AppVariantDialog,
	AppVariantUtils,
	FlexControllerFactory,
	MessageBox,
	RtaAppVariantFeature,
	TransportSelection,
	S4HanaCloudBackend,
	RtaUtils,
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
				"rootControl" : {
					type : "sap.ui.core.Control"
				},
				"commandSerializer" : {
					type : "object" // has to be of type sap.ui.rta.command.LrepSerializer
				}
			}
		}
	});

	/**
	 * Opens the 'Save As' dialog
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
	 * Returns the info required to create an app variant descriptor
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
	 * @param {Object} oAppVariantData
	 * @returns {Promise[]} returns all the descriptor inline changes
	 * @description Creates all the descriptor inline changes for different change types
	 */
	AppVariantManager.prototype.createAllInlineChanges = function(oAppVariantData) {
		var sAppVariantId, aBackendOperations = [], oPropertyChange;

		sAppVariantId = AppVariantUtils.getId(oAppVariantData.idRunningApp);

		var oAppVariantDescriptor = {
			id: sAppVariantId,
			reference: oAppVariantData.idRunningApp
		};

		// creates an app variant descriptor
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

		/*********************************************************************************************************************************************
		***********************************************************Inbounds handling******************************************************************
		*********************************************************************************************************************************************/
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
	 * Populates the app variant descriptor's transport property with a local object or with the provided transport id
	 */
	AppVariantManager.prototype._onTransportInDialogSelected = function(oAppVariantDescriptor, oTransportInfo){
		if (oTransportInfo){

			if (oTransportInfo.transport && oTransportInfo.packageName !== "$TMP") {

				var aPromises = [];

				if (oTransportInfo.transport) {
					aPromises.push(oAppVariantDescriptor.setTransportRequest(oTransportInfo.transport));
				}

				if (aPromises.length) {
					return Promise.all(aPromises).then(function() {
						return Promise.resolve(oAppVariantDescriptor);
					});
				}
			}

			return Promise.resolve(oAppVariantDescriptor);
		}

		return Promise.resolve(false);
	};

	/**
	 *
	 * @param {Object} oAppVariantData
	 * @returns {Promise} Returns a promise
	 * @description Creates the descriptor variant from the descriptor inline changes and takes the transport id from the transport dialog
	 */
	AppVariantManager.prototype.createDescriptor = function(oAppVariantData) {
		var aInlineChanges = this.createAllInlineChanges(oAppVariantData);

		var fnOpenTransportDialog = function(oTransportInput) {
			var oTransportSelection = new TransportSelection();
			return oTransportSelection.openTransportSelection(oTransportInput, this, RtaUtils.getRtaStyleClassName());
		};

		var oAppVariantDescriptor;
		return Promise.all(aInlineChanges).then(function(aResponses){
			oAppVariantDescriptor = aResponses.shift();
			aInlineChanges = [];

			aResponses.forEach(function(oInlineChange) {
				aInlineChanges.push(oAppVariantDescriptor.addDescriptorInlineChange(oInlineChange));
			});

			return Promise.all(aInlineChanges);
		}).then(function() {
			var sNamespace = oAppVariantDescriptor.getNamespace();
			var oTransportInput = AppVariantUtils.getTransportInput("",sNamespace, "manifest", "appdescr_variant");
			return fnOpenTransportDialog.call(this, oTransportInput);
		}.bind(this)).then(function(oTransportInfo) {
			return this._onTransportInDialogSelected(oAppVariantDescriptor, oTransportInfo);
		}.bind(this))["catch"](function(oError) {
			var oErrorInfo = AppVariantUtils.buildErrorInfo("MSG_CREATE_DESCRIPTOR_FAILED", oError, oAppVariantDescriptor.getId());
			BusyIndicator.hide();
			return AppVariantUtils.showRelevantDialog(oErrorInfo, false);
		});
	};

	/**
	 *
	 * @param {Object} oDescriptor
	 * @param {Boolean} bSaveAsTriggeredFromRtaToolbar
	 * @returns {Object}
	 * @description Consolidates the input parameters from the 'Save As' dialog as an object
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
			//open app variant creation dialog
			return this._openDialog(fnCreate, fnCancel);
		}.bind(this));
	};

	/**
	 *
	 * @param {Object} oAppVariantDescriptor
	 * @returns {Promise} returns the server response
	 * @description Persists the new created app variant into the layered repository
	 */
	AppVariantManager.prototype.saveAppVariantToLREP = function(oAppVariantDescriptor) {
		return oAppVariantDescriptor.submit()["catch"](function(oError) {
			var oErrorInfo = AppVariantUtils.buildErrorInfo("MSG_SAVE_APP_VARIANT_FAILED", oError, oAppVariantDescriptor.getId());
			BusyIndicator.hide();
			return AppVariantUtils.showRelevantDialog(oErrorInfo, false);
		});
	};

	/**
	 * Dirty changes get taken over by an app variant
	 */
	AppVariantManager.prototype._takeOverDirtyChangesByAppVariant = function(sReferenceAppIdForChanges) {
		return this.getCommandSerializer().saveAsCommands(sReferenceAppIdForChanges);
	};

	/**
	 *
	 * @param {String} sAppVariantId
	 * @param {Boolean} bCopyUnsavedChanges
	 * @returns {Promise} returns the server response
	 * @description Books the unsaved changes for the new app variant and persist these changes in the layered repository
	 */
	AppVariantManager.prototype.copyUnsavedChangesToLREP = function(sAppVariantId, bCopyUnsavedChanges) {
		var oCommandStack = this.getCommandSerializer().getCommandStack();
		if (bCopyUnsavedChanges && oCommandStack.getAllExecutedCommands().length) {
			return this._takeOverDirtyChangesByAppVariant(sAppVariantId)["catch"](function(oError) {
				var oErrorInfo = AppVariantUtils.buildErrorInfo("MSG_COPY_UNSAVED_CHANGES_FAILED", oError, sAppVariantId);
				BusyIndicator.hide();
				return AppVariantUtils.showRelevantDialog(oErrorInfo, false);
			});
		}

		return Promise.resolve();
	};

	/**
	 *
	 * @param {Object} oAppVariantDescriptor
	 * @returns {Promise} returns the server response
	 * @description Once the app variant is created, the app variant gets assigned to the same catalog(s) as of an original app
	 */
	AppVariantManager.prototype.triggerCatalogAssignment = function(oAppVariantDescriptor) {
		if (AppVariantUtils.isS4HanaCloud(oAppVariantDescriptor.getSettings())) {
			return AppVariantUtils.triggerCatalogAssignment(oAppVariantDescriptor.getId(), oAppVariantDescriptor.getReference())["catch"](function(oError) {
				var oErrorInfo = AppVariantUtils.buildErrorInfo("MSG_CATALOG_ASSIGNMENT_FAILED", oError, oAppVariantDescriptor.getId());
				BusyIndicator.hide();
				return AppVariantUtils.showRelevantDialog(oErrorInfo, false);
			});
		}

		return Promise.resolve();
	};

	/**
	 *
	 * @param {String} sIamId
	 * @param {String} sAppVariantId
	 * @description When the app variant creation and catalog assignment are executed successfully, this asynchronous process gets triggered.
	 * It talks to the server every 2.5 secs and check whether the new FLP tile which represents the new created app variant is available
	 */
	AppVariantManager.prototype.notifyKeyUserWhenTileIsReady = function(sIamId, sAppVariantId) {
		var oS4HanaCloudBackend = new S4HanaCloudBackend();

		return oS4HanaCloudBackend.notifyFlpCustomizingIsReady(sIamId, function(sId) {
			var sMessage = AppVariantUtils.getText("MSG_SAVE_APP_VARIANT_NEW_TILE_AVAILABLE");
			var sTitle = AppVariantUtils.getText("SAVE_APP_VARIANT_NEW_TILE_AVAILABLE_TITLE");

			return new Promise(function(resolve) {
				MessageBox.show(sMessage, {
					icon: MessageBox.Icon.INFORMATION,
					title: sTitle,
					onClose: resolve,
					styleClass: RtaUtils.getRtaStyleClassName()
				});
			});
		})["catch"](function(oError) {
			var oErrorInfo = AppVariantUtils.buildErrorInfo("MSG_TILE_CREATION_FAILED", oError, sAppVariantId);
			oErrorInfo.copyId = true;
			BusyIndicator.hide();
			return AppVariantUtils.showRelevantDialog(oErrorInfo, false);
		});
	};

	/**
	 * Builds the success message text based on different platforms (i.e. S/4Hana Cloud Platfrom and S/4Hana on Premise)
	 */
	AppVariantManager.prototype._buildSuccessInfo = function(oAppVariantDescriptor, bSaveAsTriggeredFromRtaToolbar) {
		var bCopyId = false;
		var sMessage = AppVariantUtils.getText("SAVE_APP_VARIANT_SUCCESS_MESSAGE") + "\n\n";

		if (AppVariantUtils.isS4HanaCloud(oAppVariantDescriptor.getSettings())) {
			if (bSaveAsTriggeredFromRtaToolbar) {
				sMessage += AppVariantUtils.getText("SAVE_APP_VARIANT_SUCCESS_S4HANA_CLOUD_MESSAGE");
			} else {
				sMessage += AppVariantUtils.getText("SAVE_APP_VARIANT_SUCCESS_S4HANA_CLOUD_MESSAGE_OVERVIEW_LIST");
			}
		} else if (bSaveAsTriggeredFromRtaToolbar) {
			sMessage += AppVariantUtils.getText("SAVE_APP_VARIANT_SUCCESS_S4HANA_ON_PREMISE_MESSAGE", oAppVariantDescriptor.getId());
			bCopyId = true;
		} else {
			sMessage += AppVariantUtils.getText("SAVE_APP_VARIANT_SUCCESS_S4HANA_ON_PREMISE_MESSAGE_OVERVIEW_LIST", oAppVariantDescriptor.getId());
			bCopyId = true;
		}

		return {
			text: sMessage,
			appVariantId: oAppVariantDescriptor.getId(),
			copyId : bCopyId
		};
	};

	/**
	 * Navigates to the Fiorilaunchpad
	 */
	AppVariantManager.prototype._navigateToFLPHomepage = function() {
		var oApplication = sap.ushell.services.AppConfiguration.getCurrentApplication();
		var oComponentInstance = oApplication.componentHandle.getInstance();

		if (oComponentInstance) {
			var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
			if (oCrossAppNav.toExternal){
				oCrossAppNav.toExternal({target: {shellHash: "#"}}, oComponentInstance);
				return Promise.resolve();
			}
		}

		return Promise.resolve();
	};

	/**
	 *
	 * @param {Object} oAppVariantDescriptor
	 * @param {Boolean} bSaveAsTriggeredFromRtaToolbar
	 * @returns {Promise}
	 * @description Frames the success message depending on different platforms (S/4Hana Cloud Platform or S/4Hana on Premise) and show it on the dialog
	 * If a user presses 'Save As' from RTA toolbar, it closes the current running app and navigates to the Fiorilaunchpad
	 * If a user presses 'Save As' from an app variant overview dialog, it opens the app variant overview dialog again to show the 'Just Created' App variant
	 */
	AppVariantManager.prototype.showSuccessMessageAndTriggerActionFlow = function(oAppVariantDescriptor, bSaveAsTriggeredFromRtaToolbar) {
		var oSuccessInfo = this._buildSuccessInfo(oAppVariantDescriptor, bSaveAsTriggeredFromRtaToolbar);
		BusyIndicator.hide();
		return AppVariantUtils.showRelevantDialog(oSuccessInfo, true).then(function() {
			return bSaveAsTriggeredFromRtaToolbar ? this._navigateToFLPHomepage() : RtaAppVariantFeature.onGetOverview(true);
		}.bind(this));
	};

	return AppVariantManager;
}, true);