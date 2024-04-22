sap.ui.define(["sap/ui/core/mvc/ControllerExtension"], function(ControllerExtension) {
	"use strict";

	return ControllerExtension.extend("my.test.reuse.Extension", {
		metadata: {
			methods: {
				"myFinalMethod": {"public": true, "final": true},
				"myPrivateMethod1": {"public": false, "final": true}
			}
		},
		myFinalMethod: function() {
			return "I am final";
		},
		myPublicMethod: function() {
			return "myPublicMethodReuseExtension";
		},
		myPrivateMethod1: function() {

		},
		_myPrivateMethod2: function() {

		},
		onBeforeSomething: function() {

		},
		onInit: function() {
			this.base.getLifeCycleCalls().onInit.push('reuseExtension');
		},
		overrides: {
			onInit: function() {
				this.base.getLifeCycleCalls().onInit.push('reuseExtension');
			},
			onExit: function() {
				this.base.getLifeCycleCalls().onExit.push('reuseExtension');
			},
			onBeforeRendering:function() {
				this.base.getLifeCycleCalls().onBeforeRendering.push('reuseExtension');
			},
			onAfterRendering: function() {
				this.base.getLifeCycleCalls().onAfterRendering.push('reuseExtension');
			}
		}
	});
});