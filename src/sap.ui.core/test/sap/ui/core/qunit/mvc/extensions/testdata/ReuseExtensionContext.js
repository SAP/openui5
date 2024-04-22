/*global QUnit */
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
		overrides: {
			onInit: function() {
				QUnit.config.current.assert.ok(this instanceof ControllerExtension, "onInit: Context is ControllerExtension 'Extension'");
				QUnit.config.current.assert.equal(this.getMetadata().getNamespace(), "my.test.reuse", "onInit: Context is correct ControllerExtension 'Extension'");
			},
			onExit: function() {
				QUnit.config.current.assert.ok(this instanceof ControllerExtension, "onExit: Context is ControllerExtension 'Extension'");
				QUnit.config.current.assert.equal(this.getMetadata().getNamespace(), "my.test.reuse", "onExit: Context is correct ControllerExtension 'Extension'");
			},
			onBeforeRendering:function() {
				QUnit.config.current.assert.ok(this instanceof ControllerExtension, "onBeforeRendering: Context is ControllerExtension 'Extension'");
				QUnit.config.current.assert.equal(this.getMetadata().getNamespace(), "my.test.reuse", "onBeforeRendering: Context is correct ControllerExtension 'Extension'");
			},
			onAfterRendering: function() {
				QUnit.config.current.assert.ok(this instanceof ControllerExtension, "onAfterRendering: Context is ControllerExtension 'Extension'");
				QUnit.config.current.assert.equal(this.getMetadata().getNamespace(), "my.test.reuse", "onAfterRendering: Context is correct ControllerExtension 'Extension'");
			}
		}
	});
});