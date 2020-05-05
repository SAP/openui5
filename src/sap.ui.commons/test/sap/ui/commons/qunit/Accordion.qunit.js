/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/Accordion",
	"sap/ui/commons/AccordionSection",
	"sap/ui/commons/Button",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes"
], function(
	qutils,
	createAndAppendDiv,
	Accordion,
	AccordionSection,
	Button,
	jQuery,
	KeyCodes
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("uiArea1");


	function createAccordion(bNoSections) {
		//Accordion 1 --> Constructor and setters to fill properties
		var oAccordion1 = new Accordion("accordion1");

		if (!bNoSections) {
			//Section 1
			var oSection1 = new AccordionSection( "section1" );
			oSection1.setTitle("My section 1");
			for (var i = 0; i < 5; i++){
				var oButton1 = new Button( "Button1" + i );
				oButton1.setText("Button1 " + i);
				oSection1.addContent( oButton1);
			}
			oAccordion1.addSection( oSection1 );

			//Section 2
			var oSection2 = new AccordionSection( "section2");
			oSection2.setTitle("My section 2");
			for (var i = 0; i < 5; i++){
				var oButton2 = new Button( "Button2" + i );
				oButton2.setText("Button2 " + i);
				oSection2.addContent( oButton2);
			}
			oAccordion1.addSection( oSection2 );

			//Building Section 3
			var oSection3 = new AccordionSection( "section3");
			oSection3.setTitle("My section 3");
			oSection3.setEnabled(false);
			var oButton3 = new Button( "Button3" );
			oSection3.addContent( oButton3);
			oAccordion1.addSection( oSection3 );

			//Building Section 4
			var oSection4 = new AccordionSection( "section4");
			oSection4.setTitle("My section 4");
			var oButton4 = new Button( "Button4" );
			oButton4.setWidth("200px");
			oSection4.addContent( oButton4);
			oAccordion1.addSection( oSection4 );
		}


		oAccordion1.placeAt("uiArea1");

		return oAccordion1;
	}


	QUnit.module("Accordion API and Properties", {
		beforeEach : function () {
			this.oAccordion1 = createAccordion();
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oAccordion1.destroy();
			this.oAccordion1 = null;
		}
	});

	//OpenSectionsId property
	QUnit.test("OpenSectionsId Default value - the first added section", function(assert) {
		assert.strictEqual(this.oAccordion1.getOpenedSectionsId(), "section1", "OpenSectionsId should be the first added section id.");
	});
	QUnit.test("SetOpenedSectionsId multiple values test", function(assert) {
		this.oAccordion1.setOpenedSectionsId("section2,section3,section4");
		this.oAccordion1.openDefaultSections();

//				// now section 2 and 4 should be open as section 3 is disabled
		assert.strictEqual(this.oAccordion1.getOpenedSectionsId(), "section2,section4", "OpenedSectionsId should be section 2 and section 4 ");
		var aSections = this.oAccordion1.getSections();
		assert.strictEqual(aSections[1].getCollapsed(), false, "Section 2 is now open");
		assert.strictEqual(aSections[2].getCollapsed(), true, "Section 3 is closed as is disabled");
		assert.strictEqual(aSections[3].getCollapsed(), false, "Section 4 is open now");
		assert.strictEqual(aSections[0].getCollapsed(), false, "Section 1 is was open by default");
	});

	QUnit.test("SetOpenedSectionsId disabled section Id test", function(assert) {
		this.oAccordion1.setOpenedSectionsId("section3");
		this.oAccordion1.openDefaultSections();
		sap.ui.getCore().applyChanges();
		var aSections = this.oAccordion1.getSections();
		assert.strictEqual(aSections[2].getCollapsed(), true, "Section 3 is closed as is disabled");
	});

	QUnit.test("SetOpenedSectionsId invalid section Id test", function(assert) {
		this.oAccordion1.setOpenedSectionsId("alabala");
		var aSections = this.oAccordion1.getSections();
		assert.strictEqual(aSections[0].getCollapsed(), false, "Section 1 is open as the provided Id is not valid");
	});

	QUnit.test("Set OpenedSectionsId", function(assert) {
		var sID = "section2";
		this.oAccordion1.setOpenedSectionsId(sID);
		assert.strictEqual(this.oAccordion1.getOpenedSectionsId(), sID, "OpenSectionsId for accordion1 is correct ");
	});

	//Width property
	QUnit.test("Default Width value 200px", function(assert) {
		assert.strictEqual(this.oAccordion1.getWidth(), "200px", "Default width for accordion1 should be 200px");
	});

	//sections aggregation
	QUnit.test("sections Aggregation test", function(assert) {
		assert.strictEqual(this.oAccordion1.getAggregation("sections").length, 4, "4 sections should be added");
	});
	QUnit.test("Sections aggregation visibility test", function(assert) {
		assert.ok(this.oAccordion1.getSections, "Sections aggregation is visible");
	});
	QUnit.test("Test getNumberOfOpenedSections", function(assert) {
		assert.strictEqual(this.oAccordion1.getNumberOfOpenedSections(), 1, "Should be 1");
	});


	QUnit.module("Accordion API and Properties, no any section added", {
		beforeEach : function () {
			this.oAccordion1 = createAccordion(true);
		},
		afterEach : function () {
			this.oAccordion1.destroy();
			this.oAccordion1 = null;
		}
	});

	//Width property
	QUnit.test("Default Width value 200px", function(assert) {
		assert.strictEqual(this.oAccordion1.getWidth(), "200px", "Default width for accordion1 should be 200px");
	});

	//OpenSectionsId property
	QUnit.test("OpenedSectionsId Default value null", function(assert) {
		assert.strictEqual(this.oAccordion1.getOpenedSectionsId(), "", "OpenedSectionsId should be null as no sections exist ");
	});


	//sections aggregation
	QUnit.test("sections Aggregation test", function(assert) {
		assert.strictEqual(this.oAccordion1.getAggregation("sections"), null, "No any section exist");
	});

	QUnit.module("AccordionSection API and Properties", {
		beforeEach : function () {
			this.oAccordion1 = createAccordion();
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oAccordion1.destroy();
			this.oAccordion1 = null;
		}
	});

	QUnit.test("API test - focusFirstControl", function(assert) {
		var aSections = this.oAccordion1.getSections();
		assert.strictEqual(aSections[0].getCollapsed(), false, "Section 1 is open by default");
		//focus the first control of the first section
		aSections[0].focusFirstControl();
		assert.strictEqual(aSections[0].getContent()[0].$().is(":focus"), true, "The first button is focused");
	});

	QUnit.test("API test - onThemeChanged", function(assert) {
		var aSections = this.oAccordion1.getSections();
		assert.strictEqual(aSections[0].getCollapsed(), false, "Section 1 is open by default");
		aSections[0].onThemeChanged();

		assert.strictEqual(aSections[0].$("hdrL").css("width"), "20px", "The width is 20px");
	});

	QUnit.test("API test - Enabled property", function(assert) {
		var aSections = this.oAccordion1.getSections();
		assert.strictEqual(aSections[0].getCollapsed(), false, "Section 1 is open by default");

		//set the property "enabled"
		aSections[0].setEnabled(false);
		assert.strictEqual(aSections[0].$().hasClass( "sapUiAcdSectionDis" ), true, "The Section header has the disabled class applied");
		assert.strictEqual(aSections[0].getEnabled(), false, "The Section 1 is disabled");
		aSections[0].setEnabled(true);
		assert.strictEqual(aSections[0].$().hasClass( "sapUiAcdSectionDis" ), false, "The Section header doesn't have the disabled class applied");
		assert.strictEqual(aSections[0].getEnabled(), true, "The Section 1 is enabled");
	});


	QUnit.module("Accordion Open/Close sections",{
		beforeEach : function () {
			this.oAccordion1 = createAccordion();
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oAccordion1.destroy();
			this.oAccordion1 = null;
		}
	} );



	//Some keyboard shortcuts...
	QUnit.test("Accordion Open/Close sections", function(assert) {

		// Navigation + close/open sections
		//Open the fourth section
		jQuery("section4-minL").trigger("focus");
		qutils.triggerEvent("click", "section4-minL");

		//Check if default section is closed (1) and (4) are now opened
		var aSections = this.oAccordion1.getSections();
		assert.strictEqual(aSections[0].getCollapsed(), true, "Section 1 is now closed ");
		assert.strictEqual(aSections[1].getCollapsed(), true, "Section 2 is now closed ");
		assert.strictEqual(aSections[2].getCollapsed(), true, "Section 3 is now closed ");
		assert.strictEqual(aSections[3].getCollapsed(), false, "Section 4 is now open ");


	});

	QUnit.module("Accordion Keyboard Handling Test",{
		beforeEach : function () {
			this.oAccordion1 = createAccordion();
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oAccordion1.destroy();
			this.oAccordion1 = null;
		}
	} );

	QUnit.test("Space and Arrows Left & Right ", function(assert) {

		var aSections = this.oAccordion1.getSections();
		assert.strictEqual(aSections[0].getCollapsed(), false, "Section 1 is open by default");
		qutils.triggerEvent("click", "section1-minL");
		// now all sections should be closed
		assert.strictEqual(aSections[0].getCollapsed(), true, "Section 1 is closed now");
		this.oAccordion1.getSections()[0].setCollapsed(false);
		assert.strictEqual(aSections[0].getCollapsed(), false, "Section 1 is open now");

		jQuery("section1-minL").trigger("focus");
		qutils.triggerEvent("click", "section1-minL");
		qutils.triggerKeyboardEvent("accordion1", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("accordion1", KeyCodes.SPACE);

//				Navigate up by 1, section is disabled, so it will jump top section 2
//				Section 2 is now opened and section 4 is now collapsed
		jQuery("section4-minL").trigger("focus");
		qutils.triggerKeyboardEvent("section4-minL", "ARROW_LEFT");
		qutils.triggerKeyboardEvent("section2-minL", KeyCodes.SPACE);
		assert.strictEqual(aSections[1].getCollapsed(), false, "Section 2 is now opened");
		assert.strictEqual(aSections[3].getCollapsed(), true, "Section 4 is now closed");

//				Close it and the default section will reopen, in this case, it is section1
		qutils.triggerKeyboardEvent("accordion1", KeyCodes.SPACE);
		assert.strictEqual(aSections[1].getCollapsed(), false, "Section 2 is now open");
		assert.strictEqual(aSections[0].getCollapsed(), true, "Section 1 is now closed");

	});

	QUnit.test("Space and End buttons ", function(assert) {

		var aSections = this.oAccordion1.getSections();
		assert.strictEqual(aSections[0].getCollapsed(), false, "Section 1 is open by default");
		qutils.triggerEvent("click", "section1-minL");
		// now all sections should be closed
		assert.strictEqual(aSections[0].getCollapsed(), true, "Section 1 is closed now");
		this.oAccordion1.getSections()[0].setCollapsed(false);
		assert.strictEqual(aSections[0].getCollapsed(), false, "Section 1 is open now");

		jQuery("section1-minL").trigger("focus");
		qutils.triggerEvent("click", "section1-minL");
		// test handling END button
		qutils.triggerKeyboardEvent("accordion1", KeyCodes.END);
		assert.strictEqual(aSections[3].$("hdr").is(":focus"), true, "Section 4 is now focused");

		// test END button, when the last section is disabled
		//Building Section 5
		var oSection5 = new AccordionSection( "section5");
		oSection5.setTitle("My section 5");
		oSection5.setEnabled(false);
		var oButton5 = new Button( "Button5" );
		oSection5.addContent( oButton5);
		this.oAccordion1.addSection( oSection5 );
		//Building Section 6
		var oSection6 = new AccordionSection( "section6");
		oSection6.setTitle("My section 6");
		oSection6.setEnabled(false);
		var oButton6 = new Button( "Button6" );
		oSection6.addContent( oButton6);
		this.oAccordion1.addSection( oSection6 );
		sap.ui.getCore().applyChanges();

		jQuery("section1-minL").trigger("focus");
		qutils.triggerEvent("click", "section1-minL");
		// test handling END button
		qutils.triggerKeyboardEvent("accordion1", KeyCodes.END);
		assert.strictEqual(aSections[3].$("hdr").is(":focus"), true, "Section 4 is now focused as the last 2 are disabled");

	});

	QUnit.test("Space and HOME buttons ", function(assert) {

		// test HOME button, when some of the first sections are disabled
		this.oAccordion1.destroyAggregation("sections", true);		// note: suppress re-rendering
		//Building Section 1
		var oSection = new AccordionSection( "section1");
		oSection.setTitle("My section 1");
		oSection.setEnabled(false);
		var oButton = new Button( "Button1" );
		oSection.addContent( oButton);
		this.oAccordion1.addSection( oSection );
		//Building Section 2
		oSection = new AccordionSection( "section2");
		oSection.setTitle("My section 2");
		oSection.setEnabled(false);
		oButton = new Button( "Button2" );
		oSection.addContent( oButton);
		this.oAccordion1.addSection( oSection );

		//Building Section 3
		oSection = new AccordionSection( "section3");
		oSection.setTitle("My section 3");
		oButton = new Button( "Button3" );
		oSection.addContent( oButton);
		this.oAccordion1.addSection( oSection );

		//Building Section 4
		oSection = new AccordionSection( "section4");
		oSection.setTitle("My section 4");
		oButton = new Button( "Button4" );
		oSection.addContent( oButton);
		this.oAccordion1.addSection( oSection );

		sap.ui.getCore().applyChanges();
		var aSections = this.oAccordion1.getSections();
		// section 3 should be focused and open by default as first 2 are disabled
		assert.strictEqual(aSections[2].getCollapsed(), false, "Section 3 is open by default as first 2 are disabled");

		// navigate to the last section
		qutils.triggerKeyboardEvent("section3-minL", KeyCodes.ARROW_DOWN);
		assert.strictEqual(aSections[3].$("hdr").is(":focus"), true, "Section 4 is now focused ");

		qutils.triggerKeyboardEvent("accordion1", KeyCodes.HOME);
		assert.strictEqual(aSections[2].$("hdr").is(":focus"), true, "Section 3 is now focused as first 2 are disabled");
	});

	QUnit.test("Space and Arrows Up & Down ", function(assert) {

		var aSections = this.oAccordion1.getSections();
		assert.strictEqual(aSections[0].getCollapsed(), false, "Section 1 is open by default");
		qutils.triggerEvent("click", "section1-minL");
		// now all sections should be closed
		assert.strictEqual(aSections[0].getCollapsed(), true, "Section 1 is closed now");
		this.oAccordion1.getSections()[0].setCollapsed(false);
		assert.strictEqual(aSections[0].getCollapsed(), false, "Section 1 is open now");

		jQuery("section1-minL").trigger("focus");
		qutils.triggerEvent("click", "section1-minL");
		qutils.triggerKeyboardEvent("accordion1", KeyCodes.ARROW_DOWN);
		qutils.triggerKeyboardEvent("accordion1", KeyCodes.SPACE);

//				Navigate up by 1, section is disabled, so it will jump top section 2
//				Section 2 is now opened and section 4 is now collapsed
		jQuery("section4-minL").trigger("focus");
		qutils.triggerKeyboardEvent("section4-minL", "ARROW_UP");
		qutils.triggerKeyboardEvent("section2-minL", KeyCodes.SPACE);
		assert.strictEqual(aSections[1].getCollapsed(), false, "Section 2 is now opened as 3 is disabled");
		assert.strictEqual(aSections[3].getCollapsed(), true, "Section 4 is now closed");

//				Close it and the default section will reopen, in this case, it is section1
		qutils.triggerKeyboardEvent("accordion1", KeyCodes.SPACE);
		assert.strictEqual(aSections[1].getCollapsed(), false, "Section 2 is now open");
		assert.strictEqual(aSections[0].getCollapsed(), true, "Section 1 is now closed");

	});

	QUnit.test("Ctrl + PgDn ", function(assert) {

		var aSections = this.oAccordion1.getSections();
		assert.strictEqual(aSections[0].getCollapsed(), false, "Section 1 is open by default");

		jQuery("section2-minL").trigger("focus");
		qutils.triggerKeyboardEvent("section2-minL", KeyCodes.PAGE_DOWN, {ctrlKey: true});			//, {ctrlKey: true}
		//next section will be focused and open
		assert.strictEqual(aSections[3].$("hdr").is(":focus"), true, "Section 4 is now focused as Section 3 is disabled");
		assert.strictEqual(aSections[3].getCollapsed(), false, "Section 4 is now open");

	});

	QUnit.test("Ctrl + PgUp ", function(assert) {

		var aSections = this.oAccordion1.getSections();
		assert.strictEqual(aSections[0].getCollapsed(), false, "Section 1 is open by default");

		jQuery("section4-minL").trigger("focus");
		qutils.triggerKeyboardEvent("section4-minL", KeyCodes.PAGE_UP, {ctrlKey: true});			//, {ctrlKey: true}
		//prev section will be focused and open
		assert.strictEqual(aSections[1].$("hdr").is(":focus"), true, "Section 2 is now focused as Section 3 is disabled");
		assert.strictEqual(aSections[1].getCollapsed(), false, "Section 2 is open now as Section 3 is disabled");

	});

	QUnit.test("Ctrl + ARROW DOWN ", function(assert) {

		var aSections = this.oAccordion1.getSections();
		assert.strictEqual(aSections[0].getCollapsed(), false, "Section 1 is open by default");

		qutils.triggerKeyboardEvent("section1-minL", KeyCodes.ARROW_DOWN, {ctrlKey: true});			//, {ctrlKey: true}
		//Section 2 will become the first section and Section 1 will become the second one section
		assert.strictEqual(this.oAccordion1.getSections()[0].getTitle(), "My section 2", "Section 2 is now at the fist position");
		assert.strictEqual(this.oAccordion1.getSections()[1].getTitle(), "My section 1", "Section1 is now at the second position");
	});

	QUnit.test("Ctrl + ARROW UP ", function(assert) {

		var aSections = this.oAccordion1.getSections();
		assert.strictEqual(aSections[0].getCollapsed(), false, "Section 1 is open by default");

		qutils.triggerKeyboardEvent("section2-minL", KeyCodes.ARROW_UP, {ctrlKey: true});			//, {ctrlKey: true}
		//Section 2 will become the first section and Section 1 will become the second one section
		assert.strictEqual(this.oAccordion1.getSections()[0].getTitle(), "My section 2", "Section 2 is now at the fist position");
		assert.strictEqual(this.oAccordion1.getSections()[1].getTitle(), "My section 1", "Section 1 is now at the second position");
	});
});