/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"./ContentBasicTest",
	"sap/ui/mdc/field/content/UnitContent",
	"sap/ui/mdc/field/ConditionType",
	"sap/ui/mdc/field/ConditionsType",
	"sap/ui/mdc/field/FieldInput",
	"sap/ui/mdc/field/FieldMultiInput",
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/odata/v4/TypeMap",
	"sap/m/Token",
	'sap/base/util/merge',
	"sap/ui/core/InvisibleText",
	"sap/ui/model/odata/type/Unit",
	"sap/ui/model/odata/type/Currency"
], (
	QUnit,
	ContentBasicTest,
	UnitContent,
	ConditionType,
	ConditionsType,
	FieldInput,
	FieldMultiInput,
	BaseType,
	FieldEditMode,
	OperatorName,
	ODataV4TypeMap,
	Token,
	merge,
	InvisibleText,
	UnitType,
	CurrencyType
) => {
	"use strict";

	ContentBasicTest.controlMap.Display.detailTests = _checkUnitFields;
	ContentBasicTest.controlMap.Edit = {
		getPathsFunction: "getEdit",
		paths: ["sap/ui/mdc/field/FieldInput", "sap/ui/core/InvisibleText"],
		modules: [FieldInput, InvisibleText],
		instances: [FieldInput, FieldInput],
		createFunction: "createEdit",
		noFormatting: false,
		editMode: FieldEditMode.Editable,
		bindings: [
			{
				value: {path: "$field>/conditions", type: ConditionsType},
				placeholder: {path: "$field>/placeholder"},
				textAlign: {path: "$field>/textAlign"},
				textDirection: {path: "$field>/textDirection"},
				required: {path: "$field>/required"},
				editable: {path: "$field>/editMode"},
				enabled: {path: "$field>/editMode"},
				valueState: {path: "$field>/valueState"},
				valueStateText: {path: "$field>/valueStateText"},
				fieldGroupIds: {path: "$field>/fieldGroupIds"},
				tooltip: {path: "$field>/tooltip"}
			},
			{
				value: {path: "$field>/conditions", type: ConditionsType},
				placeholder: {path: "$field>/placeholder"},
				textAlign: {path: "$field>/textAlign"},
				textDirection: {path: "$field>/textDirection"},
				required: {path: "$field>/required"},
				editable: {path: "$field>/editMode"},
				enabled: {path: "$field>/editMode"},
				valueState: {path: "$field>/valueState"},
				valueStateText: {path: "$field>/valueStateText"},
				showValueHelp: {path: "$field>/_valueHelpEnabled"},
				ariaAttributes: {path: "$field>/_ariaAttributes"},
				fieldGroupIds: {path: "$field>/fieldGroupIds"},
				tooltip: {path: "$field>/tooltip"}
			}
		],
		properties: [
			{
				width: "70%",
				showValueHelp: false,
				autocomplete: false,
				showSuggestion: false,
				valueState: "Warning",
				valueStateText: "My Warning"
			},
			{
				width: "30%",
				autocomplete: false,
				showSuggestion: false,
				valueState: "Warning",
				valueStateText: "My Warning"
			}
		],
		events: [
			{
				change: {value: "1"},
				liveChange: {value: "1", previousValue: "", escPressed: false}
			},
			{
				change: {value: "X"},
				liveChange: {value: "X", previousValue: "", escPressed: false},
				valueHelpRequest: {fromSuggestions: false, fromKeyboard: false}
			}
		],
		detailTests: _checkUnitFields
	};
	ContentBasicTest.controlMap.EditDisplay = {
		key: "Edit",
		getPathsFunction: "getEdit",
		paths: ["sap/ui/mdc/field/FieldInput", "sap/ui/core/InvisibleText"],
		modules: [FieldInput, InvisibleText],
		instances: [FieldInput],
		createFunction: "createEdit",
		noFormatting: false,
		editMode: FieldEditMode.EditableDisplay,
		bindings: [
			{
				value: {path: "$field>/conditions", type: ConditionsType},
				description: {path: "$field>/conditions", type: ConditionsType},
				placeholder: {path: "$field>/placeholder"},
				textAlign: {path: "$field>/textAlign"},
				textDirection: {path: "$field>/textDirection"},
				required: {path: "$field>/required"},
				editable: {path: "$field>/editMode"},
				enabled: {path: "$field>/editMode"},
				valueState: {path: "$field>/valueState"},
				valueStateText: {path: "$field>/valueStateText"},
				fieldGroupIds: {path: "$field>/fieldGroupIds"},
				tooltip: {path: "$field>/tooltip"}
			}
		],
		properties: [
			{
				width: "100%",
				fieldWidth: "70%",
				showValueHelp: false,
				autocomplete: false,
				showSuggestion: false,
				valueState: "Warning",
				valueStateText: "My Warning"
			}
		],
		events: [
			{
				change: {value: "1"},
				liveChange: {value: "1", previousValue: "", escPressed: false}
			}
		],
		detailTests: _checkUnitFields
	};
	ContentBasicTest.controlMapKeys.push("EditDisplay");

	ContentBasicTest.controlMap.EditMultiValue = {
		getPathsFunction: "getEditMultiValue",
		paths: ["sap/ui/mdc/field/FieldMultiInput", "sap/ui/mdc/field/FieldInput", "sap/m/Token", "sap/ui/core/InvisibleText"],
		modules: [FieldMultiInput, FieldInput, Token, InvisibleText],
		instances: [FieldMultiInput, FieldInput],
		createFunction: "createEditMultiValue",
		boundAggregations: ["tokens"],
		aggregationInstances: [Token],
		noFormatting: true,
		editMode: FieldEditMode.Editable,
		bindings: [
			{
				value: {path: "$field>/conditions", type: ConditionsType},
				placeholder: {path: "$field>/placeholder"},
				textAlign: {path: "$field>/textAlign"},
				textDirection: {path: "$field>/textDirection"},
				required: {path: "$field>/required"},
				editable: {path: "$field>/editMode"},
				enabled: {path: "$field>/editMode"},
				valueState: {path: "$field>/valueState"},
				valueStateText: {path: "$field>/valueStateText"},
				fieldGroupIds: {path: "$field>/fieldGroupIds"},
				tooltip: {path: "$field>/tooltip"},
				tokens: {path: "$field>/conditions"}
			},
			{
				value: {path: "$field>/conditions", type: ConditionsType},
				placeholder: {path: "$field>/placeholder"},
				textAlign: {path: "$field>/textAlign"},
				textDirection: {path: "$field>/textDirection"},
				required: {path: "$field>/required"},
				editable: {path: "$field>/editMode"},
				enabled: {path: "$field>/editMode"},
				valueState: {path: "$field>/valueState"},
				valueStateText: {path: "$field>/valueStateText"},
				showValueHelp: {path: "$field>/_valueHelpEnabled"},
				ariaAttributes: {path: "$field>/_ariaAttributes"},
				fieldGroupIds: {path: "$field>/fieldGroupIds"},
				tooltip: {path: "$field>/tooltip"}
			}
		],
		aggregationBindings: [
			{
				text: {path: "$field>", type: ConditionType}
			}
		],
		properties: [
			{
				width: "70%",
				showValueHelp: false,
				autocomplete: false,
				showSuggestion: false,
				valueState: "Warning",
				valueStateText: "My Warning"
			},
			{
				width: "30%",
				autocomplete: false,
				showSuggestion: false,
				valueState: "Warning",
				valueStateText: "My Warning"
			}
		],
		events: [
			{
				change: {value: "1"},
				liveChange: {value: "1", previousValue: "", escPressed: false},
				tokenUpdate: {}
			},
			{
				change: {value: "X"},
				liveChange: {value: "X", previousValue: "", escPressed: false},
				valueHelpRequest: {fromSuggestions: false, fromKeyboard: false}
			}
		],
		detailTests: _checkUnitFields
	};
	ContentBasicTest.controlMap.EditMultiLine = {
		getPathsFunction: "getEditMultiLine",
		paths: [null],
		modules: [],
		instances: [],
		createFunction: "createEditMultiLine",
		noFormatting: false,
		editMode: FieldEditMode.Editable,
		throwsError: true
	};

	ContentBasicTest.controlMap.EditForHelp = merge({}, ContentBasicTest.controlMap.Edit);
	ContentBasicTest.controlMap.EditForHelp.getPathsFunction = "getEditForHelp";
	ContentBasicTest.controlMap.EditForHelp.createFunction = "createEditForHelp";

	const sInvisibleTextIdNumber = InvisibleText.getStaticId("sap.ui.mdc", "field.NUMBER");
	const sInvisibleTextIdUnit = InvisibleText.getStaticId("sap.ui.mdc", "field.UNIT");
	const sInvisibleTextIdCurrency = InvisibleText.getStaticId("sap.ui.mdc", "field.CURRENCY");

	const fnEnhanceField = (oFakeField) => {
		oFakeField.getTypeMap = () => {return ODataV4TypeMap;};
	};

	ContentBasicTest.test(QUnit, UnitContent, "UnitContent", "sap.ui.model.odata.type.Unit", {}, fnEnhanceField, BaseType.Unit, undefined, true);

	const fnCheckValueState = (assert, aControls, oValue) => {
		const oFakeField = this.oContentFactory.getField();
		sinon.stub(oFakeField, "isInvalidInput").returns(true);
		sinon.stub(oFakeField, "_isInvalidInputForContent").withArgs(aControls[0]).returns(false);
		oFakeField._isInvalidInputForContent.withArgs(aControls[1]).returns(true);
		sinon.stub(oFakeField, "_getInvalidInputException").withArgs(aControls[0]).returns(null);
		oFakeField._getInvalidInputException.withArgs(aControls[1]).returns(new Error("My Exception"));
		const oData = ContentBasicTest.model.getData();
		const oBindingValueState0 = aControls[0].getBinding("valueState");
		const oBindingValueState1 = aControls[1].getBinding("valueState");
		const oBindingValueStateText0 = aControls[0].getBinding("valueStateText");
		const oBindingValueStateText1 = aControls[1].getBinding("valueStateText");
		oData.valueState = "Error";
		oData.valueStateText = "My Error";
		oBindingValueState0.checkUpdate(true);
		oBindingValueState1.checkUpdate(true);
		oBindingValueStateText0.checkUpdate(true);
		oBindingValueStateText1.checkUpdate(true);

		assert.equal(aControls[0].getValueState(), "None", "ValueState on first control");
		assert.equal(aControls[1].getValueState(), "Error", "ValueState on second control");
		assert.equal(aControls[0].getValueStateText(), "", "ValueStateText on first control");
		assert.equal(aControls[1].getValueStateText(), "My Exception", "ValueStateText on second control");
		oFakeField.isInvalidInput.restore();
		oFakeField._isInvalidInputForContent.restore();
		oFakeField._getInvalidInputException.restore();
		oData.valueState = "Warning";
		oData.valueStateText = "My Warning";
	};

	function _checkUnitFields(assert, aControls, oValue) {
		const oDataType = this.oContentFactory.retrieveDataType();
		const oFormatOptions = oDataType?.getFormatOptions();
		const oUnitType = this.oContentFactory.getUnitType();
		const oUnitFormatOptions = oUnitType?.getFormatOptions();
		const oUnitOriginalType = this.oContentFactory.getUnitOriginalType();
		const oUnitOriginalFormatOptions = oUnitOriginalType?.getFormatOptions();
		let oBindingInfo;

		switch (oValue.getPathsFunction) {
			case "getDisplay": {
				assert.deepEqual(oFormatOptions, {decimals: 3, preserveDecimals: true, emptyString: 0, parseAsString: true, unitOptional: true}, "DataType: FormatOptions");
				assert.notOk(oUnitType, "No UnitType");
				assert.notOk(oUnitOriginalType, "No UnitOriginalType");

				oBindingInfo = aControls[0].getBindingInfo("text");
				assert.equal(oBindingInfo.type, this.oContentFactory.getConditionsType(), "Control bound to ConditionsType");
				break;
			}
			case "getEdit": {
				assert.deepEqual(oFormatOptions, {decimals: 3, showNumber: true, showMeasure: false, strictParsing: true, preserveDecimals: true, emptyString: 0, parseAsString: true, unitOptional: false}, "DataType: FormatOptions");
				assert.deepEqual(oUnitFormatOptions, {decimals: 3, showNumber: false, showMeasure: true, strictParsing: true, preserveDecimals: true, emptyString: 0, parseAsString: true, unitOptional: false}, "UnitType: FormatOptions");
				assert.deepEqual(oUnitOriginalFormatOptions, {decimals: 3, preserveDecimals: true, emptyString: 0, parseAsString: true, unitOptional: true}, "UnitOriginalType: FormatOptions");

				assert.ok(aControls[0].getAriaDescribedBy().indexOf(sInvisibleTextIdNumber) >= 0, "InvisibleText set on ariaDescribedBy for Number");
				assert.ok(aControls[0].getFieldGroupIds().indexOf("F1") >= 0, "FieldGroupID of Field set on FieldGroupIds for Number");
				assert.ok(aControls[0].getFieldGroupIds().indexOf("X1") >= 0, "FieldGroupID of Parent set on FieldGroupIds for Number");
				oBindingInfo = aControls[0].getBindingInfo("value");
				assert.equal(oBindingInfo.type, this.oContentFactory.getConditionsType(), "Control bound to ConditionsType");
				if (!oValue.key) {// for EditDisplay only one control created
					assert.ok(aControls[1].getAriaDescribedBy().indexOf(sInvisibleTextIdUnit) >= 0, "InvisibleText set on ariaDescribedBy for Unit");
					assert.ok(aControls[1].getFieldGroupIds().indexOf("F1") >= 0, "FieldGroupID of Field set on FieldGroupIds for Unit");
					assert.ok(aControls[1].getFieldGroupIds().indexOf("X1") >= 0, "FieldGroupID of Parent set on FieldGroupIds for Unit");
					oBindingInfo = aControls[1].getBindingInfo("value");
					assert.equal(oBindingInfo.type, this.oContentFactory.getUnitConditionsType(), "Control bound to UnitConditionsType");

					fnCheckValueState(assert, aControls, oValue);
				}

				break;
			}
			case "getEditMultiValue": {
				assert.deepEqual(oFormatOptions, {decimals: 3, showNumber: true, showMeasure: false, strictParsing: true, preserveDecimals: true, emptyString: 0, parseAsString: true, unitOptional: false}, "DataType: FormatOptions");
				assert.deepEqual(oUnitFormatOptions, {decimals: 3, showNumber: false, showMeasure: true, strictParsing: true, preserveDecimals: true, emptyString: 0, parseAsString: true, unitOptional: false}, "UnitType: FormatOptions");
				assert.deepEqual(oUnitOriginalFormatOptions, {decimals: 3, preserveDecimals: true, emptyString: 0, parseAsString: true, unitOptional: true}, "UnitOriginalType: FormatOptions");

				assert.ok(aControls[0].getAriaDescribedBy().indexOf(sInvisibleTextIdNumber) >= 0, "InvisibleText set on ariaDescribedBy for Number");
				assert.ok(aControls[0].getFieldGroupIds().indexOf("F1") >= 0, "FieldGroupID of Field set on FieldGroupIds for Number");
				assert.ok(aControls[0].getFieldGroupIds().indexOf("X1") >= 0, "FieldGroupID of Parent set on FieldGroupIds for Number");
				assert.ok(aControls[1].getAriaDescribedBy().indexOf(sInvisibleTextIdUnit) >= 0, "InvisibleText set on ariaDescribedBy for Unit");
				assert.ok(aControls[1].getFieldGroupIds().indexOf("F1") >= 0, "FieldGroupID of Field set on FieldGroupIds for Unit");
				assert.ok(aControls[1].getFieldGroupIds().indexOf("X1") >= 0, "FieldGroupID of Parent set on FieldGroupIds for Unit");

				oBindingInfo = aControls[0].getBindingInfo("value");
				assert.equal(oBindingInfo.type, this.oContentFactory.getConditionsType(), "Control bound to ConditionsType");
				oBindingInfo = aControls[1].getBindingInfo("value");
				assert.equal(oBindingInfo.type, this.oContentFactory.getUnitConditionsType(), "Control bound to UnitConditionsType");

				fnCheckValueState(assert, aControls, oValue);

				// test filter function of Token-Binding
				oBindingInfo = aControls[0].getBindingInfo("tokens");
				assert.ok(oBindingInfo.filters?.[0].getTest()([[1, "EUR"]]), "Condition with number and measure leads to Token");
				assert.notOk(oBindingInfo.filters?.[0].getTest()([[null, "EUR"]]), "Condition without number but measure don't leads to Token");

				break;
			}
			default:
				break;
		}
	}

	QUnit.module("Deprecations", {
		beforeEach: () => {
			ContentBasicTest.initContentFactory("sap.ui.model.odata.type.Currency", {}, fnEnhanceField, BaseType.Unit);
		},
		afterEach: () => {
			ContentBasicTest.cleanUpContentFactory();
		}
	});

	QUnit.test("Prefers deprecated getUnitTypeInstance, if available", (assert) => {

		const oAdjustDataTypeForUnitSpy = sinon.spy(UnitContent, "_adjustDataTypeForUnit");
		ODataV4TypeMap.getUnitTypeInstance = () => {
			return false;
		};
		const oGetUnitTypeInstanceStub = sinon.stub(ODataV4TypeMap, "getUnitTypeInstance");

		const aControls = UnitContent.create(this.oContentFactory, "Edit", OperatorName.EQ, [FieldInput, InvisibleText], "F1-inner");
		assert.ok(oAdjustDataTypeForUnitSpy.calledOnce, "_adjustDataTypeForUnit is called.");
		assert.ok(oGetUnitTypeInstanceStub.calledTwice, "getUnitTypeInstance is called twice.");
		const oType = this.oContentFactory.retrieveDataType();
		assert.deepEqual(oGetUnitTypeInstanceStub.args[0], [oType, true, false], "getUnitTypeInstance is called with expected args.");
		assert.deepEqual(oGetUnitTypeInstanceStub.args[1], [oType, false, true], "getUnitTypeInstance is called with expected args.");

		oGetUnitTypeInstanceStub.restore();
		delete ODataV4TypeMap.getUnitTypeInstance;
		oAdjustDataTypeForUnitSpy.restore();

		aControls.forEach((oCreatedControl, iIndex) => {
			oCreatedControl.destroy();
		});
	});

	QUnit.test("Calls getDataTypeInstance with additional options, if getUnitTypeInstance is unavailable", (assert) => {

		const oAdjustDataTypeForUnitSpy = sinon.spy(UnitContent, "_adjustDataTypeForUnit");
		const oGetDataTypeInstanceSpy = sinon.spy(ODataV4TypeMap, "getDataTypeInstance");

		const oType = this.oContentFactory.retrieveDataType();
		const sType = oType.getMetadata().getName();
		const oFormatOptions = oType.getFormatOptions();

		const aControls = UnitContent.create(this.oContentFactory, "Edit", OperatorName.EQ, [FieldInput, InvisibleText], "F1-inner");
		assert.ok(oAdjustDataTypeForUnitSpy.calledOnce, "_adjustDataTypeForUnit is called.");
		assert.ok(oGetDataTypeInstanceSpy.calledThrice, "oGetDataTypeInstanceSpy is called thrice.");
		assert.deepEqual(oGetDataTypeInstanceSpy.args[1], [sType, oFormatOptions, undefined, {showNumber: true, showMeasure: false}], "getDataTypeInstance is called with expected args.");
		assert.deepEqual(oGetDataTypeInstanceSpy.args[2], [sType, oFormatOptions, undefined, {showNumber: false, showMeasure: true}], "getDataTypeInstance is called with expected args.");
		aControls[0].setModel(ContentBasicTest.model, "$field"); // to create bindings
		aControls[1].setModel(ContentBasicTest.model, "$field"); // to create bindings
		assert.ok(aControls[1].getAriaDescribedBy().indexOf(sInvisibleTextIdCurrency) >= 0, "InvisibleText set on ariaDescribedBy for Currency");
		assert.ok(aControls[0].getFieldGroupIds().indexOf("F1") >= 0, "FieldGroupID of Field set on FieldGroupIds for Number"); // to test without faked parent
		assert.ok(aControls[0].getFieldGroupIds().indexOf("X1") >= 0, "FieldGroupID of Parent set on FieldGroupIds for Number");
		assert.ok(aControls[1].getFieldGroupIds().indexOf("F1") >= 0, "FieldGroupID of Field set on FieldGroupIds for Unit");
		assert.ok(aControls[1].getFieldGroupIds().indexOf("X1") >= 0, "FieldGroupID of Parent set on FieldGroupIds for Unit");
		oAdjustDataTypeForUnitSpy.restore();
		oGetDataTypeInstanceSpy.restore();

		aControls.forEach((oCreatedControl, iIndex) => {
			oCreatedControl.destroy();
		});
	});

	QUnit.start();
});