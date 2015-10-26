/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', './ListItemBase', './Title', './Text', './Button', 'sap/ui/core/InvisibleText', './Link'],
	function (jQuery, library, Control, ListItemBase, Title, Text, Button, InvisibleText, Link) {

	'use strict';

	/**
	 * Constructor for a new NotificationListGroup.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The NotificationListItemGroup control suitable for grouping Notification List Items of the same type.
	 * @extends sap.m.ListItemBase
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
	var NotificationListGroup = ListItemBase.extend('sap.m.NotificationListGroup', /** @lends sap.m.NotificationListGroup.prototype */ {
		metadata: {
			library: 'sap.m',
			properties: {
				/**
				 * Determines the priority of the Notification.
				 */
				priority: {
					type: 'sap.ui.core.Priority',
					group: 'Appearance',
					defaultValue: sap.ui.core.Priority.None
				},

				/**
				 * Determines the title of the Notification List Group.
				 */
				title: {type: 'string', group: 'Appearance', defaultValue: ''},

				/**
				 * Determines the due date of the Notification List Group.
				 */
				datetime: {type: 'string', group: 'Appearance'},

				/**
				 * Determines the actions buttons visibility
				 */
				showButtons: {type: 'boolean', group: 'Behavior', defaultValue: true},

				/**
				 * Determines the close button visibility
				 */
				showCloseButton: {type: 'boolean', group: 'Behavior', defaultValue: true},

				/**
				 * Determines if the group is collapsed or expanded
				 */
				collapsed: {type: 'boolean', group: 'Behavior', defaultValue: false},

				/**
				 * Determines if the group will automatically set the priority based on the highest priority of its notifications or will get its priority from the developer
				 */
				autoPriority: {type: 'boolean', group: 'Behavior', defaultValue: true}
			},
			aggregations: {
				/**
				 * Action buttons
				 */
				buttons: {type: 'sap.m.Button', multiple: true},

				/**
				 * The notification list items inside the group
				 */
				items: {type: 'sap.m.NotificationListItem', multiple: true, singularName: 'item'},

				/**
				 * The header title of the NotificationListGroup
				 */
				_headerTitle: {type: 'sap.m.Title', multiple: false, visibility: 'hidden'},

				/**
				 * The timestamp string that will be displayed in the NotificationListGroup
				 */
				_dateTime: {type: 'sap.m.Text', multiple: false, visibility: 'hidden'}
			},
			events: {
				/**
				 * Fired when the list item is closed
				 */
				close: {}

				// 'tap' and 'press' events are inherited from ListItemBase.
			}
		}
	});

	NotificationListGroup.prototype.setTitle = function (title) {
		var result = this.setProperty('title', title, true);

		this._getHeaderTitle().setText(title);

		return result;
	};

	NotificationListGroup.prototype.init = function () {
		/**
		 * @type {sap.m.Button}
		 * @private
		 */
		this._closeButton = new sap.m.Button(this.getId() + '-closeButton', {
			type: 'Unstyled',
			icon: sap.ui.core.IconPool.getIconURI('decline'),
			press: function () {
				this.close();
			}.bind(this)
		});

		/**
		 * @type {sap.m.Link}
		 * @private
		 */
		this._collapseLink = new sap.m.Link({
			press: function () {
				this.setCollapsed(!this.getCollapsed());
			}.bind(this)
		});
	};

	NotificationListGroup.prototype.setCollapsed = function (collapsed) {
		this._toggleCollapsed();
		//Setter overwritten to suppress invalidation
		return this.setProperty('collapsed', collapsed, true);
	};

	NotificationListGroup.prototype.getPriority = function () {
		//If the autoPriority flag is off then return what has been set by the developer
		if (!this.getAutoPriority()) {
			return this.getProperty('priority');
		}

		/** @type {sap.m.NotificationListItem[]} */
		var notifications = this.getAggregation('items');

		/** @type {sap.ui.core.Priority|string} */
		var priority = sap.ui.core.Priority.None;

		notifications.forEach(function (item) {
			priority = comparePriority(priority, item.getPriority());
		});

		return priority;
	};

	NotificationListGroup.prototype.getUnread = function () {
		/** @type {sap.m.NotificationListItem[]} */
		var notifications = this.getAggregation('items');

		return notifications.some(function (item) {
			return item.getUnread();
		});
	};

	NotificationListGroup.prototype.onBeforeRendering = function() {
		//Making sure the Expand/Collapse link texs is set correctly
		this._collapseLink.setText(this.getCollapsed() ? 'Expand Group' : 'Collapse Group');
	};

	NotificationListGroup.prototype.close = function () {
		this.fireClose();
		this.destroy();
	};

	NotificationListGroup.prototype.exit = function () {
		if (this._closeButton) {
			this._closeButton.destroy();
			this._closeButton = null;
		}
		if (this._collapseLink) {
			this._collapseLink.destroy();
			this._collapseLink = null;
		}
	};

	/**
	 * Returns the sap.m.Title control used in the Notification List Group's title
	 * @returns {sap.m.Title} The hidden title control aggregation used in the group title
	 * @private
	 */
	NotificationListGroup.prototype._getHeaderTitle = function () {
		/** @type {sap.m.Title} */
		var title = this.getAggregation('_headerTitle');

		if (!title) {
			title = new sap.m.Title({
				text: this.getTitle()
			});

			this.setAggregation('_headerTitle', title);
		}

		return title;
	};

	/**
	 * Returns the sap.m.Text control used in the Notification List Group's datetime
	 * @returns {sap.m.Text} The hidden text control aggregation used in the group's timestamp
	 * @private
	 */
	NotificationListGroup.prototype._getDateTimeText = function () {
		/** @type {sap.m.Text} */
		var dateTime = this.getAggregation('_dateTime');

		if (!dateTime) {
			dateTime = new sap.m.Text({
				text: this.getDatetime(),
				textAlign: 'End'
			}).addStyleClass('sapMNLG-Datetime');

			this.setAggregation('_dateTime', dateTime, true);
		}

		return dateTime;
	};

	/**
	 * Toggles the Notification List Group state between collapsed/expanded
	 * @private
	 */
	NotificationListGroup.prototype._toggleCollapsed = function () {
		/** @type {boolean} */
		var newCollapsedState = !this.getCollapsed();

		this._collapseLink.setText(newCollapsedState ? 'Expand Group' : 'Collapse Group', true);

		this.$().find('li').toggleClass('sapMNLG-Collapsed', newCollapsedState);
	};

	/**
	 * Compares two priorities and returns the bigger one
	 * @param {sap.ui.core.Priority} firstPriority First priority string to be compared
	 * @param {sap.ui.core.Priority} secondPriority Second priority string to be compared
	 * @returns {sap.ui.core.Priority} The highest priority
	 * @private
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
}, /* bExport= */ true);
