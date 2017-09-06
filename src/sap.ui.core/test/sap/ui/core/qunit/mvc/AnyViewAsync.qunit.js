/*global sinon */

sap.ui.define([
	'sap/ui/core/mvc/View',
	'sap/ui/core/mvc/JSONView',
	'sap/ui/core/mvc/JSView',
	'sap/ui/core/mvc/XMLView',
	'sap/ui/core/mvc/HTMLView'
], function(View, JSONView, JSView, XMLView, HTMLView) {

	QUnit.module("Start-up");

	QUnit.test("Check dependencies", function(assert) {
		assert.expect(4);
		assert.ok(JSONView, "sap.ui.core.mvc.JSONView must be defined");
		assert.ok(JSView, "sap.ui.core.mvc.JSView must be defined");
		assert.ok(XMLView, "sap.ui.core.mvc.XMLView must be defined");
		assert.ok(HTMLView, "sap.ui.core.mvc.HTMLView must be defined");
	});

	function asyncTestsuite(sCaption, oConfig) {

		var sSource, sType, fnReceiveSource, fnFactory, sUrl, xhr;

		fnReceiveSource = oConfig.receiveSource;
		fnFactory = oConfig.factory;

		sType = oConfig.type.toLowerCase();

		// preload the view source
		jQuery.ajax({
			url : "testdata/Async.view." + sType,
			success : function(data) {
				sSource = oConfig.receiveSource(data);
			},
			async : false
		});

		// fake an asynchronous resource request to have control over the delay
		xhr = sinon.useFakeXMLHttpRequest();
		xhr.useFilters = true;
		xhr.addFilter(function(method, url) {
			return url.indexOf("testdata/Async.view." + sType) == -1;
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

		QUnit.module(sCaption, {
			beforeEach : function() {
				this.oAfterInitSpy = sinon.spy(View.prototype, "fireAfterInit");
				this.oView;
			},
			afterEach : function() {
				this.oAfterInitSpy.restore();
				if(this.oView) {
					this.oView.destroy();
				}
			}
		});

		QUnit.test("Preparation - View requirements", function(assert) {
			assert.expect(2);
			var view = jQuery.sap.getObject("sap.ui.core.mvc." + oConfig.type + "View");
			assert.ok(view.asyncSupport, "View type supports asynchronous loading");
			assert.ok(view.prototype.loaded, "View type supports Promises via loaded method");
		});

		QUnit.test("Preparation - View source preload", function(assert) {
			assert.expect(1);
			assert.ok(sSource !== undefined, "View content was preloaded synchronously");
		});

		QUnit.test("Rendering - synchronous resource loading", function (assert) {
			assert.expect(3);
			this.oView = fnFactory();
			this.oView.placeAt("content");
			sap.ui.getCore().applyChanges();

			assert.ok(this.oView, "Instance has been created");
			assert.ok(this.oView instanceof View, "Instance is a View");
			assert.ok(this.oView.$().children().length, "View content was rendered synchronously");
		});

		QUnit.test("Rendering - asynchronous resource loading", function (assert) {
			assert.expect(5);
			var done = assert.async();
			this.oView = fnFactory(true); //true for async

			// event attachement needs to be done immediately, otherwise the event may be fired beforehands
			var that = this;
			this.oView.attachAfterInit(function() {
				sap.ui.getCore().applyChanges();
				assert.ok(that.oView.$().children().length, "View content was rendered");
				done();
			});

			this.oView.placeAt("content");
			assert.ok(this.oView, "Instance has been created");
			assert.ok(this.oView instanceof View, "Instance is a View");

			sap.ui.getCore().applyChanges();
			assert.ok(this.oView.$().length, "View was rendered empty");
			assert.ok(!this.oView.$().children().length, "View content is not rendered yet");

		});

		QUnit.test("Promise - loaded() for sync view", function(assert) {
			assert.expect(3);
			var done = assert.async();
			this.oView = fnFactory();

			var oPromise = this.oView.loaded();
			assert.ok(oPromise instanceof Promise, "Promise returned");

			var that = this;
			oPromise.then(function(oViewLoaded) {
				assert.ok(that.oAfterInitSpy.calledOnce, "AfterInit event fired before resolving");
				assert.deepEqual(that.oView, oViewLoaded, "Views equal deeply");
				done();
			});
		});


		QUnit.test("Promise - loaded() for async view", function(assert) {
			assert.expect(3);
			var done = assert.async();
			this.oView = fnFactory(true);

			var oPromise = this.oView.loaded();
			assert.ok(oPromise instanceof Promise, "Promise returned");

			var that = this;
			oPromise.then(function(oViewLoaded) {
				assert.ok(that.oAfterInitSpy.calledOnce, "AfterInit event fired before resolving");
				assert.deepEqual(that.oView, oViewLoaded, "Views equal deeply");
				done();
			});
		});

	}

	return asyncTestsuite;

});