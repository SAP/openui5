/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.SegmentedButton.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/SegmentedButton"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>SegmentedButton</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.webc.common.WebComponent
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.SegmentedButton</code> shows a group of buttons. When the user clicks or taps one of the buttons, it stays in a pressed state. It automatically resizes the buttons to fit proportionally within the component. When no width is set, the component uses the available width. <br>
	 * <br>
	 * <b>Note:</b> There can be just one selected <code>button</code> at a time.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimantal Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.SegmentedButton
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SegmentedButton = WebComponent.extend("sap.ui.webc.main.SegmentedButton", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-segmented-button-ui5",
			defaultAggregation: "buttons",
			aggregations: {

				/**
				 * Defines the buttons of component. <br>
				 * <br>
				 * <b>Note:</b> Multiple buttons are allowed. <br>
				 * <br>
				 * <b>Note:</b> Use the <code>sap.ui.webc.main.ToggleButton</code> for the intended design.
				 */
				buttons: {
					type: "sap.ui.webc.main.IButton",
					multiple: true
				}
			},
			events: {

				/**
				 * Fired when the selected button changes.
				 */
				selectionChange: {
					parameters: {
						/**
						 * the pressed button.
						 */
						selectedButton: {
							type: "HTMLElement"
						}
					}
				}
			},
			getters: ["selectedButton"]
		}
	});

	/**
	 * Returns the currently selected button.
	 * @public
	 * @name sap.ui.webc.main.SegmentedButton#getSelectedButton
	 * @function
	 */

	return SegmentedButton;
});