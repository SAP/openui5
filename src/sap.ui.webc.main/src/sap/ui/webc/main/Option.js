/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Option.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"./thirdparty/Option"
], function(WebComponent, library, EnabledPropagator) {
	"use strict";

	/**
	 * Constructor for a new <code>Option</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.Option</code> component defines the content of an option in the <code>sap.ui.webc.main.Select</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Option
	 * @implements sap.ui.webc.main.ISelectOption
	 */
	var Option = WebComponent.extend("sap.ui.webc.main.Option", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-option-ui5",
			interfaces: [
				"sap.ui.webc.main.ISelectOption"
			],
			properties: {

				/**
				 * Defines the additional text displayed at the end of the option element.
				 */
				additionalText: {
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
				 * Defines the <code>icon</code> source URI. <br>
				 * <br>
				 * <b>Note:</b> SAP-icons font provides numerous built-in icons. To find all the available icons, see the {@link demo:sap/m/demokit/iconExplorer/webapp/index.html Icon Explorer}.
				 */
				icon: {
					type: "string"
				},

				/**
				 * Defines the selected state of the component.
				 */
				selected: {
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
				 * Defines the value of the <code>sap.ui.webc.main.Select</code> inside an HTML Form element when this component is selected. For more information on HTML Form support, see the <code>name</code> property of <code>sap.ui.webc.main.Select</code>.
				 */
				value: {
					type: "string"
				}
			}
		}
	});

	EnabledPropagator.call(Option.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Option;
});