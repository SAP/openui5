/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', './ListItemBase', './Title', './Text', './Button', 'sap/ui/core/InvisibleText'],
	function (jQuery, library, Control, ListItemBase, Title, Text, Button, InvisibleText) {

		'use strict';

		/**
		 * Constructor for a new NotificationListItem.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The NotificationListItem control is suitable for showing notifications to the user.
		 * @extends sap.m.ListItemBase
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.m.NotificationListItem
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var NotificationListItem = ListItemBase.extend('sap.m.NotificationListItem', /** @lends sap.m.NotificationListItem.prototype */ {
			metadata: {
				library: 'sap.m',
				properties: {
					// unread is inherit from the ListItemBase.

					/**
					 * Determines the priority of the Notification.
					 */
					priority: {
						type: 'sap.ui.core.Priority',
						group: 'Appearance',
						defaultValue: sap.ui.core.Priority.None
					},

					/**
					 * Determines the title of the NotificationListItem.
					 */
					title: {type: 'string', group: 'Appearance', defaultValue: ''},

					/**
					 * Determines the description of the NotificationListItem.
					 */
					description: {type: 'string', group: 'Appearance', defaultValue: ''},

					/**
					 * Determines the due date of the NotificationListItem.
					 */
					datetime: {type: 'string', group: 'Appearance'},

					/**
					 * Determines the action buttons visibility.
					 */
					showButtons: {type: 'boolean', group: 'Behavior', defaultValue: true},

					/**
					 * Determines the close button visibility.
					 */
					showCloseButton: {type: 'boolean', group: 'Behavior', defaultValue: true}
				},
				aggregations: {
					/**
					 * Action buttons.
					 */
					buttons: {type: 'sap.m.Button', multiple: true},

					/**
					 * The title control that holds the datetime text of the NotificationListItem.
					 * @private
					 */
					_headerTitle: {type: 'sap.m.Title', multiple: false, visibility: "hidden"},

					/**
					 * The text control that holds the description text of the NotificationListItem.
					 * @private
					 */
					_bodyText: {type: 'sap.m.Text', multiple: false, visibility: "hidden"},

					/**
					 * The text control that holds the datetime text of the NotificationListItem.
					 * @private
					 */
					_dateTime: {type: 'sap.m.Text', multiple: false, visibility: "hidden"}
				},
				events: {
					/**
					 * Fired when the list item is closed.
					 */
					close: {}

					// 'tap' and 'press' events are inherited from ListItemBase.
				}
			}
		});

		NotificationListItem.prototype.init = function () {
			//set it to an active ListItemBase to the press and tap events are fired
			this.setType('Active');

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
			 * @type {sap.ui.core.InvisibleText}
			 * @private
			 */
			this._ariaDetailsText = new InvisibleText({
				id: this.getId() + '-info'
			}).toStatic();
		};

		NotificationListItem.prototype.setTitle = function (title) {
			var result = this.setProperty('title', title, true);

			this._getHeaderTitle().setText(title);

			return result;
		};

		NotificationListItem.prototype.setDescription = function (description) {
			var result = this.setProperty('description', description, true);

			this._getDescriptionText().setText(description);

			return result;
		};

		NotificationListItem.prototype.setDatetime = function (dateTime) {
			var result = this.setProperty('datetime', dateTime, true);

			this._getDateTimeText().setText(dateTime);
			this._updateAriaAdditionalInfo();

			return result;
		};

		NotificationListItem.prototype.setPriority = function(priority, suppressInvalidation) {
			var result = this.setProperty('priority', priority, suppressInvalidation);

			this._updateAriaAdditionalInfo();

			return result;
		};

		NotificationListItem.prototype.close = function () {
			this.fireClose();
			this.destroy();
		};

		/**
		 * Called when the control is destroyed.
		 *
		 * @private
		 */
		NotificationListItem.prototype.exit = function () {
			if (this._closeButton) {
				this._closeButton.destroy();
				this._closeButton = null;
			}
			if (this._ariaDetailsText) {
				this._ariaDetailsText.destroy();
				this._ariaDetailsText = null;
			}
		};

		/**
		 * Returns the sap.m.Title control used in the NotificationListItem's header title.
		 * @returns {sap.m.Title}
		 * @private
		 */
		NotificationListItem.prototype._getHeaderTitle = function () {
			var title = this.getAggregation("_headerTitle");

			if (!title) {
				title = new Title({
					id: this.getId() + '-title',
					text: this.getTitle()
				});

				this.setAggregation("_headerTitle", title, true);
			}

			return title;
		};

		/**
		 * Returns the sap.m.Text control used in the NotificationListItem's description.
		 * @returns {sap.m.Text}
		 * @private
		 */
		NotificationListItem.prototype._getDescriptionText = function () {
			var bodyText = this.getAggregation('_bodyText');

			if (!bodyText) {
				bodyText = new sap.m.Text({
					id: this.getId() + '-body',
					text: this.getDescription()
				}).addStyleClass('sapMNLI-Text');

				this.setAggregation("_bodyText", bodyText, true);
			}

			return bodyText;
		};

		/**
		 * Returns the sap.m.Text control used in the NotificationListItem's datetime.
		 * @returns {sap.m.Text}
		 * @private
		 */
		NotificationListItem.prototype._getDateTimeText = function () {
			var dateTime = this.getAggregation('_dateTime');

			if (!dateTime) {
				dateTime = new sap.m.Text({
					text: this.getDatetime(),
					textAlign: 'End'
				}).addStyleClass('sapMNLI-Datetime');

				this.setAggregation('_dateTime', dateTime, true);
			}

			return dateTime;
		};

		/**
		 * Overrides the ListItemBase class toggling.
		 * @private
		 */
		NotificationListItem.prototype._activeHandling = function () {
			this.$().toggleClass("sapMNLIActive", this._active);
		};

		/**
		 * Updates the hidden text, used for the ARIA support.
		 * @private
		 */
		NotificationListItem.prototype._updateAriaAdditionalInfo = function () {
			var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
			var readUnreadText = this.getUnread() ?
				resourceBundle.getText('NOTIFICATION_LIST_ITEM_UNREAD') : resourceBundle.getText('NOTIFICATION_LIST_ITEM_READ');
			var dueAndPriorityString = resourceBundle.getText('NOTIFICATION_LIST_ITEM_DATETIME_PRIORITY',
				[this.getDatetime(), this.getPriority()]);

			this._ariaDetailsText.setText(readUnreadText + ' ' + dueAndPriorityString);
		};

		return NotificationListItem;
	}, /* bExport= */ true);
