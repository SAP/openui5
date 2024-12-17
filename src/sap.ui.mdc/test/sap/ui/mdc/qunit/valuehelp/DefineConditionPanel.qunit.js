/* global QUnit, sinon */

/*eslint max-nested-callbacks: [2, 20]*/

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/valuehelp/base/DefineConditionPanel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	// bring back to default one
	"sap/ui/mdc/field/FieldBaseDelegate",
	// don't want to test async loading in Field here
	"sap/ui/mdc/field/FieldInput",
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/enums/OperatorValueType",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/String",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Float",
	"sap/ui/model/odata/type/Boolean",
	"sap/ui/model/odata/type/Decimal",
	"sap/ui/model/FilterOperator",
	// don't want to test async loading in Field here
	"sap/m/DatePicker",
	// don't want to test async loading in Field here
	"sap/m/DateTimePicker",
	// don't want to test async loading in Field here
	"sap/m/Text",
	// test custom control
	"sap/m/Button",
	"sap/ui/core/ListItem",
	"sap/base/util/merge",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/utils/nextUIUpdate",
	// needed for FixedList getContent
	"sap/m/List",
	// needed for FixedList getContent
	"sap/m/DisplayListItem",
	// needed for FixedList getContent
	"sap/m/library",
	// needed for FixedList getContent
	"sap/ui/model/Filter",
	// needed for FixedList getContent
	"sap/ui/model/Sorter",
	// needed for FixedList getContent
	"sap/ui/model/base/ManagedObjectModel",
	// needed for FixedList getContent
	"sap/base/strings/whitespaceReplacer"
], (
	Element,
	Library,
	jQuery,
	qutils,
	DefineConditionPanel,
	Condition,
	FilterOperatorUtil,
	Operator,
	FieldBaseDelegate,
	FieldInput,
	BaseType,
	ConditionValidated,
	FieldEditMode,
	OperatorName,
	OperatorValueType,
	JSONModel,
	StringType,
	DateType,
	DateTimeType,
	IntegerType,
	FloatType,
	BooleanType,
	DecimalType,
	FilterOperator,
	DatePicker,
	DateTimePicker,
	Text,
	Button,
	ListItem,
	merge,
	KeyCodes,
	nextUIUpdate,
	List,
	DisplayListItem,
	mLibrary,
	Filter,
	Sorter,
	ManagedObjectModel,
	whitespaceReplacer
) => {
	"use strict";

	const oMessageBundle = Library.getResourceBundleFor("sap.ui.mdc");
	let oDefineConditionPanel;
	let oModel;
	let oDataType;
	let oConfig;

	const _init = async (bNoRender, oType) => {
		if (!oType) {
			oDataType = new StringType();
		} else {
			oDataType = oType;
			// var oIntType = new IntegerType({}, {maximum: 10});
			// var oStringType = new StringType({}, {maxLength: 5});
			// var oNUMCType = new StringType({}, {maxLength: 5, isDigitSequence: true, nullable: false});
		}

		oConfig = {
				dataType: oDataType,
				maxConditions: -1,
				delegate: FieldBaseDelegate,
				delegateName: "sap/ui/mdc/field/FieldBaseDelegate"
		};

		oModel = new JSONModel({conditions: []});

		oDefineConditionPanel = new DefineConditionPanel("DCP1", {
			conditions: '{cm>/conditions}',
			config: oConfig,
			models: {
				"cm": oModel
			}
		}).placeAt("content");

		if (!bNoRender) {
			await nextUIUpdate();
		}
	};

	const _teardown = () => {
		oDefineConditionPanel.destroy();
		oDataType.destroy();
		oDataType = undefined;
		oConfig = undefined;
		if (oModel) {
			oModel.destroy();
			oModel = undefined;
		}
	};

	const _getModelConditions = () => {
		const aConditions = oModel.getData().conditions;
		return merge([], aConditions);
	};

	const _addModelCondition = (oCondition) => {
		const aConditions = oModel.getData().conditions;
		aConditions.push(oCondition);
		oModel.checkUpdate(true);
	};

	const _setModelConditions = (aConditions) => {
		oModel.getData().conditions = aConditions;
		oModel.checkUpdate(true);
	};

	QUnit.module("Common functions", {
		beforeEach: async () => {
			await _init();
			},
		afterEach: _teardown
	});

	QUnit.test("Basic tests", (assert) => {
		assert.equal(oDefineConditionPanel != null, true, "instance can be created");
	});

	QUnit.test("bind empty condition Model and add one condition", async (assert) => {

		let aConditions = _getModelConditions();
		assert.equal(aConditions.length, 1, "one empty condition should exist");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "Operator of empty condition");
		assert.equal(aConditions[0].values[0], null, "Value of empty condition");
		assert.ok(aConditions[0].isEmpty, "isEmpty of empty condition");

		_addModelCondition(Condition.createCondition(OperatorName.EQ, ["Andreas"], undefined, undefined, ConditionValidated.NotValidated));
		await nextUIUpdate();
		aConditions = _getModelConditions();
		assert.equal(aConditions.length, 2, "2 conditions should exist");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "Operator of first condition");
		assert.equal(aConditions[0].values[0], null, "Value of first condition");
		assert.ok(aConditions[0].isEmpty, "isEmpty of first condition");
		assert.equal(aConditions[1].operator, OperatorName.EQ, "Operator of second condition");
		assert.equal(aConditions[1].values[0], "Andreas", "Value of second condition");
		assert.notOk(aConditions[1].isEmpty, "isEmpty of second condition");

	});

	QUnit.test("dummy condition with different operator", async (assert) => {

		oConfig = {
				dataType: oDataType,
				maxConditions: -1,
				operators: [OperatorName.BT],
				delegate: FieldBaseDelegate,
				delegateName: "sap/ui/mdc/field/FieldBaseDelegate"
		};

		oDefineConditionPanel.setConfig(oConfig);
		_setModelConditions([]);
		oDefineConditionPanel.invalidate(); // to invalidate operator texts
		await nextUIUpdate();

		const fnDone = assert.async();
		setTimeout(() => { // to wait for retemplating
			setTimeout(() => { // to for internal Conditions update in DefineConditionPanel (is async)
				const aConditions = _getModelConditions();
				assert.equal(aConditions.length, 1, "one empty condition should exist");
				assert.equal(aConditions[0].operator, OperatorName.BT, "Operator of empty condition");
				assert.equal(aConditions[0].values[0], null, "Value of empty condition");
				assert.ok(aConditions[0].isEmpty, "isEmpty of empty condition");
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("bind filled condition Model", (assert) => {

		const oConfig = merge({}, oDefineConditionPanel.getConfig());
		oConfig.maxConditions = 4;
		oDefineConditionPanel.setConfig(oConfig); // to test visibility of add button

		sinon.spy(oDefineConditionPanel, "updateDefineConditions");
		// update twice to test only one call of dummy row

		_setModelConditions([
			Condition.createCondition(OperatorName.EQ, ["Peter"], undefined, undefined, ConditionValidated.NotValidated)
		]);

		_setModelConditions([
			Condition.createCondition(OperatorName.EQ, ["Andreas"], undefined, undefined, ConditionValidated.NotValidated),
			Condition.createCondition(OperatorName.EQ, ["Martin"], undefined, undefined, ConditionValidated.Validated), // will be hidden
			Condition.createCondition(OperatorName.EQ, ["Peter"], undefined, undefined, ConditionValidated.NotValidated)
		]);

		const fnDone = assert.async();

		setTimeout(async () => {
			await nextUIUpdate();
			assert.ok(oDefineConditionPanel.updateDefineConditions.calledOnce, "updateDefineConditions called once");
			assert.equal(_getModelConditions().length, 3, "3 conditions should exist");
			const oGrid = Element.getElementById("DCP1--conditions");
			let aContent = oGrid.getContent();
			assert.equal(aContent.length, 9, "two rows with one field created - Grid contains 9 controls");

			assert.equal(oDefineConditionPanel.getInitialFocusedControl(), aContent[0], "First Operator-Field is initial focus control");

			const oAddBtn = Element.getElementById("DCP1--addBtn");
			const oGridData = oAddBtn.getLayoutData();
			assert.ok(oGridData.getVisibleL(), "Add-Button is visible");
			oAddBtn.firePress();
			setTimeout(async () => { // as condition rendering is triggered async.
				await nextUIUpdate();
				assert.equal(_getModelConditions().length, 4, "4 conditions should exist");
				aContent = oGrid.getContent();
				assert.equal(aContent.length, 13, "three rows with one field created - Grid contains 13 controls");
				assert.notOk(oGridData.getVisibleL(), "Add-Button is not visible");

				const oRemoveBtn = Element.getElementById("DCP1--2--removeBtnLarge");
				oRemoveBtn.firePress();
				setTimeout(async () => { // as condition rendering is triggered async.
					await nextUIUpdate();
					assert.equal(_getModelConditions().length, 3, "3 conditions should exist");
					assert.ok(oGridData.getVisibleL(), "Add-Button is visible");
					assert.ok(oAddBtn.getVisible(), "Button is visible");
					aContent = oGrid.getContent();
					assert.equal(aContent.length, 9, "two rows with one field created - Grid contains 9 controls");

					fnDone();
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("show conditions with custom Operator", (assert) => {

		let oOperator = new Operator({
			name: "MyInclude",
			filterOperator: FilterOperator.EQ,
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [OperatorValueType.Self],
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oOperator);

		oOperator = new Operator({ // test excluding operator with validation
			name: "MyExclude",
			filterOperator: FilterOperator.NE,
			tokenParse: "^!=(.+)$",
			tokenFormat: "!(={0})",
			valueTypes: [OperatorValueType.Self],
			exclude: true,
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oOperator);

		const oConfig = merge({}, oDefineConditionPanel.getConfig());
		oConfig.maxConditions = 4;
		oConfig.operators = ["MyInclude", OperatorName.BT, "MyExclude"];
		oConfig.defaultOperatorName = "MyInclude";
		oDefineConditionPanel.setConfig(oConfig); // to test visibility of add button

		_setModelConditions([
			Condition.createCondition("MyInclude", ["Andreas"], undefined, undefined, ConditionValidated.NotValidated),
			Condition.createCondition("MyExclude", ["Martin"], undefined, undefined, ConditionValidated.Validated), // will not be hidden
			Condition.createCondition("MyInclude", ["Peter"], undefined, undefined, ConditionValidated.Validated) // will be hidden
		]);

		const fnDone = assert.async();

		setTimeout(async () => { // for model update
			await nextUIUpdate();
			setTimeout(() => { // for internal Controls update via ManagedObjectModel
				const oGrid = Element.getElementById("DCP1--conditions");
				const aContent = oGrid.getContent();
				assert.equal(aContent.length, 9, "two rows with one field created - Grid contains 9 controls");

				delete FilterOperatorUtil._mOperators["MyInclude"]; // TODO API to remove operator
				delete FilterOperatorUtil._mOperators["MyExclude"]; // TODO API to remove operator
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("change condition value field", (assert) => {

		_setModelConditions([
			Condition.createCondition(OperatorName.EQ, ["Andreas"], undefined, undefined, ConditionValidated.NotValidated)
		]);

		const fnDone = assert.async();

		setTimeout(async () => { // for model update
			await nextUIUpdate();
			assert.equal(_getModelConditions().length, 1, "1 conditions should exist");

			const oGrid = Element.getElementById("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];

			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			assert.ok(oField?.isA("sap.ui.mdc.Field"), "Field is mdc Field");
			aContent = oField?.getAggregation("_content");
			const oControl = aContent?.length > 0 && aContent[0];
			assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field uses Input");
			assert.equal(oField.getValue(), "Andreas", "Value of Field");
			assert.equal(oField.getPlaceholder(), oMessageBundle.getText("valuehelp.DEFINECONDITIONS_VALUE"), "Placeholder of Field");

			jQuery(oField.getFocusDomRef()).val("foo");
			qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
			await nextUIUpdate();

			assert.equal(_getModelConditions().length, 1, "1 conditions should exist");
			assert.equal(_getModelConditions()[0].values[0], "foo", "condition value should be changed");
			fnDone();
		}, 0);

	});

	QUnit.test("change condition operator EQ->BT", (assert) => {

		_setModelConditions([
			Condition.createCondition(OperatorName.EQ, ["Andreas"], undefined, undefined, ConditionValidated.NotValidated)
		]);

		const fnDone = assert.async();
		setTimeout(async () => { // wait for rendering
			await nextUIUpdate();
			const oOperatorField = Element.getElementById("DCP1--0-operator-inner");
			oOperatorField.setValue(OperatorName.BT);
			oOperatorField.fireChange({value: OperatorName.BT}); // fake item select

			setTimeout(() => { // as model update is async
				setTimeout(() => { // as parsing is async
					setTimeout(() => { // as model update is async
						setTimeout(async () => { // as row update is async
							await nextUIUpdate();
							const aConditions = oDefineConditionPanel.getConditions();
							assert.equal(aConditions[0].operator, OperatorName.BT, "Operator set on condition");
							assert.deepEqual(aConditions[0].values, ["Andreas", null], "Values set on condition");

							const oGrid = Element.getElementById("DCP1--conditions");
							const aContent = oGrid.getContent();
							const oField1 = aContent[2];
							const oField2 = aContent[3];

							assert.equal(aContent.length, 6, "One row with two fields created - Grid contains 6 controls");
							assert.ok(oField1?.isA("sap.ui.mdc.Field"), "Field1 is mdc Field");
							assert.ok(oField2?.isA("sap.ui.mdc.Field"), "Field2 is mdc Field");
							assert.equal(oField1?.getPlaceholder(), oMessageBundle.getText("valuehelp.DEFINECONDITIONS_FROM"), "Placeholder of Field1");
							assert.equal(oField2?.getPlaceholder(), oMessageBundle.getText("valuehelp.DEFINECONDITIONS_TO"), "Placeholder of Field2");
							assert.equal(oField1?.getValue(), "Andreas", "Field1 value not changed");
							assert.equal(oField2?.getValue(), null, "Field2 value is empty");
							fnDone();
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("change condition operator BT->EQ", (assert) => {

		_setModelConditions([
			Condition.createCondition(OperatorName.BT, ["A", "Z"], undefined, undefined, ConditionValidated.NotValidated)
		]);

		const fnDone = assert.async();
		setTimeout(async () => { // wait for rendering
			await nextUIUpdate();
			const oOperatorField = Element.getElementById("DCP1--0-operator-inner");
			oOperatorField.setValue(OperatorName.EQ);
			oOperatorField.fireChange({value: OperatorName.EQ}); // fake item select

			setTimeout(() => { // as model update is async
				setTimeout(() => { // as parsing is async
					setTimeout(() => { // as model update is async
						setTimeout(async () => { // as row update is async
							await nextUIUpdate();
							const aConditions = oDefineConditionPanel.getConditions();
							assert.equal(aConditions[0].operator, OperatorName.EQ, "Operator set on condition");
							assert.deepEqual(aConditions[0].values, ["A"], "Values set on condition");

							const oGrid = Element.getElementById("DCP1--conditions");
							const aContent = oGrid.getContent();
							const oField1 = aContent[2];

							assert.equal(aContent.length, 5, "One row with one fields created - Grid contains 5 controls");
							assert.ok(oField1?.isA("sap.ui.mdc.Field"), "Field1 is mdc Field");
							assert.equal(oField1?.getPlaceholder(), oMessageBundle.getText("valuehelp.DEFINECONDITIONS_VALUE"), "Placeholder of Field1");
							assert.equal(oField1?.getValue(), "A", "Field1 value not changed");

							fnDone();
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("change condition operator BT->Empty", (assert) => {

		_setModelConditions([
			Condition.createCondition(OperatorName.BT, ["A", "Z"], undefined, undefined, ConditionValidated.NotValidated)
		]);

		const fnDone = assert.async();
		setTimeout(async () => { // wait for rendering
			await nextUIUpdate();
			const oOperatorField = Element.getElementById("DCP1--0-operator-inner");
			oOperatorField.setValue(OperatorName.Empty);
			oOperatorField.fireChange({value: OperatorName.Empty}); // fake item select

			setTimeout(() => { // as model update is async
				setTimeout(() => { // as parsing is async
					setTimeout(() => { // as model update is async
						setTimeout(async () => { // as row update is async
							await nextUIUpdate();
							const aConditions = oDefineConditionPanel.getConditions();
							assert.equal(aConditions[0].operator, OperatorName.Empty, "Operator set on condition");
							assert.deepEqual(aConditions[0].values, [], "Values set on condition");

							const oGrid = Element.getElementById("DCP1--conditions");
							const aContent = oGrid.getContent();

							assert.equal(aContent.length, 4, "One row with no fields created - Grid contains 4 controls");

							fnDone();
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("change condition operator invalid", (assert) => {

		_setModelConditions([
			Condition.createCondition(OperatorName.BT, ["A", "Z"], undefined, undefined, ConditionValidated.NotValidated)
		]);

		const fnDone = assert.async();
		setTimeout(async () => { // wait for rendering
			await nextUIUpdate();
			const oOperatorField = Element.getElementById("DCP1--0-operator-inner");
			oOperatorField.setDOMValue("XXX");
			oOperatorField.setValue("XXX");
			oOperatorField.fireChange({value: "XXX"}); // fake wrong input

			setTimeout(() => { // as model update is async
				setTimeout(() => { // as parsing is async
					setTimeout(() => { // as model update is async
						setTimeout(async () => { // as row update is async
							await nextUIUpdate();
							let aConditions = oDefineConditionPanel.getConditions();
							assert.equal(aConditions[0].operator, OperatorName.BT, "Operator set on condition");
							assert.deepEqual(aConditions[0].values, ["A", "Z"], "Values set on condition");

							const oGrid = Element.getElementById("DCP1--conditions");
							let aContent = oGrid.getContent();
							let oField1 = aContent[2];
							let oField2 = aContent[3];

							assert.equal(aContent.length, 6, "One row with two fields created - Grid contains 6 controls");
							assert.ok(oField1?.isA("sap.ui.mdc.Field"), "Field1 is mdc Field");
							assert.ok(oField2?.isA("sap.ui.mdc.Field"), "Field2 is mdc Field");
							assert.equal(oField1?.getEditMode(), FieldEditMode.ReadOnly, "Field1 is readonly");
							assert.equal(oField2?.getEditMode(), FieldEditMode.ReadOnly, "Field2 is readonly");
							assert.notOk(oDefineConditionPanel.getInputOK(), "InputOK not set");

							oOperatorField.setValue(OperatorName.BT);
							oOperatorField.fireChange({value: OperatorName.BT}); // fake right input

							setTimeout(() => { // as model update is async
								setTimeout(() => { // as parsing is async
									setTimeout(() => { // as model update is async
										setTimeout(async () => { // as row update is async
											await nextUIUpdate();
											aConditions = oDefineConditionPanel.getConditions();
											assert.equal(aConditions[0].operator, OperatorName.BT, "Operator set on condition");
											assert.deepEqual(aConditions[0].values, ["A", "Z"], "Values set on condition");

											aContent = oGrid.getContent();
											oField1 = aContent[2];
											oField2 = aContent[3];

											assert.equal(aContent.length, 6, "One row with two fields created - Grid contains 6 controls");
											assert.ok(oField1?.isA("sap.ui.mdc.Field"), "Field1 is mdc Field");
											assert.ok(oField2?.isA("sap.ui.mdc.Field"), "Field2 is mdc Field");
											assert.equal(oField1?.getEditMode(), FieldEditMode.Editable, "Field1 is editable");
											assert.equal(oField2?.getEditMode(), FieldEditMode.Editable, "Field2 is editable");
											assert.ok(oDefineConditionPanel.getInputOK(), "InputOK set");

											fnDone();
										}, 0);
									}, 0);
								}, 0);
							}, 0);
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("validate condition on user input", (assert) => {

		_setModelConditions([
			Condition.createCondition(OperatorName.BT, ["A", "B"], undefined, undefined, ConditionValidated.NotValidated)
		]);

		const fnDone = assert.async();

		setTimeout(async () => { // for model update
			await nextUIUpdate();
			assert.equal(_getModelConditions().length, 1, "1 conditions should exist");
			assert.ok(oDefineConditionPanel.getInputOK(), "InputOK set as default");

			const oGrid = Element.getElementById("DCP1--conditions");
			const aContent = oGrid.getContent();
			const oOperatorField = aContent[0];
			const oField1 = aContent[2];
			const oField2 = aContent[3];
			const oButton = aContent[4];

			oField1.focus();
			setTimeout(async () => { // for FieldGroup delay
				jQuery(oField1.getFocusDomRef()).val("B");
				qutils.triggerKeydown(oField1.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
				oButton.focus(); // to leave FieldGroup
				await nextUIUpdate();
				setTimeout(() => { // for FieldGroup delay

					assert.equal(oField1.getValueState(), "Error", "first Field has Error state");
					assert.ok(oField1.getValueStateText(), "first Field has Error state text");
					assert.equal(oField2.getValueState(), "Error", "second Field has Error state");
					assert.ok(oField2.getValueStateText(), "second Field has Error state text");
					assert.notOk(oDefineConditionPanel.getInputOK(), "InputOK not set");

					oField2.focus();
					setTimeout(async () => { // for fieldGroup delay
						jQuery(oField2.getFocusDomRef()).val("C");
						qutils.triggerKeydown(oField2.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
						oButton.focus(); // to leave FieldGroup
						await nextUIUpdate();
						setTimeout(() => { // for FieldGroup delay

							assert.equal(oField1.getValueState(), "None", "first Field has no Error state");
							assert.notOk(oField1.getValueStateText(), "first Field has no Error state text");
							assert.equal(oField2.getValueState(), "None", "second Field has no Error state");
							assert.notOk(oField2.getValueStateText(), "second Field has no Error state text");
							assert.ok(oDefineConditionPanel.getInputOK(), "InputOK set");

							assert.equal(_getModelConditions().length, 1, "1 conditions should exist");
							assert.equal(_getModelConditions()[0].values[0], "B", "condition value0 should be changed");
							assert.equal(_getModelConditions()[0].values[1], "C", "condition value1 should be changed");

							oField1.focus();
							setTimeout(() => { // for FieldGroup delay
								jQuery(oField1.getFocusDomRef()).val("C");
								qutils.triggerKeydown(oField1.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
								oOperatorField.focus();
								setTimeout(async () => { // for FieldGroup delay
									oButton.focus(); // to leave FieldGroup
									await nextUIUpdate();
									setTimeout(() => { // for FieldGroup delay

										assert.equal(oField1.getValueState(), "Error", "first Field has Error state");
										assert.ok(oField1.getValueStateText(), "first Field has Error state text");
										assert.equal(oField2.getValueState(), "Error", "second Field has Error state");
										assert.ok(oField2.getValueStateText(), "second Field has Error state text");
										assert.notOk(oDefineConditionPanel.getInputOK(), "InputOK not set");

										assert.equal(_getModelConditions().length, 1, "1 conditions should exist");
										assert.equal(_getModelConditions()[0].values[0], "C", "condition value0 should be changed");
										assert.equal(_getModelConditions()[0].values[1], "C", "condition value1 should be changed");

										oField1._setInvalidInput(new Error()); // fake parse error
										oDefineConditionPanel.cleanUp();
										assert.equal(oField1.getValue(), null, "first Field value cleared");
										// removing valueStae is tested in Field.qunit -> needs a real parse error to work

										fnDone();
									}, 0);
								}, 0);
							}, 0);
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("duplicate conditions", (assert) => {

		_setModelConditions([
			Condition.createCondition(OperatorName.BT, ["A", "B"], undefined, undefined, ConditionValidated.NotValidated),
			Condition.createCondition(OperatorName.BT, ["C", "D"], undefined, undefined, ConditionValidated.NotValidated)
		]);

		const fnDone = assert.async();

		setTimeout(async () => { // for model update
			await nextUIUpdate();
			const oGrid = Element.getElementById("DCP1--conditions");
			const aContent = oGrid.getContent();
			const oField1 = aContent[2];
			const oField2 = aContent[3];
			const oButton = aContent[4];
			const oField3 = aContent[7];
			const oField4 = aContent[8];
			const oButton2 = aContent[9];

			oField1.focus();
			setTimeout(async () => { // for FieldGroup delay
				jQuery(oField1.getFocusDomRef()).val("C");
				qutils.triggerKeydown(oField1.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
				jQuery(oField2.getFocusDomRef()).val("D");
				qutils.triggerKeydown(oField2.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
				oButton.focus(); // to leave FieldGroup
				await nextUIUpdate();
				setTimeout(() => { // for FieldGroup delay
					assert.equal(oField1.getValueState(), "Error", "first Field has Error state");
					assert.ok(oField1.getValueStateText(), "first Field has Error state text");
					assert.equal(oField2.getValueState(), "Error", "second Field has Error state");
					assert.ok(oField2.getValueStateText(), "second Field has Error state text");
					assert.notOk(oDefineConditionPanel.getInputOK(), "InputOK not set");

					oField1.focus();
					setTimeout(async () => { // for fieldGroup delay
						jQuery(oField1.getFocusDomRef()).val("A");
						qutils.triggerKeydown(oField1.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
						oButton.focus(); // to leave FieldGroup
						await nextUIUpdate();
						setTimeout(() => { // for FieldGroup delay

							assert.equal(oField1.getValueState(), "None", "first Field has no Error state");
							assert.notOk(oField1.getValueStateText(), "first Field has no Error state text");
							assert.equal(oField2.getValueState(), "None", "second Field has no Error state");
							assert.notOk(oField2.getValueStateText(), "second Field has no Error state text");
							assert.ok(oDefineConditionPanel.getInputOK(), "InputOK set");

							oField3.focus();
							setTimeout(async () => { // for FieldGroup delay
								jQuery(oField3.getFocusDomRef()).val("A");
								qutils.triggerKeydown(oField1.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
								oButton2.focus(); // to leave FieldGroup
								await nextUIUpdate();
								setTimeout(() => { // for FieldGroup delay

									assert.equal(oField3.getValueState(), "Error", "first Field has Error state");
									assert.ok(oField3.getValueStateText(), "first Field has Error state text");
									assert.equal(oField4.getValueState(), "Error", "second Field has Error state");
									assert.ok(oField4.getValueStateText(), "second Field has Error state text");
									assert.notOk(oDefineConditionPanel.getInputOK(), "InputOK not set");

									oField1.focus();
									setTimeout(async () => { // for fieldGroup delay
										jQuery(oField1.getFocusDomRef()).val("B");
										qutils.triggerKeydown(oField1.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
										oButton.focus(); // to leave FieldGroup
										await nextUIUpdate();
										setTimeout(() => { // for FieldGroup delay
											assert.equal(oField3.getValueState(), "None", "first Field has no Error state");
											assert.notOk(oField3.getValueStateText(), "first Field has no Error state text");
											assert.equal(oField4.getValueState(), "None", "second Field has no Error state");
											assert.notOk(oField4.getValueStateText(), "second Field has no Error state text");
											assert.ok(oDefineConditionPanel.getInputOK(), "InputOK set");

											fnDone();
										}, 0);
									}, 0);
								}, 0);
							}, 0);
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("duplicate static conditions", (assert) => {

		_setModelConditions([
			Condition.createCondition(OperatorName.Empty, [], undefined, undefined, ConditionValidated.NotValidated),
			Condition.createCondition(OperatorName.NotEmpty, [], undefined, undefined, ConditionValidated.NotValidated)
		]);

		const fnDone = assert.async();
		setTimeout(async () => { // wait for rendering
			await nextUIUpdate();
			const oOperatorField1 = Element.getElementById("DCP1--0-operator-inner");
			const oOperatorField2 = Element.getElementById("DCP1--1-operator-inner");
			oOperatorField2.setValue(OperatorName.Empty);
			oOperatorField2.fireChange({value: OperatorName.Empty});

			setTimeout(() => { // as model update is async
				setTimeout(() => { // as parsing is async
					setTimeout(() => { // as model update is async
						setTimeout(async () => { // as row update is async
							await nextUIUpdate();
							let aConditions = oDefineConditionPanel.getConditions();
							assert.equal(aConditions[1].operator, OperatorName.Empty, "Operator set on condition");
							assert.equal(oOperatorField2.getValueState(), "Error", "Operator Field has Error state");
							assert.ok(oOperatorField2.getValueStateText(), "Operator Field has Error state text");
							assert.notOk(oDefineConditionPanel.getInputOK(), "InputOK not set");

							oOperatorField2.setValue(OperatorName.NotEmpty);
							oOperatorField2.fireChange({value: OperatorName.NotEmpty});

							setTimeout(() => { // as model update is async
								setTimeout(() => { // as parsing is async
									setTimeout(() => { // as model update is async
										setTimeout(async () => { // as row update is async
											await nextUIUpdate();
											aConditions = oDefineConditionPanel.getConditions();
											assert.equal(aConditions[1].operator, OperatorName.NotEmpty, "Operator set on condition");
											assert.equal(oOperatorField2.getValueState(), "None", "Operator Field has no Error state");
											assert.notOk(oOperatorField2.getValueStateText(), "Operator Field has no Error state text");
											assert.ok(oDefineConditionPanel.getInputOK(), "InputOK set");

											oOperatorField1.setValue(OperatorName.NotEmpty);
											oOperatorField1.fireChange({value: OperatorName.NotEmpty});

											setTimeout(() => { // as model update is async
												setTimeout(() => { // as parsing is async
													setTimeout(() => { // as model update is async
														setTimeout(async () => { // as row update is async
															await nextUIUpdate();
															let aConditions = oDefineConditionPanel.getConditions();
															assert.equal(aConditions[0].operator, OperatorName.NotEmpty, "Operator set on condition");
															assert.equal(oOperatorField1.getValueState(), "Error", "Operator Field has Error state");
															assert.ok(oOperatorField1.getValueStateText(), "Operator Field has Error state text");
															assert.notOk(oDefineConditionPanel.getInputOK(), "InputOK not set");

															oOperatorField2.setValue(OperatorName.Empty);
															oOperatorField2.fireChange({value: OperatorName.Empty});

															setTimeout(() => { // as model update is async
																setTimeout(() => { // as parsing is async
																	setTimeout(() => { // as model update is async
																		setTimeout(async () => { // as row update is async
																			await nextUIUpdate();
																			aConditions = oDefineConditionPanel.getConditions();
																			assert.equal(aConditions[1].operator, OperatorName.Empty, "Operator set on condition");
																			assert.equal(oOperatorField1.getValueState(), "None", "Operator Field has no Error state");
																			assert.notOk(oOperatorField1.getValueStateText(), "Operator Field has no Error state text");
																			assert.ok(oDefineConditionPanel.getInputOK(), "InputOK set");

																			fnDone();
																		}, 0);
																	}, 0);
																}, 0);
															}, 0);
														}, 0);
													}, 0);
												}, 0);
											}, 0);
										}, 0);
									}, 0);
								}, 0);
							}, 0);
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

	let oCustomOperator;

	QUnit.module("Custom Operator", {
		beforeEach() {
			oCustomOperator = new Operator({
				name: "MyOperator",
				filterOperator: FilterOperator.EQ,
				tokenParse: "^#tokenText#$",
				tokenFormat: "#tokenText#",
				tokenText: "Text",
				longText: "Longtext",
				valueTypes: [OperatorValueType.Self],
				createControl(oType, sPath, index, sId) {
					return new Button({text: {path: sPath, type: oType}});
				}
			});

			FilterOperatorUtil.addOperator(oCustomOperator);
			_init(true);
			const oConfig = merge({}, oDefineConditionPanel.getConfig());
			oConfig.defaultOperatorName = "MyOperator";
			oDefineConditionPanel.setConfig(oConfig); // to test visibility of add button
		},
		afterEach() {
			_teardown();
			delete FilterOperatorUtil._mOperators[oCustomOperator.name]; // TODO: do we need an API?
			oCustomOperator = undefined;
		}
	});

	QUnit.test("use custom operator", async (assert) => {

		_setModelConditions([
			Condition.createCondition("MyOperator", ["Test"], undefined, undefined, ConditionValidated.NotValidated)
		]);
		oConfig = {
				dataType: oDataType,
				maxConditions: -1,
				operators: ["MyOperator"],
				defaultOperatorName: "MyInclude",
				delegate: FieldBaseDelegate,
				delegateName: "sap/ui/mdc/field/FieldBaseDelegate"
		};

		oDefineConditionPanel.setConfig(oConfig);
		await nextUIUpdate();

		const fnDone = assert.async();
		setTimeout(() => { // to wait for rendering
			const oGrid = Element.getElementById("DCP1--conditions");
			const aContent = oGrid.getContent();
			const oField = aContent[2];

			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			assert.ok(oField?.isA("sap.m.Button"), "Field is sap.m.Button");
			assert.equal(oField?.getText(), "Test", "Value of FIeld");

			const oOperatorField = aContent[0];
			const oVH = Element.getElementById(oOperatorField.getValueHelp());
			const oPopover = oVH.getTypeahead();
			const oFL = oPopover.getContent()[0];
			const aItems = oFL.getItems();

			assert.equal(aItems.length, 1, "Only one Operator available");
			assert.equal(aItems[0].getText(), "Longtext", "Text of operator");

			// fake changing value
			oField.setText("X");
			assert.equal(_getModelConditions()[0].values[0], "X", "condition value should be changed");

			fnDone();
		}, 0);

	});

	QUnit.test("switch custom operator", async (assert) => {

		const aOriginalOperators = FilterOperatorUtil.getOperatorsForType(BaseType.String);
		FilterOperatorUtil.setOperatorsForType(BaseType.String, [FilterOperatorUtil.getOperator(OperatorName.BT), oCustomOperator], oCustomOperator);

		await nextUIUpdate();

		const fnDone = assert.async();
		setTimeout(() => { // to wait for rendering
			const oGrid = Element.getElementById("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oOperatorField = aContent[0]; // operator
			const oVH = Element.getElementById(oOperatorField.getValueHelp());
			const oPopover = oVH.getTypeahead();
			const oFL = oPopover.getContent()[0];
			const aItems = oFL.getItems();
			let oField = aContent[2];
			let aConditions = oDefineConditionPanel.getConditions();

			// check for default operator
			assert.equal(oOperatorField.getValue(), "MyOperator", "Operator value");
			assert.equal(aItems.length, 2, "Only two Operators available");
			assert.equal(aItems[0].getText(), oMessageBundle.getText("operators.BT.longText"), "Text of operator0");
			assert.equal(aItems[1].getText(), "Longtext", "Text of operator1");
			assert.equal(aConditions.length, 1, "one empty condition should exist");
			assert.equal(aConditions[0].operator, "MyOperator", "Operator of empty condition");
			assert.equal(aConditions[0].values[0], null, "Value of empty condition");
			assert.ok(aConditions[0].isEmpty, "isEmpty of empty condition");
			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			assert.ok(oField?.isA("sap.m.Button"), "Field is sap.m.Button");
			assert.deepEqual(oField?.getText?.(), "", "Field empty");

			// switch operator
			oOperatorField.setValue(OperatorName.BT);
			oOperatorField.fireChange({value: OperatorName.BT, valid: true, promise: Promise.resolve(OperatorName.BT)}); // fake item select

			setTimeout(async () => { // as model update is async
				await nextUIUpdate();
				aConditions = oDefineConditionPanel.getConditions();
				assert.equal(aConditions[0].operator, OperatorName.BT, "Operator set on condition");
				assert.deepEqual(aConditions[0].values, [null, null], "Values set on condition");

				aContent = oGrid.getContent();
				oField = aContent[2];

				assert.equal(aContent.length, 6, "One row with one fields created - Grid contains 6 controls");
				assert.ok(oField?.isA("sap.ui.mdc.Field"), "Field is mdc Field");
				assert.deepEqual(oField?.getValue?.(), null, "Field value");
				oField = aContent[3];
				assert.ok(oField?.isA("sap.ui.mdc.Field"), "Field is mdc Field2");
				assert.deepEqual(oField?.getValue?.(), null, "Field2 value");

				// switch operator back
				oOperatorField.setValue("MyOperator");
				oOperatorField.fireChange({value: "MyOperator", valid: true, promise: Promise.resolve(OperatorName.MyOperator)}); // fake item select

				setTimeout(async () => { // as model update is async
					await nextUIUpdate();
					aConditions = oDefineConditionPanel.getConditions();
					assert.equal(aConditions[0].operator, "MyOperator", "Operator set on condition");
					assert.deepEqual(aConditions[0].values, [null], "Values set on condition");

					aContent = oGrid.getContent();
					oField = aContent[2];

					assert.equal(aContent.length, 5, "One row with one fields created - Grid contains 5 controls");
					assert.ok(oField?.isA("sap.m.Button"), "Field is sap.m.Button");
					assert.deepEqual(oField?.getText?.(), "", "Field empty");

					FilterOperatorUtil.setOperatorsForType(BaseType.String, aOriginalOperators, FilterOperatorUtil.getOperator(OperatorName.EQ));
					fnDone();
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.module("Type dependend functions", {
		beforeEach: async () => {
			await _init();
			},
		afterEach: _teardown
	});

	const _initType = async (oType, oCondition, sBaseType) => {

		oDataType.destroy();
		oDataType = oType;
		_setModelConditions([
			oCondition
		]);
		oConfig = {
				dataType: oDataType,
				maxConditions: -1,
				operators: FilterOperatorUtil.getOperatorsForType(sBaseType),
				delegate: FieldBaseDelegate,
				delegateName: "sap/ui/mdc/field/FieldBaseDelegate"
		};

		oDefineConditionPanel.setConfig(oConfig);
		await nextUIUpdate();

	};

	QUnit.test("use date type - EQ", async (assert) => {

		await _initType(new DateType(), Condition.createCondition(OperatorName.EQ, [new Date(2018, 10, 16)], undefined, undefined, ConditionValidated.NotValidated), BaseType.Date);

		const fnDone = assert.async();
		setTimeout(async () => { // to wait for retemplating
			await nextUIUpdate();
			const oGrid = Element.getElementById("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];

			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			aContent = oField.getAggregation("_content");
			const oControl = aContent?.length > 0 && aContent[0];

			assert.ok(oControl.isA("sap.m.DatePicker"), "Field uses DatePicker");
			const oType = oField.getBindingInfo("value").type;
			assert.ok(oType instanceof DateType, "Type of Field binding");
			assert.ok(oField.getValue() instanceof Date, "Value of Field is Date");
			assert.equal(oField.getValue().getFullYear(), 2018, "Year");
			fnDone();
		}, 0);

	});

	QUnit.test("use date type - TODAY", async (assert) => {

		const oDateType = new DateType();
		await _initType(oDateType, Condition.createCondition(OperatorName.TODAY, [], undefined, undefined, ConditionValidated.NotValidated), BaseType.Date);

		const fnDone = assert.async();
		setTimeout(() => { // to wait for retemplating
			const oGrid = Element.getElementById("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];

			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			aContent = oField.getAggregation("_content");
			const oControl = aContent?.length > 0 && aContent[0];

			assert.equal(oField?.getEditMode(), FieldEditMode.Display, "Field is in display mode");
			assert.ok(oControl.isA("sap.m.Text"), "Field uses Text");
			const oType = oField?.getBindingInfo("value").type;
			assert.ok(oType instanceof StringType, "Type of Field binding");
			assert.equal(typeof oField?.getValue(), "string", "Value of Field is String");
			assert.equal(oField?.getValue(), oDateType.formatValue(new Date(), "string"), "Text");
			fnDone();
		}, 0);

	});

	QUnit.test("use date type - NEXTDAYS", async (assert) => {

		const oDateType = new DateType();
		await _initType(oDateType, Condition.createCondition(OperatorName.NEXTDAYS, [5], undefined, undefined, ConditionValidated.NotValidated), BaseType.Date);

		const fnDone = assert.async();
		setTimeout(async () => { // to wait for retemplating
			await nextUIUpdate();
			const oGrid = Element.getElementById("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];

			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			aContent = oField.getAggregation("_content");
			const oControl = aContent?.length > 0 && aContent[0];

			assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field uses Input");
			const oType = oField.getBindingInfo("value").type;
			assert.ok(oType instanceof IntegerType, "Type of Field binding");
			assert.equal(typeof oField.getValue(), "number", "Value of Field is Number");
			assert.equal(oField.getValue(), 5, "Value");
			fnDone();
		}, 0);

	});

	QUnit.test("use date type - SPECIFICMONTHINYEAR", async (assert) => {

		const oDateType = new DateType();
		await _initType(oDateType, Condition.createCondition(OperatorName.SPECIFICMONTHINYEAR, [11, 2024], undefined, undefined, ConditionValidated.NotValidated), BaseType.Date);

		const fnDone = assert.async();
		setTimeout(async () => { // to wait for retemplating
			await nextUIUpdate();
			const oGrid = Element.getElementById("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField1 = aContent[2];
			const oField2 = aContent[3];

			assert.equal(aContent.length, 6, "One row with two fields created - Grid contains 6 controls");
			aContent = oField1.getAggregation("_content");
			let oControl = aContent?.length > 0 && aContent[0];

			assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field1 uses Input");
			let oType = oField1.getBindingInfo("value").type;
			assert.ok(oType instanceof IntegerType, "Type of Field1 binding");
			assert.equal(typeof oField1.getValue(), "number", "Value of Field1 is Number");
			assert.equal(oField1.getValue(), 11, "Field1 Value");
			assert.equal(oField1.getPlaceholder(), oMessageBundle.getText("operators.SPECIFICMONTHINYEAR_MONTH.label"), "Placeholder of Field1");

			aContent = oField2.getAggregation("_content");
			oControl = aContent?.length > 0 && aContent[0];

			assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field2 uses Input");
			oType = oField2.getBindingInfo("value").type;
			assert.ok(oType instanceof IntegerType, "Type of Field2 binding");
			assert.equal(typeof oField2.getValue(), "number", "Value of Field2 is Number");
			assert.equal(oField2.getValue(), 2024, "Field2 Value");
			assert.equal(oField2.getPlaceholder(), oMessageBundle.getText("operators.SPECIFICMONTHINYEAR_YEAR.label"), "Placeholder of Field2");
			fnDone();
		}, 0);

	});

	QUnit.test("use date type - Change Operator", async (assert) => {

		const oDateType = new DateType();
		await _initType(new DateType(), Condition.createCondition(OperatorName.EQ, [new Date(2020, 1, 24)], undefined, undefined, ConditionValidated.NotValidated), BaseType.Date);

		const fnDone = assert.async();
		setTimeout(async () => { // to wait for retemplating
			await nextUIUpdate();
			const oGrid = Element.getElementById("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oOperatorField = aContent[0];
			oOperatorField.setValue(OperatorName.TODAY);
			oOperatorField.fireChange({value: OperatorName.TODAY, valid: true, promise: Promise.resolve(OperatorName.TODAY)}); // fake item select

			setTimeout(async () => { // as model update is async
				await nextUIUpdate();
				aContent = oGrid.getContent();
				let oField = aContent[2];
				assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
				aContent = oField?.getAggregation("_content");
				let oControl = aContent?.length > 0 && aContent[0];

				assert.ok(oControl.isA("sap.m.Text"), "Field uses Text");
				let oType = oField.getBindingInfo("value").type;
				assert.ok(oType instanceof StringType, "Type of Field binding");
				assert.equal(typeof oField.getValue(), "string", "Value of Field is String");
				assert.equal(oField.getValue(), oDateType.formatValue(new Date(), "string"), "Text");

				oOperatorField.setValue(OperatorName.NEXTDAYS);
				oOperatorField.fireChange({value: OperatorName.NEXTDAYS, valid: true, promise: Promise.resolve(OperatorName.NEXTDAYS)}); // fake item select

				setTimeout(() => { // as model update is async
					setTimeout(async () => { // as change event is async
						await nextUIUpdate();
						aContent = oGrid.getContent();
						oField = aContent[2];
						assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
						aContent = oField?.getAggregation("_content");
						oControl = aContent?.length > 0 && aContent[0];

						assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field uses Input");
						oType = oField.getBindingInfo("value").type;
						assert.ok(oType instanceof IntegerType, "Type of Field binding");
						assert.equal(oField.getValue(), 1, "default value");

						oControl.setValue("5");
						oControl.fireChange({value: "5"}); //fake input
						setTimeout(() => { // as model update is async
							oOperatorField.setValue(OperatorName.EQ);
							oOperatorField.fireChange({value: OperatorName.EQ, valid: true, promise: Promise.resolve(OperatorName.EQ)}); // fake item select

							setTimeout(() => { // as model update is async
								setTimeout(async () => { // as change event is async
									await nextUIUpdate();
									aContent = oGrid.getContent();
									oField = aContent[2];
									assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
									aContent = oField?.getAggregation("_content");
									oControl = aContent?.length > 0 && aContent[0];

									assert.ok(oControl.isA("sap.m.DatePicker"), "Field uses DatePicker");
									oType = oField.getBindingInfo("value").type;
									assert.ok(oType instanceof DateType, "Type of Field binding");
									assert.notOk(oField.getValue(), "no Value");

									oOperatorField.setValue(OperatorName.TODAYFROMTO);
									oOperatorField.fireChange({value: OperatorName.TODAYFROMTO, valid: true, promise: Promise.resolve(OperatorName.TODAYFROMTO)}); // fake item select

									setTimeout(() => { // as model update is async
										setTimeout(async () => { // as change event is async
											await nextUIUpdate();
											aContent = oGrid.getContent();
											oField = aContent[2];
											assert.equal(aContent.length, 6, "One row with two field created - Grid contains 6 controls");
											aContent = oField?.getAggregation("_content");
											oControl = aContent?.length > 0 && aContent[0];
											assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field uses Input");
											oType = oField.getBindingInfo("value").type;
											assert.ok(oType instanceof IntegerType, "Type of Field binding");
											assert.equal(oField.getValue(), 1, "default Value");
											oControl.setValue("6");
											oControl.fireChange({value: "6"}); //fake input

											aContent = oGrid.getContent();
											oField = aContent[3];
											aContent = oField?.getAggregation("_content");
											oControl = aContent?.length > 0 && aContent[0];
											assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "second Field uses Input");
											oType = oField.getBindingInfo("value").type;
											assert.ok(oType instanceof IntegerType, "Type of second Field binding");
											assert.equal(oField.getValue(), 1, "default Value");
											oControl.setValue("6");
											oControl.fireChange({value: "6"}); //fake input

											setTimeout(() => { // as model update is async
												oOperatorField.setValue(OperatorName.BT);
												oOperatorField.fireChange({value: OperatorName.BT, valid: true, promise: Promise.resolve(OperatorName.BT)}); // fake item select

												setTimeout(() => { // as model update is async
													setTimeout(async () => { // as change event is async
														await nextUIUpdate();
														aContent = oGrid.getContent();
														oField = aContent[2];
														assert.equal(aContent.length, 6, "One row with two field created - Grid contains 6 controls");
														aContent = oField?.getAggregation("_content");
														oControl = aContent?.length > 0 && aContent[0];
														assert.ok(oControl.isA("sap.m.DatePicker"), "Field uses DatePicker");
														oType = oField.getBindingInfo("value").type;
														assert.ok(oType instanceof DateType, "Type of Field binding");
														assert.notOk(oField.getValue(), "no Value");

														aContent = oGrid.getContent();
														oField = aContent[3];
														aContent = oField?.getAggregation("_content");
														oControl = aContent?.length > 0 && aContent[0];
														assert.ok(oControl.isA("sap.m.DatePicker"), "second Field uses DatePicker");
														oType = oField.getBindingInfo("value").type;
														assert.ok(oType instanceof DateType, "Type of second Field binding");
														assert.notOk(oField.getValue(), "no Value");

														fnDone();
													}, 0);
												}, 0);
											}, 0);
										}, 0);
									}, 0);
								}, 0);
							}, 0);
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("use date type - change to dateTimetype", async (assert) => {

		const oDateType = new DateType();
		const oCondition = Condition.createCondition(OperatorName.EQ, [new Date(Date.UTC(2022, 8, 14, 10, 27, 30))], undefined, undefined, ConditionValidated.NotValidated);
		oCondition.isEmpty = false; // to really have the same data
		await _initType(oDateType, oCondition, BaseType.Date);

		const fnDone = assert.async();
		setTimeout(async () => { // to wait for retemplating
			await nextUIUpdate();

			const oDateTimeType = new DateTimeType();
			await _initType(oDateTimeType, oCondition, BaseType.DateTime);

			setTimeout(async () => { // to wait for retemplating
				await nextUIUpdate();
				const oGrid = Element.getElementById("DCP1--conditions");
				let aContent = oGrid.getContent();
				const oField = aContent[2];

				assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
				aContent = oField.getAggregation("_content");
				const oControl = aContent?.length > 0 && aContent[0];

				assert.equal(oField?.getEditMode(), FieldEditMode.Editable, "Field is in edit mode");
				assert.ok(oControl.isA("sap.m.DateTimePicker"), "Field uses DateTimePicker");
				const oType = oField?.getBindingInfo("value").type;
				assert.ok(oType instanceof DateTimeType, "Type of Field binding");
				assert.ok(oField?.getValue() instanceof Date, "Value of Field is Date");
				assert.equal(oField?.getValue().getFullYear(), 2022, "Year");
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("use boolean type", async (assert) => {

		await _initType(new BooleanType(), Condition.createCondition(OperatorName.EQ, [true], undefined, undefined, ConditionValidated.NotValidated), BaseType.Boolean);

		const fnDone = assert.async();
		setTimeout(async () => { // to wait for condition update
			await nextUIUpdate();
			setTimeout(() => { // to wait for renderng
				const oGrid = Element.getElementById("DCP1--conditions");
				let aContent = oGrid.getContent();
				const oField = aContent[2];
				assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
				aContent = oField.getAggregation("_content");
				const oControl = aContent?.length > 0 && aContent[0];

				assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field uses Input");
				const oType = oField.getBindingInfo("value").type;
				assert.ok(oType.isA("sap.ui.model.odata.type.Boolean"), "Type of Field binding");
				assert.notOk(oType.oContraints && oType.oContraints.nullabale, "Type of Field has not nullable set to false");
				assert.equal(typeof oField.getValue(), "boolean", "Value of Field is Boolean");
				assert.equal(oField.getValue(), true, "Value");
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("use integer type", async (assert) => {

		await _initType(new IntegerType(), Condition.createCondition(OperatorName.EQ, [1], undefined, undefined, ConditionValidated.NotValidated), BaseType.Numeric);

		const fnDone = assert.async();
		setTimeout(() => { // to wait for retemplating
			const oGrid = Element.getElementById("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];
			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			aContent = oField.getAggregation("_content");
			const oControl = aContent?.length > 0 && aContent[0];

			assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field uses Input");
			const oType = oField.getBindingInfo("value").type;
			assert.ok(oType.isA("sap.ui.model.type.Integer"), "Type of Field binding");
			assert.equal(typeof oField.getValue(), "number", "Value of Field is Number");
			assert.equal(oField.getValue(), 1, "Value");
			fnDone();
		}, 0);

	});

	QUnit.test("enter invalid value and remove condition", async (assert) => {

		await _initType(new IntegerType(), Condition.createCondition(OperatorName.EQ, [1], undefined, undefined, ConditionValidated.NotValidated), BaseType.Numeric);

		const fnDone = assert.async();
		setTimeout(() => { // to wait for retemplating
			const oGrid = Element.getElementById("DCP1--conditions");

			let aContent = oGrid.getContent();
			const oField = aContent[2];
			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			aContent = oField.getAggregation("_content");
			const oControl = aContent?.length > 0 && aContent[0];

			oControl.setValue("foo");
			oControl.fireChange({value: "foo"}); //fake invalide input
			setTimeout(() => { // as model update is async
				assert.equal( oControl.getValueState(), "Error", "Error shown on the value field");

				const oRemoveBtn = Element.getElementById("DCP1--0--removeBtnLarge");
				oRemoveBtn.firePress();
				setTimeout(async () => { // as condition rendering is triggered async.
					await nextUIUpdate();

					assert.equal(oControl.getValueState(), "None", "No Error shown on the value field");
					assert.equal(oControl.getValue(), "", "value of the field is empty");

					fnDone();
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("use float type", async (assert) => {

		await _initType(new FloatType(), Condition.createCondition(OperatorName.EQ, [1.1], undefined, undefined, ConditionValidated.NotValidated), BaseType.Numeric);

		const fnDone = assert.async();
		setTimeout(() => { // to wait for retemplating
			const oGrid = Element.getElementById("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];
			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			aContent = oField.getAggregation("_content");
			const oControl = aContent?.length > 0 && aContent[0];

			assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field uses Input");
			const oType = oField.getBindingInfo("value").type;
			assert.ok(oType.isA("sap.ui.model.type.Float"), "Type of Field binding");
			assert.equal(typeof oField.getValue(), "number", "Value of Field is Number");
			assert.equal(oField.getValue(), 1.1, "Value");
			fnDone();
		}, 0);

	});

	QUnit.test("use default type", async (assert) => {

		oDataType.destroy();
		_setModelConditions([
			Condition.createCondition(OperatorName.EQ, ["x"], undefined, undefined, ConditionValidated.NotValidated)
		]);
		oConfig = {
				dataType: undefined,
				maxConditions: -1,
				delegate: FieldBaseDelegate,
				delegateName: "sap/ui/mdc/field/FieldBaseDelegate"
		};

		oDefineConditionPanel.setConfig(oConfig);
		await nextUIUpdate();

		const fnDone = assert.async();
		setTimeout(() => { // to wait for retemplating
			const oGrid = Element.getElementById("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];
			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			aContent = oField.getAggregation("_content");
			const oControl = aContent?.length > 0 && aContent[0];

			assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field uses Input");
			const oType = oField.getBindingInfo("value").type;
			assert.ok(oType.isA("sap.ui.model.type.String"), "Type of Field binding");
			assert.equal(typeof oField.getValue(), "string", "Value of Field is string");
			assert.equal(oField.getValue(), "x", "Value");
			fnDone();
		}, 0);

	});

	QUnit.test("change condition operator EQ->Contains (Decimal)", async (assert) => {

		// use BaseType=String even it normally represents a number -> just to check value conversion by switching operator
		await _initType(new DecimalType(undefined, {scale: 2, nullable: false}), Condition.createCondition(OperatorName.EQ, ["1.1"], undefined, undefined, ConditionValidated.NotValidated), BaseType.String);

		const fnDone = assert.async();
		setTimeout(async () => { // wait for rendering
			await nextUIUpdate();
			const oOperatorField = Element.getElementById("DCP1--0-operator-inner");
			oOperatorField.setValue(OperatorName.Contains);
			oOperatorField.fireChange({value: OperatorName.Contains}); // fake item select

			setTimeout(() => { // as model update is async
				setTimeout(() => { // as parsing is async
					setTimeout(() => { // as model update is async
						setTimeout(async () => { // as row update is async
							await nextUIUpdate();
							const aConditions = oDefineConditionPanel.getConditions();
							assert.equal(aConditions[0].operator, OperatorName.Contains, "Operator set on condition");
							assert.deepEqual(aConditions[0].values, ["1.10"], "Values set on condition");

							const oGrid = Element.getElementById("DCP1--conditions");
							const aContent = oGrid.getContent();
							const oField = aContent[2];

							assert.equal(aContent.length, 5, "One row with two fields created - Grid contains 6 controls");
							assert.ok(oField?.isA("sap.ui.mdc.Field"), "Field is mdc Field");
							assert.equal(oField?.getPlaceholder(), oMessageBundle.getText("valuehelp.DEFINECONDITIONS_VALUE"), "Placeholder of Field");
							assert.equal(oField?.getValue(), "1.10", "Field value not changed");
							fnDone();
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.module("Interaction", {
		beforeEach: async () => {
			await _init();
			},
		afterEach: _teardown
	});

	QUnit.test("paging", async (assert) => {

		const oPanel = oDefineConditionPanel.getAggregation("_content");
		const oToolbar = oPanel?.getHeaderToolbar();
		const oButtonPrev = oToolbar?.getContent()[2];
		const oPageCount = oToolbar?.getContent()[3];
		const oButtonNext = oToolbar?.getContent()[4];
		const oButtonRemoveAll = oToolbar?.getContent()[5];
		const oButtonInsert = oToolbar?.getContent()[6];
		const oGrid = Element.getElementById("DCP1--conditions");

		assert.notOk(oButtonPrev?.getVisible(), "Previous-Button hidden");
		assert.notOk(oPageCount?.getVisible(), "Page-count hidden");
		assert.notOk(oButtonNext?.getVisible(), "Next-Button hidden");
		assert.notOk(oButtonRemoveAll?.getVisible(), "Remove-All-Button hidden");
		assert.notOk(oButtonInsert?.getVisible(), "Insert-Button hidden");

		const fnAddConditions = (iCount) => {
			let aConditions = oDefineConditionPanel.getConditions();
			if (aConditions.length === 1 && aConditions[0].isEmpty) {
				aConditions = [];
			}
			for (let i = 0; i < iCount; i++) {
				const oCondition = Condition.createCondition(OperatorName.EQ, [(oDefineConditionPanel.getConditions().length + i) + ""], undefined, undefined, ConditionValidated.NotValidated);
				aConditions.push(oCondition);
			}
			oDefineConditionPanel.setConditions(aConditions);
		};

		const fnTest = (assert, bVisible, bPrevEnabled, bNextEnabled, sPageCount, iContentLength, sFirstValue, iConditionCount, iAllConditionCount) => {
			assert.equal(oButtonPrev?.getVisible(), bVisible, "Previous-Button visible");
			assert.equal(oPageCount?.getVisible(), bVisible, "Page-count visible");
			assert.equal(oButtonNext?.getVisible(), bVisible, "Next-Button visible");
			assert.equal(oButtonRemoveAll?.getVisible(), bVisible, "Remove-All-Button visible");
			assert.equal(oButtonInsert?.getVisible(), bVisible, "Insert-Button visible");

			if (bVisible) {
				assert.equal(oButtonPrev?.getEnabled(), bPrevEnabled, "Previous-Button enabled");
				assert.equal(oPageCount?.getText(), sPageCount, "Page-count text");
				assert.equal(oButtonNext?.getEnabled(), bNextEnabled, "next-Button enabled");
			}

			const aContent = oGrid.getContent();
			assert.equal(aContent.length, iContentLength, iConditionCount + " conditions shown");
			assert.equal(aContent[2].getValue(), sFirstValue, "First condition");
			assert.equal(oDefineConditionPanel.getConditions().length, iAllConditionCount, "Conditions in DefineConditionPanel");
		};

		fnAddConditions(10);
		await nextUIUpdate();
		const fnDone = assert.async();
		setTimeout(() => { // to wait for retemplating
			setTimeout(async () => { // to for internal Conditions update in DefineConditionPanel (is async)
				fnTest(assert, false, undefined, undefined, undefined, 41, "1", 10, 10);
				assert.notOk(oButtonPrev?.getVisible(), "Previous-Button hidden");
				assert.notOk(oPageCount?.getVisible(), "Page-count hidden");
				assert.notOk(oButtonNext?.getVisible(), "Next-Button hidden");
				assert.notOk(oButtonRemoveAll?.getVisible(), "Remove-All-Button hidden");
				assert.notOk(oButtonInsert?.getVisible(), "Insert-Button hidden");

				fnAddConditions(11);
				await nextUIUpdate();
				setTimeout(() => { // to wait for retemplating
					setTimeout(async () => { // to for internal Conditions update in DefineConditionPanel (is async)
						fnTest(assert, true, false, true, "1/3", 41, "1", 10, 21);

						oButtonNext.firePress();
						await nextUIUpdate();
						fnTest(assert, true, true, true, "2/3", 41, "10", 10, 21);

						oDefineConditionPanel.cleanUp(); // should move to first page
						await nextUIUpdate();
						fnTest(assert, true, false, true, "1/3", 41, "1", 10, 21);

						oButtonNext.firePress();
						await nextUIUpdate();
						fnTest(assert, true, true, true, "2/3", 41, "10", 10, 21);

						oButtonNext.firePress();
						await nextUIUpdate();
						fnTest(assert, true, true, false, "3/3", 5, "20", 1, 21);

						const aContent = oGrid.getContent();
						aContent[3].firePress(); // remove the only one condition on page
						await nextUIUpdate();

						setTimeout(() => { // to wait for retemplating
							setTimeout(async () => { // to for internal Conditions update in DefineConditionPanel (is async)
								fnTest(assert, true, true, false, "2/2", 41, "10", 10, 20);

								oButtonInsert.firePress();
								await nextUIUpdate();

								setTimeout(() => { // to wait for retemplating
									setTimeout(async () => { // to for internal Conditions update in DefineConditionPanel (is async)
										fnTest(assert, true, true, false, "2/2", 45, null, 11, 21);

										oButtonPrev.firePress();
										await nextUIUpdate();
										fnTest(assert, true, false, true, "1/3", 41, "1", 10, 21);

										const aContent = oGrid.getContent();
										aContent[40].firePress(); // add one condition
										await nextUIUpdate();

										setTimeout(() => { // to wait for retemplating
											setTimeout(async () => { // to for internal Conditions update in DefineConditionPanel (is async)
												fnTest(assert, true, false, true, "1/3", 45, "1", 11, 22);

												oButtonRemoveAll.firePress();
												await nextUIUpdate();

												setTimeout(() => { // to wait for retemplating
													setTimeout(() => { // to for internal Conditions update in DefineConditionPanel (is async)
														fnTest(assert, false, undefined, undefined, undefined, 5, null, 1, 1);

														fnDone();
													}, 0);
												}, 0);
											}, 0);
										}, 0);
									}, 0);
								}, 0);
							}, 0);
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("paste multiple values", (assert) => {

		const oConfig = merge({}, oDefineConditionPanel.getConfig());
		oConfig.maxConditions = 3;
		oDefineConditionPanel.setConfig(oConfig); // to test with maxConditions

		const fnDone = assert.async();
		setTimeout(async () => { // as model update is async
			await nextUIUpdate();
			const oGrid = Element.getElementById("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];
			assert.equal(aContent.length, 5, "Dummy line created");

			aContent = oField.getAggregation("_content");
			const oControl = aContent?.length > 0 && aContent[0];

			const sPastedValues = "AA\nBB\n>C\nEE";

			const oFakeClipboardData = {
					getData() {
						return sPastedValues;
					}
			};

			if (window.clipboardData) {
				window.clipboardData.setData("text", sPastedValues);
			}

			qutils.triggerEvent("paste", oControl.getFocusDomRef(), {clipboardData: oFakeClipboardData});
			setTimeout(() => { // as paste handling is async
				const aConditions = _getModelConditions();
				assert.equal(aConditions.length, 3, "3 Conditions exist");
				assert.equal(aConditions[0].operator, "EQ", "1. Condition operator");
				assert.equal(aConditions[0].values[0], "BB", "1. Condition");
				assert.equal(aConditions[1].operator, "EQ", "2. Condition operator");
				assert.equal(aConditions[1].values[0], ">C", "2. Condition"); // to check that ">" is not used as operator
				assert.equal(aConditions[2].operator, "EQ", "3. Condition operator");
				assert.equal(aConditions[2].values[0], "EE", "3. Condition");

				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("paste multiple values using BT", (assert) => {

		const oCondition = Condition.createCondition(OperatorName.BT, ["1", "99"], undefined, undefined, ConditionValidated.NotValidated);
		oDefineConditionPanel.setConditions([oCondition]);

		const fnDone = assert.async();
		setTimeout(async () => { // as model update is async
			await nextUIUpdate();
			const oGrid = Element.getElementById("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];
			assert.equal(aContent.length, 6, "BT line created");

			aContent = oField.getAggregation("_content");
			const oControl = aContent?.length > 0 && aContent[0];

			const sPastedValues = "A	B\nC	D";

			const oFakeClipboardData = {
					getData() {
						return sPastedValues;
					}
			};

			if (window.clipboardData) {
				window.clipboardData.setData("text", sPastedValues);
			}

			qutils.triggerEvent("paste", oControl.getFocusDomRef(), {clipboardData: oFakeClipboardData});
			setTimeout(() => { // as paste handling is async
				const aConditions = _getModelConditions();
				assert.equal(aConditions.length, 2, "2 Conditions exist");
				assert.equal(aConditions[0].operator, "BT", "1. Condition operator");
				assert.equal(aConditions[0].values[0], "A", "1. Condition value0");
				assert.equal(aConditions[0].values[1], "B", "1. Condition value1");
				assert.equal(aConditions[1].operator, "BT", "2. Condition operator");
				assert.equal(aConditions[1].values[0], "C", "2. Condition value0");
				assert.equal(aConditions[1].values[1], "D", "2. Condition value1");

				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.module("Interaction2", {
		beforeEach: async () => {
			await _init(false, new IntegerType({}, {maximum: 10}));
			},
		afterEach: _teardown
	});

	QUnit.test("paste multiple values with invalid values", (assert) => {

		const oConfig = merge({}, oDefineConditionPanel.getConfig());
		oConfig.maxConditions = -1;
		oDefineConditionPanel.setConfig(oConfig); // to test with maxConditions

		const fnDone = assert.async();
		setTimeout(async () => { // as model update is async
			await nextUIUpdate();
			const oGrid = Element.getElementById("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];
			assert.equal(aContent.length, 5, "Dummy line created");

			aContent = oField.getAggregation("_content");
			const oControl = aContent?.length > 0 && aContent[0];

			const sPastedValues = "1\n2\n11";

			const oFakeClipboardData = {
					getData() {
						return sPastedValues;
					}
			};

			if (window.clipboardData) {
				window.clipboardData.setData("text", sPastedValues);
			}

			qutils.triggerEvent("paste", oControl.getFocusDomRef(), {clipboardData: oFakeClipboardData});
			setTimeout(() => { // as paste handling is async
				const aConditions = _getModelConditions();
				assert.equal(aConditions.length, 1, "1 Condition exist"); // just dummy condition
				assert.ok(oField.isInvalidInput(), "Field has error state"); // don't test valueState as this is set async by binding

				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.module("usage of ValueHelp on value fields", {
		beforeEach: async () => {
			await _init();
		},
		afterEach: _teardown
	});

	QUnit.test("value field has valueHelp for EQ and NE operators", (assert) => {

		_setModelConditions([
			Condition.createCondition(OperatorName.BT, ["A", "Z"], undefined, undefined, ConditionValidated.NotValidated),
			Condition.createCondition(OperatorName.NE, ["X"], undefined, undefined, ConditionValidated.NotValidated),
			Condition.createCondition(OperatorName.LE, ["X"], undefined, undefined, ConditionValidated.NotValidated)
		]);

		assert.equal(oDefineConditionPanel.getValueHelp(), null, "default valueHelp is not defined");
		oDefineConditionPanel.setValueHelp("MyTestValueHelp");
		assert.equal(oDefineConditionPanel.getValueHelp(), "MyTestValueHelp", "valueHelp is set");

		const fnDone = assert.async();
		setTimeout(async () => { // wait for rendering
			await nextUIUpdate();
			const oOperatorField = Element.getElementById("DCP1--0-operator-inner");
			oOperatorField.setValue(OperatorName.EQ);
			oOperatorField.fireChange({value: OperatorName.EQ}); // fake item select

			setTimeout(() => { // as model update is async
				setTimeout(() => { // as parsing is async
					setTimeout(() => { // as model update is async
						setTimeout(async () => { // as row update is async
							await nextUIUpdate();

							const oField1 = Element.getElementById("DCP1--0-values0");
							const oField2 = Element.getElementById("DCP1--1-values0");
							const oField3 = Element.getElementById("DCP1--2-values0");
							assert.equal(oField1.getValueHelp(), "MyTestValueHelp", "valueHelp on field is set");
							assert.equal(oField2.getValueHelp(), "MyTestValueHelp", "valueHelp on field is set");
							assert.equal(oField3.getValueHelp(), "MyTestValueHelp", "valueHelp on field is set");
							// assert.equal(oField3.getValueHelp(), null, "valueHelp on field is NOT set");

							fnDone();
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

});
