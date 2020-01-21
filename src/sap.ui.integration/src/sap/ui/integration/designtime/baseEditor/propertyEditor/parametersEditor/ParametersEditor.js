/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
	"sap/base/util/deepClone",
	"sap/base/util/isPlainObject"
], function (
	BasePropertyEditor,
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
		onValueChange: function() {
			var oConfig = this.getConfig();
			if (oConfig.value) {
				var aItems = Object.keys(oConfig.value).map(function (sKey) {
					var oValue = (oConfig.value[sKey] || {}).value;
					return {
						key: sKey,
						value: [{
							type: isPlainObject(oValue) ? "json" : "string",
							path: sKey,
							value: oValue
						}]
					};
				});
				this._itemsModel.setData(aItems);
			}
		},

		fireValueChange: function(mParams) {
			var mFormattedParams = {};
			Object.keys(mParams).forEach(function (sKey) {
				mFormattedParams[sKey] = this._formatValue(deepClone(mParams[sKey]), sKey);
			}.bind(this));
			this.fireEvent("valueChange", {
				path: this.getConfig().path,
				value: mFormattedParams
			});
		},

		_formatValue: function(oValue, sKey) {
			// FIXME: Workaround to make sure that oObject is actually an object
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