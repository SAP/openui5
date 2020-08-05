/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enum/BaseType',
	'sap/ui/mdc/util/DateUtil',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/condition/Operator',
	'sap/base/util/merge'
],
	function(
		Condition,
		BaseType,
		DateUtil,
		FilterOperatorUtil,
		Operator,
		merge
	) {
		"use strict";

		var sDateTimePattern = "yyyy-MM-ddTHH:mm:ssZ"; // milliseconds missing
		var sDatePattern = "yyyy-MM-dd";
		var sTimePattern = "HH:mm:ss";

		/**
		 * Utilities for condition conversion
		 *
		 * @author SAP SE
		 * @private
		 * @since 1.74.0
		 * @alias sap.ui.mdc.condition.ConditionConverter
		 */
		var ConditionConverter = {

			/**
			 * converts a condition into a unified String
			 *
			 * The condition is not checked for validity. The used values must fit to the used basic type.
			 *
			 * @param {object} oCondition Condition
			 * @param {sap.ui.mdc.TypeConfig} oTypeConfig given dataType mapping configuration
			 * @param {sap.ui.mdc.util.TypeUtil} oTypeUtil delegate dependent type util
			 * @returns {object} stringified condition
			 * @public
			 * @since 1.74.0
			 */
			toString: function(oCondition, oTypeConfig, oTypeUtil) {

				// convert using "normalized" data type
				var aValues = _valuesToString(oCondition.values, _getLocalTypeConfig(oCondition, oTypeUtil) || oTypeConfig);

				// ignore the second value for EQ operator with description
				if (oCondition.operator === "EQ") {
					aValues = [aValues[0]];
				}

				// inParameter, OutParameter
				// TODO: we need the types of the in/out parameter
				var oInParameters;
				var oOutParameters;

				if (oCondition.inParameters) {
					oInParameters = merge({}, oCondition.inParameters);
				}
				if (oCondition.outParameters) {
					oOutParameters = merge({}, oCondition.outParameters);
				}

				var oResult = Condition.createCondition(oCondition.operator, aValues, oInParameters, oOutParameters, oCondition.validated);
				return oResult;

			},

			/**
			 * converts a stringified condition into a type based condition
			 *
			 * The condition is not checked for validity. The used values must fit to the used basic type.
			 *
			 * @param {object} oCondition stringified condition
			 * @param {sap.ui.mdc.TypeConfig} oTypeConfig Data type of the condition
			 * @param {sap.ui.mdc.util.TypeUtil} oTypeUtil delegate dependent type util
			 * @returns {object} condition
			 * @public
			 * @since 1.74.0
			 */
			toType: function(oCondition, oTypeConfig, oTypeUtil) {
				// convert using "normalized" data type
				var aValues = _stringToValues(oCondition.values, _getLocalTypeConfig(oCondition, oTypeUtil) || oTypeConfig);

				// inParameter, OutParameter
				// TODO: we need the types of the in/out parameter
				var oInParameters;
				var oOutParameters;

				if (oCondition.inParameters) {
					oInParameters = merge({}, oCondition.inParameters);
				}
				if (oCondition.outParameters) {
					oOutParameters = merge({}, oCondition.outParameters);
				}

				var oResult = Condition.createCondition(oCondition.operator, aValues, oInParameters, oOutParameters, oCondition.validated);
				return oResult;

			}
		};

		function _getLocalTypeConfig (oCondition, oTypeUtil) {
			var oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			if (oOperator && oOperator.valueTypes[0] && (oOperator.valueTypes[0] !== Operator.ValueType.Self && oOperator.valueTypes[0] !== Operator.ValueType.Static)) {
				// we have to create the type instance for the values
				return oTypeUtil.getTypeConfig(oOperator._createLocalType(oOperator.valueTypes[0])); // TODO type for all values must be the same})
			}
		}

		function _valuesToString (aValues, oTypeConfig) {

			var aResult = [];

			for (var i = 0; i < aValues.length; i++) {
				var vValue = aValues[i];
				aResult.push(_valueToString(vValue, oTypeConfig));
			}

			return aResult;

		}

		function _valueToString (vValue, oTypeConfig) {

			// read base type
			var sBaseType = oTypeConfig.baseType;
			var oTypeInstance = oTypeConfig.typeInstance;

			switch (sBaseType) {
				case BaseType.DateTime:
					return DateUtil.typeToString(vValue, oTypeInstance, sDateTimePattern);

				case BaseType.Date:
					return DateUtil.typeToString(vValue, oTypeInstance, sDatePattern);

				case BaseType.Time:
					return DateUtil.typeToString(vValue, oTypeInstance, sTimePattern);

				case BaseType.Boolean:
					return vValue;

				case BaseType.Numeric:
					if (oTypeInstance.getMetadata().getName() === "sap.ui.model.odata.type.Int64" || oTypeInstance.getMetadata().getName() === "sap.ui.model.odata.type.Decimal") {
						return vValue.toString();
					}
					return vValue;

				default:
					// just use type to convert
					return oTypeInstance.formatValue(vValue, "string");
			}

		}

		function _stringToValues (aValues, oTypeConfig) {

			var aResult = [];

			for (var i = 0; i < aValues.length; i++) {
				var sValue = aValues[i];
				aResult.push(_stringToValue(sValue, oTypeConfig));
			}

			return aResult;

		}

		function _stringToValue (sValue, oTypeConfig) {

			// read base type
			var sBaseType = oTypeConfig.baseType;
			var oTypeInstance = oTypeConfig.typeInstance;


			switch (sBaseType) {
				case BaseType.DateTime:
					return DateUtil.stringToType(sValue, oTypeInstance, sDateTimePattern);

				case BaseType.Date:
					return DateUtil.stringToType(sValue, oTypeInstance, sDatePattern);

				case BaseType.Time:
					return DateUtil.stringToType(sValue, oTypeInstance, sTimePattern);

				case BaseType.Boolean:
					return sValue;

				case BaseType.Numeric:
					if (oTypeInstance.getMetadata().getName() === "sap.ui.model.odata.type.Int64" || oTypeInstance.getMetadata().getName() === "sap.ui.model.odata.type.Decimal") {
						return oTypeInstance.parseValue(sValue, "string");
					}
					return sValue;

				default:
					// just use type to convert
					return oTypeConfig.typeInstance.parseValue(sValue, "string");
			}

		}

		return ConditionConverter;
	}, /* bExport= */ true);
