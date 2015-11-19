(function ($, QUnit) {

	jQuery.sap.registerModulePath("view", "view");
	jQuery.sap.registerModulePath("sap.uxap.sample", "../demokit/sample");
	jQuery.sap.registerModulePath("sap.uxap.testblocks", "./blocks");

	jQuery.sap.registerModulePath("view", "view");

	jQuery.sap.require("sap.uxap.ObjectPageLayout");
	jQuery.sap.require("sap.uxap.ObjectPageSection");
	jQuery.sap.require("sap.uxap.ObjectPageHeader");
	
	module("aat_UxAP-ManageDisplay", {
    	beforeEach: function () {
    		//aat_UxAP-331_ObjectPageRules1
    		this.objectPageSampleView1 = sap.ui.xmlview("UxAP-331_ObjectPageRules1", {
    			viewName: "view.UxAP-331_ObjectPageRules1"
    		});
    		this.objectPageSampleView1.placeAt('qunit-fixture');

		    sap.ui.getCore().applyChanges();
		    
		    this.referencedObjectPage1 = this.objectPageSampleView1.byId("objectPage1");
		},
		afterEach: function () {
			this.objectPageSampleView1.destroy();
			this.referencedObjectPage1 = null;
		}
	});


	QUnit.test("ObjectPageId 1 created", function (assert) {
		assert.notStrictEqual(this.referencedObjectPage1, undefined, "ObjectPageLayout 1 created successfuly");
	});
	QUnit.test("ObjectPageId 1: AnchorBar ", function (assert) {
		var objectPageToBar331 = $("#UxAP-331_ObjectPageRules1--objectPage1").find(".sapUxAPAnchorBar").is(":visible");
		assert.strictEqual(objectPageToBar331, true, "ObjectPageLayout 1 AnchorBar is display");
	});
	QUnit.test("ObjectPageId 1: No block - subsection not display", function (assert) {
		var objectPageSubSectionNoBlock331 = $("#" + this.objectPageSampleView1.byId("ObjectPageSubSectionNoBlock331").getId()).is(":visible");
		assert.strictEqual(objectPageSubSectionNoBlock331, false, "Subsection 'id=ObjectPageSubSectionNoBlock331' not visible");
	});
	QUnit.test("ObjectPageId 1: 1 block subsection display", function (assert) {
		var objectPageSubSectionNotEmpty331 = $("#" + this.objectPageSampleView1.byId("ObjectPageSubSectionNotEmpty331").getId()).is(":visible");
		assert.strictEqual(objectPageSubSectionNotEmpty331, true, "Subsection 'id=ObjectPageSubSectionNotEmpty331' is visible");
	});
	QUnit.test("ObjectPageId 1: Section Without subection not display", function (assert) {
		var objectPageSectionNoSubSection331 = $("#" + this.objectPageSampleView1.byId("ObjectPageSectionNoSubSection331").getId()).is(":visible");
		assert.strictEqual(objectPageSectionNoSubSection331, false, "Section 'id=ObjectPageSectionNoSubSection331' is not  visible");
	});
	QUnit.test("ObjectPageId 1: Subsection Promoted", function (assert) {
		var objectPageSectionPromoted = this.objectPageSampleView1.byId("ObjectPageSectionPromoted331");
		assert.strictEqual(objectPageSectionPromoted.$().find(".sapUxAPObjectPageSectionTitle").text(), 'Promoted', "Section 'id=ObjectPageSectionPromoted331' Title is 'Promoted'");
		var objectPageSubSectionPromoted = this.objectPageSampleView1.byId("ObjectPageSubSectionPromoted331");
		assert.strictEqual(objectPageSubSectionPromoted.$().find(".sapUxAPObjectPageSectionTitle").text(), '', "Subsection 'id=ObjectPageSubSectionPromoted331' Title is empty");
	});
	QUnit.test("ObjectPageId 1: Section with 1 Subsection without block", function (assert) {
		var objectPageSectionEmpty331 = $("#" + this.objectPageSampleView1.byId("ObjectPageSectionEmpty331").getId()).is(":visible");
		assert.strictEqual(objectPageSectionEmpty331, false, "Section 'id=ObjectPageSectionEmpty331' is not visible");
		var objectPageSubSectionEmpty331 = $("#" + this.objectPageSampleView1.byId("ObjectPageSubSectionEmpty331").getId()).is(":visible");
		assert.strictEqual(objectPageSubSectionEmpty331, false, "Subsection 'id=ObjectPageSubSectionEmpty331' is not visible");
	});
	QUnit.test("ObjectPageId 1: 1st Title Section is not visible", function (assert) {
		var objectPageTitle331 = $("#UxAP-331_ObjectPageRules1--ObjectPageSectionNoBlock331").find(".sapUxAPObjectPageSectionHeader").is(":visible");
		assert.strictEqual(objectPageTitle331, false, "1st Title is not visible");
	});
	QUnit.test("ObjectPageId 1: SubSection visible properties is false but rules say visible", function (assert) {
		var objectPageTitle331 = $("#UxAP-331_ObjectPageRules1--ObjectPageSubSectionNotVisible331").is(":visible");
		assert.strictEqual(objectPageTitle331, false, "SubSection is not visible by override");
	});
	QUnit.test("ObjectPageId 1: SubSection visible properties is true but rules say not visible", function (assert) {
		var objectPageTitle331 = $("#UxAP-331_ObjectPageRules1--ObjectPageSubSectionVisible331").is(":visible");
		assert.strictEqual(objectPageTitle331, false, "SubSection is visible by override");
	});
	
	module("Single section", {
    	beforeEach: function () {
    		//aat_UxAP-331_ObjectPageRules2
    		this.objectPageSampleView2 = sap.ui.xmlview("UxAP-331_ObjectPageRules2", {
    			viewName: "view.UxAP-331_ObjectPageRules2"
    		});
    		this.objectPageSampleView2.placeAt('qunit-fixture');
		    sap.ui.getCore().applyChanges();
		    
		    this.referencedObjectPage2 = this.objectPageSampleView2.byId("objectPage2");
		},
		afterEach: function () {
			this.objectPageSampleView2.destroy();
			this.referencedObjectPage2 = null;
		}
	});
	
	QUnit.test("ObjectPageId 2 created", function (assert) {
		assert.notStrictEqual(this.referencedObjectPage2, undefined, "ObjectPageLayout 2 created successfuly");
	});
	QUnit.test("ObjectPageId 2: No AnchorBar ", function (assert) {
		var objectPageToBar331 = $("#UxAP-331_ObjectPageRules2--objectPage2").find(".sapUxAPAnchorBar").is(":visible");
		assert.strictEqual(objectPageToBar331, false, "ObjectPageLayout 2 No AnchorBar is display");
	});
	QUnit.test("ObjectPageId 2: 1st Title Section is visible", function (assert) {
		var objectPageTitle331 = $("#UxAP-331_ObjectPageRules2--ObjectPageSectionNoAnchorBar331").find(".sapUxAPObjectPageSectionHeader").is(":visible");
		assert.strictEqual(objectPageTitle331, true, "1st Title is visible");
	});

}(jQuery, QUnit));
