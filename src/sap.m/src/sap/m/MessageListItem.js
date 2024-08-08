/*!
 * ${copyright}
 */

// Provides control sap.m.MessageListItem.
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/message/MessageType",
	"./library",
	'./StandardListItem',
	'./Link',
	"./MessageListItemRenderer"
],
	function(Library, InvisibleText, MessageType, library, StandardListItem, Link, MessageListItemRenderer) {
		"use strict";

		// shortcut for sap.m.ListType
		var ListType = library.ListType;

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
		 */
		var MessageListItem = StandardListItem.extend("sap.m.MessageListItem", /** @lends sap.m.MessageListItem.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					activeTitle: { type: "boolean", group: "Misc", defaultValue: false},
					messageType: { type: "sap.ui.core.MessageType", group: "Appearance", defaultValue: MessageType.Error }
				},
				aggregations: {
					link: { type: "sap.m.Link", group: "Misc", multiple: false },
					linkAriaDescribedBy: {type: "sap.ui.core.Control", group: "Misc", multiple: false}
				},
				events: {
					activeTitlePress: {}
				}
			},

			renderer: MessageListItemRenderer
		});

		MessageListItem.prototype.onBeforeRendering = function () {
			StandardListItem.prototype.onBeforeRendering.apply(this, arguments);
			var oLink = this.getLink(), oDescribedByText;

			if (!oLink && this.getActiveTitle()) {
				oLink = new Link({
					press: [this.fireActiveTitlePress, this]

				});
				this.setLink(oLink);
			}

			//prevent unneeded creation of sap.ui.core.InvisibleText
			if (oLink && !oLink.getAriaDescribedBy().length) {
				oDescribedByText = this._getLinkAriaDescribedBy();

				oLink.setText(this.getTitle());
				oLink.addAriaDescribedBy(oDescribedByText.getId());
				this.setLinkAriaDescribedBy(oDescribedByText);
			}
		};

		MessageListItem.prototype._getLinkAriaDescribedBy = function () {
			var sAccessibilityText = Library.getResourceBundleFor("sap.m").getText("MESSAGE_VIEW_LINK_FOCUS_TEXT_" + this.getMessageType().toUpperCase());

			return new InvisibleText(this.getId() + "-link", {
				text: sAccessibilityText
			});
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

		MessageListItem.prototype.getContentAnnouncement = function(oBundle) {
			var sAnnouncement = StandardListItem.prototype.getContentAnnouncement.apply(this, arguments),
				sAdditionalTextLocation, sAdditionalTextDescription, sMessageType;

			if (this.getActiveTitle()) {
				sMessageType = this.getMessageType().toUpperCase();
				sAdditionalTextLocation = oBundle.getText("MESSAGE_LIST_ITEM_FOCUS_TEXT_LOCATION_" + sMessageType);
				sAdditionalTextDescription = this.getType() === ListType.Navigation ? oBundle.getText("MESSAGE_LIST_ITEM_FOCUS_TEXT_DESCRIPTION") : "";

				sAnnouncement += ". ".concat(sAdditionalTextLocation, ". ", sAdditionalTextDescription);
			}
			return sAnnouncement;
		};

		/**
		 * Returns item's title dom ref
		 *
		 * @returns {HTMLElement} Dom Ref of the list item's title
		 * @public
		 */
		MessageListItem.prototype.getTitleRef = function () {
			var bActiveTitle = this.getActiveTitle();
			var sDescription = this.getDescription();

			if (bActiveTitle) {
				return this.getDomRef().querySelector(".sapMLnkText");
			}

			if (sDescription) {
				return this.getDomRef().querySelector(".sapMSLITitle");
			}

			return this.getDomRef().querySelector(".sapMSLITitleOnly");
		};

		return MessageListItem;

	});
