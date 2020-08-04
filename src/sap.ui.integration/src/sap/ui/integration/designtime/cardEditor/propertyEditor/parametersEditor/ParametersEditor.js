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
	 * Constructor for a new <code>ParametersEditor</code> for editing key-value pairs with primitive values, labels and persisted type information.
	 *
	 * <h3>Configuration</h3>
	 *
	 * Configuration is inherited from {@link sap.ui.integration.designtime.baseEditor.propertyEditor.mapEditor.MapEditor}
	 *
	 * <table style="width:100%;">
	 * <tr style="text-align:left">
	 * 	<th>Option</th>
	 * 	<th>Type</th>
	 * 	<th>Default</th>
	 * 	<th>Description</th>
	 * </tr>
	 * <tr>
	 * 	<td><code>allowLabelChange</code></td>
	 *  <td><code>boolean</code></td>
	 * 	<td><code>true</code></td>
	 * 	<td>Whether to allow editing the label of parameters</td>
	 * </tr>
	 * </table>
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

	ParametersEditor.configMetadata = Object.assign({}, MapEditor.configMetadata, {
		allowLabelChange: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		}
	});

	ParametersEditor.prototype.formatItemConfig = function(oConfigValue) {
		var oMapItemConfig = MapEditor.prototype.formatItemConfig.apply(this, arguments);
		var sKey = oConfigValue.key;
		var vItemMetadata = this.getNestedDesigntimeMetadataValue(sKey);
		var sLabel = vItemMetadata.label;

		oMapItemConfig.splice(1, 0, {
			label: this.getI18nProperty("CARD_EDITOR.LABEL"),
			path: "label",
			value: sLabel,
			placeholder: sLabel ? undefined : sKey,
			type: "string",
			enabled: this.getConfig().allowLabelChange,
			itemKey: sKey
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
			var oItemMetadata = this.getNestedDesigntimeMetadataValue(oItem.key);
			var oConfig = _merge({}, oItem.value, oItemMetadata);
			if (!oConfig.label) {
				oConfig.label = oItem.key;
			}
			oConfig.itemKey = oItem.key;
			oConfig.path = "value";
			oConfig.designtime = this.getNestedDesigntimeMetadata(oItem.key);
			return oConfig;
		}.bind(this)) : [];
	};

	ParametersEditor.prototype.getItemChangeHandlers = function () {
		return Object.assign(
			{},
			MapEditor.prototype.getItemChangeHandlers.apply(this, arguments),
			{
				label: this._onDesigntimeChange
			}
		);
	};

	ParametersEditor.prototype._onDesigntimeChange = function (sKey, oEvent) {
		var oDesigntime = _merge({}, this.getConfig().designtime);
		var newDesigntimeValue = { __value: {} };
		newDesigntimeValue.__value[oEvent.getParameter("path")] = oEvent.getParameter("value");

		oDesigntime[sKey] = _merge(
			{},
			oDesigntime[sKey],
			newDesigntimeValue
		);
		this.setDesigntimeMetadata(oDesigntime);
		this.setValue(this.getValue());
	};

	ParametersEditor.prototype.onBeforeConfigChange = function(oConfig) {
		// Config scenario
		if (!oConfig.allowTypeChange && !oConfig.allowKeyChange) {
			this.setFragment("sap.ui.integration.designtime.cardEditor.propertyEditor.parametersEditor.ParametersConfigurationEditor", function () {
				return 1;
			});
		}
		return oConfig;
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