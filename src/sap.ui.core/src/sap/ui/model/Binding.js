/*!
 * ${copyright}
 */
/*eslint-disable max-len */
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
	 * @param {sap.ui.model.Model} oModel The model
	 * @param {string} sPath The path
	 * @param {sap.ui.model.Context} [oContext] The context object
	 * @param {object} [mParameters] Additional, implementation-specific parameters
	 * @abstract
	 * @public
	 * @alias sap.ui.model.Binding
	 * @extends sap.ui.base.EventProvider
	 */
	var Binding = EventProvider.extend("sap.ui.model.Binding", /** @lends sap.ui.model.Binding.prototype */ {

		constructor : function (oModel, sPath, oContext, mParameters) {
			EventProvider.apply(this);

			// the binding's model
			this.oModel = oModel;
			// whether the binding is relative
			this.bRelative = !sPath.startsWith('/');
			// the binding's path
			this.sPath = sPath;
			// the binding's context
			this.oContext = oContext;
			// the binding's parameters
			this.mParameters = mParameters;
			// whether the binding is initial
			this.bInitial = false;
			// whether the binding is suspended
			this.bSuspended = false;
			// the binding's data state
			this.oDataState = null;
			// whether this binding does not propagate model messages to the control
			this.bIgnoreMessages = undefined;
			// whether this binding is currently being destroyed, cf. #destroy
			this.bIsBeingDestroyed = undefined;
			// whether this binding has *asynchronously* triggered a data state change event which is not yet
			// fired, cf. #_checkDataState
			this.bFiredAsync = undefined;
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
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can
	 * be omitted.
	 *
	 * @name sap.ui.model.Binding#dataRequested
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 *   The event object
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 *   The object on which the event initially occurred
	 * @param {object} oEvent.getParameters
	 *   Object containing all event parameters
	 * @public
	 */

	/**
	 * The <code>dataReceived</code> event is fired, when data was received from a backend.
	 *
	 * This event may also be fired when an error occurred.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can
	 * be omitted.
	 *
	 * @name sap.ui.model.Binding#dataReceived
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 *   The event object
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 *   The object on which the event initially occurred
	 * @param {object} oEvent.getParameters
	 *   Object containing all event parameters
	 * @param {string} [oEvent.getParameters.data]
	 *   The data received; is <code>undefined</code> in error cases
	 * @public
	 */

	/**
	 * The <code>change</code> event is fired, when the model data are changed. The optional
	 * <code>reason</code> parameter of the event provides a hint where the change came from.
	 *
	 * Note: Subclasses might add additional parameters to the event object.
	 *
	 * @name sap.ui.model.Binding#change
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 *   The event object
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 *   The object on which the event initially occurred
	 * @param {object} oEvent.getParameters
	 *   Object containing all event parameters
	 * @param {string} [oEvent.getParameters.reason]
	 *   A string stating the reason for the data change; some change reasons can be found in
	 *   {@link sap.ui.model.ChangeReason}, but there may be additional reasons specified by a
	 *   specific model implementation
	 * @public
	 */

	/**
	 * The <code>DataStateChange</code> event is fired when the <code>DataState</code> of the
	 * binding has changed.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can
	 * be omitted.
	 *
	 * @name sap.ui.model.Binding#DataStateChange
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 *   The event object
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 *   The object on which the event initially occurred
	 * @param {object} oEvent.getParameters
	 *   Object containing all event parameters
	 * @param {sap.ui.model.DataState} [oEvent.getParameters.dataState]
	 *   The <code>DataState</code> object of the binding
	 * @protected
	 */

	/**
	 * The <code>AggregatedDataStateChange</code> event is fired asynchronously when all
	 * <code>datastateChange</code>s within the actual stack are done.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can
	 * be omitted.
	 *
	 * @name sap.ui.model.Binding#AggregatedDataStateChange
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 *   The event object
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 *   The object on which the event initially occurred
	 * @param {object} oEvent.getParameters
	 *   Object containing all event parameters
	 * @param {sap.ui.model.DataState} [oEvent.getParameters.dataState]
	 *   The <code>DataState</code> object of the binding
	 * @protected
	 */

	// Getter
	/**
	 * Returns the model path to which this binding binds.
	 *
	 * Might be a relative or absolute path. If it is relative, it will be resolved relative
	 * to the context as returned by {@link #getContext}.
	 *
	 * @returns {null|string} Binding path
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
	 * @returns {null|undefined|sap.ui.model.Context} Context object
	 * @public
	 */
	Binding.prototype.getContext = function() {
		return this.oContext;
	};

	/**
	 * Setter for a new context.
	 *
	 * @param {sap.ui.model.Context} oContext
	 *   The new context object
	 * @param {Object<string,any>} [mParameters]
	 *   Additional map of binding specific parameters
	 * @param {string} [mParameters.detailedReason]
	 *   A detailed reason for the {@link #event:change change} event
	 *
	 * @private
	 */
	Binding.prototype.setContext = function (oContext, mParameters) {
		var mChangeParameters;

		if (this.oContext != oContext) {
			var Messaging = sap.ui.require("sap/ui/core/Messaging");
			if (Messaging) {
				Messaging
					.removeMessages(this.getDataState().getControlMessages(), true);
			}
			this.oContext = oContext;
			this.getDataState().reset();
			this.checkDataState();
			mChangeParameters = {reason : ChangeReason.Context};
			if (mParameters && mParameters.detailedReason) {
				mChangeParameters.detailedReason = mParameters.detailedReason;
			}
			this._fireChange(mChangeParameters);
		}
	};

	/**
	 * Returns the data state for this binding.
	 * @returns {sap.ui.model.DataState} The data state
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
	 * @returns {null|sap.ui.model.Model} Model to which this binding belongs
	 * @public
	 */
	Binding.prototype.getModel = function() {
		return this.oModel;
	};

	/**
	 * Provides the resolved path for this binding's path and context and returns it, or
	 * <code>undefined</code> if the binding is not resolved or has no model.
	 *
	 * @returns {string|undefined} The resolved path
	 *
	 * @public
	 * @since 1.88.0
	 */
	Binding.prototype.getResolvedPath = function () {
		return this.oModel ? this.oModel.resolve(this.sPath, this.oContext) : undefined;
	};

	/**
	 * Whether this binding does not propagate model messages to the control. By default, all
	 * bindings propagate messages. If a binding wants to support this feature, it has to override
	 * {@link #supportsIgnoreMessages}, which returns <code>true</code>.
	 *
	 * For example, a binding for a currency code is used in a composite binding for rendering the
	 * proper number of decimals, but the currency code is not displayed in the attached control. In
	 * that case, messages for the currency code shall not be displayed at that control, only
	 * messages for the amount.
	 *
	 * @returns {boolean|undefined}
	 *   Whether this binding does not propagate model messages to the control; returns
	 *   <code>undefined</code> if the corresponding binding parameter is not set, which means that
	 *   model messages are propagated to the control
	 *
	 * @public
	 * @since 1.82.0
	 */
	Binding.prototype.getIgnoreMessages = function () {
		if (this.bIgnoreMessages === undefined) {
			return undefined;
		}
		return this.bIgnoreMessages && this.supportsIgnoreMessages();
	};

	/**
	 * Sets the indicator whether this binding does not propagate model messages to the control.
	 *
	 * @param {boolean} bIgnoreMessages
	 *   Whether this binding does not propagate model messages to the control
	 *
	 * @public
	 * @see #getIgnoreMessages
	 * @see #supportsIgnoreMessages
	 * @since 1.82.0
	 */
	Binding.prototype.setIgnoreMessages = function (bIgnoreMessages) {
		this.bIgnoreMessages = bIgnoreMessages;
	};

	/**
	 * Whether this binding supports the feature of not propagating model messages to the control.
	 * The default implementation returns <code>false</code>.
	 *
	 * @returns {boolean}
	 *   <code>false</code>; subclasses that support this feature need to override this function and
	 *   need to return <code>true</code>
	 *
	 * @public
	 * @see #getIgnoreMessages
	 * @see #setIgnoreMessages
	 * @since 1.82.0
	 */
	Binding.prototype.supportsIgnoreMessages = function () {
		return false;
	};

	// Eventing and related
	/**
	 * Attaches the <code>fnFunction</code> event handler to the {@link #event:change change} event
	 * of this <code>sap.ui.model.Model</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to
	 * <code>oListener</code> if specified, otherwise it will be bound to this
	 * <code>sap.ui.model.Binding</code> itself.
	 *
	 * @param {function} fnFunction
	 *   The function to be called when the event occurs
	 * @param {object} [oListener]
	 *   Context object to call the event handler with; defaults to this
	 *   <code>sap.ui.model.Binding</code> itself
	 * @public
	 */
	Binding.prototype.attachChange = function(fnFunction, oListener) {
		if (!this.hasListeners("change")) {
			this.oModel.addBinding(this);
		}
		this.attachEvent("change", fnFunction, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:change change} event of
	 * this <code>sap.ui.model.Binding</code>.
	 *
	 * @param {function} fnFunction Function to be called when the event occurs
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
	 * Attaches the <code>fnFunction</code> event handler to the
	 * {@link #event:DataStateChange DataStateChange} event of thi
	 * <code>sap.ui.model.Binding</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to
	 * <code>oListener</code> if specified, otherwise it will be bound to this
	 * <code>sap.ui.model.Binding</code> itself.
	 *
	 * @param {function} fnFunction
	 *   Function to be called when the event occurs
	 * @param {object} [oListener]
	 *   Context object to call the event handler with; defaults to this
	 *   <code>sap.ui.model.Binding</code> itself
	 * @protected
	 */
	Binding.prototype.attachDataStateChange = function(fnFunction, oListener) {
		this.attachEvent("DataStateChange", fnFunction, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the
	 * {@link #event:DataStateChange DataStateChange} event of this
	 * <code>sap.ui.model.Binding</code>.
	 *
	 * @param {function} fnFunction The function to be called when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @protected
	 */
	Binding.prototype.detachDataStateChange = function(fnFunction, oListener) {
		this.detachEvent("DataStateChange", fnFunction, oListener);
	};

	/**
	 * Attaches event handler <code>fnFunction</code> to the
	 * {@link #event:AggregatedDataStateChange AggregatedDataStateChange} event of this
	 * <code>sap.ui.model.Binding</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to
	 * <code>oListener</code> if specified, otherwise it will be bound to this
	 * <code>sap.ui.model.Binding</code> itself.
	 *
	 * @param {function} fnFunction
	 *   The function to be called when the event occurs
	 * @param {object} [oListener]
	 *   Context object to call the event handler with; defaults to this
	 *   <code>sap.ui.model.Binding</code> itself
	 * @protected
	 */
	Binding.prototype.attachAggregatedDataStateChange = function(fnFunction, oListener) {
		this.attachEvent("AggregatedDataStateChange", fnFunction, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the
	 * {@link #event:AggregatedDataStateChange AggregatedDataStateChange} event of this
	 * <code>sap.ui.model.Binding</code>.
	 *
	 * @param {function} fnFunction The function to be called when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @protected
	 */
	Binding.prototype.detachAggregatedDataStateChange = function(fnFunction, oListener) {
		this.detachEvent("AggregatedDataStateChange", fnFunction, oListener);
	};

	/**
	 * Fires event {@link #event:change change} to attached listeners.
	 *
	 * @param {object} oParameters Parameters to pass along with the event.
	 * @private
	 */
	Binding.prototype._fireChange = function(oParameters) {
		this.fireEvent("change", oParameters);
	};

	/**
	 * Attaches event handler <code>fnFunction</code> to the
	 * {@link #event:dataRequested dataRequested} event of this <code>sap.ui.model.Binding</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to
	 * <code>oListener</code> if specified, otherwise it will be bound to this
	 * <code>sap.ui.model.Binding</code> itself.
	 *
	 * @param {function} fnFunction
	 *   The function to be called when the event occurs
	 * @param {object} [oListener]
	 *   Context object to call the event handler with; defaults to this
	 *   <code>sap.ui.model.Binding</code> itself
	 * @public
	 */
	Binding.prototype.attachDataRequested = function(fnFunction, oListener) {
		this.attachEvent("dataRequested", fnFunction, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the
	 * {@link #event:dataRequested dataRequested} event of this <code>sap.ui.model.Binding</code>.
	 *
	 * @param {function} fnFunction The function to be called when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @public
	 */
	Binding.prototype.detachDataRequested = function(fnFunction, oListener) {
		this.detachEvent("dataRequested", fnFunction, oListener);
	};

	/**
	 * Fires event {@link #event:dataRequested dataRequested} to attached listeners.
	 *
	 * @param {object} oParameters Parameters to pass along with the event
	 * @protected
	 */
	Binding.prototype.fireDataRequested = function(oParameters) {
		this.fireEvent("dataRequested", oParameters);
	};

	/**
	 * Attaches event handler <code>fnFunction</code> to the
	 * {@link #event:dataReceived dataReceived} event of this <code>sap.ui.model.Binding</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to
	 * <code>oListener</code> if specified, otherwise it will be bound to this
	 * <code>sap.ui.model.Binding</code> itself.
	 *
	 * @param {function} fnFunction
	 *   Function to be called when the event occurs
	 * @param {object} [oListener]
	 *   Context object to call the event handler with; defaults to this
	 *   <code>sap.ui.model.Binding</code> itself
	 * @public
	 */
	Binding.prototype.attachDataReceived = function(fnFunction, oListener) {
		this.attachEvent("dataReceived", fnFunction, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the
	 * {@link #event:dataReceived dataReceived} event of this <code>sap.ui.model.Binding</code>.
	 *
	 * @param {function} fnFunction Function to be called when the event occurs
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
	 * @param {object} oParameters Parameters to pass along with the event
	 * @param {object} [oParameters.data] Data received; on error cases it will be undefined
	 * @protected
	 */
	Binding.prototype.fireDataReceived = function(oParameters) {
		this.fireEvent("dataReceived", oParameters);
	};

	/**
	 * Determines if the binding should be updated by comparing the current model against a
	 * specified model.
	 *
	 * @param {object} oModel The model instance to compare against
	 * @returns {boolean} Whether this binding should be updated
	 * @protected
	 */
	Binding.prototype.updateRequired = function(oModel) {
		return oModel && this.getModel() === oModel;
	};

	/**
	 * Returns whether this binding validates the values that are set on it.
	 *
	 * @returns {boolean}
	 *   Whether the binding throws a validation exception when an invalid value is set on it.
	 * @private
	 */
	Binding.prototype.hasValidation = function() {
		return !!this.getType();
	};

	/**
	 * Checks whether an update of this bindings is required. If this is the case the change event
	 * of the binding is fired. The default implementation just fires the change event when the
	 * method is called. Subclasses should implement this, if possible.
	 *
	 * @param {boolean} [bForceUpdate] Whether the event should be fired when the binding is
	 *   suspended
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
	 * @param {boolean} [bForceUpdate] Update the bound control even if no data has been changed
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
	 *
	 * @param {boolean} [bForceUpdate] Whether an update should be forced
	 * @private
	 */
	Binding.prototype._refresh = function(bForceUpdate) {
		this.refresh(bForceUpdate);
	};

	/**
	 * Returns whether the binding is resolved, which means the binding's path is absolute or the
	 * binding has a model context.
	 *
	 * @returns {boolean} Whether the binding is resolved
	 *
	 * @public
	 * @see #getContext
	 * @see #getPath
	 * @see #isRelative
	 * @since 1.79.0
	 */
	Binding.prototype.isResolved = function() {
		return !this.bRelative || !!this.oContext;
	};

	/**
	 * Returns whether the binding is initial, which means it did not get an initial value yet.
	 *
	 * @returns {boolean} Whether the binding is initial
	 * @public
	 */
	Binding.prototype.isInitial = function() {
		return this.bInitial;
	};

	/**
	 * Returns whether the binding is relative, which means its path does not start with a slash.
	 *
	 * @returns {boolean} Whether the binding is relative
	 * @public
	 */
	Binding.prototype.isRelative = function() {
		return this.bRelative;
	};

	/**
	 * Attach multiple events.
	 *
	 * @param {Object.<string, function>} oEvents Events to attach to this binding
	 * @returns {sap.ui.model.Binding} A reference to itself
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
	 * @param {Object.<string, function>} oEvents Events to detach from this binding
	 * @returns {sap.ui.model.Binding} A reference to itself
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
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:refresh refresh} event of
	 * this <code>sap.ui.model.Binding</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to
	 * <code>oListener</code> if specified, otherwise it will be bound to this
	 * <code>sap.ui.model.Binding</code> itself.
	 *
	 * @param {function} fnFunction
	 *   The function to be called when the event occurs
	 * @param {object} [oListener]
	 *   Context object to call the event handler with; defaults to this
	 *   <code>sap.ui.model.Binding</code> itself
	 * @protected
	 */
	Binding.prototype.attachRefresh = function(fnFunction, oListener) {
		this.attachEvent("refresh", fnFunction, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:refresh refresh} event
	 * of this <code>sap.ui.model.Binding</code>.
	 *
	 * @param {function} fnFunction The function to be called when the event occurs
	 * @param {object} [oListener] Object on which to call the given function.
	 * @protected
	 */
	Binding.prototype.detachRefresh = function(fnFunction, oListener) {
		this.detachEvent("refresh", fnFunction, oListener);
	};

	/**
	 * Fires event {@link #event:refresh refresh} to attached listeners.
	 *
	 * @param {object} [oParameters] The arguments to pass along with the event
	 * @private
	 */
	Binding.prototype._fireRefresh = function(oParameters) {
		this.fireEvent("refresh", oParameters);
	};

	/**
	 * Suspends the binding update. No change events will be fired.
	 *
	 * A refresh call with bForceUpdate set to true will also update the binding and fire a change
	 * in suspended mode. Special operations on bindings, which require updates to work properly
	 * (as paging or filtering in list bindings) will also update and cause a change event although
	 * the binding is suspended.
	 *
	 * @public
	 */
	Binding.prototype.suspend = function() {
		this.bSuspended = true;
	};

	/**
	 * Returns true if the binding is suspended or false if not.
	 *
	 * @returns {boolean} Whether the binding is suspended
	 * @public
	 */
	Binding.prototype.isSuspended = function() {
		return this.bSuspended;
	};

	/**
	 * Resumes the binding update. Change events will be fired again.
	 *
	 * When the binding is resumed, a change event will be fired immediately if the data has
	 * changed while the binding was suspended. For server-side models, a request to the server will
	 * be triggered if a refresh was requested while the binding was suspended.
	 *
	 * @public
	 */
	Binding.prototype.resume = function() {
		this.bSuspended = false;
		this.checkUpdate();
	};

	/**
	 * Removes all control messages for this binding from {@link sap.ui.core.Messaging} in addition
	 * to the standard clean-up tasks.
	 * @see sap.ui.base.EventProvider#destroy
	 *
	 * @public
	 */
	Binding.prototype.destroy = function() {
		var oDataState = this.oDataState;

		if (this.bIsBeingDestroyed) { // avoid endless recursion
			return;
		}
		this.bIsBeingDestroyed = true;

		if (oDataState) {
			var Messaging = sap.ui.require("sap/ui/core/Messaging");
			if (Messaging) {
				Messaging
					.removeMessages(oDataState.getControlMessages(), true);
			}
			oDataState.setModelMessages();
			if (oDataState.changed()) {
				// notify controls synchronously that data state changed
				this.fireEvent("DataStateChange", {dataState : oDataState});
				this.fireEvent("AggregatedDataStateChange", {dataState : oDataState});
			}
			delete this.oDataState;
		}
		EventProvider.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Checks whether an update of the data state of this binding is required.
	 *
	 * @param {map} [mPaths] A Map of paths to check if update needed
	 * @private
	 */
	Binding.prototype.checkDataState = function(mPaths) {
		this._checkDataState(this.getResolvedPath(), mPaths);
	};

	/**
	 * Checks whether an update of the data state of this binding is required with the given path.
	 *
	 * @param {string} sResolvedPath With help of the connected model resolved path
	 * @param {map} [mPaths] A Map of paths to check if update needed
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

			if (!this.getIgnoreMessages()) {
				this._checkDataStateMessages(oDataState, sResolvedPath);
			}

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
	 * Sets the given data state's model messages to the messages for the given resolved path in the
	 * binding's model.
	 *
	 * @param {sap.ui.model.DataState} oDataState The binding's data state
	 * @param {string} [sResolvedPath] The binding's resolved path
	 * @private
	 */
	Binding.prototype._checkDataStateMessages = function(oDataState, sResolvedPath) {
		if (sResolvedPath) {
			oDataState.setModelMessages(this.oModel.getMessagesByPath(sResolvedPath));
		} else {
			oDataState.setModelMessages([]);
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