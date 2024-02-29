/*global QUnit*/

sap.ui.define(["sap/ui/core/Element", "sap/ui/model/json/JSONModel", "sap/ui/core/mvc/XMLView", "sap/ui/qunit/utils/nextUIUpdate"],
function(Element, JSONModel, XMLView, nextUIUpdate) {
	"use strict";

	QUnit.module("modelMapping", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-ModelMapping",
				viewName: "view.UxAP-ModelMapping"
			}).then(async function(oView) {
				this.oView = oView;
				this.oView.placeAt("qunit-fixture");
				await nextUIUpdate();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oView.destroy();
		}
	});

	QUnit.test("initial model mapping is applied", async function(assert) {
		// Arrange
		var oExpectedFirstName = "John",
			oExpectedLastName = "Miller",
			oModel = new JSONModel({
				Employee: {
					firstName: oExpectedFirstName,
					lastName: oExpectedLastName
				}
			}),
			done = assert.async(),
			oSelectedView,
			oActualFirstName,
			oActualLastName;

		assert.expect(2);

		// Act
		this.oView.setModel(oModel, "jsonModel");
		await nextUIUpdate(); // allow model info to propagare

		setTimeout(function () {
			oSelectedView = Element.getElementById(this.oView.byId('block').getSelectedView());
			oActualFirstName = oSelectedView.byId("txtFirstName").getText();
			oActualLastName = oSelectedView.byId("txtLastName").getText();

			// Assert
			assert.strictEqual(oActualFirstName, oExpectedFirstName);
			assert.strictEqual(oActualLastName, oExpectedLastName);

			done();
		}.bind(this), 400);
	});

	QUnit.test("updated externalPath is applied", async function(assert) {
		// Arrange
		var oNewFirstName = "John1",
			oNewLastName = "Miller1",
			oModel = new JSONModel({
				Employee: {
					firstName: "John",
					lastName: "Miller"
				},
				newEmployee: {
					firstName: oNewFirstName,
					lastName: oNewLastName
				}
			}),
			done = assert.async(),
			oBlock,
			oSelectedView,
			oActualFirstName,
			oActualLastName;

		assert.expect(2);

		//setup
		this.oView.setModel(oModel, "jsonModel");
		await nextUIUpdate(); // allow model info to propagare

		setTimeout(async function() {
			oBlock = Element.getElementById("UxAP-ModelMapping--block");
			oSelectedView = Element.getElementById(this.oView.byId('block').getSelectedView());

			// Act
			oBlock.getMappings()[0].setExternalPath("/newEmployee"); // update external path
			await nextUIUpdate(); // allow model info to propagare

			oActualFirstName = oSelectedView.byId("txtFirstName").getText();
			oActualLastName = oSelectedView.byId("txtLastName").getText();

			// Assert
			assert.strictEqual(oActualFirstName, oNewFirstName);
			assert.strictEqual(oActualLastName, oNewLastName);

			done();
		}.bind(this), 400);
	});

	QUnit.test("mapping is updated when the model is changed", async function(assert) {
		// Arrange
		var oExpectedFirstName = "JohnChanged",
			oExpectedLastName = "MillerChanged",
			oModel = new JSONModel({
				Employee: {
					firstName: "John",
					lastName: "Miller"
				}
			}),
			oChangedModel = new JSONModel({
				Employee: {
					firstName: oExpectedFirstName,
					lastName: oExpectedLastName
				}
			}),
			done = assert.async(),
			oSelectedView,
			oActualFirstName,
			oActualLastName;

		assert.expect(2);

		this.oView.setModel(oModel, "jsonModel");
		await nextUIUpdate(); // allow model info to propagare

		// Act
		this.oView.setModel(oChangedModel, "jsonModel");
		await nextUIUpdate(); // allow model info to propagare

		setTimeout(function () {
			oSelectedView = Element.getElementById(this.oView.byId('block').getSelectedView());
			oActualFirstName = oSelectedView.byId("txtFirstName").getText();
			oActualLastName = oSelectedView.byId("txtLastName").getText();

			// Assert
			assert.strictEqual(oActualFirstName, oExpectedFirstName);
			assert.strictEqual(oActualLastName, oExpectedLastName);

			done();
		}.bind(this), 400);
	});

});
