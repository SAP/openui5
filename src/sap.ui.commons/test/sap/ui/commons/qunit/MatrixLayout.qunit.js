/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/layout/MatrixLayout",
	"sap/ui/commons/layout/MatrixLayoutRow",
	"sap/ui/commons/layout/MatrixLayoutCell",
	"sap/ui/commons/TextView",
	"sap/ui/commons/library",
	"sap/ui/commons/Image",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device"
], function(
	createAndAppendDiv,
	MatrixLayout,
	MatrixLayoutRow,
	MatrixLayoutCell,
	TextView,
	commonsLibrary,
	Image,
	jQuery,
	Device
) {
	"use strict";

	// shortcut for sap.ui.commons.layout.VAlign
	var VAlign = commonsLibrary.layout.VAlign;

	// shortcut for sap.ui.commons.layout.BackgroundDesign
	var BackgroundDesign = commonsLibrary.layout.BackgroundDesign;

	// shortcut for sap.ui.commons.TextViewDesign
	var TextViewDesign = commonsLibrary.TextViewDesign;

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3", "uiArea4"]);


	var i, j, oMLR, oMLC, oTV, oImg;

	var oML1 = new MatrixLayout("Matrix1");
	oML1.setLayoutFixed(true);
	oML1.setWidth('1000px');
	oML1.setColumns(5);
	oML1.setWidths(["100px", "150px", "300px", "auto", "200px"]);
	for (i = 0; i < 5; ++i) {
		oMLR = new MatrixLayoutRow("Matrix1-" + i);
		oMLR.setHeight((20 + 5 * i) + "px");
		oML1.addRow(oMLR);
		for (j = 0; j < 5; ++j) {
			oMLC = new MatrixLayoutCell("Matrix1-" + i + "-" + j);
			oMLR.addCell(oMLC);

			oTV = new TextView("TV-" + i + "-" + j);
			oMLC.addContent(oTV);
			oTV.setText("Cell @" + i + "," + j);
			oTV.setDesign(TextViewDesign.H2); // to make text bigger than the cells
		}
	}
	oML1.placeAt("uiArea1");

	var oML2 = new MatrixLayout("Matrix2");
	oML2.setLayoutFixed(false);
	for (i = 0; i < 2; ++i) {
		oMLR = new MatrixLayoutRow("Matrix2-" + i);
		oML2.addRow(oMLR);
		for (j = 0; j < 2; ++j) {
			oMLC = new MatrixLayoutCell("Matrix2-" + i + "-" + j);
			oMLR.addCell(oMLC);

			oImg = new Image("IMG-" + i + "-" + j);
			oMLC.addContent(oImg);
			oImg.setSrc("test-resources/sap/ui/commons/images/SAPLogo.gif");
			// Set default sizes of the iamge as the gif may not be loaded by the time the assert happens
			oImg.setWidth("73px");
			oImg.setHeight("36px");
			oImg.setAlt("Cell @" + i + "," + j);
			if (i == 1){
				oImg.setHeight("20px");
			}
			if (j == 1){
				oImg.setWidth("20px");
			}
		}
	}
	oML2.placeAt("uiArea2");

	var oML3 = new MatrixLayout("Matrix3");
	oML3.setLayoutFixed(true);
	oML3.setWidth('150px');
	oML3.setHeight('80px');
	oML3.setColumns(2);
	oML3.setWidths(["50%", "50%"]);
	for (i = 0; i < 2; ++i) {
		oMLR = new MatrixLayoutRow("Matrix3-" + i);
		oMLR.setHeight("50%");
		oML3.addRow(oMLR);
		for (j = 0; j < 2; ++j) {
			oMLC = new MatrixLayoutCell("Matrix3-" + i + "-" + j);
			oMLR.addCell(oMLC);

			oImg = new Image("IMG2-" + i + "-" + j);
			oMLC.addContent(oImg);
			oImg.setSrc("test-resources/sap/ui/commons/images/SAPLogo.gif");
			oImg.setAlt("Cell @" + i + "," + j);
			if (i == 1){
				oImg.setHeight("20px");
			}
			if (j == 1){
				oImg.setWidth("20px");
			}
		}
	}
	oML3.placeAt("uiArea3");

	var oML4 = new MatrixLayout("Matrix4", {
		layoutFixed: true,
		width: "600px",
		columns: 3
	}).placeAt("uiArea4");
	oML4.setWidths(["100px", "200px", "300px"]);

	// 1.Row
	var oMLC0 = new MatrixLayoutCell("Matrix4-0-0");
	oMLC0.setBackgroundDesign(BackgroundDesign.Fill1);
	oMLC0.setVAlign(VAlign.Bottom);
	oMLC0.setColSpan(2);
	oTV = new TextView("TV2-0-0");
	oMLC0.addContent(oTV);
	oTV.setText("Cell 0.0 - Colspan 2");

	var oMLC2 = new MatrixLayoutCell("Matrix4-0-2");
	oMLC2.setBackgroundDesign(BackgroundDesign.Fill2);
	oMLC2.setVAlign(VAlign.Top);
	oTV = new TextView("TV2-0-2");
	oMLC2.addContent(oTV);
	oTV.setText("Cell 0.2");
	oTV.setDesign(TextViewDesign.H2); // to make text bigger than the cells

	oML4.createRow({height: "25px"}, oMLC0, oMLC2);

	// 2.Row
	oMLC0 = new MatrixLayoutCell("Matrix4-1-0");
	oMLC0.setBackgroundDesign(BackgroundDesign.Fill3);
	oMLC0.setRowSpan(2);
	oTV = new TextView("TV2-1-0");
	oMLC0.addContent(oTV);
	oTV.setText("Cell 1.0 - Rowspan 2");
	oTV.setDesign(TextViewDesign.H2); // to make text bigger than the cells

	var oMLC1 = new MatrixLayoutCell("Matrix4-1-1"); // empty cell

	oMLC2 = new MatrixLayoutCell("Matrix4-1-2");
	oTV = new TextView("TV2-1-2");
	oMLC2.addContent(oTV);
	oTV.setText("Cell 1.2 and some stupid additional text to check if cell fits the defined height and text is cut. So you should not see the complete text.");
	oTV.setDesign(TextViewDesign.H2); // to make text bigger than the cells

	oML4.createRow({height: "25px"}, oMLC0, oMLC1, oMLC2);

	// 3.Row
	oMLC1 = new MatrixLayoutCell("Matrix4-2-1");
	oMLC1.setBackgroundDesign(BackgroundDesign.Fill1);
	oMLC1.setColSpan(2);
	oTV = new TextView("TV2-2-1");
	oMLC1.addContent(oTV);
	oTV.setText("Cell 2.1 Colspan 2");
	oTV.setDesign(TextViewDesign.H2); // to make text bigger than the cells

	oML4.createRow({height: "25px"},oMLC1);



	QUnit.module("Properties");

	QUnit.test("Default Values", function(assert) {
		assert.equal(oML1.getVisible(), true, "Default 'Visible':");
		assert.equal(oML1.getLayoutFixed(), true, "Default 'LayoutFixed':");
		assert.equal(oML2.getWidth(), "", "Default 'Width':");
		assert.equal(oML2.getWidths(), null, "Default 'Widths':");
		assert.equal(oML2.getColumns(), 0, "Default 'Columns':");
	});

	QUnit.test("Custom Values", function(assert) {
		assert.equal(oML1.getWidth(), "1000px", "Custom 'Width':");
		assert.deepEqual(oML1.getWidths(), ["100px", "150px", "300px", "auto", "200px"], "Custom 'Widths':");
		assert.equal(oML1.getColumns(), 5, "Custom 'Columns':");
	});

	QUnit.test("Clone", function(assert) {
		assert.ok(oML3.getWidths(), "original layout must have widths set");
		var oML3_clone = oML3.clone();
		assert.ok(oML3_clone.getWidths(), "clone must have widths as well");
		assert.deepEqual(oML3_clone.getWidths(), oML3.getWidths(), "clone must have same widths");
	});

	QUnit.module("Visual Appearence");

	QUnit.test("Visibility", function(assert) {
		var oMLDom = document.getElementById('Matrix1');
		assert.equal(oMLDom.offsetWidth, 1000, "Width of the Matrix:");

		var oCellDom = document.getElementById('Matrix1-0-0');
		assert.equal(oCellDom.offsetWidth, 100, "Width of Cell 0.0:");
		assert.equal(oCellDom.offsetHeight, 20, "Height of Cell 0.0:");
		assert.equal(oCellDom.offsetLeft, 0, "Left offset of Cell 0.0:");
		assert.equal(oCellDom.offsetTop, 0, "Top offset of Cell 0.0:");

		oCellDom = document.getElementById('Matrix1-1-1');
		assert.equal(oCellDom.offsetWidth, 150, "Width of Cell 1.1:");
		assert.equal(oCellDom.offsetHeight, 25, "Height of Cell 1.1:");
		assert.equal(oCellDom.offsetLeft, 100, "Left offset of Cell 1.1:");
		assert.equal(oCellDom.offsetTop, 20, "Top offset of Cell 1.1:");

		oCellDom = document.getElementById('Matrix1-2-2');
		assert.equal(oCellDom.offsetWidth, 300, "Width of Cell 2.2:");
		assert.equal(oCellDom.offsetHeight, 30, "Height of Cell 2.2:");
		assert.equal(oCellDom.offsetLeft, 250, "Left offset of Cell 2.2:");
		assert.equal(oCellDom.offsetTop, 45, "Top offset of Cell 2.2:");

		oCellDom = document.getElementById('Matrix1-3-3');
		assert.equal(oCellDom.offsetWidth, 250, "Width of Cell 3.3:");
		assert.equal(oCellDom.offsetHeight, 35, "Height of Cell 3.3:");
		assert.equal(oCellDom.offsetLeft, 550, "Left offset of Cell 3.3:");
		assert.equal(oCellDom.offsetTop, 75, "Top offset of Cell 3.3:");

		oCellDom = document.getElementById('Matrix1-4-4');
		assert.equal(oCellDom.offsetWidth, 200, "Width of Cell 4.4:");
		assert.equal(oCellDom.offsetHeight, 40, "Height of Cell 4.4:");
		assert.equal(oCellDom.offsetLeft, 800, "Left offset of Cell 4.4:");
		assert.equal(oCellDom.offsetTop, 110, "Top offset of Cell 4.4:");

		var oMLDom = document.getElementById('Matrix2');
		assert.equal(oMLDom.offsetWidth, 101, "Width of the Matrix2:");

		var oCellDom = document.getElementById('Matrix2-0-0');
		assert.equal(oCellDom.offsetWidth, 77, "Width of Cell 0.0:");
		assert.equal(oCellDom.offsetHeight, 41, "Height of Cell 0.0:");
		assert.equal(oCellDom.offsetLeft, 0, "Left offset of Cell 0.0:");
		assert.equal(oCellDom.offsetTop, 0, "Top offset of Cell 0.0:");

		oCellDom = document.getElementById('Matrix2-0-1');
		assert.equal(oCellDom.offsetWidth, 24, "Width of Cell 0.1:");
		assert.equal(oCellDom.offsetHeight, 41, "Height of Cell 0.1:");
		assert.equal(oCellDom.offsetLeft, 77, "Left offset of Cell 0.1:");
		assert.equal(oCellDom.offsetTop, 0, "Top offset of Cell 0.1:");

		oCellDom = document.getElementById('Matrix2-1-0');
		assert.equal(oCellDom.offsetWidth, 77, "Width of Cell 1.0:");
		assert.equal(oCellDom.offsetHeight, 25, "Height of Cell 1.0:");
		assert.equal(oCellDom.offsetLeft, 0, "Left offset of Cell 1.0:");
		assert.equal(oCellDom.offsetTop, 41, "Top offset of Cell 1.0:");

		oCellDom = document.getElementById('Matrix2-1-1');
		assert.equal(oCellDom.offsetWidth, 24, "Width of Cell 1.1:");
		assert.equal(oCellDom.offsetHeight, 25, "Height of Cell 1.1:");
		assert.equal(oCellDom.offsetLeft, 77, "Left offset of Cell 1.1:");
		assert.equal(oCellDom.offsetTop, 41, "Top offset of Cell 1.1:");

		var oMLDom = document.getElementById('Matrix3');
		assert.equal(oMLDom.offsetWidth, 150, "Width of the Matrix3:");
		assert.equal(oMLDom.offsetHeight, 80, "Height of the Matrix3:");

		var oCellDom = document.getElementById('Matrix3-0-0');
		assert.equal(oCellDom.offsetWidth, 75, "Width of Cell 0.0:");
		assert.equal(oCellDom.offsetHeight, 40, "Height of Cell 0.0:");
		assert.equal(oCellDom.offsetLeft, 0, "Left offset of Cell 0.0:");
		assert.equal(oCellDom.offsetTop, 0, "Top offset of Cell 0.0:");

		oCellDom = document.getElementById('Matrix3-0-1');
		assert.equal(oCellDom.offsetWidth, 75, "Width of Cell 0.1:");
		assert.equal(oCellDom.offsetHeight, 40, "Height of Cell 0.1:");
		assert.equal(oCellDom.offsetLeft, 75, "Left offset of Cell 0.1:");
		assert.equal(oCellDom.offsetTop, 0, "Top offset of Cell 0.1:");

		oCellDom = document.getElementById('Matrix3-1-0');
		assert.equal(oCellDom.offsetWidth, 75, "Width of Cell 1.0:");
		assert.equal(oCellDom.offsetHeight, 40, "Height of Cell 1.0:");
		assert.equal(oCellDom.offsetLeft, 0, "Left offset of Cell 1.0:");
		assert.equal(oCellDom.offsetTop, 40, "Top offset of Cell 1.0:");

		oCellDom = document.getElementById('Matrix3-1-1');
		assert.equal(oCellDom.offsetWidth, 75, "Width of Cell 1.1:");
		assert.equal(oCellDom.offsetHeight, 40, "Height of Cell 1.1:");
		assert.equal(oCellDom.offsetLeft, 75, "Left offset of Cell 1.1:");
		assert.equal(oCellDom.offsetTop, 40, "Top offset of Cell 1.1:");

		var oMLDom = document.getElementById('Matrix4');
		assert.equal(oMLDom.offsetWidth, 600, "Width of the Matrix4:");

		oCellDom = document.getElementById('Matrix4-0-0');
		assert.equal(oCellDom.offsetWidth, 300, "Width of Cell 0.0:");
		assert.equal(oCellDom.offsetHeight, 25, "Height of Cell 0.0:");
		assert.equal(oCellDom.offsetLeft, 0, "Left offset of Cell 0.0:");
		assert.equal(oCellDom.offsetTop, 0, "Top offset of Cell 0.0:");
		assert.ok(oCellDom.lastChild.offsetTop > 0, "Top offset of content of Cell 0.0 > 0 (vertical-align:bottom):");
		assert.equal(oCellDom.lastChild.offsetTop + oCellDom.lastChild.offsetHeight, 25, "Top offset of content of Cell 0.0 + height = cell height (vertical-align:bottom):");

		oCellDom = document.getElementById('Matrix4-0-2');
		assert.equal(oCellDom.offsetWidth, 300, "Width of Cell 0.2:");
		assert.equal(oCellDom.offsetHeight, 25, "Height of Cell 0.2:");
		assert.equal(oCellDom.offsetLeft, 300, "Left offset of Cell 0.2:");
		assert.equal(oCellDom.offsetTop, 0, "Top offset of Cell 0.2:");
		assert.equal(oCellDom.lastChild.offsetTop, 0, "Top offset of content of Cell 0.2 = 0 (vertical-align:top):");

		oCellDom = document.getElementById('Matrix4-1-0');
		assert.equal(oCellDom.offsetWidth, 100, "Width of Cell 1.0:");
		var offsetHeight = oCellDom.offsetHeight;
		if (Device.browser.chrome && offsetHeight == 51) { // a known issue in Chrome that sometimes happens
			offsetHeight = 50;
		}
		assert.equal(offsetHeight, 50, "Height of Cell 1.0:");
		assert.equal(oCellDom.offsetLeft, 0, "Left offset of Cell 1.0:");
		assert.equal(oCellDom.offsetTop, 25, "Top offset of Cell 1.0:");

		oCellDom = document.getElementById('Matrix4-1-1');
		assert.equal(oCellDom.offsetWidth, 200, "Width of Cell 1.1:");
		var offsetHeight = oCellDom.offsetHeight;
		if (Device.browser.chrome && offsetHeight == 26) { // a known issue in Chrome that sometimes happens
			offsetHeight = 25;
		}
		assert.equal(offsetHeight, 25, "Height of Cell 1.1:");
		assert.equal(oCellDom.offsetLeft, 100, "Left offset of Cell 1.1:");
		assert.equal(oCellDom.offsetTop, 25, "Top offset of Cell 1.1:");

		oCellDom = document.getElementById('Matrix4-1-2');
		assert.equal(oCellDom.offsetWidth, 300, "Width of Cell 1.2:");
		var offsetHeight = oCellDom.offsetHeight;
		if (Device.browser.chrome && offsetHeight == 26) { // a known issue in Chrome that sometimes happens
			offsetHeight = 25;
		}
		assert.equal(offsetHeight, 25, "Height of Cell 1.2:");
		assert.equal(oCellDom.offsetLeft, 300, "Left offset of Cell 1.2:");
		assert.equal(oCellDom.offsetTop, 25, "Top offset of Cell 1.2:");

		oCellDom = document.getElementById('Matrix4-2-1');
		assert.equal(oCellDom.offsetWidth, 500, "Width of Cell 2.1:");
		assert.equal(oCellDom.offsetHeight, 25, "Height of Cell 2.1:");
		assert.equal(oCellDom.offsetLeft, 100, "Left offset of Cell 2.1:");
		var offsetTop = oCellDom.offsetTop;
		if (Device.browser.chrome && offsetTop == 51) { // a known issue in Chrome that sometimes happens
			offsetTop = 50;
		}
		assert.equal(offsetTop, 50, "Top offset of Cell 2.1:");

	});
});