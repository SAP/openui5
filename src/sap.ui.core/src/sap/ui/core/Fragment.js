/*!
 * ${copyright}
 */

sap.ui.define([
	'../base/ManagedObject',
	'./Element',
	'./XMLTemplateProcessor',
	'sap/base/future',
	'sap/base/Log',
	'sap/base/util/merge',
	'sap/ui/util/XMLHelper',
	'sap/ui/core/Component'
],
function(
	ManagedObject,
	Element,
	XMLTemplateProcessor,
	future,
	Log,
	merge,
	XMLHelper,
	Component
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
				sOwnerId : { type: 'sap.ui.core.ID', visibility: 'hidden' }
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
	 * @see sap.ui.core.Fragment.load
	 *
	 * @private
	 * @param {string|object} vName The fragment name or the fragment config
	 * @param {string|sap.ui.core.mvc.Controller} vType The type of the fragment or the controller
	 * @param {sap.ui.core.mvc.Controller|Object} oController the Controller or Object which should be used by the controls in the Fragment.
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
	 * Loads and instantiates a Fragment.
	 * A Promise is returned, which resolves with the Fragments content.
	 *
	 * The Fragment object itself is not an entity with significance beyond this factory.
	 *
	 * The Fragment types "XML", "JS" and "HTML" (type "HTML" is deprecated) are available by default; additional Fragment types can be added using
	 * the sap.ui.core.Fragment.registerType() function.
	 *
	 * Further properties may be supported by future or custom Fragment types. Any given properties
	 * will be forwarded to the Fragment implementation.
	 *
	 * If no fixed ID is given, the Fragment ID is generated. In any case, the Fragment ID will be used as prefix for the IDs of
	 * all contained controls.
	 *
	 * @example <caption>Loading an XML fragment (default type)</caption>
	 * sap.ui.require(["sap/ui/core/Fragment"], async function(Fragment){
	 *  const myFrag = await Fragment.load({
	 *    name: "my.useful.VerySimpleUiPart"
	 *  });
	 * });
	 *
	 * @example <caption>Creating an XML fragments</caption>
	 * sap.ui.require(["sap/ui/core/Fragment"], async function(Fragment){
	 *  const myFrag = await Fragment.load({
	 *    type: "XML",
	 *    definition: '&lt;Button xmlns=&quot;sap.m&quot; id=&quot;xmlfragbtn&quot; text=&quot;This is an XML Fragment&quot; press=&quot;doSomething&quot;&gt;&lt;/Button&gt;'
	 *  });
	 * });
     *
	 * @example <caption>Creating an JS fragments</caption>
	 * sap.ui.require(["sap/ui/core/Fragment"], async function(Fragment){
	 *  const myFrag = await Fragment.load({
     *    name: "my.sample.AsyncButton",
	 *    type: "JS",
	 *  });
	 * });
	 *
	 * @example <caption>Creating an HTML fragments (deprecated)</caption>
	 * sap.ui.require(["sap/ui/core/Fragment"], async function(Fragment){
	 *  const myFrag = await Fragment.load({
	 *    type: "HTML",
	 *    definition: '&lt;div id=&quot;htmlfragbtn&quot; data-sap-ui-type=&quot;sap.m.Button&quot; data-text=&quot;This is an HTML Fragment&quot;&gt;&lt;/div&gt;'
	 *  });
	 * });
	 *
	 * <b>Note:</b> If the Fragment contains ExtensionPoints you have to pass the parameter 'containingView'.
	 * The containing view should be the View instance into which the fragment content will be inserted manually.
	 *
	 * @param {object} mOptions options map
	 * @param {string} [mOptions.name] must be supplied if no "definition" parameter is given. The Fragment name must correspond to an XML Fragment which
	 *    can be loaded via the module system
	 *    (fragmentName + suffix ".fragment.[typeextension]") and which contains the Fragment definition.
	 *    If "mOptions.controller" is supplied, the (event handler-) methods referenced in the Fragment will be called on this Controller.
	 *    Note that Fragments may require a Controller to be given and certain methods to be implemented by it.
	 * @param {string} [mOptions.type=XML] the Fragment type, e.g. "XML", "JS", or "HTML" (type "HTML" is deprecated). Default is "XML"
	 * @param {string} [mOptions.definition] definition of the Fragment content. When this property is supplied, the "name" parameter must not be used. If both are supplied, the definition has priority.
	 * Please see the above example on how to use the 'definition' parameter.
	 * @param {string} [mOptions.id] the ID of the Fragment
	 * @param {sap.ui.core.mvc.Controller|Object} [mOptions.controller] the Controller or Object which should be used by the controls in the Fragment.
	 *    Note that some Fragments may not need a Controller while others may need one and certain methods to be implemented by it.
	 * @param {sap.ui.core.mvc.View} [mOptions.containingView] The view containing the Fragment content. If the Fragment content contains ExtensionPoints this parameter must be given.
	 * @public
	 * @static
	 * @since 1.58
	 * @returns {Promise<sap.ui.core.Control|sap.ui.core.Control[]>} a <code>Promise</code> resolving with the resulting control (array) after fragment parsing and instantiation
	 */
	Fragment.load = function(mOptions) {
		var mParameters = Object.assign({}, mOptions);

		if (mParameters.name && mParameters.definition) {
			Log.error("The properties 'name' and 'definition' shouldn't be provided at the same time. The fragment definition will be used instead of the name. Fragment name was: " + mParameters.name);
			delete mParameters.name;
		}

		mParameters.type = mParameters.type || "XML";
		mParameters.async = true;

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
					future.errorThrows("An Error occured during XML processing of '" +
							this.getMetadata().getName() +
							"' with id '" +
							this.getId() +
							"':\n" +
							e.stack);
				}
			}
			return pContentPromise;
		}
	});



	// ###   JS Fragments   ###

	Fragment.registerType("JS", {
		load: function(mSettings) {
			var sFragmentPath = mSettings.fragmentName.replace(/\./g, "/") + ".fragment";
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
	/* -------------------------------------- */
	return Fragment;
});