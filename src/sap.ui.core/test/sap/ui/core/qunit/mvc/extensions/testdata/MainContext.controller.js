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
			window.assert.ok(this instanceof Controller, "Context is controller");
			window.assert.equal(this.getMetadata().getName(), "my.test.Main", "Context is correct controller")
		},
		onExit: function() {
			window.assert.ok(this instanceof Controller, "Context is controller");
			window.assert.equal(this.getMetadata().getName(), "my.test.Main", "Context is correct controller")
		},
		onBeforeRendering: function() {
			window.assert.ok(this instanceof Controller, "Context is controller");
			window.assert.equal(this.getMetadata().getName(), "my.test.Main", "Context is correct controller")
		},
		onAfterRendering: function() {
			window.assert.ok(this instanceof Controller, "Context is controller");
			window.assert.equal(this.getMetadata().getName(), "my.test.Main", "Context is correct controller")
		},
		publicMethod: function() {
			window.assert.ok(this instanceof Controller, "Context is controller");
			window.assert.equal(this.getMetadata().getName(), "my.test.Main", "Context is correct controller")
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
				window.assert.ok(this instanceof ControllerExtension, "Context is controller extension");
				window.assert.equal(this.getMetadata().getNamespace(), "my.test.reuse", "Context is correct controller extension")
			}
		})
	});
});