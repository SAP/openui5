/*!
 * ${copyright}
 */
/*eslint-disable max-len */
/**
 * ResourceBundle-based DataBinding
 *
 * @namespace
 * @name sap.ui.model.resource
 * @public
 */

// Provides the resource bundle based model implementation
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/Supportability",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Model",
	"./ResourcePropertyBinding"
], function (Log, ResourceBundle, SyncPromise, Supportability, BindingMode, Model, ResourcePropertyBinding) {
	"use strict";

	var sClassname = "sap.ui.model.resource.ResourceModel",
		rLeadingDotsOrSlashes = /^(?:\/|\.)*/; // matches leading dots or slashes

	/**
	 * Constructor for a new ResourceModel.
	 *
	 * <h3>Declarative Usage</h3>
	 * The ResourceModel can be created using configuration objects instead of
	 * <code>ResourceBundle</code> instances.
	 * This is the recommended way and enables:
	 * <ul>
	 * <li>use of terminologies in the bundle and in the enhancements</li>
	 * <li>a guaranteed order of resolution</li>
	 * </ul>
	 *
	 * <h3>Programmatic Usage</h3>
	 * The ResourceModel can be created in a programmatic manner which means that
	 * <code>ResourceBundle</code> instances are used instead of configurations.
	 * Existing ResourceBundles can either be used in the <code>bundle</code> parameter or in the
	 * <code>enhanceWith</code> array.
	 * Runtime errors are thrown when <code>ResourceBundle</code> instances are used with
	 * <code>terminologies</code>.
	 * Also when using <code>ResourceModel#enhance</code> with <code>terminologies</code>.
	 *
	 * @example <caption>Use ResourceModel with configurations (declarative) and terminologies</caption>
	 *
	 * sap.ui.require(["sap/ui/model/resource/ResourceModel"], function(ResourceModel){
	 *   // ...
	 *   var oResourceModel = new ResourceModel({
	 *      // specify url of the base .properties file
	 *      bundleUrl : "i18n/messagebundle.properties",
	 *      async : true,
	 *      enhanceWith: [
	 *          {
	 *              bundleUrl: "appvar1/i18n/i18n.properties",
	 *              terminologies: {
	 *                  oil: {
	 *                     bundleUrl: "appvar1/i18n/terminologies.oil.i18n.properties",
	 *                     supportedLocales: ["de", "fr"]
	 *                  }
	 *              }
	 *           },
	 *           {
	 *              bundleUrl: "appvar2/i18n/i18n.properties",
	 *              terminologies: {
	 *                  retail: {
	 *                     bundleUrl: "appvar2/i18n/terminologies.retail.i18n.properties",
	 *                     supportedLocales: ["de", "fr"]
	 *                  }
	 *              }
	 *           }
	 *      ],
	 *      supportedLocales: ["de", "fr"],
	 *      fallbackLocale: "de",
	 *      terminologies: {
	 *          oil: {
	 *              bundleUrl: "i18n/terminologies.oil.i18n.properties",
	 *              supportedLocales: ["de", "fr"]
	 *          },
	 *          retail: {
	 *             bundleUrl: "i18n/terminologies.retail.i18n.properties",
	 *             supportedLocales: ["de", "fr"]
	 *          }
	 *      },
	 *      activeTerminologies: ["retail"]
	 *   });
	 *   // ...
	 * });
	 *
	 *

	 *
	 * @example <caption>Use ResourceModel with existing ResourceBundles, terminologies not supported</caption>
	 *
	 * sap.ui.require(["sap/ui/model/resource/ResourceModel", "sap/base/i18n/ResourceBundle"], function(ResourceModel, ResourceBundle){
	 *   // ...
	 *   var oResourceModel = new ResourceModel({
	 *      // specify url of the base .properties file
	 *      bundle : ResourceBundle.create({
	 *          bundleUrl: "i18n/messagebundle.properties",
	 *          supportedLocales: ["de", "fr"]
	 *      }),
	 *      async : true,
	 *      enhanceWith: [
	 *          ResourceBundle.create({
	 *              bundleUrl: "appvar1/i18n/i18n.properties",
	 *              supportedLocales: ["de", "fr"]
	 *           }),
	 *          ResourceBundle.create({
	 *              bundleUrl: "appvar2/i18n/i18n.properties",
	 *              supportedLocales: ["de", "fr"]
	 *           })
	 *      ],
	 *      supportedLocales: ["de", "fr"],
	 *      fallbackLocale: "de"
	 *   });
	 *   // ...
	 * });
	 *
	 * @param {object} oData
	 *   Parameters used to initialize the <code>ResourceModel</code>; at least one of
	 *   <code>bundle</code>, <code>bundleName</code> or <code>bundleUrl</code> must be set; if more
	 *   than one property is set, they are evaluated in the mentioned order
	 * @param {string[]} [oData.activeTerminologies]
	 *   The list of active terminologies, e.g. <code>["oil", "retail"]</code>.
	 *   This parameter is passed to the underlying ResourceBundle (see
	 *   {@link module:sap/base/i18n/ResourceBundle.create}). This parameter is ignored when
	 *   <code>bundle</code> is set. Will cause an error if <code>enhanceWith</code> contains
	 *   instances of <code>ResourceBundle</code>. Supported since 1.77.0.
	 * @param {boolean} [oData.async=false]
	 *   <b>Deprecated as of Version 1.125</b>; always use asynchronous loading for performance reasons
	 * @param {module:sap/base/i18n/ResourceBundle} [oData.bundle]
	 *   A resource bundle instance; when given, this bundle is used instead of creating a bundle
	 *   from the provided <code>bundleUrl</code>, <code>bundleName</code> and
	 *   <code>bundleLocale</code> properties. However, to support reloading the bundle when the
	 *   current session locale changes, the corresponding <code>bundleName</code> or
	 *   <code>bundleUrl</code> should be specified if known. Otherwise, the bundle is not updated
	 *   on locale changes.
	 *   Note: This parameter should not be used when using enhancements.
	 *   Terminologies require enhancements with <code>bundleUrl</code>, <code>bundleName</code> and
	 *   <code>bundleLocale</code> in combination with <code>enhanceWith</code> which contains a
	 *   list of <code>ResourceBundle.Configurations</code>.
	 *   Terminologies must be defined in a declarative way, with configurations and not with
	 *   instances of <code>ResourceBundle</code>.
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
	 * @param {module:sap/base/i18n/ResourceBundle[]|module:sap/base/i18n/ResourceBundle.Configuration[]} [oData.enhanceWith]
	 *   A list of resource bundles or resource bundle configurations that enhance the texts from
	 *   the main bundle; intended for extensibility scenarios; see also the class documentation.
	 *   ResourceBundles use the ResourceModel's enhance mechanism and <code>ResourceBundle.Configurations</code>
	 *   get passed to the underlying ResourceBundle (see
	 *   {@link module:sap/base/i18n/ResourceBundle.create}). Supported since 1.77.0.
	 * @param {string} [oData.fallbackLocale="en"]
	 *   A fallback locale to be used after all locales derived from <code>bundleLocale</code> have
	 *   been tried, but before the 'raw' bundle is used. Can either be a BCP47 language tag or a
	 *   JDK compatible locale string (e.g. "en-GB", "en_GB" or "en").
	 *
	 *   To prevent a generic fallback, use the empty string (<code>""</code>). E.g. by providing
	 *   <code>fallbackLocale: ""</code> and <code>supportedLocales: ["en"]</code>, only the bundle
	 *   "en" is requested without any fallback. This parameter is passed to the underlying
	 *   ResourceBundle (see {@link module:sap/base/i18n/ResourceBundle.create}). Supported since
	 *   1.77.0.
	 * @param {string[]} [oData.supportedLocales]
	 *   List of supported locales (aka 'language tags') to restrict the fallback chain. Each entry
	 *   in the array can either be a BCP47 language tag or a JDK compatible locale string (e.g.
	 *   "en-GB", "en_GB" or "en"). An empty string (<code>""</code>) represents the 'raw' bundle.
	 *
	 *   <b>Note:</b> The given language tags can use modern or legacy ISO639 language codes.
	 *   Whatever language code is used in the list of supported locales will also be used when
	 *   requesting a file from the server. If the <code>bundleLocale</code> contains a legacy
	 *   language code like "sh" and the <code>supportedLocales</code> contains [...,"sr",...], "sr"
	 *   will be used in the URL. This mapping works in both directions. This parameter is passed to
	 *   the underlying ResourceBundle (see {@link module:sap/base/i18n/ResourceBundle.create}).
	 *   Supported since 1.77.0.
	 * @param {Object<string,module:sap/base/i18n/ResourceBundle.TerminologyConfiguration>} [oData.terminologies]
	 *   An object, mapping a terminology identifier (e.g. "oil") to a
	 *   <code>ResourceBundle.TerminologyConfiguration</code>. A terminology is a resource bundle
	 *   configuration for a specific use case (e.g. "oil"). It does neither have a
	 *   <code>fallbackLocale</code> nor can it be enhanced with <code>enhanceWith</code>. This
	 *   parameter is passed to the underlying ResourceBundle (see
	 *   {@link module:sap/base/i18n/ResourceBundle.create}). This parameter is ignored when
	 *   <code>bundle</code> is set. Will cause an error if <code>enhanceWith</code> contains
	 *   instances of <code>ResourceBundle</code>.
	 *   Supported since 1.77.0.
	 *
	 * @alias sap.ui.model.resource.ResourceModel
	 * @author SAP SE
	 * @class
	 * Model implementation for resource bundles.
	 *
	 * This model is not prepared to be inherited from.
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
			var bUseResourceModelEnhanceMechanism;

			Model.apply(this, arguments);

			this.aCustomBundles = [];

			this.bReenhance = false;

			this.bAsync = !!(oData && oData.async);

			if (!this.bAsync) {
				Log.warning("Usage of synchronous loading is deprecated. For performance reasons, asynchronous loading"
					+ " is strongly recommended.", undefined, sClassname);
			}

			this.sDefaultBindingMode = oData.defaultBindingMode || BindingMode.OneWay;

			this.mSupportedBindingModes = {
				"OneWay" : true,
				"TwoWay" : false,
				"OneTime" : !this.bAsync
			};

			if (this.bAsync && this.sDefaultBindingMode == BindingMode.OneTime) {
				Log.warning("Using binding mode OneTime for asynchronous ResourceModel is not supported!");
			}

			this.oData = Object.assign({}, oData);

			// the new ResourceBundle's enhance mechanism works only with
			// ResourceBundle.Configurations; if there is a ResourceBundle in the enhanceWith
			// parameter, use the ResourceModel's enhance mechanism to be backward compatible.
			bUseResourceModelEnhanceMechanism = Array.isArray(this.oData.enhanceWith)
				&& this.oData.enhanceWith.some(function (oEnhanceWith) {
				return oEnhanceWith instanceof ResourceBundle;
			});

			if (oData && oData.bundle) {
				this._oResourceBundle = oData.bundle;
				bUseResourceModelEnhanceMechanism = true;
			} else if (oData && (oData.bundleUrl || oData.bundleName)) {
				if (bUseResourceModelEnhanceMechanism) {
					delete this.oData.enhanceWith;

					// terminologies and activeTerminologies are only supported when there are
					// no ResourceBundles in the enhanceWith array
					if (oData.terminologies || oData.activeTerminologies) {
						throw new Error("'terminologies' parameter and 'activeTerminologies' parameter are not"
							+ " supported in configuration when enhanceWith contains ResourceBundles");
					}
				}
				_load(this);
			} else {
				throw new Error("At least bundle, bundleName or bundleUrl must be provided!");
			}

			// ResourceModel's enhance mechanism
			if (bUseResourceModelEnhanceMechanism && Array.isArray(oData.enhanceWith)) {
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
	 * This method ensures that the bundleName does not contain leading slashes or dots by removing them.
	 * @param {string} sBundleName the bundle's name, e.g. ".i18n.i18n"
	 * @returns {string} sanitized bundleName without leading slashes or dots
	 * @private
	 */
	ResourceModel._sanitizeBundleName = function(sBundleName) {
		// Starting slashes or dots are removed to prevent a leading-slash error thrown through
		// the sap.ui.require.toUrl function call
		if (sBundleName && (sBundleName[0] === "/" || sBundleName[0] === ".")) {
			Log.error('Incorrect resource bundle name "' + sBundleName + '"',
				'Leading slashes or dots in resource bundle names are ignored, since such names are'
				+ ' invalid UI5 module names. Please check whether the resource bundle "'
				+ sBundleName + '" is actually needed by your application.',
				sClassname);
			sBundleName = sBundleName.replace(rLeadingDotsOrSlashes, "");
		}
		return sBundleName;
	};

	/**
	 * Returns the resource bundle or a promise resolving with the resource bundle.
	 *
	 * @param {object} oData
	 *   Parameters used to load the resource bundle; see constructor of the
	 *   {@link sap.ui.model.resource.ResourceModel}
	 * @param {string[]} [oData.activeTerminologies]
	 *   The list of active terminologies, e.g. <code>["oil", "retail"]</code>.
	 *   This parameter is passed to the underlying ResourceBundle (see
	 *   {@link module:sap/base/i18n/ResourceBundle.create}). Supported since 1.77.0.
	 * @param {string} [oData.bundleLocale]
	 *   A locale in "BCP-47 language tag" notation specifying the locale in which to load the
	 *   bundle; when not given, the current session locale of UI5 is used (recommended)
	 * @param {string} [oData.bundleName]
	 *   UI5 module name in dot notation referring to the base ".properties" file
	 * @param {string} [oData.bundleUrl]
	 *   URL pointing to the base ".properties" file of a bundle
	 * @param {module:sap/base/i18n/ResourceBundle[]|module:sap/base/i18n/ResourceBundle.Configuration[]} [oData.enhanceWith]
	 *   A list of resource bundles or resource bundle configurations that enhance the texts from
	 *   the main bundle; intended for extensibility scenarios; see also the class documentation.
	 *   ResourceBundles use the ResourceModel's enhance mechanism and ResourceBundle.Configurations
	 *   get passed to the underlying ResourceBundle (see
	 *   {@link module:sap/base/i18n/ResourceBundle.create}). Supported since 1.77.0.
	 * @param {string} [oData.fallbackLocale="en"]
	 *   A fallback locale to be used after all locales derived from <code>bundleLocale</code> have
	 *   been tried, but before the 'raw' bundle is used. Can either be a BCP47 language tag or a
	 *   JDK compatible locale string (e.g. "en-GB", "en_GB" or "en").
	 *
	 *   To prevent a generic fallback, use the empty string (<code>""</code>). E.g. by providing
	 *   <code>fallbackLocale: ""</code> and <code>supportedLocales: ["en"]</code>, only the bundle
	 *   "en" is requested without any fallback. This parameter is passed to the underlying
	 *   ResourceBundle (see {@link module:sap/base/i18n/ResourceBundle.create}).
	 * @param {string[]} [oData.supportedLocales]
	 *   List of supported locales (aka 'language tags') to restrict the fallback chain. Each entry
	 *   in the array can either be a BCP47 language tag or a JDK compatible locale string (e.g.
	 *   "en-GB", "en_GB" or "en"). An empty string (<code>""</code>) represents the 'raw' bundle.
	 *   <b>Note:</b> The given language tags can use modern or legacy ISO639 language codes.
	 *   Whatever language code is used in the list of supported locales will also be used when
	 *   requesting a file from the server. If the <code>bundleLocale</code> contains a legacy
	 *   language code like "sh" and the <code>supportedLocales</code> contains [...,"sr",...], "sr"
	 *   will be used in the URL. This mapping works in both directions. This parameter is passed
	 *   to the underlying ResourceBundle (see {@link module:sap/base/i18n/ResourceBundle.create}).
	 * @param {Object<string,module:sap/base/i18n/ResourceBundle.TerminologyConfiguration>} [oData.terminologies]
	 *   An object mapping a terminology identifier (e.g. "oil") to a
	 *   <code>ResourceBundle.TerminologyConfiguration</code>. A terminology is a resource bundle
	 *   configuration for a specific use case (e.g. "oil"). It does neither have a
	 *   <code>fallbackLocale</code> nor can it be enhanced with <code>enhanceWith</code>. This
	 *   parameter is passed to the underlying ResourceBundle (see
	 *   {@link module:sap/base/i18n/ResourceBundle.create}). Supported since 1.77.0.
	 * @param {boolean} bAsync
	 *   Whether the resource bundle should be loaded asynchronously
	 * @returns {module:sap/base/i18n/ResourceBundle|Promise<module:sap/base/i18n/ResourceBundle>}
	 *   Loaded resource bundle or <code>Promise</code> resolving with the resource bundle in async
	 *   case
	 *
	 * @private
	 * @ui5-restricted sap.ui.core.Component
	 */
	ResourceModel.loadResourceBundle = function (oData, bAsync) {
		var sLocale = oData.bundleLocale,
			mParams;

		// sanitize bundleName for backward compatibility
		oData.bundleName = ResourceModel._sanitizeBundleName(oData.bundleName);

		mParams = Object.assign({
			async: bAsync,
			includeInfo: Supportability.collectOriginInfo(),
			locale: sLocale
		}, oData);

		return ResourceBundle.create(mParams);
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
	 * @returns {Promise|null} A Promise resolving when the enhancement is finished or
	 *   <code>null</code> if the <code>ResourceModel</code> is configured to act synchronously
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
				if (oData.terminologies) {
					throw new Error("'terminologies' parameter is not"
						+ " supported for enhancement");
				}
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
	 * @returns {string|null}
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
		var that = this;

		SyncPromise.resolve(this.getResourceBundle()).then(function (oBundle) {
			var oEventParameters;

			if (that.bAsync) {
				oEventParameters = {
						url: ResourceBundle._getUrl(that.oData.bundleUrl,
							// sanitize bundleName for backward compatibility
							ResourceModel._sanitizeBundleName(that.oData.bundleName)),
						async: true
					};
				that.fireRequestSent(oEventParameters);
			}
			var oRecreateResult = oBundle._recreate();
			if (oRecreateResult instanceof Promise) {
				that._oPromise = oRecreateResult;
			}
			return SyncPromise.resolve(oRecreateResult).then(function (oNewResourceBundle) {
				that._oResourceBundle = oNewResourceBundle;
				that._reenhance();
				delete that._oPromise;
				that.checkUpdate(true);
			}).finally(function () {
				if (that.bAsync) {
					that.fireRequestCompleted(oEventParameters);
				}
			});
		}).catch(function (oError) {
			Log.error("Failed to reload bundles after localization change", oError, sClassname);
		});
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
				// sanitize bundleName for backward compatibility
				var oEventParam = {
						url: ResourceBundle._getUrl(oData.bundleUrl,
							ResourceModel._sanitizeBundleName(oData.bundleName)),
						async: true
					};
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

	return ResourceModel;

});