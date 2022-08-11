/*!
 * ${copyright}
 */

// Provides control sap.ui.core.mvc.JSONView.
sap.ui.define([
	'./View',
	'./JSONViewRenderer',
	'./ViewType',
	'./EventHandlerResolver',
	'sap/base/util/merge',
	'sap/ui/base/ManagedObject',
	'sap/ui/model/resource/ResourceModel',
	'sap/base/Log',
	'sap/base/util/LoaderExtensions'
],
	function(
		View,
		JSONViewRenderer,
		ViewType,
		EventHandlerResolver,
		merge,
		ManagedObject,
		ResourceModel,
		Log,
		LoaderExtensions
	) {
	"use strict";

	/**
	 * Constructor for a new mvc/JSONView.
	 *
	 * <strong>Note:</strong> Application code shouldn't call the constructor directly, but rather use the factory
	 * {@link sap.ui.core.mvc.JSONView.create JSONView.create} or {@link sap.ui.core.mvc.View.create View.create}
	 * with type {@link sap.ui.core.mvc.ViewType.JSON JSON}. The factory simplifies asynchronous loading of a view
	 * and future features might be added to the factory only.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A View defined using JSON.
	 * @extends sap.ui.core.mvc.View
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.core.mvc.JSONView
	 */
	var JSONView = View.extend("sap.ui.core.mvc.JSONView", /** @lends sap.ui.core.mvc.JSONView.prototype */ {
		metadata : {
			library : "sap.ui.core"
		},
		renderer: JSONViewRenderer
	});

	/**
	 * Creates a JSON view of the given configuration.
	 *
	 * @param {object} oOptions An object containing the view configuration options.
	 * @param {string} [oOptions.id] Specifies an ID for the view instance. If no ID is given, an ID will be generated.
	 * @param {string} [oOptions.viewName] The view name (in dot-notation) that corresponds to a JSON resource that can
	 *                    be loaded via the module system (viewName + suffix ".view.json").
	 * @param {string|object} [oOptions.definition] view definition as a JSON string or an object literal
	 * @param {sap.ui.core.mvc.Controller} [oOptions.controller] Controller instance to be used for this view.
	 * The given controller instance overrides the controller defined in the view definition. Sharing a controller instance
	 * between multiple views is not supported.
	 * @public
	 * @since 1.56.0
	 * @static
	 * @returns {Promise<sap.ui.core.mvc.JSONView>} A promise which resolves with the created <code>JSONView</code> instance.
	 */
	JSONView.create = function(oOptions) {
		var mParameters = merge({}, oOptions);
		//remove unsupported options:
		for (var sOption in mParameters) {
			if (sOption === 'preprocessors') {
				delete mParameters['preprocessors'];
				Log.warning("JSONView.create does not support the option preprocessors!");
			}
		}
		mParameters.type = ViewType.JSON;
		return View.create(mParameters);
	};

	/**
	 * Creates a JSON view of the given name and id.
	 *
	 * The <code>viewName</code> must either correspond to a JSON module that can be loaded
	 * via the module system (viewName + suffix ".view.json") and which defines the view or it must
	 * be a configuration object for a view.
	 * The configuration object can have a viewName, viewContent and a controller property. The viewName
	 * behaves as described above, viewContent can hold the view description as JSON string or as object literal.
	 *
	 * <strong>Note</strong>: when an object literal is given, it might be modified during view construction.
	 *
	 * The controller property can hold a controller instance. If a controller instance is given,
	 * it overrides the controller defined in the view.
	 *
	 * When property <code>async</code> is set to true, the view definition and the controller class (and its
	 * dependencies) will be loaded asynchronously. Any controls used in the view might be loaded sync or
	 * async, depending on the view configuration. Even when the view definition is provided as string or object tree,
	 * controller or controls might be loaded
	 * asynchronously. In any case, a view instance will be returned synchronously by this factory API, but its
	 * content (control tree) might appear only later. Also see {@link sap.ui.core.mvc.View#loaded}.
	 *
	 * Like with any other control, an id is optional and will be created when missing.
	 *
	 * @param {string} [sId] id of the newly created view
	 * @param {string | object} vView name of a view resource or view configuration as described above.
	 * @param {string} [vView.viewName] name of a view resource in module name notation (without suffix)
	 * @param {string|object} [vView.viewContent] view definition as a JSON string or an object literal
	 * @param {boolean} [vView.async] defines how the view source is loaded and rendered later on
	 * @param {sap.ui.core.mvc.Controller} [vView.controller] controller to be used for this view instance
	 * @public
	 * @static
	 * @deprecated Since 1.56. Use {@link sap.ui.core.mvc.JSONView.create JSONView.create} to create view instances
	 * @return {sap.ui.core.mvc.JSONView} the created JSONView instance
	 * @ui5-global-only
	 */
	sap.ui.jsonview = function(sId, vView) {
		return sap.ui.view(sId, vView, ViewType.JSON); // legacy-relevant
	};

	/**
	 * The type of the view used for the <code>sap.ui.view</code> factory
	 * function. This property is used by the parsers to define the specific
	 * view type.
	 * @private
	 */
	JSONView._sType = ViewType.JSON;

	/**
	 * Flag for feature detection of asynchronous loading/rendering.
	 * @public
	 * @readonly
	 * @type {boolean}
	 * @since 1.30
	 */
	JSONView.asyncSupport = true;

	JSONView.prototype.initViewSettings = function(mSettings) {
		if (!mSettings) {
			throw new Error("mSettings must be given");
		}

		// View template handling - no JSON template given
		if (mSettings.viewName && mSettings.viewContent) {
			throw new Error("View name and view content are given. There is no point in doing this, so please decide.");
		} else if (!mSettings.viewName && !mSettings.viewContent) {
			throw new Error("Neither view name nor view content is given. One of them is required.");
		}

		var that = this;
		var fnInitModel = function() {
			if ((that._oJSONView.resourceBundleName || that._oJSONView.resourceBundleUrl) && (!mSettings.models || !mSettings.models[that._oJSONView.resourceBundleAlias])) {
				var oModel = new ResourceModel({
					bundleName: that._oJSONView.resourceBundleName,
					bundleUrl: that._oJSONView.resourceBundleUrl,
					async: mSettings.async
				});
				var vBundle = oModel.getResourceBundle();
				// if ResourceBundle was created with async flag vBundle will be a Promise
				if (vBundle instanceof Promise) {
					return vBundle.then(function() {
						that.setModel(oModel, that._oJSONView.resourceBundleAlias);
					});
				}
				that.setModel(oModel, that._oJSONView.resourceBundleAlias);
			}
		};

		if (mSettings.viewName) {
			if (mSettings.async) {
				return this._loadTemplate(mSettings.viewName, {async: true}).then(fnInitModel);
			} else {
				this._loadTemplate(mSettings.viewName);
				fnInitModel();
			}
		} else if (mSettings.viewContent) {
			// keep the content as a pseudo property to make cloning work but without supporting mutation
			// TODO model this as a property as soon as write-once-during-init properties become available
			this.mProperties["viewContent"] = mSettings.viewContent;
			if (typeof mSettings.viewContent === "string") {
				this._oJSONView = JSON.parse(mSettings.viewContent);
				if (!this._oJSONView) { // would lead to errors later on
					throw new Error("error when parsing viewContent: " + mSettings.viewContent);
				}
			} else if (typeof mSettings.viewContent === "object") {
				this._oJSONView = mSettings.viewContent;
			} else {
				throw new Error("viewContent must be a JSON string or object, but is a " + (typeof mSettings.viewContent));
			}
			if (mSettings.async) {
				return Promise.resolve().then(fnInitModel);
			} else {
				fnInitModel();
			}
		} // else does not happen, already checked

	};

	JSONView.prototype.onControllerConnected = function(oController) {
		var that = this;

		// use preprocessors to fix IDs, associations and event handler references
		ManagedObject.runWithPreprocessors(function() {
				// parse
				that.applySettings({ content : that._oJSONView.content}, oController);
			},

			{
				// preprocessors
				id : function(sId) {
					// prefix only if prefix doesn't exist already. Avoids double prefixes
					// for composite components (now done in createId)
					return that.createId(sId);
				},
				// preprocess 'mSettings' for setting the controller as Listener for defined events
				// => make sure to store old preprocessor in case of nested views
				settings : function(oSettings) {
					var oMetadata = this.getMetadata(),
					aValidKeys = oMetadata.getJSONKeys(), // UID names required, they're part of the documented contract
					sKey, oValue, oKeyInfo;
					for (sKey in oSettings) {
						// get info object for the key
						if ( (oKeyInfo = aValidKeys[sKey]) !== undefined ) {
							oValue = oSettings[sKey];
							switch (oKeyInfo._iKind) {
							case 3: // SINGLE ASSOCIATIONS
								// prefix the association ids with the view id
								if ( typeof oValue === "string" ) {
									oSettings[sKey] = that.createId(oValue);
								}
								break;
							case 5: // EVENTS
								if ( typeof oValue === "string" ) {
									oSettings[sKey] = EventHandlerResolver.resolveEventHandler(oValue, oController);
								}
								break;
							}
						}
					}
				}
			});

	};

	/**
	 * Loads and returns the template from a given URL.
	 *
	 * @param {string} sTemplateName The name of the template
	 * @param {object} [mOptions] with view settings
	 * @param {boolean} [mOptions.async=false] whether the action should be performed asynchronously
	 * @return {string|Promise} the template data, or a Promise resolving with it when async
	 * @private
	 */
	JSONView.prototype._loadTemplate = function(sTemplateName, mOptions) {
		var sResourceName = sTemplateName.replace(/\./g, "/") + ".view.json";
		if (!mOptions || !mOptions.async) {
			this._oJSONView = LoaderExtensions.loadResource(sResourceName);
		} else {
			var that = this;
			return LoaderExtensions.loadResource(sResourceName, mOptions).then(function(oJSONView) {
				that._oJSONView = oJSONView;
			});
		}
	};

	JSONView.prototype.getControllerName = function() {
		return this._oJSONView.controllerName;
	};


	return JSONView;

});