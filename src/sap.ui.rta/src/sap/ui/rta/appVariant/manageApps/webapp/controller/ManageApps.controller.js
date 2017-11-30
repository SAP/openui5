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

	var _sIdRunningApp, _oRootControlRunningApp, sModulePath, oI18n;
	return Controller.extend("sap.ui.rta.appVariant.manageApps.webapp.controller.ManageApps", {
		onInit: function() {
			_sIdRunningApp = this.getOwnerComponent().getIdRunningApp();
			_oRootControlRunningApp = this.getOwnerComponent().getRootControlRunningApp();

			sModulePath = jQuery.sap.getModulePath( "sap.ui.rta.appVariant.manageApps.webapp" );
			oI18n = jQuery.sap.resources({
				url : sModulePath + "/i18n/i18n.properties"
			});

			BusyIndicator.show();
			return AppVariantOverviewUtils.getAppVariantOverview(_sIdRunningApp).then(function(aAppVariantOverviewAttributes) {
				BusyIndicator.hide();
				return this._arrangeOverviewDataAndBindToModel(aAppVariantOverviewAttributes).then(function(aAppVariantOverviewAttributes) {
					return this._highlightNewCreatedAppVariant(aAppVariantOverviewAttributes);
				}.bind(this));
			}.bind(this))["catch"](function(oError) {
				BusyIndicator.hide();
				return AppVariantUtils.showTechnicalError(MessageBox.Icon.ERROR, "HEADER_MANAGE_APPS_FAILED", "MSG_MANAGE_APPS_FAILED", oError);
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

				sap.ui.getCore().getEventBus().publish("sap.ui.rta.appVariant.manageApps.controller.ManageApps", "navigate");
				return true;
			} else {
				return false;
			}
		},
		saveAsAppVariant: function(oEvent) {
			sap.ui.getCore().getEventBus().publish("sap.ui.rta.appVariant.manageApps.controller.ManageApps", "navigate");

			var sDescriptorUrl = this.getModelProperty("descriptorUrl", oEvent.getSource().getBindingContext());

			BusyIndicator.show();
			return AppVariantOverviewUtils.getDescriptor(sDescriptorUrl).then(function(oAppVariantDescriptor) {
				BusyIndicator.hide();
				return RtaAppVariantFeature.onSaveAs(_oRootControlRunningApp, oAppVariantDescriptor);
			})["catch"](function(oError) {
				BusyIndicator.hide();
				return AppVariantUtils.showTechnicalError(MessageBox.Icon.ERROR, "HEADER_MANAGE_APPS_FAILED", "MSG_MANAGE_APPS_FAILED", oError);
			});
		},
		copyId: function(oEvent) {
			var sCopiedId = this.getModelProperty("appId", oEvent.getSource().getBindingContext());
			AppVariantUtils.copyId(sCopiedId);
		}
	});
});