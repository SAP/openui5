/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.SideNavigation.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/SideNavigation"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>SideNavigation</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>SideNavigation</code> is used as a standard menu in applications. It consists of three containers: header (top-aligned), main navigation section (top-aligned) and the secondary section (bottom-aligned).
	 * <ul>
	 *     <li>The header is meant for displaying user related information - profile data, avatar, etc.</li>
	 *     <li>The main navigation section is related to the user’s current work context</li>
	 *     <li>The secondary section is mostly used to link additional information that may be of interest (legal information, developer communities, external help, contact information and so on). </li>
	 * </ul>
	 *
	 * <h3>Usage</h3>
	 *
	 * Use the available <code>sap.ui.webc.fiori.SideNavigationItem</code> and <code>sap.ui.webc.fiori.SideNavigationSubItem</code> components to build your menu. The items can consist of text only or an icon with text. The use or non-use of icons must be consistent for all items on one level. You must not combine entries with and without icons on the same level. We strongly recommend that you do not use icons on the second level.
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
	 * @alias sap.ui.webc.fiori.SideNavigation
	 */
	var SideNavigation = WebComponent.extend("sap.ui.webc.fiori.SideNavigation", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-side-navigation-ui5",
			properties: {

				/**
				 * Defines whether the <code>sap.ui.webc.fiori.SideNavigation</code> is expanded or collapsed.
				 */
				collapsed: {
					type: "boolean",
					defaultValue: false
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the fixed items at the bottom of the <code>sap.ui.webc.fiori.SideNavigation</code>. Use the <code>sap.ui.webc.fiori.SideNavigationItem</code> component for the fixed items, and optionally the <code>sap.ui.webc.fiori.SideNavigationSubItem</code> component to provide second-level items inside them.
				 *
				 * <b>Note:</b> In order to achieve the best user experience, it is recommended that you keep the fixed items "flat" (do not pass sub-items)
				 */
				fixedItems: {
					type: "sap.ui.webc.fiori.ISideNavigationItem",
					multiple: true,
					slot: "fixedItems"
				},

				/**
				 * Defines the header of the <code>sap.ui.webc.fiori.SideNavigation</code>.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> The header is displayed when the component is expanded - the property <code>collapsed</code> is false;
				 */
				header: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "header"
				},

				/**
				 * Defines the main items of the <code>sap.ui.webc.fiori.SideNavigation</code>. Use the <code>sap.ui.webc.fiori.SideNavigationItem</code> component for the top-level items, and the <code>sap.ui.webc.fiori.SideNavigationSubItem</code> component for second-level items, nested inside the items.
				 */
				items: {
					type: "sap.ui.webc.fiori.ISideNavigationItem",
					multiple: true
				}
			},
			events: {

				/**
				 * Fired when the selection has changed via user interaction
				 */
				selectionChange: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * the clicked item.
						 */
						item: {
							type: "HTMLElement"
						}
					}
				}
			},
			designtime: "sap/ui/webc/fiori/designtime/SideNavigation.designtime"
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return SideNavigation;
});