/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.Manager.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/base/ManagedObject'
],
function(jQuery, ManagedObject) {
	"use strict";

	/**
	 * Constructor for a new Manager.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The Manager allows to create a set of Overlays above the root elements and
	 * theire public children and manage their events.
	 * @extends sap.ui.core.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.dt.Manager
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Manager = ManagedObject.extend("sap.ui.dt.Manager", /** @lends sap.ui.dt.Manager.prototype */ {		
		metadata : {
			"abstract" : true,
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
			},
			associations : {
			},
			events : {
			}
		}
	});

	/*
	 * @private
	 */
	Manager.prototype.init = function() {

	};

	/*
	 * @private
	 */
	Manager.prototype.exit = function() {
		this._oDesignTime = null;
	};	

	/*
	 * @public
	 */
	Manager.prototype.setDesignTime = function(oDesignTime) {
		if (oDesignTime) {
			oDesignTime.attachEvent("overlayCreated", this.onOverlayCreated, this);
		} else {
			var oOldDesignTime = this.getDesignTime();
			if (oOldDesignTime) {
				oOldDesignTime.detachEvent("overlayCreated", this.onOverlayCreated, this);
			}
		}

		this._oDesignTime = oDesignTime;

	};

	/*
	 * @protected
	 * @abstract
	 */
	 Manager.prototype.onOverlayCreated = function(oEvent) {

	 };

	/*
	 * @public
	 */
	Manager.prototype.getDesignTime = function() {
		return this._oDesignTime;
	};

	return Manager;
}, /* bExport= */ true);