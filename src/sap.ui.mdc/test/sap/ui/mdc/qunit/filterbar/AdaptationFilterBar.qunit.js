/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/filterbar/p13n/AdaptationFilterBar",
	"sap/m/p13n/FlexUtil",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/Control",
	"sap/ui/mdc/AggregationBaseDelegate",
	"sap/ui/mdc/odata/v4/TypeMap",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/String",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/FilterBar",
	"./UnitTestMetadataDelegate",
	"../QUnitUtils",
	"sap/m/p13n/Engine",
	"sap/ui/mdc/p13n/subcontroller/FilterController",
	"sap/ui/mdc/util/PropertyHelper",
	"sap/ui/mdc/enums/OperatorName"
], function (
	AdaptationFilterBar,
	FlexUtil,
	Table,
	Control,
	AggregationBaseDelegate,
	ODataV4TypeMap,
	JSONModel,
	StringType,
	DateTimeOffset,
	FilterField,
	FilterBar,
	FBTestDelegate,
	MDCQUnitUtils,
	Engine,
	FilterController,
	PropertyHelper,
	OperatorName
) {
	"use strict";

	let oAdaptationFilterBar;
	QUnit.module("AdaptationFilterBar - MDC Control specific tests", {
		beforeEach: function () {
			const aPropertyInfo = [
				{
					label: "Key 1",
					name: "key1",
					dataType: "sap.ui.model.type.String"
				},
				{
					label: "Key 2",
					name: "key2",
					dataType: "sap.ui.model.type.String"
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
		const done = assert.async();

		const mSampleConditions = {
			key1: [
				{
					operator: OperatorName.EQ,
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
		const done = assert.async();

		//AdaptationFilterBar should listen to parent "fetchProperties"
		this.oAdaptationFilterBar.setAdaptationControl(this.oTestTable);

		//Init parent
		this.oTestTable.initialized().then(function(){
			this.oTestTable.awaitPropertyHelper().then(function(oPropertyHelper){
				assert.deepEqual(this.oAdaptationFilterBar.getPropertyHelper(), oPropertyHelper, "PropertyHelper has been passed from the Parent");
				done();
			}.bind(this));
		}.bind(this));

	});

	QUnit.test("Check the delegation of PropertyHelper related functions", function(assert){

		return this.oAdaptationFilterBar.initialized().then(function() {
			assert.ok(this.oAdaptationFilterBar.getTypeMap());
			assert.equal(this.oAdaptationFilterBar.getTypeMap(), this.oTestTable.getTypeMap());

			assert.ok(this.oAdaptationFilterBar.getPropertyHelper());
			assert.equal(this.oAdaptationFilterBar.getPropertyHelper(), this.oTestTable.getPropertyHelper());

		}.bind(this));

	});

	QUnit.module("AdaptationFilterBar - MDC Control unspecific tests", {
		createIFilter: function(mSettings) {
			const IFilterControl = Control.extend("temp", {
				metadata: {
					interfaces: [
						"sap.ui.mdc.IFilter"
					]
				}
			});
			return new IFilterControl(mSettings);
		},
		createPropertyHelper: function() {
			const CustomHelper = PropertyHelper.extend("TestHelper");

			CustomHelper.prototype.prepareProperty = function(oProperty, mProperties) {
				PropertyHelper.prototype.prepareProperty.apply(this, arguments);
				const oParent = this.getParent();
				const oTypeUtil = oParent._oDelegate.getTypeMap(oParent);
				oProperty.typeConfig = oTypeUtil.getTypeConfig(oProperty.dataType, oProperty.formatOptions, oProperty.constraints);
			};

			return CustomHelper;
		},
		createIFilterSource: function(mSettings) {
			const IFilterControl = Control.extend("temp", {
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
			const fnParentFactory = bCreateIFilter ? this.createIFilter : this.createIFilterSource;

			this.oParent = fnParentFactory({
				delegate: {
					name: "sap/ui/mdc/AggregationBaseDelegate"
				}
			});

			const oController = new FilterController({
				control: this.oParent
			});

			oController.getCurrentState = function(){
				return this.oParent.getFilterConditions();
			}.bind(this);

			Engine.getInstance().register(this.oParent, {
				controller: {
					Filter: oController
				}
			});

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
					path: "key1",
					label: "Key 1",
					dataType: "sap.ui.model.type.String"
				},
				{
					name: "key2",
					path: "key2",
					label: "Key 2",
					dataType: "sap.ui.model.odata.type.DateTimeOffset"
				},
				{
					name: "key3",
					path: "key3",
					label: "Key 3",
					dataType: "sap.ui.model.type.String"
				}
			];

			//Mock Delegate funcitonality
			const oMockedPropertyInfoPromise = new Promise(function(resolve){
				resolve(this.aMockProperties);
			}.bind(this));

			//Mock fetch properties
			sinon.stub(AggregationBaseDelegate, "fetchProperties").returns(oMockedPropertyInfoPromise);

			//Mock 'getFilterDelegate'
			AggregationBaseDelegate.getFilterDelegate = function() {
				return {
					addItem: function(oControl, sProperty) {
						return Promise.resolve(new FilterField({conditions: "{$filters>/conditions/" + sProperty + '}'}));
					},
					apiVersion: 2
				};
			};
			AggregationBaseDelegate.apiVersion = 2;

			//Provide simple 'addItem' hook for testing on 'AggregationBaseDelegate'
			this.addItem = function(oControl, sKey){
				return Promise.resolve(new FilterField({
					conditions: "{$filters>/conditions/" + sKey + "}",
					propertyKey: sKey
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

	QUnit.test("Check 'ValueState' and 'ValueStateText' removal on cloning", function(assert){
		const done = assert.async();
		this.prepareTestSetup(true);

		this.oAddStub.callsFake(this.addItem);

		this.oParent.getFilterItems = function() {
			return [
				new FilterField({
					valueState: "Error",
					valueStateText: "Test Error",
					conditions: "{$filters>/conditions/key1}"
				})
			];
		};

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
			this.oParent.initPropertyHelper(this.createPropertyHelper()),
			this.oParent.initControlDelegate()
		])
		.then(function(){
			oAdaptationFilterBar.createFilterFields().then(function(){

				const oClonedField = oAdaptationFilterBar.getFilterItems()[0];

				assert.equal(oClonedField.getValueState(), "None", "ValueState is cleared during cloning");
				assert.equal(oClonedField.getValueStateText(), "", "ValueStateText is cleared during cloning");
				done();
			});
		});
	});

	QUnit.test("Created changes should always be externalized - Check String types", function(assert) {
		const done = assert.async();
		this.prepareTestSetup(true);

		Promise.all([
			//1) Init Parent (Delegate + PropertyHelper)
			this.oParent.initPropertyHelper(this.createPropertyHelper()),
			this.oParent.initControlDelegate()
		])
		.then(function(){
			//2) Init AdaptationFilterBar
			return oAdaptationFilterBar.initialized();
		})
		.then(function(){

			//3) Add a condition
			oAdaptationFilterBar.setLiveMode(false);

			oAdaptationFilterBar.setFilterConditions({"key1": [{
				operator: OperatorName.EQ,
				values: [
					"Externalized Test"
				]
			}]});

			return oAdaptationFilterBar._setXConditions(oAdaptationFilterBar.getFilterConditions());

		})
		.then(function(){

			//4) Assertions

			const aInnerConditions = oAdaptationFilterBar._getConditionModel().getAllConditions()["key1"];
			assert.ok(aInnerConditions[0].hasOwnProperty("isEmpty"));
			oAdaptationFilterBar.createConditionChanges().then(function(aChanges){
				// isEmpty is cleaned up for externalized changes only --> indicator whether the changes are created in externalized format
				assert.ok(!aChanges[0].changeSpecificData.content.condition.hasOwnProperty("isEmpty"));
				done();
			});

		});
	});

	QUnit.test("Created changes should always be externalized - Check Date types", function(assert) {
		const done = assert.async();
		this.prepareTestSetup(true);

		Promise.all([
			//1) Init Parent (Delegate + PropertyHelper)
			this.oParent.initPropertyHelper(this.createPropertyHelper()),
			this.oParent.initControlDelegate()
		])
		.then(function(){
			//2) Init AdaptationFilterBar
			return oAdaptationFilterBar.initialized();
		})
		.then(function(){

			//3) Add a condition
			oAdaptationFilterBar.setLiveMode(false);

			oAdaptationFilterBar.setFilterConditions({"key2": [{
				operator: OperatorName.EQ,
				values: [
					"Dec 31, 2020, 11:59:58 PM"
				]
			}]});

			return oAdaptationFilterBar._setXConditions(oAdaptationFilterBar.getFilterConditions());
		})
		.then(function(){

			//4) Assertions

			const aInnerConditions = oAdaptationFilterBar._getConditionModel().getAllConditions()["key2"];

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

		const done = assert.async();
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
			this.oParent.initPropertyHelper(this.createPropertyHelper()),
			this.oParent.initControlDelegate()
		]).then(function(){

			oAdaptationFilterBar.createFilterFields().then(function(){
				assert.ok(oAdaptationFilterBar.getFilterItems().length, 2, "FilterFields have been created");
				done();
			});

		});
	});

	QUnit.test("Create filter fields triggers 'active' update of model", function(assert) {

		const done = assert.async();
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

		const oUpdateSpy = sinon.spy(oAdaptationFilterBar, "_updateActiveStatus");

		Promise.all([
			//1) Init Parent (Delegate + PropertyHelper)
			this.oParent.initPropertyHelper(this.createPropertyHelper()),
			this.oParent.initControlDelegate()
		]).then(function(){

			assert.equal(oUpdateSpy.callCount, 0, "Update does not need to be triggered initially");

			oAdaptationFilterBar.createFilterFields().then(function(){
				assert.equal(oUpdateSpy.callCount, 1, "Update triggered once initially the fields are created");
				done();
			});
		});
	});

	QUnit.test("Create filter fields and check their order", function(assert) {

		const done = assert.async();
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
				addItem: function(oControl, sProperty) {
					if (sProperty == "key1") {

						//mock a delay in FF creation
						return new Promise(function(resolve){
							setTimeout(function(){
								resolve(new FilterField({
									label: "key1",
									conditions: "{$filters>/conditions/key1}"
								}));
							}, 500);
						});
					}
					return Promise.resolve(new FilterField({
						label: "key2",
						conditions: "{$filters>/conditions/key2}"
					}));
				},
				apiVersion: 2
			};
		};

		Promise.all([
			//1) Init Parent (Delegate + PropertyHelper)
			this.oParent.initPropertyHelper(this.createPropertyHelper()),
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

	QUnit.test("Test '_checkExisting' - check 'remove' hook executions", function(assert){
		const done = assert.async();
		this.prepareTestSetup(true);

		const oRemoveSpy = sinon.spy(AggregationBaseDelegate, "removeItem");

		this.oAddStub.callsFake(this.addItem);


		this.oParent.getFilterItems = function() {
			return [
				new FilterField({
					conditions: "{$filters>/conditions/key1}",
					propertyKey: "key1"
				})
			];
		};

		const oGroupPanel = oAdaptationFilterBar._oFilterBarLayout.getInner();
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
			this.oParent.initPropertyHelper(this.createPropertyHelper()),
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

	QUnit.test("Check 'FilterPanel' as inner layout and remove change event", function(assert){
		const done = assert.async();
		this.prepareTestSetup(false);

		const oFilterPanel = oAdaptationFilterBar._oFilterBarLayout.getInner();

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
			this.oParent.initPropertyHelper(this.createPropertyHelper()),
			this.oParent.initControlDelegate()
		])
		.then(function(){
			oAdaptationFilterBar.createFilterFields().then(function(){

				const oConditionChangeSpy = sinon.spy(oAdaptationFilterBar.getEngine(), "createChanges");

				oFilterPanel.fireChange({
					item: {
						name: "key1"
					},
					reason: "Remove"
				});

				assert.ok(oConditionChangeSpy.calledOnce, "Conditions are removed once");

				done();
			});
		});
	});

	QUnit.test("Test '_checkFunctionality' - check 'remove' hook executions, but change the selection before", function(assert){
		const done = assert.async(1);
		this.prepareTestSetup(true);

		const oRemoveSpy = sinon.spy(AggregationBaseDelegate, "removeItem");
		this.oAddStub.callsFake(this.addItem);

		this.oParent.getFilterItems = function() {
			return [
				new FilterField({
					conditions: "{$filters>/conditions/key1}"
				})
			];
		};

		const oGroupPanel = oAdaptationFilterBar._oFilterBarLayout.getInner();

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
			this.oParent.initPropertyHelper(this.createPropertyHelper()),
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

		const done = assert.async();
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
			this.oParent.initPropertyHelper(this.createPropertyHelper()),
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

		const done = assert.async();
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
			this.oParent.initPropertyHelper(this.createPropertyHelper()),
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
			const oMyModel = new JSONModel({
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
				propertyInfo: [{name: "key1", label: "Key 1", dataType: "sap.ui.model.type.String"}],
				filterItems: {
					path: "$custom>/data",
					template: new FilterField({
						conditions: "{$filters>/conditions/key1}",
						propertyKey: "key1",
						label: "{$custom>label}"
					})
				}
			});

			return this.oParent.initialized().then(function() {
				this.oParent.setModel(oMyModel, "$custom");

				sinon.stub(FBTestDelegate, "addItem").callsFake(function(oControl, sKey){
					return Promise.resolve(new FilterField({
						conditions: "{$filters>/conditions/" + sKey + "}",
						propertyKey: sKey
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
		const done = assert.async();

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

				const aFilterItems = oAdaptationFilterBar.getFilterItems();
				assert.ok(oAdaptationFilterBar.getModel("$custom"), "Custom model provided in AdaptationFilterBar");
				assert.equal(aFilterItems[0].getLabel(), "Some custom label", "Initially bound label used in dialog");

				done();

			});
		}.bind(this));
	});

	QUnit.test("Always destroy leftovers on exit", function(assert){
		const done = assert.async();

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
				const oFKey2 = oAdaptationFilterBar._mOriginalsForClone["key2"];
				assert.equal(Object.keys(oAdaptationFilterBar._mOriginalsForClone).length, 1, "1 Original from delegate callback");

				oAdaptationFilterBar.destroy();

				assert.ok(oFKey2.bIsDestroyed, "FF1 has been destroyed");

				done();
			});
		}.bind(this));
	});

	QUnit.test("Destroy leftover fields (also dynamically added ones)", function(assert){
		const done = assert.async();

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
				const aP13nItems = oAdaptationFilterBar.getP13nData().items;
				aP13nItems[1].visible = true;
				oAdaptationFilterBar.setP13nData({items: aP13nItems});
				this.oParent.addFilterItem(new FilterField({
					propertyKey: "key2",
					conditions: "{$filters>/conditions/key2}"
				}));

				oAdaptationFilterBar.executeRemoves().then(function(){

					const oAddedField = oAdaptationFilterBar._mOriginalsForClone["key2"];

					assert.ok(oAddedField, "The AdaptationFilterBar noticed that the field has been added and did not trigger 'removeItem'");

					oAdaptationFilterBar.destroy();

					assert.ok(oAddedField.bIsDestroyed, "The field will be destroyed on cleaning up the AdaptationFilterBar");

					done();
				});

			}.bind(this));
		}.bind(this));
	});
});