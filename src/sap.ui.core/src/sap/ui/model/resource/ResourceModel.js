/*!
 * ${copyright}
 */

/*global Promise *///declare unusual global vars for JSLint/SAPUI5 validation

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
	function(BindingMode, Model, ResourcePropertyBinding, ResourceBundle, Log) {
	"use strict";


	/**
	 * Constructor for a new ResourceModel.
	 *
	 * @class Model implementation for resource bundles.
	 *
	 * This model allows to bind control or <code>ManagedObject</code> properties against translatable texts.
	 * Its data is taken from a {@link module:sap/base/i18n/ResourceBundle} and it only supports property bindings,
	 * no aggregation or tree bindings.
	 *
	 * In contrast to most other models, binding paths for a <code>ResourceModel</code> must not start with a slash,
	 * they are absolute by default and there's no further structure. Each key in the underlying resource bundle
	 * is a valid binding path.
	 *
	 * To allow extensibility scenarios, the texts of the resource bundle can be {@link #enhance enhanced} with
	 * additional resource bundles. These additional bundles can define new texts for existing keys, texts for new
	 * keys, or both. When texts for existing keys are replaced, the latest enhancement wins.
	 *
	 * This model supports the binding modes <code>OneWay</code> and <code>OneTime</code>, but not <code>TwoWay</code>.
	 * When the recommended asynchronous loading of the bundle is used, binding mode <code>OneTime</code> can't be used.
	 *
	 * @extends sap.ui.model.Model
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @param {object} oData
	 *                     Parameters used to initialize the <code>ResourceModel</code>; at least one of <code>bundle</code>,
	 *                     <code>bundleName</code> or <code>bundleUrl</code> must be set; if more than one property is set,
	 *                     they will be evaluated in the mentioned order
	 * @param {string} [oData.bundleUrl]
	 *                     URL pointing to the base .properties file of a bundle (.properties file without any locale
	 *                     information, e.g. "../../i18n/mybundle.properties"); relative URLs will be evaluated relative
	 *                     to the document.baseURI
	 * @param {string} [oData.bundleName]
	 *                     UI5 module name in dot notation referring to the base .properties file; this name will be
	 *                     resolved to a path like the paths of normal UI5 modules and ".properties" will then be
	 *                     appended (e.g. a name like "myapp.i18n.myBundle" can be given); relative module names are
	 *                     not supported
	 * @param {string} [oData.bundleLocale]
	 *                     A locale in "BCP-47 language tag" notation specifying the locale in which to load the bundle;
	 *                     when not given, the current session locale of UI5 will be used (recommended)
	 * @param {(module:sap/base/i18n/ResourceBundle|jQuery.sap.util.ResourceBundle)} [oData.bundle]
	 *                     A resource bundle instance; when given, this bundle will be used instead of creating a bundle
	 *                     from the provided <code>bundleUrl</code>, <code>bundleName</code> and <code>bundleLocale</code>
	 *                     properties. However, to support reloading the bundle when the current session locale changes,
	 *                     the corresponding <code>bundleName</code> or <code>bundleUrl</code> should be specified if known.
	 *                     Otherwise, the bundle is not updated on locale changes.
	 * @param {boolean} [oData.async=false]
	 *                     Whether the language bundle should be loaded asynchronously.
	 * @param {sap.ui.model.BindingMode} [oData.defaultBindingMode=OneWay]
	 *                     The default binding mode to use; can be <code>OneWay</code> or <code>OneTime</code>
	 *                     (only when sync loading is used); the <code>TwoWay</code> mode is not supported
	 * @param {Array.<(module:sap/base/i18n/ResourceBundle|jQuery.sap.util.ResourceBundle)>} [oData.enhanceWith]
	 *                     Optional list of resource bundles that should enhance the texts from the main bundle;
	 *                     intended for extensibility scenarios, also see the class documentation.
	 * @public
	 * @alias sap.ui.model.resource.ResourceModel
	 */
	var ResourceModel = Model.extend("sap.ui.model.resource.ResourceModel", /** @lends sap.ui.model.resource.ResourceModel.prototype */ {

		constructor : function(oData) {
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
					this._pEnhanced = oData.enhanceWith.reduce(function(chain, bundle) {
						return chain.then(this.enhance.bind(this, bundle));
					}.bind(this), Promise.resolve());
				} else {
					oData.enhanceWith.forEach(this.enhance.bind(this));
				}
			}

		},

		metadata : {
			publicMethods : [ "getResourceBundle" ]
		}

	});

	/**
	 * Returns the resource bundle
	 *
	 * @param {object} oData
	 * @param {object} bAsync whether the resource bundle should be loaded asynchronously
	 * @returns {jQuery.sap.util.ResourceBundle|Promise} loaded resource bundle or Promise in async case
	 * @private
	 * @ui5-restricted sap.ui.core.Component
	 */
	ResourceModel.loadResourceBundle = function(oData, bAsync) {
		var oConfiguration = sap.ui.getCore().getConfiguration(),
			oRb, sUrl, sLocale, bIncludeInfo;
		sLocale = oData.bundleLocale;
		if (!sLocale) {
			sLocale = oConfiguration.getLanguage();
		}
		bIncludeInfo = oConfiguration.getOriginInfo();
		sUrl = _getUrl(oData.bundleUrl, oData.bundleName);
		oRb = ResourceBundle.create({url: sUrl, locale: sLocale, includeInfo: bIncludeInfo, async: bAsync});
		return oRb;
	};

	/**
	 * Enhances the resource model with a custom resource bundle.
	 *
	 * The custom bundle can define new texts for keys existing in the main bundle, texts for new keys, or both.
	 * A resource model can be enhanced with multiple resource bundles by calling this
	 * method multiple times. Each call appends to the list of enhancements, but no bundle can be removed from
	 * the list.
	 *
	 * When looking up a text for a key, the enhancements are processed in reverse order. Texts from the last
	 * added resource bundle are preferred over texts from previously added bundles or texts from the main bundle.
	 *
	 * @param {(module:sap/base/i18n/ResourceBundle|jQuery.sap.util.ResourceBundle|object)} oData
	 *                     Either an already loaded bundle instance, or a configuration object with parameters to load
	 *                     a new resource bundle. When a configuration object is given, at least one of <code>bundleUrl</code>
	 *                     or <code>bundleName</code> must be set; if both are set, <code>bundleName</code> wins
	 * @param {string} [oData.bundleUrl]
	 *                     URL pointing to the base .properties file of a bundle (.properties file without any locale
	 *                     information, e.g. "../../i18n/mybundle.properties"); relative URLs will be evaluated
	 *                     relative to the document.baseURI
	 * @param {string} [oData.bundleName]
	 *                     UI5 module name in dot notation, referring to the base .properties file; this name will be
	 *                     resolved to a path like the paths of normal UI5 modules, and ".properties" will then be
	 *                     appended (e.g. a name like "myapp.i18n.myBundle" can be given); relative module names are
	 *                     not supported
	 * @param {string} [oData.bundleLocale]
	 *                     A locale in "BCP-47 language tag" notation specifying the locale in which to load the bundle;
	 *                     when not given, the current session locale of UI5 will be used (recommended)
	 * @returns {Promise} A Promise when this <code>ResourceModel</code> configured to act asynchronously, null otherwise;
	 *                     the Promise resolves when the enhancement is finished
	 * @since 1.16.1
	 * @public
	 */
	ResourceModel.prototype.enhance = function(oData) {
		var that = this,
			fResolve,
			oPromise = this.bAsync ? new Promise(function(resolve){
				fResolve = resolve;
			}) : null;

		function doEnhance(){
			if (oData instanceof ResourceBundle) {
				that._oResourceBundle._enhance(oData);
				that.checkUpdate(true);
				if (oPromise) {
					fResolve(true);
				}
			} else {
				var bundle = ResourceModel.loadResourceBundle(oData, that.bAsync);

				if (bundle instanceof Promise) {
					bundle.then(function(customBundle){
						that._oResourceBundle._enhance(customBundle);
						that.checkUpdate(true);
						fResolve(true);
					}, function(){
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
	 * @see sap.ui.model.Model.prototype.bindProperty
	 *
	 */
	ResourceModel.prototype.bindProperty = function(sPath) {
		var oBinding = new ResourcePropertyBinding(this, sPath);
		return oBinding;
	};

	/**
	 * Returns the value for the property with the given <code>sPropertyName</code>
	 *
	 * @param {string} sPath the path to the property
	 * @returns {string} the value of the property
	 * @public
	 */
	ResourceModel.prototype.getProperty = function(sPath) {
		return this._oResourceBundle ? this._oResourceBundle.getText(sPath) : null;
	};

	/**
	 * Returns the resource bundle of this model.
	 *
	 * @returns {(module:sap/base/i18n/ResourceBundle|Promise<module:sap/base/i18n/ResourceBundle>)}
	 *              loaded resource bundle or a Promise on it in asynchronous case
	 * @public
	 */
	ResourceModel.prototype.getResourceBundle = function() {
		if (!this.bAsync) {
			return this._oResourceBundle;
		} else {
			var p = this._oPromise;
			if (p) {
				return new Promise(function(resolve, reject){
					function _resolve(oBundle){
						resolve(oBundle);
					}
					p.then(_resolve, _resolve);
				});
			} else {
				return Promise.resolve(this._oResourceBundle);
			}
		}
	};

	ResourceModel.prototype._handleLocalizationChange = function() {
		_load(this);
	};

	/**
	 * reapplies all enhancements after localization changes
	 * @private
	 */
	ResourceModel.prototype._reenhance = function() {
		this.bReenhance = true;
		this.aCustomBundles.forEach(function(oData) {
			this.enhance(oData);
		}.bind(this));
		this.bReenhance = false;
	};

	function _load(oModel) {
		var oData = oModel.oData;

		if (oData && (oData.bundleUrl || oData.bundleName)) {
			var res = ResourceModel.loadResourceBundle(oData, oData.async);
			if (res instanceof Promise) {
				var oEventParam = {url: _getUrl(oData.bundleUrl, oData.bundleName), async: true};
				oModel.fireRequestSent(oEventParam);
				oModel._oPromise = res;
				oModel._oPromise.then(function(oBundle){
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

	function _getUrl(bundleUrl, bundleName){
		var sUrl = bundleUrl;
		if (bundleName) {
			// Starting slashes or dots are removed to prevent a leading-slash error thrown through the sap.ui.require.toUrl function call.
			if (/^\/|^\./.test(bundleName)){
				Log.error('Incorrect resource bundle name "' + bundleName + '"',
				'Leading slashes or dots in resource bundle names are ignored, since such names are invalid UI5 module names. Please check whether the resource model "' + bundleName + '" is actually needed by your application.',
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