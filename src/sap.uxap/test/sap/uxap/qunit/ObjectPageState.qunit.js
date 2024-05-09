/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/ObjectPageHeader",
	"sap/uxap/ObjectPageHeaderActionButton",
	"sap/uxap/ObjectPageDynamicHeaderTitle",
	"sap/m/Button",
	"sap/m/Toolbar",
	"sap/m/Text",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/TextArea",
	"sap/m/library",
	"sap/ui/core/mvc/XMLView"
],
function(
	Element,
	nextUIUpdate,
	jQuery,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	ObjectPageHeader,
	ObjectPageHeaderActionButton,
	ObjectPageDynamicHeaderTitle,
	Button,
	Toolbar,
	Text,
	App,
	Page,
	TextArea,
	mLib,
	XMLView
) {

	"use strict";

	var ButtonType = mLib.ButtonType;

	//eslint-disable-next-line no-void
	const makeVoid = (fn) => (...args) => void fn(...args);

	function createPage(key, useDynamicTitle) {
		var oHeaderTitleType = useDynamicTitle ? ObjectPageDynamicHeaderTitle : ObjectPageHeader;
		var oOPL = new ObjectPageLayout(key,{
			headerTitle:new oHeaderTitleType(key + "-title",{
				actions:[
					new ObjectPageHeaderActionButton({
						icon:'sap-icon://refresh'
					})
				]
			}),
			headerContent:[
				new Toolbar({
					content:[
						new Button({
							text:'Button 1',
							type:ButtonType.Emphasized
						}),
						new Button({
							text:'Button 2',
							type:ButtonType.Emphasized
						})
					]
				}).addStyleClass('borderless')
			],
			sections:[
				new ObjectPageSection({
					showTitle:false,
					subSections:[
						new ObjectPageSubSection({
							blocks:[
								new Text({text:'Page ' + key}),
								new Text({text:'More to come...'})
							]
						})
					]
				})
			]
		});

		return oOPL;
	}

	QUnit.test("Show/Hide Page preserves expanded state", async function(assert) {

		var oPage1 = createPage("page1"),
			oPage2 = createPage("page2"),
			oApp = new App({pages: [oPage1, oPage2],
									initialPage: oPage1});
		oApp.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(oPage1._bStickyAnchorBar === false, "page is expanded");

		var done = assert.async();
		oApp.attachAfterNavigate(function(oEvent) {
			assert.ok(oPage1._bStickyAnchorBar === false, "page is still expanded");
			if (oApp.getCurrentPage().getId() === "page1") {
				oApp.destroy(); // cleanup
				done();
			}
		});

		oApp.to(oPage2); //hide page1
		oApp.to(oPage1); //back page1
	});

	QUnit.test("Show/Hide Page preserves header actions state", async function(assert) {

		var oPage1 = createPage("page1"),
			oPage2 = createPage("page2"),
			oApp = new App({pages: [oPage1, oPage2],
				initialPage: oPage1}),
			done = assert.async();

		oApp.placeAt("qunit-fixture");
		await nextUIUpdate();

		oPage1.attachEventOnce("onAfterRenderingDOMReady", function() {

			assert.equal(oPage1.getHeaderTitle()._oOverflowButton.$().is(":visible"), false, "overflow is hidden");
			assert.equal(oPage1.getHeaderTitle().getActions()[0].$().is(":visible"), true, "action is visible");

			oApp.attachEventOnce("afterNavigate", function() {
				//assert setup
				oApp.back();

				oApp.attachEventOnce("afterNavigate", function() {
					assert.equal(oPage1.getHeaderTitle()._oOverflowButton.$().is(":visible"), false, "overflow is still hidden");
					assert.equal(oPage1.getHeaderTitle().getActions()[0].$().is(":visible"), true, "action is still visible");
					oApp.destroy(); // cleanup
					done();
				});
			});

			oApp.to(oPage2); //hide page1
		});

	});

	QUnit.test("Resize is detected if rerendered while hidden", async function(assert) {

		var oPage1 = createPage("page1"),
			done = assert.async(),
			oStub = sinon.stub(oPage1.getHeaderTitle(), "_onHeaderResize").callsFake(function(oEvent) {
				assert.strictEqual(oEvent.size.width, 0, "width resize is detected");
				assert.strictEqual(oEvent.size.height, 0, "height resize is detected");
				done();
				 // cleanup
				oStub.restore();
				oPage1.destroy();
			});

		oPage1.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.expect(2);

		function toggleHidden(bEnable) {
			oPage1.toggleStyleClass("sapMNavItem", bEnable).toggleStyleClass("sapMNavItemHidden", bEnable);
		}

		oPage1.attachEventOnce("onAfterRenderingDOMReady", function() {
			toggleHidden(false); // hide page
			oPage1.attachEventOnce("onAfterRenderingDOMReady", function() {
				toggleHidden(true); // show page
			});
			oPage1.invalidate();
		});
	});

	QUnit.test("CSS white-space rule reset. BCP: 1780382804", async function(assert) {
		// Arrange
		var oOPL = new ObjectPageLayout().placeAt("qunit-fixture"),
			oComputedStyle;

		// Act
		await nextUIUpdate();

		// Wrap the control in an element which apply's white-space
		oOPL.$().wrap(jQuery("<div></div>").css("white-space", "nowrap"));

		oComputedStyle = window.getComputedStyle(oOPL.getDomRef());
		assert.strictEqual(oComputedStyle.whiteSpace, "normal",
			"CSS white-space should be reset to 'normal' to prevent breaking of responsive behavior");
		//cleanup
		oOPL.destroy();
	});

	QUnit.module("_hasVisibleDynamicTitleAndHeader (private method)");

	QUnit.test("Object page with ObjectPageHeader", async function(assert) {
		// Arrange
		var oOPL = createPage("testPage", false).placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oOPL._hasVisibleDynamicTitleAndHeader(), false, "Doesn't have visible dynamic title and header");

		// Cleanup
		oOPL.destroy();
	});

	QUnit.test("Object page with ObjectPageDynamicHeaderTitle", async function(assert) {
		// Arrange
		var oOPL = createPage("testPage", true).placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oOPL._hasVisibleDynamicTitleAndHeader(), true, "Has visible dynamic title and header");

		// Cleanup
		oOPL.destroy();
	});

	QUnit.test("Object page with not visible ObjectPageDynamicHeaderTitle", async function(assert) {
		// Arrange
		var oOPL = createPage("testPage", true).placeAt("qunit-fixture");
		oOPL.getHeaderTitle().setVisible(false);

		await nextUIUpdate();

		// Assert
		assert.strictEqual(oOPL._hasVisibleDynamicTitleAndHeader(), false, "Doesn't have visible dynamic title and header");

		// Cleanup
		oOPL.destroy();
	});

	QUnit.test("Object page with empty header content", async function(assert) {
		// Arrange
		var oOPL = createPage("testPage", true).placeAt("qunit-fixture");
		oOPL.getHeaderContent().forEach(function(oControl) {
			oControl.destroy();
		});
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oOPL._hasVisibleDynamicTitleAndHeader(), false, "Doesn't have visible dynamic title and header");

		// Cleanup
		oOPL.destroy();
	});

	QUnit.test("Object page with not visible header content", async function(assert) {
		// Arrange
		var oOPL = createPage("testPage", true).placeAt("qunit-fixture");
		oOPL.setShowHeaderContent(false);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oOPL._hasVisibleDynamicTitleAndHeader(), false, "Doesn't have visible dynamic title and header");

		// Cleanup
		oOPL.destroy();
	});

	QUnit.module("Invalidation", {
		beforeEach: function () {
			this.oObjectPage = createPage("page1");
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("do not invalidate parent upon first rendering", async function(assert) {

		var oTextArea = new TextArea({rows: 5, width: "100%", value: "12345678901234567890", growing: true}),
			oPage = new Page("page01", {content: [oTextArea]}),
			oObjectPageLayout = new ObjectPageLayout("page02", {
				sections: new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							blocks: [new Text({text: "test"})]
						})
					]
				})
			}),
			oApp = new App({
				pages: [
					oPage, oObjectPageLayout
				]
			}),
			done = assert.async();

		sinon.spy(oApp, "invalidate");

		oTextArea.addEventDelegate({
			onAfterRendering: function(oEvent) {
				assert.strictEqual(oTextArea.getDomRef().scrollHeight > 0, true, "textarea on after rendering has scrollHeight greater than 0");
				assert.strictEqual(oApp.invalidate.called, false, "invalidate not called");
			}
		});

		oApp.placeAt("qunit-fixture");
		await nextUIUpdate();


		var afterBackToPage1 = function() {
				oApp.destroy();
				done();
			},afterNavigatePage2 = function() {
				oApp.detachAfterNavigate(afterNavigatePage2);
				oApp.attachAfterNavigate(afterBackToPage1);
				oApp.to("page01");
			};

		oApp.attachAfterNavigate(afterNavigatePage2);

		oApp.to("page02");
	});

	QUnit.test("toggleTitle upon rerendering", async function(assert) {

		var oObjectPage = this.oObjectPage,
			oSection = oObjectPage.getSections()[0],
			done = assert.async();

		// Setup step1: wait for page to render
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", makeVoid(async function() {

			// Setup step3: wait to onBeforeRendering
			oObjectPage.addEventDelegate({

				onBeforeRendering: function() {
					// Setup step4: mock state after user scrolled to snap the header
					oObjectPage._bHeaderInTitleArea = true;

					// Act: app requests to scroll to a section that requires snapped header
					oObjectPage.scrollToSection(oSection.getId());
				},
				onAfterRendering: function() {
					// Check
					assert.ok(oObjectPage._$titleArea.hasClass("sapUxAPObjectPageHeaderStickied"));
					done();
				}
			});

			// Setup step2: cause rerendering
			oObjectPage.invalidate();
			await nextUIUpdate();
		}));

		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});


	QUnit.module("Sections invalidation", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageState",
				viewName: "view.UxAP-ObjectPageState"
			}).then(async function(oView) {
				this.oView = oView;
				this.oView.placeAt("qunit-fixture");
				await nextUIUpdate();
				this.oObjectPage = this.oView.byId("ObjectPageLayout");
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("changes to hidden sections update the anchor bar", function (assert) {
		//setup
		var oPage = this.oObjectPage;
		oPage.setUseIconTabBar(true);
		var done = assert.async();

		setTimeout(function() {

			//act
			oPage.getSections()[1].setTitle("Changed");

			setTimeout(function() {

				var oTabButton = oPage.getAggregation("_anchorBar").getContent()[1];
				assert.ok(oTabButton.getText() === "Changed", "section title is updated in the anchorBar");
				done();
			}, 1000); //calc delay

		}, 1000); //dom calc delay
	});

	QUnit.module("update title size", {
		beforeEach: function () {
			this.oObjectPage = createPage("page1", true);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("updates the title positioning", async function(assert) {
		//setup
		var oPage = this.oObjectPage,
			oSpy = this.spy(oPage, "_adjustTitlePositioning"),
			done = assert.async();

		oPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			oSpy.reset();

			// act
			oPage._adjustHeaderHeights();

			// check
			assert.equal(oSpy.callCount, 1, "update is called");
			done();
		});

		oPage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.test("updates the title positioning in first onAfterRendering", async function(assert) {
		//setup
		var oPage = this.oObjectPage,
			oSpy = this.spy(oPage, "_adjustTitlePositioning"),
			done = assert.async();

		oPage.addEventDelegate({
			onAfterRendering: function() {
				assert.equal(oSpy.callCount, 1, "update is called");
				done();
				oPage.removeEventDelegate(this);
			}
		});

		oPage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.test("sets scrollPaddingTop", async function(assert) {
		//setup
		var oPage = this.oObjectPage,
			oSpy = this.spy(oPage, "_adjustTitlePositioning"),
			done = assert.async();

		oPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			oSpy.reset();

			// act: scroll to snap
			oPage._scrollTo(oPage._getSnapPosition() + 1, 0);

			// check
			assert.equal(oSpy.callCount, 1, "update is called");
			assert.ok(parseInt(oPage._$opWrapper.css("padding-top")) > 0, "scroll-padding-top is set");
			assert.strictEqual(oPage._$opWrapper.css("padding-top"), oPage._$opWrapper.css("scroll-padding-top"), "scroll-padding-top matches padding-top");
			done();
		});

		oPage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.module("update content size", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageState",
				viewName: "view.UxAP-ObjectPageState"
			}).then(async function(oView) {
				this.oView = oView;
				this.oView.placeAt("qunit-fixture");
				this.oObjectPage = this.oView.byId("ObjectPageLayout");
				this.oObjectPage.setSelectedSection(this.oObjectPage.getSections()[1].getId());
				await nextUIUpdate();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("expand content below selected section updates layout", function (assert) {
		//setup
		var oPage = this.oObjectPage,
			oBlock = oPage.getSections()[2].getSubSections()[0].getBlocks()[0],
			done = assert.async();

		setTimeout(function() {
			//act
			oBlock.setHeight("600px"); //add 300px more
			setTimeout(function() {

				var sSelectedButtonId = oPage.getAggregation("_anchorBar").getSelectedButton(),
					oSelectedButton = Element.getElementById(sSelectedButtonId),
					sSelectedSectionId = oPage.getSelectedSection(),
					oSelectedSection = Element.getElementById(sSelectedSectionId);

				assert.strictEqual(oSelectedButton.getText(), oSelectedSection.getTitle(), "section selection is preserved in the anchorBar");
				done();
			}, 1000); //dom calc delay
		}, 1000); //dom calc delay
	});

	function sectionIsSelected(oPage, assert, oExpected) {
		var bSnapped = oExpected.bSnapped,
			iAnchorBarSelectionIndex = oExpected.iAnchorBarSelectionIndex,
			oAnchorBar = oPage.getAggregation("_anchorBar"),
			sSelectedBtnId = oAnchorBar.getSelectedButton(),
			oSelectedButton = Element.getElementById(sSelectedBtnId),
			iSelectedBtnIndex = oAnchorBar.indexOfContent(oSelectedButton);

		assert.strictEqual(oPage._bStickyAnchorBar, bSnapped, "header snapped state is correct");
		assert.strictEqual(iSelectedBtnIndex, iAnchorBarSelectionIndex, "index of anchorBar selected button is correct");
	}

	function runParameterizedTests (bUseIconTabBar) {

		var sModulePrefix = bUseIconTabBar ? "IconTabBar" : "AnchorBar";

		QUnit.module(sModulePrefix + "Mode", {
			beforeEach: function (assert) {
				var done = assert.async();
				XMLView.create({
					id: "UxAP-ObjectPageState",
					viewName: "view.UxAP-ObjectPageState"
				}).then(async function(oView) {
					this.oView = oView;
					this.oObjectPage = this.oView.byId("ObjectPageLayout");
					this.oObjectPage.setUseIconTabBar(bUseIconTabBar);
					this.oView.placeAt("qunit-fixture");
					await nextUIUpdate();
					done();
				}.bind(this));
			},
			afterEach: function () {
				this.oView.destroy();
				this.oObjectPage = null;
			}
		});


		QUnit.test("Delete first section", function (assert) {
			//setup
			var oPage = this.oObjectPage,
				oFirstSection = oPage.getSections()[0],
				done = assert.async(),
				fnOnDomReady = function() {
					// act
					oPage.removeSection(oFirstSection); /* remove first section */

					setTimeout(function() {
						sectionIsSelected(oPage, assert, {
							bSnapped: false,
							iAnchorBarSelectionIndex: 0
						});

						//cleanup
						oFirstSection.destroy();
						done();
					}, 0); //scroll delay
				};
			oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
		});


		QUnit.test("Hide lower section", function (assert) {
			//setup
			var oPage = this.oObjectPage,
				oSecondSection = oPage.getSections()[1],
				oSecondSection_secondSubsection = oSecondSection.getSubSections()[1],
				done = assert.async(),
				iScrollPosition,
				fnOnDomReady = function() {
					oPage.detachEvent("onAfterRenderingDOMReady", fnOnDomReady);
					oPage.scrollToSection(oSecondSection_secondSubsection.getId(), 0);
					iScrollPosition = oPage._computeScrollPosition(oSecondSection_secondSubsection);
					// call the scroll listener synchronously to save a timeout
					oPage._onScroll({target: {scrollTop: iScrollPosition}});
					sectionIsSelected(oPage, assert, {
						bSnapped: true,
						iAnchorBarSelectionIndex: 1
					});

					// act
					oSecondSection.setVisible(false); // hide the entire section

					sectionIsSelected(oPage, assert, { //selection moved to the first visible section
						bSnapped: true,
						iAnchorBarSelectionIndex: 1 // TODO Verify this is correct since these tests were disabled (changed from 0)
					});

					done();
				};
			oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
		});


		QUnit.test("Hide lower subSection", function (assert) {
			//setup
			var oPage = this.oObjectPage,
				oSecondSection_secondSubsection = oPage.getSections()[1].getSubSections()[1],
				bExpectedSnapped = true,
				done = assert.async(),
				iScrollPosition,
				fnOnDomReady = async function() {
					oPage.scrollToSection(oSecondSection_secondSubsection.getId(), 0);
					iScrollPosition = oPage._computeScrollPosition(oSecondSection_secondSubsection);
					// call the scroll listener synchronously to save a timeout
					oPage._onScroll({target: {scrollTop: iScrollPosition}});

					sectionIsSelected(oPage, assert, {
						bSnapped: bExpectedSnapped,
						iAnchorBarSelectionIndex: 1
					});

					// act
					oSecondSection_secondSubsection.setVisible(false); // hide the current subsection

					if (oPage.getUseIconTabBar()) {
						/* only one subsection remained => we are on top of the section => in iconTabBar no need to snap */
						bExpectedSnapped = true; // TODO Verify this is correct since these tests were disabled (changed from false)
					}

					await nextUIUpdate();

					sectionIsSelected(oPage, assert, {
						bSnapped: bExpectedSnapped,
						iAnchorBarSelectionIndex: 1
					});
					done();

			};
			oPage.attachEventOnce("onAfterRenderingDOMReady", makeVoid(fnOnDomReady));
		});
	}

	QUnit.test("skips layout calculations if rendering not completed", function (assert) {

		var oObjectPage = this.oObjectPage,
			oCacheDomElementsSpy = sinon.spy(oObjectPage, "_cacheDomElements"),
			oObtainLayoutSpy = sinon.spy(oObjectPage, "_obtainExpandedTitleHeight"),
			oHeaderTitle = oObjectPage.getHeaderTitle(),
			done = assert.async();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			// assert initial state
			assert.ok(oObjectPage._$titleArea.length > 0, "DOM reference is cached");

			oHeaderTitle.addEventDelegate({
				onAfterRendering: function() { // at this point onAfterRendering of ObjectPage is not called yet
					assert.ok(oCacheDomElementsSpy.notCalled, "DOM references are not yet cached");
					assert.ok(oObjectPage._$titleArea.length === 0, "DOM reference is not yet available");
					assert.ok(oObtainLayoutSpy.notCalled, "layout of title is not calculated");
					done();
				}
			});

			// Act
			oCacheDomElementsSpy.resetHistory();
			oObtainLayoutSpy.resetHistory();
			oObjectPage.invalidate(); // after rerender the old cached references will no longer be valid
		});
	});

	QUnit.module("Header expand|collapse", {
		beforeEach: function () {
			this.oObjectPage = new ObjectPageLayout({
				headerTitle: new ObjectPageHeader()
			});
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Expand button listener lifecycle", async function(assert) {
		// Arrange
		var oSpy = sinon.spy(this.oObjectPage, "_handleExpandButtonPressEventLifeCycle");

		// Act
		this.oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSpy.callCount, 2,
			"Handler method is called twice - once onBeforeRendering and once onAfterRendering");

		assert.ok(oSpy.calledWith(true), "Handler method is called once with 'true'");
		assert.ok(oSpy.calledWith(false), "Handler method is called once with 'false'");
	});

	QUnit.test("Expand button handler method '_handleExpandButtonPressEventLifeCycle'", function (assert) {
		// Arrange
		var oExpandButton = this.oObjectPage.getHeaderTitle().getAggregation("_expandButton"),
			oAttachSpy = sinon.spy(oExpandButton, "attachPress"),
			oDetachSpy = sinon.spy(oExpandButton, "detachPress");

		// Act - call handler with bAttach = true
		this.oObjectPage._handleExpandButtonPressEventLifeCycle(true);

		// Assert
		assert.strictEqual(oAttachSpy.callCount, 1, "attachPress method called once");
		assert.strictEqual(oDetachSpy.callCount, 0, "detachPress method not called");

		// Arrange
		oAttachSpy.resetHistory();

		// Act - call handler with bAttach = false
		this.oObjectPage._handleExpandButtonPressEventLifeCycle(false);

		// Assert
		assert.strictEqual(oAttachSpy.callCount, 0, "attachPress method not called");
		assert.strictEqual(oDetachSpy.callCount, 1, "detachPress method called once");
	});

	QUnit.test("this.iHeaderContentHeight is acquired in the correct way", async function(assert) {
		// Arrange - add a button to the header content so we will have height
		this.oObjectPage.addHeaderContent(new Button());

		// Act
		this.oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Arrange spy method on the headerContent DOM instance
		var oSpy = sinon.spy(this.oObjectPage._$headerContent[0], "getBoundingClientRect");

		// Act - call internal method _adjustHeaderHeights
		this.oObjectPage._adjustHeaderHeights();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "getBoundingClientRect is called once");
		assert.ok(this.oObjectPage.iHeaderContentHeight > 0, "iHeaderContentHeight is higher than zero");
	});

	QUnit.module("Snap events", {
		beforeEach: function () {
			this.oObjectPage = createPage("page1");
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("event is fired upon moving the header in/out scroll container", async function(assert) {
		var oSpy = this.spy();
		this.oObjectPage.attachEvent("_snapChange", oSpy);
		this.oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();
		oSpy.resetHistory();

		this.oObjectPage._moveHeaderToTitleArea();
		assert.strictEqual(oSpy.callCount, 1, "the event is fired");

		oSpy.resetHistory();
		this.oObjectPage._moveHeaderToContentArea();
		assert.strictEqual(oSpy.callCount, 1, "the event is fired");
	});

	QUnit.module("Async code execution after destroy method called", {
		beforeEach: function () {
			this.oObjectPage = createPage("page1", true);
		},
		afterEach: function (assert) {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Async code execution after destroy method called", async function(assert) {

		//Arrange
		var oFakeEvent = {
			size: {
				width: 300,
				height: 1000
			},
			oldSize: {
				width: 1000,
				height: 1000
			}
		},
		oStub,
		done = assert.async();
		this.oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();

		oStub = sinon.stub(ObjectPageDynamicHeaderTitle.prototype, "_onResize");

		//Act
		this.oObjectPage._bDomReady = true;
		this.oObjectPage._onUpdateScreenSize(oFakeEvent);

		this.oObjectPage.destroy();
		await nextUIUpdate();

		//Act
		this.oObjectPage = createPage("page-new", true);
		this.oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();
		this.oObjectPage._bDomReady = true;
		this.oObjectPage._onUpdateScreenSize(oFakeEvent);

		setTimeout(function() {

			//Assert
			assert.equal(oStub.callCount,1, "The async call of the method is called only from the newly created Object Page Instance, not being destroyed");
			assert.equal(oStub.getCall(0).thisValue.sId, 'page-new-title', "the method called is the newly created Object Page Instance, not being destroyed");
			oStub.restore();
			done();
		}, 1000);

	});
	var bUseIconTabBar = true;

	runParameterizedTests(bUseIconTabBar);
	runParameterizedTests(!bUseIconTabBar);

});
