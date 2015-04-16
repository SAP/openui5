/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.DesignTimeNew.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/ui/dt/Overlay',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/Utils'
],
function(jQuery, Control, Overlay, OverlayRegistry, Utils) {
	"use strict";

	/**
	 * Constructor for a new DesignTimeNew.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The DesignTimeNew allows to create an absolute positioned DIV above the associated
	 * control / element.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.dt.DesignTimeNew
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var DesignTimeNew = Control.extend("sap.ui.dt.DesignTimeNew", /** @lends sap.ui.dt.DesignTimeNew.prototype */ {
		metadata : {

			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {

			},
			associations : {
				"rootElement" : {
					"type" : "sap.ui.core.Element"
				}
			},
			events : {

			}
		}
	});

	/*
	 * @private
	 */
	DesignTimeNew.prototype.init = function() {

	};

	DesignTimeNew.prototype._createOverlays = function() {
		var aAllPublicElements = Utils.findAllPublicElements(this._getRootElementInstance());
		jQuery.each(aAllPublicElements, function(index, oElement) {
			new Overlay({
				element : oElement
			});
		}); 
	};

	DesignTimeNew.prototype._getRootElementInstance = function() {
		return sap.ui.getCore().byId(this.getRootElement());
	};

	DesignTimeNew.prototype.setRootElement = function(vRootElement) {
		this.destroyOverlays();

		this.setAssociation("rootElement", vRootElement);
		
		this._createOverlays();
	};

	DesignTimeNew.prototype.destroyOverlays = function() {
		var aAllPublicElements = Utils.findAllPublicElements(this._getRootElementInstance());
		jQuery.each(aAllPublicElements, function(index, oElement) {
			var oOverlay = OverlayRegistry.getOverlay(oElement);
			if (oOverlay) {
				oOverlay.destroy();
			}
		});
	};

	DesignTimeNew.prototype.exit = function() {
		this.destroyOverlays();
	};

	return DesignTimeNew;
}, /* bExport= */ true);