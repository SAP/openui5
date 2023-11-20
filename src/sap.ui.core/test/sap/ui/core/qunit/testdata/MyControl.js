sap.ui.define(['sap/ui/core/Control', "./MyControlRenderer"], function(Control, MyControlRenderer) {
	"use strict";

	var MyControl = Control.extend("testdata.core.testdata.MyControl", {
		metadata: {
			properties : {
				text: {type: "string", group: "Misc", defaultValue: null}
			}

		},

		renderer: MyControlRenderer
	});

	return MyControl;
});
