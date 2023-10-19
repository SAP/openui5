/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.dt.
 */
sap.ui.define([
	"sap/ui/base/ManagedObjectMetadata",
	"sap/ui/core/Lib",
	"sap/ui/dt/SelectionMode",
	"sap/ui/core/library"
], function(
	ManagedObjectMetadata,
	Lib
) {
	"use strict";

	/**
	 * DesignTime library.
	 *
	 * @namespace
	 * @alias sap.ui.dt
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.30
	 * @private
	 */
	var thisLib = Lib.init({
		name: "sap.ui.dt",
		version: "${version}",
		dependencies: ["sap.ui.core"],
		types: [
			"sap.ui.dt.SelectionMode"
		],
		interfaces: [],
		controls: [],
		elements: []
	});

	ManagedObjectMetadata.setDesignTimeDefaultMapping({
		"not-adaptable": "sap/ui/dt/designtime/notAdaptable.designtime",
		"not-adaptable-tree": "sap/ui/dt/designtime/notAdaptableTree.designtime",
		"not-adaptable-visibility": "sap/ui/dt/designtime/notAdaptableVisibility.designtime",
		// legacy, should not be used anymore
		"not-removable": "sap/ui/dt/designtime/notAdaptableVisibility.designtime"
	});

	return thisLib;
});
