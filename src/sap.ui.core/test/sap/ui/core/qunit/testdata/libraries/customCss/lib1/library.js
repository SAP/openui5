/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library testlibs.customCss.lib1
 */
sap.ui.define([
	"sap/ui/core/Lib",
	// library dependencies
	"sap/ui/core/library",
	"sap/ui/core/Core"
], function(Library, coreLib, Core) {
	"use strict";

	// delegate further initialization of this library to the Core
	return Library.init({
		name : "testlibs.customCss.lib1",
		dependencies : ["sap.ui.core"],
		types: [
		],
		interfaces: [
		],
		controls: [
		],
		elements: [
		],
		version: "1.2.3"
	});
});
