sap.ui.define(["sap/ui/core/Control"], function(Control) {
	"use strict";

	var MyControl = Control.extend("my.hints.lib.MyControl", {
		library: "my.hints.lib",
		metadata: {
			events: {
				myEvent: {}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.openEnd();

				oRm.openStart("div", oControl.getId() + "-inner");
				oRm.openEnd();
				oRm.close("div");

				oRm.close("div");
			}
		}
	});

	return MyControl;
});
