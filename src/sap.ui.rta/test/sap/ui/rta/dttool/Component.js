sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/HashChanger"
], function (UIComponent, HashChanger) {
	"use strict";
	return UIComponent.extend("sap.ui.rta.dttool.Component", {
		metadata : {
			manifest: "json"
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// default route
			var oHashChanger = new HashChanger();
			oHashChanger.setHash("sample/sap.m.sample.Switch");

			// create the views based on the url/hash
			this.getRouter().initialize();
		}
	});
});