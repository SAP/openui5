/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/ComboBox",
	"sap/ui/core/ListItem",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	"sap/ui/commons/ListBox",
	"sap/ui/events/KeyCodes"
], function(
	qutils,
	createAndAppendDiv,
	ComboBox,
	ListItem,
	coreLibrary,
	JSONModel,
	jQuery,
	ListBox,
	KeyCodes
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3", "uiArea4", "uiArea5"]);
	(function(){
		var elem = document.createElement("A");
		elem.setAttribute("id", "backLink");
		elem.setAttribute("style", "display:none;");
		elem.setAttribute("href", "../ComboBox.html");
		document.body.appendChild(elem);
	}());


	var sCheckText = "some default value",
		sComboId = "testCmb",
		aAriaDescribedBy = ["D1","D2"],
		aAriaLabelledBy = ["L1","L2"],
		oCombo = new ComboBox(sComboId, {value: "",
			displaySecondaryValues: true,
			items : [
				new ListItem("fi",{text:"first item", additionalText: "(1)", key: "key1"}),
				new ListItem("si",{text:"second item", additionalText: "(2)", key: "key2"}),
				new ListItem("ti",{text:"third item", additionalText: "(3)", key: "key3"}),
				new ListItem("li",{text:"last item", additionalText: "(4)", key: "key4"})],
			ariaDescribedBy : aAriaDescribedBy,
			ariaLabelledBy : aAriaLabelledBy
			}),
		sComboInputId = sComboId + "-input",
		sComboIconId = sComboId + "-icon";

	oCombo.placeAt("uiArea1");

	var oCombo2 = new ComboBox(sComboId + "2", {editable: false, valueState: ValueState.Error});
	oCombo2.placeAt("uiArea2");

	var oCombo3 = new ComboBox(sComboId + "3", {visible: false});
	oCombo3.placeAt("uiArea3");

	var oModel = new JSONModel({
		items:[{text: "Item 1", key: "I1"},
			   {text: "Item 2", key: "I2"},
			   {text: "Item 3", key: "I3"}],
		key: "I2"
		});
	sap.ui.getCore().setModel(oModel);
	var oItemTemplate = new ListItem();
	oItemTemplate.bindProperty("text", "text").bindProperty("key", "key");
	var oCombo4 = new ComboBox(sComboId + "4").placeAt("uiArea4");
	oCombo4.bindProperty("selectedKey", "/key");
	oCombo4.bindAggregation("items", "/items", oItemTemplate);

	var oCombo5 = new ComboBox(sComboId + "5");
	oCombo5.placeAt("uiArea5");

	QUnit.module("Control Test - sap.ui.commons.ComboBox", {
		beforeEach: function(){
			oCombo.setValue(sCheckText);
			oCombo.focus();
		} //, afterEach: function(){}
	});

	QUnit.test("TestRenderedOK", function(assert){
		assert.notEqual(oCombo.getDomRef(), null, "ComboBox outer HTML Element should be rendered.");
		assert.equal(jQuery("#testCmb > input").length, 1, "ComboBox should provide an input element.");
		assert.equal(oCombo.getValue(), sCheckText, "Default value / text should still be set.");
		assert.equal(document.getElementById(sComboInputId).value, sCheckText, "Default value / text should be in the HTML.");
		assert.equal(oCombo.getFocusDomRef().value, sCheckText, "Default value / text should be in the HTML and accessible via getDomRef.");

		// in jQuery 1.6.2 this has changed
		assert.ok((jQuery("#testCmb2 > input").attr("readonly")) || (jQuery("#testCmb2 > input").prop("readonly")) , "Second DropdownBox should be read only.");

		assert.equal(jQuery("#testCmb3").length, 0, "Third (invisible) ComboBox should not be rendered at all.");
	});

	QUnit.test("DomRef test", function(assert) {
		assert.equal( oCombo.getFocusDomRef().id, sComboInputId, "FocusDomRef on input tag" );
		assert.equal( oCombo.getInputDomRef().id, sComboInputId, "InputDomRef on input tag" );
		assert.equal( oCombo.getIdForLabel(), sComboInputId, "Label points to input tag" );
	});

	QUnit.test("ARIA", function(assert) {
		var oCB = oCombo.$();
		var oCBInput = jQuery("#testCmb > input");
		//var oCB2 = oCombo2.$();
		var oCBInput2 = jQuery("#testCmb2 > input");
		assert.equal(oCB.attr("role"), "combobox", "Role");
		assert.equal(oCB.attr("aria-owns"), "testCmb-input testCmb-lb", "aria-owns");
		assert.equal(oCBInput.attr("aria-describedby"), "D1 D2 testCmb-SecVal", "aria-describesby");
		assert.equal(oCBInput.attr("aria-labelledby"), "L1 L2", "aria-labelledby");
		assert.equal(oCBInput.attr("aria-live"), "polite", "aria-live");
		assert.equal(oCBInput.attr("aria-autocomplete"), "inline", "aria-autocomplete");
		assert.ok(!oCBInput.attr("aria-invalid"), "aria-invalid");
		assert.equal(oCBInput2.attr("aria-invalid"), "true", "aria-invalid");
		assert.equal(oCBInput.attr("aria-setsize"), "4", "aria-setsize");
		assert.ok(!oCBInput.attr("aria-posinset"), "aria-posinset");
	});

	QUnit.test("Setter / Getter", function(assert){
		var oCBInput = jQuery("#testCmb > input");
		oCombo.setValue("second item");
		assert.equal(oCombo.getValue(), "second item", "setValue: value");
		assert.equal(oCombo.getSelectedKey(), "key2", "setValue: selectedKey");
		assert.equal(oCombo.getSelectedItemId(), "si", "setValue: selectedId");
		assert.equal(oCBInput.attr("aria-posinset"),"2", "setValue: aria-posinset");

		oCombo.setSelectedKey("key3");
		assert.equal(oCombo.getValue(), "third item", "setSelectedKey: value");
		assert.equal(oCombo.getSelectedKey(), "key3", "setSelectedKey: selectedKey");
		assert.equal(oCombo.getSelectedItemId(), "ti", "setSelectedKey: selectedId");
		assert.equal(oCBInput.attr("aria-posinset"),"3", "setSelectedKey: aria-posinset");

		oCombo.setSelectedItemId("fi");
		assert.equal(oCombo.getValue(), "first item", "setSelectedItemId: value");
		assert.equal(oCombo.getSelectedKey(), "key1", "setSelectedItemId: selectedKey");
		assert.equal(oCombo.getSelectedItemId(), "fi", "setSelectedItemId: selectedId");
		assert.equal(oCBInput.attr("aria-posinset"),"1", "setSelectedItemId: aria-posinset");

		oCombo.setValue("xxx");
		assert.equal(oCombo.getValue(), "xxx", "setValue: value");
		assert.equal(oCombo.getSelectedKey(), "", "setValue: selectedKey");
		assert.equal(oCombo.getSelectedItemId(), "", "setValue: selectedId");
		assert.ok(!oCBInput.attr("aria-posinset"), "setValue: aria-posinset");
	});

	QUnit.test("Misc.", function(assert){
		// empty ComboBox without value and items must not have a ListBox after Rendering
		assert.ok(!oCombo5._oListBox, "Empty ComboBox has not ListBox");
		assert.ok(!sap.ui.getCore().byId(oCombo5.getId() + "-lb"), "no ListBox Control exists for empty ComboBox");
	});

	var oSharedListBox1, oSharedListBox2, oComboBox1, oComboBox2;

	QUnit.module("Shared listBox");

	QUnit.test("SetUp", function(assert) {
		oComboBox1 = new ComboBox({
			listBox: "sharedListBox"
		});
		oSharedListBox1 = new ListBox("sharedListBox", {
			items : [
				new ListItem({text:"first item", additionalText: "(1)", key: "key1"}),
				new ListItem({text:"second item", additionalText: "(2)", key: "key2"}),
				new ListItem({text:"third item", additionalText: "(3)", key: "key3"}),
				new ListItem({text:"last item", additionalText: "(4)", key: "key4"})
			]
		});
		oComboBox2 = new ComboBox({
			listBox: oSharedListBox1
		});

		assert.ok(oComboBox1._getListBox() === oSharedListBox1, "oCB1.listBox should reference listBox");
		assert.ok(oComboBox2._getListBox() === oSharedListBox1, "oCB2.listBox should reference listBox");

	});

	QUnit.test("Replace ListBox", function(assert) {
		oSharedListBox2 = new ListBox("sharedListBox2", {
			items : [
				new ListItem({text:"first item", additionalText: "(1)", key: "key1"}),
				new ListItem({text:"second item", additionalText: "(2)", key: "key2"}),
				new ListItem({text:"third item", additionalText: "(3)", key: "key3"}),
				new ListItem({text:"last item", additionalText: "(4)", key: "key4"})
			]
		});
		assert.ok(oComboBox1._getListBox() === oSharedListBox1, "oCB1.listBox still should reference listBox1");
		oComboBox1.setListBox(oSharedListBox2);
		assert.ok(oComboBox1._getListBox() === oSharedListBox2, "oCB1.listBox should reference listBox2");
		assert.ok(oComboBox2._getListBox() === oSharedListBox1, "oCB2.listBox still should reference listBox");
	});

	QUnit.test("Cleanup", function(assert) {
		oComboBox1.destroy();
		oComboBox1 = null;
		oComboBox2.destroy();
		oComboBox2 = null;
		assert.ok(oSharedListBox1.getParent() == null, "oListBox still should be alive");
		assert.ok(oSharedListBox2.getParent() == null, "oListBox still should be alive");
		oSharedListBox1.destroy();
		oSharedListBox1 = null;
		oSharedListBox2.destroy();
		oSharedListBox2 = null;
	});

	QUnit.module("Autocomplete Tests - sap.ui.commons.ComboBox", {
		beforeEach: function(){
			oCombo.focus();
		}
	});

	QUnit.test("TestInputOK", function(assert){
		resetBeforeTest(assert);
		qutils.triggerCharacterInput(sComboInputId, "s");
	});
	QUnit.test("TestInputAutocompleteOK", function(assert){
		var done = assert.async();
		setTimeout(function(){
			assert.equal(oCombo.getValue(), "", "ComboBox' value should not have been autocompleted, yet.");
			assert.equal(oCombo.getFocusDomRef().value, "second item", "ComobBox' value should have changed in HTML.");
			assert.equal(oCombo.getSelectedKey(), "", "selectedKey should not be set yet");
			assert.equal(oCombo.getSelectedItemId(), "", "selectedItemId should not be set yet");

			qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ENTER, false, false, false);

			assert.equal(oCombo.getValue(), "second item", "ComboBox' value should have been autocompleted.");
			assert.equal(oCombo.getFocusDomRef().value, "second item", "ComobBox' value should not change after autocomplete in HTML.");
			assert.equal(oCombo.getSelectedKey(), "key2", "selectedKey should fit to the selected item");
			assert.equal(oCombo.getSelectedItemId(), "si", "selectedItemId should fit to the selected item");
			done();
		}, 500);
	});

	QUnit.test("TestMultipleInputOK", function(assert){
		resetBeforeTest(assert);
		jQuery.each("third".split(''), function(idx, val){
			qutils.triggerCharacterInput(sComboInputId, val);
		});
	});
	QUnit.test("TestMultipleInputAutocompleteOK", function(assert){
		var done = assert.async();
		setTimeout(function(){
			assert.equal(oCombo.getValue(), "", "ComboBox' value should not have been autocompleted, yet.");
			assert.equal(oCombo.getFocusDomRef().value, "third item", "ComobBox' value should have changed in HTML.");
			assert.equal(oCombo.getSelectedKey(), "", "selectedKey should not be set yet");
			assert.equal(oCombo.getSelectedItemId(), "", "selectedItemId should not be set yet");

			qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ENTER, false, false, false);

			assert.equal(oCombo.getValue(), "third item", "ComboBox' value should have been autocompleted.");
			assert.equal(oCombo.getFocusDomRef().value, "third item", "ComobBox' value should not change after autocomplete in HTML.");
			assert.equal(oCombo.getSelectedKey(), "key3", "selectedKey should fit to the selected item");
			assert.equal(oCombo.getSelectedItemId(), "ti", "selectedItemId should fit to the selected item");

			done();
		}, 500);
	});

	QUnit.test("TestEscape", function(assert){
		qutils.triggerCharacterInput(sComboInputId, "X");

		assert.equal(oCombo.getValue(), "third item", "ComboBox' value should have not been changed.");
		assert.equal(oCombo.getFocusDomRef().value, "third itemX", "ComboBox' value should have changed in HTML.");
		assert.equal(oCombo.getSelectedKey(), "key3", "selectedKey should not have changed");
		assert.equal(oCombo.getSelectedItemId(), "ti", "selectedItemId should not have changed");

		qutils.triggerKeyEvent("keydown", sComboInputId, KeyCodes.ESCAPE);
		qutils.triggerKeyEvent("keypress", sComboInputId, KeyCodes.ESCAPE);

		assert.equal(oCombo.getValue(), "third item", "ComboBox' value should have not been changed.");
		assert.equal(oCombo.getFocusDomRef().value, "third item", "ComboBox' value should have been set back in HTML.");
		assert.equal(oCombo.getSelectedKey(), "key3", "selectedKey should not have changed");
		assert.equal(oCombo.getSelectedItemId(), "ti", "selectedItemId should not have changed");
	});

	QUnit.module("Arrow Control Tests - sap.ui.commons.ComboBox", {
		beforeEach: function(){
			oCombo.focus();
		}
	});

	QUnit.test("TestArrowDownOK", function(assert){
		resetBeforeTest(assert);

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ARROW_DOWN, false, false, false);
		assert.equal(oCombo.getValue(), "", "ComboBox' value should not have changed in HTML.");
		assert.equal(oCombo.getFocusDomRef().value, "first item", "ComobBox' value should have changed in HTML.");

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ARROW_DOWN, false, false, false);
		assert.equal(oCombo.getValue(), "", "ComboBox' value should not have changed in HTML.");
		assert.equal(oCombo.getFocusDomRef().value, "second item", "ComobBox' value should have changed in HTML.");

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ARROW_DOWN, false, false, false);
		assert.equal(oCombo.getValue(), "", "ComboBox' value should not have changed in HTML.");
		assert.equal(oCombo.getFocusDomRef().value, "third item", "ComobBox' value should have changed in HTML.");

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ARROW_DOWN, false, false, false);
		assert.equal(oCombo.getValue(), "", "ComboBox' value should not have changed in HTML.");
		assert.equal(oCombo.getFocusDomRef().value, "last item", "ComobBox' value should have changed in HTML.");

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ARROW_DOWN, false, false, false);
		assert.equal(oCombo.getValue(), "", "ComboBox' value should not have changed in HTML.");
		assert.equal(oCombo.getFocusDomRef().value, "last item", "ComobBox' value should have changed in HTML.");

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ENTER, false, false, false);

		assert.equal(oCombo.getValue(), "last item", "ComboBox' value should hold selected value.");
		assert.equal(oCombo.getFocusDomRef().value, "last item", "ComobBox' value should not have changed in HTML.");
		assert.equal(oCombo.getSelectedKey(), "key4", "selectedKey should fit to the selected item");
		assert.equal(oCombo.getSelectedItemId(), "li", "selectedItemId should fit to the selected item");

	});

	QUnit.test("TestArrowUpOK", function(assert){
		assert.equal(oCombo.getValue(), "last item", "ComboBox' value should be last item.");
		assert.equal(oCombo.getFocusDomRef().value, "last item", "ComobBox' value should match to HTML.");

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ARROW_UP, false, false, false);
		assert.equal(oCombo.getValue(), "last item", "ComboBox' value should not have changed in HTML.");
		assert.equal(oCombo.getFocusDomRef().value, "third item", "ComobBox' value should have changed in HTML.");

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ARROW_UP, false, false, false);
		assert.equal(oCombo.getValue(), "last item", "ComboBox' value should not have changed in HTML.");
		assert.equal(oCombo.getFocusDomRef().value, "second item", "ComobBox' value should have changed in HTML.");

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ARROW_UP, false, false, false);
		assert.equal(oCombo.getValue(), "last item", "ComboBox' value should not have changed in HTML.");
		assert.equal(oCombo.getFocusDomRef().value, "first item", "ComobBox' value should have changed in HTML.");

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ARROW_UP, false, false, false);
		assert.equal(oCombo.getValue(), "last item", "ComboBox' value should not have changed in HTML.");
		assert.equal(oCombo.getFocusDomRef().value, "first item", "ComobBox' value should have changed in HTML.");

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ENTER, false, false, false);

		assert.equal(oCombo.getValue(), "first item", "ComboBox' value should hold selected value.");
		assert.equal(oCombo.getFocusDomRef().value, "first item", "ComobBox' value should not have changed in HTML.");
		assert.equal(oCombo.getSelectedKey(), "key1", "selectedKey should fit to the selected item");
		assert.equal(oCombo.getSelectedItemId(), "fi", "selectedItemId should fit to the selected item");
	});

	QUnit.module("Misc. Keys Control Tests - sap.ui.commons.ComboBox", {
		beforeEach: function(){
			oCombo.focus();
		}
	});

	QUnit.test("TestEndOK", function(assert){
		resetBeforeTest(assert);

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.END, false, false, false);
		assert.equal(oCombo.getValue(), "", "ComboBox' value should not have changed when not proposal list not open.");
		assert.equal(oCombo.getFocusDomRef().value, "", "ComobBox' value should not have changed in HTML when not proposal list not open.");
		assert.equal(oCombo.getSelectedKey(), "", "selectedKey should not have changed");
		assert.equal(oCombo.getSelectedItemId(), "", "selectedItemId should not have changed");
	});

	QUnit.test("TestHomeOK", function(assert){
		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.HOME, false, false, false);
		assert.equal(oCombo.getValue(), "", "ComboBox' value should not have changed when not proposal list not open.");
		assert.equal(oCombo.getFocusDomRef().value, "", "ComobBox' value should not have changed in HTML when not proposal list not open.");
		assert.equal(oCombo.getSelectedKey(), "", "selectedKey should not have changed");
		assert.equal(oCombo.getSelectedItemId(), "", "selectedItemId should not have changed");
	});

	QUnit.test("TestPageDownOK", function(assert){
		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.PAGE_DOWN, false, false, false);
		assert.ok(true, "Implementation pending. Specification prio 3");
	});

	QUnit.test("TestPageUpOK", function(assert){
		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.PAGE_UP, false, false, false);
		assert.ok(true, "Implementation pending. Specification prio 3");
	});


	QUnit.module("Open / Close Tests - sap.ui.commons.ComboBox", {
		beforeEach: function(){
			oCombo.focus();
		}
	});

	QUnit.test("TestOpenCloseViaKeyboardF4OK", function(assert){
		var done = assert.async();
		resetBeforeTest(assert);

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.F4, false, false, false);
		setTimeout( function(){
			// as Popup calls fireOpended for IE9 async
			assert.ok(oCombo.$("lb").is(":visible"), "ListBox should be visible after F4 press");

			qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.F4, false, false, false);
			assert.ok(oCombo.$("lb").is(":hidden"), "ListBox should be hidden after second F4 press");
			done();
		}, 10);

	});

	QUnit.test("TestOpenCloseViaKeyboardARROWOK", function(assert){
		var done = assert.async();
		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ARROW_DOWN, false, true, false);
		setTimeout( function(){
			// as Popup calls fireOpended for IE9 async
			assert.ok(oCombo.$("lb").is(":visible"), "ListBox should be visible after Alt + Arrow Down press");

			qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ARROW_UP, false, true, false);
			assert.ok(oCombo.$("lb").is(":hidden"), "ListBox should be hidden after Alt + Arrow Up press");
			done();
		}, 10);

	});

	QUnit.test("TestOpenCloseViaMouseOK", function(assert){
		var done = assert.async();
		resetBeforeTest(assert);

		qutils.triggerEvent("click", sComboIconId);
		setTimeout( function(){
			// as Popup calls fireOpended for IE9 async
			assert.ok(oCombo.$("lb").is(":visible"), "ListBox should be visible after click on F4 help button");

			qutils.triggerEvent("click", sComboIconId);
			assert.ok(oCombo.$("lb").is(":hidden"), "ListBox should be hidden after second click on F4 help button");
			done();
		}, 10);

	});

	QUnit.module("Mouse Handling Tests - sap.ui.commons.ComboBox", {
		beforeEach: function(assert){
			resetBeforeTest(assert);
			oCombo.focus();
			this.handleChange = function(){
				assert.ok(true, "ComboBox event handler change was triggered.");
			};
			oCombo.attachChange(this.handleChange);
		},
		afterEach: function(){
			oCombo.detachChange(this.handleChange);
		}
	});

	QUnit.test("TestSelectItemFromListOK", function(assert){
		var done = assert.async();
		assert.expect(16); // two from reset, 12 from this method and 2 from the event handler (initiated via click events)

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.F4, false, false, false);
		setTimeout( function(){
			// as Popup calls fireOpended for IE9 async
			assert.ok(oCombo.$("lb").is(":visible"), "ListBox should be visible after F4 press");

			qutils.triggerEvent("click", "si-txt");
			assert.equal(oCombo.getValue(), "second item", "ComboBox' second item should have been selected.");
			assert.equal(oCombo.getFocusDomRef().value, "second item", "ComobBox' selected value should be shown in HTML.");
			assert.equal(oCombo.getSelectedKey(), "key2", "selectedKey should fit to the selected item");
			assert.equal(oCombo.getSelectedItemId(), "si", "selectedItemId should fit to the selected item");

			assert.ok(oCombo.$("lb").is(":hidden"), "ListBox should be hidden after item selection");

			qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.F4, false, false, false);
			assert.ok(oCombo.$("lb").is(":visible"), "ListBox should be visible after F4 press");

			qutils.triggerEvent("click", "li-txt");
			assert.equal(oCombo.getValue(), "last item", "ComboBox' second item should have been selected.");
			assert.equal(oCombo.getFocusDomRef().value, "last item", "ComobBox' selected value should be shown in HTML.");
			assert.equal(oCombo.getSelectedKey(), "key4", "selectedKey should fit to the selected item");
			assert.equal(oCombo.getSelectedItemId(), "li", "selectedItemId should fit to the selected item");

			assert.ok(oCombo.$("lb").is(":hidden"), "ListBox should be hidden after item selection");
			done();
		}, 10);
	});


	QUnit.module("Misc. Keys Control Tests with open Listbox - sap.ui.commons.ComboBox", {
		beforeEach: function(){
			oCombo.focus();
		}
	});

	QUnit.test("TestEndWhenOpenedOK", function(assert){
		var done = assert.async();
		resetBeforeTest(assert);

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.F4, false, false, false);
		setTimeout( function(){
			// as Popup calls fireOpended for IE9 async
			assert.ok(oCombo.$("lb").is(":visible"), "ListBox should be visible after F4 press");

			qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.END, false, false, false);
			assert.equal(oCombo.getValue(), "", "ComboBox' value should not have changed in HTML.");
			assert.equal(oCombo.getFocusDomRef().value, "last item", "ComobBox' value should match to HTML.");
			assert.equal(oCombo.getSelectedKey(), "", "selectedKey should not have changed");
			assert.equal(oCombo.getSelectedItemId(), "", "selectedItemId should not have changed");

			// also check that second 'END' stays the same
			qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.END, false, false, false);
			assert.equal(oCombo.getValue(), "", "ComboBox' value should not have changed in HTML.");
			assert.equal(oCombo.getFocusDomRef().value, "last item", "ComobBox' value should match to HTML.");
			assert.equal(oCombo.getSelectedKey(), "", "selectedKey should not have changed");
			assert.equal(oCombo.getSelectedItemId(), "", "selectedItemId should not have changed");

			qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.F4, false, false, false);
			assert.ok(oCombo.$("lb").is(":hidden"), "ListBox should be hidden again after second F4 press");

			assert.equal(oCombo.getValue(), "", "ComboBox' value should not have changed in HTML.");
			assert.equal(oCombo.getFocusDomRef().value, "last item", "ComobBox' value should match to HTML.");
			assert.equal(oCombo.getSelectedKey(), "", "selectedKey should not have changed");
			assert.equal(oCombo.getSelectedItemId(), "", "selectedItemId should not have changed");

			qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ENTER, false, false, false);

			assert.equal(oCombo.getValue(), "last item", "ComboBox' value should hold selected value.");
			assert.equal(oCombo.getFocusDomRef().value, "last item", "ComobBox' value should not have changed in HTML.");
			assert.equal(oCombo.getSelectedKey(), "key4", "selectedKey should fit to the selected item");
			assert.equal(oCombo.getSelectedItemId(), "li", "selectedItemId should fit to the selected item");
			done();
		}, 10);
	});

	QUnit.test("TestHomeWhenOpenedOK", function(assert){
		var done = assert.async();
		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.F4, false, false, false);
		setTimeout( function(){
			// as Popup calls fireOpended for IE9 async
			assert.ok(oCombo.$("lb").is(":visible"), "ListBox should be visible after F4 press");

			qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.HOME, false, false, false);
			assert.equal(oCombo.getValue(), "last item", "ComboBox' value should not have changed in HTML.");
			assert.equal(oCombo.getFocusDomRef().value, "first item", "ComobBox' value should have changed in HTML.");
			assert.equal(oCombo.getSelectedKey(), "key4", "selectedKey should not have changed");
			assert.equal(oCombo.getSelectedItemId(), "li", "selectedItemId should not have changed");

			// also check that second 'Home' stays the same
			qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.HOME, false, false, false);
			assert.equal(oCombo.getValue(), "last item", "ComboBox' value should not have changed in HTML.");
			assert.equal(oCombo.getFocusDomRef().value, "first item", "ComobBox' value should not have changed in HTML.");
			assert.equal(oCombo.getSelectedKey(), "key4", "selectedKey should not have changed");
			assert.equal(oCombo.getSelectedItemId(), "li", "selectedItemId should not have changed");

			qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.F4, false, false, false);
			assert.ok(oCombo.$("lb").is(":hidden"), "ListBox should be hidden again after second F4 press");

			qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ENTER, false, false, false);

			assert.equal(oCombo.getValue(), "first item", "ComboBox' value should hold selected value.");
			assert.equal(oCombo.getFocusDomRef().value, "first item", "ComobBox' value should not have changed in HTML.");
			assert.equal(oCombo.getSelectedKey(), "key1", "selectedKey should fit to the selected item");
			assert.equal(oCombo.getSelectedItemId(), "fi", "selectedItemId should fit to the selected item");
			done();
		}, 10);
	});

	QUnit.module("Event Tests - sap.ui.commons.ComboBox", {
		beforeEach: function(assert){
			oCombo.focus();
			this.handleChange = function(){
				assert.ok(true, "ComboBox event handler change was triggered.");
			};
			oCombo.attachChange(this.handleChange);
		},
		afterEach: function(){
			oCombo.detachChange(this.handleChange);
		}
	});

	QUnit.test("TestChangeOnEnterAfterTextInputOK", function(assert){
		assert.expect(7); // two from cleanup + two from the event handler + 3 check
		resetBeforeTest(assert);

		var sText = "Some new value";
		var oTest = function(oEvent) {
			assert.equal(oEvent.getParameter("newValue"), sText, "Entered value should be provided as Event parameter");
		};
		oCombo.attachChange(oTest);

		jQuery.each(sText.split(''), function(idx, val){
			qutils.triggerCharacterInput(sComboInputId, val);
		});
		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ENTER, false, false, false);

		assert.equal(oCombo.getValue(), sText, "ComboBox should provide new value via getter method.");
		assert.equal(oCombo.getSelectedKey(), "", "selectedKey should fit to the selected item");
		assert.equal(oCombo.getSelectedItemId(), "", "selectedItemId should fit to the selected item");

		oCombo.detachChange(oTest);
	});

	var sText = "Some other value";
	var oTest1 = function(oEvent) {
		QUnit.config.current.assert.equal(oEvent.getParameter("newValue"), sText, "Entered value should be provided as Event parameter");
	};

	QUnit.test("TestChangeOnFocusLostAfterTextInputOK", function(assert){
		// we do not expect (anymore) as different browsers handle events in different execution orders
		// and thus this is (unfortunately) not precisely predictable.
		// assert.expect(4); // two from cleanup + two from the event handler
		resetBeforeTest(assert);
		oCombo.attachChange(oTest1);

		jQuery.each(sText.split(''), function(idx, val){
			qutils.triggerCharacterInput(sComboInputId, val);
		});
		oCombo2.focus();
	});

	QUnit.test("TestChangeOnFocusLostAfterTextInputOK_check", function(assert){
		var done = assert.async();
		// we do not expect (anymore) as different browsers handle events in different execution orders
		// and thus this is (unfortunately) not precisely predictable.
		// assert.expect(1); // 1 check
		setTimeout( function(){
			assert.equal(oCombo.getValue(), sText, "ComboBox should provide new value via getter method.");

			oCombo.detachChange(oTest1);
			done();
		}, 100);
	});

	var oTest2 = function(oEvent) {
		QUnit.config.current.assert.equal(oEvent.getParameter("newValue"), "second item", "Entered value should be provided as Event parameter");
	};

	QUnit.test("TestChangeOnEnterAfterUpDownOK", function(assert){
		assert.expect(8); // two from cleanup + two from the event handler + 4 checks
		resetBeforeTest(assert);

		oCombo.attachChange(oTest2);

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ARROW_DOWN, false, false, false);
		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ARROW_DOWN, false, false, false);

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ENTER, false, false, false);

		assert.equal(oCombo.getValue(), "second item", "ComboBox' value should be \"second item\".");
		assert.equal(oCombo.getInputDomRef().value, "second item", "ComobBox' selected value should be shown in HTML.");
		assert.equal(oCombo.getSelectedKey(), "key2", "selectedKey should fit to the selected item");
		assert.equal(oCombo.getSelectedItemId(), "si", "selectedItemId should fit to the selected item");

		oCombo.detachChange(oTest2);
	});

	var oTest3 = function(oEvent) {
		QUnit.config.current.assert.equal(oEvent.getParameter("newValue"), "third item", "Entered value should be provided as Event parameter");
	};

	QUnit.test("TestChangeOnFocusLostAfterUpDownOK", function(assert){
		// we do not expect (anymore) as different browsers handle events in different execution orders
		// and thus this is (unfortunately) not precisely predictable.
		// assert.expect(4); // two from cleanup plus two from event handler (focusleave)
		resetBeforeTest(assert);

		oCombo.attachChange(oTest3);

		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ARROW_DOWN, false, false, false);
		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ARROW_DOWN, false, false, false);
		qutils.triggerKeyboardEvent(sComboInputId, KeyCodes.ARROW_DOWN, false, false, false);

		oCombo2.focus();
	});

	QUnit.test("TestChangeOnFocusLostAfterUpDownOK_check", function(assert){
		var done = assert.async();
		// we do not expect (anymore) as different browsers handle events in different execution orders
		// and thus this is (unfortunately) not precisely predictable.
		// assert.expect(2); // two checks
		setTimeout( function(){
			assert.equal(oCombo.getValue(), "third item", "ComboBox' value should be \"third item\".");
			assert.equal(oCombo.getInputDomRef().value, "third item", "ComobBox' selected value should be shown in HTML.");
			assert.equal(oCombo.getSelectedKey(), "key3", "selectedKey should fit to the selected item");
			assert.equal(oCombo.getSelectedItemId(), "ti", "selectedItemId should fit to the selected item");

			oCombo.detachChange(oTest3);
			done();
		},100);
	});

	QUnit.test("TestCleanUp", function(assert){
		assert.ok(!!sap.ui.getCore().byId("fi"), "fi must exist");
		assert.ok(!!sap.ui.getCore().byId("si"), "si must exist");
		assert.ok(!!sap.ui.getCore().byId("ti"), "ti must exist");
		assert.ok(!!sap.ui.getCore().byId("li"), "li must exist");
		oCombo.destroy();
		assert.ok(!sap.ui.getCore().byId("fi"), "fi must no longer exist");
		assert.ok(!sap.ui.getCore().byId("si"), "si must no longer exist");
		assert.ok(!sap.ui.getCore().byId("ti"), "ti must no longer exist");
		assert.ok(!sap.ui.getCore().byId("li"), "li must no longer exist");
	});

	function resetBeforeTest(assert) {
		var sNew = "";
		oCombo.setValue(sNew);
		assert.equal(oCombo.getValue(), sNew, "ComobBox' value should have changed.");
		assert.equal(oCombo.getFocusDomRef().value, sNew, "ComobBox' value should have changed in HTML.");
	}

	/*QUnit.done = function(failures, total){
		oCombo.attachChange(function (oEvent){
			if(oEvent.getParameter("newValue") === "back");
				jQuery("#backLink").show();
		});
	};*/

	QUnit.module("DataBinding");
	QUnit.test("initial binding", function(assert){
		// even if selectedKey is set before items it must be used after items are added
		assert.equal(oCombo4.getValue(), "Item 2", "Text of second item must be set");
		assert.equal(oCombo4.getDomRef("input").value, "Item 2", "Text of second item must be set in the HTML.");
		assert.equal(oCombo4.getSelectedKey(), "I2", "Key of second item must be selected");
	});

	QUnit.test("update binding with key", function(assert){
		var done = assert.async();
		// even if selectedKey is set before items it must be used after items are added
		oModel.setProperty("/key", "IC");
		oModel.oData.items = [{text: "Item A", key: "IA"},
							  {text: "Item B", key: "IB"},
							  {text: "Item C", key: "IC"}];
		oModel.checkUpdate();
		setTimeout( function() {
			assert.equal(oCombo4.getValue(), "Item C", "Text of third item must be set");
			assert.equal(oCombo4.getDomRef("input").value, "Item C", "Text of third item must be set in the HTML.");
			assert.equal(oCombo4.getSelectedKey(), "IC", "Key of third item must be selected");
			done();
		},0);
	});

	QUnit.test("update binding without key", function(assert){
		var done = assert.async();
		// selectd key not changed and item still exist, so it should be still selected.
		oModel.oData.items = [{text: "Item C", key: "IC"},
							  {text: "Item D", key: "ID"},
							  {text: "Item E", key: "IE"}];
		oModel.checkUpdate();
		setTimeout( function() {
			assert.equal(oCombo4.getValue(), "Item C", "Text must not be changed");
			assert.equal(oCombo4.getDomRef("input").value, "Item C", "Text of third item must not be changed in the HTML.");
			assert.equal(oCombo4.getSelectedKey(), "IC", "Key must not be changed");
			done();
		},0);
	});

	QUnit.test("manual with ID", function(assert){
		// even if selectedItemId is set before items it must be used after items are added
		oCombo4.setSelectedItemId("Item-Y");
		oCombo4.removeAllItems();
		oCombo4.addItem(new ListItem("Item-X",{text:"Item X", key:"IX"}));
		oCombo4.addItem(new ListItem("Item-Z",{text:"Item Z", key:"IZ"}));
		oCombo4.insertItem(new ListItem("Item-Y",{text:"Item Y", key:"IY"}), 1);
		assert.equal(oCombo4.getValue(), "Item Y", "Text of second item must be set");
		assert.equal(oCombo4.getDomRef("input").value, "Item Y", "Text of second item must be set in the HTML.");
		assert.equal(oCombo4.getSelectedKey(), "IY", "Key of second item must be selected");
		assert.equal(oCombo4.getSelectedItemId(), "Item-Y", "ID of second item must be selected");
	});
});