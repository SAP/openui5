/*!
 * ${copyright}
 */

// Provides control sap.m.Menu.
sap.ui.define([
	'sap/m/library',
	'sap/ui/core/library',
	'sap/ui/core/Element',
	'sap/ui/core/Control',
	'sap/m/ResponsivePopover',
	'sap/m/Button',
	'sap/m/Bar',
	'sap/m/Title',
	'sap/m/MenuItem',
	'sap/m/MenuWrapper',
	'sap/ui/core/Lib',
	'sap/ui/Device',
	'sap/ui/core/EnabledPropagator',
	'sap/base/i18n/Localization',
	'sap/ui/thirdparty/jquery',
	'sap/ui/dom/containsOrEquals',
	'sap/base/Log'
],
	function(
		library,
		coreLibrary,
		Element,
		Control,
		ResponsivePopover,
		Button,
		Bar,
		Title,
		MenuItem,
		MenuWrapper,
		Lib,
		Device,
		EnabledPropagator,
		Localization,
		jQuery,
		containsOrEquals,
		Log
	) {
		"use strict";

		// Shortcut for sap.m.PlacementType
		const PlacementType = library.PlacementType;

		// Shortcut for sap.ui.core.ItemSelectionMode
		const ItemSelectionMode = coreLibrary.ItemSelectionMode;

		/**
		 * Constructor for a new Menu.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The <code>sap.m.Menu</code> control represents a hierarchical menu.
		 * When opened on mobile devices it occupies the whole screen.
		 *
		 * @extends sap.ui.core.Control
		 * @implements sap.ui.core.IContextMenu
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @alias sap.m.Menu
		 */
		const Menu = Control.extend("sap.m.Menu", /** @lends sap.m.Menu.prototype */ {
			metadata : {
				interfaces: [
					"sap.ui.core.IContextMenu"
				],
				library : "sap.m",
				properties : {
					/**
					 * Defines the <code>Menu</code> title.
					 */
					title : { type : "string", group : "Misc", defaultValue : null }
				},
				defaultAggregation: "items",
				aggregations: {

					/**
					 * Defines the items contained within this control.
					 */
					items: { type: "sap.m.IMenuItem", multiple: true, singularName: "item", bindable: "bindable", defaultClass: MenuItem, forwarding: { idSuffix: "-menuWrapper", aggregation: "items" } },

					/**
					 * Internal Menu Wrapper control
					 */
					_menuWrapper: { type: "sap.m.MenuWrapper", multiple: false, visibility: "hidden" },

					/**
					 * Internal aggregation that contains the inner <code>sap.m.ResponsivePopover</code> for mobile.
					 */
					_popover: { type: "sap.m.ResponsivePopover", multiple: false, visibility: "hidden" }

				},
				events: {
					/**
					 * Fired when a <code>MenuItem</code> is selected.
					 */
					itemSelected: {
						parameters: {
							/**
							 * The <code>MenuItem</code> which was selected.
							 */
							item : {type : "sap.m.IMenuItem" }
						}
					},

					/**
					 * Fired when the menu is closed.
					 */
					closed: {},

					/**
					 * Fired before the menu is closed.
					 * This event can be prevented which effectively prevents the menu from closing.
					 * @since 1.131
					 */
					beforeClose : {
						allowPreventDefault : true,
						parameters: {
							/**
							 * The <code>MenuItem</code> which was selected (if any).
							 * @since 1.136.0
							 */
							item : {type : "sap.m.IMenuItem" }
						}
					}

				}
			},
			renderer: null // this is a ResponsivePopover control without a renderer
		});

		EnabledPropagator.call(Menu.prototype);

		/**
		 * Initializes the control.
		 *
		 * @public
		 */
		Menu.prototype.init = function() {
			const oMenuWrapper = this._createMenuWrapper(),
				oPopover = this._createPopover();

			oMenuWrapper.attachClosePopover(this.close, this);
			oMenuWrapper.attachCloseItemSubmenu(this._collectSubmenusToClose, this);
			oMenuWrapper.attachItemSelected(this._handleItemSelected, this);
			oPopover.attachAfterClose(this._menuClosed, this);

			this._aSubmenusToClose = [];
			this._openDuration = Device.system.phone ? null : 0;
		};

        /**
		 * Called from parent if the control is destroyed.
		 */
		Menu.prototype.exit = function() {
			const oMenuWrapper = this._getMenuWrapper(),
				oPopover = this._getPopover();

			oMenuWrapper.detachClosePopover(this.close, this);
			oMenuWrapper.detachCloseItemSubmenu(this._collectSubmenusToClose, this);
			oMenuWrapper.detachItemSelected(this._handleItemSelected, this);
			oPopover.detachAfterClose(this._menuClosed, this);

			oMenuWrapper.destroy();
			oPopover.destroy();
		};

		/**
		 * Sets the title of the <code>Menu</code> in mobile view.
		 *
		 * @param {string} sTitle The new title of the <code>Menu</code>
		 * @returns {this} <code>this</code> to allow method chaining
		 * @public
		 */
		Menu.prototype.setTitle = function(sTitle) {
			const oPopover = this._getPopover(),
				oMenuWrapper = this._getMenuWrapper(),
				oHeader = oPopover.getCustomHeader();

			// set the text of the Title of the ResponsivePopover, which is located in the custom header's Bar contentMiddle aggregation
			if (oHeader) {
				oMenuWrapper.setTitle(sTitle);
				// the Title is the only elemnet in the contentMiddle aggregation of the Bar we create as custom header
				// so we can safely set the text of the first element
				oHeader.getContentMiddle()[0].setText(sTitle);
			}

			this.setProperty("title", sTitle, true);

			return this;
		};

		/**
		 * Opens the <code>Menu</code> next to the given control.
		 *
		 * @param {sap.ui.core.Control} oControl The control that defines the position for the menu
		 * @returns {this} <code>this</code> to allow method chaining
		 * @public
		 */
		Menu.prototype.openBy = function(oControl) {
			const oPopover = this._getPopover();
			if (!oControl) {
				oControl = document.body;
			}
			oPopover._getPopup().setDurations(this._openDuration, 0);
			oPopover.openBy(oControl);

			return this;
		};

		/**
		 * Closes the <code>Menu</code> if the <code>beforeClose</code> event isn`t prevented.
		 *
		 * @param {sap.ui.base.Event} oEvent closePopover event
		 * @returns {this} <code>this</code> to allow method chaining
		 * @public
		 */
		Menu.prototype.close = function(oEvent) {
			const oEventParameters = oEvent ? oEvent.getParameters() : {},
				oBeforeCloseParameters = {},
				oPopover = this._getPopover();

			if (oEventParameters["origin"]) {
				oBeforeCloseParameters["item"] = oEventParameters["origin"];
			}
			this._refreshSubmenusToClose();
			if (oPopover && this.fireBeforeClose(oBeforeCloseParameters)) {
				this._closeSubmenuPopovers();
				oPopover._getPopup().setDurations(this._openDuration, 0);
				oPopover.close();
			}

			return this;
		};

		/**
		 * Captures the itemSelected event fired by the menu wrapper and fires the itemSelected event of the menu.
		 *
		 * @param {sap.ui.base.Event} oEvent itemSelected event fired by the menu wrapper
		 * @private
		 */
		Menu.prototype._handleItemSelected = function(oEvent) {
			oEvent.cancelBubble();
			this.fireItemSelected({item: oEvent.getParameter("item")});
		};

		/**
		 * Refreshes the list of submenus that should be closed by checking if any are still open.
		 *
		 * @private
		 */
		Menu.prototype._refreshSubmenusToClose = function() {
			this._aSubmenusToClose = this._aSubmenusToClose.filter((oItem) => oItem._getPopover().isOpen());
		};

		/**
		 * Closes the submenus of the <code>Menu</code> that are still open.
		 *
		 * @private
		 */
		Menu.prototype._closeSubmenuPopovers = function() {
			while (this._aSubmenusToClose.length) {
				this._aSubmenusToClose.pop()._closeSubmenu();
			}
		};

		/**
		 * Returns whether the <code>Menu</code> is currently open.
		 *
		 * @returns {boolean} true if menu is open
		 * @public
		 */
		Menu.prototype.isOpen = function() {
			return this._getPopover().isOpen();
		};

		/**
		 * Provides a DOM reference ID for the menu container.
		 * @returns {string} The DOM reference ID for the menu container
		 */
		Menu.prototype.getDomRefId = function() {
			return this._getPopover().getId();
		};

		/**
		 * Opens the menu as a context menu.
		 *
		 * @param {jQuery.Event | object} oEvent The event object or an object containing offsetX, offsetY
		 * values and left, top values for the element's position
		 * @param {sap.ui.core.Element|HTMLElement} oOpenerRef The reference of the opener
		 * @public
		 */
		Menu.prototype.openAsContextMenu = function(oEvent, oOpenerRef) {
			const oPopover = this._getPopover(),
				oOpenerDomRef = oOpenerRef && oOpenerRef.getDomRef ? oOpenerRef.getDomRef() : oOpenerRef,
				oOpenerData = oOpenerRef && oOpenerDomRef ? oOpenerDomRef.getBoundingClientRect() : null;
			let bWithPointer = oEvent.originalEvent && oEvent.originalEvent.button !== -1,
				iX = oEvent.pageX || 0,
				iY = oEvent.pageY || 0;

			if (Localization.getRTL()) {
				iX = document.body.clientWidth - iX;
			}

			oPopover._getPopup().setDurations(this._openDuration, 0);

			if (Device.system.phone) {
				oPopover.openBy();
				return;
			}

			if (oOpenerData && !bWithPointer) {
				// If the opener is a DOM element, we need to calculate the position
				const iScrollX = window.scrollX || window.pageXOffset;
				const iScrollY = window.scrollY || window.pageYOffset;

				const iCenterX = oOpenerData.left + iScrollX + (oOpenerData.width / 2);
				const iCenterY = oOpenerData.top + iScrollY + (oOpenerData.height / 2);

				iX = iCenterX;
				iY = iCenterY;

				bWithPointer = true;
				oPopover.setPlacement(PlacementType.VerticalPreferredBottom);
			}

			if (bWithPointer || !oOpenerRef) {
				// Create artificial context menu opener (if it doesn't exist yet) to the body
				// because of missing positioning functionality in the ResponsivePopover.
				// This container should be used as an opener reference for the Menu.
				if (!document.body.querySelector(".sapMMenuContextMenuPointer")) {
					document.body.insertAdjacentHTML("beforeend", "<div class='sapMMenuContextMenuPointer'></div>");
				}

				const oContextPointer = document.body.querySelector(".sapMMenuContextMenuPointer");

				oContextPointer.style.insetInlineStart = iX + "px";
				oContextPointer.style.insetBlockStart = iY + "px";
				oOpenerRef = oContextPointer;
			}

			oPopover.openBy(oOpenerRef);
		};

		/**
		 * Override mutator public methods for CustomStyleClassSupport so it's properly propagated to the popover.
		 * Keep in mind we don't overwrite <code>hasStyleClass</code> method - we are only propagating the state.
		 * We don't mimic the popover custom style class support.
		 *
		 * @override
		 */
		["addStyleClass", "removeStyleClass", "toggleStyleClass"].forEach(function (sMethodName) {
			Menu.prototype[sMethodName] = function (sClass, bSuppressInvalidate) {
				const oPopover = this._getPopover();

				Control.prototype[sMethodName].apply(this, arguments);
				if (oPopover) {
					oPopover[sMethodName].apply(oPopover, arguments);
				}

				return this;
			};
		});

		/**
		 * Returns an array containing the selected menu items.
		 * <b>Note:</b> Only items with <code>selected</code> property set that are members of <code>MenuItemGroup</code> with <code>ItemSelectionMode</code> property
		 * set to {@link sap.ui.core.ItemSelectionMode.SingleSelect} or {@link sap.ui.unified.ItemSelectionMode.MultiSelect}> are taken into account.
		 *
		 * @since 1.127.0
		 * @public
		 * @returns {Array} Array of all selected items
		 */
		Menu.prototype.getSelectedItems = function() {
			return this._getItems().filter((oItem) => oItem.getSelected && oItem.getSelected() && oItem._getItemSelectionMode() !== ItemSelectionMode.None);
		};

		/**
		 * Collects the items which submenus should be closed if necessary.
		 *
		 * @param {sap.ui.base.Event} oEvent closeItemSubmenu event
		 * @private
		 */
		Menu.prototype._collectSubmenusToClose = function(oEvent) {
			const oItem = oEvent.getParameter("item");

			this._refreshSubmenusToClose();

			// check if the submenu is already in the list
			if (this._aSubmenusToClose.indexOf(oItem) === -1) {
				this._aSubmenusToClose.push(oItem);
			}
		};

		/**
		 * Allows for any custom function to be called back when accessibility attributes
		 * of underlying menu are about to be rendered.
		 * The function is called once per MenuItem
		 *
		 * @param {function} fn The callback function
		 * @private
		 * @ui5-restricted ObjectPageLayoutABHelper
		 * @returns {void}
		 */
		Menu.prototype._setCustomEnhanceAccStateFunction = function(fn) {
			this._fnEnhanceUnifiedMenuAccState = fn;
		};

        Menu.prototype._menuClosed = function(oEvent) {
			const oOpener = oEvent && oEvent.getParameter("openBy");

			this.fireClosed();

			if (oOpener) {
				try {
					oOpener.focus();
				} catch (e) {
					Log.warning("Menu.close cannot restore the focus on opener " + oOpener + ", " + e);
				}
			}
		};

		/**
		 * Checks if an item is a MenuItemGroup or not.
		 *
		 * @param {sap.m.IMenuItem} oItem The item to be checked
		 * @returns {boolean} Whether the item is a MenuItemGroup or not
		 * @private
		 */
		Menu.prototype._isMenuItemGroup = function(oItem) {
			return !!oItem.getItemSelectionMode;
		};

		/**
		 * Returns list of items stored in <code>items</code> aggregation. If there are group items,
		 * the items of the group are returned instead of their group item.
		 *
		 * @returns {sap.m.MenuItem} List of all menu items
		 * @private
		 */
		Menu.prototype._getItems = function() {
			const aItems = [];

			const findItems = (aItemItems) => {
				aItemItems.forEach((oItem) => {
					if (!this._isMenuItemGroup(oItem)) {
						aItems.push(oItem);
					} else {
						findItems(oItem.getItems());
					}
				});
			};

			findItems(this.getItems());

			return aItems;
		};

		/* ResponsivePopover and MenuWrapper functionality */

		/**
		 * Creates the internal MenuWrapper control.
		 * @param {boolean} bIsSubmenu Whether the menu in this wrapper is a submenu or not
		 * @returns {sap.m.MenuWrapper} The created MenuWrapper
		 * @private
		 */
		Menu.prototype._createMenuWrapper = function(bIsSubmenu) {
			const oMenuWrapper = new MenuWrapper(this.getId() + "-menuWrapper", { isSubmenu: bIsSubmenu });
			this.setAggregation("_menuWrapper", oMenuWrapper, true);
			return oMenuWrapper;
		};

		/**
		 * Creates the ResponsivePopover that contains the actual menu.
		 * @returns {sap.m.ResponsivePopover} The created ResponsivePopover
		 * @private
		 */
		Menu.prototype._createPopover = function() {
			let oPopover = this._getPopover();

			if (oPopover) {
				return oPopover;
			}

			const oMenuWrapper = this._getMenuWrapper(),
				bRTL = Localization.getRTL(),
				bIsSubmenu = oMenuWrapper.getIsSubmenu(),
				iOffsetXCorrection = bRTL ? 4 : -4;

			oPopover = new ResponsivePopover(this.getId() + "-rp", {
				placement: this._getPopoverPlacement(),
				showHeader: false,
				showArrow: false,
				showCloseButton: false,
				verticalScrolling: true,
				horizontalScrolling: false,
				offsetX: bIsSubmenu ? iOffsetXCorrection : 1,
				offsetY: bIsSubmenu ? 4 : 1,
				content: oMenuWrapper
			});
			oPopover.addStyleClass("sapMMenu");

			this.setAggregation("_popover", oPopover, true);

			if (Device.system.phone) {
				oPopover.setShowHeader(true);
				oPopover.setEndButton(this._createCloseButton());
				oPopover.setCustomHeader(this._createHeaderBar());
			} else if (bIsSubmenu) {
				oPopover.getAggregation("_popup")._adaptPositionParams = function() {
					this._marginTop = 0;
					this._marginLeft = 0;
					this._marginRight = 0;
					this._marginBottom = 0;

					this._arrowOffset = 0;
					this._offsets = ["0 0", "0 0", "0 0", "0 0"];

					this._myPositions = ["begin bottom", "begin top", "begin top", "end top"];
					this._atPositions = ["begin top", "end top", "begin bottom", "begin top"];
				};
			}

			// this override is needed to fix the issue with the popover position flip
			oPopover._oControl._getDocHeight = () => window.innerHeight + window.scrollY;

			return oPopover;
		};

		/**
		 * Creates the back button for the Responsive Popover in mobile view.
		 * @returns {sap.m.Button} The back button
		 */
		Menu.prototype._createBackButton = function() {
			return new Button(this.getId() + "-backbutton", {
				icon : "sap-icon://nav-back",
				press : (oEvent) => {
					this._getMenuWrapper().fireClosePopover();
				}
			});
		};

		/**
		 * Creates the custom header bar for the Responsive Popover in mobile view.
		 * @returns {sap.m.Bar} The header bar
		 */
		Menu.prototype._createHeaderBar = function() {
			const oMenuWrapper = this._getMenuWrapper(),
				oHeaderBar = new Bar({
					contentMiddle: new Title(this.getId() + "-title", { text: oMenuWrapper.getTitle() })
				}),
				bIsSubmenu = this._getMenuWrapper().getIsSubmenu();

			if (bIsSubmenu) {
				oHeaderBar.addContentLeft(this._createBackButton());
			}

			return oHeaderBar;
		};

		/**
		 * Creates the close button for the Responsive Popover for mobile view.
		 * @returns {sap.m.Button} The close button
		 */
		Menu.prototype._createCloseButton = function() {
			const oRB = Lib.getResourceBundleFor("sap.m");

			return new Button({
				text: oRB.getText("MENU_CLOSE"),
				press: () => {
					this._getMenuWrapper().fireClosePopover({ bubbleToRoot: true });
				}
			});
		};

		/**
		 * Gets the internal MenuWrapper control.
		 * @returns {sap.m.MenuWrapper} The internal _menuWrapper aggregation
		 * @private
		 */
		Menu.prototype._getMenuWrapper = function() {
			const oPopover = this._getPopover();
			return oPopover ? oPopover.getContent()[0] : this.getAggregation("_menuWrapper");
		};

		/**
		 * Gets the internal ResponsivePopover.
		 * @private
		 * @returns {sap.m.ResponsivePopover} The internal _popover aggregation
		 */
		Menu.prototype._getPopover = function() {
			return this.getAggregation("_popover");
		};

		/**
		 * Gets the placement type for the popover depending of LTR/RTL setting.
		 * @private
		 * @returns {sap.m.PlacementType} the placement type of the popover
		*/
		Menu.prototype._getPopoverPlacement = function() {
			const bIsSubmenu = this._getMenuWrapper().getIsSubmenu();

			if (bIsSubmenu) {
				const bRTL = Localization.getRTL(),
					sPlacement = bRTL ? PlacementType.HorizontalPreferredLeft : PlacementType.HorizontalPreferredRight;

				return sPlacement;
			}

			return PlacementType.VerticalPreferredBottom;
		};

		/**
		 * Set extra content to the popover.
		 * @private
		 * @param {HTMLElement} oDomRef the DOM ref to be added as extra content to the popover
		 */
		Menu.prototype._setExtraContent = function(oDomRef) {
			this._getPopover()._getPopup().setExtraContent([oDomRef]);
		};

		return Menu;
	});