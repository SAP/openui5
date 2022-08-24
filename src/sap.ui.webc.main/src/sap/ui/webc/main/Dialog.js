/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Dialog.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/Dialog"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>Dialog</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.main.Dialog</code> component is used to temporarily display some information in a size-limited window in front of the regular app screen. It is used to prompt the user for an action or a confirmation. The <code>sap.ui.webc.main.Dialog</code> interrupts the current app processing as it is the only focused UI element and the main screen is dimmed/blocked. The dialog combines concepts known from other technologies where the windows have names such as dialog box, dialog window, pop-up, pop-up window, alert box, or message box. <br>
	 * <br>
	 * The <code>sap.ui.webc.main.Dialog</code> is modal, which means that user action is required before returning to the parent window is possible. The content of the <code>sap.ui.webc.main.Dialog</code> is fully customizable.
	 *
	 * <h3>Structure</h3> A <code>sap.ui.webc.main.Dialog</code> consists of a header, content, and a footer for action buttons. The <code>sap.ui.webc.main.Dialog</code> is usually displayed at the center of the screen. Its position can be changed by the user. To enable this, you need to set the property <code>draggable</code> accordingly.
	 *
	 * <h3>Responsive Behavior</h3> The <code>stretch</code> property can be used to stretch the <code>sap.ui.webc.main.Dialog</code> on full screen.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/::part CSS Shadow Parts} allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.Dialog</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>header - Used to style the header of the component</li>
	 *     <li>content - Used to style the content of the component</li>
	 *     <li>footer - Used to style the footer of the component</li>
	 * </ul>
	 *
	 *
	 *
	 * <b>Note:</b> We don't recommend nesting popup-like components (<code>sap.ui.webc.main.Dialog</code>, <code>sap.ui.webc.main.Popover</code>) inside <code>sap.ui.webc.main.Dialog</code>. Ideally you should create all popups on the same level inside your HTML page and just open them from one another, rather than nesting them.
	 *
	 * <b>Note:</b> We don't recommend nesting popup-like components (<code>sap.ui.webc.main.Dialog</code>, <code>sap.ui.webc.main.Popover</code>) inside other components containing z-index. This might break z-index management.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Dialog
	 */
	var Dialog = WebComponent.extend("sap.ui.webc.main.Dialog", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-dialog-ui5",
			properties: {

				/**
				 * Defines the accessible name of the component.
				 */
				accessibleName: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Determines whether the component is draggable. If this property is set to true, the Dialog will be draggable by its header. <br>
				 * <br>
				 * <b>Note:</b> The component can be draggable only in desktop mode.
				 */
				draggable: {
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
					mapping: "style"
				},

				/**
				 * Indicates if the element is open
				 */
				open: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines if the focus should be returned to the previously focused element, when the popup closes.
				 */
				preventFocusRestore: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Configures the component to be resizable. If this property is set to true, the Dialog will have a resize handle in its bottom right corner in LTR languages. In RTL languages, the resize handle will be placed in the bottom left corner. <br>
				 * <br>
				 * <b>Note:</b> The component can be resizable only in desktop mode. <br>
				 * <b>Note:</b> Upon resizing, externally defined height and width styling will be ignored.
				 */
				resizable: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Determines whether the component should be stretched to fullscreen. <br>
				 * <br>
				 * <b>Note:</b> The component will be stretched to approximately 90% of the viewport.
				 */
				stretch: {
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
				 * Defines the header HTML Element. <br>
				 * <br>
				 * <b>Note:</b> If <code>header</code> slot is provided, the labelling of the dialog is a responsibility of the application developer. <code>accessibleName</code> should be used.
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
			methods: ["applyFocus", "close", "isOpen", "show"],
			designtime: "sap/ui/webc/main/designtime/Dialog.designtime"
		}
	});

	/**
	 * Focuses the element denoted by <code>initialFocus</code>, if provided, or the first focusable element otherwise.
	 * @public
	 * @name sap.ui.webc.main.Dialog#applyFocus
	 * @function
	 */

	/**
	 * Hides the block layer (for modal popups only)
	 * @public
	 * @name sap.ui.webc.main.Dialog#close
	 * @function
	 */

	/**
	 * Tells if the component is opened
	 * @public
	 * @name sap.ui.webc.main.Dialog#isOpen
	 * @function
	 */

	/**
	 * Shows the dialog.
	 * @param {boolean} preventInitialFocus Prevents applying the focus inside the popup
	 * @public
	 * @name sap.ui.webc.main.Dialog#show
	 * @function
	 */

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Dialog;
});