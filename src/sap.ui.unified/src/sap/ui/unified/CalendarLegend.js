/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.CalendarLegend.
sap.ui.define([
	'sap/ui/core/Control',
	'./library',
	'sap/ui/Device',
	'./CalendarLegendRenderer',
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/ui/unified/CalendarLegendItem"
],
	function(Control, library, Device, CalendarLegendRenderer, Log, jQuery, CalendarLegendItem) {
	"use strict";

	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = library.CalendarDayType;

	// shortcut for sap.ui.unified.StandardCalendarLegendItem
	var StandardCalendarLegendItem = library.StandardCalendarLegendItem;

	/**
	 * Constructor for a new CalendarLegend.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A legend for the Calendar Control. Displays special dates colors with their corresponding description. The aggregation specialDates can be set herefor.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.24.0
	 * @alias sap.ui.unified.CalendarLegend
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CalendarLegend = Control.extend("sap.ui.unified.CalendarLegend", /** @lends sap.ui.unified.CalendarLegend.prototype */ {
		metadata: {

			library: "sap.ui.unified",
			properties: {
				/**
				 * Determines the standard items related to the calendar days, such as, today, selected, working and non-working.
				 * Values must be one of <code>sap.ui.unified.StandardCalendarLegendItem</code>.
				 * Note: for versions 1.50 and 1.52, this property was defined in the subclass <code>sap.m.PlanningCalendarLegend</code>
				 * @since 1.54
				 */
				standardItems: {type: "string[]", group: "Misc", defaultValue: ['Today', 'Selected', 'WorkingDay', 'NonWorkingDay']},

				/**
				 * Defines the width of the created columns in which the items are arranged.
				 */
				columnWidth: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: '120px'}
			},
			aggregations: {

				/**
				 * Items to be displayed.
				 */
				items: {type: "sap.ui.unified.CalendarLegendItem", multiple: true, singularName: "item"},

				// holds a reference to all standard items in the given format, which will be eventually rendered.
				_standardItems: {type: "sap.ui.unified.CalendarLegendItem", multiple: true, visibility: "hidden"}
			},
			designtime: "sap/ui/unified/designtime/CalendarLegend.designtime"
		},

		constructor: function (vId, mSettings) {
			Control.prototype.constructor.apply(this, arguments);

			if (typeof vId !== "string"){
				mSettings = vId;
			}

			if (!mSettings || (mSettings && !mSettings.standardItems)) {
				this._addStandardItems(this.getStandardItems()); // Default items should be used if nothing is given
			}

			//don't render standardItems unless it's a PC legend
			this._bShouldRenderStandardItems = true;
		}
	});

	CalendarLegend.prototype.setStandardItems = function (aValues) {
		var i;

		if (aValues && aValues.length === 1 && aValues[0] === "") { // [""] - when standardItems="" in XML view
			aValues = [];
		}

		if (aValues && aValues.length) {
			aValues = this.validateProperty("standardItems", aValues);
			for (i = 0; i < aValues.length; i++) { // we use loop instead forEach in order to interrupt the execution in case of exception
				if (!StandardCalendarLegendItem[aValues[i]]) {
					throw new Error("Invalid value '" + aValues[i] +
						"'. Property standardItems must contain values from sap.ui.unified.StandardCalendarLegendItem.");
				}
			}
		}

		this.setProperty("standardItems", aValues);
		this._addStandardItems(this.getStandardItems(), true);
		return this;
	};

	/**
	 * Populates the standard items.
	 * @param {string[]|sap.ui.unified.StandardCalendarLegendItem[]} aStandardItems array of items specified by their key
	 * @param {boolean} [replace=false] Replaces previous standard items
	 * @private
	 * @since 1.50
	 */
	CalendarLegend.prototype._addStandardItems = function(aStandardItems, replace) {
		var i,
			rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified"),
			sId = this.getId();

		if (replace) {
			this.destroyAggregation("_standardItems");
		}

		for (i = 0; i < aStandardItems.length; i++) {
			var oItem = new CalendarLegendItem(sId + "-" + aStandardItems[i], {
				text: rb.getText(CalendarLegend._Standard_Items_TextKeys[aStandardItems[i]])
			});
			this.addAggregation("_standardItems", oItem);
		}
	};

	CalendarLegend._Standard_Items_TextKeys = {
		"Today": "LEGEND_TODAY",
		"Selected": "LEGEND_SELECTED",
		"WorkingDay": "LEGEND_NORMAL_DAY",
		"NonWorkingDay": "LEGEND_NON_WORKING_DAY"
	};

	/**
	 * Gets the corresponding type from the calendar legend or the next free type if the item itself has no type.
	 * @param {sap.ui.unified.CalendarLegendItem} oItem One of the items from the items aggregation
	 * @param {sap.ui.unified.CalendarLegendItem[]} aItems Items to match against their types
	 * @returns {string} Corresponding type from the calendar legend or the next free type if the item itself has no type
	 * @private
	 */
	CalendarLegend.prototype._getItemType = function(oItem, aItems) {
		var sType = oItem.getType(),
			iNoTypeItemIndex,
			aFreeTypes;

		if (sType && sType !== CalendarDayType.None) {
			return sType;
		}

		aFreeTypes = this._getUnusedItemTypes(aItems);
		iNoTypeItemIndex = aItems.filter(function(item) {
			return !item.getType() || item.getType() === CalendarDayType.None;
		}).indexOf(oItem);

		if (iNoTypeItemIndex < 0) {
			Log.error('Legend item is not in the legend', this);
			return sType;
		}

		if (aFreeTypes[iNoTypeItemIndex]) {
			sType = aFreeTypes[iNoTypeItemIndex];
		} else {
			// Till 1.48 there were Type01-Type10 and type "None". Type "None" is the first element in the array, so
			// it does not count in the calculations needed below but with the new enum type "NonWorking" we have to
			// subtract 1 in order to find the correct "Type" number.
			sType = "Type" + (Object.keys(CalendarDayType).length + iNoTypeItemIndex - aFreeTypes.length - 1); // event type is not defined, maybe application styled it
		}

		return sType;
	};

	/**
	 * Gets the first legend item that is of a given type.
	 * @param {string|sap.ui.unified.CalendarDayType} sType The type of the wanted legend item
	 * @returns {sap.ui.unified.CalendarLegendItem} A legend item
	 * @private
	 */
	CalendarLegend.prototype._getItemByType = function(sType) {
		var oItem,
			aItems = this.getItems(),
			i;

		for (i = 0; i < aItems.length; i++) {
			if (this._getItemType(aItems[i], aItems) === sType) {
				oItem = aItems[i];
				break;
			}
		}

		return oItem;
	};

	/**
	 * Gets all types that have no items.
	 * @returns {Array} Types that have no items
	 * @private
	 */
	CalendarLegend.prototype._getUnusedItemTypes = function(aItems) {
		var oFreeTypes = jQuery.extend({}, CalendarDayType),
			sType,
			i;

		delete oFreeTypes[CalendarDayType.None];
		delete oFreeTypes[CalendarDayType.NonWorking];

		//remove types that are used
		for (i = 0; i < aItems.length; i++) {
			sType = aItems[i].getType();
			if (oFreeTypes[sType]) {
				delete oFreeTypes[sType];
			}
		}

		return Object.keys(oFreeTypes);
	};

	return CalendarLegend;

});