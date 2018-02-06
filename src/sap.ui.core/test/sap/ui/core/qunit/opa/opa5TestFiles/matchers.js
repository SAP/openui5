sap.ui.define([
	'jquery.sap.global',
	'sap/ui/test/Opa',
	'sap/ui/test/Opa5',
	"sap/m/Button"
], function ($, Opa, Opa5, Button) {
	"use strict";

	var iExecutionDelay = Opa.config.executionDelay;

	QUnit.module("matchers without fake time");

	QUnit.test("Should find a control by id without matchers", function(assert) {
		// Arrange
		var oButton = new sap.ui.commons.Button("testButton"),
			done = assert.async();
		oButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

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
			assert.strictEqual(oSuccessButton, oButton, "found a control");

			done();
		});


	});

	QUnit.test("Should not call check if no matcher is matching on a single control", function(assert) {
		// Arrange
		var oButton = new sap.ui.commons.Button("myButton", {text : "foo"}),
			done = assert.async();
		oButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oCheckSpy = this.spy();

		// System under Test
		var oOpa5 = new Opa5();
		var oMatcher = new Opa5.matchers.PropertyStrictEquals({
			name : "text",
			value : "bar"
		});

		// Act
		oOpa5.waitFor({
			id : "myButton",
			matchers : [ oMatcher ],
			check : oCheckSpy,
			timeout : 1, //second
			pollingInterval : 200 //millisecond
		});
		oOpa5.emptyQueue().fail(function () {
			// Assert
			assert.strictEqual(oCheckSpy.callCount, 0, "did not call the check");

			// Cleanup
			oButton.destroy();

			done();
		});
	});

	QUnit.test("Should skip a check if matchers filtered out all controls", function(assert) {
		// Arrange
		var oButton = new sap.ui.commons.Button("myButton", {text : "foo"});
		var oButton2 = new sap.ui.commons.Button("myButton2", {text : "bar"}),
			done = assert.async();
		oButton.placeAt("qunit-fixture");
		oButton2.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oCheckSpy = this.spy();

		var oTextMatcher = new Opa5.matchers.PropertyStrictEquals({
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
			// Assert
			assert.strictEqual(oCheckSpy.callCount, 0, "did not call the check");

			// Cleanup
			oButton.destroy();
			oButton2.destroy();

			done();
		});
	});

	QUnit.module("matchers in waitfor", {
		beforeEach : function () { sinon.config.useFakeTimers = true; },
		afterEach : function () { sinon.config.useFakeTimers = false; }
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
		// Arrange
		var oButton = new sap.ui.commons.Button("myButton", {text : "foo"});
		oButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oCheckSpy = this.spy();

		// System under Test
		var oOpa5 = new Opa5();
		var oMatcher = new Opa5.matchers.PropertyStrictEquals({
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
		oButton.destroy();
	});

	QUnit.test("Should call check when all matchers are matching", function(assert) {
		// Arrange
		var oButton = new sap.ui.commons.Button("myButton", {text : "foo"});
		oButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oSuccessSpy = this.spy();

		// System under Test
		var oOpa5 = new Opa5();
		var oTextMatcher = new Opa5.matchers.PropertyStrictEquals({
			name : "text",
			value : "foo"
		});
		var oEnabledMatcher = new Opa5.matchers.PropertyStrictEquals({
			name : "enabled",
			value : false
		});

		var oTextMatcherSpy = this.spy(oTextMatcher, "isMatching");
		var oEnabledMatcherSpy = this.spy(oEnabledMatcher, "isMatching");

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

		oButton.setEnabled(false);
		this.clock.tick(200);
		assert.strictEqual(oTextMatcherSpy.callCount, 1, "did call the oTextMatcher");
		assert.strictEqual(oEnabledMatcherSpy.callCount, 2, "did call the oEnabledMatcher again");

		assert.strictEqual(oSuccessSpy.callCount, 1, "did call the success");

		// Cleanup
		oButton.destroy();
	});

	QUnit.test("Should only pass matching controls to success", function(assert) {
		// Arrange
		var oButton = new sap.ui.commons.Button("myButton", {text : "foo"});
		var oButton2 = new sap.ui.commons.Button("myButton2", {text : "bar"});
		oButton.placeAt("qunit-fixture");
		oButton2.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oSuccessSpy = this.spy();

		var oTextMatcher = new Opa5.matchers.PropertyStrictEquals({
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

		// Cleanup
		oButton.destroy();
		oButton2.destroy();
	});

	QUnit.test("Should only pass a single matching control to success", function(assert) {
		// Arrange
		var oButton = new sap.ui.commons.Button("myButton", {text : "foo"});
		oButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oSuccessSpy = this.spy();

		var oTextMatcher = new Opa5.matchers.PropertyStrictEquals({
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

		// Cleanup
		oButton.destroy();
	});

	QUnit.test("Should call a matcher which is an inline function", function(assert) {
		// Arrange
		var oButton = new sap.ui.commons.Button("myButton3");
		oButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

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
			id : "myButton3",
			matchers : fnMatcher,
			check : fnCheckSpy1,
			timeout : 1 //second
		});
		oOpa5.waitFor({
			id : "myButton3",
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
		oButton.destroy();
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
		// Arrange
		var oButton = new sap.ui.commons.Button("myButton", {text : "foo"});
		var oButton2 = new sap.ui.commons.Button("myButton2", {text : "bar"});
		oButton.placeAt("qunit-fixture");
		oButton2.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

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

		// Cleanup
		oButton.destroy();
		oButton2.destroy();
	});

	QUnit.test("Should pass only truthy result of matching to the next matchers and to success as value", function(assert) {
		// Arrange
		var oButton = new sap.ui.commons.Button("myButton", {text : "foo"});
		oButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oSuccessSpy = this.spy();
		var oCheckSpy = this.spy();

		waitForIdWithChangingMatchers("myButton", oCheckSpy, oSuccessSpy);

		// Assert
		this.clock.tick(200);

		var aText = oSuccessSpy.args[0][0];

		assert.strictEqual(aText, "footest", "The matched value is 'footest'");

		var aCheckText = oCheckSpy.args[0][0][0];

		assert.strictEqual(aCheckText, aText, "Check got same value as success");

		// Cleanup
		oButton.destroy();
	});
});
