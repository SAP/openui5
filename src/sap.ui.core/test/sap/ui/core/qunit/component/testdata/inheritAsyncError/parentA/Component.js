sap.ui.define(["sap/ui/core/UIComponent"],
	function(UIComponent) {
		"use strict";

		var Component = UIComponent.extend("testdata.inheritAsyncError.parentFAIL.Component", {
			metadata: {
				manifest: "json"
			}
		});

		return Component;
	});
