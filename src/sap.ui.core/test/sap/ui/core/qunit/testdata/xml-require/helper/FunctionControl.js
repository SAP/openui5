sap.ui.define(["sap/ui/core/Control"], function(Control) {
	"use strict";

	return Control.extend("testdata.xml-require.helper.FunctionControl", {
		metadata: {
			properties: {
				handler: {type : "function", group : "Behavior", defaultValue : null}
			}
		}
	});
});
