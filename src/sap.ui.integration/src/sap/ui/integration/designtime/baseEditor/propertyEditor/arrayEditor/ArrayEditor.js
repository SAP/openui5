/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/base/util/deepClone",
	"sap/base/util/ObjectPath",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/restricted/_merge",
	"sap/ui/integration/designtime/baseEditor/util/binding/resolveBinding"
], function (
	BasePropertyEditor,
	deepClone,
	ObjectPath,
	JSONModel,
	_merge,
	resolveBinding
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>ArrayEditor</code>.
	 *
	 * This property editor allows you to edit arrays in a flat way.
	 *
	 * To get notified about changes made with the editor, you can use the <code>valueChange</code> event.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.arrayEditor.ArrayEditor
	 * @author SAP SE
	 * @since 1.72
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.72
	 * @ui5-restricted
	 */
	var ArrayEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.arrayEditor.ArrayEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.arrayEditor.ArrayEditor",
		metadata: {
			properties: {
				value: {
					type: "any"
				}
			}
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	ArrayEditor.prototype.init = function () {
		this._itemsModel = new JSONModel();
		this._itemsModel.setDefaultBindingMode("OneWay");
		this.setModel(this._itemsModel, "itemsModel");
		this.attachValueChange(function (oEvent) {
			var aValue = oEvent.getParameter("value");
			var oConfig = this.getConfig();

			if (oConfig.template) {
				var aItems = [];
				aValue.forEach(function(oValue, iIndex) {
					var mItem = {
						itemLabel: oConfig.itemLabel || this.getI18nProperty("BASE_EDITOR.ARRAY.ITEM_LABEL"),
						index: iIndex,
						total: aValue.length,
						properties: Object.keys(oConfig.template).map(function (sKey) {
							var mTemplate = oConfig.template[sKey];
							var sPath = iIndex + "/" + mTemplate.path;
							return _merge({}, mTemplate, {
								path: sPath,
								value: ObjectPath.get(sPath.split("/"), aValue)
							});
						}, this)
					};

					var oProxyModel = new JSONModel(oValue);
					mItem.properties = resolveBinding(
						mItem.properties,
						{
							"": oProxyModel
						},
						{
							"": oProxyModel.getContext("/")
						},
						["template", "value"]
					);
					oProxyModel.destroy();
					aItems.push(mItem);
				}, this);

				this._itemsModel.setData(aItems);
			}
		}, this);
	};

	ArrayEditor.prototype.setValue = function (aValue) {
		aValue = Array.isArray(aValue) ? aValue : [];
		BasePropertyEditor.prototype.setValue.call(this, aValue);
	};

	ArrayEditor.prototype.getExpectedWrapperCount = function (aValue) {
		return aValue.length;
	};

	ArrayEditor.prototype._removeItem = function (oEvent) {
		var iIndex = oEvent.getSource().data("index");
		var aValue = (this.getValue() || []).slice();
		aValue.splice(iIndex, 1);
		this.setValue(aValue);
	};

	ArrayEditor.prototype._addItem = function () {
		var oConfig = this.getConfig();
		var aValue = (this.getValue() || []).slice();

		var oDefaultItem = {};
		Object.keys(oConfig.template).forEach(function (sKey) {
			var mPropertyConfig = oConfig.template[sKey];
			if (mPropertyConfig.hasOwnProperty("defaultValue")) {
				var defaultValue = mPropertyConfig.defaultValue;
				oDefaultItem[sKey] = deepClone(defaultValue);
			} else if (mPropertyConfig.type === "array") {
				oDefaultItem[sKey] = [];
			}
		});
		aValue.push(oDefaultItem);
		this.setValue(aValue);
	};

	ArrayEditor.prototype._moveUp = function (oEvent) {
		var iIndex = oEvent.getSource().data("index");
		if (iIndex > 0) {
			var aValue = this.getValue().slice();
			var mRemovedItem = aValue.splice(iIndex, 1)[0];
			aValue.splice(iIndex - 1, 0, mRemovedItem);
			this.setValue(aValue);
		}
	};

	ArrayEditor.prototype._moveDown = function (oEvent) {
		var iIndex = oEvent.getSource().data("index");
		var aValue = this.getValue().slice();

		if (iIndex < aValue.length - 1) {
			var mRemovedItem = aValue.splice(iIndex, 1)[0];
			aValue.splice(iIndex + 1, 0, mRemovedItem);
			this.setValue(aValue);
		}
	};

	ArrayEditor.prototype._propertyEditorsChange = function (oEvent) {
		oEvent.getParameter("previousPropertyEditors").forEach(function (oPropertyEditor) {
			oPropertyEditor.detachValueChange(this._onPropertyValueChange, this);
		}, this);
		oEvent.getParameter("propertyEditors").forEach(function (oPropertyEditor) {
			oPropertyEditor.attachValueChange(this._onPropertyValueChange, this);
		}, this);
	};

	ArrayEditor.prototype._onPropertyValueChange = function (oEvent) {
		var aEditorValue = deepClone(this.getValue() || []);
		var sPath = oEvent.getParameter("path");
		var aParts = sPath.split("/");
		var vValue = oEvent.getParameter("value");

		ObjectPath.set(aParts, vValue, aEditorValue);

		// Unset undefined values
		if (typeof vValue === "undefined") {
			var mContainer = ObjectPath.get(aParts.slice(0, -1), aEditorValue);
			delete mContainer[aParts[aParts.length - 1]];
		}

		this.setValue(aEditorValue);
	};

	return ArrayEditor;
});