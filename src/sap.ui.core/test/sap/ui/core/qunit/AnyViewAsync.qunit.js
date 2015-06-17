module("Start-up");

test("Check dependencies", 4, function() {
	jQuery.sap.require("sap.ui.core.mvc.JSONView");
	jQuery.sap.require("sap.ui.core.mvc.JSView");
	jQuery.sap.require("sap.ui.core.mvc.XMLView");
	jQuery.sap.require("sap.ui.core.mvc.HTMLView")
	ok(sap.ui.core.mvc.JSONView, "sap.ui.core.mvc.JSONView must be defined");
	ok(sap.ui.core.mvc.JSView, "sap.ui.core.mvc.JSView must be defined");
	ok(sap.ui.core.mvc.XMLView, "sap.ui.core.mvc.XMLView must be defined");
	ok(sap.ui.core.mvc.HTMLView, "sap.ui.core.mvc.HTMLView must be defined");
});

function asyncTestsuite(sCaption, oConfig) {

	var sSource, sType, fnReceiveSource, fnFactory, sUrl, xhr;

	fnReceiveSource = oConfig.receiveSource;
	fnFactory = oConfig.factory;

	jQuery.sap.registerModulePath("testdata", "testdata");

	sType = oConfig.type.toLowerCase();

	// preload the view source
	jQuery.ajax({
		url : "testdata/mvc/Async.view." + sType,
		success : function(data) {
			sSource = oConfig.receiveSource(data);
		},
		async : false
	});

	// fake an asynchronous resource request to have control over the delay
	xhr = sinon.useFakeXMLHttpRequest();
	xhr.useFilters = true;
	xhr.addFilter(function(method, url) {
		return url.indexOf("testdata/mvc/Async.view." + sType) == -1;
	});

	xhr.onCreate = function(request) {
		request.onSend = function() {
			if(!request.async) {
				request.respond(200,  {"Content-Type" : "application/" + sType}, sSource);
			} else {
				setTimeout(function() {
					request.respond(200,  {"Content-Type" : "application/" + sType}, sSource);
				}, 50);
			}
		};
	};

	module(sCaption, {
		beforeEach : function() {
			this.oAfterInitSpy = sinon.spy(sap.ui.core.mvc.View.prototype, "fireAfterInit");
			this.oView;
		},
		afterEach : function() {
			this.oAfterInitSpy.restore();
			if(this.oView) {
				this.oView.destroy();
			}
		}
	});

	test("Preparation - View requirements", 2, function() {
		var view = jQuery.sap.getObject("sap.ui.core.mvc." + oConfig.type + "View");
		ok(view.asyncSupport, "View type supports asynchronous loading");
		ok(view.prototype.loaded, "View type supports Promises via loaded method");
	});

	test("Preparation - View source preload", 1, function() {
		ok(sSource !== undefined, "View content was preloaded synchronously");
	});

	test("Rendering - synchronous resource loading", 3, function () {
		this.oView = fnFactory();
		this.oView.placeAt("content");
		sap.ui.getCore().applyChanges();

		ok(this.oView, "Instance has been created");
		ok(this.oView instanceof sap.ui.core.mvc.View, "Instance is a View");
		ok(this.oView.$().children().length, "View content was rendered synchronously");
	});

	asyncTest("Rendering - asynchronous resource loading", 5, function () {
		this.oView = fnFactory(true); //true for async

		// event attachement needs to be done immediately, otherwise the event may be fired beforehands
		var that = this;
		this.oView.attachAfterInit(function() {
			sap.ui.getCore().applyChanges();
			ok(that.oView.$().children().length, "View content was rendered");
			start();
		});

		this.oView.placeAt("content");
		ok(this.oView, "Instance has been created");
		ok(this.oView instanceof sap.ui.core.mvc.View, "Instance is a View");

		sap.ui.getCore().applyChanges();
		ok(this.oView.$().length, "View was rendered empty");
		ok(!this.oView.$().children().length, "View content is not rendered yet");

	});

	asyncTest("Promise - loaded() for sync view", 3, function() {
		this.oView = fnFactory();

		var oPromise = this.oView.loaded();
		ok(oPromise instanceof Promise, "Promise returned");

		var that = this;
		oPromise.then(function(oViewLoaded) {
			ok(that.oAfterInitSpy.calledOnce, "AfterInit event fired before resolving");
			deepEqual(that.oView, oViewLoaded, "Views equal deeply");
			start();
		});
	});


	asyncTest("Promise - loaded() for async view", 3, function() {
		this.oView = fnFactory(true);

		var oPromise = this.oView.loaded();
		ok(oPromise instanceof Promise, "Promise returned");

		var that = this;
		oPromise.then(function(oViewLoaded) {
			ok(that.oAfterInitSpy.calledOnce, "AfterInit event fired before resolving");
			deepEqual(that.oView, oViewLoaded, "Views equal deeply");
			start();
		});
	});

}
