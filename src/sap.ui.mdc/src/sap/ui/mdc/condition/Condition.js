/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/mdc/enums/ConditionValidated', 'sap/ui/mdc/enums/OperatorName'
	], (
	ConditionValidated,
	OperatorName
) => {
	"use strict";

	const fnSerializeCondition = function(oCondition) {
		return JSON.stringify(Object.assign({}, oCondition, { isEmpty: undefined }), (sKey, vValue) => {
			return vValue === undefined ? '[undefined]' : vValue;
		});
	};

	/**
	 * Modules to handle conditions used in {@link sap.ui.mdc.FilterField FilterField} or
	 * {@link sap.ui.mdc.FilterBar FilterBar}.
	 * @namespace
	 * @name sap.ui.mdc.condition
	 * @since 1.61.0
	 * @public
	 */

	/**
	 * Utilities to create conditions to be used in {@link sap.ui.mdc.FilterField FilterField} or
	 * {@link sap.ui.mdc.FilterBar FilterBar}.
	 *
	 * @namespace
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.61.0
	 * @alias sap.ui.mdc.condition.Condition
	 *
	 * @public
	 */
	const Condition = {

		/**
		 * Condition object type defining the structure of a condition.
		 *
		 * @static
		 * @constant
		 * @typedef {object} sap.ui.mdc.condition.ConditionObject
		 * @property {string} operator Operator of the condition. The standard operators can are mentioned in {@link sap.ui.mdc.enums.OperatorName OperatorName}.
		 * @property {any[]} values Array of values of the condition. Depending on the <code>operator</code>, this contains one or more entries. The entries are stored in an internal format regarding the used data type.
		 * @property {object} [inParameters] In parameters of the condition. For each field path, a value is stored. (It is obsolete and only filled for conditions stored on old user-variants.)
		 * @property {object} [outParameters] Out parameters of the condition. For each field path, a value is stored. (It is obsolete and only filled for conditions stored on old user-variants.)
		 * @property {boolean} [isEmpty] If set, the condition is empty (used as initially empty condition in {@link sap.ui.mdc.valuehelp.content.Conditions Conditions})
		 * @property {sap.ui.mdc.enums.ConditionValidated} validated If set to <code>ConditionValidated.Validated</code>, the condition is validated (by the value help) and not shown in the {@link sap.ui.mdc.valuehelp.content.Conditions Conditions} content
		 * @property {object} [payload] Payload of the condition. Set by application. Data needs to be stringified. (as stored and loaded in variants)
		 * @public
		 */

		/**
		 * Creates a condition instance for a condition representing a item chosen from the value help.
		 *
		 * This is a "equal to" (EQ) condition with key and description. It is used for entries selected in the field help
		 * and for everything entered in the {@link sap.ui.mdc.Field Field} control.
		 *
		 * @param {any} vKey Key value for the condition
		 * @param {string} sDescription Description of the operator
		 * @param {object} [oInParameters] In parameters of the condition. (Do not use it for new conditions, use payload instead.)
		 * @param {object} [oOutParameters] Out parameters of the condition. (Do not use it for new conditions, use payload instead.)
		 * @param {object} [oPayload] Payload of the condition
		 * @returns {sap.ui.mdc.condition.ConditionObject} The new condition object with the EQ operator along with <code>sKey</code> and <code>sDescription</code> as <code>aValues</code>
		 * @public
		 *
		 */
		createItemCondition: function(vKey, sDescription, oInParameters, oOutParameters, oPayload) {
			let sValidated = ConditionValidated.NotValidated;
			const aValues = [vKey, sDescription];
			if (sDescription === null || sDescription === undefined) {
				aValues.pop();
			} else {
				sValidated = ConditionValidated.Validated; // if there is a description set it is validated (even if empty string)
			}
			return this.createCondition(OperatorName.EQ, aValues, oInParameters, oOutParameters, sValidated, oPayload);
		},

		/**
		 * Creates a condition object.
		 *
		 * @param {string} sOperator Operator for the condition. The standard operators can are mentioned in {@link sap.ui.mdc.enums.OperatorName OperatorName}.
		 * @param {any[]} aValues Array of values for the condition
		 * @param {object} [oInParameters] In parameters of the condition. (Do not use it for new conditions, use payload instead.)
		 * @param {object} [oOutParameters] Out parameters of the condition. (Do not use it for new conditions, use payload instead.)
		 * @param {sap.ui.mdc.enums.ConditionValidated} sValidated If set to <code>ConditionValidated.Validated</code>, the condition is validated (by the value help) and not shown in the {@link sap.ui.mdc.valuehelp.content.Conditions Conditions} content
		 * @param {object} [oPayload] Payload of the condition
		 * @returns {sap.ui.mdc.condition.ConditionObject} The new condition object with the given operator and values
		 * @public
		 *
		 */
		createCondition: function(sOperator, aValues, oInParameters, oOutParameters, sValidated, oPayload) {
			const oCondition = { operator: sOperator, values: aValues, isEmpty: null, validated: sValidated }; // use null as undefined is not recognized by filter
			if (oInParameters) {
				oCondition.inParameters = oInParameters;
			}
			if (oOutParameters) {
				oCondition.outParameters = oOutParameters;
			}
			if (oPayload) {
				oCondition.payload = oPayload;
			}
			return oCondition;
		},

		/**
		 * Compares two conditions in detail
		 *
		 * Opposed to <code>FilterOperatorUtil.compareConditions</code> this comparison checks the whole condition object for equality except the {@link sap.ui.mdc.valuehelp.content.Conditions Conditions} specific <code>isEmpty</code> flag.
		 *
		 * @param {undefined|sap.ui.mdc.condition.ConditionObject} oCondition1 Condition to check
		 * @param {undefined|sap.ui.mdc.condition.ConditionObject} oCondition2 Condition to check
		 * @returns {boolean} <code>true</code> if conditions are equal
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		compareConditions: function(oCondition1, oCondition2) {
			const sCheckValue1 = fnSerializeCondition(oCondition1);
			const sCheckValue2 = fnSerializeCondition(oCondition2);
			return sCheckValue1 === sCheckValue2;

		},

		_removeEmptyConditions: function(aConditions) {
			for (let i = aConditions.length - 1; i > -1; i--) {
				if (aConditions[i].isEmpty) {
					aConditions.splice(parseInt(i), 1);
				}
			}
			return aConditions;
		},

		_removeInitialFlags: function(aConditions) {
			for (let i = aConditions.length - 1; i > -1; i--) {
				if (aConditions[i].isInitial) {
					delete aConditions[i].isInitial;
				}
			}
			return aConditions;
		}

	};

	return Condition;
});