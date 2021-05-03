/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/SortQueryPanel",
    "sap/ui/model/json/JSONModel"
], function (SortQueryPanel, JSONModel) {
	"use strict";

	QUnit.module("SortQueryPanel API tests", {
		beforeEach: function(){
			this.oSortQueryPanel = new SortQueryPanel();
			var oModel = new JSONModel({
				items: [
                    {
                        name: "key1",
                        sorted: true,
                        descending: false
                    },
                    {
                        name: "key2",
                        sorted: true,
                        descending: false
                    },
                    {
                        name: "key3",
                        sorted: false,
                        descending: false
                    },
                    {
                        name: "key4",
                        sorted: false,
                        descending: false
                    }
				],
                presenceAttribute: "sorted"
			});
			this.oSortQueryPanel.setP13nModel(oModel);
			this.oSortQueryPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function(){
			this.oSortQueryPanel.destroy();
		}
	});

	QUnit.test("instantiate SortQueryPanel", function(assert){
        assert.ok(this.oSortQueryPanel);
	});

    QUnit.test("Check initial sortrow amount", function(assert){
        assert.equal(this.oSortQueryPanel._oListControl.getItems().length, 3, "two initial rows + 1 empty row created");
        assert.equal(this.oSortQueryPanel._oListControl.getItems()[0].getContent()[0].getContent()[0].getSelectedKey(), "key1", "correct key set");
        assert.equal(this.oSortQueryPanel._oListControl.getItems()[1].getContent()[0].getContent()[0].getSelectedKey(), "key2", "correct key set");
        assert.equal(this.oSortQueryPanel._oListControl.getItems()[2].getContent()[0].getContent()[0].getSelectedKey(), "$_none", "correct key set");
	});


    QUnit.test("Check sort switch (ascending <> descending)", function(assert){
        var oFirstSortRow = this.oSortQueryPanel._oListControl.getItems()[0]; //key1
        var oSegmentedButton = oFirstSortRow.getContent()[0].getContent()[1];
        var oSortOrderText = oFirstSortRow.getContent()[0].getContent()[2];

        //check initial state
        assert.equal(oSortOrderText.getText(), "Ascending", "Correct sort order text");
        var aSortState = [
            {name: "key1", sorted: true, descending: false},
            {name: "key2", sorted: true, descending: false}
        ];
        assert.deepEqual(this.oSortQueryPanel.getP13nState(), aSortState, "Correct sort state");

        //Change sort order of 'key1' to descending
        oSegmentedButton.fireSelect({
            key: "desc"
        });
        assert.equal(oSortOrderText.getText(), "Descending", "Correct sort order text");
        var aNewSortState = [
            {name: "key1", sorted: true, descending: true},
            {name: "key2", sorted: true, descending: false}
        ];
        assert.deepEqual(this.oSortQueryPanel.getP13nState(), aNewSortState, "Correct sort state");


	});
});
