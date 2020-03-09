/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	'sap/ui/qunit/QUnitUtils',
	'sap/ui/qunit/utils/createAndAppendDiv',
	'sap/ui/events/jquery/EventExtension',
	'sap/m/App',
	'sap/m/Page',
	'sap/m/RatingIndicator',
	'sap/ui/core/IconPool',
	'sap/m/library',
	'sap/ui/qunit/QUnitUtils',
	'sap/ui/events/KeyCodes'
], function(QUnitUtils, createAndAppendDiv, EventExtension, App, Page, RatingIndicator, IconPool, mobileLibrary, qutils, KeyCodes) {
	createAndAppendDiv("content");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		".sapMRI { /* formatter to display each rating in a single line */" +
		"	display: block;" +
		"	margin-bottom: 1rem;" +
		"}";
	document.head.appendChild(styleElement);

	// shortcut
	var RatingIndicatorVisualMode = mobileLibrary.RatingIndicatorVisualMode;

	var oApp = new App("myApp", {initialPage: "page1"});
	var idPrefix = "__indicator";

	// default rating with no properties
	var oRating0 = new RatingIndicator({
	});

	// default rating with value 1
	var oRating1 = new RatingIndicator({
		value: 1
	});

	// 10 / 10 (Full)
	var oRating2 = new RatingIndicator({
		maxValue: 10,
		value: 10,
		visualMode: RatingIndicatorVisualMode.Full
	});

	// 2.5 / 9 (Half)
	var oRating3 = new RatingIndicator({
		value: 2.5,
		maxValue: 9,
		visualMode: RatingIndicatorVisualMode.Half
	});

	// 3.33333 / 8 (Half) with hover state enabled
	var oRating4 = new RatingIndicator({
		value: 3.33333,
		maxValue: 8,
		visualMode: RatingIndicatorVisualMode.Half
	});

	// 2 / 7 (Half) with customized icons
	var oRating5 = new RatingIndicator({
		value: 2,
		maxValue: 7,
		iconSelected: IconPool.getIconURI("wounds-doc"),
		iconUnselected: IconPool.getIconURI("tree"),
		iconHovered: IconPool.getIconURI("e-care")
	});

	// 1 / 6 (Half) with image icons
	var oRating6 = new RatingIndicator({
		value: 1,
		maxValue: 6,
		iconSelected: "../images/candy_v_46x46.png",
		iconUnselected: "../images/candy_x_46x46.png",
		iconHovered: "../images/candy_star_46x46.png"
	});

	// 5/5 (Half) with large icons
	var oRating7 = new RatingIndicator({
		value: 5,
		maxValue: 5,
		iconSize: "3rem"
	});

	// invisible rating
	var oRating8 = new RatingIndicator({
		visible: false
	});

	// value has to be rounded to 3
	var oRating9 = new RatingIndicator({
		value: 3.33333,
		visualMode: RatingIndicatorVisualMode.Full
	});

	// readonly rating
	var oRating10 = new RatingIndicator({
		enabled: false,
		value: 1
	});

	// default rating for icon test
	var oRatingTemp = new RatingIndicator({});

	var aRatings = [oRating0, oRating1, oRating2, oRating3, oRating4, oRating5, oRating6, oRating7, oRating8, oRating9, oRating10, oRatingTemp];

	var oPage1 = new Page("page1", {
		title: "Mobile Rating Control",
		content: aRatings
	});

	oApp.addPage(oPage1);

	oApp.placeAt("content");

	var init = function (sId) {
		// global variables
		oRating = sap.ui.getCore().byId(sId);
		if (!oRating.getVisible()) {
			return;
		}
		$RatingContainer = oRating.$();

		// save a global reference on all needed DOM elements
		$SelectedDiv = oRating.$("sel");
		$UnselectedDiv = oRating.$("unsel");
		$UnselectedContainerDiv = oRating.$("unsel-wrapper");
		$SelectorDiv = oRating.$("selector");
		$HoveredDiv = oRating.$("hov");
	};

	QUnit.module("Properties");

	// check all properties
	QUnit.test("default Values", function (assert) {
		assert.strictEqual(oRating0.getVisible(), true, "By default the rating is visible on " + oRating0);
		assert.strictEqual(oRating0.getEnabled(), true, "By default the rating is enabled " + oRating0);
		assert.strictEqual(oRating0.getMaxValue(), 5, "By default the rating max value is 5 on " + oRating0);
		assert.strictEqual(oRating0.getValue(), 0, "By default the rating value is 0 on " + oRating0);
		assert.strictEqual(oRating0._iPxIconSize, 22, "By default the rating size is 22 px on " + oRating0);
		assert.strictEqual(oRating0.getIconSelected(), "", "By default the selected icon is empty on " + oRating0);
		assert.strictEqual(oRating0.getIconUnselected(), "", "By default the unselected icom is empty on " + oRating0);
		assert.strictEqual(oRating0.getIconHovered(), "", "By default the hovered icon is empty on " + oRating0);
		assert.strictEqual(oRating0.getVisualMode(), "Half", "By default the visual mode is \"Half\" on " + oRating0);
		assert.strictEqual(oRating0.getDisplayOnly(), false, "By default the displayOnly is false " + oRating0);
		assert.strictEqual(oRating0.getEditable(), true, "By default the Editable is true " + oRating0);
	});

	QUnit.module("HTML");

	// check existence of all rendered divs
	QUnit.test("rendering", function (assert) {
		var i = 0;

		// check HTML divs
		for (; i < aRatings.length; i++) {
			init(aRatings[i].getId());
			if (oRating.getVisible()) {
				assert.ok($SelectedDiv.length, "The selected HTML DIV element exist on " + oRating);
				assert.ok($UnselectedDiv.length, "The unselected HTML DIV element exist on " + oRating);
				assert.ok($UnselectedContainerDiv.length, "The unselected container HTML DIV element exist on " + oRating);
				if (oRating.getEnabled()) {
					assert.ok($SelectorDiv.length, "The selector HTML DIV element exist on " + oRating);
					assert.ok($HoveredDiv.length, "The hovered HTML DIV element exist on " + oRating);
				}
			}
		}
	});

	// check if the ARIA attributes are rendered
	QUnit.test("aria attributes", function (assert) {
		var i = 0;

		// check HTML divs
		for (; i < aRatings.length; i++) {
			init(aRatings[i].getId());
			if (oRating.getVisible()) {
				assert.ok($RatingContainer.attr('role') == 'slider', "ARIA role is 'slider' on " + oRating);
				assert.ok(!$RatingContainer.attr('aria-readonly'), "aria-readonly should not be present");
				assert.ok($RatingContainer.attr('aria-valuenow') == oRating.getValue(), "aria-valuenow is correct on " + oRating);
				assert.ok($RatingContainer.attr('aria-valuemin') == 0, "aria-valuemin is correct on " + oRating);
				assert.ok($RatingContainer.attr('aria-valuemax') == oRating.getMaxValue(), "aria-valuemax is correct on " + oRating);
			}
		}
	});

	QUnit.module("CSS and DOM");

	QUnit.test("css class and attributes", function (assert) {
		var i = 0;

		// check css classes
		for (; i < aRatings.length; i++) {
			init(aRatings[i].getId());
			if (oRating.getVisible()) {
				assert.ok($RatingContainer.hasClass("sapMRI"), 'The rating root HTML Div element "must have" the CSS class "sapMRI" on ' + oRating);
				assert.ok($UnselectedDiv.hasClass("sapMRIUnsel"), 'The rating unselectedHTML Div element "must have" the CSS class "sapMRIUnsel" on ' + oRating);
				if (oRating.getEnabled()) {
					assert.ok($SelectorDiv.hasClass("sapMRISelector"), 'The selector HTML DIV element "must have" the CSS class "sapMRISelector" on ' + oRating);
					assert.ok($HoveredDiv.hasClass("sapMRIHov"), 'The rating hovered HTML Div element "must have" the CSS class "sapMRIHov" on ' + oRating);
				}
			}
		}

		// check visibility false = no rendering
		assert.strictEqual(oRating8.$().length, 0, 'The rating is not visible on' + oRating8);
	});

	QUnit.test("setting displayOnly", function (assert) {
		var oRating = new RatingIndicator({});

		oRating.placeAt("content");
		sap.ui.getCore().applyChanges();

		// initial assertion
		assert.strictEqual(oRating.$().hasClass("sapMRIDisplayOnly"), false, 'Initially the control does not have class "sapMRIDisplayOnly" on ' + oRating);
		assert.strictEqual(oRating.$().attr('aria-disabled'), "false", "aria-disabled is set to false on " + oRating);
		assert.strictEqual(oRating.$().attr("tabindex"), "0", "The control is in the tab chain");

		// act
		oRating.setDisplayOnly(true);
		sap.ui.getCore().applyChanges();

		// assertion
		assert.strictEqual(oRating.$().hasClass("sapMRIDisplayOnly"), true, 'The control have class "sapMRIDisplayOnly" on ' + oRating);
		assert.strictEqual(oRating.$().attr('aria-disabled'), "true", "aria-disabled is set to true on " + oRating);
		assert.strictEqual(oRating.$().attr("tabindex"), "-1", "The control is not in the tab chain");

		// clean
		oRating.destroy();
	});

	QUnit.test("setting editable", function (assert) {
		var oRating = new RatingIndicator({
			value: 3
		});

		oRating.placeAt("content");
		sap.ui.getCore().applyChanges();

		// initial assertion
		assert.strictEqual(oRating.getEditable(), true, 'The Editable property is false on ' + oRating);
		assert.strictEqual(oRating.$().hasClass("sapMRIReadOnly"), false, 'Initially the control does not have class "sapMRIReadOnly" on ' + oRating);
		assert.strictEqual(oRating.$().attr('aria-disabled'), "false", "aria-disabled is set to false on " + oRating);
		assert.strictEqual(oRating.$().attr("tabindex"), "0", "The control is in the tab chain");

		// act
		oRating.setEditable(false);
		sap.ui.getCore().applyChanges();

		// assertion
		assert.strictEqual(oRating.getEditable(), false, 'The Editable property is true on ' + oRating);
		assert.strictEqual(oRating.$().hasClass("sapMRIReadOnly"), true, 'The control have class "sapMRIReadOnly" on ' + oRating);
		assert.strictEqual(oRating.$().attr('aria-disabled'), "false", "aria-disabled is set to true on " + oRating);
		assert.strictEqual(oRating.$().attr("tabindex"), "0", "The control is in the tab chain");

		// clean
		oRating.destroy();
	});

	QUnit.test("setting enabled", function(assert) {
		var oRating = new RatingIndicator({});

		oRating.placeAt("content");
		sap.ui.getCore().applyChanges();

		// initial assertion
		assert.strictEqual(oRating.$().hasClass("sapMRIDisabled"), false, 'Initially the control does not have class "sapMRIDisabled" on ' + oRating);
		assert.strictEqual(oRating.$().attr('aria-disabled'), "false", "aria-disabled is set to false on " + oRating);
		assert.strictEqual(oRating.$().attr("tabindex"), "0", "The control is in the tab chain");

		// act
		oRating.setEnabled(false);
		sap.ui.getCore().applyChanges();

		// assertion
		assert.strictEqual(oRating.$().hasClass("sapMRIDisabled"), true, 'The control have class "sapMRIDisabled" on ' + oRating);
		assert.strictEqual(oRating.$().attr('aria-disabled'), "true", "aria-disabled is set to true on " + oRating);
		assert.strictEqual(oRating.$().attr("tabindex"), "-1", "The control is not in the tab chain");

		// clean
		oRating.destroy();
	});

	QUnit.module("Methods");

	QUnit.test("getter / setter", function (assert) {
		sap.ui.getCore().applyChanges();

		// 0
		assert.strictEqual(oRating0.getValue(), 0, "The rating value is 0 on " + oRating0);
		assert.strictEqual(oRating0.getMaxValue(), 5, "The max rating value is 5 on " + oRating0);

		// 1
		assert.strictEqual(oRating1.getValue(), 1, "The rating value is 1 on " + oRating1);
		assert.strictEqual(oRating1.getMaxValue(), 5, "The max rating value is 5 on " + oRating1);

		// 2
		assert.strictEqual(oRating2.getValue(), 10, "The rating value is 10 on " + oRating2);
		assert.strictEqual(oRating2.getMaxValue(), 10, "The max rating value is 10 on " + oRating2);

		// 3
		assert.strictEqual(oRating3.getValue(), 2.5, "The rating value is 2.5 on " + oRating3);
		assert.strictEqual(oRating3.getMaxValue(), 9, "The max rating value is 10 on " + oRating3);

		// 4
		assert.strictEqual(oRating4.getValue(), 3.5, "The rating value is 3.5 on " + oRating4);
		assert.strictEqual(oRating4.getMaxValue(), 8, "The max rating value is 10 on " + oRating4);

		// check that acutal value is not rounded even though display is showing the rounded value
		assert.strictEqual(oRating9.getValue(), 3.5, "The rating value must be 3.5 on " + oRating9);
		assert.strictEqual(oRating9._roundValueToVisualMode(oRating9.getValue()), 4, "The rounded rating value must be 4 on " + oRating9);

		// check the calculation of _toPx function are correct
		assert.strictEqual(oRating9._toPx(), false, "The result of undefined must be false");
		assert.strictEqual(oRating9._toPx("0"), 0, "The result of 0 must be 0");
		assert.strictEqual(oRating9._toPx("10px"), 10, "The result of 10px must be 10");
		assert.strictEqual(oRating9._toPx("2rem"), 32, "The result of 2rem must be 32");
		assert.strictEqual(oRating9._toPx("0.2rem"), 3, "The result of 0.2rem must be 3");
		assert.strictEqual(oRating9._toPx(".2rem"), 3, "The result of .2rem must be 3");
		assert.strictEqual(oRating9._toPx("1em"), 16, "The result of 1em must be 16");

		// check exceeding value change
		oRating0.setValue(-99); // too small
		assert.strictEqual(oRating0.getValue(), 0, 'Check if getValue() is still 0 on ' + oRating0);
		oRating0.setValue(99); // too large
		assert.strictEqual(oRating0.getValue(), 0, 'Check if getValue() is still 0 on ' + oRating0);
		assert.throws(function () {
			oRating0.setValue("Querstromzerspaner");
		}, /expected float/, "Passing in a wrong type should throw an error");
		assert.strictEqual(oRating0.getValue(), 0, 'Check if getValue() is still 0 on ' + oRating0);

		// change icons
		oRating0.setIconSelected(IconPool.getIconURI("umbrella"));
		oRating0.setIconUnselected(IconPool.getIconURI("nutrition-activity"));
		oRating0.setIconHovered(IconPool.getIconURI("media-play"));

		assert.strictEqual(oRating0.getIconSelected(), IconPool.getIconURI("umbrella"), 'Check if getIconSelected() returns the newly set icon on ' + oRating0);
		assert.strictEqual(oRating0.getIconUnselected(), IconPool.getIconURI("nutrition-activity"), 'Check if getIconSelected() returns the newly set icon on ' + oRating0);
		assert.strictEqual(oRating0.getIconHovered(), IconPool.getIconURI("media-play"), 'Check if getIconSelected() returns the newly set icon on ' + oRating0);

		// change size
		oRating0.setIconSize("50px");
		assert.strictEqual(oRating0.getIconSize(), "50px", 'Check if the icon size is 50x on ' + oRating0);
		oRating0.setIconSize("20pt");
		assert.strictEqual(oRating0.getIconSize(), "20pt", 'Check if the icon size is 20pt on ' + oRating0);
		oRating0.setIconSize("10%");
		assert.strictEqual(oRating0.getIconSize(), "10%", 'Check if the icon size is 10% on ' + oRating0);
	});

	QUnit.test("value setter defaults", function (assert) {
		var oRating = new RatingIndicator({
			value: 5
		});

		oRating.setValue(undefined);
		assert.strictEqual(oRating.getValue(), 0, "The rating value is 0 after calling the setter with \"undefined\" on " + oRating);

		oRating.setValue(5);
		assert.strictEqual(oRating.getValue(), 5, "The rating value is 5 after reset on " + oRating);

		oRating.setValue(null);
		assert.strictEqual(oRating.getValue(), 0, "The rating value is 0 after calling the setter with \"null\" on " + oRating);

		oRating.destroy();
	});

	QUnit.test("Popover should be in compact mode if one of it's parents is compact", function (assert) {
		var oRating = new RatingIndicator({
			value: 5
		});
		var oRating2 = new RatingIndicator({
			value: 5
		});

		// System under Test
		oRating.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oRating._getDensityMode(), "Cozy", "The density mode is Cozy");

		jQuery("html").addClass("sapUiSizeCompact");
		assert.strictEqual(oRating._getDensityMode(), "Compact", "The density mode is Compact");

		jQuery("html").removeClass("sapUiSizeCompact");
		jQuery("html").addClass("sapUiSizeCondensed");
		assert.strictEqual(oRating._getDensityMode(), "Condensed", "The density mode is Cozy");

		jQuery("html").removeClass("sapUiSizeCondensed");
		jQuery("html").addClass("sapUiSizeCozy");
		assert.strictEqual(oRating._getDensityMode(), "Cozy", "The density mode is Cozy");

		jQuery("html").removeClass("sapUiSizeCozy");
		jQuery("body").addClass("sapUiSizeCondensed");
		assert.strictEqual(oRating2._getDensityMode(), "Condensed", "The density mode is set in the body and is Condensed");
		oRating2.placeAt("content");
		sap.ui.getCore().applyChanges();
		jQuery("body").removeClass("sapUiSizeCondensed");
		jQuery("html").addClass("sapUiSizeCozy");

		oRating.destroy();
	});

	QUnit.test("_roundValueToVisualMode", function (assert) {
		var oRating = new RatingIndicator({
			value: 5
		});
		 assert.strictEqual(oRating._roundValueToVisualMode(3.14, true), 4,
			"The function returns large enough value, so that a star can be selected by clicking on its left edge");
	});

	QUnit.module("Events");

	QUnit.test("Firing events", function (assert) {
		assert.expect(6);
		var touches = {
					0: {
						pageX: 150,
						length: 1
					}
				},

				oEventTap = jQuery.Event("tap", {
					target: oRating4.$(),
					touches: touches,
					pageX: 150,
					targetTouches: touches,
					originalEvent: {
						touches: touches
					}
				}),
				oEventTouchStart = jQuery.Event("touchstart", {
					target: oRating4.$(),
					touches: touches,
					targetTouches: touches,
					originalEvent: {
						touches: touches
					}
				}),
				oEventTouchMove = jQuery.Event("touchmove", {
					target: oRating4.$(),
					touches: touches,
					targetTouches: touches,
					originalEvent: {
						touches: touches
					}
				}),
				oEventTouchEnd = jQuery.Event("touchend", {
					targetTouches: touches
				}),
				j,
				i,
				fSelectedWidth = parseFloat(oRating4.$().children(".sapMRatingSelected").css("width")),
				iRemainder,
				iValue;

		// check touch start
		oRating4.ontouchstart(oEventTouchStart);
		assert.strictEqual(oRating4.$("hov").css("display"), "block", 'On touchstart event the rating hover div must be visible on control ' + oRating4);

		// check touch end
		oRating4._ontouchend(oEventTouchEnd);
		assert.strictEqual(oRating4.$().children(".sapMRIHov").css("display"), "none", 'On touchend event the rating hover div must be invisible on control ' + oRating4);

		var setEventValue = function (x) {
			// set event to x
			oEventTouchStart.targetTouches["0"].pageX = x;
			oEventTap.pageX = x;
		};

		// special case (first 1/4 of first icon returns 0 to allow selection of 0 stars)
		setEventValue(4);
		oRating4.ontouchstart(oEventTouchStart);
		oRating4._ontouchmove(oEventTouchStart);
		oRating4._ontouchend(oEventTouchEnd);
		assert.strictEqual(oRating4.getValue(), 0, "On touch start/end at " + oEventTap.pageX + "px  the rating value is 0 on control " + oRating4);

		// special case - when the value is one and the first star is selected again the value should toggle to 0
		setEventValue(18);
		oRating4.setValue(1);
		oRating4.ontouchstart(oEventTouchStart);
		oRating4._ontouchmove(oEventTouchStart);
		oRating4._ontouchend(oEventTouchEnd);
		assert.strictEqual(oRating4.getValue(), 0, "On touch start/end at " + oEventTap.pageX + "px and starting value 1 the rating value should be toggled to 0 on control " + oRating4);

		setEventValue(120);
		oRating4.ontouchstart(oEventTouchStart);
		oRating4._ontouchmove(oEventTouchStart);
		oRating4._ontouchend(oEventTouchEnd);

		var tempValue = oRating4.getValue();

		// change event with invalid values
		setEventValue(9999);
		oRating4.ontouchstart(oEventTouchStart);
		oRating4._ontouchmove(oEventTouchStart);
		oRating4._ontouchend(oEventTouchEnd);
		assert.strictEqual(oRating4.getValue(), oRating4.getMaxValue(), "On touch start/end at " + oEventTap.pageX + "px  the rating value is the maximum on control " + oRating4);

		// change event with invalid values
		setEventValue(-9999);
		oRating4.ontouchstart(oEventTouchStart);
		oRating4._ontouchmove(oEventTouchStart);
		oRating4._ontouchend(oEventTouchEnd);
		assert.strictEqual(oRating4.getValue(), 0, "On touch start/end at " + oEventTap.pageX + "px  the rating value is 0 on control " + oRating4);
	});

	QUnit.test("Keyboard navigation events", function (assert) {
		assert.expect(5);
		// default rating with no properties
		var oRating = new RatingIndicator({visualMode: RatingIndicatorVisualMode.Full}),
				check0function = function (evt) {
					assert.strictEqual(evt.getParameter("value"), 0, "The keyboard event has set the rating value to 0");
					oRating.detachLiveChange(check0function);
				},
				check1function = function (evt) {
					assert.strictEqual(evt.getParameter("value"), 1, "The keyboard event has set the rating value to 1");
					oRating.detachLiveChange(check1function);
					oRating.detachChange(check1function);
				},
				check2function = function (evt) {
					assert.strictEqual(evt.getParameter("value"), 2, "The keyboard event has set the rating value to 2");
					oRating.detachLiveChange(check2function);
					oRating.detachChange(check2function);
				},
				check3function = function (evt) {
					assert.strictEqual(evt.getParameter("value"), 3, "The keyboard event has set the rating value to 3");
					oRating.detachLiveChange(check3function);
					oRating.detachChange(check3function);
				},
				check4function = function (evt) {
					assert.strictEqual(evt.getParameter("value"), 4, "The keyboard event has set the rating value to 4");
					oRating.detachLiveChange(check4function);
					oRating.detachChange(check4function);
				},
				check5function = function (evt) {
					assert.strictEqual(evt.getParameter("value"), 5, "The keyboard event has set the rating value to 5");
					oRating.detachLiveChange(check5function);
					oRating.detachChange(check5function);
				};

		oRating.focus();

		// check increase
		oRating.attachLiveChange(check1function);
		oRating.onsapincrease();

		// check decrease
		oRating.setValue(4);
		oRating.attachLiveChange(check3function);
		oRating.onsapdecrease();

		// check home
		oRating.attachLiveChange(check0function);
		oRating.onsaphome();

		// check end
		oRating.attachLiveChange(check5function);
		oRating.onsapend();

		// check select
		oRating.setValue(3);
		oRating.onsapincrease();
		oRating.attachChange(check5function);
		oRating.onsapselect();

		// check focusout
		oRating.setValue(3);
		oRating.onsapdecrease();
	});

	QUnit.test("Keyboard navigation events - boundary conditions", function (assert) {
		var oRating = new RatingIndicator();

		oRating.onsapdecrease();
		assert.strictEqual(oRating.getValue(), 0, "When value is 0 and onsapdecrease is invoked, Rating Indicator has value 0");

		oRating.setValue(5);
		oRating.onsapincrease();
		assert.strictEqual(oRating.getValue(), 5, "When value is 5 and onsapincrease is invoked, Rating Indicator has value 5");

		oRating.onsapselect();
		assert.strictEqual(oRating.getValue(), 0, "When value is 5 and onsapselect is invoked, Rating Indicator has value 0");

		// Clean up
		oRating.destroy();
	});

	QUnit.test("NUMBER keys", function (assert) {

		//Arrange
		var oRating = new RatingIndicator({maxValue: 6});

		// System under Test
		oRating.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oRating.$().focus(); // set focus on RatingIndicator

		qutils.triggerKeyup(oRating.$(), KeyCodes.DIGIT_1); // trigger number 1 on RatingIndicator
		assert.strictEqual(oRating.getValue(), 1, "Number 1 is pressed, RatingIndicator has value 1");

		qutils.triggerKeyup(oRating.$(), KeyCodes.NUMPAD_3); // trigger number 3 on RatingIndicator
		assert.strictEqual(oRating.getValue(), 3, "Number 3 from the numpad is pressed, RatingIndicator has value 3");

		qutils.triggerKeyup(oRating.$(), KeyCodes.DIGIT_5); // trigger number 5 on RatingIndicator
		assert.strictEqual(oRating.getValue(), 5, "Number 5 is pressed, RatingIndicator has value 5");

		qutils.triggerKeyup(oRating.$(), KeyCodes.DIGIT_0); // trigger number 0 on RatingIndicator
		assert.strictEqual(oRating.getValue(), 0, "Number 0 is pressed, RatingIndicator has value 0");

		qutils.triggerKeyup(oRating.$(), KeyCodes.NUMPAD_7); // trigger number 7 on RatingIndicator
		assert.strictEqual(oRating.getValue(), 6, "Number 7 from the numpad is pressed, RatingIndicator has value 6 (default maxValue is 6)");

		// Clean up
		oRating.destroy();
	});

	QUnit.test("Keyboard handling events in half mode", function (assert) {
		assert.expect(10);
		var oRating = new RatingIndicator("asd", {visualMode: RatingIndicatorVisualMode.Half}),
				fnTestIncreaseAndDecrease = function (fInitialRatingValue, fExpectedValueAfterDecrease, fExpectedValueAfterIncrease) {
					oRating.setValue(fInitialRatingValue);
					oRating.onsapdecrease();
					assert.strictEqual(oRating.getValue(), fExpectedValueAfterDecrease,
							"When arrow left is pressed and value is " + fInitialRatingValue + ", Rating Indicator has value " + fExpectedValueAfterDecrease);

					oRating.setValue(fInitialRatingValue);
					oRating.onsapincrease();
					assert.strictEqual(oRating.getValue(), fExpectedValueAfterIncrease,
							"When arrow right is pressed and value is" + fInitialRatingValue + ", Rating Indicator has value " + fExpectedValueAfterDecrease);
				};

		fnTestIncreaseAndDecrease(2, 1, 3);
		fnTestIncreaseAndDecrease(1.24, 0, 2); // 1.24 is rounded and visualized as 1
		fnTestIncreaseAndDecrease(1.25, 1, 2); // 1.25 is rounded and visualized as 1.5
		fnTestIncreaseAndDecrease(1.74, 1, 2); // 1.74 is rounded and visualized as 1.5
		fnTestIncreaseAndDecrease(1.75, 1, 3); // 1.75 is rounded and visualized as 2

		// Clean up
		oRating.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("getAccessibilityInfo", function (assert) {
		var oControl = new RatingIndicator({value: 5, maxValue: 10});
		assert.ok(!!oControl.getAccessibilityInfo, "RatingIndicator has a getAccessibilityInfo function");
		var oInfo = oControl.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, "slider", "AriaRole");
		assert.strictEqual(oInfo.type, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_RATING"), "Type");
		assert.strictEqual(oInfo.description, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_STATE_RATING", [5, 10]), "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, oControl.getEditable(), "Editable");
		oControl.setValue(0);
		oControl.setEnabled(false);
		oInfo = oControl.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_STATE_RATING", [0, 10]), "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");

		oControl.setEnabled(true);
		oInfo = oControl.getAccessibilityInfo();
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");

		oControl.setDisplayOnly(true);
		oInfo = oControl.getAccessibilityInfo();
		assert.strictEqual(oInfo.focusable, false, "Not focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");

		oControl.destroy();
	});

	QUnit.module("Performance");

	QUnit.test("Call size and padding calculations once for each size", function (assert) {
		// Reset all mappings
		RatingIndicator.sizeMapppings = {};
		RatingIndicator.iconPaddingMappings = {};
		RatingIndicator.paddingValueMappping = {};

		var oBI = new RatingIndicator();
		var oFnSpy = this.spy(oBI, "_toPx");

		for (var i = 0; i < 100; i++) {
			oBI.onBeforeRendering();
		}

		assert.strictEqual(oFnSpy.callCount, 2, "Calculations should be done only 2 times for all elements with the same size");
	});
});