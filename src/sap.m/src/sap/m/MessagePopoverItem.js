/*!
 * ${copyright}
 */

// Provides control sap.m.MessagePopoverItem.
sap.ui.define(["jquery.sap.global", "./library", "sap/ui/core/Item"],
	function(jQuery, library, Item) {
		"use strict";

		/**
		 * Constructor for a new MessagePopoverItem.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * Items provide information about Error Messages in the page.
		 * @extends sap.ui.core.Element
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.28
		 * @alias sap.m.MessagePopoverItem
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var MessagePopoverItem = Item.extend("sap.m.MessagePopoverItem", /** @lends sap.m.MessagePopoverItem.prototype */ {
				metadata: {
					library: "sap.m",
					properties: {
						/**
						 * Specifies the type of the message
						 */
						type: { type: "sap.ui.core.MessageType", group: "Appearance", defaultValue: sap.ui.core.MessageType.Error },

						/**
						 * Specifies the title of the message
						 */
						title: { type: "string", group: "Appearance", defaultValue: "" },

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
						longtextUrl: { type: "sap.ui.core.URI", group: "Behavior", defaultValue: null }
					}
				}
			});

		MessagePopoverItem.prototype.setProperty = function (sPropertyName, oValue, bSuppressInvalidate) {
			// BCP: 1670235674
			// MessagePopoverItem acts as a proxy to StandardListItem
			// So, we should ensure if something is changed in MessagePopoverItem, it would be propagated to the StandardListItem
			var oParent = this.getParent(),
				sType = this.getType().toLowerCase(),
				// Blacklist properties. Some properties have already been set and shouldn't be changed in the StandardListItem
				aPropertiesNotToUpdateInList = ["description"],
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

			return Item.prototype.setProperty.apply(this, arguments);
		};

		MessagePopoverItem.prototype.setDescription = function(sDescription) {
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

		return MessagePopoverItem;

	}, /* bExport= */true);
