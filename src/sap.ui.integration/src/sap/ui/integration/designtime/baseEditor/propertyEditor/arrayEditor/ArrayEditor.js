/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/base/util/deepClone",
	"sap/ui/core/Fragment",
	"sap/base/util/ObjectPath",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/restricted/_merge"
], function (
	BasePropertyEditor,
	deepClone,
	Fragment,
	ObjectPath,
	JSONModel,
	_merge
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>ArrayEditor</code>.
	 *
	 * This property editor allows you to edit arrays in a flat way.
	 *
	 * To get notified about changes made with the editor, you can use the <code>propertyChange</code> event.
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
		metadata: {
			properties: {
				value: {
					type: "any"
				}
			},
			events: {
				"ready" : {}
			}
		},
		constructor: function() {
			BasePropertyEditor.prototype.constructor.apply(this, arguments);

			this._itemsModel = new JSONModel();
			this.setModel(this._itemsModel, "itemsModel");

			Fragment.load({
				name: "sap.ui.integration.designtime.baseEditor.propertyEditor.arrayEditor.ArrayEditor",
				controller: this
			}).then(function(oContainer) {

				this.addContent(oContainer);
				this.fireReady();
			}.bind(this));
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	ArrayEditor.prototype.onValueChange = function () {
		var vReturn = BasePropertyEditor.prototype.onValueChange.apply(this, arguments);
		var oConfig = this.getConfig();
		if (oConfig.value && oConfig.template) {
			var aItems = [];
			oConfig.value.forEach(function(oValue, iIndex) {
				var mItem = {
					itemLabel: oConfig.itemLabel || "{i18n>BASE_EDITOR.ARRAY.ITEM_LABEL}",
					index: iIndex,
					total: oConfig.value.length,
					properties: Object.keys(oConfig.template).map(function (sKey) {
						var mTemplate = oConfig.template[sKey];
						var sPath = iIndex + "/" + mTemplate.path;
						return _merge({}, mTemplate, {
							path: sPath,
							value: ObjectPath.get(sPath.split("/"), this.getValue())
						});
					}, this)
				};
				aItems.push(mItem);
			}, this);
			this._itemsModel.setData(aItems);
		}
		return vReturn;
	};

	ArrayEditor.prototype._removeItem = function (oEvent) {
		var iIndex = oEvent.getSource().data("index");
		var aValue = this.getModel("_context").getProperty("/" + this.getConfig().path).slice();
		aValue.splice(iIndex, 1);
		this.firePropertyChange(aValue);
	};

	ArrayEditor.prototype._addItem = function () {
		var oConfig = this.getConfig();
		var aValue = (this.getModel("_context").getProperty("/" + oConfig.path) || []).slice();
		// Workaround:
		// Create a default array item
		// This solution does not support nested arrays
		var oDefaultItem = {};
		Object.keys(oConfig.template).forEach(function (sKey) {
			var defaultValue = oConfig.template[sKey].defaultValue;
			if (oConfig.template[sKey].hasOwnProperty("defaultValue")) {
				oDefaultItem[sKey] = deepClone(defaultValue);
			}
		});
		aValue.push(oDefaultItem);
		this.firePropertyChange(aValue);
	};

	ArrayEditor.prototype._propertyEditorsChange = function (oEvent) {
		oEvent.getParameter("previousPropertyEditors").forEach(function (oPropertyEditor) {
			oPropertyEditor.detachPropertyChange(this._onPropertyValueChange, this);
		}, this);
		oEvent.getParameter("propertyEditors").forEach(function (oPropertyEditor) {
			oPropertyEditor.attachPropertyChange(this._onPropertyValueChange, this);
		}, this);
	};

	ArrayEditor.prototype._onPropertyValueChange = function (oEvent) {
		var aEditorValue = (this.getValue() || []).slice();
		var sPath = oEvent.getParameter("path");
		var aParts = sPath.split("/");
		var vValue = oEvent.getParameter("value");

		ObjectPath.set(aParts, vValue, aEditorValue);

		this.firePropertyChange(aEditorValue);
	};

	return ArrayEditor;
});