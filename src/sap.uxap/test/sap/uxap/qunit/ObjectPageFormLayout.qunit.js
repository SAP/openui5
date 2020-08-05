/*global QUnit*/
sap.ui.define(["sap/ui/thirdparty/jquery",
                "sap/ui/core/Core",
                "sap/ui/core/mvc/XMLView"],
function($, Core, XMLView) {
	"use strict";

	QUnit.module("Form Layout", {
		beforeEach: function (assert) {
			var done = assert.async();
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
		}
	});

	QUnit.test("ObjectPage Form layout", function (assert) {
		var done = assert.async(),
			sExpectedClasses = ".sapUiFormCLColumnsL3.sapUiFormCLColumnsM2.sapUiFormCLColumnsXL4.sapUiFormCLContent",
			oFormBlock,
			aGridCells,
			$GridCellsOuter;

		assert.expect(2);

		setTimeout(function () {
			// Arrange
			oFormBlock = this.oObjectPageFormView.byId("personalFormBlock");
			aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormCLContent>section");
			$GridCellsOuter = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div").first();

			// Assert
			assert.strictEqual(aGridCells.length, 4, "Form grid has 4 cells");
			assert.ok($GridCellsOuter.is(sExpectedClasses),
					"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);

			done();
		}.bind(this), 400);
	});

	QUnit.test("ObjectPage with TitleOnLeft Form layout", function (assert) {
		var done = assert.async(),
			sExpectedClasses = ".sapUiFormCLColumnsL2.sapUiFormCLColumnsM2.sapUiFormCLColumnsXL3.sapUiFormCLContent",
			oObjectPage,
			oFormBlock,
			$GridCellsOuter;

		assert.expect(1);

		setTimeout(function () {
			// Arrange
			oObjectPage = this.oObjectPageFormView.byId("ObjectPageLayout");

			// Act
			oObjectPage.setSubSectionLayout("TitleOnLeft");

			setTimeout(function () {
				oFormBlock = this.oObjectPageFormView.byId("personalFormBlock");
				$GridCellsOuter = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div").first();

				// Assert
				assert.ok($GridCellsOuter.is(sExpectedClasses),
						"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);

				done();
			}.bind(this), 400);
		}.bind(this), 400);
	});

	QUnit.module("Simple Form Layout", {
		beforeEach: function (assert) {
			var done = assert.async();
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
		}
	});

	QUnit.test("ObjectPage SimpleForm layout", function (assert) {
		var done = assert.async(),
			sExpectedClasses = ".sapUiFormCLColumnsL3.sapUiFormCLColumnsM2.sapUiFormCLColumnsXL4.sapUiFormCLContent",
			oFormBlock,
			aGridCells,
			oTestInput,
			iTestInputTop,
			$GridCellsOuter;

		assert.expect(3);

		setTimeout(function () {
			// Arrange
			oFormBlock = this.oObjectPageFormView.byId("personalSimpleFormBlock");
			aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormCLContent>section");
			oTestInput = Core.byId("__input0");
			iTestInputTop = parseInt(oTestInput.$().offset().top);
			$GridCellsOuter = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div").first();

			// Assert
			assert.strictEqual(aGridCells.length, 4, "Form grid has 4 cells");
			assert.ok($GridCellsOuter.is(sExpectedClasses),
					"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);

			// Act
			oFormBlock.setColumnLayout("3");

			// Act
			oFormBlock.setColumnLayout("2");

			// Act
			oFormBlock.setColumnLayout("1");

			// Act
			oTestInput.focus();

			// Assert
			assert.strictEqual(parseInt(oTestInput.$().offset().top) < (iTestInputTop - oTestInput.$().height()), true, "Input field should be visible");

			done();
		}.bind(this), 400);
	});

	QUnit.test("ObjectPage with TitleOnLeft SimpleForm layout", function (assert) {
		var done = assert.async(),
			sExpectedClasses = ".sapUiFormCLColumnsL2.sapUiFormCLColumnsM2.sapUiFormCLColumnsXL3.sapUiFormCLContent",
			oObjectPage,
			oFormBlock,
			$GridCellsOuter;

		assert.expect(1);

		setTimeout(function () {
			// Arrange
			oObjectPage = this.oObjectPageFormView.byId("ObjectPageLayout");

			// Act
			oObjectPage.setSubSectionLayout("TitleOnLeft");

			setTimeout(function () {
				oFormBlock = this.oObjectPageFormView.byId("personalSimpleFormBlock");
				$GridCellsOuter = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div").first();

				// Assert
				assert.ok($GridCellsOuter.is(sExpectedClasses),
					"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);

				done();
			}.bind(this), 400);
		}.bind(this), 400);
	});

	QUnit.test("ObjectPage Fist Editable field focus", function (assert) {
		var done = assert.async(),
			oObjectPageLayout = this.oObjectPageFormView.byId("ObjectPageLayout"),
			oInput;

		setTimeout(function () {
			oInput = jQuery("#UxAP-SimpleFormLayout--employmentSimpleFormBlock-defaultXML--firstEditableInput-inner")[0];
			oObjectPageLayout._focusFirstEditableInput("sectionsContainer");
			assert.equal(document.activeElement, oInput, "The first editable input is focused");
			done();
		}, 500);
	});
});
