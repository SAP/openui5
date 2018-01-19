/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";

	var _sIdRunningApp, _bKeyUser;

	return UIComponent.extend("sap.ui.rta.appVariant.manageApps.webapp.Component", {

		metadata: {
			"manifest": "json",
			"library": "sap.ui.rta",
			"version": "0.9",
			"properties": {
				"idRunningApp" : "string",
				isOverviewForKeyUser: {
					type: "boolean"
				}
			}
		},

		constructor: function() {
			_sIdRunningApp = arguments[1].idRunningApp;
			_bKeyUser = arguments[1].isOverviewForKeyUser;
			UIComponent.prototype.constructor.apply(this, arguments);
		},

		/**
		 * Component is automatically initialized by SAPUI5 at startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			this.setIdRunningApp(_sIdRunningApp);
			this.setIsOverviewForKeyUser(_bKeyUser);
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
		}
	});
});