sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/thirdparty/sinon"
],
function(UIComponent, sinon) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.View.preprocessor.Component", {

		metadata: {
			manifest: "json"
		},
		createContent: function(oController) {
			return sap.ui.jsview("sap.ui.core.sample.View.preprocessor.Sample", true);
		}
	});
});
