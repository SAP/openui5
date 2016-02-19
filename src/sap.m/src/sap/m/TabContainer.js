/*!
 * ${copyright}
 */

// Provides control sap.m.TabContainer.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/IconPool'],
	function(jQuery, library, Control, IconPool) {
		"use strict";



		/**
		 * Constructor for a new TabContainer.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The TabContainer control represents a collection of tabs with associated content.
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.m.TabContainer
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var TabContainer = Control.extend("sap.m.TabContainer", /** @lends sap.m.TabContainer.prototype */ {
			metadata : {
				library : "sap.m",
				properties : {

					/**
					 * Defines whether add new button is shown in the tab strip
					 */
					showAddNewButton : {type : "boolean", group : "Misc", defaultValue : false}
				},
				aggregations : {

					/**
					 * The items displayed in the TabContainer.
					 */
					items : {type : "sap.m.TabContainerItem", multiple : true, singularName: "item", bindable: "bindable"},

					/**
					 * The add button displayed in the TabStrip.
					 */
					_addNewButton : {type : "sap.m.Button", multiple : false, visibility : "hidden"},

					/**
					 * Internal aggregation for managing the tab elements.
					 */
					_tabStrip : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}
				},
				associations : {

					/**
					 * Sets or retrieves the selected item from the aggregation named items.
					 */
					selectedItem : {type : "sap.m.TabContainerItem", multiple : false}
				},
				events : {

					/**
					 * Fired when an item wants to be closed.
					 */
					itemClose: {
						allowPreventDefault: true,
						parameters: {

							/**
							 * The item to be closed.
							 */
							item: {type: "sap.m.TabContainerItem"}
						}
					},

					/**
					 * Fired when an item is pressed.
					 */
					itemSelect: {
						parameters: {

							/**
							 * The selected item.
							 */
							item: { type: "sap.m.TabContainerItem" }
						}
					},

					/**
					 * Fired when add new button is pressed.
					 */
					addNewButtonPress: { }
				}
			},
			constructor : function (vId, mSettings) {
				var aStashedItems = [];

				// normalize the expected arguments
				if (!mSettings && typeof vId === 'object') {
					mSettings = vId;
				}

				/* Store the items for later and remove them for the initialization of the control to avoid racing
				 * condition with the initialization of the tab strip. This is only required when the items aggregation
				 * is initialized directly with an array of TabContainer items without data binding and a template. */
				if (mSettings && Array.isArray(mSettings['items'])) {
					aStashedItems = mSettings['items'];
					delete mSettings['items'];
				}

				sap.ui.base.ManagedObject.prototype.constructor.apply(this, arguments);
				var oControl = new sap.m.TabStrip(this.getId() + "--tabstrip", {
					hasSelect: true,
					itemPress: function(oEvent) {
						var oItem = oEvent.getParameter("item"),
						    oSelectedItem = this._fromTabStripItem(oItem);
						this.fireItemSelect({ item: oSelectedItem });

						this.setSelectedItem(oSelectedItem);
					}.bind(this),
					itemClose: function(oEvent) {
						var oItem = oEvent.getParameter("item"),
							oRemovedItem = this._fromTabStripItem(oItem);

						// prevent the tabstrip from closing the item by default
						oEvent.preventDefault();
						if (this.fireItemClose({item: oRemovedItem})) {
							this.removeItem(oRemovedItem); // the tabstrip item will also get removed
						}

					}.bind(this)
				});

				this.setAggregation("_tabStrip", oControl, true);

				if (mSettings && mSettings['showAddNewButton']) {
					this.setShowAddNewButton(true);
				}

				// re-introduce any existing items from the constructor settings
				aStashedItems.forEach(function (oItem) {
					this.addItem(oItem);
				}, this);

			}
		});

		/**
		 * Called before the control is rendered.
		 */
		TabContainer.prototype.onBeforeRendering = function() {

			if (this.getSelectedItem()) {
				return;
			}

			this._setDefaultTab();
		};

		TabContainer.prototype._getAddNewTabButton = function() {
			var oControl = this.getAggregation("_addNewButton");
			var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			if (!oControl) {
				oControl = new sap.m.Button({
					type: sap.m.ButtonType.Transparent,
					tooltip: oRb.getText("TABCONTAINER_ADD_NEW_TAB"),
					icon: IconPool.getIconURI("add"),
					press: function() {
						this.getParent().getParent().fireAddNewButtonPress();
					}
				});

				this.setAggregation("_addNewButton", oControl, true);
			}

			return oControl;
		};



		/**
		 * Get a reference to the instance of the tab strip aggregation
		 */
		TabContainer.prototype._getTabStrip = function () {
			return this.getAggregation("_tabStrip");
		};

		TabContainer.prototype._fromTabStripItem = function(oItem) {
			var aItems = this.getItems() || [],
				iItemsCount = aItems.length,
				iIndex = 0;

			for (; iIndex < iItemsCount; iIndex++) {
				if (aItems[iIndex].getId() === oItem.getKey()) {
					return aItems[iIndex];
				}
			}

			return null;
		};

		/**
		 * Returns <code>sap.m.TabStripItem</code> corresponding to given <code>sap.m.TabContainerItem</code>.
		 * @param {sap.m.TabContainerItem | string} vItem object or id of the TabContainerItem
		 * @returns {sap.m.TabStripItem} tabstrip item corresponding to given <code>sap.m.TabContainerItem</code>
		 * @protected
		 */
		TabContainer.prototype._toTabStripItem = function(vItem) {
			var iIndex = 0,
				sKey = vItem,
				oTabStripItems,
				oTabStripItemsCount,
				oTabStrip = this._getTabStrip();

			if (!oTabStrip) {
				// resolves error /getItems() of null/ in case only the _tabStrip aggregation was for some reason removed/destroyed from the container
				return null;
			}

			oTabStripItems = oTabStrip.getItems();
			oTabStripItemsCount = oTabStripItems.length;

			if (typeof vItem === "object") {
				sKey = vItem.getId();
			}

			for (; iIndex < oTabStripItemsCount; iIndex++) {
				if (oTabStripItems[iIndex].getKey() === sKey) {
					return oTabStripItems[iIndex];
				}
			}

			return null;
		};

		TabContainer.prototype._getSelectedItemContent = function() {
			var oTabStrip = this._getTabStrip(),
				sSelectedItem = this.getSelectedItem(),
				oSelectedItem = sap.ui.getCore().byId(sSelectedItem),
				oTabStripItem = this._toTabStripItem(oSelectedItem);

			if (oTabStrip) {
				// resolves error /getItems() of null/ in case only the _tabStrip aggregation was for some reason removed/destroyed from the container
				oTabStrip.setSelectedItem(oTabStripItem);
			}

			return oSelectedItem ? oSelectedItem.getContent() : null;
		};

		/**
		 * Calculates the next item to be focused & selected and applies the focus & selection when an item is removed
		 *
		 * @param bSetAsSelected {boolean} Whether the next item to be selected
		 * @private
		 */
		TabContainer.prototype._moveToNextItem = function (bSetAsSelected) {
			var iItemsCount = this.getItems().length,
					iCurrentFocusedIndex = this._getTabStrip()._oItemNavigation.getFocusedIndex(),
					iNextIndex = iItemsCount === iCurrentFocusedIndex ? --iCurrentFocusedIndex : iCurrentFocusedIndex,
					oNextItem = this.getItems()[iNextIndex],
					fnFocusCallback = function () {
						this._getTabStrip()._oItemNavigation.focusItem(iNextIndex);
					};

			// Selection (causes invalidation)
			if (bSetAsSelected) {
				this.setSelectedItem(oNextItem);
				// Notify the subscriber
				this.fireItemSelect({item: oNextItem});
			}
			// Focus (force to wait until invalidated)
			jQuery.sap.delayedCall(0, this, fnFocusCallback);
		};

		/**
		 * Removes an item from the aggregation named <code>items</code>.
		 *
		 * @param {int | string | sap.m.TabContainerItem} vItem The item to remove or its index or id.
		 * @returns {sap.m.TabContainerItem} The removed item or null.
		 * @public
		 */
		TabContainer.prototype.removeItem = function(vItem) {
			var bIsSelected;

			if (!vItem) {
				return null;
			}

			// The selection flag of the removed item
			bIsSelected = vItem.getId() === this.getSelectedItem();
			//Remove the corresponding TabContainerItem
			vItem = this.removeAggregation("items", vItem);
			this._getTabStrip().removeItem(this._toTabStripItem(vItem));
			// Perform selection switch
			this._moveToNextItem(bIsSelected);

			return vItem;
		};

		/**
		 * Override the method in order to handle propagation of item property changes to the _tabStrip instance copies.
		 * @param {string} sAggregationName Name of the added aggregation
		 * @param {object} oObject Intance that is going to be added
		 * @param {boolean} bSuppressInvalidate Flag indicating whether invalidation should be supressed
		 * @returns {object} This instance for chaining
		 */
		TabContainer.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			var oTabStripItem,
				sPropertyKey;

			if (sAggregationName === 'items') {
				oObject.attachItemPropertyChanged(function (oEvent) {
					oTabStripItem = this._toTabStripItem(oEvent.getSource());
					sPropertyKey = oEvent['mParameters'].propertyKey;
					if (sPropertyKey === 'name') {
						sPropertyKey = 'text';
					}

					if (oTabStripItem) {
						oTabStripItem.setProperty(sPropertyKey, oEvent['mParameters'].propertyValue, false);
					}
				}.bind(this));
			}
			return Control.prototype.addAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
		};


		TabContainer.prototype.addItem = function(oItem) {
			this.addAggregation("items", oItem, false);

			this._getTabStrip().addItem(
				new sap.m.TabStripItem({
					key: oItem.getId(),
					text: oItem.getName(),
					modified: oItem.getModified()
				})
			);

			return oItem;
		};

		TabContainer.prototype.destroyItems = function() {
			this._getTabStrip().destroyItems();

			return this.destroyAggregation("items");
		};

		TabContainer.prototype.insertItem = function(oItem, iIndex) {
			this._getTabStrip().insertItem(
				new sap.m.TabStripItem({
					key: oItem.getId(),
					text: oItem.getName(),
					modified: oItem.getModified()
				}),
				iIndex
			);

			return this.insertAggregation("items", oItem, iIndex);
		};

		TabContainer.prototype.removeAllItems = function() {
			this._getTabStrip().removeAllItems();

			this.setSelectedItem(null);

			return this.removeAllAggregation("items");
		};

		TabContainer.prototype.setAddButton = function (oButton) {
			return this._getTabStrip().setAddButton(oButton);
		};

		TabContainer.prototype.getAddButton = function () {
			return this._getTabStrip().getAddButton();
		};

		TabContainer.prototype.setShowAddNewButton = function (bShowButton) {
			var oTabStrip = this._getTabStrip();
			if (oTabStrip) {
				oTabStrip.setAddButton(bShowButton ? this._getAddNewTabButton() : null);
			}
		};

		/**
		 * Override <code>selectedItem</code> property setter.
		 *
		 * @param oSelectedItem {sap.m.TabContainerItem} The new <code>TabContainerItem</code> to be selected
		 * @override
		 */
		TabContainer.prototype.setSelectedItem = function (oSelectedItem) {
			var oTabStrip = this._getTabStrip();

			if (oSelectedItem && oTabStrip) {
				oTabStrip.setSelectedItem(this._toTabStripItem(oSelectedItem));
				this.fireItemSelect({item: oSelectedItem});
				this._rerenderContent(oSelectedItem.getContent());
			}

			return TabContainer.prototype.setAssociation.call(this, "selectedItem", oSelectedItem, true); //render manually;
		};

		/**
		 * Re-renders only the displayed content.
		 * @private
		 * @param oContent Content, which should be rendered.
		 */
		TabContainer.prototype._rerenderContent = function(oContent) {
			var $content = this.$("content"),
				oRM;

			if (!oContent || ($content.length <= 0)) {
				return;
			}

			oRM = sap.ui.getCore().createRenderManager();
			for (var i = 0; i < oContent.length; i++) {
				oRM.renderControl(oContent[i]);
			}
			oRM.flush($content[0]);
			oRM.destroy();
		};

		/**
		 * Sets the default selected item to the first item
		 *
		 * @returns {sap.m.TabStripItem|null}
		 * @private
		 */
		TabContainer.prototype._setDefaultTab = function() {

			var oFirstItem = this.getItems()[0] || null;

			this.setSelectedItem(oFirstItem);

			return oFirstItem;
		};

		return TabContainer;

	}, /* bExport= */ true);
