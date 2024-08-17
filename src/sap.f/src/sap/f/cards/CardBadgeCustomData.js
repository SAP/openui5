/*!
 * ${copyright}
 */

// Provides element sap.f.cards.CardBadgeCustomData.
sap.ui.define([
	'sap/ui/core/CustomData',
	'sap/f/library',
	'sap/ui/core/library'
], function(CustomData, library,coreLibrary) {
	"use strict";

	const CardBadgeVisibilityMode = library.CardBadgeVisibilityMode,
		IndicationColor = coreLibrary.IndicationColor;

	/**
	 * Constructor for a new <code>CardBadgeCustomData</code> element.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 *
	 * @class
	 * Contains a single key/value pair of custom data attached to an <code>Element</code>.
	 *
	 * For more information, see {@link sap.ui.core.Element#data Element.prototype.data}
	 * and {@link topic:91f0c3ee6f4d1014b6dd926db0e91070 Custom Data - Attaching Data Objects to Controls}.
	 *
	 * @extends sap..ui.core.CustomData
	 * @since 1.128
	 *
	 * @public
	 * @alias sap.f.cards.CardBadgeCustomData
	 */

	var CardBadgeCustomData = CustomData.extend("sap.f.cards.CardBadgeCustomData", {
		metadata: {
			properties: {

				/**
				 * Icon URI. This may be either an icon font or image path.
				 * @since 1.128
				 */
				icon: {type: "sap.ui.core.URI", group: "Data", defaultValue: null},

				/**
				 * Describes the corresponding visibility mode, see also {@link sap.f.CardBadgeVisibilityMode}.
				 * @since 1.128
				 */
				visibilityMode: {type: "sap.f.CardBadgeVisibilityMode", group: "Data", defaultValue: CardBadgeVisibilityMode.Disappear},

				/**
				 * Defines the color of the badge.
				 * The allowed values are from the enum type <code>sap.ui.core.IndicationColor</code>.
				 * Additionally values from <code>sap.ui.core.ValueState</code> can be used, but this is not recommended by design guidelines.
				 * @since 1.128
				 */
				state: {type : "string", group : "Misc", defaultValue : IndicationColor.Indication05},

				/**
				 * Defines the cards badge visibility.
				 * @since 1.128
				 */
				visible: {type: "boolean", group: "Appearance", defaultValue: true},

				/**
				 * Defines text which will is overriding default announcement.
				 *
				 * @since 1.128
				 */
				announcementText : {type : "string", group : "Misc", defaultValue: ""}
			}
		}
	});

	CardBadgeCustomData.prototype.setVisible =  function (bVisible) {
		if (this.getVisible() === bVisible) { return this; }

		this.setProperty("visible", bVisible, true);

		this.getParent()?._updateBadgeProperty(this.getId(), "visible", bVisible);
	};

	CardBadgeCustomData.prototype.setIcon =  function (sSrc) {
		if (this.getIcon() === sSrc) { return this; }

		this.setProperty("icon", sSrc, true);

		this.getParent()?._updateBadgeProperty(this.getId(), "icon", sSrc);
	};

	CardBadgeCustomData.prototype.setState =  function (sColor) {
		if (this.getState() === sColor) { return this; }

		this.setProperty("state", sColor, true);

		this.getParent()?._updateBadgeProperty(this.getId(), "state", sColor);
	};

	CardBadgeCustomData.prototype.setValue =  function (sValue) {
		if (this.getValue() === sValue) { return this; }

		if (sValue === null || sValue === undefined) {
			sValue = "";
		}

		var sValue = sValue.toString();
		CustomData.prototype.setValue.call(this, sValue);

		this.getParent()?._updateBadgeProperty(this.getId(), "text", sValue);
	};

	CardBadgeCustomData.prototype.setAnnouncementText =  function (sValue) {
		if (this.getAnnouncementText() === sValue) { return this; }

		this.setProperty("announcementText", sValue, true);

		this.getParent()?._updateBadgeProperty(this.getId(), "stateAnnouncementText", sValue);
	};

	return CardBadgeCustomData;
});