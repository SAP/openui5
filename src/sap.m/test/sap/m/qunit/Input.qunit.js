/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/Device",
	"sap/m/Input",
	"sap/m/Table",
	"sap/ui/events/jquery/EventExtension",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"jquery.sap.keycodes",
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
	"sap/ui/core/IconPool",
	"sap/ui/qunit/utils/waitForThemeApplied",
	"sap/ui/events/KeyCodes",
	"sap/m/Link",
	"sap/m/Toolbar",
	"jquery.sap.global"
], function(
	qutils,
	createAndAppendDiv,
	Device,
	Input,
	Table,
	EventExtension,
	Item,
	JSONModel,
	Sorter,
	jQuery,
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
	IconPool,
	waitForThemeApplied,
	KeyCodes,
	Link,
	Toolbar
) {
	// shortcut for sap.m.InputTextFormatMode
	var InputTextFormatMode = mobileLibrary.InputTextFormatMode;

	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	document.body.insertBefore(createAndAppendDiv("content"), document.body.firstChild);



	// FIXME: test doesn't work in headless PhantomJS test cycle => commented out!
	//  ==> PhantomJS fails with strange errors when evaluating setTimeout
	//      e.g.: null is not a constructor (evaluating setTimeout) as a follow
	//      up of the destroy calls of the Input control
	if (Device.browser.phantomJS) {
		var fnSetTimeout = window.setTimeout;
		window.setTimeout = function() {
			try {
				fnSetTimeout.apply(this, arguments);
			} catch (e) {
				// ignore
			}
		};
		var fnClearTimeout = window.clearTimeout;
		window.clearTimeout = function() {
			try {
				fnClearTimeout.apply(this, arguments);
			} catch (e) {
				// ignore
			}
		};
	}



	// FIXME: test doesn't work in headless PhantomJS test cycle => commented out!
	//  ==> PhantomJS fails with strange errors when evaluating setTimeout
	//      e.g.: null is not a constructor (evaluating setTimeout) as a follow
	//      up of the destroy calls of the Input control
	if (Device.browser.phantomJS) {
		var fnSetTimeout = window.setTimeout;
		window.setTimeout = function() {
			try {
				fnSetTimeout.apply(this, arguments);
			} catch (e) {
				// ignore
			}
		};
		var fnClearTimeout = window.clearTimeout;
		window.clearTimeout = function() {
			try {
				fnClearTimeout.apply(this, arguments);
			} catch (e) {
				// ignore
			}
		};
	}

	function getPopupItemsContent(oPopup) {
		var aContents = oPopup.getContent();
		return oPopup.isA("sap.m.Popover") ? aContents[0] : aContents[1];
	}

	var i1;
	var i2;
	var value = "value";

	var oInput = new Input("i1");
	//oInput.setMaxLength(12);
	//@TODO Write qunit for maxlength
	oInput.placeAt("content");
	oInput.setValue("ABCD");

	var oInput2 = new Input("i2");
	oInput2.setType("Number");
	oInput2.placeAt("content");

	var oInput3 = new Input("i3");
	oInput3.setVisible(false);
	oInput3.placeAt("content");

	var oInput4 = new Input("i4");
	oInput4.setValueState("Error");
	oInput4.placeAt("content");

	var oInput5 = new Input("i5");
	oInput5.setValueState("Warning");
	oInput5.placeAt("content");

	var oInput6 = new Input("i6", {
		showSuggestion: true
	});
	oInput6.placeAt("content");

	var oInput7 = new Input("i7", {
		showSuggestion: true
	});

	oInput7.placeAt("content");

	var oInput8 = new Input("i8");
	oInput8.placeAt("content");


	QUnit.module("Basic", {
		beforeEach : function() {
			i1 = sap.ui.getCore().getControl("i1");
			i2 = sap.ui.getCore().getControl("i2");
			i3 = sap.ui.getCore().getControl("i3");
			i4 = sap.ui.getCore().getControl("i4");
			i5 = sap.ui.getCore().getControl("i5");
			i8 = sap.ui.getCore().getControl("i8");
		},
		afterEach : function() {
			i1 = null;
			i2 = null;
			i3 = null;
			i4 = null;
			i5 = null;
			i8 = null;
		}
	});

	// test property accessor methods
	QUnit.test("Value", function(assert) {
		i1.setValue(value);
		assert.equal(i1.getValue(), value, "Input value is " + value);
	});

	QUnit.test("InputType", function(assert) {
		var typeDefault = "Text";
		assert.equal(i1.getType(), typeDefault, "Input Type: Default");
	});

	QUnit.test("InputEnabled", function(assert) {
		var enabled = false;
		i1.setEnabled(enabled);
		assert.equal(i1.getEnabled(), enabled, "Input is disabled");
		enabled = true;
		i1.setEnabled(enabled);
		assert.equal(i1.getEnabled(), enabled, "Input is enabled");
	});

	QUnit.test("ValueHelpOnly", function(assert) {
		assert.equal(i1.getValueHelpOnly(), false, "ValueHelpOnly Default: false");
		var helponly = true;
		i1.setValueHelpOnly(helponly);
		assert.equal(i1.getValueHelpOnly(), helponly, "ValueHelpOnly is true");
	});

	QUnit.test("Placeholder", function(assert) {
		var placeholder = "Placeholder";
		i1.setPlaceholder(placeholder);
		assert.equal(i1.getPlaceholder(), placeholder, "Placeholder for text");

		i2.setPlaceholder(placeholder);
		assert.equal(i2.getPlaceholder(), placeholder, "Placeholder for number field");
	});

	QUnit.test("Visible", function(assert) {
		assert.equal(i1.$().length, 1, "Visible input found");
		assert.equal(i3.$().length, 0, "Invisible input not found");
	});

	QUnit.test("Change", function(assert) {
		i1.setValue("new");
		sap.ui.getCore().applyChanges();
		i1.attachChange(function() {
			assert.equal(this.getValue(), "new", "New value in onChange");
		});
		i1.onChange(jQuery.Event("change"));
		assert.equal(i1.getValue(),"new", "Value after onchange");
	});

	QUnit.test("Event order", function(assert) {
		var oInput = new Input({
				showSuggestion: true
			}),
			$Input,
			oPopup, // is lazy loaded
			aNames = ["abcTom", "abcPhilips", "abcAnna"],
			aItemAdded = [],
			i,
			bSuggestionItemSelectedEventCalled = false,
			bChangeEventCalled = false;

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();
		$Input = oInput.$();

		oInput.attachSuggest(function(){
			for (i = 0 ; i < aNames.length ; i++){
				if (jQuery.inArray(aNames[i], aItemAdded) === -1){
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
		oInput._$input.focus().val("abc").trigger("input");
		this.clock.tick(300);
		oPopup = oInput._oSuggPopover._oPopover;

		oInput.$().trigger("focusout");
		sap.ui.test.qunit.triggerTouchEvent("tap", getPopupItemsContent(oPopup).getItems()[1].getDomRef());
		this.clock.tick(300);

		oInput.destroy();
	});

	QUnit.test("valueLiveUpdate", function(assert) {

		var oModel = new JSONModel({testValue: ""});
		oInput8.setModel(oModel);
		oInput8.bindValue("/testValue");

		var fnFireChangeSpy = this.spy(i8, "fireChange");
		i8.setValueLiveUpdate(false);
		i8.setValue("");
		i8.focus();
		sap.ui.test.qunit.triggerCharacterInput(i8.getFocusDomRef(), "a");
		sap.ui.test.qunit.triggerEvent("input", i8.getFocusDomRef());

		assert.equal(oModel.getProperty("/testValue"),"" , "no valueLiveUpdate, no model value update");
		assert.equal(i8.getValue()                   ,"a", "no valueLiveUpdate, new value");
		assert.equal(fnFireChangeSpy.callCount       , 0 , "no valueLiveUpdate, no change event");

		sap.ui.test.qunit.triggerKeydown(i8.getFocusDomRef(), "ENTER");

		assert.equal(i8.getValue()                   ,"a", "no valueLiveUpdate, Enter, same new value");
		assert.equal(oModel.getProperty("/testValue"),"a", "no valueLiveUpdate, Enter, model value update");
		assert.equal(fnFireChangeSpy.callCount       , 1 , "no valueLiveUpdate, Enter, change event");

		i8.setValueLiveUpdate(true);
		i8.setValue("");
		fnFireChangeSpy.reset();
		sap.ui.test.qunit.triggerCharacterInput(i8.getFocusDomRef(), "a");
		sap.ui.test.qunit.triggerEvent("input", i8.getFocusDomRef());
		assert.equal(oModel.getProperty("/testValue"),"a", "valueLiveUpdate, no model value update");
		assert.equal(i8.getValue()                   ,"a", "valueLiveUpdate, new value");
		assert.equal(fnFireChangeSpy.callCount       , 0,  "valueLiveUpdate, stil no change event");

		sap.ui.test.qunit.triggerKeydown(i8.getFocusDomRef(), "ENTER");

		assert.equal(oModel.getProperty("/testValue"),"a", "valueLiveUpdate, no model value update");
		assert.equal(i8.getValue()                   ,"a", "no valueLiveUpdate, Enter, change");
		assert.equal(fnFireChangeSpy.callCount       , 1,  "no valueLiveUpdate, Enter, changeevent");

		i8.setValueLiveUpdate(false);
	});

	QUnit.test("Value States", function(assert) {

		assert.equal(i4.$("content").hasClass('sapMInputBaseContentWrapperError'), true, "Before new value state : Error");
		assert.equal(i5.$("content").hasClass('sapMInputBaseContentWrapperWarning'), true, "Before new value state : Warning");
		assert.equal(i4.$().attr("title"), undefined, "No tooltip for error state");
		assert.equal(i5.$().attr("title"), undefined, "No tooltip for warning state");

		i4.setValueState("Warning");
		i5.setValueState("Error");
		i8.setValueState("Information");
		sap.ui.getCore().applyChanges();

		assert.equal(i4.$("content").hasClass('sapMInputBaseContentWrapperWarning'), true, "After new value state : Warning");
		assert.equal(i5.$("content").hasClass('sapMInputBaseContentWrapperError'), true, "After new value state : Error");
		assert.equal(i8.$("content").hasClass('sapMInputBaseContentWrapperInformation'), true, "After new value state : Information");

		i4.setValueState();
		i5.setValueState("None");

		assert.equal(i4.getValueState(), "None", "Last value state : None");
		assert.equal(i5.getValueState(), "None", "Last value state : None");
		assert.equal(i5.$().attr("title"), undefined, "Tooltip is empty for valueState \"None\"");
	});

	QUnit.test("Value Help Indicator", function(assert) {
		var spy = this.spy(),
			oInput = new Input( {
				valueHelpRequest: spy
			}),
			oInputId = oInput.getId();

		// place control
		oInput.placeAt("content");

		// first check if value help indicator classes are not set by default
		assert.ok(oInput.$().children(".sapMInputValHelp").length === 0, "Has no outer value help indicator element");
		assert.ok(oInput.$().children(".sapMInputValHelpInner").length === 0, "Has no inner value help indicator element");

		// set value help indicator to true
		oInput.setShowValueHelp(true);
		sap.ui.getCore().applyChanges();

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
	});

	QUnit.test("Value help _userInputValue request parameter with suggestions", function(assert) {
		// Arrange
		var oInput = new Input({
				showValueHelp: true,
				showSuggestion: true
			}),
			oSpy = sinon.spy(oInput, "fireValueHelpRequest"),
			oSuggPopover;

		oSuggPopover = oInput._getSuggestionsPopover();
		oSuggPopover._sTypedInValue = "test";

		// Act
		oInput._fireValueHelpRequest();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "The value help was called once");
		assert.strictEqual(oSpy.firstCall.args[0]._userInputValue, "test", "The value for user input was the correct one");

		// Clean
		oInput.destroy();
	});

	QUnit.test("Value help _userInputValue request parameter without suggestions", function(assert) {
		// Arrange
		var oInput = new Input({
				showValueHelp: true,
				showSuggestion: false,
				value: "test"
			}),
			oSpy = sinon.spy(oInput, "fireValueHelpRequest");

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Act
		oInput._fireValueHelpRequest();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "The value help was called once");
		assert.strictEqual(oSpy.firstCall.args[0]._userInputValue, "test", "The value for user input was the correct one");

		// Clean
		oInput.destroy();
	});

	QUnit.test("No error is thrown when showSuggestion is set to false", function (assert) {
		var oInput = new Input({
				showValueHelp: true
			}),
			oSuggPopover = oInput._getSuggestionsPopover(),
			oUpdateSpy = new sinon.spy(oSuggPopover, "updateValueState");

		// Arrange
		oInput.setShowSuggestion(false);
		sap.ui.getCore().applyChanges();

		// Act
		try {
			oInput.setValueState("Error");
		} catch (e) {
			// continue
		}
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(!oUpdateSpy.threw(), "No error was thrown.");

		// Clean
		oUpdateSpy.restore();
	});

	QUnit.test("Submit Event", function(assert) {

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
			sap.ui.getCore().applyChanges();
			sap.ui.test.qunit.triggerKeydown(oInput.getDomRef("inner"), jQuery.sap.KeyCodes.ENTER);
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
		checkSubmit("Enter pressed after change", true, true, "hello");
		oInput.setEnabled(false);
		checkSubmit("Enter pressed on disabled field", false, false);
		oInput.setEnabled(true);
		oInput.setEditable(false);
		checkSubmit("Enter pressed on readonly field", false, false);
		oInput.setEditable(true);
		oInput.setShowValueHelp(true);
		checkSubmit("Enter pressed on field with value help", true, false, "hello");
		oInput.setValueHelpOnly(true);
		checkSubmit("Enter pressed on field with value help only", false, false);
		oInput.setShowValueHelp(false);
		oInput.setValueHelpOnly(false);

		// Enter on Suggestions
		if (Device.system.desktop) {
			oInput.setShowSuggestion(true);
			var aItemsAdded = [];
			oInput.attachSuggest(function() {
				var aNames = ["abcTom", "abcPhilips", "abcAnna"];
				for (var i = 0; i < aNames.length; i++) {
					if (jQuery.inArray(aNames[i], aItemsAdded) === -1){
						oInput.addSuggestionItem(new Item({text: aNames[i]}));
						aItemsAdded.push(aNames[i]);
					}
				}
			});
			sap.ui.getCore().applyChanges();

			oInput.onfocusin();
			oInput._$input.focus().val("abc").trigger("input");
			this.clock.tick(300);

			assert.ok(oInput._oSuggPopover && oInput._oSuggPopover._oPopover.isOpen && oInput._oSuggPopover._oPopover.isOpen(), "Suggestion Popup is open now");
			sap.ui.test.qunit.triggerKeydown(oInput.getDomRef("inner"), jQuery.sap.KeyCodes.ARROW_DOWN);
			checkSubmit("Enter pressed on open Suggestions", true, true, "abcTom");
			assert.ok(oInput._oSuggPopover && oInput._oSuggPopover._oPopover.isOpen && !oInput._oSuggPopover._oPopover.isOpen(), "Suggestion Popup should be closed");
		}

		oInput.destroy();
	});

	QUnit.test("Suggestion output", function (assert) {

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
			sap.ui.getCore().applyChanges();

			oInput.onfocusin();
			oInput._$input.focus().val(" ").trigger("input");
			this.clock.tick(300);

			sap.ui.test.qunit.triggerKeydown(oInput.getDomRef("inner"), jQuery.sap.KeyCodes.ARROW_DOWN);
			sap.ui.getCore().applyChanges();
			sap.ui.test.qunit.triggerKeydown(oInput.getDomRef("inner"), jQuery.sap.KeyCodes.ENTER);
			assert.equal(sValue, sSuggestion, ": Correct parameter 'value' in enter event");
		}

		oInput.destroy();
	});

	QUnit.test("Value Help Only CSS Classes and event", function(assert) {
		var spy = this.spy(),
			oInputVHO = new Input( {
				showValueHelp: true,
				valueHelpOnly: true,
				valueHelpRequest: spy
			}),
			oInputIdVHO = oInputVHO.getId();

		// place control
		oInputVHO.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Value help event check
		oInputVHO._$input.focus().trigger("tap");
		this.clock.tick(500);
		assert.strictEqual(spy.callCount, 1, "Value Help Request has been fired and received successfully");
	});

	QUnit.test("Conditions for Value Help Only not valid", function(assert) {
	// case1: showValueHelp is false
		var spy = this.spy(),
			oInputVHO = new Input( {
				showValueHelp: false,
				valueHelpOnly: true,
				enabled: true,
				editable: true,
				valueHelpRequest: spy
				}),
			oInputIdVHO = oInputVHO.getId();

		// place control
		oInputVHO.placeAt("content");
		sap.ui.getCore().applyChanges();

		// check if valueHelpOnly class is set in addition to ValueHelp class
		assert.ok(oInputVHO.$().hasClass("sapMInputVH") === false, "showValueHelp = false: Outer div has no additional CSS class\"sapMInputVH\"");
		assert.ok(oInputVHO.$().hasClass("sapMInputVHO") === false, "showValueHelp = false: Outer div has no additional CSS class\"sapMInputVHO\"");

		// Value help event check
		oInputVHO._$input.focus().trigger("tap");
		this.clock.tick(500);
		assert.strictEqual(spy.callCount, 0, "showValueHelp = false: Tap has been fired and no Value Help Request is submitted");

		// case2 ValueHelpOnly is false
		var spy1 = this.spy(),
			oInputVHO1 = new Input( {
				showValueHelp: true,
				valueHelpOnly: false,
				enabled: true,
				editable: true,
				valueHelpRequest: spy1
				}),
			oInputIdVHO1 = oInputVHO1.getId();

		// place control
		oInputVHO1.placeAt("content");
		sap.ui.getCore().applyChanges();

		// check if valueHelpOnly class is set in addition to ValueHelp class
		assert.ok(oInputVHO1.$().hasClass("sapMInputVHO") === false, "valueHelponly = false: Outer div has no additional CSS class\"sapMInputVHO\"");

		// Value help event check
		oInputVHO1._$input.focus().trigger("tap");
		this.clock.tick(500);
		assert.strictEqual(spy1.callCount, 0, "valueHelponly = false: Tap has been fired and no Value Help Request is submitted");

		// case3: Editable is false
		var spy2 = this.spy(),
			oInputVHO2 = new Input( {
				showValueHelp: true,
				valueHelpOnly: true,
				enabled: true,
				editable: false,
				valueHelpRequest: spy2
				}),
			oInputIdVHO2 = oInputVHO2.getId();

		// place control
		oInputVHO2.placeAt("content");
		sap.ui.getCore().applyChanges();

		// check if valueHelpOnly class is set in addition to ValueHelp class
		assert.ok(oInputVHO2.$().hasClass("sapMInputVHO") === false, "editable = false: Outer div has no additional CSS class\"sapMInputVHO\"");

		// Value help event check
		oInputVHO2._$input.focus().trigger("tap");
		this.clock.tick(500);
		assert.strictEqual(spy2.callCount, 0, "editable = false: Tap has been fired and no Value Help Request is submitted");

		// case4: Enabled is false
		var spy3 = this.spy(),
			oInputVHO3 = new Input( {
				showValueHelp: true,
				valueHelpOnly: true,
				enabled: false,
				editable: true,
				valueHelpRequest: spy3
				}),
			oInputIdVHO3 = oInputVHO3.getId();

		// place control
		oInputVHO3.placeAt("content");
		sap.ui.getCore().applyChanges();

		// check if valueHelpOnly class is set in addition to ValueHelp class
		assert.ok(oInputVHO3.$().hasClass("sapMInputVHO") === false, "enabled = false: Outer div has no additional CSS class\"sapMInputVHO\"");

		// Value help event check
		oInputVHO3._$input.focus().trigger("tap");
		this.clock.tick(500);
		assert.strictEqual(spy3.callCount, 0, "enabled = false: Tap has been fired and no Value Help Request is submitted");
	});

	QUnit.test("Keyboard Handling for ValueHelpOnly", function(assert) {
		//Event check for Enter and Space
		var evt = jQuery.Event("sapselect"),

		spy = this.spy(),
		oInput = new Input( {
			showValueHelp: true,
			valueHelpOnly: true,
			valueHelpRequest: spy
		});
		oInput.onsapselect(evt);
		assert.strictEqual(spy.callCount, 1, "The value help was requested by pressing Enter or Space");
	});

	QUnit.test("Check step attribute", function(assert) {
		assert.strictEqual(document.getElementById("i1-inner").getAttribute("step"), null, "Input of type \"Text\" have no step attribute set");
		assert.strictEqual(document.getElementById("i2-inner").getAttribute("step"), "any", "Input of type \"Number\" have step attribute set to \"any\"");
	});

	QUnit.test("ESC should reset back to old value when valueLiveUpdate is true.", function(assert) {

		// Arrange
		var sInitValue = "Test",
			sNewValue = "Testa";

		var oInput = new Input({
			value: sInitValue,
			valueLiveUpdate: true
		});
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Act
		sap.ui.test.qunit.triggerCharacterInput(oInput.getFocusDomRef(), "a");
		sap.ui.test.qunit.triggerEvent("input", oInput.getFocusDomRef());

		// Assert- before escape
		assert.strictEqual(oInput.getValue(), sNewValue, "Before escape - getValue should return the NEW value.");
		assert.strictEqual(oInput.getFocusDomRef().value, sNewValue, "Before escape - DOM value should be the same as the NEW value.");
		assert.strictEqual(oInput.getProperty("value"), sNewValue, "Before escape - getProperty(value) should return the NEW value.");

		// Act
		sap.ui.test.qunit.triggerKeyboardEvent(oInput.getFocusDomRef(), "ESCAPE");

		// Assert - after escape
		assert.strictEqual(oInput.getValue(), sInitValue, "After escape - getValue should return the INITIAL value.");
		assert.strictEqual(oInput.getFocusDomRef().value, sInitValue, "After escape - DOM value should be the same as the INITIAL value.");
		assert.strictEqual(oInput.getProperty("value"), sInitValue, "After escape - getProperty(value) should return the INITIAL value.");

		// cleanup
		oInput.destroy();
	});

	QUnit.module("Destroy");

	QUnit.test("Destroy DOM", function(assert) {
		var oInput = new Input({
			showSuggestion: false
		}),
		$Input;

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();
		$Input = oInput.$();

		assert.strictEqual($Input.length, 1, "Before destroy input is rendered in DOM");
		oInput.destroy();
		$Input = oInput.$();

		assert.strictEqual($Input.length, 0, "After destroy input DOM node is removed");
	});

	QUnit.test("Destroy Suggestion List and Popup", function(assert) {
		var oInput = new Input({
				showSuggestion: true
			}),
			$Input,
			sInputId = oInput.getId();

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
		sap.ui.getCore().applyChanges();
		$Input = oInput.$();

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().val("De").trigger("input");
		this.clock.tick(300);

		oInput.destroy();

		// assert.ok(oInput._oSuggPopover._oList === null || oInput._oSuggPopover._oList === undefined, "The internal list is destroyed");
		assert.ok(oInput._oSuggPopover === null || oInput._oSuggPopover === undefined, "The internal popup is destroyed");
	});

	QUnit.module("Suggestions");

	QUnit.test("Suggestions deactivated and aggregations are not filled - list and popup should not be initialized", function(assert){
		var oInput = new Input({
				showSuggestion: false
			}),
			$Input,
			i;

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();
		$Input = oInput.$();

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().val("abc").trigger("input");
		this.clock.tick(300);

		// suggestions are not active, list and popup should not be initialized
		// assert.strictEqual(oInput._oSuggPopover._oList, undefined, "The internal list is not initialzed when suggestions are set to false");
		assert.strictEqual(oInput._oSuggPopover, undefined, "The internal popup is not initialzed when suggestions are set to false");

		oInput.destroy();
	});

	QUnit.test("Suggestion on Desktop", function(assert){
		var $Input = oInput6.$(),
			oPopup, // is lazy loaded
			aNames = ["abcTom", "abcPhilips", "abcAnna"],
			aItemAdded = [],
			i;

		oInput6.attachSuggest(function(){
			for (i = 0 ; i < aNames.length ; i++){
				if (jQuery.inArray(aNames[i], aItemAdded) === -1){
					oInput6.addSuggestionItem(new Item({text: aNames[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});

		oInput6.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput6._$input.focus().val("abc").trigger("input");

		this.clock.tick(300);

		oPopup = oInput6._oSuggPopover._oPopover;
		assert.ok(oPopup instanceof sap.m.Popover, "Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");
		assert.equal(getPopupItemsContent(oPopup).getItems().length, aNames.length, "Suggestions are inserted");
		assert.ok(getPopupItemsContent(oPopup) instanceof sap.m.List, "Suggestions are list-based)");

		oInput6._$input.focus().val("abcT").trigger("input");
		this.clock.tick(400);
		assert.ok(oPopup.isOpen(), "Suggestion Popup is still open now");
		assert.equal(getPopupItemsContent(oPopup).getItems().length, 1, "Suggestions are filtered");

		//close the popoup when nothing is typed in input
		oInput6._$input.focus().val("").trigger("input");
		this.clock.tick(300);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup is closed");
		assert.equal(getPopupItemsContent(oPopup).getItems().length, 0, "Suggestions are destroyed");

		oInput6.destroy();
	});

	QUnit.test("Suggestion on Desktop - enter key pressed before the first suggest event", function(assert){
		var oInput = new Input({
				showSuggestion: true
			}),
			$Input,
			oPopup, // is lazy loaded
			aNames = ["abcTom", "abcPhilips", "abcAnna"],
			aItemAdded = [],
			i,
			oSpy = this.spy();

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();
		$Input = oInput.$();

		oInput.attachSuggest(oSpy);

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().val("abc").trigger("input");
		// Enter key is pressed directly after typing "abc"
		sap.ui.test.qunit.triggerKeyboardEvent(oInput._$input[0], jQuery.sap.KeyCodes.ENTER);

		this.clock.tick(300);

		assert.equal(oSpy.callCount, 0, "Suggest event listener shouldn't be called");

		oInput.destroy();
	});

	QUnit.test("Suggestion on Desktop - Close with enter key", function(assert){
		var oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

		var oPopup, // is lazy loaded
			aNames = ["abcTom", "abcPhilips", "abcAnna"],
			aItemAdded = [],
			i;

		var oInput = new Input({
			showSuggestion: true,
			suggest: function(){
				for (i = 0 ; i < aNames.length ; i++){
					if (jQuery.inArray(aNames[i], aItemAdded) === -1){
						oInput.addSuggestionItem(new Item({text: aNames[i]}));
						aItemAdded.push(aNames[i]);
					}
				}
			}
		});

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().val("abc").trigger("input");

		this.clock.tick(300);

		oPopup = oInput._oSuggPopover._oPopover;
		assert.ok(oPopup instanceof sap.m.Popover, "Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		sap.ui.test.qunit.triggerKeyboardEvent(oInput.getDomRef(), jQuery.sap.KeyCodes.ENTER);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup should be closed");

		oInput.destroy();
	});

	QUnit.test("Suggestion on Desktop with change event handler", function(assert){
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
		this.stub(ObjectPool.prototype, "returnObject", function(){});

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput.attachSuggest(function(){
			for (i = 0 ; i < aNames.length ; i++){
				if (jQuery.inArray(aNames[i], aItemAdded) === -1){
					oInput.addSuggestionItem(new Item({text: aNames[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().val("abc").trigger("input");

		this.clock.tick(300);

		oPopup = oInput._oSuggPopover._oPopover;
		assert.ok(oPopup instanceof sap.m.Popover, "Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		var oItem = oInput._oSuggPopover._oPopover.getContent()[0].getItems()[0];
		assert.ok(oItem, "Item should be created");

		oItem.focus();
		oItem.$().trigger("tap");

		this.clock.tick(50);

		assert.equal(fnCallback.callCount, 1, "change event handler only called once");
		var spyCall = fnCallback.getCall(0);
		assert.equal(spyCall.args[0].getParameter("value"), "abcTom", "change event fired with the right parameter");
		oInput.destroy();
	});

	QUnit.test("Suggestion on Desktop with change event handler (focus on next input)", function(assert){
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
		this.stub(ObjectPool.prototype, "returnObject", function(){});

		oInput.placeAt("content");
		oNextInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput.attachSuggest(function(){
			for (i = 0 ; i < aNames.length ; i++){
				if (jQuery.inArray(aNames[i], aItemAdded) === -1){
					oInput.addSuggestionItem(new Item({text: aNames[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().val("abc").trigger("input");

		this.clock.tick(300);

		oPopup = oInput._oSuggPopover._oPopover;
		assert.ok(oPopup instanceof sap.m.Popover, "Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		oNextInput.focus();
		this.clock.tick(300);

		assert.equal(fnCallback.callCount, 1, "change event handler only called once");
		var spyCall = fnCallback.getCall(0);
		assert.equal(spyCall.args[0].getParameter("value"), "abc", "change event fired with the right parameter");
		oInput.destroy();
		oNextInput.destroy();
	});

	QUnit.test("Suggestion on Desktop should allow focus to be set into the suggestion item", function(assert){
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
		sap.ui.getCore().applyChanges();

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().val("abc").trigger("input");

		this.clock.tick(300);

		oPopup = oInput._oSuggPopover._oPopover;
		assert.ok(oPopup instanceof sap.m.Popover, "Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		// set focus into the suggestion popup
		var oLink = sap.ui.getCore().byId("link-sInput-0");
		oLink.focus();
		this.clock.tick(100);

		assert.equal(document.activeElement, oLink.getFocusDomRef(), "The focus should stay on the link");

		oInput.destroy();
	});

	QUnit.test("Two Value Suggestion on Desktop", function(assert){
		var $Input = oInput7.$(),
			oPopup1,
			aItems,
			aNames = ["abcTom", "abcPhilips", "abcAnna"],
			aDescription = ["Heidelberg", "Mannheim", "Paris"],
			aItemAdded = [],
			i;

		oInput7.attachSuggest(function(){
			for (i = 0 ; i < aNames.length ; i++){
				if (jQuery.inArray(aNames[i], aItemAdded) === -1){
					oInput7.addSuggestionItem(new ListItem({text: aNames[i], additionalText: aDescription[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});

		oInput7.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput7._$input.focus().val("abc").trigger("input");

		this.clock.tick(300);
		oPopup1 = oInput7._oSuggPopover._oPopover;
		aItems = oPopup1.getContent()[0].getItems();

		assert.ok(oPopup1 instanceof sap.m.Popover, "Two Value Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup1.isOpen(), "Two Value Suggestion Popup is open now");
		assert.equal(aItems.length, aNames.length, "Suggestions are inserted");
		assert.ok(aItems[0] instanceof sap.m.DisplayListItem, "Suggestion item is a DisplayListItem");

		oInput7._$input.focus().val("abcT").trigger("input");
		this.clock.tick(400);

		aItems = oPopup1.getContent()[0].getItems();
		assert.ok(oPopup1.isOpen(), "Two Value Suggestion Popup is still open now");
		assert.equal(aItems.length, 1, "Suggestions are filtered");

		//trigger selection
		var oList = oPopup1.getContent()[0];
		var oListItem = oList.getItems()[0];
		oList.fireItemPress({
			listItem : oListItem
		});

		assert.ok(!oPopup1.isOpen(), "Two Value Suggestion Popup is closed");
		assert.equal(oInput7.getValue(), aNames[0], "Input value is set to first value of selected suggestion item");

		//close the popoup when nothing is typed in input
		oInput7._$input.focus().val("").trigger("input");
		this.clock.tick(300);

		aItems = oPopup1.getContent()[0].getItems();
		assert.ok(!oPopup1.isOpen(), "Two Value Suggestion Popup is closed");
		assert.equal(aItems.length, 0, "Suggestions are destroyed");

		oInput7.destroy();
	});

	QUnit.test("Two Value Suggestions with disabled items on Desktop", function(assert){
		var $Input,
			oPopup,
			aNames = ["abcTom", "abcPhilips", "abcAnna", "abcJames"],
			aDescription = ["Heidelberg", "Mannheim", "Paris", "London"],
			aEnabled = [true, false, true, false],
			aItemAdded = [],
			i;

		oInput = new Input("input", {
			showSuggestion: true
		});
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		$Input = oInput.$();
		oInput.attachSuggest(function(){
			for (i = 0 ; i < aNames.length ; i++){
				if (jQuery.inArray(aNames[i], aItemAdded) === -1){
					oInput.addSuggestionItem(new ListItem({text: aNames[i], additionalText: aDescription[i], enabled: aEnabled[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().val("abc").trigger("input");

		this.clock.tick(300);
		oPopup = oInput._oSuggPopover._oPopover;

		assert.ok(oPopup instanceof sap.m.Popover, "Two Value Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Two Value Suggestion Popup is open now");
		assert.equal(getPopupItemsContent(oPopup).getItems().length, aNames.length, "Suggestions are inserted");
		assert.ok(getPopupItemsContent(oPopup).getItems()[0] instanceof sap.m.DisplayListItem, "Suggestion item is a DisplayListItem");

		this.clock.tick(400);
		assert.ok(oPopup.isOpen(), "Two Value Suggestion Popup is still open now");

		sap.ui.test.qunit.triggerKeydown(oInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		assert.ok(oInput._oSuggPopover._oList.getItems()[0].$().hasClass("sapMLIBSelected"), "The first item is selected after pressing keyDown once");

		sap.ui.test.qunit.triggerKeydown(oInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		assert.ok(oInput._oSuggPopover._oList.getItems()[2].$().hasClass("sapMLIBSelected"), "The third item is selected after pressing keyDown twice");
		assert.ok(!oInput._oSuggPopover._oList.getItems()[1].$().hasClass("sapMLIBSelected"), "The second item is not selected because it is disabled");

		sap.ui.test.qunit.triggerKeydown(oInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		assert.ok(oInput._oSuggPopover._oList.getItems()[2].$().hasClass("sapMLIBSelected"), "The third item is still selected after pressing keyDown three times");
		assert.ok(!oInput._oSuggPopover._oList.getItems()[3].$().hasClass("sapMLIBSelected"), "The fourth item is not selected because it is disabled");

		sap.ui.test.qunit.triggerKeydown(oInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);
		assert.ok(oInput._oSuggPopover._oList.getItems()[0].$().hasClass("sapMLIBSelected"), "The first item is now selected after pressing keyUp once");
		assert.ok(!oInput._oSuggPopover._oList.getItems()[1].$().hasClass("sapMLIBSelected"), "The second item is not selected because it is disabled");

		oInput.destroy();
	});

	// this test ensured downward compatibility: ColumnListItem has default type "Inactive" but still does need to be selected
	QUnit.test("Tabular Suggestions with type=\"Inactive\"", function(assert){
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
			]}),
			oInputId = oInput.getId();

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
		sap.ui.getCore().applyChanges();

		var	$Input = oInput.$(),
			oPopup, // is lazy loaded
			aAlreadyAddedProducts = [],
			i;

		oInput.attachSuggest(function() {
			oInput.destroySuggestionRows();

			assert.strictEqual(oTableItemTemplate.getType(), ListType.Inactive, "The type of the template item is \"Inactive\" (default value)");
			for (i = 0 ; i < oSuggestionData.tabularSuggestionItems.length ; i++){
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
		oInput._$input.focus().val("Prod").trigger("input");

		this.clock.tick(300);
		oPopup = oInput._oSuggPopover._oPopover;

		assert.ok(oPopup instanceof sap.m.Popover, "Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		sap.ui.test.qunit.triggerKeydown(oInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		assert.ok(oInput._oSuggPopover._oList.getItems()[0].$().hasClass("sapMLIBSelected"), "The first item is selected after pressing keyDown once");

		sap.ui.test.qunit.triggerKeydown(oInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		assert.ok(oInput._oSuggPopover._oList.getItems()[1].$().hasClass("sapMLIBSelected"), "The second item is selected after pressing keyDown twice");

		sap.ui.test.qunit.triggerKeydown(oInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		assert.ok(oInput._oSuggPopover._oList.getItems()[2].$().hasClass("sapMLIBSelected"), "The third item is selected after pressing keyDown three times");

		sap.ui.test.qunit.triggerKeydown(oInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);
		assert.ok(oInput._oSuggPopover._oList.getItems()[1].$().hasClass("sapMLIBSelected"), "The second item is selected after pressing keyUp once");

		sap.ui.test.qunit.triggerKeydown(oInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);
		assert.ok(oInput._oSuggPopover._oList.getItems()[0].$().hasClass("sapMLIBSelected"), "The first item is selected after pressing keyUp twice");

		//close the popoup when nothing is typed in input
		oInput._$input.focus().val("").trigger("input");
		this.clock.tick(300);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup is closed");

		oInput.destroy();
	});

	QUnit.test("Suggestion on Phone", function(assert){

		if (Device.browser.internet_explorer && Device.browser.version < 11) {// TODO remove after 1.62 version
			assert.ok(true, "Do not test phone functionality in unsupported versions of Internet Explorer");
			return;
		}

		var oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

		var oInput = new Input({
				type: mobileLibrary.InputType.Tel,
				showSuggestion: true
			}),
			oPopup, // is lazy loaded
			aNames = ["abcTom", "abcPhilips", "abcAnna"],
			aItemAdded = [],
			i;

		oInput.attachSuggest(function(){
			for (i = 0 ; i < aNames.length ; i++){
				if (jQuery.inArray(aNames[i], aItemAdded) === -1){
					oInput.addSuggestionItem(new Item({text: aNames[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().trigger("click");
		this.clock.tick(500);

		oPopup = oInput._oSuggPopover._oPopover;
		assert.ok(oPopup instanceof Dialog, "Suggestion Popup is created and is a Dialog instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		assert.equal(oInput._oSuggPopover._oPopupInput.getType(), mobileLibrary.InputType.Tel, "The type of the Input inside the Suggestion Popup is the same as the type of the original Input"); // BCP 1970125027

		oInput._oSuggPopover._oPopupInput._$input.focus().val("abc").trigger("input");
		this.clock.tick(400);
		assert.equal(getPopupItemsContent(oPopup).getItems().length, aNames.length, "Suggestions are inserted");

		oInput._oSuggPopover._oPopupInput._$input.focus().val("abcT").trigger("input");
		this.clock.tick(400);
		assert.ok(oPopup.isOpen(), "Suggestion Popup is still open now");
		assert.equal(getPopupItemsContent(oPopup).getItems().length, 1, "Suggestions are filtered");

		oInput._oSuggPopover._oPopupInput._$input.focus().val("").trigger("input");
		this.clock.tick(400);
		assert.ok(oPopup.isOpen(), "Suggestion Popup is still open now");
		assert.equal(getPopupItemsContent(oPopup).getItems().length, 0, "Suggestions are destroyed");

		oInput._oSuggPopover._oPopupInput._$input.focus().val("abc").trigger("input");
		this.clock.tick(400);

		sap.ui.test.qunit.triggerTouchEvent("tap", getPopupItemsContent(oPopup).getItems()[1].getDomRef());
		this.clock.tick(500);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup is closed");
		assert.equal(oInput.getValue(), aNames[1], "Value is set to originalInput");

		oInput.destroy();
	});

	QUnit.test("Suggestion on Phone with changing the input value in SuggestionItemSelected event handler", function(assert){
		if (Device.browser.internet_explorer && Device.browser.version < 11) {// TODO remove after 1.62 version
			assert.ok(true, "Do not test phone functionality in unsupported versions of Internet Explorer");
			return;
		}

		var oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

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
			for (i = 0 ; i < aNames.length ; i++){
				if (jQuery.inArray(aNames[i], aItemAdded) === -1){
					oInput.addSuggestionItem(new Item({text: aNames[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().trigger("click");
		this.clock.tick(500);

		oPopup = oInput._oSuggPopover._oPopover;

		assert.equal(oInput._oSuggPopover._oPopupInput.getType(), mobileLibrary.InputType.Tel, "The type of the Input inside the Suggestion Popup is the same as the type of the original Input"); // BCP 1970125027

		oInput._oSuggPopover._oPopupInput._$input.focus().val("abc").trigger("input");
		this.clock.tick(400);
		sap.ui.test.qunit.triggerTouchEvent("tap", getPopupItemsContent(oPopup).getItems()[1].getDomRef());
		this.clock.tick(500);
		assert.equal(oInput.getValue(), "newValue", "Value is last modified by the suggestionItemSelected event listener");

		oInput.destroy();
	});

	QUnit.test("Two value Suggestion on Phone", function(assert){

		if (Device.browser.internet_explorer && Device.browser.version < 11) {// TODO remove after 1.62 version
			assert.ok(true, "Do not test phone functionality in unsupported versions of Internet Explorer");
			return;
		}

		var oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

		var oInput = new Input({
				showSuggestion: true
			}),
			oPopup,
			aNames = ["abcTom", "abcPhilips", "abcAnna"],
			aDescription = ["Heidelberg", "Mannheim", "Paris"],
			aItemAdded = [],
			i;

		oInput.attachSuggest(function(){
			for (i = 0 ; i < aNames.length ; i++){
				if (jQuery.inArray(aNames[i], aItemAdded) === -1){
					oInput.addSuggestionItem(new ListItem({text: aNames[i], additionalText: aDescription[i]}));
					aItemAdded.push(aNames[i]);
				}
			}
		});

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput._$input.focus().trigger("click");
		this.clock.tick(500);
		oPopup = oInput._oSuggPopover._oPopover;

		assert.equal(oInput._oSuggPopover._oPopupInput.getType(), mobileLibrary.InputType.Text, "The type of the Input inside the Suggestion Popup is the same as the type of the original Input - the default one ('Text')"); // BCP 1970125027

		assert.ok(oPopup instanceof Dialog, "Two value Suggestion Popup is created and is a Dialog instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		oInput._oSuggPopover._oPopupInput._$input.focus().val("abc").trigger("input");
		this.clock.tick(400);
		assert.equal(getPopupItemsContent(oPopup).getItems().length, aNames.length, "Suggestions are inserted");

		oInput._oSuggPopover._oPopupInput._$input.focus().val("abcT").trigger("input");
		this.clock.tick(400);
		assert.ok(oPopup.isOpen(), "Two value Suggestion Popup is still open now");
		assert.equal(getPopupItemsContent(oPopup).getItems().length, 1, "Suggestions are filtered");

		oInput._oSuggPopover._oPopupInput._$input.focus().val("").trigger("input");
		this.clock.tick(400);
		assert.ok(oPopup.isOpen(), "Two value Suggestion Popup is still open now");
		assert.equal(getPopupItemsContent(oPopup).getItems().length, 0, "Suggestions are destroyed");

		oInput._oSuggPopover._oPopupInput._$input.focus().val("abc").trigger("input");
		this.clock.tick(400);

		sap.ui.test.qunit.triggerTouchEvent("tap", getPopupItemsContent(oPopup).getItems()[1].getDomRef());
		this.clock.tick(500);
		assert.ok(!oPopup.isOpen(), "Two value Suggestion Popup is closed");
		assert.equal(oInput.getValue(), aNames[1], "Value is set to originalInput");

		oInput.destroy();
	});

	QUnit.test("Suggestion with liveChange handler on phone", function(assert){

		if (Device.browser.internet_explorer && Device.browser.version < 11) {// TODO remove after 1.62 version
			assert.ok(true, "Do not test phone functionality in unsupported versions of Internet Explorer");
			return;
		}

		var fnLC1 = this.spy();

		var oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

		var oInput = new Input({
			showSuggestion: true,
			liveChange: fnLC1
		});

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().trigger("click");
		this.clock.tick(500);

		oInput._oSuggPopover._oPopupInput._$input.focus().val("abc").trigger("input");

		assert.equal(fnLC1.callCount, 1, "liveChange handler on original input is called");

		oInput.destroy();
	});

	QUnit.test("SuggestionPopup shouldn't invalidate when insert suggest item on phone", function(assert){

		if (Device.browser.internet_explorer && Device.browser.version < 11) {// TODO remove after 1.62 version
			assert.ok(true, "Do not test phone functionality in unsupported versions of Internet Explorer");
			return;
		}

		var oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

		var oInput = new Input({
			showSuggestion: true,
			suggest: function(oEvent) {
				var sValue = oEvent.getParameter("suggestValue");
				if (sValue) {
					this.addSuggestionItem(new Item({
						text: sValue
					}));
				}
			}
		});

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().trigger("click");
		this.clock.tick(500);
		var oSpy = this.spy(oInput._oSuggPopover._oPopover, "invalidate");
		oInput._oSuggPopover._oPopupInput._$input.focus().val("abc").trigger("input");
		this.clock.tick(400);

		assert.equal(oInput.getSuggestionItems().length, 1, "Suggestion Item is inserted");

		assert.equal(oSpy.callCount, 0, "invalidate isn't called on dialog instance");

		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions on Desktop", function(assert){
		var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

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
			]}),
			oInputId = oInput.getId();

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
		sap.ui.getCore().applyChanges();

		// this tests calling the setter of showSuggestion after input is rendered
		oInput.setShowSuggestion(true);
		sap.ui.getCore().applyChanges();

		var	$Input = oInput.$(),
			oPopup, // is lazy loaded
			aAlreadyAddedProducts = [],
			i;

		oInput.attachSuggest(function() {
			oInput.destroySuggestionRows();
			for (i = 0 ; i < oSuggestionData.tabularSuggestionItems.length ; i++){
				if (jQuery.inArray(oSuggestionData.tabularSuggestionItems[i], aAlreadyAddedProducts) === -1){
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
		oInput._$input.focus().val("Prod").trigger("input");

		this.clock.tick(300);
		oPopup = oInput._oSuggPopover._oPopover;

		assert.ok(oPopup instanceof sap.m.Popover, "Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		assert.ok(!oInput._oSuggPopover._oList.hasStyleClass("sapMInputSuggestionTableHidden"), "Tabular suggestions table initially has not the hidden style class");

		assert.equal(getPopupItemsContent(oPopup).getItems().length, oSuggestionData.tabularSuggestionItems.length, "Suggestions are inserted");
		assert.strictEqual(getPopupItemsContent(oPopup).$().length, 1, "Suggestion table is rendered");
		assert.ok(getPopupItemsContent(oPopup) instanceof sap.m.Table, "Suggestions are tabular)");
		assert.strictEqual(oPopup.getContentWidth(), "100px", "Suggestion popup has 100px width");

		oInput._$input.focus().val("Product1").trigger("input");
		this.clock.tick(400);

		assert.ok(!oInput._oSuggPopover._oList.hasStyleClass("sapMInputSuggestionTableHidden"), "Tabular suggestions table does not have the hidden style class on desktop");

		assert.ok(oPopup.isOpen(), "Suggestion Popup is still open now");

		// FIXME: check doesn't work in headless PhantomJS test cycle => commented out!
		if (!Device.browser.phantomJS) {
			assert.equal(getPopupItemsContent(oPopup).$().find("tbody").children(":visible").length, 1, "Suggestions are filtered");
		}

		// checks for the show more button (tabular suggestions only)
		assert.strictEqual(oPopup.getFooter().getContent().length, 2, "The footer has two items (spacer and button)");
		assert.strictEqual(oPopup.getFooter().getContent()[1] instanceof Button, true, "The show more button is added to the popup");
		assert.strictEqual(oPopup.getFooter().getContent()[1].getText(), oMessageBundle.getText("INPUT_SUGGESTIONS_SHOW_ALL"), "The show more button shows the correct text from the message bundle");

		//close the popoup when nothing is typed in input
		oInput._$input.focus().val("").trigger("input");
		this.clock.tick(300);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup is closed");

		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions invalidation handling", function(assert){
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
			oInputId = oInput.getId(),
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
		sap.ui.getCore().applyChanges();

		// this tests calling the setter of showSuggestion after input is rendered
		oInput.setShowSuggestion(true);
		sap.ui.getCore().applyChanges();

		var	$Input = oInput.$(),
			oPopup, // is lazy loaded
			aAlreadyAddedProducts = [],
			i;

		oInput.attachSuggest(function() {
			oInput.destroySuggestionRows();
			for (i = 0 ; i < oSuggestionData.tabularSuggestionItems.length ; i++){
				if (jQuery.inArray(oSuggestionData.tabularSuggestionItems[i], aAlreadyAddedProducts) === -1){
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
		oInput._$input.focus().val("Prod").trigger("input");

		this.clock.tick(300);
		oPopup = oInput._oSuggPopover._oPopover;

		// set up a spy on the dialog's renderer (the dialog should not be rerendered)
		oInputRendererSpy = sinon.spy(InputRenderer, "render");

		assert.ok(oPopup instanceof sap.m.Popover, "Suggestion Popup is created and is a Popover instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");
		assert.equal(getPopupItemsContent(oPopup).getItems().length, oSuggestionData.tabularSuggestionItems.length, "Suggestions are inserted");
		assert.strictEqual(getPopupItemsContent(oPopup).$().length, 1, "Suggestion table is rendered");
		assert.ok(getPopupItemsContent(oPopup) instanceof sap.m.Table, "Suggestions are tabular)");

		oInput._$input.focus().val("Product1").trigger("input");
		this.clock.tick(400);

		// check for re-rendering when changing the "suggestionRows" aggregation
		assert.strictEqual(oInputRendererSpy.callCount, 0, "the input field is not re-rendered when suggestions are inserted or removed");

		// check for re-rendering when changing "showTableSuggestionValueHelp" property
		oInput.setShowTableSuggestionValueHelp(false);
		assert.strictEqual(oInputRendererSpy.callCount, 0, "the input field is not re-rendered when property \"showTableSuggestionValueHelp\" is changed");
		oInput.setShowTableSuggestionValueHelp(true);
		assert.strictEqual(oInputRendererSpy.callCount, 0, "the input field is not re-rendered when property \"showTableSuggestionValueHelp\" is changed");


		assert.ok(oPopup.isOpen(), "Suggestion Popup is still open now");
		// FIXME: check doesn't work in headless PhantomJS test cycle => commented out!
		if (!Device.browser.phantomJS) {
			assert.equal(getPopupItemsContent(oPopup).$().find("tbody").children(":visible").length, 1, "Suggestions are filtered");
		}

		//close the popoup when nothing is typed in input
		oInput._$input.focus().val("").trigger("input");
		this.clock.tick(300);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup is closed");
		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions Show More Button", function(assert) {
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
		sap.ui.getCore().applyChanges();

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().val("Prod").trigger("input");

		this.clock.tick(300);

		assert.ok(!oInput._oSuggPopover._oPopover.getFooter(), "Suggestion Popup doesn't have Toolbar footer");

		oInput.destroy();
	});

	QUnit.test("Tabular Suggestion on Phone", function(assert){

		if (Device.browser.internet_explorer && Device.browser.version < 11) {// TODO remove after 1.62 version
			assert.ok(true, "Do not test phone functionality in unsupported versions of Internet Explorer");
			return;
		}
		var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		var bPhantomJS = Device.browser.phantomJS;

		var oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

		//test was failing inside ie9, because popup does special handling for this case// TODO remove after 1.62 version
		this.stub(Device, "browser", {
			internet_explorer : false// TODO remove after 1.62 version
		});

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
			]}),
			oInputId = oInput.getId();

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
		sap.ui.getCore().applyChanges();

		var	$Input = oInput.$(),
			oPopup, // is lazy loaded
			aAlreadyAddedProducts = [],
			oDialogRendererSpy,
			i;

		oInput.attachSuggest(function() {
			oInput.destroySuggestionRows();
			for (i = 0 ; i < oSuggestionData.tabularSuggestionItems.length ; i++){
				if (jQuery.inArray(oSuggestionData.tabularSuggestionItems[i], aAlreadyAddedProducts) === -1){
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

		// set up a spy on the dialog's renderer
		oDialogRendererSpy = sinon.spy(DialogRenderer, "render");

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().trigger("click");
		this.clock.tick(300);

		oPopup = oInput._oSuggPopover._oPopover;
		assert.ok(oPopup instanceof Dialog, "Suggestion Popup is created and is a Dialog instance");
		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");

		oInput._oSuggPopover._oPopupInput._$input.focus().val("Product").trigger("input");
		this.clock.tick(400);
		assert.equal(getPopupItemsContent(oPopup).getItems().length, oSuggestionData.tabularSuggestionItems.length, "Suggestions are inserted");
		assert.strictEqual(oDialogRendererSpy.callCount, 1, "Dialog has been renderded after opening");
		assert.ok(!oInput._oSuggPopover._oList.hasStyleClass("sapMInputSuggestionTableHidden"), "Tabular suggestions table does not have the hidden style class when items are displayed");

		// remove input in between (to check if dialog is not re-rendered, this would cause the soft-keyboard to hide)
		oInput._oSuggPopover._oPopupInput._$input.focus().val("").trigger("input");
		this.clock.tick(400);
		assert.strictEqual(oDialogRendererSpy.callCount, 1, "Dialog is not re-rendered when changing the input value to empty string");
		assert.ok(oInput._oSuggPopover._oList.hasStyleClass("sapMInputSuggestionTableHidden"), "Tabular suggestions table has the hidden style class when no items are displayed");

		oInput._oSuggPopover._oPopupInput._$input.focus().val("Product1").trigger("input");
		this.clock.tick(400);

		assert.ok(oPopup.isOpen(), "Suggestion Popup is still open now123");
		// FIXME: check doesn't work in headless PhantomJS test cycle => commented out!
		if (!bPhantomJS) {
			assert.equal(getPopupItemsContent(oPopup).$().find("tbody").children(":visible").length, 1, "Suggestions are filtered");
		}
		assert.strictEqual(oDialogRendererSpy.callCount, 1, "Dialog is not re-rendered when changing the input value to a another value");
		assert.ok(!oInput._oSuggPopover._oList.hasStyleClass("sapMInputSuggestionTableHidden"), "Tabular suggestions table does not have the hidden style class when items are displayed");

		// enter a string that is not found in suggestions
		oInput._oSuggPopover._oPopupInput._$input.focus().val("thisWillNotBeFound").trigger("input");
		this.clock.tick(400);

		assert.ok(oPopup.isOpen(), "Suggestion Popup is still open now");
		assert.ok(getPopupItemsContent(oPopup).getItems().length, "There are invisible suggestion items");
		getPopupItemsContent(oPopup).getItems().forEach(function (oItem) {
			assert.strictEqual(oItem.getVisible(), false, "Item " + oItem.getId() + " is not visible");
		});
		assert.strictEqual(oDialogRendererSpy.callCount, 1, "Dialog is not re-rendered when changing the input value to a another value");
		assert.ok(oInput._oSuggPopover._oList.hasStyleClass("sapMInputSuggestionTableHidden"), "Tabular suggestions table has the hidden style class when no items are found");

		// filter with a string that will display 3 items
		oInput._oSuggPopover._oPopupInput._$input.focus().val("Product").trigger("input");
		this.clock.tick(400);

		// FIXME: check doesn't work in headless PhantomJS test cycle => commented out!
		if (!bPhantomJS) {
			assert.equal(getPopupItemsContent(oPopup).$().find("tbody").children().length, 3, "3 suggestions are displayed");
		}
		assert.strictEqual(oDialogRendererSpy.callCount, 1, "Dialog is not re-rendered during filtering of suggestions");
		assert.ok(!oInput._oSuggPopover._oList.hasStyleClass("sapMInputSuggestionTableHidden"), "Tabular suggestions table does not have the hidden style class when items are displayed");

		// checks for the show more button (tabular suggestions only)
		assert.strictEqual(oPopup.getEndButton() instanceof Button, true, "The show more button is added to the popup");
		assert.strictEqual(oPopup.getEndButton().getText(), oMessageBundle.getText("INPUT_SUGGESTIONS_SHOW_ALL"), "The show more button shows the correct text from the message bundle");

		getPopupItemsContent(oPopup).getItems()[1].$().trigger("tap");

		this.clock.tick(300);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup is closed");
		assert.equal(oInput.getValue(), oSuggestionData.tabularSuggestionItems[1].name, "Value is set to originalInput");

		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions with custom filter and result fuction", function(assert){
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
			]}),
			oInputId = oInput.getId();

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
		sap.ui.getCore().applyChanges();

		// custom filter for limit field
		oInput.setFilterFunction(function(sValue, oColumnListItem) {
			var aCells = oColumnListItem.getCells();

			return jQuery.sap.startsWithIgnoreCase(aCells[2].getText(), sValue);
		});

		// custom result function using a string and price
		oInput.setRowResultFunction(function (oColumnListItem) {
			return "You chose: " + oColumnListItem.getCells()[2].getText();
		});

		var	$Input = oInput.$(),
			oPopup, // is lazy loaded
			aAlreadyAddedProducts = [],
			i;

		oInput.attachSuggest(function() {
			oInput.destroySuggestionRows();
			for (i = 0 ; i < oSuggestionData.tabularSuggestionItems.length ; i++){
				if (jQuery.inArray(oSuggestionData.tabularSuggestionItems[i], aAlreadyAddedProducts) === -1){
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
		oInput._$input.focus().val("25").trigger("input");

		this.clock.tick(300);
		oPopup = oInput._oSuggPopover._oPopover;

		assert.ok(oPopup.isOpen(), "Suggestion Popup is open now");
		// FIXME: check doesn't work in headless PhantomJS test cycle => commented out!
		if (!Device.browser.phantomJS) {
			assert.strictEqual(getPopupItemsContent(oPopup).$().find("tbody").children(":visible").length, 1, "Suggestions are filtered");
		}
		assert.strictEqual(getPopupItemsContent(oPopup).$().find("tbody").find("tr>td>span" || "tr>td>label")[0].textContent, oSuggestionData.tabularSuggestionItems[1].name, "Product 2 is filtered");

		getPopupItemsContent(oPopup).getItems()[1].ontap(new jQuery.Event());
		this.clock.tick(300);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup is closed");
		assert.equal(oInput.getValue(), "You chose: " + oSuggestionData.tabularSuggestionItems[1].limit, "The input value has been formatted with the custom row result function");

		//close the popoup when nothing is typed in input
		oInput._$input.focus().val("").trigger("input");
		this.clock.tick(300);
		assert.ok(!oPopup.isOpen(), "Suggestion Popup is closed");

		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions - selecting an already selected item", function (assert) {

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
		sap.ui.getCore().applyChanges();

		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.G });
		oInput._oSuggPopover._oPopover.open();

		// act
		oInput._$input.focus().trigger(oFakeKeydown).val("p").trigger("input");
		this.clock.tick(300);

		// check selected (highlighted in blue) row in the suggestion table
		var oSelectedRow1 = oInput._oSuggPopover._oList.getItems()[0];
		assert.ok(oSelectedRow1.getSelected(), true, "First item is selected");
		assert.equal(oSelectedRow1.getCells()[0].getText().toLowerCase(), oInput.getValue().toLowerCase(), "The value of the input is the same as the value of the selected row");

		// act
		oInput._$input.focus().trigger(oFakeKeydown).val("ph").trigger("input");
		this.clock.tick(300);

		// check selected (highlighted in blue) row in the suggestion table
		var oSelectedRow2 = oInput._oSuggPopover._oList.getItems()[2];
		assert.ok(oSelectedRow2.getSelected(), true, "First item is selected");
		assert.equal(oSelectedRow2.getCells()[0].getText().toLowerCase(), oInput.getValue().toLowerCase(), "The value of the input is the same as the value of the selected row");

		// act
		oSelectedRow2.ontap(new jQuery.Event());
		this.clock.tick(300);

		// assert
		assert.notOk(oInput._oSuggPopover._oPopover.isOpen(), "Suggestion Popup should NOT be opened");
		assert.equal(oSelectedRow2.getId(), oInput.getSelectedRow(), "SuggestionRow should be correctly set");

		// clean up
		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions - remove suggestions", function (assert) {
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
		sap.ui.getCore().applyChanges();

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

	QUnit.test("Property startSuggestion on Desktop (non Zero)",  function(assert) {
		var oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

		var spy = this.spy();

		var oInput = new Input({
			showSuggestion: true,
			startSuggestion: 4,
			suggest: spy
		});

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput._$input.focus().val("25").trigger("input");
		this.clock.tick(400);
		assert.equal(spy.callCount, 0, "2 letters shouldn't fire suggest event");

		oInput._$input.focus().val("2524").trigger("input");
		this.clock.tick(400);
		assert.equal(spy.callCount, 1, "4 letters shouldn fire suggest event");

		oInput._$input.focus().val("25245").trigger("input");
		this.clock.tick(400);
		assert.equal(spy.callCount, 2, "5 letters should fire suggest event again");

		oInput.destroy();
	});

	QUnit.test("Property startSuggestion on Desktop (Zero)",  function(assert) {
		var oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

		var spy = this.spy();

		var oInput = new Input({
			showSuggestion: true,
			startSuggestion: 0,
			suggest: spy
		});

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput._$input.focus();
		this.clock.tick(400);
		assert.equal(spy.callCount, 1, "Focus should fire suggest event");

		oInput._$input.focus().val("25").trigger("input");
		this.clock.tick(400);
		assert.equal(spy.callCount, 2, "2 letters shouldn fire suggest event");

		oInput._$input.blur();
		oInput._$input.focus();
		this.clock.tick(400);
		assert.equal(spy.callCount, 2, "Focus with text in input shouldn't fire suggest event");

		oInput._$input.focus().val("").trigger("input");
		this.clock.tick(400);
		assert.equal(spy.callCount, 3, "no text should fire suggest event again");

		oInput.destroy();
	});

	QUnit.test("The order of setting properties: showValueHelp, bindAggregation and showSuggestion", function(assert){
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
			]}),
			oInputId = oInput.getId();

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
		sap.ui.getCore().applyChanges();

		oInput.setShowSuggestion(true);

		assert.ok(oInput._oSuggPopover._oList, "List instance is created");
		assert.ok(oInput._oSuggPopover._oPopover, "Suggestion Popup instance is created");
		assert.ok(oInput._oSuggPopover._oPopover.getFooter() instanceof sap.m.Toolbar, "Suggestion Popup has Toolbar footer");
		assert.ok(oInput._oSuggPopover._oPopover.getFooter().getContent()[1] instanceof Button, "Suggestion Popup has showMoreButton");

		oInput.destroy();
	});

	QUnit.test("The order of setting properties: showValueHelp, showSuggestion after bindAggregation", function(assert){
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
			]}),
			oInputId = oInput.getId();

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
		sap.ui.getCore().applyChanges();

		oInput.setShowSuggestion(true);

		assert.ok(oInput._oSuggPopover._oList, "List instance is created");
		assert.ok(oInput._oSuggPopover._oPopover, "Suggestion Popup instance is created");
		assert.ok(oInput._oSuggPopover._oPopover.getFooter() instanceof sap.m.Toolbar, "Suggestion Popup has Toolbar footer");
		assert.ok(oInput._oSuggPopover._oPopover.getFooter().getContent()[1] instanceof Button, "Suggestion Popup has showMoreButton");

		oInput.destroy();
	});

	QUnit.test("Highlighting", function(assert) {
		var oInput = createInputWithSuggestions();

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().val("It").trigger("input");

		this.clock.tick(300);

		var $labels = oInput._oSuggPopover._oPopover.$().find('.sapMDLILabel, .sapMSLITitleOnly, .sapMDLIValue');

		assert.ok($labels[0].innerHTML.indexOf('<span') > -1, "Texts is highlighted");

		oInput.destroy();
	});

	QUnit.test("Create Suggestions Popover after suggestion items are added", function(assert) {
		// arrange
		var oInput = new Input({
			suggestionItems: [new Item({text: "test"})]
		});

		// act
		oInput.setShowSuggestion(true); // set show suggestion after items are added

		// assert
		assert.ok(oInput._getSuggestionsPopover()._oList, "List should be created when enabling suggestions");

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
		oDialog = null;
	});

	QUnit.test("Set showSuggestions", function (assert) {

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
		sap.ui.getCore().applyChanges();

		oInput.onfocusin();
		oInput._$input.focus().val("te").trigger("input");

		this.clock.tick(400);

		// Assert
		assert.ok(fnTriggerSuggestSpy.called, "Should have triggered suggest.");
		assert.ok(oInput._oSuggPopover._oPopover, "Should have suggestions popover.");
		assert.ok(oInput._oSuggPopover._oPopover.isOpen(), "Should have opened suggestions popover.");
		assert.ok(oInput._oSuggPopover._oList, "Should have created a list with suggestions.");

		// Act
		oInput._$input.val("");
		oInput.onfocusout();
		oInput.setShowSuggestion(false);
		fnTriggerSuggestSpy.reset();
		oInput.onfocusin();
		oInput._$input.focus().val("te").trigger("input");

		this.clock.tick(300);

		// Assert
		assert.notOk(fnTriggerSuggestSpy.called, "Should have NOT triggered suggest.");
		assert.notOk(oInput._oSuggPopover._oPopover, "Should NOT have suggestions popover.");
		assert.notOk(oInput._oSuggPopover._oList, "Should have NOT created a list with suggestions.");

		// Act
		oInput._$input.val("");
		oInput.onfocusout();
		oInput.setShowSuggestion(true);
		fnTriggerSuggestSpy.reset();
		oInput.onfocusin();
		oInput._$input.focus().val("te").trigger("input");

		this.clock.tick(300);

		// Assert
		assert.ok(fnTriggerSuggestSpy.called, "Should have triggered suggest.");
		assert.ok(oInput._oSuggPopover._oPopover, "Should have suggestions popover.");
		assert.ok(oInput._oSuggPopover._oPopover.isOpen(), "Should have opened suggestions popover.");
		assert.ok(oInput._oSuggPopover._oList, "Should have created a list with suggestions.");

		// Cleanup
		fnTriggerSuggestSpy.restore();
		oInput.destroy();
	});

	QUnit.test("Toggling true / false for showSuggestions should not throw an error", function (assert) {
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
		sap.ui.getCore().applyChanges();

		// Trigger false
		oInput.setShowSuggestion(!oInput.getShowSuggestion());
		sap.ui.getCore().applyChanges();

		assert.notOk(this._oButtonToolbar, "Toolbar ref should be cleaned up");
		assert.notOk(this._oShowMoreButton, "Button ref should be cleaned up");

		// Trigger true
		oInput.setShowSuggestion(!oInput.getShowSuggestion());
		sap.ui.getCore().applyChanges();

		assert.ok(true, "No exception should be thrown");
	});

	QUnit.module("Key and Value");

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

	QUnit.test("Set selection", function(assert) {
		var oInput = createInputWithSuggestions(),
				fnCallback = this.spy();

		oInput.attachSuggestionItemSelected(fnCallback);

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().val("It").trigger("input");

		this.clock.tick(300);

		var oItem = oInput._oSuggPopover._oPopover.getContent()[0].getItems()[0];
		assert.ok(oItem, "Item should be created");

		oItem.focus();
		oItem.$().trigger("tap");

		this.clock.tick(50);

		assert.equal(fnCallback.callCount, 1, "change event handler only called once");
		assert.equal(oInput.getSelectedKey(), "1", "selected key is correct");

		oInput.destroy();
	});

	QUnit.test("Selected item from value help is set to the input", function(assert) {

		var oInput = createInputWithSuggestions();
		oInput.setShowValueHelp(true);
		oInput.setType("Text");
		oInput.setTextFormatMode("KeyValue");

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput._bUseDialog = true;
		oInput.setSelectedKey("2");
		assert.equal(oInput.getDOMValue(), "(2) Item 2", "Selected input value is " + oInput.getDOMValue());

		oInput._bUseDialog = false;
		oInput.setSelectedKey("3");
		assert.equal(oInput.getDOMValue(), "(3) Item 3", "Selected input value is " + oInput.getDOMValue());

		oInput.destroy();
	});

	QUnit.test("Update selected key after bind data is changed", function(assert) {
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
		sap.ui.getCore().applyChanges();

		assert.equal(oInput.getValue(), "", "Initially when the input has selected key but no suggestion items it's value has to be empty");

		oInput.setModel(oModelData);
		assert.equal(oInput.getValue(), "a1", "After a json model is set and one of the items has key that item has to be selected");


		oInput.setSelectedKey("a3");
		assert.equal(oInput.getValue(), "", "After setting new selected key which is not in the list items the value should be empyt");

		oInput.setValue("New value");

		oInput.setSelectedKey("");
		assert.equal(oInput.getValue(), "", "After the selected key to empty string, the value should be cleared");

		oInput.setSelectedKey("a3");

		oInput.setValue('');
		oInput.addSuggestionItem(new Item({text: "a3", key: "a3"}));

		assert.equal(oInput.getValue(), "a3", "The value must be set to the selected key");

		oInput.removeAllSuggestionItems();
		assert.equal(oInput.getValue(), "", "The value must be cleared after removing all items");

		oInput.addSuggestionItem(new Item({text: "a3", key: "a3"}));
		assert.equal(oInput.getValue(), "a3", "The value must be set to the selected key");

		oInput.destroySuggestionItems();
		assert.equal(oInput.getValue(), "", "The value must be cleared after destroying all items");

		var oItem = new Item({text: "a3", key: "a3"});
		oInput.addSuggestionItem(oItem);
		assert.equal(oInput.getValue(), "a3", "The value must be set to the selected key");

		oInput.removeSuggestionItem(oItem);
		assert.equal(oInput.getValue(), "", "The value must be cleared after removing item");

		oItem.destroy();
		oInput.destroy();

	});

	QUnit.test("Set selection via API", function(assert) {
		var oInput = createInputWithSuggestions(),
				fnCallback = this.spy();

		oInput.attachSuggestionItemSelected(fnCallback);

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput.setSelectedItem(oInput.getSuggestionItems()[1]);

		this.clock.tick(50);

		assert.equal(fnCallback.callCount, 0, "change event is not fired");
		assert.equal(oInput.getSelectedKey(), "2", "selected key is correct");

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
		oInput = null;
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
		oInput = null;
	});

	QUnit.test("Set selection before suggestionItems", function(assert) {

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
		sap.ui.getCore().applyChanges();

		this.clock.tick(50);

		assert.equal(oInput.getSelectedKey(), "5", "selected key is correct");

		assert.equal(oInput.getValue(), "Item 5", "selected key is correct in dom");

		oInput.destroy();
	});

	QUnit.test("Display text formatting", function(assert) {
		var oInput = createInputWithSuggestions();

		oInput.setTextFormatMode(InputTextFormatMode.ValueKey);

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput.setSelectedItem(oInput.getSuggestionItems()[1]);

		var sValue = oInput.getValue();
		assert.equal(sValue, "Item 2 (2)", "value is correctly formatted");

		oInput.setTextFormatter(function (item) {
			return 'Custom: ' + item.getText() + " (" + item.getKey() + ")";
		});

		oInput.setSelectedItem(oInput.getSuggestionItems()[2]);

		var sValue = oInput.getValue();
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

		return oInput;
	}

	QUnit.test("Tabular Suggestions - Set selection via API", function(assert) {
		var oInput = createInputWithTabularSuggestions(),
				fnCallback = this.spy();

		oInput.attachSuggestionItemSelected(fnCallback);

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput.setSelectedRow(oInput.getSuggestionRows()[1]);

		this.clock.tick(50);

		assert.equal(fnCallback.callCount, 0, "change event is not fired");
		assert.equal(oInput.getSelectedKey(), "2", "selected key is correct");
		assert.equal(oInput.getValue(), "Besser ist das = 20.00 EUR", "value is correct");

		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions - Set selection via keyboard", function(assert) {
		var oInput = createInputWithTabularSuggestions(),
				fnChangeCallback = this.spy(),
				fnSuggestionItemSelectedCallback = this.spy();

		oInput.attachChange(fnChangeCallback);
		oInput.attachSuggestionItemSelected(fnSuggestionItemSelectedCallback);

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput._$input.focus().val("Au").trigger("input");
		this.clock.tick(300);

		sap.ui.test.qunit.triggerKeydown(document.activeElement, "40"); // bottom (arrow)
		sap.ui.test.qunit.triggerKeydown(document.activeElement, "ENTER");

		assert.equal(fnChangeCallback.callCount, 1, "change event is fired once");
		assert.equal(fnSuggestionItemSelectedCallback.callCount, 1, "suggestionItemSelected event is fired once");
		assert.equal(fnChangeCallback.calledAfter(fnSuggestionItemSelectedCallback), true, "change event is called after suggestionItemSelected event");

		oInput.destroy();
	});

	QUnit.test("Tabular Suggestions - Set selection on focus out", function(assert) {
		var oInput = createInputWithTabularSuggestions(),
				fnChangeCallback = this.spy(),
				fnSuggestionItemSelectedCallback = this.spy();

		oInput.attachChange(fnChangeCallback);
		oInput.attachSuggestionItemSelected(fnSuggestionItemSelectedCallback);

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput._$input.focus().val("Au").trigger("input");
		this.clock.tick(300);

		sap.ui.test.qunit.triggerKeydown(document.activeElement, "40"); // bottom (arrow)

		// simulate focus out
		oInput._oSuggPopover._oPopover.close();

		assert.equal(fnChangeCallback.callCount, 1, "change event is fired once");
		assert.equal(fnSuggestionItemSelectedCallback.callCount, 1, "suggestionItemSelected event is fired once");
		assert.equal(fnChangeCallback.calledAfter(fnSuggestionItemSelectedCallback), true, "change event is called after suggestionItemSelected event");

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

	QUnit.test("Tabular Suggestions - Display text formatting", function(assert) {
		var oInput = createInputWithTabularSuggestions();

		oInput.setTextFormatMode(InputTextFormatMode.ValueKey);

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput.setSelectedRow(oInput.getSuggestionRows()[1]);

		var sValue = oInput.getValue();
		assert.equal(sValue, "Besser ist das = 20.00 EUR (2)", "value is correctly formatted");

		oInput.destroy();
	});

	QUnit.module("Input Description");

	QUnit.test("Input description", function(assert) {
		var oInputWithDes = new Input({
			value: "220"
		});
		oInputWithDes.setDescription("EUR");
		oInputWithDes.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.equal(oInputWithDes.$().find(".sapMInputDescriptionText").text(), "EUR", "Input description is EUR");

		oInputWithDes.setFieldWidth("100px");
		sap.ui.getCore().applyChanges();

		assert.equal(oInputWithDes.$('descr').text(), "EUR", "Description ID is set to the correct span");
		assert.equal(oInputWithDes.getDomRef('descr').id, oInputWithDes.$('inner').attr('aria-labelledby'), "Inner input aria-labbeledby attribute is correct");

		oInputWithDes.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oInput = new Input({value: "Value", tooltip: "Tooltip", placeholder: "Placeholder"});
		assert.ok(!!oInput.getAccessibilityInfo, "Input has a getAccessibilityInfo function");
		var oInfo = oInput.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, oInput.getRenderer().getAriaRole(), "AriaRole");
		assert.strictEqual(oInput.getRenderer().getAriaRole(), "", "No custom ARIA role");
		assert.strictEqual(oInfo.type, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_INPUT"), "Type");
		assert.strictEqual(oInfo.description, "Value", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		oInput.setValue("");
		oInput.setEnabled(false);
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "", "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oInput.setEnabled(true);
		oInput.setEditable(false);
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oInput.setDescription("Description");
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "Description", "Description");
		oInput.destroy();
	});

	QUnit.test("Popup", function(assert) {
		var oInput = createInputWithSuggestions();

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		oInput._$input.focus().val("It").trigger("input");

		this.clock.tick(300);

		var $popover = oInput._oSuggPopover._oPopover.$();
		assert.ok($popover.attr('aria-labelledby'), 'popup ariaLabelledBy is set');

		oInput.destroy();

	});

	QUnit.module("Input clone", {
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
		}
	});

	QUnit.test("List Suggestions - cloning", function (assert) {
		var oInputClone  = this.oInputToClone.clone();
		assert.equal(oInputClone.getSuggestionItems().length, 3, "Should have 3 suggestion items");
	});

	QUnit.test("Tabular Suggestions - cloning", function (assert) {
		var oInputClone  = this.oTabularInputToClone.clone();

		assert.equal(oInputClone.getSuggestionRows().length, 10, "Should have 3 suggestion rows");
		assert.equal(oInputClone.getSuggestionColumns().length, 5, "Should have 4 suggestion columns");
	});

	QUnit.test("Tabular Suggestions - fnRowResultFilter cloning", function (assert) {
		var fnCallback = sinon.spy();
		this.oTabularInputToClone.setRowResultFunction(fnCallback);
		var oInputClone  = this.oTabularInputToClone.clone();

		assert.equal(fnCallback, oInputClone._fnRowResultFilter, "_fnRowResultFilter should be cloned");
	});

	QUnit.test("Tabular Suggestions - selectedRow cloning", function (assert) {
		var fnRowResultFilter = function (oColumnListItem) {
			return "The selected item: " + oColumnListItem.getCells()[0].getText();
		};
		this.oTabularInputToClone.setRowResultFunction(fnRowResultFilter);
		this.oTabularInputToClone.setSelectedRow(this.oTabularInputToClone.getSuggestionRows()[0]);

		var oInputClone  = this.oTabularInputToClone.clone();

		assert.equal(oInputClone.getValue(), "The selected item: Auch ein gutes Ding", "The selectedRow association should be cloned");
	});

	QUnit.test("Input suggestions description", function(assert) {
		// setup
		var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			oInput = new Input({
				showSuggestion: true,
				suggestionItems: [
					new sap.ui.core.Item({
						text: "Item 1",
						key: "001"
					}),
					new sap.ui.core.Item({
						text: "Item 2",
						key: "002"
					})
				]
			});

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInput.onfocusin();
		oInput._$input.focus().val("I").trigger("input");
		this.clock.tick(400);

		// assert
		assert.ok(!!oInput.getDomRef("SuggDescr"), "The description is added in the DOM.");
		assert.strictEqual(oInput.getDomRef("SuggDescr").innerText,
			oMessageBundle.getText("INPUT_SUGGESTIONS_MORE_HITS", 2), "The description has correct text.");

		oInput.onfocusout();

		assert.notOk(oInput.$("SuggDescr").text(), "The suggestion description is cleared");

		// clean up
		oInput.destroy();
	});

	QUnit.module("Focus");

	QUnit.test("Value Help Only 'tap' on Phone", function(assert) {
		var bIsPhone = Device.system.phone;
		sap.ui.Device.system.phone = true;
		var dialog = new Dialog({
		});

		var oInputValueHelpOnly = new Input({
			showValueHelp: true,
			valueHelpOnly:  true,
			valueHelpRequest: function (oEvent) {
				dialog.open();
			}
		});

		oInputValueHelpOnly.placeAt("content");
		sap.ui.getCore().applyChanges();

		oInputValueHelpOnly.ontap();
		this.clock.tick(1000);
		sap.ui.getCore().applyChanges();

		dialog.close();
		this.clock.tick(1000);
		sap.ui.getCore().applyChanges();

		assert.equal(document.activeElement.id, oInputValueHelpOnly._$input[0].id, 'active element is the input');

		dialog.destroy();
		oInputValueHelpOnly.destroy();
		sap.ui.Device.system.phone = bIsPhone;
	});

	QUnit.module("ValueHelpDialog");

	QUnit.test("Change event", function(assert) {

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

		sap.ui.getCore().applyChanges();

		var fnChangeCallback = this.spy();
		oInput.attachChange(fnChangeCallback);

		oInput._$input.focus().val("abc").trigger("input");

		var oValueHelpIcon = oInput._getValueHelpIcon();

		oValueHelpIcon.firePress();

		sap.ui.getCore().applyChanges();
		this.clock.tick(2000);

		assert.equal(fnChangeCallback.callCount, 0, "change event is not fired");

		oDialog.close();
		this.clock.tick(500);

		oDialog.open();

		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		assert.equal(fnChangeCallback.callCount, 1, "change event is fired once");

		oDialog.destroy();
		oInput.destroy();
	});

	QUnit.test("showTableSuggestionValueHelp", function (assert) {
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
		sap.ui.getCore().applyChanges();

		var oFakeKeydown = new jQuery.Event("keydown", { which: KeyCodes.P });
		oInput._oSuggPopover._oPopover.open();

		// act
		oInput._$input.focus().trigger(oFakeKeydown).val("p").trigger("input");
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
		assert.strictEqual(this.oInput._oSuggPopover._sPopoverContentWidth, null, "Suggestions popover should be 'null' if the Input didn't set it");
		assert.strictEqual(this.oInput.getEnableSuggestionsHighlighting(), this.oInput._oSuggPopover._bEnableHighlighting, "Input and Popover highlighting should be the same.");
		assert.strictEqual(this.oInput.getAutocomplete(), this.oInput._oSuggPopover._bAutocompleteEnabled, "Input and Popover autocomplete should be the same.");

		// act
		this.oInput.setMaxSuggestionWidth("50rem", bSuppressInvalidate);
		this.oInput.setEnableSuggestionsHighlighting(false, bSuppressInvalidate);
		this.oInput.setAutocomplete(false, bSuppressInvalidate);
		this.oInput._oSuggPopover._oPopover.open();

		// assert
		assert.strictEqual(this.oInput.getMaxSuggestionWidth(), this.oInput._oSuggPopover._sPopoverContentWidth, "Input and Popover widths should be the same.");
		assert.strictEqual(this.oInput.getEnableSuggestionsHighlighting(), this.oInput._oSuggPopover._bEnableHighlighting, "Input and Popover highlighting should be the same.");
		assert.strictEqual(this.oInput.getAutocomplete(), this.oInput._oSuggPopover._bAutocompleteEnabled, "Input and Popover autocomplete should be the same.");
	});

	QUnit.module("Input in a Dialog", {
		beforeEach: function () {
			this.dialog = new Dialog({
				content: [
					new Input({
						showSuggestion: true,
						suggestions: [
							new SuggestionItem()
						]
					})
				]
			});
		},
		afterEach: function () {
			this.dialog.destroy();
			this.dialog = null;
		}
	});

	QUnit.test('Dialog scrollbar', function (assert) {
		var input = this.dialog.getContent()[0];
		this.dialog.open();

		var scrollDiv = this.dialog.$().find(".sapMDialogScroll")[0];
		assert.equal(scrollDiv.offsetWidth, scrollDiv.scrollWidth, "Dialog doesn't have a scrollbar");

		input._$input.focus().val("abc").trigger("input");

		this.dialog.focus();
		this.clock.tick(300);

		assert.equal(scrollDiv.offsetWidth, scrollDiv.scrollWidth, "Dialog doesn't have a scrollbar");
	});

	QUnit.module("Type-ahead");

	QUnit.test("Auto complete should not be allowed when it is set to false", function (assert) {
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

		sap.ui.getCore().applyChanges();

		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.G });

		// act
		oInput._$input.focus().trigger(oFakeKeydown).val("G").trigger("input");
		this.clock.tick(300);

		// assert
		assert.notOk(oInput._oSuggPopover._bDoTypeAhead, "Type ahead should not be allowed when pressing 'G'.");

		// clean up
		oInput.destroy();
		oInput = null;
	});


	QUnit.test("Auto complete should not be allowed when it is set to false", function (assert) {
		// Arrange
		var oInput = new Input({
			showSuggestion: true,
			filterSuggests: false,
			autocomplete: false,
			suggestionItems: [
				new Item({text: "Germany"}),
				new Item({text: "Bulgaria"}),
				new Item({text: "Italy"})
			]
		}).placeAt("content");

		var sTestTypedInValue = "Test";
		var oMockFocus = {
				id: '1',
				cursorPos: 1,
				selectionEnd: 1,
				selectionStart: 1
			};

		var oStubFocusInfo = sinon.stub(oInput, "getFocusInfo", function () {
			return oMockFocus;
		});

		var oStubPopover = sinon.stub(oInput._oSuggPopover._oPopover, "isOpen", function () {
			return true;
		});

		var oStub = this.stub(Device, "browser", {
			internet_explorer: true
		});

		var oApplyFocusInfoSpy = sinon.spy(oInput, "applyFocusInfo");
		var oSetDOMValueSpy = sinon.spy(oInput, "setDOMValue");

		oInput._bUseDialog = false;
		sap.ui.getCore().applyChanges();
		oInput._oSuggPopover._sTypedInValue = sTestTypedInValue;

		// Act
		oInput._hideSuggestionPopup();
		this.clock.tick(300);

		// Assert
		assert.ok(oApplyFocusInfoSpy.calledOnce, "Apply focus should be called once.");
		assert.ok(oSetDOMValueSpy.calledWith(sTestTypedInValue), "Set dom value should be called with correct params.");
		assert.ok(oApplyFocusInfoSpy.calledWith(oMockFocus), "Apply focus should be called with correct params.");

		// cleanup
		oInput.destroy();
		oInput = null;
		oStubFocusInfo.restore();
		oStubPopover.restore();
		oStub.restore();
	});

	QUnit.test("Autocomplete on desktop", function (assert) {
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

		sap.ui.getCore().applyChanges();

		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.G });
		// act
		oInput._$input.focus().trigger(oFakeKeydown).val("G").trigger("input");
		this.clock.tick(300);

		// assert
		assert.ok(oInput._oSuggPopover._bDoTypeAhead, "Type ahead should be allowed when pressing 'G'.");
		assert.strictEqual(oInput.getValue(), "Germany", "Input value should be autocompleted.");
		assert.strictEqual(oInput.getSelectedText(), "ermany", "Suggested value should be selected");
		assert.strictEqual(oInput._oSuggestionPopup.getContent()[0].getItems()[0].getSelected(), true, "Correct item in the Suggestions list is selected.");

		// act
		oInput._$input.focus().trigger(oFakeKeydown).val("Gr").trigger("input");
		this.clock.tick(300);

		// assert
		assert.strictEqual(oInput._oSuggestionPopup.getContent()[0].getItems()[2].getSelected(), true, "Correct item in the Suggestions list is selected.");

		// act
		sap.ui.test.qunit.triggerKeydown(oInput._$input, KeyCodes.ENTER);

		// assert
		assert.strictEqual(oInput.getValue(), "Greece", "Pressing 'enter' should finalize autocompletion.");
		assert.strictEqual(oInput.getSelectedText(), "", "Text shouldn't be selected after pressing 'enter'");

		// act
		oInput._$input.focus().val("gre").trigger("input");
		sap.ui.test.qunit.triggerKeydown(oInput._$input, KeyCodes.BACKSPACE);
		this.clock.tick(300);

		// assert
		assert.notOk(oInput._oSuggPopover._bDoTypeAhead, "Autocomplete shouldn't be allowed when deleting.");
		assert.strictEqual(oInput._oSuggestionPopup.getContent()[0].getSelectedItem(), null, "No items in the Suggestions list are selected when deleting.");

		// clean up
		oInput.destroy();
		oInput = null;
	});

	QUnit.test("Autocomplete should keep cursor on place when there are no suggestions", function (assert) {
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
		sap.ui.getCore().applyChanges();

		// Arrange - open the suggestions
		oInput._$input.focus().val("Germ").trigger("input");

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

	QUnit.test("Autocomplete on phone", function (assert) {
		if (Device.browser.internet_explorer && Device.browser.version < 11) { // TODO remove after 1.62 version
			assert.ok(true, "Do not test phone functionality in unsupported versions of Internet Explorer");
			return;
		}

		// arrange
		var oSystem = {
			desktop : false,
			phone : true,
			tablet : false
		};

		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

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

		var oPopover = oInput._oSuggPopover,
			oPopupInput = oInput._oSuggPopover._oPopupInput;

		sap.ui.getCore().applyChanges();

		// act
		oPopover._oPopover.open();
		this.clock.tick(300);
		oPopupInput.onfocusin();
		oPopupInput._$input.focus().trigger("keydown").val("uni").trigger("input");
		this.clock.tick(300);

		// assert
		assert.ok(oInput._oSuggPopover._bDoTypeAhead, "Type ahead should be allowed when pressing 'B'.");
		assert.strictEqual(oPopupInput.getValue(), "united Kingdom", "Input value should be autocompleted and character casing should be preserved.");
		assert.strictEqual(oPopupInput.getSelectedText(), "ted Kingdom", "Suggested value should be selected");
		assert.strictEqual(oPopover._oPopover.getContent()[1].getItems()[2].getSelected(), true, "Correct item in the Suggested list is selected");

		// act
		sap.ui.test.qunit.triggerKeydown(oPopupInput._$input, KeyCodes.ENTER);
		this.clock.tick(300);

		// assert
		assert.strictEqual(oInput.getValue(), "United Kingdom", "Pressing enter should finalize autocompletion.");

		// clean up
		oInput.destroy();
		oInput = null;
	});

	QUnit.test("right arrow press", function (assert) {

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

		sap.ui.getCore().applyChanges();

		oInput._oSuggPopover._onsapright();

		assert.equal(fnLiveChange.callCount, 0, "liveChange handler is not fired");

		// clean up
		oInput.destroy();
		oInput = null;
	});

	QUnit.test("autocomplete with 0 matched items", function (assert) {

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
		sap.ui.getCore().applyChanges();

		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.G });
		oInput._oSuggPopover._oPopover.open();

		// act
		oInput._$input.focus().trigger(oFakeKeydown).val("p").trigger("input");
		this.clock.tick(300);

		// check selected (highlighted in blue) row in the suggestion table
		var oSelectedRow1 = oInput._oSuggPopover._oList.getItems()[0];
		assert.ok(oSelectedRow1.getSelected(), true, "First item is selected");
		assert.equal(oSelectedRow1.getCells()[0].getText().toLowerCase(), oInput.getValue().toLowerCase(), "The value of the input is the same as the value of the selected row");

		// act
		oInput._$input.focus().trigger(oFakeKeydown).val("ph").trigger("input");
		this.clock.tick(300);

		// check selected (highlighted in blue) row in the suggestion table
		var oSelectedRow2 = oInput._oSuggPopover._oList.getItems()[2];
		assert.ok(oSelectedRow2.getSelected(), true, "First item is selected");
		assert.equal(oSelectedRow2.getCells()[0].getText().toLowerCase(), oInput.getValue().toLowerCase(), "The value of the input is the same as the value of the selected row");

		oInput.bindSuggestionRows({
			path: "",
			template: new ColumnListItem()
		});
		this.clock.tick(300);

		// assert
		assert.strictEqual(stub.callCount, 0, "Should NOT call 'setSelectedRow' when aggregation is destroyed after a proposed item was found.");
	});

	QUnit.module("Input with Suggestions and Value State, but not Value State Message", {
		beforeEach: function () {
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
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			if (this.inputWithSuggestions._oValueStateMessage._oPopup) {
				this.inputWithSuggestions._oValueStateMessage._oPopup.close();
			}

			this.inputWithSuggestions.destroy();
			this.inputWithSuggestions = null;
		}
	});

	QUnit.test('valueStateText', function (assert) {

		this.inputWithSuggestions.setValueState("Error");
		this.inputWithSuggestions.onfocusin();
		this.inputWithSuggestions._$input.focus().val("on").trigger("input");
		this.clock.tick(300);

		this.inputWithSuggestions._closeSuggestionPopup();
		this.clock.tick(300);

		assert.notOk(this.inputWithSuggestions._oValueStateMessage._oPopup, "Value state message is not shown");
	});

	QUnit.test('show/hide suggestions', function (assert) {

		this.inputWithSuggestions.setValueState("Error");
		this.inputWithSuggestions.setShowValueStateMessage(true);

		assert.ok(this.inputWithSuggestions._oSuggPopover._oPopover, 'suggestions popover is initialized');
		this.inputWithSuggestions.setShowSuggestion(false);
		assert.notOk(this.inputWithSuggestions._oSuggPopover._oPopover, 'suggestions popover is not initialized');

		this.inputWithSuggestions.openValueStateMessage();

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
		beforeEach: function () {

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
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			if (this.inputWithSuggestions._oValueStateMessage._oPopup) {
				this.inputWithSuggestions._oValueStateMessage._oPopup.close();
			}

			this.inputWithSuggestions.destroy();
			this.inputWithSuggestions = null;
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
		this.inputWithSuggestions._$input.focus().val("on").trigger("input");
		this.clock.tick(300);

		// Assert
		assert.strictEqual(this.inputWithSuggestions._getSuggestionsPopover()._oPopover.$().find(".sapMValueStateHeaderText").text(), "Some Error", "value state message is displayed in the suggestion popover");

		// Act
		this.inputWithSuggestions.setValueStateText(sValueStateText);
		this.clock.tick(300);

		// Assert
		assert.strictEqual(this.inputWithSuggestions._getSuggestionsPopover()._oPopover.$().find(".sapMValueStateHeaderText").text(), sValueStateText, "value state message is displayed in the suggestion popover");

		var oPopup = this.inputWithSuggestions._oValueStateMessage._oPopup;

		assert.ok(!oPopup || oPopup.getContent().style.display === "none", "Value state message is not displayed");

		// Act
		this.inputWithSuggestions._closeSuggestionPopup();
		this.clock.tick(300);

		// Assert
		assert.ok(this.inputWithSuggestions._oValueStateMessage._oPopup.getContent().classList.contains("sapMValueStateMessage"), "Value state message is displayed");
	});

	QUnit.module("Input with Suggestions and Value State and Value State Message -  Mobile", {
		beforeEach: function () {

			this.isPhone = Device.system.phone;
			Device.system.phone = true;

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
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			if (this.inputWithSuggestions._oValueStateMessage._oPopup) {
				this.inputWithSuggestions._oValueStateMessage._oPopup.close();
			}

			this.inputWithSuggestions.destroy();
			this.inputWithSuggestions = null;

			Device.system.phone = this.isPhone;
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
		assert.strictEqual(this.inputWithSuggestions._getSuggestionsPopover()._oPopover.getContent()[0].getText(), "Some Error", "value state message is displayed in the suggestion popover");

		// Act
		this.inputWithSuggestions.setValueStateText(sValueStateText);
		this.clock.tick(300);

		// Assert
		assert.strictEqual(this.inputWithSuggestions._getSuggestionsPopover()._oPopover.getContent()[0].getText(), sValueStateText, "value state message is displayed in the suggestion popover");

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

			this.input = new Input({
				valueStateText: 'Some Error',
				showValueStateMessage: true
			});

			this.dialog = new Dialog();
		},
		afterEach: function () {

			this.dialog.destroy();
			this.dialog = null;
			this.input = null;
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

	QUnit.module("Input with suggestions - change event", {
		beforeEach: function () {
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
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oInput.destroy();
			this.oInput = null;
		}
	});

	QUnit.test("Change event should be fired if entered value is not part of the suggestion list", function(assert) {

		var fnFireChangeSpy = this.spy(this.oInput, "fireChange");
		this.oInput.onfocusin();
		this.oInput._$input.focus().val("u2").trigger("input");
		this.clock.tick(300);

		this.oInput._$input.focus().val("U21").trigger("input");
		this.clock.tick(300);
		//ASSERT
		assert.equal(this.oInput.getValue() ,"U21", "Value is set");
		assert.equal(fnFireChangeSpy.callCount , 0 , "Change event should not be fired");

		sap.ui.test.qunit.triggerKeydown(this.oInput.getFocusDomRef(), "ENTER");
		this.clock.tick(300);
		assert.equal(fnFireChangeSpy.callCount , 1 , "Change event should be fired");
	});

	QUnit.test("Change event should be fired only once when there is a proposed item", function(assert) {

		var fnFireChangeSpy = this.spy(this.oInput, "fireChange");
		this.oInput.onfocusin();
		this.oInput._$input.focus().val("u").trigger("input");
		this.clock.tick(300);

		this.oInput._oSuggPopover._bDoTypeAhead = true;
		this.oInput._oSuggPopover._handleTypeAhead();

		this.oInput.onsapfocusleave({relatedControlId: null});
		document.getElementById('i2-inner').focus();

		this.clock.tick(300);
		assert.equal(fnFireChangeSpy.callCount , 1 , "Change event should be fired only once");
	});

	QUnit.test("Change event should be fired when autocomplete is false and input is focused out", function(assert) {

		var fnFireChangeSpy = this.spy(this.oInput, "fireChange");
		this.oInput.setAutocomplete(false);
		this.oInput._$input.focus().val("u").trigger("input");
		this.clock.tick(300);

		this.oInput._oSuggPopover._bDoTypeAhead = true;
		this.oInput._oSuggPopover._handleTypeAhead();

		document.getElementById('i2-inner').focus();

		this.clock.tick(300);
		assert.equal(fnFireChangeSpy.callCount , 1 , "Change event should be fired only once");
	});

	QUnit.test("Force closing suggestions popover on 'change' event", function(assert) {

		var oInput = this.oInput,
			iSuggestionItemSelectedCount = 0;

		oInput.attachSuggestionItemSelected(function () {
			oInput.closeSuggestions();
			iSuggestionItemSelectedCount++;
		});

		oInput.onfocusin();
		oInput._$input.focus().val("u").trigger("input");
		this.clock.tick(300);

		sap.ui.test.qunit.triggerKeydown(oInput.getDomRef("inner"), jQuery.sap.KeyCodes.ARROW_DOWN);
		sap.ui.getCore().applyChanges();
		sap.ui.test.qunit.triggerKeydown(oInput.getDomRef("inner"), jQuery.sap.KeyCodes.ENTER);

		assert.ok(true, 'there is no endless loop');

		assert.strictEqual(iSuggestionItemSelectedCount,  1, 'attachSuggestionItemSelected is fired only once');
	});

	QUnit.module("Suggestions grouping", {
		beforeEach : function() {
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
			sap.ui.getCore().applyChanges();

		},
		afterEach : function() {
			this.oInput.destroy();
		}}
	);

	QUnit.test("Group results", function(assert){
		var aVisibleItems;

		this.oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		this.oInput._$input.focus().val("A").trigger("input");
		this.clock.tick(300);

		aVisibleItems = this.oInput._oSuggPopover._oList.getItems().filter(function(oItem){
			return oItem.getVisible();
		});

		// assert
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

	QUnit.test("_configureListItem", function () {
		var oListItem = new sap.m.GroupHeaderListItem({
			enabled: true
		}), oItem = new Item(),
			oResultItem = this.oInput._configureListItem(oItem, oListItem);

		assert.strictEqual(oListItem._oItem, oItem, "The core item is attached to the header group item.");
		assert.strictEqual(oListItem.getType(), ListType.Inactive, "The header group item is inactive.");

		// clean up
		oListItem.destroy();
		oItem.destroy();
		oResultItem.destroy();
	});

	QUnit.test("Keyboard selection of group header", function () {
		var aVisibleItems, oGroupHeader;

		this.oInput.onfocusin(); // for some reason this is not triggered when calling focus via API
		this.oInput._$input.focus().val("A").trigger("input");
		this.clock.tick(300);

		aVisibleItems = this.oInput._oSuggPopover._oList.getItems().filter(function(oItem){
			return oItem.getVisible();
		});
		oGroupHeader = aVisibleItems[0];

		// act
		sap.ui.test.qunit.triggerKeydown(this.oInput.getDomRef("inner"), jQuery.sap.KeyCodes.ARROW_DOWN);
		sap.ui.getCore().applyChanges();

		// assert
		// go to the header group item
		assert.strictEqual(this.oInput.getValue(), "", "The value is cleared.");
		assert.ok(oGroupHeader.hasStyleClass("sapMInputFocusedHeaderGroup"), "Styling is applied on the selected group header.");

		// act
		// go to the next list item
		sap.ui.test.qunit.triggerKeydown(this.oInput.getDomRef("inner"), jQuery.sap.KeyCodes.ARROW_DOWN);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.oInput.getValue(), aVisibleItems[1].getTitle(), "The value is populated again.");
		assert.notOk(oGroupHeader.hasStyleClass("sapMInputFocusedHeaderGroup"), "Styling is removed from the unselected group header.");
	});

	QUnit.module("showItems functionality: List", {
			beforeEach: function () {
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

				sap.ui.getCore().applyChanges();

			},
			afterEach: function () {
				this.oInput.destroy();
				this.oInput = null;
			}
		});

	QUnit.test("Should restore default filtering function", function (assert) {
		// Setup
		var fnFilter = this.oInput._fnFilter;

		// Act
		this.oInput.showItems(function () {
			return true;
		});

		// Assert
		assert.strictEqual(this.oInput._fnFilter, fnFilter, "Default function has been restored");

		// Act
		fnFilter = function (sValue, oItem) {
			return oItem.getText() === "A Item 1";
		};
		this.oInput.setFilterFunction(fnFilter);
		this.oInput.showItems(function () {
			return false;
		});

		// Assert
		assert.strictEqual(this.oInput._fnFilter, fnFilter, "Custom filter function has been restored");
	});

	QUnit.test("Should show all the items", function (assert) {
		// Act
		this.oInput.showItems();
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oInput._oSuggPopover._oList.getItems().length, 5, "Shows all items");
	});

	QUnit.test("Should filter the items", function (assert) {
		// Act
		this.oInput.showItems(function (sValue, oItem) {
			return oItem.getText() === "A Item 1";
		});
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oInput._oSuggPopover._oList.getItems().length, 1, "Show only the matching items");
	});

	QUnit.module("showItems functionality: Table", {
		beforeEach: function () {
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

			sap.ui.getCore().applyChanges();

		},
		afterEach: function () {
			this.oInput.destroy();
			this.oInput = null;
		}
	});

	QUnit.test("Should show all the items", function (assert) {
		// Setup
		var fnGetVisisbleItems = function (aItems) {
			return aItems.filter(function (oItem) {
				return oItem.getVisible();
			});
		};

		// Act
		this.oInput.showItems();
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oInput._oSuggestionTable.getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oInput._oSuggestionTable.getItems()).length, 5, "Shows all items");
	});

	QUnit.test("Should filter the items", function (assert) {
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
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oInput._oSuggestionTable.getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oInput._oSuggestionTable.getItems()).length, 1, "Only the matching items are visible");
	});

	QUnit.module("Dialog on mobile");

	QUnit.test("Dialog elements", function (assert) {
		var oDialog, oCustomHeader,
			oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

		this.oInput = new Input({showSuggestion: true});
		this.oLabel = new Label({text: "Label text", labelFor: this.oInput.getId()});
		this.oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		this.oInput._openSuggestionsPopover();
		sap.ui.getCore().applyChanges();

		oDialog = this.oInput._getSuggestionsPopover()._oPopover;
		oCustomHeader = oDialog.getCustomHeader();

		assert.ok(oCustomHeader.getContentMiddle()[0].isA("sap.m.Title"), "A title is added to the dialog");
		assert.strictEqual(oCustomHeader.getContentMiddle()[0].getText(), this.oLabel.getText(), "The title has a correct value.");

		assert.ok(oCustomHeader.getContentRight()[0].isA("sap.m.Button"), "A button is added to the header.");
		assert.strictEqual(oCustomHeader.getContentRight()[0].getIcon(),  IconPool.getIconURI("decline"), "The button renders a decline icon");

		assert.strictEqual(oDialog.getBeginButton().getText(), this.oRb.getText("SUGGESTIONSPOPOVER_CLOSE_BUTTON"),
			"The OK button has a correct text value");

		this.oInput.destroy();

	});

	QUnit.test("Close button press", function (assert) {
		var oCloseButton,
			oSuggPopover,
			oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

		this.oInput = new Input({showSuggestion: true});
		this.oInput._openSuggestionsPopover();
		sap.ui.getCore().applyChanges();

		oSuggPopover = this.oInput._getSuggestionsPopover();
		oCloseButton = oSuggPopover._oPopover.getCustomHeader().getContentRight()[0];

		oCloseButton.firePress();
		this.clock.tick(400);

		assert.notOk(oSuggPopover.isOpen(), "The dialog is closed on X press.");

		this.oInput.destroy();

	});

	QUnit.test("OK button press", function (assert) {
		var oOKButton,
			oSuggPopover,
			oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

		this.oInput = new Input({showSuggestion: true});
		this.oInput._openSuggestionsPopover();
		sap.ui.getCore().applyChanges();

		oSuggPopover = this.oInput._getSuggestionsPopover();
		oOKButton = oSuggPopover._oPopover.getBeginButton();

		oOKButton.firePress();
		this.clock.tick(400);

		assert.notOk(oSuggPopover.isOpen(), "The dialog is closed on OK press.");

		this.oInput.destroy();
	});

	return waitForThemeApplied(this.oInput);
});
