/* global sinon, QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/util/ResponsivePaddingsEnablement",
	"sap/ui/core/Item",
	"sap/ui/thirdparty/jquery",
	"sap/base/Log"
], function(
	Control,
	ResponsivePaddingsEnablement,
	Item,
	jQuery,
	Log
){
	"use strict";
	var MyCustomControl = Control.extend("sap.custom.MyCustomControl", {
		metadata: {
			library: "sap.m",
			properties: {
				width: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null }
			}
		},
		renderer: {
			render: function(oRm, oControl) {
				oRm.write("<div");
				oRm.writeClasses();
				oRm.writeControlData(oControl);
				oRm.writeStyles();
				oRm.write(">");

				oRm.write("<div id='" + oControl.getId() + "-the-first' class='sapMFirstElement' style='width: 100%; height: 20px;'>");
				oRm.write("</div>");
				oRm.write("<div id='" + oControl.getId() + "-the-second' style='width: 100%; height: 20px;'>");
				oRm.write("</div>");

				oRm.write("</div>");
			}
		}
	});

	ResponsivePaddingsEnablement.call(MyCustomControl.prototype, {
		div1: {selector: ".sapMFirstElement"},
		div2: {suffix: "the-second"},
		div3: {name: ".sapMFirstElement"}
	});

	MyCustomControl.prototype.init = function () {
		this._initResponsivePaddingsEnablement();
	};

	QUnit.test("The enabler should be correctly applied over Control's prototype", function(assert) {
		//System under test
		var oControl = new MyCustomControl("_control",{}),
			oSpy = sinon.spy(oControl, "onBeforeRendering"),
			oSpy1 = sinon.spy(oControl, "onAfterRendering"),
			$customControl, $firstElement, $secondElement, bIsFirstElementResponsive, bIsSecondElementResponsive;

		this.clock = sinon.useFakeTimers();

		//Act
		oControl.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oControl.addStyleClass("sapUiResponsivePadding--div1");
		oControl.addStyleClass("sapUiResponsivePadding--div2");
		oControl.addStyleClass("sapUiResponsivePadding--div3");
		oControl.invalidate();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(oSpy.callCount, 2, "onBeforeRendering is called twice");
		assert.strictEqual(oSpy1.callCount, 2, "onAfterRendering is called twice");

		//Act
		$customControl = jQuery("#_control");
		$customControl.css("width", "300px");
		this.clock.tick(300);
		sap.ui.getCore().applyChanges();

		$firstElement = jQuery("[id*='the-first']");
		$secondElement = jQuery("[id*='the-second']");
		bIsFirstElementResponsive = $firstElement.hasClass("sapUi-Std-PaddingS");
		bIsSecondElementResponsive = $secondElement.hasClass("sapUi-Std-PaddingS");

		//Assert
		assert.ok(bIsFirstElementResponsive, "The sapUi-Std-PaddingS class is applied to the first element");
		assert.ok(bIsSecondElementResponsive, "The sapUi-Std-PaddingS class is applied to the second element");


		//Act
		$customControl.css("width", "700px");
		this.clock.tick(300);
		sap.ui.getCore().applyChanges();

		bIsFirstElementResponsive = $firstElement.hasClass("sapUi-Std-PaddingM");
		bIsSecondElementResponsive = $secondElement.hasClass("sapUi-Std-PaddingM");

		//Assert
		assert.ok(bIsFirstElementResponsive, "The sapUi-Std-PaddingM class is applied to the first element");
		assert.ok(bIsSecondElementResponsive, "The sapUi-Std-PaddingM class is applied to the second element");

		//Act
		$customControl.css("width", "1300px");
		this.clock.tick(300);
		sap.ui.getCore().applyChanges();

		bIsFirstElementResponsive = $firstElement.hasClass("sapUi-Std-PaddingL");
		bIsSecondElementResponsive = $secondElement.hasClass("sapUi-Std-PaddingL");

		//Assert
		assert.ok(bIsFirstElementResponsive, "The sapUi-Std-PaddingL class is applied to the first element");
		assert.ok(bIsSecondElementResponsive, "The sapUi-Std-PaddingL class is applied to the second element");

		//Act
		$customControl.css("width", "2000px");
		this.clock.tick(300);
		sap.ui.getCore().applyChanges();

		bIsFirstElementResponsive = $firstElement.hasClass("sapUi-Std-PaddingXL");
		bIsSecondElementResponsive = $secondElement.hasClass("sapUi-Std-PaddingXL");

		//Assert
		assert.ok(bIsFirstElementResponsive, "The sapUi-Std-PaddingXL class is applied to the first element");
		assert.ok(bIsSecondElementResponsive, "The sapUi-Std-PaddingXL class is applied to the second element");

		//Clean up
		oSpy.restore();
		oSpy1.restore();
		oControl.destroy();
	});

	QUnit.test("Apply the enabler over an Element", function(assert) {
		var fnErrorSpy = sinon.spy(Log, "error");

		//System under test
		ResponsivePaddingsEnablement.call(Item.prototype, {});

		//Assert
		assert.ok(fnErrorSpy.calledOnce,"An error is logged when an element is enhanced");

		//Clean up
		fnErrorSpy.restore();
	});

});