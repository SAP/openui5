/* global QUnit */
sap.ui.define(["sap/ui/core/DeclarativeSupport", "sap/ui/model/json/JSONModel"], function(DeclarativeSupport, JSONModel) {
	"use strict";
	QUnit.module("Basic");


	QUnit.test("Id", function(assert) {
		assert.expect(2);
		var $element = jQuery("#basic-id");
		var sId = DeclarativeSupport._getId($element.find("#basicId"));
		assert.equal(sId, "basicId", "Id is retrieved right");
		assert.equal($element.find("#basicId").length, 0, "Id is removed");
	});


	QUnit.module("Compile");


	QUnit.test("Simple Button", function(assert) {
		assert.expect(3);

		var oButton = sap.ui.getCore().byId("simpleButton");
		assert.equal(!!oButton, false, 'No control with id "simpleButton" found.');

		DeclarativeSupport.compile(jQuery("#simple-button"));

		var oButton = sap.ui.getCore().byId("simpleButton");
		assert.ok(!!oButton, 'Control with id "simpleButton" found.');
		assert.equal(oButton.getText(), "My Button", "Text is set right");
	});


	QUnit.test("Test special attribute handling", function(assert) {
		assert.expect(3);
		var backup = null;
		try {
			backup = DeclarativeSupport.attributes["data-tooltip"];
			DeclarativeSupport.attributes["data-tooltip"] = function() {
				assert.ok(true, "Called special attribute handling");
			};
			var oButton = sap.ui.getCore().byId("buttonWithTooltip");
			assert.equal(!!oButton, false, 'No control with id "buttonWithTooltip" found.');
			DeclarativeSupport.compile(jQuery("#button-with-tooltip"));
			var oButton = sap.ui.getCore().byId("buttonWithTooltip");
			assert.ok(!!oButton, 'Control with id "buttonWithTooltip" found.');
		} catch (exc) {
			throw exc;
		} finally {
			if (backup) {
				DeclarativeSupport.attributes["data-tooltip"] = backup;
			}
		}
	});


	QUnit.test("Button with style and class", function(assert) {
		assert.expect(3);

		var oButton = sap.ui.getCore().byId("buttonStyleClass");
		assert.equal(!!oButton, false, 'No control with id "buttonStyleClass" found.');

		DeclarativeSupport.compile(jQuery("#button-with-style-and-class"));

		var oButton = sap.ui.getCore().byId("buttonStyleClass");
		assert.ok(!!oButton, 'Control with id "buttonStyleClass" found.');
		assert.ok(!!oButton.hasStyleClass("mybutton"), 'Control has right classes.');
	});


	QUnit.test("HTML Content", function(assert) {
		assert.expect(4);
		var oButton = sap.ui.getCore().byId("htmlContentButton");
		assert.equal(!!oButton, false, 'No control with id "htmlContentButton" found.');

		DeclarativeSupport.compile(jQuery("#html-content"));

		var oButton = sap.ui.getCore().byId("htmlContentButton");
		assert.ok(!!oButton, 'Control with id "htmlContentButton" found.');

		var oPanel = sap.ui.getCore().byId("htmlContentPanel");
		assert.ok(!!oPanel, 'Control with id "htmlContentPanel" found.');

		assert.equal(oPanel.getTitle().getText(), "SAPUI5 Content in HTML Table in SAPUI5 Panel", "Text is set right");
	});


	QUnit.test("Panel aggregation", function(assert) {
		assert.expect(4);
		var oPanel = sap.ui.getCore().byId("panelAggregation");
		assert.equal(!!oPanel, false, 'No control with id "panelAggregation" found.');

		DeclarativeSupport.compile(jQuery("#panel-aggregation"));

		var oPanel = sap.ui.getCore().byId("panelAggregation");
		assert.ok(!!oPanel, 'Control with id "panelAggregation" found.');

		assert.equal(oPanel.getTitle().getText(), "Panel Aggregation", "Text is set right");
		assert.equal(oPanel.getContent().length, 6, "Number of child controls is right");
	});


	QUnit.test("Panel with default aggregation", function(assert) {
		assert.expect(4);
		var oPanel = sap.ui.getCore().byId("panelWithDefaultAggregation");
		assert.equal(!!oPanel, false, 'No control with id "panelWithDefaultAggregation" found.');

		DeclarativeSupport.compile(jQuery("#panel-with-default-aggregation"));

		var oPanel = sap.ui.getCore().byId("panelWithDefaultAggregation");
		assert.ok(!!oPanel, 'Control with id "panelWithDefaultAggregation" found.');

		assert.equal(oPanel.getTitle().getText(), "Panel With Default Aggregation", "Text is set right");
		assert.equal(oPanel.getContent().length, 6, "Number of child controls is right");
	});

	QUnit.test("Panel with association", function(assert) {
		assert.expect(6);
		var oPanel = sap.ui.getCore().byId("panelWithAssociation");
		assert.equal(!!oPanel, false, 'No control with id "panelWithAssociation" found.');

		DeclarativeSupport.compile(jQuery("#panel-with-association"));

		var oPanel = sap.ui.getCore().byId("panelWithAssociation");
		assert.ok(!!oPanel, 'Control with id "panelWithAssociation" found.');

		assert.equal(oPanel.getContent().length, 3, "Number of child controls is right");
		var oLabel = oPanel.getContent()[0];
		assert.equal(oLabel.getLabelFor(), "message", "Assocation id is set right");
		var oNavigationBar = oPanel.getContent()[2];
		assert.equal(oNavigationBar.getAssociatedItems().length, 3, "Number of associated controls is right");
		assert.deepEqual(oNavigationBar.getAssociatedItems(), ["navitem1", "navitem2", "navitem3"], "Number of associated controls is right", "Assocation IDs are set right");
	});



	QUnit.test("UIArea", function(assert) {
		assert.expect(7);
		var oUIArea = sap.ui.getCore().getUIArea("uiAreaSimple");
		assert.equal(!!oUIArea, false, 'No control with id "uiAreaSimple" found.');

		var oButton1 = sap.ui.getCore().byId("uiAreaSimpleButton2");
		assert.equal(!!oButton1, false, 'No control with id "uiAreaSimpleButton2" found.');

		var oButton2 = sap.ui.getCore().byId("uiAreaSimpleButton2");
		assert.equal(!!oButton2, false, 'No control with id "uiAreaSimpleButton2" found.');

		DeclarativeSupport.compile(jQuery("#ui-area-simple"));

		var oUIArea = sap.ui.getCore().getUIArea("uiAreaSimple");
		assert.ok(!!oUIArea, 'UIArea with id "uiAreaSimple" found.');

		var oButton1 = sap.ui.getCore().byId("uiAreaSimpleButton2");
		assert.ok(!!oButton1, 'Control with id "uiAreaSimpleButton2" found.');

		var oButton2 = sap.ui.getCore().byId("uiAreaSimpleButton2");
		assert.ok(!!oButton2, 'Control with id "uiAreaSimpleButton2" found.');

		assert.equal(oButton2.getUIArea().getId(), "uiAreaSimple", "UI Areas are the same");
	});


	QUnit.test("Complex Declaration", function(assert) {
		assert.expect(8);
		var oUIArea = sap.ui.getCore().getUIArea("complexDeclarationUIArea");
		assert.equal(!!oUIArea, false, 'No control with id "complexDeclarationUIArea" found.');

		var oPanel1 = sap.ui.getCore().byId("complexDeclarationPanel1");
		assert.equal(!!oPanel1, false, 'No control with id "complexDeclarationPanel1" found.');

		var oPanel2 = sap.ui.getCore().byId("complexDeclarationPanel2");
		assert.equal(!!oPanel2, false, 'No control with id "complexDeclarationPanel2" found.');

		var oPanel3 = sap.ui.getCore().byId("complexDeclarationPanel3");
		assert.equal(!!oPanel2, false, 'No control with id "complexDeclarationPanel3" found.');

		window.handlePress = function(evt) {
			assert.ok(true, "Handler is called");
		};

		DeclarativeSupport.compile(jQuery("#complex-declaration"));

		var oUIArea = sap.ui.getCore().getUIArea("complexDeclarationUIArea");
		assert.ok(!!oUIArea, 'Control with id "complexDeclarationUIArea" found.');

		var oPanel1 = sap.ui.getCore().byId("complexDeclarationPanel1");
		assert.ok(!!oPanel1, 'Control with id "complexDeclarationPanel1" found.');

		var oPanel2 = sap.ui.getCore().byId("complexDeclarationPanel2");
		assert.ok(!!oPanel2, 'Control with id "complexDeclarationPanel2" found.');

		var oPanel3 = sap.ui.getCore().byId("complexDeclarationPanel3");
		assert.ok(!!oPanel3, 'Control with id "complexDeclarationPanel3" found.');

		delete window.handlePress;
	});

	QUnit.test("Events", function(assert) {
		assert.expect(3);
		var oButton1 = sap.ui.getCore().byId("buttonWithEvent");
		assert.equal(!!oButton1, false, 'No control with id "buttonWithEvent" found.');

		window.handlePress = function(evt) {
			assert.ok(true, "Handler is called");
		};

		DeclarativeSupport.compile(jQuery("#events"));

		var oButton1 = sap.ui.getCore().byId("buttonWithEvent");
		assert.ok(!!oButton1, 'Control with id "buttonWithEvent" found.');
		oButton1.firePress();

		delete window.handlePress;
	});


	QUnit.test("AltType", function(assert) {
		assert.expect(3);
		var oForm = sap.ui.getCore().byId("form");
		assert.equal(!!oForm, false, 'No control with id "form" found.');

		DeclarativeSupport.compile(jQuery("#altType"));

		var oForm = sap.ui.getCore().byId("form");
		assert.ok(!!oForm, 'Control with id "form" found.');

		assert.equal(oForm.getTitle(), "Alt type works", "Title is set right");
	});


	QUnit.test("Events Undefined Error", function(assert) {
		assert.expect(1);
		var bThrown = false;
		try {
			DeclarativeSupport.compile(jQuery("#events-error"));
		} catch (exc) {
			bThrown = true;
		}
		assert.ok(bThrown, "Undefined event handler throws error");
		jQuery("#events-error").remove();
	});

	/* TODO: Add this test once the deprecation warnings are removed
	QUnit.test("Data Attributes", function(assert) {
		assert.expect(1);
		var bThrown = false;
		try {
			DeclarativeSupport.compile(jQuery("#data-attributes"));
		} catch (exc) {
			bThrown = true;
		}
		assert.ok(bThrown, "Missing data-* prefix for attributes throws error");
		jQuery("#data-attributes").remove();
	});
	*/


	QUnit.test("DataBinding", function(assert) {
		assert.expect(8);
		var oButton1 = sap.ui.getCore().byId("buttonDataBinding");
		assert.equal(!!oButton1, false, 'No control with id "buttonDataBinding" found.');

		var oCarousel = sap.ui.getCore().byId("aggregationDataBinding");
		assert.equal(!!oCarousel, false, 'No control with id "aggregationDataBinding" found.');

		var oModel1 = new JSONModel({
			booleanValue: true,
			stringValue: 'Text1'
		});

		var oModel2 = new JSONModel({
			booleanValue: true,
			stringValue: 'Text1',
			buttons: [{
				title: "button1"
			}, {
				title: "button2"
			}]
		});

		DeclarativeSupport.compile(jQuery("#databinding"));

		var oButton1 = sap.ui.getCore().byId("buttonDataBinding");
		assert.ok(!!oButton1, 'Control with id "buttonWithEvent" found.');

		oButton1.setModel(oModel1);
		oButton1.setModel(oModel2, "model2");
		assert.equal(oButton1.getEnabled(), oModel1.getData().booleanValue, "Check 'enabled' property of button 'buttonDataBinding'");
		assert.equal(oButton1.getText(), oModel1.getData().stringValue, "Check 'text' property of button 'buttonDataBinding'");


		var oCarousel = sap.ui.getCore().byId("aggregationDataBinding");

		var oCarousel = sap.ui.getCore().byId("aggregationDataBinding");
		assert.ok(!!oCarousel, 'Control with id "aggregationDataBinding" found.');


		oCarousel.setModel(oModel2);

		assert.equal(oCarousel.getContent().length, 2, "Two controls found in content");
		assert.equal(oCarousel.getContent()[0].getText(), "button1", "Title is set right");

	});


	QUnit.test("No Polution", function(assert) {
		assert.expect(3);
		assert.equal(jQuery.find("[data-sap-ui-type]").length, 0, 'No elements with attribute "data-sap-ui-type" found"');
		assert.equal(jQuery.find("[data-sap-ui-aggregation]").length, 0, 'No elements with attribute "data-sap-ui-aggregation" found"');
		assert.equal(jQuery.find("[data-sap-ui-default-aggregation]").length, 0, 'No elements with attribute "data-sap-ui-default-aggregation" found"');
	});

	QUnit.test("Custom Data", function(assert) {
		assert.expect(2);
		var oButton = sap.ui.getCore().byId("simpleButton");
		assert.equal(oButton.data("customData1"), "customvalue", 'Custom Data not applied!');
		assert.equal(oButton.data("CustomData2"), "customvalue", 'Custom Data not applied!');
	});

});