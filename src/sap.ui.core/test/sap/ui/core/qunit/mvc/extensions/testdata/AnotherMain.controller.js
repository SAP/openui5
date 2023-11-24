sap.ui.define(["./Main.controller", "./ReuseExtension"], function(Controller, ReuseExtension) {
	"use strict";

	return Controller.extend("my.test.AnotherMain", {
		metadata: {
			/*defining methods in controller metadata enables new metadata definition*/
			methods: {
				"publicMethod": {"public":false},
				"getView": {"public":false},
				"byId": {"public":false},
				"getMetadata": {"public": false},
				"isA": {"public": false}
			}
		}
	});
});