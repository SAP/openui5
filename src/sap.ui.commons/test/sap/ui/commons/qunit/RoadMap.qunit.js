/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/RoadMap",
	"sap/ui/commons/RoadMapStep"
], function(qutils, createAndAppendDiv, RoadMap, RoadMapStep) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3"]);



	var createRoadMap = function(iIdSuffix, oProps){
		var oRoadMap = new RoadMap("rm" + iIdSuffix, oProps);
		oRoadMap.placeAt("uiArea" + iIdSuffix);
		return oRoadMap;
	};

	var createRoadMapStep = function(oParent, iIdSuffix, oProps){
		var bIsMainStep = oParent instanceof RoadMap;
		var sId = bIsMainStep ? "s" + iIdSuffix : oParent.getId() + iIdSuffix;
		if (!oProps) {oProps = {};}
		oProps.label = "Step " + sId.substring(1, sId.length);
		var oStep = new RoadMapStep(sId, oProps);
		if (bIsMainStep){
			oParent.addStep(oStep);
		} else {
			oParent.addSubStep(oStep);
		}
		return oStep;
	};

	//Roadmap with custom property values (except property 'visible')
	var oRoadMap1 = createRoadMap(1, {numberOfVisibleSteps: 5, firstVisibleStep: "s2", width: "600px", selectedStep: "s4"});
	createRoadMapStep(oRoadMap1, 1);
	createRoadMapStep(oRoadMap1, 2, {enabled: false});
	var oStep3 = createRoadMapStep(oRoadMap1, 3);
	createRoadMapStep(oStep3, "a");
	createRoadMapStep(oStep3, "b", {enabled: false});
	createRoadMapStep(oStep3, "c", {visible: false});
	createRoadMapStep(oStep3, "d");
	createRoadMapStep(oRoadMap1, 4);
	var oStep5 = createRoadMapStep(oRoadMap1, 5, {expanded: true});
	createRoadMapStep(oStep5, "a");
	createRoadMapStep(oStep5, "b", {enabled: false});
	createRoadMapStep(oStep5, "c", {visible: false});
	createRoadMapStep(oStep5, "d");
	createRoadMapStep(oRoadMap1, 6, {visible: false});
	createRoadMapStep(oRoadMap1, 7);

	//Invisible Roadmap with default property values (except property 'visible')
	var oRoadMap2 = createRoadMap(2, {visible: false});
	var oStep = new RoadMapStep({expanded: true});
	oStep.addSubStep(new RoadMapStep()); //Expanded=true can only be set when a sub step exists and step is enabled
	oRoadMap2.addStep(oStep);
	oRoadMap2.addStep(new RoadMapStep({enabled: false, visible: false, label: "Hallo"}));

	//Roadmap with default property values
	var oRoadMap3 = createRoadMap(3, {});
	oRoadMap3.addStep(new RoadMapStep());



	var checkFocus = function(sId, sText, assert){
		assert.equal(document.activeElement.id, sId, sText);
	};

	var checkVisible = function(sId, bExpectVisible){
		var bVisible = jQuery("#" + sId).is(":visible");
		return (bExpectVisible && bVisible) || (!bExpectVisible && !bVisible);
	};

	var checkExpandState = function(sIdSuffix, bExpectExpanded, assert){
		var sStepId = "s" + sIdSuffix;
		var aSubStepIds = [sStepId + "a", sStepId + "b", sStepId + "c", sStepId + "d"];
		for (var i = 0; i < aSubStepIds.length; i++){
			var bExpectVisible = bExpectExpanded ? (aSubStepIds[i] != sStepId + "c") : false;
			assert.ok(checkVisible(aSubStepIds[i], bExpectVisible), "Sub Step " + aSubStepIds[i] + " is " + (bExpectVisible ? "" : "not ") + "shown for " + (bExpectVisible ? "" : "not ") + "expanded step");
		}
		assert.ok(checkVisible(sStepId + "-expandend", bExpectExpanded), "End Step is " + (bExpectExpanded ? "" : "not ") + "shown for " + (bExpectExpanded ? "" : "not ") + "expanded step");
	};



	QUnit.module("Properties and Aggregations");

	QUnit.test("Properties - Default Values", function(assert) {
		assert.ok(!oRoadMap2.getSelectedStep(), "Default 'selectedStep'");
		assert.ok(!oRoadMap2.getFirstVisibleStep(), "Default 'firstVisibleStep'");
		assert.ok(!oRoadMap2.getNumberOfVisibleSteps(), "Default 'numberOfVisibleSteps'");
		assert.equal(oRoadMap2.getWidth(), "100%", "Default 'width'");
		assert.equal(oRoadMap1.getVisible(), true, "Default 'visible'");

		assert.equal(oRoadMap2.getSteps()[0].getVisible(), true, "Step: Default 'visible'");
		assert.equal(oRoadMap2.getSteps()[0].getEnabled(), true, "Step: Default 'enabled'");
		assert.equal(oRoadMap2.getSteps()[1].getExpanded(), false, "Step: Default 'expanded'");
		assert.ok(!oRoadMap2.getSteps()[0].getLabel(), "Step: Default 'label'");
	});

	QUnit.test("Properties - Custom Values", function(assert) {
		assert.equal(oRoadMap1.getSelectedStep(), "s4", "Custom 'selectedStep'");
		assert.equal(oRoadMap1.getFirstVisibleStep(), "s2", "Custom 'firstVisibleStep'");
		assert.equal(oRoadMap1.getNumberOfVisibleSteps(), 5, "Custom 'numberOfVisibleSteps'");
		assert.equal(oRoadMap1.getWidth(), "600px", "Custom 'width'");
		assert.equal(oRoadMap2.getVisible(), false, "Custom 'visible'");

		assert.equal(oRoadMap2.getSteps()[1].getVisible(), false, "Step: Custom 'visible'");
		assert.equal(oRoadMap2.getSteps()[1].getEnabled(), false, "Step: Custom 'enabled'");
		assert.equal(oRoadMap2.getSteps()[0].getExpanded(), true, "Step: Custom 'expanded'");
		assert.equal(oRoadMap2.getSteps()[1].getLabel(), "Hallo", "Step: Custom 'label'");
	});

	QUnit.test("Aggregation 'Steps'", function(assert) {
		assert.equal(oRoadMap2.getSteps().length, 2, "# Steps");
		oRoadMap2.addStep(new RoadMapStep());
		oRoadMap2.addStep(new RoadMapStep());
		assert.equal(oRoadMap2.getSteps().length, 4, "# Steps after add");
		oRoadMap2.insertStep(new RoadMapStep("newstep"), 1);
		assert.equal(oRoadMap2.getSteps().length, 5, "# Steps after insert");
		assert.equal(oRoadMap2.getSteps()[1].getId(), "newstep", "Id of inserted Step");
		oRoadMap2.removeStep(0);
		assert.equal(oRoadMap2.getSteps().length, 4, "# Steps after insert");
		oRoadMap2.destroySteps();
		assert.equal(oRoadMap2.getSteps().length, 0, "# Steps after destroy");
	});


	QUnit.module("Appearance");

	QUnit.test("Visibility", function(assert) {
		assert.equal(jQuery("#rm1").length, 1, "Visible Roadmap is rendered");
		assert.equal(jQuery("#rm2").length, 0, "Hidden Roadmap is not rendered");

		assert.equal(jQuery("#s6").length, 1, "Hidden step is rendered");
		assert.ok(!jQuery("#s6").is(":visible"), "Hidden step is not visible");
	});

	QUnit.test("Width", function(assert) {
		assert.equal(jQuery("#rm3").width(), jQuery("#uiArea3").width(), "By default the Roadmap has 100% width");
		assert.equal(jQuery("#rm1").width(), 600, "Fixed Roadmap width");
	});

	QUnit.test("# Visible Steps", function(assert) {
		assert.equal(jQuery("#s1").width() * 5, jQuery("#rm1-steparea").width(), "5 Steps visible");
	});

	QUnit.test("First visible Step", function(assert) {
		assert.equal(jQuery("#s1").width(), jQuery("#rm1-steparea").scrollLeft(), "Area scrolled to 2. step");
	});

	QUnit.test("Overflow", function(assert) {
		assert.ok(jQuery("#rm3-Start").hasClass("sapUiRoadMapStartFixed"), "Delimiter start CSS class when scrolling not possible");
		assert.ok(jQuery("#rm3-End").hasClass("sapUiRoadMapEndFixed"), "Delimiter end CSS class when scrolling not possible");
		assert.ok(jQuery("#rm1-Start").hasClass("sapUiRoadMapStartScroll"), "Delimiter start CSS class when scrolling possible");
		assert.ok(jQuery("#rm1-End").hasClass("sapUiRoadMapEndScroll"), "Delimiter end CSS class when scrolling possible");
	});

	QUnit.test("Selection", function(assert) {
		for (var i = 1; i < 8; i++){
			if (i == 4){
				assert.ok(jQuery("#s" + i).hasClass("sapUiRoadMapSelected"), "Selected Step has special CSS class");
			} else {
				assert.ok(!jQuery("#s" + i).hasClass("sapUiRoadMapSelected"), "Not selected Step has no special CSS class");
			}
		}
	});

	QUnit.test("Enablement", function(assert) {
		for (var i = 1; i < 8; i++){
			if (i == 2){
				assert.ok(jQuery("#s" + i).hasClass("sapUiRoadMapDisabled"), "Disabled Step has special CSS class");
			} else {
				assert.ok(!jQuery("#s" + i).hasClass("sapUiRoadMapDisabled"), "Enabled Step has no special CSS class");
			}
		}
	});

	QUnit.test("Expand State", function(assert) {
		checkExpandState(3, false, assert);
		checkExpandState(5, true, assert);
	});


	QUnit.module("Interaction - Mouse");

	QUnit.test("Click on step", function(assert) {
		var done = assert.async();
		var handler = function(oControlEvent){
			assert.equal(oControlEvent.getParameter("stepId"), "s5a", "Selected item in event after mouse click:");
			assert.ok(jQuery("#s5a").hasClass("sapUiRoadMapSelected"), "Selected Step has special CSS class");
			assert.ok(!jQuery("#s4").hasClass("sapUiRoadMapSelected"), "Previous selected Step has no special CSS class anymore");
			setTimeout(function(){
				checkFocus("s5a-box", "Focus on clicked step", assert);
				done();
			}, 0);
			oRoadMap1.detachStepSelected(handler);
		};
		oRoadMap1.attachStepSelected(handler);
		qutils.triggerEvent("click", "s5a", {}); //Focus is set automatically by the step when selected
	});

	QUnit.test("Click on disabled step", function(assert) {
		var done = assert.async();
		var handler = function(oControlEvent){
			assert.ok(false, "Event must not be triggered!!");
			oRoadMap1.detachStepSelected(handler);
			done();
		};
		oRoadMap1.attachStepSelected(handler);
		qutils.triggerEvent("click", "s2", {});
		jQuery("#s2-box").get(0).focus(); //Focus must be set manually to get the "real" behavior
		setTimeout(function(){
			assert.ok(jQuery("#s5a").hasClass("sapUiRoadMapSelected"), "Selected Step has still special CSS class");
			assert.ok(!jQuery("#s2").hasClass("sapUiRoadMapSelected"), "Clicked Step has no special CSS class");
			checkFocus("s2-box", "Focus on clicked step", assert);
			oRoadMap1.detachStepSelected(handler);
			done();
		}, 500);
	});

	QUnit.test("Click on expandable step (not expanded)", function(assert) {
		var done = assert.async();
		var bExpandEventFired = false;
		var handler = function(oControlEvent){
			assert.equal(oControlEvent.getParameter("stepId"), "s3", "Selected item in select event after mouse click:");
			assert.ok(jQuery("#s3").hasClass("sapUiRoadMapSelected"), "Selected Step has special CSS class");
			assert.ok(!jQuery("#s5a").hasClass("sapUiRoadMapSelected"), "Previous selected Step has no special CSS class anymore");
			assert.ok(bExpandEventFired, "Expand event was fired");
			checkExpandState(3, true, assert);
			setTimeout(function(){
				checkFocus("s3-box", "Focus on clicked step", assert);
				done();
			}, 0);
			oRoadMap1.detachStepSelected(handler);
		};
		var handler2 = function(oControlEvent){
			var oStep = sap.ui.getCore().byId(oControlEvent.getParameter("stepId"));
			assert.equal(oStep.getId(), "s3", "Expanded item in expand event after mouse click:");
			assert.ok(oStep.getExpanded(), "Step is expanded");
			oRoadMap1.detachStepExpanded(handler2);
			bExpandEventFired = true;
		};
		oRoadMap1.attachStepSelected(handler);
		oRoadMap1.attachStepExpanded(handler2);
		qutils.triggerEvent("click", "s3", {}); //Focus is set automatically by the step when selected
	});

	QUnit.test("Click on expandable step (expanded)", function(assert) {
		var done = assert.async();
		var bExpandEventFired = false;
		assert.ok(jQuery("#s3").hasClass("sapUiRoadMapSelected"), "Selected Step still has special CSS class");

		var handler = function(oControlEvent){
			assert.ok(false, "No Selected Event should be fired because step was already selected");
		};
		var handler2 = function(oControlEvent){
			var oStep = sap.ui.getCore().byId(oControlEvent.getParameter("stepId"));
			assert.equal(oStep.getId(), "s3", "Expanded item in expand event after mouse click:");
			assert.ok(!oStep.getExpanded(), "Step is not expanded");
			oRoadMap1.detachStepExpanded(handler2);
			bExpandEventFired = true;
		};

		setTimeout(function(){
			assert.ok(jQuery("#s3").hasClass("sapUiRoadMapSelected"), "Selected Step still has special CSS class");
			checkExpandState(3, false, assert);
			checkFocus("s3-box", "Focus on clicked step", assert);
			assert.ok(bExpandEventFired, "Expand event was fired");
			oRoadMap1.detachStepSelected(handler);
			done();
		}, 1000);

		oRoadMap1.attachStepSelected(handler);
		oRoadMap1.attachStepExpanded(handler2);
		qutils.triggerEvent("click", "s3", {}); //Focus is set automatically by the step when selected
	});

	QUnit.test("Click on left scroll overflow", function(assert) {
		var done = assert.async();
		setTimeout(function(){
			assert.ok(jQuery("#s3").hasClass("sapUiRoadMapSelected"), "Selected Step still has special CSS class");
			assert.equal(jQuery("#rm1-steparea").scrollLeft(), 0, "Area scrolled to 1. step");
			checkFocus("s3-box", "Focus still on previously clicked step", assert);
			done();
		}, 1500);
		qutils.triggerEvent("click", "rm1-Start", {}); //Focus is set automatically by the step when selected
	});

	QUnit.test("Click on left scroll overflow (disabled)", function(assert) {
		var done = assert.async();
		setTimeout(function(){
			assert.ok(jQuery("#s3").hasClass("sapUiRoadMapSelected"), "Selected Step still has special CSS class");
			assert.equal(jQuery("#rm1-steparea").scrollLeft(), 0, "Area scrolled to 1. step");
			checkFocus("s3-box", "Focus still on previously clicked step", assert);
			done();
		}, 1500);
		qutils.triggerEvent("click", "rm1-Start", {}); //Focus is set automatically by the step when selected
	});

	QUnit.test("Click on right scroll overflow", function(assert) {
		var done = assert.async();
		setTimeout(function(){
			assert.ok(jQuery("#s3").hasClass("sapUiRoadMapSelected"), "Selected Step still has special CSS class");
			assert.equal(jQuery("#rm1-steparea").scrollLeft(), jQuery("#s1").width(), "Area scrolled to 2. step");
			checkFocus("s3-box", "Focus still on previously clicked step", assert);
			done();
		}, 1500);
		qutils.triggerEvent("click", "rm1-End", {}); //Focus is set automatically by the step when selected
	});


	QUnit.module("Interaction - Keyboard");

	QUnit.test("SPACE key on step", function(assert) {
		var done = assert.async();
		var handler = function(oControlEvent){
			assert.equal(oControlEvent.getParameter("stepId"), "s5a", "Selected item in event after SPACE:");
			assert.ok(jQuery("#s5a").hasClass("sapUiRoadMapSelected"), "Selected Step has special CSS class");
			assert.ok(!jQuery("#s3").hasClass("sapUiRoadMapSelected"), "Previous selected Step has no special CSS class anymore");
			oRoadMap1.detachStepSelected(handler);
			done();
		};
		oRoadMap1.attachStepSelected(handler);
		jQuery("#s5a-box").get(0).focus();
		qutils.triggerKeyboardEvent("s5a", "SPACE");
	});

	QUnit.test("ENTER key on step", function(assert) {
		var done = assert.async();
		var handler = function(oControlEvent){
			assert.equal(oControlEvent.getParameter("stepId"), "s4", "Selected item in event after ENTER:");
			assert.ok(jQuery("#s4").hasClass("sapUiRoadMapSelected"), "Selected Step has special CSS class");
			assert.ok(!jQuery("#s5a").hasClass("sapUiRoadMapSelected"), "Previous selected Step has no special CSS class anymore");
			oRoadMap1.detachStepSelected(handler);
			done();
		};
		oRoadMap1.attachStepSelected(handler);
		jQuery("#s4-box").get(0).focus();
		qutils.triggerKeyboardEvent("s4", "ENTER");
	});

	QUnit.test("SPACE key on disabled step", function(assert) {
		var done = assert.async();
		var handler = function(oControlEvent){
			assert.ok(false, "Event must not be triggered!!");
			oRoadMap1.detachStepSelected(handler);
			done();
		};
		oRoadMap1.attachStepSelected(handler);
		jQuery("#s2-box").get(0).focus();
		qutils.triggerKeyboardEvent("s2", "SPACE");
		setTimeout(function(){
			assert.ok(jQuery("#s4").hasClass("sapUiRoadMapSelected"), "Selected Step has still special CSS class");
			assert.ok(!jQuery("#s2").hasClass("sapUiRoadMapSelected"), "Current Step has no special CSS class");
			oRoadMap1.detachStepSelected(handler);
			done();
		}, 500);
	});

	QUnit.test("ENTER key on disabled step", function(assert) {
		var done = assert.async();
		var handler = function(oControlEvent){
			assert.ok(false, "Event must not be triggered!!");
			oRoadMap1.detachStepSelected(handler);
			done();
		};
		oRoadMap1.attachStepSelected(handler);
		jQuery("#s2-box").get(0).focus();
		qutils.triggerKeyboardEvent("s2", "ENTER");
		setTimeout(function(){
			assert.ok(jQuery("#s4").hasClass("sapUiRoadMapSelected"), "Selected Step has still special CSS class");
			assert.ok(!jQuery("#s2").hasClass("sapUiRoadMapSelected"), "Current Step has no special CSS class");
			oRoadMap1.detachStepSelected(handler);
			done();
		}, 500);
	});

	QUnit.test("SPACE key expandable step (not expanded)", function(assert) {
		var done = assert.async();
		var bExpandEventFired = false;
		var handler = function(oControlEvent){
			assert.equal(oControlEvent.getParameter("stepId"), "s3", "Selected item in event after SPACE:");
			assert.ok(jQuery("#s3").hasClass("sapUiRoadMapSelected"), "Selected Step has special CSS class");
			assert.ok(!jQuery("#4").hasClass("sapUiRoadMapSelected"), "Previous selected Step has no special CSS class anymore");
			assert.ok(bExpandEventFired, "Expand event was fired");
			checkExpandState(3, true, assert);
			oRoadMap1.detachStepSelected(handler);
			done();
		};
		var handler2 = function(oControlEvent){
			var oStep = sap.ui.getCore().byId(oControlEvent.getParameter("stepId"));
			assert.equal(oStep.getId(), "s3", "Expanded item in expand event after mouse click:");
			assert.ok(oStep.getExpanded(), "Step is expanded");
			oRoadMap1.detachStepExpanded(handler2);
			bExpandEventFired = true;
		};

		oRoadMap1.attachStepSelected(handler);
		oRoadMap1.attachStepExpanded(handler2);
		jQuery("#s3-box").get(0).focus();
		qutils.triggerKeyboardEvent("s3", "SPACE");
	});

	QUnit.test("SPACE key expandable step (expanded)", function(assert) {
		var done = assert.async();
		var bExpandEventFired = false;
		assert.ok(jQuery("#s3").hasClass("sapUiRoadMapSelected"), "Selected Step still has special CSS class");

		var handler = function(oControlEvent){
			assert.ok(false, "No Selected Event should be fired because step was already selected");
		};
		var handler2 = function(oControlEvent){
			var oStep = sap.ui.getCore().byId(oControlEvent.getParameter("stepId"));
			assert.equal(oStep.getId(), "s3", "Expanded item in expand event after mouse click:");
			assert.ok(!oStep.getExpanded(), "Step is not expanded");
			oRoadMap1.detachStepExpanded(handler2);
			bExpandEventFired = true;
		};

		setTimeout(function(){
			assert.ok(jQuery("#s3").hasClass("sapUiRoadMapSelected"), "Selected Step still has special CSS class");
			checkExpandState(3, false, assert);
			checkFocus("s3-box", "Focus on selected step", assert);
			assert.ok(bExpandEventFired, "Expand event was fired");
			oRoadMap1.detachStepSelected(handler);
			done();
		}, 1000);

		oRoadMap1.attachStepSelected(handler);
		oRoadMap1.attachStepExpanded(handler2);
		qutils.triggerKeyboardEvent("s3", "SPACE");
	});

	QUnit.test("ENTER key expandable step (not expanded)", function(assert) {
		var done = assert.async();
		var bExpandEventFired = false;
		assert.ok(jQuery("#s3").hasClass("sapUiRoadMapSelected"), "Selected Step still has special CSS class");

		var handler = function(oControlEvent){
			assert.ok(false, "No Selected Event should be fired because step was already selected");
		};
		var handler2 = function(oControlEvent){
			var oStep = sap.ui.getCore().byId(oControlEvent.getParameter("stepId"));
			assert.equal(oStep.getId(), "s3", "Expanded item in expand event after mouse click:");
			assert.ok(oStep.getExpanded(), "Step is expanded");
			oRoadMap1.detachStepExpanded(handler2);
			bExpandEventFired = true;
		};

		setTimeout(function(){
			assert.ok(jQuery("#s3").hasClass("sapUiRoadMapSelected"), "Selected Step still has special CSS class");
			checkExpandState(3, true, assert);
			checkFocus("s3-box", "Focus on selected step", assert);
			assert.ok(bExpandEventFired, "Expand event was fired");
			oRoadMap1.detachStepSelected(handler);
			done();
		}, 1000);

		oRoadMap1.attachStepSelected(handler);
		oRoadMap1.attachStepExpanded(handler2);
		qutils.triggerKeyboardEvent("s3", "ENTER");
	});

	QUnit.test("ENTER key expandable step (expanded)", function(assert) {
		var done = assert.async();
		var bExpandEventFired = false;
		assert.ok(jQuery("#s3").hasClass("sapUiRoadMapSelected"), "Selected Step still has special CSS class");

		var handler = function(oControlEvent){
			assert.ok(false, "No Selected Event should be fired because step was already selected");
		};
		var handler2 = function(oControlEvent){
			var oStep = sap.ui.getCore().byId(oControlEvent.getParameter("stepId"));
			assert.equal(oStep.getId(), "s3", "Expanded item in expand event after mouse click:");
			assert.ok(!oStep.getExpanded(), "Step is not expanded");
			oRoadMap1.detachStepExpanded(handler2);
			bExpandEventFired = true;
		};

		setTimeout(function(){
			assert.ok(jQuery("#s3").hasClass("sapUiRoadMapSelected"), "Selected Step still has special CSS class");
			checkExpandState(3, false, assert);
			checkFocus("s3-box", "Focus on selected step", assert);
			assert.ok(bExpandEventFired, "Expand event was fired");
			oRoadMap1.detachStepSelected(handler);
			done();
		}, 1000);

		oRoadMap1.attachStepSelected(handler);
		oRoadMap1.attachStepExpanded(handler2);
		qutils.triggerKeyboardEvent("s3", "ENTER");
	});

	QUnit.test("Item navigation", function(assert) {
		var done = assert.async();
		jQuery("#rm1").get(0).focus();
		setTimeout(function(){
			checkFocus("s2-box", "First visible step is focused when entering the Roadmap", assert);
			qutils.triggerKeyboardEvent("s2", "ARROW_LEFT");
			setTimeout(function(){
				checkFocus("s1-box", "Step 1 has focus after ARROW_LEFT", assert);
				qutils.triggerKeyboardEvent("s1", "ARROW_LEFT");
				setTimeout(function(){
					checkFocus("s1-box", "Step 1 has still focus after ARROW_LEFT", assert);
					qutils.triggerKeyboardEvent("s1", "ARROW_RIGHT");
					setTimeout(function(){
						checkFocus("s2-box", "Step 2 has focus after ARROW_RIGHT", assert);
						qutils.triggerKeyboardEvent("s2", "ARROW_DOWN");
						setTimeout(function(){
							checkFocus("s3-box", "Step 3 has focus after ARROW_DOWN", assert);
							qutils.triggerKeyboardEvent("s3", "ARROW_RIGHT");
							setTimeout(function(){
								checkFocus("s4-box", "Step 4 has focus after ARROW_RIGHT", assert);
								qutils.triggerKeyboardEvent("s4", "ARROW_DOWN");
								setTimeout(function(){
									checkFocus("s5-box", "Step 5 has focus after ARROW_DOWN", assert);
									qutils.triggerKeyboardEvent("s5", "ARROW_UP");
									setTimeout(function(){
										checkFocus("s4-box", "Step 4 has focus after ARROW_UP", assert);
										qutils.triggerKeyboardEvent("s4", "ARROW_RIGHT");
										setTimeout(function(){
											checkFocus("s5-box", "Step 5 has focus after ARROW_RIGHT", assert);
											qutils.triggerKeyboardEvent("s5", "ARROW_DOWN");
											setTimeout(function(){
												checkFocus("s5a-box", "Step 5a has focus after ARROW_DOWN", assert);
												assert.equal(jQuery("#rm1-steparea").scrollLeft(), jQuery("#s1").width(), "Area scrolled to 2. step");
												done();
											}, 500);
										}, 500);
									}, 500);
								}, 500);
							}, 500);
						}, 500);
					}, 500);
				}, 500);
			}, 500);
		}, 0);
	});

	QUnit.test("Item navigation - HOME / END", function(assert) {
		var done = assert.async();
		jQuery("#rm1").get(0).focus();
		setTimeout(function(){
			checkFocus("s2-box", "First visible step is focused when entering the Roadmap", assert);
			qutils.triggerKeyboardEvent("s2", "END");
			setTimeout(function(){
				checkFocus("s7-box", "Step 7 has focus after END", assert);
				assert.equal(jQuery("#rm1-steparea").scrollLeft(), jQuery("#s1").width() * 5, "Area scrolled to step 5a");
				qutils.triggerKeyboardEvent("s7", "HOME");
				setTimeout(function(){
					checkFocus("s1-box", "Step 1 has focus after HOME", assert);
					assert.equal(jQuery("#rm1-steparea").scrollLeft(), 0, "Area scrolled to step 1");
					done();
				}, 1200);
			}, 1200);
		}, 0);
	});
});