/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/base/util/deepClone",
	"sap/base/util/ObjectPath",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/restricted/_merge",
	"sap/base/util/restricted/_omit",
	"sap/base/util/isPlainObject"
], function (
	BasePropertyEditor,
	deepClone,
	ObjectPath,
	JSONModel,
	_merge,
	_omit,
	isPlainObject
) {
	"use strict";

	// Possible types that are supported by the map editor
	var SUPPORTED_TYPES = {
		"json": "BASE_EDITOR.MAP.TYPES.OBJECT",
		"string": "BASE_EDITOR.MAP.TYPES.STRING",
		"boolean": "BASE_EDITOR.MAP.TYPES.BOOLEAN",
		"number": "BASE_EDITOR.MAP.TYPES.NUMBER"
	};

	/**
	 * @class
	 * Constructor for a new <code>MapEditor</code> for editing key-value pairs with primitive values.
	 * To get notified about changes made with the editor, you can attach a handler to the <code>valueChange</code> event.
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
					this._supportedTypesModel.setData(Object.keys(SUPPORTED_TYPES).map(function (sKey) {
						return {
							key: sKey,
							label: oResourceBundle.getText(SUPPORTED_TYPES[sKey])
						};
					}));
				}
			}, this);
			this._mTypes = {};
		},

		setValue: function(mValue) {
			mValue = isPlainObject(mValue) ? mValue : {};

			var aItems = Object.keys(mValue).map(function (sKey) {
				var vValue = this.formatInputValue(mValue[sKey]);
				if (!this._mTypes[sKey]) {
					// Initialize type based on value
					this._mTypes[sKey] = isPlainObject(vValue) ? "json" : "string";
				}
				return {
					key: sKey,
					value: [{
						type: this._mTypes[sKey],
						path: sKey,
						value: vValue
					}]
				};
			}, this);

			this._itemsModel.setData(aItems);
			BasePropertyEditor.prototype.setValue.call(this, mValue);
		},

		getExpectedWrapperCount: function (mValue) {
			return Object.keys(mValue).length;
		},

		/**
		 * Hook which is called from <code>setValue</code> for every map item value. Can be overridden in order to format the value to fit the editor's requirements.
		 * @param {object} oValue - Original map item value
		 * @returns {object} Formatted map item value
		 */
		formatInputValue: function(oValue) {
			return oValue;
		},

		_onRemoveElement: function(oEvent) {
			var sKeyToDelete = oEvent.getSource().getBindingContext("itemsModel").getObject().key;
			var mValue = this.getValue();
			this.setValue(_omit(mValue, sKeyToDelete));
		},

		_onAddElement: function() {
			var mParams = _merge({}, this.getValue());
			var sKey = this._getUniqueKey(mParams);
			mParams[sKey] = "";
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

			var aKeys = aItems.map(function (oItem) {
				return oItem.key;
			});
			var iElementToModifyIndex = aKeys.indexOf(sOldKey);

			if (iElementToModifyIndex >= 0 && (aKeys.indexOf(sNewKey) < 0 || sNewKey === sOldKey)) {
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
						oMap[oItem.key] = oItem.value[0].value;
					});
					this.setValue(oMap);
				}
			} else {
				oInput.setValueState("Error");
				oInput.setValueStateText(this.getI18nProperty("BASE_EDITOR.MAP.DUPLICATE_KEY"));
			}
		},

		_onTypeChange: function (oEvent, sKey) {
			this._mTypes[sKey] = oEvent.getParameter("selectedItem").getKey();
			this.setValue(this.getValue());
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
			var sPath = oEvent.getParameter("path");
			var aParts = sPath.split("/");
			var vValue = oEvent.getParameter("value");

			ObjectPath.set(aParts, vValue, oEditorValue);

			this.setValue(oEditorValue);
		},

		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	return MapEditor;
});