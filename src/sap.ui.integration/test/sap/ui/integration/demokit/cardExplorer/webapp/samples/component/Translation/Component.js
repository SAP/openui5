sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/m/IllustrationPool"
], function (UIComponent, IllustrationPool) {
	"use strict";

	var Component = UIComponent.extend("my.component.sample.Translation", {
		metadata: {
			manifest: "json"
		},
		init : function () {
			UIComponent.prototype.init.apply(this, arguments);
			var oTntSet = {
				setFamily: "tnt",
				setURI: sap.ui.require.toUrl("sap/tnt/themes/base/illustrations")
			};

			IllustrationPool.registerIllustrationSet(oTntSet, false);
		}
	});

	return Component;
});