/*!
 * ${copyright}
 */

// A bridge between the jQuery.sap plugin and the SAPUI5 Core
sap.ui.define([
	'jquery.sap.global',
	'sap/base/util/ObjectPath',
	'sap/ui/core/UIArea',
	'sap/ui/dom/jquery/control'
	/* cyclic: 'sap/ui/core/Core' */
], function(jQuery, ObjectPath, UIArea /* jQueryControl */) {
	"use strict";

	function fgetUIAreaOfCtrl(oCtrl){
		return oCtrl.getUIArea().getInterface();
	}

	function fUIAreaFilter(){
		return UIArea.registry.get(this.id) != null;
	}

	function fgetUIArea(){
		return UIArea.registry.get(this.id).getInterface();
	}

	/**
	 * @param {object} oRootControl The root control
	 * @returns {jQuery} Returns itself
	 * @name jQuery#root
	 * @function
	 * @public
	 * @deprecated since 1.58
	 */
	jQuery.fn.root = function(oRootControl) {
		// handle 'setRoot'
		if (oRootControl) {
			// @evo-todo: remove this global access (for now requiring the Core module would introduce a circular dependency)
			sap.ui.getCore().setRoot(this.get(0), oRootControl);
			return this;
		}
		// and 'getRoot' behavior.
		// requires control dependency
		var aControls = this.control();
		if (aControls.length > 0) {
			return aControls.map(fgetUIAreaOfCtrl);
		}

		// requires uiarea dependency
		var aUIAreas = this.uiarea();

		if (aUIAreas.length > 0) {
			// we have UIAreas
			return aUIAreas;
		}

		// create UIAreas
		this.each(function(){
			UIArea.create(this);
		});
		return this;
	};

	/**
	 * Returns a single UIArea if an index is provided or an array of UIAreas.
	 *
	 * @param {int} iIdx Index of the UIArea
	 * @returns {Object|Array} The UIArea if an index is provided or an array of UIAreas
	 * @name jQuery#uiarea
	 * @function
	 * @public
	 * @deprecated since 1.58
	 */
	jQuery.fn.uiarea = function(iIdx) {
		// UIAreas need to have IDs... so reduce to those elements first
		var aUIAreas = this.slice("[id]").filter(fUIAreaFilter).map(fgetUIArea).get();
		return typeof (iIdx) === "number" ? aUIAreas[iIdx] : aUIAreas;
	};

	/**
	 * EXPERIMENTAL!!
	 * Creates a new control of the given type and places it into the first DOM object of the jQuery collection.
	 * The type string is case sensitive.
	 *
	 * @param {string} sControlType The control type (fully qualified, like <code>sap.ui.dev.GoogleMap</code>; if no package is given, the package <code>sap.ui.commons</code> is assumed)
	 * @param {string} [sId] Optional ID for the new control; generated automatically if no non-empty ID is given
	 * @param {object} [oConfiguration] Optional map/JSON-object with initial values for the new control
	 * @returns {jQuery} the given jQuery object
	 * @private
	 * @deprecated since 1.58
	 */
	jQuery.fn.sapui = function(sControlType, sId, oConfiguration) {

		return this.each(function() { // TODO: hack for Steffen; (point is not clear, as this adds identical controls to many DOM elements...); remove soon

			var oControl = null;
			if (this) {
				// allow omitting the package prefix because this looks less Java-like...  sap.ui.commons is the default package
				if (sControlType.indexOf(".") == -1)  {
					sControlType = "sap.ui.commons." + sControlType;
				}

				// instantiate the control
				var fnClass = ObjectPath.get(sControlType);
				if (fnClass) {

					// TODO: hack for Steffen; remove later
					if (typeof oConfiguration == 'object' && typeof oConfiguration.press == 'function') {
						oConfiguration.press = jQuery.proxy(oConfiguration.press, this);
					}

					oControl = new (fnClass)(sId, oConfiguration); // sId might actually contain oConfiguration, the Element constructor will take care of this

					// placeAt first DomRef in collection
					oControl.placeAt(this);
				}
			}

		});
	};

	return jQuery;
});
