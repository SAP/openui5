/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.ProgressIndicator.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/library",
	"./thirdparty/ProgressIndicator"
], function(WebComponent, library, EnabledPropagator, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>ProgressIndicator</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> Shows the progress of a process in a graphical way. To indicate the progress, the inside of the component is filled with a color.
	 *
	 * <h3>Responsive Behavior</h3> You can change the size of the Progress Indicator by changing its <code>width</code> or <code>height</code> CSS properties.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.ProgressIndicator
	 * @implements sap.ui.core.IFormContent
	 */
	var ProgressIndicator = WebComponent.extend("sap.ui.webc.main.ProgressIndicator", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-progress-indicator-ui5",
			interfaces: [
				"sap.ui.core.IFormContent"
			],
			properties: {

				/**
				 * Specifies the text value to be displayed in the bar.
				 *
				 * <b>Note:</b>
				 * <ul>
				 *     <li>If there is no value provided or the value is empty, the default percentage value is shown.</li>
				 *     <li>If <code>hideValue</code> property is <code>true</code> both the <code>displayValue</code> and <code>value</code> property values are not shown.</li>
				 * </ul>
				 */
				displayValue: {
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
				 * Defines whether the component value is shown.
				 */
				hideValue: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Specifies the numerical value in percent for the length of the component.
				 *
				 * <b>Note:</b> If a value greater than 100 is provided, the percentValue is set to 100. In other cases of invalid value, percentValue is set to its default of 0.
				 */
				value: {
					type: "int",
					defaultValue: 0
				},

				/**
				 * Defines the value state of the component. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>None</code></li>
				 *     <li><code>Error</code></li>
				 *     <li><code>Warning</code></li>
				 *     <li><code>Success</code></li>
				 *     <li><code>Information</code></li>
				 * </ul>
				 */
				valueState: {
					type: "sap.ui.core.ValueState",
					defaultValue: ValueState.None
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				}
			}
		}
	});

	EnabledPropagator.call(ProgressIndicator.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return ProgressIndicator;
});