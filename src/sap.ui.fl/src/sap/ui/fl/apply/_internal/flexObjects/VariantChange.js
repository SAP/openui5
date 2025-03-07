/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/FlexObject"
], function(
	FlexObject
) {
	"use strict";

	/**
	 * Flexibility VariantChange Class
	 *
	 * @class Flexibility VariantChange Change Class.
	 * @extends sap.ui.fl.apply._internal.flexObjects.FlexObject
	 * @alias sap.ui.fl.apply._internal.flexObjects.VariantChange
	 * @since 1.135
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	const VariantChange = FlexObject.extend("sap.ui.fl.apply._internal.flexObjects.VariantChange", {
		metadata: {
			properties: {
				/**
				 * Id of the variant
				 */
				variantId: {
					type: "string"
				}
			}
		},

		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			FlexObject.apply(this, aArgs);
			this.setFileType("ctrl_variant_change");
		}
	});

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * @returns {object} Mapping information
	 * @static
	 */
	VariantChange.getMappingInfo = function() {
		return {
			...FlexObject.getMappingInfo(),
			variantId: "selector.id"
		};
	};

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * Can be overridden to avoid access of static mapping within base methods.
	 * @returns {object} Mapping information
	 */
	VariantChange.prototype.getMappingInfo = function() {
		return VariantChange.getMappingInfo();
	};

	/**
	 * Returns the Id to be used by the condenser.
	 * @returns {string} Id for condensing
	 */
	VariantChange.prototype.getIdForCondensing = function() {
		return this.getVariantId();
	};

	VariantChange.prototype.canBeCondensed = function() {
		return true;
	};

	return VariantChange;
});
