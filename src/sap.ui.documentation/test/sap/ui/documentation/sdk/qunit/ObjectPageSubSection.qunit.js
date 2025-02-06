/*global QUnit */
sap.ui.define(["sap/ui/core/Element", "sap/ui/test/utils/nextUIUpdate", "sap/uxap/ObjectPageLayout", "sap/uxap/ObjectPageSection", "sap/ui/documentation/ObjectPageSubSection", "sap/ui/core/HTML"],
    function(Element, nextUIUpdate, ObjectPageLayout, ObjectPageSection, ObjectPageDemokitSubSection, HTML) {
    "use strict";

    QUnit.module("Lifecycle");

    QUnit.test("rerendering", async function(assert) {
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
        await nextUIUpdate();

        // Act
        Element.getElementById("htmlContent").setContent("<div>content</div>");
        await nextUIUpdate();

        // Check
        assert.notEqual(Element.getElementById("htmlContent").getDomRef(), null, "The content is rendered");
        assert.equal(Element.getElementById("htmlContent").getDomRef().textContent, "content", "The correct output is rendered");

        // Cleanup
        page.destroy();

    });

});

