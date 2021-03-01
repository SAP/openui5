/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.webc.common
 */
sap.ui.define([
		"sap/ui/core/library",
		"sap/ui/base/DataType",
		"./Icons",
		"./thirdparty/base/features/OpenUI5Support",
		"./thirdparty/base/AssetRegistry",
		"./thirdparty/base/CustomElementsScope"
	],
	function(coreLibrary, DataType, Icons, OpenUI5Support, AssetRegistry, CustomElementsScope) {

	"use strict";

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.webc.common",
		version: "${version}",
		dependencies : ["sap.ui.core"],
		noLibraryCSS: true,
		designtime: "sap/ui/webc/common/designtime/library.designtime",
		interfaces: [
		],
		types: [
		],
		controls: [
			"sap.ui.webc.common.WebComponent"
		],
		elements: [
		],
		extensions: {
		}
	});

	/**
	 * SAPUI5 lib
	 *
	 * @namespace
	 * @alias sap.ui.webc.common
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */
	var thisLib = sap.ui.webc.common;

	CustomElementsScope.setCustomElementsScopingSuffix("ui5");

	return thisLib;
});
