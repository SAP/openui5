/*global QUnit, exactTestData */
sap.ui.define([
    "sap/ui/qunit/QUnitUtils",
    "sap/ui/qunit/utils/createAndAppendDiv",
    "sap/ui/ux3/Exact",
    "sap/ui/commons/Menu",
    "sap/ui/ux3/ExactAttribute",
    "sap/ui/thirdparty/jquery",
    "../resources/ExactData"
], function(qutils, createAndAppendDiv, Exact, Menu, ExactAttribute, jQuery) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("uiArea1");


	var oExact1 = new Exact("exact1", {tooltip: "Some text"});
	oExact1.setSettingsMenu(new Menu("menu"));
	oExact1.placeAt("uiArea1");
	var oExact2 = new Exact("exact2", {resultText: "Some result text"});

	//Remember the internal controls
	var oSearchTextField = oExact1._search_input;
	var oBrowser = oExact1._browser;
	var oResultArea = oExact1._resultArea;
	var oResultText = oExact1._resultText;



	QUnit.module("API");

	QUnit.test("Default Values", function(assert) {
		assert.equal(oExact1.getResultText(), "", "Default 'resultText':");
		assert.equal(oExact2.getSettingsMenu(), null, "Default 'settingsMenu':");
		assert.equal(oExact2.getTooltip(), null, "Default 'tooltip':");
		assert.equal(oExact1.getResultArea().getId(), oResultArea.getId(), "Default 'resultArea':");
	 });

	QUnit.test("Custom Values", function(assert) {
		assert.equal(oExact2.getResultText(), "Some result text", "Custom 'resultText':");
		assert.equal(oExact1.getSettingsMenu().getId(), "menu", "Custom 'settingsMenu':");
		assert.equal(oExact1._browser.getOptionsMenu().getId(), "menu", "Custom 'settingsMenu':");
		assert.equal(oExact1.getTooltip(), "Some text", "Custom 'tooltip':");
	});

	QUnit.test("Aggregation 'attributes'", function(assert) {
		assert.equal(oExact2.getAttributes().length, 0, "Initial number of attributes");
		oExact2.addAttribute(new ExactAttribute("aggtest1"));
		assert.equal(oExact2.getAttributes().length, 1, "Number of attributes after add");
		oExact2.insertAttribute(new ExactAttribute("aggtest2"), 0);
		assert.equal(oExact2.getAttributes().length, 2, "Number of attributes after insert");
		assert.equal(oExact2.getAttributes()[0].getId(), "aggtest2", "First Attribute");
		assert.equal(oExact2.getAttributes()[1].getId(), "aggtest1", "Second Attribute");
		oExact2.removeAttribute(0);
		assert.equal(oExact2.getAttributes().length, 1, "Number of attributes after remove");
		assert.equal(oExact2.getAttributes()[0].getId(), "aggtest1", "First Attribute");
		oExact2.removeAllAttributes();
		assert.equal(oExact2.getAttributes().length, 0, "Number of attributes after removeAll");
	});


	QUnit.module("Interaction Flow");

	QUnit.test("Initial State", function(assert) {
		assert.equal(oSearchTextField.getValue(), "", "Initial text State of Search TextField:");
		assert.ok(oSearchTextField.getDomRef(), "Initial visibility State of Search TextField:");
		assert.ok(!oBrowser.getDomRef(), undefined, "Initial visibility State of Browse Area:");
		assert.ok(!oResultText.getDomRef(), undefined, "Initial visibility State of Result Text:");
		assert.ok(!oResultArea.getDomRef(), undefined, "Initial visibility State of Result Area:");
	});

	QUnit.test("Trigger Search", function(assert) {
		var done = assert.async();
		oSearchTextField.setValue("Some search query");
		var handler = function(oControlEvent){
			assert.equal(oControlEvent.getParameter("query"), "Some search query", "Value of query parameter of search event:");
			oExact1.detachSearch(handler);
			//Fill the Exact control with some attributes
			oExact1.setResultText("Some result text");

			exactTestData.initAttributesForQUnit(oExact1);
			done();
		};
		oExact1.attachSearch(handler);
		oSearchTextField.getDomRef().focus();
		qutils.triggerKeyboardEvent(oSearchTextField.getFocusDomRef(), "ENTER");
	});

	QUnit.test("State after Search", function(assert) {
		var done = assert.async();
		setTimeout(function(){
			assert.equal(oSearchTextField.getValue(), "Some search query", "Text State of Search TextField:");
			assert.ok(oSearchTextField.getDomRef(), "Visibility State of Search TextField:");
			assert.ok(oBrowser.getDomRef(), "Visibility State of Browse Area:");
			assert.ok(oResultText.getDomRef(), "Visibility State of Result Text:");
			assert.ok(oResultArea.getDomRef(), "Visibility State of Result Area:");
			assert.equal(oBrowser.getAttributes().length, 4, "Number of top level attributes:");

			var aSubLists = oBrowser._rootList.getSubLists();
			assert.equal(aSubLists.length, 2, "Number of visible 1st level lists:");
			assert.equal(aSubLists[0].getData(), "att1", "List at position 0:");
			assert.equal(aSubLists[1].getData(), "att2", "List at position 1:");
			for (var i = 0; i < aSubLists.length; i++){
				var aSubSubLists = aSubLists[i].getSubLists();
				if (i == 0){
					assert.ok(aSubSubLists.length == 1, "List " + aSubLists[i].getData() + " contains 1 sub list.");
					assert.equal(aSubSubLists[0].getData(), "att1-1", "Sub-List at position 0:");
				} else {
					assert.ok(aSubSubLists.length == 0, "List " + aSubLists[i].getData() + " contains no sub lists.");
				}
			}
			done();
		}, 1000);
	});

	QUnit.test("Check Refine Search", function(assert) {
		var done = assert.async();
		var handler = function(oControlEvent){
			assert.equal(oControlEvent.getParameter("query"), "Some search query", "Value of query parameter of search refine event:");
			assert.equal(oControlEvent.getParameter("changedAttribute").getId(), "att3", "Id of selected attribute:");
			assert.equal(oControlEvent.getParameter("changedAttribute").getSelected(), true, "Selection state of selected attribute:");
			assert.equal(oControlEvent.getParameter("allSelectedAttributes").length, 4, "Number of selected attributes:");

			setTimeout(function(){
				assert.equal(oBrowser.getAttributes().length, 4, "Number of top level attributes:");
				var aSubLists = oBrowser._rootList.getSubLists();
				assert.equal(aSubLists.length, 3, "Number of visible 1st level lists:");
				assert.equal(aSubLists[0].getData(), "att1", "List at position 0:");
				assert.equal(aSubLists[1].getData(), "att2", "List at position 1:");
				assert.equal(aSubLists[2].getData(), "att3", "List at position 2:");
				for (var i = 0; i < aSubLists.length; i++){
					var aSubSubLists = aSubLists[i].getSubLists();
					if (i == 0){
						assert.ok(aSubSubLists.length == 1, "List " + aSubLists[i].getData() + " contains 1 sub list.");
						assert.equal(aSubSubLists[0].getData(), "att1-1", "Sub-List at position 0:");
					} else {
						assert.ok(aSubSubLists.length == 0, "List " + aSubLists[i].getData() + " contains no sub lists.");
					}
				}
				done();
			}, 1000);

			oExact1.detachRefineSearch(handler);
		};
		oExact1.attachRefineSearch(handler);

		qutils.triggerMouseEvent(jQuery(jQuery("#" + oBrowser._rootList._lb.getId()).children()[0]).children()[2], "click");
	});
});