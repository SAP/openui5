/* global QUnit, sinon*/

/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/base/i18n/Localization",
	'sap/ui/qunit/QUnitUtils',
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/mdc/FilterBar",
	"sap/ui/mdc/filterbar/FilterBarBase",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/FilterField",
	'sap/ui/model/json/JSONModel',
	"sap/m/p13n/FlexUtil",
	"sap/ui/mdc/odata/TypeMap",
	'sap/ui/model/odata/type/String',
	"sap/ui/mdc/util/FilterUtil",
	'sap/base/util/merge',
	"sap/ui/core/library",
	"sap/ui/qunit/utils/nextUIUpdate",
	"test-resources/sap/m/qunit/p13n/TestModificationHandler",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName"
], function(
	Localization,
	QUnitUtils,
	createAndAppendDiv,
	FilterBar,
	FilterBarBase,
	Condition,
	FilterField,
	JSONModel,
	FlexUtil,
	ODataTypeMap,
	StringType,
	FilterUtil,
	merge,
	CoreLibrary,
	nextUIUpdate,
	TestModificationHandler,
	ConditionValidated,
	OperatorName
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("qunit-fixture-visible");

	let oFilterBar;
	const HasPopup = CoreLibrary.aria.HasPopup;
	const ValueState = CoreLibrary.ValueState;

	QUnit.module("FilterBar", {
		beforeEach: function() {
			oFilterBar = new FilterBar({
				delegate: { name: "test-resources/sap/ui/mdc/qunit/filterbar/UnitTestMetadataDelegate", payload: { modelName: undefined, collectionName: "test" } }
			});

			if (FlexUtil.handleChanges.restore) {
				FlexUtil.handleChanges.restore();
			}
		},
		afterEach: function() {
			oFilterBar.destroy();
			oFilterBar = undefined;
		}
	});

	QUnit.test("instanciable", function(assert) {
		assert.ok(oFilterBar);
	});

	QUnit.test("inner layout exists on initialization", function(assert) {
		const done = assert.async();
		assert.ok(oFilterBar);

		oFilterBar.initialized().then(function() {
			assert.ok(!!oFilterBar.getAggregation("layout"));
			done();
		});
	});

	QUnit.test("getConditionModelName ", function(assert) {
		assert.equal(oFilterBar.getConditionModelName(), FilterBarBase.CONDITION_MODEL_NAME);
	});

	QUnit.test("get GO button", function(assert) {
		const oButton = oFilterBar._btnSearch;
		assert.ok(oButton);
		assert.ok(oButton.getVisible());

		oFilterBar.setShowGoButton(false);
		assert.ok(!oButton.getVisible());

		oFilterBar.setShowGoButton(true);
		assert.ok(oButton.getVisible());

		oFilterBar.setLiveMode(true);

		if (oFilterBar._isPhone()) {
			assert.ok(oButton.getVisible());
		} else {
			assert.ok(!oButton.getVisible());
		}
	});

	QUnit.test("get ADAPT button", function(assert) {
		const oButton = oFilterBar._btnAdapt;
		assert.ok(oButton);
		assert.ok(!oButton.getVisible());
		assert.equal(oButton.getAriaHasPopup(), HasPopup.Dialog, "button has correct ariaHasPopup value");

		oFilterBar.setP13nMode(["Value"]);
		assert.ok(!oButton.getVisible());

		oFilterBar.setP13nMode(["Item"]);
		assert.ok(oButton.getVisible());

		oFilterBar.setP13nMode(["Item", "Value"]);
		assert.ok(oButton.getVisible());

		oFilterBar.setShowAdaptFiltersButton(false);
		assert.ok(!oButton.getVisible());
	});


	QUnit.test("check liveMode property", function(assert) {
		const oButton = oFilterBar._btnSearch;
		assert.ok(oButton);

		assert.ok(!oFilterBar.getLiveMode());
		assert.ok(oButton.getVisible());

		oFilterBar.setLiveMode(true);
		assert.ok(oFilterBar.getLiveMode());
		if (oFilterBar._isPhone()) {
			assert.ok(oButton.getVisible());
		} else {
			assert.ok(!oButton.getVisible());
		}
	});


	QUnit.test("check Clear button visibility", function(assert) {
		const oButton = oFilterBar._btnClear;
		assert.ok(oButton);
		assert.ok(!oButton.getVisible(), "Clear by default not visible");

		oFilterBar.setShowClearButton(true);
		assert.ok(oButton.getVisible(), "Clear is now visible");
	});

	QUnit.test("check Clear delegate call", async function(assert) {
		const done = assert.async();
		sinon.spy(oFilterBar, "onClear");

		oFilterBar.initControlDelegate().then(function(oDelegate) {
			sinon.stub(oDelegate, "clearFilters").callsFake(function() {
				assert.ok(oFilterBar.onClear.called, "onClear called");
				assert.ok(true, "'clearFilters' on delegate called");
				done();
				return Promise.resolve();
			});
		});

		oFilterBar.placeAt("qunit-fixture-visible");

		oFilterBar.setShowClearButton(true);
		await nextUIUpdate();

		const oButton = oFilterBar._btnClear;
		assert.ok(oButton, "clear button available");
		const oTarget = oButton.getFocusDomRef();
		assert.ok(oTarget, "clear button dom-ref available");
		QUnitUtils.triggerTouchEvent("tap", oTarget, {
			srcControl: null
		});
	});

	QUnit.test("check p13nMode property", function(assert) {

		assert.ok(!oFilterBar.getP13nMode());
		assert.ok(!oFilterBar._getP13nModeItem());

		oFilterBar.setP13nMode(["Item", "Value"]);
		assert.ok(oFilterBar.getP13nMode());
		assert.ok(oFilterBar._getP13nModeItem());

		oFilterBar.setP13nMode(["Item"]);
		assert.ok(oFilterBar._getP13nModeItem());
	});

	QUnit.test("add Filter", function(assert) {
		const oFilterField = new FilterField({ conditions: "{cm>/conditions/filter}" });

		assert.equal(oFilterBar.getFilterItems().length, 0);
		assert.equal(oFilterBar.getAggregation("layout").getFilterFields().length, 0);

		oFilterBar.addFilterItem(oFilterField);
		assert.equal(oFilterBar.getFilterItems().length, 1);
		assert.equal(oFilterBar.getAggregation("layout").getFilterFields().length, 1);

		oFilterField.destroy();
	});

	QUnit.test("remove Filter", function(assert) {
		const oFilterField = new FilterField();
		oFilterBar.addFilterItem(oFilterField);

		assert.equal(oFilterBar.getFilterItems().length, 1);
		assert.equal(oFilterBar.getAggregation("layout").getFilterFields().length, 1);

		oFilterBar.removeFilterItem(oFilterField);

		assert.equal(oFilterBar.getFilterItems().length, 0);
		assert.equal(oFilterBar.getAggregation("layout").getFilterFields().length, 0);

		oFilterField.destroy();
	});

	QUnit.test("check condition model", function(assert) {
		sinon.stub(oFilterBar, "awaitPropertyHelper").returns(Promise.resolve());
		sinon.spy(oFilterBar, "_applyInitialFilterConditions");

		const oModel = oFilterBar.getModel("$filters");
		assert.ok(oModel);
		assert.ok(oModel.isA("sap.ui.mdc.condition.ConditionModel"));

		return oFilterBar.initialized().then(function() {
			assert.ok(oFilterBar._applyInitialFilterConditions.called);
		});
	});

	QUnit.test("check condition model with prefilled conditions", function(assert) {

		const oFB = new FilterBar({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/filterbar/UnitTestMetadataDelegate"
			},
			filterConditions: {
				"key1": [{
					operator: OperatorName.EQ,
					values: ["test"]
				}]
			}
		});

		sinon.stub(oFB, "_getPropertyByName").returns({ name: "fieldPath1", typeConfig: ODataTypeMap.getTypeConfig("sap.ui.model.type.String") });
		sinon.spy(oFB, "_applyInitialFilterConditions");
		sinon.stub(oFB, "awaitPropertyHelper").returns(Promise.resolve());

		return oFB.initialized().then(function() {

			const oModel = oFilterBar.getModel("$filters");
			assert.ok(oModel);
			assert.ok(oModel.isA("sap.ui.mdc.condition.ConditionModel"));

			assert.ok(oFB._applyInitialFilterConditions.called);
			oFB._getPropertyByName.restore();
			oFB.destroy();
		});
	});

	QUnit.test("check api setFocusOnFirstErroneousField", function(assert) {
		const oFilterField0 = new FilterField({ conditions: "{cm>/conditions/filter0}" });
		const oFilterField1 = new FilterField({ conditions: "{cm>/conditions/filter1}" });
		const oFilterField2 = new FilterField({ conditions: "{cm>/conditions/filter2}" });

		oFilterBar.addFilterItem(oFilterField0);
		oFilterBar.addFilterItem(oFilterField1);
		oFilterBar.addFilterItem(oFilterField2);

		let oFilterField = oFilterBar.setFocusOnFirstErroneousField();
		assert.ok(!oFilterField);

		oFilterField1.setValueState(ValueState.Error);
		oFilterField = oFilterBar.setFocusOnFirstErroneousField();
		assert.ok(oFilterField === oFilterField1);

		oFilterField0.setValueState(ValueState.Error);
		oFilterField = oFilterBar.setFocusOnFirstErroneousField();
		assert.ok(oFilterField === oFilterField0);

		oFilterField0.setValueState(ValueState.None);
		oFilterField1.setValueState(ValueState.None);
		oFilterField = oFilterBar.setFocusOnFirstErroneousField();
		assert.ok(!oFilterField);

		oFilterBar.destroyFilterItems();
	});

	QUnit.module("FilterBar adaptation", {
		beforeEach: function() {
			return this.createTestObjects();
		},
		afterEach: function() {
			this.destroyTestObjects();
		},
		createTestObjects: function(aPropertyInfo) {
			if (!aPropertyInfo) {
				aPropertyInfo = [];
			}

			oFilterBar = new FilterBar({
				delegate: { name: "test-resources/sap/ui/mdc/qunit/filterbar/UnitTestMetadataDelegate", payload: { modelName: undefined, collectionName: "test" } }
			});

			if (FlexUtil.handleChanges.restore) {
				FlexUtil.handleChanges.restore();
			}
		},
		destroyTestObjects: function() {
			oFilterBar.destroy();
		}
	});


	QUnit.test("check _handleConditionModelPropertyChange", function(assert) {
		const oCM = oFilterBar.getModel("$filters");

		let fResolve;
		const oPromise = new Promise(function(resolve) {
			fResolve = resolve;
		});

		oCM.detachPropertyChange(oFilterBar._handleConditionModelPropertyChange, oFilterBar);
		sinon.spy(oFilterBar, "_handleConditionModelPropertyChange");
		oCM.attachPropertyChange(oFilterBar._handleConditionModelPropertyChange, oFilterBar);

		sinon.stub(oFilterBar, "_stringifyConditions").returns([Condition.createCondition(OperatorName.EQ, ["foo"])]);
		sinon.stub(oFilterBar, "_addConditionChange").callsFake(function() {
			fResolve();
		});


		oCM.addCondition("fieldPath1", Condition.createCondition(OperatorName.EQ, ["foo"]));

		return oPromise.then(function() {
			assert.ok(oFilterBar._handleConditionModelPropertyChange.called);
		});
	});

	QUnit.test("check getAssignedFiltersText", function(assert) {

		const sLanguage = Localization.getLanguage();
		Localization.setLanguage("EN");

		const oProperty = {
			name: "fieldPath1",
			label: "Field Path",
			dataType: "sap.ui.model.type.String",
			visible: true
		};
		const oProperty2 = {
			name: "fieldPath2",
			label: "Field Path2",
			dataType: "sap.ui.model.type.String",
			visible: true
		};
		const oProperty3 = {
			name: "$search",
			label: "",
			dataType: "sap.ui.model.type.String",
			visible: true
		};
		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty, oProperty2, oProperty3]);
		sinon.stub(oFilterBar, "_getPropertyByName").callsFake(function(sName) {
			return FilterUtil.getPropertyByKey(oFilterBar.getPropertyInfoSet(), sName);
		});
		sinon.stub(oFilterBar, "_addConditionChange");

		const done = assert.async();

		let mText = oFilterBar.getAssignedFiltersText();
		assert.equal(mText.filtersText, "No filters active");
		assert.equal(mText.filtersTextExpanded, "No filters active");


		oFilterBar.initializedWithMetadata().then(function() {

			sinon.stub(oFilterBar, "_stringifyConditions").returns([Condition.createCondition(OperatorName.EQ, ["foo"])]);


			const oCM = oFilterBar._getConditionModel();
			oCM.addCondition("fieldPath1", Condition.createCondition(OperatorName.EQ, ["foo"]));

			oFilterBar.setBasicSearchField(new FilterField({
				conditions: "{$filters>/conditions/$search}",
				maxConditions: 1,
				delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
			}));


			//with one filter not displayed on filterbar
			mText = oFilterBar.getAssignedFiltersText();
			assert.equal(mText.filtersText, "1 filter active: Field Path");
			assert.equal(mText.filtersTextExpanded, "1 filter active (1 hidden)");

			assert.ok(oFilterBar.getControlDelegate());
			sinon.stub(oFilterBar.getControlDelegate(), "fetchProperties").returns(Promise.resolve([oProperty, oProperty2, oProperty3]));

			const oPromise = oFilterBar.getControlDelegate().addItem(oFilterBar, oProperty2.name);

			oPromise.then(function(oFilterField) {

				oFilterBar.addFilterItem(oFilterField);

				// with two filters; one is displayed on filter bar, one not
				oCM.addCondition("fieldPath2", Condition.createCondition(OperatorName.EQ, ["foo"]));
				mText = oFilterBar.getAssignedFiltersText();
				assert.equal(mText.filtersText, "2 filters active: Field Path, Field Path2");
				assert.equal(mText.filtersTextExpanded, "2 filters active (1 hidden)");

				//with basic search and two filter displayed on the filter bar
				oCM.addCondition("$search", Condition.createCondition(OperatorName.EQ, ["foo"]));
				mText = oFilterBar.getAssignedFiltersText();
				assert.equal(mText.filtersText, "3 filters active: Search Terms, Field Path, Field Path2");
				assert.equal(mText.filtersTextExpanded, "3 filters active (1 hidden)");


				//with basic search and one filter displayed on the filter bar
				oCM.removeAllConditions("fieldPath1");
				mText = oFilterBar.getAssignedFiltersText();
				assert.equal(mText.filtersText, "2 filters active: Search Terms, Field Path2");
				assert.equal(mText.filtersTextExpanded, "2 filters active");


				//only with basic search
				oCM.removeAllConditions("fieldPath2");
				mText = oFilterBar.getAssignedFiltersText();
				assert.equal(mText.filtersText, "1 filter active: Search Terms");
				assert.equal(mText.filtersTextExpanded, "1 filter active");

				//only with basic search
				oCM.removeAllConditions("$search");
				mText = oFilterBar.getAssignedFiltersText();
				assert.equal(mText.filtersText, "No filters active");
				assert.equal(mText.filtersTextExpanded, "No filters active");


				oFilterBar.getControlDelegate().fetchProperties.restore();

				Localization.setLanguage(sLanguage);
				done();
			});
		});
	});
	QUnit.test("check fetchProperties", function(assert) {
		const done = assert.async();

		oFilterBar._waitForMetadata().then(function() {
			assert.ok(oFilterBar.getControlDelegate());
			sinon.stub(oFilterBar.getControlDelegate(), "fetchProperties").returns(Promise.resolve([{}, {}]));


			oFilterBar.getControlDelegate().fetchProperties(oFilterBar).then(function(aProperties) {
				assert.ok(aProperties);
				assert.equal(aProperties.length, 2);

				oFilterBar.getControlDelegate().fetchProperties.restore();
				done();
			});
		});
	});

	QUnit.test("check delegate", function(assert) {
		const done = assert.async();

		oFilterBar._waitForMetadata().then(function() {
			assert.ok(oFilterBar.getDelegate());
			assert.equal(oFilterBar.getDelegate().name, "test-resources/sap/ui/mdc/qunit/filterbar/UnitTestMetadataDelegate");
			done();
		});
	});

	QUnit.test("check _getNonHiddenPropertyByName ", function(assert) {
		const oProperty1 = {
			name: "key1",
			label: "Key1",
			dataType: "Edm.String",
			visible: true
		};

		const oProperty2 = {
			name: "key2",
			label: "Key2",
			hiddenFilter: true,
			visible: true
		};

		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty1, oProperty2]);

		assert.ok(oFilterBar._getNonHiddenPropertyByName("key1"));
		assert.ok(!oFilterBar._getNonHiddenPropertyByName("key2"));

	});

	QUnit.test("check setBasicSearchField", function(assert) {

		const oBasicSearchField = new FilterField({ conditions: "{cm>/conditions/$search}" });
		oFilterBar.setBasicSearchField(oBasicSearchField);
		assert.equal(oFilterBar.getFilterItems().length, 0);
		assert.equal(oFilterBar.getAggregation("layout").getFilterFields().length, 1);

		oFilterBar.setBasicSearchField(null);
		assert.equal(oFilterBar.getFilterItems().length, 0);
		assert.equal(oFilterBar.getAggregation("layout").getFilterFields().length, 0);

		oBasicSearchField.destroy();
	});

	QUnit.test("check _getFilterItemLayout", function(assert) {
		const oFilterField = new FilterField();
		oFilterBar.addFilterItem(oFilterField);

		const oFilterItemLayout = oFilterBar._getFilterItemLayout(oFilterField);
		assert.ok(oFilterItemLayout);

		oFilterField.destroy();
	});


	QUnit.test("create single valued change", function(assert) {
		const done = assert.async();
		this.destroyTestObjects();

		const aPropertyInfo = [{
			name: "key",
			typeConfig: ODataTypeMap.getTypeConfig("sap.ui.model.type.String"),
			visible: true
		}];

		this.createTestObjects(aPropertyInfo);

		let aResultingChanges = [];

		const fnStoreChanges = function(aChanges) {
			aResultingChanges = aResultingChanges.concat(aChanges);
		};

		sinon.stub(FlexUtil, "handleChanges").callsFake(fnStoreChanges);

		oFilterBar.setP13nMode(["Value"]);

		oFilterBar._waitForMetadata().then(function() {
			sinon.stub(oFilterBar.getPropertyHelper(), "getProperties").returns(aPropertyInfo);
			assert.ok(oFilterBar.getControlDelegate());
			const oPromise = oFilterBar.getControlDelegate().addItem(oFilterBar, "key");

			oPromise.then(function(oFilterField) {

				let iCount = 0;

				const oTestHandler = TestModificationHandler.getInstance();

				oTestHandler.processChanges = function(aChanges) {
					iCount++;
					FlexUtil.handleChanges(aChanges);

					if (iCount == 1) {
						oFilterBar._getConditionModel().addCondition("key", Condition.createCondition(OperatorName.EQ, ["foo"]));
					}

					if (iCount == 2) {
						assert.equal(aResultingChanges.length, 3, "correct amount of changes created");
						assert.ok(FlexUtil.handleChanges.calledTwice);
						done();
					}

					return Promise.resolve(aChanges);
				};

				oFilterBar.getEngine()._setModificationHandler(oFilterBar, oTestHandler);

				oFilterBar._getConditionModel().addCondition("key", Condition.createCondition(OperatorName.EQ, ["a"]));
			});

		});
	});

	QUnit.test("create single valued change with inParameters", function(assert) {
		const done = assert.async();

		const aPropertyInfo = [{
			name: "key",
			maxConditions: 1,
			visible: true,
			typeConfig: ODataTypeMap.getTypeConfig("Edm.String")
		}, {
			name: "in",
			visible: true,
			typeConfig: ODataTypeMap.getTypeConfig("Edm.String")
		}];

		this.destroyTestObjects();
		this.createTestObjects(aPropertyInfo);

		sinon.stub(oFilterBar, "_getPropertyByName").callsFake(function(sName) {
			return FilterUtil.getPropertyByKey(aPropertyInfo, sName);
		});

		oFilterBar.setP13nMode(["Value"]);

		oFilterBar._retrieveMetadata().then(function() {
			sinon.stub(oFilterBar.getPropertyHelper(), "getProperties").returns(aPropertyInfo);
			assert.ok(oFilterBar.getControlDelegate());
			const oPromise = oFilterBar.getControlDelegate().addItem(oFilterBar, "key");

			oPromise.then(function(oFilterField) {

				const oTestHandler = TestModificationHandler.getInstance();

				oTestHandler.processChanges = function(aChanges) {
					assert.ok(aChanges);
					assert.equal(aChanges.length, 1); // condition model does not know about filterExpression="Single"...

					assert.equal(aChanges[0].changeSpecificData.changeType, "addCondition");
					assert.ok(aChanges[0].changeSpecificData.content.condition.inParameters);
					assert.ok(aChanges[0].changeSpecificData.content.condition.inParameters["conditions/in"]);
					assert.equal(aChanges[0].changeSpecificData.content.condition.inParameters["conditions/in"], "INTEST");
					done();
					return Promise.resolve(aChanges);
				};

				oFilterBar.getEngine()._setModificationHandler(oFilterBar, oTestHandler);

				oFilterBar._getConditionModel().addCondition("key", Condition.createCondition(OperatorName.EQ, ["a"], { "conditions/in": "INTEST" }));

			});
		});
	});

	QUnit.test("create multi valued change", function(assert) {

		const aPropertyInfo = [{
			name: "key",
			maxConditions: -1,
			visible: true,
			typeConfig: ODataTypeMap.getTypeConfig("Edm.String")
		}];

		this.destroyTestObjects();
		this.createTestObjects(aPropertyInfo);

		let aResultingChanges = [];
		const fnStoreChanges = function(aChanges) {
			aResultingChanges = aChanges;
		};

		sinon.stub(FlexUtil, "handleChanges").callsFake(fnStoreChanges);
		sinon.stub(oFilterBar, "_getPropertyByName").callsFake(function(sName) {
			return FilterUtil.getPropertyByKey(aPropertyInfo, sName);
		});

		const done = assert.async();

		sinon.stub(oFilterBar, "getPropertyInfoSet").returns(aPropertyInfo);

		oFilterBar.setP13nMode(["Value"]);

		oFilterBar._retrieveMetadata().then(function() {
			sinon.stub(oFilterBar.getPropertyHelper(), "getProperties").returns(aPropertyInfo);

			assert.ok(oFilterBar.getControlDelegate());

			const oPromise = oFilterBar.getControlDelegate().addItem(oFilterBar, "key");

			oPromise.then(function(oFilterField) {

				let iCount = 0;

				const oTestHandler = TestModificationHandler.getInstance();

				oTestHandler.processChanges = function(aChanges) {
					iCount++;
					FlexUtil.handleChanges(aChanges);
					if (iCount === 2) {
						assert.equal(aResultingChanges.length, 2, "correct amount of changes created");

						assert.equal(aChanges[0].changeSpecificData.changeType, "addCondition");
						assert.equal(aChanges[1].changeSpecificData.changeType, "addCondition");


						assert.ok(FlexUtil.handleChanges.calledTwice);
						done();
					}
					return Promise.resolve(aChanges);
				};

				oFilterBar.getEngine()._setModificationHandler(oFilterBar, oTestHandler);

				oFilterBar._getConditionModel().addCondition("key", Condition.createCondition(OperatorName.EQ, ["a"]));
				oFilterBar._getConditionModel().addCondition("key", Condition.createCondition(OperatorName.EQ, ["foo"]));
			});
		});
	});

	QUnit.test("create multi valued change with 'filterConditions'", function(assert) {
		const done = assert.async();

		const aPropertyInfo = [{
			name: "key",
			maxConditions: -11,
			visible: true,
			typeConfig: ODataTypeMap.getTypeConfig("Edm.String")
		}];

		this.destroyTestObjects();
		this.createTestObjects(aPropertyInfo);

		oFilterBar.setFilterConditions({ key: [{ operator: OperatorName.EQ, values: ["a"] }] });
		oFilterBar.setP13nMode(["Value"]);

		let aResultingChanges = [];
		const fnStoreChanges = function(aChanges) {
			aResultingChanges = aChanges;
		};

		const oCondition1 = Condition.createCondition(OperatorName.EQ, ["a"]);
		const oCondition2 = Condition.createCondition(OperatorName.EQ, ["foo"]);

		sinon.stub(oFilterBar, "_getPropertyByName").callsFake(function(sName) {
			return FilterUtil.getPropertyByKey(aPropertyInfo, sName);
		});
		sinon.stub(FlexUtil, 'handleChanges').callsFake(fnStoreChanges);

		oFilterBar._waitForMetadata().then(function() {
			sinon.stub(oFilterBar.getPropertyHelper(), "getProperties").returns(aPropertyInfo);
			oFilterBar._oInitialFiltersAppliedPromise.then(function() {

				const oTestHandler = TestModificationHandler.getInstance();

				oTestHandler.processChanges = function(aChanges) {

					FlexUtil.handleChanges(aChanges);

					assert.equal(aResultingChanges.length, 1);

					assert.equal(aResultingChanges[0].selectorElement, oFilterBar);
					assert.equal(aResultingChanges[0].changeSpecificData.changeType, "addCondition");
					assert.equal(aResultingChanges[0].changeSpecificData.content.name, "key");
					assert.deepEqual(aResultingChanges[0].changeSpecificData.content.condition, { operator: OperatorName.EQ, values: ["foo"], validated: undefined });
					done();
					return Promise.resolve(aChanges);
				};

				oFilterBar.getEngine()._setModificationHandler(oFilterBar, oTestHandler);

				oFilterBar._getConditionModel().addCondition("key", oCondition1);
				oFilterBar._getConditionModel().addCondition("key", oCondition2);
			});
		});
	});

	QUnit.test("create multi valued change with inParameters", function(assert) {

		const aPropertyInfo = [{
			name: "key",
			maxConditions: -1,
			visible: true,
			typeConfig: ODataTypeMap.getTypeConfig("Edm.String")
		}, {
			name: "in1",
			visible: true,
			typeConfig: ODataTypeMap.getTypeConfig("Edm.String")
		}, {
			name: "in2",
			visible: true,
			typeConfig: ODataTypeMap.getTypeConfig("Edm.String")
		}];

		this.destroyTestObjects();
		this.createTestObjects(aPropertyInfo);

		let aResultingChanges = [];
		const fnStoreChanges = function(aChanges) {
			aResultingChanges = aResultingChanges.concat(aChanges);
		};

		const done = assert.async();

		sinon.stub(FlexUtil, 'handleChanges').callsFake(fnStoreChanges);
		sinon.stub(oFilterBar, "_getPropertyByName").callsFake(function(sName) {
			return FilterUtil.getPropertyByKey(aPropertyInfo, sName);
		});

		oFilterBar.setP13nMode(["Value"]);

		oFilterBar._waitForMetadata().then(function() {
			sinon.stub(oFilterBar.getPropertyHelper(), "getProperties").returns(aPropertyInfo);
			assert.ok(oFilterBar.getControlDelegate());
			const oPromise = oFilterBar.getControlDelegate().addItem(oFilterBar, "key");

			oPromise.then(function(oFilterField) {
				oFilterBar.getEngine().createChanges({
					control: oFilterBar,
					suppressAppliance: true,
					key: "Filter",
					state: { "key": [Condition.createCondition(OperatorName.EQ, ["foo"], { "in1": "IN1_TEST", "in2": "IN2_TEST" })] }
				}).then(function(aChanges) {

					assert.equal(aChanges.length, 1);

					assert.ok(aChanges[0].changeSpecificData.content.condition.inParameters);
					assert.equal(Object.keys(aChanges[0].changeSpecificData.content.condition.inParameters).length, 2);
					assert.ok(aChanges[0].changeSpecificData.content.condition.inParameters["in1"]);
					assert.equal(aChanges[0].changeSpecificData.content.condition.inParameters["in1"], "IN1_TEST");
					assert.ok(aChanges[0].changeSpecificData.content.condition.inParameters["in2"]);
					assert.equal(aChanges[0].changeSpecificData.content.condition.inParameters["in2"], "IN2_TEST");

					const oTestHandler = TestModificationHandler.getInstance();

					oTestHandler.processChanges = function(aCallbackChanges) {

						assert.equal(aChanges.length, 1);
						assert.equal(aCallbackChanges.length, 1);

						assert.equal(aCallbackChanges[0].changeSpecificData.changeType, "addCondition");
						assert.ok(!aCallbackChanges[0].changeSpecificData.content.condition.inParameters);
						done();
						return Promise.resolve(aChanges);
					};

					oFilterBar.getEngine()._setModificationHandler(oFilterBar, oTestHandler);

					oFilterBar._getConditionModel().addCondition("key", Condition.createCondition(OperatorName.EQ, ["a"]));
				});
			});
		});
	});


	QUnit.test("check filterItems observer", function(assert) {

		const oProperty1 = {
			name: "key1",
			label: "label 1",
			dataType: "Edm.String",
			constraints: { maxLength: 40 },
			visible: true
		};
		const oProperty2 = {
			name: "key2",
			label: "label 2",
			dataType: "Edm.String",
			constraints: { maxLength: 40 },
			visible: true
		};

		const aPromise = [];

		const done = assert.async();

		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty1, oProperty2]);
		sinon.spy(oFilterBar, "_applyFilterItemInserted");
		sinon.spy(oFilterBar, "_applyFilterItemRemoved");
		sinon.spy(oFilterBar, "_setFocusOnFilterField");


		oFilterBar._waitForMetadata().then(function() {
			assert.ok(oFilterBar.getControlDelegate());
			sinon.stub(oFilterBar.getControlDelegate(), "fetchProperties").returns(Promise.resolve([oProperty1, oProperty2]));

			aPromise.push(oFilterBar.getControlDelegate().addItem(oFilterBar, oProperty1.name));
			aPromise.push(oFilterBar.getControlDelegate().addItem(oFilterBar, oProperty2.name));

			Promise.all(aPromise).then(function(aFilterFields) {

				oFilterBar.addFilterItem(aFilterFields[0]);
				oFilterBar.addFilterItem(aFilterFields[1]);

				assert.ok(!oFilterBar._aAddedFilterFields);

				oFilterBar._determineFilterFieldOnFocus();
				assert.ok(!oFilterBar._setFocusOnFilterField.called);

				oFilterBar.removeAggregation("filterItems", aFilterFields[0]);

				assert.ok(oFilterBar._applyFilterItemInserted.calledTwice);
				assert.ok(oFilterBar._applyFilterItemRemoved.calledOnce);

				oFilterBar.getControlDelegate().fetchProperties.restore();

				done();
			});
		});
	});

	QUnit.test("check filterItems observer with simulated adapation filterbar", function(assert) {

		const oProperty1 = {
			name: "key1",
			label: "label 1",
			dataType: "Edm.String",
			constraints: { maxLength: 40 },
			visible: true
		};
		const oProperty2 = {
			name: "key2",
			label: "label 2",
			dataType: "Edm.String",
			constraints: { maxLength: 40 },
			visible: true
		};

		const aPromise = [];

		const done = assert.async();

		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty1, oProperty2]);
		sinon.spy(oFilterBar, "_applyFilterItemInserted");
		sinon.spy(oFilterBar, "_applyFilterItemRemoved");
		sinon.spy(oFilterBar, "_setFocusOnFilterField");


		oFilterBar._waitForMetadata().then(function() {
			assert.ok(oFilterBar.getControlDelegate());
			sinon.stub(oFilterBar.getControlDelegate(), "fetchProperties").returns(Promise.resolve([oProperty1, oProperty2]));

			oFilterBar._aAddedFilterFields = [];
			oFilterBar._aRemovedFilterFields = [];

			aPromise.push(oFilterBar.getControlDelegate().addItem(oFilterBar, oProperty1.name));
			aPromise.push(oFilterBar.getControlDelegate().addItem(oFilterBar, oProperty2.name));

			Promise.all(aPromise).then(function(aFilterFields) {

				oFilterBar.addFilterItem(aFilterFields[0]);
				oFilterBar.addFilterItem(aFilterFields[1]);

				assert.ok(oFilterBar._aAddedFilterFields);
				assert.equal(oFilterBar._aAddedFilterFields.length, 2);

				oFilterBar._determineFilterFieldOnFocus();
				assert.ok(oFilterBar._setFocusOnFilterField.calledOnce);
				assert.ok(!oFilterBar._aAddedFilterFields);

				oFilterBar.removeAggregation("filterItems", aFilterFields[0]);

				assert.ok(oFilterBar._applyFilterItemInserted.calledTwice);
				assert.ok(oFilterBar._applyFilterItemRemoved.calledOnce);

				oFilterBar.getControlDelegate().fetchProperties.restore();

				done();
			});
		});
	});

	QUnit.test("check _onModifications (e.g. change appliance)", function(assert) {

		let fResolve;
		const oPromise = new Promise(function(resolve) {
			fResolve = resolve;
		});

		sinon.stub(oFilterBar.getEngine(), "_processChanges").returns(oPromise);
		sinon.stub(oFilterBar, "awaitPropertyHelper").returns(Promise.resolve());

		//--> add a personalization change
		oFilterBar._addConditionChange({
			key1: [
				{ operator: OperatorName.EQ, values: ["Test"] }
			]
		});

		const done = assert.async();
		sinon.spy(oFilterBar, "_reportModelChange");

		oFilterBar.initialized().then(function() {
			fResolve();
			oPromise.then(function() {
				setTimeout(function() { // required for condition model....
					assert.ok(oFilterBar._reportModelChange.calledOnce);
					oFilterBar.getEngine()._processChanges.restore();
					done();
				}, 20);
			});
		});
	});

	QUnit.test("check properties based on filterItems", function(assert) {
		const oProperty1 = {
			name: "key1",
			label: "Key1",
			dataType: "Edm.String",
			constraints: { maxLength: 40 }
		};
		const oProperty2 = {
			name: "key3",
			label: "label",
			dataType: "Edm.String"
		};

		const oDelegate = {
			fetchProperties: function() { return Promise.resolve([oProperty1, oProperty2]); },
			getTypeMap: function() { return ODataTypeMap; }
		};

		const oMyModel = new JSONModel();

		sinon.stub(sap.ui, "require").returns(oDelegate);

		const oFB = new FilterBar({
			delegate: {
				name: "test",
				payload: {
					modelName: "Model",
					collectionName: "Collection"
				}
			}
		});

		const done = assert.async();

		oFB.setModel(oMyModel, "Model");

		oFB.initializedWithMetadata().then(function() {
			const aProperties = oFB.getPropertyInfoSet();
			assert.ok(aProperties);
			assert.equal(aProperties.length, 2);

			sap.ui.require.restore();
			oFB.destroy();
			done();
		});
	});

	QUnit.test("check getConditions", function(assert) {

		sinon.stub(oFilterBar, "_applyFilterConditionsChanges");
		sinon.stub(oFilterBar, "_getPropertyByName").returns(true);
		const mCondition = { "fieldPath1": [Condition.createCondition(OperatorName.EQ, ["foo"])] };
		oFilterBar.setP13nMode(["Item", "Value"]);
		oFilterBar.setFilterConditions(mCondition);

		const oConditions = oFilterBar.getConditions();
		assert.ok(oConditions);
		assert.ok(oConditions["fieldPath1"]);
		assert.equal(oConditions["fieldPath1"][0].operator, OperatorName.EQ);
		assert.equal(oConditions["fieldPath1"][0].values[0], "foo");
	});

	QUnit.test("check getCurrentState corresponding to p13nMode", function(assert) {

		oFilterBar.setP13nMode(undefined);
		let oCurrentState = oFilterBar.getCurrentState();
		assert.ok(!oCurrentState.items, "current state should not contain unnecessary attrbiutes");
		assert.ok(oCurrentState, oCurrentState.filter, "current state should react on p13nMode undefined. Value is implicit.");

		oFilterBar.setP13nMode(["Item"]);
		oCurrentState = oFilterBar.getCurrentState();
		assert.ok(oCurrentState.items, "current state should react on p13nMode Item");
		assert.ok(oCurrentState.filter, "current state should contail filter. Value is implicit.");

		oFilterBar.setP13nMode(["Value"]);
		oCurrentState = oFilterBar.getCurrentState();
		assert.ok(oCurrentState.filter, "current state should react on p13nMode Value.Value is implicit.");
		assert.ok(!oCurrentState.items, "current state should not contain unnecessary attrbiutes");

		oFilterBar.setP13nMode(["Item", "Value"]);
		oCurrentState = oFilterBar.getCurrentState();
		assert.ok(oCurrentState.filter, "current state should react on every p13nMode. Value is implicit.");
		assert.ok(oCurrentState.items, "current state should react on every p13nMode");
	});

	QUnit.test("check getCurrentState should return a copy", function(assert) {

		const oContent = { "name": [{ operator: OperatorName.Contains, values: ["value"], validated: ConditionValidated.NotValidated }] };

		oFilterBar.setFilterConditions(merge({}, oContent));
		let oCurrentState = oFilterBar.getCurrentState();
		assert.deepEqual(oCurrentState.filter, oContent, "current state should be set");

		delete oCurrentState.filter["name"];

		oCurrentState = oFilterBar.getCurrentState();
		assert.deepEqual(oCurrentState.filter, oContent, "current state should not change");
	});

	QUnit.test("check getSearch", function(assert) {
		assert.strictEqual(oFilterBar.getSearch(), "", "No search text initially");

		oFilterBar.setInternalConditions({ "$search": [{ values: ["foo"] }] }); // simulate typed in text on basic search

		assert.strictEqual(oFilterBar.getSearch(), "foo", "Search text returned from CM");

		oFilterBar.setInternalConditions({ "$search": [] }); // simulate clear on basic search

		assert.strictEqual(oFilterBar.getSearch(), "", "No search text present in CM");
	});

	QUnit.test("prepare the AdaptFiltersDialog", function(assert) {

		const done = assert.async();

		const oProperty1 = {
			name: "field1",
			label: "A",
			dataType: "Edm.String",
			constraints: { maxLength: 40 }
		};
		const oProperty2 = {
			name: "field2",
			label: "B",
			dataType: "Edm.String"
		};
		const oProperty3 = {
			name: "field3",
			label: "C",
			dataType: "Edm.String"
		};

		oFilterBar.setP13nMode(["Item"]);

		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty1, oProperty2, oProperty3]);

		oFilterBar.initControlDelegate();

		oFilterBar.awaitControlDelegate().then(function(oDelegate) {
			sinon.stub(oDelegate, "fetchProperties").returns(Promise.resolve([oProperty1, oProperty2, oProperty3]));

			oFilterBar.initialized().then(function() {

				oFilterBar.onAdaptFilters().then(function(oP13nContainer) {
					assert.ok(oP13nContainer, "panel has been created");
					const oAdaptFiltersPanel = oP13nContainer.getContent()[0];
					const aPanelItems = oAdaptFiltersPanel.getP13nData().items;
					assert.equal(aPanelItems.length, 3, "correct amount of p13n items has been created by FilterBar");
					assert.equal(aPanelItems[0].name, "field1", "correct field created in panel");
					assert.equal(aPanelItems[0].label, "A", "correct label for field created in panel");
					assert.equal(aPanelItems[1].name, "field2", "correct field created in panel");
					assert.equal(aPanelItems[1].label, "B", "correct label for field created in panel");
					assert.equal(aPanelItems[2].name, "field3", "correct field created in panel");
					assert.equal(aPanelItems[2].label, "C", "correct label for field created in panel");

					oFilterBar.getControlDelegate().fetchProperties.restore();

					done();
				});
			});
		});

	});

	QUnit.test("check filter operators", function(assert) {

		const oProperty1 = {
			name: "key1",
			label: "Key1",
			dataType: "sap.ui.model.odata.type.String",
			filterOperators: [OperatorName.EQ, OperatorName.StartsWith],
			visible: true
		};
		const oProperty2 = {
			name: "key2",
			label: "Key2",
			dataType: "sap.ui.model.odata.type.String",
			visible: true
		};

		const done = assert.async();

		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty1, oProperty2]);

		oFilterBar._waitForMetadata().then(function() {
			const aPromises = [];

			assert.ok(oFilterBar.getControlDelegate());
			sinon.stub(oFilterBar.getControlDelegate(), "fetchProperties").returns(Promise.resolve([oProperty1, oProperty2]));

			aPromises.push(oFilterBar.getControlDelegate().addItem(oFilterBar, oProperty1.name));
			aPromises.push(oFilterBar.getControlDelegate().addItem(oFilterBar, oProperty2.name));

			Promise.all(aPromises).then(function(aFilterFields) {

				assert.ok(aFilterFields[0]);
				const aOp1 = aFilterFields[0].getOperators();
				assert.ok(aOp1);
				assert.deepEqual(oProperty1.filterOperators, aOp1);
				assert.deepEqual(oProperty1.filterOperators, aFilterFields[0].getSupportedOperators());

				assert.ok(aFilterFields[1]);
				//				var aOp2 = aFilterFields[1].getOperators();
				//				assert.ok(aOp2);
				//				assert.deepEqual(aOp2, FilterOperatorUtil.getOperatorsForType("String"));

				oFilterBar.getControlDelegate().fetchProperties.restore();
				done();
			});
		});
	});

	QUnit.test("check getAssignedFilterNames", function(assert) {

		const oProperty1 = {
			name: "key1",
			visible: true
		};
		const oProperty2 = {
			name: "key2",
			visible: true
		};
		const oProperty3 = {
			name: "key3",
			visible: true
		};
		const oProperty4 = {
			name: "key4",
			visible: true
		};
		const oProperty5 = {
			name: "key5",
			visible: true
		};
		const oProperty6 = {
			name: "key6",
			visible: true
		};
		const oProperty7 = {
			name: "key7",
			visible: true,
			hiddenFilter: true
		};

		const sLanguage = Localization.getLanguage();
		Localization.setLanguage("EN");

		sinon.stub(oFilterBar, "_handleAssignedFilterNames");

		const oCM = oFilterBar._getConditionModel();
		oCM.addCondition("key7", Condition.createCondition(OperatorName.EQ, ["foo"]));
		oCM.addCondition("key6", Condition.createCondition(OperatorName.EQ, ["foo"]));
		oCM.addCondition("key2", Condition.createCondition(OperatorName.EQ, ["foo"]));
		oCM.addCondition("key1", Condition.createCondition(OperatorName.EQ, ["foo"]));

		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty1, oProperty2, oProperty3, oProperty4, oProperty5, oProperty6, oProperty7]);
		let aNames = oFilterBar.getAssignedFilterNames();
		assert.ok(aNames);
		assert.equal(aNames.length, 3);
		assert.equal(aNames[0], oProperty1.name);
		assert.equal(aNames[1], oProperty2.name);
		assert.equal(aNames[2], oProperty6.name);

		oFilterBar.getPropertyInfoSet.restore();
		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty7, oProperty6, oProperty5, oProperty4, oProperty3, oProperty2, oProperty1]);
		oCM.addCondition("$search", Condition.createCondition(OperatorName.EQ, ["foo"]));
		aNames = oFilterBar.getAssignedFilterNames();
		assert.ok(aNames);
		assert.equal(aNames.length, 4);
		assert.equal(aNames[0], "Search Terms");
		assert.equal(aNames[1], oProperty6.name);
		assert.equal(aNames[2], oProperty2.name);
		assert.equal(aNames[3], oProperty1.name);

		Localization.setLanguage(sLanguage);
	});

	QUnit.test("check _handleConditionModelPropertyChange with navigation paths", function(assert) {

		const oEvent1 = {
			getParameter: function(s) {
				if (s === "path") {
					return "/conditions/nav0";
				} else if (s === "value") {
					return {};
				}
			}
		};

		const oEvent2 = {
			getParameter: function(s) {
				if (s === "path") {
					return "/conditions/to_nav/nav1";
				} else if (s === "value") {
					return {};
				}
			}
		};

		let oCondition;

		sinon.stub(oFilterBar, "_getPropertyByName").returns({});
		oFilterBar.setP13nMode(["Value"]);
		sinon.stub(oFilterBar.getEngine(), "createChanges").callsFake(function(mConfig) {
			oCondition = mConfig.state;
			return Promise.resolve();
		});

		oFilterBar._handleConditionModelPropertyChange(oEvent1);
		assert.ok(oCondition.hasOwnProperty("nav0"));
		oFilterBar._handleConditionModelPropertyChange(oEvent2);
		assert.ok(oCondition.hasOwnProperty("to_nav/nav1"));

		oFilterBar.getEngine().createChanges.restore();
	});

	QUnit.test("PropertyInfo with display property", function(assert) {

		const oProperty = {
			name: "key",
			dataType: "Edm.String",
			display: "Description"
		};

		let aResultingChanges = [];
		const fnStoreChanges = function(aChanges) {
			aResultingChanges = aResultingChanges.concat(aChanges);
		};

		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty]);
		sinon.stub(FlexUtil, "handleChanges").callsFake(fnStoreChanges);

		const done = assert.async();

		oFilterBar.setP13nMode(["Value"]);

		oFilterBar._waitForMetadata().then(function() {

			assert.ok(oFilterBar.getControlDelegate());
			sinon.stub(oFilterBar.getControlDelegate(), "fetchProperties").returns(Promise.resolve([oProperty]));

			const oPromise = oFilterBar.getControlDelegate().addItem(oFilterBar, oProperty.name);

			oPromise.then(function(oFilterField) {
				assert.ok(oFilterField.getDisplay(), oProperty.display);

				oFilterBar.getControlDelegate().fetchProperties.restore();

				done();
			});
		});
	});


	QUnit.test("check validate with not yet complete change appliance", function(assert) {

		let fnFunction = null;
		const oPromise = new Promise(function(resolve) {
			fnFunction = resolve;
		});

		sinon.stub(oFilterBar, "waitForInitialization").returns(Promise.resolve());

		sinon.spy(oFilterBar, "_validate");
		sinon.spy(oFilterBar, "_handleOngoingChangeAppliance");

		oFilterBar._aOngoingChangeAppliance = [oPromise];
		setTimeout(function() { fnFunction(); }, 200);

		return oFilterBar.triggerSearch().then(function() {
			assert.ok(oFilterBar._handleOngoingChangeAppliance.calledOnce);
			oFilterBar._handleOngoingChangeAppliance.reset();

			assert.ok(oFilterBar._validate.calledOnce);
			oFilterBar._validate.reset();


			return oFilterBar.triggerSearch().then(function() {
				assert.ok(!oFilterBar._handleOngoingChangeAppliance.called);
				assert.ok(oFilterBar._validate.calledOnce);
			});
		});

	});

	QUnit.test("check suspendSelection", function(assert) {

		let fResolvePromise, oWaitPromise = new Promise(function(resolve) {
			fResolvePromise = resolve;
		});
		const fnSearch = function(oEvent) {
			fResolvePromise();

			oWaitPromise = new Promise(function(resolve) {
				fResolvePromise = resolve;
			});
		};

		const done = assert.async();

		oFilterBar.attachSearch(fnSearch);

		sinon.spy(oFilterBar, "_validate");

		sinon.stub(oFilterBar, "waitForInitialization").returns(Promise.resolve());

		assert.ok(!oFilterBar.getSuspendSelection());
		assert.ok(!oFilterBar._bSearchTriggered);

		oFilterBar.triggerSearch();
		oWaitPromise.then(function() {

			assert.ok(!oFilterBar._bSearchTriggered);
			assert.ok(oFilterBar._validate.calledOnce);

			assert.ok(oFilterBar.setSuspendSelection(true));
			assert.ok(oFilterBar.getSuspendSelection());

			oFilterBar.triggerSearch();
			assert.ok(oFilterBar._bSearchTriggered);
			assert.ok(oFilterBar._validate.calledOnce);

			oFilterBar.triggerSearch();
			assert.ok(oFilterBar._bSearchTriggered);
			assert.ok(oFilterBar._validate.called);


			oFilterBar.setSuspendSelection(false);
			oWaitPromise.then(function() {
				assert.ok(!oFilterBar.getSuspendSelection());
				assert.ok(!oFilterBar._bSearchTriggered);
				assert.ok(oFilterBar._validate.calledTwice);

				done();
			});
		});

	});

	QUnit.test("check suspendSelection with ignoreQueuing", function(assert) {

		const done = assert.async();

		sinon.spy(oFilterBar, "_validate");

		let oTriggerSearchPromise = null;

		sinon.stub(oFilterBar, "waitForInitialization").returns(Promise.resolve());

		const fOriginalTriggerSearch = oFilterBar.triggerSearch;
		oFilterBar.triggerSearch = function() {
			oTriggerSearchPromise = fOriginalTriggerSearch.apply(oFilterBar);
			return oTriggerSearchPromise;
		};

		assert.ok(!oFilterBar.getIgnoreQueuing());

		oFilterBar.setIgnoreQueuing(false);
		assert.ok(!oFilterBar.getIgnoreQueuing());

		oFilterBar.setIgnoreQueuing(true);
		assert.ok(oFilterBar.getIgnoreQueuing());

		oFilterBar.setSuspendSelection(true);
		oFilterBar.setSuspendSelection(false);
		assert.ok(!oFilterBar.getIgnoreQueuing());

		oFilterBar.setSuspendSelection(true);
		oFilterBar.triggerSearch().then(function() {
			assert.ok(!oFilterBar._validate.called);
			oFilterBar.setSuspendSelection(false);
			assert.ok(oTriggerSearchPromise);

			oTriggerSearchPromise.then(function() {
				assert.ok(oFilterBar._validate.called);

				oFilterBar._validate.reset();
				oFilterBar.setSuspendSelection(true);
				oFilterBar.setIgnoreQueuing(true);
				oFilterBar.triggerSearch().then(function() {
					oFilterBar.setSuspendSelection(false);
					assert.ok(!oFilterBar._validate.called);
					assert.ok(!oFilterBar.getIgnoreQueuing());

					done();
				});

			});
		});
	});

	QUnit.test("check _stringifyConditions", function(assert) {
		const oProperty = {
			name: "test",
			typeConfig: ODataTypeMap.getTypeConfig("sap.ui.model.type.String")
		};
		sinon.stub(oFilterBar, "getTypeMap").returns(ODataTypeMap);
		sinon.stub(oFilterBar, "_getPropertyByName").returns(oProperty);

		let aConditions = [{ operator: OperatorName.EQ, values: ["string"], isEmpty: false, validated: ConditionValidated.NotValidated }];

		let aStringifiedConditions = oFilterBar._stringifyConditions("test", aConditions);
		assert.ok(aStringifiedConditions.length, 1);
		assert.deepEqual(aStringifiedConditions, [{ operator: OperatorName.EQ, values: ["string"], validated: ConditionValidated.NotValidated }]);

		aConditions = [{ operator: OperatorName.TODAY, values: [], isEmpty: false, validated: ConditionValidated.NotValidated }];
		aStringifiedConditions = oFilterBar._stringifyConditions("test", aConditions);
		assert.ok(aStringifiedConditions.length, 1);
		assert.deepEqual(aStringifiedConditions, [{ operator: OperatorName.TODAY, values: [], validated: ConditionValidated.NotValidated }]);

	});

	QUnit.test("check filtersChange with variants", function(assert) {
		const done = assert.async();
		sinon.stub(oFilterBar, "getAssignedFilterNames").returns([]);

		oFilterBar.initialized().then(function() {

			let nCount = 0;
			oFilterBar.attachFiltersChanged(function(oEvent) {
				nCount++; // once triggered from initial handling
				const bConditionBased = oEvent.getParameter("conditionsBased");
				if (!bConditionBased) {

					assert.ok(nCount > 1 && nCount <= 3);

					if (nCount === 3) {
						done();
					}
				} else {
					assert.equal(nCount, 1);
				}
			});

			// conditionBase = true; usual variantSwitch
			oFilterBar._handleVariantSwitch({});
			oFilterBar._reportModelChange({ triggerFilterUpdate: true }); //usually this would happen through an according flex change in _onModifications

			// conditionBase = false; variantSwitch after SaveAs; changes not from FB
			oFilterBar._handleVariantSwitch({ createScenario: "saveAs" });
			oFilterBar._reportModelChange({ triggerFilterUpdate: true }); //usually this would happen through an according flex change in _onModifications

			// conditionBased = false; variantSwitch after SaveAs; changes from FB
			oFilterBar._handleVariantSwitch({ createScenario: "saveAs" });
			oFilterBar._reportModelChange({ triggerFilterUpdate: true }); //usually this would happen through an according flex change in _onModifications
		});

	});

});