/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.geomap.
 */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/base/DataType",
	// UI5 library dependencies
	"sap/ui/core/library"
], function (Lib, DataType) {
	"use strict";

	/**
	 * SAPUI5 library with <code>sap.ui.geomap</code>
	 *
	 * <b>Note:</b> The controls in this library integrate the Geomap Web Component providing support as standard UI5 controls.
	 *
	 *
	 * @namespace
	 * @alias sap.ui.geomap
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @since 1.155
	 */
	const thisLib = Lib.init({
		name: "sap.ui.geomap",
		apiVersion: 2,
		version: "${version}",
		dependencies: [ // keep in sync with the ui5.yaml and .library files
			"sap.ui.core"
		],
		types: [
			"sap.ui.geomap.GeomapControlPosition"
		],
		controls: [
			"sap.ui.geomap.Geomap",
			"sap.ui.geomap.GeomapArc",
			"sap.ui.geomap.GeomapCircle",
			"sap.ui.geomap.GeomapCircleLayer",
			"sap.ui.geomap.GeomapCircleLayerState",
			"sap.ui.geomap.GeomapContainer",
			"sap.ui.geomap.GeomapContainerControl",
			"sap.ui.geomap.GeomapControlBase",
			"sap.ui.geomap.GeomapCopyrightControl",
			"sap.ui.geomap.GeomapElement",
			"sap.ui.geomap.GeomapFillLayer",
			"sap.ui.geomap.GeomapFillLayerState",
			"sap.ui.geomap.GeomapFullscreenControl",
			"sap.ui.geomap.GeomapGeocircle",
			"sap.ui.geomap.GeomapHeatmapLayer",
			"sap.ui.geomap.GeomapHssProvider",
			"sap.ui.geomap.GeomapImage",
			"sap.ui.geomap.GeomapLayer",
			"sap.ui.geomap.GeomapLayerBase",
			"sap.ui.geomap.GeomapLegendControl",
			"sap.ui.geomap.GeomapLine",
			"sap.ui.geomap.GeomapLineLayer",
			"sap.ui.geomap.GeomapLineLayerState",
			"sap.ui.geomap.GeomapMarkerBase",
			"sap.ui.geomap.GeomapNavigationControl",
			"sap.ui.geomap.GeomapPoint",
			"sap.ui.geomap.GeomapPolygon",
			"sap.ui.geomap.GeomapProvider",
			"sap.ui.geomap.GeomapRasterTiles",
			"sap.ui.geomap.GeomapScaleControl",
			"sap.ui.geomap.GeomapSelectionControl",
			"sap.ui.geomap.GeomapShape",
			"sap.ui.geomap.GeomapSource",
			"sap.ui.geomap.GeomapSpot",
			"sap.ui.geomap.GeomapSymbolLayer"
		],
		elements: [],
		noLibraryCSS: true // if no CSS is provided, you can disable the library.css load here
	});

	/**
	 * Enumeration of the <code>position</code> property of the Geomap controls
	 *
	 * @enum {string}
	 * @public
	 * @since 1.155
	 */
	thisLib.GeomapControlPosition = {

		/**
		 * The control is positioned in the top left corner of the page
		 */
		TopLeft: "TopLeft",

		/**
		 * The control is positioned in the top right corner of the page
		 */
		TopRight: "TopRight",

		/**
		 * The control is positioned in the bottom left corner of the page
		 */
		BottomLeft: "BottomLeft",

		/**
		 * The control is positioned in the bottom right corner of the page
		 */
		BottomRight: "BottomRight"
	};

	DataType.registerEnum("sap.ui.geomap.GeomapControlPosition", thisLib.GeomapControlPosition);

	return thisLib;

});
