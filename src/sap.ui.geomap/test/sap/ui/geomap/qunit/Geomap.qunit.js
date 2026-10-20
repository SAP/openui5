/*global QUnit */
sap.ui.define([
	"sap/ui/geomap/library",
	"sap/ui/geomap/Geomap",
	"sap/ui/geomap/GeomapProvider",
	"sap/ui/geomap/Geomap",
	"sap/ui/geomap/GeomapNavigationControl",
	"sap/ui/geomap/GeomapScaleControl",
	"sap/ui/geomap/GeomapScaleControl"
], function (
	library,
	Geomap,
	GeomapProvider,
	GeomapNavigationControl,
	GeomapScaleControl,
	GeomapSpot
) {
	"use strict";

	// module for basic checks
	QUnit.module("Basic Control Checks");

	// some basic control checks
	QUnit.test("Test get properties", function (assert) {
		const oGeomap = new Geomap({
			centerLat: 49.210056,
			centerLng: 9.203700,
			zoom: 12.5,
			height: "400px",
			width: "400px",
			mapControls: [
				new GeomapProvider({
					styleUrl: "https://basemaps-api.arcgis.com/arcgis/rest/services/styles/ArcGIS:Streets?type=style&token=AAPK1cb6b58c34f848cb85d7ad870f41f90dm15r8uGCDJGp5DtgzsEZBjPihrXs16t6HpFgsNsfYP2byAeBHkLWGoPGDfAhZSB1"
				}),
				new GeomapNavigationControl(),
				new GeomapScaleControl({
					position: "BottomLeft"
				})
			],
			items: [
				new GeomapSpot({
					lat: 49.210056,
					lng: 9.203700
				})
			]
		});
		assert.equal(oGeomap.getCenterLat(), 49.210056, "Check centerLat is correct");
		assert.equal(oGeomap.getCenterLng(), 9.203700, "Check centerLng is correct");
		assert.equal(oGeomap.getZoom(), 12.5, "Check zoom is correct");
		assert.equal(oGeomap.getWidth(), "400px", "Check width is correct");
		assert.equal(oGeomap.getHeight(), "400px", "Check height is correct");
		assert.equal(oGeomap.getItems().length, 1, "Check items length is correct");
		assert.equal(oGeomap.getMapControls().length, 3, "Check mapControls length is correct");
	});
});
