sap.ui.define(['jquery.sap.global', '../parentA/Component'],
	function(jQuery, ComponentA) {
		"use strict";

		var Component = ComponentA.extend("sap.ui.test.inheritAsyncError.parentB.Component", {
			metadata: {
				manifest: "json"
			}
		});

		return Component;
	});
