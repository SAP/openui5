/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.CalendarLegend.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', './library'],
	function(jQuery, Control, library) {
	"use strict";

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
	var CalendarLegend = Control.extend("sap.ui.unified.CalendarLegend", /** @lends sap.ui.unified.CalendarLegend.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Width of the columns created in which the items are arranged.
			 */
			columnWidth : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : '120px'}
		},
		aggregations : {

			/**
			 * Items to be displayed.
			 */
			items : {type : "sap.ui.unified.CalendarLegendItem", multiple : true, singularName : "item"},
			standardItems : {type : "sap.ui.unified.CalendarLegendItem", multiple : true, visibility : "hidden"}
		}
	}});

	CalendarLegend.prototype.init = function() {

		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
		var sId = this.getId();

		var oItem = new sap.ui.unified.CalendarLegendItem(sId + "-Today", {
			text: rb.getText("LEGEND_TODAY")
		});
		this.addAggregation("standardItems", oItem);

		oItem = new sap.ui.unified.CalendarLegendItem(sId + "-Selected", {
			text: rb.getText("LEGEND_SELECTED")
		});
		this.addAggregation("standardItems", oItem);

		oItem = new sap.ui.unified.CalendarLegendItem(sId + "-NormalDay", {
			text: rb.getText("LEGEND_NORMAL_DAY")
		});
		this.addAggregation("standardItems", oItem);
		oItem = new sap.ui.unified.CalendarLegendItem(sId + "-NonWorkingDay", {
			text: rb.getText("LEGEND_NON_WORKING_DAY")
		});
		this.addAggregation("standardItems", oItem);

	};

	// IE9 workaround for responsive layout of legend items
	CalendarLegend.prototype.onAfterRendering = function() {
		if (sap.ui.Device.browser.msie) {
			if (sap.ui.Device.browser.version < 10) {
				jQuery(".sapUiUnifiedLegendItem").css("width", this.getColumnWidth() + 4 + "px").css("display", "inline-block");
			}
		}
	};

	/**
	 * Gets the corresponding type from the calendar legend or the next free type if the item itself has no type.
	 * @param {sap.ui.unified.CalendarLegendItem} oItem One of the items from the items aggregation
	 * @returns {string} Corresponding type from the calendar legend or the next free type if the item itself has no type
	 * @private
	 */
	CalendarLegend.prototype._getItemType = function(oItem) {
		var aItems = this.getItems(),
			sType = oItem.getType(),
			iNoTypeItemIndex,
			aFreeTypes;

		if (sType && sType !== sap.ui.unified.CalendarDayType.None) {
			return sType;
		}

		aFreeTypes = this._getUnusedItemTypes();
		iNoTypeItemIndex = aItems.filter(function(item) {
			return !item.getType() || item.getType() === sap.ui.unified.CalendarDayType.None;
		}).indexOf(oItem);

		if (iNoTypeItemIndex < 0) {
			jQuery.sap.log.error('Legend item is not in the legend', this);
			return sType;
		}

		if (aFreeTypes[iNoTypeItemIndex]) {
			sType = aFreeTypes[iNoTypeItemIndex];
		} else {
			// Till 1.48 there were Type01-Type10 and type "None". Type "None" is the first element in the array, so
			// it does not count in the calculations needed below but with the new enum type "NonWorking" we have to
			// subtract 1 in order to find the correct "Type" number.
			sType = "Type" + (Object.keys(sap.ui.unified.CalendarDayType).length + iNoTypeItemIndex - aFreeTypes.length - 1); // event type is not defined, maybe application styled it
		}

		return sType;
	};

	/**
	 * Gets the first legend item that is of a given type.
	 * @param {string} sType
	 * @returns {sap.ui.unified.CalendarLegendItem} A legend item
	 * @private
	 */
	CalendarLegend.prototype._getItemByType = function(sType) {
		var oItem,
			aItems = this.getItems(),
			i;

		for (i = 0; i < aItems.length; i++) {
			if (this._getItemType(aItems[i]) === sType) {
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
	CalendarLegend.prototype._getUnusedItemTypes = function() {
		var oFreeTypes = jQuery.extend({}, sap.ui.unified.CalendarDayType),
			aItems = this.getItems(),
			sType,
			i;

		delete oFreeTypes[sap.ui.unified.CalendarDayType.None];
		delete oFreeTypes[sap.ui.unified.CalendarDayType.NonWorking];

		//remove types that are used
		for (i = 0; i < aItems.length; i++) {
			sType = aItems[i].getType();
			if (oFreeTypes[sType]) {
				delete oFreeTypes[sType];
			}
		}

		return Object.keys(oFreeTypes);
	};

	CalendarLegend.typeARIATexts = {};

	/**
	 * Creates and returns an invisible static label containing the translated type of the text.
	 * @param {string} sType A string in the same format as sap.ui.unified.CalendarDayType entries
	 * @returns {sap.ui.core.InvisibleText} An invisible static label containing the translated type of the text
	 * @private
	 */
	CalendarLegend.getTypeAriaText = function(sType) {
		var rb,
			sText;

		if (sType.indexOf("Type") !== 0) {
			return;
		}

		if (!CalendarLegend.typeARIATexts[sType]) {
			rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
			sText = rb.getText("LEGEND_UNNAMED_TYPE", parseInt(sType.slice(4), 10).toString());
			CalendarLegend.typeARIATexts[sType] = new sap.ui.core.InvisibleText({ text: sText });
			CalendarLegend.typeARIATexts[sType].toStatic();
		}

		return CalendarLegend.typeARIATexts[sType];
	};

	return CalendarLegend;

}, /* bExport= */ true);
