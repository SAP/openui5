/*!
 * ${copyright}
 */

// Provides an abstraction for model bindings
sap.ui.define([
	'sap/ui/base/EventProvider',
	'./ChangeReason',
	'./DataState',
	"sap/base/Log",
	"sap/base/util/each"
],
	function(EventProvider, ChangeReason, DataState, Log, each) {
	"use strict";

	var timeout;
	var aDataStateCallbacks = [];

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
			this.bRelative = !sPath.startsWith('/');
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
	 * The <code>dataRequested</code> event is fired, when data was requested from a backend.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Binding#dataRequested
	 * @event
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.base.EventProvider} oEvent.getSource The object on which the event initially occurred
	 * @param {object} oEvent.getParameters Object containing all event parameters
	 * @public
	 */

	/**
	 * The <code>dataReceived</code> event is fired, when data was received from a backend.
	 *
	 * This event may also be fired when an error occurred.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Binding#dataReceived
	 * @event
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.base.EventProvider} oEvent.getSource The object on which the event initially occurred
	 * @param {object} oEvent.getParameters Object containing all event parameters
	 * @param {string} [oEvent.getParameters.data] The data received. In error cases it will be undefined.
	 * @public
	 */

	/**
	 * The <code>change</code> event is fired, when the data of the binding is changed from the model.
	 * The <code>reason</code> parameter of the event provides a hint where the change came from.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Binding#change
	 * @event
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.base.EventProvider} oEvent.getSource The object on which the event initially occurred
	 * @param {object} oEvent.getParameters Object containing all event parameters
	 * @param {string} [oEvent.getParameters.reason] A string stating the reason for the data change. Can be any string and new values can be added in the future.
	 * @public
	 */

	/**
	 * The <code>DataStateChange</code> event is fired, when the <code>DataState</code> of the binding has changed.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Binding#DataStateChange
	 * @event
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.base.EventProvider} oEvent.getSource The object on which the event initially occurred
	 * @param {object} oEvent.getParameters Object containing all event parameters
	 * @param {sap.ui.model.DataState} [oEvent.getParameters.dataState] The <code>DataState</code> object of the binding.
	 * @protected
	 */

	/**
	 * The <code>AggregatedDataStateChange</code> event is fired asynchronously when all <code>datastateChange</code>s
	 * within the actual stack are done.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Binding#AggregatedDataStateChange
	 * @event
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.base.EventProvider} oEvent.getSource The object on which the event initially occurred
	 * @param {object} oEvent.getParameters Object containing all event parameters
	 * @param {sap.ui.model.DataState} [oEvent.getParameters.dataState] The <code>DataState</code> object of the binding.
	 * @protected
	 */

	// Getter
	/**
	 * Returns the model path to which this binding binds.
	 *
	 * Might be a relative or absolute path. If it is relative, it will be resolved relative
	 * to the context as returned by {@link getContext()}.
	 *
	 * @returns {string} Binding path
	 * @public
	 */
	Binding.prototype.getPath = function() {
		return this.sPath;
	};

	/**
	 * Returns the model context in which this binding will be resolved.
	 *
	 * If the binding path is absolute, the context is not relevant.
	 *
	 * @returns {sap.ui.model.Context} Context object
	 * @public
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
	 * Returns the model to which this binding belongs.
	 *
	 * @returns {sap.ui.model.Model} Model to which this binding belongs
	 * @public
	 */
	Binding.prototype.getModel = function() {
		return this.oModel;
	};

	// Eventing and related
	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:change change} event of this
	 * <code>sap.ui.model.Model</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.Binding</code> itself.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object to call the event handler with,
	 *            defaults to this <code>sap.ui.model.Binding</code> itself
	 * @public
	 */
	Binding.prototype.attachChange = function(fnFunction, oListener) {
		if (!this.hasListeners("change")) {
			this.oModel.addBinding(this);
		}
		this.attachEvent("change", fnFunction, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:change change} event of this
	 * <code>sap.ui.model.Binding</code>.
	 *
	 * @param {function} fnFunction Function to be called, when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @public
	 */
	Binding.prototype.detachChange = function(fnFunction, oListener) {
		this.detachEvent("change", fnFunction, oListener);
		if (!this.hasListeners("change")) {
			this.oModel.removeBinding(this);
		}
	};

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:DataStateChange DataStateChange} event of this
	 * <code>sap.ui.model.Binding</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.Binding</code> itself.
	 *
	 * @param {function} fnFunction Function to be called, when the event occurs
	 * @param {object} [oListener] Context object to call the event handler with,
	 *            defaults to this <code>sap.ui.model.Binding</code> itself
	 * @protected
	 */
	Binding.prototype.attachDataStateChange = function(fnFunction, oListener) {
		this.attachEvent("DataStateChange", fnFunction, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:DataStateChange DataStateChange} event of this
	 * <code>sap.ui.model.Binding</code>.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @protected
	 */
	Binding.prototype.detachDataStateChange = function(fnFunction, oListener) {
		this.detachEvent("DataStateChange", fnFunction, oListener);
	};

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:AggregatedDataStateChange AggregatedDataStateChange}
	 * event of this <code>sap.ui.model.Binding</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.Binding</code> itself.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object to call the event handler with,
	 *            defaults to this <code>sap.ui.model.Binding</code> itself
	 * @protected
	 */
	Binding.prototype.attachAggregatedDataStateChange = function(fnFunction, oListener) {
		this.attachEvent("AggregatedDataStateChange", fnFunction, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:AggregatedDataStateChange AggregatedDataStateChange}
	 * event of this <code>sap.ui.model.Binding</code>.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @protected
	 */
	Binding.prototype.detachAggregatedDataStateChange = function(fnFunction, oListener) {
		this.detachEvent("AggregatedDataStateChange", fnFunction, oListener);
	};

	/**
	 * Fires event {@link #event:change change} to attached listeners.
	 * @param {object}
	 *         oParameters Parameters to pass along with the event.
	 * @private
	 */
	Binding.prototype._fireChange = function(oParameters) {
		this.fireEvent("change", oParameters);
	};

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:dataRequested dataRequested} event of this
	 * <code>sap.ui.model.Binding</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.Binding</code> itself.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object to call the event handler with,
	 *            defaults to this <code>sap.ui.model.Binding</code> itself
	 * @public
	 */
	Binding.prototype.attachDataRequested = function(fnFunction, oListener) {
		this.attachEvent("dataRequested", fnFunction, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:dataRequested dataRequested} event of this
	 * <code>sap.ui.model.Binding</code>.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @public
	 */
	Binding.prototype.detachDataRequested = function(fnFunction, oListener) {
		this.detachEvent("dataRequested", fnFunction, oListener);
	};

	/**
	 * Fires event {@link #event:dataRequested dataRequested} to attached listeners.
	 * @param {object} oParameters Parameters to pass along with the event.
	 * @protected
	 */
	Binding.prototype.fireDataRequested = function(oParameters) {
		this.fireEvent("dataRequested", oParameters);
	};

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:dataReceived dataReceived} event of this
	 * <code>sap.ui.model.Binding</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.Binding</code> itself.
	 *
	 * @param {function} fnFunction Function to be called, when the event occurs
	 * @param {object} [oListener] Context object to call the event handler with,
	 *            defaults to this <code>sap.ui.model.Binding</code> itself
	 * @public
	 */
	Binding.prototype.attachDataReceived = function(fnFunction, oListener) {
		this.attachEvent("dataReceived", fnFunction, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:dataReceived dataReceived} event of this
	 * <code>sap.ui.model.Binding</code>.
	 *
	 * @param {function} fnFunction Function to be called, when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @public
	 */
	Binding.prototype.detachDataReceived = function(fnFunction, oListener) {
		this.detachEvent("dataReceived", fnFunction, oListener);
	};

	/**
	 * Fires event {@link #event:dataReceived dataReceived} to attached listeners.
	 *
	 * This event may also be fired when an error occurred.
	 *
	 * @param {object} oParameters Parameters to pass along with the event.
	 * @param {object} [oParameters.data] Data received. In error cases it will be undefined.
	 * @protected
	 */
	Binding.prototype.fireDataReceived = function(oParameters) {
		this.fireEvent("dataReceived", oParameters);
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
	 * validation, please use the parameter <code>bForceUpdate</code>.
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
	 * @returns {boolean} Whether binding is initial
	 * @public
	 */
	Binding.prototype.isInitial = function() {
		return this.bInitial;
	};

	/**
	 * Returns whether the binding is relative, which means its path does not start with a slash ('/')
	 * @returns {boolean} Whether binding is relative
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
		each(oEvents, function(sEvent, fnHandler) {
			var sMethod = "attach" + sEvent.substring(0,1).toUpperCase() + sEvent.substring(1);
			if (that[sMethod]) {
				that[sMethod](fnHandler);
			} else {
				Log.warning(that.toString() + " has no handler for event '" + sEvent + "'");
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
		each(oEvents, function(sEvent, fnHandler) {
			var sMethod = "detach" + sEvent.substring(0,1).toUpperCase() + sEvent.substring(1);
			if (that[sMethod]) {
				that[sMethod](fnHandler);
			} else {
				Log.warning(that.toString() + " has no handler for event '" + sEvent + "'");
			}
		});
		return this;
	};

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:refresh refresh} event of this
	 * <code>sap.ui.model.Binding</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.Binding</code> itself.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object to call the event handler with,
	 *            defaults to this <code>sap.ui.model.Binding</code> itself
	 * @protected
	 */
	Binding.prototype.attachRefresh = function(fnFunction, oListener) {
		this.attachEvent("refresh", fnFunction, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:refresh refresh} event of this
	 * <code>sap.ui.model.Binding</code>.
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 */
	Binding.prototype.detachRefresh = function(fnFunction, oListener) {
		this.detachEvent("refresh", fnFunction, oListener);
	};

	/**
	 * Fires event {@link #event:refresh refresh} to attached listeners.
	 * @param {object} [oParameters] the arguments to pass along with the event.
	 * @private
	 */
	Binding.prototype._fireRefresh = function(oParameters) {
		this.fireEvent("refresh", oParameters);
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
	 * @returns {boolean} Whether binding is suspended
	 * @public
	 */
	Binding.prototype.isSuspended = function() {
		return this.bSuspended;
	};

	/**
	 * Resumes the binding update. Change events will be fired again.
	 *
	 * When the binding is resumed, a change event will be fired immediately, if the data has changed while the binding
	 * was suspended. For server-side models, a request to the server will be triggered, if a refresh was requested
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

	/**
	 * Checks whether an update of the data state of this binding is required.
	 *
	 * @param {map} mPaths A Map of paths to check if update needed
	 * @private
	 */
	Binding.prototype.checkDataState = function(mPaths) {
		var sResolvedPath = this.oModel ? this.oModel.resolve(this.sPath, this.oContext) : null;
		this._checkDataState(sResolvedPath, mPaths);
	};

	/**
	 * Checks whether an update of the data state of this binding is required with the given path.
	 *
	 * @param {string} sResolvedPath With help of the connected model resolved path
	 * @param {map} mPaths A Map of paths to check if update needed
	 * @private
	 */
	Binding.prototype._checkDataState = function(sResolvedPath, mPaths) {
		if (!mPaths || sResolvedPath && sResolvedPath in mPaths) {
			var that = this;
			var oDataState = this.getDataState();

			var fireChange = function() {
				that.fireEvent("AggregatedDataStateChange", { dataState: oDataState });
				oDataState.changed(false);
				that.bFiredAsync = false;
			};

			this._checkDataStateMessages(oDataState, sResolvedPath);

			if (oDataState && oDataState.changed()) {
				if (this.mEventRegistry["DataStateChange"]) {
					this.fireEvent("DataStateChange", { dataState: oDataState });
				}
				if (this.bIsBeingDestroyed) {
					fireChange();
				} else if (this.mEventRegistry["AggregatedDataStateChange"] && !this.bFiredAsync) {
					fireDataStateChangeAsync(fireChange);
					this.bFiredAsync = true;
				}
			}
		}
	};

	/**
	 * Check for Messages and set them to the DataState.
	 *
	 * @param {sap.ui.model.DataState} oDataState The DataState of the binding.
	 * @param {string} sResolvedPath The resolved binding path.
	 */
	Binding.prototype._checkDataStateMessages = function(oDataState, sResolvedPath) {
		if (sResolvedPath) {
			oDataState.setModelMessages(this.oModel.getMessagesByPath(sResolvedPath));
		}
	};

	function fireDataStateChangeAsync(callback) {
		if (!timeout) {
			timeout = setTimeout(function() {
				timeout = undefined;
				var aCallbacksCopy = aDataStateCallbacks;
				aDataStateCallbacks = [];
				aCallbacksCopy.forEach(function(cb) {
					cb();
				});
			}, 0);
		}
		aDataStateCallbacks.push(callback);
	}

	return Binding;

});