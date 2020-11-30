/* global QUnit */
sap.ui.define([
    "sap/ui/mdc/ui/Container",
    "sap/ui/mdc/ui/ContainerItem",
    "sap/m/Table"
], function(Container, ContainerItem, Table) {
	"use strict";

	QUnit.module("Plain Container", {
		beforeEach: function() {
            this.oContainer = new Container();
		},
		afterEach: function() {
            this.oContainer.destroy();
		}
	});

	QUnit.test("Instantiate", function(assert) {
		assert.ok(this.oContainer);
    });

    QUnit.module("Container with items", {
        createContainer: function(sDefaultView) {
            this.oContainer = new Container({
                defaultView: sDefaultView,
                views: [
                    new ContainerItem({
                        key: "view1",
                        content: new Table()
                    }),
                    new ContainerItem({
                        key: "view2",
                        content: new Table()
                    }),
                    new ContainerItem({
                        key: "view3",
                        content: new Table()
                    })
                ]
            });

            this.oContainer.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
		beforeEach: function() {

		},
		afterEach: function() {
            this.oContainer.destroy();
		}
    });

    QUnit.test("Instantiate Container with views", function(assert) {
        this.createContainer();
        assert.ok(this.oContainer);
        assert.equal(this.oContainer.getCurrentViewKey(), "view1", "Correvt view set");
    });

    QUnit.test("Instantiate Container with views and default view", function(assert) {
        this.createContainer("view2");
        assert.ok(this.oContainer);
        assert.equal(this.oContainer.getCurrentViewKey(), "view2", "Correvt view set");
        assert.equal(this.oContainer.getCurrentViewContent(), this.oContainer.getView("view2").getContent(), "Correct content set");
        assert.equal(this.oContainer.oLayout.getContent()[0], this.oContainer.getView("view2").getContent(), "Correct content set in inner layout");

        assert.equal(this.oContainer.getViews().length, 3, "Correct amount of views added");
    });

    QUnit.test("Check 'getView'", function(assert){
        this.createContainer();
        assert.equal(this.oContainer.getView("view2"), this.oContainer.getViews()[1], "Correct view retrieved");
    });

    QUnit.test("Check 'switchView'", function(assert){
        this.createContainer("view2");
        assert.ok(this.oContainer);

        this.oContainer.switchView("view1");

        assert.equal(this.oContainer.getCurrentViewKey(), "view1", "Correvt view set");
        assert.equal(this.oContainer.getCurrentViewContent(), this.oContainer.getView("view1").getContent(), "Correct content set");
        assert.equal(this.oContainer.oLayout.getContent()[0], this.oContainer.getView("view1").getContent(), "Correct content set in inner layout");
    });

    QUnit.test("Check 'removeView' for not current view", function(assert){
        this.createContainer("view2");
        assert.ok(this.oContainer);

        this.oContainer.removeView(0);
        assert.equal(this.oContainer.getViews().length, 2, "View removed");
        assert.equal(this.oContainer.getCurrentViewKey(), "view2", "Correct view set");
    });

    QUnit.test("Check 'removeView' for current view", function(assert){
        this.createContainer("view2");
        assert.ok(this.oContainer);

        this.oContainer.removeView(1);
        assert.equal(this.oContainer.getViews().length, 2, "View removed");
        assert.equal(this.oContainer.getCurrentViewKey(), "view1", "Correct view set - first available view");
    });

});
