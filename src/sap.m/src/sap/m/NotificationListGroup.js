/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'./NotificationListBase',
	'sap/ui/core/InvisibleText',
	'./ListItemBase',
	'sap/ui/core/IconPool',
	'sap/ui/core/library',
	'sap/ui/Device',
	'sap/m/Button',
	'./NotificationListGroupRenderer',
	"sap/ui/events/KeyCodes"
],
function(
	library,
	NotificationListBase,
	InvisibleText,
	ListItemBase,
	IconPool,
	coreLibrary,
	Device,
	Button,
	NotificationListGroupRenderer,
	KeyCodes
) {
	'use strict';

	// shortcut for sap.ui.core.Priority
	var Priority = coreLibrary.Priority;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	/**
	 * Constructor for a new NotificationListGroup.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The NotificationListItemGroup control is used for grouping {@link sap.m.NotificationListItem notification items} of the same type.
	 * <h4>Behavior</h4>
	 * The group handles specific behavior for different usecases:
	 * <ul>
	 * <li><code>autoPriority</code> - sets the group priority to the highest priority of an item in the group.</li>
	 * <li><code>enableCollapseButtonWhenEmpty</code> - displays a collapse button for an empty group.</li>
	 * <li><code>showEmptyGroup</code> - determines if the header/footer of an empty group is displayed.</li>
	 * </ul>
	 * @extends sap.m.NotificationListBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34
	 * @alias sap.m.NotificationListGroup
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NotificationListGroup = NotificationListBase.extend('sap.m.NotificationListGroup', /** @lends sap.m.NotificationListGroup.prototype */ {
		metadata: {
			library: 'sap.m',
			properties: {

				/**
				 * Determines if the group is collapsed or expanded.
				 */
				collapsed: {type: 'boolean', group: 'Behavior', defaultValue: false},

				/**
				 * Determines if the group will automatically set the priority based on the highest priority of its notifications or get its priority from the developer.
				 */
				autoPriority: {type: 'boolean', group: 'Behavior', defaultValue: true},

				/**
				 * Determines if the group header/footer of the empty group will be always shown. By default groups with 0 notifications are not shown.
				 */
				showEmptyGroup: {type: 'boolean', group: 'Behavior', defaultValue: false},

				/**
				 * Determines if the collapse/expand button should be enabled for an empty group.
				 */
				enableCollapseButtonWhenEmpty: {type: 'boolean', group: 'Behavior', defaultValue: false}
			},
			defaultAggregation : 'items',
			aggregations: {

				/**
				 * The NotificationListItems inside the group.
				 */
				items: {type: 'sap.m.NotificationListItem', multiple: true, singularName: 'item'},

				/**
				 * The details of the NotificationListGroup that will be used to implement the ARIA specification
				 */
				_ariaDetailsText: {type: 'sap.ui.core.InvisibleText', multiple: false, visibility: 'hidden'}
			},
			events: {
				/**
				 * This event is called when collapse property value is changed
				 * @since 1.44
				 */
				onCollapse: {
					parameters: {
						/**
						 * Indicates exact collapse direction
						 */
						collapsed: {type: 'boolean'}
					}
				}
			}
		}
	});

	/**
	 * Sets up the initial values of the control.
	 *
	 * @protected
	 */
	NotificationListGroup.prototype.init = function () {
		NotificationListBase.prototype.init.call(this);

		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		this._closeText = resourceBundle.getText('NOTIFICATION_LIST_BASE_CLOSE');

		/**
		 * @type {sap.m.Button}
		 * @private
		 */
		var _closeButton = new Button(this.getId() + '-closeButton', {
			type: ButtonType.Transparent,
			icon: IconPool.getIconURI('decline'),
			tooltip: this._closeText,
			press: function () {
				this.close();
			}.bind(this)
		});

		this.setAggregation('_closeButton', _closeButton, true);

		/**
		 * @type {sap.m.Button}
		 * @private
		 */
		var _collapseButton = new Button({
			type: ButtonType.Transparent,
			press: function () {
				this.setCollapsed(!this.getCollapsed());
			}.bind(this)
		});

		this.setAggregation('_collapseButton', _collapseButton, true);
		this._maxNumberReached = false;
		this._ariaLabbeledByIds = '';

		this.setAggregation('_ariaDetailsText', new InvisibleText());

		/**
		 * Resource bundle used for translation
		 * @private
		 */
		this._resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
	};

	//================================================================================
	// Overwritten setters and getters
	//================================================================================

	/**
	 * Sets a new value for property {@link #collapsed}.
	 * Determines if the group is collapsed or expanded.
	 *
	 * @override
	 * @public
	 * @param {boolean} bCollapsed New value for property <code>collapsed</code>.
	 * @returns {sap.m.NotificationListGroup} this NotificationListGroup reference for chaining.
	 */
	NotificationListGroup.prototype.setCollapsed = function (bCollapsed) {
		this._toggleCollapsed(bCollapsed);

		//Setter overwritten to suppress invalidation
		this.setProperty('collapsed', bCollapsed, true);
		this.fireOnCollapse({collapsed: bCollapsed});

		return this;
	};


	/**
	 * Overrides the getter for priority property.
	 *
	 * @override
	 * @public
	 * @returns {sap.ui.core.Priority} Items by priority.
	 */
	NotificationListGroup.prototype.getPriority = function () {
		//If the autoPriority flag is off then return what has been set by the developer
		if (!this.getAutoPriority()) {
			return this.getProperty('priority');
		}

		/** @type {sap.m.NotificationListItem[]} */
		var notifications = this.getAggregation('items');

		/** @type {sap.ui.core.Priority|string} */
		var priority = Priority.None;

		if (notifications) {
			notifications.forEach(function (item) {
				priority = comparePriority(priority, item.getPriority());
			});
		} else {
			priority = this.getProperty('priority');
		}

		return priority;
	};

	/**
	 * Overwrites the getter for unread property.
	 *
	 * @override
	 * @public
	 * @returns {boolean} Unread items.
	 */
	NotificationListGroup.prototype.getUnread = function () {
		/** @type {sap.m.NotificationListItem[]} */
		var notifications = this.getItems();

		if (notifications.length) {
			return notifications.some(function (item) {
				return item.getUnread();
			});
		}
		return this.getProperty('unread');
	};

	//================================================================================
	// Control methods
	//================================================================================

	/**
	 * Overwrites the onBeforeRendering.
	 *
	 * @overwrites
	 * @public
	 */
	NotificationListGroup.prototype.onBeforeRendering = function() {
		/** @type {sap.m.NotificationListItem[]} */
		var notifications = this.getItems();
		var notificationsCount = notifications.length;
		var collapseButton = this.getAggregation('_collapseButton');

		this._maxNumberOfNotifications = Device.system.desktop ? 400 : 100;
		collapseButton.setEnabled(this._getCollapseButtonEnabled(), true);
		this._maxNumberReached = notificationsCount > this._maxNumberOfNotifications;

		notifications.forEach(function (item) {
			item.addEventDelegate({onfocusin: this._notificationFocusHandler}, this);
			item.addEventDelegate({onkeydown: this._notificationNavigationHandler}, this);
		}.bind(this));

		this._updateAccessibilityInfo();
		this._updateCollapseButtonText(this.getCollapsed());

		var oAuthorPicture = this.getAuthorPicture();
		this._getAuthorImage().setSrc(oAuthorPicture);

		this._maxNumberOfNotificationsTitle = this._resourceBundle.getText('NOTIFICATION_LIST_GROUP_MAX_NOTIFICATIONS_TITLE', notificationsCount - this._maxNumberOfNotifications);
		this._maxNumberOfNotificationsBody = this._resourceBundle.getText('NOTIFICATION_LIST_GROUP_MAX_NOTIFICATIONS_BODY');
	};

	//================================================================================
	// Private and protected getters and setters
	//================================================================================

	/**
	 * Returns the sap.m.Title control used in the NotificationListGroup's title.
	 *
	 * @private
	 * @returns {sap.m.Text} The hidden title control aggregation used in the group title.
	 */
	NotificationListGroup.prototype._getHeaderTitle = function () {
		/** @type {sap.m.Text} */
		var title = NotificationListBase.prototype._getHeaderTitle.call(this);
		title.addStyleClass('sapMNLG-Title');

		if (this.getUnread()) {
			title.addStyleClass('sapMNLGTitleUnread');
		}

		return title;
	};

	/**
	 * Returns the sap.m.Text control used in the NotificationListGroup's datetime.
	 *
	 * @private
	 * @returns {sap.m.Text} The hidden text control aggregation used in the group's timestamp.
	 */
	NotificationListGroup.prototype._getDateTimeText = function () {
		/** @type {sap.m.Text} */
		var dateTime = NotificationListBase.prototype._getDateTimeText.call(this);
		dateTime.setTextAlign('End');

		return dateTime;
	};

	//================================================================================
	// Private and protected internal methods
	//================================================================================

	/**
	 * Toggles the NotificationListGroup state between collapsed/expanded.
	 *
	 * @param {boolean} bCollapsed The desired collapse state.
	 * @private
	 */
	NotificationListGroup.prototype._toggleCollapsed = function (bCollapsed) {
		this._updateCollapseButtonText(bCollapsed);
		this.$().toggleClass('sapMNLG-Collapsed', bCollapsed);
		this.$().toggleClass('sapMNLG-NoNotifications', this._getVisibleItemsCount() <= 0);
	};

	/**
	 * Gets the number of visible NotificationListItems inside the group.
	 *
	 * @private
	 * @returns {number} The number of visible notifications.
	 */
	NotificationListGroup.prototype._getVisibleItemsCount = function () {
		/** @type {sap.m.NotificationListItem[]} */
		var items = this.getItems();
		var result = 0;

		items.forEach(function (item) {
			if (item.getVisible()) {
				result += 1;
			}
		});

		return result;
	};

	/**
	 * Gets what the state (enabled/disabled) of the collapse button should be.
	 *
	 * @private
	 * @returns {boolean} Should the collapse button be enabled.
	 */
	NotificationListGroup.prototype._getCollapseButtonEnabled = function () {
		if (this._getVisibleItemsCount() > 0) {
			return true;
		}

		return this.getEnableCollapseButtonWhenEmpty();
	};

	/**
	 * Focus handler for the NotificationListGroup's items.
	 *
	 * @private
	 * @param {jQuery.Event} event The passed event object.
	 */
	NotificationListGroup.prototype._notificationFocusHandler = function (event) {
		ListItemBase.prototype.onfocusin.call(this, event);
		var targetControl = event.srcControl;

		if (targetControl.getMetadata().getName() != 'sap.m.NotificationListItem') {
			return;
		}

		var notificationGroup = targetControl.getParent();
		var visibleItems = notificationGroup.getItems().filter(function (item) {
			return item.getVisible();
		});

		var groupIndex = visibleItems.indexOf(targetControl);
		var targetDomRef = targetControl.getDomRef();

		targetDomRef.setAttribute('aria-posinset', groupIndex + 1);
		targetDomRef.setAttribute('aria-setsize', visibleItems.length);
	};

	/**
	 * Event handler for keypressed.
	 *
	 * @private
	 * @param {jQuery.Event} event The passed event object.
	 */
	NotificationListGroup.prototype._notificationNavigationHandler = function (event) {
		ListItemBase.prototype.onkeydown.call(this, event);
		var targetControl = event.srcControl;

		if (targetControl.getMetadata().getName() != 'sap.m.NotificationListItem') {
			return;
		}

		var notificationGroup = targetControl.getParent();
		var groupIndex = notificationGroup.indexOfItem(targetControl);

		switch (event.which) {
			case KeyCodes.ARROW_UP:
				if (groupIndex == 0) {
					return;
				}

				var previousIndex = groupIndex - 1;
				notificationGroup.getItems()[previousIndex].focus();
				break;
			case KeyCodes.ARROW_DOWN:
				var nextIndex = groupIndex + 1;
				if (nextIndex == notificationGroup.getItems().length) {
					return;
				}

				notificationGroup.getItems()[nextIndex].focus();
				break;
			default:
				return;
		}
	};

	/**
	 * Updates all the text needed for accessibility.
	 *
	 * @private
	 */
	NotificationListGroup.prototype._updateAccessibilityInfo = function() {
		var authorName = this.getAuthorName();
		var infoText = this._resourceBundle.getText('NOTIFICATION_LIST_ITEM_DATETIME_PRIORITY', [this.getDatetime(), this.getPriority()]);
		var unreadText =  this.getUnread() ? this._resourceBundle.getText('NOTIFICATION_LIST_GROUP_UNREAD') : this._resourceBundle.getText('NOTIFICATION_LIST_GROUP_READ');
		var ariaText = '';
		var ariaDetailsText = this.getAggregation('_ariaDetailsText');

		if (authorName) {
			ariaText += this._resourceBundle.getText('NOTIFICATION_LIST_ITEM_CREATED_BY') + ' ' + authorName + ' ';
		}

		ariaText += infoText + ' ' + unreadText;

		ariaDetailsText.setText(ariaText);
		this._ariaLabbeledByIds = this._getHeaderTitle().getId() + ' ' + ariaDetailsText.getId();
	};

	/**
	 * Updates the collapse/expand text according to the new passed state.
	 *
	 * @private
	 * @param {boolean} collapsed The new collapsed state.
	 */
	NotificationListGroup.prototype._updateCollapseButtonText = function(collapsed) {
		var collapseButtonText = collapsed ? this._resourceBundle.getText('NOTIFICATION_LIST_GROUP_EXPAND') :
			this._resourceBundle.getText('NOTIFICATION_LIST_GROUP_COLLAPSE');

		this.getAggregation('_collapseButton').setText(collapseButtonText, true);
	};

	/**
	 * Compares two priorities and returns the higher one.
	 *
	 * @private
	 * @param {sap.ui.core.Priority} firstPriority First priority string to be compared.
	 * @param {sap.ui.core.Priority} secondPriority Second priority string to be compared.
	 * @returns {sap.ui.core.Priority} The highest priority.
	 */
	function comparePriority(firstPriority, secondPriority) {
		if (firstPriority == secondPriority) {
			return firstPriority;
		}

		if ((firstPriority == 'None')) {
			return secondPriority;
		}

		if ((firstPriority == 'Low') && (secondPriority != 'None')) {
			return secondPriority;
		}

		if ((firstPriority == 'Medium') && (secondPriority != 'None' && secondPriority != 'Low')) {
			return secondPriority;
		}

		return firstPriority;
	}

	return NotificationListGroup;
});
