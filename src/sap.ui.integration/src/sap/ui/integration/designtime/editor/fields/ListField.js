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
	var sDefaultSeperator = "/";

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
				this.prepareFieldsInKey(oConfig);
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

	ListField.prototype.prepareFieldsInKey = function(oConfig) {
		//get field names in the item key
		this._sKeySeparator = oConfig.values.keySeparator;
		if (!this._sKeySeparator) {
			this._sKeySeparator = sDefaultSeperator;
		}
		var sKey = oConfig.values.item.key;
		this._aFields = sKey.split(this._sKeySeparator);
		for (var n in this._aFields) {
			//remove the {} in the field
			if (this._aFields[n].startsWith("{")) {
				this._aFields[n] = this._aFields[n].substring(1);
			}
			if (this._aFields[n].endsWith("}")) {
				this._aFields[n] = this._aFields[n].substring(0, this._aFields[n].length - 1);
			}
		}
	};

	ListField.prototype.getKeyFromItem = function(oItem) {
		var sItemKey = "";
		this._aFields.forEach(function (field) {
			sItemKey += oItem[field].toString() + this._sKeySeparator;
		}.bind(this));
		if (sItemKey.endsWith(this._sKeySeparator)) {
			sItemKey = sItemKey.substring(0, sItemKey.length - this._sKeySeparator.length);
		}
		return sItemKey;
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
					//get keys of preview selected items
					var aSelectedItemKeys = this._aSelectedItems.map(function (oSelectedItem) {
						return this.getKeyFromItem(oSelectedItem);
					}.bind(this));
					//filter the new items to remove the exist ones according by the keys
					var oNotSelectedItems = oResult.filter(function (item) {
						var sItemKey = this.getKeyFromItem(item);
						return !includes(aSelectedItemKeys, sItemKey);
					}.bind(this));
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
		var oConfig = oField.getConfiguration();
		var oListItem = oEvent.getParameter("changedItem");
		var sChangedItemKey = oListItem.getKey();
		var bIsSelected = oEvent.getParameter("selected");

		//update the selected item list
		if (!bIsSelected) {
			//remove the diselected item from current selected item list
			if (oField._aSelectedItems) {
				oField._aSelectedItems = oField._aSelectedItems.filter(function (oSelectedItem) {
					var sItemKey = oField.getKeyFromItem(oSelectedItem);
					return sItemKey !== sChangedItemKey;
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
				oData.some(function (oItem) {
					var sItemKey = oField.getKeyFromItem(oItem);
					if (sItemKey === sChangedItemKey) {
						oField._aSelectedItems = oField._aSelectedItems.concat([oItem]);
						return true;
					}
					return false;
				});
			}
		}

		//get selected keys of the selected items
		var aSelectedItemKeys = oField._aSelectedItems.map(function (oSelectedItem) {
			return oField.getKeyFromItem(oSelectedItem);
		});

		//save the selected keys as field value
		var sSettingspath = this.getBindingContext("currentSettings").sPath;
		var oSettingsModel = this.getModel("currentSettings");
		oSettingsModel.setProperty(sSettingspath + "/value", aSelectedItemKeys);
	};

	ListField.prototype.onSelectionFinish = function(oEvent) {
		var oField = this.getParent();
		var oConfig = oField.getConfiguration();

		//get the keys of the selected items
		var aSelectedItemKeys = oEvent.getParameter("selectedItems").map(function (oSelectedItem) {
			return oSelectedItem.getKey();
		});

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
			oField._aSelectedItems = oData.filter(function (oItem) {
				var sItemKey = oField.getKeyFromItem(oItem);
				return includes(aSelectedItemKeys, sItemKey);
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