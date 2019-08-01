/*global QUnit */
sap.ui.define([
    "sap/ui/qunit/QUnitUtils",
    "sap/ui/qunit/utils/createAndAppendDiv",
    "sap/ui/model/json/JSONModel",
    "sap/ui/commons/Button",
    "sap/ui/commons/TextView",
    "sap/ui/commons/Link",
    "sap/ui/commons/library",
    "sap/ui/ux3/QuickView",
    "sap/ui/thirdparty/jquery",
    "sap/ui/commons/layout/MatrixLayoutCell",
    "sap/ui/commons/layout/MatrixLayoutRow",
    "sap/ui/commons/layout/MatrixLayout",
    "sap/ui/events/KeyCodes"
], function(
    qutils,
	createAndAppendDiv,
	JSONModel,
	Button,
	TextView,
	Link,
	commonsLibrary,
	QuickView,
	jQuery,
	MatrixLayoutCell,
	MatrixLayoutRow,
	MatrixLayout,
	KeyCodes
) {
	"use strict";

    // shortcut for sap.ui.commons.layout.VAlign
	var VAlign = commonsLibrary.layout.VAlign;

	// shortcut for sap.ui.commons.layout.HAlign
	var HAlign = commonsLibrary.layout.HAlign;


	// prepare DOM
	createAndAppendDiv("uiArea1");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		"#uiArea1 {" +
		"	width: 250px;" +
		"	margin: auto;" +
		"}";
	document.head.appendChild(styleElement);



	// Example data
	var oJSONData = {
		"type": "Thing Type",
		"name": "Name",
		"href": "http://www.google.com",
		"description":  "Description",
		"icon": "test-resources/sap/ui/ux3/images/feeder/m_01.png",
		"accountData": [
			{ "label": "label1", "text": "text1" },
			{ "label": "label2", "text": "text2" },
			{ "label": "label3", "text": "text3" },
			{ "label": "label4", "text": "link4", "href": "http://www.google.com" }
		]
	};
	var oModel = new JSONModel();
	oModel.setData(oJSONData);
	sap.ui.getCore().setModel(oModel);

	// Parent control
	var oButton = new Button("QVButton");
	oButton.setText("QuickView");
	oButton.setLite(true);


	// 1. create a QuickView form content
	function createQuickViewContent(){
		// In form of "label: value", the value can be either a link or a text view
		// Both (link and text view are created but only one is shown depending on the contents)
		var oLabel = new TextView()
			.bindProperty("text", "label", function( label ){ return label ? label + ":" : ""; });
		var oTextView = new TextView({text : "{text}"})
			.bindProperty("visible", "href", function( href ){ return !href; });
		var oLink = new Link({text : "{text}", href: "{href}"})
			.bindProperty("visible", "href", function( href ){ return !!href; });

		var oLeftCell = new MatrixLayoutCell({hAlign : HAlign.End, vAlign : VAlign.Top, content:[oLabel]});
		oLeftCell.addStyleClass("qvlabel");
		var oRightCell = new MatrixLayoutCell({hAlign : HAlign.Begin, vAlign : VAlign.Top, content:[oTextView, oLink]});
		oRightCell.addStyleClass("qvvalue");

		var oRow = new MatrixLayoutRow({cells:[oLeftCell, oRightCell]});

		var oContent = new MatrixLayout({layoutFixed:true, widths: ["45%", "140px"]});
		oContent.bindAggregation("rows", "/accountData", oRow);

		return oContent;
	}

	var testDataQV = {};

	// Event handlers from QuickViews
	function onOpen(event){
		testDataQV.opened = true;
	}

	function onClose(event){
		testDataQV.closed = true;
	}

	function onNavigate(event){
		// suppress link navigation from a QuickView
		event.preventDefault();
		// Close the QuickView after a click on a link
		event.getSource().close();
		testDataQV.navigate = true;
	}

	var oActionParams = {};
	function onActionSelected(event){
		oActionParams = event.getParameters();
	}

	// 2. create a QuickView control
	var oQuickView = new QuickView( "QuickView", {
		type:			"{/type}",
		firstTitle:		"{/name}",
		firstTitleHref:	"{/href}",
		secondTitle:	"{/description}",
		icon:			"{/icon}",
		content:		createQuickViewContent(),
		open:			onOpen,
		close:			onClose,
		navigate:		onNavigate,
		actionSelected:	onActionSelected
	});

	// 3. Attach the QuickView to the parent control
	oButton.setTooltip(oQuickView);
	oButton.placeAt("uiArea1");

	// TEST functions

	QUnit.module("Appearance");

	QUnit.test("Assignment of elements", function(assert) {
		// Tooltip
		assert.equal(sap.ui.getCore().getControl("QVButton").getTooltip().getId(),
				"QuickView", "QuickView is assigned as a tooltip to a button");
	});

	function isQuickViewVisible(){
		return jQuery("#QuickView").filter(":visible").size() > 0;
	}

	QUnit.module("QuickView: open and close");
	QUnit.test("Open QuickView", function(assert) {
		var done = assert.async();
		assert.ok(true, "A-sync OK start");
		qutils.triggerMouseEvent("QVButton", "mouseover");
		setTimeout(function() {
			assert.ok(isQuickViewVisible() == true, "QuickView is visible after mouseover");
			qutils.triggerMouseEvent("QuickView", "mouseout");
			setTimeout(function() {
				assert.ok(isQuickViewVisible() == false, "QuickView is not visible after mouseout");
				done();
			}, 600);
		}, 900);
	});

	QUnit.test("Close using close method", function(assert) {
		var done = assert.async();
		assert.ok(true, "A-sync close() start");
		qutils.triggerMouseEvent("QVButton", "mouseover");
		setTimeout(function() {
			assert.ok(isQuickViewVisible() == true, "QuickView is visible after mouseover");
			oQuickView.close();
			setTimeout(function() {
				assert.ok(isQuickViewVisible() == false, "QuickView is not visible after close()");
				done();
			}, 500);
		}, 700);
	});

	QUnit.module("QuickView: navigation event");
	QUnit.test("Click on a link", function(assert) {
		var done = assert.async();
		oButton.focus();
		assert.ok(document.activeElement.id == "QVButton", "Focus the button initially");
		qutils.triggerKeyboardEvent("QVButton", KeyCodes.I, false, false, true);
		setTimeout(function(){
			//click on the Name link
			 jQuery('#QuickView-link').trigger('click');
			setTimeout(function(){
				assert.ok(isQuickViewVisible() == false, "QuickView is not visible after navigate event");
				assert.equal(document.activeElement.id, "QVButton", "The parent element should be focused after the focused QuickView is closed");
				done();
			}, 1000); // CLOSE
		}, 1000); // OPEN
	});

	QUnit.test("Toolbar Actions", function(assert) {
		var done = assert.async();
		assert.ok(true, "A-sync close() start");
		qutils.triggerMouseEvent("QVButton", "mouseover");
		setTimeout(function() {
			assert.ok(isQuickViewVisible() == true, "QuickView is visible after mouseover");
			jQuery('.sapUiUx3ActionBarAction').eq(1).trigger("click");
			setTimeout(function() {
				assert.ok(oActionParams.id !== undefined, "Action id is available after click on action");
				oQuickView.close();
				done();
			}, 400);
		}, 500);
	});

	QUnit.module("QuickView: content");

	QUnit.test("Icons", function(assert) {
		var done = assert.async();
		assert.ok(true, "A-sync close() start");
		qutils.triggerMouseEvent("QVButton", "mouseover");
		setTimeout(function() {
			assert.ok(jQuery('#QuickView img.sapUiUx3QVIcon').length, "QV-Icon is rendered as img");
			oModel.setProperty("/icon", "sap-icon://save");
			setTimeout(function() {
				assert.ok(!jQuery('#QuickView img.sapUiUx3QVIcon').length, "QV-Icon with icon font not rendered as img");
				assert.ok(jQuery('#QuickView span.sapUiUx3QVIcon').length, "QV-Icon with icon font rendered as span");
				oQuickView.close();
				done();
			}, 400);
		}, 500);
	});
});