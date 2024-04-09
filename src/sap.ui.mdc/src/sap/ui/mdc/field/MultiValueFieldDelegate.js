/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/field/FieldBaseDelegate'
], (
	FieldBaseDelegate
) => {
	"use strict";

	/**
	 * Delegate for {@link sap.ui.mdc.MultiValueField MultiValueField}.
	 *
	 * @namespace
	 * @author SAP SE
	 * @public
	 * @since 1.93.0
	 * @extends module:sap/ui/mdc/field/FieldBaseDelegate
	 * @alias module:sap/ui/mdc/field/MultiValueFieldDelegate
	 */
	const MultiValueFieldDelegate = Object.assign({}, FieldBaseDelegate);

	/**
	 * Implements the model-specific logic to update items after conditions have been updated.
	 *
	 * Items can be removed, updated, or added.
	 * Use the binding information of the <code>MultiValueField</code> control to update the data in the related model.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions Current conditions of the <code>MultiValueField</code> control
	 * @param {sap.ui.mdc.MultiValueField} oMultiValueField Current <code>MultiValueField</code> control to determine binding information to update the values of the related model
	 * @public
	 * @experimental
	 */
	MultiValueFieldDelegate.updateItems = function(oPayload, aConditions, oMultiValueField) {

	};

	return MultiValueFieldDelegate;
});