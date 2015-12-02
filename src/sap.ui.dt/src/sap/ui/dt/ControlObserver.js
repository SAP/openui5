/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.ControlObserver.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/ManagedObjectObserver',
	'sap/ui/dt/DOMUtil'
],
function(jQuery, ManagedObjectObserver, DOMUtil) {
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
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.ControlObserver
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
				/**
				 * target Control to observe
				 */
				"target" : {
					"type" : "sap.ui.core.Control"
				}
			},
			/**
			 * Fired when the DOM of the observed control is changed
			 */
			events : {
				"domChanged" : {}
			}
		}
	});

	/**
	 * @protected
	 */
	ControlObserver.prototype.init = function() {
		ManagedObjectObserver.prototype.init.apply(this, arguments);

		this._fnFireDomChanged = this.fireDomChanged.bind(this);
		this._oControlDelegate = {
			onAfterRendering : this._onAfterRendering,
			onBeforeRendering : this._onBeforeRendering
		};
	};

	/**
	 * Starts observing the target control.
	 * @param {sap.ui.core.Control} oControl The target to observe
	 * @override
	 */
	ControlObserver.prototype.observe = function(oControl) {
		ManagedObjectObserver.prototype.observe.apply(this, arguments);

		this._startObservers();
		oControl.addEventDelegate(this._oControlDelegate, this);
	};

	/**
	 * Stops observing the target control.
	 * @param {sap.ui.core.Control} oControl The target to unobserve
	 * @override
	 */
	ControlObserver.prototype.unobserve = function() {
		var oControl = this.getTargetInstance();
		if (oControl) {
			oControl.removeDelegate(this._oControlDelegate, this);
		}
		this._stopObservers();
		delete this._oMutationObserver;

		ManagedObjectObserver.prototype.unobserve.apply(this, arguments);
	};

	/**
	 * @private
	 */
	ControlObserver.prototype._onBeforeRendering = function() {
		this._stopObservers();
	};

	/**
	 * @private
	 */
	ControlObserver.prototype._onAfterRendering = function() {
		this._startObservers();
		this.fireDomChanged();
	};

	/**
	 * @private
	 */
	ControlObserver.prototype._startMutationObserver = function() {
		var that = this;
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		var oDomRef = this.getTargetInstance().getDomRef();
		if (MutationObserver && oDomRef) {
			this._oMutationObserver = this._oMutationObserver || new MutationObserver(function(aMutations) {
				that.fireDomChanged();
			});
			this._oMutationObserver.observe(oDomRef, {
				childList : true,
				subtree : true,
				attributes : true
			});
		}
	};

	/**
	 * @private
	 */
	ControlObserver.prototype._stopMutationObserver = function() {
		if (this._oMutationObserver) {
			this._oMutationObserver.disconnect();
		}
	};

	/**
	 * @private
	 */
	ControlObserver.prototype._startResizeObserver = function() {
		jQuery(window).on("resize", this._fnFireDomChanged);
	};

	/**
	 * @private
	 */
	ControlObserver.prototype._stopResizeObserver = function() {
		jQuery(window).off("resize", this._fnFireDomChanged);
	};

	/**
	 * @private
	 */
	ControlObserver.prototype._startObservers = function() {
		var bVisible = DOMUtil.isVisible(this.getTargetInstance().$());

		if (bVisible) {
			this._startResizeObserver();
			this._startMutationObserver();
		}
	};

	/**
	 * @private
	 */
	ControlObserver.prototype._stopObservers = function() {
		this._stopResizeObserver();
		this._stopMutationObserver();
	};

	return ControlObserver;
}, /* bExport= */ true);