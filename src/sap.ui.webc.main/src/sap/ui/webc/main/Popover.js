/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Popover.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/Popover"
], function(WebComponent, library) {
	"use strict";

	var PopoverHorizontalAlign = library.PopoverHorizontalAlign;
	var PopoverPlacementType = library.PopoverPlacementType;
	var PopoverVerticalAlign = library.PopoverVerticalAlign;

	/**
	 * Constructor for a new <code>Popover</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.Popover</code> component displays additional information for an object in a compact way and without leaving the page. The Popover can contain various UI elements, such as fields, tables, images, and charts. It can also include actions in the footer.
	 *
	 * <h3>Structure</h3>
	 *
	 * The popover has three main areas:
	 * <ul>
	 *     <li>Header (optional)</li>
	 *     <li>Content</li>
	 *     <li>Footer (optional)</li>
	 * </ul>
	 *
	 * <b>Note:</b> The <code>sap.ui.webc.main.Popover</code> is closed when the user clicks or taps outside the popover or selects an action within the popover. You can prevent this with the <code>modal</code> property.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Popover
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Popover = WebComponent.extend("sap.ui.webc.main.Popover", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-popover-ui5",
			properties: {

				/**
				 * Defines the accessible name of the component.
				 */
				accessibleName: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Determines if there is no enough space, the component can be placed over the target.
				 */
				allowTargetOverlap: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the header text. <br>
				 * <br>
				 * <b>Note:</b> If <code>header</code> slot is provided, the <code>headerText</code> is ignored.
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
					defaultValue: null,
					mapping: "style"
				},

				/**
				 * Determines whether the component arrow is hidden.
				 */
				hideArrow: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines whether the block layer will be shown if modal property is set to true.
				 */
				hideBackdrop: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Determines the horizontal alignment of the component. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>Center</code></li>
				 *     <li><code>Left</code></li>
				 *     <li><code>Right</code></li>
				 *     <li><code>Stretch</code></li>
				 * </ul>
				 */
				horizontalAlign: {
					type: "sap.ui.webc.main.PopoverHorizontalAlign",
					defaultValue: PopoverHorizontalAlign.Center
				},

				/**
				 * Defines the ID of the HTML Element, which will get the initial focus.
				 */
				initialFocus: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines whether the component should close when clicking/tapping outside of the popover. If enabled, it blocks any interaction with the background.
				 */
				modal: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Determines on which side the component is placed at. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>Left</code></li>
				 *     <li><code>Right</code></li>
				 *     <li><code>Top</code></li>
				 *     <li><code>Bottom</code></li>
				 * </ul>
				 */
				placementType: {
					type: "sap.ui.webc.main.PopoverPlacementType",
					defaultValue: PopoverPlacementType.Right
				},

				/**
				 * Defines if the focus should be returned to the previously focused element, when the popup closes.
				 */
				preventFocusRestore: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Determines the vertical alignment of the component. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>Center</code></li>
				 *     <li><code>Top</code></li>
				 *     <li><code>Bottom</code></li>
				 *     <li><code>Stretch</code></li>
				 * </ul>
				 */
				verticalAlign: {
					type: "sap.ui.webc.main.PopoverVerticalAlign",
					defaultValue: PopoverVerticalAlign.Center
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
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Defines the content of the Popup.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				},

				/**
				 * Defines the footer HTML Element.
				 */
				footer: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "footer"
				},

				/**
				 * Defines the header HTML Element.
				 */
				header: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "header"
				}
			},
			associations: {

				/**
				 * Receives id(or many ids) of the controls that label this control.
				 */
				ariaLabelledBy: {
					type: "sap.ui.core.Control",
					multiple: true,
					mapping: {
						type: "property",
						to: "accessibleNameRef",
						formatter: "_getAriaLabelledByForRendering"
					}
				}
			},
			events: {

				/**
				 * Fired after the component is closed. <b>This event does not bubble.</b>
				 */
				afterClose: {
					parameters: {}
				},

				/**
				 * Fired after the component is opened. <b>This event does not bubble.</b>
				 */
				afterOpen: {
					parameters: {}
				},

				/**
				 * Fired before the component is closed. This event can be cancelled, which will prevent the popup from closing. <b>This event does not bubble.</b>
				 */
				beforeClose: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * Indicates that <code>ESC</code> key has triggered the event.
						 */
						escPressed: {
							type: "boolean"
						}
					}
				},

				/**
				 * Fired before the component is opened. This event can be cancelled, which will prevent the popup from opening. <b>This event does not bubble.</b>
				 */
				beforeOpen: {
					allowPreventDefault: true,
					parameters: {}
				}
			},
			methods: ["applyFocus", "close", "isOpen", "showAt"]
		}
	});

	/**
	 * Focuses the element denoted by <code>initialFocus</code>, if provided, or the first focusable element otherwise.
	 * @public
	 * @name sap.ui.webc.main.Popover#applyFocus
	 * @function
	 */

	/**
	 * Hides the block layer (for modal popups only)
	 * @public
	 * @name sap.ui.webc.main.Popover#close
	 * @function
	 */

	/**
	 * Tells if the component is opened
	 * @public
	 * @name sap.ui.webc.main.Popover#isOpen
	 * @function
	 */

	/**
	 * Shows the popover.
	 * @param {HTMLElement} opener the element that the popover is shown at
	 * @param {boolean} preventInitialFocus prevents applying the focus inside the popover
	 * @public
	 * @name sap.ui.webc.main.Popover#showAt
	 * @function
	 */

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Popover;
});