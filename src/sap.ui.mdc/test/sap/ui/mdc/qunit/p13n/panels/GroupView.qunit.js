/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/GroupView",
	"sap/ui/mdc/p13n/P13nBuilder",
	"sap/m/VBox",
	"sap/m/Input",
	"sap/ui/core/Core"
], function(GroupView, P13nBuilder, VBox, Input, oCore) {
	"use strict";

	const aVisible = ["key1", "key2", "key3"];

	const aInfoData = [
		{
			name: "key1",
			label: "Field 1",
			group: "G1"
		},
		{
			name: "key2",
			label: "Field 2",
			group: "G1"
		},
		{
			name: "key3",
			label: "Field 3",
			group: "G1"
		},
		{
			name: "key4",
			label: "Field 4",
			group: "G2"
		},
		{
			name: "key5",
			label: "Field 5",
			group: "G2"
		},
		{
			name: "key6",
			label: "Field 6",
			group: "G2",
			tooltip: "Some Tooltip"
		}
	];

	QUnit.module("API Tests", {
		beforeEach: function(){
			this.aMockInfo = aInfoData;
			this.oGroupView = new GroupView();

			this.oGroupView.setItemFactory(function(){
				return new VBox();
			});

			const fnEnhancer = function(mItem, oProperty) {
				if (oProperty.name == "key2") {
					mItem.active = true;
				}
				mItem.visible = aVisible.indexOf(oProperty.name) > -1;
				return true;
			};
			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, fnEnhancer, true);

			this.oGroupView.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function(){
			this.sDefaultGroup = null;
			this.oP13nData = null;
			this.aMockInfo = null;
			this.oGroupView.destroy();
		}
	});

	QUnit.test("check instantiation", function(assert){
		assert.ok(this.oGroupView, "Panel created");
		this.oGroupView.setP13nData(this.oP13nData.itemsGrouped);
		assert.ok(this.oGroupView.getModel(this.oGroupView.P13N_MODEL).isA("sap.ui.model.json.JSONModel"), "Model has been set");
	});

	const fnCheckListCreation = function(assert) {
		this.oGroupView.setP13nData(this.oP13nData.itemsGrouped);

		const oOuterList = this.oGroupView._oListControl;
		assert.ok(oOuterList.isA("sap.m.ListBase"), "Inner control is a list");
		assert.ok(oOuterList.isA("sap.m.ListBase"), "Inner control is a list");

		assert.equal(oOuterList.getItems().length, 2, "2 Groups created");

		const oFirstInnerList = oOuterList.getItems()[0].getContent()[0].getContent()[0];
		assert.equal(oFirstInnerList.getItems().length, 3, "First inner list contains 3 items");
		assert.ok(oFirstInnerList.getItems()[0].isA("sap.m.CustomListItem"), "Item matches provided factory function");

		const oSecondInnerList = oOuterList.getItems()[1].getContent()[0].getContent()[0];
		assert.equal(oSecondInnerList.getItems().length, 3, "Second inner list contains 3 items");
		assert.ok(oSecondInnerList.getItems()[0].isA("sap.m.CustomListItem"), "Item matches provided factory function");
	};

	QUnit.test("Check Outer and Inner List creation", function(assert){
		fnCheckListCreation.call(this, assert);
	});

	QUnit.test("Check column toggle", function(assert){
		this.oGroupView.setP13nData(this.oP13nData.itemsGrouped);

		const oOuterList = this.oGroupView._oListControl;

		assert.equal(oOuterList.getInfoToolbar().getContent().length, 1, "Only one column");

		this.oGroupView.showFactory(false);
		assert.equal(oOuterList.getInfoToolbar().getContent().length, 2, "Two columns");

		this.oGroupView.showFactory(true);
		assert.equal(oOuterList.getInfoToolbar().getContent().length, 1, "Only one column");
	});

	QUnit.test("Check 'active' icon'", function(assert){
		this.oGroupView.setP13nData(this.oP13nData.itemsGrouped);

		//Go in 'active' with icon view --> hide filter fields
		this.oGroupView.showFactory(false);

		assert.ok(this.oGroupView.getPanels()[0].getContent()[0].getItems()[1].getContent()[0].getItems()[1].getItems()[0].getVisible(), "Item is filtered (active)");

		//Mock what happens during runtime if a filter is made inactive
		this.oP13nData.itemsGrouped[0].items[1].active = false;
		this.oGroupView._getP13nModel().refresh();
		assert.ok(!this.oGroupView.getPanels()[0].getContent()[0].getItems()[1].getContent()[0].getItems()[1].getItems()[0].getVisible(), "Item is NOT filtered (active)");

		//Mock what happens during runtime if a filter is made active
		this.oP13nData.itemsGrouped[0].items[1].active = true;
		this.oGroupView._getP13nModel().refresh();
		assert.ok(this.oGroupView.getPanels()[0].getContent()[0].getItems()[1].getContent()[0].getItems()[1].getItems()[0].getVisible(), "Item is filtered (active)");
	});

	QUnit.test("Check 'labelFor' association on fields", function(assert){
		this.oGroupView.setP13nData(this.oP13nData.itemsGrouped);

		const aPanels = this.oGroupView.getPanels();

		//Due to lazy loading only the first panel is initialized (assocation can only be provided for loaded fields)
		aPanels[0].getContent()[0].getItems().forEach(function(oInnerItem){
			assert.ok(oInnerItem.getContent()[0].getItems()[0].getLabelFor(), "Label for assocation always provided");
		});

	});

	QUnit.test("Check labelFor reference on label (WITH acc children)", function(assert){
        this.oGroupView.setItemFactory(function(oContext){

            const oContainer = new VBox({
                items: [
                    new Input("testAccInput" + oContext.getProperty("name"), {})
                ]
            });

            oContainer.getIdForLabel = function() {
                return oContainer.getItems()[0].getId();
            };

            return oContainer;
        });

		this.oGroupView.setP13nData(this.oP13nData.itemsGrouped);
		this.oGroupView.showFactory(true);
		const aPanels = this.oGroupView.getPanels();
		aPanels[0].getContent()[0].getItems().forEach(function(oInnerItem, iIndex){
			const sKey = "key" + (iIndex + 1);
			const sLabelFor = sap.ui.getCore().byId(oInnerItem.getContent()[0].getItems()[0].getLabelFor()).getIdForLabel();
			assert.equal(sLabelFor, "testAccInput" + sKey, "Label for assocation points to children element");
		});
    });

});
