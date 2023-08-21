/*global QUnit, sinon */
sap.ui.define([
	'sap/ui/test/Opa',
	'sap/ui/test/Opa5',
	"sap/m/Button",
	"sap/m/Input",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"sap/ui/test/matchers/MatcherFactory",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (Opa, Opa5, Button, Input, PropertyStrictEquals, Ancestor, Descendant, MatcherFactory, HorizontalLayout, nextUIUpdate) {
	"use strict";

	QUnit.test("Should not execute the test in debug mode", function (assert) {
		assert.ok(!window["sap-ui-debug"], "Starting the OPA tests in debug mode is not supported since it changes timeouts");
	});

	var iExecutionDelay = Opa.config.executionDelay;

	QUnit.module("matchers without fake time", {
		beforeEach: function () {
			this.oButton = new Button("testButton", {text : "foo"});
			this.oButton.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oButton.destroy();
		}
	});

	QUnit.test("Should find a control by id without matchers", function(assert) {
		var done = assert.async();
		var oSuccessSpy = this.spy();

		// System under Test
		var oOpa5 = new Opa5();

		// Act
		oOpa5.waitFor({
			id : "testButton",
			success : oSuccessSpy,
			timeout : 1, //second
			pollingInterval : 200 //millisecond
		});
		oOpa5.emptyQueue().done(function() {
			var oSuccessButton = oSuccessSpy.args[0][0];
			assert.strictEqual(oSuccessButton, this.oButton, "found a control");
			done();
		}.bind(this));


	});

	QUnit.test("Should not call check if no matcher is matching on a single control", function(assert) {
		var oCheckSpy = this.spy();
		var done = assert.async();

		// System under Test
		var oOpa5 = new Opa5();
		var oMatcher = new PropertyStrictEquals({
			name : "text",
			value : "bar"
		});

		// Act
		oOpa5.waitFor({
			id : "testButton",
			matchers : [ oMatcher ],
			check : oCheckSpy,
			timeout : 1, //second
			pollingInterval : 200 //millisecond
		});
		oOpa5.emptyQueue().fail(function () {
			assert.strictEqual(oCheckSpy.callCount, 0, "did not call the check");
			done();
		});
	});

	QUnit.test("Should skip a check if matchers filtered out all controls", function(assert) {
		var oCheckSpy = this.spy();
		var done = assert.async();

		var oTextMatcher = new PropertyStrictEquals({
			name : "text",
			value : "baz"
		});

		// System under Test
		var oOpa5 = new Opa5();

		// Act
		oOpa5.waitFor({
			id : ["myButton", "myButton2"],
			matchers : oTextMatcher,
			check : oCheckSpy,
			timeout : 1 //second
		});
		Opa5.emptyQueue().fail(function () {
			assert.strictEqual(oCheckSpy.callCount, 0, "did not call the check");
			done();
		});
	});

	QUnit.module("matchers in waitfor", {
		beforeEach : function () {
			sinon.config.useFakeTimers = true;
			this.oLayout1 = new HorizontalLayout({id: "layout1"});
			this.oButton = new Button("myButton", {text : "foo"});
			this.oButton2 = new Button("myButton2", {text : "bar"});
			this.oButton.placeAt(this.oLayout1);
			this.oLayout1.placeAt("qunit-fixture");
			this.oButton2.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach : function () {
			sinon.config.useFakeTimers = false;
			this.oButton.destroy();
			this.oButton2.destroy();
			this.oLayout1.destroy();
		}
	});

	QUnit.test("Should execute a matcher and pass its value to success if no control is searched", function (assert) {
		var oOpa5 = new Opa5(),
			fnMatcherStub = this.stub().returns("foo"),
			fnActionSpy = this.spy(),
			done = assert.async();

		// give some common defaults to see if they interfere and the plugin thinks we are looking for a control
		Opa5.extendConfig({
			viewNamespace: "foo",
			visible: true
		});

		oOpa5.waitFor({
			matchers: fnMatcherStub,
			actions: fnActionSpy
		});

		oOpa5.emptyQueue().done(function () {
			// Assert
			sinon.assert.calledOnce(fnMatcherStub);
			sinon.assert.calledWith(fnActionSpy, "foo");
			done();
		});
		this.clock.tick(1000);
	});

	QUnit.test("Should not call check if no matcher is matching", function(assert) {
		var oCheckSpy = this.spy();

		// System under Test
		var oOpa5 = new Opa5();
		var oMatcher = new PropertyStrictEquals({
			name : "text",
			value : "bar"
		});
		var oMatchSpy = this.spy(oMatcher, "isMatching");

		// Act
		oOpa5.waitFor({
			id : "myButton",
			matchers : [ oMatcher ],
			check : oCheckSpy,
			timeout : 1, //second
			pollingInterval : 200 //millisecond
		});
		oOpa5.emptyQueue();

		this.clock.tick(iExecutionDelay);
		assert.strictEqual(oMatchSpy.callCount, 1, "called the matcher for the first time");
		this.clock.tick(200);
		assert.strictEqual(oMatchSpy.callCount, 2, "called the matcher for the second time");

		// Assert
		assert.strictEqual(oCheckSpy.callCount, 0, "did not call the check");

		// Cleanup
		this.clock.tick(1000);
	});

	QUnit.test("Should call check when all matchers are matching", function(assert) {
		var oSuccessSpy = this.spy();

		// System under Test
		var oOpa5 = new Opa5();
		var oTextMatcher = new PropertyStrictEquals({
			name : "text",
			value : "foo"
		});
		var oEnabledMatcher = new PropertyStrictEquals({
			name : "enabled",
			value : false
		});

		var oTextMatcherSpy = this.spy(oTextMatcher, "isMatching");
		var oEnabledMatcherSpy = this.spy(oEnabledMatcher, "isMatching");

		this.oButton.setEnabled(true);

		// Act
		oOpa5.waitFor({
			id : "myButton",
			matchers : [ oEnabledMatcher, oTextMatcher ],
			success : oSuccessSpy,
			timeout : 1, //second
			pollingInterval : 200 //millisecond
		});
		Opa5.emptyQueue();

		this.clock.tick(iExecutionDelay);
		// Assert
		assert.strictEqual(oTextMatcherSpy.callCount, 0, "did not call the oTextMatcher yet");
		assert.strictEqual(oEnabledMatcherSpy.callCount, 1, "called the oEnabledMatcher");

		this.oButton.setEnabled(false);
		this.clock.tick(200);
		assert.strictEqual(oTextMatcherSpy.callCount, 1, "did call the oTextMatcher");
		assert.strictEqual(oEnabledMatcherSpy.callCount, 2, "did call the oEnabledMatcher again");

		assert.strictEqual(oSuccessSpy.callCount, 1, "did call the success");
	});

	QUnit.test("Should use declarative matchers", function(assert) {
		var oSuccessSpy = this.spy();
		var oOpa5 = new Opa5();
		var fnIsMatching = PropertyStrictEquals.prototype.isMatching;
		var mCalls = {text: 0, enabled: 0, busy: 0};
		PropertyStrictEquals.prototype.isMatching = function () {
			mCalls[this.getName()] += 1;
			return fnIsMatching.apply(this, arguments);
		};

		this.oButton.setEnabled(true);

		oOpa5.waitFor({
			id : "myButton",
			propertyStrictEquals: [{
				name : "enabled",
				value : false
			}, {
				name : "text",
				value : "foo"
			}],
			matchers: {
				propertyStrictEquals: {
					name: "busy",
					value: false
				}
			},
			success : oSuccessSpy,
			timeout : 1, //second
			pollingInterval : 200 //millisecond
		});
		Opa5.emptyQueue();

		this.clock.tick(iExecutionDelay);
		assert.strictEqual(mCalls.enabled, 1, "called the enabled (state) matcher");
		assert.strictEqual(mCalls.text, 0, "did not call the text matcher yet (declared on root)");
		assert.strictEqual(mCalls.busy, 0, "did not call the busy matcher yet (declared in matchers)");

		this.oButton.setEnabled(false);
		this.clock.tick(200);
		assert.strictEqual(mCalls.enabled, 2, "did call the enabled (state) matcher again");
		assert.strictEqual(mCalls.text, 1, "did call the text matcher (declared on root)");
		assert.strictEqual(mCalls.busy, 1, "did call the busy matcher (declared in matchers)");

		assert.strictEqual(oSuccessSpy.callCount, 1, "did call the success");

		PropertyStrictEquals.prototype.isMatching = fnIsMatching;
	});

	QUnit.test("Should use declarative matchers with expansions", function (assert) {
		var oSuccessSpy = this.spy();
		var mCalls = {
			propertyStrictEquals: {text: 0},
			ancestor: [],
			descendant: []
		};

		var fnPropertyMatch = PropertyStrictEquals.prototype.isMatching;
		PropertyStrictEquals.prototype.isMatching = function () {
			mCalls.propertyStrictEquals[this.getName()] += 1;
			return fnPropertyMatch.apply(this, arguments);
		};
		var fnAncestor = Ancestor;
		Ancestor = function () {
			var ancestor = arguments[0];
			return function () {
				mCalls.ancestor.push({
					ancestor: ancestor,
					child: arguments[0]
				});
				return fnAncestor.call(this, ancestor).apply(this, arguments);
			};
		};
		var fnDescendant = Descendant;
		Descendant = function () {
			var descendant = arguments[0];
			return function () {
				mCalls.descendant.push({
					descendant: descendant,
					parent: arguments[0]
				});
				return fnDescendant.call(this, descendant).apply(this, arguments);
			};
		};
		var fnGetMatchers = sinon.stub(MatcherFactory.prototype, "_getSupportedMatchers").returns({
			propertyStrictEquals: PropertyStrictEquals,
			ancestor: Ancestor,
			descendant: Descendant
		});
		var oOpa5 = new Opa5();
		oOpa5.waitFor({
			id : "myButton",
			propertyStrictEquals: {
				name : "text",
				value : "foo"
			},
			matchers: {
				ancestor: {
					id: "layout1",
					descendant: {
						id: "myButton"
					}
				}
			},
			success : oSuccessSpy,
			timeout : 1, //second
			pollingInterval : 200 //millisecond
		});
		Opa5.emptyQueue();
		this.clock.tick(200);

		assert.strictEqual(mCalls.propertyStrictEquals.text, 1, "called the text matcher");
		assert.strictEqual(mCalls.descendant.length, 1, "called the descendant matcher");
		assert.strictEqual(mCalls.ancestor.length, 1, "called the ancestor matcher");

		assert.strictEqual(oSuccessSpy.callCount, 1, "did call the success");

		// restore
		PropertyStrictEquals.prototype.isMatching = fnPropertyMatch;
		Ancestor = fnAncestor;
		Descendant = fnDescendant;
		fnGetMatchers.restore();
	});

	QUnit.test("Should only pass matching controls to success", function(assert) {
		var oSuccessSpy = this.spy();

		var oTextMatcher = new PropertyStrictEquals({
			name : "text",
			value : "bar"
		});

		// System under Test
		var oOpa5 = new Opa5();

		// Act
		oOpa5.waitFor({
			id : ["myButton", "myButton2"],
			matchers : [ oTextMatcher ],
			success : oSuccessSpy,
			timeout : 1, //second
			pollingInterval : 200 //millisecond
		});
		Opa5.emptyQueue();

		// Assert
		this.clock.tick(200);

		assert.strictEqual(oSuccessSpy.callCount, 1, "did call the success");
		var aControls = oSuccessSpy.args[0][0];

		assert.strictEqual(aControls.length, 1, "did pass only one button");
		assert.strictEqual(aControls[0].sId, "myButton2", "did pass the correct button");
	});

	QUnit.test("Should only pass a single matching control to success", function(assert) {
		var oSuccessSpy = this.spy();

		var oTextMatcher = new PropertyStrictEquals({
			name : "text",
			value : "foo"
		});

		// System under Test
		var oOpa5 = new Opa5();

		// Act
		oOpa5.waitFor({
			id : "myButton",
			matchers : [ oTextMatcher ],
			success : oSuccessSpy,
			timeout : 1, //second
			pollingInterval : 200 //millisecond
		});
		Opa5.emptyQueue();

		// Assert
		this.clock.tick(200);

		assert.strictEqual(oSuccessSpy.callCount, 1, "did call the success");
		var oControl = oSuccessSpy.args[0][0];

		assert.strictEqual(oControl.sId, "myButton", "did pass the correct button");
	});

	QUnit.test("Should call a matcher which is an inline function", function(assert) {
		// System under Test
		var oOpa5 = new Opa5();
		oOpa5.extendConfig({pollingInterval : 200 /*millisecond*/});

		var fnMatcher = this.spy(function(oControl) {
			return !!oControl;
		});

		// Act
		var fnCheckSpy1 = this.spy(function(){
			return true;
		});
		var fnCheckSpy2 = this.spy(function(){
			return true;
		});
		oOpa5.waitFor({
			id : "myButton",
			matchers : fnMatcher,
			check : fnCheckSpy1,
			timeout : 1 //second
		});
		oOpa5.waitFor({
			id : "myButton",
			matchers : [ fnMatcher ],
			check : fnCheckSpy2,
			timeout : 1 //second
		});
		oOpa5.emptyQueue();
		this.clock.tick(iExecutionDelay);
		this.clock.tick(iExecutionDelay);

		assert.strictEqual(fnMatcher.callCount, 2, "called the matcher twice");

		// Assert
		assert.ok(fnCheckSpy1.calledBefore(fnCheckSpy2), "Checks executed in correct order");
		assert.strictEqual(fnCheckSpy1.callCount, 1, "called first check");
		assert.strictEqual(fnCheckSpy2.callCount, 1, "called last check");

		// Cleanup
		this.clock.tick(1000);
	});

	var waitForIdWithChangingMatchers = function(vId, oCheckSpy, oSuccessSpy) {
		var fnReturnTextMatcher = function(oControl) {
			return oControl.getText();
		};

		var fnStringChangeMathcer = function(sText) {
			return sText + "test";
		};

		// System under Test
		var oOpa5 = new Opa5();

		// Act
		oOpa5.waitFor({
			id : vId,
			matchers : [
				fnReturnTextMatcher,
				fnStringChangeMathcer
			],
			check : function() {
				oCheckSpy.call(this, arguments);
				return true;
			},
			success : oSuccessSpy,
			timeout : 1, //second
			pollingInterval : 200 //millisecond
		});
		Opa5.emptyQueue();
	};

	QUnit.test("Should pass multiple truthy results of matching to the next matchers and to success as array", function(assert) {
		var oSuccessSpy = this.spy();
		var oCheckSpy = this.spy();

		waitForIdWithChangingMatchers(["myButton", "myButton2"], oCheckSpy, oSuccessSpy);

		// Assert
		this.clock.tick(200);

		var aText = oSuccessSpy.args[0][0];

		assert.strictEqual(aText.length, 2, "Matchers did pass two values");
		assert.strictEqual(aText[0], "footest", "The first value is 'footest'");
		assert.strictEqual(aText[1], "bartest", "The second value is 'bartest'");

		var aCheckText = oCheckSpy.args[0][0][0];

		assert.strictEqual(aCheckText.length, aText.length, "Check got same amout of values");
		assert.strictEqual(aCheckText[0], aText[0], "The first value is same");
		assert.strictEqual(aCheckText[1], aText[1], "The second value is same");
	});

	QUnit.test("Should pass only truthy result of matching to the next matchers and to success as value", function(assert) {
		var oSuccessSpy = this.spy();
		var oCheckSpy = this.spy();

		waitForIdWithChangingMatchers("myButton", oCheckSpy, oSuccessSpy);

		// Assert
		this.clock.tick(200);

		var aText = oSuccessSpy.args[0][0];

		assert.strictEqual(aText, "footest", "The matched value is 'footest'");

		var aCheckText = oCheckSpy.args[0][0][0];

		assert.strictEqual(aCheckText, aText, "Check got same value as success");
	});

	QUnit.module("state matchers", {
		beforeEach : function () {
			this.oButton = new Button("enabledButton", {text : "foo"});
			this.oButton2 = new Button("disabledButton", {text : "bar", enabled: false});
			this.oInput = new Input("editableInput");
			this.oInput2 = new Input("noneditableInput", {editable: false});
			this.oButton.placeAt("qunit-fixture");
			this.oButton2.placeAt("qunit-fixture");
			this.oInput.placeAt("qunit-fixture");
			this.oInput2.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach : function () {
			this.oButton.destroy();
			this.oButton2.destroy();
			this.oInput.destroy();
			this.oInput2.destroy();
		}
	});

	QUnit.test("Should filter by enabled state when autoWait is true", function (assert) {
		var done = assert.async();
		var oOpa5 = new Opa5();

		Opa5.extendConfig({
			autoWait: true
		});

		oOpa5.waitFor({
			controlType: "sap.m.Button",
			success: function (aButtons) {
				assert.strictEqual(aButtons.length, 1, "Should include only enabled controls by default (enabled: undefined)");
			}
		});

		oOpa5.waitFor({
			controlType: "sap.m.Button",
			enabled: false,
			success: function (aButtons) {
				assert.strictEqual(aButtons.length, 2, "Should include both enabled and disabled controls when enabled: false");
			}
		});

		Opa5.emptyQueue().done(function () {
			Opa5.resetConfig();
			done();
		});
	});

	QUnit.test("Should filter by enabled state when autoWait is false", function (assert) {
		var done = assert.async();
		var oOpa5 = new Opa5();

		oOpa5.waitFor({
			controlType: "sap.m.Button",
			success: function (aButtons) {
				assert.strictEqual(aButtons.length, 2, "Should include both enabled and disabled controls by default (enabled: undefined)");
			}
		});

		oOpa5.waitFor({
			controlType: "sap.m.Button",
			enabled: true,
			success: function (aButtons) {
				assert.strictEqual(aButtons.length, 1, "Should include only enabled controls when enabled: true");
			}
		});

		Opa5.emptyQueue().done(done);
	});

	QUnit.test("Should apply interactable matcher when interactable is true and autoWait is false", function (assert) {
		var done = assert.async();
		var oOpa5 = new Opa5();

		this.oButton2.setEnabled(true);
		this.oButton2.setBusy(true);

		oOpa5.waitFor({
			controlType: "sap.m.Button",
			interactable: true,
			success: function (aButtons) {
				assert.strictEqual(aButtons.length, 1, "Should include only interactable controls when interactable: true");
			}
		});

		Opa5.emptyQueue().done(function () {
			Opa5.resetConfig();
			done();
		});
	});

	QUnit.test("Should filter by enabled state when interactable is true", function (assert) {
		var done = assert.async();
		var oOpa5 = new Opa5();

		oOpa5.waitFor({
			controlType: "sap.m.Button",
			interactable: true,
			success: function (aButtons) {
				assert.strictEqual(aButtons.length, 1, "Should include only enabled controls when enabled: undefined");
			}
		});
		oOpa5.waitFor({
			controlType: "sap.m.Button",
			interactable: true,
			enabled: false,
			success: function (aButtons) {
				assert.strictEqual(aButtons.length, 2, "Should include both enabled and disabled controls when enabled: false");
			}
		});

		Opa5.emptyQueue().done(function () {
			Opa5.resetConfig();
			done();
		});
	});

	QUnit.test("Should filter by editable state", function (assert) {
		var done = assert.async();
		var oOpa5 = new Opa5();

		Opa5.extendConfig({
			autoWait: true
		});

		oOpa5.waitFor({
			controlType: "sap.m.Input",
			editable: true,
			success: function (aInputs) {
				assert.strictEqual(aInputs.length, 1, "Should include only editable controls by default (editable: undefined)");
			}
		});

		oOpa5.waitFor({
			controlType: "sap.m.Input",
			editable: false,
			success: function (aInputs) {
				assert.strictEqual(aInputs.length, 2, "Should include all controls when editable: false");
			}
		});

		Opa5.emptyQueue().done(function () {
			Opa5.resetConfig();
			done();
		});
	});

});
