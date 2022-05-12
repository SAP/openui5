/*!
 * ${copyright}
 */

// Provides mixin sap.ui.core.EnabledPropagator
sap.ui.define([
	"sap/ui/dom/jquery/Selectors"// jQuery custom selectors ":focusable"
], function() {
	"use strict";

	/**
	 * Mixin for enhancement of a control prototype with propagation of the <code>enabled</code> property.
	 *
	 * Controls that apply this mixin calculate their effective <code>enabled</code> state on read access
	 * as the logical OR of their own <code>enabled</code> property and the <code>enabled</code> state
	 * of the nearest ancestor control which has either an <code>enabled</code> property or a
	 * <code>getEnabled</code> method.
	 *
	 * Applying this mixin adds the <code>enabled</code> property, if it not already exists, to the control
	 * metadata.
	 *
	 * Also adds the <code>useEnabledPropagator(boolean)</code> helper method to the prototype of the given control.
	 * <code>myControlInstance.useEnabledPropagator(false)</code> can be used to prevent a single instance from using
	 * <code>EnabledPropagator</code>. In this case, the effective <code>enabled</code> state does not take any
	 * ancestors <code>enabled</code> state into account, only the control's own <code>enabled</code> property.
	 *
	 * @example <caption>Usage Example:</caption>
	 * sap.ui.define(["sap/ui/core/Control", "sap/ui/core/EnabledPropagator"], function(Control, EnabledPropagator) {
	 *    "use strict";
	 *    var MyControl = Control.extend("my.MyControl", {
	 *       metadata : {
	 *          //...
	 *       }
	 *       //...
	 *    });
	 *
	 *    EnabledPropagator.apply(MyControl.prototype);
	 *
	 *    return MyControl;
	 * });
	 *
	 * @param {boolean} [bDefault=true] Value that should be used as default value for the enhancement of the control.
	 * @param {boolean} [bLegacy=false] Whether the introduced property should use the old name <code>Enabled</code>.
	 * @version ${version}
	 * @public
	 * @class
	 * @alias sap.ui.core.EnabledPropagator
	 */
	var EnabledPropagator = function(bDefault, bLegacy) {
		// Ensure only Controls are enhanced
		if (!this.isA || !this.isA("sap.ui.core.Control")) {
			throw new Error("EnabledPropagator only supports subclasses of Control");
		}

		// Marker for the EnabledPropagator
		this._bUseEnabledPropagator = true;

		// Ensure not to overwrite existing implementations.
		var fnOrigGet = this.getEnabled;
		if (fnOrigGet === undefined) {
			// set some default
			this.getEnabled = function() {
				return (this._bUseEnabledPropagator && hasDisabledAncestor(this)) ? false : this.getProperty("enabled");
			};

			// Default for the bDefault
			bDefault = (bDefault === undefined) ? true : Boolean(bDefault);

			if ( bLegacy ) {
				// add Enabled with old spelling for compatibility reasons. Shares the getter and setter with new spelling.
				this.getMetadata().addProperty("Enabled", {type : "boolean", group : "Behavior", defaultValue : bDefault});
			}
			this.getMetadata().addProperty("enabled", {type : "boolean", group : "Behavior", defaultValue : bDefault});
			this.getMetadata().addPublicMethods("getEnabled");

		} else {
			this.getEnabled = function() {
				return (this._bUseEnabledPropagator && hasDisabledAncestor(this)) ? false : fnOrigGet.apply(this, arguments);
			};
		}

		if (this.setEnabled === undefined) {
			this.setEnabled = function(bEnabled) {
				checkAndMoveFocus(this, bEnabled);
				return this.setProperty("enabled", bEnabled);
			};

			this.getMetadata().addPublicMethods("setEnabled");
		} else {
			var fnOrigSet = this.setEnabled;

			this.setEnabled = function(bEnabled) {
				checkAndMoveFocus(this, bEnabled);
				return fnOrigSet.apply(this, arguments);
			};
		}

		// enhance with the helper method to exclude a single instance from being use of EnabledPropagator
		this.useEnabledPropagator = function(bUseEnabledPropagator) {
			this._bUseEnabledPropagator = bUseEnabledPropagator;
		};

		this.getMetadata().addPublicMethods("useEnabledPropagator");
	};

	/**
	 * Determines whether an ancestor of the provided control implements getEnabled method and that returns false
	 *
	 * @param {sap.ui.core.Control} oControl A control instance
	 * @returns {boolean} Whether any control implements getEnabled method and that returns false
	 * @private
	 */
	function hasDisabledAncestor(oControl) {
		for (var oParent = oControl.getParent(); oParent && !oParent.getEnabled && oParent.getParent; oParent = oParent.getParent()) {/* empty */}
		return oParent && oParent.getEnabled && !oParent.getEnabled();
	}

	/**
	 * Moves the focus to the nearest ancestor that is focusable when the control that is going to be disabled
	 * (bEnabled === false) currently has the focus. This is done to prevent the focus from being set to the body
	 * tag
	 *
	 * @param {sap.ui.core.Control} oControl the control that is going to be enabled/disalbed
	 * @param {boolean} bEnabled whether the control is going to be enabled
	 * @private
	 */
	function checkAndMoveFocus(oControl, bEnabled) {
		var oDomRef = oControl.getDomRef();

		if (!bEnabled && oDomRef && oDomRef.contains(document.activeElement)) {
			var oFocusableAncestor = oControl.$().parent().closest(":focusable")[0];

			if (oFocusableAncestor) {
				oFocusableAncestor.focus({
					preventScroll: true
				});
			}
		}
	}

	return EnabledPropagator;

}, /* bExport= */ true);
