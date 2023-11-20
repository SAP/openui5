sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/XMLView"
],
	function (UIComponent, XMLView) {
		"use strict";

		return UIComponent.extend("sap.ui.core.sample.View.async.Component", {
			metadata: {
				manifest: "json",
				interfaces: [
					"sap.ui.core.IAsyncContentCreation"
				]
			},

			createContent: function () {
				return XMLView.create({
					id: this.createId("sampleView"),
					viewName: "sap.ui.core.sample.View.async.Sample"
				});
			}

		});
	});
