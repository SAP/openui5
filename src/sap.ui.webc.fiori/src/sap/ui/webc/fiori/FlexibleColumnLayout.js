/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.FlexibleColumnLayout.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/FlexibleColumnLayout"
], function(WebComponent, library) {
	"use strict";

	var FCLLayout = library.FCLLayout;

	/**
	 * Constructor for a new <code>FlexibleColumnLayout</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>FlexibleColumnLayout</code> implements the list-detail-detail paradigm by displaying up to three pages in separate columns. There are several possible layouts that can be changed either with the component API, or by pressing the arrows, displayed between the columns.
	 *
	 * <h3>Usage</h3>
	 *
	 * Use this component for applications that need to display several logical levels of related information side by side (e.g. list of items, item, sub-item, etc.). The Component is flexible in a sense that the application can focus the user's attention on one particular column.
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * The <code>FlexibleColumnLayout</code> automatically displays the maximum possible number of columns based on <code>layout</code> property and the window size. The component would display 1 column for window size smaller than 599px, up to two columns between 599px and 1023px, and 3 columns for sizes bigger than 1023px.
	 *
	 * <br>
	 * <br>
	 * <h3>Keyboard Handling</h3>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.FlexibleColumnLayout
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FlexibleColumnLayout = WebComponent.extend("sap.ui.webc.fiori.FlexibleColumnLayout", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-flexible-column-layout-ui5",
			properties: {

				/**
				 * An object of strings that defines additional accessibility roles for further customization.
				 *
				 * It supports the following fields: - <code>startColumnRole</code>: the accessibility role for the <code>startColumn</code> - <code>startArrowContainerRole</code>: the accessibility role for the first arrow container (between the <code>begin</code> and <code>mid</code> columns) - <code>midColumnRole</code>: the accessibility role for the <code>midColumn</code> - <code>endArrowContainerRole</code>: the accessibility role for the second arrow container (between the <code>mid</code> and <code>end</code> columns) - <code>endColumnRole</code>: the accessibility role for the <code>endColumn</code>
				 */
				accessibilityRoles: {
					type: "object",
					defaultValue: {}
				},

				/**
				 * An object of strings that defines several additional accessibility texts for even further customization.
				 *
				 * It supports the following fields: - <code>startColumnAccessibleName</code>: the accessibility name for the <code>startColumn</code> region - <code>midColumnAccessibleName</code>: the accessibility name for the <code>midColumn</code> region - <code>endColumnAccessibleName</code>: the accessibility name for the <code>endColumn</code> region - <code>startArrowLeftText</code>: the text that the first arrow (between the <code>begin</code> and <code>mid</code> columns) will have when pointing to the left - <code>startArrowRightText</code>: the text that the first arrow (between the <code>begin</code> and <code>mid</code> columns) will have when pointing to the right - <code>endArrowLeftText</code>: the text that the second arrow (between the <code>mid</code> and <code>end</code> columns) will have when pointing to the left - <code>endArrowRightText</code>: the text that the second arrow (between the <code>mid</code> and <code>end</code> columns) will have when pointing to the right - <code>startArrowContainerAccessibleName</code>: the text that the first arrow container (between the <code>begin</code> and <code>mid</code> columns) will have as <code>aria-label</code> - <code>endArrowContainerAccessibleName</code>: the text that the second arrow container (between the <code>mid</code> and <code>end</code> columns) will have as <code>aria-label</code>
				 */
				accessibilityTexts: {
					type: "object",
					defaultValue: {}
				},

				/**
				 * Defines the height of the control
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				},

				/**
				 * Defines the visibility of the arrows, used for expanding and shrinking the columns.
				 */
				hideArrows: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the columns layout and their proportion. <br>
				 * <br>
				 * <b>Note:</b> The layout also depends on the screen size - one column for screens smaller than 599px, two columns between 599px and 1023px and three columns for sizes bigger than 1023px. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>OneColumn</code></li>
				 *     <li><code>TwoColumnsStartExpanded</code></li>
				 *     <li><code>TwoColumnsMidExpanded</code></li>
				 *     <li><code>ThreeColumnsMidExpanded</code></li>
				 *     <li><code>ThreeColumnsEndExpanded</code></li>
				 *     <li><code>ThreeColumnsStartExpandedEndHidden</code></li>
				 *     <li><code>ThreeColumnsMidExpandedEndHidden</code></li>
				 *     <li><code>MidColumnFullScreen</code></li>
				 *     <li><code>EndColumnFullScreen</code></li>
				 * </ul> <br>
				 * <br>
				 * <b>For example:</b> layout=<code>TwoColumnsStartExpanded</code> means the layout will display up to two columns in 67%/33% proportion.
				 */
				layout: {
					type: "sap.ui.webc.fiori.FCLLayout",
					defaultValue: FCLLayout.OneColumn
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				}
			},
			aggregations: {

				/**
				 * Defines the content in the end column.
				 */
				endColumn: {
					type: "sap.ui.core.Control",
					multiple: false,
					slot: "endColumn"
				},

				/**
				 * Defines the content in the middle column.
				 */
				midColumn: {
					type: "sap.ui.core.Control",
					multiple: false,
					slot: "midColumn"
				},

				/**
				 * Defines the content in the start column.
				 */
				startColumn: {
					type: "sap.ui.core.Control",
					multiple: false,
					slot: "startColumn"
				}
			},
			events: {

				/**
				 * Fired when the layout changes via user interaction by clicking the arrows or by changing the component size due to resizing.
				 */
				layoutChange: {
					parameters: {
						/**
						 * The current layout
						 */
						layout: {
							type: "FCLLayout"
						},

						/**
						 * The effective column layout, f.e [67%, 33%, 0]
						 */
						columnLayout: {
							type: "Array"
						},

						/**
						 * Indicates if the start column is currently visible
						 */
						startColumnVisible: {
							type: "boolean"
						},

						/**
						 * Indicates if the middle column is currently visible
						 */
						midColumnVisible: {
							type: "boolean"
						},

						/**
						 * Indicates if the end column is currently visible
						 */
						endColumnVisible: {
							type: "boolean"
						},

						/**
						 * Indicates if the layout is changed via the arrows
						 */
						arrowsUsed: {
							type: "boolean"
						},

						/**
						 * Indicates if the layout is changed via resizing
						 */
						resize: {
							type: "boolean"
						}
					}
				}
			},
			getters: ["columnLayout", "endColumnVisible", "midColumnVisible", "startColumnVisible", "visibleColumns"]
		}
	});

	/**
	 * Returns the current column layout, based on both the <code>layout</code> property and the screen size. <br><br> <b>For example:</b> ["67%", "33%", 0], ["100%", 0, 0], ["25%", "50%", "25%"], etc, where the numbers represents the width of the start, middle and end columns.
	 * @public
	 * @name sap.ui.webc.fiori.FlexibleColumnLayout#getColumnLayout
	 * @function
	 */

	/**
	 * Returns if the <code>end</code> column is visible.
	 * @public
	 * @name sap.ui.webc.fiori.FlexibleColumnLayout#getEndColumnVisible
	 * @function
	 */

	/**
	 * Returns if the <code>middle</code> column is visible.
	 * @public
	 * @name sap.ui.webc.fiori.FlexibleColumnLayout#getMidColumnVisible
	 * @function
	 */

	/**
	 * Returns if the <code>start</code> column is visible.
	 * @public
	 * @name sap.ui.webc.fiori.FlexibleColumnLayout#getStartColumnVisible
	 * @function
	 */

	/**
	 * Returns the number of currently visible columns.
	 * @public
	 * @name sap.ui.webc.fiori.FlexibleColumnLayout#getVisibleColumns
	 * @function
	 */

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return FlexibleColumnLayout;
});