/*!
 * ${copyright}
 */

// Provides class sap.ui.core.FocusHandler
sap.ui.define([
	"../base/EventProvider",
	"../base/Object",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/_ready"
],
	function(EventProvider, BaseObject, Log, jQuery, _ready) {
	"use strict";

		// Element, Core module references, lazily probed when needed
		var Element;
		var Core;

		var oFocusInfoEventProvider = new EventProvider();
		var FOCUS_INFO_EVENT = "focusInfo";
		var oEventData = {};

		/**
		 * Constructs an instance of an sap.ui.core.FocusHandler.
		 * Keeps track of the focused element.
		 *
		 * @class Keeps track of the focused element.
		 * @param {Element} oRootRef e.g. document.body
		 * @alias sap.ui.core.FocusHandler
		 * @extends sap.ui.base.Object
		 * @private
		 */
		var FocusHandler = BaseObject.extend("sap.ui.core.FocusHandler", /** @lends sap.ui.core.FocusHandler.prototype */ {
			constructor : function() {
				BaseObject.apply(this);

				// keep track of element currently in focus
				this.oCurrent = null;
				// keep track of the element previously had the focus
				this.oLast = null;
				// buffer the focus/blur events for correct order
				this.aEventQueue = [];
				// keep track of last focused element
				this.oLastFocusedControlInfo = null;
				// keep track of focused element which is using Renderer.apiVersion=2
				this.oPatchingControlFocusInfo = null;

				this.fnEventHandler = this.onEvent.bind(this);

				// initialize event handling
				_ready().then(function() {
					var oRootRef = document.body;
					oRootRef.addEventListener("focus", this.fnEventHandler, true);
					oRootRef.addEventListener("blur", this.fnEventHandler, true);
					Log.debug("FocusHandler setup on Root " + oRootRef.type + (oRootRef.id ? ": " + oRootRef.id : ""), null, "sap.ui.core.FocusHandler");
				}.bind(this));
			}
		});

		/**
		 * Returns the Id of the control/element currently in focus.
		 * @return {string} the Id of the control/element currently in focus.
		 * @public
		 */
		FocusHandler.prototype.getCurrentFocusedControlId = function(){
			var oControl;
			try {
				var $Act = jQuery(document.activeElement);
				if ($Act.is(":focus")) {
					if (!Element) {
						Element = sap.ui.require("sap/ui/core/Element");
					}
					oControl = Element && Element.closestTo($Act[0]);
				}
			} catch (err) {
				//escape eslint check for empty block
			}
			return oControl ? oControl.getId() : null;
		};

		/**
		 * Returns the focus info of the current focused control or the control with the given id, if exists.
		 *
		 * @see sap.ui.core.FocusHandler#restoreFocus
		 * @see sap.ui.core.FocusHandler#getCurrentFocusedControlId
		 * @param {string} [sControlId] the id of the control. If not given the id of the current focused control (if exists) is used
		 * @return {object} the focus info of the current focused control or the control with the given id, if exists.
		 * @private
		 */
		FocusHandler.prototype.getControlFocusInfo = function(sControlId){
			var oControl;

			sControlId = sControlId || this.getCurrentFocusedControlId();

			if (!sControlId) {
				return null;
			}

			oControl = getControlById(sControlId);

			if (oControl) {
				return {
					id : sControlId,
					control : oControl,
					info : oControl.getFocusInfo(),
					type : oControl.getMetadata().getName(),
					focusref : oControl.getFocusDomRef()
				};
			}
			return null;
		};

		/**
		 * Stores the focus info of the current focused control which is using Renderer.apiVersion=2
		 *
		 * @see sap.ui.core.FocusHandler#restoreFocus
		 * @see sap.ui.core.FocusHandler#getControlFocusInfo
		 * @param {HTMLElement} oDomRef The DOM reference of the control where the rendering is happening
		 * @private
		 */
		FocusHandler.prototype.storePatchingControlFocusInfo = function(oDomRef) {
			var oActiveElement = document.activeElement;
			if (!oActiveElement || !oDomRef.contains(oActiveElement)) {
				this.oPatchingControlFocusInfo = null;
			} else {
				this.oPatchingControlFocusInfo = this.getControlFocusInfo();
				if (this.oPatchingControlFocusInfo) {
					this.oPatchingControlFocusInfo.patching = true;
				}
			}
		};

		/**
		 * Returns the focus info of the last focused control which is using Renderer.apiVersion=2
		 *
		 * @see sap.ui.core.FocusHandler#storePatchingControlFocusInfo
		 * @private
		 */
		FocusHandler.prototype.getPatchingControlFocusInfo = function() {
			return this.oPatchingControlFocusInfo;
		};

		/**
		 * If the given control is the last known focused control, the stored focusInfo is updated.
		 *
		 * @see sap.ui.core.FocusHandler#restoreFocus
		 * @see sap.ui.core.FocusHandler#getControlFocusInfo
		 * @param {string} oControl the control
		 * @private
		 */
		FocusHandler.prototype.updateControlFocusInfo = function(oControl){
			if (oControl && this.oLastFocusedControlInfo && this.oLastFocusedControlInfo.control === oControl) {
				var sControlId = oControl.getId();
				this.oLastFocusedControlInfo = this.getControlFocusInfo(sControlId);
				Log.debug("Update focus info of control " + sControlId, null, "sap.ui.core.FocusHandler");
			}
		};

		/**
		 * Adds the given function as an extender of the focus info. The given function will be called within the
		 * <code>restoreFocus</code> function before the focus info is forwarded to the corresponding control.
		 *
		 * @see sap.ui.core.FocusHandler#restoreFocus
		 * @param {function} fnFunction The function that will be called to extend the focus info
		 * @param {object} oListener An object which is set as "this" context when callin the "fnFunction"
		 * @return {sap.ui.core.FocusHandler} The object itself to allow function chaining
		 * @private
		 */
		FocusHandler.prototype.addFocusInfoExtender = function(fnFunction, oListener) {
			oFocusInfoEventProvider.attachEvent(FOCUS_INFO_EVENT, oEventData, fnFunction, oListener);
			return this;
		};

		/**
		 * Removes the given function from being an extender of the focus info.
		 *
		 * @param {function} fnFunction The function that will be removed
		 * @param {object} oListener An object which is set as "this" context when callin the "fnFunction". Only when
		 *  the same "oListener" is given as the one that is used to call <code>addFocusInfoExtender</code>, the function
		 *  can be removed correctly.
		 * @return {sap.ui.core.FocusHandler} The object itself to allow function chaining
		 * @private
		 */
		FocusHandler.prototype.removeFocusInfoExtender = function(fnFunction, oListener) {
			oFocusInfoEventProvider.detachEvent(FOCUS_INFO_EVENT, fnFunction, oListener);
			return this;
		};

		/**
		 * Restores the focus to the last known focused control or to the given focusInfo, if possible.
		 *
		 * @see sap.ui.core.FocusHandler#getControlFocusInfo
		 * @param {object} [oControlFocusInfo] the focus info previously received from getControlFocusInfo
		 * @private
		 */
		FocusHandler.prototype.restoreFocus = function(oControlFocusInfo){
			var oInfo = oControlFocusInfo || this.oLastFocusedControlInfo;

			if (!oInfo) {
				return;
			}

			var oControl = getControlById(oInfo.id);

			var oFocusRef = oInfo.focusref;
			if (oControl
				&& oInfo.info
				&& oControl.getMetadata().getName() == oInfo.type
				&& (oInfo.patching
					|| (oControl.getFocusDomRef() != oFocusRef
						&& (oControlFocusInfo || /*!oControlFocusInfo &&*/ oControl !== oInfo.control || oInfo.preserved)))) {
				Log.debug("Apply focus info of control " + oInfo.id, null, "sap.ui.core.FocusHandler");
				oInfo.control = oControl;
				this.oLastFocusedControlInfo = oInfo;
				// Do not store dom patch info in the last focused control info
				delete this.oLastFocusedControlInfo.patching;

				// expose focus info into the oEventData which is forwarded to the focus info extender
				oEventData.info = oInfo.info;
				oFocusInfoEventProvider.fireEvent(FOCUS_INFO_EVENT, {
					domRef: oControl.getDomRef()
				});

				oControl.applyFocusInfo(oEventData.info);
				oEventData = {};
			} else {
				Log.debug("Apply focus info of control " + oInfo.id + " not possible", null, "sap.ui.core.FocusHandler");
			}
		};

		/**
		 * Destroy method of the Focus Handler.
		 * It unregisters the event handlers.
		 *
		 * @param {jQuery.Event} event the event that initiated the destruction of the FocusHandler
		 * @private
		 */
		FocusHandler.prototype.destroy = function(event) {
			var oRootRef = event.data.oRootRef;
			if (oRootRef) {
				oRootRef.removeEventListener("focus", this.fnEventHandler, true);
				oRootRef.removeEventListener("blur", this.fnEventHandler, true);
			}
		};

		/**
		 * Handles the focus/blur events.
		 *
		 * @param {FocusEvent} oBrowserEvent Native browser focus/blur event object
		 * @private
		 */
		FocusHandler.prototype.onEvent = function(oBrowserEvent){
			var oEvent = jQuery.event.fix(oBrowserEvent);

			Log.debug("Event " + oEvent.type + " reached Focus Handler (target: " + oEvent.target + (oEvent.target ? oEvent.target.id : "") + ")", null, "sap.ui.core.FocusHandler");

			var type = (oEvent.type == "focus" || oEvent.type == "focusin") ? "focus" : "blur";
			this.aEventQueue.push({type:type, controlId: getControlIdForDOM(oEvent.target)});
			if (this.aEventQueue.length == 1) {
				this.processEvent();
			}
		};

		/**
		 * Processes the focus/blur events in the event queue.
		 *
		 * @private
		 */
		FocusHandler.prototype.processEvent = function(){
			var oEvent = this.aEventQueue[0];
			if (!oEvent) {
				return;
			}
			try {
				if (oEvent.type == "focus") {
					this.onfocusEvent(oEvent.controlId);
				} else if (oEvent.type == "blur") {
					this.onblurEvent(oEvent.controlId);
				}
			} finally { //Ensure that queue is processed until it is empty!
				this.aEventQueue.shift();
				if (this.aEventQueue.length > 0) {
					this.processEvent();
				}
			}
		};

		/**
		 * Processes the focus event taken from the event queue.
		 *
		 * @param {string} sControlId Id of the event related control
		 * @private
		 */
		FocusHandler.prototype.onfocusEvent = function(sControlId){
			var oControl = getControlById(sControlId);

			if (oControl) {
				this.oLastFocusedControlInfo = this.getControlFocusInfo(sControlId);
				Log.debug("Store focus info of control " + sControlId, null, "sap.ui.core.FocusHandler");
			}

			this.oCurrent = sControlId;
			if (!this.oLast) {
				// No last active element to be left...
				return;
			}

			if (this.oLast != this.oCurrent) {
				// if same control is focused again (e.g. while re-rendering) no focusleave is needed
				triggerFocusleave(this.oLast, sControlId);
			}

			this.oLast = null;
		};

		/**
		 * Processes the blur event taken from the event queue.
		 *
		 * @param {string} sControlId Id of the event related control
		 * @private
		 */
		FocusHandler.prototype.onblurEvent = function(sControlId){
			if (!this.oCurrent) {
				// No current Item, so nothing to lose focus...
				return;
			}
			this.oLast = sControlId;

			this.oCurrent = null;
			setTimeout(this["checkForLostFocus"].bind(this), 0);
		};

		/**
		 * Checks for lost focus and provides events in case of losing the focus.
		 * Called in delayed manner from {@link sap.ui.core.FocusHandler#onblurEvent}.
		 *
		 * @private
		 */
		FocusHandler.prototype.checkForLostFocus = function(){
			if (this.oCurrent == null && this.oLast != null) {
				triggerFocusleave(this.oLast, null);
			}
			this.oLast = null;
		};

		/**
		 * Tracks the focus before it is lost during DOM preserving.
		 * Called by the RenderManager when a DOM element is moved to the preserved area.
		 *
		 * If the preserved Element contains the activeElement, the focus is set to the body.
		 *
		 * In case the currently activeElement is also the last known focus-ref, we need to track
		 * this information, so the Focus can correctly restored later on.
		 *
		 * @param {Element} oCandidate the DOM element that will be preserved
		 * @private
		 * @ui5-restricted sap.ui.core.RenderManager
		 */
		FocusHandler.prototype.trackFocusForPreservedElement = function(oCandidate) {
			if (oCandidate.contains(document.activeElement) &&
				this.oLastFocusedControlInfo && document.activeElement === this.oLastFocusedControlInfo.focusref) {
				// the 'preserved' flag will be read during restoreFocus
				this.oLastFocusedControlInfo.preserved = true;
			}
		};


		//***********************************************************
		// Utility / convenience
		//***********************************************************

		/**
		 * Returns the ID of the control/element to which the given DOM
		 * reference belongs to or <code>null</code> if no such
		 * control/element exists.
		 *
		 * @param {Element} oDOM the DOM reference
		 * @returns {string|null} ID of the control or <code>null</code>
		 * @private
		 */
		var getControlIdForDOM = function(oDOM){
			var sId = jQuery(oDOM).closest("[data-sap-ui]").attr("id");
			if (sId) {
				return sId;
			}
			return null;
		};

		/**
		 * Calls the onsapfocusleave function on the control with id sControlId
		 * with the information about the given related control.
		 *
		 * @param {string} sControlId
		 * @param {string} sRelatedControlId
		 * @private
		 */
		var triggerFocusleave = function(sControlId, sRelatedControlId){
			var oControl = getControlById(sControlId);
			if (oControl) {
				var oEvent = jQuery.Event("sapfocusleave");
				oEvent.target = oControl.getDomRef();
				var oRelatedControl = getControlById(sRelatedControlId);
				oEvent.relatedControlId = oRelatedControl ? oRelatedControl.getId() : null;
				oEvent.relatedControlFocusInfo = oRelatedControl ? oRelatedControl.getFocusInfo() : null;
				// TODO: Recheck how focus handling works together with the Popup and different UIAreas
				// soft dependency to Core to prevent cyclic dependencies
				Core = Core || sap.ui.require("sap/ui/core/Core");
				if (Core) {
					var oControlUIArea = oControl.getUIArea();
					var oUiArea = null;
					if (oControlUIArea) {
						oUiArea = Core.getUIArea(oControlUIArea.getId());
					} else {
						var oPopupUIAreaDomRef = Core.getStaticAreaRef();
						if (oPopupUIAreaDomRef.contains(oEvent.target)) {
							oUiArea = Core.getUIArea(oPopupUIAreaDomRef.id);
						}
					}
					if (oUiArea) {
						// if rendering moves to the UIArea and the UIArea will have a ManagedObjectRegistry
						// the _handleElement does not need to be "public" on the UIArea's interface
						oUiArea._handleEvent(oEvent);
					}
				}
			}
		};

		function getControlById(sControlId) {
			var oControl;
			if (!Element) {
				Element = sap.ui.require("sap/ui/core/Element");
			}
			if (Element) {
				oControl = Element.registry.get(sControlId);
			}
			return oControl || null;
		}

	return new FocusHandler();

});