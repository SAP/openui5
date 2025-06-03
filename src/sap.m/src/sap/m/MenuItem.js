/*!
 * ${copyright}
 */

// Provides control sap.m.MenuItem.
sap.ui.define([
	'sap/m/library',
	'sap/ui/core/library',
	'sap/ui/core/Element',
	'sap/ui/core/Control',
	'sap/m/ResponsivePopover',
	'sap/m/Button',
	'sap/m/Bar',
	'sap/m/Title',
	'sap/m/MenuWrapper',
	'sap/ui/core/Lib',
	'sap/m/MenuItemRenderer',
	'sap/ui/Device',
	'sap/base/i18n/Localization',
	'sap/ui/base/ManagedObject',
	'sap/ui/core/IconPool',
	'sap/m/Image'
], function(
	library,
	coreLibrary,
	Element,
	Control,
	ResponsivePopover,
	Button,
	Bar,
	Title,
	MenuWrapper,
	Lib,
	MenuItemRenderer,
	Device,
	Localization,
	ManagedObject,
	IconPool,
	Image
) {
		"use strict";

		// Shortcut for sap.m.PlacementType
		const PlacementType = library.PlacementType;

		// Shortcut for sap.ui.core.ItemSelectionMode
		const ItemSelectionMode = coreLibrary.ItemSelectionMode;

		// Shortcut for sap.ui.core.TextDirection
		var TextDirection = coreLibrary.TextDirection;

		/**
		 * Constructor for a new <code>MenuItem</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The <code>MenuItem</code> control is used for creating items for the <code>sap.m.Menu</code>.
		 * It is derived from a core <code>sap.ui.core.Control</code>.
		 * @extends sap.ui.core.Control
		 * @implements sap.m.IMenuItem, sap.m.IMenuItemBehavior
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.38
		 * @alias sap.m.MenuItem
		 */
		const MenuItem = Control.extend("sap.m.MenuItem", /** @lends sap.m.MenuItem.prototype */ {
			metadata : {

				interfaces: [
					"sap.m.IMenuItem"
				],
				library: "sap.m",
				properties: {

					/**
					 * The text to be displayed for the item.
					 */
					text: {type: "string", group: "Data", defaultValue: ""},

					/**
					 * Defines the icon, which belongs to the item.
					 * This can be a URI to an image or an icon font URI.
					 */
					icon: {type: "string", group: "Appearance", defaultValue: null},

					/**
					 * Enabled items can be selected.
					 */
					enabled: {type: "boolean", group: "Misc", defaultValue: true},

					/**
					 * Defines whether the item should be visible on the screen. If set to <code>false</code>,
					 * a placeholder is rendered instead of the real item.
					 */
					visible: {type: "boolean", group: "Appearance", defaultValue: true},

					/**
					 * Determines whether the <code>MenuItem</code> is selected.
					 * A selected <code>MenuItem</code> has a check mark rendered at its end.
					 * <b>Note: </b> selection functionality works only if the menu item is a member of <code>MenuItemGroup</code> with
					 * <code>itemSelectionMode</code> set to {@link sap.ui.core.ItemSelectionMode.SingleSelect} or {@link sap.ui.unified.ItemSelectionMode.MultiSelect}.
					 * @since 1.127.0
					 */
					selected: {type: "boolean", group: "Behavior", defaultValue: false},

					/**
					 * Defines the shortcut text that should be displayed on the menu item on non-mobile devices.
					 * <b>Note:</b> The text is only displayed and set as а value of the <code>aria-keyshortcuts</code> attribute.
					 */
					shortcutText: {type: "string", group: "Appearance", defaultValue: ''},

					/**
					 * Defines whether a visual separator should be rendered before the item.
					 * <b>Note:</b> If an item is invisible its separator is also not displayed.
					 */
					startsSection: {type: "boolean", group: "Behavior", defaultValue: false},

					/**
					 * Options are RTL and LTR. Alternatively, an item can inherit its text direction from its parent control.
					 */
					textDirection: {type: "sap.ui.core.TextDirection", group: "Misc", defaultValue: TextDirection.Inherit},

					/**
					 * Can be used as input for subsequent actions.
					 */
					key: {type: "string", group: "Data", defaultValue: null}

				},
				defaultAggregation: "items",
				aggregations: {

					/**
					 * Defines the subitems contained within this element.
					 */
					items: { type: "sap.m.IMenuItem", multiple: true, singularName: "item", bindable: "bindable", forwarding: { idSuffix: "-menuWrapper", aggregation: "items" } },

					/**
					 * Defines the content that is displayed at the end of a menu item. This aggregation allows for the addition of custom elements, such as icons and buttons.
					 * @since 1.131
					 */
					endContent: { type: "sap.ui.core.Control", multiple: true },

					/**
					 * Internal Menu Item icon or image control
					 * @since 1.137.0
					 */
					_icon: { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" },

					/**
					 * Internal Menu Wrapper control
					 * @since 1.137.0
					 */
					_menuWrapper: { type: "sap.m.MenuWrapper", multiple: false, visibility: "hidden" },

					/**
					 * Internal aggregation that contains the inner <code>sap.m.ResponsivePopover</code> for mobile.
					 * @since 1.137.0
					 */
					_popover: { type: "sap.m.ResponsivePopover", multiple: false, visibility: "hidden" }

				},
				associations: {

					/**
					 * MenuItemGroup associated with this item.
					 * @since 1.127.0
					 */
					_group: {type : "sap.m.MenuItemGroup",  group: "Behavior", visibility: "hidden"}

				},
				events: {

					/**
					 * Fired after the item has been pressed.
					 */
					press: {}

				},

				renderer: MenuItemRenderer
			},

			renderer: MenuItemRenderer
		});

		MenuItem.prototype.init = function() {
			const oMenuWrapper = this._createMenuWrapper(true);

			this._itemSelectionMode = ItemSelectionMode.None;
			oMenuWrapper.attachClosePopover(this._handleCloseRequest, this);
			this._openDuration = Device.system.phone ? null : 0;
		};

		MenuItem.prototype.exit = function() {
			const oMenuWrapper = this._getMenuWrapper(),
				oPopover = this._getPopover(),
				oIcon = this.getAggregation("_icon");

			oMenuWrapper.detachClosePopover(this._handleCloseRequest, this);
			oMenuWrapper.destroy();
			if (oPopover) {
				oPopover.detachAfterClose(this._afterPopoverClose, this);
				oPopover.destroy();
			}

			if (oIcon) {
				oIcon.destroy();
			}
		};

		MenuItem.prototype.onBeforeRendering = function() {
			let oPopover = this._getPopover();

			// Initialize popover if subitems exist but popover hasn't been created yet.
			if (this._hasSubmenu() && !oPopover) {
				oPopover = this._createPopover();
				oPopover.attachAfterClose(this._afterPopoverClose, this);
			}
		};

		MenuItem.prototype.onfocusin = function(oEvent) {
			if (!this.isFocusable || !this.isFocusable()) {
				oEvent.preventDefault();
			}
		};

		/**
		 * Sets the <code>selected</code> state of the <code>MenuItem</code> if it is allowed.
		 *
		 * @override
		 * @param {boolean} bState Whether the menu item should be selected
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 */
		MenuItem.prototype.setSelected = function(bState) {
			const oGroup = Element.getElementById(this.getAssociation("_group"));

			// In case of single selection, clear selected state of all other items in the group to ensure that only one item is selected
			if (bState && oGroup && oGroup.getItemSelectionMode() === ItemSelectionMode.SingleSelect) {
				oGroup._clearSelectedItems();
			}

			this.setProperty("selected", bState);

			return this;
		};

		/**
		 * Returns whether the firing of press event is allowed.
		 * <b>Note:</b> This method can be overridden by subclasses to implement custom behavior.
		 *
		 * @public
		 * @returns {boolean} Whether the item is enabled for click/press
		 */
		MenuItem.prototype.isInteractive = function() {
			return true;
		};

		/**
		 * Returns whether the item can be focused.
		 * <b>Note:</b> This method can be overridden by subclasses to implement custom behavior.
		 *
		 * @public
		 * @returns {boolean} Whether the item is enabled for focus
		 */
		MenuItem.prototype.isFocusable = function() {
			return true;
		};

		/**
		 * Returns whether the item can be counted in total items count.
		 * <b>Note:</b> This method can be overridden by subclasses to implement custom behavior.
		 *
		 * @public
		 * @returns {boolean} Whether the item is counted in total items count
		 */
		MenuItem.prototype.isCountable = function() {
			return this.isFocusable();
		};

		/**
		 * Returns the accessibility attributes of the item.
		 *
		 * @private
		 * @returns {Object} The accessibility attributes of the item
		 */
		MenuItem.prototype._getAccessibilityAttributes = function() {
			const oAccInfo = this._oAccInfo || { bAccessible: false};

			if (!oAccInfo.bAccessible) {
				return {};
			}

			const bHasSubmenu = this._hasSubmenu(),
				oSubmenu = this._getMenuWrapper(),
				bIsSelected = this.getSelected() && this._getItemSelectionMode() !== ItemSelectionMode.None,
				sShortcutText = !bHasSubmenu ? this.getShortcutText() : null;

			return {
				role: this._getRole(),
				disabled: !this.getEnabled(),
				posinset: oAccInfo['posinset'] || null,
				setsize: oAccInfo['setsize'] || null,
				selected: null,
				checked: bIsSelected || null,
				keyshortcuts: sShortcutText || null,
				labelledby: { value: `${this.getId()}-txt`, append: true },
				haspopup: bHasSubmenu ? coreLibrary.aria.HasPopup.Menu.toLowerCase() : null,
				owns: bHasSubmenu ? oSubmenu.getId() : null
			};

		};

		/**
		 * Returns the item accessibility role.
		 *
		 * @private
		 * @returns {string} The role of the item
		 */
		MenuItem.prototype._getRole = function() {
			let sRole;

			switch (this._getItemSelectionMode()) {
				case ItemSelectionMode.SingleSelect:
					sRole = "menuitemradio";
					break;
				case ItemSelectionMode.MultiSelect:
					sRole = "menuitemcheckbox";
					break;
				default:
					sRole = "menuitem";
			}
			return sRole;
		};

		/**
		 * Handles the <code>closePopover</code> event of the menu item.
		 * If the event is not bubbled to the root, the submenu of the item is immediately closed.
		 * If the event bubbles, the <code>CloseItemSubmenu</code> event is triggered, allowing the top-level <code>Menu</code> to handle it.
		 * The final decision on submenu closure depends on whether the <code>beforeClose</code> event of the <code>Menu</code> is prevented or not.
		 *
		 * @param {sap.ui.base.Event} oEvent closePopover event
		 * @private
		 */
		MenuItem.prototype._handleCloseRequest = function(oEvent) {
			if (!oEvent.getParameter("bubbleToRoot")) {
				this._closeSubmenu();
				oEvent.cancelBubble();
			} else {
				this._getMenuWrapper().fireCloseItemSubmenu({ item: this });
			}
		};

		/**
		 * Closes the submenu of the item.
		 *
		 * @private
		 */
		MenuItem.prototype._closeSubmenu = function() {
			const aItems = this._getVisibleItems(),
				oPopover = this._getPopover();

			aItems.forEach((oItem) => {
				if (oItem._hasSubmenu && oItem._hasSubmenu()) {
					oItem._closeSubmenu();
				}
			});
			if (oPopover) {
				oPopover.removeStyleClass(this._getMenuWrapper()._aStyleClasses.join(" "));
				oPopover._getPopup().setDurations(this._openDuration, 0);
				oPopover.close();
			}
			this.removeStyleClass("sapMMenuItemSubMenuOpen");
			this._getMenuWrapper().oOpenedSubmenuParent = null;
		};

		/**
		 * Opens the submenu of the item.
		 *
		 * @private
		 */
		MenuItem.prototype._openSubmenu = function() {
			if (!this.getEnabled() || !this._hasSubmenu()) {
				return;
			}

			const oMenuWrapper = this._getMenuWrapper(),
				oSubmenuPopover = this._getPopover();

			if (oSubmenuPopover.isOpen()) {
				return;
			}

			oSubmenuPopover.addStyleClass(oMenuWrapper._aStyleClasses.join(" "));

			if (Device.system.phone) {
				oMenuWrapper.setTitle(this.getText()); // Set the title of the menu wrapper according to the item's text
				// the Title is the only elemnet in the contentMiddle aggregation of the Bar we create as custom header
				// so we can safely set the text of the first element
				oSubmenuPopover.getCustomHeader().getContentMiddle()[0].setText(this.getText()); // Set the title of the popover according to the item's text
			} else {
				this.addStyleClass("sapMMenuItemSubMenuOpen");
			}
			oSubmenuPopover._getPopup().setDurations(this._openDuration, 0);
			oSubmenuPopover.openBy(this);
		};


		MenuItem.prototype._getBackButtonTooltipForPageWithParent = function() {
			return Lib.getResourceBundleFor("sap.m").getText("MENU_PAGE_BACK_BUTTON") + " " + this.getText();
		};

		/**
		 * Removes "opened" item state on popover close.
		 * @private
		 */
		MenuItem.prototype._afterPopoverClose = function() {
			this.removeStyleClass("sapMMenuItemSubMenuOpen");
		};

		/**
		 * Returns the list of menu subitems of this item, including items in groups.
		 *
		 * @private
		 * @returns {sap.m.MenuItem} List of menu subitems
		 */
		MenuItem.prototype._getItems = function() {
			const aItems = [];

			const findItems = (aItemItems) => {
				aItemItems.forEach((oItem) => {
					if (!oItem.getItemSelectionMode) {
						aItems.push(oItem);
					} else {
						findItems(oItem.getItems());
					}
				});
			};

			findItems(this.getItems());
			return aItems;
		};

		/**
		 * Returns the list of visible menu subitems of this item, including items in groups.
		 *
		 * @private
		 * @returns {sap.m.MenuItem} List of visible menu subitems
		 */
		MenuItem.prototype._getVisibleItems = function() {
			return this._getItems().filter((oItem) => oItem.getVisible());
		};

		/**
		 * Returns the icon of the menu item.
		 *
		 * @private
		 * @returns {sap.ui.core.Icon} The icon control
		 */
		MenuItem.prototype._getIcon = function() {
			const sIcon = this.getIcon();
			let oIcon = this.getAggregation("_icon");

			if (oIcon) {
				oIcon.destroy();
			}

			if (!sIcon) {
				return null;
			}

			oIcon = IconPool.createControlByURI({
				src: sIcon,
				useIconTooltip: false
			}, Image);

			this.setAggregation("_icon", oIcon, true);

			return oIcon;
		};

		/**
		 * Returns the item selection mode inherited by the parent <code>MenuItemGroup</code> (if any).
		 *
		 * @private
		 * @returns {string} The item selection mode
		 */
		MenuItem.prototype._getItemSelectionMode = function() {
			return this._itemSelectionMode;
		};

		/**
		 * Returns whether the item has subitems that will construct a submenu.
		 *
		 * @private
		 * @returns {boolean} Whether the item has a subitems
		 */
		MenuItem.prototype._hasSubmenu = function() {
			return this._getVisibleItems().length > 0;
		};

		/* ResponsivePopover and MenuWrapper functionality */

		/**
		 * Creates the internal MenuWrapper control.
		 * @param {boolean} bIsSubmenu Whether the menu in this wrapper is a sub-menu or not
		 * @returns {sap.m.MenuWrapper} The created MenuWrapper
		 * @private
		 */
		MenuItem.prototype._createMenuWrapper = function(bIsSubmenu) {
			const oMenuWrapper = new MenuWrapper(this.getId() + "-menuWrapper", { isSubmenu: bIsSubmenu });
			this.setAggregation("_menuWrapper", oMenuWrapper, true);
			return oMenuWrapper;
		};

		/**
		 * Creates the ResponsivePopover that contains the actual menu.
		 * @returns {sap.m.ResponsivePopover} The created ResponsivePopover
		 * @private
		 */
		MenuItem.prototype._createPopover = function() {
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
				offsetX: bIsSubmenu ? iOffsetXCorrection : 0,
				offsetY: bIsSubmenu ? 4 : 0,
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
		MenuItem.prototype._createBackButton = function() {
			return new Button(this.getId() + "-backbutton", {
				icon: "sap-icon://nav-back",
				tooltip: this._getBackButtonTooltipForPageWithParent(),
				press: (oEvent) => {
					this._getMenuWrapper().fireClosePopover();
				}
			});
		};

		/**
		 * Creates the custom header bar for the Responsive Popover in mobile view.
		 * @returns {sap.m.Bar} The header bar
		 */
		MenuItem.prototype._createHeaderBar = function() {
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
		MenuItem.prototype._createCloseButton = function() {
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
		MenuItem.prototype._getMenuWrapper = function() {
			const oPopover = this._getPopover();
			return oPopover ? oPopover.getContent()[0] : this.getAggregation("_menuWrapper");
		};

		/**
		 * Gets the internal ResponsivePopover.
		 * @private
		 * @returns {sap.m.ResponsivePopover} The internal _popover aggregation
		 */
		MenuItem.prototype._getPopover = function() {
			return this.getAggregation("_popover");
		};

		/**
		 * Gets the placement type for the popover depending of LTR/RTL setting.
		 * @private
		 * @returns {sap.m.PlacementType} The placement type of the popover
		*/
		MenuItem.prototype._getPopoverPlacement = function() {
			const bIsSubmenu = this._getMenuWrapper().getIsSubmenu();

			if (bIsSubmenu) {
				const bRTL = Localization.getRTL(),
					sPlacement = bRTL ? PlacementType.HorizontalPreferredLeft : PlacementType.HorizontalPreferredRight;

				return sPlacement;
			}

			return PlacementType.VerticalPreferredBottom;
		};

		/**
		 * Sets extra content to the popover.
		 * @private
		 * @param {HTMLElement} oDomRef The DOM ref to be added as extra content to the popover
		 */
		MenuItem.prototype._setExtraContent = function(oDomRef) {
			this._getPopover()._getPopup().setExtraContent([oDomRef]);
		};

		return MenuItem;

	});
