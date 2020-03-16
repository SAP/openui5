/*!
 * ${copyright}
 */

// Provides control sap.m.IconTabHeader.

sap.ui.define([
	'./library',
	'sap/ui/core/Core',
	'sap/ui/core/Control',
	'sap/ui/core/EnabledPropagator',
	'sap/ui/core/delegate/ItemNavigation',
	"sap/ui/core/InvisibleText",
	'sap/ui/core/ResizeHandler',
	'./IconTabBarSelectList',
	'./Button',
	'./AccButton',
	'./ResponsivePopover',
	'./IconTabFilter',
	'./IconTabSeparator',
	'sap/ui/Device',
	'./IconTabBarDragAndDropUtil',
	'./IconTabHeaderRenderer',
	"sap/ui/thirdparty/jquery",
	"sap/base/Log",
	"sap/ui/events/KeyCodes"
], function (
	library,
	Core,
	Control,
	EnabledPropagator,
	ItemNavigation,
	InvisibleText,
	ResizeHandler,
	IconTabBarSelectList,
	Button,
	AccButton,
	ResponsivePopover,
	IconTabFilter,
	IconTabSeparator,
	Device,
	IconTabBarDragAndDropUtil,
	IconTabHeaderRenderer,
	jQuery,
	Log,
	KeyCodes
) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = library.BackgroundDesign;

	// shortcut for sap.m.IconTabHeaderMode
	var IconTabHeaderMode = library.IconTabHeaderMode;

	// shortcut for sap.m.IconTabDensityMode
	var IconTabDensityMode = library.IconTabDensityMode;

	/**
	 * Constructor for a new IconTabHeader.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control displays a number of IconTabFilters and IconTabSeparators. If the available horizontal
	 * space is exceeded, a horizontal scrolling appears.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.IconTabHeader
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var IconTabHeader = Control.extend("sap.m.IconTabHeader", /** @lends sap.m.IconTabHeader.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Defines whether the current selection is visualized.
			 * @deprecated As of 1.15.0.
			 * Regarding to changes of this control this property is not needed anymore.
			 */
			showSelection : {type : "boolean", group : "Misc", defaultValue : true, deprecated: true},

			/**
			 * Key of the selected item.
			 *
			 * If the key has no corresponding aggregated item, no changes will apply.
			 * If duplicate keys exists the first item matching, the key is used.
			 * @since 1.15.0
			 */
			selectedKey : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Specifies whether the control is rendered.
			 * @since 1.15.0
			 */
			visible : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Specifies the header mode.
			 * <b>Note:</b> The Inline mode works only if no icons are set.
			 *
			 * @since 1.40
			 */
			mode : {type : "sap.m.IconTabHeaderMode", group : "Appearance", defaultValue : IconTabHeaderMode.Standard},

			/**
			 * Specifies if the overflow select list is displayed.
			 *
			 * The overflow select list represents a list, where all tab filters are displayed,
			 * so the user can select specific tab filter easier.
			 * @deprecated as of 1.75
			 */
			showOverflowSelectList : {type : "boolean", group : "Appearance", defaultValue : false, deprecated: true },

			/**
			 * Specifies the background color of the header.
			 *
			 * Depending on the theme, you can change the state of
			 * the background color to "Solid", "Translucent", or "Transparent".
			 * Default is "Solid".
			 * @since 1.44
			 */
			backgroundDesign : {type : "sap.m.BackgroundDesign", group : "Appearance", defaultValue : BackgroundDesign.Solid},

			/**
			 * Specifies whether tab reordering is enabled. Relevant only for desktop devices.
			 * The {@link sap.m.IconTabSeparator sap.m.IconTabSeparator} cannot be dragged  and dropped
			 * Items can be moved around {@link sap.m.IconTabSeparator sap.m.IconTabSeparator}
			 * @since 1.46
			 */
			enableTabReordering : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Specifies the visual density mode of the tabs.
			 *
			 * The values that can be applied are <code>Cozy</code>, <code>Compact</code> and <code>Inherit</code>.
			 * <code>Cozy</code> and <code>Compact</code> render the control in one of these modes independent of the global density settings.
			 * The <code>Inherit</code> value follows the global density settings which are applied.
			 * For compatibility reasons, the default value is <code>Cozy</code>.
			 * @since 1.56
			 */
			tabDensityMode :{type : "sap.m.IconTabDensityMode", group : "Appearance", defaultValue : IconTabDensityMode.Cozy}
		},
		aggregations : {

			/**
			 * The items displayed in the IconTabHeader.
			 */
			items : {type : "sap.m.IconTab", multiple : true, singularName : "item", dnd : {draggable: true, droppable: true, layout: "Horizontal"} },

			/**
			 * Internal aggregation for managing the overflow button.
			 */
			_overflowButton : {type : "sap.m.Button", multiple : false, visibility : "hidden"}
		},
		events : {

			/**
			 * Fires when an item is selected.
			 */
			select : {
				parameters : {

					/**
					 * The selected item
					 * @since 1.15.0
					 */
					item : {type : "sap.m.IconTabFilter"},

					/**
					 * The key of the selected item
					 * @since 1.15.0
					 */
					key : {type : "string"}
				}
			}
		}
	}});

	/**
	 * Library internationalization resource bundle.
	 *
	 * @type {sap.base.i18n.ResourceBundle}
	 */
	var oResourceBundle = Core.getLibraryResourceBundle("sap.m");

	EnabledPropagator.apply(IconTabHeader.prototype, [true]);

	IconTabHeader.prototype.init = function () {
		this._aTabKeys = [];
		this._oAriaHeadText = new InvisibleText({
			id: this.getId() + "-ariaHeadText",
			text: oResourceBundle.getText("ICONTABHEADER_DESCRIPTION")
		});
	};

	IconTabHeader.prototype.exit = function () {
		if (this._oItemNavigation) {
			this.removeDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			delete this._oItemNavigation;
		}
		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}
		if (this._aTabKeys) {
			this._aTabKeys = null;
		}
		if (this._oPopover) {
			this._oPopover.destroy();
			this._oPopover = null;
		}

		this._oAriaHeadText.destroy();
		this._oAriaHeadText = null;
	};

	IconTabHeader.prototype.onBeforeRendering = function () {
		this._bRtl = Core.getConfiguration().getRTL();
		this._onOverflowButtonEventDelegate = {
			onlongdragover: this._handleOnLongDragOver.bind(this),
			ondragover: this._handleOnDragOver.bind(this),
			ondragleave: this._handleOnDragLeave.bind(this),
			ondrop: this._handleOnDrop.bind(this),
			onsapnext: this._overflowButtonPress.bind(this)
		};

		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}

		this._updateSelection();
		this._setsDragAndDropConfigurations();
	};

	IconTabHeader.prototype.onAfterRendering = function () {
		this._applyTabDensityMode();

		var oParent = this.getParent();
		var bIsParentIconTabBar = this._isInsideIconTabBar();

		if (this.oSelectedItem &&
			(!bIsParentIconTabBar || bIsParentIconTabBar && oParent.getExpanded())) {
			this.oSelectedItem.$()
				.addClass("sapMITBSelected")
				.attr({ 'aria-selected': true });

			if (this._oSelectedRootItem) {
				this._oSelectedRootItem.$().addClass("sapMITBSelected");
				this._oSelectedRootItem.$().attr({ "aria-selected": true });
			}
		}

		if (Core.isThemeApplied()) {
			this._setItemsForStrip();
		} else {
			Core.attachThemeChanged(this._handleThemeLoad, this);
		}

		this._initItemNavigation();

		//listen to resize
		this._sResizeListenerId = ResizeHandler.register(this.getDomRef(), jQuery.proxy(this._fnResize, this));
	};

	/**
	 * Returns overflow select list
	 * @private
	 */
	IconTabHeader.prototype._getSelectList = function () {
		if (!this._oSelectList) {
			this._oSelectList = new IconTabBarSelectList({
				selectionChange: function (oEvent) {
					var oTarget = oEvent.getParameter('selectedItem');
					var oFilter = oTarget._getRealTab();

					this._oIconTabHeader.setSelectedItem(oFilter);
					this._oIconTabHeader._closeOverflow();
				}
			});
			this._oSelectList._oIconTabHeader = this;
		}

		return this._oSelectList;
	};

	/**
	 * Returns overflow button
	 * @private
	 */
	IconTabHeader.prototype._getOverflowButton = function () {
		var oOverflowButton = this.getAggregation("_overflowButton");

		if (!oOverflowButton) {
			oOverflowButton = new AccButton({
				id: this.getId() + '-overflowButton',
				type: ButtonType.Transparent,
				icon: "sap-icon://slim-arrow-down",
				iconFirst: false,
				ariaHaspopup: true,
				tabIndex: "-1",
				press: this._overflowButtonPress.bind(this)
			});
			oOverflowButton.addEventDelegate(this._onOverflowButtonEventDelegate);
			this.setAggregation("_overflowButton", oOverflowButton);
		}

		return oOverflowButton;
	};

	/**
	 * Handles overflow button "press" event
	 * @private
	 */
	IconTabHeader.prototype._overflowButtonPress = function () {
		if (!this._oPopover) {
			this._oPopover = new ResponsivePopover({
					showArrow: false,
					showHeader: false,
					offsetX: 0,
					offsetY: 0,
					placement: PlacementType.VerticalPreferredBottom
				}
			).addStyleClass("sapMITBPopover");

			this._oPopover.attachBeforeClose(function () {
				this._getSelectList().destroyItems();
			}, this);

			if (Device.system.phone) {
				this._oPopover._oControl.addButton(this._createPopoverCloseButton());
			}

			this.addDependent(this._oPopover);

			this._oPopover._oControl._adaptPositionParams = function () {
				var bCompact = this.$().parents().hasClass("sapUiSizeCompact");
				this._arrowOffset = 0;
				if (bCompact) {
					this._offsets = ["0 0", "0 0", "0 4", "0 0"];
				} else {
					this._offsets = ["0 0", "0 0", "0 5", "0 0"];
				}
				this._atPositions = ["end top", "end top", "end bottom", "begin top"];
				this._myPositions = ["end bottom", "begin top", "end top", "end top"];
			};
		}

		this._setSelectListItems();
		var oSelectList = this._getSelectList();

		this._oPopover.removeAllContent();
		this._oPopover.addContent(oSelectList)
			.setInitialFocus(oSelectList.getItems()[0])
			.openBy(this._getOverflowButton());
	};

	/**
	 * Creates popover close button
	 * @private
	 */
	IconTabHeader.prototype._createPopoverCloseButton = function () {
		return new Button({
			text: oResourceBundle.getText("SELECT_CANCEL_BUTTON"),
			press: this._closeOverflow.bind(this)
		});
	};

	/**
	 * Closes the overflow popover and focuses the correct tab filter
	 * @private
	 */
	IconTabHeader.prototype._closeOverflow = function () {
		if (this._oPopover) {
			this._oPopover.close();
			this._oPopover.removeAllContent();
		}

		if (this.oSelectedItem) {
			(this._oSelectedRootItem || this.oSelectedItem).$().focus();
		}
	};

	/**
	 * Sets overflow items
	 *
	 * @returns {sap.ui.core.Element}
	 * @private
	 */
	IconTabHeader.prototype._setSelectListItems = function () {
		var oSelectList = this._getSelectList(),
		// TODO: get all items, not just tab filters for the next iteration of ITB 3.0
			aTabFilters = this.getTabFilters(),
			aItemsInStrip = this._getItemsInStrip();

		oSelectList.destroyItems();
		oSelectList.setSelectedItem(null);

		for (var i = 0; i < aTabFilters.length; i++) {
			var oTabFilter = aTabFilters[i];

			if (aItemsInStrip.indexOf(oTabFilter) !== -1) {
				// Tab Filter already in Tab Strip, do not add to overflow
				continue;
			}

			var oSelectListItem = oTabFilter.clone(undefined, undefined, { cloneChildren: false, cloneBindings: true });
			oSelectListItem._tabFilter = oTabFilter;
			oSelectList.addItem(oSelectListItem);

			if (oTabFilter == this.oSelectedItem) {
				oSelectList.setSelectedItem(oSelectListItem);
			}

		}
	};

	/**
	 * Returns SelectList item, that corresponds ot specific TabFilter.
	 * @private
	 */
	IconTabHeader.prototype._findSelectItem = function (oTabFilter) {
		var oSelectList = this._getSelectList(),
			aSelectListItems = oSelectList.getItems(),
			oSelectItem;

		for (var i = 0; i < aSelectListItems.length; i++){
			oSelectItem = aSelectListItems[i];
			if (oSelectItem._getRealTab() == oTabFilter) {
				return oSelectItem;
			}
		}
	};

	IconTabHeader.prototype._onItemNavigationFocusLeave = function () {
		// BCP: 1570034646
		if (!this.oSelectedItem) {
			return;
		}

		var aItems = this.getItems();
		var iIndex = -1;
		var oItem;

		for (var i = 0; i < aItems.length; i++) {
			oItem = aItems[i];

			if (oItem instanceof IconTabFilter == false) {
				continue;
			}

			iIndex++;

			if ((this._oSelectedRootItem || this.oSelectedItem) == oItem) {
				break;
			}
		}
		this._oItemNavigation.setFocusedIndex(iIndex);
	};

	/**
	 * Returns all tab filters, without the tab separators.
	 * @private
	 */
	IconTabHeader.prototype.getTabFilters = function () {
		var aTabFilters = [];
		this.getItems().forEach(function(oItem) {
			if (oItem instanceof IconTabFilter) {
				aTabFilters.push(oItem);
			}
		});

		return aTabFilters;
	};

	/**
	 * Handles onLongDragOver of overflow button.
	 * @private
	 */
	IconTabHeader.prototype._handleOnLongDragOver = function () {
		if (!this._oPopover || !this._oPopover.isOpen()) {
			this._overflowButtonPress();
		}
	};

	/**
	 * Handles onDragOver of the overflow button.
	 * @private
	 * @param {jQuery.Event} oEvent The jQuery drag over event
	 */
	IconTabHeader.prototype._handleOnDragOver = function (oEvent) {
		this._getOverflowButton().addStyleClass("sapMBtnDragOver");
		oEvent.preventDefault(); // allow drop, so that the cursor is correct
	};

	/**
	 * Handles onDrop of the overflow button.
	 * @private
	 */
	IconTabHeader.prototype._handleOnDrop = function () {
		this._getOverflowButton().removeStyleClass("sapMBtnDragOver");
	};

	/**
	 * Handles onDragLeave of the overflow button.
	 * @private
	 */
	IconTabHeader.prototype._handleOnDragLeave = function () {
		this._getOverflowButton().removeStyleClass("sapMBtnDragOver");
	};

	/**
	 * Sets or remove Drag and Drop configurations.
	 * @private
	 */
	IconTabHeader.prototype._setsDragAndDropConfigurations = function () {
		if (!this.getEnableTabReordering() && this.getDragDropConfig().length) {
			//Destroying Drag&Drop aggregation
			this.destroyDragDropConfig();
		} else if (this.getEnableTabReordering() && !this.getDragDropConfig().length) {
			//Adding Drag&Drop configuration to the dragDropConfig aggregation if needed
			IconTabBarDragAndDropUtil.setDragDropAggregations(this, "Horizontal");
		}
	};

	/**
	 * Sets the selected item based on key.
	 * @overwrite
	 * @public
	 * @param {string} sKey The key of the item to be selected
	 * @return {sap.m.IconTabHeader} this pointer for chaining
	 */
	IconTabHeader.prototype.setSelectedKey = function (sKey) {
		var aItems = this.getTabFilters(),
			bIsParentIconTabBar = this._isInsideIconTabBar(),
			bSelectedItemFound;

		if (aItems.length > 0) {
			sKey = sKey || aItems[0]._getNonEmptyKey();
		}

		// adjust UI and internal variables if already rendered (otherwise taken care by onBeforeRendering)
		if (this.$().length) {
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i]._getNonEmptyKey() === sKey) {
					this.setSelectedItem(aItems[i], true);
					bSelectedItemFound = true;
					break;
				}
			}

			if (!bSelectedItemFound && !bIsParentIconTabBar && sKey) {
				this.setSelectedItem(null);
			}
		}

		// set internal property
		this.setProperty("selectedKey", sKey, true);
		return this;
	};

	/*
	 * Sets the selected item, updates the UI, and fires the select event.
	 * @private
	 * @param {sap.m.IconTabFilter} oItem The item to be selected
	 * @param {Boolean} bAPIChange whether this function is called through the API
	 * @return {sap.m.IconTabHeader} this pointer for chaining
	 */
	IconTabHeader.prototype.setSelectedItem = function (oItem, bAPIchange) {
		if (!oItem) {
			if (this.oSelectedItem) {
				this.oSelectedItem.$().removeClass("sapMITBSelected");
				this.oSelectedItem = null;

				if (this._oSelectedRootItem) {
					this._oSelectedRootItem.getDomRef().classList.remove("sapMITBSelected");
					this._oSelectedRootItem = null;
				}
			}

			return this;
		}

		if (this._isUnselectable(oItem)) {
			return this;
		}

		var oParent = this.getParent();
		var bIsParentIconTabBar = this._isInsideIconTabBar();

		//if the old selected tab and the new selected tab both have no own content, which means they both use the same content from the icontabbar
		//there is no need to rerender the content
		//fix for xml views css: 0120061532 0001427250 2014
		var bIsContentTheSame = false;
		if (oItem.getContent().length === 0  && this.oSelectedItem && this.oSelectedItem.getContent().length === 0) {
			bIsContentTheSame = true;
		}

		if (this.oSelectedItem &&
			this.oSelectedItem.getVisible() &&
			(!bAPIchange && bIsParentIconTabBar && oParent.getExpandable() || this.oSelectedItem !== oItem)) {
			this.oSelectedItem.$()
					.removeClass("sapMITBSelected")
					.attr('aria-selected', false)
					.removeAttr('aria-expanded');

			if (this._oSelectedRootItem) {
				this._oSelectedRootItem.$()
					.removeClass("sapMITBSelected")
					.attr('aria-selected', false)
					.removeAttr('aria-expanded');
			}

		}

		if (oItem.getVisible()) {
			//click on already selected item leads to expanding/collapsing of the content (if expandable enabled)
			if (this.oSelectedItem === oItem) {
				//if content is not expandable nothing should happen otherwise content will be expanded/collapsed
				if (!bAPIchange && bIsParentIconTabBar && oParent.getExpandable()) {
					oParent._toggleExpandCollapse();
				}
			//click on other item leads to showing the right content of this item
			} else {
				//change the content aria-labelled by the newly selected tab;
				if (bIsParentIconTabBar) {
					oParent.$("content").attr('aria-labelledby', oItem.sId);
				}

				// set new item
				this.oSelectedItem = oItem;
				// find parent if item is a sub filter within a sap.m.IconTabFilter, set the root icontabfilter as this._oSelectedDomRef
				if (this.oSelectedItem._getNestedLevel() !== 1) {
					this._oSelectedRootItem = this.oSelectedItem._getRootTab();
					this._oSelectedRootItem.$()
						.addClass("sapMITBSelected")
						.attr({ 'aria-selected': true });
				} else {
					this._oSelectedRootItem = null;
				}

				this.setProperty("selectedKey", this.oSelectedItem._getNonEmptyKey(), true);

				if (!bIsParentIconTabBar) {
					this.oSelectedItem.$()
							.addClass("sapMITBSelected")
							.attr({ 'aria-selected': true });

				}

				//if the IconTabBar is not expandable and the content not expanded (which means content can never be expanded), we do not need
				//to visualize the selection and we do not need to render the content
				if (bIsParentIconTabBar && (oParent.getExpandable() || oParent.getExpanded())) {
					// add selected styles
					this.oSelectedItem.$()
							.addClass("sapMITBSelected")
							.attr({ 'aria-selected': true });

					//if item has own content, this content is shown
					var oSelectedItemContent = this.oSelectedItem.getContent();
					if (oSelectedItemContent.length > 0) {
						oParent._rerenderContent(oSelectedItemContent);
					//if item has not own content, general content of the icontabbar is shown
					} else {
						//if the general content was already shown there is no need to rerender
						if (!bIsContentTheSame) {
							oParent._rerenderContent(oParent.getContent());
						}
					}
					//if content is not expanded, content will be expanded (first click on item always leads to expanding the right content)
					if (!bAPIchange && oParent.getExpandable() && !oParent.getExpanded()) {
						oParent._toggleExpandCollapse(true);
					}
				}
			}

		}

		this.oSelectedItem = oItem;
		var sSelectedKey = this.oSelectedItem._getNonEmptyKey();

		this.setProperty("selectedKey", sSelectedKey, true);
		if (bIsParentIconTabBar) {
			oParent.setProperty("selectedKey", sSelectedKey, true);
		}

		if (!bAPIchange) {
			// fire event on iconTabBar
			if (bIsParentIconTabBar) {
				oParent.fireSelect({
					selectedItem: this.oSelectedItem,
					selectedKey: sSelectedKey,
					item: this.oSelectedItem,
					key: sSelectedKey
				});
			} else {
				// fire event on header
				this.fireSelect({
					selectedItem: this.oSelectedItem,
					selectedKey: sSelectedKey,
					item: this.oSelectedItem,
					key: sSelectedKey
				});
			}
		}

		this._setItemsForStrip();
		return this;
	};

	/**
	 * Returns all the visible tab filters.
	 * @private
	 * @returns {Array} Array of visible items.
	 */
	IconTabHeader.prototype.getVisibleTabFilters = function () {
		return this.getTabFilters().filter(function (oFilter) {
			return oFilter.getVisible();
		});
	};

	IconTabHeader.prototype._initItemNavigation = function () {
		var that = this,
			aItems = this.getItems(),
			aTabDomRefs = [],
			iSelectedDomIndex = -1;

		// find a collection of all tabs
		aItems.forEach(function (oItem) {
			if (oItem.isA("sap.m.IconTabFilter")) {
				var oItemDomRef = that.getFocusDomRef(oItem);
				if (!oItemDomRef) {
					return;
				}
				oItemDomRef.setAttribute("tabindex", "-1");
				aTabDomRefs.push(oItemDomRef);
				if (oItem === that.oSelectedItem || oItem === that._oSelectedRootItem) {
					iSelectedDomIndex = aTabDomRefs.indexOf(oItemDomRef);
				}
			}
		});

		if (this.$().hasClass("sapMITHOverflowList")) {
			aTabDomRefs.push(this._getOverflowButton().getFocusDomRef());
		}

		//Initialize the ItemNavigation
		if (!this._oItemNavigation) {
			this._oItemNavigation = new ItemNavigation()
				.setCycling(false)
				.attachEvent(ItemNavigation.Events.FocusLeave, this._onItemNavigationFocusLeave, this)
				.setDisabledModifiers({
					sapnext : ["alt", "meta"],
					sapprevious : ["alt", "meta"]
				});

			this.addDelegate(this._oItemNavigation);
		}

		//Reinitialize the ItemNavigation after rendering
		this._oItemNavigation.setRootDomRef(this.getDomRef())
			.setItemDomRefs(aTabDomRefs)
			.setPageSize(aTabDomRefs.length) // set the page size equal to the tab number so when we press pageUp/pageDown to focus first/last tab
			.setSelectedIndex(iSelectedDomIndex);
	};

	IconTabHeader.prototype.onThemeChanged = function () {
		this._applyTabDensityMode();
	};

	IconTabHeader.prototype._applyTabDensityMode = function () {
		var sTabDensityMode = this.getTabDensityMode();
		this.$().removeClass("sapUiSizeCompact");

		switch (sTabDensityMode) {
			case IconTabDensityMode.Compact:
				this.$().addClass("sapUiSizeCompact");
				break;
			case  IconTabDensityMode.Inherit:
				if (this.$().closest(".sapUiSizeCompact").length) {
					this.$().addClass("sapUiSizeCompact");
				}
				break;
		}
	};

	/**
	 * Fired when the theme is loaded
	 *
	 * @private
	 */
	IconTabHeader.prototype._handleThemeLoad = function () {
		setTimeout(this._setItemsForStrip.bind(this), 350);
		Core.detachThemeChanged(this._handleThemeLoad, this);
	};

	/*
	 * Destroys the item aggregation.
	 */
	IconTabHeader.prototype.destroyItems = function () {
		this.oSelectedItem = null;
		this._aTabKeys = [];
		this.destroyAggregation("items");
		return this;
	};

	IconTabHeader.prototype.addItem = function (oItem) {
		if (!(oItem instanceof IconTabSeparator)) {
			var sKey = oItem.getKey();
			// check if key is a duplicate
			if (this._aTabKeys.indexOf(sKey) !== -1) {
				Log.warning("sap.m.IconTabHeader: duplicate key '" + sKey + "' inside the IconTabFilter. Please use unique keys.");
			}
			this._aTabKeys.push(sKey);
		}
		this.addAggregation("items", oItem);

		this._invalidateParentIconTabBar();
	};

	IconTabHeader.prototype.insertItem = function (oItem, iIndex) {
		if (!(oItem instanceof IconTabSeparator)) {
			var sKey = oItem.getKey();
			//check if key is a duplicate
			if (this._aTabKeys.indexOf(sKey) !== -1) {
				Log.warning("sap.m.IconTabHeader: duplicate key '" + sKey + "' inside the IconTabFilter. Please use unique keys.");
			}
			this._aTabKeys.push(sKey);
		}
		this.insertAggregation("items", oItem, iIndex);

		this._invalidateParentIconTabBar();
	};

	IconTabHeader.prototype.removeAllItems = function () {
		var oResult = this.removeAllAggregation("items");

		this._aTabKeys = [];
		this.oSelectedItem = null;

		this._invalidateParentIconTabBar();

		return oResult;
	};

	IconTabHeader.prototype.removeItem = function (oItem) {
		// Make sure we have the actual Item and not just an ID
		oItem = this.removeAggregation("items", oItem);

		if (oItem && !(oItem instanceof IconTabSeparator)) {
			var sKey = oItem.getKey();
			this._aTabKeys.splice(this._aTabKeys.indexOf(sKey) , 1);
		}

		if (this.oSelectedItem === oItem) {
			this.oSelectedItem = null;
		}

		this._invalidateParentIconTabBar();

		// Return the original value from removeAggregation
		return oItem;
	};

	IconTabHeader.prototype.updateAggregation = function () {
		this.oSelectedItem = null;
		Control.prototype.updateAggregation.apply(this, arguments);
		this.invalidate();
	};

	IconTabHeader.prototype.removeAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {

		var aItems = this.getTabFilters();

		var oItem = Control.prototype.removeAggregation.apply(this, arguments);

		if (bSuppressInvalidate) {
			return oItem;
		}

		if (oItem && oItem == this.oSelectedItem && sAggregationName == 'items') {

			var iIndexOf = (aItems ? Array.prototype.indexOf.call(aItems, oItem) : -1);
			aItems = this.getTabFilters();

			iIndexOf = Math.max(0, Math.min(iIndexOf, aItems.length - 1));

			var oSelectedItem = aItems[iIndexOf];

			if (oSelectedItem) {
				this.setSelectedItem(oSelectedItem, true);
			} else {
				var oIconTabBar = this.getParent();
				if (this._isInsideIconTabBar() && oIconTabBar.getExpanded()) {
					oIconTabBar.$("content").children().remove();
				}
			}
		}

		return oItem;
	};

	IconTabHeader.prototype.removeAllAggregation = function (sAggregationName, bSuppressInvalidate) {

		if (sAggregationName == 'items') {
			var oIconTabBar = this.getParent();
			if (this._isInsideIconTabBar() && oIconTabBar.getExpanded()) {
				oIconTabBar.$("content").children().remove();
			}
		}

		return Control.prototype.removeAllAggregation.apply(this, arguments);
	};

	/**
	 * Returns the displayed text - text or text + (count)
	 * @private
	 */
	IconTabHeader.prototype._getDisplayText = function (oItem) {
		var sText = oItem.getText();

		if (this.isInlineMode()) {
			var sCount = oItem.getCount();
			if (sCount) {
				if (this._bRtl) {
					sText = '(' + sCount + ') ' + sText;
				} else {
					sText += ' (' + sCount + ')';
				}
			}
		}

		return sText;
	};

	/**
	 * Returns if the header is in inline mode.
	 * @private
	 */
	IconTabHeader.prototype.isInlineMode = function () {
		return this._bTextOnly && this.getMode() == IconTabHeaderMode.Inline;
	};

	/**
	 * Checks if all tabs are textOnly version.
	 * @private
	 * @returns {boolean} True if all tabs are textOnly version, otherwise false
	 */
	IconTabHeader.prototype._checkTextOnly = function () {
		this._bTextOnly = this.getItems().every(function (oItem) {
			return oItem instanceof IconTabSeparator || !oItem.getIcon();
		});

		return this._bTextOnly;
	};

	/**
	 * Checks if all tabs are noText version.
	 * @private
	 * @returns True if all tabs are noText version, otherwise false
	 */
	IconTabHeader.prototype._checkNoText = function (aItems) {
		if (aItems.length > 0) {
			for (var i = 0; i < aItems.length; i++) {
				if (!(aItems[i] instanceof IconTabSeparator)) {
					if (aItems[i].getText().length > 0) {
						return false;
					}
				}
			}
		}
		return true;
	};

	/**
	 * Checks if all tabs are in line version.
	 * @private
	 * @returns True if all tabs are in line version, otherwise false
	 */
	IconTabHeader.prototype._checkInLine = function (aItems) {
		var oItem;
		if (aItems.length > 0) {
			for (var i = 0; i < aItems.length; i++) {
				oItem = aItems[i];

				if (!(oItem instanceof IconTabSeparator)) {
					if (oItem.getIcon() || oItem.getCount()) {
						this._bInLine = false;
						return false;
					}
				}
			}
		}

		this._bInLine = true;
		return true;
	};

	/**
	 * @private
	 */
	IconTabHeader.prototype._getItemsInStrip = function () {
		return this.getItems().filter(function (oItem) {
			var oItemDomRef = oItem.getDomRef();
			return oItemDomRef && !oItemDomRef.classList.contains("sapMITBFilterHidden");
		});
	};

	/**
	 * @private
	 */
	IconTabHeader.prototype._setItemsForStrip = function () {
		var aTabFilters = this.getVisibleTabFilters();

		if (!Core.isThemeApplied() || !aTabFilters.length) {
			return;
		}

		var oTabStrip = this.getDomRef("head"),
			oSelectedItem = (this.oSelectedItem && this.oSelectedItem.getVisible()) ?  this.oSelectedItem : aTabFilters[0];

		if (!oTabStrip) {
			// control has not been rendered, exit
			return;
		}

		if (this._oPopover) {
			this._oPopover.close();
		}

		var iTabStripWidth = oTabStrip.offsetWidth,
			oItem,
			i,
			oSelectedItemDomRef = (this._oSelectedRootItem || oSelectedItem).getDomRef(),
			aItems = this.getItems()
				.filter(function (oItem) { return oItem.getDomRef(); })
				.map(function (oItem) { return oItem.getDomRef(); });

		if (!aItems.length || !oSelectedItemDomRef) {
			return;
		}

		// reset all display styles and their initial order to calculate items' width
		aItems.forEach(function (oItem) {
			oItem.style.width = "";
			oItem.classList.remove("sapMITBFilterHidden");
		});

		oSelectedItemDomRef.classList.remove("sapMITBFilterTruncated");

		// find all fitting items, start with selected item's width
		var oSelectedItemStyle = window.getComputedStyle(oSelectedItemDomRef);
		var iSumFittingItems = oSelectedItemDomRef.offsetWidth  + Number.parseInt(oSelectedItemStyle.marginLeft) + Number.parseInt(oSelectedItemStyle.marginRight);
		aItems.splice(aItems.indexOf(oSelectedItemDomRef), 1);

		if (iTabStripWidth < iSumFittingItems) {
			// selected item can't fit fully, truncate it's text and put all other items in the overflow
			oSelectedItemDomRef.style.width = iTabStripWidth - 20 + "px";
			oSelectedItemDomRef.classList.add("sapMITBFilterTruncated");
			for (i = 0; i < aItems.length; i++) {
				oItem = aItems[i];
				if (oItem) {
					oItem.classList.add("sapMITBFilterHidden");
				}
			}
			return;
		}

		var iLastVisible = -1;
		// hide all items after the fitting items, selected item will take place as the last fitting item, if it's out of order
		for (i = 0; i < aItems.length; i++) {
			oItem = aItems[i];
			var oStyle = window.getComputedStyle(oItem);
			var iItemSize = oItem.offsetWidth + Number.parseInt(oStyle.marginLeft) + Number.parseInt(oStyle.marginRight);

			if (iTabStripWidth > (iSumFittingItems + iItemSize)) {
				iSumFittingItems += iItemSize;
				iLastVisible = i;
			} else {
				break;
			}
		}

		for (i = iLastVisible + 1; i < aItems.length; i++) {
			oItem = aItems[i];
			oItem.classList.add("sapMITBFilterHidden");
		}

		this.$().toggleClass("sapMITHOverflowList", iLastVisible + 1 !== aItems.length);
	};

	/**
	 * Handles the activation of the tabs and arrows.
	 * @private
	 */
	IconTabHeader.prototype._handleActivation = function(oEvent) {
		var sTargetId = oEvent.target.id,
			oControl = oEvent.srcControl,
			sControlId,
			$target = jQuery(oEvent.target);

		if (oControl instanceof Button) {
			return;
		}

		var $sTargetId = jQuery(document.getElementById(sTargetId));
		/*eslint-disable no-empty */
		// TODO check better implementation
		if ($sTargetId.parents() && Array.prototype.indexOf.call($sTargetId.parents(), this.$("content")[0]) > -1) {
		/*eslint-enable no-empty */
			//do nothing because element is inside content
		} else {
			if (sTargetId) {
				// For items: do not navigate away! Stay on the page and handle the click in-place. Right-click + "Open in new Tab" still works.
				// For scroll buttons: Prevent IE from firing beforeunload event -> see CSN 4378288 2012
				oEvent.preventDefault();

				// should be one of the items - select it
				if ($target.hasClass('sapMITBFilterIcon') || $target.hasClass('sapMITBCount') || $target.hasClass('sapMITBText') || $target.hasClass('sapMITBTab') || $target.hasClass('sapMITBContentArrow') || $target.hasClass('sapMITBSep') || $target.hasClass('sapMITBSepIcon')) {
					// click on icon: fetch filter instead
					sControlId = oEvent.srcControl.getId().replace(/-icon$/, "");
					oControl = Core.byId(sControlId);
					if (oControl.getMetadata().isInstanceOf("sap.m.IconTab") && !(oControl instanceof IconTabSeparator)) {

						if (this._isUnselectable(oControl)) {
							if (oControl.getItems().length) {
								oControl._expandButtonPress();
							}
							return;
						}

						this.setSelectedItem(oControl);
					}
				} else if (oControl.getMetadata().isInstanceOf("sap.m.IconTab") && !(oControl instanceof IconTabSeparator)) {
					// select item if it is an iconTab but not a separator
					if (this._isUnselectable(oControl)) {
						if (oControl.getItems().length) {
							oControl._expandButtonPress();
						}
						return;
					}

					this.setSelectedItem(oControl);
				}
			} else {
				//no target id, so we have to check if showAll is set or it's a text only item, because clicking on the number then also leads to selecting the item
				if (oControl.getMetadata().isInstanceOf("sap.m.IconTab") && !(oControl instanceof IconTabSeparator)) {

					if (this._isUnselectable(oControl)) {
						if (oControl.getItems().length) {
							oControl._expandButtonPress();
						}
						return;
					}

					this.setSelectedItem(oControl);
				}
			}
		}
	};

	/**
	 * Resize handling.
	 * @private
	*/
	IconTabHeader.prototype._fnResize = function() {
		if (this._oPopover) {
			this._oPopover.close();
		}

		this._setItemsForStrip();
	};

	/**
	 * Checks if a IconTabFilter is unable to be selected.
	 * This instance of the IconTabHeader must be within an IconTabBar and the IconTabBar must have no content aggregation set.
	 * The passed IconTabFilter instance must not be nested, has to have its items aggregation set and not have content aggregation set.
	 * @private
	 * @param {sap.m.IconTabFilter} oIconTabFilter The instance to check
	 * @returns {boolean}
	 */
	IconTabHeader.prototype._isUnselectable = function (oIconTabFilter) {
		var oFilter = oIconTabFilter._getRealTab();

		return !oFilter.getEnabled() || (this._isInsideIconTabBar() && !this.getParent().getContent().length &&
			oFilter._getNestedLevel() === 1 && oFilter.getItems().length && !oFilter.getContent().length);
	};

	/**
	 * Returns if the control is inside an IconTabBar.
	 * @private
	 */
	IconTabHeader.prototype._isInsideIconTabBar = function() {
		var oParent = this.getParent();
		return oParent instanceof Control && oParent.isA('sap.m.IconTabBar');
	};

	/**
	 * Invalidates the parent if it is an IconTabBar
	 * @private
	 */
	IconTabHeader.prototype._invalidateParentIconTabBar = function() {
		if (this._isInsideIconTabBar()) {
			this.getParent().invalidate();
		}
	};

	/**
	 * @overwrite
	 */
	//overwritten method, returns for most cases the iconDomRef. if the given tab has no icon, the textDomRef is returned.
	IconTabHeader.prototype.getFocusDomRef = function (oFocusTab) {
		var oTab = oFocusTab || this.oSelectedItem;
		if (!oTab) {
			return null;
		}

		return oTab.getDomRef();
	};

	IconTabHeader.prototype.applyFocusInfo = function (oFocusInfo) {
		//sets the focus depending on the used IconTabFilter
		if (oFocusInfo.focusDomRef) {
			jQuery(oFocusInfo.focusDomRef).focus();
		}
	};

	/**
	 * Sets a selected item.
	 * If no key is provided, or if the item is not visible, the first visible item will be selected.
	 *
	 * @private
	 */
	IconTabHeader.prototype._updateSelection = function () {
		var aItems = this.getItems(),
			sSelectedKey = this.getSelectedKey(),
			i = 0,
			oParent = this.getParent(),
			bIsParentIconTabBar = this._isInsideIconTabBar(),
			bIsParentToolHeader = oParent && oParent.isA("sap.tnt.ToolHeader");

		if (aItems.length > 0) {
			if (!this.oSelectedItem || sSelectedKey && sSelectedKey !== this.oSelectedItem._getNonEmptyKey()) {
				if (sSelectedKey) {
					// selected key was specified by API: set oSelectedItem to the item specified by key
					for (; i < aItems.length; i++) {
						if (!(aItems[i] instanceof IconTabSeparator) && aItems[i]._getNonEmptyKey() === sSelectedKey) {
							this.oSelectedItem = aItems[i];
							break;
						}
					}
				}

				// no key and no item, we set the first visible item as selected
				if (!this.oSelectedItem && (bIsParentIconTabBar || !sSelectedKey)) {
					for (i = 0; i < aItems.length; i++) { // tab item
						if (!(aItems[i] instanceof IconTabSeparator) && aItems[i].getVisible()) {
							this.oSelectedItem = aItems[i];
							break;
						}
					}
				}
			}

			//in case the selected tab is not visible anymore, the selected tab will change to the first visible tab
			if (!bIsParentToolHeader && this.oSelectedItem && !this.oSelectedItem.getVisible()) {
				for (i = 0; i < aItems.length; i++) { // tab item
					if (!(aItems[i] instanceof IconTabSeparator) && aItems[i].getVisible()) {
						this.oSelectedItem = aItems[i];
						break;
					}
				}
			}

			if (!this.oSelectedItem) {
				return;
			}

			// if candidate selected item is unselectable, instead select its first available child item that has content
			if (this._isUnselectable(this.oSelectedItem)) {
				this.setSelectedItem(this.oSelectedItem._getFirstAvailableSubFilter(), true);
				return;
			}

			this.setProperty("selectedKey", this.oSelectedItem._getNonEmptyKey(), true);
		}
	};

	/* =========================================================== */
	/*           begin: event handlers                             */
	/* =========================================================== */

	/**
	 * Initializes activating a tab on the IconTabHeader.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	IconTabHeader.prototype.ontouchstart = function(oEvent) {
		var oTargetTouch = oEvent.targetTouches[0];
		// store touch state
		this._iActiveTouch = oTargetTouch.identifier;
	};

	/**
	 * Handles touch end and events and triggers selection if bar was not dragged.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	IconTabHeader.prototype.ontouchend = function(oEvent) {
		if (this._iActiveTouch === undefined) {
			return;
		}

		var MOBILE_TAP = 0;
		var LEFT_MOUSE_CLICK = 1;
		var LUMIA_TOUCH; // undefined on Lumia phone

		if (oEvent.which === LUMIA_TOUCH || oEvent.which === MOBILE_TAP || oEvent.which === LEFT_MOUSE_CLICK) {
			this._handleActivation(oEvent);
		}

		this._iActiveTouch = undefined;
	};

	/**
	 * Handles the touch cancel event.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	IconTabHeader.prototype.ontouchcancel = IconTabHeader.prototype.ontouchend;

	/**
	 * Handle the key down event for SPACE and ENTER.
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	IconTabHeader.prototype.onkeydown = function(oEvent) {
		switch (oEvent.which) {
			case KeyCodes.ENTER:
				this._handleActivation(oEvent);
				oEvent.preventDefault();
				break;
			case KeyCodes.SPACE:
				this._handleActivation(oEvent);
				oEvent.preventDefault(); // prevent scrolling when focused on the tab
				break;
		}
	};

	/* =========================================================== */
	/*           end: event handlers                               */
	/* =========================================================== */

	/* =========================================================== */
	/*           start: tab drag-drop                              */
	/* =========================================================== */

	/**
	 * Handles drop event for drag &  drop functionality in sap.m.IconTabHeader
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	IconTabHeader.prototype._handleDragAndDrop = function (oEvent) {
		var sDropPosition = oEvent.getParameter("dropPosition"),
			oDraggedControl = oEvent.getParameter("draggedControl"),
			oDroppedControl = oEvent.getParameter("droppedControl");

		IconTabBarDragAndDropUtil.handleDrop(this, sDropPosition, oDraggedControl._getRealTab(), oDroppedControl, false);

		this._setItemsForStrip();
		this._initItemNavigation();

		this._setSelectListItems();
		this._getSelectList()._initItemNavigation();

		oDraggedControl._getRealTab().$().focus();
	};

	/* =========================================================== */
	/*           end: tab drag-drop                                */
	/* =========================================================== */

	/* =========================================================== */
	/*           start: tab keyboard handling - drag-drop          */
	/* =========================================================== */

	/**
	 * Moves a tab by a specific key code
	 *
	 * @param {object} oTab The event object
	 * @param {number} iKeyCode Key code
	 * @private
	 */
	IconTabHeader.prototype._moveTab = function (oTab, iKeyCode) {
		IconTabBarDragAndDropUtil.moveItem.call(this, oTab, iKeyCode);
		this._setItemsForStrip();
		this._initItemNavigation();
	};

	/**
	 * Handle keyboard drag&drop
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	IconTabHeader.prototype.ondragrearranging = function (oEvent) {
		if (!this.getEnableTabReordering()) {
			return;
		}

		var oTab = oEvent.srcControl;
		this._moveTab(oTab, oEvent.keyCode);
		oTab.$().focus();
	};

	/**
	 * Moves tab on first position
	 * Ctrl + Home
	 * @param {jQuery.Event} oEvent
	 */
	IconTabHeader.prototype.onsaphomemodifiers = IconTabHeader.prototype.ondragrearranging;

	/**
	 * Move focused tab of IconTabHeader to last position
	 * Ctrl + End
	 * @param {jQuery.Event} oEvent
	 */
	IconTabHeader.prototype.onsapendmodifiers = IconTabHeader.prototype.ondragrearranging;

	/**
	 * Moves tab for Drag&Drop keyboard handling
	 * Ctrl + Left Right || Ctrl + Arrow Up
	 * @param {jQuery.Event} oEvent
	 */
	IconTabHeader.prototype.onsapincreasemodifiers = IconTabHeader.prototype.ondragrearranging;

	/**
	 * Moves tab for Drag&Drop keyboard handling
	 * Ctrl + Left Arrow || Ctrl + Arrow Down
	 * @param {jQuery.Event} oEvent
	 */
	IconTabHeader.prototype.onsapdecreasemodifiers = IconTabHeader.prototype.ondragrearranging;

	/* =========================================================== */
	/*           end: tab keyboard handling - drag-drop            */
	/* =========================================================== */

	return IconTabHeader;
});