/*!
 * ${copyright}
 */

sap.ui.define([
	"../util/PropertyHelper", "sap/ui/mdc/library"
], function(
	PropertyHelperBase,
	MDCLib
) {
	"use strict";

	/**
	 * Constructor for a new chart property helper.
	 *
	 * @param {object[]} aProperties The properties to process in this helper
	 * @param {sap.ui.base.ManagedObject} [oParent] A reference to an instance that will act as the parent of this helper
	 *
	 * @class
	 * Chart property helpers give charts of this library a consistent and standardized view on properties and their attributes.
	 * Property helpers validate the given properties, set default values, and provides utilities to work with these properties.
	 * The utilities can only be used for properties that are known to the helper. Known properties are all those that are passed to the constructor.
	 *
	 * @extends sap.ui.mdc.util.PropertyHelper
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 * @since 1.83
	 * @alias sap.ui.mdc.chart.PropertyHelper
	 */
    var PropertyHelper = PropertyHelperBase.extend("sap.ui.mdc.chart.PropertyHelper", {
		constructor: function(aProperties, oParent) {
			PropertyHelperBase.call(this, aProperties, oParent, {
				filterable: true,
				sortable: true
			});
		}
	});

	PropertyHelper.prototype.prepareProperty = function(oProperty) {
		if (oProperty.groupable) {
			oProperty.availableRoles = this._getLayoutOptionsForType("groupable");
			oProperty.kind = "Groupable";
		} else if (oProperty.aggregatable) {
			oProperty.availableRoles = this._getLayoutOptionsForType("aggregatable");
			oProperty.kind = "Aggregatable";
		}

		if (!oProperty.typeConfig && oProperty.dataType){
			var oFormatOptions = oProperty.formatOptions ? oProperty.formatOptions : null;
			var oConstraints = oProperty.constraints ? oProperty.constraints : {};

			oProperty.typeConfig = this.getParent().getControlDelegate().getTypeUtil().getTypeConfig(oProperty.dataType, oFormatOptions, oConstraints);
		}

		PropertyHelperBase.prototype.prepareProperty.apply(this, arguments);

		oProperty.isAggregatable = function() {

			if (oProperty) {
				return oProperty.isComplex() ? false : oProperty.aggregatable;
			}
		};
	};

		/**
		 * This returns the layout options for a specific type of Item (measure/dimension,groupable/aggregatable)
		 * It is used by p13n to determine which layout options to show in the p13n panel
		 * @param {string} sType the type for which the layout options are requested
		 */
		PropertyHelper.prototype._getLayoutOptionsForType = function(sType){
		var MDCRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		var oAvailableRoles = {
			groupable: [
				{
					key: MDCLib.ChartItemRoleType.category,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_CATEGORY')
				}, {
					key: MDCLib.ChartItemRoleType.category2,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_CATEGORY2')
				}, {
					key: MDCLib.ChartItemRoleType.series,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_SERIES')
				}
			],
			aggregatable: [
				{
					key: MDCLib.ChartItemRoleType.axis1,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS1')
				}, {
					key: MDCLib.ChartItemRoleType.axis2,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS2')
				}, {
					key: MDCLib.ChartItemRoleType.axis3,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS3')
				}
			]
		};
		return oAvailableRoles[sType];
	};

	/**
     * Gets all properties with aggregatable flag set to <code>true</code>.
     *
     * @returns {object[]} All properties with aggregatable flag set to <code>true</code>.
     * @public
     */
    PropertyHelper.prototype.getAllAggregatableProperties = function() {
        return this.getProperties().filter(function(oProperty) {
            return oProperty.isAggregatable();
        });
    };

    return PropertyHelper;

});