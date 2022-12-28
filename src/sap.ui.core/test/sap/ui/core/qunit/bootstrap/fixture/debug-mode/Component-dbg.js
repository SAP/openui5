sap.ui.define([
	'sap/ui/core/mvc/View',
	'sap/ui/core/mvc/XMLView'
], function(View, XMLView) {
	"use strict";

	return Promise.all([
		View.create({ viewName: "module:fixture/debug-mode/view/Main.view" }),
		XMLView.create({ viewName: "fixture.debug-mode.view.Main" })
	]);
});