/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define([
	'sap/ui/core/message/MessageProcessor',
	'./BindingMode',
	'./Context',
	'./Filter',
	"sap/base/util/deepEqual",
	"sap/base/util/each"
],
	function(MessageProcessor, BindingMode, Context, Filter, deepEqual, each) {
	"use strict";


	/**
	 * The SAPUI5 Data Binding API.
	 *
	 * The default binding mode for model implementations (if not implemented otherwise) is two way and the supported binding modes by the model
	 * are one way, two way and one time. The default binding mode can be changed by the application for each model instance.
	 * A model implementation should specify its supported binding modes and set the default binding mode accordingly
	 * (e.g. if the model supports only one way binding the default binding mode should also be set to one way).
	 *
	 * The default size limit for models is 100. The size limit determines the number of entries used for the list bindings.
	 *
	 *
	 * @namespace
	 * @name sap.ui.model
	 * @public
	 */

	/**
	 * Constructor for a new Model.
	 *
	 * Every Model is a MessageProcessor that is able to handle Messages with the normal binding path syntax in the target.
	 *
	 * @class
	 * This is an abstract base class for model objects.
	 * @abstract
	 *
	 * @extends sap.ui.core.message.MessageProcessor
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.model.Model
	 */
	var Model = MessageProcessor.extend("sap.ui.model.Model", /** @lends sap.ui.model.Model.prototype */ {

		constructor : function () {
			MessageProcessor.apply(this, arguments);

			// active bindings, i.e. bindings with an attached change handler, see
			// Binding#attachChange
			this.aBindings = [];
			// bindings to be removed after a timeout
			this.aBindingsToRemove = [];
			// maps the absolute binding path to a context instance
			this.mContexts = {};
			// the data
			this.oData = {};
			// the default binding mode
			this.sDefaultBindingMode = BindingMode.TwoWay;
			// whether this model is destroyed
			this.bDestroyed = false;
			// whether to use the legacy path syntax handling
			this.bLegacySyntax = false;
			// maps a resolved binding path to an array of sap.ui.core.message.Message
			this.mMessages = {};
			// the id of the timeout for removing bindings
			this.sRemoveTimer = null;
			// the model's size limit
			this.iSizeLimit = 100;
			// maps a sap.ui.model.BindingMode to true if the binding mode is supported
			this.mSupportedBindingModes = {"OneWay" : true, "TwoWay" : true, "OneTime" : true};
			// maps a sap.ui.model.FilterOperator to true if the filter operator is not supported
			this.mUnsupportedFilterOperators = {};
			// the id of the timeout for calling #checkUpdate
			this.sUpdateTimer = null;
		},

		metadata : {
			"abstract" : true,
			publicMethods : [
				// methods
				"bindProperty", "bindList", "bindTree", "bindContext", "createBindingContext", "destroyBindingContext", "getProperty",
				"getDefaultBindingMode", "setDefaultBindingMode", "isBindingModeSupported", "attachParseError", "detachParseError",
				"attachRequestCompleted", "detachRequestCompleted", "attachRequestFailed", "detachRequestFailed", "attachRequestSent",
				"detachRequestSent", "attachPropertyChange", "detachPropertyChange", "setSizeLimit", "refresh", "isList", "getObject"
			]
			/* the following would save code, but requires the new ManagedObject (1.9.1)
			, events : {
				"parseError" : {},
				"requestFailed" : {},
				"requestSent" : {},
				"requestCompleted" ; {}
			}
			*/
		}
	});


	/**
	 * Map of event names, that are provided by the model.
	 */
	Model.M_EVENTS = {
		/**
		 * Depending on the model implementation a ParseError should be fired if a parse error occurred.
		 * Contains the parameters:
		 * errorCode, url, reason, srcText, line, linepos, filepos
		 */
		ParseError : "parseError",

		/**
		 * Depending on the model implementation a RequestFailed should be fired if a request to a backend failed.
		 * Contains the parameters:
		 * message, statusCode, statusText and responseText
		 *
		 */
		RequestFailed : "requestFailed",

		/**
		 * Depending on the model implementation a RequestSent should be fired when a request to a backend is sent.
		 * Contains Parameters: url, type, async, info (<strong>deprecated</strong>), infoObject
		 *
		 */
		RequestSent : "requestSent",

		/**
		 * Depending on the model implementation a RequestCompleted should be fired when a request to a backend is completed regardless if the request failed or succeeded.
		 * Contains Parameters: url, type, async, info (<strong>deprecated</strong>), infoObject, success, errorobject
		 *
		 */
		RequestCompleted : "requestCompleted",

		/**
		 * Event is fired when changes occur to a property value in the model. The event contains a reason parameter which describes the cause of the property value change.
		 * Currently the event is only fired with reason <code>sap.ui.model.ChangeReason.Binding</code> which is fired when two way changes occur to a value of a property binding.
		 * Contains the parameters:
		 * reason, path, context, value
		 *
		 */
		PropertyChange : "propertyChange"
	};

	/**
	 * The <code>requestFailed</code> event is fired, when data retrieval from a backend failed.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Model#requestFailed
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters

	 * @param {string} oEvent.getParameters.message A text that describes the failure.
	 * @param {string} oEvent.getParameters.statusCode HTTP status code returned by the request (if available)
	 * @param {string} oEvent.getParameters.statusText The status as a text, details not specified, intended only for diagnosis output
	 * @param {string} [oEvent.getParameters.responseText] Response that has been received for the request, as a text string
	 * @public
	 */

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:requestFailed requestFailed} event of this
	 * <code>sap.ui.model.Model</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.Model</code> itself.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with. Defaults to this
	 *            <code>sap.ui.model.Model</code> itself
	 *
	 * @returns {sap.ui.model.Model} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Model.prototype.attachRequestFailed = function(oData, fnFunction, oListener) {
		this.attachEvent("requestFailed", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:requestFailed requestFailed} event of this
	 * <code>sap.ui.model.Model</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {sap.ui.model.Model} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Model.prototype.detachRequestFailed = function(fnFunction, oListener) {
		this.detachEvent("requestFailed", fnFunction, oListener);
		return this;
	};

	/**
	 * Fires event {@link #event:requestFailed requestFailed} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event
	 * @param {string} [oParameters.message]  A text that describes the failure.
	 * @param {string} [oParameters.statusCode]  HTTP status code returned by the request (if available)
	 * @param {string} [oParameters.statusText] The status as a text, details not specified, intended only for diagnosis output
	 * @param {string} [oParameters.responseText] Response that has been received for the request ,as a text string
	 *
	 * @returns {sap.ui.model.Model} Reference to <code>this</code> in order to allow method chaining
	 * @protected
	 */
	Model.prototype.fireRequestFailed = function(oParameters) {
		this.fireEvent("requestFailed", oParameters);
		return this;
	};


	/**
	 * The <code>parseError</code> event is fired when parsing of a model document (e.g. XML response) fails.
	 *
	 * @name sap.ui.model.Model#parseError
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {int} oEvent.getParameters.errorCode
	 * @param {string} oEvent.getParameters.url
	 * @param {string} oEvent.getParameters.reason
	 * @param {string} oEvent.getParameters.srcText
	 * @param {int} oEvent.getParameters.line
	 * @param {int} oEvent.getParameters.linepos
	 * @param {int} oEvent.getParameters.filepos
	 * @public
	 */

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:parseError parseError} event of this
	 * <code>sap.ui.model.Model</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.Model</code> itself.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with. Defaults to this
	 *            <code>sap.ui.model.Model</code> itself.
	 *
	 * @returns {sap.ui.model.Model} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Model.prototype.attachParseError = function(oData, fnFunction, oListener) {
		this.attachEvent("parseError", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:parseError parseError} event of this
	 * <code>sap.ui.model.Model</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {sap.ui.model.Model} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Model.prototype.detachParseError = function(fnFunction, oListener) {
		this.detachEvent("parseError", fnFunction, oListener);
		return this;
	};

	/**
	 * Fires event {@link #event:parseError parseError} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event
	 * @param {int} [oParameters.errorCode]
	 * @param {string} [oParameters.url]
	 * @param {string} [oParameters.reason]
	 * @param {string} [oParameters.srcText]
	 * @param {int} [oParameters.line]
	 * @param {int} [oParameters.linepos]
	 * @param {int} [oParameters.filepos]
	 *
	 * @returns {sap.ui.model.Model} Reference to <code>this</code> in order to allow method chaining
	 * @protected
	 */
	Model.prototype.fireParseError = function(oParameters) {
		this.fireEvent("parseError", oParameters);
		return this;
	};

	/**
	 * The <code>requestSent</code> event is fired, after a request has been sent to a backend.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Model#requestSent
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {string} oEvent.getParameters.url The url which is sent to the backend
	 * @param {string} [oEvent.getParameters.type] The type of the request (if available)
	 * @param {boolean} [oEvent.getParameters.async] If the request is synchronous or asynchronous (if available)
	 * @param {string} [oEvent.getParameters.info] Additional information for the request (if available) <strong>deprecated</strong>
	 * @param {object} [oEvent.getParameters.infoObject] Additional information for the request (if available)
	 * @public
	 */

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:requestSent requestSent} event of this
	 * <code>sap.ui.model.Model</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.Model</code> itself.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with. Defaults to this
	 *            <code>sap.ui.model.Model</code> itself
	 *
	 * @returns {sap.ui.model.Model} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Model.prototype.attachRequestSent = function(oData, fnFunction, oListener) {
		this.attachEvent("requestSent", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:requestSent requestSent} event of this
	 * <code>sap.ui.model.Model</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {sap.ui.model.Model} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Model.prototype.detachRequestSent = function(fnFunction, oListener) {
		this.detachEvent("requestSent", fnFunction, oListener);
		return this;
	};

	/**
	 * Fires event {@link #event:requestSent requestSent} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event
	 * @param {string} [oParameters.url] The url which is sent to the backend.
	 * @param {string} [oParameters.type] The type of the request (if available)
	 * @param {boolean} [oParameters.async] If the request is synchronous or asynchronous (if available)
	 * @param {string} [oParameters.info] additional information for the request (if available) <strong>deprecated</strong>
	 * @param {object} [oParameters.infoObject] Additional information for the request (if available)
	 * @returns {sap.ui.model.Model} Reference to <code>this</code> in order to allow method chaining
	 * @protected
	 */
	Model.prototype.fireRequestSent = function(oParameters) {
		this.fireEvent("requestSent", oParameters);
		return this;
	};

	/**
	 * The <code>requestCompleted</code> event is fired, after a request has been completed (includes receiving
	 * a response), no matter whether the request succeeded or not.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Model#requestCompleted
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {string} oEvent.getParameters.url URL which was sent to the backend
	 * @param {string} [oEvent.getParameters.type] Type of the request (if available)
	 * @param {boolean} oEvent.getParameters.success
	 *                      Whether the request has been successful or not. In case of errors, consult the optional
	 *                      <code>errorobject</code> parameter.
	 * @param {object} [oEvent.getParameters.errorobject]
	 *                      If the request failed the error if any can be accessed in this property.
	 * @param {boolean} [oEvent.getParameters.async]
	 *                      If the request is synchronous or asynchronous (if available)
	 * @param {string} [oEvent.getParameters.info]
	 *                      Additional information for the request (if available) <strong>deprecated</strong>
	 * @param {object} [oEvent.getParameters.infoObject]
	 *                      Additional information for the request (if available)
	 * @public
	 */

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:requestCompleted requestCompleted} event of this
	 * <code>sap.ui.model.Model</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.Model</code> itself.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with. Defaults to this
	 *            <code>sap.ui.model.Model</code> itself
	 *
	 * @returns {sap.ui.model.Model} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Model.prototype.attachRequestCompleted = function(oData, fnFunction, oListener) {
		this.attachEvent("requestCompleted", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:requestCompleted requestCompleted} event of this
	 * <code>sap.ui.model.Model</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {sap.ui.model.Model} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Model.prototype.detachRequestCompleted = function(fnFunction, oListener) {
		this.detachEvent("requestCompleted", fnFunction, oListener);
		return this;
	};

	/**
	 * Fires event {@link #event:requestCompleted requestCompleted} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event
	 * @param {string} [oParameters.url] The url which was sent to the backend.
	 * @param {string} [oParameters.type] The type of the request (if available)
	 * @param {boolean} [oParameters.async] If the request was synchronous or asynchronous (if available)
	 * @param {string} [oParameters.info] additional information for the request (if available) <strong>deprecated</strong>
	 * @param {object} [oParameters.infoObject] Additional information for the request (if available)
	 *
	 * @returns {sap.ui.model.Model} Reference to <code>this</code> in order to allow method chaining
	 * @protected
	 */
	Model.prototype.fireRequestCompleted = function(oParameters) {
		this.fireEvent("requestCompleted", oParameters);
		return this;
	};

	Model.prototype.attachMessageChange = function(oData, fnFunction, oListener) {
		this.attachEvent("messageChange", oData, fnFunction, oListener);
		return this;
	};

	Model.prototype.detachMessageChange = function(fnFunction, oListener) {
		this.detachEvent("messageChange", fnFunction, oListener);
		return this;
	};

	/**
	 * Fires event {@link #event:propertyChange propertyChange} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event
	 * @param {sap.ui.model.ChangeReason} [oParameters.reason] The reason of the property change
	 * @param {string} [oParameters.path] The path of the property
	 * @param {object} [oParameters.context] the context of the property
	 * @param {object} [oParameters.value] the value of the property
	 *
	 * @returns {sap.ui.model.Model} Reference to <code>this</code> in order to allow method chaining
	 * @protected
	 */
	Model.prototype.firePropertyChange = function(oParameters) {
		this.fireEvent("propertyChange", oParameters);
		return this;
	};

	/**
	 * The <code>propertyChange</code> event is fired when changes occur to a property value in the model.
	 *
	 * The event contains a <code>reason</code> parameter which describes the cause of the property value change.
	 * Currently the event is only fired with reason <code>sap.ui.model.ChangeReason.Binding</code> which is fired
	 * when two way changes occur to a value of a property binding.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Model#propertyChange
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {sap.ui.model.ChangeReason} oEvent.getParameters.reason The cause of the property value change
	 * @param {string} oEvent.getParameters.path The path of the property
	 * @param {sap.ui.model.Context} [oEvent.getParameters.context] The binding context (if available)
	 * @param {object} oEvent.getParameters.value The current value of the property
	 * @public
	 */

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:propertyChange propertyChange} event of this
	 * <code>sap.ui.model.Model</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.Model</code> itself.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with. Defaults to this
	 *            <code>sap.ui.model.Model</code> itself
	 *
	 * @returns {sap.ui.model.Model} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Model.prototype.attachPropertyChange = function(oData, fnFunction, oListener) {
		this.attachEvent("propertyChange", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:propertyChange propertyChange} event of this
	 * <code>sap.ui.model.Model</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {sap.ui.model.Model} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Model.prototype.detachPropertyChange = function(fnFunction, oListener) {
		this.detachEvent("propertyChange", fnFunction, oListener);
		return this;
	};

	// the 'abstract methods' to be implemented by child classes

	/**
	 * Implement in inheriting classes.
	 * @abstract
	 *
	 * @name sap.ui.model.Model.prototype.bindProperty
	 * @function
	 * @param {string}
	 *         sPath the path pointing to the property that should be bound
	 * @param {object}
	 *         [oContext=null] the context object for this databinding (optional)
	 * @param {object}
	 *         [mParameters=null] additional model specific parameters (optional)
	 * @return {sap.ui.model.PropertyBinding}
	 *
	 * @public
	 */

	/**
	 * Implement in inheriting classes.
	 * @abstract
	 *
	 * @name sap.ui.model.Model.prototype.bindList
	 * @function
	 * @param {string}
	 *         sPath the path pointing to the list / array that should be bound
	 * @param {object}
	 *         [oContext=null] the context object for this databinding (optional)
	 * @param {sap.ui.model.Sorter}
	 *         [aSorters=null] initial sort order (can be either a sorter or an array of sorters) (optional)
	 * @param {array}
	 *         [aFilters=null] predefined filter/s (can be either a filter or an array of filters) (optional)
	 * @param {object}
	 *         [mParameters=null] additional model specific parameters (optional)
	 * @return {sap.ui.model.ListBinding}

	 * @public
	 */

	/**
	 * Implement in inheriting classes.
	 * @abstract
	 *
	 * @name sap.ui.model.Model.prototype.bindTree
	 * @function
	 * @param {string}
	 *         sPath the path pointing to the tree / array that should be bound
	 * @param {object}
	 *         [oContext=null] the context object for this databinding (optional)
	 * @param {array}
	 *         [aFilters=null] predefined filter/s contained in an array (optional)
	 * @param {object}
	 *         [mParameters=null] additional model specific parameters (optional)
	 * @param {array}
	 *         [aSorters=null] predefined sap.ui.model.sorter/s contained in an array (optional)
	 * @return {sap.ui.model.TreeBinding}

	 * @public
	 */

	/**
	 * Implement in inheriting classes.
	 * @abstract
	 *
	 * @name sap.ui.model.Model.prototype.createBindingContext
	 * @function
	 * @param {string}
	 *         sPath the path to create the new context from
	 * @param {object}
	 *		   [oContext=null] the context which should be used to create the new binding context
	 * @param {object}
	 *		   [mParameters=null] the parameters used to create the new binding context
	 * @param {function}
	 *         [fnCallBack] the function which should be called after the binding context has been created
	 * @param {boolean}
	 *         [bReload] force reload even if data is already available. For server side models this should
	 *                   refetch the data from the server
	 * @return {sap.ui.model.Context} the binding context, if it could be created synchronously
	 *
	 * @public
	 */

	/**
	 * Implement in inheriting classes.
	 * @abstract
	 *
	 * @name sap.ui.model.Model.prototype.destroyBindingContext
	 * @function
	 * @param {object}
	 *         oContext to destroy

	 * @public
	 */

	/**
	 * Implement in inheriting classes.
	 * @abstract
	 *
	 * @name sap.ui.model.Model.prototype.getProperty
	 * @function
	 * @param {string}
	 *         sPath the path to where to read the attribute value
	 * @param {object}
	 *		   [oContext=null] the context with which the path should be resolved
	 * @public
	 */

	/**
	 * Implement in inheriting classes.
	 * @abstract
	 *
	 * @param {string}
	 *         sPath Path to where to read the object
	 * @param {object}
	 *		   [oContext=null] Context with which the path should be resolved
	 * @param {object}
	 *         [mParameters] Additional model specific parameters
	 * @returns {any} The value for the given path/context or <code>undefined</code> if data could not be found
	 * @public
	 */
	Model.prototype.getObject = function(sPath, oContext, mParameters) {
		return this.getProperty(sPath, oContext, mParameters);
	};


	/**
	 * Create ContextBinding.
	 * @abstract
	 *
	 * @name sap.ui.model.Model.prototype.bindContext
	 * @function
	 * @param {string | object}
	 *         sPath the path pointing to the property that should be bound or an object
	 *         which contains the following parameter properties: path, context, parameters
	 * @param {object}
	 *         [oContext=null] the context object for this databinding (optional)
	 * @param {object}
	 *         [mParameters=null] additional model specific parameters (optional)
	 * @param {object}
	 *         [oEvents=null] event handlers can be passed to the binding ({change:myHandler})
	 * @return {sap.ui.model.ContextBinding}
	 *
	 * @public
	 */

	/**
	 * Gets a binding context. If context already exists, return it from the map,
	 * otherwise create one using the context constructor.
	 *
	 * @param {string} sPath the path
	 */
	Model.prototype.getContext = function(sPath) {
		if (!sPath.startsWith("/")) {
			throw new Error("Path " + sPath + " must start with a / ");
		}
		var oContext = this.mContexts[sPath];
		if (!oContext) {
			oContext = new Context(this, sPath);
			this.mContexts[sPath] = oContext;
		}
		return oContext;
	};

	/**
	 * Resolve the path relative to the given context.
	 *
	 * If a relative path is given (not starting with a '/') but no context,
	 * then the path can't be resolved and undefined is returned.
	 *
	 * For backward compatibility, the behavior of this method can be changed by
	 * setting the 'legacySyntax' property. Then an unresolvable, relative path
	 * is automatically converted into an absolute path.
	 *
	 * @param {string} sPath path to resolve
	 * @param {sap.ui.core.Context} [oContext] context to resolve a relative path against
	 * @return {string} resolved path or undefined
	 */
	Model.prototype.resolve = function(sPath, oContext) {
		var bIsRelative = typeof sPath == "string" && !sPath.startsWith("/"),
			sResolvedPath = sPath,
			sContextPath;
		if (bIsRelative) {
			if (oContext) {
				sContextPath = oContext.getPath();
				sResolvedPath = sContextPath + (sContextPath.endsWith("/") ? "" : "/") + sPath;
			} else {
				sResolvedPath = this.isLegacySyntax() ? "/" + sPath : undefined;
			}
		}
		if (!sPath && oContext) {
			sResolvedPath = oContext.getPath();
		}
		// invariant: path never ends with a slash ... if root is requested we return /
		if (sResolvedPath && sResolvedPath !== "/" && sResolvedPath.endsWith("/")) {
			sResolvedPath = sResolvedPath.substr(0, sResolvedPath.length - 1);
		}
		return sResolvedPath;
	};

	/**
	 * Cleanup bindings.
	 */
	Model.prototype._cleanUpBindings = function() {
		var that = this;
		if (this.sRemoveTimer) {
			this.aBindings = this.aBindings.filter(function(oBinding) {
				return that.aBindingsToRemove.indexOf(oBinding) === -1;
			});
			clearTimeout(this.sRemoveTimer);
			this.sRemoveTimer = null;
			this.aBindingsToRemove = [];
		}
	};

	/**
	 * Add a binding to this model.
	 *
	 * @param {sap.ui.model.Binding} oBinding the binding to be added
	 */
	Model.prototype.addBinding = function(oBinding) {
		this._cleanUpBindings();
		this.aBindings.push(oBinding);
	};

	/**
	 * Returns a copy of all active bindings of the model.
	 *
	 * @return {array} aBindings The active bindings of the model
	 * @private
	 */
	Model.prototype.getBindings = function() {
		this._cleanUpBindings();
		return this.aBindings.slice();
	};

	/**
	 * Remove a binding from the model.
	 *
	 * @param {sap.ui.model.Binding} oBinding The binding to be removed
	 */
	Model.prototype.removeBinding = function(oBinding) {
		this.aBindingsToRemove.push(oBinding);
		if (!this.sRemoveTimer) {
			this.sRemoveTimer = setTimeout(this._cleanUpBindings.bind(this), 0);
		}
	};

	/**
	 * Get the default binding mode for the model.
	 *
	 * @returns {sap.ui.model.BindingMode} Default binding mode of the model
	 *
	 * @public
	 */
	Model.prototype.getDefaultBindingMode = function() {
		return this.sDefaultBindingMode;
	};

	/**
	 * Set the default binding mode for the model.
	 *
	 * If the default binding mode should be changed, this method should be called directly after model instance
	 * creation and before any binding creation. Otherwise it is not guaranteed that the existing bindings will
	 * be updated with the new binding mode.
	 *
	 * @param {sap.ui.model.BindingMode} sMode The default binding mode to set for the model
	 * @returns {sap.ui.model.Model} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Model.prototype.setDefaultBindingMode = function(sMode) {
		if (this.isBindingModeSupported(sMode)) {
			this.sDefaultBindingMode = sMode;
			return this;
		}

		throw new Error("Binding mode " + sMode + " is not supported by this model.", this);
	};

	/**
	 * Check if the specified binding mode is supported by the model.
	 *
	 * @param {sap.ui.model.BindingMode} sMode The binding mode to check
	 *
	 * @public
	 */
	Model.prototype.isBindingModeSupported = function(sMode) {
		return (sMode in this.mSupportedBindingModes);
	};

	/**
	 * Enables legacy path syntax handling.
	 *
	 * This defines, whether relative bindings, which do not have a defined
	 * binding context, should be compatible to earlier releases which means
	 * they are resolved relative to the root element or handled strict and
	 * stay unresolved until a binding context is set.
	 *
	 * @param {boolean} bLegacySyntax The path syntax to use
	 *
	 * @public
	 */
	Model.prototype.setLegacySyntax = function(bLegacySyntax) {
		this.bLegacySyntax = bLegacySyntax;
	};

	/**
	 * Returns whether legacy path syntax is used.
	 *
	 * @return {boolean}
	 *
	 * @public
	 */
	Model.prototype.isLegacySyntax = function() {
		return this.bLegacySyntax;
	};

	/**
	 * Set the maximum number of entries which are used for list bindings.
	 *
	 * The default size limit for models is 100.
	 *
	 * @param {int} iSizeLimit Collection size limit
	 * @public
	 */
	Model.prototype.setSizeLimit = function(iSizeLimit) {
		this.iSizeLimit = iSizeLimit;
	};

	/**
	 * Override getInterface method to avoid creating an Interface object for models.
	 */
	Model.prototype.getInterface = function() {
		return this;
	};

	/**
	 * Refresh the model.
	 *
	 * This will check all bindings for updated data and update the controls if data has been changed.
	 *
	 * @param {boolean} bForceUpdate Update controls even if data has not been changed
	 * @public
	 */
	Model.prototype.refresh = function(bForceUpdate) {
		this.checkUpdate(bForceUpdate);
		if (bForceUpdate) {
			var aMessages = [];
			for (var sKey in this.mMessages) {
				aMessages = aMessages.concat(this.mMessages[sKey]);
			}
			this.fireMessageChange({
				oldMessages: aMessages
			});
		}
	};

	/**
	 * Private method iterating the registered bindings of this model instance and initiating their check for update.
	 * @param {boolean} bForceUpdate
	 * @param {boolean} bAsync
	 * @private
	 */
	Model.prototype.checkUpdate = function(bForceUpdate, bAsync) {
		if (bAsync) {
			if (!this.sUpdateTimer) {
				this.sUpdateTimer = setTimeout(function() {
					this.checkUpdate(bForceUpdate);
				}.bind(this), 0);
			}
			return;
		}
		if (this.sUpdateTimer) {
			clearTimeout(this.sUpdateTimer);
			this.sUpdateTimer = null;
		}
		var aBindings = this.getBindings();
		each(aBindings, function(iIndex, oBinding) {
			oBinding.checkUpdate(bForceUpdate);
		});
	};

	/**
	 * Sets the messages for this model and notifies the bindings if the new messages differ from
	 * the current model messages.
	 *
	 * @param {Object<string,sap.ui.core.message.Message[]>} [mMessages={}]
	 *   The new messages for the model, mapping a binding path to an array of
	 *   {@link sap.ui.core.message.Message} objects
	 *
	 * @public
	 */
	Model.prototype.setMessages = function (mMessages) {
		mMessages = mMessages || {};
		if (!deepEqual(this.mMessages, mMessages)) {
			this.mMessages = mMessages;
			this.checkMessages();
		}
	};

	/**
	 * Returns model messages for which the target matches the given resolved binding path.
	 *
	 * @param {string} sPath
	 *   The resolved binding path
	 * @param {boolean} [bPrefixMatch]
	 *   Whether also messages with a target starting with the given path are returned, not just the
	 *   messages with a target identical to the given path
	 * @returns {sap.ui.core.message.Message[]}
	 *   An array of messages matching the given path; may be empty but not <code>null</code> or
	 *   <code>undefined</code>
	 * @protected
	 */
	Model.prototype.getMessagesByPath = function (sPath, bPrefixMatch) {
		var aMessages,
			that = this;

		if (!bPrefixMatch) {
			return this.mMessages[sPath] || [];
		}

		aMessages = [];
		Object.keys(this.mMessages).forEach(function (sMessagePath) {
			var aMatchingMessages = that.filterMatchingMessages(sMessagePath, sPath);

			if (aMatchingMessages.length) {
				aMessages = aMessages.concat(aMatchingMessages);
			}
		});

		return aMessages;
	};

	/**
	 * Returns an array of messages for the given message target matching the given resolved binding
	 * path prefix.
	 *
	 * @param {string} sMessageTarget
	 *   The messages target used as key in <code>this.mMessages</code>
	 * @param {string} sPathPrefix
	 *   The resolved binding path prefix
	 * @returns {sap.ui.core.message.Message[]}
	 *   The matching message objects, or an empty array, if no messages match.
	 *
	 * @private
	 */
	Model.prototype.filterMatchingMessages = function (sMessageTarget, sPathPrefix) {
		if (sMessageTarget === sPathPrefix
				|| sMessageTarget.startsWith(sPathPrefix === "/" ? sPathPrefix : sPathPrefix + "/")
		) {
			return this.mMessages[sMessageTarget];
		}
		return [];
	};

	/**
	 * Private method iterating the registered bindings of this model instance and initiating their check for messages.
	 * @private
	 */
	Model.prototype.checkMessages = function() {
		each(this.getBindings(), function(iIndex, oBinding) {
			if (oBinding.checkDataState) {
				oBinding.checkDataState();
			}
		});
	};

	/**
	 * Destroys the model and clears the model data.
	 *
	 * A model implementation may override this function and perform model specific cleanup tasks e.g.
	 * abort requests, prevent new requests, etc.
	 *
	 * @see sap.ui.base.Object.prototype.destroy
	 * @public
	 */
	Model.prototype.destroy = function() {
		MessageProcessor.prototype.destroy.apply(this, arguments);

		this.oData = {};
		this.aBindings = [];
		this.mContexts = {};
		if (this.sRemoveTimer) {
			clearTimeout(this.sRemoveTimer);
			this.sRemoveTimer = null;
			this.aBindingsToRemove = [];
		}
		if (this.sUpdateTimer) {
			clearTimeout(this.sUpdateTimer);
			this.sUpdateTimer = null;
		}
		this.bDestroyed = true;
	};

	/**
	 * Returns the meta model associated with this model if it is available for the concrete
	 * model type.
	 * @abstract
	 * @public
	 * @returns {sap.ui.model.MetaModel} The meta model or <code>undefined</code> if no meta model exists.
	 */
	Model.prototype.getMetaModel = function() {
		return undefined;
	};

	/**
	 * Returns the original value for the property with the given path and context.
	 *
	 * The original value is the value that was last responded by a server if using a server model implementation.
	 *
	 * @param {string} sPath Path/name of the property
	 * @param {object} [oContext] Context if available to access the property value
	 * @returns {any} vValue The value of the property
	 * @public
	 */
	Model.prototype.getOriginalProperty = function(sPath, oContext) {
		return this.getProperty(sPath, oContext);
	};

	/**
	 * Returns whether a given path relative to the given contexts is in laundering state.
	 *
	 * If data is sent to the server, the data state becomes laundering until the
	 * data was accepted or rejected
	 *
	 * @param {string} sPath Path to resolve
	 * @param {sap.ui.core.Context} [oContext] Context to resolve a relative path against
	 * @returns {boolean} true if the data in this path is laundering
	 */
	Model.prototype.isLaundering = function(sPath, oContext) {
		return false;
	};

	/**
	 * Checks whether the given filters contain an unsupported operator.
	 *
	 * OData v1, v2 and Client Bindings cannot be filtered with <code>sap.ui.model.FilterOperator</code>s
	 * <code>"Any"</code> and <code>"All"</code>. The model property <code>mUnsupportedFilterOperators</code>
	 * can be configured in each model subclass to describe the unsupported operators.
	 *
	 * If any of the given filters contains nested filters, those are checked recursively.
	 *
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} vFilters Single filter or an array of filter instances
	 * @throws {Error} if at least one filter uses an <code>sap.ui.model.FilterOperator</code>
	 *               that is not supported by the related model instance
	 * @private
	 * @ui5-restricted sap.ui.model
	 */
	Model.prototype.checkFilterOperation = function(vFilters) {
		_traverseFilter(vFilters, function (oFilter) {
			if (this.mUnsupportedFilterOperators[oFilter.sOperator]) {
				throw new Error("Filter instances contain an unsupported FilterOperator: " + oFilter.sOperator);
			}
		}.bind(this));
	};

	/**
	 * Traverses the given filter tree.
	 *
	 * @param {sap.ui.model.Filter[]|sap.ui.model.Filter} vFilters Array of filters or a single filter instance, which will be checked for unsupported filter operators
	 * @param {function} fnCheck Check function which is called for each filter instance in the tree
	 * @private
	 */
	function _traverseFilter (vFilters, fnCheck) {
		vFilters = vFilters || [];

		if (vFilters instanceof Filter) {
			vFilters = [vFilters];
		}

		// filter has more sub-filter instances (we ignore the subfilters below the any/all operators)
		for (var i = 0; i < vFilters.length; i++) {
			// check single Filter
			var oFilter = vFilters[i];
			fnCheck(oFilter);

			// check subfilter for lambda expressions (e.g. Any, All, ...)
			_traverseFilter(oFilter.oCondition, fnCheck);

			// check multi filter if necessary
			_traverseFilter(oFilter.aFilters, fnCheck);
		}
	}

	return Model;

});