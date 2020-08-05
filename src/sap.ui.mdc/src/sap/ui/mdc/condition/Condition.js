/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/base/Log',
		'sap/ui/mdc/enum/ConditionValidated'
	],
	function(
		Log,
		ConditionValidated
	) {
		"use strict";

		/**
		 * @namespace
		 * @name sap.ui.mdc.condition
		 * @private
		 * @experimental
		 * @ui5-restricted
		 */

		/**
		 *
		 * @class Utilities to handle operators of conditions
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @alias sap.ui.mdc.condition.Condition
		 *
		 * @private
		 * @experimental
		 * @ui5-restricted
		 */
		var Condition = {

				/**
				 * Creates a condition instance for a strict equal condition.
				 *
				 * This is a "strict equal" condition with key and description. It is used for entries selected in the value help
				 * and for everything entered in the <code>Field</code> control.
				 *
				 * @param {string} sKey Operator for the condition
				 * @param {string} sDescription Description of the operator
				 * @param {object} oInParameters In parameters of the condition
				 * @param {object} oOutParameters Out parameters of the condition
				 * @returns {object} The new condition object with the given operator EQ along with sKey and sDescription as aValues
				 * @public
				 *
				 */
				createItemCondition: function(sKey, sDescription, oInParameters, oOutParameters) {
					var sValidated = ConditionValidated.NotValidated;
					var aValues = [sKey, sDescription];
					if (sDescription === null || sDescription === undefined) {
						aValues.pop();
					} else {
						sValidated = ConditionValidated.Validated; // if there is a description set it is validated (even if empty string)
					}
					return this.createCondition("EQ", aValues, oInParameters, oOutParameters, sValidated);
				},

				/**
				 * Creates a condition instance for the <code>ConditionModel</code>.
				 *
				 * @param {string} sOperator Operator for the condition
				 * @param {any[]} aValues Array of values for the condition
				 * @param {object} oInParameters In parameters of the condition
				 * @param {object} oOutParameters Out parameters of the condition
				 * @param {sap.ui.mdc.enum.ConditionValidated} sValidated If set to <code>ConditionValidated.Validated</code>, the condition is validated (by field help) and not shown in <code>DefineConditionPanel</code> control
				 * @returns {object} The new condition object with the given operator and values
				 *
				 */
				createCondition: function(sOperator, aValues, oInParameters, oOutParameters, sValidated) {
					var oCondition = { operator: sOperator, values: aValues, isEmpty: null, validated: sValidated }; // use null as undefined is not recognized by filter
					if (oInParameters) {
						oCondition.inParameters = oInParameters;
					}
					if (oOutParameters) {
						oCondition.outParameters = oOutParameters;
					}
					return oCondition;
				},

				_removeEmptyConditions: function(aConditions) {
					for (var i = aConditions.length - 1; i > -1; i--) {
						if (aConditions[i].isEmpty) {
							aConditions.splice(parseInt(i), 1);
						}
					}
					return aConditions;
				}

		};

		return Condition;
	}, /* bExport= */ true);
