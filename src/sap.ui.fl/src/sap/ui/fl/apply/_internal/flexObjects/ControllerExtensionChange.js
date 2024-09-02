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
	 * Flexibility ControllerExtensionChange class.
	 *
	 * @param {object} mPropertyBag - Initial object properties
	 *
	 * @class ControllerExtensionChange instance
	 * @extends sap.ui.fl.apply._internal.flexObjects.FlexObject
	 * @alias sap.ui.fl.apply._internal.flexObjects.ControllerExtensionChange
	 * @since 1.105
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var ControllerExtensionChange = FlexObject.extend("sap.ui.fl.apply._internal.flexObjects.ControllerExtensionChange", /** @lends sap.ui.fl.apply._internal.flexObjects.ControllerExtensionChange.prototype */ {
		metadata: {
			properties: {
				controllerName: {
					type: "string"
				}
			}
		}
	});

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * @returns {object} Mapping information
	 * @static
	 */
	ControllerExtensionChange.getMappingInfo = function() {
		return {
			...FlexObject.getMappingInfo(),
			controllerName: "selector.controllerName"
		};
	};

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * Can be overridden to avoid access of static mapping within base methods.
	 * @returns {object} Mapping information
	 */
	ControllerExtensionChange.prototype.getMappingInfo = function() {
		return ControllerExtensionChange.getMappingInfo();
	};

	// ----------------- temporary functions -----------------
	// The controller extension is still treated like a normal UI Change.
	// This functions should be removed as soon as this is not the case anymore.
	ControllerExtensionChange.prototype.getSelector = function() {
		return {
			controllerName: this.getControllerName()
		};
	};
	ControllerExtensionChange.prototype.getVariantReference = function() {
		return undefined;
	};
	ControllerExtensionChange.prototype.isValidForDependencyMap = function() {
		return false;
	};
	ControllerExtensionChange.prototype.setInitialApplyState = function() {
	};
	// addXML also uses getModuleName, but as soon as those changes are also migrated getFlexObjectMetadata().moduleName can be used
	ControllerExtensionChange.prototype.getModuleName = function() {
		return this.getFlexObjectMetadata().moduleName;
	};

	// /temporary functions

	return ControllerExtensionChange;
});
