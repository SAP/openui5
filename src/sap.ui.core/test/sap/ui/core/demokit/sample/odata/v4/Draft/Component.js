/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to use for demo to show the FCL scenario w/ a draft service.
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.odata.v4.Draft.Component", {
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
