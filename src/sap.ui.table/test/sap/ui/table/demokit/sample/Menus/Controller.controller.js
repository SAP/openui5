sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Popup",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/ActionItem",
	"sap/m/ToolbarSpacer",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/core/date/UI5Date"
], function(Log, Controller, JSONModel, Menu, MenuItem, MessageToast, DateFormat, Popup, MenuM, MenuItemM, ColumnMenu, ActionItem, ToolbarSpacer, jQuery, Device, UI5Date) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.Menus.Controller", {

		onInit: function() {
			const oView = this.getView();

			// set explored app's demo model on this sample
			const oJSONModel = this.initSampleDataModel();
			oView.setModel(oJSONModel);

			oView.setModel(new JSONModel({
				showVisibilityMenuEntry: false,
				showFreezeMenuEntry: false,
				enableCellFilter: false
			}), "ui");

			this.associateHeaderMenus();

			sap.ui.require(["sap/ui/table/sample/TableExampleUtils"], function(TableExampleUtils) {
				const oTb = oView.byId("infobar");
				oTb.addContent(new ToolbarSpacer());
				oTb.addContent(TableExampleUtils.createInfoButton("sap/ui/table/sample/Menus"));
			}, function(oError) { /*ignore*/ });
		},

		initSampleDataModel: function() {
			const oModel = new JSONModel();

			const oDateFormat = DateFormat.getDateInstance({source: {pattern: "timestamp"}, pattern: "dd/MM/yyyy"});

			jQuery.ajax(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"), {
				dataType: "json",
				success: function(oData) {
					const aTemp1 = [];
					const aTemp2 = [];
					const aSuppliersData = [];
					const aCategoryData = [];
					for (let i = 0; i < oData.ProductCollection.length; i++) {
						const oProduct = oData.ProductCollection[i];
						if (oProduct.SupplierName && aTemp1.indexOf(oProduct.SupplierName) < 0) {
							aTemp1.push(oProduct.SupplierName);
							aSuppliersData.push({Name: oProduct.SupplierName});
						}
						if (oProduct.Category && aTemp2.indexOf(oProduct.Category) < 0) {
							aTemp2.push(oProduct.Category);
							aCategoryData.push({Name: oProduct.Category});
						}
						oProduct.DeliveryDate = Date.now() - (i % 10 * 4 * 24 * 60 * 60 * 1000);
						oProduct.DeliveryDateStr = oDateFormat.format(UI5Date.getInstance(oProduct.DeliveryDate));
						oProduct.Heavy = oProduct.WeightMeasure > 1000 ? "true" : "false";
						oProduct.Available = oProduct.Status === "Available" ? true : false;
					}

					oData.Suppliers = aSuppliersData;
					oData.Categories = aCategoryData;

					oModel.setData(oData);
				},
				error: function() {
					Log.error("failed to load json");
				}
			});

			return oModel;
		},

		onColumnSelect: function(oEvent) {
			const oCurrentColumn = oEvent.getParameter("column");
			const oImageColumn = this.byId("image");
			if (oCurrentColumn === oImageColumn) {
				MessageToast.show("Column header " + oCurrentColumn.getLabel().getText() + " pressed.");
			}
		},

		onColumnMenuOpen: function(oEvent) {
			const oCurrentColumn = oEvent.getSource();
			const oImageColumn = this.byId("image");
			if (oCurrentColumn !== oImageColumn) {
				return;
			}

			//Just skip opening the column Menu on column "Image"
			oEvent.preventDefault();
		},

		onProductIdCellContextMenu: function(oEvent) {
			if (Device.support.touch) {
				return; //Do not use context menus on touch devices
			}

			if (oEvent.getParameter("columnId") !== this.getView().createId("productId")) {
				return; //Custom context menu for product id column only
			}

			oEvent.preventDefault();

			const oRowContext = oEvent.getParameter("rowBindingContext");

			if (!this._oIdContextMenu) {
				this._oIdContextMenu = new Menu();
				this.getView().addDependent(this._oIdContextMenu);
			}

			this._oIdContextMenu.destroyItems();
			this._oIdContextMenu.addItem(new MenuItem({
				text: "My Custom Cell Action",
				select: function() {
					MessageToast.show("Context action triggered on Column 'Product ID' on id '" + oRowContext.getProperty("ProductId") + "'.");
				}
			}));

			//Open the menu on the cell
			const oCellDomRef = oEvent.getParameter("cellDomRef");
			const eDock = Popup.Dock;
			this._oIdContextMenu.open(false, oCellDomRef, eDock.BeginTop, eDock.BeginBottom, oCellDomRef, "none none");
		},

		onQuantityCustomItemSelect: function(oEvent) {
			MessageToast.show("Some custom action triggered on column 'Quantity'.");
		},

		onQuantitySort: function(oEvent) {
			const bAdd = oEvent.getParameter("ctrlKey") === true;
			const oColumn = this.byId("quantity");
			const sOrder = oColumn.getSortOrder() === "Ascending" ? "Descending" : "Ascending";

			this.byId("table").sort(oColumn, sOrder, bAdd);
		},

		onToggleContextMenu: function(oEvent) {
			if (oEvent.getParameter("pressed")) {
				this.byId("table").setContextMenu(new MenuM({
					items: [
						new MenuItemM({text: "{Name}"}),
						new MenuItemM({text: "{ProductId}"})
					]
				}));
			} else {
				this.byId("table").destroyContextMenu();
			}
		},

		associateHeaderMenus: function() {
			this.oMenu = new ColumnMenu();
			this.byId("name").setHeaderMenu(this.oMenu.getId());
			this.byId("productId").setHeaderMenu(this.oMenu.getId());

			this.oCustomMenu = new ColumnMenu({
				items: [
					new ActionItem({
						label: "My custom menu entry",
						press: [function(oEvent) {
							this.onQuantityCustomItemSelect(oEvent);
						}, this]
					}),
					new ActionItem({
						label: "Sort",
						icon: "sap-icon://sort",
						press: [function(oEvent) {
							this.onQuantitySort(oEvent);
						}, this]
					})
				]
			});
			this.byId("quantity").setHeaderMenu(this.oCustomMenu.getId());
		},

		onExit: function() {
			if (this.oMenu) {
				this.oMenu.destroy();
			}
			if (this.oCustomMenu) {
				this.oCustomMenu.destroy();
			}
		}

	});

});