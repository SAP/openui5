sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("v4server.integration.app.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the application model is set.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
		}

	});

});
