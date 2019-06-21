/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";

	var _sIdRunningApp, _bKeyUser, _sLayer;

	return UIComponent.extend("sap.ui.rta.appVariant.manageApps.webapp.Component", {

		metadata: {
			manifest: "json",
			library: "sap.ui.rta",
			version: "0.9",
			properties: {
				idRunningApp : "string",
				isOverviewForKeyUser: {
					type: "boolean"
				},
				layer: "string"
			}
		},

		constructor: function() {
			_sIdRunningApp = arguments[1].idRunningApp;
			_bKeyUser = arguments[1].isOverviewForKeyUser;
			_sLayer = arguments[1].layer;
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
			this.setLayer(_sLayer);
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
		}
	});
});