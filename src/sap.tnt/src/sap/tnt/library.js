/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.tnt.
 */
sap.ui.define(["sap/ui/core/library", "sap/m/library"],
	function() {
	"use strict";

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
		name : "sap.tnt",
		version: "${version}",
		dependencies : ["sap.ui.core", "sap.m"],
		designtime: "sap/tnt/designtime/library.designtime",
		types: [
			"sap.tnt.RenderMode"
		],
		interfaces: [
			"sap.tnt.IToolHeader"
		],
		controls: [
			"sap.tnt.NavigationList",
			"sap.tnt.ToolHeaderUtilitySeparator",
			"sap.tnt.ToolHeader",
			"sap.tnt.SideNavigation",
			"sap.tnt.ToolPage",
			"sap.tnt.InfoLabel"
		],
		elements: [
			"sap.tnt.NavigationListItem"
		],
		extensions: {
			flChangeHandlers: {
				"sap.tnt.NavigationListItem": "sap/tnt/flexibility/NavigationListItem"
			}
		}
	});

	/**
	 * Predefined types of <code>InfoLabel</code>
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.tnt.RenderMode = {
		/**
		 * When type of the content of <code>InfoLabel</code> is numeric paddings are narrow
		 * @public
		 */
		Narrow: "Narrow",

		/**
		 * When type of the content of <code>InfoLabel</code> is text padding are loose
		 * @public
		 */
		Loose: "Loose"
	};

	/**
	 * Interface for controls suitable for the <code>header</code> aggregation of {@link sap.tnt.ToolPage}.
	 *
	 * @since 1.68
	 * @name sap.tnt.IToolHeader
	 * @public
	 * @interface
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */

	return sap.tnt;

});