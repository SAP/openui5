/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/layout/ResponsiveFlowLayout",
	"sap/ui/layout/ResponsiveFlowLayoutData",
	"sap/ui/commons/Button"
], function(ResponsiveFlowLayout, ResponsiveFlowLayoutData, Button) {
	"use strict";

	var oRFL = new ResponsiveFlowLayout("rflLayout");
	oRFL.placeAt("qunit-fixture");

	var oBtn1 = new Button("button1", {
		text : "Button1",
		width : "100%"
	});
	oBtn1.setLayoutData(new ResponsiveFlowLayoutData());

	var oBtn2 = new Button("button2", {
		text : "Button2 (lb)",
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

			var $layout = jQuery.sap.byId("qunit-fixture");
			$layout.css("width", "300px");
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("Button doubled size?", function(assert) {
		assert.expect(1);
		var $btn1 = jQuery.sap.byId("button1-cont0_0");
		var $btn2 = jQuery.sap.byId("button2-cont0_1");
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
		assert.expect(3);
		oBtn2.getLayoutData().setLinebreak(true);
		sap.ui.getCore().applyChanges();

		var oBtn1DomRef = jQuery.sap.domById("button1-cont0_0");
		var oBtn2DomRef = jQuery.sap.domById("button2-cont1_0");

		var bTest = oBtn1DomRef !== null && oBtn2DomRef !== null;

		assert.ok(bTest, "Line break for button");
		assert.ok(bTest, "LayoutDataChanged event catched by Layout");

		var oRow1DomRef = jQuery.sap.domById("rflLayout-row0");
		var oRow2DomRef = jQuery.sap.domById("rflLayout-row1");

		bTest = oRow1DomRef !== null && oRow2DomRef !== null;

		assert.ok(bTest, "Buttons put in separate rows with correct IDs");
	});

	QUnit.module("Resize", {
		beforeEach : function() {
			oBtn1.getLayoutData().setLinebreak(false);
			oBtn2.getLayoutData().setLinebreak(false);

			var $layout = jQuery.sap.byId("qunit-fixture");
			$layout.css("width", "400px");
			sap.ui.getCore().applyChanges();
		}
	});
	QUnit.test("Shrink", function(assert) {
		var done = assert.async();
		assert.expect(2);

		var $layout = jQuery.sap.byId("qunit-fixture");
		// this sets the layout to a size where the size falls below the min-width of a button
		$layout.css("width", "150px");
		sap.ui.getCore().applyChanges();

		// have to wait more than 300ms until the layout recognized the minimization
		setTimeout(function() {
			var $btn1 = jQuery.sap.byId("button1-cont0_0");
			var $btn2 = jQuery.sap.byId("button2-cont0_1");

			var bTest = ($btn1.length > 0) && ($btn2.length > 0);
			assert.ok(bTest, "Buttons are logically in one single line");

			if (bTest) {
				var oBtn1Rect = $btn1.rect();
				var oBtn2Rect = $btn2.rect();

				bTest = oBtn1Rect.top !== oBtn2Rect.top;
			}
			assert.ok(bTest, "Layout wrapped second button");

			done();

		}, 100);
	});

	QUnit.test("Enlarge", function(assert) {
		var done = assert.async();
		assert.expect(1);

		// have to wait more than 300ms until the layout recognized the minimization
		setTimeout(function() {
			var $btn1 = jQuery.sap.byId("button1-cont0_0");
			var $btn2 = jQuery.sap.byId("button2-cont0_1");

			var bTest = ($btn1.length > 0) && ($btn2.length > 0);
			if (bTest) {
				var p1 = $btn1.position();
				var p2 = $btn2.position();

				bTest = !!(p1.top === p2.top);
			}

			assert.ok(bTest, "Layout wrapped back to one line");
			done();

		}, 100);
	});

	QUnit.module("Private functions");
	QUnit.test("_getElementRect", function (assert) {
		//prepare
		jQuery("#qunit-fixture").append("<div id='myDiv' style='width:25.1412399px;height:30.321564px'></div>");

		//act
		var oReal = oRFL._getElementRect(jQuery("#myDiv"));

		//check
		assert.equal(oReal.height, "30.3", "Height check");
		assert.equal(oReal.width, "25.1", "Width check");

		//act and check
		assert.ok(!oRFL._getElementRect(null), "When null is passed, null should be returned");
	});

	QUnit.test("The private render manager is lazy initialized", function(assert) {
		//prepare
		var oResponsiveFlowLayout = {};
		//act
		ResponsiveFlowLayout.prototype.init.call(oResponsiveFlowLayout);
		//check
		assert.ok(!oResponsiveFlowLayout.oRm, "RenderManager should not be created in ResponsiveFlowLayout.prototype.init method, as focus handler is not available yet (no dom yet)");

		//prepare
		oResponsiveFlowLayout = new ResponsiveFlowLayout();
		//act
		oResponsiveFlowLayout.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		//check
		assert.ok(oResponsiveFlowLayout.oRm, "RenderManager should be created during rendering");
		//cleanup
		oResponsiveFlowLayout.destroy();
	});

	QUnit.module("destroy on exit");
	QUnit.test("Render manager is not created when control is not visible therefore it is not destroyed on exit", function(assert) {
		var oResponsiveFlowLayout = new ResponsiveFlowLayout({visible: false});
		var oExitSpy = sinon.spy(ResponsiveFlowLayout.prototype, "exit");
		//act
		oResponsiveFlowLayout.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//check
		assert.ok(!oResponsiveFlowLayout.oRm, "RenderManager should not be created since the control is not visible");

		// set the RenderManager to null and check on exit if the value will be changed
		// if it stays the same the destroy function of the RenderManager is not called
		oResponsiveFlowLayout.oRm = null;

		//cleanup
		oResponsiveFlowLayout.destroy();

		// Assert
		assert.strictEqual(oExitSpy.callCount, 1, "exit is called");
		assert.strictEqual(oResponsiveFlowLayout.oRm, null, "RenderManager is null since the destroy is not called on it");
	});

	QUnit.test("Render manager is destroyed on exit of the control", function(assert) {
		var oResponsiveFlowLayout = new ResponsiveFlowLayout();
		//act
		oResponsiveFlowLayout.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oDestroySpy = sinon.spy(oResponsiveFlowLayout.oRm, "destroy");

		//check
		assert.ok(oResponsiveFlowLayout.oRm, "RenderManager exists");

		//cleanup
		oResponsiveFlowLayout.destroy();

		// Assert
		assert.strictEqual(oDestroySpy.callCount, 1, "destroy is called on the RenderManager");
		assert.strictEqual(oResponsiveFlowLayout.oRm, undefined, "RenderManager is undefined after destroy");
	});
});