/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.RatingIndicator.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/RatingIndicator"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>RatingIndicator</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The Rating Indicator is used to display a specific number of icons that are used to rate an item. Additionally, it is also used to display the average and overall ratings.
	 *
	 * <h3>Usage</h3> The recommended number of icons is between 5 and 7.
	 *
	 * <h3>Responsive Behavior</h3> You can change the size of the Rating Indicator by changing its <code>font-size</code> CSS property. <br>
	 * Example: <code>&lt;ui5-rating-indicator style="font-size: 3rem;">&lt;/ui5-rating-indicator></code>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.RatingIndicator
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var RatingIndicator = WebComponent.extend("sap.ui.webc.main.RatingIndicator", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-rating-indicator-ui5",
			properties: {

				/**
				 * Sets the accessible aria name of the component.
				 */
				accessibleName: {
					type: "string"
				},

				/**
				 * Defines whether the component is disabled.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> A disabled component is completely noninteractive.
				 */
				disabled: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * The number of displayed rating symbols.
				 */
				max: {
					type: "int",
					defaultValue: 5
				},

				/**
				 * Defines whether the component is read-only. <br>
				 * <br>
				 * <b>Note:</b> A read-only component is not editable, but still provides visual feedback upon user interaction.
				 */
				readonly: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * The indicated value of the rating. <br>
				 * <br>
				 * <b>Note:</b> If you set a number which is not round, it would be shown as follows:
				 * <ul>
				 *     <li>1.0 - 1.2 -> 1</li>
				 *     <li>1.3 - 1.7 -> 1.5</li>
				 *     <li>1.8 - 1.9 -> 2</li>
				 *     <ul>
				 */
				value: {
					type: "float",
					defaultValue: 0
				}
			},
			events: {

				/**
				 * The event is fired when the value changes.
				 */
				change: {
					parameters: {}
				}
			},
			designtime: "sap/ui/webc/main/designtime/RatingIndicator.designtime"
		}
	});

	return RatingIndicator;
});