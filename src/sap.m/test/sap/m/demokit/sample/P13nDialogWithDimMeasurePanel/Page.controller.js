sap.ui.define([
	'sap/base/util/deepExtend',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/BindingMode',
	'sap/ui/model/json/JSONModel'
], function(deepExtend, Fragment, Controller, BindingMode, JSONModel) {
	"use strict";

	/**
	 * Please keep in mind that this is only an example in order to give an impression how you can use P13nXXXPanel's demonstrated on
	 * <code>P13nDimMeasurePanel</code>. The logic of controller in productive code would be much complex depending on requirements
	 * like: support of "Restore", persisting of settings using the Variant Management etc.
	 */
	return Controller.extend("sap.m.sample.P13nDialogWithDimMeasurePanel.Page", {

		// Define initial data in oDataInitial structure which is used only in this  example.
		// In productive code, probably any chart will be used in order to get the initial dimension / measure information.
		oDataInitial: {
			// Static data
			Items: [
				{
					columnKey: "productId",
					text: "Product ID",
					aggregationRole: "Dimension"
				}, {
					columnKey: "name",
					text: "Name",
					aggregationRole: "Dimension"
				}, {
					columnKey: "category",
					text: "Category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "supplierName",
					text: "Supplier Name",
					aggregationRole: "Dimension"
				}, {
					columnKey: "description",
					text: "Description",
					aggregationRole: "Dimension"
				}, {
					columnKey: "weightMeasure",
					text: "Weight Measure",
					aggregationRole: "Measure"
				}, {
					columnKey: "weightUnit",
					text: "WeightUnit",
					aggregationRole: "Dimension"
				}, {
					columnKey: "price",
					text: "Price",
					aggregationRole: "Measure"
				}, {
					columnKey: "currencyCode",
					text: "Currency Code",
					aggregationRole: "Dimension"
				}, {
					columnKey: "status",
					text: "Status",
					aggregationRole: "Dimension"
				}, {
					columnKey: "quantity",
					text: "Quantity",
					aggregationRole: "Measure"
				}, {
					columnKey: "uom",
					text: "UoM",
					aggregationRole: "Dimension"
				}, {
					columnKey: "width",
					text: "Width",
					aggregationRole: "Measure"
				}, {
					columnKey: "depth",
					text: "Depth",
					aggregationRole: "Measure"
				}, {
					columnKey: "height",
					text: "Height",
					aggregationRole: "Measure"
				}, {
					columnKey: "dimUnit",
					text: "DimUnit",
					aggregationRole: "Dimension"
				}, {
					columnKey: "productPicUrl",
					text: "ProductPicUrl",
					aggregationRole: "Dimension"
				}
			],
			// Runtime data
			DimMeasureItems: [
				{
					columnKey: "name",
					visible: true,
					index: 0,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "category",
					visible: true,
					index: 1,
					role: "series",
					aggregationRole: "Dimension"
				}, {
					columnKey: "price",
					visible: true,
					index: 2,
					role: "axis1",
					aggregationRole: "Measure"
				}, {
					columnKey: "quantity",
					visible: true,
					index: 3,
					role: "axis1",
					aggregationRole: "Measure"
				}, {
					columnKey: "productId",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "supplierName",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "description",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "weightMeasure",
					visible: false,
					role: "axis1",
					aggregationRole: "Measure"
				}, {
					columnKey: "weightUnit",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "currencyCode",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "status",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "uom",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "width",
					visible: false,
					role: "axis1",
					aggregationRole: "Measure"
				}, {
					columnKey: "depth",
					visible: false,
					role: "axis1",
					aggregationRole: "Measure"
				}, {
					columnKey: "height",
					visible: false,
					role: "axis1",
					aggregationRole: "Measure"
				}, {
					columnKey: "dimUnit",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}, {
					columnKey: "productPicUrl",
					visible: false,
					role: "category",
					aggregationRole: "Dimension"
				}
			],
			SelectedChartType: "line",
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
			this.oJSONModel.setProperty("/", deepExtend({}, this.oDataBeforeOpen));

			this.oDataBeforeOpen = {};
			oEvent.getSource().close();
		},

		onReset: function() {
			this.oJSONModel.setProperty("/", deepExtend({}, this.oDataInitial));
		},

		onPersonalizationDialogPress: function() {
			var oView = this.getView();

			if (!this._pPersonalizationDialog) {
				this._pPersonalizationDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.P13nDialogWithDimMeasurePanel.PersonalizationDialog",
					controller: this
				}).then(function (oPersonalizationDialog) {
					oView.addDependent(oPersonalizationDialog);
					oPersonalizationDialog.setModel(this.oJSONModel);
					return oPersonalizationDialog;
				}.bind(this));
			}

			this._pPersonalizationDialog.then(function(oPersonalizationDialog){
				this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedDimMeasureItems());
				this.oDataBeforeOpen = deepExtend({}, this.oJSONModel.getData());
				oPersonalizationDialog.open();
			}.bind(this));
		},

		onChangeChartType: function(oEvent) {
			this.oJSONModel.setProperty("/SelectedChartType", oEvent.getParameter("chartTypeKey"));
			this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedDimMeasureItems());
		},

		onChangeDimMeasureItems: function(oEvent) {
			this.oJSONModel.setProperty("/DimMeasureItems", oEvent.getParameter("items"));
			this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedDimMeasureItems());
		},

		_isChangedDimMeasureItems: function() {
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
					if (oMItemUnion.index === undefined && oMItemBase.index !== undefined) {
						oMItemUnion.index = oMItemBase.index;
					}
					if (oMItemUnion.role === undefined && oMItemBase.role !== undefined) {
						oMItemUnion.role = oMItemBase.role;
					}
					if (oMItemUnion.aggregationRole === undefined && oMItemBase.aggregationRole !== undefined) {
						oMItemUnion.aggregationRole = oMItemBase.aggregationRole;
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
					return oDataBase.columnKey !== aData[iIndex].columnKey || oDataBase.visible !== aData[iIndex].visible || oDataBase.index !== aData[iIndex].index || oDataBase.role !== aData[iIndex].role || oDataBase.aggregationRole !== aData[iIndex].aggregationRole;
				});
				return aItemsNotEqual.length === 0;
			};
			if (this.oDataInitial.SelectedChartType !== this.oJSONModel.getProperty("/SelectedChartType")) {
				return true;
			}

			var aDataRuntime = fnGetUnion(this.oDataInitial.DimMeasureItems, this.oJSONModel.getProperty("/DimMeasureItems"));
			return !fnIsEqual(aDataRuntime, this.oDataInitial.DimMeasureItems);
		}
	});
});
