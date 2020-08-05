/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/commons/RatingIndicator",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/jquery/EventExtension" // implicitly used?
], function(qutils, RatingIndicator, jQuery) {
	"use strict";

	var oRatings = {};

	var initRating = function(idx, iMax, fVal, bVisible, bEditable, sVisual, bCustomIcons, sTooltip, fAveragrValue){
		var sId = "oRating" + idx;
		var sAreaId = "uiArea" + idx;
		var oBody = document.getElementsByTagName("body")[0];
		var oUiArea = document.createElement("div");
		oUiArea.id = sAreaId;
		oBody.appendChild(oUiArea);

		var oRating = new RatingIndicator(sId);
		if (iMax != -1) {oRating.setMaxValue(iMax);}
		if (fVal != -1) {oRating.setValue(fVal);}

		if (fAveragrValue != -1) {oRating.setAverageValue(fAveragrValue);}

		if (bVisible != -1) {oRating.setVisible(bVisible);}
		if (bEditable != -1) {oRating.setEditable(bEditable);}
		if (sVisual) {oRating.setVisualMode(sVisual);}
		if (sTooltip) {oRating.setTooltip(sTooltip);}
		if (bCustomIcons){
			oRating.setIconSelected("test-resources/sap/ui/commons/images/rating/star_selected.png");
			oRating.setIconUnselected("test-resources/sap/ui/commons/images/rating/star_unselected.png");
			oRating.setIconHovered("test-resources/sap/ui/commons/images/rating/star_hover.png");
		}

		sap.ui.setRoot(sAreaId, oRating);
		oRatings[sId] = oRating;
	};

	var nV = RatingIndicator.NoValue;

	//         id mx  val visible  edit   visual  customIcons    tooltip      average
	initRating(1, -1,  -1,    -1,    -1, null,         false, false,            -1); //
	initRating(2,  6,   3,  true, false, "Half",       true,  false,            -1); //
	initRating(3, -1,  -1, false,    -1, null,         false, false,            -1); //
	initRating(4,  6, 3.7,    -1,    -1, "Full",       false, "Custom Tooltip", -1);
	initRating(5,  6, 3.7,    -1,    -1, "Half",       false, false,            -1);
	initRating(6,  6, 3.7,    -1,    -1, "Continuous", true,  false,            -1);
	initRating(7,  6,  nV,    -1,    -1, "Continuous", true,  false,           3.5);
	initRating(8,  6,  nV,    -1,    -1, "Continuous", true,  false,           3.1);
	initRating(9,  6,  nV,    -1,    -1, "Continuous", true,  false,           2.7);



	QUnit.module("Properties");

	QUnit.test("Default Values", function(assert) {
		var oRating = oRatings["oRating1"];
		assert.equal(oRating.getValue(), 0, "Default 'value':");
		assert.equal(oRating.getAverageValue(), 0, "Default 'averageValue':");
		assert.equal(oRating.getMaxValue(), 5, "Default 'maxValue':");
		assert.equal(oRating.getVisible(), true, "Default 'visible':");
		assert.equal(oRating.getEditable(), true, "Default 'editable':");
		assert.equal(oRating.getIconSelected(), "", "Default 'iconSelected':");
		assert.equal(oRating.getIconUnselected(), "", "Default 'iconUnselected':");
		assert.equal(oRating.getIconHovered(), "", "Default 'iconHovered':");
		assert.equal(oRating.getVisualMode(), "Half", "Default 'visualMode':");
		assert.equal(oRating.getTooltip(), null, "Default 'tooltip':");
	 });

	QUnit.test("Custom Values", function(assert) {
		var oRating = oRatings["oRating2"];
		assert.equal(oRating.getValue(), 3, "Custom 'value':");
		assert.equal(oRating.getMaxValue(), 6, "Custom 'maxValue':");
		assert.equal(oRating.getVisible(), true, "Custom 'visible':");
		assert.equal(oRating.getEditable(), false, "Custom 'editable':");
		assert.equal(oRating.getIconSelected(), "test-resources/sap/ui/commons/images/rating/star_selected.png", "Custom 'iconSelected':");
		assert.equal(oRating.getIconUnselected(), "test-resources/sap/ui/commons/images/rating/star_unselected.png", "Custom 'iconUnselected':");
		assert.equal(oRating.getIconHovered(), "test-resources/sap/ui/commons/images/rating/star_hover.png", "Custom 'iconHovered':");
		assert.equal(oRating.getVisualMode(), "Half", "Custom 'visualMode':");
		assert.equal(oRatings["oRating4"].getTooltip(), "Custom Tooltip", "Custom 'tooltip':");
	});


	QUnit.module("Interaction");

	QUnit.test("Keyboard", function(assert) {
		var oRating = oRatings["oRating1"];
		jQuery("#oRating1").trigger("focus");
		qutils.triggerKeyboardEvent("oRating1", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("oRating1", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("oRating1", "ARROW_UP");
		qutils.triggerKeyboardEvent("oRating1", "ARROW_LEFT");
		qutils.triggerKeyboardEvent("oRating1", "SPACE");
		assert.equal(oRating.getValue(), 2, "Value after saved keyboard input:");

		qutils.triggerKeyboardEvent("oRating1", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("oRating1", "ESCAPE");
		assert.equal(oRating.getValue(), 2, "Value after reset keyboard input:");

		qutils.triggerKeyboardEvent("oRating1", "END");
		qutils.triggerKeyboardEvent("oRating1", "SPACE");
		assert.equal(oRating.getValue(), oRating.getMaxValue(), "Value after saved keyboard input:");

		qutils.triggerKeyboardEvent("oRating1", "HOME");
		qutils.triggerKeyboardEvent("oRating1", "SPACE");
		assert.equal(oRating.getValue(), 1, "Value after saved keyboard input:");

		qutils.triggerKeyboardEvent("oRating1", "ARROW_UP");
		qutils.triggerKeyboardEvent("oRating1", "ARROW_UP");
		qutils.triggerKeyboardEvent("oRating1", "ARROW_UP");
		qutils.triggerKeyboardEvent("oRating1", "ARROW_DOWN");
		var oEvent = jQuery.Event("focusout");
		oEvent.target = oRating.getDomRef();
		oRating.onfocusout(oEvent);
		assert.equal(oRating.getValue(), 2, "Value after saved keyboard input:");
	});

	QUnit.test("Click", function(assert) {
		var oRating = oRatings["oRating1"];
		qutils.triggerEvent("click", "oRating1-itm-3");
		assert.equal(oRating.getValue(), 3, "Value after click:");
	});

	QUnit.test("Change Event - Keyboard SPACE", function(assert) {
		var done = assert.async();
		var oRating = oRatings["oRating1"];
		var handler = function(oControlEvent){
			assert.equal(oControlEvent.getParameter("value"), 4, "Value of change event after keyboard SPACE:");
			oRating.detachChange(handler);
			done();
		};
		oRating.attachChange(handler);
		qutils.triggerKeyboardEvent("oRating1", "ARROW_UP");
		qutils.triggerKeyboardEvent("oRating1", "ARROW_UP");
		qutils.triggerKeyboardEvent("oRating1", "SPACE");
	});

	QUnit.test("Change Event - Keyboard BLUR", function(assert) {
		var done = assert.async();
		var oRating = oRatings["oRating1"];
		var handler = function(oControlEvent){
			assert.equal(oControlEvent.getParameter("value"), 3, "Value of change event after keyboard BLUR:");
			oRating.detachChange(handler);
			done();
		};
		oRating.attachChange(handler);
		qutils.triggerKeyboardEvent("oRating1", "ARROW_DOWN");
		qutils.triggerKeyboardEvent("oRating1", "ARROW_DOWN");
		var oEvent = jQuery.Event("focusout");
		oEvent.target = oRating.getDomRef();
		oRating.onfocusout(oEvent);
	});

	QUnit.test("Change Event - Click (Value changed)", function(assert) {
		var done = assert.async();
		var oRating = oRatings["oRating1"];
		var handler = function(oControlEvent){
			assert.equal(oControlEvent.getParameter("value"), 4, "Value of change event after click:");
			oRating.detachChange(handler);
			done();
		};
		oRating.attachChange(handler);
		qutils.triggerEvent("click", "oRating1-itm-4");
	});

	QUnit.test("Change Event - Click (Value not changed)", function(assert) {
		var oRating = oRatings["oRating1"];
		var handlerCalled = false;
		oRating.attachChange(function(oControlEvent){
			handlerCalled = true;
		});
		qutils.triggerEvent("click", "oRating1-itm-4");
		assert.ok(!handlerCalled, "Event should not be triggered.");
	});


	QUnit.module("Visual Appearence");

	QUnit.test("Visibility", function(assert) {
		assert.equal(jQuery("#oRating3").get(0), undefined, "Invisible:");
		assert.ok(jQuery("#oRating1").get(0), "Visible: expected defined");
	});

	QUnit.test("#Symbols", function(assert) {
		assert.equal(jQuery("#oRating1").children().length, 5, "#Symbols:");
		assert.equal(jQuery("#oRating2").children().length, oRatings["oRating2"].getMaxValue(), "#Symbols:");
	});

	QUnit.test("ItemValue Properties", function(assert) {
		var oSymbols = jQuery("#oRating1").children();
		oSymbols.each(function(index){
			assert.equal(jQuery(this).attr("itemvalue"), "" + (index + 1), "Item Value of item " + (index + 1) + ":");
		});
	});

	QUnit.test("Visualization FULL", function(assert) {
		var oSymbols = jQuery("#oRating4").children();
		oSymbols.each(function(index){
			var oChilds = jQuery(this).children();
			assert.equal(oChilds.length, 2, "# DOM Childs of Symbol:");
			var oOverflow = jQuery(oChilds.get(1));
			var overflowStyle = oOverflow.attr("style");
			if (index < 3) {
				assert.ok(overflowStyle.toLowerCase().indexOf("width: 0%") != -1 || overflowStyle.toLowerCase().indexOf("width:0%") != -1, "FULL - Overflow width of full selected symbol " + (index + 1) + " (" + overflowStyle + "): expected 0%");
			} else if (index == 3) {
				assert.ok(overflowStyle.toLowerCase().indexOf("width: 0%") != -1 || overflowStyle.toLowerCase().indexOf("width:0%") != -1, "FULL - Overflow width of partially selected symbol " + (index + 1) + " (" + overflowStyle + "): expected 0%");
			} else {
				assert.ok(overflowStyle.toLowerCase().indexOf("width: 100%") != -1 || overflowStyle.toLowerCase().indexOf("width:100%") != -1, "FULL - Overflow width of unselected symbol " + (index + 1) + " (" + overflowStyle + "): expected 100%");
			}
		});
	});

	QUnit.test("Visualization HALF", function(assert) {
		var oSymbols = jQuery("#oRating5").children();
		oSymbols.each(function(index){
			var oChilds = jQuery(this).children();
			assert.equal(oChilds.length, 2, "# DOM Childs of Symbol:");
			var oOverflow = jQuery(oChilds.get(1));
			var overflowStyle = oOverflow.attr("style");
			if (index < 3) {
				assert.ok(overflowStyle.toLowerCase().indexOf("width: 0%") != -1 || overflowStyle.toLowerCase().indexOf("width:0%") != -1, "HALF - Overflow width of full selected symbol " + (index + 1) + " (" + overflowStyle + "): expected 0%");
			} else if (index == 3) {
				assert.ok(overflowStyle.toLowerCase().indexOf("width: 50%") != -1 || overflowStyle.toLowerCase().indexOf("width:50%") != -1, "HALF - Overflow width of partially selected symbol " + (index + 1) + " (" + overflowStyle + "): expected 50%");
			} else {
				assert.ok(overflowStyle.toLowerCase().indexOf("width: 100%") != -1 || overflowStyle.toLowerCase().indexOf("width:100%") != -1, "HALF - Overflow width of unselected symbol " + (index + 1) + " (" + overflowStyle + "): expected 100%");
			}
		});
	});

	QUnit.test("Visualization CONT", function(assert) {
		var oSymbols = jQuery("#oRating6").children();
		oSymbols.each(function(index){
			var oChilds = jQuery(this).children();
			assert.equal(oChilds.length, 2, "# DOM Childs of Symbol:");
			var oOverflow = jQuery(oChilds.get(1));
			var overflowStyle = oOverflow.attr("style");
			if (index < 3) {
				assert.ok(overflowStyle.toLowerCase().indexOf("width: 0%") != -1 || overflowStyle.toLowerCase().indexOf("width:0%") != -1, "CONT - Overflow width of full selected symbol " + (index + 1) + " (" + overflowStyle + "): expected 0%");
			} else if (index == 3) {
				assert.ok(overflowStyle.toLowerCase().indexOf("width: 30%") != -1 || overflowStyle.toLowerCase().indexOf("width:30%") != -1, "CONT - Overflow width of partially selected symbol " + (index + 1) + " (" + overflowStyle + "): expected 30%");
			} else {
				assert.ok(overflowStyle.toLowerCase().indexOf("width: 100%") != -1 || overflowStyle.toLowerCase().indexOf("width:100%") != -1, "CONT - Overflow width of unselected symbol " + (index + 1) + " (" + overflowStyle + "): expected 100%");
			}
		});
	});

	QUnit.test("Hover Effect", function(assert) {
		qutils.triggerEvent("mouseover", "oRating1-itm-4");
		var oSymbols = jQuery("#oRating1").children();
		oSymbols.each(function(index){
			assert.equal(jQuery(this).hasClass("sapUiRatingItmHov"), true, "HOVER: Symbol " + (index + 1) + " hovered:");
			var sSrc = jQuery(this).children("img").attr("src") || "";
			assert.ok(sSrc.endsWith(index < 4 ? "hover.png" : "unselected.png"), "HOVER: Correct Hover Symbol for " + (index + 1) + ": " + sSrc);
		});
		qutils.triggerEvent("mouseout", "oRating1-itm-4");
		oSymbols = jQuery("#oRating1").children();
		oSymbols.each(function(index){
			assert.equal(jQuery(this).hasClass("sapUiRatingItmHov"), false, "UNHOVER: Symbol " + (index + 1) + " not hovered:");
		});
	});

	QUnit.test("Custom Symbols", function(assert) {
		var oSymbols = jQuery("#oRating6").children();
		oSymbols.each(function(index){
			var oSymbol = jQuery(this);
			assert.equal(oSymbol.children("img").attr("src"), "test-resources/sap/ui/commons/images/rating/star_selected.png", "Custom icon set on symbol " + (index + 1) + ":");
			var oOverflow = jQuery(oSymbol.children().get(1));
			assert.equal(oOverflow.children("img").attr("src"), "test-resources/sap/ui/commons/images/rating/star_unselected.png", "Custom icon set on symbol overflow " + (index + 1) + ":");
		});

		qutils.triggerEvent("mouseover", "oRating6-itm-1");
		var oSymbol = jQuery("#oRating6-itm-1");
		assert.equal(oSymbol.children("img").attr("src"), "test-resources/sap/ui/commons/images/rating/star_hover.png", "Custom hover icon set on symbol 1:");
		qutils.triggerEvent("mouseout", "oRating6-itm-1");
	});

	QUnit.test("Tooltip", function(assert) {
		var attr = function($Obj, sAtt) { //see changes of jQuery.attr under http://api.jquery.com/attr/
			var sValue = $Obj.attr(sAtt);
			return !sValue ? "" : sValue;
		};
		var checkTooltip = function(sControlId, sText, sExpectedOnRoot, fExpectedOnSymbolCallback){
			assert.equal(attr(jQuery("#" + sControlId), "title"), sExpectedOnRoot, sText + " on root tag:");
			var oSymbols = jQuery("#" + sControlId).children();
			oSymbols.each(function(index){
				var oSymbol = jQuery(this);
				assert.equal(attr(oSymbol, "title"), fExpectedOnSymbolCallback(oRatings[sControlId], index, oSymbol) , sText + " on symbol tag " + (index + 1) + ":");
			});
		};

		checkTooltip("oRating1", "Default Tooltip (editable control)", "", function(oRating, iIdx){return (iIdx + 1) + " out of " + oRating.getMaxValue();});
		checkTooltip("oRating2", "Default Tooltip (readonly control)", "" + oRatings["oRating2"].getValue(), function(){return "";});
		checkTooltip("oRating4", "Custom Tooltip (editable control)", "Custom Tooltip", function(){return "";});
	});



	QUnit.test("Average Value", function(assert) {

		function fnTestAverage(oRating, fExpectedAverage) {

			var $Dom = oRating.$();

			var fAverageValue = oRating.getAverageValue();


			assert.strictEqual(oRating.getValue(), RatingIndicator.NoValue, "No value set.");
			assert.strictEqual(fAverageValue, fExpectedAverage, "Average value set.");

			var $children = $Dom.children(".sapUiRatingItm");
			$children.each(function(iIndex, oChild) {

				var fRest = fAverageValue - iIndex;
				if (fRest > 1) {
					fRest = 1;
				} else if (fRest < 0) {
					fRest = 0;
				}
				fRest = 1 - fRest;

				var fPercent = Math.round(100 * fRest);

				var $OverflowItem = jQuery(oChild).children(".sapUiRatingItmOvrflw");
				assert.ok(fPercent + "%" == $OverflowItem[0].style.width, "Correct star percentage");
			});
		}

		fnTestAverage(oRatings["oRating7"], 3.5);
		fnTestAverage(oRatings["oRating8"], 3.1);
		fnTestAverage(oRatings["oRating9"], 2.7);
	});
});