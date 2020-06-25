/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/base/util/deepClone",
	"sap/base/util/deepEqual",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/restricted/_merge",
	"sap/base/util/restricted/_omit",
	"sap/base/util/isPlainObject",
	"sap/base/util/includes"
], function (
	BasePropertyEditor,
	deepClone,
	deepEqual,
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

		getConfigMetadata: function() {
			return Object.assign(
				{},
				BasePropertyEditor.prototype.getConfigMetadata.call(this),
				{
					allowKeyChange: {
						defaultValue: true
					},
					allowTypeChange: {
						defaultValue: true
					},
					allowAddAndRemove: {
						defaultValue: true
					},
					allowedTypes: {
						defaultValue: ["string"]
					},
					includeInvalidEntries: {
						defaultValue: true
					}
				}
			);
		},

		init: function() {
			BasePropertyEditor.prototype.init.apply(this, arguments);
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
			BasePropertyEditor.prototype.setValue.call(this, mValue);

			var aItems = this._processValue(mValue);
			this._itemsModel.setData(aItems);
		},

		_processValue: function(mValue) {
			return Object.keys(mValue).map(function (sKey) {
				var mFormattedValue = this._prepareInputValue(mValue[sKey], sKey);
				this._mTypes[sKey] = mFormattedValue.type;

				var oItem = {
					key: sKey,
					value: mFormattedValue
				};

				return this.getConfig().includeInvalidEntries || this._isValidItem(oItem, deepClone(mValue[sKey])) ? oItem : undefined;
			}, this).filter(Boolean);
		},

		_prepareInputValue: function(oValue, sKey) {
			var mFormattedValue = this.processInputValue(deepClone(oValue), sKey);
			if (!mFormattedValue.type) {
				mFormattedValue.type = this._mTypes[sKey] || this._getDefaultType(mFormattedValue.value);
			}
			return mFormattedValue;
		},

		/**
		 * Hook which is called for every map item to filter invalid entries.
		 * @param {object} oItem - Formatted item
		 * @param {object} oOriginalItem - Original item
		 * @returns {boolean} <code>true</code> if the item is valid
		 * @private
		 */
		_isValidItem: function(oItem) {
			var sType = oItem.value.type;
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
			return (this.getConfig() || this.getConfigMetadata())["allowedTypes"];
		},

		_setSupportedTypesModel: function () {
			var aAllowedTypes = this._getAllowedTypes();
			this._supportedTypesModel.setData(this._aSupportedTypes.filter(function (oSupportedType) {
				return includes(aAllowedTypes, oSupportedType.key);
			}));
		},

		/**
		 * Formatter function which is called for every item config
		 * @param {object} oConfigValue - Original map item config
		 * @param {string} oConfigValue.key - Item key
		 * @param {object} oConfigValue.value - Formatted item value
		 * @param {string} oConfigValue.value.type - Property type
		 * @param {any} oConfigValue.value.value - Property value
		 * @returns {object} Formatted map item config
		 */
		formatItemConfig: function(oConfigValue) {
			var sKey = oConfigValue.key;
			var sType = oConfigValue.value.type;
			var vValue = oConfigValue.value.value;
			var oConfig = this.getConfig();

			return [
				{
					label: this.getI18nProperty("BASE_EDITOR.MAP.KEY"),
					path: "key",
					value: sKey,
					type: "string",
					enabled: oConfig.allowKeyChange,
					itemKey: sKey,
					allowBindings: false
				},
				{
					label: this.getI18nProperty("BASE_EDITOR.MAP.TYPE"),
					path: "type",
					value: sType,
					type: "enum",
					"enum": this._getAllowedTypes(),
					visible: oConfig.allowTypeChange,
					itemKey: sKey,
					allowBindings: false
				},
				{
					label: this.getI18nProperty("BASE_EDITOR.MAP.VALUE"),
					path: "value",
					value: vValue,
					type: sType,
					itemKey: sKey
				}
			];
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
		processInputValue: function(oValue) {
			return {
				value: oValue
			};
		},

		/**
		 * Hook which is called for every map item value coming from the editor. Can be overridden in order to format the value to fit the JSON schema definition.
		 * @param {object} oValue - Original map item value
		 * @returns {object} Formatted map item value
		 */
		processOutputValue: function(oValue) {
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
			mParams[sKey] = this.processOutputValue(this._getItemTemplate());
			this.setValue(mParams);
		},

		_getItemTemplate: function() {
			return {
				value: "",
				type: "string"
			};
		},

		_isNewItem: function(mItem) {
			return deepEqual(
				mItem.value,
				this._prepareInputValue(this.processOutputValue(this._getItemTemplate()))
			);
		},

		_getUniqueKey: function(mParams) {
			var sKey = "key";
			var iIndex = 0;
			while (mParams.hasOwnProperty(sKey)) {
				sKey = "key" + ++iIndex;
			}
			return sKey;
		},

		_propertyEditorsChange: function (oEvent) {
			var aPreviousPropertyEditors = oEvent.getParameter("previousPropertyEditors");
			var aPropertyEditors = oEvent.getParameter("propertyEditors");
			if (Array.isArray(aPreviousPropertyEditors)) {
				aPreviousPropertyEditors.forEach(function (oPreviousPropertyEditor) {
					oPreviousPropertyEditor.detachValueChange(this._onItemChange, this);
				}, this);
			}
			if (Array.isArray(aPropertyEditors)) {
				aPropertyEditors.forEach(function (oPropertyEditor) {
					oPropertyEditor.attachValueChange(this._onItemChange, this);
				}, this);
			}
		},

		_onItemChange: function (oEvent) {
			var sKey = oEvent.getSource().getConfig().itemKey;
			var sChangeType = oEvent.getParameter("path");

			var fnHandler = this._getItemChangeHandlers()[sChangeType];
			if (typeof fnHandler !== 'function') {
				// No specific handler is registered for the change, use generic handler
				fnHandler = this._onFieldChange;
			}

			fnHandler.call(this, sKey, oEvent);
		},

		_getItemChangeHandlers: function () {
			return {
				"key": this._onKeyChange,
				"type": this._onTypeChange
			};
		},

		_onKeyChange: function(sOldKey, oEvent) {
			// Ignore changes triggered by editor initialization to avoid duplicate key errors for the initial value
			if (oEvent.getParameter("previousValue") === undefined) {
				return;
			}

			var oEditorValue = _merge({}, this.getValue());
			var oInput = oEvent.getSource().getAggregation("propertyEditor").getContent();
			var sNewKey = oEvent.getParameter("value");

			if (oEditorValue.hasOwnProperty(sOldKey) && (!oEditorValue.hasOwnProperty(sNewKey) || sNewKey === sOldKey)) {
				oInput.setValueState("None");

				if (sNewKey !== sOldKey) {
					var oNewValue = {};
					// Iterate over items to keep the order
					Object.keys(oEditorValue).forEach(function (sItemKey) {
						var sNewItemKey = sItemKey === sOldKey ? sNewKey : sItemKey;
						oNewValue[sNewItemKey] = oEditorValue[sItemKey];
					});

					this._mTypes[sNewKey] = this._mTypes[sOldKey];
					delete this._mTypes[sOldKey];

					this.setValue(oNewValue);
				}
			} else {
				oInput.setValueState("Error");
				oInput.setValueStateText(this.getI18nProperty("BASE_EDITOR.MAP.DUPLICATE_KEY"));
			}
		},

		_onTypeChange: function (sKey, oEvent) {
			// Ignore changes triggered by editor initialization as the item type has not actually changed
			if (oEvent.getParameter("previousValue") === undefined) {
				return;
			}

			var oEditorValue = _merge({}, this.getValue());
			var sNewType =  oEvent.getParameter("value");

			var oItemToEdit = this.processInputValue(oEditorValue[sKey]);
			oItemToEdit.type = sNewType;
			oEditorValue[sKey] = this.processOutputValue(oItemToEdit);

			this._mTypes[sKey] = sNewType;
			this.setValue(oEditorValue);
		},

		// Generic field change
		_onFieldChange: function (sKey, oEvent) {
			var oEditorValue = _merge({}, this.getValue());
			var sPath = oEvent.getParameter("path");
			var vValue = oEvent.getParameter("value");

			var oItemToEdit = this.processInputValue(oEditorValue[sKey]);
			oItemToEdit[sPath] = vValue;
			oEditorValue[sKey] = this.processOutputValue(oItemToEdit);

			this.setValue(oEditorValue);
		},

		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	return MapEditor;
});