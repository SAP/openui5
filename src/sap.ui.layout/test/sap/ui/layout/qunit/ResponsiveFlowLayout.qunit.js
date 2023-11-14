/*global QUnit */

sap.ui.define([
	"sap/ui/layout/ResponsiveFlowLayout",
	"sap/ui/layout/ResponsiveFlowLayoutData",
	"sap/m/Button",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/ui/dom/jquery/rect" // provides jQuery.fn.rect
], function(ResponsiveFlowLayout, ResponsiveFlowLayoutData, Button, jQuery, oCore) {
	"use strict";

	function injectDefaultContent(context) {
		context.oBtn1 = new Button("button1", {
			text : "Button1",
			width : "100%",
			layoutData: new ResponsiveFlowLayoutData()
		});

		context.oBtn2 = new Button("button2", {
			text : "Button2 (lb)",
			width : "100%",
			layoutData: new ResponsiveFlowLayoutData({
				weight : 2,
				linebreak : false
			})
		});

		context.oRFL = new ResponsiveFlowLayout("rflLayout", {
			content: [context.oBtn1, context.oBtn2]
		});

		return context.oRFL;
	}



	QUnit.module("Basics", {
		beforeEach : function() {
			injectDefaultContent(this).placeAt("qunit-fixture");
			this.oBtn1.getLayoutData().setLinebreak(false);
			this.oBtn2.getLayoutData().setLinebreak(false);

			var $layout = jQuery("#qunit-fixture");
			$layout.css("width", "300px");
			oCore.applyChanges();
		},
		afterEach: function() {
			this.oRFL.destroy();
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
		assert.expect(3);
		this.oBtn2.getLayoutData().setLinebreak(true);
		oCore.applyChanges();

		var oBtn1DomRef = document.getElementById("button1-cont0_0");
		var oBtn2DomRef = document.getElementById("button2-cont1_0");

		var bTest = oBtn1DomRef !== null && oBtn2DomRef !== null;

		assert.ok(bTest, "Line break for button");
		assert.ok(bTest, "LayoutDataChanged event catched by Layout");

		var oRow1DomRef = document.getElementById("rflLayout-row0");
		var oRow2DomRef = document.getElementById("rflLayout-row1");

		bTest = oRow1DomRef !== null && oRow2DomRef !== null;

		assert.ok(bTest, "Buttons put in separate rows with correct IDs");
	});

	QUnit.module("Resize", {
		beforeEach : function() {
			injectDefaultContent(this).placeAt("qunit-fixture");
			this.oBtn1.getLayoutData().setLinebreak(false);
			this.oBtn2.getLayoutData().setLinebreak(false);

			var $layout = jQuery("#qunit-fixture");
			$layout.css("width", "400px");
			oCore.applyChanges();
		},
		afterEach: function() {
			this.oRFL.destroy();
		}
	});
	QUnit.test("Shrink", function(assert) {
		var done = assert.async();
		assert.expect(2);

		var $layout = jQuery("#qunit-fixture");
		// this sets the layout to a size where the size falls below the min-width of a button
		$layout.css("width", "150px");
		oCore.applyChanges();

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

		}, 100);
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

		}, 100);
	});

	QUnit.test("ResizeHandler registration", function(assert) {
		assert.ok(this.oRFL._resizeHandlerComputeWidthsID, "ResizeHandler is registered after initialisation.");
		this.oRFL.setResponsive(false);
		assert.notOk(this.oRFL._resizeHandlerComputeWidthsID, "ResizeHandler is deregistered when responsive property is set to false.");
	});


	QUnit.module("Private functions", {
		beforeEach: function() {
			injectDefaultContent(this).placeAt("qunit-fixture");
		},
		afterEach: function() {
			this.oRFL.destroy();
		}
	});

	QUnit.test("_getElementRect", function (assert) {
		//prepare
		jQuery("<div id='myDiv'></div>").css({width: "25.1412399px", height: "30.321564px"}).appendTo("#qunit-fixture");

		//act
		var oReal = this.oRFL._getElementRect(jQuery("#myDiv"));

		//check
		assert.equal(oReal.height, "30.3", "Height check");
		assert.equal(oReal.width, "25.1", "Width check");

		//act and check
		assert.ok(!this.oRFL._getElementRect(null), "When null is passed, null should be returned");
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
		oCore.applyChanges();
		//check
		assert.ok(oResponsiveFlowLayout.oRm, "RenderManager should be created during rendering");
		//cleanup
		oResponsiveFlowLayout.destroy();
	});

	QUnit.module("destroy on exit");
	QUnit.test("Render manager is not created when control is not visible therefore it is not destroyed on exit", function(assert) {
		var oResponsiveFlowLayout = new ResponsiveFlowLayout({visible: false});
		var oExitSpy = this.spy(ResponsiveFlowLayout.prototype, "exit");
		//act
		oResponsiveFlowLayout.placeAt("qunit-fixture");
		oCore.applyChanges();

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
		oCore.applyChanges();

		var oDestroySpy = this.spy(oResponsiveFlowLayout.oRm, "destroy");

		//check
		assert.ok(oResponsiveFlowLayout.oRm, "RenderManager exists");

		//cleanup
		oResponsiveFlowLayout.destroy();

		// Assert
		assert.strictEqual(oDestroySpy.callCount, 1, "destroy is called on the RenderManager");
		assert.strictEqual(oResponsiveFlowLayout.oRm, undefined, "RenderManager is undefined after destroy");
	});
});