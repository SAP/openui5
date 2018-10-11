/*global QUnit*/

sap.ui.define(["sap/ui/core/Core",
               "sap/ui/model/json/JSONModel"],
function (Core, JSONModel) {
	"use strict";

	QUnit.module("modelMapping", {
		beforeEach: function () {
			this.oView = sap.ui.xmlview("UxAP-ModelMapping", {
				viewName: "view.UxAP-ModelMapping"
			});
			this.oView.placeAt('qunit-fixture');
			Core.applyChanges();
		},
		afterEach: function () {
			this.oView.destroy();
		}
	});

	QUnit.test("initial model mapping is applied", function (assert) {

		var oExpectedFirstName = "John",
			oExpectedLastName = "Miller";

		var oModel = new JSONModel({
			Employee: {
				firstName: oExpectedFirstName,
				lastName: oExpectedLastName
			}
		});
		this.oView.setModel(oModel, "jsonModel");
		Core.applyChanges(); // allow model info to propagare

		// check
		var oSelectedView = Core.byId(this.oView.byId('block').getSelectedView()),
			oActualFirstName = oSelectedView.byId("txtFirstName").getText(),
			oActualLastName = oSelectedView.byId("txtLastName").getText();

		assert.strictEqual(oActualFirstName, oExpectedFirstName);
		assert.strictEqual(oActualLastName, oExpectedLastName);
	});

	QUnit.test("updated externalPath is applied", function (assert) {

		var oBlock = Core.byId("UxAP-ModelMapping--block"),
			oSelectedView = Core.byId(this.oView.byId('block').getSelectedView());

		// test data
		var oNewFirstName = "John1",
			oNewLastName = "Miller1";

		var oModel = new JSONModel({
			Employee: {
				firstName: "John",
				lastName: "Miller"
			},
			newEmployee: {
				firstName: oNewFirstName,
				lastName: oNewLastName
			}
		});

		//setup
		this.oView.setModel(oModel, "jsonModel");
		Core.applyChanges(); // allow model info to propagare


		//act
		oBlock.getMappings()[0].setExternalPath("/newEmployee"); // update external path
		Core.applyChanges(); // allow model info to propagare

		// check
		var oActualFirstName = oSelectedView.byId("txtFirstName").getText(),
		oActualLastName = oSelectedView.byId("txtLastName").getText();

		assert.strictEqual(oActualFirstName, oNewFirstName);
		assert.strictEqual(oActualLastName, oNewLastName);
	});

	QUnit.test("mapping is updated when the model is changed", function (assert) {

		var oExpectedFirstName = "JohnChanged",
			oExpectedLastName = "MillerChanged";

		var oModel = new JSONModel({
			Employee: {
				firstName: "John",
				lastName: "Miller"
			}
		});
		this.oView.setModel(oModel, "jsonModel");
		Core.applyChanges(); // allow model info to propagare

		//act
		var oChangedModel = new JSONModel({
			Employee: {
				firstName: oExpectedFirstName,
				lastName: oExpectedLastName
			}
		});
		this.oView.setModel(oChangedModel, "jsonModel");
		Core.applyChanges(); // allow model info to propagare

		// check
		var oSelectedView = Core.byId(this.oView.byId('block').getSelectedView()),
			oActualFirstName = oSelectedView.byId("txtFirstName").getText(),
			oActualLastName = oSelectedView.byId("txtLastName").getText();

		assert.strictEqual(oActualFirstName, oExpectedFirstName);
		assert.strictEqual(oActualLastName, oExpectedLastName);
	});

});
