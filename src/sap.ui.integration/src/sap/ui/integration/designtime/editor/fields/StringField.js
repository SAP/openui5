/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/editor/fields/BaseField",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/Select",
	"sap/m/ComboBox",
	"sap/ui/core/ListItem",
	"./viz/IconSelect",
	"sap/base/util/each",
	"sap/base/util/restricted/_debounce"
], function (
	BaseField, Input, Text, Select, ComboBox, ListItem, IconSelect, each, _debounce
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.designtime.editor.fields.BaseField
	 * @alias sap.ui.integration.designtime.editor.fields.StringField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var StringField = BaseField.extend("sap.ui.integration.designtime.editor.fields.StringField", {
		renderer: BaseField.getMetadata().getRenderer()
	});

	StringField.prototype.initVisualization = function (oConfig) {
		var oVisualization = oConfig.visualization;
		if (!oVisualization) {
			if (oConfig.editable) {
				if (oConfig.enum) {
					var oItem = new ListItem({
						key: {
							path: "currentSettings>"
						},
						text: {
							path: "currentSettings>"
						}
					});
					oVisualization = {
						type: Select,
						settings: {
							selectedKey: {
								path: 'currentSettings>value'
							},
							forceSelection: false,
							editable: oConfig.editable,
							showSecondaryValues: false,
							width: "100%",
							items: {
								path: "currentSettings>enum", //empty, because the bindingContext for the undefined model already points to the path
								template: oItem
							}
						}
					};
				} else if (oConfig.values) {
					var oItem = new ListItem(oConfig.values.item);
					if (!oConfig.values.item.key) {
						oConfig.values.item.key = oConfig.values.item.text;
					}
					oVisualization = {
						type: ComboBox,
						settings: {
							busy: { path: 'currentSettings>_loading' },
							selectedKey: {
								path: 'currentSettings>value'
							},
							editable: oConfig.editable,
							showSecondaryValues: true,
							width: "100%",
							items: {
								path: "", //empty, because the bindingContext for the undefined model already points to the path
								template: oItem
							}
						}
					};
					//check if need to filter backend
					if (this.isFilterBackend(oConfig)) {
						oVisualization.settings.selectedKey = {
							parts: [
								'currentSettings>value',
								'currentSettings>suggestValue'
							],
							formatter: function(sValue, sSuggestValue) {
								if ((!sValue || sValue === "") && sSuggestValue) {
									return sSuggestValue;
								} else {
									return sValue;
								}
							}
						};
					}
				} else {
					oVisualization = {
						type: Input,
						settings: {
							value: {
								path: 'currentSettings>value'
							},
							editable: oConfig.editable,
							placeholder: oConfig.placeholder
						}
					};
				}
			} else if (this.getMode() === "translation") {
				oVisualization = {
					type: Text,
					settings: {
						text: {
							path: 'currentSettings>value'
						},
						wrapping: false
					}
				};
			} else {
				oVisualization = {
					type: Input,
					settings: {
						value: {
							path: 'currentSettings>value'
						},
						editable: false
					}
				};
			}
		}
		this._visualization = oVisualization;
		this.attachAfterInit(this._afterInit);
	};

	StringField.prototype._afterInit = function () {
		var oControl = this.getAggregation("_field");
		if (oControl instanceof ComboBox) {
			var oConfig = this.getConfiguration();
			if (this.isFilterBackend(oConfig)) {
				this.onInput = _debounce(this.onInput, 500);
				//if need to filter backend by input value, need to hook the onInput function which only support filter locally.
				oControl.oninput = this.onInput;
				//listen to the selectionChange event of Combobox
				oControl.attachSelectionChange(this.onSelectionChange);
			}
		}
	};

	StringField.prototype.onSelectionChange = function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem") || {};
		var sKey = oSelectedItem.getKey();
		var sSettingspath = this.getBindingContext("currentSettings").sPath;
		var oSettingsModel = this.getModel("currentSettings");
		oSettingsModel.setProperty(sSettingspath + "/value", sKey);
		//oSettingsModel.setProperty(sSettingspath + "/suggestValue", "");
	};

	StringField.prototype.onInput = function (oEvent) {
		//get the suggestion value in the input field of the ComoboBox
		var sTerm = oEvent.target.value;
		var sSettingspath = this.getBindingContext("currentSettings").sPath;
		var oSettingsModel = this.getModel("currentSettings");
		//set the suggestion value into data model property "suggestValue" for filter backend
		oSettingsModel.setProperty(sSettingspath + "/suggestValue", sTerm);
		oSettingsModel.setProperty(sSettingspath + "/_loading", true);
		//clean the value in data model
		oSettingsModel.setProperty(sSettingspath + "/value", "");
		//update the dependent fields via bindings
		var aBindings = oSettingsModel.getBindings();
		var sParameter = sSettingspath.substring(sSettingspath.lastIndexOf("/") + 1);
		each(aBindings, function(iIndex, oBinding) {
			if (oBinding.sPath === "/form/items/" + sParameter + "/value") {
				oBinding.checkUpdate(true);
			}
		});
		var oComboBox = oEvent.srcControl;
		//open the popup dialog
		oComboBox.open();
		//set the suggestion value to the input field of the ComboBox
		oComboBox.setValue(sTerm);
		//remove the previous selection
		oComboBox.setSelection(null);
	};

	return StringField;
});