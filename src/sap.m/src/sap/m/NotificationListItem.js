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
					/**
					 * Determines the it the Notification read or unread.
					 */
					read: {type: 'boolean', group: 'Behavior', defaultValue: false},

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
					text: {type: 'string', group: 'Appearance', defaultValue: ''},

					/**
					 * Determines the due date of the Notification List Item.
					 */
					due: {type: 'string', group: 'Appearance'},

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
					close: {},
					/**
					 * Fired when the list item is tapped. Can be used for acting when the item is tapped.
					 */
					tap: {}
				}
			}
		});

		NotificationListItem.prototype.init = function () {
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

		NotificationListItem.prototype.ontap = function (oEvent) {
			var target = oEvent.target;
			var buttonClassName = 'sapMBtn';

			//TODO: if no IS9 support is needed classList.contains() can be used.
			if (target.className.indexOf(buttonClassName) === -1 && target.parentNode.className.indexOf(buttonClassName) === -1) {
				this.fireTap();

				oEvent.stopPropagation();
			}
		};

		return NotificationListItem;
	}, /* bExport= */ true);
