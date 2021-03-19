/*!
 * ${copyright}
 */

// Provides helper sap.ui.core.EnabledPropagator
sap.ui.define(['./Control'],
	function(Control) {
	"use strict";


	/**
	 * <b>This constructor should be applied to the prototype of a control.</b>
	 *
	 * Example:
	 * <code>
	 * sap.ui.core.EnabledPropagator.call(<i>Some-Control</i>.prototype, <i>Default-value, ...</i>);
	 * </code>
	 * e.g.
	 * <code>
	 * sap.ui.core.EnabledPropagator.call(sap.ui.commons.Button.prototype);
	 * </code>
	 *
	 * @author Daniel Brinkmann
	 * @version ${version}
	 * @class Helper Class for enhancement of a Control with propagation of enabled property.
	 * @param {boolean} [bDefault=true] the value that should be used as default value for the enhancement of the control.
	 * @param {boolean} [bLegacy=false] whether the introduced property should use the old name 'Enabled'
	 * @public
	 * @alias sap.ui.core.EnabledPropagator
	 */
	var EnabledPropagator = function(bDefault, bLegacy) {
		// Ensure only Controls are enhanced
		if (!(this instanceof Control)) {
			throw new Error("EnabledPropagator only supports subclasses of Control"); // TODO clarify why. Daniel has added this check, but it is not obvious why?
		}

		// default for the default
		if ( bDefault === undefined ) {
			bDefault = true;
		}

		/**
		 * Finds the nearest parent that has the getEnabled() method implemented
		 *
		 * @param {sap.ui.core.Control} oControl the control itself
		 * @return {sap.ui.core.Control} The nearest parent control that has getEnabled() method implemented
		 * @private
		 */
		function findParentWithEnabled(oControl) {
			var oParent = oControl.getParent();
			while (oParent && !oParent.getEnabled && oParent.getParent) {
				oParent = oParent.getParent();
			}
			return oParent;
		}

		/**
		 * Moves the focus to the nearest parent that is focusable when the control that is going to be disabled
		 * (bEnabled === false) currently has the focus. This is done to prevent the focus from being set to the body
		 * tag
		 *
		 * @param {sap.ui.core.Control} oControl the control that is going to be enabled/disalbed
		 * @param {boolean} bEnabled whether the control is going to be enabled
		 * @private
		 */
		function checkAndMoveFocus(oControl, bEnabled) {
			var oDomRef = oControl.getDomRef(),
				oFocusableParent;

			if (!bEnabled && oDomRef && oDomRef.contains(document.activeElement)) {
				oFocusableParent = oControl.$().parent().closest(":focusable")[0];

				if (oFocusableParent) {
					oFocusableParent.focus({
						preventScroll: true
					});
				}
			}
		}

		// Ensure not to overwrite existing implementations.
		if (this.getEnabled === undefined) {
			// set some default
			this.getEnabled = function() {
				var oParent = findParentWithEnabled(this);
				return (oParent && oParent.getEnabled && !oParent.getEnabled()) ? false : this.getProperty("enabled");
			};

			if ( bLegacy ) {
				// add Enabled with old spelling for compatibility reasons. Shares the getter and setter with new spelling.
				this.getMetadata().addProperty("Enabled", {type : "boolean", group : "Behavior", defaultValue :  !!bDefault});
			}
			this.getMetadata().addProperty("enabled", {type : "boolean", group : "Behavior", defaultValue :  !!bDefault});
			this.getMetadata().addPublicMethods('getEnabled');

		} else {
			var fnOrigGet = this.getEnabled;
			this.getEnabled = function() {
				var oParent = findParentWithEnabled(this);
				return (oParent && oParent.getEnabled && !oParent.getEnabled()) ? false : fnOrigGet.apply(this);
			};
		}

		if (this.setEnabled === undefined) {
			this.setEnabled = function(bEnabled) {
				checkAndMoveFocus(this, bEnabled);
				return this.setProperty("enabled", bEnabled);
			};

			this.getMetadata().addPublicMethods('setEnabled');
		} else {
			var fnOrigSet = this.setEnabled;

			this.setEnabled = function(bEnabled) {
				checkAndMoveFocus(this, bEnabled);
				return fnOrigSet.apply(this, arguments);
			};
		}
	};

	return EnabledPropagator;

}, /* bExport= */ true);
