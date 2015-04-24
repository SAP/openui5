/*
 * an initial check to be executed before other MVC tests start
 */
test("InitialCheck", 6, function() {
	jQuery.sap.require("sap.ui.core.mvc.Controller");
	jQuery.sap.require("sap.ui.core.mvc.JSONView");
	jQuery.sap.require("sap.ui.core.mvc.JSView");
	jQuery.sap.require("sap.ui.core.mvc.XMLView");
	jQuery.sap.require("sap.ui.core.mvc.HTMLView")
	ok(sap.ui.core.mvc.Controller, "sap.ui.core.mvc.Controller must be defined");
	ok(sap.ui.core.mvc.JSONView, "sap.ui.core.mvc.JSONView must be defined");
	ok(sap.ui.core.mvc.JSView, "sap.ui.core.mvc.JSView must be defined");
	ok(sap.ui.core.mvc.XMLView, "sap.ui.core.mvc.XMLView must be defined");
	ok(sap.ui.core.mvc.HTMLView, "sap.ui.core.mvc.HTMLView must be defined");
	ok(sap.ui.controller, "sap.ui.controller must be defined");
});

function testsuite(oConfig, sCaption, fnViewFactory, bCheckViewData) {

	var view;

	module(sCaption);

	test("View Instantiation: default controller instantiation", 7, function() {
		// define View and place it onto the page
		window.onInitCalled = false;
		view = fnViewFactory();
		ok(view, "view must exist after creation");
		var fnClass = jQuery.sap.getObject(oConfig.viewClassName);
		ok(view instanceof fnClass, "view must be instance of " + oConfig.viewClassName);
	});

	test("View Instantiation: default controller instantiation - async", 7, function() {
		// define View and place it onto the page
		window.onInitCalled = false;
		view = fnViewFactory({async: true});
		ok(view, "view must exist after creation");
		var fnClass = jQuery.sap.getObject(oConfig.viewClassName);
		ok(view instanceof fnClass, "view must be instance of " + oConfig.viewClassName);
	});

	test("Controller Instantiation", 2, function() {
		var controller = view.getController();
		ok(controller, "controller must exist after creation");
		ok(controller instanceof sap.ui.core.mvc.Controller, "controller must be instanceof sap.ui.core.mvc.Controller");
	});

	test("Lifecycle: onInit", 1, function() {
		ok(window.onInitCalled, "controller.onInit should be called by now");
		window.onInitCalled = false;
	});

	test("Lifecycle: onAfterRendering", 6, function() {
		window.onAfterRenderingCalled = false;
		view.placeAt("content");
		sap.ui.getCore().applyChanges();

		function doCheck() {
			ok(window.onAfterRenderingCalled, "controller.onAfterRendering should be called by now");
			window.onAfterRenderingCalled = false;
		}

		if (!!sap.ui.Device.browser.safari) {
			stop();
			setTimeout(function() {
				start();
				doCheck();
			}, 1000);
		} else {
			doCheck();
		}
	});

	test("SAPUI5 Rendering", oConfig.idsToBeChecked.length, function() {
		for(var i=0; i<oConfig.idsToBeChecked.length; i++) {
			var $ = jQuery.sap.byId(view.createId(oConfig.idsToBeChecked[i]));
			equal($.length, 1,  "Element " + oConfig.idsToBeChecked[i] + " rendered");
		}
	});

	test("Aggregation", 1, function() {
		expect(1);
		$button = jQuery.sap.byId(view.createId("Button2"));
		equal($button.length, 1,  "SAPUI5 Button rendered in aggregation");
	});

	test("Child Views exists", 3, function() {
		$JSONView = jQuery.sap.byId(view.createId("MyJSONView"));
		equal($JSONView.length, 1, "Child View (JSONView) should be rendered");
		$JSView = jQuery.sap.byId(view.createId("MyJSView"));
		equal($JSONView.length, 1, "Child View (JSView) should be rendered");
		$XMLView = jQuery.sap.byId(view.createId("MyXMLView"));
		equal($XMLView.length, 1, "Child View (XMLView) should be rendered");
	});

	test("Child Views content rendered", 9, function() {
		var oJSONView = view.byId("MyJSONView");
		$button = jQuery.sap.byId(oJSONView.createId("Button1"));
		equal($button.length, 1, "Content of Child View (JSONView) should be rendered");
		var oLabel1 = oJSONView.byId("Label1");
		ok(oLabel1, "exists");
		equal(oLabel1.getLabelFor(), oJSONView.createId("Button1"), "assocation has been fixed");

		var oJSView = view.byId("MyJSView");
		$button = jQuery.sap.byId(oJSView.createId("Button1"));
		equal($button.length, 1, "Content of Child View (JSView) should be rendered");
		var oLabel = oJSView.byId("Label1");
		ok(!!oLabel, "Label exists");
		equal(oLabel.getLabelFor(), oJSView.createId("Button1"), "Association has been adapted");

		var oXMLView = view.byId("MyXMLView");
		$button2 = jQuery.sap.byId(oXMLView.createId("Button1"));
		equal($button2.length, 1, "Content of Child View (XMLView) should be rendered");
		var oLabel = oXMLView.byId("Label1");
		ok(!!oLabel, "Label exists");
		equal(oLabel.getLabelFor(), oXMLView.createId("Button1"), "Association has been adapted");
	});

	asyncTest("Eventhandling", 2, function() {
		qutils.triggerMouseEvent(jQuery.sap.byId(view.createId("Button1")), "click", 1, 1, 1, 1);
		setTimeout(function() {
			start();
		}, 500);

	});

	test("Re-Rendering", 5+oConfig.idsToBeChecked.length, function() {
		window.onBeforeRenderingCalled = false;
		window.onAfterRenderingCalled = false;
		view.invalidate();
		sap.ui.getCore().applyChanges();

		function doCheck() {
			for(var i=0; i<oConfig.idsToBeChecked.length; i++) {
				var $ = jQuery.sap.byId(view.createId(oConfig.idsToBeChecked[i]));
				equal($.length, 1,  "Element " + oConfig.idsToBeChecked[i] + " rendered again");
			}
		}

		if (!!sap.ui.Device.browser.safari) {
			stop();
			setTimeout(function() {
				start();
				doCheck();
			}, 1000);
		} else {
			doCheck();
		}
	});

	test("Lifecycle: onBeforeRendering", 1, function() {
		ok(window.onBeforeRenderingCalled, "controller.onBeforeRendering should be called by now");
		window.onBeforeRenderingCalled = false;
	});

	test("Lifecycle: onAfterRendering (re-rendering)", 1, function() {
		ok(window.onAfterRenderingCalled, "controller.onAfterRendering should be called again by now");
		window.onAfterRenderingCalled = false;
	});

	// execute additional tests, when specified
	if ( bCheckViewData ) {
		test("View Data available in controller hooks", 4, function() {
			equal(window.dataOnInit, "testdata", "View Data should be available in onInit of controller");
			window.dataOnInit = null;
			equal(window.dataAfterRendering, "testdata", "View Data should be available in onAfterRendering of controller");
			window.dataAfterRendering = null;
			equal(window.dataBeforeRendering, "testdata", "View Data should be available in onBeforeRendering of controller");
			window.dataBeforeRendering = null;
			equal(window.dataEventHandler, "testdata", "View Data should be available in event handlers of controller");
			window.dataEventHandler = null;
		});
	}

	test("Lifecycle: onExit", 1, function() {
		window.onExitCalled = false;
		view.destroy();
		ok(window.onExitCalled, "onExit should have been called");
		window.onExitCalled = false;
	});

	test("Lifecycle: NO onBeforeRendering when exiting", 1, function() {
		ok(!window.onBeforeRenderingCalled, "controller.onBeforeRendering should not be called when exiting");
		window.onBeforeRenderingCalled = false;
	});

	test("Lifecycle: NO onAfterRendering when exiting", 1, function() {
		ok(!window.onAfterRenderingCalled, "controller.onAfterRendering should not be called again");
		window.onAfterRenderingCalled = false;
	});

	test("Lifecycle: NO content after destroy()", oConfig.idsToBeChecked.length, function() {
		for(var i=0; i<oConfig.idsToBeChecked.length; i++) {
			var $ = jQuery.sap.byId(view.createId(oConfig.idsToBeChecked[i]));
			equal($.length, 0, "Content " + oConfig.idsToBeChecked[i] + " should no longer be there");
		}
	});


	// asyncTest("Async View Instantiation: loaded() method", function() {
	// 	// define View and place it onto the page
	// 	window.onInitCalled = false;
	// 	view = fnViewFactory({async: true});
	// 	var oPromise = view.loaded()
	// 	ok(oPromise instanceof Promise, "loaded() should return a promise");
	// 	oView.loaded().then(function(oViewLoaded) {
	// 		deepEqual(oView, oViewLoaded, "view returned and view resolved with should equal");
	// 		start();
	// 	});
	// });

}
