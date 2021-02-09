/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/editor/fields/BaseField",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/MultiComboBox",
	"sap/ui/core/ListItem",
	"sap/base/util/each",
	"sap/base/util/restricted/_debounce",
	"sap/base/util/ObjectPath",
	"sap/base/util/includes"
], function (
	BaseField, Input, Text, MultiComboBox, ListItem, each, _debounce, ObjectPath, includes
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.designtime.editor.fields.BaseField
	 * @alias sap.ui.integration.designtime.editor.fields.ListField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var ListField = BaseField.extend("sap.ui.integration.designtime.editor.fields.ListField", {
		renderer: BaseField.getMetadata().getRenderer()
	});

	ListField.prototype.initVisualization = function (oConfig) {
		var that = this;
		var oVisualization = oConfig.visualization;
		if (!oVisualization) {
			if (oConfig.editable) {
				if (oConfig.values) {
					var oItem = new ListItem(oConfig.values.item);
					oVisualization = {
						type: MultiComboBox,
						settings: {
							selectedKeys: {
								path: 'currentSettings>value'
							},
							editable: { path: 'currentSettings>editable' },
							showSecondaryValues: true,
							width: "100%",
							items: {
								path: "", //empty, because the bindingContext for the undefined model already points to the path
								template: oItem
							}
						}
					};
					if (this.isFilterBackend(oConfig)) {
						oVisualization.settings.selectedKeys = {
							parts: [
								'currentSettings>value',
								'currentSettings>suggestValue'
							],
							formatter: function(sValue, sSuggestValue) {
								if (sSuggestValue) {
									//set suggest value in the input field of the MultiComboBox
									that.setSuggestValue();
								}
								return sValue;
							}
						};
					}
				} else {
					oVisualization = {
						type: Input,
						settings: {
							value: {
								path: 'currentSettings>value',
								formatter: function (a) {
									a = a || [];
									return a.join(",");
								}
							},
							change: function (oEvent) {
								var oSource = oEvent.getSource();
								oSource.getBinding("value").setRawValue(oSource.getValue().split(","));
							},
							editable: oConfig.editable,
							placeholder: oConfig.placeholder
						}
					};
				}
			} else {
				oVisualization = {
					type: Text,
					settings: {
						text: {
							path: 'currentSettings>value'
						},
						wrapping: false
					}
				};
			}
		}
		this._visualization = oVisualization;
		this.attachAfterInit(this._afterInit);
	};

	ListField.prototype._afterInit = function () {
		var oControl = this.getAggregation("_field");
		if (oControl instanceof MultiComboBox) {
			var oConfig = this.getConfiguration();
			if (this.isFilterBackend(oConfig)) {
				this.onInput = _debounce(this.onInput, 500);
				//if need to filter backend by input value, need to hook the onInput function which only support filter locally.
				oControl.oninput = this.onInput;
				//listen to the selectionChange event of MultiComboBox
				oControl.attachSelectionChange(this.onSelectionChange);
				//listen to the selectionFinish event of MultiComboBox
				oControl.attachSelectionFinish(this.onSelectionFinish);
				var oModel = this.getModel();
				//merge the previous selected items with new items got from request
				oModel.attachPropertyChange(this.mergeSelectedItems, this);
			}
		}
	};

	ListField.prototype.mergeSelectedItems = function(oEvent) {
		var oConfig = this.getConfiguration();
		if (this._aSelectedItems && this._aSelectedItems.length > 0) {
			var sPath = oConfig.values.data.path || "/";
			var oValueModel = this.getModel();
			var oData = oValueModel.getData();

			if (sPath !== "/") {
				//get data path
				if (sPath.startsWith("/")) {
					sPath = sPath.substring(1);
				}
				if (sPath.endsWith("/")) {
					sPath = sPath.substring(0, sPath.length - 1);
				}
				var aPath = sPath.split("/");
				//get new items
				var oResult = ObjectPath.get(aPath, oData);
				if (Array.isArray(oResult)) {
					var sKey = oConfig.values.item.key;
					if (sKey.startsWith("{")) {
						sKey = sKey.substring(1);
					}
					if (sKey.endsWith("}")) {
						sKey = sKey.substring(0, sKey.length - 1);
					}
					//get keys of preview selected items
					var aSelectedItemKeys = this._aSelectedItems.map(function (oSelectedElement) {
						return oSelectedElement[sKey];
					});
					//filter the new items to remove the exist ones according by the keys
					var oNotSelectedItems = oResult.filter(function (item) {
						return !includes(aSelectedItemKeys, item[sKey].toString());
					});
					//concat the filtered items to the previous selected items
					oResult = this._aSelectedItems.concat(oNotSelectedItems);
				} else {
					oResult = this._aSelectedItems;
				}
				ObjectPath.set(aPath, oResult, oData);
			} else if (Array.isArray(oData)) {
				oData = this._aSelectedItems.concat(oData);
			} else {
				oData = this._aSelectedItems;
			}
			oValueModel.setData(oData);
			this.setSuggestValue();
		}
	};

	ListField.prototype.setSuggestValue = function() {
		var oControl = this.getAggregation("_field");
		var sSettingspath = this.getBindingContext("currentSettings").sPath;
		var oSettingsModel = this.getModel("currentSettings");
		var sSuggestValue = oSettingsModel.getProperty(sSettingspath + "/suggestValue");
		if (sSuggestValue && sSuggestValue !== "") {
			//set the input field value to the suggest value of the MultiComboBox
			oControl.setValue(sSuggestValue);
		}
	};

	ListField.prototype.onSelectionChange = function(oEvent) {
		var oField = oEvent.oSource.getParent();
		var oListItem = oEvent.getParameter("changedItem");
		var sItemKey = oListItem.getKey();
		var bIsSelected = oEvent.getParameter("selected");

		//get column name of the key
		var oConfig = oField.getConfiguration();
		var sKey = oConfig.values.item.key;
		if (sKey.startsWith("{")) {
			sKey = sKey.substring(1);
		}
		if (sKey.endsWith("}")) {
			sKey = sKey.substring(0, sKey.length - 1);
		}

		//update the selected item list
		if (!bIsSelected) {
			//remove the diselected item from current selected item list
			if (oField._aSelectedItems) {
				oField._aSelectedItems = oField._aSelectedItems.filter(function (oSelectedElement) {
					return oSelectedElement[sKey].toString() !== sItemKey;
				});
			}
		} else {
			//get items in data model
			var oData = this.getModel().getData();
			var sPath = oConfig.values.data.path || "/";
			if (sPath !== "/") {
				if (sPath.startsWith("/")) {
					sPath = sPath.substring(1);
				}
				if (sPath.endsWith("/")) {
					sPath = sPath.substring(0, sPath.length - 1);
				}
				var aPath = sPath.split("/");
				oData = ObjectPath.get(aPath, oData);
			}

			if (oData) {
				if (!oField._aSelectedItems) {
					//initial the selected item list
					oField._aSelectedItems = [];
				}
				//add the selected item into selected item list
				oData.forEach(function (oItem) {
					if (oItem[sKey].toString() === sItemKey) {
						oField._aSelectedItems = oField._aSelectedItems.concat([oItem]);
					}
				});
			}
		}

		//get selected keys of the selected items
		var aSelectedItemKeys = oField._aSelectedItems.map(function (oSelectedElement) {
			return oSelectedElement[sKey];
		});

		//save the selected keys as field value
		var sSettingspath = this.getBindingContext("currentSettings").sPath;
		var oSettingsModel = this.getModel("currentSettings");
		oSettingsModel.setProperty(sSettingspath + "/value", aSelectedItemKeys);
	};

	ListField.prototype.onSelectionFinish = function(oEvent) {
		//get the keys of the selected items
		var aSelectedItemKeys = oEvent.getParameter("selectedItems").map(function (oSelectedElement) {
			return oSelectedElement.getKey();
		});
		var oField = this.getParent();
		//get column name of the key
		var oConfig = oField.getConfiguration();
		var sKey = oConfig.values.item.key;
		if (sKey.startsWith("{")) {
			sKey = sKey.substring(1);
		}
		if (sKey.endsWith("}")) {
			sKey = sKey.substring(0, sKey.length - 1);
		}

		//get the selected items in the data model by the keys
		var oData = this.getModel().getData();
		var sPath = oConfig.values.data.path || "/";
		if (sPath !== "/") {
			if (sPath.startsWith("/")) {
				sPath = sPath.substring(1);
			}
			if (sPath.endsWith("/")) {
				sPath = sPath.substring(0, sPath.length - 1);
			}
			var aPath = sPath.split("/");
			oData = ObjectPath.get(aPath, oData);
		}
		if (oData) {
			oField._aSelectedItems = oData.filter(function (oSelectedElement) {
				return includes(aSelectedItemKeys, oSelectedElement[sKey].toString());
			});
		}

		var sSettingspath = this.getBindingContext("currentSettings").sPath;
		var oSettingsModel = this.getModel("currentSettings");
		//save the selected keys as field value
		oSettingsModel.setProperty(sSettingspath + "/value", aSelectedItemKeys);
		//clean the suggestion value
		oSettingsModel.setProperty(sSettingspath + "/suggestValue", "");
	};

	ListField.prototype.onInput = function (oEvent) {
		//get the suggestion value
		var sTerm = oEvent.target.value;
		var sSettingspath = this.getBindingContext("currentSettings").sPath;
		var oSettingsModel = this.getModel("currentSettings");
		//set the suggestion value into data model property "suggestValue" for filter backend
		oSettingsModel.setProperty(sSettingspath + "/suggestValue", sTerm);
		oSettingsModel.setProperty(sSettingspath + "/_loading", true);
		//update the dependent fields via bindings
		var aBindings = oSettingsModel.getBindings();
		var sParameter = sSettingspath.substring(sSettingspath.lastIndexOf("/") + 1);
		each(aBindings, function(iIndex, oBinding) {
			if (oBinding.sPath === "/form/items/" + sParameter + "/value") {
				oBinding.checkUpdate(true);
			}
		});
		oEvent.srcControl.open();
		oEvent.srcControl._getSuggestionsPopover()._sTypedInValue = sTerm;
	};

	return ListField;
});