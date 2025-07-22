/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.odata.v4.ListBinding.Component", {
		metadata : {
			interfaces : ["sap.ui.core.IAsyncContentCreation"],
			manifest : "json"
		},

		exit : function () {
			this.getModel().restoreSandbox();
		},

		init : function () {
			UIComponent.prototype.init.apply(this, arguments);
			this.setModel(this.getModel(), "parameterContext");
		}
	});
});
