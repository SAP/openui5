/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.tnt.
 */
sap.ui.define([
	"./IllustratedMessageType",
	"sap/ui/base/DataType",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/m/library"],
	function(IllustratedMessageType, DataType, Library) {
	"use strict";

	/**
	 * SAPUI5 library with controls specialized for administrative applications.
	 *
	 * @namespace
	 * @alias sap.tnt
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.36
	 * @public
	 */
	var thisLib = Library.init({
		apiVersion: 2,
		name : "sap.tnt",
		version: "${version}",
		dependencies : ["sap.ui.core", "sap.m"],
		designtime: "sap/tnt/designtime/library.designtime",
		types: [
			"sap.tnt.IllustratedMessageType",
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
			"sap.tnt.NavigationListItem",
			"sap.tnt.NavigationListGroup"
		],
		extensions: {
			flChangeHandlers: {
				"sap.tnt.NavigationList": "sap/tnt/flexibility/NavigationList",
				"sap.tnt.NavigationListItem": "sap/tnt/flexibility/NavigationListItem",
				"sap.tnt.NavigationListGroup": "sap/tnt/flexibility/NavigationListGroup"
			}
		}
	});

	thisLib.IllustratedMessageType = IllustratedMessageType;

	/**
	 * Predefined types of <code>InfoLabel</code>
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.RenderMode = {
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

	// Register all above defined enums.
	DataType.registerEnum("sap.tnt.RenderMode", thisLib.RenderMode);

	/**
	 * Interface for controls suitable for the <code>header</code> aggregation of {@link sap.tnt.ToolPage}.
	 *
	 * @since 1.68
	 * @name sap.tnt.IToolHeader
	 * @public
	 * @interface
	 */

	return thisLib;

});