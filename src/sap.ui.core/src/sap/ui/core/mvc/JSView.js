/*!
 * ${copyright}
 */

// Provides control sap.ui.core.mvc.JSView.
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'./View',
	'./JSViewRenderer',
	'sap/base/util/merge',
	'sap/ui/base/ManagedObject',
	'sap/ui/core/library',
	'sap/base/Log'
],
	function(jQuery, View, JSViewRenderer, merge, ManagedObject, library, Log) {
	"use strict";


	/**
	 * Constructor for a new mvc/JSView.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A View defined/constructed by JavaScript code.
	 * @extends sap.ui.core.mvc.View
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.core.mvc.JSView
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var JSView = View.extend("sap.ui.core.mvc.JSView", /** @lends sap.ui.core.mvc.JSView.prototype */ { metadata : {

		library : "sap.ui.core"
	}});

	/**
	 * Map of already registered JavaScript views (pseudo classes), keyed by their name.
	 *
	 * When a new JSView definition is registered for some name, the definition object
	 * is stored in this map, keyed by that name.
	 *
	 * When a new instance of JSView is created for an already registered view name (class),
	 * then all properties from the corresponding definition object in this map are copied to
	 * the new instance of JSView.
	 *
	 * There's currently no API to remove view definitions from this map.
	 *
	 * @type Object.<string,Object>
	 * @private
	 */
	var mRegistry = {};


	/**
	 * Flag for feature detection of asynchronous loading/rendering
	 * @public
	 * @since 1.30
	 */
	JSView.asyncSupport = true;

	// shortcut for enum(s)
	var ViewType = library.mvc.ViewType;

	/**
	 * Creates an instance of the view with the given name (and id).
	 *
	 * @param {object} oOptions An object containing the view configuration options.
	 * @param {string} [oOptions.id] Specifies an ID for the view instance. If no ID is given, an ID will be generated.
	 * @param {string} [oOptions.viewName] Name of the view. The view must still be defined using {@link sap.ui.jsview}.
	 * @param {sap.ui.core.mvc.Controller} [oOptions.controller] Controller instance to be used for this view.
	 * The given controller instance overrides the controller defined in the view definition. Sharing a controller instance
	 * between multiple views is not supported.
	 * @public
	 * @static
	 * @since 1.56.0
	 * @return {Promise<sap.ui.core.mvc.JSView>} A promise that resolves with the view instance
	 */
	JSView.create = function(oOptions) {
		var mParameters = merge({}, oOptions);
		//remove unsupported options:
		for (var sOption in mParameters) {
			if (sOption === 'definition' || sOption === 'preprocessors') {
				delete mParameters[sOption];
				Log.warning("JSView.create does not support the options definition or preprocessor!");
			}
		}
		mParameters.type = ViewType.JS;
		return View.create(mParameters);
	};

	/**
	 * Defines or creates an instance of a JavaScript view.
	 *
	 * The behavior of this method depends on the signature of the call and on the current context.
	 *
	 * <h3>View Definition</h3>
	 * <pre>
	 *   sap.ui.jsview(sId, vView);
	 * </pre>
	 * Defines a view of the given name with the given implementation. <code>sId</code> must be the view's name,
	 * <code>vView</code> must be an object and can contain implementations for any of the hooks provided by JSView.
	 *
	 * <h3>View Instantiation (deprecated)</h3>
	 * <pre>
	 *   var oView = sap.ui.jsview(vView);
	 *   var oView = sap.ui.jsview(vView, bASync);
	 *   var oView = sap.ui.jsview(sId, vView);
	 *   var oView = sap.ui.jsview(sId, vView, bAsync);
	 * </pre>
	 * Creates an instance of the view with the given name (and id). If no view implementation has been defined
	 * for that view name, a JavaScript module with the same qualified name and with suffix <code>.view.js</code>
	 * will be loaded (required) and executed. The module should register a view definition on execution
	 * (1st. variant above).
	 *
	 * If <code>sId</code> is omitted, an ID will be created automatically.
	 *
	 * When <code>bAsync</code> has a truthy value, the view definition will be read asynchronously, if needed,
	 * but the (incomplete) view instance will be returned immediately.
	 *
	 * <b>Note:</b> Using <code>sap.ui.jsview</code> for creating view instances has been deprecated, use
	 * {@link sap.ui.core.mvc.JSView.create JSView.create} instead. <code>JSView.create</code> enforces
	 * asynchronous loading and can be used via an AMD reference, it doesn't rely on a global name.
	 *
	 * <b>Note:</b> Any other call signature will lead to a runtime error.
	 *
	 * @param {string} [sId] id of the newly created view, only allowed for instance creation
	 * @param {string | object} vView name or implementation of the view.
	 * @param {boolean} [bAsync] defines how the view source is loaded and rendered later on
	 *   (only relevant for instantiation, ignored for everything else)
	 * @public
	 * @static
	 * @deprecated Since 1.56, use {@link sap.ui.core.mvc.JSView.create JSView.create} to create view instances;
	 *   for defining JavaScript views, there's no substitute yet and <em>sap.ui.jsview</em> still has to be used
	 * @return {sap.ui.core.mvc.JSView | undefined} the created JSView instance in the creation case, otherwise undefined
	 */
	sap.ui.jsview = function(sId, vView, bAsync) {
		var fnLogDeprecation = function(sMethod) {
			Log[sMethod](
				"Do not use deprecated view factory functions." +
				"Use the static create function on the specific view module instead: [XML|JS|HTML|JSON]View.create().",
				"sap.ui.view",
				null,
				function () {
					return {
						type: "sap.ui.view",
						name: sId || (vView && vView.name)
					};
				}
			);
		};

		if (vView && vView.async) {
			fnLogDeprecation("info");
		} else {
			fnLogDeprecation("warning");
		}
		return viewFactory.apply(this, arguments);
	};

	/*
	 * The old view factory implementation
	 */
	function viewFactory(sId, vView, bAsync) {
		var mSettings = {}, oView;

		if (vView && typeof (vView) == "string") { // instantiation sap.ui.jsview("id","name", [async])
			mSettings.viewName = vView;
			if (typeof arguments[2] == "boolean") {
				mSettings.async = bAsync;
			} else if (typeof arguments[2] == "object") { // arguments[2] is somehow a controller
				mSettings.controller = arguments[2];
				mSettings.async = !!arguments[3]; // optional
			}
			oView = new JSView(sId, mSettings);
			return oView;

		} else if (vView && typeof (vView) == "object") { // definition sap.ui.jsview("name",definitionObject)
			// sId is not given, but contains the desired value of sViewName
			mRegistry[sId] = vView;
			sap.ui.loader._.declareModule(sId.replace(/\./g, "/") + ".view.js");
			Log.info("For defining views use JSView.extend instead.");
		} else if (arguments.length == 1 && typeof sId == "string" ||
			arguments.length == 2 && typeof arguments[0] == "string" && typeof arguments[1] == "boolean") { // instantiation sap.ui.jsview("name", [async])
			mSettings.viewName = arguments[0];
			mSettings.async = !!arguments[1]; // optional
			/*** STEP 1: create View ***/
			oView = mSettings.id ? new JSView(mSettings.id, mSettings) : new JSView(mSettings);
			/*** Step 3B and 4B (create and connect controller) happen in View ***/
			return oView;

		} else {
			throw new Error("Wrong arguments ('" + sId + "', '" + vView + "')! Either call sap.ui.jsview([sId,] sViewName) to instantiate a View or sap.ui.jsview(sViewName, oViewImpl) to define a View type.");
		}
	}

	JSView.prototype.initViewSettings = function (mSettings) {
		var oPromise;

		// require view definition if not yet done...
		if (!mRegistry[mSettings.viewName]) {
			var sModuleName = mSettings.viewName.replace(/\./g, "/") + ".view";
			if ( mSettings.async ) {
				oPromise = new Promise(function(resolve) {
					sap.ui.require([sModuleName], resolve);
				});
			} else {
				sap.ui.requireSync(sModuleName);
			}
		}

		// extend 'this' with view from registry which should now or then be available
		if (mSettings.async) {
			return Promise.resolve(oPromise).then(function() {
				jQuery.extend(this, mRegistry[mSettings.viewName]);
			}.bind(this));
		}
		jQuery.extend(this, mRegistry[mSettings.viewName]);
	};

	JSView.prototype.onControllerConnected = function(oController) {
		// temporarily replace any preprocessors, e.g. from an enclosing JSON view
		ManagedObject.runWithPreprocessors(function() {
			this.applySettings({
				content : this.createContent(oController)
			});
		}, {
			// when auto prefixing is enabled, we add the prefix
			id: this.getAutoPrefixId() ? this.createId.bind(this) : undefined,
			settings: this._fnSettingsPreprocessor
		}, this);
	};

	/**
	 * A method to be implemented by JSViews, returning the flag whether to prefix
	 * the IDs of controls automatically or not if the controls are created inside
	 * the {@link sap.ui.core.mvc.JSView#createContent} function. By default this
	 * feature is not activated.
	 *
	 * You can overwrite this function and return true to activate the automatic
	 * prefixing.
	 *
	 * @since 1.15.1
	 * @return {boolean} true, if the controls IDs should be prefixed automatically
	 * @protected
	 */
	JSView.prototype.getAutoPrefixId = function() {
		return false;
	};

	/**
	 * A method to be implemented by JSViews, returning the View UI.
	 * While for declarative View types like XMLView or JSONView the user interface definition is declared in a separate file,
	 * JSViews programmatically construct the UI. This happens in the createContent method which every JSView needs to implement.
	 * The View implementation can construct the complete UI in this method - or only return the root control and create the rest of the UI lazily later on.
	 *
	 * @return {sap.ui.core.Control} a control or (typically) tree of controls representing the View user interface
	 * @public
	 * @name sap.ui.core.mvc.JSView#createContent
	 * @function
	 */


	return JSView;

});