sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/IconPool"
], function (UIComponent, IconPool) {
	"use strict";

	return UIComponent.extend("sap.ui.layout.sample.ProductHomeLayout.Component", {

		metadata: {
			manifest: "json"
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);

			// register TNT icon font
			IconPool.registerFont( {
				fontFamily: "SAP-icons-TNT",
				fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/")
			});
		}

	});
});