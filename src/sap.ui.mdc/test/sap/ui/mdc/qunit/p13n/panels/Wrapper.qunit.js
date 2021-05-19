/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/Wrapper",
    "sap/ui/mdc/p13n/panels/BasePanel"
], function (Wrapper, BasePanel) {
	"use strict";

	QUnit.module("Wrapper API tests", {
		beforeEach: function(){
			this.oWrapper = new Wrapper();

			this.oWrapper.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function(){
			this.oWrapper.destroy();
		}
	});

	QUnit.test("instantiate Wrapper", function(assert){
        assert.ok(this.oWrapper);
    });

	QUnit.test("check inner content", function(assert){
        assert.ok(this.oWrapper._getTabBar().getVisible(), "IconTabBar used by default");
        assert.notEqual(this.oWrapper.getCurrentViewContent(), this.oWrapper.getView("$default"),"No list layout used by default");
    });

    QUnit.test("check inner content layout switch", function(assert){

        this.oWrapper.setListLayout(true);

        assert.ok(!this.oWrapper._getTabBar().getVisible(), "IconTabBar set to invisible");
        assert.ok(this.oWrapper.getView("$default"), "List layout used");

        this.oWrapper.setListLayout(false);

        assert.ok(this.oWrapper._getTabBar().getVisible(), "IconTabBar set to visible");
        assert.notEqual(this.oWrapper.getCurrentViewContent(), this.oWrapper.getView("$default"), "List layout not used");
    });

    QUnit.test("check panel add (IconTabBar)", function(assert){

        this.oWrapper.setListLayout(false);

        this.oWrapper.addPanel(new BasePanel(), "panel1", "panel1");
        this.oWrapper.addPanel(new BasePanel(), "panel2", "panel2");
        this.oWrapper.addPanel(new BasePanel(), "panel3", "panel3");

        var oIconTabBar = this.oWrapper._getTabBar();

        assert.equal(oIconTabBar.getItems().length, 3, "IconTabBar with 3 tabs");

        assert.equal(oIconTabBar.getItems()[0].getText(), "panel1", "tab correct text");
        assert.equal(oIconTabBar.getItems()[1].getText(), "panel2", "tab correct text");
        assert.equal(oIconTabBar.getItems()[2].getText(), "panel3", "tab correct text");
    });

    QUnit.test("check panel add (List)", function(assert){

        this.oWrapper.setListLayout(true);

        this.oWrapper.addPanel(new BasePanel(), "panel1", "panel1");
        this.oWrapper.addPanel(new BasePanel(), "panel2", "panel2");
        this.oWrapper.addPanel(new BasePanel(), "panel3", "panel3");

        var oList = this.oWrapper._getNavigationList();

        assert.equal(oList.getItems().length, 3, "List with 3 tabs");

        assert.equal(oList.getItems()[0].getTitle(), "panel1", "tab correct text");
        assert.equal(oList.getItems()[1].getTitle(), "panel2", "tab correct text");
        assert.equal(oList.getItems()[2].getTitle(), "panel3", "tab correct text");
    });
});
