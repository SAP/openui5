/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.TimelineItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/TimelineItem"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>TimelineItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * An entry posted on the timeline.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.TimelineItem
	 * @implements sap.ui.webc.fiori.ITimelineItem
	 */
	var TimelineItem = WebComponent.extend("sap.ui.webc.fiori.TimelineItem", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-timeline-item-ui5",
			interfaces: [
				"sap.ui.webc.fiori.ITimelineItem"
			],
			properties: {

				/**
				 * Defines the icon to be displayed as graphical element within the <code>sap.ui.webc.fiori.TimelineItem</code>. SAP-icons font provides numerous options. <br>
				 * <br>
				 *
				 *
				 * See all the available icons in the {@link demo:sap/m/demokit/iconExplorer/webapp/index.html Icon Explorer}.
				 */
				icon: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the name of the item, displayed before the <code>title-text</code>.
				 */
				name: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines if the <code>name</code> is clickable.
				 */
				nameClickable: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the subtitle text of the component.
				 */
				subtitleText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the title text of the component.
				 */
				titleText: {
					type: "string",
					defaultValue: ""
				}
			},
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Determines the description of the <code>sap.ui.webc.fiori.TimelineItem</code>.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			},
			events: {

				/**
				 * Fired when the item name is pressed either with a click/tap or by using the Enter or Space key. <br>
				 * <br>
				 * <b>Note:</b> The event will not be fired if the <code>name-clickable</code> attribute is not set.
				 */
				nameClick: {
					parameters: {}
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return TimelineItem;
});