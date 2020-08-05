/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/semantic/SortSelect",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Item"
], function(createAndAppendDiv, SortSelect, JSONModel, Item) {
	createAndAppendDiv("qunit-fixture-visible");



	QUnit.module("Semantic Select Control", {
		beforeEach: function () {

		},

		afterEach: function () {
			jQuery("#qunit-fixture-visible").html("");
		}
	});

	QUnit.test("has valid behavior", function (assert) {
		// Arrange
		var oModel = new JSONModel(),
				aSampleData = [
					{
						key: "price"
					},
					{
						key: "name"
					},
					{
						key: "date"
					},
					{
						key: "description"
					}
				], oItemTemplate = new Item({
					key: "{key}"
				}),
				bChangeEventHasFired = false,
				oSemanticSelect = new SortSelect({
					items: {
						path: "/",
						template: oItemTemplate
					}, change: function () {
						bChangeEventHasFired = true;
					}
				});

		sap.ui.getCore().applyChanges();

		// Act
		oModel.setData(aSampleData);
		oSemanticSelect.setModel(oModel);

		// Assert
		assert.strictEqual(oSemanticSelect.getEnabled(), true, "The property 'enabled' is correctly set to true");

		// Act
		var bElementEquality = true;

		aSampleData.forEach(function (oItem, iIndex) {
			if (oItem.key !== oSemanticSelect.getItemAt(iIndex).getKey()) {
				bElementEquality = false;
			}
		});

		// Assert
		assert.strictEqual(bElementEquality, true, "The model collection is bound to the Items aggregation");

		// Assert
		assert.strictEqual(bElementEquality, true, "'getItemAt()' returns the correct elements");

		// Act
		var oItemToSetAsSelected = oSemanticSelect.getItemAt(3);
		oSemanticSelect.setSelectedItem(oItemToSetAsSelected);
		var oSelectedItem = oSemanticSelect.getSelectedItem();

		// Assert
		assert.strictEqual(oSelectedItem, oItemToSetAsSelected, "'setSelectedItem()' changes the selected item correctly");

		// Assert
		assert.strictEqual(oSemanticSelect.getSelectedItem(), oItemToSetAsSelected, "'getSelectedItem()' returns the selected item correctly");
		assert.strictEqual(oSemanticSelect.getSelectedKey(), oItemToSetAsSelected.getKey(), "'getSelectedKey()' returns the selected item correctly");

		// Act
		oItemToSetAsSelected = oSemanticSelect.getItemAt(2);
		oSemanticSelect.setSelectedKey(oItemToSetAsSelected.getKey());
		oSelectedItem = oSemanticSelect.getSelectedItem();

		// Assert
		assert.strictEqual(oSelectedItem, oItemToSetAsSelected, "'setSelectedKey()' changes the selected item correctly");

		// Assert
		assert.strictEqual(oSemanticSelect.getSelectedItem(), oItemToSetAsSelected, "'getSelectedItem()' returns the selected item correctly");
		assert.strictEqual(oSemanticSelect.getSelectedKey(), oItemToSetAsSelected.getKey(), "'getSelectedKey()' returns the selected item correctly");

		// Clean up
		oSemanticSelect.destroy();
	});

	QUnit.test("selectedKey databinding", function (assert) {
		// Arrange
		var oModel = new JSONModel(),
				aSampleData = {
					selected: "name",
					items: [
						{
							key: "price"
						},
						{
							key: "name"
						},
						{
							key: "date"
						},
						{
							key: "description"
						}
					]
				}, oItemTemplate = new Item({
					key: "{key}"
				}),
				bChangeEventHasFired = false,
				oSemanticSelect = new SortSelect({
					items: {
						path: "/items",
						template: oItemTemplate
					}, change: function () {
						bChangeEventHasFired = true;
					},
					selectedKey: "{/selected}"
				});

		sap.ui.getCore().applyChanges();

		// Act
		oModel.setData(aSampleData);
		oSemanticSelect.setModel(oModel);

		// Assert
		assert.notEqual(oSemanticSelect.getSelectedKey(), null, "selectedKey is not null");
		assert.strictEqual(oSemanticSelect.getSelectedKey(), "name", "selectedKey value is correct");
		assert.strictEqual(oSemanticSelect.getSelectedItem(), oSemanticSelect.getItemAt(1), "'selectedItem corresponds to selectedKey");

		// Act
		oModel.setData({selected: "date"}, true);

		// Assert
		assert.notEqual(oSemanticSelect.getSelectedKey(), null, "selectedKey is not null after update from model");
		assert.strictEqual(oSemanticSelect.getSelectedKey(), "date", "selectedKey value is correct after update from model");
		assert.strictEqual(oSemanticSelect.getSelectedItem(), oSemanticSelect.getItemAt(2), "'selectedItem corresponds to selectedKey after update from model");

		// Act
		oSemanticSelect.setSelectedItem(oSemanticSelect.getItemAt(3));

		// Assert
		assert.notEqual(oSemanticSelect.getSelectedKey(), "selectedKey is not null after update from API");
		assert.strictEqual(oSemanticSelect.getSelectedKey(), "description", "selectedKey value is correct after update from API");
		assert.strictEqual(oModel.getData().selected, "description", "model is correctly updated after update from API");

		// Clean up
		oSemanticSelect.destroy();
	});
});