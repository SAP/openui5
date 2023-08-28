/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Menu.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"./thirdparty/Menu"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>Menu</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * <code>sap.ui.webc.main.Menu</code> component represents a hierarchical menu structure.
	 *
	 * <h3>Usage</h3>
	 *
	 * <code>sap.ui.webc.main.Menu</code> contains <code>sap.ui.webc.main.MenuItem</code> components. An arbitrary hierarchy structure can be represented by recursively nesting menu items.
	 *
	 * <h3>Keyboard Handling</h3>
	 *
	 * The <code>sap.ui.webc.main.Menu</code> provides advanced keyboard handling. The user can use the following keyboard shortcuts in order to navigate trough the tree:
	 * <ul>
	 *     <li><code>Arrow Up</code> / <code>Arrow Down</code> - Navigates up and down the menu items that are currently visible.</li>
	 *     <li><code>Arrow Right</code>, <code>Space</code> or <code>Enter</code> - Opens a sub-menu if there are menu items nested in the currently clicked menu item.</li>
	 *     <li><code>Arrow Left</code> or <code>Escape</code> - Closes the currently opened sub-menu.</li>
	 * </ul> Note: if the text ditrection is set to Right-to-left (RTL), <code>Arrow Right</code> and <code>Arrow Left</code> functionality is swapped. <br>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.102.0
	 * @experimental Since 1.102.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Menu
	 */
	var Menu = WebComponent.extend("sap.ui.webc.main.Menu", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-menu-ui5",
			properties: {

				/**
				 * Defines if a loading indicator would be displayed inside the corresponding ui5-menu popover.
				 */
				busy: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the delay in milliseconds, after which the busy indicator will be displayed inside the corresponding ui5-menu popover..
				 */
				busyDelay: {
					type: "int",
					defaultValue: 1000
				},

				/**
				 * Defines the header text of the menu (displayed on mobile).
				 */
				headerText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Indicates if the menu is open
				 */
				open: {
					type: "boolean",
					defaultValue: false
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the items of this component. <br>
				 * <br>
				 * <b>Note:</b> Use <code>sap.ui.webc.main.MenuItem</code> for the intended design.
				 */
				items: {
					type: "sap.ui.webc.main.IMenuItem",
					multiple: true
				}
			},
			associations: {

				/**
				 * Defines the ID or DOM Reference of the element that the menu is shown at
				 */
				opener: {
					type: "sap.ui.core.Control",
					multiple: false,
					mapping: {
						type: "property",
						to: "opener"
					}
				}
			},
			events: {

				/**
				 * Fired after the menu is closed. <b>This event does not bubble.</b>
				 */
				afterClose: {
					parameters: {}
				},

				/**
				 * Fired after the menu is opened. <b>This event does not bubble.</b>
				 */
				afterOpen: {
					parameters: {}
				},

				/**
				 * Fired before the menu is closed. This event can be cancelled, which will prevent the menu from closing. <b>This event does not bubble.</b>
				 */
				beforeClose: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * Indicates that <code>ESC</code> key has triggered the event.
						 */
						escPressed: {
							type: "boolean"
						}
					}
				},

				/**
				 * Fired before the menu is opened. This event can be cancelled, which will prevent the menu from opening. <b>This event does not bubble.</b> <b>Note:</b> Since 1.14.0 the event is also fired before a sub-menu opens.
				 */
				beforeOpen: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * The <code>sap.ui.webc.main.MenuItem</code> that triggers opening of the sub-menu or undefined when fired upon root menu opening. <b>Note:</b> available since 1.14.0.
						 */
						item: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired when an item is being clicked.
				 */
				itemClick: {
					parameters: {
						/**
						 * The currently clicked menu item.
						 */
						item: {
							type: "HTMLElement"
						},

						/**
						 * The text of the currently clicked menu item.
						 */
						text: {
							type: "string"
						}
					}
				}
			},
			methods: ["close", "showAt"]
		}
	});

	/**
	 * Closes the Menu.
	 * @public
	 * @name sap.ui.webc.main.Menu#close
	 * @function
	 */

	/**
	 * Shows the Menu near the opener element.
	 * @param {HTMLElement} opener the element that the popover is shown at
	 * @public
	 * @name sap.ui.webc.main.Menu#showAt
	 * @function
	 */

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Menu;
});
