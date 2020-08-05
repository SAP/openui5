

/*!
 * ${copyright}
 */

// sap.ui.mdc.BaseDelegate
sap.ui.define(['sap/ui/mdc/odata/BaseDelegate', 'sap/ui/mdc/odata/v4/TypeUtil'], function (BaseDelegate, ODataV4TypeUtil) {
	"use strict";

	var ODataV4BaseDelegate = Object.assign({}, BaseDelegate);

	/**
	 * Returns the typeutil attached to this delegate.
	 *
	 * <b>Note:</b> Can be overwritten by sub-modules.
	 *
	 * @param {object} oPayload Delegate payload object
	 * @return {sap.ui.mdc.util.TypeUtil} Any instance of TypeUtil
	 *
	 */
	ODataV4BaseDelegate.getTypeUtil = function (oPayload) {
		return ODataV4TypeUtil;
	};

	return ODataV4BaseDelegate;
}, /* bExport= */ true);
