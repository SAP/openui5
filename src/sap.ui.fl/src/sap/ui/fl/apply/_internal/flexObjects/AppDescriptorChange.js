/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObject"
], function(
	DescriptorChangeTypes,
	FlexObject
) {
	"use strict";

	/**
	 * Flexibility AppDescriptorChange Class. Changes a specified part of the manifest.
	 *
	 * @class Flexibility AppDescriptor Change Class.
	 * @extends sap.ui.fl.apply._internal.flexObjects.FlexObject
	 * @alias sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange
	 * @since 1.105
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	var AppDescriptorChange = FlexObject.extend("sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange", /* @lends sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange.prototype */ {
		metadata: {
			properties: {
				appDescriptorChange: {
					type: "boolean",
					defaultValue: true
				}
			}
		}
	});

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * @returns {object} Mapping information
	 * @static
	 */
	AppDescriptorChange.getMappingInfo = function() {
		return { ...FlexObject.getMappingInfo(), appDescriptorChange: "appDescriptorChange" };
	};

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * Can be overridden to avoid access of static mapping within base methods.
	 * @returns {object} Mapping information
	 */
	AppDescriptorChange.prototype.getMappingInfo = function() {
		return AppDescriptorChange.getMappingInfo();
	};

	/**
	 * Returns the ID to be used by the condenser.
	 * @returns {string} ID for condensing
	 */
	AppDescriptorChange.prototype.getIdForCondensing = function() {
		return `appDescriptor_${this.getFlexObjectMetadata().reference}`;
	};

	AppDescriptorChange.prototype.canBeCondensed = function() {
		return DescriptorChangeTypes.getCondensableChangeTypes().includes(this.getChangeType());
	};

	// ----------------- temporary functions -----------------
	// The AppDescriptorChange is treated like a normal UI Change.
	// This functions should be removed as soon as this is not the case anymore.
	AppDescriptorChange.prototype.getSelector = function() {
		return {};
	};
	AppDescriptorChange.prototype.isValidForDependencyMap = function() {
		return false;
	};
	AppDescriptorChange.prototype.getVariantReference = function() {
		return undefined;
	};

	// /temporary functions

	return AppDescriptorChange;
});