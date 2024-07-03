sap.ui.define(["../parentA/Component"],
	function(ComponentA) {
		"use strict";

		var Component = ComponentA.extend("testdata.inheritAsync.parentB.Component", {
			metadata: {
				manifest: "json"
			}
		});

		return Component;
	});
