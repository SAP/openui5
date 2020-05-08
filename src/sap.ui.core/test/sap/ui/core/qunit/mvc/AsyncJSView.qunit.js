/*global QUnit, sinon */
sap.ui.define([
	"./AnyViewAsync.qunit",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/JSView",
	"sap/ui/core/mvc/XMLView",
	"sap/base/Log"
], function(asyncTestsuite, View, JSView, XMLView, Log) {
	"use strict";

	// setup test config with generic factory
	var oConfig = {
		type : "JS",
		factory : function(bAsync) {
			return sap.ui.view({
				type : "JS",
				viewName : "testdata.mvc.Async",
				async : bAsync
			});
		},
		receiveSource : function(source) {
			return source;
		}
	};
	asyncTestsuite("Generic View Factory", oConfig);

	// switch factory function
	oConfig.factory = function(bAsync) {
		return sap.ui.jsview("testdata.mvc.Async", !!bAsync);
	};
	asyncTestsuite("Legacy JSView Factory", oConfig);



	QUnit.module("JSView.create Factory", {
		beforeEach: function() {
			this.oAfterInitSpy = sinon.spy(View.prototype, "fireAfterInit");
		},
		afterEach: function() {
			this.oAfterInitSpy.restore();
		}
	});

	QUnit.test("asynchronous resource loading", function(assert) {
		assert.expect(3);
		this.oLogMock = this.mock(Log);
		this.oLogMock.expects("warning").never();

		return JSView.create({
			viewName : "testdata.mvc.Async"
		}).then(function(oViewLoaded) {
			assert.equal(this.oAfterInitSpy.callCount, 1, "AfterInit event fired before resolving");
			assert.ok(oViewLoaded instanceof JSView, "Views equal deeply");
			oViewLoaded.destroy();
		}.bind(this));
	});



	QUnit.module("Typed Views", {
		beforeEach: function() {
			this.oAfterInitSpy = sinon.spy(View.prototype, "fireAfterInit");
		},
		afterEach: function() {
			this.oAfterInitSpy.restore();
		}
	});

	QUnit.test("sap.ui.jsview throws Error", function(assert) {
		assert.expect(1);

		assert.throws(function() {
			sap.ui.jsview("myView", "module:testdata/mvc/TypedView");
		}, "Legacy factory sap.ui.jsview doesn't support typed views!");
	});

	QUnit.test("Created via JSView.create", function(assert) {
		assert.expect(3);

		return JSView.create({
			viewName : "module:testdata/mvc/TypedView"
		}).then(function(oTypedView) {
			assert.equal(this.oAfterInitSpy.callCount, 1, "AfterInit event fired before resolving");
			assert.ok(oTypedView.isA("testdata.mvc.TypedView"), "Views is a typed view");
			assert.ok(oTypedView.byId("myPanel").isA("sap.m.Panel"), "Content created successfully");
			oTypedView.destroy();
		}.bind(this));
	});
});