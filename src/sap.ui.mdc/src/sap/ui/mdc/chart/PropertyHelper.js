/*!
 * ${copyright}
 */

sap.ui.define([
	"../util/PropertyHelper", "sap/ui/core/Lib", "sap/ui/mdc/enums/ChartItemRoleType"
], (
	PropertyHelperBase,
	Library,
	ChartItemRoleType
) => {
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
	 * @since 1.83
	 * @alias sap.ui.mdc.chart.PropertyHelper
	 */
	const PropertyHelper = PropertyHelperBase.extend("sap.ui.mdc.chart.PropertyHelper", {
		constructor: function(aProperties, oParent) {
			PropertyHelperBase.call(this, aProperties, oParent, {
				filterable: true,
				sortable: true,
				propertyInfos: true,

				//Additional attributes
				groupable: {
					type: "boolean"
				},
				aggregatable: {
					type: "boolean"
				},
				// @deprecated since 1.121. use <code>path</code> instead.
				propertyPath: {
					type: "string"
				},
				aggregationMethod: {
					type: "string"
				},
				role: {
					type: "string"
				},
				datapoint: {
					type: "object"
				},
				criticality: {
					type: "object"
				},
				textProperty: {
					type: "string"
				},
				textFormatter : {
					type: "object"
				},
				unitPath : {
					type: "string"
				},
				timeUnitType : {
					type: "string"
				}
			});
		}
	});

	/**
	 * @inheritDoc
	 */
	PropertyHelper.prototype.prepareProperty = function(oProperty, mProperties) {
		if (!oProperty.path && oProperty.propertyPath) {
			oProperty.path = oProperty.propertyPath;
		}

		if (!oProperty.typeConfig && oProperty.dataType) {
			const oFormatOptions = oProperty.formatOptions ? oProperty.formatOptions : null;
			const oConstraints = oProperty.constraints ? oProperty.constraints : {};

			oProperty.typeConfig = this.getParent().getTypeMap().getTypeConfig(oProperty.dataType, oFormatOptions, oConstraints);
		}

		PropertyHelperBase.prototype.prepareProperty.apply(this, arguments);

		oProperty.isAggregatable = function() {

			if (oProperty) {
				return oProperty.isComplex() ? false : oProperty.aggregatable;
			}
		};
	};

	/**
	 * Gets all properties with aggregatable flag set to <code>true</code>.
	 *
	 * @returns {object[]} All properties with aggregatable flag set to <code>true</code>.
	 * @public
	 */
	PropertyHelper.prototype.getAllAggregatableProperties = function() {
		return this.getProperties().filter((oProperty) => {
			return oProperty.isAggregatable();
		});
	};

	return PropertyHelper;

});