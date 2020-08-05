/*!
 * ${copyright}
 */

// Provides control sap.f.ProductSwitch
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	'sap/ui/core/delegate/ItemNavigation',
	"sap/f/GridContainer",
	"sap/f/GridContainerSettings",
	"sap/f/ProductSwitchItem",
	"sap/f/ProductSwitchRenderer"
],
	function (
		Core,
		Control,
		ItemNavigation,
		GridContainer,
		GridContainerSettings,
		ProductSwitchItem,
		ProductSwitchRenderer
	) {
		"use strict";
		/**
		 * Constructor for a new <code>ProductSwitch</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A layout control that provides specific configuration about how the items should be displayed.
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @experimental Since 1.72. This class is experimental and provides only limited functionality. Also the API might be changed in future.
		 * @alias sap.f.ProductSwitch
		 * @since 1.72
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ProductSwitch = Control.extend("sap.f.ProductSwitch", {
			metadata: {
				library: "sap.f",
				aggregations: {
					/**
					* Holds the internally created GridContainer.
					*/
					_gridContainer: { type: "sap.f.GridContainer", visibility: "hidden", multiple: false },
					/**
					  * <code>ProductSwitch</code> content.
					*/
					items: {
						type: "sap.f.ProductSwitchItem", multiple: true, singularName: "item",
						forwarding: {
							getter: "_getGridContainer",
							aggregation: "items"
						}
					}
				},
				associations: {
					/**
					 * Sets or retrieves the selected item from the <code>items</code> aggregation.
					 */
					selectedItem: { type: "sap.f.ProductSwitchItem", multiple: false }
				},
				events: {
					/**
					 * Fires when an unselected item is pressed.
					 */
					change: {
						parameters: {
							/**
							* Reference to the new item that has been selected.
							*/
							itemPressed: {
								type: "sap.f.ProductSwitchItem"
							}
						}
					}
				}
			}
		});

		ProductSwitch.COLUMNS = {
			THREE_COLUMNS: 3,
			FOUR_COLUMNS: 4
		};

		ProductSwitch.prototype.init = function () {
			this._oCurrentSelectedItem = null;
		};

		ProductSwitch.prototype.exit = function () {
			this._oCurrentSelectedItem = null;
			this._destroyItemNavigation();
		};

		/**
		 * Destroys the item navigation delegate
		 * @private
		 */
		ProductSwitch.prototype._destroyItemNavigation = function () {
			if (this._oItemNavigation) {
				this.removeEventDelegate(this._oItemNavigation);
				this._oItemNavigation.destroy();
				this._oItemNavigation = null;
			}
		};

		ProductSwitch.prototype.onAfterRendering = function () {
			var oDomRef,
				aChildDomRefs = [];

			if (!this._oItemNavigation) {
				this._oItemNavigation = new ItemNavigation(null, null);
				this._oItemNavigation.setDisabledModifiers({
					// Alt + arrow keys are reserved for browser navigation
					sapnext: [
						"alt", // Windows and Linux
						"meta" // Apple (⌘)
					],
					sapprevious: [
						"alt",
						"meta"
					]
				});
				this.addEventDelegate(this._oItemNavigation);
			}

			oDomRef = this.getDomRef();

			// set the root dom node that surrounds the items
			this._oItemNavigation.setRootDomRef(oDomRef);

			aChildDomRefs = this.getItems().map(function (oItem) {
				return oItem.getDomRef();
			});

			// set the array of DOM elements representing the items
			this._oItemNavigation.setItemDomRefs(aChildDomRefs);
		};

		/**
		 * Determinates the columns of the GridContainer based on items count.
		 * @private
		 */
		ProductSwitch.prototype._gridContainerItemsUpdate = function () {
			var oLayout = this._getGridContainer().getLayout();

			oLayout.setColumns(this.getItems().length <= 6 ? ProductSwitch.COLUMNS.THREE_COLUMNS : ProductSwitch.COLUMNS.FOUR_COLUMNS);
		};

		/**
		 * Sets additional class which adds paddings when the layout is changed.
		 * @private
		 */
		ProductSwitch.prototype._changeLayoutHandler = function (oEvent) {
			var sEventParamLayout = oEvent.getParameter("layout"),
				bIsSmallestSize = sEventParamLayout === "layoutS" || sEventParamLayout === "layoutXS";

			this._getGridContainer().toggleStyleClass("sapFProductSwitch-Popover-CTX", !bIsSmallestSize);
		};

		/**
		 * Gets content of aggregation _gridContainer.
		 * @private
		 * @returns {sap.f.GridContainer}
		 */
		ProductSwitch.prototype._getGridContainer = function () {
			var oGridContainer = this.getAggregation("_gridContainer");

			if (!oGridContainer) {
				oGridContainer = new GridContainer({ layoutChange: this._changeLayoutHandler.bind(this) })
					.setLayout(new GridContainerSettings({ columnSize: "11.25rem", rowSize: "7rem", gap: "0.5rem", columns: 4 }))
					.setLayoutM(new GridContainerSettings({ columnSize: "11.25rem", rowSize: "7rem", gap: "0.5rem", columns: 3 }))
					.setLayoutS(new GridContainerSettings({ columnSize: "100%", rowSize: "5rem", gap: "0", columns: 1 }));

				this.setAggregation("_gridContainer", oGridContainer);
			}

			return oGridContainer;
		};

		/**
		 * Changes the selected item.
		 * @private
		 */
		ProductSwitch.prototype._onItemPress = function (oEvent) {
			this.setSelectedItem(oEvent.oSource);
			this.fireChange({ itemPressed: oEvent.oSource });
		};

		ProductSwitch.prototype._setSelection = function (vItem) {
			if (this._oCurrentSelectedItem) {
				this._oCurrentSelectedItem.removeStyleClass("sapFPSItemSelected");
				this._oCurrentSelectedItem.$().removeAttr("aria-checked");
			}

			this._oCurrentSelectedItem = vItem;

			if (this._oCurrentSelectedItem) {
				this._oCurrentSelectedItem.addStyleClass("sapFPSItemSelected");
				this._oCurrentSelectedItem.$().attr("aria-checked", "true");
			}
		};

		/**
		* Sets the <code>selectedItem</code> association.
		*
		* @param {string | sap.f.ProductSwitchItem | null} vItem New value for the <code>selectedItem</code> association.
		* If an ID of a <code>sap.f.ProductSwitchItem</code> instance is given, the item with this ID becomes the <code>selectedItem</code> association.
		* Alternatively, a <code>sap.f.ProductSwitchItem</code> instance may be given or <code>null</code> to clear the selection.
		*
		* @returns {sap.f.ProductSwitch} <code>this</code> to allow method chaining
		* @public
		*/

		ProductSwitch.prototype.setSelectedItem = function (vItem) {
			if (typeof vItem === "string") {
				vItem = Core.byId(vItem);
			}

			if (!(vItem instanceof ProductSwitchItem) && vItem !== null) {
				return this;
			}

			this._setSelection(vItem);

			return this.setAssociation("selectedItem", vItem, true);
		};

		ProductSwitch.prototype.addItem = function (oItem) {
			this.addAggregation("items", oItem);

			if (oItem) {
				oItem.attachEvent("_itemPress", this._onItemPress, this);
			}

			this._gridContainerItemsUpdate();

			return this;
		};
		ProductSwitch.prototype.insertItem = function (oItem, iIndex) {
			this.insertAggregation("items", oItem, iIndex);

			if (oItem) {
				oItem.attachEvent("_itemPress", this._onItemPress, this);
			}

			this._gridContainerItemsUpdate();

			return this;
		};

		ProductSwitch.prototype.removeItem = function (oItem) {
			var oRemovedItem = this.removeAggregation("items", oItem)
				.detachEvent("_itemPress", this._onItemPress, this);

			this._gridContainerItemsUpdate();

			return oRemovedItem;
		};

		ProductSwitch.prototype.removeAllItems = function () {
			var aItems = this.getItems(),
				aRemovedItems;

			aItems.forEach(function (oItem) {
				oItem.detachEvent("_itemPress", this._onItemPress, this);
			}, this);

			aRemovedItems = this.removeAllAggregation("items");
			this._gridContainerItemsUpdate();

			return aRemovedItems;
		};

		ProductSwitch.prototype.destroyItems = function () {
			var aItems = this.getItems(),
				aDestroyedItems;

			aItems.forEach(function (oItem) {
				oItem.detachEvent("_itemPress", this._onItemPress, this);
			}, this);

			aDestroyedItems = this.destroyAggregation("items");
			this._gridContainerItemsUpdate();

			return aDestroyedItems;
		};

		ProductSwitch.prototype._getItemsCount = function () {
			return this.getItems().length;
		};

		ProductSwitch.prototype._getItemPosition = function (oItem) {
			var aItems = this.getItems(),
				iIndex;

			aItems.forEach(function (oItemInner, iIndexInner) {
				if (oItemInner === oItem) {
					iIndex = iIndexInner + 1;
				}
			});

			return iIndex;
		};

		return ProductSwitch;

	});
