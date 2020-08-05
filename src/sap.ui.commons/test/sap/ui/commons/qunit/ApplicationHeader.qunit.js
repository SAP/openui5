/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/ApplicationHeader"
], function(createAndAppendDiv, ApplicationHeader) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("uiArea1");


	/****************************************************
	* TESTING PROPERTIES OF THE APPLICATIONHEADER
	*****************************************************/
	QUnit.module("Application Header", {
		oSpies: {},
		beforeEach: function () {
			this.oAppHeader = new ApplicationHeader();
			this.oSpies.fnInitControlsSpy = sinon.spy(this.oAppHeader, "initControls");
			this.oAppHeader.setLogoText("This is the title");
			this.oAppHeader.placeAt("uiArea1");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oAppHeader.exit();
		}
	});

	//Check all properties
	QUnit.test("Application header properties", function (assert) {
		assert.equal(this.oAppHeader.getLogoSrc(), "", "Logo src is empty as expected");
		this.oAppHeader.setLogoSrc("http://www.sap.com/global/images/SAPLogo.gif");
		assert.equal(this.oAppHeader.getLogoSrc(), "http://www.sap.com/global/images/SAPLogo.gif", "Logo src was set with url provided");
		assert.equal(this.oAppHeader.getLogoText(), "This is the title", "Logo text was correctly set to THIS IS THE TITLE");

		this.oAppHeader.setDisplayLogoff(false);
		assert.equal(this.oAppHeader.getDisplayLogoff(), false, "Application removed the logout area successfully");

		this.oAppHeader.setDisplayLogoff(true);
		assert.equal(this.oAppHeader.getDisplayLogoff(), true, "Display logout is defaulted to true correctly");

		this.oAppHeader.setUserName("");
		assert.equal(this.oAppHeader.getUserName(), "", "User name is removed and not available as expected");
		this.oAppHeader.setUserName("Mike McPhee");
		assert.equal(this.oAppHeader.getUserName(), "Mike McPhee", "User name is correctly set to Mike McPhee");
	});

	QUnit.test("The composite parts are initialized only once", function (assert) {
		this.oAppHeader.rerender();
		this.oAppHeader.rerender();
		assert.ok(this.oSpies.fnInitControlsSpy.calledOnce, "initControls() is called once");
	});
});