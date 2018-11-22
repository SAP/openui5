/* global QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Control",
	"sap/ui/core/Component",
	"sap/ui/core/IconPool",
	"sap/ui/core/AppCacheBuster",
	"sap/ui/core/Manifest",
	"sap/ui/core/Fragment",
	"sap/ui/core/XMLComposite",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/jquery",
	"test-resources/sap/ui/support/TestHelper",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(Log, Control, Component, IconPool, AppCacheBuster, Manifest, Fragment, XMLComposite, sinon, jQuery, testRule, createAndAppendDiv) {
	"use strict";

	// the rules rely on a certain log level for analyzing issues
	Log.setLevel(4);

	// create content div
	createAndAppendDiv('content');

	var iIncrement = 0;
	var fnIncrement = function(iNumber){
		return function(){
			iIncrement += iNumber;
			return iIncrement;
		};
	};

	QUnit.module("Renderer", {
		beforeEach: function(assert) {
			assert.ok(sap.ui.getCore().isInitialized(), "Core must be initialized");
			return new Promise(function(resolve) {

				var No = Control.extend("NoRendererControl", {
					metadata: {
						properties: {}
					}
				});
				var n = new No();
				n.placeAt("content");
				try {
					sap.ui.getCore().applyChanges();
				} catch (e) {
					// prevent 404 exception from breaking the test
					// the rule TestHelper does not support assert throwing
					// the actual check should be on a log for a sync XHR to "NoRendererControlRenderer.js"
					assert.ok(e, "404 should be fired for '" + e.message + "'");
					resolve();
				}
			});

		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "globalSyncXHR",
		async: true,
		expectedNumberOfIssues: fnIncrement(1)
	});

	QUnit.module("Component.prototype.getEventBus", {
		beforeEach: function() {
			var TestComp = Component.extend("test.Component", {
				metadata: {
					"properties" : {
						"test" : "string"
					},
					"my.config" : {
						"property1" : "value1"
					}
				}
			});

			new TestComp().getEventBus();
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "globalSyncXHR",
		async: true,
		expectedNumberOfIssues: fnIncrement(1)
	});

	QUnit.module("IconPool.getIconInfo", {
		beforeEach: function() {
			this.jQueryAjaxStub = sinon.stub(jQuery, "ajax").returns();
			var oTNTConfig = {
				fontFamily: "SAP-icons-TNT",
				fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/")
			};

			// register TNT icon font
			IconPool.registerFont(oTNTConfig);
			IconPool.getIconInfo("sap-icon://SAP-icons-TNT/technicalsystem");
		},
		afterEach: function(assert) {
			assert.equal(this.jQueryAjaxStub.callCount, 2, "1 for IconPool.registerFont, 1 for IconPool.getIconInfo");
			this.jQueryAjaxStub.restore();
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "globalSyncXHR",
		async: true,
		expectedNumberOfIssues: fnIncrement(1)
	});

	QUnit.module("Manifest.load", {
		beforeEach: function() {
			this.jQueryAjaxStub = sinon.stub(jQuery, "ajax").returns();
			Manifest.load({manifestUrl: "my/manifest.json"});
		},
		afterEach: function(assert) {
			assert.equal(this.jQueryAjaxStub.callCount, 1);
			this.jQueryAjaxStub.restore();
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "globalSyncXHR",
		async: true,
		expectedNumberOfIssues: fnIncrement(1)
	});

	QUnit.module("Core#getTemplate", {
		beforeEach: function() {
			this.requireSyncStub = sinon.spy(sap.ui, "requireSync");
			sap.ui.getCore().getTemplate();
		},
		afterEach: function(assert) {
			assert.equal(this.requireSyncStub.callCount, 1);
			this.requireSyncStub.restore();
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "globalSyncXHR",
		async: true,
		expectedNumberOfIssues: fnIncrement(1)
	});

	QUnit.module("Core#getEventBus", {
		beforeEach: function() {
			this.requireSyncStub = sinon.spy(sap.ui, "requireSync");
			this.requireStub = sinon.stub(sap.ui, "require").returns(undefined);
			sap.ui.getCore().getEventBus();
			this.requireSyncStub.restore();
			this.requireStub.restore();
		},
		afterEach: function(assert) {
			assert.equal(this.requireSyncStub.callCount, 1);
			this.requireSyncStub.restore();
			this.requireStub.restore();
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "globalSyncXHR",
		async: true,
		expectedNumberOfIssues: fnIncrement(1)
	});

});