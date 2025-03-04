/*!
 * ${copyright}
 */

/**
 * Application component to display information on Product entities from the ZUI5_GWSAMPLE_BASIC
 * OData service.
 */
sap.ui.define([
	"./FakeServer",
	"sap/ui/core/UIComponent"
], function (FakeServer, UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.internal.samples.odata.v2.Products.Component", {
		constructor : function() {
			// start the fake server before super constructor is called and models are created
			FakeServer.start();
			UIComponent.apply(this, arguments);
		},

		exit: function () {
			FakeServer.stop();
		},

		metadata : {
			interfaces : ["sap.ui.core.IAsyncContentCreation"],
			manifest : "json"
		}
	});
});