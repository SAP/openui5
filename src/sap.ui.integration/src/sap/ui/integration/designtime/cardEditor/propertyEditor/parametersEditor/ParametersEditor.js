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
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	ParametersEditor.configMetadata = Object.assign({}, MapEditor.configMetadata, {
		allowLabelChange: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		}
	});

	ParametersEditor.prototype.formatItemConfig = function (oConfigValue) {
		var oMapItemConfig = MapEditor.prototype.formatItemConfig.apply(this, arguments);
		var sKey = oConfigValue.key;
		var sType = oConfigValue.value.type;
		var vItemMetadata = this.getNestedDesigntimeMetadataValue(sKey);
		var sVisible = (oConfigValue.value.visible || vItemMetadata.visible) !== false;
		var sEditable = (oConfigValue.value.editable || vItemMetadata.editable) !== false;
		var sManifestpath = oConfigValue.value.manifestpath || vItemMetadata.manifestpath || "";
		var sDescription = oConfigValue.value.description || vItemMetadata.description || "";
		var bTranslatable = (oConfigValue.value.translatable || vItemMetadata.translatable) === true;
		var bAllowSettings = (oConfigValue.value.allowSettings || vItemMetadata.allowSettings) === true;
		var bAllowDynamicValues = (oConfigValue.value.allowDynamicValues || vItemMetadata.allowDynamicValues) === true;
		var oVisualization = oConfigValue.value.visualization || vItemMetadata.visualization;
		var sLabel = vItemMetadata.label;

		oMapItemConfig.push(
			{
				label: this.getI18nProperty("CARD_EDITOR.LABEL"),
				path: "label",
				value: sLabel,
				placeholder: sLabel ? undefined : sKey,
				type: "string",
				enabled: this.getConfig().allowLabelChange,
				itemKey: sKey
			},
			{
				label: "Description",
				path: "description",
				value: sDescription,
				allowBindings: true,
				visible: sType !== "group",
				type: "string",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("BASE_EDITOR.MAP.MANIFESTPATH"),
				path: "manifestpath",
				value: sManifestpath,
				allowBindings: true,
				visible: sType !== "group",
				type: "string",
				itemKey: sKey
			},
			{
				label: "Visible in Configuration",
				path: "visible",
				value: sVisible,
				allowBindings: true,
				type: "boolean",
				itemKey: sKey
			},
			{
				label: "Editable in Configuration",
				path: "editable",
				allowBindings: true,
				value: sEditable,
				enabled: true,
				visible: sType !== "group",
				type: "boolean",
				itemKey: sKey
			},
			{
				label: "Translatable in Configuration",
				path: "translatable",
				value: bTranslatable,
				enabled: true,
				type: "boolean",
				itemKey: sKey
			},
			{
				label: "Allow Dynamic Values in Configuration",
				path: "allowDynamicValues",
				allowBindings: true,
				enabled: true,
				value: bAllowDynamicValues,
				visible: sType !== "group",
				type: "boolean",
				itemKey: sKey
			},
			{
				label: "Allow Settings in Configuration",
				path: "allowSettings",
				allowBindings: true,
				value: bAllowSettings,
				visible: sType !== "group",
				type: "boolean",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("BASE_EDITOR.MAP.VISUALIZATION"),
				path: "visualization",
				allowBindings: true,
				value: oVisualization,
				visible: sType !== "group",
				placeholder: this.getI18nProperty("BASE_EDITOR.MAP.VISUALIZATION.PLACEHOLDER"),
				type: "textArea",
				itemKey: sKey
			}
		);
		return oMapItemConfig;
	};

	ParametersEditor.prototype.processInputValue = function (oValue) {
		return oValue;
	};

	ParametersEditor.prototype.processOutputValue = function (oValue) {
		return oValue;
	};

	ParametersEditor.prototype._configItemsFormatter = function (aItems) {
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

	ParametersEditor.prototype.onBeforeConfigChange = function (oConfig) {
		// Config scenario
		if (!oConfig.allowTypeChange && !oConfig.allowKeyChange) {
			this.setFragment("sap.ui.integration.designtime.cardEditor.propertyEditor.parametersEditor.ParametersConfigurationEditor", function () {
				return 1;
			});
		}
		return oConfig;
	};

	ParametersEditor.prototype._isValidItem = function (oItem, oOriginalItem) {
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