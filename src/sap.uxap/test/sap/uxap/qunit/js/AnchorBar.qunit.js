(function ($, QUnit, sinon, Importance) {

	jQuery.sap.registerModulePath("view", "view");

    sinon.config.useFakeTimers = true;

    module("aat_UxAP-69", {
    	beforeEach: function () {
    		this.anchorBarView = sap.ui.xmlview("UxAP-69_anchorBar", {
                viewName: "view.UxAP-69_AnchorBar"
            });
            this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
            this.anchorBarView.placeAt('qunit-fixture');
		    sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
		}
	});
    var iRenderingDelay = 1000;
    var ANCHORBAR_CLASS_SELECTOR = ".sapUxAPAnchorBar";
    var HIERARCHICAL_CLASS_SELECTOR = ".sapUxAPHierarchicalSelect";

    var oModel = new sap.ui.model.json.JSONModel({
        sections: [
            {title: "my first section"},
            {title: "my second section"},
            {title: "my third section"},
            {title: "my fourth section"}
        ]
    });

    QUnit.test("Show/Hide Bar", function (assert) {
        expect(8); //number of assertions

        this.anchorBarView.setModel(oModel);

        this.clock.tick(iRenderingDelay);

        // test whether it is visible by default
        assert.strictEqual(jQuery(ANCHORBAR_CLASS_SELECTOR).length > 0, true, "anchorBar visible by default");

        // hide the anchor bar
        this.oObjectPage.setShowAnchorBar(false);

        // allow for re-render
        sap.ui.getCore().applyChanges();

        // test whether it is hidden
		assert.strictEqual(jQuery(ANCHORBAR_CLASS_SELECTOR).length, 0, "anchorBar hidden");

        // show the anchor bar back
		this.oObjectPage.setShowAnchorBar(true);

        // allow for re-render
		sap.ui.getCore().applyChanges();
        assert.strictEqual(jQuery(ANCHORBAR_CLASS_SELECTOR).length > 0, true, "anchorBar displayed");

        //no longer show the popover
        this.oObjectPage.setShowAnchorBarPopover(false);
        this.oObjectPage.getAggregation("_anchorBar").getContent()[1].firePress();

        // allow for re-render
        this.clock.tick(iRenderingDelay);

        assert.strictEqual(jQuery(".sapUxAPAnchorBarPopover").length, 0, "don't show popover");

        //select button programatically
        var oLastSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[this.oObjectPage.getAggregation("_anchorBar").getContent().length - 1];
        this.oObjectPage.getAggregation("_anchorBar").setSelectedButton(oLastSectionButton);

        // allow for scroling
        this.clock.tick(iRenderingDelay);

        assert.strictEqual(oLastSectionButton.$().hasClass("sapUxAPAnchorBarButtonSelected"), true, "select button programmatically");

        //section title binding updates anchor bar button
        oModel.setProperty("/sections/3/title", "my updated title");
        oModel.refresh(true);

        // allow for re-render
		this.clock.tick(iRenderingDelay);
        oLastSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[this.oObjectPage.getAggregation("_anchorBar").getContent().length - 1];

        assert.strictEqual(oLastSectionButton.getText(), "my updated title", "section title binding updates anchor bar button");

        var oSecondSection = this.oObjectPage.getSections()[1];

        oSecondSection.setTitle("my updated title again");

        // allow for re-render
        sap.ui.getCore().applyChanges();
        var oSecondSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[1];

        assert.strictEqual(oSecondSectionButton.getText(), "my updated title again", "section title set updates anchor bar button");

        //display hierarchical select
        jQuery("html")
                .removeClass("sapUiMedia-Std-Phone sapUiMedia-Std-Desktop sapUiMedia-Std-Tablet")
                .addClass("sapUiMedia-Std-Phone");
        this.oObjectPage.invalidate();

        // allow for re-render
		this.clock.tick(iRenderingDelay);

        assert.ok(jQuery(ANCHORBAR_CLASS_SELECTOR).length > 0 && jQuery(HIERARCHICAL_CLASS_SELECTOR).is(":visible") == true, "display hierarchical select");

    });
    
   QUnit.test("Anchors for sections with multiple subsection must have arrow-down icon", function () {
		var $arrowDownIcons;

		this.anchorBarView.setModel(oModel);
		this.clock.tick(1000);

		$arrowDownIcons = this.oObjectPage.$().find(".sapUxAPAnchorBar .sapUxAPAnchorBarButton .sapMBtnIcon");
		ok($arrowDownIcons.length === 1, "Anchorbar has 1 button with arrow-down icon");
	});

}(jQuery, QUnit, sinon, sap.uxap.Importance));
