/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.TabContainer.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/TabContainer"
], function(WebComponent, library) {
	"use strict";

	var TabLayout = library.TabLayout;

	/**
	 * Constructor for a new <code>TabContainer</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.TabContainer</code> represents a collection of tabs with associated content. Navigation through the tabs changes the content display of the currently active content area. A tab can be labeled with text only, or icons with text.
	 *
	 * <h3>Structure</h3>
	 *
	 * The <code>sap.ui.webc.main.TabContainer</code> can hold two types of entities:
	 * <ul>
	 *     <li><code>sap.ui.webc.main.Tab</code> - contains all the information on an item (text and icon)</li>
	 *     <li><code>sap.ui.webc.main.TabSeparator</code> - used to separate tabs with a vertical line</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.TabContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TabContainer = WebComponent.extend("sap.ui.webc.main.TabContainer", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-tabcontainer-ui5",
			properties: {

				/**
				 * Defines whether the tab content is collapsed.
				 */
				collapsed: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines whether the tabs are in a fixed state that is not expandable/collapsible by user interaction.
				 */
				fixed: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the height of the control
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: null,
					mapping: "style"
				},

				/**
				 * Defines whether the overflow select list is displayed. <br>
				 * <br>
				 * The overflow select list represents a list, where all tab filters are displayed so that it's easier for the user to select a specific tab filter.
				 */
				showOverflow: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the alignment of the content and the <code>additionalText</code> of a tab.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> The content and the <code>additionalText</code> would be displayed vertically by defualt, but when set to <code>Inline</code>, they would be displayed horizontally.
				 *
				 * <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>Standard</code></li>
				 *     <li><code>Inline</code></li>
				 * </ul>
				 */
				tabLayout: {
					type: "sap.ui.webc.main.TabLayout",
					defaultValue: TabLayout.Standard
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: null,
					mapping: "style"
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the tabs. <br>
				 * <br>
				 * <b>Note:</b> Use <code>sap.ui.webc.main.Tab</code> and <code>sap.ui.webc.main.TabSeparator</code> for the intended design.
				 */
				items: {
					type: "sap.ui.webc.main.ITab",
					multiple: true
				},

				/**
				 * Defines the button which will open the overflow menu. If nothing is provided to this slot, the default button will be used.
				 */
				overflowButton: {
					type: "sap.ui.webc.main.IButton",
					multiple: false,
					slot: "overflowButton"
				}
			},
			events: {

				/**
				 * Fired when a tab is selected.
				 */
				tabSelect: {
					parameters: {
						/**
						 * The selected <code>tab</code>.
						 */
						tab: {
							type: "HTMLElement"
						},

						/**
						 * The selected <code>tab</code> index.
						 */
						tabIndex: {
							type: "int"
						}
					}
				}
			}
		}
	});

	return TabContainer;
});