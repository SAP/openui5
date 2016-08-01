/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.f.
 */
sap.ui.define(['jquery.sap.global',
	'sap/ui/core/library', 'sap/m/library'], // library dependency
	function() {

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
		types: [
			"sap.f.ThreeColumnLayoutType"
		],
		interfaces: [
			"sap.f.ISnappable"
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
	 *
	 * Interface for controls which are suitable as a Header in sap.f.DynamicPage.
	 * If the control wants to get have the pin/unpin functionality, it must fire the pinUnpinPress event
	 *
	 * @since 1.38
	 * @name sap.f.ISnappable
	 * @interface
	 * @public
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * Types of three-column layout for the sap.f.FlexibleColumnLayout control
	 *
	 * @enum {string}
	 * @public
	 * @since 1.38
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.f.ThreeColumnLayoutType = {

		/**
		 * Emphasized last column (endColumn) - column layout 25/25/50
		 * @public
		 */
		EndColumnEmphasized : "EndColumnEmphasized",

		/**
		 * Emphasized middle column (midColumn) - column layout 25/50/25
		 * @public
		 */
		MidColumnEmphasized : "MidColumnEmphasized"
	};

	return sap.f;

});
