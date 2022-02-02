/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.IllustratedMessage.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/IllustratedMessage"
], function(WebComponent, library) {
	"use strict";

	var IllustrationMessageType = library.IllustrationMessageType;

	/**
	 * Constructor for a new <code>IllustratedMessage</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> An IllustratedMessage is a recommended combination of a solution-oriented message, an engaging illustration, and conversational tone to better communicate an empty or a success state than just show a message alone.
	 *
	 * Each illustration has default internationalised title and subtitle texts. Also they can be managed with <code>titleText</code> and <code>subtitleText</code> properties.
	 *
	 *
	 * <h3>Structure</h3> The IllustratedMessage consists of the following elements, which are displayed below each other in the following order: <br>
	 *
	 * <ul>
	 *     <li>Illustration</li>
	 *     <li>Title</li>
	 *     <li>Subtitle</li>
	 *     <li>Actions</li>
	 * </ul>
	 *
	 * <h3>Usage</h3> <code>sap.ui.webc.fiori.IllustratedMessage</code> is meant to be used inside container component, for example a <code>sap.ui.webc.main.Card</code>, a <code>sap.ui.webc.main.Dialog</code> or a <code>sap.ui.webc.fiori.Page</code>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.95.0
	 * @experimental Since 1.95.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.IllustratedMessage
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var IllustratedMessage = WebComponent.extend("sap.ui.webc.fiori.IllustratedMessage", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-illustrated-message-ui5",
			properties: {

				/**
				 *
				 */
				name: {
					type: "sap.ui.webc.fiori.IllustrationMessageType",
					defaultValue: IllustrationMessageType.BeforeSearch
				},

				/**
				 * Defines the subtitle of the component. <br>
				 * <br>
				 * <b>Note:</b> Using this property, the default subtitle text of illustration will be overwritten. <br>
				 * <br>
				 * <b>Note:</b> Using <code>subtitle</code> slot, the default of this property will be overwritten.
				 */
				subtitleText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the title of the component. <br>
				 * <br>
				 * <b>Note:</b> Using this property, the default title text of illustration will be overwritten.
				 */
				titleText: {
					type: "string",
					defaultValue: ""
				}
			},
			defaultAggregation: "actions",
			aggregations: {

				/**
				 * Defines the component actions.
				 */
				actions: {
					type: "sap.ui.webc.main.IButton",
					multiple: true
				},

				/**
				 * Defines the subtitle of the component. <br>
				 * <br>
				 * <b>Note:</b> Using this slot, the default subtitle text of illustration and the value of <code>subtitleText</code> property will be overwritten.
				 */
				subtitle: {
					type: "sap.ui.core.Control",
					multiple: false,
					slot: "subtitle"
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return IllustratedMessage;
});