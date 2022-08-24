/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.suite.
 */
sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], // library dependency
	function(Core) {

	"use strict";

	/**
	 * Suite controls library.
	 *
	 * @namespace
	 * @alias sap.ui.suite
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.1
	 * @public
	 */
	var thisLibrary = sap.ui.getCore().initLibrary({
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
	 */
	thisLibrary.TaskCircleColor = {

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

	return thisLibrary;

});