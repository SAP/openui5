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
	 * @class
	 * @extends sap.ui.webc.common.WebComponent
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.Card</code> is a component that represents information in the form of a tile with separate header and content areas. The content area of a <code>sap.ui.webc.main.Card</code> can be arbitrary HTML content. The header can be used through several properties, such as: <code>titleText</code>, <code>subtitleText</code>, <code>status</code> and two slots: <code>avatar</code> and <code>action</code>.
	 *
	 * <h3>Keyboard handling</h3> In case you enable <code>headerInteractive</code> property, you can press the <code>sap.ui.webc.main.Card</code> header by Space and Enter keys.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.Card</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>title - Used to style the title of the card</li>
	 *     <li>subtitle - Used to style the subtitle of the card</li>
	 *     <li>status - Used to style the status of the card</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimantal Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Card
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Card = WebComponent.extend("sap.ui.webc.main.Card", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-card-ui5",
			properties: {

				/**
				 * Defines if the component header would be interactive, e.g gets hover effect, gets focused and <code>headerPress</code> event is fired, when it is pressed.
				 */
				headerInteractive: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the height of the control
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: null,
					mapping: "style"
				},

				/**
				 * Defines the status displayed in the component header. <br>
				 * <br>
				 * <b>Note:</b> If the <code>action</code> slot is set, the <code>status</code> will not be displayed, you can either have <code>action</code>, or <code>status</code>.
				 */
				status: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the subtitle displayed in the component header.
				 */
				subtitleText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the title displayed in the component header.
				 */
				titleText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: null,
					mapping: "style"
				}
			},
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Defines an action, displayed in the right most part of the header. <br>
				 * <br>
				 * <b>Note:</b> If set, the <code>status</code> text will not be displayed, you can either have <code>action</code>, or <code>status</code>.
				 */
				action: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "action"
				},

				/**
				 * Defines the visual representation in the header of the card. Supports images and icons. <br>
				 * <br>
				 * <b>Note:</b> SAP-icons font provides numerous options. To find all the available icons, see the <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
				 */
				avatar: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "avatar"
				},

				/**
				 * Defines the content of the component.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			},
			events: {

				/**
				 * Fired when the component header is activated by mouse/tap or by using the Enter or Space key. <br>
				 * <br>
				 * <b>Note:</b> The event would be fired only if the <code>headerInteractive</code> property is set to true.
				 */
				headerClick: {}
			}
		}
	});

	return Card;
});