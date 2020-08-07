/*!
 * ${copyright}
 */

// Provides element sap.m.BadgeCustomData.
sap.ui.define([
	'sap/ui/core/CustomData',
	'sap/base/Log'
], function(CustomData, Log) {
	"use strict";

	/**
	 * Constructor for a new <code>BadgeCustomData</code> element.
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
	 * @extends sap.ui.core.CustomData
	 * @since 1.80
	 *
	 * @public
	 * @alias sap.m.BadgeCustomData
	 */
	var BadgeCustomData = CustomData.extend("sap.m.BadgeCustomData", {
		metadata: {
			properties: {
				visible: {type: "boolean", group: "Appearance", defaultValue: true}
			}
		}
	});

	BadgeCustomData.prototype.init = function() {
		var oParent = this.getParent();
		if (oParent && !oParent.isA("sap.m.IBadge")) {
			Log.warning("BadgeCustomData must be attached only to controls, which implement sap.m.IBadge");
		}
	};

	/**
	 * Sets the value of BadgeCustomData and updates the Badge DOM element.
	 *
	 * @private
	 * @param {string} Value to be.
	 * @return {sap.m.BadgeCustomData} this BadgeCustomData reference for chaining.
	 */
	BadgeCustomData.prototype.setValue =  function (sValue) {
		if (this.getValue() === sValue) { return this; }
		var oParent = this.getParent();

		CustomData.prototype.setValue.call(this, sValue);
		if (oParent && typeof sValue === "string") {
			oParent.updateBadgeValue(sValue);
		}

		return this;
	};

	BadgeCustomData.prototype.setVisible =  function (bVisible) {
		if (this.getVisible() === bVisible) { return this; }

		var oParent = this.getParent();

		if (oParent) {
			oParent.updateBadgeVisibility(bVisible);
		}

		this.setProperty("visible", bVisible, true);
		return this;
	};

	/**
	 * Sets the key property of BadgeCustomData as it can be only 'badge'.
	 *
	 * @private
	 * @param {string} Key to be.
	 * @return {sap.m.BadgeCustomData} this BadgeCustomData reference for chaining.
	 */
	BadgeCustomData.prototype.setKey = function () {
		return this;
	};

	return BadgeCustomData;

});