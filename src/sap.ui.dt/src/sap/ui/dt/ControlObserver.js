/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.ControlObserver.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/ManagedObjectObserver'
],
function(jQuery, ManagedObjectObserver) {
	"use strict";


	/**
	 * Constructor for a new ControlObserver.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The ControlObserver observs changes of a control and propagates them via events.
	 * @extends sap.ui.dt.ManagedObjectObserver
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
	var ControlObserver = ManagedObjectObserver.extend("sap.ui.dt.ControlObserver", /** @lends sap.ui.dt.ControlObserver.prototype */ {
		metadata : {

			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				
			},
			associations : {
				"target" : {
					"type" : "sap.ui.core.Control"
				}
			},
			events : {
				"beforeRendering" : {},
				"afterRendering" : {}
			}
		}
	});

	/**
	 * @protected
	 * @override
	 */
	ControlObserver.prototype.init = function() {
		ManagedObjectObserver.prototype.init.apply(this, arguments);
		this._onWindowResizeProxy = jQuery.proxy(this.fireChanged, this);
		this._oControlDelegate = {
			onBeforeRendering: this._onBeforeRendering,
			onAfterRendering: this._onAfterRendering
		};
	};

	/**
	 * @protected
	 * @override
	 */
	ControlObserver.prototype.observe = function(oControl) {
		ManagedObjectObserver.prototype.observe.apply(this, arguments);
		window.addEventListener("resize", this._onWindowResizeProxy);
		oControl.addDelegate(this._oControlDelegate, this);	
	};

	/**
	 * @protected
	 * @override
	 */
	ControlObserver.prototype.unobserve = function(oControl) {
		ManagedObjectObserver.prototype.unobserve.apply(this, arguments);
		window.removeEventListener("resize", this._onWindowResizeProxy);
		oControl.removeDelegate(this._oControlDelegate, this);
	};

	/**
	 * @private
	 */
	ControlObserver.prototype._onBeforeRendering = function() {
		this.fireBeforeRendering();
	};

	/**
	 * @private
	 */
	ControlObserver.prototype._onAfterRendering = function() {
		this.fireAfterRendering();
	};

	return ControlObserver;
}, /* bExport= */ true);