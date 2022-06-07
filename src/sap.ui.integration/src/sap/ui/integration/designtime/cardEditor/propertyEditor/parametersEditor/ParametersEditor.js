/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
	"sap/base/util/includes",
	"sap/base/util/restricted/_merge",
	"sap/base/util/deepEqual"
], function (
	BasePropertyEditor,
	MapEditor,
	includes,
	_merge,
	deepEqual
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

	ParametersEditor.prototype.getBoolenValue = function (bValue1, bValue2, bDefaultValue) {
		if (typeof bValue1 === "boolean") {
			return bValue1;
		}
		if (typeof bValue2 === "boolean") {
			return bValue2;
		}
		return bDefaultValue;
	};

	ParametersEditor.prototype.formatItemConfig = function (oConfigValue) {
		var oMapItemConfig = MapEditor.prototype.formatItemConfig.apply(this, arguments);
		var sKey = oConfigValue.key;
		var sType = oConfigValue.value.type;
		var vItemMetadata = this.getNestedDesigntimeMetadataValue(sKey);
		var bVisible = this.getBoolenValue(oConfigValue.value.visible, vItemMetadata.visible, true);
		var bVisibleToUser = this.getBoolenValue(oConfigValue.value.visibleToUser, vItemMetadata.visibleToUser, true);
		var bEditable = this.getBoolenValue(oConfigValue.value.editable, vItemMetadata.editable, true);
		var bEditableToUser = this.getBoolenValue(oConfigValue.value.editableToUser, vItemMetadata.editableToUser, true);
		var bRequired = this.getBoolenValue(oConfigValue.value.required, vItemMetadata.required, false);
		var bExpanded = this.getBoolenValue(oConfigValue.value.expanded, vItemMetadata.expanded, true);
		var sLevel = oConfigValue.value.level || vItemMetadata.level || "0";
		var sManifestpath = oConfigValue.value.manifestpath || vItemMetadata.manifestpath || "";
		var sDescription = oConfigValue.value.description || vItemMetadata.description || "";
		var bTranslatable = this.getBoolenValue(oConfigValue.value.translatable, vItemMetadata.translatable, false);
		var bAllowSettings = this.getBoolenValue(oConfigValue.value.allowSettings, vItemMetadata.allowSettings, true);
		var bAllowDynamicValues = this.getBoolenValue(oConfigValue.value.allowDynamicValues, vItemMetadata.allowDynamicValues, false);
		var oVisualization = oConfigValue.value.visualization || vItemMetadata.visualization;
		var oValues = oConfigValue.value.values || vItemMetadata.values;
		var oProperties = oConfigValue.value.properties || vItemMetadata.properties;
		var sLabel = oConfigValue.value.label || vItemMetadata.label;
		var sPlaceholder = oConfigValue.value.placeholder || vItemMetadata.placeholder || "";
		var oValidations = oConfigValue.value.validations || vItemMetadata.validations;
		var sHint = oConfigValue.value.hint || vItemMetadata.hint || "";
		var sFormattor = oConfigValue.value.formatter || vItemMetadata.formatter;
		var oLayout = oConfigValue.value.layout || vItemMetadata.layout;
		//var bLine = this.getBoolenValue(oConfigValue.value.line, vItemMetadata.line, false);
		//var oTemplate = oConfigValue.value.template || vItemMetadata.template || {};
/*
		if (sType === "array") {
		    if (deepEqual(oTemplate, {})) {
				oTemplate = {
					"key": {
						"label": "Key",
						"type": "string",
						"path": "key"
					},
					"text": {
						"label": "Text",
						"type": "string",
						"path": "text"
					}
				};
			}
			oMapItemConfig[2].allowAddAndRemove = false;
		}*/
		oMapItemConfig[2].visible = !(sType === "group" || sType === "array" || sType === "separator");

		oMapItemConfig.push(
			{
				label: this.getI18nProperty("CARD_EDITOR.LABEL"),
				path: "label",
				value: sLabel,
				placeholder: sLabel ? undefined : sKey,
				visible: sType !== "separator",
				type: "string",
				enabled: this.getConfig().allowLabelChange,
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.LEVEL"),
				path: "level",
				value: sLevel,
				type: "select",
				items: [
					{
						key: "0",
						title: "0"
					},
					{
						key: "1",
						title: "1"
					}
				],
				visible: sType === "group",
				itemKey: sKey,
				allowBindings: true
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.DESCRIPTION"),
				path: "description",
				value: sDescription,
				allowBindings: true,
				visible: sType !== "group" && sType !== "separator",
				type: "string",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.HINT"),
				path: "hint",
				value: sHint,
				allowBindings: true,
				enabled: true,
				visible: sType !== "separator",
				type: "string",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.FORMATTER"),
				path: "formatter",
				value: sFormattor,
				allowBindings: true,
				enabled: true,
				visible: sType === "date" || sType === "datetime" || sType === "number" || sType === "integer",
				type: "textArea",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.PLACEHOLDER"),
				path: "placeholder",
				value: sPlaceholder,
				allowBindings: true,
				visible: sType === "string",
				type: "string",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.MANIFESTPATH"),
				path: "manifestpath",
				value: sManifestpath,
				allowBindings: true,
				visible: sType !== "group" && sType !== "separator",
				type: "string",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.VISIBLE"),
				path: "visible",
				value: bVisible,
				allowBindings: true,
				type: "boolean",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.VISIBLETOUSER"),
				path: "visibleToUser",
				value: bVisibleToUser,
				allowBindings: true,
				type: "boolean",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.EDITABLE"),
				path: "editable",
				allowBindings: true,
				value: bEditable,
				enabled: true,
				visible: sType !== "group" && sType !== "separator",
				type: "boolean",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.EDITABLETOUSER"),
				path: "editableToUser",
				allowBindings: true,
				value: bEditableToUser,
				enabled: true,
				visible: sType !== "group" && sType !== "separator",
				type: "boolean",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.REQUIRED"),
				path: "required",
				allowBindings: true,
				value: bRequired,
				visible: sType === "string" || sType === "number" || sType === "integer",
				enabled: true,
				type: "boolean",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.EXPANDED"),
				path: "expanded",
				allowBindings: true,
				value: bExpanded,
				enabled: true,
				visible: sType === "group",
				type: "boolean",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.TRANSLATABLE"),
				path: "translatable",
				value: bTranslatable,
				enabled: true,
				visible: sType === "string",
				type: "boolean",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.ALLOWDYNAMICVALUES"),
				path: "allowDynamicValues",
				allowBindings: true,
				enabled: true,
				value: bAllowDynamicValues,
				visible: sType !== "group" && sType !== "separator",
				type: "boolean",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.ALLOWSETTINGS"),
				path: "allowSettings",
				allowBindings: true,
				value: bAllowSettings,
				visible: sType !== "group" && sType !== "separator",
				type: "boolean",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.VISUALIZATION"),
				path: "visualization",
				allowBindings: true,
				value: oVisualization,
				visible: sType !== "separator",
				placeholder: this.getI18nProperty("CARD_EDITOR.PARAMETERS.VISUALIZATION.PLACEHOLDER"),
				type: "textArea",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.VALIDATIONS"),
				path: "validations",
				allowBindings: true,
				value: oValidations,
				visible: sType === "string" || sType === "number" || sType === "integer",
				placeholder: this.getI18nProperty("CARD_EDITOR.PARAMETERS.VALIDATIONS.PLACEHOLDER"),
				type: "textArea",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.VALUES"),
				path: "values",
				allowBindings: true,
				value: oValues,
				visible: sType === "string" || sType === "array" || sType === "object" || sType === "objectArray",
				placeholder: this.getI18nProperty("CARD_EDITOR.PARAMETERS.VALUES.PLACEHOLDER"),
				type: "textArea",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.PROPERTIES"),
				path: "properties",
				allowBindings: true,
				value: oProperties,
				visible: sType === "object" || sType === "objectArray",
				placeholder: this.getI18nProperty("CARD_EDITOR.PARAMETERS.PROPERTIES.PLACEHOLDER"),
				type: "textArea",
				itemKey: sKey
			},
			{
				label: this.getI18nProperty("CARD_EDITOR.PARAMETERS.LAYOUT"),
				path: "layout",
				allowBindings: true,
				value: oLayout,
				visible: sType !== "group" && sType !== "separator",
				placeholder: this.getI18nProperty("CARD_EDITOR.PARAMETERS.LAYOUT.PLACEHOLDER"),
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