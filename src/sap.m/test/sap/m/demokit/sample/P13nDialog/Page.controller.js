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
		oDataInitial: {
			ShowResetEnabled: false,
			Items: [],
			ColumnsItems: []
		},
		oDataBeforeOpen: {},

		onInit: function() {
			var that = this;
			this.oJSONModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			this.setInitialData(this.oJSONModel);
			this.oJSONModel.attachRequestCompleted(function() {
				that.setInitialData(this);
			});
		},

		setInitialData: function(oJsonModel) {
			// Collect JSON 'Items'
			this.oDataInitial.Items = jQuery.extend(true, {}, oJsonModel.getProperty("/Items"));

			// Collect JSON 'ColumnsItems'
			// First columns which are initially visible (note: we assume that 'ColumnsItems' are sorted by 'index').
			var aColumnKeysVisible = [];
			oJsonModel.getProperty("/ColumnsItems").filter(function(oItem) {
				return !!oItem.visible;
			}).forEach(function(oItem) {
				aColumnKeysVisible.push(oItem.columnKey);
				this.oDataInitial.ColumnsItems.push({
					columnKey: oItem.columnKey,
					visible: oItem.visible,
					index: oItem.index
				});
			}.bind(this));
			// Then remaining columns
			oJsonModel.getProperty("/Items").filter(function(oItem) {
				return aColumnKeysVisible.indexOf(oItem.columnKey) < 0;
			}).forEach(function(oItem) {
				this.oDataInitial.ColumnsItems.push({
					columnKey: oItem.columnKey,
					visible: false,
					index: this.oDataInitial.ColumnsItems.length
				});
			}.bind(this));
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
			this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedColumnsItems());
			oPersonalizationDialog.setModel(this.oJSONModel);

			this.getView().addDependent(oPersonalizationDialog);

			this.oDataBeforeOpen = jQuery.extend(true, {}, this.oJSONModel.getData());
			oPersonalizationDialog.open();
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
					return jQuery.extend(true, [], aDataBase);
				}
				var aUnion = jQuery.extend(true, [], aData);
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

			var aDataRuntime = fnGetUnion(this.oDataInitial.ColumnsItems, this.oJSONModel.getProperty("/ColumnsItems"));
			return !fnIsEqual(aDataRuntime, this.oDataInitial.ColumnsItems);
		}
	});
});
