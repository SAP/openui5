/*!
 * ${copyright}
 */

sap.ui.define([
		'./library',
		'sap/ui/core/Element',
		'sap/ui/Device',
		"sap/ui/core/Lib",
		"sap/ui/dom/isHidden",
		'sap/ui/core/ResizeHandler',
		'./ListItemBase',
		'./Button',
		'./ToolbarSeparator',
		'sap/m/OverflowToolbar',
		'sap/m/OverflowToolbarLayoutData',
		'sap/ui/events/KeyCodes',
		'sap/ui/core/IconPool',
		'sap/ui/core/Icon',
		'sap/ui/core/library'
	],
	function (library,
			  Element,
			  Device,
			  Library,
			  isHidden,
			  ResizeHandler,
			  ListItemBase,
			  Button,
			  ToolbarSeparator,
			  OverflowToolbar,
			  OverflowToolbarLayoutData,
			  KeyCodes,
			  IconPool,
			  Icon,
			  coreLibrary) {
		'use strict';

		var NLI_RANGE_SET = "NLIRangeSet";
		Device.media.initRangeSet(NLI_RANGE_SET, [600], "px", ["S", "M"], true);

		// shortcut for sap.ui.core.Priority
		var Priority = coreLibrary.Priority;

		// shortcut for sap.m.ButtonType
		var ButtonType = library.ButtonType;

		// shortcut for sap.m.ToolbarStyle
		var ToolbarStyle = library.ToolbarStyle;

		// shortcut for sap.m.OverflowToolbarPriority
		var OverflowToolbarPriority = library.OverflowToolbarPriority;

		var resourceBundle = Library.getResourceBundleFor('sap.m'),
			closeText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_CLOSE'), // this is used for tooltip for the "X" button and the text of the button "X" when it is in the overflow toolbar on mobile
			closeAllText = resourceBundle.getText('NOTIFICATION_LIST_GROUP_CLOSE'); // this is used for tooltip for the "X" button and the text of the button "X" when it is in the overflow toolbar on mobile

		/**
		 * Constructor for a new <code>NotificationListBase</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The NotificationListBase is the abstract base class for {@link sap.m.NotificationListItem} and {@link sap.m.NotificationListGroup}.
		 *
		 * The NotificationList controls are designed for the SAP Fiori notification center.
		 * <h4>Overview</h4>
		 * NotificationListBase defines the general structure of a notification item. Most of the behavioral logic is defined for the single items or groups.
		 *
		 * <h4>Structure</h4>
		 * The base holds properties for the following elements:
		 * <ul>
		 * <li>Author name</li>
		 * <li>Author picture</li>
		 * <li>Time stamp</li>
		 * <li>Priority</li>
		 * <li>Title</li>
		 * </ul>
		 * Additionally, by setting these properties you can determine if buttons are shown:
		 * <ul>
		 * <li><code>showButtons</code> - action buttons visibility</li>
		 * <li><code>showCloseButton</code> - close button visibility</li>
		 * </ul>
		 *
		 * <h4>Note</h4>
		 * There are several properties, that are inherited from <code>ListItemBase</code> and have no
		 * visual representation in the Notifications - <code>counter</code>, <code>highlight</code>, <code>highlightText</code>, <code>navigated</code>, <code>selected</code>, <code>type</code>
		 * @extends sap.m.ListItemBase
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @abstract
		 * @since 1.38
		 * @alias sap.m.NotificationListBase
		 */
		var NotificationListBase = ListItemBase.extend('sap.m.NotificationListBase', /** @lends sap.m.NotificationListBase.prototype */ {
			metadata: {
				library: 'sap.m',
				"abstract": true,
				properties: {
					// unread is inherit from the ListItemBase.

					/**
					 * Determines the priority of the Notification.
					 */
					priority: {type: 'sap.ui.core.Priority', group: 'Appearance', defaultValue: Priority.None},

					/**
					 * Determines the title of the NotificationListBase item.
					 */
					title: {type: 'string', group: 'Data', defaultValue: ''},

					/**
					 * The time stamp of the Notification.
					 * @deprecated As of version 1.123, this property is available directly on {@link sap.m.NotificationListItem}.
					 */
					datetime: {type: 'string', group: 'Appearance', defaultValue: ''},

					/**
					 * Determines the action buttons visibility.
					 *
					 * <b>Note:</b> Action buttons are not shown when Notification List Groups are collapsed.
					 */
					showButtons: {type: 'boolean', group: 'Behavior', defaultValue: true},

					/**
					 * Determines the visibility of the close button.
					 */
					showCloseButton: {type: 'boolean', group: 'Behavior', defaultValue: true},

					/**
					 * Determines the notification author name.
					 * @deprecated As of version 1.123. This property is available directly on {@link sap.m.NotificationListItem}.
					 */
					authorName: {type: 'string', group: 'Appearance', defaultValue: ''},

					/**
					 * Determines the URL of the notification author picture.
					 * @deprecated As of version 1.123. This property is available directly on {@link sap.m.NotificationListItem}.
					 */
					authorPicture: {type: 'sap.ui.core.URI'}

				},
				aggregations: {
					/**
					 * Action buttons.
					 */
					buttons: {type: 'sap.m.Button', multiple: true},

					/**
					 * Close button.
					 * @private
					 */
					_closeButton: {type: 'sap.m.Button', multiple: false, visibility: "hidden"},

					/**
					 * The overflow toolbar.
					 * @private
					 */
					_overflowToolbar: {type: 'sap.m.OverflowToolbar', multiple: false, visibility: "hidden"},

					/**
					 * The priority icon.
					 * @private
					 */
					_priorityIcon: {type: 'sap.ui.core.Icon', multiple: false, visibility: "hidden"}

				},
				events: {
					/**
					 * Fired when the close button of the notification is pressed.<br><b>Note:</b> Pressing the close button doesn't destroy the notification automatically.
					 */
					close: {}

					// 'tap' and 'press' events are inherited from ListItemBase.
				}
			},
			renderer: null // this class has no renderer (it is abstract)
		});

		// overrides ListItemBase method
		NotificationListBase.prototype._activeHandling = function () {

		};

		// overrides ListItemBase method
		NotificationListBase.prototype.updateSelectedDOM = function () {

		};

		NotificationListBase.prototype.getAccessibilityText = function () {
			return '';
		};

		/**
		 * @override
		 */
		NotificationListBase.prototype.setProperty = function () {
			this._resetButtonsOverflow();

			return ListItemBase.prototype.setProperty.apply(this, arguments);
		};

		NotificationListBase.prototype.getButtons = function () {
			var closeButton = this._getCloseButton(),
				toolbarSeparator = this._getToolbarSeparator();

			return this._getOverflowToolbar().getContent().filter(function (item) {
				return item !== closeButton && item !== toolbarSeparator;
			}, this);
		};

		NotificationListBase.prototype.addButton = function (oButton) {
			var overflowToolbar = this._getOverflowToolbar(),
				index = overflowToolbar.getContent().length;

			if (this._getToolbarSeparator()) {
				index -= 2;
			}

			overflowToolbar.insertContent(oButton, index);

			this._resetButtonsOverflow();
			this.invalidate();

			return this;
		};

		NotificationListBase.prototype.insertButton = function (oButton, index) {
			this._getOverflowToolbar().insertContent(oButton, index);

			this._resetButtonsOverflow();
			this.invalidate();

			return this;
		};

		NotificationListBase.prototype.removeButton = function (oButton) {
			var result = this._getOverflowToolbar().removeContent(oButton.getId());

			this._resetButtonsOverflow();
			this.invalidate();

			return result;
		};

		NotificationListBase.prototype.removeAllButtons = function () {
			var overflowToolbar = this._getOverflowToolbar(),
				buttons = this.getButtons();

			buttons.forEach(function (button) {
				overflowToolbar.removeContent(button);
			});

			this._resetButtonsOverflow();
			this.invalidate();

			return this;
		};

		NotificationListBase.prototype.destroyButtons = function () {
			var buttons = this.getButtons();

			buttons.forEach(function (button) {
				button.destroy();
			});

			this._resetButtonsOverflow();
			this.invalidate();

			return this;
		};

		/* Clones the NotificationListBase.
		 *
		 * @public
		 * @returns {this} The cloned NotificationListBase.
		 */
		NotificationListBase.prototype.clone = function () {
			var clonedObject = ListItemBase.prototype.clone.apply(this, arguments);

			// overflow toolbar has been created but the clone of this item does no longer have bindings for the “buttons” aggregation; workaround: destroy and create anew as clone
			clonedObject.destroyAggregation('_overflowToolbar');
			var overflowToolbar = this.getAggregation('_overflowToolbar');
			if (overflowToolbar) {
				clonedObject.setAggregation("_overflowToolbar", overflowToolbar.clone(), true);
			}

			return clonedObject;
		};

		NotificationListBase.prototype._getOverflowToolbar = function () {
			var overflowToolbar = this.getAggregation('_overflowToolbar');

			if (!overflowToolbar) {
				overflowToolbar = new OverflowToolbar(this.getId() + '-overflowToolbar', {
					style: ToolbarStyle.Clear
				});
				this.setAggregation("_overflowToolbar", overflowToolbar, true);
			}

			return overflowToolbar;
		};


		NotificationListBase.prototype._getCloseButton = function () {
			var closeButton,
				overflowToolbar,
				overflowToolbarContent,
				closeButtonIndex;

			overflowToolbar = this._getOverflowToolbar();
			overflowToolbarContent = overflowToolbar.getContent();

			if (overflowToolbarContent.length) {
				closeButtonIndex = overflowToolbarContent.length - 1;
				closeButton = overflowToolbarContent[closeButtonIndex];

				if (closeButton.getId() !== this.getId() + "-closeButtonX") {
					closeButton = null;
				}
			}

			if (!closeButton) {
				closeButton = this.getAggregation("_closeButton");
			}

			return closeButton;
		};

		NotificationListBase.prototype._createCloseButton = function () {
			var closeButton,
				isNotificationListGroup = this.isA("sap.m.NotificationListGroup"),
				isCollapsed = isNotificationListGroup && this.getCollapsed();

			if (this._isSmallSize() && !isCollapsed) {
				closeButton = new Button(this.getId() + '-closeButtonX', {
					text: this.isA("sap.m.NotificationListItem") ? closeText : closeAllText,
					type: ButtonType.Default,
					press: function () {
						this.close();
					}.bind(this)
				});
			} else {
				closeButton = new Button(this.getId() + '-closeButtonX', {
					icon: IconPool.getIconURI('decline'),
					type: ButtonType.Transparent,
					tooltip: this.isA("sap.m.NotificationListItem") ? closeText : closeAllText,
					press: function () {
						this.close();
					}.bind(this)
				});
			}

			this.setAggregation("_closeButton", closeButton);

			return closeButton;
		};

		NotificationListBase.prototype._getToolbarSeparator = function () {
			var toolbarSeparator,
				overflowToolbar = this._getOverflowToolbar(),
				overflowToolbarContent = overflowToolbar.getContent(),
				toolbarSeparatorIndex;

			if (overflowToolbarContent.length) {
				toolbarSeparatorIndex = overflowToolbarContent.length - 2;
				toolbarSeparator = overflowToolbarContent[toolbarSeparatorIndex];
			}

			if (toolbarSeparator && toolbarSeparator.isA("sap.m.ToolbarSeparator")) {
				return toolbarSeparator;
			}

			return null;
		};

		NotificationListBase.prototype._hasToolbarOverflowButton = function () {
			var iMinLength =  this._isSmallSize() ? 0 : 1;
			return this.getShowButtons() && this.getButtons().length > iMinLength;
		};

		NotificationListBase.prototype._hasActionButtons = function () {
			return this.getShowButtons() && this.getButtons().length;
		};

		NotificationListBase.prototype._shouldRenderCloseButton = function () {
			return !this._isSmallSize() && this.getShowCloseButton();
		};

		NotificationListBase.prototype._shouldRenderOverflowToolbar = function () {
			var hasActionButtons = this._hasActionButtons();

			if (this._isSmallSize()) {
				return hasActionButtons || this.getShowCloseButton();
			}

			return hasActionButtons;
		};

		NotificationListBase.prototype.onBeforeRendering = function () {
			if (this._resizeListenerId) {
				ResizeHandler.deregister(this._resizeListenerId);
				this._resizeListenerId = null;
			}

			if (!this._sCurrentLayoutClassName) {
				this._destroyCloseBtnAndSeparator();
			}
		};

		NotificationListBase.prototype.onAfterRendering = function() {
			if (this.getDomRef()) {
				this._resizeListenerId = ResizeHandler.register(this.getDomRef(),  this._onResize.bind(this));
			}

			this._onResize();
		};

		NotificationListBase.prototype.exit = function () {
			if (this._resizeListenerId) {
				ResizeHandler.deregister(this._resizeListenerId);
				this._resizeListenerId = null;
			}

			this._sCurrentLayoutClassName = null;
		};

		NotificationListBase.prototype.onkeydown = function(event) {
			var target = event.target;

			switch (event.which) {
				// Minus keys
				// KeyCodes.MINUS is not returning 189
				case 189:
				case KeyCodes.NUMPAD_MINUS:
				case KeyCodes.ARROW_LEFT:
					if (target.classList.contains("sapMNLGroup")) {
						this._collapse(event);
						return;
					}
					break;
				case KeyCodes.PLUS:
				case KeyCodes.NUMPAD_PLUS:
				case KeyCodes.ARROW_RIGHT:
					if (target.classList.contains("sapMNLGroup")) {
						this._expand(event);
						return;
					}
					break;
				case KeyCodes.F10:
					if (target.classList.contains("sapMNLIB") && event.shiftKey && this._hasToolbarOverflowButton()) {
						this._getOverflowToolbar()._getOverflowButton().firePress();
						event.stopImmediatePropagation();
						event.preventDefault();
						return;
					}
					break;
			}

			this._focusSameItemOnNextRow(event);
		};

		NotificationListBase.prototype._focusSameItemOnNextRow = function (event) {
			var list = this._getParentList(),
				itemNavigation,
				focusedIndex ,
				itemDomRefs,
				sourceControl,
				listItemDomRef,
				nextListItemControl,
				nextFocusedDomRef;

			if (!list) {
				return;
			}

			if (event.which !== KeyCodes.ARROW_UP &&
				event.which !== KeyCodes.ARROW_DOWN) {
				return;
			}

			event.stopPropagation();
			event.preventDefault();

			itemNavigation = list.getItemNavigation();
			if (!itemNavigation) {
				return;
			}

			focusedIndex = itemNavigation.getFocusedIndex();
			itemDomRefs = itemNavigation.getItemDomRefs();

			switch (event.which) {
				case KeyCodes.ARROW_UP:
					do {
						focusedIndex--;
					} while (itemDomRefs[focusedIndex] && isHidden(itemDomRefs[focusedIndex]));
					break;
				case KeyCodes.ARROW_DOWN:
					do {
						focusedIndex++;
					} while (itemDomRefs[focusedIndex] && isHidden(itemDomRefs[focusedIndex]));
					break;
			}

			listItemDomRef = itemDomRefs[focusedIndex];
			if (!listItemDomRef) {
				return;
			}

			// focus the entire row first
			listItemDomRef.focus();

			if (this.getDomRef() === event.target) {
				return;
			}

			sourceControl = Element.closestTo(event.target);

			// collapse/expand button
			if (sourceControl.getId() === this.getId() + "-collapseButton") {
				nextFocusedDomRef = listItemDomRef.querySelector(":scope > .sapMNLGroupHeader .sapMNLGroupCollapseButton .sapMBtn");
				if (nextFocusedDomRef) {
					nextFocusedDomRef.focus();
				}
				return;
			}

			// "show more" link
			if (sourceControl.isA("sap.m.Link")) {
				nextFocusedDomRef = listItemDomRef.querySelector(":scope > .sapMNLIMain .sapMNLIShowMore a");
				if (nextFocusedDomRef) {
					nextFocusedDomRef.focus();
				}

				return;
			}

			nextListItemControl = Element.closestTo(listItemDomRef);

			// close button
			if (!sourceControl.getParent().isA("sap.m.OverflowToolbar")) {
				if (!nextListItemControl._focusCloseButton()) {
					nextListItemControl._focusToolbarButton();
				}

				return;
			}

			// toolbar button
			if (!nextListItemControl._focusToolbarButton()) {
				nextListItemControl._focusCloseButton();
			}
		};

		NotificationListBase.prototype._focusCloseButton = function () {
			if (this.getShowCloseButton() && this.getAggregation("_closeButton")) {
				this.getAggregation("_closeButton").focus();
				return true;
			}

			return false;
		};

		NotificationListBase.prototype._focusToolbarButton = function () {
			var button,
				overflowToolbar,
				visibleContent;

			if (this._shouldRenderOverflowToolbar()) {
				overflowToolbar = this._getOverflowToolbar();

				if (overflowToolbar._getOverflowButtonNeeded()) {
					button = overflowToolbar._getOverflowButton();
				} else {
					visibleContent = overflowToolbar._getVisibleContent();
					button = this._isSmallSize() ? visibleContent[visibleContent.length - 1] : visibleContent[0];
				}

				button.focus();

				return true;
			}

			return false;
		};

		NotificationListBase.prototype._getParentList = function () {
			var parent = this.getParent();
			if (parent) {
				if (parent.isA("sap.m.NotificationList")) {
					return parent;
				}

				parent = parent.getParent();
				if (parent && parent.isA("sap.m.NotificationList")) {
					return parent;
				}
			}

			return null;
		};

		NotificationListBase.prototype._collapse = function () { };

		NotificationListBase.prototype._expand = function () { };

		NotificationListBase.prototype._onResize = function () {
			var oDomRef = this.getDomRef(),
				oMediaRange,
				sClassName;

			if (!oDomRef) {
				return;
			}

			oMediaRange = Device.media.getCurrentRange(NLI_RANGE_SET, oDomRef.offsetWidth);
			sClassName = "sapMNLIB-Layout" + oMediaRange.name;

			if (this._sCurrentLayoutClassName === sClassName) {
				return;
			}

			if (this._sCurrentLayoutClassName) {
				this.removeStyleClass(this._sCurrentLayoutClassName);
			}

			this.addStyleClass(sClassName);

			this._sCurrentLayoutClassName = sClassName;

			this._arrangeButtons();
		};

		NotificationListBase.prototype._destroyCloseBtnAndSeparator = function () {
			var closeButton = this._getCloseButton(),
				toolbarSeparator = this._getToolbarSeparator();

			if (closeButton) {
				closeButton.destroy();
			}

			if (toolbarSeparator) {
				toolbarSeparator.destroy();
			}
		};

		NotificationListBase.prototype._arrangeButtons = function () {
			this._destroyCloseBtnAndSeparator();
			this._createCloseButton();

			if (this._isSmallSize()) {
				this._arrangeSSizeButtons();
			} else {
				this._arrangeMSizeButtons();
			}
		};

		NotificationListBase.prototype._arrangeMSizeButtons = function () {
			var button,
				buttons = this.getButtons(),
				buttonOverflowPriorityType = buttons.length > 1 ? OverflowToolbarPriority.AlwaysOverflow : OverflowToolbarPriority.NeverOverflow;

			for (var i = 0; i < buttons.length; i++) {
				button = buttons[i];

				button.setLayoutData(new OverflowToolbarLayoutData({
					priority: buttonOverflowPriorityType
				}));
			}
		};

		NotificationListBase.prototype._arrangeSSizeButtons = function () {
			var overflowToolbar = this._getOverflowToolbar(),
				closeButton = this._getCloseButton(),
				isNotificationListGroup = this.isA("sap.m.NotificationListGroup"),
				buttonText = isNotificationListGroup ? closeAllText : closeText,
				isCollapsed = isNotificationListGroup && this.getCollapsed(),
				hasActionButtons = !isCollapsed && this._hasActionButtons(),
				showCloseButton = this.getShowCloseButton(),
				toolbarSeparator = new ToolbarSeparator(),
				priority;

			this.getButtons().forEach(function (button) {
				if (hasActionButtons) {
					priority = OverflowToolbarPriority.AlwaysOverflow;
					button.removeStyleClass('sapMNLIBHiddenButton');
				} else {
					priority = OverflowToolbarPriority.NeverOverflow;
					button.addStyleClass('sapMNLIBHiddenButton');
				}

				button.setLayoutData(new OverflowToolbarLayoutData({
					priority: priority
				}));
			});

			closeButton.setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.AlwaysOverflow
			}));

			toolbarSeparator.setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.AlwaysOverflow
			}));

			overflowToolbar.addContent(toolbarSeparator);
			overflowToolbar.addContent(closeButton);

			if (!showCloseButton) {
				closeButton.setVisible(false);
				toolbarSeparator.setVisible(false);
				return;
			}

			closeButton.setVisible(true);

			if (hasActionButtons) {
				closeButton.setText(buttonText);
				closeButton.setTooltip('');
				closeButton.setType(ButtonType.Default);
				closeButton.setIcon('');
				closeButton.setLayoutData(new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.AlwaysOverflow
				}));

				toolbarSeparator.setVisible(true);
			} else {
				closeButton.setText('');
				closeButton.setTooltip(buttonText);
				closeButton.setType(ButtonType.Transparent);
				closeButton.setIcon(IconPool.getIconURI('decline'));
				closeButton.setLayoutData(new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				}));

				toolbarSeparator.setVisible(false);
			}
		};

		/**
		 * Closes the NotificationListBase.
		 *
		 * @public
		 */
		NotificationListBase.prototype.close = function () {
			var parent = this.getParent();
			this.fireClose();
			var bHasParentAfterClose = !!this.getParent(); // no parent after close means the notification is removed or destroyed - in such case move the focus

			if (!bHasParentAfterClose && parent && parent instanceof Element) {
				var delegate = {
					onAfterRendering: function () {
						parent.focus();
						parent.removeEventDelegate(delegate);
					}
				};
				parent.addEventDelegate(delegate);
			}
		};

		NotificationListBase.prototype._getPriorityIcon = function () {
			var priorityIcon = this.getAggregation('_priorityIcon');

			if (!priorityIcon) {
				priorityIcon = new Icon({
					src: 'sap-icon://message-error',
					useIconTooltip: false
				});

				this.setAggregation("_priorityIcon", priorityIcon, true);
			}

			return priorityIcon;
		};

		NotificationListBase.prototype._isSmallSize = function () {
			return this._sCurrentLayoutClassName === "sapMNLIB-LayoutS";
		};

		NotificationListBase.prototype._resetButtonsOverflow = function () {
			// with this line, the actions buttons will be re-arranged
			// next time when the "_onResize" is called
			this._sCurrentLayoutClassName = null;
		};

		return NotificationListBase;
	});
