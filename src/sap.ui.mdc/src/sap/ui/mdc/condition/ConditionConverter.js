/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/condition/Operator',
	'sap/base/util/merge'
],
	function(
		Condition,
		ConditionValidated,
		FilterOperatorUtil,
		Operator,
		merge
	) {
		"use strict";

		/**
		 * Utilities for condition conversion
		 *
		 * @namespace
		 * @author SAP SE
		 * @version ${version}
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 * @experimental As of version 1.74
		 * @since 1.74.0
		 * @alias sap.ui.mdc.condition.ConditionConverter
		 */
		var ConditionConverter = {

			/**
			 * Converts a condition into a unified String
			 *
			 * The condition is not checked for validity. The used values must fit to the used basic type.
			 *
			 * <b>Note:</b> Number types are not converted, the number conversion is done by the Flex handling.
			 *
			 * @param {sap.ui.mdc.condition.ConditionObject} oCondition Condition
			 * @param {sap.ui.model.SimpleType|sap.ui.mdc.TypeConfig} vType given dataType mapping configuration
			 * @param {sap.ui.mdc.util.TypeUtil} oTypeUtil delegate dependent <code>TypeUtil</code> implementation
			 * @returns {sap.ui.mdc.condition.ConditionObject} stringified condition
			 * @private
			 * @ui5-restricted sap.ui.mdc
			 * @since 1.74.0
			 */
			toString: function(oCondition, vType, oTypeUtil) {

				// convert using "normalized" data type
				var oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
				var oTypeInstance = vType.typeInstance ? vType.typeInstance : vType;
				var aValues = _externalizeValues(oCondition.values, _getLocalType(oTypeInstance, oOperator), oOperator, oTypeUtil);

				// inParameter, OutParameter
				// TODO: we need the types of the in/out parameter
				var oInParameters;
				var oOutParameters;
				var oPayload;

				if (oCondition.inParameters) {
					oInParameters = merge({}, oCondition.inParameters);
				}
				if (oCondition.outParameters) {
					oOutParameters = merge({}, oCondition.outParameters);
				}

				if (oCondition.payload) {
					oPayload = merge({}, oCondition.payload);
				}

				var oResult = Condition.createCondition(oCondition.operator, aValues, oInParameters, oOutParameters, oCondition.validated, oPayload);
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
			 * @param {sap.ui.mdc.util.TypeUtil} oTypeUtil delegate dependent <code>TypeUtil</code> implementation
			 * @returns {sap.ui.mdc.condition.ConditionObject} condition
			 * @private
			 * @ui5-restricted sap.ui.mdc
			 * @since 1.74.0
			 */
			toType: function(oCondition, vType, oTypeUtil) {
				// convert using "normalized" data type
				var oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
				var oTypeInstance = vType.typeInstance ? vType.typeInstance : vType;
				var aValues = _internalizeValues(oCondition.values, _getLocalType(oTypeInstance, oOperator), oTypeUtil);

				// inParameter, OutParameter
				// TODO: we need the types of the in/out parameter
				var oInParameters;
				var oOutParameters;
				var oPayload;

				if (oCondition.inParameters) {
					oInParameters = merge({}, oCondition.inParameters);
				}
				if (oCondition.outParameters) {
					oOutParameters = merge({}, oCondition.outParameters);
				}

				if (oCondition.payload) {
					oPayload = merge({}, oCondition.payload);
				}

				var oResult = Condition.createCondition(oCondition.operator, aValues, oInParameters, oOutParameters, oCondition.validated, oPayload);

				if (oResult.validated !== ConditionValidated.Validated && oOperator.validateInput) {
					// let the operator check if the condition could be validated. (Use result to not change original condition.)
					oOperator.checkValidated(oResult);
				}

				return oResult;
			}
		};

		function _getLocalType (oTypeInstance, oOperator) {
			if (oOperator && oOperator.valueTypes[0] && (oOperator.valueTypes[0] !== Operator.ValueType.Self && oOperator.valueTypes[0] !== Operator.ValueType.Static)) {
				// we have to create the type instance for the values
				return oOperator._createLocalType(oOperator.valueTypes[0], oTypeInstance); //TODO: type for all values must be the same
			}
			return oTypeInstance;
		}

		function _externalizeValues (aValues, oTypeInstance, oOperator, oTypeUtil) {

			var aResult = [];

			for (var i = 0; i < aValues.length; i++) {
				if (!oOperator || (oOperator.valueTypes[i] && oOperator.valueTypes[i] !== Operator.ValueType.Static)) {
					// only add real values (no description in EQ case or static texts) (for unknown operators just copy to be compatible)
					var vValue = aValues[i];
					aResult.push(oTypeUtil.externalizeValue(vValue, oTypeInstance));
				}
			}

			return aResult;

		}

		function _internalizeValues (aValues, oTypeInstance, oTypeUtil) {

			var aResult = [];

			for (var i = 0; i < aValues.length; i++) {
				var sValue = aValues[i];
				aResult.push(oTypeUtil.internalizeValue(sValue, oTypeInstance));
			}

			return aResult;

		}

		return ConditionConverter;
	}, /* bExport= */ true);
