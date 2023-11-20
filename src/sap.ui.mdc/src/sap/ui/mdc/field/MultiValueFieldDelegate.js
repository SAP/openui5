/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to execute model specific logic in FieldBase
// ---------------------------------------------------------------------------------------

sap.ui.define([
	'sap/ui/mdc/field/FieldBaseDelegate'
], function(
	FieldBaseDelegate
) {
	"use strict";

	/**
	 * @class Delegate class for <code>sap.ui.mdc.MultiValueField</code>.<br>
	 *
	 * @author SAP SE
	 * @public
	 * @since 1.93.0
	 * @alias sap.ui.mdc.field.MultiValueFieldDelegate
	 */
	const MultiValueFieldDelegate = Object.assign({}, FieldBaseDelegate);

	/**
	 * Implements the model-specific logic to update items after conditions have been updated.
	 *
	 * Items can be removed, updated, or added.
	 * Use the binding information of the <code>MultiValueField</code> control to update the data in the model.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions Current conditions of the <code>MultiValueField</code> control
	 * @param {sap.ui.mdc.MultiValueField} oMultiValueField Current <code>MultiValueField</code> control to determine binding information to update the values of the corresponding model
	 * @public
	 */
	MultiValueFieldDelegate.updateItems = function(oPayload, aConditions, oMultiValueField) {

	};

	return MultiValueFieldDelegate;
});
