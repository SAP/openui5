sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/m/Panel"
], function (View, Panel) {
	"use strict";

	return View.extend("testdata.view.AsyncJSView", {
		createContent: function() {
			return Promise.resolve(
				new Panel({id: this.createId("myPanel")})
			);
		}
	});
});