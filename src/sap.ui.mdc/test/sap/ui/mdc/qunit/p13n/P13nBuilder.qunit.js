/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/mdc/p13n/P13nBuilder",
	"sap/m/p13n/BasePanel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Element",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/fl/write/api/FieldExtensibility",
	"sap/ui/rta/Utils"
], function(Library, P13nBuilder, BasePanel, JSONModel, Element, nextUIUpdate, FieldExtensibility, Utils) {
	"use strict";

	const aVisible = ["key1", "key2", "key3"];

	const aInfoData = [
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
		before: async function(){
			this.sDefaultGroup = "BASIC";
			this.aMockInfo = aInfoData;
			await nextUIUpdate();
		},
		after: function(){
			this.sDefaultGroup = null;
			this.oP13nData = null;
			this.aMockInfo = null;
		}
	});

	QUnit.test("Test prepareAdaptationData - return object with two keys", function(assert){
		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		assert.ok(oP13nData.items instanceof Array, "Flat structure created");
		assert.ok(oP13nData.itemsGrouped instanceof Array, "Group structure created");

		assert.equal(oP13nData.items.length, this.aMockInfo.length, "correct amount of items created");
		assert.equal(oP13nData.itemsGrouped.length, 1, "No group info provided - only one group created");
		assert.equal(oP13nData.itemsGrouped[0].group, this.sDefaultGroup  , "All items are in group 'BASIC' as there is no group information provided");
		assert.equal(oP13nData.itemsGrouped[0].items.length, this.aMockInfo.length  , "All items are in group 'BASIC' as there is no group information provided");
	});

	QUnit.test("Test prepareAdaptationData - check optional ignoring", function(assert){
		this.aMockInfo[0]["someRandomAttribute"] = true;

		let bIgnore = false;

		const fnIgnore = function(oItem, oInfo) {
			//returned boolean decides the validity of the property
			return !(oInfo.someRandomAttribute === bIgnore);
		};

		//Ignore criteria not met
		let oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, fnIgnore, true);
		assert.equal(oP13nData.items.length, this.aMockInfo.length, "correct amount of items created");

		//Ignore criteria met
		bIgnore = true;
		oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, fnIgnore, true);
		assert.equal(oP13nData.items.length, this.aMockInfo.length - 1, "correct amount of items created");
	});

	QUnit.test("Test prepareAdaptationData - check grouping", function(assert){
		this.aMockInfo[0]["group"] = "Group2";
		this.aMockInfo[3]["group"] = "Group2";

		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		assert.equal(oP13nData.itemsGrouped.length, 2, "Additional group created");
		assert.equal(oP13nData.itemsGrouped[1].items.length, this.aMockInfo.length - 2, "Basic group includes less items");
		assert.equal(oP13nData.itemsGrouped[0].items.length, 2, "Second group includes the rest");
	});

	QUnit.test("Check tooltip propagation (only explicitly provided tooltips)", function(assert){
		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

		for (let i = 0; i <= 4; i++) {
			assert.strictEqual(oP13nData.items[i].tooltip, "", "No explicit tooltip provided --> no fallback");
		}

		assert.strictEqual(oP13nData.items[5].tooltip, "Some Tooltip", "Explicit tooltip taken over");

	});


	QUnit.test("Test createP13nPopover", function(assert){

		const done = assert.async();

		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		const oPanel = new BasePanel();
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

		const done = assert.async();

		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		const oPanel = new BasePanel();
		oPanel.setP13nData(oP13nData.items);

		P13nBuilder.createP13nDialog(oPanel, {
			title: "Test",
			id: "myTestDialog"
		}).then(function(oDialog){
			assert.ok(oDialog.getId(), "myTestDialog");
			assert.ok(oDialog.isA("sap.m.Dialog"), "Correct container control created");
			assert.ok(oDialog.getContent()[0].isA("sap.m.p13n.BasePanel"), "correct Content provided");
			assert.ok(!oDialog.getContent()[0].getProperty("_useFixedWidth"), "the panel does not have fixed width");
			assert.equal(oDialog.getTitle(), "Test");

			oDialog.destroy();

			done();
		});

	});

	QUnit.test("Test createP13nDialog with reset included", function(assert){

		const done = assert.async();

		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		const oPanel = new BasePanel();
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

		const done = assert.async();

		let oResetBtn, oDialog;

		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		const oPanel = new BasePanel();
		oPanel.setP13nData(oP13nData.items);

		P13nBuilder.createP13nDialog(oPanel, {
			title: "Test",
			reset: {
				onExecute: function() {

					//4) check if the current focused control is the P13nDialogs reset btn
					const nActiveElement = document.activeElement;
					assert.ok(oDialog.getButtons()[0].getFocusDomRef() === nActiveElement, "The OK button control of the p13n Dialog is focused");
					oDialog.destroy();
					done();

				}
			},
			id: "myTestDialog"
		}).then(async function(oP13nDialog){
			oDialog = oP13nDialog;
			oDialog.placeAt("qunit-fixture");

			//1) Trigger reset on Dialog
			oResetBtn = oDialog.getCustomHeader().getContentRight()[0];
			oResetBtn.firePress();

			//2) --> Find MessageBox opened by Dialog
			const oMessageBox = Element.registry.filter(function(oElement){return oElement.getMetadata().isA("sap.m.Dialog") && oElement.getTitle() === "Warning";})[0];

			//3) confirm warning
			oMessageBox.getButtons()[0].firePress();
			await nextUIUpdate();

		});

	});

    QUnit.test("Test addRTACustomFieldButton with reset included", function(assert){

        const done = assert.async();
		let oAddCustomFieldButton;

        // Arrange
        sinon.stub(FieldExtensibility, "onControlSelected").returns(Promise.resolve(undefined));
        sinon.stub(FieldExtensibility, "isServiceOutdated").returns(Promise.resolve(false));
        sinon.stub(FieldExtensibility, "isExtensibilityEnabled").returns(Promise.resolve(true));
        const oLibraryResourceBundleStub = sinon.stub(Library.getResourceBundleFor("sap.ui.mdc"), "getText");
        oLibraryResourceBundleStub.withArgs("p13nDialog.rtaAddTooltip").returns("OK");

        const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
        const oPanel = new BasePanel();
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
                    FieldExtensibility.onControlSelected.restore();
                    FieldExtensibility.isServiceOutdated.restore();
                    FieldExtensibility.isExtensibilityEnabled.restore();
                    oLibraryResourceBundleStub.restore();
                    done();
                });

        });

    });

	QUnit.test("loadFlex: is called before addRTACustomFieldButton", function(assert){
        const done = assert.async();

        // Arrange
        sinon.stub(FieldExtensibility, "onControlSelected").returns(Promise.resolve(undefined));
        sinon.stub(FieldExtensibility, "isServiceOutdated").returns(Promise.resolve(false));
        sinon.stub(FieldExtensibility, "isExtensibilityEnabled").returns(Promise.resolve(true));
        const oLoadFlexSpy = sinon.spy(P13nBuilder, "_loadFlex");

        const oLibraryResourceBundleStub = sinon.stub(Library.getResourceBundleFor("sap.ui.mdc"), "getText");
        oLibraryResourceBundleStub.withArgs("p13nDialog.rtaAddTooltip").returns("OK");

        const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
        const oPanel = new BasePanel();
        oPanel.setP13nData(oP13nData.items);

        P13nBuilder.createP13nDialog(oPanel, {
            title: "Test",
            reset: {
                onExecute: function() {}
            },
            id: "myTestDialog"
        }).then(function(oDialog){
            // Arrange
            P13nBuilder.addRTACustomFieldButton(oDialog)
                .then(function(oDialogEnhanced) {
                    assert.ok(oLoadFlexSpy.called, "_loadFlex");
                    assert.ok(oLoadFlexSpy.calledBefore(FieldExtensibility.onControlSelected), "called before onControlSelected");
                    assert.ok(oLoadFlexSpy.calledBefore(FieldExtensibility.isServiceOutdated), "called before isServiceOutdated");
					assert.ok(oLoadFlexSpy.calledBefore(FieldExtensibility.isExtensibilityEnabled), "called before isExtensibilityEnabled");
                })
                .finally(function () {
                    // Cleanup
                    oDialog.destroy();
                    FieldExtensibility.onControlSelected.restore();
                    FieldExtensibility.isServiceOutdated.restore();
                    FieldExtensibility.isExtensibilityEnabled.restore();
					oLibraryResourceBundleStub.restore();
                    oLoadFlexSpy.restore();
                    done();
                });
        });

    });

	QUnit.test("loadFlex: loads flex correctly", function(assert){
        const done = assert.async();

		// Arrange
        const oLibraryResourceBundleStub = sinon.stub(Library.getResourceBundleFor("sap.ui.mdc"), "getText");
        oLibraryResourceBundleStub.withArgs("p13nDialog.rtaAddTooltip").returns("OK");

        const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
        const oPanel = new BasePanel();
        oPanel.setP13nData(oP13nData.items);

		delete P13nBuilder._oFlLibrary;
		// Assert
		assert.notOk(P13nBuilder._oFlLibrary, "P13nBuilder._oFlLibrary is not set yet");

		// Act
        const oPromise = P13nBuilder._loadFlex();

		// Assert
		assert.ok(oPromise instanceof Promise, "_loadFlex returns a Promise");

		oPromise.then(function(oFlexData) {
			assert.ok(P13nBuilder._oFlLibrary, "P13nBuilder._oFlLibrary is set");
			done();
		});
    });
});
