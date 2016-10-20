/*!
 * ${copyright}
 */

/*global FocusEvent, document */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/base/ManagedObject',
	'sap/ui/qunit/QUnitUtils',
	'sap/ui/test/Opa5',
	'sap/ui/Device'
],
function ($, ManagedObject, QUnitUtils, Opa5, Device) {
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
				* @since 1.38
				* Use this only if the target property or the default of the action does not work for your control.
				* The id suffix of the DOM Element the press action will be executed on.
				* For most of the controls you do not have to specify this, since the Control Adapters will find the correct DOM Element.
				* But some controls have multiple DOM elements that could be target of your Action.
				* Then you should set this property.
				* For a detailed documentation of the suffix see {@link sap.ui.core.Element#$}
			*/
				idSuffix: {
					type: "string"
				}
			},
			publicMethods : [ "executeOn" ]
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
		 * Used for retrieving the correct $ to execute your action on.
		 * This will check the following conditions in order:
		 * <ol>
		 *     <li>The user provided a idSuffix - return</li>
		 *     <li>There is a control adapter for the action (most of them are provided out of the box) - use the adapter see {@link sap.ui.test.Press.controlAdapters} for an example</li>
		 *     <li>The focusDomRef of the control is taken as fallback</li>
		 * </ol>
		 * @returns {jQuery} The jQuery object of the domref the Action is going to be executed on.
		 * @protected
		 */
		$: function (oControl) {
			var $FocusDomRef,
				sAdapter = this._getAdapter(oControl.getMetadata()),
				sAdapterDomRefId = this.getIdSuffix() || sAdapter;

			if (sAdapterDomRefId) {
				$FocusDomRef = oControl.$(sAdapterDomRefId);
			} else {
				$FocusDomRef = $(oControl.getFocusDomRef());
			}

			if (!$FocusDomRef.length) {
				$.sap.log.error("Control " + oControl + " has no dom representation idSuffix was " + sAdapterDomRefId, this._sLogPrefix);
			} else {
				$.sap.log.info("Found a domref for the Control " + oControl + " the action is going to be executed on the dom id" + $FocusDomRef[0].id, this._sLogPrefix);
			}

			return $FocusDomRef;
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
		},

		/**
		 * Traverses the metadata chain of ui5 to and looks for adapters
		 * @param oMetadata a controls metadata
		 * @returns {string|null}
		 * @private
		 */
		_getAdapter : function (oMetadata) {
			var sAdapter = this.controlAdapters[oMetadata.getName()];

			if (sAdapter) {
				return sAdapter;
			}
			var oParentMetadata = oMetadata.getParent();
			if (oParentMetadata) {
				return this._getAdapter(oParentMetadata);
			}

			return null;
		},

		_tryOrSimulateFocusin: function ($DomRef, oControl) {
			var oDomRef = $DomRef[0];
			$DomRef.focus();
			var bWasFocused = $DomRef.is(":focus");

			if (!bWasFocused) {
				$.sap.log.debug("Control " + oControl + " could not be focused - maybe you are debugging?", this._sLogPrefix);
			}

			if (!bWasFocused) {
				this._createAndDispatchFocusEvent("focusin", oDomRef);
				this._createAndDispatchFocusEvent("focus", oDomRef);
				this._createAndDispatchFocusEvent("activate", oDomRef);
			}
		},

		_simulateFocusout: function (oDomRef) {
			this._createAndDispatchFocusEvent("focusout", oDomRef);
			this._createAndDispatchFocusEvent("blur", oDomRef);
			this._createAndDispatchFocusEvent("deactivate", oDomRef);
		},

		_createAndDispatchFocusEvent: function (sName, oDomRef) {
			var oFocusEvent;

			// PhantomJS does not have a FocusEvent constructer and no InitFocusEvent function
			if (Device.browser.phantomJS) {
				oFocusEvent = document.createEvent("FocusEvent");
				oFocusEvent.initEvent(sName, true, false);
				// IE 11 and below don't really like the FocusEvent constructor - Fire it the IE way
			} else if (Device.browser.msie && (Device.browser.version < 12)) {
				oFocusEvent = document.createEvent("FocusEvent");
				oFocusEvent.initFocusEvent(sName, true, false, window, 0, oDomRef);
			} else {
				oFocusEvent = new FocusEvent(sName);
			}

			oDomRef.dispatchEvent(oFocusEvent);
			$.sap.log.info("Dispatched focus event: '" + sName + "'", this._sLogPrefix);
		},

		_sLogPrefix : "sap.ui.test.actions"
	});

}, /* bExport= */ true);