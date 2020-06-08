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
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	ParametersEditor.prototype.formatItemConfig = function(oConfigValue) {
		var oMapItemConfig = MapEditor.prototype.formatItemConfig.apply(this, arguments);
		var sKey = oConfigValue.key;
		var sLabel = oConfigValue.value.label || sKey;

		oMapItemConfig.splice(1, 0, {
			label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.LABEL"),
			path: "label",
			value: sLabel,
			type: "string",
			enabled: this.getConfig().allowLabelChange !== false,
			itemKey: sKey,
			allowBindings: false
		});

		return oMapItemConfig;
	};

	ParametersEditor.prototype.processInputValue = function(oValue) {
		return oValue;
	};

	ParametersEditor.prototype.processOutputValue = function(oValue) {
		return oValue;
	};

	ParametersEditor.prototype._configItemsFormatter = function(aItems) {
		return Array.isArray(aItems) ? aItems.map(function (oItem) {
			var oConfig = _merge({}, oItem.value);
			if (!oConfig.label) {
				oConfig.label = oItem.key;
			}
			oConfig.itemKey = oItem.key;
			oConfig.path = "value";
			return oConfig;
		}) : [];
	};

	ParametersEditor.prototype.setConfig = function(oConfig) {
		// Config scenario
		if (oConfig.allowTypeChange === false && oConfig.allowKeyChange === false) {
			this.setFragment("sap.ui.integration.designtime.cardEditor.propertyEditor.parametersEditor.ParametersConfigurationEditor", function () {
				return 1;
			});
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