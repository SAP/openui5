(function ($, QUnit) {

	jQuery.sap.registerModulePath("view", "view");
    jQuery.sap.registerModulePath("sap.uxap.sample", "../demokit/sample");
    jQuery.sap.registerModulePath("sap.uxap.testblocks", "./blocks");
    module("aat_UxAP-330");

    jQuery.sap.registerModulePath("view", "view");
    jQuery.sap.require("sap.uxap.ObjectPageLayout");
    jQuery.sap.require("sap.uxap.ObjectPageSection");
    jQuery.sap.require("sap.uxap.ObjectPageHeader");

    QUnit.module("Show More", {
    	beforeEach: function () {
		    this.objectPageSampleView = sap.ui.xmlview("UxAP-330_PropertyOnBlockToSayIfItHaveMoreInfoToDisplay", {viewName: "view.UxAP-330_PropertyOnBlockToSayIfItHaveMoreInfoToDisplay" });
		    this.referencedObjectPage = this.objectPageSampleView.byId("objectPage330");
		    this.objectPageSampleView.placeAt('qunit-fixture');
		    sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.objectPageSampleView.destroy();
			this.referencedObjectPage = null;
		}
	});

    QUnit.test("ObjectPageId created", function (assert) {
        assert.notStrictEqual(this.referencedObjectPage, undefined, "ObjectPageLayout created successfuly");
    });
    QUnit.test("ObjectPageSectionId created", function (assert) {
        var objectPageSection = this.objectPageSampleView.byId("ObjectPageSection330");
        assert.notStrictEqual(objectPageSection, undefined, "Object Page Section created successfuly");
    });
    QUnit.test("ObjectPageSubSectionId_0 created", function (assert) {
        var objectPageSubSection0 = this.objectPageSampleView.byId("ObjectPageSubSection330_0");
        assert.notStrictEqual(objectPageSubSection0, undefined, "Object Page Sub Section 0 created successfuly");
    });
    QUnit.test("ObjectPageSubSectionId_1 created", function (assert) {
        var objectPageSubSection1 = this.objectPageSampleView.byId("ObjectPageSubSection330_1");
        assert.notStrictEqual(objectPageSubSection1, undefined, "Object Page Sub Section 1 created successfuly");
    });
    QUnit.test("ObjectPageSubSectionId_2 created", function (assert) {
        var objectPageSubSection1 = this.objectPageSampleView.byId("ObjectPageSubSection330_2");
        assert.notStrictEqual(objectPageSubSection1, undefined, "Object Page Sub Section 2 created successfuly");
    });
    QUnit.test("ObjectPageSubSectionId_3 created", function (assert) {
        var objectPageSubSection3 = this.objectPageSampleView.byId("ObjectPageSubSection330_3");
        assert.notStrictEqual(objectPageSubSection3, undefined, "Object Page Sub Section 3 created successfuly");
    });
    QUnit.test("ObjectPageSubSectionId_4 created", function (assert) {
        var objectPageSubSection4 = this.objectPageSampleView.byId("ObjectPageSubSection330_4");
        assert.notStrictEqual(objectPageSubSection4, undefined, "Object Page Sub Section 4 created successfuly");
    });
    QUnit.test("ObjectPageBlockBase_0 created", function (assert) {
        var objectPageBlockBase0 = this.objectPageSampleView.byId("ObjectPageBlockBase330_0");
        assert.notStrictEqual(objectPageBlockBase0, undefined, "Object Page Block Base 0 created successfuly");
    });
    QUnit.test("ObjectPageBlockBase_1 created", function (assert) {
        var objectPageBlockBase1 = this.objectPageSampleView.byId("ObjectPageBlockBase330_1");
        assert.notStrictEqual(objectPageBlockBase1, undefined, "Object Page Block Base 1 created successfuly");
    });
    QUnit.test("ObjectPageBlockBase_2 created", function (assert) {
        var objectPageBlockBase2 = this.objectPageSampleView.byId("ObjectPageBlockBase330_2");
        assert.notStrictEqual(objectPageBlockBase2, undefined, "Object Page Block Base 2 created successfuly");
    });
    QUnit.test("ObjectPageBlockBase_3 created", function (assert) {
        var objectPageBlockBase3 = this.objectPageSampleView.byId("ObjectPageBlockBase330_3");
        assert.notStrictEqual(objectPageBlockBase3, undefined, "Object Page Block Base 3 created successfuly");
    });
    QUnit.test("ObjectPageBlockBase_4 created", function (assert) {
        var objectPageBlockBase4 = this.objectPageSampleView.byId("ObjectPageBlockBase330_4");
        assert.notStrictEqual(objectPageBlockBase4, undefined, "Object Page Block Base 4 created successfuly");
    });
    QUnit.test("ObjectPageBlockBase_0 Check default value", function (assert) {
        var objectPageBlockBase0 = this.objectPageSampleView.byId("ObjectPageBlockBase330_0");
        assert.strictEqual(objectPageBlockBase0.getShowSubSectionMore(),  false, "Object Page Block Base 0: showSubSectionMore set with default value successfuly");
    });
    QUnit.test("ObjectPageBlockBase_1 showSubSectionMore true", function (assert) {
        var objectPageBlockBase1 = this.objectPageSampleView.byId("ObjectPageBlockBase330_1");
        assert.strictEqual(objectPageBlockBase1.getShowSubSectionMore(),  true, "Object Page Block Base 1: showSubSectionMore set with true successfuly");
    });
    QUnit.test("ObjectPageBlockBase_2 showSubSectionMore false", function (assert) {
        var objectPageBlockBase2 = this.objectPageSampleView.byId("ObjectPageBlockBase330_2");
        assert.strictEqual(objectPageBlockBase2.getShowSubSectionMore(),  false, "Object Page Block Base 2: showSubSectionMore set with false successfuly");
    });
    QUnit.test("ObjectPageBlockBase_3 showSubSectionMore false", function (assert) {
        var objectPageBlockBase3 = this.objectPageSampleView.byId("ObjectPageBlockBase330_3");
        assert.strictEqual(objectPageBlockBase3.getShowSubSectionMore(),  true, "Object Page Block Base 3: showSubSectionMore set with true successfuly");
    });
    QUnit.test("ObjectPageBlockBase_4 showSubSectionMore false", function (assert) {
        var objectPageBlockBase4 = this.objectPageSampleView.byId("ObjectPageBlockBase330_4");
        assert.strictEqual(objectPageBlockBase4.getShowSubSectionMore(),  false, "Object Page Block Base 4: showSubSectionMore set with false successfuly");
    });
    QUnit.test("ObjectPageBlockBase_5 getSupportedModes", function (assert) {
        var objectPageBlockBase4 = this.objectPageSampleView.byId("ObjectPageBlockBase330_4");
        assert.strictEqual(jQuery.isEmptyObject(objectPageBlockBase4.getSupportedModes()),  false, "Object Page Block Base 5: can get the supportedModes");
    });
    QUnit.test("ObjectPageSubSection330_0: showSubSectionMore set with default value", function (assert) {
        var objectPageSubSectionSeeMore0 =  $("#UxAP-330_PropertyOnBlockToSayIfItHaveMoreInfoToDisplay--ObjectPageSubSection330_0--seeMore").is(":visible");
        assert.strictEqual(objectPageSubSectionSeeMore0, false, "Object Page SubSection 0: 1 block with showSubSectionMore default value, seeMore not visible");
    });
    QUnit.test("ObjectPageSubSection330_1: 1 block with showSubSectionMore true", function (assert) {
        var objectPageSubSectionSeeMore1 =  $("#UxAP-330_PropertyOnBlockToSayIfItHaveMoreInfoToDisplay--ObjectPageSubSection330_1--seeMore").is(":visible");
        assert.strictEqual(objectPageSubSectionSeeMore1, true, "Object Page SubSection 1: 1 block with showSubSectionMore true, seeMore visible");
    });
    QUnit.test("ObjectPageSubSection330_2: 1 block with showSubSectionMore false", function (assert) {
        var objectPageSubSectionSeeMore2 =  $("#UxAP-330_PropertyOnBlockToSayIfItHaveMoreInfoToDisplay--ObjectPageSubSection330_2--seeMore").is(":visible");
        assert.strictEqual(objectPageSubSectionSeeMore2, false, "Object Page SubSection 2; 1 block with showSubSectionMore false, seeMore not visible");
    });
    QUnit.test("ObjectPageSubSection330_3: 1 block set to true the other set to false", function (assert) {
        var objectPageSubSectionSeeMore3 =  $("#UxAP-330_PropertyOnBlockToSayIfItHaveMoreInfoToDisplay--ObjectPageSubSection330_3--seeMore").is(":visible");
        assert.strictEqual(objectPageSubSectionSeeMore3, true, "Object Page SubSection 3: 1 block set to true the other set to false, seeMore visible");
    });
    QUnit.test("ObjectPageSubSection330_4: all block set showSubSectionMore value to false", function (assert) {
        var objectPageSubSectionSeeMore4 =  $("#UxAP-330_PropertyOnBlockToSayIfItHaveMoreInfoToDisplay--ObjectPageSubSection330_4--seeMore").is(":visible");
        assert.strictEqual(objectPageSubSectionSeeMore4, false, "Object Page SubSection 4: all block set showSubSectionMore value to false, seeMore not visible");
    });

}(jQuery, QUnit));
