/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/thirdparty/jquery",
	"sap/ui/commons/DropdownBox",
	"sap/ui/core/ListItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/events/KeyCodes",
	"sap/ui/util/Storage"
], function(qutils, createAndAppendDiv, jQuery, DropdownBox, ListItem, JSONModel, KeyCodes, Storage) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3", "uiArea4", "uiArea5"]);



	var sCheckText = "second item",
		sDropdownId = "ddb";

	// ensure there is nothing in the storage that interferes with this test
	var sHistPrefix = document.location.pathname; // ""
	var storage = new Storage(Storage.Type.local);
	storage.remove(sHistPrefix + sDropdownId);
	storage.remove(sHistPrefix + sDropdownId + "2");
	storage.remove(sHistPrefix + sDropdownId + "3");


	// Create the controls
	var oDropdown = new DropdownBox(sDropdownId, {value: "",
			displaySecondaryValues: true,
	  items : [
				new ListItem("fi",{text:"first item", additionalText: "(1)", key: "key1"}),
				new ListItem("si",{text:"second item", additionalText: "(2)", key: "key2"}),
				new ListItem("ti",{text:"third item", additionalText: "(3)", key: "key3"}),
				new ListItem("li",{text:"last item", additionalText: "(4)", key: "key4"})]
			}
		),
		sDropdownInputId = sDropdownId + "-input",
		sDropdownIconId = sDropdownId + "-icon",
		sDropdownTypingInputId = sDropdownId;

	oDropdown.placeAt("uiArea1");

	var oDropdown2 = new DropdownBox(sDropdownId + "2", {editable: false,
		items : [
			new ListItem("red",{text:"red"}),
			new ListItem("blue",{text:"blue"}),
			new ListItem("yellow",{text:"yellow"})]
		});
	oDropdown2.placeAt("uiArea2");

	var oDropdown3 = new DropdownBox(sDropdownId + "3", {visible: false,
		items : [
			new ListItem("v",{text:"not visible"})]
		});
	oDropdown3.placeAt("uiArea3");

	var bSearchHelpFired = false;
	var oDropdown4 = new DropdownBox(sDropdownId + "4", {
		value: "",
		displaySecondaryValues: true,
		searchHelpEnabled: true,
		searchHelp: function(oEvent){
			bSearchHelpFired = true;
		},
		items : [
			new ListItem("Langu1",{text:"German", additionalText: "DE"}),
			new ListItem("Langu2",{text:"English", additionalText: "EN"}),
			new ListItem("Langu3",{text:"Spanish", additionalText: "SP"})]
		}
	).placeAt("uiArea4");

	var oModel = new JSONModel({
			items:[
				{text: "Item 1", key: "I1"},
				{text: "Item 2", key: "I2"},
				{text: "Item 3", key: "I3"}
			],
			key: "I2"
		});
	sap.ui.getCore().setModel(oModel);
	var oItemTemplate = new ListItem();
	oItemTemplate.bindProperty("text", "text").bindProperty("key", "key");
	var oDropdown5 = new DropdownBox(sDropdownId + "5").placeAt("uiArea5");
	oDropdown5.bindProperty("selectedKey", "/key");
	oDropdown5.bindAggregation("items", "/items", oItemTemplate);

	QUnit.module("Control Test - sap.ui.commons.DropdownBox", {
		beforeEach: function(){
			oDropdown.setValue(sCheckText);
			oDropdown.focus();
		}//,
		//afterEach: function(){
		//	qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ENTER, false, false, false);
		//}
	});

	QUnit.test("TestRenderedOK", function(assert){
		assert.notEqual(oDropdown.getDomRef(), null, "DropdownBox outer HTML Element should be rendered.");
		assert.equal(jQuery("#" + sDropdownId + " > input").length, 1, "DropdownBox should provide an input element.");
		assert.equal(oDropdown.getValue(), sCheckText, "Default value / text should still be set.");
		assert.equal(document.getElementById(sDropdownInputId).value, sCheckText, "Default value / text should be in the HTML.");
		assert.equal(oDropdown.getInputDomRef().value, sCheckText, "Default value / text should be in the HTML and accessible via getDomRef.");

		// in jQuery 1.6.2 this has changed
		assert.ok((jQuery("#" + sDropdownId + "2 > input").attr("readonly")) || (jQuery("#" + sDropdownId + "2 > input").prop("readonly")) , "Second DropdownBox should be read only.");

		assert.equal(jQuery("#" + sDropdownId + "3").length, 0, "Third (invisible) DropdownBox should not be rendered at all.");

		assert.equal(oDropdown2.getValue(), "red", "Default value (if no value set) should be the first item.");
		assert.equal(document.getElementById(sDropdownId + "2-input").value, "red", "Default value (if no value set) should be the first item in the HTML.");

		assert.equal(jQuery("#" + sDropdownId + " > input").attr("aria-describedby"), sDropdownId + "-SecVal", "aria-describesby");
	});

	QUnit.test("Setter / Getter", function(assert){
		oDropdown.setValue("second item");
		assert.equal(oDropdown.getValue(), "second item", "setValue: value");
		assert.equal(oDropdown.getSelectedKey(), "key2", "setValue: selectedKey");
		assert.equal(oDropdown.getSelectedItemId(), "si", "setValue: selectedId");

		oDropdown.setSelectedKey("key3");
		assert.equal(oDropdown.getValue(), "third item", "setValue: value");
		assert.equal(oDropdown.getSelectedKey(), "key3", "setValue: selectedKey");
		assert.equal(oDropdown.getSelectedItemId(), "ti", "setValue: selectedId");

		oDropdown.setSelectedItemId("fi");
		assert.equal(oDropdown.getValue(), "first item", "setValue: value");
		assert.equal(oDropdown.getSelectedKey(), "key1", "setValue: selectedKey");
		assert.equal(oDropdown.getSelectedItemId(), "fi", "setValue: selectedId");

		oDropdown.setValue("xxx");
		assert.equal(oDropdown.getValue(), "first item", "setValue: value");
		assert.equal(oDropdown.getSelectedKey(), "key1", "setValue: selectedKey");
		assert.equal(oDropdown.getSelectedItemId(), "fi", "setValue: selectedId");
	});

	QUnit.module("Autocomplete Tests - sap.ui.commons.DropdownBox", {
		beforeEach: function(assert){
			resetBeforeTest(assert);
			oDropdown.focus();
		}//,
		//afterEach: function(){
		//	qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ENTER, false, false, false);
		//}
	});

	QUnit.test("TestInputOK", function(assert){
		jQuery(oDropdown.getInputDomRef()).val(""); //simulate clearing value by typing on selected text
		qutils.triggerKeypress(sDropdownTypingInputId, "s");

		assert.equal(oDropdown.getValue(), "first item", "DropdownBox' value should not have changed, yet.");
		assert.equal(oDropdown.getInputDomRef().value, "second item", "DropdownBox' value should have autocompleted in HTML.");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ENTER, false, false, false);

		assert.equal(oDropdown.getValue(), "second item", "DropdownBox' value should hold confirmed entry.");
		assert.equal(oDropdown.getInputDomRef().value, "second item", "DropdownBox' value should not have changed in HTML.");
	});

	QUnit.test("TestMultipleInputOK", function(assert){
		jQuery(oDropdown.getInputDomRef()).val(""); //simulate clearing value by typing on selected text
		jQuery.each("third".split(''), function(idx, val){
			qutils.triggerKeypress(sDropdownTypingInputId, val);
		});

		assert.equal(oDropdown.getValue(), "first item", "DropdownBox' value should not have changed, yet.");
		assert.equal(oDropdown.getInputDomRef().value, "third item", "DropdownBox' value should have autocompleted in HTML.");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ENTER, false, false, false);

		assert.equal(oDropdown.getValue(), "third item", "DropdownBox' value should have been autocompleted.");
		assert.equal(oDropdown.getInputDomRef().value, "third item", "DropdownBox' value should have changed in HTML.");
	});

	QUnit.module("Arrow Control Tests - sap.ui.commons.DropdownBox", {
		beforeEach: function(){
			oDropdown.focus();
		}
	});

	QUnit.test("TestArrowDownOK", function(assert){
		resetBeforeTest(assert);

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ARROW_DOWN, false, false, false);
		assert.equal(oDropdown.getValue(), "first item", "DropdownBox' value should not have changed.");
		assert.equal(oDropdown.getInputDomRef().value, "second item", "DropdownBox' value should have changed in HTML.");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ARROW_DOWN, false, false, false);
		assert.equal(oDropdown.getValue(), "first item", "DropdownBox' value should not have changed.");
		assert.equal(oDropdown.getInputDomRef().value, "third item", "DropdownBox' value should have changed in HTML.");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ARROW_DOWN, false, false, false);
		assert.equal(oDropdown.getValue(), "first item", "DropdownBox' value should not have changed.");
		assert.equal(oDropdown.getInputDomRef().value, "last item", "DropdownBox' value should have changed in HTML.");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ARROW_DOWN, false, false, false);
		assert.equal(oDropdown.getValue(), "first item", "DropdownBox' value should not have changed.");
		assert.equal(oDropdown.getInputDomRef().value, "last item", "DropdownBox' value should have changed in HTML.");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ENTER, false, false, false);

		assert.equal(oDropdown.getValue(), "last item", "DropdownBox' value should hold selected value.");
		assert.equal(oDropdown.getInputDomRef().value, "last item", "DropdownBox' value should not have changed in HTML.");

	});

	QUnit.test("TestArrowUpOK", function(assert){
		var sTestValue = "last item";
		assert.equal(oDropdown.getValue(), sTestValue, "DropdownBox' value should be last item.");
		assert.equal(oDropdown.getInputDomRef().value, sTestValue, "DropdownBox' value should match to HTML.");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ARROW_UP, false, false, false);
		assert.equal(oDropdown.getValue(), sTestValue, "DropdownBox' value should not have changed.");
		assert.equal(oDropdown.getInputDomRef().value, "third item", "DropdownBox' value should have changed in HTML.");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ARROW_UP, false, false, false);
		assert.equal(oDropdown.getValue(), sTestValue, "DropdownBox' value should not have changed.");
		assert.equal(oDropdown.getInputDomRef().value, "second item", "DropdownBox' value should have changed in HTML.");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ARROW_UP, false, false, false);
		assert.equal(oDropdown.getValue(), sTestValue, "DropdownBox' value should not have changed.");
		assert.equal(oDropdown.getInputDomRef().value, "first item", "DropdownBox' value should have changed in HTML.");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ARROW_UP, false, false, false);
		assert.equal(oDropdown.getValue(), sTestValue, "DropdownBox' value should not have changed.");
		assert.equal(oDropdown.getInputDomRef().value, "first item", "DropdownBox' value should not have changed in HTML.");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ENTER, false, false, false);

		assert.equal(oDropdown.getValue(), "first item", "DropdownBox' value should hold selected value.");
		assert.equal(oDropdown.getInputDomRef().value, "first item", "DropdownBox' value should not have changed in HTML.");

	});

	QUnit.module("Misc. Keys Control Tests - sap.ui.commons.DropdownBox", {
		beforeEach: function(){
			oDropdown.focus();
		},
		afterEach: function(){
			qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ENTER, false, false, false);
		}
	});

	QUnit.test("TestEndOK", function(assert){
		resetBeforeTest(assert);

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.END, false, false, false);
		assert.equal(oDropdown.getValue(), "first item", "DropdownBox' value should not have changed when not proposal list not open.");
		assert.equal(oDropdown.getInputDomRef().value, "first item", "DropdownBox' value should not have changed in HTML when not proposal list not open.");
	});

	QUnit.test("TestPageDownOK", function(assert){
		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.PAGE_DOWN, false, false, false);
		assert.ok(true, "Implementation pending. Specification prio 3");
	});

	QUnit.test("TestPageUpOK", function(assert){
		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.PAGE_UP, false, false, false);
		assert.ok(true, "Implementation pending. Specification prio 3");
	});

	QUnit.test("TestEscape", function(assert){
		oDropdown.setValue("third item");
		oDropdown.focus();
		oDropdown._doSelect();
		qutils.triggerCharacterInput(sDropdownTypingInputId, "s");

		assert.equal(oDropdown.getValue(), "third item", "DropdownBox' value should have not been changed.");
		assert.equal(oDropdown.getFocusDomRef().value, "second item", "DropdownBox' value should have changed in HTML.");
		assert.equal(oDropdown.getSelectedKey(), "key3", "selectedKey should not have changed");
		assert.equal(oDropdown.getSelectedItemId(), "ti", "selectedItemId should not have changed");

		qutils.triggerKeyEvent("keypress", sDropdownTypingInputId, KeyCodes.ESCAPE);

		assert.equal(oDropdown.getValue(), "third item", "DropdownBox' value should have not been changed.");
		assert.equal(oDropdown.getFocusDomRef().value, "third item", "DropdownBox' value should have been set back in HTML.");
		assert.equal(oDropdown.getSelectedKey(), "key3", "selectedKey should not have changed");
		assert.equal(oDropdown.getSelectedItemId(), "ti", "selectedItemId should not have changed");
	});

	QUnit.module("Open / Close Tests - sap.ui.commons.DropdownBox", {
		beforeEach: function(){
			oDropdown.focus();
		},
		afterEach: function(){
			qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ENTER, false, false, false);
		}
	});

	QUnit.test("TestOpenCloseViaKeyboardOK", function(assert){
		resetBeforeTest(assert);

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.F4, false, false, false);
		assert.ok(oDropdown.$("lb").is(":visible"), "ListBox should be visible after F4 press");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.F4, false, false, false);
		assert.ok(oDropdown.$("lb").is(":hidden"), "ListBox should be hidden after second F4 press");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ARROW_DOWN, false, true, false);
		assert.ok(oDropdown.$("lb").is(":visible"), "ListBox should be visible after Alt + Arrow Down press");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ARROW_UP, false, true, false);
		assert.ok(oDropdown.$("lb").is(":hidden"), "ListBox should be hidden after Alt + Arrow Up press");

	});

	QUnit.test("TestOpenCloseViaMouseOK", function(assert){
		resetBeforeTest(assert);

		qutils.triggerEvent("click", sDropdownIconId);
		assert.ok(oDropdown.$("lb").is(":visible"), "ListBox should be visible after click on F4 help button");

		qutils.triggerEvent("click", sDropdownIconId);
		assert.ok(oDropdown.$("lb").is(":hidden"), "ListBox should be hidden after second click on F4 help button");

	});


	QUnit.module("Mouse Handling Tests - sap.ui.commons.DropdownBox", {
		beforeEach: function(assert){
			resetBeforeTest(assert);
			oDropdown.focus();
			this.handleChange = function(){
				assert.ok(true, "DropdownBox event handler change was triggered.");
			};
			oDropdown.attachChange(this.handleChange);
		},
		afterEach: function(){
			oDropdown.detachChange(this.handleChange);
		}
	});

	QUnit.test("TestSelectItemFromListOK", function(assert){
		assert.expect(12); // two from reset, 8 from this method and 2 from the event handler (initiated via click events)

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.F4, false, false, false);
		assert.ok(oDropdown.$("lb").is(":visible"), "ListBox should be visible after F4 press");

		qutils.triggerEvent("click", "si-txt");
		assert.equal(oDropdown.getValue(), "second item", "DropdownBox' second item should have been selected.");
		assert.equal(oDropdown.getInputDomRef().value, "second item", "DropdownBox' selected value should be shown in HTML.");

		assert.ok(oDropdown.$("lb").is(":hidden"), "ListBox should be hidden after item selection");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.F4, false, false, false);
		assert.ok(oDropdown.$("lb").is(":visible"), "ListBox should be visible after F4 press");

		qutils.triggerEvent("click", "li-txt");
		assert.equal(oDropdown.getValue(), "last item", "DropdownBox' second item should have been selected.");
		assert.equal(oDropdown.getInputDomRef().value, "last item", "DropdownBox' selected value should be shown in HTML.");

		assert.ok(oDropdown.$("lb").is(":hidden"), "ListBox should be visible after item selection");

	});


	QUnit.module("Misc. Keys Control Tests with open Listbox - sap.ui.commons.DropdownBox", {
		beforeEach: function(){
			oDropdown.focus();

			// ensure the "first item" is really the first item in the list (also including the history feature)
			qutils.triggerKeypress(sDropdownTypingInputId, "f");
			qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ENTER, false, false, false);
		}
	});

	QUnit.test("TestEndWhenOpenedOK", function(assert){
		resetBeforeTest(assert);

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.F4, false, false, false);
		assert.ok(oDropdown.$("lb").is(":visible"), "ListBox should be visible after F4 press");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.END, false, false, false);
		assert.equal(oDropdown.getValue(), "first item", "DropdownBox' value should not have changed.");
		assert.equal(oDropdown.getInputDomRef().value, "last item", "DropdownBox' value should match to HTML.");

		// also check that second 'End' stays the same
		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.END, false, false, false);
		assert.equal(oDropdown.getValue(), "first item", "DropdownBox' value should not have changed.");
		assert.equal(oDropdown.getInputDomRef().value, "last item", "DropdownBox' value should not have changed in HTML.");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.F4, false, false, false);
		assert.ok(oDropdown.$("lb").is(":hidden"), "ListBox should be hidden again after second F4 press");
		assert.equal(oDropdown.getValue(), "first item", "DropdownBox' value should not have changed.");
		assert.equal(oDropdown.getInputDomRef().value, "last item", "DropdownBox' value should not have changed in HTML.");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ENTER, false, false, false);

		assert.equal(oDropdown.getValue(), "last item", "DropdownBox' value should hold selected value.");
		assert.equal(oDropdown.getInputDomRef().value, "last item", "DropdownBox' value should not have changed in HTML.");

	});

	QUnit.test("TestHomeWhenOpenedOK", function(assert){
		oDropdown.setValue("last item"); // reset value to the one from the test method before

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.F4, false, false, false);
		assert.ok(oDropdown.$("lb").is(":visible"), "ListBox should be visible after F4 press");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.HOME, false, false, false);
		assert.equal(oDropdown.getValue(), "last item", "DropdownBox' value should not have changed.");
		assert.equal(oDropdown.getInputDomRef().value, "first item", "DropdownBox' value should have changed in HTML.");

		// also check that second 'Home' stays the same
		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.HOME, false, false, false);
		assert.equal(oDropdown.getValue(), "last item", "DropdownBox' value should not have changed.");
		assert.equal(oDropdown.getInputDomRef().value, "first item", "DropdownBox' value should not have changed in HTML.");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.F4, false, false, false);
		assert.ok(oDropdown.$("lb").is(":hidden"), "ListBox should be hidden again after second F4 press");
		assert.equal(oDropdown.getValue(), "last item", "DropdownBox' value should not have changed.");
		assert.equal(oDropdown.getInputDomRef().value, "first item", "DropdownBox' value should not have changed in HTML.");

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ENTER, false, false, false);

		assert.equal(oDropdown.getValue(), "first item", "DropdownBox' value should hold selected value.");
		assert.equal(oDropdown.getInputDomRef().value, "first item", "DropdownBox' value should not have changed in HTML.");
	});

	QUnit.module("Event Tests - sap.ui.commons.DropdownBox", {
		beforeEach: function(assert){
			//resetBeforeTest(assert);
			oDropdown.focus();
			this.handleChange = function(oEvent){
				assert.ok(true, "DropdownBox event handler change was triggered.");
			};
			oDropdown.attachChange(this.handleChange);
		},
		afterEach: function(){
			oDropdown.detachChange(this.handleChange);
			//qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ENTER, false, false, false);
		}
	});

	QUnit.test("TestChangeOnEnterAfterTextInputOK", function(assert){
		assert.expect(4); // two from cleanup + two from the event handlers (the one from the module plus the local one)
		resetBeforeTest(assert);
		var sInput = "second";
		function fCheck(oEvent){
			assert.equal(oEvent.getParameter("newValue"), sInput + " item", "Change event should provide valid auto completed new value.");
		}
		oDropdown.attachChange(fCheck);

		jQuery.each(sInput.split(''), function(idx, val){
			qutils.triggerKeypress(sDropdownTypingInputId, val);
		});

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ENTER, false, false, false);

		oDropdown.detachChange(fCheck);
	});

	var sText = "third item";
	var oTest1 = function(oEvent) {
		QUnit.config.current.assert.equal(oEvent.getParameter("newValue"), sText, "Entered value should be provided as Event parameter");
	};
	QUnit.test("TestChangeOnFocusLostAfterTextInputOK", function(assert){
		// we do not expect (anymore) as different browsers handle events in different execution orders
		// and thus this is (unfortunately) not precisely predictable.
		// assert.expect(4); // two from cleanup + two from the event handler
		resetBeforeTest(assert);
		oDropdown.attachChange(oTest1);

		jQuery(oDropdown.getInputDomRef()).val(""); //simulate clearing value by typing on selected text
		jQuery.each(sText.split(''), function(idx, val){
			qutils.triggerKeypress(sDropdownInputId, val);
		});
		oDropdown2.focus();
	});

	QUnit.test("TestChangeOnFocusLostAfterTextInputOK_check", function(assert){
		var done = assert.async();
		// we do not expect (anymore) as different browsers handle events in different execution orders
		// and thus this is (unfortunately) not precisely predictable.
		// assert.expect(1); // 1 check
		setTimeout( function(){
			assert.equal(oDropdown.getValue(), sText, "DropdownBox should provide new value via getter method.");

			oDropdown.detachChange(oTest1);
			done();
		}, 100);
	});

	QUnit.test("TestChangeOnEnterAfterUpDownOK", function(assert){
		assert.expect(3); // two from cleanup + the one from the event handler
		resetBeforeTest(assert);

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ARROW_DOWN, false, false, false);
		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ARROW_DOWN, false, false, false);

		qutils.triggerKeyboardEvent(sDropdownTypingInputId, KeyCodes.ENTER, false, false, false);
	});

	var oTest3 = function(oEvent) {
		QUnit.config.current.assert.equal(oEvent.getParameter("newValue"), "third item", "Entered value should be provided as Event parameter");
	};

	QUnit.test("TestChangeOnFocusLostAfterUpDownOK", function(assert){
		// we do not expect (anymore) as different browsers handle events in different execution orders
		// and thus this is (unfortunately) not precisely predictable.
		// assert.expect(4); // two from cleanup + two from the event handler
		resetBeforeTest(assert);

		oDropdown.attachChange(oTest3);

		qutils.triggerKeyboardEvent(sDropdownInputId, KeyCodes.ARROW_DOWN, false, false, false);
		qutils.triggerKeyboardEvent(sDropdownInputId, KeyCodes.ARROW_DOWN, false, false, false);

		oDropdown2.focus();
	});

	QUnit.test("TestChangeOnFocusLostAfterUpDownOK_check", function(assert){
		var done = assert.async();
		// we do not expect (anymore) as different browsers handle events in different execution orders
		// and thus this is (unfortunately) not precisely predictable.
		// assert.expect(2); // two checks
		setTimeout( function(){
			assert.equal(oDropdown.getValue(), "third item", "DropdownBox' value should be \"third item\".");
			assert.equal(oDropdown.getInputDomRef().value, "third item", "ComboBox' selected value should be shown in HTML.");

			oDropdown.detachChange(oTest3);
			done();
		},100);
	});

	QUnit.test("TestCleanUp", function(assert) {
		assert.ok(!!sap.ui.getCore().byId("fi"), "fi must exist");
		assert.ok(!!sap.ui.getCore().byId("si"), "si must exist");
		assert.ok(!!sap.ui.getCore().byId("ti"), "ti must exist");
		assert.ok(!!sap.ui.getCore().byId("li"), "li must exist");
		oDropdown.destroy();
		assert.ok(!sap.ui.getCore().byId("fi"), "fi must no longer exist");
		assert.ok(!sap.ui.getCore().byId("si"), "si must no longer exist");
		assert.ok(!sap.ui.getCore().byId("ti"), "ti must no longer exist");
		assert.ok(!sap.ui.getCore().byId("li"), "li must no longer exist");
		assert.ok(!sap.ui.getCore().byId("ddb-shi"), "search help item must no longer exist");
		assert.ok(!sap.ui.getCore().byId("ddb-h-0"), "history item 0 must no longer exist");
		assert.ok(!sap.ui.getCore().byId("ddb-h-1"), "history item 1 must no longer exist");
		assert.ok(!sap.ui.getCore().byId("ddb-h-2"), "history item 2 must no longer exist");
		assert.ok(!sap.ui.getCore().byId("ddb-h-3"), "history item 3 must no longer exist");
		assert.ok(!sap.ui.getCore().byId("ddb-h-4"), "history item 4 must no longer exist");
		assert.ok(!sap.ui.getCore().byId("ddb-h-separator"), "history separator must no longer exist");
	});

	function resetBeforeTest(assert){
		var sNew = "first item";
		oDropdown.setValue(null); // one can reset a DropdownBox with null
		assert.equal(oDropdown.getValue(), sNew, "'DropdownBox' value should have changed.");
		assert.equal(oDropdown.getInputDomRef().value, sNew, "'DropdownBox' value should have changed in HTML.");
	}

	QUnit.module("SearchHelp");

	QUnit.test("Serch help item", function(assert) {
		var done = assert.async();
		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons");
		var oListBox = sap.ui.getCore().byId("ddb4-lb");
		oDropdown4.focus();
		// open list box to see search help item
		qutils.triggerEvent("click", "ddb4-icon");
		setTimeout( function(){
			assert.equal(oListBox.getItems()[0].getId(), "ddb4_shi", "Seach help item exists as first item");
			assert.equal(oListBox.getItems()[0].getText(), rb.getText("DDBX_SHI"), "Seach help item default text");
			assert.equal(oListBox.getItems()[0].getAdditionalText(), rb.getText("DDBX_SHIF4"), "Seach help item default additional text");
			assert.equal(oListBox.getItems()[0].getIcon(), sap.ui.resource("sap.ui.commons", "images/dropdown/ico12_f4.gif"), "Seach help item default icon");
			// close list box
			qutils.triggerEvent("click", "ddb4-icon");
			sap.ui.getCore().applyChanges();

			setTimeout( function(){
				// change texts and icon
				oDropdown4.setSearchHelpText("Test");
				oDropdown4.setSearchHelpAdditionalText("XX");
				oDropdown4.setSearchHelpIcon(sap.ui.resource("sap.ui.core", "mimes/logo/txtonly_16x16.ico"));
				// open list box to see search help item
				qutils.triggerEvent("click", "ddb4-icon");
				assert.equal(oListBox.getItems()[0].getText(), "Test", "Seach help item default text");
				assert.equal(oListBox.getItems()[0].getAdditionalText(), "XX", "Seach help item default additional text");
				assert.equal(oListBox.getItems()[0].getIcon(), sap.ui.resource("sap.ui.core", "mimes/logo/txtonly_16x16.ico"), "Seach help item default icon");
				// close list box
				qutils.triggerEvent("click", "ddb4-icon");
				done();
			},100);
		},100);

	});

	QUnit.test("Serch help event", function(assert) {
		var done = assert.async();
		// open list box to see search help item
		oDropdown4.focus();
		qutils.triggerEvent("click", "ddb4-icon");
		setTimeout( function(){

			qutils.triggerEvent("click", "ddb4_shi-txt");
			assert.ok(bSearchHelpFired, "Click on Search help item - serachHelp event fired");
			bSearchHelpFired = false;

			qutils.triggerKeyboardEvent("ddb4-input", KeyCodes.F4, false, false, false);
			assert.ok(bSearchHelpFired, "F4 on input field - serachHelp event fired");
			bSearchHelpFired = false;
			done();
		},100);
	});

	QUnit.module("Other");

	QUnit.test("Change items while open", function(assert) {
		var oListBox = sap.ui.getCore().byId("ddb4-lb");
		oDropdown4.focus();
		// open list box
		qutils.triggerEvent("click", "ddb4-icon");

		// add item
		var oItemX1 = new ListItem("X1",{text:"new Item", key: "X1"});
		oDropdown4.addItem(oItemX1);
		assert.equal(oDropdown4.getItems().length, 4, "addItem: number DropdownBox items (seach help item must be not included)");
		assert.equal(oListBox.getItems().length, 6, "addItem: number ListBox items (seach help item must be included)");

		// remove item
		oDropdown4.removeItem(oItemX1);
		assert.equal(oDropdown4.getItems().length, 3, "removeItem: number DropdownBox items (seach help item must be not included)");
		assert.equal(oListBox.getItems().length, 5, "removeItem: number ListBox items (seach help item must be included)");

		// insert item
		var oItemX2 = new ListItem("X2",{text:"new Item2", key: "X2"});
		oDropdown4.insertItem(oItemX2, 2);
		assert.equal(oDropdown4.getItems().length, 4, "insertItem: number DropdownBox items (seach help item must be not included)");
		assert.equal(oListBox.getItems().length, 6, "insertItem: number ListBox items (seach help item must be included)");

		// index of item
		assert.equal(oDropdown4.indexOfItem(oItemX2), 2, "index of DropdownBox item (seach help item must be not included)");
		assert.equal(oListBox.indexOfItem(oItemX2), 4, "index of ListBox item (seach help item must be included)");

		// remove all items
		var aItems = oDropdown4.removeAllItems();
		assert.equal(aItems.length, 4, "removeAllItems: number of removed items (seach help item must be not included)");
		assert.equal(oDropdown4.getItems().length, 0, "removeAllItems: number DropdownBox items (seach help item must be not included)");
		assert.equal(oListBox.getItems().length, 0, "removeAllItems: number ListBox items (no search help if no items)");

		// add new items to destroy them
		oDropdown4.addItem(oItemX1);
		oDropdown4.addItem(oItemX2);
		assert.equal(oDropdown4.getItems().length, 2, "addItem: number DropdownBox items (seach help item must be not included)");
		assert.equal(oListBox.getItems().length, 4, "addItem: number ListBox items (seach help item must be included)");
		oDropdown4.destroyItems();
		assert.equal(oDropdown4.getItems().length, 0, "destroyItems: number DropdownBox items (seach help item must be not included)");
		assert.equal(oListBox.getItems().length, 0, "destroyItems: number ListBox items (no search help if no items)");

		// close list box
		qutils.triggerEvent("click", "ddb4-icon");
	});

	QUnit.module("DataBinding");
	QUnit.test("initial binding", function(assert){
		// even if selectedKey is set before items it must be used after items are added
		assert.equal(oDropdown5.getValue(), "Item 2", "Text of second item must be set");
		assert.equal(oDropdown5.getDomRef("input").value, "Item 2", "Text of second item must be set in the HTML.");
		assert.equal(oDropdown5.getSelectedKey(), "I2", "Key of second item must be selected");
	});

	QUnit.test("update binding with key", function(assert){
		var done = assert.async();
		// even if selectedKey is set before items it must be used after items are added
		oModel.setProperty("/key", "IC");
		oModel.oData.items = [{text: "Item A", key: "IA"},
								{text: "Item B", key: "IB"},
								  {text: "Item C", key: "IC"}];
		oModel.checkUpdate();
		setTimeout(function(){
			assert.equal(oDropdown5.getValue(), "Item C", "Text of third item must be set");
			assert.equal(oDropdown5.getDomRef("input").value, "Item C", "Text of third item must be set in the HTML.");
			assert.equal(oDropdown5.getSelectedKey(), "IC", "Key of third item must be selected");
			done();
		},0);
	});

	QUnit.test("manual with ID", function(assert){
		// even if selectedItemId is set before items it must be used after items are added
	oDropdown5.setSelectedItemId("Item-Y");
		oDropdown5.removeAllItems();
		oDropdown5.addItem(new ListItem("Item-X",{text:"Item X", key:"IX"}));
		oDropdown5.addItem(new ListItem("Item-Z",{text:"Item Z", key:"IZ"}));
		oDropdown5.insertItem(new ListItem("Item-Y",{text:"Item Y", key:"IY"}), 1);
		assert.equal(oDropdown5.getValue(), "Item Y", "Text of second item must be set");
		assert.equal(oDropdown5.getDomRef("input").value, "Item Y", "Text of second item must be set in the HTML.");
		assert.equal(oDropdown5.getSelectedKey(), "IY", "Key of second item must be selected");
		assert.equal(oDropdown5.getSelectedItemId(), "Item-Y", "ID of second item must be selected");
	});

	QUnit.test("manual with Value", function(assert){
		// even if selectedItemId is set before items it must be used after items are added
	oDropdown5.setValue("Item F");
		oDropdown5.destroyItems();
		oDropdown5.addItem(new ListItem("Item-E",{text:"Item E", key:"IE"}));
		oDropdown5.addItem(new ListItem("Item-G",{text:"Item G", key:"IG"}));
		oDropdown5.insertItem(new ListItem("Item-F",{text:"Item F", key:"IF"}), 1);
		assert.equal(oDropdown5.getValue(), "Item F", "Text of second item must be set");
		assert.equal(oDropdown5.getDomRef("input").value, "Item F", "Text of second item must be set in the HTML.");
		assert.equal(oDropdown5.getSelectedKey(), "IF", "Key of second item must be selected");
		assert.equal(oDropdown5.getSelectedItemId(), "Item-F", "ID of second item must be selected");
	});
});