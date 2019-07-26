/*!
 * ${copyright}
 */

// Provides control sap.ui.core.mvc.XMLView.
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'./View',
	"./XMLViewRenderer",
	"sap/base/util/merge",
	'sap/ui/base/ManagedObject',
	'sap/ui/core/XMLTemplateProcessor',
	'sap/ui/core/library',
	'sap/ui/core/Control',
	'sap/ui/core/RenderManager',
	'sap/ui/core/cache/CacheManager',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/util/XMLHelper',
	'sap/base/strings/hash',
	'sap/base/Log',
	'sap/base/util/LoaderExtensions'
],
	function(
		jQuery,
		View,
		XMLViewRenderer,
		merge,
		ManagedObject,
		XMLTemplateProcessor,
		library,
		Control,
		RenderManager,
		Cache,
		ResourceModel,
		XMLHelper,
		hash,
		Log,
		LoaderExtensions
	) {
	"use strict";

	// actual constants
	var RenderPrefixes = RenderManager.RenderPrefixes,
		ViewType = library.mvc.ViewType,
		sXMLViewCacheError = "XMLViewCacheError",
		notCacheRelevant = {};


	/**
	 * Constructor for a new mvc/XMLView.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A View defined using (P)XML and HTML markup.
	 *
	 * <strong>Note:</strong><br>
	 * Be aware that modifications of the content aggregation of this control are not supported due to technical reasons.
	 * This includes calls to all content modifying methods like <code>addContent></code> etc., but also the implicit
	 * removal of controls contained by the content aggregation. For example the destruction of a Control via the <code>
	 * destroy</code> method. All functions can be called but may not work properly or lead to unexpected side effects.
	 *
	 * <strong>Note:</strong><br>
	 * On root level, you can only define content for the default aggregation, e.g. without adding the <code>&lt;content&gt;</code> tag. If
	 * you want to specify content for another aggregation of a view like <code>dependents</code>, place it in a child
	 * control's dependents aggregation or add it by using {@link sap.ui.core.mvc.XMLView#addDependent}.
	 *
	 * @extends sap.ui.core.mvc.View
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.core.mvc.XMLView
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var XMLView = View.extend("sap.ui.core.mvc.XMLView", /** @lends sap.ui.core.mvc.XMLView.prototype */ { metadata : {

		library : "sap.ui.core",

		specialSettings : {

			/**
			 * If an XMLView instance is used to represent an HTML subtree of another XMLView,
			 * then that other XMLView is provided with this setting to be able to delegate
			 * View functionality (createId, getController) to that 'real' view.
			 */
			containingView : { type: 'sap.ui.core.mvc.XMLView', visibility: 'hidden' },

			/**
			 * If an XMLView instance is used to represent an HTML subtree of another XMLView,
			 * that subtree is provided with this setting.
			 */
			xmlNode : { type: 'Element', visibility: 'hidden' },

			/**
			 * Configuration for the XMLView caching.
			 */
			cache : 'Object',

			/**
			 * The processing mode of the XMLView.
			 * The processing mode "sequential" is implicitly activated for the following type of async views:
			 *      a) root views in the manifest
			 *      b) XMLViews created with the (XML)View.create factory
			 *      c) XMLViews used via routing
			 * Additionally, all declarative nested async subviews are also processed asynchronously.
			 */
			processingMode: { type: "string", visibility: "hidden" }
		},

		designtime: "sap/ui/core/designtime/mvc/XMLView.designtime"
	}});

		/**
		 * Instantiates an XMLView of the given name and with the given ID.
		 *
		 * The <code>vView</code> can either be the name of the module that contains the view definition
		 * or it can be a configuration object with properties <code>viewName</code>, <code>viewContent</code>
		 * and a <code>controller</code> property (more properties are described in the parameters section below).
		 *
		 * If a <code>viewName</code> is given, it behaves the same as when <code>vView</code> is a string:
		 * the named resource will be loaded and parsed as XML. Alternatively, an already loaded view definition
		 * can be provided as <code>viewContent</code>, either as XML string or as an already parsed XML document.
		 * Exactly one of <code>viewName</code> and <code>viewContent</code> must be given, if none or both are given,
		 * an error will be reported. The <code>controller</code> property is optional and can hold a controller instance.
		 * When given, it overrides the controller class defined in the view definition.
		 *
		 * When property <code>async</code> is set to true, the view definition and the controller class (and its
		 * dependencies) will be loaded asynchronously. Any controls used in the view might be loaded sync or
		 * async, depending on the processingMode. Even when
		 * the view definition is provided as string or XML Document, controller or controls might be loaded
		 * asynchronously. In any case a view instance will be returned synchronously by this factory API, but its
		 * content (control tree) might appear only later. Also see {@link sap.ui.core.mvc.View#loaded}.
		 *
		 * <strong>Note</strong>: If an XML document is given, it might be modified during view construction.
		 *
		 * <strong>Note</strong>: On root level, you can only define content for the default aggregation, e.g.
		 * without adding the <code>&lt;content&gt;</code> tag. If you want to specify content for another aggregation
		 * of a view like <code>dependents</code>, place it in a child control's dependents aggregation or add it by
		 * using {@link sap.ui.core.mvc.XMLView#addDependent}.
		 *
		 * <strong>Note</strong>: If you enable caching, you need to take care of the invalidation via keys. Automatic
		 * invalidation takes only place if the UI5 version or the component descriptor (manifest.json) change. This is
		 * still an experimental feature and may experience slight changes of the invalidation parameters or the cache
		 * key format.
		 *
		 * Like with any other control, <code>sId</code> is optional and an ID will be created automatically.
		 *
		 * @param {string} [sId] ID of the newly created view
		 * @param {string | object} vView Name of the view or a view configuration object as described above
		 * @param {string} [vView.viewName] Name of the view resource in module name notation (without suffix)
		 * @param {string|Document} [vView.viewContent] XML string or XML document that defines the view
		 * @param {boolean} [vView.async] Defines how the view source is loaded and rendered later on
		 * @param {object} [vView.cache] Cache configuration, only for <code>async</code> views; caching gets active
		 * when this object is provided with vView.cache.keys array; keys are used to store data in the cache and for
		 * invalidation of the cache
		 * @param {Array.<(string|Promise)>} [vView.cache.keys] Array with strings or Promises resolving with strings
		 * @param {object} [vView.preprocessors] Preprocessors configuration, see {@link sap.ui.core.mvc.View}
		 * @param {sap.ui.core.mvc.Controller} [vView.controller] Controller instance to be used for this view
		 * @public
		 * @static
		 * @deprecated since 1.56: Use {@link sap.ui.core.mvc.XMLView.create XMLView.create} instead
		 * @return {sap.ui.core.mvc.XMLView} the created XMLView instance
		 */
		sap.ui.xmlview = function(sId, vView) {
			return sap.ui.view(sId, vView, ViewType.XML);
		};

		/**
		 * Instantiates an XMLView from the given configuration options.
		 *
		 * If a <code>viewName</code> is given, it must be a dot-separated name of an XML view resource (without
		 * the mandatory suffix ".view.xml"). The resource will be loaded asynchronously via the module system
		 * (preload caches might apply) and will be parsed as XML. Alternatively, an already loaded view <code>definition</code>
		 * can be provided, either as XML string or as an already parsed XML document. Exactly one of <code>viewName</code>
		 * or <code>definition</code> must be given, if none or both are given, an error will be reported.
		 *
		 * The <code>controller</code> property is optional and can hold a controller instance. When given, it overrides
		 * the controller class defined in the view definition.
		 *
		 * <strong>Note</strong>: On root level, you can only define content for the default aggregation, e.g. without
		 * adding the <code>&lt;content&gt;</code> tag. If you want to specify content for another aggregation of a view
		 * like <code>dependents</code>, place it in a child control's <code>dependents</code> aggregation or add it
		 * by using {@link sap.ui.core.mvc.XMLView#addDependent}.
		 *
		 * <strong>Note</strong>: If you enable caching, you need to take care of the invalidation via keys. Automatic
		 * invalidation takes only place if the UI5 version or the component descriptor (manifest.json) change. This is
		 * still an experimental feature and may experience slight changes of the invalidation parameters or the cache
		 * key format.
		 *
		 * @param {object} oOptions - An object containing the view configuration options.
		 * @param {string} [oOptions.id] - Specifies an ID for the View instance. If no ID is given, an ID will be generated.
		 * @param {string} [oOptions.viewName] - Corresponds to an XML module that can be loaded via the module system
		 *                     (oOptions.viewName + suffix ".view.xml")
		 * @param {string|Document} [oOptions.definition] - XML string or XML document that defines the view.
		 *                     Exactly one of <code>viewName</code> or <code>definition</code> must be given.
		 * @param {sap.ui.core.mvc.Controller} [oOptions.controller] - Controller instance to be used for this view.
		 *                     The given controller instance overrides the controller defined in the view definition.
		 *                     Sharing one controller instance between multiple views is not possible.
		 * @param {object} [oOptions.cache] - Cache configuration; caching gets active when this object is provided
		 *                     with vView.cache.keys array; keys are used to store data in the cache and for invalidation
		 *                     of the cache.
		 * @param {Array.<(string|Promise)>} [oOptions.cache.keys] - Array with strings or Promises resolving with strings
		 * @param {object} [oOptions.preprocessors] Preprocessors configuration, see {@link sap.ui.core.mvc.View}
		 *                     <strong>Note</strong>: These preprocessors are only available to this instance.
		 *                     For global or on-demand availability use {@link sap.ui.core.mvc.XMLView.registerPreprocessor}.
		 * @public
		 * @static
		 * @return {Promise<sap.ui.core.mvc.XMLView>} A Promise that resolves with the view instance or rejects with any thrown error.
		 */
		XMLView.create = function (oOptions) {
			var mParameters = merge({}, oOptions);

			// mapping renamed parameters
			mParameters.viewContent = mParameters.definition;

			// defaults for the async API
			mParameters.async = true;
			mParameters.type = ViewType.XML;

			// for now the processing mode is always set to default, might be changeable later, e.g. "parallel"
			mParameters.processingMode = mParameters.processingMode || "sequential";

			return View.create(mParameters);
		};

		/**
		 * The type of the view used for the <code>sap.ui.view</code> factory
		 * function. This property is used by the parsers to define the specific
		 * view type.
		 * @private
		 */
		XMLView._sType = ViewType.XML;

		/**
		 * Flag for feature detection of asynchronous loading/rendering
		 * @public
		 * @since 1.30
		 */
		XMLView.asyncSupport = true;

		/**
		 * Flag indicating whether to use the cache
		 * @private
		 * @experimental
		 * @since 1.44
		 */
		XMLView._bUseCache = sap.ui.getCore().getConfiguration().getViewCache() && Cache._isSupportedEnvironment();

		function validatexContent(xContent) {
			if (xContent.parseError.errorCode !== 0) {
				var oParseError = xContent.parseError;
				throw new Error(
					"The following problem occurred: XML parse Error for " + oParseError.url +
					" code: " + oParseError.errorCode +
					" reason: " + oParseError.reason +
					" src: " + oParseError.srcText +
					" line: " +  oParseError.line +
					" linepos: " + oParseError.linepos +
					" filepos: " + oParseError.filepos
				);
			}
		}

		function validateViewSettings(oView, mSettings) {
			if (!mSettings) {
				throw new Error("mSettings must be given");
			} else if (mSettings.viewName && mSettings.viewContent) {
				throw new Error("View name and view content are given. There is no point in doing this, so please decide.");
			} else if ((mSettings.viewName || mSettings.viewContent) && mSettings.xmlNode) {
				throw new Error("View name/content AND an XML node are given. There is no point in doing this, so please decide.");
			} else if (!(mSettings.viewName || mSettings.viewContent) && !mSettings.xmlNode) {
				throw new Error("Neither view name/content nor an XML node is given. One of them is required.");
			} else if (mSettings.cache && !(mSettings.cache.keys && mSettings.cache.keys.length)) {
				throw new Error("No cache keys provided. At least one is required.");
			}
		}

		function getxContent(oView, mSettings) {
			// keep the content as a pseudo property to make cloning work but without supporting mutation
			// TODO model this as a property as soon as write-once-during-init properties become available
			oView.mProperties["viewContent"] = mSettings.viewContent;
			var xContent = XMLHelper.parse(mSettings.viewContent);
			validatexContent(xContent);
			return xContent.documentElement;
		}

		/**
		 *
		 * @param oView
		 * @param mSettings
		 * @return {undefined|Promise} will return a Promise if ResourceModel is instantiated asynchronously, otherwise undefined
		 */
		function setResourceModel(oView, mSettings) {
			if ((oView._resourceBundleName || oView._resourceBundleUrl) && (!mSettings.models || !mSettings.models[oView._resourceBundleAlias])) {
				var oModel = new ResourceModel({
					bundleName: oView._resourceBundleName,
					bundleUrl: oView._resourceBundleUrl,
					bundleLocale: oView._resourceBundleLocale,
					async: mSettings.async
				});
				var vBundle = oModel.getResourceBundle();
				// if ResourceBundle was created with async flag vBundle will be a Promise
				if (vBundle instanceof Promise) {
					return vBundle.then(function() {
						oView.setModel(oModel, mSettings.resourceBundleAlias);
					});
				}
				oView.setModel(oModel, oView._resourceBundleAlias);
			}
		}

		function setAfterRenderingNotifier(oView) {
			// Delegate for after rendering notification before onAfterRendering of child controls
			oView.oAfterRenderingNotifier = new XMLAfterRenderingNotifier();
			oView.oAfterRenderingNotifier.addDelegate({
				onAfterRendering: function() {
					oView.onAfterRenderingBeforeChildren();
				}
			});
		}

		function getRootComponent(oSrcElement) {
			var Component = sap.ui.require("sap/ui/core/Component"),
				oComponent;

			while (oSrcElement && Component) {
				var oCandidateComponent = Component.getOwnerComponentFor(oSrcElement);
				if (oCandidateComponent) {
					oSrcElement = oComponent = oCandidateComponent;
				} else {
					if (oSrcElement instanceof Component) {
						oComponent = oSrcElement;
					}
					oSrcElement = oSrcElement.getParent && oSrcElement.getParent();
				}
			}
			return oComponent;
		}

		function getCacheInput(oView, mCacheSettings) {
			var oRootComponent = getRootComponent(oView),
				sManifest = oRootComponent ? JSON.stringify(oRootComponent.getManifest()) : null,
				aFutureKeyParts = [];

			aFutureKeyParts = aFutureKeyParts.concat(
				getCacheKeyPrefixes(oView, oRootComponent),
				getVersionInfo(), getCacheKeyProviders(oView),
				mCacheSettings.keys
			);

			return validateCacheKey(oView, aFutureKeyParts).then(function(sKey) {
				return {
					key: sKey +  "(" + hash(sManifest || "") + ")",
					componentManifest: sManifest,
					additionalData: mCacheSettings.additionalData
				};
			});
		}

		function isValidKey(sKey) {
			return sKey;
		}

		function validateCacheKey(oView, aFutureKeyParts) {
			return Promise.all(aFutureKeyParts).then(function(aKeys) {
				aKeys = aKeys.filter(function(oElement) {
					return oElement !== notCacheRelevant;
				});
				if (aKeys.every(isValidKey)) {
					return aKeys.join('_');
				} else {
					var e = new Error("Provided cache keys may not be empty or undefined.");
					e.name = sXMLViewCacheError;
					return Promise.reject(e);
				}
			});
		}

		function getCacheKeyPrefixes(oView, oRootComponent) {
				var sComponentName = oRootComponent && oRootComponent.getMetadata().getName();
				return [
					sComponentName || window.location.host + window.location.pathname,
					oView.getId(),
					sap.ui.getCore().getConfiguration().getLanguageTag()
				];
		}

		function getCacheKeyProviders(oView) {
			var mPreprocessors = oView.getPreprocessors(),
				oPreprocessorInfo = oView.getPreprocessorInfo(/*bSync =*/false),
				aFutureCacheKeys = [];

			function pushFutureKey(o) {
				aFutureCacheKeys.push(o.preprocessor
					.then(function(oPreprocessorImpl) {
						if (oPreprocessorImpl.getCacheKey) {
							return oPreprocessorImpl.getCacheKey(oPreprocessorInfo);
						} else {
							/* We cannot check for the getCacheKey function synchronous, but we later need
							 * to differentiate whether the result of getCacheKey returns an invalid result
							 * (null/undefined) or the function simply does not exist.
							 * Therefore we use the 'notCacheRelevant' token to mark preProcessors that does
							 * not provide a getCacheKey function and so are not relevant for caching.
							 * See validateCacheKey function.
							 */
							return notCacheRelevant;
						}
					})
				);
			}

			for (var sType in mPreprocessors) {
				mPreprocessors[sType].forEach(pushFutureKey);
			}
			return aFutureCacheKeys;
		}

		function getVersionInfo() {
			return sap.ui.getVersionInfo({async:true}).then(function(oInfo) {
				var sTimestamp = "";
				if (!oInfo.libraries) {
					sTimestamp = sap.ui.buildinfo.buildtime;
				} else {
					oInfo.libraries.forEach(function(oLibrary) {
						sTimestamp += oLibrary.buildTimestamp;
					});
				}
				return sTimestamp;
			}).catch(function(error) {
				// Do not populate the cache if the version info could not be retrieved.
				Log.warning("sap.ui.getVersionInfo could not be retrieved", "sap.ui.core.mvc.XMLView");
				Log.debug(error);
				return "";
			});
		}

		function writeCache(mCacheInput, xContent) {
			// we don't want to write the key into the cache
			var sKey = mCacheInput.key;
			delete mCacheInput.key;
			mCacheInput.xml = XMLHelper.serialize(xContent);
			return Cache.set(sKey, mCacheInput);
		}

		function readCache(mCacheInput) {
			return Cache.get(mCacheInput.key).then(function(mCacheOutput) {
				// double check manifest to eliminate issues with hash collisions
				if (mCacheOutput && mCacheOutput.componentManifest == mCacheInput.componentManifest) {
					mCacheOutput.xml = XMLHelper.parse(mCacheOutput.xml, "application/xml").documentElement;
					if (mCacheOutput.additionalData) {
						// extend the additionalData which was passed into cache configuration dynamically
						jQuery.extend(true, mCacheInput.additionalData, mCacheOutput.additionalData);
					}
					return mCacheOutput;
				}
			});
		}

		/**
 		* This function initialized the view settings.
 		*
 		* @param {object} mSettings with view settings
 		* @return {Promise|null} will be returned if running in async mode
 		*/
		XMLView.prototype.initViewSettings = function(mSettings) {
			var that = this, _xContent;

			function processView(xContent) {
				that._xContent = xContent;

				if (View._supportInfo) {
					View._supportInfo({context: that._xContent, env: {caller:"view", viewinfo: jQuery.extend(true, {}, that), settings: jQuery.extend(true, {}, mSettings || {}), type: "xmlview"}});
				}

				// extract the properties of the view from the XML element
				if ( !that.isSubView() ) {
					// for a real XMLView, we need to parse the attributes of the root node
					var mSettingsFromXML = {};
					// enrich mSettingsFromXML
					XMLTemplateProcessor.parseViewAttributes(xContent, that, mSettingsFromXML);
					if (!mSettings.async) {
						// extend mSettings which get applied implicitly during view constructor
						Object.assign(mSettings, mSettingsFromXML);
					} else {
						// apply the settings from the loaded view source via an explicit call
						that.applySettings(mSettingsFromXML);
					}
				} else {
					// when used as fragment: prevent connection to controller, only top level XMLView must connect
					delete mSettings.controller;
				}
				// vSetResourceModel is a promise if ResourceModel is created async
				var vSetResourceModel = setResourceModel(that, mSettings);
				if (vSetResourceModel instanceof Promise) {
					return vSetResourceModel.then(function() {
						setAfterRenderingNotifier(that);
					});
				}
				setAfterRenderingNotifier(that);
			}

			function runViewxmlPreprocessor(xContent, bAsync) {
				if (that.hasPreprocessor("viewxml")) {
					// for the viewxml preprocessor fully qualified ids are provided on the xml source
					return XMLTemplateProcessor.enrichTemplateIdsPromise(xContent, that, bAsync).then(function() {
						return that.runPreprocessor("viewxml", xContent, !bAsync);
					});
				}
				return xContent;
			}

			function runPreprocessorsAsync(xContent) {
				return that.runPreprocessor("xml", xContent).then(function(xContent) {
					return runViewxmlPreprocessor(xContent, /*bAsync=*/true);
				});
			}

			function loadResourceAsync(sResourceName) {
				return LoaderExtensions.loadResource(sResourceName, {async: true}).then(function(oData) {
					return oData.documentElement; // result is the document node
				});
			}

			function processResource(sResourceName, mCacheInput) {
				return loadResourceAsync(sResourceName).then(runPreprocessorsAsync).then(function(xContent) {
					if (mCacheInput) {
						writeCache(mCacheInput, xContent);
					}
					return xContent;
				});
			}

			function processCache(sResourceName, mCacheSettings) {
				return getCacheInput(that, mCacheSettings).then(function(mCacheInput) {
					return readCache(mCacheInput).then(function(mCacheOutput) {
						if (!mCacheOutput) {
							return processResource(sResourceName, mCacheInput);
						} else {
							return mCacheOutput.xml;
						}
					});
				}).catch(function(error) {
					if (error.name === sXMLViewCacheError) {
						// no sufficient cache keys, processing can continue
						Log.debug(error.message, error.name, "sap.ui.core.mvc.XMLView");
						Log.debug("Processing the View without caching.", "sap.ui.core.mvc.XMLView");
						return processResource(sResourceName);
					} else {
						// an unknown error occured and should be exposed
						return Promise.reject(error);
					}
				});
			}

			this._oContainingView = mSettings.containingView || this;

			this._sProcessingMode = mSettings.processingMode;

			if (this.oAsyncState) {
				// suppress rendering of preserve content
				this.oAsyncState.suppressPreserve = true;
			}

			validateViewSettings(this, mSettings);

			// either template name or XML node is given
			if (mSettings.viewName) {
				var sResourceName = mSettings.viewName.replace(/\./g, "/") + ".view.xml";
				if (mSettings.async) {
					// in async mode we need to return here as processing takes place in Promise callbacks
					if (mSettings.cache && XMLView._bUseCache) {
						return processCache(sResourceName, mSettings.cache).then(processView);
					} else {
						return loadResourceAsync(sResourceName).then(runPreprocessorsAsync).then(processView);
					}
				} else {
					_xContent = LoaderExtensions.loadResource(sResourceName).documentElement;
				}
			} else if (mSettings.viewContent) {
				if (mSettings.viewContent.nodeType === window.Node.DOCUMENT_NODE) { // Check for XML Document
					_xContent = mSettings.viewContent.documentElement;
				} else {
					_xContent = getxContent(this, mSettings);
				}
			} else if (mSettings.xmlNode) {
				_xContent = mSettings.xmlNode;
			}

			if (mSettings.async) {
				// a normal Promise:
				return runPreprocessorsAsync(_xContent).then(processView);
			} else {
				// a SyncPromise
				_xContent = this.runPreprocessor("xml", _xContent, true);
				_xContent = runViewxmlPreprocessor(_xContent, false);
				// if the _xContent is a SyncPromise we have to extract the _xContent
				// and make sure we throw any occurring errors further
				if (_xContent && typeof _xContent.getResult === 'function') {
					if (_xContent.isRejected()) {
						// sync promises store the error within the result if they are rejected
						throw _xContent.getResult();
					}
					_xContent = _xContent.getResult();
				}
				processView(_xContent);
			}
		};

		XMLView.prototype.onBeforeRendering = function() {
			// make sure to preserve the content if not preserved yet
			var oDomRef = this.getDomRef();
			if (oDomRef && !RenderManager.isPreservedContent(oDomRef)) {
				RenderManager.preserveContent(oDomRef, /* bPreserveRoot= */ true);
			}

			View.prototype.onBeforeRendering.apply(this, arguments);
		};

		XMLView.prototype.exit = function() {
			if (this.oAfterRenderingNotifier) {
				this.oAfterRenderingNotifier.destroy();
			}
			View.prototype.exit.apply(this, arguments);
		};

		XMLView.prototype.onControllerConnected = function(oController) {
			var that = this;
			// unset any preprocessors (e.g. from an enclosing JSON view)

			// create a function, which scopes the instance creation of a class with the corresponding owner ID
			// XMLView special logic for asynchronous template parsing, when component loading is async but
			// instance creation is sync.
			function fnRunWithPreprocessor(fn) {
				return ManagedObject.runWithPreprocessors(fn, {
					settings: that._fnSettingsPreprocessor
				});
			}

			// parse the XML tree
			if (!this.oAsyncState) {
				this._aParsedContent = fnRunWithPreprocessor(XMLTemplateProcessor.parseTemplate.bind(null, this._xContent, this));
			} else {
				return XMLTemplateProcessor.parseTemplatePromise(this._xContent, this, true, {
					fnRunWithPreprocessor: fnRunWithPreprocessor
				}).then(function(aParsedContent) {
					that._aParsedContent = aParsedContent;
					// allow rendering of preserve content
					delete that.oAsyncState.suppressPreserve;
				});
			}
		};

		XMLView.prototype.getControllerName = function() {
			return this._controllerName;
		};


		XMLView.prototype.isSubView = function() {
			return this._oContainingView != this;
		};

		/**
		 * If the HTML doesn't contain own content, it tries to reproduce existing content
		 * This is executed before the onAfterRendering of the child controls, to ensure that
		 * the HTML is already at its final position, before additional operations are executed.
		 */
		XMLView.prototype.onAfterRenderingBeforeChildren = function() {

			if ( this._$oldContent.length !== 0 ) {
				// Log.debug("after rendering for " + this);

				// move DOM of children into correct place in preserved DOM
				var aChildren = this.getAggregation("content");
				if ( aChildren ) {
					for (var i = 0; i < aChildren.length; i++) {

						// Get current DOM of the child or the invisible placeholder for it.
						// For children that do DOM preservation on their own, use the temporary DOM,
						// they'll move their old DOM themselves
						var oNewChildDOM =
								document.getElementById(RenderPrefixes.Temporary + aChildren[i].getId())
								|| aChildren[i].getDomRef()
								|| document.getElementById(RenderPrefixes.Invisible + aChildren[i].getId());

						// if such DOM exists, replace the placeholder in the view's DOM with it
						if ( oNewChildDOM ) {
							jQuery(document.getElementById(RenderPrefixes.Dummy + aChildren[i].getId())).replaceWith(oNewChildDOM);
						} // otherwise keep the dummy placeholder
					}
				}
				// move preserved DOM into place
				// Log.debug("moving preserved dom into place for " + this);
				jQuery(document.getElementById(RenderPrefixes.Temporary + this.getId())).replaceWith(this._$oldContent);
			}
			this._$oldContent = undefined;
		};

		XMLView.prototype._onChildRerenderedEmpty = function(oControl, oElement) {
			// when the render manager notifies us about an empty child rendering, we replace the old DOM with a dummy
			jQuery(oElement).replaceWith('<div id="' + RenderPrefixes.Dummy + oControl.getId() + '" class="sapUiHidden"/>');
			return true; // indicates that we have taken care
		};

		/**
		* Register a preprocessor for all views of a specific type.
		*
		* The preprocessor can be registered for several stages of view initialization, for xml views these are
		* either the plain "xml" or the already initialized "controls" , see {@link sap.ui.core.mvc.XMLView.PreprocessorType}.
		* For each type one preprocessor is executed. If there is a preprocessor passed to or activated at the
		* view instance already, that one is used. When several preprocessors are registered for one hook, it has to be made
		* sure, that they do not conflict when being processed serially.
		*
		* It can be either a module name as string of an implementation of {@link sap.ui.core.mvc.View.Preprocessor} or a
		* function with a signature according to {@link sap.ui.core.mvc.View.Preprocessor.process}.
		*
		* <strong>Note</strong>: Preprocessors work only in async views and will be ignored when the view is instantiated
		* in sync mode by default, as this could have unexpected side effects. You may override this behaviour by setting the
		* bSyncSupport flag to true.
		*
		* @public
		* @static
		* @param {string|sap.ui.core.mvc.XMLView.PreprocessorType} sType
		* 		the type of content to be processed
		* @param {string|function} vPreprocessor
		* 		module path of the preprocessor implementation or a preprocessor function
		* @param {boolean} bSyncSupport
		* 		declares if the vPreprocessor ensures safe sync processing. This means the preprocessor will be executed
		* 		also for sync views. Please be aware that any kind of async processing (like Promises, XHR, etc) may
		* 		break the view initialization and lead to unexpected results.
		* @param {boolean} [bOnDemand]
		* 		ondemand preprocessor which enables developers to quickly activate the preprocessor for a view,
		* 		by setting <code>preprocessors : { xml }</code>, for example.
		* @param {object} [mSettings]
		* 		optional configuration for preprocessor
		*/
		XMLView.registerPreprocessor = function(sType, vPreprocessor, bSyncSupport, bOnDemand, mSettings) {
			sType = sType.toUpperCase();
			if (XMLView.PreprocessorType[sType]) {
				View.registerPreprocessor(XMLView.PreprocessorType[sType], vPreprocessor, this.getMetadata().getClass()._sType, bSyncSupport, bOnDemand, mSettings);
			} else {
				Log.error("Preprocessor could not be registered due to unknown sType \"" + sType + "\"", this.getMetadata().getName());
			}
		};

		/**
		 * Specifies the available preprocessor types for XMLViews
		 *
		 * @see sap.ui.core.mvc.XMLView
		 * @see sap.ui.core.mvc.View.Preprocessor
		 * @enum {string}
		 * @public
		 */
		XMLView.PreprocessorType = {

			/**
			 * This preprocessor receives the plain xml source of the view and should also return a valid
			 * xml ready for view creation
			 * @public
			 */
			XML : "xml",

			/**
			 * This preprocessor receives a valid xml source for View creation without any template tags but with control
			 * declarations. These include their full IDs by which they can also be queried during runtime.
			 * @public
			 */
			VIEWXML : "viewxml",

			/**
			 * This preprocessor receives the control tree produced through the view source
			 * @public
			 */
			CONTROLS : "controls"
		};

		/**
		 * Dummy control for after rendering notification before onAfterRendering of
		 * child controls of the XMLView is called
		 * @extends sap.ui.core.Control
		 * @alias sap.ui.core.mvc.XMLAfterRenderingNotifier
		 * @private
		 */
		var XMLAfterRenderingNotifier = Control.extend("sap.ui.core.mvc.XMLAfterRenderingNotifier", {
			metadata: {
				library: "sap.ui.core"
			},
			renderer: function(oRM, oControl) {
				oRM.text(""); // onAfterRendering is only called if control produces output
			}
		});

		// Register OpenUI5 default preprocessor for templating
		XMLView.registerPreprocessor("xml", "sap.ui.core.util.XMLPreprocessor", true, true);

	return XMLView;

});