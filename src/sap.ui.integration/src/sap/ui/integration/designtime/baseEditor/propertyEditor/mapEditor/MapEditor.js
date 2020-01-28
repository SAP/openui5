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

	/**
	 * @class
	 * Constructor for a new <code>MapEditor</code>.
	 * This allows you to edit key-value pairs.
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
		},

		onValueChange: function() {
			var oConfig = this.getConfig();
			if (oConfig.value) {
				var aItems = Object.keys(oConfig.value).map(function (sKey) {
					return {
						key: sKey,
						value: [{
							type: isPlainObject(oConfig.value[sKey]) ? "json" : "string",
							path: sKey,
							value: oConfig.value[sKey]
						}]
					};
				});
				this._itemsModel.setData(aItems);
			}
		},

		_onRemoveElement: function(oEvent) {
			var sKeyToDelete = oEvent.getSource().getBindingContext("itemsModel").getObject().key;
			var mParams = this.getConfig().value;
			this.fireValueChange(_omit(mParams, sKeyToDelete));
		},

		_onAddElement: function() {
			var mParams = _merge({}, this.getValue());
			var sKey = this._getUniqueKey(mParams);
			mParams[sKey] = "";
			this.fireValueChange(mParams);
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
					this.fireValueChange(oMap);
				}
			} else {
				oInput.setValueState("Error");
				oInput.setValueStateText(this.getI18nProperty("BASE_EDITOR.MAP.DUPLICATE_KEY"));
			}
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

			this.fireValueChange(oEditorValue);
		},

		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	return MapEditor;
});