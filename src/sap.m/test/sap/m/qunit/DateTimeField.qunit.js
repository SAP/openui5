/*global QUnit */
sap.ui.define(
	["sap/m/DateTimeField", "sap/ui/core/Core"],
	function(DateTimeField, oCore) {
		"use strict";

		QUnit.module("Public API", function () {

			QUnit.module("displayFormat", function () {
				QUnit.test("Given DateTimeField, when I set displayFormat", function (assert) {
					var oSut = new DateTimeField({displayFormat: "medium"}),
						oSpyUpdatePlaceholder = this.spy(oSut, "setPlaceholder");

					// Act
					oSut.setDisplayFormat("short");

					// Assert
					assert.equal(oSpyUpdatePlaceholder.callCount, 1, "then function _updatePlaceholder should be called");

					// Cleanup
					oSut.destroy();
				});
			});

			QUnit.test("onfocusin", function (assert) {
				// Arrange
				var oDTF = new DateTimeField({valueState: "Error"}),
					oSpy = this.spy(oDTF, "openValueStateMessage");

				// Act
				oDTF.onfocusin({
					target: oDTF.$("sapMInputBaseInner").get(0)
				});

				// Assert
				assert.strictEqual(oSpy.callCount, 1, "There is valueState message shown");

				// Clean up
				oDTF.destroy();
			});
		});

		QUnit.module("Private API", function () {
			QUnit.test("Given DateTimeField, when I call setPlaceholder", function (assert) {
				// Prepare
				var oSut = new DateTimeField({displayFormat: "medium"});

				oSut.placeAt("qunit-fixture");
				oCore.applyChanges();

				// Act
				oSut.setPlaceholder("placeholder1");
				oCore.applyChanges();

				// Assert
				assert.equal(oSut.$().find("input").attr("placeholder"), "placeholder1",
					"the placeholder is changed with the provided one");

				// Cleanup
				oSut.destroy();
			});

			QUnit.test("_getTextForPickerValueStateContent", function (assert) {
				// Arrange
				var oDTF = new DateTimeField();

				// Assert
				assert.strictEqual(oDTF._getTextForPickerValueStateContent(), "", "There is no text when there is no valueState");

				// Arrange
				oDTF.setValueState("Error");

				// Assert
				assert.strictEqual(oDTF._getTextForPickerValueStateContent(), "Invalid entry", "The default value state text is correct when the valueState is set");

				// Arrange
				oDTF.setValueStateText("Custom text");

				// Assert
				assert.strictEqual(oDTF._getTextForPickerValueStateContent(), "Custom text", "The custom valueStateTest is shown when it exists");

				// Clean up
				oDTF.destroy();
			});

			QUnit.test("value state text header visibility", function (assert) {
				// Arrange
				var oDTF = new DateTimeField({
					valueState: "None",
					valueStateText: "Custom text"
				});

				// Assert
				assert.strictEqual(oDTF._getValueStateHeader().getVisible(),
					false,
					"The value state header is not visible when the valueState is None");

				// Clean up
				oDTF.destroy();
			});
		});
	}
);