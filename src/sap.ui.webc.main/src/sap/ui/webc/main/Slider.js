/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Slider.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"./thirdparty/Slider"
], function(WebComponent, library, EnabledPropagator) {
	"use strict";

	/**
	 * Constructor for a new <code>Slider</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The Slider component represents a numerical range and a handle (grip). The purpose of the component is to enable visual selection of a value in a continuous numerical range by moving an adjustable handle.
	 *
	 * <h3>Structure</h3> The most important properties of the Slider are:
	 * <ul>
	 *     <li>min - The minimum value of the slider range.</li>
	 *     <li>max - The maximum value of the slider range.</li>
	 *     <li>value - The current value of the slider range.</li>
	 *     <li>step - Determines the increments in which the slider will move.</li>
	 *     <li>showTooltip - Determines if a tooltip should be displayed above the handle.</li>
	 *     <li>showTickmarks - Displays a visual divider between the step values.</li>
	 *     <li>labelInterval - Labels some or all of the tickmarks with their values.</li>
	 * </ul>
	 *
	 * <h3>Usage</h3> The most common use case is to select values on a continuous numerical scale (e.g. temperature, volume, etc. ).
	 *
	 * <h3>Responsive Behavior</h3> The <code>sap.ui.webc.main.Slider</code> component adjusts to the size of its parent container by recalculating and resizing the width of the control. You can move the slider handle in several different ways:
	 * <ul>
	 *     <li>Drag and drop the handle to the desired value.</li>
	 *     <li>Click/tap on the range bar to move the handle to that location.</li>
	 * </ul>
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.Slider</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>progress-container - Used to style the progress container(the horizontal bar which visually represents the range between the minimum and maximum value) of the <code>sap.ui.webc.main.Slider</code>.</li>
	 *     <li>progress-bar - Used to style the progress bar, which shows the progress of the <code>sap.ui.webc.main.Slider</code>.</li>
	 *     <li>handle - Used to style the handle of the <code>sap.ui.webc.main.Slider</code>.</li>
	 * </ul>
	 *
	 * <h3>Keyboard Handling</h3>
	 *
	 *
	 * <ul>
	 *     <li><code>Left or Down Arrow</code> - Moves the handle one step to the left, effectively decreasing the component's value by <code>step</code> amount;</li>
	 *     <li><code>Right or Up Arrow</code> - Moves the handle one step to the right, effectively increasing the component's value by <code>step</code> amount;</li>
	 *     <li><code>Left or Down Arrow + Ctrl/Cmd</code> - Moves the handle to the left with step equal to 1/10th of the entire range, effectively decreasing the component's value by 1/10th of the range;</li>
	 *     <li><code>Right or Up Arrow + Ctrl/Cmd</code> - Moves the handle to the right with step equal to 1/10th of the entire range, effectively increasing the component's value by 1/10th of the range;</li>
	 *     <li><code>Plus</code> - Same as <code>Right or Up Arrow</code>;</li>
	 *     <li><code>Minus</code> - Same as <code>Left or Down Arrow</code>;</li>
	 *     <li><code>Home</code> - Moves the handle to the beginning of the range;</li>
	 *     <li><code>End</code> - Moves the handle to the end of the range;</li>
	 *     <li><code>Page Up</code> - Same as <code>Right or Up + Ctrl/Cmd</code>;</li>
	 *     <li><code>Page Down</code> - Same as <code>Left or Down + Ctrl/Cmd</code>;</li>
	 *     <li><code>Escape</code> - Resets the value property after interaction, to the position prior the component's focusing;</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Slider
	 * @implements sap.ui.core.IFormContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Slider = WebComponent.extend("sap.ui.webc.main.Slider", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-slider-ui5",
			interfaces: [
				"sap.ui.core.IFormContent"
			],
			properties: {

				/**
				 * Defines the accessible aria name of the component.
				 */
				accessibleName: {
					type: "string"
				},

				/**
				 * Defines whether the control is enabled. A disabled control can't be interacted with, and it is not in the tab chain.
				 */
				enabled: {
					type: "boolean",
					defaultValue: true,
					mapping: {
						type: "attribute",
						to: "disabled",
						formatter: "_mapEnabled"
					}
				},

				/**
				 * Displays a label with a value on every N-th step. <br>
				 * <br>
				 * <b>Note:</b> The step and tickmarks properties must be enabled. Example - if the step value is set to 2 and the label interval is also specified to 2 - then every second tickmark will be labelled, which means every 4th value number.
				 */
				labelInterval: {
					type: "int",
					defaultValue: 0
				},

				/**
				 * Defines the maximum value of the slider.
				 */
				max: {
					type: "float",
					defaultValue: 100
				},

				/**
				 * Defines the minimum value of the slider.
				 */
				min: {
					type: "float",
					defaultValue: 0
				},

				/**
				 * Enables tickmarks visualization for each step. <br>
				 * <br>
				 * <b>Note:</b> The step must be a positive number.
				 */
				showTickmarks: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Enables handle tooltip displaying the current value.
				 */
				showTooltip: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the size of the slider's selection intervals (e.g. min = 0, max = 10, step = 5 would result in possible selection of the values 0, 5, 10). <br>
				 * <br>
				 * <b>Note:</b> If set to 0 the slider handle movement is disabled. When negative number or value other than a number, the component fallbacks to its default value.
				 */
				step: {
					type: "int",
					defaultValue: 1
				},

				/**
				 * Current value of the slider
				 */
				value: {
					type: "float",
					defaultValue: 0
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				}
			},
			events: {

				/**
				 * Fired when the value changes and the user has finished interacting with the slider.
				 */
				change: {
					parameters: {}
				},

				/**
				 * Fired when the value changes due to user interaction that is not yet finished - during mouse/touch dragging.
				 */
				input: {
					parameters: {}
				}
			},
			designtime: "sap/ui/webc/main/designtime/Slider.designtime"
		}
	});

	EnabledPropagator.call(Slider.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Slider;
});