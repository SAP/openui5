/* global QUnit */

// Test only the things relevant for GridLayout. The basic Form functionality
// is tested in Form, FormContainer and FormElement qUnit tests.

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/qunit/QUnitUtils",
	"sap/base/Log",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"sap/ui/layout/library",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/GridLayout",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/GridElementData",
	"sap/ui/layout/form/GridContainerData",
	"sap/ui/core/library",
	"sap/ui/core/Title",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/TextArea",
	"sap/m/Text",
	"sap/m/Link"
	],
	function(
		jQuery,
		qutils,
		Log,
		Device,
		KeyCodes,
		library,
		Form,
		GridLayout,
		FormContainer,
		FormElement,
		GridElementData,
		GridContainerData,
		coreLibrary,
		Title,
		Toolbar,
		Label,
		Input,
		TextArea,
		Text,
		Link
	) {
	"use strict";

	var oForm;
	var oGridLayout;
	var oFormContainer1;
	var oFormContainer2;
	var oFormElement1;
	var oFormElement2;
	var oFormElement3;
	var oFormElement4;
	var oLabel1;
	var oLabel2;
	var oField1;
	var oField2;
	var oField3;
	var oField4;
	var oField5;
	var oField6;
	var oField7;
	var oTitle1;
	var oTitle2;

	// if some test breaks internal controls of test may not destroyed
	// what leads to duplicate ID errors in next test
	function cleanupControl(oControl) {
		if (oControl && !oControl._bIsBeingDestroyed) {
			oControl.destroy();
		}
		oControl = undefined;
	}

	function initForm(bOneContainer) {
		oGridLayout = new GridLayout("GL1");
		oLabel1 = new Label("L1", {text: "Label 1"});
		oLabel2 = new Label("L2", {text: "Label 2"});
		oField1 = new Input("I1");
		oField2 = new Input("I2");
		oField3 = new Input("I3");
		oFormElement1 = new FormElement("FE1",{
			label: oLabel1,
			fields: [oField1]
		});
		oFormElement2 = new FormElement("FE2",{
			label: oLabel2,
			fields: [oField2, oField3]
		});
		oFormContainer1 = new FormContainer("FC1",{
			formElements: [ oFormElement1, oFormElement2 ]
		});
		var aFormContainers = [oFormContainer1];
		if (!bOneContainer) {
			oField4 = new Input("I4");
			oField5 = new Input("I5");
			oField6 = new Input("I6");
			oField7 = new Input("I7");
			oFormElement3 = new FormElement("FE3",{
				fields: [oField4]
			});
			oFormElement4 = new FormElement("FE4",{
				fields: [oField5, oField6, oField7]
			});
			oTitle2 = new Title("T2", {text: "Test"});
			oFormContainer2 = new FormContainer("FC2",{
				title: oTitle2,
				tooltip: "Test",
				expandable: true,
				formElements: [ oFormElement3, oFormElement4 ],
				layoutData: new GridContainerData("GCD2", {halfGrid: true})
			});
			aFormContainers.push(oFormContainer2);
			oFormContainer1.setLayoutData(new GridContainerData("GCD1", {halfGrid: true}));
		}
		var oTitle1 = new Title("T1",{text: "Title", tooltip: "Title tooltip"});
		oForm = new Form("F1", {
			layout: oGridLayout,
			title: oTitle1,
			editable: true,
			formContainers: aFormContainers
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
	}

	function initTestOneContainer() {
		initForm(true);
	}

	function initTestTwoContainers() {
		initForm(false);
	}

	function afterTest(bOneContainer) {
		if (oForm) {
			oForm.destroy();
			oForm = undefined;
			cleanupControl(oGridLayout);
			cleanupControl(oLabel1);
			cleanupControl(oLabel2);
			cleanupControl(oField1);
			cleanupControl(oField2);
			cleanupControl(oField3);
			cleanupControl(oField4);
			cleanupControl(oField5);
			cleanupControl(oField6);
			cleanupControl(oField7);
			cleanupControl(oFormElement1);
			cleanupControl(oFormElement2);
			cleanupControl(oFormElement3);
			cleanupControl(oFormElement4);
			cleanupControl(oFormContainer1);
			cleanupControl(oFormContainer2);
			cleanupControl(oTitle1);
		}
	}

	var countCells = function(sID, iMax){
		var aRows = jQuery("#" + sID).find("tr");
		var bOK = true;
		for (var i = 0; i < aRows.length; i++){
			var aCells = jQuery(aRows[i]).children();
			var iCells = 0;
			for (var j = 0; j < aCells.length; j++){
				var oCell = jQuery(aCells[j]);
				var sColspan = oCell.attr("colspan");
				if ( sColspan ){
					iCells = iCells + parseInt(sColspan);
				} else {
					iCells++;
				}
			}
			if (iCells > iMax){
				bOK = false;
			}
		}
		return bOK;
	};

	var findLogEntry = function(sMessage, iLevel){
		var aLogEntries = Log.getLogEntries();
		for (var i = 0; i < aLogEntries.length; i++){
			var oLogEntry = aLogEntries[i];
			if (sMessage == oLogEntry.message && iLevel == oLogEntry.level){
				return true;
			}
		}
		return false;
	};

	QUnit.module("Form", {
		beforeEach: initTestOneContainer,
		afterEach: afterTest
	});

	QUnit.test("Shall be instantiable", function(assert) {
		assert.ok(oForm, "Form is created");
		assert.ok(oGridLayout, "GridLayout is created");
		assert.equal(oForm.getLayout().getId(), "GL1", "getLayout() returns layout.");
	});

	QUnit.module("Rendering one container", {
		beforeEach: initTestOneContainer,
		afterEach: afterTest
	});

	QUnit.test("Form", function(assert) {
		assert.ok(window.document.getElementById("F1"), "Form is rendered");
		assert.ok(window.document.getElementById("GL1"), "Grid is rendered");
		assert.ok(jQuery("#GL1").is("table"), "Grid is rendered as table");
		assert.ok(window.document.getElementById("T1"), "Title is rendered");
		assert.ok(countCells("F1", 16), "All rows of Form1 have max. 16 cells");
	});

	QUnit.test("BackgroundDesign", function(assert) {
		assert.ok(jQuery("#GL1").hasClass("sapUiFormBackgrTranslucent"), "translucent design per default");

		oGridLayout.setBackgroundDesign(library.BackgroundDesign.Solid);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#GL1").hasClass("sapUiFormBackgrSolid"), "solid design");
	});

	QUnit.test("Form Title", function(assert) {
		assert.ok(jQuery("#T1").is("h4"), "Title is rendered as H4 as default");
		assert.ok(jQuery("#T1").parent().is("th"), "Title is in <TH>");
		assert.equal(jQuery("#T1").attr("title"), "Title tooltip", "Title tooltip");
		assert.equal(jQuery("#T1").parent().attr("colspan"), "16", "Title is stretched over full width");

		oForm.destroyTitle();
		sap.ui.getCore().applyChanges();
		assert.notOk(jQuery("#F1").find("th")[0], "no title rendered");

		var oTitle1 = new Title("T1",{text: "Form Title", level: coreLibrary.TitleLevel.H1});
		oForm.setTitle(oTitle1);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#T1").is("h1"), "Title is rendered as H1");
	});

	QUnit.test("Form Toolbar", function(assert) {
		var oToolbar = new Toolbar("TB1");
		oForm.setToolbar(oToolbar);
		sap.ui.getCore().applyChanges();

		assert.notOk(window.document.getElementById("T1"), "Title is not rendered");
		assert.ok(window.document.getElementById("TB1"), "Toolbar is rendered");
		assert.ok(jQuery("#TB1").parent().is("th"), "Toolbar is in <TH>");
	});

	QUnit.test("FormContainer Title", function(assert) {
		assert.notOk(jQuery("#F1").find("h5")[0], "no H5 rendered");

		var oTitle2 = new Title("T2",{text: "Title"});
		oFormContainer1.setTitle(oTitle2);
		sap.ui.getCore().applyChanges();

		assert.ok(window.document.getElementById("T2"), "Title is rendered");
		assert.ok(jQuery("#T2").is("h5"), "Title is rendered as H5");
		assert.notOk(jQuery("#T2").parent().hasClass("sapUiFormContainerToolbar"), "Toolbar class not rendered");
		assert.ok(jQuery("#T2").parent().hasClass("sapUiFormContainerTitle"), "Title class rendered");
	});

	QUnit.test("FormContainer Toolbar", function(assert) {
		var oToolbar = new Toolbar("TB1");
		oFormContainer1.setToolbar(oToolbar);
		sap.ui.getCore().applyChanges();

		assert.ok(window.document.getElementById("TB1"), "Toolbar is rendered");
		assert.ok(jQuery("#TB1").parent().is("td"), "Toolbar is in <TD>");
		assert.ok(jQuery("#TB1").parent().hasClass("sapUiFormContainerToolbar"), "Toolbar class rendered");
		assert.notOk(jQuery("#TB1").parent().hasClass("sapUiFormContainerTitle"), "Title class not rendered");
	});

	QUnit.test("FormElement", function(assert) {
		assert.ok(window.document.getElementById("FE1"), "FormElement is rendered");
		assert.ok(jQuery("#FE1").is("tr"), "FormElement of full size grid is rendered as table row");
	});

	QUnit.test("Labels and Fields", function(assert) {
		assert.ok(window.document.getElementById("L1"), "Label1 is rendered");
		assert.equal(jQuery("#L1").parent().attr("colspan"), "3", "Label1 rendered using 3 grid cells");
		assert.ok(window.document.getElementById("I1"), "Field1 is rendered");
		assert.equal(jQuery("#I1").get(0).style.width, "100%", "Field1 rendered width = 100%");
		assert.equal(jQuery("#I1").parent().attr("colspan"), "13", "Field1 rendered using 13 grid cells");
		/* TODO remove after the end of support for Internet Explorer */
		assert.ok(!jQuery("#I1").parent().attr("rowspan") || (Device.browser.internet_explorer && jQuery("#I1").parent().attr("rowspan") == "1"), "Field1 no rowspan");
		assert.ok(window.document.getElementById("L2"), "Label2 is rendered");
		assert.equal(jQuery("#L2").parent().attr("colspan"), "3", "Label2 rendered using 3 grid cells");
		assert.equal(jQuery("#I2").get(0).style.width, "100%", "Field2 rendered width = 100%");
		assert.equal(jQuery("#I2").parent().attr("colspan"), "6", "Field2 rendered using 6 grid cells");
		/* TODO remove after the end of support for Internet Explorer */
		assert.ok(!jQuery("#I2").parent().attr("rowspan") || (Device.browser.internet_explorer && jQuery("#I2").parent().attr("rowspan") == "1"), "Field2 no rowspan");
		assert.equal(jQuery("#I3").get(0).style.width, "100%", "Field3 rendered width = 100%");
		assert.equal(jQuery("#I3").parent().attr("colspan"), "7", "Field3 rendered using 7 grid cells");
		/* TODO remove after the end of support for Internet Explorer */
		assert.ok(!jQuery("#I3").parent().attr("rowspan") || (Device.browser.internet_explorer && jQuery("#I3").parent().attr("rowspan") == "1"), "Field3 no rowspan");
	});

	QUnit.test("singleColumn", function(assert) {
		oGridLayout.setSingleColumn(true);
		sap.ui.getCore().applyChanges();
		assert.ok(countCells("F1", 8), "All rows of Form1 have max. 8 cells");
		assert.equal(jQuery("#L1").parent().attr("colspan"), "3", "Label1 rendered using 3 grid cells");
		assert.equal(jQuery("#I1").parent().attr("colspan"), "5", "Field1 rendered using 5 grid cells");
		assert.equal(jQuery("#I2").parent().attr("colspan"), "2", "Field2 rendered using 2 grid cells");
		assert.equal(jQuery("#I3").parent().attr("colspan"), "3", "Field3 rendered using 3 grid cells");
	});

	QUnit.test("FormElement visibility", function(assert) {
		oFormElement1.setVisible(false);
		sap.ui.getCore().applyChanges();
		assert.notOk(window.document.getElementById("FE1"), "invisible FormElement is not rendered");
		assert.notOk(window.document.getElementById("L1"), "Label1 is not rendered");
		assert.notOk(window.document.getElementById("I1"), "Field1 is not rendered");

		oFormElement1.setVisible(true);
		sap.ui.getCore().applyChanges();
		assert.ok(window.document.getElementById("FE1"), "FormElement is rendered");
		assert.ok(window.document.getElementById("L1"), "Label1 is rendered");
		assert.ok(window.document.getElementById("I1"), "Field1 is rendered");
	});

	QUnit.test("too much fields", function(assert) {
		oField4 = new Input("I4");
		oField5 = new Input("I5");
		oField6 = new Input("I6");
		oField7 = new Input("I7");
		var oField8 = new Input("I8");
		var oField9 = new Input("I9");
		var oField10 = new Input("I10");
		var oField11 = new Input("I11");
		var oField12 = new Input("I12");
		var oField13 = new Input("I13");
		var oField14 = new Input("I14");
		var oField15 = new Input("I15");
		var oField16 = new Input("I16");
		oFormElement2.addField(oField4);
		oFormElement2.addField(oField5);
		oFormElement2.addField(oField6);
		oFormElement2.addField(oField7);
		oFormElement2.addField(oField8);
		oFormElement2.addField(oField9);
		oFormElement2.addField(oField10);
		oFormElement2.addField(oField11);
		oFormElement2.addField(oField12);
		oFormElement2.addField(oField13);
		oFormElement2.addField(oField14);
		oFormElement2.addField(oField15);
		oFormElement2.addField(oField16);
		sap.ui.getCore().applyChanges();

		var bOK = true;
		var i = 0;
		for ( i = 2; i <= 14; i++){
			if ( !window.document.getElementById("I" + i) ) {
				bOK = false;
			}
		}
		assert.ok(bOK, "Element2: Field 1-13 are rendered");
		bOK = true;
		for ( i = 15; i <= 16; i++){
			if ( window.document.getElementById("C7E2_T" + i) ) {
				bOK = false;
			}
		}
		assert.ok(bOK, "Element2: Field 14-15 are not rendered");
		assert.ok(findLogEntry('Element "FE2" - Too much fields for one row!',1),"Error entry in log found for Element2");
	});

	QUnit.test("GridElementData hCells", function(assert) {
		var oGED1 = new GridElementData("GE1", {hCells: "3"});
		oField2.setLayoutData(oGED1);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#I2").parent().attr("colspan"), "3", "Field2 rendered using 3 grid cells");
		assert.equal(jQuery("#I3").parent().attr("colspan"), "10", "Field3 rendered using 10 grid cells");

		oGED1.setHCells("1");
		sap.ui.getCore().applyChanges();
		assert.notOk(jQuery("#I2").parent().attr("colspan"), "Field2 rendered no colspan");
		assert.equal(jQuery("#I3").parent().attr("colspan"), "12", "Field3 rendered using 12 grid cells");

		oGED1.setHCells("2");
		var oGED2 = new GridElementData("GE2", {hCells: "2"});
		oField3.setLayoutData(oGED2);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#I2").parent().attr("colspan"), "2", "Field2 rendered using 2 grid cells");
		assert.equal(jQuery("#I3").parent().attr("colspan"), "2", "Field3 rendered using 2 grid cells");
		assert.ok((jQuery("#I3").parent().next().is("td") && jQuery("#I3").parent().next().attr("colspan") == "9" && jQuery("#I3").parent().next().children().length == 0), "empty dummy cell rendered");

		oGED1.setHCells("10");
		oGED2.setHCells("10");
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#I2").parent().attr("colspan"), "10", "Field2 rendered using 10 grid cells");
		assert.notOk(window.document.getElementById("I3"), "Field3 is not rendered");
		assert.ok(findLogEntry('Element "FE2" - Too much fields for one row!',1),"Error entry in log found for Element2");

		var oGED3 = new GridElementData("GE3", {hCells: "full"});
		oField1.setLayoutData(oGED3);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#L1").parent().attr("colspan"), "16", "Label1 rendered using 16 grid cells");
		assert.equal(jQuery("#I1").parent().attr("colspan"), "16", "Field1 rendered using 16 grid cells");

		var oGED4 = new GridElementData("GE4", {hCells: "5"});
		oLabel1.setLayoutData(oGED4);
		oGED3.setHCells("auto");
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#L1").parent().attr("colspan"), "5", "Label1 rendered using 5 grid cells");
		assert.equal(jQuery("#I1").parent().attr("colspan"), "11", "Field1 rendered using 11 grid cells");
	});

	QUnit.test("GridElementData vCells", function(assert) {
		var oGED1 = new GridElementData("GE1", {vCells: 2});
		oField1.setLayoutData(oGED1);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#I1").parent().attr("rowspan"), "2", "Field1 rendered using 2 grid rows");
		assert.equal(jQuery("#I1").parent().attr("colspan"), "13", "Field3 rendered using 13 grid cells");

		// full size field no rows
		oGED1.setHCells("full");
		sap.ui.getCore().applyChanges();
		/* TODO remove after the end of support for Internet Explorer */
		assert.ok(!jQuery("#I1").parent().attr("rowspan") || (Device.browser.internet_explorer && jQuery("#I1").parent().attr("rowspan") == "1"), "Field1 no rowspan");

		oGED1.setHCells("3");
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#I2").parent().attr("colspan"), "5", "Field2 rendered using 5 grid cells");
		assert.equal(jQuery("#I3").parent().attr("colspan"), "5", "Field3 rendered using 5 grid cells");

		// complex example
		oFormElement3 = new FormElement("FE3",{
			label: new Label("L3", {text:"Label"}),
			fields: [new TextArea("TA1",{height: "10rem", layoutData: new GridElementData({vCells: 3})}),
			         new TextArea("TA2",{height: "6.5rem", layoutData: new GridElementData({hCells: "3",vCells: 2})}),
			         new TextArea("TA3",{height: "3rem", layoutData: new GridElementData({vCells: 1})})
								]
		});
		oFormElement4 = new FormElement("FE4",{
			fields: [new TextArea("TA4",{height: "3rem", layoutData: new GridElementData({vCells: 1})}),
			         new TextArea("TA5",{height: "6.5rem", layoutData: new GridElementData({vCells: 2})})
								]
		});
		var oFormElement5 = new FormElement("FE5",{
			label: new Label("L4", {text:"Label"}),
			fields: [new TextArea("TA6",{height: "3rem", layoutData: new GridElementData({vCells: 1})})
								]
		});
		var oFormElement6 = new FormElement("FE6",{
			label: new Label("L5", {text:"Label"}),
			fields: [new TextArea("TA7",{height: "6.5rem", layoutData: new GridElementData({hCells:"13",vCells: 2})})
								]
		});
		oFormContainer1.addFormElement(oFormElement3);
		oFormContainer1.addFormElement(oFormElement4);
		oFormContainer1.addFormElement(oFormElement5);
		oFormContainer1.addFormElement(oFormElement6);
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery("#TA1").parent().attr("rowspan"), "3", "Element3: Field1 (with vCells=3) rendered with rowspan 3");
		assert.equal(jQuery("#TA1").parent().attr("colspan"), "5", "Element3: Field1 rendered over 5 grid cells");
		assert.equal(jQuery("#TA2").parent().attr("rowspan"), "2", "Element3: Field2 (with vCells=2) rendered with rowspan 3");
		assert.equal(jQuery("#TA2").parent().attr("colspan"), "3", "Element3: Field2  (with hCells=3) rendered over 3 grid cells");
		/* TODO remove after the end of support for Internet Explorer */
		assert.ok(!jQuery("#TA3").parent().attr("rowspan") || (Device.browser.internet_explorer && jQuery("#TA3").parent().attr("rowspan") == "1"), "Element3: Field3 (with vCells=1) rendered without rowspan");
		assert.equal(jQuery("#TA3").parent().attr("colspan"), "5", "Element3: Field3 rendered over 5 grid cells");
		assert.equal(jQuery(jQuery("#TA4").parent().parent().children()[0]).attr("colspan"), "3", "Element4: label cell rendered");
		assert.ok(!jQuery(jQuery("#TA4").parent().parent().children()[0]).children().get(0), "Element4: no label rendered");
		/* TODO remove after the end of support for Internet Explorer */
		assert.ok(!jQuery("#TA4").parent().attr("rowspan") || (Device.browser.internet_explorer && jQuery("#TA4").parent().attr("rowspan") == "1"), "Element4: Field1 (with vCells=1) rendered without rowspan");
		assert.equal(jQuery("#TA4").parent().attr("colspan"), "2", "Element4: Field1 rendered over 2 grid cells");
		assert.equal(jQuery("#TA5").parent().attr("rowspan"), "2", "Element4: Field2 (with vCells=3) rendered with rowspan 3");
		assert.equal(jQuery("#TA5").parent().attr("colspan"), "3", "Element4: Field1 rendered over 3 grid cells");
		/* TODO remove after the end of support for Internet Explorer */
		assert.ok(!jQuery("#TA6").parent().attr("rowspan") || (Device.browser.internet_explorer && jQuery("#TA6").parent().attr("rowspan") == "1"), "Element5: Field1 (with vCells=1) rendered without rowspan");
		assert.equal(jQuery("#TA6").parent().attr("colspan"), "5", "Element5: Field1 rendered over 5 grid cells");
		assert.equal(jQuery("#TA7").parent().attr("rowspan"), "2", "Element6: Field1 (with vCells=2) rendered with rowspan 2");
		assert.equal(jQuery("#TA7").parent().parent().next().children().length, 0, "Empty dummy row rendered after full-size rowspan");

		var oGED2 = sap.ui.getCore().byId("TA6").getLayoutData();
		oGED2.setHCells("full");
		sap.ui.getCore().applyChanges();
		assert.notOk(window.document.getElementById("TA6"), "Field is not rendered");
		assert.ok(findLogEntry('Element "FE5" - Too much fields for one row!',1),"Error entry in log found for Element6");
	});

	QUnit.test("getContainerRenderedDomRef", function(assert) {
		var oDom = oGridLayout.getContainerRenderedDomRef(oFormContainer1);
		assert.notOk(oDom, "no Dom for container1 returned");
	});

	QUnit.test("getElementRenderedDomRef", function(assert) {
		var oDom = oGridLayout.getElementRenderedDomRef(oFormElement1);
		assert.ok(oDom, "Dom for FormElement returned");
		assert.ok(jQuery(oDom).is("tr"), "DOM is <tr>");
		assert.equal(oDom.id, "FE1", "Dom ID");
	});

	QUnit.module("Rendering two containers", {
		beforeEach: initTestTwoContainers,
		afterEach: afterTest
	});

	QUnit.test("Form", function(assert) {
		assert.ok(countCells("F1",17), "All rows of Form1 have max. 17 cells");
	});

	QUnit.test("FormContainer Title", function(assert) {
		assert.ok(window.document.getElementById("T2"), "Title is rendered");
		assert.ok(jQuery("#T2").is("h5"), "Title is rendered as H5");
		assert.ok(window.document.getElementById("FC2--Exp"), "Expander is rendered");
		assert.notOk(jQuery("#T2").parent().hasClass("sapUiFormContainerToolbar"), "Toolbar class not rendered");
		assert.ok(jQuery("#T2").parent().hasClass("sapUiFormContainerTitle"), "Title class rendered");
		assert.ok(jQuery("#T2").parent().prev().prev().is("td"), "title row rendered for Container1");
		assert.equal(jQuery("#T2").parent().prev().prev().children().length, 0, "title row for Container1 is empty");
	});

	QUnit.test("FormContainer Toolbar", function(assert) {
		var oToolbar = new Toolbar("TB1");
		oFormContainer2.setToolbar(oToolbar);
		sap.ui.getCore().applyChanges();

		assert.notOk(window.document.getElementById("T2"), "Title is not rendered");
		assert.ok(window.document.getElementById("TB1"), "Toolbar is rendered");
		assert.ok(jQuery("#TB1").parent().is("td"), "Toolbar is in <TD>");
		assert.equal(jQuery("#TB1").parent().attr("colspan"), "8", "Toolbar rendered using 8 grid cells");
		assert.ok(jQuery("#TB1").parent().hasClass("sapUiFormContainerToolbar"), "Toolbar class rendered");
		assert.notOk(jQuery("#TB1").parent().hasClass("sapUiFormContainerTitle"), "Title class not rendered");
	});

	QUnit.test("FormElement", function(assert) {
		assert.notOk(window.document.getElementById("FE1"), "FormElement is not rendered as own DOM");
	});

	QUnit.test("Labels and Fields", function(assert) {
		assert.ok(window.document.getElementById("L1"), "Label1 is rendered");
		assert.equal(jQuery("#L1").parent().attr("colspan"), "3", "Label1 rendered using 3 grid cells");
		assert.ok(window.document.getElementById("I1"), "Field1 is rendered");
		assert.equal(jQuery("#I1").get(0).style.width, "100%", "Field1 rendered width = 100%");
		assert.equal(jQuery("#I1").parent().attr("colspan"), "5", "Field1 rendered using 5 grid cells");
		/* TODO remove after the end of support for Internet Explorer */
		assert.ok(!jQuery("#I1").parent().attr("rowspan") || (Device.browser.internet_explorer && jQuery("#I1").parent().attr("rowspan") == "1"), "Field1 no rowspan");
		assert.ok(window.document.getElementById("L2"), "Label2 is rendered");
		assert.equal(jQuery("#L2").parent().attr("colspan"), "3", "Label2 rendered using 3 grid cells");
		assert.equal(jQuery("#I2").get(0).style.width, "100%", "Field2 rendered width = 100%");
		assert.equal(jQuery("#I2").parent().attr("colspan"), "2", "Field2 rendered using 2 grid cells");
		/* TODO remove after the end of support for Internet Explorer */
		assert.ok(!jQuery("#I2").parent().attr("rowspan") || (Device.browser.internet_explorer && jQuery("#I2").parent().attr("rowspan") == "1"), "Field2 no rowspan");
		assert.equal(jQuery("#I3").get(0).style.width, "100%", "Field3 rendered width = 100%");
		assert.equal(jQuery("#I3").parent().attr("colspan"), "3", "Field3 rendered using 3 grid cells");
		/* TODO remove after the end of support for Internet Explorer */
		assert.ok(!jQuery("#I3").parent().attr("rowspan") || (Device.browser.internet_explorer && jQuery("#I3").parent().attr("rowspan") == "1"), "Field3 no rowspan");
		assert.equal(jQuery("#I4").parent().attr("colspan"), "8", "Field4 rendered using 8 grid cells");
		assert.equal(jQuery("#I5").parent().attr("colspan"), "2", "Field3 rendered using 2 grid cells");
		assert.equal(jQuery("#I6").parent().attr("colspan"), "2", "Field3 rendered using 2 grid cells");
		assert.equal(jQuery("#I7").parent().attr("colspan"), "4", "Field3 rendered using 4 grid cells");
	});

	QUnit.test("FormContainer visibility", function(assert) {
		oFormContainer2.setVisible(false);
		sap.ui.getCore().applyChanges();
		assert.notOk(window.document.getElementById("T2"), "Title is not rendered");
		assert.notOk(window.document.getElementById("I4"), "Field4 is not rendered");

		oFormContainer2.setVisible(true);
		sap.ui.getCore().applyChanges();
		assert.ok(window.document.getElementById("T2"), "Title is rendered");
		assert.ok(window.document.getElementById("I4"), "Field4 is rendered");
	});

	QUnit.test("FormElement visibility", function(assert) {
		oFormElement1.setVisible(false);
		sap.ui.getCore().applyChanges();
		assert.notOk(window.document.getElementById("L1"), "Label1 is not rendered");
		assert.notOk(window.document.getElementById("I1"), "Field1 is not rendered");
		assert.equal(jQuery("#I4").parent().prev().prev().children().length, 0, "empty row left of Field4");

		oFormElement3.setVisible(false);
		sap.ui.getCore().applyChanges();
		assert.notOk(window.document.getElementById("I4"), "Field4 is not rendered");
		assert.ok(jQuery(jQuery("#I2").parent().parent().prev().children()[0]).hasClass("sapUiGridHeader"), "no empty row");

		oFormElement1.setVisible(true);
		sap.ui.getCore().applyChanges();
		assert.ok(window.document.getElementById("L1"), "Label1 is rendered");
		assert.ok(window.document.getElementById("I1"), "Field1 is rendered");
	});

	QUnit.test("GridContainerData", function(assert) {
		var oGCD = oFormContainer1.getLayoutData();
		oGCD.setHalfGrid(false);
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery("#L1").parent().attr("colspan"), "3", "Label1 rendered using 3 grid cells");
		assert.equal(jQuery("#I1").parent().attr("colspan"), "14", "Field1 rendered using 14 grid cells");
		assert.equal(jQuery("#L2").parent().attr("colspan"), "3", "Label2 rendered using 3 grid cells");
		assert.equal(jQuery("#I2").parent().attr("colspan"), "7", "Field2 rendered using 7 grid cells");
		assert.equal(jQuery("#I3").parent().attr("colspan"), "7", "Field3 rendered using 7 grid cells");
		assert.equal(jQuery("#I4").parent().attr("colspan"), "8", "Field4 rendered using 8 grid cells");
		assert.equal(jQuery("#I5").parent().attr("colspan"), "2", "Field3 rendered using 2 grid cells");
		assert.equal(jQuery("#I6").parent().attr("colspan"), "2", "Field3 rendered using 2 grid cells");
		assert.equal(jQuery("#I7").parent().attr("colspan"), "4", "Field3 rendered using 4 grid cells");
		assert.equal(jQuery("#T2").parent().attr("colspan"), "8", "Title rendered using 8 grid cells");
		assert.notOk(jQuery("#T2").parent().hasClass("sapUiFormContainerToolbar"), "Toolbar class not rendered");
		assert.ok(jQuery("#T2").parent().hasClass("sapUiFormContainerTitle"), "Title class rendered");
		assert.notOk(jQuery(jQuery("#L1").parent().parent().prev().children()[0]).is("td"), "No empty title row for container1 renderd");

		var oToolbar = new Toolbar("TB1");
		oFormContainer1.setToolbar(oToolbar);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#TB1").parent().attr("colspan"), "17", "Toolbar rendered using 17 grid cells");
		assert.ok(jQuery("#TB1").parent().hasClass("sapUiFormContainerToolbar"), "Toolbar class rendered");
		assert.notOk(jQuery("#TB1").parent().hasClass("sapUiFormContainerTitle"), "Title class not rendered");

		oFormContainer2.destroyLayoutData();
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#L1").parent().attr("colspan"), "3", "Label1 rendered using 3 grid cells");
		assert.equal(jQuery("#I1").parent().attr("colspan"), "13", "Field1 rendered using 13 grid cells");
		assert.equal(jQuery("#L2").parent().attr("colspan"), "3", "Label2 rendered using 3 grid cells");
		assert.equal(jQuery("#I2").parent().attr("colspan"), "6", "Field2 rendered using 6 grid cells");
		assert.equal(jQuery("#I3").parent().attr("colspan"), "7", "Field3 rendered using 7 grid cells");
		assert.equal(jQuery("#I4").parent().attr("colspan"), "16", "Field4 rendered using 16 grid cells");
		assert.equal(jQuery("#I5").parent().attr("colspan"), "5", "Field3 rendered using 5 grid cells");
		assert.equal(jQuery("#I6").parent().attr("colspan"), "5", "Field3 rendered using 5 grid cells");
		assert.equal(jQuery("#I7").parent().attr("colspan"), "6", "Field3 rendered using 6 grid cells");
		assert.ok(countCells("F1",16), "All rows of Form1 have max. 16 cells");

		oGCD.setHalfGrid(true);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#TB1").parent().attr("colspan"), "8", "Toolbar rendered using 8 grid cells");
		assert.ok(jQuery("#TB1").parent().hasClass("sapUiFormContainerToolbar"), "Toolbar class rendered");
		assert.notOk(jQuery("#TB1").parent().hasClass("sapUiFormContainerTitle"), "Title class not rendered");
		assert.notOk(jQuery(jQuery("#I1").parent().next().next().children()[0]).is("td"), "Empty cells next to container1 renderd");
		assert.equal(jQuery("#L1").parent().attr("colspan"), "3", "Label1 rendered using 3 grid cells");
		assert.equal(jQuery("#I1").parent().attr("colspan"), "5", "Field1 rendered using 5 grid cells");
		assert.equal(jQuery("#L2").parent().attr("colspan"), "3", "Label2 rendered using 3 grid cells");
		assert.equal(jQuery("#I2").parent().attr("colspan"), "2", "Field2 rendered using 2 grid cells");
		assert.equal(jQuery("#I3").parent().attr("colspan"), "3", "Field3 rendered using 3 grid cells");
		assert.equal(jQuery("#I4").parent().attr("colspan"), "17", "Field4 rendered using 17 grid cells");
		assert.equal(jQuery("#I5").parent().attr("colspan"), "5", "Field3 rendered using 5 grid cells");
		assert.equal(jQuery("#I6").parent().attr("colspan"), "6", "Field3 rendered using 6 grid cells");
		assert.equal(jQuery("#I7").parent().attr("colspan"), "6", "Field3 rendered using 6 grid cells");
		assert.equal(jQuery("#T2").parent().attr("colspan"), "17", "Title rendered using 17 grid cells");
	});

	QUnit.test("GridElementData hCells", function(assert) {
		var oGED1 = new GridElementData("GE1", {hCells: "full"});
		oField1.setLayoutData(oGED1);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#L1").parent().attr("colspan"), "8", "Label1 rendered using 8 grid cells");
		assert.equal(jQuery("#I1").parent().attr("colspan"), "8", "Field1 rendered using 8 grid cells");

		var oGCD = oFormContainer1.getLayoutData();
		oGCD.setHalfGrid(false);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#L1").parent().attr("colspan"), "17", "Label1 rendered using 17 grid cells");
		assert.equal(jQuery("#I1").parent().attr("colspan"), "17", "Field1 rendered using 17 grid cells");

		oGED1.setHCells("2");
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#I1").parent().attr("colspan"), "2", "Field1 rendered using 2 grid cells");
		assert.ok((jQuery("#I1").parent().next().is("td") && jQuery("#I1").parent().next().attr("colspan") == "12" && jQuery("#I1").parent().next().children().length == 0), "empty dummy cell rendered");
	});

	QUnit.test("GridElementData vCells", function(assert) {
		var oFormElement5 = new FormElement("FE5",{
			label: new Label("L3", {text:"Label"}),
			fields: [new Input("I8")]
		});
		var oFormElement6 = new FormElement("FE6",{
			label: new Label("L4", {text:"Label"}),
			fields: [new Input("I9")]
		});
		var oFormElement7 = new FormElement("FE7",{
			label: new Label("L5", {text:"Label"}),
			fields: [new Input("I10")]
		});
		var oFormElement8 = new FormElement("FE8",{
			label: new Label("L6", {text:"Label"}),
			fields: [new TextArea("TA1",{height: "6.5rem", layoutData: new GridElementData({hCells: "auto", vCells: 2})})]
		});
		var oFormElement9 = new FormElement("FE9",{
			label: new Label("L7", {text:"Label"}),
			fields: [new TextArea("TA2",{height: "6.5rem", layoutData: new GridElementData({hCells: "2", vCells: 2})}),
			         new Input("I11")]
		});
		var oFormElement10 = new FormElement("FE10");
		var oFormElement11 = new FormElement("FE11",{
			label: new Label("L8", {text:"Label"}),
			fields: [new Input("I12",{layoutData: new GridElementData({hCells: "1"})})]
		});
		oFormContainer1.addFormElement(oFormElement5);
		oFormContainer1.addFormElement(oFormElement6);
		oFormContainer1.addFormElement(oFormElement7);
		oFormContainer1.addFormElement(oFormElement8);
		oFormContainer1.addFormElement(oFormElement9);
		oFormContainer1.addFormElement(oFormElement10);
		oFormContainer1.addFormElement(oFormElement11);

		var oFormElement12 = new FormElement("FE12",{
			label: new Label("L9", {text:"Label"}),
			fields: [new TextArea("TA3",{height: "6.5rem", layoutData: new GridElementData({hCells: "full", vCells: 2})})]
		});
		var oFormElement13 = new FormElement("FE13",{
			label: new Label("L10", {text:"Label"}),
			fields: [new Input("I13")]
		});
		var oFormElement14 = new FormElement("FE14");
		oFormContainer2.addFormElement(oFormElement12);
		oFormContainer2.addFormElement(oFormElement13);
		oFormContainer2.addFormElement(oFormElement14);
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery("#TA3").parent().attr("rowspan"), "2", "Container2: Field1 (with vCells=2, hCells=full) rendered with rowspan 2");
		assert.equal(jQuery("#TA3").parent().prev().prev().children().first().attr("id"), "I9", "Container1: Field2 rendered beside full size field");
		assert.equal(jQuery("#TA3").parent().parent().next().children().first().next().children().first().attr("id"), "I10", "Container1: Field3 rendered beside full size field in second row");
		assert.equal(jQuery("#TA3").parent().parent().next().children().length, 3, "Container2: Field1 no cell used in second row of full size field with vCells=2");
		assert.equal(jQuery("#TA1").parent().attr("rowspan"), "2", "Container1: Field4 (with vCells=2, hCells=auto) rendered with rowspan 2");
		assert.equal(jQuery("#TA1").parent().next().next().next().children().first().attr("id"), "I13", "Container2: Field13 rendered beside full size field");
		assert.equal(jQuery("#TA1").parent().parent().next().children().length, 3, "Container2 - Element3: dummy cell rendered for dummy element");
		assert.equal(jQuery("#TA2").parent().attr("rowspan"), "2", "Container1: Field5 (with vCells=2, hCells=2) rendered with rowspan 2");
		assert.equal(jQuery("#TA2").parent().parent().next().children().length, 4, "Container1 - Element6: dummy cell rendered for dummy element");
		assert.equal(jQuery("#TA2").parent().parent().next().next().children().first().next().children().first().attr("id"), "I12", "Container1 -Element7: rendered in new line");

		var oGCD = oFormContainer1.getLayoutData();
		oGCD.setHalfGrid(false);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#TA1").parent().attr("rowspan"), "2", "Container1: Field4 (with vCells=2, hCells=5) rendered with rowspan 2");
		assert.equal(jQuery("#TA2").parent().attr("rowspan"), "2", "Container1: Field5 (with vCells=2, hCells=2) rendered with rowspan 2");
		assert.ok((jQuery("#TA2").parent().parent().next().children().first().is("td") && jQuery("#TA2").parent().parent().next().children().first().attr("colspan") == "3" && jQuery("#TA2").parent().parent().next().children().first().children().length == 0), "empty dummy row with label cell rendered");
		assert.ok((jQuery("#TA2").parent().parent().next().children().first().next().is("td") && jQuery("#TA2").parent().parent().next().children().first().next().attr("colspan") == "12" && jQuery("#TA2").parent().parent().next().children().first().next().children().length == 0), "empty dummy row with content cell rendered");
		assert.equal(jQuery("#TA2").parent().parent().next().next().children().first().next().children().first().attr("id"), "I12", "Container1 -Element7: rendered in new line");
	});

	QUnit.test("stand alone Half size containe", function(assert) {
		var oFormContainer3 = new FormContainer("FC3",{
			formElements: [
							new FormElement("FE5",{
								label: new Label("L3",{text:"Label"}),
								fields: [new TextArea("TA1",{height: "10rem", layoutData: new GridElementData({hCells: "2", vCells: 3})})]
							})
			],
			layoutData: new GridContainerData({halfGrid: true})
		});
		oForm.addFormContainer(oFormContainer3);
		sap.ui.getCore().applyChanges();

		assert.notOk(jQuery("#L3").parent().parent().prev().children().first().hasClass("sapUiGridHeader"), "Container3 no header rendered");
		assert.equal(jQuery("#TA1").parent().attr("colspan"), "2", "Container3: Field1 (with hCells=2) rendered over 2 grid cells");
		assert.equal(jQuery("#TA1").parent().attr("rowspan"), "3", "Container3: Field1 (with vCells=2, hCells=3) rendered with rowspan 3");
		assert.ok((jQuery("#TA1").parent().next().next().next().is("td") && jQuery("#TA1").parent().next().next().next().attr("colspan") == "8" && jQuery("#TA1").parent().next().next().next().children().length == 0), "Container3 - empty dummy cell rendered beside (because no second half-size container in row)");
		assert.equal(jQuery("#TA1").parent().parent().next().children().length, 0, "Container3 - Element1: first dummy row to fill up rowspan");
		assert.equal(jQuery("#TA1").parent().parent().next().next().children().length, 0, "Container3 - Element1: second dummy row to fill up rowspan");
	});

	QUnit.test("getElementRenderedDomRef", function(assert) {
		var oDom = oGridLayout.getElementRenderedDomRef(oFormElement1);
		assert.notOk(oDom, "no Dom for FormElement returned");
	});

	QUnit.module("Interaction", {
		beforeEach: initTestTwoContainers,
		afterEach: afterTest
	});

	QUnit.test("Keyboard Navigation", function(assert) {
		// no arrow navigation in sap.m nvironment
		jQuery("#I2-inner").focus();
		assert.equal(jQuery("#I2-inner").is(":focus"), true, "Mouseclick: Container1, Field2 - Selected");
		qutils.triggerKeyboardEvent("I2-inner", "F6");
		assert.equal(jQuery("#I4-inner").is(":focus"), true, "F6: Container2, Field1 - Selected");
		qutils.triggerKeyboardEvent("I4-inner", "F6", true, false, false);
		assert.equal(jQuery("#I1-inner").is(":focus"), true, "Shift + F6: Container1, Field2 - Selected");
		qutils.triggerKeyboardEvent("I4-inner", "F6");
		assert.equal(jQuery("#I1-inner").is(":focus"), false, "F6: Container1, Field1 - NOT Selected (No cycling!)");
		jQuery("#I1-inner").focus();
		qutils.triggerKeyboardEvent("I1-inner", "F6");
		assert.equal(jQuery("#I4-inner").is(":focus"), true, "F6: Container2, Field1 - Selected");
		jQuery("#I1-inner").focus();
		qutils.triggerKeyboardEvent("I1-inner", KeyCodes.TAB);
		assert.equal(jQuery("#I2-inner").is(":focus"), true, "Tab: Container1, Field2 - Selected");
		qutils.triggerKeyboardEvent("I2-inner", KeyCodes.TAB);
		assert.equal(jQuery("#I3-inner").is(":focus"), true, "Tab: Container1, Field3 - Selected");
		qutils.triggerKeyboardEvent("I3-inner", KeyCodes.TAB, true, false, false);
		assert.equal(jQuery("#I2-inner").is(":focus"), true, "Shift+Tab: Container1, Field2 - Selected");
		qutils.triggerKeyboardEvent("I2-inner", KeyCodes.TAB, true, false, false);
		assert.equal(jQuery("#I1-inner").is(":focus"), true, "Shift+Tab: Container1, Field1 - Selected");
		jQuery("#I3-inner").focus();
		qutils.triggerKeyboardEvent("I3-inner", KeyCodes.TAB);
		assert.equal(jQuery("#FC2--Exp").is(":focus"), true, "Tab: Container2 Expander - Selected");
		qutils.triggerKeyboardEvent("FC2--Exp", KeyCodes.TAB);
		assert.equal(jQuery("#I4-inner").is(":focus"), true, "Tab: Container2, Field1 - Selected");
		qutils.triggerKeyboardEvent("I4-inner", KeyCodes.TAB, true, false, false);
		assert.equal(jQuery("#FC2--Exp").is(":focus"), true, "Shift+Tab: Container2 Expander - Selected");
		qutils.triggerKeyboardEvent("FC2--Exp", KeyCodes.TAB, true, false, false);
		assert.equal(jQuery("#I3-inner").is(":focus"), true, "Shift+Tab: Container1, Field 3 - Selected");
	});

	QUnit.test("Container expander", function(assert) {
		var oFormElement5 = new FormElement("FE5",{
			label: new Label("L3",{text:"Label"}),
			fields: [new Input("I8")]
		});
		oFormContainer2.addFormElement(oFormElement5);
		oFormContainer2.setExpanded(false);
		sap.ui.getCore().applyChanges();
		assert.notOk(window.document.getElementById("I4"), "Container2 content area is not visible if not expanded");
		assert.ok((jQuery("#I3").parent().next().next().is("td") && jQuery("#I3").parent().next().next().attr("colspan") == "8" && jQuery("#I3").parent().next().next().children().length == 0), "Container2 - empty dummy cell rendered");
		assert.notOk((jQuery("#L2").parent().parent().next().children().first().is("td") && jQuery("#L2").parent().parent().next().children().first().attr("colspan") == "8" && jQuery("#L2").parent().parent().next().children().first().children().length == 0), "Container1 - NO empty dummy cell rendered");

		oFormContainer2.setExpanded(true);
		sap.ui.getCore().applyChanges();
		assert.ok(window.document.getElementById("I4"), "Container2 content area is visible if expanded");
		assert.ok((jQuery("#L2").parent().parent().next().children().first().is("td") && jQuery("#L2").parent().parent().next().children().first().attr("colspan") == "8" && jQuery("#L2").parent().parent().next().children().first().children().length == 0), "Container1 - empty dummy cell rendered");
	});

	// as no arrow key navigation in sap.m just test functions to find right field
	QUnit.test("findFieldBelow", function(assert) {
		var oDom = oGridLayout.findFieldBelow(oField1, oFormElement1);
		assert.ok(oDom, "Field found");
		assert.equal(oDom.id, oField2.getFocusDomRef().id, "Field2 found");

		oDom = oGridLayout.findFieldBelow(oField2, oFormElement2);
		assert.ok(oDom, "Field found");
		assert.equal(oDom.id, oField4.getFocusDomRef().id, "Field4 found");
	});

	QUnit.test("findFieldAbove", function(assert) {
		var oDom = oGridLayout.findFieldAbove(oField3, oFormElement2);
		assert.ok(oDom, "Field found");
		assert.equal(oDom.id, oField1.getFocusDomRef().id, "Field1 found");

		oDom = oGridLayout.findFieldAbove(oField4, oFormElement3);
		assert.ok(oDom, "Field found");
		assert.equal(oDom.id, oField3.getFocusDomRef().id, "Field3 found");
	});

});