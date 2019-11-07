/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"jquery.sap.global",
	"sap/m/SplitContainer",
	"sap/m/Page",
	"sap/m/library",
	"sap/m/Bar",
	"sap/m/Label",
	"sap/m/Button",
	"sap/ui/Device",
	"sap/m/App",
	"sap/m/List",
	"sap/m/Input",
	"sap/m/Toolbar",
	"sap/m/NavContainer",
	"sap/ui/model/json/JSONModel"
], function(
	qutils,
	createAndAppendDiv,
	jQuery,
	SplitContainer,
	Page,
	mobileLibrary,
	Bar,
	Label,
	Button,
	Device,
	App,
	List,
	Input,
	Toolbar,
	NavContainer,
	JSONModel
) {
	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.SplitAppMode
	var SplitAppMode = mobileLibrary.SplitAppMode;

	createAndAppendDiv("content");



	// Setup viewport for mobile device because SplitContainer doesn't call this by default.
	jQuery.sap.initMobile();

	function splitContainerSetup(bNoPages) {
		//System under Test
		var	sut = new SplitContainer();

		if (bNoPages) {
			return sut;
		}

		var page = new Page("master", {
			title: 'Master 1 Page 1'
		});

		var page2 = new Page("master2", {
			title: 'Master 2 Page 2'
		});

		//master pages
		sut.addMasterPage(page);
		sut.addMasterPage(page2);

		//details pages
		page = new Page("detail");
		page2 = new Page("detail2");

		sut.addDetailPage(page);
		sut.addDetailPage(page2);

		return sut;
	}

	QUnit.module("SplitContainer API and default values", {
		beforeEach : function () {
			this.sut = splitContainerSetup();
//					sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.sut.destroy();
			this.sut = null;
		}
	});

	QUnit.test("Try add master page more than once", function(assert) {
		//Assert
		var page = new Page("master3");
		assert.strictEqual(this.sut.getMasterPages().length, 2, "initial master pages are 2");

		this.sut.addMasterPage(page);
		assert.strictEqual(this.sut.getMasterPages().length, 3, "Now master pages are 3");

		// try to add it again
		this.sut.addMasterPage(page);
		assert.strictEqual(this.sut.getMasterPages().length, 3, "Now master pages should remain 3");

	});

	QUnit.test("Properties default values", function(assert) {
		assert.strictEqual(this.sut.getDefaultTransitionNameDetail(), "slide", "Default value of the property is 'slide'");

		assert.strictEqual(this.sut.getDefaultTransitionNameMaster(), "slide", "Default value of the property is 'slide'");

		assert.strictEqual(this.sut.getMode(), SplitAppMode.ShowHideMode, "Default value of the property mode is 'ShowHideMode'");

		assert.strictEqual(this.sut.getMasterButtonText(), "", "Default value of the property masterButtonText is 'null'");

		assert.strictEqual(this.sut.getBackgroundColor(), "", "Default value of the property backgroundColor is 'null'");

		assert.strictEqual(this.sut.getBackgroundImage(), "", "Default value of the property backgroundImage is 'null'");

		assert.strictEqual(this.sut.getBackgroundRepeat(), false, "Default value of the property backgroundRepeat is 'false'");

		assert.strictEqual(this.sut.getBackgroundOpacity(), 1, "Default value of the property backgroundOpacity is '1'");
	});

	QUnit.test("Try add detail page twice", function(assert) {
		var page = new Page("detail3");
		assert.strictEqual(this.sut.getDetailPages().length, 2, "initial detail pages are 2");

		this.sut.addDetailPage(page);
		assert.strictEqual(this.sut.getDetailPages().length, 3, "Now detail pages are 3");

		// try to add it again
		this.sut.addDetailPage(page);
		assert.strictEqual(this.sut.getDetailPages().length, 3, "Now details pages should remain 3");
	});

	QUnit.test("Destroy showMasterBtn during page navigation", function(assert){
		var done = assert.async();
		var oSplitContainer = new SplitContainer({
			detailNavigate: function(){
				assert.ok(this._oShowMasterBtn.bIsDestroyed, "showMasterBtn is destroyed with the customHeader together");
			},
			afterDetailNavigate: function(){
				assert.ok(!this._oShowMasterBtn.bIsDestroyed, "showMasterBtn should be recreated after page navigation");
				this.destroy();
				done();
			}
		});
		oSplitContainer.setMode(SplitAppMode.HideMode);

		var oPage1Header = new Bar({
			contentMiddle: new Label({
				text: "Page1"
			})
		});

		var oButton = new Button({
			text: "Go to Page 2",
			press: function() {
				oPage1Header.destroy();
				oSplitContainer.toDetail("page2");
			}
		});

		var oPage1 = new Page("page1", {
			customHeader: oPage1Header,
			content: oButton
		});

		var oPage2 = new Page("page2", {
			title: "Page 2"
		});

		oSplitContainer.addDetailPage(oPage1).addDetailPage(oPage2);

		oSplitContainer.placeAt("content");
		sap.ui.getCore().applyChanges();

		oButton.firePress();
	});

	QUnit.test("No endless rerendering triggered by invalidation after navigation", function(assert){
		var done = assert.async();
		var oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

		var oApp = new App();

		var oMasterPage = new Page({
			title: "master",
			showHeader: false,
			content: [
				new List({
					mode: "SingleSelectMaster",
					selectionChange: function(){
						oSC.toDetail("dpb");
					}
				})
			]
		});

		var oDetailPage1 = new Page({
			title: "Detail1",
			showHeader: false
		});

		var oDetailPage2 = new Page("dpb", {
			title: "Detail2",
			showHeader: false
		});

		var oSC = new SplitContainer({
			masterPages: [
				oMasterPage
			],
			detailPages: [
				oDetailPage1, oDetailPage2
			],
			mode: "HideMode"
		});

		var oPage = new Page( {
			title: "Initial Page",
			showNavButton: true,
			enableScrolling: false,
			navButtonPress: function(oEvent) {
				oSC.showMaster();
			},
			content : [
				oSC
			]
		});

		oApp.addPage(oPage);
		oApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oSpy = this.spy();
		oDetailPage2.addEventDelegate({
			onBeforeRendering: oSpy
		});

		var fnMasterClose = function() {
			oSC.detachAfterMasterClose(fnMasterClose);
			assert.equal(oSpy.callCount, 1, "invalidate should be called once after rendering");
			oApp.destroy();
			done();
		};

		var fnMasterOpen = function() {
			oSC.detachAfterMasterOpen(fnMasterOpen);
			var fnAfterNavigate = function() {
				oSC._oDetailNav.detachAfterNavigate(fnAfterNavigate);
				oSC.attachAfterMasterClose(fnMasterClose);
				oSC.hideMaster();
			};
			oSC._oDetailNav.attachAfterNavigate(fnAfterNavigate);
			oMasterPage.getContent()[0].fireSelectionChange();
		};

		oSC.attachAfterMasterOpen(fnMasterOpen);
		oSC.showMaster();
	});

	QUnit.test("Master button should be hidden in portrait mode with ShowHideMode", function(assert){
		var done = assert.async();
		var oLandscape = {
					landscape: true,
					portrait: false
				},
				oPortrait = {
					landscape: false,
					portrait: true
				},
				oSystem = {
					desktop: true,
					phone: false,
					tablet: false
				},
				oOldSystem = sap.ui.Device.system,
				oOldOrientation = sap.ui.Device.orientation;

		// manually stub the system object on sap.ui.Device
		sap.ui.Device.system = oSystem;
		// manually stub the orientation object on sap.ui.Device
		sap.ui.Device.orientation = oPortrait;


		var oSplitContainer = new SplitContainer({
			initialDetail: "page1",
			detailPages: [
				new Page("page1", {

				}),
				new Page("page2", {
					showNavButton: true
				})
			],
			afterDetailNavigate: function(oEvent) {
				var toId = oEvent.getParameter("toId"),
					isBack = oEvent.getParameter("isBack");
				if (toId === "page1" && isBack) {
					assert.ok(oSplitContainer._oShowMasterBtn.$().hasClass("sapMSplitContainerMasterBtnHidden"), "Master button should be hidden how");
					oSplitContainer.destroy();
					// restore the stubs
					sap.ui.Device.orientation = oOldOrientation;
					sap.ui.Device.system = oOldSystem;
					done();
				} else if (toId === "page2") {
					// manually sub the orientation object on sap.ui.Device
					sap.ui.Device.orientation = oLandscape;
					oSplitContainer._handleResize();
					oSplitContainer.backDetail();
				}
			}
		});

		oSplitContainer.placeAt("content");
		sap.ui.getCore().applyChanges();

		oSplitContainer.toDetail("page2");
	});

	QUnit.test("activeElement in master area should be blurred after master area is closed", function(assert){
		var done = assert.async();
		var oPortrait = {
				landscape: false,
				portrait: true
			}, oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oPortrait);

		var oInput = new Input();

		var oSplitContainer = new SplitContainer({
			masterPages: [
				new Page({
					content: oInput
				})
			],
			afterMasterOpen: function(){
				oInput.focus();
				assert.equal(oInput.getFocusDomRef(), document.activeElement, "Focus is set to input");
				oSplitContainer.hideMaster();
			},
			afterMasterClose: function(){
				assert.notEqual(oInput.getFocusDomRef(), document.activeElement, "Focus should be removed from the master area after master is closed");
				oSplitContainer.destroy();
				done();
			}
		});

		oSplitContainer.placeAt("content");
		sap.ui.getCore().applyChanges();

		oSplitContainer.showMaster();
	});

	QUnit.test("sap.ui.Device.resize event should be reacted also on phone", function(assert) {
		var oPortrait = {
				landscape: false,
				portrait: true
			}, oLandscape = {
				landscape: true,
				portrait: false
			}, oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oLandscape);

		var oSplitContainer = new SplitContainer();
		oSplitContainer._onOrientationChange = this.spy();
		oSplitContainer.placeAt("content");
		sap.ui.getCore().applyChanges();

		this.stub(Device, "orientation", oPortrait);
		oSplitContainer._fnResize();
		assert.equal(oSplitContainer._onOrientationChange.callCount, 1, "OrientationChange event should be reacted by the SplitContainer when runs on phone.");
		oSplitContainer.destroy();
	});

	QUnit.test("Navigate and afterNavigate events should work in phone also", function(assert){
		var oSystem = {
					desktop: false,
					phone: true,
					tablet: false
				},
				oOldSystem = sap.ui.Device.system,
				oOldOrientation = sap.ui.Device.orientation;

		// stub the system object on sap.ui.Device
		sap.ui.Device.system = oSystem;


		var oSplitContainer = new SplitContainer({
			initialDetail: "page1",
			detailPages: [
				new Page("page1", {

				}),
				new Page("page2", {
					showNavButton: true
				})
			]

		});

		oSplitContainer._handleNavigationEvent = this.spy();
		oSplitContainer.placeAt("content");
		sap.ui.getCore().applyChanges();

		oSplitContainer.toDetail("page2");
		assert.notEqual(oSplitContainer._handleNavigationEvent.callCount, 0, "Events work on the phone also.");

		oSplitContainer.destroy();
		sap.ui.Device.system = oOldSystem;
	});

	QUnit.test("Should show and hide a masterButton with a toolbar", function(assert) {
		// Arrange
		var oPortrait = {
				landscape: false,
				portrait: true
			},
			oLandscape = {
				landscape: true,
				portrait: false
			},
			oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			},
			oToolbar = new Toolbar();

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oPortrait);

		// System under test
		var oSplitContainer = new SplitContainer({
			mode : "ShowHideMode",
			detailPages : new Page({
				customHeader : oToolbar
			})
		});

		// Act + Render
		oSplitContainer.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		// Assert Button is shown
		assert.ok(oToolbar.getContent()[0].$(), "the master button is shown");


		// Act 2 - change orientation
		this.stub(Device, "orientation", oLandscape);
		oSplitContainer._fnResize();

		// Asset Button is removed
		assert.ok(!oToolbar.getContent()[0], "the master button is removed");

		oSplitContainer.destroy();
	});

	QUnit.test("Set custom header to current detail page after master button is already inserted", function(assert){
		var oPortrait = {
				landscape: false,
				portrait: true
			}, oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oPortrait);

		var oPage = new Page({
			title: "Detail Page"
		}), oSplitContainer = new SplitContainer({
			detailPages: [
				oPage
			]
		});

		oSplitContainer.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery.contains(oPage.getDomRef(), oSplitContainer._oShowMasterBtn.getDomRef()), "Master button is rendered");

		var oHeader = new Bar();
		oPage.setCustomHeader(oHeader);
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery.contains(oHeader.getDomRef(), oSplitContainer._oShowMasterBtn.getDomRef(), "Master button is inserted into the custom header"));

		oSplitContainer.removeDetailPage(oPage);
		assert.strictEqual(oPage.setCustomHeader, Page.prototype.setCustomHeader, "setCustomHeader function is restored after remove the Page from SplitContainer");

		oPage.destroy();
		oSplitContainer.destroy();
	});

	QUnit.test("Add NavContainer to detail area of SplitContainer and test the show/hide master button", function(assert) {
		// Arrange
		var oPortrait = {
				landscape: false,
				portrait: true
			},
			oLandscape = {
				landscape: true,
				portrait: false
			},
			oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			};

		// Manually create a SPY as sinon can't provide the full Event object
		var bMasterButtonVisible = null;
		var iCalled = 0;
		var onMasterButton = function (oEvent) {
			bMasterButtonVisible = oEvent.getParameter("show");
			iCalled++;
		};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oLandscape);

		// System under test
		var oPage = new Page("page1"),
				oNavContainer = new NavContainer({
					pages: oPage
				}),
				oSC = new SplitContainer({
					detailPages: oNavContainer,
					masterButton: onMasterButton
				});

		// Act
		oSC.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Act - Change Orientation to portrait
		this.stub(Device, "orientation", oPortrait);
		oSC._fnResize();
		sap.ui.getCore().applyChanges();

		// Assert - portrait orientation
		assert.ok(oPage._getAnyHeader(), "Header is in page");
		assert.strictEqual(oPage._getAnyHeader().getContentLeft()[0], oSC._oShowMasterBtn, "Master button is inserted into the page in nav container");
		assert.strictEqual(iCalled, 1, "Should fire masterButton event once");
		assert.ok(bMasterButtonVisible, "Should fire masterButton event with parameter 'show'=true");

		// Reset
		iCalled = 0;
		bMasterButtonVisible = null;

		// Act - Change Orientation to landscape
		this.stub(sap.ui.Device, "orientation", oLandscape);
		oSC._fnResize();
		sap.ui.getCore().applyChanges();

		// Assert - landscape orientation
		assert.strictEqual(iCalled, 1, "Should fire masterButton event once");
		assert.notOk(bMasterButtonVisible, "Should fire masterButton event with parameter 'show'=false");

		oSC.destroy();
	});

	QUnit.test("Overwrite and restore of methods on page in detail area of SplitContainer when not runs on phone", function(assert) {
		var oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

		var oPage = new Page(),
			oSC = new SplitContainer({
				detailPages: oPage
			});

		assert.notEqual(oPage.setCustomHeader, Page.prototype.setCustomHeader, "setCustomHeader should be overwritten");
		assert.notEqual(oPage.setShowNavButton, Page.prototype.setShowNavButton, "setShowNavButton should be overwritten");

		oSC.removeDetailPage(oPage);

		assert.strictEqual(oPage.setCustomHeader, Page.prototype.setCustomHeader, "setCustomHeader should be restored");
		assert.strictEqual(oPage.setShowNavButton, Page.prototype.setShowNavButton, "setShowNavButton should be restored");
	});

	QUnit.test("Functions on page shouldn't be patched when runs on phone", function(assert) {
		var oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

		var oPage = new Page(),
			oSC = new SplitContainer({
				detailPages: oPage
			});

		assert.strictEqual(oPage.setCustomHeader, Page.prototype.setCustomHeader, "setCustomHeader shouldn't be patched");
		assert.strictEqual(oPage.setShowNavButton, Page.prototype.setShowNavButton, "setShowNavButton shouldn't be patched");

		oSC.destroy();
	});

	QUnit.test("Hide hamburger button when page shows back button", function(assert) {
		var oPortrait = {
				landscape: false,
				portrait: true
			},
			oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oPortrait);

		var oPage = new Page(),
			oSC = new SplitContainer({
				detailPages: oPage
			});

		oSC.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(oSC._oShowMasterBtn.$().is(":visible"), "Master button is shown");

		oPage.setShowNavButton(true);
		sap.ui.getCore().applyChanges();

		assert.ok(oSC._oShowMasterBtn.$().is(":hidden"), "Master button is now hidden");

		oSC.destroy();
	});

	QUnit.test("Call preventDefault on masterNavigate or detailNavigate events should prevent the navigation", function(assert) {
		var oLandscape = {
				landscape: true,
				portrait: false
			},
			oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oLandscape);

		var oMasterPage1 = new Page("mp1"),
			oMasterPage2 = new Page("mp2"),
			oDetailPage1 = new Page("dp1"),
			oDetailPage2 = new Page("dp2"),
			oSC = new SplitContainer({
				defaultTransitionNameMaster: "show",
				defaultTransitionNameDetail: "show",
				masterPages: [oMasterPage1, oMasterPage2],
				detailPages: [oDetailPage1, oDetailPage2],
				masterNavigate: function(oEvent) {
					oEvent.preventDefault();
				},
				detailNavigate: function(oEvent) {
					oEvent.preventDefault();
				}
			});

		oSC.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.equal(oSC.getCurrentMasterPage().getId(), "mp1", "Current page in master is 'mp1'");
		assert.equal(oSC.getCurrentDetailPage().getId(), "dp1", "Current page in detail is 'dp1'");

		oSC.toMaster("mp2");
		assert.equal(oSC.getCurrentMasterPage().getId(), "mp1", "Current page in master is still 'mp1'");

		oSC.toDetail("dp2");
		assert.equal(oSC.getCurrentDetailPage().getId(), "dp1", "Current page in detail is still 'dp1'");

		oSC.destroy();
	});

	QUnit.test("Show hamburger button when there's INVISIBLE back button in detail page's header", function(assert) {
		var oPortrait = {
				landscape: false,
				portrait: true
			},
			oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oPortrait);

		var oMasterPage1 = new Page("mp1"),
			oDetailPage1 = new Page("dp1", {
				customHeader: new Bar({
					contentLeft: new Button({
						type: ButtonType.Back,
						text: "hidden button",
						visible: false
					})
				})
			}),
			oSC = new SplitContainer({
				masterPages: [oMasterPage1],
				detailPages: [oDetailPage1]
			});

		oSC.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oMasterButton = oSC._oShowMasterBtn;

		assert.ok(oMasterButton, "Hamburger button is created");
		assert.ok(oMasterButton.$().closest("#dp1").length, "master button is in detail page");

		oSC.destroy();
	});

	QUnit.test("restore the overwritten methods on pages when page is moved from splitcontainer to navcontainer", function(assert) {
		var oDetailPage = new Page(),
			oSplitContainer = new SplitContainer({
				detailPages: oDetailPage
			}),
			oNavContainer = new NavContainer();

		assert.notEqual(oDetailPage.setShowNavButton, Page.prototype.setShowNavButton, "function setShowNavButton is already overwritten");
		assert.notEqual(oDetailPage.setCustomHeader, Page.prototype.setCustomHeader, "function setCustomHeader is already overwritten");


		oNavContainer.addPage(oDetailPage);

		assert.strictEqual(oDetailPage.setShowNavButton, Page.prototype.setShowNavButton, "function setShowNavButtton is already restored");
		assert.strictEqual(oDetailPage.setCustomHeader, Page.prototype.setCustomHeader, "function setCustomHeader is already restored");


		oSplitContainer.addDetailPage(oDetailPage);

		assert.notEqual(oDetailPage.setShowNavButton, Page.prototype.setShowNavButton, "function setShowNavButton is overwritten again");
		assert.notEqual(oDetailPage.setCustomHeader, Page.prototype.setCustomHeader, "function setCustomHeader is overwritten again");

		oNavContainer.destroy();
		oSplitContainer.destroy();
	});

	QUnit.test("Switch between different modes", function(assert) {
		var done = assert.async();
		var oSplitContainer = new SplitContainer({
				masterPages: new Page(),
				detailPages: new Page()
			}),
			oSystem = {
				desktop: true,
				tablet: false,
				phone: false
			},
			oLandscape = {
				landscape: true,
				portrait: false
			},
			oPortrait = {
				landscape: false,
				portrait: true
			};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oLandscape);

		assert.equal(oSplitContainer.getMode(), SplitAppMode.ShowHideMode, "The default mode is showhide mode");
		oSplitContainer.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(oSplitContainer._oMasterNav.hasStyleClass("sapMSplitContainerMasterVisible"), "visible class is set to master");
		assert.ok(!oSplitContainer._oMasterNav.hasStyleClass("sapMSplitContainerMasterHidden"), "hidden class isn't set to master");
		assert.ok(oSplitContainer._bMasterisOpen, "flag of whether master is open is set");

		oSplitContainer.setMode(SplitAppMode.HideMode);
		assert.ok(!oSplitContainer._oMasterNav.hasStyleClass("sapMSplitContainerMasterVisible"), "hidden class is set to master after switching to HideMode");
		assert.ok(oSplitContainer._oMasterNav.hasStyleClass("sapMSplitContainerMasterHidden"), "visible class is removed from master after switching to HideMode");
		assert.ok(!oSplitContainer._bMasterisOpen, "flag of whether master is open is correctly maintained after switching to HideMode");

		oSplitContainer.showMaster();
		assert.ok(oSplitContainer._oMasterNav.hasStyleClass("sapMSplitContainerMasterVisible"), "visible class is set to master");
		assert.ok(!oSplitContainer._oMasterNav.hasStyleClass("sapMSplitContainerMasterHidden"), "hidden class isn't set to master");

		oSplitContainer.attachAfterMasterOpen(function() {
			var oOldOrientation = sap.ui.Device.orientation;
			sap.ui.Device.orientation = oPortrait;
			oSplitContainer._handleResize();

			oSplitContainer.setMode(SplitAppMode.ShowHideMode);
			qutils.triggerEvent("tap", oSplitContainer._oDetailNav.getDomRef());
			assert.ok(!oSplitContainer._oMasterNav.hasStyleClass("sapMSplitContainerMasterVisible"), "hidden class isn't set to master");
			assert.ok(oSplitContainer._oMasterNav.hasStyleClass("sapMSplitContainerMasterHidden"), "hidden class is set to master");

			oSplitContainer.destroy();
			sap.ui.Device.orientation = oOldOrientation;
			done();
		});
	});

	QUnit.test("Initialize the SplitContainer in portrait mode and switch to landscape, the sapMSplitContainerPortrait class should be correctly removed", function(assert) {
		var oSystem = {
				desktop: true,
				tablet: false,
				phone: false
			},
			oLandscape = {
				landscape: true,
				portrait: false
			},
			oPortrait = {
				landscape: false,
				portrait: true
			};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oPortrait);

		var oSplitContainer = new SplitContainer({
			masterPages: new Page(),
			detailPages: new Page()
		});

		oSplitContainer.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(oSplitContainer.$().hasClass("sapMSplitContainerPortrait"), "The sapMSplitContainerPortrait class should be output to the DOM node");

		this.stub(Device, "orientation", oLandscape);
		oSplitContainer._handleResize();

		assert.ok(!oSplitContainer.$().hasClass("sapMSplitContainerPortrait"), "The sapMSplitContainerPortrait class should be removed from the DOM node");

		oSplitContainer.destroy();
	});

	QUnit.test("MasterButtonTooltip Property", function(assert) {

		var oTooltip = 'Custom Tooltip';

		this.sut.setMasterButtonTooltip(oTooltip);

		this.sut.placeAt('content');
		sap.ui.getCore().applyChanges();

		assert.ok(this.sut._oShowMasterBtn.getTooltip() == oTooltip, 'Tooltip is correct');
	});

	QUnit.test("showMaster/hideMaster doesn't crash when _oMasterNav hasn't been rendered", function (assert) {
		var done = assert.async();

		var oPage = new Page();
		var oSplitContainer = new SplitContainer({
			masterPages: [oPage]
		});

		// Do not place on page. so _oMasterNav won't have dom ref

		oSplitContainer.showMaster();
		assert.ok(true);
		oSplitContainer.hideMaster();
		assert.ok(true);

		done();
	});
	QUnit.module("SplitContainer Navigation test", {
		beforeEach : function () {
			this.sut = splitContainerSetup();
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.sut.destroy();
			this.sut = null;
		}
	});

	QUnit.test("Test go to page navigation", function(assert) {
		var MASTER_PAGE_ID = "master3",
			DETAIL_PAGE_ID = "detail3";
		//test master page navigation
		var page = new Page(MASTER_PAGE_ID);
		this.sut.addMasterPage(page);
		this.sut.to(MASTER_PAGE_ID);
		assert.deepEqual(this.sut.getCurrentMasterPage(), page, "Current page should be master3");

		//test detail page navigation
		page = new Page(DETAIL_PAGE_ID);
		this.sut.addDetailPage(page);
		this.sut.to(DETAIL_PAGE_ID);
		assert.deepEqual(this.sut.getCurrentDetailPage(), page, "Current page should be detail3");
	});

	QUnit.test("Test backToPage ", function(assert) {
		var MASTER_PAGE_ID = "master2",
			DETAIL_PAGE_ID = "detail2";
		//test master page navigation

		this.sut.to(MASTER_PAGE_ID);
		this.sut.to("master");
		this.sut.backToPage(MASTER_PAGE_ID);
		assert.strictEqual(this.sut.getCurrentMasterPage().sId, MASTER_PAGE_ID, "Current page should be master2");

		//test detail page navigation
		this.sut.to(DETAIL_PAGE_ID);
		this.sut.to("detail");
		this.sut.backToPage(DETAIL_PAGE_ID);
		assert.strictEqual(this.sut.getCurrentDetailPage().sId, DETAIL_PAGE_ID, "Current page should be detail2");
	});

	QUnit.test("Test insertPreviousPage ", function(assert) {
		var MASTER_PAGE_ID = "master2",
			DETAIL_PAGE_ID = "detail2";
		//test master page navigation

		this.sut.insertPreviousPage(MASTER_PAGE_ID);
		this.sut.to("master");
		this.sut.backToPage(MASTER_PAGE_ID);
		assert.strictEqual(this.sut.getCurrentMasterPage().sId, MASTER_PAGE_ID, "Current page should be master2");

		//test detail page navigation
		this.sut.insertPreviousPage(DETAIL_PAGE_ID);
		this.sut.to("detail");
		this.sut.backToPage(DETAIL_PAGE_ID);
		assert.strictEqual(this.sut.getCurrentDetailPage().sId, DETAIL_PAGE_ID, "Current page should be detail2");
	});

	QUnit.test("Test backMaster  ", function(assert) {
		var MASTER_PAGE_ID = "master2";
		//test master page navigation

		this.sut.to(MASTER_PAGE_ID);
		this.sut.to("master");
		this.sut.backMaster();
		assert.strictEqual(this.sut.getCurrentMasterPage().sId, MASTER_PAGE_ID, "Current page should be master2");
	});

	QUnit.test("Test backMasterToPage", function(assert) {
		var MASTER_PAGE_ID = "master2";

		this.sut.to(MASTER_PAGE_ID);
		this.sut.to("master");
		this.sut.backMasterToPage(MASTER_PAGE_ID);
		assert.strictEqual(this.sut.getCurrentMasterPage().sId, MASTER_PAGE_ID, "Current page should be master2");
	});

	QUnit.test("Test backDetailToPage  ", function(assert) {
		var DETAIL_PAGE_ID = "detail2";

		//test detail page navigation
		this.sut.to(DETAIL_PAGE_ID);
		this.sut.to("detail");
		this.sut.backDetailToPage(DETAIL_PAGE_ID);
		assert.strictEqual(this.sut.getCurrentDetailPage().sId, DETAIL_PAGE_ID, "Current page should be detail2");
	});

	QUnit.test("Test backToTopDetail   ", function(assert) {
		var DETAIL_PAGE_ID = "detail";

		//test detail page navigation
		this.sut.to(DETAIL_PAGE_ID);
		this.sut.to("detail2");
		this.sut.backToTopDetail();
		assert.strictEqual(this.sut.getCurrentDetailPage().sId, DETAIL_PAGE_ID, "Current page should be detail");
	});

	QUnit.test("Test backToTopMaster ", function(assert) {
		var MASTER_PAGE_ID = "master";

		this.sut.to(MASTER_PAGE_ID);
		this.sut.to("master2");
		this.sut.backToTopMaster();
		assert.strictEqual(this.sut.getCurrentMasterPage().sId, MASTER_PAGE_ID, "Current page should be master");
	});

	QUnit.test("Mater button tooltip updating", function(assert) {

		this.sut.placeAt('content');
		sap.ui.getCore().applyChanges();

		assert.equal(this.sut._oShowMasterBtn.getTooltip(), 'Show Master 1 Page ', 'Initial tooltip is correct');

		this.sut.to('master2', 'show');
		sap.ui.getCore().applyChanges();
		assert.equal(this.sut._oShowMasterBtn.getTooltip(), 'Show Master 2 Page ', 'Initial tooltip is correct');
	});

	QUnit.test("Show and hide master navigation several times", function(assert) {
		var done = assert.async();

		var oSplitContainer = new SplitContainer({
				masterPages: new Page(),
				detailPages: new Page(),
				mode: "HideMode"
			}),
			oPage = new Page({
				content: oSplitContainer
			}),
			oApp = new App({
				pages: oPage
			});

		oApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		var iHidesCounter = 0,
			iDesiredHides = 3;

		var fnOnOpen = function() {
			assert.ok(oSplitContainer._oMasterNav.hasStyleClass("sapMSplitContainerMasterVisible"), "Master should be visible after open");
			assert.ok(oSplitContainer._bMasterisOpen, "The flag 'master is open' is true after open");

			if (iHidesCounter < iDesiredHides) {
				oSplitContainer.hideMaster();
			}
		};

		var fnOnClose = function() {
			iHidesCounter++;

			assert.ok(oSplitContainer._oMasterNav.hasStyleClass("sapMSplitContainerMasterHidden"), "Master should not be visible after close");
			assert.ok(oSplitContainer._bMasterisOpen === false, "The flag 'master is open' is false after close");

			if (iHidesCounter < iDesiredHides) {
				oSplitContainer.showMaster();
			} else {
				oApp.destroy();
				done();
			}
		};

		oSplitContainer.attachAfterMasterOpen(fnOnOpen);
		oSplitContainer.attachAfterMasterClose(fnOnClose);

		oSplitContainer.showMaster();
	});

	QUnit.module("SplitContainer public API test", {
		beforeEach : function () {
			this.sut = splitContainerSetup();
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.sut.destroy();
			this.sut = null;
		}
	});

	QUnit.test("Test indexOfMasterPage ", function(assert) {
		var MASTER_PAGE_ID = "master3",
			page = new Page(MASTER_PAGE_ID);

		this.sut.addMasterPage(page);

		assert.strictEqual(this.sut.indexOfMasterPage(page), 2, "Index should be 2");
	});

	QUnit.test("Test indexOfDetailPage ", function(assert) {
		var page = page = new Page("detail3");

		this.sut.addDetailPage(page);
		assert.strictEqual(this.sut.indexOfDetailPage(page), 2, "Index should be 2");
	});

	QUnit.test("Test addPage ", function(assert) {
		var page = new Page("alabala");

		this.sut.addPage(page, true);

		assert.strictEqual(this.sut.indexOfMasterPage(page), 2, "Index should be 2");
		assert.strictEqual(this.sut.getMasterPages().length, 3, "Master pages now are 3");

		// remove page
		this.sut.removeMasterPage(page, true);
		assert.strictEqual(this.sut.getMasterPages().length, 2, "Master pages now are 2");

		// add Detail Page
		this.sut.addPage(page, false);
		assert.strictEqual(this.sut.getDetailPages().length, 3, "Detail pages now are 3");
	});

	QUnit.test("Test getCurrentPage ", function(assert) {
		assert.strictEqual(this.sut.getCurrentPage(true).sId, "master", "Current master page is 'master'");

		assert.strictEqual(this.sut.getCurrentPage(false).sId, "detail", "Current detail page is 'detail'");
	});

	QUnit.test("Test getPreviousPage ", function(assert) {
		this.sut.to("master2");
		assert.strictEqual(this.sut.getPreviousPage(true).sId, "master", "Current master page is 'master'");

		this.sut.to("detail2");
		assert.strictEqual(this.sut.getPreviousPage(false).sId, "detail", "Current detail page is 'detail'");
	});

	QUnit.test("Test getMasterPage / getDetailPage ", function(assert) {
		var PAGE_ID1 = "master",
			PAGE_ID2 = "detail";

		assert.strictEqual(this.sut.getMasterPage(PAGE_ID1).sId, PAGE_ID1, "Expected page is is 'master'");

		assert.strictEqual(this.sut.getDetailPage(PAGE_ID2).sId, PAGE_ID2, "Expected page is is 'detail'");
	});

	QUnit.test("Test getPage ", function(assert) {
		var PAGE_ID1 = "master",
				PAGE_ID2 = "detail";

		assert.strictEqual(this.sut.getPage(PAGE_ID1, true).sId, PAGE_ID1, "Expected page is is 'master'");

		assert.strictEqual(this.sut.getPage(PAGE_ID2, false).sId, PAGE_ID2, "Expected page is is 'detail'");
	});

	QUnit.test("getDetailPages", function (assert) {
		// Assert
		assert.notEqual(this.sut.getDetailPages(), this.sut.getDetailPages(), "getDetailPages should return a copy of the detail pages.");
	});

	QUnit.test("getMasterPages", function (assert) {
		// Assert
		assert.notEqual(this.sut.getMasterPages(), this.sut.getMasterPages(), "getMasterPages should return a copy of the master pages.");
	});

	QUnit.module("Remove All pages API test", {
		beforeEach : function () {
			this.sut = splitContainerSetup(true);
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.sut.destroy();
			this.sut = null;
		}
	});

	QUnit.test("Test insertDetailPage / removeAllDetailPages ", function(assert) {
		var page = new Page("detail3");

		this.sut.insertDetailPage(page, 0, true);

		assert.strictEqual(this.sut.indexOfDetailPage(page), 0, "Index should be 0");
		assert.strictEqual(this.sut.getDetailPages().length, 1, "Detail pages now are 1");

		// remove all detail pages
		this.sut.removeAllDetailPages(false);
		assert.strictEqual(this.sut.getDetailPages().length, 0, "Detail pages now are 0");
	});

	QUnit.test("Test insertMasterPage / removeMasterPage / removeAllMasterPages ", function(assert) {
		var page = new Page("master3");

		this.sut.insertMasterPage(page, 0, true);

		assert.strictEqual(this.sut.indexOfMasterPage(page), 0, "Index should be 0");
		assert.strictEqual(this.sut.getMasterPages().length, 1, "Master pages now are 1");

		// remove page
		this.sut.removeMasterPage(page, true);
		assert.strictEqual(this.sut.getMasterPages().length, 0, "Master pages now are 0");

		// remove all master pages
		this.sut.insertMasterPage(page, 0, true);
		this.sut.removeAllMasterPages(false);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.sut.getMasterPages().length, 0, "Master pages now are 0");
	});

	QUnit.module("Add master and detail pages");

	QUnit.test("Test pages order", function(assert) {
		//arrange
		var oSystem = {
			desktop: false,
			phone: true,
			tablet: false
		};

		this.stub(Device, "system", oSystem);

		this.sut = new SplitContainer({
			initialMaster : "master2",
			detailPages : new Page("detail", {
				title : "detail"
			}),
			masterPages : [
				new Page("master1", { title : "master1"}),
				new Page("master2", { title : "master2"})
			]
		});

		var oMasterPage1 = sap.ui.getCore().byId("master1");

		//assert
		assert.strictEqual(this.sut._oMasterNav.getPages()[0].getId(), "master1", "First page should be master1");
		assert.strictEqual(this.sut._oDetailNav.getPages()[0].getId(), "master1", "First page should be master1");
	});

	QUnit.test("Test pages order in 'HideMode'" , function(assert) {
		//arrange
		var oSystem = {
			desktop: false,
			phone: true,
			tablet: false
		};

		this.stub(Device, "system", oSystem);

		this.sut = new SplitContainer({
			mode:"HideMode",
			detailPages : new Page("detailMobile", {
				title : "detail"
			}),
			masterPages : [
				new Page("master1Mobile", { title : "master1Mobile"}),
				new Page("master2Mobile", { title : "master2Mobile"})
			]
		});
		sap.ui.getCore().applyChanges();

		// force invalidation of the detail page
		this.sut.getDetailPages()[0].addContent(new Label({text:"test content"}));
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(this.sut._oMasterNav.getInitialPage(), "detailMobile", "First page should be detail");

	});

	QUnit.test("Detail pages via model", function (assert) {
		// Arrange
		var oModel1 = new JSONModel({
			"Pages": [
				{ title: "1" },
				{ title: "2" },
				{ title: "3" },
				{ title: "4" },
				{ title: "5" }
			]
		});

		var oModel2 = new JSONModel({
			"Pages": [
				{ title: "6" }
			]
		});

		var oSplitContainer = new SplitContainer();
		oSplitContainer.bindAggregation("detailPages", {
			path: "/Pages",
			template: new sap.m.Page({ title: "{title}" })
		});

		// Act
		oSplitContainer.setModel(oModel1);

		// Assert
		assert.equal(oSplitContainer.getDetailPages().length, 5, "Detail pages should be properly set through the model.");

		// Act
		oSplitContainer.setModel(oModel2);
		assert.equal(oSplitContainer.getDetailPages().length, 1, "Detail pages should be properly set through the model.");

	});
});