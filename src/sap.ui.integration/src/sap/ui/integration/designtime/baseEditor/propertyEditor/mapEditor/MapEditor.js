/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/PropertyEditorFactory",
	"sap/base/util/deepClone",
	"sap/base/util/deepEqual",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/restricted/_merge",
	"sap/base/util/restricted/_omit",
	"sap/base/util/isPlainObject",
	"sap/base/strings/formatMessage"
], function (
	BasePropertyEditor,
	PropertyEditorFactory,
	deepClone,
	deepEqual,
	JSONModel,
	_merge,
	_omit,
	isPlainObject,
	formatMessage
) {
	"use strict";

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
	 * <tr>
	 * 	<td><code>allowSorting</code></td>
	 *  <td><code>boolean</code></td>
	 * 	<td><code>true</code></td>
	 * 	<td>Whether to allow changing the order of items.</td>
	 * </tr>
	 * <tr>
	 * 	<td><code>addItemLabelI18n</code></td>
	 *  <td><code>string</code></td>
	 * 	<td><code>BASE_EDITOR.MAP.DEFAULT_TYPE</code></td>
	 * 	<td>I18n key for the item in the "Add: Item" label, e.g. "Add: Parameter" by default</td>
	 * </tr>
	 * <tr>
	 * 	<td><code>defaultType</code></td>
	 *  <td><code>string</code></td>
	 * 	<td><code>null</code></td>
	 * 	<td>Default type for all map items. If <code>null</code>, the editor will try to derive the type from the value or fall back to "string"</td>
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
		metadata: {
			library: "sap.ui.integration"
		},

		init: function() {
			BasePropertyEditor.prototype.init.apply(this, arguments);
			this._itemsModel = new JSONModel();
			this._itemsModel.setDefaultBindingMode("OneWay");
			this.setModel(this._itemsModel, "itemsModel");
			this._supportedTypesModel = new JSONModel([]);
			this._supportedTypesModel.setDefaultBindingMode("OneWay");
			this.setModel(this._supportedTypesModel, "supportedTypes");
			this.attachModelContextChange(function () {
				if (this.getModel("i18n")) {
					this._setSupportedTypesModel();
				}
			}, this);
			this.attachConfigChange(this._setSupportedTypesModel, this);
			this._mTypes = {};
		},

		setValue: function(mValue) {
			mValue = isPlainObject(mValue) ? mValue : {};

			var mPositions = this._getPositions(mValue);
			// Persist item positions in designtime metadata
			this.setDesigntimeMetadata(_merge(
				{},
				this.getDesigntimeMetadata(),
				Object.keys(mPositions).reduce(function (mNewMetadata, sKey) {
					mNewMetadata[sKey] = { __value: { position: mPositions[sKey] } };
					return mNewMetadata;
				}, {})
			));

			BasePropertyEditor.prototype.setValue.call(this, mValue);

			var aItems = this._processValue(mValue);
			aItems = aItems
				.sort(function (oValue1, oValue2) {
					return mPositions[oValue1.key] - mPositions[oValue2.key];
				})
				.map(function (oItem, iIndex) {
					oItem.index = iIndex;
					oItem.total = aItems.length;
					return oItem;
				});
			this._itemsModel.setData(aItems);
		},

		_processValue: function(mValue) {
			return Object.keys(mValue).map(function (sKey) {
				var mFormattedValue = this._prepareInputValue(mValue[sKey], sKey);
				this._mTypes[sKey] = mFormattedValue.type;

				var oItem = {
					key: sKey,
					value: mFormattedValue,
					// Include designtime in the model to react on changes
					designtime: this.getNestedDesigntimeMetadata(sKey)
				};

				return this.getConfig().includeInvalidEntries || this._isValidItem(oItem, deepClone(mValue[sKey])) ? oItem : undefined;
			}, this).filter(Boolean);
		},

		_getPositions: function(mValue) {
			var aKeys = Object.keys(mValue);
			var aExistingPositions = aKeys
				.map(function (sKey) {
					var nCurrentPosition = this.getNestedDesigntimeMetadataValue(sKey).position;
					return nCurrentPosition >= 0 ? nCurrentPosition : -1;
				}.bind(this));

			// Put values without an existing position to the end
			var nMax = aExistingPositions.reduce(function(a, b) {
				return Math.max(a, b);
			}, -1);
			var mPositions = {};
			aExistingPositions.forEach(function (nCurrentPosition, nIndex) {
				mPositions[aKeys[nIndex]] = nCurrentPosition >= 0 ? nCurrentPosition : ++nMax;
			});
			return mPositions;
		},

		_prepareInputValue: function(oValue, sKey) {
			var mFormattedValue = this.processInputValue(deepClone(oValue), sKey);
			if (!mFormattedValue.type) {
				mFormattedValue.type = this._mTypes[sKey] || this._getDesigntimeMetadataValue(sKey).type || this._getDefaultType(mFormattedValue.value);
			}
			return mFormattedValue;
		},

		_getDesigntimeMetadataValue: function (sKey) {
			var oDesigntimeMetadata = (this.getConfig() || {}).designtime || {};
			var oDesigntimeMetadataValue = oDesigntimeMetadata[sKey] || {};
			return oDesigntimeMetadataValue.__value || {};
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
			return sType && this._getAllowedTypes().includes(sType);
		},

		_getDefaultType: function (vValue) {
			var sDefaultType = this.getConfig().defaultType;
			if (sDefaultType) {
				return sDefaultType;
			}

			var aAllowedTypes = this._getAllowedTypes();
			var sType = typeof vValue;
			var sChosenType = aAllowedTypes.includes(sType) ? sType : undefined;
			if (!sChosenType && aAllowedTypes.includes("string")) {
				sChosenType = "string";
			}
			return sChosenType;
		},

		_getAllowedTypes: function () {
			var oConfig = this.getConfig();
			return (
				(oConfig && oConfig.allowedTypes)
				|| MapEditor.configMetadata.allowedTypes.defaultValue
			);
		},

		_setSupportedTypesModel: function () {
			var aAllowedTypes = this._getAllowedTypes();
			var aRegisteredTypes = PropertyEditorFactory.getTypes();
			Promise.all(aAllowedTypes.map(function(sType) {
				return (aRegisteredTypes[sType] || Promise.resolve(BasePropertyEditor))
					.then(function(oEditor) {
						return {
							key: sType,
							editor: oEditor
						};
					});
			}))
				.then(function(aEditorInfos){
					var aItems = aEditorInfos.map(function(oEditorInfo) {
						var sLabelKey = oEditorInfo.editor.configMetadata.typeLabel.defaultValue;
						return {
							key: oEditorInfo.key,
							title: this.getI18nProperty(sLabelKey)
						};
					}.bind(this));
					this._supportedTypesModel.setData(aItems);
				}.bind(this));
		},

		/**
		 * Formatter function which is called for every item config
		 * @param {object} oConfigValue - Original map item config
		 * @param {string} oConfigValue.key - Item key
		 * @param {object} oConfigValue.designtime - Item designtime metadata
		 * @param {object} oConfigValue.value - Formatted item value
		 * @param {string} oConfigValue.value.type - Property type
		 * @param {any} oConfigValue.value.value - Property value
		 * @returns {object} Formatted map item config
		 */
		formatItemConfig: function(oConfigValue) {
			var sKey = oConfigValue.key;
			var sType = oConfigValue.value.type;
			var vValue = oConfigValue.value.value;
			if (sType === "boolean") {
				vValue = oConfigValue.value.value !== false;
			}
			var oDesigntime = (oConfigValue.designtime || {}).__value;
			var oConfig = this.getConfig();

			return [
				{
					label: this.getI18nProperty("BASE_EDITOR.MAP.KEY"),
					path: "key",
					value: sKey,
					type: "string",
					enabled: oConfig.allowKeyChange,
					itemKey: sKey,
					allowBindings: false,
					validators: [
						{
							type: "isUniqueKey",
							config: {
								keys: function () {
									return Object.keys(this.getValue());
								}.bind(this),
								currentKey: function (oPropertyEditor) {
									return oPropertyEditor.getValue();
								}
							}
						}
					]
				},
				{
					label: this.getI18nProperty("BASE_EDITOR.MAP.TYPE"),
					path: "type",
					value: sType,
					type: "select",
					items: this._supportedTypesModel.getData(),
					visible: oConfig.allowTypeChange,
					itemKey: sKey,
					allowBindings: false
				},
				{
					label: this.getI18nProperty("BASE_EDITOR.MAP.VALUE"),
					path: "value",
					value: vValue,
					type: sType && this._getAllowedTypes().includes(sType) ? sType : this._getDefaultType(vValue),
					visible: sType !== "group" && sType !== "separator",
					itemKey: sKey,
					designtime: (oDesigntime || {}).value
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
			var oNewDesigntimeMetadata = deepClone(this.getDesigntimeMetadata());
			delete oNewDesigntimeMetadata[sKeyToDelete];
			this.setDesigntimeMetadata(oNewDesigntimeMetadata);
		},

		_onAddElement: function() {
			var mParams = _merge({}, this.getValue());
			var sKey = this._getUniqueKey(mParams);
			mParams[sKey] = this.processOutputValue(this._getItemTemplate());
			this.setValue(mParams);
		},

		_moveUp: function (oEvent) {
			var iIndex = oEvent.getSource().data("index");
			if (iIndex > 0) {
				// Get the data from the model because some items from original
				// value might be filtered out
				var aValues = this._itemsModel.getData();
				this._swapPositions(aValues[iIndex].key, aValues[iIndex - 1].key);
			}
		},

		_moveDown: function (oEvent) {
			var iIndex = oEvent.getSource().data("index");
			var aValues = this._itemsModel.getData();

			if (iIndex < aValues.length - 1) {
				this._swapPositions(aValues[iIndex].key, aValues[iIndex + 1].key);
			}
		},

		_swapPositions: function (sKey1, sKey2) {
			var oNewDesigntimeMetadata = {};
			oNewDesigntimeMetadata[sKey1] = {
				__value: { position: this.getNestedDesigntimeMetadataValue(sKey2).position }
			};
			oNewDesigntimeMetadata[sKey2] = {
				__value: { position: this.getNestedDesigntimeMetadataValue(sKey1).position }
			};
			this.setDesigntimeMetadata(_merge(
				{},
				this.getDesigntimeMetadata(),
				oNewDesigntimeMetadata
			));
			this.setValue(this.getValue());
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
					oPreviousPropertyEditor.detachDesigntimeMetadataChange(this._onDesigntimeValueChange, this);
				}, this);
			}
			if (Array.isArray(aPropertyEditors)) {
				aPropertyEditors.forEach(function (oPropertyEditor) {
					oPropertyEditor.attachValueChange(this._onItemChange, this);
					oPropertyEditor.attachDesigntimeMetadataChange(this._onDesigntimeValueChange, this);
				}, this);
			}
		},

		_onItemChange: function (oEvent) {
			var sKey = oEvent.getSource().getConfig().itemKey;
			var sChangeType = oEvent.getParameter("path");

			var fnHandler = this.getItemChangeHandlers()[sChangeType];
			if (typeof fnHandler !== 'function') {
				// No specific handler is registered for the change, use generic handler
				fnHandler = this._onFieldChange;
			}

			fnHandler.call(this, sKey, oEvent);
		},

		_onDesigntimeValueChange: function (oEvent) {
			var sKey = oEvent.getSource().getConfig().itemKey;
			var sChangeType = oEvent.getParameter("path");

			// Only consider designtime metadata changes of the value field
			// to avoid conflicts with designtime metadata coming from value
			// changes directly, e.g. label change
			if (sChangeType !== "value") {
				return;
			}

			this._onDesigntimeChange(sKey, oEvent);
		},

		_onDesigntimeChange: function (sKey, oEvent) {
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
		},

		getItemChangeHandlers: function () {
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
			var sNewKey = oEvent.getParameter("value");

			if (sNewKey !== sOldKey) {
				var oNewValue = {};
				// Iterate over items to keep the order
				Object.keys(oEditorValue).forEach(function (sItemKey) {
					var sNewItemKey = sItemKey === sOldKey ? sNewKey : sItemKey;
					oNewValue[sNewItemKey] = oEditorValue[sItemKey];
				});
				if (oNewValue[sNewKey]
					&& oNewValue[sNewKey].type !== "group"
					&& oNewValue[sNewKey].type !== "separator"
					&& oNewValue[sNewKey].manifestpath
					&& oNewValue[sNewKey].manifestpath.startsWith("/sap.card/configuration/parameters/")) {
						oNewValue[sNewKey].manifestpath = "/sap.card/configuration/parameters/" + sNewKey + "/value";
				}

				this._mTypes[sNewKey] = this._mTypes[sOldKey];
				delete this._mTypes[sOldKey];

				this.setValue(oNewValue);

				var oDesigntime = _merge({}, this.getConfig().designtime);
				if (oDesigntime.hasOwnProperty(sOldKey)) {
					oDesigntime[sNewKey] = oDesigntime[sOldKey];
					if (oDesigntime[sNewKey].__value
						&& oDesigntime[sNewKey].__value.type
						&& oDesigntime[sNewKey].__value.type !== "group"
						&& oDesigntime[sNewKey].__value.type !== "separator"
						&& oDesigntime[sNewKey].__value.manifestpath) {
						oDesigntime[sNewKey].__value.manifestpath = oDesigntime[sNewKey].__value.manifestpath.replace(sOldKey, sNewKey);
					}
					delete oDesigntime[sOldKey];
					this.setDesigntimeMetadata(oDesigntime);
				}
			}
		},

		_onTypeChange: function (sKey, oEvent) {
			// Ignore changes triggered by editor initialization as the item type has not actually changed
			if (oEvent.getParameter("previousValue") === undefined) {
				return;
			}

			var oEditorValue = _merge({}, this.getValue());
			var sNewType = oEvent.getParameter("value");
			var sOldType = oEvent.getParameter("previousValue");

			if (sNewType !== sOldType) {
				var oItemToEdit = this.processInputValue(oEditorValue[sKey]);
				oItemToEdit.type = sNewType;
				oEditorValue[sKey] = this.processOutputValue(oItemToEdit);
				if (sNewType === "simpleicon") {
					oEditorValue[sKey].visualization = {
						"type": "IconSelect",
						"settings": {
							"value": "{currentSettings>value}",
							"editable": "{currentSettings>editable}"
						}
					};
				} else {
					delete oEditorValue[sKey].visualization;
				}

				if (sNewType !== "array" && sNewType !== "string" && sNewType !== "object" && sNewType !== "objectArray") {
					delete oEditorValue[sKey].values;
				}

				if (sNewType === "object" && typeof oEditorValue[sKey].value !== "object") {
					delete oEditorValue[sKey].value;
				}

				if (sNewType === "objectArray" && !(oEditorValue[sKey].value instanceof Array)) {
					delete oEditorValue[sKey].value;
				}

				this._mTypes[sKey] = sNewType;
				this.setValue(oEditorValue);

				var oDesigntime = _merge({}, this.getConfig().designtime);
				if (oDesigntime.hasOwnProperty(sKey)) {
					if (sNewType === "simpleicon") {
						oDesigntime[sKey].__value.visualization = {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						};
					} else {
						delete oDesigntime[sKey].__value.visualization;
					}
					if (sNewType !== "array" && sNewType !== "string" && sNewType !== "object" && sNewType !== "objectArray") {
						delete oDesigntime[sKey].__value.values;
					}
					oDesigntime[sKey].__value.type = sNewType;
					this.setDesigntimeMetadata(oDesigntime);
				}
			}
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

		formatAddItemText: function(sAddText, sItemLabelI18n) {
			var sItemLabel = this.getI18nProperty(sItemLabelI18n);
			return formatMessage(sAddText, [sItemLabel]);
		},

		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	MapEditor.configMetadata = Object.assign({}, BasePropertyEditor.configMetadata, {
		allowKeyChange: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		},
		allowTypeChange: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		},
		allowAddAndRemove: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		},
		allowedTypes: {
			defaultValue: ["string"],
			mergeStrategy: "intersection"
		},
		defaultType: {
			defaultValue: null
		},
		allowSorting: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		},
		includeInvalidEntries: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		},
		addItemLabelI18n: {
			defaultValue: "BASE_EDITOR.MAP.DEFAULT_TYPE"
		}
	});

	return MapEditor;
});