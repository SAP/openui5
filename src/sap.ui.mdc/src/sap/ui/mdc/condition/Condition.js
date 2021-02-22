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
		 * @since 1.61.0
		 * @private
		 * @experimental As of version 1.61
		 * @ui5-restricted sap.ui.fe
		 */

		/**
		 *
		 * Utilities to create conditions to be used in {@link sap.ui.mdc.FilterField FilterField},
		 * {@link sap.ui.mdc.FilterBar FilterBar} or {@link sap.ui.mdc.condition.ConditionModel ConditionModel}
		 *
		 * @namespace
		 * @author SAP SE
		 * @version ${version}
		 * @since 1.61.0
		 * @alias sap.ui.mdc.condition.Condition
		 *
		 * @private
		 * @experimental As of version 1.61
		 * @ui5-restricted sap.ui.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		var Condition = {

				/**
				 * Condition object type defining the structure of a condition.
				 *
				 * @type {sap.ui.mdc.condition.ConditionObject}
				 * @static
				 * @constant
				 * @typedef {object} sap.ui.mdc.condition.ConditionObject
				 * @property {string} operator Operator of the condition
				 * @property {any[]} values Array of values of the condition. Depending on the <code>operator</code>, this contains one or more entries
				 * @property {object} [inParameters] In parameters of the condition. For each field path, a value is stored
				 * @property {object} [outParameters] Out parameters of the condition. For each field path, a value is stored
				 * @property {boolean} [isEmpty] If set, the condition is empty (used as dummy condition in {@link sap.ui.mdc.field.DefineConditionPanel DefineConditionPanel})
				 * @property {sap.ui.mdc.util.ConditionValidated} validated If set to <code>ConditionValidated.Validated</code>, the condition is validated (by the field help) and not shown in the {@link sap.ui.mdc.field.DefineConditionPanel DefineConditionPanel} control
				 * @private
				 * @ui5-restricted sap.fe
				 * @MDC_PUBLIC_CANDIDATE
				 */

				/**
				 * Creates a condition instance for a condition representing a item chosen from the field help.
				 *
				 * This is a "equal to" (EQ) condition with key and description. It is used for entries selected in the field help
				 * and for everything entered in the {@link sap.ui.mdc.Field Field} control.
				 *
				 * @param {string} sKey Operator for the condition
				 * @param {string} sDescription Description of the operator
				 * @param {object} oInParameters In parameters of the condition
				 * @param {object} oOutParameters Out parameters of the condition
				 * @returns {sap.ui.mdc.condition.ConditionObject} The new condition object with the EQ operator along with <code>sKey</code> and <code>sDescription</code> as <code>aValues</code>
				 * @private
				 * @ui5-restricted sap.fe
				 * @MDC_PUBLIC_CANDIDATE
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
				 * Creates a condition object.
				 *
				 * @param {string} sOperator Operator for the condition
				 * @param {any[]} aValues Array of values for the condition
				 * @param {object} oInParameters In parameters of the condition
				 * @param {object} oOutParameters Out parameters of the condition
				 * @param {sap.ui.mdc.enum.ConditionValidated} sValidated If set to <code>ConditionValidated.Validated</code>, the condition is validated (by the field help) and not shown in the <code>DefineConditionPanel</code> control
				 * @returns {sap.ui.mdc.condition.ConditionObject} The new condition object with the given operator and values
				 * @private
				 * @ui5-restricted sap.fe
				 * @MDC_PUBLIC_CANDIDATE
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
				},

				_removeInitialFlags: function(aConditions) {
					for (var i = aConditions.length - 1; i > -1; i--) {
						if (aConditions[i].isInitial) {
							delete aConditions[i].isInital;
						}
					}
					return aConditions;
				}

		};

		return Condition;
	}, /* bExport= */ true);
