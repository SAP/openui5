/*global QUnit */
sap.ui.define([
	"sap/m/Select",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/util/MockServer",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Item",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Select, ODataModel, MockServer, nextUIUpdate, Item, Filter, FilterOperator) {
	"use strict";

	function startMockServer() {
		MockServer.config({ autoRespond: true });

		const oMockServer = new MockServer({
			rootUri: "http://sap.com/model/"
		});

		oMockServer.simulate("test-resources/sap/m/qunit/data/metadata.xml", "test-resources/sap/m/qunit/data");

		oMockServer.start();

		return oMockServer;
	}

	function setODataModelAndBindItems(oSelect) {
		const oModel = new ODataModel("http://sap.com/model");

		oSelect.setModel(oModel);

		const oItemTemplate = new Item({
			key: "{ProductId}",
			text: "{Name}"
		});

		oSelect.bindItems({
			path: "/Products",
			template: oItemTemplate
		});
	}

	function ui5Delegate(sDelegateName, oControl) {
		return new Promise(function (fnResolve) {

			const oDelegate = {};

			oDelegate[sDelegateName] = function () {
				oControl.removeEventDelegate(oDelegate);
				fnResolve();
			};

			oControl.addEventDelegate(oDelegate);
		});
	}

	QUnit.module("Select ODataBindings ", {
		beforeEach: async function () {
			// Arrange
			this.oMockServer = startMockServer();

			this.oSelect = new Select();
			this.oSelect.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function () {
			// Clean
			this.oMockServer.stop();
			this.oSelect.destroy();
		}
	});

	QUnit.test("Select is rendered in DOM", function (assert) {
		// assert
		assert.ok(this.oSelect.getDomRef(), "Select has DOM");
	});

	QUnit.test("it should set the selection correctly when the item aggregation is bound to a OData model and the selectedKey property is not bound", async function (assert) {
		setODataModelAndBindItems(this.oSelect);

		await ui5Delegate("onAfterRendering", this.oSelect);

		assert.strictEqual(this.oSelect.getSelectedKey(), "id_1");
		assert.strictEqual(this.oSelect.getList().getSelectedKey(), "id_1");
		assert.strictEqual(this.oSelect.$("label").text(), "Gladiator MX");
	});

	QUnit.test("it should set the selection correctly when the item aggregation is bound to a OData model and the selectedKey property is not bound", async function (assert) {
		this.oSelect.setSelectedKey("id_14");
		setODataModelAndBindItems(this.oSelect);

		await ui5Delegate("onAfterRendering", this.oSelect);
		// second rendering is necessary for label to be updated
		await ui5Delegate("onAfterRendering", this.oSelect);

		assert.strictEqual(this.oSelect.getSelectedKey(), "id_14");
		assert.strictEqual(this.oSelect.getList().getSelectedKey(), "id_14");
		assert.strictEqual(this.oSelect.$("label").text(), "High End Laptop 2b");
	});

	// BCP 1580006106
	QUnit.test("it should not override the selection if the items aggregation is bound to a OData model and filters are used", async function (assert) {

		setODataModelAndBindItems(this.oSelect);


		this.oSelect.getBinding("items").filter(new Filter([
			new Filter({
				path: "Name",
				operator: FilterOperator.StartsWith,
				value1: "F"
			}),
			new Filter({
				path: "Name",
				operator: FilterOperator.EndsWith,
				value1: "S"
			})
		], true));

		this.oSelect.setSelectedKey("id_5");

		await ui5Delegate("onAfterRendering", this.oSelect);

		this.oSelect.getBinding("items").filter(new Filter([
			new Filter({
				path: "Name",
				operator: FilterOperator.StartsWith,
				value1: "F"
			})
		], true));
		this.oSelect.setSelectedKey("id_12");	// in this scenario, this call to .setSelectedKey() triggers re-rendering

		await ui5Delegate("onAfterRendering", this.oSelect);

		// assert
		assert.strictEqual(this.oSelect.getSelectedKey(), "id_12");
	});


});
