/*global QUnit, sinon */
sap.ui.define([
	"sap/base/util/ObjectPath",
	"sap/ui/core/mvc/View",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery"
], function(ObjectPath, View, createAndAppendDiv, nextUIUpdate, jQuery) {
	"use strict";

	// create content div
	createAndAppendDiv("content");

	QUnit.module("Start-up");

	function asyncTestsuite(sCaption, oConfig) {

		var sSource, sType, fnFactory, xhr;

		fnFactory = oConfig.factory;

		sType = oConfig.type.toLowerCase();

		// preload the view source
		jQuery.ajax({
			url : sap.ui.require.toUrl("testdata/mvc/Async.view." + sType),
			success : function(data) {
				sSource = oConfig.receiveSource(data);
			},
			async : false,
			// avoid that jQuery executes the loaded code in case of JSView which causes CSP violation
			dataType: sType === "js" ? "text" : undefined
		});

		// fake an asynchronous resource request to have control over the delay
		xhr = sinon.useFakeXMLHttpRequest();
		xhr.useFilters = true;
		xhr.addFilter(function(method, url) {
			return url.indexOf("testdata/Async.view." + sType) == -1;
		});

		xhr.onCreate = function(request) {
			request.onSend = function() {
				if (!request.async) {
					request.respond(200,  {"Content-Type" : "application/" + sType}, sSource);
				} else {
					setTimeout(function() {
						request.respond(200,  {"Content-Type" : "application/" + sType}, sSource);
					}, 50);
				}
			};
		};

		QUnit.module(sCaption, {
			beforeEach: function() {
				this.oAfterInitSpy = sinon.spy(View.prototype, "fireAfterInit");
				this.oView = null;
			},
			afterEach: function() {
				this.oAfterInitSpy.restore();
				if (this.oView) {
					this.oView.destroy();
				}
			}
		});

		QUnit.test("Preparation - View requirements", function(assert) {
			const done = assert.async();
			assert.expect(2);
			sap.ui.require([
				"sap/ui/core/mvc/" + oConfig.type + "View"
			], function(FNViewClass) {
				assert.ok(FNViewClass.asyncSupport, "View type supports asynchronous loading");
				assert.ok(FNViewClass.prototype.loaded, "View type supports Promises via loaded method");
				done();
			}, function(oErr) {
				assert.strictEqual(oErr, {}, `couldn't load view type ${oConfig.type}`);
				done();
			});
		});

		QUnit.test("Preparation - View source preload", function(assert) {
			assert.expect(1);
			assert.ok(sSource !== undefined, "View content was preloaded synchronously");
		});

		QUnit.test("Rendering - asynchronous resource loading", function (assert) {
			assert.expect(2);
			return fnFactory().then(function(oView) {
				this.oView = oView;
				this.oView.placeAt("content");

				assert.ok(this.oView, "Instance has been created");
				assert.ok(this.oView instanceof View, "Instance is a View");
				return nextUIUpdate();
			}.bind(this));
		});


		QUnit.test("Promise - loaded() for async view", function(assert) {
			assert.expect(3);
			return fnFactory().then(function(oView) {
				this.oView = oView;

				var oPromise = this.oView.loaded();
				assert.ok(oPromise instanceof Promise, "Promise returned");

				var that = this;
				return oPromise.then(function(oViewLoaded) {
					assert.ok(that.oAfterInitSpy.calledOnce, "AfterInit event fired before resolving");
					assert.deepEqual(that.oView, oViewLoaded, "Views equal deeply");

				});
			}.bind(this));
		});
	}

	return asyncTestsuite;

});
