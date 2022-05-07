/*
 * ! ${copyright}
 */

sap.ui.define([
	"../util/PropertyHelper"
], function(
	PropertyHelperBase
) {
	"use strict";

	/**
	 * Constructor for a new table property helper.
	 *
	 * @param {object[]} aProperties The properties to process in this helper
	 * @param {sap.ui.base.ManagedObject} [oParent] A reference to an instance that will act as the parent of this helper
	 *
	 * @class
	 * Table property helpers give tables of this library a consistent and standardized view on properties and their attributes.
	 * Validates the given properties, sets defaults, and provides utilities to work with these properties.
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
    var PropertyHelper = PropertyHelperBase.extend("sap.ui.mdc.chart.PropertyHelper");

	PropertyHelper.prototype.prepareProperty = function(oProperty) {
		PropertyHelperBase.prototype.prepareProperty.apply(this, arguments);
		oProperty.isAggregatable = function() {

			if (oProperty) {
				return oProperty.isComplex() ? false : oProperty.aggregatable;
			}
		};
	};

	/**
     * Gets all aggregatable properties.
     *
     * @returns {object[]} All aggregatable properties
     * @public
     */
    PropertyHelper.prototype.getAllAggregatableProperties = function() {
        return this.getProperties().filter(function(oProperty) {
            return oProperty.isAggregatable();
        });
    };

    return PropertyHelper;

});