/* global sinon, QUnit */

sap.ui.define([
	"jquery.sap.global", // provides jQuery.sap.FrameOptions
	"sap/base/Log"
], function(jQuery, Log) {
	"use strict";

	function mockBrowserAPI(oTest, mOptions) {

		// holds mocked functions for assertions
		var oSpies = {
			window: {},
			parent: {}
		};

		// window
		jQuery.sap.FrameOptions.__window = {};
		jQuery.sap.FrameOptions.__window.document = {
			URL: 'http://localhost/fake.html'
		};
		oSpies.window.addEventListener = oTest.spy(function() {
			oSpies.window.eventListenerFn = arguments[1];
			oSpies.window.eventListener = oTest.spy(arguments[1]);
		});
		if (window.addEventListener) {
			jQuery.sap.FrameOptions.__window.addEventListener = oSpies.window.addEventListener;
		} else {
			jQuery.sap.FrameOptions.__window.attachEvent = oSpies.window.addEventListener;
		}

		// parent
		jQuery.sap.FrameOptions.__parent = {};

		jQuery.sap.FrameOptions.__parent.postMessage = oSpies.parent.postMessage = oTest.spy(function(sMessage, sTargetOrigin) {
			if (sMessage === 'SAPFrameProtection*require-origin') {
				switch (mOptions.parentMode) {
					case "SAFE":
						setTimeout(function() {
							oSpies.window.eventListener.call(null, {
								source: jQuery.sap.FrameOptions.__parent,
								data: 'SAPFrameProtection*parent-unlocked',
								origin: 'http://some.other.origin.local'
							});
						}, 0);
						break;
					case "UNSAFE":
						setTimeout(function() {
							oSpies.window.eventListener.call(null, {
								source: jQuery.sap.FrameOptions.__parent,
								data: 'SAPFrameProtection*parent-origin',
								origin: 'http://some.other.origin.local'
							});
						}, 0);
						break;
					case "SAFE_DELAYED":
						setTimeout(function() {
							oSpies.window.eventListener.call(null, {
								source: jQuery.sap.FrameOptions.__parent,
								data: 'SAPFrameProtection*parent-origin',
								origin: 'http://some.other.origin.local'
							});
						}, 0);
						setTimeout(function() {
							oSpies.window.eventListener.call(null, {
								source: jQuery.sap.FrameOptions.__parent,
								data: 'SAPFrameProtection*parent-unlocked',
								origin: 'http://some.other.origin.local'
							});
						}, 100);
						break;
				}
			}
		});


		if (mOptions.mode !== 'DIFF_ORIGIN') {
			jQuery.sap.FrameOptions.__parent.document = {
				domain: 'localhost'
			};
		}

		// self / top
		if (mOptions.mode === 'NO_FRAME') {
			jQuery.sap.FrameOptions.__top = jQuery.sap.FrameOptions.__self = jQuery.sap.FrameOptions.__parent;
		} else {
			jQuery.sap.FrameOptions.__top = jQuery.sap.FrameOptions.__parent;
			jQuery.sap.FrameOptions.__self = {};
		}

		return oSpies;
	}

	function testDirectUnlock(sName, sEnvMode, sParentMode, sMode, bAllowSameOrigin) {
		QUnit.test(sName, function(assert) {

			// arrangements
			var oMock = mockBrowserAPI(this, {
				mode: sEnvMode,
				parentMode: sParentMode
			});
			var oErrorLogSpy = this.spy(Log, "error");
			var fnCallback = this.spy();

			// actions
			this.oFrameOptions = new jQuery.sap.FrameOptions({
				mode: sMode,
				allowSameOrigin: bAllowSameOrigin,
				callback: fnCallback
			});

			// assertions
			sinon.assert.calledOnce(oMock.window.addEventListener);
			sinon.assert.calledWith(oMock.window.addEventListener, jQuery.sap.FrameOptions.__window.addEventListener ? 'message' : 'onmessage', oMock.window.eventListenerFn);

			sinon.assert.notCalled(oMock.window.eventListener);

			sinon.assert.notCalled(oMock.parent.postMessage);

			sinon.assert.calledOnce(fnCallback);
			sinon.assert.calledWith(fnCallback, true);

			sinon.assert.notCalled(oErrorLogSpy);
		});
	}
	function testDirectLock(sName, sEnvMode, sParentMode, sMode, bAllowSameOrigin, aErrorMessageArgs) {
		QUnit.test(sName, function(assert) {

			// arrangements
			var oMock = mockBrowserAPI(this, {
				mode: sEnvMode,
				parentMode: sParentMode
			});
			var oErrorLogSpy = this.spy(Log, "error");
			var fnCallback = this.spy();

			// actions
			this.oFrameOptions = new jQuery.sap.FrameOptions({
				mode: sMode,
				allowSameOrigin: bAllowSameOrigin,
				callback: fnCallback
			});

			// assertions
			sinon.assert.calledOnce(oMock.window.addEventListener);
			sinon.assert.calledWith(oMock.window.addEventListener, jQuery.sap.FrameOptions.__window.addEventListener ? 'message' : 'onmessage', oMock.window.eventListenerFn);

			sinon.assert.notCalled(oMock.window.eventListener);

			sinon.assert.notCalled(oMock.parent.postMessage);

			sinon.assert.calledOnce(fnCallback);
			sinon.assert.calledWith(fnCallback, false);

			assert.ok(jQuery.contains(document.body, this.oFrameOptions._lockDiv), 'Block layer should be part of the DOM');
			assert.equal(this.oFrameOptions._lockDiv.style.zIndex, '2147483647', 'Block layer should have a high z-index');

			sinon.assert.calledOnce(oErrorLogSpy);
			sinon.assert.calledWithExactly(oErrorLogSpy, aErrorMessageArgs[0], aErrorMessageArgs[1], aErrorMessageArgs[2]);
		});
	}
	function testPostMessageLock(sName, sEnvMode, sParentMode, sMode, bAllowSameOrigin, aErrorMessageArgs) {
		QUnit.test(sName, function(assert) {

			// arrangements
			var oMock = mockBrowserAPI(this, {
				mode: sEnvMode,
				parentMode: sParentMode
			});
			var oErrorLogSpy = this.spy(Log, "error");
			var fnCallback = this.spy();

			// actions
			this.oFrameOptions = new jQuery.sap.FrameOptions({
				mode: sMode,
				allowSameOrigin: bAllowSameOrigin,
				callback: fnCallback
			});

			// assertions
			sinon.assert.calledOnce(oMock.window.addEventListener);
			sinon.assert.calledWith(oMock.window.addEventListener, jQuery.sap.FrameOptions.__window.addEventListener ? 'message' : 'onmessage', oMock.window.eventListenerFn);

			this.clock.tick(10);

			sinon.assert.calledOnce(oMock.window.eventListener);
			sinon.assert.calledWith(oMock.window.eventListener, {
				source: jQuery.sap.FrameOptions.__parent,
				origin: 'http://some.other.origin.local',
				data: 'SAPFrameProtection*parent-unlocked'
			});

			sinon.assert.calledOnce(oMock.parent.postMessage);
			sinon.assert.calledWith(oMock.parent.postMessage, 'SAPFrameProtection*require-origin', '*');

			sinon.assert.calledOnce(fnCallback);
			sinon.assert.calledWith(fnCallback, false);

			assert.ok(jQuery.contains(document.body, this.oFrameOptions._lockDiv), 'Block layer should be part of the DOM');
			assert.equal(this.oFrameOptions._lockDiv.style.zIndex, '2147483647', 'Block layer should have a high z-index');

			sinon.assert.calledOnce(oErrorLogSpy);
			sinon.assert.calledWithExactly(oErrorLogSpy, aErrorMessageArgs[0], aErrorMessageArgs[1], aErrorMessageArgs[2]);
		});
	}
	function testAllowlistUnlock(sName, sEnvMode, sParentMode, sMode, bAllowSameOrigin) {
		QUnit.test(sName, function(assert) {

			// arrangements
			var oMock = mockBrowserAPI(this, {
				mode: sEnvMode,
				parentMode: sParentMode
			});
			var oErrorLogSpy = this.spy(Log, "error");
			var fnCallback = this.spy();

			// actions
			this.oFrameOptions = new jQuery.sap.FrameOptions({
				mode: sMode,
				allowSameOrigin: bAllowSameOrigin,
				allowlist: [ 'some.other.origin.local' ],
				callback: fnCallback
			});

			// assertions
			sinon.assert.calledOnce(oMock.window.addEventListener);
			sinon.assert.calledWith(oMock.window.addEventListener, jQuery.sap.FrameOptions.__window.addEventListener ? 'message' : 'onmessage', oMock.window.eventListenerFn);

			this.clock.tick(10);

			sinon.assert.calledOnce(oMock.window.eventListener);
			sinon.assert.calledWith(oMock.window.eventListener, {
				source: jQuery.sap.FrameOptions.__parent,
				origin: 'http://some.other.origin.local',
				data: 'SAPFrameProtection*parent-unlocked'
			});

			sinon.assert.calledOnce(oMock.parent.postMessage);
			sinon.assert.calledWith(oMock.parent.postMessage, 'SAPFrameProtection*require-origin', '*');

			sinon.assert.calledOnce(fnCallback);
			sinon.assert.calledWith(fnCallback, true);

			sinon.assert.notCalled(oErrorLogSpy);
		});
	}
	function testAllowlistService(sName, sEnvMode, sParentMode, sMode, bAllowSameOrigin, bActive, bFraming, bAllow, aErrorMessageArgs) {
		QUnit.test(sName, function(assert) {

			// arrangements
			var oMock = mockBrowserAPI(this, {
				mode: sEnvMode,
				parentMode: sParentMode
			});
			var oErrorLogSpy = this.spy(Log, "error");

			var oServer = this._oSandbox.useFakeServer(),
				oResponse = {
					version: "1.0",
					active: !!bActive,
					origin: "http://some.other.origin.local",
					framing: !!bFraming
				};
			oServer.respondWith("GET", /\/allowlist\.json\?parentOrigin=.*/, [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oResponse)
			]);

			var fnCallback = this.spy();

			// actions
			this.oFrameOptions = new jQuery.sap.FrameOptions({
				mode: sMode,
				allowSameOrigin: bAllowSameOrigin,
				allowlistService: '/allowlist.json',
				callback: fnCallback,
				timeout: 200
			});

			// assertions
			sinon.assert.calledOnce(oMock.window.addEventListener);
			sinon.assert.calledWith(oMock.window.addEventListener, jQuery.sap.FrameOptions.__window.addEventListener ? 'message' : 'onmessage', oMock.window.eventListenerFn);

			this.clock.tick(10);

			oServer.respond();

			if (sParentMode == "SAFE") {
				sinon.assert.calledOnce(oMock.window.eventListener);
				sinon.assert.calledWith(oMock.window.eventListener, {
					source: jQuery.sap.FrameOptions.__parent,
					origin: 'http://some.other.origin.local',
					data: 'SAPFrameProtection*parent-unlocked'
				});
			} else if (sParentMode == "UNSAFE")	{
				sinon.assert.calledOnce(oMock.window.eventListener);
				sinon.assert.calledWith(oMock.window.eventListener, {
					source: jQuery.sap.FrameOptions.__parent,
					origin: 'http://some.other.origin.local',
					data: 'SAPFrameProtection*parent-origin'
				});
			} else if (sParentMode == "SAFE_DELAYED")	{
				sinon.assert.calledOnce(oMock.window.eventListener);
				sinon.assert.calledWith(oMock.window.eventListener, {
					source: jQuery.sap.FrameOptions.__parent,
					origin: 'http://some.other.origin.local',
					data: 'SAPFrameProtection*parent-origin'
				});
				oMock.window.eventListener.reset();
			} else {
				sinon.assert.notCalled(oMock.window.eventListener);
			}

			sinon.assert.calledOnce(oMock.parent.postMessage);
			sinon.assert.calledWith(oMock.parent.postMessage, 'SAPFrameProtection*require-origin', '*');

			this.clock.tick(200);

			if (sParentMode == "SAFE_DELAYED")	{
				sinon.assert.calledOnce(oMock.window.eventListener);
				sinon.assert.calledWith(oMock.window.eventListener, {
					source: jQuery.sap.FrameOptions.__parent,
					origin: 'http://some.other.origin.local',
					data: 'SAPFrameProtection*parent-unlocked'
				});
			}

			sinon.assert.calledOnce(fnCallback);
			sinon.assert.calledWith(fnCallback, bAllow);

			if (aErrorMessageArgs) {
				sinon.assert.calledOnce(oErrorLogSpy);
				sinon.assert.calledWithExactly(oErrorLogSpy, aErrorMessageArgs[0], aErrorMessageArgs[1], aErrorMessageArgs[2]);
			} else {
				sinon.assert.notCalled(oErrorLogSpy);
			}

		});
	}

	function setup() {
		if ( this.clock == null && this._oSandbox ) {
			this.clock = this._oSandbox.useFakeTimers();
		}
	}

	function teardown() {
		if (this.oFrameOptions && this.oFrameOptions._lockDiv) {
			document.body.removeChild(this.oFrameOptions._lockDiv);
		}
		this.oFrameOptions = null;
	}

	// sap.ui.test.qunit.delayTestStart();

// environment
// NO_FRAME: not running inside of a frame
// SAME_ORIGIN: framed, but with the same origin
// DOMAIN_RELAX: framed, same origin but domain relaxed, so no direct access possibles
// DIFF_ORIGIN: framed, within a different origin

// parent mode
// SAFE: has the postmessage script and reports to be safe
// UNSAFE: has the postmessage script but only responds parent-origin
// SAFE_DELAYED: has the postmessage script, but sends parent-unlocked with one second delay
// NO_HANDLER: no postmessage handler is running in the parent

//                    test name,                                  environment,     parent mode,    frame option,  same origin,  jQuery.sap.log.error message

	QUnit.module("mode: deny", { beforeEach: setup, afterEach: teardown });
	testDirectUnlock(    "no frame",                                  'NO_FRAME',      'SAFE',         'deny',        true);
	testDirectLock(      "same origin",                               'SAME_ORIGIN',   'SAFE',         'deny',        true,         ["Embedding blocked because configuration mode is set to 'DENY'", "", "sap/ui/security/FrameOptions"]);
	testDirectLock(      "different origin",                          'DIFF_ORIGIN',   'SAFE',         'deny',        true,         ["Embedding blocked because configuration mode is set to 'DENY'", "", "sap/ui/security/FrameOptions"]);

	QUnit.module("mode: allow", { beforeEach: setup, afterEach: teardown });
	testDirectUnlock(    "no frame",                                  'NO_FRAME',      'SAFE',         'allow');
	testDirectUnlock(    "same origin",                               'SAME_ORIGIN',   'SAFE',         'allow');
	testDirectUnlock(    "different origin",                          'DIFF_ORIGIN',   'SAFE',         'allow');

//                    test name,                                  environment,     parent mode,    frame option,  same origin,  jQuery.sap.log.error message

	QUnit.module("mode: trusted", { beforeEach: setup, afterEach: teardown });
	testDirectUnlock(    "no frame",                                  'NO_FRAME',      'SAFE',         'trusted');
	testDirectUnlock(    "same origin",                               'SAME_ORIGIN',   'SAFE',         'trusted');
	testDirectUnlock(    "same origin, unsafe",                       'SAME_ORIGIN',   'UNSAFE',       'trusted');
	testDirectUnlock(    "same origin, no response",                  'SAME_ORIGIN',   'NO_RESPONSE',  'trusted');

	testPostMessageLock( "same origin not allowed",                   'SAME_ORIGIN',   'SAFE',         'trusted',     false,        ["Embedding blocked because the allowlist or the allowlist service is not configured correctly", "", "sap/ui/security/FrameOptions"]);
	testPostMessageLock( "different origin",                          'DIFF_ORIGIN',   'SAFE',         'trusted',     true,         ["Embedding blocked because the allowlist or the allowlist service is not configured correctly", "", "sap/ui/security/FrameOptions"]);

	QUnit.module("mode: trusted, allowlist", { beforeEach: setup, afterEach: teardown });
	testAllowlistUnlock( "same origin not allowed, allowlist",        'SAME_ORIGIN',   'SAFE',         'trusted',     false);
	testAllowlistUnlock( "different origin, allowlist",               'DIFF_ORIGIN',   'SAFE',         'trusted');

//                   test name,                                   environment,     parent mode,    frame option,  same origin,  active,   framing,  allow,  jQuery.sap.log.error message

	QUnit.module("mode: trusted, allowlist service, parent safe", { beforeEach: setup, afterEach: teardown });
	testAllowlistService("same origin not allowed, allowlistService", 'SAME_ORIGIN',   'SAFE',         'trusted',     false,        true,     true,     true);
	testAllowlistService("diff origin, allowlistService",             'DIFF_ORIGIN',   'SAFE',         'trusted',     true,         true,     true,     true);
	testAllowlistService("diff origin, allowlistService, denied",     'DIFF_ORIGIN',   'SAFE',         'trusted',     true,         true,     false,    false,  ["Embedding blocked because the allowlist service does not allow framing", "", "sap/ui/security/FrameOptions"]);
	testAllowlistService("diff origin, allowlistService, inactive",   'DIFF_ORIGIN',   'SAFE',         'trusted',     true,         false,    true,     true);

	QUnit.module("mode: trusted, allowlist service, parent safe delayed", { beforeEach: setup, afterEach: teardown });
	testAllowlistService("same origin not allowed, allowlistService", 'SAME_ORIGIN',   'SAFE_DELAYED', 'trusted',     false,        true,     true,     true);
	testAllowlistService("diff origin, allowlistService",             'DIFF_ORIGIN',   'SAFE_DELAYED', 'trusted',     true,         true,     true,     true);
	testAllowlistService("diff origin, allowlistService, denied",     'DIFF_ORIGIN',   'SAFE_DELAYED', 'trusted',     true,         true,     false,    false,  ["Embedding blocked because the allowlist service does not allow framing", "", "sap/ui/security/FrameOptions"]);
	testAllowlistService("diff origin, allowlistService, inactive",   'DIFF_ORIGIN',   'SAFE_DELAYED', 'trusted',     true,         false,    true,     true);

	QUnit.module("mode: trusted, allowlist service, parent unsafe", { beforeEach: setup, afterEach: teardown });
	testAllowlistService("same origin not allowed, allowlistService", 'SAME_ORIGIN',   'UNSAFE',       'trusted',     false,        true,     true,     false,  ["Reached timeout of 200ms waiting for the parent to be unlocked", "", "sap/ui/security/FrameOptions"]);
	testAllowlistService("diff origin, allowlistService",             'DIFF_ORIGIN',   'UNSAFE',       'trusted',     true,         true,     true,     false,  ["Reached timeout of 200ms waiting for the parent to be unlocked", "", "sap/ui/security/FrameOptions"]);
	testAllowlistService("diff origin, allowlistService, inactive",   'DIFF_ORIGIN',   'UNSAFE',       'trusted',     true,         false,    true,     true);

	QUnit.module("mode: trusted, allowlist service, parent no response", { beforeEach: setup, afterEach: teardown });
	testAllowlistService("same origin not allowed, allowlistService", 'SAME_ORIGIN',   'NO_RESPONSE',  'trusted',     false,        true,     true,     false,  ["Reached timeout of 200ms waiting for a response from parent window", "", "sap/ui/security/FrameOptions"]);
	testAllowlistService("diff origin, allowlistService",             'DIFF_ORIGIN',   'NO_RESPONSE',  'trusted',     true,         true,     true,     false,  ["Reached timeout of 200ms waiting for a response from parent window", "", "sap/ui/security/FrameOptions"]);
	testAllowlistService("diff origin, allowlistService, inactive",   'DIFF_ORIGIN',   'NO_RESPONSE',  'trusted',     true,         false,    true,     true);
});
