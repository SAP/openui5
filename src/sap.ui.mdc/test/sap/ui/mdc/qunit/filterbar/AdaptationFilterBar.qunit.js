/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/filterbar/p13n/AdaptationFilterBar",
	"sap/ui/mdc/p13n/FlexUtil",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/p13n/AdaptationController",
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/Control",
	"sap/ui/mdc/BaseDelegate",
	"sap/ui/mdc/util/TypeUtil",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/FilterField"
], function (
	AdaptationFilterBar,
	FlexUtil,
	Table,
	AdaptationController,
	TableDelegate,
	Control,
	BaseDelegate,
	TypeUtil,
	JSONModel,
	FilterField
) {
	"use strict";

	var oAdaptationFilterBar;
	QUnit.module("AdaptationFilterBar - MDC Control specific tests", {
		beforeEach: function () {

			this.oTestTable = new Table();

			this.oAdaptationFilterBar = new AdaptationFilterBar({
				advancedMode: false,
				adaptationControl: this.oTestTable
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
			this.oTestTable.destroy();
			this.oTestTable = null;
		}
	});

	QUnit.test("instanciable", function (assert) {
		assert.ok(this.oAdaptationFilterBar);
	});

	QUnit.test("Correct derivation and interface implementation", function (assert) {
		assert.ok(this.oAdaptationFilterBar.isA("sap.ui.mdc.IFilter"));
		assert.ok(this.oAdaptationFilterBar.isA("sap.ui.mdc.filterbar.FilterBarBase"));
	});

	QUnit.test("Created changes will be applied on the consuming control - test for Table", function (assert) {
		var done = assert.async();

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

		this.oAdaptationFilterBar.setAdaptationControl(this.oTestTable);

		var oAdaptationController = new AdaptationController({
			adaptationControl: this.oTestTable,
			stateRetriever: function(){
				return {
					filter: {}
				};
			}
		});

		this.oTestTable._oAdaptationController = oAdaptationController;
		oAdaptationController.aPropertyInfo = [{name: "key1"}];

		oAdaptationController.createConditionChanges(mSampleConditions).then(function(aChanges){
			assert.equal(aChanges.length, 1, "One change has been created");
			assert.deepEqual(aChanges[0].selectorElement, this.oTestTable, "Change has been created on the corresponding adaptationControl");
			done();
		}.bind(this));
	});

	QUnit.test("Set propertyInfo depending on parent", function(assert) {
		var done = assert.async();

		var oMockedPropertyInfoPromise = new Promise(function(resolve){
			resolve(this.aMockProperties);
		}.bind(this));

		sinon.stub(TableDelegate, "fetchProperties").returns(oMockedPropertyInfoPromise);

		//AdaptationFilterBar should listen to parent "fetchProperties"
		this.oAdaptationFilterBar.setAdaptationControl(this.oTestTable);

		//Init parent
		this.oTestTable.initialized().then(function(){

			assert.deepEqual(this.oAdaptationFilterBar._aProperties, [], "Inner FB has no properties if not initialzed");

			//init AdaptationFilterBar
			this.oAdaptationFilterBar.initialized().then(function(){

				assert.deepEqual(this.oAdaptationFilterBar._aProperties.length, this.aMockProperties.length, "Property info has been passed from the Parent");
				done();
			}.bind(this));
		}.bind(this));

	});

	QUnit.module("AdaptationFilterBar - MDC Control unspecific tests", {
		beforeEach: function () {

			//mock parent as 'AdaptationControl'
			this.oParent = new Control({
				delegate: {
					name: "sap/ui/mdc/BaseDelegate"
				}
			});

			oAdaptationFilterBar = new AdaptationFilterBar({
				advancedMode: false,
				adaptationControl: this.oParent
			});

			if (FlexUtil.handleChanges.restore){
				FlexUtil.handleChanges.restore();
			}

			//Mock propertyinfo
			this.aMockProperties = [
				{
					name: "key1",
					typeConfig: TypeUtil.getTypeConfig("sap.ui.model.type.String")
				},
				{
					name: "key2",
					typeConfig: TypeUtil.getTypeConfig("sap.ui.model.odata.type.DateTimeOffset")
				}
			];

			//AdaptatationFilterBar expects 'filterConditions' property
			this.oParent.getFilterConditions = function() {
				return {};
			};
			sinon.mock(this.oParent.prototype, "getFilterConditions").callsFake({});

			//Mock Parents AdaptationController
			this.oParent._oAdaptationController = new AdaptationController({
				adaptationControl: this.oParent,
				stateRetriever: function() {
					return {
						filter: {}
					};
				}
			});
			this.oParentAC = this.oParent._oAdaptationController;

			//Mock Delegate funcitonality
			var oMockedPropertyInfoPromise = new Promise(function(resolve){
				resolve(this.aMockProperties);
			}.bind(this));

			BaseDelegate.fetchProperties = function() {
				return oMockedPropertyInfoPromise;
			};

			BaseDelegate.getFilterDelegate = function() {
				return {
					addFilterItem: function(oProperty, oControl) {
						return Promise.resolve(new FilterField());
					}
				};
			};

			oAdaptationFilterBar.setAdaptationControl(this.oParent);
		},
		afterEach: function () {
			oAdaptationFilterBar.destroy();
			this.oParent = null;
			this.oParentAC = null;
			this.aMockProperties = null;
		}
	});

	QUnit.test("Created changes should always be externalized - Check String types", function(assert) {
		var done = assert.async();

		//Init parent
		this.oParent.initControlDelegate().then(function(){
			//init AdaptationFilterBar
			oAdaptationFilterBar.initialized().then(function(){

				oAdaptationFilterBar.setLiveMode(false);

				oAdaptationFilterBar.addCondition("key1", {
					operator:"EQ",
					values: [
						"Externalized Test"
					]
				}).then(function(){


					var aInnerConditions = oAdaptationFilterBar._getConditionModel().getAllConditions()["key1"];

					assert.ok(aInnerConditions[0].hasOwnProperty("isEmpty"));

					this.oParentAC.setAfterChangesCreated(function(oAC, aChanges) {
						// isEmpty is cleaned up for externalized changes only --> indicator whether the changes are created in externalized format
						assert.ok(!aChanges[0].changeSpecificData.content.condition.hasOwnProperty("isEmpty"));
						done();
					});

					oAdaptationFilterBar._handleModal("Ok");

				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Created changes should always be externalized - Check Date types", function(assert) {
		var done = assert.async();

		//Init parent
		this.oParent.initControlDelegate().then(function(){
			//init AdaptationFilterBar
			oAdaptationFilterBar.initialized().then(function(){

				oAdaptationFilterBar.setLiveMode(false);

				oAdaptationFilterBar.addCondition("key2", {
					operator:"EQ",
					values: [
						"Dec 31, 2020, 11:59:58 PM"
					]
				}).then(function(){

					var aInnerConditions = oAdaptationFilterBar._getConditionModel().getAllConditions()["key2"];

					assert.ok(aInnerConditions[0].hasOwnProperty("isEmpty"));
					assert.equal(typeof aInnerConditions[0], "object", "Internal format - type is not stringified");

					this.oParentAC.setAfterChangesCreated(function(oAC, aChanges) {
						// isEmpty is cleaned up for externalized changes only --> indicator whether the changes are created in externalized format
						assert.ok(!aChanges[0].changeSpecificData.content.condition.hasOwnProperty("isEmpty"));
						assert.equal(typeof aChanges[0].changeSpecificData.content.condition.values[0], "string", "Externalized format should be stringified");
						done();
					});

					oAdaptationFilterBar._handleModal("Ok");

				}.bind(this));
			}.bind(this));
		}.bind(this));

	});

	QUnit.test("Create filter fields", function(assert) {

		var done = assert.async();

		oAdaptationFilterBar.setP13nModel(new JSONModel({
			items: [
				{
					name: "key1"
				},
				{
					name: "key2"
				}
			]
		}));

		this.oParent.initControlDelegate().then(function(){

			oAdaptationFilterBar.createFilterFields().then(function(){
				assert.ok(oAdaptationFilterBar.getFilterItems().length, 2, "FilterFields have been created");
				done();
			});

		});
	});

	QUnit.test("Check 'advanvedMode' - check 'remove' hook executions", function(assert){
		var done = assert.async(2);

		BaseDelegate.addItem = function(sKey, oFilterBar) {
			return Promise.resolve(new FilterField({
				conditions: "{$filters>/conditions/" + sKey + "}"
			}));
		};

		BaseDelegate.afterRemoveFilterFlex = function(sKey, oFilterBar) {
			assert.ok(true, "remove hook called");
			done(2);
		};

		oAdaptationFilterBar.setAdvancedMode(true);

		this.oParent.getFilterItems = function() {
			return [
				new FilterField({
					conditions: "{$filters>/conditions/key1}"
				})
			];
		};

		var oGroupPanel = oAdaptationFilterBar._oFilterBarLayout.getInner();
		sinon.stub(oGroupPanel, "getSelectedFields").returns([
			"key1"
		]);


		oAdaptationFilterBar.setP13nModel(new JSONModel({
			items: [
				{
					name: "key1"
				},
				{
					name: "key2"
				},
				{
					name: "key3"
				}
			]
		}));

		this.oParent.initControlDelegate().then(function(){

			oAdaptationFilterBar.createFilterFields().then(function(){
				assert.ok(oAdaptationFilterBar.getFilterItems().length, 3, "FilterFields have been created");
				oAdaptationFilterBar._executeRequestedRemoves();
			});
		});
	});

	QUnit.test("Check 'advanvedMode' - check 'remove' hook executions, but change the selection before", function(assert){
		var done = assert.async(1);

		BaseDelegate.addItem = function(sKey, oFilterBar) {
			return Promise.resolve(new FilterField({
				conditions: "{$filters>/conditions/" + sKey + "}"
			}));
		};

		BaseDelegate.afterRemoveFilterFlex = function(sKey, oFilterBar) {
			assert.ok(true, "remove hook called");
			done(1);
		};

		oAdaptationFilterBar.setAdvancedMode(true);

		this.oParent.getFilterItems = function() {
			return [
				new FilterField({
					conditions: "{$filters>/conditions/key1}"
				})
			];
		};

		var oGroupPanel = oAdaptationFilterBar._oFilterBarLayout.getInner();

		sinon.stub(oGroupPanel, "getSelectedFields").returns([
			"key1", "key2"
		]);


		oAdaptationFilterBar.setP13nModel(new JSONModel({
			items: [
				{
					name: "key1"
				},
				{
					name: "key2"
				},
				{
					name: "key3"
				}
			]
		}));

		this.oParent.initControlDelegate().then(function(){

			oAdaptationFilterBar.createFilterFields().then(function(){
				assert.ok(oAdaptationFilterBar.getFilterItems().length, 3, "FilterFields have been created");
				oAdaptationFilterBar._executeRequestedRemoves();

				//Call it again --> no more hooks should be executed
				oAdaptationFilterBar._executeRequestedRemoves();
			});
		});
	});

});
