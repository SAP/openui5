/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/getVariantAuthor",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObject"
], function(
	getVariantAuthor,
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
				 * Indicates whether variant is shown as favorite in the variants list.
				 */
				favorite: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Indicates whether variant is shown in the variant list.
				 */
				visible: {
					type: "boolean",
					defaultValue: true
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
				},
				/**
				 * Variant author
				 */
				author: {
					type: "string"
				}
			}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			FlexObject.apply(this, aArgs);

			if (!this.getVariantId()) {
				this.setVariantId(this.getId());
			}
			if (!this.getAuthor()) {
				this.setAuthor(getVariantAuthor(this.getSupportInformation().user, this.getLayer(), {}));
			}
		}
	});

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * @returns {object} Mapping information
	 * @static
	 */
	Variant.getMappingInfo = function() {
		return {
			...FlexObject.getMappingInfo(),
			favorite: "favorite",
			executeOnSelection: "executeOnSelection",
			contexts: "contexts"
		};
	};

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * Can be overridden to avoid access of static mapping within base methods.
	 * @returns {object} Mapping information
	 */
	Variant.prototype.getMappingInfo = function() {
		return Variant.getMappingInfo();
	};

	/**
	 * Retrieves the variant name from the <code>texts</code> FlexObject property
	 * @returns {string} Variant name
	 */
	Variant.prototype.getName = function() {
		return this.getText("variantName");
	};

	/**
	 * Sets the variant name on the corresponding <code>texts</code> FlexObject property
	 * @param {string} sName - Variant name
	 * @param {boolean} [bSkipStateChange] - If set to <code>true</code>, doesn't set the state to dirty
	 */
	Variant.prototype.setName = function(sName, bSkipStateChange) {
		this.setText("variantName", sName, "XFLD", bSkipStateChange);
	};

	/**
	 * Retrieves information whether the variant has at least one context.
	 * @returns {boolean} true if variant has at least one context else false
	 */
	Variant.prototype.hasContexts = function() {
		var oContexts = this.getContexts();
		var aContextKeys = Object.keys(oContexts);
		return aContextKeys.some(function(sContextKey) {
			return oContexts[sContextKey].length > 0;
		});
	};
	return Variant;
});
