/*!
 * ${copyright}
 */

// Provides the base class for all objects with managed properties and aggregations.
sap.ui.define([
		'jquery.sap.global',
		'./BindingParser', './DataType', './EventProvider', './ManagedObjectMetadata',
		'../model/BindingMode', '../model/CompositeBinding', '../model/Context', '../model/FormatException', '../model/ListBinding',
		'../model/Model', '../model/ParseException', '../model/TreeBinding', '../model/Type', '../model/ValidateException',
		'jquery.sap.act', 'jquery.sap.script', 'jquery.sap.strings'
	], function(
		jQuery,
		BindingParser, DataType, EventProvider, ManagedObjectMetadata,
		BindingMode, CompositeBinding, Context, FormatException, ListBinding,
		Model, ParseException, TreeBinding, Type, ValidateException
		/* , jQuerySap2, jQuerySap, jQuerySap1 */) {

	"use strict";

	// shortcut for the sap.ui.core.ID type
	var IDType;

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
	 * If a key name is ambiguous for a specific managed object class (e.g. a property has the same
	 * name as an event), then this method prefers property, aggregation, association and
	 * event in that order. To resolve such ambiguities, the keys can be prefixed with
	 * <code>aggregation:</code>, <code>association:</code> or <code>event:</code>
	 * (such keys containing a colon (':') must be quoted to be valid Javascript).
	 *
	 * The possible values for a setting depend on its kind:
	 * <ul>
	 * <li>for simple properties, the value has to match the documented type of the property (no type conversion occurs)
	 * <li>for 0..1 aggregations, the value has to be an instance of the aggregated type
	 * <li>for 0..n aggregations, the value has to be an array of instances of the aggregated type or a single instance
	 * <li>for 0..1 associations, an instance of the associated type or an id (string) is accepted
	 * <li>for 0..n associations, an array of instances of the associated type or of IDs is accepted
	 * <li>for events either a function (event handler) is accepted or an array of length 2
	 *     where the first element is a function and the 2nd element is an object to invoke the method on.
	 * </ul>
	 *
	 * Each subclass should document the name and type of its supported settings in its constructor documentation.
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
	 * <li><code>metadataContexts : <i>object</i></code>  a map of binding paths keyed by the corresponding model name.</li>
	 * </ul>
	 *
	 * @param {string} [sId] id for the new managed object; generated automatically if no non-empty id is given
	 *      Note: this can be omitted, no matter whether <code>mSettings</code> will be given or not!
	 * @param {object} [mSettings] Optional map/JSON-object with initial property values, aggregated objects etc. for the new object
	 * @param {object} [oScope] Scope object for resolving string based type and formatter references in bindings.
	 *      When a scope object is given, <code>mSettings</code> cannot be omitted, at least <code>null</code> or an empty object literal must be given.
	 *
	 *
	 * @class Base Class that introduces some basic concepts like state management or databinding.
	 *
	 * New subclasses of ManagedObject are created with a call to {@link #.extend ManagedObject.extend} and can make use
	 * of the following managed features:
	 *
	 * <b>Properties</b><br>
	 * Managed properties represent the state of a ManagedObject. They can store a single value of a simple data type
	 * (like 'string' or 'int'). They have a <i>name</i> (e.g. 'size') and methods to get the current value (<code>getSize</code>)
	 * or to set a new value (<code>setSize</code>). When a property is modified, the ManagedObject is marked as invalidated.
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
	 * <b>Aggregations</b><br>
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
	 * Details about the declaration of a managed aggregation, the metadata that describes it and the set of methods that are automatically
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
	 * <b>Associations</b><br>
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
	 * object and the root of the clone operation: if the associated object is part of the to-be-cloned object tree (reachable
	 * via aggregations from the root of the clone operation), then the cloned association will reference the clone of the
	 * associated object. Otherwise it will reference the same object as in the original tree.
	 * When a ManagedObject is destroyed, other objects that are only associated, are not affected by the destroy operation.
	 *
	 *
	 * <b>Events</b><br>
	 * Managed events provide a mean for communicating important state changes to an arbitrary number of 'interested' listeners.
	 * Events have a <i>name</i> and (optionally) a set of <i>parameters</i>. For each event there will be methods to add or remove an event
	 * listener as well as a method to fire the event. (e.g. <code>attachChange</code>, <code>detachChange</code>, <code>fireChange</code>
	 * for an event named 'change').
	 *
	 * Details about the declaration of a managed events, the metadata that describes it and the set of methods that are automatically
	 * generated to access it, can be found in the documentation of the {@link sap.ui.base.ManagedObject.extend extend} method.
	 *
	 * When a ManagedObject is cloned, all listeners registered for any event in the clone source are also registered to the
	 * clone. Later changes are not reflected in any direction (neither from source to clone nor vice versa).
	 *
	 *
	 * <a name="lowlevelapi"><b>Low Level APIs:</b></a><br>
	 * The prototype of ManagedObject provides several generic, low level APIs to manage properties, aggregations, associations
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
			publicMethods : [ "getId", "getMetadata", "getModel", "setModel", "hasModel", "bindProperty", "unbindProperty", "bindAggregation", "unbindAggregation", "bindObject", "unbindObject", "getObjectBinding"],
			library : "sap.ui.core", // UI Library that contains this class
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
				 * It can be configured option 'autoIDPrefix', see {@link sap.ui.core.Configuration}.
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

			var that = this;

			EventProvider.call(this); // no use to pass our arguments
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

				try {
					// registers the object in the Core
					if (that.register) {
						that.register();
					}
					// TODO: generic concept for init hooks?
					if ( that._initCompositeSupport ) {
						that._initCompositeSupport(mSettings);
					}

					// Call init method here instead of specific Controls constructor.
					if (that.init) {
						that.init();
					}

					// apply the settings
					that.applySettings(mSettings, oScope);
					bCreated = true;

					// use try finally here since catch leads to the console pointing to the wrong location of the error
					// (not the original error's location but to this constructor)
				} finally {

					// unregisters the object in the Core
					if (!bCreated && that.deregister) {
						that.deregister();
					}

				}

			}());

		}

	}, /* Metadata constructor */ ManagedObjectMetadata);

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
	 * Defines a new subclass of ManagedObject with name <code>sClassName</code> and enriches it with
	 * the information contained in <code>oClassInfo</code>.
	 *
	 * <code>oClassInfo</code> can contain the same information that {@link sap.ui.base.Object.extend} already accepts,
	 * plus the following new properties in the 'metadata' object literal:
	 *
	 * <ul>
	 * <li><code>library : <i>string</i></code></li>
	 * <li><code>properties : <i>object</i></code></li>
	 * <li><code>defaultProperty : <i>string</i></code></li>
	 * <li><code>aggregations : <i>object</i></code></li>
	 * <li><code>defaultAggregation : <i>string</i></code></li>
	 * <li><code>associations : <i>object</i></code></li>
	 * <li><code>events : <i>object</i></code></li>
	 * <li><code>specialSettings : <i>object</i></code>// this one is still experimental and not for public usage!</li>
	 * </ul>
	 *
	 * Each of these properties is explained in more detail lateron.
	 *
	 * Example:
	 * <pre>
	 * ManagedObect.extend('sap.mylib.MyClass', {
	 *   metadata : {
	 *     library: 'sap.mylib',
	 *     properties : {
	 *       value: 'string',
	 *       width: 'sap.ui.core.CSSSize',
	 *       height: { type: 'sap.ui.core.CSSSize', defaultValue: '100%' }
	 *     },
	 *     defaultProperty : 'value',
	 *     aggregations : {
	 *       header : { type: 'sap.mylib.FancyHeader', multiple : false }
	 *       items : 'sap.ui.core.Control'
	 *     },
	 *     defaultAggregation : 'items',
	 *     associations : {
	 *       initiallyFocused : { type: 'sap.ui.core.Control' }
	 *     },
	 *     events: {
	 *       beforeOpen : {
	 *         parameters : {
	 *           opener : 'sap.ui.core.Control'
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
	 * Detailed explanation of properties<br>
	 *
	 *
	 * <b>'library'</b> : <i>string</i><br>
	 * Name of the library that the new subclass should belong to. If the subclass is a control or element, it will
	 * automatically register with that library so that authoring tools can discover it.
	 * By convention, the name of the subclass should have the library name as a prefix, e.g. 'sap.ui.commons.Panel' belongs
	 * to library 'sap.ui.commons'.
	 *
	 *
	 * <b>'properties'</b> : <i>object</i><br>
	 * An object literal whose properties each define a new managed property in the ManagedObject subclass.
	 * The value can either be a simple string which then will be assumed to be the type of the new property or it can be
	 * an object literal with the following properties
	 * <ul>
	 * <li><code>type: <i>string</i></code> type of the new property. Must either be one of the built-in types 'string', 'boolean', 'int', 'float', 'object' or 'any', or a
	 *     type created and registered with {@link sap.ui.base.DataType.createType} or an array type based on one of the previous types.</li>
	 * <li><code>group:<i>string</i></code> a semantic grouping of the properties, intended to be used in design time tools.
	 *     Allowed values are (case sensitive): Accessibility, Appearance, Behavior, Data, Designtime, Dimension, Identification, Misc</li>
	 * <li><code>defaultValue: <i>any</i></code> the default value for the property or null if there is no defaultValue.</li>
	 * <li><code>bindable: <i>boolean|string</i></code> (either can be omitted or set to the boolean value <code>true</code> or the magic string 'bindable')
	 *     If set to <code>true</code> or 'bindable', additional named methods <code>bind<i>Name</i></code> and <code>unbind<i>Name</i></code> are generated as convenience.
	 *     Despite its name, setting this flag is not mandatory to make the managed property bindable. The generic methods {@link #bindProperty} and
	 *     {@link #unbindProperty} can always be used. </li>
	 * </ul>
	 * Property names should use camelCase notation, start with a lowercase letter and only use characters from the set [a-zA-Z0-9_$].
	 * If an aggregation in the literal is preceded by a JSDoc comment (doclet) and if the UI5 plugin and template are used for JSDoc3 generation, the doclet will
	 * be used as generic documentation of the aggregation.
	 *
	 * For each public property 'foo', the following methods will be created by the "extend" method and will be added to the
	 * prototype of the subclass:
	 * <ul>
	 * <li>getFoo() - returns the current value of property 'foo'. Internally calls {@link #getProperty}
	 * <li>setFoo(v) - sets 'v' as the new value of property 'foo'. Internally calls {@link #setProperty}
	 * <li>bindFoo(c) - (only if property was defined to be 'bindable'): convenience function that wraps {@link #bindProperty}
	 * <li>unbindFoo() - (only if property was defined to be 'bindable'): convenience function that wraps {@link #unbindProperty}
	 * </ul>
	 *
	 *
	 * <b>'defaultProperty'</b> : <i>string</i><br>
	 * When specified, the default property must match the name of one of the properties defined for the new subclass (either own or inherited).
	 * The named property can be used to identify the main property to be used for bound data. E.g. the value property of a field control.
	 *
	 *
	 * <b>'aggregations'</b> : <i>object</i><br>
	 * An object literal whose properties each define a new aggregation in the ManagedObject subclass.
	 * The value can either be a simple string which then will be assumed to be the type of the new aggregation or it can be
	 * an object literal with the following properties
	 * <ul>
	 * <li><code>type: <i>string</i></code> type of the new aggregation. must be the full global name of a ManagedObject subclass (in dot notation, e.g. 'sap.m.Button')</li>
	 * <li><code>[multiple]: <i>boolean</i></code> whether the aggregation is a 0..1 (false) or a 0..n aggregation (true), defaults to true </li>
	 * <li><code>[singularName]: <i>string</i></code>. Singular name for 0..n aggregations. For 0..n aggregations the name by convention should be the plural name.
	 *     Methods affecting multiple objects in an aggregation will use the plural name (e.g. getItems(), whereas methods that deal with a single object will use
	 *     the singular name (e.g. addItem). The framework knows a set of common rules for building plural form of English nouns and uses these rules to determine
	 *     a singular name on its own. if that name is wrong, a singluarName can be specified with this property. </li>
	 * <li>[visibility]: <i>string</i></code> either 'hidden' or 'public', defaults to 'public'. Aggregations that belong to the API of a class must be 'public' whereas
	 *     'hidden' aggregations typically are used for the implementation of composite classes (e.g. composite controls) </li>
	 * <li><code>bindable: <i>boolean|string</i></code> (either can be omitted or set to the boolean value <code>true</code> or the magic string 'bindable')
	 *     If set to <code>true</code> or 'bindable', additional named methods <code>bind<i>Name</i></code> and <code>unbind<i>Name</i></code> are generated as convenience.
	 *     Despite its name, setting this flag is not mandatory to make the managed aggregation bindable. The generic methods {@link #bindAggregation} and
	 *     {@link #unbindAggregation} can always be used. </li>
	 * </ul>
	 * Aggregation names should use camelCase notation, start with a lowercase letter and only use characters from the set [a-zA-Z0-9_$].
	 * The name for a hidden aggregations might start with an underscore.
	 * If an aggregation in the literal is preceded by a JSDoc comment (doclet) and if the UI5 plugin and template are used for JSDoc3 generation, the doclet will
	 * be used as generic documentation of the aggregation.
	 *
	 * For each public aggregation 'item' of cardinality 0..1, the following methods will be created by the "extend" method and will be added to the
	 * prototype of the subclass:
	 * <ul>
	 * <li>getItem() - returns the current value of aggregation 'item'. Internally calls {@link #getAggregation} with a default value of <code>undefined</code></li>
	 * <li>setItem(o) - sets 'o' as the new aggregated object in aggregation 'item'. Internally calls {@link #setAggregation}</li>
	 * <li>destroyItem(o) - destroy a currently aggregated object in aggregation 'item' and clears the aggregation. Internally calls {@link #destroyAggregation}</li>
	 * <li>bindItem(c) - (only if aggregation was defined to be 'bindable'): convenience function that wraps {@link #bindAggregation}</li>
	 * <li>unbindItem() - (only if aggregation was defined to be 'bindable'): convenience function that wraps {@link #unbindAggregation}</li>
	 * </ul>
	 * For a public aggregation 'items' of cardinality 0..n, the following methods will be created:
	 * <ul>
	 * <li>getItems() - returns an array with the objects contained in aggregation 'items'. Internally calls {@link #getAggregation} with a default value of <code>[]</code></li>
	 * <li>addItem(o) - adds an object as last element in the aggregation 'items'. Internally calls {@link #addAggregation}</li>
	 * <li>insertItem(o,p) - inserts an object into the aggregation 'items'. Internally calls {@link #insertAggregation}</li>
	 * <li>removeItem(v) - removes an object from the aggregation 'items'. Internally calls {@link #removeAggregation}</li>
	 * <li>removeItems() - removes all object from the aggregation 'items'. Internally calls {@link #removeAllAggregation}</li>
	 * <li>destroyItems() - destroy all currently aggregated objects in aggregation 'items' and clears the aggregation. Internally calls {@link #destroyAggregation}</li>
	 * <li>bindItems(c) - (only if aggregation was defined to be 'bindable'): convenience function that wraps {@link #bindAggregation}</li>
	 * <li>unbindItems() - (only if aggregation was defined to be 'bindable'): convenience function that wraps {@link #unbindAggregation}</li>
	 * </ul>
	 * For private or hidden aggregations, no methods are generated.
	 *
	 *
	 * <b>'defaultAggregation'</b> : <i>string</i><br>
	 * When specified, the default aggregation must match the name of one of the aggregations defined for the new subclass (either own or inherited).
	 * The named aggregation will be used in contexts where no aggregation is specified. E,g. when an object in an XMLView embeds other objects without
	 * naming an aggregation, as in the following example:
	 * <pre>
	 *  &lt;!-- assuming the defaultAggregation for Dialog is 'content' -->
	 *  &lt;Dialog>
	 *    &lt;Text/>
	 *    &lt;Button/>
	 *  &lt;/Dialog>
	 * </pre>
	 *
	 *
	 * <b>'associations'</b> : <i>object</i><br>
	 * An object literal whose properties each define a new association of the ManagedObject subclass.
	 * The value can either be a simple string which then will be assumed to be the type of the new association or it can be
	 * an object literal with the following properties
	 * <ul>
	 * <li><code>type: <i>string</i></code> type of the new association</li>
	 * <li><code>multiple: <i>boolean</i></code> whether the association is a 0..1 (false) or a 0..n association (true), defaults to false(1) for associations</li>
	 * <li><code>[singularName]: <i>string</i></code>. Singular name for 0..n associations. For 0..n associations the name by convention should be the plural name.
	 *     Methods affecting multiple objects in an association will use the plural name (e.g. getItems(), whereas methods that deal with a single object will use
	 *     the singular name (e.g. addItem). The framework knows a set of common rules for building plural form of English nouns and uses these rules to determine
	 *     a singular name on its own. if that name is wrong, a singluarName can be specified with this property.</li>
	 * </ul>
	 * Association names should use camelCase notation, start with a lowercase letter and only use characters from the set [a-zA-Z0-9_$].
	 * If an association in the literal is preceded by a JSDoc comment (doclet) and if the UI5 plugin and template are used for JSDoc3 generation, the doclet will
	 * be used as generic documentation of the association.
	 *
	 * For each association 'ref' of cardinality 0..1, the following methods will be created by the "extend" method and will be added to the
	 * prototype of the subclass:
	 * <ul>
	 * <li>getRef() - returns the current value of association 'item'. Internally calls {@link #getAssociation} with a default value of <code>undefined</code></li>
	 * <li>setRef(o) - sets 'o' as the new associated object in association 'item'. Internally calls {@link #setAssociation}</li>
	 * </ul>
	 * For a public association 'refs' of cardinality 0..n, the following methods will be created:
	 * <ul>
	 * <li>getRefs() - returns an array with the objects contained in association 'items'. Internally calls {@link #getAssociation} with a default value of <code>[]</code></li>
	 * <li>addRef(o) - adds an object as last element in the association 'items'. Internally calls {@link #addAssociation}</li>
	 * <li>removeRef(v) - removes an object from the association 'items'. Internally calls {@link #removeAssociation}</li>
	 * <li>removeAllRefs() - removes all objects from the association 'items'. Internally calls {@link #removeAllAssociation}</li>
	 * </ul>
	 *
	 *
	 * <b>'events'</b> : <i>object</i><br>
	 * An object literal whose properties each define a new event of the ManagedObject subclass.
	 * The value can either be a simple string which then will be assumed to be the type of the new association or it can be
	 * an object literal with the following properties
	 * <ul>
	 * <li><code>allowPreventDefault: <i>boolean</i></code> whether the event allows to prevented the default behavior of the event source</li>
	 * <li><code>parameters: <i>object</i></code> an object literal that describes the parameters of this event. </li>
	 * </ul>
	 * Event names should use camelCase notation, start with a lowercase letter and only use characters from the set [a-zA-Z0-9_$].
	 * If an event in the literal is preceded by a JSDoc comment (doclet) and if the UI5 plugin and template are used for JSDoc3 generation, the doclet will be used
	 * as generic documentation of the event.
	 *
	 * For each event 'Some' the following methods will be created by the "extend" method and will be added to the
	 * prototype of the subclass:
	 * <ul>
	 * <li>attachSome(fn,o) - registers a listener for the event. Internally calls {@link #attachEvent}</li>
	 * <li>detachSome(fn,o) - deregisters a listener for the event. Internally calls {@link #detachEvent}</li>
	 * <li>fireSome() - fire the event. Internally calls {@link #fireEvent}</li>
	 * </ul>
	 *
	 *
	 * <b>'specialSettings'</b> : <i>object</i><br>
	 * Special settings are an experimental feature and MUST NOT BE USED by controls or applications outside of the sap.ui.core project.
	 *
	 *
	 *
	 * @param {string} sClassName name of the class to be created
	 * @param {object} [oClassInfo] object literal with informations about the class
	 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to <code>sap.ui.base.ManagedObjectMetadata</code>.
	 * @return {function} the created class / constructor function
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
	 * as settings. The type of the object is either determined by a property of name <code>Type</code>
	 * (capital 'T') in the <code>vData</code> or by a property <code>type</code> (lower case 't')
	 * in the <code>oKeyInfo</code> object. In both cases, the type can be specified by name (dot separated
	 * name of the class) or by the constructor function of the class.
	 *
	 * @param {sap.ui.base.ManagedObject|object} <code>vData</code> the data to create the object from
	 * @param {object} [oKeyInfo]
	 * @param {object} [oScope] Scope object to resolve types and formatters in bindings
	 * @public
	 * @static
	 */
	ManagedObject.create = function(vData, oKeyInfo, oScope) {
		if ( !vData || vData instanceof ManagedObject || typeof vData !== "object" || vData instanceof String) {
			return vData;
		}

		function getClass(vType) {
			if ( typeof vType === "function" ) {
				return vType;
			}
			if (typeof vType === "string" ) {
				return jQuery.sap.getObject(vType);
			}
		}

		var fnClass = getClass(vData.Type) || getClass(oKeyInfo && oKeyInfo.type);
		if ( typeof fnClass === "function" ) {
			return new fnClass(vData, oScope);
		}

		// we don't know how to create the ManagedObject from vData, so fail
		// extension points could be integrated here
		var message = "Don't know how to create a ManagedObject from " + vData + " (" + (typeof vData) + ")";
		jQuery.sap.log.fatal(message);
		throw new Error(message);
	};

	/**
	 * Optional StashedControlSupport dependency
	 * @private
	 */
	var StashedControlSupport;

	/**
	 * Returns an array of stashed child elements or an empty array if there are none.
	 *
	 * @param {string} sId id of the object which should have stashed children
	 * @return {sap.ui.core._StashedControl[]} array of stashed children
	 * @private
	 */
	function getStashedControls(sId) {
		if (!StashedControlSupport) {
			StashedControlSupport = sap.ui.require("sap/ui/core/StashedControlSupport");
		}
		if (StashedControlSupport) {
			return StashedControlSupport.getStashedControls(sId);
		}
		return [];
	}

	/**
	 * A global preprocessor for the ID of a ManagedObject (used internally).
	 * If set, this function will be called before the ID is applied to any ManagedObject.
	 * If the original ID was empty, the hook will not be called (to be discussed).
	 *
	 * The expected signature is <code>function(sId)</code>, and <code>this</code> will
	 * be the current ManagedObject.
	 *
	 * @return new ID of the ManagedObject
	 * @type function
	 * @private
	 */
	ManagedObject._fnIdPreprocessor = null;

	/**
	 * A global preprocessor for the settings of a ManagedObject (used internally).
	 * If set, this function will be called before the settings are applied to any ManagedObject.
	 * If the original settings are empty, the hook will not be called (to be discussed).
	 *
	 * The expected signature is <code>function(mSettings)</code>, and <code>this</code> will
	 * be the current ManagedObject.
	 *
	 * @type function
	 * @private
	 */
	ManagedObject._fnSettingsPreprocessor = null;

	ManagedObject.runWithPreprocessors = function(fn, oPreprocessors) {
		jQuery.sap.assert(typeof fn === "function", "fn must be a function");
		jQuery.sap.assert(!oPreprocessors || typeof oPreprocessors === "object", "oPreprocessors must be an object");

		var oOldPreprocessors = { id : this._fnIdPreprocessor, settings : this._fnSettingsPreprocessor };
		oPreprocessors = oPreprocessors || {};

		this._fnIdPreprocessor = oPreprocessors.id;
		this._fnSettingsPreprocessor = oPreprocessors.settings;

		try {
			var result = fn.call();
			this._fnIdPreprocessor = oOldPreprocessors.id;
			this._fnSettingsPreprocessor = oOldPreprocessors.settings;
			return result;
		} catch (e) {
			this._fnIdPreprocessor = oOldPreprocessors.id;
			this._fnSettingsPreprocessor = oOldPreprocessors.settings;
			throw e;
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
	 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ManagedObject.prototype.applySettings = function(mSettings, oScope) {

		// PERFOPT: don't retrieve (expensive) JSONKeys if no settings are given
		if ( !mSettings || jQuery.isEmptyObject(mSettings) ) {
			return this;
		}

		var that = this,
			oMetadata = this.getMetadata(),
			mValidKeys = oMetadata.getJSONKeys(), // UID names required, they're part of the documented contract of applySettings
			makeObject = ManagedObject.create,
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
			if ( mSettings.models instanceof Model) {
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
			if ( mSettings.bindingContexts instanceof Context) {
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
				for (var sKey in mSettings.objectBindings ) {
					mSettings.objectBindings.model = sKey;
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
					oBindingInfo = this.extractBindingInfo(oValue, oScope);
					if (oBindingInfo && typeof oBindingInfo === "object") {
						this.bindProperty(sKey, oBindingInfo);
					} else {
						this[oKeyInfo._sMutator](oBindingInfo || oValue);
					}
					break;
				case 1: // SINGLE_AGGREGATION
					oBindingInfo = oKeyInfo.altTypes && this.extractBindingInfo(oValue, oScope);
					if ( oBindingInfo && typeof oBindingInfo === "object" ) {
						this.bindProperty(sKey, oBindingInfo);
					} else {
						if (Array.isArray(oValue)){
							// assumption: we have an extensionPoint here which is always an array, even if it contains a single control
							if (oValue.length > 1){
								jQuery.sap.log.error("Tried to add an array of controls to a single aggregation");
							}
							oValue = oValue[0];
						}
						this[oKeyInfo._sMutator](makeObject(oBindingInfo || oValue, oKeyInfo, oScope));
					}
					break;
				case 2: // MULTIPLE_AGGREGATION
					oBindingInfo = this.extractBindingInfo(oValue, oScope);
					if (oBindingInfo && typeof oBindingInfo === "object" ) {
						this.bindAggregation(sKey, oBindingInfo);
					} else {
						oValue = oBindingInfo || oValue; // could be an unescaped string if altTypes contains 'string'
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
					} else {
						this[oKeyInfo._sMutator](oValue[0], oValue[1], oValue[2]);
					}
					break;
				case -1: // SPECIAL_SETTING
					// No assert
				default:
					break;
				}
			} else {
				// there must be no unknown settings
				jQuery.sap.assert(false, "ManagedObject.apply: encountered unknown setting '" + sKey + "' for class '" + oMetadata.getName() + "' (value:'" + oValue + "')");
			}
		}

		return this;
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
	 * Returns the object's Id.
	 *
	 * @return {string} the objects's Id.
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
	 * @returns {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 *
	 * @protected
	 */
	ManagedObject.prototype.setProperty = function(sPropertyName, oValue, bSuppressInvalidate) {

		// check for a value change
		var oOldValue = this.mProperties[sPropertyName];

		// value validation
		oValue = this.validateProperty(sPropertyName, oValue);

		if (jQuery.sap.equal(oOldValue, oValue)) {
			// ensure to set the own property explicitly to allow isPropertyInitial check (using hasOwnProperty on the map)
			this.mProperties[sPropertyName] = oValue;
			return this;
		} // no change

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			//Refresh only for property changes with suppressed invalidation (others lead to rerendering and refresh is handled there)
			jQuery.sap.act.refresh();
			this.iSuppressInvalidate++;
		}

		// change the property (and invalidate if the rendering should be updated)
		this.mProperties[sPropertyName] = oValue;
		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// check whether property is bound and update model in case of two way binding
		this.updateModelProperty(sPropertyName, oValue, oOldValue);

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

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
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
			oProperty = this.getMetadata().getProperty(sPropertyName),
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
	 * @param {string} sPropertyName the name of the property
	 * @param {any} oValue the value
	 * @return {any} the normalized value for the passed value or for the default value if null or undefined was passed
	 * @throws Error if no property with the given name is found or the given value does not fit to the property type
	 * @protected
	 */
	ManagedObject.prototype.validateProperty = function(sPropertyName, oValue) {
		var oProperty = this.getMetadata().getProperty(sPropertyName),
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
		return !Object.prototype.hasOwnProperty.call(this.mProperties, sPropertyName) && !this.isBound(sPropertyName);
	};

	/**
	 * Resets the given property to the default value and also restores the "initial" state (like it has never been set).
	 *
	 * @param {string} sPropertyName the name of the property
	 * @returns {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.resetProperty = function(sPropertyName) {
		if (this.mProperties.hasOwnProperty(sPropertyName)) {
			var oPropertyInfo = this.getMetadata().getProperty(sPropertyName);
			this[oPropertyInfo._sMutator](null); // let the control instance know the value is reset to default

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
	 * @param {string} sPropertyName the name of the property
	 * @return {object} a map of properties describing the origin of this property value or null
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
	 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.setAssociation = function(sAssociationName, sId, bSuppressInvalidate) {
		if (sId instanceof ManagedObject) {
			sId = sId.getId();
		} else if (sId != null && typeof sId !== "string") {
			jQuery.sap.assert(false, "setAssociation(): sId must be a string, an instance of sap.ui.base.ManagedObject or null");
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
	 * @param {object}
	 *			  oDefaultForCreation the object that is used in case the current aggregation is empty (only null or empty array allowed)
	 * @return {string | string[]} the ID of the associated managed object or an array of such IDs; may be null if the association has not been populated
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
	 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.addAssociation = function(sAssociationName, sId, bSuppressInvalidate) {
		if (sId instanceof ManagedObject) {
			sId = sId.getId();
		} else if (typeof sId !== "string") {
			// TODO what about empty string?
			jQuery.sap.assert(false, "addAssociation(): sId must be a string or an instance of sap.ui.base.ManagedObject");
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
				jQuery.sap.log.warning("ManagedObject.removeAssociation called with invalid index: " + sAssociationName + ", " + vObject);
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
		if (!aIds)	{
			return [];
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		delete this.mAssociations[sAssociationName];
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
	ManagedObject.prototype.validateAggregation = function(sAggregationName, oObject, bMultiple) {
		var oMetadata = this.getMetadata(),
			oAggregation = oMetadata.getManagedAggregation(sAggregationName), // public or private
			aAltTypes,
			oType,
			i,
			msg;

		if (!oAggregation) {
			throw new Error("Aggregation \"" + sAggregationName + "\" does not exist in " + this);
		}

		if (oAggregation.multiple !== bMultiple ) {
			throw new Error("Aggregation '" + sAggregationName + "' of " + this + " used with wrong cardinality (declared as " + (oAggregation.multiple ? "0..n" : "0..1") + ")");
		}

		//Null is a valid value for 0..1 aggregations
		if (!oAggregation.multiple && !oObject) {
			return oObject;
		}

		oType = jQuery.sap.getObject(oAggregation.type);
		// class types
		if ( typeof oType === "function" && oObject instanceof oType ) {
			return oObject;
		}
		// interfaces
		if ( oObject && oObject.getMetadata && oObject.getMetadata().isInstanceOf(oAggregation.type) ) {
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
			jQuery.sap.assert(false, msg);
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
	 * @param {object}
	 *            oObject the managed object that is set as aggregated object
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @throws {Error}
	 * @protected
	 */
	ManagedObject.prototype.setAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		var oOldChild = this.mAggregations[sAggregationName];
		if (oOldChild === oObject) {
			return this;
		} // no change
		oObject = this.validateAggregation(sAggregationName, oObject, /* multiple */ false);

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		if (oOldChild instanceof ManagedObject) { // remove old child
			oOldChild.setParent(null);
		}
		this.mAggregations[sAggregationName] = oObject;
		if (oObject instanceof ManagedObject) { // adopt new child
			oObject.setParent(this, sAggregationName, bSuppressInvalidate);
		} else {
			if (!this.isInvalidateSuppressed()) {
				this.invalidate();
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
	 * @param {string}
	 *            sAggregationName the name of the aggregation
	 * @param {sap.ui.base.ManagedObject | Array}
	 *			  oDefaultForCreation the object that is used in case the current aggregation is empty
	 * @type sap.ui.base.ManagedObject|Array
	 * @return the aggregation array in case of 0..n-aggregations or the managed object or null in case of 0..1-aggregations
	 * @protected
	 */
	ManagedObject.prototype.getAggregation = function(sAggregationName, oDefaultForCreation) {
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
	 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		if (!oObject) {
			return this;
		}
		oObject = this.validateAggregation(sAggregationName, oObject, /* multiple */ true);

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
		if (i !== iIndex) {
			jQuery.sap.log.warning("ManagedObject.insertAggregation: index '" + iIndex + "' out of range [0," + aChildren.length + "], forced to " + i);
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
	 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		if (!oObject) {
			return this;
		}
		oObject = this.validateAggregation(sAggregationName, oObject, /* multiple */ true);

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
	 * result of this method. If the object could not be found, <code>undefined</code> is returned.
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
	 * @return {sap.ui.base.ManagedObject} the removed object or null
	 * @protected
	 */
	ManagedObject.prototype.removeAggregation = function(sAggregationName, vObject, bSuppressInvalidate) {
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
				jQuery.sap.log.warning("ManagedObject.removeAggregation called with invalid index: " + sAggregationName + ", " + vObject);

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
	 * @param {string}
	 *            sAggregationName the name of the aggregation
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @type Array
	 * @return an array of the removed elements (might be empty)
	 * @protected
	 */
	ManagedObject.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate){
		var aChildren = this.mAggregations[sAggregationName];
		if (!aChildren)	{
			return [];
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		delete this.mAggregations[sAggregationName];
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
	 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate){
		var aChildren = this.mAggregations[sAggregationName],
			i, aChild;

		// destroy surrogates in this aggregation
		getStashedControls(this.getId()).forEach(function(c) {
			if (c.sParentAggregationName === sAggregationName) {
				c.destroy();
			}
		});

		if (!aChildren) {
			return this;
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
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
	 * This triggers rerendering of itself and its children.<br/> As <code>sap.ui.base.ManagedObject</code> "bubbles up" the
	 * invalidate, changes to child-<code>Elements</code> will also result in rerendering of the whole sub tree.
	 * @protected
	 */
	ManagedObject.prototype.invalidate = function() {
		if (this.oParent) {
			this.oParent.invalidate(this);
		}
	};


	/**
	 * Returns whether rerendering is currently suppressed on this ManagedObject
	 * @return boolean
	 * @protected
	 */
	ManagedObject.prototype.isInvalidateSuppressed = function() {
		var bInvalidateSuppressed = this.iSuppressInvalidate > 0;
		if (this.oParent && this.oParent instanceof ManagedObject) {
			bInvalidateSuppressed = bInvalidateSuppressed || this.oParent.isInvalidateSuppressed();
		}
		return bInvalidateSuppressed;
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
			jQuery.sap.log.error("Cannot remove aggregated child without aggregation name.", null, this);
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
	 * @return {sap.ui.base.ManagedObject}
	 *            Returns <code>this</code> to allow method chaining
	 * @private
	 */
	ManagedObject.prototype.setParent = function(oParent, sAggregationName, bSuppressInvalidate) {
		jQuery.sap.assert(oParent == null || oParent instanceof ManagedObject, "oParent either must be null, undefined or a ManagedObject");

		if ( !oParent ) {

			//fire aggregation lifecycle event on current parent as the control is removed, but not inserted to a new parent
			if (this.oParent) {
				if (this.oParent._observer) {
					this.oParent._observer.aggregationChange(this.oParent, this.sParentAggregationName, "remove", this);
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
					setTimeout(function() {
						// if object is being destroyed or parent is set again (move) no propagation is needed
						if (!this.oParent) {
							this.updateBindings(true, null);
							this.updateBindingContext(false, undefined, true);
							this.propagateProperties(true);
							this.fireModelContextChange();
						}
					}.bind(this), 0);
				}
			}

			this._oContextualSettings = ManagedObject._defaultContextualSettings;
			if (!this._bIsBeingDestroyed) {
				setTimeout(function() {
					// if object is being destroyed or parent is set again (move) no propagation is needed
					if (!this.oParent) {
						this._propagateContextualSettings();
					}
				}.bind(this), 0);
			}

			jQuery.sap.act.refresh();

			// Note: no need (and no way how) to invalidate
			return;
		}

		if ( isInclusiveDescendantOf(oParent, this) ) {
			throw new Error("Cycle detected: new parent '" + oParent + "' is already a descendant of (or equal to) '" + this + "'");
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			//Refresh only for changes with suppressed invalidation (others lead to rerendering and refresh is handled there)
			jQuery.sap.act.refresh();
			this.iSuppressInvalidate++;
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

		//get properties to propagate
		var oPropagatedProperties = oParent._getPropertiesToPropagate();

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

		this._applyContextualSettings(oParent._oContextualSettings);

		// only the parent knows where to render us, so we have to invalidate it
		if ( oParent && !this.isInvalidateSuppressed() ) {
			oParent.invalidate(this);
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		//fire aggregation lifecycle event on the new parent
		if (oParent._observer) {
			oParent._observer.aggregationChange(oParent, sAggregationName, "insert", this);
		}
		return this;
	};

	/**
	 * Applies new contextual settings to a managed object, and propagates them to its children
	 * @param oContextualSettings
	 * @private
	 */
	ManagedObject.prototype._applyContextualSettings = function(oContextualSettings) {

		if (this._oContextualSettings !== oContextualSettings) {
			this._oContextualSettings = oContextualSettings;
			this._propagateContextualSettings();
			this._onContextualSettingsChanged();
		}
	};

	/**
	 * Hook method to let descendants of ManagedObject know when propagated contextual settings have changed
	 * @private
	 * @sap-restricted sap.ui.core.Element
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
	 * @return {sap.ui.base.ManagedObject} The technical parent managed object or <code>null</code>
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
	 * After an object has been destroyed, it can no longer be used in!
	 *
	 * Applications should call this method if they don't need the object any longer.
	 *
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @public
	 */
	ManagedObject.prototype.destroy = function(bSuppressInvalidate) {
		var that = this;

		// avoid binding update/propagation
		this._bIsBeingDestroyed = true;

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		if (this.exit) {
			this.exit();
		}

		// TODO: generic concept for exit hooks?
		if ( this._exitCompositeSupport ) {
			this._exitCompositeSupport();
		}

		// ensure that also our children are destroyed!!
		for (var oAggr in this.mAggregations) {
			this.destroyAggregation(oAggr, bSuppressInvalidate);
		}

		// destroy all inactive children
		getStashedControls(this.getId()).forEach(function(c) {
			c.destroy();
		});

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
		jQuery.each(this.mBindingInfos, function(sName, oBindingInfo) {
			if (oBindingInfo.factory) {
				that.unbindAggregation(sName, true);
			} else {
				that.unbindProperty(sName, true);
			}
		});

		jQuery.each(this.mObjectBindingInfos, function(sName, oBoundObject) {
			that.unbindObject(sName, /* _bSkipUpdateBindingContext */ true);
		});

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		if ( this._observer ) {
			// TODO notify observer to cleanup bookkeeping?
			this._observer = undefined;
		}

		EventProvider.prototype.destroy.apply(this, arguments);

		// finally make the object unusable
		this.setParent = function(){
			throw Error("The object with ID " + that.getId() + " was destroyed and cannot be used anymore.");
		};

		// make visible that it's been destroyed.
		this.bIsDestroyed = true;
	};


	// DataBinding
	/**
	 * Binding parser to use.
	 */
	ManagedObject.bindingParser = BindingParser.simpleParser;

	/**
	 * Determines whether a given object contains binding information instead of a
	 * value or aggregated controls. The method is used in applySettings for processing
	 * the JSON notation of properties/aggregations in the constructor.
	 *
	 * @param {object} oValue the value
	 * @param {object} oKeyInfo the metadata of the property
	 *
	 * @returns {boolean} whether the value contains binding information
	 *
	 * @private
	 * @deprecated
	 */
	ManagedObject.prototype.isBinding = function(oValue, oKeyInfo) {
		return typeof this.extractBindingInfo(oValue) === "object";
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
	 *
	 * @returns {object} the binding info object or an unescaped string or undefined.
	 *     If a binding info is returned, it contains at least a path property
	 *     or nested bindings (parts) and, depending on the binding type,
	 *     additional properties
	 *
	 * @private
	 */
	ManagedObject.prototype.extractBindingInfo = function(oValue, oScope) {

		// property:{path:"path", template:oTemplate}
		if (oValue && typeof oValue === "object") {
			if (oValue.ui5object) {
				// if value contains ui5object property, this is not a binding info,
				// remove it and not check for path or parts property
				delete oValue.ui5object;
			} else if (oValue.path != undefined || oValue.parts) {
				// allow JSON syntax for templates
				if (oValue.template) {
					oValue.template = ManagedObject.create(oValue.template);
				}
				return oValue;
			}
		}

		// property:"{path}" or "\{path\}"
		if (typeof oValue === "string") {
			// either returns a binding info or an unescaped string or undefined - depending on binding syntax
			return ManagedObject.bindingParser(oValue, oScope, true);
		}

		// return undefined;
	};

	/**
	 * Returns the binding infos for the given property or aggregation. The binding info contains information about path, binding object, format options,
	 * sorter, filter etc. for the property or aggregation. As the binding object is only created when the model becomes available, the binding property may be
	 * undefined.
	 *
	 * @param {string} sName the name of the property or aggregation
	 *
	 * @returns {object} the binding info object, containing at least a path or parts property
	 *                   and, depending on the binding type, additional properties
	 *
	 * @protected
	 */
	ManagedObject.prototype.getBindingInfo = function(sName) {
		return this.mBindingInfos[sName];
	};

	/**
	 * Bind the object to the referenced entity in the model, which is used as the binding context
	 * to resolve bound properties or aggregations of the object itself and all of its children
	 * relatively to the given path.
	 * If a relative binding path is used, this will be applied whenever the parent context changes.
	 * There is no difference between {@link sap.ui.core.Element#bindElement} and {@link sap.ui.base.ManagedObject#bindObject}.
	 * @param {string|object} vPath the binding path or an object with more detailed binding options
	 * @param {string} vPath.path the binding path
	 * @param {object} [vPath.parameters] map of additional parameters for this binding
	 * @param {string} [vPath.model] name of the model
	 * @param {object} [vPath.events] map of event listeners for the binding events
	 * @param {object} [mParameters] map of additional parameters for this binding (only taken into account when vPath is a string in that case the properties described for vPath above are valid here).
	 * The supported parameters are listed in the corresponding model-specific implementation of <code>sap.ui.model.ContextBinding</code>.
	 *
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.bindObject = function(sPath, mParameters) {
		var oBindingInfo = {},
			sModelName,
			iSeparatorPos;
		// support object notation
		if (typeof sPath == "object") {
			oBindingInfo = sPath;
			sPath = oBindingInfo.path;
		} else {
			oBindingInfo.path = sPath;
			oBindingInfo.parameters = mParameters;
		}

		// if a model separator is found in the path, extract model name and path
		iSeparatorPos = sPath.indexOf(">");
		if (iSeparatorPos > 0) {
			oBindingInfo.model = sPath.substr(0, iSeparatorPos);
			oBindingInfo.path = sPath.substr(iSeparatorPos + 1);
		}

		sModelName = oBindingInfo.model;

		// if old binding exists, clean it up
		if ( this.mObjectBindingInfos[sModelName] ) {
			this.unbindObject(sModelName, /* _bSkipUpdateBindingContext */ true);
			// We don't push down context changes here
			// Either this will happen with the _bindObject call below or the model
			// is not available yet and wasn't available before -> no change of contexts
		}

		this.mObjectBindingInfos[sModelName] = oBindingInfo;

		// if the models are already available, create the binding
		if (this.getModel(sModelName)) {
			this._bindObject(oBindingInfo);
		}

		return this;
	};

	/**
	 * Create object binding
	 *
	 * @private
	 */
	ManagedObject.prototype._bindObject = function(oBindingInfo) {
		var oBinding,
			oContext,
			sModelName,
			oModel,
			that = this;

		var fChangeHandler = function(oEvent) {
			/* as we reuse the context objects we need to ensure an update of relative bindings. Therefore we set
			   the context to null so relative bindings will detect a context change */
			if (oBinding.getBoundContext() === that.getBindingContext(sModelName)) {
				that.setElementBindingContext(null, sModelName);
			}
			that.setElementBindingContext(oBinding.getBoundContext(), sModelName);
		};

		sModelName = oBindingInfo.model;
		oModel = this.getModel(sModelName);

		oContext = this.getBindingContext(sModelName);

		oBinding = oModel.bindContext(oBindingInfo.path, oContext, oBindingInfo.parameters);
		oBinding.attachChange(fChangeHandler);
		oBindingInfo.binding = oBinding;
		oBindingInfo.modelChangeHandler = fChangeHandler;

		oBinding.attachEvents(oBindingInfo.events);

		oBinding.initialize();
	};

	/**
	 * Bind the object to the referenced entity in the model, which is used as the binding context
	 * to resolve bound properties or aggregations of the object itself and all of its children
	 * relatively to the given path.
	 *
	 * @deprecated Since 1.11.1, please use bindElement instead.
	 * @param {string} sPath the binding path
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.bindContext = function(sPath) {
		return this.bindObject(sPath);
	};

	/**
	 * Removes the defined binding context of this object, all bindings will now resolve
	 * relative to the parent context again.
	 *
	 * @deprecated Since 1.11.1, please use unbindElement instead.
	 * @param {string} [sModelName] name of the model to remove the context for.
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.unbindContext = function(sModelName) {
		return this.unbindObject(sModelName);
	};

	/**
	 * Removes the defined binding context of this object, all bindings will now resolve
	 * relative to the parent context again.
	 *
	 * @param {string} [sModelName] name of the model to remove the context for.
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.unbindObject = function(sModelName, /* internal use only */ _bSkipUpdateBindingContext) {
		var oBindingInfo = this.mObjectBindingInfos[sModelName];
		if (oBindingInfo) {
			if (oBindingInfo.binding) {
				oBindingInfo.binding.detachChange(oBindingInfo.modelChangeHandler);
				oBindingInfo.binding.detachEvents(oBindingInfo.events);
				oBindingInfo.binding.destroy();
			}
			delete this.mObjectBindingInfos[sModelName];
			delete this.mElementBindingContexts[sModelName];
			if ( !_bSkipUpdateBindingContext ) {
				this.updateBindingContext(false, sModelName);
				this.propagateProperties(sModelName);
				this.fireModelContextChange();
			}
		}
		return this;
	};

	/**
	 * Binds a property to the model.
	 *
	 * The Setter for the given property will be called with the value retrieved from the data model.
	 * When the binding mode is <code>OneTime</code>, the property will be set only once. When it is
	 * <code>OneWay</code>, the property will be updated whenever the corresponding data in the model changes.
	 * In mode <code>TwoWay</code>, changes to the property (not originating in the model) will be
	 * reported back to the model (typical use case: user interaction changes the value of a control).
	 *
	 * This is a generic method which can be used to bind any property to the model. A managed
	 * object may flag any property in its metadata with <code>bindable="bindable"</code> to additionally
	 * provide named methods to bind and unbind the corresponding property.
	 *
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
	 * @param {string} sName
	 *            Name of the property to bind
	 * @param {object} oBindingInfo
	 *            Binding information
	 * @param {string} oBindingInfo.path
	 *            Path in the model to bind to, either an absolute path or relative to the binding
	 *            context for the corresponding model
	 * @param {string} [oBindingInfo.model]
	 *            Name of the model to bind against or <code>undefined</code> for the default model
	 * @param {function} [oBindingInfo.formatter]
	 *            Function to convert model data into a property value
	 * @param {boolean} [oBindingInfo.useRawValues]
	 *            Whether the parameters to the formatter function should be passed as raw values.
	 *            In this case the specified types for the binding parts are not used and the values
	 *            are not formatted.
	 *
	 *            <b>Note</b>: use this flag only when using multiple bindings. If you use only one
	 *            binding and want raw values then simply don't specify a type for that binding.
	 * @param {sap.ui.model.Type|string} [oBindingInfo.type]
	 *            A type object or the name of a type class to create such a type object; the type
	 *            will be used for converting model data to a property value (aka "formatting") and
	 *            vice versa (in binding mode <code>TwoWay</code>, aka "parsing")
	 * @param {string} [oBindingInfo.targetType]
	 *            Target type to be used by the type when formatting model data, for example "boolean"
	 *            or "string" or "any"; defaults to the property's type
	 * @param {object} [oBindingInfo.formatOptions]
	 *            Format options to be used for the type; only taken into account when the type is
	 *            specified by its name - a given type object won't be modified
	 * @param {object} [oBindingInfo.constraints]
	 *            Additional constraints to be used when constructing a type object from a type name,
	 *            ignored when a type object is given
	 * @param {sap.ui.model.BindingMode} [oBindingInfo.mode=Default]
	 *            Binding mode to be used for this property binding (e.g. one way)
	 * @param {object} [oBindingInfo.parameters]
	 *            Map of parameters which is passed to the binding; the supported parameters are listed
	 *            in the corresponding model-specific implementation of <code>sap.ui.model.PropertyBinding</code>.
	 * @param {object[]} [oBindingInfo.parts]
	 *            Array of binding info objects for the parts of a composite binding; the structure of
	 *            each binding info is the same as described for the <code>oBindingInfo</code> as a whole.
	 *
	 *            <b>Note</b>: recursive composite bindings are currently not supported
	 *
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.bindProperty = function(sName, oBindingInfo, /* undocumented, old API only: */ _vFormat, _sMode) {
		var iSeparatorPos,
			bAvailable = true,
			oProperty = this.getMetadata().getPropertyLikeSetting(sName);

		// check whether property or alternative type on aggregation exists
		if (!oProperty) {
			throw new Error("Property \"" + sName + "\" does not exist in " + this);
		}

		// old API compatibility (sName, sPath, _vFormat, _sMode)
		if (typeof oBindingInfo == "string") {
			oBindingInfo = {
				parts: [ {
					path: oBindingInfo,
					type: _vFormat instanceof Type ? _vFormat : undefined,
					mode: _sMode
				} ],
				formatter: typeof _vFormat === 'function' ? _vFormat : undefined
			};
		}

		// only one binding object with one binding specified
		if (!oBindingInfo.parts) {
			oBindingInfo.parts = [];
			oBindingInfo.parts[0] = {
				path: oBindingInfo.path,
				targetType: oBindingInfo.targetType,
				type: oBindingInfo.type,
				suspended: oBindingInfo.suspended,
				formatOptions: oBindingInfo.formatOptions,
				constraints: oBindingInfo.constraints,
				model: oBindingInfo.model,
				mode: oBindingInfo.mode
			};
			delete oBindingInfo.path;
			delete oBindingInfo.targetType;
			delete oBindingInfo.mode;
			delete oBindingInfo.model;
		}

		for ( var i = 0; i < oBindingInfo.parts.length; i++ ) {

			var oPart = oBindingInfo.parts[i];
			if (typeof oPart == "string") {
				oPart = { path: oPart };
				oBindingInfo.parts[i] = oPart;
			}

			// if a model separator is found in the path, extract model name and path
			iSeparatorPos = oPart.path.indexOf(">");
			if (iSeparatorPos > 0) {
				oPart.model = oPart.path.substr(0, iSeparatorPos);
				oPart.path = oPart.path.substr(iSeparatorPos + 1);
			}
			// if a formatter exists the binding mode can be one way or one time only
			if (oBindingInfo.formatter && oPart.mode != BindingMode.OneWay && oPart.mode != BindingMode.OneTime) {
				oPart.mode = BindingMode.OneWay;
			}

			if (!this.getModel(oPart.model)) {
				bAvailable = false;
			}

		}

		// if property is already bound, unbind it first
		if (this.isBound(sName)) {
			this.unbindProperty(sName, true);
		}

		// store binding info to create the binding, as soon as the model is available, or when the model is changed
		this.mBindingInfos[sName] = oBindingInfo;

		// if the models are already available, create the binding
		if (bAvailable) {
			this._bindProperty(sName, oBindingInfo);
		}
		return this;
	};

	ManagedObject.prototype._bindProperty = function(sName, oBindingInfo) {
		var oModel,
			oContext,
			oBinding,
			sMode,
			sCompositeMode = BindingMode.TwoWay,
			oType,
			clType,
			oPropertyInfo = this.getMetadata().getPropertyLikeSetting(sName), // TODO fix handling of hidden entities?
			sInternalType = oPropertyInfo._iKind === /* PROPERTY */ 0 ? oPropertyInfo.type : oPropertyInfo.altTypes[0],
			that = this,
			aBindings = [],
			fModelChangeHandler = function(oEvent){
				that.updateProperty(sName);
				//clear Messages from messageManager
				var oDataState = oBinding.getDataState();
				if (oDataState) {
					var oControlMessages = oDataState.getControlMessages();
					if (oControlMessages && oControlMessages.length > 0) {
						var oMessageManager = sap.ui.getCore().getMessageManager();
						oDataState.setControlMessages([]); //remove the controlMessages before informing manager to avoid DataStateChange event to fire
						if (oControlMessages) {
							oMessageManager.removeMessages(oControlMessages);
						}
					}
					oDataState.setInvalidValue(undefined); //assume that the model always sends valid data
				}
				if (oBinding.getBindingMode() === BindingMode.OneTime && oBinding.isResolved()) {
					// if binding is one time but not resolved yet we don't destroy it yet.
					oBinding.detachChange(fModelChangeHandler);
					oBinding.detachEvents(oBindingInfo.events);
					oBinding.destroy();
					// TODO remove the binding from the binding info or mark it somehow as "deactivated"?
				}
			},
			fDataStateChangeHandler = function(){
				var oDataState = oBinding.getDataState();
				if (!oDataState) {
					return;
				}
				//inform generic refreshDataState method
				if (that.refreshDataState) {
					that.refreshDataState(sName, oDataState);
				}
			};

		// Only use context for bindings on the primary model
		oContext = this.getBindingContext(oBindingInfo.model);

		oBindingInfo.parts.forEach(function(oPart) {
			// Only use context for bindings on the primary model
			oContext = that.getBindingContext(oPart.model);
			// Create binding object
			oModel = that.getModel(oPart.model);
			// Create type instance if needed
			oType = oPart.type;
			if (typeof oType == "string") {
				clType = jQuery.sap.getObject(oType);
				if (typeof clType !== "function") {
					throw new Error("Cannot find type \"" + oType + "\" used in control \"" + that.getId() + "\"!");
				}
				oType = new clType(oPart.formatOptions, oPart.constraints);
			}

			oBinding = oModel.bindProperty(oPart.path, oContext, oBindingInfo.parameters);
			oBinding.setType(oType, oPart.targetType || sInternalType);
			oBinding.setFormatter(oPart.formatter);
			if (oPart.suspended) {
				oBinding.suspend(true);
			}

			sMode = oPart.mode || oModel.getDefaultBindingMode();
			oBinding.setBindingMode(sMode);

			// Only if all parts have twoway binding enabled, the composite binding will also have twoway binding
			if (sMode != BindingMode.TwoWay) {
				sCompositeMode = BindingMode.OneWay;
			}

			aBindings.push(oBinding);
		});

		// check if we have a composite binding or a formatter function created by the BindingParser which has property textFragments
		if (aBindings.length > 1 || ( oBindingInfo.formatter && oBindingInfo.formatter.textFragments )) {
			// Create type instance if needed
			oType = oBindingInfo.type;
			if (typeof oType == "string") {
				clType = jQuery.sap.getObject(oType);
				oType = new clType(oBindingInfo.formatOptions, oBindingInfo.constraints);
			}
			oBinding = new CompositeBinding(aBindings, oBindingInfo.useRawValues);
			oBinding.setType(oType, oBindingInfo.targetType || sInternalType);
			oBinding.setBindingMode(oBindingInfo.mode || sCompositeMode);
		} else {
			oBinding = aBindings[0];
		}

		oBinding.attachChange(fModelChangeHandler);
		if (this.refreshDataState) {
			oBinding.attachAggregatedDataStateChange(fDataStateChangeHandler);
		}

		// set only one formatter function if any
		// because the formatter gets the context of the element we have to set the context via proxy to ensure compatibility
		// for formatter function which is now called by the property binding
		// proxy formatter here because "this" is the correct cloned object
		oBinding.setFormatter(jQuery.proxy(oBindingInfo.formatter, this));

		// Set additional information on the binding info
		oBindingInfo.binding = oBinding;
		oBindingInfo.modelChangeHandler = fModelChangeHandler;
		oBindingInfo.dataStateChangeHandler = fDataStateChangeHandler;
		oBinding.attachEvents(oBindingInfo.events);

		oBinding.initialize();
	};

	/**
	 * Unbind the property from the model
	 *
	 * @param {string} sName the name of the property
	 * @param {boolean} bSuppressReset whether the reset to the default value when unbinding should be suppressed
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.unbindProperty = function(sName, bSuppressReset){
		var oBindingInfo = this.mBindingInfos[sName];
		if (oBindingInfo) {
			if (oBindingInfo.binding) {
				oBindingInfo.binding.detachChange(oBindingInfo.modelChangeHandler);
				if (this.refreshDataState) {
					oBindingInfo.binding.detachAggregatedDataStateChange(oBindingInfo.dataStateChangeHandler);
				}
				oBindingInfo.binding.detachEvents(oBindingInfo.events);
				oBindingInfo.binding.destroy();
			}
			delete this.mBindingInfos[sName];
			if (!bSuppressReset) {
				this.resetProperty(sName);
			}
		}
		return this;
	};

	/**
	 * Generic method which is called, whenever a property binding is changed.
	 * This method gets the external format from the property binding and applies
	 * it to the setter.
	 *
	 * @private
	 */
	ManagedObject.prototype.updateProperty = function(sName) {
		var oBindingInfo = this.mBindingInfos[sName],
			oBinding = oBindingInfo.binding,
			oPropertyInfo = this.getMetadata().getPropertyLikeSetting(sName);

		// If model change was triggered by the property itself, don't call the setter again
		if (oBindingInfo.skipPropertyUpdate) {
			return;
		}

		try {
			var oValue = oBinding.getExternalValue();
			oBindingInfo.skipModelUpdate = true;
			this[oPropertyInfo._sMutator](oValue);
			oBindingInfo.skipModelUpdate = false;
		} catch (oException) {
			oBindingInfo.skipModelUpdate = false;
			if (oException instanceof FormatException) {
				this.fireFormatError({
					element : this,
					property : sName,
					type : oBinding.getType(),
					newValue : oBinding.getValue(),
					oldValue : this[oPropertyInfo._sGetter](),
					exception: oException,
					message: oException.message
				}, false, true); // bAllowPreventDefault, bEnableEventBubbling
				oBindingInfo.skipModelUpdate = true;
				this.resetProperty(sName);
				oBindingInfo.skipModelUpdate = false;
			} else {
				throw oException;
			}
		}
	};

	/**
	 * Update the property in the model if two way data binding mode is enabled
	 *
	 * @param sName the name of the property to update
	 * @param oValue the new value to set for the property in the model
	 * @private
	 */
	ManagedObject.prototype.updateModelProperty = function(sName, oValue, oOldValue){
		if (this.isBound(sName)) {
			var oBindingInfo = this.mBindingInfos[sName],
				oBinding = oBindingInfo.binding;

			// If property change was triggered by the model, don't update the model again
			if (oBindingInfo.skipModelUpdate || (oBinding && oBinding.isSuspended())) {
				return;
			}

			// only one property binding should work with two way mode...composite binding does not work with two way binding
			if (oBinding && oBinding.getBindingMode() == BindingMode.TwoWay) {
				try {
					// Set flag to avoid originating property to be updated from the model
					oBindingInfo.skipPropertyUpdate = true;
					oBinding.setExternalValue(oValue);
					oBindingInfo.skipPropertyUpdate = false;

					// If external value differs from own value after model update,
					// update property again
					var oExternalValue = oBinding.getExternalValue();
					if (oValue != oExternalValue) {
						this.updateProperty(sName);
					}

					// Only fire validation success, if a type is used
					if (oBinding.hasValidation()) {
						this.fireValidationSuccess({
							element: this,
							property: sName,
							type: oBinding.getType(),
							newValue: oValue,
							oldValue: oOldValue
						}, false, true); // bAllowPreventDefault, bEnableEventBubbling
					}
				} catch (oException) {
					oBindingInfo.skipPropertyUpdate = false;
					if (oException instanceof ParseException) {
						this.fireParseError({
							element: this,
							property: sName,
							type: oBinding.getType(),
							newValue: oValue,
							oldValue: oOldValue,
							exception: oException,
							message: oException.message
						}, false, true); // bAllowPreventDefault, bEnableEventBubbling
					} else if (oException instanceof ValidateException) {
						this.fireValidationError({
							element: this,
							property: sName,
							type: oBinding.getType(),
							newValue: oValue,
							oldValue: oOldValue,
							exception: oException,
							message: oException.message
						}, false, true); // bAllowPreventDefault, bEnableEventBubbling
					} else {
						throw oException;
					}
				}
			}
		}
	};

	// a non-falsy value used as default for 'templateShareable'.
	var MAYBE_SHAREABLE_OR_NOT = 1;

	/**
	 * Bind an aggregation to the model.
	 *
	 * The bound aggregation will use the given template, clone it for each item
	 * which exists in the bound list and set the appropriate binding context.
	 * This is a generic method which can be used to bind any aggregation to the
	 * model. A managed object may flag aggregations in the metamodel with
	 * bindable="bindable" to get typed bind<i>Something</i> methods for those aggregations.
	 *
	 * @param {string} sName the aggregation to bind
	 * @param {object} oBindingInfo the binding info
	 * @param {string} oBindingInfo.path the binding path
	 * @param {sap.ui.base.ManagedObject} oBindingInfo.template the template to clone for each item in the aggregation
	 * @param {boolean} [oBindingInfo.templateShareable=true] option to enable that the template will be shared which means that it won't be destroyed or cloned automatically
	 * @param {function} oBindingInfo.factory the factory function
	 * @param {number} oBindingInfo.startIndex the first entry of the list to be created
	 * @param {number} oBindingInfo.length the amount of entries to be created (may exceed the size limit of the model)
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [oBindingInfo.sorter] the initial sort order (optional)
	 * @param {sap.ui.model.Filter[]} [oBindingInfo.filters] the predefined filters for this aggregation (optional)
	 * @param {string|function} oBindingInfo.key the name of the key property or a function getting the context as only parameter to calculate a key for entries. This can be used to improve update behaviour in models, where a key is not already available.
	 * @param {object} [oBindingInfo.parameters] a map of parameters which is passed to the binding.
	 * The supported parameters are listed in the corresponding model-specific implementation of <code>sap.ui.model.ListBinding</code> or <code>sap.ui.model.TreeBinding</code>.
	 * @param {function} [oBindingInfo.groupHeaderFactory] a factory function to generate custom group visualization (optional)
	 *
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
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
			jQuery.sap.log.error("Binding of single aggregation \"" + sName + "\" of " + this + " is not supported!");
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

		// if aggregation is already bound, unbind it first
		if (this.isBound(sName)) {
			this.unbindAggregation(sName);
		}

		// check whether a template has been provided, which is required for proper processing of the binding
		// If aggregation is marked correspondingly in the metadata, factory can be omitted (usually requires an updateXYZ method)
		if (!(oBindingInfo.template || oBindingInfo.factory)) {
			if ( oAggregationInfo._doesNotRequireFactory ) {
				// add a dummy factory as property 'factory' is used to distinguish between property- and list-binding
				oBindingInfo.factory = function() {
					throw new Error("dummy factory called unexpectedly ");
				};
			} else {
				throw new Error("Missing template or factory function for aggregation " + sName + " of " + this + " !");
			}
		}

		// if we have a template we will create a factory function
		if (oBindingInfo.template) {
			// set default for templateShareable
			if ( oBindingInfo.template._sapui_candidateForDestroy ) {
				// template became active again, we should no longer consider to destroy it
				jQuery.sap.log.warning(
					"A binding template that is marked as 'candidate for destroy' is reused in a binding. " +
					"You can use 'templateShareable:true' to fix this issue for all bindings that are affected " +
					"(The template is used in aggregation '" + sName + "' of object '" + this.getId() + "'). " +
					"For more information, see documentation under 'Aggregation Binding'.");
				delete oBindingInfo.template._sapui_candidateForDestroy;
			}
			if (oBindingInfo.templateShareable === undefined) {
				oBindingInfo.templateShareable = MAYBE_SHAREABLE_OR_NOT;
			}
			oBindingInfo.factory = function(sId) {
				return oBindingInfo.template.clone(sId);
			};
		}

		// if a model separator is found in the path, extract model name and path
		var iSeparatorPos = oBindingInfo.path.indexOf(">");
		if (iSeparatorPos > 0) {
			oBindingInfo.model = oBindingInfo.path.substr(0, iSeparatorPos);
			oBindingInfo.path = oBindingInfo.path.substr(iSeparatorPos + 1);
		}

		// store binding info to create the binding, as soon as the model is available, or when the model is changed
		this.mBindingInfos[sName] = oBindingInfo;

		// if the model is already available create the binding
		if (this.getModel(oBindingInfo.model)) {
			this._bindAggregation(sName, oBindingInfo);
		}
		return this;
	};

	ManagedObject.prototype._bindAggregation = function(sName, oBindingInfo) {
		var that = this,
			oBinding,
			fModelChangeHandler = function(oEvent){
				var sUpdater = "update" + sName.substr(0,1).toUpperCase() + sName.substr(1);
				if (that[sUpdater]) {
					var sChangeReason = oEvent && oEvent.getParameter("reason");
					if (sChangeReason) {
						that[sUpdater](sChangeReason);
					} else {
						that[sUpdater]();
					}
				} else {
					that.updateAggregation(sName);
				}
			},
			fModelRefreshHandler = function(oEvent){
				var sRefresher = "refresh" + sName.substr(0,1).toUpperCase() + sName.substr(1);
				if (that[sRefresher]) {
					that[sRefresher](oEvent.getParameter("reason"));
				} else {
					fModelChangeHandler(oEvent);
				}
			};
			var oModel = this.getModel(oBindingInfo.model);
			if (this.isTreeBinding(sName)) {
				oBinding = oModel.bindTree(oBindingInfo.path, this.getBindingContext(oBindingInfo.model), oBindingInfo.filters, oBindingInfo.parameters, oBindingInfo.sorter);
			} else {
				oBinding = oModel.bindList(oBindingInfo.path, this.getBindingContext(oBindingInfo.model), oBindingInfo.sorter, oBindingInfo.filters, oBindingInfo.parameters);
				if (this.bUseExtendedChangeDetection) {
					oBinding.enableExtendedChangeDetection(!oBindingInfo.template, oBindingInfo.key);
				}
			}

		if (oBindingInfo.suspended) {
			oBinding.suspend(true);
		}

		oBindingInfo.binding = oBinding;
		oBindingInfo.modelChangeHandler = fModelChangeHandler;
		oBindingInfo.modelRefreshHandler = fModelRefreshHandler;

		oBinding.attachChange(fModelChangeHandler);

		oBinding.attachRefresh(fModelRefreshHandler);

		oBinding.attachEvents(oBindingInfo.events);

		oBinding.initialize();
	};

	/**
	 * Unbind the aggregation from the model
	 *
	 * @param {string} sName the name of the aggregation
	 * @param {boolean} bSuppressReset whether the reset to empty aggregation when unbinding should be suppressed
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.unbindAggregation = function(sName, bSuppressReset){
		var oBindingInfo = this.mBindingInfos[sName],
			oAggregationInfo = this.getMetadata().getAggregation(sName);
		if (oBindingInfo) {
			if (oBindingInfo.binding) {
				oBindingInfo.binding.detachChange(oBindingInfo.modelChangeHandler);
				oBindingInfo.binding.detachRefresh(oBindingInfo.modelRefreshHandler);
				oBindingInfo.binding.detachEvents(oBindingInfo.events);
				oBindingInfo.binding.destroy();
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

			delete this.mBindingInfos[sName];
			if (!bSuppressReset) {
				this[oAggregationInfo._sDestructor]();
			}
		}
		return this;
	};

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
	 * which then will be called by the framework instead of this generic method.
	 *
	 * Subclasses should call this method only in the implementation of such a named update method
	 * and for no other purposes. The framework might change the conditions under which the method
	 * is called and the method implementation might rely on those conditions.
	 *
	 * @param {string} sName name of the aggregation to update
	 * @protected
	 */
	ManagedObject.prototype.updateAggregation = function(sName) {
		var oBindingInfo = this.mBindingInfos[sName],
			oBinding = oBindingInfo.binding,
			fnFactory = oBindingInfo.factory,
			oAggregationInfo = this.getMetadata().getAggregation(sName),  // TODO fix handling of hidden aggregations
			sGroup,
			bGrouped,
			aContexts,
			sGroupFunction = oAggregationInfo._sMutator + "Group",
			that = this;

		function getIdSuffix(oControl, iIndex) {
			if (that.bUseExtendedChangeDetection) {
				return ManagedObjectMetadata.uid('clone');
			} else {
				return oControl.getId() + "-" + iIndex;
			}
		}

		// Update a single aggregation with the array of contexts. Reuse existing children
		// and just append or remove at the end, if some are missing or too many.
		function update(oControl, aContexts, fnBefore, fnAfter) {
			var aChildren = oControl[oAggregationInfo._sGetter]() || [],
				oContext,
				oClone;
			if (aChildren.length > aContexts.length) {
				for (var i = aContexts.length; i < aChildren.length; i++) {
					oClone = aChildren[i];
					oControl[oAggregationInfo._sRemoveMutator](oClone);
					oClone.destroy("KeepDom");
				}
			}
			for (var i = 0; i < aContexts.length; i++) {
				oContext = aContexts[i];
				oClone = aChildren[i];
				if (fnBefore) {
					fnBefore(oContext);
				}
				if (oClone) {
					oClone.setBindingContext(oContext, oBindingInfo.model);
				} else {
					oClone = fnFactory(getIdSuffix(oControl, i), oContext);
					oClone.setBindingContext(oContext, oBindingInfo.model);
					oControl[oAggregationInfo._sMutator](oClone);
				}
				if (fnAfter) {
					fnAfter(oContext, oClone);
				}
			}
		}

		// Update a single aggregation with the array of contexts. Use the calculated diff to
		// only add/remove children as the data has changed to minimize control updates and rendering
		function updateDiff(oControl, aContexts) {
			var aDiff = aContexts.diff,
				aChildren = oControl[oAggregationInfo._sGetter]() || [],
				oDiff, oClone, oContext, i;

			// If no diff exists or aggregation is empty, fall back to default update
			if (!aDiff || aChildren.length === 0) {
				update(oControl, aContexts);
				return;
			}

			// If diff is empty, nothing needs to be changed
			if (aDiff.length == 0) {
				return;
			}

			// Loop through the diff and apply it
			for (i = 0; i < aDiff.length; i++) {
				oDiff = aDiff[i];
				switch (oDiff.type) {
					case "insert":
						oContext = aContexts[oDiff.index];
						oClone = fnFactory(getIdSuffix(oControl, oDiff.index), oContext);
						oClone.setBindingContext(oContext, oBindingInfo.model);
						oControl[oAggregationInfo._sInsertMutator](oClone, oDiff.index);
						break;
					case "delete":
						oClone = oControl[oAggregationInfo._sRemoveMutator](oDiff.index);
						oClone.destroy("KeepDom");
						break;
					default:
						jQuery.sap.log.error("Unknown diff type \"" + oDiff.type + "\"");
				}
			}

			// Loop through all children and set the binding context again. This is needed for
			// indexed contexts, where inserting/deleting entries shifts the index of all following items
			aChildren = oControl[oAggregationInfo._sGetter]() || [];
			for (i = 0; i < aChildren.length; i++) {
				aChildren[i].setBindingContext(aContexts[i]);
			}
		}

		// Check the current context for its group. If the group key changes, call the
		// group function on the control.
		function updateGroup(oContext) {
			var oNewGroup = oBinding.getGroup(oContext);
			if (oNewGroup.key !== sGroup) {
				var oGroupHeader;
				//If factory is defined use it
				if (oBindingInfo.groupHeaderFactory) {
					oGroupHeader = oBindingInfo.groupHeaderFactory(oNewGroup);
				}
				that[sGroupFunction](oNewGroup, oGroupHeader);
				sGroup = oNewGroup.key;
			}
		}

		// Update the tree recursively
		function updateRecursive(oControl, oContexts) {
			update(oControl, oContexts, null, function(oContext, oClone) {
				updateRecursive(oClone, oBinding.getNodeContexts(oContext));
			});
		}

		if (oBinding instanceof ListBinding) {
			aContexts = oBinding.getContexts(oBindingInfo.startIndex, oBindingInfo.length);
			bGrouped = oBinding.isGrouped() && that[sGroupFunction];
			if (bGrouped || oBinding.bWasGrouped) {
				// If grouping is enabled, destroy aggregation and use updateGroup as fnBefore to create groups
				this[oAggregationInfo._sDestructor]();
				update(this, aContexts, bGrouped ? updateGroup : undefined);
			} else if (this.bUseExtendedChangeDetection) {
				// With extended change detection just update according to the diff
				updateDiff(this, aContexts);
			} else {
				// If factory function is used without extended change detection, destroy aggregation
				if (!oBindingInfo.template) {
					this[oAggregationInfo._sDestructor]();
				}
				update(this, aContexts);
			}
			oBinding.bWasGrouped = bGrouped;
		} else if (oBinding instanceof TreeBinding) {
			// Destroy all children in case a factory function is used
			if (!oBindingInfo.template) {
				this[oAggregationInfo._sDestructor]();
			}
			// In fnAfter call update recursively for the child nodes of the current tree node
			updateRecursive(this, oBinding.getRootContexts());
		}
	};

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
	ManagedObject.prototype.refreshAggregation = function(sName) {
		var oBindingInfo = this.mBindingInfos[sName],
			oBinding = oBindingInfo.binding;
		oBinding.getContexts(oBindingInfo.startIndex, oBindingInfo.length);
	};

	/**
	* Generic method which is called, whenever messages for this object exists.
	*
	* @param {string} sName The property name
	* @param {array} aMessages The messages
	* @protected
	* @since 1.28
	*/
	ManagedObject.prototype.propagateMessages = function(sName, aMessages) {
		jQuery.sap.log.warning("Message for " + this + ", Property " + sName);
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
	ManagedObject.prototype.updateBindings = function(bUpdateAll, sModelName) {
		var that = this,
			sName,
			oBindingInfo;

		/*
		 * Checks whether the binding for the given oBindingInfo became invalid because
		 * of the current model change (as identified by bUpdateAll and sModelName).
		 *
		 * Precondition: oBindingInfo contains a 'binding' object
		 *
		 * @param oBindingInfo
		 * @returns {boolean}
		 */
		function becameInvalid(oBindingInfo) {
			var aParts = oBindingInfo.parts,
				i;

			if (aParts) {
				if (aParts.length == 1) {
					// simple property binding: invalid when the model has the same name (or updateall) and when the model instance differs
					return (bUpdateAll || aParts[0].model == sModelName) && !oBindingInfo.binding.updateRequired(that.getModel(aParts[0].model));
				} else {
					// simple or composite binding: invalid when for any part the model has the same name (or updateall) and when the model instance for that part differs
					for (i = 0; i < aParts.length; i++) {
						if ( (bUpdateAll || aParts[i].model == sModelName) && !oBindingInfo.binding.aBindings[i].updateRequired(that.getModel(aParts[i].model)) ) {
							return true;
						}
					}
				}
			} else {
				// list or object binding: invalid when  the model has the same name (or updateall) and when the model instance differs
				return (bUpdateAll || oBindingInfo.model == sModelName) && !oBindingInfo.binding.updateRequired(that.getModel(oBindingInfo.model));
			}
		}

		/*
		 * Checks whether a binding can be created for the given oBindingInfo
		 * @param oBindingInfo
		 * @returns {boolean}
		 */
		function canCreate(oBindingInfo) {
			var aParts = oBindingInfo.parts,
				i;

			if (aParts) {
				for (i = 0; i < aParts.length; i++) {
					if ( !that.getModel(aParts[i].model) ) {
						return false;
					}
				}
				return true;
			} else { // List or object binding
				return !!that.getModel(oBindingInfo.model);
			}
		}

		/*
		 * Remove binding, detach all events and destroy binding object
		 */
		function removeBinding(oBindingInfo) {
			// Also tell the Control that the messages have been removed (if any)
			if (that.refreshDataState) {
				that.refreshDataState(sName, oBindingInfo.binding.getDataState());
			}

			oBindingInfo.binding.detachChange(oBindingInfo.modelChangeHandler);
			if (oBindingInfo.modelRefreshHandler) { // only list bindings currently have a refresh handler attached
				oBindingInfo.binding.detachRefresh(oBindingInfo.modelRefreshHandler);
			}
			oBindingInfo.binding.detachEvents(oBindingInfo.events);
			oBindingInfo.binding.destroy();
			// remove all binding related data from the binding info
			delete oBindingInfo.binding;
			delete oBindingInfo.modelChangeHandler;
			delete oBindingInfo.dataStateChangeHandler;
			delete oBindingInfo.modelRefreshHandler;
		}

		// create property and aggregation bindings if they don't exist yet
		for ( sName in this.mBindingInfos ) {

			oBindingInfo = this.mBindingInfos[sName];

			// if there is a binding and if it became invalid through the current model change, then remove it
			if ( oBindingInfo.binding && becameInvalid(oBindingInfo) ) {
				removeBinding(oBindingInfo);
			}

			// if there is no binding and if all required information is available, create a binding object
			if ( !oBindingInfo.binding && canCreate(oBindingInfo) ) {
				if (oBindingInfo.factory) {
					this._bindAggregation(sName, oBindingInfo);
				} else {
					this._bindProperty(sName, oBindingInfo);
				}
			}

		}

		// create object bindings if they don't exist yet
		for ( sName in this.mObjectBindingInfos ) {
			oBindingInfo = this.mObjectBindingInfos[sName];

			// if there is a binding and if it became invalid through the current model change, then remove it
			if ( oBindingInfo.binding && becameInvalid(oBindingInfo) ) {
				removeBinding(oBindingInfo);
			}

			// if there is no binding and if all required information is available, create a binding object
			if ( !oBindingInfo.binding && canCreate(oBindingInfo) ) {
				this._bindObject(oBindingInfo);
			}
		}


	};


	/**
	 * Find out whether a property or aggregation is bound
	 *
	 * @param {string} sName the name of the property or aggregation
	 * @return {boolean} whether a binding exists for the given name
	 * @public
	 */
	ManagedObject.prototype.isBound = function(sName){
		return (sName in this.mBindingInfos);
	};

	/**
	 * Get the object binding object for a specific model
	 *
	 * @param {string} sModelName the name of the model
	 * @return {sap.ui.model.Binding} the element binding for the given model name
	 * @public
	 */
	ManagedObject.prototype.getObjectBinding = function(sModelName){
		return this.mObjectBindingInfos[sModelName] && this.mObjectBindingInfos[sModelName].binding;
	};

	/**
	 * Returns the parent managed object as new eventing parent to enable control event bubbling
	 * or <code>null</code> if this object hasn't been added to a parent yet.
	 *
	 * @return {sap.ui.base.EventProvider} the parent event provider
	 * @protected
	 */
	ManagedObject.prototype.getEventingParent = function() {
		return this.oParent;
	};

	/**
	 * Get the binding object for a specific aggregation/property
	 *
	 * @param {string} sName the name of the property or aggregation
	 * @return {sap.ui.model.Binding} the binding for the given name
	 * @public
	 */
	ManagedObject.prototype.getBinding = function(sName){
		return this.mBindingInfos[sName] && this.mBindingInfos[sName].binding;
	};

	/**
	 * Get the binding path for a specific aggregation/property
	 *
	 * @param {string} sName the name of the property or aggregation
	 * @return {string} the binding path for the given name
	 * @protected
	 */
	ManagedObject.prototype.getBindingPath = function(sName){
		var oInfo = this.mBindingInfos[sName];
		return oInfo && (oInfo.path || (oInfo.parts && oInfo.parts[0] && oInfo.parts[0].path));
	};

	/**
	 * Set the binding context for this ManagedObject for the model with the given name.
	 *
	 * Note: to be compatible with future versions of this API, applications must not use the value <code>null</code>,
	 * the empty string <code>""</code> or the string literals <code>"null"</code> or <code>"undefined"</code> as model name.
	 *
	 * Note: A ManagedObject inherits binding contexts from the Core only when it is a descendant of a UIArea.
	 *
	 * @param {sap.ui.model.Context} oContext the new binding context for this object
	 * @param {string} [sModelName] the name of the model to set the context for or <code>undefined</code>
	 *
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.setBindingContext = function(oContext, sModelName){
		jQuery.sap.assert(sModelName === undefined || (typeof sModelName === "string" && !/^(undefined|null)?$/.test(sModelName)), "sModelName must be a string or omitted");
		var oOldContext = this.oBindingContexts[sModelName];
		if (oOldContext !== oContext) {
			this.oBindingContexts[sModelName] = oContext;
			this.updateBindingContext(false, sModelName);
			this.propagateProperties(sModelName);
			this.fireModelContextChange();
		}
		return this;
	};

	/**
	 * @private
	 */
	ManagedObject.prototype.setElementBindingContext = function(oContext, sModelName){
		jQuery.sap.assert(sModelName === undefined || (typeof sModelName === "string" && !/^(undefined|null)?$/.test(sModelName)), "sModelName must be a string or omitted");
		var oOldContext = this.mElementBindingContexts[sModelName];

		if (oOldContext !== oContext) {
			this.mElementBindingContexts[sModelName] = oContext;
			this.updateBindingContext(true, sModelName);
			this.propagateProperties(sModelName);
			this.fireModelContextChange();
		}
		return this;
	};

	/**
	 * Update the binding context in this object and all aggregated children
	 * @private
	 */
	ManagedObject.prototype.updateBindingContext = function(bSkipLocal, sFixedModelName, bUpdateAll){

		var oModel,
			oModelNames = {},
			sModelName,
			oContext,
			sName,
			oBindingInfo,
			i;

		// find models that need a context update
		if (bUpdateAll) {
			for (sModelName in this.oModels) {
				if ( this.oModels.hasOwnProperty(sModelName) ) {
					oModelNames[sModelName] = sModelName;
				}
			}
			for (sModelName in this.oPropagatedProperties.oModels) {
				if ( this.oPropagatedProperties.oModels.hasOwnProperty(sModelName) ) {
					oModelNames[sModelName] = sModelName;
				}
			}
		} else {
			oModelNames[sFixedModelName] = sFixedModelName;
		}

		for (sModelName in oModelNames ) {
			if ( oModelNames.hasOwnProperty(sModelName) ) {
				sModelName = sModelName === "undefined" ? undefined : sModelName;
				oModel = this.getModel(sModelName);
				oBindingInfo = this.mObjectBindingInfos[sModelName];

				if (oModel && oBindingInfo && !bSkipLocal) {
					if (!oBindingInfo.binding) {
						this._bindObject(oBindingInfo);
					} else {
						oContext = this._getBindingContext(sModelName);
						if (oContext !== oBindingInfo.binding.getContext()) {
							oBindingInfo.binding.setContext(oContext);
						}
					}
					continue;
				}

				oContext = this.getBindingContext(sModelName);

				// update context in existing bindings
				for ( sName in this.mBindingInfos ){
					var oBindingInfo = this.mBindingInfos[sName],
						oBinding = oBindingInfo.binding,
						aParts = oBindingInfo.parts;

					if (!oBinding) {
						continue;
					}
					if (aParts && aParts.length > 1) {
						// composite binding: update required  when a part use the model with the same name
						for (i = 0; i < aParts.length; i++) {
							if ( aParts[i].model == sModelName ) {
								oBinding.aBindings[i].setContext(oContext);
							}
						}
					} else if (oBindingInfo.factory) {
						// list binding: update required when the model has the same name (or updateall)
						if ( oBindingInfo.model == sModelName) {
							oBinding.setContext(oContext);
						}

					} else {
						// simple property binding: update required when the model has the same name
						if ( aParts[0].model == sModelName) {
							oBinding.setContext(oContext);
						}
					}
				}
			}
		}

	};


	/**
	 * Get the binding context of this object for the given model name.
	 *
	 * If the object does not have a binding context set on itself and has no own model set,
	 * it will use the first binding context defined in its parent hierarchy.
	 *
	 * Note: to be compatible with future versions of this API, applications must not use the value <code>null</code>,
	 * the empty string <code>""</code> or the string literals <code>"null"</code> or <code>"undefined"</code> as model name.
	 *
	 * Note: A ManagedObject inherits binding contexts from the Core only when it is a descendant of a UIArea.
	 *
	 * @param {string} [sModelName] the name of the model or <code>undefined</code>
	 * @return {sap.ui.model.Context} The binding context of this object
	 * @public
	 */
	ManagedObject.prototype.getBindingContext = function(sModelName){
		var oModel = this.getModel(sModelName),
			oElementBindingContext = this.mElementBindingContexts[sModelName];

		if (oElementBindingContext && !oModel) {
			return oElementBindingContext;
		} else if (oElementBindingContext && oModel && oElementBindingContext.getModel() === oModel) {
			return oElementBindingContext;
		} else {
			return this._getBindingContext(sModelName);
		}
	};

	/**
	 * Get the binding context of this object for the given model name. The elementBindingContext will not be considered
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
	 * When the name is omitted, the default model is set/unset.
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
	 * Note: to be compatible with future versions of this API, applications must not use the value <code>null</code>,
	 * the empty string <code>""</code> or the string literals <code>"null"</code> or <code>"undefined"</code> as model name.
	 *
	 * Note: By design, it is not possible to hide an inherited model by setting a <code>null</code> or
	 * <code>undefined</code> model. Applications can set an empty model to achieve the same.
	 *
	 * Note: A ManagedObject inherits models from the Core only when it is a descendant of a UIArea.
	 *
	 * @param {sap.ui.model.Model} oModel the model to be set or <code>null</code> or <code>undefined</code>
	 * @param {string} [sName] the name of the model or <code>undefined</code>
	 * @return {sap.ui.base.ManagedObject} <code>this</code> to allow method chaining
	 * @public
	 */
	ManagedObject.prototype.setModel = function(oModel, sName) {
		jQuery.sap.assert(oModel == null || oModel instanceof Model, "oModel must be an instance of sap.ui.model.Model, null or undefined");
		jQuery.sap.assert(sName === undefined || (typeof sName === "string" && !/^(undefined|null)?$/.test(sName)), "sName must be a string or omitted");
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
	 * @returns {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @private
	 * @sap-restricted sap.ui.fl
	 */
	ManagedObject.prototype.addPropagationListener = function(listener) {
		jQuery.sap.assert(typeof listener === 'function', "listener must be a function");
		this.aPropagationListeners.push(listener);
		this.propagateProperties(false);
		// call Listener on current object
		this._callPropagationListener(listener);
		return this;
	};

	/**
	 * remove a propagation listener
	 * @param {function} listener function
	 * @returns {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @private
	 * @sap-restricted sap.ui.fl
	 */
	ManagedObject.prototype.removePropagationListener = function(listener) {
		jQuery.sap.assert(typeof listener === 'function', "listener must be a function");
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
	 */
	ManagedObject.prototype._getPropagationListeners = function() {
		return this.oPropagatedProperties.aPropagationListeners.concat(this.aPropagationListeners);
	};

	/**
	 * Calls a registered listener during propagation
	 *
	 * @param {string|boolean} 	sName If set true all listeners will be called.
	 * 							If a name is specified only the listener for this name is called
	 * @returns {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @private
	 */
	ManagedObject.prototype._callPropagationListener = function(listener) {
		var aListeners;
		if (listener) {
			listener(this);
		} else {
			aListeners = this._getPropagationListeners();
			for (var i = 0; i < aListeners.length; i++) {
				listener = aListeners[i];
				listener(this);
			}
		}
		return this;
	};

	ManagedObject._oEmptyPropagatedProperties = {oModels:{}, oBindingContexts:{}, aPropagationListeners:[]};

	/**
	 * Propagate Properties (models and bindingContext) to aggregated objects.
	 * @param {string|undefined|true|false} sName when <code>true</code>, all bindings are updated,
	 * 		when <code>false</code> only propagationListeners are update.
	 * 		Otherwise only those for the given model name (undefined == name of default model)
	 *
	 * @private
	 */
	ManagedObject.prototype.propagateProperties = function(vName) {
		var oProperties = this._getPropertiesToPropagate(),
			bUpdateAll = vName === true, // update all bindings when no model name parameter has been specified
			bUpdateListener = vName === false, //update only propagation listeners
			sName = bUpdateAll ? undefined : vName,
			sAggregationName, oAggregation, i;

		for (sAggregationName in this.mAggregations) {
			if (this.mSkipPropagation[sAggregationName]) {
				continue;
			}
			oAggregation = this.mAggregations[sAggregationName];
			if (oAggregation instanceof ManagedObject) {
				this._propagateProperties(vName, oAggregation, oProperties, bUpdateAll, sName, bUpdateListener);
			} else if (oAggregation instanceof Array) {
				for (i = 0; i < oAggregation.length; i++) {
					if (oAggregation[i] instanceof ManagedObject) {
						this._propagateProperties(vName, oAggregation[i], oProperties, bUpdateAll, sName, bUpdateListener);
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
		var bNoOwnModels = jQuery.isEmptyObject(this.oModels),
			bNoOwnContexts = jQuery.isEmptyObject(this.oBindingContexts),
			bNoOwnListeners = this.aPropagationListeners.length === 0,
			bNoOwnElementContexts = jQuery.isEmptyObject(this.mElementBindingContexts);

		function merge(empty,o1,o2,o3) {
			return empty ? o1 : jQuery.extend({}, o1, o2, o3);
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
	 * Note: to be compatible with future versions of this API, applications must not use the value <code>null</code>,
	 * the empty string <code>""</code> or the string literals <code>"null"</code> or <code>"undefined"</code> as model name.
	 *
	 * @param {string|undefined} [sName] name of the model to be retrieved
	 * @return {sap.ui.model.Model} oModel
	 * @public
	 */
	ManagedObject.prototype.getModel = function(sName) {
		jQuery.sap.assert(sName === undefined || (typeof sName === "string" && !/^(undefined|null)?$/.test(sName)), "sName must be a string or omitted");
		return this.oModels[sName] || this.oPropagatedProperties.oModels[sName];
	};

	/**
	 * Check if any model is set to the ManagedObject or to one of its parents (including UIArea and Core).
	 *
	 * Note: A ManagedObject inherits models from the Core only when it is a descendant of a UIArea.
	 *
	 * @return {boolean} whether a model reference exists or not
	 * @public
	 */
	ManagedObject.prototype.hasModel = function() {
		return !(jQuery.isEmptyObject(this.oModels) && jQuery.isEmptyObject(this.oPropagatedProperties.oModels));
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
	 *
	 * For each cloned object the following settings are cloned based on the metadata of the object and the defined options:
	 * <ul>
	 * <li>all properties that are not bound. If <code>cloneBinding</code> is <code>false</code>,
	 *     even these properties will be cloned; the values are used by reference, they are not cloned</li>
	 * <li>all aggregated objects that are not bound. If <code>cloneBinding</code> is <code>false</code>,
	 *     even the ones that are bound will be cloned; they are all cloned recursively using the same
	 *     <code>sIdSuffix</code></li>
	 * <li>all associated controls; when an association points to an object inside the cloned object tree,
	 *     then the cloned association will be modified to that it points to the clone of the target object.
	 *     When the association points to a managed object outside of the cloned object tree, then its
	 *     target won't be changed.</li>
	 * <li>all models set via <code>setModel()</code>; used by reference </li>
	 * <li>all property and aggregation bindings (if <code>cloneBindings</code> is <code>true</code>);
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
	 * @param {Object} [oOptions] configuration object
	 * @param {boolean} [cloneChildren=true] Whether associations and aggregations will be cloned
	 * @param {boolean} [cloneBindings=true] Whether bindings will be cloned
	 * @returns {sap.ui.base.ManagedObject} Reference to the newly created clone
	 * @protected
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
			sIdSuffix = ManagedObjectMetadata.uid("clone") || jQuery.sap.uid();
		}
		// if no local ID array has been passed, collect IDs of all aggregated objects to
		// be able to properly adapt associations, which are within the cloned object hierarchy
		if (!aLocalIds && bCloneChildren) {
			aLocalIds = this.findAggregatedObjects(true).map(function(oObject) {
				return oObject.getId();
			});
		}

		var oMetadata = this.getMetadata(),
			oClass = oMetadata._oClass,
			sId = this.getId() + "-" + sIdSuffix,
			mSettings = {},
			mProps = this.mProperties,
			sKey,
			sName,
			oClone,
			escape = ManagedObject.bindingParser.escape,
			i;

		// Clone properties (only those with non-default value)
		var aKeys = Object.keys(mProps);
		i = aKeys.length;
		while ( i > 0 ) {
			sKey = aKeys[--i];
			//do not clone properties if property is bound and bindings are cloned; Property is set on update
			if ( /*mProps.hasOwnProperty(sKey) && */ !(this.isBound(sKey) && bCloneBindings)) {
				// Note: to avoid double resolution of binding expressions, we have to escape string values once again
				if (typeof mProps[sKey] === "string") {
					mSettings[sKey] = escape(mProps[sKey]);
				} else {
					mSettings[sKey] = mProps[sKey];
				}
			}
		}

		// Clone models
		mSettings["models"] = this.oModels;

		// Clone BindingContext
		mSettings["bindingContexts"] = this.oBindingContexts;

		if (bCloneChildren) {
			// Clone aggregations
			for (sName in this.mAggregations) {
				var oAggregation = this.mAggregations[sName];
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
						mSettings[sName] = oAggregation;
					}
				}
			}

			// clone inactive children
			var aInactiveChildren = getStashedControls(this.getId());
			for (var i = 0, l = aInactiveChildren.length; i < l; i++) {
					var oClonedChild = aInactiveChildren[i].clone(sIdSuffix);
					oClonedChild.sParentId = sId;
					oClonedChild.sParentAggregationName = aInactiveChildren[i].sParentAggregationName;
			}

			// Clone associations
			for (sName in this.mAssociations) {
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

		/* Clone element bindings: Clone the objects not the parameters
		 * Context will only be updated when adding the control to the control tree;
		 * Maybe we have to call updateBindingContext() here?
		 */
		for (sName in this.mObjectBindingInfos) {
			oClone.mObjectBindingInfos[sName] = jQuery.extend({}, this.mObjectBindingInfos[sName]);
		}

		// Clone events
		for (sName in this.mEventRegistry) {
			oClone.mEventRegistry[sName] = this.mEventRegistry[sName].slice();
		}

		// Clone bindings
		if (bCloneBindings) {
			for (sName in this.mBindingInfos) {
				var oBindingInfo = this.mBindingInfos[sName];
				var oCloneBindingInfo = jQuery.extend({}, oBindingInfo);

				// clone the template if it is not sharable
				if (!oBindingInfo.templateShareable && oBindingInfo.template && oBindingInfo.template.clone) {
					oCloneBindingInfo.template = oBindingInfo.template.clone(sIdSuffix,	aLocalIds);
					delete oCloneBindingInfo.factory;
				} else if ( oBindingInfo.templateShareable === MAYBE_SHAREABLE_OR_NOT ) {
					// a 'clone' operation implies sharing the template (if templateShareable is not set to false)
					oBindingInfo.templateShareable = oCloneBindingInfo.templateShareable = true;
					jQuery.sap.log.error(
						"During a clone operation, a template was found that neither was marked with 'templateShareable:true' nor 'templateShareable:false'. " +
						"The framework won't destroy the template. This could cause errors (e.g. duplicate IDs) or memory leaks " +
						"(The template is used in aggregation '" + sName + "' of object '" + this.getId() + "')." +
						"For more information, see documentation under 'Aggregation Binding'.");
				}

				 // remove the runtime binding data (otherwise the property will not be connected again!)
				delete oCloneBindingInfo.binding;
				delete oCloneBindingInfo.modelChangeHandler;
				delete oCloneBindingInfo.dataStateChangeHandler;
				delete oCloneBindingInfo.modelRefreshHandler;

				if (oBindingInfo.factory || oBindingInfo.template) {
					oClone.bindAggregation(sName, oCloneBindingInfo);
				} else {
					oClone.bindProperty(sName, oCloneBindingInfo);
				}
			}
		}

		//clone the support info
		if (ManagedObject._supportInfo) {
			ManagedObject._supportInfo.addSupportInfo(oClone.getId(), ManagedObject._supportInfo.byId(this.getId()));
		}

		//Clone the meta data contexts interpretation
		if (this._cloneMetadataContexts) {
			this._cloneMetadataContexts(oClone);
		}

		return oClone;
	};

	/**
	 * Update all localization dependent objects that this managed object can reach,
	 * except for its aggregated children (which will be updated by the Core).
	 *
	 * To make the update work as smooth as possible, it happens in two phases:
	 * <ol>
	 *  <li>In phase 1 all known models are updated.
	 *  <li>In phase 2 all bindings are updated.
	 * </ol>
	 * This separation is necessary as the models for the bindings might be updated
	 * in some ManagedObject or in the Core and the order in which the objects are visited
	 * is not defined (order of Core.mElements)
	 *
	 * @private
	 */
	ManagedObject._handleLocalizationChange = function(iPhase) {
		var i;

		if ( iPhase === 1 ) {

			/*
			 * phase 1: update the models
			 */
			jQuery.each(this.oModels, function(sName, oModel) {
				if ( oModel && oModel._handleLocalizationChange ) {
					oModel._handleLocalizationChange();
				}
			});

		} else if ( iPhase === 2 ) {

			/*
			 * phase 2: update bindings and types
			 */
			jQuery.each(this.mBindingInfos, function(sName, oBindingInfo) {
				var aParts = oBindingInfo.parts;
				if (aParts) {
					// property or composite binding: visit all parts
					for (i = 0; i < aParts.length; i++) {
						if ( oBindingInfo.type && oBindingInfo.type._handleLocalizationChange ) {
							oBindingInfo.type._handleLocalizationChange();
						}
					}
					if ( oBindingInfo.modelChangeHandler ) {
						oBindingInfo.modelChangeHandler();
					}
				} // else: don't update list bindings
				// Note: the template for a list binding will be visited by the core!
			});

		}
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
	 * <b>Take care: this operation might be expensive.</b>
	 *
	 * @param {boolean}
	 *          bRecursive Whether the whole aggregation tree should be searched
	 * @param {boolean}
	 *          [fnCondition] Objects for which this function returns a falsy value will not be added
	 *          to the result array
	 * @returns {sap.ui.base.ManagedObject[]} Array of aggregated objects that passed the check
	 * @public
	 */
	ManagedObject.prototype.findAggregatedObjects = function(bRecursive, fnCondition) {

		var aAggregatedObjects = [];

		if (fnCondition && typeof fnCondition !== "function") {
			fnCondition = null;
		}

		function fnFindObjects(oObject) {
			var a, i, n;

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

	ManagedObject._defaultContextualSettings = {};

	return ManagedObject;

});
