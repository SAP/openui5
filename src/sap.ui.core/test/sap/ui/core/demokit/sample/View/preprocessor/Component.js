sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/UIComponent",
	"sap/ui/thirdparty/sinon"
],
function(jQuery, UIComponent, sinon) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.View.preprocessor.Component", {

		metadata: {
			dependencies: {
				libs: [
					"sap.ui.core",
					"sap.m"
				]
			},
			config: {
				sample: {
					files: [
						"Sample.view.xml",
						"Sample.view.js"
					]
				}
			}
		},
		createContent: function(oController) {
			return sap.ui.jsview("sap.ui.core.sample.View.preprocessor.Sample", true);
		}
	});
});
