sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Sorter",
		"sap/ui/core/Element",
		"sap/m/table/columnmenu/MenuBase",
		"sap/m/table/columnmenu/Menu",
		"sap/m/table/columnmenu/QuickSort",
		"sap/m/table/columnmenu/QuickSortItem",
		"sap/m/Menu",
		"sap/m/MenuItem"
	], function(Controller, JSONModel, Sorter, Element, MenuBase, ColumnMenu, QuickSort, QuickSortItem, Menu, MenuItem) {
	"use strict";

	/**
	 * Constructor for a new Menu adapter that implements the IColumnHeaderMenu interface.
	 */
	var CustomMenuAdapter = MenuBase.extend("MenuToColumnMenuAdapter", {
		metadata: {
			aggregations: {
				menu: { type: "sap.m.Menu", multiple: false }
			}
		}
	});

	/**
	 * Opens the menu at the specific target element.
	 *
	 * @param {sap.ui.core.Control | HTMLElement} oAnchor This is the control or HTMLElement where the menu is placed.
	 */
	CustomMenuAdapter.prototype.openBy = function(oAnchor) {
		const oMenu = this.getMenu();
		const fnResetBlocked = () => {
			if (this._blocked) {
				clearTimeout(this._blocked);
				this._blocked = null;
			}
		};

		if (!oMenu || ((this.isOpen() || this._blocked) && oAnchor === this._oIsOpenBy)) {
			fnResetBlocked();
			return;
		}

		fnResetBlocked();

		var oControl = oAnchor;
		if (!(oAnchor instanceof Element)) {
			oControl = Element.closestTo(oAnchor, true);
		}

		if (!this.fireBeforeOpen({openBy: oControl})) {
			return;
		}

		// On click outside the menu, the sap.m.Menu closes automatically
		// to prevent reopening on column header click, we need to block the openBy call for a short time (200ms)
		oMenu.attachEventOnce("closed", () => {
			fnResetBlocked();
			this._blocked = setTimeout(fnResetBlocked, 200);
			this.fireAfterClose();
		});

		oMenu.openBy(oAnchor);
		this._oIsOpenBy = oAnchor;
	};

	/**
	 * Determines whether the menu is open.
	 *
	 * @returns {boolean} Whether the menu is open.
	 */
	CustomMenuAdapter.prototype.isOpen = function () {
		return this.getMenu()?.isOpen() || false;
	};

	/**
	 * Closes the menu.
	 */
	CustomMenuAdapter.prototype.close = function () {
		this.getMenu()?.close();
	};

	/**
	 * Returns the type of the menu.
	 *
	 * @returns {sap.ui.core.aria.HasPopup} Type of the menu
	 * @public
	 */
	CustomMenuAdapter.prototype.getAriaHasPopupType = function () {
		return "Menu";
	};

	return Controller.extend("sap.m.sample.TableIColumnHeaderMenu.Page", {
		onInit: function () {
			const oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);

			this.createHeaderMenus();
		},

		createHeaderMenus: function() {
			const oTable = this.getView().byId("productsTable");
			const aColumns = oTable.getColumns();
			const oColumnProduct = aColumns[0];
			const oColumnSupplier = aColumns[1];
			const oColumnDimensions = aColumns[2];
			const oColumnPrice = aColumns[4];

			// Using the built-in default implementation of the IColumnHeaderMenu interface
			oColumnProduct.setHeaderMenu(new ColumnMenu({
				quickActions: [
					new QuickSort({
						items: new QuickSortItem({
							key: "Product",
							label: "Product"
						}),
						change: function(oEvent) {
							const oBinding = oTable.getBinding("items");
							const sSortOrder = oEvent.getParameter("item").getSortOrder();
							if (sSortOrder === "Ascending") {
								oBinding.sort([new Sorter("Name", false)]);
								oColumnProduct.setSortIndicator("Ascending");
								oColumnPrice.setSortIndicator("None");
							} else if (sSortOrder === "Descending") {
								oBinding.sort([new Sorter("Name", true)]);
								oColumnProduct.setSortIndicator("Descending");
								oColumnPrice.setSortIndicator("None");
							} else {
								oColumnProduct.setSortIndicator("None");
							}
						}
					})
				]
			}));

			// Custom menu that implements the IColumnHeaderMenu interface
			oColumnSupplier.setHeaderMenu(new CustomMenuAdapter({
				menu: new Menu({
					items: [
						new MenuItem({
							icon: "sap-icon://group-2",
							text: "Toggle Grouping",
							press: function() {
								var oBinding = oTable.getBinding("items");
								if (!oBinding.isGrouped()) {
									oBinding.sort([
										new Sorter("SupplierName", false, function(oContext) {
											return {
												key : oContext.getProperty("SupplierName"),
												text : oContext.getProperty("SupplierName")
											};
										})
									]);
								} else {
									oBinding.sort([]);
								}
								oColumnProduct.getHeaderMenuInstance().getQuickActions()[0].getItems()[0].setSortOrder("None");
								oColumnProduct.setSortIndicator("None");
								oColumnPrice.setSortIndicator("None");
							}
						})
					]
				})
			}));

			oColumnPrice.setHeaderMenu(new CustomMenuAdapter({
				menu: new Menu({
					items: [
						new MenuItem({
							icon: "sap-icon://sort-ascending",
							text: "Sort Ascending",
							press: function() {
								const oBinding = oTable.getBinding("items");
								oBinding.sort([new Sorter("Price", false)]);
								oColumnPrice.setSortIndicator("Ascending");
								oColumnProduct.getHeaderMenuInstance().getQuickActions()[0].getItems()[0].setSortOrder("None");
								oColumnProduct.setSortIndicator("None");
							}
						}),
						new MenuItem({
							icon: "sap-icon://sort-descending",
							text: "Sort Descending",
							press: function() {
								const oBinding = oTable.getBinding("items");
								oBinding.sort([new Sorter("Price", true)]);
								oColumnPrice.setSortIndicator("Descending");
								oColumnProduct.getHeaderMenuInstance().getQuickActions()[0].getItems()[0].setSortOrder("None");
								oColumnProduct.setSortIndicator("None");
							}
						})
					]
				})
			}));

			oColumnDimensions.setHeaderMenu(new CustomMenuAdapter({
				menu: new Menu({
					items: [
						new MenuItem({
							icon: "sap-icon://text-align-left",
							text: "Align Left",
							press: function() {
								oColumnDimensions.setHAlign("Left");
							}
						}),
						new MenuItem({
							icon: "sap-icon://text-align-center",
							text: "Align Middle",
							press: function() {
								oColumnDimensions.setHAlign("Center");
							}
						}),
						new MenuItem({
							icon: "sap-icon://text-align-right",
							text: "Align Right",
							press: function() {
								oColumnDimensions.setHAlign("Right");
							}
						})
					]
				})
			}));
		}

	});
});