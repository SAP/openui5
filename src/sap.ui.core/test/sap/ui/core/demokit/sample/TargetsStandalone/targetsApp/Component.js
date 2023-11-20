sap.ui.define( ["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";
	return UIComponent.extend("sap.ui.core.sample.TargetsStandalone.targetsApp.Component", {

		metadata: {
			manifest: "json"
		},

		init : function () {
			UIComponent.prototype.init.apply(this, arguments);

			// Display the initial target
			this.getTargets().display("page1");
		}

	});
});
