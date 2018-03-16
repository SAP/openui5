sap.ui.define(['jquery.sap.global', 'sap/ui/core/UIComponent'],
	function(jQuery, UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.test.inheritAsyncError.parentFAIL.Component", {
			metadata: {
				manifest: "json"
			}
		});

		return Component;
	});
