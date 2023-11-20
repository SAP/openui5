sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/m/NavContainer"
], function(View, NavContainer) {
	"use strict";

	return View.extend("qunit.placeholder.component.NavContainerOptOut.view.RootView", {
		createContent: function() {
			return new NavContainer(this.createId("navContainer"));
		}
	});
});
