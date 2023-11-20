sap.ui.define(["sap/ui/core/mvc/ControllerExtension"], function(ControllerExtension) {
	"use strict";

	return ControllerExtension.extend("my.test.reuse.AnotherExtension", {
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
		overrides: {
			onInit: function() {
				window.assert.ok(this instanceof ControllerExtension, "onInit: Context is ControllerExtension 'AnotherExtension'");
				window.assert.equal(this.getMetadata().getNamespace(), "my.test.reuse", "onInit: Context is correct ControllerExtension 'AnotherExtension'");
			},
			onExit: function() {
				window.assert.ok(this instanceof ControllerExtension, "onExit: Context is ControllerExtension 'AnotherExtension'");
				window.assert.equal(this.getMetadata().getNamespace(), "my.test.reuse", "onExit: Context is correct ControllerExtension 'AnotherExtension'");
			},
			onBeforeRendering:function() {
				window.assert.ok(this instanceof ControllerExtension, "onBeforeRendering: Context is ControllerExtension 'AnotherExtension'");
				window.assert.equal(this.getMetadata().getNamespace(), "my.test.reuse", "onBeforeRendering: Context is correct ControllerExtension 'AnotherExtension'");
			},
			onAfterRendering: function() {
				window.assert.ok(this instanceof ControllerExtension, "onAfterRendering: Context is ControllerExtension 'AnotherExtension'");
				window.assert.equal(this.getMetadata().getNamespace(), "my.test.reuse", "onAfterRendering: Context is correct ControllerExtension 'AnotherExtension'");
			},
			reuse: {
				myPublicMethod: function() {
					window.assert.ok(this instanceof ControllerExtension, "overridden.myPublicMethod: Context is ControllerExtension 'AnotherExtension'");
					window.assert.equal(this.getMetadata().getNamespace(), "my.test.reuse", "overridden.myPublicMethod: Context is correct ControllerExtension 'AnotherExtension'");
				}
			}
		}
	});
});