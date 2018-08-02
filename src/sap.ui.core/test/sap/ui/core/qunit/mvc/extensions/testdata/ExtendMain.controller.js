sap.ui.define(["./Main.controller"], function(Controller) {
	"use strict";

	return Controller.extend("my.test.ExtendMain", {
		metadata: {
			/*defining methods in controller metadata enables new metadata definition*/
			methods: {
				"myFinalMethod": {"final":false}
			}
		},
		myFinalMethod: function() {
			return "Should not happen: overridden by extend";
		}
	});
});