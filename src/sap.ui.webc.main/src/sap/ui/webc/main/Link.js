/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Link.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/Link"
], function(WebComponent, library) {
	"use strict";

	var LinkDesign = library.LinkDesign;
	var WrappingType = library.WrappingType;

	/**
	 * Constructor for a new <code>Link</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.main.Link</code> is a hyperlink component that is used to navigate to other apps and web pages, or to trigger actions. It is a clickable text element, visualized in such a way that it stands out from the standard text. On hover, it changes its style to an underlined text to provide additional feedback to the user.
	 *
	 * <h3>Usage</h3>
	 *
	 * You can set the <code>sap.ui.webc.main.Link</code> to be enabled or disabled. <br>
	 * <br>
	 * To create a visual hierarchy in large lists of links, you can set the less important links as <code>Subtle</code> or the more important ones as <code>Emphasized</code>, by using the <code>design</code> property. <br>
	 * <br>
	 * If the <code>href</code> property is set, the link behaves as the HTML anchor tag (<code>&lt;a&gt;&lt;a&#47;&gt;</code>) and opens the specified URL in the given target frame (<code>target</code> property). To specify where the linked content is opened, you can use the <code>target</code> property.
	 *
	 * <h3>Responsive behavior</h3>
	 *
	 * If there is not enough space, the text of the <code>sap.ui.webc.main.Link</code> becomes truncated. If the <code>wrappingType</code> property is set to <code>"Normal"</code>, the text is displayed on several lines instead of being truncated.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Link
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Link = WebComponent.extend("sap.ui.webc.main.Link", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-link-ui5",
			properties: {

				/**
				 * Receives id(or many ids) of the elements that label the input
				 */
				accessibleNameRef: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the component design. <br>
				 * <br>
				 * <b>Note:</b> Avaialble options are <code>Default</code>, <code>Subtle</code>, and <code>Emphasized</code>.
				 */
				design: {
					type: "sap.ui.webc.main.LinkDesign",
					defaultValue: LinkDesign.Default
				},

				/**
				 * Defines whether the component is disabled. <br>
				 * <br>
				 * <b>Note:</b> When disabled, the click event cannot be triggered by the user.
				 */
				disabled: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the component href. <br>
				 * <br>
				 * <b>Note:</b> Standard hyperlink behavior is supported.
				 */
				href: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the component target. <br>
				 * <br>
				 * <b>Notes:</b>
				 *
				 *
				 * <ul>
				 *     <li><code>_self</code></li>
				 *     <li><code>_top</code></li>
				 *     <li><code>_blank</code></li>
				 *     <li><code>_parent</code></li>
				 *     <li><code>_search</code></li>
				 * </ul>
				 *
				 * <b>This property must only be used when the <code>href</code> property is set.</b>
				 */
				target: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the content of the control
				 */
				text: {
					type: "string",
					defaultValue: "",
					mapping: "textContent"
				},

				/**
				 * Defines how the text of a component will be displayed when there is not enough space. Available options are:
				 * <ul>
				 *     <li><code>None</code> - The text will be truncated with an ellipsis.</li>
				 *     <li><code>Normal</code> - The text will wrap. The words will not be broken based on hyphenation.</li>
				 * </ul>
				 */
				wrappingType: {
					type: "sap.ui.webc.main.WrappingType",
					defaultValue: WrappingType.None
				}
			},
			events: {

				/**
				 * Fired when the component is triggered either with a mouse/tap or by using the Enter key.
				 */
				click: {
					parameters: {}
				}
			}
		}
	});

	return Link;
});