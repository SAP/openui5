/*
 * ! ${copyright}
 */

sap.ui.define([
	"./PropertyHelper"
], function(
	TablePropertyHelper
) {
	"use strict";

	/**
	 * Constructor for a new table property helper for V4 analytics.
	 *
	 * @param {object[]} aProperties The properties to process in this helper
	 * @param {sap.ui.base.ManagedObject} [oParent] A reference to an instance that will act as the parent of this helper
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PropertyHelper = TablePropertyHelper.extend("sap.ui.mdc.table.V4AnalyticsPropertyHelper", {
		constructor: function(aProperties, oParent) {
			TablePropertyHelper.call(this, aProperties, oParent, {
				defaultAggregate: {
					type: {
						contextDefiningProperties: {type: "PropertyReference[]"}
					}
				}
			});
		}
	});

	/**
	 * @inheritDoc
	 * @override
	 */
	PropertyHelper.prototype.onCreatePropertyFacade = function(oFacade) {
		var sPropertyName = oFacade.getName();
		var that = this;

		TablePropertyHelper.prototype.onCreatePropertyFacade.apply(this, arguments);

		["isAggregatable", "getAggregatableProperties", "getDefaultAggregate"].forEach(function(sMethod) {
			Object.defineProperty(oFacade, sMethod, {
				value: function() {
					return that[sMethod].call(that, sPropertyName);
				}
			});
		});
	};

	function getExtensionAttribute(oPropertyHelper, sPropertyName, sAttributeName) {
		var oRawProperty = oPropertyHelper.getRawProperty(sPropertyName);
		return oRawProperty ? oRawProperty.extension[sAttributeName] : null;
	}

	/**
	 * Checks whether a property is aggregatable.
	 *
	 * @param {string} sName Name of a property
	 * @returns {boolean|null} Whether the property is aggregatable, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.isAggregatable = function(sName) {
		return this.hasProperty(sName) ? this.getDefaultAggregate(sName) !== null : null;
	};

	/**
	 * Gets all aggregatable properties referenced by a complex property. For convenience, a non-complex property can be given that is then
	 * returned if it is aggregatable.
	 *
	 * @param {string} sName Name of a property
	 * @returns {object[]} The aggregatable properties
	 * @public
	 */
	PropertyHelper.prototype.getAggregatableProperties = function(sName) {
		var oProperty = this.getProperty(sName);
		var aProperties = [];

		if (oProperty) {
			aProperties = oProperty.isComplex() ? oProperty.getReferencedProperties() : [oProperty];
		}

		return aProperties.filter(function(oProperty) {
			return oProperty.isAggregatable();
		});
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

	/**
	 * Gets the information about the default aggregate.
	 *
	 * @param {string} sName Name of a property
	 * @returns {{unit: (object|null), contextDefiningProperties: object[]}|null}
	 *     The default aggregate, or <code>null</code> if the property has no default aggregate or is unknown
	 * @public
	 */
	PropertyHelper.prototype.getDefaultAggregate = function(sName) {
		var mDefaultAggregate = getExtensionAttribute(this, sName, "defaultAggregate");

		if (!mDefaultAggregate) {
			return null;
		}

		return {
			contextDefiningProperties: mDefaultAggregate._contextDefiningProperties || [],
			unit: this.getUnitProperty(sName)
		};
	};

	return PropertyHelper;
});