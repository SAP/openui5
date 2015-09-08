/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', './ListItemBase'],
	function (jQuery, library, Control, ListItemBase) {

		'use strict';

		/**
		 * Constructor for a new NotificationListItem.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The NotificationListItem control suitable for showing notifications to the user.
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
					 * Determines the it the Notification is with priority.
					 */
					priority: {
						type: 'sap.m.NotificationPriority',
						group: 'Appearance',
						defaultValue: sap.m.NotificationPriority.None
					},

					/**
					 * Determines the title of the Notification List Item.
					 */
					title: {type: 'string', group: 'Appearance', defaultValue: ''},

					/**
					 * Determines the title of the Notification List Item.
					 */
					description: {type: 'string', group: 'Appearance', defaultValue: ''},

					/**
					 * Determines the due date of the Notification List Item.
					 */
					datetime: {type: 'string', group: 'Appearance'},

					/**
					 * Determines the actions buttons visibility
					 */
					showButtons: {type: 'boolean', group: 'Behavior', defaultValue: true},

					/**
					 * Determines the close button visibility
					 */
					showCloseButton: {type: 'boolean', group: 'Behavior', defaultValue: true}
				},
				aggregations: {
					/**
					 * Action buttons
					 */
					buttons: {type: 'sap.m.Button', multiple: true}
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

		NotificationListItem.prototype.init = function () {
			//set it to an active ListItemBase to the press and tap events are fired
			this.setType('Active');

			/**
			 *
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
		};

		NotificationListItem.prototype.close = function () {
			this.fireClose();
			this.destroy();
		};

		// override the ListItemBase class toggling
		NotificationListItem.prototype._activeHandling = function () {
			this.$().toggleClass("sapMNLIActive", this._active);
		};

		return NotificationListItem;
	}, /* bExport= */ true);
