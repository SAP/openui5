sap.ui.define(["sap/ui/core/mvc/Controller"], function(Controller) {
	"use strict";

	return Controller.extend("my.test.Main", {
		metadata: {
			/*defining methods in controller metadata enables new metadata definition*/
			methods: {
				"privateMethod1": {"public":false, "final":true},
				"myFinalMethod": {"public":true, "final":true}
			}
		},
		onInit: function() {

		},
		onExit: function() {

		},
		onBeforeRendering: function() {

		},
		onAfterRendering: function() {

		},
		publicMethod: function() {
			return "publicMethodOnBase";
		},
		myFinalMethod: function() {
			return "final method could not be overidden";
		},
		privateMethod1: function() {
			return "privateMethod1OnBase";
		},
		_privateMethod2: function() {
			return "privateMethod2OnBase";
		}
	});
});