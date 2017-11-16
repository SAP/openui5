/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/appVariant/AppVariantDialog",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/m/MessageToast",
	"sap/ui/fl/FlexControllerFactory",
	"sap/m/MessageBox",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/fl/transport/TransportSelection",
	"sap/ui/rta/appVariant/S4HanaCloudBackend",
	"sap/ui/core/BusyIndicator",
	"sap/ui/rta/Utils"
], function(AppVariantDialog, AppVariantUtils, MessageToast, FlexControllerFactory, MessageBox, RtaAppVariantFeature, TransportSelection, S4HanaCloudBackend, BusyIndicator, RtaUtils) {
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

	AppVariantManager.prototype.createDescriptor = function(oAppVariantData) {
		var sAppVariantId, aBackendOperations = [], oPropertyChange;

		sAppVariantId = AppVariantUtils.getId(oAppVariantData.idRunningApp);
		var oAppVariantDescriptor = {
			id: sAppVariantId,
			reference: oAppVariantData.idRunningApp
		};

		// creates an app variant descriptor
		aBackendOperations.push(AppVariantUtils.createDescriptorVariant(oAppVariantDescriptor));

		// create a inline change using a change type 'appdescr_app_setTitle'
		if (oAppVariantData.title) {
			oPropertyChange = AppVariantUtils.getInlinePropertyChange("title", oAppVariantData.title);
			aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "title"));
		}

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
		if (oAppVariantData.icon) {
			oPropertyChange = AppVariantUtils.getInlineChangeInputIcon(oAppVariantData.icon);
			aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "icon"));
		}

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

		if (oAppVariantData.title) {
			oPropertyChange = AppVariantUtils.getInlineChangesForInboundProperties(sCurrentRunningInboundId, sAppVariantId, "title", oAppVariantData.title);
			aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "inboundTitle"));
		}

		if (oAppVariantData.subTitle) {
			oPropertyChange = AppVariantUtils.getInlineChangesForInboundProperties(sCurrentRunningInboundId, sAppVariantId, "subTitle", oAppVariantData.subTitle);
			aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "inboundSubtitle"));
		}

		if (oAppVariantData.icon) {
			oPropertyChange = AppVariantUtils.getInlineChangesForInboundProperties(sCurrentRunningInboundId, sAppVariantId, "icon", oAppVariantData.icon);
			aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "inboundIcon"));
		}

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
			var oErrorInfo = this._buildErrorMessageText("MSG_CREATE_DESCRIPTOR_FAILED", oAppVariantDescriptor._id, oError);
			return this._showErrorMessage(oErrorInfo);
		}.bind(this));
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
			return this._openDialog(fnCreate, fnCancel);
		}.bind(this));
	};

	AppVariantManager.prototype._showErrorMessage = function(oErrorInfo, sAppVariantId) {
		var oTextResources = AppVariantUtils.getTextResources();
		var sTitle = oTextResources.getText("HEADER_SAVE_APP_VARIANT_FAILED");

		BusyIndicator.hide();

		var sCopyIdButtonText;
		var sCloseButtonText = oTextResources.getText("SAVE_APP_VARIANT_CLOSE_TEXT");

		var aActions = [];

		if (oErrorInfo.copyId) {
			sCopyIdButtonText = oTextResources.getText("SAVE_APP_VARIANT_COPY_ID_TEXT");
			aActions.push(sCopyIdButtonText);
		}

		aActions.push(sCloseButtonText);

		return new Promise(function(resolve, reject) {
			var fnCallback = function (sAction) {
				if (sAction === sCloseButtonText) {
					reject();
				} else if (sAction === sCopyIdButtonText) {
					AppVariantUtils.copyId(sAppVariantId);
					reject();
				}
			};

			MessageBox.error(oErrorInfo.text, {
				icon: MessageBox.Icon.ERROR,
				title: sTitle,
				onClose: fnCallback,
				actions: aActions,
				styleClass: RtaUtils.getRtaStyleClassName()
			});
		});
	};

	AppVariantManager.prototype._buildErrorMessageText = function(sMessageKey, sAppVariantId, oError, bCopyId) {
		var oTextResources = AppVariantUtils.getTextResources();

		var sErrorMessage = "";
		if (oError.messages && oError.messages.length) {
			if (oError.messages.length > 1) {
				oError.messages.forEach(function(oError) {
					sErrorMessage += oError.text + "\n";
				});
			} else {
				sErrorMessage += oError.messages[0].text;
			}
		} else if (oError.iamAppId) {
			//TODO: Need to remove this check later (20.10.2017)
			sErrorMessage += "IAM App Id: " + oError.iamAppId;
		} else {
			sErrorMessage += oError.stack || oError.message || oError.status || oError;
		}

		var sMessage = oTextResources.getText(sMessageKey) + "\n\n" +
						oTextResources.getText("MSG_APP_VARIANT_ID", sAppVariantId) + "\n" +
						oTextResources.getText("MSG_TECHNICAL_ERROR", sErrorMessage);
		return {
			text: sMessage,
			copyId: bCopyId
		};
	};

	AppVariantManager.prototype.saveAppVariantToLREP = function(oAppVariantDescriptor) {
		return oAppVariantDescriptor.submit()["catch"](function(oError) {
			var oErrorInfo = this._buildErrorMessageText("MSG_SAVE_APP_VARIANT_FAILED", oAppVariantDescriptor._id, oError);
			return this._showErrorMessage(oErrorInfo);
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
				var oErrorInfo = this._buildErrorMessageText("MSG_COPY_UNSAVED_CHANGES_FAILED", sAppVariantId, oError);
				return this._showErrorMessage(oErrorInfo);
			}.bind(this));
		} else {
			return Promise.resolve(true);
		}
	};

	AppVariantManager.prototype.triggerCatalogAssignment = function(oAppVariantDescriptor) {
		if (AppVariantUtils.isS4HanaCloud(oAppVariantDescriptor._oSettings)) {
			return AppVariantUtils.triggerCatalogAssignment(oAppVariantDescriptor._id, oAppVariantDescriptor._reference)["catch"](function(oError) {
				var oErrorInfo = this._buildErrorMessageText("MSG_CATALOG_ASSIGNMENT_FAILED", oAppVariantDescriptor._id, oError);
				return this._showErrorMessage(oErrorInfo);
			}.bind(this));
		} else {
			return Promise.resolve(true);
		}
	};

	AppVariantManager.prototype.notifyKeyUserWhenTileIsReady = function(sIamId, sAppVariantId) {
		var oS4HanaCloudBackend = new S4HanaCloudBackend();

		return oS4HanaCloudBackend.notifyFlpCustomizingIsReady(sIamId, function(sId) {
			var oTextResources = AppVariantUtils.getTextResources();
			var sMessage = oTextResources.getText("MSG_SAVE_APP_VARIANT_NEW_TILE_AVAILABLE");
			var sTitle = oTextResources.getText("SAVE_APP_VARIANT_NEW_TILE_AVAILABLE_TITLE");

			return new Promise(function(resolve) {
				MessageBox.show(sMessage, {
					icon: MessageBox.Icon.INFORMATION,
					title: sTitle,
					onClose: resolve,
					styleClass: RtaUtils.getRtaStyleClassName()
				});
			});
		})["catch"](function(oError) {
			var oErrorInfo = this._buildErrorMessageText("MSG_TILE_CREATION_FAILED", sAppVariantId, oError, true);
			return this._showErrorMessage(oErrorInfo, sAppVariantId);
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