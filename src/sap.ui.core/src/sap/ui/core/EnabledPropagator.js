/*!
 * ${copyright}
 */

// Provides mixin sap.ui.core.EnabledPropagator
sap.ui.define([], function() {
	"use strict";

	let Element;

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
				this.setProperty("enabled", bEnabled);
				if (!bEnabled && this.getDomRef()?.contains(document.activeElement)) {
					Element ??= sap.ui.require("sap/ui/core/Element");
					Element?.fireFocusFail.call(this, /*bRenderingPending=*/true);
				}
				return this;
			};

			this.getMetadata().addPublicMethods("setEnabled");
		} else {
			var fnOrigSet = this.setEnabled;

			this.setEnabled = function(bEnabled) {
				fnOrigSet.apply(this, arguments);
				if (!bEnabled && this.getDomRef()?.contains(document.activeElement)) {
					Element ??= sap.ui.require("sap/ui/core/Element");
					Element?.fireFocusFail.call(this, /*bRenderingPending=*/true);
				}
				return this;
			};
		}

		// enhance with the helper method to exclude a single instance from being use of EnabledPropagator
		this.useEnabledPropagator = function(bUseEnabledPropagator) {
			this._bUseEnabledPropagator = bUseEnabledPropagator;
		};

		this.getMetadata().addPublicMethods("useEnabledPropagator");
	};

	/**
	 * Invalidates the descendants of the provided root element that are implementing the EnabledPropagator mixin
	 *
	 * @param {sap.ui.core.Element} oRootElement The root element instance
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	EnabledPropagator.updateDescendants = function(oRootElement) {
		oRootElement.isActive() && oRootElement.findElements(true, function(oElement) {
			if (oElement._bUseEnabledPropagator && oElement.bOutput == true) {
				oElement.invalidate();
			}
		});
	};

	/**
	 * Determines whether an ancestor of the provided control implements getEnabled method and that returns false
	 *
	 * @param {sap.ui.core.Control} oControl A control instance
	 * @returns {boolean} Whether any control implements getEnabled method and that returns false
	 * @private
	 */
	function hasDisabledAncestor(oControl) {
		let oParent;
		for (oParent = oControl.getParent(); oParent && !oParent.getEnabled && oParent.getParent; oParent = oParent.getParent()) {/* empty */}
		return oParent && oParent.getEnabled && !oParent.getEnabled();
	}

	return EnabledPropagator;

});
