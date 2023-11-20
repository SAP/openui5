sap.ui.define([
	'sap/base/util/deepExtend',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/BindingMode',
	'sap/ui/model/json/JSONModel'
], function(deepExtend, Fragment, Controller, BindingMode, JSONModel) {
	"use strict";

	/**
	 * Please keep in mind that this is only an example in order to give an impression how you can use P13nXXXPanel's demonstrated on <code>P13nColumnsPanel</code>.
	 * The logic of controller in productive code would be much complex depending on requirements like: support of "Restore",
	 * persisting of settings using the Variant Management etc.
	 */
	return Controller.extend("sap.m.sample.P13nDialog.Page", {

		// Define initial data in oDataInitial structure which is used only in this  example.
		// In productive code, probably any table will be used in order to get the initial column information.
		oDataInitial: {
			// Static data
			Items: [
				{
					columnKey: "productId",
					text: "Product ID"
				}, {
					columnKey: "name",
					text: "Name"
				}, {
					columnKey: "category",
					text: "Category"
				}, {
					columnKey: "supplierName",
					text: "Supplier Name"
				}, {
					columnKey: "description",
					text: "Description"
				}, {
					columnKey: "weightMeasure",
					text: "Weight Measure"
				}, {
					columnKey: "weightUnit",
					text: "WeightUnit"
				}, {
					columnKey: "price",
					text: "Price"
				}, {
					columnKey: "currencyCode",
					text: "Currency Code"
				}, {
					columnKey: "status",
					text: "Status"
				}, {
					columnKey: "quantity",
					text: "Quantity"
				}, {
					columnKey: "uom",
					text: "UoM"
				}, {
					columnKey: "width",
					text: "Width"
				}, {
					columnKey: "depth",
					text: "Depth"
				}, {
					columnKey: "height",
					text: "Height"
				}, {
					columnKey: "dimUnit",
					text: "DimUnit"
				}, {
					columnKey: "productPicUrl",
					text: "ProductPicUrl"
				}
			],
			// Runtime data
			ColumnsItems: [
				{
					columnKey: "name",
					visible: true,
					index: 0
				}, {
					columnKey: "category",
					visible: true,
					index: 1
				}, {
					columnKey: "productId",
					visible: false
				}, {
					columnKey: "supplierName",
					visible: false
				}, {
					columnKey: "description",
					visible: false
				}, {
					columnKey: "weightMeasure",
					visible: false
				}, {
					columnKey: "weightUnit",
					visible: false
				}, {
					columnKey: "price",
					visible: false
				}, {
					columnKey: "currencyCode",
					visible: false
				}, {
					columnKey: "status",
					visible: false
				}, {
					columnKey: "quantity",
					visible: false
				}, {
					columnKey: "uom",
					visible: false
				}, {
					columnKey: "width",
					visible: false
				}, {
					columnKey: "depth",
					visible: false
				}, {
					columnKey: "height",
					visible: false
				}, {
					columnKey: "dimUnit",
					visible: false
				}, {
					columnKey: "productPicUrl",
					visible: false
				}
			],
			ShowResetEnabled: false
		},

		// Runtime model
		oJSONModel: null,

		oDataBeforeOpen: {},

		onInit: function() {
			this.oJSONModel = new JSONModel(deepExtend({}, this.oDataInitial));
			this.oJSONModel.setDefaultBindingMode(BindingMode.TwoWay);
		},

		onOK: function(oEvent) {
			this.oDataBeforeOpen = {};
			oEvent.getSource().close();
		},

		onCancel: function(oEvent) {
			this.oJSONModel.setProperty("/", deepExtend([], this.oDataBeforeOpen));

			this.oDataBeforeOpen = {};
			oEvent.getSource().close();
		},

		onReset: function() {
			this.oJSONModel.setProperty("/", deepExtend([], this.oDataInitial));
		},

		onPersonalizationDialogPress: function() {
			var oView = this.getView();

			if (!this._pPersonalizationDialog){
				this._pPersonalizationDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.P13nDialog.PersonalizationDialog",
					controller: this
				}).then(function(oPersonalizationDialog){
					oView.addDependent(oPersonalizationDialog);
					oPersonalizationDialog.setModel(this.oJSONModel);
					return oPersonalizationDialog;
				}.bind(this));
			}
			this._pPersonalizationDialog.then(function(oPersonalizationDialog){
				this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedColumnsItems());
				this.oDataBeforeOpen = deepExtend({}, this.oJSONModel.getData());
				oPersonalizationDialog.open();
			}.bind(this));
		},

		onChangeColumnsItems: function(oEvent) {
			this.oJSONModel.setProperty("/ColumnsItems", oEvent.getParameter("items"));
			this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedColumnsItems());
		},

		_isChangedColumnsItems: function() {
			var fnGetArrayElementByKey = function(sKey, sValue, aArray) {
				var aElements = aArray.filter(function(oElement) {
					return oElement[sKey] !== undefined && oElement[sKey] === sValue;
				});
				return aElements.length ? aElements[0] : null;
			};
			var fnGetUnion = function(aDataBase, aData) {
				if (!aData) {
					return deepExtend([], aDataBase);
				}
				var aUnion = deepExtend([], aData);
				aDataBase.forEach(function(oMItemBase) {
					var oMItemUnion = fnGetArrayElementByKey("columnKey", oMItemBase.columnKey, aUnion);
					if (!oMItemUnion) {
						aUnion.push(oMItemBase);
						return;
					}
					if (oMItemUnion.visible === undefined && oMItemBase.visible !== undefined) {
						oMItemUnion.visible = oMItemBase.visible;
					}
					if (oMItemUnion.width === undefined && oMItemBase.width !== undefined) {
						oMItemUnion.width = oMItemBase.width;
					}
					if (oMItemUnion.total === undefined && oMItemBase.total !== undefined) {
						oMItemUnion.total = oMItemBase.total;
					}
					if (oMItemUnion.index === undefined && oMItemBase.index !== undefined) {
						oMItemUnion.index = oMItemBase.index;
					}
				});
				return aUnion;
			};
			var fnIsEqual = function(aDataBase, aData) {
				if (!aData) {
					return true;
				}
				if (aDataBase.length !== aData.length) {
					return false;
				}
				var fnSort = function(a, b) {
					if (a.columnKey < b.columnKey) {
						return -1;
					} else if (a.columnKey > b.columnKey) {
						return 1;
					} else {
						return 0;
					}
				};
				aDataBase.sort(fnSort);
				aData.sort(fnSort);
				var aItemsNotEqual = aDataBase.filter(function(oDataBase, iIndex) {
					return oDataBase.columnKey !== aData[iIndex].columnKey || oDataBase.visible !== aData[iIndex].visible || oDataBase.index !== aData[iIndex].index || oDataBase.width !== aData[iIndex].width || oDataBase.total !== aData[iIndex].total;
				});
				return aItemsNotEqual.length === 0;
			};

			var aDataRuntime = fnGetUnion(this.oDataInitial.ColumnsItems, this.oJSONModel.getProperty("/ColumnsItems"));
			return !fnIsEqual(aDataRuntime, this.oDataInitial.ColumnsItems);
		}
	});
});
