/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/Image",
	"sap/ui/thirdparty/jquery"
], function(createAndAppendDiv, Image, jQuery) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3"]);



	var sSrc = "test-resources/sap/ui/commons/images/SAPLogo.gif",
		sTooltip = "tooltip",
		sAlt = "alternative text",
		sWidth = "111px",
		sHeight = "55px",
		bVisible = true;

	var oRawImage = new Image();
	oRawImage.src = sSrc;

	function handleEvent() {
		QUnit.config.current.assert.ok(true); // just for counting
	}

	var i1 = new Image("i1");
	i1.setSrc(sSrc);
	i1.setWidth(sWidth);
	i1.setHeight(sHeight);
	i1.setAlt(sAlt);
	i1.setVisible(bVisible);
	i1.setTooltip(sTooltip);
	i1.placeAt("uiArea1");

	var i2 = new Image("i2", {
		src : sSrc,
		width : sWidth,
		height : sHeight,
		alt : sAlt,
		visible : bVisible,
		tooltip : sTooltip,
		decorative: false,
		press : handleEvent
	});
	i2.placeAt("uiArea2");

	var i3noSourceNoHeight = new Image("imageNoSourceNoHeight");
	i3noSourceNoHeight.placeAt("uiArea3");

	var i4noSource = new Image("imageNoSource");
	i4noSource.setWidth("100px");
	i4noSource.setHeight("100px");
	i4noSource.placeAt("uiArea3");

	/* tests */

	QUnit.test("Initial Check", function(assert) {
		i1 = sap.ui.getCore().byId("i1");
		i2 = sap.ui.getCore().byId("i2");

		assert.ok((i1 !== undefined) && (i1 != null), "i1 should not be null");
		assert.ok((i2 !== undefined) && (i2 != null), "i2 should not be null");
	});

	QUnit.test("Alt text and tooltip", function(assert) {
		// i1 is decorative, i2 not

		// read alt attribute from DOM
		assert.equal(i1.$().attr("alt"), "", "alt text of i1 should be an empty string because the image is decorative");
		assert.equal(i2.$().attr("alt"), sAlt, "alt text of i2 should be rendered");

		// read title attribute from DOM
		assert.equal(i1.$().attr("title"), sTooltip, "tooltip text of i1 should be rendered");
		assert.equal(i2.$().attr("title"), sTooltip, "tooltip text of i2 should be rendered");

		i1.setAlt("");
		i2.setAlt("");
		sap.ui.getCore().applyChanges();

		assert.equal(i1.$().attr("alt"), "", "alt text of i1 should be an empty string because the image is decorative");
		assert.equal(i2.$().attr("alt"), sTooltip, "alt text of i2 should have the tooltip when alt is not set, but tooltip is");

		i1.setTooltip("");
		i2.setTooltip("");
		sap.ui.getCore().applyChanges();

		assert.equal(i1.getDomRef().getAttribute("alt"), "", "alt attribute of i1 should be an empty string because the image is decorative");
		assert.equal(i2.getDomRef().getAttribute("alt"), null, "alt attribute of i2 should NOT be rendered");
		assert.equal(i1.getDomRef().getAttribute("title"), null, "title attribute of i1 should NOT be rendered");
		assert.equal(i2.getDomRef().getAttribute("title"), null, "title attribute of i2 should NOT be rendered");

		i1.setAlt(sAlt);
		i2.setAlt(sAlt);
		sap.ui.getCore().applyChanges();

		assert.equal(i1.$().attr("alt"), "", "alt text of i1 should be an empty string because the image is decorative");
		assert.equal(i2.$().attr("alt"), sAlt, "alt text of i2 should be rendered");
		assert.equal(i1.getDomRef().getAttribute("title"), null, "title attribute of i1 should NOT be rendered");
		assert.equal(i2.getDomRef().getAttribute("title"), null, "title attribute of i2 should NOT be rendered");
	});

	QUnit.test("Offset Dimensions", function(assert) {
		// test the initial dimensions
		var oDomRef = document.getElementById("i1");
		assert.equal(oDomRef.offsetWidth, parseInt(i1.getWidth()), "i1.offsetWidth should equal parseInt(i1.getWidth())");
		assert.equal(oDomRef.offsetHeight, parseInt(i1.getHeight()), "i1.offsetHeight should equal parseInt(i1.getHeight())");
	});


	QUnit.test("Empty Source No Height", function(assert) {
		// test the initial dimensions
		var oImage = jQuery("#imageNoSourceNoHeight");
		assert.ok(oImage.hasClass("sapUiImgNoSource"), "imageNoSourceNoHeight has the right class 'sapUiImgNoSource' set");
		var oDomRef = document.getElementById("imageNoSourceNoHeight");
		assert.equal(oDomRef.offsetWidth, 0, "imageNoSourceNoHeight has the right width of 0px");
		assert.equal(oDomRef.offsetHeight, 0, "imageNoSourceNoHeight has the right height of 0px");
	});


	QUnit.test("Empty Source", function(assert) {
		// test the initial dimensions
		var oImage = jQuery("#imageNoSource");
		assert.ok(oImage.hasClass("sapUiImgNoSource"), "imageNoSource has the right class 'sapUiImgNoSource' set");
		var oDomRef = document.getElementById("imageNoSource");
		assert.equal(oDomRef.offsetWidth, 100, "imageNoSource has the right width of 100px");
		assert.equal(oDomRef.offsetHeight, 100, "imageNoSource has the right height of 100px");
	});

	QUnit.test("Dimension Changes", function(assert) {
		var done = assert.async();
		// test changed dimensions
		i2.setWidth("292px");
		i2.setHeight("292px");
		sap.ui.getCore().applyChanges();
		setTimeout(function() {
			var oDomRef = window.document.getElementById("i2");
			assert.equal(oDomRef.offsetWidth, 292, "i2.offsetWidth should equal 292");
			assert.equal(oDomRef.offsetHeight, 292, "i2.offsetHeight should equal 292");
			done();
		}, 100);
	});

	QUnit.test("Aspect Ratio", function(assert) {
		var done = assert.async();
		// test aspect ratio after changed dimensions
		i2.setWidth("292px");
		i2.setHeight("");
		sap.ui.getCore().applyChanges();
		setTimeout(function() {
			var oDomRef = window.document.getElementById("i2");
			assert.equal(oDomRef.offsetWidth, 292, "i2.offsetWidth should equal 292");
			assert.equal(oDomRef.offsetHeight, 144, "i2.offsetHeight should equal 144");
			done();
		}, 200);
	});

	QUnit.test("Original Width", function(assert) {
		var done = assert.async();
		// test original width
		i2.setWidth("");
		i2.setHeight("");
		sap.ui.getCore().applyChanges();
		setTimeout(function() {
			var oDomRef = window.document.getElementById("i2");
			assert.equal(oDomRef.offsetWidth, 73, "i2.offsetWidth should equal 73");
			assert.equal(oDomRef.offsetHeight, 36, "i2.offsetHeight should equal 36");
			done();
		}, 100);
	});
});