/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.MessageStrip.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/MessageStrip"
], function(WebComponent, library) {
	"use strict";

	var MessageStripDesign = library.MessageStripDesign;

	/**
	 * Constructor for a new <code>MessageStrip</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.MessageStrip</code> component enables the embedding of app-related messages. It displays 4 designs of messages, each with corresponding semantic color and icon: Information, Positive, Warning and Negative. Each message can have a Close button, so that it can be removed from the UI, if needed.
	 *
	 * <h3>Usage</h3>
	 *
	 * For the <code>sap.ui.webc.main.MessageStrip</code> component, you can define whether it displays an icon in the beginning and a close button. Moreover, its size and background can be controlled with CSS.
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
	 * @alias sap.ui.webc.main.MessageStrip
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MessageStrip = WebComponent.extend("sap.ui.webc.main.MessageStrip", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-message-strip-ui5",
			properties: {

				/**
				 * Defines the component type. <br>
				 * <br>
				 * <b>Note:</b> Available options are <code>"Information"</code>, <code>"Positive"</code>, <code>"Negative"</code>, and <code>"Warning"</code>.
				 */
				design: {
					type: "sap.ui.webc.main.MessageStripDesign",
					defaultValue: MessageStripDesign.Information
				},

				/**
				 * Defines the height of the control
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				},

				/**
				 * Defines whether the MessageStrip renders close button.
				 */
				hideCloseButton: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines whether the MessageStrip will show an icon in the beginning. You can directly provide an icon with the <code>icon</code> slot. Otherwise, the default icon for the type will be used.
				 */
				hideIcon: {
					type: "boolean",
					defaultValue: false
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
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				}
			},
			aggregations: {

				/**
				 * Defines the content to be displayed as graphical element within the component. <br>
				 * <br>
				 * <b>Note:</b> If no icon is given, the default icon for the component type will be used. The SAP-icons font provides numerous options. <br>
				 * <br>
				 *
				 *
				 * See all the available icons in the {@link demo:sap/m/demokit/iconExplorer/webapp/index.html Icon Explorer}.
				 */
				icon: {
					type: "sap.ui.webc.main.IIcon",
					multiple: false,
					slot: "icon"
				}
			},
			events: {

				/**
				 * Fired when the close button is pressed either with a click/tap or by using the Enter or Space key.
				 */
				close: {
					parameters: {}
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return MessageStrip;
});