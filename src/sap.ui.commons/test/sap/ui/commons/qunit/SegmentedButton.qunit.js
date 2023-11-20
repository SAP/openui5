/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/SegmentedButton",
	"sap/ui/commons/Button",
	"sap/ui/thirdparty/jquery"
], function(qutils, createAndAppendDiv, SegmentedButton, Button, jQuery) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("SegmentedButtonArea");



	var sSelected = "";

	function url(icon) {
		return "test-resources/sap/ui/commons/images/sb/" + icon;
	}

	function handleSelected(oEvent){
		sSelected = oEvent.getParameters().selectedButtonId;
	}

	var oSegmentedButton = new SegmentedButton({
		id:"mySB",
		buttons:[
			new Button({id:"But1",icon:url("list.png"),iconHovered:url("list_hover.png"),iconSelected:url("list_hover.png")}),
			new Button({id:"But2",icon:url("card.png"),iconHovered:url("card_hover.png"),iconSelected:url("card_hover.png")}),
			new Button({id:"But3",icon:url("tiles.png"),iconHovered:url("tiles_hover.png"),iconSelected:url("tiles_hover.png")}),
			new Button({id:"But4",icon:url("thumbnails.png"),iconHovered:url("thumbnails_hover.png"),iconSelected:url("thumbnails_hover.png")}),
			new Button({id:"But5",icon:url("map.png"),iconHovered:url("map_hover.png"),iconSelected:url("map_hover.png")}),
			new Button({id:"But6",icon:url("cloud.png"),iconHovered:url("cloud_hover.png"),iconSelected:url("cloud_hover.png")})
		],
		select:handleSelected
	});
	oSegmentedButton.setSelectedButton("But2");
	oSegmentedButton.placeAt("SegmentedButtonArea");

	QUnit.module("Appearance");

	QUnit.test("Output", function(assert) {

		assert.ok(jQuery("#mySB").get(0), "SegmentedButton rendered");
		assert.ok(jQuery("#But2").hasClass('sapUiSegButtonSelected'), "Button with id 'But2' selected");

		assert.equal(jQuery("#But2").children("img").attr('src'), url("card_hover.png"), "Button selected: Use iconHovered instead of icon!");
		assert.equal(jQuery("#mySB-radiogroup").children("button").length, 6, "All Buttons rendered");
	});

	QUnit.test("ARIA", function(assert) {
		var done = assert.async();
		assert.equal(jQuery("#mySB-radiogroup").attr("role"), "radiogroup", "role = radiogroup");
		assert.equal(jQuery("#mySB-radiogroup").attr("aria-disabled"), "false", "aria-disabled = false");
		oSegmentedButton.setEnabled(false);
		setTimeout(function() {
			assert.equal(jQuery("#mySB-radiogroup").attr("aria-disabled"), "true", "aria-disabled = true");
			oSegmentedButton.setEnabled(true);
			done();
		},500);
	});

	QUnit.test("Visibility", function(assert) {
		assert.ok(jQuery("#mySB").get(0), "SegmentedButton rendered");
		oSegmentedButton.setVisible(false);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#mySB").get(0), "SegmentedButton not rendered");
		oSegmentedButton.setVisible(true);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#mySB").get(0), "SegmentedButton rendered");
	});

	QUnit.test("Icons", function(assert) {
		var done = assert.async();
		oSegmentedButton.setSelectedButton("But3");
		setTimeout(function() {
			assert.equal(jQuery("#But2").children("img").attr('src'), url("card.png"), "Button deselected: Use icon again");
			assert.equal(jQuery("#But3").children("img").attr('src'), url("tiles_hover.png"), "Button selected: Use iconHovered instead of icon!");
			var oButtonRef = document.getElementById("But1");
			if ( oButtonRef ) {
				oButtonRef.focus();
			}
			setTimeout(function() {
				assert.equal(jQuery("#But3").children("img").attr('src'), url("tiles_hover.png"), "Button selected: Use iconHovered instead of icon even it has no focus!");
				assert.equal(jQuery("#But1").children("img").attr('src'), url("list.png"), "Button hovered: Use icon when focused!");
				done();
			},500);
		},500);
	});

	QUnit.module("Interaction");


	QUnit.test("event", function(assert) {
		qutils.triggerMouseEvent("But5", "click");
		assert.equal(sSelected, "But5","Button selected with mouse- event fired");
	});
});