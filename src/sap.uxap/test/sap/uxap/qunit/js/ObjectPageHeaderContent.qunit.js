(function ($, QUnit) {

	var core = sap.ui.getCore();

	jQuery.sap.registerModulePath("view", "view");

	

	module("API", {
    	beforeEach: function () {
    		this.contentView = sap.ui.xmlview("UxAP-ObjectPageHeaderContent", {
    			viewName: "view.UxAP-ObjectPageHeaderContent"
    		});
    		this.contentView.placeAt('qunit-fixture');
		    sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.contentView.destroy();
		}
	});

	QUnit.test("HeaderContent rendering", function (assert) {
		assert.ok(this.contentView.$().find(".sapUxAPObjectPageHeaderContent"), "HeaderContent div is rendered");
	});

	QUnit.test("showTitleInHeaderContent", function (assert) {
		assert.ok(this.contentView.$().find(".sapUxAPObjectPageHeaderIdentifierTitleInContent"), "Title is rendered inside the HeaderContent");
	});

	module("ObjectPageHeaderContent integration inside ObjectPageLayout", {
    	beforeEach: function () {
    		this.contentView = sap.ui.xmlview("UxAP-ObjectPageHeaderContent", {
    			viewName: "view.UxAP-ObjectPageHeaderContent"
    		});
    		this.contentView.placeAt('qunit-fixture');
		    sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.contentView.destroy();
		}
	});

	QUnit.test("indexOfHeaderContent", function (assert) {
		assert.equal(this.contentView.byId("ObjectPageLayout").indexOfHeaderContent(sap.ui.getCore().byId("UxAP-ObjectPageHeaderContent--testLink")), 0, "the Link inside the ContentHeader aggregation is on 0 position");
	});

	QUnit.test("insertHeaderContent", function (assert) {
		this.contentView.byId("ObjectPageLayout").insertHeaderContent(new sap.m.Label({id: "label1", text: "label1"}), 1);
		sap.ui.getCore().applyChanges();

		assert.equal(this.contentView.byId("ObjectPageLayout").getHeaderContent().length, 5, "contents length is 5 after inserting element in the HeaderContent aggregation");
		assert.equal(this.contentView.byId("ObjectPageLayout").indexOfHeaderContent(sap.ui.getCore().byId("label1")), 1, "the label1 inside the ContentHeader aggregation is insert on 1 position");
	});

	QUnit.test("addHeaderContent", function (assert) {
		this.contentView.byId("ObjectPageLayout").addHeaderContent(new sap.m.Label({id: "label2", text: "label2"}));
		sap.ui.getCore().applyChanges();

		assert.equal(this.contentView.byId("ObjectPageLayout").getHeaderContent().length, 5, "contents length is 5 after inserting element in the HeaderContent aggregation");
		assert.equal(this.contentView.byId("ObjectPageLayout").indexOfHeaderContent(sap.ui.getCore().byId("label2")), 4, "the label2 inside the ContentHeader aggregation is added on the last position");
	});

	QUnit.test("removeHeaderContent", function (assert) {
		var oToRemove = this.contentView.byId("testLink");
		this.contentView.byId("ObjectPageLayout").removeHeaderContent(oToRemove);
		sap.ui.getCore().applyChanges();

		assert.equal(this.contentView.byId("ObjectPageLayout").getHeaderContent().length, 3, "contents length is 5 after removing one item");
		
		//cleanup needed since we removed that item from its parent aggregation
		oToRemove.destroy();
	});

	QUnit.test("removeAllHeaderContent", function (assert) {
		var oRemovedContent = this.contentView.byId("ObjectPageLayout").removeAllHeaderContent();
		sap.ui.getCore().applyChanges();

		assert.equal(this.contentView.byId("ObjectPageLayout").getHeaderContent().length, 0, "contents length is 0 after removing it all");
		
		//cleanup needed since we removed those items from their parent aggregation
		oRemovedContent.forEach(function(oItem) {oItem.destroy();});
	});

	QUnit.test("destroyHeaderContent", function (assert) {
		this.contentView.byId("ObjectPageLayout").addHeaderContent(new sap.m.Label({id: "label3", text: "label3"}));
		sap.ui.getCore().applyChanges();

		this.contentView.byId("ObjectPageLayout").destroyHeaderContent();
		sap.ui.getCore().applyChanges();

		assert.equal(this.contentView.byId("ObjectPageLayout").getHeaderContent().length, 0, "contents length is 0 after destroying HeaderContent");
	});

}(jQuery, QUnit));
