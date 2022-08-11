/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.DynamicSideContent.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/DynamicSideContent"
], function(WebComponent, library) {
	"use strict";

	var SideContentFallDown = library.SideContentFallDown;
	var SideContentPosition = library.SideContentPosition;
	var SideContentVisibility = library.SideContentVisibility;

	/**
	 * Constructor for a new <code>DynamicSideContent</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The DynamicSideContent (<code>sap.ui.webc.fiori.DynamicSideContent</code>) is a layout component that allows additional content to be displayed in a way that flexibly adapts to different screen sizes. The side content appears in a container next to or directly below the main content (it doesn't overlay). When the side content is triggered, the main content becomes narrower (if appearing side-by-side). The side content contains a separate scrollbar when appearing next to the main content.
	 *
	 * <h3>Usage</h3>
	 *
	 * <i>When to use?</i>
	 *
	 * Use this component if you want to display relevant information that is not critical for users to complete a task. Users should have access to all the key functions and critical information in the app even if they do not see the side content. This is important because on smaller screen sizes it may be difficult to display the side content in a way that is easily accessible for the user.
	 *
	 * <i>When not to use?</i>
	 *
	 * Don't use it if you want to display navigation or critical information that prevents users from completing a task when they have no access to the side content.
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * Screen width > 1440px
	 *
	 *
	 * <ul>
	 *     <li>Main vs. side content ratio is 75 vs. 25 percent (with a minimum of 320px each).</li>
	 *     <li>If the application defines a trigger, the side content can be hidden.</li>
	 * </ul>
	 *
	 * Screen width <= 1440px and> 1024px
	 *
	 *
	 *     <ul>
	 *         <li>Main vs. side content ratio is 66.666 vs. 33.333 percent (with a minimum of 320px each). If the side content width falls below 320 px, it automatically slides under the main content, unless the app development team specifies that it should disappear.</li>
	 *     </ul>
	 *
	 *     Screen width <= 1024px and> 720px
	 *
	 *
	 *         <ul>
	 *             <li>The side content ratio is fixed to 340px, and the main content takes the rest of the width. Only if the <code>sideContentFallDown</code> is set to <code>OnMinimumWidth</code> and screen width is <= 960px and> 720px the side content falls below the main content.</li>
	 *         </ul>
	 *
	 *         Screen width <= 720px (for example on a mobile device) <ul>
	 *             <li>In this case, the side content automatically disappears from the screen (unless specified to stay under the content by setting of <code>sideContentVisibility</code> property to <code>AlwaysShow</code>) and can be triggered from a pre-set trigger (specified within the app). When the side content is triggered, it replaces the main content. We recommend that you always place the trigger for the side content in the same location, such as in the app footer.</li>
	 *             </ul>
	 *
	 *             A special case allows switching the comparison mode between the main and side content. In this case, the screen is split into 50:50 percent for main vs. side content. The responsive behavior of the equal split is the same as in the standard view - the side content disappears on screen widths of less than 720 px and can only be viewed by triggering it.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.99.0
	 * @experimental Since 1.99.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.DynamicSideContent
	 */
	var DynamicSideContent = WebComponent.extend("sap.ui.webc.fiori.DynamicSideContent", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-dynamic-side-content-ui5",
			properties: {

				/**
				 * Defines whether the component is in equal split mode. In this mode, the side and the main content take 50:50 percent of the container on all screen sizes except for phone, where the main and side contents are switching visibility using the toggle method.
				 */
				equalSplit: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the visibility of the main content.
				 */
				hideMainContent: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the visibility of the side content.
				 */
				hideSideContent: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines on which breakpoints the side content falls down below the main content.
				 *
				 * <br>
				 * <br>
				 * <b>The available values are:</b>
				 *
				 *
				 * <ul>
				 *     <li><code>BelowXL</code></li>
				 *     <li><code>BelowL</code></li>
				 *     <li><code>BelowM</code></li>
				 *     <li><code>OnMinimumWidth</code></li>
				 * </ul>
				 */
				sideContentFallDown: {
					type: "sap.ui.webc.fiori.SideContentFallDown",
					defaultValue: SideContentFallDown.OnMinimumWidth
				},

				/**
				 * Defines whether the side content is positioned before the main content (left side in LTR mode), or after the the main content (right side in LTR mode).
				 *
				 * <br>
				 * <br>
				 * <b>The available values are:</b>
				 *
				 *
				 * <ul>
				 *     <li><code>Start</code></li>
				 *     <li><code>End</code></li>
				 * </ul>
				 */
				sideContentPosition: {
					type: "sap.ui.webc.fiori.SideContentPosition",
					defaultValue: SideContentPosition.End
				},

				/**
				 * Defines on which breakpoints the side content is visible.
				 *
				 * <br>
				 * <br>
				 * <b>The available values are:</b>
				 *
				 *
				 * <ul>
				 *     <li><code>AlwaysShow</code></li>
				 *     <li><code>ShowAboveL</code></li>
				 *     <li><code>ShowAboveM</code></li>
				 *     <li><code>ShowAboveS</code></li>
				 *     <li><code>NeverShow</code></li>
				 * </ul>
				 */
				sideContentVisibility: {
					type: "sap.ui.webc.fiori.SideContentVisibility",
					defaultValue: SideContentVisibility.ShowAboveS
				}
			},
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Defines the main content.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				},

				/**
				 * Defines the side content.
				 */
				sideContent: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "sideContent"
				}
			},
			events: {

				/**
				 * Fires when the current breakpoint has been changed.
				 */
				layoutChange: {
					parameters: {
						/**
						 * the current breakpoint.
						 */
						currentBreakpoint: {
							type: "string"
						},

						/**
						 * the breakpoint that was active before change to current breakpoint.
						 */
						previousBreakpoint: {
							type: "string"
						},

						/**
						 * visibility of the main content.
						 */
						mainContentVisible: {
							type: "boolean"
						},

						/**
						 * visibility of the side content.
						 */
						sideContentVisible: {
							type: "boolean"
						}
					}
				}
			},
			methods: ["toggleContents"]
		}
	});

	/**
	 * Toggles visibility of main and side contents on S screen size (mobile device).
	 * @public
	 * @name sap.ui.webc.fiori.DynamicSideContent#toggleContents
	 * @function
	 */

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return DynamicSideContent;
});