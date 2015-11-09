/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.tnt.
 */
sap.ui.define(['jquery.sap.global',
	'sap/ui/core/library', 'sap/m/library'], // library dependency
	function(jQuery) {

	'use strict';

	/**
	 * SAPUI5 library with controls specialized for administrative applications.
	 *
	 * @namespace
	 * @name sap.tnt
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : 'sap.tnt',
		version: '${version}',
		dependencies : ['sap.ui.core','sap.m'],
		types: [],
		interfaces: [],
		controls: [
			'sap.tnt.NavigationList',
			'sap.tnt.ToolHeaderUtilitySeparator',
			'sap.tnt.ToolHeader',
			'sap.tnt.SideNavigation'
		],
		elements: [
			"sap.tnt.NavigationListItem"
		]
	});

	return sap.tnt;

});
