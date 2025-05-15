(function ($, QUnit, sinon, Importance) {
	"use strict";

	jQuery.sap.registerModulePath("view", "./view");
	jQuery.sap.registerModulePath("sap.uxap.testblocks", "./blocks");
	jQuery.sap.require("sap.uxap.ObjectPageSubSection");
	jQuery.sap.require("sap.uxap.ObjectPageSection");
	jQuery.sap.require("sap.uxap.ObjectPageSectionBase");
	jQuery.sap.require("sap.uxap.BlockBase");

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

	QUnit.test("Form adjustment destroys the obsolete form layout", function (assert) {
		var viewContent = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:form="sap.ui.layout.form">' +
				'<form:Form>' +
					'<form:layout>' +
						'<form:ResponsiveGridLayout id="idResponsiveGridLayout" />' +
					'</form:layout>' +
					'</form:Form>' +
				'</mvc:View>',
			MyBlock = sap.uxap.BlockBase.extend("my.custom.Block", {
				metadata: {
					views: {
						// Define the view for the block
						Collapsed: {
							type: "XML",
							viewContent:viewContent
						},
						Expanded: {
							type: "XML",
							viewContent:viewContent
						}
					}
				},
				renderer: {}
			}),
			myBlock = new MyBlock({
				id: "myBlock",
				formAdjustment: sap.uxap.BlockBaseFormAdjustment.BlockColumns
			}),
			oSubSection = new sap.uxap.ObjectPageSubSection({
				id: "mySubSection",
				blocks: [myBlock]
			}),
			oSection = new sap.uxap.ObjectPageSection({
				id: "mySection",
				title: "Test Section",
				subSections: [oSubSection]
			}),
			oObjectPageLayout = new sap.uxap.ObjectPageLayout({
				id: "myObjectPageLayout",
				sections: [oSection]
			});
		oObjectPageLayout.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oView = myBlock._getSelectedViewContent()
		var oFormLayout = oView.byId("idResponsiveGridLayout");

		// Assert: check if the obsolete form layout is destroyed
		assert.ok(oFormLayout, "The form layout is created");

		// Act: trigger the adjustment of the form layout
		myBlock._applyFormAdjustment();

		// Act: destroy the block parent
		oSubSection.destroy();
		// Assert: check if the obsolete form layout is destroyed
		assert.ok(oFormLayout.bIsDestroyed, "The obsolete form layout is destroyed");
	});


}(jQuery, QUnit, sinon));
