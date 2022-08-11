/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.Bar.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/Bar"
], function(WebComponent, library) {
	"use strict";

	var BarDesign = library.BarDesign;

	/**
	 * Constructor for a new <code>Bar</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The Bar is a container which is primarily used to hold titles, buttons and input elements and its design and functionality is the basis for page headers and footers. The component consists of three areas to hold its content - startContent slot, default slot and endContent slot. It has the capability to center content, such as a title, while having other components on the left and right side.
	 *
	 * <h3>Usage</h3> With the use of the design property, you can set the style of the Bar to appear designed like a Header, Subheader, Footer and FloatingFooter. <br>
	 * <b>Note:</b> Do not place a Bar inside another Bar or inside any bar-like component. Doing so may cause unpredictable behavior.
	 *
	 * <h3>Responsive Behavior</h3> The default slot will be centered in the available space between the startContent and the endContent areas, therefore it might not always be centered in the entire bar.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/::part CSS Shadow Parts} allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.fiori.Bar</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>bar - Used to style the wrapper of the content of the component</li>
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
	 * @alias sap.ui.webc.fiori.Bar
	 * @implements sap.ui.webc.fiori.IBar
	 */
	var Bar = WebComponent.extend("sap.ui.webc.fiori.Bar", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-bar-ui5",
			interfaces: [
				"sap.ui.webc.fiori.IBar"
			],
			properties: {

				/**
				 * Defines the component's design.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> Available options are:
				 * <ul>
				 *     <li><code>Header</code></li>
				 *     <li><code>Subheader</code></li>
				 *     <li><code>Footer</code></li>
				 *     <li><code>FloatingFooter</code></li>
				 * </ul>
				 */
				design: {
					type: "sap.ui.webc.fiori.BarDesign",
					defaultValue: BarDesign.Header
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				}
			},
			defaultAggregation: "middleContent",
			aggregations: {

				/**
				 * Defines the content at the end of the bar
				 */
				endContent: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "endContent"
				},

				/**
				 * Defines the content in the middle of the bar
				 */
				middleContent: {
					type: "sap.ui.core.Control",
					multiple: true
				},

				/**
				 * Defines the content at the start of the bar
				 */
				startContent: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "startContent"
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Bar;
});