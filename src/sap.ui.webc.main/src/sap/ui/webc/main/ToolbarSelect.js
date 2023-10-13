/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.ToolbarSelect.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/library",
	"./thirdparty/ToolbarSelect"
], function(WebComponent, library, EnabledPropagator, coreLibrary) {
	"use strict";

	var CSSSize = coreLibrary.CSSSize;
	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>ToolbarSelect</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.main.ToolbarSelect</code> component is used to create a toolbar drop-down list. The items inside the <code>sap.ui.webc.main.ToolbarSelect</code> define the available options by using the <code>sap.ui.webc.main.ToolbarSelectOption</code> component.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.120.0
	 * @experimental Since 1.120.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.ToolbarSelect
	 * @implements sap.ui.webc.main.IToolbarItem
	 */
	var ToolbarSelect = WebComponent.extend("sap.ui.webc.main.ToolbarSelect", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-toolbar-select-ui5",
			interfaces: [
				"sap.ui.webc.main.IToolbarItem"
			],
			properties: {

				/**
				 * Defines the accessible ARIA name of the component.
				 */
				accessibleName: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines whether the control is enabled. A disabled control can't be interacted with, and it is not in the tab chain.
				 */
				enabled: {
					type: "boolean",
					defaultValue: true,
					mapping: {
						type: "property",
						to: "disabled",
						formatter: "_mapEnabled"
					}
				},

				/**
				 * Defines the value state of the component. <br>
				 * <br>
				 */
				valueState: {
					type: "sap.ui.core.ValueState",
					defaultValue: ValueState.None
				},

				/**
				 * Defines the width of the select. <br>
				 * <br>
				 *
				 *
				 * <b>Note:</b> all CSS sizes are supported - 'percentage', 'px', 'rem', 'auto', etc.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: CSSSize.undefined
				}
			},
			defaultAggregation: "options",
			aggregations: {

				/**
				 * Defines the component options.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> Only one selected option is allowed. If more than one option is defined as selected, the last one would be considered as the selected one.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> Use the <code>sap.ui.webc.main.ToolbarSelectOption</code> component to define the desired options.
				 */
				options: {
					type: "sap.ui.webc.main.ISelectOption",
					multiple: true
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
				 * Fired when the selected option changes.
				 */
				change: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * the selected option.
						 */
						selectedOption: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired after the component's dropdown menu closes.
				 */
				close: {
					parameters: {}
				},

				/**
				 * Fired after the component's dropdown menu opens.
				 */
				open: {
					parameters: {}
				}
			}
		}
	});

	EnabledPropagator.call(ToolbarSelect.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return ToolbarSelect;
});
