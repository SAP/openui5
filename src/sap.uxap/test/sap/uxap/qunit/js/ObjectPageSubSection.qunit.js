/*global QUnit,sinon*/

(function ($, QUnit, sinon, testData) {
	"use strict";

	jQuery.sap.registerModulePath("view", "./view");
	jQuery.sap.registerModulePath("sap.uxap.testblocks", "./blocks");
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

	QUnit.test("SubSection action buttons visibility", function (assert) {
		var oActionButton1 = new sap.m.Button({text: "Invisible", visible: false}),
			oActionButton2 = new sap.m.Button({text: "Invisible", visible: false}),
			oObjectPageLayout = new sap.uxap.ObjectPageLayout({
					sections: [
						new sap.uxap.ObjectPageSection({
							title:"Personal",
							subSections: [
								new sap.uxap.ObjectPageSubSection({
									actions: [oActionButton1],
									blocks: new sap.m.Label({text: "Block1" })
								}),
								new sap.uxap.ObjectPageSubSection({
									title: "Payment information",
									actions: [oActionButton2],
									blocks: new sap.m.Label({text: "Block1" })
								})
							]
						})
					]
				}),
				oSubSection1 = oObjectPageLayout.getSections()[0].getSubSections()[0],
				oSubSection2 = oObjectPageLayout.getSections()[0].getSubSections()[1];

		oObjectPageLayout.placeAt('qunit-fixture');
		sap.ui.getCore().applyChanges();

		//assert
		assert.ok(oSubSection1.$("header").hasClass("sapUiHidden"), "SubSection header with no visisble title and actions should be invisible");
		assert.notOk(oSubSection2.$("header").hasClass("sapUiHidden"), "SubSection header with title and no visible actions should be visible");

		//act
		oActionButton1.setVisible(true);
		oSubSection2.setTitle("");
		sap.ui.getCore().applyChanges();

		//assert
		assert.notOk(oSubSection1.$("header").hasClass("sapUiHidden"), "SubSection header with visible actions should become visible");
		assert.ok(oSubSection2.$("header").hasClass("sapUiHidden"), "SubSection header with no visisble title and actions should become invisible");

		oObjectPageLayout.destroy();
	});

	QUnit.module("Object Page SubSection media classes", {
		beforeEach: function () {
			this.oObjectPageLayout = new sap.uxap.ObjectPageLayout({
				selectedSection: "section2",
				sections: [
					new sap.uxap.ObjectPageSection("section1", {
						title: "section 1",
						subSections: [
							new sap.uxap.ObjectPageSubSection({
								title:"subsection 1",
								blocks: [
									new sap.m.Button({ text: 'notext' })
								]
							})
						]
					}),
					new sap.uxap.ObjectPageSection("section2", {
						title: "section 2",
						subSections: [
							new sap.uxap.ObjectPageSubSection({
								id: "subsection2",
								title:"subsection 2",
								blocks: [
									new sap.m.Button({ text: 'notext' })
								]
							})
						]
					})
				]
			});
			this.fnOnScrollSpy = sinon.spy(this.oObjectPageLayout, "_onScroll");
			this.oObjectPageLayout.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oObjectPageLayout.destroy();
		}
	});

	QUnit.test("Content scrollTop is preserved on section rerendering", function(assert) {
		// note that selected section is the last visible one
		var oLastSubSection = this.oObjectPageLayout.getSections()[1].getSubSections()[0],
		oObjectPageLayout = this.oObjectPageLayout,
		fnOnScrollSpy =	this.fnOnScrollSpy,
		done = assert.async(),
		iReRenderingCount = 0,
		iScrollTop;

		assert.expect(1);

		this.oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			// save the scrollTop position
			iScrollTop = oObjectPageLayout._$opWrapper.scrollTop();

			//act
			//makes a change that causes invalidates of the subsection and anchorBar
			oLastSubSection.setTitle("changed");

			oLastSubSection.addEventDelegate({ onAfterRendering: function() {
				iReRenderingCount++;
				// we are interested in the second rerendering
				// (there are two rerenderings because two properties of the oLastSubSection (title and internal title)
				// are changed but at different stages
				// where the second invalidation happens internally in applyUXRules)
				if (iReRenderingCount < 2) {
					return;
				}
				setTimeout(function() {
					assert.equal(fnOnScrollSpy.alwaysCalledWithMatch({target: {scrollTop: iScrollTop}}), true, "the correct scroll top is preserved");
					done();
				}, 0);
			}});
		});
	});

    QUnit.module("SubSection access to parent ObjectPage", {
        beforeEach: function () {
            this.oObjectPageLayout = new sap.uxap.ObjectPageLayout({
                sections: [
                    new sap.uxap.ObjectPageSection("section1", {
                        title: "section 1",
                        subSections: [
                            new sap.uxap.ObjectPageSubSection({
                                title:"subsection 1",
                                blocks: [
                                    new sap.m.Button({ text: 'notext' })
                                ]
                            })
                        ]
                    })
                ]
            });
            this.oObjectPageLayout.placeAt('qunit-fixture');
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            this.oObjectPageLayout.destroy();
        }
    });

    QUnit.test("No error when accessing a property of parent ObjectPage", function(assert) {
        // note that selected section is the last visible one
        var oSection = this.oObjectPageLayout.getSections()[0],
            oSubSection;

        //act
        oSubSection = oSection.removeSubSection(0);

        assert.ok(!oSubSection._getUseTitleOnTheLeft(), "falsy value is returned");
    });

	QUnit.module("Accessibility", {
		beforeEach: function() {
			this.ObjectPageSectionView = sap.ui.xmlview("UxAP-13_objectPageSection", {
				viewName: "view.UxAP-13_ObjectPageSection"
			});

			this.ObjectPageSectionView.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.ObjectPageSectionView.destroy();
		}
	});

    QUnit.test("Test aria-labelledby attribute", function(assert) {
		var oSubSectionWithoutTitle = this.ObjectPageSectionView.byId("subsection6"),
			oSubSectionWithTitle = this.ObjectPageSectionView.byId("subsection1"),
			sSubSectionWithTitleAriaLabelledBy = oSubSectionWithTitle.$().attr("aria-labelledby"),
			sSubSectionControlName = sap.uxap.ObjectPageSubSection._getLibraryResourceBundle().getText("SUBSECTION_CONTROL_NAME");

		assert.strictEqual(oSubSectionWithoutTitle.$().attr("aria-label"), sSubSectionControlName, "Subsections without titles should have aria-label='Subsection'");
		assert.strictEqual(oSubSectionWithTitle.getTitle(), document.getElementById(sSubSectionWithTitleAriaLabelledBy).innerText, "Subsection title is properly labelled");
	});

}(jQuery, QUnit, sinon, window.testData));
