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
	 * Constructor for a new table property helper to be used in combination with <code>sap.ui.mdc.odata.v4.TableDelegate</code>.
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
	 * @alias sap.ui.mdc.table.ODataV4PropertyHelper
	 */
	const PropertyHelper = TablePropertyHelper.extend("sap.ui.mdc.table.ODataV4PropertyHelper", {
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
				additionalProperties: {type: "PropertyReference[]"} // TODO: Rename to "contextDefiningProperties"
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

		// TODO: Throw if two properties have the same text property

		validateKeyProperty(oProperty);
		validateAdditionalProperties(oProperty, aProperties);
	};

	function validateKeyProperty(oProperty) {
		if (!oProperty.isKey) {
			return;
		}

		const bTechnicallyGroupable = (oProperty.groupable || oProperty.extension?.technicallyGroupable) === true;
		const bTechnicallyAggregatable = (oProperty.aggregatable || oProperty.extension?.technicallyAggregatable) === true;

		if (!bTechnicallyGroupable) {
			// Key properties must be requested if aggregation on leaf-level is disabled. Non-groupable properties can't be requested.
			PropertyHelperBase.reportInvalidProperty("A key property must be technically groupable.", oProperty);
		}

		if (bTechnicallyAggregatable) {
			// Key properties must be requested by adding them to $$aggregation.group if aggregation on leaf-level is disabled. If totals need to be
			// requested for an aggregatable property, it must be in $$aggregation.aggregate, and therefore can't be in $$aggregation.group.
			PropertyHelperBase.throwInvalidPropertyError("A key property must not be technically aggregatable.", oProperty);
		}
	}

	// TODO: Reduce complexity
	// eslint-disable-next-line complexity
	function validateAdditionalProperties(oProperty, aProperties) {
		const aAdditionalPropertiesKeys = oProperty.extension?.additionalProperties ?? [];

		if (aAdditionalPropertiesKeys.length === 0) {
			return;
		}

		const bTechnicallyGroupable = (oProperty.groupable || oProperty.extension?.technicallyGroupable) === true;
		const bTechnicallyAggregatable = (oProperty.aggregatable || oProperty.extension?.technicallyAggregatable) === true;

		if (!bTechnicallyGroupable && !bTechnicallyAggregatable) {
			// Non-goupable and non-aggregatable properties can't be requested. There's no proper handling for additional properties in that case.
			PropertyHelperBase.throwInvalidPropertyError("'additionalProperties' must be empty if the property is neither technically groupable nor"
				+ " technically aggregatable.", oProperty);
		}

		if (bTechnicallyGroupable && bTechnicallyAggregatable) {
			// It is not clear whether to treat the additional properties in the context of the group or the aggregate. Could also depend on whether
			// the property is visually grouped or totals are requested for it. Might require a concept.
			PropertyHelperBase.throwInvalidPropertyError("'additionalProperties' must be empty if the property is both technically groupable and"
				+ " technically aggregatable.", oProperty);
		}

		if (oProperty.groupable) {
			// There is no concept for additional properties in case of visual grouping.
			PropertyHelperBase.throwInvalidPropertyError("'additionalProperties' must be empty if the property is groupable.",
				oProperty);
		}

		if (aAdditionalPropertiesKeys.includes(oProperty.text)) {
			// It can't be decided whether to treat the property as the text or an additional property.
			PropertyHelperBase.throwInvalidPropertyError("'additionalProperties' must not contain the text.", oProperty);
		}

		if (bTechnicallyAggregatable && aAdditionalPropertiesKeys.includes(oProperty.unit)) {
			// It can't be decided whether to treat the property as the unit or an additional property.
			PropertyHelperBase.throwInvalidPropertyError("'additionalProperties' must not contain the unit.", oProperty);
		}

		const sPropertyKey = oProperty.key || oProperty.name;
		let bSkipNestingCheck = false;

		for (const oCurrentProperty of aProperties) {
			const sCurrentPropertyKey = oCurrentProperty.key || oCurrentProperty.name;

			if (oCurrentProperty.text === sPropertyKey) {
				if (aAdditionalPropertiesKeys.some((sKey) => sKey !== sCurrentPropertyKey)) {
					// The Text is requested together with the ID, where ID is the "leading" property. If the Text has additional properties, these
					// must also be requested. The ID must contain the additional properties, not the Text.
					PropertyHelperBase.throwInvalidPropertyError("This property is the text of another property, and therefore 'additionalProperties'"
						+ " must not contain other properties than the related ID.", oProperty);
				}
				bSkipNestingCheck = true; // No need for the deep nesting check. This Text property only references the ID.
			}

			if (oCurrentProperty.unit === sPropertyKey) {
				// The unit is requested together with the amount. If the unit has additional properties, these must also be requested. They are
				// therefore also additional properties of the amount. There is no propery handling for such a relationship.
				PropertyHelperBase.throwInvalidPropertyError("This property is the unit of another property, and therefore 'additionalProperties'"
					+ " must be empty.", oProperty);
			}

			if (aAdditionalPropertiesKeys.includes(sCurrentPropertyKey)) {
				if ((oCurrentProperty.extension?.additionalProperties || []).includes(sPropertyKey)) {
					// There is no proper handling for bi-directional dependencies.
					PropertyHelperBase.throwInvalidPropertyError("An additional property must not reference this property in 'additionalProperties'.",
						oProperty);
				}

				const bTechnicallyGroupable = (oCurrentProperty.groupable || oCurrentProperty.extension?.technicallyGroupable) === true;
				if (!bTechnicallyGroupable) {
					// Additional properties are supposed to be requested. Addition properties that can't be requested are a configuration issue and
					// should not be ignored.
					PropertyHelperBase.throwInvalidPropertyError("An additional property must be technically groupable.", oProperty);
				}

				const bTechnicallyAggregatable = (oCurrentProperty.aggregatable || oCurrentProperty.extension?.technicallyAggregatable) === true;
				if (bTechnicallyAggregatable) {
					// If an additional property is aggregatable, totals could be requested for it, which requires it to be an aggregate. A meaningful
					// treatment as an additional property is then no longer possible, since it cannot be part of the grouping at the same time.
					PropertyHelperBase.throwInvalidPropertyError("An additional property must not be technically aggregatable.", oProperty);
				}
			}
		}

		if (bSkipNestingCheck) {
			return;
		}

		const oAllKeysOfAdditionalProperties = new Set(aAdditionalPropertiesKeys);
		for (const sAdditionalPropertyKey of oAllKeysOfAdditionalProperties) {
			const oAdditionalProperty = aProperties.find((oProperty) => {
				return (oProperty.key || oProperty.name) === sAdditionalPropertyKey;
			});
			for (const sAdditionalPropertyKey of oAdditionalProperty.extension?.additionalProperties ?? []) {
				oAllKeysOfAdditionalProperties.add(sAdditionalPropertyKey);
			}
		}
		if (oAllKeysOfAdditionalProperties.difference(new Set(aAdditionalPropertiesKeys)).size > 0) {
			// Deeply nested additional properties are not supported. The user is expected to list all additional properties in the dependency chain.
			PropertyHelperBase.throwInvalidPropertyError("All nested additional properties must be listed at root level.", oProperty);
		}
	}

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

	return PropertyHelper;
});