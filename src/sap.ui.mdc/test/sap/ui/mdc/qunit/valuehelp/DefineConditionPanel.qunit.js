/* global QUnit, sinon */

/*eslint max-nested-callbacks: [2, 20]*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/valuehelp/base/DefineConditionPanel",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/field/FieldBaseDelegate", // bring back to default one
	"sap/ui/mdc/field/FieldInput", // don't want to test async loading in Field here
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/mdc/enums/OperatorValueType",
	"sap/ui/model/type/String",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/odata/type/Boolean",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Float",
	"sap/m/DatePicker", // don't want to test async loading in Field here
	"sap/m/DateTimePicker", // don't want to test async loading in Field here
	"sap/m/Text", // don't want to test async loading in Field here
	"sap/m/Button", // test custom control
	"sap/ui/core/ListItem",
	"sap/base/util/merge",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core"
], function(
		jQuery,
		qutils,
		DefineConditionPanel,
		ConditionModel,
		Condition,
		FilterOperatorUtil,
		Operator,
		FieldBaseDelegate,
		FieldInput,
		BaseType,
		ConditionValidated,
		FieldEditMode,
		OperatorValueType,
		StringType,
		DateType,
		DateTimeType,
		BooleanType,
		IntegerType,
		FloatType,
		DatePicker,
		DateTimePicker,
		Text,
		Button,
		ListItem,
		merge,
		KeyCodes,
		oCore
		) {
	"use strict";

	const oMessageBundle = oCore.getLibraryResourceBundle("sap.ui.mdc");
	let oDefineConditionPanel;
	let oModel;
	let oDataType;
	let oConfig;

	const _init = function(bNoRender, oType) {
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

		oModel = new ConditionModel();
		oCore.setModel(oModel, "cm");

		oDefineConditionPanel = new DefineConditionPanel("DCP1", {
			conditions: '{cm>/conditions/Name}',
			config: oConfig
		}).placeAt("content");

		if (!bNoRender) {
			oCore.applyChanges();
		}
	};

	const _teardown = function() {
		oDefineConditionPanel.destroy();
		oDataType.destroy();
		oDataType = undefined;
		oConfig = undefined;
		if (oModel) {
			oModel.destroy();
			oModel = undefined;
		}
	};

	QUnit.module("Common functions", {
		beforeEach: function() {
			_init();
			},
		afterEach: _teardown
	});

	QUnit.test("Basic tests", function(assert) {
		assert.equal(oDefineConditionPanel != null, true, "instance can be created");
	});

	QUnit.test("bind empty condition Model and add one condition", function(assert) {

		let aConditions = oModel.getConditions("Name");
		assert.equal(aConditions.length, 1, "one empty condition should exist");
		assert.equal(aConditions[0].operator, "EQ", "Operator of empty condition");
		assert.equal(aConditions[0].values[0], null, "Value of empty condition");
		assert.ok(aConditions[0].isEmpty, "isEmpty of empty condition");

		oModel.addCondition("Name", Condition.createCondition("EQ", ["Andreas"], undefined, undefined, ConditionValidated.NotValidated));
		oCore.applyChanges();
		aConditions = oModel.getConditions("Name");
		assert.equal(aConditions.length, 2, "2 conditions should exist");
		assert.equal(aConditions[0].operator, "EQ", "Operator of first condition");
		assert.equal(aConditions[0].values[0], null, "Value of first condition");
		assert.ok(aConditions[0].isEmpty, "isEmpty of first condition");
		assert.equal(aConditions[1].operator, "EQ", "Operator of second condition");
		assert.equal(aConditions[1].values[0], "Andreas", "Value of second condition");
		assert.notOk(aConditions[1].isEmpty, "isEmpty of second condition");

	});

	QUnit.test("dummy condition with different operator", function(assert) {

		oConfig = {
				dataType: oDataType,
				maxConditions: -1,
				operators: ["BT"],
				delegate: FieldBaseDelegate,
				delegateName: "sap/ui/mdc/field/FieldBaseDelegate"
		};

		oDefineConditionPanel.setConfig(oConfig);
		oModel.removeAllConditions("Name");
		oDefineConditionPanel.invalidate(); // to invalidate operator texts
		oCore.applyChanges();

		const fnDone = assert.async();
		setTimeout(function () { // to wait for retemplating
			setTimeout(function () { // to for internal Conditions update in DefineConditionPanel (is async)
				const aConditions = oModel.getConditions("Name");
				assert.equal(aConditions.length, 1, "one empty condition should exist");
				assert.equal(aConditions[0].operator, "BT", "Operator of empty condition");
				assert.equal(aConditions[0].values[0], null, "Value of empty condition");
				assert.ok(aConditions[0].isEmpty, "isEmpty of empty condition");
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("bind filled condition Model", function(assert) {

		const oConfig = merge({}, oDefineConditionPanel.getConfig());
		oConfig.maxConditions = 4;
		oDefineConditionPanel.setConfig(oConfig); // to test visibility of add button

		sinon.spy(oDefineConditionPanel, "updateDefineConditions");
		// update twice to test only one call of dummy row

		oModel.setData({
			conditions: {
				Name: [
					   Condition.createCondition("EQ", ["Peter"], undefined, undefined, ConditionValidated.NotValidated)
					   ]
			}
		});

		oModel.setData({
			conditions: {
				Name: [
					   Condition.createCondition("EQ", ["Andreas"], undefined, undefined, ConditionValidated.NotValidated),
					   Condition.createCondition("EQ", ["Martin"], undefined, undefined, ConditionValidated.Validated), // will be hidden
					   Condition.createCondition("EQ", ["Peter"], undefined, undefined, ConditionValidated.NotValidated)
					   ]
			}
		});

		const fnDone = assert.async();

		setTimeout(function () {
			oCore.applyChanges();
			assert.ok(oDefineConditionPanel.updateDefineConditions.calledOnce, "updateDefineConditions called once");
			assert.equal(oModel.getConditions("Name").length, 3, "3 conditions should exist");
			const oGrid = oCore.byId("DCP1--conditions");
			let aContent = oGrid.getContent();
			assert.equal(aContent.length, 9, "two rows with one field created - Grid contains 9 controls");


			const oAddBtn = oCore.byId("DCP1--addBtn");
			const oGridData = oAddBtn.getLayoutData();
			assert.ok(oGridData.getVisibleL(), "Add-Button is visible");
			oAddBtn.firePress();
			setTimeout(function () { // as condition rendering is triggered async.
				oCore.applyChanges();
				assert.equal(oModel.getConditions("Name").length, 4, "4 conditions should exist");
				aContent = oGrid.getContent();
				assert.equal(aContent.length, 13, "three rows with one field created - Grid contains 13 controls");
				assert.notOk(oGridData.getVisibleL(), "Add-Button is not visible");

				const oRemoveBtn = oCore.byId("DCP1--2--removeBtnLarge");
				oRemoveBtn.firePress();
				setTimeout(function () { // as condition rendering is triggered async.
					oCore.applyChanges();
					assert.equal(oModel.getConditions("Name").length, 3, "3 conditions should exist");
					assert.ok(oGridData.getVisibleL(), "Add-Button is visible");
					assert.ok(oAddBtn.getVisible(), "Button is visible");
					aContent = oGrid.getContent();
					assert.equal(aContent.length, 9, "two rows with one field created - Grid contains 9 controls");

					fnDone();
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("show conditions with custom Operator", function(assert) {

		let oOperator = new Operator({
			name: "MyInclude",
			filterOperator: "EQ",
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [OperatorValueType.Self],
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oOperator);

		oOperator = new Operator({ // test excluding operator with validation
			name: "MyExclude",
			filterOperator: "NE",
			tokenParse: "^!=(.+)$",
			tokenFormat: "!(={0})",
			valueTypes: [OperatorValueType.Self],
			exclude: true,
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oOperator);

		const oConfig = merge({}, oDefineConditionPanel.getConfig());
		oConfig.maxConditions = 4;
		oConfig.operators = ["MyInclude", "BT", "MyExclude"];
		oDefineConditionPanel.setConfig(oConfig); // to test visibility of add button

		oModel.setData({
			conditions: {
				Name: [
					   Condition.createCondition("MyInclude", ["Andreas"], undefined, undefined, ConditionValidated.NotValidated),
					   Condition.createCondition("MyExclude", ["Martin"], undefined, undefined, ConditionValidated.Validated), // will not be hidden
					   Condition.createCondition("MyInclude", ["Peter"], undefined, undefined, ConditionValidated.Validated) // will be hidden
					   ]
			}
		});

		const fnDone = assert.async();

		setTimeout(function () { // for model update
			oCore.applyChanges();
			setTimeout(function () { // for internal Controls update via ManagedObjectModel
				const oGrid = oCore.byId("DCP1--conditions");
				const aContent = oGrid.getContent();
				assert.equal(aContent.length, 9, "two rows with one field created - Grid contains 9 controls");

				delete FilterOperatorUtil._mOperators["MyInclude"]; // TODO API to remove operator
				delete FilterOperatorUtil._mOperators["MyExclude"]; // TODO API to remove operator
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("change condition value field", function(assert) {

		oModel.setData({
			conditions: {
				Name: [
					   Condition.createCondition("EQ", ["Andreas"], undefined, undefined, ConditionValidated.NotValidated)
					   ]
			}
		});

		const fnDone = assert.async();

		setTimeout(function () { // for model update
			oCore.applyChanges();
			assert.equal(oModel.getConditions("Name").length, 1, "1 conditions should exist");

			const oGrid = oCore.byId("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];

			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			assert.ok(oField && oField.isA("sap.ui.mdc.Field"), "Field is mdc Field");
			aContent = oField.getAggregation("_content");
			const oControl = aContent && aContent.length > 0 && aContent[0];
			assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field uses Input");
			assert.equal(oField.getValue(), "Andreas", "Value of Field");
			assert.equal(oField.getPlaceholder(), oMessageBundle.getText("valuehelp.DEFINECONDITIONS_VALUE"), "Placeholder of Field");

			jQuery(oField.getFocusDomRef()).val("foo");
			qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
			oCore.applyChanges();

			assert.equal(oModel.getConditions("Name").length, 1, "1 conditions should exist");
			assert.equal(oModel.getConditions("Name")[0].values[0], "foo", "condition value should be changed");
			fnDone();
		}, 0);

	});

	QUnit.test("change condition operator EQ->BT", function(assert) {

		oModel.setData({
			conditions: {
				Name: [
					   Condition.createCondition("EQ", ["Andreas"], undefined, undefined, ConditionValidated.NotValidated)
					   ]
			}
		});

		const fnDone = assert.async();
		setTimeout(function () { // wait for rendering
			oCore.applyChanges();
			const oOperatorField = oCore.byId("DCP1--0-operator-inner");
			oOperatorField.setValue("BT");
			oOperatorField.fireChange({value: "BT"}); // fake item select

			setTimeout(function () { // as model update is async
				setTimeout(function () { // as parsing is async
					setTimeout(function () { // as model update is async
						setTimeout(function () { // as row update is async
							oCore.applyChanges();
							const aConditions = oDefineConditionPanel.getConditions();
							assert.equal(aConditions[0].operator, "BT", "Operator set on condition");
							assert.deepEqual(aConditions[0].values, ["Andreas", null], "Values set on condition");

							const oGrid = oCore.byId("DCP1--conditions");
							const aContent = oGrid.getContent();
							const oField1 = aContent[2];
							const oField2 = aContent[3];

							assert.equal(aContent.length, 6, "One row with two fields created - Grid contains 6 controls");
							assert.ok(oField1 && oField1.isA("sap.ui.mdc.Field"), "Field1 is mdc Field");
							assert.ok(oField2 && oField2.isA("sap.ui.mdc.Field"), "Field2 is mdc Field");
							assert.equal(oField1.getPlaceholder(), oMessageBundle.getText("valuehelp.DEFINECONDITIONS_FROM"), "Placeholder of Field1");
							assert.equal(oField2.getPlaceholder(), oMessageBundle.getText("valuehelp.DEFINECONDITIONS_TO"), "Placeholder of Field2");
							assert.equal(oField1.getValue(), "Andreas", "Field1 value not changed");
							assert.equal(oField2.getValue(), null, "Field2 value is empty");
							fnDone();
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("change condition operator BT->EQ", function(assert) {

		oModel.setData({
			conditions: {
				Name: [
					   Condition.createCondition("BT", ["A", "Z"], undefined, undefined, ConditionValidated.NotValidated)
					   ]
			}
		});

		const fnDone = assert.async();
		setTimeout(function () { // wait for rendering
			oCore.applyChanges();
			const oOperatorField = oCore.byId("DCP1--0-operator-inner");
			oOperatorField.setValue("EQ");
			oOperatorField.fireChange({value: "EQ"}); // fake item select

			setTimeout(function () { // as model update is async
				setTimeout(function () { // as parsing is async
					setTimeout(function () { // as model update is async
						setTimeout(function () { // as row update is async
							oCore.applyChanges();
							const aConditions = oDefineConditionPanel.getConditions();
							assert.equal(aConditions[0].operator, "EQ", "Operator set on condition");
							assert.deepEqual(aConditions[0].values, ["A"], "Values set on condition");

							const oGrid = oCore.byId("DCP1--conditions");
							const aContent = oGrid.getContent();
							const oField1 = aContent[2];

							assert.equal(aContent.length, 5, "One row with one fields created - Grid contains 5 controls");
							assert.ok(oField1 && oField1.isA("sap.ui.mdc.Field"), "Field1 is mdc Field");
							assert.equal(oField1.getPlaceholder(), oMessageBundle.getText("valuehelp.DEFINECONDITIONS_VALUE"), "Placeholder of Field1");
							assert.equal(oField1.getValue(), "A", "Field1 value not changed");

							fnDone();
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("change condition operator BT->Empty", function(assert) {

		oModel.setData({
			conditions: {
				Name: [
					   Condition.createCondition("BT", ["A", "Z"], undefined, undefined, ConditionValidated.NotValidated)
					   ]
			}
		});

		const fnDone = assert.async();
		setTimeout(function () { // wait for rendering
			oCore.applyChanges();
			const oOperatorField = oCore.byId("DCP1--0-operator-inner");
			oOperatorField.setValue("Empty");
			oOperatorField.fireChange({value: "Empty"}); // fake item select

			setTimeout(function () { // as model update is async
				setTimeout(function () { // as parsing is async
					setTimeout(function () { // as model update is async
						setTimeout(function () { // as row update is async
							oCore.applyChanges();
							const aConditions = oDefineConditionPanel.getConditions();
							assert.equal(aConditions[0].operator, "Empty", "Operator set on condition");
							assert.deepEqual(aConditions[0].values, [], "Values set on condition");

							const oGrid = oCore.byId("DCP1--conditions");
							const aContent = oGrid.getContent();

							assert.equal(aContent.length, 4, "One row with no fields created - Grid contains 4 controls");

							fnDone();
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("change condition operator invalid", function(assert) {

		oModel.setData({
			conditions: {
				Name: [
					   Condition.createCondition("BT", ["A", "Z"], undefined, undefined, ConditionValidated.NotValidated)
					   ]
			}
		});

		const fnDone = assert.async();
		setTimeout(function () { // wait for rendering
			oCore.applyChanges();
			const oOperatorField = oCore.byId("DCP1--0-operator-inner");
			oOperatorField.setDOMValue("XXX");
			oOperatorField.setValue("XXX");
			oOperatorField.fireChange({value: "XXX"}); // fake wrong input

			setTimeout(function () { // as model update is async
				setTimeout(function () { // as parsing is async
					setTimeout(function () { // as model update is async
						setTimeout(function () { // as row update is async
							oCore.applyChanges();
							let aConditions = oDefineConditionPanel.getConditions();
							assert.equal(aConditions[0].operator, "BT", "Operator set on condition");
							assert.deepEqual(aConditions[0].values, ["A", "Z"], "Values set on condition");

							const oGrid = oCore.byId("DCP1--conditions");
							let aContent = oGrid.getContent();
							let oField1 = aContent[2];
							let oField2 = aContent[3];

							assert.equal(aContent.length, 6, "One row with two fields created - Grid contains 6 controls");
							assert.ok(oField1 && oField1.isA("sap.ui.mdc.Field"), "Field1 is mdc Field");
							assert.ok(oField2 && oField2.isA("sap.ui.mdc.Field"), "Field2 is mdc Field");
							assert.equal(oField1 && oField1.getEditMode(), FieldEditMode.ReadOnly, "Field1 is readonly");
							assert.equal(oField2 && oField2.getEditMode(), FieldEditMode.ReadOnly, "Field2 is readonly");
							assert.notOk(oDefineConditionPanel.getInputOK(), "InputOK not set");

							oOperatorField.setValue("BT");
							oOperatorField.fireChange({value: "BT"}); // fake right input

							setTimeout(function () { // as model update is async
								setTimeout(function () { // as parsing is async
									setTimeout(function () { // as model update is async
										setTimeout(function () { // as row update is async
											oCore.applyChanges();
											aConditions = oDefineConditionPanel.getConditions();
											assert.equal(aConditions[0].operator, "BT", "Operator set on condition");
											assert.deepEqual(aConditions[0].values, ["A", "Z"], "Values set on condition");

											aContent = oGrid.getContent();
											oField1 = aContent[2];
											oField2 = aContent[3];

											assert.equal(aContent.length, 6, "One row with two fields created - Grid contains 6 controls");
											assert.ok(oField1 && oField1.isA("sap.ui.mdc.Field"), "Field1 is mdc Field");
											assert.ok(oField2 && oField2.isA("sap.ui.mdc.Field"), "Field2 is mdc Field");
											assert.equal(oField1 && oField1.getEditMode(), FieldEditMode.Editable, "Field1 is editable");
											assert.equal(oField2 && oField2.getEditMode(), FieldEditMode.Editable, "Field2 is editable");
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

	QUnit.test("validate condition on user input", function(assert) {

		oModel.setData({
			conditions: {
				Name: [
					   Condition.createCondition("BT", ["A", "B"], undefined, undefined, ConditionValidated.NotValidated)
					   ]
			}
		});

		const fnDone = assert.async();

		setTimeout(function () { // for model update
			oCore.applyChanges();
			assert.equal(oModel.getConditions("Name").length, 1, "1 conditions should exist");
			assert.ok(oDefineConditionPanel.getInputOK(), "InputOK set as default");

			const oGrid = oCore.byId("DCP1--conditions");
			const aContent = oGrid.getContent();
			const oOperatorField = aContent[0];
			const oField1 = aContent[2];
			const oField2 = aContent[3];
			const oButton = aContent[4];

			oField1.focus();
			setTimeout(function() { // for FieldGroup delay
				jQuery(oField1.getFocusDomRef()).val("B");
				qutils.triggerKeydown(oField1.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
				oButton.focus(); // to leave FieldGroup
				oCore.applyChanges();
				setTimeout(function() { // for FieldGroup delay

					assert.equal(oField1.getValueState(), "Error", "first Field has Error state");
					assert.ok(oField1.getValueStateText(), "first Field has Error state text");
					assert.equal(oField2.getValueState(), "Error", "second Field has Error state");
					assert.ok(oField2.getValueStateText(), "second Field has Error state text");
					assert.notOk(oDefineConditionPanel.getInputOK(), "InputOK not set");

					oField2.focus();
					setTimeout(function() { // for fieldGroup delay
						jQuery(oField2.getFocusDomRef()).val("C");
						qutils.triggerKeydown(oField2.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
						oButton.focus(); // to leave FieldGroup
						oCore.applyChanges();
						setTimeout(function() { // for FieldGroup delay

							assert.equal(oField1.getValueState(), "None", "first Field has no Error state");
							assert.notOk(oField1.getValueStateText(), "first Field has no Error state text");
							assert.equal(oField2.getValueState(), "None", "second Field has no Error state");
							assert.notOk(oField2.getValueStateText(), "second Field has no Error state text");
							assert.ok(oDefineConditionPanel.getInputOK(), "InputOK set");

							assert.equal(oModel.getConditions("Name").length, 1, "1 conditions should exist");
							assert.equal(oModel.getConditions("Name")[0].values[0], "B", "condition value0 should be changed");
							assert.equal(oModel.getConditions("Name")[0].values[1], "C", "condition value1 should be changed");

							oField1.focus();
							setTimeout(function() { // for FieldGroup delay
								jQuery(oField1.getFocusDomRef()).val("C");
								qutils.triggerKeydown(oField1.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
								oOperatorField.focus();
								setTimeout(function() { // for FieldGroup delay
									oButton.focus(); // to leave FieldGroup
									oCore.applyChanges();
									setTimeout(function() { // for FieldGroup delay

										assert.equal(oField1.getValueState(), "Error", "first Field has Error state");
										assert.ok(oField1.getValueStateText(), "first Field has Error state text");
										assert.equal(oField2.getValueState(), "Error", "second Field has Error state");
										assert.ok(oField2.getValueStateText(), "second Field has Error state text");
										assert.notOk(oDefineConditionPanel.getInputOK(), "InputOK not set");

										assert.equal(oModel.getConditions("Name").length, 1, "1 conditions should exist");
										assert.equal(oModel.getConditions("Name")[0].values[0], "C", "condition value0 should be changed");
										assert.equal(oModel.getConditions("Name")[0].values[1], "C", "condition value1 should be changed");

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

	let oCustomOperator;

	QUnit.module("Custom Operator", {
		beforeEach: function() {
			oCustomOperator = new Operator({
				name: "MyOperator",
				filterOperator: "EQ",
				tokenParse: "^#tokenText#$",
				tokenFormat: "#tokenText#",
				tokenText: "Text",
				longText: "Longtext",
				valueTypes: [OperatorValueType.Self],
				createControl: function(oType, sPath, index, sId) {
					return new Button({text: {path: sPath, type: oType}});
				}
			});

			FilterOperatorUtil.addOperator(oCustomOperator);
			_init(true);
		},
		afterEach: function() {
			_teardown();
			delete FilterOperatorUtil._mOperators[oCustomOperator.name]; // TODO: do we need an API?
			oCustomOperator = undefined;
		}
	});

	QUnit.test("use custom operator", function(assert) {

		oModel.setData({
			conditions: {
				Name: [
					   Condition.createCondition("MyOperator", ["Test"], undefined, undefined, ConditionValidated.NotValidated)
					   ]
			}
		});
		oConfig = {
				dataType: oDataType,
				maxConditions: -1,
				operators: ["MyOperator"],
				delegate: FieldBaseDelegate,
				delegateName: "sap/ui/mdc/field/FieldBaseDelegate"
		};

		oDefineConditionPanel.setConfig(oConfig);
		oCore.applyChanges();

		const fnDone = assert.async();
		setTimeout(function () { // to wait for rendering
			const oGrid = oCore.byId("DCP1--conditions");
			const aContent = oGrid.getContent();
			const oField = aContent[2];

			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			assert.ok(oField && oField.isA("sap.m.Button"), "Field is sap.m.Button");
			assert.equal(oField.getText(), "Test", "Value of FIeld");

			const oOperatorField = aContent[0];
			const oVH = oCore.byId(oOperatorField.getValueHelp());
			const oPopover = oVH.getTypeahead();
			const oFL = oPopover.getContent()[0];
			const aItems = oFL.getItems();

			assert.equal(aItems.length, 1, "Only one Operator available");
			assert.equal(aItems[0].getText(), "Longtext", "Text of operator");

			// fake changing value
			oField.setText("X");
			assert.equal(oModel.getConditions("Name")[0].values[0], "X", "condition value should be changed");

			fnDone();
		}, 0);

	});

	QUnit.test("switch custom operator", function(assert) {

		const aOriginalOperators = FilterOperatorUtil.getOperatorsForType(BaseType.String);
		FilterOperatorUtil.setOperatorsForType(BaseType.String, [FilterOperatorUtil.getOperator("BT"), oCustomOperator], oCustomOperator);

		oCore.applyChanges();

		const fnDone = assert.async();
		setTimeout(function () { // to wait for rendering
			const oGrid = oCore.byId("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oOperatorField = aContent[0]; // operator
			const oVH = oCore.byId(oOperatorField.getValueHelp());
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
			assert.ok(oField && oField.isA("sap.m.Button"), "Field is sap.m.Button");
			assert.deepEqual(oField.getText && oField.getText(), "", "Field empty");

			// switch operator
			oOperatorField.setValue("BT");
			oOperatorField.fireChange({value: "BT", valid: true, promise: Promise.resolve("BT")}); // fake item select

			setTimeout(function () { // as model update is async
				oCore.applyChanges();
				aConditions = oDefineConditionPanel.getConditions();
				assert.equal(aConditions[0].operator, "BT", "Operator set on condition");
				assert.deepEqual(aConditions[0].values, [null, null], "Values set on condition");

				aContent = oGrid.getContent();
				oField = aContent[2];

				assert.equal(aContent.length, 6, "One row with one fields created - Grid contains 6 controls");
				assert.ok(oField && oField.isA("sap.ui.mdc.Field"), "Field is mdc Field");
				assert.deepEqual(oField.getValue && oField.getValue(), null, "Field value");
				oField = aContent[3];
				assert.ok(oField && oField.isA("sap.ui.mdc.Field"), "Field is mdc Field2");
				assert.deepEqual(oField.getValue && oField.getValue(), null, "Field2 value");

				// switch operator back
				oOperatorField.setValue("MyOperator");
				oOperatorField.fireChange({value: "MyOperator", valid: true, promise: Promise.resolve("MyOperator")}); // fake item select

				setTimeout(function () { // as model update is async
					oCore.applyChanges();
					aConditions = oDefineConditionPanel.getConditions();
					assert.equal(aConditions[0].operator, "MyOperator", "Operator set on condition");
					assert.deepEqual(aConditions[0].values, [null], "Values set on condition");

					aContent = oGrid.getContent();
					oField = aContent[2];

					assert.equal(aContent.length, 5, "One row with one fields created - Grid contains 5 controls");
					assert.ok(oField && oField.isA("sap.m.Button"), "Field is sap.m.Button");
					assert.deepEqual(oField.getText && oField.getText(), "", "Field empty");

					FilterOperatorUtil.setOperatorsForType(BaseType.String, aOriginalOperators, FilterOperatorUtil.getOperator("EQ"));
					fnDone();
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.module("Type dependend functions", {
		beforeEach: function() {
			_init();
			},
		afterEach: _teardown
	});

	const _initType = function(oType, oCondition, sBaseType) {

		oDataType.destroy();
		oDataType = oType;
		oModel.setData({
			conditions: {
				Name: [
					   oCondition
					   ]
			}
		});
		oConfig = {
				dataType: oDataType,
				maxConditions: -1,
				operators: FilterOperatorUtil.getOperatorsForType(sBaseType),
				delegate: FieldBaseDelegate,
				delegateName: "sap/ui/mdc/field/FieldBaseDelegate"
		};

		oDefineConditionPanel.setConfig(oConfig);
		oCore.applyChanges();

	};

	QUnit.test("use date type - EQ", function(assert) {

		_initType(new DateType(), Condition.createCondition("EQ", [new Date(2018, 10, 16)], undefined, undefined, ConditionValidated.NotValidated), BaseType.Date);

		const fnDone = assert.async();
		setTimeout(function () { // to wait for retemplating
			oCore.applyChanges();
			const oGrid = oCore.byId("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];

			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			aContent = oField.getAggregation("_content");
			const oControl = aContent && aContent.length > 0 && aContent[0];

			assert.ok(oControl.isA("sap.m.DatePicker"), "Field uses DatePicker");
			const oType = oField.getBindingInfo("value").type;
			assert.ok(oType instanceof DateType, "Type of Field binding");
			assert.ok(oField.getValue() instanceof Date, "Value of Field is Date");
			assert.equal(oField.getValue().getFullYear(), 2018, "Year");
			fnDone();
		}, 0);

	});

	QUnit.test("use date type - TODAY", function(assert) {

		const oDateType = new DateType();
		_initType(oDateType, Condition.createCondition("TODAY", [], undefined, undefined, ConditionValidated.NotValidated), BaseType.Date);

		const fnDone = assert.async();
		setTimeout(function () { // to wait for retemplating
			oCore.applyChanges();
			const oGrid = oCore.byId("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];

			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			aContent = oField.getAggregation("_content");
			const oControl = aContent && aContent.length > 0 && aContent[0];

			assert.equal(oField && oField.getEditMode(), FieldEditMode.Display, "Field is in display mode");
			assert.ok(oControl.isA("sap.m.Text"), "Field uses Text");
			const oType = oField.getBindingInfo("value").type;
			assert.ok(oType instanceof StringType, "Type of Field binding");
			assert.equal(typeof oField.getValue(), "string", "Value of Field is String");
			assert.equal(oField.getValue(), oDateType.formatValue(new Date(), "string"), "Text");
			fnDone();
		}, 0);

	});

	QUnit.test("use date type - NEXTDAYS", function(assert) {

		const oDateType = new DateType();
		_initType(oDateType, Condition.createCondition("NEXTDAYS", [5], undefined, undefined, ConditionValidated.NotValidated), BaseType.Date);

		const fnDone = assert.async();
		setTimeout(function () { // to wait for retemplating
			oCore.applyChanges();
			const oGrid = oCore.byId("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];

			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			aContent = oField.getAggregation("_content");
			const oControl = aContent && aContent.length > 0 && aContent[0];

			assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field uses Input");
			const oType = oField.getBindingInfo("value").type;
			assert.ok(oType instanceof IntegerType, "Type of Field binding");
			assert.equal(typeof oField.getValue(), "number", "Value of Field is Number");
			assert.equal(oField.getValue(), 5, "Value");
			fnDone();
		}, 0);

	});

	QUnit.test("use date type - Change Operator", function(assert) {

		const oDateType = new DateType();
		_initType(new DateType(), Condition.createCondition("EQ", [new Date(2020, 1, 24)], undefined, undefined, ConditionValidated.NotValidated), BaseType.Date);

		const fnDone = assert.async();
		setTimeout(function () { // to wait for retemplating
			oCore.applyChanges();
			const oGrid = oCore.byId("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oOperatorField = aContent[0];
			oOperatorField.setValue("TODAY");
			oOperatorField.fireChange({value: "TODAY", valid: true, promise: Promise.resolve("TODAY")}); // fake item select

			setTimeout(function () { // as model update is async
				oCore.applyChanges();
				aContent = oGrid.getContent();
				let oField = aContent[2];
				assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
				aContent = oField && oField.getAggregation("_content");
				let oControl = aContent && aContent.length > 0 && aContent[0];

				assert.ok(oControl.isA("sap.m.Text"), "Field uses Text");
				let oType = oField.getBindingInfo("value").type;
				assert.ok(oType instanceof StringType, "Type of Field binding");
				assert.equal(typeof oField.getValue(), "string", "Value of Field is String");
				assert.equal(oField.getValue(), oDateType.formatValue(new Date(), "string"), "Text");

				oOperatorField.setValue("NEXTDAYS");
				oOperatorField.fireChange({value: "NEXTDAYS", valid: true, promise: Promise.resolve("NEXTDAYS")}); // fake item select

				setTimeout(function () { // as model update is async
					setTimeout(function () { // as change event is async
						oCore.applyChanges();
						aContent = oGrid.getContent();
						oField = aContent[2];
						assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
						aContent = oField && oField.getAggregation("_content");
						oControl = aContent && aContent.length > 0 && aContent[0];

						assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field uses Input");
						oType = oField.getBindingInfo("value").type;
						assert.ok(oType instanceof IntegerType, "Type of Field binding");
						assert.equal(oField.getValue(), 1, "default value");

						oControl.setValue("5");
						oControl.fireChange({value: "5"}); //fake input
						setTimeout(function () { // as model update is async
							oOperatorField.setValue("EQ");
							oOperatorField.fireChange({value: "EQ", valid: true, promise: Promise.resolve("EQ")}); // fake item select

							setTimeout(function () { // as model update is async
								setTimeout(function () { // as change event is async
									oCore.applyChanges();
									aContent = oGrid.getContent();
									oField = aContent[2];
									assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
									aContent = oField && oField.getAggregation("_content");
									oControl = aContent && aContent.length > 0 && aContent[0];

									assert.ok(oControl.isA("sap.m.DatePicker"), "Field uses DatePicker");
									oType = oField.getBindingInfo("value").type;
									assert.ok(oType instanceof DateType, "Type of Field binding");
									assert.notOk(oField.getValue(), "no Value");

									oOperatorField.setValue("TODAYFROMTO");
									oOperatorField.fireChange({value: "TODAYFROMTO", valid: true, promise: Promise.resolve("TODAYFROMTO")}); // fake item select

									setTimeout(function () { // as model update is async
										setTimeout(function () { // as change event is async
											oCore.applyChanges();
											aContent = oGrid.getContent();
											oField = aContent[2];
											assert.equal(aContent.length, 6, "One row with two field created - Grid contains 6 controls");
											aContent = oField && oField.getAggregation("_content");
											oControl = aContent && aContent.length > 0 && aContent[0];
											assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field uses Input");
											oType = oField.getBindingInfo("value").type;
											assert.ok(oType instanceof IntegerType, "Type of Field binding");
											assert.equal(oField.getValue(), 1, "default Value");
											oControl.setValue("6");
											oControl.fireChange({value: "6"}); //fake input

											aContent = oGrid.getContent();
											oField = aContent[3];
											aContent = oField && oField.getAggregation("_content");
											oControl = aContent && aContent.length > 0 && aContent[0];
											assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "second Field uses Input");
											oType = oField.getBindingInfo("value").type;
											assert.ok(oType instanceof IntegerType, "Type of second Field binding");
											assert.equal(oField.getValue(), 1, "default Value");
											oControl.setValue("6");
											oControl.fireChange({value: "6"}); //fake input

											setTimeout(function () { // as model update is async
												oOperatorField.setValue("BT");
												oOperatorField.fireChange({value: "BT", valid: true, promise: Promise.resolve("BT")}); // fake item select

												setTimeout(function () { // as model update is async
													setTimeout(function () { // as change event is async
														oCore.applyChanges();
														aContent = oGrid.getContent();
														oField = aContent[2];
														assert.equal(aContent.length, 6, "One row with two field created - Grid contains 6 controls");
														aContent = oField && oField.getAggregation("_content");
														oControl = aContent && aContent.length > 0 && aContent[0];
														assert.ok(oControl.isA("sap.m.DatePicker"), "Field uses DatePicker");
														oType = oField.getBindingInfo("value").type;
														assert.ok(oType instanceof DateType, "Type of Field binding");
														assert.notOk(oField.getValue(), "no Value");

														aContent = oGrid.getContent();
														oField = aContent[3];
														aContent = oField && oField.getAggregation("_content");
														oControl = aContent && aContent.length > 0 && aContent[0];
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

	QUnit.test("use date type - change to dateTimetype", function(assert) {

		const oDateType = new DateType();
		const oCondition = Condition.createCondition("EQ", [new Date(Date.UTC(2022, 8, 14, 10, 27, 30))], undefined, undefined, ConditionValidated.NotValidated);
		oCondition.isEmpty = false; // to really have the same data
		_initType(oDateType, oCondition, BaseType.Date);

		const fnDone = assert.async();
		setTimeout(function () { // to wait for retemplating
			oCore.applyChanges();

			const oDateTimeType = new DateTimeType();
			_initType(oDateTimeType, oCondition, BaseType.DateTime);

			setTimeout(function () { // to wait for retemplating
				oCore.applyChanges();
				const oGrid = oCore.byId("DCP1--conditions");
				let aContent = oGrid.getContent();
				const oField = aContent[2];

				assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
				aContent = oField.getAggregation("_content");
				const oControl = aContent && aContent.length > 0 && aContent[0];

				assert.equal(oField && oField.getEditMode(), FieldEditMode.Editable, "Field is in edit mode");
				assert.ok(oControl.isA("sap.m.DateTimePicker"), "Field uses DateTimePicker");
				const oType = oField.getBindingInfo("value").type;
				assert.ok(oType instanceof DateTimeType, "Type of Field binding");
				assert.ok(oField.getValue() instanceof Date, "Value of Field is Date");
				assert.equal(oField.getValue().getFullYear(), 2022, "Year");
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("use boolean type", function(assert) {

		_initType(new BooleanType(), Condition.createCondition("EQ", [true], undefined, undefined, ConditionValidated.NotValidated), BaseType.Boolean);

		const fnDone = assert.async();
		setTimeout(function () { // to wait for condition update
			oCore.applyChanges();
			setTimeout(function () { // to wait for renderng
				const oGrid = oCore.byId("DCP1--conditions");
				let aContent = oGrid.getContent();
				const oField = aContent[2];
				assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
				aContent = oField.getAggregation("_content");
				const oControl = aContent && aContent.length > 0 && aContent[0];

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

	QUnit.test("use integer type", function(assert) {

		_initType(new IntegerType(), Condition.createCondition("EQ", [1], undefined, undefined, ConditionValidated.NotValidated), BaseType.Numeric);

		const fnDone = assert.async();
		setTimeout(function () { // to wait for retemplating
			const oGrid = oCore.byId("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];
			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			aContent = oField.getAggregation("_content");
			const oControl = aContent && aContent.length > 0 && aContent[0];

			assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field uses Input");
			const oType = oField.getBindingInfo("value").type;
			assert.ok(oType.isA("sap.ui.model.type.Integer"), "Type of Field binding");
			assert.equal(typeof oField.getValue(), "number", "Value of Field is Number");
			assert.equal(oField.getValue(), 1, "Value");
			fnDone();
		}, 0);

	});

	QUnit.test("enter invalid value and remove condition", function(assert) {

		_initType(new IntegerType(), Condition.createCondition("EQ", [1], undefined, undefined, ConditionValidated.NotValidated), BaseType.Numeric);

		const fnDone = assert.async();
		setTimeout(function () { // to wait for retemplating
			const oGrid = oCore.byId("DCP1--conditions");
			// sap.ui.getCore().getMessageManager().registerObject(oGrid, true); // to activate message manager

			let aContent = oGrid.getContent();
			const oField = aContent[2];
			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			aContent = oField.getAggregation("_content");
			const oControl = aContent && aContent.length > 0 && aContent[0];

			oControl.setValue("foo");
			oControl.fireChange({value: "foo"}); //fake invalide input
			setTimeout(function () { // as model update is async
				assert.equal( oControl.getValueState(), "Error", "Error shown on the value field");

				const oRemoveBtn = oCore.byId("DCP1--0--removeBtnLarge");
				oRemoveBtn.firePress();
				setTimeout(function () { // as condition rendering is triggered async.
					oCore.applyChanges();

					assert.equal(oControl.getValueState(), "None", "No Error shown on the value field");
					assert.equal(oControl.getValue(), "", "value of the field is empty");

					fnDone();
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("use float type", function(assert) {

		_initType(new FloatType(), Condition.createCondition("EQ", [1.1], undefined, undefined, ConditionValidated.NotValidated), BaseType.Numeric);

		const fnDone = assert.async();
		setTimeout(function () { // to wait for retemplating
			const oGrid = oCore.byId("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];
			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			aContent = oField.getAggregation("_content");
			const oControl = aContent && aContent.length > 0 && aContent[0];

			assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field uses Input");
			const oType = oField.getBindingInfo("value").type;
			assert.ok(oType.isA("sap.ui.model.type.Float"), "Type of Field binding");
			assert.equal(typeof oField.getValue(), "number", "Value of Field is Number");
			assert.equal(oField.getValue(), 1.1, "Value");
			fnDone();
		}, 0);

	});

	QUnit.test("use default type", function(assert) {

		oDataType.destroy();
		oModel.setData({
			conditions: {
				Name: [
					   Condition.createCondition("EQ", ["x"], undefined, undefined, ConditionValidated.NotValidated)
					   ]
			}
		});
		oConfig = {
				dataType: undefined,
				maxConditions: -1,
				delegate: FieldBaseDelegate,
				delegateName: "sap/ui/mdc/field/FieldBaseDelegate"
		};

		oDefineConditionPanel.setConfig(oConfig);
		oCore.applyChanges();

		const fnDone = assert.async();
		setTimeout(function () { // to wait for retemplating
			const oGrid = oCore.byId("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];
			assert.equal(aContent.length, 5, "One row with one field created - Grid contains 5 controls");
			aContent = oField.getAggregation("_content");
			const oControl = aContent && aContent.length > 0 && aContent[0];

			assert.ok(oControl.isA("sap.ui.mdc.field.FieldInput"), "Field uses Input");
			const oType = oField.getBindingInfo("value").type;
			assert.ok(oType.isA("sap.ui.model.type.String"), "Type of Field binding");
			assert.equal(typeof oField.getValue(), "string", "Value of Field is string");
			assert.equal(oField.getValue(), "x", "Value");
			fnDone();
		}, 0);

	});

	QUnit.module("Interaction", {
		beforeEach: function() {
			_init();
			},
		afterEach: _teardown
	});

	QUnit.test("paste multiple values", function(assert) {

		const oConfig = merge({}, oDefineConditionPanel.getConfig());
		oConfig.maxConditions = 3;
		oDefineConditionPanel.setConfig(oConfig); // to test with maxConditions

		const fnDone = assert.async();
		setTimeout(function () { // as model update is async
			oCore.applyChanges();
			const oGrid = oCore.byId("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];
			assert.equal(aContent.length, 5, "Dummy line created");

			aContent = oField.getAggregation("_content");
			const oControl = aContent && aContent.length > 0 && aContent[0];

			const sPastedValues = "AA\nBB\nC	D\nEE";

			const oFakeClipboardData = {
					getData: function() {
						return sPastedValues;
					}
			};

			if (window.clipboardData) {
				window.clipboardData.setData("text", sPastedValues);
			}

			qutils.triggerEvent("paste", oControl.getFocusDomRef(), {clipboardData: oFakeClipboardData});
			setTimeout(function () { // as past handling is async
				const aConditions = oModel.getConditions("Name");
				assert.equal(aConditions.length, 3, "3 Conditions exist");
				assert.equal(aConditions[0].values[0], "BB", "1. Condition");
				assert.equal(aConditions[1].values[0], "C", "2. Condition BT");
				assert.equal(aConditions[1].values[1], "D", "2. Condition BT");
				assert.equal(aConditions[2].values[0], "EE", "3. Condition");

				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.module("Interaction2", {
		beforeEach: function() {
			_init(false, new IntegerType({}, {maximum: 10}));
			},
		afterEach: _teardown
	});

	QUnit.test("paste multiple values with operators and invalid values", function(assert) {

		const oConfig = merge({}, oDefineConditionPanel.getConfig());
		oConfig.maxConditions = -1;
		oDefineConditionPanel.setConfig(oConfig); // to test with maxConditions

		const fnDone = assert.async();
		setTimeout(function () { // as model update is async
			oCore.applyChanges();
			const oGrid = oCore.byId("DCP1--conditions");
			let aContent = oGrid.getContent();
			const oField = aContent[2];
			assert.equal(aContent.length, 5, "Dummy line created");

			aContent = oField.getAggregation("_content");
			const oControl = aContent && aContent.length > 0 && aContent[0];

			const sPastedValues = "1\n2\n1	10\n4...8\n<10\n=12";

			const oFakeClipboardData = {
					getData: function() {
						return sPastedValues;
					}
			};

			if (window.clipboardData) {
				window.clipboardData.setData("text", sPastedValues);
			}

			qutils.triggerEvent("paste", oControl.getFocusDomRef(), {clipboardData: oFakeClipboardData});
			setTimeout(function () { // as paste handling is async
				const aConditions = oModel.getConditions("Name");
				assert.equal(aConditions.length, 1, "1 Condition exist"); // just dummy condition
				assert.ok(oField.isInvalidInput(), "Field has error state"); // don't test valueState as this is set async by binding

				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.module("usage of ValueHelp on value fields", {
		beforeEach: function() {
			_init();
			},
		afterEach: _teardown
	});

	QUnit.test("value field has valueHelp for EQ and NE operators", function(assert) {

		oModel.setData({
			conditions: {
				Name: [
					   Condition.createCondition("BT", ["A", "Z"], undefined, undefined, ConditionValidated.NotValidated),
					   Condition.createCondition("NE", ["X"], undefined, undefined, ConditionValidated.NotValidated),
					   Condition.createCondition("LE", ["X"], undefined, undefined, ConditionValidated.NotValidated)
					   ]
			}
		});

		assert.equal(oDefineConditionPanel.getValueHelp(), null, "default valueHelp is not defined");
		oDefineConditionPanel.setValueHelp("MyTestValueHelp");
		assert.equal(oDefineConditionPanel.getValueHelp(), "MyTestValueHelp", "valueHelp is set");

		const fnDone = assert.async();
		setTimeout(function () { // wait for rendering
			oCore.applyChanges();
			const oOperatorField = oCore.byId("DCP1--0-operator-inner");
			oOperatorField.setValue("EQ");
			oOperatorField.fireChange({value: "EQ"}); // fake item select

			setTimeout(function () { // as model update is async
				setTimeout(function () { // as parsing is async
					setTimeout(function () { // as model update is async
						setTimeout(function () { // as row update is async
							oCore.applyChanges();

							const oField1 = oCore.byId("DCP1--0-values0");
							const oField2 = oCore.byId("DCP1--1-values0");
							const oField3 = oCore.byId("DCP1--2-values0");
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
