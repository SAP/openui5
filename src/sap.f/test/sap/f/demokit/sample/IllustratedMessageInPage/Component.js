sap.ui.define(['sap/ui/core/UIComponent', 'sap/f/IllustrationPool'],
function (UIComponent, IllustrationPool) {
	"use strict";

	return UIComponent.extend("sap.f.sample.IllustratedMessageInPage.Component", {

		metadata: {
			manifest: "json"
		},

		init : function () {

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			var oTntSet = {
				setFamily: "tnt",
				setURI: sap.ui.require.toUrl("sap/tnt/themes/base/illustrations")
			};

			// register tnt illustration set
			IllustrationPool.registerIllustrationSet(oTntSet, false);
		}
	});
});
