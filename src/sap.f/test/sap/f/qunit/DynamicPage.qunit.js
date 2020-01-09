/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/f/DynamicPage",
	"sap/f/DynamicPageTitle",
	"sap/f/DynamicPageHeader",
	"sap/ui/layout/Grid",
	"sap/ui/Device",
	"sap/ui/core/Core",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/UIComponent",
	"sap/m/Breadcrumbs",
	"sap/m/Link",
	"sap/m/Panel",
	"sap/m/Button"
],
function (
	$,
	DynamicPage,
	DynamicPageTitle,
	DynamicPageHeader,
	Grid,
	Device,
	Core,
	ComponentContainer,
	UIComponent,
	Breadcrumbs,
	Link,
	Panel,
	Button
) {
	"use strict";


	var TESTS_DOM_CONTAINER = "qunit-fixture",
		oFactory = {
			getResourceBundle: function () {
				return Core.getLibraryResourceBundle("sap.f");
			},
			getDynamicPage: function () {
				return new DynamicPage({
					showFooter: true,
					title: this.getDynamicPageTitle(),
					header: this.getDynamicPageHeader(),
					content: this.getContent(100),
					footer: this.getFooter()
				});
			},
			getDynamicPageHeaderSnapped: function () {
				return new DynamicPage({
					headerExpanded: false,
					title: this.getDynamicPageTitle(),
					header: this.getDynamicPageHeader(),
					content: this.getContent(100)
				});
			},
			getDynamicPageHeaderSnappedNoContent: function () {
				return new DynamicPage({
					headerExpanded: false,
					title: this.getDynamicPageTitle(),
					header: this.getDynamicPageHeader()
				});
			},
			getDynamicPageWithBigContent: function () {
				return new DynamicPage({
					showFooter: true,
					title: this.getDynamicPageTitle(),
					header: this.getDynamicPageHeader(),
					content: this.getContent(300),
					footer: this.getFooter()
				});
			},
			getDynamicPageWithBigHeaderContent: function () {
				var oBigHeaderContent = [ new Panel({ height: "900px"}) ];
				return new DynamicPage({
					title: this.getDynamicPageTitle(),
					header: this.getDynamicPageHeader(oBigHeaderContent),
					content: this.getContent(900)
				});
			},
			getDynamicPageWithPreserveHeaderOnScroll: function () {
				return new DynamicPage({
					preserveHeaderStateOnScroll: true,
					title: this.getDynamicPageTitle(),
					header: this.getDynamicPageHeader(),
					content: this.getContent(100)
				});
			},
			getDynamicPageWithEmptyHeader: function () {
				return new DynamicPage({
					title: this.getDynamicPageTitle(),
					header: this.getDynamicPageHeader([]),
					content: this.getContent(100)
				});
			},
			getDynamicPageNoHeader: function () {
				return new DynamicPage({
					title: this.getDynamicPageTitle(),
					content: this.getContent(100)
				});
			},
			getDynamicPageNoTitle: function () {
				return new DynamicPage({
					header: this.getDynamicPageHeader(),
					content: this.getContent(100)
				});
			},
			getDynamicPageWithExpandSnapContent: function () {
				return new DynamicPage({
					title: this.getDynamicPageTitleWithExpandSnapContent(),
					header: this.getDynamicPageHeader(),
					content: this.getContent(200),
					footer: this.getFooter()
				});
			},
			getDynamicPageWithBreadCrumbs: function () {
				return new DynamicPage({
					title: this.getDynamicPageTitleWithBreadCrumbs(),
					header: this.getDynamicPageHeader(),
					content: this.getContent(200),
					footer: this.getFooter()
				});
			},
			getDynamicPageWithNavigationActions: function () {
				return new DynamicPage({
					title: this.getDynamicPageTitleWithNavigationActions(),
					header: this.getDynamicPageHeader(),
					content: this.getContent(200),
					footer: this.getFooter()
				});
			},
			getDynamicPageWithStandardAndNavigationActions: function () {
				return new DynamicPage({
					title: this.getDynamicPageTitleWithStandardAndNavigationActions(),
					header: this.getDynamicPageHeader(),
					content: this.getContent(200),
					footer: this.getFooter()
				});
			},
			getDynamicPageWithNavigationActionsAndBreadcrumbs: function () {
				return new DynamicPage({
					title: this.getDynamicPageTitleWithNavigationActionsAndBreadcrumbs(),
					header: this.getDynamicPageHeader(),
					content: this.getContent(200),
					footer: this.getFooter()
				});
			},
			getDynamicPageNoTitleAndHeader: function () {
				return new DynamicPage({
					content: this.getContent(20)
				});
			},
			getDynamicPageToggleHeaderFalse: function () {
				return new DynamicPage({
					toggleHeaderOnTitleClick: false,
					title: this.getDynamicPageTitle(),
					content: this.getContent(100)
				});
			},
			getDynamicPageTitle: function () {
				return new DynamicPageTitle({
					heading:  this.getTitle()
				});
			},
			getDynamicPageTitleWithBreadCrumbs: function () {
				return new DynamicPageTitle({
					heading: this.getTitle(),
					breadcrumbs: new Breadcrumbs({
						links: [
							new Link({text: "link1"}),
							new Link({text: "link2"}),
							new Link({text: "link3"}),
							new Link({text: "link4"})
						]
					})
				});
			},
			getDynamicPageTitleWithStandardAndNavigationActions:  function () {
				return new DynamicPageTitle({
					heading:  this.getTitle(),
					actions: [
						this.getAction(),
						this.getAction()
					],
					navigationActions: [
						this.getAction(),
						this.getAction(),
						this.getAction()
					]
				});
			},
			getDynamicPageTitleWithNavigationActions:  function () {
				return new DynamicPageTitle({
					heading:  this.getTitle(),
					navigationActions: [
						this.getAction(),
						this.getAction(),
						this.getAction()
					]
				});
			},
			getDynamicPageTitleWithNavigationActionsAndBreadcrumbs: function () {
				return new DynamicPageTitle({
					heading:  this.getTitle(),
					breadcrumbs: new Breadcrumbs({
						links: [
							new Link({text: "link1"}),
							new Link({text: "link2"}),
							new Link({text: "link3"}),
							new Link({text: "link4"})
						]
					}),
					navigationActions: [
						this.getAction(),
						this.getAction(),
						this.getAction()
					]
				});
			},
			getDynamicPageTitleWithExpandSnapContent: function () {
				return new DynamicPageTitle({
					heading: this.getTitle(),
					snappedContent: [
						this.getLabel("Snapped Content")
					],
					expandedContent: [
						this.getLabel("Expanded Content")
					],
					content: [this.getLabel("Content1"), this.getLabel("Content2")]
				});
			},
			getDynamicPageHeader: function (aContent) {
				return new DynamicPageHeader({
					pinnable: true,
					content: aContent || this.getContent(5)
				});
			},
			getFooter: function () {
				return new sap.m.OverflowToolbar({
					content: [
						new sap.m.ToolbarSpacer(),
						new Button({
							text: "Accept",
							type: "Accept"
						}),
						new Button({
							text: "Reject",
							type: "Reject"
						})
					]
				});
			},
			getContent: function (iNumber) {
				return new Grid({
					defaultSpan: "XL2 L3 M4 S6",
					content: this.getMessageStrips(iNumber)
				});
			},
			getMessageStrip: function (iNumber) {
				return new sap.m.MessageStrip({
					text: "Content " + ++iNumber
				});
			},
			getMessageStrips: function (iNumber) {
				var aMessageStrips = [];

				for (var i = 0; i < iNumber; i++) {
					aMessageStrips.push(this.getMessageStrip(i));
				}
				return aMessageStrips;
			},
			getAction: function () {
				return new Button({
					text: "Action"
				});
			},
			getLabel: function (sText) {
				return new sap.m.Label({
					text: sText
				});
			},
			getTitle: function () {
				return new sap.m.Title({
					text: "Anna Maria Luisa"
				});
			},
			getOverflowToolbar: function () {
				return new sap.m.OverflowToolbar({
					content: [
						this.getLabel("Label 1"),
						this.getLabel("Label 2")
					]
				});
			}
		},
		oUtil = {
			renderObject: function (oObject) {
				oObject.placeAt(TESTS_DOM_CONTAINER);
				Core.applyChanges();
				return oObject;
			},
			exists: function (vObject) {
				if (arguments.length === 1) {
					return vObject && ("length" in vObject) ? vObject.length > 0 : !!vObject;
				}

				return Array.prototype.slice.call(arguments).every(function (oObject) {
					return this.exists(oObject);
				});
			},
			toMobileMode: function () {
				$("html").removeClass("sapUiMedia-Std-Desktop")
					.removeClass("sapUiMedia-Std-Tablet")
					.addClass("sapUiMedia-Std-Phone");
				sap.ui.Device.system.desktop = false;
				sap.ui.Device.system.tablet = false;
				sap.ui.Device.system.phone = true;
			},
			toTabletMode: function () {
				$("html").removeClass("sapUiMedia-Std-Desktop")
					.removeClass("sapUiMedia-Std-Phone")
					.addClass("sapUiMedia-Std-Tablet");
				sap.ui.Device.system.desktop = false;
				sap.ui.Device.system.phone = false;
				sap.ui.Device.system.tablet = true;
			},
			toDesktopMode: function () {
				$("html").addClass("sapUiMedia-Std-Desktop")
					.removeClass("sapUiMedia-Std-Tablet")
					.removeClass("sapUiMedia-Std-Phone");
				sap.ui.Device.system.desktop = true;
				sap.ui.Device.system.tablet = false;
				sap.ui.Device.system.phone = false;
			},
			testExpandedCollapsedARIA: function (assert, oDynamicPage, bShouldBeExpanded, sAriaLabelledBy, sMessage) {
				var	$oFocusSpan = oDynamicPage.getTitle()._getFocusSpan().$(),
					bAriaExpanded = $oFocusSpan.attr("aria-expanded"),
					sAriaLabelledById = $oFocusSpan.attr("aria-labelledby");

				assert.strictEqual(bAriaExpanded, bShouldBeExpanded, sMessage);
				assert.strictEqual(sAriaLabelledById, sAriaLabelledBy, sMessage);
			}
		};

	/* --------------------------- DynamicPage API -------------------------------------- */
	QUnit.module("DynamicPage - API ", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("Instantiation", function (assert) {
		assert.ok(this.oDynamicPage, "The DynamicPage has instantiated successfully");
		assert.ok(this.oDynamicPage.getTitle(), "The DynamicPage Title has instantiated successfully");
		assert.ok(this.oDynamicPage.getHeader(), "The DynamicPage Header has instantiated successfully");
	});

	QUnit.test("Enabling preserveHeaderStateOnScroll should mutate headerExpanded", function (assert) {
		this.oDynamicPage._snapHeader();

		assert.ok(!this.oDynamicPage.getHeaderExpanded(), "The DynamicPage`s headerExpanded is false, header collapsed");
		assert.ok(!this.oDynamicPage.getPreserveHeaderStateOnScroll(), "The DynamicPage preserveHeaderStateOnScroll is false");

		this.oDynamicPage.setPreserveHeaderStateOnScroll(true);
		assert.ok(!this.oDynamicPage.getHeaderExpanded(), "The DynamicPage`s headerExpanded is preserved");
		assert.ok(this.oDynamicPage.getPreserveHeaderStateOnScroll(), "The DynamicPage preserveHeaderStateOnScroll is true");
	});

	QUnit.test("Using setHeaderExpanded does not make DynamicPageTitle fire stateChange event", function (assert) {
		// arrange
		var oTitle = this.oDynamicPage.getTitle(),
			oStateChangeListener = sinon.spy();

		oTitle.attachEvent("stateChange", oStateChangeListener);

		// act
		this.oDynamicPage.setHeaderExpanded(!this.oDynamicPage.getHeaderExpanded());

		// assert
		assert.ok(!oStateChangeListener.called, "stateChange event was not fired");
	});

	QUnit.module("DynamicPage - API - header initially snapped", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageHeaderSnapped();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	// BCP: 1880276579 - tests if initially snapped header is excluded from tab chain
	QUnit.test("DynamicPage headerExpanded=false header excluded from tab chain", function (assert) {
		var $oDynamicPageHeader = this.oDynamicPage.getHeader().$();

		assert.strictEqual($oDynamicPageHeader.css("visibility"), "hidden", "Header should be excluded from the tab chain");
	});

	QUnit.test("DynamicPage headerExpanded=false pin button visibility", function (assert) {
		var $oPinButton = this.oDynamicPage.getHeader()._getPinButton().$();

		assert.ok($oPinButton.hasClass("sapUiHidden"), "Pin header button should not be visible initially");

		this.oDynamicPage.setHeaderExpanded(true);
		assert.notOk($oPinButton.hasClass("sapUiHidden"), "Pin header button should be visible again");

		this.oDynamicPage.setHeaderExpanded(false);
		assert.ok($oPinButton.hasClass("sapUiHidden"), "Pin header button should be hidden again");
	});

	QUnit.module("DynamicPage - API - header initially snapped without content", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageHeaderSnappedNoContent();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	// BCP: 1880249493 - tests if initially empty page with snapped header expands correctly on click
	QUnit.test("DynamicPage headerExpanded=false expand header with click", function (assert) {
		// setup
		this.oDynamicPage.setContent(oFactory.getContent(500));
		Core.applyChanges();
		this.oDynamicPage.getHeader().$().addClass("sapFDynamicPageHeaderHidden");
		this.oDynamicPage._titleExpandCollapseWhenAllowed(true);

		// assert
		assert.notOk(this.oDynamicPage.getHeader().$().hasClass("sapFDynamicPageHeaderHidden"), "DynamicPage header is shown correctly");
	});

	/* --------------------------- DynamicPage Title API ---------------------------------- */
	QUnit.module("DynamicPage Title - API ", {
		beforeEach: function () {
			sinon.config.useFakeTimers = true;
			this.oDynamicPage = oFactory.getDynamicPage();
			this.oDynamicPageTitle = this.oDynamicPage.getTitle();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			sinon.config.useFakeTimers = false;
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
			this.oDynamicPageTitle = null;
		}
	});

	QUnit.test("Add/Remove dynamically Snapped content", function (assert) {
		var oLabel = oFactory.getLabel("New Label"),
			iExpectedSnappedContentNumber = 0,
			iActualSnappedContentNumber = this.oDynamicPageTitle.getExpandedContent().length;

		assert.equal(iActualSnappedContentNumber, iExpectedSnappedContentNumber, "No Snapped Content");

		// Add label
		iExpectedSnappedContentNumber++;
		this.oDynamicPageTitle.addSnappedContent(oLabel);
		Core.applyChanges();
		iActualSnappedContentNumber = this.oDynamicPageTitle.getSnappedContent().length;

		assert.equal(iActualSnappedContentNumber, iExpectedSnappedContentNumber, "Snapped Content added successfully");


		// Remove label
		iExpectedSnappedContentNumber--;
		this.oDynamicPageTitle.removeSnappedContent(oLabel);
		Core.applyChanges();
		iActualSnappedContentNumber = this.oDynamicPageTitle.getSnappedContent().length;

		assert.equal(iActualSnappedContentNumber, iExpectedSnappedContentNumber, "Snapped Content removed successfully");
	});

	QUnit.test("Add/Remove dynamically Expanded content", function (assert) {
		var oLabel = oFactory.getLabel("New Label"),
			iExpectedExpandedContentNumber = 0,
			iActualExpandedContentNumber = this.oDynamicPageTitle.getExpandedContent().length;

		assert.equal(iActualExpandedContentNumber, iExpectedExpandedContentNumber, "No Expanded Content");

		// Add label
		iExpectedExpandedContentNumber++;
		this.oDynamicPageTitle.addExpandedContent(oLabel);
		iActualExpandedContentNumber = this.oDynamicPageTitle.getExpandedContent().length;

		assert.equal(iActualExpandedContentNumber, iExpectedExpandedContentNumber, "Expanded Content added successfully");


		// Remove label
		iExpectedExpandedContentNumber--;
		this.oDynamicPageTitle.removeExpandedContent(oLabel);
		iActualExpandedContentNumber = this.oDynamicPageTitle.getExpandedContent().length;

		assert.equal(iActualExpandedContentNumber, iExpectedExpandedContentNumber, "Expanded Content removed successfully");
	});

	QUnit.test("Add/Remove dynamically actions", function (assert) {
		var oAction = oFactory.getAction(),
			oAction1 = oFactory.getAction(),
			oAction2 = oFactory.getAction(),
			oAction3 = oFactory.getAction(),
			iExpectedActionsNumber = 0,
			iActualActionsNumber = this.oDynamicPageTitle.getActions().length,
			vResult = null;

		// Assert default state
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "There are no actions.");

		// Act: add Action
		iExpectedActionsNumber++;
		vResult = this.oDynamicPageTitle.addAction(oAction);
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action is added successfully.");
		assert.equal(this.oDynamicPageTitle.getActions()[0].getId(), oAction.getId(), "The action is correctly positioned in the aggregation.");
		assert.equal(oAction.getParent().getId(), this.oDynamicPageTitle.getId(), "The action returns the correct parent.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: insert an existing action at the end
		iExpectedActionsNumber++;
		vResult = this.oDynamicPageTitle.insertAction(oAction, 1);
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Assert
		assert.ok(iActualActionsNumber !== iExpectedActionsNumber, "The action is not inserted.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: insert action at the end
		vResult = this.oDynamicPageTitle.insertAction(oAction1, 1);
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action is inserted successfully.");
		assert.equal(this.oDynamicPageTitle.getActions()[1].getId(), oAction1.getId(), "The action is correctly positioned in the aggregation");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: insert action at the beginning
		iExpectedActionsNumber++;
		vResult = this.oDynamicPageTitle.insertAction(oAction2, 0);
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action is inserted successfully.");
		assert.equal(this.oDynamicPageTitle.getActions()[0].getId(), oAction2.getId(), "The action is correctly positioned in the aggregation.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: insert action in the middle
		iExpectedActionsNumber++;
		vResult = this.oDynamicPageTitle.insertAction(oAction3, 1);
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action is inserted successfully.");
		assert.equal(this.oDynamicPageTitle.getActions()[1].getId(), oAction3.getId(), "The action is correctly positioned in the aggregation.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: remove Action
		vResult = this.oDynamicPageTitle.removeAction(oAction);
		iExpectedActionsNumber--;
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Assert
		assert.equal(oAction.getParent(), null, "The action returns no parent after removed from the DynamicPageTitle.");
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action is removed successfully.");
		assert.equal(vResult, oAction, "The action is returned after removal.");

		// Act: add actions and remove All actions
		this.oDynamicPageTitle.addAction(oAction1);
		this.oDynamicPageTitle.addAction(oAction2);
		this.oDynamicPageTitle.removeAllActions();
		iExpectedActionsNumber = 0;
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "All Actions are removed successfully.");

		// Act: add two actions and then destroy all actions
		this.oDynamicPageTitle.addAction(oAction1);
		this.oDynamicPageTitle.addAction(oAction2);
		vResult = this.oDynamicPageTitle.destroyActions();
		iExpectedActionsNumber = 0;
		iActualActionsNumber = this.oDynamicPageTitle.getActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "All actions are destroyed successfully.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");
		assert.equal(oAction1.bIsDestroyed, true, "The action is destroyed successfully.");
		assert.equal(oAction1.bIsDestroyed, true, "The action is destroyed successfully.");

		// clean
		vResult = null;
	});

	QUnit.test("Add/Remove dynamically navigationActions", function (assert) {
		var oAction = oFactory.getAction(),
			oAction1 = oFactory.getAction(),
			oAction2 = oFactory.getAction(),
			oAction3 = oFactory.getAction(),
			iExpectedActionsNumber = 0,
			iExpectedIndex = 0,
			iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length,
			vResult = null;

		// Assert default state
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "There are no navActions.");

		// Act: add Action
		iExpectedActionsNumber++;
		vResult = this.oDynamicPageTitle.addNavigationAction(oAction);
		iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action added successfully.");
		assert.equal(this.oDynamicPageTitle.indexOfNavigationAction(oAction), iExpectedIndex, "The action is correctly positioned in the aggregation");
		assert.equal(oAction.getParent().getId(), this.oDynamicPageTitle.getId(), "The action returns the correct parent");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: insert an existing action at the end
		iExpectedActionsNumber++;
		vResult = this.oDynamicPageTitle.insertNavigationAction(oAction, 1);
		iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length;

		// Assert
		assert.ok(iActualActionsNumber !== iExpectedActionsNumber, "The action is not inserted.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: insert action at the end
		vResult = this.oDynamicPageTitle.insertNavigationAction(oAction1, 1);
		iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action is inserted successfully.");
		assert.equal(this.oDynamicPageTitle.getNavigationActions()[1].getId(), oAction1.getId(), "The action is correctly positioned in the aggregation.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: insert action at the beginning
		iExpectedActionsNumber++;
		vResult = this.oDynamicPageTitle.insertNavigationAction(oAction2, 0);
		iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action is inserted successfully.");
		assert.equal(this.oDynamicPageTitle.getNavigationActions()[0].getId(), oAction2.getId(), "The action is correctly positioned in the aggregation.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: insert action in the middle
		iExpectedActionsNumber++;
		vResult = this.oDynamicPageTitle.insertNavigationAction(oAction3, 1);
		iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "The action inserted successfully.");
		assert.equal(this.oDynamicPageTitle.getNavigationActions()[1].getId(), oAction3.getId(), "The action is correctly positioned in the aggregation.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");

		// Act: remove Action
		iExpectedActionsNumber--;
		vResult = this.oDynamicPageTitle.removeNavigationAction(oAction);
		iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length;

		// Assert
		assert.equal(oAction.getParent(), null, "The action returns no parent after removed from the DynamicPageTitle.");
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "One action removed successfully.");
		assert.equal(vResult, oAction, "The action is returned after removal.");

		// Act: add actions and remove All actions
		this.oDynamicPageTitle.addNavigationAction(oAction1);
		this.oDynamicPageTitle.addNavigationAction(oAction2);
		this.oDynamicPageTitle.removeAllNavigationActions();
		iExpectedActionsNumber = 0;
		iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "All actions removed successfully.");

		// Act: add two actions and then destroy all actions
		this.oDynamicPageTitle.addNavigationAction(oAction1);
		this.oDynamicPageTitle.addNavigationAction(oAction2);
		vResult = this.oDynamicPageTitle.destroyNavigationActions();
		iExpectedActionsNumber = 0;
		iActualActionsNumber = this.oDynamicPageTitle.getNavigationActions().length;

		// Assert
		assert.equal(iActualActionsNumber, iExpectedActionsNumber, "All Actions are destroyed successfully.");
		assert.equal(vResult, this.oDynamicPageTitle, "DynamicPageTitle is returned correctly.");
		assert.equal(oAction1.bIsDestroyed, true, "The action is destroyed successfully.");
		assert.equal(oAction1.bIsDestroyed, true, "The action is destroyed successfully.");

		// clean
		vResult = null;
	});

	QUnit.test("test primaryArea", function (assert) {
		var oDynamicPageTitle = this.oDynamicPageTitle,
			sBeginArea = sap.f.DynamicPageTitleArea.Begin;

		// Assert default: primary area is "Begin"
		assert.equal(oDynamicPageTitle.getPrimaryArea(), sBeginArea, "is the default one");
	});

	QUnit.test("test areaShrinkRatio", function (assert) {
		var oDynamicPageTitle = this.oDynamicPageTitle;

		// Assert default: Heading:Content:Actions - "1:1.6:1.6"
		assert.equal(oDynamicPageTitle.getAreaShrinkRatio(), "1:1.6:1.6", "is the default one");

		// Act
		oDynamicPageTitle.setAreaShrinkRatio("0:0:0");

		// Assert
		assert.equal(oDynamicPageTitle.getAreaShrinkRatio(), "0:0:0", "shrink factors are correct");
	});

	QUnit.test("Adding an OverflowToolbar to the content sets flex-basis and removing it resets it", function (assert) {
		var oToolbar = oFactory.getOverflowToolbar();

		// Act
		this.oDynamicPageTitle.addContent(oToolbar);
		Core.applyChanges();
		this.clock.tick(1000);

		// Assert
		var sFlexBasis = this.oDynamicPageTitle.$("content").css("flex-basis");
		assert.notEqual(sFlexBasis, "auto", "Adding an OverflowToolbar sets flex-basis");

		// Act
		this.oDynamicPageTitle.removeAllContent();
		Core.applyChanges();
		this.clock.tick(1000);

		// Assert
		var sFlexBasis = this.oDynamicPageTitle.$("content").css("flex-basis");
		assert.equal(sFlexBasis, "auto", "Removing an OverflowToolbar resets flex-basis");
	});

	QUnit.test("Adding a control, other than OverflowToolbar to the content does not set flex-basis", function (assert) {
		var oLabel = oFactory.getLabel("test");

		// Act
		this.oDynamicPageTitle.addContent(oLabel);
		Core.applyChanges();
		this.clock.tick(1000);

		// Assert
		var sFlexBasis = this.oDynamicPageTitle.$("content").css("flex-basis");
		assert.equal(sFlexBasis, "auto", "No flex-basis set");
	});

	QUnit.test("Actions toolbar is extended when its label content extends", function (assert) {
		var oLabel = oFactory.getLabel("");
		this.oDynamicPageTitle.addAction(oLabel);
		Core.applyChanges();
		this.clock.tick(1000);

		var iFlexBasisBefore = parseInt(this.oDynamicPageTitle.$("mainActions").css("flex-basis"), 10);

		// Act
		oLabel.setText("Some non-empty text");
		Core.applyChanges();
		this.clock.tick(1000);

		// Assert
		var sFlexBasisAfter = parseInt(this.oDynamicPageTitle.$("mainActions").css("flex-basis"), 10);
		assert.ok(sFlexBasisAfter > iFlexBasisBefore + 50, "Flex-basis increased to show the new text");
	});

	QUnit.test("Actions toolbar is extended when its link content extends", function (assert) {
		var oLink = new Link();
		this.oDynamicPageTitle.addAction(oLink);
		Core.applyChanges();
		this.clock.tick(1000);

		var iFlexBasisBefore = parseInt(this.oDynamicPageTitle.$("mainActions").css("flex-basis"), 10);

		// Act
		oLink.setText("Some non-empty text");
		Core.applyChanges();
		this.clock.tick(1000);

		// Assert
		var sFlexBasisAfter = parseInt(this.oDynamicPageTitle.$("mainActions").css("flex-basis"), 10);
		assert.ok(sFlexBasisAfter > iFlexBasisBefore + 50, "Flex-basis increased to show the new text");
	});

	QUnit.test("DynamicPage Title - backgroundDesign", function(assert) {
		var $oDomRef = this.oDynamicPageTitle.$();

		// assert
		assert.equal(this.oDynamicPageTitle.getBackgroundDesign(), null, "Default value of backgroundDesign property = null");

		// act
		this.oDynamicPageTitle.setBackgroundDesign("Solid");

		// assert
		assert.ok($oDomRef.hasClass("sapFDynamicPageTitleSolid"), "Should have sapFDynamicPageTitleSolid class");
		assert.strictEqual(this.oDynamicPageTitle.getBackgroundDesign(), "Solid", "Should have backgroundDesign property = 'Solid'");

		// act
		this.oDynamicPageTitle.setBackgroundDesign("Transparent");

		// assert
		assert.notOk($oDomRef.hasClass("sapFDynamicPageTitleSolid"), "Should not have sapFDynamicPageTitleSolid class");
		assert.ok($oDomRef.hasClass("sapFDynamicPageTitleTransparent"), "Should have sapFDynamicPageTitleTransparent class");
		assert.strictEqual(this.oDynamicPageTitle.getBackgroundDesign(), "Transparent", "Should have backgroundDesign property = 'Transparent'");

		// act
		this.oDynamicPageTitle.setBackgroundDesign("Translucent");

		// assert
		assert.notOk($oDomRef.hasClass("sapFDynamicPageTitleTransparent"), "Should not have sapFDynamicPageTitleTransparent class");
		assert.ok($oDomRef.hasClass("sapFDynamicPageTitleTranslucent"), "Should have sapFDynamicPageTitleTranslucent class");
		assert.strictEqual(this.oDynamicPageTitle.getBackgroundDesign(), "Translucent", "Should have backgroundDesign property = 'Translucent'");
	});

	QUnit.test("title clone includes actions", function (assert) {
		var oLink = new Link(),
			oTitleClone,
			iExpectedActionsCount = 1;
		this.oDynamicPageTitle.addAction(oLink);
		assert.strictEqual(this.oDynamicPageTitle.getActions().length, iExpectedActionsCount, "title has expected actions count"); // assert state before act

		// Act
		oTitleClone = this.oDynamicPageTitle.clone();

		// Check
		assert.strictEqual(oTitleClone.getActions().length, iExpectedActionsCount, "title clone also has the same actions count");
	});

	QUnit.test("title clone includes navigation actions", function (assert) {
		var oLink = new Link(),
			oTitleClone,
			iExpectedNavActionsCount = 1;
		this.oDynamicPageTitle.addNavigationAction(oLink);
		assert.strictEqual(this.oDynamicPageTitle.getNavigationActions().length, iExpectedNavActionsCount, "title has expected nav actions count"); // assert state before act

		// Act
		oTitleClone = this.oDynamicPageTitle.clone();

		// Check
		assert.strictEqual(oTitleClone.getNavigationActions().length, iExpectedNavActionsCount, "title clone also has the same nav actions count");
	});


	/* --------------------------- DynamicPage Header API ---------------------------------- */
	QUnit.module("DynamicPage Header - API ", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.toDesktopMode(); //ensure the test will execute correctly even on mobile devices
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Header default aggregation", function (assert) {
		var oHeader = this.oDynamicPage.getHeader(),
			sHeaderDefaultAggregation = oHeader.getMetadata().getDefaultAggregationName();

		assert.strictEqual(sHeaderDefaultAggregation, "content", "The default aggregation is 'content'");
	});

	QUnit.test("DynamicPage Header pinnable and not pinnable", function (assert) {
		var oHeader = this.oDynamicPage.getHeader(),
			oPinButton = oHeader.getAggregation("_pinButton");

		oHeader.setPinnable(false);
		Core.applyChanges();

		assert.ok(!oPinButton.$()[0],
			"The DynamicPage Header Pin Button not rendered");

		oHeader.setPinnable(true);
		Core.applyChanges();

		assert.ok(oPinButton.$()[0],
			"The DynamicPage Header Pin Button rendered");

		assert.equal(oPinButton.$().hasClass("sapUiHidden"), false,
			"The DynamicPage Header Pin Button is visible");
	});

	QUnit.test("DynamicPage Header - expanding/collapsing through the API", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$oDynamicPageHeader = oDynamicPage.getHeader().$(),
			sSnappedClass = "sapFDynamicPageTitleSnapped",
			oSetPropertySpy = this.spy(oDynamicPage, "setProperty"),
			sAriaLabelledBy = oDynamicPage.getTitle().getHeading().getId();

		this.oDynamicPage._bHeaderInTitleArea = true;

		assert.ok(oDynamicPage.getHeaderExpanded(), "initial value for the headerExpanded prop is true");
		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "true", sAriaLabelledBy, "Initial aria-labelledby references");
		assert.ok(!oDynamicPage.$titleArea.hasClass(sSnappedClass));

		oDynamicPage.setHeaderExpanded(false);
		assert.equal(oDynamicPage.getHeaderExpanded(), false, "setting it to false under regular conditions works");
		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "false", sAriaLabelledBy, "Header is now snapped");
		assert.ok(oDynamicPage.$titleArea.hasClass(sSnappedClass));
		assert.ok(oSetPropertySpy.calledWith("headerExpanded", false, true));
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "hidden", "Header should be excluded from the tab chain");
		oSetPropertySpy.reset();

		oDynamicPage.setHeaderExpanded(true);
		assert.ok(oDynamicPage.getHeaderExpanded(), "header converted to expanded");
		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "true", sAriaLabelledBy, "Header is expanded again");
		assert.ok(!oDynamicPage.$titleArea.hasClass(sSnappedClass));
		assert.ok(oSetPropertySpy.calledWith("headerExpanded", true, true));
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "visible", "Header should be included in the tab chain again");
		oSetPropertySpy.reset();

		oDynamicPage._snapHeader();
		assert.equal(oDynamicPage.getHeaderExpanded(), false, "setting it to false via user interaction");
		assert.ok(oDynamicPage.$titleArea.hasClass(sSnappedClass));
		assert.ok(oSetPropertySpy.calledWith("headerExpanded", false, true));
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "hidden", "Header should be excluded from the tab chain");
	});

	QUnit.test("DynamicPage Header - expanding/collapsing by clicking the title", function (assert) {

		var oDynamicPage = this.oDynamicPage,
			$oDynamicPageHeader = oDynamicPage.getHeader().$(),
			oDynamicPageTitle = oDynamicPage.getTitle(),
			sAriaLabelledBy = oDynamicPageTitle.getHeading().getId(),
			$oDynamicPageTitleSpan = oDynamicPageTitle._getFocusSpan().$(),
			oPinButton = oDynamicPage.getHeader()._getPinButton(),
			oFakeEvent = {
				srcControl: oDynamicPageTitle
			};

		this.oDynamicPage._bHeaderInTitleArea = true;

		assert.equal(oDynamicPage.getHeaderExpanded(), true, "Initially the header is expanded");
		assert.equal(oDynamicPage.getToggleHeaderOnTitleClick(), true, "Initially toggleHeaderOnTitleClick = true");
		assert.equal($oDynamicPageTitleSpan.attr("tabindex"), 0, "Initially the header title is focusable");

		oDynamicPageTitle.ontap(oFakeEvent);

		assert.equal(oDynamicPage.getHeaderExpanded(), false, "After one click, the header is collapsed");
		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "false", sAriaLabelledBy, "Header is collapsed after tap");
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "hidden", "Header should be excluded from the tab chain");

		oDynamicPage.setToggleHeaderOnTitleClick(false);

		oDynamicPageTitle.ontap(oFakeEvent);
		assert.equal(oDynamicPage.getHeaderExpanded(), false, "The header is still collapsed, because toggleHeaderOnTitleClick = false");
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "hidden", "Header should be still excluded from the tab chain");
		assert.equal($oDynamicPageTitleSpan.attr("tabindex"), undefined, "The header title is not focusable");
		assert.notOk(oDynamicPage.getTitle().$().attr("aria-labelledby"),
			"Since the header isn't toggleable, an aria-labelledby attribute shouldn't be rendered");

		oDynamicPage.setToggleHeaderOnTitleClick(true);

		oDynamicPageTitle.ontap(oFakeEvent);
		assert.equal(oDynamicPage.getHeaderExpanded(), true, "After restoring toggleHeaderOnTitleClick to true, the header again expands on click");
		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "true", sAriaLabelledBy, "Header is back to expanded");
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "visible", "Header should be included in the tab chain again");
		assert.equal($oDynamicPageTitleSpan.attr("tabindex"), 0, "The header title is focusable again");

		oPinButton.firePress();
		oDynamicPageTitle.ontap(oFakeEvent);

		assert.equal(oDynamicPage.getHeaderExpanded(), false, "After one click, the header is collapsed even it's pinned");
		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "false", sAriaLabelledBy, "Header is collapsed after tap");
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "hidden", "Header should be excluded from the tab chain");
		assert.strictEqual(oPinButton.getPressed(), false, "Pin button pressed state should be reset.");
		assert.strictEqual(oDynamicPage.$().hasClass("sapFDynamicPageHeaderPinned"), false, "DynamicPage header should be unpinned.");
	});

	QUnit.test("DynamicPage toggle header indicators visibility", function (assert) {
		var oDynamicPageTitle = this.oDynamicPage.getTitle(),
			oDynamicPageHeader = this.oDynamicPage.getHeader(),
			oCollapseButton = oDynamicPageHeader.getAggregation("_collapseButton"),
			oExpandButton = oDynamicPageTitle.getAggregation("_expandButton"),
			$oCollapseButton = oCollapseButton.$(),
			$oExpandButton = oExpandButton.$();

		// Assert: toggleHeaderOnTitleClick=true, headerExpanded=true, pinned=false
		assert.equal(oDynamicPageTitle._getShowExpandButton(), false, "The Expand button should not be visible");
		assert.equal(oDynamicPageHeader._getShowCollapseButton(), true, "The Collapse button should be visible");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), true, "The Expand Button is not visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), false, "The Collapse button is visible");

		// Act
		this.oDynamicPage.setToggleHeaderOnTitleClick(false);

		// Assert: toggleHeaderOnTitleClick=false, headerExpanded=true, pinned=false
		// Expected is both the buttons to be hidden
		assert.equal(oDynamicPageTitle._getShowExpandButton(), false, "The Expand button should not be visible");
		assert.equal(oDynamicPageHeader._getShowCollapseButton(), false, "The Collapse button should not be visible");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), true, "Title click is not enabled, the Collapse button is not visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), true, "Title click is not enabled, the Expand button is not visible");

		// Act
		this.oDynamicPage.setToggleHeaderOnTitleClick(true);
		this.oDynamicPage._pin();

		// Act: re-render the Title and Header
		oDynamicPageTitle.rerender();
		oDynamicPageHeader.rerender();
		$oCollapseButton = oCollapseButton.$();
		$oExpandButton = oExpandButton.$();

		// Assert: toggleHeaderOnTitleClick=true, headerExpanded=true, pinned=true
		// Expected is expand button to be hidden and collapse button to be visible after the Title and Header re-rendering
		assert.equal(oDynamicPageHeader._getShowCollapseButton(), true, "The Collapse button should be visible");
		assert.equal(oDynamicPageTitle._getShowExpandButton(), false, "The Expand button should not be visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), false, "Header is pinned, the Expand button is visible");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), true, "Header is pinned, the Collapse button is not visible");

		// Act
		this.oDynamicPage._unPin();
		this.oDynamicPage._snapHeader();

		// Assert: toggleHeaderOnTitleClick=true, headerExpanded=false, pinned=false;
		// Expected: Expand button to be visible and Collapse button to be hidden
		assert.equal(oDynamicPageTitle._getShowExpandButton(), true, "The Expand button should be visible");
		assert.equal(oDynamicPageHeader._getShowCollapseButton(), false, "The Collapse button should not be visible");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), false, "Header is collapsed, the Expand button is visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), true, "Header is collapsed, the Collapse button is not visible");
	});

	QUnit.test("DynamicPage expand/collapse button visibility", function (assert) {
		var oDynamicPageHeader = this.oDynamicPage.getHeader();

		assert.equal(oDynamicPageHeader._getShowCollapseButton(), true, "Collapse button should be visible when the header content has content");

		oDynamicPageHeader.destroyContent();

		assert.equal(oDynamicPageHeader._getShowCollapseButton(), false, "Collapse button should be hidden when the header content has no content");

		oDynamicPageHeader.addContent(oFactory.getContent(1));

		assert.equal(oDynamicPageHeader._getShowCollapseButton(), true, "Collapse button should be visible when the header content has content");
	});

	QUnit.test("DynamicPage Header - backgroundDesign", function(assert) {
		var oDynamicPageHeader = this.oDynamicPage.getHeader(),
			$oDomRef = oDynamicPageHeader.$();

		// assert
		assert.equal(oDynamicPageHeader.getBackgroundDesign(), null, "Default value of backgroundDesign property = null");

		// act
		oDynamicPageHeader.setBackgroundDesign("Solid");

		// assert
		assert.ok($oDomRef.hasClass("sapFDynamicPageHeaderSolid"), "Should have sapFDynamicPageHeaderSolid class");
		assert.strictEqual(oDynamicPageHeader.getBackgroundDesign(), "Solid", "Should have backgroundDesign property = 'Solid'");

		// act
		oDynamicPageHeader.setBackgroundDesign("Transparent");

		// assert
		assert.notOk($oDomRef.hasClass("sapFDynamicPageHeaderSolid"), "Should not have sapFDynamicPageHeaderSolid class");
		assert.ok($oDomRef.hasClass("sapFDynamicPageHeaderTransparent"), "Should have sapFDynamicPageHeaderTransparent class");
		assert.strictEqual(oDynamicPageHeader.getBackgroundDesign(), "Transparent", "Should have backgroundDesign property = 'Transparent'");

		// act
		oDynamicPageHeader.setBackgroundDesign("Translucent");

		// assert
		assert.notOk($oDomRef.hasClass("sapFDynamicPageHeaderTransparent"), "Should not have sapFDynamicPageHeaderTransparent class");
		assert.ok($oDomRef.hasClass("sapFDynamicPageHeaderTranslucent"), "Should have sapFDynamicPageHeaderTranslucent class");
		assert.strictEqual(oDynamicPageHeader.getBackgroundDesign(), "Translucent", "Should have backgroundDesign property = 'Translucent'");
	});

	/* --------------------------- DynamicPage Rendering ---------------------------------- */
	QUnit.module("DynamicPage - Rendering", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithExpandSnapContent();
			oUtil.toDesktopMode(); //ensure the test will execute correctly even on mobile devices
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Page, Title and Header rendered", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oDynamicPageTitle = oDynamicPage.getTitle(),
			oDynamicPageHeader = oDynamicPage.getHeader(),
			oDynamicPageFooter = oDynamicPage.getFooter(),
			$oDynamicPageTitleSnappedWrapper = oDynamicPageTitle.$('snapped-wrapper'),
			$oDynamicPageTitleExpandedWrapper = oDynamicPageTitle.$('expand-wrapper'),
			$oDynamicPageHeader = oDynamicPageHeader.$(),
			$oCollapseButton = oDynamicPageHeader.getAggregation("_collapseButton").$(),
			$oExpandButton = oDynamicPageTitle.getAggregation("_expandButton").$();

		assert.ok(oUtil.exists(oDynamicPage), "The DynamicPage has rendered successfully");
		assert.ok(oUtil.exists(oDynamicPageTitle), "The DynamicPage Title has rendered successfully");
		assert.ok(oUtil.exists(oDynamicPageHeader), "The DynamicPage Header has rendered successfully");
		assert.ok(oUtil.exists(oDynamicPageFooter), "The DynamicPage Footer has rendered successfully");
		assert.ok(oUtil.exists(oDynamicPageHeader.getAggregation("_pinButton").$()),
			"The DynamicPage Header Pin Button has rendered successfully");
		assert.equal($oExpandButton.length > 0, true, "The Expand Button is rendered");
		assert.equal($oCollapseButton.length > 0, true, "The Collapse button is rendered");
		assert.equal($oDynamicPageTitleSnappedWrapper.length > 0, true, "The DynamicPage Title snapped content is rendered");
		assert.equal($oDynamicPageTitleExpandedWrapper.length > 0, true, "The DynamicPage Title expanded content is rendered");

		assert.ok($oDynamicPageHeader.hasClass("sapFDynamicPageHeaderWithContent"),
			"The DynamicPage Header is not empty - sapFDynamicPageHeaderWithContent is added");
		assert.ok(!oDynamicPage.$titleArea.hasClass("sapFDynamicPageTitleOnly"),
			"The DynamicPage Header is not empty - sapFDynamicPageTitleOnly is not added");
	});

	QUnit.test("DynamicPage ScrollBar rendered", function (assert) {
		assert.ok(this.oDynamicPage.$("vertSB")[0], "DynamicPage ScrollBar has rendered successfully");
	});

	QUnit.test("BCP: 1870261908 Header title cursor CSS reset is applied", function (assert) {
		// Arrange
		var $MainHeading = this.oDynamicPage.$().find(".sapFDynamicPageTitleMainHeading"),
			$MainContent = this.oDynamicPage.$().find(".sapFDynamicPageTitleMainContent"),
			$MainActions = this.oDynamicPage.$().find(".sapFDynamicPageTitleMainActions");

		/**
		 * Asserts if proper CSS reset for cursor is applied to provided DOM element
		 * @param {object} assert object
		 * @param {object} oDomElement DOM element to be tested
		 */
		function assertCSSReset(assert, oDomElement) {
			assert.strictEqual(window.getComputedStyle(oDomElement).cursor, "default",
				"Proper CSS reset is applied to element");
		}

		// Assert
		assertCSSReset(assert, $MainHeading[0]);
		assertCSSReset(assert, $MainContent[0]);
		assertCSSReset(assert, $MainActions[0]);
	});

	QUnit.module("DynamicPage - Rendering - No Title", {
		beforeEach: function () {
			this.oDynamicPageNoTitle = oFactory.getDynamicPageNoTitle();
			oUtil.renderObject(this.oDynamicPageNoTitle);
		},
		afterEach: function () {
			this.oDynamicPageNoTitle.destroy();
			this.oDynamicPageNoTitle = null;
		}
	});

	QUnit.test("DynamicPage Title not rendered", function (assert) {
		assert.ok(!oUtil.exists(this.oDynamicPageNoTitle.getTitle()), "The DynamicPage Title has not rendered");
		assert.ok(this.oDynamicPageNoTitle.getHeader()._getCollapseButton().$().hasClass("sapUiHidden"), "Header collapse button is hidden");
	});

	QUnit.test("DynamicPage pin button does not toggle collapse arrow visibility", function (assert) {
		var oPinButton = this.oDynamicPageNoTitle.getHeader()._getPinButton();

		// act
		oPinButton.firePress();

		// assert
		assert.ok(this.oDynamicPageNoTitle.getHeader()._getCollapseButton().$().hasClass("sapUiHidden"), "Header collapse button is hidden");
	});

	QUnit.module("DynamicPage - Rendering - Invisible Title", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			this.oDynamicPage.getTitle().setVisible(false);

			this.oDynamicPage.placeAt(TESTS_DOM_CONTAINER);

			Core.applyChanges();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Invisible Title", function (assert) {
		assert.ok(this.oDynamicPage.getHeader()._getCollapseButton().$().hasClass("sapUiHidden"), "Header collapse button is hidden");
	});

	QUnit.module("DynamicPage - Rendering - Invisible Header", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			this.oDynamicPage.getHeader().setVisible(false);

			this.oDynamicPage.placeAt(TESTS_DOM_CONTAINER);

			Core.applyChanges();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Invisible Header", function (assert) {
		assert.ok(this.oDynamicPage.getTitle()._getExpandButton().$().hasClass("sapUiHidden"), "Title expand button is hidden");
	});

	QUnit.module("DynamicPage - Rendering - Expand/collapse buttons", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			this.oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("Removed Header content", function (assert) {
		this.oDynamicPage.getHeader().removeAllContent();

		assert.ok(this.oDynamicPage.getTitle()._getExpandButton().$().hasClass("sapUiHidden"), "Title expand button is hidden");
		assert.ok(this.oDynamicPage.getHeader()._getCollapseButton().$().hasClass("sapUiHidden"), "Header collapse button is hidden");
	});

	QUnit.module("DynamicPage - Rendering - Header State Preserved On Scroll", {
		beforeEach: function () {
			this.oDynamicPageWithPreserveHeaderStateOnScroll = oFactory.getDynamicPageWithPreserveHeaderOnScroll();
			oUtil.renderObject(this.oDynamicPageWithPreserveHeaderStateOnScroll);
		},
		afterEach: function () {
			this.oDynamicPageWithPreserveHeaderStateOnScroll.destroy();
			this.oDynamicPageWithPreserveHeaderStateOnScroll = null;
		}
	});

	QUnit.test("DynamicPage Header rendered within Header Wrapper", function (assert) {
		var $headerWrapper = this.oDynamicPageWithPreserveHeaderStateOnScroll.$("header"),
			sHeaderId = this.oDynamicPageWithPreserveHeaderStateOnScroll.getHeader().getId();

		assert.equal($headerWrapper.find("#" + sHeaderId).length, 1, "The Header is in the Header Wrapper");
	});

	QUnit.test("DynamicPage Pin button is hidden", function (assert) {
		var $pinButton = this.oDynamicPageWithPreserveHeaderStateOnScroll.getHeader().getAggregation("_pinButton").$();

		// assert
		assert.ok($pinButton.hasClass("sapUiHidden"), "The DynamicPage Header Pin Button not rendered");

		// act
		this.oDynamicPageWithPreserveHeaderStateOnScroll._snapHeader();
		this.oDynamicPageWithPreserveHeaderStateOnScroll._expandHeader();

		// assert
		assert.ok($pinButton.hasClass("sapUiHidden"), "The DynamicPage Header Pin Button is hidden");
	});

	QUnit.module("DynamicPage - Rendering - No Header", {
		beforeEach: function () {
			this.oDynamicPageNoHeader = oFactory.getDynamicPageNoHeader();
			oUtil.renderObject(this.oDynamicPageNoHeader);
		},
		afterEach: function () {
			this.oDynamicPageNoHeader.destroy();
			this.oDynamicPageNoHeader = null;
		}
	});

	QUnit.test("DynamicPage Header not rendered", function (assert) {
		var oTitle = this.oDynamicPageNoHeader.getTitle();

		assert.ok(!oUtil.exists(this.oDynamicPageNoHeader.getHeader()), "The DynamicPage Header does not exist.");
		assert.ok(oTitle._getExpandButton().$().hasClass("sapUiHidden"), "Title expand button is hidden");
		assert.equal(oTitle._getFocusSpan().$().attr("tabindex"), undefined, "Focus span should be excluded from the tab chain");
		assert.notOk(this.oDynamicPageNoHeader.$().hasClass("sapFDynamicPageTitleClickEnabled"), "No DynamicPage Header - sapFDynamicPageTitleClickEnabled not added");

		this.oDynamicPageNoHeader.setToggleHeaderOnTitleClick(true);
		assert.equal(oTitle._getFocusSpan().$().attr("tabindex"), undefined, "Focus span should still be excluded from the tab chain");
		assert.notOk(this.oDynamicPageNoHeader.$().hasClass("sapFDynamicPageTitleClickEnabled"), "No DynamicPage Header - sapFDynamicPageTitleClickEnabled not added");
	});

	QUnit.module("DynamicPage - Rendering - Empty Header", {
		beforeEach: function () {
			this.oDynamicPageWithEmptyHeader = oFactory.getDynamicPageWithEmptyHeader();
			oUtil.renderObject(this.oDynamicPageWithEmptyHeader);
		},
		afterEach: function () {
			this.oDynamicPageWithEmptyHeader.destroy();
			this.oDynamicPageWithEmptyHeader = null;
		}
	});

	QUnit.test("DynamicPage Header style classes", function (assert) {
		var oDynamicPage = this.oDynamicPageWithEmptyHeader,
			$oDynamicPageHeader = oDynamicPage.$();

		assert.ok(!$oDynamicPageHeader.hasClass("sapFDynamicPageHeaderWithContent"),
			"The DynamicPage Header is empty - sapFDynamicPageHeaderWithContent not added");
		assert.ok(!$oDynamicPageHeader.hasClass("sapFDynamicPageHeaderPinnable"),
			"The DynamicPage Header is pinnable, but it`s empty - sapFDynamicPageHeaderPinnable not added");
		assert.ok(oDynamicPage.$titleArea.hasClass("sapFDynamicPageTitleOnly"),
			"The DynamicPage Header is empty and has Title only - sapFDynamicPageTitleOnly is added");
	});

	QUnit.module("DynamicPage - Rendering - No Title and No Header", {
		beforeEach: function () {
			this.oDynamicPageNoTitleAndHeader = oFactory.getDynamicPageNoTitleAndHeader();
			oUtil.renderObject(this.oDynamicPageNoTitleAndHeader);
		},
		afterEach: function () {
			this.oDynamicPageNoTitleAndHeader.destroy();
			this.oDynamicPageNoTitleAndHeader = null;
		}
	});

	QUnit.test("DynamicPage Title and Header not rendered", function (assert) {
		assert.ok(!oUtil.exists(this.oDynamicPageNoTitleAndHeader.getTitle()), "The DynamicPage Title has not rendered");
		assert.ok(!oUtil.exists(this.oDynamicPageNoTitleAndHeader.getHeader()), "The DynamicPage Header has not rendered ");
	});


	QUnit.module("DynamicPage - Rendering - Title", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithExpandSnapContent();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});
	QUnit.test("DynamicPage Title - Expanded/Snapped Content initial visibility", function (assert) {
		var $titleSnap = this.oDynamicPage.getTitle().$("snapped-wrapper"),
			$titleExpand = this.oDynamicPage.getTitle().$("expand-wrapper");

		assert.equal($titleSnap.hasClass("sapUiHidden"), true, "Snapped Content is not visible initially");
		assert.equal($titleExpand.hasClass("sapUiHidden"), false, "Expanded Content is visible initially");
	});

	QUnit.test("DynamicPage Title - Content", function (assert) {
		var oTitle = this.oDynamicPage.getTitle();

		// Assert: DynamicPageTitle content aggregation is not empty
		assert.equal(oTitle.$().hasClass("sapFDynamicPageTitleWithoutContent"), false,
			"The css class hasn`t been added as the content aggregation is not empty");

		// Act: remove the content
		oTitle.removeAllContent();
		Core.applyChanges();

		// Assert: DynamicPageTitle content aggregation is empty
		assert.equal(oTitle.$("main").hasClass("sapFDynamicPageTitleMainNoContent"), true,
			"The css class has been added as the content aggregation is empty");
	});

	QUnit.module("DynamicPage - Rendering - Title with Breadcrumbs", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithBreadCrumbs();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage - Rendering - Title with Breadcrumbs", function (assert) {
		var oTitle = this.oDynamicPage.getTitle(),
			oBreadcrumbs = oTitle.getAggregation("breadcrumbs"),
			$oTitleTopDOM = oTitle.$("top");

		// Assert: DynamicPageTitle content aggregation is not empty
		assert.equal($oTitleTopDOM.length > 0, true, "sapFDynamicPageTitleTop element is rendered");
		assert.equal($oTitleTopDOM.hasClass("sapFDynamicPageTitleTop"), true, "sapFDynamicPageTitleTop class is added");
		assert.equal(oBreadcrumbs.$().length > 0, true, "Title Breadcrumbs DOM is rendered");
		assert.equal($oTitleTopDOM.hasClass("sapFDynamicPageTitleTopBreadCrumbsOnly"), true, "sapFDynamicPageTitleNavActionsOnly class is added");

		// Act: remove breadCrumbs aggregation
		oTitle.setBreadcrumbs(null);
		Core.applyChanges();

		// Assert: DynamicPageTitle content aggregation is empty
		assert.equal(oTitle.$("top").length > 0, false, "Title top DOM element is not rendered");
	});

	QUnit.module("DynamicPage - Rendering - Title with navigationActions", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithNavigationActions();
			this.oDynamicPageTitle = this.oDynamicPage.getTitle();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
			this.oDynamicPageTitle = null;
		}
	});

	QUnit.test("DOM elements and classes", function (assert) {
		var oTitle = this.oDynamicPageTitle,
			$oTitleTopDOM = oTitle.$("top"),
			$oTitleTopNavigationAreaDOM = oTitle.$("topNavigationArea"),
			$oTitleMainNavigationAreaDOM = oTitle.$("mainNavigationArea");

		assert.equal($oTitleTopDOM.length > 0, true,
			"sapFDynamicPageTitleTop element is rendered.");
		assert.equal($oTitleTopDOM.hasClass("sapFDynamicPageTitleTop"), true,
			"sapFDynamicPageTitleTop class is added.");
		assert.equal($oTitleTopNavigationAreaDOM.length > 0, true,
			"top navigation area element is rendered.");
		assert.equal($oTitleMainNavigationAreaDOM.length > 0, true,
			"main navigation area element is rendered.");
		assert.equal($oTitleTopNavigationAreaDOM.hasClass("sapFDynamicPageTitleTopRight"), true,
			"sapFDynamicPageTitleTopRight class is add.");
		assert.equal($oTitleMainNavigationAreaDOM.hasClass("sapFDynamicPageTitleMainNavigationAreaInner"), true,
			"sapFDynamicPageTitleMainNavigationAreaInner class is added.");
		assert.equal($oTitleTopDOM.hasClass("sapFDynamicPageTitleTopNavActionsOnly"), true,
			"sapFDynamicPageTitleNavActionsOnly class is added.");
	});

	QUnit.test("Separator visibility on resize", function (assert) {
		var oTitle = this.oDynamicPageTitle,
			oTitlePressSpy = this.spy(sap.f.DynamicPageTitle.prototype, "_toggleNavigationActionsPlacement"),
			iTitleLargeWidth = 1400,
			iTitleSmallWidth = 900,
			oSeparator = oTitle.getAggregation("_navActionsToolbarSeparator"),
			$oSeparator = oSeparator.$();

		// Arrange
		// Ensure the Title is bigger than 1280px, then navigationAction are in the Title`s main area.
		oTitle._onResize(iTitleLargeWidth);

		// Assert
		// Separator should be rendered.
		// Separator should not be visible as there are no actions added.
		assert.equal($oSeparator.length > 0, true, "Toolbar Separator element is rendered.");
		assert.equal($oSeparator.hasClass("sapUiHidden"), true, "Toolbar Separator element is not visible.");

		// Act: Add an action.
		oTitle.addAction(oFactory.getAction());

		// Assert: Separator should be visible as there are both actions and navigationActions
		assert.equal(oTitle._shouldShowSeparator(), true,
			"Toolbar Separator should be visible, there are actions and navigationActions.");
		assert.equal($oSeparator.hasClass("sapUiHidden"), false, "Toolbar Separator element is visible.");

		// Act: Simulate shrinking of the Page`s width to less than 1280px.
		oTitlePressSpy.reset();
		oTitle._onResize(iTitleSmallWidth);

		// Assert
		// Title`s width is less than 1280px,
		// the navigationActions are in the Title`s top area and the separator should not be visible.
		assert.ok(oTitlePressSpy.calledOnce, "Actions layout is toggled.");
		assert.equal(oTitle._shouldShowSeparator(), false, "Toolbar Separator should not be visible.");
		assert.equal($oSeparator.hasClass("sapUiHidden"), true,
			"Toolbar Separator element is not visible, when the navigationActions are in top area.");

		// Act: Remove all actions.
		oTitlePressSpy.reset();
		oTitle.removeAllNavigationActions();
		oTitle._onResize(iTitleLargeWidth);

		// Assert: if there are no navigation actions -> no toggling
		assert.ok(!oTitlePressSpy.calledOnce, "Actions layout is not toggled.");
	});

	QUnit.test("Separator visibility upon actions and navigation actions change", function (assert) {
		var oTitle = this.oDynamicPageTitle,
			oAction1 = oFactory.getAction(),
			oAction2 = oFactory.getAction(),
			oAction3 = oFactory.getAction(),
			oSeparator = oTitle.getAggregation("_navActionsToolbarSeparator"),
			$oSeparator = oSeparator.$(),
			iTitleLargeWidth = 1400;

		// Arrange:
		oTitle.addAction(oAction1);
		oTitle.addAction(oAction2);
		// Ensure the Title is bigger than 1280px, then navigationAction are in the Title`s main area.
		oTitle._onResize(iTitleLargeWidth);

		// Assert
		assert.equal(oTitle._shouldShowSeparator(), true,
			"Toolbar Separator should be visible, there are both actions and navigationActions.");

		// Act: hide both actions (oAction1 and oAction2)
		oAction1.setVisible(false);
		oAction2.setVisible(false);

		// Assert
		assert.equal(oTitle._shouldShowSeparator(), false,
			"Toolbar Separator should not be visible, there are no visible actions.");
		assert.equal($oSeparator.hasClass("sapUiHidden"), true, "Toolbar Separator element is not visible.");


		// Act: show one of the action (oAction1)
		oAction1.setVisible(true);
		// Ensure the Title is bigger than 1280px, then navigationAction are in the Title`s main area.
		oTitle._onResize(iTitleLargeWidth);

		// Assert
		assert.equal(oTitle._shouldShowSeparator(), true,
			"Toolbar Separator should be visible, there are both actions (although 1) and navigationActions.");
		assert.equal($oSeparator.hasClass("sapUiHidden"), false, "Toolbar Separator element is visible.");


		// Act: remove all navigationActions
		oTitle.removeAllNavigationActions();

		// Assert
		assert.equal(oTitle._shouldShowSeparator(), false,
			"Toolbar Separator should not be visible, there are actions, but no navigationActions.");
		assert.equal($oSeparator.hasClass("sapUiHidden"), true, "Toolbar Separator element is not visible.");


		// Act: add a navigationAction (oAction3)
		oTitle.addNavigationAction(oAction3);
		// Ensure the Title is bigger than 1280px, then navigationAction are in the Title`s main area.
		oTitle._onResize(iTitleLargeWidth);

		// Assert
		assert.equal(oTitle._shouldShowSeparator(), true,
			"Toolbar Separator should be visible, there are one action and one navigationAction.");
		assert.equal($oSeparator.hasClass("sapUiHidden"), false, "Toolbar Separator element is visible.");


		// Act: hide the navigationAction (oAction3)
		oAction3.setVisible(false);

		// Assert
		assert.equal(oTitle._shouldShowSeparator(), false,
			"Toolbar Separator should be visible, there are one visible action, but no visible navigationAction.");
		assert.equal($oSeparator.hasClass("sapUiHidden"), true, "Toolbar Separator element is not visible.");

		// Clean
		oAction1.destroy();
		oAction2.destroy();
		oAction3.destroy();
	});

	QUnit.module("DynamicPage - Rendering - Title with navigationActions and breadcrumbs", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithNavigationActionsAndBreadcrumbs();
			this.oDynamicPageTitle = this.oDynamicPage.getTitle();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
			this.oDynamicPageTitle = null;
		}
	});

	QUnit.test("Top area visibility upon breadcrumbs change", function (assert) {
		var oTitle = this.oDynamicPageTitle,
			oBreadcrumbs = oTitle.getBreadcrumbs(),
			$TitleTopArea = oTitle.$("top"),
			$TitleMainArea = oTitle.$("main"),
			iTitleLargeWidth = 1400,
			iTitleSmallWidth = 900;

		// Ensure the Title is bigger than 1280px, then navigationAction are in the Title`s main area.
		oTitle._onResize(iTitleLargeWidth);

		// Assert
		assert.equal($TitleTopArea.hasClass("sapUiHidden"), false, "Large screen: Top area should be visible when there are visible breadcrumbs.");
		assert.equal($TitleMainArea.has(".sapFDynamicPageTitleActionsBar").length, 1, "Large screen: Navigation actions should be in the main title area");

		// Act
		oBreadcrumbs.setVisible(false);

		// Assert
		assert.equal($TitleTopArea.hasClass("sapUiHidden"), true, "Large screen: Top area should not be visible when there are no visible breadcrumbs.");

		// Act
		oTitle._onResize(iTitleSmallWidth);

		// Assert
		assert.equal($TitleTopArea.hasClass("sapUiHidden"), true,
				"Small screen: Top area should not be visible when there are no visible breadcrumbs and actions");
		assert.equal($TitleMainArea.has(".sapFDynamicPageTitleActionsBar").length, 1, "Small screen: Navigation actions should be in the main title area");

		// Act
		oBreadcrumbs.setVisible(true);

		// Assert
		assert.equal($TitleTopArea.has(".sapFDynamicPageTitleActionsBar").length, 1,
				"Small screen: Navigation actions should be in the top title area when there are visible breadcrumbs");
	});

	QUnit.test("Top area visibility upon navigation actions aggregation change", function (assert) {
		var oTitle = this.oDynamicPageTitle,
			$TitleTopArea = oTitle.$("top"),
			iTitleSmallWidth = 900;

		// Ensure the Title is smaller than 1280px, then navigationAction are in the Title`s top area.
		oTitle._onResize(iTitleSmallWidth);

		// Act
		oTitle.setBreadcrumbs(null);
		oTitle.removeAllNavigationActions();

		// Assert
		assert.equal($TitleTopArea.hasClass("sapUiHidden"), true, "Top area should not be visible when all aggregations are removed");
	});

	QUnit.module("DynamicPage - Rendering - Title with navigationActions and actions", {
		beforeEach: function () {
			this.oDynamicPageStandardAndNavigationActions = oFactory.getDynamicPageWithStandardAndNavigationActions();
			this.oDynamicPageTitle = this.oDynamicPageStandardAndNavigationActions.getTitle();
			oUtil.renderObject(this.oDynamicPageStandardAndNavigationActions);
		},
		afterEach: function () {
			this.oDynamicPageStandardAndNavigationActions.destroy();
			this.oDynamicPageStandardAndNavigationActions = null;
			this.oDynamicPageTitle = null;
		}
	});

	QUnit.test("Top area visibility upon navigation actions visibility change", function (assert) {
		var oTitle = this.oDynamicPageStandardAndNavigationActions.getTitle(),
			$TitleTopArea = oTitle.$("top"),
			iTitleSmallWidth = 900;

		// Ensure the Title is smaller than 1280px, then navigationAction are in the Title`s top area.
		oTitle._onResize(iTitleSmallWidth);

		// Assert
		assert.equal($TitleTopArea.hasClass("sapUiHidden"), false,
		"Top area should be visible when there is at least one visible navigation action");

		// Act (1) - hide all navigation actions
		oTitle.getNavigationActions().forEach(function(oAction) {
			oAction.setVisible(false);
		});

		// Assert
		assert.equal($TitleTopArea.hasClass("sapUiHidden"), true,
			"Top area should not be visible when there are no visible navigation actions");

		// Act (2) - show random navigation action
		oTitle.getNavigationActions()[0].setVisible(true);

		// Assert
		assert.equal($TitleTopArea.hasClass("sapUiHidden"), false,
			"Top area should be visible when there is at least one visible navigation action");
	});

	QUnit.module("DynamicPage - Rendering - Title heading, snappedHeading and expandedHeading");

	QUnit.test("No heading at all", function (assert) {
		var oDynamicPageTitle = new DynamicPageTitle({}),
			oDynamicPage = new DynamicPage({
				title: oDynamicPageTitle,
				header: oFactory.getDynamicPageHeader(),
				content: oFactory.getContent(100),
				footer: oFactory.getFooter()
			});
		oUtil.renderObject(oDynamicPage);

		var $heading = oDynamicPageTitle.$("left-inner").find(".sapFDynamicPageTitleMainHeadingInner");
		assert.ok($heading.length === 1, "Heading area is rendered");
		assert.ok($heading.children().length === 0, "Heading area is empty");

		oDynamicPage.destroy();
	});

	QUnit.test("Only heading given", function (assert) {
		var oTitle = oFactory.getTitle(),
			oDynamicPageTitle = new DynamicPageTitle({
				heading: oTitle
			}),
			oDynamicPage = new DynamicPage({
				title: oDynamicPageTitle,
				header: oFactory.getDynamicPageHeader(),
				content: oFactory.getContent(100),
				footer: oFactory.getFooter()
			});
		oUtil.renderObject(oDynamicPage);

		var $heading = oDynamicPageTitle.$("left-inner").find(".sapFDynamicPageTitleMainHeadingInner");
		assert.ok($heading.length === 1, "Heading area is rendered");
		assert.ok($heading.children().length === 1, "Heading area has one child rendered");
		assert.ok($heading.children()[0] === oTitle.getDomRef(), "This child is the title");

		oDynamicPage.destroy();
	});

	QUnit.test("heading in combination with snappedHeading/expandedHeading given", function (assert) {
		var oTitle = oFactory.getTitle(),
			oDynamicPageTitle = new DynamicPageTitle({
				heading: oTitle,
				expandedHeading: oFactory.getTitle(),
				snappedHeading: oFactory.getTitle()
			}),
			oDynamicPage = new DynamicPage({
				title: oDynamicPageTitle,
				header: oFactory.getDynamicPageHeader(),
				content: oFactory.getContent(100),
				footer: oFactory.getFooter()
			}),
			sAriaLabelledBy = oDynamicPageTitle.getHeading().getId();

		oUtil.renderObject(oDynamicPage);

		var $heading = oDynamicPageTitle.$("left-inner").find(".sapFDynamicPageTitleMainHeadingInner");
		assert.ok($heading.length === 1, "Heading area is rendered");
		assert.ok($heading.children().length === 1, "Heading area has one child rendered");
		assert.ok($heading.children()[0] === oTitle.getDomRef(), "This child is the title");
		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "true", sAriaLabelledBy, "Heading aria-labelledby references should be set");

		oDynamicPage.destroy();
	});

	QUnit.test("Only snappedHeading given", function (assert) {
		var oDynamicPageTitle = new DynamicPageTitle({
				snappedHeading: oFactory.getTitle()
			}),
			oDynamicPage = new DynamicPage({
				title: oDynamicPageTitle,
				header: oFactory.getDynamicPageHeader(),
				content: oFactory.getContent(100),
				footer: oFactory.getFooter()
			});
		oUtil.renderObject(oDynamicPage);

		assert.ok(oDynamicPageTitle.$("snapped-heading-wrapper").length === 1, "Snapped heading wrapper is rendered");
		assert.ok(oDynamicPageTitle.$("snapped-heading-wrapper").hasClass("sapUiHidden"), "Snapped heading wrapper is hidden");

		oDynamicPage.destroy();
	});

	QUnit.test("Only expandedHeading given", function (assert) {
		var oDynamicPageTitle = new DynamicPageTitle({
				expandedHeading: oFactory.getTitle()
			}),
			oDynamicPage = new DynamicPage({
				title: oDynamicPageTitle,
				header: oFactory.getDynamicPageHeader(),
				content: oFactory.getContent(100),
				footer: oFactory.getFooter()
			});
		oUtil.renderObject(oDynamicPage);

		assert.ok(oDynamicPageTitle.$("expand-heading-wrapper").length === 1, "Expanded heading wrapper is rendered");
		assert.ok(!oDynamicPageTitle.$("expand-heading-wrapper").hasClass("sapUiHidden"), "Expanded heading wrapper is visible");

		oDynamicPage.destroy();
	});

	QUnit.test("Both snappedHeading and expandedHeading given", function (assert) {
		var oDynamicPageTitle = new DynamicPageTitle({
				snappedHeading: oFactory.getTitle(),
				expandedHeading: oFactory.getTitle()
			}),
			oDynamicPage = new DynamicPage({
				title: oDynamicPageTitle,
				header: oFactory.getDynamicPageHeader(),
				content: oFactory.getContent(100),
				footer: oFactory.getFooter()
			}),
			sAriaLabelledByExpanded = oDynamicPageTitle.getExpandedHeading().getId(),
			sAriaLabelledBySnapped = oDynamicPageTitle.getSnappedHeading().getId();

		oUtil.renderObject(oDynamicPage);

		assert.ok(oDynamicPageTitle.$("snapped-heading-wrapper").length === 1, "Snapped heading wrapper is rendered");
		assert.ok(oDynamicPageTitle.$("snapped-heading-wrapper").hasClass("sapUiHidden"), "Snapped heading wrapper is hidden");

		assert.ok(oDynamicPageTitle.$("expand-heading-wrapper").length === 1, "Expanded heading wrapper is rendered");
		assert.ok(!oDynamicPageTitle.$("expand-heading-wrapper").hasClass("sapUiHidden"), "Expanded heading wrapper is visible");

		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "true", sAriaLabelledByExpanded, "Expanded aria-labelledby references should be set");

		oDynamicPage.setHeaderExpanded(false);

		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "false", sAriaLabelledBySnapped, "Snapped aria-labelledby references should be set");

		oDynamicPage.destroy();
	});

	QUnit.module("DynamicPage - Rendering - Footer Visibility", {
		beforeEach: function () {
			sinon.config.useFakeTimers = true;
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			sinon.config.useFakeTimers = false;
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Footer visibility", function (assert) {
		var $footerWrapper = this.oDynamicPage.$("footerWrapper"),
			oFooter = this.oDynamicPage.getFooter(),
			$footer = oFooter.$();

		assert.equal($footerWrapper.hasClass("sapUiHidden"), false, "Footer is visible initially");

		this.oDynamicPage.setShowFooter(false);
		this.clock.tick(1000);

		assert.equal(this.oDynamicPage._iFooterAnimationTimeout > 0, true, "Footer animation timeout has been set");
		assert.equal($footerWrapper.hasClass("sapUiHidden"), true, "Footer is not visible");
		assert.equal($footer.hasClass("sapFDynamicPageActualFooterControlHide"), true, "Footer is not visible");

		this.oDynamicPage.setShowFooter(true);
		this.clock.tick(1000);

		assert.equal($footerWrapper.hasClass("sapUiHidden"), false, "Footer is visible again");
		assert.equal(this.oDynamicPage._iFooterAnimationTimeout, null, "Footer animation timeout has been cleared");
	});

	/* --------------------------- DynamicPage Mobile Rendering ---------------------------------- */
	QUnit.module("DynamicPage - Rendering - Mobile", {
		beforeEach: function () {
			sinon.config.useFakeTimers = true;
			oUtil.toMobileMode();
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			sinon.config.useFakeTimers = false;
			oUtil.toDesktopMode();
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Pin button not rendered on mobile", function (assert) {
		assert.ok(!this.oDynamicPage.getHeader().getAggregation("_pinButton").$()[0],
			"The DynamicPage Header Pin Button not rendered");
	});

	QUnit.test("DynamicPage ScrollBar not rendered on mobile", function (assert) {
		assert.ok(!this.oDynamicPage.$("vertSB")[0], "DynamicPage ScrollBar not rendered");
	});

	QUnit.test("DynamicPage Header on tablet with header height bigger than 60% of DP height override 'preserveHeaderStateOnScroll' property", function (assert) {
		var oDynamicPage = this.oDynamicPage;
		oDynamicPage.setPreserveHeaderStateOnScroll(true);

		oUtil.renderObject(this.oDynamicPage);
		Core.applyChanges();
		this.clock.tick();

		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(300);
		oDynamicPage.getHeader().$().height(300);
		oDynamicPage._headerBiggerThanAllowedHeight = false;

		assert.ok(oDynamicPage._shouldOverridePreserveHeaderStateOnScroll(), "preserveHeaderStateOnScroll should be overridden with 60% or bigger height");

		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(200);
		oDynamicPage.getHeader().$().height(200);
		oDynamicPage._headerBiggerThanAllowedHeight = false;

		assert.ok(!oDynamicPage._shouldOverridePreserveHeaderStateOnScroll(), "preserveHeaderStateOnScroll should NOT be overridden with less than 60% height");
	});

	/* --------------------------- DynamicPage Tablet Rendering ---------------------------------- */

	QUnit.module("DynamicPage - Rendering - Tablet", {
		beforeEach: function () {
			sinon.config.useFakeTimers = true;
			oUtil.toTabletMode();
			this.oDynamicPage = oFactory.getDynamicPage();
		},
		afterEach: function () {
			sinon.config.useFakeTimers = false;
			oUtil.toDesktopMode();
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Header on tablet with header height bigger than 60% of DP height override 'preserveHeaderStateOnScroll' property", function (assert) {
		var oDynamicPage = this.oDynamicPage;
		oDynamicPage.setPreserveHeaderStateOnScroll(true);

		oUtil.renderObject(this.oDynamicPage);
		Core.applyChanges();
		this.clock.tick();

		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(300);
		oDynamicPage.getHeader().$().height(300);
		oDynamicPage._headerBiggerThanAllowedHeight = false;

		assert.ok(oDynamicPage._shouldOverridePreserveHeaderStateOnScroll(), "preserveHeaderStateOnScroll should be overridden with 60% or bigger height");

		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(200);
		oDynamicPage.getHeader().$().height(200);
		oDynamicPage._headerBiggerThanAllowedHeight = false;

		assert.ok(!oDynamicPage._shouldOverridePreserveHeaderStateOnScroll(), "preserveHeaderStateOnScroll should NOT be overridden with less than 60% height");
	});

	/* --------------------------- DynamicPage Events and Handlers ---------------------------------- */
	QUnit.module("DynamicPage Events, Handlers", {
		beforeEach: function () {
			sinon.config.useFakeTimers = true;
			this.oDynamicPage = oFactory.getDynamicPageWithBigContent();
		},
		afterEach: function () {
			sinon.config.useFakeTimers = false;
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage On Title Press: title press handler should be called", function (assert) {
		var oTitlePressSpy = this.spy(sap.f.DynamicPage.prototype, "_titleExpandCollapseWhenAllowed"),
			oTitle = this.oDynamicPage.getTitle();

		oUtil.renderObject(this.oDynamicPage);
		oTitle.fireEvent("_titlePress");

		assert.ok(oTitlePressSpy.calledOnce, "Title Pin Press Handler is called");
	});

	QUnit.test("DynamicPage On Title Press: stateChange event is fired", function (assert) {
		var oStateChangeListenerSpy = sinon.spy(),
			oTitle = this.oDynamicPage.getTitle();

		this.oDynamicPage.getTitle().attachEvent("stateChange", oStateChangeListenerSpy);

		// Arrange
		oUtil.renderObject(this.oDynamicPage);
		oTitle.fireEvent("_titlePress");

		assert.ok(oStateChangeListenerSpy.calledOnce, "stateChange event was fired once when title was pressed");
	});

	QUnit.test("DynamicPage On Pin Button Press", function (assert) {
		var oPinPressSpy = this.spy(sap.f.DynamicPage.prototype, "_onPinUnpinButtonPress"),
			oPinButton = this.oDynamicPage.getHeader()._getPinButton();

		oUtil.renderObject(this.oDynamicPage);
		oPinButton.firePress();

		assert.ok(oPinPressSpy.calledOnce, "Title Pin Press Handler is called");
	});

	QUnit.test("DynamicPage On Collapse Button Press", function (assert) {
		var oCollapseButtonPressSpy = this.spy(sap.f.DynamicPage.prototype, "_onCollapseHeaderVisualIndicatorPress"),
			oCollapseButtonPressSpy2 = this.spy(sap.f.DynamicPageHeader.prototype, "_onCollapseButtonPress"),
			oCollapseButton = this.oDynamicPage.getHeader()._getCollapseButton();

		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Arrange
		oCollapseButton.firePress();

		// Assert
		assert.ok(oCollapseButtonPressSpy.calledOnce, "DPage: Collapse Header Visual Indicator Press Handler is called");
		assert.ok(oCollapseButtonPressSpy2.calledOnce, "DPageHeader: Collapse Header Visual Indicator Press Handler is called");
	});

	QUnit.test("DynamicPage On Expand Button Press stateChange event is fired", function (assert) {
		var oStateChangeListenerSpy = sinon.spy(),
			oCollapseButton = this.oDynamicPage.getHeader()._getCollapseButton();

		this.oDynamicPage.getTitle().attachEvent("stateChange", oStateChangeListenerSpy);

		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Act
		oCollapseButton.firePress();

		assert.ok(oStateChangeListenerSpy.calledOnce, "stateChange event was fired once when expand button was pressed");
	});

	QUnit.test("DynamicPage On Snap Header when not enough scrollHeight to snap with scroll and scrollTop > 0", function (assert) {
		/* TODO remove after 1.62 version */
		var sHeight = this.oDynamicPage._bMSBrowser  ? "300px" : "400px",
			aAcceptableValues = Device.browser.edge ? [0, 1] : [0]; // due to different MS browsers calculation

		this.oDynamicPage.setContent(oFactory.getContent(1)); // not enough content to snap on scroll
		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Arrange state:
		this.oDynamicPage.$().height(sHeight); // ensure not enough scrollHeight to snap with scrolling
		this.oDynamicPage.$().width("300px");
		this.oDynamicPage._setScrollPosition(10); // scrollTop > 0

		// Assert state arranged as expected:
		assert.strictEqual(this.oDynamicPage.getHeaderExpanded(), true, "header is expanded");
		assert.ok(!this.oDynamicPage._canSnapHeaderOnScroll(), "not enough scrollHeight to snap with scroll");
		assert.equal(this.oDynamicPage._needsVerticalScrollBar(), true, "enough scrollHeight to scroll");

		// Act: toggle title to snap the header
		this.oDynamicPage._titleExpandCollapseWhenAllowed();

		// Assert context changed as expected:
		assert.strictEqual(this.oDynamicPage.getHeaderExpanded(), false, "header is snapped");
		assert.ok(!this.oDynamicPage._needsVerticalScrollBar(), "not enough scrollHeight to scroll");//because header was hidden during snap
		/* TODO remove after 1.62 version */
		assert.ok(aAcceptableValues.indexOf(this.oDynamicPage._getScrollPosition()) !== -1,
			"Page is scrolled to top"); // because no more scrolled-out content

		// explicitly call the onscroll listener (to save a timeout in the test):
		this.oDynamicPage._toggleHeaderOnScroll({target: {scrollTop: 0}});

		// Assert
		assert.strictEqual(this.oDynamicPage.getHeaderExpanded(), false, "header is still snapped");
	});

	QUnit.test("DynamicPage On Collapse Button MouseOver", function (assert) {
		var oCollapseButtonMouseOverSpy = this.spy(sap.f.DynamicPage.prototype, "_onVisualIndicatorMouseOver"),
			oCollapseButtonMouseOverSpy2 = this.spy(sap.f.DynamicPageHeader.prototype, "_onCollapseButtonMouseOver"),
			oCollapseButton = this.oDynamicPage.getHeader()._getCollapseButton(),
			$oDynamicPage;

		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Act
		oCollapseButton.$().trigger("mouseover");
		$oDynamicPage = this.oDynamicPage.$();

		// Assert
		assert.ok(oCollapseButtonMouseOverSpy.calledOnce, "DPage: Collapse Header Visual Indicator MouseOver Handler is called");
		assert.ok(oCollapseButtonMouseOverSpy2.calledOnce, "DPageHeader: Collapse Header Visual Indicator MouseOver Handler is called");
		assert.ok($oDynamicPage.hasClass("sapFDynamicPageTitleForceHovered"), "DPageTitle hover state applied");
	});

	QUnit.test("DynamicPage On Collapse Button MouseOut", function (assert) {
		var oCollapseButtonMouseOutSpy = this.spy(sap.f.DynamicPage.prototype, "_onVisualIndicatorMouseOut"),
			oCollapseButtonMouseOutSpy2 = this.spy(sap.f.DynamicPageHeader.prototype, "_onCollapseButtonMouseOut"),
			oCollapseButton = this.oDynamicPage.getHeader()._getCollapseButton(),
			$oDynamicPage;

		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Act
		oCollapseButton.$().trigger("mouseout");
		$oDynamicPage = this.oDynamicPage.$();

		// Assert
		assert.ok(oCollapseButtonMouseOutSpy.calledOnce, "DP: Collapse Header Visual Indicator MouseOut Handler is called");
		assert.ok(oCollapseButtonMouseOutSpy2.calledOnce, "DPHeader: Collapse Header Visual Indicator MouseOut Handler is called");
		assert.ok(!$oDynamicPage.hasClass("sapFDynamicPageTitleForceHovered"), "DPageTitle hover state removed");
	});

	QUnit.test("DynamicPage On Expand Button Press", function (assert) {
		var oExpandButtonPressSpy = this.spy(sap.f.DynamicPage.prototype, "_onExpandHeaderVisualIndicatorPress"),
			oExpandButtonPressSpy2 = this.spy(sap.f.DynamicPageTitle.prototype, "_onExpandButtonPress"),
			oExpandButton = this.oDynamicPage.getTitle()._getExpandButton();

		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Act
		oExpandButton.firePress();

		assert.ok(oExpandButtonPressSpy.calledOnce, "DPage: Expand Header Visual Indicator Press Handler is called");
		assert.ok(oExpandButtonPressSpy2.calledOnce, "DPageTitle: Expand Header Visual Indicator Press Handler is called");
	});

	QUnit.test("DynamicPage On Expand Button Press stateChange event is fired", function (assert) {
		var oStateChangeListenerSpy = sinon.spy(),
			oExpandButton = this.oDynamicPage.getTitle()._getExpandButton();

		this.oDynamicPage.getTitle().attachEvent("stateChange", oStateChangeListenerSpy);

		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Act
		oExpandButton.firePress();

		assert.ok(oStateChangeListenerSpy.calledOnce, "stateChange event was fired once when expand button was pressed");
	});

	QUnit.test("DynamicPage Title MouseOver", function (assert) {
		var oTitleMouseOverSpy = this.spy(sap.f.DynamicPage.prototype, "_onTitleMouseOver"),
			oTitleMouseOverSpy2 = this.spy(sap.f.DynamicPageTitle.prototype, "onmouseover"),
			oTitle = this.oDynamicPage.getTitle(),
			$oDynamicPage;

		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Act
		oTitle.$().trigger("mouseover");
		$oDynamicPage = this.oDynamicPage.$();

		// Assert
		assert.ok(oTitleMouseOverSpy.calledOnce, "DP: Expand Header Visual Indicator MouseOver Handler is called");
		assert.ok(oTitleMouseOverSpy2.calledOnce, "DPTitle: Expand Header Visual Indicator MouseOver Handler is called");
		assert.ok($oDynamicPage.hasClass("sapFDynamicPageTitleForceHovered"), "DPageTitle hover state applied");
	});

	QUnit.test("DynamicPage Title MouseOut", function (assert) {
		var oTitleMouseOverSpy = this.spy(sap.f.DynamicPage.prototype, "_onTitleMouseOut"),
			oTitleMouseOverSpy2 = this.spy(sap.f.DynamicPageTitle.prototype, "onmouseout"),
			oTitle = this.oDynamicPage.getTitle(),
			$oDynamicPage;

		// Act
		oUtil.renderObject(this.oDynamicPage);

		// Act
		oTitle.$().trigger("mouseout");
		$oDynamicPage = this.oDynamicPage.$();

		// Assert
		assert.ok(oTitleMouseOverSpy.calledOnce, "DP: Expand Header Visual Indicator MouseOut Handler is called");
		assert.ok(oTitleMouseOverSpy2.calledOnce, "DPTitle: Expand Header Visual Indicator MouseOut Handler is called");
		assert.ok(!$oDynamicPage.hasClass("sapFDynamicPageTitleForceHovered"), "DPageTitle hover state removed");
	});

	QUnit.test("DynamicPage header resize", function (assert) {
		var oHeader = this.oDynamicPage.getHeader(),
			$oDynamicPage,
			isHeaderSnappedWithScroll = function () {
				return this.oDynamicPage._getScrollPosition() >= this.oDynamicPage._getSnappingHeight();
			}.bind(this);

		oHeader.addContent(new sap.m.Panel({height: "100px"}));

		// setup
		oUtil.renderObject(this.oDynamicPage);
		this.oDynamicPage.setHeaderExpanded(false);

		// assert init state
		assert.ok(isHeaderSnappedWithScroll(), "header is snapped with scroll");

		//Act
		$oDynamicPage = this.oDynamicPage.$();
		$oDynamicPage.find('.sapMPanel').get(0).style.height = "300px";
		// explicitly call to avoid waiting for resize handler to detect change
		this.oDynamicPage._onChildControlsHeightChange();

		// Check
		assert.ok(isHeaderSnappedWithScroll(), "header is still snapped with scroll");
	});

	/* --------------------------- DynamicPage Private functions ---------------------------------- */
	QUnit.module("DynamicPage On Title Press when Header State Preserved On Scroll", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithPreserveHeaderOnScroll();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage On Title Press", function (assert) {
		var oTitle = this.oDynamicPage.getTitle(),
			oHeader = this.oDynamicPage.getHeader();

		oUtil.renderObject(this.oDynamicPage);

		assert.ok(!oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), "Header visible by default");

		oTitle.fireEvent("_titlePress");
		assert.ok(oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), "Header snapped and hidden");

		oTitle.fireEvent("_titlePress");
		assert.ok(!oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), "Header expanded and visible again");
	});

	QUnit.module("DynamicPage when Header height bigger than page height", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithBigHeaderContent();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage On Title Press", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oTitle = oDynamicPage.getTitle();

		oDynamicPage.setHeaderExpanded(false);
		oUtil.renderObject(oDynamicPage);

		oDynamicPage.$().outerHeight("800px"); // set page height smaller than header height

		oDynamicPage._setScrollPosition(100);

		assert.equal(oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true, "header is bigger than allowed to be expanded in title");

		//act
		oTitle.fireEvent("_titlePress");
		assert.equal(oDynamicPage._bHeaderInTitleArea, false, "Header is not added to the title");
		assert.equal(oDynamicPage.getHeaderExpanded(), true, "Header is expanded");
		assert.equal(oDynamicPage._getScrollPosition(), 0, "scroll position is correct");
	});

	QUnit.test("Expand header updates scrollbar", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oTitle = oDynamicPage.getTitle(),
			oScrollSpy = this.spy(oDynamicPage, "_onWrapperScroll"),
			done = assert.async();

		assert.expect(2);

		oDynamicPage.setHeaderExpanded(false);
		oUtil.renderObject(oDynamicPage);

		oDynamicPage.$().outerHeight("800px"); // set page height smaller than header height

		oDynamicPage._setScrollPosition(100);

		assert.equal(oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true, "header is bigger than allowed to be expanded in title");

		oScrollSpy.reset();

		//act
		oTitle.fireEvent("_titlePress");
		setTimeout(function() {
			assert.equal(oScrollSpy.callCount, 1, "listener for updating the custom scrollBar position is called");
			done();
		}, 0);
	});

	QUnit.test("expand shows the visual indicator", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oExpandButton = oDynamicPage.getTitle()._getExpandButton(),
			oCollapseButton = oDynamicPage.getHeader()._getCollapseButton(),
			oSpy = this.spy(oDynamicPage, "_scrollBellowCollapseVisualIndicator"),
			iCollapseButtonBottom,
			iDynamicPageBottom;

		oDynamicPage.setHeaderExpanded(false);
		oUtil.renderObject(oDynamicPage);

		oDynamicPage.$().outerHeight("800px"); // set page height smaller than header height

		oDynamicPage._setScrollPosition(100);

		assert.equal(oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true, "header is bigger than allowed to be expanded in title");

		//act: expand via the 'expand' visual indicator
		oExpandButton.firePress();

		// check
		assert.equal(oSpy.callCount, 1, "scroll to show the 'collapse' visual indicator is called");

		iCollapseButtonBottom =  Math.round(Math.abs(oCollapseButton.getDomRef().getBoundingClientRect().bottom));
		iDynamicPageBottom = Math.round(Math.abs(this.oDynamicPage.getDomRef().getBoundingClientRect().bottom));

		// check position
		assert.ok(Math.abs(iCollapseButtonBottom - iDynamicPageBottom) <= 1, "CollapseButton is at the bottom of the page, pos: " + iCollapseButtonBottom);
	});

	QUnit.test("Expand button of snapped header preserved on resize", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oStubCanScroll = this.stub(this.oDynamicPage, "_canSnapHeaderOnScroll", function () {
				return false;
			}),
			oStubHeaderHeight = this.stub(this.oDynamicPage, "_headerBiggerThanAllowedToBeExpandedInTitleArea", function () {
				return true;
			}),
			oMockResizeWidthEvent = {size:{width: 100}};

		// Final setup step: snap header => the expand button should become visible after rendering
		oDynamicPage.setHeaderExpanded(false);

		oUtil.renderObject(oDynamicPage);

		// Act
		oDynamicPage._onResize(oMockResizeWidthEvent);

		assert.ok(!oDynamicPage.getTitle()._getExpandButton().$().hasClass('sapUiHidden'), "expand button is visible");

		//cleanup
		oStubCanScroll.restore();
		oStubHeaderHeight.restore();
	});


	/* --------------------------- DynamicPage Private functions ---------------------------------- */
	QUnit.module("DynamicPage - Private functions", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithExpandSnapContent();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage _expandHeader() should hide Snapped Content and show Expand Content", function (assert) {
		var $titleSnap = this.oDynamicPage.getTitle().$("snapped-wrapper"),
			$titleExpand = this.oDynamicPage.getTitle().$("expand-wrapper");

		this.oDynamicPage._expandHeader();

		assert.equal($titleSnap.hasClass("sapUiHidden"), true, "Snapped Content is not visible initially");
		assert.equal($titleExpand.hasClass("sapUiHidden"), false, "Expanded Content is visible initially");
	});

	QUnit.test("DynamicPage _snapHeader() should show Snapped Content and hide Expand Content", function (assert) {
		var $titleSnap = this.oDynamicPage.getTitle().$("snapped-wrapper"),
			$titleExpand = this.oDynamicPage.getTitle().$("expand-wrapper");

		this.oDynamicPage._snapHeader();

		assert.equal($titleSnap.hasClass("sapUiHidden"), false, "Snapped Content is visible initially");
		assert.equal($titleExpand.hasClass("sapUiHidden"), true, "Expanded Content is not visible initially");
	});

	QUnit.test("DynamicPage _moveHeaderToContentArea() should move the Header from title are to content area", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper;

		assert.equal($wrapper.find($header).length > 0, true, "Header is in content area initially");

		oDynamicPage._moveHeaderToTitleArea();
		assert.equal($wrapper.find($header).length === 0, true, "Header is in not in the content area");

		oDynamicPage._moveHeaderToContentArea();
		assert.equal($wrapper.find($header).length > 0, true, "Header is back in the content area");
	});

	QUnit.test("DynamicPage _moveHeaderToContentArea(true) should offset the scroll position of the content", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$HeaderDom = this.oDynamicPage.getHeader().getDomRef(),
			iHeaderHeight = getElementHeight($HeaderDom, true /* ceil */),
			iScrollPositionBefore = iHeaderHeight + 100, // pick position greater than snapping height
			iExpectedScrollPositionAfter = iScrollPositionBefore + iHeaderHeight; // add iHeaderHeight as the header will be moved into the content area

		//setup
		oDynamicPage._moveHeaderToTitleArea();
		oDynamicPage.getScrollDelegate().scrollTo(0, iScrollPositionBefore);

		//act
		oDynamicPage._moveHeaderToContentArea(true);

		//check
		assert.equal(oDynamicPage._getScrollPosition(), iExpectedScrollPositionAfter, "scroll position of content is offset");
	});

	QUnit.test("DynamicPage _moveHeaderToContentArea(true) should offset the top scroll position of the content", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			iHeaderHeight = getElementHeight(oHeader.getDomRef(), true /* ceil */),
			iScrollPositionBefore = 0,
			iExpectedScrollPositionAfter = iHeaderHeight; // header height is added

		// setup
		oDynamicPage._moveHeaderToTitleArea();
		assert.strictEqual(oDynamicPage._getScrollPosition(), iScrollPositionBefore, "Scroll position is the top of the content area");

		//act
		oDynamicPage._moveHeaderToContentArea(true);

		//assert
		assert.equal(oDynamicPage._getScrollPosition(), iExpectedScrollPositionAfter, "Scroll position is correctly offset");
	});

	QUnit.test("DynamicPage _moveHeaderToTitleArea() should move the header from the content area to the title area", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			$titleWrapper = oDynamicPage.$("header"),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper;

		assert.equal($wrapper.find($header).length > 0, true, "Header is in the content area initially");

		oDynamicPage._moveHeaderToTitleArea();

		assert.equal($wrapper.find($header).length === 0, true, "Header is in not in the content area");
		assert.equal($titleWrapper.find($header).length > 0, true, "Header is in not in the title area");
	});

	QUnit.test("DynamicPage _moveHeaderToTitleArea(true) should offset the scroll position of the content", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			iHeaderHeight = getElementHeight(oHeader.getDomRef(), true /* ceil */),
			iScrollPositionBefore = iHeaderHeight + 100,
			iExpectedScrollPositionAfter = 100; // iHeaderHeight should be substracted

		//arrange
		oDynamicPage.getScrollDelegate().scrollTo(0, iScrollPositionBefore);

		//act
		oDynamicPage._moveHeaderToTitleArea(true);

		//assert
		assert.equal(oDynamicPage._getScrollPosition(), iExpectedScrollPositionAfter, "Scroll position of the content area is correctly offset");
	});

	QUnit.test("DynamicPage _moveHeaderToTitleArea(true) should preserve the top scroll position of the content", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$wrapper = oDynamicPage.$wrapper,
			iScrollPositionBefore = 0,
			iExpectedScrollPositionAfter = 0; // should remain 0 as the header is still expanded

		assert.strictEqual(iScrollPositionBefore, 0, "Scroll position is the top of the content area");

		//act
		oDynamicPage._moveHeaderToTitleArea(true);

		//assert
		assert.equal($wrapper.scrollTop(), iExpectedScrollPositionAfter, "Scroll position is still the top of the content area");
	});

	QUnit.test("DynamicPage _toggleHeaderVisibility() should show/hide the DynamicPAge`s Header", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			$header = oHeader.$();

		assert.ok(!$header.hasClass("sapFDynamicPageHeaderHidden"), false, "Header is visible initially");

		oDynamicPage._toggleHeaderVisibility(false);
		assert.ok($header.hasClass("sapFDynamicPageHeaderHidden"), true, "Header is not visible");

		oDynamicPage._toggleHeaderVisibility(true);
		assert.ok(!$header.hasClass("sapFDynamicPageHeaderHidden"), true, "Header is visible again");
	});

	QUnit.test("DynamicPage _pin()/_unPin()", function (assert) {
		var $headerWrapper = this.oDynamicPage.$("header"),
			$contentWrapper = this.oDynamicPage.$("contentWrapper"),
			sHeaderId = this.oDynamicPage.getHeader().getId(),
			oPinSpy = this.spy(this.oDynamicPage, "_updateScrollBar"),
			oDynamicPageTitle = this.oDynamicPage.getTitle(),
			oDynamicPageHeader = this.oDynamicPage.getHeader(),
			$oDynamicPage =  this.oDynamicPage.$(),
			$oCollapseButton = oDynamicPageHeader.getAggregation("_collapseButton").$(),
			$oExpandButton = oDynamicPageTitle.getAggregation("_expandButton").$();

		assert.equal($contentWrapper.find("#" + sHeaderId).length, 1, "The header is in the Content wrapper initially");

		// Act
		this.oDynamicPage._pin();

		// Assert
		assert.equal($headerWrapper.find("#" + sHeaderId).length, 1, "The header is in the Header wrapper when pinned");
		assert.ok(oPinSpy.called, "The ScrollBar is updated");
		assert.equal($oDynamicPage.hasClass("sapFDynamicPageHeaderPinned"), true, "Header is pinned, Pinned class applied to DynamicPage root element");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), true, "Header is pinned, the Expand Button is not visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), false, "Header is pinned, the Collapse Button is visible");

		// Act
		this.oDynamicPage._unPin();

		// Assert
		assert.equal($headerWrapper.find("#" + sHeaderId).length, 1, "The header remains in the header wrapper when unpinned until scroll");
		assert.equal($oDynamicPage.hasClass("sapFDynamicPageHeaderPinned"), false, "Header is unpinned, Pinned class is not applied to DynamicPage root element");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), true, "Header is unpinned and expanded, the Collapse button is visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), false, "Header is unpinned and expanded, the Expand button is not visible");

	});

	QUnit.test("DynamicPage _canSnapHeaderOnScroll() should return the correct value", function (assert) {
		assert.equal(this.oDynamicPage._canSnapHeaderOnScroll(), true, "The header can snap");
	});

	QUnit.test("DynamicPage _shouldExpandOnScroll() returns false initially", function (assert) {
		assert.equal(this.oDynamicPage._shouldExpandOnScroll(), false, "DynamicPage should not expand initially");
	});

	QUnit.test("DynamicPage _shouldSnapOnScroll() returns false initially", function (assert) {
		assert.equal(this.oDynamicPage._shouldSnapOnScroll(), false, "DynamicPage should not snap initially");
	});

	QUnit.test("DynamicPage _getTitleHeight() returns the correct Title height", function (assert) {
		assert.equal(this.oDynamicPage._getTitleHeight(), getElementHeight(this.oDynamicPage.getTitle().getDomRef()),
			"DynamicPage Title height is correct");
	});

	QUnit.test("DynamicPage _getHeaderHeight() returns the Header height", function (assert) {
		var iActualHeaderHeight = getElementHeight(this.oDynamicPage.getHeader().getDomRef());

		assert.equal(this.oDynamicPage._getHeaderHeight(), iActualHeaderHeight, "DynamicPage Header height is correct");
	});

	QUnit.test("DynamicPage _getSnappingHeight() returns the correct Snapping position", function (assert) {
		var $HeaderDom = this.oDynamicPage.getHeader().getDomRef(),
			$TitleDom = this.oDynamicPage.getTitle().getDomRef(),
			iSnappingPosition = getElementHeight($HeaderDom, true /* ceil */) || getElementHeight($TitleDom, true /* ceil */);

		assert.equal(this.oDynamicPage._getSnappingHeight(), iSnappingPosition, "DynamicPage snapping position is correct");
	});

	QUnit.test("DynamicPage _getScrollPosition() returns the correct initial Scroll position", function (assert) {
		assert.equal(this.oDynamicPage._getScrollPosition(), 0,
			"DynamicPage Scroll position is correct");
	});

	QUnit.test("DynamicPage _getScrollPosition() returns the correct scroll position upon custom scrollBar scroll", function (assert) {
		var iExpectedScrollPosition = 500,
			oDynamicPageScrollBar = this.oDynamicPage.getAggregation("_scrollBar");

		//arrange
		oDynamicPageScrollBar.setScrollPosition(iExpectedScrollPosition);

		//act
		this.oDynamicPage._onScrollBarScroll();

		//assert
		assert.equal(Math.ceil(this.oDynamicPage._getScrollPosition()), iExpectedScrollPosition, "DynamicPage Scroll position is correct");
	});

	QUnit.test("DynamicPage _getScrollPosition() returns the correct scroll position upon wrapper scroll", function (assert) {
		var iExpectedScrollPosition = 500,
			oDynamicPageScrollBar = this.oDynamicPage.getAggregation("_scrollBar");

		//arrange
		this.oDynamicPage.$wrapper.scrollTop(iExpectedScrollPosition);

		//act
		this.oDynamicPage._onWrapperScroll({target: {scrollTop: 500}});

		//assert
		assert.equal(oDynamicPageScrollBar.getScrollPosition(), iExpectedScrollPosition, "custom scrollBar scrollPosition is correct");
	});

	QUnit.test("DynamicPage scrollbar.setScrollPosition() is called once after wrapper scroll", function (assert) {
		var iExpectedScrollPosition = 500,
			oDynamicPage = this.oDynamicPage,
			$wrapper = oDynamicPage.$wrapper,
			oDynamicPageScrollBar = this.oDynamicPage.getAggregation("_scrollBar"),
			oScrollPositionSpy = sinon.spy(oDynamicPageScrollBar, "setScrollPosition");

		//arrange
		$wrapper.scrollTop(iExpectedScrollPosition);

		//act
		oDynamicPage._onWrapperScroll({target: {scrollTop: 500}});

		//assert
		assert.equal(oDynamicPageScrollBar.getScrollPosition(), iExpectedScrollPosition, "ScrollBar Scroll position is correct");

		//act
		oDynamicPage._onScrollBarScroll();

		//assert
		assert.equal(oScrollPositionSpy.calledOnce, true, "scrollBar scrollPosition setter is not called again");
	});

	QUnit.test("DynamicPage scrollbar.setScrollPosition() is not called again after custom scrollBar scroll", function (assert) {
		var iExpectedScrollPosition = 500,
			oDynamicPage = this.oDynamicPage,
			oDynamicPageScrollBar = this.oDynamicPage.getAggregation("_scrollBar"),
			oScrollPositionSpy;

		//arrange
		oDynamicPageScrollBar.setScrollPosition(iExpectedScrollPosition);
		oScrollPositionSpy = sinon.spy(oDynamicPageScrollBar, "setScrollPosition");

		//act
		oDynamicPage._onScrollBarScroll();

		//assert
		assert.equal(oDynamicPage._getScrollPosition(), iExpectedScrollPosition, "DynamicPage Scroll position is correct");

		//act
		oDynamicPage._onWrapperScroll({target: {scrollTop: 500}});

		//assert
		assert.equal(oScrollPositionSpy.called, false, "scrollBar scrollPosition setter is not called again");
	});

	QUnit.test("DynamicPage _headerSnapAllowed() returns the correct value", function (assert) {
		var oDynamicPage = this.oDynamicPage;


		assert.ok(oDynamicPage._headerSnapAllowed(), "Header snapping allowed initially");

		oDynamicPage._pin();
		assert.ok(!oDynamicPage._headerSnapAllowed(), "Header snapping not allowed because header is pinned");

		oDynamicPage._unPin();
		assert.ok(oDynamicPage._headerSnapAllowed(), "Header snapping allowed after unpinning");

		oDynamicPage.setPreserveHeaderStateOnScroll(true);
		assert.ok(!oDynamicPage._headerSnapAllowed(), "Header snapping not allowed because preserveHeaderStateOnScroll is true");

		oDynamicPage.setPreserveHeaderStateOnScroll(false);
		assert.ok(oDynamicPage._headerSnapAllowed(), "Header snapping allowed because preserveHeaderStateOnScroll is false");

		oDynamicPage._snapHeader(true);
		assert.ok(!oDynamicPage._headerSnapAllowed(), "Header snapping not allowed because header is snapped already");

		oDynamicPage._expandHeader(true);
		assert.ok(oDynamicPage._headerSnapAllowed(), "Header snapping allowed after expanding");
	});

	QUnit.test("DynamicPage _headerScrolledOut() returns the correct value", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oTitle = oDynamicPage.getTitle(),
			oHeader = oDynamicPage.getHeader(),
			iScrolledOutPoint = oTitle.$().outerHeight() + oHeader.$().outerHeight();

		assert.ok(!oDynamicPage._headerScrolledOut(), "Header is not scrolled out initially");

		oDynamicPage._setScrollPosition(iScrolledOutPoint);
		Core.applyChanges();

		assert.ok(oDynamicPage._headerScrolledOut(), "Header is scrolled out after scrolling to the header`s very bottom");
	});

	QUnit.test("DynamicPage _headerBiggerThanAllowedToPin() returns the correct value", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oSandBox = sinon.sandbox.create(),
			fnStubConfig = function (iHeaderHeight, iDynamicPageHeight) {
				oSandBox.stub(oDynamicPage, "_getEntireHeaderHeight").returns(iHeaderHeight);
				oSandBox.stub(oDynamicPage, "_getOwnHeight").returns(iDynamicPageHeight);
			};

		fnStubConfig(700, 999);

		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToPin(), true,
			"DynamicPage Header is bigger than allowed");

		oSandBox.restore();

		fnStubConfig(100, 999);

		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToPin(), false,
			"DynamicPage Header is not bigger than allowed");
	});

	QUnit.test("DynamicPage _headerBiggerThanAllowedToBeExpandedInTitleArea() returns the correct value on desktop", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oSandBox = sinon.sandbox.create(),
			fnStubConfig = function (iHeaderHeight, iDynamicPageHeight) {
				oSandBox.stub(oDynamicPage, "_getEntireHeaderHeight").returns(iHeaderHeight);
				oSandBox.stub(oDynamicPage, "_getOwnHeight").returns(iDynamicPageHeight);
			},
			iSmallHeaderHeight = 700,
			iLargeHeaderHeight = 1100,
			iPageHeight = 1000,
			iNoHeaderHeight = 0,
			iNoPageHeight = 0;

		// act (1) -  Header`s height is smaller than the Page`s height.
		fnStubConfig(iSmallHeaderHeight, iPageHeight);

		// assert
		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), false,
			"DynamicPage Header is not bigger than allowed to be expanded in the non-scrollable area");

		oSandBox.restore();

		// act (2) - Header`s height is bigger than the Page`s height.
		fnStubConfig(iLargeHeaderHeight, iPageHeight);

		// assert
		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true,
			"DynamicPage Header is bigger than allowed to be expanded in the non-scrollable area");

		oSandBox.restore();

		// act (3) - Header`s height and Page`s height are 0.
		fnStubConfig(iNoHeaderHeight, iNoPageHeight);

		// assert
		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), false,
			"When Header is not on the page return false");

		oSandBox.restore();
	});

	QUnit.test("DynamicPage _headerBiggerThanAllowedToBeExpandedInTitleArea() returns the correct value on mobile", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oSandBox = sinon.sandbox.create(),
			fnStubConfig = function (iHeaderHeight, iDynamicPageHeight) {
				oSandBox.stub(oDynamicPage, "_getEntireHeaderHeight").returns(iHeaderHeight);
				oSandBox.stub(oDynamicPage, "_getOwnHeight").returns(iDynamicPageHeight);
			},
			iSmallHeaderHeight = 100,
			iLargeHeaderHeight = 400,
			iPageHeight = 1000,
			iNoHeaderHeight = 0,
			iNoPageHeight = 0;

		// act (1) -  Header`s height is smaller than the Page`s height.
		oUtil.toMobileMode();
		fnStubConfig(iSmallHeaderHeight, iPageHeight);

		// assert
		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), false,
			"DynamicPage Header is not bigger than allowed to be expanded in the non-scrollable area");

		oSandBox.restore();

		// act (2) - Header`s height is bigger than 1/3 (0.3) of the Page`s height.
		fnStubConfig(iLargeHeaderHeight, iPageHeight);

		// assert
		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true,
			"DynamicPage Header is bigger than allowed to be expanded in the non-scrollable area");

		oSandBox.restore();

		// act (3) - Header`s height and Page`s height are 0.
		fnStubConfig(iNoHeaderHeight, iNoPageHeight);

		// assert
		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), false,
			"When Header is not on the page return false");

		// cleanup
		oSandBox.restore();
		oUtil.toDesktopMode();
	});

	QUnit.test("DynamicPage _getEntireHeaderHeight() return correct values", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oTitle = oDynamicPage.getTitle(),
			oHeader = oDynamicPage.getHeader();

		assert.equal(oDynamicPage._getEntireHeaderHeight(),
			oTitle.$().outerHeight() + oHeader.$().outerHeight(), "correct with both header and title");

		oDynamicPage.setTitle(null);
		assert.equal(oDynamicPage._getEntireHeaderHeight(), oHeader.$().outerHeight(), "correct with only header");

		oDynamicPage.setTitle(oTitle);
		oDynamicPage.setHeader(null);
		assert.equal(oDynamicPage._getEntireHeaderHeight(), oTitle.$().outerHeight(), "correct with only title");

		oDynamicPage.setTitle(null);
		oDynamicPage.setHeader(null);
		assert.equal(oDynamicPage._getEntireHeaderHeight(), 0, "correct with no header and no title");
	});

	QUnit.test("DynamicPage _hasVisibleTitleAndHeader returns correct state" , function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			aHeaderContent = oHeader.getContent();

		// Assert
		assert.ok(aHeaderContent.length, "Content aggregation is set");
		assert.ok(oDynamicPage._hasVisibleTitleAndHeader(), "Title and Header are visible");

		// Act
		oHeader.destroyContent();

		// Assert
		assert.notOk(oDynamicPage._hasVisibleTitleAndHeader(), "Header is not visible");
	});

	QUnit.test("DynamicPageTitle _getActionsToolbar returns toolbar with correct style", function (assert) {
		var oActionsToolbar = this.oDynamicPage.getTitle()._getActionsToolbar();
		assert.equal(oActionsToolbar.getStyle(), sap.m.ToolbarStyle.Clear, "actions toolbar has correct style");
	});

	QUnit.test("DynamicPageTitle _getNavigationActionsToolbar returns toolbar with correct style", function (assert) {
		var oNavActionsToolbar = this.oDynamicPage.getTitle()._getNavigationActionsToolbar();
		assert.equal(oNavActionsToolbar.getStyle(), sap.m.ToolbarStyle.Clear, "nav-actions toolbar has correct style");
	});

	/* --------------------------- DynamicPage Toggle Header On Scroll ---------------------------------- */
	QUnit.module("DynamicPage - Toggle Header On Scroll", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithExpandSnapContent();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage _toggleHeaderOnScroll for position <= snapping height preserves expanded state", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$header = this.oDynamicPage.getHeader().$(),
			$wrapper = oDynamicPage.$wrapper,
			iSnappingHeight = oDynamicPage._getSnappingHeight();

		//arrange
		$wrapper.scrollTop(iSnappingHeight - 1);

		//act
		oDynamicPage._toggleHeaderOnScroll();

		//check
		assert.equal(oDynamicPage.getHeaderExpanded(), true, "header is still expanded");
		assert.equal($wrapper.find($header).length > 0, true, "Header is still in the content area");
	});

	QUnit.test("DynamicPage _toggleHeaderOnScroll for position > snapping height snaps the header", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$header = this.oDynamicPage.getHeader().$(),
			$wrapper = oDynamicPage.$wrapper,
			iSnappingHeight = oDynamicPage._getSnappingHeight();

		//arrange
		oDynamicPage.getScrollDelegate().scrollTo(0, iSnappingHeight + 1);

		//act
		oDynamicPage._toggleHeaderOnScroll();

		//check
		assert.equal(oDynamicPage.getHeaderExpanded(), false, "header is snapped");
		assert.equal($wrapper.find($header).length > 0, true, "Header is still in the content area");
	});

	QUnit.test("DynamicPage _toggleHeaderOnScroll for position <= snapping height when header in title preserves the expanded state", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$header = this.oDynamicPage.getHeader().$(),
			$wrapper = oDynamicPage.$wrapper,
			iHeaderHeight = $header.outerHeight();

		//setup
		oDynamicPage._moveHeaderToTitleArea();
		$wrapper.scrollTop(iHeaderHeight - 10); // scroll to expand

		//act
		oDynamicPage._toggleHeaderOnScroll();

		//check
		assert.equal(oDynamicPage.getHeaderExpanded(), true, "header is expanded");
		assert.equal($wrapper.find($header).length > 0, true, "Header is still in the content area");
	});

	QUnit.test("Scrolling from expanded header in title to position > snapping height snaps the header", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = this.oDynamicPage.getHeader(),
			$header = oHeader.$(),
			$HeaderDom = oHeader.getDomRef(),
			$wrapper = oDynamicPage.$wrapper,
			iHeaderHeight = getElementHeight($HeaderDom, true),
			iTestScrollPosition = iHeaderHeight + 100, // pick position greater than snapping height => will require snap
			iExpectedScrollPosition = iTestScrollPosition + iHeaderHeight;

		//setup
		oDynamicPage._moveHeaderToTitleArea();
		oDynamicPage.getScrollDelegate().scrollTo(0, iTestScrollPosition);

		//act
		oDynamicPage._toggleHeaderOnScroll();

		//check
		assert.equal(oDynamicPage.getHeaderExpanded(), false, "header is snapped");
		assert.equal($wrapper.find($header).length > 0, true, "Header is in the content area");
		assert.equal(oDynamicPage._getScrollPosition(), iExpectedScrollPosition, "Scroll position is correctly offset");
	});

	QUnit.module("DynamicPage - Header initially collapsed", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("{headerExpanded: false; preserveHeaderStateOnScroll: true}", function (assert) {
		var sSnappedClass = "sapFDynamicPageTitleSnapped",
			oHeader = this.oDynamicPage.getHeader();

		//arrange
		this.oDynamicPage.setHeaderExpanded(false);
		this.oDynamicPage.setPreserveHeaderStateOnScroll(true); // will toggle the value of headerExpanded
		this.oDynamicPage.setContent(oFactory.getContent(300)); // enough content to allow snap

		//act
		oUtil.renderObject(this.oDynamicPage);

		assert.strictEqual(this.oDynamicPage.getHeaderExpanded(), false, "The DynamicPage getHeaderExpanded is still false");
		assert.strictEqual(this.oDynamicPage.$titleArea.hasClass(sSnappedClass), true);
		assert.strictEqual(oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), true, "Header is hidden");
	});

	QUnit.test("Expand and Collapse buttons initial visibility", function (assert) {
		var oHeader = this.oDynamicPage.getHeader(),
			oTitle = this.oDynamicPage.getTitle(),
			$oCollapseButton,
			$oExpandButton;

		// Act
		this.oDynamicPage.setHeaderExpanded(false);
		this.oDynamicPage.setPreserveHeaderStateOnScroll(true); // will toggle the value of headerExpanded
		this.oDynamicPage.setContent(oFactory.getContent(300)); // enough content to allow snap

		oUtil.renderObject(this.oDynamicPage);
		$oCollapseButton = oHeader.getAggregation("_collapseButton").$();
		$oExpandButton = oTitle.getAggregation("_expandButton").$();

		// Assert
		assert.equal($oExpandButton.hasClass("sapUiHidden"), false, "Header is collapsed, Expand button is visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), true, "Header is collapsed, Collapsed button is not visible");
	});

	function assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition) {
		var sSnappedClass = "sapFDynamicPageTitleSnapped",
			oHeader = oDynamicPage.getHeader(),
			oTitle = oDynamicPage.getTitle(),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper,
			$titleWrapper = oDynamicPage.$("header"),
			$oCollapseButton = oHeader.getAggregation("_collapseButton").$(),
			$oExpandButton = oTitle.getAggregation("_expandButton").$(),
			iActualScrollPosition = oDynamicPage._getScrollPosition();

		iExpectedScrollPosition = iExpectedScrollPosition || 0;

		assert.strictEqual(oDynamicPage.getHeaderExpanded(), false, "The DynamicPage getHeaderExpanded is false");
		assert.ok(oDynamicPage.$titleArea.hasClass(sSnappedClass), "title has snapped css-class");
		assert.strictEqual(oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), !bExpectedHeaderInContent, "Header visibility is correct");
		assert.equal($titleWrapper.find($header).length > 0, !bExpectedHeaderInContent, "Header in the title value is correct");
		assert.equal($wrapper.find($header).length > 0, bExpectedHeaderInContent, "Header in the content value is correct");
		assert.equal(iActualScrollPosition, iExpectedScrollPosition, "Scroll position is correct");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), false, "Header is collapsed, Expand button is visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), true, "Header is collapsed, Collapsed button is not visible");
	}

	function assertHeaderExpanded(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition) {

		var sSnappedClass = "sapFDynamicPageTitleSnapped",
			oHeader = oDynamicPage.getHeader(),
			oTitle = oDynamicPage.getTitle(),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper,
			$titleWrapper = oDynamicPage.$("header"),
			$oCollapseButton = oHeader.getAggregation("_collapseButton").$(),
			$oExpandButton = oTitle.getAggregation("_expandButton").$(),
			iActualScrollPosition = oDynamicPage._getScrollPosition();

		iExpectedScrollPosition = iExpectedScrollPosition || 0;

		assert.strictEqual(oDynamicPage.getHeaderExpanded(), true, "The DynamicPage getHeaderExpanded is true");
		assert.strictEqual(oDynamicPage.$titleArea.hasClass(sSnappedClass), false, "title does not have snapped css-class");
		assert.strictEqual(oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), false, "Header visibility is correct");
		assert.equal($titleWrapper.find($header).length > 0, !bExpectedHeaderInContent, "Header in the title value is correct");
		assert.equal($wrapper.find($header).length > 0, bExpectedHeaderInContent, "Header in the content value is correct");
		assert.equal(iActualScrollPosition, iExpectedScrollPosition, "Scroll position is correct");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), true, "Header is expanded, Expand button is not visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), false, "Header is expanded, Collapsed button is visible");
	}

	function getElementHeight($Element, bCeil) {
		var iElementHeight;

		if (!$Element) {
			return 0;
		}

		iElementHeight = $Element.getBoundingClientRect().height;

		return bCeil ? Math.ceil(iElementHeight) : iElementHeight;
	}

	QUnit.test("{headerExpanded: false; preserveHeaderStateOnScroll: false; _canSnapHeaderOnScroll: true}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bExpectedHeaderInContent = true,
			iExpectedScrollPosition;

		//arrange
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(300)); // enough content to allow snap

		//act
		oUtil.renderObject(oDynamicPage);

		iExpectedScrollPosition = oDynamicPage._getSnappingHeight();

		//assert
		assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
	});

	QUnit.test("{headerExpanded: false; preserveHeaderStateOnScroll: true; _canSnapHeaderOnScroll: true}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bExpectedHeaderInContent = false,
			iExpectedScrollPosition = 0;

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(true);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(300)); // enough content to allow snap

		//act
		oUtil.renderObject(oDynamicPage);

		//assert
		assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
	});

	QUnit.test("{headerExpanded: false; preserveHeaderStateOnScroll: true; _canSnapHeaderOnScroll: false}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bExpectedHeaderInContent = false,
			iExpectedScrollPosition = 0;

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(true);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(1)); // not enough content to allow snap

		//act
		oUtil.renderObject(oDynamicPage);

		//assert
		assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
	});

	QUnit.test("{headerExpanded: false; preserveHeaderStateOnScroll: false; _canSnapHeaderOnScroll: false}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bExpectedHeaderInContent = false,
			iExpectedScrollPosition = 0;

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(false);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(1)); // not enough content to allow snap

		//act
		oUtil.renderObject(oDynamicPage);

		//assert
		assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
	});

	QUnit.test("onAfterRendering can enable headerExpanded when {_canSnapHeaderOnScroll: false}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bExpectedHeaderInContent = false,
			iExpectedScrollPosition = 0,
			done = assert.async();

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(false);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(1)); // not enough content to allow snap
		oDynamicPage.addEventDelegate({
			onAfterRendering: function() {
				//assert
				assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
				oDynamicPage.setHeaderExpanded(true);
				assertHeaderExpanded(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
				done();
			}
		});
		//act
		oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
	});

	QUnit.test("onAfterRendering can enable headerExpanded when {_canSnapHeaderOnScroll: true}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bHeaderInContent = true,
			iExpectedScrollPosition,
			done = assert.async();

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(false);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(300)); // enough content to allow snap
		oDynamicPage.addEventDelegate({
			onAfterRendering: function() {
			iExpectedScrollPosition = oDynamicPage._getSnappingHeight();
				//assert
				assertHeaderSnapped(assert, bHeaderInContent, oDynamicPage, iExpectedScrollPosition);
				oDynamicPage.setHeaderExpanded(true);
				iExpectedScrollPosition = 0;
				assertHeaderExpanded(assert, !bHeaderInContent, oDynamicPage, iExpectedScrollPosition);
				done();
			}
		});
		//act
		oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
	});

	QUnit.test("onAfterRendering can modify preserveHeaderStateOnScroll when {_canSnapHeaderOnScroll: false}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bHeaderInContent = true,
			iExpectedScrollPosition = 0,
			done = assert.async(),
			oDelegateFirstRendering = {
				onAfterRendering: function() {
					//assert
					assertHeaderSnapped(assert, !bHeaderInContent, oDynamicPage, iExpectedScrollPosition);
					oDynamicPage.removeEventDelegate(oDelegateFirstRendering);
					oDynamicPage.setPreserveHeaderStateOnScroll(true); // causes invalidation, so check in next rendering:
					Core.applyChanges();
					assertHeaderSnapped(assert, !bHeaderInContent, oDynamicPage, iExpectedScrollPosition);
					done();
				}
			};

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(false);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(1)); // not enough content to allow snap
		oDynamicPage.addEventDelegate(oDelegateFirstRendering);

		//act
		oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
	});

	QUnit.test("DynamicPage._setScrollPosition dependency on scroll delegate", function (assert) {

		var oDynamicPage = this.oDynamicPage,
			done = assert.async(),
			iNewScrollPosition = 10,
			oDelegate;

		oDelegate = {
			onAfterRendering: function() {
				setTimeout(function() {
					//check
					assert.ok(oDynamicPage.getScrollDelegate().hasOwnProperty("_$Container"), "scroll delegate has property _$Container");
					assert.strictEqual(oDynamicPage.getScrollDelegate()._$Container.length, 1, "scroll delegate obtained reference to page container");
					assert.strictEqual(oDynamicPage.getScrollDelegate()._$Container[0], oDynamicPage.$wrapper[0], "scroll delegate container reference is wrapper reference");

					//act
					oDynamicPage._setScrollPosition(iNewScrollPosition);
					//check
					assert.strictEqual(oDynamicPage._getScrollPosition(), iNewScrollPosition, "scroll position is correct");
					done();
				}, 0);
			}
		};

		oDynamicPage.addEventDelegate(oDelegate);
		oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
	});

	QUnit.module("DynamicPage - toggleHeaderOnTitleClick", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageToggleHeaderFalse();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage toggleHeaderOnTitleClick initial behavior", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$oDynamicPageTitleSpan = oDynamicPage.getTitle()._getFocusSpan().$();

		assert.equal(oDynamicPage.getToggleHeaderOnTitleClick(), false, "Initially toggleHeaderOnTitleClick = false");
		assert.equal($oDynamicPageTitleSpan.attr("tabindex"), undefined, "Initially the header title is not focusable");
	});

	/* --------------------------- DynamicPage ARIA ---------------------------------- */
	QUnit.module("DynamicPage - ARIA State", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Title has the correct Aria state", function (assert) {
		var $title = this.oDynamicPage.getTitle().$(),
			sRole = "heading",
			sLevel = "2";

		assert.equal($title.attr("role"), sRole,
			"DynamicPage Title role 'heading'");
		assert.equal($title.attr("aria-level"), sLevel,
			"DynamicPage Title is heading level 2");
	});

	QUnit.test("DynamicPage Header has the correct Aria state", function (assert) {
		var $header = this.oDynamicPage.getHeader().$(),
			sRole = "region",
			sAriaExpandedValue = "true",
			sAriaLabelValue = oFactory.getResourceBundle().getText("EXPANDED_HEADER");
		this.stub(this.oDynamicPage, "_shouldSnapOnScroll", function () {
			return true;
		});
		this.stub(this.oDynamicPage, "_canSnapHeaderOnScroll", function () {
			return true;
		});

		assert.equal($header.attr("role"), sRole,
			"DynamicPage Header role 'region'");
		assert.equal($header.attr("aria-expanded"), sAriaExpandedValue,
			"DynamicPage Header aria-expanded 'true'");
		assert.equal($header.attr("aria-label"), sAriaLabelValue,
			"DynamicPage Header aria-label is 'Header expanded'");

		sAriaExpandedValue = "false";
		sAriaLabelValue = oFactory.getResourceBundle().getText("SNAPPED_HEADER");
		this.oDynamicPage._toggleHeaderOnScroll();

		assert.equal($header.attr("aria-expanded"), sAriaExpandedValue,
			"DynamicPage Header aria-expanded 'true'");
		assert.equal($header.attr("aria-label"), sAriaLabelValue,
			"DynamicPage Header aria-label is 'Header expanded'");
	});

	QUnit.test("DynamicPage Header Pin button has the correct Aria state", function (assert) {
		var $pinButton = this.oDynamicPage.getHeader()._getPinButton().$(),
			sAriaPressedValue = "false",
			sAriaControlsValue = this.oDynamicPage.getHeader().getId();

		assert.equal($pinButton.attr("aria-controls"), sAriaControlsValue,
			"DynamicPage Header Pin button aria-controls points to the Header");
		assert.equal($pinButton.attr("aria-pressed"), sAriaPressedValue,
			"DynamicPage Header  Pin button aria-pressed 'false'");

		$pinButton.trigger('tap');
		sAriaPressedValue = "true";

		assert.equal($pinButton.attr("aria-pressed"), sAriaPressedValue,
			"DynamicPage Header  Pin button aria-pressed 'true'");
	});

	QUnit.test("DynamicPage Header Pin button has the correct tooltip when pin and unpin", function (assert) {
		var oPinButton = this.oDynamicPage.getHeader()._getPinButton(),
			sPinTooltip = oFactory.getResourceBundle().getText("PIN_HEADER"),
			sUnPinTooltip = oFactory.getResourceBundle().getText("UNPIN_HEADER");

		this.oDynamicPage._pin();
		assert.equal(oPinButton.getTooltip(), sUnPinTooltip, "The tooltip is correct");

		this.oDynamicPage._unPin();
		assert.equal(oPinButton.getTooltip(), sPinTooltip, "The tooltip is correct");
	});

	QUnit.test("DynamicPage Header Pin button has the correct tooltip when changing preserveHeaderStateOnScroll", function (assert) {
		var oPinButton = this.oDynamicPage.getHeader()._getPinButton(),
			sPinTooltip = oFactory.getResourceBundle().getText("PIN_HEADER"),
			sUnPinTooltip = oFactory.getResourceBundle().getText("UNPIN_HEADER");

		this.oDynamicPage._pin();
		assert.equal(oPinButton.getTooltip(), sUnPinTooltip,
			"The tooltip is correct");

		this.oDynamicPage.setPreserveHeaderStateOnScroll(true);
		Core.applyChanges();
		assert.equal(oPinButton.getTooltip(), sUnPinTooltip,
			"The tooltip is correct: unchanged when preserveHeaderStateOnScroll is true");

		this.oDynamicPage.setPreserveHeaderStateOnScroll(false);
		Core.applyChanges();
		assert.equal(oPinButton.getTooltip(), sPinTooltip,
			"The tooltip is correct: resetted when preserveHeaderStateOnScroll is false");
	});

	QUnit.module("Title responsiveness", {
		beforeEach: function() {

			var oXmlString = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.uxap" xmlns:m="sap.m" xmlns:f="sap.f" displayBlock="true" height="100%">',
					'<f:DynamicPageTitle id="DynamicPageTitle" primaryArea="Begin">',
						'<f:expandedHeading>',
							'<m:FlexBox wrap="Wrap" fitContainer="true" alignItems="Center">',
								'<m:Title text="Denise Smith" wrapping="true" class="sapUiTinyMarginEnd"/>',
								'<m:FlexBox wrap="NoWrap" fitContainer="true" alignItems="Center" class="sapUiTinyMarginEnd">',
									'<m:ObjectMarker type="Favorite" class="sapUiTinyMarginEnd"/>',
									'<m:ObjectMarker type="Flagged"/>',
									'<m:Button icon="sap-icon://private" type="Transparent"/>',
									'<m:Button icon="sap-icon://arrow-down" type="Transparent"/>',
								'</m:FlexBox>',
							'</m:FlexBox>',
						'</f:expandedHeading>',
						'<f:snappedHeading>',
							'<m:FlexBox wrap="Wrap" fitContainer="true" alignItems="Center">',
								'<m:FlexBox wrap="NoWrap" fitContainer="true" alignItems="Center" class="sapUiTinyMarginEnd">',
									'<f:Avatar src="../../sap/f/images/Woman_avatar_02.png" displaySize="S" class="sapUiTinyMarginEnd"/>',
									'<m:Title text="Denise Smith" wrapping="true" class="sapUiTinyMarginEnd"/>',
								'</m:FlexBox>',
								'<m:FlexBox wrap="NoWrap" fitContainer="true" alignItems="Center" class="sapUiTinyMarginEnd">',
									'<m:ObjectMarker type="Favorite" class="sapUiTinyMarginEnd"/>',
									'<m:ObjectMarker type="Flagged"/>',
									'<m:Button icon="sap-icon://private" type="Transparent"/>',
									'<m:Button icon="sap-icon://arrow-down" type="Transparent"/>',
								'</m:FlexBox>',
							'</m:FlexBox>',
						'</f:snappedHeading>',
						'<f:expandedContent>',
							'<m:Text text="Senior Developer" />',
						'</f:expandedContent>',
						'<f:snappedContent>',
						   '<m:Text text="Senior Developer" />',
						'</f:snappedContent>',
						'<f:content>',
							'<m:OverflowToolbar>',
								'<m:Button text="KPI 1" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 2" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 3" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 4" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 5" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 6" class="sapUiTinyMargin"/>',
							'</m:OverflowToolbar>',
						'</f:content>',
						'<f:actions>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://copy"/>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://delete"/>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://add"/>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://paste"/>',
						'</f:actions>',
						'<f:navigationActions>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://full-screen" tooltip="Enter Full Screen Mode"/>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://decline" tooltip="Close column"/>',
						'</f:navigationActions>',
					'</f:DynamicPageTitle>',
				'</mvc:View>'
			].join('');

			var Comp = UIComponent.extend("test"	, {
				metadata: {
					manifest : {
						"sap.app": {
							"id": "test",
							"type": "application"
						}
					}
				},
				createContent : function() {
					return sap.ui.xmlview({
						id : this.createId("view"),
						viewContent : oXmlString
					});
				}
			});

			this.oUiComponent = new Comp("comp");
			this.oUiComponentContainer = new ComponentContainer({
				component : this.oUiComponent
			});

			this.oUiComponentContainer.placeAt(TESTS_DOM_CONTAINER);
			Core.applyChanges();
		},

		afterEach: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("Test flex-basis styles are set", function(assert) {
		// arrange
		var oTitle = Core.byId("comp---view--DynamicPageTitle");

		// assert
		assert.notEqual(oTitle.$("content").css("flex-basis"), "auto", "FlexBasis must be set on 'content' div.");
		assert.notEqual(oTitle.$("mainActions").css("flex-basis"), "auto", "FlexBasis must be set on 'mainActions' div.");
	});

	QUnit.test("Test flex-basis styles change when an action is added", function(assert) {
		// arrange
		var oTitle = Core.byId("comp---view--DynamicPageTitle"),
			nOldFlexBasis = parseInt(oTitle.$("mainActions").css("flex-basis"), 10),
			nNewFlexBasis;

		// act
		oTitle.addAction(new sap.m.OverflowToolbarButton({
			type: "Transparent",
			icon: "sap-icon://copy"
		}));

		Core.applyChanges();

		nNewFlexBasis = parseInt(oTitle.$("mainActions").css("flex-basis"), 10);

		// assert
		assert.ok(nNewFlexBasis > nOldFlexBasis, "New flex-basis value should be greater since an action was added.");
	});

	QUnit.module("Title responsiveness shrink factors", {
		beforeEach: function() {

			var oXmlString = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.uxap" xmlns:m="sap.m" xmlns:f="sap.f" displayBlock="true" height="100%">',
					'<f:DynamicPageTitle id="DynamicPageTitle">',
						'<f:expandedHeading>',
							'<m:FlexBox wrap="Wrap" fitContainer="true" alignItems="Center">',
								'<m:Title text="Denise Smith" wrapping="true" class="sapUiTinyMarginEnd"/>',
								'<m:FlexBox wrap="NoWrap" fitContainer="true" alignItems="Center" class="sapUiTinyMarginEnd">',
									'<m:ObjectMarker type="Favorite" class="sapUiTinyMarginEnd"/>',
									'<m:ObjectMarker type="Flagged"/>',
									'<m:Button icon="sap-icon://private" type="Transparent"/>',
									'<m:Button icon="sap-icon://arrow-down" type="Transparent"/>',
								'</m:FlexBox>',
							'</m:FlexBox>',
						'</f:expandedHeading>',
						'<f:snappedHeading>',
							'<m:FlexBox wrap="Wrap" fitContainer="true" alignItems="Center">',
								'<m:FlexBox wrap="NoWrap" fitContainer="true" alignItems="Center" class="sapUiTinyMarginEnd">',
									'<f:Avatar src="../../sap/f/images/Woman_avatar_02.png" displaySize="S" class="sapUiTinyMarginEnd"/>',
									'<m:Title text="Denise Smith" wrapping="true" class="sapUiTinyMarginEnd"/>',
								'</m:FlexBox>',
								'<m:FlexBox wrap="NoWrap" fitContainer="true" alignItems="Center" class="sapUiTinyMarginEnd">',
									'<m:ObjectMarker type="Favorite" class="sapUiTinyMarginEnd"/>',
									'<m:ObjectMarker type="Flagged"/>',
									'<m:Button icon="sap-icon://private" type="Transparent"/>',
									'<m:Button icon="sap-icon://arrow-down" type="Transparent"/>',
								'</m:FlexBox>',
							'</m:FlexBox>',
						'</f:snappedHeading>',
						'<f:expandedContent>',
							'<m:Text text="Senior Developer" />',
						'</f:expandedContent>',
						'<f:snappedContent>',
						   '<m:Text text="Senior Developer" />',
						'</f:snappedContent>',
						'<f:content>',
							'<m:OverflowToolbar>',
								'<m:Button text="KPI 1" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 2" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 3" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 4" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 5" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 6" class="sapUiTinyMargin"/>',
							'</m:OverflowToolbar>',
						'</f:content>',
						'<f:actions>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://copy"/>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://delete"/>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://add"/>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://paste"/>',
						'</f:actions>',
						'<f:navigationActions>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://full-screen" tooltip="Enter Full Screen Mode"/>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://decline" tooltip="Close column"/>',
						'</f:navigationActions>',
					'</f:DynamicPageTitle>',
				'</mvc:View>'
			].join('');

			var Comp = UIComponent.extend("test"	, {
				metadata: {
					manifest : {
						"sap.app": {
							"id": "test",
							"type": "application"
						}
					}
				},
				createContent : function() {
					return sap.ui.xmlview({
						id : this.createId("view"),
						viewContent : oXmlString
					});
				}
			});

			this.oUiComponent = new Comp("comp");
			this.oUiComponentContainer = new ComponentContainer({
				component : this.oUiComponent
			});

			this.oUiComponentContainer.placeAt(TESTS_DOM_CONTAINER);
			Core.applyChanges();
		},

		afterEach: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("Test flex-basis styles when primaryArea=Middle", function(assert) {
		// arrange
		var oTitle = Core.byId("comp---view--DynamicPageTitle"),
			oHeading = oTitle.$("left-inner"),
			oContent = oTitle.$("content"),
			oActions = oTitle.$("mainActions");

		// act
		oTitle.setPrimaryArea("Middle");

		Core.applyChanges();

		// assert
		assert.equal(parseFloat(oHeading.css("flex-shrink")).toFixed(1), 1.6, "Heading shrink factor is correct");
		assert.equal(parseFloat(oContent.css("flex-shrink")).toFixed(1), 1, "Content shrink factor is correct");
		assert.equal(parseFloat(oActions.css("flex-shrink")).toFixed(1), 1.6, "Actions shrink factor is correct");
	});

	QUnit.test("Test flex-basis styles when primaryArea=Begin and areaShrinkRatio is set", function(assert) {
		// arrange
		var oTitle = Core.byId("comp---view--DynamicPageTitle"),
			oHeading = oTitle.$("left-inner"),
			oContent = oTitle.$("content"),
			oActions = oTitle.$("mainActions");

		// act
		oTitle.setAreaShrinkRatio("1:2:4");

		Core.applyChanges();

		// assert
		assert.equal(parseFloat(oHeading.css("flex-shrink")).toFixed(1), 1, "Heading shrink factor is correct");
		assert.equal(parseFloat(oContent.css("flex-shrink")).toFixed(1), 2, "Content shrink factor is correct");
		assert.equal(parseFloat(oActions.css("flex-shrink")).toFixed(1), 4, "Actions shrink factor is correct");
	});

	QUnit.test("Test flex-basis styles when primaryArea=Middle and areaShrinkRatio is set", function(assert) {
		// arrange
		var oTitle = Core.byId("comp---view--DynamicPageTitle"),
			oHeading = oTitle.$("left-inner"),
			oContent = oTitle.$("content"),
			oActions = oTitle.$("mainActions");

		// act
		oTitle.setPrimaryArea("Middle");
		oTitle.setAreaShrinkRatio("1:2:4");

		Core.applyChanges();

		// assert
		assert.equal(parseFloat(oHeading.css("flex-shrink")).toFixed(1), 1, "Heading shrink factor is correct");
		assert.equal(parseFloat(oContent.css("flex-shrink")).toFixed(1), 2, "Content shrink factor is correct");
		assert.equal(parseFloat(oActions.css("flex-shrink")).toFixed(1), 4, "Actions shrink factor is correct");
	});


	QUnit.module("DynamicPage - Preserving scroll position", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("Toggling page visibility preserves the scroll", function(assert) {
		var SCROLL_POSITION = 200,
			oDynamicPageDOMElement = document.getElementById(this.oDynamicPage.getId()),
			iActualSetScrollPosition;

		// arrange - store the actual reached scroll position, as the container might not have enough scroll height
		this.oDynamicPage._setScrollPosition(SCROLL_POSITION);
		iActualSetScrollPosition = this.oDynamicPage._getScrollPosition();


		// act
		oDynamicPageDOMElement.style.display = 'none';

		// assert
		assert.strictEqual(this.oDynamicPage._getHeight(this.oDynamicPage), 0,
			"Dynamic Page is hidden");

		// act
		oDynamicPageDOMElement.style.display = 'flex';

		// assert
		assert.notEqual(this.oDynamicPage._getHeight(this.oDynamicPage), 0,
			"DynamicPage is visible again");
		assert.strictEqual(this.oDynamicPage._getScrollPosition(), iActualSetScrollPosition,
			"Scroll position " + iActualSetScrollPosition + "is preserved.");
	});
});
