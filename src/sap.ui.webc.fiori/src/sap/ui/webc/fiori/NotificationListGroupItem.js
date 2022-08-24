/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.NotificationListGroupItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/webc/main/library",
	"./thirdparty/NotificationListGroupItem"
], function(WebComponent, library, mainLibrary) {
	"use strict";

	var Priority = mainLibrary.Priority;

	/**
	 * Constructor for a new <code>NotificationListGroupItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.fiori.NotificationListGroupItem</code> is a special type of list item, that unlike others can group items within self, usually <code>sap.ui.webc.fiori.NotificationListItem</code> items. <br>
	 *
	 *
	 * The component consists of:
	 * <ul>
	 *     <li><code>Toggle</code> button to expand and collapse the group</li>
	 *     <li><code>Priority</code> icon to display the priority of the group</li>
	 *     <li><code>TitleText</code> to entitle the group</li>
	 *     <li>Custom actions - with the use of <code>sap.ui.webc.fiori.NotificationAction</code></li>
	 *     <li>Items of the group</li>
	 * </ul>
	 *
	 * <h3>Usage</h3> The component can be used in a standard <code>sap.ui.webc.main.List</code>.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/::part CSS Shadow Parts} allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.fiori.NotificationListGroupItem</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>title-text - Used to style the titleText of the notification list group item</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.NotificationListGroupItem
	 * @implements sap.ui.webc.main.IListItem
	 */
	var NotificationListGroupItem = WebComponent.extend("sap.ui.webc.fiori.NotificationListGroupItem", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-li-notification-group-ui5",
			interfaces: [
				"sap.ui.webc.main.IListItem"
			],
			properties: {

				/**
				 * Defines if a busy indicator would be displayed over the item.
				 */
				busy: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the delay in milliseconds, after which the busy indicator will show up for this component.
				 */
				busyDelay: {
					type: "int",
					defaultValue: 1000
				},

				/**
				 * Defines if the group is collapsed or expanded.
				 */
				collapsed: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the <code>priority</code> of the item. Available options are:
				 * <ul>
				 *     <li><code>None</code></li>
				 *     <li><code>Low</code></li>
				 *     <li><code>Medium</code></li>
				 *     <li><code>High</code></li>
				 * </ul>
				 */
				priority: {
					type: "sap.ui.webc.main.Priority",
					defaultValue: Priority.None
				},

				/**
				 * Defines if the <code>notification</code> is new or has been already read. <br>
				 * <br>
				 * <b>Note:</b> if set to <code>false</code> the <code>titleText</code> has bold font, if set to true - it has a normal font.
				 */
				read: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines if the <code>close</code> button would be displayed.
				 */
				showClose: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines if the items <code>counter</code> would be displayed.
				 */
				showCounter: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the <code>titleText</code> of the item.
				 */
				titleText: {
					type: "string",
					defaultValue: ""
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the actions, displayed in the top-right area. <br>
				 * <br>
				 * <b>Note:</b> use the <code>sap.ui.webc.fiori.NotificationAction</code> component.
				 */
				actions: {
					type: "sap.ui.webc.fiori.INotificationAction",
					multiple: true,
					slot: "actions"
				},

				/**
				 * Defines the items of the <code>sap.ui.webc.fiori.NotificationListGroupItem</code>, usually <code>sap.ui.webc.fiori.NotificationListItem</code> items.
				 */
				items: {
					type: "sap.ui.webc.fiori.INotificationListItem",
					multiple: true
				}
			},
			events: {

				/**
				 * Fired when the <code>Close</code> button is pressed.
				 */
				close: {
					parameters: {}
				},

				/**
				 * Fired when the <code>sap.ui.webc.fiori.NotificationListGroupItem</code> is expanded/collapsed by user interaction.
				 */
				toggle: {
					parameters: {}
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return NotificationListGroupItem;
});