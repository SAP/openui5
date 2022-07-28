/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.SplitButton.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"./thirdparty/SplitButton"
], function(WebComponent, library, EnabledPropagator) {
	"use strict";

	var ButtonDesign = library.ButtonDesign;

	/**
	 * Constructor for a new <code>SplitButton</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * <code>sap.ui.webc.main.SplitButton</code> enables users to trigger actions. It is constructed of two separate actions - default action and arrow action that can be activated by clicking or tapping, or by pressing certain keyboard keys - <code>Space</code> or <code>Enter</code> for default action, and <code>Arrow Down</code> or <code>Arrow Up</code> for arrow action.
	 *
	 * <h3>Usage</h3>
	 *
	 * <code>sap.ui.webc.main.SplitButton</code> consists two separate buttons:
	 * <ul>
	 *     <li>for the first one (default action) you can define some <code>text</code> or an <code>icon</code>, or both. Also, it is possible to define different icon for active state of this button - <code>activeIcon</code>.</li>
	 *     <li>the second one (arrow action) contains only <code>slim-arrow-down</code> icon.</li>
	 * </ul> You can choose a <code>design</code> from a set of predefined types (the same as for ui5-button) that offer different styling to correspond to the triggered action. Both text and arrow actions have the same design. <br>
	 * <br>
	 * You can set the <code>sap.ui.webc.main.SplitButton</code> as enabled or disabled. Both parts of an enabled <code>sap.ui.webc.main.SplitButton</code> can be pressed by clicking or tapping it, or by certain keys, which changes the style to provide visual feedback to the user that it is pressed or hovered over with the mouse cursor. A disabled <code>sap.ui.webc.main.SplitButton</code> appears inactive and any of the two buttons cannot be pressed.
	 *
	 * <h3>Keyboard Handling</h3>
	 * <ul>
	 *     <li><code>Space</code> or <code>Enter</code> - triggers the default action</li>
	 *     <li><code>Shift</code> or <code>Escape</code> - if <code>Space</code> is pressed, releases the default action button without triggering the click event.</li>
	 *     <li><code>Arrow Down</code>, <code>Arrow Up</code>, <code>Alt</code>+<code>Arrow Down</code>, <code>Alt</code>+<code>Arrow Up</code>, or <code>F4</code> - triggers the arrow action There are separate events that are fired on activating of <code>sap.ui.webc.main.SplitButton</code> parts:
	 *         <ul>
	 *             <li><code>click</code> for the first button (default action)</li>
	 *             <li><code>arrow-click</code> for the second button (arrow action)</li>
	 *         </ul>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.99.0
	 * @experimental Since 1.99.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.SplitButton
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SplitButton = WebComponent.extend("sap.ui.webc.main.SplitButton", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-split-button-ui5",
			properties: {

				/**
				 * Defines the accessible aria name of the component.
				 */
				accessibleName: {
					type: "string"
				},

				/**
				 * Defines the icon to be displayed in active state as graphical element within the component.
				 */
				activeIcon: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the component design.
				 *
				 * <br>
				 * <br>
				 * <b>The available values are:</b>
				 *
				 *
				 * <ul>
				 *     <li><code>Default</code></li>
				 *     <li><code>Emphasized</code></li>
				 *     <li><code>Positive</code></li>
				 *     <li><code>Negative</code></li>
				 *     <li><code>Transparent</code></li>
				 *     <li><code>Attention</code></li>
				 * </ul>
				 */
				design: {
					type: "sap.ui.webc.main.ButtonDesign",
					defaultValue: ButtonDesign.Default
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
				 * Defines the icon to be displayed as graphical element within the component. The SAP-icons font provides numerous options. <br>
				 * <br>
				 * Example:
				 *
				 * See all the available icons in the {@link demo:sap/m/demokit/iconExplorer/webapp/index.html Icon Explorer}.
				 */
				icon: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the content of the control
				 */
				text: {
					type: "string",
					defaultValue: "",
					mapping: "textContent"
				}
			},
			events: {

				/**
				 * Fired when the user clicks on the arrow action.
				 */
				arrowClick: {
					parameters: {}
				},

				/**
				 * Fired when the user clicks on the default action.
				 */
				click: {
					parameters: {}
				}
			}
		}
	});

	EnabledPropagator.call(SplitButton.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return SplitButton;
});