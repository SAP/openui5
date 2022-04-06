/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.CardHeader.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/CardHeader"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>CardHeader</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.CardHeader</code> is a component, meant to be used as a header of the <code>sap.ui.webc.main.Card</code> component. It displays valuable information, that can be defined with several properties, such as: <code>titleText</code>, <code>subtitleText</code>, <code>status</code> and two slots: <code>avatar</code> and <code>action</code>.
	 *
	 * <h3>Keyboard handling</h3> In case you enable <code>interactive</code> property, you can press the <code>sap.ui.webc.main.CardHeader</code> by Space and Enter keys.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.Card</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>title - Used to style the title of the CardHeader</li>
	 *     <li>subtitle - Used to style the subtitle of the CardHeader</li>
	 *     <li>status - Used to style the status of the CardHeader</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.95.0
	 * @experimental Since 1.95.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.CardHeader
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CardHeader = WebComponent.extend("sap.ui.webc.main.CardHeader", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-card-header-ui5",
			properties: {

				/**
				 * Defines if the component would be interactive, e.g gets hover effect, gets focus outline and <code>click</code> event is fired, when pressed.
				 */
				interactive: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the status text.
				 */
				status: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the subtitle text.
				 */
				subtitleText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the title text.
				 */
				titleText: {
					type: "string",
					defaultValue: ""
				}
			},
			aggregations: {

				/**
				 * Defines an action, displayed in the right most part of the header.
				 */
				action: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "action"
				},

				/**
				 * Defines an avatar image, displayed in the left most part of the header.
				 */
				avatar: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "avatar"
				}
			},
			events: {

				/**
				 * Fired when the component is activated by mouse/tap or by using the Enter or Space key. <br>
				 * <br>
				 * <b>Note:</b> The event would be fired only if the <code>interactive</code> property is set to true.
				 */
				click: {
					parameters: {}
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return CardHeader;
});