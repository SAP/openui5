// Use this test page to test the API and features of the FieldHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 10]*/

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/field/FieldValueHelp",
	"sap/ui/mdc/field/FieldValueHelpContentWrapperBase",
	"sap/ui/mdc/field/FieldValueHelpDelegate",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/enum/BaseType",
	"sap/ui/mdc/enum/ConditionValidated",
	"sap/ui/mdc/field/InParameter",
	"sap/ui/mdc/field/OutParameter",
	"sap/ui/mdc/field/FieldBaseDelegate",
	"sap/ui/mdc/field/ValueHelpPanel",
	"sap/ui/mdc/field/DefineConditionPanel",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/FilterBar",
	"sap/ui/core/Icon",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/String",
	"sap/ui/Device",
	"sap/base/util/merge",
	"sap/m/library",
	"sap/m/Popover",
	"sap/m/Dialog",
	"sap/m/Button"
], function (
		qutils,
		FieldValueHelp,
		FieldValueHelpContentWrapperBase,
		FieldValueHelpDelegate,
		Condition,
		ConditionModel,
		FilterOperatorUtil,
		BaseType,
		ConditionValidated,
		InParameter,
		OutParameter,
		FieldBaseDelegate,
		ValueHelpPanel,
		DefineConditionPanel,
		FilterField,
		FilterBar,
		Icon,
		JSONModel,
		StringType,
		Device,
		merge,
		mLibrary,
		Popover,
		Dialog,
		Button
	) {
	"use strict";

	var iDialogDuration = sap.ui.getCore().getConfiguration().getAnimationMode() === "none" ? 15 : 500;
	var iPopoverDuration = Device.browser.firefox ? 410 : 355;

	var oModelData = {
			items:[{text: "Item 1", key: "I1", additionalText: "Text 1", filter: "XXX"},
			       {text: "Item 2", key: "I2", additionalText: "Text 2", filter: "XXX"},
			       {text: "X-Item 3", key: "I3", additionalText: "Text 3", filter: "YYY"}],
			test: "Hello",
			contexts: [{icon: "sap-icon://sap-ui5", inParameter: "in1", inParameter2: "in1-2", outParameter: "out1"},
			           {icon: "sap-icon://lightbulb", inParameter: "in2", inParameter2: "in2-2", outParameter: "out2"},
			           {icon: "sap-icon://camera", inParameter: "in3", inParameter2: "in3-2", outParameter: "out3"}]
			};

	var oModel = new JSONModel(merge({}, oModelData));
	sap.ui.getCore().setModel(oModel);

	var oDialogContent;
	var oSuggestContent;
	var oWrapper;
	var oListBinding;
	var oFieldHelp;
	var oField;
	var oField2;
	var oType;
	var iDisconnect = 0;
	var iSelect = 0;
	var aSelectConditions;
	var bSelectAdd;
	var bSelectClose;
	var sSelectId;
	var iNavigate = 0;
	var sNavigateValue;
	var sNavigateKey;
	var sNavigateId;
	var oNavigateCondition;
	var sNavigateItemId;
	var iDataUpdate = 0;
	var sDataUpdateId;
	var iOpen = 0;
	var bOpenSuggest;
	var bDataRequested;

	var _myDisconnectHandler = function(oEvent) {
		iDisconnect++;
	};

	var _mySelectHandler = function(oEvent) {
		iSelect++;
		aSelectConditions = oEvent.getParameter("conditions");
		bSelectAdd = oEvent.getParameter("add");
		bSelectClose = oEvent.getParameter("close");
		sSelectId = oEvent.oSource.getId();
	};

	var _myNavigateHandler = function(oEvent) {
		iNavigate++;
		sNavigateValue = oEvent.getParameter("value");
		sNavigateKey = oEvent.getParameter("key");
		sNavigateId = oEvent.oSource.getId();
		oNavigateCondition = oEvent.getParameter("condition");
		sNavigateItemId = oEvent.getParameter("itemId");
	};

	var _myDataUpdateHandler = function(oEvent) {
		iDataUpdate++;
		sDataUpdateId = oEvent.oSource.getId();
	};

	var _myOpenHandler = function(oEvent) {
		iOpen++;
		bOpenSuggest = oEvent.getParameter("suggestion");
	};

	var _myDataRequestedHandler = function(oEvent) {
		bDataRequested = true;
	};

	var oFilters;
	var sSearch;
	var sWrapperId;
	var _applyFilters = function(aFilters, sMySearch) {
		sSearch = sMySearch;
		oFilters = {};
		sWrapperId = this.getId();

		var fnCollectFilters = function(oFilter, oFilters) {
			if (!oFilter) {
				return;
			}
			if (Array.isArray(oFilter)) {
				oFilter.forEach(function(oFilter, iIndex, aFilters) {
					fnCollectFilters(oFilter, oFilters);
				});
			} else if (oFilter._bMultiFilter) {
				oFilter.aFilters.forEach(function(oFilter, iIndex, aFilters) {
					fnCollectFilters(oFilter, oFilters);
				});
			} else {
				var sPath = oFilter.sPath;
				if (!oFilters[sPath]) {
					oFilters[sPath] = [];
				}
				oFilters[sPath].push({operator: oFilter.sOperator, value: oFilter.oValue1, value2: oFilter.oValue2});
			}
		};

		fnCollectFilters(aFilters, oFilters);

		if (oListBinding.isSuspended()) {
			oListBinding.resume();
		}

	};

	var _isSuspended = function() {
		return oListBinding.isSuspended();
	};

	/* first test it without the Field to prevent loading of popup etc. */
	/* use dummy control to simulate Field */

	var _fPressHandler = function(oEvent) {}; // just dummy handler to make Icon focusable

	var _initFields = function() {
		oField = new Icon("I1", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		oField2 = new Icon("I2", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});

		oType = new StringType();
		oField.getFieldPath = function() {return "key";};
		oField._getFormatOptions = function() {
			return {
				valueType: oType,
				maxConditions: -1,
				delegate: FieldBaseDelegate,
				operators: ["EQ"]
				};
		};

		oField2.getFieldPath = function() {return "key";};
		oField2.getMaxConditions = function() {return -1;};
		oField2.getDisplay = function() {return "Value";};
		oField2.getRequired = function() {return true;};
		oField2.getDataType = function() {return "Edm.String";};
		oField2._getDataType = function() {return oType;};
		oField2._getFormatOptions = function() {
			return {
				valueType: oType,
				maxConditions: -1,
				delegate: FieldBaseDelegate,
				operators: FilterOperatorUtil.getOperatorsForType(BaseType.String)
				};
		};

		oField.placeAt("content");
		oField2.placeAt("content");
		sap.ui.getCore().applyChanges();
		oField.focus();
	};

	var oClock;
	var _initFieldHelp = function() {
		oDialogContent = new Icon("DC1", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		oSuggestContent = new Icon("SC1", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});

		oListBinding = oModel.bindList("/items");
		oWrapper = new FieldValueHelpContentWrapperBase("W1");
		sinon.spy(oWrapper, "initialize");
		sinon.stub(oWrapper, "getDialogContent").returns(oDialogContent);
		sinon.stub(oWrapper, "getSuggestionContent").returns(oSuggestContent);
		sinon.spy(oWrapper, "fieldHelpOpen");
		sinon.spy(oWrapper, "fieldHelpClose");
		sinon.spy(oWrapper, "getFilterEnabled");
		sinon.spy(oWrapper, "navigate");
		sinon.stub(oWrapper, "applyFilters").callsFake(_applyFilters);
		sinon.stub(oWrapper, "isSuspended").callsFake(_isSuspended);
		var oStub = sinon.stub(oWrapper, "getTextForKey").returns("");
		oStub.withArgs("I1").returns("Item 1");
		oStub.withArgs("I2").returns({key: "I2", description: "Item 2", inParameters: {myTestIn: "In2"}, outParameters: {myTest: "Out2"}});
		oStub.withArgs("I3").returns("X-Item 3");
		oStub.withArgs("I4").returns(new Promise(function(fResolve) {fResolve({key: "I4", description: "Item 4", inParameters: {myTestIn: "In4"}, outParameters: {myTest: "Out4"}});}));
		oStub.withArgs("I5").returns(new Promise(function(fResolve) {throw new Error("wrong key");}));
		oStub = sinon.stub(oWrapper, "getKeyForText");
		oStub.withArgs("Item 1").returns("I1");
		oStub.withArgs("Item 2").returns({key: "I2", description: "Item 2", inParameters: {myTestIn: "In2"}, outParameters: {myTest: "Out2"}});
		oStub.withArgs("X-Item 3").returns("I3");
		oStub.withArgs("Item 4").returns(new Promise(function(fResolve) {fResolve({key: "I4", description: "Item 4", inParameters: {myTestIn: "In4"}, outParameters: {myTest: "Out4"}});}));
		oStub.withArgs("Item 5").returns(new Promise(function(fResolve) {throw new Error("wrong text");}));
		sinon.stub(oWrapper, "getListBinding").returns(oListBinding);

		oFieldHelp = new FieldValueHelp("F1-H", {
					disconnect: _myDisconnectHandler,
					select: _mySelectHandler,
					navigate: _myNavigateHandler,
					dataUpdate: _myDataUpdateHandler,
					open: _myOpenHandler,
					dataRequested: _myDataRequestedHandler,
					content: oWrapper,
					filterFields: "*text,additionalText*",
					descriptionPath: "text"
				});
		_initFields();
		oField.addDependent(oFieldHelp);
		oFieldHelp.connect(oField);
	};

	var _teardown = function() {
		if (oClock) {
			oClock.restore();
			oClock = undefined;
		}
		oDialogContent.destroy();
		oDialogContent = undefined;
		oSuggestContent.destroy();
		oSuggestContent = undefined;
		oListBinding.destroy();
		oListBinding = undefined;
		oWrapper.destroy();
		oWrapper = undefined;
		oFieldHelp.destroy();
		oFieldHelp = undefined;
		oField.destroy();
		oField = undefined;
		oField2.destroy();
		oField2 = undefined;
		oType.destroy();
		oType = undefined;
		iDisconnect = 0;
		iSelect = 0;
		aSelectConditions = undefined;
		bSelectAdd = undefined;
		bSelectClose = undefined;
		sSelectId = undefined;
		iNavigate = 0;
		sNavigateValue = undefined;
		sNavigateKey = undefined;
		sNavigateId = undefined;
		oNavigateCondition = undefined;
		sNavigateItemId = undefined;
		iDataUpdate = 0;
		sDataUpdateId = undefined;
		iOpen = 0;
		bOpenSuggest = undefined;
		bDataRequested = undefined;
		oFilters = undefined;
		sSearch = undefined;
		sWrapperId = undefined;
		FieldValueHelp._init();
		oModel.setData(merge({}, oModelData));
	};

	QUnit.module("ValueHelp", {
		beforeEach: _initFieldHelp,
		afterEach: _teardown
	});

	QUnit.test("icon", function(assert) {

		assert.equal(oFieldHelp.getIcon(), "sap-icon://value-help", "ValueHelp icon as default");

		oFieldHelp.setNoDialog(true);
		assert.equal(oFieldHelp.getIcon(), "sap-icon://slim-arrow-down", "ComboBox icon if noDialog");

	});

	QUnit.test("openByTyping", function(assert) {

		sinon.spy(FieldValueHelpDelegate, "determineSearchSupported");

		assert.ok(oFieldHelp.openByTyping(), "openByTyping active as defalut (as FilterFields has a default)");
		assert.ok(FieldValueHelpDelegate.determineSearchSupported.calledWith(undefined, oFieldHelp), "FieldValueHelpDelegate.determineSearchSupported called");

		oFieldHelp.setFilterFields("");
		assert.notOk(oFieldHelp.openByTyping(), "openByTyping not active if no FilterFields set (not known how to search)");

		FieldValueHelpDelegate.determineSearchSupported.restore();

	});

	QUnit.test("openByTyping with async loading of Delegate", function(assert) {

		sinon.stub(sap.ui, "require");
		sap.ui.require.withArgs("sap/ui/mdc/field/FieldValueHelpDelegate").onFirstCall().returns(undefined);
		sap.ui.require.callThrough();

		sinon.spy(FieldValueHelpDelegate, "determineSearchSupported");

		var oPromise = oFieldHelp.openByTyping();

		assert.ok(oPromise instanceof Promise, "openByTyping returns Promise as delegate is pending");
		assert.notOk(FieldValueHelpDelegate.determineSearchSupported.calledWith(undefined, oFieldHelp), "FieldValueHelpDelegate.determineSearchSupported not called");

		var fnDone = assert.async();
		oPromise.then(function(bResult) {
			assert.ok(FieldValueHelpDelegate.determineSearchSupported.calledWith(undefined, oFieldHelp), "FieldValueHelpDelegate.determineSearchSupported called");
			assert.ok(bResult, "openByTyping active as defalut (as FilterFields has a default)");

			FieldValueHelpDelegate.determineSearchSupported.restore();
			fnDone();
		});

		sap.ui.require.restore();

	});

	QUnit.test("openByTyping with async loading of Delegate and Promise from Delegate", function(assert) {

		sinon.stub(sap.ui, "require");
		sap.ui.require.withArgs("sap/ui/mdc/field/FieldValueHelpDelegate").onFirstCall().returns(undefined);
		sap.ui.require.callThrough();

		sinon.stub(FieldValueHelpDelegate, "determineSearchSupported").returns(Promise.resolve());

		var oPromise = oFieldHelp.openByTyping();

		assert.ok(oPromise instanceof Promise, "openByTyping returns Promise as delegate is pending");
		assert.notOk(FieldValueHelpDelegate.determineSearchSupported.calledWith(undefined, oFieldHelp), "FieldValueHelpDelegate.determineSearchSupported not called");

		var fnDone = assert.async();
		oPromise.then(function(bResult) {
			assert.ok(FieldValueHelpDelegate.determineSearchSupported.calledWith(undefined, oFieldHelp), "FieldValueHelpDelegate.determineSearchSupported called");
			assert.ok(bResult, "openByTyping active as defalut (as FilterFields has a default)");

			FieldValueHelpDelegate.determineSearchSupported.restore();
			fnDone();
		});

		sap.ui.require.restore();

	});

	QUnit.test("isUsableForValidation", function(assert) {

		assert.ok(oFieldHelp.isUsableForValidation(), "isUsableForValidation active if wrapper is assigned");

		oFieldHelp.destroyContent();
		assert.notOk(oFieldHelp.isUsableForValidation(), "isUsableForValidation not active if no wrapper is assigned");

	});

	QUnit.test("isFocusInHelp", function(assert) {

		assert.notOk(oFieldHelp.isFocusInHelp(), "Focus on Field is default");

		oFieldHelp._bDialogRequested = true; //fake dialog open
		oFieldHelp._bOpen = true;
		assert.ok(oFieldHelp.isFocusInHelp(), "if dialog is used focus is in fieldHelp");

		oFieldHelp.setNoDialog(true);
		assert.notOk(oFieldHelp.isFocusInHelp(), "if no dialog focus stays always in Field");

		// fake request in multi-selection navigation
		oFieldHelp.setNoDialog(false);
		oFieldHelp._bFocusPopover = true;
		assert.ok(oFieldHelp.isFocusInHelp(), "in multi-selection navigation focus is in fieldHelp");

	});

	QUnit.test("getTextForKey", function(assert) {

		var vResult = oFieldHelp.getTextForKey("I1");
		assert.equal(vResult, "Item 1", "Text for key");
		assert.ok(oWrapper.getTextForKey.calledWith("I1"), "getTextForKey of Wrapper called");

		vResult = oFieldHelp.getTextForKey("Test");
		assert.equal(vResult, "", "Text for not existing key");

		oFieldHelp.addOutParameter(new OutParameter({value: "{/test}", helpPath: "myTest"}));
		vResult = oFieldHelp.getTextForKey("I2", undefined, {test: "X"});
		assert.equal(vResult.description, "Item 2", "Text for key");
		assert.ok(oWrapper.getTextForKey.calledWith("I2", undefined, {myTest: "X"}, false), "getTextForKey of Wrapper called with outParameter");
		assert.notOk(vResult.inParameters, "No In-paramters in result");
		assert.deepEqual(vResult.outParameters, {test: "Out2"} , "Out-parameters in result");

		oFieldHelp.addInParameter(new InParameter({value: "{/testIn}", helpPath: "myTestIn"}));
		vResult = oFieldHelp.getTextForKey("I2", {testIn: "X"}, {test: "Y"});
		assert.equal(vResult.description, "Item 2", "Text for key");
		assert.ok(oWrapper.getTextForKey.calledWith("I2", {myTestIn: "X"}, {myTest: "Y"}, false), "getTextForKey of Wrapper called with In- and OutParameter");
		assert.deepEqual(vResult.inParameters, {testIn: "In2"} , "In-parameters in result");
		assert.deepEqual(vResult.outParameters, {test: "Out2"} , "Out-parameters in result");

		assert.notOk(bDataRequested, "No dataRequested event fired");

		oWrapper.getListBinding.returns(null);
		vResult = oFieldHelp.getTextForKey("I4");
		assert.ok(vResult instanceof Promise, "Promise returned");
		assert.ok(bDataRequested, "dataRequested event fired");

		var fnDone = assert.async();
		vResult.then(function(vResult) {
			assert.equal(vResult.description, "Item 4", "Text for key");
			assert.deepEqual(vResult.inParameters, {testIn: "In4"} , "In-parameters in result");
			assert.deepEqual(vResult.outParameters, {test: "Out4"} , "Out-parameters in result");

			vResult = oFieldHelp.getTextForKey("I5");
			assert.ok(vResult instanceof Promise, "Promise returned");

			vResult.then(function(vResult) {
				assert.notOk(true, "Promise Then must not be called");
				fnDone();
			}).catch(function(oError) {
				assert.ok(true, "Promise Catch called");
				fnDone();
			});
		});

	});

	QUnit.test("getTextForKey with async contentRequest of delegate", function(assert) {

		var fnResolve;
		var oPromise = new Promise(function(fnMyResolve, fnMyReject) {
			fnResolve = fnMyResolve;
		});
		sinon.stub(FieldValueHelpDelegate, "contentRequest").returns(oPromise);

		// different calls before promise is resolved
		var vResult1 = oFieldHelp.getTextForKey("I1");
		assert.ok(vResult1 instanceof Promise, "Test1: Promise returned");

		var vResult2 = oFieldHelp.getTextForKey("I1"); // same promise should be returned
		assert.equal(vResult1, vResult2, "Test2: Same promise returned for same request");

		oFieldHelp.addInParameter(new InParameter({value: "{/testIn}", helpPath: "myTestIn"}));
		oFieldHelp.addOutParameter(new OutParameter({value: "{/test}", helpPath: "myTest"}));
		var vResult3 = oFieldHelp.getTextForKey("I2", {testIn: "X"}, {test: "Y"});
		assert.ok(vResult3 instanceof Promise, "Test3: Promise returned");

		var vResult4 = oFieldHelp.getTextForKey("I4");
		assert.ok(vResult4 instanceof Promise, "Test4: Promise returned");

		var vResult5 = oFieldHelp.getTextForKey("I5");
		assert.ok(vResult5 instanceof Promise, "Test5: Promise returned");

		var vResult6 = oFieldHelp.getTextForKey("Test");
		assert.ok(vResult6 instanceof Promise, "Test6: Promise returned");

		assert.notOk(bDataRequested, "dataRequested event not fired");

		FieldValueHelpDelegate.contentRequest.restore();
		fnResolve();
		var fnDone = assert.async();
		var iFinished = 0;

		vResult1.then(function(vResult) {
			assert.ok(true, "Test1+2: Promise Then must be called");
			assert.equal(vResult, "Item 1", "Test1+2: Text for key");
			iFinished++;
		}).catch(function(oError) {
			assert.notOk(true, "Test1+2: Promise Catch must not be called");
			iFinished++;
		});

		vResult3.then(function(vResult) {
			assert.ok(true, "Test3: Promise Then must be called");
			assert.equal(vResult.description, "Item 2", "Test3: Text for key");
			assert.deepEqual(vResult.inParameters, {testIn: "In2"} , "Test3: In-parameters in result");
			assert.deepEqual(vResult.outParameters, {test: "Out2"} , "Test3: Out-parameters in result");
			iFinished++;
		}).catch(function(oError) {
			assert.notOk(true, "Test3: Promise Catch must not be called");
			iFinished++;
		});

		vResult4.then(function(vResult) {
			assert.ok(true, "Test4: Promise Then must be called");
			assert.equal(vResult.description, "Item 4", "Test4: Text for key");
			assert.deepEqual(vResult.inParameters, {testIn: "In4"} , "Test4: In-parameters in result");
			assert.deepEqual(vResult.outParameters, {test: "Out4"} , "Test4: Out-parameters in result");
			iFinished++;
		}).catch(function(oError) {
			assert.notOk(true, "Test4: Promise Catch must not be called");
			iFinished++;
		});

		vResult5.then(function(vResult) {
			assert.notOk(true, "Test5: Promise Then must not be called");
			iFinished++;
		}).catch(function(oError) {
			assert.ok(true, "Test5: Promise Catch must be called");
			iFinished++;
		});

		vResult6.then(function(vResult) {
			assert.ok(true, "Test6: Promise Then must be called");
			assert.equal(vResult, "", "no text for key found");
			iFinished++;
		}).catch(function(oError) {
			assert.notOk(true, "Test6: Promise Catch must not be called");
			iFinished++;
		});

		setTimeout( function(){ // as promise is resolves async
			assert.notOk(bDataRequested, "dataRequested event not fired as content exist");
			assert.equal(iFinished, 5, "All promises finished");
			fnDone();
		}, 0);

	});

	QUnit.test("getKeyForText", function(assert) {

		var vResult = oFieldHelp.getKeyForText("Item 1");
		assert.equal(vResult, "I1", "key for text");
		assert.ok(oWrapper.getKeyForText.calledWith("Item 1", undefined, false), "getKeyForText of Wrapper called");

		vResult = oFieldHelp.getKeyForText("Item 2");
		assert.equal(vResult.key, "I2", "key for text");
		assert.ok(oWrapper.getKeyForText.calledWith("Item 2", undefined, false), "getKeyForText of Wrapper called");
		assert.notOk(vResult.inParameters, "No In-paramters in result");
		assert.notOk(vResult.outParameters, "No out-paramters in result");

		oFieldHelp.addInParameter(new InParameter({value: "{/testIn}", helpPath: "myTestIn"}));
		oFieldHelp.addOutParameter(new OutParameter({value: "{/test}", helpPath: "myTest"}));
		vResult = oFieldHelp.getKeyForText("Item 2");
		assert.equal(vResult.key, "I2", "key for text");
		assert.ok(oWrapper.getKeyForText.calledWith("Item 2", undefined, false), "getKeyForText of Wrapper called");
		assert.deepEqual(vResult.inParameters, {testIn: "In2"} , "In-parameters in result");
		assert.deepEqual(vResult.outParameters, {test: "Out2"} , "Out-parameters in result");

		vResult = oFieldHelp.getKeyForText("X");
		assert.notOk(vResult, "key for not existing text");

		assert.notOk(bDataRequested, "No dataRequested event fired");

		oWrapper.getListBinding.returns(null);
		vResult = oFieldHelp.getKeyForText("Item 4");
		assert.ok(vResult instanceof Promise, "Promise returned");
		assert.ok(bDataRequested, "dataRequested event fired");

		var fnDone = assert.async();
		vResult.then(function(vResult) {
			assert.equal(vResult.key, "I4", "key for text");
			assert.deepEqual(vResult.inParameters, {testIn: "In4"} , "In-parameters in result");
			assert.deepEqual(vResult.outParameters, {test: "Out4"} , "Out-parameters in result");

			vResult = oFieldHelp.getKeyForText("Item 5");
			assert.ok(vResult instanceof Promise, "Promise returned");

			vResult.then(function(vResult) {
				assert.notOk(true, "Promise Then must not be called");
				fnDone();
			}).catch(function(oError) {
				assert.ok(true, "Promise Catch called");
				fnDone();
			});
		});

	});

	QUnit.test("getKeyForText with async contentRequest of delegate", function(assert) {

		var fnResolve;
		var oPromise = new Promise(function(fnMyResolve, fnMyReject) {
			fnResolve = fnMyResolve;
		});
		sinon.stub(FieldValueHelpDelegate, "contentRequest").returns(oPromise);

		// different calls before promise is resolved
		var vResult1 = oFieldHelp.getKeyForText("Item 1");
		assert.ok(vResult1 instanceof Promise, "Test1: Promise returned");

		var vResult2 = oFieldHelp.getKeyForText("Item 1"); // same promise should be returned
		assert.equal(vResult1, vResult2, "Test2: Same promise returned for same request");

		oFieldHelp.addInParameter(new InParameter({value: "{/testIn}", helpPath: "myTestIn"}));
		oFieldHelp.addOutParameter(new OutParameter({value: "{/test}", helpPath: "myTest"}));
		var vResult3 = oFieldHelp.getKeyForText("Item 2");
		assert.ok(vResult3 instanceof Promise, "Test3: Promise returned");

		var vResult4 = oFieldHelp.getKeyForText("Item 4");
		assert.ok(vResult4 instanceof Promise, "Test4: Promise returned");

		var vResult5 = oFieldHelp.getKeyForText("Item 5");
		assert.ok(vResult5 instanceof Promise, "Test5: Promise returned");

		var vResult6 = oFieldHelp.getKeyForText("X");
		assert.ok(vResult6 instanceof Promise, "Test6: Promise returned");

		assert.notOk(bDataRequested, "dataRequested event not fired");

		FieldValueHelpDelegate.contentRequest.restore();
		fnResolve();
		var fnDone = assert.async();
		var iFinished = 0;

		vResult1.then(function(vResult) {
			assert.ok(true, "Test1+2: Promise Then must be called");
			assert.equal(vResult, "I1", "Test1+2: key for text");
			iFinished++;
		}).catch(function(oError) {
			assert.notOk(true, "Test1+2: Promise Catch must not be called");
			iFinished++;
		});

		vResult3.then(function(vResult) {
			assert.ok(true, "Test3: Promise Then must be called");
			assert.ok(oWrapper.getKeyForText.calledWith("Item 2"), "Test3: getKeyForText of Wrapper called");
			assert.deepEqual(vResult.inParameters, {testIn: "In2"} , "Test3: In-parameters in result");
			assert.deepEqual(vResult.outParameters, {test: "Out2"} , "Test3: Out-parameters in result");
			iFinished++;
		}).catch(function(oError) {
			assert.notOk(true, "Test3: Promise Catch must not be called");
			iFinished++;
		});

		vResult4.then(function(vResult) {
			assert.ok(true, "Test4: Promise Then must be called");
			assert.equal(vResult.key, "I4", "Test4: key for text");
			assert.deepEqual(vResult.inParameters, {testIn: "In4"} , "Test4: In-parameters in result");
			assert.deepEqual(vResult.outParameters, {test: "Out4"} , "Test4: Out-parameters in result");
			iFinished++;
		}).catch(function(oError) {
			assert.notOk(true, "Test4: Promise Catch must not be called");
			iFinished++;
		});

		vResult5.then(function(vResult) {
			assert.notOk(true, "Test5: Promise Then must not be called");
			iFinished++;
		}).catch(function(oError) {
			assert.ok(true, "Test5: Promise Catch must be called");
			iFinished++;
		});

		vResult6.then(function(vResult) {
			assert.ok(true, "Test6: Promise Then must be called");
			assert.notOk(vResult, "Test6: key for not existing text");
			iFinished++;
		}).catch(function(oError) {
			assert.notOk(true, "Test6: Promise Catch must not be called");
			iFinished++;
		});

		setTimeout( function(){ // as promise is resolves async
			assert.notOk(bDataRequested, "dataRequested event not fired as content exist");
			assert.equal(iFinished, 5, "All promises finished");
			fnDone();
		}, 0);

	});

	QUnit.test("_getTextOrKey - bNoRequest", function(assert) {

		// all other parameters are testet with getTextForKey and getKeyForText
		var vResult = oFieldHelp._getTextOrKey("I1", true, undefined, undefined, undefined, false);
		assert.equal(vResult, "Item 1", "Text for key");
		assert.ok(oWrapper.getTextForKey.calledWith("I1", undefined, undefined, false), "getTextForKey of Wrapper called");
		oWrapper.getTextForKey.resetHistory();

		vResult = oFieldHelp._getTextOrKey("Item 1", false, undefined, undefined, undefined, false);
		assert.equal(vResult, "I1", "key for text");
		assert.ok(oWrapper.getKeyForText.calledWith("Item 1", undefined, false), "getKeyForText of Wrapper called");
		oWrapper.getKeyForText.resetHistory();

		vResult = oFieldHelp._getTextOrKey("I1", true, undefined, undefined, undefined, true);
		assert.equal(vResult, "Item 1", "Text for key");
		assert.ok(oWrapper.getTextForKey.calledWith("I1", undefined, undefined, true), "getTextForKey of Wrapper called");
		oWrapper.getTextForKey.resetHistory();

		vResult = oFieldHelp._getTextOrKey("Item 1", false, undefined, undefined, undefined, true);
		assert.equal(vResult, "I1", "key for text");
		assert.ok(oWrapper.getKeyForText.calledWith("Item 1", undefined, true), "getKeyForText of Wrapper called");
		oWrapper.getKeyForText.resetHistory();

	});

	QUnit.test("_isTextOrKeyRequestSupported", function(assert) {

		assert.ok(oFieldHelp._isTextOrKeyRequestSupported(), "_isTextOrKeyRequestSupported returns true");

		oWrapper.destroy();
		assert.notOk(oFieldHelp._isTextOrKeyRequestSupported(), "_isTextOrKeyRequestSupported returns false if no wrapper");

	});

	QUnit.test("onFieldChange", function(assert) {

		var oOutParameter = new OutParameter({value: "{/test}", helpPath: "myTest"});
		oFieldHelp.addOutParameter(oOutParameter);
		var oCondition = Condition.createItemCondition("Test", "Test Text", undefined, {"test": "Test"});
		oFieldHelp.setConditions([oCondition]);

		oFieldHelp.onFieldChange();
		assert.equal(oOutParameter.getValue(), "Test", "Out-parameter updated");

		oOutParameter.destroy();
		oOutParameter = new OutParameter({value: "{/test}", helpPath: "myTest", mode: "WhenEmpty"});
		oFieldHelp.addOutParameter(oOutParameter);
		oCondition = Condition.createItemCondition("Test2", "Test Text2", undefined, {"test": "Test2"});
		oFieldHelp.setConditions([oCondition]);

		oFieldHelp.onFieldChange();
		assert.equal(oOutParameter.getValue(), "Test", "Out-parameter not updated");

		oOutParameter.destroy();
		oOutParameter = new OutParameter({value: "{/test}", fixedValue: "X"});
		oFieldHelp.addOutParameter(oOutParameter);
		oFieldHelp.onFieldChange();
		assert.equal(oOutParameter.getValue(), "X", "Out-parameter updated");

		oOutParameter.destroy();

	});

	QUnit.test("onFieldChange using conditions in OutParameter", function(assert) {

		var oOutParameter = new OutParameter({value: "{cm>/conditions/test}", helpPath: "myTest"});
		var oCM = new ConditionModel();
		oOutParameter.setModel(oCM, "cm");
		oFieldHelp.addOutParameter(oOutParameter);
		var oCondition = Condition.createItemCondition("Test", "Test Text", undefined, {"test": "Test"});
		var oCondition2 = Condition.createItemCondition("Test2", "Test Text2", undefined, {"test": "Test2"});
		oFieldHelp.setConditions([oCondition, oCondition2]);

		oFieldHelp.onFieldChange();
		var vValue = oOutParameter.getValue();
		assert.ok(Array.isArray(vValue), "OutParameter contains array");
		assert.equal(vValue.length, 2, "Out-parameter 2 entries");
		assert.equal(vValue[0].operator, "EQ", "Out-parameter[0] operator");
		assert.equal(vValue[0].values[0], "Test", "Out-parameter[0] value");
		assert.equal(vValue[0].validated, ConditionValidated.Validated, "OutParameter[0] is validated");
		assert.equal(vValue[1].operator, "EQ", "Out-parameter[1] operator");
		assert.equal(vValue[1].values[0], "Test2", "Out-parameter[1] value");
		assert.equal(vValue[1].validated, ConditionValidated.Validated, "OutParameter[1] is validated");
		var aConditions = oCM.getConditions("test");
		assert.equal(aConditions.length, 2, "ConditionModel 2 entries");

		oOutParameter.destroy();
		oOutParameter = new OutParameter({value: "{cm>/conditions/test}", helpPath: "myTest", mode: "WhenEmpty"});
		oOutParameter.setModel(oCM, "cm");
		oFieldHelp.addOutParameter(oOutParameter);
		oFieldHelp.setConditions([oCondition]);

		oFieldHelp.onFieldChange();
		vValue = oOutParameter.getValue();
		assert.ok(Array.isArray(vValue), "OutParameter contains array");
		assert.equal(vValue.length, 2, "Out-parameter 2 entries");
		assert.equal(vValue[0].operator, "EQ", "Out-parameter[0] operator");
		assert.equal(vValue[0].values[0], "Test", "Out-parameter[0] value");
		assert.equal(vValue[0].validated, ConditionValidated.Validated, "OutParameter[0] is validated");
		assert.equal(vValue[1].operator, "EQ", "Out-parameter[1] operator");
		assert.equal(vValue[1].values[0], "Test2", "Out-parameter[1] value");
		assert.equal(vValue[1].validated, ConditionValidated.Validated, "OutParameter[1] is validated");
		aConditions = oCM.getConditions("test");
		assert.equal(aConditions.length, 2, "ConditionModel 2 entries");

		oOutParameter.destroy();
		oCM.removeAllConditions("test");
		oOutParameter = new OutParameter({value: "{cm>/conditions/test}", fixedValue: "X"});
		oOutParameter.setModel(oCM, "cm");
		oFieldHelp.addOutParameter(oOutParameter);
		oCondition = Condition.createItemCondition("Test", "Test Text", undefined, {"test": "Test"});
		oFieldHelp.setConditions([oCondition]);
		oFieldHelp.onFieldChange();
		vValue = oOutParameter.getValue();
		assert.ok(Array.isArray(vValue), "OutParameter contains array");
		assert.equal(vValue.length, 1, "Out-parameter 1 entry");
		assert.equal(vValue[0].operator, "EQ", "Out-parameter[0] operator");
		assert.equal(vValue[0].values[0], "X", "Out-parameter[0] value");
		assert.equal(vValue[0].validated, ConditionValidated.Validated, "OutParameter[0] is validated");
		aConditions = oCM.getConditions("test");
		assert.equal(aConditions.length, 1, "ConditionModel 1 entry");

		oOutParameter.destroy();
		oCM.destroy();

	});

	QUnit.test("getRoleDescription", function(assert) {

		assert.strictEqual(oFieldHelp.getRoleDescription(), null, "no role description returned as default");

		oFieldHelp.connect(oField2);
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		var sText = oResourceBundle.getText("MULTICOMBOBOX_ARIA_ROLE_DESCRIPTION");

		assert.strictEqual(oFieldHelp.getRoleDescription(), sText, "no role description returned for multi-combobox");

	});

	QUnit.module("Connect", {
		beforeEach: _initFieldHelp,
		afterEach: _teardown
	});

	QUnit.test("getMaxConditions", function(assert) {

		assert.equal(oFieldHelp.getMaxConditions(), 1, "getMaxConditions default");

		oFieldHelp.connect(oField2);
		assert.equal(oFieldHelp.getMaxConditions(), -1, "MaxConditions taken from Field");

	});

	QUnit.test("getDisplay", function(assert) {

		assert.notOk(oFieldHelp.getDisplay(), "getDisplay default");

		oFieldHelp.connect(oField2);
		assert.equal(oFieldHelp.getDisplay(), "Value", "Display taken from Field");

	});

	QUnit.test("getRequired", function(assert) {

		assert.equal(oFieldHelp.getRequired(), false, "getRequired default");

		oFieldHelp.connect(oField2);
		assert.equal(oFieldHelp.getRequired(), true, "Required taken from Field");

	});

	QUnit.test("getDataType", function(assert) {

		assert.equal(oFieldHelp.getDataType(), "sap.ui.model.type.String", "getDataType default");

		oFieldHelp.connect(oField2);
		assert.equal(oFieldHelp.getDataType(), "Edm.String", "DataType taken from Field");

	});

	QUnit.test("_getFormatOptions", function(assert) {

		assert.ok(oFieldHelp._getFormatOptions(), "FormatOptions returned");
		assert.deepEqual(oFieldHelp._getFormatOptions(), oField._getFormatOptions(), "FormatOptions taken from Field");

		oFieldHelp.connect();
		assert.ok(oFieldHelp._getFormatOptions(), "FormatOptions returned default");
		assert.deepEqual(oFieldHelp._getFormatOptions(), {}, "_getFormatOptions is empty object per default");

	});

	QUnit.test("_getKeyPath", function(assert) {

		assert.equal(oFieldHelp._getKeyPath(), "key", "_getKeyPath");

		oFieldHelp.setKeyPath("MyKey");
		assert.equal(oFieldHelp._getKeyPath(), "MyKey", "_getKeyPath");

	});

	QUnit.module("Suggestion", {
		beforeEach: function() {
			_initFieldHelp();
			oClock = sinon.useFakeTimers();
		},
		afterEach: _teardown
	});

	QUnit.test("content display in suggestion", function(assert) {

		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time

		var oPopover = oFieldHelp.getAggregation("_popover");
		assert.ok(oPopover, "Popover created");
		if (oPopover) {
			assert.equal(iOpen, 1, "Open event fired");
			assert.ok(bOpenSuggest, "Open as suggestion");
			assert.ok(oPopover.isOpen(), "Popover is open");
			assert.ok(oFieldHelp.isOpen(), "FieldHelp is open");
			assert.ok(oWrapper.initialize.called, "Wrapper.initialize is called");
			assert.ok(oWrapper.fieldHelpOpen.calledWith(true), "fieldHelpOpen of Wrapper called");
			assert.ok(oWrapper.getSuggestionContent.called, "Wrapper.getSuggestionContent is called");
			assert.notOk(oWrapper.getDialogContent.called, "Wrapper.getDialogContent is not called");
			var oContent = oPopover._getAllContent()[0];
			assert.ok(oContent, "Popover has content");
			assert.equal(oContent.getId(), "SC1", "content is Popover content");
			assert.equal(iDataUpdate, 1, "DataUpdate event fired");
			assert.equal(oPopover.getInitialFocus(), "I1", "Initial focus on Field");
			var oScrollDelegate1 = oFieldHelp.getScrollDelegate();
			var oScrollDelegate2 = oPopover.getScrollDelegate();
			assert.equal(oScrollDelegate1, oScrollDelegate2, "oScrollDelegate of Popover used");
		}
		oFieldHelp.close();
		oClock.tick(iPopoverDuration); // fake closing time

		assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");

	});

	QUnit.test("toggleOpen in suggestion with async loading of Popover", function(assert) {

		var oStub = sinon.stub(sap.ui, "require");
		oStub.withArgs("sap/m/Popover").onFirstCall().returns(undefined);
		oStub.callThrough();

		oClock.restore(); // as we need a timeout to test async loading of Popover
		oFieldHelp.toggleOpen(true);
		var fnDone = assert.async();
		setTimeout( function(){ // to wait until Popover is loaded
			oClock = sinon.useFakeTimers(); // now we can use fake timer again
			oClock.tick(iPopoverDuration); // fake opening time

			var oPopover = oFieldHelp.getAggregation("_popover");
			if (oPopover) {
				assert.equal(iOpen, 1, "Open event fired");
				assert.ok(bOpenSuggest, "Open as suggestion");
				assert.ok(oPopover.isOpen(), "Popover is open");
				oFieldHelp.toggleOpen(true);
				oClock.tick(iPopoverDuration); // fake closing time

				assert.notOk(oPopover.isOpen(), "Popover is not open");
				fnDone();
			}
		}, 0);

		oStub.restore();

	});

	QUnit.test("FilterValue in suggestion", function(assert) {

		oFieldHelp.setFilterValue("It");
		oFieldHelp.open(true);

		oClock.tick(iPopoverDuration); // fake opening time
		assert.ok(oWrapper.getFilterEnabled.called, "Wrapper.getFilterEnabled is called");
		assert.notOk(oWrapper.getListBinding.called, "Wrapper.getListBinding is not called");
		assert.ok(oWrapper.applyFilters.called, "Wrapper.applyFilters is called");
		assert.notOk(sSearch, "No $search used");
		var oCheckFilters = {text: [{operator: "StartsWith", value: "It", value2: undefined}], additionalText: [{operator: "StartsWith", value: "It", value2: undefined}]};
		assert.deepEqual(oFilters, oCheckFilters, "Filters used");
		oFieldHelp.setFilterValue("X");
		oClock.tick(0); // fake update binding timeout
		assert.notOk(sSearch, "No $search used");
		oCheckFilters = {text: [{operator: "StartsWith", value: "X", value2: undefined}], additionalText: [{operator: "StartsWith", value: "X", value2: undefined}]};
		assert.deepEqual(oFilters, oCheckFilters, "Filters used");

		oFieldHelp.setFilterValue();
		var oInParameter = new InParameter({ value: "Text 2", helpPath: "additionalText"});
		oFieldHelp.addInParameter(oInParameter);
		oClock.tick(0); // fake update binding timeout
		assert.notOk(sSearch, "No $search used");
		oCheckFilters = {additionalText: [{operator: "EQ", value: "Text 2", value2: undefined}]};
		assert.deepEqual(oFilters, oCheckFilters, "Filters used");

		oInParameter.setValue("Text 3");
		oClock.tick(0); // fake update binding timeout
		assert.notOk(sSearch, "No $search used");
		oCheckFilters = {additionalText: [{operator: "EQ", value: "Text 3", value2: undefined}]};
		assert.deepEqual(oFilters, oCheckFilters, "Filters used");

		oInParameter.setValue("XXX");
		oInParameter.setHelpPath("filter");
		oClock.tick(0); // fake update binding timeout
		assert.notOk(sSearch, "No $search used");
		oCheckFilters = {filter: [{operator: "EQ", value: "XXX", value2: undefined}]};
		assert.deepEqual(oFilters, oCheckFilters, "Filters used");

		oFieldHelp.close();

		// filter change while closing -> not executed but on reopen
		sSearch = undefined;
		oFilters = undefined;
		oWrapper.applyFilters.resetHistory();
		oFieldHelp.setFilterValue("It");
		oFieldHelp.destroyInParameters();
		oClock.tick(iPopoverDuration); // fake closing time
		assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");
		assert.notOk(oWrapper.applyFilters.called, "Wrapper.applyFilters not called");
		var aConditions = oFieldHelp._oFilterConditionModel.getConditions(oFieldHelp.getFilterFields());
		assert.equal(aConditions.length, 0, "No filter conditions created");

		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time
		assert.ok(oWrapper.applyFilters.called, "Wrapper.applyFilters is called");
		oCheckFilters = {text: [{operator: "StartsWith", value: "It", value2: undefined}], additionalText: [{operator: "StartsWith", value: "It", value2: undefined}]};
		assert.deepEqual(oFilters, oCheckFilters, "Filters used");

		oFieldHelp.close();
		oClock.tick(iPopoverDuration); // fake closing time

	});

	QUnit.test("FilterValue in suggestion using $search (with async loading of ConditionModel)", function(assert) {

		var oStub = sinon.stub(sap.ui, "require");
		oStub.withArgs("sap/ui/mdc/condition/ConditionModel").onFirstCall().returns(undefined);
		oStub.callThrough();

		oClock.restore(); // as we need a timeout to test async loading of Popover

		oFieldHelp.setFilterFields("$search");
		oFieldHelp.setFilterValue("It");
		oFieldHelp.open(true);

		var fnDone = assert.async();
		setTimeout( function(){ // to wait until ConditionModel is loaded
			setTimeout( function(){ // to wait until ConditionModel binding is updated
				oClock = sinon.useFakeTimers(); // now we can use fake timer again
				oClock.tick(iPopoverDuration); // fake opening time
				assert.ok(oWrapper.getFilterEnabled.called, "Wrapper.getFilterEnabled is called");
				assert.notOk(oWrapper.getListBinding.called, "Wrapper.getListBinding is not called");
				assert.ok(oWrapper.applyFilters.called, "Wrapper.applyFilters is called");
				assert.equal(sSearch, "It", "No $search used");
				var oCheckFilters = {};
				assert.deepEqual(oFilters, oCheckFilters, "Filters used");
				oFieldHelp.setFilterValue("X");

				oFieldHelp.close();
				oClock.tick(iPopoverDuration); // fake closing time
				assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");
				fnDone();
			}, 0);
		}, 0);

		oStub.restore();

	});

	QUnit.test("FilterValue in suggestion with conditions in InParameters", function(assert) {

		var oInParameter = new InParameter({
			helpPath: "filter"
		});
		oFieldHelp.addInParameter(oInParameter);
		oInParameter = new InParameter({
			value: [Condition.createCondition("EQ", ["Text 2"]), Condition.createCondition("EQ", ["Text 3"], {filter: "XXX"})],
			helpPath: "additionalText"
		});
		oFieldHelp.addInParameter(oInParameter);
		oFieldHelp.setFilterValue("It");

		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time
		var oCheckFilters = {
				text: [{operator: "StartsWith", value: "It", value2: undefined}],
				additionalText: [{operator: "StartsWith", value: "It", value2: undefined}, {operator: "EQ", value: "Text 2", value2: undefined}, {operator: "EQ", value: "Text 3", value2: undefined}],
				filter: [{operator: "EQ", value: "XXX", value2: undefined}]};
		assert.deepEqual(oFilters, oCheckFilters, "Filters used");

		oInParameter.destroy();
		oClock.tick(0); // fake update binding timeout
		oCheckFilters = {text: [{operator: "StartsWith", value: "It", value2: undefined}], additionalText: [{operator: "StartsWith", value: "It", value2: undefined}]};
		assert.deepEqual(oFilters, oCheckFilters, "Filters used");

		oFieldHelp.close();
		oClock.tick(iPopoverDuration); // fake closing time
		assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");

	});

	QUnit.test("FilterValue in suggestion with pending InParameters", function(assert) {

		var fnResolve;
		var oPromise = new Promise(function(fnMyResolve, fnMyReject) {
			fnResolve = fnMyResolve;
		});
		sinon.stub(FieldValueHelpDelegate, "checkBindingsPending").returns(oPromise);

		var oInParameter = new InParameter({value: "{/test}", helpPath: "filter"});
		oFieldHelp.addInParameter(oInParameter);
		oFieldHelp.setFilterValue("I");
		var oCheckFilters = {
				text: [{operator: "StartsWith", value: "It", value2: undefined}],
				additionalText: [{operator: "StartsWith", value: "It", value2: undefined}],
				filter: [{operator: "EQ", value: "Hello", value2: undefined}]};

		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time
		assert.notOk(oFilters, "no Filter request right now");

		oFieldHelp.setFilterValue("It");
		oClock.tick(1); // fake model update time

		FieldValueHelpDelegate.checkBindingsPending.restore();
		fnResolve();
		var fnDone = assert.async();

		oPromise.then(function() {
			oClock.tick(1); // fake model update time
			assert.deepEqual(oFilters, oCheckFilters, "Filters used");
			assert.ok(oWrapper.applyFilters.calledOnce, "only one filter request triggered");

			oFieldHelp.close();
			oClock.tick(iPopoverDuration); // fake closing time
			assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");
			fnDone();
		});

	});

	QUnit.test("FilterValue in suggestion with suspended ListBinding", function(assert) {

		oListBinding.suspend();

		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time

		assert.notOk(oListBinding.isSuspended(), "ListBinding not suspended after open without suggestion");

		oListBinding.suspend();
		oFieldHelp.setFilterValue("It");
		oClock.tick(0); // fake update binding timeout
		assert.notOk(oListBinding.isSuspended(), "ListBinding not suspended after setting filterValue");

		oFieldHelp.close();
		oClock.tick(iPopoverDuration); // fake closing time

	});

	QUnit.test("navigate in suggestion", function(assert) {

		sinon.spy(oFieldHelp, "isFocusInHelp");
		oFieldHelp.navigate(1);
		assert.ok(oWrapper.navigate.calledWith(1), "Wrapper.navigate called");
		assert.equal(iOpen, 1, "Open event fired");
		oClock.tick(iPopoverDuration); // fake opening time

		oWrapper.fireNavigate({key: "I1", description: "Item 1", itemId: "Item1"});
		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			assert.ok(bOpenSuggest, "Open as suggestion");
			assert.ok(oPopover.isOpen(), "Field help opened");
			assert.equal(iNavigate, 1, "Navigate event fired");
			assert.equal(sNavigateValue, "Item 1", "Navigate event value");
			assert.equal(sNavigateKey, "I1", "Navigate event key");
			assert.ok(oNavigateCondition, "NavigateEvent condition");
			assert.equal(oNavigateCondition.operator, "EQ", "NavigateEvent condition operator");
			assert.equal(oNavigateCondition.values[0], "I1", "NavigateEvent condition key");
			assert.equal(oNavigateCondition.values[1], "Item 1", "NavigateEvent condition description");
			assert.notOk(oNavigateCondition.hasOwnProperty("inParameters"), "no in-parameters set");
			assert.notOk(oNavigateCondition.hasOwnProperty("outParameters"), "no out-parameters set");
			assert.equal(oNavigateCondition.validated, ConditionValidated.Validated, "Condition is validated");
			assert.notOk(oFieldHelp.isFocusInHelp.returnValues[0], "isFocusInHelp returns false");
			assert.equal(sNavigateItemId, "Item1", "Navigate itemId");
			oFieldHelp.isFocusInHelp.reset();

			oFieldHelp.addInParameter(new InParameter({value: "{testIn}", helpPath: "myTestIn"}));
			oFieldHelp.addOutParameter(new OutParameter({value: "{testOut}", helpPath: "myTestOut"}));
			oFieldHelp.navigate(1);
			oWrapper.fireNavigate({key: "I2", description: "Item 2", inParameters: {myTestIn: "X"}, outParameters: {myTestOut: "Y"}, itemId: "Item2"});
			assert.equal(iNavigate, 2, "Navigate event fired");
			assert.equal(sNavigateValue, "Item 2", "Navigate event value");
			assert.equal(sNavigateKey, "I2", "Navigate event key");
			assert.ok(oNavigateCondition, "NavigateEvent condition");
			assert.ok(oNavigateCondition.hasOwnProperty("inParameters"), "in-parameters set");
			assert.ok(oNavigateCondition.inParameters && oNavigateCondition.inParameters.hasOwnProperty("testIn"), "in-parameters has 'testIn'");
			assert.equal(oNavigateCondition.inParameters && oNavigateCondition.inParameters.testIn, "X", "in-parameters 'testIn'");
			assert.ok(oNavigateCondition.hasOwnProperty("outParameters"), "out-parameters set");
			assert.ok(oNavigateCondition.outParameters && oNavigateCondition.outParameters.hasOwnProperty("testOut"), "out-parameters has 'testOut'");
			assert.equal(oNavigateCondition.outParameters && oNavigateCondition.outParameters.testOut, "Y", "out-parameters 'testOut'");
			assert.equal(sNavigateItemId, "Item2", "Navigate itemId");
		}
		oFieldHelp.close();
		oClock.tick(iPopoverDuration); // fake closing time

		iNavigate = 0;
		oFieldHelp.navigate(1);
		oClock.tick(iPopoverDuration); // fake opening time
		oWrapper.fireNavigate();
		assert.equal(iNavigate, 0, "Navigate event not fired");
		assert.ok(oFieldHelp.isFocusInHelp.returnValues[0], "isFocusInHelp returns true");

		assert.ok(oPopover.isOpen(), "Field help opened");
		oFieldHelp.close();
		oClock.tick(iPopoverDuration); // fake closing time
		assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");

	});

	QUnit.test("navigate in suggestion (with async loading of Popover)", function(assert) {

		oClock.restore(); // as we need a timeout to test async loading of Popover

		var oStub = sinon.stub(sap.ui, "require");
		oStub.withArgs("sap/m/Popover").onFirstCall().returns(undefined);
		oStub.callThrough();

		oFieldHelp.navigate(1);
		var fnDone = assert.async();
		setTimeout( function(){ // to wait until Popover is loaded
			oClock = sinon.useFakeTimers(); // now we can use fake timer again
			oClock.tick(iPopoverDuration); // fake opening time

			assert.ok(oWrapper.navigate.calledWith(1), "Wrapper.navigate called");
			assert.equal(iOpen, 1, "Open event fired");
			var oPopover = oFieldHelp.getAggregation("_popover");
			if (oPopover) {
				oWrapper.fireNavigate({key: "I1", description: "Item 1", itemId: "Item1"});
				assert.ok(bOpenSuggest, "Open as suggestion");
				assert.ok(oPopover.isOpen(), "Field help opened");
				assert.equal(iNavigate, 1, "Navigate event fired");
				assert.equal(sNavigateValue, "Item 1", "Navigate event value");
				assert.equal(sNavigateKey, "I1", "Navigate event key");
				assert.ok(oNavigateCondition, "NavigateEvent condition");
				assert.equal(oNavigateCondition.operator, "EQ", "NavigateEvent condition operator");
				assert.equal(oNavigateCondition.values[0], "I1", "NavigateEvent condition key");
				assert.equal(oNavigateCondition.values[1], "Item 1", "NavigateEvent condition description");
				assert.equal(oNavigateCondition.validated, ConditionValidated.Validated, "Condition is validated");
				assert.equal(sNavigateItemId, "Item1", "Navigate itemId");
			}
			oFieldHelp.close();
			oClock.tick(iPopoverDuration); // fake closing time
			assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");
			fnDone();
		}, 0);

		oStub.restore();

	});

	QUnit.test("navigate in suggestion with suspended ListBinding", function(assert) {

		oListBinding.suspend();
		oFieldHelp.navigate(1);
		oClock.tick(0); // fake update binding timeout

		assert.notOk(oListBinding.isSuspended(), "ListBinding not suspended after navigate");
		assert.ok(oWrapper.navigate.calledWith(1), "Wrapper.navigate called");
		assert.equal(iOpen, 1, "Open event fired");
		oWrapper.fireNavigate({key: "I1", description: "Item 1"});
		oClock.tick(iPopoverDuration); // fake opening time

		oFieldHelp.close();
		oClock.tick(iPopoverDuration); // fake closing time
		assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");

	});

	QUnit.test("select item in suggestion", function(assert) {

		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time
		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			oWrapper.fireSelectionChange({selectedItems: [{key: "I2", description: "Item 2"}]});
			oClock.tick(iPopoverDuration); // fake closing time

			assert.equal(iSelect, 1, "Select event fired");
			assert.equal(aSelectConditions.length, 1, "one condition returned");
			assert.equal(aSelectConditions[0].operator, "EQ", "Condition operator");
			assert.equal(aSelectConditions[0].values[0], "I2", "Condition values[0}");
			assert.equal(aSelectConditions[0].values[1], "Item 2", "Condition values[1}");
			assert.notOk(aSelectConditions[0].inParameters, "Condition no in-parameters");
			assert.notOk(aSelectConditions[0].outParameters, "Condition no out-parameters");
			assert.equal(aSelectConditions[0].validated, ConditionValidated.Validated, "Condition is validated");
			assert.ok(bSelectAdd, "Items should be added");
			assert.ok(bSelectClose, "FieldHelp closed in Event as MaxConditions = 1");
			assert.notOk(oPopover.isOpen(), "Field help closed");
		}

	});

	QUnit.test("select multiple items in suggestion", function(assert) {

		oFieldHelp.connect(oField2);
		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time
		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			sinon.spy(oPopover, "close");
			oWrapper.fireSelectionChange({selectedItems: [{key: "I2", description: "Item 2"}]});
			assert.equal(iSelect, 1, "Select event fired");
			assert.equal(aSelectConditions.length, 1, "one condition returned");
			assert.equal(aSelectConditions[0].operator, "EQ", "Condition operator");
			assert.equal(aSelectConditions[0].values[0], "I2", "Condition values[0}");
			assert.equal(aSelectConditions[0].values[1], "Item 2", "Condition values[1}");
			assert.notOk(aSelectConditions[0].inParameters, "Condition no in-parameters");
			assert.notOk(aSelectConditions[0].outParameters, "Condition no out-parameters");
			assert.equal(aSelectConditions[0].validated, ConditionValidated.Validated, "Condition is validated");
			assert.notOk(bSelectAdd, "Items should not be added");
			assert.notOk(bSelectClose, "FieldHelp not closed in Event");
			assert.notOk(oPopover.close.called, "Field help not closed");

			oWrapper.fireSelectionChange({selectedItems: [{key: "I2", description: "Item 2"}, {key: "I1", description: "Item 1"}], itemPress: true});
			oClock.tick(iPopoverDuration); // fake closing time

			assert.equal(iSelect, 2, "Select event fired");
			assert.equal(aSelectConditions.length, 2, "two conditions returned");
			assert.equal(aSelectConditions[0].operator, "EQ", "Condition0 operator");
			assert.equal(aSelectConditions[0].values[0], "I2", "Condition0 values[0}");
			assert.equal(aSelectConditions[0].values[1], "Item 2", "Condition0 values[1}");
			assert.notOk(aSelectConditions[0].inParameters, "Condition0 no in-parameters");
			assert.notOk(aSelectConditions[0].outParameters, "Condition0 no out-parameters");
			assert.equal(aSelectConditions[0].validated, ConditionValidated.Validated, "Condition0 is validated");
			assert.equal(aSelectConditions[1].operator, "EQ", "Condition1 operator");
			assert.equal(aSelectConditions[1].values[0], "I1", "Condition1 values[0}");
			assert.equal(aSelectConditions[1].values[1], "Item 1", "Condition1 values[1}");
			assert.notOk(aSelectConditions[1].inParameters, "Condition1 no in-parameters");
			assert.notOk(aSelectConditions[1].outParameters, "Condition1 no out-parameters");
			assert.equal(aSelectConditions[1].validated, ConditionValidated.Validated, "Condition1 is validated");
			assert.notOk(bSelectAdd, "Items should not be added");
			assert.ok(bSelectClose, "FieldHelp closed in Event");
			assert.ok(oPopover.close.called, "Field help closed");
		}

	});

	QUnit.test("select item in suggestion using in/out-parameters", function(assert) {

		oFieldHelp.addInParameter(new InParameter({value: "{testIn}", helpPath: "myTestIn"}));
		oFieldHelp.addOutParameter(new OutParameter({value: "{testOut}", helpPath: "myTestOut"}));
		oFieldHelp.addOutParameter(new OutParameter({value: "{testOut2}", fixedValue: "Z"}));
		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time
		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			oWrapper.fireSelectionChange({selectedItems: [{key: "I2", description: "Item 2", inParameters: {myTestIn: "X"}, outParameters: {myTestOut: "Y"}}]});
			oClock.tick(iPopoverDuration); // fake closing time

			assert.equal(iSelect, 1, "Select event fired");
			assert.equal(aSelectConditions.length, 1, "one condition returned");
			assert.equal(aSelectConditions[0].operator, "EQ", "Condition operator");
			assert.equal(aSelectConditions[0].values[0], "I2", "Condition values[0}");
			assert.equal(aSelectConditions[0].values[1], "Item 2", "Condition values[1}");
			assert.ok(aSelectConditions[0].inParameters, "Condition in-parameters set");
			assert.ok(aSelectConditions[0].inParameters && aSelectConditions[0].inParameters.hasOwnProperty("testIn"), "Condition in-parameters has 'testIn'");
			assert.equal(aSelectConditions[0].inParameters && aSelectConditions[0].inParameters.testIn, "X", "Condition in-parameters 'test'");
			assert.ok(aSelectConditions[0].outParameters, "Condition out-parameters set");
			assert.ok(aSelectConditions[0].outParameters && aSelectConditions[0].outParameters.hasOwnProperty("testOut"), "Condition out-parameters has 'testOut'");
			assert.equal(aSelectConditions[0].outParameters && aSelectConditions[0].outParameters.testOut, "Y", "Condition out-parameters 'test'");
			assert.ok(aSelectConditions[0].outParameters && aSelectConditions[0].outParameters.hasOwnProperty("testOut2"), "Condition out-parameters has 'testOut2'");
			assert.equal(aSelectConditions[0].outParameters && aSelectConditions[0].outParameters.testOut2, "Z", "Condition out-parameters 'test'");
			assert.equal(aSelectConditions[0].validated, ConditionValidated.Validated, "Condition is validated");
			assert.ok(bSelectAdd, "Items should be added");
			assert.ok(bSelectClose, "FieldHelp closed in Event as MaxConditions = 1");
			assert.notOk(oPopover.isOpen(), "Field help closed");
		}

	});

	QUnit.test("noDialog open", function(assert) {

		oFieldHelp.setNoDialog(true);
		oFieldHelp.open(false);
		oClock.tick(iPopoverDuration); // fake opening time

		var oPopover = oFieldHelp.getAggregation("_popover");
		var oDialog = oFieldHelp.getAggregation("_dialog");
		assert.ok(oPopover, "Popover created");
		assert.notOk(oDialog, "no dialog created");
		if (oPopover) {
			assert.equal(iOpen, 1, "Open event fired");
			assert.ok(bOpenSuggest, "Open as suggestion");
			assert.ok(oPopover.isOpen(), "Popover is open");
			assert.ok(oWrapper.getSuggestionContent.called, "Wrapper.getSuggestionContent is called");
			assert.notOk(oWrapper.getDialogContent.called, "Wrapper.getDialogContent is not called");
		}

		oFieldHelp.toggleOpen();
		oClock.tick(iPopoverDuration); // fake closing time
		assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");

	});

	QUnit.test("assign wrapper while opening", function(assert) {

		oFieldHelp.setContent();
		oFieldHelp.attachOpen(function(){
			setTimeout( function(){ // do async
				if (!oFieldHelp.getContent()) {
					oFieldHelp.setContent(oWrapper);
				}
			}, 0);
		});

		iDataUpdate = 0;
		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time

		var oPopover = oFieldHelp.getAggregation("_popover");
		var oContent = oPopover && oPopover._getAllContent()[0];

		assert.ok(oPopover && oPopover.isOpen(), "Popover is open");
		assert.ok(oWrapper.getSuggestionContent.called, "Wrapper.getSuggestionContent is called");
		assert.ok(oContent, "Popover has content");
		assert.equal(oContent.getId(), "SC1", "content is Popover content");
		assert.equal(iDataUpdate, 1, "DataUpdate event fired");

		oFieldHelp.close();
		oClock.tick(iPopoverDuration); // fake closing time

		// test same but popover already exist
		oFieldHelp.setContent();
		iDataUpdate = 0;
		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time

		assert.ok(oPopover && oPopover.isOpen(), "Popover is open");
		oContent = oPopover && oPopover._getAllContent()[0];
		assert.ok(oContent, "Popover has content");
		assert.equal(oContent.getId(), "SC1", "content is Popover content");
		assert.equal(iDataUpdate, 1, "DataUpdate event fired");
		oFieldHelp.close();
		oClock.tick(iPopoverDuration); // fake closing time

	});

	QUnit.test("assign wrapper while navigate", function(assert) {

		oClock.restore(); // to test async setting of content

		var fnResolve;
		new Promise(function(fResolve) {
			fnResolve = fResolve;
		}).then(function() {
			oFieldHelp.setContent(oWrapper);
		});

		oFieldHelp.setContent();
		oFieldHelp.attachOpen(function(){
			fnResolve();
		});

		oWrapper.navigate.restore();
		sinon.stub(oWrapper, "navigate").callsFake(
				function() {
					oWrapper.fireNavigate({key: "I1", description: "Item 1"});
				}
		);

		iDataUpdate = 0;
		oFieldHelp.navigate(1); // so also navigation could be tested
		var oPopover = oFieldHelp.getAggregation("_popover");
		assert.notOk(oPopover, "Popover is not created");

		var fnDone = assert.async();
		setTimeout( function(){ // to wait until Wrapper is asigned
			oClock = sinon.useFakeTimers(); // now we can use fake timer again
			oClock.tick(iPopoverDuration); // fake opening time

			oPopover = oFieldHelp.getAggregation("_popover");
			var oContent = oPopover && oPopover._getAllContent()[0];
			assert.ok(oPopover && oPopover.isOpen(), "Popover is open");
			assert.ok(oContent, "Popover has content");
			assert.equal(oContent.getId(), "SC1", "content is Popover content");
			assert.equal(iDataUpdate, 1, "DataUpdate event fired");
			assert.equal(iNavigate, 1, "Navigate event fired");
			assert.equal(sNavigateValue, "Item 1", "Navigate event value");
			assert.equal(sNavigateKey, "I1", "Navigate event key");

			oFieldHelp.close();
			oClock.tick(iPopoverDuration); // fake closing time
			fnDone();
		}, 0);

	});

	QUnit.test("assign content while opening", function(assert) {

		oClock.restore(); // to test async setting of content
		oWrapper.getSuggestionContent.returns(null);
		oWrapper.getListBinding.returns(null);
		oFieldHelp.attachOpen(function(){
			if (!oWrapper.getSuggestionContent()) {
				setTimeout( function(){ // assign async
					oWrapper.getSuggestionContent.returns(oSuggestContent);
					oWrapper.getListBinding.returns(oListBinding);
					oWrapper.fireDataUpdate({contentChange: true});
				}, 0);
			}
		});

		iDataUpdate = 0;
		oFieldHelp.setFilterValue("It");
		oFieldHelp.open(true);
		var fnDone = assert.async();
		setTimeout( function(){ // to wait until Wrapper is asigned
			oClock = sinon.useFakeTimers(); // now we can use fake timer again
			oClock.tick(iPopoverDuration); // fake opening time

			var oPopover = oFieldHelp.getAggregation("_popover");
			assert.ok(oPopover && oPopover.isOpen(), "Popover is open");
			var oContent = oPopover && oPopover._getAllContent()[0];
			assert.ok(oContent, "Popover has content");
			assert.equal(oContent.getId(), "SC1", "content is Popover content");
			assert.equal(iDataUpdate, 1, "DataUpdate event fired");
			var oCheckFilters = {text: [{operator: "StartsWith", value: "It", value2: undefined}], additionalText: [{operator: "StartsWith", value: "It", value2: undefined}]};
			assert.deepEqual(oFilters, oCheckFilters, "Filters used");
			var oCM = oFieldHelp._oFilterConditionModel;
			assert.notOk(oCM._oListBinding, "No ListBinding in ConditionModel");

			// change ListBinding of wrapper
			var oListBinding2 = oModel.bindList("/items"); // use different binding
			oWrapper.getListBinding.returns(oListBinding2);
			oWrapper.fireDataUpdate({contentChange: true});
			var oCM2 = oFieldHelp._oFilterConditionModel;
			assert.equal(oCM, oCM2, "no new ConditionModel");
			oListBinding2.destroy();

			oFieldHelp.close();
			oClock.tick(iPopoverDuration); // fake closing time
			fnDone();
		}, 0);

	});

	QUnit.test("assign content via delegate while opening", function(assert) {

		var fnResolve;
		var oPromise = new Promise(function(fnMyResolve, fnMyReject) {
			fnResolve = fnMyResolve;
		});

		oWrapper.getSuggestionContent.returns(null);
		oWrapper.getListBinding.returns(null);

		sinon.stub(FieldValueHelpDelegate, "contentRequest").returns(oPromise);
		oClock.restore(); // as we need a timeout to test async Promise

		iDataUpdate = 0;
		oFieldHelp.setFilterValue("It");
		oFieldHelp.open(true);

		var oPopover = oFieldHelp.getAggregation("_popover");
		sinon.spy(oPopover, "openBy");

		assert.ok(FieldValueHelpDelegate.contentRequest.called, "FieldHelpBaseDelegate.contentRequest called");
		assert.ok(FieldValueHelpDelegate.contentRequest.calledWith(undefined, oFieldHelp, true), "FieldHelpBaseDelegate.contentRequest called with suggestion");
		assert.equal(iOpen, 0, "Open event not fired as promise is not resolved right now");
		assert.notOk(oPopover.openBy.called, "Popover not opened as promise is not resolved right now");

		// set content and resolve promise
		oWrapper.getSuggestionContent.returns(oSuggestContent);
		oWrapper.getListBinding.returns(oListBinding);
		oWrapper.fireDataUpdate({contentChange: true});
		fnResolve();
		var fnDone = assert.async();
		setTimeout( function(){ // as promise is resolves async
			assert.ok(oPopover.openBy.called, "Popover opened");
			assert.equal(iOpen, 1, "Open event fired");
			iOpen = 0;
			oPopover.openBy.reset();

			oClock = sinon.useFakeTimers(); // now we can use fake timer again
			oClock.tick(iPopoverDuration); // fake opening time
			assert.ok(oPopover.isOpen(), "Popover is open");
			var oContent = oPopover._getAllContent()[0];
			assert.ok(oContent, "Popover has content");
			assert.equal(oContent.getId(), "SC1", "content is Popover content");
			assert.equal(iDataUpdate, 1, "DataUpdate event fired");
			var oCheckFilters = {text: [{operator: "StartsWith", value: "It", value2: undefined}], additionalText: [{operator: "StartsWith", value: "It", value2: undefined}]};
			assert.deepEqual(oFilters, oCheckFilters, "Filters used");

			oFieldHelp.close();
			oClock.tick(iPopoverDuration); // fake closing time

			FieldValueHelpDelegate.contentRequest.restore();
			fnDone();
		}, 0);

	});

	QUnit.test("assign content via delegate while navigate", function(assert) {

		var fnResolve;
		var oPromise = new Promise(function(fnMyResolve, fnMyReject) {
			fnResolve = fnMyResolve;
		});

		oWrapper.getSuggestionContent.returns(null);
		oWrapper.getListBinding.returns(null);
		oWrapper.navigate.restore();
		sinon.stub(oWrapper, "navigate").callsFake(
				function() {
					oWrapper.fireNavigate({key: "I1", description: "Item 1"});
				}
		);

		sinon.stub(FieldValueHelpDelegate, "contentRequest").returns(oPromise);
		oClock.restore(); // as we need a timeout to test async Promise

		iDataUpdate = 0;
		oFieldHelp.navigate(1); // so also navigation could be tested

		var oPopover = oFieldHelp.getAggregation("_popover");
		sinon.spy(oPopover, "openBy");

		assert.ok(FieldValueHelpDelegate.contentRequest.called, "FieldHelpBaseDelegate.contentRequest called");
		assert.ok(FieldValueHelpDelegate.contentRequest.calledWith(undefined, oFieldHelp, true), "FieldHelpBaseDelegate.contentRequest called with suggestion");
		assert.equal(iOpen, 0, "Open event not fired as promise is not resolved right now");
		assert.notOk(oPopover.openBy.called, "Popover not opened as promise is not resolved right now");
		assert.equal(iNavigate, 0, "Navigate event not fired");

		// set content and resolve promise
		oWrapper.getSuggestionContent.returns(oSuggestContent);
		oWrapper.getListBinding.returns(oListBinding);
		oWrapper.fireDataUpdate({contentChange: true});
		fnResolve();
		var fnDone = assert.async();
		setTimeout( function(){ // as promise is resolves async
			assert.ok(oPopover.openBy.called, "Popover opened");
			assert.equal(iOpen, 1, "Open event fired");
			iOpen = 0;
			oPopover.openBy.reset();

			oClock = sinon.useFakeTimers(); // now we can use fake timer again
			oClock.tick(iPopoverDuration); // fake opening time
			assert.ok(oPopover.isOpen(), "Popover is open");
			var oContent = oPopover._getAllContent()[0];
			assert.ok(oContent, "Popover has content");
			assert.equal(oContent.getId(), "SC1", "content is Popover content");
			assert.equal(iDataUpdate, 1, "DataUpdate event fired");
			assert.equal(iNavigate, 1, "Navigate event fired");
			assert.equal(sNavigateValue, "Item 1", "Navigate event value");
			assert.equal(sNavigateKey, "I1", "Navigate event key");

			oFieldHelp.close();
			oClock.tick(iPopoverDuration); // fake closing time

			FieldValueHelpDelegate.contentRequest.restore();
			fnDone();
		}, 0);

	});

	QUnit.test("clone", function(assert) {

		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time

		var oClone = oFieldHelp.clone("MyClone");
		assert.ok(oClone, "FieldHelp cloned");
		oClone.connect(oField2);

		var oCloneWrapper = oClone.getContent();
		var oClonePopover = oClone.getAggregation("_popover");
		assert.ok(oCloneWrapper, "Clone has wrapper");
		assert.equal(oCloneWrapper.getId(), "W1-MyClone", "Id of cloned wrapper");
		assert.notOk(oClonePopover, "no Popover for clone created");

		iDataUpdate = 0;
		sDataUpdateId = undefined;
		oWrapper.fireDataUpdate({contentChange: false});
		assert.equal(iDataUpdate, 1, "DataUpdate event fired once");
		assert.equal(sDataUpdateId, oFieldHelp.getId(), "DataUpdate Id");

		iDataUpdate = 0;
		sDataUpdateId = undefined;
		oCloneWrapper.fireDataUpdate({contentChange: false});
		assert.equal(iDataUpdate, 1, "DataUpdate event on clone fired once");
		assert.equal(sDataUpdateId, oClone.getId(), "DataUpdate Id on clone");

		oWrapper.fireSelectionChange({selectedItems: [{key: "I2", description: "Item 2"}]});
		assert.equal(iSelect, 1, "Select event fired once");
		assert.equal(sSelectId, oFieldHelp.getId(), "Select Id");

		iSelect = 0;
		sSelectId = undefined;
		oCloneWrapper.fireSelectionChange({selectedItems: [{key: "I1", description: "Item 1"}]});
		assert.equal(iSelect, 1, "Select event on clone fired once");
		assert.equal(sSelectId, oClone.getId(), "Select Id on clone");

		oWrapper.fireNavigate({key: "I1", description: "Item 1"});
		assert.equal(iNavigate, 1, "Navigate event fired once");
		assert.equal(sNavigateId, oFieldHelp.getId(), "Navigate Id");

		iNavigate = 0;
		sNavigateId = undefined;
		oCloneWrapper.fireNavigate({key: "I2", description: "Item 2"});
		assert.equal(iNavigate, 1, "Navigate event on clone fired once");
		assert.equal(sNavigateId, oClone.getId(), "Navigate Id on clone");

		oFieldHelp.close();
		oClock.tick(iPopoverDuration); // fake closing time

	});

	QUnit.test("invalidate wrapper", function(assert) {

		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time

		var oPopover = oFieldHelp.getAggregation("_popover");
		sinon.spy(oPopover, "invalidate");
		oWrapper.invalidate(); // fake some change inside wrapper, e.g. item selection
		assert.ok(oPopover.invalidate.called, "Popover invalidated");

		oFieldHelp.close();
		oClock.tick(iPopoverDuration); // fake closing time

		oPopover.invalidate.reset();
		oWrapper.invalidate(); // fake some change inside wrapper, e.g. item selection
		assert.notOk(oPopover.invalidate.called, "closed Popover not invalidated");

	});

	QUnit.module("Dialog", {
		beforeEach: function() {
			_initFieldHelp();
			oClock = sinon.useFakeTimers();
		},
		afterEach: _teardown
	});

	QUnit.test("content display in dialog", function(assert) {

		oDialogContent.getScrollDelegate = function() {return "X";}; // Dummy for testing
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		assert.ok(oDialog, "dialog created");
		if (oDialog) {
			assert.equal(iOpen, 1, "Open event fired");
			assert.notOk(bOpenSuggest, "Open not as suggestion");
			assert.ok(oDialog.isOpen(), "Dialog is open");
			assert.ok(oFieldHelp.isOpen(), "FieldHelp is open");
			assert.ok(oWrapper.initialize.called, "Wrapper.initialize is called");
			assert.ok(oWrapper.fieldHelpOpen.calledWith(false), "fieldHelpOpen of Wrapper called");
			assert.notOk(oWrapper.getSuggestionContent.called, "Wrapper.getSuggestionContent is  not called");
			assert.ok(oWrapper.getDialogContent.called, "Wrapper.getDialogContent is called");
			var oVHP = oDialog.getContent()[0];
			assert.ok(oVHP, "Dialog has content");
			assert.notOk(oVHP.getShowFilterbar(), "No FilterBar shown");
			assert.ok(oVHP && oVHP.isA("sap.ui.mdc.field.ValueHelpPanel"), "content is ValueHelpPanel");
			assert.equal(oVHP.getId(), "F1-H-VHP", "ValueHelpPanel ID");
			assert.equal(iDataUpdate, 1, "DataUpdate event fired");
			var oContent = oVHP.getTable();
			assert.ok(oContent, "ValueHelpPanel has table assigned");
			assert.equal(oContent.getId(), "DC1", "Content ID");
			assert.notOk(oVHP._oDefineConditionPanel, "no DefineConditionPanel");
			var aButtons = oDialog.getButtons();
			assert.equal(aButtons.length, 2, "Dialog has 2 Buttons");
			assert.equal(aButtons[0].getId(), "F1-H-ok", "Dialog has OK-Button");
			assert.equal(aButtons[1].getId(), "F1-H-cancel", "Dialog has Cancel-Button");
			var oScrollDelegate = oFieldHelp.getScrollDelegate();
			assert.equal(oScrollDelegate, "X", "oScrollDelegate of Dialog content used");
		}
		oFieldHelp.close();
		assert.ok(oFieldHelp.isOpen(), "Field help sill opened");
		assert.notOk(oFieldHelp.isOpen(true), "Field help not opened if closing is checked");
		oClock.tick(iDialogDuration); // fake closing time

		assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");

	});

	QUnit.test("content changed in dialog (with async loading of Dialog)", function(assert) {

		oClock.restore(); // to test async loading
		var oStub = sinon.stub(sap.ui, "require");
		oStub.withArgs("sap/m/Dialog").onFirstCall().returns(undefined);
		oStub.callThrough();

		oFieldHelp.open(false);
		var oDialog = oFieldHelp.getAggregation("_dialog");
		assert.notOk(oDialog, "Dialog is not assigned synchronously");

		var fnDone = assert.async();
		setTimeout( function(){ // to wait until Dialog is loaded
			oClock = sinon.useFakeTimers(); // now we can use fake timer again
			oClock.tick(iDialogDuration); // fake opening time

			oDialog = oFieldHelp.getAggregation("_dialog");
			var oMyContent;
			assert.ok(oDialog, "Dialog is assigned asynchronously");
			if (oDialog) {
				assert.equal(iOpen, 1, "Open event fired");
				assert.notOk(bOpenSuggest, "Open not as suggestion");
				assert.ok(oDialog.isOpen(), "Dialog is open");

				oMyContent = new Icon("DC2", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
				oWrapper.getDialogContent.returns(oMyContent);
				oWrapper.fireDataUpdate({contentChange: true});

				var oVHP = oDialog.getContent()[0];
				assert.ok(oVHP, "Dialog has content");
				var oContent = oVHP.getTable();
				assert.ok(oContent, "ValueHelpPanel has table assigned");
				assert.equal(oContent.getId(), "DC2", "Content ID");
			}
			oFieldHelp.close();
			oClock.tick(iDialogDuration); // fake closing time

			oMyContent.destroy();
			fnDone();
		}, 0);

		oStub.restore();

	});

	QUnit.test("toggleOpen in dialog", function(assert) {

		oFieldHelp.toggleOpen(false); // open
		oClock.tick(iDialogDuration); // fake opening time

		assert.equal(iOpen, 1, "Open event fired");
		assert.notOk(bOpenSuggest, "Open not as suggestion");
		var oDialog = oFieldHelp.getAggregation("_dialog");
		assert.ok(oDialog && oDialog.isOpen(), "Dialog is open");
		oFieldHelp.toggleOpen(false); // close
		oFieldHelp.toggleOpen(false); // reopen
		oClock.tick(iDialogDuration); // fake closing time
		assert.ok(oDialog && oDialog.isOpen(), "Dialog is open");
		oFieldHelp.toggleOpen(false); // close
		oClock.tick(iDialogDuration); // fake closing time

		assert.notOk(oDialog && oDialog.isOpen(), "Dialog is not open");

	});

	QUnit.test("toggleOpen in dialog (with async loading of Dialog)", function(assert) {

		oClock.restore(); // to test async loading
		var oStub = sinon.stub(sap.ui, "require");
		oStub.withArgs("sap/m/Dialog").onFirstCall().returns(undefined);
		oStub.callThrough();
		sinon.spy(oFieldHelp, "open");

		oFieldHelp.toggleOpen(false); // open
		var oDialog = oFieldHelp.getAggregation("_dialog");
		assert.ok(oFieldHelp.open.called, "FieldHelp.open called");
		assert.notOk(oDialog, "Dialog is not assigned synchronously");
		assert.ok(oFieldHelp._bOpen, "FieldHelp waits to be opended");
		assert.equal(iOpen, 1, "Open event fired");

		oFieldHelp.toggleOpen(false); // close
		assert.notOk(oFieldHelp._bOpen, "FieldHelp don't waits to be opended");

		oFieldHelp.toggleOpen(false); // open
		assert.ok(oFieldHelp._bOpen, "FieldHelp waits to be opended");
		assert.equal(iOpen, 2, "Open event fired again");

		var fnDone = assert.async();
		setTimeout( function(){ // to wait until Dialog is loaded
			oClock = sinon.useFakeTimers(); // now we can use fake timer again
			oClock.tick(iDialogDuration); // fake opening time

			oDialog = oFieldHelp.getAggregation("_dialog");
			assert.ok(oDialog, "Dialog is assigned asynchronously");
			if (oDialog) {
				assert.ok(oDialog.isOpen(), "Dialog is open");
			}
			oFieldHelp.close();
			oClock.tick(iDialogDuration); // fake closing time
			fnDone();
		}, 0);

		oStub.restore();

	});


	QUnit.test("open dialog while suggestion is open", function(assert) {

		oFieldHelp.open(true);
		var oPopover = oFieldHelp.getAggregation("_popover");
		assert.ok(oPopover, "Popover created");

		oClock.tick(iPopoverDuration); // fake opening time
		assert.ok(oPopover && oPopover.isOpen(), "Popover is open");
		oFieldHelp.open(false);
		oClock.tick(iPopoverDuration); // fake closing time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		assert.ok(oDialog, "dialog created");
		assert.equal(iOpen, 2, "Open event fired");
		assert.notOk(bOpenSuggest, "Open not as suggestion");
		assert.ok(oDialog && oDialog.isOpen(), "Dialog is open");
		assert.notOk(oPopover && oPopover.isOpen(), "Popover is not open");
		oFieldHelp.close(false);
		oClock.tick(iDialogDuration); // fake closing time

	});

	QUnit.test("DefineConditionPanel in dialog", function(assert) {

		oFieldHelp.connect(oField2);
		oFieldHelp.setShowConditionPanel(true);
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		var oVHP = oDialog.getContent()[0];
		assert.ok(oVHP, "Dialog has content");
		assert.ok(oVHP && oVHP.isA("sap.ui.mdc.field.ValueHelpPanel"), "content is ValueHelpPanel");
		var oContent = oVHP && oVHP.getTable();
		assert.ok(oContent, "ValueHelpPanel has table assigned");
		assert.ok(oVHP._oDefineConditionPanel, "DefineConditionPanel assigned");
		var aButtons = oDialog.getButtons();
		assert.equal(aButtons.length, 2, "Dialog has 2 Buttons");

		oFieldHelp.close(false);
		oClock.tick(iDialogDuration); // fake closing time

	});

	QUnit.test("DefineConditionPanel without table in dialog", function(assert) {

		oFieldHelp.connect(oField2);
		oFieldHelp.setContent();
		oFieldHelp.setShowConditionPanel(true);
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		var oVHP = oDialog.getContent()[0];
		assert.ok(oVHP, "Dialog has content");
		assert.ok(oVHP && oVHP.isA("sap.ui.mdc.field.ValueHelpPanel"), "content is ValueHelpPanel");
		var oContent = oVHP && oVHP.getTable();
		assert.notOk(oContent, "ValueHelpPanel has no content assigned");
		assert.ok(oVHP._oDefineConditionPanel, "DefineConditionPanel assigned");
		var aButtons = oDialog.getButtons();
		assert.equal(aButtons.length, 2, "Dialog has 2 Buttons");

		oFieldHelp.close(false);
		oClock.tick(iDialogDuration); // fake closing time

	});

	QUnit.test("DefineConditionPanel for singleSelect fields in dialog", function(assert) {

		oFieldHelp.setShowConditionPanel(true);
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		var oVHP = oDialog.getContent()[0];
		assert.ok(oVHP, "Dialog has content");
		assert.ok(oVHP && oVHP.isA("sap.ui.mdc.field.ValueHelpPanel"), "content is ValueHelpPanel");
		var oContent = oVHP && oVHP.getTable();
		assert.ok(oContent, "ValueHelpPanel has content assigned");
		assert.equal(oContent.getId(), "DC1", "Content ID");
		assert.ok(oVHP._oDefineConditionPanel, "DefineConditionPanel used"); // to allow free EQ input
		var aButtons = oDialog.getButtons();
		assert.equal(aButtons.length, 2, "Dialog has 2 Buttons");

		oFieldHelp.close(false);
		oClock.tick(iDialogDuration); // fake closing time

	});

	QUnit.test("title in dialog", function(assert) {

		oFieldHelp.setTitle("Title");
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		assert.equal(oDialog && oDialog.getTitle(), "Title", "Dialog title");
		oFieldHelp.setTitle("Title1");
		assert.equal(oDialog && oDialog.getTitle(), "Title1", "Dialog title");

		oFieldHelp.close(false);
		oClock.tick(iDialogDuration); // fake closing time

	});

	QUnit.test("selected item in dialog", function(assert) {

		oFieldHelp.setConditions([Condition.createItemCondition("I2", "Item 2")]);
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var aItems = oWrapper.getSelectedItems();
		assert.equal(aItems.length, 1, "Wrapper: one selected item");
		assert.equal(aItems[0].key, "I2", "Item key");
		oFieldHelp.setConditions([Condition.createItemCondition("I3", "Item 3")]);
		aItems = oWrapper.getSelectedItems();
		assert.equal(aItems.length, 1, "Wrapper: one selected item");
		assert.equal(aItems[0].key, "I3", "Item key");

		oFieldHelp.close(false);
		oClock.tick(iDialogDuration); // fake closing time

	});

	QUnit.test("select item in dialog", function(assert) {

		oFieldHelp.setConditions([Condition.createItemCondition("I1", "Item 1")]);
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		oWrapper.fireSelectionChange({selectedItems: [{key: "I2", description: "Item 2"}]});
		assert.equal(iSelect, 0, "Select event not fired");

		var oValueHelpPanel = oDialog.getContent()[0];
		assert.notOk(oValueHelpPanel.getShowTokenizer(), "no Tokenizer shown");

		var aButtons = oDialog.getButtons();
		aButtons[0].firePress(); // simulate button press
		oClock.tick(iDialogDuration); // fake closing time

		assert.equal(iSelect, 1, "Select event fired after OK");
		assert.equal(aSelectConditions.length, 1, "one condition returned");
		assert.equal(aSelectConditions[0].operator, "EQ", "Condition operator");
		assert.equal(aSelectConditions[0].values[0], "I2", "Condition values[0}");
		assert.equal(aSelectConditions[0].values[1], "Item 2", "Condition values[1}");
		assert.notOk(aSelectConditions[0].inParameters, "Condition no in-parameters");
		assert.notOk(aSelectConditions[0].outParameters, "Condition no out-parameters");
		assert.equal(aSelectConditions[0].validated, ConditionValidated.Validated, "Condition is validated");
		assert.notOk(bSelectAdd, "Items should not be added");
		assert.ok(bSelectClose, "FieldHelp closed in Event");
		assert.notOk(oDialog.isOpen(), "Field help closed");
		var aConditions = oFieldHelp.getConditions();
		assert.equal(aConditions.length, 1, "one condition set");
		assert.equal(aConditions[0].operator, "EQ", "Condition operator");
		assert.equal(aConditions[0].values[0], "I2", "Condition values[0}");
		assert.equal(aConditions[0].values[1], "Item 2", "Condition values[1}");
		assert.notOk(aConditions[0].inParameters, "Condition no in-parameters");
		assert.notOk(aConditions[0].outParameters, "Condition no out-parameters");
		assert.equal(aConditions[0].validated, ConditionValidated.Validated, "Condition is validated");

	});

	QUnit.test("select item in dialog using out-parameters", function(assert) {

		oFieldHelp.addInParameter(new InParameter({value: "{testIn}", helpPath: "myTestIn"}));
		oFieldHelp.addOutParameter(new OutParameter({value: "{testOut}", helpPath: "myTestOut"}));
		var oCondition = Condition.createItemCondition("I1", "Item 1", {test: "X"});
		oFieldHelp.setConditions([oCondition]);
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		oWrapper.fireSelectionChange({selectedItems: [{key: "I2", description: "Item 2", inParameters: {myTestIn: "X"}, outParameters: {myTestOut: "Y"}}]});

		var aButtons = oDialog.getButtons();
		aButtons[0].firePress(); // simulate button press
		oClock.tick(iDialogDuration); // fake closing time

		assert.equal(iSelect, 1, "Select event fired after OK");
		assert.equal(aSelectConditions.length, 1, "one condition returned");
		assert.equal(aSelectConditions[0].operator, "EQ", "Condition operator");
		assert.equal(aSelectConditions[0].values[0], "I2", "Condition values[0}");
		assert.equal(aSelectConditions[0].values[1], "Item 2", "Condition values[1}");
		assert.ok(aSelectConditions[0].inParameters, "Condition in-parameters set");
		assert.ok(aSelectConditions[0].inParameters && aSelectConditions[0].inParameters.hasOwnProperty("testIn"), "Condition in-parameters has 'testIn'");
		assert.equal(aSelectConditions[0].inParameters && aSelectConditions[0].inParameters.testIn, "X", "Condition in-parameters 'testIn'");
		assert.ok(aSelectConditions[0].outParameters, "Condition out-parameters set");
		assert.ok(aSelectConditions[0].outParameters && aSelectConditions[0].outParameters.hasOwnProperty("testOut"), "Condition out-parameters has 'testOut'");
		assert.equal(aSelectConditions[0].outParameters && aSelectConditions[0].outParameters.testOut, "Y", "Condition out-parameters 'testOut'");
		assert.equal(aSelectConditions[0].validated, ConditionValidated.Validated, "Condition is validated");
		assert.notOk(bSelectAdd, "Items should not be added");
		assert.ok(bSelectClose, "FieldHelp closed in Event");
		assert.notOk(oDialog.isOpen(), "Field help closed");
		var aConditions = oFieldHelp.getConditions();
		assert.equal(aConditions.length, 1, "one condition set");
		assert.equal(aConditions[0].operator, "EQ", "Condition operator");
		assert.equal(aConditions[0].values[0], "I2", "Condition values[0}");
		assert.equal(aConditions[0].values[1], "Item 2", "Condition values[1}");
		assert.ok(aConditions[0].inParameters, "Condition in-parameters set");
		assert.ok(aConditions[0].inParameters && aConditions[0].inParameters.hasOwnProperty("testIn"), "Condition in-parameters has 'testIn'");
		assert.equal(aConditions[0].inParameters && aConditions[0].inParameters.testIn, "X", "Condition in-parameters 'testIn'");
		assert.ok(aConditions[0].outParameters, "Condition out-parameters set");
		assert.ok(aConditions[0].outParameters && aConditions[0].outParameters.hasOwnProperty("testOut"), "Condition out-parameters has 'testOut'");
		assert.equal(aConditions[0].outParameters && aConditions[0].outParameters.testOut, "Y", "Condition out-parameters 'testOut'");
		assert.equal(aConditions[0].validated, ConditionValidated.Validated, "Condition is validated");

	});

	QUnit.test("select more items in dialog", function(assert) {

		oFieldHelp.connect(oField2);
		oFieldHelp.setConditions([Condition.createItemCondition("I1", "Item 1"),
		                          Condition.createCondition("EQ", ["I2"], undefined, undefined, ConditionValidated.Validated),
		                          Condition.createCondition("StartsWith", ["X"])]);
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		oWrapper.fireSelectionChange({selectedItems: [{key: "I1", description: "Item 1"}, {key: "I2", description: "Item 2"}, {key: "I3", description: "Item 3"}]});
		assert.equal(iSelect, 0, "Select event not fired");

		var oValueHelpPanel = oDialog.getContent()[0];
		assert.ok(oValueHelpPanel.getShowTokenizer(), "Tokenizer shown");

		var aButtons = oDialog.getButtons();
		aButtons[0].firePress(); // simulate button press
		oClock.tick(iDialogDuration); // fake closing time

		assert.equal(iSelect, 1, "Select event fired after OK");
		assert.equal(aSelectConditions.length, 4, "four conditions returned");
		assert.equal(aSelectConditions[0].operator, "EQ", "Condition operator");
		assert.equal(aSelectConditions[0].values[0], "I1", "Condition values[0}");
		assert.equal(aSelectConditions[0].values[1], "Item 1", "Condition values[1}");
		assert.equal(aSelectConditions[1].operator, "EQ", "Condition operator");
		assert.equal(aSelectConditions[1].values[0], "I2", "Condition values[0}");
		assert.equal(aSelectConditions[1].values[1], "Item 2", "Condition values[1}");
		assert.equal(aSelectConditions[1].validated, ConditionValidated.Validated, "Condition is validated");
		assert.equal(aSelectConditions[2].operator, "StartsWith", "Condition operator");
		assert.equal(aSelectConditions[2].values[0], "X", "Condition values[0}");
		assert.equal(aSelectConditions[2].validated, ConditionValidated.NotValidated, "Condition is not validated");
		assert.equal(aSelectConditions[3].operator, "EQ", "Condition operator");
		assert.equal(aSelectConditions[3].values[0], "I3", "Condition values[0}");
		assert.equal(aSelectConditions[3].values[1], "Item 3", "Condition values[1}");
		assert.equal(aSelectConditions[3].validated, ConditionValidated.Validated, "Condition is validated");
		assert.notOk(bSelectAdd, "Items should not be added");
		assert.ok(bSelectClose, "FieldHelp closed in Event");
		assert.notOk(oDialog.isOpen(), "Field help closed");
		var aConditions = oFieldHelp.getConditions();
		assert.equal(aConditions.length, 4, "4 conditions set");
		assert.equal(aConditions[0].operator, "EQ", "Condition operator");
		assert.equal(aConditions[0].values[0], "I1", "Condition values[0}");
		assert.equal(aConditions[0].values[1], "Item 1", "Condition values[1}");
		assert.equal(aConditions[1].operator, "EQ", "Condition operator");
		assert.equal(aConditions[1].values[0], "I2", "Condition values[0}");
		assert.equal(aConditions[1].values[1], "Item 2", "Condition values[1}");
		assert.equal(aConditions[1].validated, ConditionValidated.Validated, "Condition is validated");
		assert.equal(aConditions[2].operator, "StartsWith", "Condition operator");
		assert.equal(aConditions[2].values[0], "X", "Condition values[0}");
		assert.equal(aConditions[2].validated, ConditionValidated.NotValidated, "Condition is not validated");
		assert.equal(aConditions[3].operator, "EQ", "Condition operator");
		assert.equal(aConditions[3].values[0], "I3", "Condition values[0}");
		assert.equal(aConditions[3].values[1], "Item 3", "Condition values[1}");
		assert.equal(aConditions[3].validated, ConditionValidated.Validated, "Condition is validated");

	});

	QUnit.test("select more items in dialog with maxConditions", function(assert) {

		oField2.getMaxConditions = function() {return 2;};
		oFieldHelp.connect(oField2);
		oFieldHelp.setConditions([Condition.createItemCondition("I1", "Item 1")]);
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		oWrapper.fireSelectionChange({selectedItems: [{key: "I1", description: "Item 1"}, {key: "I2", description: "Item 2"}, {key: "I3", description: "Item 3"}]});

		var aButtons = oDialog.getButtons();
		aButtons[0].firePress(); // simulate button press

		var aConditions = oFieldHelp.getConditions();
		assert.equal(aConditions.length, 2, "2 conditions set");
		assert.equal(aConditions[0].operator, "EQ", "Condition operator");
		assert.equal(aConditions[0].values[0], "I2", "Condition values[0}");
		assert.equal(aConditions[0].values[1], "Item 2", "Condition values[1}");
		assert.equal(aConditions[1].operator, "EQ", "Condition operator");
		assert.equal(aConditions[1].values[0], "I3", "Condition values[0}");
		assert.equal(aConditions[1].values[1], "Item 3", "Condition values[1}");

		oClock.tick(iDialogDuration); // fake closing time
		assert.equal(iSelect, 1, "Select event fired after OK");
		assert.equal(aSelectConditions.length, 2, "2 conditions returned");
		assert.equal(aSelectConditions[0].operator, "EQ", "Condition operator");
		assert.equal(aSelectConditions[0].values[0], "I2", "Condition values[0}");
		assert.equal(aSelectConditions[0].values[1], "Item 2", "Condition values[1}");
		assert.equal(aSelectConditions[0].validated, ConditionValidated.Validated, "Condition is validated");
		assert.equal(aSelectConditions[1].operator, "EQ", "Condition operator");
		assert.equal(aSelectConditions[1].values[0], "I3", "Condition values[0}");
		assert.equal(aSelectConditions[1].values[1], "Item 3", "Condition values[1}");
		assert.equal(aSelectConditions[1].validated, ConditionValidated.Validated, "Condition is validated");
		assert.notOk(bSelectAdd, "Items should not be added");
		assert.ok(bSelectClose, "FieldHelp closed in Event");
		assert.notOk(oDialog.isOpen(), "Field help closed");

	});

	QUnit.test("cancel dialog", function(assert) {

		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		oWrapper.fireSelectionChange({selectedItems: [{key: "I2", description: "Item 2"}]});
		assert.equal(iSelect, 0, "Select event not fired");

		var aButtons = oDialog.getButtons();
		aButtons[1].firePress(); // simulate button press
		oClock.tick(iDialogDuration); // fake closing time

		assert.equal(iSelect, 0, "Select event not fired after Cancel");
		var aConditions = oFieldHelp.getConditions();
		assert.equal(aConditions.length, 0, "no conditions set");
		assert.notOk(oDialog.isOpen(), "Field help closed");

	});

	QUnit.test("search in Dialog", function(assert) {

		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		var oVHP = oDialog.getContent()[0];
		assert.ok(oVHP.getSearchEnabled(), "Search is enabled");
		assert.ok(oVHP.getBinding("filterConditions"), "FilterConditions bound");
		var oSearchFilterField = oVHP.byId("SearchField");
		var oSearchField = oSearchFilterField.getAggregation("_content")[0];
		qutils.triggerCharacterInput(oSearchField.getFocusDomRef(), "-" );
		oSearchField.setValue("-"); // as onInput SearchField sets it's value
		qutils.triggerKeydown(oSearchField.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
		qutils.triggerKeyup(oSearchField.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
		oClock.tick(0); // wait for binding update

		var aConditions = oFieldHelp._oFilterConditionModel.getConditions(oFieldHelp.getFilterFields());
		assert.equal(aConditions.length, 1, "One Search condition");
		assert.equal(aConditions.length > 0 && aConditions[0].values[0], "-", "Value of Search condition");
		assert.equal(oFieldHelp.getFilterValue(), "-", "FilterValue of FieldHelp");
		assert.ok(oWrapper.getFilterEnabled.called, "Wrapper.getFilterEnabled is called");
		assert.notOk(oWrapper.getListBinding.called, "Wrapper.getListBinding is not called");
		var oCheckFilters = {text: [{operator: "Contains", value: "-", value2: undefined}], additionalText: [{operator: "Contains", value: "-", value2: undefined}]};
		assert.deepEqual(oFilters, oCheckFilters, "Filters used");
		oFieldHelp.close();
		oClock.tick(iDialogDuration); // fake closing time

		assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");
		assert.notOk(oVHP.getBinding("filterConditions"), "FilterConditions not bound");

	});

	QUnit.test("search in Dialog with suspended ListBinding", function(assert) {

		oListBinding.suspend();
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		assert.ok(oListBinding.isSuspended(), "ListBinding suspended after open");

		var oVHP = oDialog.getContent()[0];
		oVHP.fireSearch(); // fake just empty search
		oClock.tick(0); // wait for binding update

		assert.notOk(oListBinding.isSuspended(), "ListBinding not suspended after search");
		var aContexts = oListBinding.getContexts();
		assert.equal(aContexts.length, 3, "List has 3 Items");
		oFieldHelp.close();
		oClock.tick(iDialogDuration); // fake closing time

	});

	QUnit.test("disable search", function(assert) {

		oFieldHelp.setFilterFields("");
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		var oVHP = oDialog.getContent()[0];
		assert.notOk(oVHP.getSearchEnabled(), "Search is disabled");
		assert.notOk(oVHP.getBinding("filterConditions"), "FilterConditions not bound");

		oFieldHelp.setFilterFields("*text*");
		assert.ok(oVHP.getSearchEnabled(), "Search is rnabled");
		assert.ok(oVHP.getBinding("filterConditions"), "FilterConditions bound");

		oFieldHelp.setFilterFields("");
		assert.notOk(oVHP.getSearchEnabled(), "Search is disabled");
		assert.notOk(oVHP.getBinding("filterConditions"), "FilterConditions not bound");

		oFieldHelp.close();
		oClock.tick(iDialogDuration); // fake closing time

	});

	QUnit.test("assign wrapper while opening", function(assert) {

		oClock.restore(); // to test async loading
		oFieldHelp.setContent();
		oFieldHelp.attachOpen(function(){
			if (!oFieldHelp.getContent()) {
				setTimeout( function(){
					oFieldHelp.setContent(oWrapper);
				}, 0);
			}
		});

		iDataUpdate = 0;
		oFieldHelp.open(false);

		var fnDone = assert.async();
		setTimeout( function(){ // wait for assigning content
			oClock = sinon.useFakeTimers(); // now we can use fake timer again
			oClock.tick(iDialogDuration); // fake opening time
			var oDialog = oFieldHelp.getAggregation("_dialog");
			assert.ok(oDialog.isOpen(), "Dialog is open");
			assert.ok(oWrapper.fieldHelpOpen.calledWith(false), "fieldHelpOpen of Wrapper called");
			assert.ok(oWrapper.getDialogContent.called, "Wrapper.getDialogContent is called");
			var oVHP = oDialog.getContent()[0];
			var oContent = oVHP.getTable();
			assert.ok(oContent, "ValueHelpPanel has table assigned");
			assert.equal(oContent.getId(), "DC1", "Content ID");
			assert.equal(iDataUpdate, 1, "DataUpdate event fired");

			oFieldHelp.close();
			oClock.tick(iDialogDuration); // fake closing time
			fnDone();
		}, 0);

	});

	QUnit.test("invalidate wrapper", function(assert) {

		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		var oValueHelpPanel = oDialog.getContent()[0];
		sinon.spy(oValueHelpPanel, "invalidate");
		oWrapper.invalidate(); // fake some change inside wrapper, e.g. changing table
		assert.ok(oValueHelpPanel.invalidate.called, "ValueHelpPanel invalidated");

		oFieldHelp.close();
		oClock.tick(iDialogDuration); // fake closing time

		oValueHelpPanel.invalidate.reset();
		oWrapper.invalidate(); // fake some change inside wrapper, e.g. changing table
		assert.notOk(oValueHelpPanel.invalidate.called, "closed Dialog not invalidated");

	});

	QUnit.test("assign wrapper via delegate while opening", function(assert) {

		var fnResolve;
		var oPromise = new Promise(function(fnMyResolve, fnMyReject) {
			fnResolve = fnMyResolve;
		});

		oFieldHelp.setContent();

		sinon.stub(FieldValueHelpDelegate, "contentRequest").returns(oPromise);
		oClock.restore(); // as we need a timeout to test async Promise

		iDataUpdate = 0;
		oFieldHelp.open(false);

		var oDialog = oFieldHelp.getAggregation("_dialog");
		sinon.spy(oDialog, "open");

		assert.ok(FieldValueHelpDelegate.contentRequest.called, "FieldHelpBaseDelegate.contentRequest called");
		assert.ok(FieldValueHelpDelegate.contentRequest.calledWith(undefined, oFieldHelp, false), "FieldHelpBaseDelegate.contentRequest called with no suggestion");
		assert.equal(iOpen, 0, "Open event not fired as promise is not resolved right now");
		assert.notOk(oDialog.open.called, "Dialog not opened as promise is not resolved right now");


		// set content and resolve promise
		oFieldHelp.setContent(oWrapper);
		fnResolve();
		var fnDone = assert.async();
		setTimeout( function(){ // as promise is resolves async
			assert.ok(oDialog.open.called, "Dialog opened");
			assert.equal(iOpen, 1, "Open event fired");
			iOpen = 0;
			oDialog.open.reset();

			oClock = sinon.useFakeTimers(); // now we can use fake timer again
			oClock.tick(iPopoverDuration); // fake closing time
			assert.ok(oDialog.isOpen(), "Dialog is open");
			assert.ok(oWrapper.fieldHelpOpen.calledWith(false), "fieldHelpOpen of Wrapper called");
			assert.ok(oWrapper.getDialogContent.called, "Wrapper.getDialogContent is called");
			var oVHP = oDialog.getContent()[0];
			var oContent = oVHP.getTable();
			assert.ok(oContent, "ValueHelpPanel has table assigned");
			assert.equal(oContent.getId(), "DC1", "Content ID");
			assert.equal(iDataUpdate, 1, "DataUpdate event fired");

			oFieldHelp.close();
			oClock.tick(iPopoverDuration); // fake closing time

			FieldValueHelpDelegate.contentRequest.restore();
			fnDone();
		}, 0);

	});

	var oFilterBar;
	var oFilterField;

	QUnit.module("FilterBar", {
		beforeEach: function() {
			_initFieldHelp();

			oFilterField = new FilterField("MyFilterField", {
				label: "Label",
				conditions: "{$filters>/conditions/additionalText}"
			});

			oFilterBar = new FilterBar("MyFilterBar", {
				liveMode: false,
				filterItems: [oFilterField]
			});

			oFieldHelp.setFilterBar(oFilterBar);
			oClock = sinon.useFakeTimers();
		},
		afterEach: function() {
			_teardown();
			oFilterBar = undefined; // destroyed vis FieldHelp
			oFilterField = undefined; // destroyed via FilterBar
		}
	});

	QUnit.test("FilterBar shown in dialog", function(assert) {

		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		var oVHP = oDialog.getContent()[0];
		assert.ok(oVHP.getShowFilterbar(), "ValueHelpPanel showFilterbar");
		assert.ok(oVHP._oFilterbar, "ValueHelpPanel FilterBar used");
		assert.ok(oFilterBar.getDomRef(), "FilterBar rendered");

		oFilterField.setConditions([Condition.createCondition("Contains", ["2"])]); // fake change
		oClock.tick(0); // wait for binding update (FilterBar)
		oClock.tick(0); // wait for binding update (FilterConditionModel) - to check no live update

		oFilterBar.fireSearch(); // fake "Go"
		oClock.tick(0); // wait for binding update (FilterConditionModel)
		var oCheckFilters = {additionalText: [{operator: "Contains", value: "2", value2: undefined}]};
		assert.deepEqual(oFilters, oCheckFilters, "Filters used");

		oFieldHelp.close();
		oClock.tick(iDialogDuration); // fake closing time

	});

	QUnit.test("FilterBar and in-parameter", function(assert) {

		oFieldHelp.addInParameter( new InParameter({ value: "Text 2", helpPath: "additionalText"}));
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		var oVHP = oDialog.getContent()[0];
		assert.ok(oVHP.getShowFilterbar(), "ValueHelpPanel showFilterbar");
		assert.ok(oVHP._oFilterbar, "ValueHelpPanel FilterBar used");
		assert.ok(oFilterBar.getDomRef(), "FilterBar rendered");
		var aConditions = oFilterField.getConditions();
		assert.equal(aConditions.length, 1, "One condition in FilterField");
		assert.equal(aConditions[0].operator, "EQ", "Operator of Condition");
		assert.equal(aConditions[0].values[0], "Text 2", "Value of Condition");

		oFilterField.setConditions([]); // fake change
		oFilterBar.fireSearch(); // fake "Go"
		oClock.tick(0); // wait for binding update (FilterBar)
		oClock.tick(0); // wait for binding update (FilterConditionModel)
		var aContexts = oListBinding.getContexts();
		assert.equal(aContexts.length, 3, "List has 3 Items after update");

		oFieldHelp.close();
		oClock.tick(iDialogDuration); // fake closing time

	});

	QUnit.test("FilterBar and in-parameter as condition", function(assert) {

		var oInParameter = new InParameter({value: [Condition.createCondition("EQ", ["Text 2"])], helpPath: "additionalText"});
		oFieldHelp.addInParameter(oInParameter);
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		var oVHP = oDialog.getContent()[0];
		assert.ok(oVHP.getShowFilterbar(), "ValueHelpPanel showFilterbar");
		assert.ok(oVHP._oFilterbar, "ValueHelpPanel FilterBar used");
		assert.ok(oFilterBar.getDomRef(), "FilterBar rendered");
		var aConditions = oFilterField.getConditions();
		assert.equal(aConditions.length, 1, "One condition in FilterField");
		assert.equal(aConditions[0].operator, "EQ", "Operator of Condition");
		assert.equal(aConditions[0].values[0], "Text 2", "Value of Condition");

		oInParameter.destroy();
		oClock.tick(0); // wait for binding update (FilterBar)
		oClock.tick(0); // wait for binding update (FilterConditionModel)
		aConditions = oFilterField.getConditions();
		assert.equal(aConditions.length, 0, "mo condition in FilterField");
		var aContexts = oListBinding.getContexts();
		assert.equal(aContexts.length, 3, "List has 3 Items after update");

		oFieldHelp.close();
		oClock.tick(iDialogDuration); // fake closing time

	});

	QUnit.test("FilterBar after open and in-parameter", function(assert) {

		oFieldHelp.setFilterBar();
		oFieldHelp.addInParameter( new InParameter({ value: "Text 2", helpPath: "additionalText"}));
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		var oDialog = oFieldHelp.getAggregation("_dialog");
		oFieldHelp.setFilterBar(oFilterBar);
		oClock.tick(0); // wait for binding update (FilterBar)
		oClock.tick(0); // wait for binding update (FilterConditionModel)
		sap.ui.getCore().applyChanges();
		var oVHP = oDialog.getContent()[0];
		assert.ok(oVHP.getShowFilterbar(), "ValueHelpPanel showFilterbar");
		assert.ok(oVHP._oFilterbar, "ValueHelpPanel FilterBar used");
		assert.ok(oFilterBar.getDomRef(), "FilterBar rendered");
		var aConditions = oFilterField.getConditions();
		assert.equal(aConditions.length, 1, "One condition in FilterField");
		assert.equal(aConditions[0].operator, "EQ", "Operator of Condition");
		assert.equal(aConditions[0].values[0], "Text 2", "Value of Condition");
		oFieldHelp.close();
		oClock.tick(iDialogDuration); // fake closing time

	});

	QUnit.test("FilterBar in suggestion", function(assert) {

		oFilterField.setConditions([Condition.createCondition("Contains", ["2"])]);
		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time

		var aContexts = oListBinding.getContexts();
		assert.equal(aContexts.length, 3, "List has 3 Items");

		oFieldHelp.close();
		oClock.tick(iPopoverDuration); // fake closing time

	});

	QUnit.test("FilterBar in suggestion after dialog", function(assert) {

		oWrapper.getAsyncKeyText = function() {return true;}; // to fake async support
		oFilterField.setConditions([Condition.createCondition("Contains", ["2"])]);
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time
		oClock.tick(0); // wait for binding update (FilterBar)
		oClock.tick(0); // wait for binding update (FilterConditionModel)
		var oCheckFilters = {additionalText: [{operator: "Contains", value: "2", value2: undefined}]};
		assert.deepEqual(oFilters, oCheckFilters, "Filters used");
		oFieldHelp._oFilterConditionModel.addCondition("test", Condition.createCondition("Contains", ["X"])); // fake condition remaining after deleting from FilterBar but not pressing "Go"
		oFieldHelp.close();
		oClock.tick(iDialogDuration); // fake closing time

		oFieldHelp.open(true);
		oClock.tick(iPopoverDuration); // fake opening time

		assert.deepEqual(oFilters, {}, "no Filters used");

		oFieldHelp.close();
		oClock.tick(iPopoverDuration); // fake closing time

	});

	QUnit.test("clone", function(assert) {

		var fFunc = function() {
			this.fireSearch();
		};

		oFilterBar.setLiveMode(true); // to have direct update
		var oClone = oFieldHelp.clone();
		var oCloneFilterBar = oClone.getFilterBar();
		var oCloneFilterField = oCloneFilterBar.getFilterItems()[0];
		var oCloneWrapper = oClone.getContent();
		var oCloneListBinding = oModel.bindList("/items");
		sinon.stub(oCloneWrapper, "getListBinding").returns(oCloneListBinding);
		sinon.stub(oCloneWrapper, "applyFilters").callsFake(_applyFilters);
		oClone.connect(oField2);

		sinon.stub(oFilterBar, "triggerSearch").callsFake(fFunc.bind(oFilterBar));
		sinon.stub(oCloneFilterBar, "triggerSearch").callsFake(fFunc.bind(oCloneFilterBar));

		oFieldHelp.open(false);
		oClone.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		oFilterField.setConditions([Condition.createCondition("Contains", ["2"])]); // fake change
		oClock.tick(0); // wait for binding update (FilterBar)
		oClock.tick(0); // wait for binding update (FilterConditionModel)

		var oCheckFilters = {additionalText: [{operator: "Contains", value: "2", value2: undefined}]};
		assert.deepEqual(oFilters, oCheckFilters, "Filters used");
		assert.equal(sWrapperId, "W1", "Wrapper ID for applyFilters");

		oCloneFilterField.setConditions([Condition.createCondition("Contains", ["1"])]); // fake change
		oClock.tick(0); // wait for binding update (FilterBar)
		oClock.tick(0); // wait for binding update (FilterConditionModel)

		oCheckFilters = {additionalText: [{operator: "Contains", value: "1", value2: undefined}]};
		assert.deepEqual(oFilters, oCheckFilters, "Filters used");
		assert.equal(sWrapperId, "W1-__clone0", "Wrapper ID for applyFilters");

		oFieldHelp.close();
		oClone.close();
		oClock.tick(iDialogDuration); // fake closing time

		oCloneListBinding.destroy();
		oClone.destroy();
		oFilterBar.triggerSearch.restore();

	});

	QUnit.test("FilterBar and suspended ListBinding", function(assert) {

		oListBinding.suspend();
		oFieldHelp.addInParameter( new InParameter({ value: "Text 2", helpPath: "additionalText"}));
		oFieldHelp.open(false);
		oClock.tick(iDialogDuration); // fake opening time

		assert.ok(oListBinding.isSuspended(), "ListBinding still suspended after open");

		oFilterField.setConditions([]); // fake change
		oFilterBar.fireSearch(); // fake "Go"
		oClock.tick(0); // wait for binding update (FilterBar)
		oClock.tick(0); // wait for binding update (FilterConditionModel)

		assert.notOk(oListBinding.isSuspended(), "ListBinding not suspended after search event");

		oFieldHelp.close();
		oClock.tick(iDialogDuration); // fake closing time

	});

	function _initBoundFieldHelp() {

		_initFieldHelp();

		oField.bindProperty("src", {path: "icon"});
		var oBindingContext = oModel.getContext("/contexts/0/");
		oField.setBindingContext(oBindingContext);
		oFieldHelp.connect(oField); // to update BindingConext
		oField2.bindProperty("src", {path: "icon"});
		oBindingContext = oModel.getContext("/contexts/1/");
		oField2.setBindingContext(oBindingContext);

	}

	QUnit.module("BindingContext", {
		beforeEach: _initBoundFieldHelp,
		afterEach: _teardown
	});

	QUnit.test("connect", function(assert) {

			var oBindingContext = oField.getBindingContext();
			assert.ok(oFieldHelp.getBindingContext(), "FieldHelp has BindingContext");
			assert.equal(oFieldHelp.getBindingContext(), oBindingContext, "FieldHelp has BindingContext of Field");

			oFieldHelp.connect(oField2);
			oBindingContext = oField2.getBindingContext();
			assert.ok(oFieldHelp.getBindingContext(), "FieldHelp has BindingContext");
			assert.equal(oFieldHelp.getBindingContext(), oBindingContext, "FieldHelp has BindingContext of Field2");

			oFieldHelp.connect();
			assert.notOk(oFieldHelp.getBindingContext(), "FieldHelp has no BindingContext");

	});

	QUnit.test("context change on open", function(assert) {

		oFieldHelp.connect(oField2);
		var oBindingContext = oModel.getContext("/contexts/2/");
		oField2.setBindingContext(oBindingContext);
		oFieldHelp.open(true);
		assert.ok(oFieldHelp.getBindingContext(), "FieldHelp has BindingContext");
		assert.equal(oFieldHelp.getBindingContext(), oBindingContext, "FieldHelp has BindingContext of Field");

	});

	QUnit.test("getTextForKey", function(assert) {

		oFieldHelp.addOutParameter(new OutParameter({value: "{outParameter}", helpPath: "myTestOut"}));
		oFieldHelp.addInParameter(new InParameter({value: "{inParameter}", helpPath: "myTestIn"}));
		oFieldHelp.getTextForKey("I2");
		assert.ok(oWrapper.getTextForKey.calledWith("I2", {myTestIn: "in1"}), "getTextForKey of Wrapper called with In-Parameter");

		var oBindingContext = oModel.getContext("/contexts/2/");
		oFieldHelp.getTextForKey("I2", undefined, undefined, oBindingContext);
		assert.ok(oWrapper.getTextForKey.calledWith("I2", {myTestIn: "in3"}), "getTextForKey of Wrapper called with In-Parameter");
		assert.equal(oFieldHelp.getBindingContext(), oField.getBindingContext(), "FieldHelp has BindingContext of Field");

	});

	QUnit.test("getTextForKey with async loading of InParameters", function(assert) {

		var fnResolve;
		var oPromise = new Promise(function(fnMyResolve, fnMyReject) {
			fnResolve = fnMyResolve;
		});
		sinon.stub(FieldValueHelpDelegate, "checkBindingsPending").returns(oPromise);

		var oBindingContext = oModel.getContext("/contexts/2/");
		sinon.stub(oBindingContext, "getProperty");
		oBindingContext.getProperty.withArgs("inParameter2").onFirstCall().returns(undefined); // simulate loading needed
		oBindingContext.getProperty.callThrough();

		var oModel2 = new JSONModel({
			test: "X"
			});
		var oInParameter = new InParameter({value: {path: "test", model: "Model2"}, helpPath: "myExternalIn"});
		oInParameter.setModel(oModel2, "Model2"); // to test a different BindingContext than the FieldValueHelp
		oInParameter.setBindingContext(oModel2.getContext("/"), "Model2");

		oFieldHelp.addInParameter(oInParameter);
		oFieldHelp.addInParameter(new InParameter({value: "fix", helpPath: "myFixIn"}));
		oFieldHelp.addInParameter(new InParameter({value: "{inParameter}", helpPath: "myTestIn"}));
		oFieldHelp.addInParameter(new InParameter({value: "{inParameter2}", helpPath: "myTestIn2"}));
		oFieldHelp.addOutParameter(new OutParameter({value: "{outParameter}", helpPath: "myTest"}));
		var vResult = oFieldHelp.getTextForKey("I2", undefined, undefined, oBindingContext);
		assert.ok(vResult instanceof Promise, "Promise returned");
		assert.notOk(bDataRequested, "dataRequested event not fired");

		FieldValueHelpDelegate.checkBindingsPending.restore();
		fnResolve();
		oBindingContext.getProperty.restore();
		var fnDone = assert.async();

		vResult.then(function(vResult) {
			assert.ok(true, "Promise Then must be called");
			assert.ok(oWrapper.getTextForKey.calledWith("I2", {myExternalIn: "X", myFixIn: "fix", myTestIn: "in3", myTestIn2: "in3-2"}), "getTextForKey of Wrapper called with In-Parameter");
			assert.equal(oFieldHelp.getBindingContext(), oField.getBindingContext(), "FieldHelp has BindingContext of Field");
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
		});

		setTimeout( function(){ // as promise is resolves async
			assert.notOk(bDataRequested, "dataRequested event not fired as content exist");
			fnDone();
		}, 0);

	});

	QUnit.test("getKeyForText", function(assert) {

		oFieldHelp.addOutParameter(new OutParameter({value: "{outParameter}", helpPath: "myTestOut"}));
		oFieldHelp.addInParameter(new InParameter({value: "{inParameter}", helpPath: "myTestIn"}));
		oFieldHelp.getKeyForText("Item 2");
		assert.ok(oWrapper.getKeyForText.calledWith("Item 2", {myTestIn: "in1"}), "getKeyForText of Wrapper called");

		var oBindingContext = oModel.getContext("/contexts/2/");
		oFieldHelp.getKeyForText("Item 2", oBindingContext);
		assert.ok(oWrapper.getKeyForText.calledWith("Item 2", {myTestIn: "in3"}), "getKeyForText of Wrapper called");
		assert.equal(oFieldHelp.getBindingContext(), oField.getBindingContext(), "FieldHelp has BindingContext of Field");

	});

	QUnit.test("getKeyForText with async loading of InParameters", function(assert) {

		var fnResolve;
		var oPromise = new Promise(function(fnMyResolve, fnMyReject) {
			fnResolve = fnMyResolve;
		});
		sinon.stub(FieldValueHelpDelegate, "checkBindingsPending").returns(oPromise);

		var oBindingContext = oModel.getContext("/contexts/2/");
		sinon.stub(oBindingContext, "getProperty");
		oBindingContext.getProperty.withArgs("inParameter2").onFirstCall().returns(undefined); // simulate loading needed
		oBindingContext.getProperty.callThrough();

		var oModel2 = new JSONModel({
			test: "X"
			});
		var oInParameter = new InParameter({value: {path: "test", model: "Model2"}, helpPath: "myExternalIn"});
		oInParameter.setModel(oModel2, "Model2"); // to test a different BindingContext than the FieldValueHelp
		oInParameter.setBindingContext(oModel2.getContext("/"), "Model2");

		oFieldHelp.addInParameter(oInParameter);
		oFieldHelp.addInParameter(new InParameter({value: "fix", helpPath: "myFixIn"}));
		oFieldHelp.addInParameter(new InParameter({value: "{inParameter}", helpPath: "myTestIn"}));
		oFieldHelp.addInParameter(new InParameter({value: "{inParameter2}", helpPath: "myTestIn2"}));
		oFieldHelp.addOutParameter(new OutParameter({value: "{outParameter}", helpPath: "myTest"}));
		var vResult = oFieldHelp.getKeyForText("Item 2", oBindingContext);
		assert.ok(vResult instanceof Promise, "Promise returned");
		assert.notOk(bDataRequested, "dataRequested event not fired");

		FieldValueHelpDelegate.checkBindingsPending.restore();
		fnResolve();
		oBindingContext.getProperty.restore();
		var fnDone = assert.async();

		vResult.then(function(vResult) {
			assert.ok(true, "Promise Then must be called");
			assert.ok(oWrapper.getKeyForText.calledWith("Item 2", {myExternalIn: "X", myFixIn: "fix", myTestIn: "in3", myTestIn2: "in3-2"}), "getKeyForText of Wrapper called");
			assert.equal(oFieldHelp.getBindingContext(), oField.getBindingContext(), "FieldHelp has BindingContext of Field");
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
		});

		setTimeout( function(){ // as promise is resolves async
			assert.notOk(bDataRequested, "dataRequested event not fired as content exist");
			oModel2.destroy();
			fnDone();
		}, 0);

	});

	QUnit.test("onFieldChange", function(assert) {

		var oOutParameter = new OutParameter({value: "{outParameter}", helpPath: "myTestOut"});
		oFieldHelp.addOutParameter(oOutParameter);
		var oCondition = Condition.createItemCondition("Test", "Test Text", undefined, {"outParameter": "Test"});
		oFieldHelp.setConditions([oCondition]);

		oFieldHelp.onFieldChange();
		assert.equal(oOutParameter.getValue(), "Test", "Out-parameter updated");
		var oData = oModel.getData();
		assert.equal(oData.contexts[0].outParameter, "Test", "Out-parameter updated in Model");

		oFieldHelp.connect(oField2);
		oCondition = Condition.createItemCondition("Test2", "Test Text2", undefined, {"outParameter": "Test2"});
		oFieldHelp.setConditions([oCondition]);
		assert.equal(oOutParameter.getValue(), "out2", "Out-parameter from right bindingConext");
		oFieldHelp.onFieldChange();
		assert.equal(oOutParameter.getValue(), "Test2", "Out-parameter updated");
		oData = oModel.getData();
		assert.equal(oData.contexts[1].outParameter, "Test2", "Out-parameter updated in Model");

	});

	QUnit.test("onFieldChange with async loading of OutParameters", function(assert) {

		var fnResolve;
		var oPromise = new Promise(function(fnMyResolve, fnMyReject) {
			fnResolve = fnMyResolve;
		});
		sinon.stub(FieldValueHelpDelegate, "checkBindingsPending").returns(oPromise);

		var oBindingContext = oField.getBindingContext();
		sinon.stub(oBindingContext, "getProperty");
		oBindingContext.getProperty.withArgs("outParameter").onFirstCall().returns(undefined); // simulate loading needed
		oBindingContext.getProperty.callThrough();

		var oOutParameter = new OutParameter({value: "{outParameter}", helpPath: "myTestOut"});
		oFieldHelp.addOutParameter(oOutParameter);
		var oCondition = Condition.createItemCondition("Test", "Test Text", undefined, {"outParameter": "Test"});
		oFieldHelp.setConditions([oCondition]);

		oFieldHelp.onFieldChange();
		assert.equal(oOutParameter.getValue(), "out1", "Out-parameter not updated");

		oBindingContext.getProperty.restore();
		fnResolve();
		var fnDone = assert.async();

		setTimeout( function(){ // as promise is resolves async
			assert.equal(oOutParameter.getValue(), "Test", "Out-parameter updated");
			var oData = oModel.getData();
			assert.equal(oData.contexts[0].outParameter, "Test", "Out-parameter updated in Model");
			fnDone();
		}, 0);

	});

});
