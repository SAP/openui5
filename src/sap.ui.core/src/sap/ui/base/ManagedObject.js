/*!
 * ${copyright}
 */

// Provides the base class for all objects with managed properties and aggregations.
sap.ui.define([
	"./DataType",
	"./EventProvider",
	"./ManagedObjectMetadata",
	"./Object",
	"./BindingInfo",
	"sap/ui/util/ActivityDetection",
	"sap/ui/util/_enforceNoReturnValue",
	"sap/base/future",
	"sap/base/Log",
	"sap/base/assert",
	"sap/base/util/deepClone",
	"sap/base/util/deepEqual",
	"sap/base/util/uid",
	"sap/base/util/extend",
	"sap/base/util/isEmptyObject"
], function(
	DataType,
	EventProvider,
	ManagedObjectMetadata,
	BaseObject,
	BindingInfo,
	ActivityDetection,
	_enforceNoReturnValue,
	future,
	Log,
	assert,
	deepClone,
	deepEqual,
	uid,
	extend,
	isEmptyObject
) {
	"use strict";

	// shortcut for the sap.ui.core.ID type
	var IDType;

	// Binding info factory symbol
	var BINDING_INFO_FACTORY_SYMBOL = Symbol("bindingInfoFactory");

	/**
	 * Constructs and initializes a managed object with the given <code>sId</code> and settings.
	 *
	 * If the optional <code>mSettings</code> are given, they must be a simple object
	 * that defines values for properties, aggregations, associations or events keyed by their name.
	 *
	 * <b>Valid Names and Value Ranges:</b>
	 *
	 * The property (key) names supported in the object literal are exactly the (case sensitive)
	 * names documented in the JSDoc for the properties, aggregations, associations and events
	 * of the current class and its base classes. Note that for 0..n aggregations and associations this
	 * name usually is the plural name, whereas it is the singular name in case of 0..1 relations.
	 *
	 * The possible values for a setting depend on its kind:
	 * <ul>
	 * <li>for simple properties, the value has to match the documented type of the property (no type conversion occurs)</li>
	 * <li>for 0..1 aggregations, the value has to be an instance of the aggregated type, or an object literal from which,
	 * the default class of the aggregation (or the corresponding aggregation type as fallback) will be instantiated.</li>
	 * <li>for 0..n aggregations, the value has to be an array of instances of the aggregated type, a single instance or
	 * an object literal from which the default class will be instantiated.</li>
	 * <li>for 0..1 associations, an instance of the associated type or an id (string) is accepted</li>
	 * <li>for 0..n associations, an array of instances of the associated type or of IDs is accepted</li>
	 * <li>for events, either a function (event handler) is accepted or an array of length 2
	 *     where the first element is a function and the 2nd element is an object to invoke the method on;
	 *     or an array of length 3, where the first element is an arbitrary payload object, the
	 *     second one is a function and the 3rd one is an object to invoke the method on;
	 *     or an array of arrays where each nested array has the 2 or 3 element structure
	 *     described before (multiple listeners).</li>
	 * </ul>
	 *
	 * Each subclass should document the name and type of its supported settings in its constructor documentation.
	 *
	 * Example usage:
	 * <pre>
	 * new Dialog({
	 *    title: "Some title text",            // property of type "string"
	 *    showHeader: true,                    // property of type "boolean"
	 *    endButton: new Button(...),          // 0..1 aggregation
	 *    content: [                           // 0..n aggregation
	 *       new Input(...),
	 *       new Input(...)
	 *    ],
	 *    afterClose: function(oEvent) { ... } // event handler function
	 * });
	 * </pre>
	 *
	 * Instead of static values and object instances, data binding expressions can be used, either embedded in
	 * a string or as a binding info object as described in {@link #bindProperty} or {@link #bindAggregation}.
	 *
	 * Example usage:
	 * <pre>
	 * new Dialog({
	 *    title: "{/title}",       // embedded binding expression, points to a string property in the data model
	 *    ...
	 *    content: {               // binding info object
	 *       path : "/inputItems", // points to a collection in the data model
	 *       template : new Input(...)
	 *    }
	 * });
	 * </pre>
	 *
	 * Note that when setting string values, any curly braces in those values need to be escaped, so they are not
	 * interpreted as binding expressions. Use {@link #escapeSettingsValue} to do so.
	 *
	 * <b>Note:</b>
	 * As of version 1.120, providing aggregation content via an object literal is deprecated,
	 * in case the object's type is given via the property 'Type' as a string, or is derived via the defined type of the aggregation.
	 * Additionally, as of version 1.120, a ManagedObject subclass can specify a <code>defaultClass</code>, e.g. for cases where only a single class is valid.
	 * Please refer to the {@link sap.ui.base.ManagedObject.MetadataOptions.Aggregation Aggregation} documentation for more details on the
	 * <code>defaultClass</code>.
	 *
	 * Besides the settings documented below, ManagedObject itself supports the following special settings:
	 * <ul>
	 * <li><code>id : <i>sap.ui.core.ID</i></code> an ID for the new instance. Some subclasses (Element, Component) require the id
	 *   to be unique in a specific scope (e.g. an Element Id must be unique across all Elements, a Component id must
	 *   be unique across all Components).
	 * <li><code>models : <i>object</i></code> a map of {@link sap.ui.model.Model} instances keyed by their model name (alias).
	 *   Each entry with key <i>k</i> in this object has the same effect as a call <code>this.setModel(models[k], k);</code>.</li>
	 * <li><code>bindingContexts : <i>object</i></code> a map of {@link sap.ui.model.Context} instances keyed by their model name.
	 *   Each entry with key <i>k</i> in this object has the same effect as a call <code>this.setBindingContext(bindingContexts[k], k);</code></li>
	 * <li><code>objectBindings : <i>object</i></code>  a map of binding paths keyed by the corresponding model name.
	 *   Each entry with key <i>k</i> in this object has the same effect as a call <code>this.bindObject(objectBindings[k], k);</code></li>
	 * <li><code>metadataContexts : <i>object</i></code>  an array of single binding contexts keyed by the corresponding model or context name.
	 *   The purpose of the <code>metadataContexts</code> special setting is to deduce as much information as possible from the binding context of the control in order
	 *   to be able to predefine certain standard properties like e.g. <i>visible, enabled, tooltip,...</i>
	 *
	 *   The structure is an array of single contexts, where a single context is a map containing the following keys:
	 *   <ul>
	 *   <li><code>path: <i>string (mandatory)</i></code> The path to the corresponding model property or object, e.g. '/Customers/Name'. A path can also be relative, e.g. 'Name'</li>
	 *   <li><code>model: <i>string (optional)</i></code> The name of the model, in case there is no name then the undefined model is taken</li>
	 *   <li><code>name: <i>string (optional)</i></code> A name for the context to used in templating phase</li>
	 *   <li><code>kind: <i>string (optional)</i></code> The kind of the adapter, either <code>field</code> for single properties or <code>object</code> for structured contexts.
	 *   <li><code>adapter: <i>string (optional)</i></code> The path to an interpretion class that dilivers control relevant data depending on the context, e.g. enabled, visible.
	 *   If not supplied the OData meta data is interpreted.</li>
	 *   </ul>
	 *   The syntax for providing the <code>metadataContexts</code> is as follows:
	 *   <code>{SINGLE_CONTEXT1},...,{SINGLE_CONTEXTn}</code> or for simplicity in case there is only one context <code>{SINGLE_CONTEXT}</code>.
	 *
	 *   Examples for such metadataContexts are:
	 *   <ul>
	 *   <li><code>{/Customers/Name}</code> a single part with an absolute path to the property <i>Name</i> of the <i>Customers</i> entity set in the default model</li>
	 *   <li><code>{path: 'Customers/Name', model:'json'}</code> a single part with an absolute path to the property <i>Name</i> of the <i>Customers</i> entity set in a named model</li>
	 *   <li><code>{parts: [{path: 'Customers/Name'},{path: 'editable', model: 'viewModel'}]}</code> a combination of single binding contexts, one context from the default model and one from the viewModel</li>
	 *   </ul></li>
	 * </ul>
	 *
	 * @param {string} [sId] ID for the new managed object; generated automatically if no non-empty ID is given
	 *      <b>Note:</b> this can be omitted, no matter whether <code>mSettings</code> will be given or not!
	 * @param {object} [mSettings] Optional map/JSON-object with initial property values, aggregated objects etc. for the new object
	 * @param {object} [oScope] Scope object for resolving string based type and formatter references in bindings.
	 *      When a scope object is given, <code>mSettings</code> cannot be omitted, at least <code>null</code> or an empty object literal must be given.
	 *
	 *
	 * @abstract
	 * @class Base Class that introduces some basic concepts, such as, state management and data binding.
	 *
	 * New subclasses of ManagedObject are created with a call to {@link #.extend ManagedObject.extend} and can make use
	 * of the following managed features:
	 *
	 *
	 * <h3>Properties</h3>
	 * Managed properties represent the state of a ManagedObject. They can store a single value of a simple data type
	 * (like 'string' or 'int'). They have a <i>name</i> (e.g. 'size') and methods to get the current value (<code>getSize</code>),
	 * or to set a new value (<code>setSize</code>). When a property is modified by calling the setter, the ManagedObject is marked as invalidated.
	 * A managed property can be bound against a property in a {@link sap.ui.model.Model} by using the {@link #bindProperty} method.
	 * Updates to the model property will be automatically reflected in the managed property and - if TwoWay databinding is active,
	 * changes to the managed property will be reflected in the model. An existing binding can be removed by calling {@link #unbindProperty}.
	 *
	 * If a ManagedObject is cloned, the clone will have the same values for its managed properties as the source of the
	 * clone - if the property wasn't bound. If it is bound, the property in the clone will be bound to the same
	 * model property as in the source.
	 *
	 * Details about the declaration of a managed property, the metadata that describes it and the set of methods that are automatically
	 * generated to access it, can be found in the documentation of the {@link sap.ui.base.ManagedObject.extend extend } method.
	 *
	 *
	 * <h3>Aggregations</h3>
	 * Managed aggregations can store one or more references to other ManagedObjects. They are a mean to control the lifecycle
	 * of the aggregated objects: one ManagedObject can be aggregated by at most one parent ManagedObject at any time.
	 * When a ManagedObject is destroyed, all aggregated objects are destroyed as well and the object itself is removed from
	 * its parent. That is, aggregations won't contain destroyed objects or null/undefined.
	 *
	 * Aggregations have a <i>name</i> ('e.g 'header' or 'items'), a <i>cardinality</i> ('0..1' or '0..n') and are of a specific
	 * <i>type</i> (which must be a subclass of ManagedObject as well or a UI5 interface). A ManagedObject will provide methods to
	 * set or get the aggregated object for a specific aggregation of cardinality 0..1 (e.g. <code>setHeader</code>, <code>getHeader</code>
	 * for an aggregation named 'header'). For an aggregation of cardinality 0..n, there are methods to get all aggregated objects
	 * (<code>getItems</code>), to locate an object in the aggregation (e.g. <code>indexOfItem</code>), to add, insert or remove
	 * a single aggregated object (<code>addItem</code>, <code>insertItem</code>, <code>removeItem</code>) or to remove or destroy
	 * all objects from an aggregation (<code>removeAllItems</code>, <code>destroyItems</code>).
	 *
	 * Details about the declaration of a managed aggregation, the metadata that describes the aggregation, and the set of methods that are automatically
	 * generated to access it, can be found in the documentation of the {@link sap.ui.base.ManagedObject.extend extend} method.
	 *
	 * Aggregations of cardinality 0..n can be bound to a collection in a model by using {@link #bindAggregation} (and unbound again
	 * using {@link #unbindAggregation}). For each context in the model collection, a corresponding object will be created in the
	 * managed aggregation, either by cloning a template object or by calling a factory function.
	 *
	 * Aggregations also control the databinding context of bound objects: by default, aggregated objects inherit all models
	 * and binding contexts from their parent object.
	 *
	 * When a ManagedObject is cloned, all aggregated objects will be cloned as well - but only if they haven't been added by
	 * databinding. In that case, the aggregation in the clone will be bound to the same model collection.
	 *
	 *
	 * <h3>Associations</h3>
	 * Managed associations also form a relationship between objects, but they don't define a lifecycle for the
	 * associated objects. They even can 'break' in the sense that an associated object might have been destroyed already
	 * although it is still referenced in an association. For the same reason, the internal storage for associations
	 * are not direct object references but only the IDs of the associated target objects.
	 *
	 * Associations have a <i>name</i> ('e.g 'initialFocus'), a <i>cardinality</i> ('0..1' or '0..n') and are of a specific <i>type</i>
	 * (which must be a subclass of ManagedObject as well or a UI5 interface). A ManagedObject will provide methods to set or get
	 * the associated object for a specific association of cardinality 0..1 (e.g. <code>setInitialFocus</code>, <code>getInitialFocus</code>).
	 * For an association of cardinality 0..n, there are methods to get all associated objects (<code>getRefItems</code>),
	 * to add, insert or remove a single associated object (<code>addRefItem</code>,
	 * <code>insertRefItem</code>, <code>removeRefItem</code>) or to remove all objects from an association
	 * (<code>removeAllRefItems</code>).
	 *
	 * Details about the declaration of a managed association, the metadata that describes it and the set of methods that are automatically
	 * generated to access it, can be found in the documentation of the {@link sap.ui.base.ManagedObject.extend extend} method.
	 *
	 * Associations can't be bound to the model.
	 *
	 * When a ManagedObject is cloned, the result for an association depends on the relationship between the associated target
	 * object and the root of the clone operation. If the associated object is part of the to-be-cloned object tree (reachable
	 * via aggregations from the root of the clone operation), then the cloned association will reference the clone of the
	 * associated object. Otherwise the association will reference the same object as in the original tree.
	 * When a ManagedObject is destroyed, other objects that are only associated, are not affected by the destroy operation.
	 *
	 *
	 * <h3>Events</h3>
	 * Managed events provide a mean for communicating important state changes to an arbitrary number of 'interested' listeners.
	 * Events have a <i>name</i> and (optionally) a set of <i>parameters</i>. For each event there will be methods to add or remove an event
	 * listener as well as a method to fire the event. (e.g. <code>attachChange</code>, <code>detachChange</code>, <code>fireChange</code>
	 * for an event named 'change').
	 *
	 * Details about the declaration of managed events, the metadata that describes the event, and the set of methods that are automatically
	 * generated to access it, can be found in the documentation of the {@link sap.ui.base.ManagedObject.extend extend} method.
	 *
	 * When a ManagedObject is cloned, all listeners registered for any event in the clone source are also registered to the
	 * clone. Later changes are not reflected in any direction (neither from source to clone, nor vice versa).
	 *
	 *
	 * <a name="lowlevelapi"><h3>Low Level APIs:</h3></a>
	 * The prototype of ManagedObject provides several generic, low level APIs to manage properties, aggregations, associations,
	 * and events. These generic methods are solely intended for implementing higher level, non-generic methods that manage
	 * a single managed property etc. (e.g. a function <code>setSize(value)</code> that sets a new value for property 'size').
	 * {@link sap.ui.base.ManagedObject.extend} creates default implementations of those higher level APIs for all managed aspects.
	 * The implementation of a subclass then can override those default implementations with a more specific implementation,
	 * e.g. to implement a side effect when a specific property is set or retrieved.
	 * It is therefore important to understand that the generic low-level methods ARE NOT SUITABLE FOR GENERIC ACCESS to the
	 * state of a managed object, as that would bypass the overriding higher level methods and their side effects.
	 *
	 * @extends sap.ui.base.EventProvider
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @alias sap.ui.base.ManagedObject
	 */
	var ManagedObject = EventProvider.extend("sap.ui.base.ManagedObject", {

		metadata : {
			"abstract" : true,

			// UI Library that contains this class
			library : "sap.ui.core",

			properties : {
			},

			aggregations : {
			},

			associations : {},

			events : {
				/**
				 * Fired after a new value for a bound property has been propagated to the model.
				 * Only fired, when the binding uses a data type.
				 */
				"validationSuccess" : {
					enableEventBubbling : true,
					parameters : {
						/**
						 * ManagedObject instance whose property initiated the model update.
						 */
						element : { type : 'sap.ui.base.ManagedObject' },
						/**
						 * Name of the property for which the bound model property has been updated.
						 */
						property : { type : 'string' },
						/**
						 * Data type used in the binding.
						 */
						type : { type : 'sap.ui.model.Type' },
						/**
						 * New value (external representation) as propagated to the model.
						 *
						 * <b>Note: </b>the model might modify (normalize) the value again and this modification
						 * will be stored in the ManagedObject. The 'newValue' parameter of this event contains
						 * the value <b>before</b> such a normalization.
						 */
						newValue : { type : 'any' },
						/**
						 * Old value (external representation) as previously stored in the ManagedObject.
						 */
						oldValue : { type : 'any' }
					}
				},
				/**
				 * Fired when a new value for a bound property should have been propagated to the model,
				 * but validating the value failed with an exception.
				 */
				"validationError" : {
					enableEventBubbling : true,
					parameters : {
						/**
						 * ManagedObject instance whose property initiated the model update.
						 */
						element : { type : 'sap.ui.base.ManagedObject' },
						/**
						 * Name of the property for which the bound model property should have been been updated.
						 */
						property : { type : 'string' },
						/**
						 * Data type used in the binding.
						 */
						type : { type : 'sap.ui.model.Type' },
						/**
						 * New value (external representation) as parsed and validated by the binding.
						 */
						newValue : { type : 'any' },
						/**
						 * Old value (external representation) as previously stored in the ManagedObject.
						 */
						oldValue : { type : 'any' },
						/**
						 * Localized message describing the validation issues
						 */
						message: { type : 'string' }
					}
				},
				/**
				 * Fired when a new value for a bound property should have been propagated to the model,
				 * but parsing the value failed with an exception.
				 */
				"parseError" : {
					enableEventBubbling : true,
					parameters : {
						/**
						 * ManagedObject instance whose property initiated the model update.
						 */
						element : { type : 'sap.ui.base.ManagedObject' },
						/**
						 * Name of the property for which the bound model property should have been been updated.
						 */
						property : { type : 'string' },
						/**
						 * Data type used in the binding.
						 */
						type : { type : 'sap.ui.model.Type' },
						/**
						 * New value (external representation) as parsed by the binding.
						 */
						newValue : { type : 'any' },
						/**
						 * Old value (external representation) as previously stored in the ManagedObject.
						 */
						oldValue : { type : 'any' },
						/**
						 * Localized message describing the parse error
						 */
						message: { type : 'string' }
					}
				},
				/**
				 * Fired when a new value for a bound property should have been propagated from the model,
				 * but formatting the value failed with an exception.
				 */
				"formatError" : {
					enableEventBubbling : true,
					parameters : {
						/**
						 * ManagedObject instance whose property should have received the model update.
						 */
						element : { type : 'sap.ui.base.ManagedObject' },
						/**
						 * Name of the property for which the binding should have been updated.
						 */
						property : { type : 'string' },
						/**
						 * Data type used in the binding (if any).
						 */
						type : { type : 'sap.ui.model.Type' },
						/**
						 * New value (model representation) as propagated from the model.
						 */
						newValue : { type : 'any' },
						/**
						 * Old value (external representation) as previously stored in the ManagedObject.
						 */
						oldValue : { type : 'any' }
					}
				},
				/**
				 * Fired when models or contexts are changed on this object (either by calling setModel/setBindingContext or due to propagation)
				 */
				"modelContextChange" : {}
			},

			specialSettings : {

				/**
				 * Unique ID of this instance.
				 * If not given, a so called autoID will be generated by the framework.
				 * AutoIDs use a unique prefix that must not be used for Ids that the application (or other code) creates.
				 * It can be configured option 'autoIDPrefix', see {@link topic:91f2d03b6f4d1014b6dd926db0e91070 Configuration Options and URL Parameters}.
				 */
				id : 'sap.ui.core.ID',

				/**
				 * A map of model instances to which the object should be attached.
				 * The models are keyed by their model name. For the default model, String(undefined) is expected.
				 */
				models : 'object',

				/**
				 * A map of model instances to which the object should be attached.
				 * The models are keyed by their model name. For the default model, String(undefined) is expected.
				 */
				bindingContexts : 'object',

				/**
				 * A map of model instances to which the object should be attached.
				 * The models are keyed by their model name. For the default model, String(undefined) is expected.
				 */
				objectBindings : 'object',

				/**
				 * A map of model instances to which the object should be attached.
				 * The models are keyed by their model name. For the default model, String(undefined) is expected.
				 * The special setting is only for internal use.
				 */
				metadataContexts: 'object',

				/**
				 * Used by ManagedObject.create.
				 */
				Type : { type: 'string', visibility: 'hidden' }
			}
		},

		constructor : function(sId, mSettings, oScope) {

			EventProvider.call(this); // no use to pass our arguments

			const that = this;

			if ( typeof sId !== 'string' && sId !== undefined ) {
				// shift arguments in case sId was missing, but mSettings was given
				oScope = mSettings;
				mSettings = sId;
				sId = mSettings && mSettings.id;
			}

			if (!sId) {
				sId = this.getMetadata().uid();
			} else {
				var preprocessor = ManagedObject._fnIdPreprocessor;
				sId = (preprocessor ? preprocessor.call(this, sId) : sId);
				var oType = IDType || (IDType = DataType.getType("sap.ui.core.ID"));
				if (!oType.isValid(sId)) {
					throw new Error("\"" + sId + "\" is not a valid ID.");
				}
			}
			this.sId = sId;

			// managed object interface
			// create an empty property bag that uses a map of defaultValues as its prototype
			this.mProperties = this.getMetadata().createPropertyBag();
			this.mAggregations = {};
			this.mAssociations = {};

			// private properties
			this.oParent = null;

			this.aDelegates = [];
			this.aBeforeDelegates = [];
			this.iSuppressInvalidate = 0;
			this.oPropagatedProperties = ManagedObject._oEmptyPropagatedProperties;
			this.mSkipPropagation = {};
			this._bIsOwnerActive = true;

			// data binding
			this.oModels = {};
			this.aPropagationListeners = [];
			this.oBindingContexts = {};
			this.mElementBindingContexts = {};
			this.mBindingInfos = {};
			this.mObjectBindingInfos = {};

			// contextual settings
			this._oContextualSettings = ManagedObject._defaultContextualSettings;

			// apply the owner id if defined
			this._sOwnerId = ManagedObject._sOwnerId;

			// make sure that the object is registered before initializing
			// and to deregister the object in case of errors
			(function() {
				var bCreated = false;

				// registers the object in the Core
				// If registration fails (e.g. due to a duplicate ID), the finally block must not be executed.
				// Otherwise, the already existing object would be deregistered mistakenly
				if (that.register) {
					that.register();
				}

				try {
					// TODO: generic concept for init hooks?
					if ( that._initCompositeSupport ) {
						that._initCompositeSupport(mSettings);
					}

					// Call init method here instead of specific Controls constructor.
					if (that.init) {
						_enforceNoReturnValue(that.init(), /*mLogInfo=*/{ name: "init", component: that.getId()}); // 'init' hook isn't allowed to return any values.
					}

					// apply the settings
					that.applySettings(mSettings, oScope);
					bCreated = true;

					// use try finally here since catch leads to the console pointing to the wrong location of the error
					// (not the original error's location but to this constructor)
				} finally {

					// unregisters the object in the Core
					// the assumption is that the object was successfully registered
					if (!bCreated && that.deregister) {
						that.deregister();
					}

				}

			}());

		}

	}, /* Metadata constructor */ ManagedObjectMetadata);

	// The current BindingParser implementation is exposed via "ManagedObject.bindingParser".
	// This is used in tests for switching the BindingParser implementation on the fly.
	// We delegate any changes to this property back to the BindingInfo.
	Object.defineProperty(ManagedObject, "bindingParser", {
		set: function(v) {
			BindingInfo.parse = v;
		},
		get: function() {
			return BindingInfo.parse;
		}
	});

	function assertModelName(sModelName) {
		assert(sModelName === undefined || (typeof sModelName === "string" && !/^(undefined|null)?$/.test(sModelName)), "sModelName must be a string or omitted");
	}

	// Binding support Marker
	var _bHasBindingSupport = false;

	/**
	 * Checks if the <code>ManagedObjectBindingSupport</code> mixin is introduced
	 * via a model instance.
	 * If so, it is applied to the <code>ManagedObject.prototype</code> once.
	 *
	 * @param {Object<string, sap.ui.model.Model>} mModels a map of models, keyed by the model name.
	 */
	function checkForBindingSupport(mModels) {
		if (!_bHasBindingSupport ) {
			var oModel = Object.values(mModels)[0];
			// In theory an application could pass an object that does not extend from sap.ui.model.Model
			if (oModel && oModel.mixinBindingSupport) {
				oModel.mixinBindingSupport(ManagedObject.prototype);
				_bHasBindingSupport = true;
			}
		}
	}

	/**
	 * Returns the metadata for the ManagedObject class.
	 *
	 * @return {sap.ui.base.ManagedObjectMetadata} Metadata for the ManagedObject class.
	 * @static
	 * @public
	 * @name sap.ui.base.ManagedObject.getMetadata
	 * @function
	 */

	/**
	 * Returns the metadata for the class that this object belongs to.
	 *
	 * @return {sap.ui.base.ManagedObjectMetadata} Metadata for the class of the object
	 * @public
	 * @name sap.ui.base.ManagedObject#getMetadata
	 * @function
	 */

	/**
	 * @typedef {sap.ui.base.Object.MetadataOptions} sap.ui.base.ManagedObject.MetadataOptions
	 *
	 * The structure of the "metadata" object which is passed when inheriting from sap.ui.base.ManagedObject using its static "extend" method.
	 * See {@link sap.ui.base.ManagedObject.extend} for details on its usage.
	 *
	 * @property {string} [library]
	 *     Name of the library that the new subclass should belong to. If the subclass is a control or element, it will
	 *     automatically register with that library so that authoring tools can discover it.
	 *     By convention, the name of the subclass should have the library name as a prefix, but subfolders are allowed,
	 *     e.g. <code>sap.ui.layout.form.Form</code> belongs to library <code>sap.ui.layout</code>.
	 *
	 * @property {Object<string, string | sap.ui.base.ManagedObject.MetadataOptions.Property>} [properties]
	 *     An object literal whose properties each define a new managed property in the ManagedObject subclass.
	 *     The value can either be a simple string which then will be assumed to be the type of the new property or it can be
	 *     an object literal with the following properties (see {@link sap.ui.base.ManagedObject.MetadataOptions.Property Property} for details):
	 *     type, visibility, byValue, group, defaultValue, bindable, selector
	 *     Property names should use camelCase notation, start with a lowercase letter and only use characters from the set [a-zA-Z0-9_$].
	 *     If an aggregation in the literal is preceded by a JSDoc comment (doclet) and if the UI5 plugin and template are used for JSDoc3 generation, the doclet will
	 *     be used as generic documentation of the aggregation.
	 *
	 *     For each public property 'foo', the following methods will be created by the "extend" method and will be added to the
	 *     prototype of the subclass:
	 *     <ul>
	 *     <li>getFoo() - returns the current value of property 'foo'. Internally calls {@link #getProperty}</li>
	 *     <li>setFoo(v) - sets 'v' as the new value of property 'foo'. Internally calls {@link #setProperty}</li>
	 *     <li>bindFoo(c) - (only if property was defined to be 'bindable'): convenience function that wraps {@link #bindProperty}</li>
	 *     <li>unbindFoo() - (only if property was defined to be 'bindable'): convenience function that wraps {@link #unbindProperty}</li>
	 *     </ul>
	 *     For hidden properties, no methods are generated.
	 *
	 * @property {string} [defaultProperty]
	 *     When specified, the default property must match the name of one of the properties defined for the new subclass (either own or inherited).
	 *     The named property can be used to identify the main property to be used for bound data. E.g. the value property of a field control.
	 *
	 * @property {Object<string, string | sap.ui.base.ManagedObject.MetadataOptions.Aggregation>} [aggregations]
	 *     An object literal whose properties each define a new aggregation in the ManagedObject subclass.
	 *     The value can either be a simple string which then will be assumed to be the type of the new aggregation or it can be
	 *     an object literal with the following properties (see {@link sap.ui.base.ManagedObject.MetadataOptions.Aggregation Aggregation} for details):
	 *     type, multiple, singularName, visibility, bindable, forwarding, selector.
	 *     Aggregation names should use camelCase notation, start with a lowercase letter and only use characters from the set [a-zA-Z0-9_$].
	 *     The name for a hidden aggregations might start with an underscore.
	 *     If an aggregation in the literal is preceded by a JSDoc comment (doclet) and if the UI5 plugin and template are used for JSDoc3 generation, the doclet will
	 *     be used as generic documentation of the aggregation.
	 *
	 *     For each public aggregation 'item' of cardinality 0..1, the following methods will be created by the "extend" method and will be added to the
	 *     prototype of the subclass:
	 *     <ul>
	 *     <li>getItem() - returns the current value of aggregation 'item'. Internally calls {@link #getAggregation} with a default value of <code>undefined</code></li>
	 *     <li>setItem(o) - sets 'o' as the new aggregated object in aggregation 'item'. Internally calls {@link #setAggregation}</li>
	 *     <li>destroyItem(o) - destroy a currently aggregated object in aggregation 'item' and clears the aggregation. Internally calls {@link #destroyAggregation}</li>
	 *     <li>bindItem(c) - (only if aggregation was defined to be 'bindable'): convenience function that wraps {@link #bindAggregation}</li>
	 *     <li>unbindItem() - (only if aggregation was defined to be 'bindable'): convenience function that wraps {@link #unbindAggregation}</li>
	 *     </ul>
	 *     For a public aggregation 'items' of cardinality 0..n, the following methods will be created:
	 *     <ul>
	 *     <li>getItems() - returns an array with the objects contained in aggregation 'items'. Internally calls {@link #getAggregation} with a default value of <code>[]</code></li>
	 *     <li>addItem(o) - adds an object as last element in the aggregation 'items'. Internally calls {@link #addAggregation}</li>
	 *     <li>insertItem(o,p) - inserts an object into the aggregation 'items'. Internally calls {@link #insertAggregation}</li>
	 *     <li>indexOfItem(o) - returns the position of the given object within the aggregation 'items'. Internally calls {@link #indexOfAggregation}</li>
	 *     <li>removeItem(v) - removes an object from the aggregation 'items'. Internally calls {@link #removeAggregation}</li>
	 *     <li>removeAllItems() - removes all objects from the aggregation 'items'. Internally calls {@link #removeAllAggregation}</li>
	 *     <li>destroyItems() - destroy all currently aggregated objects in aggregation 'items' and clears the aggregation. Internally calls {@link #destroyAggregation}</li>
	 *     <li>bindItems(c) - (only if aggregation was defined to be 'bindable'): convenience function that wraps {@link #bindAggregation}</li>
	 *     <li>unbindItems() - (only if aggregation was defined to be 'bindable'): convenience function that wraps {@link #unbindAggregation}</li>
	 *     </ul>
	 *     For hidden aggregations, no methods are generated.
	 *
	 * @property {string} [defaultAggregation]
	 *     When specified, the default aggregation must match the name of one of the aggregations defined for the new subclass (either own or inherited).
	 *     The named aggregation will be used in contexts where no aggregation is specified. E,g. when an object in an XMLView embeds other objects without
	 *     naming an aggregation, as in the following example:
	 *     <pre>
	 *      &lt;!-- assuming the defaultAggregation for Dialog is 'content' -->
	 *      &lt;Dialog>
	 *        &lt;Text/>
	 *        &lt;Button/>
	 *      &lt;/Dialog>
	 *     </pre>
	 *
	 * @property {Object<string, string | sap.ui.base.ManagedObject.MetadataOptions.Association>} [associations]
	 *     An object literal whose properties each define a new association of the ManagedObject subclass.
	 *     The value can either be a simple string which then will be assumed to be the type of the new association or it can be
	 *     an object literal with the following properties (see {@link sap.ui.base.ManagedObject.MetadataOptions.Association Association} for details): type, multiple, singularName, visibility
	 *     Association names should use camelCase notation, start with a lowercase letter and only use characters from the set [a-zA-Z0-9_$].
	 *     If an association in the literal is preceded by a JSDoc comment (doclet) and if the UI5 plugin and template are used for JSDoc3 generation, the doclet will
	 *     be used as generic documentation of the association.
	 *
	 *     For each association 'ref' of cardinality 0..1, the following methods will be created by the "extend" method and will be added to the
	 *     prototype of the subclass:
	 *     <ul>
	 *     <li>getRef() - returns the current value of association 'item'. Internally calls {@link #getAssociation} with a default value of <code>undefined</code></li>
	 *     <li>setRef(o) - sets 'o' as the new associated object in association 'item'. Internally calls {@link #setAssociation}</li>
	 *     </ul>
	 *     For a public association 'refs' of cardinality 0..n, the following methods will be created:
	 *     <ul>
	 *     <li>getRefs() - returns an array with the objects contained in association 'items'. Internally calls {@link #getAssociation} with a default value of <code>[]</code></li>
	 *     <li>addRef(o) - adds an object as last element in the association 'items'. Internally calls {@link #addAssociation}</li>
	 *     <li>removeRef(v) - removes an object from the association 'items'. Internally calls {@link #removeAssociation}</li>
	 *     <li>removeAllRefs() - removes all objects from the association 'items'. Internally calls {@link #removeAllAssociation}</li>
	 *     </ul>
	 *     For hidden associations, no methods are generated.
	 *
	 * @property {Object<string, string | sap.ui.base.ManagedObject.MetadataOptions.Event>} [events]
	 *     An object literal whose properties each define a new event of the ManagedObject subclass.
	 *     In this literal, the property names are used as event names and the values are object literals describing the respective event which can have the
	 *     following properties (see {@link sap.ui.base.ManagedObject.MetadataOptions.Event Event} for details): allowPreventDefault, parameters
	 *     Event names should use camelCase notation, start with a lower-case letter and only use characters from the set [a-zA-Z0-9_$].
	 *     If an event in the literal is preceded by a JSDoc comment (doclet) and if the UI5 plugin and template are used for JSDoc3 generation, the doclet will be used
	 *     as generic documentation of the event.
	 *
	 *     For each event 'Some' the following methods will be created by the "extend" method and will be added to the
	 *     prototype of the subclass:
	 *     <ul>
	 *     <li>attachSome(fn,o) - registers a listener for the event. Internally calls {@link #attachEvent}</li>
	 *     <li>detachSome(fn,o) - deregisters a listener for the event. Internally calls {@link #detachEvent}</li>
	 *     <li>fireSome() - fire the event. Internally calls {@link #fireEvent}</li>
	 *     </ul>
	 *
	 * @property {string | boolean} [designtime]
	 *     Name of a module that implements the designtime part. Alternatively <code>true</code> to indicate that the module's file is named *.designtime.js with
	 *     the same base name as the class itself.
	 *
	 * @property {Object<string,any>} [specialSettings] Special settings are an experimental feature and MUST NOT BE DEFINED in controls or applications outside of the <code>sap.ui.core</code> library.
	 *     There's no generic or general way how to set or get the values for special settings. For the same reason, they cannot be bound against a model.
	 *     If there's a way for consumers to define a value for a special setting, it must be documented in the class that introduces the setting.
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.base.ManagedObject.MetadataOptions.Property
	 *
	 * An object literal describing a property of a class derived from <code>sap.ui.base.ManagedObject</code>.
	 * See {@link sap.ui.base.ManagedObject.MetadataOptions MetadataOptions} for details on its usage.
	 *
	 * @property {string} type Type of the new property. Must either be one of the built-in types
	 *     'string', 'boolean', 'int', 'float', 'object', 'function' or 'any', or a type created and registered with
	 *     {@link sap.ui.base.DataType.createType} or an array type based on one of the previous types (e.g. 'int[]'
	 *     or 'string[]', but not just 'array').
	 * @property {"hidden" | "public"} [visibility="public"] Either 'hidden' or 'public', defaults to 'public'. Properties that
	 *     belong to the API of a class must be 'public' whereas 'hidden' properties can only be used internally.
	 *     Only public properties are accepted by the constructor or by <code>applySettings</code> or in declarative
	 *     representations like an <code>XMLView</code>. Equally, only public properties are cloned.
	 * @property {boolean} [byValue=false]
	 *     If set to <code>true</code>, the property value will be {@link module:sap/base/util/deepClone deep cloned}
	 *     on write and read operations to ensure that the internal value can't be modified by the outside. The property
	 *     <code>byValue</code> is currently restricted to a <code>boolean</code> value. Other types are reserved for future
	 *     use. Class definitions must only use boolean values for the flag (or omit it), but readers of ManagedObject
	 *     metadata should handle any truthy value as <code>true</code> to be future safe.
	 *     Note that using <code>byValue:true</code> has a performance impact on property access and therefore should be
	 *     used carefully. It also doesn't make sense to set this option for properties with a primitive type (they have
	 *     value semantic anyhow) or for properties with arrays of primitive types (they are already cloned
	 *     with a less expensive implementation). Defaults to 'false'.
	 * @property {"Accessibility" | "Appearance" | "Behavior" | "Data" | "Designtime" | "Dimension" | "Identification" | "Misc"} [group]
	 *     A semantic grouping of the properties, intended to be used in design time tools.
	 *     Allowed values are (case sensitive): Accessibility, Appearance, Behavior, Data, Designtime, Dimension, Identification, Misc
	 * @property {any} [defaultValue] The default value for the property or null if there is no specific
	 *     default value defined (the data type's default becomes the default value in this case, e.g. <code>false</code> for boolean and
	 *     the empty string for type string). Omitting this property means the default value is <code>undefined</code>.
	 * @property {boolean | "bindable"} [bindable=false] (Either can be omitted or set to the boolean value <code>true</code> or the magic string 'bindable'.)
	 *     If set to <code>true</code> or 'bindable', additional named methods <code>bind<i>Name</i></code> and <code>unbind<i>Name</i></code> are generated as convenience.
	 *     Despite its name, setting this flag is not mandatory to make the managed property bindable. The generic methods {@link #bindProperty} and
	 *     {@link #unbindProperty} can always be used.
	 * @property {string} [selector] Can be set to a valid CSS selector (as accepted by the
	 *     {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector Element.prototype.querySelector}
	 *     method). When set, it locates the DOM element that represents this property's value. It should only be set
	 *     for properties that have a visual text representation in the DOM.
	 *
	 *     The purpose of the selector is to allow other framework parts or design time tooling to identify the DOM parts
	 *     of a control or element that represent a specific property without knowing the control or element implementation
	 *     in detail.
	 *
	 *     As an extension to the standard CSS selector syntax, the selector string can contain the placeholder <code>{id}</code>
	 *     (multiple times). Before evaluating the selector in the context of an element or control, all occurrences of the
	 *     placeholder have to be replaced by the (potentially escaped) ID of that element or control.
	 *     In fact, any selector should start with <code>#{id}</code> to ensure that the query result is limited to the
	 *     desired element or control.
	 *
	 *     <b>Note</b>: there is a convenience method {@link sap.ui.core.Element#getDomRefForSetting} that evaluates the
	 *     selector in the context of a concrete element or control instance. It also handles the placeholder <code>{id}</code>.
	 *     Only selected framework features may use that private method, it is not yet a public API and might be changed
	 *     or removed in future versions of UI5. However, instead of maintaining the <code>selector</code> in the metadata,
	 *     element and control classes can overwrite <code>getDomRefForSetting</code> and determine the DOM element
	 *     dynamically.
	 * @property {boolean} [deprecated=false] Flag that marks the property as deprecated (defaults to false). May lead to an additional warning
	 *     log message at runtime when the property is still used. For the documentation, also add a <code>@deprecated</code> tag in the JSDoc,
	 *     describing since when it is deprecated and what any alternatives are.
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.base.ManagedObject.MetadataOptions.Aggregation
	 *
	 * An object literal describing an aggregation of a class derived from <code>sap.ui.base.ManagedObject</code>.
	 * See {@link sap.ui.base.ManagedObject.MetadataOptions MetadataOptions} for details on its usage.
	 *
	 * @property {string} [type='sap.ui.core.Control'] Type of the new aggregation. Must be the full global name of a ManagedObject subclass
	 *     or a UI5 interface (in dot notation, e.g. 'sap.m.Button').
	 * @property {function} [defaultClass] The default class for the aggregation. If aggregation content is created from a plain object
	 *                                     and no explicit 'Type' is given (capital 'T'), the default class will be instantiated.
	 * @property {boolean} [multiple=true] Whether the aggregation is a 0..1 (false) or a 0..n aggregation (true), defaults to true
	 * @property {string} [singularName] Singular name for 0..n aggregations. For 0..n aggregations the name by convention should be the plural name.
	 *     Methods affecting multiple objects in an aggregation will use the plural name (e.g. getItems(), whereas methods that deal with a single object will use
	 *     the singular name (e.g. addItem). The framework knows a set of common rules for building the plural form of English nouns and uses these rules to determine
	 *     a singular name on its own. If that name is wrong, a singluarName can be specified with this property.
	 * @property {"hidden" | "public"} [visibility="public"] Either 'hidden' or 'public', defaults to 'public'. Aggregations that
	 *     belong to the API of a class must be 'public' whereas 'hidden' aggregations typically are used for the
	 *     implementation of composite classes (e.g. composite controls). Only public aggregations are accepted by
	 *     the constructor or by <code>applySettings</code> or in declarative representations like an <code>XMLView</code>.
	 *     Equally, only public aggregations are cloned.
	 * @property {boolean | "bindable"} [bindable=false] (Either can be omitted or set to the boolean value <code>true</code> or the magic string 'bindable'.)
	 *     If set to <code>true</code> or 'bindable', additional named methods <code>bind<i>Name</i></code> and <code>unbind<i>Name</i></code> are generated as convenience.
	 *     Despite its name, setting this flag is not mandatory to make the managed aggregation bindable. The generic methods {@link #bindAggregation} and
	 *     {@link #unbindAggregation} can always be used.
	 * @property {object} [forwarding]
	 *     If set, this defines a forwarding of objects added to this aggregation into an aggregation of another ManagedObject - typically to an inner control
	 *     within a composite control.
	 *     This means that all adding, removal, or other operations happening on the source aggregation are actually called on the target instance.
	 *     All elements added to the source aggregation will be located at the target aggregation (this means the target instance is their parent).
	 *     Both, source and target element will return the added elements when asked for the content of the respective aggregation.
	 *     If present, the named (non-generic) aggregation methods will be called for the target aggregation.
	 *     Aggregations can only be forwarded to non-hidden aggregations of the same or higher multiplicity (i.e. an aggregation with multiplicity "0..n" cannot be
	 *     forwarded to an aggregation with multiplicity "0..1").
	 *     The target aggregation must also be "compatible" to the source aggregation in the sense that any items given to the source aggregation
	 *     must also be valid in the target aggregation (otherwise the target element will throw a validation error).
	 *     If the forwarded elements use data binding, the target element must be properly aggregated by the source element to make sure all models are available there
	 *     as well.
	 *     The aggregation target must remain the same instance across the entire lifetime of the source control.
	 *     Aggregation forwarding will behave unexpectedly when the content in the target aggregation is modified by other actors (e.g. by the target element or by
	 *     another forwarding from a different source aggregation). Hence, this is not allowed.
	 * @property {string} forwarding.aggregation The name of the aggregation on the target into which the objects shall be forwarded. The multiplicity of the target
	 *     aggregation must be the same as the one of the source aggregation for which forwarding is defined.
	 * @property {string} [forwarding.idSuffix] A string which is appended to the ID of <i>this</i> ManagedObject to construct the ID of the target ManagedObject. This is
	 *     one of the two options to specify the target. This option requires the target instance to be created in the init() method of this ManagedObject and to be
	 *     always available.
	 * @property {string} [forwarding.getter] The name of the function on instances of this ManagedObject which returns the target instance. This second option
	 *     to specify the target can be used for lazy instantiation of the target. Note that either idSuffix or getter must be given. Also note that the target
	 *     instance returned by the getter must remain the same over the entire lifetime of this ManagedObject and the implementation assumes that all instances return
	 *     the same type of object (at least the target aggregation must always be defined in the same class).
	 * @property {boolean} [forwarding.forwardBinding] Whether any binding should happen on the forwarding target or not. Default if omitted is <code>false</code>,
	 *     which means any bindings happen on the outer ManagedObject. When the binding is forwarded, all binding methods like updateAggregation, getBindingInfo,
	 *     refreshAggregation etc. are called on the target element of the forwarding instead of being called on this element. The basic aggregation mutator methods
	 *     (add/remove etc.) are only called on the forwarding target element. Without forwardBinding, they are called on this element, but forwarded to the forwarding
	 *     target, where they actually modify the aggregation.
	 * @property {string} [selector] Can be set to a valid CSS selector (as accepted by the
	 *     {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector Element.prototype.querySelector}
	 *     method). When set, it locates the DOM element that surrounds the aggregation's content. It should only be
	 *     set for aggregations that have a visual representation in the DOM. A DOM element surrounding the aggregation's
	 *     rendered content should be available in the DOM, even if the aggregation is empty or not rendered for some reason.
	 *     In cases where this is not possible or not intended, <code>getDomRefForSetting</code> can be overridden, see below.
	 *
	 *     The purpose of the selector is to allow other framework parts like drag and drop or design time tooling to identify
	 *     those DOM parts of a control or element that represent a specific aggregation without knowing the control or element
	 *     implementation in detail.
	 *
	 *     As an extension to the standard CSS selector syntax, the selector string can contain the placeholder <code>{id}</code>
	 *     (multiple times). Before evaluating the selector in the context of an element or control, all occurrences of the
	 *     placeholder have to be replaced by the (potentially escaped) ID of that element or control.
	 *     In fact, any selector should start with <code>#{id}</code> to ensure that the query result is limited to the
	 *     desired element or control.
	 *
	 *     <b>Note</b>: there is a convenience method {@link sap.ui.core.Element#getDomRefForSetting} that evaluates the
	 *     selector in the context of a concrete element or control instance. It also handles the placeholder <code>{id}</code>.
	 *     Only selected framework features may use that private method, it is not yet a public API and might be changed
	 *     or removed in future versions of UI5. However, instead of maintaining the <code>selector</code> in the metadata,
	 *     element and control classes can overwrite <code>getDomRefForSetting</code> to calculate or add the appropriate
	 *     DOM Element dynamically.
	 * @property {boolean} [deprecated=false] Flag that marks the aggregation as deprecated (defaults to false). May lead to an additional warning
	 *     log message at runtime when the aggregation is still used. For the documentation, also add a <code>@deprecated</code> tag in the JSDoc,
	 *     describing since when it is deprecated and what any alternatives are.
	 * @property {string[]} [altTypes] An optional list of alternative types that may be given instead of the main type. Alternative types
	 *     may only be simple types, no descendants of ManagedObject. An example of altTypes being used is the 'tooltip' aggregation of
	 *     <code>sap.ui.core.Element</code>, which accepts tooltip controls extending <code>sap.ui.core.TooltipBase</code> with their own renderer
	 *     and design, as well as plain strings, which will simply be displayed using the browser's built-in tooltip functionality.
	 * @property {boolean | object} [dnd=false]
	 *     Only available for aggregations of a class extending <code>sap.ui.core.Element</code>, which is a subclass of <code>sap.ui.base.ManagedObject</code>!
	 *     Defines draggable and droppable configuration of the aggregation.
	 *     If the <code>dnd</code> property is of type Boolean, then the <code>draggable</code> and <code>droppable</code> configuration are both set to this Boolean value
	 *     and the layout (in case of enabled dnd) is set to default ("Vertical").
	 * @property {boolean} [dnd.draggable=false] Defines whether elements from this aggregation are draggable or not. The default value is <code>false</code>.
	 * @property {boolean} [dnd.droppable=false] Defines whether the element is droppable (it allows being dropped on by a draggable element) or not. The default value is <code>false</code>.
	 * @property {"Vertical" | "Horizontal"} [dnd.layout="Vertical"]  The arrangement of the items in this aggregation. This setting is recommended for the aggregation with multiplicity 0..n
	 *     (<code>multiple: true</code>). Possible values are <code>Vertical</code> (e.g. rows in a table) and <code>Horizontal</code> (e.g. columns in a table). It is recommended
	 *     to use <code>Horizontal</code> layout if the visual arrangement of the aggregation is two-dimensional.
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.base.ManagedObject.MetadataOptions.Association
	 *
	 * An object literal describing an association of a class derived from <code>sap.ui.base.ManagedObject</code>.
	 * See {@link sap.ui.base.ManagedObject.MetadataOptions MetadataOptions} for details on its usage.
	 *
	 * @property {string} [type='sap.ui.core.Control'] Type of the new association
	 * @property {boolean} [multiple=false] Whether the association is a 0..1 (false) or a 0..n association (true), defaults to false (0..1) for associations
	 * @property {string} [singularName] Custom singular name. This is only relevant for 0..n associations where the association name should be defined in plural form
	 *     and the framework tries to generate the singular form of it for certain places where it is needed. To do so, the framework knows
	 *     a set of common rules for building the plural form of English nouns and uses these rules to determine
	 *     a singular name on its own. If that name is wrong, a singularName can be specified with this property.
	 *     E.g. for an association named <code>items</code>, methods affecting multiple objects in an association will use the plural name (<code>getItems()</code>),
	 *     whereas methods that deal with a single object will automatically use the generated singular name (e.g. <code>addItem(...)</code>). However, the generated
	 *     singular form for an association <code>news</code> would be <code>new</code>, which is wrong, so the singular name "news" would need to be set.
	 * @property {"hidden" | "public"} [visibility="public"] Either 'hidden' or 'public', defaults to 'public'. Associations that
	 *     belong to the API of a class must be 'public' whereas 'hidden' associations can only be used internally.
	 *     Only public associations are accepted by the constructor or by <code>applySettings</code> or in declarative
	 *     representations like an <code>XMLView</code>. Equally, only public associations are cloned.
	 * @property {boolean} [deprecated=false] Flag that marks the association as deprecated (defaults to false). May lead to an additional warning
	 *     log message at runtime when the association is still used. For the documentation, also add a <code>@deprecated</code> tag in the JSDoc,
	 *     describing since when it is deprecated and what any alternatives are.
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.base.ManagedObject.MetadataOptions.Event
	 *
	 * An object literal describing an event of a class derived from <code>sap.ui.base.ManagedObject</code>.
	 * See {@link sap.ui.base.ManagedObject.MetadataOptions MetadataOptions} for details on its usage.
	 *
	 * @property {boolean} [allowPreventDefault] Whether the event allows to prevented the default behavior of the event source
	 * @property {Object<string, {type: string} | string>} [parameters] An object literal that describes the parameters of this event;
	 *     the keys are the parameter names and the values are objects with a 'type' property that specifies the type of the respective parameter.
	 * @property {boolean} [enableEventBubbling=false] whether event bubbling is enabled on this event. When <code>true</code> the event is also forwarded to the parent(s)
	 *     of the object (see {@link sap.ui.base.EventProvider#getEventingParent}) until the bubbling of the event is stopped or no parent is available anymore.
	 * @property {boolean} [deprecated=false] Flag that marks the event as deprecated (defaults to false). May lead to an additional warning
	 *     log message at runtime when the event is still used. For the documentation, also add a <code>@deprecated</code> tag in the JSDoc,
	 *     describing since when it is deprecated and what any alternatives are.
	 *
	 * @public
	 */

	/**
	 * Defines a new subclass of ManagedObject with name <code>sClassName</code> and enriches it with
	 * the information contained in <code>oClassInfo</code>.
	 *
	 * <code>oClassInfo</code> can contain the same information that {@link sap.ui.base.Object.extend} already accepts,
	 * plus the following new properties in the 'metadata' object literal
	 * (see {@link sap.ui.base.ManagedObject.MetadataOptions MetadataOptions} for details on each of them):
	 * <ul>
	 * <li><code>library : <i>string</i></code></li>
	 * <li><code>properties : <i>object</i></code></li>
	 * <li><code>defaultProperty : <i>string</i></code></li>
	 * <li><code>aggregations : <i>object</i></code></li>
	 * <li><code>defaultAggregation : <i>string</i></code></li>
	 * <li><code>associations : <i>object</i></code></li>
	 * <li><code>events : <i>object</i></code></li>
	 * <li><code>specialSettings : <i>object</i></code> // this one is still experimental and not for public usage!</li>
	 * </ul>
	 *
	 *
	 * Example:
	 * <pre>
	 * ManagedObject.extend('sap.mylib.MyClass', {
	 *   metadata : {
	 *     library: 'sap.mylib',
	 *     properties : {
	 *       value: 'string',
	 *       width: 'sap.ui.core.CSSSize',
	 *       height: { type: 'sap.ui.core.CSSSize', defaultValue: '100%'}
	 *       description: { type: 'string', defaultValue: '', selector: '#{id}-desc'}
	 *     },
	 *     defaultProperty : 'value',
	 *     aggregations : {
	 *       header : { type: 'sap.mylib.FancyHeader', multiple : false }
	 *       items : 'sap.ui.core.Control',
	 *       buttons: { type: 'sap.mylib.Button', multiple : true, selector: '#{id} > .sapMLButtonsSection'}
	 *     },
	 *     defaultAggregation : 'items',
	 *     associations : {
	 *       initiallyFocused : { type: 'sap.ui.core.Control' }
	 *     },
	 *     events: {
	 *       beforeOpen : {
	 *         parameters : {
	 *           opener : { type: 'sap.ui.core.Control' }
	 *         }
	 *       }
	 *     },
	 *   },
	 *
	 *   init: function() {
	 *   }
	 *
	 * }); // end of 'extend' call
	 * </pre>
	 *
	 * @param {string} sClassName Name of the class to be created
	 * @param {object} [oClassInfo] Object literal with information about the class
	 * @param {sap.ui.base.ManagedObject.MetadataOptions} [oClassInfo.metadata] The metadata object describing the class: properties, aggregations, events etc.
	 * @param {function} [FNMetaImpl] Constructor function for the metadata object. If not given, it defaults to <code>sap.ui.base.ManagedObjectMetadata</code>.
	 * @return {function} The created class / constructor function
	 *
	 * @public
	 * @static
	 * @name sap.ui.base.ManagedObject.extend
	 * @function
	 */

	/**
	 * Creates a new ManagedObject from the given data.
	 *
	 * If <code>vData</code> is a managed object already, that object is returned.
	 * If <code>vData</code> is an object (literal), then a new object is created with <code>vData</code>
	 * as settings.
	 *
	 * Deprecated usage, in case the type of the object is determined:
	 * <ul>
	 *    <li>by a property of name <code>Type</code> (capital 'T') in the <code>vData</code></li>
	 *    <li>by a property <code>type</code> (lower case 't') in the <code>oKeyInfo</code> object</li>
	 * </ul>
	 *
	 * In both cases, the type must be specified by the dot separated name of the class.
	 *
	 * @param {sap.ui.base.ManagedObject|object} vData
	 *   The data to create the object from. Used as constructor argument.
	 * @param {sap.ui.base.ManagedObject.MetadataOptions.Aggregation} [oKeyInfo]
	 *   Info object for the aggregation to which the created object will be added during an applySettings() call;
	 *   serves as the source for determining the type of the object to be created;
	 *   Please refer to the {@link sap.ui.base.ManagedObject.MetadataOptions.Aggregation} property 'defaultClass'
	 *   for more information.
	 * @param {object} [oScope]
	 *   Scope object to resolve types and formatters in bindings
	 * @returns {sap.ui.base.ManagedObject}
	 *   The newly created <code>ManagedObject</code>
	 * @throws {Error}
	 *   When there's not enough type information to create an instance from the given data
	 * @private
	 */
	function makeObject(vData, oKeyInfo, oScope) {
		if ( !vData || vData instanceof ManagedObject || typeof vData !== "object" || vData instanceof String) {
			return vData;
		}

		let FnClass;

		FnClass ??= oKeyInfo?.defaultClass;

		if ( typeof FnClass === "function" ) {
			return new FnClass(vData, oScope);
		}

		// we don't know how to create the ManagedObject from vData, so fail
		var message = "Don't know how to create a ManagedObject from " + vData + " (" + (typeof vData) + ")";
		Log.fatal(message);
		throw new Error(message);
	}

	/**
	 * A global preprocessor for the ID of a ManagedObject (used internally).
	 *
	 * If set, this function will be called before the ID is applied to any ManagedObject.
	 * If the original ID was empty, the hook will not be called.
	 *
	 * The expected signature is <code>function(sId)</code>, and <code>this</code> will
	 * be the current ManagedObject.
	 *
	 * @type {function(string):string}
	 * @private
	 */
	ManagedObject._fnIdPreprocessor = null;

	/**
	 * A global preprocessor for the settings of a ManagedObject (used internally).
	 *
	 * If set, this function will be called before the settings are applied to any ManagedObject.
	 * If the original settings are empty, the hook will not be called (to be discussed).
	 *
	 * The expected signature is <code>function(mSettings)</code>, and <code>this</code> will
	 * be the current ManagedObject.
	 *
	 * @type {function}
	 * @private
	 */
	ManagedObject._fnSettingsPreprocessor = null;

	/**
	 * Activates the given ID and settings preprocessors, executes the given function
	 * and restores the previously active preprocessors.
	 *
	 * When a preprocessor is not defined in <code>oPreprocessors</code>, then the currently
	 * active preprocessor is temporarily deactivated while <code>fn</code> is executed.
	 *
	 * See the <code>_fnIdPreprocessor</code> and <code>_fnSettingsPreprocessor</code>
	 * members in this class for a detailed description of the preprocessors.
	 *
	 * This method is intended for internal use in the sap/ui/base and sap/ui/core packages only.
	 *
	 * @param {function} fn Function to execute
	 * @param {object} [oPreprocessors] Preprocessors to use while executing <code>fn</code>
	 * @param {function} [oPreprocessors.id] ID preprocessor that can transform the ID of a new ManagedObject
	 * @param {function} [oPreprocessors.settings] Settings preprocessor that can modify settings before they are applied
	 * @param {Object} [oThisArg=undefined] Value to use as <code>this</code> when executing <code>fn</code>
	 * @returns {any} Returns the value that <code>fn</code> returned after execution
	 * @private
	 * @ui5-restricted sap.ui.base,sap.ui.core
	 */
	ManagedObject.runWithPreprocessors = function(fn, oPreprocessors, oThisArg) {
		assert(typeof fn === "function", "fn must be a function");
		assert(!oPreprocessors || typeof oPreprocessors === "object", "oPreprocessors must be an object");

		var oOldPreprocessors = { id : this._fnIdPreprocessor, settings : this._fnSettingsPreprocessor };
		oPreprocessors = oPreprocessors || {};

		this._fnIdPreprocessor = oPreprocessors.id;
		this._fnSettingsPreprocessor = oPreprocessors.settings;

		try {
			return fn.call(oThisArg);
		} finally {
			// always restore old preprocessor settings
			this._fnIdPreprocessor = oOldPreprocessors.id;
			this._fnSettingsPreprocessor = oOldPreprocessors.settings;
		}

	};

	/**
	 * Calls the function <code>fn</code> once and marks all ManagedObjects
	 * created during that call as "owned" by the given ID.
	 *
	 * @param {function} fn Function to execute
	 * @param {string} sOwnerId Id of the owner
	 * @param {Object} [oThisArg=undefined] Value to use as <code>this</code> when executing <code>fn</code>
	 * @return {any} result of function <code>fn</code>
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	ManagedObject.runWithOwner = function(fn, sOwnerId, oThisArg) {

	   assert(typeof fn === "function", "fn must be a function");

	   var oldOwnerId = ManagedObject._sOwnerId;
	   try {
		   ManagedObject._sOwnerId = sOwnerId;
		   return fn.call(oThisArg);
	   } finally {
		   ManagedObject._sOwnerId = oldOwnerId;
	   }

   };

	/**
	 * Sets all the properties, aggregations, associations and event handlers as given in
	 * the object literal <code>mSettings</code>. If a property, aggregation, etc.
	 * is not listed in <code>mSettings</code>, then its value is not changed by this method.
	 *
	 * For properties and 0..1 aggregations/associations, any given setting overwrites
	 * the current value. For 0..n aggregations, the given values are appended; event
	 * listeners are registered in addition to existing ones.
	 *
	 * For the possible keys and values in <code>mSettings</code> see the general
	 * documentation in {@link sap.ui.base.ManagedObject} or the specific documentation
	 * of the constructor of the concrete managed object class.
	 *
	 * @param {object} mSettings the settings to apply to this managed object
	 * @param {object} [oScope] Scope object to resolve types and formatters
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ManagedObject.prototype.applySettings = function(mSettings, oScope) {

		// PERFOPT: don't retrieve (expensive) JSONKeys if no settings are given
		if ( !mSettings || isEmptyObject(mSettings) ) {
			return this;
		}

		var that = this,
			oMetadata = this.getMetadata(),
			mValidKeys = oMetadata.getJSONKeys(), // UID names required, they're part of the documented contract of applySettings
			preprocessor = ManagedObject._fnSettingsPreprocessor,
			sKey, oValue, oKeyInfo;

		// add all given objects to the given aggregation. nested arrays are flattened
		// (might occur e.g. in case of content from an extension point)
		function addAllToAggregation(aObjects) {
			for (var i = 0, len = aObjects.length; i < len; i++) {
				var vObject = aObjects[i];
				if ( Array.isArray(vObject) ) {
					addAllToAggregation(vObject);
				} else {
					that[oKeyInfo._sMutator](makeObject(vObject, oKeyInfo, oScope));
				}
			}
		}

		function attachListener(aArgs) {
			that[oKeyInfo._sMutator](aArgs[0], aArgs[1], aArgs[2]);
		}

		// checks whether given type name has an object/any primitive type
		function isObjectType(sType) {
			var oType = DataType.getType(sType),
				oPrimitiveTypeName = oType && oType.getPrimitiveType().getName();
			return oPrimitiveTypeName === "object" || oPrimitiveTypeName === "any";
		}

		// call the preprocessor if it has been defined
		preprocessor && preprocessor.call(this, mSettings); // TODO: decide whether to call for empty settings as well?


		//process metadataContext
		if (mSettings.metadataContexts && this._processMetadataContexts) {
			this._processMetadataContexts(mSettings.metadataContexts, mSettings);
		}

		// process models
		if ( mSettings.models ) {
			if ( typeof mSettings.models !== "object" ) {
				throw new Error("models must be a simple object");
			}
			if ( BaseObject.isObjectA(mSettings.models, "sap.ui.model.Model") ) {
				this.setModel(mSettings.models);
			} else {
				for (sKey in mSettings.models ) {
					this.setModel(mSettings.models[sKey], sKey === "undefined" ? undefined : sKey);
				}
			}
		}
		//process BindingContext
		if ( mSettings.bindingContexts ) {
			if ( typeof mSettings.bindingContexts !== "object" ) {
				throw new Error("bindingContexts must be a simple object");
			}
			var oBindingContexts = mSettings.bindingContexts;
			if ( BaseObject.isObjectA(oBindingContexts, "sap.ui.model.Context")) {
				this.setBindingContext(mSettings.bindingContexts);
			} else {
				for (sKey in mSettings.bindingContexts ) {
					this.setBindingContext(mSettings.bindingContexts[sKey], sKey === "undefined" ? undefined : sKey);
				}
			}
		}
		//process object bindings
		if ( mSettings.objectBindings ) {
			if ( typeof mSettings.objectBindings !== "string" && typeof mSettings.objectBindings !== "object" ) {
				throw new Error("binding must be a string or simple object");
			}
			if ( typeof mSettings.objectBindings === "string" || mSettings.objectBindings.path ) { // excludes "path" as model name
				this.bindObject(mSettings.objectBindings);
			} else {
				for (sKey in mSettings.objectBindings ) {
					mSettings.objectBindings[sKey].model = sKey === "undefined" ? undefined : sKey;
					this.bindObject(mSettings.objectBindings[sKey]);
				}
			}
		}

		// process all settings
		// process settings
		for (sKey in mSettings) {
			oValue = mSettings[sKey];
			// get info object for the key
			if ( (oKeyInfo = mValidKeys[sKey]) !== undefined ) {
				var oBindingInfo;
				switch (oKeyInfo._iKind) {
				case 0: // PROPERTY
					oBindingInfo = this.extractBindingInfo(oValue, oScope, !isObjectType(oKeyInfo.type));
					if (oBindingInfo && typeof oBindingInfo === "object") {
						this.bindProperty(sKey, oBindingInfo);
					} else {
						this[oKeyInfo._sMutator](typeof oBindingInfo === "string" ? oBindingInfo : oValue);
					}
					break;
				case 1: // SINGLE_AGGREGATION
					oBindingInfo = oKeyInfo.altTypes && this.extractBindingInfo(oValue, oScope, !oKeyInfo.altTypes.some(isObjectType));
					if ( oBindingInfo && typeof oBindingInfo === "object" ) {
						this.bindProperty(sKey, oBindingInfo);
					} else {
						if (Array.isArray(oValue)){
							// assumption: we have an extensionPoint here which is always an array, even if it contains a single control
							if (oValue.length > 1){
								future.errorThrows("Tried to add an array of controls to a single aggregation");
							}
							oValue = oValue[0];
						}
						this[oKeyInfo._sMutator](makeObject(typeof oBindingInfo === "string" ? oBindingInfo : oValue, oKeyInfo, oScope));
					}
					break;
				case 2: // MULTIPLE_AGGREGATION
					oBindingInfo = this.extractBindingInfo(oValue, oScope);
					if (oBindingInfo && typeof oBindingInfo === "object" ) {
						this.bindAggregation(sKey, oBindingInfo);
					} else {
						oValue = typeof oBindingInfo === "string" ? oBindingInfo : oValue; // could be an unescaped string if altTypes contains 'string'
						if ( oValue ) {
							if ( Array.isArray(oValue) ) {
								addAllToAggregation(oValue); // wrap a single object as array
							} else {
								that[oKeyInfo._sMutator](makeObject(oValue, oKeyInfo, oScope));
							}
						}
					}
					break;
				case 3: // SINGLE_ASSOCIATION
					this[oKeyInfo._sMutator](oValue);
					break;
				case 4: // MULTIPLE_ASSOCIATION
					if ( oValue ) {
						if ( Array.isArray(oValue) ) {
							for (var i = 0,l = oValue.length; i < l; i++) {
								this[oKeyInfo._sMutator](oValue[i]);
							}
						} else {
							this[oKeyInfo._sMutator](oValue);
						}
					}
					break;
				case 5: // EVENT
					if ( typeof oValue == "function" ) {
						this[oKeyInfo._sMutator](oValue);
					} else if (Array.isArray(oValue[0]) && (oValue.length <= 1 || Array.isArray(oValue[1])) ) {
						oValue.forEach(attachListener);
					} else {
						attachListener(oValue);
					}
					break;
				case -1: // SPECIAL_SETTING
					// No assert
					break;
				default:
					break;
				}
			} else {
				// there must be no unknown settings
				assert(false, "ManagedObject.apply: encountered unknown setting '" + sKey + "' for class '" + oMetadata.getName() + "' (value:'" + oValue + "')");
			}
		}

		return this;
	};

	/**
	 * Escapes the given value so it can be used in the constructor's settings object.
	 * Should be used when property values are initialized with static string values which could contain binding characters (curly braces).
	 *
	 * @since 1.52
	 * @param {any} vValue Value to escape; only needs to be done for string values, but the call will work for all types
	 * @return {any} The given value, escaped for usage as static property value in the constructor's settings object (or unchanged, if not of type string)
	 * @static
	 * @public
	 */
	ManagedObject.escapeSettingsValue = function(vValue) {
		return (typeof vValue === "string") ? BindingInfo.escape(vValue) : vValue;
	};

	/**
	 * Returns a simple string representation of this managed object.
	 *
	 * Mainly useful for tracing purposes.
	 * @public
	 * @return {string} a string description of this managed object
	 */
	ManagedObject.prototype.toString = function() {
		return "ManagedObject " + this.getMetadata().getName() + "#" + this.getId();
	};

	/**
	 * Returns the object's ID.
	 *
	 * There is no guarantee or check or requirement for the ID of a <code>ManagedObject</code> to be unique.
	 * Only some subclasses of <code>ManagedObject</code> introduce this as a requirement, e.g. <code>Component</code>
	 * or <code>Element</code>. All elements existing in the same window at the same time must have different IDs.
	 * A new element will fail during construction when the given ID is already used by another element.
	 * But there might be a component with the same ID as an element or another <code>ManagedObject</code>.
	 *
	 * For the same reason, there is no general lookup for <code>ManagedObject</code>s via their ID. Only for subclasses
	 * that enforce unique IDs, there might be lookup mechanisms (e.g. {@link sap.ui.core.Element#getElementById sap.ui.core.Element.getElementById}
	 * for elements).
	 *
	 * @return {string} The objects's ID.
	 * @public
	 */
	ManagedObject.prototype.getId = function() {
		return this.sId;
	};

	// ######################################################################################################
	// Properties
	// ######################################################################################################

	/**
	 * Sets the given value for the given property after validating and normalizing it,
	 * marks this object as changed.
	 *
	 * If the value is not valid with regard to the declared data type of the property,
	 * an Error is thrown. In case <code>null</code> or <code>undefined</code> is passed,
	 * the default value for this property is used (see {@link #validateProperty}). To fully
	 * reset the property to initial state, use {@link #resetProperty} instead.
	 * If the validated and normalized <code>oValue</code> equals the current value of the property,
	 * the internal state of this object is not changed (apart from the result of {@link #isPropertyInitial}).
	 * If the value changes, it is stored internally
	 * and the {@link #invalidate} method is called on this object. In the case of TwoWay
	 * databinding, the bound model is informed about the property change.
	 *
	 * Note that ManagedObject only implements a single level of change tracking: if a first
	 * call to setProperty recognizes a change, 'invalidate' is called. If another call to
	 * setProperty reverts that change, invalidate() will be called again, the new status
	 * is not recognized as being 'clean' again.
	 *
	 * <b>Note:</b> This method is a low level API as described in <a href="#lowlevelapi">the class documentation</a>.
	 * Applications or frameworks must not use this method to generically set a property.
	 * Use the concrete method set<i>XYZ</i> for property 'XYZ' or the generic {@link #applySettings} instead.
	 *
	 * @param {string}  sPropertyName name of the property to set
	 * @param {any}     oValue value to set the property to
	 * @param {boolean} [bSuppressInvalidate] if true, the managed object is not marked as changed
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 *
	 * @protected
	 */
	ManagedObject.prototype.setProperty = function(sPropertyName, oValue, bSuppressInvalidate) {

		// check for a value change
		var oOldValue = this.mProperties[sPropertyName];

		// value validation
		oValue = this.validateProperty(sPropertyName, oValue);

		if (deepEqual(oOldValue, oValue)) {
			// ensure to set the own property explicitly to allow isPropertyInitial check (using hasOwnProperty on the map)
			this.mProperties[sPropertyName] = oValue;
			return this;
		} // no change

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			//Refresh only for property changes with suppressed invalidation (others lead to rerendering and refresh is handled there)
			ActivityDetection.refresh();
		}

		// change the property (and invalidate if the rendering should be updated)
		this.mProperties[sPropertyName] = oValue;

		if (!bSuppressInvalidate && !this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// check whether property is bound and update model in case of two way binding
		this.updateModelProperty(sPropertyName, oValue, oOldValue);
		// refresh new value as model might have changed it
		oValue = this.mProperties[sPropertyName];

		// fire property change event (experimental, only for internal use)
		if ( this.mEventRegistry["_change"] ) {
			EventProvider.prototype.fireEvent.call(this, "_change", {
				"id": this.getId(),
				"name": sPropertyName,
				"oldValue": oOldValue,
				"newValue": oValue
			});
		}
		if (this._observer) {
			this._observer.propertyChange(this, sPropertyName, oOldValue, oValue);
		}

		return this;
	};

	/**
	 * Returns the value for the property with the given <code>sPropertyName</code>.
	 *
	 * <b>Note:</b> This method is a low-level API as described in <a href="#lowlevelapi">the class documentation</a>.
	 * Applications or frameworks must not use this method to generically retrieve the value of a property.
	 * Use the concrete method get<i>XYZ</i> for property 'XYZ' instead.
	 *
	 * @param {string} sPropertyName the name of the property
	 * @returns {any} the value of the property
	 * @protected
	 */
	ManagedObject.prototype.getProperty = function(sPropertyName) {
		var oValue = this.mProperties[sPropertyName],
			oProperty = this.getMetadata().getManagedProperty(sPropertyName),
			oType;

		if (!oProperty) {
			throw new Error("Property \"" + sPropertyName + "\" does not exist in " + this);
		}

		oType = DataType.getType(oProperty.type);

		// If property has an array type, clone the array to avoid modification of original data
		if (oType instanceof DataType && oType.isArrayType() && Array.isArray(oValue)) {
			oValue = oValue.slice(0);
		}

		// If property is of type String instead of string, convert with valueOf()
		if (oValue instanceof String) {
			oValue = oValue.valueOf();
		}

		if (oProperty.byValue) {
			oValue  = deepClone(oValue);
		}

		return oValue;
	};

	/**
	 * Checks whether the given value is of the proper type for the given property name.
	 *
	 * In case <code>null</code> or <code>undefined</code> is passed, the default value for
	 * this property is used as value. If no default value is defined for the property, the
	 * default value of the type of the property is used.
	 *
	 * If the property has a data type that is an instance of sap.ui.base.DataType and if
	 * a <code>normalize</code> function is defined for that type, that function will be
	 * called with the resulting value as only argument. The result of the function call is
	 * then used instead of the raw value.
	 *
	 * This method is called by {@link #setProperty}. In many cases, subclasses of
	 * ManagedObject don't need to call it themselves.
	 *
	 * @param {string} sPropertyName Name of the property
	 * @param {any} oValue Value to be set
	 * @return {any} The normalized value for the passed value or for the default value if <code>null</code> or <code>undefined</code> was passed
	 * @throws {Error} If no property with the given name is found or the given value does not fit to the property type
	 * @throws {TypeError} If the value for a property with value semantic (<code>byValue:true</code>) contains a non-plain object
	 * @protected
	 */
	ManagedObject.prototype.validateProperty = function(sPropertyName, oValue) {
		var oProperty = this.getMetadata().getManagedProperty(sPropertyName),
			oType;

		if (!oProperty) {
			throw new Error("Property \"" + sPropertyName + "\" does not exist in " + this);
		}

		oType = DataType.getType(oProperty.type);

		// If property has an array type, clone the array to avoid modification of original data
		if (oType instanceof DataType && oType.isArrayType() && Array.isArray(oValue)) {
			oValue = oValue.slice(0);
		}

		// In case null is passed as the value return the default value, either from the property or from the type
		if (oValue == null /* null or undefined */ ) {
			oValue = oProperty.getDefaultValue();
		} else if (oType instanceof DataType) {
			// Implicit casting for string only, other types are causing errors

			if (oType.getName() == "string") {
				if (!(typeof oValue == "string" || oValue instanceof String)) {
					oValue = "" + oValue;
				}
			} else if (oType.getName() == "string[]") {
				// For compatibility convert string values to array with single entry
				if (typeof oValue == "string") {
					oValue = [oValue];
				}
				if (!Array.isArray(oValue)) {
					throw new Error("\"" + oValue + "\" is of type " + typeof oValue + ", expected string[]" +
							" for property \"" + sPropertyName + "\" of " + this);
				}
				for (var i = 0; i < oValue.length; i++) {
					if (typeof oValue[i] !== "string") {
						oValue[i] = "" + oValue[i];
					}
				}
			} else if (!oType.isValid(oValue)) {
				throw new Error("\"" + oValue + "\" is of type " + typeof oValue + ", expected " +
						oType.getName() + " for property \"" + sPropertyName + "\" of " + this);
			}
		}

        if (oProperty.byValue) {
            oValue = deepClone(oValue); // deep cloning only applies to date, object and array
        }

        // Normalize the value (if a normalizer was set using the setNormalizer method on the type)
		if (oType && oType.normalize && typeof oType.normalize === "function") {
			oValue = oType.normalize(oValue);
		}

		return oValue;
	};

	/**
	 * Returns whether the given property value is initial and has not been explicitly set or bound.
	 * Even after setting the default value or setting null/undefined (which also causes the default value to be set),
	 * the property is no longer initial. A property can be reset to initial state by calling <code>resetProperty(sPropertyName)</code>.
	 *
	 * @param {string} sPropertyName the name of the property
	 * @returns {boolean} true if the property is initial
	 * @protected
	 */
	ManagedObject.prototype.isPropertyInitial = function(sPropertyName) {
		return !Object.hasOwn(this.mProperties, sPropertyName) && !this.isBound(sPropertyName);
	};

	/**
	 * Resets the given property to the default value and also restores the "initial" state (like it has never been set).
	 *
	 * As subclasses might have implemented side effects in the named setter <code>setXYZ</code> for property 'xyz',
	 * that setter is called with a value of <code>null</code>, which by convention restores the default value of
	 * the property. This is only done to notify subclasses, the internal state is anyhow reset.
	 *
	 * When the property has not been modified so far, nothing will be done.
	 *
	 * @param {string} sPropertyName Name of the property
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.resetProperty = function(sPropertyName) {
		if (this.mProperties.hasOwnProperty(sPropertyName)) {
			var oPropertyInfo = this.getMetadata().getManagedProperty(sPropertyName);
			oPropertyInfo.set(this, null); // let the control instance know the value is reset to default
			// if control did no further effort to find and set an instance-specific default value, then go back to "initial" state (where the default value is served anyway)
			if (this.mProperties[sPropertyName] === oPropertyInfo.getDefaultValue()) {
				delete this.mProperties[sPropertyName];
			}
		}
		return this;
	};

	/**
	 * Returns the origin info for the value of the given property.
	 *
	 * The origin info might contain additional information for translatable
	 * texts. The bookkeeping of this information is not active by default and must be
	 * activated by configuration. Even then, it might not be present for all properties
	 * and their values depending on where the value came form.
	 *
	 * If no origin info is available, <code>null</code> will be returned.
	 *
	 * @param {string} sPropertyName Name of the property
	 * @returns {{source: string, locale: string}}|null} An object describing the origin of this property's value or <code>null</code>
	 * @public
	 */
	ManagedObject.prototype.getOriginInfo = function(sPropertyName) {
		var oValue = this.mProperties[sPropertyName];
		if (!(oValue instanceof String && oValue.originInfo)) {
			return null;
		}
		return oValue.originInfo;
	};


	// ######################################################################################################
	// Associations
	// ######################################################################################################

	/**
	 * Sets the associated object for the given managed association of cardinality '0..1' and
	 * marks this ManagedObject as changed.
	 *
	 * The associated object can either be given by itself or by its id. If <code>null</code> or
	 * <code>undefined</code> is given, the association is cleared.
	 *
	 * <b>Note:</b> This method is a low-level API as described in <a href="#lowlevelapi">the class documentation</a>.
	 * Applications or frameworks must not use this method to generically set an object in an association.
	 * Use the concrete method set<i>XYZ</i> for association 'XYZ' or the generic {@link #applySettings} instead.
	 *
	 * @param {string}
	 *            sAssociationName name of the association
	 * @param {string | sap.ui.base.ManagedObject}
	 *            sId the ID of the managed object that is set as an association, or the managed object itself or null
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, the managed objects invalidate method is not called
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.setAssociation = function(sAssociationName, sId, bSuppressInvalidate) {
		if (sId instanceof ManagedObject) {
			sId = sId.getId();
		} else if (sId != null && typeof sId !== "string") {
			assert(false, "setAssociation(): sId must be a string, an instance of sap.ui.base.ManagedObject or null");
			return this;
		}

		if (this.mAssociations[sAssociationName] === sId) {
			return this;
		} // no change

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}
		if (this._observer && this.mAssociations[sAssociationName] != null) {
			this._observer.associationChange(this, sAssociationName, "remove", this.mAssociations[sAssociationName]);
		}
		this.mAssociations[sAssociationName] = sId;
		if (this._observer && this.mAssociations[sAssociationName] != null) {
			this._observer.associationChange(this, sAssociationName, "insert", sId);
		}
		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return this;
	};

	/**
	 * Returns the content of the association with the given name.
	 *
	 * For associations of cardinality 0..1, a single string with the ID of an associated
	 * object is returned (if any). For cardinality 0..n, an array with the IDs of the
	 * associated objects is returned.
	 *
	 * If the association does not contain any objects(s), the given <code>oDefaultForCreation</code>
	 * is set as new value of the association and returned to the caller. The only supported values for
	 * <code>oDefaultForCreation</code> are <code>null</code> and <code>undefined</code> in the case of
	 * cardinality 0..1 and <code>null</code>, <code>undefined</code> or an empty array (<code>[]</code>)
	 * in case of cardinality 0..n. If the argument is omitted, <code>null</code> is used independently
	 * from the cardinality.
	 *
	 * <b>Note:</b> the need to specify a default value and the fact that it is stored as
	 * new value of a so far empty association is recognized as a shortcoming of this API
	 * but can no longer be changed for compatibility reasons.
	 *
	 * <b>Note:</b> This method is a low-level API as described in <a href="#lowlevelapi">the class documentation</a>.
	 * Applications or frameworks must not use this method to generically retrieve the content of an association.
	 * Use the concrete method get<i>XYZ</i> for association 'XYZ' instead.
	 *
	 * @param {string} sAssociationName the name of the association
	 * @param {null|Array} oDefaultForCreation
	 *            the value that is used in case the current aggregation is empty (only null or empty array is allowed)
	 * @returns {string | string[] | null} the ID of the associated managed object or an array of such IDs; may be null if the association has not been populated
	 * @protected
	 */
	ManagedObject.prototype.getAssociation = function(sAssociationName, oDefaultForCreation) {
		var result = this.mAssociations[sAssociationName];

		if (!result) {
			result = this.mAssociations[sAssociationName] = oDefaultForCreation || null;
		} else {
			if (typeof result.length === 'number' && !(result.propertyIsEnumerable('length')) ) {
				// Return a copy of the array instead of the array itself as reference!!
				return result.slice();
			}
			// simple type or ManagedObject
			return result;
		}

		return result;
	};

	/**
	 * Adds some object with the ID <code>sId</code> to the association identified by <code>sAssociationName</code> and
	 * marks this ManagedObject as changed.
	 *
	 * This method does not avoid duplicates.
	 *
	 * <b>Note:</b> This method is a low-level API as described in <a href="#lowlevelapi">the class documentation</a>.
	 * Applications or frameworks must not use this method to generically add an object to an association.
	 * Use the concrete method add<i>XYZ</i> for association 'XYZ' or the generic {@link #applySettings} instead.
	 *
	 * @param {string}
	 *            sAssociationName the string identifying the association the object should be added to.
	 * @param {string | sap.ui.base.ManagedObject}
	 *            sId the ID of the ManagedObject object to add; if empty, nothing is added; if a <code>sap.ui.base.ManagedObject</code> is given, its ID is added
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this managed object as well as the newly associated object are not marked as changed
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.addAssociation = function(sAssociationName, sId, bSuppressInvalidate) {
		if (sId instanceof ManagedObject) {
			sId = sId.getId();
		} else if (typeof sId !== "string") {
			// TODO what about empty string?
			assert(false, "addAssociation(): sId must be a string or an instance of sap.ui.base.ManagedObject");
			return this;
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		var aIds = this.mAssociations[sAssociationName];
		if (!aIds) {
			aIds = this.mAssociations[sAssociationName] = [sId];
		} else {
			aIds.push(sId);
		}
		if (this._observer) {
			this._observer.associationChange(this, sAssociationName, "insert", sId);
		}
		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return this;
	};

	/**
	 * Removes a <code>ManagedObject</code> from the association named <code>sAssociationName</code>.
	 *
	 * If an object is removed, the ID of that object is returned and this <code>ManagedObject</code> is
	 * marked as changed. Otherwise <code>null</code> is returned.
	 *
	 * If the same object was added multiple times to the same association, only a single
	 * occurrence of it will be removed by this method. If the object is not found or if the
	 * parameter can't be interpreted neither as a <code>ManagedObject</code> (or ID) nor as an index in
	 * the association, nothing will be removed. The same is true if an index is given and if
	 * that index is out of range for the association.
	 *
	 * <b>Note:</b> This method is a low-level API as described in <a href="#lowlevelapi">the class documentation</a>.
	 * Applications or frameworks must not use this method to generically remove an object from an association.
	 * Use the concrete method remove<i>XYZ</i> for association 'XYZ' instead.
	 *
	 * @param {string}
	 *            sAssociationName the string identifying the association the <code>ManagedObject</code> should be removed from.
	 * @param {int | string | sap.ui.base.ManagedObject}
	 *            vObject the position or ID of the <code>ManagedObject</code> to remove or the <code>ManagedObject</code> itself; if <code>vObject</code> is invalid input,
	 *            a negative value or a value greater or equal than the current size of the association, nothing is removed
	 * @param {boolean}
	 *            [bSuppressInvalidate] if <code>true</code>, the managed object is not marked as changed
	 * @returns {string|null} ID of the removed <code>ManagedObject</code> or <code>null</code>
	 * @protected
	 */
	ManagedObject.prototype.removeAssociation = function(sAssociationName, vObject, bSuppressInvalidate) {
		var aIds = this.mAssociations[sAssociationName];
		var sId = null;

		if (!aIds) {
			return null;
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		if (typeof (vObject) == "object" && vObject.getId) { // object itself is given
			vObject = vObject.getId();
		}

		if (typeof (vObject) == "string") { // ID of the object is given or has just been retrieved
			for (var i = 0; i < aIds.length; i++) {
				if (aIds[i] == vObject) {
					vObject = i;
					break;
				}
			}
		}

		if (typeof (vObject) == "number") { // "object" is the index now
			if (vObject < 0 || vObject >= aIds.length) {
				future.warningThrows("ManagedObject.removeAssociation called with invalid index: " + sAssociationName + ", " + vObject);
			} else {
				sId = aIds[vObject];
				aIds.splice(vObject, 1);
				if (this._observer) {
					this._observer.associationChange(this, sAssociationName, "remove", sId);
				}
				if (!this.isInvalidateSuppressed()) {
					this.invalidate();
				}
			}
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return sId;
	};

	/**
	 * Removes all the objects in the 0..n-association named <code>sAssociationName</code> and returns an array
	 * with their IDs. This ManagedObject is marked as changed, if the association contained any objects.
	 *
	 * <b>Note:</b> This method is a low-level API as described in <a href="#lowlevelapi">the class documentation</a>.
	 * Applications or frameworks must not use this method to generically remove all object from an association.
	 * Use the concrete method removeAll<i>XYZ</i> for association 'XYZ' instead.
	 *
	 * @param {string}
	 *            sAssociationName the name of the association
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @type Array
	 * @return an array with the IDs of the removed objects (might be empty)
	 * @protected
	 */
	ManagedObject.prototype.removeAllAssociation = function(sAssociationName, bSuppressInvalidate){
		var aIds = this.mAssociations[sAssociationName];
		if (!aIds) {
			return [];
		}

		delete this.mAssociations[sAssociationName];

		// maybe there is no association to remove
		if (!aIds.length) {
			return aIds;
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		if (this._observer) {
			this._observer.associationChange(this, sAssociationName, "remove", aIds);
		}
		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return aIds;
	};

	// ######################################################################################################
	// Aggregations
	// ######################################################################################################

	/**
	 * Checks whether the given value is of the proper type for the given aggregation name.
	 *
	 * This method is already called by {@link #setAggregation}, {@link #addAggregation} and {@link #insertAggregation}.
	 * In many cases, subclasses of ManagedObject don't need to call it again in their mutator methods.
	 *
	 * @param {string} sAggregationName the name of the aggregation
	 * @param {sap.ui.base.ManagedObject|any} oObject the aggregated object or a primitive value
	 * @param {boolean} bMultiple whether the caller assumes the aggregation to have cardinality 0..n
	 * @return {sap.ui.base.ManagedObject|any} the passed object
	 * @throws Error if no aggregation with the given name is found or the given value does not fit to the aggregation type
	 * @protected
	 */
	ManagedObject.prototype.validateAggregation = function(sAggregationName, oObject, bMultiple, _bOmitForwarding /* private */) {
		var oMetadata = this.getMetadata(),
			oAggregation = oMetadata.getManagedAggregation(sAggregationName), // public or private
			aAltTypes,
			oType,
			i,
			msg;

		if (!oAggregation) {
			throw new Error("Aggregation \"" + sAggregationName + "\" does not exist in " + this);
		}

		if (oAggregation.multiple !== bMultiple) {
			throw new Error("Aggregation '" + sAggregationName + "' of " + this + " used with wrong cardinality (declared as " + (oAggregation.multiple ? "0..n" : "0..1") + ")");
		}

		var oForwarder = oMetadata.getAggregationForwarder(sAggregationName);
		if (oForwarder && !_bOmitForwarding) {
			oForwarder.getTarget(this).validateAggregation(oForwarder.targetAggregationName, oObject, bMultiple);
		}

		//Null is a valid value for 0..1 aggregations
		if (!oAggregation.multiple && !oObject) {
			return oObject;
		}

		if ( BaseObject.isObjectA(oObject, oAggregation.type) ) {
			return oObject;
		}

		// alternative types
		aAltTypes = oAggregation.altTypes;
		if ( aAltTypes && aAltTypes.length ) {
			// for primitive types, null or undefined is valid as well
			if ( oObject == null ) {
				return oObject;
			}
			for (i = 0; i < aAltTypes.length; i++) {
				oType = DataType.getType(aAltTypes[i]);
				if (oType instanceof DataType) {
					if (oType.isValid(oObject)) {
						return oObject;
					}
				}
			}
		}

		// TODO make this stronger again (e.g. for FormattedText)
		msg = "\"" + oObject + "\" is not valid for aggregation \"" + sAggregationName + "\" of " + this;
		if ( DataType.isInterfaceType(oAggregation.type) ) {
			assert(false, msg);
			return oObject;
		} else {
			throw new Error(msg);
		}
	};

	/**
	 * Sets a new object in the named 0..1 aggregation of this ManagedObject and
	 * marks this ManagedObject as changed.
	 *
	 * If the given object is not valid with regard to the aggregation (if it is not an instance
	 * of the type specified for that aggregation) or when the method is called for an aggregation
	 * of cardinality 0..n, then an Error is thrown (see {@link #validateAggregation}.
	 *
	 * If the new object is the same as the currently aggregated object, then the internal state
	 * is not modified and this ManagedObject is not marked as changed.
	 *
	 * If the given object is different, the parent of a previously aggregated object is cleared
	 * (it must have been this ManagedObject before), the parent of the given object is set to this
	 * ManagedObject and {@link #invalidate} is called for this object.
	 *
	 * Note that this method does neither return nor destroy the previously aggregated object.
	 * This behavior is inherited by named set methods (see below) in subclasses.
	 * To avoid memory leaks, applications therefore should first get the aggregated object,
	 * keep a reference to it or destroy it, depending on their needs, and only then set a new
	 * object.
	 *
	 * Note that ManagedObject only implements a single level of change tracking: if a first
	 * call to setAggregation recognizes a change, 'invalidate' is called. If another call to
	 * setAggregation reverts that change, invalidate() will be called again, the new status
	 * is not recognized as being 'clean' again.
	 *
	 * <b>Note:</b> This method is a low-level API as described in <a href="#lowlevelapi">the class documentation</a>.
	 * Applications or frameworks must not use this method to generically set an object in an aggregation.
	 * Use the concrete method set<i>XYZ</i> for aggregation 'XYZ' or the generic {@link #applySettings} instead.
	 *
	 * @param {string}
	 *            sAggregationName name of an 0..1 aggregation
	 * @param {sap.ui.base.ManagedObject}
	 *            oObject the managed object that is set as aggregated object
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @throws {Error}
	 * @protected
	 */
	ManagedObject.prototype.setAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		var oForwarder = this.getMetadata().getAggregationForwarder(sAggregationName);
		if (oForwarder) {
			oObject = this.validateAggregation(sAggregationName, oObject, /* multiple */ false, /* omit forwarding */ true); // because validate below is done AFTER accessing this.mAggregations
			return oForwarder.set(this, oObject);
		}

		var oOldChild = this.mAggregations[sAggregationName];
		if (oOldChild === oObject) {
			return this;
		} // no change
		oObject = this.validateAggregation(sAggregationName, oObject, /* multiple */ false);

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		this.mAggregations[sAggregationName] = null;
		if (oOldChild instanceof ManagedObject) { // remove old child
			oOldChild.setParent(null);
		} else {
			if (this._observer != null && oOldChild != null) {
				//alternative type
				this._observer.aggregationChange(this, sAggregationName, "remove", oOldChild);
			}
		}
		this.mAggregations[sAggregationName] = oObject;
		if (oObject instanceof ManagedObject) { // adopt new child
			oObject.setParent(this, sAggregationName, bSuppressInvalidate);
		} else {
			if (!this.isInvalidateSuppressed()) {
				this.invalidate();
			}


			if (this._observer != null && oObject != null) {
				//alternative type
				this._observer.aggregationChange(this, sAggregationName, "insert", oObject);
			}
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return this;
	};

	/**
	 * Returns the aggregated object(s) for the named aggregation of this ManagedObject.
	 *
	 * If the aggregation does not contain any objects(s), the given <code>oDefaultForCreation</code>
	 * (or <code>null</code>) is set as new value of the aggregation and returned to the caller.
	 *
	 * <b>Note:</b> the need to specify a default value and the fact that it is stored as
	 * new value of a so far empty aggregation is recognized as a shortcoming of this API
	 * but can no longer be changed for compatibility reasons.
	 *
	 * <b>Note:</b> This method is a low-level API as described in <a href="#lowlevelapi">the class documentation</a>.
	 * Applications or frameworks must not use this method to generically read the content of an aggregation.
	 * Use the concrete method get<i>XYZ</i> for aggregation 'XYZ' instead.
	 *
	 * @param {string} sAggregationName
	 *            Name of the aggregation
	 * @param {sap.ui.base.ManagedObject | Array} [oDefaultForCreation=null]
	 *            Object that is used in case the current aggregation is empty. If provided, it must be null for
	 *            0..1 aggregations or an empty array for 0..n aggregations. If not provided, <code>null</code> is used.
	 *
	 *            <b>Note:</b> When an empty array is given and used because the aggregation was not set before,
	 *            then this array will be used for the aggregation from thereon. Sharing the same empty array
	 *            between different calls to this method therefore is not possible and will result in
	 *            inconsistencies.
	 * @returns {sap.ui.base.ManagedObject|sap.ui.base.ManagedObject[]|null}
	 *            Aggregation array in case of 0..n-aggregations or the managed object or <code>null</code> in case of 0..1-aggregations
	 * @protected
	 */
	ManagedObject.prototype.getAggregation = function(sAggregationName, oDefaultForCreation) {
		var oForwarder = this.getMetadata().getAggregationForwarder(sAggregationName);
		if (oForwarder) {
			return oForwarder.get(this);
		}

		var aChildren = this.mAggregations[sAggregationName];
		if (!aChildren) {
			aChildren = this.mAggregations[sAggregationName] = oDefaultForCreation || null;
		}
		if (aChildren) {
			if (typeof aChildren.length === 'number' && !(aChildren.propertyIsEnumerable('length')) ) {
				// Return a copy of the array instead of the array itself as reference!!
				return aChildren.slice();
			}
			// simple type or ManagedObject
			return aChildren;
		} else {
			return null;
		}
	};

	/**
	 * Searches for the provided ManagedObject in the named aggregation and returns its
	 * 0-based index if found, or -1 otherwise. Returns -2 if the given named aggregation
	 * is of cardinality 0..1 and doesn't reference the given object.
	 *
	 * <b>Note:</b> This method is a low-level API as described in <a href="#lowlevelapi">the class documentation</a>.
	 * Applications or frameworks must not use this method to generically determine the position of an object in an aggregation.
	 * Use the concrete method indexOf<i>XYZ</i> for aggregation 'XYZ' instead.
	 *
	 * @param {string}
	 *            sAggregationName the name of the aggregation
	 * @param {sap.ui.base.ManagedObject}
	 *            oObject the ManagedObject whose index is looked for.
	 * @return {int} the index of the provided managed object in the aggregation.
	 * @protected
	 */
	ManagedObject.prototype.indexOfAggregation = function(sAggregationName, oObject) {
		var oForwarder = this.getMetadata().getAggregationForwarder(sAggregationName);
		if (oForwarder) {
			return oForwarder.indexOf(this, oObject);
		}

		var aChildren = this.mAggregations[sAggregationName];
		if (aChildren) {
			if (aChildren.length == undefined) {
				return -2;
			} // not a multiple aggregation

			for (var i = 0; i < aChildren.length; i++) {
				if (aChildren[i] == oObject) {
					return i;
				}
			}
		}
		return -1;
	};

	/**
	 * Inserts managed object <code>oObject</code> to the aggregation named <code>sAggregationName</code> at
	 * position <code>iIndex</code>.
	 *
	 * If the given object is not valid with regard to the aggregation (if it is not an instance
	 * of the type specified for that aggregation) or when the method is called for an aggregation
	 * of cardinality 0..1, then an Error is thrown (see {@link #validateAggregation}.
	 *
	 * If the given index is out of range with respect to the current content of the aggregation,
	 * it is clipped to that range (0 for iIndex < 0, n for iIndex > n).
	 *
	 * Please note that this method does not work as expected when an object is added
	 * that is already part of the aggregation. In order to change the index of an object
	 * inside an aggregation, first remove it, then insert it again.
	 *
	 * <b>Note:</b> This method is a low-level API as described in <a href="#lowlevelapi">the class documentation</a>.
	 * Applications or frameworks must not use this method to generically insert an object into an aggregation.
	 * Use the concrete method insert<i>XYZ</i> for aggregation 'XYZ' instead.
	 *
	 * @param {string}
	 *            sAggregationName the string identifying the aggregation the managed object <code>oObject</code>
	 *            should be inserted into.
	 * @param {sap.ui.base.ManagedObject}
	 *            oObject the ManagedObject to add; if empty, nothing is inserted.
	 * @param {int}
	 *            iIndex the <code>0</code>-based index the managed object should be inserted at; for a negative
	 *            value <code>iIndex</code>, <code>oObject</code> is inserted at position 0; for a value
	 *            greater than the current size of the aggregation, <code>oObject</code> is inserted at
	 *            the last position
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject as well as the added child are not marked as changed
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		if (!oObject) {
			return this;
		}
		oObject = this.validateAggregation(sAggregationName, oObject, /* multiple */ true, /* omit forwarding */ true);

		var oForwarder = this.getMetadata().getAggregationForwarder(sAggregationName);
		if (oForwarder) {
			return oForwarder.insert(this, oObject, iIndex);
		}

		var aChildren = this.mAggregations[sAggregationName] || (this.mAggregations[sAggregationName] = []);
		// force index into valid range
		var i;
		if (iIndex < 0) {
			i = 0;
		} else if (iIndex > aChildren.length) {
			i = aChildren.length;
		} else {
			i = iIndex;
		}
		aChildren.splice(i, 0, oObject);
		oObject.setParent(this, sAggregationName, bSuppressInvalidate);

		return this;
	};

	/**
	 * Adds some entity <code>oObject</code> to the aggregation identified by <code>sAggregationName</code>.
	 *
	 * If the given object is not valid with regard to the aggregation (if it is not an instance
	 * of the type specified for that aggregation) or when the method is called for an aggregation
	 * of cardinality 0..1, then an Error is thrown (see {@link #validateAggregation}.
	 *
	 * If the aggregation already has content, the new object will be added after the current content.
	 * If the new object was already contained in the aggregation, it will be moved to the end.
	 *
	 * <b>Note:</b> This method is a low-level API as described in <a href="#lowlevelapi">the class documentation</a>.
	 * Applications or frameworks must not use this method to generically add an object to an aggregation.
	 * Use the concrete method add<i>XYZ</i> for aggregation 'XYZ' or the generic {@link #applySettings} instead.
	 *
	 * @param {string}
	 *            sAggregationName the string identifying the aggregation that <code>oObject</code> should be added to.
	 * @param {sap.ui.base.ManagedObject}
	 *            oObject the object to add; if empty, nothing is added
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject as well as the added child are not marked as changed
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		if (!oObject) {
			return this;
		}
		oObject = this.validateAggregation(sAggregationName, oObject, /* multiple */ true, /* omit forwarding */ true);

		var oForwarder = this.getMetadata().getAggregationForwarder(sAggregationName);
		if (oForwarder) {
			return oForwarder.add(this, oObject);
		}

		var aChildren = this.mAggregations[sAggregationName];
		if (!aChildren) {
			aChildren = this.mAggregations[sAggregationName] = [oObject];
		} else {
			aChildren.push(oObject);
		}
		oObject.setParent(this, sAggregationName, bSuppressInvalidate);
		return this;
	};

	/**
	 * Removes an object from the aggregation named <code>sAggregationName</code> with cardinality 0..n.
	 *
	 * The removed object is not destroyed nor is it marked as changed.
	 *
	 * If the given object is found in the aggregation, it is removed, it's parent relationship
	 * is unset and this ManagedObject is marked as changed. The removed object is returned as
	 * result of this method. If the object could not be found, <code>null</code> is returned.
	 *
	 * This method must only be called for aggregations of cardinality 0..n. The only way to remove objects
	 * from a 0..1 aggregation is to set a <code>null</code> value for them.
	 *
	 * <b>Note:</b> This method is a low-level API as described in <a href="#lowlevelapi">the class documentation</a>.
	 * Applications or frameworks must not use this method to generically remove an object from an aggregation.
	 * Use the concrete method remove<i>XYZ</i> for aggregation 'XYZ' instead.
	 *
	 * @param {string}
	 *            sAggregationName the string identifying the aggregation that the given object should be removed from
	 * @param {int | string | sap.ui.base.ManagedObject}
	 *            vObject the position or ID of the ManagedObject that should be removed or that ManagedObject itself;
	 *            if <code>vObject</code> is invalid, a negative value or a value greater or equal than the current size
	 *            of the aggregation, nothing is removed.
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @returns {sap.ui.base.ManagedObject|null} the removed object or <code>null</code>
	 * @protected
	 */
	ManagedObject.prototype.removeAggregation = function(sAggregationName, vObject, bSuppressInvalidate) {
		var oForwarder = this.getMetadata().getAggregationForwarder(sAggregationName);
		if (oForwarder) {
			return oForwarder.remove(this, vObject);
		}

		var aChildren = this.mAggregations[sAggregationName],
			oChild = null,
			i;

		if ( !aChildren ) {
			return null;
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		if (typeof (vObject) == "string") { // ID of the object is given
			// Note: old lookup via sap.ui.getCore().byId(vObject) only worked for Elements, not for managed objects in general!
			for (i = 0; i < aChildren.length; i++) {
				if (aChildren[i] && aChildren[i].getId() === vObject) {
					vObject = i;
					break;
				}
			}
		}

		if (typeof (vObject) == "object") { // the object itself is given or has just been retrieved
			for (i = 0; i < aChildren.length; i++) {
				if (aChildren[i] == vObject) {
					vObject = i;
					break;
				}
			}
		}

		if (typeof (vObject) == "number") { // "vObject" is the index now
			if (vObject < 0 || vObject >= aChildren.length) {
				future.warningThrows("ManagedObject.removeAggregation called with invalid index: " + sAggregationName + ", " + vObject);

			} else {
				oChild = aChildren[vObject];
				aChildren.splice(vObject, 1); // first remove it from array, then call setParent (avoids endless recursion)
				oChild.setParent(null);
				if (!this.isInvalidateSuppressed()) {
					this.invalidate();
				}
			}
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return oChild;
	};

	/**
	 * Removes all objects from the 0..n-aggregation named <code>sAggregationName</code>.
	 *
	 * The removed objects are not destroyed nor are they marked as changed.
	 *
	 * Additionally, it clears the parent relationship of all removed objects, marks this
	 * ManagedObject as changed and returns an array with the removed objects.
	 *
	 * If the aggregation did not contain any objects, an empty array is returned and this
	 * ManagedObject is not marked as changed.
	 *
	 * <b>Note:</b> This method is a low-level API as described in <a href="#lowlevelapi">the class documentation</a>.
	 * Applications or frameworks must not use this method to generically remove all objects from an aggregation.
	 * Use the concrete method removeAll<i>XYZ</i> for aggregation 'XYZ' instead.
	 *
	 * @param {string} sAggregationName
	 *   Name of the aggregation to remove all objects from
	 * @param {boolean} [bSuppressInvalidate=false]
	 *   If true, this <code>ManagedObject</code> is not marked as changed
	 * @returns {sap.ui.base.ManagedObject[]} An array of the removed elements (might be empty)
	 * @protected
	 */
	ManagedObject.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate){
		var oForwarder = this.getMetadata().getAggregationForwarder(sAggregationName);
		if (oForwarder) {
			return oForwarder.removeAll(this);
		}

		var aChildren = this.mAggregations[sAggregationName];
		if (!aChildren) {
			return [];
		}

		delete this.mAggregations[sAggregationName];

		// maybe there is no aggregation to remove
		if (!aChildren.length) {
			return aChildren;
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		for (var i = 0; i < aChildren.length; i++) {
			aChildren[i].setParent(null);
		}
		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return aChildren;
	};

	/**
	 * Destroys (all) the managed object(s) in the aggregation named <code>sAggregationName</code> and empties the
	 * aggregation. If the aggregation did contain any object, this ManagedObject is marked as changed.
	 *
	 * <b>Note:</b> This method is a low-level API as described in <a href="#lowlevelapi">the class documentation</a>.
	 * Applications or frameworks must not use this method to generically destroy all objects in an aggregation.
	 * Use the concrete method destroy<i>XYZ</i> for aggregation 'XYZ' instead.
	 *
	 * @param {string}
	 *            sAggregationName the name of the aggregation
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate){
		var oForwarder = this.getMetadata().getAggregationForwarder(sAggregationName);
		if (oForwarder) {
			return oForwarder.destroy(this);
		}

		var aChildren = this.mAggregations[sAggregationName],
			i, aChild;

		if (!aChildren) {
			return this;
		}

		// Deleting the aggregation here before destroying the children is a BUG:
		//
		// The destroy() method on the children calls _removeChild() on this instance
		// to properly remove each child from the bookkeeping by executing the named
		// removeXYZ() method. But as the aggregation is deleted here already,
		// _removeChild() doesn't find the child in the bookkeeping and therefore
		// refuses to work. As a result, side effects from removeXYZ() are missing.
		//
		// The lines below marked with 'FIXME DESTROY' sketch a potential fix, but
		// that fix has proven to be incompatible for several controls that don't
		// properly implement removeXYZ(). As this might affect custom controls
		// as well, the fix has been abandoned.
		//
		delete this.mAggregations[sAggregationName]; //FIXME DESTROY: should be removed here

		// maybe there is no aggregation to destroy
		if (Array.isArray(aChildren) && !aChildren.length) {
			return this;
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		if (aChildren instanceof ManagedObject) {
			// FIXME DESTROY: this._removeChild(aChildren, sAggregationName, bSuppressInvalidate); // (optional, done by destroy())
			aChildren.destroy(bSuppressInvalidate);

			//fire aggregation lifecycle event on current parent as the control is removed, but not inserted to a new parent
			// FIXME DESTROY: no more need to fire event here when destroy ever should be fixed
			if (this._observer) {
				this._observer.aggregationChange(this, sAggregationName, "remove", aChildren);
			}
		} else if (Array.isArray(aChildren)) {
			for (i = aChildren.length - 1; i >= 0; i--) {
				aChild = aChildren[i];
				if (aChild) {
					// FIXME DESTROY: this._removeChild(aChild, sAggregationName, bSuppressInvalidate); // (optional, done by destroy())
					aChild.destroy(bSuppressInvalidate);

					//fire aggregation lifecycle event on current parent as the control is removed, but not inserted to a new parent
					if (this._observer) {
						this._observer.aggregationChange(this, sAggregationName, "remove", aChild);
					}
				}
			}
		}

		// FIXME DESTROY: // 'delete' aggregation only now so that _removeChild() can still do its cleanup
		// FIXME DESTROY: delete this.mAggregations[sAggregationName];

		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return this;
	};

	// ######################################################################################################
	// End of Aggregations
	// ######################################################################################################


	/**
	 * Marks this object and its aggregated children as 'invalid'.
	 *
	 * The term 'invalid' originally was introduced by controls where a change to the object's state made the
	 * rendered DOM <i>invalid</i>. Later, the concept of invalidation was moved up in the inheritance hierarchy
	 * to <code>ManagedObject</code>, but the term was kept for compatibility reasons.
	 *
	 * Managed settings (properties, aggregations, associations) invalidate the corresponding object automatically.
	 * Changing the state via the standard mutators, therefore, does not require an explicit call to <code>invalidate</code>.
	 * The same applies to changes made via data binding, as it internally uses the standard mutators.
	 *
	 * By default, a <code>ManagedObject</code> propagates any invalidation to its parent, unless the invalidation is
	 * suppressed on the parent. Controls or UIAreas handle invalidation on their own by triggering a re-rendering.
	 *
	 * @protected
	 */
	ManagedObject.prototype.invalidate = function() {
		if (this.oParent && this.oParent.isInvalidateSuppressed && !this.oParent.isInvalidateSuppressed()) {
			this.oParent.invalidate(this);
		}
	};


	/**
	 * Returns whether re-rendering is currently suppressed on this ManagedObject.
	 *
	 * @returns {boolean} Whether re-rendering is suppressed
	 * @protected
	 */
	ManagedObject.prototype.isInvalidateSuppressed = function() {
		return this.iSuppressInvalidate > 0;
	};

	/**
	 * Removes the given child from this object's named aggregation.
	 * @see sap.ui.core.UIArea#_removeChild
	 * @see sap.ui.base.ManagedObject#setParent
	 *
	 * @param {sap.ui.base.ManagedObject}
	 *            oChild the child object to be removed
	 * @param {string}
	 *            sAggregationName the name of this object's aggregation
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @private
	 */
	ManagedObject.prototype._removeChild = function(oChild, sAggregationName, bSuppressInvalidate) {
		if (!sAggregationName) {
			// an aggregation name has to be specified!
			future.errorThrows("Cannot remove aggregated child without aggregation name.", null, this);
		} else {
			// set suppress invalidate flag
			if (bSuppressInvalidate) {
				this.iSuppressInvalidate++;
			}

			var iIndex = this.indexOfAggregation(sAggregationName, oChild);
			var oAggregationInfo = this.getMetadata().getAggregation(sAggregationName);
			// Note: we assume that this is the given child's parent, i.e. -1 not expected!
			if (iIndex == -2) { // 0..1
				if (oAggregationInfo && this[oAggregationInfo._sMutator]) { // TODO properly deal with hidden aggregations
					this[oAggregationInfo._sMutator](null);
				} else {
					this.setAggregation(sAggregationName, null, bSuppressInvalidate);
				}
			} else if (iIndex > -1 ) { // 0..n
				if (oAggregationInfo && this[oAggregationInfo._sRemoveMutator]) { // TODO properly deal with hidden aggregations
					this[oAggregationInfo._sRemoveMutator](iIndex);
				} else {
					this.removeAggregation(sAggregationName, iIndex, bSuppressInvalidate);
				}
			} /* else {
				// item not found, this is unexpected; maybe mutator already removed it?
				// we could at least invalidate this, but we are not aware of any changes that would justify this
				if (!this.isInvalidateSuppressed()) {
					this.invalidate();
				}
			}*/

			// reset suppress invalidate flag
			if (bSuppressInvalidate) {
				this.iSuppressInvalidate--;
			}
		}
	};

	/**
	 * Checks whether object <code>a</code> is an inclusive descendant of object <code>b</code>.
	 *
	 * @param {sap.ui.base.ManagedObject} a Object that should be checked for being a descendant
	 * @param {sap.ui.base.ManagedObject} b Object that should be checked for having a descendant
	 * @returns {boolean} Whether <code>a</code> is a descendant of (or the same as) <code>b</code>
	 * @private
	 */
	function isInclusiveDescendantOf(a, b) {
		while ( a && a !== b ) {
			a = a.oParent;
		}
		return !!a;
	}

	/**
	 * Defines this object's new parent. If no new parent is given, the parent is
	 * just unset and we assume that the old parent has removed this child from its
	 * aggregation. But if a new parent is given, this child is first removed from
	 * its old parent.
	 *
	 * @param {sap.ui.base.ManagedObject}
	 *            oParent the object that becomes this objects's new parent
	 * @param {string}
	 *            sAggregationName the name of the parent objects's aggregation
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed. The old parent, however, is marked.
	 * @returns {this}
	 *            Returns <code>this</code> to allow method chaining
	 * @private
	 */
	ManagedObject.prototype.setParent = function(oParent, sAggregationName, bSuppressInvalidate) {
		assert(oParent == null || oParent instanceof ManagedObject, "oParent either must be null, undefined or a ManagedObject");
		var observer;

		if ( !oParent ) {

			//fire aggregation lifecycle event on current parent as the control is removed, but not inserted to a new parent
			if (this.oParent) {
				observer = this._observer || this.oParent._observer;
				if (observer) {
					observer.parentChange(this,this.sParentAggregationName,"unset", this.oParent);
				}

				// "this" is now moved to a different place; remove any forwarding information
				if (this.aAPIParentInfos && this.aAPIParentInfos.forwardingCounter === 0) {
					delete this.aAPIParentInfos; // => clear the previous API parent infos
				}
			}

			this.oParent = null;
			this.sParentAggregationName = null;
			var oPropagatedProperties = ManagedObject._oEmptyPropagatedProperties;

			/* In case of a 'move' - remove/add controls synchronously in an aggregation -
			 * we should not propagate synchronously when setting the parent to null.
			 * Synchronous propagation destroys the bindings when removing a control
			 * from the aggregation and recreates them when adding the control again.
			 * This could lead to a data refetch, and in some scenarios even to endless
			 * request loops.
			 */
			if (oPropagatedProperties !== this.oPropagatedProperties) {
				this.oPropagatedProperties = oPropagatedProperties;
				if (!this._bIsBeingDestroyed) {
					Promise.resolve().then(function() {
						// if object is being destroyed or parent is set again (move) no propagation is needed
						if (!this.oParent) {
							this.updateBindings(true, null);
							this.updateBindingContext(false, undefined, true);
							this.propagateProperties(true);
							this.fireModelContextChange();
						}
					}.bind(this));
				}
			}

			this._oContextualSettings = ManagedObject._defaultContextualSettings;
			if (!this._bIsBeingDestroyed) {
				Promise.resolve().then(function() {
					// if object is being destroyed or parent is set again (move) no propagation is needed
					if (!this.oParent) {
						this._propagateContextualSettings();
					}
				}.bind(this));
			}

			ActivityDetection.refresh();

			// Note: no need (and no way how) to invalidate
			return;
		}

		if ( isInclusiveDescendantOf(oParent, this) ) {
			throw new Error("Cycle detected: new parent '" + oParent + "' is already a descendant of (or equal to) '" + this + "'");
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			//Refresh only for changes with suppressed invalidation (others lead to rerendering and refresh is handled there)
			ActivityDetection.refresh();
			oParent.iSuppressInvalidate++;
		}

		var oOldParent = this.getParent();
		if (oOldParent) { // remove this object from its old parent
			// Note: bSuppressInvalidate  by intention is not propagated to the old parent.
			// It is not sure whether the (direct or indirect) caller of setParent
			// has enough knowledge about the old parent to automatically propagate this.
			// If needed, callers can first remove the object from the oldParent (specifying a
			// suitable value for bSuppressInvalidate there) and only then call setParent.
			oOldParent._removeChild(this, this.sParentAggregationName);
		}
		// adopt new parent
		this.oParent = oParent;
		this.sParentAggregationName = sAggregationName;

		if (!oParent.mSkipPropagation[sAggregationName]) {
			//get properties to propagate - get them from the original API parent in case this control was moved by aggregation forwarding
			var oPropagatedProperties = this.aAPIParentInfos ? this.aAPIParentInfos[0].parent._getPropertiesToPropagate() : oParent._getPropertiesToPropagate();

			if (oPropagatedProperties !== this.oPropagatedProperties) {
				this.oPropagatedProperties = oPropagatedProperties;
				// update bindings
				if (this.hasModel()) {
					this.updateBindings(true, null); // TODO could be restricted to models that changed
					this.updateBindingContext(false, undefined, true);
					this.propagateProperties(true);
				}
				this._callPropagationListener();
				this.fireModelContextChange();
			}
		}

		this._applyContextualSettings(oParent._oContextualSettings);

		// only the parent knows where to render us, so we have to invalidate it
		if ( oParent && !oParent.isInvalidateSuppressed() ) {
			oParent.invalidate(this);
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			oParent.iSuppressInvalidate--;
		}

		//observe the aggregation change
		observer = this._observer || this.oParent._observer;
		if (observer) {
			observer.parentChange(this, sAggregationName, "set", this.oParent);
		}
		return this;
	};

	/**
	 * Applies new contextual settings to a managed object, and propagates them to its children
	 * @param {object} [oContextualSettings={}]
	 * @private
	 */
	ManagedObject.prototype._applyContextualSettings = function(oContextualSettings) {
		oContextualSettings = oContextualSettings || ManagedObject._defaultContextualSettings;
		if (this._oContextualSettings !== oContextualSettings) {
			this._oContextualSettings = oContextualSettings;
			this._propagateContextualSettings();
			if (this._bIsOwnerActive) {
				this._onContextualSettingsChanged();
			}
		}
	};

	/**
	 * Hook method to let descendants of ManagedObject know when propagated contextual settings have changed
	 * @private
	 * @ui5-restricted sap.ui.core.Element
	 */
	ManagedObject.prototype._onContextualSettingsChanged = function () {};

	/**
	 * Recursively applies a managed object's contextual settings to its children
	 * @private
	 */
	ManagedObject.prototype._propagateContextualSettings = function () {
		var oSettings = this._oContextualSettings,
			sAggregationName,
			oAggregation,
			i;

		for (sAggregationName in this.mAggregations) {

			oAggregation = this.mAggregations[sAggregationName];
			if (oAggregation instanceof ManagedObject) {
				oAggregation._applyContextualSettings(oSettings);
			} else if (oAggregation instanceof Array) {
				for (i = 0; i < oAggregation.length; i++) {
					if (oAggregation[i] instanceof ManagedObject) {
						oAggregation[i]._applyContextualSettings(oSettings);
					}
				}
			}
		}
	};

	/**
	 * Returns the contextual settings of a ManagedObject
	 * @returns {undefined|*}
	 * @private
	 */
	ManagedObject.prototype._getContextualSettings = function () {
		return this._oContextualSettings;
	};



	/**
	 * Returns the parent managed object or <code>null</code> if this object hasn't been added to a parent yet.
	 *
	 * The parent returned by this method is the technical parent used for data binding, invalidation,
	 * rendering etc. It might differ from the object on which the application originally added this object
	 * (the so called 'API parent'): some composite controls internally use hidden controls or containers
	 * to store their children. This method will return the innermost container that technically contains this
	 * object as a child.
	 *
	 * <b>Example:</b>
	 *
	 * Assume that a <code>Dialog</code> internally uses a (hidden) <code>VerticalLayout</code> to store its content:
	 *
	 * <pre>
	 *   Dialog (API parent)
	 *    \__ VerticalLayout (hidden composite part)
	 *       \__ Text (API child)
	 * </pre>
	 *
	 * If you add some content by calling the <code>Dialog.prototype.addContent</code> API, this will lead
	 * to the following observations:
	 *
	 * <pre>
	 *   oDialog.addContent(oText);
	 *   console.log(oText.getParent() === oDialog);  // false
	 *   console.log(oText.getParent() instanceof VerticalLayout); // true
	 *   console.log(oText.getParent().getParent() === oDialog); // true now, but might fail with later versions
	 * </pre>
	 *
	 * Technically, from API perspective, <code>oText</code> is added as a child to <code>Dialog</code>.
	 * But internally, the <code>Dialog</code> adds the child to the hidden <code>VerticalLayout</code> container.
	 * If you now call the <code>getParent</code> method of the child, you will get the internal
	 * <code>VerticalLayout</code> object and not the <code>Dialog</code> API parent.
	 *
	 * <b>Note: </b> The internal (hidden) structure of a composite control is not fixed and may be changed
	 * (see also our "Compatibility Rules"). Therefore, you should <b>never</b> rely on a specific structure or
	 * object being returned by <code>getParent</code>.
	 *
	 * <b>Note: </b> There is no API to determine the original API parent.
	 *
	 * @returns {sap.ui.base.ManagedObject|null} The technical parent managed object or <code>null</code>
	 * @public
	 */
	ManagedObject.prototype.getParent = function() {
		/* Be aware that internally this.oParent is used to reduce method calls.
		 * Check for side effects when overriding this method */
		return this.oParent;
	};

	/**
	 * Cleans up the resources associated with this object and all its aggregated children.
	 *
	 * After an object has been destroyed, it can no longer be used!
	 *
	 * Applications should call this method if they don't need the object any longer.
	 *
	 * @param {boolean} [bSuppressInvalidate=false] If <code>true</code>, this ManagedObject and all its ancestors won't be invalidated.
	 *      <br>This flag should be used only during control development to optimize invalidation procedures.
	 *      It should not be used by any application code.
	 * @public
	 */
	ManagedObject.prototype.destroy = function(bSuppressInvalidate) {
		var sName, oBindingInfo;
		// ignore repeated calls
		if (this.bIsDestroyed) {
			return;
		}

		var that = this;

		// avoid binding update/propagation
		this._bIsBeingDestroyed = true;

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		// Data Binding
		for (sName in this.mBindingInfos) {
			oBindingInfo = this.mBindingInfos[sName];
			if (oBindingInfo.binding) {
				if (oBindingInfo.factory) {
					this._detachAggregationBindingHandlers(sName);
				} else {
					this._detachPropertyBindingHandlers(sName);
				}
			}
		}

		for (sName in this.mObjectBindingInfos) {
			oBindingInfo = this.mObjectBindingInfos[sName];
			if (oBindingInfo.binding) {
				this._detachObjectBindingHandlers(oBindingInfo);
			}
		}

		if (this.exit) {
			_enforceNoReturnValue(this.exit(), /*mLogInfo=*/{ name: "exit", component: this.getId() }); // 'exit' hook isn't allowed to return any values.
		}

		// TODO: generic concept for exit hooks?
		if ( this._exitCompositeSupport ) {
			this._exitCompositeSupport();
		}

		// ensure that also our children are destroyed!!
		for (var oAggr in this.mAggregations) {
			this.destroyAggregation(oAggr, bSuppressInvalidate);
		}

		// Deregister, if available
		if (this.deregister) {
			this.deregister();
		}

		// remove this child from parent aggregation
		if (this.oParent && this.sParentAggregationName) {
			this.oParent._removeChild(this, this.sParentAggregationName, bSuppressInvalidate);
		}
		// for robustness only - should have been cleared by _removeChild already
		delete this.oParent;

		// Data Binding
		for (sName in this.mBindingInfos) {
			if (this.mBindingInfos[sName].factory) {
				this.unbindAggregation(sName, true);
			} else {
				this.unbindProperty(sName, true);
			}
		}

		for (sName in this.mObjectBindingInfos) {
			this.unbindObject(sName, /* _bSkipUpdateBindingContext */ true);
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		if ( this._observer ) {
			this._observer.objectDestroyed(this);
		}

		if ( this.aAPIParentInfos ) {
			this.aAPIParentInfos = null;
		}

		EventProvider.prototype.destroy.apply(this, arguments);

		// finally make the object unusable
		this.setParent = function(){
			throw Error("The object with ID " + that.getId() + " was destroyed and cannot be used anymore.");
		};

		// make visible that it's been destroyed.
		this.bIsDestroyed = true;
	};

	/**
	 * Checks whether the given value can be interpreted as a binding info and
	 * returns that binding info or an unescaped string or undefined when it is not.
	 *
	 * When the 'complex' binding syntax is enabled, the function might also return
	 * a string value in case the given value was a string, did not represent a binding
	 * but contained escaped special characters.
	 *
	 * There are two possible notations for binding information in the object literal notation
	 * of the ManagedObject constructor and ManagedObject.applySettings:
	 * <ul>
	 *   <li>property: "{path}"
	 *   This is used for property binding and can only contain the path.
	 *   </li>
	 *   <li>property:{path:"path", template:oTemplate}
	 *   This is used for aggregation binding, where a template is required or can
	 *   be used for property binding when additional data is required (e.g. formatter).
	 *   </li>
	 * </ul>
	 *
	 * @param {object} oValue
	 * @param {object} oScope
	 * @param {boolean} bDetectValue
	 *
	 * @returns {object|string|undefined} the binding info object or an unescaped string or <code>undefined</code>.
	 *     If a binding info is returned, it contains at least a path property
	 *     or nested bindings (parts) and, depending on the binding type,
	 *     additional properties
	 *
	 * @private
	 */
	ManagedObject.prototype.extractBindingInfo = function(oValue, oScope, bDetectValue) {
		var oBindingInfo = BindingInfo.extract(oValue, oScope, bDetectValue);
		// property:{path:"path", template:oTemplate}
		// Binding templates should only be constructed from object syntax,
		// string representation for templates is not supported
		if (typeof oValue === "object" && oBindingInfo && oBindingInfo.template) {
			// allow JSON syntax for templates
			oBindingInfo.template = makeObject(oBindingInfo.template);
		}
		return oBindingInfo;
	};

	/**
	 * Returns the binding info for the given property or aggregation.
	 *
	 * The binding info contains information about path, binding object, format options, sorter, filter etc.
	 * for the property or aggregation. As the binding object is only created when the model becomes available,
	 * the <code>binding</code> property may be undefined.
	 *
	 * @param {string} sName Name of the property or aggregation
	 *
	 * @returns {sap.ui.base.ManagedObject.PropertyBindingInfo|sap.ui.base.ManagedObject.AggregationBindingInfo}
	 *  A binding info object, containing at least a <code>path</code> or <code>parts</code> property and, depending on
	 *  the binding type, additional properties
	 *
	 * @protected
	 */
	ManagedObject.prototype.getBindingInfo = function(sName) {
		var oForwarder = this.getMetadata().getAggregationForwarder(sName);
		if (oForwarder && oForwarder.forwardBinding) {
			return oForwarder.getTarget(this).getBindingInfo(oForwarder.targetAggregationName);
		}

		return this.mBindingInfos[sName];
	};

	/**
	 * Returns the object binding info for the given model.
	 *
	 * The binding info contains information about path, binding object, format options, sorter, filter etc.
	 * for the model. As the binding object is only created when the model becomes available,
	 * the <code>binding</code> property may be undefined.
	 *
	 * @param {string} [sModelName=undefined] Non-empty name of the model or <code>undefined</code>
	 *    Omitting the model name (or using the value <code>undefined</code>) is explicitly allowed and
	 *    refers to the default model.
	 * @returns {object} A binding info object, containing at least a <code>path</code> and additional properties
	 * @private
	 */
	ManagedObject.prototype._getObjectBindingInfo = function(sModelName) {
		return this.mObjectBindingInfos[sModelName];
	};

	/**
	 * Configuration for the binding of a managed object
	 *
	 * <code>path</code> is the only mandatory property, all others are optional.
	 *
	 * @typedef {object} sap.ui.base.ManagedObject.ObjectBindingInfo
	 *
	 * @property {string} path
	 *   Path in the model to bind to, either an absolute path or relative to the binding context for the
	 *   corresponding model. If the path contains a '&gt;' sign, the string preceding it will override
	 *   the <code>model</code> property, and the remainder after the '&gt;' sign will be used as binding path
	 * @property {string} [model]
	 *   Name of the model to bind against; when <code>undefined</code> or omitted, the default model is used
	 * @property {boolean} [suspended]
	 *   Whether the binding is initially suspended
	 * @property {object} [parameters]
	 *   Map of additional parameters for this binding; the names and value ranges of the supported
	 *   parameters depend on the model implementation and should be documented with the
	 *   <code>bindContext</code> method of the corresponding model class or with the model-specific
	 *   subclass of <code>sap.ui.model.ContextBinding</code>
	 * @property {Object<string,function>} [events]
	 *   Map of event handler functions keyed by the name of the binding events that they are attached to.
	 *   The names and value ranges of the supported events depend on the model implementation and should be
	 *   documented with the model-specific subclass of <code>sap.ui.model.ContextBinding</code>.
	 *
	 * @public
	 */

	/**
	 * Bind the object to the referenced entity in the model.
	 *
	 * The entity is used as the binding context to resolve bound properties or aggregations of the object itself
	 * and all of its children relatively to the given path. If a relative binding path is used, it will be
	 * evaluated anew whenever the parent context changes.
	 *
	 * Whenever the corresponding model becomes available or changes (either via a call to {@link #setModel setModel}
	 * or propagated from a {@link #getParent parent}), its {@link sap.ui.model.Model#bindContext bindContext}
	 * method will be called to create a new {@link sap.ui.model.ContextBinding ContextBinding} with the configured
	 * binding options.
	 *
	 * There's no difference between <code>bindObject</code> and {@link sap.ui.core.Element#bindElement bindElement}.
	 * Method <code>bindObject</code> was introduced together with <code>ManagedObject</code> to make context bindings
	 * also available on <code>ManagedObject</code>s. The new name was chosen to reflect that the binding is not
	 * necessarily applied to an <code>Element</code>, it also could be applied to a component or some other
	 * <code>ManagedObject</code>.
	 *
	 * Also see {@link topic:91f05e8b6f4d1014b6dd926db0e91070 Context Binding} in the documentation.
	 *
	 * @param {sap.ui.base.ManagedObject.ObjectBindingInfo} oBindingInfo
	 *            Binding info
	 * @returns {this}
	 *            Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ManagedObject.prototype.bindObject = function(oBindingInfo) {
		var sModelName,
			sPath;

		// support legacy notation (sPath, mParameters)
		if (typeof oBindingInfo == "string") {
			sPath = oBindingInfo;
			oBindingInfo = {
				path: sPath,
				parameters: arguments[1]
			};
		}

		oBindingInfo = BindingInfo.createObject(oBindingInfo);
		sModelName = oBindingInfo.model;

		// if old binding exists, clean it up
		if ( this.getObjectBinding(sModelName) ) {
			this.unbindObject(sModelName, /* _bSkipUpdateBindingContext */ true);
			// We don't push down context changes here
			// Either this will happen with the _bindObject call below or the model
			// is not available yet and wasn't available before -> no change of contexts
		}

		this.mObjectBindingInfos[sModelName] = oBindingInfo;

		// if the models are already available, create the binding
		if (BindingInfo.isReady(oBindingInfo, this)) {
			this._bindObject(oBindingInfo);
		}

		return this;
	};

	function logError(sFunctionName) {
		future.errorThrows("Unexpected call of '" + sFunctionName + "'.");
	}

	/**
	 * Create object binding.
	 *
	 * @param {sap.ui.base.ManagedObject.ObjectBindingInfo} oBindingInfo The bindingInfo object
	 * @private
	 */
	ManagedObject.prototype._bindObject = logError.bind(null, "_bindObject");

	/**
	 * Detach all object binding event handler
	 *
	 * @param {sap.ui.base.ManagedObject.ObjectBindingInfo} oBindingInfo The BindingInfo to detach the handler for.
	 * @private
	 */
	ManagedObject.prototype._detachObjectBindingHandlers = logError.bind(null, "_detachObjectBindingHandlers");

	/**
	 * Removes the defined binding context of this object, all bindings will now resolve
	 * relative to the parent context again.
	 *
	 * @param {string} [sModelName] Name of the model to remove the context for.
	 * @returns {this} Reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.unbindObject = function(sModelName, /* internal use only */ _bSkipUpdateBindingContext) {
		var oBindingInfo = this.mObjectBindingInfos[sModelName];
		if (oBindingInfo) {
			delete this.mObjectBindingInfos[sModelName];
			if (oBindingInfo.binding) {
				this._unbindObject(oBindingInfo, sModelName, /* internal use only */ _bSkipUpdateBindingContext);
			}
		}
		return this;
	};

	ManagedObject.prototype._unbindObject = logError.bind(null, "_unbindObject");

	/**
	 * Configuration for the binding of a managed property.
	 *
	 * Exactly one of <code>path</code>, <code>value</code> or <code>parts</code> must be specified.
	 * The same configuration can be provided for the parts of a composite binding, but
	 * nesting composite bindings in composite bindings is not yet supported.
	 *
	 * Aggregations with cardinality 0..1 that have a simple, alternative type (aka <code>altType</code>),
	 * can be bound with the same kind of configuration, e.g. the <code>tooltip</code> aggregation of elements.
	 *
	 * @typedef {object} sap.ui.base.ManagedObject.PropertyBindingInfo
	 *
	 * @property {string} [path]
	 *   Path in the model to bind to, either an absolute path or relative to the binding context for the
	 *   corresponding model; when the path contains a '&gt;' sign, the string preceding it will override
	 *   the <code>model</code> property and the remainder after the '&gt;' will be used as binding path
	 * @property {string} [value]
	 *   Since 1.61, defines a static binding with the given value.
	 * @property {string} [model]
	 *   Name of the model to bind against; when <code>undefined</code> or omitted, the default model is used
	 * @property {boolean} [suspended]
	 *   Whether the binding should be suspended initially
	 * @property {function} [formatter]
	 *   Function to convert model data into a property value
	 * @property {boolean} [useRawValues]
	 *   Whether the parameters to the formatter function should be passed as raw values.
	 *   In this case the specified types for the binding parts are not used and the values
	 *   are not formatted.
	 *
	 *   <b>Note</b>: use this flag only when using multiple bindings. If you use only one
	 *   binding and want raw values then simply don't specify a type for that binding.
	 *
	 * @property {boolean} [useInternalValues]
	 *   Whether the parameters to the formatter function should be passed as the related JavaScript primitive values.
	 *   In this case the values of the model are parsed by the {@link sap.ui.model.SimpleType#getModelFormat model format}
	 *   of the specified types from the binding parts.
	 *
	 *   <b>Note</b>: use this flag only when using multiple bindings.
	 * @property {sap.ui.model.Type|string} [type]
	 *   A type object or the name of a type class to create such a type object; the type
	 *   will be used for converting model data to a property value (aka "formatting") and
	 *   vice versa (in binding mode <code>TwoWay</code>, aka "parsing")
	 * @property {string} [targetType]
	 *   Target type to be used by the type when formatting model data, for example "boolean"
	 *   or "string" or "any"; defaults to the property's type
	 * @property {object} [formatOptions]
	 *   Format options to be used for the type; only taken into account when the type is
	 *   specified by its name - a given type object won't be modified
	 * @property {object} [constraints]
	 *   Additional constraints to be used when constructing a type object from a type name,
	 *   ignored when a type object is given
	 * @property {sap.ui.model.BindingMode} [mode=Default]
	 *   Binding mode to be used for this property binding (e.g. one way)
	 * @property {object} [parameters=null]
	 *   Map of additional parameters for this binding; the names and value ranges of the supported
	 *   parameters depend on the model implementation, they should be documented with the
	 *   <code>bindProperty</code> method of the corresponding model class or with the model specific
	 *   subclass of <code>sap.ui.model.PropertyBinding</code>
	 * @property {Object<string,function>} [events=null]
	 *   Map of event handler functions keyed by the name of the binding events that they should be attached to
	 * @property {Array<string|sap.ui.base.ManagedObject.PropertyBindingInfo>} [parts]
	 *   Array of binding info objects for the parts of a composite binding; the structure of
	 *   each binding info is the same as described for the <code>oBindingInfo</code> as a whole.
	 *
	 *   If a part is not specified as a binding info object but as a simple string, a binding info object
	 *   will be created with that string as <code>path</code>. The string may start with a model name prefix
	 *   (see property <code>path</code>).
	 *
	 *   <b>Note</b>: recursive composite bindings are currently not supported. Therefore, a part must not
	 *   contain a <code>parts</code> property.
	 *
	 * @public
	 */

	/**
	 * Binds a property to the model.
	 *
	 * Whenever the corresponding model becomes available or changes (either via a call to {@link #setModel setModel}
	 * or propagated from a {@link #getParent parent}), its {@link sap.ui.model.Model#bindProperty bindProperty}
	 * method will be called to create a new {@link sap.ui.model.PropertyBinding PropertyBinding} with the configured
	 * binding options.
	 *
	 * The Setter for the given property will be called by the binding with the value retrieved from the data
	 * model. When the binding mode is <code>OneTime</code>, the property will be set only once. When it is
	 * <code>OneWay</code>, the property will be updated whenever the corresponding data in the model changes.
	 * In mode <code>TwoWay</code>, changes to the property (not originating in the model) will be
	 * reported back to the model (typical use case: user interaction changes the value of a control).
	 *
	 * This is a generic method which can be used to bind any property to the model. A managed
	 * object may flag any property in its metadata with <code>bindable: "bindable"</code> to additionally
	 * provide named methods to bind and unbind the corresponding property.
	 *
	 * <b>Composite Binding</b><br>
	 * A composite property binding which combines data from multiple model paths can be declared using
	 * the <code>parts</code> parameter instead of <code>path</code>. The <code>formatter</code> function
	 * or a {@link sap.ui.model.CompositeType composite type} then can be used to combine the parts,
	 * Properties with a composite binding are also known as "calculated fields".
	 *
	 * Example:
	 * <pre>
	 *   oTxt.bindValue({
	 *     parts: [
	 *       {path: "/firstName", type: "sap.ui.model.type.String"},
	 *       {path: "myModel2>/lastName"}
	 *     ]
	 *   });
	 * </pre>
	 *
	 * Note that a composite binding will be forced into mode <code>OneWay</code> when one of the
	 * binding parts is not in mode <code>TwoWay</code>.
	 *
	 * <b>Static Binding</b><br>
	 * A StaticBinding allows to define static values within a <code>sap.ui.model.CompositeBinding</code>.
	 * It behaves like a property binding but always returns the value that is stored in the binding itself.
	 * The binding does not have a <code>sap.ui.model.Context</code>, a <code>sap.ui.model.Model</code> or
	 * a <code>oBindingInfo.path</code>.
	 * A StaticBinding is created when a <code>oBindingInfo.value</code> is passed instead
	 * of a <code>oBindingInfo.path</code> or <code>oBindingInfo.parts[i].path</code>.
	 *
	 * Also see {@link sap.ui.model.StaticBinding StaticBinding} in the documentation.
	 *
	 * <b>Formatter Functions</b><br>
	 * When a formatter function is specified for the binding or for a binding part, it will be
	 * called with the value of the bound model property. After setting the initial property value,
	 * the formatter function will only be called again when the bound model property changes
	 * (simple property binding) or when at least one of the bound model properties changes
	 * (formatter function of a composite binding). Note that a binding only monitors the
	 * bound model data for changes. Dependencies of the formatter implementation to other model
	 * data is not known to the binding and changes won't be detected.
	 *
	 * When the formatter for a property binding (simple or composite) is called, the managed object
	 * will be given as <code>this</code> context. For formatters of binding parts in a composite
	 * binding, this is not the case.
	 *
	 * Also see {@link topic:91f0652b6f4d1014b6dd926db0e91070 Property Binding} in the documentation.
	 *
	 * @param {string} sName
	 *            Name of a public property to bind; public aggregations of cardinality 0..1 that have an alternative,
	 *            simple type (e.g. "string" or "int") can also be bound with this method
	 * @param {sap.ui.base.ManagedObject.PropertyBindingInfo} oBindingInfo
	 *            Binding information
	 * @returns {this}
	 *            Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ManagedObject.prototype.bindProperty = function(sName, oBindingInfo, /* undocumented, old API only: */ _vFormat, _sMode) {
		var oProperty = this.getMetadata().getPropertyLikeSetting(sName);

		// check whether property or alternative type on aggregation exists
		if (!oProperty) {
			throw new Error("Property \"" + sName + "\" does not exist in " + this);
		}

		// old API compatibility (sName, sPath, _vFormat, _sMode)
		if (typeof oBindingInfo == "string") {
			oBindingInfo = {
				parts: [ {
					path: oBindingInfo,
					type: BaseObject.isObjectA(_vFormat, "sap.ui.model.Type") ? _vFormat : undefined,
					mode: _sMode
				} ],
				formatter: typeof _vFormat === 'function' ? _vFormat : undefined
			};
		}

		// if property is already bound, unbind it first
		if (this.isBound(sName)) {
			this.unbindProperty(sName, true);
		}

		oBindingInfo = BindingInfo.createProperty(oBindingInfo);

		// store binding info to create the binding, as soon as the model is available, or when the model is changed
		this.mBindingInfos[sName] = oBindingInfo;

		if (this._observer) {
			this._observer.bindingChange(this, sName, "prepare", oBindingInfo, "property");
		}

		// if the models are already available, create the binding
		if (BindingInfo.isReady(oBindingInfo, this)) {
			this._bindProperty(sName, oBindingInfo);
		}
		return this;
	};

	ManagedObject.prototype._bindProperty = function(sName, oBindingInfo) {
		/* Special case for handling StaticBindings:
		If all parts are a StaticBinding no mixin of the binding relevant code
		is done via a Model. In this case we need to handle these static
		bindings manually by simulating its static behavior:
		  - call formatter
		  - call property mutator
		If at least one part refers to a real Model this
		code will be overwritten by the mixin and works as before.*/
		var bIsStaticOnly = true;
		for (var i = 0; i < oBindingInfo.parts.length; i++) {
			if (oBindingInfo.parts[i].value === undefined) {
				bIsStaticOnly = false;
				break;
			}
		}
		// The special treatment of early 'static-only' StaticBindings is making compromises on a couple of things:
		//   - no async type can be supported
		//   - no handling of parse/validate exceptions
		//   - observers won't be called
		if (bIsStaticOnly) {
			var aValues = [];
			oBindingInfo.parts.forEach(function(oPart) {
				aValues.push(oPart.formatter ? oPart.formatter(oPart.value) : oPart.value);
			});
			var vValue = oBindingInfo.formatter ? oBindingInfo.formatter(aValues) : aValues.join(" ");
			var oPropertyInfo = this.getMetadata().getPropertyLikeSetting(sName);
			this[oPropertyInfo._sMutator](vValue);
		} else {
			logError.call(this, "_bindProperty");
		}
	};

	/**
	 * Detach all property binding event handler
	 *
	 * Note: The DataState event handler could not be detached here. This must happen after
	 * the destroy call to correctly cleanup messages. We leave it in unbindProperty and
	 * check for destroy state in the handler itself.
	 *
	 * @param {string} sName the name of the property
	 * @private
	 */
	ManagedObject.prototype._detachPropertyBindingHandlers = function(sName) { };

	/**
	 * Unbind the property from the model
	 *
	 * @param {string} sName the name of the property
	 * @param {boolean} bSuppressReset whether the reset to the default value when unbinding should be suppressed
	 * @returns {this} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.unbindProperty = function(sName, bSuppressReset) {
		var oBindingInfo = this.mBindingInfos[sName];
		if (oBindingInfo) {
			if (oBindingInfo.binding) {
				this._unbindProperty(oBindingInfo, sName);
			}

			if (this._observer && !this._bIsBeingDestroyed) {
				this._observer.bindingChange(this,sName,"remove", this.mBindingInfos[sName], "property");
			}

			delete this.mBindingInfos[sName];
			if (!bSuppressReset) {
				this.resetProperty(sName);
			}
		}
		return this;
	};

	ManagedObject.prototype._unbindProperty = logError.bind(null, "_unbindProperty");

	/**
	 * Find out whether the given property is being updated. This occurs when the corresponding data in the model for
	 * the given property is changed. The method can be used to determine if the setter of a property is called
	 * from a model update.
	 *
	 * When the given property isn't bound at all, <code>false</code> is returned.
	 *
	 * @param {string} sName the name of the property
	 * @return {boolean} Whether the given property is being updated
	 * @private
	 * @ui5-restricted sap.m
	 */
	ManagedObject.prototype.isPropertyBeingUpdated = function(sName) {
		const oBindingInfo = this.getBindingInfo(sName);
		return !!(oBindingInfo?.skipModelUpdate);
	};

	/**
	 * Generic method which is called, whenever a property binding is changed.
	 *
	 * This method gets the external format from the property binding and applies
	 * it to the setter.
	 *
	 * @param {string} sName
	 *   Name of the property to update
	 * @private
	 */
	ManagedObject.prototype.updateProperty = function(sName) { };

	/**
	 * Update the property in the model if two way data binding mode is enabled
	 *
	 * @param {string} sName the name of the property to update
	 * @param {any} oValue the new value to set for the property in the model
	 * @param {any} oOldValue the previous value of the property
	 * @private
	 */
	ManagedObject.prototype.updateModelProperty = function(sName, oValue, oOldValue) { };

	// a non-falsy value used as default for 'templateShareable'.
	var MAYBE_SHAREABLE_OR_NOT = 1;

	/**
	 * Configuration for the binding of a managed aggregation of cardinality 0..n.
	 *
	 * <code>path</code> is the only mandatory property, all others are optional.
	 *
	 * @typedef {object} sap.ui.base.ManagedObject.AggregationBindingInfo
	 *
	 * @property {string} path
	 *   Path in the model to bind to, either an absolute path or relative to the binding context for the
	 *   corresponding model; when the path contains a '&gt;' sign, the string preceding it will override
	 *   the <code>model</code> property and the remainder after the '&gt;' will be used as binding path
	 * @property {string} [model]
	 *   Name of the model to bind against; when <code>undefined</code> or omitted, the default model is used
	 * @property {sap.ui.base.ManagedObject} [template]
	 *   The template to clone for each item in the aggregation; either a template or a factory must be given
	 * @property {boolean} [templateShareable=undefined]
	 *   Whether the framework should assume that the application takes care of the lifecycle of the given
	 *   template; when set to <code>true</code>, the template can be used in multiple bindings, either in
	 *   parallel or over time, and the framework won't clone it when this <code>ManagedObject</code> is cloned;
	 *   when set to <code>false</code>, the lifecycle of the template is bound to the lifecycle of the binding,
	 *   when the aggregation is unbound or when this <code>ManagedObject</code> is destroyed, the template also
	 *   will be destroyed, and when this  <code>ManagedObject</code> is cloned, the template will be cloned
	 *   as well; the third option (<code>undefined</code>) only exists for compatibility reasons, its behavior
	 *   is not fully reliable and it may leak the template
	 * @property {function(string, sap.ui.model.Context):sap.ui.base.ManagedObject} [factory]
	 *   A factory function that will be called to create an object for each item in the aggregation;
	 *   this is an alternative to providing a template object and can be used when the objects should differ
	 *   depending on the binding context; the factory function will be called with two parameters: an ID that
	 *   should be used for the created object and the binding context for which the object has to be created;
	 *   the function must return an object appropriate for the bound aggregation
	 * @property {boolean} [suspended]
	 *   Whether the binding should be suspended initially
	 * @property {int} [startIndex]
	 *   the first entry of the list to be created
	 * @property {int} [length]
	 *   The amount of entries to be created (may exceed the size limit of the model)
	 * @property {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [sorter]
	 *   The initial sort order (optional)
	 * @property {sap.ui.model.Filter|sap.ui.model.Filter[]} [filters]
	 *   The predefined filters for this aggregation (optional)
	 * @property {string|function(sap.ui.model.Context):string} [key]
	 *   Name of the key property or a function getting the context as only parameter to calculate a key
	 *   for entries. This can be used to improve update behaviour in models, where a key is not already
	 *   available.
	 * @property {object} [parameters=null]
	 *   Map of additional parameters for this binding; the names and value ranges of the supported
	 *   parameters depend on the model implementation, they should be documented with the
	 *   <code>bindList</code> method of the corresponding model class or with the model specific
	 *   subclass of <code>sap.ui.model.ListBinding</code>
	 * @property {function({key: string}):sap.ui.base.ManagedObject} [groupHeaderFactory]
	 *   A factory function to generate custom group visualization (optional). It should return a
	 *   control suitable to visualize a group header (e.g. a <code>sap.m.GroupHeaderListItem</code>
	 *   for a <code>sap.m.List</code>).
	 * @property {Object<string,function>} [events=null]
	 *   Map of event handler functions keyed by the name of the binding events that they should be attached to.
	 *   The names and value ranges of the supported events depend on the model implementation and should be
	 *   documented with the model-specific subclass of <code>sap.ui.model.ListBinding</code>.
	 *
	 * @public
	 */

	/**
	 * Bind an aggregation to the model.
	 *
	 * Whenever the corresponding model becomes available or changes (either via a call to {@link #setModel setModel}
	 * or propagated from a {@link #getParent parent}), its {@link sap.ui.model.Model#bindList bindList} method will
	 * be called to create a new {@link sap.ui.model.ListBinding ListBinding} with the configured binding options.
	 *
	 * The bound aggregation will use the given template, clone it for each item which exists in the bound list and set
	 * the appropriate binding context.
	 *
	 * This is a generic method which can be used to bind any aggregation to the model. A class may flag aggregations
	 * in its metadata with <code>bindable: "bindable"</code> to get typed <code>bind<i>Something</i></code> and
	 * <code>unbind<i>Something</i></code> methods for those aggregations.
	 *
	 * Also see {@link topic:91f057786f4d1014b6dd926db0e91070 List Binding (Aggregation Binding)} in the documentation.
	 *
	 * For more information on the <code>oBindingInfo.key</code> property and its usage, see
	 * {@link topic:7cdff73f308b4b10bdf7d83b7aba72e7 Extended Change Detection}.
	 *
	 * @param {string} sName
	 *            Name of a public aggregation to bind
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo
	 *            Binding info
	 *
	 * @returns {this}
	 *            Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ManagedObject.prototype.bindAggregation = function(sName, oBindingInfo) {
		var sPath,
			oTemplate,
			aSorters,
			aFilters,
			oMetadata = this.getMetadata(),
			oAggregationInfo = oMetadata.getAggregation(sName);

		// check whether aggregation exists
		if (!oAggregationInfo) {
			throw new Error("Aggregation \"" + sName + "\" does not exist in " + this);
		}
		if (!oAggregationInfo.multiple) {
			future.errorThrows("Binding of single aggregation \"" + sName + "\" of " + this + " is not supported!");
		}

		// Old API compatibility (sName, sPath, oTemplate, oSorter, aFilters)
		if (typeof oBindingInfo == "string") {
			sPath = arguments[1];
			oTemplate = arguments[2];
			aSorters = arguments[3];
			aFilters = arguments[4];
			oBindingInfo = {path: sPath, sorter: aSorters, filters: aFilters};
			// allow either to pass the template or the factory function as 3rd parameter
			if (oTemplate instanceof ManagedObject) {
				oBindingInfo.template = oTemplate;
			} else if (typeof oTemplate === "function") {
				oBindingInfo.factory = oTemplate;
			}
		}

		oBindingInfo[BindingInfo.OriginalParent] ??= this;

		var oForwarder = oMetadata.getAggregationForwarder(sName);
		if (oForwarder && oForwarder.forwardBinding) {
			oForwarder.getTarget(this).bindAggregation(oForwarder.targetAggregationName, oBindingInfo);
			return this;
		}

		// if aggregation is already bound, unbind it first
		if (this.isBound(sName)) {
			this.unbindAggregation(sName);
		}

		if (oBindingInfo.template) {
			// set default for templateShareable
			if ( oBindingInfo.template._sapui_candidateForDestroy ) {
				// template became active again, we should no longer consider to destroy it
				Log.warning(
					"A binding template that is marked as 'candidate for destroy' is reused in a binding. " +
					"You can use 'templateShareable:true' to fix this issue for all bindings that are affected " +
					"(The template is used in aggregation '" + sName + "' of object '" + this.getId() + "'). " +
					"For more information, see documentation under 'Aggregation Binding'.");
				delete oBindingInfo.template._sapui_candidateForDestroy;
			}
			if (oBindingInfo.templateShareable === undefined) {
				oBindingInfo.templateShareable = MAYBE_SHAREABLE_OR_NOT;
			}
		}
		oBindingInfo = BindingInfo.createAggregation(oBindingInfo, oAggregationInfo._doesNotRequireFactory);

		// store binding info to create the binding, as soon as the model is available, or when the model is changed
		this.mBindingInfos[sName] = oBindingInfo;

		if (!(oBindingInfo.template || oBindingInfo.factory)) {
			throw new Error("Missing template or factory function for aggregation " + sName + " of " + this + " !");
		}

		if (oBindingInfo.factory) {
			// unwrap factory if alread wrapped (e.g. bindingInfo is shared)
			var fnOriginalFactory = oBindingInfo.factory[BINDING_INFO_FACTORY_SYMBOL] || oBindingInfo.factory;

			// wrap runWithOwner() call around the original factory function
			var sOwnerId = this._sOwnerId;
			oBindingInfo.factory = function(sId, oContext) {
				// bind original factory with the two arguments: id and bindingContext
				return ManagedObject.runWithOwner(fnOriginalFactory.bind(null, sId, oContext), sOwnerId);
			};
			oBindingInfo.factory[BINDING_INFO_FACTORY_SYMBOL] = fnOriginalFactory;
		}

		if (this._observer) {
			this._observer.bindingChange(this, sName, "prepare", oBindingInfo, "aggregation");
		}

		// if the model is already available create the binding
		if (BindingInfo.isReady(oBindingInfo, this)) {
			this._bindAggregation(sName, oBindingInfo);
		}
		return this;
	};

	/**
	 * Create list/tree binding
	 *
	 * @param {string} sName Name of the aggregation
	 * @param {object} oBindingInfo The bindingInfo object
	 * @private
	 */
	ManagedObject.prototype._bindAggregation = logError.bind(null, "_bindAggregation");

	/**
	 * Detach all aggregation binding event handler
	 *
	 * @param {string} sName the name of the aggregation
	 * @private
	 */
	ManagedObject.prototype._detachAggregationBindingHandlers = logError.bind(null, "_detachAggregationBindingHandlers");

	/**
	 * Unbind the aggregation from the model.
	 *
	 * After unbinding, the current content of the aggregation is destroyed by default.
	 * When the <code>bSuppressReset</code> parameter is set, it is however retained.
	 *
	 * @param {string} sName Name of the aggregation
	 * @param {boolean} bSuppressReset Indicates whether destroying the content of the aggregation is skipped
	 * @returns {this} Reference to this instance itself
	 * @public
	 */
	ManagedObject.prototype.unbindAggregation = function(sName, bSuppressReset) {
		var oForwarder = this.getMetadata().getAggregationForwarder(sName);
		if (oForwarder && oForwarder.forwardBinding) {
			oForwarder.getTarget(this).unbindAggregation(oForwarder.targetAggregationName, bSuppressReset);
			return this;
		}

		var oBindingInfo = this.mBindingInfos[sName],
			oAggregationInfo = this.getMetadata().getAggregation(sName);
		if (oBindingInfo) {
			if (oBindingInfo.binding) {
				this._unbindAggregation(oBindingInfo, sName);
			}
			// remove template if any
			if (oBindingInfo.template ) {
				if ( !oBindingInfo.templateShareable && oBindingInfo.template.destroy ) {
					oBindingInfo.template.destroy();
				}
				if ( oBindingInfo.templateShareable === MAYBE_SHAREABLE_OR_NOT ) {
					oBindingInfo.template._sapui_candidateForDestroy = true;
				}
			}
			if (this._observer && !this._bIsBeingDestroyed) {
				this._observer.bindingChange(this,sName,"remove", this.mBindingInfos[sName], "aggregation");
			}
			delete this.mBindingInfos[sName];
			if (!bSuppressReset) {
				this[oAggregationInfo._sDestructor]();
			}
		}
		return this;
	};

	ManagedObject.prototype._unbindAggregation = logError.bind(null, "_unbindAggregation");

	/**
	 * Generic method which is called whenever an aggregation binding has changed.
	 *
	 * Depending on the type of the list binding and on additional configuration, this method either
	 * destroys all elements in the aggregation <code>sName</code> and recreates them anew
	 * or tries to reuse as many existing objects as possible. It is up to the method which
	 * strategy it uses.
	 *
	 * In case a managed object needs special handling for an aggregation binding, it can create
	 * a named update method (e.g. <code>update<i>Rows</i></code> for an aggregation <code>rows</code>)
	 * which then will be called by the framework instead of this generic method. THe method will be
	 * called with two arguments <code>sChangeReason</code> and <code>oEventInfo</code>.
	 *
	 * Subclasses should call this method only in the implementation of such a named update method
	 * and for no other purposes. The framework might change the conditions under which the method
	 * is called and the method implementation might rely on those conditions.
	 *
	 * @param {string} sName Name of the aggregation to update
	 * @param {sap.ui.model.ChangeReason} sChangeReason One of the predefined reasons for the change event
	 * @param {object} oEventInfo Additional information about the change event
	 * @param {string} [oEventInfo.detailedReason] A non-standardized string that further classifies the
	 *   change event. Model implementations should document any value that they might provide as detailed
	 *   reason, and describe under what circumstances each value will be used.
	 * @protected
	 */
	ManagedObject.prototype.updateAggregation = function(sName, sChangeReason, oEventInfo) { };

	/**
	 * Generic method which can be called, when an aggregation needs to be refreshed.
	 * This method does not make any change on the aggregation, but just calls the
	 * <code>getContexts</code> method of the binding to trigger fetching of new data.
	 *
	 * Subclasses should call this method only in the implementation of a named refresh method
	 * and for no other purposes. The framework might change the conditions under which the method
	 * is called and the method implementation might rely on those conditions.
	 *
	 * @param {string} sName name of the aggregation to refresh
	 * @protected
	 */
	ManagedObject.prototype.refreshAggregation = function(sName) { };

	/**
	* Generic method which is called, whenever messages for this object exist.
	*
	* @param {string} sName The property name
	* @param {array} aMessages The messages
	* @protected
	* @since 1.28
	*/
	ManagedObject.prototype.propagateMessages = function(sName, aMessages) {
		future.warningThrows("Message for " + this + ", Property " + sName + " received. Control " + this.getMetadata().getName() + " does not support messaging without using data binding.");
	};

	/**
	 *  This method is used internally and should only be overridden by a tree managed object which utilizes the tree binding.
	 *  In this case and if the aggregation is a tree node the overridden method should then return true.
	 *  If true is returned the tree binding will be used instead of the list binding.
	 *
	 *  @param {string} sName the aggregation to bind (e.g. nodes for a tree managed object)
	 *  @return {boolean} whether tree binding should be used or list binding. Default is false. Override method to change this behavior.
	 *
	 *  @protected
	 */
	ManagedObject.prototype.isTreeBinding = function(sName) {
		return false;
	};

	/**
	 * Create or update local bindings.
	 *
	 * Called when model or binding contexts have changed. Creates bindings when the model was not available
	 * at the time bindProperty or bindAggregation was called. Recreates the bindings when they exist already
	 * and when the model has changed.
	 *
	 * @param {boolean} bUpdateAll forces an update of all bindings, sModelName will be ignored
	 * @param {string|undefined} sModelName name of a model whose bindings should be updated
	 *
	 * @private
	 */
	ManagedObject.prototype.updateBindings = function(bUpdateAll, sModelName) { };

	/**
	 * Find out whether a property or aggregation is bound
	 *
	 * @param {string} sName the name of the property or aggregation
	 * @return {boolean} whether a binding exists for the given name
	 * @public
	 */
	ManagedObject.prototype.isBound = function(sName){
		return !!this.getBindingInfo(sName);
	};

	/**
	 * Get the object binding object for a specific model.
	 *
	 * <b>Note:</b> to be compatible with future versions of this API, you must not use the following model names:
	 * <ul>
	 * <li><code>null</code></li>
	 * <li>empty string <code>""</code></li>
	 * <li>string literals <code>"null"</code> or <code>"undefined"</code></li>
	 * </ul>
	 * Omitting the model name (or using the value <code>undefined</code>) is explicitly allowed and
	 * refers to the default model.
	 *
	 * @param {string} [sModelName=undefined] Non-empty name of the model or <code>undefined</code>
	 * @returns {sap.ui.model.ContextBinding|undefined} Context binding for the given model name or <code>undefined</code>
	 * @public
	 */
	ManagedObject.prototype.getObjectBinding = function(sModelName){
		assertModelName(sModelName);
		var oInfo = this._getObjectBindingInfo(sModelName);
		return oInfo && oInfo.binding;
	};

	/**
	 * Returns the parent managed object as new eventing parent to enable control event bubbling
	 * or <code>null</code> if this object hasn't been added to a parent yet.
	 *
	 * @returns {sap.ui.base.EventProvider|null} the parent event provider
	 * @protected
	 */
	ManagedObject.prototype.getEventingParent = function() {
		return this.oParent;
	};

	/**
	 * Get the binding object for a specific aggregation/property.
	 *
	 * @param {string} sName the name of the property or aggregation
	 * @returns {sap.ui.model.Binding|undefined} the binding for the given name
	 * @public
	 */
	ManagedObject.prototype.getBinding = function(sName){
		var oInfo = this.getBindingInfo(sName);
		return oInfo && oInfo.binding;
	};

	/**
	 * Get the binding path for a specific aggregation/property.
	 *
	 * @param {string} sName the name of the property or aggregation
	 * @return {string|undefined} the binding path for the given name
	 * @protected
	 */
	ManagedObject.prototype.getBindingPath = function(sName){
		var oInfo = this.getBindingInfo(sName);
		return oInfo && (oInfo.path || (oInfo.parts && oInfo.parts[0] && oInfo.parts[0].path));
	};

	/**
	 * Set the binding context for this ManagedObject for the model with the given name.
	 *
	 * <b>Note:</b> to be compatible with future versions of this API, you must not use the following model names:
	 * <ul>
	 * <li><code>null</code></li>
	 * <li>empty string <code>""</code></li>
	 * <li>string literals <code>"null"</code> or <code>"undefined"</code></li>
	 * </ul>
	 * Omitting the model name (or using the value <code>undefined</code>) is explicitly allowed and
	 * refers to the default model.
	 *
	 * A value of <code>null</code> for <code>oContext</code> hides the parent context. The parent context will
	 * no longer be propagated to aggregated child controls. A value of <code>undefined</code> removes a currently
	 * active context or a <code>null</code> context and the parent context gets visible and propagated again.
	 *
	 * <b>Note:</b> A ManagedObject inherits binding contexts from the Core only when it is a descendant of a UIArea.
	 *
	 * @param {sap.ui.model.Context} oContext the new binding context for this object
	 * @param {string} [sModelName] the name of the model to set the context for or <code>undefined</code>
	 *
	 * @returns {this} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.setBindingContext = function(oContext, sModelName){
		assertModelName(sModelName);
		var oOldContext = this.oBindingContexts[sModelName];
		if (oOldContext !== oContext || oContext && oContext.hasChanged()) {
			if (oContext === undefined) {
				delete this.oBindingContexts[sModelName];
			} else {
				this.oBindingContexts[sModelName] = oContext;
			}
			this.updateBindingContext(false, sModelName);
			this.propagateProperties(sModelName);
			this.fireModelContextChange();
		}
		return this;
	};

	/**
	 * Set the ObjectBinding context for this ManagedObject for the model with the given name. Only set internally
	 * from a ContextBinding.
	 *
	 * A value of <code>null</code> for <code>oContext</code> hides the parent context. The parent context will
	 * no longer be propagated to aggregated child controls. A value of <code>undefined</code> removes a currently
	 * active context or a <code>null</code> context and the parent context gets visible and propagated again.
	 *
	 * @param {sap.ui.model.Context} oContext the new ObjectBinding context for this object
	 * @param {string} [sModelName] the name of the model to set the context for or <code>undefined</code>
	 * @private
	 */
	ManagedObject.prototype.setElementBindingContext = function(oContext, sModelName) { };

	/**
	 * Update the binding context in this object and all aggregated children
	 * @private
	 */
	ManagedObject.prototype.updateBindingContext = function(bSkipLocal, sFixedModelName, bUpdateAll) { };


	/**
	 * Get the binding context of this object for the given model name.
	 *
	 * If the object does not have a binding context set on itself and has no own model set,
	 * it will use the first binding context defined in its parent hierarchy.
	 *
	 * <b>Note:</b> to be compatible with future versions of this API, you must not use the following model names:
	 * <ul>
	 * <li><code>null</code></li>
	 * <li>empty string <code>""</code></li>
	 * <li>string literals <code>"null"</code> or <code>"undefined"</code></li>
	 * </ul>
	 * Omitting the model name (or using the value <code>undefined</code>) is explicitly allowed and
	 * refers to the default model.
	 *
	 * <b>Note:</b> A ManagedObject inherits binding contexts from the Core only when it is a descendant of a UIArea.
	 *
	 * @param {string} [sModelName] the name of the model or <code>undefined</code>
	 * @returns {sap.ui.model.Context|null|undefined} The binding context of this object
	 * @public
	 */
	ManagedObject.prototype.getBindingContext = function(sModelName){
		var oModel = this.getModel(sModelName),
			oElementBindingContext = this.mElementBindingContexts[sModelName];

		if (oElementBindingContext && !oModel) {
			return oElementBindingContext;
		} else if (oElementBindingContext && oModel && oElementBindingContext.getModel() === oModel) {
			return oElementBindingContext;
		} else if (oElementBindingContext === null) {
			return oElementBindingContext;
		} else {
			return this._getBindingContext(sModelName);
		}
	};

	/**
	 * Get the binding context of this object for the given model name.
	 *
	 * An elementBindingContext will not be considered.
	 *
	 * @returns {sap.ui.model.Context|null|undefined} Bound context
	 * @private
	 */
	ManagedObject.prototype._getBindingContext = function(sModelName){
		var oModel = this.getModel(sModelName),
			oContext = this.oBindingContexts[sModelName],
			oPropagatedContext = this.oPropagatedProperties.oBindingContexts[sModelName];

		if (oContext && !oModel) {
			return this.oBindingContexts[sModelName];
		} else if (oContext && oModel && oContext.getModel() === oModel) {
			return this.oBindingContexts[sModelName];
		} else if (oContext === null) {
			return oContext;
		} else if (oPropagatedContext && oModel && oPropagatedContext.getModel() !== oModel) {
			return undefined;
		} else {
			return oPropagatedContext;
		}
	};

	/**
	 * Sets or unsets a model for the given model name for this ManagedObject.
	 *
	 * The <code>sName</code> must either be <code>undefined</code> (or omitted) or a non-empty string.
	 * When the name is omitted, the default model is set/unset. To be compatible with future versions
	 * of this API, you must not use the following model names:
	 * <ul>
	 * <li><code>null</code></li>
	 * <li>empty string <code>""</code></li>
	 * <li>string literals <code>"null"</code> or <code>"undefined"</code></li>
	 * </ul>
	 *
	 * When <code>oModel</code> is <code>null</code> or <code>undefined</code>, a previously set model
	 * with that name is removed from this ManagedObject. If an ancestor (parent, UIArea or Core) has a model
	 * with that name, this ManagedObject will immediately inherit that model from its ancestor.
	 *
	 * All local bindings that depend on the given model name are updated (created if the model references
	 * became complete now; updated, if any model reference has changed; removed if the model references
	 * became incomplete now).
	 *
	 * Any change (new model, removed model, inherited model) is also applied to all aggregated descendants
	 * as long as a descendant doesn't have its own model set for the given name.
	 *
	 * <b>Note:</b> By design, it is not possible to hide an inherited model by setting a <code>null</code> or
	 * <code>undefined</code> model. Applications can set an empty model to achieve the same.
	 *
	 * <b>Note:</b> A ManagedObject inherits models from the Core only when it is a descendant of a UIArea.
	 *
	 * @param {sap.ui.model.Model|null|undefined} oModel Model to be set or <code>null</code> or <code>undefined</code>
	 * @param {string} [sName=undefined] the name of the model or <code>undefined</code>
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	ManagedObject.prototype.setModel = function(oModel, sName) {
		assert(oModel == null || BaseObject.isObjectA(oModel, "sap.ui.model.Model"), "oModel must be an instance of sap.ui.model.Model, null or undefined");
		assert(sName === undefined || (typeof sName === "string" && !/^(undefined|null)?$/.test(sName)), "sName must be a string or omitted");
		if (!oModel && this.oModels[sName]) {
			delete this.oModels[sName];
			// propagate Models to children
			// model changes are propagated until (including) the first descendant that has its own model with the same name
			this.propagateProperties(sName);
			// if the model instance for a name changes, all bindings for that model name have to be updated
			this.updateBindings(false, sName);
			this.fireModelContextChange();
		} else if ( oModel && oModel !== this.oModels[sName] ) {
			//TODO: handle null!
			this.oModels[sName] = oModel;
			// propagate Models to children
			// model changes are propagated until (including) the first descendant that has its own model with the same name
			this.propagateProperties(sName);
			// update binding context, for primary model only
			this.updateBindingContext(false, sName);
			// if the model instance for a name changes, all bindings for that model name have to be updated
			this.updateBindings(false, sName);
			this.fireModelContextChange();
		} // else nothing to do
		return this;
	};

	/**
	 * Adds a listener function that will be called during each propagation step on every control
	 * @param {function} listener function
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	ManagedObject.prototype.addPropagationListener = function(listener) {
		assert(typeof listener === 'function', "listener must be a function");
		this.aPropagationListeners.push(listener);
		this.propagateProperties(false);
		// call Listener on current object
		this._callPropagationListener(listener);
		return this;
	};

	/**
	 * remove a propagation listener
	 * @param {function} listener function
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	ManagedObject.prototype.removePropagationListener = function(listener) {
		assert(typeof listener === 'function', "listener must be a function");
		var aListeners = this.aPropagationListeners;
		var i = aListeners.indexOf(listener);
		if ( i >= 0 ) {
		  aListeners.splice(i,1);
		  this.propagateProperties(false);
		}
		return this;
	};

	/**
	 * get propagation listeners
	 * @returns {array} aPropagationListeners Returns registered propagationListeners
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	ManagedObject.prototype.getPropagationListeners = function() {
		return this.oPropagatedProperties.aPropagationListeners.concat(this.aPropagationListeners);
	};

	/**
	 * Calls a registered listener during propagation
	 *
	 * @param {function} listener
	 *      If given, the given function will be called, other wise all propagation listeners will be called.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @private
	 */
	ManagedObject.prototype._callPropagationListener = function(listener) {
		var aListeners;
		if (listener) {
			listener(this);
		} else {
			aListeners = this.getPropagationListeners();
			for (var i = 0; i < aListeners.length; i++) {
				listener = aListeners[i];
				listener(this);
			}
		}
		return this;
	};

	ManagedObject._oEmptyPropagatedProperties = {oModels:{}, oBindingContexts:{}, aPropagationListeners:[]};

	function _hasAsRealChild(oParent, oChild) {
		return !oChild.aAPIParentInfos || oChild.aAPIParentInfos[0].parent === oParent;
	}

	/**
	 * Propagate properties (models and binding contexts) to aggregated objects.
	 *
	 * @param {boolean|string|undefined} vName
	 *   When <code>true</code>, all bindings are updated, when <code>false</code> only propagationListeners
	 *   are update. Otherwise only those for the given model name (undefined == name of default model).
	 *
	 * @private
	 */
	ManagedObject.prototype.propagateProperties = function(vName) {
		var oProperties = this._getPropertiesToPropagate(),
			bUpdateAll = vName === true, // update all bindings when no model name parameter has been specified
			bUpdateListener = vName === false, //update only propagation listeners
			sName = bUpdateAll ? undefined : vName,
			sAggregationName, oAggregation, i,
			mAllAggregations = Object.assign({}, this.mAggregations, this.mForwardedAggregations);

		// introduce data binding capabilities via mixin if available
		checkForBindingSupport(oProperties.oModels);

		for (sAggregationName in mAllAggregations) {
			if (this.mSkipPropagation[sAggregationName]) {
				continue;
			}
			oAggregation = mAllAggregations[sAggregationName];
			if (oAggregation instanceof ManagedObject) {
				if (_hasAsRealChild(this, oAggregation)) { // do not propagate to children forwarded from somewhere else
					this._propagateProperties(vName, oAggregation, oProperties, bUpdateAll, sName, bUpdateListener);
				}
			} else if (oAggregation instanceof Array) {
				for (i = 0; i < oAggregation.length; i++) {
					if (oAggregation[i] instanceof ManagedObject) {
						if (_hasAsRealChild(this, oAggregation[i])) { // do not propagate to children forwarded from somewhere else
							this._propagateProperties(vName, oAggregation[i], oProperties, bUpdateAll, sName, bUpdateListener);
						}
					}
				}
			}
		}
	};

	ManagedObject.prototype._propagateProperties = function(vName, oObject, oProperties, bUpdateAll, sName, bUpdateListener) {
		if (!oProperties) {
			oProperties = this._getPropertiesToPropagate();
			bUpdateAll = vName === true;
			bUpdateListener = vName === false;
			sName = bUpdateAll ? undefined : vName;
		}

		// introduce data binding capabilities via mixin if available
		checkForBindingSupport(oProperties.oModels);

		if (oObject.oPropagatedProperties !== oProperties) {
			oObject.oPropagatedProperties = oProperties;
			// if propagation triggered by adding a listener no binding updates needed
			if (bUpdateListener !== true) {
				oObject.updateBindings(bUpdateAll,sName);
				oObject.updateBindingContext(false, sName, bUpdateAll);
			}
			oObject.propagateProperties(vName);
			// call listener only in add listener and setParent case
			if (bUpdateListener || bUpdateAll) {
				oObject._callPropagationListener();
			}
			oObject.fireModelContextChange();
		}
	};

	/**
	 * Get properties for propagation
	 * @return {object} oProperties
	 * @private
	 */
	ManagedObject.prototype._getPropertiesToPropagate = function() {
		var bNoOwnModels = isEmptyObject(this.oModels),
			bNoOwnContexts = isEmptyObject(this.oBindingContexts),
			bNoOwnListeners = this.aPropagationListeners.length === 0,
			bNoOwnElementContexts = isEmptyObject(this.mElementBindingContexts);

		function merge(empty,o1,o2,o3) {
			// extend ignores 'undefined' values but not 'null' values.
			// So 'null' values get propagated and block a parent propagation.
			// 'undefined' values are ignored and therefore not propagated.
			return empty ? o1 : extend({}, o1, o2, o3);
		}

		function concat(empty,a1,a2) {
			return empty ? a1 : a1.concat(a2);
		}

		if (bNoOwnContexts && bNoOwnModels && bNoOwnElementContexts && bNoOwnListeners) {
			//propagate the existing container
			return this.oPropagatedProperties;
		} else {
			//merge propagated and own properties
			return {
				oModels : merge(bNoOwnModels, this.oPropagatedProperties.oModels, this.oModels),
				oBindingContexts : merge((bNoOwnContexts && bNoOwnElementContexts), this.oPropagatedProperties.oBindingContexts, this.oBindingContexts, this.mElementBindingContexts),
				aPropagationListeners : concat(bNoOwnListeners, this.oPropagatedProperties.aPropagationListeners, this.aPropagationListeners)
			};
		}
	};

	/**
	 * Get the model to be used for data bindings with the given model name.
	 * If the object does not have a model set on itself, it will use the first
	 * model defined in its parent hierarchy.
	 *
	 * The name can be omitted to reference the default model or it must be a non-empty string.
	 *
	 * <b>Note:</b> to be compatible with future versions of this API, you must not use the following model names:
	 * <ul>
	 * <li><code>null</code></li>
	 * <li>empty string <code>""</code></li>
	 * <li>string literals <code>"null"</code> or <code>"undefined"</code></li>
	 * </ul>
	 * Omitting the model name (or using the value <code>undefined</code>) is explicitly allowed and
	 * refers to the default model.
	 *
	 * @param {string} [sModelName] name of the model to be retrieved
	 * @return {sap.ui.model.Model | undefined} oModel or undefined when there is no such model
	 * @public
	 */
	ManagedObject.prototype.getModel = function(sModelName) {
		assertModelName(sModelName);
		return this.oModels[sModelName] || this.oPropagatedProperties.oModels[sModelName];
	};

	/**
	 * Returns a map of all models assigned to this ManagedObject.
	 *
	 * The default model is available on key <code>undefined</code>.
	 *
	 * <b>Note:</b> Models propagated from the parent are not included.
	 *
	 * @return {Object<string, sap.ui.model.Model>} The models
	 * @public
	 * @since 1.88.0
	 */
	ManagedObject.prototype.getOwnModels = function() {
		return this.oModels;
	};

	/**
	 * Check if any model is set to the ManagedObject or to one of its parents (including UIArea and Core).
	 *
	 * <b>Note:</b> A ManagedObject inherits models from the Core only when it is a descendant of a UIArea.
	 *
	 * @return {boolean} whether a model reference exists or not
	 * @public
	 */
	ManagedObject.prototype.hasModel = function() {
		return !(isEmptyObject(this.oModels) && isEmptyObject(this.oPropagatedProperties.oModels));
	};

	/**
	 * Clones a tree of objects starting with the object on which clone is called first (root object).
	 *
	 * The IDs within the newly created clone tree are derived from the original IDs by appending
	 * the given <code>sIdSuffix</code> (if no suffix is given, one will be created; it will be
	 * unique across multiple clone calls).
	 *
	 * The <code>oOptions</code> configuration object can have the following properties:
	 * <ul>
	 * <li>The boolean value <code>cloneChildren</code> specifies whether associations/aggregations will be cloned</li>
	 * <li>The boolean value <code>cloneBindings</code> specifies if bindings will be cloned</li>
	 * </ul>
	 * Note:
	 * In case the configuration <code>oOptions</code> is specified, the default values <code>true</code> no longer apply,
	 * which means in case <code>cloneChildren</code> or <code>cloneBindings</code> is not specified, then this ia
	 * assumed to be <code>false</code> and associations/aggregations or bindings are not cloned.
	 *
	 * For each cloned object, the following settings are cloned based on the metadata of the object and the defined options:
	 * <ul>
	 * <li>All properties that are not bound. If <code>cloneBindings</code> is <code>false</code>,
	 *     also the bound properties will be cloned; in general, values are referenced 1:1, not cloned.
	 *     For some property types, however, the getters or setters might clone the value (e.g. array types
	 *     and properties using metadata option <code>byValue</code>)</li>
	 * <li>All aggregated objects that are not bound. If <code>cloneBindings</code> is <code>false</code>,
	 *     also the ones that are bound will be cloned; they are all cloned recursively using the same
	 *     <code>sIdSuffix</code></li>
	 * <li>All associated controls; when an association points to an object inside the cloned object tree,
	 *     then the cloned association will be modified so that it points to the clone of the target object.
	 *     When the association points to a managed object outside of the cloned object tree, then its
	 *     target won't be changed.</li>
	 * <li>All models set via <code>setModel()</code>; used by reference.</li>
	 * <li>All property and aggregation bindings (if <code>cloneBindings</code> is <code>true</code>);
	 *     the pure binding information (path, model name) is cloned, but all other information like
	 *     template control or factory function, data type or formatter function are copied by reference.
	 *     The bindings themselves are created anew as they are specific for the combination (object, property, model).
	 *     As a result, any later changes to a binding of the original object are not reflected
	 *     in the clone, but changes to e.g the type or template etc. are.</li>
	 * </ul>
	 *
	 * Each clone is created by first collecting the above mentioned settings and then creating
	 * a new instance with the normal constructor function. As a result, any side effects of
	 * mutator methods (<code>setProperty</code> etc.) or init hooks are repeated during clone creation.
	 * There is no need to override <code>clone()</code> just to reproduce these internal settings!
	 *
	 * Custom controls however can override <code>clone()</code> to implement additional clone steps.
	 * They usually will first call <code>clone()</code> on the super class and then modify the
	 * returned clone accordingly.
	 *
	 * Applications <b>must never provide</b> the second parameter <code>aLocaleIds</code>.
	 * It is determined automatically for the root object (and its non-existence also serves as
	 * an indicator for the root object). Specifying it will break the implementation of <code>clone()</code>.
	 *
	 * @param {string} [sIdSuffix] a suffix to be appended to the cloned object ID
	 * @param {string[]} [aLocalIds] an array of local IDs within the cloned hierarchy (internally used)
	 * @param {Object} [oOptions='\{cloneChildren:true, cloneBindings:true\}'] Configuration object; when
	 *                      omitted, both properties default to <code>true</code>; when specified,
	 *                      undefined properties default to <code>false</code>
	 * @param {boolean} [oOptions.cloneChildren=false] Whether associations and aggregations will be cloned
	 * @param {boolean} [oOptions.cloneBindings=false] Whether bindings will be cloned
	 * @returns {this} Reference to the newly created clone
	 * @public
	 */
	ManagedObject.prototype.clone = function(sIdSuffix, aLocalIds, oOptions) {
		var bCloneChildren = true,
			bCloneBindings = true;

		if (oOptions) {
			bCloneChildren = !!oOptions.cloneChildren;
			bCloneBindings = !!oOptions.cloneBindings;
		}
		// if no id suffix has been provided use a generated UID
		if (!sIdSuffix) {
			sIdSuffix = ManagedObjectMetadata.uid("clone") || uid();
		}
		// if no local ID array has been passed, collect IDs of all aggregated objects to
		// be able to properly adapt associations, which are within the cloned object hierarchy
		if (!aLocalIds && bCloneChildren) {
			aLocalIds = this.findAggregatedObjects(true, null, true).map(function(oObject) {
				return oObject.getId();
			});
			aLocalIds.push(this.getId());
		}

		var oMetadata = this.getMetadata(),
			oClass = oMetadata._oClass,
			sId = this.getId() + "-" + sIdSuffix,
			mSettings = {},
			oProperty,
			mProps = this.mProperties,
			sKey,
			sName,
			oClone,
			escape = BindingInfo.escape,
			i,
			oTarget;

		// Clone properties (only those with non-default value)
		var aKeys = Object.keys(mProps);
		var vValue;
		i = aKeys.length;
		while ( i > 0 ) {
			sKey = aKeys[--i];
			oProperty = oMetadata.getProperty(sKey);
			// Only clone public properties, do not clone bound properties if bindings are cloned (property will be set by binding)
			if (oProperty && !(this.isBound(sKey) && bCloneBindings)) {
				// Note: to avoid double resolution of binding expressions, we have to escape string values once again
				if (typeof mProps[sKey] === "string") {
					mSettings[sKey] = escape(mProps[sKey]);
				} else {
					vValue = oProperty.byValue ? deepClone(mProps[sKey]) : mProps[sKey];
					if (vValue && typeof vValue === "object" && !Object.isFrozen(vValue)) {
						//mark objects to not interpret it as bindingInfos
						vValue[BindingInfo.UI5ObjectMarker] = true;
					}
					mSettings[sKey] = vValue;
				}
			}
		}

		// Clone models
		mSettings["models"] = this.oModels;

		// Clone BindingContext
		mSettings["bindingContexts"] = this.oBindingContexts;

		if (bCloneChildren) {
			// Clone aggregations
			var mAggregationsToClone = Object.assign({}, this.mAggregations, this.mForwardedAggregations);
			for (sName in mAggregationsToClone) {
				var oAggregation = mAggregationsToClone[sName];
				//do not clone aggregation if aggregation is bound and bindings are cloned; aggregation is filled on update
				if (oMetadata.hasAggregation(sName) && !(this.isBound(sName) && bCloneBindings)) {
					if (oAggregation instanceof ManagedObject) {
						mSettings[sName] = oAggregation.clone(sIdSuffix, aLocalIds);
					} else if (Array.isArray(oAggregation)) {
						mSettings[sName] = [];
						for (var i = 0; i < oAggregation.length; i++) {
							mSettings[sName].push(oAggregation[i].clone(sIdSuffix, aLocalIds));
						}
					} else {
						// must be an alt type
						mSettings[sName] =
							typeof oAggregation === "string"
								? escape(oAggregation) : oAggregation;
					}
				}
			}

			// Clone associations
			for (sName in this.mAssociations) {
				if ( !oMetadata.hasAssociation(sName) ) {
					// skip non-public associations
					continue;
				}
				var oAssociation = this.mAssociations[sName];
				// Check every associated ID against the ID array, to make sure associations within
				// the template are properly converted to associations within the clone
				if (Array.isArray(oAssociation)) {
					oAssociation = oAssociation.slice(0);
					for (var i = 0; i < oAssociation.length; i++) {
						if ( aLocalIds.indexOf(oAssociation[i]) >= 0) {
							oAssociation[i] += "-" + sIdSuffix;
						}
					}
				} else if ( aLocalIds.indexOf(oAssociation) >= 0) {
					oAssociation += "-" + sIdSuffix;
				}
				mSettings[sName] = oAssociation;
			}
		}

		// Create clone instance
		oClone = new oClass(sId, mSettings);

		/**
		 * Clones the BindingInfo for the aggregation/property with the given name of this ManagedObject and binds
		 * the aggregation/property with the given target name on the given clone using the same BindingInfo.
		 *
		 * @param {sap.ui.base.ManagedObject.ObjectBindingInfo|sap.ui.base.ManagedObject.AggregationBindingInfo|sap.ui.base.ManagedObject.PropertyBindingInfo} oBindingInfo the original binding info
		 * @param {sap.ui.base.ManagedObject} oClone the object on which to establish the cloned binding
		 * @param {string} [sTargetName] the name of the clone's aggregation/property to bind, omitted for object bindings
		 * @param {sap.ui.base.ManagedObject} [oSource] Source of the clone operation
		 * @param {string} [sName] the name of the aggregation/property
		 * @private
		 */
		function cloneBinding(oBindingInfo, oClone, sTargetName, oSource, sName) {
			var bIsObjectBinding = !sTargetName;
			var oCloneBindingInfo = Object.assign({}, oBindingInfo);

			// clone the template if it is not sharable
			if (!oBindingInfo.templateShareable && oBindingInfo.template && oBindingInfo.template.clone) {
				oCloneBindingInfo.template = oBindingInfo.template.clone(sIdSuffix, aLocalIds);
				delete oCloneBindingInfo.factory;
			} else if ( oBindingInfo.templateShareable === MAYBE_SHAREABLE_OR_NOT ) {
				// a 'clone' operation implies sharing the template (if templateShareable is not set to false)
				oBindingInfo.templateShareable = oCloneBindingInfo.templateShareable = true;
				Log.error(
					"During a clone operation, a template was found that neither was marked with 'templateShareable:true' nor 'templateShareable:false'. " +
					"The framework won't destroy the template. This could cause errors (e.g. duplicate IDs) or memory leaks " +
					"(The template is used in aggregation '" + sName + "' of object '" + oSource.getId() + "')." +
					"For more information, see documentation under 'Aggregation Binding'.");
			}

			// remove the runtime binding data (otherwise the property will not be connected again!)
			delete oCloneBindingInfo.binding;
			delete oCloneBindingInfo.modelChangeHandler;
			delete oCloneBindingInfo.dataStateChangeHandler;
			delete oCloneBindingInfo.modelRefreshHandler;

			if (bIsObjectBinding) {
				oClone.bindObject(oCloneBindingInfo);
			} else if (oBindingInfo.factory) {
				oClone.bindAggregation(sTargetName, oCloneBindingInfo);
			} else {
				oClone.bindProperty(sTargetName, oCloneBindingInfo);
			}
		}

		// Clone events
		for (sName in this.mEventRegistry) {
			oClone.mEventRegistry[sName] = this.mEventRegistry[sName].slice();
		}

		// Clone bindings
		if (bCloneBindings) {
			for (sName in this.mObjectBindingInfos) {
				cloneBinding(this.mObjectBindingInfos[sName], oClone);
			}

			for (sName in this.mBindingInfos) {
				cloneBinding(this.mBindingInfos[sName], oClone, sName, this, sName);
			}
		}

		// Clone the support info
		if (ManagedObject._supportInfo) {
			ManagedObject._supportInfo.addSupportInfo(oClone.getId(), ManagedObject._supportInfo.byId(this.getId()));
		}

		// Clone the meta data contexts interpretation
		if (this._cloneMetadataContexts) {
			this._cloneMetadataContexts(oClone);
		}

		if (this.mForwardedAggregations) { // forwarded elements have been cloned; set up the connection from their API parent now
			for (sName in this.mForwardedAggregations) {
				var oForwarder = oClone.getMetadata().getAggregationForwarder(sName);
				if (oForwarder) {
					oTarget = oForwarder.getTarget(oClone, true);
					if (oForwarder.forwardBinding && this.isBound(sName)) { // forwarded bindings have not been cloned yet
						cloneBinding(this.getBindingInfo(sName), oTarget, oForwarder.targetAggregationName, this, sName);
					}
				}
			}
		}

		return oClone;
	};

	/**
	 * Searches and returns all aggregated objects that pass the given check function.
	 *
	 * When the search is done recursively (<code>bRecursive === true</code>), it will be
	 * executed depth-first and ancestors will be added to the result array before their descendants.
	 *
	 * If no check function is given, all aggregated objects will pass the check and be added
	 * to the result array.
	 *
	 * When setting <code>bIncludeBindingTemplates</code> to <code>true</code>, binding templates will be included
	 * in the search.
	 *
	 * <b>Take care:</b> this operation might be expensive.
	 *
	 * @param {boolean} [bRecursive=false]
	 *   Whether the whole aggregation tree should be searched
	 * @param {function(sap.ui.base.ManagedObject):boolean} [fnCondition]
	 *   Objects for which this function returns a falsy value will not be added to the result array
	 * @param {boolean} [bIncludeBindingTemplates=false]
	 *   Whether binding templates should be included
	 * @returns {sap.ui.base.ManagedObject[]}
	 *   Array of aggregated objects that passed the check
	 * @public
	 */
	ManagedObject.prototype.findAggregatedObjects = function(bRecursive, fnCondition, bIncludeBindingTemplates) {

		var aAggregatedObjects = [];

		if (fnCondition && typeof fnCondition !== "function") {
			fnCondition = null;
		}

		function fnFindObjects(oObject) {
			var a, i, n;

			if (bIncludeBindingTemplates) {
				for ( n in oObject.mBindingInfos) {
					a = oObject.mBindingInfos[n].template;
					if (a) {
						if ( !fnCondition || fnCondition(a) ) {
							aAggregatedObjects.push(a);
						}
						if ( bRecursive ) {
							fnFindObjects(a);
						}
					}
				}
			}
			for ( n in oObject.mAggregations ) {
				a = oObject.mAggregations[n];
				if ( Array.isArray(a) ) {
					for ( i = 0; i < a.length; i++ ) {
						if ( !fnCondition || fnCondition(a[i]) ) {
							aAggregatedObjects.push(a[i]);
						}
						if ( bRecursive ) {
							fnFindObjects(a[i]);
						}
					}
				} else if (a instanceof ManagedObject) {
					if ( !fnCondition || fnCondition(a) ) {
						aAggregatedObjects.push(a);
					}
					if ( bRecursive ) {
						fnFindObjects(a);
					}
				}
			}
		}

		fnFindObjects(this);

		return aAggregatedObjects;

	};

	/**
	 * This lifecycle hook is called during deactivation of the owner component
	 *
	 * @since 1.88
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	ManagedObject.prototype.onOwnerDeactivation = function() {
		this._bIsOwnerActive = false;
	};

	/**
	 * This lifecycle hook is called during activation of the owner component
	 *
	 * @since 1.88
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	ManagedObject.prototype.onOwnerActivation = function() {
		this._bIsOwnerActive = true;
		this._onContextualSettingsChanged();
	};

	/**
	 * Checks if an object's destruction has been started. During the
	 * descruction of an object its ID is still registered, and child
	 * objects could be still aggregated.
	 * Creating another object with the same ID would lead to duplicate ID
	 * issues.
	 * To check if the destruction is finished, call <code>isDestroyed</code>.
	 *
	 * @return {boolean} Whether an object's destruction has been started
	 * @since 1.93
	 * @protected
	 */
	ManagedObject.prototype.isDestroyStarted = function() {
		return !!this._bIsBeingDestroyed;
	};

	/**
	 * Returns whether this object is destroyed or not. A
	 * destroyed object cannot be used anymore.
	 *
	 * @return {boolean} Whether the object is destroyed
	 * @since 1.93
	 * @public
	 */
	ManagedObject.prototype.isDestroyed = function() {
		return !!this.bIsDestroyed;
	};

	/**
	 * If the field help is active ({@link module:sap/ui/core/fieldhelp/FieldHelp#activate}) the <code>FieldHelp</code>
	 * module provides an implementation for this abstract function to update the field help information for this
	 * managed object instance and for the given property. {@link module:sap/ui/core/fieldhelp/FieldHelp#deactivate}
	 * removes the implementation again.
	 *
	 * @param {string} [sName]
	 *   The property name; if no property name is given the field help for this object is updated
	 * @abstract
	 * @function
	 * @private
	 * @ui5-restricted module:sap/ui/core/fieldhelp/FieldHelp
	 */
	ManagedObject.prototype.updateFieldHelp = undefined;

	ManagedObject._defaultContextualSettings = {};

	return ManagedObject;
});
