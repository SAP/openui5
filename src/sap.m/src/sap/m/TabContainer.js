/*!
 * ${copyright}
 */

// Provides control sap.m.TabContainer.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	"sap/ui/core/Element",
	'sap/ui/core/IconPool',
	"sap/ui/core/Lib",
	"sap/ui/core/RenderManager",
	'sap/ui/core/util/ResponsivePaddingsEnablement',
	'./TabContainerRenderer',
	'./TabStrip',
	'./TabStripItem',
	'./Button',
	'sap/ui/Device'
],
	function(library, Control, Element, IconPool, Library, RenderManager, ResponsivePaddingsEnablement, TabContainerRenderer, TabStrip, TabStripItem, Button, Device) {
		"use strict";

		// shortcut for sap.m.ButtonType
		var ButtonType = library.ButtonType;

		// shortcut for PageBackgroundDesign in sap.m library
		var PageBackgroundDesign = library.PageBackgroundDesign;

		/**
		 * Constructor for a new <code>TabContainer</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A container control for managing multiple tabs, allowing the user to open and edit different items simultaneously.
		 *
		 * <h3>Overview</h3>
		 *
		 * The control contains a <code>TabStrip</code> area where the user can choose which tab to view/edit.
		 * When the open tabs are more than what can be displayed on the screen, there is an overflow mechanism.
		 * To access the tabs hidden in the overflow area, the user has to either use the overflow button (left or right arrow)
		 * to scroll them horizontally or the overflow overview button (down arrow) and view all open items as a list.
		 *
		 * Each tab has a title and a <i>Close Tab</i> button. The title is truncated, if it's longer than 25 characters.
		 * On desktop, the <i>Close Tab</i> button is displayed on the currently active tab and for the other tabs it appears on mouse hover.
		 * On mobile devices, the <i>Close Tab</i> buttons are always visible.
		 *
		 * To show that the open items have unsaved changes, the corresponding tabs can display an asterisk (*) after the title
		 * as a visual indication that the item is not saved. This is managed by the app developer using
		 * {@link sap.m.TabContainerItem TabContainerItem}'s <code>modified</code> property.
		 *
		 * <h3>Usage</h3>
		 *
		 * The <code>TabContainer</code> can have an <i>Add New Tab</i> button, which appears as a '+' icon on the
		 * top-right area of the control. When the user clicks or taps this button, the <code>addNewButtonPress</code> event is fired.
		 *
		 * <h3>Responsive behavior</h3>
		 *
		 * The <code>TabContainer</code> is a full-page container that takes 100% of its parent width and height.
		 * As the control is expected to occupy the whole parent, it should be the only child of its parent.
		 *
		 * When using the <code>sap.m.TabContainer</code> in SAP Quartz theme, the breakpoints and layout paddings could be determined by the container's width.
		 * To enable this concept and add responsive padding to the <code>TabContainer</code> control, you may add the following class:
		 * <code>sapUiResponsivePadding--header</code>.
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
		 */
		var TabContainer = Control.extend("sap.m.TabContainer", /** @lends sap.m.TabContainer.prototype */ {
			metadata : {
				library : "sap.m",
				properties : {

					/**
					 * Defines whether an <i>Add New Tab</i> button is displayed in the <code>TabStrip</code>.
					 */
					showAddNewButton : {type : "boolean", group : "Misc", defaultValue : false},

					/**
					 * Determines the background color of the content in <code>TabContainer</code>.
					 *
					 * @since 1.71
					 */
					backgroundDesign : {type: "sap.m.PageBackgroundDesign", group: "Appearance", defaultValue: PageBackgroundDesign.List}
				},
				aggregations : {

					/**
					 * The items displayed in the <code>TabContainer</code>.
					 */
					items : {type : "sap.m.TabContainerItem", multiple : true, singularName: "item", bindable: "bindable"},

					/**
					 * The <i>Add New Tab</i> button displayed in the <code>TabStrip</code>.
					 */
					_addNewButton : {type : "sap.m.Button", multiple : false, visibility : "hidden"},

					/**
					 * Internal aggregation for managing the tab elements.
					 */
					_tabStrip : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}
				},
				associations : {

					/**
					 * Sets or retrieves the selected item from the <code>items</code> aggregation.
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
					 * Fired when the <i>Add New Tab</i> button is pressed.
					 */
					addNewButtonPress: { }
				},
				designtime: "sap/m/designtime/TabContainer.designtime",
				dnd: { draggable: false, droppable: true }
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

				Control.prototype.constructor.apply(this, arguments);
				var oControl = new TabStrip(this.getId() + "--tabstrip", {
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
						if (this.fireItemClose({ item: oRemovedItem })) {
							if (!this.getBinding("items")) {
								this.removeItem(oRemovedItem); // the tabstrip item will also get removed
							}
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

				this.data("sap-ui-fastnavgroup", "true", true);
			},

			renderer: TabContainerRenderer
		});

		/* Contains mapping between TabContainerItem properties and TabStripItem properties,
		that may be set via setter method */
		var mTCItemToTSItemProperties = {
			"name": "text",
			"additionalText": "additionalText",
			"icon": "icon",
			"iconTooltip": "iconTooltip",
			"modified": "modified"
		};

		ResponsivePaddingsEnablement.call(TabContainer.prototype, {
			header: {selector: ".sapMTabStripContainer"}
		});

		/**
		 * Called when control is initialized.
		 */
		TabContainer.prototype.init = function () {
			this._initResponsivePaddingsEnablement();
		};

		/**
		 * Called before the control is rendered.
		 */
		TabContainer.prototype.onBeforeRendering = function() {
			this._transferItemsCustomData();

			if (this.getSelectedItem()) {
				return;
			}

			this._setDefaultTab();
		};

		/**
		 * Transfers TabContainerItems newly added customData to their respective internal TabStripItems.
		 * @private
		 */
		TabContainer.prototype._transferItemsCustomData = function() {
			var	aInnerItems = this._getTabStrip().getItems();

			this.getItems().forEach((oItem, iIndex) => {
				oItem.removeAllAggregation("customData").forEach((oCustomItem) => {
					aInnerItems[iIndex].addCustomData(oCustomItem);
				});
			});
		};

		/**
		 * Lazy loads the control attached to the private <code>Add New Button</code> aggregation
		 * @returns {null | sap.m.Button} The <code>Add New Tab</code> button if present or null
		 * @private
		 */
		TabContainer.prototype._getAddNewTabButton = function() {
			var oControl = this.getAggregation("_addNewButton");
			var oRb = Library.getResourceBundleFor("sap.m");

			if (!oControl) {
				oControl = new Button({
					type: ButtonType.Transparent,
					tooltip: oRb.getText("TABCONTAINER_ADD_NEW_TAB"),
					icon: IconPool.getIconURI("add"),
					press: function() {
						this.getParent().getParent().fireAddNewButtonPress();
					}
				});
				oControl.addStyleClass("sapMTSAddNewTabBtn");
				this.setAggregation("_addNewButton", oControl, true);
			}

			return oControl;
		};

		/**
		 * Gets a reference to the instance of the TabStrip aggregation.
		 * @returns {sap.m.TabStrip}
		 */
		TabContainer.prototype._getTabStrip = function () {
			return this.getAggregation("_tabStrip");
		};

		/**
		 * Finds a <code>TabContainerItem</code> corresponding to a given <code>TabStripItem</code>.
		 *
		 * @param {sap.m.TabStripItem} oItem <code>TabStripItem</code> instance, the corresponding <code>TabContainerItem</code> to be searched for
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
		 * @private
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
		 * Gets the <code>TabContainerItem</code> content of the selected item if present.
		 * @returns { null | Array<sap.ui.core.Control> } The <code>TabContainerItem</code> content
		 * @private
		 */
		TabContainer.prototype._getSelectedItemContent = function() {
			var oTabStrip = this._getTabStrip(),
				sSelectedItem = this.getSelectedItem(),
				oSelectedItem = Element.getElementById(sSelectedItem),
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
		 * @param {boolean} bSetAsSelected Whether the next item to be selected
		 * @private
		 */
		TabContainer.prototype._moveToNextItem = function (bSetAsSelected) {
			if (!this._getTabStrip()._oItemNavigation) {
				return;
			}

			var iItemsCount = this.getItems().length,
					iCurrentFocusedIndex = this._getTabStrip()._oItemNavigation.getFocusedIndex(),
					iNextIndex = iItemsCount === iCurrentFocusedIndex ? --iCurrentFocusedIndex : iCurrentFocusedIndex,
					oNextItem = this.getItems()[iNextIndex],
					fnFocusCallback = function () {
						if (this._getTabStrip()._oItemNavigation) {
							this._getTabStrip()._oItemNavigation.focusItem(iNextIndex);
						}
					},
					aActiveElementClasses = document.activeElement.classList;

			// Selection (causes invalidation)
			if (bSetAsSelected) {
				this.setSelectedItem(oNextItem);
				// Notify the subscriber
				this.fireItemSelect({item: oNextItem});
			}
			// Focus (force to wait until invalidated)
			if (aActiveElementClasses.contains('sapMTabStripSelectListItemCloseBtn')
				|| aActiveElementClasses.contains('sapMTabStripItem')) {
				setTimeout(fnFocusCallback.bind(this), 0);
			}
		};

		TabContainer.prototype._attachItemPropertyChanged = function (oTabContainerItem) {
			oTabContainerItem.attachItemPropertyChanged(function (oEvent) {
				var sPropertyKey = oEvent['mParameters'].propertyKey;

				if (mTCItemToTSItemProperties[sPropertyKey]) {//forward only if such property exists in TabStripItem
					sPropertyKey = mTCItemToTSItemProperties[sPropertyKey];
					var oTabStripItem = this._toTabStripItem(oEvent.getSource());
					// call it directly with the setter name so overwritten functions can be called and not setProperty method directly
					var sMethodName = "set" + sPropertyKey.substr(0,1).toUpperCase() + sPropertyKey.substr(1);
					oTabStripItem && oTabStripItem[sMethodName](oEvent['mParameters'].propertyValue);
				}
			}.bind(this));
		};

		/**
		 * Removes an item from the aggregation named <code>items</code>.
		 *
		 * @param {int | sap.ui.core.ID | sap.m.TabContainerItem} vItem The item to remove or its index or ID
		 * @returns {sap.m.TabContainerItem|null} The removed item or <code>null</code>
		 * @public
		 */
		TabContainer.prototype.removeItem = function(vItem) {
			var oTabStrip = this._getTabStrip(),
				bIsSelected, oTab;

			if (typeof vItem === "undefined" || vItem === null) {
				return null;
			}

			//Remove the corresponding TabContainerItem
			vItem = this.removeAggregation("items", vItem);

			// The selection flag of the removed item
			bIsSelected = vItem.getId() === this.getSelectedItem();

			oTab = this._toTabStripItem(vItem);
			if (oTab.getId() === oTabStrip.getSelectedItem()) {
				oTabStrip.removeAllAssociation("selectedItem", true);
			}
			oTabStrip.removeItem(oTab);

			// Perform selection switch
			this._moveToNextItem(bIsSelected);

			return vItem;
		};

		/**
		 * Overrides the method in order to handle propagation of item property changes to the <code>_tabStrip</code> instance copies.
		 *
		 * @param {string} sAggregationName Name of the added aggregation
		 * @param {object} oObject Instance that is going to be added
		 * @param {boolean} bSuppressInvalidate Flag indicating whether invalidation should be suppressed
		 * @returns {this} Reference to <code>this</code> for method chaining
		 */
		TabContainer.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			if (sAggregationName === 'items') {
				this._attachItemPropertyChanged(oObject);
			}

			return Control.prototype.addAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
		};

		/**
		 * Overrides the method in order to handle propagation of item property changes to the <code>_tabStrip</code> instance copies.
		 *
		 * @param {string} sAggregationName Name of the added aggregation
		 * @param {object} oObject Instance that is going to be added
		 * @param {int} iIndex Index to insert the item
		 * @param {boolean} bSuppressInvalidate Flag indicating whether invalidation should be suppressed
		 * @returns {this} Reference to <code>this</code> for method chaining
		 */
		TabContainer.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
			if (sAggregationName === 'items') {
				this._attachItemPropertyChanged(oObject);
			}

			return Control.prototype.insertAggregation.call(this, sAggregationName, oObject, iIndex, bSuppressInvalidate);
		};

		/**
		 * Adds a new <code>TabContainerItem</code> to the <code>items</code> aggregation.
		 *
		 * @param {sap.m.TabContainerItem} oItem The new <code>TabContainerItem</code> to be added
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 * @override
		 */
		TabContainer.prototype.addItem = function(oItem) {
			this.addAggregation("items", oItem, false);

			this._getTabStrip().addItem(
				new TabStripItem({
					key: oItem.getId(),
					text: oItem.getName(),
					additionalText: oItem.getAdditionalText(),
					icon: oItem.getIcon(),
					iconTooltip: oItem.getIconTooltip(),
					modified: oItem.getModified(),
					tooltip: oItem.getTooltip(),
					customData: oItem.getCustomData()
				})
			);

			return this;
		};

		/**
		 * Destroys all <code>TabContainerItem</code> entities from the <code>items</code> aggregation.
		 *
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 * @override
		 */
		TabContainer.prototype.destroyItems = function() {
			this._getTabStrip().destroyItems();
			this.setAssociation("selectedItem", null);

			return this.destroyAggregation("items");
		};

		/**
		 * Inserts a new <code>TabContainerItem</code>, to the <code>items</code> aggregation, at a specified index.
		 *
		 * @param {sap.m.TabContainerItem} oItem The new <code>TabContainerItem</code> to be inserted
		 * @param {int} iIndex The index where the passed <code>TabContainerItem</code> to be inserted
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 * @override
		 */
		TabContainer.prototype.insertItem = function(oItem, iIndex) {
			this._getTabStrip().insertItem(
				new TabStripItem({
					key: oItem.getId(),
					text: oItem.getName(),
					additionalText: oItem.getAdditionalText(),
					icon: oItem.getIcon(),
					iconTooltip: oItem.getIconTooltip(),
					modified: oItem.getModified(),
					tooltip: oItem.getTooltip(),
					customData: oItem.getCustomData()
				}),
				iIndex
			);

			return this.insertAggregation("items", oItem, iIndex);
		};

		/**
		 * Removes all <code>TabContainerItem</code> entities from the <code>items</code> aggregation.
		 *
		 * @returns {sap.m.TabContainerItem[]} The removed items
		 * @public
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
		 * @param {sap.m.Button} oButton The <code>Add New Tab</code> button displayed in the <code>TabStrip</code>
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 * @override
		 */
		TabContainer.prototype.setAddButton = function (oButton) {
			return this._getTabStrip().setAddButton(oButton);
		};

		/**
		 * Overrides the addButton property getter to proxy to the <code>TabStrip</code>.
		 *
		 * @returns {sap.m.Button} The <code>Add New Tab</code> button displayed in the <code>TabStrip</code>
		 * @public
		 * @override
		 */
		TabContainer.prototype.getAddButton = function () {
			return this._getTabStrip().getAddButton();
		};

		/*
		 * Override <code>showAddNewButton</code> property setter to proxy to the <code>TabStrip</code>.
		 *
		 * @param {boolean} bShowButton Whether to show the <code>addNewButton</code>
		 * @returns {this} <code>this</code> pointer for chaining
		 * @override
		 */
		TabContainer.prototype.setShowAddNewButton = function (bShowButton) {
			this.setProperty("showAddNewButton", bShowButton, true);

			if (Device.system.phone) {
				bShowButton ? this.addStyleClass("sapUiShowAddNewButton") : this.removeStyleClass("sapUiShowAddNewButton");
			}

			var oTabStrip = this._getTabStrip();
			if (oTabStrip) {
				oTabStrip.setAddButton(bShowButton ? this._getAddNewTabButton() : null);
			}

			return this;
		};

		/*
		 * Override <code>selectedItem</code> property setter.
		 *
		 * @param {sap.m.TabContainerItem} oSelectedItem The new <code>TabContainerItem</code> to be selected
		 * @param {jQuery.Event} oEvent  Event object that may be present when the selection change is bubbling
		 * @returns {this} <code>this</code> pointer for chaining
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
				this.setAssociation("selectedItem", oSelectedItem, true); //render manually;
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
		 * @param {Object} oContent The content, which should be rendered.
		 */
		TabContainer.prototype._rerenderContent = function(oContent) {
			var $content = this.$("content"),
				oRM;

			if (!oContent || ($content.length <= 0)) {
				return;
			}

			oRM = new RenderManager().getInterface();
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
	});