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
	 * @param {object[]} aProperties
	 *     The properties to process in this helper
	 * @param {Object<string, object>} [mExtensions]
	 *     Key-value map, where the key is the name of the property and the value is the extension containing mode-specific information.
	 *     The extension of a property is stored in a reserved <code>extension</code> attribute and its attributes must be specified with
	 *     <code>mExtensionAttributeMetadata</code>.
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PropertyHelper = TablePropertyHelper.extend("sap.ui.mdc.table.V4AnalyticsPropertyHelper", {
		constructor: function(aProperties, mExtensions, oParent) {
			TablePropertyHelper.call(this, aProperties, mExtensions, oParent, {
				defaultAggregate: {
					type: {
						contextDefiningProperties: {type: "PropertyReference[]"}
					}
				}
			});
		}
	});

	PropertyHelper.prototype.prepareProperty = function(oProperty) {
		TablePropertyHelper.prototype.prepareProperty.apply(this, arguments);
		oProperty.aggregatable = oProperty.extension.defaultAggregate != null;

		/**
		 * Gets all aggregatable properties referenced by the property, including the property itself if it is non-complex.
		 *
		 * @returns {object[]} The aggregatable properties
		 */
		oProperty.getAggregatableProperties = function() {
			return oProperty.getSimpleProperties().filter(function(oProperty) {
				return oProperty.aggregatable;
			});
		};
	};

	/**
	 * Gets all aggregatable properties.
	 *
	 * @returns {object[]} All aggregatable properties
	 * @public
	 */
	PropertyHelper.prototype.getAggregatableProperties = function() {
		return this.getProperties().filter(function(oProperty) {
			return oProperty.aggregatable;
		});
	};

	return PropertyHelper;
});