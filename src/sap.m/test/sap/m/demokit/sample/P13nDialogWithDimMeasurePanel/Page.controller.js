sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/Fragment', 'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'
], function(jQuery, Fragment, Controller, JSONModel) {
	"use strict";

	/**
	 * Please keep in mind that this is only an example in order to give an impression how you can use P13nXXXPanel's demonstrated on
	 * <code>P13nDimMeasurePanel</code>. The logic of controller in productive code would be much complex depending on requirements
	 * like: support of "Restore", persisting of settings using the Variant Management.
	 */
	var PageController = Controller.extend("sap.m.sample.P13nDialogWithDimMeasurePanel.Page", {

		oJSONModel: new JSONModel("test-resources/sap/m/demokit/sample/P13nDialogWithDimMeasurePanel/products.json"),
		oDataInitial: {},
		oDataBeforeOpen: {},

		onInit: function() {
			var that = this;
			this.oJSONModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			this.oJSONModel.attachRequestCompleted(function() {
				that.oDataInitial = jQuery.extend(true, {}, this.getProperty("/"));
			});
		},

		onOK: function(oEvent) {
			this.oDataBeforeOpen = {};
			oEvent.getSource().close();
		},

		onCancel: function(oEvent) {
			this.oJSONModel.setProperty("/", jQuery.extend(true, [], this.oDataBeforeOpen));

			this.oDataBeforeOpen = {};
			oEvent.getSource().close();
		},

		onReset: function() {
			this.oJSONModel.setProperty("/", jQuery.extend(true, [], this.oDataInitial));
		},

		onPersonalizationDialogPress: function() {
			var oPersonalizationDialog = sap.ui.xmlfragment("sap.m.sample.P13nDialogWithDimMeasurePanel.PersonalizationDialog", this);
			this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedDimMeasureItems());
			oPersonalizationDialog.setModel(this.oJSONModel);

			this.getView().addDependent(oPersonalizationDialog);

			this.oDataBeforeOpen = jQuery.extend(true, {}, this.oJSONModel.getProperty("/"));
			oPersonalizationDialog.open();
		},

		onChangeChartType: function(oEvent) {
			this.oJSONModel.setProperty("/SelectedChartType", oEvent.getParameter("chartTypeKey"));
		},

		onChangeDimMeasureItems: function(oEvent) {
			var aMDimMeasureItems = oEvent.getParameter("items").map(function(oMChangedDimMeasureItem) {
				return oMChangedDimMeasureItem;
			});
			this.oJSONModel.setProperty("/DimMeasureItems", aMDimMeasureItems);
		},

		_isChangedDimMeasureItems: function() {
			var fnGetUnion = function(aDataBase, aData) {
				if (!aData) {
					return jQuery.extend(true, [], aDataBase);
				}
				return jQuery.extend(true, [], aData);
			};
			var fnIsEqual = function(aDataBase, aData) {
				if (!aData) {
					return true;
				}
				if (aDataBase.length !== aData.length) {
					return false;
				}
				var fnSort = function(a, b) {
					if (a.visible === true && (b.visible === false || b.visible === undefined)) {
						return -1;
					} else if ((a.visible === false || a.visible === undefined) && b.visible === true) {
						return 1;
					} else if (a.visible === true && b.visible === true) {
						if (a.index < b.index) {
							return -1;
						} else if (a.index > b.index) {
							return 1;
						} else {
							return 0;
						}
					} else if ((a.visible === false || a.visible === undefined) && (b.visible === false || b.visible === undefined)) {
						if (a.columnKey < b.columnKey) {
							return -1;
						} else if (a.columnKey > b.columnKey) {
							return 1;
						} else {
							return 0;
						}
					}
				};
				aDataBase.sort(fnSort);
				aData.sort(fnSort);
				return JSON.stringify(aDataBase) === JSON.stringify(aData);
			};
			if (this.oDataInitial.SelectedChartType !== this.oJSONModel.getProperty("/SelectedChartType")) {
				return true;
			}
			var aDataTotal = fnGetUnion(this.oDataInitial.DimMeasureItems, this.oJSONModel.getProperty("/DimMeasureItems"));
			var aDataInitialTotal = jQuery.extend(true, [], this.oDataInitial.DimMeasureItems);
			return !fnIsEqual(aDataTotal, aDataInitialTotal);
		}
	});

	return PageController;
});
