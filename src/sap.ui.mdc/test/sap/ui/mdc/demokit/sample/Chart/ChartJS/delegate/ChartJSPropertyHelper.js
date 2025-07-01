
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/chart/PropertyHelper", "sap/ui/mdc/enums/ChartItemRoleType"
], function(
	PropertyHelperBase,
	ChartItemRoleType
) {
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
	 * @experimental
	 * @since 1.83
	 */
    const PropertyHelper = PropertyHelperBase.extend("ChartJSPropertyHelper", {
		constructor: function(aProperties, oParent) {
			PropertyHelperBase.call(this, aProperties, oParent, {
				filterable: true,
				sortable: true,
				//propertyInfos: true,
				//Additional attributes
				groupable: {
					type: "boolean"
				},
				aggregatable: {
					type: "boolean"
				}
			});
		}
	});
	PropertyHelper.prototype.prepareProperty = function(oProperty) {
		if (oProperty.groupable) {
			oProperty.kind = "Groupable";
		} else if (oProperty.aggregatable) {
			oProperty.kind = "Aggregatable";
		}
		if (!oProperty.typeConfig && oProperty.dataType){
			const oFormatOptions = oProperty.formatOptions ? oProperty.formatOptions : null;
			const oConstraints = oProperty.constraints ? oProperty.constraints : {};
			oProperty.typeConfig = this.getParent().getTypeMap().getTypeConfig(oProperty.dataType, oFormatOptions, oConstraints);
		}
		oProperty.visible = true;  // visible is required to make the Dim/Measures visible on the ChartItemPanel
	};
    return PropertyHelper;
});
