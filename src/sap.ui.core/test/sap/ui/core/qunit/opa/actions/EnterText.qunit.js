/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/actions/EnterText",
	"sap/m/Input",
	"sap/m/SearchField",
	"sap/m/DatePicker",
	"sap/m/TextArea",
	"sap/ui/core/ListItem",
	"sap/m/StepInput",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/m/library",
	"sap/ui/thirdparty/jquery"
], function (
	EnterText,
	Input,
	SearchField,
	DatePicker,
	TextArea,
	ListItem,
	StepInput,
	Popover,
	Button,
	Opa5,
	opaTest,
	mobileLibrary,
	$) {
	"use strict";

	var InputType = mobileLibrary.InputType;

	QUnit.module("Entering text", {
		afterEach: function () {
			this.oControl.destroy();
		}
	});

	[{
		Control: Input,
		changeEvent: "change",
		liveChangeEventParameter: "value",
		changeEventParameter: "value"
	}, {
		Control: DatePicker,
		textInControl: "1",
		textToEnter: "1/12/15",
		changeEvent: "change",
		changeEventParameter: "value"
	}, {
		// something invalid
		Control: DatePicker,
		changeEvent: "change",
		changeEventParameter: "value"
	}, {
		Control: TextArea,
		changeEvent: "change",
		liveChangeEventParameter: "value",
		changeEventParameter: "value"
	}, {
		Control: SearchField,
		changeEvent: "search",
		liveChangeEventParameter: "newValue",
		changeEventParameter: "query"
	}].forEach(function (testInfo) {

		function testBody(bClearText, assert) {
			var fnDone = assert.async();
			var sTextToEnter = testInfo.textToEnter || "foo";
			var sTextBeforeAction = testInfo.textInControl || "A";
			var oControl = new testInfo.Control({
				value: sTextBeforeAction
			});
			this.oControl = oControl; // should be destroyed at end of test

			// if no focus functions are defined - define them to spy on them
			if (!oControl.onfocusin) {
				oControl.onfocusin = $.noop;
			}
			if (!oControl.onsapfocusleave) {
				oControl.onsapfocusleave = $.noop;
			}
			var fnOnSapFocusInSpy = sinon.spy(oControl, "onfocusin");
			var fnOnSapFocusLeaveSpy = sinon.spy(oControl, "onsapfocusleave");

			oControl.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var oEnterText = new EnterText({
				text: sTextToEnter,
				clearTextFirst: bClearText
			});

			if (testInfo.liveChangeEventParameter) {
				// check that characters are entered 1 by 1 and control value is updated with every character
				var sStartValue = bClearText ? "" : sTextBeforeAction;
				var sValueToCheck = sStartValue;
				var iLiveChangeCalls = 0;

				oControl.attachLiveChange(function (oEvent) {
					var iLiveChangeCharPosition = bClearText ? iLiveChangeCalls - 1 : iLiveChangeCalls;
					sValueToCheck += sTextToEnter.charAt(iLiveChangeCharPosition) || "";
					iLiveChangeCalls++;
					// focus is on the control as the full text is not entered yet
					sinon.assert.calledOnce(fnOnSapFocusInSpy);
					sinon.assert.notCalled(fnOnSapFocusLeaveSpy);

					assert.strictEqual(oEvent.getParameter(testInfo.liveChangeEventParameter), sValueToCheck);
				}, this);
			}

			oControl.attachEvent(testInfo.changeEvent, function (oEvent) {
				// check that the value is updated at the end when all key input is done
				var sExpected = (bClearText ? "" : sTextBeforeAction) + sTextToEnter;
				assert.strictEqual(oEvent.getParameter(testInfo.changeEventParameter), sExpected, "Change event was correct");

				setTimeout(function () {
					// by default, the input should lose focus at the end of EnterText
					// FF>=77 needs a timeout delay bigger than 0
					sinon.assert.calledOnce(fnOnSapFocusLeaveSpy);
					fnDone();
				}, 50);
			});

			oEnterText.executeOn(oControl);
		}

		QUnit.test("Should enter a text and preserve the value in a " + testInfo.Control.getMetadata().getName(), function (assert) {
			testBody.call(this, false, assert);
		});

		QUnit.test("Should enter a text and clear the value in a " + testInfo.Control.getMetadata().getName(), function (assert) {
			testBody.call(this, true, assert);
		});

	});

	QUnit.test("Should not fire enter on a control", function (assert) {
		this.oControl = new Input();
		var fnEnterSpy = sinon.spy(this.oControl, "onsapenter");

		this.oControl.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		new EnterText({ text: "foo" }).executeOn(this.oControl);

		sinon.assert.notCalled(fnEnterSpy);
	});

	opaTest("Should show suggestions", function (oOpa) {
		var fnSuggestTriggered = Opa5.assert.async();
		this.oControl = new Input({
			showSuggestion: true,
			suggestionItems: [
				new ListItem({ text: "One" }),
				new ListItem({ text: "Two" }),
				new ListItem({ text: "Test" })
			]
		});
		this.oControl.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var sTextInControl = "T";
		oOpa.waitFor({
			controlType: "sap.m.Input",
			actions: new EnterText({
				text: sTextInControl,
				keepFocus: true
			})
		});
		oOpa.waitFor({
			controlType: "sap.m.DisplayListItem",
			success: function (aItems) {
				Opa5.assert.strictEqual(aItems.length, 2, "Should show suggestions");
				Opa5.assert.strictEqual(this.oControl.getValue(), sTextInControl, "Should change input value");
				fnSuggestTriggered();
			}.bind(this)
		});
	});

	QUnit.module("Logging", {
		beforeEach: function () {
			this.oEnterText = new EnterText({});
			this.oDebugLog = sinon.spy(this.oEnterText.oLogger, "debug");
			this.oErrorLog = sinon.spy(this.oEnterText.oLogger, "error");
			this.oControl = new Input();
			this.oControl.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oDebugLog.restore();
			this.oErrorLog.restore();
			this.oControl.destroy();
		}
	});

	QUnit.test("Should log an error if a control is not rendered", function (assert) {
		this.oControl.destroy();
		sap.ui.getCore().applyChanges();

		this.oEnterText.setText("foo");

		assert.throws(function () {
			this.oEnterText.executeOn(this.oControl);
		}.bind(this), function (oError) {
			return !!oError.message.match(/has no focus DOM reference/);
		}, "Exception has been thrown");

		sinon.assert.calledWith(this.oErrorLog, sinon.match(/has no focus DOM reference/));
	});

	QUnit.test("Should log a message if a control cannot be focused", function () {
		this.oControl.setEnabled(false);
		sap.ui.getCore().applyChanges();

		this.oEnterText.setText("foo");
		this.oEnterText.executeOn(this.oControl);

		sinon.assert.calledWith(this.oDebugLog, sinon.match(/could not be focused/));
	});

	QUnit.test("Should log an error if no text is passed to EnterText", function () {
		this.oEnterText.executeOn(this.oControl);
		sinon.assert.calledWith(this.oErrorLog, sinon.match(/Please provide a text/));
	});


	QUnit.test("Should log an error if an empty text is passed to EnterText and clearTextFirst is false", function () {
		this.oEnterText.setText("");
		this.oEnterText.setClearTextFirst(false);
		this.oEnterText.executeOn(this.oControl);

		sinon.assert.calledWith(this.oErrorLog, sinon.match(/Please provide a text/));
	});


	QUnit.test("Should enter number with decimals in input of type number and preserve the value", function (assert) {
		var fnDone = assert.async();
		var sTextInControl = "12.4";

		this.oControl.setType(InputType.Number);
		this.oEnterText.setText(sTextInControl);

		this.oControl.attachEvent("change", function (oEvent) {
			assert.strictEqual(oEvent.getParameter("value"), sTextInControl, "Number with decimals is correct");
			fnDone();
		});

		this.oEnterText.executeOn(this.oControl);
	});

	QUnit.module("EnterText - interact with StepInput", {
		beforeEach: function () {
			this.oStepInput = new StepInput();
			this.oStepInput.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oStepInput.destroy();
		}
	});

	QUnit.test("Should enter text in StepInput - enter text adapter", function (assert) {
		var fnChangeTriggered = assert.async();
		var sTextInControl = 12;
		var oEnterText = new EnterText({ text: sTextInControl });

		this.oStepInput.attachEvent("change", function (oEvent) {
			assert.strictEqual(oEvent.getParameter("value"), sTextInControl, "Number is entered correctly");
			fnChangeTriggered();
		});

		oEnterText.executeOn(this.oStepInput);
	});

	QUnit.module("EnterText - input in popup", {
		beforeEach: function () {
			this.target = new Button({
				id: "open"
			});
			this.input1 = new Input({
				id: "test1"
			});
			this.input2 = new Input({
				id: "test2"
			});
			this.popover = new Popover({
				content: [
					this.input1,
					this.input2
				]
			});
			$("#qunit-fixture").css("position", "static");
			this.target.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.target.destroy();
			this.popover.destroy();
		}
	});

	QUnit.test("Should enter text in popup - popup should remain open", function (assert) {
		// test for BCP: 1980144873: problem in FF and IE11, where the popover was closed right after the text is entered
		var done = assert.async();
		this.popover.openBy(this.target);
		this.popover.$().css("display", "block");
		var enterText = new EnterText({
			text: "value",
			pressEnterKey: true
		});

		this.input1.attachEvent("change", function (oEvent) {
			assert.strictEqual(this.input1.getValue(), "value");
			assert.ok(this.popover.isOpen());

			setTimeout(function () {
				this.input2.attachEvent("change", function (oEvent) {
					assert.strictEqual(this.input2.getValue(), "value");
					assert.ok(this.popover.isOpen());

					setTimeout(function () {
						done();
					}, 100);
				}.bind(this));

				enterText.executeOn(this.input2);
			}.bind(this), 100);
		}.bind(this));

		enterText.executeOn(this.input1);
	});

});
