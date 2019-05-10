/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/waitForThemeApplied",
	"sap/ui/Device",
	"jquery.sap.global",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Bar",
	"sap/m/library",
	"sap/m/StandardListItem",
	"sap/m/List",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button"
], function(
	qutils,
	createAndAppendDiv,
	waitForThemeApplied,
	Device,
	jQuery,
	App,
	Page,
	Bar,
	mobileLibrary,
	StandardListItem,
	List,
	JSONModel,
	Button
) {
	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	// some minimum height is required to ensure scrolling to certain positions in the tests works properly
	createAndAppendDiv("content").setAttribute("style", "height:300px;");



	jQuery(document).ready(function() {
		// do not let ui5 to retain the focus after rendering to make the scroll position test valid
		document.activeElement.blur();
	});


	function getScrollPos(){
		var s,
			scrollEnablement = page1.getScrollDelegate();

		if (scrollEnablement._scroller) { // iScroll
			if (Device.browser.mozilla) {
				s = jQuery.sap.byId("page1-scroll").css("-moz-transform").split(" ")[5]; // "matrix(1, 0, 0, -99.9999, 0px, 0px)" => "99.9999,"
			} else if (Device.browser.safari || Device.browser.chrome) {
				s = jQuery.sap.byId("page1-scroll").css("-webkit-transform").split(" ")[5];
			} else if (Device.browser.msie && Device.browser.version >= 9) {
				s = jQuery.sap.byId("page1-scroll").css("top");
			}
			return Math.round(parseFloat(s));

		} else { // NativeMouseScroller
			s = jQuery.sap.domById("page1-cont").scrollTop;
			return -s;
		}
	}

	var app = new App("myApp");

	var page1 = new Page("page1", {
		title : "Test Page",
		footer : new Bar({
			contentMiddle : []
		})
	});

	page1.addEventDelegate({
		onBeforeRendering: function () {
			document.activeElement.blur();
		}
	});

	var page2 = new Page("page2", {
		title : "Test Page 2",
		showNavButton: true,
		navButtonPress: function(){
			app.back();
		}
	});

	var page3 = new Page("page3", {
		title : "Test Page 3",
		showNavButton: true,
		navButtonPress: function(){
			app.back();
		}
	});


	var nav = [];
	for ( var i = 0; i < 100; i++) {
		nav[i] = [];
		nav[i].title = "List Item No: " + i;
		nav[i].description = Math.round(Math.random() * 9) + " Description Text";
		nav[i].type = ListType.Navigation;
	}

	var dataOverview = {
		navigation : nav
	};


	var oItemTemplate = new StandardListItem({
		title : "{title}",
		description : "{description}",
		icon : "../images/travel_expend.png",
		activeIcon : "../images/travel_expend_grey.png",
		type : "{type}",
		press: function(){
			app.to("page2");
		}
	});

	var oList1 = new List("growingList", {
		growing : true,
		growingThreshold : 40,
		growingScrollToLoad: false
	});


	function bindListData(data, itemTemplate, list) {
		var oModel = new JSONModel();
		oModel.setData(data);
		// set the model to the list
		list.setModel(oModel);

		// bind Aggregation
		list.bindAggregation("items", "/navigation", itemTemplate);
	}



	var oRerenderPageButton = new Button({
		text:"Rerender Page 1",
		press: function() {
			page1.rerender();
		}
	});
	var oRemovePageButton = new Button({
		text:"Remove Page 1",
		press: function() {
			page1.$().remove();
		}
	});
	var oRerenderAppButton = new Button({
		text:"Rerender App",
		press: function() {
			app.rerender();
		}
	});

	bindListData(dataOverview, oItemTemplate, oList1);
	page1.addContent(oList1);
	page2.addContent(oRerenderPageButton)
		.addContent(oRemovePageButton)
		.addContent(oRerenderAppButton);
	app.addPage(page1).addPage(page2);

	app.placeAt("content");


	/***************** TESTS ******************/

	QUnit.test("Page and List rendered", function(assert) {
		assert.ok(jQuery.sap.domById("page1"), "page1 should be rendered");
		assert.ok(jQuery.sap.domById("growingList"), "growingList should be rendered");
	});


	QUnit.test("Initial scroll position", function(assert) {
		assert.equal(page1.getScrollDelegate().getScrollTop(), 0, "page1 should be scrolled to position 0");
	});


	QUnit.test("Scrolling", function(assert) {
		page1.scrollTo(60, 0);

		assert.equal(getScrollPos(), -60, "Page should be scrolled to position 60");
		assert.equal(page1.getScrollDelegate().getScrollTop(), 60, "Internally stored y scrolling position should be 60");
	});

	QUnit.test("Scrolling - delayed", function(assert) {
		var done = assert.async();
		assert.expect(2);

		page1.scrollTo(50, 100);

		window.setTimeout(function(){
			assert.equal(getScrollPos(), -50, "Page should be scrolled to position 50");
			assert.equal(page1.getScrollDelegate().getScrollTop(), 50, "Internally stored y scrolling position should be 50");

			done();
		}, 150);
	});


	if (!Device.browser.internet_explorer) { // known gap in IE
		QUnit.test("Scroll position after rerendering page1", function(assert) {
			page1.rerender();

			assert.equal(getScrollPos(), -50, "Page should be scrolled to position 50");
			assert.equal(page1.getScrollDelegate().getScrollTop(), 50, "Internally stored y scrolling position should be 50");
		});

		QUnit.test("Scroll position after navigating away and back to page1", function(assert) {
			var done = assert.async();
			assert.expect(5);

			var interval = window.setInterval(function(){ // burst of logs to analyze future problems because this is the most tricky situation in IE
				jQuery.sap.log.info("page1 height: " + jQuery.sap.byId("page1-cont").height()
						+ ", scrollTop: " + jQuery.sap.domById("page1-cont").scrollTop
						+ "; page1 scroller thinks: " + page1.getScrollDelegate()._scrollY
						+ ", resizeListener: " + page1.getScrollDelegate()._sResizeListenerId);
			}, 200);

			var test = function() { // function to be executed after navigating forward and back
				assert.equal(getScrollPos(), -50, "Page should be scrolled to position 50");
				assert.equal(page1.getScrollDelegate().getScrollTop(), 50, "Internally stored y scrolling position should be 50");

				app.detachAfterNavigate(test);
				window.clearInterval(interval);
				done();
			};

			var goBack = function() {
				assert.equal(page1.getScrollDelegate().getScrollTop(), 50, "Internally stored y scrolling position should be 50");
				app.detachAfterNavigate(goBack);
				app.attachAfterNavigate(test);

				window.setTimeout(function(){ // just to make sure the browser has settled down. Theoretically not required.
					assert.equal(page1.getScrollDelegate().getScrollTop(), 50, "Internally stored y scrolling position should be 50");
					app.back();
				}, 100);
			};

			app.attachAfterNavigate(goBack);
			app.to("page2");
			assert.equal(page1.getScrollDelegate().getScrollTop(), 50, "Internally stored y scrolling position should be 50");
		});
	}


	QUnit.test("Scroll position after navigating away and rerendering the page and navigating back to page1", function(assert) {
		var done = assert.async();
		assert.expect(5);

		var test = function() { // function to be executed after navigating forward and back
			window.setTimeout(function() {
				assert.equal(getScrollPos(), -50, "Page should be scrolled to position 50");
				assert.equal(page1.getScrollDelegate().getScrollTop(), 50, "Internally stored y scrolling position should be 50");

				app.detachAfterNavigate(test);
				done();
			}, 300);
		};

		var goBack = function() {
			app.detachAfterNavigate(goBack);
			app.attachAfterNavigate(test);

				page1.rerender();

				assert.equal(page1.getScrollDelegate().getScrollTop(), 50, "Internally stored y scrolling position should be 50");

				window.setTimeout(function(){ // just to make sure the browser has settled down. Theoretically not required.
					assert.equal(page1.getScrollDelegate().getScrollTop(), 50, "Internally stored y scrolling position should be 50");
					app.back();
				}, 100);
		};

		app.attachAfterNavigate(goBack);
		app.to("page2");
		assert.equal(page1.getScrollDelegate().getScrollTop(), 50, "Internally stored y scrolling position should be 50");
	});


	QUnit.test("Scroll position after rerendering the APP", function(assert) {
		app.rerender();

		assert.equal(getScrollPos(), -50, "Page should be scrolled to position 50");
		assert.equal(page1.getScrollDelegate().getScrollTop(), 50, "Internally stored y scrolling position should be 50");
	});

	if (!Device.browser.internet_explorer) {

		QUnit.test("Scroll position after navigating away and rerendering the APP and navigating back to page1", function(assert) {
			var done = assert.async();
			assert.expect(2);

			var test = function() { // function to be executed after navigating forward and back
				window.setTimeout(function(){
					assert.equal(getScrollPos(), -50, "Page should be scrolled to position 50");
					assert.equal(page1.getScrollDelegate().getScrollTop(), 50, "Internally stored y scrolling position should be 50");

					app.detachAfterNavigate(test);
					done();
				}, 300);
			};

			var goBack = function() {
				app.detachAfterNavigate(goBack);
				app.attachAfterNavigate(test);

					app.rerender();

					window.setTimeout(function(){ // just to make sure the browser has settled down. Theoretically not required.
						app.back();
					}, 100);
			};

			app.attachAfterNavigate(goBack);
			app.to("page2");
		});


		QUnit.test("Scroll position after navigating away and removing page1 from DOM and navigating back to page1", function(assert) {
			var done = assert.async();
			assert.expect(4);

			var test = function() { // function to be executed after navigating forward and back
				window.setTimeout(function() {
					assert.equal(getScrollPos(), -50, "Page should be scrolled to position 50");
					assert.equal(page1.getScrollDelegate().getScrollTop(), 50, "Internally stored y scrolling position should be 50");

					app.detachAfterNavigate(test);
					done();
				}, 300);
			};

			var goBack = function() {
				app.detachAfterNavigate(goBack);
				app.attachAfterNavigate(test);

				page1.$().remove();

				assert.equal(page1.getScrollDelegate().getScrollTop(), 50, "Internally stored y scrolling position should be 50");

				window.setTimeout(function(){ // just to make sure the browser has settled down. Theoretically not required.
					app.back();
					assert.equal(page1.getScrollDelegate().getScrollTop(), 50, "Internally stored y scrolling position should be 50");
				}, 100);
			};

			app.attachAfterNavigate(goBack);
			app.to("page2");
		});
	}


	QUnit.test("Scroll position after making the page huge", function(assert) {
		var done = assert.async();
		assert.expect(4);

		jQuery("#content").css("height", "3000px");

		window.setTimeout(function(){
			assert.equal(getScrollPos(), 0, "Page should be scrolled to position 0");
			assert.equal(page1.getScrollDelegate().getScrollTop(), 0, "Internally stored y scrolling position should be 0");

			page1.scrollTo(50, 0, 0); // try to scroll when it should not be possible

			assert.equal(getScrollPos(), 0, "Page should still be scrolled to position 0");
			assert.equal(page1.getScrollDelegate().getScrollTop(), 0, "Internally stored y scrolling position should still be 0");

			done();
		}, 300); // required for iScroll with resize Handler
	});

	QUnit.test("Scroll position after making the page small again", function(assert) {
		var done = assert.async();
		assert.expect(2);

		jQuery("#content").css("height", "300px");

		window.setTimeout(function(){
			assert.equal(getScrollPos(), 0, "Page should be scrolled to position 0");
			assert.equal(page1.getScrollDelegate().getScrollTop(), 0, "Internally stored y scrolling position should be 0");

			done();
		}, 10);
	});

	QUnit.test("Scroll position after making the page huge and trying animated scrolling", function(assert) {
		var done = assert.async();
		assert.expect(2);

		jQuery("#content").css("height", "3000px");
		page1.scrollTo(50, 100); // try to scroll when it should not be possible

		window.setTimeout(function(){
			assert.equal(getScrollPos(), 0, "Page should still be scrolled to position 0");
			assert.equal(page1.getScrollDelegate().getScrollTop(), 0, "Internally stored y scrolling position should still be 0");

			jQuery("#content").css("height", "300px");
			done();
		}, 700); // required for scroll duration plus iScroll with resize Handler plus rubberband effect
	});

	return waitForThemeApplied();
});
