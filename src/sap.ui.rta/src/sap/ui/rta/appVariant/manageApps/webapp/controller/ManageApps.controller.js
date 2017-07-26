/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/rta/appVariant/manageApps/webapp/model/models",
	"sap/ui/rta/appVariant/Utils",
	"sap/m/MessageBox"
], function(jQuery, Controller, Model, ManageAppsUtils, MessageBox) {
	"use strict";

	var _oAdaptedAppProperties, sModulePath, oI18n;
	return Controller.extend("sap.ui.rta.appVariant.manageApps.webapp.controller.ManageApps", {
		onInit: function() {
			_oAdaptedAppProperties = this.getOwnerComponent().getAdaptedAppProperties();
			var sOriginalAppId = _oAdaptedAppProperties.componentName;

			sModulePath = jQuery.sap.getModulePath( "sap.ui.rta.appVariant.manageApps.webapp" );
			oI18n = jQuery.sap.resources({
				url : sModulePath + "/i18n/i18n.properties"
			});

			var sAppVariantType = oI18n.getText("MAA_APP_VARIANT_TYPE");

			return ManageAppsUtils.getAppVariants(sOriginalAppId, sAppVariantType).then(function(aAppVariantsProperties) {
				return this._addAppVariantsProperties(aAppVariantsProperties).then(function() {
					return this._paintCurrentlyAdaptedApp();
				}.bind(this));
			}.bind(this))["catch"](function(oError) {
				return this._showMessage(MessageBox.Icon.ERROR, "HEADER_MANAGE_APPS_FAILED", "MSG_MANAGE_APPS_FAILED", oError).then(function() {
					return this._closeManageAppsDialog();
				}.bind(this));
			}.bind(this));
		},
		_showMessage: function(oMessageType, sTitleKey, sMessageKey, oError) {
			var _oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			var sMessage = _oTextResources.getText(sMessageKey, oError ? [oError.message || oError] : undefined);
			var sTitle = _oTextResources.getText(sTitleKey);

			return new Promise(function(resolve) {
				MessageBox.show(sMessage, {
					icon: oMessageType,
					title: sTitle,
					onClose: resolve
				});
			});
		},
		_addAppVariantsProperties: function(aAppVariantsProperties) {
			var oAdaptedAppProperties = {
				title: _oAdaptedAppProperties.title,
				subTitle: _oAdaptedAppProperties.subTitle,
				description: _oAdaptedAppProperties.description,
				icon: _oAdaptedAppProperties.icon,
				id: _oAdaptedAppProperties.idAppAdapted,
				componentName: _oAdaptedAppProperties.componentName,
				currentStatus: oI18n.getText("MAA_CURRENTLY_ADAPTING")
			};

			if (_oAdaptedAppProperties.idAppAdapted === _oAdaptedAppProperties.componentName) {
				oAdaptedAppProperties.type = oI18n.getText("MAA_ORIGINAL_TYPE");
				aAppVariantsProperties.unshift(oAdaptedAppProperties);
				return this._bindModelData(aAppVariantsProperties);
			} else {
				var aFilteredAppVariantsProperties = aAppVariantsProperties.filter(function(oAppVariantProperty) {
					return oAppVariantProperty.id !== oAdaptedAppProperties.id;
				});

				oAdaptedAppProperties.type = oI18n.getText("MAA_APP_VARIANT_TYPE");
				aFilteredAppVariantsProperties.unshift(oAdaptedAppProperties);
				return ManageAppsUtils.getOriginalAppProperties(_oAdaptedAppProperties.componentName, oI18n.getText("MAA_ORIGINAL_TYPE")).then(function(aOriginalAppProperties) {
					// Original app properties must be on the top of the overview list
					aFilteredAppVariantsProperties.unshift(aOriginalAppProperties[0]);
					return this._bindModelData(aFilteredAppVariantsProperties);
				}.bind(this));
			}
		},
		_bindModelData: function(aAppVariantsProperties) {
			var oModelData = {
				appVariants: aAppVariantsProperties
			};
			var oModel = Model.createModel(oModelData);
			this.getView().setModel(oModel);
			return Promise.resolve(true);

		},
		_closeManageAppsDialog: function() {
			var oManageAppsDialog = sap.ui.getCore().byId("manageAppsDialog");

			oManageAppsDialog.oPopup.attachClosed(function (){
				oManageAppsDialog.destroy();
				return Promise.resolve(true);
			});
			oManageAppsDialog.close();
		},
		_paintCurrentlyAdaptedApp: function() {
			var oTable = this.getView().byId("Table1");
			jQuery('.maaCurrentStatus,.maaSubTitle').css("font-size", '12px');

			function colorRows() {
				var rowCount = oTable.getVisibleRowCount();
	            var rowStart = oTable.getFirstVisibleRow();
	            var currentRowContext;

	            for (var i = 0; i < rowCount; i++) {
					currentRowContext = oTable.getContextByIndex(rowStart + i);
					if (currentRowContext && currentRowContext.getProperty("currentStatus") === oI18n.getText("MAA_CURRENTLY_ADAPTING")) {
						var sColor = sap.ui.core.theming.Parameters.get("sapUiHighlight");
						oTable.getRows()[i].$().find("span").css({color: sColor});
						break;
					}
	            }

	            return Promise.resolve(true);
			}

			return colorRows();
		}
	});
});