/*!
 * ${copyright}
 */

// Provides class sap.ui.model.odata.v2.ODataAnnotations
sap.ui.define(['sap/ui/model/odata/AnnotationParser', 'sap/ui/Device', 'sap/ui/base/EventProvider'],
	function(AnnotationParser, Device, EventProvider) {
	"use strict";

	///////////////////////////////////////////////// Hidden Functions /////////////////////////////////////////////////

	/**
	 * Creates a promise that always resolves from the given promise
	 *
	 * @param {Promise} pPromise The original promise, which may reject
	 * @returns {Promise} A new Promise that always resolves even if the original promise fails.
	 */
	function alwaysResolve(pPromise) {
		return pPromise.catch(function(oError) {
			return oError;
		});
	}

	/**
	 * Helper function to chain a Promise as a then-callback via bind.
	 * To chain promiseB after promiseA use promiseA.then(chain.bind(promiseB))
	 *
	 * @returns {object} The context of the method upon invocation
	 */
	function chain() {
		return this;
	}


	///////////////////////////////////////////////// Class Definition /////////////////////////////////////////////////

	/**
	 * @class Annotation loader for OData V2 services
	 *
	 * @author SAP SE
	 * @version
	 * ${version}
	 *
	 * @public
	 * @since 1.37.0
	 * @alias sap.ui.model.odata.v2.ODataAnnotations
	 * @extends sap.ui.base.EventProvider
	 */
	var ODataAnnotations = EventProvider.extend("sap.ui.model.odata.v2.ODataAnnotations", /** @lends sap.ui.model.odata.v2.ODataAnnotations.prototype */ {
		/**
		 * Creates a new instance of the ODataAnnotations annotation loader.
		 *
		 * @param {sap.ui.model.odata.ODataMetadata} oMetadata Metadata object with the metadata information needed to parse the annotations
		 * @param {map} mOptions Obligatory options
		 * @param {string|map|string[]|map[]} mOptions.source One or several annotation sources. See {@link sap.ui.model.odata.v2.ODataAnnotations#addSource} for more details
		 * @param {map} mOptions.headers A map of headers to be sent with every request. See {@link sap.ui.model.odata.v2.ODataAnnotations#setHeaders} for more details
		 * @param {boolean} mOptions.skipMetadata If set to <code>true</code>, the metadata document will not be parsed for annotations;
		 * @constructor
		 * @public
		 */
		constructor : function(oMetadata, mOptions) {
			// Allow event substription in constructor options
			EventProvider.apply(this, [ mOptions ]);

			this._oMetadata = oMetadata;
			// The promise to have (loaded,) parsed and merged the previously added source. This promise should never
			// reject to assign another promise "pPromise" use alwaysResolve(pPromise)
			this._pReadyToParseNext = oMetadata.loaded();
			this._pLoaded =  oMetadata.loaded();
			this._mCustomHeaders = {};
			this._mAnnotations = {};

			if (!mOptions || !mOptions.skipMetadata) {
				if (!mOptions) {
					mOptions = {};
				}

				if (!mOptions.source) {
					mOptions.source = [];
				} else if (Array.isArray(mOptions.source)) {
					mOptions.source = mOptions.source.slice(0);
				} else {
					mOptions.source = [ mOptions.source ];
				}

				mOptions.source.unshift({
					type: "xml",
					data: oMetadata.loaded().then(function(mParams) {
						return mParams["metadataString"];
					})
				});
			}

			if (mOptions) {
				this.setHeaders(mOptions.headers);
				this.addSource(mOptions.source);
			}

		},
		metadata : {
			publicMethods : [
				"getData", "addSource", "getHeaders", "setHeaders",
				"attachSuccess", "detachSuccess", "attachError", "detachError",
				"attachLoaded", "detachLoaded", "attachFailed", "detachFailed"
			]
		}
	});


	////////////////////////////////////////////////// Public Methods //////////////////////////////////////////////////

	/**
	 * Returns the parsed and merged annotation data object
	 *
	 * @public
	 * @returns {object} returns annotations data
	 */
	ODataAnnotations.prototype.getData = function() {
		return this._mAnnotations;
	};

	/**
	 * V1 API Compatibility method. @see sap.ui.model.odata.v2.ODataAnnotations#getData
	 * Returns the parsed and merged annotation data object
	 *
	 * @public
	 * @returns {object} returns annotations data
	 * @deprecated
	 */
	ODataAnnotations.prototype.getAnnotationsData = function() {
		return this._mAnnotations;
	};

	/**
	 * Returns a map of the headers that are sent with every request to an annotation URL
	 *
	 * @returns {map} A map of all headers that are sent with requests to annotation source URLs
	 */
	ODataAnnotations.prototype.getHeaders = function() {
		return jQuery.extend({}, this._mCustomHeaders, {
			"Accept-Language": sap.ui.getCore().getConfiguration().getLanguageTag() // Always overwrite
		});
	};

	/**
	 * Set custom headers which are provided in a key/value map. These headers are used for all requests.
	 * The "Accept-Language" header cannot be modified and is set using the core's language setting.
	 *
	 * To remove these headers, simply set the <code>mHeaders</code> parameter to <code>{}</code>. Please also note that when calling this method
	 * again all previous custom headers are removed unless they are specified again in the <code>mCustomHeaders</code> parameter.
	 *
	 * @param {map} mHeaders the header name/value map.
	 * @public
	 */
	ODataAnnotations.prototype.setHeaders = function(mHeaders) {
		// Copy headers (dont use reference to mHeaders map)
		this._mCustomHeaders = jQuery.extend({}, mHeaders);
	};

	/**
	 * Returns a promise that resolves when the annotation sources that were added up to this point were successfully
	 * (loaded,) parsed and merged
	 *
	 * @returns {Promise} The Promise that resolves/rejects after the last added sources have been processed
	 * @public
	 */
	ODataAnnotations.prototype.loaded = function() {
		return this._pLoaded;
	};

	/**
	 * An annotation source, containing either an URL to be loaded or an XML string to be parsed.
	 *
	 * @typedef {map} ODataAnnotations~Source
	 * @property {string} type The source type. Either "url" or "xml".
	 * @property {string|Promise} data Either the data or a Promise that resolves with the data string as argument.
	 *           In case the type is set to "url" the data must be an URL, in case it is set to "xml" the data must be
	 *           an XML string.
	 * @property {string} [xml] (Set internally, available in event-callback) The XML string of the annotation source
	 * @property {Document} [document] (Set internally, available in event-callback) The parsed XML document of the annotation source
	 * @property {map} [annotations] (Set internally, available in event-callback) The parsed Annotations object of the annotation source
	 * @public
	 */

	/**
	 * Adds one or several sources to the annotation loader. Sources will be loaded instantly but merged only after
	 * the previousl added source has either been successfully merged or failed.
	 *
	 * @param {string|string[]|ODataAnnotations~Source|ODataAnnotations~Source[]} vSource One or several
	 *        annotation source(s). Can be either a string or a map of the type <code>ODataAnnotations~Source</code> or an array
	 *        containing several (either strings or source objects).
	 * @returns {Promise} The promise to (load,) parse and merge the given source(s). The Promise resolves on success
	 *          with an array of maps containing properties <code>source</code> and <code>data</code>. See the parameters of the <code>success</code>
	 *          event for more details. The promise fails in case at least one source could not be (loaded,) parsed or
	 *          merged with an array of objects containing Errors and/or Success objects.
	 */
	ODataAnnotations.prototype.addSource = function(vSource) {
		if (!vSource || Array.isArray(vSource) && vSource.length === 0) {
			return this._pReadyToParseNext.then(function() { return []; });
		}

		if (!Array.isArray(vSource)) {
			vSource = [ vSource ];
		}

		// Make sure aSources contains source objects not simple URL strings
		var aSources = vSource.map(function(vAnnotationSource) {
			return (typeof vAnnotationSource === "string")
				? { type: "url", data: vAnnotationSource }
				: vAnnotationSource;
		});

		// Load all sources asynchronously
		var aSourcesLoadedPromises = aSources.map(this._loadSource.bind(this));

		// Chain promises to parse in the correct order
		var aMergePromises = [];
		var pContinue = this._pReadyToParseNext;
		for (var i = 0; i < aSourcesLoadedPromises.length; ++i) {
			var pSourceLoaded = aSourcesLoadedPromises[i];

			// Load, parse and merge
			pContinue =
				pContinue
				.then(chain.bind(pSourceLoaded))
				.then(this._parseSourceXML.bind(this))
				.then(this._parseSource.bind(this))
				.then(this._mergeSource.bind(this));

			// Fire success event after every successful merge
			pContinue.then(this._fireSuccess.bind(this));
			// Fire event in case of loading/parsing/merging error
			pContinue.catch(this._fireError.bind(this));

			aMergePromises.push(pContinue);

			// Parse next annotation source after this one was either successfully merged or failed
			pContinue = alwaysResolve(pContinue);
		}

		var pAllLoaded = this._promiseFinally(aMergePromises);
		var pSomeLoaded = this._promiseFinally(aMergePromises, true);

		// Fire "loaded"-event if all sources were (loaded,) parsed and merged successfully and "failed"-event if not
		pAllLoaded.then(this._fireLoaded.bind(this), this._fireFailed.bind(this));

		// Fire "someLoaded"- or "allFailed"- event after every group of sources that has been added
		pSomeLoaded.then(this._fireSomeLoaded.bind(this), this._fireAllFailed.bind(this));

		this._pLoaded = pSomeLoaded;
		this._pReadyToParseNext = alwaysResolve(pAllLoaded);

		return pAllLoaded;
	};


	/////////////////////////////////////////////////// Event Methods //////////////////////////////////////////////////

	/**
	 * Parameters of the <code>success</code> event
	 *
	 * @typedef {map} ODataAnnotations~successParameters
	 * @property {ODataAnnotations~Source} result The source type. Either "url" or "xml".
	 * @public
	 */

	/**
	 * The 'success' event is fired, whenever a source has been successfully (loaded,) parsed and merged into the
	 * annotation data.
	 *
	 * @name sap.ui.model.v2.ODataAnnotations#success
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {ODataAnnotations~successParameters} oControlEvent.getParameters
	 * @public
	 */

	/**
	 * Attaches the given callback to the <code>success</code> event, which is fired whenever a source has been successfully
	 * (loaded,) parsed and merged into the annotation data.
	 * The following parameters will be set on the event object that is given to the callback function:
	 *   <code>source</code> - A map containing the properties <code>type</code> - containing either "url" or "xml" - and <code>data</code> containing
	 *              the data given as source, either an URL or an XML string depending on how the source was added.
	 *
	 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function} fnFunction The event callback. This function will be called in the context of the oListener
	 *        object if given as the next argument.
	 * @param {object} [oListener] Object to use as context of the callback. If empty, the global context is used.
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} <code>this</code>-reference to allow method chaining.
	 * @public
	 */
	ODataAnnotations.prototype.attachSuccess = function(oData, fnFunction, oListener) {
		return this.attachEvent("success", oData, fnFunction, oListener);
	};

	/**
	 * Detaches the given callback from the <code>success</code> event.
	 * The passed function and listener object must match the ones previously used for attaching to the event.
	 *
	 * @param {function} fnFunction The event callback previously used with {@link sap.ui.model.odata.v2.ODataAnnotations#attachSuccess}.
	 * @param {object} [oListener] The same (if any) context object that was used when attaching to the <code>success</code> event.
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} <code>this</code>-reference to allow method chaining.
	 * @public
	 */
	ODataAnnotations.prototype.detachSuccess = function(fnFunction, oListener) {
		return this.detachEvent("success", fnFunction, oListener);
	};

	/**
	 * Parameters of the <code>error</code> event
	 *
	 * @typedef {map} ODataAnnotations~errorParameters
	 * @property {Error} result The error that occurred. Also contains the properties from ODataAnnotations~Source
	 *           that could be filled up to that point
	 * @public
	 */

	/**
	 * Attaches the given callback to the <code>error</code> event, which is fired whenever a source cannot be loaded, parsed or
	 * merged into the annotation data.
	 * The following parameters will be set on the event object that is given to the callback function:
	 *   <code>source</code> - A map containing the properties <code>type</code> - containing either "url" or "xml" - and <code>data</code> containing
	 *              the data given as source, either an URL or an XML string depending on how the source was added.
	 *   <code>error</code>  - An Error object describing the problem that occurred
	 *
	 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function} fnFunction The event callback. This function will be called in the context of the oListener
	 *        object if given as the next argument.
	 * @param {object} [oListener] Object to use as context of the callback. If empty, the global context is used.
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} <code>this</code>-reference to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.attachError = function(oData, fnFunction, oListener) {
		return this.attachEvent("error", oData, fnFunction, oListener);
	};

	/**
	 * Detaches the given callback from the <code>error</code> event.
	 * The passed function and listener object must match the ones previously used for attaching to the event.
	 *
	 * @param {function} fnFunction The event callback previously used with {@link sap.ui.model.odata.v2.ODataAnnotations#attachError}.
	 * @param {object} [oListener] The same (if any) context object that was used when attaching to the <code>error</code> event.
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} <code>this</code>-reference to allow method chaining.
	 * @public
	 */
	ODataAnnotations.prototype.detachError = function(fnFunction, oListener) {
		return this.detachEvent("error", fnFunction, oListener);
	};

	/**
	 * Parameters of the <code>loaded</code> event
	 *
	 * @typedef {map} ODataAnnotations~loadedParameters
	 * @property {ODataAnnotations~Source[]|Error[]|any} result An array of results and Errors
	 *           (@see sap.ui.model.v2.ODataAnnotations#success and @see sap.ui.model.v2.ODataAnnotations#error) that
	 *           occurred while loading a group of annotations
	 * @public
	 */

	 /**
	 * Attaches the given callback to the <code>loaded</code> event. This event is fired when all annotations from a group of
	 * sources was successfully (loaded,) parsed and merged.
	 * The parameter <code>result</code> will be set on the event argument and contains an array of all loaded sources as well
	 * as Errors in the order in which they had been added.
	 *
	 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function} fnFunction The event callback. This function will be called in the context of the oListener
	 *        object if given as the next argument.
	 * @param {object} [oListener] Object to use as context of the callback. If empty, the global context is used.
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} <code>this</code>-reference to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.attachLoaded = function(oData, fnFunction, oListener) {
		return this.attachEvent("loaded", oData, fnFunction, oListener);
	};

	/**
	 * Detaches the given callback from the <code>loaded</code> event.
	 * The passed function and listener object must match the ones previously used for attaching to the event.
	 *
	 * @param {function} fnFunction The event callback previously used with {@link sap.ui.model.odata.v2.ODataAnnotations#attachLoaded}.
	 * @param {object} [oListener] The same (if any) context object that was used when attaching to the <code>error</code> event.
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} <code>this</code>-reference to allow method chaining.
	 * @public
	 */
	ODataAnnotations.prototype.detachLoaded = function(fnFunction, oListener) {
		return this.detachEvent("loaded", fnFunction, oListener);
	};

	/**
	 * Attaches the given callback to the <code>failed</code> event. This event is fired when at least one annotation from a group
	 * of sources was not successfully (loaded,) parsed or merged.
	 * The parameter <code>result</code> will be set on the event argument and contains an array of Errors in the order in which
	 * the sources had been added.
	 *
	 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function} fnFunction The event callback. This function will be called in the context of the oListener
	 *        object if given as the next argument.
	 * @param {object} [oListener] Object to use as context of the callback. If empty, the global context is used.
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} <code>this</code>-reference to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.attachFailed = function(oData, fnFunction, oListener) {
		return this.attachEvent("failed", oData, fnFunction, oListener);
	};

	/**
	 * Detaches the given callback from the <code>failed</code> event.
	 * The passed function and listener object must match the ones previously used for attaching to the event.
	 *
	 * @param {function} fnFunction The event callback previously used with {@link sap.ui.model.odata.v2.ODataAnnotations#attachFailed}.
	 * @param {object} [oListener] The same (if any) context object that was used when attaching to the <code>error</code> event.
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} <code>this</code>-reference to allow method chaining.
	 * @public
	 */
	ODataAnnotations.prototype.detachFailed = function(fnFunction, oListener) {
		return this.detachEvent("failed", fnFunction, oListener);
	};

	/**
	 * This event exists for compatibility with the old Annotation loader
	 * Attaches the given callback to the <code>someLoaded</code> event. This event is fired when at least one annotation from a
	 * group of sources was successfully (loaded,) parsed and merged.
	 * The parameter <code>result</code> will be set on the event argument and contains an array of all loaded sources as well
	 * as Errors in the order in which they had been added.
	 *
	 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function} fnFunction The event callback. This function will be called in the context of the oListener
	 *        object if given as the next argument.
	 * @param {object} [oListener] Object to use as context of the callback. If empty, the global context is used.
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} <code>this</code>-reference to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.attachSomeLoaded = function(oData, fnFunction, oListener) {
		return this.attachEvent("someLoaded", oData, fnFunction, oListener);
	};

	/**
	 * Detaches the given callback from the <code>someLoaded</code> event.
	 * The passed function and listener object must match the ones previously used for attaching to the event.
	 *
	 * @param {function} fnFunction The event callback previously used with {@link sap.ui.model.odata.v2.ODataAnnotations#attachSomeLoaded}.
	 * @param {object} [oListener] The same (if any) context object that was used when attaching to the <code>error</code> event.
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} <code>this</code>-reference to allow method chaining.
	 * @public
	 */
	ODataAnnotations.prototype.detachSomeLoaded = function(fnFunction, oListener) {
		return this.detachEvent("someLoaded", fnFunction, oListener);
	};

	/**
	 * This event exists for compatibility with the old Annotation loader
	 * Attaches the given callback to the <code>allFailed</code> event. This event is fired when no annotation from a group of
	 * sources was successfully (loaded,) parsed and merged.
	 * The parameter <code>result</code> will be set on the event argument and contains an array of Errors in the order in which
	 * the sources had been added.
	 *
	 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function} fnFunction The event callback. This function will be called in the context of the oListener
	 *        object if given as the next argument.
	 * @param {object} [oListener] Object to use as context of the callback. If empty, the global context is used.
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} <code>this</code>-reference to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.attachAllFailed = function(oData, fnFunction, oListener) {
		return this.attachEvent("allFailed", oData, fnFunction, oListener);
	};

	/**
	 * Detaches the given callback from the <code>allFailed</code> event.
	 * The passed function and listener object must match the ones previously used for attaching to the event.
	 *
	 * @param {function} fnFunction The event callback previously used with {@link sap.ui.model.odata.v2.ODataAnnotations#attachFailed}.
	 * @param {object} [oListener] The same (if any) context object that was used when attaching to the <code>error</code> event.
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} <code>this</code>-reference to allow method chaining.
	 * @public
	 */
	ODataAnnotations.prototype.detachAllFailed = function(fnFunction, oListener) {
		return this.detachEvent("allFailed", fnFunction, oListener);
	};

	/**
	 * Parameters of the <code>failed</code> event
	 *
	 * @typedef {map} ODataAnnotations~failedParameters
	 * @property {Error[]} result An array of Errors (@see sap.ui.model.v2.ODataAnnotations#error) that occurred while
	 *           loading a group of annotations
	 * @public
	 */



	////////////////////////////////////////////////// Private Methods /////////////////////////////////////////////////

	/**
	 * Fires the <code>success</code> event whenever a source has sucessfull been (loaded,) parsed and merged into the annotation
	 * data.
	 *
	 * @param {map} mResult The filled source-map of the successfull loading and parsing
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} Returns <code>this</code> to allow method chaining.
	 * @private
	 */
	ODataAnnotations.prototype._fireSuccess = function(mResult) {
		return this.fireEvent("success", { result: mResult }, false, false);
	};

	/**
	 * Fires the <code>error</code> event whenever a source could not be (loaded,) parsed or merged into the annotation
	 * data.
	 *
	 * @param {Error} oError The error that occurred.
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} Returns <code>this</code> to allow method chaining.
	 * @private
	 */
	ODataAnnotations.prototype._fireError = function(oError) {
		return this.fireEvent("error", { result: oError }, false, false);
	};


	/**
	 * Fires the <code>loaded</code> event with an array of results in the result-parameter of the event
	 *
	 * @param {ODataAnnotations~Source[]} aResults An array of results
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} Returns <code>this</code> to allow method chaining.
	 * @private
	 */
	ODataAnnotations.prototype._fireLoaded = function(aResults) {
		return this.fireEvent("loaded", { result: aResults }, false, false);
	};

	/**
	 * Fires the <code>failed</code> event with an array of results and errors in the result-parameter of the event
	 *
	 * @param {Error[]} aErrors An array of Errors
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} Returns <code>this</code> to allow method chaining.
	 * @private
	 */
	ODataAnnotations.prototype._fireFailed = function(aErrors) {
		return this.fireEvent("failed", { result: aErrors }, false, false);
	};

	/**
	 * Fires the <code>someLoaded</code> event with an array of results and errors in the result-parameter of the event
	 *
	 * @param {ODataAnnotations~Source[]|Error[]|any} aResults An array of results and Errors
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} Returns <code>this</code> to allow method chaining.
	 * @private
	 */
	ODataAnnotations.prototype._fireSomeLoaded = function(aResults) {
		return this.fireEvent("someLoaded", { result: aResults }, false, false);
	};

	/**
	 * Fires the <code>failed</code> event with an array of errors in the result-parameter of the event
	 *
	 * @param {Error[]} aErrors An array of Errors
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} Returns <code>this</code> to allow method chaining.
	 * @private
	 */
	ODataAnnotations.prototype._fireAllFailed = function(aErrors) {
		return this.fireEvent("allFailed", { result: aErrors }, false, false);
	};

	/**
	 * Loads a given source (ODataAnnotations~Source) if necessary and returns a promise that resolves
	 * if the source could be loaded or no laoding is necessary. In case the source type is neither "xml" nor "url" or
	 * the loading of the source fails, the promise rejects.
	 *
	 * @param {ODataAnnotations~Source} mSource The source to be loaded
	 * @returns {Promise} The Promise to load the source if necessary
	 * @private
	 */
	ODataAnnotations.prototype._loadSource = function(mSource) {
		if (mSource.data instanceof Promise) {
			return mSource.data.then(function(sData) {
				return this._loadSource({
					type: mSource.type,
					data: sData
				});
			}.bind(this));
		} else if (mSource.type === "xml") {
			return Promise.resolve({
				type: mSource.type,
				data: mSource.data,
				xml: mSource.data
			});
		} else if (mSource.type === "url") {
			return this._loadUrl(mSource);
		} else {
			return Promise.reject({
				error: new Error("Unknown source type: \"" + mSource.type + "\""),
				source: mSource
			});
		}
	};

	/**
	 * Loads a source with the type "url" and returns a promise that resolves if the source was successfully loaded or
	 * rejects in case of failure.
	 *
	 * @param {ODataAnnotations~Source} mSource The source of type "url" to be loaded
	 * @returns {Promise} The Promise to load the source
	 * @private
	 */
	ODataAnnotations.prototype._loadUrl = function(mSource) {
		jQuery.sap.assert(mSource.type === "url", "Source type must be \"url\" in order to be loaded");

		return new Promise(function(fnResolve, fnReject) {
			var mAjaxOptions = {
				url: mSource.data,
				async: true,
				headers: this.getHeaders(),
				beforeSend: function(oXHR) {
					// Force text/plain so the XML parser does not run twice
					oXHR.overrideMimeType("text/plain");
				}
			};

			var fnSuccess = function(sData, sStatusText, oXHR) {
				mSource.xml = oXHR.responseText;
				fnResolve(mSource);
			};

			var fnFail = function(oXHR, sStatusText) {
				var oError = new Error("Could not load annotation URL: \"" + mSource.data + "\"");
				oError.source = mSource;
				fnReject(oError);
			};

			jQuery.ajax(mAjaxOptions).done(fnSuccess).fail(fnFail);
		}.bind(this));
	};

	/**
	 * Parses a source as xml an returns a promise that resolves when the source's <code>xml</code> property string could be
	 * successfully parsed as an XML document.
	 *
	 * @param {ODataAnnotations~Source} mSource The source that should be parsed with its <code>xml</code> property set to a string
	 * @returns {Promise} The Promise to parse the source as XML
	 * @private
	 */
	ODataAnnotations.prototype._parseSourceXML = function(mSource) {
		jQuery.sap.assert(typeof mSource.xml === "string", "Source must contain XML string in order to be parsed");

		return new Promise(function(fnResolve, fnReject) {
			var oXMLDocument;
			if (Device.browser.internet_explorer) {
				// IE is a special case: Even though it supports DOMParser with the latest versions, the resulting
				// document does not support the evaluate method, which leads to a differnt kind of XPath implementation
				// being used in the AnnotationParser. Thus IE (the MSXML implementation) must always be handled separately.
				oXMLDocument = new window.ActiveXObject("Microsoft.XMLDOM");
				oXMLDocument.preserveWhiteSpace = true;

				// The MSXML implementation does not parse documents with the technically correct "xmlns:xml"-attribute
				// So if a document contains 'xmlns:xml="http://www.w3.org/XML/1998/namespace"', IE will stop working.
				// This hack removes the XML namespace declaration which is then implicitly set to the default one.
				var sXMLContent = mSource.xml;
				if (sXMLContent.indexOf(" xmlns:xml=") > -1) {
					sXMLContent = sXMLContent
						.replace(' xmlns:xml="http://www.w3.org/XML/1998/namespace"', "")
						.replace(" xmlns:xml='http://www.w3.org/XML/1998/namespace'", "");
				}

				oXMLDocument.loadXML(sXMLContent);
			} else if (window.DOMParser) {
				oXMLDocument = new DOMParser().parseFromString(mSource.xml, 'application/xml');
			}

			var oError;
			if (!oXMLDocument) {
				oError = new Error("The browser does not support XML parsing. Annotations are not available.");
				oError.source = mSource;
				fnReject(oError);
			} else if (
				// Check for errors: All browsers including IE
				oXMLDocument.getElementsByTagName("parsererror").length > 0 ||
				// Check for errors: IE 11 special case
				(oXMLDocument.parseError && oXMLDocument.parseError.errorCode !== 0)
			) {
				oError = new Error("There were errors parsing the XML.");
				oError.source = {
					type: mSource.type,
					data: mSource.data,
					xml: mSource.xml,
					document: oXMLDocument
				};
				fnReject(oError);
			} else {
				fnResolve({
					type: mSource.type,
					data: mSource.data,
					xml: mSource.xml,
					document: oXMLDocument
				});
			}
		});
	};

	/**
	 * Parses a source that has been parsed to an XML document as annotations and returns a promise that resolves when
	 * the source's <code>document</code> property could be successfully parsed as an annotations object.
	 *
	 * @param {ODataAnnotations~Source} mSource The source that should be parsed with its <code>document</code> property set to an XML document
	 * @returns {Promise} The Promise to parse the source as an annotations object
	 * @private
	 */
	ODataAnnotations.prototype._parseSource = function(mSource) {
		// On IE we have a specia format for the XML documents on every other browser it must be a "Document" object.
		jQuery.sap.assert(mSource.document instanceof window.Document || Device.browser.internet_explorer, "Source must contain a parsed XML document converted to an annotation object");

		var oAnnotations = AnnotationParser.parse(this._oMetadata, mSource.document);

		if (oAnnotations) {
			return Promise.resolve({
				type: mSource.type,
				data: mSource.data,
				xml: mSource.xml,
				document: mSource.document,
				annotations: oAnnotations
			});
		} else {
			var oError = new Error("Annotations XML document could not be parsed");
			oError.source = mSource;
			return Promise.reject(oError);
		}
	};

	/**
	 * Merges the parsed annotation object of the given source into the internal annotations object. The source's
	 * <code>annotations</code> property must contain an annotations object.
	 *
	 * @param {ODataAnnotations~Source} mSource The source that should be parsed with its <code>annotations</code> property set to an annotations object
	 * @returns {Promise} The Promise to merge the source's annotations object into the internal annotations object
	 * @private
	 */
	ODataAnnotations.prototype._mergeSource = function(mSource) {
		jQuery.sap.assert(typeof mSource.annotations === "object", "Source must contain an annotation object to be merged");

		// Merge must be done on Term level, this is why the original line does not suffice any more:
		//     jQuery.extend(true, this.oAnnotations, mAnnotations);
		// Terms are defined on different levels, the main one is below the target level, which is directly
		// added as property to the annotations object and then in the same way inside two special properties
		// named "propertyAnnotations" and "EntityContainer"

		function mergeAnnotation(sName, mSource, mTarget) {
			// Everythin in here must be on Term level, so we overwrite the target with the data from the source

			if (Array.isArray(mSource[sName])) {
				// This is a collection - make sure it stays one
				mTarget[sName] = mSource[sName].slice(0);
			} else {
				// Make sure the map exists in the target
				mTarget[sName] = mTarget[sName] || {};

				for (var sKey in mSource[sName]) {
					mTarget[sName][sKey] = mSource[sName][sKey];
				}
			}
		}

		var sTarget, sTerm;
		var aSpecialCases = ["propertyAnnotations", "EntityContainer", "annotationReferences"];

		// First merge standard annotations
		for (sTarget in mSource.annotations) {
			if (aSpecialCases.indexOf(sTarget) !== -1) {
				// Skip these as they are special properties that contain Target level definitions
				continue;
			}

			// ...all others contain Term level definitions
			mergeAnnotation(sTarget, mSource.annotations, this._mAnnotations);
		}

		// Now merge special cases
		for (var i = 0; i < aSpecialCases.length; ++i) {
			var sSpecialCase = aSpecialCases[i];

			this._mAnnotations[sSpecialCase] = this._mAnnotations[sSpecialCase] || {}; // Make sure the the target namespace exists
			for (sTarget in mSource.annotations[sSpecialCase]) {
				for (sTerm in mSource.annotations[sSpecialCase][sTarget]) {
					// Now merge every term
					this._mAnnotations[sSpecialCase][sTarget] = this._mAnnotations[sSpecialCase][sTarget] || {};
					mergeAnnotation(sTerm, mSource.annotations[sSpecialCase][sTarget], this._mAnnotations[sSpecialCase][sTarget]);
				}
			}
		}

		return Promise.resolve(mSource);
	};

	/**
	 * Returns a new <code>Promise</code> that resolves or rejects after all given promises have either resolved or rejected. This is
	 * like Promise.all() but waits until all promises have finished and the reject gets all results
	 * (mixed results and errors). In case the second argument is set to true, this does not behave like <code>Promise.all()</code>
	 * but resolves if at least one of the given promises resolves.
	 *
	 * @param {Promise[]} aPromises The promises to be collected and made to resolve/rejected.
	 * @param {boolean} bFailOnlyIfAllFail If set to true the resulting promise only rejects if all given promises
	 *        rejects.
	 * @returns {Promise} The collected Promise
	 */
	ODataAnnotations.prototype._promiseFinally = function(aPromises, bFailOnlyIfAllFail) {
		return new Promise(function(fnResolve, fnReject) {
			var bAllSucceeded = true;
			var bAllFailed    = true;
			var iPromises = aPromises.length;
			var aResults = [];

			var fnCheckDone = function() {
				if (aResults.length === iPromises) {
					// Add for Promise compatibility with v1 version:
					aResults.annotations = this.getData();
					if (bAllSucceeded || (bFailOnlyIfAllFail && !bAllFailed)) {
						fnResolve(aResults);
					} else {
						fnReject(aResults);
					}
				}
			}.bind(this);

			function onRejectOrResolve(bCatch, oResult) {
				bAllSucceeded = bCatch  ? false : bAllSucceeded;
				bAllFailed    = !bCatch ? false : bAllFailed;
				aResults.push(oResult);
				fnCheckDone();
			}

			for (var i = 0; i < iPromises; ++i) {
				aPromises[i].then(onRejectOrResolve.bind(this, false));
				aPromises[i].catch(onRejectOrResolve.bind(this, true));
			}
		}.bind(this));
	};

	///////////////////////////////////////////////////// End Class ////////////////////////////////////////////////////

	return ODataAnnotations;

});
