/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Panel.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/Panel"
], function(WebComponent, library) {
	"use strict";

	var PanelAccessibleRole = library.PanelAccessibleRole;
	var TitleLevel = library.TitleLevel;

	/**
	 * Constructor for a new <code>Panel</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.Panel</code> component is a container which has a header and a content area and is used for grouping and displaying information. It can be collapsed to save space on the screen.
	 *
	 * <h3>Guidelines:</h3>
	 * <ul>
	 *     <li>Nesting two or more panels is not recommended.</li>
	 *     <li>Do not stack too many panels on one page.</li>
	 * </ul>
	 *
	 * <h3>Structure</h3> The panel's header area consists of a title bar with a header text or custom header. <br>
	 * The header is clickable and can be used to toggle between the expanded and collapsed state. It includes an icon which rotates depending on the state. <br>
	 * The custom header can be set through the <code>header</code> slot and it may contain arbitraray content, such as: title, buttons or any other HTML elements. <br>
	 * The content area can contain an arbitrary set of controls. <br>
	 * <b>Note:</b> The custom header is not clickable out of the box, but in this case the icon is interactive and allows to show/hide the content area.
	 *
	 * <h3>Responsive Behavior</h3>
	 * <ul>
	 *     <li>If the width of the panel is set to 100% (default), the panel and its children are resized responsively, depending on its parent container.</li>
	 *     <li>If the panel has a fixed height, it will take up the space even if the panel is collapsed.</li>
	 *     <li>When the panel is expandable (the <code>fixed</code> property is set to <code>false</code>), an arrow icon (pointing to the right) appears in front of the header.</li>
	 *     <li>When the animation is activated, expand/collapse uses a smooth animation to open or close the content area.</li>
	 *     <li>When the panel expands/collapses, the arrow icon rotates 90 degrees clockwise/counter-clockwise.</li>
	 * </ul>
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.Panel</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>header - Used to style the wrapper of the header</li>
	 *     <li>content - Used to style the wrapper of the content</li>
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
	 * @alias sap.ui.webc.main.Panel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Panel = WebComponent.extend("sap.ui.webc.main.Panel", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-panel-ui5",
			properties: {

				/**
				 * Defines the accessible aria name of the component.
				 */
				accessibleName: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Sets the accessible aria role of the component. Depending on the usage, you can change the role from the default <code>Form</code> to <code>Region</code> or <code>Complementary</code>.
				 */
				accessibleRole: {
					type: "sap.ui.webc.main.PanelAccessibleRole",
					defaultValue: PanelAccessibleRole.Form
				},

				/**
				 * Indicates whether the component is collapsed and only the header is displayed.
				 */
				collapsed: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Determines whether the component is in a fixed state that is not expandable/collapsible by user interaction.
				 */
				fixed: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the "aria-level" of component heading, set by the <code>headerText</code>. <br>
				 * <br>
				 * Available options are: <code>"H6"</code> to <code>"H1"</code>.
				 */
				headerLevel: {
					type: "sap.ui.webc.main.TitleLevel",
					defaultValue: TitleLevel.H2
				},

				/**
				 * This property is used to set the header text of the component. The text is visible in both expanded and collapsed states. <br>
				 * <br>
				 * <b>Note:</b> This property is overridden by the <code>header</code> slot.
				 */
				headerText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the height of the control
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				},

				/**
				 * Indicates whether the transition between the expanded and the collapsed state of the component is animated. By default the animation is enabled.
				 */
				noAnimation: {
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
				 * Defines the content of the component. The content is visible only when the component is expanded.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				},

				/**
				 * Defines the component header area. <br>
				 * <br>
				 * <b>Note:</b> When a header is provided, the <code>headerText</code> property is ignored.
				 */
				header: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "header"
				}
			},
			events: {

				/**
				 * Fired when the component is expanded/collapsed by user interaction.
				 */
				toggle: {
					parameters: {}
				}
			},
			designtime: "sap/ui/webc/main/designtime/Panel.designtime"
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Panel;
});