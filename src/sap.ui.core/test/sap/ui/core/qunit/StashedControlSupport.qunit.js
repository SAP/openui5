sap.ui.define([
	"sap/ui/core/StashedControlSupport",
	"sap/ui/core/Element",
	"sap/ui/core/Component",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/Panel",
	"sap/uxap/ObjectPageLayout",
	"sap/base/Log",
	"sap/ui/qunit/utils/createAndAppendDiv"],
function(StashedControlSupport, Element, Component, XMLView, Fragment, JSONModel, Button, Panel, ObjectPageLayout, Log, createAndAppendDiv) {
	/* global QUnit sinon*/
	"use strict";

	createAndAppendDiv("content");

	var sViewContent =
		'<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
			'<Panel id="Panel">' +
				'<content>' +
					'<Button id="StashedButton" stashed="true"/>' +
					'<Button id="Button"/>' +
				'</content>' +
			'</Panel>' +
		'</mvc:View>';

	QUnit.module("Control mixin", {
		beforeEach: function() {
			this.Button = Button.extend("Button");
		}
	});

	QUnit.test("class", function(assert) {
		var fnClone = this.Button.prototype.clone,
			fnDestroy = this.Button.prototype.destroy;
		StashedControlSupport.mixInto(this.Button);
		assert.ok(this.Button.prototype.isStashed, "Control class has method 'isStashed'");
		assert.ok(this.Button.prototype.unstash, "Control class has method 'unstash'");
		assert.notStrictEqual(this.Button.prototype.destroy, fnClone, "Control class method 'clone' overwritten'");
		assert.notStrictEqual(this.Button.prototype.destroy, fnDestroy, "Control class method 'destroy' overwritten'");
	});

	QUnit.test("instance", function(assert) {
		StashedControlSupport.mixInto(this.Button);
		var oButton = new this.Button();
		assert.ok(!oButton.mProperties.stashed, "Control instance has 'stashed' property");
		assert.ok(oButton.isStashed, "Control instance has method 'isStashed'");
		assert.ok(oButton.unstash, "Control instance has method 'unstash'");
		assert.strictEqual(oButton.isStashed(), false, "'stashed' property default value is false");
		oButton.destroy();
	});

	QUnit.module("StashedControl", {
		beforeEach: function() {
			this.sId = "control";
			this.Button = Button.extend("Button");
			StashedControlSupport.mixInto(this.Button);
			this.create = function() {
				// create final instance with the same ID as the placeholder
				this.oUnstashedButton = new this.Button(this.sId);
				return [this.oUnstashedButton];
			}.bind(this);
			this.mSettings = {
				wrapperId: this.sId,
				fnCreate: this.create
			};
			this.oPanel = new Panel("parent");
			// put a placeholder with the correct ID in the panel's aggregation
			this.oButton = new this.Button(this.sId, {
				stashed: true
			});
			this.oPanel.addContent(this.oButton);
		},
		afterEach: function() {
			if (this.oButton) {
				this.oButton.destroy();
			}
			this.oPanel.destroy();
		}
	});

	QUnit.test("factory", function(assert) {
		this.oStashedInfo = StashedControlSupport.createStashedControl(this.mSettings);
		assert.strictEqual(this.oStashedInfo.wrapperId, this.sId, "id is set");
		assert.strictEqual(this.oStashedInfo.fnCreate, this.create, "fnCreate hook is set");
	});

	QUnit.test("unstash", function(assert) {
		this.oStashedInfo = StashedControlSupport.createStashedControl(this.mSettings);

		assert.ok(this.oButton.isStashed(), "Control is stashed");

		this.oButton.unstash();
		assert.strictEqual(sap.ui.getCore().byId(this.sId), this.oUnstashedButton, "StashedControl has been replaced");

		assert.notOk(this.oUnstashedButton.isStashed(), "Control is not stashed anymore");
	});

	QUnit.test("destroy", function(assert) {
		StashedControlSupport.createStashedControl({
			wrapperId: "iAmStashed"
		});
		this.oButton = new this.Button("iAmStashed", {stashed: true});
		this.oPanel.addAggregation("content", this.oButton);
		this.oPanel.destroy();
		assert.strictEqual(StashedControlSupport.getStashedControls().length, 0, "Stashed control has been destroyed");
	});

	QUnit.module("XML", {
		beforeEach: function() {
			if (!Button.prototype.isStashed) {
				// extend the real sap.m.Button for test purposes - once!
				StashedControlSupport.mixInto(Button);
			}
			this.oView = sap.ui.xmlview("view", {
				viewContent: sViewContent
			}).placeAt("content");
		},
		afterEach: function() {
			this.oView.destroy();
		}
	});

	QUnit.test("StashedControl support (simple)", function(assert) {
		var done = assert.async();
		this.oView.onAfterRendering = function() {
			assert.strictEqual(jQuery("#view--StashedButton").length, 0, "Stashed button is not rendered");

			var oButton = sap.ui.getCore().byId("view--StashedButton");

			assert.ok(oButton, "Stashed button is available by id");
			assert.ok(oButton instanceof Button, "Stashed button is instanceof sap.m.Button");
			assert.ok(oButton.isStashed(), "Stashed button has stashed=true");
			assert.strictEqual(jQuery("#view--Button").length, 1, "Button is rendered");
			assert.ok(sap.ui.getCore().byId("view--Button") instanceof Button, "Button is a Button");

			this.oView.onAfterRendering = function() {
				var oUnstashedButton = sap.ui.getCore().byId("view--StashedButton");
				assert.strictEqual(jQuery("#view--StashedButton").length, 1, "Unstashed button is rendered");
				assert.ok(oUnstashedButton instanceof Button, "Unstashed Button is still a Button");
				assert.notOk(oUnstashedButton.isStashed(), "UnstashedButton.isStashed() != true");

				done();
			};

			oButton.unstash();
			this.oView.invalidate();
		}.bind(this);
		this.oView.invalidate(); // ensure a rerendering
	});

	QUnit.test("getStashedControls", function(assert) {
		assert.strictEqual(StashedControlSupport.getStashedControls().length, 1, "One stashed control existent");
		assert.strictEqual(StashedControlSupport.getStashedControls("Panel")[0], sap.ui.getCore().byId("control11"), "One stashed controls in parent1");
	});

	QUnit.test("getStashedControlIds", function(assert) {
		assert.strictEqual(StashedControlSupport.getStashedControlIds().length, 1, "One stashed control existent");
		assert.strictEqual(StashedControlSupport.getStashedControlIds("view--Panel")[0], "view--StashedButton", "One stashed controls in parent1");
	});

	QUnit.module("Component integration");

	QUnit.test("owner component", function(assert) {
		var oView;
		function createView() {
			oView = sap.ui.xmlview("view", {
				viewContent: sViewContent
			}).placeAt("content");
		}
		new Component("comp").runAsOwner(createView.bind(this));

		sap.ui.getCore().byId("view--StashedButton").unstash();
		var oButtonComponent = Component.getOwnerComponentFor(oView.byId("view--StashedButton"));
		var oStashedButtonComponent = Component.getOwnerComponentFor(oView.byId("view--StashedButton"));

		assert.strictEqual(oStashedButtonComponent, oButtonComponent, "Buttons have same owner");
		assert.equal(oStashedButtonComponent.getId(), "comp", "Buttons have the right owner");

		oView.destroy();
	});

	QUnit.module("Async XMLView", {
		beforeEach: function() {
			if (!Button.prototype.getStashed) {
				// extend the real sap.m.Button for test purposes - once!
				StashedControlSupport.mixInto(Button);
			}
			return XMLView.create({
				id: "view",
				viewName: 'test.StashedControl'
			}).then(function(oView) {
				this.oView = oView;
				oView.placeAt("content");
			}.bind(this));
		},
		afterEach: function() {
			this.oView.destroy();
		}
	});

	QUnit.test("StashedControl support (simple)", function(assert) {
		var done = assert.async();

		var fnTest = function () {
			this.oView.onAfterRendering = function() {
				assert.strictEqual(jQuery("#view--StashedButton").length, 0, "Stashed button is not rendered");

				var oButton = sap.ui.getCore().byId("view--StashedButton");

				assert.ok(oButton, "Stashed button is available by id");
				assert.ok(oButton instanceof Button, "Stashed button is instanceof sap.m.Button");
				assert.ok(oButton.isStashed(), "Stashed button has stashed=true");
				assert.strictEqual(jQuery("#view--Button").length, 1, "Button is rendered");
				assert.ok(sap.ui.getCore().byId("view--Button") instanceof Button, "Button is a Button");

				this.oView.onAfterRendering = function() {
					var oUnstashedButton = sap.ui.getCore().byId("view--StashedButton");
					assert.strictEqual(jQuery("#view--StashedButton").length, 1, "Unstashed button is rendered");
					assert.ok(oUnstashedButton instanceof Button, "Unstashed Button is still a Button");
					assert.notOk(oUnstashedButton.isStashed(), "UnstashedButton.getStashed() != true");

					done();
				};

				oButton.unstash();
				this.oView.invalidate();
			}.bind(this);

			this.oView.invalidate(); // ensure a rerendering

		}.bind(this);

		this.oView.loaded().then(fnTest);
	});

	QUnit.module("Stashing 2", {
		afterEach: function(assert) {
			if (this.oView) {
				this.oView.destroy();
			}

			var aStashedControlsTotal = StashedControlSupport.getStashedControls();
			assert.equal(aStashedControlsTotal.length, 0, "After each test there should be no remaining stashed controls.");
		}
	});

	QUnit.test("Check existence of empty wrappers", function(assert) {
		var oJSONModel = new JSONModel({
			title: "Cool Tile",
			subSections: [{
				foo: "bar"
			}]
		});

		return XMLView.create({
			id: "view",
			viewName: "testdata.mvc.stashed.OP",
			models: {
				"undefined": oJSONModel
			}
		}).then(function(oView) {
			assert.ok("View was loaded");
			this.oView = oView;

			var oOPL = this.oView.byId("ObjectPageLayout");
			var aAllSections = oOPL.getSections();

			// check for existence of wrappers
			assert.equal(aAllSections.length, 4, "4 sections in aggregation");

			assert.equal(aAllSections[0].getId(), oView.createId("section0"), "Section 0 is correct.");
			assert.deepEqual(aAllSections[0].getSubSections(), [], "Section 0 has no content");

			assert.equal(aAllSections[1].getId(), oView.createId("section1"), "Section 1 is correct.");
			assert.equal(aAllSections[1].getSubSections().length, 1, "Section 1 has content");

			assert.equal(aAllSections[2].getId(), oView.createId("section2"), "Section 2 is correct.");
			assert.deepEqual(aAllSections[2].getSubSections(), [], "Section 2 has no content");

			assert.equal(aAllSections[3].getId(), oView.createId("section3"), "Section 3 is correct.");
			assert.deepEqual(aAllSections[3].getSubSections(), [], "Section 3 has no content");

			// unstash
			var stashed = StashedControlSupport.getStashedControls(oOPL.getId());

			stashed[2].unstash();
			stashed[1].unstash();
			stashed[0].unstash();

			aAllSections = oOPL.getSections();

			assert.equal(aAllSections[0].getId(), oView.createId("section0"), "Section 0 is correct after unstashing.");
			assert.equal(aAllSections[0].getSubSections().length, 1, "Section 0 has content after unstashing");

			assert.equal(aAllSections[1].getId(), oView.createId("section1"), "Section 1 is correct after unstashing.");
			assert.equal(aAllSections[1].getSubSections().length, 1, "Section 1 has content after unstashing");

			assert.equal(aAllSections[2].getId(), oView.createId("section2"), "Section 2 is correct after unstashing.");
			assert.equal(aAllSections[2].getSubSections().length, 1, "Section 2 has content after unstashing");

			assert.equal(aAllSections[3].getId(), oView.createId("section3"), "Section 3 is correct after unstashing.");
			assert.equal(aAllSections[3].getSubSections().length, 1, "Section 3 has content after unstashing");
		}.bind(this)).catch(function(e) {
			assert.notOk(e.stack);
		});
	});

	QUnit.test("Clean-up after destroy", function(assert) {
		return XMLView.create({
			id: "view",
			viewName: "testdata.mvc.stashed.OP"
		}).then(function(oView) {
			this.oView = oView;

			// remove one placeholder from it's aggregation
			// this modifies the number of stashed controls per parent-id
			var oOPL = this.oView.byId("ObjectPageLayout");
			var oPlaceholder = oOPL.removeSection(2);

			// start total
			var aStashedControlsTotal = StashedControlSupport.getStashedControls();
			assert.equal(aStashedControlsTotal.length, 3, "All stashed controls retrieved");

			// subset in parent
			var aStashedControlsInParent = StashedControlSupport.getStashedControls(oView.createId("ObjectPageLayout"));
			assert.equal(aStashedControlsInParent.length, 2, "Number of stashed sections in ObjectPageLayout is correct.");

			// destroy view
			// should clean-up all stashed controls in nested control aggregations
			oView.destroy();

			// check stashed control collection again
			aStashedControlsTotal = StashedControlSupport.getStashedControls();
			assert.equal(aStashedControlsTotal.length, 1, "One stashed control left-over.");

			// clean-up the left over StashedControl & placeholder
			oPlaceholder.destroy();
			aStashedControlsTotal[0].destroy();

		}.bind(this)).catch(function(e) {
			assert.notOk(e.stack);
		});
	});

	QUnit.test("Unstash a control moved to a different runtime aggregation", function(assert) {
		return XMLView.create({
			id: "view",
			viewName: "testdata.mvc.stashed.OP"
		}).then(function(oView) {
			this.oView = oView;

			// remove one placeholder from it's aggregation
			// this modifies the number of stashed controls per parent-id
			var oOPL = this.oView.byId("ObjectPageLayout");
			var oPlaceholder = oOPL.removeSection(2);

			assert.equal(oOPL.getSections().length, 3, "Number of sections in aggregation is correct.");

			// add placeholder to another parent aggregation
			var oOPL2 = new ObjectPageLayout("mySecondLayout");
			oOPL2.addSection(oPlaceholder);

			// total number of stashed controls
			var aStashedControlsTotal = StashedControlSupport.getStashedControls();
			assert.equal(aStashedControlsTotal.length, 3, "All stashed controls retrieved");

			// subset in parent 1
			var aStashedControlsInParent = StashedControlSupport.getStashedControls(oView.createId("ObjectPageLayout"));
			assert.equal(aStashedControlsInParent.length, 2, "Number of stashed sections in ObjectPageLayout is correct.");

			// subset in parent 2
			var aStashedControlsInParent2 = StashedControlSupport.getStashedControls("mySecondLayout");
			assert.equal(aStashedControlsInParent2.length, 1, "Number of stashed sections 2nd ObjectPageLayout is correct.");

			// unstash the moved control
			aStashedControlsInParent2[0].unstash();

			// check new runtime parent aggregation
			var aOPL2Sections = oOPL2.getSections();
			assert.equal(aOPL2Sections.length, 1, "'sections' aggregation of 2nd ObjectPageLayout is correct.");
			assert.equal(aOPL2Sections[0].getSubSections().length, 1, "'subsections' aggregation of unstashed control is filled.");

			// check ALL stashed controls again
			aStashedControlsTotal = StashedControlSupport.getStashedControls();
			assert.equal(aStashedControlsTotal.length, 2, "Only 2 stashed controls remaining.");

			// clean-up 2nd control
			oOPL2.destroy();

			// check ALL stashed controls again
			aStashedControlsTotal = StashedControlSupport.getStashedControls();
			assert.equal(aStashedControlsTotal.length, 2, "Still 2 stashed controls remaining.");

		}.bind(this)).catch(function(e) {
			assert.notOk(e.stack);
		});
	});

	QUnit.test("Unstash a control outside an aggregation", function(assert) {
		return XMLView.create({
			id: "view",
			viewName: "testdata.mvc.stashed.OP"
		}).then(function(oView) {
			this.oView = oView;

			// remove one placeholder from it's aggregation
			// this modifies the number of stashed controls per parent-id
			var oOPL = this.oView.byId("ObjectPageLayout");
			var oPlaceholder = oOPL.removeSection(2);
			var sFinalID = oPlaceholder.getId();

			assert.equal(oOPL.getSections().length, 3, "Number of sections in aggregation is correct.");

			// start total
			var aStashedControlsTotal = StashedControlSupport.getStashedControls();
			assert.equal(aStashedControlsTotal.length, 3, "All stashed controls retrieved");

			// subset in parent
			var aStashedControlsInParent = StashedControlSupport.getStashedControls(oView.createId("ObjectPageLayout"));
			assert.equal(aStashedControlsInParent.length, 2, "Number of stashed sections in ObjectPageLayout is correct.");

			// unstash the removed control
			aStashedControlsTotal[1].unstash();

			// check final control
			var oFinalControl = sap.ui.getCore().byId(sFinalID);
			assert.equal(oFinalControl.getSubSections().length, 1, "Unstashed final control instance has content.");
			assert.equal(oFinalControl.getParent(), null, "Unstashed final control instance has no parent.");

			// check ALL stashed controls again
			aStashedControlsTotal = StashedControlSupport.getStashedControls();
			assert.equal(aStashedControlsTotal.length, 2, "Still 2 stashed controls remaining.");

			// IMPORTANT: Final control is not part of any aggregation and has to be destroyed manually!
			oFinalControl.destroy();

		}.bind(this)).catch(function(e) {
			assert.notOk(e.stack);
		});
	});

	QUnit.test("Check Render result", function(assert) {
		var oJSONModel = new JSONModel({
			title: "Cool Tile",
			subSections: [{
				foo: "bar"
			}]
		});

		return XMLView.create({
			id: "view",
			viewName: "testdata.mvc.stashed.OP",
			models: {
				"undefined": oJSONModel
			}
		}).then(function(oView) {
			this.oView = oView;

			oView.placeAt("content");
			sap.ui.getCore().applyChanges();

			var oOPL = this.oView.byId("ObjectPageLayout");
			var aAllSections = oOPL.getSections();

			// since the stashed sections are set to invisible false, we should not find them in the DOM
			// except maybe some placeholders, depending on the way the container-control renders
			var oSection0DOM = jQuery("#" + aAllSections[0].getId())[0];
			var oSection1DOM = jQuery("#" + aAllSections[1].getId())[0];
			var oSection2DOM = jQuery("#" + aAllSections[2].getId())[0];
			var oSection3DOM = jQuery("#" + aAllSections[3].getId())[0];

			assert.notOk(oSection0DOM, "Section 0 is not rendered");
			assert.ok(oSection1DOM, "Section 1 is rendered");
			assert.notOk(oSection2DOM, "Section 2 is not rendered");
			assert.notOk(oSection3DOM, "Section 3 is not rendered");

			// unstash
			var stashed = StashedControlSupport.getStashedControls(oOPL.getId());
			stashed[2].unstash();
			stashed[1].unstash();
			stashed[0].unstash();

			// force rendering
			sap.ui.getCore().applyChanges();

			// get sections anew, instances now have changed after unstash
			aAllSections = oOPL.getSections();

			// since the stashed sections are set to invisible false, we should not find them in the DOM
			// except maybe some placeholders, depending on the way the container-control renders
			oSection0DOM = jQuery("#" + aAllSections[0].getId())[0];
			oSection1DOM = jQuery("#" + aAllSections[1].getId())[0];
			oSection2DOM = jQuery("#" + aAllSections[2].getId())[0];
			oSection3DOM = jQuery("#" + aAllSections[3].getId())[0];

			assert.ok(oSection0DOM, "Section 0 is rendered");
			assert.ok(oSection1DOM, "Section 1 is rendered");
			assert.ok(oSection2DOM, "Section 2 is rendered");
			assert.ok(oSection3DOM, "Section 3 is rendered");
		}.bind(this)).catch(function(e) {
			assert.notOk(e.stack);
		});
	});

	QUnit.test("Unstashed control should have aggregation bindings", function(assert) {
		var oSpy = sinon.spy(console, "assert");
		var oJSONModel = new JSONModel({
			title: "Cool Tile",
			subSections: [{
				foo: "bar"
			}]
		});

		return XMLView.create({
			id: "view",
			viewName: "testdata.mvc.stashed.OP",
			models: {
				"undefined": oJSONModel
			}
		}).then(function(oView) {
			this.oView = oView;
			var oOPL = this.oView.byId("ObjectPageLayout");

			// unstash
			var stashed = StashedControlSupport.getStashedControls(oOPL.getId());
			stashed[2].unstash();
			stashed[1].unstash();
			stashed[0].unstash();

			// get sections anew, instances now have changed after unstash
			var aAllSections = oOPL.getSections();
			var oBoundSection = aAllSections[0];
			assert.ok(oBoundSection.getBinding("subSections"), "subSection are bound");
			assert.equal(oBoundSection.getSubSections().length, 1, "aggregation bound, 1 subSection created");
			assert.equal(oBoundSection.getSubSections()[0].getTitle(), "bar", "subSection bound and title resolved");
			assert.equal(oSpy.callCount, 0, "No assertion due to unremoved stahsed attribute must occur");
			oSpy.restore();
		}.bind(this)).catch(function(e) {
			assert.notOk(e.stack);
		});
	});

	QUnit.test("Throw error on clone of stashed placeholder", function(assert) {
		return XMLView.create({
			id: "view",
			viewName: "testdata.mvc.stashed.OP"
		}).then(function(oView) {
			this.oView = oView;

			assert.throws(function() {
				this.oView.getContent()[0].clone();
			});

		}.bind(this));
	});

	QUnit.test("Throw error when try to make a sap.ui.core.Fragment a stashed control", function(assert) {
		assert.throws(function() {
			StashedControlSupport.mixInto(Fragment);
		});
	});

	QUnit.test("Throw error when try to make sap.ui.core.mvc.View a stashed control", function(assert) {
		assert.throws(function() {
			StashedControlSupport.mixInto(XMLView);
		});
	});
});