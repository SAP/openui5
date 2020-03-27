/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
	"sap/base/util/includes",
	"sap/base/util/restricted/_merge"
], function (
	BasePropertyEditor,
	MapEditor,
	includes,
	_merge
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
		xmlFragment: "sap.ui.integration.designtime.cardEditor.propertyEditor.parametersEditor.ParametersEditor",
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	ParametersEditor.prototype.processInputValue = function(oValue) {
		return oValue;
	};

	ParametersEditor.prototype.processOutputValue = function(oValue) {
		return oValue;
	};

	ParametersEditor.prototype._itemsFormatter = function(aItems) {
		return aItems.map(function (oItem) {
			var oValue = _merge({}, oItem.value[0]);
			if (!oValue.label) {
				oValue.label = oItem.key;
			}
			return oValue;
		});
	};

	ParametersEditor.prototype._onLabelChange = function(oEvent, sKey) {
		var oEditorValue = _merge({}, this.getValue());
		var sNewLabel =  oEvent.getParameter("newValue");

		var oItemToEdit = oEditorValue[sKey];
		oItemToEdit.label = sNewLabel;
		oEditorValue[sKey] = this.processOutputValue(oItemToEdit);

		this.setValue(oEditorValue);
	};

	ParametersEditor.prototype.setConfig = function(oConfig) {
		// Config scenario
		if (oConfig.allowTypeChange === false && oConfig.allowKeyChange === false) {
			this.setFragment("sap.ui.integration.designtime.cardEditor.propertyEditor.parametersEditor.ParametersConfigurationEditor");
		}
		MapEditor.prototype.setConfig.apply(this, arguments);
	};

	ParametersEditor.prototype._isValidItem = function(oItem, oOriginalItem) {
		// If invalid entries should be excluded, only keep items which have a type in the manifest or have a string value
		var sType = oOriginalItem.type;
		var vValue = oOriginalItem.value;
		var aAllowedTypes = this._getAllowedTypes();

		return (
			sType && includes(aAllowedTypes, sType) ||
			typeof vValue === "string" && includes(aAllowedTypes, "string")
		);
	};

	return ParametersEditor;
});