sap.ui.define(["sap/ui/core/mvc/Controller", "./ReuseExtension"], function(Controller, ReuseExtension) {
	"use strict";

	return Controller.extend("my.test.Main", {
		metadata: {
			/*defining methods in controller metadata enables new metadata definition*/
			methods: {
				"privateMethod1": {"public":false, "final":"true"},
				"myFinalMethod": {"public":true, "final":"true"}
			}
		},
		mLifeCycle: {onInit:[], onExit:[], onBeforeRendering:[], onAfterRendering:[]},
		onInit: function() {
			this.mLifeCycle.onInit.push('base');
		},
		onExit: function() {
			this.mLifeCycle.onExit.push('base');
		},
		onBeforeRendering: function() {
			this.mLifeCycle.onBeforeRendering.push('base');
		},
		onAfterRendering: function() {
			this.mLifeCycle.onAfterRendering.push('base');
		},
		publicMethod: function() {
			return "publicMethodOnBase";
		},
		getLifeCycleCalls: function() {
			return this.mLifeCycle;
		},
		myFinalMethod: function() {
			return "I am final";
		},
		privateMethod1: function() {
			return "privateMethod1OnBase";
		},
		_privateMethod2: function() {
			return "privateMethod2OnBase";
		},
		reuse: ReuseExtension.override({
			myFinalMethod: function() {
				"Final Methods could not be overidden by an extension";
			},
			publicMethod: function() {
				return "myPublicMethodReuseExtensionOveridden";
			}
		})
	});
});