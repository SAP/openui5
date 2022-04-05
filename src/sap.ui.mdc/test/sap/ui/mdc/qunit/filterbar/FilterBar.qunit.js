/* global QUnit, sinon*/

/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/mdc/FilterBar",
	"sap/ui/mdc/filterbar/FilterBarBase",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/FilterField",
	'sap/ui/model/json/JSONModel',
	"sap/ui/model/type/String",
	"sap/ui/mdc/p13n/FlexUtil",
	"sap/ui/mdc/odata/TypeUtil",
	"sap/ui/mdc/util/FilterUtil",
	'sap/base/util/merge',
	"sap/ui/core/library",
	"../QUnitUtils",
	"test-resources/sap/ui/mdc/qunit/p13n/TestModificationHandler",
	"sap/ui/core/Core"
], function (
	FlexRuntimeInfoAPI,
	FilterBar,
	FilterBarBase,
	Condition,
	FilterField,
	JSONModel,
	ModelString,
	FlexUtil,
	TypeUtil,
	FilterUtil,
	merge,
	CoreLibrary,
	MDCQUnitUtils,
	TestModificationHandler,
	oCore
) {
	"use strict";

	var oFilterBar;
	var HasPopup = CoreLibrary.aria.HasPopup;
	var ValueState = CoreLibrary.ValueState;

	QUnit.module("FilterBar", {
		beforeEach: function () {
			oFilterBar = new FilterBar({
				delegate: { name: "test-resources/sap/ui/mdc/qunit/filterbar/UnitTestMetadataDelegate", payload: { modelName: undefined, collectionName: "test" } }
			});

			if (FlexUtil.handleChanges.restore){
				FlexUtil.handleChanges.restore();
			}
		},
		afterEach: function () {
			oFilterBar.destroy();
			oFilterBar = undefined;
		}
	});

	QUnit.test("instanciable", function (assert) {
		assert.ok(oFilterBar);
	});

	QUnit.test("inner layout exists on initialization", function(assert) {
		var done = assert.async();
		assert.ok(oFilterBar);

		oFilterBar.initialized().then(function() {
			assert.ok(!!oFilterBar.getAggregation("layout"));
			done();
		});
	});

	QUnit.test("getConditionModelName ", function (assert) {
		assert.equal(oFilterBar.getConditionModelName(), FilterBarBase.CONDITION_MODEL_NAME);
	});

	QUnit.test("get GO button", function (assert) {
		var oButton = oFilterBar._btnSearch;
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

	QUnit.test("get ADAPT button", function (assert) {
		var oButton = oFilterBar._btnAdapt;
		assert.ok(oButton);
		assert.ok(!oButton.getVisible());
		assert.equal(oButton.getAriaHasPopup(), HasPopup.ListBox, "button has correct ariaHasPopup value");

		oFilterBar.setP13nMode(["Value"]);
		assert.ok(!oButton.getVisible());

		oFilterBar.setP13nMode(["Item"]);
		assert.ok(oButton.getVisible());

		oFilterBar.setP13nMode(["Item", "Value"]);
		assert.ok(oButton.getVisible());

		oFilterBar.setShowAdaptFiltersButton(false);
		assert.ok(!oButton.getVisible());
	});


	QUnit.test("check liveMode property", function (assert) {
		var oButton = oFilterBar._btnSearch;
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

	QUnit.test("check p13nMode property", function (assert) {

		assert.ok(!oFilterBar.getP13nMode());
		assert.ok(!oFilterBar._getP13nModeItem());
		assert.ok(!oFilterBar._getP13nModeValue());

		oFilterBar.setP13nMode(["Item", "Value"]);
		assert.ok(oFilterBar.getP13nMode());
		assert.ok(oFilterBar._getP13nModeItem());
		assert.ok(oFilterBar._getP13nModeValue());

		oFilterBar.setP13nMode(["Item"]);
		assert.ok(oFilterBar._getP13nModeItem());
		assert.ok(!oFilterBar._getP13nModeValue());

		oFilterBar.setP13nMode(["Value"]);
		assert.ok(!oFilterBar._getP13nModeItem());
		assert.ok(oFilterBar._getP13nModeValue());
	});

	QUnit.test("add Filter", function (assert) {
		var oFilterField = new FilterField({ conditions: "{cm>/conditions/filter}" });

		assert.equal(oFilterBar.getFilterItems().length, 0);
		assert.equal(oFilterBar.getAggregation("layout").getFilterFields().length, 0);

		oFilterBar.addFilterItem(oFilterField);
		assert.equal(oFilterBar.getFilterItems().length, 1);
		assert.equal(oFilterBar.getAggregation("layout").getFilterFields().length, 1);

		oFilterField.destroy();
	});

	QUnit.test("remove Filter", function (assert) {
		var oFilterField = new FilterField();
		oFilterBar.addFilterItem(oFilterField);

		assert.equal(oFilterBar.getFilterItems().length, 1);
		assert.equal(oFilterBar.getAggregation("layout").getFilterFields().length, 1);

		oFilterBar.removeFilterItem(oFilterField);

		assert.equal(oFilterBar.getFilterItems().length, 0);
		assert.equal(oFilterBar.getAggregation("layout").getFilterFields().length, 0);

		oFilterField.destroy();
	});

	QUnit.test("check condition model", function (assert) {
        sinon.stub(oFilterBar, "awaitPropertyHelper").returns(Promise.resolve());
		sinon.spy(oFilterBar, "_applyInitialFilterConditions");

		var oModel = oFilterBar.getModel("$filters");
		assert.ok(oModel);
		assert.ok(oModel.isA("sap.ui.mdc.condition.ConditionModel"));

		return oFilterBar.initialized().then(function () {
			assert.ok(oFilterBar._applyInitialFilterConditions.called);
		});
	});

	QUnit.test("check condition model with prefilled conditions", function (assert) {

		var oFB = new FilterBar({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/filterbar/UnitTestMetadataDelegate"
			},
			filterConditions: {
				"filter": [{
					operator: "EQ",
					values: ["test"]
				}]
			}
		});

		sinon.spy(oFB, "_applyInitialFilterConditions");
        sinon.stub(oFB, "awaitPropertyHelper").returns(Promise.resolve());

		return oFB.initialized().then(function () {

			var oModel = oFilterBar.getModel("$filters");
			assert.ok(oModel);
			assert.ok(oModel.isA("sap.ui.mdc.condition.ConditionModel"));

			assert.ok(oFB._applyInitialFilterConditions.called);
			oFB.destroy();
		});
	});

	QUnit.test("check api setFocusOnFirstErroneousField", function (assert) {
		var oFilterField0 = new FilterField({ conditions: "{cm>/conditions/filter0}" });
		var oFilterField1 = new FilterField({ conditions: "{cm>/conditions/filter1}" });
		var oFilterField2 = new FilterField({ conditions: "{cm>/conditions/filter2}" });

		oFilterBar.addFilterItem(oFilterField0);
		oFilterBar.addFilterItem(oFilterField1);
		oFilterBar.addFilterItem(oFilterField2);

		var oFilterField = oFilterBar.setFocusOnFirstErroneousField();
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
		beforeEach: function () {
			return this.createTestObjects();
		},
		afterEach: function () {
			this.destroyTestObjects();
		},
		createTestObjects: function(aPropertyInfo) {
			if (!aPropertyInfo) {
				aPropertyInfo = [];
			}

			oFilterBar = new FilterBar({
				delegate: { name: "test-resources/sap/ui/mdc/qunit/filterbar/UnitTestMetadataDelegate", payload: { modelName: undefined, collectionName: "test" } }
			});

			if (FlexUtil.handleChanges.restore){
				FlexUtil.handleChanges.restore();
			}
		},
		destroyTestObjects: function() {
			oFilterBar.destroy();
			MDCQUnitUtils.restorePropertyInfos(oFilterBar);
		}
	});


	QUnit.test("check _handleConditionModelPropertyChange with liveMode=false and p13nValue=false", function (assert) {

		sinon.spy(oFilterBar, "fireSearch");
		sinon.stub(oFilterBar, "getAssignedFilterNames").returns([]);
		sinon.spy(oFilterBar.getEngine(), "createChanges");
        sinon.stub(oFilterBar, "awaitPropertyHelper").returns(Promise.resolve());

		var done = assert.async();

		var fResolve, oPromise = new Promise(function (resolve) {
			fResolve = resolve;
		});

		oFilterBar.attachFiltersChanged(function (oEvent) {
			fResolve();
		});

		oFilterBar.initialized().then(function () {

			var oCM = oFilterBar.getModel("$filters");
			oCM.addCondition("fieldPath1", Condition.createCondition("EQ", ["foo"]));

			oPromise.then(function () {
				assert.ok(!oFilterBar.getEngine().createChanges.called);
				oFilterBar.getEngine().createChanges.restore();
				done();
			});
		});
	});

	QUnit.test("check _handleConditionModelPropertyChange with liveMode=false and p13nValue=true", function (assert) {

		sinon.stub(oFilterBar, "_isPersistenceSupported").returns(true);
		sinon.spy(oFilterBar.getEngine(), "createChanges");
		sinon.stub(oFilterBar, "_getPropertyByName").returns({name: "fieldPath1", typeConfig: TypeUtil.getTypeConfig("sap.ui.model.type.String")});
        sinon.stub(oFilterBar, "awaitPropertyHelper").returns(Promise.resolve());

		var done = assert.async();

		oFilterBar.setP13nMode(["Value"]);

		oFilterBar.initialized().then(function () {

			var oCM = oFilterBar.getModel("$filters");
			oCM.addCondition("fieldPath1", Condition.createCondition("EQ", ["foo"]));
			assert.ok(oFilterBar.getEngine().createChanges.called);
			oFilterBar.getEngine().createChanges.restore();
			done();
		});
	});

	QUnit.test("check _handleConditionModelPropertyChange  with liveMode=true  and p13nValue=false", function (assert) {

		sinon.spy(oFilterBar, "triggerSearch");
		sinon.stub(oFilterBar, "getAssignedFilterNames").returns([]);
		sinon.spy(oFilterBar.getEngine(), "createChanges");
        sinon.stub(oFilterBar, "awaitPropertyHelper").returns(Promise.resolve());


		oFilterBar.setLiveMode(true);
		var done = assert.async();


		var fResolve, oPromise = new Promise(function (resolve) {
			fResolve = resolve;
		});

		oFilterBar.attachFiltersChanged(function (oEvent) {
			fResolve();
		});

		oFilterBar.initialized().then(function () {
			var oCM = oFilterBar.getModel("$filters");
			oCM.addCondition("fieldPath1", Condition.createCondition("EQ", ["foo"]));

			oPromise.then(function () {
				assert.ok(!oFilterBar.getEngine().createChanges.called);
				oFilterBar.getEngine().createChanges.restore();
				done();
			});
		});

	});

	QUnit.test("check _handleConditionModelPropertyChange with liveMode=true and p13nValue=true", function (assert) {

		sinon.stub(oFilterBar, "_isPersistenceSupported").returns(true);
		sinon.spy(oFilterBar.getEngine(), "createChanges");
		sinon.stub(oFilterBar, "_getPropertyByName").returns({name: "fieldPath1", typeConfig: TypeUtil.getTypeConfig("sap.ui.model.type.String")});
        sinon.stub(oFilterBar, "awaitPropertyHelper").returns(Promise.resolve());

		var done = assert.async();

		oFilterBar.setP13nMode(["Value"]);

		oFilterBar.initialized().then(function () {

			var oCM = oFilterBar.getModel("$filters");
			oCM.addCondition("fieldPath1", Condition.createCondition("EQ", ["foo"]));
			assert.ok(oFilterBar.getEngine().createChanges.called);
			oFilterBar.getEngine().createChanges.restore();
			done();
		});
	});


	QUnit.test("check _getFilterField", function (assert) {
		var oFilterField = new FilterField({ conditions: "{cm>/conditions/filter}" });

		oFilterBar.addFilterItem(oFilterField);

		assert.deepEqual(oFilterBar._getFilterField("filter"), oFilterField);

		oFilterField.destroy();
	});


	QUnit.test("check getAssignedFiltersText", function (assert) {

		var sLanguage = oCore.getConfiguration().getLanguage();
		oCore.getConfiguration().setLanguage("EN");

		var mText, fResolve, oPromise = new Promise(function (resolve) {
			fResolve = resolve;
		});

		var oProperty = {
			name: "fieldPath1",
			label: "Field Path",
			typeConfig: TypeUtil.getTypeConfig("sap.ui.model.type.String"),
			visible: true
		};
		var oProperty2 = {
				name: "fieldPath2",
				label: "Field Path2",
				typeConfig: TypeUtil.getTypeConfig("sap.ui.model.type.String"),
				visible: true
		};
		var oProperty3 = {
				name: "$search",
				label: "",
				typeConfig: TypeUtil.getTypeConfig("sap.ui.model.type.String"),
				visible: true
		};
		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty, oProperty2, oProperty3]);
		sinon.stub(oFilterBar, "_getPropertyByName").callsFake(function(sName) {
			return FilterUtil.getPropertyByKey(oFilterBar.getPropertyInfoSet(), sName);
		});

		var done = assert.async();

		mText = oFilterBar.getAssignedFiltersText();
		assert.equal(mText.filtersText, "No filters active");
		assert.equal(mText.filtersTextExpanded, "No filters active");


		oFilterBar._waitForMetadata().then(function () {

			oFilterBar.attachFiltersChanged(function (oEvent) {
				fResolve();
			});

			var oCM = oFilterBar._getConditionModel();
			oCM.addCondition("fieldPath1", Condition.createCondition("EQ", ["foo"]));

			oFilterBar.setBasicSearchField(new FilterField({
				conditions: "{$filters>/conditions/$search}",
				maxConditions: 1,
				delegate: '{name: "sap/ui/mdc/odata/v4/FieldBaseDelegate", payload: {}}'
			}));

			oPromise.then(function () {

				//with one filter not displayed on filterbar
				mText = oFilterBar.getAssignedFiltersText();
				assert.equal(mText.filtersText, "1 filter active: Field Path");
				assert.equal(mText.filtersTextExpanded, "1 filter active (1 hidden)");

				assert.ok(oFilterBar.getControlDelegate());
				sinon.stub(oFilterBar.getControlDelegate(), "fetchProperties").returns(Promise.resolve([oProperty, oProperty2, oProperty3]));

				var oPromise = oFilterBar.getControlDelegate().addItem(oProperty2.name, oFilterBar);

				oPromise.then(function (oFilterField) {

					oFilterBar.addFilterItem(oFilterField);

					// with two filters; one is displayed on filter bar, one not
					oCM.addCondition("fieldPath2", Condition.createCondition("EQ", ["foo"]));
					mText = oFilterBar.getAssignedFiltersText();
					assert.equal(mText.filtersText, "2 filters active: Field Path, Field Path2");
					assert.equal(mText.filtersTextExpanded, "2 filters active (1 hidden)");

					//with basic search and two filter displayed on the filter bar
					oCM.addCondition("$search", Condition.createCondition("EQ", ["foo"]));
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

					oCore.getConfiguration().setLanguage(sLanguage);
					done();
				});
			});
		});
	});

	QUnit.test("check fetchProperties", function (assert) {
		var done = assert.async();

		oFilterBar._waitForMetadata().then(function () {
			assert.ok(oFilterBar.getControlDelegate());
			sinon.stub(oFilterBar.getControlDelegate(), "fetchProperties").returns(Promise.resolve([{}, {}]));


			oFilterBar.getControlDelegate().fetchProperties(oFilterBar).then(function (aProperties) {
				assert.ok(aProperties);
				assert.equal(aProperties.length, 2);

				oFilterBar.getControlDelegate().fetchProperties.restore();
				done();
			});
		});
	});

	QUnit.test("check delegate", function (assert) {
		var done = assert.async();

		oFilterBar._waitForMetadata().then(function () {
			assert.ok(oFilterBar.getDelegate());
			assert.equal(oFilterBar.getDelegate().name, "test-resources/sap/ui/mdc/qunit/filterbar/UnitTestMetadataDelegate");
			done();
		});
	});

	QUnit.test("check _getNonHiddenPropertyByName ", function (assert) {
		var oProperty1 = {
			name: "key1",
			type: "Edm.String",
			visible: true
		};

		var oProperty2 = {
			name: "key2",
			hiddenFilter: true,
			visible: true
		};

		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty1, oProperty2]);

		assert.ok(oFilterBar._getNonHiddenPropertyByName("key1"));
		assert.ok(!oFilterBar._getNonHiddenPropertyByName("key2"));

	});

	QUnit.test("check setBasicSearchField", function (assert) {

		var oBasicSearchField = new FilterField({ conditions: "{cm>/conditions/$search}" });
		oFilterBar.setBasicSearchField(oBasicSearchField);
		assert.equal(oFilterBar.getFilterItems().length, 0);
		assert.equal(oFilterBar.getAggregation("layout").getFilterFields().length, 1);

		oFilterBar.setBasicSearchField(null);
		assert.equal(oFilterBar.getFilterItems().length, 0);
		assert.equal(oFilterBar.getAggregation("layout").getFilterFields().length, 0);

		oBasicSearchField.destroy();
	});

	QUnit.test("check _getFilterItemLayout", function (assert) {
		var oFilterField = new FilterField();
		oFilterBar.addFilterItem(oFilterField);

		var oFilterItemLayout = oFilterBar._getFilterItemLayout(oFilterField);
		assert.ok(oFilterItemLayout);

		oFilterField.destroy();
	});


	QUnit.test("create single valued change", function (assert) {
		var done = assert.async();
		this.destroyTestObjects();

		var aPropertyInfo = [{
			name: "key",
			typeConfig: TypeUtil.getTypeConfig("sap.ui.model.type.String"),
			visible: true
		}];

		this.createTestObjects(aPropertyInfo);

		var aResultingChanges = [];

		var fnStoreChanges = function (aChanges) {
			aResultingChanges = aResultingChanges.concat(aChanges);
		};

		sinon.stub(oFilterBar, "_isPersistenceSupported").returns(true);

		sinon.stub(FlexUtil, "handleChanges").callsFake(fnStoreChanges);

		oFilterBar.setP13nMode(["Value"]);

		oFilterBar._waitForMetadata().then(function () {
			oFilterBar.getEngine().initAdaptation(oFilterBar, "Filter", aPropertyInfo).then(function() {

				assert.ok(oFilterBar.getControlDelegate());
				var oPromise = oFilterBar.getControlDelegate().addItem("key", oFilterBar);

				oPromise.then(function (oFilterField) {

					var iCount = 0;

					var oTestHandler = TestModificationHandler.getInstance();

					oTestHandler.processChanges = function(aChanges){
						iCount++;
						FlexUtil.handleChanges(aChanges);

						if (iCount == 1) {
							oFilterBar._getConditionModel().addCondition("key", Condition.createCondition("EQ", ["foo"]));
						}

						if (iCount == 2) {
							assert.equal(aResultingChanges.length, 3, "correct amount of changes created");
							assert.ok(FlexUtil.handleChanges.calledTwice);
							done();
						}

						return Promise.resolve(aChanges);
					};

					oFilterBar.getEngine()._setModificationHandler(oFilterBar, oTestHandler);

					oFilterBar._getConditionModel().addCondition("key", Condition.createCondition("EQ", ["a"]));
				});

			});
		});
	});

	QUnit.test("create single valued change with inParameters", function (assert) {
		var done = assert.async();

		var aPropertyInfo = [{
			name: "key",
			maxConditions: 1,
			visible: true,
			typeConfig: TypeUtil.getTypeConfig("Edm.String")
		}, {
			name: "in",
			visible: true,
			typeConfig: TypeUtil.getTypeConfig("Edm.String")
		}];

		this.destroyTestObjects();
		this.createTestObjects(aPropertyInfo);

		sinon.stub(oFilterBar, "_isPersistenceSupported").returns(true);

		sinon.stub(oFilterBar, "_getPropertyByName").callsFake(function(sName) {
			return FilterUtil.getPropertyByKey(aPropertyInfo, sName);
		});

		oFilterBar.setP13nMode(["Value"]);

		oFilterBar._waitForMetadata().then(function () {
			oFilterBar.getEngine().initAdaptation(oFilterBar, "Filter", aPropertyInfo).then(function() {

				assert.ok(oFilterBar.getControlDelegate());
				var oPromise = oFilterBar.getControlDelegate().addItem("key", oFilterBar);

				oPromise.then(function (oFilterField) {

					var oTestHandler = TestModificationHandler.getInstance();

					oTestHandler.processChanges = function(aChanges){
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

					oFilterBar._getConditionModel().addCondition("key", Condition.createCondition("EQ", ["a"], { "conditions/in": "INTEST" }));

				});
			});
		});
	});

	QUnit.test("create multi valued change", function (assert) {

		var aPropertyInfo = [{
			name: "key",
			maxConditions: -1,
			visible: true,
			typeConfig: TypeUtil.getTypeConfig("Edm.String")
		}];

		this.destroyTestObjects();
		this.createTestObjects(aPropertyInfo);

		var aResultingChanges = [];
		var fnStoreChanges = function (aChanges) {
			aResultingChanges = aChanges;
		};

		sinon.stub(FlexUtil, "handleChanges").callsFake(fnStoreChanges);
		sinon.stub(oFilterBar, "_isPersistenceSupported").returns(true);
		sinon.stub(oFilterBar, "_getPropertyByName").callsFake(function(sName) {
			return FilterUtil.getPropertyByKey(aPropertyInfo, sName);
		});

		var done = assert.async();

		sinon.stub(oFilterBar, "getPropertyInfoSet").returns(aPropertyInfo);

		oFilterBar.setP13nMode(["Value"]);

		oFilterBar._waitForMetadata().then(function () {
			oFilterBar.getEngine().initAdaptation(oFilterBar, "Filter", aPropertyInfo).then(function() {

				assert.ok(oFilterBar.getControlDelegate());

				var oPromise = oFilterBar.getControlDelegate().addItem("key", oFilterBar);

				oPromise.then(function (oFilterField) {

					var iCount = 0;

					var oTestHandler = TestModificationHandler.getInstance();

					oTestHandler.processChanges = function(aChanges){
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

					oFilterBar._getConditionModel().addCondition("key", Condition.createCondition("EQ", ["a"]));
					oFilterBar._getConditionModel().addCondition("key", Condition.createCondition("EQ", ["foo"]));
				});
			});
		});
	});

	QUnit.test("create multi valued change with 'filterConditions'", function (assert) {
		var done = assert.async();

		var aPropertyInfo = [{
			name: "key",
			maxConditions: -11,
			visible: true,
			typeConfig: TypeUtil.getTypeConfig("Edm.String")
		}];

		this.destroyTestObjects();
		this.createTestObjects(aPropertyInfo);

		oFilterBar.setFilterConditions({ key: [{ operator: "EQ", values: ["a"] }] });
		oFilterBar.setP13nMode(["Value"]);

		var aResultingChanges = [];
		var fnStoreChanges = function (aChanges) {
			aResultingChanges = aChanges;
		};

		var oCondition1 = Condition.createCondition("EQ", ["a"]);
		var oCondition2 = Condition.createCondition("EQ", ["foo"]);

		sinon.stub(oFilterBar, "_getPropertyByName").callsFake(function(sName) {
			return FilterUtil.getPropertyByKey(aPropertyInfo, sName);
		});
		sinon.stub(oFilterBar, "_isPersistenceSupported").returns(true);
		sinon.stub(FlexUtil, 'handleChanges').callsFake(fnStoreChanges);

		oFilterBar._waitForMetadata().then(function () {
			oFilterBar.getEngine().initAdaptation(oFilterBar, "Filter", aPropertyInfo).then(function() {
				oFilterBar._oInitialFiltersAppliedPromise.then(function () {

					var oTestHandler = TestModificationHandler.getInstance();

					oTestHandler.processChanges = function(aChanges){

						FlexUtil.handleChanges(aChanges);

						assert.equal(aResultingChanges.length, 1);

						assert.equal(aResultingChanges[0].selectorElement, oFilterBar);
						assert.equal(aResultingChanges[0].changeSpecificData.changeType, "addCondition");
						assert.equal(aResultingChanges[0].changeSpecificData.content.name, "key");
						assert.deepEqual(aResultingChanges[0].changeSpecificData.content.condition, { operator: "EQ", values: ["foo"], validated: undefined});
						done();
						return Promise.resolve(aChanges);
					};

					oFilterBar.getEngine()._setModificationHandler(oFilterBar, oTestHandler);

					oFilterBar._getConditionModel().addCondition("key", oCondition1);
					oFilterBar._getConditionModel().addCondition("key", oCondition2);
				});
			});
		});
	});

	QUnit.test("create multi valued change with inParameters", function (assert) {

		var aPropertyInfo = [{
			name: "key",
			maxConditions: -1,
			visible: true,
			typeConfig: TypeUtil.getTypeConfig("Edm.String")
		}, {
			name: "in1",
			visible: true,
			typeConfig: TypeUtil.getTypeConfig("Edm.String")
		}, {
			name: "in2",
			visible: true,
			typeConfig: TypeUtil.getTypeConfig("Edm.String")
		}];

		this.destroyTestObjects();
		this.createTestObjects(aPropertyInfo);

		var aResultingChanges = [];
		var fnStoreChanges = function (aChanges) {
			aResultingChanges = aResultingChanges.concat(aChanges);
		};

		var done = assert.async();

		sinon.stub(oFilterBar, "_isPersistenceSupported").returns(true);
		sinon.stub(FlexUtil, 'handleChanges').callsFake(fnStoreChanges);
		sinon.stub(oFilterBar, "_getPropertyByName").callsFake(function(sName) {
			return FilterUtil.getPropertyByKey(aPropertyInfo, sName);
		});

		oFilterBar.setP13nMode(["Value"]);

		oFilterBar._waitForMetadata().then(function () {
			oFilterBar.getEngine().initAdaptation(oFilterBar, "Filter", aPropertyInfo).then(function() {
				assert.ok(oFilterBar.getControlDelegate());
				var oPromise = oFilterBar.getControlDelegate().addItem("key", oFilterBar);

				oPromise.then(function (oFilterField) {
					oFilterBar.getEngine().createChanges({
						control: oFilterBar,
						suppressAppliance: true,
						key: "Filter",
						state: {"key": [Condition.createCondition("EQ", ["foo"], { "in1": "IN1_TEST", "in2": "IN2_TEST" })]}
					}).then(function(aChanges){

						assert.equal(aChanges.length, 1);

						assert.ok(aChanges[0].changeSpecificData.content.condition.inParameters);
						assert.equal(Object.keys(aChanges[0].changeSpecificData.content.condition.inParameters).length, 2);
						assert.ok(aChanges[0].changeSpecificData.content.condition.inParameters["in1"]);
						assert.equal(aChanges[0].changeSpecificData.content.condition.inParameters["in1"], "IN1_TEST");
						assert.ok(aChanges[0].changeSpecificData.content.condition.inParameters["in2"]);
						assert.equal(aChanges[0].changeSpecificData.content.condition.inParameters["in2"], "IN2_TEST");

						var oTestHandler = TestModificationHandler.getInstance();

						oTestHandler.processChanges = function(aCallbackChanges){

							assert.equal(aChanges.length, 1);
							assert.equal(aCallbackChanges.length, 1);

							assert.equal(aCallbackChanges[0].changeSpecificData.changeType, "addCondition");
							assert.ok(!aCallbackChanges[0].changeSpecificData.content.condition.inParameters);
							done();
							return Promise.resolve(aChanges);
						};

						oFilterBar.getEngine()._setModificationHandler(oFilterBar, oTestHandler);

						oFilterBar._getConditionModel().addCondition("key", Condition.createCondition("EQ", ["a"]));
					});
				});
			});
		});
	});


	QUnit.test("check filterItems observer", function (assert) {

		var oProperty1 = {
			name: "key1",
			label: "label 1",
			type: "Edm.String",
			constraints: { maxLength: 40 },
			visible: true,
			filterExpression: "SingleValue"
		};
		var oProperty2 = {
			name: "key2",
			label: "label 2",
			type: "Edm.String",
			constraints: { maxLength: 40 },
			visible: true,
			filterExpression: "SingleValue"
		};

		var aPromise = [];

		var done = assert.async();

		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty1, oProperty2]);
		sinon.spy(oFilterBar, "_applyFilterItemInserted");
		sinon.spy(oFilterBar, "_applyFilterItemRemoved");


		oFilterBar._waitForMetadata().then(function () {
			assert.ok(oFilterBar.getControlDelegate());
			sinon.stub(oFilterBar.getControlDelegate(), "fetchProperties").returns(Promise.resolve([oProperty1, oProperty2]));

			aPromise.push(oFilterBar.getControlDelegate().addItem(oProperty1.name, oFilterBar));
			aPromise.push(oFilterBar.getControlDelegate().addItem(oProperty2.name, oFilterBar));

			Promise.all(aPromise).then(function (aFilterFields) {

				oFilterBar.addFilterItem(aFilterFields[0]);
				oFilterBar.addFilterItem(aFilterFields[1]);

				oFilterBar.removeAggregation("filterItems", aFilterFields[0]);

				assert.ok(oFilterBar._applyFilterItemInserted.calledTwice);
				assert.ok(oFilterBar._applyFilterItemRemoved.calledOnce);

				oFilterBar.getControlDelegate().fetchProperties.restore();

				done();
			});
		});
	});

	QUnit.test("check applyConditionsAfterChangesApplied", function (assert) {

		var fResolve;
		var oPromise = new Promise(function (resolve) {
			fResolve = resolve;
		});
		sinon.stub(FlexRuntimeInfoAPI, "waitForChanges").returns(oPromise);
        sinon.stub(oFilterBar, "awaitPropertyHelper").returns(Promise.resolve());

		assert.ok(!oFilterBar._isChangeApplying());
		oFilterBar.applyConditionsAfterChangesApplied();
		assert.ok(oFilterBar._isChangeApplying());

		oFilterBar.applyConditionsAfterChangesApplied();


		var done = assert.async();

		oFilterBar.initialized().then(function () {
			fResolve();
			oPromise.then(function () {
				sinon.spy(oFilterBar, "_changesApplied");

				setTimeout(function () { // required for condition model....
					FlexRuntimeInfoAPI.waitForChanges.restore();
					assert.ok(oFilterBar._changesApplied.calledOnce);
					done();
				}, 20);
			});
		});
	});

	QUnit.test("check properties based on filterItems", function (assert) {
		var oProperty1 = {
			name: "key1",
			type: "Edm.String",
			constraints: { maxLength: 40 },
			filterExpression: "SingleValue",
			typeConfig: {}
		};
		var oProperty2 = {
			name: "key3",
			label: "label",
			type: "Edm.String",
			filterExpression: "MultiValue",
			typeConfig: {}
		};

		var oDelegate = {
			fetchProperties: function () { return Promise.resolve([oProperty1, oProperty2]); }
		};

		var oMyModel = new JSONModel();

		sinon.stub(sap.ui, "require").returns(oDelegate);

		var oFB = new FilterBar({
			delegate: {
				name: "test",
				payload: {
					modelName: "Model",
					collectionName: "Collection"
				}
			}
		});

		var done = assert.async();

		oFB.setModel(oMyModel, "Model");

		oFB.initialized().then(function () {
			var aProperties = oFB.getPropertyInfoSet();
			assert.ok(aProperties);
			assert.equal(aProperties.length, 2);

			sap.ui.require.restore();
			oFB.destroy();
			done();
		});
	});

	QUnit.test("check getConditions", function (assert) {

		sinon.stub(oFilterBar, "_applyFilterConditionsChanges");
		sinon.stub(oFilterBar, "_getPropertyByName").returns(true);
		var mCondition = { "fieldPath1": [Condition.createCondition("EQ", ["foo"])] };
		oFilterBar.setP13nMode(["Item","Value"]);
		oFilterBar.setFilterConditions(mCondition);

		var oConditions = oFilterBar.getConditions();
		assert.ok(oConditions);
		assert.ok(oConditions["fieldPath1"]);
		assert.equal(oConditions["fieldPath1"][0].operator, "EQ");
		assert.equal(oConditions["fieldPath1"][0].values[0], "foo");
	});

	QUnit.test("check getCurrentState corresponding to p13nMode", function (assert) {

		oFilterBar.setP13nMode(undefined);
		var oCurrentState = oFilterBar.getCurrentState();
		assert.deepEqual(oCurrentState, {}, "current state should react on p13nMode undefined");

		oFilterBar.setP13nMode(["Item"]);
		oCurrentState = oFilterBar.getCurrentState();
		assert.ok(oCurrentState.items, "current state should react on p13nMode Item");
		assert.ok(!oCurrentState.filter, "current state should not contain unnecessary attrbiutes");

		oFilterBar.setP13nMode(["Value"]);
		oCurrentState = oFilterBar.getCurrentState();
		assert.ok(oCurrentState.filter, "current state should react on p13nMode Value");
		assert.ok(!oCurrentState.items, "current state should not contain unnecessary attrbiutes");

		oFilterBar.setP13nMode(["Item", "Value"]);
		oCurrentState = oFilterBar.getCurrentState();
		assert.ok(oCurrentState.filter, "current state should react on every p13nMode");
		assert.ok(oCurrentState.items, "current state should react on every p13nMode");
	});

	QUnit.test("check getCurrentState should return a copy", function (assert) {

		var oContent = { "name": { condition:[{operator: "Contains", values: ["value"], validated: "NotValidated"}]}};

		oFilterBar.setP13nMode(["Value"]);
		sinon.stub(oFilterBar, "_getPropertyByName").returns(true);
		oFilterBar.setFilterConditions(merge({}, oContent));
		var oCurrentState = oFilterBar.getCurrentState();
		assert.deepEqual(oCurrentState.filter, oContent, "current state should be set");

		delete oCurrentState.filter["name"];

		oCurrentState = oFilterBar.getCurrentState();
		assert.deepEqual(oCurrentState.filter, oContent, "current state should not change");
	});

	QUnit.test("check getSearch", function (assert) {
		assert.strictEqual(oFilterBar.getSearch(), "", "No search text initially");

		oFilterBar.setInternalConditions({ "$search": [{ values: ["foo"] }] }); // simulate typed in text on basic search

		assert.strictEqual(oFilterBar.getSearch(), "foo", "Search text returned from CM");

		oFilterBar.setInternalConditions({ "$search": [] }); // simulate clear on basic search

		assert.strictEqual(oFilterBar.getSearch(), "", "No search text present in CM");
	});

	QUnit.test("prepare the AdaptFiltersDialog", function (assert) {

		var done = assert.async();

		var oProperty1 = {
			name: "field1",
			label: "A",
			type: "Edm.String",
			constraints: { maxLength: 40 },
			filterExpression: "SingleValue"
		};
		var oProperty2 = {
			name: "field2",
			label: "B",
			type: "Edm.String",
			filterExpression: "MultiValue"
		};
		var oProperty3 = {
			name: "field3",
			label: "C",
			type: "Edm.String",
			filterExpression: "MultiValue"
		};

		oFilterBar.setP13nMode(["Item"]);

		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty1, oProperty2, oProperty3]);

		oFilterBar.initControlDelegate();

		oFilterBar.awaitControlDelegate().then(function(oDelegate) {
			sinon.stub(oDelegate, "fetchProperties").returns(Promise.resolve([oProperty1, oProperty2, oProperty3]));

			oFilterBar.initialized().then(function () {

				oFilterBar.onAdaptFilters().then(function (oP13nContainer) {
					assert.ok(oP13nContainer, "panel has been created");
					var oAdaptFiltersPanel = oP13nContainer.getContent()[0];
					var aPanelItems = oAdaptFiltersPanel.getP13nData().items;
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

	QUnit.test("check filter operators", function (assert) {

		var oProperty1 = {
			name: "key1",
			type: "sap.ui.model.odata.type.String",
			filterOperators: ["EQ", "StartsWith"],
			visible: true
		};
		var oProperty2 = {
			name: "key2",
			type: "sap.ui.model.odata.type.String",
			visible: true
		};

		var done = assert.async();

		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty1, oProperty2]);

		oFilterBar._waitForMetadata().then(function () {
			var aPromises = [];

			assert.ok(oFilterBar.getControlDelegate());
			sinon.stub(oFilterBar.getControlDelegate(), "fetchProperties").returns(Promise.resolve([oProperty1, oProperty2]));

			aPromises.push(oFilterBar.getControlDelegate().addItem(oProperty1.name, oFilterBar));
			aPromises.push(oFilterBar.getControlDelegate().addItem(oProperty2.name, oFilterBar));

			Promise.all(aPromises).then(function (aFilterFields) {

				assert.ok(aFilterFields[0]);
				var aOp1 = aFilterFields[0].getOperators();
				assert.ok(aOp1);
				assert.deepEqual(oProperty1.filterOperators, aOp1);
				assert.deepEqual(oProperty1.filterOperators, aFilterFields[0]._getOperators());

				assert.ok(aFilterFields[1]);
				//				var aOp2 = aFilterFields[1].getOperators();
				//				assert.ok(aOp2);
				//				assert.deepEqual(aOp2, FilterOperatorUtil.getOperatorsForType("String"));

				oFilterBar.getControlDelegate().fetchProperties.restore();
				done();
			});
		});
	});

	QUnit.test("check getAssignedFilterNames", function (assert) {

		var oProperty1 = {
			name: "key1",
			visible: true
		};
		var oProperty2 = {
			name: "key2",
			visible: true
		};
		var oProperty3 = {
			name: "key3",
			visible: true
		};
		var oProperty4 = {
			name: "key4",
			visible: true
		};
		var oProperty5 = {
			name: "key5",
			visible: true
		};
		var oProperty6 = {
			name: "key6",
			visible: true
		};
		var oProperty7 = {
			name: "key7",
			visible: true,
			hiddenFilter: true
		};

		var sLanguage = oCore.getConfiguration().getLanguage();
		oCore.getConfiguration().setLanguage("EN");

		sinon.stub(oFilterBar, "_handleAssignedFilterNames");

		var oCM = oFilterBar._getConditionModel();
		oCM.addCondition("key7", Condition.createCondition("EQ", ["foo"]));
		oCM.addCondition("key6", Condition.createCondition("EQ", ["foo"]));
		oCM.addCondition("key2", Condition.createCondition("EQ", ["foo"]));
		oCM.addCondition("key1", Condition.createCondition("EQ", ["foo"]));

		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty1, oProperty2, oProperty3, oProperty4, oProperty5, oProperty6, oProperty7]);
		var aNames = oFilterBar.getAssignedFilterNames();
		assert.ok(aNames);
		assert.equal(aNames.length, 3);
		assert.equal(aNames[0], oProperty1.name);
		assert.equal(aNames[1], oProperty2.name);
		assert.equal(aNames[2], oProperty6.name);

		oFilterBar.getPropertyInfoSet.restore();
		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty7, oProperty6, oProperty5, oProperty4, oProperty3, oProperty2, oProperty1]);
		oCM.addCondition("$search", Condition.createCondition("EQ", ["foo"]));
		aNames = oFilterBar.getAssignedFilterNames();
		assert.ok(aNames);
		assert.equal(aNames.length, 4);
		assert.equal(aNames[0], "Search Terms");
		assert.equal(aNames[1], oProperty6.name);
		assert.equal(aNames[2], oProperty2.name);
		assert.equal(aNames[3], oProperty1.name);

		oCore.getConfiguration().setLanguage(sLanguage);
	});

	QUnit.test("check _handleConditionModelPropertyChange", function (assert) {

		var oEvent1 = {
			getParameter: function(s) {
				if (s === "path") {
					return "/conditions/nav0";
				} else if (s === "value") {
					return {};
				}
			}
		};

		var oEvent2 = {
			getParameter: function(s) {
				if (s === "path") {
					return "/conditions/to_nav/nav1";
				} else if (s === "value") {
					return {};
				}
			}
		};

		var oCondition;

		sinon.stub(oFilterBar, "_getP13nModeValue").returns(true);
		sinon.stub(oFilterBar, "_isPersistenceSupported").returns(true);
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

	QUnit.test("PropertyInfo with display property", function (assert) {

		var oProperty = {
			name: "key",
			type: "Edm.String",
			display: "Description"
		};

		var aResultingChanges = [];
		var fnStoreChanges = function (aChanges) {
			aResultingChanges = aResultingChanges.concat(aChanges);
		};

		sinon.stub(oFilterBar, "_isPersistenceSupported").returns(true);
		sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty]);
		sinon.stub(FlexUtil, "handleChanges").callsFake(fnStoreChanges);

		var done = assert.async();

		oFilterBar.setP13nMode(["Value"]);

		oFilterBar._waitForMetadata().then(function () {

			assert.ok(oFilterBar.getControlDelegate());
			sinon.stub(oFilterBar.getControlDelegate(), "fetchProperties").returns(Promise.resolve([oProperty]));

			var oPromise = oFilterBar.getControlDelegate().addItem(oProperty.name, oFilterBar);

			oPromise.then(function (oFilterField) {
				assert.ok(oFilterField.getDisplay(), oProperty.display);

				oFilterBar.getControlDelegate().fetchProperties.restore();

				done();
			});
		});
	});


	QUnit.test("check validate with not yet complete change appliance", function (assert) {

		var fnFunction = null;
		var oPromise = new Promise(function(resolve) {
			fnFunction = resolve;
		});

		sinon.stub(oFilterBar, "waitForInitialization").returns(Promise.resolve());

		sinon.spy(oFilterBar, "_validate");
		sinon.spy(oFilterBar, "_handleOngoingChangeAppliance");

		oFilterBar._aOngoingChangeAppliance = [oPromise];
		setTimeout(function() {fnFunction();}, 200);

		return oFilterBar.triggerSearch().then(function() {
			assert.ok(oFilterBar._handleOngoingChangeAppliance.calledOnce);
			oFilterBar._handleOngoingChangeAppliance.reset();

			assert.ok(oFilterBar._validate.calledTwice);
			oFilterBar._validate.reset();


			return oFilterBar.triggerSearch().then(function() {
				assert.ok(!oFilterBar._handleOngoingChangeAppliance.called);
				assert.ok(oFilterBar._validate.calledOnce);
			});
		});

	});

	QUnit.test("check suspendSelection", function (assert) {

		var fResolvePromise, oWaitPromise = new Promise(function(resolve) {
			fResolvePromise = resolve;
		});
		var fnSearch = function(oEvent) {
			fResolvePromise();

			oWaitPromise = new Promise(function(resolve) {
				fResolvePromise = resolve;
			});
		};

		var done = assert.async();

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

	QUnit.test("check suspendSelection with ignoreQueuing", function (assert) {

		var done = assert.async();

		sinon.spy(oFilterBar, "_validate");

		var oTriggerSearchPromise = null;

		sinon.stub(oFilterBar, "waitForInitialization").returns(Promise.resolve());

		var fOriginalTriggerSearch = oFilterBar.triggerSearch;
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

	QUnit.test("check _stringifyConditions", function (assert) {
		var oProperty = {
		   name: "test",
		   typeConfig: TypeUtil.getTypeConfig("sap.ui.model.type.String")
		};
		sinon.stub(oFilterBar, "getTypeUtil").returns(TypeUtil);
		sinon.stub(oFilterBar, "_getPropertyByName").returns(oProperty);

		var aConditions = [{operator: "EQ", values: ["string"], isEmpty: false, validated: "NotValidated"}];

		var aStringifiedConditions = oFilterBar._stringifyConditions("test", aConditions);
		assert.ok(aStringifiedConditions.length, 1);
		assert.deepEqual(aStringifiedConditions, [{operator: "EQ", values: ["string"], validated: "NotValidated"}]);

		aConditions = [{operator: "TODAY", values: [], isEmpty: false, validated: "NotValidated"}];
		aStringifiedConditions = oFilterBar._stringifyConditions("test", aConditions);
		assert.ok(aStringifiedConditions.length, 1);
		assert.deepEqual(aStringifiedConditions, [{operator: "TODAY", values: [], validated: "NotValidated"}]);

	});

	QUnit.test("check filtersChange with variants", function (assert) {
		var done = assert.async();
		sinon.stub(oFilterBar, "getAssignedFilterNames").returns([]);

		oFilterBar.initialized().then(function () {

			var nCount = 0;
			oFilterBar.attachFiltersChanged(function (oEvent) {
				nCount++; // once triggered from initial handling
				var bConditionBased = oEvent.getParameter("conditionsBased");
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

			// conditionBase = false; variantSwitch after SaveAs; changes not from FB
			oFilterBar._handleVariantSwitch({createScenario: "saveAs"});

			// conditionBased = false; variantSwitch after SaveAs; changes from FB
			sinon.stub(oFilterBar, "_isChangeApplying").returns(true);
			oFilterBar._handleVariantSwitch({createScenario: "saveAs"});
			//simulate flex changes applied
			oFilterBar._changesApplied();
		});

	});
});