sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.test.inheritAsync.parentA.Component", {
			metadata: {
				manifest: "json"
			}
		});

		return Component;
	});
