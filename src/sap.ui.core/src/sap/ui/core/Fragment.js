/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'../base/ManagedObject',
	'./Element',
	'./DeclarativeSupport',
	'./XMLTemplateProcessor',
	'sap/base/Log',
	'sap/base/util/LoaderExtensions',
	'sap/base/util/merge'
],
function(
	jQuery,
	ManagedObject,
	Element,
	DeclarativeSupport,
	XMLTemplateProcessor,
	Log,
	LoaderExtensions,
	merge
) {
	"use strict";


	var mRegistry = {}, // the Fragment registry
	mTypes = {}; // the Fragment types registry, holding their implementations

	/**
	 * @classdesc Fragments support the definition of light-weight stand-alone UI control trees.
	 * This class acts as factory which returns the UI control tree defined inside the Fragments. When used within declarative Views,
	 * the Fragment content is imported and seamlessly integrated into the View.
	 *
	 * Fragments are used similar as sap.ui.core.mvc.Views, but Fragments do not have a Controller on their own (they may know one, though),
	 * they are not a Control, they are not part of the UI tree and they have no representation in HTML.
	 * By default, in contrast to declarative Views, they do not do anything to guarantee ID uniqueness.
	 *
	 * But like Views they can be defined in several Formats (XML, declarative HTML, JavaScript; support for other types can be plugged in),
	 * the declaration syntax is the same as in declarative Views and the name and location of the Fragment files is similar to Views.
	 * Controller methods can also be referenced in the declarations, but as Fragments do not have their own controllers,
	 * this requires the Fragments to be used within a View which does have a controller.
	 * That controller is used, then.
	 *
	 * Do not call the Fragment constructor directly!
	 *
	 *
	 * Use-cases for Fragments are e.g.:
	 * - Modularization of UIs without fragmenting the controller structure
	 * - Re-use of UI parts
	 * - 100%-declarative definition of Views
	 *
	 * @class
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @alias sap.ui.core.Fragment
	 */
	var Fragment = ManagedObject.extend("sap.ui.core.Fragment", {
		metadata: {
			properties: {

				/*
				 * The Fragment type. Types "XML", "HTML" and JS" are built-in and always available.
				 */
				type: "string"
			},
			specialSettings: {

				/*
				 * Name of the fragment to load
				 */
				fragmentName : 'string',

				/*
				 * Content of the fragment
				 */
				fragmentContent : 'any',

				/*
				 * An enclosing view that contains this instance of the fragment (optional)
				 */
				containingView : { type: 'sap.ui.core.mvc.View', visibility: 'hidden' },

				/*
				 * A controller of a containing View that should be used by this fragment (optional)
				 */
				oController : { type: 'sap.ui.core.mvc.Controller', visibility: 'hidden' },

				/*
				 * The ID of this fragment (optional)
				 */
				sId : { type: 'sap.ui.core.ID', visibility: 'hidden' },

				/**
				 * The processing mode is not used by the Fragment itself.
				 * It is only relevant for XMLViews nested within the Fragment.
				 */
				processingMode: { type: "string", visibility: "hidden" }
			}
		},

		constructor: function(sId, mSettings) {
			ManagedObject.apply(this, arguments);

			// in case of only one control, return it directly
			if (this._aContent && this._aContent.length == 1) {
				return this._aContent[0];
			} else {
				return this._aContent;
			}
		}
	});


	/**
	 * Registers a new Fragment type
	 *
	 * @param {string} sType the Fragment type. Types "XML", "HTML" and JS" are built-in and always available.
	 * @param {object} oFragmentImpl an object having a property "init" of type "function" which is called on Fragment instantiation with the settings map as argument
	 * @public
	 */
	Fragment.registerType = function(sType, oFragmentImpl) {
		if (!typeof (sType) === "string") {
			Log.error("Ignoring non-string Fragment type: " + sType);
			return;
		}

		if (mTypes[sType]) {
			Log.warning("sap.ui.core.Fragment.registerType(): Fragment type '" + sType + "' is already defined. Overriding this type now!");
		}

		mTypes[sType] = oFragmentImpl;
	};

	Fragment.prototype._initCompositeSupport = function(mSettings) {
		if (!mSettings) {
			throw new Error("Settings must be set");
		}
		if (!(mSettings.fragmentName || mSettings.fragmentContent)) {
			throw new Error("Please provide a fragment name");
		}
		if (mSettings.oController) {
			this.oController = mSettings.oController;
		}

		// remember the ID which has been explicitly given in the factory function
		this._sExplicitId = mSettings.sId || mSettings.id;

		// remember the name of this Fragment
		this._sFragmentName = mSettings.fragmentName;

		var oFragmentImpl = mTypes[mSettings.type];
		if (oFragmentImpl) {
			oFragmentImpl.init.apply(this, [mSettings]);

		} else { // Fragment type not found
			throw new Error("No type for the fragment has been specified: " + mSettings.type);
		}
	};


	/**
	 * Returns the name of the fragment.
	 *
	 * @returns {string} the fragment name
	 * @private
	 */
	Fragment.prototype.getFragmentName = function() { // required for the parser to lookup customizing configuration
		return this._sFragmentName;
	};


	/**
	 *
	 * @returns {sap.ui.core.mvc.Controller} the Controller connected to this Fragment, or null
	 * @private
	 */
	Fragment.prototype.getController = function() { // required for the parsers to find the specified Controller methods
		return this.oController;
	};


	/**
	 * Returns an Element/Control by its ID in the context of the Fragment with the given ID
	 *
	 * @param {string} sFragmentId
	 * @param {string} sId
	 *
	 * @return Element by its ID and Fragment ID
	 * @public
	 * @static
	 */
	Fragment.byId = function(sFragmentId, sId) {
		if (!(typeof (sFragmentId) === "string" && typeof (sId) === "string")) {
			Log.error("sap.ui.core.Fragment.byId: two strings must be given as parameters, but are: " + sFragmentId + " and " + sId);
			return undefined;
		}
		return sap.ui.getCore().byId(sFragmentId + "--" + sId);
	};

	/**
	 * Returns the ID which a Control with the given ID in the context of the Fragment with the given ID would have
	 *
	 * @param {string} sFragmentId
	 * @param {string} sId
	 *
	 * @return the prefixed ID
	 * @public
	 * @static
	 */
	Fragment.createId = function(sFragmentId, sId) {
		if (!(typeof (sFragmentId) === "string" && typeof (sId) === "string")) {
			Log.error("sap.ui.core.Fragment.createId: two strings must be given as parameters, but are: " + sFragmentId + " and " + sId);
			return undefined;
		}
		return sFragmentId + "--" + sId;
	};


	/**
	 * Creates an id for an Element prefixed with the Fragment id.
	 * This method only adds a prefix when an ID was explicitly given when instantiating this Fragment.
	 * If the ID was generated, it returns the unmodified given ID.
	 *
	 * @param {string} sId
	 * @return {string} prefixed id
	 */
	Fragment.prototype.createId = function(sId) {
		var id = this._sExplicitId ? this._sExplicitId + "--" + sId : sId; // no ID Prefixing by Fragments! This is called by the template parsers, but only if there is not a View which defines the prefix.

		if (this._oContainingView && this._oContainingView != this) {
			// if Fragment ID is added to the control ID and Fragment ID already contains the View prefix, the View prefix does not need to be added again
			// (this will now be checked inside the createId function already!)
			id = this._oContainingView.createId(id);
		}

		return id;
	};


	/**
	 * Always return true in case of fragment
	 *
	 * @returns {boolean}
	 * @private
	 */
	Fragment.prototype.isSubView = function(){
		return true;
	};



	// ###   Factory functions   ###

	/**
	 * Instantiate a Fragment - this method loads the Fragment content, instantiates it, and returns this content.
	 * The Fragment object itself is not an entity which has further significance beyond this constructor.
	 *
	 * To instantiate an existing Fragment, call this method as:
	 *    sap.ui.fragment(sName, sType, [oController]);
	 * The sName must correspond to a Fragment module which can be loaded
	 * via the module system (fragmentName + suffix ".fragment.[typeextension]") and which defines the Fragment content.
	 * If oController is given, the (event handler) methods referenced in the Fragment will be called on this controller.
	 * Note that Fragments may require a Controller to be given and certain methods to be available.
	 *
	 * The Fragment types "XML", "JS" and "HTML" are available by default; additional Fragment types can be implemented
	 * and added using the sap.ui.core.Fragment.registerType() function.
	 *
	 *
	 * Advanced usage:
	 * To instantiate a Fragment and give further configuration options, call this method as:
	 *     sap.ui.fragment(oFragmentConfig, [oController]);
	 * The oFragmentConfig object can have the following properties:
	 * - "fragmentName": the name of the Fragment, as above
	 * - "fragmentContent": the definition of the Fragment content itself. When this property is given, any given name is ignored.
	 *         The type of this property depends on the Fragment type, e.g. it could be a string for XML Fragments.
	 * - "type": the type of the Fragment, as above (mandatory)
	 * - "id": the ID of the Fragment (optional)
	 * Further properties may be supported by future or custom Fragment types. Any given properties
	 * will be forwarded to the Fragment implementation.
	 *
	 * If you want to give a fixed ID for the Fragment, please use the advanced version of this method call with the
	 * configuration object or use the typed factories like sap.ui.xmlfragment(...) or sap.ui.jsfragment(...).
	 * Otherwise the Fragment ID is generated. In any case, the Fragment ID will be used as prefix for the ID of
	 * all contained controls.
	 *
	 * @param {string} sName the Fragment name
	 * @param {string} sType the Fragment type, e.g. "XML", "JS", or "HTML"
	 * @param {sap.ui.core.mvc.Controller|Object} [oController] the Controller or Object which should be used by the controls in the Fragment.
	 *     Note that some Fragments may not need a Controller and other may need one - and even rely on certain methods implemented in the Controller.
	 * @public
	 * @static
	 * @deprecated since 1.58, use {@link sap.ui.core.Fragment.load} instead
	 * @return {sap.ui.core.Control|sap.ui.core.Control[]} the root Control(s) of the Fragment content
	 */
	sap.ui.fragment = function (sName, sType, oController) {

		var sFragmentType;
		if (typeof (sType) === "string") {
			sFragmentType = sType.toLowerCase();
		} else if (typeof (sType) === "object" && typeof (sType.fragmentName) === "string") {
			sFragmentType = sType.fragmentName.toLowerCase();
		} else {
			sFragmentType = "";
		}
		Log.info("Do not use deprecated factory function 'sap.ui." + sFragmentType + "fragment'. Require 'sap/ui/core/Fragment' and use 'load()' instead", "sap.ui." + sFragmentType + "fragment", null, function () {
			return {
				type: "sap.ui." + sFragmentType + "fragment",
				name: sFragmentType ? sName + ".fragment." + sFragmentType : sName
			};
		});

		return fragmentFactory(sName, sType, oController);
	};

	/**
	 * @see sap.ui.core.Fragment.load
	 */
	function fragmentFactory(vName, vType, oController) {
		var mSettings = {};
		if (typeof (vName) === "string") { // normal call
			mSettings.fragmentName = vName;
			mSettings.oController = oController;
			mSettings.type = vType;

		} else if (typeof (vName) === "object") { // advanced call with config object
			mSettings = vName; // pass all config parameters to the implementation
			if (vType) { // second parameter "vType" is in this case the optional Controller
				mSettings.oController = vType;
			}
		} else {
			Log.error("sap.ui.fragment() must be called with Fragment name or config object as first parameter, but is: " + vName);
		}

		return new Fragment(mSettings);
	}

	/**
	 * Loads and instantiates a Fragment.
	 * A Promise is returned, which resolves with the Fragments content.
	 *
	 * The Fragment object itself is not an entity with significance beyond this factory.
	 *
	 * The Fragment types "XML", "JS" and "HTML" are available by default; additional Fragment types can be added using
	 * the sap.ui.core.Fragment.registerType() function.
	 *
	 * Further properties may be supported by future or custom Fragment types. Any given properties
	 * will be forwarded to the Fragment implementation.
	 *
	 * If no fixed ID is given, the Fragment ID is generated. In any case, the Fragment ID will be used as prefix for the IDs of
	 * all contained controls.
	 *
	 * @example <caption>Loading an XML fragment (default type)</caption>
	 * sap.ui.require(["sap/ui/core/Fragment"], function(Fragment){
	 *  Fragment.load({
	 *      name: "my.useful.VerySimpleUiPart"
	 *  }).then(function(myButton){
	 *     // ...
	 *  });
	 * });
	 *
	 * @example <caption>Creating an XML fragments</caption>
	 * sap.ui.require(["sap/ui/core/Fragment"], function(Fragment){
	 *     Fragment.load({
	 *         type: "XML",
	 *         definition: '&lt;Button xmlns=&quot;sap.m&quot; id=&quot;xmlfragbtn&quot; text=&quot;This is an XML Fragment&quot; press=&quot;doSomething&quot;&gt;&lt;/Button&gt;'
	 *     }).then(function(oButton){
	 *         // ...
	 *     });
	 * });
	 *
	 * @example <caption>Creating an HTML fragments</caption>
	 * sap.ui.require(["sap/ui/core/Fragment"], function(Fragment){
	 *     Fragment.load({
	 *         type: "HTML",
	 *         definition: '&lt;div id=&quot;htmlfragbtn&quot; data-sap-ui-type=&quot;sap.m.Button&quot; data-text=&quot;This is an HTML Fragment&quot;&gt;&lt;/div&gt;'
	 *     }).then(function(oButton){
	 *         // ...
	 *     });
	 * });
	 *
	 * @param {object} mOptions options map
	 * @param {string} [mOptions.name] must be supplied if no "definition" parameter is given. The Fragment name must correspond to an XML Fragment which
	 *    can be loaded via the module system
	 *    (fragmentName + suffix ".fragment.[typeextension]") and which contains the Fragment definition.
	 *    If "mOptions.controller" is supplied, the (event handler-) methods referenced in the Fragment will be called on this Controller.
	 *    Note that Fragments may require a Controller to be given and certain methods to be implemented by it.
	 * @param {string} [mOptions.type=XML] the Fragment type, e.g. "XML", "JS", or "HTML" (see above). Default is "XML"
	 * @param {string} [mOptions.definition] definition of the Fragment content. When this property is supplied, the "name" parameter must not be used.
	 * Please see the above example on how to use the 'definition' parameter.
	 * @param {string} [mOptions.id] the ID of the Fragment
	 * @param {sap.ui.core.mvc.Controller|Object} [mOptions.controller] the Controller or Object which should be used by the controls in the Fragment.
	 *    Note that some Fragments may not need a Controller while others may need one and certain methods to be implemented by it.
	 * @public
	 * @static
	 * @since 1.58
	 * @returns {Promise} resolves with the resulting {sap.ui.core.Control|sap.ui.core.Control[]} after fragment parsing and instantiation
	 */
	Fragment.load = function(mOptions) {
		var mParameters = Object.assign({}, mOptions);

		mParameters.type = mParameters.type || "XML";

		// map new parameter names to classic API, delete new names to avoid assertion failures
		mParameters.fragmentName = mParameters.name;
		mParameters.fragmentContent = mParameters.definition;
		mParameters.oController = mParameters.controller;
		delete mParameters.name;
		delete mParameters.definition;
		delete mParameters.controller;

		return Promise.resolve(fragmentFactory(mParameters));
	};

	/**
	 * Instantiates an XML-based Fragment.
	 *
	 * To instantiate a fragment, call:
	 * <pre>
	 *    sap.ui.xmlfragment([sId], sFragmentName, [oController]);
	 * </pre>
	 * The fragment instance ID is optional and will be used as prefix for the ID of all contained controls.
	 * If no ID is passed, controls will not be prefixed. The <code>sFragmentName</code> must correspond to an
	 * XML fragment which can be loaded via the module system (fragmentName + ".fragment.xml") and which defines
	 * the fragment. If <code>oController</code> is given, the methods referenced in the fragment will be called
	 * on this controller.
	 *
	 * Note that fragments may require a controller to be given and certain methods to be available.
	 *
	 *
	 * <h3>Advanced usage:</h3>
	 * To instantiate a fragment and optionally directly give the XML definition instead of loading it from a file,
	 * call:
	 * <pre>
	 *     sap.ui.xmlfragment(oFragmentConfig, [oController]);
	 * </pre>
	 * The <code>oFragmentConfig</code> object can either have a <code>fragmentName</code> or a <code>fragmentContent</code>
	 * property, but not both. <code>fragmentContent</code> can hold the fragment definition as XML string; if not given,
	 * <code>fragmentName</code> must be given and the fragment content definition is loaded via the module system.
	 * Again, if <code>oController</code> is given, the methods referenced in the fragment will be called on this controller.
	 *
	 * @param {string} [sId]
	 *            ID of the newly created fragment
	 * @param {string | object} vFragment
	 *            Resource name of the fragment; a module name in dot notation without the '.fragment.xml' suffix.
	 *            Alternatively, a configuration object can be given with the properties described below. In this case,
	 *            no <code>sId</code> may be given as first parameter, but as property <code>id</code> in the configuration
	 *            object.
	 * @param {string} [vFragment.id]
	 *            ID of the newly created fragment; will be used as a prefix to all contained control IDs
	 * @param {string} [vFragment.fragmentName]
	 *            Resource name of the fragment; a module name in dot notation without the '.fragment.html' suffix
	 * @param {string} [vFragment.fragmentContent]
	 *            Definition of the fragment as an XML string
	 * @param {sap.ui.core.mvc.Controller|object} [oController]
	 *            A controller to be used for event handlers in the fragment; can either be the controller of an
	 *            enclosing view, a new controller instance, or a simple object with the necessary methods attached.
	 *            Note that a fragment has no runtime representation besides its contained controls. There's
	 *            therefore no API to retrieve the controller after creating a fragment
	 * @public
	 * @static
	 * @deprecated since 1.58, use {@link sap.ui.core.Fragment.load} instead
	 * @return {sap.ui.core.Control|sap.ui.core.Control[]} the root Control(s) of the created fragment instance
	 */
	sap.ui.xmlfragment = function(sId, vFragment, oController) {

		if (typeof (sId) === "string") { // basic call
			if (typeof (vFragment) === "string") { // with ID
				return sap.ui.fragment({fragmentName: vFragment, sId: sId, type: "XML"}, oController);

			} else { // no ID, sId is actually the name and vFragment the optional Controller
				return sap.ui.fragment(sId, "XML", vFragment);
			}
		} else { // advanced call
			sId.type = "XML";
			return sap.ui.fragment(sId, vFragment); // second parameter "vFragment" is the optional Controller
		}
	};


	/**
	 * Defines OR instantiates an HTML-based fragment.
	 *
	 * To define a JS fragment, call:
	 * <pre>
	 *    sap.ui.jsfragment(sName, oFragmentDefinition)
	 * </pre>
	 * where:
	 * <ul>
	 * <li><code>sName</code> is the name by which this fragment later can be found and instantiated. If defined in
	 *   its own file, in order to be found by the module loading system, the file location and name must correspond
	 *   to <code>sName</code> (path + file name must be: fragmentName + ".fragment.js"). </li>
	 * <li><code>oFragmentDefinition</code> is an object at least holding the <code>createContent(oController)</code>
	 *   method which defines the fragment content. If given during instantiation, the <code>createContent</code>
	 *   method receives a controller instance (otherwise, parameter <code>oController</code> will be undefined)
	 *   and the return value must be one <code>sap.ui.core.Control</code> (which could have any number of children).</li>
	 * </ul>
	 *
	 * To instantiate a JS fragment, call:
	 * <pre>
	 *    sap.ui.jsfragment([sId], sFragmentName, [oController]);
	 * </pre>
	 * The fragment ID is optional (generated if not given) and the fragment implementation <i>can</i> use it
	 * to make contained controls unique (this depends on the implementation: some JS fragments may choose
	 * not to support multiple instances within one application and not use the ID prefixing).
	 * The <code>sFragmentName</code> must correspond to a JS fragment which can be loaded via the module system
	 * (<code>sFragmentName</code> converted to a path + ".fragment.js" suffix) and which defines the fragment.
	 * Or it can be a name that has been used earlier to define a fragment of that name.
	 * If <code>oController</code> is given, the methods referenced in the fragment will be called on this controller.
	 * Note that fragments may require a controller to be given and certain methods to be available.
	 *
	 *
	 * @param {string|object} vName
	 *            Name of the fragment when defining a fragment; ID or name or configuration object when instantiating
	 *            a fragment
	 * @param {string} [vName.id]
	 *            ID of the newly created fragment; will be used as a prefix to all contained control IDs
	 * @param {string} [vName.fragmentName]
	 *            Name of the fragment. When no fragment has been defined with that name, the name will be converted
	 *            to a path by replacing dots with slashes and appending '.fragment.js'. The corresponding resource will
	 *            be loaded and is expected to define a fragment with the <code>fragmentName</code>
	 * @param {object|string} [vFragmentDefinition]
	 *            When defining a fragment, this parameter must be a factory object that will be used to create new
	 *            instances of the fragment; it must at least contain a <code>createContent</code> method.
	 *            When creating an instance of a fragment and when <code>vName</code> was an ID, this parameter
	 *            must be the name of the fragment. When the first parameter was a name, this parameter must be omitted.
	 * @param {sap.ui.core.mvc.Controller|object} [oController]
	 *            A controller to be used for event handlers in the fragment; can either be the controller of an
	 *            enclosing view, a new controller instance, or a simple object with the necessary methods attached.
	 *            Note that a fragment has no runtime representation besides its contained controls. There's therefore
	 *            no API to retrieve the controller after creating a fragment
	 * @public
	 * @static
	 * @deprecated since 1.58, use {@link sap.ui.core.Fragment.load} instead
	 * @return {sap.ui.core.Control|sap.ui.core.Control[]} The root control(s) of the created fragment instance
	 */
	sap.ui.jsfragment = function(vName, vFragmentDefinition, oController) { // definition of a JS Fragment

		if (typeof vName === "string" && typeof vFragmentDefinition === "object") {
			if (vFragmentDefinition.createContent) {
				// Fragment DEFINITION
				mRegistry[vName] = vFragmentDefinition;

				sap.ui.loader._.declareModule(vName.replace(/\./g, "/") + ".fragment.js");
				// TODO: return value?

			} else {
				// plain instantiation: name[+oController]
				return sap.ui.fragment(vName, "JS", vFragmentDefinition);
			}

		} else if (typeof vName === "string" && vFragmentDefinition === undefined) {
			// plain instantiation: name only
			return sap.ui.fragment(vName, "JS");

		} else { // ID+name[+Controller]  or  oConfig+[oController]
			if (typeof vName === "object") {
				// advanced mode: oConfig+[oController]
				vName.type = "JS";
				return sap.ui.fragment(vName, vFragmentDefinition);

			} else if (arguments.length >= 3) {
				// must be plain instantiation mode: ID+Name[+Controller]
				return sap.ui.fragment({id: vName, fragmentName: vFragmentDefinition, type: "JS"}, oController);
			} else {
				Log.error("sap.ui.jsfragment() was called with wrong parameter set: " + vName + " + " + vFragmentDefinition);
			}
		}
	};


	/**
	 * Instantiates an HTML-based Fragment.
	 *
	 * To instantiate a fragment, call:
	 * <pre>
	 *    sap.ui.htmlfragment([sId], sFragmentName, [oController]);
	 * </pre>
	 * The fragment instance ID is optional and will be used as prefix for the ID of all
	 * contained controls. If no ID is passed, controls will not be prefixed.
	 * The <code>sFragmentName</code> must correspond to an HTML fragment which can be loaded
	 * via the module system (fragmentName + ".fragment.html") and which defines the fragment.
	 * If <code>oController</code> is given, the methods referenced in the fragment will be called on this controller.
	 * Note that fragments may require a controller to be given and certain methods to be available.
	 *
	 * <h3>Advanced usage:</h3>
	 * To instantiate a fragment and optionally directly give the HTML definition instead of loading it from a file,
	 * call:
	 * <pre>
	 *     sap.ui.htmlfragment(oFragmentConfig, [oController]);
	 * </pre>
	 * The <code>oFragmentConfig</code> object can either have a <code>fragmentName</code> or a <code>fragmentContent</code>
	 * property, but not both of them. <code>fragmentContent</code> can hold the fragment definition as XML string; if not
	 * given, <code>fragmentName</code> must be given and the fragment content definition is loaded by the module system.
	 * Again, if <code>oController</code> is given, any methods referenced in the fragment will be called on this controller.
	 *
	 * @param {string} [sId]
	 *            ID of the newly created fragment
	 * @param {string | object} vFragment
	 *            Resource name of the fragment, a module name in dot notation without the '.fragment.html' suffix.
	 *            Alternatively, a configuration object can be given with the properties described below. In this case,
	 *            no <code>sId</code> may be given as first parameter, but as property <code>id</code> in the configuration
	 *            object.
	 * @param {string} [vFragment.id]
	 *            ID of the newly created fragment; will be used as a prefix to all contained control IDs
	 * @param {string} [vFragment.fragmentName]
	 *            Resource name of the Fragment; a module name in dot notation without the '.fragment.html' suffix
	 * @param {string} [vFragment.fragmentContent]
	 *            Definition of the fragment as an HTML string
	 * @param {sap.ui.core.mvc.Controller|object} [oController]
	 *            A controller to be used for event handlers in the fragment; can either be the controller of an
	 *            enclosing view, a new controller instance, or a simple object with the necessary methods attached.
	 *            Note that a fragment has no runtime representation besides its contained controls. There's therefore
	 *            no API to retrieve the controller after creating a fragment
	 * @public
	 * @static
	 * @deprecated since 1.58, use {@link sap.ui.core.Fragment.load} instead
	 * @return {sap.ui.core.Control|sap.ui.core.Control[]} Root control or controls of the created fragment instance
	 */
	sap.ui.htmlfragment = function(sId, vFragment, oController) {

		if (typeof (sId) === "string") { // basic call
			if (typeof (vFragment) === "string") { // with ID
				return sap.ui.fragment({fragmentName: vFragment, sId: sId, type: "HTML"}, oController);

			} else { // no ID, sId is actually the name and vFragment the optional Controller
				return sap.ui.fragment(sId, "HTML", vFragment);
			}
		} else { // advanced call
			sId.type = "HTML";
			return sap.ui.fragment(sId, vFragment); // second parameter "vFragment" is the optional Controller
		}
	};




	// ###   FRAGMENT TYPES   ###


	// ###   XML Fragments   ###

	Fragment.registerType("XML" , {
		init: function(mSettings) {
			// use specified content or load the content definition
			if (mSettings.fragmentContent) {
				if (typeof (mSettings.fragmentContent) === "string") {
					this._xContent = jQuery.parseXML(mSettings.fragmentContent).documentElement;
				} else {
					this._xContent = mSettings.fragmentContent;
				}
			} else {
				/*
				// TO-BE-ACTIVATED:
				// Logging currently disabled because of missing async path
				Log.warning("Synchronous loading of fragment, due to Fragment.init() call for '" + mSettings.fragmentName + "'. Use 'sap/ui/core/Fragment' module with Fragment.load() instead.", "SyncXHR", null, function() {
					return {
						type: "SyncXHR",
						name: "Fragment"
					};
				});
				*/
				this._xContent = XMLTemplateProcessor.loadTemplate(mSettings.fragmentName, "fragment");
			}

			this._oContainingView = this._sExplicitId ? this : (mSettings.containingView || this);
			if ((this._oContainingView === this) ) {
				this._oContainingView.oController = (mSettings.containingView && mSettings.containingView.oController) || mSettings.oController;
			}

			var that = this;

			// If given, processingMode will be passed down to nested subviews in XMLTemplateProcessor
			that._sProcessingMode = mSettings.processingMode;

			// unset any preprocessors (e.g. from an enclosing JSON view)
			ManagedObject.runWithPreprocessors(function() {
				// parse the XML tree

				//var xmlNode = that._xContent;
				// if sub ID is given, find the node and parse it
				// TODO: for sub-fragments   if () {
				//	xmlNode = jQuery(that._xContent).find("# ")
				//}
				that._aContent = XMLTemplateProcessor.parseTemplate(that._xContent, that);

				/*
				 * If content was parsed and an objectBinding at the fragment was defined
				 * the objectBinding must be forwarded to the created controls
				 */
				if (that._aContent && that._aContent.length && mSettings.objectBindings) {
					that._aContent.forEach(function(oContent, iIndex) {
						if (oContent instanceof Element) {
							for (var sModelName in mSettings.objectBindings) {
								oContent.bindObject(mSettings.objectBindings[sModelName]);
							}
						}
					});
				}
			}, {
				settings: that._oContainingView._fnSettingsPreprocessor
			});
		}
	});



	// ###   JS Fragments   ###

	Fragment.registerType("JS", {
		init: function(mSettings) {
			/*** require fragment definition if not yet done... ***/
			if (!mRegistry[mSettings.fragmentName]) {
				sap.ui.requireSync(mSettings.fragmentName.replace(/\./g, "/") + ".fragment");
			}
			/*** Step 2: merge() ***/
			merge(this, mRegistry[mSettings.fragmentName]);

			this._oContainingView = mSettings.containingView || this;

			var that = this;
			// unset any preprocessors (e.g. from an enclosing JSON view)
			ManagedObject.runWithPreprocessors(function() {

				var content = that.createContent(mSettings.oController || that._oContainingView.oController);
				that._aContent = [];
				that._aContent = that._aContent.concat(content);

			}, {
				settings: that._oContainingView._fnSettingsPreprocessor
			});
		}
	});



	// ###   HTML Fragments   ###

	(function() {

		/**
		 * The template cache. Templates are only loaded once.
		 *
		 * @private
		 * @static
		 */
		var _mHTMLTemplates = {};

		/**
		 * Loads and returns a template for the given template name. Templates are only loaded once.
		 *
		 * @param {string} sTemplateName The name of the template
		 * @return {string} the template data
		 * @private
		 */
		var _getHTMLTemplate = function(sTemplateName) {
			var sUrl = sap.ui.require.toUrl(sTemplateName.replace(/\./g, "/")) + ".fragment.html";
			var sHTML = _mHTMLTemplates[sUrl];
			var sResourceName;

			if (!sHTML) {
				sResourceName = sTemplateName.replace(/\./g, "/") + ".fragment.html";
				sHTML = LoaderExtensions.loadResource(sResourceName);
				// TODO discuss
				// a) why caching at all (more precise: why for HTML fragment although we refused to do it for other view/fragment types - risk of a memory leak!)
				// b) why cached via URL instead of via name? Any special scenario in mind?
				_mHTMLTemplates[sUrl] = sHTML;
			}
			return sHTML;
		};

		Fragment.registerType("HTML", {
			init: function(mSettings) {
				// DeclarativeSupport automatically uses set/getContent, but Fragment should not have such an aggregation and should not be parent of any control
				// FIXME: the other aggregation methods are not implemented. They are currently not used, but who knows...
				this._aContent = [];
				this.getContent = function() {
					return this._aContent;
				};
				this.addContent = function(oControl) {
					this._aContent.push(oControl);
				};

				this._oContainingView = mSettings.containingView || this;

				// processing mode is propagated to subviews/fragments
				this._sProcessingMode = mSettings.processingMode;

				var vHTML = mSettings.fragmentContent || _getHTMLTemplate(mSettings.fragmentName);
				this._oTemplate = document.createElement("div");

				if (typeof vHTML === "string") {
					this._oTemplate.innerHTML = vHTML;
				} else {
					var oNodeList = vHTML;
					var oFragment = document.createDocumentFragment();
					for (var i = 0; i < oNodeList.length;i++) {
						oFragment.appendChild(oNodeList.item(i));
					}
					this._oTemplate.appendChild(oFragment);
				}

				var oMetaElement = this._oTemplate.getElementsByTagName("template")[0];
				var oProperties = this.getMetadata().getAllProperties();

				if (oMetaElement) {
					var that = this;
					jQuery.each(oMetaElement.attributes, function(iIndex, oAttr) {
						var sName = DeclarativeSupport.convertAttributeToSettingName(oAttr.name, that.getId());
						var sValue = oAttr.value;
						var oProperty = oProperties[sName];
						if (!mSettings[sName]) {
							if (oProperty) {
								mSettings[sName] = DeclarativeSupport.convertValueToType(DeclarativeSupport.getPropertyDataType(oProperty),sValue);
							} else if (sap.ui.core.mvc.HTMLView._mAllowedSettings[sName]) {
								mSettings[sName] = sValue;
							}
						}
					});
					this._oTemplate = oMetaElement;
				}
				// This is a fix for browsers that support web components
				if (this._oTemplate.content) {
					var oFragment = this._oTemplate.content;
					// Create a new template, as innerHTML would be empty for TemplateElements when the fragment is appended directly
					this._oTemplate = document.createElement("div");
					// Make the shadow DOM available in the DOM
					this._oTemplate.appendChild(oFragment);
				}

				// unset any preprocessors (e.g. from an enclosing HTML view)
				var that = this;
				ManagedObject.runWithPreprocessors(function() {
					DeclarativeSupport.compile(that._oTemplate, that);

					// FIXME declarative support automatically inject the content into that through "that.addContent()"
					var content = that.getContent();
					if (content && content.length === 1) {
						that._aContent = [content[0]];
					}// else {
						// TODO: error
					//}
				}, {
					settings: that._oContainingView._fnSettingsPreprocessor
				});
			}
		});
	}()); // end of HTML Fragment stuff

	return Fragment;

});