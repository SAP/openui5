/*!
 * ${copyright}
 */

sap.ui.define([
	"./PropertyHelper",
	"../util/PropertyHelper"
], (
	TablePropertyHelper,
	PropertyHelperBase
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
						contextDefiningProperties: {type: "PropertyReference[]"}
					}
				},
				additionalProperties: {type: "PropertyReference[]"}
			});
		}
	});

	/**
	 * @inheritDoc
	 */
	PropertyHelper.prototype.validateProperty = function(oProperty, aProperties, aPreviousProperties) {
		TablePropertyHelper.prototype.validateProperty.apply(this, arguments);

		if (oProperty.groupable && oProperty.extension?.technicallyGroupable === false) {
			PropertyHelperBase.throwInvalidPropertyError("A property cannot be groupable when not technically groupable.", oProperty);
		}
		if (oProperty.aggregatable && oProperty.extension?.technicallyAggregatable === false) {
			PropertyHelperBase.throwInvalidPropertyError("A property cannot be aggregatable when not technically aggregatable.", oProperty);
		}

		const bGroupable = (oProperty.groupable || oProperty.extension?.technicallyGroupable) === true;
		const bAggregatable = (oProperty.aggregatable || oProperty.extension?.technicallyAggregatable) === true;

		if (oProperty.isKey) {
			if (!bGroupable) {
				PropertyHelperBase.reportInvalidProperty("A key property must be technically groupable.", oProperty);
			}
			if (bAggregatable) {
				PropertyHelperBase.throwInvalidPropertyError("A key property must not be technically aggregatable.", oProperty);
			}
		}

		const aAdditionalProperties = oProperty.extension?.additionalProperties ?? [];

		if (!bGroupable && !bAggregatable && aAdditionalProperties.length > 0) {
			PropertyHelperBase.throwInvalidPropertyError("'additionalProperties' must not contain property keys if the property is neither"
				+ " technically groupable nor technically aggregatable.", oProperty);
		}

		if (bGroupable && !bAggregatable) {
			if (aAdditionalProperties.length > 1) {
				PropertyHelperBase.throwInvalidPropertyError("'additionalProperties' contains more than one property.", oProperty);
			}
			if (aAdditionalProperties.length === 1) {
				if (!aProperties.some((oOtherProperty) => {
					const getKey = (oProperty) => oProperty.key || oProperty.name;
					return oProperty.extension.additionalProperties[0] === getKey(oOtherProperty) && oOtherProperty.text === getKey(oProperty);
				})) {
					PropertyHelperBase.throwInvalidPropertyError("The property in 'additionalProperties' does not reference this property in"
						+ " 'text'.", oProperty);
				}
			}
		}

		if (aAdditionalProperties.length > 0) {
			if (aAdditionalProperties.includes(oProperty.text)) {
				PropertyHelperBase.throwInvalidPropertyError("'additionalProperties' must not contain the text.", oProperty);
			}
			if (aAdditionalProperties.includes(oProperty.unit)) {
				PropertyHelperBase.throwInvalidPropertyError("'additionalProperties' must not contain the unit.", oProperty);
			}
		}

		const oAllAdditionalProperties = new Set(aAdditionalProperties);
		for (const sAdditionalPropertyKey of oAllAdditionalProperties) {
			const oAdditionalProperty = aProperties.find((oProperty) => {
				return oProperty.key === sAdditionalPropertyKey || oProperty.name === sAdditionalPropertyKey;
			});
			const aAdditionalAdditionalProperties = oAdditionalProperty.extension?.additionalProperties ?? [];
			for (const sAdditionalAdditionalPropertyKey of aAdditionalAdditionalProperties) {
				oAllAdditionalProperties.add(sAdditionalAdditionalPropertyKey);
			}
		}
		if (oAllAdditionalProperties.difference(new Set(aAdditionalProperties)).size > 0) {
			PropertyHelperBase.throwInvalidPropertyError("All nested additional properties must be listed at root level.", oProperty);
		}
	};

	/**
	 * @inheritDoc
	 */
	PropertyHelper.prototype.prepareProperty = function(oProperty, mProperties) {
		TablePropertyHelper.prototype.prepareProperty.apply(this, arguments);

		// TODO: Don't do that for aggregatable properties - the additionalProperties are meant to be the context-defining properties of the
		//       CustomAggregate.
		if (!PropertyHelperBase.isPropertyComplex(oProperty) && oProperty.extension.additionalProperties.length > 0) {
			oProperty.groupable = false;
		}

		Object.defineProperty(oProperty, "getAggregatableProperties", {
			value: function() {
				return oProperty.getSimpleProperties().filter((oProperty) => {
					return oProperty.aggregatable;
				});
			}
		});
	};

	return PropertyHelper;
});