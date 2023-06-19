sap.ui.define(['./parentB/Component'],
	function(ComponentB) {
		"use strict";

		var Component = ComponentB.extend("sap.ui.test.inheritAsyncError.Component", {
			metadata: {
				manifest: "json"
			}
		});

		return Component;
	});
