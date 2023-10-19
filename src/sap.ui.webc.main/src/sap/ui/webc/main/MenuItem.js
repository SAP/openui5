/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.MenuItem.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"./thirdparty/MenuItem"
], function(WebComponent, library, EnabledPropagator) {
	"use strict";

	/**
	 * Constructor for a new <code>MenuItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * <code>sap.ui.webc.main.MenuItem</code> is the item to use inside a <code>sap.ui.webc.main.Menu</code>. An arbitrary hierarchy structure can be represented by recursively nesting menu items.
	 *
	 * <h3>Usage</h3>
	 *
	 * <code>sap.ui.webc.main.MenuItem</code> is an abstract element, representing a node in a <code>sap.ui.webc.main.Menu</code>. The menu itself is rendered as a list, and each <code>sap.ui.webc.main.MenuItem</code> is represented by a list item (<code>sap.ui.webc.main.StandardListItem</code>) in that list. Therefore, you should only use <code>sap.ui.webc.main.MenuItem</code> directly in your apps. The <code>sap.ui.webc.main.StandardListItem</code> list item is internal for the list, and not intended for public use.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.102.0
	 * @experimental Since 1.102.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.MenuItem
	 * @implements sap.ui.webc.main.IMenuItem
	 */
	var MenuItem = WebComponent.extend("sap.ui.webc.main.MenuItem", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-menu-item-ui5",
			interfaces: [
				"sap.ui.webc.main.IMenuItem"
			],
			properties: {

				/**
				 * Defines the accessible ARIA name of the component.
				 */
				accessibleName: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the <code>additionalText</code>, displayed in the end of the menu item. <b>Note:</b> The additional text would not be displayed if the item has a submenu.
				 */
				additionalText: {
					type: "string"
				},

				/**
				 * Defines the delay in milliseconds, after which the busy indicator will be displayed inside the corresponding ui5-menu popover.
				 *
				 * Note: If set to <code>true</code> a <code>sap.ui.webc.main.BusyIndicator</code> component will be displayed into the related one to the current <code>sap.ui.webc.main.MenuItem</code> sub-menu popover.
				 */
				busy: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the delay in milliseconds, after which the busy indicator will be displayed inside the corresponding ui5-menu popover.
				 */
				busyDelay: {
					type: "int",
					defaultValue: 1000
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
				 * Defines the icon to be displayed as graphical element within the component. The SAP-icons font provides numerous options. <br>
				 * <br>
				 * <b>* Example:</b> See all the available icons in the {@link demo:sap/m/demokit/iconExplorer/webapp/index.html Icon Explorer}.
				 */
				icon: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines whether a visual separator should be rendered before the item.
				 */
				startsSection: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the text of the tree item.
				 */
				text: {
					type: "string",
					defaultValue: ""
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the items of this component.
				 */
				items: {
					type: "sap.ui.webc.main.IMenuItem",
					multiple: true
				}
			}
		}
	});

	EnabledPropagator.call(MenuItem.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return MenuItem;
});
