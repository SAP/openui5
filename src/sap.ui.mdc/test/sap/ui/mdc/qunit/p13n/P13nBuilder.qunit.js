/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/p13n/P13nBuilder",
	"sap/m/p13n/BasePanel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Element",
	"sap/ui/core/Core",
    "sap/ui/fl/write/api/FieldExtensibility",
    "sap/ui/rta/Utils"
], function(P13nBuilder, BasePanel, JSONModel, Element, oCore, FieldExtensibility, Utils) {
	"use strict";

	var aVisible = ["key1", "key2", "key3"];

	var aInfoData = [
		{
			name: "key1",
			label: "Field 1"
		},
		{
			name: "key2",
			label: "Field 2"
		},
		{
			name: "key3",
			label: "Field 3"
		},
		{
			name: "key4",
			label: "Field 4"
		},
		{
			name: "key5",
			label: "Field 5"
		},
		{
			name: "key6",
			label: "Field 6",
			tooltip: "Some Tooltip"
		}
	];



	QUnit.module("API Tests", {
		fnEnhancer: function(mItem, oProperty) {
			if (oProperty.name == "key2") {
				mItem.isFiltered = true;
			}
			mItem.visible = aVisible.indexOf(oProperty.name) > -1;
			return true;
		},
		before: function(){
			this.sDefaultGroup = "BASIC";
			this.aMockInfo = aInfoData;
			oCore.applyChanges();
		},
		after: function(){
			this.sDefaultGroup = null;
			this.oP13nData = null;
			this.aMockInfo = null;
		}
	});

	QUnit.test("Test prepareAdaptationData - return object with two keys", function(assert){
		var oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		assert.ok(oP13nData.items instanceof Array, "Flat structure created");
		assert.ok(oP13nData.itemsGrouped instanceof Array, "Group structure created");

		assert.equal(oP13nData.items.length, this.aMockInfo.length, "correct amount of items created");
		assert.equal(oP13nData.itemsGrouped.length, 1, "No group info provided - only one group created");
		assert.equal(oP13nData.itemsGrouped[0].group, this.sDefaultGroup  , "All items are in group 'BASIC' as there is no group information provided");
		assert.equal(oP13nData.itemsGrouped[0].items.length, this.aMockInfo.length  , "All items are in group 'BASIC' as there is no group information provided");
	});

	QUnit.test("Test prepareAdaptationData - check optional ignoring", function(assert){
		this.aMockInfo[0]["someRandomAttribute"] = true;

		var bIgnore = false;

		var fnIgnore = function(oItem, oInfo) {
			//returned boolean decides the validity of the property
			return !(oInfo.someRandomAttribute === bIgnore);
		};

		//Ignore criteria not met
		var oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, fnIgnore, true);
		assert.equal(oP13nData.items.length, this.aMockInfo.length, "correct amount of items created");

		//Ignore criteria met
		bIgnore = true;
		oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, fnIgnore, true);
		assert.equal(oP13nData.items.length, this.aMockInfo.length - 1, "correct amount of items created");
	});

	QUnit.test("Test prepareAdaptationData - check grouping", function(assert){
		this.aMockInfo[0]["group"] = "Group2";
		this.aMockInfo[3]["group"] = "Group2";

		var oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		assert.equal(oP13nData.itemsGrouped.length, 2, "Additional group created");
		assert.equal(oP13nData.itemsGrouped[1].items.length, this.aMockInfo.length - 2, "Basic group includes less items");
		assert.equal(oP13nData.itemsGrouped[0].items.length, 2, "Second group includes the rest");
	});

	QUnit.test("Check tooltip propagation (only explicitly provided tooltips)", function(assert){
		var oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

		for (var i = 0; i <= 4; i++) {
			assert.strictEqual(oP13nData.items[i].tooltip, "", "No explicit tooltip provided --> no fallback");
		}

		assert.strictEqual(oP13nData.items[5].tooltip, "Some Tooltip", "Explicit tooltip taken over");

	});


	QUnit.test("Test createP13nPopover", function(assert){

		var done = assert.async();

		var oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		var oPanel = new BasePanel();
		oPanel.setP13nData(oP13nData.items);

	   P13nBuilder.createP13nPopover(oPanel, {
			title: "Test"
		}).then(function(oPopover){
			assert.ok(oPopover.isA("sap.m.ResponsivePopover"), "Correct container control created");
			assert.ok(oPopover.getContent()[0].isA("sap.m.p13n.BasePanel"), "correct Content provided");
			assert.equal(oPopover.getTitle(), "Test");

			oPopover.destroy();

			done();
		});

	});

	QUnit.test("Test createP13nDialog", function(assert){

		var done = assert.async();

		var oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		var oPanel = new BasePanel();
		oPanel.setP13nData(oP13nData.items);

		P13nBuilder.createP13nDialog(oPanel, {
			title: "Test",
			id: "myTestDialog"
		}).then(function(oDialog){
			assert.ok(oDialog.getId(), "myTestDialog");
			assert.ok(oDialog.isA("sap.m.Dialog"), "Correct container control created");
			assert.ok(oDialog.getContent()[0].isA("sap.m.p13n.BasePanel"), "correct Content provided");
			assert.equal(oDialog.getTitle(), "Test");

			oDialog.destroy();

			done();
		});

	});

	QUnit.test("Test createP13nDialog with reset included", function(assert){

		var done = assert.async();

		var oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		var oPanel = new BasePanel();
		oPanel.setP13nData(oP13nData.items);

		P13nBuilder.createP13nDialog(oPanel, {
			title: "Test",
			reset: {
				onExecute: function() {
					//Control specific reset handling
				}
			},
			id: "myTestDialog"
		}).then(function(oDialog){
			assert.ok(oDialog.getCustomHeader(), "Custom Header provided");
			assert.equal(oDialog.getCustomHeader().getContentLeft()[0].getText(), "Test", "Title provided");
			assert.ok(oDialog.getCustomHeader().getContentRight()[0].isA("sap.m.Button"), "Reset Button provided");

			oDialog.destroy();

			done();
		});

	});

	QUnit.test("Check focus handling after reset", function(assert){

		var done = assert.async();

		var oResetBtn, oDialog;

		var oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		var oPanel = new BasePanel();
		oPanel.setP13nData(oP13nData.items);

		P13nBuilder.createP13nDialog(oPanel, {
			title: "Test",
			reset: {
				onExecute: function() {

					//4) check if the current focused control is the P13nDialogs reset btn
					var nActiveElement = document.activeElement;
					assert.ok(oDialog.getButtons()[0].getFocusDomRef() === nActiveElement, "The OK button control of the p13n Dialog is focused");
					oDialog.destroy();
					done();

				}
			},
			id: "myTestDialog"
		}).then(function(oP13nDialog){
			oDialog = oP13nDialog;
			oDialog.placeAt("qunit-fixture");

			//1) Trigger reset on Dialog
			oResetBtn = oDialog.getCustomHeader().getContentRight()[0];
			oResetBtn.firePress();

			//2) --> Find MessageBox opened by Dialog
			var oMessageBox = Element.registry.filter(function(oElement){return oElement.getMetadata().isA("sap.m.Dialog") && oElement.getTitle() === "Warning";})[0];

			//3) confirm warning
			oMessageBox.getButtons()[0].firePress();
			oCore.applyChanges();

		});

	});

    QUnit.test("Test addRTACustomFieldButton with reset included", function(assert){

        var done = assert.async(), oAddCustomFieldButton;

        // Arrange
        sinon.stub(FieldExtensibility, "isExtensibilityEnabled").returns(Promise.resolve(true));
        sinon.stub(Utils, "isServiceUpToDate").returns(Promise.resolve(false));
        var oLibraryResourceBundleStub = sinon.stub(sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc"), "getText");
        oLibraryResourceBundleStub.withArgs("p13nDialog.rtaAddTooltip").returns("OK");

        var oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
        var oPanel = new BasePanel();
        oPanel.setP13nData(oP13nData.items);

        P13nBuilder.createP13nDialog(oPanel, {
            title: "Test",
            reset: {
                onExecute: function() {
                    //Control specific reset handling
                }
            },
            id: "myTestDialog"
        }).then(function(oDialog){
            // Assert
            assert.ok(oDialog.getCustomHeader(), "Custom Header provided.");
            assert.equal(oDialog.getCustomHeader().getContentLeft()[0].getText(), "Test", "Title provided.");
            assert.ok(oDialog.getCustomHeader().getContentRight()[0].isA("sap.m.Button"), "Reset Button provided.");

            // Arrange
            P13nBuilder.addRTACustomFieldButton(oDialog)
                .then(function(oDialogEnhanced) {
                    oAddCustomFieldButton = oDialogEnhanced.getCustomHeader().getContentRight()[1];
                    // Assert
                    assert.ok(oAddCustomFieldButton.isA("sap.m.Button"), "Custom Field Add Button provided.");
                    assert.equal(oAddCustomFieldButton.getTooltip(), "OK", "Custom Field Add Button tooltip is correct.");
                })
                .catch(function () {

                })
                .finally(function () {
                    // Cleanup
                    oDialog.destroy();
                    FieldExtensibility.isExtensibilityEnabled.restore();
                    Utils.isServiceUpToDate.restore();
                    done();
                });

        });

    });

});
