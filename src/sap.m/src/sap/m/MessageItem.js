/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global", "./library", "sap/ui/core/Item", "sap/ui/core/library"],
	function(jQuery, library, Item, coreLibrary) {
		"use strict";

		// shortcut for sap.ui.core.MessageType
		var MessageType = coreLibrary.MessageType;

		/**
		 * Constructor for a new MessageItem.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A wrapper control used to hold different types of system messages.
		 * <h3>Structure</h3>
		 * The message item holds the basic set of properties for a system message:
		 * <ul>
		 * <li> Type, title, subtitle and description </li>
		 * <li> If the description contains markup, the <code>markupDescription</code> needs to be set to true, to ensure it is interpreted correctly. </li>
		 * <li> If the long text description can be specified by a URL by setting, the <code>longtextUrl</code> property. </li>
		 * <li> The message item can have a single {@link sap.m.Link} after the description. It is stored in the <code>link</code> aggregation. </li>
		 * <h3>Usage</h3>
		 * <b>Note:</b> The MessageItem control replaces {@link sap.m.MessagePopoverItem} as a more generic wrapper for messages.
		 *
		 * @extends sap.ui.core.Item
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.46
		 * @alias sap.m.MessageItem
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */

		var MessageItem = Item.extend("sap.m.MessageItem", /** @lends sap.m.MessageItem.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * Specifies the type of the message
					 */
					type: { type: "sap.ui.core.MessageType", group: "Appearance", defaultValue: MessageType.Error },

					/**
					 * Specifies the title of the message
					 */
					title: { type: "string", group: "Appearance", defaultValue: "" },

					/**
					 * Specifies the subtitle of the message
					 * <b>Note:</b> This is only visible when the <code>title</code> property is not empty.
					 */
					subtitle : {type : "string", group : "Misc", defaultValue : null},

					/**
					 * Specifies detailed description of the message
					 */
					description: { type: "string", group: "Appearance", defaultValue: "" },

					/**
					 * Specifies if description should be interpreted as markup
					 */
					markupDescription: { type: "boolean", group: "Appearance", defaultValue: false },

					/**
					 * Specifies long text description location URL
					 */
					longtextUrl: { type: "sap.ui.core.URI", group: "Behavior", defaultValue: null },

					/**
					 * Defines the number of messages for a given message.
					 */
					counter: { type: "int", group: "Misc", defaultValue: null },

					/**
					 * Name of a message group the current item belongs to.
					 */
					groupName: { type: "string", group: "Misc", defaultValue: "" }
				},
				defaultAggregation: "link",
				aggregations: {
					/**
					 * Adds an sap.m.Link control which will be displayed at the end of the description of a message.
					 */
					link: { type: "sap.m.Link", multiple: false, singularName: "link" }
				}
			}
		});

		MessageItem.prototype.setProperty = function (sPropertyName, oValue, bSuppressInvalidate) {
			// BCP: 1670235674
			// MessageItem acts as a proxy to StandardListItem
			// So, we should ensure if something is changed in MessageItem, it would be propagated to the StandardListItem
			var oParent = this.getParent(),
				sType = this.getType().toLowerCase(),
				// Blacklist properties. Some properties have already been set and shouldn't be changed in the StandardListItem
				aPropertiesNotToUpdateInList = ["description", "type", "groupName"],
				// TODO: the '_oMessagePopoverItem' needs to be updated to proper name in the eventual sap.m.MessageView control
				fnUpdateProperty = function (sName, oItem) {
					if (oItem._oMessagePopoverItem.getId() === this.getId() && oItem.getMetadata().getProperty(sName)) {
						oItem.setProperty(sName, oValue);
					}
				};

			if (aPropertiesNotToUpdateInList.indexOf(sPropertyName) === -1 &&
				oParent && ("_bItemsChanged" in oParent) && !oParent._bItemsChanged) {

				oParent._oLists && oParent._oLists.all && oParent._oLists.all.getItems && oParent._oLists.all.getItems().forEach(fnUpdateProperty.bind(this, sPropertyName));
				oParent._oLists && oParent._oLists[sType] && oParent._oLists[sType].getItems && oParent._oLists[sType].getItems().forEach(fnUpdateProperty.bind(this, sPropertyName));
			}

			if (typeof this._updatePropertiesFn === "function") {
				this._updatePropertiesFn();
			}

			return Item.prototype.setProperty.apply(this, arguments);
		};

		/**
		 * Custom function which will be fired upon updating any property in the MessageItem
		 *
		 * @param {function} customFn The custom function to be executed
		 * @private
		 */
		MessageItem.prototype._updateProperties = function (customFn) {
			this._updatePropertiesFn = customFn;
		};

		MessageItem.prototype.setDescription = function(sDescription) {
			// Avoid showing result of '' + undefined
			if (typeof sDescription === 'undefined') {
				sDescription = '';
			}

			if (this.getMarkupDescription()) {
				sDescription = jQuery.sap._sanitizeHTML(sDescription);
			}

			this.setProperty("description", sDescription, true);

			return this;
		};

		/**
		 * Sets type of the MessageItem.
		 * <b>Note:</b> if you set the type to None it will be handled and rendered as Information.
		 *
		 * @param {sap.ui.core.MessageType} sType Type of Message
		 * @returns {sap.m.MessageItem} The MessageItem
		 * @public
		 */
		MessageItem.prototype.setType = function (sType) {
			if (sType === MessageType.None) {
				sType = MessageType.Information;
				jQuery.sap.log.warning("The provided None type is handled and rendered as Information type");
			}

			return this.setProperty("type", sType, true);
		};

		return MessageItem;
	});
