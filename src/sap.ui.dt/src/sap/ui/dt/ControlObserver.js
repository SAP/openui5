/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.ControlObserver.
sap.ui.define([
	"sap/ui/dt/ManagedObjectObserver"
],
function(ManagedObjectObserver) {
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
	 */
	var ControlObserver = ManagedObjectObserver.extend("sap.ui.dt.ControlObserver", /** @lends sap.ui.dt.ControlObserver.prototype */ {
		metadata: {

			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.dt",
			properties: {

			},
			associations: {
				/**
				 * target Control to observe
				 */
				target: {
					type: "sap.ui.core.Control"
				}
			}
		}
	});

	/**
	 * @protected
	 */
	ControlObserver.prototype.init = function(...aArgs) {
		ManagedObjectObserver.prototype.init.apply(this, aArgs);

		this._oControlDelegate = {
			onAfterRendering: this._onAfterRendering
		};
	};

	/**
	 * Starts observing the target control.
	 * @param {sap.ui.core.Control} oControl The target to observe
	 * @override
	 */
	ControlObserver.prototype.observe = function(...aArgs) {
		const [oControl] = aArgs;
		ManagedObjectObserver.prototype.observe.apply(this, aArgs);

		oControl.addEventDelegate(this._oControlDelegate, this);
	};

	/**
	 * Stops observing the target control.
	 * @param {sap.ui.core.Control} oControl The target to unobserve
	 * @override
	 */
	ControlObserver.prototype.unobserve = function(...aArgs) {
		var oControl = this.getTargetInstance();
		if (oControl) {
			oControl.removeDelegate(this._oControlDelegate, this);
		}

		ManagedObjectObserver.prototype.unobserve.apply(this, aArgs);
	};

	/**
	 * @private
	 */
	ControlObserver.prototype._onAfterRendering = function() {
		this.fireModified({
			type: "afterRendering"
		});
	};

	return ControlObserver;
});