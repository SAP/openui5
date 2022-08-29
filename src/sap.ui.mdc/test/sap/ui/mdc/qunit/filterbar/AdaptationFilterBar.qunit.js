/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/filterbar/p13n/AdaptationFilterBar",
	"sap/ui/mdc/p13n/FlexUtil",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/Control",
	"sap/ui/mdc/AggregationBaseDelegate",
	"sap/ui/mdc/util/TypeUtil",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/FilterBar",
	"./UnitTestMetadataDelegate",
	"../QUnitUtils",
	"sap/ui/mdc/p13n/Engine",
	"sap/ui/mdc/p13n/subcontroller/FilterController"
], function (
	AdaptationFilterBar,
	FlexUtil,
	Table,
	Control,
	AggregationBaseDelegate,
	TypeUtil,
	JSONModel,
	FilterField,
	FilterBar,
	FBTestDelegate,
	MDCQUnitUtils,
	Engine,
	FilterController
) {
	"use strict";

	var oAdaptationFilterBar;
	QUnit.module("AdaptationFilterBar - MDC Control specific tests", {
		beforeEach: function () {
			var aPropertyInfo = [
				{
					name: "key1"
				},
				{
					name: "key2"
				}
			];

			this.oTestTable = new Table({
				p13nMode: ["Filter","Column","Sort"]
			});

			this.oAdaptationFilterBar = new AdaptationFilterBar({
				adaptationControl: this.oTestTable
			});
			if (FlexUtil.handleChanges.restore){
				FlexUtil.handleChanges.restore();
			}

			MDCQUnitUtils.stubPropertyInfos(this.oTestTable, aPropertyInfo);
		},

		afterEach: function () {
			this.oAdaptationFilterBar.destroy();
			this.oAdaptationFilterBar = undefined;

			MDCQUnitUtils.restorePropertyInfos(this.oTestTable);
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

		this.oTestTable.getEngine().createChanges({
			control: this.oTestTable,
			key: "Filter",
			state: mSampleConditions,
			applyAbsolute: false,
			suppressAppliance: true
		}).then(function(aChanges){
			assert.equal(aChanges.length, 1, "One change has been created");
			assert.deepEqual(aChanges[0].selectorElement, this.oTestTable, "Change has been created on the corresponding adaptationControl");
			done();
		}.bind(this));
	});

	QUnit.test("Set propertyInfo depending on parent", function(assert) {
		var done = assert.async();

		//AdaptationFilterBar should listen to parent "fetchProperties"
		this.oAdaptationFilterBar.setAdaptationControl(this.oTestTable);

		//Init parent
		this.oTestTable.initialized().then(function(){
			assert.notOk(this.oAdaptationFilterBar.getPropertyHelper(), "PropertyHelper not expected");
			this.oTestTable.awaitPropertyHelper().then(function(oPropertyHelper){
				assert.deepEqual(this.oAdaptationFilterBar.getPropertyHelper(), oPropertyHelper, "PropertyHelper has been passed from the Parent");
				done();
			}.bind(this));
		}.bind(this));

	});

	QUnit.test("Check the delegation of PropertyHelper related functions", function(assert){

		return this.oAdaptationFilterBar.initialized().then(function() {
			assert.ok(this.oAdaptationFilterBar.getTypeUtil());
			assert.equal(this.oAdaptationFilterBar.getTypeUtil(), this.oTestTable.getTypeUtil());

			assert.ok(this.oAdaptationFilterBar.getPropertyHelper());
			assert.equal(this.oAdaptationFilterBar.getPropertyHelper(), this.oTestTable.getPropertyHelper());

		}.bind(this));

	});

	QUnit.module("AdaptationFilterBar - MDC Control unspecific tests", {
		createIFilter: function(mSettings) {
			var IFilterControl = Control.extend("temp", {
				metadata: {
					interfaces: [
						"sap.ui.mdc.IFilter"
					]
				}
			});
			return new IFilterControl(mSettings);
		},
		createIFilterSource: function(mSettings) {
			var IFilterControl = Control.extend("temp", {
				metadata: {
					interfaces: [
						"sap.ui.mdc.IFilterSource"
					]
				}
			});
			return new IFilterControl(mSettings);
		},
		prepareTestSetup: function(bCreateIFilter) {
			//mock parent as 'AdaptationControl'
			var fnParentFactory = bCreateIFilter ? this.createIFilter : this.createIFilterSource;

			this.oParent = fnParentFactory({
				delegate: {
					name: "sap/ui/mdc/AggregationBaseDelegate"
				}
			});

			var oController = new FilterController(this.oParent);

			oController.getCurrentState = function(){
				return this.oParent.getFilterConditions();
			}.bind(this);
			Engine.getInstance().addController(oController, "Filter");

			oAdaptationFilterBar = new AdaptationFilterBar({
				adaptationControl: this.oParent
			});

			//AdaptatationFilterBar expects 'filterConditions' property
			this.oParent.getFilterConditions = function() {
				return {};
			};
			sinon.mock(this.oParent.prototype, "getFilterConditions").callsFake({});

			oAdaptationFilterBar.setAdaptationControl(this.oParent);
		},
		beforeEach: function () {
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

			//Mock Delegate funcitonality
			var oMockedPropertyInfoPromise = new Promise(function(resolve){
				resolve(this.aMockProperties);
			}.bind(this));

			//Mock fetch properties
			sinon.stub(AggregationBaseDelegate, "fetchProperties").returns(oMockedPropertyInfoPromise);

			//Mock 'getFilterDelegate'
			AggregationBaseDelegate.getFilterDelegate = function() {
				return {
					addItem: function(sProperty, oControl) {
						return Promise.resolve(new FilterField());
					}
				};
			};

			//Provide simple 'addItem' hook for testing on 'AggregationBaseDelegate'
			this.addItem = function(sKey, oControl){
				return Promise.resolve(new FilterField({
					conditions: "{$filters>/conditions/" + sKey + "}"
				}));
			};
			this.oAddStub = sinon.stub(AggregationBaseDelegate, "addItem");
		},
		afterEach: function () {
			AggregationBaseDelegate.fetchProperties.restore();
			delete AggregationBaseDelegate.getFilterDelegate;
			AggregationBaseDelegate.addItem.restore();
			oAdaptationFilterBar.destroy();
			this.oParent = null;
			this.aMockProperties = null;
		}
	});

	QUnit.test("Created changes should always be externalized - Check String types", function(assert) {
		var done = assert.async();
		this.prepareTestSetup(true);

		Promise.all([
			//1) Init Parent (Delegate + PropertyHelper)
			this.oParent.initPropertyHelper(),
			this.oParent.initControlDelegate()
		])
		.then(function(){
			//2) Init AdaptationFilterBar
			return oAdaptationFilterBar.initialized();
		})
		.then(function(){

			//3) Add a condition
			oAdaptationFilterBar.setLiveMode(false);

			return oAdaptationFilterBar.addCondition("key1", {
				operator:"EQ",
				values: [
					"Externalized Test"
				]
			});
		})
		.then(function(){

			//4) Assertions

			var aInnerConditions = oAdaptationFilterBar._getConditionModel().getAllConditions()["key1"];
			assert.ok(aInnerConditions[0].hasOwnProperty("isEmpty"));
			oAdaptationFilterBar.createConditionChanges().then(function(aChanges){
				// isEmpty is cleaned up for externalized changes only --> indicator whether the changes are created in externalized format
				assert.ok(!aChanges[0].changeSpecificData.content.condition.hasOwnProperty("isEmpty"));
				done();
			});

		});
	});

	QUnit.test("Created changes should always be externalized - Check Date types", function(assert) {
		var done = assert.async();
		this.prepareTestSetup(true);

		Promise.all([
			//1) Init Parent (Delegate + PropertyHelper)
			this.oParent.initPropertyHelper(),
			this.oParent.initControlDelegate()
		])
		.then(function(){
			//2) Init AdaptationFilterBar
			return oAdaptationFilterBar.initialized();
		})
		.then(function(){

			//3) Add a condition
			oAdaptationFilterBar.setLiveMode(false);

			return oAdaptationFilterBar.addCondition("key2", {
				operator:"EQ",
				values: [
					"Dec 31, 2020, 11:59:58 PM"
				]
			});
		})
		.then(function(){

			//4) Assertions

			var aInnerConditions = oAdaptationFilterBar._getConditionModel().getAllConditions()["key2"];

			assert.ok(aInnerConditions[0].hasOwnProperty("isEmpty"));
			assert.equal(typeof aInnerConditions[0], "object", "Internal format - type is not stringified");

			oAdaptationFilterBar.createConditionChanges().then(function(aChanges){
				// isEmpty is cleaned up for externalized changes only --> indicator whether the changes are created in externalized format
				assert.ok(!aChanges[0].changeSpecificData.content.condition.hasOwnProperty("isEmpty"));
				assert.equal(typeof aChanges[0].changeSpecificData.content.condition.values[0], "string", "Externalized format should be stringified");
				done();
			});

		});
	});

	QUnit.test("Create filter fields", function(assert) {

		var done = assert.async();
		this.prepareTestSetup(false);

		oAdaptationFilterBar.setP13nData({
			items: [
				{
					name: "key1"
				},
				{
					name: "key2"
				}
			]
		});

		Promise.all([
			//1) Init Parent (Delegate + PropertyHelper)
			this.oParent.initPropertyHelper(),
			this.oParent.initControlDelegate()
		]).then(function(){

			oAdaptationFilterBar.createFilterFields().then(function(){
				assert.ok(oAdaptationFilterBar.getFilterItems().length, 2, "FilterFields have been created");
				done();
			});

		});
	});

	QUnit.test("Create filter fields and check their order", function(assert) {

		var done = assert.async();
		this.prepareTestSetup(false);

		//the order (key1, key2) should be maintained in the AdaptationFilterBar
		oAdaptationFilterBar.setP13nData({
			items: [
				{
					name: "key1"
				},
				{
					name: "key2"
				}
			]
		});

		//introduce custom filter delegate 'addItem' to mock a delay in FF creation
		AggregationBaseDelegate.getFilterDelegate = function() {
			return {
				addItem: function(sProperty, oControl) {
					if (sProperty == "key1") {

						//mock a delay in FF creation
						return new Promise(function(resolve){
							setTimeout(function(){
								resolve(new FilterField({
									label: "key1"
								}));
							}, 500);
						});
					}
					return Promise.resolve(new FilterField({
						label: "key2"
					}));
				}
			};
		};

		Promise.all([
			//1) Init Parent (Delegate + PropertyHelper)
			this.oParent.initPropertyHelper(),
			this.oParent.initControlDelegate()
		])
		.then(function(){
			oAdaptationFilterBar.createFilterFields().then(function(){
				//key1 takes longer to create but should still be the first item to be displayed, as the order is reiterated after all promises have been resolved
				assert.equal(oAdaptationFilterBar.getFilterItems()[0].getLabel(), "key1", "The order of filter items is similar to the provided p13n model");
				assert.equal(oAdaptationFilterBar.getFilterItems()[1].getLabel(), "key2", "The order of filter items is similar to the provided p13n model");
				done();
			});

		});
	});

	QUnit.test("Test '_checkFunctionality' - check 'remove' hook executions", function(assert){
		var done = assert.async();
		this.prepareTestSetup(true);

		var oRemoveSpy = sinon.spy(AggregationBaseDelegate, "removeItem");

		this.oAddStub.callsFake(this.addItem);


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


		oAdaptationFilterBar.setP13nData({
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
		});

		Promise.all([
			//1) Init Parent (Delegate + PropertyHelper)
			this.oParent.initPropertyHelper(),
			this.oParent.initControlDelegate()
		])
		.then(function(){

			oAdaptationFilterBar.createFilterFields().then(function(){
				assert.ok(oAdaptationFilterBar.getFilterItems().length, 3, "FilterFields have been created");
				oAdaptationFilterBar.executeRemoves();
				assert.equal(oRemoveSpy.callCount, 2, "Correct amount of removes triggered");
				AggregationBaseDelegate.removeItem.restore();
				done();
			});
		});
	});

	QUnit.test("Check amount of search events triggered on multiple changes in one appliance", function(assert){
		var done = assert.async(2);
		this.prepareTestSetup(true);

		sinon.stub(Engine.getInstance(), "waitForChanges").returns(Promise.resolve());

		oAdaptationFilterBar.setP13nData({
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
		});

		Promise.all([
			//1) Init Parent (Delegate + PropertyHelper)
			this.oParent.initPropertyHelper(),
			this.oParent.initControlDelegate()
		])
		.then(function(){

			var iCount = 0;
			oAdaptationFilterBar.attachSearch(function(){
				iCount++;
				assert.equal(iCount, 1,"Only one search event has been fired during change processing");
				done(1);
			});

			//mock multiple calls which would happen on multiple filter changes created
			oAdaptationFilterBar.applyConditionsAfterChangesApplied(this.oParent);
			oAdaptationFilterBar.applyConditionsAfterChangesApplied(this.oParent);
			oAdaptationFilterBar.applyConditionsAfterChangesApplied(this.oParent);

			Engine.getInstance().waitForChanges(this.oParent)
			.then(function(){
				done(2);
				Engine.getInstance().waitForChanges.restore();
			});

		}.bind(this));
	});

	QUnit.test("Test '_checkFunctionality' - check 'remove' hook executions, but change the selection before", function(assert){
		var done = assert.async(1);
		this.prepareTestSetup(true);

		var oRemoveSpy = sinon.spy(AggregationBaseDelegate, "removeItem");
		this.oAddStub.callsFake(this.addItem);

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


		oAdaptationFilterBar.setP13nData({
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
		});

		Promise.all([
			//1) Init Parent (Delegate + PropertyHelper)
			this.oParent.initPropertyHelper(),
			this.oParent.initControlDelegate()
		])
		.then(function(){

			oAdaptationFilterBar.createFilterFields().then(function(){
				assert.ok(oAdaptationFilterBar.getFilterItems().length, 3, "FilterFields have been created");

				//manually execute removes
				oAdaptationFilterBar.executeRemoves().then(function(){

					//Call it again --> no more hooks should be executed
					oAdaptationFilterBar.executeRemoves();
					assert.equal(oRemoveSpy.callCount, 1, "Correct amount of removes triggered");
					AggregationBaseDelegate.removeItem.restore();
					done();
				});
			});
		});
	});

	QUnit.test("CreateFilterFields should only resolve once all Fields have been created", function(assert) {

		var done = assert.async();
		this.prepareTestSetup(true);

		//Use a timeout to mock FilterField creation delay
		this.oAddStub.callsFake(function(){
			return new Promise(function(resolve){
				setTimeout(function(){
					resolve(this.addItem());
				}.bind(this), 750);
			}.bind(this));
		}.bind(this));

		this.oParent.getFilterItems = function() {
			return [];
		};

		oAdaptationFilterBar.setP13nData({
			items: [
				{
					name: "key1"
				},
				{
					name: "key2"
				}
			]
		});

		Promise.all([
			//1) Init Parent (Delegate + PropertyHelper)
			this.oParent.initPropertyHelper(),
			this.oParent.initControlDelegate()
		])
		.then(function(){

			oAdaptationFilterBar.createFilterFields().then(function(oAdaptationFilterBar){

				assert.ok(oAdaptationFilterBar, "Promise resolved");

				assert.equal(oAdaptationFilterBar.getFilterItems().length, 2, "FilterItems created");

				done();

			});
		});
	});

	QUnit.test("Throw an error for undefined FilterField creation", function(assert) {

		var done = assert.async();
		this.prepareTestSetup(true);

		this.oAddStub.callsFake(function(){
			return Promise.resolve(undefined);
		});

		this.oParent.getFilterItems = function() {
			return [];
		};

		oAdaptationFilterBar.setP13nData({
			items: [
				{
					name: "key1"
				},
				{
					name: "key2"
				}
			]
		});

		Promise.all([
			//1) Init Parent (Delegate + PropertyHelper)
			this.oParent.initPropertyHelper(),
			this.oParent.initControlDelegate()
		])
		.then(function(){

			oAdaptationFilterBar.createFilterFields().catch(function(oErr){

				assert.ok(oErr, "Error thrown");
				assert.equal(oErr.message, "No FilterField could be created for property: 'key1'.");

				done();

			});
		});
	});

	QUnit.test("Throw an error for unsufficient an unsufficient 'adaptatationControl' ", function(assert) {
		assert.throws(
			function () {
				oAdaptationFilterBar.setAdaptationControl(new Control());
			},
			function (oError) {
				return (
					oError instanceof Error &&
					oError.message ===
					"The 'adaptationControl' needs to implement the IFilterSource or IFilter interface"
				);
			}
		);
	});

	QUnit.module("FilterBar with bound filterItems aggregation", {
		beforeEach: function(assert){
			var oMyModel = new JSONModel({
				data: [
					{
						key: "key1",
						label: "Some custom label"
					}
				]
			});

			this.oParent = new FilterBar({
				delegate: {
					name: "test-resources/sap/ui/mdc/qunit/filterbar/UnitTestMetadataDelegate",
					payload: {
						modelName: undefined,
						collectionName: "test"
					}
				},
				propertyInfo: [{name: "key1", typeConfig: {}}],
				filterItems: {
					path: "$custom>/data",
					template: new FilterField({
						conditions: "{$filters>/conditions/key1}",
						label: "{$custom>label}"
					})
				}
			});

			return this.oParent.initialized().then(function() {
				this.oParent.setModel(oMyModel, "$custom");

				sinon.stub(FBTestDelegate, "addItem").callsFake(function(sKey, oControl){
					return Promise.resolve(new FilterField({
						conditions: "{$filters>/conditions/" + sKey + "}"
					}));
				});

				return this.oParent.retrieveInbuiltFilter();
			}.bind(this));

		},
		afterEach: function(assert) {
			FBTestDelegate.addItem.restore();
			this.oParent.destroy();
		}
	});

	QUnit.test("Use bound label property for p13n", function(assert){
		var done = assert.async();

		this.oParent.getInbuiltFilter().setP13nData({
			items: [
				{
					name: "key1"
				},
				{
					name: "key2"
				}
			]
		});

		sinon.stub();

		Promise.all([
			//1) Init Parent (Delegate + PropertyHelper)
			this.oParent.initPropertyHelper(),
			this.oParent.initControlDelegate()
		])
		.then(function(){

			this.oParent.getInbuiltFilter().createFilterFields().then(function(oAdaptationFilterBar){

				var aFilterItems = oAdaptationFilterBar.getFilterItems();
				assert.ok(oAdaptationFilterBar.getModel("$custom"), "Custom model provided in AdaptationFilterBar");
				assert.equal(aFilterItems[0].getLabel(), "Some custom label", "Initially bound label used in dialog");

				done();

			});
		}.bind(this));
	});

	QUnit.test("Always destroy leftovers on exit", function(assert){
		var done = assert.async();

		this.oParent.getInbuiltFilter().setP13nData({
			items: [
				{
					name: "key1"
				},
				{
					name: "key2"
				}
			]
		});

		Promise.all([
			//1) Init Parent (Delegate + PropertyHelper)
			this.oParent.initPropertyHelper(),
			this.oParent.initControlDelegate()
		])
		.then(function(){

			this.oParent.getInbuiltFilter().createFilterFields().then(function(oAdaptationFilterBar){

				//Only one original from delegate as one is already present in the filteritems aggregation
				var oFKey2 = oAdaptationFilterBar._mOriginalsForClone["key2"];
				assert.equal(Object.keys(oAdaptationFilterBar._mOriginalsForClone).length, 1, "1 Original from delegate callback");

				oAdaptationFilterBar.destroy();

				assert.ok(oFKey2.bIsDestroyed, "FF1 has been destroyed");

				done();
			});
		}.bind(this));
	});

	QUnit.test("Destroy leftover fields (also dynamically added ones)", function(assert){
		var done = assert.async();

		this.oParent.getInbuiltFilter().setP13nData({
			items: [
				{
					name: "key1",
					visible: true,
					visibleInDialog: true
				},
				{
					name: "key2",
					visible: false,
					visibleInDialog: true
				}
			]
		});

		Promise.all([
			//1) Init Parent (Delegate + PropertyHelper)
			this.oParent.initPropertyHelper(),
			this.oParent.initControlDelegate()
		])
		.then(function(){

			this.oParent.getInbuiltFilter().createFilterFields().then(function(oAdaptationFilterBar){

				//Mock user interaction
				// 1) Add the filterfield to the p13n model (usually triggered by user interaction with the AdaptationFilterBar)
				// 2) Add the filterfield to the parent FilterBar --> check if the AdaptationFilterBar recognizes that the field has
				// been added during runtime
				var aP13nItems = oAdaptationFilterBar.getP13nData().items;
				aP13nItems[1].visible = true;
				oAdaptationFilterBar.setP13nData({items: aP13nItems});
				this.oParent.addFilterItem(new FilterField({
					fieldPath: "key2",
					conditions: "{$filters>/conditions/key2}"
				}));

				oAdaptationFilterBar.executeRemoves().then(function(){

					var oAddedField = oAdaptationFilterBar._mOriginalsForClone["key2"];

					assert.ok(oAddedField, "The AdaptationFilterBar noticed that the field has been added and did not trigger 'removeItem'");

					oAdaptationFilterBar.destroy();

					assert.ok(oAddedField.bIsDestroyed, "The field will be destroyed on cleaning up the AdaptationFilterBar");

					done();
				});

			}.bind(this));
		}.bind(this));
	});
});