(function ($, QUnit) {

	jQuery.sap.registerModulePath("view", "view");
    jQuery.sap.registerModulePath("sap.uxap.sample", "../demokit/sample");

    jQuery.sap.registerModulePath("view", "view");

    jQuery.sap.require("sap.uxap.ObjectPageLayout");
    jQuery.sap.require("sap.uxap.ObjectPageSection");
    jQuery.sap.require("sap.uxap.ObjectPageHeader");
    
    module("aat_UxAP-162", {
    	beforeEach: function () {
    		this.objectPageSampleView = sap.ui.xmlview("UxAP-162_ObjectPageSample", {viewName : "view.UxAP-162_ObjectPageSample" });
		},
		afterEach: function () {
			this.objectPageSampleView.destroy();
		}
	});

    QUnit.test("ObjectPageId", function (assert) {
    	var referencedObjectPage = this.objectPageSampleView.byId("objectPage162");
            assert.ok(referencedObjectPage != undefined, "ObjectPageLayout created successfuly");
    });

    QUnit.test("ObjectPageSectionId", function (assert) {

        var objectPageSection = this.objectPageSampleView.byId("ObjectPageSection162");
        assert.ok(objectPageSection != undefined, "Object Page Section created successfuly");

    });

    QUnit.test("ObjectPageSubSectionId1", function (assert) {

        var objectPageSubSection1 = this.objectPageSampleView.byId("ObjectPageSubSection162_1");
        assert.ok(objectPageSubSection1 != undefined, "Object Page Sub Section 1 created successfuly");

    });

    QUnit.test("ObjectPageSubSectionId2", function (assert) {

        var objectPageSubSection2 = this.objectPageSampleView.byId("ObjectPageSubSection162_2");
        assert.ok(objectPageSubSection2 != undefined, "Object Page Sub Section 2 created successfuly");

    });

    QUnit.test("HeaderDescriptionId", function (assert) {

        var headerDesc = this.objectPageSampleView.byId("headerDescription");
        assert.ok(headerDesc != undefined, "Header description created successfuly");

    });

    QUnit.test("HeaderRoleId", function (assert) {

        var headerRole = this.objectPageSampleView.byId("headerRole162");
        assert.ok(headerRole != undefined, "Header role created successfuly");
    });
    
    QUnit.test("TextId", function (assert) {

        var text = this.objectPageSampleView.byId("HeaderJobTitle");
        assert.ok(text != undefined, "First Contents created successfuly");

    });

}(jQuery, QUnit));
