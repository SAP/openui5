/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
	"sap/base/util/includes"
], function (
	MapEditor,
	includes
) {
	"use strict";

	/**
	* @class
	 * Constructor for a new <code>ParametersEditor</code> for editing key-value pairs with primitive values and persisted type information.
	 *
	 * <h3>Configuration</h3>
	 *
	 * Configuration is inherited from {@link sap.ui.integration.designtime.baseEditor.propertyEditor.mapEditor.MapEditor}
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.mapEditor.MapEditor
	 * @alias sap.ui.integration.designtime.cardEditor.propertyEditor.parametersEditor.ParametersEditor
	 * @author SAP SE
	 * @since 1.70
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.70
	 * @ui5-restricted
	 */
	var ParametersEditor = MapEditor.extend("sap.ui.integration.designtime.cardEditor.propertyEditor.parametersEditor.ParametersEditor", {
		formatInputValue: function(oValue) {
			return oValue;
		},

		formatOutputValue: function(oValue) {
			return oValue;
		},

		_isValidItem: function(oItem, oOriginalItem) {
			// If invalid entries should be excluded, only keep items which have a type in the manifest or have a string value
			var sType = oOriginalItem.type;
			var vValue = oOriginalItem.value;
			var aAllowedTypes = this._getAllowedTypes();

			return (
				sType && aAllowedTypes.indexOf(sType) >= 0 ||
				typeof vValue === "string" && includes(aAllowedTypes, "string")
			);
		},

		renderer: MapEditor.getMetadata().getRenderer().render
	});

	return ParametersEditor;
});