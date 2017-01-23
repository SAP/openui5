(function ($, QUnit, sinon, Importance) {
	"use strict";

	jQuery.sap.registerModulePath("view", "./view");
	jQuery.sap.registerModulePath("sap.uxap.testblocks", "./blocks");

	sinon.config.useFakeTimers = true;
	QUnit.module("modelMapping", {
		beforeEach: function () {
			this.oView = sap.ui.xmlview("UxAP-ModelMapping", {
				viewName: "view.UxAP-ModelMapping"
			});
			this.oView.placeAt('content');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oView.destroy();
		}
	});

	var iRenderingDelay = 1000;

	QUnit.test("initial model mapping is applied", function (assert) {

		var oExpectedFirstName = "John",
			oExpectedLastName = "Miller";

		var oModel = new sap.ui.model.json.JSONModel({
			Employee: {
				firstName: oExpectedFirstName,
				lastName: oExpectedLastName
			}
		});
		this.oView.setModel(oModel, "jsonModel");
		sap.ui.getCore().applyChanges(); // allow model info to propagare

		// check
		var oSelectedView = sap.ui.getCore().byId(this.oView.byId('block').getSelectedView()),
			oActualFirstName = oSelectedView.byId("txtFirstName").getText(),
			oActualLastName = oSelectedView.byId("txtLastName").getText();

		assert.strictEqual(oActualFirstName, oExpectedFirstName);
		assert.strictEqual(oActualLastName, oExpectedLastName);
	});

	QUnit.test("updated externalPath is applied", function (assert) {

		var oBlock = sap.ui.getCore().byId("UxAP-ModelMapping--block"),
			oSelectedView = sap.ui.getCore().byId(this.oView.byId('block').getSelectedView());

		// test data
		var oNewFirstName = "John1",
			oNewLastName = "Miller1";

		var oModel = new sap.ui.model.json.JSONModel({
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
		sap.ui.getCore().applyChanges(); // allow model info to propagare


		//act
		oBlock.getMappings()[0].setExternalPath("/newEmployee"); // update external path
        sap.ui.getCore().applyChanges(); // allow model info to propagare

		// check
		var oActualFirstName = oSelectedView.byId("txtFirstName").getText(),
		oActualLastName = oSelectedView.byId("txtLastName").getText();

		assert.strictEqual(oActualFirstName, oNewFirstName);
		assert.strictEqual(oActualLastName, oNewLastName);
	});

	QUnit.test("mapping is updated when the model is changed", function (assert) {

		var oExpectedFirstName = "JohnChanged",
			oExpectedLastName = "MillerChanged";

		var oModel = new sap.ui.model.json.JSONModel({
			Employee: {
				firstName: "John",
				lastName: "Miller"
			}
		});
		this.oView.setModel(oModel, "jsonModel");
		sap.ui.getCore().applyChanges(); // allow model info to propagare

		//act
		var oChangedModel = new sap.ui.model.json.JSONModel({
			Employee: {
				firstName: oExpectedFirstName,
				lastName: oExpectedLastName
			}
		});
		this.oView.setModel(oChangedModel, "jsonModel");
		sap.ui.getCore().applyChanges(); // allow model info to propagare

		// check
		var oSelectedView = sap.ui.getCore().byId(this.oView.byId('block').getSelectedView()),
			oActualFirstName = oSelectedView.byId("txtFirstName").getText(),
			oActualLastName = oSelectedView.byId("txtLastName").getText();

		assert.strictEqual(oActualFirstName, oExpectedFirstName);
		assert.strictEqual(oActualLastName, oExpectedLastName);
	});

}(jQuery, QUnit, sinon));
