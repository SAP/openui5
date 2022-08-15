/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.WizardStep.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"./thirdparty/WizardStep"
], function(WebComponent, library, EnabledPropagator) {
	"use strict";

	/**
	 * Constructor for a new <code>WizardStep</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * A component that represents a logical step as part of the <code>sap.ui.webc.fiori.Wizard</code>. It is meant to aggregate arbitrary HTML elements that form the content of a single step.
	 *
	 * <h3>Structure</h3>
	 * <ul>
	 *     <li>Each wizard step has arbitrary content.</li>
	 *     <li>Each wizard step might have texts - defined by the <code>titleText</code> and <code>subtitleText</code> properties.</li>
	 *     <li>Each wizard step might have an icon - defined by the <code>icon</code> property.</li>
	 *     <li>Each wizard step might display a number in place of the <code>icon</code>, when it's missing.</li>
	 * </ul>
	 *
	 * <h3>Usage</h3> The <code>sap.ui.webc.fiori.WizardStep</code> component should be used only as slot of the <code>sap.ui.webc.fiori.Wizard</code> component and should not be used standalone.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.WizardStep
	 * @implements sap.ui.webc.fiori.IWizardStep
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var WizardStep = WebComponent.extend("sap.ui.webc.fiori.WizardStep", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-wizard-step-ui5",
			interfaces: [
				"sap.ui.webc.fiori.IWizardStep"
			],
			properties: {

				/**
				 * When <code>branching</code> is enabled a dashed line would be displayed after the step, meant to indicate that the next step is not yet known and depends on user choice in the current step. <br>
				 * <br>
				 *
				 *
				 * <b>Note:</b> It is recommended to use <code>branching</code> on the last known step and later add new steps when it becomes clear how the wizard flow should continue.
				 */
				branching: {
					type: "boolean",
					defaultValue: false
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
				 * Defines the <code>icon</code> of the step. <br>
				 * <br>
				 *
				 *
				 * <b>Note:</b> The icon is displayed in the <code>sap.ui.webc.fiori.Wizard</code> navigation header. <br>
				 * <br>
				 *
				 *
				 * The SAP-icons font provides numerous options. See all the available icons in the {@link demo:sap/m/demokit/iconExplorer/webapp/index.html Icon Explorer}.
				 */
				icon: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the step's <code>selected</code> state - the step that is currently active. <br>
				 * <br>
				 *
				 *
				 * <b>Note:</b> Step can't be <code>selected</code> and <code>disabled</code> at the same time. In this case the <code>selected</code> property would take precedence.
				 */
				selected: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the <code>subtitleText</code> of the step. <br>
				 * <br>
				 *
				 *
				 * <b>Note:</b> the text is displayed in the <code>sap.ui.webc.fiori.Wizard</code> navigation header.
				 */
				subtitleText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the <code>titleText</code> of the step. <br>
				 * <br>
				 *
				 *
				 * <b>Note:</b> The text is displayed in the <code>sap.ui.webc.fiori.Wizard</code> navigation header.
				 */
				titleText: {
					type: "string",
					defaultValue: ""
				}
			},
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Defines the step content.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			}
		}
	});

	EnabledPropagator.call(WizardStep.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return WizardStep;
});