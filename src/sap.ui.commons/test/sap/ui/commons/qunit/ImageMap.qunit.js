/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/Image",
	"sap/ui/commons/ImageMap",
	"sap/ui/commons/Area"
], function(createAndAppendDiv, Image, ImageMap, Area) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2"]);



	var oImage = new Image("i1");
	oImage.setSrc("http://www.sap.com/global/images/SAPLogo.gif");
	oImage.setAlt("Alternative image text for Image1");
	oImage.setUseMap("Map1");
	oImage.placeAt("uiArea1");
	var oMap = new ImageMap("m1");
	oMap.setName("Map1");
	var aArea1 = new Area({shape: "rect", alt: "Text on Alt1", href: "http://www.sap.com", coords: "1,1,20,20"});
	var aArea2 = new Area({shape: "rect", alt: "Text on Alt2", href: "http://www.ibm.com", coords: "21,1,40,20"});
	oMap.addArea(aArea1);
	oMap.createArea(aArea2);
	oMap.createArea({shape: "rect", alt: "Text on Alt3", href: "http://www.google.com", coords: "1,21,21,40"});
	oMap.createArea({shape: "rect", alt: "Text on Alt4", href: "http://www.yahoo.com", coords: "21,21,40,40"}, {shape: "rect", alt: "Text on Alt5", href: "http://www.sap.com", coords: "41,1,60,20"});
	oMap.placeAt("uiArea2");



	QUnit.module("Initial check");

	QUnit.test("Areas Check", function(assert) {
		var areas = oMap.getAreas();
		assert.ok(Array.isArray(areas) && areas.length > 0, "Areas are not defined");
	});



	QUnit.module("Properties");

	QUnit.test("Image Map Properties", function(assert) {
		assert.equal(oMap.getName(), "Map1", "The name of the map that is referenced within the image");
	});

	QUnit.test("Area properties", function(assert) {
		var areas = oMap.getAreas();
		var el;

		el = areas[0];
		assert.equal(el.getShape(), "rect", "Shape is a Rectangle:");
		assert.equal(el.getCoords(), "1,1,20,20", "Coordinates of the first Area:");
		assert.equal(el.getAlt(), "Text on Alt1", "Alt Text:");
		assert.equal(el.getHref(), "http://www.sap.com", "HRef:");

		el = areas[1];
		assert.equal(el.getShape(), "rect", "Shape is a Rectangle:");
		assert.equal(el.getCoords(), "21,1,40,20", "Coordinates of the second Area:");
		assert.equal(el.getAlt(), "Text on Alt2", "Alt Text:");
		assert.equal(el.getHref(), "http://www.ibm.com", "HRef:");

		el = areas[2];
		assert.equal(el.getShape(), "rect", "Shape is a Rectangle:");
		assert.equal(el.getCoords(), "1,21,21,40", "Coordinates of the second Area:");
		assert.equal(el.getAlt(), "Text on Alt3", "Alt Text:");
		assert.equal(el.getHref(), "http://www.google.com", "HRef:");

		el = areas[3];
		assert.equal(el.getShape(), "rect", "Shape is a Rectangle:");
		assert.equal(el.getCoords(), "21,21,40,40", "Coordinates of the second Area:");
		assert.equal(el.getAlt(), "Text on Alt4", "Alt Text:");
		assert.equal(el.getHref(), "http://www.yahoo.com", "HRef:");

		el = areas[4];
		assert.equal(el.getShape(), "rect", "Shape is a Rectangle:");
		assert.equal(el.getCoords(), "41,1,60,20", "Coordinates of the second Area:");
		assert.equal(el.getAlt(), "Text on Alt5", "Alt Text:");
		assert.equal(el.getHref(), "http://www.sap.com", "HRef:");

	});

});