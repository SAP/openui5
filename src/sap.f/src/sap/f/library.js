/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.f.
 */
sap.ui.define(["jquery.sap.global",
	"sap/ui/core/library", "sap/m/library"], // library dependency
	function() {

	"use strict";

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
		name : "sap.f",
		version: "${version}",
		dependencies : ["sap.ui.core", "sap.m"],
		types: [
			"sap.f.ThreeColumnLayoutType",
			"sap.f.FlexibleColumn"
		],
		controls: [
			"sap.f.DynamicPage",
			"sap.f.DynamicPageHeader",
			"sap.f.DynamicPageTitle",
			"sap.f.FlexibleColumnLayout"
		],
		elements: []
	});

	/**
	 * Types of three-column layout for the sap.f.FlexibleColumnLayout control.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.46
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.f.ThreeColumnLayoutType = {

		/**
		 * Emphasized <code>End</code> column (25/25/50).
		 * @public
		 */
		EndColumnEmphasized : "EndColumnEmphasized",

		/**
		 * Emphasized <code>Mid</code> column (25/50/25).
		 * @public
		 */
		MidColumnEmphasized : "MidColumnEmphasized"
	};

	/**
	 * Used to reference a column in the context of a FlexibleColumnLayout.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.46
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.f.FlexibleColumn = {
		/**
		 * No column
		 * @public
		 */
		None: "None",

		/**
		 * The <code>Begin</code> column.
		 * @public
		 */
		Begin: "Begin",

		/**
		 * The <code>Mid</code> column.
		 * @public
		 */
		Mid: "Mid",

		/**
		 * The <code>End</code> column.
		 * @public
		 */
		End: "End"
	};

	sap.ui.lazyRequire("sap.f.routing.Router");
	sap.ui.lazyRequire("sap.f.routing.Target");
	sap.ui.lazyRequire("sap.f.routing.TargetHandler");
	sap.ui.lazyRequire("sap.f.routing.Targets");

	return sap.f;

});
