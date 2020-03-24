/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/base/util/Version',
	'sap/ui/events/PseudoEvents',
	'sap/ui/events/checkMouseEnterOrLeave',
	'sap/ui/events/ControlEvents',
	'sap/ui/Device',
	'sap/ui/events/TouchToMouseMapping',
	'sap/ui/thirdparty/jquery',
	'sap/ui/thirdparty/jquery-mobile-custom',
	'sap/ui/dom/jquery/control'
], function(Version, PseudoEvents, checkMouseEnterOrLeave, ControlEvents, Device, TouchToMouseMapping, jQuery /*, jQueryMobile, control, EventExtension*/) {
	"use strict";

	/**
	 * @namespace
	 * @alias module:sap/ui/events/jquery/EventSimulation
	 * @public
	 */
	var oEventSimulation = {};

	oEventSimulation.aAdditionalControlEvents = [];
	oEventSimulation.aAdditionalPseudoEvents = [];

	/**
	 * This function adds the simulated event prefixed with string "sap" to ControlEvents.events.
	 *
	 * When UIArea binds to the simulated event with prefix, it internally binds to the original events with the given handler and
	 * also provides the additional configuration data in the follwing format:
	 *
	 * {
	 * 	domRef: // the dom reference of the UIArea
	 * 	eventName: // the simulated event name
	 * 	sapEventName: // the simulated event name with sap prefix
	 * 	eventHandle: // the handler that should be registered to simulated event with sap prefix
	 * }
	 *
	 * @param {string} sSimEventName The name of the simulated event
	 * @param {array} aOrigEvents The array of original events that should be simulated from
	 * @param {function} fnHandler The function which is bound to the original events
	 * @private
	 */
	oEventSimulation._createSimulatedEvent = function(sSimEventName, aOrigEvents, fnHandler) {
		var sHandlerKey = "__" + sSimEventName + "Handler";
		var sSapSimEventName = "sap" + sSimEventName;
		this.aAdditionalControlEvents.push(sSapSimEventName);
		this.aAdditionalPseudoEvents.push({
			sName: sSimEventName,
			aTypes: [sSapSimEventName],
			fnCheck: function(oEvent) {
				return true;
			}
		});

		jQuery.event.special[sSapSimEventName] = {
			// When binding to the simulated event with prefix is done through jQuery, this function is called and redirect the registration
			// to the original events. Doing in this way we can simulate the event from listening to the original events.
			add: function(oHandle) {
				var that = this,
					$this = jQuery(this),
					oAdditionalConfig = {
						domRef: that,
						eventName: sSimEventName,
						sapEventName: sSapSimEventName,
						eventHandle: oHandle
					};

				var fnHandlerWrapper = function(oEvent) {
					fnHandler(oEvent, oAdditionalConfig);
				};

				oHandle.__sapSimulatedEventHandler = fnHandlerWrapper;
				for (var i = 0; i < aOrigEvents.length; i++) {
					$this.on(aOrigEvents[i], fnHandlerWrapper);
				}
			},

			// When unbinding to the simulated event with prefix is done through jQuery, this function is called and redirect the deregistration
			// to the original events.
			remove: function(oHandle) {
				var $this = jQuery(this);
				var fnHandler = oHandle.__sapSimulatedEventHandler;
				$this.removeData(sHandlerKey + oHandle.guid);
				for (var i = 0; i < aOrigEvents.length; i++) {
					jQuery.event.remove(this, aOrigEvents[i], fnHandler);
				}
			}
		};
	};

	/**
	 * This function simulates the corresponding touch event by listening to mouse event.
	 *
	 * The simulated event will be dispatch through UI5 event delegation which means that the <code>on"EventName"</code> function is called
	 * on control's prototype.
	 *
	 * @param {jQuery.Event} oEvent The original event object
	 * @param {object} oConfig Additional configuration passed from createSimulatedEvent function
	 * @private
	 */
	oEventSimulation._handleMouseToTouchEvent = function(oEvent, oConfig) {
		// Suppress the delayed mouse events simulated on touch enabled device
		// the mark is done within jquery-mobile-custom.js
		if (oEvent.isMarked("delayedMouseEvent")) {
			return;
		}

		var $DomRef = jQuery(oConfig.domRef),
			oControl = jQuery.fn.control ? jQuery(oEvent.target).control(0) : null,
			sTouchStartControlId = $DomRef.data("__touchstart_control"),
			oTouchStartControlDOM = sTouchStartControlId && window.document.getElementById(sTouchStartControlId);

		// Checks if the mouseout event should be handled, the mouseout of the inner dom shouldn't be handled when the mouse cursor
		// is still inside the control's root dom node
		if (oEvent.type === "mouseout" && !checkMouseEnterOrLeave(oEvent, oConfig.domRef)
			&& (!oTouchStartControlDOM || !checkMouseEnterOrLeave(oEvent, oTouchStartControlDOM))
		) {
			return;
		}

		var oNewEvent = jQuery.event.fix(oEvent.originalEvent || oEvent);
		oNewEvent.type = oConfig.sapEventName;

		//reset the _sapui_handledByUIArea flag
		if (oNewEvent.isMarked("firstUIArea")) {
			oNewEvent.setMark("handledByUIArea", false);
		}

		var aTouches = [{
			identifier: 1,
			pageX: oNewEvent.pageX,
			pageY: oNewEvent.pageY,
			clientX: oNewEvent.clientX,
			clientY: oNewEvent.clientY,
			screenX: oNewEvent.screenX,
			screenY: oNewEvent.screenY,
			target: oNewEvent.target,
			radiusX: 1,
			radiusY: 1,
			rotationAngle: 0
		}];

		switch (oConfig.eventName) {
			case "touchstart":
				// save the control id in case of touchstart event
				if (oControl) {
					$DomRef.data("__touchstart_control", oControl.getId());
				}
				// fall through
			case "touchmove":
				oNewEvent.touches = oNewEvent.changedTouches = oNewEvent.targetTouches = aTouches;
				break;

			case "touchend":
				oNewEvent.changedTouches = aTouches;
				oNewEvent.touches = oNewEvent.targetTouches = [];
				break;
			// no default
		}

		if (oConfig.eventName === "touchstart" || $DomRef.data("__touch_in_progress")) {
			$DomRef.data("__touch_in_progress", "X");

			// When saptouchend event is generated from mouseout event, it has to be marked for being correctly handled inside UIArea.
			// for example, when sap.m.Image control is used inside sap.m.Button control, the following situation can happen:
			// 	1. Mousedown on image.
			// 	2. Keep mousedown and move mouse out of image.
			// 	3. ontouchend function will be called on image control and bubbled up to button control
			// 	4. However, the ontouchend function shouldn't be called on button.
			//
			// With this parameter, UIArea can check if the touchend is generated from mouseout event and check if the target is still
			// inside the current target. Executing the corresponding logic only when the target is out of the current target.
			if (oEvent.type === "mouseout") {
				oNewEvent.setMarked("fromMouseout");
			}

			// touchstart event is always forwarded to the control without any check
			// other events are checked with the touchstart control id in UIArea.js and we save the touchstart control
			// id to the event. In UIArea, the event is dispatched to a UI5 element only when the root DOM of that UI5
			// element contains or equals the touchstart control DOM
			if (oConfig.eventName !== "touchstart" && (!oControl || oControl.getId() !== sTouchStartControlId)) {
				oNewEvent.setMark("scopeCheckId", sTouchStartControlId);
			}

			// dragstart event is only used to determine when to stop the touch process and shouldn't trigger any event
			if (oEvent.type !== "dragstart") {
				oConfig.eventHandle.handler.call(oConfig.domRef, oNewEvent);
			}

			// here the fromMouseout flag is checked, terminate the touch progress when the native event is dragstart or touchend event
			// is not marked with fromMouseout.
			if ((oConfig.eventName === "touchend" || oEvent.type === "dragstart") && !oNewEvent.isMarked("fromMouseout")) {
				$DomRef.removeData("__touch_in_progress");
				$DomRef.removeData("__touchstart_control");
			}
		}
	};

	// Simulate touch events on NOT delayed mouse events (delayed mouse
	// events are filtered out in fnMouseToTouchHandler)
	oEventSimulation._initTouchEventSimulation = function() {
		this._createSimulatedEvent("touchstart", ["mousedown"], this._handleMouseToTouchEvent);
		this._createSimulatedEvent("touchend", ["mouseup", "mouseout"], this._handleMouseToTouchEvent);
		// Browser doesn't fire any mouse event after dragstart, so we need to listen to dragstart to cancel the current touch process in order
		// to correctly stop firing the touchmove event
		this._createSimulatedEvent("touchmove", ["mousemove", "dragstart"], this._handleMouseToTouchEvent);
	};

	// polyfill for iOS context menu event (mapped to taphold)
	oEventSimulation._initContextMenuSimulation = function() {
		//map the taphold event to contextmenu event
		var fnSimulatedFunction = function(oEvent, oConfig) {
			var oNewEvent = jQuery.event.fix(oEvent.originalEvent || oEvent);
			oNewEvent.type = oConfig.sapEventName;

			// The original handler is called only when there's no text selected
			if (!window.getSelection || !window.getSelection() || window.getSelection().toString() === "") {
				oConfig.eventHandle.handler.call(oConfig.domRef, oNewEvent);
			}
		};
		this._createSimulatedEvent("contextmenu", ["taphold"], fnSimulatedFunction);
	};

	// Simulate mouse events on browsers firing touch events
	oEventSimulation._initMouseEventSimulation = function(bBlackberryDevice) {

		var bFingerIsMoved = false,
			iMoveThreshold = jQuery.vmouse.moveDistanceThreshold,
			iStartX, iStartY,
			iOffsetX, iOffsetY,
			iLastTouchMoveTime;

		var fnCreateNewEvent = function(oEvent, oConfig, oMappedEvent) {
			var oNewEvent = jQuery.event.fix(oEvent.originalEvent || oEvent);
			oNewEvent.type = oConfig.sapEventName;

			delete oNewEvent.touches;
			delete oNewEvent.changedTouches;
			delete oNewEvent.targetTouches;

			//TODO: add other properties that should be copied to the new event
			oNewEvent.screenX = oMappedEvent.screenX;
			oNewEvent.screenY = oMappedEvent.screenY;
			oNewEvent.clientX = oMappedEvent.clientX;
			oNewEvent.clientY = oMappedEvent.clientY;
			oNewEvent.ctrlKey = oMappedEvent.ctrlKey;
			oNewEvent.altKey = oMappedEvent.altKey;
			oNewEvent.shiftKey = oMappedEvent.shiftKey;
			// The simulated mouse event should always be clicked by the left key of the mouse
			oNewEvent.button = 0;

			return oNewEvent;
		};

		/**
		 * This function simulates the corresponding mouse event by listening to touch event (touchmove).
		 *
		 * The simulated event will be dispatch through UI5 event delegation which means that the on"EventName" function is called
		 * on control's prototype.
		 *
		 * @param {jQuery.Event} oEvent The original event object
		 * @param {object} oConfig Additional configuration passed from createSimulatedEvent function
		 */
		var fnTouchMoveToMouseHandler = function(oEvent, oConfig) {
			if (oEvent.isMarked("handledByTouchToMouse")) {
				return;
			}
			oEvent.setMarked("handledByTouchToMouse");

			if (!bFingerIsMoved) {
				var oTouch = oEvent.originalEvent.touches[0];
				bFingerIsMoved = (Math.abs(oTouch.pageX - iStartX) > iMoveThreshold ||
					Math.abs(oTouch.pageY - iStartY) > iMoveThreshold);
			}

			if (bBlackberryDevice) {
				//Blackberry sends many touchmoves -> create a simulated mousemove every 50ms
				if (iLastTouchMoveTime && oEvent.timeStamp - iLastTouchMoveTime < 50) {
					return;
				}
				iLastTouchMoveTime = oEvent.timeStamp;
			}

			var oNewEvent = fnCreateNewEvent(oEvent, oConfig, oEvent.touches[0]);

			setTimeout(function() {
				oNewEvent.setMark("handledByUIArea", false);
				oConfig.eventHandle.handler.call(oConfig.domRef, oNewEvent);
			}, 0);
		};

		/**
		 * This function simulates the corresponding mouse event by listening to touch event (touchstart, touchend, touchcancel).
		 *
		 * The simulated event will be dispatch through UI5 event delegation which means that the on"EventName" function is called
		 * on control's prototype.
		 *
		 * @param {jQuery.Event} oEvent The original event object
		 * @param {object} oConfig Additional configuration passed from createSimulatedEvent function
		 */
		var fnTouchToMouseHandler = function(oEvent, oConfig) {
			if (oEvent.isMarked("handledByTouchToMouse")) {
				return;
			}
			oEvent.setMarked("handledByTouchToMouse");

			var oNewStartEvent, oNewEndEvent, bSimulateClick;

			function createNewEvent() {
				return fnCreateNewEvent(oEvent, oConfig, oConfig.eventName === "mouseup" ? oEvent.changedTouches[0] : oEvent.touches[0]);
			}

			if (oEvent.type === "touchstart") {

				var oTouch = oEvent.originalEvent.touches[0];
				bFingerIsMoved = false;
				iLastTouchMoveTime = 0;
				iStartX = oTouch.pageX;
				iStartY = oTouch.pageY;
				iOffsetX = Math.round(oTouch.pageX - jQuery(oEvent.target).offset().left);
				iOffsetY = Math.round(oTouch.pageY - jQuery(oEvent.target).offset().top);

				oNewStartEvent = createNewEvent();
				setTimeout(function() {
					oNewStartEvent.setMark("handledByUIArea", false);
					oConfig.eventHandle.handler.call(oConfig.domRef, oNewStartEvent);
				}, 0);
			} else if (oEvent.type === "touchend") {
				oNewEndEvent = createNewEvent();
				bSimulateClick = !bFingerIsMoved;

				setTimeout(function() {
					oNewEndEvent.setMark("handledByUIArea", false);
					oConfig.eventHandle.handler.call(oConfig.domRef, oNewEndEvent);
					if (bSimulateClick) {
						// also call the onclick event handler when touchend event is received and the movement is within threshold
						oNewEndEvent.type = "click";
						oNewEndEvent.getPseudoTypes = jQuery.Event.prototype.getPseudoTypes; //Reset the pseudo types due to type change
						oNewEndEvent.setMark("handledByUIArea", false);
						oNewEndEvent.offsetX = iOffsetX; // use offset from touchstart
						oNewEndEvent.offsetY = iOffsetY; // use offset from touchstart
						oConfig.eventHandle.handler.call(oConfig.domRef, oNewEndEvent);
					}
				}, 0);
			}
		};
		this._createSimulatedEvent("mousedown", ["touchstart"], fnTouchToMouseHandler);
		this._createSimulatedEvent("mousemove", ["touchmove"], fnTouchMoveToMouseHandler);
		this._createSimulatedEvent("mouseup", ["touchend", "touchcancel"], fnTouchToMouseHandler);
	};

	oEventSimulation._init = function(aEvents) {
		// Define additional jQuery Mobile events to be added to the event list
		// TODO taphold cannot be used (does not bubble / has no target property) -> Maybe provide own solution
		// IMPORTANT: update the public documentation when extending this list
		this.aAdditionalControlEvents.push("swipe", "tap", "swipeleft", "swiperight", "scrollstart", "scrollstop");
		//Define additional pseudo events to be added to the event list
		this.aAdditionalPseudoEvents.push({
			sName: "swipebegin", aTypes: ["swipeleft", "swiperight"], fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				return (bRtl && oEvent.type === "swiperight") || (!bRtl && oEvent.type === "swipeleft");
			}
		});
		this.aAdditionalPseudoEvents.push({
			sName: "swipeend", aTypes: ["swipeleft", "swiperight"], fnCheck: function(oEvent) {
				var bRtl = sap.ui.getCore().getConfiguration().getRTL();
				return (!bRtl && oEvent.type === "swiperight") || (bRtl && oEvent.type === "swipeleft");
			}
		});
		// Add all defined events to the event infrastructure
		//
		// jQuery has inversed the order of event registration when multiple events are passed into jQuery.on method from version 1.9.1.
		//
		// UIArea binds to both touchstart and saptouchstart event and saptouchstart internally also binds to touchstart event. Before
		// jQuery version 1.9.1, the touchstart event handler is called before the saptouchstart event handler and our flags (e.g. _sapui_handledByUIArea)
		// still work. However since the order of event registration is inversed from jQuery version 1.9.1, the saptouchstart event hanlder is called
		// before the touchstart one, our flags don't work anymore.
		//
		// Therefore jQuery version needs to be checked in order to decide the event order in ControlEvents.events.
		if (Version(jQuery.fn.jquery).compareTo("1.9.1") < 0) {
			aEvents = aEvents.concat(this.aAdditionalControlEvents);
		} else {
			aEvents = this.aAdditionalControlEvents.concat(aEvents);
		}

		for (var i = 0; i < this.aAdditionalPseudoEvents.length; i++) {
			PseudoEvents.addEvent(this.aAdditionalPseudoEvents[i]);
		}
		return aEvents;
	};



	if (Device.browser.webkit && /Mobile/.test(navigator.userAgent) && Device.support.touch) {
		TouchToMouseMapping.init(window.document);
		oEventSimulation.disableTouchToMouseHandling = TouchToMouseMapping.disableTouchToMouseHandling;
	}

	if (!oEventSimulation.disableTouchToMouseHandling) {
		oEventSimulation.disableTouchToMouseHandling = jQuery.noop;
	}

	// touch events natively supported
	if (Device.support.touch) {

		// Define additional native events to be added to the event list.
		// TODO: maybe add "gesturestart", "gesturechange", "gestureend" later?
		ControlEvents.events.push("touchstart", "touchend", "touchmove", "touchcancel");
	}

	//Add mobile touch events if touch is supported
	(function initTouchEventSupport() {
		oEventSimulation.touchEventMode = "SIM";

		if (Device.support.touch) { // touch events natively supported
			oEventSimulation.touchEventMode = "ON";

			// ensure that "oEvent.touches", ... works (and not only "oEvent.originalEvent.touches", ...)
			jQuery.event.props.push("touches", "targetTouches", "changedTouches");
		}

		// Windows Phone (<10) doesn't need event emulation because IE supports
		// touch events but fires mouse events based on pointer events without
		// delay.
		// In Edge on Windows Phone 10 the mouse events are delayed like in
		// other browsers

		var bEmulationNeeded = !(Device.os.windows_phone && Device.os.version < 10);

		if (bEmulationNeeded) {
			oEventSimulation._initTouchEventSimulation();
		}

		// polyfill for iOS context menu event (mapped to taphold)
		if (Device.os.ios) {
			oEventSimulation._initContextMenuSimulation();
		}

		if (Device.support.touch && bEmulationNeeded) {
			// Deregister the previous touch to mouse event simulation (see line 25 in this file)
			oEventSimulation.disableTouchToMouseHandling();
			oEventSimulation._initMouseEventSimulation(Device.os.blackberry);
		}
		ControlEvents.events = oEventSimulation._init(ControlEvents.events);
	}());

	return oEventSimulation;

});
