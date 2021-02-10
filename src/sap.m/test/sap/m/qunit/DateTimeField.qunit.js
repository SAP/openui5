/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define(
	["sap/ui/qunit/QUnitUtils", "sap/m/DateTimeField"],
	function(QUnitUtils, DateTimeField) {
		var DateTimeField = sap.m.DateTimeField;

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

			QUnit.test("Fake test to have a root module with at least one test, otherwise qunit-2 will fail", function (assert) {
				assert.ok(true, "assert ok");
			});
		});

		QUnit.module("Private API", function () {
			QUnit.test("Given DateTimeField, when I call setPlaceholder", function (assert) {
				// Prepare
				var oSut = new DateTimeField({displayFormat: "medium"});

				oSut.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();

				// Act
				oSut.setPlaceholder("placeholder1");
				sap.ui.getCore().applyChanges();

				// Assert
				assert.equal(oSut.$().find("input").attr("placeholder"), "placeholder1",
					"the placeholder is changed with the provided one");

				// Cleanup
				oSut.destroy();
			});
		});
	}
);