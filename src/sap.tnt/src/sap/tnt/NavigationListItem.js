/*!
 * ${copyright}
 */

// Provides control sap.tnt.NavigationListItem.
sap.ui.define(["sap/ui/thirdparty/jquery", "./library", 'sap/ui/core/Core', "sap/ui/core/Item", 'sap/ui/core/Icon',
		'./NavigationList', 'sap/ui/core/InvisibleText', 'sap/ui/core/Renderer', 'sap/ui/core/IconPool', "sap/ui/events/KeyCodes", "sap/ui/core/library",
		// jQuery Plugin "addAriaLabelledBy"
		"sap/ui/util/openWindow", "sap/ui/util/defaultLinkTypes", "sap/ui/dom/jquery/Aria"],
	function(jQuery, library, Core, Item, Icon,
			 NavigationList, InvisibleText, Renderer, IconPool, KeyCodes, coreLibrary, openWindow, defaultLinkTypes) {
		"use strict";


		// shortcut for sap.ui.core.TextAlign
		var TextAlign = coreLibrary.TextAlign;

		// shortcut for sap.ui.core.TextDirection
		var TextDirection = coreLibrary.TextDirection;

		/**
		 * Constructor for a new NavigationListItem.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The NavigationListItem control represents an action, which can be selected by the user.
		 * It can provide sub items.
		 * @extends sap.ui.core.Item
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.tnt.NavigationListItem
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var NavigationListItem = Item.extend("sap.tnt.NavigationListItem", /** @lends sap.tnt.NavigationListItem.prototype */ {
			metadata: {
				library: "sap.tnt",
				properties: {
					/**
					 * Specifies the icon for the item.
					 */
					icon: {type: "sap.ui.core.URI", group: "Misc", defaultValue: ''},
					/**
					 * Specifies if the item is expanded.
					 */
					expanded: {type: "boolean", group: "Misc", defaultValue: true},

					/**
					 * Specifies if the item has an expander.
					 */
					hasExpander : {type : "boolean", group : "Misc", defaultValue : true},

					/**
					 * Specifies if the item should be shown.
					 *
					 * @since 1.52
					 */
					visible : {type : "boolean", group : "Appearance", defaultValue : true},

					/**
					 * Defines the link target URI. Supports standard hyperlink behavior. If a JavaScript action should be triggered,
					 * this should not be set, but instead an event handler for the <code>select</code> event should be registered.
					 */
					href : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},

					/**
					 * Specifies the browsing context where the linked content will open.
					 *
					 * Options are the standard values for window.open() supported by browsers:
					 * <code>_self</code>, <code>_top</code>, <code>_blank</code>, <code>_parent</code>, <code>_search</code>.
					 * Alternatively, a frame name can be entered. This property is only used when the <code>href</code> property is set.
					 */
					target : {type : "string", group : "Behavior", defaultValue : null}
				},
				defaultAggregation: "items",
				aggregations: {

					/**
					 * The sub items.
					 */
					items: {type: "sap.tnt.NavigationListItem", multiple: true, singularName: "item"},

					_expandIconControl : {type : "sap.ui.core.Icon", multiple : false, visibility : "hidden"}
				},
				events: {
					/**
					 * Fired when this item is selected.
					 */
					select: {
						parameters: {
							/**
							 * The selected item.
							 */
							item: {type: "sap.ui.core.Item"}
						}
					}
				},
				designtime: "sap/tnt/designtime/NavigationListItem.designtime"
			}
		});

		NavigationListItem.expandIcon = 'sap-icon://navigation-right-arrow';
		NavigationListItem.collapseIcon = 'sap-icon://navigation-down-arrow';


		NavigationListItem._getInvisibleText = function() {
			if (!this._invisibleText) {
				this._invisibleText = new InvisibleText().toStatic();
			}
			return this._invisibleText;
		};

		/**
		 * Initializes the control.
		 * @private
		 * @override
		 */
		NavigationListItem.prototype.init = function () {
			this._resourceBundle = Core.getLibraryResourceBundle("sap.ui.core");
			this._resourceBundleMLib = Core.getLibraryResourceBundle("sap.m");
			this._resourceBundleTNTLib = Core.getLibraryResourceBundle("sap.tnt");
		};

		/**
		 * If the item doesn't have a key, the function returns the ID of the NavigationListItem,
		 * so the NavigationList can remember the selected item.
		 *
		 * @private
		 */
		NavigationListItem.prototype._getUniqueKey = function () {

			var sKey = this.getKey();

			if (sKey) {
				return sKey;
			}

			return this.getId();
		};

		/**
		 * Returns the <code>sap.ui.core.Icon</code> control used to display the expand/collapse icon.
		 * @returns {sap.ui.core.Icon}
		 * @private
		 */
		NavigationListItem.prototype._getExpandIconControl = function () {
			var expandIconControl = this.getAggregation('_expandIconControl');
			if (!expandIconControl) {

				var expanded = this.getExpanded();

				expandIconControl = new Icon({
					src: expanded ? NavigationListItem.collapseIcon : NavigationListItem.expandIcon,
					visible: this.getItems().length > 0 && this.getHasExpander(),
					useIconTooltip: false,
					tooltip: this._getExpandIconTooltip(!expanded)
				}).addStyleClass('sapTntNavLIExpandIcon');

				this.setAggregation("_expandIconControl", expandIconControl, true);
			}

			return expandIconControl;
		};

		/**
		 * Gets the expand/collapse icon tooltip.
		 * @private
		 */
		NavigationListItem.prototype._getExpandIconTooltip = function (expand) {

			if (!this.getEnabled()) {
				return '';
			}

			var text = expand ? 'Icon.expand' : 'Icon.collapse';

			return this._resourceBundle.getText(text);
		};

		/**
		 * Gets the tree level of this item.
		 * @private
		 */
		NavigationListItem.prototype.getLevel = function () {
			var level = 0;

			var parent = this.getParent();
			if (parent.getMetadata().getName() == 'sap.tnt.NavigationListItem') {
				return parent.getLevel() + 1;
			}

			return level;
		};

		/**
		 * Gets the NavigationList control, which holds this item.
		 * @private
		 */
		NavigationListItem.prototype.getNavigationList = function () {
			var parent = this.getParent();

			while (parent && parent.getMetadata().getName() != 'sap.tnt.NavigationList') {
				parent = parent.getParent();
			}

			return parent;
		};

		/**
		 * Returns if the parent NavigationList control is expanded.
		 * @private
		 */
		NavigationListItem.prototype._isListExpanded = function () {
			var navList = this.getNavigationList();
			return navList.getExpanded() || navList.hasStyleClass("sapTntNavLIPopup");
		};

		/**
		 * Creates a popup list.
		 * @returns {sap.tnt.NavigationList} The list for popup
		 * @private
		 */
		NavigationListItem.prototype.createPopupList = function () {

			var newSubItems = [],
				list = this.getNavigationList(),
				selectedItem = list.getSelectedItem(),
				popupSelectedItem,
				subItem,
				popupSubItem,
				subItems = this.getItems();

			for (var i = 0; i < subItems.length; i++) {

				subItem = subItems[i];

				if (subItem.getVisible()) {
					popupSubItem = new NavigationListItem({
						key: subItem.getId(),
						text: subItem.getText(),
						textDirection: subItem.getTextDirection(),
						enabled: subItem.getEnabled(),
						href: subItem.getHref(),
						target: subItem.getTarget(),
						tooltip: subItem.getTooltip()
					});

					newSubItems.push(popupSubItem);

					if (selectedItem === subItem) {
						popupSelectedItem = popupSubItem;
					}
				}

			}

			var newGroup = new NavigationListItem({
				expanded: true,
				hasExpander: false,
				key: this.getId(),
				text: this.getText(),
				enabled: this.getEnabled(),
				textDirection: this.getTextDirection(),
				href: this.getHref(),
				target: this.getTarget(),
				tooltip: this.getTooltip(),
				items: newSubItems
			});

			var navList = new NavigationList({
				itemSelect: this.onPopupItemSelect.bind(this),
				items: [
					newGroup
				]
			}).addStyleClass('sapTntNavLIPopup');

			if (selectedItem == this) {
				popupSelectedItem = newGroup;
				navList.isGroupSelected = true;
			}

			navList.setSelectedItem(popupSelectedItem);

			return navList;
		};

		/**
		 * Handles popup item selection.
		 * @private
		 */
		NavigationListItem.prototype.onPopupItemSelect = function (event) {

			var item = event.getParameter('item');

			// get the real group item from the cloned one
			item = Core.byId(item.getKey());

			item._selectItem(event);
		};

		/**
		 * Selects this item.
		 * @param {object} event The Event object
		 * @private
		 */
		NavigationListItem.prototype._selectItem = function (event) {

			var params = {
					item: this
				},
				navList = this.getNavigationList();

			this.fireSelect(params);

			navList._selectItem(params);

			this._openUrl();
		};

		/**
		 * Opens a url.
		 * @private
		 */
		NavigationListItem.prototype._openUrl = function () {
			var href = this.getHref();

			if (href) {
				openWindow(href, this.getTarget() || '_self');
			}
		};

		/**
		 * Handles key down event.
		 * @private
		 */
		NavigationListItem.prototype.onkeydown = function (event) {

			if (event.isMarked('subItem')) {
				return;
			}

			event.setMarked('subItem');

			if (this.getLevel() > 0) {
				return;
			}

			var isRtl = Core.getConfiguration().getRTL();

			//  KeyCodes.MINUS is not returning 189
			if ((event.shiftKey && event.which == 189) ||
				event.which == KeyCodes.NUMPAD_MINUS ||
				(event.which == KeyCodes.ARROW_RIGHT && isRtl) ||
				(event.which == KeyCodes.ARROW_LEFT && !isRtl)) {
				if (this.collapse()) {
					event.preventDefault();
					// prevent ItemNavigation to move the focus to the next/previous item
					event.stopPropagation();
				}
			} else if (event.which == KeyCodes.NUMPAD_PLUS ||
				(event.shiftKey && event.which == KeyCodes.PLUS) ||
				event.which == KeyCodes.ARROW_LEFT && isRtl ||
				event.which == KeyCodes.ARROW_RIGHT && !isRtl) {
				if (this.expand()) {
					event.preventDefault();
					// prevent ItemNavigation to move the focus to the next/previous item
					event.stopPropagation();
				}
			}
		};

		/**
		 * Expands the child items (works only on first-level items).
		 */
		NavigationListItem.prototype.expand = function (duration) {
			if (this.getExpanded() || !this.getHasExpander() ||
				this.getItems().length == 0 || this.getLevel() > 0) {
				return;
			}

			this.setProperty('expanded', true, true);
			this.$().find('.sapTntNavLIGroup').attr('aria-expanded', true);

			var expandIconControl = this._getExpandIconControl();
			expandIconControl.setSrc(NavigationListItem.collapseIcon);
			expandIconControl.setTooltip(this._getExpandIconTooltip(false));

			var $container = this.$().find('.sapTntNavLIGroupItems');
			var oDomRef = this.getDomRef();
			$container.stop(true, true).slideDown(duration || 'fast', function () {
				oDomRef.querySelector(".sapTntNavLIGroupItems").classList.toggle('sapTntNavLIHiddenGroupItems');
			});

			this.getNavigationList()._updateNavItems();

			return true;
		};

		/**
		 * Collapses the child items (works only on first-level items).
		 */
		NavigationListItem.prototype.collapse = function (duration) {
			if (!this.getExpanded() || !this.getHasExpander() ||
				this.getItems().length == 0 || this.getLevel() > 0) {
				return;
			}

			this.setProperty('expanded', false, true);
			this.$().find('.sapTntNavLIGroup').attr('aria-expanded', false);

			var expandIconControl = this._getExpandIconControl();
			expandIconControl.setSrc(NavigationListItem.expandIcon);
			expandIconControl.setTooltip(this._getExpandIconTooltip(true));

			var $container = this.$().find('.sapTntNavLIGroupItems');
			var oDomRef = this.getDomRef();
			$container.stop(true, true).slideUp(duration || 'fast', function () {
				oDomRef.querySelector(".sapTntNavLIGroupItems").classList.toggle('sapTntNavLIHiddenGroupItems');
			});

			this.getNavigationList()._updateNavItems();

			return true;
		};

		/**
		 * Handles tap event.
		 * @private
		 */
		NavigationListItem.prototype.ontap = function (event) {

			var navList = this.getNavigationList(),
				$icon = jQuery(event.target).closest(".sapUiIcon"),
				level = this.getLevel(),
				parent,
				list;

			if (event.isMarked('subItem')) {
				return;
			}

			event.setMarked('subItem');

			if (!this.getEnabled()) {
				return;
			}

			// second navigation level
			if (level === 1) {

				parent = this.getParent();

				if (this.getEnabled() && parent.getEnabled()) {
					this._selectItem(event);
				}

				return;
			}

			// first navigation level
			if (navList.getExpanded() || !this.getItems().length) {

				if (!$icon.length || !$icon.hasClass('sapTntNavLIExpandIcon')) {
					this._selectItem(event);
					return;
				}

				event.preventDefault();

				if (this.getExpanded()) {
					this.collapse();
				} else {
					this.expand();
				}
			} else {
				list = this.createPopupList();
				navList._openPopover(this, list);
			}
		};

		NavigationListItem.prototype.onsapenter = NavigationListItem.prototype.ontap;
		NavigationListItem.prototype.onsapspace = NavigationListItem.prototype.ontap;

		/**
		 * Renders the item.
		 * @private
		 */
		NavigationListItem.prototype.render = function (rm, control) {
			if (!this.getVisible()) {
			    return;
			}

			if (this.getLevel() === 0) {
				this.renderFirstLevelNavItem(rm, control);
			} else {
				this.renderSecondLevelNavItem(rm, control);
			}
		};

		/**
		 * Renders the group item.
		 * @private
		 */
		NavigationListItem.prototype.renderGroupItem = function (rm, control) {

			var isListExpanded = this._isListExpanded(),
				isNavListItemExpanded = this.getExpanded(),
				items = this._getVisibleItems(this),
				childrenLength = items.length,
				text = this.getText(),
				href = this.getHref(),
				target = this.getTarget(),
				tooltip,
				ariaProps = {
					level: '1',
					role: 'treeitem',
					selected: false,
					roledescription: this._resourceBundleTNTLib.getText("NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_TREE_ITEM")
				};

			rm.openStart("div");

			rm.class("sapTntNavLIItem");
			rm.class("sapTntNavLIGroup");

			if (control._selectedItem === this) {
				ariaProps.selected = true;

				rm.class("sapTntNavLIItemSelected");
			}

			if (!this.getEnabled()) {
				rm.class("sapTntNavLIItemDisabled");
			}

			if (!isListExpanded && this._hasSelectedChild(control._selectedItem)) {
				rm.class("sapTntNavLIItemSelected");
			}

			// checking if there are items level 2 in the NavigationListItem
			// if yes - there is need of aria-expanded property
			if (isListExpanded) {

				tooltip = this.getTooltip_AsString() || text;

				if (tooltip) {
					rm.attr("title", tooltip);
				}

				if (this.getEnabled()) {
					rm.attr("tabindex", "-1");
				}

				if (childrenLength > 0) {
					ariaProps.expanded = isNavListItemExpanded;
				}

				rm.accessibilityState(ariaProps);
			}

			rm.openEnd();

			rm.openStart('a', this.getId() + '-a');
			rm.attr('tabindex', '-1');

			if (href) {
				rm.attr('href', href);
			}

			if (target) {
				rm.attr('target', target);
				rm.attr('rel', defaultLinkTypes('', target));
			}

			rm.openEnd();

			this._renderIcon(rm);

			if (control.getExpanded()) {
				var expandIconControl = this._getExpandIconControl();
				expandIconControl.setVisible(this.getItems().length > 0 && this.getHasExpander());
				expandIconControl.setSrc(this.getExpanded() ? NavigationListItem.collapseIcon : NavigationListItem.expandIcon);
				expandIconControl.setTooltip(this._getExpandIconTooltip(!this.getExpanded()));
				this._renderText(rm);
				rm.renderControl(expandIconControl);
			}

			rm.close("a");

			rm.close("div");
		};

		/**
		 * Renders the first-level navigation item.
		 * @private
		 */
		NavigationListItem.prototype.renderFirstLevelNavItem = function (rm, control) {
			var item,
				items = this._getVisibleItems(this),
				childrenLength = items.length,
				expanded = this.getExpanded(),
				isListExpanded = this._isListExpanded(),
				tooltip,
				ariaProps = {
					role: 'menuitemradio',
					checked: false,
					roledescription: this._resourceBundleTNTLib.getText("NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_MENUITEM")
				};

			rm.openStart("li", this);

			if (!isListExpanded) {
				if (this.getEnabled()) {
					rm.attr('tabindex', '-1');
				}

				tooltip = this.getTooltip_AsString() || this.getText();

				if (tooltip) {
					rm.attr("title", tooltip);
				}

				if (childrenLength > 0) {
					if (this.getEnabled()) {
						rm.class("sapTnTNavLINotExpandedTriangle");
					}

					ariaProps.haspopup = "tree";
				}

				if (control._selectedItem === this) {
					ariaProps.checked = true;
				}

				// ARIA
				rm.accessibilityState(ariaProps);
			} else {
				rm.attr('aria-hidden', 'true');
			}

			rm.openEnd();

			this.renderGroupItem(rm, control);

			if (isListExpanded) {

				rm.openStart('ul');
				rm.attr('aria-hidden', 'true');

				rm.attr('role', 'group');
				rm.class("sapTntNavLIGroupItems");

				if (!expanded) {
					rm.class("sapTntNavLIHiddenGroupItems");
				}

				rm.openEnd();

				for (var i = 0; i < childrenLength; i++) {
					item = items[i];
					item.render(rm, control, i, childrenLength);
				}

				rm.close("ul");
			}

			rm.close("li");
		};

		/**
		 * Renders the second-level navigation item.
		 * @private
		 */
		NavigationListItem.prototype.renderSecondLevelNavItem = function (rm, control) {

			var group = this.getParent(),
				href = this.getHref(),
				target = this.getTarget(),
				ariaProps = {
					role: 'treeitem',
					level: '2',
					selected: false,
					roledescription: this._resourceBundleTNTLib.getText("NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_TREE_ITEM")
				};

			rm.openStart('li', this);
			rm.class("sapTntNavLIItem");
			rm.class("sapTntNavLIGroupItem");

			if (control._selectedItem === this) {
				ariaProps.selected = true;

				rm.class("sapTntNavLIItemSelected");
			}

			if (!this.getEnabled() || !group.getEnabled()) {
				rm.class("sapTntNavLIItemDisabled");
			} else {
				rm.attr('tabindex', '-1');
			}

			var text = this.getText();

			var tooltip = this.getTooltip_AsString() || text;
			if (tooltip) {
				rm.attr("title", tooltip);
			}

			// ARIA
			rm.accessibilityState(ariaProps);

			rm.openEnd();

			rm.openStart('a', this.getId() + '-a');
			rm.attr('tabindex', '-1');

			if (href) {
				rm.attr('href', href);
			}

			if (target) {
				rm.attr('target', target);
				rm.attr('rel', defaultLinkTypes('', target));
			}

			rm.openEnd();


			this._renderText(rm);

			rm.close('a');

			rm.close('li');
		};

		/**
		 * Renders an icon.
		 * @private
		 */
		NavigationListItem.prototype._renderIcon =  function(rm) {
			var icon = this.getIcon(),
				iconInfo = IconPool.getIconInfo(icon);

			if (icon) {
				// Manually rendering the icon instead of using RenderManager's writeIcon. In this way title
				// attribute is not rendered and the tooltip of the icon does not override item's tooltip
				rm.openStart('span');
				rm.class("sapUiIcon");
				rm.class("sapTntNavLIGroupIcon");

				rm.attr("aria-hidden", true);

				if (iconInfo && !iconInfo.suppressMirroring) {
					rm.class("sapUiIconMirrorInRTL");
				}

				if (iconInfo) {
					rm.attr("data-sap-ui-icon-content", iconInfo.content);
					rm.style("font-family", "'" + iconInfo.fontFamily + "'");
				}

				rm.openEnd();
				rm.close('span');
			} else {
				rm.openStart('span');
				rm.class('sapUiIcon');
				rm.class('sapTntNavLIGroupIcon');
				rm.attr('aria-hidden', true);
				rm.openEnd();
				rm.close('span');
			}
		};

		/**
		 * Renders a text.
		 * @private
		 */
		NavigationListItem.prototype._renderText =  function(rm) {
			rm.openStart('span');
			rm.class("sapMText");
			rm.class("sapTntNavLIText");
			rm.class("sapMTextNoWrap");

			var textDir = this.getTextDirection();
			if (textDir !== TextDirection.Inherit){
				rm.attr("dir", textDir.toLowerCase());
			}

			var textAlign = Renderer.getTextAlign(TextAlign.Begin, textDir);
			if (textAlign) {
				rm.style("text-align", textAlign);
			}

			rm.openEnd();
			rm.text(this.getText());
			rm.close('span');
		};

		/**
		 * Deselects this item.
		 * @private
		 */
		NavigationListItem.prototype._unselect = function() {
			var $this = this.$(),
				navList = this.getNavigationList();

			if (!navList) {
				return;
			}

			if (this._isListExpanded()) {
				if (this.getLevel() === 0) {
					$this = $this.find('.sapTntNavLIGroup');
				}

				$this.attr('aria-selected', false);
			} else {
				$this.attr('aria-checked', false);

				$this = $this.find('.sapTntNavLIGroup');

				if (this.getParent().isA("sap.tnt.NavigationListItem")) {
					this.getParent().$().find('.sapTntNavLIGroup').removeClass('sapTntNavLIItemSelected');
				}
			}

			$this.removeClass('sapTntNavLIItemSelected');
		};

		/**
		 * Selects this item.
		 * @private
		 */
		NavigationListItem.prototype._select = function() {

			var $this = this.$(),
				navList = this.getNavigationList();

				if (!navList) {
					return;
				}

			if (this._isListExpanded()) {
				if (this.getLevel() === 0) {
					$this = $this.find('.sapTntNavLIGroup');
				}

				$this.attr('aria-selected', true);
			} else {

				$this.attr('aria-checked', true);

				$this = $this.find('.sapTntNavLIGroup');

				if (this.getParent().isA("sap.tnt.NavigationListItem")) {
					this.getParent().$().find('.sapTntNavLIGroup').addClass('sapTntNavLIItemSelected');
				}
				navList._closePopover();
			}

			$this.addClass('sapTntNavLIItemSelected');
		};

		/**
		 * Gets DOM references of the navigation items.
		 * @private
		 */
		NavigationListItem.prototype._getDomRefs = function() {
			var domRefs = [];

			if (!this.getEnabled()) {
				return domRefs;
			}

			var $this = this.$();

			domRefs.push($this.find('.sapTntNavLIGroup')[0]);

			if (this.getExpanded()) {
				var subItems = $this.find('.sapTntNavLIGroupItem');
				for (var i = 0; i < subItems.length; i++) {
					domRefs.push(subItems[i]);
				}
			}

			return domRefs;
		};

		/**
		 * Returns all the items aggregation marked as visible
		 * @param {sap.tnt.NavigationList|sap.tnt.NavigationListItem} control The control to check for visible items
		 * @return {sap.tnt.NavigationListItem[]} All the visible NavigationListItems
		 * @private
		 */
		NavigationListItem.prototype._getVisibleItems = function(control) {
			var visibleItems = [];
			var items = control.getItems();
			var item;

			for (var index = 0; index < items.length; index++) {
				item = items[index];
				if (item.getVisible()) {
					visibleItems.push(item);
				}
			}

			return visibleItems;
		};

		NavigationListItem.prototype.onclick = function(event) {
			// prevent click event on <a> element, in order to avoid unnecessary href changing
			// this will be handled by _openUrl
			if (this.getHref()) {
				event.preventDefault();
			}
		};

		NavigationListItem.prototype.onmousedown = function(event) {
			// prevent focusin event to be fired on <a> element
			// ItemNavigation will take care for focusing the <li> element
			if (this.getHref()) {
				event.preventDefault();
			}
		};

		NavigationListItem.prototype.onfocusin = function(event) {

			if (event.srcControl !== this) {
				return;
			}

			this._updateAccessibilityText();
		};

		NavigationListItem.prototype._updateAccessibilityText = function() {
			var invisibleText = NavigationListItem._getInvisibleText(),
				navList = this.getNavigationList(),
				bundle = this._resourceBundleMLib,
				$focusedItem = this._getAccessibilityItem(),
				selected = navList._selectedItem === this ? bundle.getText("LIST_ITEM_SELECTED") : '',
				text = selected;

			// for role "treeitem" we have to manually describe the role and position
			if (navList.getExpanded()) {
				var accType = bundle.getText("ACC_CTR_TYPE_TREEITEM"),
					mPosition = this._getAccessibilityPosition(),
					itemPosition = bundle.getText("LIST_ITEM_POSITION", [mPosition.index, mPosition.size]),
					itemText = this.getText();

				itemPosition = bundle.getText("LIST_ITEM_POSITION", [mPosition.index, mPosition.size]);
				text = accType + " " + selected + " " + itemText + " " + itemPosition;
			}

			invisibleText.setText(text);
			$focusedItem.addAriaLabelledBy(invisibleText.getId());
		};

		/**
		 * Returns the acc index and size
		 * @return {Object} The index and the size
		 * @private
		 */
		NavigationListItem.prototype._getAccessibilityPosition = function() {
			var parent = this.getParent(),
				visibleItems = this._getVisibleItems(parent),
				size = visibleItems.length,
				index = visibleItems.indexOf(this) + 1;

			return {
				index: index,
				size: size
			};
		};

		/**
		 * Returns the actual item, which holds the acc information
		 * @return {Object} The item, which holds the acc information
		 * @private
		 */
		NavigationListItem.prototype._getAccessibilityItem = function() {

			var $accItem = this.$(),
				navList = this.getNavigationList(),
				isListExpanded = navList.getExpanded();

			if (isListExpanded && this.getLevel() === 0) {
				$accItem = $accItem.find('.sapTntNavLIGroup');
			}

			return $accItem;
		};

		/**
		 * Returns if a child item is selected
		 * @return {boolean} if a child item is selected
		 * @private
		 */
		NavigationListItem.prototype._hasSelectedChild =  function(selectedItem) {
			var items = this.getItems(),
				i;

			for (i = 0; i < items.length; i++) {
				if (items[i] === selectedItem) {
					return true;
				}
			}

			return false;
		};

		return NavigationListItem;

	});
