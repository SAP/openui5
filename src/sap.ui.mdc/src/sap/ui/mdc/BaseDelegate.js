

/*!
 * ${copyright}
 */

// sap.ui.mdc.BaseDelegate
sap.ui.define(['sap/ui/mdc/util/TypeUtil'], function (TypeUtil) {
	"use strict";

	var BaseDelegate = {
		 /**
		 * Returns the typeutil attached to this delegate.
		 *
		 * <b>Note:</b> Can be overwritten by sub-modules.
		 *
		 * @param {object} oPayload Delegate payload object
		 * @return {sap.ui.mdc.util.TypeUtil} Any instance of TypeUtil
		 * @since 1.79.0
		 *
		 */
		getTypeUtil: function (oPayload) {
			return TypeUtil;
		}
	};

	return BaseDelegate;
});
