/*global QUnit,sinon*/

(function ($, QUnit, sinon, testData) {
	"use strict";

	jQuery.sap.require("sap.uxap.ObjectPageSubSection");

	var ObjectPageSubSection = sap.uxap.ObjectPageSubSection.prototype,
		sConfiguration = "BlockLayout Configuration - ",
		aPropertyTypes = ["span", "linebreak"],
		aScreenTypes = ["S", "M", "L", "XL"],
		oHelpers = {
			getBlock: function (sColumnLayout) {
				return new sap.uxap.BlockBase({
					columnLayout: sColumnLayout
				});
			},
			getSubSection: function () {
				return new sap.uxap.ObjectPageSubSection();
			},
			getLayoutProviderStub: function (bTwoColumnLayout) {
				return {getUseTwoColumnsForLargeScreen: sinon.stub().returns(bTwoColumnLayout)};
			},
			generateLayoutConfigTests: function (sTitleConfig, bUseTwoColumnLayoutL, aModeConfig) {
				QUnit.test("Generates correct layout Configuration", function (assert) {
					var oLayoutProviderStub = oHelpers.getLayoutProviderStub(bUseTwoColumnLayoutL),
						oActualLayout = ObjectPageSubSection._calculateLayoutConfiguration(sTitleConfig, oLayoutProviderStub);

					assert.propEqual(oActualLayout, this.oLayoutConfig);
				});

				aModeConfig.forEach(oHelpers.generateBlockTest);
			},
			getBlocksByConfigString: function (sConfig) {
				return sConfig.split("-").map(this.getBlockFromChar, this);
			},
			getBlockFromChar: function (char) {
				return char === "a" ? this.getBlock("auto") : this.getBlock(char);
			},
			callGetter: function (object, propertyName) {
				return object["get" + propertyName[0].toUpperCase() + propertyName.slice(1)]();
			},
			convertToLayoutObject: function (oLayoutData, aProperties) {
				var resultObject = {};
				aProperties.forEach(function (sProperty) {
					resultObject[sProperty] = this.callGetter(oLayoutData, sProperty);
				}, this);

				return resultObject;
			},
			generateProperties: function (aPropTypes, aScreenTypes) {
				var aResult = [];

				aPropTypes.forEach(function (sPropType) {
					aScreenTypes.forEach(function (sScreenSize) {
						aResult.push(sPropType + sScreenSize);
					});
				});

				return aResult;
			},
			generateLayoutObject: function (aExpectedResult) {
				var resultObject = {};
				aExpectedResult.forEach(function (value, iIndex) {
					resultObject[aProperties[iIndex]] = value;
				});

				return resultObject;
			},
			generateBlockTest: function (oConfigToTest) {
				QUnit.test(sConfiguration + oConfigToTest.configString, function (assert) {
					var aBlocks = oHelpers.getBlocksByConfigString(oConfigToTest.configString);
					ObjectPageSubSection._calcBlockColumnLayout(aBlocks, this.oLayoutConfig);

					aBlocks.forEach(function (oBlock, iIndex) {
						var expected = oHelpers.generateLayoutObject(oConfigToTest.expectedBlockConfig[iIndex]),
							actual = oHelpers.convertToLayoutObject(oBlock.getLayoutData(), aProperties);

						assert.propEqual(actual, expected, "Block " + (iIndex + 1) + " configuration is correct");
					});
				});
			}
		},
		aProperties = oHelpers.generateProperties(aPropertyTypes, aScreenTypes);

	QUnit.module("Object Page SubSection - blocks aggregation");

	QUnit.test("Generates correct layout Configuration", function (assert) {
		var oSubSection = oHelpers.getSubSection(),
			oBlock1 = oHelpers.getBlock(),
			oBlock2 = oHelpers.getBlock(),
			iBlockCount = 0,
			iBlock2ExpectedIndex = 1;

		// Assert default.
		assert.equal(oSubSection.getBlocks().length, iBlockCount, "There are: " + iBlockCount + " blocks.");

		// Act: add a block.
		oSubSection.addBlock(oBlock1);
		iBlockCount++;

		// Assert: check if the block is added
		assert.equal(oSubSection.getBlocks().length, iBlockCount, "There are: " + iBlockCount + " blocks.");

		// Act: insert a block (index = 0)
		oSubSection.insertBlock(oBlock2, 0);
		iBlockCount++;

		// Assert: check if the block is added.
		assert.equal(oSubSection.getBlocks().length, iBlockCount, "There are: " + iBlockCount + " blocks.");
		// Assert: check if the block is added to the end although it is being inserted at index 0.
		assert.equal(oSubSection.indexOfBlock(oBlock2), iBlock2ExpectedIndex,
			"There inserted block is added to the end of the blocks aggregation.");

		oSubSection.removeAllBlocks();
		iBlockCount = 0;
		assert.equal(oSubSection.getBlocks().length, iBlockCount, "There are: " + iBlockCount + " blocks.");

		oSubSection.destroy();
	});

	QUnit.module("Object Page SubSection - moreBlocks aggregation");

	QUnit.test("Generates correct layout Configuration", function (assert) {
		var oSubSection = oHelpers.getSubSection(),
			oBlock1 = oHelpers.getBlock(),
			oBlock2 = oHelpers.getBlock(),
			iBlockCount = 0,
			iBlock2ExpectedIndex = 1;

		// Assert default.
		assert.equal(oSubSection.getMoreBlocks().length, iBlockCount, "There are: " + iBlockCount + " blocks.");

		// Act: add a block.
		oSubSection.addMoreBlock(oBlock1);
		iBlockCount++;
		assert.equal(oSubSection.getMoreBlocks().length, iBlockCount, "There are: " + iBlockCount + " blocks.");

		// Act: insert a block (index = 0).
		oSubSection.insertMoreBlock(oBlock2, 0);
		iBlockCount++;
		// Assert: check if the block is added.
		assert.equal(oSubSection.getMoreBlocks().length, iBlockCount, "There are: " + iBlockCount + " blocks.");
		// Assert: check if the block is added to the end although it is being inserted at index 0.
		assert.equal(oSubSection.indexOfMoreBlock(oBlock2), iBlock2ExpectedIndex,
			"There inserted block is added to the end of the blocks aggregation.");

		oSubSection.removeAllMoreBlocks();
		iBlockCount = 0;
		assert.equal(oSubSection.getMoreBlocks().length, iBlockCount, "There are: " + iBlockCount + " blocks.");

		oSubSection.destroy();
	});

	QUnit.module("Object Page SubSection - Managing Block Layouts in Standard Mode", {
		beforeEach: function () {
			this.oLayoutConfig = {M: 2, L: 3, XL: 4};
		}
	});

	oHelpers.generateLayoutConfigTests("TitleOnTop", false, testData.aStandardModeConfig);

	QUnit.module("Object Page SubSection - Managing Block Layouts in two column layout in L", {
		beforeEach: function () {
			this.oLayoutConfig = {M: 2, L: 2, XL: 4};
		}
	});

	oHelpers.generateLayoutConfigTests("TitleOnTop", true, testData.aTwoColumnInLConfig);

	QUnit.module("Object Page SubSection - Managing Block With Title On The Left", {
		beforeEach: function () {
			this.oLayoutConfig = {M: 2, L: 2, XL: 3};
		}
	});

	oHelpers.generateLayoutConfigTests("TitleOnLeft", false, testData.aTitleOnTheLeftConfig);

	QUnit.module("Object Page SubSection - Managing Block With Title On The Left and two column layout in L", {
		beforeEach: function () {
			this.oLayoutConfig = {M: 2, L: 1, XL: 3};
		}
	});

	oHelpers.generateLayoutConfigTests("TitleOnLeft", true, testData.aTitleOnTheLeftConfigAndTwoColumnInL);

	QUnit.module("Object Page SubSection - subSectionLayout prop");

	QUnit.test("SubSection Header is with title on the LEFT", function (assert) {
		var oObjectPageLayout = new sap.uxap.ObjectPageLayout({
				subSectionLayout: sap.uxap.ObjectPageSubSectionLayout.TitleOnLeft,
				sections: [
					new sap.uxap.ObjectPageSection({
						title:"Personal",
						subSections: [
							new sap.uxap.ObjectPageSubSection({
								title: "Connect",
								blocks: new sap.m.Label({text: "Block1" })
							}),
							new sap.uxap.ObjectPageSubSection({
								title: "Payment information",
								blocks: new sap.m.Label({text: "Block1" })
							})
						]
					})
				]
			}),
			oSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];


		oObjectPageLayout.placeAt('qunit-fixture');
		sap.ui.getCore().applyChanges();


		assert.ok(oSubSection.$("header").hasClass("titleOnLeftLayout"), "SubSection header has class titleOnLeftLayout");

		oObjectPageLayout.destroy();
	});

	QUnit.test("SubSection Header is with title on TOP", function (assert) {
		var oObjectPageLayout = new sap.uxap.ObjectPageLayout({
					sections: [
						new sap.uxap.ObjectPageSection({
							title:"Personal",
							subSections: [
								new sap.uxap.ObjectPageSubSection({
									title: "Connect",
									blocks: new sap.m.Label({text: "Block1" })
								}),
								new sap.uxap.ObjectPageSubSection({
									title: "Payment information",
									blocks: new sap.m.Label({text: "Block1" })
								})
							]
						})
					]
				}),
				oSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];


		oObjectPageLayout.placeAt('qunit-fixture');
		sap.ui.getCore().applyChanges();


		assert.notOk(oSubSection.$("header").hasClass("titleOnLeftLayout"), "SubSection header has no titleOnLeftLayout class");

		oObjectPageLayout.destroy();
	});

}(jQuery, QUnit, sinon, window.testData));
