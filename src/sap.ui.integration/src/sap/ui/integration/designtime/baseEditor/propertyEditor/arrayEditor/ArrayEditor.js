/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/base/util/deepClone",
	"sap/ui/core/Fragment",
	"sap/base/util/restricted/_merge"
], function (
	BasePropertyEditor,
	deepClone,
	Fragment,
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
			events: {
				"ready" : {}
			}
		},
		constructor: function() {
			BasePropertyEditor.prototype.constructor.apply(this, arguments);

			Fragment.load({
				name: "sap.ui.integration.designtime.baseEditor.propertyEditor.arrayEditor.ArrayEditor",
				controller: this
			}).then(function(oContainer) {

				this.addContent(oContainer);

				this.fireReady();
			}.bind(this));
		},
		onValueChange: function() {
			var vReturn = BasePropertyEditor.prototype.onValueChange.apply(this, arguments);
			var oConfig = this.getConfig();
			if (oConfig.value && oConfig.template) {
				oConfig.items = [];
				oConfig.value.forEach(function(oValue, iIndex) {
					var mItem = {
						itemLabel: oConfig.itemLabel || "{i18n>BASE_EDITOR.ARRAY.ITEM_LABEL}",
						index: iIndex,
						properties: Object.keys(oConfig.template).map(function (sKey) {
							var mTemplate = oConfig.template[sKey];
							return _merge({}, mTemplate, {
								path: oConfig.path + "/" + iIndex + "/" + mTemplate.path
							});
						})
					};
					oConfig.items.push(mItem);
				});
				this.getModel().checkUpdate();
			}
			return vReturn;
		},
		_removeItem: function(oEvent) {
			var iIndex = oEvent.getSource().data("index");
			var aValue = this.getModel("_context").getProperty("/" + this.getConfig().path).slice();
			aValue.splice(iIndex, 1);
			this.firePropertyChange(aValue);
		},
		_addItem: function() {
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
		},

		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	return ArrayEditor;
});