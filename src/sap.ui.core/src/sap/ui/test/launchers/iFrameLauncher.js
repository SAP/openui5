/*!
 * ${copyright}
 */
sap.ui.define([
		'jquery.sap.global',
		'sap/ui/thirdparty/URI',
		'sap/ui/Device'
	], function ($, URI, Device) {
	"use strict";
	var oFrameWindow = null,
		$Frame = null,
		oFramePlugin = null,
		oFrameUtils = null,
		oFrameJQuery = null,
		bUi5Loaded = false;

	/*
	 * INTERNALS
	 */
	function handleFrameLoad () {
		oFrameWindow = $Frame[0].contentWindow;

		registerOnError();

		//immediately check for UI5 to be loaded, to intercept when the hash changes
		checkForUI5ScriptLoaded();
	}

	function registerOnError () {
		// In IE9 retrieving the active element in an IFrame when it has no focus produces an error.
		// Since we use it all over the UI5 libraries, the only solution is to ignore frame errors in IE9.
		if (Device.browser.internet_explorer && Device.browser.version === 9) {
			return;
		}

		var fnFrameOnError = oFrameWindow.onerror;

		oFrameWindow.onerror = function (sErrorMsg, sUrl, iLine) {
			if (fnFrameOnError) {
				fnFrameOnError.apply(this, arguments);
			}

			throw "OpaFrame error message: " + sErrorMsg + " url: " + sUrl + " line: " + iLine;
		};

	}

	function checkForUI5ScriptLoaded () {
		if (bUi5Loaded) {
			return true;
		}

		if (oFrameWindow && oFrameWindow.sap && oFrameWindow.sap.ui && oFrameWindow.sap.ui.getCore) {
			bUi5Loaded = true;
			handleUi5Loaded();
		}
		return false;
	}


	function handleUi5Loaded () {
		setFrameVariables();
		modifyIFrameNavigation();
	}

	/**
	 * Disables most of the navigation in an IFrame, only setHash has an effect on the real IFrame history after running this function.
	 * Reason: replace hash does not work in an IFrame so it may not be called at all.
	 * This makes it necessary to hook into all navigation methods
	 * @private
	 */
	function modifyIFrameNavigation () {
		oFrameWindow.jQuery.sap.require("sap.ui.thirdparty.hasher");
		oFrameWindow.jQuery.sap.require("sap.ui.core.routing.History");
		oFrameWindow.jQuery.sap.require("sap.ui.core.routing.HashChanger");

		var oHashChanger = new oFrameWindow.sap.ui.core.routing.HashChanger(),
			oHistory = new oFrameWindow.sap.ui.core.routing.History(oHashChanger),
			oHasher = oFrameWindow.hasher,
			fnOriginalSetHash = oHasher.setHash,
			fnOriginalGetHash = oHasher.getHash,
			sCurrentHash,
			fnOriginalGo = oFrameWindow.history.go;

		// replace hash is only allowed if it is triggered within the inner window. Even if you trigger an event from the outer test, it will not work.
		// Therefore we have mock the behavior of replace hash. If an application uses the dom api to change the hash window.location.hash, this workaround will fail.
		oHasher.replaceHash = function (sHash) {
			var sOldHash = this.getHash();
			sCurrentHash = sHash;
			oHashChanger.fireEvent("hashReplaced",{ sHash : sHash });
			this.changed.dispatch(sHash, sOldHash);
		};

		oHasher.setHash = function (sHash) {
			var sRealCurrentHash = fnOriginalGetHash.call(this);

			sCurrentHash = sHash;
			oHashChanger.fireEvent("hashSet", { sHash : sHash });
			fnOriginalSetHash.apply(this, arguments);

			// Happens when setHash("a") back setHash("a") is called.
			// Then dispatch the previous hash as new one because hasher does not dispatch if the real hash stays the same
			if (sRealCurrentHash === this.getHash()) {
				// always dispatch the current position of the history, since this can only happen in the backwards / forwards direction
				this.changed.dispatch(sRealCurrentHash, oHistory.aHistory[oHistory.iHistoryPosition]);
			}

		};

		// This function also needs to be manipulated since hasher does not know about our intercepted replace
		oHasher.getHash = function() {
			//initial hash
			if (sCurrentHash === undefined) {
				return fnOriginalGetHash.apply(this, arguments);
			}

			return sCurrentHash;
		};

		oHashChanger.init();

		function goBack () {
			var sNewPreviousHash = oHistory.aHistory[oHistory.iHistoryPosition],
				sNewCurrentHash = oHistory.getPreviousHash();

			sCurrentHash = sNewCurrentHash;
			oHasher.changed.dispatch(sNewCurrentHash, sNewPreviousHash);
		}

		function goForward () {
			var sNewCurrentHash = oHistory.aHistory[oHistory.iHistoryPosition + 1],
				sNewPreviousHash = oHistory.aHistory[oHistory.iHistoryPosition];

			if (sNewCurrentHash === undefined) {
				jQuery.sap.log.error("Could not navigate forwards, there is no history entry in the forwards direction", this);
				return;
			}

			sCurrentHash = sNewCurrentHash;
			oHasher.changed.dispatch(sNewCurrentHash, sNewPreviousHash);
		}

		oFrameWindow.history.back = goBack;
		oFrameWindow.history.forward = goForward;

		oFrameWindow.history.go = function (iSteps) {
			if (iSteps === -1) {
				goBack();
				return;
			} else if (iSteps === 1) {
				goForward();
				return;
			}

			jQuery.sap.log.error("Using history.go with a number greater than 1 is not supported by OPA5", this);
			return fnOriginalGo.apply(oFrameWindow.history, arguments);
		};
	}

	function setFrameVariables() {
		oFrameJQuery = oFrameWindow.jQuery;
		//All Opa related resources in the iframe should be the same version
		//that is running in the test and not the (evtl. not available) version of Opa of the running App.
		registerAbsoluteModulePathInIframe("sap.ui.test");
		oFrameJQuery.sap.require("sap.ui.test.OpaPlugin");
		oFramePlugin = new oFrameWindow.sap.ui.test.OpaPlugin();

		registerAbsoluteModulePathInIframe("sap.ui.qunit.QUnitUtils");
		oFrameWindow.jQuery.sap.require("sap.ui.qunit.QUnitUtils");
		oFrameUtils = oFrameWindow.sap.ui.qunit.QUnitUtils;
	}

	function registerAbsoluteModulePathInIframe(sModule) {
		var sOpaLocation = jQuery.sap.getModulePath(sModule);
		var sAbsoluteOpaPath = new URI(sOpaLocation).absoluteTo(document.baseURI).search("").toString();
		oFrameJQuery.sap.registerModulePath(sModule,sAbsoluteOpaPath);
	}

	function destroyFrame () {
		// Workaround for IE - there are errors even after removing the frame so setting the onerror to noop again seems to be fine
		oFrameWindow.onerror = $.noop;
		$Frame.remove();
		oFrameJQuery = null;
		oFramePlugin = null;
		oFrameUtils = null;
		oFrameWindow = null;
		bUi5Loaded = false;
	}

	/**
	 * Contains the logic to place an iFrame to the dom and overwrites the navigation inside of it.
	 * Every launch call needs a corresponding teardown call, or errors will be logged and the calls will be ignored.
	 * Please have a look at {@link sap.ui.test.Opa5#iStartMyAppInAFrame} and {@link sap.ui.test.Opa5#iTeardownMyAppFrame}for the public functions using this class.
	 * @private
	 */
	return {
		launch: function (options) {
			if (oFrameWindow) {
				$.sap.log.error("sap.ui.test.launchers.iFrameLauncher: Only one IFrame may be loaded at a time.");
				return;
			}

			//invalidate the cache
			$Frame = $("#" + options.frameId);

			if (!$Frame.length) {
				if (!options.source) {
					$.sap.log.error("No source was given to launch the IFrame", this);
				}
				//invalidate other caches
				$Frame = $('<IFrame id="' + options.frameId + '" class="opaFrame" src="' + options.source + '"></IFrame>');
				$("body").append($Frame);
			}

			if ($Frame[0].contentDocument && $Frame[0].contentDocument.readyState === "complete") {
				handleFrameLoad();
			} else {
				$Frame.on("load", handleFrameLoad);
			}

			return checkForUI5ScriptLoaded();
		},
		getHashChanger: function () {
			if (!oFrameWindow) {
				return null;
			}
			oFrameWindow.jQuery.sap.require("sap.ui.core.routing.HashChanger");

			return oFrameWindow.sap.ui.core.routing.HashChanger.getInstance();
		},
		getPlugin: function () {
			return oFramePlugin;
		},
		getJQuery: function () {
			return oFrameJQuery;
		},
		getUtils: function () {
			return oFrameUtils;
		},
		hasLaunched: function () {
			checkForUI5ScriptLoaded();
			return bUi5Loaded;
		},
		getWindow: function () {
			return oFrameWindow;
		},
		teardown: function () {
			destroyFrame();
		}
	};
}, /* export= */ true);

