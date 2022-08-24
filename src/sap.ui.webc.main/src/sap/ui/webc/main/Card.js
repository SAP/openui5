/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Card.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/Card"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>Card</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.Card</code> is a component that represents information in the form of a tile with separate header and content areas. The content area of a <code>sap.ui.webc.main.Card</code> can be arbitrary HTML content. The header can be used through slot <code>header</code>. For which there is a <code>sap.ui.webc.main.CardHeader</code> component to achieve the card look and fill.
	 *
	 * Note: We recommend the usage of <code>sap.ui.webc.main.CardHeader</code> for the header slot, so advantage can be taken for keyboard handling, styling and accessibility.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/::part CSS Shadow Parts} allow developers to style elements inside the Shadow DOM.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Card
	 */
	var Card = WebComponent.extend("sap.ui.webc.main.Card", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-card-ui5",
			properties: {

				/**
				 * Defines the accessible name of the component, which is used as the name of the card region and should be unique per card. <b>Note:</b> <code>accessibleName</code> should be always set, unless <code>ariaLabelledBy</code> is set.
				 */
				accessibleName: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the height of the control
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				}
			},
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Defines the content of the component.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				},

				/**
				 * Defines the header of the component. <br>
				 * <br>
				 * <b>Note:</b> Use <code>sap.ui.webc.main.CardHeader</code> for the intended design.
				 */
				header: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "header"
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
			designtime: "sap/ui/webc/main/designtime/Card.designtime"
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Card;
});