/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.Wizard.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/Wizard"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>Wizard</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.fiori.Wizard</code> helps users to complete a complex task by dividing it into sections and guiding them through it. It has two main areas - a navigation area at the top showing the step sequence and a content area below it.
	 *
	 * <h3>Structure</h3>
	 * <h4>Navigation area</h4> The top most area of the <code>sap.ui.webc.fiori.Wizard</code> is occupied by the navigation area. It shows the sequence of steps, where the recommended number of steps is between 3 and 8 steps.
	 * <ul>
	 *     <li> Steps can have different visual representations - numbers or icons.
	 *     <li> Steps might have labels for better readability - titleText and subTitleText.</li>
	 *     <li> Steps are defined by using the <code>sap.ui.webc.fiori.WizardStep</code> as slotted element within the <code>sap.ui.webc.fiori.Wizard</code>.</li>
	 * </ul>
	 *
	 * <b>Note:</b> If no selected step is defined, the first step will be auto selected. <br>
	 * <b>Note:</b> If multiple selected steps are defined, the last step will be selected.
	 *
	 * <h3>Keyboard Handling</h3> The user can navigate using the following keyboard shortcuts: <br>
	 *
	 *
	 * <h4>Wizard Progress Navigation</h4>
	 * <ul>
	 *     <li>[LEFT], [DOWN] - Focus moves backward to the WizardProgressNavAnchors.</li>
	 *     <li>[UP], [RIGHT] - Focus moves forward to the WizardProgressNavAnchor.</li>
	 *     <li>[SPACE] or [ENTER], [RETURN] - Selects an active step</li>
	 *     <li>[HOME] or [PAGE UP] - Focus goes to the first step</li>
	 *     <li>[END] or [PAGE DOWN] - Focus goes to the last step</li>
	 * </ul>
	 *
	 *
	 * <h4>Content</h4> The content occupies the main part of the page. It can hold any type of HTML elements. It's defined by using the <code>sap.ui.webc.fiori.WizardStep</code> as slotted element within the <code>sap.ui.webc.fiori.Wizard</code>.
	 *
	 * <h3>Scrolling</h3> The component handles user scrolling by selecting the closest step, based on the current scroll position and scrolls to particular place, when the user clicks on the step within the navigation area. <br>
	 * <br>
	 *
	 *
	 * <b>Important:</b> In order the component's scrolling behaviour to work, it has to be limited from the outside parent element in terms of height. The component or its parent has to be given percentage or absolute height. Otherwise, the component will be scrolled out with the entire page. <br>
	 * <br>
	 * <b>For example:</b> <br>
	 * <br>
	 * <code>&lt;ui5-dialog style="height: 80%"&gt;<br>
	 * </code> <code>&#9;&lt;ui5-wizard&gt;&lt;/ui5-wizard&gt;<br>
	 * </code> <code>&lt;/ui5-dialog&gt;</code>
	 *
	 * <h4>Moving to next step</h4> The <code>sap.ui.webc.fiori.WizardStep</code> provides the necessary API and it's up to the user of the component to use it to move to the next step. You have to set its <code>selected</code> property (and remove the <code>disabled</code> one if set) to <code>true</code>. The <code>sap.ui.webc.fiori.Wizard</code> will automatically scroll to the content of the newly selected step. <br>
	 * <br>
	 *
	 *
	 * The Fiori 3 guidelines recommends having a "nextStep" button in the content area. You can place a button, or any other type of element to trigger step change, inside the <code>sap.ui.webc.fiori.WizardStep</code>, and show/hide it when certain fields are filled or user defined criteria is met.
	 *
	 * <h3>Usage</h3>
	 * <h4>When to use:</h4> When the user has to accomplish a long or unfamiliar task.
	 *
	 * <h4>When not to use:</h4> When the task has less than 3 steps.
	 *
	 * <h3>Responsive Behavior</h3> On small widths the step's titleText, subtitleText and separators in the navigation area shrink and from particular point the steps are grouped together and overlap. Tapping on them will show a popover to select the step to navigate to. On mobile device, the grouped steps are presented within a dialog.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.Wizard
	 */
	var Wizard = WebComponent.extend("sap.ui.webc.fiori.Wizard", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-wizard-ui5",
			properties: {

				/**
				 * Defines the height of the control
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				}
			},
			defaultAggregation: "steps",
			aggregations: {

				/**
				 * Defines the steps. <br>
				 * <br>
				 * <b>Note:</b> Use the available <code>sap.ui.webc.fiori.WizardStep</code> component.
				 */
				steps: {
					type: "sap.ui.webc.fiori.IWizardStep",
					multiple: true
				}
			},
			events: {

				/**
				 * Fired when the step is changed by user interaction - either with scrolling, or by clicking on the steps within the component header.
				 */
				stepChange: {
					parameters: {
						/**
						 * The new step.
						 */
						step: {
							type: "HTMLElement"
						},

						/**
						 * The previous step.
						 */
						previousStep: {
							type: "HTMLElement"
						},

						/**
						 * The step change occurs due to user's click or 'Enter'/'Space' key press on step within the navigation.
						 */
						changeWithClick: {
							type: "boolean"
						}
					}
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Wizard;
});