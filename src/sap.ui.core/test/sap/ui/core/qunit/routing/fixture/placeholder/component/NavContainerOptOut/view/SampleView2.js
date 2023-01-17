sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/m/Panel"
], function(View, Panel) {
	"use strict";

	return View.extend("qunit.placeholder.component.NavContainerOptOut.view.SampleView2", {
		createContent: function() {
			return new Panel(this.createId("panel"));
		}
	});
});
