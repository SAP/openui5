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
	 * Constructor for a new p13n property helper for compatibility with sap.ui.comp.
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
	 * @extends sap.ui.mdc.util.PropertyHelper
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 * @since 1.85
	 * @alias sap.ui.mdc.p13n.PropertyHelper
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PropertyHelper = PropertyHelperBase.extend("sap.ui.mdc.p13n.PropertyHelper", {
		constructor: function(aProperties, mExtensions, oParent, mExtensionAttributeMetadata) {
			// Because this helper does not validate, this is only required for setting defaults.
			var aAdditionalAttributes = ["filterable", "sortable"];
			PropertyHelperBase.call(this, aProperties, mExtensions, oParent, aAdditionalAttributes, mExtensionAttributeMetadata);
		}
	});

	/**
	 * This helper does not validate properties.
	 *
	 * @override
	 */
	PropertyHelper.prototype.validateProperties = function() {};

	PropertyHelper.prototype.prepareProperty = function(oProperty) {
		PropertyHelperBase.prototype.prepareProperty.apply(this, arguments);
		oProperty.label = oProperty.label || oProperty.name; // label is optional in comp, but required in mdc
	};

	return PropertyHelper;
});