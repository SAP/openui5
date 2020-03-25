/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/base/util/deepClone",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/restricted/_merge",
	"sap/base/util/restricted/_omit",
	"sap/base/util/isPlainObject",
	"sap/base/util/includes"
], function (
	BasePropertyEditor,
	deepClone,
	JSONModel,
	_merge,
	_omit,
	isPlainObject,
	includes
) {
	"use strict";

	var SUPPORTED_TYPE_LABELS = {
		"string": "BASE_EDITOR.MAP.TYPES.STRING",
		"boolean": "BASE_EDITOR.MAP.TYPES.BOOLEAN",
		"number": "BASE_EDITOR.MAP.TYPES.NUMBER",
		"integer": "BASE_EDITOR.MAP.TYPES.INTEGER",
		"date": "BASE_EDITOR.MAP.TYPES.DATE",
		"datetime": "BASE_EDITOR.MAP.TYPES.DATETIME"
	};

	/**
	 * @class
	 * Constructor for a new <code>MapEditor</code> for editing key-value pairs with primitive values.
	 * To get notified about changes made with the editor, you can attach a handler to the <code>valueChange</code> event.
	 *
	 * <h3>Configuration</h3>
	 *
	 * <table style="width:100%;">
	 * <tr style="text-align:left">
	 * 	<th>Option</th>
	 * 	<th>Type</th>
	 * 	<th>Default</th>
	 * 	<th>Description</th>
	 * </tr>
	 * <tr>
	 * 	<td><code>allowKeyChange</code></td>
	 *  <td><code>boolean</code></td>
	 * 	<td><code>true</code></td>
	 * 	<td>Whether to allow editing the key attribute of map entries</td>
	 * </tr>
	 * <tr>
	 * 	<td><code>allowTypeChange</code></td>
	 *  <td><code>boolean</code></td>
	 * 	<td><code>true</code></td>
	 * 	<td>Whether to allow editing the type of map entries</td>
	 * </tr>
	 * <tr>
	 * 	<td><code>allowAddAndRemove</code></td>
	 *  <td><code>boolean</code></td>
	 * 	<td><code>true</code></td>
	 * 	<td>Whether to allow adding and removing map entries</td>
	 * </tr>
	 * <tr>
	 * 	<td><code>allowedTypes</code></td>
	 *  <td><code>string[]</code></td>
	 * 	<td><code>["string"]</code></td>
	 * 	<td>List of editor types which are supported in the map</td>
	 * </tr>
	 * <tr>
	 * 	<td><code>includeInvalidEntries</code></td>
	 *  <td><code>boolean</code></td>
	 * 	<td><code>true</code></td>
	 * 	<td>Whether to show entries with invalid types if the <code>StringEditor</code> cannot be used as a fallback</td>
	 * </tr>
	 * </table>
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.mapEditor.MapEditor
	 * @author SAP SE
	 * @since 1.74
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.74
	 * @ui5-restricted
	 */
	var MapEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.mapEditor.MapEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.mapEditor.MapEditor",

		init: function() {
			this._itemsModel = new JSONModel();
			this._itemsModel.setDefaultBindingMode("OneWay");
			this.setModel(this._itemsModel, "itemsModel");
			this._supportedTypesModel = new JSONModel();
			this._supportedTypesModel.setDefaultBindingMode("OneWay");
			this.setModel(this._supportedTypesModel, "supportedTypes");
			this.attachModelContextChange(function () {
				if (this.getModel("i18n")) {
					var oResourceBundle = this.getModel("i18n").getResourceBundle();
					this._aSupportedTypes = Object.keys(SUPPORTED_TYPE_LABELS).map(function (sKey) {
						return {
							key: sKey,
							label: oResourceBundle.getText(SUPPORTED_TYPE_LABELS[sKey])
						};
					});
					this._setSupportedTypesModel();
				}
			}, this);
			this.attachConfigChange(this._setSupportedTypesModel, this);
			this._mTypes = {};
		},

		setValue: function(mValue) {
			mValue = isPlainObject(mValue) ? mValue : {};

			var aItems = this._processValue(mValue);

			this._itemsModel.setData(aItems);
			BasePropertyEditor.prototype.setValue.call(this, mValue);
		},

		_processValue: function(mValue) {
			return Object.keys(mValue).map(function (sKey) {
				var mFormattedValue = this.formatInputValue(deepClone(mValue[sKey]), sKey);
				if (!mFormattedValue.type) {
					mFormattedValue.type = this._mTypes[sKey] || this._getDefaultType(mFormattedValue.value);
				}
				this._mTypes[sKey] = mFormattedValue.type;
				mFormattedValue.path = sKey;

				var oItem = {
					key: sKey,
					value: [mFormattedValue]
				};

				return this.getConfig().includeInvalidEntries !== false || this._isValidItem(oItem, deepClone(mValue[sKey])) ? oItem : undefined;
			}, this).filter(Boolean);
		},

		/**
		 * Hook which is called for every map item to filter invalid entries.
		 * @param {object} oItem - Formatted item
		 * @param {object} oOriginalItem - Original item
		 * @returns {boolean} <code>true</code> if the item is valid
		 * @private
		 */
		_isValidItem: function(oItem) {
			var sType = oItem.value[0].type;
			return sType && includes(this._getAllowedTypes(), sType);
		},

		_getDefaultType: function (vValue) {
			var aAllowedTypes = this._getAllowedTypes();
			var sType = typeof vValue;
			var sChosenType = includes(aAllowedTypes, sType) ? sType : undefined;
			if (!sChosenType && includes(aAllowedTypes, "string")) {
				sChosenType = "string";
			}
			return sChosenType;
		},

		_getAllowedTypes: function () {
			var oConfig = this.getConfig();
			return oConfig && oConfig["allowedTypes"] || ["string"];
		},

		_setSupportedTypesModel: function () {
			var aAllowedTypes = this._getAllowedTypes();
			this._supportedTypesModel.setData(this._aSupportedTypes.filter(function (oSupportedType) {
				return includes(aAllowedTypes, oSupportedType.key);
			}));
		},

		getExpectedWrapperCount: function (mValue) {
			// Process the value first to not wait for filtered out invalid items
			return this._processValue(mValue).length;
		},

		/**
		 * Hook which is called for every map item value coming from the JSON. Can be overridden in order to format the value to fit the editor's requirements.
		 * @param {object} oValue - Original map item value
		 * @returns {object} Formatted map item value
		 */
		formatInputValue: function(oValue) {
			return {
				value: oValue
			};
		},

		/**
		 * Hook which is called for every map item value coming from the editor. Can be overridden in order to format the value to fit the JSON schema definition.
		 * @param {object} oValue - Original map item value
		 * @returns {object} Formatted map item value
		 */
		formatOutputValue: function(oValue) {
			return oValue.value;
		},

		_onRemoveElement: function(oEvent) {
			var sKeyToDelete = oEvent.getSource().getBindingContext("itemsModel").getObject().key;
			var mValue = this.getValue();
			this.setValue(_omit(mValue, sKeyToDelete));
		},

		_onAddElement: function() {
			var mParams = _merge({}, this.getValue());
			var sKey = this._getUniqueKey(mParams);
			mParams[sKey] = this.formatOutputValue({
				value: "",
				type: "string"
			});
			this.setValue(mParams);
		},

		_getUniqueKey: function(mParams) {
			var sKey = "key";
			var iIndex = 0;
			while (mParams.hasOwnProperty(sKey)) {
				sKey = "key" + ++iIndex;
			}
			return sKey;
		},

		_onKeyChange: function(oEvent) {
			var aItems = (this._itemsModel.getData() || []).slice();
			var oInput = oEvent.getSource();
			var sNewKey = oEvent.getParameter("value");
			var sOldKey = oInput.getBindingContext("itemsModel").getObject().key;

			var aItemKeys = aItems.map(function (oItem) {
				return oItem.key;
			});
			var oValue = this.getValue();
			var iElementToModifyIndex = aItemKeys.indexOf(sOldKey);

			if (iElementToModifyIndex >= 0 && (!oValue.hasOwnProperty(sNewKey) || sNewKey === sOldKey)) {
				oInput.setValueState("None");

				var oItem = deepClone(aItems[iElementToModifyIndex]);
				oItem.key = sNewKey;
				aItems.splice(
					iElementToModifyIndex,
					1,
					oItem
				);
				if (sNewKey !== sOldKey) {
					var oMap = {};
					aItems.forEach(function (oItem) {
						oMap[oItem.key] = this.formatOutputValue({
							value: oItem.value[0].value,
							type: oItem.value[0].type
						});
					}, this);
					this._mTypes[sNewKey] = this._mTypes[sOldKey];
					delete this._mTypes[sOldKey];
					this.setValue(oMap);
				}
			} else {
				oInput.setValueState("Error");
				oInput.setValueStateText(this.getI18nProperty("BASE_EDITOR.MAP.DUPLICATE_KEY"));
			}
		},

		_onTypeChange: function (oEvent, sKey) {
			var oEditorValue = _merge({}, this.getValue());
			var sNewType =  oEvent.getParameter("selectedItem").getKey();

			var oItemToEdit = this.formatInputValue(oEditorValue[sKey]);
			oItemToEdit.type = sNewType;
			oEditorValue[sKey] = this.formatOutputValue(oItemToEdit);

			this._mTypes[sKey] = sNewType;
			this.setValue(oEditorValue);
		},

		_propertyEditorsChange: function (oEvent) {
			var oPreviousPropertyEditor = oEvent.getParameter("previousPropertyEditors")[0];
			var oPropertyEditor = oEvent.getParameter("propertyEditors")[0];
			if (oPreviousPropertyEditor) {
				oPreviousPropertyEditor.detachValueChange(this._onPropertyValueChange, this);
			}
			if (oPropertyEditor) {
				oPropertyEditor.attachValueChange(this._onPropertyValueChange, this);
			}
		},

		_onPropertyValueChange: function (oEvent) {
			var oEditorValue = _merge({}, this.getValue());
			var sKey = oEvent.getParameter("path");

			var oItemToEdit = this.formatInputValue(oEditorValue[sKey]);
			oItemToEdit.value = oEvent.getParameter("value");
			oEditorValue[sKey] = this.formatOutputValue(oItemToEdit);

			this.setValue(oEditorValue);
		},

		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	return MapEditor;
});