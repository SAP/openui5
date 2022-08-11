/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Toast.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/Toast"
], function(WebComponent, library) {
	"use strict";

	var ToastPlacement = library.ToastPlacement;

	/**
	 * Constructor for a new <code>Toast</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.Toast</code> is a small, non-disruptive popup for success or information messages that disappears automatically after a few seconds.
	 *
	 * <h3>Usage</h3>
	 *
	 * <h4>When to use:</h4>
	 * <ul>
	 *     <li>You want to display a short success or information message.</li>
	 *     <li>You do not want to interrupt users while they are performing an action.</li>
	 *     <li>You want to confirm a successful action.</li>
	 * </ul>
	 * <h4>When not to use:</h4>
	 * <ul>
	 *     <li>You want to display error or warning message.</li>
	 *     <li>You want to interrupt users while they are performing an action.</li>
	 *     <li>You want to make sure that users read the message before they leave the page.</li>
	 *     <li>You want users to be able to copy some part of the message text.</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Toast
	 */
	var Toast = WebComponent.extend("sap.ui.webc.main.Toast", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-toast-ui5",
			properties: {

				/**
				 * Defines the duration in milliseconds for which component remains on the screen before it's automatically closed. <br>
				 * <br>
				 * <b>Note:</b> The minimum supported value is <code>500</code> ms and even if a lower value is set, the duration would remain <code>500</code> ms.
				 */
				duration: {
					type: "int",
					defaultValue: 3000
				},

				/**
				 * Defines the height of the control
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				},

				/**
				 * Defines the placement of the component. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>TopStart</code></li>
				 *     <li><code>TopCenter</code></li>
				 *     <li><code>TopEnd</code></li>
				 *     <li><code>MiddleStart</code></li>
				 *     <li><code>MiddleCenter</code></li>
				 *     <li><code>MiddleEnd</code></li>
				 *     <li><code>BottomStart</code></li>
				 *     <li><code>BottomCenter</code></li>
				 *     <li><code>BottomEnd</code></li>
				 * </ul>
				 */
				placement: {
					type: "sap.ui.webc.main.ToastPlacement",
					defaultValue: ToastPlacement.BottomCenter
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
			methods: ["show"]
		}
	});

	/**
	 * Shows the component.
	 * @public
	 * @name sap.ui.webc.main.Toast#show
	 * @function
	 */

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Toast;
});