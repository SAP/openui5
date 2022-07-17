/*!
 * ${copyright}
 */

sap.ui.define([
	"../util/PropertyHelper"
], function(
	PropertyHelperBase
) {
	"use strict";

	/**
	 * Constructor for a new filter bar property helper.
	 *
	 * @param {object[]} aProperties
	 *     The properties to process in this helper
	 * @param {Object<string, object>} [mExtensions]
	 *     Key-value map, where the key is the name of the property and the value is the extension containing mode-specific information.
	 *     The extension of a property is stored in a reserved <code>extension</code> attribute and its attributes must be specified with
	 *     <code>mExtensionAttributeMetadata</code>.
	 * @param {sap.ui.base.ManagedObject} [oParent]
	 *     A reference to an instance that will act as the parent of this helper
	 * @param {object} [mExtensionAttributeMetadata]
	 *     The attribute metadata for the model-specific property extension
	 *
	 * @class
	 * Filter bar property helpers give a consistent and standardized view on properties and their attributes.
	 * Validates the given properties, sets defaults, and provides utilities to work with these properties.
	 * The utilities can only be used for properties that are known to the helper. Known properties are all those that are passed to the constructor.
	 *
	 * @extends sap.ui.mdc.util.PropertyHelper
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 * @since 1.95
	 * @alias sap.ui.mdc.filterbar.PropertyHelper
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PropertyHelper = PropertyHelperBase.extend("sap.ui.mdc.filterbar.PropertyHelper", {
		constructor: function(aProperties, mExtensions, oParent, mExtensionAttributeMetadata) {
			var aAllowedAttributes = ["required", "hiddenFilter"];
			PropertyHelperBase.call(this, aProperties, mExtensions, oParent, aAllowedAttributes, mExtensionAttributeMetadata);
		}
	});


	/**
	 * Applies defaults and resolves property references.
	 *
	 * @param {object} oProperty The property to prepare
	 * @protected
	 */
	PropertyHelper.prototype.prepareProperty = function(oProperty) {

		if (!oProperty.typeConfig) {

			var oParent = this.getParent();
			if (oParent && oParent._oDelegate) {
				var oTypeUtil = oParent._oDelegate.getTypeUtil();
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