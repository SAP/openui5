/*!
 * ${copyright}
 */

// Provides control sap.ui.core.mvc.HTMLView.
sap.ui.define([
	'./View',
	'./HTMLViewRenderer',
	'./ViewType',
	'sap/base/util/merge',
	'sap/ui/base/ManagedObject',
	'sap/ui/base/OwnStatics',
	'sap/ui/core/DeclarativeSupport',
	'sap/ui/model/resource/ResourceModel',
	'sap/base/util/LoaderExtensions'
],
	function(
		View,
		HTMLViewRenderer,
		ViewType,
		merge,
		ManagedObject,
		OwnStatics,
		DeclarativeSupport,
		ResourceModel,
		LoaderExtensions
	) {
	"use strict";

	const { runWithPreprocessors } = OwnStatics.get(ManagedObject);

	/**
	 * Constructor for a new <code>HTMLView</code>.
	 *
	 * <strong>Note:</strong> Application code shouldn't call the constructor directly, but rather use the factory
	 * {@link sap.ui.core.mvc.HTMLView.create HTMLView.create} or {@link sap.ui.core.mvc.View.create View.create}
	 * with type {@link sap.ui.core.mvc.ViewType.HTML HTML}. The factory simplifies asynchronous loading of a view
	 * and future features might be added to the factory only.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A view defined/constructed by declarative HTML.
	 * @extends sap.ui.core.mvc.View
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.9.2
	 * @alias sap.ui.core.mvc.HTMLView
	 * @deprecated Since version 1.108, as there are no more known usages of <code>HTMLViews</code>,
	 *    and as the use of HTML as syntax does not bring any advantages over XML. The HTML necessary for
	 *    the <code>HTMLView</code> is not re-used for the HTML of the controls, but is fully replaced.
	 *
	 *    Consider using {@link sap.ui.core.mvc.XMLView XMLViews} or "typed views" (view classes
	 *    written in JavaScript) instead. For more information, see the documentation on
	 *    {@link topic:91f27e3e6f4d1014b6dd926db0e91070 View types}.
	 */
	var HTMLView = View.extend("sap.ui.core.mvc.HTMLView", /** @lends sap.ui.core.mvc.HTMLView.prototype */ {
		metadata : {
			library : "sap.ui.core",
			deprecated: true
		},
		renderer: HTMLViewRenderer
	});



	/**
	 * Creates an instance of a declarative HTML view.
	 *
	 * @param {object} oOptions An object containing the view configuration options.
	 * @param {string} [oOptions.id] Specifies an ID for the view instance. If no ID is given, an ID will be generated.
	 * @param {string} [oOptions.viewName] Name of the view resource in module name notation (without suffix)
	 * @param {string} [oOptions.definition] The view definition.
	 * @param {sap.ui.core.mvc.Controller} [oOptions.controller] Controller instance to be used for this view.
	 * The given controller instance overrides the controller defined in the view definition. Sharing a controller instance
	 * between multiple views is not supported.
	 * @public
	 * @static
	 * @since 1.56.0
	 * @return {Promise<sap.ui.core.mvc.HTMLView>} A promise which resolves with the created <code>HTMLView</code> instance
	 */
	HTMLView.create = function(oOptions) {
		var mParameters = merge({}, oOptions);
		mParameters.type = ViewType.HTML;
		return View.create(mParameters);
	};

	/**
	 * Defines or creates an instance of a declarative HTML view.
	 *
	 * The behavior of this method depends on the signature of the call and on the current context.
	 *
	 * <ul>
	 * <li>View Definition <code>sap.ui.htmlview(sId, vView)</code>: Defines a view of the given name with the given
	 * implementation. sId must be the views name, vView must be an object and can contain
	 * implementations for any of the hooks provided by HTMLView</li>
	 * <li>View Instantiation <code>sap.ui.htmlview(sId?, vView)</code>: Creates an instance of the view with the given name (and id)</li>.
	 * </ul>
	 *
	 * Any other call signature will lead to a runtime error. If the id is omitted in the second variant, an id will
	 * be created automatically.
	 *
	 * @param {string} [sId] id of the newly created view, only allowed for instance creation
	 * @param {string | object} vView name or implementation of the view.
	 * @param {boolean} [vView.async] whether the view source is loaded asynchronously
	 * @public
	 * @static
	 * @deprecated Since 1.56. Use {@link sap.ui.core.mvc.HTMLView.create HTMLView.create} to create view instances
	 * @return {sap.ui.core.mvc.HTMLView | undefined} the created HTMLView instance in the creation case, otherwise undefined
	 * @ui5-global-only
	 */
	sap.ui.htmlview = function(sId, vView) {
		return sap.ui.view(sId, vView, ViewType.HTML); // legacy-relevant
	};

	/**
	 * The type of the view used for the <code>sap.ui.view</code> factory
	 * function. This property is used by the parsers to define the specific
	 * view type.
	 * @private
	 */
	HTMLView._sType = ViewType.HTML;

	/**
	 * Flag for feature detection of asynchronous loading/rendering
	 * @public
	 * @readonly
	 * @type {boolean}
	 * @since 1.30
	 */
	HTMLView.asyncSupport = true;

	/**
	 * The template cache. Templates are only loaded once.
	 *
	 * @private
	 * @static
	 */
	HTMLView._mTemplates = {};

	/**
	 * A map with the allowed settings for the view.
	 *
	 * @private
	 * @static
	 */
	HTMLView._mAllowedSettings = {
			"viewName" : true,
			"controller" : true,
			"viewContent" : true,
			"definition" : true,
			"controllerName" : true,
			"resourceBundleName" : true,
			"resourceBundleUrl" : true,
			"resourceBundleLocale" : true,
			"resourceBundleAlias" : true
	};

	/**
	 * Loads and returns a template for the given template name. Templates are only loaded once {@link sap.ui.core.mvc.HTMLView._mTemplates}.
	 *
	 * @param {string} sTemplateName The name of the template
	 * @param {object} mOptions configuration options
	 * @param {boolean} [mOptions.async=false] whether the action should be performed asynchronously
	 * @return {string|Promise} the template data, or a Promise resolving with it when async
	 * @private
	 * @static
	 */
	HTMLView._getTemplate = function(sTemplateName, mOptions) {
		var sUrl = this._getViewUrl(sTemplateName);
		var sHTML = this._mTemplates[sUrl];

		if (!sHTML) {
			sHTML = this._loadTemplate(sTemplateName, mOptions);
			// TODO discuss
			// a) why caching at all (more precise: why for HTMLView although we refused to do it for other view types - risk of a memory leak!)
			// b) why cached via URL instead of via name? Any special scenario in mind?
			if (mOptions && mOptions.async) {
				var that = this;
				return sHTML.then(function(_sHTML) {
					that._mTemplates[sUrl] = _sHTML;
					return Promise.resolve(_sHTML);
				});
			} else {
				this._mTemplates[sUrl] = sHTML;
			}
		}
		return mOptions.async ? Promise.resolve(sHTML) : sHTML;
	};

	/**
	 * Abstract method implementation. Returns the name of the controller.
	 * @return {string} the name of the set controller. Returns undefined when no controller is set.
	 * @private
	 */
	HTMLView.prototype.getControllerName = function() {
		return this._controllerName;
	};

	/**
	 * Returns the view URL for a given template name in respect of the module path.
	 *
	 * @param {string} sTemplateName The name of the template
	 * @return {string} the view url
	 * @private
	 * @static
	 */
	HTMLView._getViewUrl = function(sTemplateName) {
		return sap.ui.require.toUrl(sTemplateName.replace(/\./g, "/")) + ".view.html";
	};

	/**
	 * Loads and returns the template from a given URL.
	 *
	 * @param {string} sTemplateName The name of the template
	 * @param {object} [mOptions] configuration options
	 * @param {boolean} [mOptions.async=false] whether the action should be performed asynchronously
	 * @return {string|Promise} the template data, or a Promise resolving with it when async
	 * @private
	 * @static
	 */
	HTMLView._loadTemplate = function(sTemplateName, mOptions) {
		var sResourceName = sTemplateName.replace(/\./g, "/") + ".view.html";
		return LoaderExtensions.loadResource(sResourceName, mOptions);
	};

	/**
	 * Abstract method implementation.
	 *
	 * @see sap.ui.core.mvc.View#initViewSettings
	 *
	 * @private
	 */
	HTMLView.prototype.initViewSettings = function (mSettings) {
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
		function fnInitViewSettings() {
			that._oTemplate = document.createElement("div");

			if (typeof vHTML === "string") {
				that._oTemplate.innerHTML = vHTML;
			} else {
				var oNodeList = vHTML;
				var oFragment = document.createDocumentFragment();
				for (var i = 0; i < oNodeList.length;i++) {
					oFragment.appendChild(oNodeList.item(i));
				}
				that._oTemplate.appendChild(oFragment);
			}

			var oMetaElement = that._oTemplate.getElementsByTagName("template")[0];
			var oProperties = that.getMetadata().getAllProperties();

			if (oMetaElement) {
				var aAttributes = oMetaElement.getAttributeNames();
				for (var j = 0; j < aAttributes.length; j++) {
					var sAttributeName = aAttributes[j];
					var sSettingName = DeclarativeSupport.convertAttributeToSettingName(sAttributeName, that.getId());
					var sValue = oMetaElement.getAttribute(sAttributeName);
					var oProperty = oProperties[sSettingName];
					if (!mSettings[sSettingName]) {
						if (oProperty) {
							mSettings[sSettingName] = DeclarativeSupport.convertValueToType(DeclarativeSupport.getPropertyDataType(oProperty),sValue);
						} else if (HTMLView._mAllowedSettings[sSettingName]) {
							mSettings[sSettingName] = sValue;
						}
					}
				}
				that._oTemplate = oMetaElement;
			}

			// that is a fix for browsers that support web components
			if (that._oTemplate.content) {
				var oFragment = that._oTemplate.content;
				// Create a new template, as innerHTML would be empty for TemplateElements when the fragment is appended directly
				that._oTemplate = document.createElement("div");
				// Make the shadow DOM available in the DOM
				that._oTemplate.appendChild(oFragment);
			}

			if (mSettings.controllerName) {
				that._controllerName = mSettings.controllerName;
			}
			if ((mSettings.resourceBundleName || mSettings.resourceBundleUrl) && (!mSettings.models || !mSettings.models[mSettings.resourceBundleAlias])) {
				var oModel = new ResourceModel({
					bundleName: mSettings.resourceBundleName,
					bundleUrl: mSettings.resourceBundleUrl,
					bundleLocale: mSettings.resourceBundleLocale,
					async: mSettings.async
				});
				var vBundle = oModel.getResourceBundle();
				// if ResourceBundle was created with async flag vBundle will be a Promise
				if (vBundle instanceof Promise) {
					return vBundle.then(function() {
						that.setModel(oModel, mSettings.resourceBundleAlias);
					});
				}
				that.setModel(oModel, mSettings.resourceBundleAlias);
			}
		}

		var vHTML = mSettings.viewContent;

		if (!vHTML) {
			// vHTML could be a promise if {async: true}
			vHTML = HTMLView._getTemplate(mSettings.viewName, {async: mSettings.async});
		}

		if (mSettings.async) {
			// return the promise
			return vHTML.then(function(_vHTML) {
				vHTML = _vHTML;
				return fnInitViewSettings();
			});
		}

		fnInitViewSettings();
	};

	/**
	 * Abstract method implementation.
	 *
	 * @see sap.ui.core.mvc.View#onControllerConnected
	 *
	 * @private
	 */
	HTMLView.prototype.onControllerConnected = function(oController) {
		// unset any preprocessors (e.g. from an enclosing HTML view)
		var that = this;
		runWithPreprocessors(function() {
			DeclarativeSupport.compile(that._oTemplate, that);
		}, {
			settings: this._fnSettingsPreprocessor
		});
	};

	/**
	 * Called when the control is destroyed. Use this one to free resources and finalize activities.
	 */
	HTMLView.prototype.exit = function() {
		this._oTemplate = null;
		View.prototype.exit.call(this);
		// Destroy all unassociated controls that are connected with the view
		if (this._connectedControls) {
			for (var i = 0; i < this._connectedControls.length; i++) {
				this._connectedControls[i].destroy();
			}
			this._connectedControls = null;
		}
	};

	/**
	 * Internal method to connect unassociated controls to the view. All controls will be destroyed when the view is destroyed.
	 *
	 * @param {sap.ui.core.Control} oControl reference to a Control
	 * @private
	 */
	HTMLView.prototype.connectControl = function(oControl) {
		this._connectedControls = this._connectedControls || [];
		this._connectedControls.push(oControl);
	};

	return HTMLView;
});