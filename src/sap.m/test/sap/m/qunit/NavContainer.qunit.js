/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Popup",
	"sap/m/NavContainer",
	"sap/m/Page",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/PageRenderer",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/Dialog",
	"sap/base/Log",
	"sap/ui/util/Mobile",
	"sap/ui/core/Core",
	"sap/ui/Device"
], function(
	qutils,
	createAndAppendDiv,
	jQuery,
	Popup,
	NavContainer,
	Page,
	Popover,
	Button,
	PageRenderer,
	Label,
	Input,
	Text,
	Dialog,
	Log,
	Mobile,
	Core,
	Device
) {
	createAndAppendDiv("content");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		"#content {" +
		"	height: 100%;" +
		"}" +
		"#mSAPUI5SupportMessage {" +
		"	display: none !important;" +
		"}";
	document.head.appendChild(styleElement);



	Mobile.init();

	window.expectedNav = {};
	window.mPage1EventLog = {};
	window.mPage2EventLog = {};
	window.mPage3EventLog = {};

	function resetEventLog(mLog) {
		mLog.beforeFirstShow = 0;
		mLog.beforeShow = 0;
		mLog.afterShow = 0;
		mLog.beforeHide = 0;
		mLog.afterHide = 0;
		mLog.data = null;
		mLog.backData = null;
	}


	function handleNavEvent(evt) {
		assert.equal(evt.getParameter("fromId"), window.expectedNav.fromId, "fromId should be correct");
		assert.equal(evt.getParameter("toId"), window.expectedNav.toId, "toId should be correct");
		assert.equal(evt.getParameter("firstTime"), window.expectedNav.firstTime, "firstTime should be correct");
		assert.equal(evt.getParameter("isTo"), window.expectedNav.isTo, "isTo should be correct");
		assert.equal(evt.getParameter("isBack"), window.expectedNav.isBack, "isBack should be correct");
		assert.equal(evt.getParameter("isBackToPage"), window.expectedNav.isBackToPage, "isBackToPage should be correct");
		assert.equal(evt.getParameter("isBackToTop"), window.expectedNav.isBackToTop, "isBackToTop should be correct");
		assert.equal(evt.getParameter("direction"), window.expectedNav.direction, "direction should be correct");
	}

	function getDelegate(mLog) {
		return {
			onBeforeFirstShow: function (evt) {
				mLog.beforeFirstShow++;
			},
			onBeforeShow: function (evt) {
				mLog.beforeShow++;
				mLog.data = evt.data;
				mLog.backData = evt.backData;
			},
			onAfterShow: function (evt) {
				mLog.afterShow++;
			},
			onBeforeHide: function (evt) {
				mLog.beforeHide++;
			},
			onAfterHide: function (evt) {
				mLog.afterHide++;
			}
		};
	}


	var nc = new NavContainer("myNC",{
		initialPage: "page1",
		navigate: handleNavEvent,
		afterNavigate: handleNavEvent,
		pages: [
			new Page("page1", {
				title: "Page 1"
			}).addEventDelegate(getDelegate(window.mPage1EventLog)),
			new Page("page3", { // page 2 will be inserted later
				title: "Page 3"
			}).addEventDelegate(getDelegate(window.mPage3EventLog))
		]
	}).insertPage(new Page("page2", {
		title: "Page 2"
	}).addEventDelegate(getDelegate(window.mPage2EventLog)), 1);

	var page1 = Core.byId("page1"),
		page2 = Core.byId("page2"),
		page3 = Core.byId("page3");

	resetEventLog(window.mPage1EventLog);
	resetEventLog(window.mPage2EventLog);
	resetEventLog(window.mPage3EventLog);

	nc.placeAt("content");

	var nc2 = new NavContainer("nc2", {
		pages: [
			new Page(),
			new Page()
		],
		visible: false
	});
	nc2.placeAt("content");


	jQuery(document).ready(function() {

	});



	//** START OF TESTS ***

	QUnit.module("Initial");

	QUnit.test("NavContainer rendered", function(assert) {

		assert.equal(window.mPage1EventLog.beforeFirstShow, 1, "Lifecycle event invocation count page1 beforeFirstShow should be correct");
		assert.equal(window.mPage1EventLog.beforeShow, 1, "Lifecycle event invocation count page1 beforeShow should be correct");
		assert.equal(window.mPage1EventLog.afterShow, 1, "Lifecycle event invocation count page1 afterShow should be correct");
		assert.equal(window.mPage1EventLog.beforeHide, 0, "Lifecycle event invocation count page1 beforeHide should be correct");
		assert.equal(window.mPage1EventLog.afterHide, 0, "Lifecycle event invocation count page1 afterHide should be correct");

		assert.equal(window.mPage2EventLog.beforeFirstShow, 0, "Lifecycle event invocation count page2 beforeFirstShow should be correct");
		assert.equal(window.mPage2EventLog.beforeShow, 0, "Lifecycle event invocation count page2 should be correct");
		assert.equal(window.mPage2EventLog.afterShow, 0, "Lifecycle event invocation count page2 should be correct");
		assert.equal(window.mPage2EventLog.beforeHide, 0, "Lifecycle event invocation count page2 should be correct");
		assert.equal(window.mPage2EventLog.afterHide, 0, "Lifecycle event invocation count page2 should be correct");

		assert.equal(window.mPage3EventLog.beforeFirstShow, 0, "Lifecycle event invocation count page3 beforeFirstShow should be correct");
		assert.equal(window.mPage3EventLog.beforeShow, 0, "Lifecycle event invocation count page3 beforeShow should be correct");
		assert.equal(window.mPage3EventLog.afterShow, 0, "Lifecycle event invocation count page3 afterShow should be correct");
		assert.equal(window.mPage3EventLog.beforeHide, 0, "Lifecycle event invocation count page3 beforeHide should be correct");
		assert.equal(window.mPage3EventLog.afterHide, 0, "Lifecycle event invocation count page3 afterHide should be correct");

		assert.ok(document.getElementById("myNC"), "NavContainer should be rendered");
		assert.ok(!document.getElementById("nc2"), "NavContainer 2 should not be rendered");
		assert.ok(document.getElementById("page1"), "Initially the first page should be rendered");
		assert.equal(nc.getCurrentPage().getId(), "page1", "getCurrentPage should return Page1");
		assert.equal(nc._pageStack.length, 1, "the page stack size should be 1");

		assert.equal(nc._aQueue.length, 0, "transition queue length should be 0");
		assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");
	});

	QUnit.module("AutoFocus tests", {
		beforeEach: function () {
			this.sinon = sinon.sandbox.create();
			this.spy = this.sinon.spy(NavContainer, "_applyAutoFocusTo");
			this.pageId = "someId";
		},
		afterEach: function () {
			this.sinon.restore();
		}
	});

	QUnit.test("Auto focus enabled", function (assert) {
		this.sinon.stub(nc, "getAutoFocus").returns(true);

		nc._applyAutoFocus({
			isTo: true,
			toId: this.pageId,
			bFocusInsideFromPage: true
		});

		assert.ok(this.spy.calledWith(this.pageId));

		this.spy.reset();

		nc._applyAutoFocus({
			isBack: true,
			toId: this.pageId,
			bFocusInsideFromPage: true
		});

		assert.ok(this.spy.calledWith(this.pageId));

		this.spy.reset();

		nc._applyAutoFocus({
			isBackToPage: true,
			toId: this.pageId,
			bFocusInsideFromPage: true
		});

		assert.ok(this.spy.calledWith(this.pageId));

		this.spy.reset();

		nc._applyAutoFocus({
			isBackToTop: true,
			toId: this.pageId,
			bFocusInsideFromPage: true
		});

		assert.ok(this.spy.calledWith(this.pageId));

		this.spy.reset();

		nc._applyAutoFocus({
			isTo: false,
			toId: this.pageId,
			bFocusInsideFromPage: true
		});

		assert.ok(!this.spy.calledWith(this.pageId));
	});

	QUnit.test("Auto focus disabled", function (assert) {
		// Arrange
		var oApplyAutoFocusSpy = sinon.spy(NavContainer.prototype, "_applyAutoFocus"),
			fnDone = assert.async(),
			oNavContainer = new NavContainer({
				pages : [
					new Page("firstPage"),
					new Page("secondPage")
				],
				autoFocus: false,
				afterNavigate: function() {
					// Assert
					assert.strictEqual(oApplyAutoFocusSpy.callCount, 0,
							"_applyAutoFocus is never called when autoFocus property is false.");

					// Cleanup
					oApplyAutoFocusSpy.restore();
					oNavContainer.destroy();

					fnDone();
				}
			}).placeAt("qunit-fixture");

		assert.expect(1);
		Core.applyChanges();

		// Act
		oNavContainer.to("secondPage");
	});

	QUnit.test("Auto focus should't be used when inside a popup", function (assert) {
		var oNavContainer = new NavContainer();
		new Popover({content: new Page({content: [oNavContainer]})});
		assert.ok(oNavContainer._isInsideAPopup(), "NavContainer detects that it's nested inside a popup");
	});

	QUnit.test("_applyAutoFocusTo method should't be called when the focus was not on from page", function (oAssert) {
		var oNC = new NavContainer();

		// Act
		oNC._applyAutoFocus({
			isTo: true,
			toId: this.pageId,
			bFocusInsideFromPage: false // We emulate focus not inside the current page
		});

		// Assert
		oAssert.strictEqual(this.spy.callCount, 0,
			"The method should not be called when focus is not inside the current page");

		// Act
		oNC._applyAutoFocus({
			isTo: true,
			toId: this.pageId,
			bFocusInsideFromPage: true // We emulate focus inside the current page
		});

		// Assert
		oAssert.strictEqual(this.spy.callCount, 1,
			"The method should be called when focus is inside the current page");
	});

	QUnit.test("Auto focus should't be modified when the focus was not inside the current page", function (oAssert) {
		// Arrange
		var fnDone = oAssert.async(),
			oOutsideButton = new Button({text: "Outside Button"}).placeAt("qunit-fixture"),
			oInsideButton = new Button({text: "Inside Button"}),
			oNavContainer = new NavContainer({
				pages : [
					new Page("firstPage"),
					new Page("secondPage", { content : [oInsideButton] })
				]
			}).placeAt("qunit-fixture");

		Core.applyChanges();

		oNavContainer.attachNavigate(function (oEvent) {
			// Assert
			oAssert.strictEqual(oEvent.getParameter("bFocusInsideFromPage"), false,
				"The bFocusInsideFromPage parameter should be false as focus is outside the current page");

			oAssert.strictEqual(document.activeElement, oOutsideButton.getDomRef(),
				"The focus should remain on the outside button");

			oAssert.notStrictEqual(document.activeElement, oInsideButton.getDomRef(),
				"The focus should not be moved to the inside button");

			fnDone();
		});

		// Act - place focus outside the Nav container current page and navigate to second page
		oOutsideButton.$().focus();
		oNavContainer.to("secondPage");

		// Cleanup
		oOutsideButton.destroy();
		oNavContainer.destroy();
	});

	QUnit.module("Page change");

	QUnit.test("to page 2", function(assert) {
		var done = assert.async();
		assert.expect(64); // including the "navigate" event

		assert.equal(nc.currentPageIsTopPage(), true, "current page should be considered the top page");

		resetEventLog(window.mPage1EventLog);
		resetEventLog(window.mPage2EventLog);
		resetEventLog(window.mPage3EventLog);

		window.expectedNav = {
				fromId: "page1",
				toId: "page2",
				firstTime: true,
				isTo: true,
				isBack: false,
				isBackToPage: false,
				isBackToTop: false,
				direction: "to"
		};

		nc.to("page2", {transferData:"test123"});

		assert.equal(nc.currentPageIsTopPage(), false, "current page should not be considered the top page");

		assert.ok(nc._bNavigating === true, "NavContainer should be navigating");

		assert.equal(window.mPage1EventLog.beforeFirstShow, 0, "Lifecycle event invocation count page1 beforeFirstShow should be correct");
		assert.equal(window.mPage1EventLog.beforeShow, 0, "Lifecycle event invocation count page1 beforeShow should be correct");
		assert.equal(window.mPage1EventLog.afterShow, 0, "Lifecycle event invocation count page1 afterShow should be correct");
		assert.equal(window.mPage1EventLog.beforeHide, 1, "Lifecycle event invocation count page1 beforeHide should be correct");
		assert.equal(window.mPage1EventLog.afterHide, 0, "Lifecycle event invocation count page1 afterHide should be correct");

		assert.equal(window.mPage2EventLog.beforeFirstShow, 1, "Lifecycle event invocation count page2 beforeFirstShow should be correct");
		assert.equal(window.mPage2EventLog.beforeShow, 1, "Lifecycle event invocation count page2 should be correct");
		assert.equal(window.mPage2EventLog.afterShow, 0, "Lifecycle event invocation count page2 should be correct");
		assert.equal(window.mPage2EventLog.beforeHide, 0, "Lifecycle event invocation count page2 should be correct");
		assert.equal(window.mPage2EventLog.afterHide, 0, "Lifecycle event invocation count page2 should be correct");

		assert.equal(window.mPage3EventLog.beforeFirstShow, 0, "Lifecycle event invocation count page3 beforeFirstShow should be correct");
		assert.equal(window.mPage3EventLog.beforeShow, 0, "Lifecycle event invocation count page3 beforeShow should be correct");
		assert.equal(window.mPage3EventLog.afterShow, 0, "Lifecycle event invocation count page3 afterShow should be correct");
		assert.equal(window.mPage3EventLog.beforeHide, 0, "Lifecycle event invocation count page3 beforeHide should be correct");
		assert.equal(window.mPage3EventLog.afterHide, 0, "Lifecycle event invocation count page3 afterHide should be correct");

		assert.equal(window.mPage1EventLog.data, null, "Data given to page1 should be correct");
		assert.equal(window.mPage1EventLog.backData, null, "BackData given to page1 should be correct");
		assert.equal(window.mPage2EventLog.data.transferData, "test123", "Data given to page2 should be correct");
		assert.ok(!!window.mPage2EventLog.backData, "BackData given to page2 should be correct");
		assert.equal(window.mPage3EventLog.data, null, "Data given to page3 should be correct");
		assert.equal(window.mPage3EventLog.backData, null, "BackData given to page3 should be correct");

		setTimeout(function() {
			assert.ok(document.getElementById("page1"), "Page 1 should still be in DOM");
			assert.ok(document.getElementById("page2"), "Page 2 should now be rendered");
			assert.equal(nc.getCurrentPage().getId(), "page2", "getCurrentPage should return Page 2");
			assert.equal(nc._pageStack.length, 2, "the page stack size should be 2");

			setTimeout(function() {

				assert.equal(window.mPage1EventLog.beforeFirstShow, 0, "Lifecycle event invocation count page1 beforeFirstShow should be correct");
				assert.equal(window.mPage1EventLog.beforeShow, 0, "Lifecycle event invocation count page1 beforeShow should be correct");
				assert.equal(window.mPage1EventLog.afterShow, 0, "Lifecycle event invocation count page1 afterShow should be correct");
				assert.equal(window.mPage1EventLog.beforeHide, 1, "Lifecycle event invocation count page1 beforeHide should be correct");
				assert.equal(window.mPage1EventLog.afterHide, 1, "Lifecycle event invocation count page1 afterHide should be correct");

				assert.equal(window.mPage2EventLog.beforeFirstShow, 1, "Lifecycle event invocation count page2 beforeFirstShow should be correct");
				assert.equal(window.mPage2EventLog.beforeShow, 1, "Lifecycle event invocation count page2 should be correct");
				assert.equal(window.mPage2EventLog.afterShow, 1, "Lifecycle event invocation count page2 should be correct");
				assert.equal(window.mPage2EventLog.beforeHide, 0, "Lifecycle event invocation count page2 should be correct");
				assert.equal(window.mPage2EventLog.afterHide, 0, "Lifecycle event invocation count page2 should be correct");

				assert.equal(window.mPage3EventLog.beforeFirstShow, 0, "Lifecycle event invocation count page3 beforeFirstShow should be correct");
				assert.equal(window.mPage3EventLog.beforeShow, 0, "Lifecycle event invocation count page3 beforeShow should be correct");
				assert.equal(window.mPage3EventLog.afterShow, 0, "Lifecycle event invocation count page3 afterShow should be correct");
				assert.equal(window.mPage3EventLog.beforeHide, 0, "Lifecycle event invocation count page3 beforeHide should be correct");
				assert.equal(window.mPage3EventLog.afterHide, 0, "Lifecycle event invocation count page3 afterHide should be correct");

				assert.equal(jQuery("#page1").css("display"), "none", "Page 1 should be hidden");
				assert.equal(nc._aQueue.length, 0, "transition queue length should be 0");
				assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");
				assert.ok(!page1.$().hasClass("sapMNavItemSliding"), "Page 1 classes should be cleaned up");
				assert.ok(!page2.$().hasClass("sapMNavItemSliding"), "Page 2 classes should be cleaned up");
				done();
			}, 600);
		}, 100);
	});

	QUnit.test("to page 3", function(assert) {
		var done = assert.async();
		assert.expect(30); // including the "navigate" event

		assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");

		window.expectedNav = {
				fromId: "page2",
				toId: "page3",
				firstTime: true,
				isTo: true,
				isBack: false,
				isBackToPage: false,
				isBackToTop: false,
				direction: "to"
		};

		nc.to("page3", "fade");

		assert.equal(nc.currentPageIsTopPage(), false, "current page should not be considered the top page");

		// more data checks
		assert.equal(window.mPage1EventLog.data, null, "Data given to page1 should be correct");
		assert.equal(window.mPage1EventLog.backData, null, "BackData given to page1 should be correct");
		assert.ok(!!window.mPage3EventLog.data, "Data given to page3 should be correct");
		assert.ok(!!window.mPage3EventLog.backData, "BackData given to page3 should be correct");

		setTimeout(function() {
			assert.ok(document.getElementById("page2"), "Page 2 should still be in DOM");
			assert.ok(document.getElementById("page3"), "Page 3 should now be rendered");
			assert.equal(nc.getCurrentPage().getId(), "page3", "getCurrentPage should return Page 3");
			assert.equal(nc._pageStack.length, 3, "the page stack size should be 3");

			setTimeout(function(){
				assert.equal(jQuery("#page2").css("display"), "none", "Page 2 should be hidden");
				assert.equal(nc._aQueue.length, 0, "transition queue length should be 0");

				assert.ok(!page3.$().hasClass("sapMNavItemFading"), "Page 3 classes should be cleaned up");
				assert.ok(!page2.$().hasClass("sapMNavItemFading"), "Page 2 classes should be cleaned up");
				done();
			}, 600);
		}, 100);
	});


	QUnit.test("navigate back 2", function(assert) {
		var done = assert.async();
		assert.expect(62); // including the "navigate" event

		resetEventLog(window.mPage1EventLog);
		resetEventLog(window.mPage2EventLog);
		resetEventLog(window.mPage3EventLog);

		window.expectedNav = {
				fromId: "page3",
				toId: "page2",
				firstTime: false,
				isTo: false,
				isBack: true,
				isBackToPage: false,
				isBackToTop: false,
				direction: "back"
		};

		nc.back({transferData:"test456"});
		assert.ok(nc._bNavigating === true, "NavContainer should be navigating");

		assert.equal(window.mPage1EventLog.beforeFirstShow, 0, "Lifecycle event invocation count page1 beforeFirstShow should be correct");
		assert.equal(window.mPage1EventLog.beforeShow, 0, "Lifecycle event invocation count page1 beforeShow should be correct");
		assert.equal(window.mPage1EventLog.afterShow, 0, "Lifecycle event invocation count page1 afterShow should be correct");
		assert.equal(window.mPage1EventLog.beforeHide, 0, "Lifecycle event invocation count page1 beforeHide should be correct");
		assert.equal(window.mPage1EventLog.afterHide, 0, "Lifecycle event invocation count page1 afterHide should be correct");

		assert.equal(window.mPage2EventLog.beforeFirstShow, 0, "Lifecycle event invocation count page2 beforeFirstShow should be correct");
		assert.equal(window.mPage2EventLog.beforeShow, 1, "Lifecycle event invocation count page2 should be correct");
		assert.equal(window.mPage2EventLog.afterShow, 0, "Lifecycle event invocation count page2 should be correct");
		assert.equal(window.mPage2EventLog.beforeHide, 0, "Lifecycle event invocation count page2 should be correct");
		assert.equal(window.mPage2EventLog.afterHide, 0, "Lifecycle event invocation count page2 should be correct");

		assert.equal(window.mPage3EventLog.beforeFirstShow, 0, "Lifecycle event invocation count page3 beforeFirstShow should be correct");
		assert.equal(window.mPage3EventLog.beforeShow, 0, "Lifecycle event invocation count page3 beforeShow should be correct");
		assert.equal(window.mPage3EventLog.afterShow, 0, "Lifecycle event invocation count page3 afterShow should be correct");
		assert.equal(window.mPage3EventLog.beforeHide, 1, "Lifecycle event invocation count page3 beforeHide should be correct");
		assert.equal(window.mPage3EventLog.afterHide, 0, "Lifecycle event invocation count page3 afterHide should be correct");

		assert.equal(window.mPage1EventLog.data, null, "Data given to page1 should be correct");
		assert.equal(window.mPage1EventLog.backData, null, "BackData given to page1 should be correct");
		assert.equal(window.mPage2EventLog.data.transferData, "test123", "Data given to page2 should be correct");
		assert.equal(window.mPage2EventLog.backData.transferData, "test456", "BackData given to page2 should be correct");
		assert.equal(window.mPage3EventLog.data, null, "Data given to page3 should be correct");
		assert.equal(window.mPage3EventLog.backData, null, "BackData given to page3 should be correct");

		setTimeout(function() {
			assert.ok(document.getElementById("page3"), "Page 3 should still be in DOM");
			assert.ok(document.getElementById("page2"), "Page 2 should now be visible");
			assert.equal(nc.getCurrentPage().getId(), "page2", "getCurrentPage should return Page 2");
			assert.equal(nc._pageStack.length, 2, "getStackLevel should return 2");

			setTimeout(function() {
				assert.equal(window.mPage1EventLog.beforeFirstShow, 0, "Lifecycle event invocation count page1 beforeFirstShow should be correct");
				assert.equal(window.mPage1EventLog.beforeShow, 0, "Lifecycle event invocation count page1 beforeShow should be correct");
				assert.equal(window.mPage1EventLog.afterShow, 0, "Lifecycle event invocation count page1 afterShow should be correct");
				assert.equal(window.mPage1EventLog.beforeHide, 0, "Lifecycle event invocation count page1 beforeHide should be correct");
				assert.equal(window.mPage1EventLog.afterHide, 0, "Lifecycle event invocation count page1 afterHide should be correct");

				assert.equal(window.mPage2EventLog.beforeFirstShow, 0, "Lifecycle event invocation count page2 beforeFirstShow should be correct");
				assert.equal(window.mPage2EventLog.beforeShow, 1, "Lifecycle event invocation count page2 should be correct");
				assert.equal(window.mPage2EventLog.afterShow, 1, "Lifecycle event invocation count page2 should be correct");
				assert.equal(window.mPage2EventLog.beforeHide, 0, "Lifecycle event invocation count page2 should be correct");
				assert.equal(window.mPage2EventLog.afterHide, 0, "Lifecycle event invocation count page2 should be correct");

				assert.equal(window.mPage3EventLog.beforeFirstShow, 0, "Lifecycle event invocation count page3 beforeFirstShow should be correct");
				assert.equal(window.mPage3EventLog.beforeShow, 0, "Lifecycle event invocation count page3 beforeShow should be correct");
				assert.equal(window.mPage3EventLog.afterShow, 0, "Lifecycle event invocation count page3 afterShow should be correct");
				assert.equal(window.mPage3EventLog.beforeHide, 1, "Lifecycle event invocation count page3 beforeHide should be correct");
				assert.equal(window.mPage3EventLog.afterHide, 1, "Lifecycle event invocation count page3 afterHide should be correct");

				assert.equal(jQuery("#page3").css("display"), "none", "Page 3 should be hidden");
				assert.equal(nc._aQueue.length, 0, "transition queue length should be 0");
				assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");
				assert.ok(!page3.$().hasClass("sapMNavItemFading"), "Page 3 classes should be cleaned up");
				assert.ok(!page2.$().hasClass("sapMNavItemFading"), "Page 2 classes should be cleaned up");
				done();
			}, 600);
		}, 100);
	});

	QUnit.test("Custom Transition Definition (on instance)", function(assert) {
		assert.expect(4);

		assert.equal(!!NavContainer.transitions["c_testTrans"], false, "custom animation should not be defined yet");

		var value = nc.addCustomTransition(
				"c_testTrans",
				/* to */ function(oFromPage, oToPage, fCallback, oCustomData) {
					oToPage.removeStyleClass("sapMNavItemHidden", true); // remove the "hidden" class which has been added by the NavContainer before the transition was called
					assert.equal(oCustomData.test, "testParametersTo", "oCustomData should have the correct value");
					fCallback();
				},
				/* back */ function(oFromPage, oToPage, fCallback, oCustomData) {
					oToPage.removeStyleClass("sapMNavItemHidden", true);
					oFromPage.addStyleClass("sapMNavItemHidden", true); // instantly hide the previous page
					assert.equal(oCustomData.test, "testParametersBack", "oCustomData should have the correct value");
					fCallback();
				}
		);

		assert.equal(!!NavContainer.transitions["c_testTrans"], true, "custom animation should be defined now");
		assert.equal(nc._aQueue.length, 0, "transition queue length should be 0");
		assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");
	});

	QUnit.test("Custom Transition Definition (static)", function(assert) {
		assert.expect(4);

		assert.equal(!!NavContainer.transitions["c_testTrans2"], false, "custom animation should not be defined yet");

		var value = NavContainer.addCustomTransition(
				"c_testTrans2",
				/* to */ function(oFromPage, oToPage, fCallback, oCustomData) {
					oToPage.removeStyleClass("sapMNavItemHidden", true); // remove the "hidden" class which has been added by the NavContainer before the transition was called
					assert.equal(oCustomData.test, "testParametersTo2", "oCustomData should have the correct value");
					fCallback();
				},
				/* back */ function(oFromPage, oToPage, fCallback, oCustomData) {
					oToPage.removeStyleClass("sapMNavItemHidden", true);
					oFromPage.addStyleClass("sapMNavItemHidden", true); // instantly hide the previous page
					assert.equal(oCustomData.test, "testParametersBack2", "oCustomData should have the correct value");
					fCallback();
				}
		);

		assert.equal(!!NavContainer.transitions["c_testTrans2"], true, "custom animation should be defined now");
		assert.equal(nc._aQueue.length, 0, "transition queue length should be 0");
		assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");
	});

	QUnit.test("Custom Transition To", function(assert) {
		assert.expect(19); // including the "navigate" event

		window.expectedNav = {
				fromId: "page2",
				toId: "page3",
				firstTime: false,
				isTo: true,
				isBack: false,
				isBackToPage: false,
				isBackToTop: false,
				direction: "to"
		};

		nc.to("page3", "c_testTrans", {myTestParam:"testDataTo"}, {test:"testParametersTo"});
		assert.equal(nc.getCurrentPage().getId(), "page3", "getCurrentPage should return Page 3");
		assert.equal(nc._aQueue.length, 0, "transition queue length should be 0");
		assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");
	});

	QUnit.test("Custom Transition Back", function(assert) {
		assert.expect(19); // including the "navigate" event

		window.expectedNav = {
				fromId: "page3",
				toId: "page2",
				firstTime: false,
				isTo: false,
				isBack: true,
				isBackToPage: false,
				isBackToTop: false,
				direction: "back"
		};

		nc.back({myTestParam:"testDataBack"}, {test:"testParametersBack"});
		assert.equal(nc.getCurrentPage().getId(), "page2", "getCurrentPage should return Page 2");
		assert.equal(nc._aQueue.length, 0, "transition queue length should be 0");
		assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");
	});


	QUnit.test("backToTop", function(assert) {
		assert.expect(56); // including the "navigate" event

		window.expectedNav = {
				fromId: "page2",
				toId: "page3",
				firstTime: false,
				isTo: true,
				isBack: false,
				isBackToPage: false,
				isBackToTop: false,
				direction: "to"
		};

		nc.to("page3", "show");
		assert.equal(nc.getCurrentPage().getId(), "page3", "getCurrentPage should return Page 3");

		window.expectedNav = {
				fromId: "page3",
				toId: "page1",
				firstTime: false,
				isTo: false,
				isBack: false,
				isBackToPage: false,
				isBackToTop: true,
				direction: "backToTop"
		};

		nc.backToTop();
		assert.equal(nc.getCurrentPage().getId(), "page1", "getCurrentPage should return Page 1");
		assert.equal(nc._pageStack.length, 1, "the NavContainer page stack should have one page");
		assert.equal(nc._aQueue.length, 0, "transition queue length should be 0");
		assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");

		window.expectedNav = {
				fromId: "page1",
				toId: "page2",
				firstTime: false,
				isTo: true,
				isBack: false,
				isBackToPage: false,
				isBackToTop: false,
				direction: "to"
		};

		nc.to("page2", "show");
		assert.equal(nc.getCurrentPage().getId(), "page2", "getCurrentPage should return Page 2");

		nc.detachNavigate(handleNavEvent);
		nc.detachAfterNavigate(handleNavEvent);
		assert.equal(nc._aQueue.length, 0, "transition queue length should be 0");
		assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");
	});


	QUnit.test("Dimensions", function(assert) {
		nc.setWidth("100px");
		nc.setHeight("100px");
		Core.applyChanges();

		var ncDom = document.getElementById("myNC");
		assert.equal(ncDom.offsetWidth, "100", "width should be 100px");
		assert.equal(ncDom.offsetHeight, "100", "height should be 100px");

		nc.setWidth("100%");
		nc.setHeight("100%");
		Core.applyChanges();

		ncDom = document.getElementById("myNC");
		var ww = document.documentElement.clientWidth || window.innerWidth; // depending on the browser
		assert.equal(ncDom.offsetWidth, ww, "width should be the complete window width");
		assert.ok((ncDom.offsetHeight === window.innerHeight || ncDom.offsetHeight === document.documentElement.clientHeight),
				"height should be the complete window height");
	});


	QUnit.test("backToPage", function(assert) {
		assert.expect(15);

		assert.equal(nc.getCurrentPage().getId(), "page2", "getCurrentPage should return Page 2");

		nc.addPage(new Page("page4", {
			title: "Page 4"
		})).addPage(new Page("page5", {
			title: "Page 5"
		})).addPage(new Page("page6", {
			title: "Page 6"
		}));

		nc.to("page4", "show");
		assert.equal(nc.getCurrentPage().getId(), "page4", "getCurrentPage should return Page 4");

		nc.to("page5", "show");
		assert.equal(nc.getCurrentPage().getId(), "page5", "getCurrentPage should return Page 5");

		nc.to("page6", "show");
		assert.equal(nc.getCurrentPage().getId(), "page6", "getCurrentPage should return Page 6");

		window.expectedNav = {
				fromId: "page6",
				toId: "page2",
				firstTime: false,
				isTo: false,
				isBack: false,
				isBackToPage: true,
				isBackToTop: false,
				direction: "backToPage"
		};
		nc.attachNavigate(handleNavEvent);

		nc.backToPage("page2", "show", {myData:"backToPageData"});
		assert.equal(nc.getCurrentPage().getId(), "page2", "getCurrentPage should return Page 2");

		nc.detachNavigate(handleNavEvent);

		assert.equal(nc._aQueue.length, 0, "transition queue length should be 0");
		assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");
	});

	QUnit.test("_safeBackToPage should work with back transition", function(assert) {
		var nc = new NavContainer({
			pages : [
				new Page("firstPage"),
				new Page("secondPage")
			],
			initialPage: "secondPage"
		}),
			mySinon = sinon.sandbox.create(),
			spy;

		nc.placeAt("qunit-fixture");

		Core.applyChanges();

		spy = mySinon.spy(NavContainer.transitions["slide"], "back");

		// act
		nc._safeBackToPage("firstPage");

		// assert
		assert.strictEqual(spy.callCount, 1, "Back animation was executed.");

		// clean-up
		nc.destroy();
		mySinon.restore();
	});

	var pageRenderCounter = 0;
	var realPageRender;
	QUnit.test("Page rerendering", function(assert) {
		realPageRender = PageRenderer.render;
		PageRenderer.render = function() {
			pageRenderCounter++;
			realPageRender.apply(PageRenderer, arguments);
		};

		assert.equal(pageRenderCounter, 0, "no rendering should have happened yet");

		Core.getControl("page2").rerender();
		assert.equal(pageRenderCounter, 1, "one page rendering should have happened");

		Core.getControl("page2").addContent(new Button({text:"Button p2"}));
		Core.applyChanges();
		assert.equal(pageRenderCounter, 2, "two page renderings should have happened");

		Core.getControl("page3").addContent(new Button({text:"Button p3"})); // invisible page - should cause NO re-rendering!
		Core.applyChanges();
		assert.equal(pageRenderCounter, 2, "still, only two page renderings should have happened");

		assert.equal(nc._aQueue.length, 0, "transition queue length should be 0");
		assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");
	});


	QUnit.test("Page rerendering during transitions", function(assert) {
		var done = assert.async();
		assert.expect(8);

		assert.equal(nc._aQueue.length, 0, "transition queue length should be 0");
		assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");

		nc.to("page3");

		setTimeout(function() {
			assert.equal(nc._aQueue.length, 0, "transition queue length should be 0 after navigation");
			assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");

			assert.equal(pageRenderCounter, 3, "three page renderings should have happened");
			nc.to("page2");

			setTimeout(function() {
				assert.equal(pageRenderCounter, 3, "still, only three page renderings should have happened");

				PageRenderer.render = realPageRender; // restore original renderer
				assert.equal(nc._aQueue.length, 0, "transition queue length should be 0");
				assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");
				done();
			}, 1600);
		}, 1600);
	});


	QUnit.test("Flip transition", function(assert) {
		var done = assert.async();
		assert.equal(nc._aQueue.length, 0, "transition queue length should be 0");
		assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");

		nc.addPage(new Page("pageTransFlip", {
			title: "Page Flip"
		}));

		var $flipPage = jQuery("#pageTransFlip");
		var $page2 = jQuery("#page2");
		assert.equal($flipPage.length, 0, "Flip page should not be rendered yet");

		nc.to("pageTransFlip", "flip");

		$flipPage = jQuery("#pageTransFlip");
		assert.equal($flipPage.length, 1, "Flip page should be rendered now");

		setTimeout(function() {
			assert.ok($flipPage.hasClass("sapMNavItemFlipNext"), "Flip page should be prepared for flipping now");

			setTimeout(function() {

				assert.ok($flipPage.hasClass("sapMNavItemFlipping"), "Flip page should be flipping now");

				assert.ok($page2.hasClass("sapMNavItemFlipping"), "Page 2 should be flipping now");
				assert.ok($page2.hasClass("sapMNavItemFlipPrevious"), "Page 2 should be flipping now");

				setTimeout(function() {

					assert.ok(!$flipPage.hasClass("sapMNavItemFlipping"), "Flip page should not be flipping now");
					assert.ok(!$page2.hasClass("sapMNavItemFlipping"), "Page 2 should not be flipping now");

					nc.back();

					setTimeout(function() {

						assert.ok($flipPage.hasClass("sapMNavItemFlipping"), "Flip page should be flipping now");
						assert.ok($page2.hasClass("sapMNavItemFlipping"), "Page 2 should be flipping now");

						setTimeout(function() {
							assert.ok(!$flipPage.hasClass("sapMNavItemFlipping"), "Flip page classes should be cleaned up");
							assert.ok(!$flipPage.hasClass("sapMNavItemFlipNext"), "Flip page classes should be cleaned up");
							assert.ok(!$flipPage.hasClass("sapMNavItemFlipPrevious"), "Flip page classes should be cleaned up");
							assert.ok(!$page2.hasClass("sapMNavItemFlipping"), "Page 2 classes should be cleaned up");
							assert.ok(!$page2.hasClass("sapMNavItemFlipNext"), "Page 2 classes should be cleaned up");
							assert.ok(!$page2.hasClass("sapMNavItemFlipPrevious"), "Page 2 classes should be cleaned up");
							assert.equal(nc._aQueue.length, 0, "transition queue length should be 0");
							assert.ok(nc._bNavigating === false, "NavContainer should not be navigating");

							done();
						}, 600);
					}, 100);
				}, 600);
			}, 100);
		}, 40);
	});


	QUnit.test("Slide back to page 1", function(assert) {
		var done = assert.async();
		nc.backToPage("page1");

		var $page1 = jQuery("#page1");
		var $page2 = jQuery("#page2");

		// assert.ok($page1.hasClass("sapMNavItemLeft"), "Page 1 should have left class");
		// assert.ok(!$page2.hasClass("sapMNavItemRight"), "Page 2 should have no right class");

		setTimeout(function() {
			$page1 = jQuery("#page1");
			$page2 = jQuery("#page2");

			// assert.ok($page1.hasClass("sapMNavItemSliding"), "Page 1 should be sliding now"); // slide transition was the last one used
			// assert.ok($page2.hasClass("sapMNavItemSliding"), "Page 2 should be sliding now");

			// assert.ok(!$page1.hasClass("sapMNavItemLeft"), "Page 2 should have no left class");
			// assert.ok($page2.hasClass("sapMNavItemRight"), "Page 1 should have right class");

			setTimeout(function() {
				nc.back();
				assert.ok(!$page1.hasClass("sapMNavItemSliding"), "Page 2 classes should be cleaned up");
				// assert.ok(!$page1.hasClass("sapMNavItemRight"), "Page 2 classes should be cleaned up");
				// assert.ok(!$page1.hasClass("sapMNavItemLeft"), "Page 2 classes should be cleaned up");
				assert.ok(!$page2.hasClass("sapMNavItemSliding"), "Page 1 classes should be cleaned up");
				// assert.ok(!$page2.hasClass("sapMNavItemRight"), "Page 1 classes should be cleaned up");
				// assert.ok(!$page2.hasClass("sapMNavItemLeft"), "Page 1 classes should be cleaned up");

				done();
			}, 600);
		}, 100);
	});

	QUnit.test("Should Build a navigation stack", function(assert) {
		var done = assert.async();
		//Arrange
		var calls = [],
			//System under test
			oNavContainer = new NavContainer({
				pages : [
					new Page("firstPage", {}),
					new Page("secondPage", {}),
					new Page("thirdPage", {})
				]
			}),
			oPromise = new Promise(function (fnResolve, fnReject) {
			var afterNavigate = function(evt) {
					calls.push(evt.getParameter("toId"));
					if (calls.length === 6) {
						fnResolve();
					}
					Log.info("afterNavigate with toId: " + evt.getParameter("toId"));
				};

			// Render
			oNavContainer.placeAt("qunit-fixture");
			Core.applyChanges();

			//Act
			oNavContainer.attachAfterNavigate(afterNavigate);
			oNavContainer.to("secondPage");
			oNavContainer.to("thirdPage");
			oNavContainer.back();
			oNavContainer.to("firstPage");
			oNavContainer.back();
			oNavContainer.back();
		});

		oPromise.then(function () {
			//Assert
			assert.strictEqual(calls.length, 6, "Did call to() 3 times and back() 3 times");

			//ensure right order
			assert.strictEqual(calls[0], "secondPage");
			assert.strictEqual(calls[1], "thirdPage");
			assert.strictEqual(calls[2], "secondPage");
			assert.strictEqual(calls[3], "firstPage");
			assert.strictEqual(calls[4], "secondPage");
			assert.strictEqual(calls[5], "firstPage");

			//cleanup
			oNavContainer.destroy();
			done();
		});
	});


	QUnit.test("Focus management", function(assert) {
		var done = assert.async();
		//Arrange
		var //System under test
			oNavContainer = new NavContainer({
				pages : [
					new Page("firstPage", {
						title: "Page 1",
						showNavButton: false,
						content : [
							new Button("btn1_1", {
								text : "To Page 2"
							}),
							new Button("btn1_2", {
								text : "To Page 3"
							}),
							new Label({
								text : "The following field shows the data passed from page 1:"
							}),
							new Input("p1input", {
								value : null,
								width: "100%"
							})
						]
					}),
					new Page("secondPage", {
						title: "Page 2",
						showNavButton: true,
						content : [
							new Button("btn2_1", {
								text : "To Page 1"
							}),
							new Button("btn2_2", {
								text : "To Page 3"
							}),
							new Label({
								text : "The following field shows the data passed from page 1:"
							}),
							new Input("p2input", {
								value : null,
								width: "100%"
							})
						]
					})
				]
			}),
			afterNavigate = function(evt) {
					var sPageId = evt.getParameter("toId");

					if (sPageId === "firstPage") {
						var oButtonPage1FocusDom = Core.byId("btn1_1").getFocusDomRef();
						assert.equal(oButtonPage1FocusDom, document.activeElement, "button <To Page 2> on page 1 should have the focus");

						//cleanup
						oNavContainer.destroy();
						done();
					}
					if (sPageId === "secondPage") {
						var oButtonPage2FocusDom = Core.byId("secondPage-navButton").getFocusDomRef();
						assert.equal(oButtonPage2FocusDom, document.activeElement, "nav button in the  header on page 2 should have the focus");
					}
			};

		// Render
		oNavContainer.placeAt("qunit-fixture");
		Core.applyChanges();

		// Initial focus check on first page
		var oButtonPage1FocusDom = Core.byId("btn1_1").getFocusDomRef();
		assert.equal(oButtonPage1FocusDom, document.activeElement, "button <To Page 2>  on page 1 should have the focus");

		//Act
		oNavContainer.attachAfterNavigate(afterNavigate);
		oNavContainer.to("secondPage");
		oNavContainer.back();
	});


	QUnit.test("Navigation interrupted by rerendering of NavContainer - BASE SLIDE", function(assert) {
		var done = assert.async();
		//Arrange
		var calls = [],
			afterNavigate = function(evt) {
				calls.push(evt.getParameter("toId"));
				Log.info("afterNavigate with toId: " + evt.getParameter("toId"));
			};

		//Act
		nc.attachAfterNavigate(afterNavigate);
		nc.to("page2", "baseSlide");

		window.setTimeout(function(){
			nc.invalidate(); // force invalidation during navigation()

			window.setTimeout(function(){
				nc.to("page3", "baseSlide");

				window.setTimeout(function(){
					nc.rerender(); // force rerendering during navigation()

					window.setTimeout(function(){
						nc.back(); // to page2
						nc.back(); // to initial page 1

						window.setTimeout(function(){ // now be really nasty while the back navigations should happen
							nc.rerender();
							window.setTimeout(function(){
								nc.rerender();
								window.setTimeout(function(){
									nc.invalidate();
									window.setTimeout(function(){
										nc.rerender();

										window.setTimeout(function(){
											assert.strictEqual(calls.length, 4, "Did call to() 2 times and back() 2 times");

											//ensure right order
											assert.strictEqual(calls[0], "page2");
											assert.strictEqual(calls[1], "page3");
											assert.strictEqual(calls[2], "page2");
											assert.strictEqual(calls[3], "page1");

											//cleanup
											nc.detachAfterNavigate(afterNavigate);

											done();
										}, 1000);
									}, 100);
								}, 100);
							}, 100);
						}, 100);
					}, 400); // 400 more before next navigation
				}, 200); // 200 into navigation for forced rerendering
			}, 400); // 400 more before next navigation
		}, 200); // 200 before first invalidation

	});


	QUnit.test("Navigation interrupted by rerendering of child controls - BASE SLIDE", function(assert) {
		var done = assert.async();
		Log.warning("## START - Navigation interrupted by rerendering of child controls");
		//Arrange
		var calls = [],
			afterNavigate = function(evt) {
				calls.push(evt.getParameter("toId"));
				Log.info("afterNavigate with toId: " + evt.getParameter("toId"));
			};

		//Act
		nc.attachAfterNavigate(afterNavigate);
		nc.to("page2", "baseSlide");

		window.setTimeout(function(){
			page1.invalidate(); // force invalidation during navigation()
			page2.invalidate(); // force invalidation during navigation()

			window.setTimeout(function(){
				nc.to("page3", "baseSlide");

				window.setTimeout(function(){
					page1.rerender(); // force rerendering during navigation()
					page2.rerender(); // force rerendering during navigation()

					window.setTimeout(function(){
						nc.back(); // to page2
						nc.back(); // to initial page 1

						window.setTimeout(function(){ // now be really nasty while the back navigations should happen
							nc.rerender();
							window.setTimeout(function(){
								page1.rerender();
								window.setTimeout(function(){
									page2.invalidate();
									window.setTimeout(function(){
										page2.rerender();

										window.setTimeout(function(){
											assert.strictEqual(calls.length, 4, "Did call to() 2 times and back() 2 times");

											//ensure right order
											assert.strictEqual(calls[0], "page2");
											assert.strictEqual(calls[1], "page3");
											assert.strictEqual(calls[2], "page2");
											assert.strictEqual(calls[3], "page1");

											//cleanup
											nc.detachAfterNavigate(afterNavigate);

											done();
										}, 1000);
									}, 100);
								}, 100);
							}, 100);
						}, 100);
					}, 400); // 400 more before next navigation
				}, 200); // 200 into navigation for forced rerendering
			}, 400); // 400 more before next navigation
		}, 200); // 200 before first invalidation

	});


	QUnit.test("Navigation interrupted by rerendering of NavContainer - SLIDE", function(assert) {
		var done = assert.async();
		//Arrange
		var calls = [],
			afterNavigate = function(evt) {
				calls.push(evt.getParameter("toId"));
				Log.info("afterNavigate with toId: " + evt.getParameter("toId"));
			};

		//Act
		nc.attachAfterNavigate(afterNavigate);
		nc.to("page2");

		window.setTimeout(function(){
			nc.invalidate(); // force invalidation during navigation()

			window.setTimeout(function(){
				nc.to("page3");

				window.setTimeout(function(){
					nc.rerender(); // force rerendering during navigation()

					window.setTimeout(function(){
						nc.back(); // to page2
						nc.back(); // to initial page 1

						window.setTimeout(function(){ // now be really nasty while the back navigations should happen
							nc.rerender();
							window.setTimeout(function(){
								nc.rerender();
								window.setTimeout(function(){
									nc.invalidate();
									window.setTimeout(function(){
										nc.rerender();

										window.setTimeout(function(){
											assert.strictEqual(calls.length, 4, "Did call to() 2 times and back() 2 times");

											//ensure right order
											assert.strictEqual(calls[0], "page2");
											assert.strictEqual(calls[1], "page3");
											assert.strictEqual(calls[2], "page2");
											assert.strictEqual(calls[3], "page1");

											//cleanup
											nc.detachAfterNavigate(afterNavigate);

											done();
										}, 1000);
									}, 100);
								}, 100);
							}, 100);
						}, 100);
					}, 400); // 400 more before next navigation
				}, 200); // 200 into navigation for forced rerendering
			}, 400); // 400 more before next navigation
		}, 200); // 200 before first invalidation

	});


	QUnit.test("Navigation interrupted by rerendering of child controls - SLIDE", function(assert) {
		var done = assert.async();
		Log.warning("## START - Navigation interrupted by rerendering of child controls");
		//Arrange
		var calls = [],
			afterNavigate = function(evt) {
				calls.push(evt.getParameter("toId"));
				Log.info("afterNavigate with toId: " + evt.getParameter("toId"));
			};

		//Act
		nc.attachAfterNavigate(afterNavigate);
		nc.to("page2");

		window.setTimeout(function(){
			page1.invalidate(); // force invalidation during navigation()
			page2.invalidate(); // force invalidation during navigation()

			window.setTimeout(function(){
				nc.to("page3");

				window.setTimeout(function(){
					page1.rerender(); // force rerendering during navigation()
					page2.rerender(); // force rerendering during navigation()

					window.setTimeout(function(){
						nc.back(); // to page2
						nc.back(); // to initial page 1

						window.setTimeout(function(){ // now be really nasty while the back navigations should happen
							nc.rerender();
							window.setTimeout(function(){
								page1.rerender();
								window.setTimeout(function(){
									page2.invalidate();
									window.setTimeout(function(){
										page2.rerender();

										window.setTimeout(function(){
											assert.strictEqual(calls.length, 4, "Did call to() 2 times and back() 2 times");

											//ensure right order
											assert.strictEqual(calls[0], "page2");
											assert.strictEqual(calls[1], "page3");
											assert.strictEqual(calls[2], "page2");
											assert.strictEqual(calls[3], "page1");

											//cleanup
											nc.detachAfterNavigate(afterNavigate);

											done();
										}, 1000);
									}, 100);
								}, 100);
							}, 100);
						}, 100);
					}, 400); // 400 more before next navigation
				}, 200); // 200 into navigation for forced rerendering
			}, 400); // 400 more before next navigation
		}, 200); // 200 before first invalidation

	});

	QUnit.test("Navigation interrupted by rerendering of NavContainer - FADE", function(assert) {
		var done = assert.async();
		//Arrange
		var calls = [],
			afterNavigate = function(evt) {
				calls.push(evt.getParameter("toId"));
				Log.info("afterNavigate with toId: " + evt.getParameter("toId"));
			};

		//Act
		nc.attachAfterNavigate(afterNavigate);
		nc.to("page2", "fade");

		window.setTimeout(function(){
			nc.invalidate(); // force invalidation during navigation()

			window.setTimeout(function(){
				nc.to("page3", "fade");

				window.setTimeout(function(){
					nc.rerender(); // force rerendering during navigation()

					window.setTimeout(function(){
						nc.back(); // to page2
						nc.back(); // to initial page 1

						window.setTimeout(function(){ // now be really nasty while the back navigations should happen
							nc.rerender();
							window.setTimeout(function(){
								nc.rerender();
								window.setTimeout(function(){
									nc.invalidate();
									window.setTimeout(function(){
										nc.rerender();

										window.setTimeout(function(){
											assert.strictEqual(calls.length, 4, "Did call to() 2 times and back() 2 times");

											//ensure right order
											assert.strictEqual(calls[0], "page2");
											assert.strictEqual(calls[1], "page3");
											assert.strictEqual(calls[2], "page2");
											assert.strictEqual(calls[3], "page1");

											//cleanup
											nc.detachAfterNavigate(afterNavigate);

											done();
										}, 1000);
									}, 100);
								}, 100);
							}, 100);
						}, 100);
					}, 400); // 400 more before next navigation
				}, 200); // 200 into navigation for forced rerendering
			}, 400); // 400 more before next navigation
		}, 200); // 200 before first invalidation

	});


	QUnit.test("Navigation interrupted by rerendering of child controls - FADE", function(assert) {
		var done = assert.async();
		Log.warning("## START - Navigation interrupted by rerendering of child controls");
		//Arrange
		var calls = [],
			afterNavigate = function(evt) {
				calls.push(evt.getParameter("toId"));
				Log.info("afterNavigate with toId: " + evt.getParameter("toId"));
			};

		//Act
		nc.attachAfterNavigate(afterNavigate);
		nc.to("page2", "fade");

		window.setTimeout(function(){
			page1.invalidate(); // force invalidation during navigation()
			page2.invalidate(); // force invalidation during navigation()

			window.setTimeout(function(){
				nc.to("page3", "fade");

				window.setTimeout(function(){
					page1.rerender(); // force rerendering during navigation()
					page2.rerender(); // force rerendering during navigation()

					window.setTimeout(function(){
						nc.back(); // to page2
						nc.back(); // to initial page 1

						window.setTimeout(function(){ // now be really nasty while the back navigations should happen
							nc.rerender();
							window.setTimeout(function(){
								page1.rerender();
								window.setTimeout(function(){
									page2.invalidate();
									window.setTimeout(function(){
										page2.rerender();

										window.setTimeout(function(){
											assert.strictEqual(calls.length, 4, "Did call to() 2 times and back() 2 times");

											//ensure right order
											assert.strictEqual(calls[0], "page2");
											assert.strictEqual(calls[1], "page3");
											assert.strictEqual(calls[2], "page2");
											assert.strictEqual(calls[3], "page1");

											//cleanup
											nc.detachAfterNavigate(afterNavigate);

											done();
										}, 1000);
									}, 100);
								}, 100);
							}, 100);
						}, 100);
					}, 400); // 400 more before next navigation
				}, 200); // 200 into navigation for forced rerendering
			}, 400); // 400 more before next navigation
		}, 200); // 200 before first invalidation

	});


	QUnit.test("Navigation interrupted by rerendering of NavContainer - FLIP", function(assert) {
		var done = assert.async();
		//Arrange
		var calls = [],
			afterNavigate = function(evt) {
				calls.push(evt.getParameter("toId"));
				Log.info("afterNavigate with toId: " + evt.getParameter("toId"));
			};

		//Act
		nc.attachAfterNavigate(afterNavigate);
		nc.to("page2", "flip");

		window.setTimeout(function(){
			nc.invalidate(); // force invalidation during navigation()

			window.setTimeout(function(){
				nc.to("page3", "flip");

				window.setTimeout(function(){
					nc.rerender(); // force rerendering during navigation()

					window.setTimeout(function(){
						nc.back(); // to page2
						nc.back(); // to initial page 1

						window.setTimeout(function(){ // now be really nasty while the back navigations should happen
							nc.rerender();
							window.setTimeout(function(){
								nc.rerender();
								window.setTimeout(function(){
									nc.invalidate();
									window.setTimeout(function(){
										nc.rerender();

										window.setTimeout(function(){
											assert.strictEqual(calls.length, 4, "Did call to() 2 times and back() 2 times");

											//ensure right order
											assert.strictEqual(calls[0], "page2");
											assert.strictEqual(calls[1], "page3");
											assert.strictEqual(calls[2], "page2");
											assert.strictEqual(calls[3], "page1");

											//cleanup
											nc.detachAfterNavigate(afterNavigate);

											done();
										}, 3000);
									}, 100);
								}, 100);
							}, 100);
						}, 100);
					}, 600); // 600 more before next navigation
				}, 200); // 200 into navigation for forced rerendering
			}, 600); // 600 more before next navigation
		}, 200); // 200 before first invalidation

	});


	QUnit.test("Navigation interrupted by rerendering of child controls - FLIP", function(assert) {
		var done = assert.async();
		Log.warning("## START - Navigation interrupted by rerendering of child controls");
		//Arrange
		var calls = [],
			afterNavigate = function(evt) {
				calls.push(evt.getParameter("toId"));
				Log.info("afterNavigate with toId: " + evt.getParameter("toId"));
			};

		//Act
		nc.attachAfterNavigate(afterNavigate);
		nc.to("page2", "flip");

		window.setTimeout(function(){
			page1.invalidate(); // force invalidation during navigation()
			page2.invalidate(); // force invalidation during navigation()

			window.setTimeout(function(){
				nc.to("page3", "flip");

				window.setTimeout(function(){
					page1.rerender(); // force rerendering during navigation()
					page2.rerender(); // force rerendering during navigation()

					window.setTimeout(function(){
						nc.back(); // to page2
						nc.back(); // to initial page 1

						window.setTimeout(function(){ // now be really nasty while the back navigations should happen
							nc.rerender();
							window.setTimeout(function(){
								page1.rerender();
								window.setTimeout(function(){
									page2.invalidate();
									window.setTimeout(function(){
										page2.rerender();

										window.setTimeout(function(){
											assert.strictEqual(calls.length, 4, "Did call to() 2 times and back() 2 times");

											//ensure right order
											assert.strictEqual(calls[0], "page2");
											assert.strictEqual(calls[1], "page3");
											assert.strictEqual(calls[2], "page2");
											assert.strictEqual(calls[3], "page1");

											//cleanup
											nc.detachAfterNavigate(afterNavigate);

											done();
										}, 3000);
									}, 100);
								}, 100);
							}, 100);
						}, 100);
					}, 600); // 600 more before next navigation
				}, 200); // 200 into navigation for forced rerendering
			}, 600); // 600 more before next navigation
		}, 200); // 200 before first invalidation

	});

	/*
	QUnit.test("Navigation interrupted by rerendering of NavContainer - DOOR", function(assert) {
		var done = assert.async();
		//Arrange
		var calls = [],
			afterNavigate = function(evt) {
				calls.push(evt.getParameter("toId"));
				Log.info("afterNavigate with toId: " +evt.getParameter("toId"));
			};

		//Act
		nc.attachAfterNavigate(afterNavigate);
		nc.to("page2", "door");

		window.setTimeout(function(){
			nc.invalidate(); // force invalidation during navigation()

			window.setTimeout(function(){
				nc.to("page3", "door");

				window.setTimeout(function(){
					nc.rerender(); // force rerendering during navigation()

					window.setTimeout(function(){
						nc.back(); // to page2
						nc.back(); // to initial page 1

						window.setTimeout(function(){ // now be really nasty while the back navigations should happen
							nc.rerender();
							window.setTimeout(function(){
								nc.rerender();
								window.setTimeout(function(){
									nc.invalidate();
									window.setTimeout(function(){
										nc.rerender();

										window.setTimeout(function(){
											assert.strictEqual(calls.length, 4, "Did call to() 2 times and back() 2 times");

											//ensure right order
											assert.strictEqual(calls[0], "page2");
											assert.strictEqual(calls[1], "page3");
											assert.strictEqual(calls[2], "page2");
											assert.strictEqual(calls[3], "page1");

											//cleanup
											nc.detachAfterNavigate(afterNavigate);

											done();
										}, 1000);
									}, 100);
								}, 100);
							}, 100);
						}, 100);
					}, 400); // 400 more before next navigation
				}, 200); // 200 into navigation for forced rerendering
			}, 400); // 400 more before next navigation
		}, 200); // 200 before first invalidation

	});


	QUnit.test("Navigation interrupted by rerendering of child controls - DOOR", function(assert) {
		var done = assert.async();
		Log.warning("## START - Navigation interrupted by rerendering of child controls");
		//Arrange
		var calls = [],
			afterNavigate = function(evt) {
				calls.push(evt.getParameter("toId"));
				Log.info("afterNavigate with toId: " +evt.getParameter("toId"));
			};

		//Act
		nc.attachAfterNavigate(afterNavigate);
		nc.to("page2", "door");

		window.setTimeout(function(){
			page1.invalidate(); // force invalidation during navigation()
			page2.invalidate(); // force invalidation during navigation()

			window.setTimeout(function(){
				nc.to("page3", "door");

				window.setTimeout(function(){
					page1.rerender(); // force rerendering during navigation()
					page2.rerender(); // force rerendering during navigation()

					window.setTimeout(function(){
						nc.back(); // to page2
						nc.back(); // to initial page 1

						window.setTimeout(function(){ // now be really nasty while the back navigations should happen
							nc.rerender();
							window.setTimeout(function(){
								page1.rerender();
								window.setTimeout(function(){
									page2.invalidate();
									window.setTimeout(function(){
										page2.rerender();

										window.setTimeout(function(){
											assert.strictEqual(calls.length, 4, "Did call to() 2 times and back() 2 times");

											//ensure right order
											assert.strictEqual(calls[0], "page2");
											assert.strictEqual(calls[1], "page3");
											assert.strictEqual(calls[2], "page2");
											assert.strictEqual(calls[3], "page1");

											//cleanup
											nc.detachAfterNavigate(afterNavigate);

											done();
										}, 1000);
									}, 100);
								}, 100);
							}, 100);
						}, 100);
					}, 400); // 400 more before next navigation
				}, 200); // 200 into navigation for forced rerendering
			}, 400); // 400 more before next navigation
		}, 200); // 200 before first invalidation

	});
	*/

	QUnit.test("Should build a navigation stack if the page is the same", function(assert) {
		var done = assert.async();
		//Arrange
		var calls = [],
			afterNavigate = function(evt) {
				calls.push(evt.getParameter("toId"));
				Log.info("afterNavigate with toId: " + evt.getParameter("toId"));
			};

		//Act
		nc.attachAfterNavigate(afterNavigate);
		//Wait for navigation to page 1
		nc.to("page2");

		setTimeout(function() {

			nc.to("page1");
			//build up a queue with the current page(page1)
			nc.to("page2");

			setTimeout(function() {
				//Assert
				assert.strictEqual(calls.length, 3, "Did call to() 3 times");

				//ensure right order
				assert.strictEqual(calls[0], "page2");
				assert.strictEqual(calls[1], "page1");
				assert.strictEqual(calls[2], "page2");

				//cleanup
				nc.detachAfterNavigate(afterNavigate);
				done();
				//show first page again to see the test result
				nc.back();
				nc.back();
				nc.back();
			}, 2000);
		}, 2000);
	});


	QUnit.test("Should build a navigation stack if there is no page at the moment", function(assert) {
		var done = assert.async();
		var page1 = new Page({
			title: "Other Page 1"
			}),
			page2 = new Page({
				title: "Other Page 2"
			}),
			localNc = new NavContainer({
			initialPage: page1.getId(),
			pages: [
				page1,
				page2
			]
		});
		localNc.placeAt("qunit-fixture");
		Core.applyChanges();
		//Arrange
		var calls = [],
			afterNavigate = function(evt) {
				calls.push(evt.getParameter("toId"));
				Log.info("afterNavigate with toId: " + evt.getParameter("toId"));
			};

		//Act
		localNc.attachAfterNavigate(afterNavigate);
		//Wait for navigation to page 2
		localNc.to(page2.getId());
		localNc.back();

		setTimeout(function() {
			//Assert
			assert.strictEqual(calls.length, 2, "Did call to() 2 times");

			//ensure right order
			assert.strictEqual(calls[0], page2.getId());
			assert.strictEqual(calls[1], page1.getId());

			//cleanup
			localNc.detachAfterNavigate(afterNavigate);
			done();
			localNc.destroy();
		}, 2000);
	});

	QUnit.test("Base Slide transition", function(assert) {
		// Assert
		assert.expect(24);
		// Arrange
		var done = assert.async(),
			hiddenClass = "sapMNavItemHidden",
			directionProperty = "normal",
			// animation is played in reverse when "back" function is called
			// so we can call the same assertions with exchanged classes and direction
			// so we later use this property to arrange from and to pages
			isBack = false,
			page1 = new Page({ title: "Other Page 1" }),
			page2 = new Page({ title: "Other Page 2" }),
			localNc = new NavContainer({
				initialPage: page1.getId(),
				pages: [ page1, page2 ]
			}),
			toPage = null,
			fromPage = null,
			toPageExpectedClass = null,
			fromPageExpectedClass = null,
			getFromPage = function () {
				return isBack ? page2.$() : page1.$();
			},
			getToPage = function () {
				return isBack ? page1.$() : page2.$();
			},
			getFromPageExpectedClass = function () {
				return isBack ? "sapMNavItemSlideRightToCenter" : "sapMNavItemSlideCenterToLeft";
			},
			getToPageExpectedClass = function () {
				return isBack ?  "sapMNavItemSlideCenterToLeft" : "sapMNavItemSlideRightToCenter";
			};

		localNc.placeAt("qunit-fixture");
		Core.applyChanges();

		// Act
		localNc.attachAfterNavigate(function (e) {
			isBack =  e.getParameter('isBack');
			toPage = getToPage();
			fromPage = getFromPage();
			toPageExpectedClass = getToPageExpectedClass();
			fromPageExpectedClass = getFromPageExpectedClass();

			// Assert
			assert.equal(fromPage.hasClass(hiddenClass), true, "From page should have the  class: " + hiddenClass);
			assert.equal(fromPage.hasClass(fromPageExpectedClass), false, "From page should not have the class: " + fromPageExpectedClass);
			assert.equal(toPage.hasClass(toPageExpectedClass), false, "To page should not have the class: " + toPageExpectedClass);
			// here animation direction should always be "normal", because we restore default animation direction after navigate
			assert.equal(fromPage.css("animation-direction"), "normal", "From page Animation direction should be removed");
			assert.equal(toPage.css("animation-direction"), "normal", "To page Animation direction should be removed");
			assert.equal(toPage.length, 1, "Page should be rendered now");

			if (isBack) {
				// Clean up
				localNc.destroy();
				done();
			}
		});

		// Act
		localNc.attachNavigate(function (e) {
			isBack = e.getParameter('isBack');
			toPage = getToPage();

			if (isBack) {
				// Assert
				assert.equal(toPage.css("display"), "none", "Page should not be rendered yet");
			} else {
				// Assert
				assert.equal(toPage.length, 0, "Page should not be rendered yet");
			}

			requestAnimationFrame(function() {
				toPage = getToPage();
				fromPage = getFromPage();
				toPageExpectedClass = getToPageExpectedClass();
				fromPageExpectedClass = getFromPageExpectedClass();
				directionProperty = isBack ? "reverse" : "normal";

				// Assert
				assert.equal(toPage.hasClass(hiddenClass), false, "To page should not have the class: " + hiddenClass);
				assert.equal(toPage.hasClass(toPageExpectedClass), true, "To page should have the class: " + toPageExpectedClass);
				assert.equal(fromPage.hasClass(fromPageExpectedClass), true, "From page should have the class: " + fromPageExpectedClass);
				assert.equal(fromPage.css("animation-direction"), directionProperty, "From page Animation direction should be: " + directionProperty);
				assert.equal(toPage.css("animation-direction"), directionProperty, "To page Animation direction should be: " + directionProperty);
			});
		});

		// Act
		localNc.to(page2.getId(), "baseSlide");
		localNc.back();
	});

	QUnit.module("Navigation stack cleanup");

	QUnit.test("Should remove a page that is no longer aggregated from the navigation stack", function(assert) {
		//Arrange
		var oPage1 = new Page("localPage1"),
			oPage2 = new Page("localPage2"),
			oPage3 = new Page("localPage3"),
			oLocalNavContainer = new NavContainer({
				initialPage: oPage1.getId(),
				pages: [
					oPage1,
					oPage2,
					oPage3
				]
			});
		oLocalNavContainer.placeAt("qunit-fixture");
		Core.applyChanges();

		oLocalNavContainer.to(oPage2.getId(), "show");
		oLocalNavContainer.to(oPage3.getId(), "show");

		//Act
		oLocalNavContainer.removePage(oPage3);
		assert.ok(!oPage3.getDomRef(), "Did remove the dom of page 3");
		Core.applyChanges();

		assert.strictEqual(oLocalNavContainer.getCurrentPage().getId(), oPage2.getId(), "Page2 is the current page, since page3 got removed");
		assert.ok(oPage2.$().is(":visible"), "Page 2 is visible");

		// Cleanup
		oPage3.destroy();
		oLocalNavContainer.destroy();
	});


	QUnit.module("Event data");

	function beforeRenderingTestCase (sTestName, sEventName) {
		QUnit.test(sTestName, function(assert) {
			var done = assert.async();
			// Arrange
			var oInitialPage = new Page(),
				oNavContainer = new NavContainer({
					initialPage: oInitialPage.getId(),
					pages: [
						oInitialPage
					]
				}),
				oNavigationData = {
					foo : "bar"
				},
				oEventDelegate = {};

			oEventDelegate[sEventName] = function (oEvent) {
				// Assert
				assert.strictEqual(oNavContainer.getCurrentPage().getId(), oInitialPage.getId(), "The initial page is shown");
				assert.strictEqual(oEvent.data, oNavigationData, "Did pass the data to " + sEventName);

				//Cleanup
				oNavContainer.destroy();
				done();
			};

			oInitialPage.addEventDelegate(oEventDelegate);

			// Act
			oNavContainer.to(oInitialPage.getId(), "show", { iShould : "not be passed to the event"});
			oNavContainer.to(oInitialPage.getId(), "show", oNavigationData);
			oNavContainer.placeAt("qunit-fixture");


			// Render
			Core.applyChanges();

		});
	}

	beforeRenderingTestCase("Should pass to data to the page's onBeforeShow when called before rendering", "onBeforeShow");
	beforeRenderingTestCase("Should pass to data to the page's onBeforeFirstShow when called before rendering", "onBeforeFirstShow");
	beforeRenderingTestCase("Should pass to daa to the page's onAfterShow when called before rendering", "onAfterShow");

	QUnit.test("Event data on initial page", function(assert) {
		var done = assert.async();
		var oInitialPage = new Page(),
			oSecondPage = new Page(),
			oNavContainer = new NavContainer({
				pages: [
					oInitialPage, oSecondPage
				]
			}),
			oNavigationData = {
				foo: "bar"
			},
			oBackData = {
				back: true
			};

		// Act
		oNavContainer.to(oInitialPage.getId(), "show", oNavigationData);
		oNavContainer.to(oSecondPage.getId(), "show");
		oNavContainer.placeAt("qunit-fixture");
		Core.applyChanges();

		oInitialPage.addEventDelegate({
			onBeforeShow: function(oEvent) {
				assert.strictEqual(oEvent.data, oNavigationData, "The forward navigation data is passed to the back navigation");
				assert.strictEqual(oEvent.backData, oBackData, "The back navigation data is passed");

				oNavContainer.destroy();
				done();
			}
		});
		oNavContainer.backToPage(oInitialPage.getId(), oBackData);
	});

	QUnit.module("Lifecycle");

	QUnit.test("Exit/Destruction", function(assert) {
		var done = assert.async();
		var page1 = new Page({
			title: "Page 1"
			}),
			page2 = new Page({
				title: "Page 2"
			}),
			localNc = new NavContainer({
			initialPage: page1,
			pages: [
				page1,
				page2
			]
		});
		localNc.placeAt("qunit-fixture");
		Core.applyChanges();

		// Arrange
		var afterNavigate = function(evt) {
			assert.ok(localNc._mFocusObject, "_mFocusObject should be set before destroy()");
			localNc.destroy();
			assert.strictEqual(localNc._mFocusObject, null, "_mFocusObject should be nulled after destroy()"); // this is nulled for memory reasons
			// this also checks whether the NavContainer can handle being destroyed within the afterNavigate (because there is further code in afterNavigate, which may not access destroyed parts)
			done();
		};

		// Act
		localNc.attachAfterNavigate(afterNavigate);
		localNc.to(page2.getId());
	});

	QUnit.test("Invalidation upon removePage", function(assert) {
		var page1 = new Page({
				title: "Page 1"
			}),
			localNc = new NavContainer({
				initialPage: page1,
				pages: [
					page1
				]
			}),
			oSpy = sinon.spy(localNc, "invalidate");

		// Act
		localNc.removePage(page1);

		// Check
		assert.strictEqual(oSpy.callCount, 1, "current page was invalidated");
	});

	QUnit.test("Invalidation upon removePage by id", function(assert) {
		var page1 = new Page({
				title: "Page 1"
			}),
			localNc = new NavContainer({
				initialPage: page1,
				pages: [
					page1
				]
			}),
			oSpy = sinon.spy(localNc, "invalidate");

		// Act
		localNc.removePage(page1.getId());

		// Check
		assert.strictEqual(oSpy.callCount, 1, "current page was invalidated");
	});

	QUnit.test("Invalidation upon removePage by index", function(assert) {
		var page1 = new Page({
				title: "Page 1"
			}),
			localNc = new NavContainer({
				initialPage: page1,
				pages: [
					page1
				]
			}),
		oSpy = sinon.spy(localNc, "invalidate");

		// Act
		localNc.removePage(0);

		// Check
		assert.strictEqual(oSpy.callCount, 1, "current page was invalidated");
	});

	QUnit.test("No invalidation upon removePage by invalid index", function(assert) {
		var page1 = new Page({
				title: "Page 1"
			}),
			localNc = new NavContainer({
				initialPage: page1,
				pages: [
					page1
				]
			}),
			oSpy = sinon.spy(localNc, "invalidate");

		// Act: give invalid index as argument
		localNc.removePage(1);

		// Check
		assert.strictEqual(oSpy.callCount, 0, "current page was not invalidated");
	});

	QUnit.module("NavContainer in Dialog", {
		beforeEach: function () {
			this.iDialogOpeningsCount = 0;
			this.iDialogOpeningDelay = 1000; //ms.
			this.oPage = new Page("pageId", {
				content: [new Text({text: "Page"})]
			});
			this.oPage2 = new Page('page2Id', {
				content: [new Text({text: "Page2"})]
			});
			this.oNavContainer = new NavContainer({
				height: "300px",
				pages: [this.oPage, this.oPage2]
			});
			this.fnNavigateToPage = function () {
				this.oNavContainer.to(this.oPage);
			};
			this.fnNavigateToPage2 = function () {
				this.oNavContainer.to(this.oPage2);
			};
			this.oDialog = new Dialog({
				title: "Dialog with NavContainer inside",
				content: [this.oNavContainer],
				endButton: new Button({
					text: "Close", press: function () {
						this.fnNavigateToPage();
						this.oDialog.close();
					}.bind(this)
				})
			});

		},
		afterEach: function () {
			this.iDialogOpeningsCount = null;
			this.iDialogOpeningDelay = null;
			this.oNavContainer.destroy();// the aggregated pages will be destroyed internally
			this.oDialog.destroy();
			this.oNavContainer = null;
			this.oDialog = null;
			this.oPage = null;
			this.oPage2 = null;
			this.fnNavigateToPage = null;
			this.fnNavigateToPage2 = null;
		}
	});

	QUnit.test("Child page is displayed after navigation upon Dialog closing", function(oAssert) {
		var fnDone = oAssert.async(),
			oNavContainer = this.oNavContainer,
			oDialog = this.oDialog;


		// Arrange
		// (1) Attach for NavContainer afterNavigate event.
		oNavContainer.attachAfterNavigate(function (oEvent) {
			var oDestinationPage = oEvent.getParameter("to"),
				bForwardNavigation = oDestinationPage.getId() === this.oPage2.getId(); // from oPage to oPage2

			if (bForwardNavigation && this.iDialogOpeningsCount === 2) {

				// Assert: the transition classes are cleaned up
				oAssert.strictEqual(oDestinationPage.hasStyleClass("sapMNavItemSliding"), false, " as the transition class is removed");
				oAssert.strictEqual(oDestinationPage.hasStyleClass("sapMNavItemCenter"), false, " as the transition class is removed");
				oAssert.strictEqual(oDestinationPage.hasStyleClass("sapMNavItemLeft"), false, " as the transition class is removed");

				fnDone();
				return;
			}

			bForwardNavigation && oDialog.getEndButton().firePress();
		}.bind(this));

		// (2) Attach for Dialog afterOpen and afterClose events.
		oDialog.attachAfterOpen(this.fnNavigateToPage2.bind(this));
		oDialog.attachAfterClose(function () {
			this.iDialogOpeningsCount++;
			// delay the opening to ensure the navigation transition, already triggered, is done when the dialog is in closed state.
			window.setTimeout(oDialog.open.bind(oDialog), this.iDialogOpeningDelay);
		}.bind(this));


		// Act
		// (1) Open the dialog.
		// (2) On Dialog`s afterOpen, navigation to oPage2 is performed.
		// (3) On NavContainer`s afterNavigate, the dialog is closed and navigation to oPage is performed in the same time.
		// (4) The dialog is reopened and the same navigation (to oPage2) is performed.
		this.iDialogOpeningsCount++;
		oDialog.open();
	});

	QUnit.module("NavContainer in Popover", {
		beforeEach: function () {
			this.sinon = sinon.sandbox.create();
			this.spy = this.sinon.spy(Popup.prototype, "close");
			this.oNavC = new sap.m.NavContainer("navC", {
				pages: [
					new sap.m.Page("page1a", {
						title: "page1a"
					}),
					new sap.m.Page("page2a", {
						title: "page2a"
					})
				]
			});
			this.oPopover = new sap.m.ResponsivePopover({
					contentWidth: "18rem",
					contentHeight: "24rem",
					content: [ this.oNavC ]
				});
			this.oOpeningBtn = new sap.m.Button();

			this.oOpeningBtn.addEventDelegate({
				"onAfterRendering": function() {
					this.oPopover.openBy(this.oOpeningBtn);
				}
			}, this);
		},
		afterEach: function () {
			this.oPopover.destroy();
			this.oOpeningBtn.destroy();

			this.oPopover = null;
			this.oNavC = null;
			this.oOpeningBtn = null;

			this.sinon.restore();
		}
	});

	QUnit.test("Focus is changed only after transition", function(oAssert) {
		var fnDone = oAssert.async(),
			oNavContainer = this.oNavC,
			oPopover = this.oPopover,
			transitionComplete = false;

		var oFocusable1 = new sap.m.Button({text: "focusable1"}),
			oFocusable2 = new sap.m.Button({text: "focusable2"});

		// Setup: add one focusable item in each page
		oNavContainer.getPages()[0].addContent(oFocusable1);
		oNavContainer.getPages()[1].addContent(oFocusable2);

		// Setup: navigation from page1 to page2
		oPopover.attachEventOnce("afterOpen", function() {
			oNavContainer.to("page2a");
			document.addEventListener("blur", fnOnBlur, true);
			oNavContainer.attachEventOnce("afterNavigate", function() {
				// Check
				assert.strictEqual(this.spy.called, false, "parent popup is not closed");
				fnDone();
			}, this);
		}, this);

		// Setup: flag when transition is over
		var fnOrig = oNavContainer._afterTransitionCallback;
		oNavContainer._afterTransitionCallback = function() {
			transitionComplete = true;
			fnOrig.apply(oNavContainer, arguments);
		};

		// Check
		var fnOnBlur = function(oEvent) {
			if (!Device.browser.msie) {
				assert.strictEqual(oEvent.target, oFocusable1.getDomRef());
				assert.ok(transitionComplete, "transition already completed");
			}
			document.removeEventListener("blur", fnOnBlur, true);
		};

		// Act
		this.oOpeningBtn.placeAt("content");

	});

	QUnit.module("Internal methods", {
		beforeEach: function () {
			this.nc = new NavContainer();
		},
		afterEach: function () {
			this.nc.destroy();
			this.nc = null;
		}
	});

	QUnit.test("_isFocusInControl", function (oAssert) {
		// Arrange
		var oInsideButton = new Button({text: "Inside Button"}),
			oOutsideButton = new Button({text: "Outside Button"}).placeAt("content"),
			oPage = new Page({
				content: [
					oInsideButton
				]
			}).placeAt("content");

		Core.applyChanges();

		// Act
		oInsideButton.$().focus();

		// Assert
		oAssert.strictEqual(this.nc._isFocusInControl(oPage), true, "A child of the page control is focused");

		// Act
		oOutsideButton.$().focus();

		// Assert
		oAssert.strictEqual(this.nc._isFocusInControl(oPage), false, "A child of the page control is not focused");

		// Cleanup
		oOutsideButton.destroy();
		oInsideButton.destroy();
		oPage.destroy();
	});
});