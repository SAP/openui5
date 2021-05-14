/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/GroupPanel",
    "sap/ui/model/json/JSONModel"
], function (GroupPanel, JSONModel) {
	"use strict";

	QUnit.module("GroupPanel API tests", {
		beforeEach: function(){
			this.oGroupPanel = new GroupPanel({
                enableShowField: true
            });
			var oModel = new JSONModel({
				items: [
                    {
                        name: "key1",
                        grouped: true,
                        showIfGrouped: true
                    },
                    {
                        name: "key2",
                        grouped: true,
                        showIfGrouped: true
                    },
                    {
                        name: "key3",
                        grouped: false,
                        showIfGrouped: true
                    },
                    {
                        name: "key4",
                        grouped: false,
                        showIfGrouped: true
                    }
				],
                presenceAttribute: "grouped"
			});
			this.oGroupPanel.setP13nModel(oModel);
			this.oGroupPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function(){
			this.oGroupPanel.destroy();
		}
	});

	QUnit.test("instantiate GroupPanel", function(assert){
        assert.ok(this.oGroupPanel);
	});

    QUnit.test("Check initial grouprow amount", function(assert){
        assert.equal(this.oGroupPanel._oListControl.getItems().length, 3, "two initial rows + 1 empty row created");
        assert.equal(this.oGroupPanel._oListControl.getItems()[0].getContent()[0].getContent()[0].getSelectedKey(), "key1", "correct key set");
        assert.equal(this.oGroupPanel._oListControl.getItems()[1].getContent()[0].getContent()[0].getSelectedKey(), "key2", "correct key set");
        assert.equal(this.oGroupPanel._oListControl.getItems()[2].getContent()[0].getContent()[0].getSelectedKey(), "$_none", "correct key set");
	});

    QUnit.test("Check 'showIfGrouped' toggle'", function(assert){
        var oFirstGroupRow = this.oGroupPanel._oListControl.getItems()[0]; //key1
        var oCheckBox = oFirstGroupRow.getContent()[0].getContent()[1].getItems()[0];

        //check initial state
        var aGroupState = [
            {name: "key1", grouped: true, showIfGrouped: true},
            {name: "key2", grouped: true, showIfGrouped: true}
        ];
        assert.deepEqual(this.oGroupPanel.getP13nState(), aGroupState, "Correct group state");

        //Change sort order of 'key1' to descending
        oCheckBox.fireSelect({
            selected: false
        });

        var aNewGroupState = [
            {name: "key1", grouped: true, showIfGrouped: false}, // --> should be updated accordingly in the data
            {name: "key2", grouped: true, showIfGrouped: true}
        ];
        assert.deepEqual(this.oGroupPanel.getP13nState(), aNewGroupState, "Correct group state");


	});
});
