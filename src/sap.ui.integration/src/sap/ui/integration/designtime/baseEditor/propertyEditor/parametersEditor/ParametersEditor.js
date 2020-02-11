/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
	"sap/base/util/deepClone",
	"sap/base/util/isPlainObject"
], function (
	MapEditor,
	deepClone,
	isPlainObject
) {
	"use strict";

	/**
	 * @constructor
	 * @private
	 * @experimental
	 */
	var ParametersEditor = MapEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.parametersEditor.ParametersEditor", {
		formatInputValue: function(oValue) {
			return (oValue || {}).value;
		},

		fireValueChange: function(mParams) {
			var mFormattedParams = {};
			Object.keys(mParams).forEach(function (sKey) {
				mFormattedParams[sKey] = this._formatOutputValue(deepClone(mParams[sKey]));
			}.bind(this));
			this.fireEvent("valueChange", {
				path: this.getConfig().path,
				value: mFormattedParams
			});
		},

		_formatOutputValue: function(oValue) {
			// Parameters that are retrieved from the manifest arrive as key-value-pairs and thus must be converted
			if (!isPlainObject(oValue) || !oValue.hasOwnProperty("value")) {
				oValue = {value: oValue};
			}
			return oValue;
		},

		renderer: MapEditor.getMetadata().getRenderer().render
	});

	return ParametersEditor;
});