/*!
 * ${copyright}
 */

// Provides control sap.m.TabContainer.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/IconPool'],
	function(jQuery, library, Control, IconPool) {
		"use strict";

		/**
		 * Constructor for a new <code>TabContainer</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The <code>TabContainer</code> control represents a collection of tabs with associated content.
		 *
		 * The <code>TabContainer</code> is a full-page container that takes 100% of the parent width and height.
		 * As the control is expected to occupy the the whole parent, it should be the only child of its parent.
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
					 * Defines whether an <code>Add New Tab</code> button is displayed in the TabStrip.
					 */
					showAddNewButton : {type : "boolean", group : "Misc", defaultValue : false}
				},
				aggregations : {

					/**
					 * The items displayed in the <code>TabContainer</code>.
					 */
					items : {type : "sap.m.TabContainerItem", multiple : true, singularName: "item", bindable: "bindable"},

					/**
					 * The <code>Add New Tab</code> button displayed in the <code>TabStrip</code>.
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
					 * Fired when an item is closed.
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
						allowPreventDefault: true,
						parameters: {
							/**
							 * The selected item.
							 */
							item: { type: "sap.m.TabContainerItem" }
						}
					},

					/**
					 * Fired when <code>Add New Tab</code> button is pressed.
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
					itemSelect: function(oEvent) {
						var oItem = oEvent.getParameter("item"),
						    oSelectedItem = this._fromTabStripItem(oItem);
						this.setSelectedItem(oSelectedItem, oEvent);
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

		/**
		 * Lazy loads the control attached to the private <code>Add New Button</code> aggregation
		 * @returns {null | sap.m.Button} The <code>Add New Tab</code> button if present or null
		 * @private
		 */
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
		 * Gets a reference to the instance of the TabStrip aggregation.
		 */
		TabContainer.prototype._getTabStrip = function () {
			return this.getAggregation("_tabStrip");
		};

		/**
		 * Finds a <code>TabContainerItem</code> corresponding to a given <code>TabStripItem</code>.
		 *
		 * @param oItem {sap.m.TabStripItem} <code>TabStripItem</code> instance, the corresponding <code>TabContainerItem</code> to be searched for
		 * @returns {sap.m.TabStripItem | null} The <code>TabContainerItem</code> found (if any)
		 * @private
		 */
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
		 * Finds the <code>sap.m.TabStripItem</code> corresponding to a given <code>sap.m.TabContainerItem</code>.
		 *
		 * @param {sap.m.TabContainerItem | string} vItem object or ID of the <code>TabContainerItem</code>
		 * @returns {sap.m.TabStripItem | null} <code>TabStripItem</code> corresponding to a given <code>sap.m.TabContainerItem</code> (if any)
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

		/**
		 * Gets the <code>TabContainerItem</code> content if present.
		 * @returns { null | Array<sap.ui.core.Control> }
		 * @private
		 */
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
		 * Calculates the next item to be focused and selected and applies the focus and selection when an item is removed.
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
		 * @param vItem {int | string | sap.m.TabContainerItem} The item to remove or its index or ID
		 * @returns {sap.m.TabContainerItem} The removed item or null
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
		 * Overrides the method in order to handle propagation of item property changes to the <code>_tabStrip</code> instance copies.
		 *
		 * @param sAggregationName {string} Name of the added aggregation
		 * @param oObject {object} Instance that is going to be added
		 * @param bSuppressInvalidate {boolean} Flag indicating whether invalidation should be suppressed
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

		/**
		 * Adds a new <code>TabContainerItem</code> to the <code>items</code> aggregation of the <code>TabContainer</code>.
		 *
		 * @param oItem {sap.m.TabContainerItem} The new <code>TabContainerItem</code> to be added
		 * @returns {sap.m.TabContainerItem} The newly added <code>TabContainerItem</code>
		 * @override
		 */
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

		/**
		 * Destroys all <code>TabContainerItem</code> entities from the <code>items</code> aggregation of the <code>TabContainer</code>.
		 *
		 * @returns {sap.m.TabContainer} This instance for chaining
		 * @override
		 */
		TabContainer.prototype.destroyItems = function() {
			this._getTabStrip().destroyItems();

			return this.destroyAggregation("items");
		};

		/**
		 * Inserts a new <code>TabContainerItem</code> to the <code>items</code> aggregation of the <code>TabContainer</code> at a specified index.
		 *
		 * @param oItem {sap.m.TabContainerItem} The new <code>TabContainerItem</code> to be inserted
		 * @param iIndex {int} The index where the passed <code>TabContainerItem</code> to be inserted
		 * @returns {sap.m.TabContainer} This instance for chaining
		 * @override
		 */
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

		/**
		 * Removes all <code>TabContainerItem</code> entities from the <code>items</code> aggregation of the <code>TabContainer</code>.
		 *
		 * @returns {sap.m.TabContainer} This instance for chaining
		 * @override
		 */
		TabContainer.prototype.removeAllItems = function() {
			this._getTabStrip().removeAllItems();

			this.setSelectedItem(null);

			return this.removeAllAggregation("items");
		};

		/**
		 * Overrides the <code>addButton</code> property setter to proxy to the <code>TabStrip</code>.
		 *
		 * @param oButton {sap.ui.core.Control} The new control to be set as <code>TabStrip</code> <code>addButton</code> aggregation
		 * @returns {sap.m.TabContainer} This instance for chaining
		 * @override
		 */
		TabContainer.prototype.setAddButton = function (oButton) {
			return this._getTabStrip().setAddButton(oButton);
		};

		/**
		 * Overrides the addButton property getter to proxy to the <code>TabStrip</code>.
		 *
		 * @returns {sap.ui.core.Control} The control assigned as a <code>TabStrip</code> addButton aggregation
		 * @override
		 */
		TabContainer.prototype.getAddButton = function () {
			return this._getTabStrip().getAddButton();
		};

		/**
		 * Override <code>showAddNewButton</code> property setter to proxy to the <code>TabStrip</code>.
		 *
		 * @param bShowButton {boolean} Whether to show the <code>addNewButton</code>
		 * @override
		 */
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
		 * @param oEvent {object} Event object that may be present when the selection change is bubbling
		 * @returns {sap.m.TabContainer} <code>this</code> pointer for chaining
		 * @override
		 */
		TabContainer.prototype.setSelectedItem = function (oSelectedItem, oEvent) {
			/* As the 'setSelectedItem' might be part of a bubbling selection change event, allow the final event handler
			 * to prevent it. */
			if (this.fireItemSelect({item: oSelectedItem})) {
				var oTabStrip = this._getTabStrip();
				if (oSelectedItem && oTabStrip) {
					oTabStrip.setSelectedItem(this._toTabStripItem(oSelectedItem));
					this._rerenderContent(oSelectedItem.getContent());
				}
				TabContainer.prototype.setAssociation.call(this, "selectedItem", oSelectedItem, true); //render manually;
				return this;
			}
			if (oEvent) {
				oEvent.preventDefault();
			}
			return this;
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
