/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides helper sap.ui.core.EnabledPropagator
jQuery.sap.declare("sap.ui.core.EnabledPropagator");
jQuery.sap.require("sap.ui.core.Control");

/**
 * @class Helper Class for enhancement of a Control with propagation of enabled property.
 *
 * <b>This constructor should be applied to the prototype of a control</b>
 *
 * Example:
 * <code>
 * sap.ui.core.EnabledPropagator.apply(<i>Some-Control</i>.prototype, [<i>Default-values</i>]);
 * </code>
 * e.g.
 * <code>
 * sap.ui.core.EnabledPropagator.apply(sap.ui.commons.Button.prototype, [true]);
 * </code>
 *
 * @author Daniel Brinkmann
 * @version 1.9.0-SNAPSHOT
 * @param {boolean}
 *		bDefault the value that should be used as default value for the enhancement of the control.
 * @public
 */
sap.ui.core.EnabledPropagator = function(bDefault) {
	// Ensure only Controls are enhanced
	if(!(this instanceof sap.ui.core.Control)){
		return;
	}

	// Ensure not to overwrite existing implementations.
	var fWalkUp = function(/**sap.ui.core.Control*/oControl){
		var oParent = oControl.getParent();
		while(oParent && !oParent.getEnabled && oParent.getParent){
			oParent = oParent.getParent();
		}
		return oParent;
	};
	if(this.getEnabled === undefined) {
		// set some default
		this.getEnabled = function () {
			var oParent = fWalkUp(this);
			return (oParent && oParent.getEnabled && !oParent.getEnabled()) ? false : this.getProperty('Enabled');
		};

		this.getMetadata().addProperty('Enabled', {type : "boolean", group : "Behavior", defaultValue :  bDefault === true});
		this.getMetadata().addPublicMethods('getEnabled');

	} else {
//		// What should we do here?

//		// --> Replace?
//		this.getEnabled = function () {
//			var oParent = fWalkUp(this);
////		return (oParent && oParent.getEnabled && !oParent.getEnabled()) ? false : this.bEnabled;
//			return (oParent && oParent.getEnabled && !oParent.getEnabled()) ? false : this.getProperty('Enabled');
//		}

//		// Or

//		// --> Wrap?
		var fOld = this.getEnabled;
		this.getEnabled = function () {
			var oParent = fWalkUp(this);
			return (oParent && oParent.getEnabled && !oParent.getEnabled()) ? false : fOld.apply(this);
		};
	}

	if(this.setEnabled === undefined){
		this.setEnabled = function (bEnabled) {
			this.setProperty('Enabled', bEnabled);
		};

		this.getMetadata().addPublicMethods('setEnabled');
	}
};