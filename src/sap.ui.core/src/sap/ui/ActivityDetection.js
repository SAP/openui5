/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {

	"use strict";

	/**
	 * Provides functionality for activity detection.
	 *
	 * @exports sap/ui/ActivityDetection
	 * @private
	 * @static
	 */
	var oActivityDetection = {},
		_active = true,
		_deactivateTimer = null,
		_I_MAX_IDLE_TIME = 10000, //max. idle time in ms
		_aActivateListeners = [],
		_activityDetected = false,
		_domChangeObserver = null;

	function _onDeactivate(){
		_deactivateTimer = null;

		if (_activityDetected && document.hidden !== true) {
			_onActivate();
			return;
		}

		_active = false;
		//_triggerEvent(_aDeactivateListeners); //Maybe provide later
		_domChangeObserver.observe(document.documentElement, {childList: true, attributes: true, subtree: true, characterData: true});
	}

	function _onActivate(){
		// Never activate when document is not visible to the user
		if (document.hidden) {
			return;
		}

		if (!_active) {
			_active = true;
			_triggerEvent(_aActivateListeners);
			_domChangeObserver.disconnect();
		}
		if (_deactivateTimer) {
			_activityDetected = true;
		} else {
			_deactivateTimer = setTimeout(_onDeactivate, _I_MAX_IDLE_TIME);
			_activityDetected = false;
		}
	}

	function _triggerEvent(aListeners){
		if (aListeners.length === 0) {
			return;
		}
		var aEventListeners = aListeners.slice();
		setTimeout(function(){
			var oInfo;
			for (var i = 0, iL = aEventListeners.length; i < iL; i++) {
				oInfo = aEventListeners[i];
				oInfo.fFunction.call(oInfo.oListener || window);
			}
		}, 0);
	}


	/**
	 * Registers the given handler to the activity event, which is fired when an activity was detected after a certain period of inactivity.
	 *
	 * The Event is not fired for Internet Explorer 8.
	 *
	 * @param {Function} fnFunction The function to call, when an activity event occurs.
	 * @param {Object} [oListener] The 'this' context of the handler function.
	 * @private
	 */
	oActivityDetection.attachActivate = function(fnFunction, oListener){
		_aActivateListeners.push({oListener: oListener, fFunction:fnFunction});
	};

	/**
	 * Deregisters a previously registered handler from the activity event.
	 *
	 * @param {Function} fnFunction The function to call, when an activity event occurs.
	 * @param {Object} [oListener] The 'this' context of the handler function.
	 * @private
	 */
	oActivityDetection.detachActivate = function(fnFunction, oListener){
		for (var i = 0, iL = _aActivateListeners.length; i < iL; i++) {
			if (_aActivateListeners[i].fFunction === fnFunction && _aActivateListeners[i].oListener === oListener) {
				_aActivateListeners.splice(i,1);
				break;
			}
		}
	};

	/**
	 * Checks whether recently an activity was detected.
	 *
	 * @return {boolean} <code>true</code> if recently an activity was detected, <code>false</code> otherwise
	 * @private
	 */
	oActivityDetection.isActive = function(){ return _active; };

	/**
	 * Reports an activity.
	 *
	 * @private
	 */
	oActivityDetection.refresh = _onActivate;


	// Setup and registering handlers

	var aEvents = ["resize", "orientationchange", "mousemove", "mousedown", "mouseup", //"mouseout", "mouseover",
		"paste", "cut", "keydown", "keyup", "DOMMouseScroll", "mousewheel"];

	if ('ontouchstart' in window) { // touch events supported
		aEvents.push("touchstart", "touchmove", "touchend", "touchcancel");
	}

	for (var i = 0; i < aEvents.length; i++) {
		window.addEventListener(aEvents[i], oActivityDetection.refresh, {
			capture: true,
			passive: true
		});
	}

	if (window.MutationObserver) {
		_domChangeObserver = new window.MutationObserver(oActivityDetection.refresh);
	} else if (window.WebKitMutationObserver) {
		_domChangeObserver = new window.WebKitMutationObserver(oActivityDetection.refresh);
	} else {
		_domChangeObserver = {
			observe : function(){
				document.documentElement.addEventListener("DOMSubtreeModified", oActivityDetection.refresh);
			},
			disconnect : function(){
				document.documentElement.removeEventListener("DOMSubtreeModified", oActivityDetection.refresh);
			}
		};
	}

	if (typeof document.hidden === "boolean") {
		document.addEventListener("visibilitychange", function() {
			// Only trigger refresh if document has changed to visible
			if (document.hidden !== true) {
				oActivityDetection.refresh();
			}
		}, false);
	}

	_onActivate();

	return oActivityDetection;

});