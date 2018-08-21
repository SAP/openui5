/*!
 * ${copyright}
 */

//Provides control sap.m.OnePersonView.
sap.ui.define(['sap/ui/core/Element', './library'],
function(Element, library) {
	"use strict";

	/**
	 * Constructor for a new <code>OnePersonView</code>.
	 *
	 * @class
	 * Disclaimer: this control is in beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 *
	 * @constructor
	 * @private
	 * @since 1.58.0
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var OnePersonView = Element.extend("sap.m.OnePersonView", /** @lends sap.m.OnePersonView.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			key : {type : "string", group : "Data", defaultValue : null},

			intervalType : {type : "sap.m.OnePersonCalendarView", group : "Appearance", defaultValue : library.OnePersonCalendarView.Week},

			title : {type : "string", group : "Data"}

		}
	}});

	return OnePersonView;

});