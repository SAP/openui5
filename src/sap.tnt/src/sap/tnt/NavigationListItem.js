// Provides control sap.tnt.NavigationListItem.
sap.ui.define(["jquery.sap.global", "./library", "sap/ui/core/Item",
		'sap/ui/core/Icon', './NavigationList', 'sap/ui/core/Renderer', 'sap/ui/core/IconPool'],
	function(jQuery, library, Item,
	         Icon, NavigationList, Renderer, IconPool) {
		"use strict";

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
					hasExpander : {type : "boolean", group : "Misc", defaultValue : true}
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
				}
			}
		});

		NavigationListItem.expandIcon = 'sap-icon://navigation-right-arrow';
		NavigationListItem.collapseIcon = 'sap-icon://navigation-down-arrow';

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

			return this.getNavigationList()._resourceBundle.getText(text);
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
		 */
		NavigationListItem.prototype.getNavigationList = function () {
			var parent = this.getParent();

			while (parent && parent.getMetadata().getName() != 'sap.tnt.NavigationList') {
				parent = parent.getParent();
			}

			return parent;
		};

		/**
		 * Creates a popup list.
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

				popupSubItem = new NavigationListItem({
					key: subItem.getId(),
					text: subItem.getText(),
					textDirection: subItem.getTextDirection(),
					enabled: subItem.getEnabled()
				});

				newSubItems.push(popupSubItem);

				if (selectedItem == subItem) {
					popupSelectedItem = popupSubItem;
				}
			}

			var newGroup = new NavigationListItem({
				expanded: true,
				hasExpander: false,
				key: this.getId(),
				text: this.getText(),
				enabled: this.getEnabled(),
				textDirection: this.getTextDirection(),
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
			item = sap.ui.getCore().byId(item.getKey());

			item._selectItem(event);
		};

		/**
		 * Selects this item.
		 * @private
		 */
		NavigationListItem.prototype._selectItem = function (event) {

			var params = {
				item: this
			};

			this.fireSelect(params);

			var navList = this.getNavigationList();
			navList._selectItem(params);
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

			var isRtl = sap.ui.getCore().getConfiguration().getRTL();

			//  jQuery.sap.KeyCodes.MINUS is not returning 189
			if ((event.shiftKey && event.which == 189) ||
				event.which == jQuery.sap.KeyCodes.NUMPAD_MINUS ||
				(event.which == jQuery.sap.KeyCodes.ARROW_RIGHT && isRtl) ||
				(event.which == jQuery.sap.KeyCodes.ARROW_LEFT && !isRtl)) {
				if (this.collapse()) {
					event.preventDefault();
					event.target = null;
				}
			} else if (event.which == jQuery.sap.KeyCodes.NUMPAD_PLUS ||
				(event.shiftKey && event.which == jQuery.sap.KeyCodes.PLUS) ||
				event.which == jQuery.sap.KeyCodes.ARROW_LEFT && isRtl ||
				event.which == jQuery.sap.KeyCodes.ARROW_RIGHT && !isRtl) {
				if (this.expand()) {
					event.preventDefault();
					event.target = null;
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
			this.$().attr('aria-expanded', true);

			var expandIconControl = this._getExpandIconControl();
			expandIconControl.setSrc(NavigationListItem.collapseIcon);
			expandIconControl.setTooltip(this._getExpandIconTooltip(false));

			var $container = this.$().find('.sapTntNavLIGroupItems');
			$container.stop(true, true).slideDown(duration || 'fast', function () {
				$container.toggleClass('sapTntNavLIHiddenGroupItems');
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
			this.$().attr('aria-expanded', false);

			var expandIconControl = this._getExpandIconControl();
			expandIconControl.setSrc(NavigationListItem.expandIcon);
			expandIconControl.setTooltip(this._getExpandIconTooltip(true));

			var $container = this.$().find('.sapTntNavLIGroupItems');
			$container.stop(true, true).slideUp(duration || 'fast', function () {
				$container.toggleClass('sapTntNavLIHiddenGroupItems');
			});

			this.getNavigationList()._updateNavItems();

			return true;
		};

		/**
		 * Handles tap event.
		 * @private
		 */
		NavigationListItem.prototype.ontap = function (event) {

			if (event.isMarked('subItem') || !this.getEnabled()) {
				return;
			}

			event.setMarked('subItem');
			event.preventDefault();

			var navList = this.getNavigationList();
			var source = sap.ui.getCore().byId(event.target.id);
			var level = this.getLevel();

			// second navigation level
			if (level == 1) {

				var parent = this.getParent();

				if (this.getEnabled() && parent.getEnabled()) {
					this._selectItem(event);
				}

				return;
			}

			// first navigation level
			if (navList.getExpanded() || this.getItems().length == 0) {

				if (!source || source.getMetadata().getName() != 'sap.ui.core.Icon' || !source.$().hasClass('sapTntNavLIExpandIcon')) {
					this._selectItem(event);
					return;
				}

				if (this.getExpanded()) {
					this.collapse();
				} else {
					this.expand();
				}
			} else {
				var list = this.createPopupList();
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

			if (this.getLevel() == 0) {
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

			rm.write('<div');

			rm.addClass("sapTntNavLIItem");
			rm.addClass("sapTntNavLIGroup");

			if (!this.getEnabled()) {
				rm.addClass("sapTntNavLIItemDisabled");
			} else if (control.getExpanded()) {
				rm.write(' tabindex="-1"');
			}

			if (control.getExpanded()) {
				var text = this.getText();

				var sTooltip = this.getTooltip_AsString() || text;
				if (sTooltip) {
					rm.writeAttributeEscaped("title", sTooltip);
				}

				rm.writeAttributeEscaped("aria-label", text);
			}

			rm.writeClasses();

			rm.write(">");

			this._renderIcon(rm);

			if (control.getExpanded()) {

				var expandIconControl = this._getExpandIconControl();
				expandIconControl.setVisible(this.getItems().length > 0 && this.getHasExpander());
				expandIconControl.setSrc(this.getExpanded() ? NavigationListItem.collapseIcon : NavigationListItem.expandIcon);
				expandIconControl.setTooltip(this._getExpandIconTooltip(!this.getExpanded()));

				this._renderText(rm);
				rm.renderControl(expandIconControl);
			}

			rm.write("</div>");
		};

		/**
		 * Renders the first-level navigation item.
		 * @private
		 */
		NavigationListItem.prototype.renderFirstLevelNavItem = function (rm, control) {
			var item,
				items = this.getItems(),
				expanded = this.getExpanded(),
				isListExpanded = control.getExpanded();

			rm.write('<li');
			rm.writeElementData(this);
			rm.writeAttribute("aria-expanded", this.getExpanded());
			rm.writeAttribute("aria-level", 1);

			if (this.getEnabled() && !isListExpanded) {
				rm.write(' tabindex="-1"');
			}

			var text = this.getText();

			// ARIA
			if (!isListExpanded) {
				var text = this.getText();

				var sTooltip = this.getTooltip_AsString() || text;
				if (sTooltip) {
					rm.writeAttributeEscaped("title", sTooltip);
				}

				rm.writeAttributeEscaped("aria-label", text);

				rm.writeAttribute("role", 'button');
				rm.writeAttribute("aria-haspopup", true);
			} else {
				rm.writeAttribute("role", "treeitem");
			}

			rm.writeAttribute("tabindex", "0");

			rm.write(">");

			this.renderGroupItem(rm, control);

			if (isListExpanded) {

				rm.write("<ul");

				rm.writeAttribute("role", "group");
				rm.addClass("sapTntNavLIGroupItems");

				if (!expanded) {
					rm.addClass("sapTntNavLIHiddenGroupItems");
				}

				rm.writeClasses();
				rm.write(">");

				for (var i = 0; i < items.length; i++) {
					item = items[i];
					item.render(rm, control, this);
				}

				rm.write("</ul>");
			}

			rm.write("</li>");
		};

		/**
		 * Renders the second-level navigation item.
		 * @private
		 */
		NavigationListItem.prototype.renderSecondLevelNavItem = function (rm, control) {

			var group = this.getParent();

			rm.write('<li');

			rm.writeElementData(this);

			rm.addClass("sapTntNavLIItem");
			rm.addClass("sapTntNavLIGroupItem");

			if (!this.getEnabled() || !group.getEnabled()) {
				rm.addClass("sapTntNavLIItemDisabled");
			} else {
				rm.write(' tabindex="-1"');
			}

			var text = this.getText();

			var sTooltip = this.getTooltip_AsString() || text;
			if (sTooltip) {
				rm.writeAttributeEscaped("title", sTooltip);
			}

			// ARIA
			rm.writeAttribute("role", 'treeitem');
			rm.writeAttribute("aria-level", 2);

			rm.writeClasses();

			rm.write(">");

			this._renderText(rm);

			rm.write("</li>");
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
				rm.write('<span');

				rm.addClass("sapUiIcon");
				rm.addClass("sapTntNavLIGroupIcon");

				rm.writeAttribute("aria-hidden", true);

				if (iconInfo && !iconInfo.suppressMirroring) {
					rm.addClass("sapUiIconMirrorInRTL");
				}

				if (iconInfo) {
					rm.writeAttribute("data-sap-ui-icon-content", iconInfo.content);
					rm.addStyle("font-family", "'" + iconInfo.fontFamily + "'");
				}

				rm.writeClasses();
				rm.writeStyles();

				rm.write("></span>");
			} else {
				rm.write('<span class="sapUiIcon sapTntNavLIGroupIcon" aria-hidden="true"></span>');
			}

		};

		/**
		 * Renders a text.
		 * @private
		 */
		NavigationListItem.prototype._renderText =  function(rm) {
			rm.write('<span');

			rm.addClass("sapMText");
			rm.addClass("sapTntNavLIText");
			rm.addClass("sapMTextNoWrap");

			rm.writeClasses();

			var textDir = this.getTextDirection();
			if (textDir !== sap.ui.core.TextDirection.Inherit){
				rm.writeAttribute("dir", textDir.toLowerCase());
			}

			var textAlign = Renderer.getTextAlign(sap.ui.core.TextAlign.Begin, textDir);
			if (textAlign) {
				rm.addStyle("text-align", textAlign);
				rm.writeStyles();
			}

			rm.write(">");
			rm.writeEscaped(this.getText());
			rm.write("</span>");
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

			$this.removeClass('sapTntNavLIItemSelected');

			if (navList.getExpanded()) {

				if (this.getLevel() == 0) {
					$this = $this.find('.sapTntNavLIGroup');
				}

				$this.removeAttr('aria-selected');
			} else {
				$this.removeAttr('aria-pressed');
			}
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

			$this.addClass('sapTntNavLIItemSelected');

			if (navList.getExpanded()) {

				if (this.getLevel() == 0) {
					$this = $this.find('.sapTntNavLIGroup');
				}

				$this.attr('aria-selected', true);
			} else {
				$this.attr('aria-pressed', true);

				navList._closePopover();
			}
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

			domRefs.push($this[0]);

			if (this.getExpanded()) {
				var subItems = $this.find('.sapTntNavLIGroupItem');

				for (var i = 0; i < subItems.length; i++) {
					domRefs.push(subItems[i]);
				}
			}

			return domRefs;
		};

		return NavigationListItem;

	}, /* bExport= */true);

/*!
 * ${copyright}
 */
