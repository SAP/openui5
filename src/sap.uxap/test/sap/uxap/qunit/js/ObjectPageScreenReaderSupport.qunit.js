(function ($, QUnit) {

    jQuery.sap.registerModulePath("view", "view");
    var sRoleAttribute = "role",
    	assertCorrectRole = function ($elment, sRole, sMessage, assert) {
    	assert.strictEqual($elment.attr(sRoleAttribute), sRole, sMessage);
    }

    module("Screen reader support - Section/SubSection", {
    	beforeEach: function () {
    		this.objectPageView = sap.ui.xmlview("UxAP-71_ObjectPageScreenReaderSupport", {
                viewName: "view.UxAP-71_ObjectPageScreenReaderSupport"
            });
    		this.objectPageView.placeAt('content');
    		sap.ui.getCore().applyChanges();
            
            this.oObjectPage = this.objectPageView.byId("ObjectPageLayout");
            
        },
        afterEach: function() {
        	this.objectPageView.destroy();
        	this.oObjectPage = null;
        }
    });

    QUnit.test("Section/SubSection roles", function (assert) {
        var oSection = this.objectPageView.byId("testSection"),
                oSubSection = this.objectPageView.byId("testSubSection"),
                sRegionRole = "region";

        assertCorrectRole(oSection.$(), sRegionRole, "Sections have appropriate ARIA region role set", assert);
        assertCorrectRole(oSubSection.$(), sRegionRole, "SubSection have appropriate ARIA region role set", assert);
        assertCorrectRole(oSubSection.$(), sRegionRole, "SubSection have appropriate ARIA heading role set", assert)
    });

    QUnit.test("Section receives correct AriaLabelledBy", function (assert) {
        var oSection = this.objectPageView.byId("testSection"),
                sSectionTitle = oSection.getTitle(),
                oHiddenLabel = oSection.getAggregation("ariaLabelledBy");

        assert.strictEqual(oSection._getAriaLabelledBy().getText(), sSectionTitle, "The AriaLabelledBy element is set a" +
        " hidden label is created with the title of the section as text");

        assert.strictEqual(oHiddenLabel.sId, oSection.$().attr("aria-labelledby"),
                "The 'aria-labelledby' attribute is correctly set to the section");
    });

}(jQuery, QUnit));
