sap.ui.define([
	'sap/m/List',
	'sap/m/StandardListItem',
	'sap/m/Text',
	'sap/m/Input',
	'sap/ui/layout/VerticalLayout',
	'sap/ui/model/json/JSONModel',
	"sap/ui/qunit/utils/nextUIUpdate"
], function (List, StandardListItem, Text, Input, VerticalLayout, JSONModel, nextUIUpdate) {
	"use strict";

	var mPropertyData = {
		propertyText: "myProperty",
		compositeProperty: {
			partOne: "some",
			partTwo: "name"
		}
	};
	var mAggregationData = {
		items: [{id: "1", name: "Item 11"}, {id: "2", name: "Item 22"}],
		emptyItems: [],
		composite: {
			items: [{id: "1", name: "Item 33"}]
		}
	};

	return {
		PropertyFixture: new PropertyFixture(mPropertyData),
		ObjectFixture: new ObjectFixture(mPropertyData),
		AggregationFixture: new AggregationFixture(mAggregationData)
	};

	function PropertyFixture (mPropertyData) {
		this.data = mPropertyData;

		this.beforeEach = function () {
			var oModel = new JSONModel(mPropertyData);
			var oNamedModel = new JSONModel(mPropertyData);

			this.oPropertyText = new Text({text: "{/propertyText}"});
			this.oNamedModelPropertyText = new Text({text: "{myModel>/propertyText}"});
			this.oCompositePropertyText = new Text({text: "{/compositeProperty/partOne}+{/compositeProperty/partTwo}"});
			this.oNamedCompositePropertyText = new Text({text: "{myModel>/compositeProperty/partOne}+{myModel>/compositeProperty/partTwo}"});
			this.oStaticPropertyText = new Text();
			this.oStaticPropertyText.bindText({
				parts: [{
					value: "hello"
				}]
			});

			this.oPropertyText.placeAt("qunit-fixture");
			this.oNamedModelPropertyText.placeAt("qunit-fixture");
			this.oCompositePropertyText.placeAt("qunit-fixture");
			this.oNamedCompositePropertyText.placeAt("qunit-fixture");
			this.oStaticPropertyText.placeAt("qunit-fixture");

			this.oUIArea = this.oPropertyText.getUIArea();
			this.oUIArea.setModel(oModel);
			this.oUIArea.setModel(oNamedModel, "myModel");

			return nextUIUpdate();
		};

		this.afterEach = function () {
			this.oUIArea.setModel();
			this.oUIArea.setModel(undefined, "myModel");
			this.oPropertyText.destroy();
			this.oNamedModelPropertyText.destroy();
			this.oCompositePropertyText.destroy();
			this.oNamedCompositePropertyText.destroy();
			this.oStaticPropertyText.destroy();
		};
	}

	function ObjectFixture(mPropertyData) {
		this.data = mPropertyData;

		this.beforeEach = function () {
			var oModel = new JSONModel(mPropertyData);
			var oNamedModel = new JSONModel(mPropertyData);

			this.oInput = new Input();
			this.oInput.bindObject({path: "/compositeProperty"});
			this.oInput.bindProperty("value", {path: "partOne"});
			this.oInput.bindProperty("description", {path: "partTwo"});

			this.oNamedInput = new Input();
			this.oNamedInput.bindObject({path: "myModel>/compositeProperty"});
			this.oNamedInput.bindProperty("value", {path: "partOne"});

			this.oTexts = [new Text({text: "{partOne}"}), new Text({text: "{partTwo}"})];
			this.oVerticalLayout = new VerticalLayout({content: this.oTexts});
			this.oVerticalLayout.bindObject({path: "/compositeProperty"});

			this.oInput.placeAt("qunit-fixture");
			this.oNamedInput.placeAt("qunit-fixture");
			this.oVerticalLayout.placeAt("qunit-fixture");

			this.oUIArea = this.oInput.getUIArea();
			this.oUIArea.setModel(oModel);
			this.oUIArea.setModel(oNamedModel, "myModel");

			return nextUIUpdate();
		};

		this.afterEach = function () {
			this.oUIArea.setModel();
			this.oUIArea.setModel(undefined, "myModel");
			this.oInput.destroy();
			this.oNamedInput.destroy();
			this.oVerticalLayout.destroy();
		};
	}

	function AggregationFixture(mAggregationData) {
		var mAggregationPaths = ["items", "emptyItems", "composite/items"];
		this.data = {
			items: mAggregationData,
			paths: mAggregationPaths
		};

		this.beforeEach = function () {
			var oJSONModel = new JSONModel(mAggregationData);
			var oNamedModel = new JSONModel(mPropertyData);

			this.aLists = [];
			this.aNamedLists = [];
			var aListData = [{lists: this.aLists}, {model: "myModel", lists: this.aNamedLists}];

			aListData.forEach(function (mData, index) {
				mAggregationPaths.forEach(function (sPath) {
					var oList = new List();
					oList.bindItems({
						path: (mData.model ? mData.model + ">" : "") + "/" + sPath,
						template: new StandardListItem({
							title: "{name}"
						})
					});
					oList.placeAt("qunit-fixture");
					mData.lists.push(oList);
				});
			});

			this.oUIArea = this.aLists[0].getUIArea();
			this.oUIArea.setModel(oJSONModel);
			this.oUIArea.setModel(oNamedModel, "myModel");

			return nextUIUpdate();
		};

		this.afterEach = function () {
			this.oUIArea.setModel();
			this.oUIArea.setModel(undefined, "myModel");
			this.aLists.forEach(function (oList) {
				oList.destroy();
			});
			this.aNamedLists.forEach(function (oList) {
				oList.destroy();
			});
		};
	}

});
