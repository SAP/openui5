/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/base/util/deepClone",
	"sap/m/VBox",
	"sap/m/Bar",
	"sap/m/Label",
	"sap/m/Button"
], function (
	BasePropertyEditor,
	deepClone,
	VBox,
	Bar,
	Label,
	Button
) {
	"use strict";

	/**
	 * @constructor
	 * @private
	 * @experimental
	 */
	var ArrayEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.arrayEditor.ArrayEditor", {
		constructor: function() {
			BasePropertyEditor.prototype.constructor.apply(this, arguments);
			var oContainer = new VBox();
			this.addContent(oContainer);

			oContainer.bindAggregation("items", "items", function(sId, oItemContext) {
				var oItem = oItemContext.getObject();
				var iIndex = this.getConfig().items.indexOf(oItem);

				var oGroup = new VBox({
					items: new Bar({
						contentLeft: [
							new Label({
								text: this.getConfig().itemLabel || "{i18n>BASE_EDITOR.ARRAY.ITEM_LABEL}"
							})
						],
						contentRight: [
							new Button({
								icon: "sap-icon://less",
								tooltip: "{i18n>BASE_EDITOR.ARRAY.REMOVE}",
								press: function(iIndex) {
									var aValue = this.getConfig().value;
									aValue.splice(iIndex, 1);
									this.firePropertyChanged(aValue);
								}.bind(this, iIndex)
							})
						]
					})
				});

				Promise.all(
					Object.keys(oItem).map(function(sItemProperty) {
						var oItemConfig = oItem[sItemProperty];
						return this.getEditor().createPropertyEditor(oItemConfig);
					}.bind(this))
				).then(function (aPropertyEditors) {
					aPropertyEditors.forEach(function (oPropertyEditor) {
						oPropertyEditor.getLabel().setDesign("Standard");
						oGroup.addItem(oPropertyEditor);
					});
				});

				return oGroup;

			}.bind(this));

			this.addContent(new Bar({
				contentRight: [
					new Button({
						icon: "sap-icon://add",
						tooltip: "{i18n>BASE_EDITOR.ARRAY.ADD}",
						enabled: "{= (${items} || []).length < ${maxItems} }",
						press: function() {
							var aValue = this.getConfig().value || [];
							aValue.push({});
							this.firePropertyChanged(aValue);
						}.bind(this)
					})
				]
			}));
		},
		onValueChange: function() {
			var vReturn = BasePropertyEditor.prototype.onValueChange.apply(this, arguments);
			var oConfig = this.getConfig();
			if (oConfig.value && oConfig.template) {
				oConfig.items = [];
				oConfig.value.forEach(function(oValue, iIndex) {
					var mItem = deepClone(oConfig.template);
					Object.keys(mItem).forEach(function(sKey) {
						var oItemProperty = mItem[sKey];
						if (oItemProperty.path) {
							oItemProperty.path = oItemProperty.path.replace(":index", iIndex);
						}
					});
					oConfig.items.push(mItem);
				});
				this.getModel().checkUpdate();
			}
			return vReturn;
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	return ArrayEditor;
});