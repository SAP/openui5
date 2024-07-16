/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/Device",
	"sap/ui/core/InvisibleMessage",
	"sap/m/Input",
	"sap/m/InputBase",
	"sap/ui/core/Item",
	"sap/ui/core/SeparatorItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/ui/core/library",
	"sap/ui/core/Icon",
	"sap/ui/core/ListItem",
	"sap/ui/base/ObjectPool",
	"sap/m/Column",
	"sap/m/Label",
	"sap/m/ColumnListItem",
	"sap/m/library",
	"sap/m/InputRenderer",
	"sap/m/DialogRenderer",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/SuggestionItem",
	"sap/m/SuggestionsPopover",
	"sap/ui/core/IconPool",
	"sap/ui/events/KeyCodes",
	"sap/m/Link",
	"sap/m/Text",
	"sap/m/Toolbar",
	"sap/m/Page",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/FormattedText",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/nextUIUpdate",
	// provides jQuery.fn.zIndex
	"sap/ui/dom/jquery/zIndex"
], function(
	Element,
	Library,
	qutils,
	createAndAppendDiv,
	Device,
	InvisibleMessage,
	Input,
	InputBase,
	Item,
	SeparatorItem,
	JSONModel,
	Sorter,
	coreLibrary,
	Icon,
	ListItem,
	ObjectPool,
	Column,
	Label,
	ColumnListItem,
	mobileLibrary,
	InputRenderer,
	DialogRenderer,
	Dialog,
	Button,
	SuggestionItem,
	SuggestionsPopover,
	IconPool,
	KeyCodes,
	Link,
	Text,
	Toolbar,
	Page,
	Filter,
	FilterOperator,
	FormattedText,
	jQuery,
	nextUIUpdate
) {
	"use strict";

	// shortcut for sap.m.InputTextFormatMode
	var InputTextFormatMode = mobileLibrary.InputTextFormatMode;

	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	document.body.insertBefore(createAndAppendDiv("content"), document.body.firstChild);

	function getPopupItemsContent(oPopup) {
		var aContents = oPopup.getContent();
		return oPopup.isA("sap.m.Popover") ? aContents[0] : aContents[1];
	}

	function getVisibleItems (oPopup) {
		return getPopupItemsContent(oPopup).getItems().filter(function (oItem) {
			return oItem.getVisible();
		});
	}

	function runAllTimersAndRestore(oClock) {
		if (!oClock) {
			return;
		}

		oClock.runAll();
		oClock.restore();
	}

	const value = "value";

	QUnit.module("Basic", {
		beforeEach : async function() {
			this.oInput1 = new Input("i1");
			this.oInput1.placeAt("content");
			this.oInput1.setValue("ABCD");

			this.oInput2 = new Input("i2");
			this.oInput2.setType("Number");
			this.oInput2.placeAt("content");

			this.oInput3 = new Input("i3");
			this.oInput3.setVisible(false);
			this.oInput3.placeAt("content");

			this.oInput4 = new Input("i4");
			this.oInput4.setValueState("Error");
			this.oInput4.placeAt("content");

			this.oInput5 = new Input("i5");
			this.oInput5.setValueState("Warning");
			this.oInput5.placeAt("content");

			this.oInput8 = new Input("i8");
			this.oInput8.placeAt("content");

			await nextUIUpdate();

			this.i1 = Element.getElementById("i1");
			this.i2 = Element.getElementById("i2");
			this.i3 = Element.getElementById("i3");
			this.i4 = Element.getElementById("i4");
			this.i5 = Element.getElementById("i5");
			this.i8 = Element.getElementById("i8");
		},
		afterEach : function() {
			this.oInput1.destroy();
			this.oInput2.destroy();
			this.oInput3.destroy();
			this.oInput4.destroy();
			this.oInput5.destroy();
			this.oInput8.destroy();

			this.i1 = null;
			this.i2 = null;
			this.i3 = null;
			this.i4 = null;
			this.i5 = null;
			this.i8 = null;

			runAllTimersAndRestore(this.clock);
		}
	});

	// test property accessor methods
	QUnit.test("Value", function(assert) {
		this.i1.setValue(value);
		assert.equal(this.i1.getValue(), value, "Input value is " + value);
	});

	QUnit.test("InputType", function(assert) {
		var typeDefault = "Text";
		assert.equal(this.i1.getType(), typeDefault, "Input Type: Default");
	});

	QUnit.test("Inner input value - type password", async function(assert) {
		// Arrange
		this.clock = sinon.useFakeTimers();
		var oInput = new Input({
			type: "Password",
			value: "A"
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		var oInnerInput = oInput.getFocusDomRef();

		assert.notOk(oInnerInput.getAttribute("value"), "Value attribute is not rendered");
		assert.strictEqual(oInput.getProperty("value"), "A", "Value is correct");
		assert.strictEqual(oInnerInput.value, "A", "Initial value is set");

		// Act
		oInnerInput.focus();
		qutils.triggerKeydown(oInput._$input, KeyCodes.BACKSPACE);
		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.B });
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("BB").trigger("input");
		qutils.triggerKeydown(oInnerInput, KeyCodes.SPACE);
		qutils.triggerKeyup(oInnerInput, KeyCodes.SPACE);
		this.clock.tick();

		// Assert
		assert.notOk(oInnerInput.getAttribute("value"), "Value attribute is not rendered");
		assert.strictEqual(oInput.getValue(), "BB", "Value is updated correctly");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Type password - value not cleared on invalidation", async function(assert) {
		// Arrange
		var oInput = new Input({
			type: "Password",
			value: "Aaa"
		});

		oInput.placeAt("content");
		await nextUIUpdate();

		oInput.setType("Text");
		await nextUIUpdate();

		assert.strictEqual(oInput.getValue(), "Aaa", "Value is not changed");

		oInput.setType("Password");
		await nextUIUpdate();

		assert.strictEqual(oInput.getValue(), "Aaa", "Value is not changed");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Type password with showClearIcon - entered value is not corrupted", async function(assert) {
		// Arrange
		var oInput = new Input({
			type: "Password",
			showClearIcon: true
		});

		oInput.placeAt("content");
		await nextUIUpdate();

		// Act
		qutils.triggerEvent("focus", oInput.getFocusDomRef());
		qutils.triggerCharacterInput(oInput.getFocusDomRef(), "a");
		qutils.triggerEvent("input", oInput.getFocusDomRef());
		await nextUIUpdate();

		assert.strictEqual(oInput.getValue(), "a", "Value is as entered");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Type password with showClearIcon and initial value - input value is deleted", async function(assert) {
		// Arrange
		var oInput = new Input({
			type: "Password",
			showClearIcon: true,
			value: "a"
		});

		oInput.placeAt("content");
		await nextUIUpdate();

		// Act
		await oInput._$input.trigger("focus").val("").trigger("input");
		assert.strictEqual(oInput.getValue(), "", "Value is deleted");

		// Clean
		oInput.destroy();
	});



	QUnit.test("InputEnabled", function(assert) {
		var enabled = false;
		this.i1.setEnabled(enabled);
		assert.equal(this.i1.getEnabled(), enabled, "Input is disabled");
		enabled = true;
		this.i1.setEnabled(enabled);
		assert.equal(this.i1.getEnabled(), enabled, "Input is enabled");
	});

	QUnit.test("Placeholder", function(assert) {
		var placeholder = "Placeholder";
		this.i1.setPlaceholder(placeholder);
		assert.equal(this.i1.getPlaceholder(), placeholder, "Placeholder for text");

		this.i2.setPlaceholder(placeholder);
		assert.equal(this.i2.getPlaceholder(), placeholder, "Placeholder for number field");
	});

	QUnit.test("Visible", function(assert) {
		assert.equal(this.i1.$().length, 1, "Visible input found");
		assert.equal(this.i3.$().length, 0, "Invisible input not found");
	});

	QUnit.test("sTypedInValue", function(assert) {
		// Arrange / Act
		var oInput = new Input();

		// Assert
		assert.equal(oInput._getTypedInValue(), "", "_sTypedInValue is initially empty string");

		// Clean
		oInput.destroy();
	});

	QUnit.test("sTypedInValue - not reset onbefore rendering", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oInput = new Input();
		var oStub = this.stub(oInput, "_resetTypeAhead").callsFake(function () {
			this._sTypedInValue = "was reset";
		});

		oInput.placeAt('content');
		await nextUIUpdate(this.clock);

		// Act
		oInput.invalidate();
		this.clock.tick();

		// Assert
		assert.equal(oStub.callCount, 0, "resetTypeAhead was not called even when the control was invalidated.");
		assert.equal(oInput._getTypedInValue(), "", "'_sTypedInValue' is still an empty string");

		// Clean
		oInput.destroy();
	});

	QUnit.test("sTypedInValue should be reset when setValue API is used", function(assert) {
		// Arrange
		var oInput = new Input();
		oInput._setTypedInValue("not empty");

		// Act
		oInput.setValue("");

		// Assert
		assert.equal(oInput._getTypedInValue(), "", "_sTypedInValue is initially empty string");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Change", async function(assert) {
		this.i1.setValue("new");
		await nextUIUpdate();
		this.i1.attachChange(function() {
			assert.equal(this.getValue(), "new", "New value in onChange");
		});
		this.i1.onChange(jQuery.Event("change"));
		assert.equal(this.i1.getValue(),"new", "Value after onchange");
	});

	QUnit.test("Event order", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oInput = new Input({
				showSuggestion: true
			}),
			oPopup, // is lazy loaded
			aNames = ["abcTom", "abcPhilips", "abcAnna"],
			aItemAdded = [],
			i,
			bSuggestionItemSelectedEventCalled = false,
			bChangeEventCalled = false;

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.attachSuggest(function(){
			for (i = 0; i < aNames.length; i++){
				if (!aItemAdded.includes(aNames[i])){
					oInput.addSuggestionItem(new Item({text: aNames[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});
		oInput.attachSuggestionItemSelected(function (oEvent) {
			assert.ok(!bChangeEventCalled, "Change event is not called yet when SuggestionItemSelectedEvent is called");
			assert.ok(!bSuggestionItemSelectedEventCalled, "SuggestionItemSelected event is called once");
			bSuggestionItemSelectedEventCalled = true;
		});
		oInput.attachChange(function (oEvent) {
			assert.ok(bSuggestionItemSelectedEventCalled, "SuggestionItemSelected event has been called before the change event");
			assert.ok(!bChangeEventCalled, "Change event is called once");
			bChangeEventCalled = true;
		});

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("abc").trigger("input");
		this.clock.tick(500);
		oPopup = oInput._getSuggestionsPopover().getPopover();

		oInput.$().trigger("focusout");
		qutils.triggerTouchEvent("tap", getPopupItemsContent(oPopup).getItems()[1].getDomRef());
		this.clock.tick(500);

		oInput.destroy();
	});

	QUnit.test("valueLiveUpdate", function(assert) {

		var oModel = new JSONModel({testValue: ""});
		this.oInput8.setModel(oModel);
		this.oInput8.bindValue("/testValue");

		var fnFireChangeSpy = this.spy(this.i8, "fireChange");
		this.i8.setValueLiveUpdate(false);
		this.i8.setValue("");
		this.i8.focus();
		qutils.triggerCharacterInput(this.i8.getFocusDomRef(), "a");
		qutils.triggerEvent("input", this.i8.getFocusDomRef());

		assert.equal(oModel.getProperty("/testValue"),"" , "no valueLiveUpdate, no model value update");
		assert.equal(this.i8.getValue()                   ,"a", "no valueLiveUpdate, new value");
		assert.equal(fnFireChangeSpy.callCount       , 0 , "no valueLiveUpdate, no change event");

		qutils.triggerKeydown(this.i8.getFocusDomRef(), "ENTER");

		assert.equal(this.i8.getValue()                   ,"a", "no valueLiveUpdate, Enter, same new value");
		assert.equal(oModel.getProperty("/testValue"),"a", "no valueLiveUpdate, Enter, model value update");
		assert.equal(fnFireChangeSpy.callCount       , 1 , "no valueLiveUpdate, Enter, change event");

		this.i8.setValueLiveUpdate(true);
		this.i8.setValue("");
		fnFireChangeSpy.reset();
		qutils.triggerCharacterInput(this.i8.getFocusDomRef(), "a");
		qutils.triggerEvent("input", this.i8.getFocusDomRef());
		assert.equal(oModel.getProperty("/testValue"),"a", "valueLiveUpdate, no model value update");
		assert.equal(this.i8.getValue()                   ,"a", "valueLiveUpdate, new value");
		assert.equal(fnFireChangeSpy.callCount       , 0,  "valueLiveUpdate, stil no change event");

		qutils.triggerKeydown(this.i8.getFocusDomRef(), "ENTER");

		assert.equal(oModel.getProperty("/testValue"),"a", "valueLiveUpdate, no model value update");
		assert.equal(this.i8.getValue()                   ,"a", "no valueLiveUpdate, Enter, change");
		assert.equal(fnFireChangeSpy.callCount       , 1,  "no valueLiveUpdate, Enter, changeevent");

		this.i8.setValueLiveUpdate(false);
		fnFireChangeSpy.reset();
		oModel.destroy();
	});

	QUnit.test("Value States", async function(assert) {

		assert.equal(this.i4.$("content").hasClass('sapMInputBaseContentWrapperError'), true, "Before new value state : Error");
		assert.equal(this.i5.$("content").hasClass('sapMInputBaseContentWrapperWarning'), true, "Before new value state : Warning");
		assert.equal(this.i4.$().attr("title"), undefined, "No tooltip for error state");
		assert.equal(this.i5.$().attr("title"), undefined, "No tooltip for warning state");

		this.i4.setValueState("Warning");
		this.i5.setValueState("Error");
		this.i8.setValueState("Information");
		await nextUIUpdate();

		assert.equal(this.i4.$("content").hasClass('sapMInputBaseContentWrapperWarning'), true, "After new value state : Warning");
		assert.equal(this.i5.$("content").hasClass('sapMInputBaseContentWrapperError'), true, "After new value state : Error");
		assert.equal(this.i8.$("content").hasClass('sapMInputBaseContentWrapperInformation'), true, "After new value state : Information");

		this.i4.setValueState();
		this.i5.setValueState("None");

		assert.equal(this.i4.getValueState(), "None", "Last value state : None");
		assert.equal(this.i5.getValueState(), "None", "Last value state : None");
		assert.equal(this.i5.$().attr("title"), undefined, "Tooltip is empty for valueState \"None\"");
	});

	QUnit.test("Value Help Indicator", async function(assert) {
		var spy = this.spy(),
			oInput = new Input( {
				valueHelpRequest: spy
			});

		// place control
		oInput.placeAt("content");

		// first check if value help indicator classes are not set by default
		assert.ok(oInput.$().children(".sapMInputValHelp").length === 0, "Has no outer value help indicator element");
		assert.ok(oInput.$().children(".sapMInputValHelpInner").length === 0, "Has no inner value help indicator element");

		// set value help indicator to true
		oInput.setShowValueHelp(true);
		await nextUIUpdate();

		// screen reader announcement for F4, there should be at least one description
		var describedById = oInput.getFocusDomRef().getAttribute("aria-describedby");
		var aLabels = describedById.split(' ');
		var bLabelsExist = aLabels.every(function(id){
			return !!document.getElementById(id);
		});
		assert.ok(!!describedById, "At least one described by ID is set for screen reader");
		assert.ok(bLabelsExist, "All screen reader descriptions are rendered in DOM");

		// event check
		oInput.getAggregation("_endIcon")[0].firePress();
		assert.strictEqual(spy.callCount, 1, "Value Help Request has been fired and received successfully");
		oInput.destroy();
	});

	QUnit.test("Value help icon role should be 'button' and area-label attribute should be set", async function(assert) {
		// Arrange
		var oInput = new Input({
			showSuggestion: true,
			showValueHelp: true
		}), oValueHelpIcon;

		// Act
		oInput.placeAt("content");
		await nextUIUpdate();

		oValueHelpIcon = document.getElementById(oInput._getValueHelpIcon().sId);

		// Assert
		assert.strictEqual(oValueHelpIcon.getAttribute("role"), "button", "The value help icon role attribute is correctly set to 'button'");
		assert.strictEqual(oValueHelpIcon.getAttribute("aria-label"), Library.getResourceBundleFor("sap.m").getText("INPUT_VALUEHELP_BUTTON"), "The value help icon aria-label attribute is correctly set");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Custom value help icon should be set", async function(assert) {
		// Arrange
		var oInput = new Input({
			showSuggestion: true,
			showValueHelp: true,
			valueHelpIconSrc: "sap-icon://arrow-down"
		});

		// Act
		oInput.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oInput._getValueHelpIcon().getSrc(), "sap-icon://arrow-down", "The value help icon is a custom one");

		//Act
		oInput.setValueHelpIconSrc("sap-icon://value-help");

		// Assert
		assert.strictEqual(oInput._getValueHelpIcon().getSrc(), "sap-icon://value-help", "The value help icon is changed");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Keyboard Handling", function(assert) {
		// F4 event check
		var evt = jQuery.Event("sapshow"),
			spy = this.spy(),
			oInput = new Input( {
				showValueHelp: true,
				valueHelpRequest: spy
			});

		oInput.onsapshow(evt);
		assert.strictEqual(spy.callCount, 1, "The value help was requested by pressing F4");
		oInput.destroy();
	});

	QUnit.test("Value help _userInputValue request parameter with suggestions", function(assert) {
		// Arrange
		var oInput = new Input({
				showValueHelp: true,
				showSuggestion: true
			}),
			oSpy = sinon.spy(oInput, "fireValueHelpRequest");

		oInput._sTypedInValue = "test";

		// Act
		oInput._fireValueHelpRequest();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "The value help was called once");
		assert.strictEqual(oSpy.firstCall.args[0]._userInputValue, "test", "The value for user input was the correct one");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Value help fromKeyboard request parameter with keyboard and click", async function(assert) {
		// Arrange
		const oInput = new Input({
				showValueHelp: true,
				showSuggestion: true
			}),
			oSpy = sinon.spy(oInput, "fireValueHelpRequest");
			oInput.placeAt("content");

		const	oMockEvent = {
				preventDefault: () => {},
				stopPropagation: () => {}
			};

		await nextUIUpdate();

		const oValueHelpIcon = oInput._getValueHelpIcon();
		oValueHelpIcon.firePress();

		// Assert
		assert.notOk(oSpy.firstCall.args[0].fromKeyboard, "The value for 'fromKeyboard' was false when value help was requested by click");

		oInput.onsapshow(oMockEvent);

		assert.ok(oSpy.secondCall.args[0].fromKeyboard, "The value for 'fromKeyboard' was true when value help was requested by keyboard");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Value help _userInputValue request parameter without suggestions", async function(assert) {
		// Arrange
		var oInput = new Input({
				showValueHelp: true,
				showSuggestion: false,
				value: "test"
			}),
			oSpy = sinon.spy(oInput, "fireValueHelpRequest");

		oInput.placeAt("content");
		await nextUIUpdate();

		// Act
		oInput._fireValueHelpRequest();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "The value help was called once");
		assert.strictEqual(oSpy.firstCall.args[0]._userInputValue, "test", "The value for user input was the correct one");

		// Clean
		oInput.destroy();
	});

	QUnit.test("No error is thrown when showSuggestion is set to false", async function (assert) {
		var oInput = new Input({
				showValueHelp: true
			}),
			oSuggPopover = oInput._getSuggestionsPopover(),
			oUpdateSpy = new sinon.spy(oSuggPopover, "updateValueState");

		// Arrange
		oInput.setShowSuggestion(false);
		await nextUIUpdate();

		// Act
		try {
			oInput.setValueState("Error");
		} catch (e) {
			// continue
		}
		await nextUIUpdate();

		// Assert
		assert.ok(!oUpdateSpy.threw(), "No error was thrown.");

		// Clean
		oUpdateSpy.restore();
		oInput.destroy();
	});

	QUnit.test("Tabular suggestions onsapenter should clear the _sTypedInValue", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oInput = new Input({
			showSuggestion: true,
			suggestionColumns : [
				new Column({
					styleClass : "name",
					hAlign : "Begin",
					header : new Label({
						text : "Test"
					})
				})
			],
			suggestionRows : [
				new ColumnListItem({
					cells: [
						new Text({text:"Text 1"})
					]
				})
			]
		});
		var oSpy = this.spy(oInput, "_resetTypeAhead");

		// Arrange
		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		qutils.triggerCharacterInput(oInput.getFocusDomRef(), "t");
		qutils.triggerEvent("input", oInput.getFocusDomRef());
		oInput._openSuggestionPopup();
		this.clock.tick();

		// Assert
		assert.strictEqual(oInput._getTypedInValue(), "t", "Typed in value stored initially");

		// Act
		oSpy.reset();
		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ENTER);
		this.clock.tick();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "The _resetTypeAhead was called once, when the item was pressed.");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Submit Event", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var sEvents = "";
		var sValue = "";
		var oInput = new Input("hello", {
			submit: function(oEvent){
				sEvents += "E";
				sValue = oEvent.getParameter("value");
			},
			change: function(){
				sEvents += "C";
			}
		});
		oInput.placeAt("content");

		// change event should be fired only when the input is on focus
		oInput.onfocusin();
		await nextUIUpdate(this.clock);

		function checkSubmit(sText, bSubmitExpected, bChangeExpected, sExpectedValue) {
			var e = "";
			if (bChangeExpected) {
				e += "C";
			}
			if (bSubmitExpected) {
				e += "E";
			}

			sEvents = "";
			sValue = "";
			qutils.triggerKeydown(oInput.getDomRef("inner"), KeyCodes.ENTER);
			assert.equal(sEvents, e, sText + ": Correct number of events fired and order correct: " + e.length + (e.length > 0 ? "/" + e : ""));
			if (bSubmitExpected) {
				if (sExpectedValue) {
					assert.equal(sValue, sExpectedValue, sText + ": Correct parameter 'value' in enter event: " + sExpectedValue);
				} else {
					assert.ok(!sValue, sText + ": Correct parameter 'value' in enter event: Value empty");
				}
			}
		}

		checkSubmit("Enter pressed without change", true, false, "");
		oInput.$("inner").val("hello");
		await nextUIUpdate(this.clock);

		checkSubmit("Enter pressed after change", true, true, "hello");
		oInput.setEnabled(false);
		await nextUIUpdate(this.clock);

		checkSubmit("Enter pressed on disabled field", false, false);
		oInput.setEnabled(true);
		oInput.setEditable(false);
		await nextUIUpdate(this.clock);

		checkSubmit("Enter pressed on readonly field", false, false);
		oInput.setEditable(true);
		oInput.setShowValueHelp(true);
		await nextUIUpdate(this.clock);

		checkSubmit("Enter pressed on field with value help", true, false, "hello");

		// Enter on Suggestions
		if (Device.system.desktop) {
			oInput.setShowSuggestion(true);
			await nextUIUpdate(this.clock);

			var aItemsAdded = [];
			oInput.attachSuggest(function() {
				var aNames = ["abcTom", "abcPhilips", "abcAnna"];
				for (var i = 0; i < aNames.length; i++) {
					if (!aItemsAdded.includes(aNames[i])){
						oInput.addSuggestionItem(new Item({text: aNames[i]}));
						aItemsAdded.push(aNames[i]);
					}
				}
			});
			await nextUIUpdate(this.clock);

			oInput.onfocusin();
			oInput._$input.trigger("focus").val("abc").trigger("input");
			this.clock.tick(500);
			await nextUIUpdate(this.clock);

			assert.ok(oInput._getSuggestionsPopover() && oInput._getSuggestionsPopover().getPopover().isOpen && oInput._getSuggestionsPopover().getPopover().isOpen(), "Suggestion Popup is open now");
			qutils.triggerKeydown(oInput.getDomRef("inner"), KeyCodes.ARROW_DOWN);
			checkSubmit("Enter pressed on open Suggestions", true, true, "abcTom");
			assert.ok(oInput._getSuggestionsPopover() && oInput._getSuggestionsPopover().getPopover().isOpen && !oInput._getSuggestionsPopover().getPopover().isOpen(), "Suggestion Popup should be closed");
		}

		oInput.destroy();
	});

	QUnit.test("Suggestion output", async function (assert) {

		this.clock = sinon.useFakeTimers();
		var sValue = "";
		var sSuggestion = "<img  src=''></img>";
		var oInput = new Input("hello", {
			type: 'Text',
			showSuggestion: true,
			submit: function (oEvent) {
				sValue = oEvent.getParameter("value");
			}
		});
		oInput.placeAt("content");

		// Enter on Suggestions
		if (Device.system.desktop) {
			oInput.setShowSuggestion(true);
			oInput.attachSuggest(function () {
				oInput.addSuggestionItem(new ListItem({text: sSuggestion}));
			});
			await nextUIUpdate(this.clock);

			oInput.onfocusin();
			oInput._$input.trigger("focus").val(" ").trigger("input");
			this.clock.tick(500);

			qutils.triggerKeydown(oInput.getDomRef("inner"), KeyCodes.ARROW_DOWN);
			await nextUIUpdate(this.clock);
			qutils.triggerKeydown(oInput.getDomRef("inner"), KeyCodes.ENTER);
			assert.equal(sValue, sSuggestion, ": Correct parameter 'value' in enter event");
		}

		oInput.destroy();
	});

	QUnit.test("Check step attribute", function(assert) {
		assert.strictEqual(document.getElementById("i1-inner").getAttribute("step"), null, "Input of type \"Text\" have no step attribute set");
		assert.strictEqual(document.getElementById("i2-inner").getAttribute("step"), "any", "Input of type \"Number\" have step attribute set to \"any\"");
	});

	QUnit.test("ESC should reset back to old value when valueLiveUpdate is true.", async function(assert) {

		// Arrange
		var sInitValue = "Test",
			sNewValue = "Testa";

		var oInput = new Input({
			value: sInitValue,
			valueLiveUpdate: true
		});
		oInput.placeAt("content");
		await nextUIUpdate();

		// Act
		qutils.triggerCharacterInput(oInput.getFocusDomRef(), "a");
		qutils.triggerEvent("input", oInput.getFocusDomRef());

		// Assert- before escape
		assert.strictEqual(oInput.getValue(), sNewValue, "Before escape - getValue should return the NEW value.");
		assert.strictEqual(oInput.getFocusDomRef().value, sNewValue, "Before escape - DOM value should be the same as the NEW value.");
		assert.strictEqual(oInput.getProperty("value"), sNewValue, "Before escape - getProperty(value) should return the NEW value.");

		// Act
		qutils.triggerKeydown(oInput.getFocusDomRef(), "ESCAPE");

		// Assert - after escape
		assert.strictEqual(oInput.getValue(), sInitValue, "After escape - getValue should return the INITIAL value.");
		assert.strictEqual(oInput.getFocusDomRef().value, sInitValue, "After escape - DOM value should be the same as the INITIAL value.");
		assert.strictEqual(oInput.getProperty("value"), sInitValue, "After escape - getProperty(value) should return the INITIAL value.");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("ESC should reset the value to the user's input when suggestions are shown.", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oInput = new Input({
			showSuggestion: true,
			suggestionItems: [
				new Item({key: "key1", text: "Text 1"}),
				new Item({key: "key2", text: "Text 2"}),
				new Item({key: "key3", text: "Text 3"})
			]
		});
		var oSetSpy = sinon.spy(oInput, "setValue");
		var oGetSpy = sinon.spy(oInput, "_getTypedInValue");

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput._bDoTypeAhead = true;
		qutils.triggerEvent("focus", oInput.getFocusDomRef());
		qutils.triggerCharacterInput(oInput.getFocusDomRef(), "Te");
		qutils.triggerEvent("input", oInput.getFocusDomRef());
		oInput._getSuggestionsPopover().getPopover().open();
		this.clock.tick(300);

		// Act
		oSetSpy.reset();
		oGetSpy.reset();
		qutils.triggerKeydown(oInput.getDomRef(), KeyCodes.ESCAPE);
		this.clock.tick(300);

		// Assert
		assert.strictEqual(oGetSpy.called, true, "_getTypedInValue was called.");
		assert.strictEqual(oGetSpy.firstCall.returnValue, "Te", "_getTypedInValue returned the correct result.");
		assert.strictEqual(oSetSpy.callCount, 1, "Input's value was set once.");
		assert.strictEqual(oSetSpy.firstCall.args[0], "Te", "The input's value was reset to the initially typed by the user input.");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("ESC should reset the _sProposedItemText property to 'null'", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oInput = new Input({
			showSuggestion: true,
			suggestionItems: [
				new Item({key: "key1", text: "Text 1"}),
				new Item({key: "key2", text: "Text 2"}),
				new Item({key: "key3", text: "Text 3"})
			]
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput._bDoTypeAhead = true;
		qutils.triggerEvent("focus", oInput.getFocusDomRef());
		qutils.triggerCharacterInput(oInput.getFocusDomRef(), "Te");
		qutils.triggerEvent("input", oInput.getFocusDomRef());
		oInput._getSuggestionsPopover().getPopover().open();
		this.clock.tick(300);

		// Act
		qutils.triggerKeydown(oInput.getDomRef(), KeyCodes.ESCAPE);
		this.clock.tick(300);

		// Assert
		assert.strictEqual(oInput._sProposedItemText, null, "_sProposedItemText was set to 'null'.");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("Check _DEFAULTRESULT_TABULAR function.", function(assert) {
		assert.strictEqual(Input._DEFAULTRESULT_TABULAR({ isA: function() {
			return true;
		}}), "", "Should return empty string");
		assert.strictEqual(Input._DEFAULTRESULT_TABULAR(), "", "Should return empty string");
	});

	QUnit.module("Destroy", {
		afterEach: function(){
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Destroy DOM", async function(assert) {
		var oInput = new Input({
			showSuggestion: false
		}),
		$Input;

		oInput.placeAt("content");
		await nextUIUpdate();
		$Input = oInput.$();

		assert.strictEqual($Input.length, 1, "Before destroy input is rendered in DOM");
		oInput.destroy();
		$Input = oInput.$();

		assert.strictEqual($Input.length, 0, "After destroy input DOM node is removed");
		oInput.destroy();
	});

	QUnit.test("Destroy Suggestion List and Popup", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oInput = new Input({
				showSuggestion: true
			});

		var aData = [
				{name: "Dente, Al", userid: "U01"},
				{name: "Friese, Andy", userid: "U02"},
				{name: "Mann, Anita", userid: "U03"},
				{name: "Schutt, Doris", userid: "U04"},
				{name: "Open, Doris", userid: "U05"},
				{name: "Dewit, Kenya", userid: "U06"},
				{name: "Zar, Lou", userid: "U07"},
				{name: "Burr, Tim", userid: "U08"},
				{name: "Hughes, Tish", userid: "U09"},
				{name: "Town, Mo", userid: "U10"},
				{name: "Case, Justin", userid: "U11"},
				{name: "Time, Justin", userid: "U12"},
				{name: "Barr, Sandy", userid: "U13"},
				{name: "Poole, Gene", userid: "U14"},
				{name: "Ander, Corey", userid: "U15"},
				{name: "Early, Brighton", userid: "U16"},
				{name: "Noring, Constance", userid: "U17"},
				{name: "O'Lantern, Jack", userid: "U18"},
				{name: "Tress, Matt", userid: "U19"},
				{name: "Turner, Paige", userid: "U20"}
			];

		var oModel = new JSONModel();
		oModel.setData(aData);

		oInput.setModel(oModel);
		oInput.bindAggregation("suggestionItems", "/", new Item({text: "{name}"}));

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("De").trigger("input");
		this.clock.tick(300);

		oInput.destroy();
		assert.ok(oInput._oSuggPopover === null || oInput._oSuggPopover === undefined, "The internal popup is destroyed");
	});

	// BCP - 2070197223
	QUnit.test("Should handle cases when there is no SuggestionPopover and _openSuggestionPopup is called", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oSpy,
			oInput = new Input({
				type: "Text",
				showSuggestion: true
			});
		await nextUIUpdate(this.clock);

		oSpy = sinon.spy(oInput, "_openSuggestionsPopover");
		// Arrange
		var oSystem = {
			desktop: true,
			phone: false,
			tablet: false
		};

		this.stub(Device, "system").value(oSystem);
		// Act
		oInput._openSuggestionPopup();
		oInput._oSuggPopover = null;
		this.clock.tick(300);

		// Assert
		assert.equal(oSpy.callCount, 0, "The _openSuggestionsPopover should not be called");

		// cleanup
		oSpy.restore();
		oInput.destroy();
	});

	QUnit.module("Suggestions", {
		beforeEach: function(){
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function() {
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Suggestions deactivated and aggregations are not filled - list and popup should not be initialized", async function (assert) {
		var oInput = new Input({
				showSuggestion: false
			}),
			oSpy = this.spy(oInput, "_openSuggestionPopup");

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("abc").trigger("input");
		this.clock.tick(300);

		// suggestions are not active, list and popup should not be initialized
		assert.strictEqual(oInput._getSuggestionsPopover().getItemsContainer(), undefined, "The internal list is not initialzed when suggestions are set to false");
		assert.notOk(oSpy.callCount, "The internal popup is not triggered when suggestions are set to false");

		oInput.destroy();
	});

	QUnit.test("setShowSuggestions switching of the items container", async function (assert) {
		var oModel = new JSONModel({
				items: [
					{key: "key1 {{}}{}", value: "test1 {{}}", group: "1 {{{}}"},
					{key: "key2", value: "test2", group: "1 {{{}}"},
					{key: "key3", value: "test3", group: "2 {{{}}"},
					{key: "key4", value: "test4", group: "2 {{{}}"}
				],
				columns: [
					{columnLabel: "Text"},
					{columnLabel: "Key"}
				]
			}),
			oInput = new Input({
				value: "tes",
				showSuggestion: true,
				suggestionItems: {
					path: "/items",
					template: new Item({key: "{key}", text: "{value}"}),
					sorter: [new Sorter('group', false, true)]
				}
			}).setModel(oModel).placeAt("content");
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(oInput._getSuggestionsPopover().getItemsContainer().isA("sap.m.List"), "The container is a sap.m.List");

		// Act
		oInput.bindSuggestionRows({
			path: "/items",
			template: new ColumnListItem({
				cells: [
					new Text({text:"{value}"}),
					new Text({text:"{key}"})
				]
			}),
			sorter: [new Sorter('group', false, true)]
		});
		oInput.bindSuggestionColumns({
			path: "/columns",
			template: new Column({
				header: new Label({text: "{columnLabel}"})
			})
		});
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(oInput._getSuggestionsPopover().getItemsContainer().isA("sap.m.Table"), "The container is a sap.m.Table");

		oInput.destroy();
	});

	QUnit.test("setShowSuggestions openning the popover", async function (assert) {
		var oModel = new JSONModel({
				items: [
					{key: "key1 {{}}{}", value: "test1 {{}}", group: "1 {{{}}"},
					{key: "key2", value: "test2", group: "1 {{{}}"},
					{key: "key3", value: "test3", group: "2 {{{}}"},
					{key: "key4", value: "test4", group: "2 {{{}}"}
				],
				columns: [
					{columnLabel: "Text"},
					{columnLabel: "Key"}
				]
			}),
			oInput = new Input({
				value: "tes",
				showSuggestion: true,
				suggestionItems: {
					path: "/items",
					template: new Item({key: "{key}", text: "{value}"}),
					sorter: [new Sorter('group', false, true)]
				}
			}).setModel(oModel).placeAt("content"),
			oOpenerSpy = this.spy(oInput, "_openSuggestionsPopover");
		await nextUIUpdate(this.clock);

		// Act
		oInput._openSuggestionPopup();
		this.clock.tick(300);

		// Assert
		assert.ok(oOpenerSpy.calledOnce, "The suggestionsPopover has been opened");

		// Cleanup
		oOpenerSpy.reset();
		oInput._hideSuggestionPopup();
		this.clock.tick(300);

		// Act
		oInput.setShowSuggestion(false);
		oInput._openSuggestionPopup();
		this.clock.tick(300);

		// Assert
		assert.notOk(oOpenerSpy.calledOnce, "The suggestionsPopover opener has been prevented");

		// Act
		oInput.setShowSuggestion(true);
		oInput._openSuggestionPopup();
		this.clock.tick(300);

		// Assert
		assert.ok(oOpenerSpy.calledOnce, "The suggestionsPopover has been opened");

		// Cleanup
		oInput._hideSuggestionPopup();
		this.clock.tick(300);
		oInput.destroy();
	});

	QUnit.test("Suggestion on Desktop", async function(assert){
		var oInput = new Input("i6", {
			showSuggestion: true
		});
		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		var oPopup, // is lazy loaded
			aNames = ["abcTom", "abcPhilips", "abcAnna"],
			aItemAdded = [],
			i;

		oInput.attachSuggest(function(){
			for (i = 0; i < aNames.length; i++){
				if (!aItemAdded.includes(aNames[i])){
					oInput.addSuggestionItem(new Item({text: aNames[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});

		await nextUIUpdate(this.clock);

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("abc").trigger("input");

		this.clock.tick(500);

		oPopup = oInput._getSuggestionsPopover().getPopover();
		assert.ok(oPopup.isA("sap.m.Popover"), "Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");
		assert.equal(getPopupItemsContent(oPopup).getItems().length, aNames.length, "Suggestions are inserted");
		assert.ok(getPopupItemsContent(oPopup).isA("sap.m.List"), "Suggestions are list-based)");

		oInput._$input.trigger("focus").val("abcT").trigger("input");
		this.clock.tick(400);
		assert.ok(oPopup.isOpen(), "Suggestion Popup is still open now");
		assert.equal(getVisibleItems(oPopup).length, 1, "Suggestions are filtered");

		//close the popoup when nothing is typed in input
		oInput._$input.trigger("focus").val("").trigger("input");
		this.clock.tick(300);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup is closed");

		oInput.destroy();
	});

	QUnit.test("Suggestion on Desktop - enter key pressed before the first suggest event", async function(assert){
		var oInput = new Input({
				showSuggestion: true
			}),
			oSpy = this.spy();

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.attachSuggest(oSpy);

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("abc").trigger("input");
		// Enter key is pressed directly after typing "abc"
		qutils.triggerKeydown(oInput._$input[0], KeyCodes.ENTER);

		this.clock.tick(300);

		assert.equal(oSpy.callCount, 0, "Suggest event listener shouldn't be called");

		oInput.destroy();
	});

	QUnit.test("Suggestion on Desktop - Close with enter key", async function(assert){
		var oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			};

		this.stub(Device, "system").value(oSystem);

		var oPopup, // is lazy loaded
			aNames = ["abcTom", "abcPhilips", "abcAnna"],
			aItemAdded = [],
			i;

		var oInput = new Input({
			showSuggestion: true,
			suggest: function(){
				for (i = 0; i < aNames.length; i++){
					if (!aItemAdded.includes(aNames[i])) {
						oInput.addSuggestionItem(new Item({text: aNames[i]}));
						aItemAdded.push(aNames[i]);
					}
				}
			}
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("abc").trigger("input");

		this.clock.tick(500);

		oPopup = oInput._getSuggestionsPopover().getPopover();
		assert.ok(oPopup.isA("sap.m.Popover"), "Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		qutils.triggerKeydown(oInput.getDomRef(), KeyCodes.ENTER);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup should be closed");

		oInput.destroy();
	});

	QUnit.test("Suggestion on Desktop with change event handler", async function(assert){
		var fnCallback = this.spy(),
			aNames = ["abcTom", "abcPhilips", "abcAnna"],
			aItemAdded = [],
			i;

		var oInput = new Input({
			showSuggestion: true,
			enabled: true,
			change: fnCallback
		});

		// stub the returnObject function from ObjectPool.prototype in order to trace the event parameter
		this.stub(ObjectPool.prototype, "returnObject");

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.attachSuggest(function(){
			for (i = 0; i < aNames.length; i++) {
				if (!aItemAdded.includes(aNames[i])){
					oInput.addSuggestionItem(new Item({text: aNames[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("abc").trigger("input");

		this.clock.tick(500);

		var oPopup = oInput._getSuggestionsPopover().getPopover();
		assert.ok(oPopup.isA("sap.m.Popover"), "Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		var oItem = oInput._getSuggestionsPopover().getPopover().getContent()[0].getItems()[0];
		assert.ok(oItem, "Item should be created");

		oItem.focus();
		oItem.$().trigger("tap");

		this.clock.tick(50);

		assert.equal(fnCallback.callCount, 1, "change event handler only called once");
		var spyCall = fnCallback.getCall(0);
		assert.equal(spyCall.args[0].getParameter("value"), "abcTom", "change event fired with the right parameter");
		oInput.destroy();
	});

	QUnit.test("Suggestion on Desktop with change event handler (focus on next input)", async function(assert){
		var fnCallback = this.spy(),
			aNames = ["abcTom", "abcPhilips", "abcAnna"],
			aItemAdded = [],
			i;

		var oInput = new Input({
			showSuggestion: true,
			change: fnCallback
		});

		var oNextInput = new Input();

		// stub the returnObject function from ObjectPool.prototype in order to trace the event parameter
		this.stub(ObjectPool.prototype, "returnObject");

		oInput.placeAt("content");
		oNextInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.attachSuggest(function(){
			for (i = 0; i < aNames.length; i++){
				if (!aItemAdded.includes(aNames[i])){
					oInput.addSuggestionItem(new Item({text: aNames[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("abc").trigger("input");

		this.clock.tick(500);

		var oPopup = oInput._getSuggestionsPopover().getPopover();
		assert.ok(oPopup.isA("sap.m.Popover"), "Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		oNextInput.focus();
		this.clock.tick(300);

		assert.equal(fnCallback.callCount, 1, "change event handler only called once");
		var spyCall = fnCallback.getCall(0);
		assert.equal(spyCall.args[0].getParameter("value"), "abc", "change event fired with the right parameter");
		oInput.destroy();
		oNextInput.destroy();
	});

	QUnit.test("Suggestion on Desktop should allow focus to be set into the suggestion item", async function(assert){
		var oPopup;

		var oModel = new JSONModel({
			names: [
				{ name: "abcTom" },
				{ name: "abcPhilips" },
				{ name: "abcAnna" }
			]
		});

		var oInput = new Input("sInput", {
			showSuggestion: true,
			showTableSuggestionValueHelp: false,
			suggestionRows: {
				path: "/names",
				template: new ColumnListItem("suggestionItem", {
					cells: [new Link("link", {
						text: "{name}"
					})]
				})
			},
			suggestionColumns: [new Column({
				hAlign: "Begin"
			})]
		});

		oInput.setModel(oModel);

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("abc").trigger("input");

		this.clock.tick(500);

		oPopup = oInput._getSuggestionsPopover().getPopover();
		assert.ok(oPopup.isA("sap.m.Popover"), "Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		// set focus into the suggestion popup
		var oLink = Element.getElementById("link-sInput-0");
		oLink.focus();
		this.clock.tick(100);

		assert.equal(document.activeElement, oLink.getFocusDomRef(), "The focus should stay on the link");

		oInput.destroy();
	});

	QUnit.test("Two Value Suggestion on Desktop", async function(assert){
		var oInput = new Input({
			showSuggestion: true
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		var oPopup1,
			aItems,
			aNames = ["abcTom", "abcPhilips", "abcAnna"],
			aDescription = ["Heidelberg", "Mannheim", "Paris"],
			aItemAdded = [],
			i;

		oInput.attachSuggest( async function(){
			for (i = 0; i < aNames.length; i++){
				if (!aItemAdded.includes(aNames[i])){
					oInput.addSuggestionItem(new ListItem({text: aNames[i], additionalText: aDescription[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
			await nextUIUpdate();
		});

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("abc").trigger("input");
		await nextUIUpdate(this.clock);

		this.clock.tick(500);
		oPopup1 = oInput._getSuggestionsPopover().getPopover();
		aItems = oPopup1.getContent()[0].getItems();

		assert.ok(oPopup1.isA("sap.m.Popover"), "Two Value Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup1.isOpen(), "Two Value Suggestion Popup is open now");
		assert.equal(aItems.length, aNames.length, "Suggestions are inserted");
		assert.ok(aItems[0].isA("sap.m.StandardListItem"), "Suggestion item is a StandardListItem");
		assert.ok(aItems[0].getTitle(), aNames[0], "Suggestion item has a title set equal to the ListItem's text");
		assert.ok(aItems[0].getInfo(), aDescription[0], "Suggestion item has an info set equal to the ListItem's additionalText");

		oInput._$input.trigger("focus").val("abcT").trigger("input");
		this.clock.tick(400);

		aItems = oPopup1.getContent()[0].getItems();
		assert.ok(oPopup1.isOpen(), "Two Value Suggestion Popup is still open now");
		assert.equal(getVisibleItems(oPopup1).length, 1, "Suggestions are filtered");

		//trigger selection
		var oList = oPopup1.getContent()[0];
		var oListItem = oList.getItems()[0];
		oListItem.ontap(new jQuery.Event());
		this.clock.tick(400);

		assert.ok(!oPopup1.isOpen(), "Two Value Suggestion Popup is closed");
		assert.equal(oInput.getValue(), aNames[0], "Input value is set to first value of selected suggestion item");

		//close the popoup when nothing is typed in input
		oInput._$input.trigger("focus").val("").trigger("input");
		this.clock.tick(300);

		aItems = oPopup1.getContent()[0].getItems();
		assert.ok(!oPopup1.isOpen(), "Two Value Suggestion Popup is closed");

		oInput.destroy();
	});

	QUnit.test("Two Value Suggestions with disabled items on Desktop", async function(assert){
		var oPopup,
			aNames = ["abcTom", "abcPhilips", "abcAnna", "abcJames"],
			aDescription = ["Heidelberg", "Mannheim", "Paris", "London"],
			aEnabled = [true, false, true, false],
			aItemAdded = [],
			i;

		var oInput = new Input("input", {
			showSuggestion: true
		});
		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.attachSuggest(function(){
			for (i = 0; i < aNames.length; i++){
				if (!aItemAdded.includes(aNames[i])){
					oInput.addSuggestionItem(new ListItem({text: aNames[i], additionalText: aDescription[i], enabled: aEnabled[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("abc").trigger("input");

		this.clock.tick(500);
		oPopup = oInput._getSuggestionsPopover().getPopover();

		assert.ok(oPopup.isA("sap.m.Popover"), "Two Value Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Two Value Suggestion Popup is open now");
		assert.equal(getPopupItemsContent(oPopup).getItems().length, 2, "Only enabled suggestions are inserted");
		assert.ok(getPopupItemsContent(oPopup).getItems()[0].isA("sap.m.StandardListItem"), "Suggestion item is a StandardListItem");
		assert.ok(getPopupItemsContent(oPopup).getItems()[0].getTitle(), aNames[0], "Suggestion item has a title set equal to the ListItem's text");
		assert.ok(getPopupItemsContent(oPopup).getItems()[0].getInfo(), aDescription[0], "Suggestion item has an info set equal to the ListItem's additionalText");

		this.clock.tick(400);
		assert.ok(oPopup.isOpen(), "Two Value Suggestion Popup is still open now");

		qutils.triggerKeydown(oInput.getDomRef(), KeyCodes.ARROW_DOWN);
		assert.ok(oInput._getSuggestionsPopover().getItemsContainer().getItems()[0].$().hasClass("sapMLIBSelected"), "The first item is selected after pressing keyDown once");

		qutils.triggerKeydown(oInput.getDomRef(), KeyCodes.ARROW_DOWN);
		assert.ok(oInput._getSuggestionsPopover().getItemsContainer().getItems()[1].getTitle(), aNames[2], "The second item in the list, should have a title as the second enabled item");
		assert.ok(oInput._getSuggestionsPopover().getItemsContainer().getItems()[1].$().hasClass("sapMLIBSelected"), "The second item is selected after pressing keyDown twice");

		oInput.destroy();
	});

	// this test ensured downward compatibility: ColumnListItem has default type "Inactive" but still does need to be selected
	QUnit.test("Tabular Suggestions with type=\"Inactive\"", async function(assert){
		var oInput = new Input({
			showSuggestion: true,
			suggestionColumns: [
				new Column({
					styleClass: "name",
					hAlign: "Left",
					header: new Label({
						text: "{i18n>/Name}"
					})
				}),
				new Column({
					hAlign : "Center",
					styleClass : "qty",
					popinDisplay : "Inline",
					header : new Label({
						text : "{i18n>/Qty}"
					}),
					minScreenWidth : "Tablet",
					demandPopin : true
				}),
				new Column({
					hAlign : "Center",
					styleClass : "limit",
					width : "30%",
					header : new Label({
						text : "{i18n>/Value}"
					}),
					minScreenWidth : "XXSmall",
					demandPopin : true
				}),
				new Column({
					hAlign : "Right",
					styleClass : "price",
					width : "30%",
					popinDisplay : "Inline",
					header : new Label({
						text : "{i18n>/Price}"
					}),
					minScreenWidth : "400px",
					demandPopin : true
				})
			]});

		var oTableItemTemplate = new ColumnListItem({
			type : "Inactive",
			vAlign : "Middle",
			cells : [
				new Label({
					text : "{name}"
				}),
				new Label({
					text: "{qty}"
				}), new Label({
					text: "{limit}"
				}), new Label({
					text : "{price}"
				})
			]
		});

		// data for tabular suggestions
		var oSuggestionData = {
			tabularSuggestionItems : [{
				name : "Product1",
				qty : "10 EA",
				limit : "15.00 Eur",
				price : "10.00 EUR"
			}, {
				name : "Product2",
				qty : "9 EA",
				limit : "25.00 Eur",
				price : "20.00 EUR"
			}, {
				name : "Product3",
				qty : "8 EA",
				limit : "35.00 Eur",
				price : "30.00 EUR"
			}]
		};

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		var oPopup, // is lazy loaded
			i,
			oSuggestionRow;

		oInput.attachSuggest(function() {
			oInput.destroySuggestionRows();

			assert.strictEqual(oTableItemTemplate.getType(), ListType.Inactive, "The type of the template item is \"Inactive\" (default value)");
			for (i = 0; i < oSuggestionData.tabularSuggestionItems.length; i++){
				oSuggestionRow = oTableItemTemplate.clone();
				oSuggestionRow.getCells()[0].setText(oSuggestionData.tabularSuggestionItems[i].name);
				oSuggestionRow.getCells()[1].setText(oSuggestionData.tabularSuggestionItems[i].qty);
				oSuggestionRow.getCells()[2].setText(oSuggestionData.tabularSuggestionItems[i].limit);
				oSuggestionRow.getCells()[3].setText(oSuggestionData.tabularSuggestionItems[i].price);
				oInput.addSuggestionRow(oSuggestionRow);
			}

			assert.strictEqual(oInput.getSuggestionRows()[0].getType(), ListType.Active, "Even if the type of the suggestionRow item is \"Inactive\" it is set to active by the control");
		});

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("Prod").trigger("input");

		this.clock.tick(500);
		oPopup = oInput._getSuggestionsPopover().getPopover();

		assert.ok(oPopup.isA("sap.m.Popover"), "Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		qutils.triggerKeydown(oInput.getDomRef(), KeyCodes.ARROW_DOWN);
		assert.ok(oInput._getSuggestionsPopover().getItemsContainer().getItems()[0].$().hasClass("sapMLIBSelected"), "The first item is selected after pressing keyDown once");

		qutils.triggerKeydown(oInput.getDomRef(), KeyCodes.ARROW_DOWN);
		assert.ok(oInput._getSuggestionsPopover().getItemsContainer().getItems()[1].$().hasClass("sapMLIBSelected"), "The second item is selected after pressing keyDown twice");

		qutils.triggerKeydown(oInput.getDomRef(), KeyCodes.ARROW_DOWN);
		assert.ok(oInput._getSuggestionsPopover().getItemsContainer().getItems()[2].$().hasClass("sapMLIBSelected"), "The third item is selected after pressing keyDown three times");

		qutils.triggerKeydown(oInput.getDomRef(), KeyCodes.ARROW_UP);
		assert.ok(oInput._getSuggestionsPopover().getItemsContainer().getItems()[1].$().hasClass("sapMLIBSelected"), "The second item is selected after pressing keyUp once");

		qutils.triggerKeydown(oInput.getDomRef(), KeyCodes.ARROW_UP);
		assert.ok(oInput._getSuggestionsPopover().getItemsContainer().getItems()[0].$().hasClass("sapMLIBSelected"), "The first item is selected after pressing keyUp twice");

		//close the popoup when nothing is typed in input
		oInput._$input.trigger("focus").val("").trigger("input");
		this.clock.tick(300);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup is closed");

		oInput.destroy();
	});

	QUnit.test("Suggestion on Phone", async function(assert){
		var oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system").value(oSystem);

		var oInput = new Input({
				type: mobileLibrary.InputType.Tel,
				showSuggestion: true
			}),
			oPopup, // is lazy loaded
			aNames = ["abcTom", "abcPhilips", "abcAnna"],
			aItemAdded = [],
			i;

		oInput.attachSuggest(function(){
			for (i = 0; i < aNames.length; i++){
				if (!aItemAdded.includes(aNames[i])){
					oInput.addSuggestionItem(new Item({text: aNames[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput.ontap({
			target: {
				id: oInput.getId()
			}
		});
		this.clock.tick(500);

		oPopup = oInput._getSuggestionsPopover().getPopover();
		assert.ok(oPopup.isA("sap.m.Dialog"), "Suggestion Popup is created and is a Dialog instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		assert.equal(oInput._getSuggestionsPopover().getInput().getType(), mobileLibrary.InputType.Tel, "The type of the Input inside the Suggestion Popup is the same as the type of the original Input"); // BCP 1970125027

		oInput._getSuggestionsPopover().getInput()._$input.trigger("focus").val("abc").trigger("input");
		this.clock.tick(400);
		assert.equal(getPopupItemsContent(oPopup).getItems().length, aNames.length, "Suggestions are inserted");

		oInput._getSuggestionsPopover().getInput()._$input.trigger("focus").val("abcT").trigger("input");
		this.clock.tick(400);
		assert.ok(oPopup.isOpen(), "Suggestion Popup is still open now");
		assert.equal(getVisibleItems(oPopup).length, 1, "Suggestions are filtered");

		oInput._getSuggestionsPopover().getInput()._$input.trigger("focus").val("").trigger("input");
		this.clock.tick(400);
		assert.ok(oPopup.isOpen(), "Suggestion Popup is still open now");
		assert.equal(getVisibleItems(oPopup).length, 0, "All Suggestions are hidden");

		oInput._getSuggestionsPopover().getInput()._$input.trigger("focus").val("abc").trigger("input");
		this.clock.tick(400);

		qutils.triggerTouchEvent("tap", getPopupItemsContent(oPopup).getItems()[1].getDomRef());
		this.clock.tick(500);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup is closed");
		assert.equal(oInput.getValue(), aNames[1], "Value is set to originalInput");

		oInput.destroy();
	});

	QUnit.test("Suggestion on Phone with changing the input value in SuggestionItemSelected event handler", async function(assert){
		var oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system").value(oSystem);

		var oInput = new Input({
				showSuggestion: true,
				type: mobileLibrary.InputType.Tel,
				suggestionItemSelected: function(){
					oInput.setValue("newValue");
				}
			}),
			oPopup, // is lazy loaded
			aNames = ["abcTom", "abcPhilips", "abcAnna"],
			aItemAdded = [],
			i;

		oInput.attachSuggest(function(){
			for (i = 0; i < aNames.length; i++){
				if (!aItemAdded.includes(aNames[i])){
					oInput.addSuggestionItem(new Item({text: aNames[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput.ontap({
			target: {
				id: oInput.getId()
			}
		});
		this.clock.tick(500);

		oPopup = oInput._getSuggestionsPopover().getPopover();

		assert.equal(oInput._getSuggestionsPopover().getInput().getType(), mobileLibrary.InputType.Tel, "The type of the Input inside the Suggestion Popup is the same as the type of the original Input"); // BCP 1970125027

		oInput._getSuggestionsPopover().getInput()._$input.trigger("focus").val("abc").trigger("input");
		this.clock.tick(400);
		qutils.triggerTouchEvent("tap", getPopupItemsContent(oPopup).getItems()[1].getDomRef());
		this.clock.tick(500);
		assert.equal(oInput.getValue(), "newValue", "Value is last modified by the suggestionItemSelected event listener");

		oInput.destroy();
	});

	QUnit.test("Two value Suggestion on Phone", async function(assert){
		var oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system").value(oSystem);

		var oInput = new Input({
				showSuggestion: true
			}),
			oPopup,
			aNames = ["abcTom", "abcPhilips", "abcAnna"],
			aDescription = ["Heidelberg", "Mannheim", "Paris"],
			aItemAdded = [],
			i;

		oInput.attachSuggest(function(){
			for (i = 0; i < aNames.length; i++){
				if (!aItemAdded.includes(aNames[i])){
					oInput.addSuggestionItem(new ListItem({text: aNames[i], additionalText: aDescription[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.ontap({
			target: {
				id: oInput.getId()
			}
		});
		this.clock.tick(500);
		oPopup = oInput._getSuggestionsPopover().getPopover();

		assert.equal(oInput._getSuggestionsPopover().getInput().getType(), mobileLibrary.InputType.Text, "The type of the Input inside the Suggestion Popup is the same as the type of the original Input - the default one ('Text')"); // BCP 1970125027

		assert.ok(oPopup.isA("sap.m.Dialog"), "Two value Suggestion Popup is created and is a Dialog instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		oInput._getSuggestionsPopover().getInput()._$input.trigger("focus").val("abc").trigger("input");
		this.clock.tick(400);
		assert.equal(getPopupItemsContent(oPopup).getItems().length, aNames.length, "Suggestions are inserted");

		oInput._getSuggestionsPopover().getInput()._$input.trigger("focus").val("abcT").trigger("input");
		this.clock.tick(400);
		assert.ok(oPopup.isOpen(), "Two value Suggestion Popup is still open now");
		assert.equal(getVisibleItems(oPopup).length, 1, "Suggestions are filtered");

		oInput._getSuggestionsPopover().getInput()._$input.trigger("focus").val("").trigger("input");
		this.clock.tick(400);
		assert.ok(oPopup.isOpen(), "Two value Suggestion Popup is still open now");
		assert.equal(getVisibleItems(oPopup).length, 0, "All Suggestions are hidden");

		oInput._getSuggestionsPopover().getInput()._$input.trigger("focus").val("abc").trigger("input");
		this.clock.tick(400);

		qutils.triggerTouchEvent("tap", getPopupItemsContent(oPopup).getItems()[1].getDomRef());
		this.clock.tick(500);
		assert.ok(!oPopup.isOpen(), "Two value Suggestion Popup is closed");
		assert.equal(oInput.getValue(), aNames[1], "Value is set to originalInput");

		oInput.destroy();
	});

	QUnit.test("Suggestion with liveChange handler on phone", async function(assert){
		var fnLC1 = this.spy();

		var oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system").value(oSystem);

		var oInput = new Input({
			showSuggestion: true,
			liveChange: fnLC1
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput.ontap({
			target: {
				id: oInput.getId()
			}
		});
		this.clock.tick(500);

		oInput._getSuggestionsPopover().getInput()._$input.trigger("focus").val("abc").trigger("input");

		assert.equal(fnLC1.callCount, 1, "liveChange handler on original input is called");

		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions on Desktop", async function (assert) {
		var oMessageBundle = Library.getResourceBundleFor("sap.m");

		var oInput = new Input({
			width: "100px",
			enableSuggestionsHighlighting: false,
			suggestionColumns: [
				new Column({
					styleClass: "name",
					hAlign: "Left",
					header: new Label({
						text: "{i18n>/Name}"
					})
				}),
				new Column({
					hAlign : "Center",
					styleClass : "qty",
					popinDisplay : "Inline",
					header : new Label({
						text : "{i18n>/Qty}"
					}),
					minScreenWidth : "Tablet",
					demandPopin : true
				}),
				new Column({
					hAlign : "Center",
					styleClass : "limit",
					width : "30%",
					header : new Label({
						text : "{i18n>/Value}"
					}),
					minScreenWidth : "XXSmall",
					demandPopin : true
				}),
				new Column({
					hAlign : "Right",
					styleClass : "price",
					width : "30%",
					popinDisplay : "Inline",
					header : new Label({
						text : "{i18n>/Price}"
					}),
					minScreenWidth : "400px",
					demandPopin : true
				})
			]});

		var oTableItemTemplate = new ColumnListItem({
			vAlign : "Middle",
			cells : [
				new Label({
					text : "{name}"
				}),
				new Label({
					text: "{qty}"
				}), new Label({
					text: "{limit}"
				}), new Label({
					text : "{price}"
				})
			]
		});

		// data for tabular suggestions
		var oSuggestionData = {
			tabularSuggestionItems : [{
				name : "Product1",
				qty : "10 EA",
				limit : "15.00 Eur",
				price : "10.00 EUR"
			}, {
				name : "Product2",
				qty : "9 EA",
				limit : "25.00 Eur",
				price : "20.00 EUR"
			}, {
				name : "Product3",
				qty : "8 EA",
				limit : "35.00 Eur",
				price : "30.00 EUR"
			}]
		};

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// this tests calling the setter of showSuggestion after input is rendered
		oInput.setShowSuggestion(true);
		await nextUIUpdate(this.clock);

		var oPopup, // is lazy loaded
			aAlreadyAddedProducts = [],
			oSuggestionRow,
			i;

		oInput.attachSuggest(function() {
			oInput.destroySuggestionRows();
			for (i = 0; i < oSuggestionData.tabularSuggestionItems.length; i++){
				if (!aAlreadyAddedProducts.includes(oSuggestionData.tabularSuggestionItems[i])){
					oSuggestionRow = oTableItemTemplate.clone();
					oSuggestionRow.getCells()[0].setText(oSuggestionData.tabularSuggestionItems[i].name);
					oSuggestionRow.getCells()[1].setText(oSuggestionData.tabularSuggestionItems[i].qty);
					oSuggestionRow.getCells()[2].setText(oSuggestionData.tabularSuggestionItems[i].limit);
					oSuggestionRow.getCells()[3].setText(oSuggestionData.tabularSuggestionItems[i].price);
					oInput.addSuggestionRow(oSuggestionRow);
					aAlreadyAddedProducts.push(oSuggestionData.tabularSuggestionItems[i].name);
				}
			}
		});

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("Prod").trigger("input");

		this.clock.tick(500);
		oPopup = oInput._getSuggestionsPopover().getPopover();

		assert.ok(oPopup.isA("sap.m.Popover"), "Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		assert.ok(!oInput._getSuggestionsPopover().getItemsContainer().hasStyleClass("sapMInputSuggestionTableHidden"), "Tabular suggestions table initially has not the hidden style class");

		assert.equal(getPopupItemsContent(oPopup).getItems().length, oSuggestionData.tabularSuggestionItems.length, "Suggestions are inserted");
		assert.strictEqual(getPopupItemsContent(oPopup).$().length, 1, "Suggestion table is rendered");
		assert.ok(getPopupItemsContent(oPopup).isA("sap.m.Table"), "Suggestions are tabular)");
		assert.strictEqual(oPopup.getDomRef().getBoundingClientRect().width, 640, "Suggestion popup has 640px width since this is the max-width");

		oInput._$input.trigger("focus").val("Product1").trigger("input");
		this.clock.tick(500);

		assert.ok(!oInput._getSuggestionsPopover().getItemsContainer().hasStyleClass("sapMInputSuggestionTableHidden"), "Tabular suggestions table does not have the hidden style class on desktop");

		assert.ok(oPopup.isOpen(), "Suggestion Popup is still open now");
		assert.equal(getPopupItemsContent(oPopup).$().find("tbody").children(":visible").length, 1, "Suggestions are filtered");

		// checks for the show more button (tabular suggestions only)
		assert.strictEqual(oPopup.getFooter().getContent().length, 2, "The footer has two items (spacer and button)");
		assert.strictEqual(oPopup.getFooter().getContent()[1].isA("sap.m.Button"), true, "The show more button is added to the popup");
		assert.strictEqual(oPopup.getFooter().getContent()[1].getText(), oMessageBundle.getText("INPUT_SUGGESTIONS_SHOW_ALL"), "The show more button shows the correct text from the message bundle");

		//close the popoup when nothing is typed in input
		oInput._$input.trigger("focus").val("").trigger("input");
		this.clock.tick(300);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup is closed");

		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions invalidation handling", async function(assert){
		var oInput = new Input({
			suggestionColumns: [
				new Column({
					styleClass: "name",
					hAlign: "Left",
					header: new Label({
						text: "{i18n>/Name}"
					})
				}),
				new Column({
					hAlign : "Center",
					styleClass : "qty",
					popinDisplay : "Inline",
					header : new Label({
						text : "{i18n>/Qty}"
					}),
					minScreenWidth : "Tablet",
					demandPopin : true
				}),
				new Column({
					hAlign : "Center",
					styleClass : "limit",
					width : "30%",
					header : new Label({
						text : "{i18n>/Value}"
					}),
					minScreenWidth : "XXSmall",
					demandPopin : true
				}),
				new Column({
					hAlign : "Right",
					styleClass : "price",
					width : "30%",
					popinDisplay : "Inline",
					header : new Label({
						text : "{i18n>/Price}"
					}),
					minScreenWidth : "400px",
					demandPopin : true
				})
			]}),
			oInputRendererSpy;

		var oTableItemTemplate = new ColumnListItem({
			vAlign : "Middle",
			cells : [
				new Label({
					text : "{name}"
				}),
				new Label({
					text: "{qty}"
				}), new Label({
					text: "{limit}"
				}), new Label({
					text : "{price}"
				})
			]
		});

		// data for tabular suggestions
		var oSuggestionData = {
			tabularSuggestionItems : [{
				name : "Product1",
				qty : "10 EA",
				limit : "15.00 Eur",
				price : "10.00 EUR"
			}, {
				name : "Product2",
				qty : "9 EA",
				limit : "25.00 Eur",
				price : "20.00 EUR"
			}, {
				name : "Product3",
				qty : "8 EA",
				limit : "35.00 Eur",
				price : "30.00 EUR"
			}]
		};

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// this tests calling the setter of showSuggestion after input is rendered
		oInput.setShowSuggestion(true);
		await nextUIUpdate(this.clock);

		var oPopup, // is lazy loaded
			aAlreadyAddedProducts = [],
			oSuggestionRow,
			i;

		oInput.attachSuggest(function() {
			oInput.destroySuggestionRows();
			for (i = 0; i < oSuggestionData.tabularSuggestionItems.length; i++){
				if (!aAlreadyAddedProducts.includes(oSuggestionData.tabularSuggestionItems[i])){
					oSuggestionRow = oTableItemTemplate.clone();
					oSuggestionRow.getCells()[0].setText(oSuggestionData.tabularSuggestionItems[i].name);
					oSuggestionRow.getCells()[1].setText(oSuggestionData.tabularSuggestionItems[i].qty);
					oSuggestionRow.getCells()[2].setText(oSuggestionData.tabularSuggestionItems[i].limit);
					oSuggestionRow.getCells()[3].setText(oSuggestionData.tabularSuggestionItems[i].price);
					oInput.addSuggestionRow(oSuggestionRow);
					aAlreadyAddedProducts.push(oSuggestionData.tabularSuggestionItems[i].name);
				}
			}
		});

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("Prod").trigger("input");

		this.clock.tick(500);
		oPopup = oInput._getSuggestionsPopover().getPopover();

		// set up a spy on the dialog's renderer (the dialog should not be rerendered)
		oInputRendererSpy = sinon.spy(InputRenderer, "render");

		assert.ok(oPopup.isA("sap.m.Popover"), "Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");
		assert.equal(getPopupItemsContent(oPopup).getItems().length, oSuggestionData.tabularSuggestionItems.length, "Suggestions are inserted");
		assert.strictEqual(getPopupItemsContent(oPopup).$().length, 1, "Suggestion table is rendered");
		assert.ok(getPopupItemsContent(oPopup).isA("sap.m.Table"), "Suggestions are tabular)");

		oInput._$input.trigger("focus").val("Product1").trigger("input");
		this.clock.tick(400);

		// check for re-rendering when changing the "suggestionRows" aggregation
		assert.strictEqual(oInputRendererSpy.callCount, 0, "the input field is not re-rendered when suggestions are inserted or removed");

		// check for re-rendering when changing "showTableSuggestionValueHelp" property
		oInput.setShowTableSuggestionValueHelp(false);
		assert.strictEqual(oInputRendererSpy.callCount, 0, "the input field is not re-rendered when property \"showTableSuggestionValueHelp\" is changed");
		oInput.setShowTableSuggestionValueHelp(true);
		assert.strictEqual(oInputRendererSpy.callCount, 0, "the input field is not re-rendered when property \"showTableSuggestionValueHelp\" is changed");


		assert.ok(oPopup.isOpen(), "Suggestion Popup is still open now");
		assert.equal(getPopupItemsContent(oPopup).$().find("tbody").children(":visible").length, 1, "Suggestions are filtered");

		//close the popoup when nothing is typed in input
		oInput._$input.trigger("focus").val("").trigger("input");
		this.clock.tick(500);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup is closed");
		oInput.destroy();
	});

	QUnit.test("Tabular suggestions and setShowTableSuggestionValueHelp", async function(assert) {
		var aData = [
			{ "a": "Alma1" },
			{ "a": "AlDDDa1" },
			{ "a": "Bcc1" }
		];
		var oInput = new Input({
			showSuggestion : true,
			suggestionColumns : [
				new Column({
					header : new Label({text : "A"})
				})
			],
			suggestionItemSelected: function (oEvent) {
				var oSelectedRow = Element.getElementById(oEvent.getSource().getSelectedRow());

				if (oSelectedRow) {
					oInput.getModel().setData([
						{ "a": "Alma1" },
						{ "a": "AlDDDa1" },
						{ "a": "Bcc1" },
						{ "a": "Al1" },
						{ "a": "Alma1" },
						{ "a": "Al1" },
						{ "a": "Alm3" },
						{ "a": "Alma2" }
					]);

					oInput.setShowTableSuggestionValueHelp(false);
				}
			}
		}).placeAt("content");

		oInput.setModel(new JSONModel(aData));
		oInput.bindAggregation("suggestionRows", {
			path : "/",
			template : new ColumnListItem({
				cells : [
					new Label({text : "{a}"})
				]
			})
		});

		await nextUIUpdate(this.clock);

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("a").trigger("input");

		this.clock.tick(500);

		var oRow = oInput.getSuggestionRows()[0];

		oRow.ontap(new jQuery.Event());
		this.clock.tick(500);

		var sVisibility = oInput._getSuggestionsPopover().getPopover().getDomRef().style.visibility;

		assert.strictEqual(sVisibility, "hidden", "Popover should not be visible in DOM");

		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions Show More Button", async function(assert) {
		var oSuggestionData = {
			tabularSuggestionItems: [
				{
					id: "1",
					name: "Auch ein gutes Ding",
					qty: "3 EA",
					limit: "99.00 EUR",
					price: "17.00 EUR"
				}, {
					id: "2",
					name: "Besser ist das",
					qty: "1 EA",
					limit: "20.00 EUR",
					price: "13.00 EUR"
				}, {
					id: "3",
					name: "Holter-di-polter",
					qty: "10 EA",
					limit: "15.00 EUR",
					price: "12.00 EUR"
				}, {
					id: "4",
					name: "Ha so was",
					qty: "10 EA",
					limit: "5.00 EUR",
					price: "3.00 EUR"
				}, {
					id: "5",
					name: "Hurra ein Produkt",
					qty: "8 EA",
					limit: "60.00 EUR",
					price: "45.00 EUR"
				}, {
					id: "6",
					name: "Hallo du tolles Ding",
					qty: "2 EA",
					limit: "40.00 EUR",
					price: "15.00 EUR"
				}, {
					id: "7",
					name: "Hier sollte ich zuschlagen",
					qty: "10 EA",
					limit: "90.00 EUR",
					price: "55.00 EUR"
				}, {
					id: "8",
					name: "Hohoho",
					qty: "18 EA",
					limit: "29.00 EUR",
					price: "7.00 EUR"
				}, {
					id: "9",
					name: "Holla die Waldfee",
					qty: "3 EA",
					limit: "55.00 EUR",
					price: "30.00 EUR"
				}, {
					id: "10",
					name: "Hau Ruck",
					qty: "5 EA",
					limit: "2.00 EUR",
					price: "1.00 EUR"
				}]
		};
		var tableModel = new JSONModel();
		tableModel.setData(oSuggestionData);

		var oTableItemTemplate = new ColumnListItem({
			type: "Active",
			vAlign: "Middle",
			cells: [
				new Label({
					text: "{name}"
				}),
				new Label({
					text: "{qty}"
				}), new Label({
					text: "{limit}"
				}), new Label({
					text: "{price}"
				}),
				new Label({
					text: "{id}"
				})
			]
		});

		var oInput = new Input({
			showSuggestion: true,
			showTableSuggestionValueHelp: false,
			suggestionRows: {
				path: '/tabularSuggestionItems',
				template: oTableItemTemplate
			},
			suggestionColumns: [
				new Column({
					styleClass: "name",
					hAlign: "Begin",
					header: new Label({
						text: "{Name}"
					})
				}),
				new Column({
					hAlign: "Center",
					styleClass: "qty",
					popinDisplay: "Inline",
					header: new Label({
						text: "{Qty}"
					}),
					minScreenWidth: "Tablet",
					demandPopin: true
				}),
				new Column({
					hAlign: "Center",
					styleClass: "limit",
					width: "30%",
					header: new Label({
						text: "{Value}"
					}),
					minScreenWidth: "XXSmall",
					demandPopin: true
				}),
				new Column({
					hAlign: "End",
					styleClass: "price",
					width: "30%",
					popinDisplay: "Inline",
					header: new Label({
						text: "{Price}"
					}),
					minScreenWidth: "400px",
					demandPopin: true
				}),
				new Column({
					styleClass: "name",
					hAlign: "Begin",
					visible: false,
					header: new Label({
						text: "{id}"
					})
				})
			]
		});

		oInput.setModel(tableModel);

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("Prod").trigger("input");

		this.clock.tick(300);

		assert.ok(!oInput._getSuggestionsPopover().getPopover().getFooter(), "Suggestion Popup doesn't have Toolbar footer");

		oInput.destroy();
	});

	QUnit.test("Tabular suggestions Tapping a row should clear the _sTypedInValue", async function (assert) {
		var oInput = new Input({
			showSuggestion: true,
			suggestionColumns : [
				new Column({
					styleClass : "name",
					hAlign : "Begin",
					header : new Label({
						text : "Test"
					})
				})
			],
			suggestionRows : [
				new ColumnListItem({
					cells: [
						new Text({text:"Text 1"})
					]
				})
			]
		});
		var oItemsContainer = oInput._getSuggestionsPopover().getItemsContainer();
		var oSpy;

		// Arrange
		oInput.placeAt("content");
		await nextUIUpdate(this.clock);
		this.clock.tick();

		// Act
		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.t });
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("t").trigger("input");
		oInput._openSuggestionPopup();
		this.clock.tick(300);

		// Assert
		assert.strictEqual(oInput._getTypedInValue(), "t", "Typed in value stored initially");

		// Act
		oSpy = this.spy(oInput, "_setTypedInValue");
		qutils.triggerTouchEvent("tap", oItemsContainer.getItems()[0].getDomRef());
		this.clock.tick();

		// Assert
		assert.strictEqual(oSpy.firstCall.args[0], "", "The _setTypedInValue was called with empty string.");
		assert.strictEqual(oInput._getTypedInValue(), "", "The _sTypedInValue was reset to empty string, when the item was pressed.");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Tabular Suggestion on Phone", async function(assert){
		var oMessageBundle = Library.getResourceBundleFor("sap.m");

		var oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system").value(oSystem);

		var oInput = new Input({
			showSuggestion: true,
			width: "100px",
			maxSuggestionWidth: "500px",
			suggestionColumns: [
				new Column({
					styleClass: "name",
					hAlign: "Left",
					header: new Label({
						text: "{i18n>/Name}"
					})
				}),
				new Column({
					hAlign : "Center",
					styleClass : "qty",
					popinDisplay : "Inline",
					header : new Label({
						text : "{i18n>/Qty}"
					}),
					minScreenWidth : "Tablet",
					demandPopin : true
				}),
				new Column({
					hAlign : "Center",
					styleClass : "limit",
					width : "30%",
					header : new Label({
						text : "{i18n>/Value}"
					}),
					minScreenWidth : "XXSmall",
					demandPopin : true
				}),
				new Column({
					hAlign : "Right",
					styleClass : "price",
					width : "30%",
					popinDisplay : "Inline",
					header : new Label({
						text : "{i18n>/Price}"
					}),
					minScreenWidth : "400px",
					demandPopin : true
				})
			]});

		var oTableItemTemplate = new ColumnListItem({
			vAlign : "Middle",
			cells : [
				new Label({
					text : "{name}"
				}),
				new Label({
					text: "{qty}"
				}), new Label({
					text: "{limit}"
				}), new Label({
					text : "{price}"
				})
			]
		});

		// data for tabular suggestions
		var oSuggestionData = {
			tabularSuggestionItems : [{
				name : "Product1",
				qty : "10 EA",
				limit : "15.00 Eur",
				price : "10.00 EUR"
			}, {
				name : "Product2",
				qty : "9 EA",
				limit : "25.00 Eur",
				price : "20.00 EUR"
			}, {
				name : "Product3",
				qty : "8 EA",
				limit : "35.00 Eur",
				price : "30.00 EUR"
			}]
		};

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		var oPopup, // is lazy loaded
			aAlreadyAddedProducts = [],
			oDialogRendererSpy,
			oSuggestionRow,
			i;

		oInput.attachSuggest(function() {
			oInput.destroySuggestionRows();
			for (i = 0; i < oSuggestionData.tabularSuggestionItems.length; i++){
				if (!aAlreadyAddedProducts.includes(oSuggestionData.tabularSuggestionItems[i])){
					oSuggestionRow = oTableItemTemplate.clone();
					oSuggestionRow.getCells()[0].setText(oSuggestionData.tabularSuggestionItems[i].name);
					oSuggestionRow.getCells()[1].setText(oSuggestionData.tabularSuggestionItems[i].qty);
					oSuggestionRow.getCells()[2].setText(oSuggestionData.tabularSuggestionItems[i].limit);
					oSuggestionRow.getCells()[3].setText(oSuggestionData.tabularSuggestionItems[i].price);
					oInput.addSuggestionRow(oSuggestionRow);
					aAlreadyAddedProducts.push(oSuggestionData.tabularSuggestionItems[i].name);
				}
			}
		});

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput.ontap({
			target: {
				id: oInput.getId()
			}
		});
		this.clock.tick(300);

		oPopup = oInput._getSuggestionsPopover().getPopover();
		assert.ok(oPopup.isA("sap.m.Dialog"), "Suggestion Popup is created and is a Dialog instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		// set up a spy on the dialog's renderer
		oDialogRendererSpy = sinon.spy(DialogRenderer, "render");
		oInput._getSuggestionsPopover().getInput()._$input.trigger("focus").val("Product").trigger("input");
		this.clock.tick(400);
		assert.equal(getPopupItemsContent(oPopup).getItems().length, oSuggestionData.tabularSuggestionItems.length, "Suggestions are inserted");
		assert.strictEqual(oDialogRendererSpy.callCount, 1, "Dialog has been renderded after opening");
		assert.ok(!oInput._getSuggestionsPopover().getItemsContainer().hasStyleClass("sapMInputSuggestionTableHidden"), "Tabular suggestions table does not have the hidden style class when items are displayed");

		// remove input in between (to check if dialog is not re-rendered, this would cause the soft-keyboard to hide)
		oInput._getSuggestionsPopover().getInput()._$input.trigger("focus").val("").trigger("input");
		this.clock.tick(400);
		assert.strictEqual(oDialogRendererSpy.callCount, 1, "Dialog is not re-rendered when changing the input value to empty string");
		assert.ok(oInput._getSuggestionsPopover().getItemsContainer().hasStyleClass("sapMInputSuggestionTableHidden"), "Tabular suggestions table has the hidden style class when no items are displayed");

		oInput._getSuggestionsPopover().getInput()._$input.trigger("focus").val("Product1").trigger("input");
		this.clock.tick(400);

		assert.ok(oPopup.isOpen(), "Suggestion Popup is still open now123");
		assert.equal(getPopupItemsContent(oPopup).$().find("tbody").children(":visible").length, 1, "Suggestions are filtered");
		assert.strictEqual(oDialogRendererSpy.callCount, 1, "Dialog is not re-rendered when changing the input value to a another value");
		assert.ok(!oInput._getSuggestionsPopover().getItemsContainer().hasStyleClass("sapMInputSuggestionTableHidden"), "Tabular suggestions table does not have the hidden style class when items are displayed");

		// enter a string that is not found in suggestions
		oInput._getSuggestionsPopover().getInput()._$input.trigger("focus").val("thisWillNotBeFound").trigger("input");
		this.clock.tick(400);

		assert.ok(oPopup.isOpen(), "Suggestion Popup is still open now");
		assert.ok(getPopupItemsContent(oPopup).getItems().length, "There are invisible suggestion items");
		getPopupItemsContent(oPopup).getItems().forEach(function (oItem) {
			assert.strictEqual(oItem.getVisible(), false, "Item " + oItem.getId() + " is not visible");
		});
		assert.strictEqual(oDialogRendererSpy.callCount, 1, "Dialog is not re-rendered when changing the input value to a another value");
		assert.ok(oInput._getSuggestionsPopover().getItemsContainer().hasStyleClass("sapMInputSuggestionTableHidden"), "Tabular suggestions table has the hidden style class when no items are found");

		// filter with a string that will display 3 items
		oInput._getSuggestionsPopover().getInput()._$input.trigger("focus").val("Product").trigger("input");
		this.clock.tick(400);

		assert.equal(getPopupItemsContent(oPopup).$().find("tbody").children().length, 3, "3 suggestions are displayed");
		assert.strictEqual(oDialogRendererSpy.callCount, 1, "Dialog is not re-rendered during filtering of suggestions");
		assert.ok(!oInput._getSuggestionsPopover().getItemsContainer().hasStyleClass("sapMInputSuggestionTableHidden"), "Tabular suggestions table does not have the hidden style class when items are displayed");

		// checks for the show more button (tabular suggestions only)
		assert.strictEqual(oPopup.getEndButton().isA("sap.m.Button"), true, "The show more button is added to the popup");
		assert.strictEqual(oPopup.getEndButton().getText(), oMessageBundle.getText("INPUT_SUGGESTIONS_SHOW_ALL"), "The show more button shows the correct text from the message bundle");

		getPopupItemsContent(oPopup).getItems()[1].$().trigger("tap");

		this.clock.tick(300);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup is closed");
		assert.equal(oInput.getValue(), oSuggestionData.tabularSuggestionItems[1].name, "Value is set to originalInput");

		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions with custom filter and result fuction", async function(assert){
		var oInput = new Input({
			showSuggestion: true,
			width: "100px",
			maxSuggestionWidth: "500px",
			suggestionColumns: [
				new Column({
					styleClass: "name",
					hAlign: "Left",
					header: new Label({
						text: "{i18n>/Name}"
					})
				}),
				new Column({
					hAlign : "Center",
					styleClass : "qty",
					popinDisplay : "Inline",
					header : new Label({
						text : "{i18n>/Qty}"
					}),
					minScreenWidth : "Tablet",
					demandPopin : true
				}),
				new Column({
					hAlign : "Center",
					styleClass : "limit",
					width : "30%",
					header : new Label({
						text : "{i18n>/Value}"
					}),
					minScreenWidth : "XXSmall",
					demandPopin : true
				}),
				new Column({
					hAlign : "Right",
					styleClass : "price",
					width : "30%",
					popinDisplay : "Inline",
					header : new Label({
						text : "{i18n>/Price}"
					}),
					minScreenWidth : "400px",
					demandPopin : true
				})
			]});

		var oTableItemTemplate = new ColumnListItem({
			vAlign : "Middle",
			cells : [
				new Label({
					text : "{name}"
				}),
				new Label({
					text: "{qty}"
				}), new Label({
					text: "{limit}"
				}), new Label({
					text : "{price}"
				})
			]
		});

		// data for tabular suggestions
		var oSuggestionData = {
			tabularSuggestionItems : [{
				name : "Product1",
				qty : "10 EA",
				limit : "15.00 Eur",
				price : "10.00 EUR"
			}, {
				name : "Product2",
				qty : "9 EA",
				limit : "25.00 Eur",
				price : "20.00 EUR"
			}, {
				name : "Product3",
				qty : "8 EA",
				limit : "35.00 Eur",
				price : "30.00 EUR"
			}]
		};

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// custom filter for limit field
		oInput.setFilterFunction(function(sValue, oColumnListItem) {
			var aCells = oColumnListItem.getCells();

			return !!sValue && aCells[2].getText().toLowerCase().startsWith(sValue.toLowerCase());
		});

		// custom result function using a string and price
		oInput.setRowResultFunction(function (oColumnListItem) {
			return "You chose: " + oColumnListItem.getCells()[2].getText();
		});

		var oPopup, // is lazy loaded
			aAlreadyAddedProducts = [],
			oSuggestionRow,
			i;

		oInput.attachSuggest(function() {
			oInput.destroySuggestionRows();
			for (i = 0; i < oSuggestionData.tabularSuggestionItems.length; i++){
				if (!aAlreadyAddedProducts.includes(oSuggestionData.tabularSuggestionItems[i])){
					oSuggestionRow = oTableItemTemplate.clone();
					oSuggestionRow.getCells()[0].setText(oSuggestionData.tabularSuggestionItems[i].name);
					oSuggestionRow.getCells()[1].setText(oSuggestionData.tabularSuggestionItems[i].qty);
					oSuggestionRow.getCells()[2].setText(oSuggestionData.tabularSuggestionItems[i].limit);
					oSuggestionRow.getCells()[3].setText(oSuggestionData.tabularSuggestionItems[i].price);
					oInput.addSuggestionRow(oSuggestionRow);
					aAlreadyAddedProducts.push(oSuggestionData.tabularSuggestionItems[i].name);
				}
			}
		});

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("25").trigger("input");

		this.clock.tick(500);
		oPopup = oInput._getSuggestionsPopover().getPopover();

		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");
		assert.strictEqual(getPopupItemsContent(oPopup).$().find("tbody").children(":visible").length, 1, "Suggestions are filtered");
		assert.strictEqual(getPopupItemsContent(oPopup).$().find("tbody").find("tr>td>span, tr>td>label")[0].textContent, oSuggestionData.tabularSuggestionItems[1].name, "Product 2 is filtered");

		getPopupItemsContent(oPopup).getItems()[1].ontap(new jQuery.Event());
		this.clock.tick(300);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup is closed");
		assert.equal(oInput.getValue(), "You chose: " + oSuggestionData.tabularSuggestionItems[1].limit, "The input value has been formatted with the custom row result function");

		//close the popoup when nothing is typed in input
		oInput._$input.trigger("focus").val("").trigger("input");
		this.clock.tick(500);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup is closed");

		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions - selecting an already selected item", async function (assert) {

		// arrange
		var oInput = new Input({
			showSuggestion: true,
			suggestionColumns: [
				new Column({
					header: new Label({
						text: "{i18n>/Name}"
					})
				}),
				new Column({
					header : new Label({
						text : "{i18n>/Qty}"
					})
				}),
				new Column({
					header : new Label({
						text : "{i18n>/Value}"
					})
				}),
				new Column({
					header : new Label({
						text : "{i18n>/Price}"
					})
				})
			]});

		var oTableItemTemplate = new ColumnListItem({
			vAlign : "Middle",
			cells : [
				new Label({
					text : "{name}"
				}),
				new Label({
					text: "{qty}"
				}), new Label({
					text: "{limit}"
				}), new Label({
					text : "{price}"
				})
			]
		});

		var oSuggestionData = {
			tabularSuggestionItems : [{
				name : "Product1",
				qty : "10 EA",
				limit : "15.00 Eur",
				price : "10.00 EUR"
			}, {
				name : "Product2",
				qty : "9 EA",
				limit : "25.00 Eur",
				price : "20.00 EUR"
			}, {
				name : "Photo scan",
				qty : "8 EA",
				limit : "35.00 Eur",
				price : "30.00 EUR"
			}]
		};

		var oModel = new JSONModel(oSuggestionData);

		oInput.setModel(oModel);
		oInput.bindSuggestionRows({
			path: "/tabularSuggestionItems",
			template: oTableItemTemplate
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.G });
		oInput._getSuggestionsPopover().getPopover().open();

		// act
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("p").trigger("input");
		this.clock.tick(500);

		// check selected (highlighted in blue) row in the suggestion table
		var oSelectedRow1 = oInput._getSuggestionsPopover().getItemsContainer().getItems()[0];
		assert.ok(oSelectedRow1.getSelected(), true, "First item is selected");
		assert.equal(oSelectedRow1.getCells()[0].getText().toLowerCase(), oInput.getValue().toLowerCase(), "The value of the input is the same as the value of the selected row");

		// act
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("ph").trigger("input");
		this.clock.tick(500);

		// check selected (highlighted in blue) row in the suggestion table
		var oSelectedRow2 = oInput._getSuggestionsPopover().getItemsContainer().getItems()[2];
		assert.ok(oSelectedRow2.getSelected(), true, "First item is selected");
		assert.equal(oSelectedRow2.getCells()[0].getText().toLowerCase(), oInput.getValue().toLowerCase(), "The value of the input is the same as the value of the selected row");

		// act
		oSelectedRow2.ontap(new jQuery.Event());
		this.clock.tick(500);

		// assert
		assert.notOk(oInput._getSuggestionsPopover().isOpen(), "Suggestion Popup should NOT be opened");
		assert.equal(oSelectedRow2.getId(), oInput.getSelectedRow(), "SuggestionRow should be correctly set");

		// clean up
		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions - remove suggestions", async function (assert) {
		// Arrange
		var oInput = new Input({
			showSuggestion: true,
			suggestionColumns: [
				new Column({
					header: new Label({
						text: "{i18n>/Name}"
					})
				}),
				new Column({
					header : new Label({
						text : "{i18n>/Qty}"
					})
				}),
				new Column({
					header : new Label({
						text : "{i18n>/Value}"
					})
				}),
				new Column({
					header : new Label({
						text : "{i18n>/Price}"
					})
				})
			]}),
			oTableItemTemplate = new ColumnListItem({
				vAlign : "Middle",
				cells : [
					new Label({
						text : "{name}"
					}),
					new Label({
						text: "{qty}"
					}), new Label({
						text: "{limit}"
					}), new Label({
						text : "{price}"
					})
				]
			}),
			oSuggestionData = {
				tabularSuggestionItems : [{
					name : "Product1",
					qty : "10 EA",
					limit : "15.00 Eur",
					price : "10.00 EUR"
				}, {
					name : "Product2",
					qty : "9 EA",
					limit : "25.00 Eur",
					price : "20.00 EUR"
				}, {
					name : "Photo scan",
					qty : "8 EA",
					limit : "35.00 Eur",
					price : "30.00 EUR"
				}]
			};

		var oModel = new JSONModel(oSuggestionData);

		oInput.setModel(oModel);
		oInput.bindSuggestionRows({
			path: "/tabularSuggestionItems",
			template: oTableItemTemplate
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		var oRemovedRow = oInput.getSuggestionRows()[0];
		oInput.removeSuggestionRow(oRemovedRow);

		// Assert
		assert.strictEqual(oInput.getSuggestionRows().length, 2, "A suggestions is removed");

		// Act
		oInput.removeAllSuggestionRows();

		// Assert
		assert.strictEqual(oInput.getSuggestionRows().length, 0, "All suggestions are removed");

		// Destroy
		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions - 'typahead' should consider visibility of suggestion", async function (assert) {
		// Arrange
		var oInput = new Input({
			showSuggestion: true,
			suggestionColumns: [
				new Column({
					header: new Label({
						text: "Name"
					})
				}),
				new Column({
					header : new Label({
						text : "Qty"
					})
				}),
				new Column({
					header : new Label({
						text : "Value"
					})
				}),
				new Column({
					header : new Label({
						text : "Price"
					})
				})
			]}),
			oTableItemTemplate = new ColumnListItem({
				cells : [
					new Label({
						text : "{name}"
					}),
					new Label({
						text: "{qty}"
					}),
					new Label({
						text: "{limit}"
					}),
					new Label({
						text : "{price}"
					})
				],
				visible: "{visible}"
			}),
			oSuggestionData = {
				tabularSuggestionItems : [{
					name : "Product1",
					qty : "10 EA",
					limit : "15.00 Eur",
					price : "10.00 EUR",
					visible: false
				}, {
					name : "Product2",
					qty : "9 EA",
					limit : "25.00 Eur",
					price : "20.00 EUR",
					visible: true
				}, {
					name : "Photo scan",
					qty : "8 EA",
					limit : "35.00 Eur",
					price : "30.00 EUR",
					visible: true
				}]
			};

		var oModel = new JSONModel(oSuggestionData);

		oInput.setModel(oModel);
		oInput.bindSuggestionRows({
			path: "/tabularSuggestionItems",
			template: oTableItemTemplate
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		oInput._$input.trigger("focus").val("P").trigger("input");
		oInput._openSuggestionsPopover();
		oInput._bDoTypeAhead = true;
		oInput._handleTypeAhead(oInput);
		this.clock.tick(300);


		// Assert
		assert.strictEqual(oInput.getValue(), "Product2", "Typeahead skipped the invisible item and the correct autofilled value is populated in the input.");

		// Destroy
		oInput.destroy();
	});

	QUnit.test("The suggestionSeparators property should be correctly set", async function (assert) {
		var oInput9 = new Input({
			showSuggestion: true,
			suggestionItems: [
				new Item({ text: "Test 1" }),
				new Item({ text: "Test 2" }),
				new Item({ text: "Test 3" })
			]
		});

		// Arrange
		oInput9.placeAt("content");
		await nextUIUpdate(this.clock);

		// Assert
		assert.equal(oInput9.getProperty("separateSuggestions"), true, "The separateSuggestions property initially set to true");

		assert.equal(oInput9._getSuggestionsTable().getShowSeparators(), "Inner", "The showSeparators property of the suggestionsTable initially set to sap.m.ListSeparators.Inner");

		// Act
		oInput9._setSeparateSuggestions(false);

		// Assert
		assert.equal(oInput9.getProperty("separateSuggestions"), false, "The separateSuggestions property set to false");

		assert.equal(oInput9._getSuggestionsTable().getShowSeparators(), "None", "The showSeparators property of the suggestionsTable set to sap.m.ListSeparators.None");

		// Clean
		oInput9.destroy();
	});

	QUnit.test("Property startSuggestion on Desktop (non Zero)",  async function(assert) {
		var oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			};

		this.stub(Device, "system").value(oSystem);

		var spy = this.spy();

		var oInput = new Input({
			showSuggestion: true,
			startSuggestion: 4,
			suggest: spy
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput._$input.trigger("focus").val("25").trigger("input");
		this.clock.tick(400);
		assert.equal(spy.callCount, 0, "2 letters shouldn't fire suggest event");

		oInput._$input.trigger("focus").val("2524").trigger("input");
		this.clock.tick(400);
		assert.equal(spy.callCount, 1, "4 letters shouldn fire suggest event");

		oInput._$input.trigger("focus").val("25245").trigger("input");
		this.clock.tick(400);
		assert.equal(spy.callCount, 2, "5 letters should fire suggest event again");

		oInput.destroy();
	});

	QUnit.test("Property startSuggestion on Desktop (Zero)",  async function(assert) {
		var oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			};

		this.stub(Device, "system").value(oSystem);

		var spy = this.spy();

		var oInput = new Input({
			showSuggestion: true,
			startSuggestion: 0,
			suggest: spy
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput._$input.trigger("focus");
		this.clock.tick(400);
		assert.equal(spy.callCount, 1, "Focus should fire suggest event");

		oInput._$input.trigger("focus").val("25").trigger("input");
		this.clock.tick(400);
		assert.equal(spy.callCount, 2, "2 letters should'n fire suggest event");

		oInput._$input.trigger("blur");
		oInput._$input.trigger("focus");
		this.clock.tick(400);
		assert.equal(spy.callCount, 2, "Focus with text in input shouldn't fire suggest event");

		oInput._$input.trigger("focus").val("").trigger("input");
		this.clock.tick(400);
		assert.equal(spy.callCount, 3, "no text should fire suggest event again");

		oInput.destroy();
	});

	QUnit.test("The order of setting properties: showValueHelp, bindAggregation and showSuggestion", async function(assert){
		this.clock.restore(); // No fake timers (set at beforeEach hook) needed in that test, nextUIUpdate is called without clock as parameter
		var oInput = new Input({
			width: "100px",
			maxSuggestionWidth: "500px",
			suggestionColumns: [
				new Column({
					styleClass: "name",
					hAlign: "Left",
					header: new Label({
						text: "{i18n>/Name}"
					})
				}),
				new Column({
					hAlign : "Center",
					styleClass : "qty",
					popinDisplay : "Inline",
					header : new Label({
						text : "{i18n>/Qty}"
					}),
					minScreenWidth : "Tablet",
					demandPopin : true
				}),
				new Column({
					hAlign : "Center",
					styleClass : "limit",
					width : "30%",
					header : new Label({
						text : "{i18n>/Value}"
					}),
					minScreenWidth : "XXSmall",
					demandPopin : true
				}),
				new Column({
					hAlign : "Right",
					styleClass : "price",
					width : "30%",
					popinDisplay : "Inline",
					header : new Label({
						text : "{i18n>/Price}"
					}),
					minScreenWidth : "400px",
					demandPopin : true
				})
			]});

		var oTableItemTemplate = new ColumnListItem({
			vAlign : "Middle",
			cells : [
				new Label({
					text : "{name}"
				}),
				new Label({
					text: "{qty}"
				}), new Label({
					text: "{limit}"
				}), new Label({
					text : "{price}"
				})
			]
		});

		// data for tabular suggestions
		var oSuggestionData = {
			tabularSuggestionItems : [{
				name : "Product1",
				qty : "10 EA",
				limit : "15.00 Eur",
				price : "10.00 EUR"
			}, {
				name : "Product2",
				qty : "9 EA",
				limit : "25.00 Eur",
				price : "20.00 EUR"
			}, {
				name : "Product3",
				qty : "8 EA",
				limit : "35.00 Eur",
				price : "30.00 EUR"
			}]
		};

		var oModel = new JSONModel().setData(oSuggestionData);

		oInput.setModel(oModel);
		oInput.setShowValueHelp(true);
		oInput.bindSuggestionRows({
			path: "/tabularSuggestionItems",
			template: oTableItemTemplate
		});

		oInput.placeAt("content");
		await nextUIUpdate();

		oInput.setShowSuggestion(true);
		await nextUIUpdate();

		assert.ok(oInput._getSuggestionsPopover().getPopover(), "Suggestion Popup instance is created");
		assert.ok(oInput._getSuggestionsPopover().getPopover().getFooter().isA("sap.m.Toolbar"), "Suggestion Popup has Toolbar footer");
		assert.ok(oInput._getSuggestionsPopover().getPopover().getFooter().getContent()[1].isA("sap.m.Button"), "Suggestion Popup has showMoreButton");

		oInput.destroy();
	});

	QUnit.test("The order of setting properties: showValueHelp, showSuggestion after bindAggregation", async function(assert){
		this.clock.restore(); // No fake timers needed in this test so reset them, because they are set in beforeEach hook
		var oInput = new Input({
			width: "100px",
			maxSuggestionWidth: "500px",
			suggestionColumns: [
				new Column({
					styleClass: "name",
					hAlign: "Left",
					header: new Label({
						text: "{i18n>/Name}"
					})
				}),
				new Column({
					hAlign : "Center",
					styleClass : "qty",
					popinDisplay : "Inline",
					header : new Label({
						text : "{i18n>/Qty}"
					}),
					minScreenWidth : "Tablet",
					demandPopin : true
				}),
				new Column({
					hAlign : "Center",
					styleClass : "limit",
					width : "30%",
					header : new Label({
						text : "{i18n>/Value}"
					}),
					minScreenWidth : "XXSmall",
					demandPopin : true
				}),
				new Column({
					hAlign : "Right",
					styleClass : "price",
					width : "30%",
					popinDisplay : "Inline",
					header : new Label({
						text : "{i18n>/Price}"
					}),
					minScreenWidth : "400px",
					demandPopin : true
				})
			]});

		var oTableItemTemplate = new ColumnListItem({
			vAlign : "Middle",
			cells : [
				new Label({
					text : "{name}"
				}),
				new Label({
					text: "{qty}"
				}), new Label({
					text: "{limit}"
				}), new Label({
					text : "{price}"
				})
			]
		});

		// data for tabular suggestions
		var oSuggestionData = {
			tabularSuggestionItems : [{
				name : "Product1",
				qty : "10 EA",
				limit : "15.00 Eur",
				price : "10.00 EUR"
			}, {
				name : "Product2",
				qty : "9 EA",
				limit : "25.00 Eur",
				price : "20.00 EUR"
			}, {
				name : "Product3",
				qty : "8 EA",
				limit : "35.00 Eur",
				price : "30.00 EUR"
			}]
		};

		var oModel = new JSONModel().setData(oSuggestionData);

		oInput.setModel(oModel);

		oInput.bindSuggestionRows({
			path: "/tabularSuggestionItems",
			template: oTableItemTemplate
		});
		oInput.setShowValueHelp(true);

		oInput.placeAt("content");
		await nextUIUpdate();

		oInput.setShowSuggestion(true);

		assert.ok(oInput._getSuggestionsPopover().getPopover(), "Suggestion Popup instance is created");
		assert.ok(oInput._getSuggestionsPopover().getPopover().getFooter().isA("sap.m.Toolbar"), "Suggestion Popup has Toolbar footer");
		assert.ok(oInput._getSuggestionsPopover().getPopover().getFooter().getContent()[1].isA("sap.m.Button"), "Suggestion Popup has showMoreButton");

		oInput.destroy();
	});

	QUnit.test("Highlighting", async function(assert) {
		var oInput = createInputWithSuggestions();

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("It").trigger("input");

		this.clock.tick(500);

		var $labels = oInput._getSuggestionsPopover().getPopover().$().find('.sapMDLILabel, .sapMSLITitleOnly, .sapMDLIValue');

		assert.ok($labels[0].innerHTML.indexOf('<span') > -1, "Texts is highlighted");

		oInput.destroy();
	});

	QUnit.test("Create Suggestions Popover after suggestion items are added", async function(assert) {
		this.clock.restore();// No fake timers needed in this test so reset them, because they are set in beforeEach hook
		// arrange
		var oInput = new Input({
			suggestionItems: [new Item({text: "test"})]
		});

		oInput.placeAt("content");
		await nextUIUpdate();

		// act
		oInput.setShowSuggestion(true); // set show suggestion after items are added
		await nextUIUpdate();

		// assert
		assert.ok(oInput._getSuggestionsPopover().getItemsContainer(), "List should be created when enabling suggestions");

		// clean up
		oInput.destroy();
		oInput = null;
	});

	QUnit.test("Suggestions placement", function(assert) {
		// arrange
		var oInput = new Input({
			showSuggestion: true,
			suggestionItems: [new Item({text: "test"})]
		});

		var oSuggPopup = oInput._oSuggestionPopup;

		var oDialog = new Dialog({
			content: [oInput]
		});

		// act
		oDialog.open();
		this.clock.tick(300);
		oInput._openSuggestionsPopover();

		// assert
		assert.ok(oInput.$().offset().top < oSuggPopup.$().offset().top, "SuggestionsPopover should be opened below the input");

		// clean up
		oDialog.destroy();
		oInput.destroy();
		oDialog = null;
	});

	QUnit.test("Set showSuggestions", async function (assert) {

		// Arrange
		var oInput = new Input({
			startSuggestion: 0,
			showSuggestion: true,
			suggestionItems: [
				new Item({ text: "test" })
			]
		});
		var fnTriggerSuggestSpy = sinon.spy(oInput, "_triggerSuggest");
		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.onfocusin();
		oInput._$input.trigger("focus").val("te").trigger("input");

		this.clock.tick(400);

		// Assert
		assert.ok(fnTriggerSuggestSpy.called, "Should have triggered suggest.");
		assert.ok(oInput._getSuggestionsPopover().getPopover(), "Should have suggestions popover.");
		assert.ok(oInput._getSuggestionsPopover().getPopover().isOpen(), "Should have opened suggestions popover.");
		assert.ok(oInput._getSuggestionsPopover().getItemsContainer(), "Should have created a list with suggestions.");

		// Act
		oInput._$input.val("");
		oInput.onfocusout();
		oInput.setShowSuggestion(false);
		fnTriggerSuggestSpy.reset();
		oInput.onfocusin();
		oInput._$input.trigger("focus").val("te").trigger("input");

		this.clock.tick(300);

		// Assert
		assert.notOk(fnTriggerSuggestSpy.called, "Should have NOT triggered suggest.");

		// Act
		oInput._$input.val("");
		oInput.onfocusout();
		oInput.setShowSuggestion(true);
		fnTriggerSuggestSpy.reset();
		oInput.onfocusin();
		oInput._$input.trigger("focus").val("te").trigger("input");

		this.clock.tick(300);

		// Assert
		assert.ok(fnTriggerSuggestSpy.called, "Should have triggered suggest.");
		assert.ok(oInput._getSuggestionsPopover().getPopover(), "Should have suggestions popover.");
		assert.ok(oInput._getSuggestionsPopover().getPopover().isOpen(), "Should have opened suggestions popover.");
		assert.ok(oInput._getSuggestionsPopover().getItemsContainer(), "Should have created a list with suggestions.");

		// Cleanup
		fnTriggerSuggestSpy.restore();
		oInput.destroy();
	});

	QUnit.test("Toggling true / false for showSuggestions should not throw an error", async function (assert) {
		this.clock.restore();// No fake timers needed in this test so reset them, because they are set in beforeEach hook
		var oInput = new Input({
			showSuggestion: true,
			suggestionColumns: [
				new Column({})
			],
			suggestionRows: [
				new ColumnListItem({
					cells: [new Label({text: "bla"})]
				})
			]
		});

		oInput.placeAt("content");
		await nextUIUpdate();

		// Trigger false
		oInput.setShowSuggestion(!oInput.getShowSuggestion());
		await nextUIUpdate();

		assert.notOk(this._oButtonToolbar, "Toolbar ref should be cleaned up");
		assert.notOk(this._oShowMoreButton, "Button ref should be cleaned up");

		// Trigger true
		oInput.setShowSuggestion(!oInput.getShowSuggestion());
		await nextUIUpdate();

		assert.ok(true, "No exception should be thrown");

		oInput.destroy();
	});

	QUnit.test("Late binding on suggest event", async function (assert) {
		var oModel = new JSONModel({
				"items": [
					{key: "text1", value: "Text 1"},
					{key: "text2", value: "Text 2"},
					{key: "text3", value: "Text 3"},
					{key: "text4", value: "Text 4"}
				]
			}),
			oInput = new Input({
				showSuggestion: true,
				suggest: function () {
					oInput.bindAggregation("suggestionItems", {
						path: "/items",
						template: new Item({key: "{key}", text: "{value}"}),
						templateShareable: true
					});
				}
			}).setModel(oModel);

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		oInput.focus();
		oInput._$input.val("Tex");
		oInput._triggerSuggest("Tex");
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		// Assert
		assert.ok(oInput._isSuggestionsPopoverOpen(), "SuggestionsPopup should be open.");

		// Cleanup
		oModel.destroy();
		oInput.destroy();
	});

	QUnit.module("Key and Value", {
		afterEach: function(){
			runAllTimersAndRestore(this.clock);
		}
	});

	function createInputWithSuggestions () {

		var aSuggestionItems = [
			new ListItem({
				key: '1',
				text: '1 Item 1',
				additionalText: 'Desc 1'
			}),
			new ListItem({
				key: '2',
				text: 'Item 2',
				additionalText: 'Desc 2'
			}),
			new ListItem({
				key: '3',
				text: 'Item 3',
				additionalText: 'Desc 3'
			}),
			new ListItem({
				key: '4',
				text: 'Item 4',
				additionalText: 'Desc 4'
			}),
			new ListItem({
				key: '5',
				text: 'Item 5',
				additionalText: 'Desc 5'
			})
		];

		var oInput = new Input({
			showSuggestion: true,
			suggestionItems: aSuggestionItems
		});

		return oInput;
	}

	QUnit.test("Set selection", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oInput = createInputWithSuggestions(),
				fnCallback = this.spy();

		oInput.attachSuggestionItemSelected(fnCallback);

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("It").trigger("input");

		this.clock.tick(500);

		var oItem = oInput._getSuggestionsPopover().getPopover().getContent()[0].getItems()[0];
		assert.ok(oItem, "Item should be created");

		oItem.focus();
		oItem.$().trigger("tap");

		this.clock.tick(50);

		assert.equal(fnCallback.callCount, 1, "change event handler only called once");
		assert.equal(oInput.getSelectedKey(), "1", "selected key is correct");

		fnCallback.resetHistory();
		oInput.destroy();
	});

	QUnit.test("Set selection with 'ENTER' key press", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oInput = createInputWithSuggestions();
		var fnOnChangeSpy = this.spy(InputBase.prototype, 'onChange');

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		oInput._$input.trigger("focus").val("It").trigger("input");
		this.clock.tick(300);

		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ENTER);
		this.clock.tick();

		// Assert
		assert.strictEqual(fnOnChangeSpy.calledOnce, true, "change event handler only called once");

		// Clean
		fnOnChangeSpy.restore();
		oInput.destroy();
	});

	QUnit.test("Set selection with 'ENTER' key press with suggestions opened and typeahead should set the selectedKey property", async function(assert) {
		// Arrange
		this.clock = sinon.useFakeTimers();
		var oInput = createInputWithSuggestions();
		var oSetSelectionItemSpy = this.spy(oInput, "setSelectionItem");

		oInput.placeAt("content");
		oInput._bDoTypeAhead = true;
		oInput._createSuggestionPopupContent();
		await nextUIUpdate(this.clock);

		// Act
		oInput._$input.trigger("focus").val("it").trigger("input");
		this.clock.tick(300);

		oInput._getFilteredSuggestionItems("it");
		oInput._openSuggestionsPopover();
		this.clock.tick(300);

		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ENTER);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSetSelectionItemSpy.firstCall.args[1], true, "Second parameter was 'true' indicating the selection was made by interaction.");
		assert.strictEqual(oInput.getSelectedKey(), "2", "The 'selectedKey' property was set properly");

		// Clean
		oSetSelectionItemSpy.restore();
		oInput.destroy();
	});

	QUnit.test("Set selection with 'ENTER' key press with tabular suggestions opened and typeahead should call setSelectionRow method", async function(assert) {
		// Arrange
		var oInput = createInputWithTabularSuggestions();
		var oSetSelectionRowSpy = this.spy(oInput, "setSelectionRow");

		oInput.placeAt("content");
		oInput._bDoTypeAhead = true;
		oInput._createSuggestionPopupContent(true);
		await nextUIUpdate();

		// Act
		oInput._$input.trigger("focus").val("Auch").trigger("input");
		oInput._getFilteredSuggestionItems("Auch");
		oInput._openSuggestionsPopover();
		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ENTER);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSetSelectionRowSpy.callCount, 1, "'setSelectionRow' was called once.");
		assert.strictEqual(oSetSelectionRowSpy.firstCall.args[1], true, "Second parameter was 'true' indicating the selection was made by interaction.");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Selected item from value help is set to the input", async function(assert) {
		var oInput = createInputWithSuggestions(),
			oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		oInput.setShowValueHelp(true);
		oInput.setType("Text");
		oInput.setTextFormatMode("KeyValue");

		oInput.placeAt("content");
		await nextUIUpdate();

		oInput.setSelectedKey("2");
		assert.equal(oInput.getDOMValue(), "(2) Item 2", "Selected input value is " + oInput.getDOMValue());

		this.stub(Device, "system").value(oSystem);

		oInput.setSelectedKey("3");
		assert.equal(oInput.getDOMValue(), "(3) Item 3", "Selected input value is " + oInput.getDOMValue());

		oInput.destroy();
	});

	QUnit.test("Update selected key after bind data is changed", async function(assert) {
		var oModelData = new JSONModel([{text: "a1"}, {text: "a2"}]),
			oInput = new Input({
				showSuggestion: true,
				selectedKey: 'a1',
				suggestionItems: {
					path: '/',
					template: new Item({
						text: '{text}',
						key: '{text}'
					})
				}
			});

		oInput.placeAt("content");
		await nextUIUpdate();

		assert.equal(oInput.getValue(), "", "Initially when the input has selected key but no suggestion items it's value has to be empty");

		oInput.setModel(oModelData);
		await nextUIUpdate();

		assert.equal(oInput.getValue(), "a1", "After a json model is set and one of the items has key that item has to be selected");


		oInput.setSelectedKey("a3");
		await nextUIUpdate();

		assert.equal(oInput.getValue(), "", "After setting new selected key which is not in the list items the value should be empyt");

		oInput.setValue("New value");

		oInput.setSelectedKey("");
		await nextUIUpdate();

		assert.equal(oInput.getValue(), "", "After the selected key to empty string, the value should be cleared");

		oInput.setSelectedKey("a3");

		oInput.setValue('');
		oInput.addSuggestionItem(new Item({text: "a3", key: "a3"}));
		await nextUIUpdate();

		assert.equal(oInput.getValue(), "a3", "The value must be set to the selected key");

		oInput.removeAllSuggestionItems();
		await nextUIUpdate();

		assert.equal(oInput.getValue(), "", "The value must be cleared after removing all items");

		oInput.addSuggestionItem(new Item({text: "a3", key: "a3"}));
		await nextUIUpdate();

		assert.equal(oInput.getValue(), "a3", "The value must be set to the selected key");

		oInput.destroySuggestionItems();
		await nextUIUpdate();

		assert.equal(oInput.getValue(), "", "The value must be cleared after destroying all items");

		var oItem = new Item({text: "a3", key: "a3"});
		oInput.addSuggestionItem(oItem);
		await nextUIUpdate();

		assert.equal(oInput.getValue(), "a3", "The value must be set to the selected key");

		oInput.removeSuggestionItem(oItem);
		await nextUIUpdate();

		assert.equal(oInput.getValue(), "", "The value must be cleared after removing item");

		oItem.destroy();
		oInput.destroy();
	});

	QUnit.test("Set selection via API", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oInput = createInputWithSuggestions(),
				fnCallback = this.spy();

		oInput.attachSuggestionItemSelected(fnCallback);

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.setSelectedItem(oInput.getSuggestionItems()[1]);
		this.clock.tick(50);

		assert.equal(fnCallback.callCount, 0, "change event is not fired");
		assert.equal(oInput.getSelectedKey(), "2", "selected key is correct");

		fnCallback.resetHistory();
		oInput.destroy();
	});

	QUnit.test("Item selection updates the model when previously deleted value matches the item text", async function(assert) {
		var oInput = new Input({
			value: '{/value}',
			showSuggestion: true,
			suggestionItems: {
				path: '/suggestionItems',
				template: new Item({
					text: '{text}'
				})
			}
		});

		var oModelData = {
			value: "",
			suggestionItems: [
				{text: "111"},
				{text: "112"},
				{text: "113"}
			]
		};

		oInput.setModel(new JSONModel(oModelData));
		oInput.placeAt("content");
		await nextUIUpdate();

		oInput.setValue("111");
		await nextUIUpdate();

		oInput.setValue("");
		oInput.setLastValue("111");
		await nextUIUpdate();

		assert.equal(oInput.getModel().getData().value, "", "The model value is cleared");

		oInput.setSelectedItem(oInput.getSuggestionItems()[0]);
		await nextUIUpdate();

		assert.equal(oInput.getModel().getData().value, "111", "The model value is updated");

		oInput.destroy();
	});

	QUnit.test("Set selection should stop if input is destroyed after firing change event", function (assert) {
		// Arrange
		var oInput = createInputWithSuggestions(),
			fnChangeHandler = function () {
				oInput.destroy();
			},
			oSpy = sinon.spy(fnChangeHandler);

		oInput.attachChange(oSpy);

		// Act
		oInput.setSelectedItem(oInput.getSuggestionItems()[1]);

		// Assert
		assert.ok(oSpy.calledOnce, "Should call handler. It is possible that this handler destroys the input.");
		assert.strictEqual(oInput._oSuggPopover, null, "Suggestions popover is destroyed");

		// Clean up
		oSpy.reset();
		oInput.destroy();
		oInput = null;
	});

	QUnit.test("setSelectionItem should not try closing the suggestions popover when there is no suggestions popup opened", function(assert) {
		var oInput = new Input(),
			oItem = new SuggestionItem({key: "key", text: "text"}),
			oSpy;

		// Arrange
		oInput.setShowSuggestion(true);
		oSpy = sinon.spy(oInput._getSuggestionsPopover().getPopover(), "close");

		// act
		oInput.setSelectionItem(oItem, false);

		// assert
		assert.strictEqual(oSpy.callCount, 0, "The close method of the suggestions popover was not called");

		// clean
		oSpy.restore();
		oItem.destroy();
		oInput.destroy();
	});

	QUnit.test("Tabular suggestions - Set selection should stop if input is destroyed after firing change event", function (assert) {
		// Arrange
		var oInput = createInputWithTabularSuggestions(),
			fnChangeHandler = function () {
				oInput.destroy();
			},
			oSpy = sinon.spy(fnChangeHandler);

		oInput.attachChange(oSpy);

		// Act
		oInput.setSelectedRow(oInput.getSuggestionRows()[1]);

		// Assert
		assert.ok(oSpy.calledOnce, "Should call handler. It is possible that this handler destroys the input.");
		assert.strictEqual(oInput._oSuggPopover, null, "Suggestions popover is destroyed");

		// Clean up
		oSpy.reset();
		oInput.destroy();
		oInput = null;
	});

	QUnit.test("Set selection before suggestionItems", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var aSuggestionItems = [
			new ListItem({
				key: '1',
				text: '1 Item 1',
				additionalText: 'Desc 1'
			}),
			new ListItem({
				key: '2',
				text: 'Item 2',
				additionalText: 'Desc 2'
			}),
			new ListItem({
				key: '3',
				text: 'Item 3',
				additionalText: 'Desc 3'
			}),
			new ListItem({
				key: '4',
				text: 'Item 4',
				additionalText: 'Desc 4'
			}),
			new ListItem({
				key: '5',
				text: 'Item 5',
				additionalText: 'Desc 5'
			})
		],
		oInput = new Input({
			showSuggestion: true,
			selectedKey: "5",
			suggestionItems: aSuggestionItems
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		this.clock.tick(50);

		assert.equal(oInput.getSelectedKey(), "5", "selected key is correct");

		assert.equal(oInput.getValue(), "Item 5", "selected key is correct in dom");

		oInput.destroy();
	});

	QUnit.test("Display text formatting", async function(assert) {
		var oInput = createInputWithSuggestions();

		oInput.setTextFormatMode(InputTextFormatMode.ValueKey);

		oInput.placeAt("content");
		await nextUIUpdate();

		oInput.setSelectedItem(oInput.getSuggestionItems()[1]);

		var sValue = oInput.getValue();
		assert.equal(sValue, "Item 2 (2)", "value is correctly formatted");

		oInput.setTextFormatter(function (item) {
			return 'Custom: ' + item.getText() + " (" + item.getKey() + ")";
		});

		oInput.setSelectedItem(oInput.getSuggestionItems()[2]);

		sValue = oInput.getValue();
		assert.equal(sValue, "Custom: Item 3 (3)", "custom formatting is correct");

		oInput.destroy();
	});

	function createInputWithTabularSuggestions () {

		var oSuggestionData = {
			tabularSuggestionItems: [
				{
					id: "1",
					name: "Auch ein gutes Ding",
					qty: "3 EA",
					limit: "99.00 EUR",
					price: "17.00 EUR"
				}, {
					id: "2",
					name: "Besser ist das",
					qty: "1 EA",
					limit: "20.00 EUR",
					price: "13.00 EUR"
				}, {
					id: "3",
					name: "Holter-di-polter",
					qty: "10 EA",
					limit: "15.00 EUR",
					price: "12.00 EUR"
				}, {
					id: "4",
					name: "Ha so was",
					qty: "10 EA",
					limit: "5.00 EUR",
					price: "3.00 EUR"
				}, {
					id: "5",
					name: "Hurra ein Produkt",
					qty: "8 EA",
					limit: "60.00 EUR",
					price: "45.00 EUR"
				}, {
					id: "6",
					name: "Hallo du tolles Ding",
					qty: "2 EA",
					limit: "40.00 EUR",
					price: "15.00 EUR"
				}, {
					id: "7",
					name: "Hier sollte ich zuschlagen",
					qty: "10 EA",
					limit: "90.00 EUR",
					price: "55.00 EUR"
				}, {
					id: "8",
					name: "Hohoho",
					qty: "18 EA",
					limit: "29.00 EUR",
					price: "7.00 EUR"
				}, {
					id: "9",
					name: "Holla die Waldfee",
					qty: "3 EA",
					limit: "55.00 EUR",
					price: "30.00 EUR"
				}, {
					id: "10",
					name: "Hau Ruck",
					qty: "5 EA",
					limit: "2.00 EUR",
					price: "1.00 EUR"
				}]
		};
		var tableModel = new JSONModel();
		tableModel.setData(oSuggestionData);

		var oTableItemTemplate = new ColumnListItem({
			type: "Active",
			vAlign: "Middle",
			cells: [
				new Label({
					text: "{name}"
				}),
				new Label({
					text: "{qty}"
				}), new Label({
					text: "{limit}"
				}), new Label({
					text: "{price}"
				}),
				new Label({
					text: "{id}"
				})
			]
		});

		var oInput = new Input({
			showSuggestion: true,
			suggestionRowValidator: function (oColumnListItem) {
				var cells = oColumnListItem.getCells();

				return new Item({
					key: cells[4].getText(),
					text: cells[0].getText() + ' = ' + cells[2].getText()
				});
			},
			suggestionRows: {
				path: '/tabularSuggestionItems',
				template: oTableItemTemplate,
				templateShareable: false
			},
			suggestionColumns: [
				new Column({
					styleClass: "name",
					hAlign: "Begin",
					header: new Label({
						text: "{Name}"
					})
				}),
				new Column({
					hAlign: "Center",
					styleClass: "qty",
					popinDisplay: "Inline",
					header: new Label({
						text: "{Qty}"
					}),
					minScreenWidth: "Tablet",
					demandPopin: true
				}),
				new Column({
					hAlign: "Center",
					styleClass: "limit",
					width: "30%",
					header: new Label({
						text: "{Value}"
					}),
					minScreenWidth: "XXSmall",
					demandPopin: true
				}),
				new Column({
					hAlign: "End",
					styleClass: "price",
					width: "30%",
					popinDisplay: "Inline",
					header: new Label({
						text: "{Price}"
					}),
					minScreenWidth: "400px",
					demandPopin: true
				}),
				new Column({
					styleClass: "name",
					hAlign: "Begin",
					visible: false,
					header: new Label({
						text: "{id}"
					})
				})
			]
		});

		oInput.setModel(tableModel);

		return oInput;
	}

	QUnit.test("Tabular Suggestions - Set selection via API", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oInput = createInputWithTabularSuggestions(),
				fnCallback = this.spy();

		oInput.attachSuggestionItemSelected(fnCallback);

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.setSelectedRow(oInput.getSuggestionRows()[1]);

		this.clock.tick(50);

		assert.equal(fnCallback.callCount, 0, "change event is not fired");
		assert.equal(oInput.getSelectedKey(), "2", "selected key is correct");
		assert.equal(oInput.getValue(), "Besser ist das = 20.00 EUR", "value is correct");

		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions - Set selection via keyboard", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oInput = createInputWithTabularSuggestions(),
				fnChangeCallback = this.spy(),
				fnSuggestionItemSelectedCallback = this.spy();

		oInput.attachChange(fnChangeCallback);
		oInput.attachSuggestionItemSelected(fnSuggestionItemSelectedCallback);

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput._$input.trigger("focus").val("Au").trigger("input");
		this.clock.tick(500);
		qutils.triggerKeydown(document.activeElement, "40"); // bottom (arrow)
		qutils.triggerKeydown(document.activeElement, "ENTER");

		assert.equal(fnChangeCallback.callCount, 1, "change event is fired once");
		assert.equal(fnSuggestionItemSelectedCallback.callCount, 1, "suggestionItemSelected event is fired once");
		assert.equal(fnChangeCallback.calledAfter(fnSuggestionItemSelectedCallback), true, "change event is called after suggestionItemSelected event");

		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions - Set selection on focus out", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oInput = createInputWithTabularSuggestions(),
				fnChangeCallback = this.spy(),
				fnSuggestionItemSelectedCallback = this.spy();

		oInput.attachChange(fnChangeCallback);
		oInput.attachSuggestionItemSelected(fnSuggestionItemSelectedCallback);

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput._$input.trigger("focus").val("Au").trigger("input");
		this.clock.tick(500);

		qutils.triggerKeydown(document.activeElement, "40"); // bottom (arrow)

		// simulate focus out
		oInput._getSuggestionsPopover().getPopover().close();

		assert.equal(fnChangeCallback.callCount, 1, "change event is fired once");
		assert.equal(fnSuggestionItemSelectedCallback.callCount, 1, "suggestionItemSelected event is fired once");
		assert.equal(fnChangeCallback.calledAfter(fnSuggestionItemSelectedCallback), true, "change event is called after suggestionItemSelected event");

		fnChangeCallback.resetHistory();
		fnSuggestionItemSelectedCallback.resetHistory();
		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions - Set selected row filter function", function(assert) {
		var oInput = createInputWithTabularSuggestions();
		// Remove the SuggestionRowValidator function for the test.
		oInput.setSuggestionRowValidator(null);
		oInput.setSelectedRow(oInput.getSuggestionRows()[0]);
		oInput.setRowResultFunction(function (oColumnListItem) {
			return "You chose: " + oColumnListItem.getCells()[0].getText();
		});

		assert.equal(oInput.getValue(), "You chose: Auch ein gutes Ding", "value should be updated after setting the row result function");

		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions - Display text formatting", async function(assert) {
		var oInput = createInputWithTabularSuggestions();

		oInput.setTextFormatMode(InputTextFormatMode.ValueKey);

		oInput.placeAt("content");
		await nextUIUpdate();

		oInput.setSelectedRow(oInput.getSuggestionRows()[1]);

		var sValue = oInput.getValue();
		assert.equal(sValue, "Besser ist das = 20.00 EUR (2)", "value is correctly formatted");

		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions - Autopopin mode", async function(assert) {
		this.clock = sinon.useFakeTimers();

		// Arrange
		var oInput = createInputWithTabularSuggestions();
		oInput.placeAt("content");

		// Act
		oInput.setEnableTableAutoPopinMode(true);
		this.clock.tick(300);
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(oInput._getSuggestionsTable().getAutoPopinMode(), "The table should have autopopin set to true.");

		// Act
		oInput.setEnableTableAutoPopinMode(false);
		this.clock.tick(300);
		await nextUIUpdate();

		// Assert
		assert.notOk(oInput._getSuggestionsTable().getAutoPopinMode(), "The table should have autopopin set to false.");

		// Clean up
		oInput.destroy();
	});

	QUnit.module("Input Description");

	QUnit.test("Input description", async function(assert) {
		var oInputWithDes = new Input({
			value: "220"
		});
		oInputWithDes.setDescription("EUR");
		oInputWithDes.placeAt("content");
		await nextUIUpdate();

		assert.equal(oInputWithDes.$().find(".sapMInputDescriptionText").text(), "EUR", "Input description is EUR");

		oInputWithDes.setFieldWidth("100px");
		await nextUIUpdate();

		assert.equal(oInputWithDes.$('descr').text(), "EUR", "Description ID is set to the correct span");
		assert.equal(oInputWithDes.getDomRef('descr').id, oInputWithDes.$('inner').attr('aria-describedby'), "Inner input aria-describedby attribute is correct");

		oInputWithDes.destroy();
	});

	QUnit.module("Accessibility", {
		afterEach: function() {
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("General - getAccessibilityInfo method", function(assert) {
		//Arrange
		var oInput = new Input({value: "Value", tooltip: "Tooltip", placeholder: "Placeholder"}),
			oInfo = oInput.getAccessibilityInfo(),
			oRb = Library.getResourceBundleFor("sap.m"),
			sEmptyDescriptionText = oRb.getText("INPUTBASE_VALUE_EMPTY");

		// Assert
		assert.ok(!!oInput.getAccessibilityInfo, "Input has a getAccessibilityInfo function");
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, oInput.getRenderer().getAriaRole(), "AriaRole");
		assert.strictEqual(oInput.getRenderer().getAriaRole(), "", "No custom ARIA role");
		assert.strictEqual(oInfo.type, oRb.getText("ACC_CTR_TYPE_INPUT"), "Type");
		assert.strictEqual(oInfo.description, "Value", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");

		// Act
		oInput.setValue("");
		oInput.setEnabled(false);
		oInfo = oInput.getAccessibilityInfo();

		// Assert
		assert.strictEqual(oInfo.description, sEmptyDescriptionText, "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");

		// Act
		oInput.setEnabled(true);
		oInput.setEditable(false);
		oInfo = oInput.getAccessibilityInfo();

		// Assert
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");

		// Act
		oInput.setDescription("Description");
		oInfo = oInput.getAccessibilityInfo();

		// Assert
		assert.strictEqual(oInfo.description, sEmptyDescriptionText + " Description", "Description");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("General - Popup accessible name", async function(assert) {
		this.clock = sinon.useFakeTimers();
		//Arrange
		var oInput = createInputWithSuggestions();

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("It").trigger("input");
		this.clock.tick(500);

		var $popover = oInput._getSuggestionsPopover().getPopover().$();
		this.clock.tick(500);

		// Assert
		assert.ok($popover.attr('aria-labelledby'), 'popup ariaLabelledBy is set');

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("General - aria-haspopup should be correctly applied", async function(assert) {
		//Arrange
		var oInputWithoutSuggestions = new Input({}),
			oInputWithSuggestions =  new Input({showSuggestion: true}),
			oDisabledInputWithSuggestions =  new Input({showSuggestion: true, enabled: false}),
			oReadonlyInputWithSuggestions =  new Input({showSuggestion: true, editable: false});

		oInputWithoutSuggestions.placeAt("content");
		oInputWithSuggestions.placeAt("content");
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oInputWithoutSuggestions._$input.attr("aria-haspopup"), undefined, "aria-haspopup should not be  presented.");
		assert.strictEqual(oDisabledInputWithSuggestions._$input.attr("aria-haspopup"), undefined, "aria-haspopup should not be present on a disabled input.");
		assert.strictEqual(oReadonlyInputWithSuggestions._$input.attr("aria-haspopup"), undefined, "aria-haspopup should not be present on a readonly input.");
		assert.strictEqual(oInputWithSuggestions._$input.attr("aria-haspopup"), "dialog", "aria-haspopup should have value 'dialog'.");

		//Act
		oInputWithoutSuggestions.setShowSuggestion(true);
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oInputWithoutSuggestions._$input.attr("aria-haspopup"), "dialog", "aria-haspopup should have value 'dialog'.");

		//Clean up
		oInputWithoutSuggestions.destroy();
		oInputWithSuggestions.destroy();
	});

	QUnit.test("General - Suggestions results describedby node should not be added to the Input's aria-describedby attribute to avoid redundant speech output ", async function(assert) {
		this.clock = sinon.useFakeTimers();
		//Arrange
		var oInputWithSuggestions = createInputWithSuggestions();

		oInputWithSuggestions.placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		oInputWithSuggestions._openSuggestionsPopover();
		this.clock.tick();
		await nextUIUpdate(this.clock);

		//Assert
		assert.strictEqual(oInputWithSuggestions.getFocusDomRef().getAttribute("aria-describedby"), null, "The sugg. results acc node is not referenced in the Input");

		//Clean up
		oInputWithSuggestions.destroy();
	});

	QUnit.test("Invisible Message - Input suggestions description", async function(assert) {
		this.clock = sinon.useFakeTimers();

		// Arrange
		var oAnnounceSpy = this.spy(InvisibleMessage.prototype, "announce");
		var oMessageBundle = Library.getResourceBundleFor("sap.m"),
			oInput = new Input({
				showSuggestion: true,
				suggestionItems: [
					new Item({
						text: "Item 1",
						key: "001"
					}),
					new Item({
						text: "Item 2",
						key: "002"
					})
				]
			});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		oInput.onfocusin();
		oInput._$input.trigger("focus").val("I").trigger("input");
		this.clock.tick(400);

		//Assert
		assert.ok(oAnnounceSpy.calledWith(oMessageBundle.getText("INPUT_SUGGESTIONS_MORE_HITS", 2)), "The description has correct text.");

		//Clean up
		oAnnounceSpy.restore();
		oInput.destroy();
	});

	QUnit.test("Focus handling - Leaving the input field should trigger suggestions item selection", async function(assert) {
		// Setup
		this.stub(Device, "system").value({desktop: true, phone: false, tablet: false});

		var oSelectionItem = new Item({text: "Bulgaria"}),
			oInput = new Input({
				showSuggestion: true,
				suggestionItems: [
					new Item({text: "Germany"}),
					oSelectionItem
				]
			}).placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.notOk(oInput.getSelectedItem(), "SelectedItems should be empty");

		// Act
		oInput._setProposedItemText("Bulgaria");
		oInput.onsapfocusleave({relatedControlId: null});
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oInput.getSelectedItem(), oSelectionItem.getId(), "Focusleave should have triggered item selection");
		assert.strictEqual(oInput.getSelectedKey(), oSelectionItem.getKey(), "Focusleave should have triggered key selection");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("Focus handling - Leaving the input field (when picker is open) should trigger item selection once", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var fnSpy = this.spy();
		var oInput = new Input({
			showSuggestion: true,
			suggestionItemSelected: fnSpy,
			suggestionItems: [
				new Item({text: "Item 1"}),
				new Item({text: "Item 2"}),
				new Item({text: "Item 3"})
			]
		}).placeAt("content");

		var oBtn = new Button().placeAt("content");
		await nextUIUpdate(this.clock);

		// Arrange
		oInput._createSuggestionPopupContent();
		oInput._$input.trigger("focus").val("it").trigger("input");
		this.clock.tick(300);

		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(500);
		await nextUIUpdate(this.clock);

		oInput._setProposedItemText("Item 1");
		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.TAB);
		this.clock.tick(300);
		await nextUIUpdate(this.clock);

		oBtn.focus();
		this.clock.tick(500);
		await nextUIUpdate(this.clock);

		assert.strictEqual(fnSpy.callCount, 1, "Suggestion item select should be fired once.");
		fnSpy.resetHistory();
		oBtn.destroy();
		oInput.destroy();
	});

	QUnit.test("suggestionItemSelected should be fired, when a proposed item is present vie typeahead and the user focuses out of the input", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var fnSpy = this.spy();
		var oInput = new Input({
			showSuggestion: true,
			suggestionItemSelected: fnSpy,
			suggestionItems: [
				new Item({text: "Item 1"}),
				new Item({text: "Item 2"}),
				new Item({text: "Item 3"})
			]
		}).placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		oInput.getFocusDomRef().focus();
		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.I });
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("I").trigger("input");
		this.clock.tick(300);
		oInput.getFocusDomRef().blur();
		this.clock.tick(300);


		assert.strictEqual(fnSpy.callCount, 1, "Suggestion item select should be fired");
		assert.strictEqual(oInput.getSelectedItem(), oInput.getSuggestionItems()[0].getId(), "Focusleave should have triggered item selection");
		assert.strictEqual(oInput.getSelectedKey(), oInput.getSuggestionItems()[0].getKey(), "Focusleave should have triggered key selection");
		oInput.destroy();
	});

	QUnit.test("suggestionItemSelected should be fired, when a proposed item is present vie typeahead and the user focuses out of the input (tabular)", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var fnSpy = this.spy();
		var oInput = new Input({
			showSuggestion: true,
			suggestionItemSelected: fnSpy,
			suggestionColumns: [
				new Column({})
			],
			suggestionRows: [
				new ColumnListItem({
					cells: [
						new Text({text:"Item"})
					]
				})
			]
		}).placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		oInput.getFocusDomRef().focus();
		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.I });
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("I").trigger("input");
		this.clock.tick(1000);
		oInput.getFocusDomRef().blur();
		this.clock.tick(1000);


		assert.strictEqual(fnSpy.callCount, 1, "Suggestion item select should be fired");
		assert.strictEqual(oInput.getSelectedRow(), oInput.getSuggestionRows()[0].getId(), "Focusleave should have triggered row selection");

		oInput.destroy();
	});

	QUnit.test("Previous selected row should be cleared, when the new input value does not match an item", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oInput = new Input({
			showSuggestion: true,
			suggestionColumns: [
				new Column({})
			],
			suggestionRows: [
				new ColumnListItem({
					cells: [
						new Text({text:"Item"})
					]
				})
			]
		}).placeAt("content");

		oInput.setSelectedRow(oInput.getSuggestionRows()[0]);
		await nextUIUpdate(this.clock);

		// Act
		oInput.getFocusDomRef().focus();
		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.A });
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("A").trigger("input");
		this.clock.tick(300);
		oInput.getFocusDomRef().blur();
		this.clock.tick(300);

		assert.notOk(oInput.getSelectedRow(), "Focusleave should have cleared the previous selected row");

		oInput.destroy();
	});

	QUnit.test("Focus handling - pseudo focus should return to the input after selection from the list", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// Setup
		var oInput = new Input({
				showSuggestion: true,
				suggestionItems: [
					new Item({text: "Item 1"}),
					new Item({text: "Item 2"}),
					new Item({text: "Item 3"})
				]
			}).placeAt("content");
		await nextUIUpdate(this.clock);

		// Arrange
		oInput._createSuggestionPopupContent();
		oInput._$input.trigger("focus").val("it").trigger("input");
		this.clock.tick(300);
		oInput._openSuggestionsPopover();
		this.clock.tick();

		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick();

		// Act
		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ENTER);
		this.clock.tick();

		// Assert
		assert.strictEqual(oInput.hasStyleClass("sapMFocus"), true, "The input has pseudo focus");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("Value State - Aria-describedby reference element should have a separate persistent DOM node other than the visible value state popup", async function(assert) {
		//Arrange
		var oInputWithValueState = new Input({
			valueState: "Warning",
			valueStateText: "This is a value state with warning message"
		});
		var oAccDomRef;

		oInputWithValueState.placeAt("content");
		await nextUIUpdate();
		oAccDomRef = document.getElementById(oInputWithValueState.getValueStateMessageId() + "-sr");

		//Assert
		assert.strictEqual(oInputWithValueState.getDomRef().contains(oAccDomRef), true, "Accessibility DOM is created");

		//Clean up
		oInputWithValueState.destroy();
	});

	QUnit.test("Value State - Aria-describedby attribute should persists even if the message popup is not opened", async function(assert) {
		//Arrange
		var oInputWithValueState = new Input({
			valueState: "Warning",
			valueStateText: "This is a value state with warning message"
		});

		oInputWithValueState.placeAt("content");
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oInputWithValueState.getFocusDomRef().getAttribute("aria-describedby"), oInputWithValueState.getValueStateMessageId() + "-sr", "Input has static aria-describedby reference pointing to the correct ID");

		//Clean up
		oInputWithValueState.destroy();
	});

	QUnit.test("Value State - A static aria-errormessage attribute should be added to the control when the value state is error", async function(assert) {
		//Arrange
		var oInputWithValueState = new Input({
			valueState: "Error",
			valueStateText: "This is a value state with error message"
		});

		oInputWithValueState.placeAt("content");
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oInputWithValueState.getFocusDomRef().getAttribute("aria-errormessage"), oInputWithValueState.getValueStateMessageId() + "-sr", "Input has static aria-describedby reference pointing to the correct ID");

		//Clean up
		oInputWithValueState.destroy();
	});

	QUnit.test("Value State - When value state other than error is updated dynamically by user input the accessibility element should not have aria-live= attribute", async function(assert) {
		//Arrange
		this.clock = sinon.useFakeTimers();
		var oInputWithValueState = new Input({
			valueState: "Warning"
		});
		var oAccDomRef;

		oInputWithValueState.placeAt("content");
		await nextUIUpdate(this.clock);

		oInputWithValueState.openValueStateMessage();
		this.clock.tick();

		// Act
		// Simulate dynamic update of the value state by the user by changing the value state while focused
		oInputWithValueState.focus();
		oInputWithValueState.setValueState("Information");
		await nextUIUpdate(this.clock);
		oAccDomRef = document.getElementById(oInputWithValueState.getValueStateMessageId() + "-sr");

		//Assert
		assert.strictEqual(oAccDomRef.getAttribute("aria-live"), null, "Acc live-region is correctly removed to avoid double speech output on user changed state");

		//Clean up
		oInputWithValueState.destroy();
	});

	QUnit.test("Check list control - 'role' attribute", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var aNames = ["abcTom", "abcPhilips", "abcAnna", "abcJames"],
			aDescription = ["Heidelberg", "Mannheim", "Paris", "London"],
			aEnabled = [true, false, true, false],
			aItemAdded = [],
			i;

		var oInput = new Input("input", {
			showSuggestion: true
		});
		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.attachSuggest(function(){
			for (i = 0; i < aNames.length; i++){
				if (!aItemAdded.includes(aNames[i])){
					oInput.addSuggestionItem(new ListItem({text: aNames[i], additionalText: aDescription[i], enabled: aEnabled[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("abc").trigger("input");

		this.clock.tick(1000);
		var oList = oInput._getSuggestionsPopover().getItemsContainer();
		assert.strictEqual(oList.$("listUl").attr("role"), "listbox", "role='listbox' applied to the List control DOM");

		oInput.destroy();
	});

	QUnit.test("Check suggestions control - 'role' attribute with grouping", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oInput = new Input({
			showSuggestion: true,
			suggestionItems: [
				new SeparatorItem({
					text: "Countries",
					textDirection: TextDirection.RTL
				}),
				new Item({
					key: "GER",
					text: "Germany",
					textDirection: TextDirection.RTL
				}),
				new Item({
					key: "GAM",
					text: "Gambia"
				})
			]
		}).placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("g").trigger("input");

		this.clock.tick(1000);
		var oList = oInput._getSuggestionsPopover().getItemsContainer();
		assert.strictEqual(oList.$("listUl").attr("role"), "listbox", "role='listbox' applied to the List control DOM");
		assert.strictEqual(oList.getItems()[0].$().attr("role"), "group", "role='group' applied to the group header");
		assert.strictEqual(oList.getItems()[1].$().attr("role"), "option", "role='option' applied to the items");

		oInput.destroy();
	});

	QUnit.module("Cloning", {
		beforeEach: function () {
			this.oTabularInputToClone = createInputWithTabularSuggestions();
			// Remove the SuggestionRowValidator function for the cloning tests.
			this.oTabularInputToClone.setSuggestionRowValidator(null);
			this.oInputToClone = new Input("inp2", {
				showSuggestion: true,
				suggestionItems: [
					new Item({ text: "Test 1" }),
					new Item({ text: "Test 2" }),
					new Item({ text: "Test 3" })
				]
			});
		},
		afterEach: function () {
			this.oTabularInputToClone.destroy();
			this.oInputToClone.destroy();

			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("List Suggestions - cloning", function (assert) {
		var oInputClone  = this.oInputToClone.clone();
		assert.equal(oInputClone.getSuggestionItems().length, 3, "Should have 3 suggestion items");

		oInputClone.destroy();
	});

	QUnit.test("Tabular Suggestions - cloning", function (assert) {
		var oInputClone  = this.oTabularInputToClone.clone();

		assert.equal(oInputClone.getSuggestionRows().length, 10, "Should have 3 suggestion rows");
		assert.equal(oInputClone.getSuggestionColumns().length, 5, "Should have 4 suggestion columns");

		oInputClone.destroy();
	});

	QUnit.test("Tabular Suggestions - fnRowResultFilter cloning", function (assert) {
		var fnCallback = sinon.spy();
		this.oTabularInputToClone.setRowResultFunction(fnCallback);
		var oInputClone  = this.oTabularInputToClone.clone();

		assert.equal(fnCallback, oInputClone._fnRowResultFilter, "_fnRowResultFilter should be cloned");

		oInputClone.destroy();
	});

	QUnit.test("Tabular Suggestions - selectedRow cloning", function (assert) {
		var fnRowResultFilter = function (oColumnListItem) {
			return "The selected item: " + oColumnListItem.getCells()[0].getText();
		};
		this.oTabularInputToClone.setRowResultFunction(fnRowResultFilter);
		this.oTabularInputToClone.setSelectedRow(this.oTabularInputToClone.getSuggestionRows()[0]);

		var oInputClone  = this.oTabularInputToClone.clone();

		assert.equal(oInputClone.getValue(), "The selected item: Auch ein gutes Ding", "The selectedRow association should be cloned");

		oInputClone.destroy();
	});

	QUnit.test("Input cloned with correct suggestion rows", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oData = new JSONModel({
			"result": [{
				"PricingService": "New York Service",
				"PricingProduct": "Apple Plus",
				"PricingLocation": "ICE New York"
			}, {
				"PricingService": "Internal Service",
				"PricingProduct": "Apple",
				"PricingLocation": "Chicago"
			}, {
				"PricingService": "Internal Price",
				"PricingProduct": "MHCME",
				"PricingLocation": "Chicago2"
			}, {
				"PricingService": "Oil New",
				"PricingProduct": "MHCME",
				"PricingLocation": "London"
			}, {
				"PricingService": "Oil Price Information Service",
				"PricingProduct": "MHCME Test",
				"PricingLocation": "London"
			}]
		});

		// setup
		var oInput = new Input({
				showSuggestion: true,
				showTableSuggestionValueHelp: false,
				suggest: function (oEvent) {
					var oFilter = null,
						aFilters = [],
						oSource = oEvent.getSource(),
						sTerm = oEvent.getParameter("suggestValue");

					if (sTerm) {
						aFilters.push(new Filter("PricingService", FilterOperator.Contains, sTerm));
						oFilter = new Filter({
							filters: aFilters,
							and: true
						});
					}
					var oBinding = oSource.getBinding("suggestionRows");
					oBinding.filter(oFilter);
					oSource.setFilterSuggests(false);
				},
				suggestionColumns: [
					new Column({
						header: new Label({
							text: "Pricing Service"
						})
					}),
					new Column({
						header : new Label({
							text : "Pricing Product"
						})
					}),
					new Column({
						header : new Label({
							text : "Pricing Location"
						})
					})
				],
				suggestionRows: {
					path: 'local>/result',
					templateShareable: false,
					template: new ColumnListItem({
						cells: [
							new Label({text: "{local>PricingService}"}),
							new Label({text: "{local>PricingProduct}"}),
							new Label({text: "{local>PricingLocation}"})
						]
					})
				}
			});

		var oPage = new Page("myPage", {content: oInput}).setModel(oData, "local").placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.onfocusin();
		oInput._$input.trigger("focus").val("New").trigger("input");
		this.clock.tick(400);

		var oClonedInput = oInput.clone();
		oPage.addContent(oClonedInput);
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(oClonedInput.getAggregation("suggestionRows").length, 5, "The suggestions rows should be cloned correctly");

		// clear
		oPage.destroy();
		oInput.destroy();
	});

	QUnit.module("ValueHelpDialog", {
		afterEach: function() {
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Change event", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oDialog,
			oInput = new Input({
			showValueHelp: true,
			valueHelpRequest: function(evt) {
				oDialog = new Dialog({
					content:[
						new Button({
							text: 'close',
							press: function() {
								oDialog.close();
							}
						})
					]
				});

				oDialog.open();
			}
		}).placeAt('content');

		await nextUIUpdate(this.clock);

		var fnChangeCallback = this.spy();
		oInput.attachChange(fnChangeCallback);

		oInput._$input.trigger("focus").val("abc").trigger("input");

		var oValueHelpIcon = oInput._getValueHelpIcon();

		oValueHelpIcon.firePress();

		await nextUIUpdate(this.clock);
		this.clock.tick(2000);

		assert.equal(fnChangeCallback.callCount, 0, "change event is not fired");

		oDialog.close();
		this.clock.tick(500);

		oDialog.open();

		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		assert.equal(fnChangeCallback.callCount, 1, "change event is fired once");

		oDialog.destroy();
		oInput.destroy();
	});

	QUnit.test("showTableSuggestionValueHelp", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var oInput = new Input({
			showValueHelp: true,
			valueHelpRequest: function() {
				assert.strictEqual(oInput.getValue(), "p", "The value of the input should be exactly what the user typed.");
				assert.notOk(oInput.getSelectedRow(), "There shouldn't be a selected row.");
			},
			showSuggestion: true,
			suggestionItemSelected: function () {},
			suggestionColumns: [ new Column({ header: new Label({ text: "header" })}) ]
		}),
			oValueHelpRequestSpy = new sinon.spy(oInput, "fireValueHelpRequest");

		var oTableItemTemplate = new ColumnListItem({
			cells : [new Label({ text : "{name}" })]
		});

		var oSuggestionData = {
			tabularSuggestionItems : [ { name : "Product1" }, { name : "Product2" }, { name : "Product3" }]
		};

		var oModel = new JSONModel(oSuggestionData);

		oInput.setModel(oModel);
		oInput.bindSuggestionRows({
			path: "/tabularSuggestionItems",
			template: oTableItemTemplate
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		var oFakeKeydown = new jQuery.Event("keydown", { which: KeyCodes.P });
		oInput._getSuggestionsPopover().getPopover().open();

		// act
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("p").trigger("input");
		this.clock.tick(300);
		oInput._getShowMoreButton().firePress();

		assert.strictEqual(oValueHelpRequestSpy.callCount, 1, "fireValueHelpRequest was executed once.");
		assert.strictEqual(oValueHelpRequestSpy.firstCall.args[0]._userInputValue, "p", "The typed in value was preserved and passed via the event.");

		// clean up
		oValueHelpRequestSpy.restore();
		oInput.destroy();
	});

	QUnit.module("API", {
		beforeEach: function () {
			this.oInput = new Input().placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oInput.destroy();
			this.oInput = null;

			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test('Calling insertSuggestionRow', function (assert) {
		// arrange
		var fnInsertAggregation = sinon.spy(this.oInput, "insertAggregation");
		this.oInput._synchronizeSuggestions = function() {};
		var oColumnListItem = new ColumnListItem();

		// act
		this.oInput.insertSuggestionRow(oColumnListItem, 1);

		// assert
		assert.strictEqual(fnInsertAggregation.called, true, 'should call insertAggregation');
		assert.strictEqual(fnInsertAggregation.calledWithExactly("suggestionRows", oColumnListItem, 1), true, 'should call insertAggregation with correct parameters');

		// clean
		this.oInput.insertAggregation.restore();
	});

	QUnit.test("Methods that should reflect on the Suggestions Popover", function (assert) {
		// arrange
		this.oInput.setShowSuggestion(true);
		var bSuppressInvalidate = true;

		// assert
		assert.strictEqual(this.oInput.getMaxSuggestionWidth(), "", "Input initial suggestion width should be ''");
		assert.strictEqual(this.oInput._getSuggestionsPopover()._sPopoverContentWidth, null, "Suggestions popover should be 'null' if the Input didn't set it");

		// act
		this.oInput.setMaxSuggestionWidth("50rem", bSuppressInvalidate);
		this.oInput.setEnableSuggestionsHighlighting(false, bSuppressInvalidate);
		this.oInput.setAutocomplete(false, bSuppressInvalidate);
		this.oInput._getSuggestionsPopover().getPopover().open();

		// assert
		assert.strictEqual(this.oInput.getMaxSuggestionWidth(), this.oInput._getSuggestionsPopover()._sPopoverContentWidth, "Input and Popover widths should be the same.");
	});

	QUnit.test("Setting maxSuggestionWidth should not change selected item", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oInput = new Input({
			showSuggestion: true,
			maxSuggestionWidth: "200px"
		}).placeAt("content");

		await nextUIUpdate(this.clock);
		oInput._getSuggestionsPopover().getPopover().open();

		this.clock.tick(300);
		await nextUIUpdate(this.clock);

		assert.ok(oInput._bAfterOpenFinisihed, "After open flag is correct");

		oInput.destroy();
	});

	QUnit.test("calling _synchronizeSuggestions", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var oStub = this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		}),
			oInput = new Input({
				showSuggestion: true,
				filterSuggests: false,
				suggestionItems: [
					new Item({text: "Germany"}),
					new Item({text: "Bulgaria"})
				]
			}).placeAt("content"),
			oSpy = sinon.spy(oInput, "_refreshListItems"),
			oPopover = oInput._getSuggestionsPopover(),
			oPopupInput = oPopover.getInput();

		await nextUIUpdate(this.clock);

		// act
		oPopover.getPopover().open();
		oPopupInput._$input.trigger("focus").trigger("keydown").val("g").trigger("input");
		this.clock.tick(500);
		oSpy.reset();
		oInput._synchronizeSuggestions();
		this.clock.tick(500);

		// assert
		assert.ok(oSpy.calledOnce, "_refreshListItems should be called once");

		// clean
		oInput.destroy();
		oStub.restore();
	});

	QUnit.test('Change event add/remove value', async function (assert) {
		// arrange
		var oInput = new Input().placeAt("content");
		var oSpy = this.spy();
		await nextUIUpdate();

		oInput.attachChange(oSpy);

		// Act
		oInput._$input.trigger("focus").trigger(jQuery.Event("keydown", { which: KeyCodes.G })).val("G").trigger("input");
		qutils.triggerKeydown(oInput._$input, "G");
		qutils.triggerKeyup(oInput._$input, "G");
		oInput.onsapenter();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "change event has been fired");

		// Act
		oSpy.reset();
		oInput.onsapenter();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSpy.callCount, 0, "change event has NOT been fired for the same value twice.");


		// Act
		oSpy.reset();
		oInput._$input.trigger("focus").trigger(jQuery.Event("keydown", { which: KeyCodes.BACKSPACE })).val("").trigger("input");
		qutils.triggerKeydown(oInput._$input, KeyCodes.BACKSPACE);
		qutils.triggerKeyup(oInput._$input, KeyCodes.BACKSPACE);
		oInput.onsapenter();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "change event has been fired");

		// Act
		oSpy.reset();
		oInput._$input.trigger("focus").trigger(jQuery.Event("keydown", { which: KeyCodes.BACKSPACE })).val("").trigger("input");
		qutils.triggerKeydown(oInput._$input, KeyCodes.BACKSPACE);
		qutils.triggerKeyup(oInput._$input, KeyCodes.BACKSPACE);
		oInput.onsapenter();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSpy.callCount, 0, "change event has NOT been fired for the same value twice.");

		// Cleanup
		oInput.destroy();
	});

	QUnit.module("Clear Icon", {
		afterEach: function () {
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Clear icon should not be visible by default", async function (assert) {
		var oInput = new Input().placeAt("content");
		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.G });

		assert.notOk(oInput._oClearButton, "clear icon should not be created by default");

		oInput.setShowClearIcon(true);
		await nextUIUpdate();

		assert.notOk(oInput._oClearButton.getVisible(), "clear icon should not be visible when value is empty");

		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("G").trigger("input");
		qutils.triggerKeyup(oInput._$input, "G");
		await nextUIUpdate();

		assert.ok(oInput._oClearButton.getVisible(), "clear icon should be visible when value is not empty");

		oInput._$input.val("").trigger("input");
		qutils.triggerKeyup(oInput._$input, KeyCodes.BACKSPACE);
		await nextUIUpdate();

		assert.notOk(oInput._oClearButton.getVisible(), "clear icon should not be visible when value is empty");

		oInput.destroy();
	});

	QUnit.test("Clear icon should hide after setting property to false", async function (assert) {
		var oInput = new Input({
			showClearIcon: true,
			value: "Dryanovo"
		}).placeAt("content");
		await nextUIUpdate();

		assert.ok(oInput._oClearButton.getVisible(), "clear icon should be visible when value is not empty");

		oInput.setShowClearIcon(false);
		await nextUIUpdate();

		assert.notOk(oInput._oClearButton.getVisible(), "clear icon should not be visible after property change");

		oInput.destroy();
	});

	QUnit.test("Clear icon should not be visible by default (default value not empty)", async function (assert) {
		var oInput = new Input({ value: "test" }).placeAt("content");

		assert.notOk(oInput._oClearButton, "clear icon should not be created by default");

		oInput.setShowClearIcon(true);
		await nextUIUpdate();

		assert.ok(oInput._oClearButton.getVisible(), "clear icon should be visible after presetting API");

		oInput.destroy();
	});

	QUnit.test("Clear icon should not be visible when input is disabled", async function (assert) {
		var oInput = new Input({ value: "test", enabled: false }).placeAt("content");

		assert.notOk(oInput._oClearButton, "clear icon should not be created by default");

		oInput.setShowClearIcon(true);
		await nextUIUpdate();

		assert.notOk(oInput._oClearButton.getVisible(), "clear icon is not visible");

		oInput.destroy();
	});

	QUnit.test("Clear icon should not be visible when input is non editable", async function (assert) {
		var oInput = new Input({ value: "test", editable: false }).placeAt("content");

		assert.notOk(oInput._oClearButton, "clear icon should not be created by default");

		oInput.setShowClearIcon(true);
		await nextUIUpdate();

		assert.notOk(oInput._oClearButton.getVisible(), "clear icon is not visible");

		oInput.destroy();
	});

	QUnit.test("Clear icon should be visible when set (default value not empty)", async function (assert) {
		var oInput = new Input({
			value: "test"
		 }).placeAt("content");

		await nextUIUpdate();

		assert.notOk(oInput._oClearButton, "dialog's clear icon should be created");

		oInput.setShowClearIcon(true);
		await nextUIUpdate();

		assert.ok(oInput._oClearButton.getVisible(), "dialog's clear icon should be visible after presetting API");

		oInput.destroy();
	});

	QUnit.test("Clear icon should be inserted before the value help icon", async function (assert) {
		var oInput = new Input({
			value: "test",
			showValueHelp: true
		 }).placeAt("content");

		await nextUIUpdate();

		assert.ok(oInput.getAggregation("_endIcon")[0], oInput._getValueHelpIcon(), "Value help Icon should be inserted first");

		oInput.setShowClearIcon(true);
		await nextUIUpdate();

		assert.ok(oInput.getAggregation("_endIcon")[1], oInput._getValueHelpIcon(), "Value help Icon should be second");
		assert.strictEqual(oInput.getAggregation("_endIcon")[0], oInput._oClearButton, "Clear Icon should be inserted first");

		oInput.destroy();
	});

	QUnit.test("Pressing clear icon should fire change and liveChange events", async function (assert) {
		var changeHandler = this.spy();
		var liveChangeHandler = this.spy();

		var oInput = new Input({
			showClearIcon: true,
			value: "Dryanovo",
			change: changeHandler,
			liveChange: liveChangeHandler
		}).placeAt("content");

		await nextUIUpdate();

		oInput._oClearButton.firePress();
		assert.strictEqual(changeHandler.callCount, 1, "Change should be called once");
		assert.strictEqual(liveChangeHandler.callCount, 1, "Live Change should be called once");
		assert.strictEqual(oInput.getValue(), "", "Input's value should be cleared");

		oInput.destroy();
	});

	QUnit.test("Clear Icon - Value should be updated before firing liveChange and change events", async function (assert) {
		var done = assert.async(3);
		var oInput = new Input({
			showClearIcon: true,
			value: "Dryanovo"
		}).placeAt("content");

		// Arrange
		oInput.attachLiveChange(async function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oInputValue = oEvent.getSource().getValue();

			await nextUIUpdate();

			// Assert
			assert.strictEqual(sValue, oInputValue, 'Value should be updated before firing the live change event');
			done();
		});

		// Arrange
		oInput.attachChange(async function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oInputValue = oEvent.getSource().getValue();

			await nextUIUpdate();

			// Assert
			assert.strictEqual(sValue, oInputValue, 'Value should be updated before firing the change event');
			done();
		});

		await nextUIUpdate();
		oInput._oClearButton.firePress();

		assert.strictEqual(oInput.getValue(), "", "Input's value should be cleared");
		done();

		oInput.destroy();
	});

	QUnit.test("Setting showValueHelpIcon to false should hide the icon", async function (assert) {
		var oInput = new Input({
			showValueHelp: true
		}).placeAt("content");

		await nextUIUpdate();

		assert.ok(oInput._getValueHelpIcon().getVisible(), "Icon should be visible");

		oInput.setShowValueHelp(false);
		await nextUIUpdate();

		assert.notOk(oInput._getValueHelpIcon().getVisible(), "Icon should not be visible");

		oInput.destroy();
	});

	QUnit.test("Check whether property is propagated to dialog's input on mobile", async function (assert) {
		this.clock = sinon.useFakeTimers();
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		var oInput = new Input({
			value: "test",
			showClearIcon: true
		 }).placeAt("content");

		await nextUIUpdate(this.clock);

		oInput._openSuggestionsPopover();
		this.clock.tick(300);

		assert.ok(oInput._oSuggPopover.getInput().getShowClearIcon(), "Show clear icon property should be forwarded");

		oInput.destroy();
	});

	QUnit.module("Type-ahead", {
		beforeEach: function(){
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function() {
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Typeahead should be disabled on adroid devices", async function (assert) {
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		this.stub(Device, "os").value({
			android: true
		});

		// arrange
		var oInput = new Input({
			showSuggestion: true,
			filterSuggests: false,
			suggestionItems: [
				new Item({text: "Germany"}),
				new Item({text: "Bulgaria"}),
				new Item("UK", {key: "UK", text: "United Kingdom"}),
				new Item({text: "Italy"})
			]
		}).placeAt("content");

		await nextUIUpdate(this.clock);

		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.G });

		// act
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("G").trigger("input");
		this.clock.tick(300);

		// assert
		assert.notOk(oInput._bDoTypeAhead, "_bDoTypeAhead should be set to false'");

		// clean up
		oInput.destroy();
		oInput = null;
	});

	QUnit.test("Auto complete should not be allowed when it is set to false", async function (assert) {
		// arrange
		var oInput = new Input({
			showSuggestion: true,
			filterSuggests: false,
			autocomplete: false,
			suggestionItems: [
				new Item({text: "Germany"}),
				new Item({text: "Bulgaria"}),
				new Item("UK", {key: "UK", text: "United Kingdom"}),
				new Item({text: "Italy"})
			]
		}).placeAt("content");

		await nextUIUpdate(this.clock);

		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.G });

		// act
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("G").trigger("input");
		this.clock.tick(300);

		// assert
		assert.notOk(oInput._bDoTypeAhead, "Type ahead should not be allowed when pressing 'G'.");

		// clean up
		oInput.destroy();
		oInput = null;
	});

	QUnit.test("Typeahead should not autocomplete if there is an exact match", async function (assert) {
		var oInput = new Input({
			showSuggestion: true,
			suggestionItems: [
				new Item({text: "Braveheart"}),
				new Item({text: "Brave"})
			]
		}).placeAt("content");
		await nextUIUpdate(this.clock);

		oInput._bDoTypeAhead = true;
		oInput._$input.trigger("focus").val("Brave").trigger("input");

		assert.strictEqual(oInput.getValue(), "Brave", "Not-exact matched item is not autocompleted when there is an exact match");

		oInput.destroy();
	});

	QUnit.test("Autocomplete on desktop", async function (assert) {
		// arrange
		var oInput = new Input({
			showSuggestion: true,
			filterSuggests: false,
			suggestionItems: [
				new Item({text: "Germany"}),
				new Item({text: "Bulgaria"}),
				new Item({text: "Greece"}),
				new Item("UK", {key: "UK", text: "United Kingdom"}),
				new Item({text: "Italy"}),
				new Item({text: "Greece"})
			]
		}).placeAt("content");

		await nextUIUpdate(this.clock);

		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.G });
		// act
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("G").trigger("input");
		this.clock.tick(1000);

		// assert
		assert.ok(oInput._bDoTypeAhead, "Type ahead should be allowed when pressing 'G'.");
		assert.strictEqual(oInput.getValue(), "Germany", "Input value should be autocompleted.");
		assert.strictEqual(oInput.getSelectedText(), "ermany", "Suggested value should be selected");
		assert.strictEqual(oInput._oSuggestionPopup.getContent()[0].getItems()[0].getSelected(), true, "Correct item in the Suggestions list is selected.");

		// act
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("Gr").trigger("input");
		this.clock.tick(1000);

		// assert
		assert.strictEqual(oInput._oSuggestionPopup.getContent()[0].getItems()[2].getSelected(), true, "Correct item in the Suggestions list is selected.");

		// act
		qutils.triggerKeydown(oInput._$input, KeyCodes.ENTER);

		// assert
		assert.strictEqual(oInput.getValue(), "Greece", "Pressing 'enter' should finalize autocompletion.");
		assert.strictEqual(oInput.getSelectedText(), "", "Text shouldn't be selected after pressing 'enter'");

		// act
		oInput._$input.trigger("focus");
		qutils.triggerKeydown(oInput._$input, KeyCodes.BACKSPACE);
		oInput._$input.val("gre").trigger("input");
		this.clock.tick(300);

		// assert
		assert.notOk(oInput._bDoTypeAhead, "Autocomplete shouldn't be allowed when deleting.");
		assert.strictEqual(oInput._oSuggestionPopup.getContent()[0].getSelectedItem(), null, "No items in the Suggestions list are selected when deleting.");

		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("Ger").trigger("input");
		this.clock.tick(300);

		qutils.triggerKeydown(oInput._$input, KeyCodes.ARROW_DOWN);

		assert.strictEqual(oInput._$input[0].selectionEnd - oInput._$input[0].selectionStart > 0, true, "Typeahheaded text is selected.");

		// clean up
		oInput.destroy();
		oInput = null;
	});

	QUnit.test("Dynamic typeahead and item selection with delayed loading of tabular suggestions", async function (assert) {
		var oTabularPopover;

		var oData = {
			items: [
				{key: "key1", value: "test1"},
				{key: "key2", value: "test2"},
				{key: "key3", value: "test3"},
				{key: "key4", value: "test4"},
				{key: "key5", value: "test5"},
				{key: "key6", value: "test6"},
				{key: "key7", value: "test7"}
			]
		};
		var oModel = new JSONModel();
		var oInputWithTabularSuggestions = new Input({
			showSuggestion: true,
			suggestionRows: {
				path: "/items",
				template: new ColumnListItem({
					cells: [
						new Text({text:"{value}"})
					]
				})
			},
			suggestionColumns: [
				new Column({
					header: new Label({text: "Text"})
				})
			],
			suggest: function (oEvent) {
				// simulate some backend logic to filter the suggestions
				var aItems = oData.items.filter(function(oItem) {
					return oItem.value.includes(oEvent.getParameter("suggestValue"));
				}).slice(0, 5);

				setTimeout(function () {
					oModel.setData({
						items: aItems
					});
				}, 0);
			}
		});

		oInputWithTabularSuggestions.setModel(oModel);
		oInputWithTabularSuggestions.placeAt('content');
		await nextUIUpdate(this.clock);

		oTabularPopover = oInputWithTabularSuggestions._getSuggestionsPopover();

		oInputWithTabularSuggestions._$input.trigger("focus").trigger("keydown").val("test6").trigger("input");
		await nextUIUpdate(this.clock);
		this.clock.tick(1000);

		assert.strictEqual(oTabularPopover.getItemsContainer().getItems()[0].getSelected(), true, "Correct item in the Suggested list is selected");

		oInputWithTabularSuggestions.destroy();
	});

	QUnit.test("Dynamic typeahead and item selection with delayed loading of list items", async function (assert) {
		var oPopover;

		var oData = {
			items: [
				{key: "key1", value: "test1"},
				{key: "key2", value: "test2"},
				{key: "key3", value: "test3"},
				{key: "key4", value: "test4"},
				{key: "key5", value: "test5"},
				{key: "key6", value: "test6"},
				{key: "key7", value: "test7"}
			]
		};
		var oModel = new JSONModel();
		var oInput = new Input("dynamic-input", {
			showSuggestion: true,
			filterSuggests: false,
			suggestionItems: {
				path: "/items",
				template: new Item({key: "{key}", text: "{value}"})
			},
			suggest: function (oEvent) {
				var aItems = oData.items.filter(function(oItem) {
					return oItem.value.includes(oEvent.getParameter("suggestValue").slice(0, 5));
				});

				setTimeout(function () {
					oModel.setData({
						items: aItems
					});
				}, 0);
			}
		});

		oInput.setModel(oModel);
		oInput.placeAt('content');
		await nextUIUpdate(this.clock);

		oPopover = oInput._getSuggestionsPopover();
		oPopover.getPopover().open();
		this.clock.tick(300);

		oInput._$input.trigger("focus").trigger("keydown").val("test6").trigger("input");
		this.clock.tick(1000);

		assert.strictEqual(getVisibleItems(oPopover.getPopover())[0].getSelected(), true, "Correct item in the Suggested list is selected");

		oInput.destroy();
	});


	QUnit.test("Autocomplete with dynamic loading of items on mobile", async function (assert) {
		var oPopover;
		var oPopupInput;
		var oSystem = {
			desktop : false,
			phone : true,
			tablet : false
		};

		this.stub(Device, "system").value(oSystem);

		var oData = {
			items: [
				{key: "key1", value: "test1"},
				{key: "key2", value: "test2"},
				{key: "key3", value: "test3"},
				{key: "key4", value: "test4"},
				{key: "key5", value: "test5"},
				{key: "key6", value: "test6"},
				{key: "key7", value: "test7"},
				{key: "key8", value: "test8"},
				{key: "key9", value: "test9"}
			]
		};
		var oModel = new JSONModel();
		var oInput = new Input("dynamic-input", {
			showSuggestion: true,
			filterSuggests: false,
			suggestionItems: {
				path: "/items",
				template: new Item({key: "{key}", text: "{value}"})
			},
			suggest: function (oEvent) {
				var aItems = oData.items.filter(function(oItem) {
					return oItem.value.includes(oEvent.getParameter("suggestValue").slice(0, 5));
				});

				setTimeout(function () {
					oModel.setData({
						items: aItems
					});
				}, 0);
			}
		});


		oInput.setModel(oModel);
		oInput.placeAt('content');
		await nextUIUpdate(this.clock);

		oPopover = oInput._getSuggestionsPopover();
		oPopupInput = oPopover.getInput();

		oPopover.getPopover().open();
		this.clock.tick(300);

		oPopupInput._$input.trigger("focus").trigger("keydown").val("t").trigger("input");
		this.clock.tick(1000);

		assert.strictEqual(oPopupInput.getSelectedText(), "est1", "Type ahead is performed");

		oInput.destroy();
	});

	QUnit.test("Autocomplete should keep cursor on place when there are no suggestions", async function (assert) {
		// Arrange
		var oInput = new Input({
			showSuggestion: true,
			filterSuggests: false,
			suggestionItems: [
				new Item({text: "Germany"}),
				new Item({text: "Bulgaria"}),
				new Item({text: "United Kingdom"}),
				new Item({text: "Italy"})
			]
		}).placeAt("content");
		await nextUIUpdate(this.clock);

		// Arrange - open the suggestions
		oInput._$input.trigger("focus").val("Germ").trigger("input");

		// Act - move the cursor
		var iCursorPosition = 2;
		oInput.selectText(iCursorPosition, iCursorPosition);
		this.clock.tick(100);

		// Act - remove all suggestions
		oInput.removeAllSuggestionItems(); // simulate no suggestions found

		// Assert that the cursor is on its original place
		assert.ok(oInput._$input[0].selectionStart === iCursorPosition, "The cursor should be on its original position");

		// clean up
		oInput.destroy();
		oInput = null;
	});

	QUnit.test("Autocomplete on phone", async function (assert) {
		// arrange
		var oSystem = {
			desktop : false,
			phone : true,
			tablet : false
		};

		this.stub(Device, "system").value(oSystem);

		var oInput = new Input({
			showSuggestion: true,
			filterSuggests: false,
			suggestionItems: [
				new Item({text: "Germany"}),
				new Item({text: "Bulgaria"}),
				new Item("UK", {key: "UK", text: "United Kingdom"}),
				new Item({text: "Italy"})
			]
		}).placeAt("content");

		var oPopover = oInput._getSuggestionsPopover(),
			oPopupInput = oPopover.getInput();

		await nextUIUpdate(this.clock);

		// act
		oPopover.getPopover().open();
		this.clock.tick(300);
		oPopupInput.onfocusin();
		oPopupInput._$input.trigger("focus").trigger("keydown").val("uni").trigger("input");
		this.clock.tick(1000);

		// assert
		assert.ok(oPopupInput._bDoTypeAhead, "Type ahead should be allowed when pressing 'B'.");
		assert.strictEqual(oPopupInput.getValue(), "united Kingdom", "Input value should be autocompleted and character casing should be preserved.");
		assert.strictEqual(oPopupInput.getSelectedText(), "ted Kingdom", "Suggested value should be selected");
		assert.strictEqual(getVisibleItems(oPopover.getPopover())[2].getSelected(), true, "Correct item in the Suggested list is selected");

		// act
		qutils.triggerKeydown(oPopupInput._$input, KeyCodes.ENTER);
		this.clock.tick(300);

		// assert
		assert.strictEqual(oInput.getValue(), "United Kingdom", "Pressing enter should finalize autocompletion.");

		// clean up
		oInput.destroy();
		oInput = null;
	});

	QUnit.test("right arrow press", async function (assert) {
		this.clock.restore();
		var fnLiveChange = this.spy();

		// arrange
		var oInput = new Input({
			showSuggestion: true,
			suggestionItems: [
				new Item({text: "Germany"}),
				new Item({text: "Bulgaria"}),
				new Item("UK", {key: "UK", text: "United Kingdom"}),
				new Item({text: "Italy"})
			],
			liveChange: fnLiveChange
		}).placeAt("content");

		await nextUIUpdate();

		oInput.onsapright();
		await nextUIUpdate();

		assert.equal(fnLiveChange.callCount, 0, "liveChange handler is not fired");

		// clean up
		oInput.destroy();
		oInput = null;
	});

	QUnit.test("autocomplete with 0 matched items", async function (assert) {

		// arrange
		var stub = sinon.stub();
		var oInput = new Input({
			showSuggestion: true,
			suggestionItemSelected: stub,
			suggestionColumns: [
				new Column({
					header: new Label({
						text: "{i18n>/Name}"
					})
				}),
				new Column({
					header : new Label({
						text : "{i18n>/Qty}"
					})
				}),
				new Column({
					header : new Label({
						text : "{i18n>/Value}"
					})
				}),
				new Column({
					header : new Label({
						text : "{i18n>/Price}"
					})
				})
			]});

		var oTableItemTemplate = new ColumnListItem({
			vAlign : "Middle",
			cells : [
				new Label({
					text : "{name}"
				}),
				new Label({
					text: "{qty}"
				}), new Label({
					text: "{limit}"
				}), new Label({
					text : "{price}"
				})
			]
		});

		var oSuggestionData = {
			tabularSuggestionItems : [{
				name : "Product1",
				qty : "10 EA",
				limit : "15.00 Eur",
				price : "10.00 EUR"
			}, {
				name : "Product2",
				qty : "9 EA",
				limit : "25.00 Eur",
				price : "20.00 EUR"
			}, {
				name : "Photo scan",
				qty : "8 EA",
				limit : "35.00 Eur",
				price : "30.00 EUR"
			}]
		};

		var oModel = new JSONModel(oSuggestionData);

		oInput.setModel(oModel);
		oInput.bindSuggestionRows({
			path: "/tabularSuggestionItems",
			template: oTableItemTemplate
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.G });
		oInput._getSuggestionsPopover().getPopover().open();

		// act
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("p").trigger("input");
		this.clock.tick(1000);

		// check selected (highlighted in blue) row in the suggestion table
		var oSelectedRow1 = oInput._getSuggestionsPopover().getItemsContainer().getItems()[0];
		assert.ok(oSelectedRow1.getSelected(), true, "First item is selected");
		assert.equal(oSelectedRow1.getCells()[0].getText().toLowerCase(), oInput.getValue().toLowerCase(), "The value of the input is the same as the value of the selected row");

		// act
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("ph").trigger("input");
		this.clock.tick(1000);

		// check selected (highlighted in blue) row in the suggestion table
		var oSelectedRow2 = oInput._getSuggestionsPopover().getItemsContainer().getItems()[2];
		assert.ok(oSelectedRow2.getSelected(), true, "First item is selected");
		assert.equal(oSelectedRow2.getCells()[0].getText().toLowerCase(), oInput.getValue().toLowerCase(), "The value of the input is the same as the value of the selected row");

		oInput.bindSuggestionRows({
			path: "",
			template: new ColumnListItem()
		});
		this.clock.tick(300);

		// assert
		assert.strictEqual(stub.callCount, 0, "Should NOT call 'setSelectedRow' when aggregation is destroyed after a proposed item was found.");
		oInput.destroy();
	});

	QUnit.test("Typeahead should select the correct formatter", async function (assert) {
		var oPopupInput;

		// Arange
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		// Setup
		var oInput = new Input({
			showSuggestion: true,
			showTableSuggestionValueHelp: false,
			suggestionColumns: [
				new Column({
					popinDisplay: "Inline",
					demandPopin: true,
					content: [
						new Label({text: "My text label"})
					]
				})
			],
			suggestionRows: [
				new ColumnListItem({
					content: [
						new Label({text: "My text label"})
					]
				})
			]
		}).placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		oInput._getSuggestionsPopover().getPopover().open();
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		oPopupInput = oInput._getSuggestionsPopover().getInput();
		oPopupInput.setValue("My");
		oPopupInput._bDoTypeAhead = true;
		oPopupInput.focus();
		await nextUIUpdate(this.clock);

		oPopupInput._handleTypeAhead();

		// Assert
		assert.ok(true, "Calling Dialog's Input _handleTypeAhead does not trigger an exception");

		// clean up
		oInput._getSuggestionsPopover().getPopover().close();
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		oInput.destroy();
		oInput = null;
	});

	QUnit.test("Op", async function (assert) {
		var oPopup; // is lazy loaded

		var oInput = new Input({
			showSuggestion: true,
			suggest: function(){
				setTimeout(function(){
					oInput.addSuggestionItem(new Item({text: "Text 1"}));
				}, 0);
			}
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.t });
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("t").trigger("input");
		this.clock.tick(1000);


		oPopup = oInput._getSuggestionsPopover().getPopover();
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");
		assert.strictEqual(oInput.getSelectedText(), "ext 1", "Suggested value should be selected");

		oInput.destroy();
	});

	QUnit.test("_handleTypeahead should return map with the selected text and item instance - List suggestions", async function (assert) {
		// arrange
		var oInput = new Input({
			showSuggestion: true,
			suggestionItems: [
				new Item({text: "Germany"}),
				new Item({text: "Bulgaria"}),
				new Item({text: "Italy"})
			]
		}).placeAt("content");
		var mResult;

		await nextUIUpdate(this.clock);

		oInput.setValue("B");
		oInput._$input.trigger("focus");
		oInput._bDoTypeAhead = true;

		// act
		mResult = oInput._handleTypeAhead(oInput);
		this.clock.tick(300);

		assert.strictEqual(mResult.selectedItem, oInput.getSuggestionItems()[1], "The correct suggestion item was passed");
		assert.strictEqual(mResult.value, oInput.getSuggestionItems()[1].getText(), "The correct value was passed");

		// Clean
		oInput.destroy();
	});

	QUnit.test("_handleTypeahead should return map with the selected text and item instance - Tabular suggestions", async function (assert) {
		// arrange
		var oInput = new Input({
			showSuggestion: true,
			suggestionColumns: [
				new Column({
					header: new Label({
						text: "{i18n>/Name}"
					})
				}),
				new Column({
					header : new Label({
						text : "{i18n>/Qty}"
					})
				}),
				new Column({
					header : new Label({
						text : "{i18n>/Value}"
					})
				}),
				new Column({
					header : new Label({
						text : "{i18n>/Price}"
					})
				})
			]});

		var oTableItemTemplate = new ColumnListItem({
			vAlign : "Middle",
			cells : [
				new Label({
					text : "{name}"
				}),
				new Label({
					text: "{qty}"
				}), new Label({
					text: "{limit}"
				}), new Label({
					text : "{price}"
				})
			]
		});

		var oSuggestionData = {
			tabularSuggestionItems : [{
				name : "Product1",
				qty : "10 EA",
				limit : "15.00 Eur",
				price : "10.00 EUR"
			}, {
				name : "Product2",
				qty : "9 EA",
				limit : "25.00 Eur",
				price : "20.00 EUR"
			}, {
				name : "Photo scan",
				qty : "8 EA",
				limit : "35.00 Eur",
				price : "30.00 EUR"
			}]
		};

		var oModel = new JSONModel(oSuggestionData);
		var mResult;

		oInput.setModel(oModel);
		oInput.bindSuggestionRows({
			path: "/tabularSuggestionItems",
			template: oTableItemTemplate
		});

		oInput.placeAt("content");

		await nextUIUpdate(this.clock);

		oInput.setValue("P");
		oInput._$input.trigger("focus");
		oInput._bDoTypeAhead = true;

		// act
		mResult = oInput._handleTypeAhead(oInput);
		this.clock.tick(300);

		assert.strictEqual(mResult.selectedItem, oInput.getSuggestionRows()[0], "The correct suggestion item was passed");
		assert.strictEqual(mResult.value, oInput._getRowResultFunction()(oInput.getSuggestionRows()[0]), "The correct value was passed");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Dynamic suggestions: List suggestions - Item in the list should be selected if type-ahead was performed", async function (assert) {
		// arrange
		var oData = {
			items: [
				{key: "key1", value: "test1"},
				{key: "key2", value: "test2"},
				{key: "key3", value: "test3"}
			]
		};
		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.T });
		var oInput = new Input({
			showSuggestion: true,
			suggest: function (oEvent) {
				// simulate network request
				oData.items.forEach(function (oItem) {
					oInput.addSuggestionItem(new Item({ key: oItem.key, text: oItem.value }));
				});
			}
		}).placeAt("content");

		await nextUIUpdate(this.clock);

		// act
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("t").trigger("input");
		this.clock.tick(1000);

		// assert
		assert.strictEqual(oInput.getSelectedItem(),null, "There is still no selected suggestion item in the Input.");
		assert.strictEqual(oInput._getSuggestionsPopover().getItemsContainer().getItems()[0].getSelected(), true, "The first matching list item was selected");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Shoud select item on arrow up/down when autocomplete is off", async function (assert) {
		var oInput = new Input({
			showSuggestion: true,
			autocomplete: false,
			suggestionItems: [
				new Item({
					text: 'one',
					key: '1'
				}),
				new Item({
					text: 'one more',
					key: '2'
				})
			]
		}).placeAt("content");
		await nextUIUpdate(this.clock);

		oInput._$input.trigger("focus").val("o").trigger("input");
		this.clock.tick(1000);

		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(300);
		qutils.triggerKeyup(oInput.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(300);

		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(300);
		qutils.triggerKeyup(oInput.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(300);

		assert.strictEqual(oInput._getSuggestionsPopover().getItemsContainer().getItems()[1].getSelected(), true, "Second item should be selected item");

		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ARROW_UP);
		this.clock.tick(300);
		qutils.triggerKeyup(oInput.getFocusDomRef(), KeyCodes.ARROW_UP);
		this.clock.tick(300);

		assert.strictEqual(oInput._getSuggestionsPopover().getItemsContainer().getItems()[0].getSelected(), true, "First item should be selected item");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Dynamic suggestions: Tabular suggestions - Row in the list should be selected if type-ahead was performed", async function (assert) {
		// arrange
		var oData = {
			items: [
				{key: "key1", value: "test1"},
				{key: "key2", value: "test2"},
				{key: "key3", value: "test3"}
			]
		};
		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.T });
		var oInput = new Input({
			showSuggestion: true,
			suggestionColumns: [
				new Column({
					header: new Label({ text: "Text" })
				})
			],
			suggest: function (oEvent) {
				// simulate network request
				oData.items.forEach(function (oItem) {
					oInput.addSuggestionRow(new ColumnListItem({
						cells: [
							new Text({ text: oItem.value })
						]
					}));
				});
			}
		}).placeAt("content");

		await nextUIUpdate(this.clock);

		// act
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("t").trigger("input");
		this.clock.tick(1000);

		// assert
		assert.strictEqual(oInput.getSelectedRow(),null, "There is still no selected suggestion row in the Input.");
		assert.strictEqual(oInput._getSuggestionsPopover().getItemsContainer().getItems()[0].getSelected(), true, "The first matching table row was selected");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Dynamic suggestions: List suggestions - Backspace should deselect the matching list item after type-ahead was performed and it was selected", async function (assert) {
		// arrange
		var oData = {
			items: [
				{key: "key1", value: "test1"},
				{key: "key2", value: "test2"},
				{key: "key3", value: "test3"}
			]
		};
		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.T });
		var oInput = new Input({
			showSuggestion: true,
			suggest: function (oEvent) {
				// simulate network request
				oData.items.forEach(function (oItem) {
					oInput.addSuggestionItem(new Item({ key: oItem.key, text: oItem.value }));
				});
			}
		}).placeAt("content");

		await nextUIUpdate(this.clock);

		// act
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("t").trigger("input");
		this.clock.tick(300);
		qutils.triggerKeydown(oInput._$input, KeyCodes.BACKSPACE);
		qutils.triggerKeyup(oInput._$input, KeyCodes.BACKSPACE);
		this.clock.tick(300);

		// assert
		assert.strictEqual(oInput.getSelectedRow(),null, "There is still no selected suggestion item in the Input.");
		assert.notOk(oInput._getSuggestionsPopover().getItemsContainer().getItems()[0].getSelected(), "The first matching list item is not selected");

		// Clean
		oInput.destroy();
	});


	QUnit.test("Dynamic suggestions: Tabular suggestions - Backspace should deselect the matching table row after type-ahead was performed and it was selected", async function (assert) {
		// arrange
		var oData = {
			items: [
				{key: "key1", value: "test1"},
				{key: "key2", value: "test2"},
				{key: "key3", value: "test3"}
			]
		};
		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.T });
		var oInput = new Input({
			showSuggestion: true,
			suggestionColumns: [
				new Column({
					header: new Label({ text: "Text" })
				})
			],
			suggest: function (oEvent) {
				// simulate network request
				oData.items.forEach(function (oItem) {
					oInput.addSuggestionRow(new ColumnListItem({
						cells: [
							new Text({ text: oItem.value })
						]
					}));
				});
			}
		}).placeAt("content");

		await nextUIUpdate(this.clock);

		// act
		oInput._$input.trigger("focus").trigger(oFakeKeydown).val("t").trigger("input");
		this.clock.tick(300);
		qutils.triggerKeydown(oInput._$input, KeyCodes.BACKSPACE);
		qutils.triggerKeyup(oInput._$input, KeyCodes.BACKSPACE);
		this.clock.tick(300);

		// assert
		assert.strictEqual(oInput.getSelectedRow(),null, "There is still no selected suggestion row in the Input.");
		assert.notOk(oInput._getSuggestionsPopover().getItemsContainer().getItems()[0].getSelected(), "The first matching table row is not selected");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Dynamic suggestions[Tabular]: focusout should not change user input when selected items is present", async function (assert) {
		// arrange
		let oData = {
			items: [
				{ text: "100" },
				{ text: "101" }
			]
		};

		const oModel = new JSONModel();

		var oInput = new Input({
			change: () => {},
			filterSuggests: false,
			showSuggestion: true,
			showValueHelp: true,
			placeholder: "Type here",
			startSuggestion: 1,
			suggest: (oEvent) => {
				oData = {
					...oData,
					items: oData.items.filter((oItem) => oItem.text.includes(oEvent.getParameter("suggestValue").toLowerCase()))
				};
				oModel.setData(oData);
			},
			suggestionColumns: [
				new Column({
					header: new Label({text: "Text"})
				})
			],
			suggestionRows: {
				path: "/items",
				template: new ColumnListItem({
					cells: [
						new Label({text: "{text}"})
					]
				})
			}
		}).placeAt("content");

		oInput.setModel(oModel);
		await nextUIUpdate(this.clock);

		// simulate suggestion in progress
		oInput._bDoTypeAhead = true;
		oInput.cancelPendingSuggest = () => {};
		oInput.setSelectionUpdatedFromList(true);

		oInput._$input.focus();
		oInput._$input.trigger("focus").val("10").trigger("input");
		this.clock.tick(300);
		oInput._$input.trigger("focus").val("101").trigger("input");

		// force close of the suggestion popover
		oInput.closeSuggestions();

		assert.strictEqual(oInput.getValue(), "101", "The value should not be changed");

		oInput.destroy();
	});

	QUnit.test("Dynamic suggestions[Tabular]: pressing enter should not change user input when selected items is present", async function (assert) {
		// arrange
		let oData = {
			items: [
				{ text: "100" },
				{ text: "101" }
			]
		};

		const oModel = new JSONModel();

		var oInput = new Input({
			change: () => {},
			filterSuggests: false,
			showSuggestion: true,
			showValueHelp: true,
			placeholder: "Type here",
			startSuggestion: 1,
			suggest: (oEvent) => {
				oData = {
					...oData,
					items: oData.items.filter((oItem) => oItem.text.includes(oEvent.getParameter("suggestValue").toLowerCase()))
				};
				oModel.setData(oData);
			},
			suggestionColumns: [
				new Column({
					header: new Label({text: "Text"})
				})
			],
			suggestionRows: {
				path: "/items",
				template: new ColumnListItem({
					cells: [
						new Label({text: "{text}"})
					]
				})
			}
		}).placeAt("content");

		oInput.setModel(oModel);
		await nextUIUpdate(this.clock);

		// simulate suggestion in progress
		oInput._bDoTypeAhead = true;
		oInput.cancelPendingSuggest = () => {};
		oInput.setSelectionUpdatedFromList(true);

		oInput._$input.focus();
		oInput._$input.trigger("focus").val("10").trigger("input");
		this.clock.tick(300);
		oInput._$input.trigger("focus").val("101").trigger("input");

		// force close of the suggestion popover
		oInput.onsapenter();

		assert.strictEqual(oInput.getValue(), "101", "The value should not be changed");

		oInput.destroy();
	});

	QUnit.test("Dynamic suggestions[SuggestionItems]: focusout should not change user input when selected items is present", async function (assert) {
		// arrange
		let oData = {
			items: [
				{ text: "100" },
				{ text: "101" }
			]
		};

		const oModel = new JSONModel();

		var oInput = new Input({
			change: () => {},
			filterSuggests: false,
			showSuggestion: true,
			showValueHelp: true,
			placeholder: "Type here",
			startSuggestion: 1,
			suggest: (oEvent) => {
				oData = {
					...oData,
					items: oData.items.filter((oItem) => oItem.text.includes(oEvent.getParameter("suggestValue").toLowerCase()))
				};
				oModel.setData(oData);
			},
			suggestionItems: {
				path: "/items",
				template: new SuggestionItem({text: "{text}"})
			}
		}).placeAt("content");

		oInput.setModel(oModel);
		await nextUIUpdate(this.clock);

		// simulate suggestion in progress
		oInput._bDoTypeAhead = true;
		oInput.cancelPendingSuggest = () => {};
		oInput.setSelectionUpdatedFromList(true);

		oInput._$input.focus();
		oInput._$input.trigger("focus").val("10").trigger("input");
		this.clock.tick(300);
		oInput._$input.trigger("focus").val("101").trigger("input");

		// force close of the suggestion popover
		oInput.closeSuggestions();

		assert.strictEqual(oInput.getValue(), "101", "The value should not be changed");

		oInput.destroy();
	});

	QUnit.test("Dynamic suggestions[SuggestionItems]: pressing enter should not change user input when selected items is present", async function (assert) {
		// arrange
		let oData = {
			items: [
				{ text: "100" },
				{ text: "101" }
			]
		};

		const oModel = new JSONModel();

		var oInput = new Input({
			change: () => {},
			filterSuggests: false,
			showSuggestion: true,
			showValueHelp: true,
			placeholder: "Type here",
			startSuggestion: 1,
			suggest: (oEvent) => {
				oData = {
					...oData,
					items: oData.items.filter((oItem) => oItem.text.includes(oEvent.getParameter("suggestValue").toLowerCase()))
				};
				oModel.setData(oData);
			},
			suggestionItems: {
				path: "/items",
				template: new SuggestionItem({text: "{text}"})
			}
		}).placeAt("content");

		oInput.setModel(oModel);
		await nextUIUpdate(this.clock);

		// simulate suggestion in progress
		oInput._bDoTypeAhead = true;
		oInput.cancelPendingSuggest = () => {};
		oInput.setSelectionUpdatedFromList(true);

		oInput._$input.focus();
		oInput._openSuggestionsPopover();
		oInput._$input.trigger("focus").val("10").trigger("input");
		this.clock.tick(300);
		oInput._$input.trigger("focus").val("101").trigger("input");

		// force close of the suggestion popover
		oInput.onsapenter();

		assert.strictEqual(oInput.getValue(), "101", "The value should not be changed");

		oInput.destroy();
	});

	QUnit.test("it should select suggestion item on backspace when having exact match", async function (assert) {
		// Arrange
		const oInput = new Input({
			value: "1000",
			showSuggestion: true,
			suggestionItems: [
				new SuggestionItem({text: "1000"}),
				new SuggestionItem({text: "100"})
			]
		}).placeAt("content");
		await nextUIUpdate(this.clock);

		const oFocusDomRef = oInput.getFocusDomRef();

		oInput.focus();
		qutils.triggerKeydown(oFocusDomRef, KeyCodes.BACKSPACE);
		oFocusDomRef.value = "100";
		qutils.triggerEvent("input", oFocusDomRef, { value: "100" });
		this.clock.tick(500);
		await nextUIUpdate(this.clock);

		assert.ok(oInput._getSuggestionsPopover().getItemsContainer().getItems()[1].getSelected(), "The second item should be selected");

		oInput.destroy();
	});

	QUnit.test("it should select tabular suggestion item on backspace when having exact match", async function (assert) {
		// Arrange
		const oInput = new Input({
			value: "1000",
			showSuggestion: true,
			suggestionColumns: [
				new Column({})
			],
			suggestionRows: [
				new ColumnListItem({
					cells: [
						new Label({text: "1000"})
					]
				}),
				new ColumnListItem({
					cells: [
						new Label({text: "100"})
					]
				})
			]
		}).placeAt("content");
		await nextUIUpdate(this.clock);

		const oFocusDomRef = oInput.getFocusDomRef();

		oInput.focus();
		qutils.triggerKeydown(oFocusDomRef, KeyCodes.BACKSPACE);
		oFocusDomRef.value = "100";
		qutils.triggerEvent("input", oFocusDomRef, { value: "100" });
		this.clock.tick(500);
		await nextUIUpdate(this.clock);

		assert.ok(oInput._getSuggestionsPopover().getItemsContainer().getItems()[1].getSelected(), "The second item should be selected");

		oInput.destroy();
	});

	QUnit.test("tabular suggestion items with icon content in cells should not throw an error on typeahead", async function (assert) {
		// Arrange
		const oInput = new Input({
			showSuggestion: true,
			suggestionColumns: [
				new Column({})
			],
			suggestionRows: [
				new ColumnListItem({
					cells: [
						new Icon({ src: "sap-icon://add" })
					],
					type: "Active"
				})
			]
		}).placeAt("content");

		await nextUIUpdate(this.clock);

		// Act
		oInput.focus();
		oInput._$input.trigger("focus").val("100").trigger("input");
		this.clock.tick(500);

		// Assert
		assert.ok(true, "No error is thrown");

		// Clean
		oInput.destroy();
	});

	QUnit.test("tabular suggestion items with icon content in cells should not throw an error with binding", function (assert) {
		// Arrange
		var oInput = new Input({
			showSuggestion: true,
			suggestionColumns: [new Column({ header: new Label({ text: "header" }) })]
		});

		var oTableItemTemplate = new ColumnListItem({
			cells: [new Icon({ src: "{uri}" })]
		});

		var oSuggestionData = {
			tabularSuggestionItems: [{ uri: "sap-icon://add" }, { uri: "sap-icon://remove" }]
		};

		var oModel = new JSONModel(oSuggestionData);

		// Act
		oInput.setModel(oModel);
		oInput.bindSuggestionRows({
			path: "/tabularSuggestionItems",
			template: oTableItemTemplate
		});

		// Assert
		assert.ok(true, "No error is thrown");

		// Clean
		oInput.destroy();
	});

	QUnit.module("Input with Suggestions and Value State, but not Value State Message", {
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();
			this.inputWithSuggestions = new Input({
				showSuggestion: true,
				valueStateText: 'Some Error',
				showValueStateMessage: false,
				suggestionItems: [
					new Item({
						text: 'one',
						key: '1'
					}),
					new Item({
						text: 'two',
						key: '2'
					})
				]
			}).placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach: function () {
			if (this.inputWithSuggestions._oValueStateMessage._oPopup) {
				this.inputWithSuggestions._oValueStateMessage._oPopup.close();
			}

			this.inputWithSuggestions.destroy();
			this.inputWithSuggestions = null;

			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test('valueStateText', function (assert) {

		this.inputWithSuggestions.setValueState("Error");
		this.inputWithSuggestions.onfocusin();
		this.inputWithSuggestions._$input.trigger("focus").val("on").trigger("input");
		this.clock.tick(300);

		this.inputWithSuggestions._closeSuggestionPopup();
		this.clock.tick(300);

		assert.notOk(this.inputWithSuggestions._oValueStateMessage._oPopup, "Value state message is not shown");
	});

	QUnit.test('show/hide suggestions', function (assert) {
		// Act
		this.inputWithSuggestions.setValueState("Error");
		this.inputWithSuggestions.setShowValueStateMessage(true);

		// Assert
		assert.ok(this.inputWithSuggestions._getSuggestionsPopover().getPopover(), 'suggestions popover is initialized');

		// Act
		this.inputWithSuggestions.setShowSuggestion(false);
		this.inputWithSuggestions.openValueStateMessage();

		// Assert
		assert.ok(true, 'exception is not thrown');
	});

	QUnit.test('valueStateMsg z-index', function (assert) {
		this.inputWithSuggestions.setShowValueStateMessage(true);
		this.inputWithSuggestions.setValueState("Error");
		this.inputWithSuggestions.onfocusin();

		this.clock.tick(300);

		assert.ok(this.inputWithSuggestions._oValueStateMessage._oPopup, "Value state message is shown");
		assert.strictEqual(jQuery(this.inputWithSuggestions._oValueStateMessage._oPopup.getContent()).css('z-index'), '1', 'z-index is correct');
	});

	QUnit.module("Input with Suggestions and Value State and Value State Message - Desktop", {
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();

			this.inputWithSuggestions = new Input({
				showSuggestion: true,
				valueStateText: 'Some Error',
				showValueStateMessage: true,
				suggestionItems: [
					new Item({
						text: 'one',
						key: '1'
					}),
					new Item({
						text: 'two',
						key: '2'
					})
				]
			}).placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach: function () {
			if (this.inputWithSuggestions._oValueStateMessage._oPopup) {
				this.inputWithSuggestions._oValueStateMessage._oPopup.close();
			}

			this.inputWithSuggestions.destroy();
			this.inputWithSuggestions = null;

			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Value state", function (assert) {
		// Arrange
		var sValueStateText = "Error message. Extra long text used as an error message. Extra long text used as an error message - 2. Extra long text used as an error message - 3.";
		var fnCloseValueStateSpy = sinon.spy(this.inputWithSuggestions, "closeValueStateMessage");

		this.inputWithSuggestions.setShowValueStateMessage(true);
		this.inputWithSuggestions.setValueState("Error");

		// Act
		this.inputWithSuggestions.onfocusin();
		this.clock.tick(300);


		// Assert
		assert.ok(this.inputWithSuggestions._oValueStateMessage._oPopup.getContent().classList.contains("sapMValueStateMessage"), "Value state message is displayed");

		// Act
		this.inputWithSuggestions._$input.trigger("focus").val("on").trigger("input");
		this.clock.tick(1000);

		// Assert
		assert.strictEqual(this.inputWithSuggestions._getSuggestionsPopover().getPopover().$().find(".sapMValueStateHeaderText").text(), "Some Error", "value state message is displayed in the suggestion popover");
		assert.strictEqual(fnCloseValueStateSpy.called, true, "The value state message popup has been closed prior opening of the suggestions popover");

		// Act
		this.inputWithSuggestions.setValueStateText(sValueStateText);
		this.clock.tick(300);

		// Assert
		assert.strictEqual(this.inputWithSuggestions._getSuggestionsPopover().getPopover().$().find(".sapMValueStateHeaderText").text(), sValueStateText, "value state message is displayed in the suggestion popover");

		var oPopup = this.inputWithSuggestions._oValueStateMessage._oPopup;

		assert.ok(!oPopup || oPopup.getContent().style.display === "none", "Value state message is not displayed");

		// Act
		this.inputWithSuggestions._closeSuggestionPopup();
		this.clock.tick(300);

		// Assert
		assert.ok(this.inputWithSuggestions._oValueStateMessage._oPopup.getContent().classList.contains("sapMValueStateMessage"), "Value state message is displayed");
	});

	QUnit.module("Input with Suggestions and Value State and Value State Message -  Mobile", {
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();

			const oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

			this.oDeviceStub = this.stub(Device, "system").value(oSystem);

			this.inputWithSuggestions = new Input({
				showSuggestion: true,
				valueStateText: 'Some Error',
				showValueStateMessage: true,
				suggestionItems: [
					new Item({
						text: 'one',
						key: '1'
					}),
					new Item({
						text: 'two',
						key: '2'
					})
				]
			}).placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach: function () {
			if (this.inputWithSuggestions._oValueStateMessage._oPopup) {
				this.inputWithSuggestions._oValueStateMessage._oPopup.close();
			}

			this.inputWithSuggestions.destroy();
			this.inputWithSuggestions = null;

			this.oDeviceStub.restore();

			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Value state", function (assert) {
		// Arrange
		var sValueStateText = "Error message. Extra long text used as an error message. Extra long text used as an error message - 2. Extra long text used as an error message - 3.";
		this.inputWithSuggestions.setShowValueStateMessage(true);
		this.inputWithSuggestions.setValueState("Error");

		// Act
		this.inputWithSuggestions.onfocusin();
		this.clock.tick(300);

		// Assert
		assert.ok(this.inputWithSuggestions._oValueStateMessage._oPopup.getContent().classList.contains("sapMValueStateMessage"), "Value state message is displayed");

		// Act
		this.inputWithSuggestions._openSuggestionsPopover();
		this.clock.tick(300);

		// Assert
		assert.strictEqual(this.inputWithSuggestions._getSuggestionsPopover().getPopover().getContent()[0].getText(), "Some Error", "value state message is displayed in the suggestion popover");

		// Act
		this.inputWithSuggestions.setValueStateText(sValueStateText);
		this.clock.tick(300);

		// Assert
		assert.strictEqual(this.inputWithSuggestions._getSuggestionsPopover().getPopover().getContent()[0].getText(), sValueStateText, "value state message is displayed in the suggestion popover");

		var oPopup = this.inputWithSuggestions._oValueStateMessage._oPopup;

		assert.ok(!oPopup || oPopup.getContent().style.display === "none", "Value state message is not displayed");

		// Act
		this.inputWithSuggestions._closeSuggestionPopup();
		this.clock.tick(300);

		// Assert
		assert.ok(this.inputWithSuggestions._oValueStateMessage._oPopup.getContent().classList.contains("sapMValueStateMessage"), "Value state message is displayed");
	});

	QUnit.module("Input inside a Dialog and Value State Message", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			this.input = new Input({
				valueStateText: 'Some Error',
				showValueStateMessage: true
			});

			this.dialog = new Dialog();
		},
		afterEach: function () {

			this.dialog.destroy();
			this.dialog = null;
			this.input.destroy();
			this.input = null;

			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("valueStateMsg z-index", function (assert) {
		this.dialog.addContent(this.input);
		this.dialog.open();

		this.clock.tick(300);

		this.input.setValueState("Error");
		this.input.onfocusin();
		this.clock.tick(300);

		assert.ok(parseFloat(jQuery(this.input._oValueStateMessage._oPopup.getContent()).css('z-index')) > 1, 'z-index is correct');
	});

	QUnit.test("valueStateMsg z-index inside a parent with position absolute", function (assert) {

		// arrange
		var oToolbar = new Toolbar({
			content: this.input
		});

		this.dialog.addContent(oToolbar);
		this.dialog.open();
		this.clock.tick(300);

		oToolbar.$().css({
			position: "absolute",
			zIndex: 5
		});

		this.input.setValueState("Error");

		// act
		this.input.onfocusin();
		this.clock.tick(500);
		var iValueStateZIndex = jQuery(this.input._oValueStateMessage._oPopup.getContent()).zIndex();

		// assert
		assert.ok(iValueStateZIndex > this.dialog.$().zIndex(), "z-index of the value state message should be higher from all the parents z-indices");
	});

	QUnit.module("Value State Handling: Value State Message with links", {
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();
			this.oInput = new Input({
				showSuggestion: true,
				valueStateText: "Normal value state text",
				showValueStateMessage: true,
				suggestionItems: [
					new Item({
						text: 'one',
						key: '1'
					}),
					new Item({
						text: 'two',
						key: '2'
					})
				]
			}).placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach: function () {
			if (this.oInput._oValueStateMessage._oPopup) {
				this.oInput._oValueStateMessage._oPopup.close();
			}

			this.oInput.destroy();
			this.oInput = null;

			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Value state with formatted text containing a link", async function (assert) {
		// Arrange
		this.oInput.setValueState("Error");
		var oFormattedValueStateText = new FormattedText({
			htmlText: "Value state message containing a %%0",
			controls: new Link({
				text: "link",
				href: "#"
			})
		}),
			oSuggestionsPopoverHeader;

		// Act
		this.oInput.onfocusin();
		this.clock.tick();

		// Assert
		assert.ok(this.oInput._oValueStateMessage._oPopup.getContent().classList.contains("sapMValueStateMessage"), "Value state message is displayed");

		// Act
		this.oInput._$input.trigger("focus").val("on").trigger("input");
		this.clock.tick(1000);

		oSuggestionsPopoverHeader = this.oInput._getSuggestionsPopover().getPopover().getCustomHeader();

		// Assert
		assert.strictEqual(oSuggestionsPopoverHeader.$().text(), "Normal value state text", "Normal value state message is displayed in the suggestion popover");

		// Act
		this.oInput.setFormattedValueStateText(oFormattedValueStateText);
		await nextUIUpdate(this.clock);

		/* When value stage message containing a sap.m.FormattedText aggregation is set
		it should override the standart plain value state text */

		oSuggestionsPopoverHeader = this.oInput._getSuggestionsPopover().getPopover().getCustomHeader().getFormattedText();

		// Assert
		assert.strictEqual(oSuggestionsPopoverHeader.$().text(), "Value state message containing a link", "Formatted text value state message containing a link is displayed in the suggestion popover");

		// Act
		oSuggestionsPopoverHeader.getControls()[0].firePress();
		this.clock.tick();

		// Assert
		assert.strictEqual(oSuggestionsPopoverHeader.$().text(), "Value state message containing a link", "Formatted text value state message containing a link is still displayed in the suggestion popover header after link click");

		var oPopup = this.oInput._oValueStateMessage._oPopup;
		assert.ok(oPopup.getContent().style.display === "none", "Value state message is not displayed");

		// Act
		this.oInput._closeSuggestionPopup();
		this.clock.tick();

		// Assert
		assert.ok(this.oInput._oValueStateMessage._oPopup.getContent().classList.contains("sapMValueStateMessage"), "Value state message is displayed");
	});

	QUnit.test("Value state with formatted text containing multiple links", async function (assert) {
		// Arrange
		this.oInput.setValueState("Warning");
		var oFormattedValueStateText = new FormattedText({
			htmlText: "Value state message containing %%0 %%1",
			controls: [new Link({
				text: "multiple",
				href: "#"
			}),
			new Link({
				text: "links",
				href: "#"
			})]
		});
		var oPopup;

		// Act
		this.oInput.setFormattedValueStateText(oFormattedValueStateText);
		await nextUIUpdate(this.clock);

		this.oInput.onfocusin();
		this.clock.tick();


		oPopup = this.oInput._oValueStateMessage._oPopup;

		// Assert
		assert.notEqual(oPopup.getContent().style.display, "none", "Value state message popup is displayed");
		assert.strictEqual(document.querySelectorAll("#" + this.oInput.getId() + "-message a").length, 2, "Value state message links are displayed");
	});

	QUnit.test("Value state with formatted text containing HTML markup with links", async function (assert) {
		// Arrange
		this.oInput.setValueState("Warning");
		var oFormattedValueStateText = new FormattedText({
			htmlText: "Learn more about the new integration platform Click <a href='#'>here<a/>"
		});

		// Act
		this.oInput.setFormattedValueStateText(oFormattedValueStateText);
		await nextUIUpdate(this.clock);
		var fnClickOnValueStateLinkSpy = this.spy(this.oInput, "_bClickOnValueStateLink");

		const oFakeEvent = {
			relatedTarget: document.querySelector(".sapMLnk")
		};


		this.oInput.onfocusin();
		this.clock.tick();
		this.oInput.onfocusout(oFakeEvent);

		// Assert
		assert.ok(fnClickOnValueStateLinkSpy.returned(true), "Value state link has been clicked successfully");
	});

	QUnit.test("Value state popup should be closed on focusout", async function (assert) {
		// Arrange
		this.oInput.setValueState("Warning");
		var oFormattedValueStateText = new FormattedText({
			htmlText: "Value state message containing %%0 %%1",
			controls: [new Link({
				text: "multiple",
				href: "#"
			}),
			new Link({
				text: "links",
				href: "#"
			})]
		});
		var oPopup;

		// Act
		this.oInput.setFormattedValueStateText(oFormattedValueStateText);
		await nextUIUpdate(this.clock);

		this.oInput.focus();
		this.clock.tick();
		this.oInput.getFocusDomRef().blur();
		this.clock.tick();

		oPopup = this.oInput._oValueStateMessage._oPopup;

		// Assert
		assert.strictEqual(oPopup.getContent().style.display, "none", "Value state message is not displayed");
	});

	QUnit.test("Value state message link should be clickable and popup should be closed after a click", async function (assert) {
		// Arrange
		this.oInput.setValueState("Warning");
		var oFormattedValueStateText = new FormattedText({
			htmlText: "Value state message containing %%0 %%1",
			controls: [new Link({
				text: "multiple",
				href: "#"
			}),
			new Link({
				text: "links",
				href: "#"
			})]
		}),
			fnClickOnValueStateLinkSpy = sinon.spy(this.oInput, "_bClickOnValueStateLink"),
			oPopup,
			oFakeEvent;

		// Act
		this.oInput.setFormattedValueStateText(oFormattedValueStateText);
		await nextUIUpdate(this.clock);

		this.oInput.getFocusDomRef().focus();
		this.clock.tick();
		await nextUIUpdate(this.clock);

		oFakeEvent = {
			relatedTarget: this.oInput.getFormattedValueStateText().getControls()[0].getDomRef()
		};

		this.oInput.onfocusout(oFakeEvent);
		this.clock.tick();
		this.oInput.getFormattedValueStateText().getControls()[0].firePress();
		this.clock.tick();

		oPopup = this.oInput._oValueStateMessage._oPopup;

		// Assert
		assert.ok(fnClickOnValueStateLinkSpy.returned(true), "The value state link has been clicked successfully");
		assert.ok(!oPopup.isOpen(), "Value state message popup has been closed after press");
	});

	QUnit.test("Value state popup should be closed on click on the background", async function (assert) {
		// Arrange
		this.oInput.setValueState("Error");
		var oFormattedValueStateText = new FormattedText({
			htmlText: "Value state message containing a %%0",
			controls: new Link({
				text: "link",
				href: "#"
			})
		});
		var oFakeEvent = {
			relatedTarget: document.querySelector("body")
		};
		var oPopup;

		// Act
		this.oInput.setFormattedValueStateText(oFormattedValueStateText);
		await nextUIUpdate(this.clock);

		this.oInput.focus();
		this.clock.tick();

		this.oInput.onfocusout(oFakeEvent);
		this.clock.tick();

		oPopup = this.oInput._oValueStateMessage._oPopup;

		// Assert
		assert.strictEqual(oPopup.getContent().style.display, "none", "Value state message is not displayed");
	});

	QUnit.test("Setting new value state formatted text aggregation should be update also the value state header", async function (assert) {
		// Arrange
		var	oSuggPopoverHeaderValueState;
		var oFormattedValueStateText = new FormattedText({
			htmlText: "Value state message containing a %%0",
			controls: new Link({
				text: "link",
				href: "#"
			})
		});

		// Act
		this.oInput.setValueState("Error");
		this.oInput.setFormattedValueStateText(oFormattedValueStateText);
		await nextUIUpdate(this.clock);

		// Open sugg. popover with the initialy set formatted text value state
		// to switch the FormattedText aggregation to the value state header
		this.oInput._openSuggestionsPopover();
		this.clock.tick();
		this.oInput._closeSuggestionPopup();
		this.clock.tick();

		oFormattedValueStateText = new FormattedText({
			htmlText: "Another value state message containing %%0 %%1",
			controls: [
				new Link({
					text: "multiple",
					href: "#"
				}),
				new Link({
					text: "links",
					href: "#"
				})
			]
		});

		this.oInput.setFormattedValueStateText(oFormattedValueStateText);
		await nextUIUpdate(this.clock);

		this.oInput._getSuggestionsPopover().getPopover().attachAfterOpen(function () {
			oSuggPopoverHeaderValueState = this.oInput._getSuggestionsPopover().getPopover().getCustomHeader().getFormattedText().getDomRef().textContent;

			// Assert
			assert.strictEqual(oSuggPopoverHeaderValueState, "Another value state message containing multiple links", "New FormattedText value state message is correcrtly set in the popover's value state header");
		}, this);

		this.oInput._openSuggestionsPopover();
		this.clock.tick(300);
	});

	QUnit.test("Change to the formatted text input aggregation should also be change in the value state header", async function (assert) {
		// Arrange
		this.oInput.setValueState("Error");
		var oFormattedValueStateText = new FormattedText({
			htmlText: "Value state message containing a %%0",
			controls: new Link({
				text: "link",
				href: "#"
			})
		});
		var	oSuggPopoverHeaderValueState;

		// Act
		this.oInput.setFormattedValueStateText(oFormattedValueStateText);
		await nextUIUpdate(this.clock);

		this.oInput._getFormattedValueStateText().setHtmlText("New value state message containing a %%0");
		await nextUIUpdate(this.clock);

		this.oInput._getSuggestionsPopover().getPopover().attachAfterOpen(function () {
			oSuggPopoverHeaderValueState = this.oInput._getSuggestionsPopover().getPopover().getCustomHeader().getFormattedText().getDomRef().textContent;

			// Assert
			assert.strictEqual(oSuggPopoverHeaderValueState, "New value state message containing a link", "The FormattedText aggregation is correctly updated in the popover's value state header");
		}, this);

		this.oInput._openSuggestionsPopover();
		this.clock.tick(300);
	});

	QUnit.test("Change to the formatted text input aggregation should also be reflected in the value state header while it is open", async function (assert) {
		// Arrange
		this.oInput.setValueState("Error");
		var oFormattedValueStateText = new FormattedText({
			htmlText: "Value state message containing a %%0",
			controls: new Link({
				text: "link",
				href: "#"
			})
		});
		var	oSuggPopoverHeaderValueState;
		var oRenderedValueStateMessage;

		// Act
		this.oInput.setFormattedValueStateText(oFormattedValueStateText);

		this.oInput._$input.trigger("focus").val("on").trigger("input");
		this.clock.tick(1000);

		this.oInput._getFormattedValueStateText().setHtmlText("New value state message containing a %%0");
		await nextUIUpdate(this.clock);
		oSuggPopoverHeaderValueState = this.oInput._getSuggestionsPopover().getPopover().getCustomHeader().getFormattedText().getDomRef().textContent;

		// Assert
		assert.strictEqual(oSuggPopoverHeaderValueState, "New value state message containing a link", "The FormattedText aggregation is correctly updated in the popover's value state header while it's open");

		// Act
		qutils.triggerKeydown(this.oInput.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick();
		qutils.triggerKeydown(this.oInput.getFocusDomRef(), KeyCodes.ENTER);
		this.clock.tick();

		// Get the actual rendered value state text from the popup content DOM
		oRenderedValueStateMessage = document.getElementById(this.oInput.getValueStateMessageId()).textContent;

		// Assert
		assert.strictEqual(oRenderedValueStateMessage, "New value state message containing a link", "The updated FormattedText aggregation is also correctly displayed in the Input's value state popup after the suggestion popover is closed");
	});

	QUnit.test("Should move the visual focus from value state header to the input when the user starts typing", async function (assert) {
		// Arrange
		var oFormattedValueStateText = new FormattedText({
			htmlText: "Value state message containing a %%0",
			controls: new Link({
				text: "link",
				href: "#"
			})
		});
		var	oValueStateHeader;

		// Act
		this.oInput.setValueState("Information");
		this.oInput.setFormattedValueStateText(oFormattedValueStateText);
		await nextUIUpdate(this.clock);

		this.oInput._$input.trigger("focus").val("o").trigger("input");
		this.clock.tick(1000);

		// Select the value state header
		qutils.triggerKeydown(this.oInput.getFocusDomRef(), KeyCodes.ARROW_UP);
		this.clock.tick();

		this.oInput._$input.trigger("focus").val("one").trigger("input");
		this.clock.tick();

		oValueStateHeader = this.oInput._getSuggestionsPopover().getPopover().getCustomHeader();

		// Assert
		assert.notOk(oValueStateHeader.$().hasClass("sapMPseudoFocus"), "Pseudo focus is not the value state header");
		assert.notOk(this.oInput._getSuggestionsPopover().getItemsContainer().getItems()[0].$().hasClass("sapMLIBFocused"), "The visual pseudo focus is not on the first item");
		assert.ok(this.oInput.$().hasClass("sapMFocus"), "The visual pseudo focus is on the input");
	});

	QUnit.module("Input with suggestions - change event", {
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();
			this.oInput = new Input({
					showSuggestion: true
				});

			var aData = [
				{name: "Dente, Al", userid: "U01"},
				{name: "Friese, Andy", userid: "U02"},
				{name: "Mann, Anita", userid: "U03"},
				{name: "Schutt, Doris", userid: "U04"},
				{name: "Open, Doris", userid: "U05"},
				{name: "Dewit, Kenya", userid: "U06"},
				{name: "Zar, Lou", userid: "U07"},
				{name: "Burr, Tim", userid: "U08"},
				{name: "Hughes, Tish", userid: "U09"},
				{name: "Town, Mo", userid: "U10"},
				{name: "Case, Justin", userid: "U11"},
				{name: "Time, Justin", userid: "U12"},
				{name: "Barr, Sandy", userid: "U13"},
				{name: "Poole, Gene", userid: "U14"},
				{name: "Ander, Corey", userid: "U15"},
				{name: "Early, Brighton", userid: "U16"},
				{name: "Noring, Constance", userid: "U17"},
				{name: "O'Lantern, Jack", userid: "U18"},
				{name: "Tress, Matt", userid: "U19"},
				{name: "Turner, Paige", userid: "U20"}
			];

			var oModel = new JSONModel();
			oModel.setData(aData);

			this.oInput.setModel(oModel);
			this.oInput.bindAggregation("suggestionItems", "/", new Item({text: "{userid}"}));

			this.oInput.placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach: function () {
			this.oInput.destroy();
			this.oInput = null;
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Change event should be fired if entered value is not part of the suggestion list", function(assert) {
		var fnFireChangeSpy = this.spy(this.oInput, "fireChange");
		this.oInput.onfocusin();
		this.oInput._$input.trigger("focus").val("u2").trigger("input");
		this.clock.tick(300);

		this.oInput._$input.trigger("focus").val("U21").trigger("input");
		this.clock.tick(300);
		//ASSERT
		assert.equal(this.oInput.getValue() ,"U21", "Value is set");
		assert.equal(fnFireChangeSpy.callCount , 0 , "Change event should not be fired");

		qutils.triggerKeydown(this.oInput.getFocusDomRef(), "ENTER");
		this.clock.tick(300);
		assert.equal(fnFireChangeSpy.callCount , 1 , "Change event should be fired");

		fnFireChangeSpy.reset();
	});

	QUnit.test("Change event should be fired only once when there is a proposed item", async function(assert) {

		var oInputTemp = new Input("i2");
		oInputTemp.placeAt("content");
		await nextUIUpdate(this.clock);

		var fnFireChangeSpy = this.spy(this.oInput, "fireChange");
		this.oInput.onfocusin();
		this.oInput._$input.trigger("focus").val("u").trigger("input");
		this.clock.tick(1000);

		this.oInput._bDoTypeAhead = true;
		this.oInput._handleTypeAhead(this.oInput);

		this.oInput.onsapfocusleave({relatedControlId: null});
		document.getElementById('i2-inner').focus();

		this.clock.tick(300);
		assert.equal(fnFireChangeSpy.callCount , 1 , "Change event should be fired only once");

		fnFireChangeSpy.reset();
		oInputTemp.destroy();
	});

	QUnit.test("Change event should be fired when autocomplete is false and input is focused out", async function(assert) {
		var oInputTemp = new Input("i2");
		oInputTemp.placeAt("content");
		await nextUIUpdate(this.clock);

		var fnFireChangeSpy = this.spy(this.oInput, "fireChange");
		this.oInput.setAutocomplete(false);
		await nextUIUpdate(this.clock);

		this.oInput._$input.trigger("focus").val("u").trigger("input");
		this.clock.tick(1000);

		this.oInput._bDoTypeAhead = true;
		this.oInput._handleTypeAhead(this.oInput);
		await nextUIUpdate(this.clock);

		document.getElementById('i2-inner').focus();

		this.clock.tick(300);
		assert.equal(fnFireChangeSpy.callCount , 1 , "Change event should be fired only once");

		fnFireChangeSpy.reset();
		oInputTemp.destroy();
	});

	QUnit.test("Force closing suggestions popover on 'change' event", async function(assert) {

		var oInput = this.oInput,
			iSuggestionItemSelectedCount = 0;

		oInput.attachSuggestionItemSelected(function () {
			oInput.closeSuggestions();
			iSuggestionItemSelectedCount++;
		});

		oInput.onfocusin();
		oInput._$input.trigger("focus").val("u").trigger("input");
		this.clock.tick(1000);

		qutils.triggerKeydown(oInput.getDomRef("inner"), KeyCodes.ARROW_DOWN);
		await nextUIUpdate(this.clock);
		qutils.triggerKeydown(oInput.getDomRef("inner"), KeyCodes.ENTER);

		assert.ok(true, 'there is no endless loop');

		assert.strictEqual(iSuggestionItemSelectedCount,  1, 'attachSuggestionItemSelected is fired only once');
	});

	QUnit.module("Grouping", {
		beforeEach : async function() {
			this.clock = sinon.useFakeTimers();
			var oModel,
				aData = [
					{
						name: "A Item 1", key: "a-item-1", group: "A"
					}, {
						name: "A Item 2", key: "a-item-2", group: "A"
					},{
						name: "B Item 1", key: "a-item-1", group: "B"
					},{
						name: "B Item 2", key: "a-item-2", group: "B"
					},{
						name: "Other Item", key: "ab-item-1", group: "A B"
					}
				];

			this.oInput = new Input({
				showSuggestion: true
			}).placeAt("content");

			oModel = new JSONModel();
			oModel.setData(aData);
			this.oInput.setModel(oModel);


			this.oInput.bindAggregation("suggestionItems", {
				path: "/",
				sorter: [new Sorter('group', false, true)],
				template: new Item({text: "{name}", key: "{key}"})
			});
			await nextUIUpdate(this.clock);

		},
		afterEach : function() {
			this.oInput.destroy();
			runAllTimersAndRestore(this.clock);
		}}
	);

	QUnit.test("suggestionsCount should be aware of empty groups", function (assert) {
		// Setup
		var oCloseSpy = this.spy(this.oInput, "_hideSuggestionPopup");
		this.stub(this.oInput, "_getFilteredSuggestionItems").callsFake( function () {
			return {items: [], groups: [{}, {}]};
		});
		this.stub(this.oInput, "_hasTabularSuggestions").callsFake( function (){
			return true;
		});

		// Act
		this.oInput.showItems();

		// Assert
		assert.strictEqual(oCloseSpy.callCount, 1, "SuggestionsPopover should be closed");
	});

	QUnit.test("Group results", function(assert){
		var aVisibleItems;

		this.oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		this.oInput._$input.trigger("focus").val("A").trigger("input");
		this.clock.tick(1000);

		aVisibleItems = this.oInput._getSuggestionsPopover().getItemsContainer().getItems().filter(function(oItem){
			return oItem.getVisible();
		});
		var sInvisibleTextId = aVisibleItems[0].getId();

		// Act
		qutils.triggerKeydown(this.oInput.getDomRef(), KeyCodes.ARROW_DOWN);

		// Assert
		assert.strictEqual(this.oInput.getFocusDomRef().getAttribute('aria-activedescendant'), sInvisibleTextId, "Input has aria-activedescendant attribute set");
		assert.strictEqual(aVisibleItems.length, 3, "The correct number of items is displayed");
		assert.ok(aVisibleItems[0].isA("sap.m.GroupHeaderListItem"), "A group header is added");
		assert.strictEqual(aVisibleItems[1].getTitle(), "A Item 1", "The first list item has correct text");
		assert.strictEqual(aVisibleItems[2].getTitle(), "A Item 2", "The second list item has correct text");

	});

	QUnit.test("addSuggestionItemGroup", function(assert){
		var sTitle = "Test",
			oSpy = this.spy(this.oInput, "addAggregation"),
			oHeader = this.oInput.addSuggestionItemGroup({text: sTitle}, null, false);

		// assert
		assert.ok(oHeader.isA("sap.ui.core.SeparatorItem"), "A group header is created.");
		assert.ok(oSpy.calledWith("suggestionItems", oHeader, false), "An item is added to suggestionItems");
		assert.strictEqual(oHeader.getText(), sTitle, "The group header title is correct.");

		oSpy.restore();
	});

	QUnit.test("addSuggestionRowGroup", function(assert){
		var sTitle = "Test",
			oSpy = this.spy(this.oInput, "addAggregation"),
			oHeader = this.oInput.addSuggestionRowGroup({text: sTitle}, null, false);

		// assert
		assert.ok(oHeader.isA("sap.m.GroupHeaderListItem"), "A group header is created.");
		assert.ok(oSpy.calledWith("suggestionRows", oHeader, false), "An item is added to suggestionItems.");
		assert.strictEqual(oHeader.getTitle(), sTitle, "The group header title is correct.");

		oSpy.restore();
	});

	QUnit.test("Keyboard selection of group header", async function (assert) {
		var aVisibleItems;

		this.oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		this.oInput._$input.trigger("focus").val("A").trigger("input");
		this.clock.tick(1000);

		aVisibleItems = this.oInput._getSuggestionsPopover().getItemsContainer().getItems().filter(function(oItem){
			return oItem.getVisible();
		});

		// act
		qutils.triggerKeydown(this.oInput.getDomRef("inner"), KeyCodes.ARROW_DOWN);
		await nextUIUpdate(this.clock);

		// assert
		// go to the header group item
		assert.strictEqual(this.oInput.getValue(), "A", "The typed in value should be reset.");

		// act
		// go to the next list item
		qutils.triggerKeydown(this.oInput.getDomRef("inner"), KeyCodes.ARROW_DOWN);
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(this.oInput.getValue(), aVisibleItems[1].getTitle(), "The value is populated again.");
	});

	QUnit.test("Selection of group header", function(assert) {
		var aVisibleItems, oGroupHeader;
		var oSuggPopover = this.oInput._getSuggestionsPopover();

		// act
		this.oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		this.oInput._$input.trigger("focus").val("A").trigger("input");
		this.clock.tick(1000);

		aVisibleItems = this.oInput._getSuggestionsPopover().getItemsContainer().getItems().filter(function(oItem){
			return oItem.getVisible();
		});
		oGroupHeader = aVisibleItems[0];

		// assert
		assert.ok(oGroupHeader.isA("sap.m.GroupHeaderListItem"), "The first visible item is a group header");

		//act
		oGroupHeader.focus();

		//assert
		assert.strictEqual(document.activeElement, this.oInput.getFocusDomRef(), "The focus is in the input field");

		// act
		qutils.triggerKeydown(this.oInput.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(this.oInput.getFocusDomRef(), KeyCodes.ENTER);

		//assert
		assert.ok(oGroupHeader.hasStyleClass("sapMLIBFocused"), "The focus outline is over the group header");
		assert.ok(oSuggPopover.isOpen(), "The popover remains open");
	});

	QUnit.test("Behaviour for a 'startsWith' item selection", async function (assert) {
		// Setup
		this.oInput.showItems();
		this.clock.tick(500);

		var oSuggestionsPopover = this.oInput._getSuggestionsPopover();
		var oItem = oSuggestionsPopover.getItemsContainer().getItems()[1]; // The first SsstandardListItem

		// Simulate user input- the first 3 letters of a StandardListItem
		this.oInput.setValue(oItem.getTitle().substr(0, 3));
		this.oInput.focus();

		// Act
		oSuggestionsPopover.fireEvent(SuggestionsPopover.M_EVENTS.SELECTION_CHANGE, {
			previousItem: null,
			newItem: oItem
		});
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oInput.getValue(), oItem.getTitle(), "The title is autocompleted in the Input.");
		assert.strictEqual(this.oInput._$input[0].selectionStart, 3,"The selection is over the autocompleted value.");

		// Act
		// Go back to the input. The "focus" is moved to the input
		oSuggestionsPopover.fireEvent(SuggestionsPopover.M_EVENTS.SELECTION_CHANGE, {
			previousItem: null,
			newItem: null
		});
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oInput.getValue(), oItem.getTitle().substr(0, 3), "User's input is kept.");
	});

	QUnit.test("Behaviour for a 'contains' item selection", async function (assert) {
		// Setup
		this.oInput.showItems();
		this.clock.tick(500);

		var oSuggestionsPopover = this.oInput._getSuggestionsPopover();
		var oItem = oSuggestionsPopover.getItemsContainer().getItems()[1]; // The first SsstandardListItem

		// Simulate user input- some letters letters from a StandardListItem, but not the first ones
		this.oInput.setValue(oItem.getTitle().substr(3));
		this.oInput.focus();

		// Act
		oSuggestionsPopover.fireEvent(SuggestionsPopover.M_EVENTS.SELECTION_CHANGE, {
			previousItem: null,
			newItem: oItem
		});
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oInput.getValue(), oItem.getTitle(), "The title is autocompleted in the Input.");
		assert.strictEqual(this.oInput._$input[0].selectionStart, 0,"The selection is over the whole text.");
		assert.strictEqual(this.oInput._$input[0].selectionEnd, this.oInput.getValue().length,"The selection is over the whole text.");

		// Act
		// Go back to the input. The "focus" is moved to the input
		oSuggestionsPopover.fireEvent(SuggestionsPopover.M_EVENTS.SELECTION_CHANGE, {
			previousItem: null,
			newItem: null
		});
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oInput.getValue(), "", "The input is reset");
	});

	QUnit.test("Behaviour for a GroupItem selection", async function (assert) {
		// Setup
		this.oInput.showItems();
		this.clock.tick(500);

		var oSuggestionsPopover = this.oInput._getSuggestionsPopover();
		var oGroupItem = oSuggestionsPopover.getItemsContainer().getItems()[0]; // A GroupItem
		var oItem = oSuggestionsPopover.getItemsContainer().getItems()[1]; // A StandardListItem

		// Simulate user input- which matches some item
		this.oInput.setValue(oItem.getTitle().substr(0, 3));
		this.oInput.focus();

		// Act
		oSuggestionsPopover.fireEvent(SuggestionsPopover.M_EVENTS.SELECTION_CHANGE, {
			previousItem: null,
			newItem: oGroupItem
		});
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oInput.getValue(), "A I", "User's input is not reset.");

		// Act
		// Go back to the input. The "focus" is moved to the input
		oSuggestionsPopover.fireEvent(SuggestionsPopover.M_EVENTS.SELECTION_CHANGE, {
			previousItem: null,
			newItem: null
		});
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oInput.getValue(), "A I", "The input value should not be reset");
	});

	QUnit.module("showItems functionality", {
		beforeEach: async function () {
			var aData = [
					{
						name: "A Item 1", key: "a-item-1", group: "A"
					}, {
						name: "A Item 2", key: "a-item-2", group: "A"
					}, {
						name: "B Item 1", key: "a-item-1", group: "B"
					}, {
						name: "B Item 2", key: "a-item-2", group: "B"
					}, {
						name: "Other Item", key: "ab-item-1", group: "A B"
					}
				],
				oModel = new JSONModel(aData);

			this.oInput = new Input({
				showSuggestion: true,
				suggestionItems: {
					path: "/",
					template: new Item({text: "{name}", key: "{group}"})
				}
			}).setModel(oModel).placeAt("content");

			await nextUIUpdate();

		},
		afterEach: function () {
			this.oInput.destroy();
			this.oInput = null;
		}
	});

	QUnit.module("showItems functionality: List", {
			beforeEach: async function () {
				var aData = [
						{
							name: "A Item 1", key: "a-item-1", group: "A"
						}, {
							name: "A Item 2", key: "a-item-2", group: "A"
						}, {
							name: "B Item 1", key: "a-item-1", group: "B"
						}, {
							name: "B Item 2", key: "a-item-2", group: "B"
						}, {
							name: "Other Item", key: "ab-item-1", group: "A B"
						}
					],
					oModel = new JSONModel(aData);

				this.oInput = new Input({
					showSuggestion: true,
					suggestionItems: {
						path: "/",
						template: new Item({text: "{name}", key: "{group}"})
					}
				}).setModel(oModel).placeAt("content");

				await nextUIUpdate();

			},
			afterEach: function () {
				this.oInput.destroy();
				this.oInput = null;

				runAllTimersAndRestore(this.clock);
			}
		});

	QUnit.test("Should restore default filtering function", function (assert) {
		// Setup
		var fnFilter = this.oInput._getFilterFunction();

		// Act
		this.oInput.showItems(function () {
			return true;
		});

		// Assert
		assert.strictEqual(this.oInput._getFilterFunction(), fnFilter, "Default function has been restored");

		// Act
		fnFilter = function (sValue, oItem) {
			return oItem.getText() === "A Item 1";
		};
		this.oInput.setFilterFunction(fnFilter);
		this.oInput.showItems(function () {
			return false;
		});

		// Assert
		assert.strictEqual(this.oInput._getFilterFunction(), fnFilter, "Custom filter function has been restored");
	});

	QUnit.test("Should show all the items", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Act
		this.oInput.showItems();
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		// Assert
		assert.strictEqual(getVisibleItems(this.oInput._getSuggestionsPopover().getPopover()).length, 5, "Shows all items");
	});

	QUnit.test("Should filter the items", async function (assert) {
		// Act
		this.oInput.showItems(function (sValue, oItem) {
			return oItem.getText() === "A Item 1";
		});
		await nextUIUpdate();

		// Assert
		assert.strictEqual(getVisibleItems(this.oInput._getSuggestionsPopover().getPopover()).length, 1, "Show only the matching items");
	});

	QUnit.module("showItems functionality: Table", {
		beforeEach: async function () {
			var aData = [
					{
						name: "A Item 1", key: "a-item-1", group: "A"
					}, {
						name: "A Item 2", key: "a-item-2", group: "A"
					}, {
						name: "B Item 1", key: "a-item-1", group: "B"
					}, {
						name: "B Item 2", key: "a-item-2", group: "B"
					}, {
						name: "Other Item", key: "ab-item-1", group: "A B"
					}
				],
				oModel = new JSONModel(aData);

			this.oInput = new Input({
				showSuggestion: true,
				suggestionColumns: [
					new Column({
						header: new Label({text: "Name"})
					}),
					new Column({
						header: new Label({text: "Key"})
					})
				],
				suggestionRows: {
					path: "/",
					template: new ColumnListItem({
						type: "Active",
						vAlign: "Middle",
						cells: [
							new Label({text: "{name}"}),
							new Label({text: "{key}"})
						]
					})
				}
			}).setModel(oModel).placeAt("content");

			await nextUIUpdate();

		},
		afterEach: function () {
			this.oInput.destroy();
			this.oInput = null;

			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Should show all the items", async function (assert) {
		// Setup
		var fnGetVisisbleItems = function (aItems) {
			return aItems.filter(function (oItem) {
				return oItem.getVisible();
			});
		};

		// Act
		this.oInput.showItems();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oInput._getSuggestionsTable().getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oInput._getSuggestionsTable().getItems()).length, 5, "Shows all items");
	});

	QUnit.test("Should filter the items", async function (assert) {
		// Setup
		var fnGetVisisbleItems = function (aItems) {
			return aItems.filter(function (oItem) {
				return oItem.getVisible();
			});
		};

		// Act
		this.oInput.showItems(function (sValue, oItem) {
			return oItem.getCells()[0].getText() === "A Item 1";
		});
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oInput._getSuggestionsTable().getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oInput._getSuggestionsTable().getItems()).length, 1, "Only the matching items are visible");
	});


	QUnit.test("If suggestions[tabular] hidden text is empty when there are no suggestions", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oInput = new Input({ showSuggestion: true });
		var oAnnounceSpy = this.spy(InvisibleMessage.prototype, "announce");
		var oMessageBundle = Library.getResourceBundleFor("sap.m");

		oInput.addSuggestionColumn(new Column({ header: new Label({text: "Text"}) }));
		oInput.addSuggestionRow(new ColumnListItem({
			cells: [
				new Text({text:"{value}"}),
				new Text({text:"{key}"})
			]
		 }));

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oInput.showItems(function () { return true; });
		this.clock.tick(400);
		await nextUIUpdate(this.clock);

		oInput.focus();
		await nextUIUpdate(this.clock);

		//Assert
		assert.ok(oAnnounceSpy.calledWith(oMessageBundle.getText("INPUT_SUGGESTIONS_ONE_HIT")), "Contains information about 1 item");

		//Clean up
		oAnnounceSpy.restore();
		oInput.destroy();
	});

	QUnit.module("Dialog on mobile", {
		beforeEach: function(){
			this.clock = sinon.useFakeTimers();
			const oSystem = {
					desktop: false,
					phone: true,
					tablet: false
				};

			this.oDeviceStub = this.stub(Device, "system").value(oSystem);
		},
		afterEach: function(){
			this.oDeviceStub.restore();
			this.oInput.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Dialog elements", async function (assert) {
		this.oInput = new Input({showSuggestion: true});
		this.oLabel = new Label({text: "Label text", labelFor: this.oInput.getId()});
		this.oRb = Library.getResourceBundleFor("sap.m");

		this.oInput._openSuggestionsPopover();
		await nextUIUpdate(this.clock);

		const oDialog = this.oInput._getSuggestionsPopover().getPopover();
		const oCustomHeader = oDialog.getCustomHeader();

		assert.ok(oCustomHeader.getContentMiddle()[0].isA("sap.m.Title"), "A title is added to the dialog");
		assert.strictEqual(oCustomHeader.getContentMiddle()[0].getText(), this.oLabel.getText(), "The title has a correct value.");

		assert.ok(oCustomHeader.getContentRight()[0].isA("sap.m.Button"), "A button is added to the header.");
		assert.strictEqual(oCustomHeader.getContentRight()[0].getIcon(),  IconPool.getIconURI("decline"), "The button renders a decline icon");

		assert.strictEqual(oDialog.getBeginButton().getText(), this.oRb.getText("SUGGESTIONSPOPOVER_CLOSE_BUTTON"),
			"The OK button has a correct text value");
	});

	QUnit.test("Close button press", async function (assert) {
		this.oInput = new Input({showSuggestion: true});
		this.oInput._openSuggestionsPopover();
		await nextUIUpdate(this.clock);

		const oSuggPopover = this.oInput._getSuggestionsPopover();
		const oCloseButton = oSuggPopover.getPopover().getCustomHeader().getContentRight()[0];

		oCloseButton.firePress();
		this.clock.tick(1000);

		assert.notOk(oSuggPopover.isOpen(), "The dialog is closed on X press.");
	});

	QUnit.test("OK button press", async function (assert) {
		this.oInput = new Input({showSuggestion: true});
		this.oInput._openSuggestionsPopover();
		await nextUIUpdate(this.clock);

		const oSuggPopover = this.oInput._getSuggestionsPopover();
		const oOKButton = oSuggPopover.getPopover().getBeginButton();

		oOKButton.firePress();
		this.clock.tick(1000);

		assert.notOk(oSuggPopover.isOpen(), "The dialog is closed on OK press.");
	});

	QUnit.test("Close button should revert user input on mobile dialog", async function (assert) {
		// arrange
		this.oInput = new Input({
			showSuggestion: true,
			value: "test",
			suggestionItems: [
				new Item({
					key: "1",
					text: "Item 1"
				})
			]
		});

		this.oInput.placeAt("content");
		await nextUIUpdate(this.clock);
		this.oInput._openSuggestionsPopover();
		this.clock.tick(500);

		const oSuggPopover = this.oInput._getSuggestionsPopover();
		const oSuggPopoverInput = oSuggPopover.getInput();
		const oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.I });
		const oCloseButton = oSuggPopover.getPopover().getCustomHeader().getContentRight()[0];

		// act
		oSuggPopoverInput._$input.trigger("focus").trigger(oFakeKeydown).val("I").trigger("input");
		this.clock.tick(1000);

		oCloseButton.firePress();
		this.clock.tick(500);

		// assert
		assert.notOk(oSuggPopover.isOpen(), "The dialog is closed on closee button press.");
		assert.strictEqual(this.oInput.getValue(), "test", "The value is reverted when close button is pressed");
		assert.notOk(this.oInput.getSelectedItem(), "Selected item is not set");
		assert.notOk(this.oInput.getSelectedKey(), "Selected key is not set");
	});

	QUnit.test("OK button should confirm user input on mobile dialog", async function (assert) {
		// arrange
		this.oInput = new Input({
			showSuggestion: true,
			value: "test",
			suggestionItems: [
				new Item({
					key: "1",
					text: "Item 1"
				})
			]
		});

		this.oInput.placeAt("content");
		await nextUIUpdate(this.clock);
		this.oInput._openSuggestionsPopover();
		this.clock.tick(500);

		const oSuggPopover = this.oInput._getSuggestionsPopover();
		const oSuggPopoverInput = oSuggPopover.getInput();
		const oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.I });
		const oOKButton = oSuggPopover.getPopover().getBeginButton();

		// act
		oSuggPopoverInput._$input.trigger("focus").trigger(oFakeKeydown).val("I").trigger("input");
		this.clock.tick(500);

		oOKButton.firePress();
		this.clock.tick(400);

		// assert
		assert.strictEqual(this.oInput.getValue(), "Item 1", "The input value is updated.");
		assert.notOk(oSuggPopover.isOpen(), "The dialog is closed on OK button press.");
		assert.ok(this.oInput.getSelectedItem(), "Selected item is set");
		assert.strictEqual(this.oInput.getSelectedKey(), "1", "Selected key is set");
	});

	QUnit.test("Tabular: Close button should revert user input on mobile dialog", async function (assert) {
		// arrange
		this.oInput = new Input({
			showSuggestion: true,
			value: "test",
			suggestionColumns: [
				new Column({})
			],
			suggestionRows: [
				new ColumnListItem({
					cells: [
						new Text({text:"Item"})
					]
				})
			]
		});

		this.oInput.placeAt("content");
		await nextUIUpdate(this.clock);
		this.oInput._openSuggestionsPopover();
		this.clock.tick(500);

		const oSuggPopover = this.oInput._getSuggestionsPopover();
		const oSuggPopoverInput = oSuggPopover.getInput();
		const oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.I });
		const oCloseButton = oSuggPopover.getPopover().getCustomHeader().getContentRight()[0];

		// act
		oSuggPopoverInput._$input.trigger("focus").trigger(oFakeKeydown).val("I").trigger("input");
		this.clock.tick(500);

		oCloseButton.firePress();
		this.clock.tick(500);

		// assert
		assert.notOk(oSuggPopover.isOpen(), "The dialog is closed on closee button press.");
		assert.strictEqual(this.oInput.getValue(), "test", "The value is reverted when close button is pressed");
		assert.notOk(this.oInput.getSelectedRow(), "Selected row is not set");
	});

	QUnit.test("Tabular: OK button should confirm user input on mobile dialog", async function (assert) {
		// arrange
		this.oInput = new Input({
			showSuggestion: true,
			value: "test",
			suggestionColumns: [
				new Column({})
			],
			suggestionRows: [
				new ColumnListItem({
					cells: [
						new Text({text:"Item"})
					]
				})
			]
		});

		this.oInput.placeAt("content");
		await nextUIUpdate(this.clock);
		this.oInput._openSuggestionsPopover();
		this.clock.tick(500);

		const oSuggPopover = this.oInput._getSuggestionsPopover();
		const oSuggPopoverInput = oSuggPopover.getInput();
		const oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.I });
		const oOKButton = oSuggPopover.getPopover().getBeginButton();

		// act
		oSuggPopoverInput._$input.trigger("focus").trigger(oFakeKeydown).val("I").trigger("input");
		this.clock.tick(500);
		oSuggPopoverInput._$input.trigger("focus").trigger(jQuery.Event("keydown", { which: KeyCodes.t })).val("It").trigger("input");
		this.clock.tick(500);

		oOKButton.firePress();
		this.clock.tick(500);

		// assert
		assert.strictEqual(this.oInput.getValue(), "Item", "The input value is updated.");
		assert.notOk(oSuggPopover.isOpen(), "The dialog is closed on OK button press.");
		assert.ok(this.oInput.getSelectedRow(), "Selected row is set");
	});

	QUnit.test("Change event should be fired on focusout", async function (assert) {
		var bChangeFired = false;
		this.oInput = new Input({
			value: "t"
		});

		this.oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		this.oInput.attachChange(function() {
			bChangeFired = true;
		});
		await nextUIUpdate(this.clock);

		//act
		this.oInput._$input.trigger("focus").trigger(jQuery.Event("keydown", { which: KeyCodes.BACKSPACE })).val("").trigger("input");
		this.clock.tick(300);

		this.oInput._$input.trigger("blur");
		this.clock.tick(200);

		// assert
		assert.ok(bChangeFired, "Change event is fired");
	});

	QUnit.module("selectedKey vs. value behavior", {
		beforeEach: function () {
			this.oData = {
				selectedKey: "2",
				value: "zzzzzzz",
				items: [
					{status: "0", statusText: "Backups"},
					{status: "1", statusText: "Equipment"},
					{status: "2", statusText: "Locations"},
					{status: "3", statusText: "Systems"}
				]
			};
			this.oModel = new JSONModel(this.oData);
		},
		afterEach: function () {
			this.oModel.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Setters: selectedKey + matching item should overwrite the value", async function (assert) {
		// Setup
		var oInput = new Input({
			value: "Zzzzzz",
			selectedKey: "2",
			showSuggestion: true,
				suggestionItems: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oInput.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oInput.getValue(), "Locations", "The value should come from the selected key");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("Setters: selectedKey + matching item should overwrite the value (changed setters order)", async function (assert) {
		// Setup
		var oInput = new Input({
			selectedKey: "2",
			value: "Zzzzzz",
			showSuggestion: true,
				suggestionItems: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oInput.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oInput.getValue(), "Locations", "The value should come from the selected key");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("Bindings: selectedKey + matching item should overwrite the value", async function (assert) {
		// Setup
		var oInput = new Input({
			value: "{/value}",
			selectedKey: "{/selectedKey}",
			showSuggestion: true,
				suggestionItems: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oInput.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oInput.getValue(), "Locations", "The value should come from the selected key");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("Bindings: selectedKey + matching item should overwrite the value (changed binding order)", async function (assert) {
		// Setup
		var oInput = new Input({
			selectedKey: "{/selectedKey}",
			value: "{/value}",
			showSuggestion: true,
				suggestionItems: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oInput.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oInput.getValue(), "Locations", "The value should come from the selected key");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("Bindings: Value + No selectedKey: should leave the value as it is", async function (assert) {
		// Setup
		var oInput = new Input({
			value: "{/value}",
			showSuggestion: true,
				suggestionItems: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oInput.getSelectedKey(), "", "selectedKey should remain");
		assert.strictEqual(oInput.getValue(), "zzzzzzz", "The value should come from the selected key");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("Bindings: selectedKey + No Value: should set the value to the matching item", async function (assert) {
		// Setup
		var oInput = new Input({
			selectedKey: "{/selectedKey}",
			showSuggestion: true,
				suggestionItems: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		var oReadOnlyInput = new Input({
			selectedKey: "{/selectedKey}",
			editable: false,
			showSuggestion: true,
				suggestionItems: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oInput.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oInput.getValue(), "Locations", "The value should come from the selected key");
		assert.strictEqual(oReadOnlyInput.getValue(), "Locations", "The value should come from the selected key");

		// Cleanup
		oReadOnlyInput.destroy();
		oInput.destroy();
	});

	QUnit.test("Mixed: Binding: selectedKey, Setter: Value: should set the value of the matching item", async function (assert) {
		// Setup
		var oInput = new Input({
			value: "Zzzzzz",
			selectedKey: "{/selectedKey}",
			showSuggestion: true,
				suggestionItems: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oInput.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oInput.getValue(), "Locations", "The value should come from the selected key");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("Mixed: Setter: selectedKey, Binding: Value: should set the value of the matching item", async function (assert) {
		// Setup
		var oInput = new Input({
			value: "{/value}",
			selectedKey: "2",
			showSuggestion: true,
				suggestionItems: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oInput.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oInput.getValue(), "Locations", "The value should come from the selected key");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("User Interaction: Sets value over selectedKey", async function (assert) {
		// Setup
		var oInput = new Input({
			selectedKey: "2",
			showSuggestion: true,
				suggestionItems: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Act
		oInput.focus();
		qutils.triggerCharacterInput(oInput._$input, "T", "This is a user input");
		await nextUIUpdate();


		// Assert
		assert.strictEqual(oInput.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oInput.getValue(), "This is a user input", "The value should come from the user input");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("User Interaction: Sets value over selectedKey (binding)", async function (assert) {
		// Setup
		var oInput = new Input({
			selectedKey: "{/selectedKey}",
			showSuggestion: true,
				suggestionItems: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Act
		oInput.focus();
		qutils.triggerCharacterInput(oInput._$input, "T", "This is a user input");
		await nextUIUpdate();


		// Assert
		assert.strictEqual(oInput.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oInput.getValue(), "This is a user input", "The value should come from the user input");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("User Interaction: Binding update should overwrite user value (binding: async)", async function (assert) {
		// Setup
		var oModel = new JSONModel(),
			oInput = new Input({
				selectedKey: "{/selectedKey}",
				showSuggestion: true,
				suggestionItems: {
					path: "/items",
					template: new Item({key: "{status}", text: "{statusText}"})
				}
			})
				.setModel(oModel)
				.placeAt("content");
		await nextUIUpdate();

		// Act
		oInput.focus();
		qutils.triggerCharacterInput(oInput._$input, "T", "This is a user input");
		await nextUIUpdate();

		// Act
		oModel.setData(this.oData);
		await nextUIUpdate();


		// Assert
		assert.strictEqual(oInput.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oInput.getValue(), "Locations", "The value should come from the selected key");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("setValue should not be called on BACKSPACE when suggestions are not used", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Setup
		var oInput = new Input({
		}).placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		oInput._$input.trigger("focus").val("t").trigger("input");
		this.clock.tick(300);
		oInput.$().trigger("focusout");

		var oInvalidationSpy = this.spy(oInput, "setValue");

		// Act
		oInput._$input.trigger("focus").trigger(jQuery.Event("keydown", { which: KeyCodes.BACKSPACE })).val("").trigger("input");
		qutils.triggerKeydown(oInput._$input, KeyCodes.BACKSPACE);
		qutils.triggerKeyup(oInput._$input, KeyCodes.BACKSPACE);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oInvalidationSpy.callCount, 0, "setValue is not triggered on BACKSPACE");

		// Cleanup
		oInput.destroy();
	});


	QUnit.test("If the sap.ui.core.Item's text direction is set explicitly it should be mapped to the StandardListItem", async function (assert) {
		// Arrange
		var oInput = new Input({
			showSuggestion: true,
			suggestionItems: [
				new SeparatorItem({
					text: "Countries",
					textDirection: TextDirection.RTL
				}),
				new Item({
					key: "GER",
					text: "Germany",
					textDirection: TextDirection.RTL
				}),
				new Item({
					key: "GAM",
					text: "Gambia"
				})
			]
		}).placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oInput.getSuggestionItems()[0].getTextDirection(), "RTL", 'RTL direction is correctly mapped from sap.ui.core.Item to sap.m.StandardListItem');
		assert.strictEqual(oInput.getSuggestionItems()[1].getTextDirection(), "RTL", 'RTL direction is correctly mapped from sap.ui.core.Item to sap.m.StandardListItem');

		// Clean
		oInput.destroy();
	});

	QUnit.module("Usage", {
		afterEach: function(){
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Input with list suggestion: Braces in binded text and key properties do not cause error", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oData = {
				items: [
					{key: "key1 {{}}{}", value: "test1 {{}}", group: "1 {{}}{"},
					{key: "key2 }}{{", value: "test2", group: "1 {{}}{"},
					{key: "key3", value: "test3", group: "2 {}{{}}"},
					{key: "key4", value: "test4", group: "2 {}{{}}"}
				]
			},
			oInput = new Input({
				showSuggestion: true,
				suggestionItems: {
					path: "/items",
					template: new Item({key: "{key}", text: "{value}"}),
					sorter: [new Sorter('group', false, true)]
				}
			});

		oInput.setModel(new JSONModel(oData));
		oInput.placeAt('content');
		await nextUIUpdate(this.clock);

		// Act
		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("t").trigger("input");
		this.clock.tick(1000);

		// Assert
		assert.strictEqual(oInput._getSuggestionsPopover().getItemsContainer().getItems()[0].getTitle(), "1 {{}}{", "Braces are escaped in inputs item group header");
		assert.strictEqual(oInput._getSuggestionsPopover().getItemsContainer().getItems()[1].getTitle(), "test1 {{}}", "Braces are escaped in inputs item text");

		// Act
		oInput.setSelectionItem(oInput.getSuggestionItems()[1]);

		// Assert
		assert.strictEqual(oInput.getValue(), "test1 {{}}", "Braces are correctly set on the value.");
		assert.strictEqual(oInput.getSelectedKey(), "key1 {{}}{}", "Braces are escaped in inputs selected key.");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test("Input with table suggestions: Braces in binded text and key properties do not cause error", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oData = {
				items: [
					{key: "key1 {{}}{}", value: "test1 {{}}", group: "1 {{}}{"},
					{key: "key2 }}{{", value: "test2", group: "1 {{}}{"},
					{key: "key3", value: "test3", group: "2 {}{{}}"},
					{key: "key4", value: "test4", group: "2 {}{{}}"}
				]
			},
			oInput = new Input({
				showSuggestion: true,
				suggestionRows: {
					path: "/items",
					template: new ColumnListItem({
						cells: [
							new Text({text:"{value}"}),
							new Text({text:"{key}"})
						]
					}),
					sorter: [new Sorter('group', false, true)]
				},
				suggestionColumns: [
					new Column({
						header: new Label({text: "Text"})
					}),
					new Column({
						header: new Label({text: "Key"})
					})
				]
			});

		oInput.setModel(new JSONModel(oData));
		oInput.placeAt('content');
		await nextUIUpdate(this.clock);

		// Act
		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.trigger("focus").val("t").trigger("input");
		this.clock.tick(300);

		// Assert
		assert.strictEqual(oInput._getSuggestionsPopover().getItemsContainer().getItems()[0].getTitle(), "1 {{}}{", "Braces are escaped in inputs item group header");
		assert.strictEqual(oInput._getSuggestionsPopover().getItemsContainer().getItems()[1].getCells()[0].getText(), "test1 {{}}", "Braces are escaped in inputs item text");

		// Act
		oInput.setSelectionRow(oInput.getSuggestionRows()[1]);

		// Assert
		assert.strictEqual(oInput.getValue(), "test1 {{}}", "Braces are correctly set on the value.");

		// Cleanup
		oInput.destroy();
	});

	QUnit.test('Input inside a dialog: Dialog scrollbar', function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oInput = new Input({
				showSuggestion: true,
				suggestionItems: [
					new SuggestionItem()
				]
			}),
			oDialog = new Dialog({
				content: [oInput]
			});

		// Act
		oDialog.open();

		var scrollDiv = oDialog.$().find(".sapMDialogScroll")[0];

		// Assert
		assert.equal(scrollDiv.offsetWidth, scrollDiv.scrollWidth, "Dialog doesn't have a scrollbar");

		// Act
		oInput._$input.trigger("focus").val("abc").trigger("input");
		oDialog.focus();
		this.clock.tick(300);

		// Assert
		assert.equal(scrollDiv.offsetWidth, scrollDiv.scrollWidth, "Dialog doesn't have a scrollbar");

		// Cleanup
		oDialog.destroy();
		oInput.destroy();
	});

	QUnit.test("maxLength: setValue() initial rendering should respect getMaxLength", async function (assert) {
		var fnSetValueTestCase1 = async function (mSettings) {
			// Arrange
			var oInput = new Input({maxLength: mSettings.maxLength, value: mSettings.value});

			oInput.placeAt("content");
			await nextUIUpdate();

			// Assert
			assert.strictEqual(jQuery(oInput.getFocusDomRef()).val(), mSettings.output);

			// Cleanup
			oInput.destroy();
		};

		await fnSetValueTestCase1({maxLength : 0, value : "Test", output: "Test"});
		await fnSetValueTestCase1({maxLength: 5, value: "Test", output: "Test"});
		await fnSetValueTestCase1({maxLength: 2, value: "Test", output: "Test"});
	});

	QUnit.test("maxLength: setValue() after the initial rendering should not respect getMaxLength", async function(assert) {
		var fnSetValueTestCase2 = async function(mSettings) {
			// Arrange
			var oInput = new Input({maxLength: mSettings.maxLength});
			var fnSetValueSpy = sinon.spy(oInput, "setValue");

			oInput.placeAt("content");
			await nextUIUpdate();
			var fnRerenderSpy = sinon.spy(oInput, "onAfterRendering");

			// Act
			oInput.setValue(mSettings.input);

			// Assert
			assert.strictEqual(jQuery(oInput.getFocusDomRef()).val(), mSettings.output);
			assert.ok(fnSetValueSpy.returned(oInput), "sap.m.InputBase.prototype.setValue() method returns the correct value");
			assert.strictEqual(fnRerenderSpy.callCount, 0, "Input is not rerendered with setValue calls");

			// Cleanup
			fnSetValueSpy.restore();
			fnRerenderSpy.restore();
			oInput.destroy();
		};

		await fnSetValueTestCase2({maxLength: 0, input : "Test", output: "Test"});
		await fnSetValueTestCase2({maxLength: 5, input: "Test", output: "Test"});
		await fnSetValueTestCase2({maxLength: 2, input: "Test", output: "Test"});
	});

	QUnit.test("Mobile: Dialog's input should propagate the correct typed value for the valueHelpRequest event", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		const oDeviceStub = this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		assert.expect(1);

		var done = assert.async();
		var oInput = new Input({
				width: "10rem",
				showValueHelp: true,
				showSuggestion: true,
				suggestionRows: {
					path: "/items",
					template: new ColumnListItem({
						cells: [
							new Text({text:"{value}"}),
							new Text({text:"{key}"})
						]
					})
				},
				suggestionColumns: [
					new Column({
						header: new Label({text: "Text"})
					}),
					new Column({
						header: new Label({text: "Key"})
					})
				],
				valueHelpRequest: function (oEvent) {
					// Assert
					assert.strictEqual(oEvent.getParameter("_userInputValue"), "te");
					done();
				}
			})
			.setModel(new JSONModel({
				items: [
					{key: "key1", value: "test1"},
					{key: "key2", value: "test2"},
					{key: "key3", value: "test3"},
					{key: "key4", value: "test4"}
				]
			})).placeAt("content");

		await nextUIUpdate(this.clock);

		// Act
		var oSuggPopover = oInput._getSuggestionsPopover();
		var oPopupInput = oSuggPopover.getInput();
		oSuggPopover.getPopover().open();
		this.clock.tick(500);

		oPopupInput.setValue("te");
		oPopupInput.fireLiveChange({value: "", newValue: "te"});
		oInput._fireValueHelpRequest();
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		// Cleanup
		oSuggPopover.getPopover().close();
		this.clock.tick(500);
		oDeviceStub.restore();
		oInput.destroy();
	});
});