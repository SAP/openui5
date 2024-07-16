/*!
 * ${copyright}
 */

/*global FocusEvent, DragEvent, DataTransfer, MouseEvent, document */
sap.ui.define([
	'sap/ui/base/ManagedObject',
	'sap/ui/qunit/QUnitUtils',
	'sap/ui/test/Opa5',
	'sap/ui/Device',
	"sap/ui/thirdparty/jquery",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/_FocusListener"
],
function (ManagedObject, QUnitUtils, Opa5, Device, jQuery, _OpaLogger, _FocusListener) {
	"use strict";

	/**
	 * @class Actions for Opa5 - needs to implement an executeOn function that should simulate a user interaction on a control
	 * @abstract
	 * @extends sap.ui.base.ManagedObject
	 * @public
	 * @name sap.ui.test.actions.Action
	 * @author SAP SE
	 * @since 1.34
	 */
	return ManagedObject.extend("sap.ui.test.actions.Action", {

		metadata : {
			properties: {
				/**
				 * Use this only if the target property or the default of the action does not work for your control.
				 * The id suffix of the DOM Element the press action will be executed on.
				 * For most of the controls you do not have to specify this, since the Control Adapters will find the correct DOM Element.
				 * But some controls have multiple DOM elements that could be target of your Action.
				 * Then you should set this property.
				 * For a detailed documentation of the suffix see {@link sap.ui.core.Element#$}
				 *
				 * @since 1.38
				 */
				idSuffix: {
					type: "string"
				}
			}
		},

		/**
		 * Checks if the matcher is matching - will get an instance of sap.ui.core.Control as parameter
		 * Should be overwritten by subclasses
		 *
		 * @param {sap.ui.core.Control} element the {@link sap.ui.core.Element} or a control (extends element) the action will be executed on
		 * @protected
		 * @name sap.ui.test.actions.Action#executeOn
		 * @function
		 */
		executeOn : function () {
			return true;
		},

		/**
		 * Finds the most suitable jQuery element to execute an action on.
		 * A control may have many elements in its DOM representation. The most suitable one is chosen by priority:
		 * <ol>
		 *     <li>If the user provided an idSuffix, return the element that matches it, or null</li>
		 *     <li>If there is a control adapter for the action - return the element that matches it. See <code>controlAdapters</code> at {@link sap.ui.test.Press} for an example</li>
		 *     <li>If there is no control adapter, or it matches no elements, return the focusDomRef of the control. Note that some controls may not have a focusDomRef.</li>
		 * </ol>
		 * @param {object} oControl the control to execute an action on
		 * @returns {jQuery} the jQuery element which is most suitable for the action
		 * @protected
		 */
		$: function (oControl) {
			var $ActionDomRef;
			var sErrorMessage = "";

			if (this.getIdSuffix()) {
				// if user requested an ID suffix, it should be used -- no fallback
				$ActionDomRef = oControl.$(this.getIdSuffix());
				sErrorMessage = $ActionDomRef.length ? "" : "DOM representation of control '" + oControl +
					"' has no element with user-provided ID suffix '" + this.getIdSuffix() + "'";
			} else {
				var sAdapter = this._getAdapter(oControl);
				if (sAdapter) {
					$ActionDomRef = oControl.$(sAdapter);
					sErrorMessage = $ActionDomRef.length ? "" : "DOM representation of control '" + oControl +
						"' has no element with ID suffix '" + sAdapter + "' which is the default adapter for '" + this.getMetadata().getName() + "'";
				}

				if (!$ActionDomRef || !$ActionDomRef.length) {
					// if no adapter is set or no element is found for it -- fallback to control focus dom ref
					$ActionDomRef = jQuery(oControl.getFocusDomRef());
					if (!$ActionDomRef.length) {
						$ActionDomRef = oControl.$();
						if (!$ActionDomRef.length) {
							sErrorMessage += "DOM representation of control '" + oControl + "' has no focus DOM reference";
						}
					}
				}
			}

			if ($ActionDomRef.length) {
				this.oLogger.info("Found a DOM reference for the control '" + oControl + "'. Executing '" + this.getMetadata().getName() +
				"' on the DOM element with ID '" + $ActionDomRef[0].id + "'");
				return $ActionDomRef;
			} else {
				// the control has no dom ref of any kind - action has no target
				this.oLogger.error(sErrorMessage);
				throw new Error(sErrorMessage);
			}
		},

		/**
		 * Returns the QUnitUtils
		 * @returns {sap.ui.test.qunit.QUnitUtils} QUnit utils of the current window or the OPA frame
		 * @protected
		 */
		getUtils : function () {
			return Opa5.getUtils() || QUnitUtils;
		},

		init: function () {
			this.controlAdapters = {};
			this.oLogger = _OpaLogger.getLogger(this.getMetadata().getName());
		},

		dropPosition: {
			BEFORE: "BEFORE",
			AFTER: "AFTER",
			CENTER: "CENTER"
		},

		/**
		 * Traverses the metadata chain of a control and looks for action adapters.
		 * An action adapter is a suffix part of the ID of a DOM element, where
		 * the DOM element is part of a control DOM representation and should be used as a target for events
		 * @param {object} oControl the control for which to find an action adapter
		 * @returns {string|null} the ID suffix of the DOM element to use as event target
		 * @private
		 */
		_getAdapter : function (oControl) {
			var fnGetAdapterByMeta = function (oMetadata) {
				var vAdapter = this.controlAdapters[oMetadata.getName()];

				if (vAdapter) {
					if (typeof vAdapter === "function") {
						return vAdapter(oControl);
					}
					if (typeof vAdapter === "string") {
						return vAdapter;
					}
				}

				var oParentMetadata = oMetadata.getParent();
				if (oParentMetadata) {
					return fnGetAdapterByMeta(oParentMetadata);
				}

				return null;
			}.bind(this);

			return fnGetAdapterByMeta(oControl.getMetadata());
		},

		_tryOrSimulateFocusin: function ($DomRef, oControl) {
			var oDomRef = $DomRef[0];
			var bFireArtificialEvents = false;
			var bSimulateFocusout = false;
			var isAlreadyFocused = this._isFocused(oDomRef);
			var bIsNewFF = Device.browser.firefox && Device.browser.version >= 60;
			var oLastFocusedElement;

			if (isAlreadyFocused || bIsNewFF) {
				// 1. If the event is already focused, make sure onfocusin event of the control will be properly fired when executing this action,
				// otherwise the next blur will not be able to safely remove the focus.
				// 2. In IE11 (and often in Firefox v61.0/v60.0 ESR), if the focus action fails and focusin is dispatched, onfocusin will be called twice.
				// To avoid this, directly dispatch the artificial events
				bFireArtificialEvents = true;
			} else {
				$DomRef.trigger("focus");
				var bWasFocused = this._isFocused(oDomRef);
				// if focus was successful, skip the artificial events and thus avoid recieving onfocusin twice.
				// else, fire the artificial events because we still want onfocusin to work.
				bFireArtificialEvents = !bWasFocused;
			}

			if (bFireArtificialEvents) {
				this.oLogger.debug("Control " + oControl + " could not be focused - maybe you are debugging?");

				// since we are simulating a focus shift a *new* element
				// ensure we need to simulate the focusout/blur of the *old* focused as well
				// unless the *old* was already blurred in a previous step, so we check that as well:
				oLastFocusedElement = _FocusListener.getLastFocusedElement();
				bSimulateFocusout = oLastFocusedElement
					&& oLastFocusedElement !== oDomRef
					&& oLastFocusedElement !== _FocusListener.getLastBlurredElement();

				if (bSimulateFocusout) {
					this._simulateFocusout(oLastFocusedElement);
				}
				this._createAndDispatchFocusEvent("focusin", oDomRef);
				this._createAndDispatchFocusEvent("focus", oDomRef);
				this._createAndDispatchFocusEvent("activate", oDomRef);
			}

			if (!this._isFocused(oDomRef)) {
				this.oLogger.trace("Control " + oControl + " could not be focused-in correctly. This may lead to lost interactions with the control");
			}
		},

		_simulateFocusout: function (oDomRef) {
			this._createAndDispatchFocusEvent("focusout", oDomRef);
			this._createAndDispatchFocusEvent("blur", oDomRef);
			this._createAndDispatchFocusEvent("deactivate", oDomRef);
		},

		/**
		 * Create the correct event object for a mouse event.
		 *
		 * @param {string} sName Name of the mouse event
		 * @param {Element} oDomRef DOM element on which the event is going to be triggered
		 * @param {boolean} bShiftKey Indicates whether the shift key is down in addition
	 	 * @param {boolean} bAltKey Indicates whether the alt key is down in addition
	 	 * @param {boolean} bCtrlKey Indicates whether the ctrl key is down in addition
		 * @private
		 */
		_createAndDispatchMouseEvent: function (sName, oDomRef, bShiftKey, bAltKey, bCtrlKey, iClientX, iClientY) {
			// ignore scrolled down stuff (client X, Y not set)
			// and assume stuff is over the whole screen (screen X, Y not set)
			// See file jquery.sap.events.js for some insights to the magic
			var iLeftMouseButtonIndex = 0;
			var oMouseEvent;
			oMouseEvent = new MouseEvent(sName, {
				bubbles: true,
				cancelable: true,
				identifier: 1,
				target: oDomRef,
				radiusX: 1,
				radiusY: 1,
				rotationAngle: 0,
				button: iLeftMouseButtonIndex,
				type: sName, // include the type so jQuery.event.fixHooks can copy properties properly
				shiftKey: bShiftKey,
				altKey: bAltKey,
				ctrlKey: bCtrlKey,
				clientX: iClientX,
				clientY: iClientY
			});

			oDomRef.dispatchEvent(oMouseEvent);
		},

		_createAndDispatchFocusEvent: function (sName, oDomRef) {
			var oFocusEvent,
				bBubbles = ["focusin", "focusout", "activate", "deactivate"].indexOf(sName) !== -1;

			oFocusEvent = new FocusEvent(sName, {
				type: sName,
				target: oDomRef,
				curentTarget: oDomRef,
				bubbles: bBubbles
			});

			oDomRef.dispatchEvent(oFocusEvent);
			this.oLogger.info("Dispatched focus event: '" + sName + "'");
		},

		_createAndDispatchDragEvent: function (sName, oDomRef, oOptions) {
			var mCoordinates = this._getEventCoordinates(oDomRef, oOptions);
			var oDataTransfer = new DataTransfer();
			var oDragEvent;

			oDragEvent = new DragEvent(sName, {
				type: sName, // include the type so jQuery.event.fixHooks can copy properties properly
				eventPhase: 3,
				bubbles: true,
				cancelable: true,
				defaultPrevented: false,
				composed: true,
				returnValue: true,
				cancelBubble: false,
				target: oDomRef,
				toElement: oDomRef,
				srcElement: oDomRef,
				radiusX: 1,
				radiusY: 1,
				rotationAngle: 0,
				// coordinates are needed to infer drop elem. e.g. in the control handlers, the drop target can be recalculated using document.elementfromPoint.
				// even if set, pageXY and screenXY are zeroed. if clientXY is set, then xy and pageXY will be = clientXY, and offsetXY will be calculated correctly.
				// this may cause problems for controls outside the client area
				// in this case, users should scroll before the drag event
				clientX: mCoordinates.x,
				clientY: mCoordinates.y,
				// dataTransfer should be at least an empty object, to avoid undefined error
				dataTransfer: oDataTransfer
			});

			oDomRef.dispatchEvent(oDragEvent);
		},

		_createAndDispatchScrollEvent: function (oDomRef, oOptions) {
			if (oOptions.x != null) {
				oDomRef.scrollLeft = oOptions.x;
			}
			if (oOptions.y != null) {
				oDomRef.scrollTop = oOptions.y;
			}
			var oScrollEvent = new Event("scroll", {
				bubbles: false,
				cancelBubble: false,
				cancelable: false,
				composed: false,
				currentTarget: null,
				defaultPrevented: false,
				eventPhase: 0,
				isTrusted: true,
				returnValue: true,
				target: oDomRef,
				srcElement: oDomRef,
				type: "scroll"
			});
			oDomRef.dispatchEvent(oScrollEvent);
		},

		_getEventCoordinates: function (oDomRef, oOptions) {
			var $domRef = jQuery(oDomRef);
			var offset = $domRef.offset();
			var mCenterCoordinates = {
				x: offset.left + $domRef.outerWidth() / 2,
				y: offset.top + $domRef.outerHeight() / 2
			};
			if (!oOptions) {
				return mCenterCoordinates;
			}

			switch (oOptions.position) {
				case this.dropPosition.BEFORE:
					// coords of upper left corner
					return {
						x: offset.left,
						y: offset.top
					};
				case this.dropPosition.AFTER:
					// coords of bottom right corner
					return {
						x: offset.left + $domRef.outerWidth(),
						y: offset.top + $domRef.outerHeight()
					};
				case this.dropPosition.CENTER:
				default:
					return mCenterCoordinates;
			}
		},

		_isFocused: function (oDomRef) {
			// This check returns false if:
			// 1. you have the focus in the dev tools console, or a background tab, or the browser is not focused at all. (bDocumentHasFocus will be false)
			// 2. in IE11 and Firefox, because the document.activeElement wasn't updated. (bIsActiveElement will be false)
			var bIsActiveElement = oDomRef === document.activeElement;
			var bDocumentHasFocus = !document.hasFocus || document.hasFocus();
			var bIsElemInBody = !!(oDomRef.type || oDomRef.href || ~oDomRef.tabIndex);
			return bIsActiveElement && bDocumentHasFocus && bIsElemInBody;
		}
	});

});
