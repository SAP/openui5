sap.ui.define(['sap/ui/core/Control', "./MyControlRenderer"], function(Control) {
	"use strict";

	var MyControl = Control.extend("testdata.core.testdata.MyControl", {
		metadata: {
			properties : {
				text: {type: "string", group: "Misc", defaultValue: null}
			}

		}
	});

	return MyControl;
});
