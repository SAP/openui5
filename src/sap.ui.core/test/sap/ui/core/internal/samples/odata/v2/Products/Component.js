/*!
 * ${copyright}
 */

/**
 * Application component to display information on Product entities from the ZUI5_GWSAMPLE_BASIC
 * OData service.
 */
sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.internal.samples.odata.v2.Products.Component", {
		metadata : {
			interfaces : ["sap.ui.core.IAsyncContentCreation"],
			manifest : "json"
		}
	});
});