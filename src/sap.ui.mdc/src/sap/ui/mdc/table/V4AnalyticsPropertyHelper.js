/*!
 * ${copyright}
 */

sap.ui.define([
	"./PropertyHelper"
], (
	TablePropertyHelper
) => {
	"use strict";

	/**
	 * Constructor for a new table property helper for V4 analytics.
	 *
	 * @param {sap.ui.mdc.odata.v4.TablePropertyInfo[]} aProperties
	 *     The properties to process in this helper
	 * @param {sap.ui.base.ManagedObject} [oParent]
	 *     A reference to an instance that will act as the parent of this helper
	 *
	 * @class
	 * @extends sap.ui.mdc.table.PropertyHelper
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.85
	 * @alias sap.ui.mdc.table.V4AnalyticsPropertyHelper
	 */
	const PropertyHelper = TablePropertyHelper.extend("sap.ui.mdc.table.V4AnalyticsPropertyHelper", {
		constructor: function(aProperties, oParent) {
			this._bEnableAggregatableAttribute = true;
			TablePropertyHelper.call(this, aProperties, oParent, {
				technicallyGroupable: {
					type: "boolean",
					"default": {
						value: "attribute:groupable"
					},
					inComplexProperty: {
						valueIfNotAllowed: false
					}
				},
				technicallyAggregatable: {
					type: "boolean",
					"default": {
						value: "attribute:aggregatable"
					},
					inComplexProperty: {
						valueIfNotAllowed: false
					}
				},
				customAggregate: {
					type: {
						contextDefiningProperties: { type: "PropertyReference[]" }
					}
				}
			});
		}
	});

	/**
	 * @inheritDoc
	 */
	PropertyHelper.prototype.validateProperty = function(oProperty, aProperties, aPreviousProperties) {
		TablePropertyHelper.prototype.validateProperty.apply(this, arguments);

		if (oProperty.groupable && oProperty.extension && oProperty.extension.technicallyGroupable === false) {
			throw new Error("Invalid property definition: A property cannot be groupable when not technically groupable.\n" + oProperty);
		}
		if (oProperty.aggregatable && oProperty.extension && oProperty.extension.technicallyAggregatable === false) {
			throw new Error("Invalid property definition: A property cannot be aggregatable when not technically aggregatable.\n" + oProperty);
		}
	};

	/**
	 * @inheritDoc
	 */
	PropertyHelper.prototype.prepareProperty = function(oProperty, mProperties) {
		TablePropertyHelper.prototype.prepareProperty.apply(this, arguments);

		Object.defineProperty(oProperty, "getAggregatableProperties", {
			value: function() {
				return oProperty.getSimpleProperties().filter((oProperty) => {
					return oProperty.aggregatable;
				});
			}
		});
	};

	/**
	 * Gets all aggregatable properties.
	 *
	 * @returns {sap.ui.mdc.odata.v4.TablePropertyInfo[]} All aggregatable properties
	 * @public
	 */
	PropertyHelper.prototype.getAggregatableProperties = function() {
		return this.getProperties().filter((oProperty) => {
			return oProperty.aggregatable;
		});
	};

	/**
	 * Converts the properties to the format expected by the <code>sap.ui.table.plugins.V4Aggregation</code> plugin.
	 *
	 * @returns {Object[]} Converted property information.
	 * @private
	 */
	PropertyHelper.prototype.getPropertiesForPlugin = function() {
		return this.getProperties().reduce((aProperties, oProperty) => {
			if (oProperty.isComplex()) {
				return aProperties;
			}

			const oPropertyForPlugin = {
				key: oProperty.key,
				path: oProperty.path,
				isKey: oProperty.isKey,
				text: oProperty.text,
				unit: oProperty.unit,
				groupable: oProperty.extension.technicallyGroupable,
				aggregatable: oProperty.extension.technicallyAggregatable
			};

			if (oProperty.extension.customAggregate) {
				oPropertyForPlugin.aggregationDetails = {
					customAggregate: {
						contextDefiningProperties: oProperty.extension.customAggregate.contextDefiningProperties
					}
				};
			}

			aProperties.push(oPropertyForPlugin);

			return aProperties;
		}, []);
	};

	return PropertyHelper;
});