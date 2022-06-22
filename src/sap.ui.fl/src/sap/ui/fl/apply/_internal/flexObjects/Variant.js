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
	 * Base class for all variants.
	 *
	 * @class Base class for all variants
	 * @extends sap.ui.fl.apply._internal.flexObjects.FlexObject
	 * @alias sap.ui.fl.apply._internal.flexObjects.Variant
	 * @since 1.103
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	 var Variant = FlexObject.extend("sap.ui.fl.apply._internal.flexObjects.Variant", /* @lends sap.ui.fl.apply._internal.flexObjects.Variant.prototype */ {
		metadata: {
			properties: {
				/**
				 * Indicates whether favorite variants are shown in the variants list.
				 */
				favorite: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Indicates whether the variant is automatically executed.
				 */
				executeOnSelection: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Indicates whether this is a standard variant.
				 */
				standardVariant: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Defines possible variant contexts like roles.
				 */
				contexts: {
					type: "object",
					defaultValue: {}
				},
				/**
				 * Variant identifier
				 */
				variantId: {
					type: "string"
				}
			}
		},
		constructor: function() {
			FlexObject.apply(this, arguments);

			if (!this.getVariantId()) {
				this.setVariantId(this.getId());
			}
		}
	});

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * @returns {object} Mapping information
	 * @static
	 */
	Variant.getMappingInfo = function () {
		return Object.assign(FlexObject.getMappingInfo(), {
			favorite: "favorite",
			executeOnSelection: "executeOnSelection",
			standardVariant: "standardVariant",
			contexts: "contexts"
		});
	};

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * Can be overridden to avoid access of static mapping within base methods.
	 * @returns {object} Mapping information
	 */
	Variant.prototype.getMappingInfo = function () {
		return Variant.getMappingInfo();
	};

	/**
	 * Retrieves the variant name from the <code>texts</code> FlexObject property
	 * @returns {string} Variant name
	 */
	Variant.prototype.getName = function () {
		return this.getText("variantName");
	};

	/**
	 * Sets the variant name on the correponding <code>texts</code> FlexObject property
	 * @param {string} sName - Variant name
	 * @param {boolean} [bSkipStateChange] - If set to <code>true</code>, doesn't set the state to dirty
	 */
	Variant.prototype.setName = function(sName, bSkipStateChange) {
		this.setText("variantName", sName, bSkipStateChange);
	};

	return Variant;
});
