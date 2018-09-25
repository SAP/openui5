/*!
 * ${copyright}
 */

// Provides control sap.m.MessageListItem.
sap.ui.define([
	"sap/ui/core/library",
	"./library",
	'./StandardListItem',
	'./Link',
	"./MessageListItemRenderer"
],
	function (coreLibrary, library, StandardListItem, Link, MessageListItemRenderer) {
		"use strict";


		/**
		 * Constructor for a new MessageListItem.
		 *
		 * @param {string} [sId] Id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * <code>sap.m.MessageListItem</code> is an extension of the <code>sap.m.StandardListItem</code> with an interactive title.
		 * @extends sap.m.StandardListItem
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @alias sap.m.MessageListItem
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var MessageListItem = StandardListItem.extend("sap.m.MessageListItem", /** @lends sap.m.MessageListItem.prototype */ {
			metadata: {

				library: "sap.m",
				properties: {
					activeTitle: { type: "boolean", group: "Misc", defaultValue: false}
				},

				aggregations: {
					link: { type: "sap.m.Link", group: "Misc", multiple: false }
				},
				events: {
					activeTitlePress: {}
				}
			}
		});

		MessageListItem.prototype.setActiveTitle = function (bActive) {
			this.setProperty("activeTitle", bActive);

			var oLink = this.getLink();

			if (!oLink && bActive) {
				this.setLink(new Link({
					press: [this.fireActiveTitlePress, this]
				}));
			}

			return this;
		};

		MessageListItem.prototype.onBeforeRendering = function () {
			StandardListItem.prototype.onBeforeRendering.apply(this, arguments);
			var oLink = this.getLink();

			if (oLink) {
				oLink.setProperty("text", this.getTitle(), true);
			}
		};

		/**
		 * Handles the ALT + Enter event
	 	 * @param {jQuery.Event} oEvent - the keyboard event.
		 * @private
		 */
		MessageListItem.prototype.onkeydown = function(oEvent) {
			if (this.getActiveTitle() && oEvent.altKey && oEvent.key === 'Enter') {
				this.fireActiveTitlePress(this);
			}
		};

		return MessageListItem;

	});
