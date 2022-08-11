/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.RatingIndicator.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"./thirdparty/RatingIndicator"
], function(WebComponent, library, EnabledPropagator) {
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
	 * <h3>Keyboard Handling</h3> When the <code>sap.ui.webc.main.RatingIndicator</code> is focused, the user can change the rating with the following keyboard shortcuts: <br>
	 *
	 *
	 *
	 * <ul>
	 *     <li>[RIGHT/UP] - Increases the value of the rating by one step. If the highest value is reached, does nothing</li>
	 *     <li>[LEFT/DOWN] - Decreases the value of the rating by one step. If the lowest value is reached, does nothing.</li>
	 *     <li>[HOME] - Sets the lowest value.</li>
	 *     <li>[END] - Sets the highest value.</li>
	 *     <li>[SPACE/ENTER/RETURN] - Increases the value of the rating by one step. If the highest value is reached, sets the rating to the lowest value.</li>
	 *     <li>Any number - Changes value to the corresponding number. If typed number is larger than the number of values, sets the highest value.</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.RatingIndicator
	 * @implements sap.ui.core.IFormContent
	 */
	var RatingIndicator = WebComponent.extend("sap.ui.webc.main.RatingIndicator", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-rating-indicator-ui5",
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
				 * The event is fired when the value changes.
				 */
				change: {
					parameters: {}
				}
			},
			designtime: "sap/ui/webc/main/designtime/RatingIndicator.designtime"
		}
	});

	EnabledPropagator.call(RatingIndicator.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return RatingIndicator;
});