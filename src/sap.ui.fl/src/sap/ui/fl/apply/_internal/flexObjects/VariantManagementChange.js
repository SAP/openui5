/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObject"
], function(
	JsControlTreeModifier,
	FlexObject
) {
	"use strict";

	/**
	 * Flexibility VariantManagementChange Class
	 *
	 * @class Flexibility VariantManagementChange Change Class.
	 * @extends sap.ui.fl.apply._internal.flexObjects.FlexObject
	 * @alias sap.ui.fl.apply._internal.flexObjects.VariantManagementChange
	 * @since 1.135
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	const VariantManagementChange = FlexObject.extend("sap.ui.fl.apply._internal.flexObjects.VariantManagementChange", {
		metadata: {
			properties: {
				/**
				 * Reference to the VariantManagement control
				 */
				selector: {
					type: "object",
					defaultValue: {}
				}
			}
		},

		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			FlexObject.apply(this, aArgs);
			this.setFileType("ctrl_variant_management_change");
		}
	});

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * @returns {object} Mapping information
	 * @static
	 */
	VariantManagementChange.getMappingInfo = function() {
		return {
			...FlexObject.getMappingInfo(),
			selector: "selector"
		};
	};

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * Can be overridden to avoid access of static mapping within base methods.
	 * @returns {object} Mapping information
	 */
	VariantManagementChange.prototype.getMappingInfo = function() {
		return VariantManagementChange.getMappingInfo();
	};

	/**
	 * Returns the ID to be used for condensing.
	 *
	 * @param {object} oCondenserInfo - Condenser information returned from the change handler
	 * @param {sap.ui.core.Component} oAppComponent - Application component
	 * @returns {string} ID for condensing
	 */
	VariantManagementChange.prototype.getIdForCondensing = function(oCondenserInfo, oAppComponent) {
		return JsControlTreeModifier.getControlIdBySelector(this.getSelector(), oAppComponent);
	};

	VariantManagementChange.prototype.canBeCondensed = function() {
		return true;
	};

	return VariantManagementChange;
});
