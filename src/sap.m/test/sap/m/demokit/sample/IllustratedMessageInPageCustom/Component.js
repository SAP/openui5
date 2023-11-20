sap.ui.define(['sap/ui/core/UIComponent', 'sap/m/IllustrationPool'],
function (UIComponent, IllustrationPool) {
	"use strict";

	return UIComponent.extend("sap.m.sample.IllustratedMessageInPageCustom.Component", {

		metadata: {
			manifest: "json"
		},

		init : function () {

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			var oCustomSet = {
				setFamily: "Custom",// C:\SAPDevelop\openui5_1\src\sap.m\test\sap\m\demokit\sample\IllustratedMessageInPageCustom\illustrations
				setURI: sap.ui.require.toUrl("illustrations")
			};

			// register Custom illustration set
			IllustrationPool.registerIllustrationSet(oCustomSet, false);
		}
	});
});
