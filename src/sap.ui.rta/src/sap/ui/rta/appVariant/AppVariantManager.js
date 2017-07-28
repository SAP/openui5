/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/appVariant/AppVariantDialog",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/m/MessageToast",
	"sap/ui/fl/FlexControllerFactory",
	"sap/m/MessageBox",
	"sap/ui/rta/Utils"
], function(AppVariantDialog, AppVariantUtils, MessageToast, FlexControllerFactory, MessageBox, RtaUtils) {
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

		// Inbounds handling
		var sCurrentRunningInboundId = AppVariantUtils.getCurrentInboundId(oAppVariantData.inbounds);

		if (sCurrentRunningInboundId === "customer.savedAsAppVariant") {
			oPropertyChange = AppVariantUtils.getInlineChangeCreateInbound(sCurrentRunningInboundId);
			aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "createInbound"));
		}

		oPropertyChange = AppVariantUtils.getInlineChangeForInboundPropertySaveAs(sCurrentRunningInboundId);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "inbound"));

		oPropertyChange = AppVariantUtils.getInlineChangeRemoveInbounds(sCurrentRunningInboundId);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "removeInbound"));

		oPropertyChange = AppVariantUtils.getInlineChangesForInboundProperties(sCurrentRunningInboundId, sAppVariantId, "title", oAppVariantData.title);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "inboundTitle"));

		oPropertyChange = AppVariantUtils.getInlineChangesForInboundProperties(sCurrentRunningInboundId, sAppVariantId, "subTitle", oAppVariantData.subTitle);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "inboundSubtitle"));

		oPropertyChange = AppVariantUtils.getInlineChangesForInboundProperties(sCurrentRunningInboundId, sAppVariantId, "icon", oAppVariantData.icon);
		aBackendOperations.push(AppVariantUtils.createInlineChange(oPropertyChange, "inboundIcon"));

		return Promise.all(aBackendOperations).then(function(oResponses){
			oAppVariantDescriptor = oResponses[0];
			aBackendOperations = [];
			oResponses.reduce(function(oPre, oCur){
				// add all inline changes to an appvariant descriptor
				aBackendOperations.push(oAppVariantDescriptor.addDescriptorInlineChange(oCur));
			});

			return Promise.all(aBackendOperations).then(function() {
				return oAppVariantDescriptor;
			});
		});
	};

	AppVariantManager.prototype.processSaveAsDialog = function(oDescriptor) {
		return new Promise(function(resolve, reject) {
			var fnCreate = function(oResult) {
				var mParameters = oResult.getParameters();
				var oAppVariantData = this._prepareAppVariantData(oDescriptor, mParameters);

				resolve(oAppVariantData);
			}.bind(this);

			var fnCancel = function(oResult) {
				resolve(false);
			};
			//open app variant creation dialog
			this._openDialog(fnCreate, fnCancel);
		}.bind(this));
	};

	AppVariantManager.prototype._showSaveSuccessMessage = function() {
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		var sMessage = oResourceBundle.getText("SAVE_APP_VARIANT_SUCCESS_MESSAGE");

		MessageToast.show(sMessage);
		return Promise.resolve(true);
	};

	// Pending changes get copied to app variant
	AppVariantManager.prototype._copyDirtyChangesToAppVariant = function(sReferenceForChange, oRootControl) {
		var oFlexController = FlexControllerFactory.createForControl(oRootControl);
		return oFlexController.saveAs(sReferenceForChange);
	};

	AppVariantManager.prototype.saveDescriptorAndFlexChangesToLREP = function(oAppVariantDescriptor, oRootControl, fnStopRta) {
		var fnShowCreateAppVariantError = function(vError) {
			var sErrorMessage = vError.stack || vError.message || vError.status || vError;
			var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			jQuery.sap.log.error("Failed to create an App Variant", sErrorMessage);
			var sMsg = oTextResources.getText("MSG_CREATE_APP_VARIANT_ERROR") + "\n"
					+ oTextResources.getText("MSG_CREATE_APP_VARIANT_ERROR_REASON", sErrorMessage);
			MessageBox.error(sMsg, {
				styleClass: RtaUtils.getRtaStyleClassName()
			});
		};

		var fnNavigateToFLPHomepage = function() {
			var oApplication = sap.ushell.services.AppConfiguration.getCurrentApplication();
			var oComponentInstance = oApplication.componentHandle.getInstance();

			if (oComponentInstance) {
				var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
				if (oCrossAppNav.toExternal){
					return oCrossAppNav.toExternal({target: {shellHash: "#"}}, oComponentInstance);
				}
			}

			return false;
		};
		return oAppVariantDescriptor.submit().then(function(oResult) {
			if (oResult.status === "success") {
				return this._copyDirtyChangesToAppVariant(oAppVariantDescriptor._id, oRootControl).then(function() {
					return this._showSaveSuccessMessage().then(fnStopRta).then(fnNavigateToFLPHomepage);
				}.bind(this));
			} else {
				return false;
			}
		}.bind(this))['catch'](fnShowCreateAppVariantError);
	};

	return AppVariantManager;
}, true);