/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to execute model specific logic in MultiValueField
// ---------------------------------------------------------------------------------------

sap.ui.define([
	"sap/ui/mdc/field/MultiValueFieldDelegate",
	'sap/ui/mdc/odata/v4/TypeMap'

], function(
	MultiValueFieldDelegate,
		ODataV4TypeMap
) {
	"use strict";

	/**
	 * Delegate for {@link sap.ui.mdc.MultiValueField MultiValueField}.<br>
	 *
	 * @namespace
	 * @author SAP SE
	 * @public
	 * @since 1.74.0
	 * @extends module:sap/ui/mdc/field/MultiValueFieldDelegate
	 * @alias module:delegates/odata/v4/MultiValueFieldDelegate
	 */
	var ODataMultiValueFieldDelegate = Object.assign({}, MultiValueFieldDelegate);

	ODataMultiValueFieldDelegate.getTypeMap = function (oField) {
		return ODataV4TypeMap;
	};

	return ODataMultiValueFieldDelegate;
});
