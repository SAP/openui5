/*global QUnit, sinon */
sap.ui.require([
	"sap/ui/thirdparty/jquery"],
function($) {
	"use strict";

	sap.ui.loader.config({
		paths: {
		   "sap/uxap/testblocks": "./blocks",
		   "view": "./view"
		 }
	  });

	sinon.config.useFakeTimers = true;
	QUnit.module("form layout");

	var iRenderingDelay = 1000;

	QUnit.test("ObjectPage form layout", function (assert) {

		var oObjectPageFormView = sap.ui.xmlview("UxAP-FormLayout", {viewName: "view.UxAP-FormLayout" });
	    oObjectPageFormView.placeAt('qunit-fixture');
	    sap.ui.getCore().applyChanges();

		var oFormBlock = oObjectPageFormView.byId("personalFormBlock");

		var aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormResGridMain>div");

		assert.strictEqual(aGridCells.length, 4, "form grid has 4 cells");

		//act
		oFormBlock.setColumnLayout("4");
		this.clock.tick(iRenderingDelay);

		aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormResGridMain > div.sapUiRespGridSpanL4.sapUiRespGridSpanM6.sapUiRespGridSpanS12");
		assert.strictEqual(aGridCells.length, 4, "when 4-column span, all cells have L4 M6 S12");

		//act
		oFormBlock.setColumnLayout("3");
		this.clock.tick(iRenderingDelay);

		aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormResGridMain > div.sapUiRespGridSpanL4.sapUiRespGridSpanM6.sapUiRespGridSpanS12");
		assert.strictEqual(aGridCells.length, 4, "when 3-column span, all cells have L4 M6 S12");

		//act
		oFormBlock.setColumnLayout("2");
		this.clock.tick(iRenderingDelay);

		aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormResGridMain > div.sapUiRespGridSpanL6.sapUiRespGridSpanM6.sapUiRespGridSpanS12");
		assert.strictEqual(aGridCells.length, 4, "when 2-column span, all cells have L6 M6 S12");

		//act
		oFormBlock.setColumnLayout("1");
		this.clock.tick(iRenderingDelay);

		aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormResGridMain > div.sapUiRespGridSpanL12.sapUiRespGridSpanM12.sapUiRespGridSpanS12");
		assert.strictEqual(aGridCells.length, 4, "when 1-column span, all cells have L12 M12 S12");

		oObjectPageFormView.destroy();
	});

	QUnit.test("ObjectPage simple form layout", function (assert) {

		var oObjectPageFormView = sap.ui.xmlview("UxAP-SimpleFormLayout", {viewName: "view.UxAP-SimpleFormLayout" });
	    oObjectPageFormView.placeAt('qunit-fixture');
	    sap.ui.getCore().applyChanges();

		var oFormBlock = oObjectPageFormView.byId("personalSimpleFormBlock");

		var aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormResGridMain>div");

		var oTestInput = sap.ui.getCore().byId("__input0"),
			iTestInputTop = parseInt(oTestInput.$().offset().top, 10);

		assert.strictEqual(aGridCells.length, 4, "form grid has 4 cells");

		//act
		oFormBlock.setColumnLayout("4");
		this.clock.tick(iRenderingDelay);

		aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormResGridMain > div.sapUiRespGridSpanL4.sapUiRespGridSpanM6.sapUiRespGridSpanS12");
		assert.strictEqual(aGridCells.length, 4, "when 4-column span, all cells have L4 M6 S12");

		//act
		oFormBlock.setColumnLayout("3");
		this.clock.tick(iRenderingDelay);

		aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormResGridMain > div.sapUiRespGridSpanL4.sapUiRespGridSpanM6.sapUiRespGridSpanS12");
		assert.strictEqual(aGridCells.length, 4, "when 3-column span, all cells have L4 M6 S12");

		//act
		oFormBlock.setColumnLayout("2");
		this.clock.tick(iRenderingDelay);

		aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormResGridMain > div.sapUiRespGridSpanL6.sapUiRespGridSpanM6.sapUiRespGridSpanS12");
		assert.strictEqual(aGridCells.length, 4, "when 2-column span, all cells have L6 M6 S12");

		//act
		oFormBlock.setColumnLayout("1");
		this.clock.tick(iRenderingDelay);

		aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormResGridMain > div.sapUiRespGridSpanL12.sapUiRespGridSpanM12.sapUiRespGridSpanS12");
		assert.strictEqual(aGridCells.length, 4, "when 1-column span, all cells have L12 M12 S12");

		//scroll to focused control test
		oTestInput.focus();

		this.clock.tick(iRenderingDelay);

		assert.strictEqual(parseInt(oTestInput.$().offset().top, 10) < (iTestInputTop - oTestInput.$().height()), true, "Input field should be visible");

		oObjectPageFormView.destroy();
	});

});
