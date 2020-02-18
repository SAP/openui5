/*!
 * ${copyright}
 */

// Provides the basic UI5 support functionality
sap.ui.define(['sap/ui/base/EventProvider', './Plugin', 'sap/ui/Device', "sap/base/util/UriParameters", "sap/ui/thirdparty/jquery", "sap/base/Log", "sap/base/security/encodeURL"],
	function(
		EventProvider,
		Plugin,
		Device,
		UriParameters,
		jQuery,
		Log,
		encodeURL
	) {
	"use strict";

	/*global document, localStorage, window */

	/**
	 * Constructor for sap.ui.core.support.Support - must not be used: To get the singleton instance, use
	 * sap.ui.core.support.Support.getStub.
	 *
	 * @class This class provides the support tool functionality of UI5. This class is internal and all its functions must not be used by an application.
	 *
	 * @extends sap.ui.base.EventProvider
	 * @version ${version}
	 * @private
	 * @alias sap.ui.core.support.Support
	 */
	var Support = EventProvider.extend("sap.ui.core.support.Support", {
		constructor: function(sType) {
			if (!_bPrivate) {
				throw Error();
			}
			EventProvider.apply(this);

			var that = this;

			this._sType = sType;
			this._sLocalOrigin = window.location.protocol + "//" + window.location.host;

			var fHandler = jQuery.proxy(this._receiveEvent, this);
			if (window.addEventListener) {
				window.addEventListener("message", fHandler, false);
			} else {
				window.attachEvent("onmessage", fHandler);
			}

			switch (sType) {
				case mTypes.APPLICATION:
					this._isOpen = false;
					this.attachEvent(mEvents.TEAR_DOWN, function(oEvent){
						that._isOpen = false;
						if ( Device.browser.msie ) {// TODO remove after the end of support for Internet Explorer
							jQuery(document.getElementById(ID_SUPPORT_AREA + "-frame")).remove();
						} else {
							close(that._oRemoteWindow);
						}
						that._oRemoteWindow = null;
						Support.exitPlugins(that, false);
					});
					this.attachEvent(mEvents.LIBS, function(oEvent){
						var aLibs = Support.getDiagnosticLibraries(),
							aLibNames = [];
						for (var i = 0; i < aLibs.length; i++) {
							aLibNames.push(aLibs[i].name);
						}
						that.sendEvent(mEvents.LIBS, aLibNames);
					});
					this.attachEvent(mEvents.SETUP, function(oEvent){
						that._isOpen = true;
						Support.initPlugins(that, false);
					});
					break;
				case mTypes.IFRAME:
					this._oRemoteWindow = window.parent;
					this._sRemoteOrigin = UriParameters.fromQuery(window.location.search).get("sap-ui-xx-support-origin");
					this.openSupportTool();
					jQuery(window).bind("unload", function(oEvent){
						close(that._oOpenedWindow);
					});
					break;
				case mTypes.TOOL:
					this._oRemoteWindow = window.opener;
					this._sRemoteOrigin = UriParameters.fromQuery(window.location.search).get("sap-ui-xx-support-origin");
					jQuery(window).bind("unload", function(oEvent){
						that.sendEvent(mEvents.TEAR_DOWN);
						Support.exitPlugins(that, true);
					});
					this.attachEvent(mEvents.LIBS, function(oEvent){
						var aLibs = oEvent.mParameters;

						if (!Array.isArray(aLibs)) {
							aLibs = Object.keys(aLibs).map(function(sParam) {
								return aLibs[sParam];
							});
						}

						sap.ui.getCore().loadLibraries(aLibs, true).then(function() {
							jQuery(function(){
								Support.initPlugins(that, true).then(function() {
									that.sendEvent(mEvents.SETUP);
								});
							});
						});
					});
					this.sendEvent(mEvents.LIBS);
					break;
			}

		}
	});


	var mTypes = {
		APPLICATION: "APPLICATION", //Application stub -> the "standard one"
		IFRAME: "IFRAME", //Used by the Internet Explorer iFrame bridge only// TODO remove after the end of support for Internet Explorer
		TOOL: "TOOL" //Used by the support tool only
	};


	var mEvents = {
		LIBS: "sapUiSupportLibs",
		SETUP: "sapUiSupportSetup", //Event when support tool is opened
		TEAR_DOWN: "sapUiSupportTeardown" //Event when support tool is closed
	};


	/**
	 * Enumeration providing the possible support stub types.
	 *
	 * @static
	 * @enum
	 * @private
	 */
	Support.StubType = mTypes;


	/**
	 * Enumeration providing the predefined support event ids.
	 *
	 * @static
	 * @enum
	 * @private
	 */
	Support.EventType = mEvents;

	/**
	 * Support plugin registration
	 * @private
	 */
	var aPlugins = [];


	/**
	 * Returns the support stub instance. If an instance was not yet available a new one is
	 * with the given type is created.
	 *
	 * This function is internal and must not be called by an application.
	 *
	 * @param {string} [sType=sap.ui.core.support.Support.EventType.APPLICATION] the type
	 * @return {sap.ui.core.support.Support} the support stub
	 * @static
	 * @private
	 */
	Support.getStub = function(sType) {
		if (_oStubInstance) {
			return _oStubInstance;
		}

		if (sType != mTypes.APPLICATION && sType != mTypes.IFRAME && sType != mTypes.TOOL) {
			sType = mTypes.APPLICATION;
		}

		_bPrivate = true;
		_oStubInstance = new Support(sType);
		_bPrivate = false;

		return _oStubInstance;
	};

	/**
	 * Returns all plugins for the diagnostics tool window
	 * @returns {sap.ui.core.support.Plugin[]}
	 * @private
	 * @ui5-restricted
	 */
	Support.getToolPlugins = function() {
		var aResult = [];
		for (var i = 0; i < aPlugins.length; i++) {
			if (aPlugins[i] instanceof Plugin && aPlugins[i].isToolPlugin()) {
				aResult.push(aPlugins[i]);
			}
		}
		return aResult;
	};

	/**
	 * Returns all plugins for the application window
	 * @returns {sap.ui.core.support.Plugin[]}
	 * @private
	 * @ui5-restricted
	 */
	Support.getAppPlugins = function() {
		var aResult = [];
		for (var i = 0; i < aPlugins.length; i++) {
			if (aPlugins[i] instanceof Plugin && aPlugins[i].isAppPlugin()) {
				aResult.push(aPlugins[i]);
			}
		}
		return aResult;
	};


	/**
	 * Returns the type of this support stub.
	 *
	 * @see sap.ui.core.support.Support.StubType
	 * @return {string} the type of the support stub
	 * @private
	 */
	Support.prototype.getType = function() {
		return this._sType;
	};

	/**
	 * Returns true if this stub is running on the diagnostics tool window
	 *
	 * @returns {boolean} true if this stub is running on the diagnostics tool window, otherwise, false
	 * @private
	 * @ui5-restricted
	 */
	Support.prototype.isToolStub = function() {
		return this._sType === Support.StubType.TOOL;
	};

	/**
	 * Returns true if this stub is running on the application window
	 *
	 * @returns {boolean} true if this stub is running on the application window, otherwise, false
	 * @private
	 * @ui5-restricted
	 */
	Support.prototype.isAppStub = function() {
		return this._sType === Support.StubType.APPLICATION;
	};

	/**
	 * Receive event handler for postMessage communication.
	 *
	 * @param {object} oEvent the event
	 * @private
	 */
	Support.prototype._receiveEvent = function(oEvent) {
		var sData = oEvent.data;

		if (typeof sData === "string" && sData.indexOf("SAPUI5SupportTool*") === 0) {
			sData = sData.substr(18); // length of SAPUI5SupportTool*
		} else {
			return;
		}

		if (oEvent.source != this._oRemoteWindow) {
				return;
		}

		this._oRemoteOrigin = oEvent.origin;

		if (this._sType === mTypes.IFRAME) {
			var that = this;
			setTimeout(function(){
				that._oOpenedWindow.sap.ui.core.support.Support.getStub(mTypes.TOOL)._receiveEvent({source: window, data: oEvent.data, origin: that._sLocalOrigin});
			}, 0);
		} else {
			var oData = JSON.parse(sData);
			var sEventId = oData.eventId;
			var mParams = oData.params;
			this.fireEvent(sEventId, mParams);
		}
	};


	/**
	 * Sends an event to the remote window.
	 *
	 * @param {string} sEventId the event id
	 * @param {Object} [mParams] the parameter map (JSON)
	 * @private
	 * @ui5-restricted
	 */
	Support.prototype.sendEvent = function(sEventId, mParams) {
		if (!this._oRemoteWindow) {
			return;
		}

		mParams = mParams ? mParams : {};

		if ( Device.browser.msie && this._sType === mTypes.TOOL ) {// TODO remove after the end of support for Internet Explorer
			this._oRemoteWindow.sap.ui.core.support.Support.getStub(mTypes.IFRAME).sendEvent(sEventId, mParams);
		} else {
			var mParamsLocal = mParams;
			if ( Device.browser.msie ) {// TODO remove after the end of support for Internet Explorer
				//Attention mParams comes from an other window
				//-> (mParams instanceof Object == false)!
				mParamsLocal = {};
				jQuery.extend(true, mParamsLocal, mParams);
			}
			var oData = {"eventId": sEventId, "params": mParamsLocal};
			var sData = "SAPUI5SupportTool*" + JSON.stringify(oData);
			this._oRemoteWindow.postMessage(sData, this._sRemoteOrigin);
		}
	};


	/**
	 * Opens the support tool in an external browser window.
	 *
	 * @private
	 */
	Support.prototype.openSupportTool = function() {
		var sToolUrl = sap.ui.require.toUrl("sap/ui/core/support/support.html");
		var sParams = "?sap-ui-xx-noless=true&sap-ui-xx-support-origin=" + encodeURL(this._sLocalOrigin);

		var sBootstrapScript;
		if (this._sType === mTypes.APPLICATION) {
			// get bootstrap script name from script tag
			var oBootstrap = window.document.getElementById("sap-ui-bootstrap");
			if (oBootstrap) {
				var sRootPath = sap.ui.require.toUrl("");
				var sBootstrapSrc = oBootstrap.getAttribute('src');
				if (typeof sBootstrapSrc === 'string' && sBootstrapSrc.indexOf(sRootPath) === 0) {
					sBootstrapScript = sBootstrapSrc.substr(sRootPath.length);
				}
			}
		} else if (this._sType === mTypes.IFRAME) {
			// use script name from URI parameter to hand it over to the tool
			sBootstrapScript = UriParameters.fromQuery(window.location.search).get("sap-ui-xx-support-bootstrap");
		}

		// sap-ui-core.js is the default. no need for passing it to the support window
		// also ensure that the bootstrap script is in the root module path
		if (sBootstrapScript && sBootstrapScript !== 'sap-ui-core.js' && sBootstrapScript.indexOf('/') === -1) {
			sParams += "&sap-ui-xx-support-bootstrap=" + encodeURL(sBootstrapScript);
		}

		function checkLocalUrl(sUrl){
			//TODO find a proper check
			return (sUrl.indexOf(".") == 0 || sUrl.indexOf("/") == 0 || sUrl.indexOf("://") < 0);
		}

		if (this._sType === mTypes.APPLICATION) {
			if (!this._isOpen) {
				if ( Device.browser.msie ) {// TODO remove after the end of support for Internet Explorer
					var sIFrameUrl = sap.ui.require.toUrl("sap/ui/core/support/msiebridge.html");
					getSupportArea().html("").append(getSupportFrame(sIFrameUrl, sParams));
					this._sRemoteOrigin = checkLocalUrl(sIFrameUrl) ? this._sLocalOrigin : sIFrameUrl;
				} else {
					this._oRemoteWindow = openWindow(sToolUrl + sParams);
					this._sRemoteOrigin = checkLocalUrl(sToolUrl) ? this._sLocalOrigin : sToolUrl;
				}
			} else {
				// The diagnostics dialog is opened. Call the focus methode to show it up
				this._oRemoteWindow.focus();
			}
		} else if (this._sType === mTypes.IFRAME) {
			this._oOpenedWindow = openWindow(sToolUrl + sParams);
		}
	};

	// TODO remove after the end of support for Internet Explorer
	/**
	 * Event Handler which is bound to the onload event of the Internet Explorer iFrame bridge.
	 *
	 * @static
	 * @private
	 */
	Support._onSupportIFrameLoaded = function(){
		_oStubInstance._oRemoteWindow = jQuery(document.getElementById(ID_SUPPORT_AREA + "-frame"))[0].contentWindow;
	};


	/**
	 * @see sap.ui.base.EventProvider.prototype.toString
	 *
	 * @private
	 */
	Support.prototype.toString = function() {
		return "sap.ui.core.support.Support";
	};


	/**
	 * @see sap.ui.base.EventProvider.prototype.fireEvent
	 *
	 * @name sap.ui.core.support.Support.prototype.fireEvent
	 * @function
	 * @param {string} sEventId the event id
	 * @param {Object} [mParameters] the parameter map (JSON)
	 * @return {sap.ui.core.support.Support} Returns <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted
	 */


	/**
	 * @see sap.ui.base.EventProvider.prototype.detachEvent
	 *
	 * @name sap.ui.core.support.Support.prototype.detachEvent
	 * @function
	 * @private
	 * @ui5-restricted
	 */


	/**
	 * @see sap.ui.base.EventProvider.prototype.attachEvent
	 *
	 * @name sap.ui.core.support.Support.prototype.attachEvent
	 * @function
	 * @private
	 * @ui5-restricted
	 */


	//*************** PRIVATE **************

	var _bPrivate = false; //Ensures that the constructor can not be called from outside
	var _oStubInstance; //The stub instance

	var ID_SUPPORT_AREA = "sap-ui-support";


	function getSupportArea() {
		var $support = jQuery(document.getElementById(ID_SUPPORT_AREA));
		if ($support.length === 0) {
			$support = jQuery("<DIV/>", {id:ID_SUPPORT_AREA}).
				addClass("sapUiHidden").
				appendTo(document.body);
		}
		return $support;
	}


	function getSupportFrame(sIFrameUrl, sParams) {
		var oFrame = document.createElement("iframe");
		oFrame.id = ID_SUPPORT_AREA + "-frame";
		oFrame.src = sIFrameUrl + sParams;
		oFrame.onload = Support._onSupportIFrameLoaded;

		return oFrame;
	}


	function openWindow(sUrl) {
		return window.open(sUrl,
			"sapUiSupportTool",
			"width=800,height=700,status=no,toolbar=no,menubar=no,resizable=yes,location=no,directories=no,scrollbars=yes"
		);
	}


	function close(oWindow) {
		if (!oWindow) {
			return;
		}
		try {
			oWindow.close();
		} catch (e) {
			//escape eslint check for empty block
		}
	}

	/**
	 * Returns an array of of all library infos that define sap.ui.support extensions for diagnosticPlugins.
	 *
	 * @returns {LibraryInfo[]} Returns an array of of all library infos that contain a diagnosticPlugins extension
	 * @private
	 */
	Support.getDiagnosticLibraries = function() {
		var mLibs = sap.ui.getCore().getLoadedLibraries(),
			aLibs = [];
		for (var n in mLibs) {
			var oLib = mLibs[n];
			if (oLib.extensions && oLib.extensions["sap.ui.support"] && oLib.extensions["sap.ui.support"].diagnosticPlugins) {
				aLibs.push(oLib);
			}
		}
		return aLibs;
	};

	/**
	 * Loads and initializes all plugins on app or tool side depending on
	 * the <code>bTool</code> parameter.
	 *
	 * @param {sap.ui.core.support.Support} oStub Support instance (app or tool side)
	 * @param {boolean} bTool Whether tool or app side plugins should be handled
	 * @return {Promise} Resolved once the plugins have been loaded and initialized
	 * @private
	 */
	Support.initPlugins = function(oStub, bTool) {

		return new Promise(function(resolve, reject) {

			aPlugins = [];
			var aLibs = Support.getDiagnosticLibraries();
			for (var i = 0; i < aLibs.length; i++) {
				var oLib = aLibs[i],
					aLibPlugins = oLib.extensions["sap.ui.support"].diagnosticPlugins;
				if (Array.isArray(aLibPlugins)) {
					for (var j = 0; j < aLibPlugins.length; j++) {
						if (aPlugins.indexOf(aLibPlugins[j]) === -1) {
							aPlugins.push(aLibPlugins[j]);
						}
					}
				}
			}
			// collect plugin modules
			var aPluginModules = [],
				aPluginModuleIndexes = [],
				i;

			for ( i = 0; i < aPlugins.length; i++ ) {
				if ( typeof aPlugins[i] === "string" ) {
					aPluginModules.push( aPlugins[i] );
					aPluginModuleIndexes.push(i);
				}
			}

			sap.ui.require(aPluginModules, function() {

				var i,j,FNPluginConstructor;

				// instantiate loaded plugins
				for ( j = 0; j < arguments.length; j++ ) {
					FNPluginConstructor = arguments[j];
					i = aPluginModuleIndexes[j];
					if (oStub.isToolStub() && FNPluginConstructor.prototype.isToolPlugin()) {
						aPlugins[i] = new FNPluginConstructor(oStub);
						wrapPlugin(aPlugins[i]);
					} else if (oStub.isAppStub() && FNPluginConstructor.prototype.isAppPlugin()) {
						aPlugins[i] = new FNPluginConstructor(oStub);
					}
				}

				for ( i = 0; i < aPlugins.length; i++ ) {
					if (aPlugins[i] instanceof Plugin ) {
						if (oStub.isToolStub() && aPlugins[i].isToolPlugin()) {
							aPlugins[i].init(oStub);
						} else if (oStub.isAppStub() && aPlugins[i].isAppPlugin()) {
							aPlugins[i].init(oStub);
						}
					}
				}
				resolve();
			});

		});

	};

	/**
	 * Unloads all plugins on app or tool side depending on
	 * the <code>bTool</code> parameter.
	 *
	 * @param {sap.ui.core.support.Support} oStub Support instance (app or tool side)
	 * @param {boolean} bTool Whether tool or app side plugins should be handled
	 * @private
	 */
	Support.exitPlugins = function(oStub, bTool) {
		for (var i = 0; i < aPlugins.length; i++) {
			if (aPlugins[i] instanceof Plugin) {
				if (aPlugins[i].isToolPlugin() && oStub.isToolStub() && bTool) {
					aPlugins[i].exit(oStub, true);
				} else if (aPlugins[i].isAppPlugin() && oStub.isAppStub() && !bTool) {
					aPlugins[i].exit(oStub, false);
				}
			}
		}
	};


	function wrapPlugin(oPlugin) {
		oPlugin.$().replaceWith(
			"<div  id='" + oPlugin.getId() + "-Panel' class='sapUiSupportPnl'>" +
				"<div id='" + oPlugin.getId() + "-PanelHeader' class='sapUiSupportPnlHdr'>" +
					"<div id='" + oPlugin.getId() + "-PanelHandle' class='sapUiSupportPnlHdrHdl sapUiSupportPnlHdrHdlClosed'>" +
					"</div>" +
					"<div class='sapUiSupportPanelTitle'>" + oPlugin.getTitle() + "</div>" +
				"</div>" +
				"<div id='" + oPlugin.getId() + "-PanelContent' class='sapUiSupportPnlCntnt sapUiSupportHidden'>" +
					"<div id='" + oPlugin.getId() + "' class='sapUiSupportPlugin'></div>" +
				"</div>" +
			"</div>");

		oPlugin.$("PanelHeader").click(function(){
			var jHandleRef = oPlugin.$("PanelHandle");
			if (jHandleRef.hasClass("sapUiSupportPnlHdrHdlClosed")) {
				jHandleRef.removeClass("sapUiSupportPnlHdrHdlClosed");
				oPlugin.$("PanelContent").removeClass("sapUiSupportHidden");
			} else {
				jHandleRef.addClass("sapUiSupportPnlHdrHdlClosed");
				oPlugin.$("PanelContent").addClass("sapUiSupportHidden");
			}
		});
	}

	/**
	 * Initialize support mode based on configuration
	 */
	Support.initializeSupportMode = function(aSettings, bAsync) {
		if (aSettings.indexOf("true") > -1 || aSettings.indexOf("viewinfo") > -1) {
			Support._initializeSupportInfo(bAsync);
		}
	};

	/**
	 * Initialize Support Info Store This is only done if getSupportMode on configuration is true or viewinfo.
	 * @private
	 */
	Support._initializeSupportInfo = function(bAsync) {
		var aSupportInfos = [],
			aSupportInfosBreakpoints = [],
			aSupportXMLModifications = [],
			sDOMNodeAttribute = "support:data",
			sDOMNodeXMLNS = "support",
			sDOMNodeNamespaceURI = "http://schemas.sap.com/sapui5/extension/sap.ui.core.support.Support.info/1",
			mSupportInfos = {};

		var bHasLocalStorage = (function() {
			// Note: according to Web Storage spec, access to window.localStorage might already fail with a security exception
			// Note: on iOS, access to window.localStorage might succeed, but access to methods might fail (privacy mode)
			var key = "sap-ui-support.probe", value;
			try {
				localStorage.setItem(key, key);
				value = localStorage.getItem(key);
				localStorage.removeItem(key);
				return value === key;
			} catch (e) {
				return false;
			}
		}());

		// store breakpoints to local storage
		function _storeBreakpoints() {
			if (bHasLocalStorage) {
				localStorage.setItem("sap-ui-support.aSupportInfosBreakpoints/" + document.location.href, JSON.stringify(aSupportInfosBreakpoints));
			}
		}

		//store xml modification to local storage
		function _storeXMLModifications() {
			if (bHasLocalStorage) {
				localStorage.setItem("sap-ui-support.aSupportXMLModifications/" + document.location.href, JSON.stringify(aSupportXMLModifications));
			}
		}

		//read the stored data from the last run to enable modifications and breakpoints
		if (bHasLocalStorage) {
			var sValue = localStorage.getItem("sap-ui-support.aSupportInfosBreakpoints/" + document.location.href);
			if (sValue) {
				aSupportInfosBreakpoints = JSON.parse(sValue);
			}
			var sValue = localStorage.getItem("sap-ui-support.aSupportXMLModifications/" + document.location.href);
			if (sValue) {
				aSupportXMLModifications = JSON.parse(sValue);
			}
		}

		/**
		 * Adds the given info object to the support info stack
		 * @param {object} oInfo
		 *    oInfo.context : the context of the info, is not set the info is added to the last known context
		 *    oInfo.env : { any environmental information that is needed by toold to be interpreted }
		 * @experimental
		 * @private
		 */
		Support.info = function(oInfo) {
			oInfo._idx = aSupportInfos.length;
			if (oInfo._idx > 0 && !oInfo.context) {
				oInfo.context = aSupportInfos[aSupportInfos.length - 1].context;
			}
			if (!oInfo.context) {
				Log.debug("Support Info does not have a context and is ignored");
				return oInfo;
			}
			if (oInfo.context && oInfo.context.ownerDocument && oInfo.context.nodeType === 1) {
				var sValue = oInfo._idx + "";
				if (!oInfo.context.hasAttributeNS(sDOMNodeNamespaceURI, "data")) {
					oInfo.context.setAttribute("xmlns:" + sDOMNodeXMLNS, sDOMNodeNamespaceURI);
				} else {
					sValue =  oInfo.context.getAttributeNS(sDOMNodeNamespaceURI, "data") + "," + sValue;
				}
				oInfo.context.setAttributeNS(sDOMNodeNamespaceURI, sDOMNodeAttribute, sValue);
			}
			aSupportInfos.push(oInfo);

			if (aSupportInfosBreakpoints.indexOf(oInfo._idx) > -1) {
				Log.info(oInfo);
				Log.info("To remove this breakpoint execute:","\nsap.ui.core.support.Support.info.removeBreakpointAt(" + oInfo._idx + ")");
				/*eslint-disable no-debugger */
				debugger;
				/*eslint-enable no-debugger */
				//step out of this function to debug this support context
			}
			return oInfo._idx;
		};

		/**
		 * Returns all support information optionally filtered by a caller name
		 * @experimental
		 * @private
		 */
		Support.info.getAll = function(sCaller) {
			if (sCaller === undefined) {
				return aSupportInfos;
			} else {
				return aSupportInfos.filter(function(o) {
					return (o.env && o.env.caller === sCaller);
				});
			}
		};

		/**
		 * Returns the support info for all given indices
		 * @experimental
		 * @private
		 */
		Support.info.getInfos = function(aIndices) {
			if (aIndices && typeof aIndices === "string") {
				aIndices = aIndices.split(",");
			} else {
				aIndices = [];
			}
			var aResults = [];
			for (var i = 0; i < aIndices.length; i++) {
				if (aSupportInfos[aIndices[i]]) {
					aResults.push(aSupportInfos[aIndices[i]]);
				}
			}
			return aResults;
		};

		/**
		 * Returns the support info by index
		 * @param {int} the index of the info
		 * @experimental
		 * @private
		 */
		Support.info.byIndex = function(iIndex) {
			return aSupportInfos[iIndex];
		};

		/**
		 * Returns all current breakpoints
		 * @experimental
		 * @private
		 */
		Support.info.getAllBreakpoints = function() {
			return aSupportInfosBreakpoints;
		};

		/**
		 * Checks whether there is a breakpoint for the given index
		 * @experimental
		 * @private
		 */
		Support.info.hasBreakpointAt = function(iIndex) {
			return aSupportInfosBreakpoints.indexOf(iIndex) > -1;
		};

		/**
		 * Adds a breakpoint for the given index
		 * @experimental
		 * @private
		 */
		Support.info.addBreakpointAt = function(iIndex) {
			if (aSupportInfosBreakpoints.indexOf(iIndex) > -1) {
				return;
			}
			aSupportInfosBreakpoints.push(iIndex);
			_storeBreakpoints();
		};

		/**
		 * Removes a breakpoint for the given index
		 * @experimental
		 * @private
		 */
		Support.info.removeBreakpointAt = function(iIndex) {
			var iPos = aSupportInfosBreakpoints.indexOf(iIndex);
			if (iPos > -1) {
				aSupportInfosBreakpoints.splice(iPos,1);
				_storeBreakpoints();
			}
		};

		/**
		 * Removes all breakpoints
		 * @experimental
		 * @private
		 */
		Support.info.removeAllBreakpoints = function() {
			aSupportInfosBreakpoints = [];
			_storeBreakpoints();
		};

		/**
		 * Adds control related support data by id of a control
		 * This is used in the support tools to identify a control based on the support data gathered before a control tree was even created
		 * @experimental
		 * @private
		 */
		Support.info.addSupportInfo = function(sId, sSupportData) {
			if (sId && sSupportData) {
				if (mSupportInfos[sId]) {
					mSupportInfos[sId] += "," + sSupportData;
				} else {
					mSupportInfos[sId] = sSupportData;
				}
			}
		};

		/**
		 * Returns the support data for a given id.
		 * @experimental
		 * @private
		 */
		Support.info.byId = function(sId) {
			return mSupportInfos[sId] || null;
		};

		/**
		 * Returns the id for given support data
		 * This is used in the support tools to identify a control based on the support data gathered before a control tree was even created
		 * @experimental
		 * @private
		 */
		Support.info.getIds = function(sSupportData) {
			var aIds = [];
			for (var n in mSupportInfos) {
				var oData = mSupportInfos[n];
				if (oData && oData.indexOf(sSupportData) > -1) {
					aIds.push(n);
				}
			}
			return aIds;
		};

		/**
		 * Returns the list of elements that reported the given support data.
		 * @param {string} sSupportData Comma separated list of indices that should be looked up
		 * @returns {sap.ui.core.Element[]} list of elements
		 * @experimental
		 * @private
		 */
		Support.info.getElements = function(sSupportData) {
			var aControls = [];
			for (var n in mSupportInfos) {
				var oData = mSupportInfos[n];
				if (oData && oData.indexOf(sSupportData) === 0) {
					var oInstance = sap.ui.getCore().byId(n);
					if (oInstance) {
						aControls.push(sap.ui.getCore().byId(n));
					}
				}
			}
			return aControls;
		};

		/**
		 * Returns the list of all XML modifications.
		 * @returns {object[]} the list of modifications
		 * @experimental
		 * @private
		 */
		Support.info.getAllXMLModifications = function() {
			return aSupportXMLModifications;
		};

		/**
		 * Returns whether there are XML modifications.
		 * @returns {boolean} the list of modifications
		 * @experimental
		 * @private
		 */
		Support.info.hasXMLModifications = function() {
			return aSupportXMLModifications.length > 0;
		};

		/**
		 * Adds an XML modification to the stack of modifications.
		 * @param {string} sId the id of that is used to identify the change after a reaload
		 * @param {int} iIdx the index of node within the XML document (can be determined by root.querySelectorAll('*')
		 * @param {object} containing the change as {setAttribute: [attributeName,newValue]}
		 * @experimental
		 * @private
		 */
		Support.info.addXMLModification = function(sId, iIdx, oChange) {
			aSupportXMLModifications.push({
				id : sId,
				idx : iIdx,
				change : oChange
			});
			_storeXMLModifications();
		};

		/**
		 * Removes the XML modification with the given index.
		 * @experimental
		 * @private
		 */
		Support.info.removeXMLModification = function(iIdx) {
			var iPos = aSupportXMLModifications.indexOf(iIdx);
			if (iPos > -1) {
				aSupportXMLModifications.splice(iPos,1);
				_storeXMLModifications();
			}
		};

		/**
		 * Removes all XML modification.
		 * @experimental
		 * @private
		 */
		Support.info.removeAllXMLModification = function() {
			aSupportXMLModifications = [];
			_storeXMLModifications();
		};

		/**
		 * Modifies the XML where the id matches the id used when the modification was added
		 * @see Support.info.addXMLModification
		 * @experimental
		 * @private
		 */
		Support.info.modifyXML = function(sId, oXML) {
			if (!Support.info.hasXMLModifications()) {
				return;
			}
			var oNode = oXML;
			if (!oNode || !oNode.nodeType || !(oNode.nodeType == 1 || oNode.nodeType == 9)) {
				return;
			}
			if (oNode.nodeType === 9) {
				oNode = oNode.firstChild;
			}

			var aNodeList = oNode.querySelectorAll("*");
			var aNodes = [oNode];
			for (var i = 0; i < aNodeList.length; i++) {
				aNodes.push(aNodeList[i]);
			}
			for (var i = 0; i < aSupportXMLModifications.length; i++) {
				var oModification = aSupportXMLModifications[i],
					oChange = oModification.change;
				if (oModification.id === sId) {
					var oModificationNode = aNodes[oModification.idx];
					if (oModificationNode.nodeType === 1 && oChange.setAttribute) {
						var sOldValue = oModificationNode.getAttribute(oChange.setAttribute[0]);
						oModificationNode.setAttribute(oChange.setAttribute[0], oChange.setAttribute[1]);
						if (!oModificationNode._modified) {
							oModificationNode._modified = [];
						}
						oModificationNode._modified.push(oChange.setAttribute[0]);
						if (!oModificationNode._oldValues) {
							oModificationNode._oldValues = [];
						}
						oModificationNode._oldValues.push(sOldValue);
					}
				}
			}
		};

		Support.info._breakAtProperty = function(sKey) {
			return function (oEvent) {
				if (oEvent.getParameter("name") === sKey) {
					/*eslint-disable no-debugger */
					debugger;
					/*eslint-enable no-debugger */
					//step up to method setProperty who rased this event
				}
			};
		};

		Support.info._breakAtMethod = function(fn) {
			return function () {
				/*eslint-disable no-debugger */
				debugger;
				/*eslint-enable no-debugger */
				//step into next method fn.apply
				return fn.apply(this, arguments);
			};
		};

		var aModulesWhereToInjectSupportInfo = [
			"sap/ui/base/ManagedObject",
			"sap/ui/core/mvc/View",
			"sap/ui/core/XMLTemplateProcessor",
			"sap/ui/thirdparty/datajs"
		];

		function injectSupportInfo(ManagedObject, View, XMLTemplateProcessor, _datajs) {
			ManagedObject._supportInfo = Support.info;
			View._supportInfo = Support.info;
			XMLTemplateProcessor._supportInfo = Support.info;
			// Note: module 'datajs' currently exports the global 'OData', not 'datajs', therefore patching global directly
			if (window.datajs) {
				window.datajs._sap = {
					_supportInfo:  Support.info
				};
			}

			Log.info("sap.ui.core.support.Support.info initialized.");
		}

		if ( bAsync ) {
			sap.ui.require(aModulesWhereToInjectSupportInfo, injectSupportInfo);
		} else {
			injectSupportInfo.apply(null, aModulesWhereToInjectSupportInfo.map(sap.ui.requireSync) );
		}
	};

	return Support;

});