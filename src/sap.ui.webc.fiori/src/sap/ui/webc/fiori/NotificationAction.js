/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.NotificationAction.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/webc/main/library",
	"./thirdparty/NotificationAction"
], function(WebComponent, library, EnabledPropagator, mainLibrary) {
	"use strict";

	var ButtonDesign = mainLibrary.ButtonDesign;

	/**
	 * Constructor for a new <code>NotificationAction</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
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
				 */
				design: {
					type: "sap.ui.webc.main.ButtonDesign",
					defaultValue: ButtonDesign.Transparent
				},

				/**
				 * Defines whether the control is enabled. A disabled control can't be interacted with, and it is not in the tab chain.
				 */
				enabled: {
					type: "boolean",
					defaultValue: true,
					mapping: {
						type: "property",
						to: "disabled",
						formatter: "_mapEnabled"
					}
				},

				/**
				 * Defines the <code>icon</code> source URI. <br>
				 * <br>
				 * <b>Note:</b> SAP-icons font provides numerous built-in icons. To find all the available icons, see the {@link demo:sap/m/demokit/iconExplorer/webapp/index.html Icon Explorer}.
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
			},
			events: {

				/**
				 * Fired, when the action is pressed.
				 */
				click: {
					parameters: {
						/**
						 * DOM ref of the clicked element
						 */
						targetRef: {
							type: "HTMLElement"
						}
					}
				}
			}
		}
	});

	EnabledPropagator.call(NotificationAction.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return NotificationAction;
});
