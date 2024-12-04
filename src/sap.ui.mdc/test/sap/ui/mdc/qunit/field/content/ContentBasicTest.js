/*globals sinon*/
sap.ui.define([
	"sap/ui/mdc/field/content/ContentFactory",
	"sap/ui/mdc/field/ConditionType",
	"sap/ui/mdc/field/ConditionsType",
	"sap/ui/mdc/field/FieldInput",
	"sap/ui/mdc/field/FieldMultiInput",
	"sap/ui/mdc/field/TokenizerDisplay",
	"sap/ui/mdc/field/TokenDisplay",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/DefaultTypeMap",
	"sap/m/library",
	"sap/m/Text",
	"sap/m/ExpandableText",
	"sap/m/TextArea",
	"sap/m/Token",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/String" // ho have it loaded
], (
	ContentFactory,
	ConditionType,
	ConditionsType,
	FieldInput,
	FieldMultiInput,
	TokenizerDisplay,
	TokenDisplay,
	FieldEditMode,
	OperatorName,
	DefaultTypeMap,
	mobileLibrary,
	Text,
	ExpandableText,
	TextArea,
	Token,
	JSONModel,
	StringType
) => {
	"use strict";

	const EmptyIndicatorMode = mobileLibrary.EmptyIndicatorMode;

	const oControlMap = {
		"Display": {
			getPathsFunction: "getDisplay",
			paths: ["sap/m/Text"],
			modules: [Text],
			instances: [Text],
			createFunction: "createDisplay",
			noFormatting: false,
			editMode: FieldEditMode.Display,
			bindings: [
				{
					text: {path: "$field>/conditions", type: ConditionsType},
					textAlign: {path: "$field>/textAlign"},
					textDirection: {path: "$field>/textDirection"},
					wrapping: {path: "$field>/multipleLines"},
					tooltip: {path: "$field>/tooltip"}
				}
			],
			properties: [
				{
					width: "100%",
					emptyIndicatorMode: EmptyIndicatorMode.Auto
				}
			],
			events: [
				{}
			]
		},
		"DisplayMultiValue": {
			getPathsFunction: "getDisplayMultiValue",
			paths: [ "sap/ui/mdc/field/TokenizerDisplay", "sap/ui/mdc/field/TokenDisplay"],
			modules: [TokenizerDisplay, TokenDisplay],
			instances: [TokenizerDisplay],
			createFunction: "createDisplayMultiValue",
			boundAggregations: ["tokens"],
			aggregationInstances: [TokenDisplay],
			noFormatting: false,
			editMode: FieldEditMode.Display,
			bindings: [
				{
					tokens: {path: "$field>/conditions"},
					//textAlign: {path: "$field>/textAlign",
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
					emptyIndicatorMode: EmptyIndicatorMode.Auto
				}
			],
			events: [
				{}
			]
		},
		"DisplayMultiLine": {
			getPathsFunction: "getDisplayMultiLine",
			paths: ["sap/m/ExpandableText"],
			modules: [ExpandableText],
			instances: [ExpandableText],
			createFunction: "createDisplayMultiLine",
			noFormatting: false,
			editMode: FieldEditMode.Display,
			bindings: [
				{
					text: {path: "$field>/conditions", type: ConditionsType},
					textAlign: {path: "$field>/textAlign"},
					textDirection: {path: "$field>/textDirection"},
					tooltip: {path: "$field>/tooltip"}
				}
			],
			properties: [
				{
					emptyIndicatorMode: EmptyIndicatorMode.Auto
				}
			],
			events: [
				{}
			]
		},
		"Edit": {
			getPathsFunction: "getEdit",
			paths: ["sap/ui/mdc/field/FieldInput"],
			modules: [FieldInput],
			instances: [FieldInput],
			createFunction: "createEdit",
			noFormatting: false,
			editMode: FieldEditMode.Edititable,
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
					showValueHelp: {path: "$field>/_valueHelpEnabled"},
					ariaAttributes: {path: "$field>/_ariaAttributes"},
					tooltip: {path: "$field>/tooltip"}
				}
			],
			properties: [
				{
					width: "100%",
					autocomplete: false,
					showSuggestion: false,
					valueState: "Warning",
					valueStateText: "My Warning"
				}
			],
			events: [
				{
					change: {value: "X"},
					liveChange: {value: "X", previousValue: "", escPressed: false},
					valueHelpRequest: {fromSuggestions: false, fromKeyboard: false}
				}
			]
		},
		"EditMultiValue": {
			getPathsFunction: "getEditMultiValue",
			paths: ["sap/ui/mdc/field/FieldMultiInput", "sap/m/Token"],
			modules: [FieldMultiInput, Token],
			instances: [FieldMultiInput],
			createFunction: "createEditMultiValue",
			boundAggregations: ["tokens"],
			aggregationInstances: [Token],
			noFormatting: true,
			editMode: FieldEditMode.Edititable,
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
					showValueHelp: {path: "$field>/_valueHelpEnabled"},
					ariaAttributes: {path: "$field>/_ariaAttributes"},
					tooltip: {path: "$field>/tooltip"},
					tokens: {path: "$field>/conditions", length: 10, startIndex: -10}
				}
			],
			aggregationBindings: [
				{
					text: {path: "$field>", type: ConditionType}
				}
			],
			properties: [
				{
					width: "100%",
					autocomplete: false,
					showSuggestion: false,
					valueState: "Warning",
					valueStateText: "My Warning"
				}
			],
			events: [
				{
					change: {value: "X"},
					liveChange: {value: "X", previousValue: "", escPressed: false},
					valueHelpRequest: {fromSuggestions: false, fromKeyboard: false},
					tokenUpdate: {}
				}
			]
		},
		"EditMultiLine": {
			getPathsFunction: "getEditMultiLine",
			paths: ["sap/m/TextArea"],
			modules: [TextArea],
			instances: [TextArea],
			createFunction: "createEditMultiLine",
			noFormatting: false,
			editMode: FieldEditMode.Edititable,
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
					tooltip: {path: "$field>/tooltip"}
				}
			],
			properties: [
				{
					width: "100%",
					rows: 4,
					valueState: "Warning",
					valueStateText: "My Warning"
				}
			],
			events: [
				{
					change: {value: "X"},
					liveChange: {value: "X"}
				}
			]
		},
		"EditForHelp": {
			getPathsFunction: "getEditForHelp",
			paths: ["sap/ui/mdc/field/FieldInput"],
			modules: [FieldInput],
			instances: [FieldInput],
			createFunction: "createEditForHelp",
			noFormatting: false,
			editMode: FieldEditMode.Edititable,
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
					showValueHelp: {path: "$field>/_valueHelpEnabled"},
					ariaAttributes: {path: "$field>/_ariaAttributes"},
					tooltip: {path: "$field>/tooltip"}
				}
			],
			properties: [
				{
					width: "100%",
					autocomplete: false,
					showSuggestion: false,
					valueState: "Warning",
					valueStateText: "My Warning"
				}
			],
			events: [
				{
					change: {value: "X"},
					liveChange: {value: "X", previousValue: "", escPressed: false},
					valueHelpRequest: {fromSuggestions: false, fromKeyboard: false}
				}
			]
		},
		"EditOperator": {
			getPathsFunction: "getEditOperator",
			paths: [null],
			modules: [],
			instances: [],
			createFunction: undefined,
			noFormatting: false,
			editMode: FieldEditMode.Edititable
		}
	};

	const aControlMapKeys = Object.keys(oControlMap);

	const oModel = new JSONModel({ // just to fake ManagedObjectModel of Field to test bindings
		conditions: [],
		placeholder: "placeholder",
		editMode: "Editable",
		required: false,
		valueState: "Warning",
		valueStateText: "My Warning",
		tooltip: "Tooltip",
		textAlign: "Initial",
		textDirection: "Inherit",
		fieldGroupIds: ["X1"],
		_operators: [OperatorName.EQ, OperatorName.TODAY, OperatorName.BT, OperatorName.NOTBT]
	});
	const oStub = sinon.stub(oModel, "getProperty");
	oStub.withArgs("/").callsFake((sPath, oContext) => { // fake behaviour of ManagedObjectModel
		return oContext;
	});
	oStub.callThrough();

	const fnInitEventCount = () => {
		this.oEventCount = {
			tokenUpdate: 0,
			change: 0,
			liveChange: 0,
			valueHelpRequest: 0,
			enter: 0,
			press: 0
		};
	};
	const fnInitContentFactory = (sType, oFormatOptions, fnEnhanceField, sBaseType) => {
		this.sEditMode = FieldEditMode.Display;
		const oFakeField = {
			getId: () => {return "F1";},
			getTypeMap: () => {return DefaultTypeMap;},
			getBaseType: () => {return sBaseType;},
			getFormatOptions: () => {return {test: true};},
			getUnitFormatOptions: () => {return {test: true};},
			_getValueHelpIcon: () => {return "sap-icon://slim-arrow-down";},
			getAriaLabelledBy: () => {return [];},
			getDataType: () => {return sType;},
			getDataTypeConstraints: () => {return null;},
			getDataTypeFormatOptions: () => {return oFormatOptions;},
			getFieldInfo: () => {return null;},
			getEditMode: () => {return this.sEditMode;},
			isInvalidInput: () => {return false;},
			_isInvalidInputForContent: (oContent) => {return false;},
			_getInvalidInputException: (oContent) => {return null;},
			isInvalidateSuppressed: () => {return true;}
		};
		fnEnhanceField?.(oFakeField);
		fnInitEventCount();
		this.oContentFactory = new ContentFactory("CF1", {
			field: oFakeField,
			handleTokenUpdate: (oEvent) => {this.oEventCount.tokenUpdate++;},
			handleContentChange: (oEvent) => {this.oEventCount.change++;},
			handleContentLiveChange: (oEvent) => {this.oEventCount.liveChange++;},
			handleValueHelpRequest: (oEvent) => {this.oEventCount.valueHelpRequest++;},
			handleEnter: (oEvent) => {this.oEventCount.enter++;},
			handleContentPress: (oEvent) => {this.oEventCount.press++;}
		});
		this.aControls = [];
	};

	const fnCleanUpContentFactory = () => {
		this.oContentFactory.destroy();
		delete this.oContentFactory;
		while (this.aControls.length > 0) {
			const oControl = this.aControls.pop();
			if (oControl) {
				oControl.destroy();
			}
		}
	};

	return {
		controlMapKeys: aControlMapKeys,
		controlMap: oControlMap,
		model: oModel,
		initContentFactory: fnInitContentFactory,
		cleanUpContentFactory: fnCleanUpContentFactory,
		test: (QUnit, Content, sContentName, sType, oFormatOptions, FieldInfo, sBaseType, oDefaultValueHelp, bUseDefaultEnterHandler) => {
			QUnit.module("Getters");

			aControlMapKeys.forEach((sControlMapKey) => {
				const oValue = oControlMap[sControlMapKey];
				QUnit.test(sControlMapKey, (assert) => {
					assert.deepEqual(Content[oValue.getPathsFunction](), oValue.paths, "Correct control path returned for ContentMode '" + sControlMapKey + "'.");
				});
			});

			QUnit.test("getUseDefaultEnterHandler", (assert) => {
				assert.equal(Content.getUseDefaultEnterHandler(), bUseDefaultEnterHandler, "Correct useDefaultEnterHandler value returned.");
			});

			QUnit.test("getUseDefaultValueHelp", (assert) => {
				const oUseDefaultValueHelp = Content.getUseDefaultValueHelp();
				if (oDefaultValueHelp) {
					assert.equal(oUseDefaultValueHelp.name, oDefaultValueHelp.name, "Correct useDefaultValueHelp.name value returned.");
					assert.equal(oUseDefaultValueHelp.oneOperatorSingle, oDefaultValueHelp.oneOperatorSingle, "Correct useDefaultValueHelp.oneOperatorSingle value returned.");
					assert.equal(oUseDefaultValueHelp.oneOperatorMulti, oDefaultValueHelp.oneOperatorMulti, "Correct useDefaultValueHelp.oneOperatorMulti value returned.");
					assert.equal(oUseDefaultValueHelp.single, oDefaultValueHelp.single, "Correct useDefaultValueHelp.single value returned.");
					assert.equal(oUseDefaultValueHelp.multi, oDefaultValueHelp.multi, "Correct useDefaultValueHelp.multi value returned.");
				} else {
					assert.notOk(oUseDefaultValueHelp, "No DefaultValueHelp used.");
				}
			});

			QUnit.test("getControlNames", (assert) => {
				/* no need to use oOperator here as there is no editOperator*/
				assert.deepEqual(Content.getControlNames(null), oControlMap["Edit"].paths, "Correct controls returned for ContentMode null");
				assert.deepEqual(Content.getControlNames(undefined), oControlMap["Edit"].paths, "Correct controls returned for ContentMode undefined");
				assert.deepEqual(Content.getControlNames("idghsoidpgdfhkfokghkl"), oControlMap["Edit"].paths, "Correct controls returned for not specified ContentMode");

				aControlMapKeys.forEach((sControlMapKey) => {
					const oValue = oControlMap[sControlMapKey];
					const aControlNames = oValue.operator ? [oValue.paths[oValue.operator].name] : oValue.paths;
					assert.deepEqual(Content.getControlNames(oValue.key || sControlMapKey, oValue.operator), aControlNames, "Correct default controls returned for ContentMode " + sControlMapKey);
				});
			});

			QUnit.test("getNoFormatting", (assert) => {
				aControlMapKeys.forEach(function(sControlMapKey) {
					const oValue = oControlMap[sControlMapKey];
					assert.equal(Content.getNoFormatting(oValue.key || sControlMapKey), oValue.noFormatting, sControlMapKey);
				});
			});

			QUnit.module("Content creation", {
				beforeEach: () => {
					fnInitContentFactory(sType, oFormatOptions, FieldInfo, sBaseType);
				},
				afterEach: () => {
					fnCleanUpContentFactory();
				}
			});

			const fnCreateControls = (oContentFactory, sContentMode, sIdPostFix) => {
				return Content.create(oContentFactory, oControlMap[sContentMode].key || sContentMode, oControlMap[sContentMode].operator, oControlMap[sContentMode].modules, sContentMode + sIdPostFix);
			};

			const fnSpyOnCreateFunction = (sContentMode) => {
				return oControlMap[sContentMode].createFunction ? sinon.spy(Content, oControlMap[sContentMode].createFunction) : null;
			};

			const fnSpyCalledOnce = (fnSpyFunction, sContentMode, assert) => {
				if (fnSpyFunction) {
					assert.ok(fnSpyFunction.calledOnce, oControlMap[sContentMode].createFunction + " called once.");
				}
			};

			aControlMapKeys.forEach((sControlMapKey) => {
				const oValue = oControlMap[sControlMapKey];
				if (oValue.createFunction) {
					QUnit.test(sControlMapKey, async (assert) => {
						const fnCreateFunction = fnSpyOnCreateFunction(sControlMapKey);
						let aControls;

						if (oValue.editMode) {
							this.sEditMode = oValue.editMode;
						}
						if (oValue.formatOptions) {
							sinon.stub(this.oContentFactory.getField(), "getDataTypeFormatOptions").returns(oValue.formatOptions);
						}
						try {
							aControls = fnCreateControls(this.oContentFactory, sControlMapKey, "-create");
							assert.notOk(oValue.throwsError, "No error expected");
							assert.equal(aControls.length, oValue.instances.length, "number of created controls");
						} catch (oError) {
							assert.ok(oValue.throwsError, "error expected");
							assert.equal(oError.message, "sap.ui.mdc.field.content." + sContentName + " - " + oValue.createFunction + " not defined!", "Error message");
						}
						fnSpyCalledOnce(fnCreateFunction, sControlMapKey, assert);

						if (aControls?.length > 0) {
							aControls.forEach((oCreatedControl, iIndex) => {
								assert.ok(oCreatedControl instanceof oValue.instances[iIndex], "Correct control created in " + oValue.createFunction);

								sinon.stub(aControls[iIndex], "getParent").returns(this.oContentFactory.getField()); // fake Field is parent
								aControls[iIndex].setModel(oModel, "$field"); // to create bindings

								for (const sName in oValue.bindings[iIndex]) {
									let oBindingInfo = oCreatedControl.getBindingInfo(sName);
									const sPath = oBindingInfo?.parts ? oBindingInfo.parts[0].path : oBindingInfo?.path;
									const sModel = oBindingInfo?.parts ? oBindingInfo.parts[0].model : oBindingInfo?.model;
									assert.equal(sModel + ">" + sPath, oValue.bindings[iIndex][sName].path, "Binding path for " + sName);
									if (oValue.bindings[iIndex][sName].hasOwnProperty("length")) {
										assert.equal(oBindingInfo && oBindingInfo.length, oValue.bindings[iIndex][sName].length, "Binding length for " + sName);
									}
									if (oValue.bindings[iIndex][sName].hasOwnProperty("startIndex")) {
										assert.equal(oBindingInfo && oBindingInfo.startIndex, oValue.bindings[iIndex][sName].startIndex, "Binding startIndex for " + sName);
									}
									if (oValue.bindings[iIndex][sName].type) {
										assert.equal(oBindingInfo.type?.getMetadata().getName(), oValue.bindings[iIndex][sName].type.getMetadata().getName(), "Type of binding");
									}
									if (sName === oValue.boundAggregations?.[iIndex]) {
										for (const sName in oValue.aggregationBindings?.[iIndex]) {
											assert.ok(oBindingInfo.template instanceof oValue.aggregationInstances[iIndex], "Correct template control created in " + oValue.createFunction);
											oBindingInfo = oBindingInfo.template.getBindingInfo(sName);
											assert.equal(oBindingInfo.type.getMetadata().getName(), oValue.aggregationBindings?.[iIndex][sName].type.getMetadata().getName(), "Type of binding");
										}
									}
								}
								for (const sProperty in oValue.properties[iIndex]) {
									assert.equal(oCreatedControl.getProperty(sProperty), oValue.properties[iIndex][sProperty], "Value for " + sProperty);
								}
								// check events
								fnInitEventCount();
								for (const sEvent in oValue.events[iIndex]) {
									aControls[iIndex].fireEvent(sEvent, oValue.events[iIndex][sEvent]);
									assert.equal(this.oEventCount[sEvent], 1, sEvent + " event handler called");
								}
							});

							if (oValue.detailTests) {
								await oValue.detailTests.call(this, assert, aControls, oValue);
							}

							if (oValue.formatOptions) {
								this.oContentFactory.getField().getDataTypeFormatOptions.restore();
							}
							aControls.forEach((oCreatedControl, iIndex) => {
								oCreatedControl.destroy();
							});
						}
						fnCreateFunction.restore();
					});
				}
			});
		}
	};

});