/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/fl/Layer",
	"sap/ui/rta/appVariant/manageApps/webapp/model/models",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/appVariant/Utils",
	"sap/m/MessageBox",
	"sap/ui/rta/Utils",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/core/BusyIndicator",
	"sap/base/i18n/ResourceBundle"
], function(
	Controller,
	Layer,
	Model,
	AppVariantUtils,
	AppVariantOverviewUtils,
	MessageBox,
	RtaUtils,
	RtaAppVariantFeature,
	RuntimeAuthoring,
	BusyIndicator,
	ResourceBundle
) {
	"use strict";

	var _sIdRunningApp;
	var _bKeyUser;
	var _sLayer;
	var sModulePath;
	var oI18n;

	return Controller.extend("sap.ui.rta.appVariant.manageApps.webapp.controller.ManageApps", {
		onInit: function() {
			_sIdRunningApp = this.getOwnerComponent().getIdRunningApp();
			_bKeyUser = this.getOwnerComponent().getIsOverviewForKeyUser();
			_sLayer = this.getOwnerComponent().getLayer();

			if (!oI18n) {
				this._createResourceBundle();
			}

			BusyIndicator.show();
			return AppVariantOverviewUtils.getAppVariantOverview(_sIdRunningApp, _bKeyUser).then(function(aAppVariantOverviewAttributes) {
				BusyIndicator.hide();
				if (aAppVariantOverviewAttributes.length) {
					return this._arrangeOverviewDataAndBindToModel(aAppVariantOverviewAttributes).then(function(aAppVariantOverviewAttributes) {
						return this._highlightNewCreatedAppVariant(aAppVariantOverviewAttributes);
					}.bind(this));
				}

				AppVariantUtils.closeOverviewDialog();
				return this._showMessageWhenNoAppVariantsExist();
			}.bind(this))["catch"](function(oError) {
				AppVariantUtils.closeOverviewDialog();
				var oErrorInfo = AppVariantUtils.buildErrorInfo("MSG_MANAGE_APPS_FAILED", oError);
				oErrorInfo.overviewDialog = true;
				BusyIndicator.hide();
				return AppVariantUtils.showRelevantDialog(oErrorInfo, false);
			});
		},

		_createResourceBundle: function() {
			sModulePath = sap.ui.require.toUrl("sap/ui/rta/appVariant/manageApps/") + "webapp";
			oI18n = ResourceBundle.create({
				url : sModulePath + "/i18n/i18n.properties"
			});
		},

		_showMessageWhenNoAppVariantsExist: function() {
			return RtaUtils.showMessageBox(MessageBox.Icon.INFORMATION, "MSG_APP_VARIANT_OVERVIEW_SAP_DEVELOPER", {
				titleKey: "TITLE_APP_VARIANT_OVERVIEW_SAP_DEVELOPER"
			});
		},

		_highlightNewCreatedAppVariant: function(aAppVariantOverviewAttributes) {
			var oTable = this.byId("Table1");

			aAppVariantOverviewAttributes.forEach(function(oAppVariantDescriptor, index) {
				if (oAppVariantDescriptor.currentStatus === oI18n.getText("MAA_NEW_APP_VARIANT")
					|| oAppVariantDescriptor.currentStatus === oI18n.getText("MAA_OPERATION_IN_PROGRESS")
				) {
					if (oTable.getItems().length >= index) {
						oTable.getItems()[index].focus();
					}
				}
			});

			return Promise.resolve();
		},

		_arrangeOverviewDataAndBindToModel: function(aAppVariantOverviewAttributes) {
			var aAdaptingAppAttributes = aAppVariantOverviewAttributes.filter(function(oAppVariantProperty) {
				return oAppVariantProperty.appId === _sIdRunningApp;
			});

			var oAdaptingAppAttributes = aAdaptingAppAttributes[0];
			if (oAdaptingAppAttributes && oAdaptingAppAttributes.appVarStatus !== "R") {
				oAdaptingAppAttributes.currentStatus = oI18n.getText("MAA_CURRENTLY_ADAPTING");
			}

			aAppVariantOverviewAttributes = aAppVariantOverviewAttributes.filter(function(oAppVariantProperty) {
				return oAppVariantProperty.appId !== _sIdRunningApp;
			});

			aAppVariantOverviewAttributes.unshift(oAdaptingAppAttributes);

			var aReferenceAppAttributes = aAppVariantOverviewAttributes.filter(function(oAppVariantProperty) {
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
			} else if (sValue === oI18n.getText("MAA_OPERATION_IN_PROGRESS")) {
				return "Warning";
			}

			return "None";
		},

		formatDelButtonTooltip: function(bDelAppVarButtonEnabled, bIsS4HanaCloud) {
			if (!oI18n) {
				this._createResourceBundle();
			}
			if (!bDelAppVarButtonEnabled && !bIsS4HanaCloud) {
				return oI18n.getText("TOOLTIP_DELETE_APP_VAR");
			}
			return undefined;
		},

		formatAdaptUIButtonTooltip: function(bAdaptUIButtonEnabled, sAppVarStatus) {
			if (!oI18n) {
				this._createResourceBundle();
			}
			if (!bAdaptUIButtonEnabled) {
				switch (sAppVarStatus) {
					case 'R':
						// For S4/Hana Cloud systems
						return oI18n.getText("TOOLTIP_ADAPTUI_STATUS_RUNNING");
					case 'U':
						return oI18n.getText("TOOLTIP_ADAPTUI_STATUS_UNPBLSHD_ERROR");
					case 'E':
						return oI18n.getText("TOOLTIP_ADAPTUI_STATUS_UNPBLSHD_ERROR");
					case 'P':
						return oI18n.getText("TOOLTIP_ADAPTUI_STATUS_PUBLISHED");
					case undefined:
						// For S4/Hana onPrem systems
						return oI18n.getText("TOOLTIP_ADAPTUI_ON_PREMISE");
					default:
						// Do nothing
				}
			}
		},

		formatAdaptUIButtonVisibility: function(bVisible, bKeyUser) {
			return bVisible && bKeyUser;
		},

		getModelProperty : function(sModelPropName, sBindingContext) {
			return this.getView().getModel().getProperty(sModelPropName, sBindingContext);
		},

		onMenuAction: function(oEvent) {
			var oItem = oEvent.getParameter("item");
			var sItemPath = "";

			while (oItem instanceof sap.m.MenuItem) {
				sItemPath = oItem.getText() + " > " + sItemPath;
				oItem = oItem.getParent();
			}

			sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));

			if (!oI18n) {
				this._createResourceBundle();
			}

			if (sItemPath === oI18n.getText("MAA_DIALOG_ADAPT_UI")) {
				return this.handleUiAdaptation(oEvent);
			} else if (sItemPath === oI18n.getText("MAA_DIALOG_COPY_ID")) {
				return this.copyId(oEvent);
			} else if (sItemPath === oI18n.getText("MAA_DIALOG_DELETE_APPVAR")) {
				return this.deleteAppVariant(oEvent);
			} else if (sItemPath === oI18n.getText("MAA_DIALOG_SAVE_AS_APP")) {
				return this.saveAsAppVariant(oEvent);
			}

			return undefined;
		},

		handleUiAdaptation: function(oEvent) {
			var oNavigationService = sap.ushell.Container.getService("CrossApplicationNavigation");

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
					params: oParams,
					writeHistory : false
				};

				RuntimeAuthoring.enableRestart(Layer.CUSTOMER);

				oNavigationService.toExternal(oNavigationParams);

				AppVariantUtils.closeOverviewDialog();
				return true;
			}

			return false;
		},

		saveAsAppVariant: function(oEvent) {
			AppVariantUtils.closeOverviewDialog();

			var sDescriptorUrl = this.getModelProperty("descriptorUrl", oEvent.getSource().getBindingContext());

			BusyIndicator.show();
			return AppVariantOverviewUtils.getDescriptor({
				appVarUrl: sDescriptorUrl,
				layer: _sLayer
			}).then(function(oAppVariantDescriptor) {
				BusyIndicator.hide();
				return RtaAppVariantFeature.onSaveAs(false, false, _sLayer, oAppVariantDescriptor);
			});
		},

		copyId: function(oEvent) {
			var sCopiedId = this.getModelProperty("appId", oEvent.getSource().getBindingContext());
			AppVariantUtils.copyId(sCopiedId);
		},

		deleteAppVariant: function(oEvent) {
			var oInfo = {};
			if (!oI18n) {
				this._createResourceBundle();
			}
			var sMessage = oI18n.getText("MSG_APP_VARIANT_DELETE_CONFIRMATION");
			oInfo.text = sMessage;
			oInfo.deleteAppVariant = true;

			var sAppVarId = this.getModelProperty("appId", oEvent.getSource().getBindingContext());
			var sCurrentStatus = this.getModelProperty("currentStatus", oEvent.getSource().getBindingContext());
			var bCurrentlyAdapting = sCurrentStatus === oI18n.getText("MAA_CURRENTLY_ADAPTING");

			return AppVariantUtils.showRelevantDialog(oInfo)
				.then(function() {
					return RtaAppVariantFeature.onDeleteFromOverviewDialog(sAppVarId, bCurrentlyAdapting, _sLayer);
				}).catch(function() {
					return true;
				});
		}
	});
});