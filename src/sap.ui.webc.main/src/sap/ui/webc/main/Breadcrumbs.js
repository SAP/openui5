/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Breadcrumbs.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/Breadcrumbs"
], function(WebComponent, library) {
	"use strict";

	var BreadcrumbsDesign = library.BreadcrumbsDesign;
	var BreadcrumbsSeparatorStyle = library.BreadcrumbsSeparatorStyle;

	/**
	 * Constructor for a new <code>Breadcrumbs</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> Enables users to navigate between items by providing a list of links to previous steps in the user's navigation path. It helps the user to be aware of their location within the application and allows faster navigation. <br>
	 * <br>
	 * The last three steps can be accessed as links directly, while the remaining links prior to them are available in a drop-down menu. <br>
	 * <br>
	 * You can choose the type of separator to be used from a number of predefined options.
	 *
	 * <h3>Keyboard Handling</h3> The <code>sap.ui.webc.main.Breadcrumbs</code> provides advanced keyboard handling. <br>
	 *
	 * <ul>
	 *     <li>[F4, ALT+UP, ALT+DOWN, SPACE, ENTER] - If the dropdown arrow is focused - opens/closes the drop-down.</li>
	 *     <li>[SPACE, ENTER] - Activates the focused item and triggers the <code>item-click</code> event.</li>
	 *     <li>[ESC] - Closes the drop-down.</li>
	 *     <li>[LEFT] - If the drop-down is closed - navigates one item to the left.</li>
	 *     <li>[RIGHT] - If the drop-down is closed - navigates one item to the right.</li>
	 *     <li>[UP] - If the drop-down is open - moves focus to the next item.</li>
	 *     <li>[DOWN] - If the drop-down is open - moves focus to the previous item.</li>
	 *     <li>[HOME] - Navigates to the first item.</li>
	 *     <li>[END] - Navigates to the last item.</li>
	 * </ul> <br>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.95.0
	 * @experimental Since 1.95.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Breadcrumbs
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Breadcrumbs = WebComponent.extend("sap.ui.webc.main.Breadcrumbs", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-breadcrumbs-ui5",
			properties: {

				/**
				 * Defines the visual indication and behavior of the breadcrumbs. Available options are <code>Standard</code> (by default) and <code>NoCurrentPage</code>. <br>
				 * <br>
				 * <b>Note:</b> The <code>Standard</code> breadcrumbs show the current page as the last item in the trail. The last item contains only plain text and is not a link.
				 */
				design: {
					type: "sap.ui.webc.main.BreadcrumbsDesign",
					defaultValue: BreadcrumbsDesign.Standard
				},

				/**
				 * Determines the visual style of the separator between the breadcrumb items.
				 *
				 * <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>Slash</code></li>
				 *     <li><code>BackSlash</code></li>
				 *     <li><code>DoubleBackSlash</code></li>
				 *     <li><code>DoubleGreaterThan</code></li>
				 *     <li><code>DoubleSlash</code></li>
				 *     <li><code>GreaterThan</code></li>
				 * </ul>
				 */
				separatorStyle: {
					type: "sap.ui.webc.main.BreadcrumbsSeparatorStyle",
					defaultValue: BreadcrumbsSeparatorStyle.Slash
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the component items.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> Use the <code>sap.ui.webc.main.BreadcrumbsItem</code> component to define the desired items.
				 */
				items: {
					type: "sap.ui.webc.main.IBreadcrumbsItem",
					multiple: true
				}
			},
			events: {

				/**
				 * Fires when a <code>BreadcrumbsItem</code> is clicked. <b>Note:</b> You can prevent browser location change by calling <code>event.preventDefault()</code>.
				 */
				itemClick: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * The clicked item.
						 */
						item: {
							type: "HTMLElement"
						},

						/**
						 * Returns whether the "ALT" key was pressed when the event was triggered.
						 */
						altKey: {
							type: "boolean"
						},

						/**
						 * Returns whether the "CTRL" key was pressed when the event was triggered.
						 */
						ctrlKey: {
							type: "boolean"
						},

						/**
						 * Returns whether the "META" key was pressed when the event was triggered.
						 */
						metaKey: {
							type: "boolean"
						},

						/**
						 * Returns whether the "SHIFT" key was pressed when the event was triggered.
						 */
						shiftKey: {
							type: "boolean"
						}
					}
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Breadcrumbs;
});