sap.ui.define(["sap/ui/core/mvc/Controller", "./ReuseExtensionFinal"], function(Controller, ReuseExtensionFinal) {
	"use strict";

	return Controller.extend("my.test.Main", {
		metadata: {
			/*no methods defined: should lead to legacy private/public behavior*/
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
		reuse: ReuseExtensionFinal
	});
});