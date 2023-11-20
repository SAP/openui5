/*global QUnit, sinon */
sap.ui.define(['sap/ui/security/FrameOptions'], function(FrameOptions) {
	'use strict';

	var oClock, oServer;
	function mockBrowserAPI(mOptions) {

		// holds mocked functions for assertions
		var oSpies = {
			window: {},
			parent: {}
		};

		// window
		FrameOptions.__window = {};
		FrameOptions.__window.document = {
			URL: 'http://localhost/fake.html'
		};
		oSpies.window.addEventListener = sinon.spy(function() {
			oSpies.window.eventListenerFn = arguments[1];
			oSpies.window.eventListener = sinon.spy(arguments[1]);
		});
		if (window.addEventListener) {
			FrameOptions.__window.addEventListener = oSpies.window.addEventListener;
		} else {
			FrameOptions.__window.attachEvent = oSpies.window.addEventListener;
		}

		// parent
		FrameOptions.__parent = {};

		FrameOptions.__parent.postMessage = oSpies.parent.postMessage = sinon.spy(function(sMessage, sTargetOrigin) {
			if (sMessage === 'SAPFrameProtection*require-origin') {
				switch (mOptions.parentMode) {
					case "SAFE":
						setTimeout(function() {
							oSpies.window.eventListener.call(null, {
								source: FrameOptions.__parent,
								data: 'SAPFrameProtection*parent-unlocked',
								origin: 'http://some.other.origin.local'
							});
						}, 0);
						break;
					case "UNSAFE":
						setTimeout(function() {
							oSpies.window.eventListener.call(null, {
								source: FrameOptions.__parent,
								data: 'SAPFrameProtection*parent-origin',
								origin: 'http://some.other.origin.local'
							});
						}, 0);
						break;
					case "SAFE_DELAYED":
						setTimeout(function() {
							oSpies.window.eventListener.call(null, {
								source: FrameOptions.__parent,
								data: 'SAPFrameProtection*parent-origin',
								origin: 'http://some.other.origin.local'
							});
						}, 0);
						setTimeout(function() {
							oSpies.window.eventListener.call(null, {
								source: FrameOptions.__parent,
								data: 'SAPFrameProtection*parent-unlocked',
								origin: 'http://some.other.origin.local'
							});
						}, 100);
						break;
					default:
						break;
				}
			}
		});


		if (mOptions.mode !== 'DIFF_ORIGIN') {
			FrameOptions.__parent.document = {
				domain: 'localhost'
			};
		}

		// self / top
		if (mOptions.mode === 'NO_FRAME') {
			FrameOptions.__top = FrameOptions.__self = FrameOptions.__parent;
		} else {
			FrameOptions.__top = FrameOptions.__parent;
			FrameOptions.__self = {};
		}

		return oSpies;
	}

	function testDirectUnlock(sName, sEnvMode, sParentMode, sMode, bAllowSameOrigin) {
		QUnit.test(sName, function(assert) {

			// arrangements
			var oMock = mockBrowserAPI({
				mode: sEnvMode,
				parentMode: sParentMode
			});
			var fnCallback = sinon.spy();

			// actions
			this.oFrameOptions = new FrameOptions({
				mode: sMode,
				allowSameOrigin: bAllowSameOrigin,
				callback: fnCallback
			});

			// assertions
			assert.ok(oMock.window.addEventListener.calledOnce);
			assert.ok(oMock.window.addEventListener.calledWith(FrameOptions.__window.addEventListener ? 'message' : 'onmessage', oMock.window.eventListenerFn));

			assert.ok(oMock.window.eventListener.notCalled);

			assert.ok(oMock.parent.postMessage.notCalled);

			assert.ok(fnCallback.calledOnce);
			assert.ok(fnCallback.calledWith(true));
		});
	}
	function testDirectLock(sName, sEnvMode, sParentMode, sMode, bAllowSameOrigin) {
		QUnit.test(sName, function(assert) {

			// arrangements
			var oMock = mockBrowserAPI({
				mode: sEnvMode,
				parentMode: sParentMode
			});
			var fnCallback = sinon.spy();

			// actions
			this.oFrameOptions = new FrameOptions({
				mode: sMode,
				allowSameOrigin: bAllowSameOrigin,
				callback: fnCallback
			});

			// assertions
			assert.ok(oMock.window.addEventListener.calledOnce);
			assert.ok(oMock.window.addEventListener.calledWith(FrameOptions.__window.addEventListener ? 'message' : 'onmessage', oMock.window.eventListenerFn));

			assert.ok(oMock.window.eventListener.notCalled);

			assert.ok(oMock.parent.postMessage.notCalled);

			assert.ok(fnCallback.calledOnce);

			assert.ok(fnCallback.calledWith(false));

			assert.ok(document.body.contains(this.oFrameOptions._lockDiv), 'Block layer should be part of the DOM');
			assert.equal(this.oFrameOptions._lockDiv.style.zIndex, '2147483647', 'Block layer should have a high z-index');
		});
	}
	function testPostMessageLock(sName, sEnvMode, sParentMode, sMode, bAllowSameOrigin) {
		QUnit.test(sName, function(assert) {

			// arrangements
			var oMock = mockBrowserAPI({
				mode: sEnvMode,
				parentMode: sParentMode
			});
			var fnCallback = sinon.spy();

			// actions
			this.oFrameOptions = new FrameOptions({
				mode: sMode,
				allowSameOrigin: bAllowSameOrigin,
				callback: fnCallback
			});

			// assertions
			assert.ok(oMock.window.addEventListener.calledOnce);
			assert.ok(oMock.window.addEventListener.calledWith(FrameOptions.__window.addEventListener ? 'message' : 'onmessage', oMock.window.eventListenerFn));

			oClock.tick(10);

			assert.ok(oMock.window.eventListener.calledOnce);
			assert.ok(oMock.window.eventListener.calledWith({
				source: FrameOptions.__parent,
				origin: 'http://some.other.origin.local',
				data: 'SAPFrameProtection*parent-unlocked'
			}));

			assert.ok(oMock.parent.postMessage.calledOnce);

			assert.ok(oMock.parent.postMessage.calledWith('SAPFrameProtection*require-origin', '*'));

			assert.ok(fnCallback.calledOnce);
			assert.ok(fnCallback.calledWith(false));

			assert.ok(document.body.contains(this.oFrameOptions._lockDiv), 'Block layer should be part of the DOM');
			assert.equal(this.oFrameOptions._lockDiv.style.zIndex, '2147483647', 'Block layer should have a high z-index');
		});
	}
	function testAllowlistUnlock(sName, sEnvMode, sParentMode, sMode, bAllowSameOrigin) {
		QUnit.test(sName, function(assert) {

			// arrangements
			var oMock = mockBrowserAPI({
				mode: sEnvMode,
				parentMode: sParentMode
			});
			var fnCallback = sinon.spy();

			// actions
			this.oFrameOptions = new FrameOptions({
				mode: sMode,
				allowSameOrigin: bAllowSameOrigin,
				allowlist: [ 'some.other.origin.local' ],
				callback: fnCallback
			});

			// assertions
			assert.ok(oMock.window.addEventListener.calledOnce);
			assert.ok(oMock.window.addEventListener.calledWith(FrameOptions.__window.addEventListener ? 'message' : 'onmessage', oMock.window.eventListenerFn));

			oClock.tick(10);

			assert.ok(oMock.window.eventListener.calledOnce);
			assert.ok(oMock.window.eventListener.calledWith({
				source: FrameOptions.__parent,
				origin: 'http://some.other.origin.local',
				data: 'SAPFrameProtection*parent-unlocked'
			}));

			assert.ok(oMock.parent.postMessage.calledOnce);
			assert.ok(oMock.parent.postMessage.calledWith('SAPFrameProtection*require-origin', '*'));

			assert.ok(fnCallback.calledOnce);
			assert.ok(fnCallback.calledWith(true));
		});
	}
	function testAllowlistService(sName, sEnvMode, sParentMode, sMode, bAllowSameOrigin, bActive, bFraming, bAllow) {
		QUnit.test(sName, function(assert) {

			// arrangements
			var oMock = mockBrowserAPI({
				mode: sEnvMode,
				parentMode: sParentMode
			});

			var oResponse = {
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

			var fnCallback = sinon.spy();

			// actions
			this.oFrameOptions = new FrameOptions({
				mode: sMode,
				allowSameOrigin: bAllowSameOrigin,
				allowlistService: '/allowlist.json',
				callback: fnCallback,
				timeout: 200
			});

			// assertions
			assert.ok(oMock.window.addEventListener.calledOnce);
			assert.ok(oMock.window.addEventListener.calledWith(FrameOptions.__window.addEventListener ? 'message' : 'onmessage', oMock.window.eventListenerFn));

			oClock.tick(10);

			oServer.respond();

			if (sParentMode === "SAFE") {
				assert.ok(oMock.window.eventListener.calledOnce);
				assert.ok(oMock.window.eventListener.calledWith({
					source: FrameOptions.__parent,
					origin: 'http://some.other.origin.local',
					data: 'SAPFrameProtection*parent-unlocked'
				}));
			} else if (sParentMode === "UNSAFE")	{
				assert.ok(oMock.window.eventListener.calledOnce);
				assert.ok(oMock.window.eventListener.calledWith({
					source: FrameOptions.__parent,
					origin: 'http://some.other.origin.local',
					data: 'SAPFrameProtection*parent-origin'
				}));
			} else if (sParentMode === "SAFE_DELAYED")	{
				assert.ok(oMock.window.eventListener.calledOnce);
				assert.ok(oMock.window.eventListener.calledWith({
					source: FrameOptions.__parent,
					origin: 'http://some.other.origin.local',
					data: 'SAPFrameProtection*parent-origin'
				}));
				oMock.window.eventListener.reset();
			} else {
				assert.ok(oMock.window.eventListener.notCalled);
			}

			assert.ok(oMock.parent.postMessage.calledOnce);
			assert.ok(oMock.parent.postMessage.calledWith('SAPFrameProtection*require-origin', '*'));

			oClock.tick(200);

			if (sParentMode === "SAFE_DELAYED")	{
				assert.ok(oMock.window.eventListener.calledOnce);
				assert.ok(oMock.window.eventListener.calledWith({
					source: FrameOptions.__parent,
					origin: 'http://some.other.origin.local',
					data: 'SAPFrameProtection*parent-unlocked'
				}));
			}

			assert.ok(fnCallback.calledOnce);
			assert.ok(fnCallback.calledWith(bAllow));
		});
	}

	function setup(){
		oClock = sinon.sandbox.useFakeTimers();
	}

	function setupAllowlist(){
		setup.bind(this)();
		oServer = sinon.sandbox.useFakeServer();
	}

	function teardown() {
		if (this.oFrameOptions && this.oFrameOptions._lockDiv) {
			document.body.removeChild(this.oFrameOptions._lockDiv);
		}
		this.oFrameOptions = null;
		oClock.restore();
	}

	function teardownAllowlist(){
		teardown.bind(this)();
		oServer.restore();
	}

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

	//                    test name,                                  environment,     parent mode,    frame option



	QUnit.module("sap.ui.security.FrameOptions - mode: deny", { afterEach: teardown , beforeEach: setup});
	testDirectUnlock(    "no frame",                                  'NO_FRAME',      'SAFE',         'deny');
	testDirectLock(      "same origin",                               'SAME_ORIGIN',   'SAFE',         'deny');
	testDirectLock(      "different origin",                          'DIFF_ORIGIN',   'SAFE',         'deny');

	QUnit.module("sap.ui.security.FrameOptions - mode: allow", { afterEach: teardown , beforeEach: setup});
	testDirectUnlock(    "no frame",                                  'NO_FRAME',      'SAFE',         'allow');
	testDirectUnlock(    "same origin",                               'SAME_ORIGIN',   'SAFE',         'allow');
	testDirectUnlock(    "different origin",                          'DIFF_ORIGIN',   'SAFE',         'allow');

	//                    test name,                                  environment,     parent mode,    frame option,  same origin,

	QUnit.module("sap.ui.security.FrameOptions - mode: trusted", { afterEach: teardown , beforeEach: setup});
	testDirectUnlock(    "no frame",                                  'NO_FRAME',      'SAFE',         'trusted');
	testDirectUnlock(    "same origin",                               'SAME_ORIGIN',   'SAFE',         'trusted');
	testDirectUnlock(    "same origin, unsafe",                       'SAME_ORIGIN',   'UNSAFE',       'trusted');
	testDirectUnlock(    "same origin, no response",                  'SAME_ORIGIN',   'NO_RESPONSE',  'trusted');

	testPostMessageLock( "same origin not allowed",                   'SAME_ORIGIN',   'SAFE',         'trusted',     false);
	testPostMessageLock( "different origin",                          'DIFF_ORIGIN',   'SAFE',         'trusted');

	QUnit.module("sap.ui.security.FrameOptions - mode: trusted, allowlist", { afterEach: teardown , beforeEach: setup});
	testAllowlistUnlock( "same origin not allowed, allowlist",        'SAME_ORIGIN',   'SAFE',         'trusted',     false);
	testAllowlistUnlock( "different origin, allowlist",               'DIFF_ORIGIN',   'SAFE',         'trusted');

	//                   test name,                                   environment,     parent mode,    frame option,  same origin,  active,   framing,  allow

	QUnit.module("sap.ui.security.FrameOptions - mode: trusted, witelist service, parent safe", { afterEach: teardownAllowlist, beforeEach: setupAllowlist});
	testAllowlistService("same origin not allowed, allowlistService", 'SAME_ORIGIN',   'SAFE',         'trusted',     false,        true,     true,     true);
	testAllowlistService("diff origin, allowlistService",             'DIFF_ORIGIN',   'SAFE',         'trusted',     true,         true,     true,     true);
	testAllowlistService("diff origin, allowlistService, denied",     'DIFF_ORIGIN',   'SAFE',         'trusted',     true,         true,     false,    false);
	testAllowlistService("diff origin, allowlistService, inactive",   'DIFF_ORIGIN',   'SAFE',         'trusted',     true,         false,    true,     true);

	QUnit.module("sap.ui.security.FrameOptions - mode: trusted, witelist service, parent safe delayed", { afterEach: teardownAllowlist , beforeEach: setupAllowlist});
	testAllowlistService("same origin not allowed, allowlistService", 'SAME_ORIGIN',   'SAFE_DELAYED', 'trusted',     false,        true,     true,     true);
	testAllowlistService("diff origin, allowlistService",             'DIFF_ORIGIN',   'SAFE_DELAYED', 'trusted',     true,         true,     true,     true);
	testAllowlistService("diff origin, allowlistService, denied",     'DIFF_ORIGIN',   'SAFE_DELAYED', 'trusted',     true,         true,     false,    false);
	testAllowlistService("diff origin, allowlistService, inactive",   'DIFF_ORIGIN',   'SAFE_DELAYED', 'trusted',     true,         false,    true,     true);

	QUnit.module("sap.ui.security.FrameOptions - mode: trusted, witelist service, parent unsafe", { afterEach: teardownAllowlist , beforeEach: setupAllowlist});
	testAllowlistService("same origin not allowed, allowlistService", 'SAME_ORIGIN',   'UNSAFE',       'trusted',     false,        true,     true,     false);
	testAllowlistService("diff origin, allowlistService",             'DIFF_ORIGIN',   'UNSAFE',       'trusted',     true,         true,     true,     false);
	testAllowlistService("diff origin, allowlistService, inactive",   'DIFF_ORIGIN',   'UNSAFE',       'trusted',     true,         false,    true,     true);

	QUnit.module("sap.ui.security.FrameOptions - mode: trusted, witelist service, parent no response", { afterEach: teardownAllowlist , beforeEach: setupAllowlist});
	testAllowlistService("same origin not allowed, allowlistService", 'SAME_ORIGIN',   'NO_RESPONSE',  'trusted',     false,        true,     true,     false);
	testAllowlistService("diff origin, allowlistService",             'DIFF_ORIGIN',   'NO_RESPONSE',  'trusted',     true,         true,     true,     false);
	testAllowlistService("diff origin, allowlistService, inactive",   'DIFF_ORIGIN',   'NO_RESPONSE',  'trusted',     true,         false,    true,     true);

});
