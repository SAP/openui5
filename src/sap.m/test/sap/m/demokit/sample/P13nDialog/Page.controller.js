sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/Fragment', 'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'
], function(jQuery, Fragment, Controller, JSONModel) {
	"use strict";

	/**
	 * Please keep in mind that this is only an example in order to give an impression how you can use P13nXXXPanel's demonstrated on <code>P13nColumnsPanel</code>
	 * and <code>P13nSortPanel</code>. The logic of controller in productive code would be much complex depending on requirements like: support of "Restore",
	 * persisting of settings using the Variant Management.
	 */
	return Controller.extend("sap.m.sample.P13nDialog.Page", {

		oJSONModel: new JSONModel("test-resources/sap/m/demokit/sample/P13nDialog/products.json"),
		oDataInitial: {},
		oDataBeforeOpen: {},

		onInit: function() {
			var that = this;
			this.oJSONModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			this.oJSONModel.attachRequestCompleted(function() {
				that.oDataInitial = jQuery.extend(true, {}, this.getData());
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
			var oPersonalizationDialog = sap.ui.xmlfragment("sap.m.sample.P13nDialog.PersonalizationDialog", this);
			this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedSortItems() || this._isChangedColumnsItems());
			oPersonalizationDialog.setModel(this.oJSONModel);

			this.getView().addDependent(oPersonalizationDialog);

			this.oDataBeforeOpen = jQuery.extend(true, {}, this.oJSONModel.getData());
			oPersonalizationDialog.open();
		},

		onChangeColumnsItems: function(oEvent) {
			var aMColumnsItems = oEvent.getParameter("items").map(function(oMChangedColumnsItem) {
				return oMChangedColumnsItem;
			});
			this.oJSONModel.setProperty("/ColumnsItems", aMColumnsItems);
		},

		onAddSortItem: function(oEvent) {
			var oParameters = oEvent.getParameters();
			var aSortItems = this.oJSONModel.getProperty("/SortItems");
			oParameters.index > -1 ? aSortItems.splice(oParameters.index, 0, {
				columnKey: oParameters.sortItemData.getColumnKey(),
				operation: oParameters.sortItemData.getOperation()
			}) : aSortItems.push({
				columnKey: oParameters.sortItemData.getColumnKey(),
				operation: oParameters.sortItemData.getOperation()
			});
			this.oJSONModel.setProperty("/SortItems", aSortItems);
		},

		onRemoveSortItem: function(oEvent) {
			var oParameters = oEvent.getParameters();
			if (oParameters.index > -1) {
				var aSortItems = this.oJSONModel.getProperty("/SortItems");
				aSortItems.splice(oParameters.index, 1);
				this.oJSONModel.setProperty("/SortItems", aSortItems);
			}
		},

		_isChangedSortItems: function() {
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
				return JSON.stringify(aDataBase) === JSON.stringify(aData);
			};
			var aDataTotal = fnGetUnion(jQuery.extend(true, [], this.oDataInitial.SortItems), this.oJSONModel.getProperty("/SortItems"));
			var aDataInitialTotal = jQuery.extend(true, [], this.oDataInitial.SortItems);
			return !fnIsEqual(aDataTotal, aDataInitialTotal);
		},

		_isChangedColumnsItems: function() {
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

			var aDataTotal = fnGetUnion(this.oDataInitial.ColumnsItems, this.oJSONModel.getProperty("/ColumnsItems"));
			var aDataInitialTotal = jQuery.extend(true, [], this.oDataInitial.ColumnsItems);
			return !fnIsEqual(aDataTotal, aDataInitialTotal);

		}
	});
});
