/* global QUnit */
sap.ui.define([
    "sap/ui/mdc/Control",
	"sap/ui/mdc/flexibility/xConfigFlex",
	"sap/ui/core/Core",
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function (MDCControl, xConfigFlex, Core, createAppEnvironment, JsControlTreeModifier) {
	"use strict";

	QUnit.module("xConfigFlex Error handling");

	QUnit.test("Throw Error if config is missing 'xConfigFlex#createSetChangeHandler", function(assert){

		assert.throws(function() {
			xConfigFlex.createSetChangeHandler();
		}, "The method expects a config object to create a changehandler");

	});

    QUnit.test("Throw Error if property config is missing 'xConfigFlex#createSetChangeHandler", function(assert){

		assert.throws(function() {
			xConfigFlex.createSetChangeHandler({
                aggregation: "test"
            });
		}, "The method expects a config object containing 'aggregations' and 'name' key to create a changehandler");

	});

    QUnit.test("Throw Error if property config is missing 'xConfigFlex#createSetChangeHandler", function(assert){

        var oHandler = xConfigFlex.createSetChangeHandler({
            aggregation: "testAggregation",
            property: "testProperty"
        });

        assert.ok(oHandler.changeHandler.applyChange instanceof Function, "Change apply implemented");
        assert.ok(oHandler.changeHandler.revertChange instanceof Function, "Change revert implemented");
        assert.ok(oHandler.changeHandler.completeChangeContent instanceof Function, "Change completion implemented");
	});

	var TestClass = MDCControl.extend("sap.ui.mdc.FlexTestControl", {
		metadata: {
			defaultAggregation: "items",
			interfaces: [
				"sap.ui.mdc.IxState"
			],
			aggregations: {
				items: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			}
		},
		initialized: function() {
			return Promise.resolve();
		}
	});

	QUnit.module("Generic Tests for applyChange/revertChange", {

		beforeEach: function() {

			//Create a new instance of a test control
			this.oFlexTestControl = new TestClass("FlexTestControl");

			var sTestView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc"></mvc:View>';

			//Create the app environment for flex related processing
			return createAppEnvironment(sTestView, "ItemBaseFlexTest").then(function(mCreatedApp){
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				this.oView.addContent(this.oFlexTestControl);

				Core.applyChanges();

				this.oHandler = xConfigFlex.createSetChangeHandler({
					aggregation: "items",
					property: "text"
				});
			}.bind(this));

		},

		afterEach: function() {
			this.oView.destroy();
			this.oUiComponentContainer.destroy();
			this.oFlexTestControl.destroy();
		}

	});

	QUnit.test("Check 'applyChange'", function(assert){
		var done = assert.async();

		//Note: better use ChangesWriteAPI.create, but we can not register change handlers programatically
		var oChange = {
			getChangeType: function() {
				return "testSetterChange";
			},
			getContent: function() {
				return {
					name: "some_test_property",
					value: "some_test_value"
				};
			},
			setRevertData: function() {}
		};

		this.oHandler.changeHandler.applyChange(oChange, this.oFlexTestControl, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		}).then(function(){

			var sXConfig = this.oFlexTestControl.getCustomData()[0].getValue().replaceAll("\\", "");

			assert.equal(sXConfig, '{"aggregations":{"items":{"some_test_property":{"text":"some_test_value"}}}}', "The xConfig has been created");
			done();

		}.bind(this));
	});

	QUnit.test("Check 'revertChange'", function(assert){
		var done = assert.async();

		//Note: better use ChangesWriteAPI.create, but we can not register change handlers programatically
		var oChange = {
			getChangeType: function() {
				return "testSetterChange";
			},
			getContent: function() {
				return {
					name: "some_test_property",
					value: "new_value"
				};
			},
			getRevertData: function() {
				return {
					name: "some_test_property",
					value: "some_earlierValue"
				};
			},
			setRevertData: function() {},
			resetRevertData: function() {}
		};

		this.oHandler.changeHandler.revertChange(oChange, this.oFlexTestControl, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		}).then(function(){

			var sXConfig = this.oFlexTestControl.getCustomData()[0].getValue().replaceAll("\\", "");

			assert.equal(sXConfig, '{"aggregations":{"items":{"some_test_property":{"text":"some_earlierValue"}}}}', "The xConfig has been created");
			done();

		}.bind(this));
	});

});
