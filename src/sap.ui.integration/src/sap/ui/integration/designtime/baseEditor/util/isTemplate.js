/*!
 * ${copyright}
 */
sap.ui.define(function () {
	"use strict";

	/**
	 * Checks whether a given control is the template of an aggregation binding or a cloned element.
	 * Controls inside fragments which were not cloned from an aggregation template will be detected
	 * as templates unless they are descendants of <code>oAggregationAncestorControl</code>.
	 *
	 * @function
	 * @since 1.75
	 * @param {sap.ui.base.ManagedObject} oControl - Control to check
	 * @param {sap.ui.base.ManagedObject} oAggregationAncestorControl - Ancestor of <code>oControl</code> which is known
	 * to be outside of the aggregation that the checked <code>oControl</code> is part of, i.e. a control embedding
	 * a fragment containing <code>oControl</code>
	 * @return {boolean} <code>true</code> if the given control is a template
	 * @experimental
	 * @private
	 */

	function isTemplate (oControl, oAggregationAncestorControl) {
		var sParentAggregationName = oControl.sParentAggregationName;
		var oParent = oControl.getParent();

		if (oAggregationAncestorControl && oParent === oAggregationAncestorControl) {
			return false;
		}

		if (oParent && sParentAggregationName) {
			var oBindingInfo = oParent.getBindingInfo(sParentAggregationName);
			if (oBindingInfo && oControl instanceof oBindingInfo.template.getMetadata().getClass()) {
				return false;
			} else {
				return isTemplate(oParent, oAggregationAncestorControl);
			}
		}
		return true;
	}

	return isTemplate;
});