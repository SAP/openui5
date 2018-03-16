/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/ui/thirdparty/jquery',
	'sap/base/util/getObject',
	'jquery.sap.global', //evo-todo: Not sure whether this dependency and sap/ui/Global could be removed.
	'sap/ui/Global'
], function(jQuery, getObject) {
	"use strict";

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
				var fnClass = getObject(sControlType);
				if (fnClass) {

					// TODO: hack for Steffen; remove later
					if (typeof oConfiguration == 'object' && typeof oConfiguration.press == 'function') {
						oConfiguration.press = jQuery.proxy(oConfiguration.press, this);
					}

					oControl = new (fnClass)(sId, oConfiguration); // sId might actually contain oConfiguration, the Element constructor will take care of this

					// placeAt first DomRef in collection
					oControl.placeAt(this);
					// TODO: avoid the direct call to applyChanges() in favor of a delayed version that potentially bundles several changes
					//sap.ui.getCore().applyChanges();
				}
			}

		});
	};


	return jQuery;

});