/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.ResponsivePopover.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/ResponsivePopover"
], function(WebComponent, library) {
	"use strict";

	var PopoverHorizontalAlign = library.PopoverHorizontalAlign;
	var PopoverPlacementType = library.PopoverPlacementType;
	var PopoverVerticalAlign = library.PopoverVerticalAlign;

	/**
	 * Constructor for a new <code>ResponsivePopover</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.main.ResponsivePopover</code> acts as a Popover on desktop and tablet, while on phone it acts as a Dialog. The component improves tremendously the user experience on mobile.
	 *
	 * <h3>Usage</h3> Use it when you want to make sure that all the content is visible on any device.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/::part CSS Shadow Parts} allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.ResponsivePopover</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>header - Used to style the header of the component</li>
	 *     <li>content - Used to style the content of the component</li>
	 *     <li>footer - Used to style the footer of the component</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.ResponsivePopover
	 */
	var ResponsivePopover = WebComponent.extend("sap.ui.webc.main.ResponsivePopover", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-responsive-popover-ui5",
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
				 * Defines whether the component should close when clicking/tapping outside of the popover. If enabled, it blocks any interaction with the background.
				 */
				modal: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Indicates if the element is open
				 */
				open: {
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
				 * Defines the opener id of the element that the popover is shown at
				 */
				opener: {
					type: "sap.ui.core.Control",
					multiple: false,
					mapping: {
						type: "property",
						to: "opener"
					}
				},

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
				},

				/**
				 * Defines the ID of the HTML Element, which will get the initial focus.
				 */
				initialFocus: {
					type: "sap.ui.core.Control",
					multiple: false,
					mapping: {
						type: "property",
						to: "initialFocus"
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
			methods: ["applyFocus", "close", "isOpen", "showAt"],
			designtime: "sap/ui/webc/main/designtime/ResponsivePopover.designtime"
		}
	});

	/**
	 * Focuses the element denoted by <code>initialFocus</code>, if provided, or the first focusable element otherwise.
	 * @public
	 * @name sap.ui.webc.main.ResponsivePopover#applyFocus
	 * @function
	 */

	/**
	 * Closes the popover/dialog.
	 * @public
	 * @name sap.ui.webc.main.ResponsivePopover#close
	 * @function
	 */

	/**
	 * Tells if the responsive popover is open
	 * @public
	 * @name sap.ui.webc.main.ResponsivePopover#isOpen
	 * @function
	 */

	/**
	 * Shows popover on desktop and dialog on mobile.
	 * @param {HTMLElement} opener the element that the popover is shown at
	 * @param {boolean} preventInitialFocus Prevents applying the focus inside the popup
	 * @public
	 * @name sap.ui.webc.main.ResponsivePopover#showAt
	 * @function
	 */

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return ResponsivePopover;
});