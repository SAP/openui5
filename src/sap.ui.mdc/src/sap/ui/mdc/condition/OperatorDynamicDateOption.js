/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/DynamicDateOption',
	'sap/m/DynamicDateValueHelpUIType',
	'sap/m/Input',
	"sap/ui/mdc/enums/BaseType",
	'sap/ui/mdc/enums/FieldDisplay',
	'sap/ui/mdc/enums/OperatorValueType',
	'sap/ui/mdc/util/DateUtil',
	'sap/ui/mdc/util/loadModules',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/ValidateException',
	'sap/ui/core/library'
], (
	DynamicDateOption,
	DynamicDateValueHelpUIType,
	Input,
	BaseType,
	FieldDisplay,
	OperatorValueType,
	DateUtil,
	loadModules,
	JSONModel,
	FormatException,
	ParseException,
	ValidateException,
	coreLibrary
) => {
	"use strict";

	const { ValueState } = coreLibrary;
	let DatePicker;
	let DateTimePicker;

	/**
	 * Constructor for a new OperatorDynamicDateOption.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @param {string} [mSettings.key] One of the predefined keys identifying the standard dynamic date
	 *
	 * @class
	 * Maps an {@link sap.ui.mdc.condition.Operator Operator} to a {@link sap.m.DynamicDateOption DynamicDateOption}.
	 * @extends sap.m.DynamicDateOption
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.96
	 * @alias sap.ui.mdc.condition.OperatorDynamicDateOption
	 */
	const OperatorDynamicDateOption = DynamicDateOption.extend("sap.ui.mdc.condition.OperatorDynamicDateOption", /** @lends sap.ui.mdc.condition.OperatorDynamicDateOption.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Operator used in the corresponding filter field.
				 *
				 * <b>Note:</b> An operator must be an instance of {@link sap.ui.mdc.condition.Operator Operator}.
				 */
				operator: { type: "object" },
				/**
				 * Data type of the corresponding filter field.
				 *
				 * <b>Note:</b> A type must  be an instance of {@link sap.ui.model.Type Type}.
				 */
				type: { type: "object" },
				/**
				 * Basic type of the corresponding filter field.
				 */
				baseType: { type: "sap.ui.mdc.enums.BaseType" }
			}
		}
	});

	OperatorDynamicDateOption.prototype.exit = function() {
		DynamicDateOption.prototype.exit.apply(this, arguments);
		if (this._oModel) {
			this._oModel.destroy();
			this._oModel = undefined;
			this._mChangeHandler = undefined;
		}

		if (this._aUITypes) {
			for (let i = 0; i < this._aUITypes.length; i++) {
				this._aUITypes[i].destroy();
			}
			this._aUITypes = undefined;
		}
		// _removeControls.call(this);
	};

	OperatorDynamicDateOption.prototype.applySettings = function() {
		DynamicDateOption.prototype.applySettings.apply(this, arguments);

		// load needed pickers
		// TODO: request in DateContent to be sure that loaded? But needed only on opening, so async loading on initialization should be ok
		const aModules = [];
		const sBaseType = this.getBaseType();
		if (sBaseType === BaseType.DateTime) {
			if (!DateTimePicker) {
				aModules.push("sap/m/DateTimePicker");
			}
		} else if (!DatePicker) {
			aModules.push("sap/m/DatePicker");
		}

		if (aModules.length > 0) {
			return loadModules(aModules).then((aModules) => {
				if (sBaseType === BaseType.DateTime) {
					DateTimePicker = aModules[0];
				} else {
					DatePicker = aModules[0];
				}
			});
		}

	};

	OperatorDynamicDateOption.prototype.validateProperty = function(sPropertyName, oValue) {

		if (sPropertyName === "operator" && oValue && (typeof oValue !== "object" || !oValue.isA || !oValue.isA("sap.ui.mdc.condition.Operator"))) {
			throw new Error("\"" + oValue + "\" is of type " + typeof oValue + ", expected " +
				"sap.ui.mdc.condition.Operator for property \"" + sPropertyName + "\" of " + this);
		} else if (sPropertyName === "type" && oValue && (typeof oValue !== "object" || !oValue.isA || !oValue.isA("sap.ui.model.Type"))) {
			throw new Error("\"" + oValue + "\" is of type " + typeof oValue + ", expected " +
				"sap.ui.model.Type for property \"" + sPropertyName + "\" of " + this);
		}

		return DynamicDateOption.prototype.validateProperty.apply(this, arguments);

	};

	OperatorDynamicDateOption.prototype.isRange = function() {

		const oOperator = this.getOperator();
		return oOperator.isA("sap.ui.mdc.condition.RangeOperator");

	};

	OperatorDynamicDateOption.prototype.getText = function(oControl) {

		const oOperator = this.getOperator();
		const sBaseType = this.getBaseType();
		return oOperator.getLongText(sBaseType);

	};

	OperatorDynamicDateOption.prototype.getValueHelpUITypes = function(oControl) {

		if (!this._aUITypes) {
			const oOperator = this.getOperator();
			let oType = this.getType();
			const sBaseType = this.getBaseType();
			this._aUITypes = [];

			for (const vType of oOperator.valueTypes) {
				if (vType === OperatorValueType.Self) {
					let sType;
					if (sBaseType === BaseType.DateTime) {
						sType = "datetime";
					} else {
						sType = "date";
					}
					this._aUITypes.push(new DynamicDateValueHelpUIType({
						type: sType
					}));
				} else if (!vType || vType === OperatorValueType.Static) {
					continue;
				} else {
					oType = oOperator._createLocalType(vType, oType);
					if (oType.isA("sap.ui.model.type.Integer") || oType.isA("sap.ui.model.odata.type.Int")) { // TODO: better check for Integer
						this._aUITypes.push(new DynamicDateValueHelpUIType({
							type: "int"
						}));
					} else {
						this._aUITypes.push(new DynamicDateValueHelpUIType({
							type: "custom"
						}));
					}
				}
			}
		}

		return this._aUITypes;

	};

	OperatorDynamicDateOption.prototype.createValueHelpUI = function(oControl, fnControlsUpdated) {
		let oValue = oControl.getValue();
		const oOperator = this.getOperator();
		let oType = this.getType();
		const sKey = this.getKey();
		const sControlId = oControl.getId();

		if (!oValue || oValue.operator !== sKey) {
			// initialize value
			oValue = { operator: sKey, values: [] };
			if (oOperator.valueDefaults) {
				oValue.values = oOperator.valueDefaults;
			}
		}

		// remove old controls as they are destroyed after usage from DynamicDateRange control
		_removeControls.call(this, oControl);
		if (!oControl.aControlsByParameters) {
			oControl.aControlsByParameters = {};
		}
		oControl.aControlsByParameters[sKey] = [];

		let fnChangeHandler = function(oEvent) {
			fnControlsUpdated(this);
		}.bind(this);

		for (let i = 0; i < oOperator.valueTypes.length; i++) {
			const vType = oOperator.valueTypes[i];
			const sBaseType = this.getBaseType();
			let oDate;

			if (!vType) {
				continue;
			}
			if (!oControl.aControlsByParameters[sKey][i]) {
				if (oOperator.createControl) {
					// use internal model to bind the control
					if (!this._oModel) {
						fnChangeHandler = function(oEvent) {
							const sPath = oEvent.getParameter("path");
							const aParts = sPath.split("/");
							const sControlId = aParts[0] || aParts[1];
							if (this._mChangeHandler && this._mChangeHandler[sControlId]) {
								this._mChangeHandler[sControlId](this);
							}
						}.bind(this);
						this._oModel = new JSONModel();
						this._oModel.attachPropertyChange({}, fnChangeHandler, this);
						this._mChangeHandler = {};
					}
					const oModelData = this._oModel.getData();
					oModelData[sControlId] = { // only change for current control
						value0: oValue && oValue.values[0],
						value1: oValue && oValue.values[1]
					};
					this._mChangeHandler[sControlId] = fnControlsUpdated;
					if (vType !== OperatorValueType.Self) {
						oType = oOperator._createLocalType(vType, oType);
					}
					const oInputControl = oOperator.createControl(oType, "internal>/" + sControlId + "/value" + i, i, sControlId + "-" + i);
					oInputControl.setModel(this._oModel, "internal");
					oControl.aControlsByParameters[sKey].push(oInputControl);
				} else if (vType === OperatorValueType.Self) {
					// TODO: DatePicker or Calendar?
					// convert internal value to date
					if (oValue && oValue.values[i]) {
						oDate = DateUtil.typeToDate(oValue.values[i], oType, sBaseType);
					}
					const oFormatOptions = oType.getFormatOptions();

					let Picker;
					if (sBaseType === BaseType.DateTime) {
						Picker = DateTimePicker;
					} else {
						Picker = DatePicker;
					}
					const oDatePicker = new Picker(sControlId + "-" + i, {
						dateValue: oDate,
						displayFormat: oFormatOptions.style || oFormatOptions.pattern,
						displayFormatType: oFormatOptions.calendarType,
						change: fnChangeHandler
					});
					oControl.aControlsByParameters[sKey].push(oDatePicker);
				} else if (typeof vType === "object") {
					// just use Input
					oType = oOperator._createLocalType(oOperator.valueTypes[i], oType);
					// format value to String using type
					const sValue = oType.formatValue(oValue && oValue.values[i], "string");
					const oInput = new Input(sControlId + "-" + i, {
						value: sValue,
						change: fnChangeHandler
					});
					oControl.aControlsByParameters[sKey].push(oInput);
				}
				// } else 					// update values
				// 	if (oOperator.createControl) {
				// 		this._oModel.setProperty("/value0", oValue && oValue.values[0]);
				// 		this._oModel.setProperty("/value1", oValue && oValue.values[1]);
				// 	} else if (vType === OperatorValueType.Self) {
				// 		if (oValue && oValue.values[i]) {
				// 			oDate = DateUtil.typeToUniversalDate(oValue.values[i], oType);
				// 			oDate = DateUtil.utcToLocal(oDate);
				// 		}
				// 		oControl.aControlsByParameters[sKey][i].setDateValue(oDate);
				// 	} else  if (typeof vType === "object"){
				// 		oControl.aControlsByParameters[sKey][i].setValue(oValue && oValue.values[i]);
			}

		}

		return oControl.aControlsByParameters[sKey];

	};

	OperatorDynamicDateOption.prototype.validateValueHelpUI = function(oControl) {

		const sKey = this.getKey();
		const oOperator = this.getOperator();
		const oType = this.getType();
		let oOutput;
		let bValid = true;
		let sValueState = ValueState.None;
		let sValueStateText;
		let i = 0;

		try {
			oOutput = this.getValueHelpOutput(oControl); // catch ParseExeptions
			for (i = 0; i < oOutput.values.length; i++) {
				const vValue = oOutput.values[i];
				if (vValue === undefined || vValue === null) { // TODO: might be operator dependent
					bValid = false;
				}
			}
			oOperator.validate(oOutput.values, oType);
		} catch (oException) {
			bValid = false;
			sValueState = ValueState.Error;
			sValueStateText = oException.message;
			if (oException && !(oException instanceof ParseException) && !(oException instanceof ValidateException)) {
				throw oException; // unknown error -> just raise it
			}
		}

		if (!oOperator.createControl) {
			// custom control is bound, so input is checked in binding
			for (i = 0; i < oControl.aControlsByParameters[sKey].length; i++) {
				const oInputControl = oControl.aControlsByParameters[sKey][i];
				if (oInputControl.setValueState) {
					oInputControl.setValueState(sValueState);
					oInputControl.setValueStateText(sValueStateText);
				}
			}
		}

		return bValid;

	};

	OperatorDynamicDateOption.prototype.getValueHelpOutput = function(oControl) {

		const sKey = this.getKey();
		const oResult = { operator: sKey, values: [] };
		const oOperator = this.getOperator();
		let oType = this.getType();
		const sBaseType = this.getBaseType();
		const sControlId = oControl.getId();

		for (let i = 0; i < oOperator.valueTypes.length; i++) {
			if (!oOperator.valueTypes[i]) {
				continue;
			}
			const oInputControl = oControl.aControlsByParameters[sKey][i];
			if (oInputControl) {
				let vValue;
				if (oOperator.createControl) {
					// use value from internal Model
					vValue = this._oModel ? this._oModel.getProperty("/" + sControlId + "/value" + i) : null;
				} else if (oOperator.valueTypes[i] === OperatorValueType.Self) {
					// DatePicker used -> get Date Value
					if (!oInputControl.isValidValue()) {
						throw new ParseException(); // to show error state
					}
					vValue = oInputControl.getDateValue(); // returns local UI5Date
					if (vValue) {
						// parse to Types format
						vValue = DateUtil.dateToType(vValue, oType, sBaseType);
					}
				} else {
					vValue = oInputControl.getValue();
					oType = oOperator._createLocalType(oOperator.valueTypes[i], oType);
					// parse String to types value
					vValue = oType.parseValue(vValue, "string");
				}
				oResult.values.push(vValue);
			}
		}

		return oResult;

	};

	OperatorDynamicDateOption.prototype.getGroupHeader = function() {
		const oOperator = this.getOperator();
		if (oOperator.group && oOperator.group.text) {
			return oOperator.group.text;
		}

		return DynamicDateOption.prototype.getGroupHeader.apply(this, arguments); // "Default group header still used!"; //TODO how to create a custom Option inside an existing group?
	};

	OperatorDynamicDateOption.prototype.getGroup = function() {
		const oOperator = this.getOperator();
		if (oOperator.group) {
			return oOperator.group.id;
		}
		return DynamicDateOption.prototype.getGroup.apply(this, arguments);
	};

	OperatorDynamicDateOption.prototype.toDates = function(oValue) {
		const oOperator = this.getOperator();
		const oType = this.getType();
		const sBaseType = this.getBaseType();
		let aRange;
		let i = 0;

		if (oOperator.isA("sap.ui.mdc.condition.RangeOperator")) {
			aRange = oOperator._getRange(oValue && oValue.values, oType, sBaseType); // aRange contains date in Type presentation
			// convert to local date
			for (i = 0; i < aRange.length; i++) {
				aRange[i] = DateUtil.typeToDate(aRange[i], oType, sBaseType);
			}
		} else if (oOperator.valueTypes.length === 0) {
			aRange = [];
		} else if (oOperator.valueTypes[0] === OperatorValueType.Self) {
			aRange = [];
			for (i = 0; i < oValue.values.length; i++) {
				aRange.push(oValue.values[i] ? DateUtil.typeToDate(oValue.values[i], oType, sBaseType) : oValue.values[i]);
			}
			if (aRange.length === 1) {
				// TODO: better solution for single dates
				aRange.push(aRange[0]);
			}
			// TODO How to convert GT or GE.....
		} else if ([OperatorValueType.Self, OperatorValueType.Static].indexOf(oOperator.valueTypes[0]) === -1) {
			throw new Error("Cannot convert to date, use RangeOperator");
		}
		return aRange; // aRange contains local UI5Dates
	};

	OperatorDynamicDateOption.prototype.format = function(oValue) {
		const oOperator = this.getOperator();
		const oType = this.getType();
		return oOperator.format(oValue, oType, FieldDisplay.Value);
	};

	OperatorDynamicDateOption.prototype.parse = function(sValue) {
		const oOperator = this.getOperator();
		const oType = this.getType();

		if (sValue && oOperator.test(sValue)) {
			const oResult = {};
			oResult.operator = this.getKey();
			oResult.values = oOperator.parse(sValue, oType, FieldDisplay.Value);
			return oResult;
		}
	};

	OperatorDynamicDateOption.prototype.enhanceFormattedValue = function(sFormattedValue, sAdditionalValue) {
		return false;
	};

	function _removeControls(oControl) {

		const sKey = this.getKey();

		if (oControl && oControl.aControlsByParameters && oControl.aControlsByParameters[sKey]) {
			for (const oUIControl of oControl.aControlsByParameters[sKey]) {
				if (!oUIControl.bIsDestroyed) {
					oUIControl.destroy();
				}
			}

			delete oControl.aControlsByParameters[sKey];
		}

	}

	return OperatorDynamicDateOption;
});