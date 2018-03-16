/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
/*global window */
sap.ui.define([
	'sap/base/log',
	'sap/ui/dom/containsOrEquals',
	'sap/ui/thirdparty/jquery',
	'sap/base/util/uid'
], function(log, containsOrEquals, jQuery, uid) {
	"use strict";

	var mTriggerEventInfo = {};

	/**
	 * Trigger function to be used as jQuery.event.special[xyz].trigger.
	 * Checks whether the event should be suppressed for the given target or not.
	 */
	function fnTriggerHook(oEvent) {
		var bIsLoggable = log.isLoggable(log.Level.DEBUG),
			mEventInfo = mTriggerEventInfo[oEvent.type],
			fnOriginalTriggerHook = mEventInfo.originalTriggerHook,
			t0 = window.performance.now(),
			t1, sId, oDomInfo;

		if (!oEvent.isPropagationStopped() && !oEvent.isSimulated) {
			for (sId in mEventInfo.domRefs) {
				oDomInfo = mEventInfo.domRefs[sId];
				if (oDomInfo.excludedDomRefs.indexOf(oEvent.target) === -1 && containsOrEquals(oDomInfo.domRef, oEvent.target)) {
					oEvent.preventDefault();
					oEvent.stopImmediatePropagation();
					if (bIsLoggable) {
						t1 = window.performance.now();
						log.debug("Perf: jQuery trigger supression event handler " + oEvent.type + " took " + (t1 - t0) + " milliseconds.");
					}
					return false; //prevent further jQuery processing.
				}
			}
		}
		if (fnOriginalTriggerHook) {
			return fnOriginalTriggerHook.call(this, oEvent);
		}
	}

	/**
	 * Register special jQuery.trigger event hook
	 */
	function _applyTriggerHook(sEventType) {
		if (!jQuery.event.special[sEventType]) {
			jQuery.event.special[sEventType] = {};
		}
		var oSpecialEvent = jQuery.event.special[sEventType],
			originalTriggerHook = oSpecialEvent.trigger;

		oSpecialEvent.trigger = fnTriggerHook;

		return originalTriggerHook;
	}

	/**
	 * Suppress jQuery.trigger events for a given DOM element
	 *
	 * mTriggerEventInfo example:
	 *
	 * mTriggerEventInfo: {
	 * 		'EventType': {
	 * 			domRefs: {
	 * 				'DomRefId': {
	 * 					domRef: 'DomRef',
	 * 					excludedDomRefs: aDomRefs
	 * 				}
	 * 			},
	 * 			hookApplied: 'boolean'
	 * 			originalTriggerHook: 'fnHook'
	 * 		}
	 * }
	 *
	 * @param {string} sEventType Event type to suppress jQuery.trigger for
	 * @param {Element} oDomRef DOM element to suppress events from jQuery.trigger
	 * @param {Element|Array} [aExcludedDomRefs] DomRefs excluded from suppress events from jQuery.trigger
	 * @returns {Object} oHandler The suppression handler. Needed for releasing the suppression
	 * @private
	 */
	function suppressTriggeredEvent(sEventType, oDomRef, aExcludedDomRefs) {
		var mEventInfo = mTriggerEventInfo[sEventType];
		var sId = uid();

		if (!mEventInfo) {
			mEventInfo = mTriggerEventInfo[sEventType] = {
				domRefs: {},
				originalTriggerHook: _applyTriggerHook(sEventType)
			};
		}

		mEventInfo.domRefs[sId] = {
			domRef: oDomRef,
			excludedDomRefs: [].concat(aExcludedDomRefs)
		};

		return {
			id: sId,
			type: sEventType
		};
	}

	/**
	 * Stop suppressing jQuery.trigger events for a given DOM element
	 *
	 * @param {Object} oHandler The suppression handler
	 * @private
	 */
	function releaseTriggeredEvent(oHandler) {
		if (!oHandler) {
			jQuery.sap.log.error("Release trigger events must not be called without passing a valid handler!");
			return;
		}

		var mEventInfo = mTriggerEventInfo[oHandler.type];

		if (!mEventInfo) {
			return;
		} else if (!mEventInfo.domRefs[oHandler.id] || !mEventInfo.domRefs[oHandler.id].domRef) {
			log.warning("Release trigger event for event type " + oHandler.type + "on Control " + oHandler.id + ": DomRef does not exists");
			return;
		}

		delete mEventInfo.domRefs[oHandler.id];
	}

	return {
		suppress: suppressTriggeredEvent,
		release: releaseTriggeredEvent
	};
});