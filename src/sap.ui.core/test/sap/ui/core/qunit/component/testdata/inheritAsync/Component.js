sap.ui.define(['./parentB/Component'],
	function(ComponentB) {
		"use strict";

		var Component = ComponentB.extend("sap.ui.test.inheritAsync.Component", {
			metadata: {
				manifest: "json"
			}
		});

		return Component;
	});
