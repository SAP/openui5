/*!
 * ${copyright}
 */

// Provides class sap.ui.base.Event
sap.ui.define(['./Object', "sap/base/assert"],
	function(BaseObject, assert) {
	"use strict";


	/**
	 *
	 * Creates an event with the given <code>sId</code>, linked to the provided <code>oSource</code> and enriched with the <code>mParameters</code>.
	 * @class An Event object consisting of an ID, a source and a map of parameters.
	 * Implements {@link sap.ui.base.Poolable} and therefore an event object in the event handler will be reset by {@link sap.ui.base.ObjectPool} after the event handler is done.
	 *
	 * @param {string} sId The ID of the event
	 * @param {sap.ui.base.EventProvider} oSource Source of the event
	 * @param {object} oParameters Parameters for this event
	 *
	 * @extends sap.ui.base.Object
	 * @implements sap.ui.base.Poolable
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.base.Event
	 * @public
	 */
	var Event = BaseObject.extend("sap.ui.base.Event", /** @lends sap.ui.base.Event.prototype */ {
		constructor : function(sId, oSource, oParameters) {

			BaseObject.apply(this);

			if (arguments.length > 0) {
				this.init(sId, oSource, oParameters);
			}

		}
	});

	/**
	 * Init this event with its data.
	 *
	 * The <code>init</code> method is called by an object pool when the
	 * object is (re-)activated for a new caller.
	 *
	 * When no <code>oParameters</code> are given, an empty object is used instead.
	 *
	 * @param {string} sId ID of the event
	 * @param {sap.ui.base.EventProvider} oSource Source of the event
	 * @param {object} [oParameters] The event parameters
	 *
	 * @private
	 *
	 * @see sap.ui.base.Poolable.prototype#init
	 */
	Event.prototype.init = function(sId, oSource, oParameters) {
		assert(typeof sId === "string", "Event.init: sId must be a string");
		assert(BaseObject.isA(oSource, 'sap.ui.base.EventProvider'), "Event.init: oSource must be an EventProvider");

		this.sId = sId;
		this.oSource = oSource;
		this.mParameters = oParameters || {};
		this.bCancelBubble = false;
		this.bPreventDefault = false;
	};

	/**
	 * Reset event data, needed for pooling.
	 *
	 * @see sap.ui.base.Poolable.prototype#reset
	 * @private
	 */
	Event.prototype.reset = function() {
		this.sId = "";
		this.oSource = null;
		this.mParameters = null;
		this.bCancelBubble = false;
		this.bPreventDefault = false;
	};

	/**
	 * Returns the id of the event.
	 *
	 * @returns {string} The ID of the event
	 * @public
	 */
	Event.prototype.getId = function() {

		return this.sId;

	};

	/**
	 * Returns the event provider on which the event was fired.
	 *
	 * @returns {sap.ui.base.EventProvider} The source of the event
	 * @public
	 */
	Event.prototype.getSource = function() {

		return this.oSource;

	};

	/**
	 * Returns an object with all parameter values of the event.
	 *
	 * @returns {object} All parameters of the event
	 * @public
	 */
	Event.prototype.getParameters = function() {

		return this.mParameters;

	};

	/**
	 * Returns the value of the parameter with the given name.
	 *
	 * @param {string} sName Name of the parameter to return
	 * @return {any} Value of the named parameter
	 * @public
	 */
	Event.prototype.getParameter = function(sName) {

		assert(typeof sName === "string" && sName, "Event.getParameter: sName must be a non-empty string");

		return this.mParameters[sName];

	};

	/**
	 * Cancel bubbling of the event.
	 *
	 * <b>Note:</b> This function only has an effect if the bubbling of the event is supported by the event source.
	 *
	 * @public
	 */
	Event.prototype.cancelBubble = function() {

		this.bCancelBubble = true;

	};

	/**
	 * Prevent the default action of this event.
	 *
	 * <b>Note:</b> This function only has an effect if preventing the default action of the event is supported by the event source.
	 *
	 * @public
	 */
	Event.prototype.preventDefault = function() {

		this.bPreventDefault = true;

	};



	return Event;

});