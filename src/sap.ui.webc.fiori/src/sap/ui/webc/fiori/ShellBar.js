/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.ShellBar.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/ShellBar"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>ShellBar</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.fiori.ShellBar</code> is meant to serve as an application header and includes numerous built-in features, such as: logo, profile image/icon, title, search field, notifications and so on. <br>
	 * <br>
	 *
	 *
	 * <h3>Stable DOM Refs</h3>
	 *
	 * You can use the following stable DOM refs for the <code>sap.ui.webc.fiori.ShellBar</code>:
	 * <ul>
	 *     <li>logo</li>
	 *     <li>copilot</li>
	 *     <li>notifications</li>
	 *     <li>overflow</li>
	 *     <li>profile</li>
	 *     <li>product-switch</li>
	 * </ul>
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/::part CSS Shadow Parts} allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.fiori.ShellBar</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>root - Used to style the outermost wrapper of the <code>sap.ui.webc.fiori.ShellBar</code></li>
	 * </ul>
	 *
	 * <h3>Keyboard Handling</h3>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.ShellBar
	 */
	var ShellBar = WebComponent.extend("sap.ui.webc.fiori.ShellBar", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-shellbar-ui5",
			properties: {

				/**
				 * An object of strings that defines several additional accessibility texts for even further customization.
				 *
				 * It supports the following fields: - <code>profileButtonTitle</code>: defines the tooltip for the profile button - <code>logoTitle</code>: defines the tooltip for the logo
				 */
				accessibilityTexts: {
					type: "object",
					defaultValue: {}
				},

				/**
				 * Defines the <code>notificationsCount</code>, displayed in the notification icon top-right corner.
				 */
				notificationsCount: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the <code>primaryTitle</code>. <br>
				 * <br>
				 * <b>Note:</b> The <code>primaryTitle</code> would be hidden on S screen size (less than approx. 700px).
				 */
				primaryTitle: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the <code>secondaryTitle</code>. <br>
				 * <br>
				 * <b>Note:</b> The <code>secondaryTitle</code> would be hidden on S and M screen sizes (less than approx. 1300px).
				 */
				secondaryTitle: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines, if the product CoPilot icon would be displayed. <br>
				 * <b>Note:</b> By default the co-pilot is displayed as static SVG. If you need an animated co-pilot, you can import the <code>"@ui5/webcomponents-fiori/dist/features/CoPilotAnimation.js"</code> module as add-on feature.
				 */
				showCoPilot: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines, if the notification icon would be displayed.
				 */
				showNotifications: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines, if the product switch icon would be displayed.
				 */
				showProductSwitch: {
					type: "boolean",
					defaultValue: false
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the <code>sap.ui.webc.fiori.ShellBar</code> aditional items. <br>
				 * <br>
				 * <b>Note:</b> You can use the &lt;ui5-shellbar-item>&lt;/ui5-shellbar-item>.
				 */
				items: {
					type: "sap.ui.webc.fiori.IShellBarItem",
					multiple: true
				},

				/**
				 * Defines the logo of the <code>sap.ui.webc.fiori.ShellBar</code>. For example, you can use <code>sap.ui.webc.main.Avatar</code> or <code>img</code> elements as logo.
				 */
				logo: {
					type: "sap.ui.webc.main.IAvatar",
					multiple: false,
					slot: "logo"
				},

				/**
				 * Defines the items displayed in menu after a click on the primary title. <br>
				 * <br>
				 * <b>Note:</b> You can use the &lt;ui5-li>&lt;/ui5-li> and its ancestors.
				 */
				menuItems: {
					type: "sap.ui.webc.main.IListItem",
					multiple: true,
					slot: "menuItems"
				},

				/**
				 * You can pass <code>sap.ui.webc.main.Avatar</code> to set the profile image/icon. If no profile slot is set - profile will be excluded from actions.
				 *
				 * Note: We recommend not using the <code>size</code> attribute of <code>sap.ui.webc.main.Avatar</code> because it should have specific size by design in the context of <code>sap.ui.webc.fiori.ShellBar</code> profile.
				 */
				profile: {
					type: "sap.ui.webc.main.IAvatar",
					multiple: false,
					slot: "profile"
				},

				/**
				 * Defines the <code>sap.ui.webc.main.Input</code>, that will be used as a search field.
				 */
				searchField: {
					type: "sap.ui.webc.main.IInput",
					multiple: false,
					slot: "searchField"
				},

				/**
				 * Defines a <code>sap.ui.webc.main.Button</code> in the bar that will be placed in the beginning. We encourage this slot to be used for a back or home button. It gets overstyled to match ShellBar's styling.
				 */
				startButton: {
					type: "sap.ui.webc.main.IButton",
					multiple: false,
					slot: "startButton"
				}
			},
			events: {

				/**
				 * Fired, when the co pilot is activated.
				 */
				coPilotClick: {
					parameters: {
						/**
						 * dom ref of the activated element
						 */
						targetRef: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired, when the logo is activated.
				 */
				logoClick: {
					parameters: {
						/**
						 * dom ref of the activated element
						 */
						targetRef: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired, when a menu item is activated <b>Note:</b> You can prevent closing of overflow popover by calling <code>event.preventDefault()</code>.
				 */
				menuItemClick: {
					parameters: {
						/**
						 * DOM ref of the activated list item
						 */
						item: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired, when the notification icon is activated.
				 */
				notificationsClick: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * dom ref of the activated element
						 */
						targetRef: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired, when the product switch icon is activated. <b>Note:</b> You can prevent closing of overflow popover by calling <code>event.preventDefault()</code>.
				 */
				productSwitchClick: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * dom ref of the activated element
						 */
						targetRef: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired, when the profile slot is present.
				 */
				profileClick: {
					parameters: {
						/**
						 * dom ref of the activated element
						 */
						targetRef: {
							type: "HTMLElement"
						}
					}
				}
			},
			methods: ["closeOverflow"],
			getters: ["copilotDomRef", "logoDomRef", "notificationsDomRef", "overflowDomRef", "productSwitchDomRef", "profileDomRef"]
		}
	});

	/**
	 * Closes the overflow area. Useful to manually close the overflow after having suppressed automatic closing with preventDefault() of ShellbarItem's press event
	 * @public
	 * @name sap.ui.webc.fiori.ShellBar#closeOverflow
	 * @function
	 */

	/**
	 * Returns the <code>copilot</code> DOM ref.
	 * @public
	 * @name sap.ui.webc.fiori.ShellBar#getCopilotDomRef
	 * @function
	 */

	/**
	 * Returns the <code>logo</code> DOM ref.
	 * @public
	 * @name sap.ui.webc.fiori.ShellBar#getLogoDomRef
	 * @function
	 */

	/**
	 * Returns the <code>notifications</code> icon DOM ref.
	 * @public
	 * @name sap.ui.webc.fiori.ShellBar#getNotificationsDomRef
	 * @function
	 */

	/**
	 * Returns the <code>overflow</code> icon DOM ref.
	 * @public
	 * @name sap.ui.webc.fiori.ShellBar#getOverflowDomRef
	 * @function
	 */

	/**
	 * Returns the <code>product-switch</code> icon DOM ref.
	 * @public
	 * @name sap.ui.webc.fiori.ShellBar#getProductSwitchDomRef
	 * @function
	 */

	/**
	 * Returns the <code>profile</code> icon DOM ref.
	 * @public
	 * @name sap.ui.webc.fiori.ShellBar#getProfileDomRef
	 * @function
	 */

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return ShellBar;
});