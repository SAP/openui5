/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/mdc/condition/Condition',
		'sap/ui/mdc/enums/ConditionValidated',
		'sap/ui/mdc/enums/OperatorValueType',
		'sap/ui/mdc/condition/FilterOperatorUtil',
		'sap/base/util/merge'
	], (
	Condition,
	ConditionValidated,
	OperatorValueType,
	FilterOperatorUtil,
	merge
) => {
	"use strict";

	/**
	 * Utilities for condition conversion
	 *
	 * @namespace
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.74.0
	 * @alias sap.ui.mdc.condition.ConditionConverter
	 */
	const ConditionConverter = {

		/**
		 * Converts a condition into a unified String
		 *
		 * The condition is not checked for validity. The used values must fit to the used basic type.
		 *
		 * <b>Note:</b> Number types are not converted, the number conversion is done by the Flex handling.
		 *
		 * @param {sap.ui.mdc.condition.ConditionObject} oCondition Condition
		 * @param {sap.ui.model.SimpleType|sap.ui.mdc.TypeConfig} vType given dataType mapping configuration
		 * @param {module:sap/ui/mdc/util/TypeMap} oTypeUtil delegate dependent <code>TypeMap</code> implementation
		 * @returns {sap.ui.mdc.condition.ConditionObject} stringified condition
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 * @since 1.74.0
		 */
		toString: function(oCondition, vType, oTypeUtil) {

			// convert using "normalized" data type
			const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			const oTypeInstance = vType.typeInstance ? vType.typeInstance : vType;
			const aValues = _externalizeValues(oCondition.values, _getLocalType(oTypeInstance, oOperator), oOperator, oTypeUtil);

			// inParameter, OutParameter
			// TODO: we need the types of the in/out parameter
			let oInParameters;
			let oOutParameters;
			let oPayload;

			if (oCondition.inParameters) {
				oInParameters = merge({}, oCondition.inParameters);
			}
			if (oCondition.outParameters) {
				oOutParameters = merge({}, oCondition.outParameters);
			}

			if (oCondition.payload) {
				oPayload = merge({}, oCondition.payload);
			}

			const oResult = Condition.createCondition(oCondition.operator, aValues, oInParameters, oOutParameters, oCondition.validated, oPayload);
			return oResult;

		},

		/**
		 * converts a stringified condition into a type based condition
		 *
		 * The condition is not checked for validity. The used values must fit to the used basic type.
		 *
		 * <b>Note:</b> Number types are not converted, the number conversion is done by the Flex handling.
		 *
		 * @param {sap.ui.mdc.condition.ConditionObject} oCondition stringified condition
		 * @param {sap.ui.model.SimpleType|sap.ui.mdc.TypeConfig} vType given dataType mapping configuration
		 * @param {module:sap/ui/mdc/util/TypeMap} oTypeUtil delegate dependent <code>TypeMap</code> implementation
		 * @returns {sap.ui.mdc.condition.ConditionObject} condition
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 * @since 1.74.0
		 */
		toType: function(oCondition, vType, oTypeUtil) {
			// convert using "normalized" data type
			const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			const oTypeInstance = vType.typeInstance ? vType.typeInstance : vType;
			const aValues = _internalizeValues(oCondition.values, _getLocalType(oTypeInstance, oOperator), oTypeUtil);

			// inParameter, OutParameter
			// TODO: we need the types of the in/out parameter
			let oInParameters;
			let oOutParameters;
			let oPayload;

			if (oCondition.inParameters) {
				oInParameters = merge({}, oCondition.inParameters);
			}
			if (oCondition.outParameters) {
				oOutParameters = merge({}, oCondition.outParameters);
			}

			if (oCondition.payload) {
				oPayload = merge({}, oCondition.payload);
			}

			const oResult = Condition.createCondition(oCondition.operator, aValues, oInParameters, oOutParameters, oCondition.validated, oPayload);

			if (oResult.validated !== ConditionValidated.Validated && oOperator.validateInput) {
				// let the operator check if the condition could be validated. (Use result to not change original condition.)
				oOperator.checkValidated(oResult);
			}

			return oResult;
		}
	};

	function _getLocalType(oTypeInstance, oOperator) {
		if (oOperator && oOperator.valueTypes[0] && (oOperator.valueTypes[0] !== OperatorValueType.Self && oOperator.valueTypes[0] !== OperatorValueType.Static)) {
			// we have to create the type instance for the values
			return oOperator._createLocalType(oOperator.valueTypes[0], oTypeInstance); //TODO: type for all values must be the same
		}
		return oTypeInstance;
	}

	function _externalizeValues(aValues, oTypeInstance, oOperator, oTypeUtil) {

		const aResult = [];

		for (let i = 0; i < aValues.length; i++) {
			if (!oOperator || (oOperator.valueTypes[i] && oOperator.valueTypes[i] !== OperatorValueType.Static)) {
				// only add real values (no description in EQ case or static texts) (for unknown operators just copy to be compatible)
				const vValue = aValues[i];
				aResult.push(oTypeUtil.externalizeValue(vValue, oTypeInstance));
			}
		}

		return aResult;

	}

	function _internalizeValues(aValues, oTypeInstance, oTypeUtil) {
		const aResult = [];

		for (const sValue of aValues) {
			aResult.push(oTypeUtil.internalizeValue(sValue, oTypeInstance));
		}

		return aResult;
	}

	return ConditionConverter;
});