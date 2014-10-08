/*!
 * ${copyright}
 */

// Provides an abstraction for model bindings
sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', './ChangeReason'],
	function(jQuery, EventProvider, ChangeReason) {
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
	 * @param {sap.ui.model.Model} the model
	 * @param {String} sPath the path
	 * @param {sap.ui.model.Context} oContext the context object
	 * @param {object} [mParameters]
	 * @abstract
	 * @public
	 * @name sap.ui.model.Binding
	 */
	var Binding = EventProvider.extend("sap.ui.model.Binding", /** @lends sap.ui.model.Binding.prototype */ {
		
		constructor : function(oModel, sPath, oContext, mParameters){
			EventProvider.apply(this);
			
			this.oModel = oModel;
			this.bRelative = !jQuery.sap.startsWith(sPath,'/');
			this.sPath = sPath;
			this.oContext = oContext;
			this.mParameters = mParameters;
			this.bInitial = false;
			this.bSuspended = false;
		},
	
		metadata : {
			"abstract" : true,
			publicMethods : [
				// methods
				"getPath", "getContext", "getModel", "attachChange", "detachChange", "refresh", "isInitial","attachDataRequested","detachDataRequested","attachDataReceived","detachDataReceived","suspend","resume"]
		}
	
	});
	
	/**
	 * Creates a new subclass of class sap.ui.model.Binding with name <code>sClassName</code> 
	 * and enriches it with the information contained in <code>oClassInfo</code>.
	 * 
	 * For a detailed description of <code>oClassInfo</code> or <code>FNMetaImpl</code> 
	 * see {@link sap.ui.base.Object.extend Object.extend}.
	 *   
	 * @param {string} sClassName name of the class to be created
	 * @param {object} [oClassInfo] object literal with informations about the class  
	 * @param {function} [FNMetaImpl] alternative constructor for a metadata object
	 * @return {function} the created class / constructor function
	 * @public
	 * @static
	 * @name sap.ui.model.Binding.extend
	 * @function
	 */
	
	// Getter
	/**
	 * Getter for path
	 * @return {String} the binding path
	 * @name sap.ui.model.Binding#getPath
	 * @function
	 */
	Binding.prototype.getPath = function() {
		return this.sPath;
	};
	
	/**
	 * Getter for context
	 * @return {Object} the context object
	 * @name sap.ui.model.Binding#getContext
	 * @function
	 */
	Binding.prototype.getContext = function() {
		return this.oContext;
	};
	
	/**
	 * Setter for context
	 * @param {Object} oContext the new context object
	 * @name sap.ui.model.Binding#setContext
	 * @function
	 */
	Binding.prototype.setContext = function(oContext) {
		if (this.oContext != oContext) {
			this.oContext = oContext;
			this._fireChange();
		}
	};
	
	/**
	 * Getter for model
	 * @return {sap.ui.core.Model} the model
	 * @name sap.ui.model.Binding#getModel
	 * @function
	 */
	Binding.prototype.getModel = function() {
		return this.oModel;
	};
	
	// Eventing and related
	/**
	 * Attach event-handler <code>fnFunction</code> to the 'change' event of this <code>sap.ui.model.Model</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 * @name sap.ui.model.Binding#attachChange
	 * @function
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
	 * @protected
	 * @name sap.ui.model.Binding#detachChange
	 * @function
	 */
	Binding.prototype.detachChange = function(fnFunction, oListener) {
		this.detachEvent("change", fnFunction, oListener);
		if (!this.hasListeners("change")) {
			this.oModel.removeBinding(this);
		}
	};
	
	/**
	 * Fire event change to attached listeners.
	
	 * @param {Map}
	 *         mArguments the arguments to pass along with the event.
	 * @private
	 * @name sap.ui.model.Binding#_fireChange
	 * @function
	 */
	Binding.prototype._fireChange = function(mArguments) {
		this.fireEvent("change", mArguments);
	};
	
	/**
	 * Attach event-handler <code>fnFunction</code> to the 'dataRequested' event of this <code>sap.ui.model.Binding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @public
	 * @name sap.ui.model.Binding#attachDataRequested
	 * @function
	 */
	Binding.prototype.attachDataRequested = function(fnFunction, oListener) {
		this.attachEvent("dataRequested", fnFunction, oListener);
	};
	
	/**
	 * Detach event-handler <code>fnFunction</code> from the 'dataRequested' event of this <code>sap.ui.model.Binding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @public
	 * @name sap.ui.model.Binding#detachDataRequested
	 * @function
	 */
	Binding.prototype.detachDataRequested = function(fnFunction, oListener) {
		this.detachEvent("dataRequested", fnFunction, oListener);
	};
	
	/**
	 * Fire event dataRequested to attached listeners.
	
	 * @param {Map} mArguments the arguments to pass along with the event.
	 * @protected
	 * @name sap.ui.model.Binding#fireDataRequested
	 * @function
	 */
	Binding.prototype.fireDataRequested = function(mArguments) {
		this.fireEvent("dataRequested", mArguments);
	};
	
	/**
	 * Attach event-handler <code>fnFunction</code> to the 'dataReceived' event of this <code>sap.ui.model.Binding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @public
	 * @name sap.ui.model.Binding#attachDataReceived
	 * @function
	 */
	Binding.prototype.attachDataReceived = function(fnFunction, oListener) {
		this.attachEvent("dataReceived", fnFunction, oListener);
	};
	
	/**
	 * Detach event-handler <code>fnFunction</code> from the 'dataReceived' event of this <code>sap.ui.model.Binding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @public
	 * @name sap.ui.model.Binding#detachDataReceived
	 * @function
	 */
	Binding.prototype.detachDataReceived = function(fnFunction, oListener) {
		this.detachEvent("dataReceived", fnFunction, oListener);
	};
	
	/**
	 * Fire event dataReceived to attached listeners.
	
	 * @param {Map} mArguments the arguments to pass along with the event.
	 * @protected
	 * @name sap.ui.model.Binding#fireDataReceived
	 * @function
	 */
	Binding.prototype.fireDataReceived = function(mArguments) {
		this.fireEvent("dataReceived", mArguments);
	};
	
	/**
	 * Determines if the binding should be updated by comparing the current model against a specified model.
	 * @param {object} oModel The model instance to compare against
	 * @returns {boolean} true if this binding should be updated
	 * @protected
	 * @name sap.ui.model.Binding#updateRequired
	 * @function
	 */
	Binding.prototype.updateRequired = function(oModel) {
		return oModel && this.getModel() === oModel;
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
	 * @name sap.ui.model.Binding#checkUpdate
	 * @function
	 */
	Binding.prototype.checkUpdate = function(bForceUpdate) {
		if (!this.bSuspended) {
			this._fireChange({reason: ChangeReason.Change});
		}
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
	 * @name sap.ui.model.Binding#refresh
	 * @function
	 */
	Binding.prototype.refresh = function(bForceUpdate) {
		this.checkUpdate(bForceUpdate);
	};
	
	/**
	 * Initialize the binding. The message should be called when creating a binding.
	 * The default implementation calls checkUpdate(true). 
	 * 
	 * @protected
	 * @name sap.ui.model.Binding#initialize
	 * @function
	 */
	Binding.prototype.initialize = function() {
		this.checkUpdate(true);
		return this;
	};
	
	/**
	 * _refresh for compatibility
	 * @private
	 * @name sap.ui.model.Binding#_refresh
	 * @function
	 */
	Binding.prototype._refresh = function() {
		this.refresh();
	};
	
	
	/**
	 * Returns whether the binding is initial, which means it did not get an initial value yet
	 * @return {boolean} whether binding is initial
	 * @public
	 * @name sap.ui.model.Binding#isInitial
	 * @function
	 */
	Binding.prototype.isInitial = function() {
		return this.bInitial;
	};
	
	/**
	 * Returns whether the binding is relative, which means it did not start with a /
	 * @return {boolean} whether binding is relative
	 * @public
	 * @name sap.ui.model.Binding#isRelative
	 * @function
	 */
	Binding.prototype.isRelative = function() {
		return this.bRelative;
	};
	
	/**
	 * Attach multiple events.
	 *
	 * @param {object} oEvents
	 * @protected
	 * @name sap.ui.model.Binding#attachEvents
	 * @function
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
	 * Detach multiple events-
	 *
	 * @param {object} oEvents
	 * @protected
	 * @name sap.ui.model.Binding#detachEvents
	 * @function
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
	 * @name sap.ui.model.Binding#attachRefresh
	 * @function
	 */
	Binding.prototype.attachRefresh = function(fnFunction, oListener) {
		this.attachEvent("refresh", fnFunction, oListener);
	};
	
	/**
	 * Detach event-handler <code>fnFunction</code> from the 'refresh' event of this <code>sap.ui.model.Binding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 * @name sap.ui.model.Binding#detachRefresh
	 * @function
	 */
	Binding.prototype.detachRefresh = function(fnFunction, oListener) {
		this.detachEvent("refresh", fnFunction, oListener);
	};
	
	/**
	 * Fire event refresh to attached listeners.
	 * @param {Map} [mArguments] the arguments to pass along with the event.
	 * @private
	 * @name sap.ui.model.Binding#_fireRefresh
	 * @function
	 */
	Binding.prototype._fireRefresh = function(mArguments) {
		this.fireEvent("refresh", mArguments);
	};
	
	/**
	 * Suspends the binding update. No change Events will be fired
	 */
	Binding.prototype.suspend = function() {
		this.bSuspended = true;
	};
	
	/**
	 * Resumes the binding update. Change events will be fired again.
	 */
	Binding.prototype.resume = function() {
		this.bSuspended = false;
		this.checkUpdate();
	};

	return Binding;

}, /* bExport= */ true);
