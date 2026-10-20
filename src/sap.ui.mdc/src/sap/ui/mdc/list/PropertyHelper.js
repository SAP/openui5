/*!
 * ${copyright}
 */

sap.ui.define([
	"../util/ListTablePropertyHelper"
], (
	PropertyHelperBase
) => {
	"use strict";

	/**
	 * Constructor for a new list property helper.
	 *
	 * @param {object[]} aProperties
	 *     The properties to process in this helper
	 * @param {sap.ui.base.ManagedObject} [oParent]
	 *     A reference to an instance that will act as the parent of this helper
	 *
	 * @class
	 * List property helpers in this SAPUI5 library provide lists with consistent and standardized structure of properties and their attributes.
	 * Validates the given properties, sets defaults, and provides utilities to work with these properties.
	 * The utilities can only be used for properties that are known to the helper. Known properties are all those that are passed to the constructor.
	 *
	 * @extends sap.ui.mdc.util.ListTablePropertyHelper
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.153
	 * @alias sap.ui.mdc.list.PropertyHelper
	 */
	const PropertyHelper = PropertyHelperBase.extend("sap.ui.mdc.list.PropertyHelper", {
		constructor: function(aProperties, oParent) {
			PropertyHelperBase.call(this, aProperties, oParent);
		}
	});

	/**
	 * @inheritDoc
	 */
	PropertyHelper.prototype.prepareProperty = function(oProperty, mProperties) {
		PropertyHelperBase.prototype.prepareProperty.apply(this, arguments);

		// typeConfig is required for filter handling and, for simple properties, derived from the dataType.
		if (!oProperty.typeConfig && oProperty.dataType && this.getParent()) {
			const oTypeUtil = this.getParent().getControlDelegate().getTypeMap();
			oProperty.typeConfig = oTypeUtil.getTypeConfig(oProperty.dataType, oProperty.formatOptions, oProperty.constraints);
		}
	};

	return PropertyHelper;
});
