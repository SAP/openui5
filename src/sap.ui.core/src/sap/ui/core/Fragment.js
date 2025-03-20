/*!
 * ${copyright}
 */

sap.ui.define([
	'../base/ManagedObject',
	'./Element',
	'./DeclarativeSupport',
	'./XMLTemplateProcessor',
	'sap/base/future',
	'sap/base/Log',
	'sap/base/util/LoaderExtensions',
	'sap/base/util/merge',
	'sap/ui/util/XMLHelper',
	'sap/ui/core/Component',
	'sap/ui/core/mvc/XMLProcessingMode'
],
function(
	ManagedObject,
	Element,
	DeclarativeSupport,
	XMLTemplateProcessor,
	future,
	Log,
	LoaderExtensions,
	merge,
	XMLHelper,
	Component,
	XMLProcessingMode
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
	 * But like Views they can be defined in several Formats (XML and JavaScript; support for other types can be plugged in),
	 * the declaration syntax is the same as in declarative Views and the name and location of the Fragment files is similar to Views.
	 * Controller methods can also be referenced in the declarations, but as Fragments do not have their own controllers,
	 * this requires the Fragments to be used within a View which does have a controller.
	 * That controller is used, then.
	 *
	 * A JS Fragment can be defined in a dedicated module named "*.fragment.js". This module must return an object with a <code>createContent</code> method which has to return a control.
	 * JS Fragments are also capable of asynchronously creating content. To do so, the <code>createContent</code> function must return a Promise
	 * resolving with the content controls.
	 *
	 * <b>Example:</b> Defining a JS Fragment
	 * <pre>
	 * // e.g. module "my/sample/Button.fragment.js"
	 * sap.ui.define(["sap/m/Button"], function(Button) {
	 *  return {
	 *    createContent: (oController) => {
	 *      const oButton  = new Button({
	 *        text: "Hello World" ,
	 *        press: oController.doSomething
	 *      });
	 *      return oButton;
	 *    }
	 *  };
	 * });
	 * </pre>
	 *
	 * <b>Example:</b> Defining a JS Fragment with a async 'createContent' method
	 * <pre>
	 * // e.g. module "my/sample/AsyncButton.fragment.js"
	 * sap.ui.define(["sap/m/Button", "sap/base/i18n/ResourceBundle"], function(Button, ResourceBundle) {
	 *  return {
	 *    createContent: async (oController) => {
     *      // loading a resource bundle async to retrieve button text
	 *      const myBundle  = await ResourceBundle.create({ bundleName: "...", async: true });
	 *      return new Button({ text: myBundle.getText("...") });
	 *    }
	 *  };
	 * });
	 * </pre>
	 *
	 * Fragments can be instantiated with {@link sap.ui.core.Fragment.load Fragment.load} or the
	 * {@link sap.ui.core.mvc.Controller.loadFragment loadFragment} function from a controller.
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
				type: 'string'
			},
			specialSettings: {

				/**
				 * Whether to load and parse the fragment asynchronous
				 * @private
				 */
				async: { type: 'boolean', visibility: 'hidden' },
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
				 * The ID of the owner component (optional)
				 */
				sOwnerId : { type: 'sap.ui.core.ID', visibility: 'hidden' },

				/**
				 * @deprecated because only the "Sequential" processing mode will be supported
				 * in the next major release
				 *
				 * The processing mode is not used by the Fragment itself.
				 * It is only relevant for XMLViews nested within the Fragment.
				 */
				processingMode: { type: 'sap.ui.core.mvc.XMLProcessingMode', visibility: 'hidden' }
			}
		},

		constructor: function(sId, mSettings) {
			ManagedObject.apply(this, arguments);

			// When async, the fragment content is already passed to the constructor
			if (!this._bAsync) {
				if (this._aContent && this._aContent.length == 1) {
					// in case of only one control, return it directly
					return this._aContent[0];
				} else {
					return this._aContent;
				}
			}
		}
	});


	/**
	 * Registers a new Fragment type
	 *
	 * @param {string} sType the Fragment type. Types "XML", "HTML" and JS" are built-in and always available.
	 * @param {object} oFragmentImpl an object having the properties "init" and "load".
	 * @param {function} oFragmentImpl.init Called on Fragment instantiation with the settings map as argument. Function needs to return a promise which resolves with sap.ui.core.Control|sap.ui.core.Control[]
	 * @param {function} oFragmentImpl.load Called to load the fragment content. Must return a Promise which resolves with the loaded resource. This resource is passed as 'fragmentContent' to the init() function via a parameter object.
	 * @public
	 */
	Fragment.registerType = function(sType, oFragmentImpl) {
		if (typeof (sType) !== "string") {
			future.errorThrows("Invalid non-string Fragment type: '" + sType + "'.", { suffix: "It will be ignored." });
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

		this._bAsync = mSettings.async || false;

		// remember the ID which has been explicitly given in the factory function
		this._sExplicitId = mSettings.sId || mSettings.id;

		// remember the name of this Fragment
		this._sFragmentName = mSettings.fragmentName;

		// if the containing view (or fragment) has a scoped runWithOnwer function we need to propagate this to the nested Fragment (only for async case)
		this.fnScopedRunWithOwner = mSettings.containingView && mSettings.containingView.fnScopedRunWithOwner;

		if (!this.fnScopedRunWithOwner && this._sOwnerId) {
			var oOwnerComponent = Component.getComponentById(this._sOwnerId);
			this.fnScopedRunWithOwner = function(fnCallbackToBeScoped) {
				return oOwnerComponent.runAsOwner(fnCallbackToBeScoped);
			};
		}

		var oFragmentImpl = Fragment.getType(mSettings.type);
		if (oFragmentImpl) {
			this._pContentPromise = oFragmentImpl.init.apply(this, [mSettings]);
			if (!this._pContentPromise) { // TODO Remove this if after sap.fe changed there custom fragment implementation
				this._pContentPromise = Promise.resolve(this._aContent);
			}
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
	 * @returns {sap.ui.core.mvc.Controller|null} the Controller connected to this Fragment, or <code>null</code>
	 * @private
	 */
	Fragment.prototype.getController = function() { // required for the parsers to find the specified Controller methods
		return this.oController;
	};


	/**
	 * Returns an Element/Control by its ID in the context of the Fragment with the given ID
	 *
	 * @param {string} sFragmentId ID of the Fragment from which to retrieve the Control
	 * @param {string} sId ID of the Element/Control to retrieve
	 *
	 * @returns {sap.ui.core.Element|undefined} Element by its ID and Fragment ID
	 * @public
	 * @static
	 */
	Fragment.byId = function(sFragmentId, sId) {
		if (!(typeof (sFragmentId) === "string" && typeof (sId) === "string")) {
			future.errorThrows("sap.ui.core.Fragment.byId: two strings must be given as parameters, but are: " + sFragmentId + " and " + sId);
			return undefined;
		}
		return Element.getElementById(sFragmentId + "--" + sId);
	};

	/**
	 * Returns the ID which a Control with the given ID in the context of the Fragment with the given ID would have.
	 *
	 * @param {string} sFragmentId ID of the Fragment for which to calculate the Control ID
	 * @param {string} sId Fragment-local ID of the Control to calculate the ID for
	 *
	 * @returns {string} the prefixed ID
	 * @public
	 * @static
	 */
	Fragment.createId = function(sFragmentId, sId) {
		if (!(typeof (sFragmentId) === "string" && typeof (sId) === "string")) {
			future.errorThrows("sap.ui.core.Fragment.createId: two strings must be given as parameters, but are: " + sFragmentId + " and " + sId);
			return undefined;
		}
		return sFragmentId + "--" + sId;
	};


	/**
	 * Creates an id for an Element prefixed with the Fragment id.
	 * This method only adds a prefix when an ID was explicitly given when instantiating this Fragment.
	 * If the ID was generated, it returns the unmodified given ID.
	 *
	 * @param {string} sId The given id
	 * @return {string} prefixed id The prefixed id or the given id
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
	 * @returns {boolean} <code>true</code>
	 * @private
	 */
	Fragment.prototype.isSubView = function(){
		return true;
	};



	// ###   Factory functions   ###

	/**
	 * Loads and instantiates a fragment.
	 * The fragment object itself is not an entity that has any further significance beyond this factory function.
	 *
	 * To instantiate a fragment that is already defined separately, call:
	 * <pre>
	 * sap.ui.fragment(sName, sType, oController?);
	 * </pre>
	 *
	 * Advanced usage to give further configuration options:
	 * <pre>
	 * sap.ui.fragment(oFragmentConfig, oController?);
	 * </pre>
	 * In addition to <code>id</code> and <code>type</code>, the <code>oFragmentConfig</code> object
	 * can have either a <code>fragmentName</code> or a <code>fragmentContent</code> property, but not both.
	 *
	 * To define a fragment ID, which can be used as a prefix for the created control IDs,
	 * you must use either the above advanced version with an <code>id</code> or one of the typed factory functions
	 * like {@link sap.ui.xmlfragment} or {@link sap.ui.jsfragment}.
	 *
	 * A fragment type must be given in all cases. The fragment types <code>"XML"</code>, <code>"JS"</code>, and <code>"HTML"</code> (type <code>"HTML"</code> is deprecated)
	 * are available by default. Additional fragment types can be implemented and added using the {@link sap.ui.core.Fragment.registerType} function.
	 *
	 * Custom fragment types can support further properties. Any given properties will be forwarded to the fragment implementation.
	 *
	 * The optional <code>oController</code> can be either the controller of an enclosing view,
	 * a new controller instance, or a simple object with the necessary methods attached.
	 * Note that a fragment has no runtime representation besides its contained controls. Therefore, there is no API to retrieve the controller from the return value.
	 * Note also that fragments may require a controller to be given and certain methods to be available.
	 *
	 * <b>Note:</b>
	 * In case you are embedding a Fragment into an existing View, please also have a look at the
	 * {@link sap.ui.core.mvc.Controller.loadFragment loadFragment} factory for a closer coupling to the corresponding Controller instance.
	 *
	 * @param {string|object} vName
	 *         resource name of the fragment module in dot notation without the <code>.fragment.<i>&lt;typeExtension></i></code> suffix from the file name.
	 *         Alternatively, a configuration object as specified below
	 * @param {string} [vName.id]
	 *         optional ID of the created fragment
	 * @param {string|object} [vName.fragmentContent]
	 *         definition of the fragment content that will be used instead of loading the content from a separate file.
	 *         The type of this property depends on the fragment type. For example, it could be a string for XML fragments or an object for JS fragments
	 * @param {string} [vName.fragmentName]
	 *         recource name of the fragment module as specified above
	 * @param {string} vName.type
	 *         type of the fragment, for example, <code>"XML"</code>, <code>"JS"</code>, <code>"HTML"</code>, or any other type that has been implemented additionally
	 * @param {string|sap.ui.core.mvc.Controller|object} vType
	 *         type of the fragment as specified by <code>vName.type</code> or, in the advanced usage case, an optional <code>oController</code>
	 * @param {sap.ui.core.mvc.Controller|object} [oController]
	 *         controller object to be used for methods or event handlers referenced in the fragment
	 * @public
	 * @static
	 * @deprecated As of version 1.58. Refer to {@link topic:04129b2798c447368f4c8922c3c33cd7 Instantiation of Fragments}.
	 * @returns {sap.ui.core.Control|sap.ui.core.Control[]} the instantiated root control(s) from the fragment content
	 * @ui5-global-only
	 */
	sap.ui.fragment = function (vName, vType, oController) {

		var sFragmentType;
		if (typeof vType === "string") {
			sFragmentType = vType.toLowerCase();
		} else if (typeof vName === "object" && typeof vName.type === "string") {
			sFragmentType = vName.type.toLowerCase();
		} else {
			sFragmentType = "";
		}
		Log.info("Do not use deprecated factory function 'sap.ui." + sFragmentType + "fragment'.", "sap.ui." + sFragmentType + "fragment", null, function () {
			var oSupportInfo = {
				type: "sap.ui." + sFragmentType + "fragment",
				name: ( vName.fragmentName || vName ) + ".fragment." + sFragmentType
			};
			if (vName.fragmentContent) {
				oSupportInfo.content = vName.fragmentContent;
				oSupportInfo.name = "";
			}
			return oSupportInfo;
		});

		if ((typeof vName === "object" && vName.fragmentName?.startsWith("module:")) || (typeof vName === "string" && vName.startsWith("module:"))) {
			throw new Error(`sap.ui.fragment(): module name syntax '${vName.fragmentName || vName}' is not supported.`);
		}

		return fragmentFactory(vName, vType, oController);
	};

	/**
	 * @see sap.ui.core.Fragment.load
	 *
	 * @private
	 * @param {string|object} vName The fragment name or the fragment config
	 * @param {string|sap.ui.core.mvc.Controller} vType The type of the fragment or the controller
	 * @param {sap.ui.core.mvc.Controller|object} oController the Controller or object which should be used by the controls in the Fragment.
	 * @returns {Promise<sap.ui.core.Control|sap.ui.core.Control[]>|sap.ui.core.Fragment} If fragment is created asynchronoulsy
	 *  a Promise is returned which resolves with the resulting {sap.ui.core.Control|sap.ui.core.Control[]}
	 *  after fragment parsing and instantiation.
	 *  If the fragment is created synchronoulsy the newly created fragment instance is returned
	 */
	function fragmentFactory(vName, vType, oController) {
		var mSettings = {};
		if (typeof (vName) === "string") { // normal call
			mSettings.fragmentName = vName;
			mSettings.oController = oController;
			mSettings.type = vType;

		} else if (typeof (vName) === "object") { // advanced call with config object
			mSettings = vName; // pass all config parameters to the implementation

			// mSettings.async could be undefined when fragmentFactory is triggered by old sap.ui.fragment api
			mSettings.async = mSettings.async === true ? mSettings.async : false;

			if (vType) { // second parameter "vType" is in this case the optional Controller
				mSettings.oController = vType;
			}

			if (mSettings.async) {
				var fnCreateInstance = function () {
					// owner-id is either available because the async factory was called in a sync block
					// or: the containing view carries the owner id for us
					var sOwnerId = mSettings.sOwnerId || mSettings.containingView && mSettings.containingView._sOwnerId;
					var oOwnerComponent = Component.getComponentById(sOwnerId);
					if (oOwnerComponent) {
						return oOwnerComponent.runAsOwner(function () {
							return new Fragment(mSettings);
						});
					}
					return new Fragment(mSettings);
				};

				var oType = Fragment.getType(mSettings.type);

				if (mSettings.fragmentName && mSettings.fragmentContent) {
					delete mSettings.fragmentName;
				}

				if (mSettings.fragmentName && typeof oType.load == "function") {
					return new Promise(function(resolve, reject) {
						oType.load(mSettings).then(function (vContent) {
							mSettings.fragmentContent = vContent;
							resolve(fnCreateInstance());
						}).catch(function (oError) {
							reject(oError);
						});
					});
				} else { // in case there is no 'fragmentName' but a 'definition' for the fragment provided or in case there is no load function available (sync use case)
					return Promise.resolve(fnCreateInstance());
				}
			}

		} else {
			Log.error("sap.ui.fragment() must be called with Fragment name or config object as first parameter, but is: " + vName);
		}

		return new Fragment(mSettings);
	}

	/**
	 * Loads and instantiates a fragment.
	 * Also refer to {@link topic:04129b2798c447368f4c8922c3c33cd7 Instantiation of Fragments}.
	 *
	 * The fragment object itself is not an entity that has any further significance beyond this factory function.
	 *
	 * A Promise is returned, which resolves with the fragment's content.
	 *
	 * The Fragment types <code>"XML"</code>, <code>"JS"</code>, and <code>"HTML"</code> (type <code>"HTML"</code> is deprecated) are available by default.
	 * Additional Fragment types can be implemented and added using the {@link sap.ui.core.Fragment.registerType} function.
	 *
	 * Further properties may be supported by future or custom Fragment types. Any given properties
	 * will be forwarded to the Fragment implementation.
	 *
	 * If no fixed ID is given, the fragment ID is generated. In any case, the fragment ID will be used as prefix for the IDs of
	 * all contained controls.
	 *
	 * <b>Note:</b>
	 * In case you are embedding a Fragment into an existing View, please also have a look at the
	 * {@link sap.ui.core.mvc.Controller.loadFragment loadFragment} factory for a closer coupling to the corresponding Controller instance.
	 *
	 * @example <caption>Loading an XML fragment (default type)</caption>
	 * sap.ui.require(["sap/ui/core/Fragment"], async (Fragment) => {
	 *  const myFrag = await Fragment.load({
	 *    name: "my.useful.VerySimpleUiPart"
	 *  });
	 * });
	 *
	 * @example <caption>Creating an XML fragment</caption>
	 * sap.ui.require(["sap/ui/core/Fragment"], async (Fragment) => {
	 *  const myFrag = await Fragment.load({
	 *    type: "XML",
	 *    definition: '&lt;Button xmlns=&quot;sap.m&quot; id=&quot;xmlfragbtn&quot; text=&quot;This is an XML Fragment&quot; press=&quot;doSomething&quot;&gt;&lt;/Button&gt;'
	 *  });
	 * });
     *
	 * @example <caption>Creating a JS fragment</caption>
	 * sap.ui.require(["sap/ui/core/Fragment"], async (Fragment) => {
	 *  const myFrag = await Fragment.load({
     *    name: "module:my/sample/AsyncButton",
	 *    type: "JS",
	 *  });
	 * });
	 *
	 * @example <caption>Creating an HTML fragment (deprecated)</caption>
	 * sap.ui.require(["sap/ui/core/Fragment"], async (Fragment) => {
	 *  const myFrag = await Fragment.load({
	 *    type: "HTML",
	 *    definition: '&lt;div id=&quot;htmlfragbtn&quot; data-sap-ui-type=&quot;sap.m.Button&quot; data-text=&quot;This is an HTML Fragment&quot;&gt;&lt;/div&gt;'
	 *  });
	 * });
	 *
	 * <b>Note:</b> If the fragment contains <code>ExtensionPoint</code>s, you have to pass the parameter <code>containingView</code>.
	 * The containing view should be the View instance into which the fragment content will be inserted manually.
	 *
	 * @param {object} mOptions options map
	 * @param {string} [mOptions.name] Must be provided if no <code>definition</code> parameter is given. The fragment name must correspond to an XML fragment which
	 *    can be loaded via the module system and must contain the fragment definition. It can be specified either in dot notation
	 *    (fragmentName + suffix <code>.fragment.<i>&lt;typeExtension></i></code>) or, for JS fragments, in module name syntax (<code>module:my/sample/AsyncButton</code>).
	 *    If <code>mOptions.controller</code> is supplied, the (event handler) methods referenced in the fragment will be called on that controller.
	 *    Note that fragments may require a controller to be given and certain methods to be implemented by it.
	 * @param {string} [mOptions.type=XML] the fragment type, e.g. <code>"XML"</code>, <code>"JS"</code>, or <code>"HTML"</code> (type <code>"HTML"</code> is deprecated). Default is <code>"XML"</code>.
	 * If the fragment name is given in module name syntax (e.g., <code>module:my/sample/AsyncButton</code>) the type must be omitted.
	 * @param {string} [mOptions.definition] definition of the fragment content. When this property is supplied, the <code>name</code> parameter must not be used. If both are supplied, the definition has priority.
	 * Please see the above example on how to use the <code>definition</code> parameter.
	 * @param {string} [mOptions.id] the ID of the fragment
	 * @param {sap.ui.core.mvc.Controller|object} [mOptions.controller] the controller or object which should be used by the controls in the fragment.
	 *    Note that some fragments may not need a controller while others may need one and certain methods to be implemented by it.
	 * @param {sap.ui.core.mvc.View} [mOptions.containingView] The view containing the fragment content. If the fragment content contains <code>ExtensionPoint</code>s, this parameter must be given.
	 * @public
	 * @static
	 * @since 1.58
	 * @returns {Promise<sap.ui.core.Control|sap.ui.core.Control[]>} a <code>Promise</code> resolving with the resulting control (array) after fragment parsing and instantiation
	 * @throws {TypeError}  If the fragment name is given in module name syntax and a fragment type is provided.
	 */
	Fragment.load = function(mOptions) {
		var mParameters = Object.assign({}, mOptions);

		if (mParameters.name && mParameters.definition) {
			Log.error("The properties 'name' and 'definition' shouldn't be provided at the same time. The fragment definition will be used instead of the name. Fragment name was: " + mParameters.name);
			delete mParameters.name;
		}

		// Sanity check and default fragment type handling
		if (mParameters.name?.startsWith("module:")) {
			if (mParameters.type) {
				throw new TypeError(`Invalid arguments: If the fragment name is given in module name syntax the type must be omitted. Found type: '${mParameters.type}'.`);
			} else {
				mParameters.type = "JS";
			}
		} else {
			mParameters.type ??= "XML";
		}

		mParameters.async = true;

		/**
		 * @deprecated because the 'Sequential' Mode is used by default and it's the only mode that will be supported
		 * in the next major release
		 */
		mParameters.processingMode = mParameters.processingMode || XMLProcessingMode.Sequential;

		// map new parameter names to classic API, delete new names to avoid assertion failures
		mParameters.fragmentName = mParameters.fragmentName || mParameters.name;
		mParameters.fragmentContent = mParameters.fragmentContent || mParameters.definition;
		mParameters.oController = mParameters.controller;
		mParameters.sOwnerId = ManagedObject._sOwnerId;
		delete mParameters.name;
		delete mParameters.definition;
		delete mParameters.controller;

		var pFragment = fragmentFactory(mParameters);

		return pFragment.then(function(oFragment) {
			return oFragment._pContentPromise;
		});
	};

	/**
	 * Get the implementation of the init and the load function for the requested fragment type.
	 * @param {string} sType Name of the fragment type
	 * @returns {object} returns an object containing the init and the load function of requested fragment type
	 * @since 1.86
	 * @static
	 * @private
	 * @ui5-restricted sap.fe
	 */
	Fragment.getType = function (sType) {
		return mTypes[sType];
	};

	/**
	 * Loads and instantiates an XML-based fragment.
	 *
	 * To instantiate a fragment that is already defined separately, call:
	 * <pre>
	 * sap.ui.xmlfragment(sId?, sFragmentName, oController?);
	 * </pre>
	 *
	 * Advanced usage:
	 * <pre>
	 * sap.ui.xmlfragment(oFragmentConfig, oController?);
	 * </pre>
	 * In addition to an <code>id</code>, the <code>oFragmentConfig</code> object can have either a <code>fragmentName</code>
	 * or a <code>fragmentContent</code> property, but not both.
	 *
	 * @param {string|object} [vId]
	 *            ID of the created fragment which will be used as prefix to all contained control IDs.
	 *            If the first argument is not an ID, it must be either the fragment name (<code>sFragmentName</code>)
	 *            or a configuration object (<code>oFragmentConfig</code>) as specified below
	 * @param {string} [vId.id]
	 *            ID of the created fragment which will be used as prefix to all contained control IDs
	 * @param {string} [vId.fragmentContent]
	 *            definition of the fragment content as an XML string that will be used
	 *            instead of loading the content from a separate <code>.fragment.xml</code> file.
	 *            When this property is given, any given fragment name is ignored
	 * @param {string} [vId.fragmentName]
	 *            resource name of the fragment module in dot notation without the <code>.fragment.xml</code> suffix from the file name
	 * @param {string|sap.ui.core.mvc.Controller|object} vFragment
	 *            resource name of the fragment module as specified by <code>vId.fragmentName</code> or,
	 *            in the advanced usage case, an optional <code>oController</code>
	 * @param {sap.ui.core.mvc.Controller|object} [oController]
	 *            controller object to be used for methods or event handlers. Can be either the controller of an
	 *            enclosing view, a new controller instance, or a simple object with the necessary methods attached.
	 *            Note that a fragment has no runtime representation besides its contained controls. Therefore, there is
	 *            no API to retrieve the controller from the return value.
	 *            Note also that fragments may require a controller to be given and certain methods to be available
	 * @public
	 * @static
	 * @deprecated As of version 1.58. Refer to {@link topic:04129b2798c447368f4c8922c3c33cd7 Instantiation of Fragments}.
	 * @return {sap.ui.core.Control|sap.ui.core.Control[]} the instantiated root control(s) from the fragment content
	 * @ui5-global-only
	 */
	sap.ui.xmlfragment = function(vId, vFragment, oController) {

		if (typeof (vId) === "string") { // basic call
			if (typeof (vFragment) === "string") { // with ID
				return sap.ui.fragment({fragmentName: vFragment, sId: vId, type: "XML"}, oController); // legacy-relevant

			} else { // no ID, sId is actually the name and vFragment the optional Controller
				return sap.ui.fragment(vId, "XML", vFragment); // legacy-relevant
			}
		} else { // advanced call
			vId.type = "XML";
			 // second parameter "vFragment" is the optional Controller
			return sap.ui.fragment(vId, vFragment); // legacy-relevant
		}
	};


	/**
	 * Defines <strong>or</strong> instantiates a JS-based fragment.
	 *
	 * To define a JS fragment, call:
	 * <pre>
	 * sap.ui.jsfragment(sName, oFragmentDefinition);
	 * </pre>
	 *
	 * To instantiate a JS fragment that is already defined, call:
	 * <pre>
	 * sap.ui.jsfragment(sId?, sFragmentName, oController?);
	 * </pre>
	 * Advanced usage:
	 * <pre>
	 * sap.ui.jsfragment(oFragmentConfig, oController?);
	 * </pre>
	 *
	 *
	 * @param {string|object} vName
	 *            when defining a fragment: name of the fragment.<br>
	 *            When loading a fragment: fragment ID (optional), fragment name, or configuration object as specified below
	 * @param {string} [vName.id]
	 *            ID of the newly created fragment which <i>can</i> be used as a prefix
	 *            when creating the IDs in the JS fragment content. Even if an <code>id</code> is given, some JS fragments may choose
	 *            not to use the ID prefixing, for example, in order to prevent the fragment from being instantiated multiple times
	 *            within the lifecycle of the existing fragment
	 * @param {string} vName.fragmentName
	 *            resource name of the fragment module in dot notation without the <code>.fragment.js</code> suffix from the file name.
	 *            When no fragment has been defined with that name, the name will be converted
	 *            to a path by replacing dots with slashes and appending <code>.fragment.js</code>. The corresponding resource to load
	 *            is expected to have a fragment defined with the same <code>fragmentName</code>
	 * @param {object|string} vFragmentDefinition
	 *            when defining a fragment: object holding at least the <code>createContent(oController?)</code>
	 *            method that returns an instance of <code>sap.ui.core.Control</code> or an array thereof.<br>
	 *            When loading a fragment and the first argument is an ID: the <code>fragmentName</code>
	 * @param {sap.ui.core.mvc.Controller|object} [oController]
	 *            controller object to be used for methods or event handlers. Can be either the controller of an
	 *            enclosing view, a new controller instance, or a simple object with the necessary methods attached.
	 *            Note that a fragment has no runtime representation besides its contained controls. Therefore, there is
	 *            no API to retrieve the controller from the return value
	 * @public
	 * @static
	 * @deprecated As of version 1.58. Refer to {@link topic:04129b2798c447368f4c8922c3c33cd7 Instantiation of Fragments}.
	 * @return {sap.ui.core.Control|sap.ui.core.Control[]} the instantiated root control(s) from the fragment content
	 * @ui5-global-only
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
				return sap.ui.fragment(vName, "JS", vFragmentDefinition); // legacy-relevant
			}

		} else if (typeof vName === "string" && vFragmentDefinition === undefined) {
			// plain instantiation: name only
			return sap.ui.fragment(vName, "JS"); // legacy-relevant

		} else if (typeof vName === "object") {
			// advanced mode: oConfig+[oController]
			vName.type = "JS";
			return sap.ui.fragment(vName, vFragmentDefinition); // legacy-relevant

		} else if (arguments.length >= 3) {
			// must be plain instantiation mode: ID+Name[+Controller]
			return sap.ui.fragment({id: vName, fragmentName: vFragmentDefinition, type: "JS"}, oController);  // legacy-relevant

		} else {
			Log.error("sap.ui.jsfragment() was called with wrong parameter set: " + vName + " + " + vFragmentDefinition);
		}
	};


	/**
	 * Loads and instantiates an HTML-based fragment.
	 *
	 * To instantiate a fragment that is already defined separately, call:
	 * <pre>
	 * sap.ui.htmlfragment(sId?, sFragmentName, oController?);
	 * </pre>
	 *
	 * Advanced usage:
	 * <pre>
	 * sap.ui.htmlfragment(oFragmentConfig, oController?);
	 * </pre>
	 * In addition to an <code>id</code>, the <code>oFragmentConfig</code> object can have either a <code>fragmentName</code>
	 * or a <code>fragmentContent</code> property, but not both.
	 *
	 * @param {string|object} [vId]
	 *            ID of the created fragment which will be used as prefix to all contained control IDs.
	 *            If the first argument is not an ID, it must be either the fragment name (<code>sFragmentName</code>)
	 *            or a configuration object (<code>oFragmentConfig</code>) as specified below
	 * @param {string} [vId.id]
	 *            ID of the created fragment which will be used as prefix to all contained control IDs
	 * @param {string} [vId.fragmentContent]
	 *            definition of the fragment content as an HTML string that will be used
	 *            instead of loading the content from a separate <code>.fragment.html</code> file.
	 *            When this property is given, any given fragment name is ignored
	 * @param {string} [vId.fragmentName]
	 *            resource name of the fragment module in dot notation without the <code>.fragment.html</code> suffix from the file name
	 * @param {string|sap.ui.core.mvc.Controller|object} vFragment
	 *            resource name of the fragment module as specified by <code>vId.fragmentName</code> or,
	 *            in the advanced usage case, an optional <code>oController</code>
	 * @param {sap.ui.core.mvc.Controller|object} [oController]
	 *            controller object to be used for methods or event handlers. Can be either the controller of an
	 *            enclosing view, a new controller instance, or a simple object with the necessary methods attached.
	 *            Note that a fragment has no runtime representation besides its contained controls. Therefore, there is
	 *            no API to retrieve the controller from the return value.
	 *            Note also that fragments may require a controller to be given and certain methods to be available
	 * @public
	 * @static
	 * @deprecated As of version 1.58. Additionally, use of fragments based on type <code>"HTML"</code> is deprecated since 1.108.
	 *    If you need declarative fragments, use XML fragments instead. Refer to {@link topic:04129b2798c447368f4c8922c3c33cd7 Instantiation of Fragments}.
	 * @return {sap.ui.core.Control|sap.ui.core.Control[]} the instantiated root control(s) from the fragment content
	 * @ui5-global-only
	 */
	sap.ui.htmlfragment = function(vId, vFragment, oController) {

		if (typeof (vId) === "string") { // basic call
			if (typeof (vFragment) === "string") { // with ID
				return sap.ui.fragment({fragmentName: vFragment, sId: vId, type: "HTML"}, oController);  // legacy-relevant

			} else { // no ID, vId is actually the name and vFragment the optional Controller
				return sap.ui.fragment(vId, "HTML", vFragment); // legacy-relevant
			}
		} else { // advanced call
			vId.type = "HTML";
			// second parameter "vFragment" is the optional Controller
			return sap.ui.fragment(vId, vFragment); // legacy-relevant
		}
	};




	// ###   FRAGMENT TYPES   ###


	// ###   XML Fragments   ###
	Fragment.registerType("XML" , {
		load: function(mSettings) {
			// type "XML"
			return XMLTemplateProcessor.loadTemplatePromise(mSettings.fragmentName, "fragment").then(function(documentElement) {
				return documentElement;
			});
		},
		init: function(mSettings) {
			this._aContent = [];
			// use specified content or load the content definition
			if (mSettings.fragmentContent) {
				if (typeof (mSettings.fragmentContent) === "string") {
					this._xContent = XMLHelper.parse(mSettings.fragmentContent).documentElement;
				} else {
					this._xContent = mSettings.fragmentContent;
				}
			} else {
				Log.warning("Synchronous loading of fragment, due to Fragment.init() call for '" + mSettings.fragmentName + "'. Use 'sap/ui/core/Fragment' module with Fragment.load() instead.", "SyncXHR", null, function() {
					return {
						type: "SyncXHR",
						name: "Fragment"
					};
				});
				this._xContent = XMLTemplateProcessor.loadTemplate(mSettings.fragmentName, "fragment");
			}

			this._oContainingView = this._sExplicitId ? this : (mSettings.containingView || this);
			if ((this._oContainingView === this) ) {
				this._oContainingView.oController = (mSettings.containingView && mSettings.containingView.oController) || mSettings.oController;
			}


			/**
			 * @deprecated because the 'Sequential' Mode is used by default and it's the only mode that will be supported
			 * in the next major release
			 *
			// If given, processingMode will be passed down to nested subviews in XMLTemplateProcessor
			 */
			this._sProcessingMode = mSettings.processingMode;

			// take the settings preprocessor from the containing view (if any)
			var fnSettingsPreprocessor = this._oContainingView._fnSettingsPreprocessor;

			// similar to the XMLView we need to have a scoped runWithPreprocessors function
			var oParseConfig = {
				fnRunWithPreprocessor: function(fn) {
					return ManagedObject.runWithPreprocessors(fn, {
						settings: fnSettingsPreprocessor
					});
				}
			};

			// finally trigger the actual XML processing and control creation
			// IMPORTANT:
			// this call can be triggered with both "async = true" and "async = false"
			// In case of sync processing, the XMLTemplateProcessor makes sure to only use SyncPromises.
			var pContentPromise = XMLTemplateProcessor.parseTemplatePromise(this._xContent, this, this._bAsync, oParseConfig).then(function(aContent) {
				this._aContent = aContent;
				/*
				 * If content was parsed and an objectBinding at the fragment was defined
				 * the objectBinding must be forwarded to the created controls
				 */
				if (this._aContent && this._aContent.length && mSettings.objectBindings) {
					this._aContent.forEach(function (oContent, iIndex) {
						if (oContent instanceof Element) {
							for (var sModelName in mSettings.objectBindings) {
								oContent.bindObject(mSettings.objectBindings[sModelName]);
							}
						}
					});
				}

				return this._aContent.length > 1 ? this._aContent : this._aContent[0];
			}.bind(this));
			// in sync case we must get a SyncPromise and need to unwrap for error logging
			if (!this._bAsync) {
				try {
					pContentPromise.unwrap();
				} catch (e) {
					future.errorThrows(this.getMetadata().getName() +
							": An Error occured during XML processing of '" +
							(mSettings.fragmentName || mSettings.fragmentContent) +
							"' with id '" +
							this.getId() +
							"'",
							{ cause: e });
				}
			}
			return pContentPromise;
		}
	});



	// ###   JS Fragments   ###

	Fragment.registerType("JS", {
		load: function(mSettings) {
			let sFragmentPath;
			// Handle module: syntax
			if (mSettings.fragmentName.startsWith("module:")) {
				sFragmentPath = mSettings.fragmentName.substring(7);
			} else {
				// Handle dot-separated syntax
				sFragmentPath = mSettings.fragmentName.replace(/\./g, "/") + ".fragment";
			}
			return new Promise(function(resolve, reject) {
				sap.ui.require([sFragmentPath], function(content) {
					resolve(content);
				}, reject);
			});
		},
		init: function(mSettings) {
			this._aContent = [];

			if (mSettings.fragmentContent) {
				// Mixin fragmentContent into Fragment instance
				merge(this, mSettings.fragmentContent);
			} else {
				/**
				 * @deprecated
				 */
				(() => {
					/*** require fragment definition if not yet done... ***/
					if (!mRegistry[mSettings.fragmentName]) {
						sap.ui.requireSync(mSettings.fragmentName.replace(/\./g, "/") + ".fragment"); // legacy-relevant: Sync path
					}
				})();
				/*** Step 2: merge() ***/
				merge(this, mRegistry[mSettings.fragmentName]);
			}
			this._oContainingView = mSettings.containingView || this;

			// unset any preprocessors (e.g. from an enclosing JSON view)
			return ManagedObject.runWithPreprocessors(function() {
				var vContent;
				if (this.fnScopedRunWithOwner) {
					this.fnScopedRunWithOwner(function () {
						vContent = this.createContent(mSettings.oController || this._oContainingView.oController);
					}.bind(this));
				} else {
					vContent = this.createContent(mSettings.oController || this._oContainingView.oController);
				}

				// createContent might return a Promise too
				if (vContent instanceof Promise) {
					return vContent.then(function(aContent) {
						this._aContent = this._aContent.concat(aContent);
						return this._aContent.length > 1 ? this._aContent : this._aContent[0];
					}.bind(this));
				} else {
					// vContent is not a Promise, but a synchronously processed array of controls
					return new Promise(function (resolve, reject) {
						this._aContent = this._aContent.concat(vContent);
						resolve(this._aContent.length > 1 ? this._aContent : this._aContent[0]);
					}.bind(this));
				}
			}.bind(this), {
				settings: this._oContainingView._fnSettingsPreprocessor
			});
		}
	});



	// ###   HTML Fragments   ###
	/**
	 * @deprecated As of version 1.108, together with the HTMLView. If you need declarative fragments,
	 *    use XML fragments instead.
	 */
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
			load: function(mSettings) {
				var sFragmentPath = mSettings.fragmentName.replace(/\./g, "/") + ".fragment";
				return LoaderExtensions.loadResource(sFragmentPath + ".html", {async: true}).then(function(oContent) {
					return oContent;
				});
			},
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
					var oDocumentFragment = document.createDocumentFragment();
					for (var i = 0; i < oNodeList.length; i++) {
						oDocumentFragment.appendChild(oNodeList.item(i));
					}
					this._oTemplate.appendChild(oDocumentFragment);
				}

				var oMetaElement = this._oTemplate.getElementsByTagName("template")[0];
				var oProperties = this.getMetadata().getAllProperties();

				if (oMetaElement) {
					var that = this;
					var aAttributes = oMetaElement.getAttributeNames();
					for (var i = 0; i < aAttributes.length - 1; i++) {
						var sAttributeName = aAttributes[i];
						var sSettingName = DeclarativeSupport.convertAttributeToSettingName(sAttributeName, that.getId());
						var sValue = oMetaElement.getAttribute(sAttributeName);

						var oProperty = oProperties[sSettingName];
						if (!mSettings[sSettingName]) {
							if (oProperty) {
								mSettings[sSettingName] = DeclarativeSupport.convertValueToType(DeclarativeSupport.getPropertyDataType(oProperty),sValue);
							} else if (sap.ui.core.mvc.HTMLView._mAllowedSettings[sSettingName]) {
								mSettings[sSettingName] = sValue;
							}
						}
					}
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
				return ManagedObject.runWithPreprocessors(function() {
					if (this.fnScopedRunWithOwner) {
						this.fnScopedRunWithOwner(function () {
							DeclarativeSupport.compile(this._oTemplate, this);
						}.bind(this));
					} else {
						DeclarativeSupport.compile(this._oTemplate, this);
					}

					// FIXME declarative support automatically inject the content into this through "this.addContent()"
					var content = this.getContent();
					if (content && content.length === 1) {
						this._aContent = [content[0]];
						return new Promise(function(resolve, reject) {
							resolve(this._aContent[0]);
						}.bind(this));
					}// else {
						// TODO: error
					//}
				}.bind(this), {
					settings: this._oContainingView._fnSettingsPreprocessor
				});
			}
		});
	}()); // end of HTML Fragment stuff

	return Fragment;

});