/*!
 * ${copyright}
 */
/**
 * ResourceBundle-based DataBinding
 *
 * @namespace
 * @name sap.ui.model.resource
 * @public
 */

// Provides the resource bundle based model implementation
sap.ui.define([
	'sap/ui/model/BindingMode',
	'sap/ui/model/Model',
	'./ResourcePropertyBinding',
	"sap/base/i18n/ResourceBundle",
	"sap/base/Log"
],
	function (BindingMode, Model, ResourcePropertyBinding, ResourceBundle, Log) {
	"use strict";


	/**
	 * Constructor for a new ResourceModel.
	 *
	 * @param {object} oData
	 *   Parameters used to initialize the <code>ResourceModel</code>; at least one of
	 *   <code>bundle</code>, <code>bundleName</code> or <code>bundleUrl</code> must be set; if more
	 *   than one property is set, they are evaluated in the mentioned order
	 * @param {boolean} [oData.async=false]
	 *   Whether the language bundle should be loaded asynchronously
	 * @param {module:sap/base/i18n/ResourceBundle} [oData.bundle]
	 *   A resource bundle instance; when given, this bundle is used instead of creating a bundle
	 *   from the provided <code>bundleUrl</code>, <code>bundleName</code> and
	 *   <code>bundleLocale</code> properties. However, to support reloading the bundle when the
	 *   current session locale changes, the corresponding <code>bundleName</code> or
	 *   <code>bundleUrl</code> should be specified if known. Otherwise, the bundle is not updated
	 *   on locale changes.
	 * @param {string} [oData.bundleLocale]
	 *   A locale in "BCP-47 language tag" notation specifying the locale in which to load the
	 *   bundle; when not given, the current session locale of UI5 is used (recommended)
	 * @param {string} [oData.bundleName]
	 *   UI5 module name in dot notation referring to the base ".properties" file; this name is
	 *   resolved to a path just as for normal UI5 modules, to which ".properties" is then
	 *   appended (e.g. a name like "myapp.i18n.myBundle" can be given); relative module names are
	 *   not supported
	 * @param {string} [oData.bundleUrl]
	 *   URL pointing to the base ".properties" file of a bundle (".properties" file without any
	 *   locale information, e.g. "../../i18n/mybundle.properties"); relative URLs are evaluated
	 *   relative to the document.baseURI
	 * @param {sap.ui.model.BindingMode} [oData.defaultBindingMode=OneWay]
	 *   The default binding mode to use; it can be <code>OneWay</code> or <code>OneTime</code>
	 *   (only when synchronous loading is used); the <code>TwoWay</code> mode is not supported
	 * @param {module:sap/base/i18n/ResourceBundle[]} [oData.enhanceWith]
	 *   Optional list of resource bundles that enhance the texts from the main bundle; intended for
	 *   extensibility scenarios; also see the class documentation.
	 *
	 * @alias sap.ui.model.resource.ResourceModel
	 * @author SAP SE
	 * @class Model implementation for resource bundles.
	 *
	 * This model allows to bind control properties against translatable texts. Its data is taken
	 * from a {@link module:sap/base/i18n/ResourceBundle} and it only supports property bindings.
	 *
	 * In contrast to most other models, binding paths for a <code>ResourceModel</code> must not
	 * start with a slash; they are absolute by default, and there's no further structure. Each key
	 * in the underlying resource bundle is a valid binding path.
	 *
	 * In extensibility scenarios, the texts of the resource bundle can be {@link #enhance enhanced}
	 * with additional resource bundles. These additional bundles can define new texts for existing
	 * keys, texts for new keys, or both. When texts for existing keys are replaced, the latest
	 * enhancement wins.
	 *
	 * This model supports the binding modes <code>OneWay</code> and <code>OneTime</code>, but not
	 * <code>TwoWay</code>. When the recommended asynchronous loading of the bundle is used, binding
	 * mode <code>OneTime</code> can't be used.
	 *
	 * @extends sap.ui.model.Model
	 * @public
	 * @version ${version}
	 */
	var ResourceModel = Model.extend("sap.ui.model.resource.ResourceModel", /** @lends sap.ui.model.resource.ResourceModel.prototype */ {

		constructor : function (oData) {
			Model.apply(this, arguments);

			this.aCustomBundles = [];

			this.bReenhance = false;

			this.bAsync = !!(oData && oData.async);

			this.sDefaultBindingMode = oData.defaultBindingMode || BindingMode.OneWay;

			this.mSupportedBindingModes = {
				"OneWay" : true,
				"TwoWay" : false,
				"OneTime" : !this.bAsync
			};

			if (this.bAsync && this.sDefaultBindingMode == BindingMode.OneTime) {
				Log.warning("Using binding mode OneTime for asynchronous ResourceModel is not supported!");
			}

			this.oData = oData;

			if (oData && oData.bundle) {
				this._oResourceBundle = oData.bundle;
			} else if (oData && (oData.bundleUrl || oData.bundleName)) {
				_load(this);
			} else {
				throw new Error("At least bundle, bundleName or bundleUrl must be provided!");
			}

			if (oData && Array.isArray(oData.enhanceWith) && oData.enhanceWith.length > 0) {
				if (this.bAsync) {
					this._pEnhanced = oData.enhanceWith.reduce(function (chain, bundle) {
						return chain.then(this.enhance.bind(this, bundle));
					}.bind(this), Promise.resolve());
				} else {
					oData.enhanceWith.forEach(this.enhance.bind(this));
				}
			}

		}
	});

	/**
	 * Returns the resource bundle or a promise resolving with the resource bundle.
	 *
	 * @param {object} oData
	 *   Parameters used to load the resource bundle; see constructor of the
	 *   {@link sap.ui.model.resource.ResourceModel}
	 * @param {string} [oData.bundleLocale]
	 *   A locale in "BCP-47 language tag" notation specifying the locale in which to load the
	 *   bundle; when not given, the current session locale of UI5 is used (recommended)
	 * @param {string} [oData.bundleName]
	 *   UI5 module name in dot notation referring to the base ".properties" file
	 * @param {string} [oData.bundleUrl]
	 *   URL pointing to the base ".properties" file of a bundle
	 * @param {object} bAsync
	 *   Whether the resource bundle should be loaded asynchronously
	 * @returns {module:sap/base/i18n/ResourceBundle|Promise<module:sap/base/i18n/ResourceBundle>}
	 *   Loaded resource bundle or <code>Promise</code> resolving with the resource bundle in async
	 *   case
	 *
	 * @private
	 * @ui5-restricted sap.ui.core.Component
	 */
	ResourceModel.loadResourceBundle = function (oData, bAsync) {
		var oConfiguration = sap.ui.getCore().getConfiguration(),
			sLocale = oData.bundleLocale;

		if (!sLocale) {
			sLocale = oConfiguration.getLanguage();
		}

		return ResourceBundle.create({
			async: bAsync,
			includeInfo: oConfiguration.getOriginInfo(),
			locale: sLocale,
			url: _getUrl(oData.bundleUrl, oData.bundleName)
		});
	};

	/**
	 * Enhances the resource model with a custom resource bundle.
	 *
	 * The custom bundle can define new texts for keys existing in the main bundle, texts for new
	 * keys, or both. A resource model can be enhanced with multiple resource bundles by calling
	 * this method multiple times. Each call appends to the list of enhancements, but no bundle can
	 * be removed from the list.
	 *
	 * When looking up a text for a key, the enhancements are processed in reverse order. Texts from
	 * the last added resource bundle are preferred over texts from previously added bundles or
	 * texts from the main bundle.
	 *
	 * @param {module:sap/base/i18n/ResourceBundle|object} oData
	 *   Either an already loaded bundle instance, or a configuration object with parameters to load
	 *   a new resource bundle. When a configuration object is given, at least one of
	 *   <code>bundleUrl</code> or <code>bundleName</code> must be set; if both are set,
	 *   <code>bundleName</code> wins
	 * @param {string} [oData.bundleLocale]
	 *   A locale in "BCP-47 language tag" notation specifying the locale in which to load the
	 *   bundle; when not given, the current session locale of UI5 is used (recommended)
	 * @param {string} [oData.bundleName]
	 *   UI5 module name in dot notation, referring to the base ".properties" file; this name is
	 *   resolved to a path like the paths of normal UI5 modules, and ".properties" is then
	 *   appended (e.g. a name like "myapp.i18n.myBundle" can be given); relative module names are
	 *   not supported
	 * @param {string} [oData.bundleUrl]
	 *   URL pointing to the base ".properties" file of a bundle (".properties" file without any
	 *   locale information, e.g. "../../i18n/mybundle.properties"); relative URLs are evaluated
	 *   relative to the document.baseURI
	 * @returns {Promise} A Promise resolving when the enhancement is finished or <code>null</code>
	 *   if the <code>ResourceModel</code> is configured to act synchronously
	 * @since 1.16.1
	 * @public
	 */
	ResourceModel.prototype.enhance = function (oData) {
		var that = this,
			fResolve,
			oPromise = this.bAsync ? new Promise(function (resolve) {
				fResolve = resolve;
			}) : null;

		function doEnhance() {
			if (oData instanceof ResourceBundle) {
				that._oResourceBundle._enhance(oData);
				that.checkUpdate(true);
				if (oPromise) {
					fResolve(true);
				}
			} else {
				var bundle = ResourceModel.loadResourceBundle(oData, that.bAsync);

				if (bundle instanceof Promise) {
					bundle.then(function (customBundle) {
						that._oResourceBundle._enhance(customBundle);
						that.checkUpdate(true);
						fResolve(true);
					}, function () {
						fResolve(true);
					});
				} else if (bundle) {
					that._oResourceBundle._enhance(bundle);
					that.checkUpdate(true);
				}
			}
		}

		if (this._oPromise) {
			Promise.resolve(this._oPromise).then(doEnhance);
		} else {
			doEnhance();
		}
		if (!this.bReenhance) {
			this.aCustomBundles.push(oData);
		}
		return oPromise;
	};

	/**
	 * Gets a property binding for the given path in the resource model. Only <code>sPath</code>
	 * from {@link sap.ui.model.Model#bindProperty} is supported; other parameters are ignored.
	 *
	 * @param {string} sPath
	 *   The path pointing to the property that should be bound; in contrast to most other models,
	 *   the binding path for a <code>ResourceModel</code> must not start with a slash, it is
	 *   absolute by default and there's no further structure. Each key in the underlying resource
	 *   bundle is a valid binding path.
	 * @return {sap.ui.model.PropertyBinding}
	 *   The property binding for the given path
	 *
	 * @public
	 */
	ResourceModel.prototype.bindProperty = function (sPath) {
		return new ResourcePropertyBinding(this, sPath);
	};

	/**
	 * Returns the value for the property with the given path.
	 *
	 * @param {string} sPath
	 *   The path to the property
	 * @returns {string}
	 *   The value of the property in the resource bundle or <code>null</code> if resource bundle is
	 *   not available
	 *
	 * @public
	 */
	ResourceModel.prototype.getProperty = function (sPath) {
		return this._oResourceBundle ? this._oResourceBundle.getText(sPath) : null;
	};

	/**
	 * Gets the resource bundle of this model.
	 *
	 * @returns {(module:sap/base/i18n/ResourceBundle|Promise<module:sap/base/i18n/ResourceBundle>)}
	 *   The loaded resource bundle or a Promise resolving with it in asynchronous case
	 *
	 * @public
	 */
	ResourceModel.prototype.getResourceBundle = function () {
		if (!this.bAsync) {
			return this._oResourceBundle;
		} else {
			var p = this._oPromise;
			if (p) {
				return new Promise(function (resolve, reject) {
					function _resolve(oBundle) {
						resolve(oBundle);
					}
					p.then(_resolve, _resolve);
				});
			} else {
				return Promise.resolve(this._oResourceBundle);
			}
		}
	};

	/**
	 * Reload resource bundle if current session locale changes. In that case
	 * <code>bundleName</code> or <code>bundleUrl</code> have to be specified.
	 *
	 * @private
	 * @see sap.ui.base.ManagedObject#_handleLocalizationChange
	 */
	ResourceModel.prototype._handleLocalizationChange = function () {
		_load(this);
	};

	/**
	 * Re-applies all enhancements after localization changed; <code>bundleName</code> or
	 * <code>bundleUrl</code> have to be specified.
	 *
	 * @private
	 * @see sap.ui.model.resource.ResourceModel#enhance
	 */
	ResourceModel.prototype._reenhance = function () {
		this.bReenhance = true;
		this.aCustomBundles.forEach(function (oData) {
			this.enhance(oData);
		}.bind(this));
		this.bReenhance = false;
	};

	/**
	 * Loads the resource bundle of the given resource model.
	 *
	 * @param {sap.ui.model.resource.ResourceModel} oModel The resource model instance
	 *
	 * @private
	 */
	function _load(oModel) {
		var oData = oModel.oData;

		if (oData && (oData.bundleUrl || oData.bundleName)) {
			var res = ResourceModel.loadResourceBundle(oData, oData.async);
			if (res instanceof Promise) {
				var oEventParam = {url: _getUrl(oData.bundleUrl, oData.bundleName), async: true};
				oModel.fireRequestSent(oEventParam);
				oModel._oPromise = res;
				oModel._oPromise.then(function (oBundle) {
					oModel._oResourceBundle = oBundle;
					oModel._reenhance();
					delete oModel._oPromise;
					oModel.checkUpdate(true);
					oModel.fireRequestCompleted(oEventParam);
				});
			} else {
				oModel._oResourceBundle = res;
				oModel._reenhance();
				oModel.checkUpdate(true);
			}
		}
	}

	/**
	 * Gets the URL either from the given resource bundle name or the given resource bundle URL.
	 *
	 * @param {string} [bundleUrl]
	 *   URL pointing to the base ".properties" file of a bundle (".properties" file without any
	 *   locale information, e.g. "../../i18n/mybundle.properties"); relative URLs are evaluated
	 *   relative to the document.baseURI
	 * @param {string} [bundleName]
	 *   UI5 module name in dot notation referring to the base ".properties" file; this name is
	 *   resolved to a path like the paths of normal UI5 modules and ".properties" is then
	 *   appended (e.g. a name like "myapp.i18n.myBundle" can be given); relative module names are
	 *   not supported
	 * @returns {string}
	 *   The resource bundle URL
	 *
	 * @private
	 */
	function _getUrl(bundleUrl, bundleName) {
		var sUrl = bundleUrl;
		if (bundleName) {
			// Starting slashes or dots are removed to prevent a leading-slash error thrown through
			// the sap.ui.require.toUrl function call
			if (/^\/|^\./.test(bundleName)) {
				Log.error('Incorrect resource bundle name "' + bundleName + '"',
				'Leading slashes or dots in resource bundle names are ignored, since such names are'
				+ ' invalid UI5 module names. Please check whether the resource model "'
				+ bundleName + '" is actually needed by your application.',
				"sap.ui.model.resource.ResourceModel");
				bundleName = bundleName.replace(/^(?:\/|\.)*/, "");
			}
			bundleName = bundleName.replace(/\./g, "/");
			sUrl = sap.ui.require.toUrl(bundleName) + ".properties";
		}
		return sUrl;
	}
	return ResourceModel;

});