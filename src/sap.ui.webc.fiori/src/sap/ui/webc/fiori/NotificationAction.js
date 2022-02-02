/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.NotificationAction.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/webc/main/library",
	"./thirdparty/NotificationAction"
], function(WebComponent, library, mainLibrary) {
	"use strict";

	var ButtonDesign = mainLibrary.ButtonDesign;

	/**
	 * Constructor for a new <code>NotificationAction</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * The <code>sap.ui.webc.fiori.NotificationAction</code> represents an abstract action, used in the <code>sap.ui.webc.fiori.NotificationListItem</code> and the <code>sap.ui.webc.fiori.NotificationListGroupItem</code> items.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.NotificationAction
	 * @implements sap.ui.webc.fiori.INotificationAction
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NotificationAction = WebComponent.extend("sap.ui.webc.fiori.NotificationAction", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-notification-action-ui5",
			interfaces: [
				"sap.ui.webc.fiori.INotificationAction"
			],
			properties: {

				/**
				 * Defines the action design.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b>
				 * <ul>
				 *     <li><code>Default</code></li>
				 *     <li><code>Emphasized</code></li>
				 *     <li><code>Positive</code></li>
				 *     <li><code>Negative</code></li>
				 *     <li><code>Transparent</code></li>
				 * </ul>
				 */
				design: {
					type: "sap.ui.webc.main.ButtonDesign",
					defaultValue: ButtonDesign.Transparent
				},

				/**
				 * Defines if the action is disabled. <br>
				 * <br>
				 * <b>Note:</b> a disabled action can't be pressed or focused, and it is not in the tab chain.
				 */
				disabled: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the <code>icon</code> source URI. <br>
				 * <br>
				 * <b>Note:</b> SAP-icons font provides numerous built-in icons. To find all the available icons, see the <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
				 */
				icon: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the text of the <code>sap.ui.webc.fiori.NotificationAction</code>.
				 */
				text: {
					type: "string",
					defaultValue: ""
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return NotificationAction;
});