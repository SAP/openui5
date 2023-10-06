/*global QUnit */
sap.ui.define(["sap/ui/core/Core",
    "sap/uxap/ObjectPageLayout",
    "sap/uxap/ObjectPageSection",
    "sap/ui/documentation/ObjectPageSubSection",
    "sap/ui/core/HTML"],
    function(Core, ObjectPageLayout, ObjectPageSection, ObjectPageDemokitSubSection, HTML) {
    "use strict";

    QUnit.module("Lifecycle");

    QUnit.test("rerendering", function (assert) {
        // Setup
        var page = new ObjectPageLayout({
            sections: [
                new ObjectPageSection({
                    subSections: [
                        new ObjectPageDemokitSubSection({
                            title: "Test",
                            blocks: [
                                new HTML("htmlContent")
                            ]
                        })
                    ]
                })
            ]
        });
        page.placeAt("qunit-fixture");
        Core.applyChanges();

        // Act
        Core.byId("htmlContent").setContent("<div>content</div>");
        Core.applyChanges();

        // Check
        assert.notEqual(Core.byId("htmlContent").getDomRef(), null, "The content is rendered");
        assert.equal(Core.byId("htmlContent").getDomRef().textContent, "content", "The correct output is rendered");

        // Cleanup
        page.destroy();

    });

});

