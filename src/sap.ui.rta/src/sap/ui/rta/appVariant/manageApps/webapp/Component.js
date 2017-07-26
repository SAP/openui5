/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";

	var _oAdaptedAppProperties;

	return UIComponent.extend("sap.ui.rta.appVariant.manageApps.webapp.Component", {

		metadata: {
			"manifest": "json",
			"library": "sap.ui.rta",
			"version": "0.9",
			"properties": {
				adaptedAppProperties : {
					type: "object"
				}
			}

		},

		constructor: function() {
			_oAdaptedAppProperties = arguments[1].adaptedAppProperties;
			UIComponent.prototype.constructor.apply(this, arguments);
		},

		/**
		 * Component is automatically initialized by SAPUI5 at startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			this.setAdaptedAppProperties(_oAdaptedAppProperties);
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
		}
	});
});