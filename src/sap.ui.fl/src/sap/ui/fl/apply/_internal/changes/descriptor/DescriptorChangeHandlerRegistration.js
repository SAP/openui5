
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddLibrary"
], function(
	AddLibrary
) {
	"use strict";

	/**
	 * Loads and registers all change handlers
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.DescriptorChangeHandlerRegistration
	 * @experimental
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var DescriptorChangeHandlerRegistration = {
		appdescr_ui5_addLibraries: AddLibrary
	};
	return DescriptorChangeHandlerRegistration;
}, true);