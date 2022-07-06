/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.BusyIndicator.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/BusyIndicator"
], function(WebComponent, library) {
	"use strict";

	var BusyIndicatorSize = library.BusyIndicatorSize;

	/**
	 * Constructor for a new <code>BusyIndicator</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.BusyIndicator</code> signals that some operation is going on and that the user must wait. It does not block the current UI screen so other operations could be triggered in parallel. It displays 3 dots and each dot expands and shrinks at a different rate, resulting in a cascading flow of animation.
	 *
	 * <h3>Usage</h3> For the <code>sap.ui.webc.main.BusyIndicator</code> you can define the size, the text and whether it is shown or hidden. In order to hide it, use the "active" property. <br>
	 * <br>
	 * In order to show busy state over an HTML element, simply nest the HTML element in a <code>sap.ui.webc.main.BusyIndicator</code> instance. <br>
	 * <b>Note:</b> Since <code>sap.ui.webc.main.BusyIndicator</code> has <code>display: inline-block;</code> by default and no width of its own, whenever you need to wrap a block-level element, you should set <code>display: block</code> to the busy indicator as well.
	 *
	 * <h4>When to use:</h4>
	 * <ul>
	 *     <li>The user needs to be able to cancel the operation.</li>
	 *     <li>Only part of the application or a particular component is affected.</li>
	 * </ul>
	 *
	 * <h4>When not to use:</h4>
	 * <ul>
	 *     <li>The operation takes less than one second.</li>
	 *     <li>You need to block the screen and prevent the user from starting another activity.</li>
	 *     <li>Do not show multiple busy indicators at once.</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.BusyIndicator
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var BusyIndicator = WebComponent.extend("sap.ui.webc.main.BusyIndicator", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-busy-indicator-ui5",
			properties: {

				/**
				 * Defines if the busy indicator is visible on the screen. By default it is not.
				 */
				active: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the delay in milliseconds, after which the busy indicator will be visible on the screen.
				 */
				delay: {
					type: "int",
					defaultValue: 1000
				},

				/**
				 * Defines whether the control will be rendered as a block or inline HTML element
				 */
				display: {
					type: "string",
					defaultValue: "inline-block",
					mapping: "style"
				},

				/**
				 * Defines the size of the component.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b>
				 *
				 *
				 * <ul>
				 *     <li><code>Small</code></li>
				 *     <li><code>Medium</code></li>
				 *     <li><code>Large</code></li>
				 * </ul>
				 */
				size: {
					type: "sap.ui.webc.main.BusyIndicatorSize",
					defaultValue: BusyIndicatorSize.Medium
				},

				/**
				 * Defines text to be displayed below the component. It can be used to inform the user of the current operation.
				 */
				text: {
					type: "string",
					defaultValue: ""
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
				 * Determines the content over which the component will appear.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			},
			designtime: "sap/ui/webc/main/designtime/BusyIndicator.designtime"
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return BusyIndicator;
});