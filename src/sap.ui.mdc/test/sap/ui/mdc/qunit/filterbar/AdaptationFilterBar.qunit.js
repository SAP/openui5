/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/filterbar/FilterBarBase",
	"sap/ui/mdc/filterbar/p13n/AdaptationFilterBar",
	"sap/ui/mdc/p13n/FlexUtil",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/TableDelegate"
], function (
	FilterBarBase,
	AdaptationFilterBar,
	FlexUtil,
	Table,
	TableDelegate
) {
	"use strict";

	QUnit.module("AdaptationFilterBar", {
		beforeEach: function () {
			this.oAdaptationFilterBar = new AdaptationFilterBar({
				delegate: { name: "test-resources/sap/ui/mdc/qunit/filterbar/UnitTestMetadataDelegate", payload: { modelName: undefined, collectionName: "test" } }
			});
			if (FlexUtil.handleChanges.restore){
				FlexUtil.handleChanges.restore();
			}

			this.aMockProperties = [
				{
					name: "key1"
				},
				{
					name: "key2"
				}
			];

			return this.oAdaptationFilterBar.retrieveAdaptationController().then(function (oAdaptationControllerInstance) {
				this.oAdaptationController = this.oAdaptationFilterBar.getAdaptationController();
			}.bind(this));
		},

		afterEach: function () {
			this.oAdaptationFilterBar.destroy();
			this.oAdaptationFilterBar = undefined;
			this.oAdaptationController = undefined;
			this.aMockProperties = null;
		}
	});

	QUnit.test("instanciable", function (assert) {
		assert.ok(this.oAdaptationFilterBar);
	});

	QUnit.test("Correct derivation and interface implementation", function (assert) {
		assert.ok(this.oAdaptationFilterBar.isA("sap.ui.mdc.IFilter"));
		assert.ok(this.oAdaptationFilterBar.isA("sap.ui.mdc.filterbar.FilterBarBase"));
	});

	QUnit.test("Created changes will be applied on the consuming control", function (assert) {
		var done = assert.async();
		var oTestTable = new Table("testTable",{});
		this.oAdaptationFilterBar.setAdaptationControl(oTestTable);

		this.oAdaptationFilterBar.waitForInitialization().then(function(){
			var mSampleConditions = {
				key1: [
					{
						operator:"EQ",
						values: [
							"Test"
						]
					}
				]
			};

			this.oAdaptationController.createConditionChanges(mSampleConditions).then(function(aChanges){
				assert.ok(aChanges.length, 1, "Changes created");
				assert.equal(aChanges[0].selectorElement, oTestTable);
				assert.equal(aChanges[0].changeSpecificData.content.condition, mSampleConditions["key1"][0]);
				done();
			});
		}.bind(this));
	});

	QUnit.test("Set propertyInfo depending on parent", function(assert) {
		var done = assert.async();

		var oParent = new Table("delegateTestTable",{});
		var oNoDelegateAFB = new AdaptationFilterBar();

		var oMockedPropertyInfoPromise = new Promise(function(resolve){
			resolve(this.aMockProperties);
		}.bind(this));

		sinon.stub(TableDelegate, "fetchProperties").returns(oMockedPropertyInfoPromise);

		//AdaptationFilterBar should listen to parent "fetchProperties"
		oNoDelegateAFB.setAdaptationControl(oParent);

		//Init parent
		oParent.initialized().then(function(){

			assert.deepEqual(oNoDelegateAFB._aProperties, [], "Inner FB has no properties if not initialzed");

			//init AdaptationFilterBar
			oNoDelegateAFB.initialized().then(function(){

				assert.deepEqual(oNoDelegateAFB._aProperties.length, this.aMockProperties.length, "Property info has been passed from the Parent");
				done();
			}.bind(this));
		}.bind(this));

	});

});
