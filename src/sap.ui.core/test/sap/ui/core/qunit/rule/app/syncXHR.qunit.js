/* global QUnit */
/**
 * @fileoverview
 * @deprecated
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/core/IconPool",
	"sap/ui/core/Manifest",
	"sap/ui/core/UIArea",
	"sap/ui/thirdparty/sinon",
	"test-resources/sap/ui/support/TestHelper",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(Log, Control, Core, IconPool, Manifest, UIArea, sinon, testRule, createAndAppendDiv) {
	"use strict";

	// the rules rely on a certain log level for analyzing issues
	Log.setLevel(4);

	// create content div
	createAndAppendDiv('content');

	/**
	 * @deprecated
	 */
	var fnOrigRerender;
	var iIncrement = 0;
	var fnIncrement = function(iNumber){
		return function(){
			iIncrement += iNumber;
			return iIncrement;
		};
	};

	/**
	 * @deprecated
	 */
	QUnit.module("Renderer", {
		beforeEach: function(assert) {
			fnOrigRerender = UIArea.prototype.rerender;
			UIArea.prototype.rerender = function() {
				try {
					fnOrigRerender.apply(this, arguments);
				} catch (e) {
					// prevent 404 exception from breaking the test
					// the rule TestHelper does not support assert throwing
					// the actual check should be on a log for a sync XHR to "NoRendererControlRenderer.js"
					assert.ok(e, "404 should be fired for '" + e.message + "'");
				}
			};
			return Core.ready().then(function() {
				assert.ok(true, "Core must be initialized");

				var No = Control.extend("NoRendererControl", {
					metadata: {
						properties: {}
					}
				});
				var n = new No();
				n.placeAt("content");
				// wait for rendering
				return new Promise(function(resolve) {
					setTimeout(resolve);
				});
			});

		},
		afterEach: function() {
			UIArea.prototype.rerender = fnOrigRerender;
		}
	});

	/**
	 * @deprecated
	 */
	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "globalSyncXHR",
		async: true,
		expectedNumberOfIssues: fnIncrement(1)
	});

	QUnit.module("IconPool.getIconInfo", {
		beforeEach: function() {
			this.xhrOpenSpy = this.spy(XMLHttpRequest.prototype, "open");
			var oTNTConfig = {
				fontFamily: "SAP-icons-TNT",
				fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/")
			};

			// register TNT icon font
			IconPool.registerFont(oTNTConfig);
			IconPool.getIconInfo("sap-icon://SAP-icons-TNT/technicalsystem");
		},
		afterEach: function(assert) {
			assert.equal(this.xhrOpenSpy.callCount, 2, "1 for IconPool.registerFont, 1 for IconPool.getIconInfo");
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
		beforeEach: function(assert) {
			this.xhrOpenSpy = this.spy(XMLHttpRequest.prototype, "open");
			try {
				Manifest.load({manifestUrl: "my/manifest.json"});
			} catch (error) {
				assert.ok(error, "Manifest does not exist, but it's okay - Move on.");
			}
		},
		afterEach: function(assert) {
			assert.equal(this.xhrOpenSpy.callCount, 1);
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