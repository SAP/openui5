/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/layout/ResponsiveFlowLayout",
	"sap/ui/commons/layout/ResponsiveFlowLayoutData",
	"sap/ui/commons/Button",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/jqueryui/jquery-ui-position" // jQuery.fn.position
], function(
	createAndAppendDiv,
	ResponsiveFlowLayout,
	ResponsiveFlowLayoutData,
	Button,
	jQuery
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("uiArea1").setAttribute("class", "sampleButtonBox");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		".sampleButtonBox {" +
		"	border: 1px solid blue;" +
		"	-webkit-border-radius: 3px;" +
		"	-moz-border-radius: 3px;" +
		"	border-radius: 3px;" +
		"	margin: 0 10px;" +
		"	padding: 5px;" +
		"}";
	document.head.appendChild(styleElement);


	var oRFL = new ResponsiveFlowLayout("rflLayout");
	oRFL.placeAt("uiArea1");

	var oBtn1 = new Button("button1", {
		text : "Button1",
		width : "100%"
	});
	oBtn1.setLayoutData(new ResponsiveFlowLayoutData());

	var oBtn2 = new Button("button2", {
		text : "Button1 (lb)",
		width : "100%"
	});
	oBtn2.setLayoutData(new ResponsiveFlowLayoutData({
		weight : 2,
		linebreak : false
	}));

	// adding content
	oRFL.addContent(oBtn1);
	oRFL.addContent(oBtn2);


	QUnit.module("Basics", {
		beforeEach : function() {
			oBtn1.getLayoutData().setLinebreak(false);
			oBtn2.getLayoutData().setLinebreak(false);

			var $layout = jQuery("#uiArea1");
			$layout.css("width", "300px");
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("Button doubled size?", function(assert) {
		assert.expect(1);
		var $btn1 = jQuery("#button1-cont0_0");
		var $btn2 = jQuery("#button2-cont0_1");
		var rangeTolerance = 10;

		var w1 = $btn1.width() * 2;
		var w2 = $btn2.width();

		/*
		 * if Button2 is about twice. Due to rounding mistakes it might be that the doubled size isn't exactly twice of Button1
		 */
		var bTest = (w1 + rangeTolerance > w2) && (w1 - rangeTolerance < w2);

		assert.ok(bTest, "Button2 is twice of Button2");
	});

	QUnit.test("Line break works & LayoutData event catched by Layout", function(assert) {
		assert.expect(2);
		oBtn2.getLayoutData().setLinebreak(true);
		sap.ui.getCore().applyChanges();

		var $btn1 = jQuery("#button1-cont0_0");
		var $btn2 = jQuery("#button2-cont1_0");

		var bTest = ($btn1.length > 0) && ($btn2.length > 0);

		assert.ok(bTest, "Line break for button");
		assert.ok(bTest, "LayoutDataChanged event catched by Layout");
	});

	QUnit.module("Resize", {
		beforeEach : function() {
			oBtn1.getLayoutData().setLinebreak(false);
			oBtn2.getLayoutData().setLinebreak(false);

			var $layout = jQuery("#uiArea1");
			$layout.css("width", "400px");
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("Shrink", function(assert) {
		var done = assert.async();
		assert.expect(2);

		var $layout = jQuery("#uiArea1");
		// this sets the layout to a size where the size falls below the min-width of a button
		$layout.css("width", "150px");
		sap.ui.getCore().applyChanges();

		// have to wait more than 300ms until the layout recognized the minimization
		setTimeout(function() {
			var $btn1 = jQuery("#button1-cont0_0");
			var $btn2 = jQuery("#button2-cont0_1");

			var bTest = ($btn1.length > 0) && ($btn2.length > 0);
			assert.ok(bTest, "Buttons are logically in one single line");

			if (bTest) {
				var oBtn1Rect = $btn1.rect();
				var oBtn2Rect = $btn2.rect();

				bTest = oBtn1Rect.top !== oBtn2Rect.top;
			}
			assert.ok(bTest, "Layout wrapped second button");

			done();

		}, 500);
	});

	QUnit.test("Enlarge", function(assert) {
		var done = assert.async();
		assert.expect(1);

		// have to wait more than 300ms until the layout recognized the minimization
		setTimeout(function() {
			var $btn1 = jQuery("#button1-cont0_0");
			var $btn2 = jQuery("#button2-cont0_1");

			var bTest = ($btn1.length > 0) && ($btn2.length > 0);
			if (bTest) {
				var p1 = $btn1.position();
				var p2 = $btn2.position();

				bTest = !!(p1.top === p2.top);
			}

			assert.ok(bTest, "Layout wrapped back to one line");
			done();

		}, 500);
	});
});