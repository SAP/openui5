/*global QUnit, sinon */
sap.ui.define([
    "sap/ui/qunit/QUnitUtils",
    "sap/ui/qunit/utils/createAndAppendDiv",
    "sap/ui/commons/library",
    "sap/ui/ux3/ThingGroup",
    "sap/ui/ux3/OverlayContainer",
    "sap/ui/ux3/ActionBar",
    "sap/ui/ux3/ThingAction",
    "sap/ui/ux3/ThingViewer",
    "sap/ui/ux3/NavigationItem",
    "sap/ui/thirdparty/jquery",
    "sap/ui/commons/Label",
    "sap/ui/commons/TextView",
    "sap/ui/commons/layout/MatrixLayoutCell",
    "sap/ui/commons/layout/MatrixLayoutRow",
    "sap/ui/commons/Button",
    "sap/ui/commons/layout/MatrixLayout"
], function(
    qutils,
	createAndAppendDiv,
	commonsLibrary,
	ThingGroup,
	OverlayContainer,
	ActionBar,
	ThingAction,
	ThingViewer,
	NavigationItem,
	jQuery,
	Label,
	TextView,
	MatrixLayoutCell,
	MatrixLayoutRow,
	Button,
	MatrixLayout
) {
	"use strict";

    // shortcut for sap.ui.commons.layout.VAlign
	var VAlign = commonsLibrary.layout.VAlign;

	// shortcut for sap.ui.commons.layout.HAlign
	var HAlign = commonsLibrary.layout.HAlign;


	// prepare DOM
	createAndAppendDiv("uiArea1");


	// helper function to create a row with label and text
	function createLMatrixLayoutRowRow(sLabel, sText) {
		var oLabel = new Label({
			text : sLabel + ":"
		});
		var oTextView = new TextView({
			text : sText
		});

		var oMLCell1 = new MatrixLayoutCell({
			hAlign : HAlign.End,
			vAlign : VAlign.Top,
			content : [ oLabel ]
		});
		var oMLCell2 = new MatrixLayoutCell({
			hAlign : HAlign.Begin,
			vAlign : VAlign.Top,
			content : [ oTextView ]
		});

		return new MatrixLayoutRow({
			cells : [ oMLCell1, oMLCell2 ]
		});
	}

	var oActionBar, oThingViewer, oOverlayContainer, action, facet;

	//event handler for facet event, action and standard action events, for close and open event
	function facetSelectedEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "facet select event handler has been executed."); // this test tests by just being counted in the respective test
		var id = oEvent.getParameter("id");
		QUnit.config.current.assert.equal(id, facet, facet + " Facet should be selected");
		var oTG1 = new ThingGroup({
			title : "Block1"
		});
		oTG1.addContent(new Button(oThingViewer.getId() + facet + "FacetButton", {
			text : id
		}));
		oThingViewer.addFacetContent(oTG1);
	}

	function actionSelectedEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "action select event handler has been executed."); // this test tests by just being counted in the respective test
		var id = oEvent.getParameter("id");
		QUnit.config.current.assert.equal(id, action, action + " Action should be selected");
	}

	function feedSubmitEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "feed submit event handler has been executed."); // this test tests by just being counted in the respective test
		var text = oEvent.getParameter("text");
		QUnit.config.current.assert.equal(text, "my feed entry", "Feed text should be 'my feed entry'");
	}


	oOverlayContainer = new OverlayContainer();
	oActionBar = new ActionBar( { businessActions : [ // add some actions
		new ThingAction("survey", {
			text : "Create Survey"
		}), new ThingAction("delete", {
			text : "Delete"
		}), new ThingAction("duplicate", {
			text : "Duplicate"
		}) ],
		actionSelected : actionSelectedEventHandler,
		feedSubmit : feedSubmitEventHandler}
	);
	oThingViewer = new ThingViewer("myThingViewer", {
		icon : "test-resources/sap/ui/ux3/images/Account_48.png", // put the Account icon
		title : "My Thing Viewer", // give a title
		type : "Account", // give thing type
		facets : [ // add some facets
			new NavigationItem("overview", {
				key : "overview",
				text : "Overview"
			}), new NavigationItem("activities", {
				key : "activities",
				text : "Activities"
			}) ],
		facetSelected : facetSelectedEventHandler
	});
	oThingViewer.setActionBar(oActionBar);
	oOverlayContainer.addContent(oThingViewer);
	// set content for the header
	var oTC1 = new ThingGroup({
		title : "About"
	});
	var oTC2 = new ThingGroup({
		title : "Contact"
	});
	var oLayout = new MatrixLayout();
	oLayout.addRow(createLMatrixLayoutRowRow("Status", "active"));
	oLayout.addRow(createLMatrixLayoutRowRow("Owner", "Erwin M."));
	oLayout.addRow(createLMatrixLayoutRowRow("Territory", "a Contact"));
	oLayout.addRow(createLMatrixLayoutRowRow("Prim. Contact", "Hugo"));
	oLayout.addRow(createLMatrixLayoutRowRow("Web Site", "link!!!"));
	oLayout.addRow(createLMatrixLayoutRowRow("Classification", "a classification"));
	oTC1.addContent(oLayout);
	oThingViewer.addHeaderContent(oTC1);

	var oLayout2 = new MatrixLayout();
	oLayout2.addRow(createLMatrixLayoutRowRow("Address", "Irgendwo, Strasse + HNr."));
	oLayout2.addRow(createLMatrixLayoutRowRow("Phone", "06221/23428374"));
	oLayout2.addRow(createLMatrixLayoutRowRow("Fax", "06221/23423432"));
	oLayout2.addRow(createLMatrixLayoutRowRow("Email", "hugo.m@web.de"));
	oTC2.addContent(oLayout2);
	oThingViewer.addHeaderContent(oTC2);

	//oThingViewer.placeAt("uiArea1");



	QUnit.module("Appearance");

	QUnit.test("ThingViewer exists", function(assert) {
		oOverlayContainer.open();
		var oDomRef = oThingViewer.getDomRef();
		assert.ok(oDomRef, "Rendered ThingViewer should exist in the page");
		assert.equal(oDomRef.className, "sapUiUx3TV", "Rendered ThingViewer should have the class 'sapUiUx3TV'");
	});

	QUnit.test("Swatch", function(assert) {
		var oSwatch = oThingViewer.getDomRef("swatch");
		assert.ok(oSwatch, "Rendered Swatch should exist in the page");
		assert.equal(oSwatch.className, "sapUiUx3TVIcon", "Rendered Swatch should have the class 'sapUiUx3TVIcon'");
	});

	QUnit.test("Facets", function(assert) {
		//number of navigation items must be the same as number of facets
		var facets = oThingViewer.getFacets();
		for (var i = 0; i < facets.length; i++) {
			assert.ok(facets[i].sId ? window.document.getElementById(facets[i].sId) : null, "Rendered ThingViewer Facet " + facets[i].sId + " should exist in the page");
		}
	});

	QUnit.test("Toolbar",	function(assert) {
		var oActionBar = oThingViewer.getActionBar();
		assert.ok(oActionBar, "ActionBar should exist");
		assert.ok(jQuery(".sapUiUx3ActionBar")[0], "ActionBar rendering ok");
		oThingViewer.setActionBar();
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery(".sapUiUx3ActionBar")[0], "ActionBar should be destroyed");
		oThingViewer.setActionBar(oActionBar);
	});

	QUnit.module("Behaviour");

	QUnit.test("FacetSelected Event", function(assert) {
		var done = assert.async();
		assert.expect(3);
		facet = "activities";
		qutils.triggerMouseEvent(window.document.getElementById("activities"), "click", 1, 1, 1, 1);
		setTimeout(
				function() {
					assert.ok(document.getElementById(oThingViewer.getId() + facet + "FacetButton"), "Rendered Facet Content for facet " + facet
					+ " should exist in the page");
					done();
				}, 500);
	});

	QUnit.test("Destroy and remove control", function(assert) {
		oThingViewer.destroy();
		oOverlayContainer.close();
		sap.ui.getCore().applyChanges();
		var oDomRef = oThingViewer.getDomRef();
		assert.ok(!oDomRef, "Rendered ThingViewer should not exist in the page after destruction");
	});

	QUnit.module("Aggregation overrides", {
		beforeEach : function () {
			this.oTV = new ThingViewer({

			});
			this.oTV.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oTV.destroy();
			this.oTV = null;
		}
	});

	QUnit.test("setSubtitle ",function(assert) {
		sinon.spy(this.oTV, "_rerenderHeader");
		this.oTV.setSubtitle("title");

		assert.strictEqual(this.oTV.getSubtitle(), "title", "subtitle is set correctly");
		assert.ok(this.oTV._rerenderHeader.calledOnce, "_rerenderHeader is called once");
		this.oTV._rerenderHeader.restore();
	});

	QUnit.test("insertFacet",function(assert) {

		var facet1 = new NavigationItem("overview1", {
			key: "overview",
			text: "Overview"
		});
		var facet2 = new NavigationItem("overview2", {
			key: "overview",
			text: "Overview"
		});

		this.oTV.insertFacet(facet1, 0);
		this.oTV.insertFacet(facet2, 1);

		assert.strictEqual(this.oTV.getFacets().indexOf(facet1), 0, "the inserted facets exists");
		assert.strictEqual(this.oTV.getFacets().indexOf(facet2), 1, "the inserted facets exists");

	});

	QUnit.test("removeFacet",function(assert) {

		var facet1 = new NavigationItem("overview3", {
			key: "overview",
			text: "Overview"
		});

		this.oTV.insertFacet(facet1, 0);
		this.oTV.removeFacet(facet1);

		assert.strictEqual(this.oTV.getFacets().indexOf(facet1), -1, "the facet is removed");

	});

	QUnit.test("removeAllFacets",function(assert) {

		var facet1 = new NavigationItem("overview4", {
			key: "overview",
			text: "Overview"
		});
		var facet2 = new NavigationItem("overview5", {
			key: "overview",
			text: "Overview"
		});

		this.oTV.insertFacet(facet1, 0);
		this.oTV.insertFacet(facet2, 1);
		this.oTV.removeAllFacets();

		assert.strictEqual(this.oTV.getFacets().length, 0, "all facets are removed");
	});

	QUnit.test("destroyFacets",function(assert) {

		var facet1 = new NavigationItem("overview6", {
			key: "overview",
			text: "Overview"
		});
		var facet2 = new NavigationItem("overview7", {
			key: "overview",
			text: "Overview"
		});

		this.oTV.insertFacet(facet1, 0);
		this.oTV.insertFacet(facet2, 1);
		this.oTV.destroyFacets();

		assert.strictEqual(this.oTV.getFacets().length, 0, "all facets are destroyed");
	});

	QUnit.test("setIcon",function(assert) {
		this.oTV.setIcon("sap-icon://home");
		assert.strictEqual(this.oTV.getIcon(), "sap-icon://home", "icon is set correctly");
	});

	QUnit.test("insertFacetContent",function(assert) {

		var facet1 = new ThingGroup("overview8", {
			title: "Overview"
		});
		var facet2 = new ThingGroup("overview9", {
			title: "Overview"
		});

		this.oTV.insertFacetContent(facet1, 0);
		this.oTV.insertFacetContent(facet2, 1);

		assert.strictEqual(this.oTV.getFacetContent()[0], facet1, "the content is inserted");
		assert.strictEqual(this.oTV.getFacetContent()[1], facet2, "the content is inserted");
	});

	QUnit.test("addFacetContent",function(assert) {

		var facet1 = new ThingGroup("overview10", {
			title: "Overview"
		});

		this.oTV.addFacetContent(facet1);
		assert.strictEqual(this.oTV.getFacetContent()[0], facet1, "the content is added");
	});

	QUnit.test("removeFacetContent",function(assert) {

		var facet1 = new ThingGroup("overview11", {
			title: "Overview"
		});

		this.oTV.addFacetContent(facet1);
		this.oTV.removeFacetContent(facet1);

		assert.strictEqual(this.oTV.getFacetContent().indexOf(facet1), -1, "the facet content is removed");
	});

	QUnit.test("removeAllFacetContent",function(assert) {

		var facet1 = new ThingGroup("overview12", {
			title: "Overview"
		});
		var facet2 = new ThingGroup("overview13", {
			title: "Overview"
		});

		this.oTV.addFacetContent(facet1);
		this.oTV.addFacetContent(facet2);
		this.oTV.removeAllFacetContent();

		assert.strictEqual(this.oTV.getFacetContent().length, 0, "all facets are removed");
	});

	QUnit.test("destroyFacetContent",function(assert) {

		var facet1 = new ThingGroup("overview14", {
			title: "Overview"
		});

		this.oTV.addFacetContent(facet1);
		this.oTV.destroyFacetContent(facet1);

		assert.strictEqual(this.oTV.getFacetContent().indexOf(facet1), -1, "the facet content is destroyed");
	});

	QUnit.test("insertHeaderContent",function(assert) {

		var facet1 = new ThingGroup("overview15", {
			title: "Overview"
		});
		var facet2 = new ThingGroup("overview16", {
			title: "Overview"
		});

		this.oTV.insertHeaderContent(facet1, 0);
		this.oTV.insertHeaderContent(facet2, 1);

		assert.strictEqual(this.oTV.getHeaderContent()[0], facet1, "the header content is inserted");
		assert.strictEqual(this.oTV.getHeaderContent()[1], facet2, "the header content is inserted");
	});

	QUnit.test("removeHeaderContent ",function(assert) {

		var facet1 = new ThingGroup("overview17", {
			title: "Overview"
		});

		this.oTV.addHeaderContent(facet1);
		this.oTV.removeHeaderContent(facet1);

		assert.strictEqual(this.oTV.getHeaderContent().indexOf(facet1), -1, "the header content is removed");
	});

	QUnit.test("removeAllHeaderContent",function(assert) {

		var facet1 = new ThingGroup("overview18", {
			title: "Overview"
		});
		var facet2 = new ThingGroup("overview19", {
			title: "Overview"
		});

		this.oTV.addHeaderContent(facet1);
		this.oTV.addHeaderContent(facet2);
		this.oTV.removeAllHeaderContent();

		assert.strictEqual(this.oTV.getHeaderContent().length, 0, "all header content is removed");
	});

	QUnit.test("destroyHeaderContent",function(assert) {

		var facet1 = new ThingGroup("overview20", {
			title: "Overview"
		});

		this.oTV.addHeaderContent(facet1);
		this.oTV.destroyHeaderContent(facet1);

		assert.strictEqual(this.oTV.getHeaderContent().indexOf(facet1), -1, "the header content is destroyed");
	});
});