/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.NotificationListItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/webc/main/library",
	"./thirdparty/NotificationListItem"
], function(WebComponent, library, mainLibrary) {
	"use strict";

	var Priority = mainLibrary.Priority;
	var WrappingType = mainLibrary.WrappingType;

	/**
	 * Constructor for a new <code>NotificationListItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.fiori.NotificationListItem</code> is a type of list item, meant to display notifications. <br>
	 *
	 *
	 * The component has a rich set of various properties that allows the user to set <code>avatar</code>, <code>titleText</code>, descriptive <code>content</code> and <code>footnotes</code> to fully describe a notification. <br>
	 *
	 *
	 * The user can:
	 * <ul>
	 *     <li>display a <code>Close</code> button</li>
	 *     <li>can control whether the <code>titleText</code> and <code>description</code> should wrap or truncate and display a <code>ShowMore</code> button to switch between less and more information</li>
	 *     <li>add custom actions by using the <code>sap.ui.webc.fiori.NotificationAction</code> component</li>
	 * </ul>
	 *
	 * <h3>Usage</h3> The component can be used in a standard <code>sap.ui.webc.main.List</code>.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/::part CSS Shadow Parts} allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.fiori.NotificationListItem</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>title-text - Used to style the titleText of the notification list item</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.NotificationListItem
	 * @implements sap.ui.webc.fiori.INotificationListItem, sap.ui.webc.main.IListItem
	 */
	var NotificationListItem = WebComponent.extend("sap.ui.webc.fiori.NotificationListItem", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-li-notification-ui5",
			interfaces: [
				"sap.ui.webc.fiori.INotificationListItem",
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
				 * Defines the content of the control
				 */
				description: {
					type: "string",
					defaultValue: "",
					mapping: "textContent"
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
				 * Defines the <code>titleText</code> of the item.
				 */
				titleText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines if the <code>titleText</code> and <code>description</code> should wrap, they truncate by default.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> by default the <code>titleText</code> and <code>decription</code>, and a <code>ShowMore/Less</code> button would be displayed.
				 */
				wrappingType: {
					type: "sap.ui.webc.main.WrappingType",
					defaultValue: WrappingType.None
				}
			},
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
				 * Defines the avatar, displayed in the <code>sap.ui.webc.fiori.NotificationListItem</code>.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> Consider using the <code>sap.ui.webc.main.Avatar</code> to display icons, initials or images. <br>
				 * <b>Note:</b>In order to be complaint with the UX guidlines and for best experience, we recommend using avatars with 2rem X 2rem in size (32px X 32px). In case you are using the <code>sap.ui.webc.main.Avatar</code> you can set its <code>size</code> property to <code>XS</code> to get the required size - <code>&lt;ui5-avatar size="XS">&lt;/ui5-avatar></code>.
				 */
				avatar: {
					type: "sap.ui.webc.main.IAvatar",
					multiple: false,
					slot: "avatar"
				},

				/**
				 * Defines the elements, displayed in the footer of the of the component.
				 */
				footnotes: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "footnotes"
				}
			},
			events: {

				/**
				 * Fired when the <code>Close</code> button is pressed.
				 */
				close: {
					parameters: {}
				}
			},
			designtime: "sap/ui/webc/fiori/designtime/NotificationListItem.designtime"
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return NotificationListItem;
});