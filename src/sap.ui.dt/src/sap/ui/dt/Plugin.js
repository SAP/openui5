/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.Plugin.
sap.ui.define([
	'sap/ui/base/ManagedObject'
],
function(ManagedObject) {
	"use strict";

	/**
	 * Constructor for a new Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The Plugin allows to create a set of Overlays above the root elements and
	 * theire public children and manage their events.
	 * @extends sap.ui.core.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.dt.Plugin
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	 // TODO : jsdocs for abstract methods 
	 // registerOverlay(oOverlay), deregisterOverlay(oOverlay), registerAggregationOverlay(oOverlay), deregisterAggregationOverlay(oOverlay)
	var Plugin = ManagedObject.extend("sap.ui.dt.Plugin", /** @lends sap.ui.dt.Plugin.prototype */ {		
		metadata : {
			"abstract" : true,
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				"designTime" : { // its defined as a property because spa.ui.dt.designTime is a managed object and UI5 only allows associations for elements
					type : "sap.ui.dt.DesignTimeNew",
					multiple : false
				}
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
	Plugin.prototype.init = function() {

	};

	/*
	 * @private
	 */
	Plugin.prototype.exit = function() {
		this.setDesignTime(null);
	};	

	/*
	 * @public
	 */
	Plugin.prototype.setDesignTime = function(oDesignTime) {
		var oOldDesignTime = this.getDesignTime();
		if (oOldDesignTime) {
			this._deregisterOverlays(oOldDesignTime);
			oOldDesignTime.detachEvent("overlayCreated", this._onOverlayCreated, this);
		}
		
		if (oDesignTime) {
			this._registerOverlays(oDesignTime);

			oDesignTime.attachEvent("overlayCreated", this._onOverlayCreated, this);
		}

		this.setProperty("designTime", oDesignTime);
	};

	/** 
	 * @private
	 */
	Plugin.prototype._registerOverlays = function(oDesignTime) {
		if (this.registerOverlay || this.registerAggregationOverlay) {
			var aOverlays = oDesignTime.getOverlays();
			aOverlays.forEach(this._callOverlayRegistrationMethods.bind(this));
		}
	};

	/** 
	 * @private
	 */
	Plugin.prototype._callOverlayRegistrationMethods = function(oOverlay) {
		if (this.registerOverlay) {
			this.registerOverlay(oOverlay);
		}

		if (this.registerAggregationOverlay) {
			var aAggregationOverlays = oOverlay.getAggregationOverlays();
			aAggregationOverlays.forEach(this.registerAggregationOverlay.bind(this));
		}
	};


	/** 
	 * @private
	 */
	Plugin.prototype._deregisterOverlays = function(oDesignTime) {
		if (this.deregisterOverlay || this.deregisterAggregationOverlay) {
			var aOverlays = oDesignTime.getOverlays();
			aOverlays.forEach(this._callOverlayDeregestrationMethods.bind(this));
		}
	};

	/** 
	 * @private
	 */
	Plugin.prototype._callOverlayDeregestrationMethods = function(oOverlay) {
		if (this.deregisterOverlay) {
			this.deregisterOverlay(oOverlay);
		}

		if (this.deregisterAggregationOverlay) {
			var aAggregationOverlays = oOverlay.getAggregationOverlays();
			aAggregationOverlays.forEach(this.deregisterAggregationOverlay.bind(this));
		}		
	};

	/** 
	 * @private
	 */
	Plugin.prototype._onOverlayCreated = function(oEvent) {
		var oOverlay = oEvent.getParameter("overlay");

		this._callOverlayRegistrationMethods(oOverlay);
	};

	return Plugin;
}, /* bExport= */ true);