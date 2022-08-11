/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.Page.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/Page"
], function(WebComponent, library) {
	"use strict";

	var PageBackgroundDesign = library.PageBackgroundDesign;

	/**
	 * Constructor for a new <code>Page</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.fiori.Page</code> is a container component that holds one whole screen of an application. The page has three distinct areas that can hold content - a header, content area and a footer. <h3>Structure</h3>
	 * <h4>Header</h4> The top most area of the page is occupied by the header. The standard header includes a navigation button and a title. <h4>Content</h4> The content occupies the main part of the page. Only the content area is scrollable by default. This can be prevented by setting <code>enableScrolling</code> to <code>false</code>. <h4>Footer</h4> The footer is optional and occupies the fixed bottom part of the page. Alternatively, the footer can be floating above the bottom part of the content. This is enabled with the <code>floatingFooter</code> property.
	 *
	 * <b>Note:</b> <code>sap.ui.webc.fiori.Page</code> occipues the whole available space of its parent. In order to achieve the intended design you have to make sure that there is enough space for the <code>sap.ui.webc.fiori.Page</code> to be rendered.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.Page
	 */
	var Page = WebComponent.extend("sap.ui.webc.fiori.Page", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-page-ui5",
			properties: {

				/**
				 * Defines the background color of the <code>sap.ui.webc.fiori.Page</code>. <br>
				 * <br>
				 * <b>Note:</b> When a ui5-list is placed inside the page, we recommend using “List” to ensure better color contrast. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>Solid</code></li> (default) <li><code>Transparent</code></li>
				 *     <li><code>List</code></li>
				 * </ul>
				 */
				backgroundDesign: {
					type: "sap.ui.webc.fiori.PageBackgroundDesign",
					defaultValue: PageBackgroundDesign.Solid
				},

				/**
				 * Disables vertical scrolling of page content. If set to true, there will be no vertical scrolling at all.
				 */
				disableScrolling: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines if the footer should float over the content. <br>
				 * <br>
				 * <b>Note:</b> When set to true the footer floats over the content with a slight offset from the bottom, otherwise it is fixed at the very bottom of the page.
				 */
				floatingFooter: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Defines the height of the control
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				},

				/**
				 * Defines the footer visibility.
				 */
				hideFooter: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				}
			},
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Defines the content HTML Element.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				},

				/**
				 * Defines the footer HTML Element.
				 */
				footer: {
					type: "sap.ui.webc.fiori.IBar",
					multiple: false,
					slot: "footer"
				},

				/**
				 * Defines the header HTML Element.
				 */
				header: {
					type: "sap.ui.webc.fiori.IBar",
					multiple: false,
					slot: "header"
				}
			},
			designtime: "sap/ui/webc/fiori/designtime/Page.designtime"
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Page;
});