/*!
 * ${copyright}
 */
sap.ui.define([
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

	var AppVariantManager = function() {};

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

	AppVariantManager.prototype.processSaveAsDialog = function(oDescriptor, oRootControlRunningApp, bSaveAsTriggeredFromRtaToolbar) {
		return new Promise(function(resolve) {
			var fnCreate = function(oResult) {
				var mParameters = oResult.getParameters();
				var oAppVariantData = this._prepareAppVariantData(oDescriptor, mParameters);

				resolve(oAppVariantData);
			}.bind(this);

			var fnCancel = function() {
				if (!bSaveAsTriggeredFromRtaToolbar) {
					return RtaAppVariantFeature.onGetOverview(oRootControlRunningApp);
				}
			};
			//open app variant creation dialog
			return this._openDialog(fnCreate, fnCancel);
		}.bind(this));
	};

	AppVariantManager.prototype.saveAppVariantToLREP = function(oAppVariantDescriptor) {
		return oAppVariantDescriptor.submit()["catch"](function(oError) {
			var oErrorInfo = AppVariantUtils.buildErrorInfo("MSG_SAVE_APP_VARIANT_FAILED", oError, oAppVariantDescriptor.getId());
			BusyIndicator.hide();
			return AppVariantUtils.showRelevantDialog(oErrorInfo, false);
		});
	};

	// Unsaved changes get copied to app variant
	AppVariantManager.prototype._copyDirtyChangesToAppVariant = function(sReferenceForChange, oRootControlRunningApp) {
		var oFlexController = FlexControllerFactory.createForControl(oRootControlRunningApp);
		return oFlexController.saveAs(sReferenceForChange);
	};

	AppVariantManager.prototype.copyUnsavedChangesToLREP = function(sAppVariantId, oRootControlRunningApp, bCopyUnsavedChanges) {
		if (bCopyUnsavedChanges) {
			return this._copyDirtyChangesToAppVariant(sAppVariantId, oRootControlRunningApp)["catch"](function(oError) {
				var oErrorInfo = AppVariantUtils.buildErrorInfo("MSG_COPY_UNSAVED_CHANGES_FAILED", oError, sAppVariantId);
				BusyIndicator.hide();
				return AppVariantUtils.showRelevantDialog(oErrorInfo, false);
			});
		} else {
			return Promise.resolve(true);
		}
	};

	AppVariantManager.prototype.triggerCatalogAssignment = function(oAppVariantDescriptor) {
		if (AppVariantUtils.isS4HanaCloud(oAppVariantDescriptor.getSettings())) {
			return AppVariantUtils.triggerCatalogAssignment(oAppVariantDescriptor.getId(), oAppVariantDescriptor.getReference())["catch"](function(oError) {
				var oErrorInfo = AppVariantUtils.buildErrorInfo("MSG_CATALOG_ASSIGNMENT_FAILED", oError, oAppVariantDescriptor.getId());
				BusyIndicator.hide();
				return AppVariantUtils.showRelevantDialog(oErrorInfo, false);
			});
		} else {
			return Promise.resolve(true);
		}
	};

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

	AppVariantManager.prototype._navigateToFLPHomepage = function() {
		var oApplication = sap.ushell.services.AppConfiguration.getCurrentApplication();
		var oComponentInstance = oApplication.componentHandle.getInstance();

		if (oComponentInstance) {
			var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
			if (oCrossAppNav.toExternal){
				oCrossAppNav.toExternal({target: {shellHash: "#"}}, oComponentInstance);
				return Promise.resolve(true);
			}
		}

		return Promise.resolve(false);
	};

	AppVariantManager.prototype.showSuccessMessageAndTriggerActionFlow = function(oAppVariantDescriptor, bSaveAsTriggeredFromRtaToolbar, oRootControlRunningApp) {
		var oSuccessInfo = this._buildSuccessInfo(oAppVariantDescriptor, bSaveAsTriggeredFromRtaToolbar);
		BusyIndicator.hide();
		return AppVariantUtils.showRelevantDialog(oSuccessInfo, true).then(function() {
			if (bSaveAsTriggeredFromRtaToolbar) {
				return this._navigateToFLPHomepage();
			} else {
				return RtaAppVariantFeature.onGetOverview(oRootControlRunningApp);
			}
		}.bind(this));
	};

	return AppVariantManager;
}, true);