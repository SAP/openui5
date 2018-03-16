/* global QUnit, sinon, qutils */

// Test only the things relevant for ColumnLayout. The basic Form functionality
// is tested in Form, FormContainer and FormElement qUnit tests.
// via qUnit only the DOM structure and classes can be tested, so the real
// layout must be tested in some visual test.

QUnit.config.autostart = false;

sap.ui.require([
	"jquery.sap.global",
	"sap/ui/layout/form/ColumnLayout",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/ColumnElementData",
	"sap/ui/layout/form/ColumnContainerData",
	"sap/ui/core/Title",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/Text"
	],
	function(
		jQuery,
		ColumnLayout,
		Form,
		FormContainer,
		FormElement,
		ColumnElementData,
		ColumnContainerData,
		Title,
		Toolbar,
		Label,
		Text
	) {
	"use strict";

	QUnit.start();

	var oForm;
	var oColumnLayout;
	var oFormContainer1;
	var oFormContainer2;
	var oFormElement1;
	var oFormElement2;
	var oFormElement3;
	var oFormElement4;
	var oLabel1;
	var oLabel2;
	var oLabel3;
	var oLabel4;
	var oField1;
	var oField2;
	var oField3;
	var oField4;
	var oTitle;

	// if some test breaks internal controls of test may not destroyed
	// what leads to duplicate ID errors in next test
	function cleanupControl(oControl) {
		if (oControl && !oControl._bIsBeingDestroyed) {
			oControl.destroy();
		}
		oControl = undefined;
	}

	function initForm() {
		oColumnLayout = new ColumnLayout("CL1");
		oLabel1 = new Label("L1", {text: "Label 1"});
		oField1 = new Text("T1", {text: "Text 1"});
		oFormElement1 = new FormElement("FE1",{
			label: oLabel1,
			fields: [oField1]
		});
		oFormContainer1 = new FormContainer("FC1",{
			formElements: [ oFormElement1 ]
		});
		var aFormContainers = [oFormContainer1];

		oForm = new Form("F1", {
			layout: oColumnLayout,
			editable: false,
			formContainers: aFormContainers
		}).placeAt("content");
		sap.ui.getCore().applyChanges();
	}

	function afterTest() {
		if (oForm) {
			oForm.destroy();
			oForm = undefined;
			cleanupControl(oColumnLayout);
			cleanupControl(oLabel1);
			cleanupControl(oLabel2);
			cleanupControl(oLabel3);
			cleanupControl(oLabel4);
			cleanupControl(oField1);
			cleanupControl(oField2);
			cleanupControl(oField3);
			cleanupControl(oField4);
			cleanupControl(oFormElement1);
			cleanupControl(oFormElement2);
			cleanupControl(oFormElement3);
			cleanupControl(oFormElement4);
			cleanupControl(oFormContainer1);
			cleanupControl(oFormContainer2);
			cleanupControl(oTitle);
		}
	}

	function addContainer(sID) {
		var oLabel = new Label(sID + "L1", {text: "Label 1"});
		var oField = new Text(sID + "T1", {text: "Text 1"});
		var oFormElement = new FormElement(sID + "FE1",{
			label: oLabel,
			fields: [oField]
		});
		var oFormContainer = new FormContainer(sID, {
			formElements: [ oFormElement ]
		});

		oForm.addFormContainer(oFormContainer);
		sap.ui.getCore().applyChanges();

		return oFormContainer;
	}

	function addElement(oFormContainer, sID) {
		var oLabel = new Label(sID + "L1", {text: "Label 1"});
		var oField = new Text(sID + "T1", {text: "Text 1"});
		var oFormElement = new FormElement(sID,{
			label: oLabel,
			fields: [oField]
		});

		oFormContainer.addFormElement(oFormElement);
		sap.ui.getCore().applyChanges();

		return oFormElement;
	}

	function checkContainerSizeClasses(assert, $Container, iContainer, sSize, iColumns, bFirst, bBreak) {
		assert.ok($Container.hasClass("sapUiFormCLContainer" + sSize + iColumns), "Container" + iContainer + ": Size " + sSize + ": " + iColumns + " columns");
		if (bFirst) {
			assert.ok($Container.hasClass("sapUiFormCLContainer" + sSize + "FirstRow"), "Container" + iContainer + ": Size " + sSize + ": first row");
		} else {
			assert.notOk($Container.hasClass("sapUiFormCLContainer" + sSize + "FirstRow"), "Container" + iContainer + ": Size " + sSize + ": not first row");
		}
		if (bBreak) {
			assert.ok($Container.hasClass("sapUiFormCLContainer" + sSize + "Break"), "Container" + iContainer + ": Size " + sSize + ": line-break");
		} else {
			assert.notOk($Container.hasClass("sapUiFormCLContainer" + sSize + "Break"), "Container" + iContainer + ": Size " + sSize + ": no line-break");
		}
	}

	function checkContainerClasses(assert, $Container, iContainer, iSC, bSF, bSB, iMC, bMF, bMB, iLC, bLF, bLB, iXLC, bXLF, bXLB) {
		checkContainerSizeClasses(assert, $Container, iContainer, "S", iSC, bSF, bSB);
		checkContainerSizeClasses(assert, $Container, iContainer, "M", iMC, bMF, bMB);
		checkContainerSizeClasses(assert, $Container, iContainer, "L", iLC, bLF, bLB);
		checkContainerSizeClasses(assert, $Container, iContainer, "XL", iXLC, bXLF, bXLB);
	}

	function checkElementSizeClasses(assert, $Node, iNode, sSize, iColumns, bBreak, iSpace) {
		assert.ok($Node.hasClass("sapUiFormCLCells" + sSize + iColumns), sSize + ": " + iNode + ". node has has " + iColumns + " cells");
		if (bBreak) {
			assert.ok($Node.hasClass("sapUiFormCLCell" + sSize + "Break"), sSize + ": " + iNode + ". node has line-break");
		} else {
			assert.notOk($Node.hasClass("sapUiFormCLCell" + sSize + "Break"), sSize + ": " + iNode + ". node has no line-break");
		}
		if (iSpace > 0) {
			assert.ok($Node.hasClass("sapUiFormCLCell" + sSize + "Space" + iSpace), sSize + ": " + iNode + ". node has has " + iSpace + " space");
		}
	}

	function checkElementClasses(assert, $Node, iNode, bLabel, sID, iSC, bSB, iSS, iLC, bLB, iLS) {
		if (bLabel) {
			assert.ok($Node.hasClass("sapUiFormElementLbl"), iNode + ". child is label node");
		} else {
			assert.notOk($Node.hasClass("sapUiFormElementLbl"), iNode + ". child is no label node");
		}

		assert.equal($Node.children()[0].id, sID, sID + " is content of " + iNode + ". child node");

		checkElementSizeClasses(assert, $Node, iNode, "S", iSC, bSB, iSS);
		checkElementSizeClasses(assert, $Node, iNode, "L", iLC, bLB, iLS);
	}

	QUnit.module("layout rendering", {
		beforeEach: initForm,
		afterEach: afterTest
	});

	QUnit.test("default values", function(assert) {
		assert.equal(oColumnLayout.getColumnsM(), 1, "columnsM");
		assert.equal(oColumnLayout.getColumnsL(), 2, "columnsM");
		assert.equal(oColumnLayout.getColumnsXL(), 2, "columnsM");
		assert.equal(oColumnLayout.getLabelCellsLarge(), 4, "labelCellsLarge");
		assert.equal(oColumnLayout.getEmptyCellsLarge(), 0, "emptyCellsLarge");
	});

	QUnit.test("Responsiveness", function(assert) {
		oForm.setWidth("500px");
		sap.ui.getCore().applyChanges();
		var $Layout = jQuery("#CL1");
		assert.ok($Layout.hasClass("sapUiFormCLMedia-Std-Phone"), "Layout has Phone size");
		assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Tablet"), "Layout has not Tablet size");
		assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Desktop"), "Layout has not Desktop size");
		assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-LargeDesktop"), "Layout has not LargeDesktop size");
		assert.ok($Layout.hasClass("sapUiFormCLSmallColumns"), "Layout has small columns");
		assert.notOk($Layout.hasClass("sapUiFormCLWideColumns"), "Layout has not large columns");

		oForm.setWidth("1000px");
		sap.ui.getCore().applyChanges();
		$Layout = jQuery("#CL1");
		assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Phone"), "Layout has not Phone size");
		assert.ok($Layout.hasClass("sapUiFormCLMedia-Std-Tablet"), "Layout has Tablet size");
		assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Desktop"), "Layout has not Desktop size");
		assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-LargeDesktop"), "Layout has not LargeDesktop size");
		assert.notOk($Layout.hasClass("sapUiFormCLSmallColumns"), "Layout has not small columns");
		assert.ok($Layout.hasClass("sapUiFormCLWideColumns"), "Layout has large columns");

		oForm.setWidth("1300px");
		sap.ui.getCore().applyChanges();
		$Layout = jQuery("#CL1");
		assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Phone"), "Layout has not Phone size");
		assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Tablet"), "Layout has not Tablet size");
		assert.ok($Layout.hasClass("sapUiFormCLMedia-Std-Desktop"), "Layout has Desktop size");
		assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-LargeDesktop"), "Layout has not LargeDesktop size");
		assert.notOk($Layout.hasClass("sapUiFormCLSmallColumns"), "Layout has not small columns");
		assert.ok($Layout.hasClass("sapUiFormCLWideColumns"), "Layout has large columns");

		oForm.setWidth("1500px");
		sap.ui.getCore().applyChanges();
		$Layout = jQuery("#CL1");
		assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Phone"), "Layout has not Phone size");
		assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Tablet"), "Layout has not Tablet size");
		assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Desktop"), "Layout has not Desktop size");
		assert.ok($Layout.hasClass("sapUiFormCLMedia-Std-LargeDesktop"), "Layout has LargeDesktop size");
		assert.notOk($Layout.hasClass("sapUiFormCLSmallColumns"), "Layout has not small columns");
		assert.ok($Layout.hasClass("sapUiFormCLWideColumns"), "Layout has large columns");
	});

	QUnit.test("keyboard", function(assert) {
		sinon.spy(oColumnLayout, "onsapright");
		sinon.spy(oColumnLayout, "onsapleft");

		qutils.triggerKeyboardEvent("CL1", "ARROW_DOWN");
		assert.ok(oColumnLayout.onsapright.called, "sapright called");

		qutils.triggerKeyboardEvent("CL1", "ARROW_UP");
		assert.ok(oColumnLayout.onsapright.called, "sapleft called");
	});

	QUnit.test("invalid columns", function(assert) {
		var oException;

		try {
			oColumnLayout.setColumnsM(2).setColumnsL(3).setColumnsXL(1);
			sap.ui.getCore().applyChanges();
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
	});

	QUnit.module("container rendering", {
		beforeEach: initForm,
		afterEach: afterTest
	});

	QUnit.test("One container - default columns", function(assert) {
		var oDomRef = jQuery.sap.domById("CL1");
		assert.ok(oDomRef, "Layout rendered");

		oDomRef = jQuery.sap.domById("FC1");
		assert.ok(oDomRef, "Container rendered");
		var $Container = jQuery("#FC1");
		assert.equal($Container.parent().attr("id"), "CL1", "not content DOM element rendered");
		assert.equal($Container.children().length, 1, "only one DOM node in Container");
		assert.equal($Container.children()[0].id, "FC1-content", "content node for Container rendered");

		oDomRef = jQuery.sap.domById("FE1");
		assert.ok(oDomRef, "Element rendered");
		assert.equal(jQuery("#FE1").parent().attr("id"), "FC1-content", "Container content node is parent of Element");

		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 2, true, false, 2, true, false);
	});

	QUnit.test("One container - set columns", function(assert) {
		oColumnLayout.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
		sap.ui.getCore().applyChanges();

		var $Container = jQuery("#FC1");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 2, true, false, 3, true, false, 4, true, false);
	});

	QUnit.test("Title", function(assert) {
		var oTitle = new Title("Title1", {text: "Title"});
		oFormContainer1.setTitle(oTitle);
		sap.ui.getCore().applyChanges();

		var $Container = jQuery("#FC1");
		assert.equal($Container.children().length, 2, "two DOM nodes in Container");
		assert.equal($Container.children()[0].id, "Title1", "Title rendered");
		assert.equal($Container.children()[1].id, "FC1-content", "content node for Container rendered");
	});

	QUnit.test("Toolbar", function(assert) {
		var oTitle = new Title("Title1", {text: "Title"});
		var oToolbar = new Toolbar("TB1");
		oFormContainer1.setTitle(oTitle);
		oFormContainer1.setToolbar(oToolbar);
		sap.ui.getCore().applyChanges();

		var $Container = jQuery("#FC1");
		assert.equal($Container.children().length, 2, "two DOM nodes in Container");
		assert.equal($Container.children()[0].id, "TB1", "Title rendered");
		assert.equal($Container.children()[1].id, "FC1-content", "content node for Container rendered");
	});

	QUnit.test("Expand", function(assert) {
		var $Container = jQuery("#FC1");
		assert.notOk($Container.hasClass("sapUiFormCLContainerColl"), "container not collapsed");

		oFormContainer1.setExpanded(false);
		assert.ok($Container.hasClass("sapUiFormCLContainerColl"), "container collapsed");

		oFormContainer1.setExpanded(true);
		assert.notOk($Container.hasClass("sapUiFormCLContainerColl"), "container not collapsed");

		oFormContainer1.setExpanded(false);
		oFormContainer1.invalidate(); // to test in renderer
		sap.ui.getCore().applyChanges();
		$Container = jQuery("#FC1");
		assert.ok($Container.hasClass("sapUiFormCLContainerColl"), "container collapsed");
	});

	QUnit.test("Tooltip", function(assert) {
		var $Container = jQuery("#FC1");
		assert.notOk($Container.attr("title"), "container has no tooltip");

		oFormContainer1.setTooltip("Test");
		sap.ui.getCore().applyChanges();
		$Container = jQuery("#FC1");
		assert.equal($Container.attr("title"), "Test", "container has tooltip");
	});

	QUnit.test("Two containers - default columns", function(assert) {
		oFormContainer2 = addContainer("FC2");

		var oDomRef = jQuery.sap.domById("FC1");
		assert.ok(oDomRef, "Container1 rendered");
		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLContent"), "content DOM element rendered");
		assert.ok($Container.parent().hasClass("sapUiFormCLColumnsM1"), "M: Layout has 1 column");
		assert.ok($Container.parent().hasClass("sapUiFormCLColumnsL2"), "L: Layout has 2 columns");
		assert.ok($Container.parent().hasClass("sapUiFormCLColumnsXL2"), "XL: Layout has 2 columns");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);

		oDomRef = jQuery.sap.domById("FC2");
		assert.ok(oDomRef, "Container2 rendered");
		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, false, false, 1, true, false, 1, true, false);
	});

	QUnit.test("Two containers - set columns", function(assert) {
		oColumnLayout.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
		oFormContainer2 = addContainer("FC2");

		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLColumnsM2"), "M: Layout has 2 columns");
		assert.ok($Container.parent().hasClass("sapUiFormCLColumnsL3"), "L: Layout has 3 columns");
		assert.ok($Container.parent().hasClass("sapUiFormCLColumnsXL4"), "XL: Layout has 4 columns");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 2, true, false, 2, true, false);

		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, true, false, 1, true, false, 2, true, false);

		// make 2. continer larger zo see if it gets more columns in L
		oFormElement2 = addElement(oFormContainer2, "FE2");
		$Container = jQuery("#FC1");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 2, true, false);
		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, true, false, 2, true, false, 2, true, false);
	});

	QUnit.test("Two container - first invisible", function(assert) {
		oFormContainer1.setVisible(false);
		oFormContainer2 = addContainer("FC2");

		var oDomRef = jQuery.sap.domById("FC1");
		assert.notOk(oDomRef, "Container1 not rendered");
		oDomRef = jQuery.sap.domById("FC2");
		assert.ok(oDomRef, "Container2 rendered");
		var $Container = jQuery("#FC2");
		assert.equal($Container.parent().attr("id"), "CL1", "not content DOM element rendered");
		checkContainerClasses(assert, $Container, 2, 1, true, false, 1, true, false, 2, true, false, 2, true, false);
	});

	QUnit.test("Three containers - default columns", function(assert) {
		addContainer("FC2");
		addContainer("FC3");

		var oDomRef = jQuery.sap.domById("FC1");
		assert.ok(oDomRef, "Container1 rendered");
		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLContent"), "content DOM element rendered");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);

		oDomRef = jQuery.sap.domById("FC2");
		assert.ok(oDomRef, "Container2 rendered");
		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, false, false, 1, true, false, 1, true, false);

		oDomRef = jQuery.sap.domById("FC3");
		assert.ok(oDomRef, "Container3 rendered");
		$Container = jQuery("#FC3");
		checkContainerClasses(assert, $Container, 3, 1, false, false, 1, false, false, 1, false, true, 1, false, true);
	});

	QUnit.test("Three containers - set columns", function(assert) {
		oColumnLayout.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
		addContainer("FC2");
		addContainer("FC3");

		var $Container = jQuery("#FC1");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 2, true, false);

		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, true, false, 1, true, false, 1, true, false);

		$Container = jQuery("#FC3");
		checkContainerClasses(assert, $Container, 3, 1, false, false, 1, false, true, 1, true, false, 1, true, false);
	});

	QUnit.test("Four containers - default columns", function(assert) {
		addContainer("FC2");
		addContainer("FC3");
		addContainer("FC4");

		var oDomRef = jQuery.sap.domById("FC1");
		assert.ok(oDomRef, "Container1 rendered");
		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLContent"), "content DOM element rendered");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);

		oDomRef = jQuery.sap.domById("FC2");
		assert.ok(oDomRef, "Container2 rendered");
		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, false, false, 1, true, false, 1, true, false);

		oDomRef = jQuery.sap.domById("FC3");
		assert.ok(oDomRef, "Container3 rendered");
		$Container = jQuery("#FC3");
		checkContainerClasses(assert, $Container, 3, 1, false, false, 1, false, false, 1, false, true, 1, false, true);

		oDomRef = jQuery.sap.domById("FC4");
		assert.ok(oDomRef, "Container4 rendered");
		$Container = jQuery("#FC4");
		checkContainerClasses(assert, $Container, 4, 1, false, false, 1, false, false, 1, false, false, 1, false, false);
	});

	QUnit.test("Four containers - set columns", function(assert) {
		oColumnLayout.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
		addContainer("FC2");
		addContainer("FC3");
		addContainer("FC4");

		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLContent"), "content DOM element rendered");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);

		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, true, false, 1, true, false, 1, true, false);

		$Container = jQuery("#FC3");
		checkContainerClasses(assert, $Container, 3, 1, false, false, 1, false, true, 1, true, false, 1, true, false);

		$Container = jQuery("#FC4");
		checkContainerClasses(assert, $Container, 4, 1, false, false, 1, false, false, 1, false, true, 1, true, false);
	});


	QUnit.test("Five containers - default columns", function(assert) {
		addContainer("FC2");
		addContainer("FC3");
		addContainer("FC4");
		addContainer("FC5");

		var oDomRef = jQuery.sap.domById("FC1");
		assert.ok(oDomRef, "Container1 rendered");
		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLContent"), "content DOM element rendered");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);

		oDomRef = jQuery.sap.domById("FC2");
		assert.ok(oDomRef, "Container2 rendered");
		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, false, false, 1, true, false, 1, true, false);

		oDomRef = jQuery.sap.domById("FC3");
		assert.ok(oDomRef, "Container3 rendered");
		$Container = jQuery("#FC3");
		checkContainerClasses(assert, $Container, 3, 1, false, false, 1, false, false, 1, false, true, 1, false, true);

		oDomRef = jQuery.sap.domById("FC4");
		assert.ok(oDomRef, "Container4 rendered");
		$Container = jQuery("#FC4");
		checkContainerClasses(assert, $Container, 4, 1, false, false, 1, false, false, 1, false, false, 1, false, false);

		oDomRef = jQuery.sap.domById("FC5");
		assert.ok(oDomRef, "Container5 rendered");
		$Container = jQuery("#FC5");
		checkContainerClasses(assert, $Container, 5, 1, false, false, 1, false, false, 1, false, true, 1, false, true);
	});

	QUnit.test("Five containers - set columns", function(assert) {
		oColumnLayout.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
		addContainer("FC2");
		addContainer("FC3");
		addContainer("FC4");
		addContainer("FC5");

		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLContent"), "content DOM element rendered");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);

		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, true, false, 1, true, false, 1, true, false);

		$Container = jQuery("#FC3");
		checkContainerClasses(assert, $Container, 3, 1, false, false, 1, false, true, 1, true, false, 1, true, false);

		$Container = jQuery("#FC4");
		checkContainerClasses(assert, $Container, 4, 1, false, false, 1, false, false, 1, false, true, 1, true, false);

		$Container = jQuery("#FC5");
		checkContainerClasses(assert, $Container, 5, 1, false, false, 1, false, true, 1, false, false, 1, false, true);
	});

	QUnit.test("ColumnContainerData - One container", function(assert) {
		var oLayoutData = new ColumnContainerData({columnsM: 1, columnsL: 1, columnsXL: 1});
		oFormContainer1.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();

		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLContent"), "content DOM element rendered");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);
	});

	QUnit.test("ColumnContainerData - two containers", function(assert) {
		oColumnLayout.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
		var oFormContainer2 = addContainer("FC2");
		var oLayoutData = new ColumnContainerData({columnsM: 2, columnsL: 2, columnsXL: 3});
		oFormContainer2.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();

		var $Container = jQuery("#FC1");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);
		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 2, false, true, 2, true, false, 3, true, false);

		oLayoutData.setColumnsM(1).setColumnsL(1).setColumnsXL(1);
		sap.ui.getCore().applyChanges();
		$Container = jQuery("#FC1");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 2, true, false, 3, true, false);
		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, true, false, 1, true, false, 1, true, false);

		oFormContainer2.setLayoutData();
		oLayoutData.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
		oFormContainer1.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();
		$Container = jQuery("#FC1");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 2, true, false, 3, true, false, 4, true, false);
		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, false, true, 1, false, true, 1, false, true);
	});

	QUnit.test("ColumnContainerData - invalid cells", function(assert) {
		var oException;

		try {
			var oLayoutData = new ColumnContainerData({columnsM: 2, columnsL: 3, columnsXL: 4});
			oFormContainer1.setLayoutData(oLayoutData);
			sap.ui.getCore().applyChanges();
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
	});

	QUnit.test("order of elements", function(assert) {
		addElement(oFormContainer1, "FE2");
		addElement(oFormContainer1, "FE3");

		var $Content = jQuery("#FC1-content");
		assert.equal($Content.children().length, 3, "Content has 3 children");
		assert.equal($Content.children()[0].id, "FE1", "FormElement1 is first child");
		assert.equal($Content.children()[1].id, "FE2", "FormElement2 is second child");
		assert.equal($Content.children()[2].id, "FE3", "FormElement3 is third child");
	});

	QUnit.test("invisible element", function(assert) {
		var oFormElement2 = addElement(oFormContainer1, "FE2");
		oFormElement2.setVisible(false);
		addElement(oFormContainer1, "FE3");
		addElement(oFormContainer1, "FE4");

		var $Content = jQuery("#FC1-content");
		assert.equal($Content.children().length, 3, "Content has 2 children");
		assert.equal($Content.children()[0].id, "FE1", "FormElement1 is first child");
		assert.equal($Content.children()[1].id, "FE3", "FormElement3 is second child");
	});

	QUnit.test("getContainerRenderedDomRef", function(assert) {
		var oDom = oColumnLayout.getContainerRenderedDomRef(oFormContainer1);
		assert.ok(oDom, "Dom returned");
		assert.equal(oDom.id, "FC1", "Dom for FormContainer returned");
	});

	QUnit.module("element rendering", {
		beforeEach: initForm,
		afterEach: afterTest
	});

	QUnit.test("Label with one field", function(assert) {
		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 2, "Element has 2 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 12, false, 0, 8, false, 0);
		assert.ok(jQuery("#T1").attr("style").indexOf("100%") > 0, "Control width set to 100%");
	});

	QUnit.test("One field without label", function(assert) {
		oFormElement1.destroyLabel();
		sap.ui.getCore().applyChanges();
		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 1, "Element has 1 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, false, "T1", 12, false, 0, 12, false, 0);
	});

	QUnit.test("Label with two fields", function(assert) {
		oFormElement1.addField(new Text("T2", {text: "Text2"}));
		sap.ui.getCore().applyChanges();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 3, "Element has 3 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 6, false, 0, 4, false, 0);
		checkElementClasses(assert, jQuery(aChildren[2]), 3, false, "T2", 6, false, 0, 4, false, 0);
	});

	QUnit.test("Label with three fields", function(assert) {
		oFormElement1.addField(new Text("T2", {text: "Text2"}));
		oFormElement1.addField(new Text("T3", {text: "Text3"}));
		sap.ui.getCore().applyChanges();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 4, "Element has 4 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 4, false, 0, 4, false, 0);
		checkElementClasses(assert, jQuery(aChildren[2]), 3, false, "T2", 4, false, 0, 2, false, 0);
		checkElementClasses(assert, jQuery(aChildren[3]), 4, false, "T3", 4, false, 0, 2, false, 0);
	});

	QUnit.test("Label with 10 fields", function(assert) {
		oFormElement1.addField(new Text("T2", {text: "Text2"}));
		oFormElement1.addField(new Text("T3", {text: "Text3"}));
		oFormElement1.addField(new Text("T4", {text: "Text4"}));
		oFormElement1.addField(new Text("T5", {text: "Text5"}));
		oFormElement1.addField(new Text("T6", {text: "Text6"}));
		oFormElement1.addField(new Text("T7", {text: "Text7"}));
		oFormElement1.addField(new Text("T8", {text: "Text8"}));
		oFormElement1.addField(new Text("T9", {text: "Text9"}));
		oFormElement1.addField(new Text("T10", {text: "Text10"}));
		sap.ui.getCore().applyChanges();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 11, "Element has 11 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 3, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[2]), 3, false, "T2", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[3]), 4, false, "T3", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[4]), 5, false, "T4", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[5]), 6, false, "T5", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[6]), 7, false, "T6", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[7]), 8, false, "T7", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[8]), 9, false, "T8", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[9]), 10, false, "T9", 1, false, 0, 4, true, 4);
		checkElementClasses(assert, jQuery(aChildren[10]), 11, false, "T10", 1, false, 0, 4, false, 0);
	});

	QUnit.test("Label with 15 fields", function(assert) {
		oFormElement1.addField(new Text("T2", {text: "Text2"}));
		oFormElement1.addField(new Text("T3", {text: "Text3"}));
		oFormElement1.addField(new Text("T4", {text: "Text4"}));
		oFormElement1.addField(new Text("T5", {text: "Text5"}));
		oFormElement1.addField(new Text("T6", {text: "Text6"}));
		oFormElement1.addField(new Text("T7", {text: "Text7"}));
		oFormElement1.addField(new Text("T8", {text: "Text8"}));
		oFormElement1.addField(new Text("T9", {text: "Text9"}));
		oFormElement1.addField(new Text("T10", {text: "Text10"}));
		oFormElement1.addField(new Text("T11", {text: "Text11"}));
		oFormElement1.addField(new Text("T12", {text: "Text12"}));
		oFormElement1.addField(new Text("T13", {text: "Text13"}));
		oFormElement1.addField(new Text("T14", {text: "Text14"}));
		oFormElement1.addField(new Text("T15", {text: "Text15"}));
		sap.ui.getCore().applyChanges();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 16, "Element has 16 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[2]), 3, false, "T2", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[3]), 4, false, "T3", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[4]), 5, false, "T4", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[5]), 6, false, "T5", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[6]), 7, false, "T6", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[7]), 8, false, "T7", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[8]), 9, false, "T8", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[9]), 10, false, "T9", 1, false, 0, 2, true, 4);
		checkElementClasses(assert, jQuery(aChildren[10]), 11, false, "T10", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[11]), 12, false, "T11", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[12]), 13, false, "T12", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[13]), 14, false, "T13", 4, true, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[14]), 15, false, "T14", 4, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[15]), 16, false, "T15", 4, false, 0, 1, false, 0);
	});

	QUnit.test("ColumnElementData on label", function(assert) {
		var oLayoutData = new ColumnElementData({cellsLarge: 12, cellsSmall: 5});
		oLabel1.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 5, false, 0, 12, false, 0);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 7, false, 0, 12, false, 0);
	});

	QUnit.test("ColumnElementData on field", function(assert) {
		oFormElement1.addField(new Text("T2", {text: "Text2"}));
		var oLayoutData = new ColumnElementData({cellsLarge: 1, cellsSmall: 1});
		oField1.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[2]), 3, false, "T2", 11, false, 0, 7, false, 0);
	});

	QUnit.test("ColumnElementData on label and field", function(assert) {
		var oLayoutData = new ColumnElementData({cellsLarge: 3, cellsSmall: 3});
		oLabel1.setLayoutData(oLayoutData);
		oLayoutData = new ColumnElementData({cellsLarge: 5, cellsSmall: 5});
		oField1.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 3, false, 0, 3, false, 0);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 5, false, 0, 5, false, 0);

		oLayoutData.setCellsLarge(10).setCellsSmall(10);
		sap.ui.getCore().applyChanges();
		$Element = jQuery("#FE1");
		aChildren = $Element.children();
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 10, true, 0, 10, true, 0);
	});

	QUnit.test("ColumnElementData on label and fields", function(assert) {
		oField2 = new Text("T2", {text: "Text2"});
		oField3 = new Text("T3", {text: "Text3"});
		oFormElement1.addField(oField2);
		oFormElement1.addField(oField3);
		var oLayoutData = new ColumnElementData({cellsLarge: 3, cellsSmall: 12});
		oLabel1.setLayoutData(oLayoutData);
		oLayoutData = new ColumnElementData({cellsLarge: 8, cellsSmall: 11});
		oField1.setLayoutData(oLayoutData);
		oLayoutData = new ColumnElementData({cellsLarge: 5, cellsSmall: 5});
		oField3.setLayoutData(oLayoutData);
		sap.ui.getCore().applyChanges();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 3, false, 0);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 11, false, 0, 8, false, 0);
		checkElementClasses(assert, jQuery(aChildren[2]), 3, false, "T2", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[3]), 4, false, "T3", 5, true, 0, 5, true, 3);

		oLayoutData.setCellsLarge(10).setCellsSmall(5);
		oLayoutData = oLabel1.getLayoutData();
		oLayoutData.setCellsLarge(3).setCellsSmall(2);
		sap.ui.getCore().applyChanges();
		$Element = jQuery("#FE1");
		aChildren = $Element.children();
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 11, false, 0, 8, false, 0);
		checkElementClasses(assert, jQuery(aChildren[2]), 3, false, "T2", 1, false, 0, 1, false, 0);
		checkElementClasses(assert, jQuery(aChildren[3]), 4, false, "T3", 5, true, 2, 10, true, 0);
	});

	QUnit.test("Tooltip", function(assert) {
		var $Element = jQuery("#FE1");
		assert.notOk($Element.attr("title"), "Element has no tooltip");

		oFormElement1.setTooltip("Test");
		sap.ui.getCore().applyChanges();
		$Element = jQuery("#FE1");
		assert.equal($Element.attr("title"), "Test", "element has tooltip");
	});

	QUnit.test("getElementRenderedDomRef", function(assert) {
		var oDom = oColumnLayout.getElementRenderedDomRef(oFormElement1);
		assert.ok(oDom, "Dom returned");
		assert.equal(oDom.id, "FE1", "FormElemnt Dom returened");
	});

	QUnit.test("invalid content", function(assert) {
		var oToolbar = new Toolbar("TB1");
		var oException;

		try {
			oFormElement1.addField(oToolbar);
			sap.ui.getCore().applyChanges();
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
	});

});