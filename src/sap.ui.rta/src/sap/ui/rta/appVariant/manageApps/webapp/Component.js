/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";

	var _sIdRunningApp;
	var _bKeyUser;
	var _sLayer;

	return UIComponent.extend("sap.ui.rta.appVariant.manageApps.webapp.Component", {

		metadata: {
			manifest: "json",
			library: "sap.ui.rta",
			version: "0.9",
			properties: {
				idRunningApp: "string",
				isOverviewForKeyUser: {
					type: "boolean"
				},
				layer: "string"
			}
		},

		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			_sIdRunningApp = aArgs[1].idRunningApp;
			_bKeyUser = aArgs[1].isOverviewForKeyUser;
			_sLayer = aArgs[1].layer;
			UIComponent.prototype.constructor.apply(this, aArgs);
		},

		/**
		 * Component is automatically initialized by SAPUI5 at startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init(...aArgs) {
			this.setIdRunningApp(_sIdRunningApp);
			this.setIsOverviewForKeyUser(_bKeyUser);
			this.setLayer(_sLayer);
			// call the base component's init function
			UIComponent.prototype.init.apply(this, aArgs);
		}
	});
});