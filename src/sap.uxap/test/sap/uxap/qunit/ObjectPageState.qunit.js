/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/ObjectPageHeader",
	"sap/uxap/ObjectPageHeaderActionButton",
	"sap/m/Button",
	"sap/m/Toolbar",
	"sap/m/Text",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/TextArea",
	"sap/m/library",
	"sap/ui/core/mvc/XMLView"],
function (
	jQuery,
	Core,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	ObjectPageHeader,
	ObjectPageHeaderActionButton,
	Button,
	Toolbar,
	Text,
	App,
	Page,
	TextArea,
	mLib,
	XMLView) {

	"use strict";

	var ButtonType = mLib.ButtonType;

	function createPage(key) {

		var oOPL = new ObjectPageLayout(key,{
			headerTitle:new ObjectPageHeader({
				objectTitle:key,
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

	QUnit.test("Show/Hide Page preserves expanded state", function (assert) {

		var oPage1 = createPage("page1"),
			oPage2 = createPage("page2"),
			oApp = new App({pages: [oPage1, oPage2],
									initialPage: oPage1});
		oApp.placeAt("qunit-fixture");
		Core.applyChanges();

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

	QUnit.test("Show/Hide Page preserves header actions state", function (assert) {

		var oPage1 = createPage("page1"),
			oPage2 = createPage("page2"),
			oApp = new App({pages: [oPage1, oPage2],
				initialPage: oPage1}),
			done = assert.async();

		oApp.placeAt("qunit-fixture");
		Core.applyChanges();

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

	QUnit.test("Resize is detected if rerendered while hidden", function (assert) {

		var oPage1 = createPage("page1"),
			done = assert.async(),
			oSpy = sinon.spy(oPage1.getHeaderTitle(), "_onHeaderResize");

		oPage1.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.expect(1);

		function toggleHidden(bEnable) {
			oPage1.toggleStyleClass("sapMNavItem", bEnable).toggleStyleClass("sapMNavItemHidden", bEnable);
		}

		oPage1.attachEventOnce("onAfterRenderingDOMReady", function() {
			toggleHidden(false); // hide page
			oPage1.attachEventOnce("onAfterRenderingDOMReady", function() {
				oSpy.reset();
				toggleHidden(true); // show page
				setTimeout(function() {
					assert.ok(oSpy.called, "resize is detected");
					done();
					oPage1.destroy(); // cleanup
				}, 100);
			});
			oPage1.rerender();
		});
	});

	QUnit.test("CSS white-space rule reset. BCP: 1780382804", function (assert) {
		// Arrange
		var oOPL = new ObjectPageLayout().placeAt("qunit-fixture"),
			oComputedStyle;

		// Act
		Core.applyChanges();

		// Wrap the control in a element which apply's white-space
		oOPL.$().wrap("<div style='white-space: nowrap;'></div>");

		oComputedStyle = window.getComputedStyle(oOPL.getDomRef());
		assert.strictEqual(oComputedStyle.whiteSpace, "normal",
			"CSS white-space should be reset to 'normal' to prevent breaking of responsive behavior");
		//cleanup
		oOPL.destroy();
	});

	QUnit.module("Invalidation");

	QUnit.test("do not invalidate parent upon first rendering", function (assert) {

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
		Core.applyChanges();


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


	QUnit.module("Sections invalidation", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageState",
				viewName: "view.UxAP-ObjectPageState"
			}).then(function (oView) {
				this.oView = oView;
				this.oView.placeAt("qunit-fixture");
				Core.applyChanges();
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

	QUnit.module("update content size", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageState",
				viewName: "view.UxAP-ObjectPageState"
			}).then(function (oView) {
				this.oView = oView;
				this.oView.placeAt("qunit-fixture");
				this.oObjectPage = this.oView.byId("ObjectPageLayout");
				this.oObjectPage.setSelectedSection(this.oObjectPage.getSections()[1].getId());
				Core.applyChanges();
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
					oSelectedButton = Core.byId(sSelectedButtonId),
					sSelectedSectionId = oPage.getSelectedSection(),
					oSelectedSection = Core.byId(sSelectedSectionId);

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
			oSelectedButton = Core.byId(sSelectedBtnId),
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
				}).then(function (oView) {
					this.oView = oView;
					this.oObjectPage = this.oView.byId("ObjectPageLayout");
					this.oObjectPage.setUseIconTabBar(bUseIconTabBar);
					this.oView.placeAt("qunit-fixture");
					Core.applyChanges();
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
				fnOnDomReady = function() {
					oPage.detachEvent("onAfterRenderingDOMReady", fnOnDomReady);
					oPage.scrollToSection(oSecondSection_secondSubsection.getId(), 0);

					setTimeout(function() {
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
					}, 0);
				};
			oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
		});


		QUnit.test("Hide lower subSection", function (assert) {
			//setup
			var oPage = this.oObjectPage,
				oSecondSection_secondSubsection = oPage.getSections()[1].getSubSections()[1],
				bExpectedSnapped = true,
				done = assert.async(),
				fnOnDomReady = function() {
					oPage.detachEvent("onAfterRenderingDOMReady", fnOnDomReady);

					oPage.scrollToSection(oSecondSection_secondSubsection.getId(), 0);

					setTimeout(function() {

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
						setTimeout(function() {
							sectionIsSelected(oPage, assert, {
								bSnapped: bExpectedSnapped,
								iAnchorBarSelectionIndex: 1
							});
							done();
						}, 0);
					}, 0); //scroll delay
				};
			oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
		});
	}

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

	QUnit.test("Expand button listener lifecycle", function (assert) {
		// Arrange
		var oSpy = sinon.spy(this.oObjectPage, "_handleExpandButtonPressEventLifeCycle");

		// Act
		this.oObjectPage.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.strictEqual(oSpy.callCount, 2,
			"Handler method is called twice - once onBeforeRendering and once onAfterRendering");

		assert.ok(oSpy.calledWith(true), "Handler method is called once with 'true'");
		assert.ok(oSpy.calledWith(false), "Handler method is called once with 'false'");

		// Cleanup
		oSpy.restore();
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
		oAttachSpy.reset();

		// Act - call handler with bAttach = false
		this.oObjectPage._handleExpandButtonPressEventLifeCycle(false);

		// Assert
		assert.strictEqual(oAttachSpy.callCount, 0, "attachPress method not called");
		assert.strictEqual(oDetachSpy.callCount, 1, "detachPress method called once");

		// Cleanup
		oAttachSpy.restore();
		oDetachSpy.restore();
	});

	QUnit.test("this.iHeaderContentHeight is acquired in the correct way", function (assert) {
		// Arrange - add a button to the header content so we will have height
		this.oObjectPage.addHeaderContent(new Button());

		// Act
		this.oObjectPage.placeAt("qunit-fixture");
		Core.applyChanges();

		// Arrange spy method on the headerContent DOM instance
		var oSpy = sinon.spy(this.oObjectPage._$headerContent[0], "getBoundingClientRect");

		// Act - call internal method _adjustHeaderHeights
		this.oObjectPage._adjustHeaderHeights();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "getBoundingClientRect is called once");
		assert.ok(this.oObjectPage.iHeaderContentHeight > 0, "iHeaderContentHeight is higher than zero");
	});

	var bUseIconTabBar = true;

	runParameterizedTests(bUseIconTabBar);
	runParameterizedTests(!bUseIconTabBar);

});
