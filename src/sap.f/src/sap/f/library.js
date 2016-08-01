/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.f.
 */
sap.ui.define(['jquery.sap.global',
	'sap/ui/core/library', 'sap/m/library'], // library dependency
	function(jQuery) {

	'use strict';

	/**
	 * SAPUI5 library with controls specialized for Fiori applications.
	 *
	 * @namespace
	 * @name sap.f
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : 'sap.f',
		version: '${version}',
		dependencies : ['sap.ui.core','sap.m'],
		types: [],
		interfaces: [],
		controls: [],
		elements: []
	});

	return sap.f;

});
