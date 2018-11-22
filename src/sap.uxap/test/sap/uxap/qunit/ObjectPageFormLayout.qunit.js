/*global QUnit, sinon*/
sap.ui.define(["sap/ui/thirdparty/jquery",
                "sap/ui/core/Core",
                "sap/ui/core/mvc/XMLView"],
function($, Core, XMLView) {
	"use strict";

	var iRenderingDelay = 1000;

	QUnit.module("Form Layout", {
		beforeEach: function (assert) {
			var done = assert.async();
			this.clock = sinon.useFakeTimers();
			XMLView.create({
				id: "UxAP-FormLayout",
				viewName: "view.UxAP-FormLayout"
			}).then(function (oView) {
				this.oObjectPageFormView = oView;
				this.oObjectPageFormView.placeAt("qunit-fixture");
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oObjectPageFormView.destroy();
			this.clock.restore();
		}
	});

	QUnit.test("ObjectPage Form layout", function (assert) {

		// Arrange
		var oFormBlock = this.oObjectPageFormView.byId("personalFormBlock"),
			aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormCLContent>section"),
			sGridCellsOuterClasses = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div")[0].className,
			sExpectedClasses = "sapUiFormCLColumnsL3 sapUiFormCLColumnsM2 sapUiFormCLColumnsXL4 sapUiFormCLContent";

		// Assert
		assert.strictEqual(aGridCells.length, 4, "Form grid has 4 cells");
		assert.strictEqual(sGridCellsOuterClasses, sExpectedClasses,
				"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);

		// Act
		oFormBlock.setColumnLayout("3");
		this.clock.tick(iRenderingDelay);

		// Arrange
		sGridCellsOuterClasses = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div")[0].className;
		sExpectedClasses = "sapUiFormCLColumnsL3 sapUiFormCLColumnsM2 sapUiFormCLColumnsXL3 sapUiFormCLContent";

		// Assert
		assert.strictEqual(sGridCellsOuterClasses, sExpectedClasses,
				"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);

		// Act
		oFormBlock.setColumnLayout("2");
		this.clock.tick(iRenderingDelay);

		// Arrange
		sGridCellsOuterClasses = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div")[0].className;
		sExpectedClasses = "sapUiFormCLColumnsL2 sapUiFormCLColumnsM2 sapUiFormCLColumnsXL2 sapUiFormCLContent";

		// Assert
		assert.strictEqual(sGridCellsOuterClasses, sExpectedClasses,
				"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);

		// Act
		oFormBlock.setColumnLayout("1");
		this.clock.tick(iRenderingDelay);

		// Arrange
		sGridCellsOuterClasses = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div")[0].className;
		sExpectedClasses = "sapUiFormCLColumnsL1 sapUiFormCLColumnsM1 sapUiFormCLColumnsXL1 sapUiFormCLContent";

		// Assert
		assert.strictEqual(sGridCellsOuterClasses, sExpectedClasses,
				"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);
	});

	QUnit.module("Simple Form Layout", {
		beforeEach: function (assert) {
			var done = assert.async();
			this.clock = sinon.useFakeTimers();
			XMLView.create({
				id: "UxAP-SimpleFormLayout",
				viewName: "view.UxAP-SimpleFormLayout"
			}).then(function (oView) {
				this.oObjectPageFormView = oView;
				this.oObjectPageFormView.placeAt("qunit-fixture");
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oObjectPageFormView.destroy();
			this.clock.restore();
		}
	});

	QUnit.test("ObjectPage SimpleForm layout", function (assert) {

		// Arrange
		var oFormBlock = this.oObjectPageFormView.byId("personalSimpleFormBlock"),
			aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormCLContent>section"),
			oTestInput = Core.byId("__input0"),
			iTestInputTop = parseInt(oTestInput.$().offset().top),
			sGridCellsOuterClasses = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div")[0].className,
			sExpectedClasses = "sapUiFormCLColumnsL3 sapUiFormCLColumnsM2 sapUiFormCLColumnsXL4 sapUiFormCLContent";

		// Assert
		assert.strictEqual(aGridCells.length, 4, "Form grid has 4 cells");
		assert.strictEqual(sGridCellsOuterClasses, sExpectedClasses,
				"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);

		// Act
		oFormBlock.setColumnLayout("3");
		this.clock.tick(iRenderingDelay);

		// Arrange
		sGridCellsOuterClasses = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div")[0].className;
		sExpectedClasses = "sapUiFormCLColumnsL3 sapUiFormCLColumnsM2 sapUiFormCLColumnsXL3 sapUiFormCLContent";

		// Assert
		assert.strictEqual(sGridCellsOuterClasses, sExpectedClasses,
				"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);

		// Act
		oFormBlock.setColumnLayout("2");
		this.clock.tick(iRenderingDelay);

		// Arrange
		sGridCellsOuterClasses = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div")[0].className;
		sExpectedClasses = "sapUiFormCLColumnsL2 sapUiFormCLColumnsM2 sapUiFormCLColumnsXL2 sapUiFormCLContent";

		// Assert
		assert.strictEqual(sGridCellsOuterClasses, sExpectedClasses,
				"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);

		// Act
		oFormBlock.setColumnLayout("1");
		this.clock.tick(iRenderingDelay);

		// Arrange
		sGridCellsOuterClasses = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div")[0].className;
		sExpectedClasses = "sapUiFormCLColumnsL1 sapUiFormCLColumnsM1 sapUiFormCLColumnsXL1 sapUiFormCLContent";

		// Assert
		assert.strictEqual(sGridCellsOuterClasses, sExpectedClasses,
				"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);

		// Act
		oTestInput.focus();
		this.clock.tick(iRenderingDelay);

		// Assert
		assert.strictEqual(parseInt(oTestInput.$().offset().top) < (iTestInputTop - oTestInput.$().height()), true, "Input field should be visible");
	});

});
