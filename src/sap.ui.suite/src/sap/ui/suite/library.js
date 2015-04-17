/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.suite.
 */
sap.ui.define(['jquery.sap.global', 
	'sap/ui/core/library'], // library dependency
	function(jQuery) {

	"use strict";

	/**
	 * Suite controls library.
	 *
	 * @namespace
	 * @name sap.ui.suite
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */
	
	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.suite",
		version: "${version}",
		dependencies : ["sap.ui.core"],
		types: [
			"sap.ui.suite.TaskCircleColor"
		],
		interfaces: [],
		controls: [
			"sap.ui.suite.TaskCircle",
			"sap.ui.suite.VerticalProgressIndicator"
		],
		elements: []
	});
	
	
	/**
	 * Defined color values for the Task Circle Control
	 *
	 * @version ${version}
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.suite.TaskCircleColor = {
	
		/**
		 * Red
		 * @public
		 */
		Red : "Red",
	
		/**
		 * Yellow
		 * @public
		 */
		Yellow : "Yellow",
	
		/**
		 * Green
		 * @public
		 */
		Green : "Green",
	
		/**
		 * Default value
		 * @public
		 */
		Gray : "Gray"
	
	};

	return sap.ui.suite;

});
