/*!
 * ${copyright}
 */

// Provides an abstraction for model bindings
sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', './ChangeReason', './DataState'],
	function(jQuery, EventProvider, ChangeReason, DataState) {
	"use strict";


	/**
	 * Constructor for Binding class.
	 *
	 * @class
	 * The Binding is the object, which holds the necessary information for a data binding,
	 * like the binding path and the binding context, and acts like an interface to the
	 * model for the control, so it is the event provider for changes in the data model
	 * and provides getters for accessing properties or lists.
	 *
	 * @param {sap.ui.model.Model} oModel the model
	 * @param {string} sPath the path
	 * @param {sap.ui.model.Context} oContext the context object
	 * @param {object} [mParameters]
	 * @abstract
	 * @public
	 * @alias sap.ui.model.Binding
	 * @extends sap.ui.base.EventProvider
	 */
	var Binding = EventProvider.extend("sap.ui.model.Binding", /** @lends sap.ui.model.Binding.prototype */ {

		constructor : function(oModel, sPath, oContext, mParameters){
			EventProvider.apply(this);

			this.oModel = oModel;
			this.bRelative = !jQuery.sap.startsWith(sPath,'/');
			this.sPath = sPath;
			this.oContext = oContext;
			this.vMessages = undefined;
			this.mParameters = mParameters;
			this.bInitial = false;
			this.bSuspended = false;
			this.oDataState = null;
		},

		metadata : {
			"abstract" : true,
			publicMethods : [
				// methods
				"getPath", "getContext", "getModel", "attachChange", "detachChange", "refresh", "isInitial",
				"attachDataStateChange","detachDataStateChange",
				"attachAggregatedDataStateChange", "detachAggregatedDataStateChange",
				"attachDataRequested","detachDataRequested","attachDataReceived","detachDataReceived","suspend","resume", "isSuspended"
			]
		}

	});

	/**
	 * The 'dataRequested' event is fired, when data was requested from a backend.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Binding#dataRequested
	 * @event
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.base.EventProvider} oEvent.getSource The object on which the Event initially occurred
	 * @param {object} oEvent.getParameters Object containing all event parameters
	 * @public
	 */

	/**
	 * The 'dataReceived' event is fired, when data was received from a backend. This event may also be fired when an error occurred.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Binding#dataReceived
	 * @event
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.base.EventProvider} oEvent.getSource The object on which the Event initially occurred
	 * @param {object} oEvent.getParameters Object containing all event parameters
	 * @param {string} [oEvent.getParameters.data] The data received. In error cases it will be undefined.
	 * @public
	 */

	/**
	 * The 'change' event is fired, when the data of the Binding is changed from the model.
	 * The reason parameter of the event provides a hint where the change came from.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Binding#change
	 * @event
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.base.EventProvider} oEvent.getSource The object on which the Event initially occurred
	 * @param {object} oEvent.getParameters Object containing all event parameters
	 * @param {string} [oEvent.getParameters.reason] A string stating the reason for the data change. Can be any string and new values can be added in the future.
	 * @public
	 */

	/**
	 * The 'DataStateChange' event is fired, when the DataState of the Binding has changed.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Binding#DataStateChange
	 * @event
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.base.EventProvider} oEvent.getSource The object on which the Event initially occurred
	 * @param {object} oEvent.getParameters Object containing all event parameters
	 * @param {sap.ui.model.DataState} [oEvent.getParameters.dataState] The DataState object of the binding.
	 * @protected
	 */

	/**
	 * The 'AggregatedDataStateChange' event is fired asynchronously when all 'datastateChanges' within the actual stack are done.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Binding#AggregatedDataStateChange
	 * @event
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.base.EventProvider} oEvent.getSource The object on which the Event initially occurred
	 * @param {object} oEvent.getParameters Object containing all event parameters
	 * @param {sap.ui.model.DataState} [oEvent.getParameters.dataState] The DataState object of the binding.
	 * @protected
	 */

	// Getter
	/**
	 * Getter for path
	 * @return {string} the binding path
	 */
	Binding.prototype.getPath = function() {
		return this.sPath;
	};

	/**
	 * Getter for context
	 * @return {Object} the context object
	 */
	Binding.prototype.getContext = function() {
		return this.oContext;
	};

	/**
	 * Setter for context
	 * @param {Object} oContext the new context object
	 */
	Binding.prototype.setContext = function(oContext) {
		if (this.oContext != oContext) {
			sap.ui.getCore().getMessageManager().removeMessages(this.getDataState().getControlMessages(), true);
			this.oContext = oContext;
			this.oDataState = null;
			this._fireChange({reason : ChangeReason.Context});
		}
	};

	/**
	 * Getter for current active messages
	 * @return {Object} the context object
	 */
	Binding.prototype.getMessages = function() {
		return this.vMessages;
	};

	/**
	 * Returns the data state for this binding
	 * @return {sap.ui.model.DataState} the data state
	 */
	Binding.prototype.getDataState = function() {
		if (!this.oDataState) {
			this.oDataState = new DataState();
		}
		return this.oDataState;
	};

	/**
	 * Getter for model
	 * @return {sap.ui.model.Model} the model
	 */
	Binding.prototype.getModel = function() {
		return this.oModel;
	};

	// Eventing and related
	/**
	 * Attach event-handler <code>fnFunction</code> to the 'change' event of this <code>sap.ui.model.Model</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @public
	 */
	Binding.prototype.attachChange = function(fnFunction, oListener) {
		if (!this.hasListeners("change")) {
			this.oModel.addBinding(this);
		}
		this.attachEvent("change", fnFunction, oListener);
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'change' event of this <code>sap.ui.model.Model</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @public
	 */
	Binding.prototype.detachChange = function(fnFunction, oListener) {
		this.detachEvent("change", fnFunction, oListener);
		if (!this.hasListeners("change")) {
			this.oModel.removeBinding(this);
		}
	};

	/**
	 * Fire event DataStateChange to attached listeners.
	 * @param {Map}
	 *         mArguments the arguments to pass along with the event.
	 * @private
	 */
	Binding.prototype._fireDataStateChange = function(mArguments) {
		this.fireEvent("DataStateChange", mArguments);
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'DataStateChange' event of this <code>sap.ui.model.Binding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 */
	Binding.prototype.attachDataStateChange = function(fnFunction, oListener) {
		this.attachEvent("DataStateChange", fnFunction, oListener);
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'DataStateChange' event of this <code>sap.ui.model.Binding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 */
	Binding.prototype.detachDataStateChange = function(fnFunction, oListener) {
		this.detachEvent("DataStateChange", fnFunction, oListener);
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'AggregatedDataStateChange' event of this <code>sap.ui.model.Binding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 */
	Binding.prototype.attachAggregatedDataStateChange = function(fnFunction, oListener) {
		this.attachEvent("AggregatedDataStateChange", fnFunction, oListener);
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'AggregatedDataStateChange' event of this <code>sap.ui.model.Binding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 */
	Binding.prototype.detachAggregatedDataStateChange = function(fnFunction, oListener) {
		this.detachEvent("AggregatedDataStateChange", fnFunction, oListener);
	};

	/**
	 * Fire event change to attached listeners.
	 * @param {Map}
	 *         mArguments the arguments to pass along with the event.
	 * @private
	 */
	Binding.prototype._fireChange = function(mArguments) {
		this.fireEvent("change", mArguments);
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'dataRequested' event of this <code>sap.ui.model.Binding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @public
	 */
	Binding.prototype.attachDataRequested = function(fnFunction, oListener) {
		this.attachEvent("dataRequested", fnFunction, oListener);
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'dataRequested' event of this <code>sap.ui.model.Binding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @public
	 */
	Binding.prototype.detachDataRequested = function(fnFunction, oListener) {
		this.detachEvent("dataRequested", fnFunction, oListener);
	};

	/**
	 * Fire event dataRequested to attached listeners.
	 * @param {Map} mArguments the arguments to pass along with the event.
	 * @protected
	 */
	Binding.prototype.fireDataRequested = function(mArguments) {
		this.fireEvent("dataRequested", mArguments);
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'dataReceived' event of this <code>sap.ui.model.Binding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @public
	 */
	Binding.prototype.attachDataReceived = function(fnFunction, oListener) {
		this.attachEvent("dataReceived", fnFunction, oListener);
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'dataReceived' event of this <code>sap.ui.model.Binding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @public
	 */
	Binding.prototype.detachDataReceived = function(fnFunction, oListener) {
		this.detachEvent("dataReceived", fnFunction, oListener);
	};

	/**
	 * Fire event dataReceived to attached listeners. This event may also be fired when an error occured.
	 * @param {Map} mArguments the arguments to pass along with the event.
	 * @param {object} [mArguments.data] the data received. In error cases it will be undefined.
	 * @protected
	 */
	Binding.prototype.fireDataReceived = function(mArguments) {
		this.fireEvent("dataReceived", mArguments);
	};

	/**
	 * Determines if the binding should be updated by comparing the current model against a specified model.
	 * @param {object} oModel The model instance to compare against
	 * @returns {boolean} true if this binding should be updated
	 * @protected
	 */
	Binding.prototype.updateRequired = function(oModel) {
		return oModel && this.getModel() === oModel;
	};

	/**
	 * Returns whether this binding validates the values that are set on it.
	 *
	 * @returns {boolean} Returns true if the binding throws a validation exception when an invalid value is set on it.
	 * @private
	 */
	Binding.prototype.hasValidation = function() {
		return !!this.getType();
	};

	/**
	 * Checks whether an update of this bindings is required. If this is the case the change event of
	 * the binding is fired.
	 * The default implementation just fires the change event, if the method is called, the bForceUpdate
	 * parameter is ignored. Subclasses should implement this, if possible.
	 *
	 * @param {boolean} bForceUpdate
	 *
	 * @private
	 */
	Binding.prototype.checkUpdate = function(bForceUpdate) {
		if (this.bSuspended && !bForceUpdate ) {
			return;
		}
		this._fireChange({reason: ChangeReason.Change});
	};

	/**
	 * Refreshes the binding, check whether the model data has been changed and fire change event
	 * if this is the case. For server side models this should refetch the data from the server.
	 * To update a control, even if no data has been changed, e.g. to reset a control after failed
	 * validation, please use the parameter bForceUpdate.
	 *
	 * @param {boolean} bForceUpdate Update the bound control even if no data has been changed
	 *
	 * @public
	 */
	Binding.prototype.refresh = function(bForceUpdate) {
		if (this.bSuspended && !bForceUpdate) {
			return;
		}
		this.checkUpdate(bForceUpdate);
	};

	/**
	 * Initialize the binding. The message should be called when creating a binding.
	 * The default implementation calls checkUpdate(true).
	 *
	 * @protected
	 */
	Binding.prototype.initialize = function() {
		if (!this.bSuspended) {
			this.checkUpdate(true);
		}
		return this;
	};

	/**
	 * _refresh for compatibility
	 * @private
	 */
	Binding.prototype._refresh = function(bForceUpdate) {
		this.refresh(bForceUpdate);
	};

	/**
	 * Check if the binding can be resolved. This is true if the path is absolute or the path is relative and a context is specified.
	 * @private
	 */
	Binding.prototype.isResolved = function() {
		if (this.bRelative && !this.oContext) {
			return false;
		}
		return true;
	};

	/**
	 * Returns whether the binding is initial, which means it did not get an initial value yet
	 * @return {boolean} whether binding is initial
	 * @public
	 */
	Binding.prototype.isInitial = function() {
		return this.bInitial;
	};

	/**
	 * Returns whether the binding is relative, which means it did not start with a /
	 * @return {boolean} whether binding is relative
	 * @public
	 */
	Binding.prototype.isRelative = function() {
		return this.bRelative;
	};

	/**
	 * Attach multiple events.
	 *
	 * @param {Object.<string, function>} oEvents
	 * @protected
	 */
	Binding.prototype.attachEvents = function(oEvents) {
		if (!oEvents) {
			return this;
		}
		var that = this;
		jQuery.each(oEvents, function(sEvent, fnHandler) {
			var sMethod = "attach" + sEvent.substring(0,1).toUpperCase() + sEvent.substring(1);
			if (that[sMethod]) {
				that[sMethod](fnHandler);
			} else {
				jQuery.sap.log.warning(that.toString() + " has no handler for event '" + sEvent + "'");
			}
		});
		return this;
	};

	/**
	 * Detach multiple events.
	 *
	 * @param {Object.<string, function>} oEvents
	 * @protected
	 */
	Binding.prototype.detachEvents = function(oEvents) {
		if (!oEvents) {
			return this;
		}
		var that = this;
		jQuery.each(oEvents, function(sEvent, fnHandler) {
			var sMethod = "detach" + sEvent.substring(0,1).toUpperCase() + sEvent.substring(1);
			if (that[sMethod]) {
				that[sMethod](fnHandler);
			} else {
				jQuery.sap.log.warning(that.toString() + " has no handler for event '" + sEvent + "'");
			}
		});
		return this;
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'refresh' event of this <code>sap.ui.model.Binding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 */
	Binding.prototype.attachRefresh = function(fnFunction, oListener) {
		this.attachEvent("refresh", fnFunction, oListener);
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'refresh' event of this <code>sap.ui.model.Binding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 */
	Binding.prototype.detachRefresh = function(fnFunction, oListener) {
		this.detachEvent("refresh", fnFunction, oListener);
	};

	/**
	 * Fire event refresh to attached listeners.
	 * @param {Map} [mArguments] the arguments to pass along with the event.
	 * @private
	 */
	Binding.prototype._fireRefresh = function(mArguments) {
		this.fireEvent("refresh", mArguments);
	};

	/**
	 * Suspends the binding update. No change events will be fired.
	 *
	 * A refresh call with bForceUpdate set to true will also update the binding and fire a change in suspended mode.
	 * Special operations on bindings, which require updates to work properly (as paging or filtering in list bindings)
	 * will also update and cause a change event although the binding is suspended.
	 * @public
	 */
	Binding.prototype.suspend = function() {
		this.bSuspended = true;
	};

	/**
	 * Returns true if the binding is suspended or false if not.
	 *
	 * @return {boolean} whether binding is suspended
	 * @public
	 */
	Binding.prototype.isSuspended = function() {
		return this.bSuspended;
	};

	/**
	 * Resumes the binding update. Change events will be fired again.
	 *
	 * When the binding is resumed, a change event will be fired immediately, if the data has changed while the binding
	 * was suspended. For serverside models, a request to the server will be triggered, if a refresh was requested
	 * while the binding was suspended.
	 * @public
	 */
	Binding.prototype.resume = function() {
		this.bSuspended = false;
		this.checkUpdate();
	};

	/**
	 * Removes all control messages for this binding from the MessageManager in addition to the standard clean-up tasks.
	 * @see sap.ui.base.EventProvider#destroy
	 *
	 * @public
	 */
	Binding.prototype.destroy = function() {
		this.bIsBeingDestroyed = true;
		sap.ui.getCore().getMessageManager().removeMessages(this.getDataState().getControlMessages(), true);
		EventProvider.prototype.destroy.apply(this, arguments);
		this.bIsBeingDestroyed = false;
	};

	return Binding;

});
