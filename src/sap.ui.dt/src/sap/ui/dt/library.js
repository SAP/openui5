/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.dt.
 */
sap.ui.define([
    'jquery.sap.global', 
	'sap/ui/core/library'
], // library dependency
function(jQuery) {

	"use strict";

	/**
	 * DesignTime library.
	 *
	 * @namespace
	 * @name sap.ui.dt
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */
	
	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.dt",
		version: "${version}",
		dependencies : ["sap.ui.core"],
		types: [],
		interfaces: [],
		controls: [],
		elements: []
	});

	return sap.ui.dt;

});
