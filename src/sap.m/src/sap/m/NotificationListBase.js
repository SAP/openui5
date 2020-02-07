/*!
 * ${copyright}
 */

sap.ui.define([
		'./library',
		'sap/ui/core/Core',
		'sap/ui/core/Control',
		'sap/ui/core/Element',
		'sap/ui/Device',
		'./ListItemBase',
		'./Text',
		'./Image',
		'./Button',
		'./ToolbarSeparator',
		'sap/m/OverflowToolbar',
		'sap/m/OverflowToolbarLayoutData',
		'sap/ui/core/IconPool',
		'sap/ui/core/Icon',
		'sap/ui/core/library'],
	function (library,
			  Core,
			  Control,
			  Element,
			  Device,
			  ListItemBase,
			  Text,
			  Image,
			  Button,
			  ToolbarSeparator,
			  OverflowToolbar,
			  OverflowToolbarLayoutData,
			  IconPool,
			  Icon,
			  coreLibrary) {
		'use strict';

		// shortcut for sap.ui.core.Priority
		var Priority = coreLibrary.Priority;

		// shortcut for sap.m.ButtonType
		var ButtonType = library.ButtonType;

		// shortcut for sap.m.OverflowToolbarPriority
		var OverflowToolbarPriority = library.OverflowToolbarPriority;

		var resourceBundle = Core.getLibraryResourceBundle('sap.m'),
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
		 * @since 1.38
		 * @alias sap.m.NotificationListBase
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var NotificationListBase = ListItemBase.extend('sap.m.NotificationListBase', /** @lends sap.m.NotificationListBase.prototype */ {
			metadata: {
				library: 'sap.m',
				properties: {
					// unread is inherit from the ListItemBase.

					/**
					 * Determines the priority of the Notification.
					 */
					priority: {type: 'sap.ui.core.Priority', group: 'Appearance', defaultValue: Priority.None},

					/**
					 * Determines the title of the NotificationListBase item.
					 */
					title: {type: 'string', group: 'Appearance', defaultValue: ''},

					/**
					 * The time stamp of the Notification.
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
					 */
					authorName: {type: 'string', group: 'Appearance', defaultValue: ''},

					/**
					 * Determines the URL of the notification author picture.
					 */
					authorPicture: {type: 'sap.ui.core.URI', multiple: false}

				},
				aggregations: {
					/**
					 * Action buttons.
					 */
					buttons: {type: 'sap.m.Button', multiple: true},

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
			}
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

		NotificationListBase.prototype.getButtons = function () {
			return this._getOverflowToolbar().getContent().filter(function (item) {
				return item !== this._closeButton && item !== this._toolbarSeparator;
			}, this);
		};

		NotificationListBase.prototype.addButton = function (oButton) {

			var overflowToolbar = this._getOverflowToolbar(),
				index = overflowToolbar.getContent().length;

			if (Device.system.phone) {
				index -= 2;
			}

			overflowToolbar.insertContent(oButton, index);

			this.invalidate();

			return this;
		};

		NotificationListBase.prototype.insertButton = function (oButton, index) {

			this._getOverflowToolbar().insertContent(oButton, index);

			this.invalidate();

			return this;
		};

		NotificationListBase.prototype.removeButton = function (oButton) {
			var result = this._getOverflowToolbar().removeContent(oButton.getId());

			this.invalidate();

			return result;
		};

		NotificationListBase.prototype.removeAllButtons = function () {
			var overflowToolbar = this._getOverflowToolbar(),
				buttons = this.getButtons();

			buttons.forEach(function (button) {
				overflowToolbar.removeContent(button.getId());
			});

			this.invalidate();

			return this;
		};

		NotificationListBase.prototype.destroyButtons = function () {
			var buttons = this.getButtons();

			buttons.forEach(function (button) {
				button.destroy();
			});

			this.invalidate();

			return this;
		};

		/* Clones the NotificationListBase.
		 *
		 * @public
		 * @returns {sap.m.NotificationListBase} The cloned NotificationListBase.
		 */
		NotificationListBase.prototype.clone = function () {
			var clonedObject = Control.prototype.clone.apply(this, arguments);
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
				overflowToolbar = new OverflowToolbar(this.getId() + '-overflowToolbar', {});

				this.setAggregation("_overflowToolbar", overflowToolbar, true);

				if (Device.system.phone) {

					var oCloseButton = this._getCloseButton();
					oCloseButton.setLayoutData(new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.AlwaysOverflow
					}));

					this._toolbarSeparator = new ToolbarSeparator();
					this._toolbarSeparator.setLayoutData(new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.AlwaysOverflow
					}));

					overflowToolbar.addContent(this._toolbarSeparator);
					overflowToolbar.addContent(oCloseButton);
				}
			}

			return overflowToolbar;
		};


		NotificationListBase.prototype._getCloseButton = function () {
			var closeButton = this._closeButton;

			if (!closeButton) {
				if (Device.system.phone) {
					this._closeButton = new Button(this.getId() + '-closeButtonOverflow', {
						text: this.isA("sap.m.NotificationListItem") ? closeText : closeAllText,
						type: ButtonType.Default,
						press: function () {
							this.close();
						}.bind(this)
					});
				} else {
					this._closeButton = new Button(this.getId() + '-closeButtonX', {
						icon: IconPool.getIconURI('decline'),
						type: ButtonType.Transparent,
						tooltip: this.isA("sap.m.NotificationListItem") ? closeText : closeAllText,
						press: function () {
							this.close();
						}.bind(this)
					});
				}
			}

			return this._closeButton;
		};

		NotificationListBase.prototype.exit = function () {
			if (this._closeButton) {
				this._closeButton.destroy();
			}

			if (this._toolbarSeparator) {
				this._toolbarSeparator.destroy();
			}
		};

		NotificationListBase.prototype._hasActionButtons = function () {
			return this.getShowButtons() && this.getButtons().length;
		};

		NotificationListBase.prototype._shouldRenderCloseButton = function () {
			return !Device.system.phone && this.getShowCloseButton();
		};

		NotificationListBase.prototype._shouldRenderOverflowToolbar = function () {

			var hasActionButtons = this._hasActionButtons();

			if (Device.system.phone) {
				return hasActionButtons || this.getShowCloseButton();
			}

			return hasActionButtons;
		};

		NotificationListBase.prototype.onBeforeRendering = function () {

			var buttons = this.getButtons(),
				firstButtonOverflow,
				button;

			if (Device.system.phone) {
				this._updatePhoneButtons();
				return;
			}

			firstButtonOverflow = buttons.length > 1 ? OverflowToolbarPriority.AlwaysOverflow : OverflowToolbarPriority.NeverOverflow;

			for (var i = 0; i < buttons.length; i++) {
				button = buttons[i];

				button.setLayoutData(new OverflowToolbarLayoutData({
					priority: i === 0 ? firstButtonOverflow : OverflowToolbarPriority.AlwaysOverflow
				}));
			}
		};

		NotificationListBase.prototype._updatePhoneButtons = function () {

			var closeButton = this._getCloseButton(),
				isNotificationListGroup = this.isA("sap.m.NotificationListGroup"),
				buttonText = isNotificationListGroup ? closeAllText : closeText,
				isCollapsed = isNotificationListGroup && this.getCollapsed(),
				hasActionButtons = !isCollapsed && this._hasActionButtons(),
				showCloseButton = this.getShowCloseButton(),
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

			if (!showCloseButton) {
				closeButton.setVisible(false);
				this._toolbarSeparator.setVisible(false);
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

				this._toolbarSeparator.setVisible(true);

			} else {
				closeButton.setText('');
				closeButton.setTooltip(buttonText);
				closeButton.setType(ButtonType.Transparent);
				closeButton.setIcon(IconPool.getIconURI('decline'));
				closeButton.setLayoutData(new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				}));

				this._toolbarSeparator.setVisible(false);
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
					src: 'sap-icon://message-error'
				});

				this.setAggregation("_priorityIcon", priorityIcon, true);
			}

			return priorityIcon;
		};

		return NotificationListBase;
	});
