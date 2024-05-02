/*!
 * ${copyright}
 */

/**
 * @fileOverview
 *   Application component to test the two field solution for the unit and currency types
 * @version @version@
 */
 sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.internal.samples.odata.twoFields.Component", {
		metadata : {
			interfaces : ["sap.ui.core.IAsyncContentCreation"],
			manifest : "json"
		}
	});
});
