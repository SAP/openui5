/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to execute model specific logic in FieldBase
// ---------------------------------------------------------------------------------------

sap.ui.define([
	"sap/ui/mdc/field/FieldBaseDelegate",
	'sap/ui/mdc/odata/v4/TypeMap'
], function(
	FieldBaseDelegate,
	ODataV4TypeMap
) {
	"use strict";

	/**
	 * Delegate for {@link sap.ui.mdc.field.FieldBase FieldBase}.<br>
	 * <h3><b>Note:</b></h3>
	 * The class is experimental and the API/behaviour is not finalized and hence this should not be used for productive usage.
	 *
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.fe
	 * @experimental As of version 1.74
	 * @since 1.74.0
	 * @extends module:sap/ui/mdc/field/FieldBaseDelegate
	 * @alias module:sap/ui/mdc/odata/v4/FieldBaseDelegate
	 * @deprecated This module should not be used and will be removed in future versions!
	 */
	const ODataFieldBaseDelegate = Object.assign({}, FieldBaseDelegate);

	ODataFieldBaseDelegate.getTypeMap = function (oPayload) {
		return ODataV4TypeMap;
	};

	return ODataFieldBaseDelegate;
});
