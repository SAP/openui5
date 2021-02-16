/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.internal.samples.odata.v2.Products.Main", {
		onResetChanges : function () {
			this.getView().getModel().resetChanges();
		}
	});
});