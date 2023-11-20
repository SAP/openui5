/*!
 * ${copyright}
 */

/* globals Map */

// Provides class sap.ui.core.ResizeHandler
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/Object",
	"sap/ui/core/IntervalTrigger",
	"sap/ui/thirdparty/jquery",
	"sap/ui/util/ActivityDetection"
],
	function(Log, BaseObject, IntervalTrigger, jQuery, ActivityDetection) {
	"use strict";

	// local logger, by default only logging errors
	var log = Log.getLogger("sap.ui.core.ResizeHandler", Log.Level.ERROR);

	// singleton instance
	var oResizeHandler;

	/**
	 * @class
	 * Regularly checks the width and height of registered DOM elements or controls and fires
	 * resize events to registered listeners when a change is detected.
	 *
	 * <b>Note</b>: The public usage of the constructor is deprecated since 1.103.0.
	 * Please use the static methods of the module export only and do not expect the module export
	 * to be a class (do not subclass it, do not create instances, do not call inherited methods).
	 *
	 * @hideconstructor
	 * @alias sap.ui.core.ResizeHandler
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */

	var ResizeHandler = BaseObject.extend("sap.ui.core.ResizeHandler", /** @lends sap.ui.core.ResizeHandler.prototype */ {

		constructor : function() {
			BaseObject.apply(this);

			this.aResizeListeners = [];
			this.aSuspendedDomRefs = [];
			this.bRegistered = false;
			this.mCallbacks = new Map();

			this.iIdCounter = 0;

			/**
			 * The block below is not needed because it only did a cleanup
			 * before the page was closed. This should not be necessary.
			 * Nevertheless we leave the coding here and only deprecate it,
			 * in order to keep the BFCache behavior stable.
			 * Removing the 'unload' handler could potentially activate
			 * the BFCache and cause a different behavior in browser versions
			 * where the 'unload' handler is still supported.
			 * Therefore we only removed the not needed cleanup coding
			 * but still attach a noop to ensure this handler would still
			 * invalidate the BFCache.
			 * @deprecated as of 1.119
			 */
			window.addEventListener("unload", () => {});

			ActivityDetection.attachActivate(initListener, this);

			if (oResizeHandler) {
				log.error(
					"ResizeHandler is designed as a singleton and should not be created manually! " +
					"Please require 'sap/ui/core/ResizeHandler' instead and use the module export directly without using 'new'."
				);
			}
		}
	});

	function clearListener(){
		if (this.bRegistered) {
			this.bRegistered = false;
			IntervalTrigger.removeListener(this.checkSizes, this);
		}
	}

	function initListener(){
		if (!this.bRegistered && this.aResizeListeners.length > 0) {
			this.bRegistered = true;
			IntervalTrigger.addListener(this.checkSizes, this);
		}
	}

	/**
	 * Attaches listener to resize event.
	 *
	 * @param {Element|sap.ui.core.Control} oRef the DOM reference or a control
	 * @param {function} fnHandler the event handler function
	 * @returns {string} Registration-ID for later detaching.
	 * @private
	 */
	ResizeHandler.prototype.attachListener = function(oRef, fnHandler){
		var bIsControl = BaseObject.isObjectA(oRef, 'sap.ui.core.Control'),
			bIsJQuery = oRef instanceof jQuery, // actually, jQuery objects are not allowed as oRef, as per the API documentation. But this happens in the wild.
			oDom = bIsControl ? oRef.getDomRef() : oRef,
			iWidth = oDom ? oDom.offsetWidth : 0,
			iHeight = oDom ? oDom.offsetHeight : 0,
			sId = "rs-" + Date.now() + "-" + this.iIdCounter++,
			dbg;

		if (bIsControl) {
			dbg = ("Control " + oRef.getId());
		} else if (oRef.id) {
			dbg = oRef.id;
		} else {
			dbg = String(oRef);
		}

		this.aResizeListeners.push({sId: sId, oDomRef: bIsControl ? null : oRef, oControl: bIsControl ? oRef : null, bIsJQuery: bIsJQuery, fHandler: fnHandler, iWidth: iWidth, iHeight: iHeight, dbg: dbg});
		log.debug("registered " + dbg);

		initListener.call(this);

		return sId;
	};

	/**
	 * Detaches listener from resize event.
	 *
	 * @param {string} sId Registration-ID returned from attachListener
	 * @private
	 */
	ResizeHandler.prototype.detachListener = function(sId){
		var aResizeListeners = this.aResizeListeners;
		for ( var i = 0; i < aResizeListeners.length; i++ ) {
			if (aResizeListeners[i].sId === sId) {
				aResizeListeners.splice(i, 1);
				log.debug("deregistered " + sId);
				break;
			}
		}

		// if list is empty now, stop interval
		if (aResizeListeners.length === 0) {
			clearListener.call(this);
		}
	};


	/**
	 * Check sizes of resize elements.
	 *
	 * @private
	 */
	ResizeHandler.prototype.checkSizes = function() {
		var bDebug = log.isLoggable();
		if ( bDebug ) {
			log.debug("checkSizes:");
		}
		this.aResizeListeners.forEach(function(oResizeListener){
			if (oResizeListener) {
				var bCtrl = !!oResizeListener.oControl,
					oDomRef = bCtrl ? oResizeListener.oControl.getDomRef() : oResizeListener.oDomRef;

				oDomRef = oResizeListener.bIsJQuery ? oDomRef[0] : oDomRef;

				if (oDomRef && document.documentElement.contains(oDomRef) && !this._isSuspended(oDomRef)) { //check that domref is still active and not suspended

					var iOldWidth = oResizeListener.iWidth,
						iOldHeight = oResizeListener.iHeight,
						iNewWidth = oDomRef.offsetWidth,
						iNewHeight = oDomRef.offsetHeight;

					if (iOldWidth != iNewWidth || iOldHeight != iNewHeight) {
						oResizeListener.iWidth = iNewWidth;
						oResizeListener.iHeight = iNewHeight;

						var oEvent = jQuery.Event("resize");
						oEvent.target = oDomRef;
						oEvent.currentTarget = oDomRef;
						oEvent.size = {width: iNewWidth, height: iNewHeight};
						oEvent.oldSize = {width: iOldWidth, height: iOldHeight};
						oEvent.control = bCtrl ? oResizeListener.oControl : null;

						if ( bDebug ) {
							log.debug("resize detected for '" + oResizeListener.dbg + "': " + oEvent.oldSize.width + "x" + oEvent.oldSize.height + " -> " + oEvent.size.width + "x" + oEvent.size.height);
						}

						oResizeListener.fHandler(oEvent);
					}

				}
			}
		}, this);

		if (ResizeHandler._keepActive != true && ResizeHandler._keepActive != false) {
			//initialize default
			ResizeHandler._keepActive = false;
		}

		if (!ActivityDetection.isActive() && !ResizeHandler._keepActive) {
			clearListener.call(this);
		}
	};

	/**
	 * Registers the given event handler for resize events on the given DOM element or control.
	 *
	 * The resize handler periodically checks the dimensions of the registered reference. Whenever it detects changes, an event is fired.
	 * Be careful when changing dimensions within the event handler which might cause another resize event and so on.
	 *
	 * The available parameters of the resize event are:
	 * <ul>
	 * <li><code>oEvent.target</code>: The DOM element of which the dimensions were checked</li>
	 * <li><code>oEvent.size.width</code>: The current width of the DOM element in pixels</li>
	 * <li><code>oEvent.size.height</code>: The current height of the DOM element in pixels</li>
	 * <li><code>oEvent.oldSize.width</code>: The previous width of the DOM element in pixels</li>
	 * <li><code>oEvent.oldSize.height</code>: The previous height of the DOM element in pixels</li>
	 * <li><code>oEvent.control</code>: The control which was given during registration of the event handler (if present)</li>
	 * </ul>
	 *
	 * @param {Element|sap.ui.core.Control} oRef The control or the DOM reference for which the given event handler should be registered (beside the window)
	 * @param {function({target: Element, size: {width: float, height: float}, oldSize: {width: float, height: float}, control=: sap.ui.core.Control})} fnHandler
	 *             The event handler which should be called whenever the size of the given reference is changed.
	 *             The event object is passed as first argument to the event handler. See the description of this function for more details about the available parameters of this event.
	 * @returns {string|null}
	 *             A registration ID which can be used for deregistering the event handler, see {@link sap.ui.core.ResizeHandler.deregister}.
	 *             If the UI5 framework is not yet initialized <code>null</code> is returned.
	 * @public
	 */
	ResizeHandler.register = function(oRef, fnHandler) {
		return oResizeHandler.attachListener(oRef, fnHandler);
	};

	/**
	 * Deregisters a previously registered handler for resize events with the given registration ID.
	 *
	 * @param {string} sId
	 *            The registration ID of the handler to deregister. The ID was provided by function {@link sap.ui.core.ResizeHandler.register}
	 *            when the handler was registered.
	 * @public
	 */
	ResizeHandler.deregister = function(sId) {
		oResizeHandler.detachListener(sId);
	};

	/**
	 * Deregisters all registered handler for resize events for the given control.
	 *
	 * @param {string} sControlId The Id of the control.
	 * @private
	 */
	ResizeHandler.deregisterAllForControl = function(sControlId) {
		oResizeHandler.aResizeListeners.filter(function(oResizeListener){
			return oResizeListener && oResizeListener.oControl && oResizeListener.oControl.getId() === sControlId;
		}).forEach(function(oResizeListener) {
			ResizeHandler.deregister(oResizeListener.sId);
		});
	};

	/**
	 * Suspends indefinitely the execution of ResizeHandler listeners for the given DOM reference and its children.
	 *
	 * @param {Element} oDomRef the DOM reference to suspend
	 * @returns {boolean} Whether the <code>oDomRef</code> was successfully marked as suspended
	 * @private
	 * @ui5-restricted sap.ui.core, SAPUI5 Controls
	 */
	ResizeHandler.suspend = function(oDomRef) {
		// Check if the dom ref is valid within the document
		if (!document.documentElement.contains(oDomRef)) {
			return false;
		}

		// Check if the dom ref is already suspended
		if (oResizeHandler.aSuspendedDomRefs.indexOf(oDomRef) === -1) {
			oResizeHandler.aSuspendedDomRefs.push(oDomRef);
		}

		return true;
	};

	/**
	 * Resumes the execution of ResizeHandler listeners for the given DOM reference.
	 *
	 * @param {Element} oDomRef the DOM reference to resume
	 * @returns {boolean} Whether resume for <code>oDomRef</code> was successful
	 * @private
	 * @ui5-restricted sap.ui.core, SAPUI5 Controls
	 */
	ResizeHandler.resume = function(oDomRef) {
		var iIndex = oResizeHandler.aSuspendedDomRefs.indexOf(oDomRef);

		// If the dom ref is not registered, nothing to do
		if (iIndex === -1) {
			return false;
		}

		// Remove the dom ref and execute listeners again
		oResizeHandler.aSuspendedDomRefs.splice(iIndex, 1);
		oResizeHandler.checkSizes();

		// inform interested parties
		var aCallbacks = oResizeHandler.mCallbacks.get(oDomRef);
		if (aCallbacks) {
			for (var i = 0; i < aCallbacks.length; i++) {
				aCallbacks[i]();
			}
			oResizeHandler.mCallbacks.delete(oDomRef);
		}

		return true;
	};

	/**
	 * Checks if the given DOM reference is a child (or exact match) of a DOM area that is suspended from observation for size changes.
	 * This instance method is an internal shortcut.
	 * @param {Element} oDomRef the DOM reference
	 * @returns {boolean} Whether the <code>oDomRef</code> is suspended
	 * @private
	 */
	ResizeHandler.prototype._isSuspended = function(oDomRef) {
		var aSuspendedDomRefs = this.aSuspendedDomRefs,
			oNextSuspendedDomRef;
		for (var i = 0; i < aSuspendedDomRefs.length; i++) {
			oNextSuspendedDomRef = aSuspendedDomRefs[i];
			if (oNextSuspendedDomRef.contains(oDomRef)) {
				return oNextSuspendedDomRef;
			}
		}
		return false;
	};

	/**
	 * Checks if the given DOM reference is a child (or exact match) of a DOM area that is suspended from observation for size changes
	 *
	 * @param {Element} oDomRef the DOM reference.
	 * @param {function} [fnCallback] a callback function to be called once the DOM node is resumed which was found to be the primary
	 *        reason for oDomRef to be suspended. Note that isSuspended() may still be true when other DOM nodes are still suspended.
	 *        Also note that each isSuspended() call registers the callback, but only if it was not found to be already registered.
	 * @returns {boolean} Whether the <code>oDomRef</code> is suspended
	 * @private
	 * @ui5-restricted sap.ui.core, SAPUI5 Controls
	 */
	ResizeHandler.isSuspended = function(oDomRef, fnCallback) {
		var vSuspended = oResizeHandler._isSuspended(oDomRef);
		if (fnCallback && vSuspended) { // DOM node causing the suspension
			var aCallbacks = oResizeHandler.mCallbacks.get(vSuspended);
			if (!aCallbacks) {
				aCallbacks = [];
				oResizeHandler.mCallbacks.set(vSuspended, aCallbacks);
			}
			if (aCallbacks.indexOf(fnCallback) === -1) {
				aCallbacks.push(fnCallback);
			}
		}
		return !!vSuspended;
	};

	/**
	 * Returns a metadata object for class <code>sap.ui.core.ResizeHandler</code>.
	 *
	 * @returns {sap.ui.base.Metadata} Metadata object describing this class
	 *
	 * @function
	 * @name sap.ui.core.ResizeHandler.getMetadata
	 * @public
	 * @deprecated Since version 1.110. As the class nature of ResizeHandler is deprecated since 1.103,
	 *     the <code>getMetadata</code> method shouldn't be called either
	 */

	/**
	 * Creates a new subclass of class <code>sap.ui.core.ResizeHandler</code>.
	 *
	 * @param {string} sClassName Name of the class being created
	 * @param {object} [oClassInfo] Object literal with information about the class
	 * @param {function} [FNMetaImpl] Constructor function for the metadata object; if not given, it defaults to the metadata implementation used by this class
	 * @returns {function} Created class / constructor function
	 *
	 * @function
	 * @name sap.ui.core.ResizeHandler.extend
	 * @public
	 * @deprecated Since version 1.110. As the class nature of ResizeHandler is deprecated since 1.103,
	 *     the <code>extend</code> method shouldn't be called either
	 */

	/**
	 * @private
	 */
	oResizeHandler = new ResizeHandler();

	return ResizeHandler;
});