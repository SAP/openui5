/*!
 * ${copyright}
 */

// Provides class sap.ui.model.ValidateException
sap.ui.define(['sap/ui/model/ValidateException'],
	function (ValidateException) {
	"use strict";

	/**
	 * Creates a new ValidateException for conditions.
	 *
	 * @param {string} message
	 *   A message explaining why the validation failed; this message is language dependent as it
	 *   may be displayed on the UI
	 * @param {string[]} [violatedConstraints]
	 *   Names of the constraints that are violated; the names should be the same as documented in
	 *   the type's constructor
	 * @param {sap.ui.mdc.condition.ConditionObject} oCondition Condition with validation error
	 * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions Array of conditions including a condition with validation error
	 *
	 * @alias sap.ui.mdc.condition.ConditionValidateException
	 * @class
	 * @classdesc
	 *   Instances of this exception are thrown when constraints of a type are violated.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.ConditionType, sap.ui.mdc.field.ConditionsType
	 * @see sap.ui.model.SimpleType#validateValue
	 * @since 1.109.0
	 */
	const ConditionValidateException = function (message, violatedConstraints, oCondition, aConditions) {
		ValidateException.call(this, message, violatedConstraints);
		// this.name = "ValidateException";
		// this.message = message;
		// this.violatedConstraints = violatedConstraints;
		this.condition = oCondition;
		this.conditions = aConditions;
	};

	ConditionValidateException.prototype = Object.create(ValidateException.prototype);

	ConditionValidateException.prototype.getCondition = function() {
		return this.condition;
	};

	ConditionValidateException.prototype.setCondition = function(oCondition) {
		this.condition = oCondition;
	};

	ConditionValidateException.prototype.getConditions = function() {
		return this.conditions;
	};

	ConditionValidateException.prototype.setConditions = function(aConditions) {
		this.conditions = aConditions;
	};

	return ConditionValidateException;
}, /* bExport= */ true);