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
	"sap/ui/core/BusyIndicator",
	"sap/ui/rta/RuntimeAuthoring"
], function(jQuery, Controller, Model, AppVariantOverviewUtils, MessageBox, RtaUtils, RtaAppVariantFeature, BusyIndicator, RuntimeAuthoring) {
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
				return this._arrangeOverviewDataAndBindToModel(aAppVariantOverviewAttributes).then(function() {
					return this._highlightNewCreatedAppVariant(aAppVariantOverviewAttributes);
				}.bind(this));
			}.bind(this))["catch"](function(oError) {
				return this._showMessage("HEADER_MANAGE_APPS_FAILED", "MSG_MANAGE_APPS_FAILED", oError);
			}.bind(this));
		},
		_highlightNewCreatedAppVariant: function(aAppVariantOverviewAttributes) {
			var oTable = this.getView().byId("Table1");
			jQuery('.maaCurrentStatus,.maaSubTitle').css("font-size", '12px');

			aAppVariantOverviewAttributes.forEach(function(oAppVariantDescriptor, index) {
				if (oAppVariantDescriptor.rowStatus === "Information") {
					oTable.setFirstVisibleRow(index);
				}
			});

			return Promise.resolve();
		},
		_showMessage: function(sTitleKey, sMessageKey, oError) {
			sap.ui.getCore().getEventBus().publish("sap.ui.rta.appVariant.manageApps.controller.ManageApps", "navigate");
			var _oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			var sMessage = _oTextResources.getText(sMessageKey, oError ? [oError.message || oError] : undefined);
			var sTitle = _oTextResources.getText(sTitleKey);

			return new Promise(function(resolve) {
				MessageBox.error(sMessage, {
					title: sTitle,
					onClose: resolve,
					styleClass: RtaUtils.getRtaStyleClassName()
				});
			});
		},
		_arrangeOverviewDataAndBindToModel: function(aAppVariantOverviewAttributes) {
			var aAdaptingAppAttributes = aAppVariantOverviewAttributes.filter(function(oAppVariantProperty){
				return oAppVariantProperty.appId === _sIdRunningApp;
			});

			var oAdaptingAppAttributes = aAdaptingAppAttributes[0];
			if (oAdaptingAppAttributes) {
				oAdaptingAppAttributes.currentStatus = oI18n.getText("MAA_CURRENTLY_ADAPTING");
				oAdaptingAppAttributes.rowStatus = "Success";
			}

			aAppVariantOverviewAttributes = aAppVariantOverviewAttributes.filter(function(oAppVariantProperty) {
				return oAppVariantProperty.appId !== _sIdRunningApp;
			});

			aAppVariantOverviewAttributes.unshift(oAdaptingAppAttributes);

			var aReferenceAppAttributes = aAppVariantOverviewAttributes.filter(function(oAppVariantProperty){
				return oAppVariantProperty.isReference;
			});

			var oReferenceAppAttributes = aReferenceAppAttributes[0];

			aAppVariantOverviewAttributes = aAppVariantOverviewAttributes.filter(function(oAppVariantProperty) {
				return !oAppVariantProperty.isReference;
			});

			aAppVariantOverviewAttributes.unshift(oReferenceAppAttributes);

			// Bind the app variant overview to JSON model

			var oModelData = {
				appVariants: aAppVariantOverviewAttributes
			};
			var oModel = Model.createModel(oModelData);
			this.getView().setModel(oModel);

			return Promise.resolve(true);
		},
		getModelProperty : function(sModelPropName, sBindingContext) {
			return this.getView().getModel().getProperty(sModelPropName, sBindingContext);
		},
		handleUiAdaptation: function(oEvent) {
			var oNavigationService = sap.ushell.Container.getService( "CrossApplicationNavigation" );

			var sSemanticObject = this.getModelProperty("semanticObject", oEvent.getSource().getBindingContext());
			var sAction = this.getModelProperty("action", oEvent.getSource().getBindingContext());
			var oParams = this.getModelProperty("params", oEvent.getSource().getBindingContext());

			var oNavigationParams = {
				target: {
	                semanticObject : sSemanticObject,
	                action : sAction
				},
				params: oParams
			};

			RuntimeAuthoring.enableRestart( "CUSTOMER" );

			oNavigationService.toExternal(oNavigationParams);

			sap.ui.getCore().getEventBus().publish("sap.ui.rta.appVariant.manageApps.controller.ManageApps", "navigate");
		},
		saveAsAppVariant: function(oEvent) {
			sap.ui.getCore().getEventBus().publish("sap.ui.rta.appVariant.manageApps.controller.ManageApps", "navigate");

			var sDescriptorUrl = this.getModelProperty("descriptorUrl", oEvent.getSource().getBindingContext());

			return AppVariantOverviewUtils.getDescriptor(sDescriptorUrl).then(function(oAppVariantDescriptor) {
				return RtaAppVariantFeature.onSaveAs(_oRootControlRunningApp, oAppVariantDescriptor);
			})["catch"](function(oError) {
				return this._showMessage("HEADER_MANAGE_APPS_FAILED", "MSG_MANAGE_APPS_FAILED", oError);
			}.bind(this));
		},
		copyId: function(oEvent) {
			var sCopiedId = this.getModelProperty("appId", oEvent.getSource().getBindingContext());

			var textArea = document.createElement("textarea");
			textArea.value = sCopiedId;
			document.body.appendChild(textArea);
			textArea.select();

			document.execCommand('copy');
			document.body.removeChild(textArea);
		}
	});
});