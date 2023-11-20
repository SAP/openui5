/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to demo a deep create use case.
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.odata.v4.DeepCreate.Component", {
		metadata : {
			manifest : "json"
		},

		init : function () {
			// call the super function
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();
		}
	});
});
