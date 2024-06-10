/*global QUnit*/
sap.ui.define(["sap/ui/core/Element", "sap/ui/qunit/utils/nextUIUpdate", "sap/ui/thirdparty/jquery", "sap/ui/core/mvc/XMLView"],
function(Element, nextUIUpdate, jQuery, XMLView) {
	"use strict";


	var waitForForm = function (oView, sBlockId) {
		return new Promise(function(resolve) {
			oView.byId(sBlockId)
				.attachEvent("viewInit", function(oEvent) {
					var oForm = oEvent.getParameter("view").getContent()[0];
					oForm.addEventDelegate({
						onAfterRendering: function() {
							oForm.removeEventDelegate(this);
							resolve();
						}
					});
				});
		});
	};


	QUnit.module("Form Layout", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-FormLayout",
				viewName: "view.UxAP-FormLayout"
			}).then(async function(oView) {
				this.oObjectPageFormView = oView;
				this.oObjectPageFormView.placeAt("qunit-fixture");
				await nextUIUpdate();

				waitForForm(oView, "personalFormBlock").then(done);

			}.bind(this));
		},
		afterEach: function () {
			this.oObjectPageFormView.destroy();
		}
	});

	QUnit.test("ObjectPage Form layout", function (assert) {
		var sExpectedClasses = ".sapUiFormCLColumnsL3.sapUiFormCLColumnsM2.sapUiFormCLColumnsXL4.sapUiFormCLContent",
			oFormBlock,
			aGridCells,
			$GridCellsOuter;

		// Arrange
		oFormBlock = this.oObjectPageFormView.byId("personalFormBlock");
		aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormCLContent>*");
		$GridCellsOuter = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div").first();

		// Assert
		assert.strictEqual(aGridCells.length, 4, "Form grid has 4 cells");
		assert.ok($GridCellsOuter.is(sExpectedClasses),
				"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);
	});

	QUnit.test("ObjectPage with TitleOnLeft Form layout", function (assert) {
		var done = assert.async(),
			sExpectedClasses = ".sapUiFormCLColumnsL2.sapUiFormCLColumnsM2.sapUiFormCLColumnsXL3.sapUiFormCLContent",
			oObjectPage,
			oFormBlock,
			$GridCellsOuter;

		assert.expect(1);

		// Arrange
		oObjectPage = this.oObjectPageFormView.byId("ObjectPageLayout");
		oFormBlock = this.oObjectPageFormView.byId("personalFormBlock");

		// Act
		oObjectPage.setSubSectionLayout("TitleOnLeft");
		oObjectPage.addEventDelegate({
			onAfterRendering: function() {
				$GridCellsOuter = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div").first();

				// Assert
				assert.ok($GridCellsOuter.is(sExpectedClasses),
						"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);
				oObjectPage.removeEventDelegate(this);
				done();
			}
		});
	});

	QUnit.module("Simple Form Layout", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-SimpleFormLayout",
				viewName: "view.UxAP-SimpleFormLayout"
			}).then(async function(oView) {
				this.oObjectPageFormView = oView;
				this.oObjectPage = oView.byId("ObjectPageLayout");
				this.oObjectPageFormView.placeAt("qunit-fixture");
				await nextUIUpdate();

				var oPromise1 = waitForForm(oView, "personalSimpleFormBlock"),
				oPromise2 = waitForForm(oView, "employmentSimpleFormBlock");

				Promise.all([oPromise1, oPromise2]).then(done);

			}.bind(this));
		},
		afterEach: function () {
			this.oObjectPageFormView.destroy();
			this.oObjectPageFormView = null;
			this.oObjectPage = null;
		}
	});

	QUnit.test("ObjectPage SimpleForm layout", function (assert) {
		var sExpectedClasses = ".sapUiFormCLColumnsL3.sapUiFormCLColumnsM2.sapUiFormCLColumnsXL4.sapUiFormCLContent",
			oFormBlock,
			aGridCells,
			oTestInput,
			iTestInputTop,
			$GridCellsOuter;

		oFormBlock = this.oObjectPageFormView.byId("personalSimpleFormBlock");
		aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormCLContent>*");
		oTestInput = Element.getElementById("__input0");
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
	});

	QUnit.test("ObjectPage with TitleOnLeft SimpleForm layout", function (assert) {
		var done = assert.async(),
			sExpectedClasses = ".sapUiFormCLColumnsL2.sapUiFormCLColumnsM2.sapUiFormCLColumnsXL3.sapUiFormCLContent",
			oObjectPage,
			oFormBlock,
			$GridCellsOuter;

		assert.expect(1);

		// Arrange
		oObjectPage = this.oObjectPageFormView.byId("ObjectPageLayout");
		oFormBlock = this.oObjectPageFormView.byId("personalSimpleFormBlock");

		// Act
		oObjectPage.setSubSectionLayout("TitleOnLeft");
		oObjectPage.addEventDelegate({
			onAfterRendering: function() {
				$GridCellsOuter = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div").first();

				// Assert
				assert.ok($GridCellsOuter.is(sExpectedClasses),
				"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);
				oObjectPage.removeEventDelegate(this);
				done();
			}
		});
	});

	QUnit.test("ObjectPage Fist Editable field focus", function (assert) {
		var oObjectPageLayout = this.oObjectPageFormView.byId("ObjectPageLayout"),
			oInput;

		oInput = jQuery("#UxAP-SimpleFormLayout--employmentSimpleFormBlock-defaultXML--firstEditableInput-inner")[0];
		oObjectPageLayout._focusFirstEditableInput("sectionsContainer");
		assert.equal(document.activeElement, oInput, "The first editable input is focused");
	});
});
