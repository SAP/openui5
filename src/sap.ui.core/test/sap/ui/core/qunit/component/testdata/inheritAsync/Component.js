sap.ui.define(["./parentB/Component"],
	function(ComponentB) {
		"use strict";

		var Component = ComponentB.extend("testdata.inheritAsync.Component", {
			metadata: {
				manifest: "json"
			}
		});

		return Component;
	});
