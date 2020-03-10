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
	 * @constructor
	 * @private
	 * @experimental
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