(function ($, QUnit, sinon, Importance) {

	jQuery.sap.registerModulePath("view", "view");

    sinon.config.useFakeTimers = true;

	var iRenderingDelay = 1000;
	var ANCHORBAR_CLASS_SELECTOR = ".sapUxAPAnchorBar";
	var HIERARCHICAL_CLASS_SELECTOR = ".sapUxAPHierarchicalSelect";

    module("properties", {
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

    QUnit.test("Show/Hide Bar", function (assert) {
        expect(3); //number of assertions

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

    });

	QUnit.test("Show/Hide popover", function (assert) {
		//no longer show the popover
		this.oObjectPage.setShowAnchorBarPopover(false);
		this.oObjectPage.getAggregation("_anchorBar").getContent()[1].firePress();

		// allow for re-render
		this.clock.tick(iRenderingDelay);

		assert.strictEqual(jQuery(".sapUxAPAnchorBarPopover").length, 0, "don't show popover");
	});

	QUnit.test("Selected button", function (assert) {
		//select button programatically
		var oLastSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[this.oObjectPage.getAggregation("_anchorBar").getContent().length - 1];
		this.oObjectPage.getAggregation("_anchorBar").setSelectedButton(oLastSectionButton);

		// allow for scroling
		this.clock.tick(iRenderingDelay);

		assert.strictEqual(oLastSectionButton.$().hasClass("sapUxAPAnchorBarButtonSelected"), true, "select button programmatically");
	});

	QUnit.test("Phone view", function (assert) {
		//display hierarchical select
		jQuery("html")
			.removeClass("sapUiMedia-Std-Phone sapUiMedia-Std-Desktop sapUiMedia-Std-Tablet")
			.addClass("sapUiMedia-Std-Phone");
		this.oObjectPage.invalidate();

		// allow for re-render
		this.clock.tick(iRenderingDelay);

		assert.ok(jQuery(ANCHORBAR_CLASS_SELECTOR).length > 0 && jQuery(HIERARCHICAL_CLASS_SELECTOR).is(":visible") == true, "display hierarchical select");
	});

	QUnit.test("Anchors for sections with multiple subsection must have arrow-down icon", function (assert) {
		var $arrowDownIcons;

		$arrowDownIcons = this.oObjectPage.$().find(".sapUxAPAnchorBar .sapUxAPAnchorBarButton .sapMBtnIcon");
		assert.ok($arrowDownIcons.length === 1, "Anchorbar has 1 button with arrow-down icon");
	});

	QUnit.test("When using the objectPageNavigation the 'navigate' event is fired with the appropriate arguments", function (assert) {
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oExpectedSection = this.oObjectPage.getSections()[0],
			navigateSpy = this.spy(this.oObjectPage, "fireNavigate");

		this.oObjectPage.setShowAnchorBarPopover(false);
		oAnchorBar.getContent()[0].firePress();

		assert.ok(navigateSpy.calledWithMatch(sinon.match.has("section", oExpectedSection)), "Event fired has the correct parameters attached");
	});

	var oModel = new sap.ui.model.json.JSONModel({
		sections: [
			{title: "my first section"},
			{title: "my second section"},
			{title: "my third section"},
			{title: "my fourth section"}
		],
		compositeTitle: "Title({0})",
		objectCount: 1
	});

	module("simple binding", {
		beforeEach: function () {
			this.anchorBarView = sap.ui.xmlview("UxAP-69_anchorBarBinding", {
				viewName: "view.UxAP-69_AnchorBarBinding"
			});
			this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
			this.anchorBarView.setModel(oModel);
			this.anchorBarView.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
			this.oLastSectionButton = null;
		}
	});

	QUnit.test("Simple binding initialized from view", function (assert) {
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[0];

		assert.strictEqual(oSectionButton.getText(), "my first section", "binding in view correctly initialized");
	});

	QUnit.test("Update by model change", function (assert) {
		//section title binding updates anchor bar button
		oModel.setProperty("/sections/0/title", "my updated title");
		oModel.refresh(true);

		// allow for re-render
		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[0];

		assert.strictEqual(oSectionButton.getText(), "my updated title", "section title binding updates anchor bar button");
	});

	QUnit.test("Update by setTitle", function (assert) {

		var oSection = this.oObjectPage.getSections()[0];

		oSection.setTitle("my updated title again");

		// allow for re-render
		sap.ui.getCore().applyChanges();
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[0];

		assert.strictEqual(oSectionButton.getText(), "my updated title again", "section title set updates anchor bar button");
	});

	QUnit.test("Dynamic bind property", function(assert) {
		var oSection = this.oObjectPage.getSections()[3];

		oSection.bindProperty("title", "/sections/3/title");

		sap.ui.getCore().applyChanges();
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];

		assert.equal(oSectionButton.getProperty("text"), "my fourth section", "Property must return model value");
	});

	QUnit.test("Dynamic bind property OneTime", function(assert) {
		var oSection = this.oObjectPage.getSections()[3];

		oSection.bindProperty("title", {
			path: "/sections/3/title",
			mode: "OneTime"
		});

		sap.ui.getCore().applyChanges();
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];

		assert.equal(oSectionButton.getProperty("text"), "my fourth section", "Property must return model value");

		oModel.setProperty("/sections/3/title", "newvalue");

		sap.ui.getCore().applyChanges();

		oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];
		assert.equal(oSectionButton.getProperty("text"), "my fourth section", "New model value must not be reflected");
		oModel.setProperty("/sections/3/title", "my fourth section");
	});

	QUnit.test("Dynamic bind property", function(assert) {
		var oSection = this.oObjectPage.getSections()[3];

		oSection.bindProperty("title", {
			path: "/sections/3/title"
		});

		sap.ui.getCore().applyChanges();
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];

		assert.equal(oSectionButton.getProperty("text"), "my fourth section", "Property must return model value");

		oModel.setProperty("/sections/3/title", "newvalue");

		sap.ui.getCore().applyChanges();

		oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];
		assert.equal(oSectionButton.getProperty("text"), "newvalue", "New model value must not be reflected");
	});

	module("complex binding", {
		beforeEach: function () {
			this.anchorBarView = sap.ui.xmlview("UxAP-69_anchorBarBinding", {
				viewName: "view.UxAP-69_AnchorBarBinding"
			});
			this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
			this.anchorBarView.setModel(oModel);
			this.anchorBarView.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
			this.oLastSectionButton = null;
		}
	});

	QUnit.test("Complex binding initialized from view", function (assert) {
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[1];

		assert.strictEqual(oSectionButton.getText(), "Title(1)", "complex title binding correct");
	});

	QUnit.test("Update by model change", function (assert) {
		//section title binding updates anchor bar button
		oModel.setProperty("/objectCount", 2);
		oModel.refresh(true);

		// allow for re-render
		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[1];

		assert.strictEqual(oSectionButton.getText(), "Title(2)", "section title binding updates anchor bar button");
	});


}(jQuery, QUnit, sinon, sap.uxap.Importance));
