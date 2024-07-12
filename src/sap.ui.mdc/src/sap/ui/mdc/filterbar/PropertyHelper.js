/*!
 * ${copyright}
 */

sap.ui.define([
	"../util/PropertyHelper"
], (
	PropertyHelperBase
) => {
	"use strict";

	/**
	 * Constructor for a new {@link sap.ui.mdc.FilterBar FilterBar} control property helper.
	 *
	 * @param {object[]} aProperties
	 *     The properties to process in this helper
	 * @param {sap.ui.base.ManagedObject} [oParent]
	 *     A reference to an instance that will act as the parent of this helper
	 *
	 * @class
	 * The {@link sap.ui.mdc.FilterBar FilterBar} control property helper provides a consistent and standardized view of properties and their attributes.
	 * Validates the given properties, sets default values, and provides utilities to work with these properties.
	 * The utilities can only be used for properties that are known to the helper. Known properties are all those that are passed to the constructor.
	 *
	 * @extends sap.ui.mdc.util.PropertyHelper
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.95
	 * @alias sap.ui.mdc.filterbar.PropertyHelper
	 */
	const PropertyHelper = PropertyHelperBase.extend("sap.ui.mdc.filterbar.PropertyHelper", {
		constructor: function(aProperties, oParent) {
			PropertyHelperBase.call(this, aProperties, oParent, {
				required: { // Whether there must be a filter condition for this property before firing a "search" event.
					type: "boolean"
				},
				hiddenFilter: { // Name of the property indicating if the filter is never to be shown on the UI.
					type: "boolean"
				}
			});
		}
	});


	/**
	 * Applies default values and resolves property references.
	 *
	 * @param {object} oProperty The passed property
	 * @protected
	 */
	PropertyHelper.prototype.prepareProperty = function(oProperty) {

		if (!oProperty.typeConfig) {

			const oParent = this.getParent();
			if (oParent && oParent._oDelegate) {
				const oTypeUtil = oParent._oDelegate.getTypeMap(oParent);
				try {
					oProperty.typeConfig = oTypeUtil.getTypeConfig(oProperty.dataType, oProperty.formatOptions, oProperty.constraints);
				} catch (ex) {
					//
				}
			}
		}

		PropertyHelperBase.prototype.prepareProperty.apply(this, arguments);
	};

	return PropertyHelper;
});