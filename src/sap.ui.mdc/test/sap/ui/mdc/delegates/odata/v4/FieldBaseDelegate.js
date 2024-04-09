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
	 *
	 * @namespace
	 * @author SAP SE
	 * @public
	 * @since 1.74.0
	 * @extends module:sap/ui/mdc/field/FieldBaseDelegate
	 * @alias module:delegates/odata/v4/FieldBaseDelegate
	 */
	var ODataFieldBaseDelegate = Object.assign({}, FieldBaseDelegate);

	ODataFieldBaseDelegate.getTypeMap = function (oField) {
		return ODataV4TypeMap;
	};

	return ODataFieldBaseDelegate;
});
