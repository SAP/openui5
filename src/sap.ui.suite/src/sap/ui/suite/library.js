/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.suite.
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Core',
	'sap/ui/core/library'], // library dependency
	function(jQuery, Core) {

	"use strict";


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

	/* eslint-disable no-undef */
	/**
	 * Suite controls library.
	 *
	 * @namespace
	 * @alias sap.ui.suite
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */
	var thisLibrary = sap.ui.suite;
	/* eslint-enable no-undef */

	/**
	 * Defined color values for the Task Circle Control
	 *
	 * @version ${version}
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
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
