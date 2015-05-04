/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.ElementObserver.
sap.ui.define([
	'sap/ui/base/ManagedObject'
],
function(ManagedObject) {
	"use strict";


	/**
	 * Constructor for a new ElementObserver.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The ElementObserver observs changes of an element and propagates them via events.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.dt.Overlay
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ElementObserver = ManagedObject.extend("sap.ui.dt.ElementObserver", /** @lends sap.ui.dt.ElementObserver.prototype */ {
		metadata : {

			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				
			},
			associations : {
				"element" : {
					"type" : "sap.ui.core.Element"
				}
			},
			events : {
				
			}
		}
	});

	ElementObserver.prototype.init = function() {
		
	};

	ElementObserver.prototype.exit = function() {
		
	};

	ElementObserver.prototype.setElement = function(oElement) {
		this.setAssociation("element", oElement);

		
	};

	return ElementObserver;
}, /* bExport= */ true);