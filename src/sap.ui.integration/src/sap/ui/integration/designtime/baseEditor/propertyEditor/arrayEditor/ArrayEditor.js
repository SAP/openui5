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
	 * @constructor
	 * @private
	 * @experimental
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
								path: mTemplate.path.replace(":index", iIndex)
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
			var aValue = this.getConfig().value;
			aValue.splice(iIndex, 1);
			this.firePropertyChanged(aValue);
		},
		_addItem: function() {
			var aValue = this.getConfig().value || [];
			aValue.push({});
			this.firePropertyChanged(aValue);
		},

		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	return ArrayEditor;
});