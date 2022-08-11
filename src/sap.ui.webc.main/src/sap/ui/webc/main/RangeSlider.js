/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.RangeSlider.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"./thirdparty/RangeSlider"
], function(WebComponent, library, EnabledPropagator) {
	"use strict";

	/**
	 * Constructor for a new <code>RangeSlider</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> Represents a numerical interval and two handles (grips) to select a sub-range within it. The purpose of the component to enable visual selection of sub-ranges within a given interval.
	 *
	 * <h3>Structure</h3> The most important properties of the Range Slider are:
	 * <ul>
	 *     <li>min - The minimum value of the slider range.</li>
	 *     <li>max - The maximum value of the slider range.</li>
	 *     <li>value - The current value of the slider.</li>
	 *     <li>step - Determines the increments in which the slider will move.</li>
	 *     <li>showTooltip - Determines if a tooltip should be displayed above the handle.</li>
	 *     <li>showTickmarks - Displays a visual divider between the step values.</li>
	 *     <li>labelInterval - Labels some or all of the tickmarks with their values.</li>
	 * </ul>
	 * <h4>Notes:</h4>
	 * <ul>
	 *     <li>The right and left handle can be moved individually and their positions could therefore switch.</li>
	 *     <li>The entire range can be moved along the interval.</li>
	 * </ul>
	 * <h3>Usage</h3> The most common use case is to select and move sub-ranges on a continuous numerical scale.
	 *
	 * <h3>Responsive Behavior</h3> You can move the currently selected range by clicking on it and dragging it along the interval.
	 *
	 * <h3>Keyboard Handling</h3>
	 *
	 *
	 * <ul>
	 *     <li><code>Left or Down Arrow</code> - Moves a component's handle or the entire selection one step to the left;</li>
	 *     <li><code>Right or Up Arrow</code> - Moves a component's handle or the entire selection one step to the right;</li>
	 *     <li><code>Left or Down Arrow + Ctrl/Cmd</code> - Moves a component's handle to the left or the entire range with step equal to 1/10th of the entire range;</li>
	 *     <li><code>Right or Up Arrow + Ctrl/Cmd</code> - Moves a component's handle to the right or the entire range with step equal to 1/10th of the entire range;</li>
	 *     <li><code>Plus</code> - Same as <code>Right or Up Arrow</code>;</li>
	 *     <li><code>Minus</code> - Same as <code>Left or Down Arrow</code>;</li>
	 *     <li><code>Home</code> - Moves the entire selection or the selected handle to the beginning of the component's range;</li>
	 *     <li><code>End</code> - Moves the entire selection or the selected handle to the end of the component's range;</li>
	 *     <li><code>Page Up</code> - Same as <code>Right or Up Arrow + Ctrl/Cmd</code>;</li>
	 *     <li><code>Page Down</code> - Same as <code>Left or Down Arrow + Ctrl/Cmd</code>;</li>
	 *     <li><code>Escape</code> - Resets the <code>startValue</code> and <code>endValue</code> properties to the values prior the component focusing;</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.RangeSlider
	 */
	var RangeSlider = WebComponent.extend("sap.ui.webc.main.RangeSlider", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-range-slider-ui5",
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
				 * Defines end point of a selection - position of a second handle on the slider. <br>
				 * <br>
				 */
				endValue: {
					type: "float",
					defaultValue: 100
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
				 * Defines start point of a selection - position of a first handle on the slider. <br>
				 * <br>
				 */
				startValue: {
					type: "float",
					defaultValue: 0
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
			designtime: "sap/ui/webc/main/designtime/RangeSlider.designtime"
		}
	});

	EnabledPropagator.call(RangeSlider.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return RangeSlider;
});