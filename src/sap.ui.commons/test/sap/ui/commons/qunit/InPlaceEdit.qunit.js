/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/TextField",
	"sap/ui/commons/InPlaceEdit",
	"sap/ui/commons/ComboBox",
	"sap/ui/core/ListItem",
	"sap/ui/commons/DropdownBox",
	"sap/ui/commons/Link",
	"sap/ui/core/library",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes"
], function(
	qutils,
	createAndAppendDiv,
	TextField,
	InPlaceEdit,
	ComboBox,
	ListItem,
	DropdownBox,
	Link,
	coreLibrary,
	jQuery,
	KeyCodes
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3", "uiArea4", "uiArea5", "uiArea6", "uiArea7"]);



	var sStartText = "Hello world!";
	var sTooltip = "Tooltip";

	var oTextField1 = new TextField("TF1", {
		value: sStartText,
		tooltip: sTooltip,
		width: "200px",
		required: true
	});

	var oIPE1 = new InPlaceEdit("IPE1",{
		content: oTextField1
	}).placeAt("uiArea1");

	// with simple TextField readonly
	var oTextField2 = new TextField("TF2", {
		value: sStartText,
		tooltip: sTooltip,
		width: "200px",
		enabled: false
	});

	var oIPE2 = new InPlaceEdit("IPE2",{
		content: oTextField2
	}).placeAt("uiArea2");

	// with simple TextField invisible
	var oTextField3 = new TextField("TF3", {
		value: sStartText,
		tooltip: sTooltip,
		width: "200px",
		visible: false
	});

	new InPlaceEdit("IPE3",{
		content: oTextField3
	}).placeAt("uiArea3");

	// with ComboBox
	var oComboBox = new ComboBox("CB1", {
		value: sStartText,
		tooltip: sTooltip,
		width: "200px",
		items: [new ListItem("Day1",{text: "Monday", key: "Mo"}),
				new ListItem("Day2",{text: "Tuesday", key: "Tu"}),
				new ListItem("Day3",{text: "Wednesday", key: "Mi"}),
				new ListItem("Day4",{text: "Thursday", key: "Th"}),
				new ListItem("Day5",{text: "Friday", key: "Fr"}),
				new ListItem("Day6",{text: "Saturday", key: "Sa"}),
				new ListItem("Day7",{text: "Sunday", key: "Su"})]
	});

	var oIPE4 = new InPlaceEdit("IPE4",{
		content: oComboBox
	}).placeAt("uiArea4");

	// with DropdownBox
	var oDropdownBox = new DropdownBox("DdB1", {
		value: sStartText,
		tooltip: sTooltip,
		width: "200px",
		items: [new ListItem("Day1a",{text: "Monday", key: "Mo"}),
				new ListItem("Day2a",{text: "Tuesday", key: "Tu"}),
				new ListItem("Day3a",{text: "Wednesday", key: "Mi"}),
				new ListItem("Day4a",{text: "Thursday", key: "Th"}),
				new ListItem("Day5a",{text: "Friday", key: "Fr"}),
				new ListItem("Day6a",{text: "Saturday", key: "Sa"}),
				new ListItem("Day7a",{text: "Sunday", key: "Su"})]
	});

	var oIPE5 = new InPlaceEdit("IPE5",{
		content: oDropdownBox
	}).placeAt("uiArea5");

	// with Link
	var oLink1 = new Link("Link1", {
		text: sStartText,
		tooltip: sTooltip,
		href: "http://www.sap.com",
		width: "200px"
	});

	var oIPE6 = new InPlaceEdit("IPE6",{
		content: oLink1
	}).placeAt("uiArea6");

	// without undo
	var oTextField4 = new TextField("TF4", {
		value: sStartText,
		tooltip: sTooltip,
		width: "200px",
		required: true
	});

	var oIPE7 = new InPlaceEdit("IPE7",{
		content: oTextField4,
		undoEnabled: false
	}).placeAt("uiArea7");

	<!-- Test functions -->


	QUnit.module("Rendering");

	QUnit.test("Visual appearance", function(assert) {
		assert.equal(jQuery("#IPE1").get(0).offsetWidth, 200, "TextField: Width of the control");
		assert.equal(jQuery("#IPE1").text(), sStartText, "TextField: Displayed text");

		// disabled
		assert.ok(jQuery("#IPE2").hasClass("sapUiIpeRo"), "Disabled: ReadOnly Class rendered");
		assert.ok(jQuery("#IPE2--TV").hasClass("sapUiTvDsbl"), "Disabled text renderes with disabled class");

		// invisible
		assert.equal(jQuery("#IPE3").length, 0, "Invisible control not rendered");

		// link
		assert.equal(jQuery("#IPE6").get(0).offsetWidth, 200, "Link: Width of the control");
		assert.equal(jQuery("#IPE6").text(), sStartText, "Link: Displayed text");
		assert.ok(jQuery("#IPE6").find("a").get(0), "Link: rendered as <a>");
		assert.ok(jQuery("#IPE6--Edit").get(0), "Link: Edit button rendered");
		assert.equal(jQuery("#IPE6--Edit").css("visibility"), "hidden", "Link: Edit button not visible");
		// edit button invisible -> visible on focus....

		// tooltip
		assert.equal(jQuery("#IPE1").find("span").attr("title"), sTooltip, "TextField: Tooltip");
		assert.equal(jQuery("#IPE6").find("a").attr("title"), sTooltip, "Link: Tooltip");

	});

	QUnit.test("Value states", function(assert) {
		assert.ok(!jQuery("#IPE1").hasClass("sapUiIpeSucc"), "Normal state: Success CSS-class not rendered");
		assert.ok(!jQuery("#IPE1").hasClass("sapUiIpeWarn"), "Normal state: Warning CSS-class not rendered");
		assert.ok(!jQuery("#IPE1").hasClass("sapUiIpeErr"), "Normal state: Error CSS-class not rendered");

		oTextField1.setValueState(ValueState.Success);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#IPE1").hasClass("sapUiIpeSucc"), "Success state: Success CSS-class rendered");
		assert.ok(!jQuery("#IPE1").hasClass("sapUiIpeWarn"), "Success state: Warning CSS-class not rendered");
		assert.ok(!jQuery("#IPE1").hasClass("sapUiIpeErr"), "Success state: Error CSS-class not rendered");
		assert.equal(oIPE1.getValueState(), ValueState.Success, "GetValueState on InPlaceEdit");

		oIPE1.setValueState(ValueState.Warning);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#IPE1").hasClass("sapUiIpeSucc"), "Warning state: Success CSS-class not rendered");
		assert.ok(jQuery("#IPE1").hasClass("sapUiIpeWarn"), "Warning state: Warning CSS-class rendered");
		assert.ok(!jQuery("#IPE1").hasClass("sapUiIpeErr"), "Warning state: Error CSS-class not rendered");
		assert.equal(oTextField1.getValueState(), ValueState.Warning, "GetValueState on TextField");

		oTextField1.setValueState(ValueState.Error);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#IPE1").hasClass("sapUiIpeSucc"), "Error state: Success CSS-class not rendered");
		assert.ok(!jQuery("#IPE1").hasClass("sapUiIpeWarn"), "Error state: Warning CSS-class not rendered");
		assert.ok(jQuery("#IPE1").hasClass("sapUiIpeErr"), "Error state: Error CSS-class rendered");

		oTextField1.setValueState(ValueState.None);
		sap.ui.getCore().applyChanges();
	});

	QUnit.module("Functions");

	QUnit.test("Properties", function(assert) {
		assert.equal(oIPE1.getRequired(), true, "getRequired");
	 });

	QUnit.module("Edit mode");

	QUnit.test("Visual appearance", function(assert) {
		oIPE1.focus();
		assert.ok(document.getElementById("TF1"), "TextField1 rendered");
		assert.equal(jQuery("#IPE1").get(0).offsetWidth, 200, "Width of the control");

		oIPE2.focus();
		assert.ok(!document.getElementById("TF2"), "TextField2 not rendered");

		oIPE4.focus();
		assert.ok(document.getElementById("CB1"), "ComboBox1 rendered");

		oIPE5.focus();
		assert.ok(document.getElementById("DdB1"), "DropdownBox1 rendered");
	});

	QUnit.test("Link", function(assert) {
		oIPE6.focus();
		assert.ok(!document.getElementById("IPE6--input"), "on focus no TextField rendered");
		assert.equal(jQuery("#IPE6--Edit").css("visibility"), "visible", "on focus Edit button visible");
		qutils.triggerEvent("click", "IPE6--Edit");
		assert.ok(document.getElementById("IPE6--input"), "Edit mode: TextField rendered");
		assert.ok(!jQuery("#IPE6--Edit").get(0), "Edit mode: no edit button rendered");
	});

	QUnit.test("Typing with undo", function(assert) {
		var done = assert.async();
		oIPE1.focus();
		sap.ui.getCore().applyChanges();
		setTimeout(function(){
			assert.equal(jQuery("#IPE1--X").css("visibility"), "hidden", "Undo button invisible");
			qutils.triggerCharacterInput("TF1", "A");
			qutils.triggerEvent("input", "TF1");
			qutils.triggerKeyup("TF1", KeyCodes.A, true, false, false);
			assert.equal(jQuery("#TF1").val(), sStartText + "A", "Displayed text");
			assert.equal(jQuery("#IPE1--X").css("visibility"), "visible", "Undo button visible");
		done();
		}, 300);
	});

	QUnit.test("Typing without undo", function(assert) {
		var done = assert.async();
		oIPE7.focus();
		sap.ui.getCore().applyChanges();
		setTimeout(function(){
			assert.ok(!jQuery("#IPE7--X").get(0), "no Undo button rendered");
			qutils.triggerCharacterInput("TF4", "A");
			qutils.triggerKeyup("TF4", KeyCodes.A, true, false, false);
			assert.equal(jQuery("#TF4").val(), sStartText + "A", "Displayed text");
			assert.ok(!jQuery("#IPE7--X").get(0), "no Undo button rendered");
		done();
		}, 300);
	});

	QUnit.test("open ComboBox", function(assert) {
		var done = assert.async();
		oIPE4.focus();
		sap.ui.getCore().applyChanges();
		setTimeout(function(){
			qutils.triggerEvent("click", "CB1-icon");
			assert.ok(document.getElementById("CB1-lb-list"), "ListBox rendered");
			qutils.triggerEvent("click", "Day7");
			assert.equal(jQuery("#CB1-input").val(), "Sunday", "Displayed text");
		done();
		}, 300);
	});

	QUnit.module("Display mode");

	QUnit.test("Visual appearance", function(assert) {
		var done = assert.async();
		oIPE4.focus(); // to toggle in display mode
		sap.ui.getCore().applyChanges();

		setTimeout(function(){
			assert.ok(!document.getElementById("TF1"), "TextField1 not longer rendered");
			assert.equal(jQuery("#IPE1").find("span").text(), sStartText + "A", "Displayed text");
			assert.ok(jQuery("#IPE1").hasClass("sapUiIpeUndo"), "Undo CSS-class rendered");
			assert.ok(jQuery("#IPE1").find("button").get(0), "Undo Button rendered");
			assert.equal(oTextField1.getValue(), sStartText + "A", "Value of TextField1");
			done();
		}, 300);
	});

	QUnit.test("Undo text change", function(assert) {
		var done = assert.async();
		oIPE1.focus(); // to toggle in display mode
		sap.ui.getCore().applyChanges();

		setTimeout(function(){
				qutils.triggerKeyEvent("keydown", "TF1", KeyCodes.ESCAPE);
				qutils.triggerKeyEvent("keypress", "TF1", KeyCodes.ESCAPE);
				oIPE4.focus(); // to toggle in display mode
				setTimeout(function(){
					assert.equal(jQuery("#IPE1").text(), sStartText, "Displayed text");
					assert.ok(!jQuery("#IPE1").hasClass("sapUiIpeUndo"), "Undo CSS-class not longer rendered");
					assert.ok(!jQuery("#IPE1").find("button").get(0), "Undo Button not longer rendered");
					assert.equal(oTextField1.getValue(), sStartText, "Value of TextField1 after undo");
					done();
			}, 300);
		}, 300);
	});

	QUnit.test("clearOldText", function(assert) {
		var done = assert.async();
		oIPE1.focus();
		qutils.triggerCharacterInput("TF1", "A");
		qutils.triggerKeyup("TF1", KeyCodes.A, true, false, false);
		oIPE4.focus(); // to toggle in display mode
		sap.ui.getCore().applyChanges();

		setTimeout(function(){
			assert.equal(jQuery("#IPE1").find("span").text(), sStartText + "A", "Displayed text before clearOldText");
			assert.ok(jQuery("#IPE1").find("button").get(0), "Undo Button rendered before clearOldText");
			oIPE1.clearOldText();
			assert.equal(jQuery("#IPE1").find("span").text(), sStartText + "A", "Displayed text after clearOldText");
			assert.ok(!jQuery("#IPE1").find("button").get(0), "Undo Button not longer rendered");
			assert.equal(oTextField1.getValue(), sStartText + "A", "Value of TextField1 after clearOldText");
			done();
		}, 300);
	});

	QUnit.module("Cleanup");

	QUnit.test("internal controls deleted", function(assert) {
		oIPE6.destroy();
		assert.ok(!oIPE6._oEditButton, "Edit button not longer exist");
		assert.ok(!oIPE6._oUndoButton, "Undo button not longer exist");
		assert.ok(!oIPE6._oTextField, "TextField not longer exist");
		oIPE7.destroy();
		assert.ok(!oIPE7._oTextView, "TextView not longer exist");
	});
});