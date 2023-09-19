/*!
 * ${copyright}
 */

sap.ui.define([
	"./PropertyHelper"
], function(
	TablePropertyHelper
) {
	"use strict";

	/**
	 * @typedef {sap.ui.mdc.table.PropertyInfo} sap.ui.mdc.odata.v4.TablePropertyInfo
	 *
	 * An object literal describing a data property in the context of a {@link sap.ui.mdc.Table} with {@link module:sap/ui/mdc/odata/v4/TableDelegate}.
	 *
	 * When specifying the <code>PropertyInfo</code> objects in the {@link sap.ui.mdc.Table#getPropertyInfo propertyInfo} property, the following
	 * attributes need to be specified:
	 * <ul>
	 *   <li><code>name</code></li>
	 *   <li><code>path</code></li>
	 *   <li><code>dataType</code></li>
	 *   <li><code>formatOptions</code></li>
	 *   <li><code>constraints</code></li>
	 *   <li><code>maxConditions</code></li>
	 *   <li><code>caseSensitive</code></li>
	 *   <li><code>visualSettings.widthCalculation</code></li>
	 *   <li><code>propertyInfos</code></li>
	 *   <li><code>groupable</code></li>
	 *   <li><code>key</code></li>
	 *   <li><code>unit</code></li>
	 *   <li><code>text</code></li>
	 *   <li><code>aggregatable</code></li>
	 *   <li><code>extension.technicallyGroupable</code></li>
	 *   <li><code>extension.technicallyAggregatable</code></li>
	 *   <li><code>extension.customAggregate</code></li>
	 *   <li><code>extension.customAggregate.contextDefiningProperties</code></li>
	 * </ul>
	 *
	 * If the property is complex, the following attributes need to be specified:
	 * <ul>
	 *   <li><code>name</code></li>
	 *   <li><code>visualSettings.widthCalculation</code></li>
	 *   <li><code>propertyInfos</code> (all referenced properties must be specified)</li>
	 * </ul>
	 *
	 * @property {boolean} [aggregatable=false]
	 *   Defines whether a property is aggregatable.
	 * @property {Object} [extension]
	 *   Contains model-specific information.
	 * @property {boolean} [extension.technicallyGroupable=false]
	 *   If <code>groupable</code> is set to <code>false</code> to exclude it from group personalization on the UI, the UI still needs to know that
	 *   this property is groupable for data requests.
	 * @property {boolean} [technicallyAggregatable=false]
	 *   If <code>aggregatable</code> is set to <code>false</code> to exclude it from aggregate personalization on the UI, the UI still needs to know
	 *   that this property is aggregatable for data requests.
	 * @property {Object} [customAggregate]
	 *   Provide an object, it can be empty, if there is a <code>CustomAggregate</code> whose <code>Qualifier</code> is equal to the name of this
	 *   property. This enables the option to show totals if <code>aggregatable</code> is <code>true</code>.
	 * @property {string[]} [customAggregate.contextDefiningProperties]
	 *   A list of related properties (by name) that are the context-defining properties of the <code>CustomAggregate</code>.
	 *
	 * @public
	 */

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
	 * @experimental
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
					forComplexProperty: {
						valueIfNotAllowed: false
					}
				},
				technicallyAggregatable: {
					type: "boolean",
					"default": {
						value: "attribute:aggregatable"
					},
					forComplexProperty: {
						valueIfNotAllowed: false
					}
				},
				customAggregate: {
					type: {
						contextDefiningProperties: {type: "PropertyReference[]"}
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
	PropertyHelper.prototype.prepareProperty = function(oProperty) {
		TablePropertyHelper.prototype.prepareProperty.apply(this, arguments);

		Object.defineProperty(oProperty, "getAggregatableProperties", {
			value: function() {
				return oProperty.getSimpleProperties().filter(function(oProperty) {
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
		return this.getProperties().filter(function(oProperty) {
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
		return this.getProperties().reduce(function(aProperties, oProperty) {
			if (oProperty.isComplex()) {
				return aProperties;
			}

			const oPropertyForPlugin = {
				name: oProperty.name,
				path: oProperty.path,
				key: oProperty.key,
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