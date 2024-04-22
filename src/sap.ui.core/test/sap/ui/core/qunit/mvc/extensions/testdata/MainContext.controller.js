/*global QUnit */
sap.ui.define(["sap/ui/core/mvc/Controller", "./ReuseExtensionContext", "sap/ui/core/mvc/ControllerExtension"], function(Controller, ReuseExtension, ControllerExtension) {
	"use strict";

	return Controller.extend("my.test.Main", {
		metadata: {
			/*defining methods in controller metadata enables new metadata definition*/
			methods: {
				"privateMethod1": {"public":false, "final":true},
				"myFinalMethod": {"public":true, "final":true}
			}
		},
		mLifeCycle: {onInit:[], onExit:[], onBeforeRendering:[], onAfterRendering:[]},
		onInit: function() {
			QUnit.config.current.assert.ok(this instanceof Controller, "Context is controller");
			QUnit.config.current.assert.equal(this.getMetadata().getName(), "my.test.Main", "Context is correct controller");
		},
		onExit: function() {
			QUnit.config.current.assert.ok(this instanceof Controller, "Context is controller");
			QUnit.config.current.assert.equal(this.getMetadata().getName(), "my.test.Main", "Context is correct controller");
		},
		onBeforeRendering: function() {
			QUnit.config.current.assert.ok(this instanceof Controller, "Context is controller");
			QUnit.config.current.assert.equal(this.getMetadata().getName(), "my.test.Main", "Context is correct controller");
		},
		onAfterRendering: function() {
			QUnit.config.current.assert.ok(this instanceof Controller, "Context is controller");
			QUnit.config.current.assert.equal(this.getMetadata().getName(), "my.test.Main", "Context is correct controller");
		},
		publicMethod: function() {
			QUnit.config.current.assert.ok(this instanceof Controller, "Context is controller");
			QUnit.config.current.assert.equal(this.getMetadata().getName(), "my.test.Main", "Context is correct controller");
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
			publicMethod: function() {
				QUnit.config.current.assert.ok(this instanceof ControllerExtension, "Context is controller extension");
				QUnit.config.current.assert.equal(this.getMetadata().getNamespace(), "my.test.reuse", "Context is correct controller extension");
			}
		})
	});
});