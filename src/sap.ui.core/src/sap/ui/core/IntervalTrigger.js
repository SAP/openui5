/*!
 * ${copyright}
 */
sap.ui.define(['../base/Object', './EventBus', "sap/base/assert"],
	function(BaseObject, EventBus, assert) {
	"use strict";


		var _EVENT_ID = "sapUiIntervalTrigger-event";

		/**
		 * Creates an instance of EventBus.
		 *
		 * @class Provides a trigger that triggers in a set interval and calls all
		 *        registered listeners. If the interval is <= 0 the trigger is
		 *        switched off and won't trigger at all.
		 * @param {int}
		 *            iInterval is the interval the trigger should be used. If the
		 *            trigger is >0 triggering starts/runs and if the interval is
		 *            set to <=0 triggering stops.
		 *
		 * @extends sap.ui.base.Object
		 * @author SAP SE
		 * @version ${version}
		 * @public
		 * @since 1.11.0
		 * @alias sap.ui.core.IntervalTrigger
		 */
		var IntervalTrigger = BaseObject.extend("sap.ui.core.IntervalTrigger", {
			constructor : function(iInterval) {
				BaseObject.apply(this);

				this._oEventBus = new EventBus();

				this._delayedCallId = null;
				this._trigger = trigger.bind(this);

				this._iInterval = 0;
				if (iInterval) {
					this.setInterval(iInterval);
				}
			}
		});

		/**
		 * This is the function that will be used for triggering.
		 *
		 * @private
		 */
		var trigger = function() {
			if (this._delayedCallId) {
				 clearTimeout(this._delayedCallId);
				 this._delayedCallId = null;
			}

			// if interval is active and there are registered listeners
			var bHasListeners = this._oEventBus._defaultChannel.hasListeners(_EVENT_ID);
			if (this._iInterval > 0 && bHasListeners) {
				this._oEventBus.publish(_EVENT_ID);

				this._delayedCallId = setTimeout(this._trigger, this._iInterval);
			}
		};

		/**
		 * Destructor method for objects.
		 *
		 * @public
		 */
		IntervalTrigger.prototype.destroy = function() {
			BaseObject.prototype.destroy.apply(this, arguments);

			if (this._delayedCallId) {
				 clearTimeout(this._delayedCallId);
				 this._delayedCallId = null;
			}
			delete this._trigger;

			this._oEventBus.destroy();
			delete this._oEventBus;
		};

		/**
		 * Sets the trigger interval. If the value is >0 triggering will start if
		 * there are any registered listeners. If the interval is set to <=0
		 * triggering will stop.
		 *
		 * @public
		 * @param {int}
		 *            iInterval sets the interval in milliseconds when a new
		 *            triggering should occur.
		 */
		IntervalTrigger.prototype.setInterval = function(iInterval) {
			assert((typeof iInterval === "number"), "Interval must be an integer value");

			// only change and (re)trigger if the interval is different
			if (this._iInterval !== iInterval) {
				this._iInterval = iInterval;
				this._trigger();
			}
		};

		/**
		 * Adds a listener to the list that should be triggered.
		 *
		 * @public
		 * @param {function}
		 *            fnFunction is the called function that should be called when
		 *            the trigger want to trigger the listener.
		 * @param {object}
		 *            [oListener] that should be triggered.
		 */
		IntervalTrigger.prototype.addListener = function(fnFunction, oListener) {
			this._oEventBus.subscribe(_EVENT_ID, fnFunction, oListener);

			this._trigger();
		};

		/**
		 * Removes corresponding listener from list.
		 *
		 * @public
		 * @param {function}
		 *            fnFunction is the previously registered function
		 * @param {object}
		 *            [oListener] that should be removed
		 */
		IntervalTrigger.prototype.removeListener = function(fnFunction, oListener) {
			this._oEventBus.unsubscribe(_EVENT_ID, fnFunction, oListener);
		};

		/*
		 * @see sap.ui.base.Object#getInterface
		 */
		IntervalTrigger.prototype.getInterface = function() {
			return this;
		};

	/**
	 * Central instance of the IntervalTrigger (Singleton)
	 *
	 * @example <caption>Create instance</caption>
	 *
	 * sap.ui.require(["sap/ui/core/IntervalTrigger"], function(IntervalTrigger) {
	 *     var fnDoIt = function(){
	 *         // my code
	 *     }
	 *     IntervalTrigger.addListener(fnDoIt, this);
	 *     IntervalTrigger.removeListener(fnDoIt, this);
	 * });
	 *
	 * Note: Only <code>addListener</code> and <code>removeListener</code> functions are exposed such that the
	 * singleton can neither be destroyed nor the interval can be modified.
	 *
	 * @return {sap.ui.core.IntervalTrigger} the instance with 200ms interval
	 */
	var getInstance = function() {

		var oIntervalTrigger = new IntervalTrigger(200);
		getInstance = function() {
			return oIntervalTrigger;
		};
		return oIntervalTrigger;
	};

	/**
	 * Adds a listener to the list that should be triggered.
	 *
	 * @public
	 * @since 1.61
	 * @param {function} fnFunction is the called function that should be called when
	 *            the trigger want to trigger the listener.
	 * @param {object} [oListener] that should be triggered.
	 */
	IntervalTrigger.addListener = function(fnFunction, oListener) {
		getInstance().addListener(fnFunction, oListener);
	};

	/**
	 * Removes corresponding listener from list.
	 *
	 * @public
	 * @since 1.61
	 * @param {function} fnFunction is the previously registered function
	 * @param {object} [oListener] that should be removed
	 */
	IntervalTrigger.removeListener = function(fnFunction, oListener) {
		getInstance().removeListener(fnFunction, oListener);
	};


	return IntervalTrigger;

});