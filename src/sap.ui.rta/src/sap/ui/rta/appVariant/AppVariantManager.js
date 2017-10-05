/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/appVariant/AppVariantDialog",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/m/MessageToast",
	"sap/ui/fl/FlexControllerFactory",
	"sap/m/MessageBox",
	"sap/ui/rta/Utils",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/fl/transport/TransportSelection",
	"sap/ui/rta/appVariant/S4HanaCloudBackend"
], function(AppVariantDialog, AppVariantUtils, MessageToast, FlexControllerFactory, MessageBox, RtaUtils, RtaAppVariantFeature, TransportSelection, S4HanaCloudBackend) {
	"use strict";

	var AppVariantManager = function() {};

	AppVariantManager.prototype._openDialog = function(fnCreate, fnCancel) {
		var oDialog = new AppVariantDialog("appVariantDialog");
		oDialog.attachCreate(fnCreate);
		oDialog.attachCancel(fnCancel);

		oDialog.open();

		return oDialog;
	};

	AppVariantManager.prototype._prepareAppVariantData = function(oDescriptor, mParameters) {
		return {
			idBaseApp: oDescriptor["sap.ui5"].componentName,
			idRunningApp: oDescriptor["sap.app"].id,
			title: mParameters.title,
			subTitle: mParameters.subTitle,
			description: mParameters.description,
			icon: mParameters.icon,
			inbounds: oDescriptor["sap.app"].crossNavigation.inbounds
		};
	};

	AppVariantManager.prototype.createDescriptor = function(oAppVariantData) {
		var sAppVariantId, aBackendOperations = [], oPropertyChange;

		sAppVariantId = AppVariantUtils.getId(oAppVariantData.idBaseApp);
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
		if (oAppVariantData.subTitle) {
			oPropertyChange = AppVariantUtils.getInlinePropertyChange("subtitle", oAppVariantData.subTitle);
			aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "subTitle"));
		}

		// create a inline change using a change type 'create_app_setDescription'
		if (oAppVariantData.description) {
			oPropertyChange = AppVariantUtils.getInlinePropertyChange("description", oAppVariantData.description);
			aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "description"));
		}

		// create a inline change using a change type 'appdescr_ui_setIcon'
		oPropertyChange = AppVariantUtils.getInlineChangeInputIcon(oAppVariantData.icon);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "icon"));

		/*********************************************************************************************************************************************
		***********************************************************Inbounds handling******************************************************************
		*********************************************************************************************************************************************/
		var oInboundInfo = AppVariantUtils.getInboundInfo(oAppVariantData.inbounds);
		var sCurrentRunningInboundId = oInboundInfo.currentRunningInbound;
		var bAddNewInboundRequired = oInboundInfo.addNewInboundRequired;

		if (sCurrentRunningInboundId === "customer.savedAsAppVariant" && bAddNewInboundRequired) {
			oPropertyChange = AppVariantUtils.getInlineChangeCreateInbound(sCurrentRunningInboundId);
			aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "createInbound"));
		}

		oPropertyChange = AppVariantUtils.getInlineChangeForInboundPropertySaveAs(sCurrentRunningInboundId);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "inbound"));

		oPropertyChange = AppVariantUtils.getInlineChangeRemoveInbounds(sCurrentRunningInboundId);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "removeInbound"));

		oPropertyChange = AppVariantUtils.getInlineChangesForInboundProperties(sCurrentRunningInboundId, sAppVariantId, "title", oAppVariantData.title);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "inboundTitle"));

		if (oAppVariantData.subTitle) {
			oPropertyChange = AppVariantUtils.getInlineChangesForInboundProperties(sCurrentRunningInboundId, sAppVariantId, "subTitle", oAppVariantData.subTitle);
			aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "inboundSubtitle"));
		}

		oPropertyChange = AppVariantUtils.getInlineChangesForInboundProperties(sCurrentRunningInboundId, sAppVariantId, "icon", oAppVariantData.icon);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "inboundIcon"));

		var fnOpenTransportDialog = function(oTransportInput) {
			var oTransportSelection = new TransportSelection();
			return oTransportSelection.openTransportSelection(oTransportInput, this, RtaUtils.getRtaStyleClassName());
		};

		return Promise.all(aBackendOperations).then(function(aResponses){
			oAppVariantDescriptor = aResponses.shift();
			aBackendOperations = [];

			aResponses.forEach(function(oInlineChange) {
				aBackendOperations.push(oAppVariantDescriptor.addDescriptorInlineChange(oInlineChange));
			});

			return Promise.all(aBackendOperations);
		}).then(function() {
			var sNamespace = oAppVariantDescriptor._getMap().namespace;
			var oTransportInput = AppVariantUtils.getTransportInput("",sNamespace, "manifest", "appdescr_variant");
			return fnOpenTransportDialog.call(this, oTransportInput);
		}.bind(this)).then(function(oTransportInfo) {
			return this._onTransportInDialogSelected(oAppVariantDescriptor, oTransportInfo);
		}.bind(this))["catch"](function(oError) {
			return this._showTechnicalError(MessageBox.Icon.ERROR, "HEADER_CREATE_DESCRIPTOR_FAILED", "MSG_CREATE_DESCRIPTOR_FAILED", oError);
		}.bind(this));
	};

	AppVariantManager.prototype._onTransportInDialogSelected = function(oAppVariantDescriptor, oTransportInfo){
		if (oTransportInfo){

			if (oTransportInfo.transport && oTransportInfo.packageName !== "$TMP") {

				var aPromises = [];
				if (oTransportInfo.packageName){
					//Only set package for new appdescr_variant
					aPromises.push(oAppVariantDescriptor.setPackage(oTransportInfo.packageName));
				}

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

	AppVariantManager.prototype.processSaveAsDialog = function(oDescriptor) {
		return new Promise(function(resolve, reject) {
			var fnCreate = function(oResult) {
				var mParameters = oResult.getParameters();
				var oAppVariantData = this._prepareAppVariantData(oDescriptor, mParameters);

				resolve(oAppVariantData);
			}.bind(this);

			var fnCancel = function(oResult) {
				reject(oResult);
			};
			//open app variant creation dialog
			this._openDialog(fnCreate, fnCancel);
		}.bind(this));
	};

	AppVariantManager.prototype._showTechnicalError = function(oMessageType, sTitleKey, sMessageKey, vError) {
		var oTextResources = AppVariantUtils.getTextResources();
		var sErrorMessage = "";
		if (vError.messages && vError.messages.length) {
			if (vError.messages.length > 1) {
				vError.messages.forEach(function(oError) {
					sErrorMessage += oError.text + "\n";
				});
			} else {
				sErrorMessage += vError.messages[0].text;
			}
		} else {
			sErrorMessage += vError.stack || vError.message || vError.status || vError;
		}

		jQuery.sap.log.error("Failed to save an App Variant", sErrorMessage);

		var sTitle = oTextResources.getText(sTitleKey);
		var sMessage = oTextResources.getText(sMessageKey, sErrorMessage);

		return new Promise(function(resolve, reject) {
			MessageBox.error(sMessage, {
				icon: oMessageType,
				title: sTitle,
				onClose: reject,
				styleClass: RtaUtils.getRtaStyleClassName()
			});
		});
	};

	AppVariantManager.prototype.saveAppVariantToLREP = function(oAppVariantDescriptor) {
		return oAppVariantDescriptor.submit()["catch"](function(oError) {
			return this._showTechnicalError(MessageBox.Icon.ERROR, "HEADER_SAVE_APP_VARIANT_FAILED", "MSG_SAVE_APP_VARIANT_FAILED", oError);
		}.bind(this));
	};

	// Unsaved changes get copied to app variant
	AppVariantManager.prototype._copyDirtyChangesToAppVariant = function(sReferenceForChange, oRootControlRunningApp) {
		var oFlexController = FlexControllerFactory.createForControl(oRootControlRunningApp);
		return oFlexController.saveAs(sReferenceForChange);
	};

	AppVariantManager.prototype.copyUnsavedChangesToLREP = function(sAppVariantId, oRootControlRunningApp, bCopyUnsavedChanges) {
		if (bCopyUnsavedChanges) {
			return this._copyDirtyChangesToAppVariant(sAppVariantId, oRootControlRunningApp)["catch"](function(oError) {
				return this._showTechnicalError(MessageBox.Icon.ERROR, "HEADER_COPY_UNSAVED_CHANGES_FAILED", "MSG_COPY_UNSAVED_CHANGES_FAILED", oError);
			}.bind(this));
		} else {
			return Promise.resolve(true);
		}
	};

	AppVariantManager.prototype.triggerCatalogAssignment = function(oAppVariantDescriptor) {
		if (AppVariantUtils.isS4HanaCloud(oAppVariantDescriptor._oSettings)) {
			return AppVariantUtils.triggerCatalogAssignment(oAppVariantDescriptor._id, oAppVariantDescriptor._reference)["catch"](function(oError) {
				return this._showTechnicalError(MessageBox.Icon.ERROR, "HEADER_CATALOG_ASSIGNMENT_FAILED", "MSG_CATALOG_ASSIGNMENT_FAILED", oError);
			}.bind(this));
		} else {
			return Promise.resolve(true);
		}
	};

	AppVariantManager.prototype.notifyKeyUserWhenTileIsReady = function(sIamId) {
		var oS4HanaCloudBackend = new S4HanaCloudBackend();

		return oS4HanaCloudBackend.notifyFlpCustomizingIsReady(sIamId, function(sId) {
			var oTextResources = AppVariantUtils.getTextResources();
			var sMessage = oTextResources.getText("SAVE_APP_VARIANT_NEW_TILE_AVAILABLE");
			var sTitle = oTextResources.getText("SAVE_APP_VARIANT_NEW_TILE_AVAILABLE_TITLE");
			MessageBox.show(sMessage, {
				icon: MessageBox.Icon.INFORMATION,
				title: sTitle,
				styleClass: RtaUtils.getRtaStyleClassName()
			});
		})["catch"](function(oError) {
			return this._showTechnicalError(MessageBox.Icon.ERROR, "HEADER_TILE_CREATION_FAILED", "MSG_TILE_CREATION_FAILED", oError);
		}.bind(this));
	};

	AppVariantManager.prototype._buildSuccessMessageText = function(oAppVariantDescriptor, bCloseRunningApp) {
		var oTextResources = AppVariantUtils.getTextResources();
		var bCopyId = false;
		var sMessage = oTextResources.getText("SAVE_APP_VARIANT_SUCCESS_MESSAGE") + "\n\n";

		if (AppVariantUtils.isS4HanaCloud(oAppVariantDescriptor._oSettings)) {
			if (bCloseRunningApp) {
				sMessage += oTextResources.getText("SAVE_APP_VARIANT_SUCCESS_S4HANA_CLOUD_MESSAGE");
			} else {
				sMessage += oTextResources.getText("SAVE_APP_VARIANT_SUCCESS_S4HANA_CLOUD_MESSAGE_OVERVIEW_LIST");
			}
		} else if (bCloseRunningApp) {
			sMessage += oTextResources.getText("SAVE_APP_VARIANT_SUCCESS_S4HANA_ON_PREMISE_MESSAGE", oAppVariantDescriptor._id);
			bCopyId = true;
		} else {
			sMessage += oTextResources.getText("SAVE_APP_VARIANT_SUCCESS_S4HANA_ON_PREMISE_MESSAGE_OVERVIEW_LIST", oAppVariantDescriptor._id);
			bCopyId = true;
		}

		return {
			text: sMessage,
			copyId : bCopyId
		};
	};

	AppVariantManager.prototype._showSaveSuccessMessage = function(oSuccessInfo, sAppVariantId) {
		var oTextResources = AppVariantUtils.getTextResources();
		var sTitle = oTextResources.getText("SAVE_APP_VARIANT_SUCCESS_MESSAGE_TITLE");

		var sCopyIdButtonText;
		var sOkButtonText = oTextResources.getText("SAVE_APP_VARIANT_OK_TEXT");

		var aActions = [];

		if (oSuccessInfo.copyId) {
			sCopyIdButtonText = oTextResources.getText("SAVE_APP_VARIANT_COPY_ID_TEXT");
			aActions.push(sCopyIdButtonText);
		}

		aActions.push(sOkButtonText);

		return new Promise(function(resolve) {
			var fnCallback = function (sAction) {
				if (sAction === sOkButtonText) {
					resolve();
				} else if (sAction === sCopyIdButtonText) {
					AppVariantUtils.copyId(sAppVariantId);
					resolve();
				}
			};

			MessageBox.show(oSuccessInfo.text, {
				icon: MessageBox.Icon.INFORMATION,
				onClose : fnCallback,
				title: sTitle,
				actions: aActions,
				styleClass: RtaUtils.getRtaStyleClassName()
			});
		});
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

	AppVariantManager.prototype.showSuccessMessageAndTriggerActionFlow = function(oAppVariantDescriptor, bCloseRunningApp, oRootControlRunningApp) {
		var oSuccessInfo = this._buildSuccessMessageText(oAppVariantDescriptor, bCloseRunningApp);
		return this._showSaveSuccessMessage(oSuccessInfo, oAppVariantDescriptor._id).then(function() {
			if (bCloseRunningApp) {
				return this._navigateToFLPHomepage();
			} else {
				return RtaAppVariantFeature.onGetOverview(oRootControlRunningApp);
			}
		}.bind(this));
	};

	return AppVariantManager;
}, true);