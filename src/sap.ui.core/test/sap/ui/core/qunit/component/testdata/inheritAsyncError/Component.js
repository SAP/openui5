sap.ui.define(["./parentB/Component"],
	function(ComponentB) {
		"use strict";

		var Component = ComponentB.extend("testdata.inheritAsyncError.Component", {
			metadata: {
				manifest: "json"
			}
		});

		return Component;
	});
