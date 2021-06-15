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
	 * <h3>Overview</h3> The Bar is a container which is primarily used to hold titles, buttons and input elements and its design and functionality is the basis for page headers and footers. The component consists of three areas to hold its content - startContent, middleContent and endContent. It has the capability to center content, such as a title, while having other components on the left and right side.
	 *
	 * <h3>Usage</h3> With the use of the design property, you can set the style of the Bar to appear designed like a Header, Subheader, Footer and FloatingFooter. <br>
	 * <b>Note:</b> Do not place a Bar inside another Bar or inside any bar-like component. Doing so may cause unpredictable behavior.
	 *
	 * <h3>Responsive Behavior</h3> The middleContent will be centered in the available space between the startContent and the endContent areas, therefore it might not always be centered in the entire bar.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.Bar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Bar = WebComponent.extend("sap.ui.webc.fiori.Bar", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-bar-ui5",
			properties: {

				/**
				 * Defines the <code>sap.ui.webc.fiori.Bar</code> design.
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
					defaultValue: null,
					mapping: "style"
				}
			},
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
					multiple: true,
					slot: "middleContent"
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

	return Bar;
});