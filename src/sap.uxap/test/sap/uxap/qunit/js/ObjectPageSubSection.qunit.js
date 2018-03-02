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

	QUnit.test("removeAggregation", function (assert) {
		var sXmlView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:uxap="sap.uxap" xmlns:m="sap.m">' +
							'<uxap:ObjectPageLayout id="page">' +
								'<uxap:headerTitle>' +
									'<uxap:ObjectPageHeader objectTitle="Title" objectSubtitle="Subtitle">' +
										'<uxap:actions>' +
											'<m:Button press="doSomething" text="Remove Button"/>' +
										'</uxap:actions>' +
										'<uxap:breadCrumbsLinks/>' +
										'<uxap:navigationBar/>' +
									'</uxap:ObjectPageHeader>' +
								'</uxap:headerTitle>' +
								'<uxap:sections>' +
									'<uxap:ObjectPageSection showTitle="true" title="Page Section Title" titleUppercase="true" visible="true">' +
										'<uxap:subSections>' +
											'<uxap:ObjectPageSubSection id="subSection" title="Sub Section Title" mode="Expanded">' +
												'<uxap:blocks>' +
													'<m:Button id="buttonToRemove" text="Button" type="Default" iconFirst="true" width="auto" enabled="true" visible="true" iconDensityAware="false"/>' +
													'<m:SegmentedButton width="auto" enabled="true" visible="true">' +
														'<m:items>' +
															'<m:SegmentedButtonItem icon="sap-icon://taxi" text="Button" width="auto" enabled="true"/>' +
															'<m:SegmentedButtonItem icon="sap-icon://lab" text="Button" width="auto" enabled="true"/>' +
															'<m:SegmentedButtonItem icon="sap-icon://competitor" text="Button" width="auto" enabled="true"/>' +
														'</m:items>' +
													'</m:SegmentedButton>' +
												'</uxap:blocks>' +
												'<uxap:moreBlocks/>' +
												'<uxap:actions/>' +
											'</uxap:ObjectPageSubSection>' +
										'</uxap:subSections>' +
									'</uxap:ObjectPageSection>' +
								'</uxap:sections>' +
							'</uxap:ObjectPageLayout>' +
						'</mvc:View>',
			oView = sap.ui.xmlview({viewContent: sXmlView}),
			oSubSection = oView.byId("subSection"),
			oButton = oView.byId("buttonToRemove");

		oView.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oSubSection.getBlocks().length, 2, "subSection has two blocks");

		// act
		var oResult = oSubSection.removeAggregation("blocks", oButton);

		// assert
		assert.strictEqual(oResult, oButton, "removeAggregation returns the removed control");
		assert.strictEqual(oSubSection.getBlocks().length, 1, "subSection has only one block left");

		oSubSection.destroy();
		oButton.destroy();
	});

	QUnit.module("Object Page SubSection - Managing Block Layouts in Standard Mode", {
		setup: function () {
			this.oLayoutConfig = {M: 2, L: 3, XL: 4};
		}
	});

	oHelpers.generateLayoutConfigTests("TitleOnTop", false, testData.aStandardModeConfig);

	QUnit.module("Object Page SubSection - Managing Block Layouts in two column layout in L", {
		setup: function () {
			this.oLayoutConfig = {M: 2, L: 2, XL: 4};
		}
	});

	oHelpers.generateLayoutConfigTests("TitleOnTop", true, testData.aTwoColumnInLConfig);

	QUnit.module("Object Page SubSection - Managing Block With Title On The Left", {
		setup: function () {
			this.oLayoutConfig = {M: 2, L: 2, XL: 3};
		}
	});

	oHelpers.generateLayoutConfigTests("TitleOnLeft", false, testData.aTitleOnTheLeftConfig);

	QUnit.module("Object Page SubSection - Managing Block With Title On The Left and two column layout in L", {
		setup: function () {
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

}(jQuery, QUnit, sinon, testData));
