/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/rta/appVariant/manageApps/webapp/model/models",
	"sap/ui/rta/appVariant/Utils",
	"sap/m/MessageBox",
	"sap/ui/rta/Utils",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/core/BusyIndicator",
	"sap/ui/rta/appVariant/AppVariantUtils"
], function(
	jQuery,
	Controller,
	Model,
	AppVariantOverviewUtils,
	MessageBox,
	RtaUtils,
	RtaAppVariantFeature,
	RuntimeAuthoring,
	BusyIndicator,
	AppVariantUtils
) {
	"use strict";

	var _sIdRunningApp, _bKeyUser, sModulePath, oI18n;
	return Controller.extend("sap.ui.rta.appVariant.manageApps.webapp.controller.ManageApps", {
		onInit: function() {
			_sIdRunningApp = this.getOwnerComponent().getIdRunningApp();
			_bKeyUser = this.getOwnerComponent().getIsOverviewForKeyUser();

			sModulePath = jQuery.sap.getModulePath( "sap.ui.rta.appVariant.manageApps.webapp" );
			oI18n = jQuery.sap.resources({
				url : sModulePath + "/i18n/i18n.properties"
			});

			BusyIndicator.show();
			return AppVariantOverviewUtils.getAppVariantOverview(_sIdRunningApp, _bKeyUser).then(function(aAppVariantOverviewAttributes) {
				BusyIndicator.hide();
				if (aAppVariantOverviewAttributes.length) {
					return this._arrangeOverviewDataAndBindToModel(aAppVariantOverviewAttributes).then(function(aAppVariantOverviewAttributes) {
						return this._highlightNewCreatedAppVariant(aAppVariantOverviewAttributes);
					}.bind(this));
				} else {
					AppVariantUtils.publishEventBus();
					return this._showMessageWhenNoAppVariantsExist();
				}
			}.bind(this))["catch"](function(oError) {
				AppVariantUtils.publishEventBus();
				var oErrorInfo = AppVariantUtils.buildErrorInfo("MSG_MANAGE_APPS_FAILED", oError);
				oErrorInfo.overviewDialog = true;
				BusyIndicator.hide();
				return AppVariantUtils.showRelevantDialog(oErrorInfo, false);
			});
		},
		_showMessageWhenNoAppVariantsExist: function() {
			var sMessage = oI18n.getText("MSG_APP_VARIANT_OVERVIEW_SAP_DEVELOPER");
			var sTitle = oI18n.getText("TITLE_APP_VARIANT_OVERVIEW_SAP_DEVELOPER");
			return new Promise(function(resolve) {
				MessageBox.show(sMessage, {
					icon: MessageBox.Icon.INFORMATION,
					title : sTitle,
					onClose : resolve,
					styleClass: RtaUtils.getRtaStyleClassName()
				});
			});
		},
		_highlightNewCreatedAppVariant: function(aAppVariantOverviewAttributes) {
			var oTable = this.byId("Table1");

			aAppVariantOverviewAttributes.forEach(function(oAppVariantDescriptor, index) {
				if (oAppVariantDescriptor.currentStatus) {
					if (oTable.getItems().length >= index) {
						oTable.getItems()[index].focus();
					}
				}
			});

			return Promise.resolve();
		},
		_arrangeOverviewDataAndBindToModel: function(aAppVariantOverviewAttributes) {
			var aAdaptingAppAttributes = aAppVariantOverviewAttributes.filter(function(oAppVariantProperty){
				return oAppVariantProperty.appId === _sIdRunningApp;
			});

			var oAdaptingAppAttributes = aAdaptingAppAttributes[0];
			if (oAdaptingAppAttributes) {
				oAdaptingAppAttributes.currentStatus = oI18n.getText("MAA_CURRENTLY_ADAPTING");
			}

			aAppVariantOverviewAttributes = aAppVariantOverviewAttributes.filter(function(oAppVariantProperty) {
				return oAppVariantProperty.appId !== _sIdRunningApp;
			});

			aAppVariantOverviewAttributes.unshift(oAdaptingAppAttributes);

			var aReferenceAppAttributes = aAppVariantOverviewAttributes.filter(function(oAppVariantProperty){
				return oAppVariantProperty.isOriginal;
			});

			var oReferenceAppAttributes = aReferenceAppAttributes[0];

			aAppVariantOverviewAttributes = aAppVariantOverviewAttributes.filter(function(oAppVariantProperty) {
				return !oAppVariantProperty.isOriginal;
			});

			aAppVariantOverviewAttributes.unshift(oReferenceAppAttributes);

			// Bind the app variant overview to JSON model

			var oModelData = {
				appVariants: aAppVariantOverviewAttributes
			};

			var oModel = Model.createModel(oModelData);
			this.getView().setModel(oModel);

			return Promise.resolve(aAppVariantOverviewAttributes);
		},
		formatRowHighlight: function(sValue) {
			// Your logic for rowHighlight goes here
			if (sValue === oI18n.getText("MAA_CURRENTLY_ADAPTING")) {
				return "Success";
			} else if (sValue === oI18n.getText("MAA_NEW_APP_VARIANT")) {
				return "Information";
			}

			return "None";
		},
		getModelProperty : function(sModelPropName, sBindingContext) {
			return this.getView().getModel().getProperty(sModelPropName, sBindingContext);
		},
		handleUiAdaptation: function(oEvent) {
			var oNavigationService = sap.ushell.Container.getService( "CrossApplicationNavigation" );

			var sSemanticObject = this.getModelProperty("semanticObject", oEvent.getSource().getBindingContext());
			var sAction = this.getModelProperty("action", oEvent.getSource().getBindingContext());
			var oParams = this.getModelProperty("params", oEvent.getSource().getBindingContext());

			var oNavigationParams;
			if (sSemanticObject && sAction && oParams) {
				oNavigationParams = {
					target: {
						semanticObject : sSemanticObject,
						action : sAction
					},
					params: oParams
				};

				RuntimeAuthoring.enableRestart( "CUSTOMER" );

				oNavigationService.toExternal(oNavigationParams);

				AppVariantUtils.publishEventBus();
				return true;
			} else {
				return false;
			}
		},
		saveAsAppVariant: function(oEvent) {
			AppVariantUtils.publishEventBus();

			var sDescriptorUrl = this.getModelProperty("descriptorUrl", oEvent.getSource().getBindingContext());

			BusyIndicator.show();
			return AppVariantOverviewUtils.getDescriptor(sDescriptorUrl).then(function(oAppVariantDescriptor) {
				BusyIndicator.hide();
				return RtaAppVariantFeature.onSaveAsFromOverviewDialog(oAppVariantDescriptor, false);
			});
		},
		copyId: function(oEvent) {
			var sCopiedId = this.getModelProperty("appId", oEvent.getSource().getBindingContext());
			AppVariantUtils.copyId(sCopiedId);
		}
	});
});