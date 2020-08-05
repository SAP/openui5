sap.ui.define(["sap/ui/core/mvc/Controller"], function(Controller) {
	"use strict";

	return Controller.extend("my.test.MainLegacy", {
		metadata: {
			/*no methods defined: should lead to legacy private/public behavior*/
			publicMethods: [
				"onMyHook"
			]
		},
		onInit: function() {

		},
		onExit: function() {

		},
		onBeforeRendering: function() {

		},
		onAfterRendering: function() {

		},
		onMyHook: function() {
			return "onMyHook";
		},
		publicMethod: function() {
			return "publicMethodOnBase";
		},
		myFinalMethod: function() {

		},
		privateMethod1: function() {
			return "privateMethodOnBase";
		},
		_privateMethod2: function() {
			return "privateMethodOnBase";
		}
	});
});