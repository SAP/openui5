/*
 * ! ${copyright}
 */

sap.ui.define([
], function (
) {
	"use strict";

	return {
		getChangeTypes: function() {
			return [
				"appdescr_ovp_addNewCard",
				"appdescr_ovp_removeCard",
				"appdescr_ovp_changeCard",
				"appdescr_app_addNewInbound",
				"appdescr_app_changeInbound",
				"appdescr_app_removeInbound",
				"appdescr_app_removeAllInboundsExceptOne",
				"appdescr_app_addNewOutbound",
				"appdescr_app_changeOutbound",
				"appdescr_app_removeOutbound",
				"appdescr_app_addNewDataSource",
				"appdescr_app_changeDataSource",
				"appdescr_app_removeDataSource",
				"appdescr_app_addAnnotationsToOData",
				"appdescr_app_addTechnicalAttributes",
				"appdescr_app_removeTechnicalAttributes",
				"appdescr_app_setTitle",
				"appdescr_app_setSubTitle",
				"appdescr_app_setShortTitle",
				"appdescr_app_setDescription",
				"appdescr_app_setInfo",
				"appdescr_app_setDestination",
				"appdescr_app_setKeywords",
				"appdescr_app_setAch",
				"appdescr_app_addCdsViews",
				"appdescr_app_removeCdsViews",
				"appdescr_flp_setConfig",
				"appdescr_ui5_addNewModel",
				"appdescr_ui5_addNewModelEnhanceWith",
				"appdescr_ui5_removeModel",
				"appdescr_ui5_replaceComponentUsage",
				"appdescr_ui5_setMinUI5Version",
				"appdescr_smb_addNamespace",
				"appdescr_smb_changeNamespace",
				"appdescr_ui_generic_app_setMainPage",
				"appdescr_ui_setIcon",
				"appdescr_ui_setDeviceTypes",
				"appdescr_ui5_addLibraries",
				"appdescr_url_setUri",
				"appdescr_fiori_setRegistrationIds",
				"appdescr_card",
				"appdescr_widget"
			];
		},
		getCondensableChangeTypes: function() {
			return [
				"appdescr_app_setTitle",
				"appdescr_app_setInfo",
				"appdescr_app_setShortTitle",
				"appdescr_app_setSubTitle",
				"appdescr_app_setDescription",
				"appdescr_app_setDestination",
				"appdescr_app_setKeywords",
				"appdescr_app_setAch",
				"appdescr_ui_setIcon",
				"appdescr_ui_setDeviceTypes",
				"appdescr_ui_setIcon",
				"appdescr_ui_setDeviceTypes",
				"appdescr_fiori_setRegistrationIds",
				"appdescr_smb_changeNamespace"
			];
		}
	};
});