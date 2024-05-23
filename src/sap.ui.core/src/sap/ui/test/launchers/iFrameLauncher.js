/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/base/Log",
		"sap/base/util/ObjectPath",
		'sap/ui/Device',
		'sap/ui/test/_LogCollector',
		"sap/ui/thirdparty/jquery"
	], function (Log, ObjectPath, Device, _LogCollector, jQuery) {
	"use strict";

	/*global CollectGarbage */

	// after CSS transform - scale down by 0.6: width=768, height=614.4
	var DEFAULT_WIDTH = 1280;
	var DEFAULT_HEIGHT = 1024;

	var oFrameWindow = null,
		$Frame = null,
		$FrameContainer = null,
		oFramePlugin = null,
		oFrameUtils = null,
		oFrameJQuery = null,
		bRegisteredToUI5Init = false,
		bUi5Loaded = false,
		oAutoWaiter = null,
		FrameHashChanger = null,
		sOpaLogLevel,
		bDisableHistoryOverride;

	/*
	 * INTERNALS
	 */
	function handleFrameLoad () {
		oFrameWindow = $Frame[0].contentWindow;

		registerOnError();

		//immediately check for UI5 to be loaded, to intercept when the hash changes
		checkForUI5ScriptLoaded();
	}

	function setFrameSize(sWidth, sHeight) {
		// by default the frame is scaled down to 60% of a fixed page size: 1280x1024
		// user-defined dimensions should not be scaled
		if (sWidth) {
			$Frame.css("width", sWidth);
			$FrameContainer.css("padding-left", sWidth);
		} else {
			$Frame.css("width", DEFAULT_WIDTH);
			$Frame.addClass("default-scale-x");
		}
		if (sHeight) {
			$Frame.css("height", sHeight);
		} else {
			$Frame.css("height", DEFAULT_HEIGHT);
			$Frame.addClass("default-scale-y");
		}
		if (!sWidth && !sHeight) {
			$Frame.addClass("default-scale-both");
		}
	}

	function registerOnError () {
		var fnFrameOnError = oFrameWindow.onerror;

		oFrameWindow.onerror = function (sErrorMsg, sUrl, iLine, iColumn, oError) {
			var vReturnValue = false;

			if (fnFrameOnError) {
				// save the return value if the original returns true - the error is supressed
				vReturnValue = fnFrameOnError.apply(this, arguments);
			}

			// a global exception in the outer window's scope should be fired. but since this onerror
			// function is wrapped in QUnits onerror function the exception needs to be thrown in a setTimeout
			// to make sure the QUnit onerror can run to the end
			setTimeout(function () {
				// column number and error object may be missing in older browsers. Currently, Edge doesn't provide the oError object
				var sColumn = iColumn ? "\ncolumn: " + iColumn : "";
				var sIFrameError = oError && "\niFrame error: " + (oError.stack ? oError.message + "\n" + oError.stack : oError) || "";
				throw new Error("Error in launched application iFrame: " + sErrorMsg + "\nurl: " + sUrl + "\nline: " + iLine + sColumn + sIFrameError);
			}, 0);
			return vReturnValue;
		};

	}

	function checkForUI5ScriptLoaded () {
		if (bUi5Loaded) {
			return true;
		}

		if (!bRegisteredToUI5Init && oFrameWindow?.sap?.ui) {
			if ( oFrameWindow.sap.ui.require ) {
				// use the more modern Core.ready, if available
				const oFrameCore = oFrameWindow.sap.ui.require("sap/ui/core/Core");
				if (typeof oFrameCore?.ready === "function") {
					//in debug mode the Promise rejects and we need a retry to get the new promise
					oFrameCore.ready(handleUi5Loaded).catch(() => {
						bRegisteredToUI5Init = false;
					});
					bRegisteredToUI5Init = true;
					return bUi5Loaded;
				}

				// otherwise, fall back to the older sap.ui.getCore().attachInit
				if (typeof oFrameCore?.attachInit === "function") {
					oFrameCore.attachInit(handleUi5Loaded);
					bRegisteredToUI5Init = true;
				}
			}
		}

		return bUi5Loaded;
	}

	/**
	 * Firefox only function - load sinon as often as needed until it is defined.
	 * @param {function} fnDone executed when sinon is loaded
	 */
	function loadSinon(fnDone) {
		oFrameWindow.sap.ui.require(["sap/ui/thirdparty/sinon"], function (sinon) {
			if (!sinon) {
				setTimeout(function () {
					loadSinon(fnDone);
				}, 50);
			} else {
				fnDone();
			}
		});
	}

	function handleUi5Loaded () {
		registerFrameResourcePaths();

		if (Device.browser.firefox) {
			// In Firefox there is a bug when the app loads sinon and OPA loads it from outside.
			// sinon might be undefined in a module requiring it. So the workaround comes here:
			// trigger the load of sinon - wait until it is defined. Only when it is defined continue loading other modules
			loadSinon(loadFrameModules);
		} else {
			// no workaround - directly load all other modules
			loadFrameModules();
		}
	}

	function afterModulesLoaded (oFrameLog) {
		// forward OPA log messages from the inner iframe to the Log listener of the outer frame
		// the listener should already be created and started by OPA
		oFrameLog.addLogListener(_LogCollector.getInstance()._oListener);

		bUi5Loaded = true;
	}

	function registerFrameResourcePaths () {
		//All Opa related resources in the iframe should be the same version
		//that is running in the test and not the (evtl. not available) version of Opa of the running App.
		registerAbsoluteResourcePathInIframe("sap/ui/test");
		registerAbsoluteResourcePathInIframe("sap/ui/qunit");
		registerAbsoluteResourcePathInIframe("sap/ui/thirdparty");
	}

	/**
	 * Disables most of the navigation in an IFrame, only setHash has an effect on the real IFrame history after running this function.
	 * Reason: replace hash does not work in an IFrame so it may not be called at all.
	 * This makes it necessary to hook into all navigation methods
	 * @private
	 */
	function modifyIFrameNavigation (hasher, History, HashChanger) {

		var oHashChanger = new HashChanger(),
			oHistory = new History(oHashChanger),
			fnOriginalSetHash = hasher.setHash,
			fnOriginalGetHash = hasher.getHash,
			sCurrentHash,
			bKnownHashChange = false,
			fnOriginalGo = oFrameWindow.history.go;

		// replace hash is only allowed if it is triggered within the inner window. Even if you trigger an event from the outer test, it will not work.
		// Therefore we have mock the behavior of replace hash. If an application uses the dom api to change the hash window.location.hash, this workaround will fail.
		hasher.replaceHash = function (sHash) {
			bKnownHashChange = true;
			var sOldHash = this.getHash();
			sCurrentHash = sHash;
			// fire the secret events for the local history so the recording is correct.
			// The hash changer is not the global singleton it is a local one only used in this scope for the history.
			oHashChanger.fireEvent("hashReplaced",{ sHash : sHash });
			this.changed.dispatch(sHash, sOldHash);
		};

		hasher.setHash = function (sHash) {
			bKnownHashChange = true;
			var sRealCurrentHash = fnOriginalGetHash.call(this);
			sCurrentHash = sHash;
			// fire the secret events for the local history so the recording is correct.
			// The hash changer is not the global singleton it is a local one only used in this scope for the history.
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
		hasher.getHash = function() {
			//initial hash
			if (sCurrentHash === undefined) {
				return fnOriginalGetHash.apply(this, arguments);
			}

			return sCurrentHash;
		};

		// when a link is clicked or the hash is directly set we only get a changed event.
		hasher.changed.add(function (sNewHash) {
			// only if the change does not come from the other known places it is likely to be a pressed link
			if (!bKnownHashChange) {
				// fire the secret events for the local history so the recording is correct.
				// The hash changer is not the global singleton it is a local one only used in this scope for the history.
				oHashChanger.fireEvent("hashSet", { sHash : sNewHash });
				sCurrentHash = sNewHash;
			}
			bKnownHashChange = false;
		});

		oHashChanger.init();

		function goBack () {
			bKnownHashChange = true;
			var sNewPreviousHash = oHistory.aHistory[oHistory.iHistoryPosition],
				sNewCurrentHash = oHistory.getPreviousHash();

			sCurrentHash = sNewCurrentHash;
			hasher.changed.dispatch(sNewCurrentHash, sNewPreviousHash);
		}

		function goForward () {
			bKnownHashChange = true;
			var sNewCurrentHash = oHistory.aHistory[oHistory.iHistoryPosition + 1],
				sNewPreviousHash = oHistory.aHistory[oHistory.iHistoryPosition];

			if (sNewCurrentHash === undefined) {
				Log.error("Could not navigate forwards, there is no history entry in the forwards direction", this);
				return;
			}

			sCurrentHash = sNewCurrentHash;
			hasher.changed.dispatch(sNewCurrentHash, sNewPreviousHash);
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

			Log.error("Using history.go with a number greater than 1 is not supported by OPA5", this);
			return fnOriginalGo.apply(oFrameWindow.history, arguments);
		};
	}

	function loadFrameModules() {
		oFrameWindow.sap.ui.require([
			"sap/base/Log",
			"sap/ui/test/OpaPlugin",
			"sap/ui/test/autowaiter/_autoWaiter",
			"sap/ui/test/_OpaLogger",
			"sap/ui/qunit/QUnitUtils",
			"sap/ui/thirdparty/jquery",
			"sap/ui/thirdparty/hasher",
			"sap/ui/core/routing/History",
			"sap/ui/core/routing/HashChanger"
		], function (
			Log,
			OpaPlugin,
			_autoWaiter,
			_OpaLogger,
			QUnitUtils,
			frameJQuery,
			hasher,
			History,
			HashChanger
		) {
			_OpaLogger.setLevel(sOpaLogLevel);
			oFramePlugin = new OpaPlugin();
			oAutoWaiter = _autoWaiter;
			oFrameUtils = QUnitUtils;
			oFrameJQuery = frameJQuery;
			if (!bDisableHistoryOverride) {
				modifyIFrameNavigation(hasher, History, HashChanger);
			}
			FrameHashChanger = HashChanger;
			afterModulesLoaded(Log);
		});
	}

	function getAbsolutePath(sResource) {
		var sResourceURL = sap.ui.require.toUrl(sResource);
		var oURL = new URL(sResourceURL, document.baseURI);
		oURL.search = oURL.hash = "";
		return oURL.href;
	}

	function registerAbsoluteResourcePathInIframe(sResource) {
		var sAbsoluteOpaPath = getAbsolutePath(sResource);
		var fnConfig = ObjectPath.get("sap.ui.loader.config", oFrameWindow);
		if (fnConfig) {
			var paths = {};
			paths[sResource] = sAbsoluteOpaPath;
			fnConfig({
				paths: paths
			});
			return;
		}

		throw new Error("iFrameLauncher.js: UI5 module system not found.");
	}

	function destroyFrame () {
		if (!oFrameWindow) {
			throw new Error("sap.ui.test.launchers.iFrameLauncher: Teardown was called before launch. No iFrame was loaded.");
		}
		// Workaround for IE - there are errors even after removing the frame so setting the onerror to noop again seems to be fine
		oFrameWindow.onerror = function() {};
		for (var i = 0; i < $Frame.length; i++) {
			$Frame[0].src = "about:blank";
			$Frame[0].contentWindow.document.write('');
			$Frame[0].contentWindow.close();
		}
		if ( typeof CollectGarbage == "function") {
			CollectGarbage(); // eslint-disable-line
		}
		$Frame.remove();
		$FrameContainer.remove();
		oFrameJQuery = null;
		oFramePlugin = null;
		oFrameUtils = null;
		oFrameWindow = null;
		bUi5Loaded = false;
		bRegisteredToUI5Init = false;
		oAutoWaiter = null;
		FrameHashChanger = null;
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
				throw new Error("sap.ui.test.launchers.iFrameLauncher: Launch was called twice without teardown. Only one iFrame may be loaded at a time.");
			}

			//invalidate the cache
			$Frame = jQuery("#" + options.frameId);

			if ($Frame.length) {
				$FrameContainer = jQuery(".opaFrameContainer");
			} else {
				if (!options.source) {
					Log.error("No source was given to launch the IFrame", this);
				}
				//invalidate other caches
				$FrameContainer = jQuery("<div class='opaFrameContainer'></div>");
				$Frame = jQuery('<IFrame id="' + options.frameId + '" class="opaFrame" src="' + options.source + '"></IFrame>');
				$FrameContainer.append($Frame);
				jQuery("body").append($FrameContainer);
				setFrameSize(options.width, options.height);
			}

			if ($Frame[0].contentDocument && $Frame[0].contentDocument.readyState === "complete") {
				handleFrameLoad();
			} else {
				$Frame.on("load", handleFrameLoad);
			}
			sOpaLogLevel = options.opaLogLevel;
			bDisableHistoryOverride = options.disableHistoryOverride;
			return checkForUI5ScriptLoaded();
		},
		hasLaunched: function () {
			checkForUI5ScriptLoaded();
			return bUi5Loaded;
		},
		teardown: function () {
			destroyFrame();
		},
		getHashChanger: function () {
			if (!FrameHashChanger) {
				return null;
			}

			return FrameHashChanger.getInstance();
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
		getWindow: function () {
			return oFrameWindow;
		},
		_getAutoWaiter: function () {
			return oAutoWaiter;
		}
	};
});