/*!
 * ${copyright}
 */

// Provides object sap.ui.core.util.XMLPreprocessor
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/base/BindingParser',
	'sap/ui/base/ManagedObject',
	'sap/ui/base/SyncPromise',
	'sap/ui/core/XMLTemplateProcessor',
	'sap/ui/model/BindingMode',
	'sap/ui/model/CompositeBinding',
	'sap/ui/model/Context'
], function (jQuery, BindingParser, ManagedObject, SyncPromise, XMLTemplateProcessor, BindingMode,
		CompositeBinding, Context) {
	"use strict";

	var sNAMESPACE = "http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1",
		sXMLPreprocessor = "sap.ui.core.util.XMLPreprocessor",
		aPerformanceCategories = [sXMLPreprocessor],
		sPerformanceGetResolvedBinding = sXMLPreprocessor + "/getResolvedBinding",
		sPerformanceInsertFragment = sXMLPreprocessor + "/insertFragment",
		sPerformanceProcess = sXMLPreprocessor + ".process",
		oSyncPromiseResolved = SyncPromise.resolve(),
		oSyncPromiseResolvedTrue = SyncPromise.resolve(true),
		fnToString = Object.prototype.toString,
		oUNBOUND = {}, // @see getAny
		mVisitors = {}, // maps "<namespace URI> <local name>" to visitor function
		/**
		 * <template:with> control holding the models and the bindings. Also used as substitute for
		 * any control during template processing in order to resolve property bindings. Supports
		 * nesting of template instructions.
		 */
		With = ManagedObject.extend("sap.ui.core.util._with", {
			metadata : {
				properties : {
					any : "any"
				},
				aggregations : {
					child : {multiple : false, type : "sap.ui.core.util._with"}
				}
			}
		}),
		/**
		 * <template:repeat> control extending the "with" control by an aggregation which is used to
		 * get the list binding.
		 */
		Repeat = With.extend("sap.ui.core.util._repeat", {
			metadata : {
				aggregations : {
					list : {multiple : true, type : "n/a", _doesNotRequireFactory : true}
				}
			},

			updateList : function () {
				// Override sap.ui.base.ManagedObject#updateAggregation for "list" and do nothing to
				// avoid that any child objects are created
			}
		});

	/**
	 * Creates the context interface for a call to the given control's formatter of the binding part
	 * with given index.
	 *
	 * @param {sap.ui.core.util._with} oWithControl
	 *   the "with" control
	 * @param {object} mSettings
	 *   map/JSON-object with initial property values, etc.
	 * @param {number} [i]
	 *   index of part inside a composite binding
	 * @param {sap.ui.model.Binding|sap.ui.model.Binding[]|sap.ui.model.Context}
	 *   [vBindingOrContext]
	 *   single binding or model context or array of parts; if this parameter is given,
	 *   "oWithControl" and "i" are ignored, else it is lazily computed from those two
	 * @returns {sap.ui.core.util.XMLPreprocessor.IContext}
	 *   the callback interface
	 */
	function createContextInterface(oWithControl, mSettings, i, vBindingOrContext) {
		/*
		 * Returns the single binding or model context related to the current formatter call.
		 *
		 * @param {number} [iPart]
		 *   index of part in case of the root formatter of a composite binding
		 * @returns {sap.ui.model.Binding|sap.ui.model.Context}
		 *   single binding or model context
		 */
		function getBindingOrContext(iPart) {
			if (!vBindingOrContext) {
				// lazy initialization
				// BEWARE: this is not yet defined when createContextInterface() is called!
				vBindingOrContext = oWithControl.getBinding("any");

				if (vBindingOrContext instanceof CompositeBinding) {
					vBindingOrContext = vBindingOrContext.getBindings();

					if (i !== undefined) { // not a root formatter
						vBindingOrContext = vBindingOrContext[i];
					}
				}
			}

			return Array.isArray(vBindingOrContext)
				? vBindingOrContext[iPart]
				: vBindingOrContext;
		}

		/**
		 * Returns the resolved path for the given single binding or model context.
		 *
		 * @param {sap.ui.model.Binding|sap.ui.model.Context} oBindingOrContext
		 *   single binding or model context
		 * @returns {string}
		 *   the resolved path
		 */
		function getPath(oBindingOrContext) {
			return oBindingOrContext instanceof Context
				? oBindingOrContext.getPath()
				: oBindingOrContext.getModel().resolve(
					oBindingOrContext.getPath(), oBindingOrContext.getContext());
		}

		/**
		 * Context interface provided by XML template processing as an additional first argument to
		 * any formatter function which opts in to this mechanism. Candidates for such formatter
		 * functions are all those used in binding expressions which are evaluated during XML
		 * template processing, including those used inside template instructions like
		 * <code>&lt;template:if></code>. The formatter function needs to be marked with a property
		 * <code>requiresIContext = true</code> to express that it requires this extended signature
		 * (compared to ordinary formatter functions). The usual arguments are provided after the
		 * first one (currently: the raw value from the model).
		 *
		 * This interface provides callback functions to access the model and path  which are needed
		 * to process OData V4 annotations. It initially offers a subset of methods from
		 * {@link sap.ui.model.Context} so that formatters might also be called with a context
		 * object for convenience, e.g. outside of XML template processing (see below for an
		 * exception to this rule).
		 *
		 * <b>Example:</b> Suppose you have a formatter function called "foo" like below and it is
		 * used within an XML template like
		 * <code>&lt;template:if test="{path: '...', formatter: 'foo'}"></code>.
		 * In this case <code>foo</code> is called with arguments <code>oInterface, vRawValue</code>
		 * such that
		 * <code>oInterface.getModel().getObject(oInterface.getPath()) === vRawValue</code> holds.
		 * <pre>
		 * window.foo = function (oInterface, vRawValue) {
		 *     //TODO ...
		 * };
		 * window.foo.requiresIContext = true;
		 * </pre>
		 *
		 * <b>Composite Binding Examples:</b> Suppose you have the same formatter function and it is
		 * used in a composite binding like <code>&lt;Text text="{path: 'Label', formatter: 'foo'}:
		 * {path: 'Value', formatter: 'foo'}"/></code>.
		 * In this case <code>oInterface.getPath()</code> refers to ".../Label" in the 1st call and
		 * ".../Value" in the 2nd call. This means each formatter call knows which part of the
		 * composite binding it belongs to and behaves just as if it was an ordinary binding.
		 *
		 * Suppose your formatter is not used within a part of the composite binding, but at the
		 * root of the composite binding in order to aggregate all parts like <code>
		 * &lt;Text text="{parts: [{path: 'Label'}, {path: 'Value'}], formatter: 'foo'}"/></code>.
		 * In this case <code>oInterface.getPath(0)</code> refers to ".../Label" and
		 * <code>oInterface.getPath(1)</code> refers to ".../Value". This means, the root formatter
		 * can access the ith part of the composite binding at will (since 1.31.0); see also
		 * {@link #.getInterface getInterface}.
		 * The function <code>foo</code> is called with arguments such that <code>
		 * oInterface.getModel(i).getObject(oInterface.getPath(i)) === arguments[i + 1]</code>
		 * holds.
		 * This use is not supported within an expression binding, that is, <code>&lt;Text
		 * text="{= ${parts: [{path: 'Label'}, {path: 'Value'}], formatter: 'foo'} }"/></code>
		 * does not work as expected because the property <code>requiresIContext = true</code> is
		 * ignored.
		 *
		 * To distinguish those two use cases, just check whether <code>oInterface.getModel() ===
		 * undefined</code>, in which case the formatter is called on root level of a composite
		 * binding. To find out the number of parts, probe for the smallest non-negative integer
		 * where <code>oInterface.getModel(i) === undefined</code>.
		 * This additional functionality is, of course, not available from
		 * {@link sap.ui.model.Context}, i.e. such formatters MUST be called with an instance of
		 * this context interface.
		 *
		 * @interface
		 * @name sap.ui.core.util.XMLPreprocessor.IContext
		 * @public
		 * @since 1.27.1
		 */
		return /** @lends sap.ui.core.util.XMLPreprocessor.IContext */ {
			/**
			 * Returns a context interface for the indicated part in case of the root formatter of a
			 * composite binding. The new interface provides access to the original settings, but
			 * only to the model and path of the indicated part:
			 * <pre>
			 * this.getInterface(i).getSetting(sName) === this.getSetting(sName);
			 * this.getInterface(i).getModel() === this.getModel(i);
			 * this.getInterface(i).getPath() === this.getPath(i);
			 * </pre>
			 *
			 * If a path is given, the new interface points to the resolved path as follows:
			 * <pre>
			 * this.getInterface(i, "foo/bar").getPath() === this.getPath(i) + "/foo/bar";
			 * this.getInterface(i, "/absolute/path").getPath() === "/absolute/path";
			 * </pre>
			 * A formatter which is not at the root level of a composite binding can also provide a
			 * path, but must not provide an index:
			 * <pre>
			 * this.getInterface("foo/bar").getPath() === this.getPath() + "/foo/bar";
			 * this.getInterface("/absolute/path").getPath() === "/absolute/path";
			 * </pre>
			 * Note that at least one argument must be present.
			 *
			 * @param {number} [iPart]
			 *   index of part in case of the root formatter of a composite binding
			 * @param {string} [sPath]
			 *   a path, interpreted relative to <code>this.getPath(iPart)</code>
			 * @returns {sap.ui.core.util.XMLPreprocessor.IContext}
			 *   the context interface related to the indicated part
			 * @throws {Error}
			 *   In case an index is given but the current interface does not belong to the root
			 *   formatter of a composite binding, or in case the given index is invalid (e.g.
			 *   missing or out of range), or in case a path is missing because no index is given,
			 *   or in case a path is given but the model cannot not create a binding context
			 *   synchronously
			 * @public
			 * @since 1.31.0
			 */
			getInterface : function (iPart, sPath) {
				var oBaseContext, oBindingOrContext, oModel;

				if (typeof iPart === "string") {
					sPath = iPart;
					iPart = undefined;
				}

				getBindingOrContext(); // initialize vBindingOrContext
				if (Array.isArray(vBindingOrContext)) {
					if (iPart >= 0 && iPart < vBindingOrContext.length) {
						oBindingOrContext = vBindingOrContext[iPart];
					} else {
						throw new Error("Invalid index of part: " + iPart);
					}
				} else if (iPart !== undefined) {
					throw new Error("Not the root formatter of a composite binding");
				} else if (sPath) {
					oBindingOrContext = vBindingOrContext;
				} else {
					throw new Error("Missing path");
				}

				if (sPath) {
					oModel = oBindingOrContext.getModel();
					if (sPath.charAt(0) !==  '/') { // relative path needs a base context
						oBaseContext = oBindingOrContext instanceof Context
							? oBindingOrContext
							: oModel.createBindingContext(oBindingOrContext.getPath(),
								oBindingOrContext.getContext());
					}
					oBindingOrContext = oModel.createBindingContext(sPath, oBaseContext);
					if (!oBindingOrContext) {
						throw new Error(
							"Model could not create binding context synchronously: " + oModel);
					}
				}

				return createContextInterface(null, mSettings, undefined, oBindingOrContext);
			},

			/**
			 * Returns the model related to the current formatter call.
			 *
			 * @param {number} [iPart]
			 *   index of part in case of the root formatter of a composite binding
			 *   (since 1.31.0)
			 * @returns {sap.ui.model.Model}
			 *   the model related to the current formatter call, or (since 1.31.0)
			 *   <code>undefined</code> in case of a root formatter if no <code>iPart</code> is
			 *   given or if <code>iPart</code> is out of range
			 * @public
			 */
			getModel : function (iPart) {
				var oBindingOrContext = getBindingOrContext(iPart);
				return oBindingOrContext && oBindingOrContext.getModel();
			},

			/**
			 * Returns the absolute path related to the current formatter call.
			 *
			 * @param {number} [iPart]
			 *   index of part in case of the root formatter of a composite binding (since 1.31.0)
			 * @returns {string}
			 *   the absolute path related to the current formatter call, or (since 1.31.0)
			 *   <code>undefined</code> in case of a root formatter if no <code>iPart</code> is
			 *   given or if <code>iPart</code> is out of range
			 * @public
			 */
			getPath : function (iPart) {
				var oBindingOrContext = getBindingOrContext(iPart);
				return oBindingOrContext && getPath(oBindingOrContext);
			},

			/**
			 * Returns the value of the setting with the given name which was provided to the XML
			 * template processing.
			 *
			 * @param {string} sName
			 *   the name of the setting
			 * @returns {any}
			 *   the value of the setting
			 * @throws {Error}
			 *   if the name is one of the reserved names: "bindingContexts", "models"
			 * @public
			 */
			getSetting : function (sName) {
				if (sName === "bindingContexts" || sName === "models") {
					throw new Error("Illegal argument: " + sName);
				}
				return mSettings[sName];
			}
		};
	}

	/**
	 * Gets the value of the control's "any" property via the given binding info.
	 *
	 * @param {sap.ui.core.util._with} oWithControl
	 *   the "with" control
	 * @param {object} oBindingInfo
	 *   the binding info
	 * @param {object} mSettings
	 *   map/JSON-object with initial property values, etc.
	 * @param {object} oScope
	 *   map of currently known aliases
	 * @param {boolean} bAsync
	 *   whether async processing is allowed and a <code>Promise</code> may be returned
	 * @returns {any|Promise}
	 *   the property value or a <code>Promise</code> resolving with the property value (in case
	 *   async processing is allowed and supported by the respective model) or <code>oUNBOUND</code>
	 *   in case the binding is not ready (because it refers to a model which is not available)
	 * @throws {Error}
	 */
	function getAny(oWithControl, oBindingInfo, mSettings, oScope, bAsync) {
		var bValueAsPromise = false;

		/*
		 * Prepares the given binding info or part of it; makes it "one time" and binds its
		 * formatter function (if opted in) to an interface object.
		 *
		 * @param {object} oInfo
		 *   a binding info or a part of it
		 * @param {number} i
		 *   index of binding info's part (if applicable)
		 */
		function prepare(oInfo, i) {
			var fnFormatter = oInfo.formatter,
				oModel,
				sModelName = oInfo.model;

			if (oInfo.path && oInfo.path.indexOf(">") > 0) {
				sModelName = oInfo.path.slice(0, oInfo.path.indexOf(">"));
			}
			oModel = oWithControl.getModel(sModelName);

			if (fnFormatter && fnFormatter.requiresIContext === true) {
				fnFormatter = oInfo.formatter
					= fnFormatter.bind(null, createContextInterface(oWithControl, mSettings, i));
			}
			// wrap formatter only if there is a formatter and async is allowed and either
			// - we use $$valueAsPromise ourselves, or
			// - we are top-level and at least one child has used $$valueAsPromise
			if (fnFormatter && bAsync
					&& (oModel && oModel.$$valueAsPromise || i === undefined && bValueAsPromise)) {
				oInfo.formatter = function () {
					var that = this;
					return SyncPromise.all(arguments).then(function (aArguments) {
						return fnFormatter.apply(that, aArguments);
					});
				};
				oInfo.formatter.textFragments = fnFormatter.textFragments;
			}
			oInfo.mode = BindingMode.OneTime;
			oInfo.parameters = oInfo.parameters || {};
			oInfo.parameters.scope = oScope;
			if (bAsync && oModel && oModel.$$valueAsPromise) { // opt-in to async behavior
				bValueAsPromise = oInfo.parameters.$$valueAsPromise = true;
			}
		}

		try {
			if (oBindingInfo.parts) {
				oBindingInfo.parts.forEach(prepare);
			}
			prepare(oBindingInfo);

			oWithControl.bindProperty("any", oBindingInfo);
			return oWithControl.getBinding("any")
				? oWithControl.getAny()
				: oUNBOUND;
		} finally {
			oWithControl.unbindProperty("any", true);
		}
	}

	/**
	 * Load required modules for the given element synchronously, according to its
	 * "template:require" attribute which may contain a space separated list.
	 *
	 * @param {Element} oElement
	 *   any XML DOM element
	 */
	function requireFor(oElement) {
		var sModuleNames = oElement.getAttribute("template:require");
		if (sModuleNames) {
			jQuery.sap.require.apply(jQuery.sap, sModuleNames.split(" "));
		}
	}

	/**
	 * Visits the given elements one-by-one, calls the given callback for each of them and stops
	 * and waits for each sync promise returned by the callback before going on to the next element.
	 * If a sync promise resolves with a truthy value, iteration stops and the corresponding element
	 * becomes the result of the returned sync promise.
	 *
	 * @param {any[]} aElements
	 *   Whatever elements we want to visit
	 * @param {function} fnCallback
	 *   A function to be called with a single element and its index and the array (like
	 *   {@link Array#find} does it), returning a {sap.ui.base.SyncPromise}.
	 * @returns {sap.ui.base.SyncPromise}
	 *   A sync promise which resolves with the first element where the callback's sync promise
	 *   resolved with a truthy value, or resolves with <code>undefined</code> as soon as the last
	 *   callback's sync promise has resolved, or is rejected with a corresponding error if any
	 *   callback returns a rejected sync promise or throws an error
	 * @throws {Error}
	 *   If the first callback throws
	 */
	function stopAndGo(aElements, fnCallback) {
		var i = -1;

		/*
		 * Visits the next element, taking the result of the previous callback into account.
		 *
		 * @param {boolean} bFound
		 *   Whether an element was approved by the corresponding callback
		 * @returns {sap.ui.base.SyncPromise|any}
		 *   First call returns a <code>sap.ui.base.SyncPromise</code> which resolves with a later
		 *   call's result.
		 */
		function next(bFound) {
			if (bFound) {
				return aElements[i];
			}
			i += 1;
			if (i < aElements.length) {
				return fnCallback(aElements[i], i, aElements).then(next);
			}
		}

		return aElements.length
			? next()
			: oSyncPromiseResolved;
	}

	/**
	 * Serializes the element with its attributes.
	 * <p>
	 * BEWARE: makes no attempt at encoding, DO NOT use in a security critical manner!
	 *
	 * @param {Element} oElement any XML DOM element
	 * @returns {string} the serialization
	 */
	function serializeSingleElement(oElement) {
		var oAttribute,
			oAttributesList = oElement.attributes,
			sText = "<" + oElement.nodeName,
			i, n;

		for (i = 0, n = oAttributesList.length; i < n; i += 1) {
			oAttribute = oAttributesList.item(i);
			sText += " " + oAttribute.name + '="' + oAttribute.value + '"';
		}
		return sText + (oElement.childNodes.length ? ">" : "/>");
	}

	/**
	 * Wrapper for the "visitNode" function which is sometimes returned by
	 * {@link sap.ui.core.util.XMLPreprocessor.plugIn}. Delegates to the appropriate "visitNode"
	 * function from the callback interface (which is not yet available at plug-in time) and makes
	 * sure no extra arguments are passed.
	 *
	 * @param {Element} oElement
	 *   The XML DOM Element
	 * @param {sap.ui.core.util.XMLPreprocessor.ICallback} oInterface
	 *   The callback interface
	 *
	 * @see sap.ui.core.util.XMLPreprocessor.visitNodeWrapper
	 */
	function visitNodeWrapper(oElement, oInterface) {
		oInterface.visitNode(oElement);
	}

	/**
	 * @classdesc
	 * The XML pre-processor for template instructions in XML views.
	 *
	 * @namespace sap.ui.core.util.XMLPreprocessor
	 * @public
	 * @since 1.27.1
	 */
	return /** @lends sap.ui.core.util.XMLPreprocessor */ {
		/**
		 * Plug-in the given visitor which is called for each matching XML element.
		 *
		 * @param {function} [fnVisitor]
		 *   Visitor function, will be called with the matching XML DOM element and a
		 *   {@link sap.ui.core.util.XMLPreprocessor.ICallback callback interface} which uses a map
		 *   of currently known variables; must return <code>undefined</code>.
		 *   Must be either a function or <code>null</code>, nothing else.
		 * @param {string} sNamespace
		 *   The expected namespace URI; must not contain spaces;
		 *   "http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1" and "sap.ui.core" are
		 *   reserved
		 * @param {string} [sLocalName]
		 *   The expected local name; if it is missing, the local name is ignored for a match.
		 * @returns {function}
		 *   The visitor function which previously matched elements with the given namespace and
		 *   local name, or a function which calls "visitNode" but never <code>null</code> so that
		 *   you can safely delegate to it.
		 *   In general, you cannot restore the previous state by calling <code>plugIn</code> again
		 *   with this function.
		 * @throws {Error}
		 *   If visitor or namespace is invalid
		 *
		 * @private
		 */
		plugIn : function (fnVisitor, sNamespace, sLocalName) {
			var fnOldVisitor = mVisitors[sNamespace];

			if (fnVisitor !== null && typeof fnVisitor !== "function"
					|| fnVisitor === visitNodeWrapper) {
				throw new Error("Invalid visitor: " + fnVisitor);
			}
			if (!sNamespace || sNamespace === sNAMESPACE || sNamespace === "sap.ui.core"
					|| sNamespace.indexOf(" ") >= 0) {
				throw new Error("Invalid namespace: " + sNamespace);
			}
			jQuery.sap.log.debug("Plug-in visitor for namespace '" + sNamespace
				+ "', local name '" + sLocalName + "'", fnVisitor, sXMLPreprocessor);
			if (sLocalName) {
				sNamespace = sNamespace + " " + sLocalName;
				fnOldVisitor = mVisitors[sNamespace] || fnOldVisitor;
			}
			mVisitors[sNamespace] = fnVisitor;
			return fnOldVisitor || visitNodeWrapper;
		},

		/**
		 * @private
		 */
		visitNodeWrapper : visitNodeWrapper,

		/**
		 * Performs template pre-processing on the given XML DOM element.
		 *
		 * @param {Element} oRootElement
		 *   the XML DOM element to process
		 * @param {object} oViewInfo
		 *   info object of the calling instance
		 * @param {string} oViewInfo.caller
		 *   identifies the caller of this preprocessor; used as a prefix for log or exception
		 *   messages
		 * @param {string} oViewInfo.componentId
		 *   ID of the owning component (since 1.31; needed for extension point support)
		 * @param {string} oViewInfo.name
		 *   the view name (since 1.31; needed for extension point support)
		 * @param {boolean} [oViewInfo.sync=false]
		 *   whether the view is synchronous (since 1.57; needed for asynchronous XML templating)
		 * @param {object} [mSettings={}]
		 *   map/JSON-object with initial property values, etc.
		 * @param {object} mSettings.bindingContexts
		 *   binding contexts relevant for template pre-processing
		 * @param {object} mSettings.models
		 *   models relevant for template pre-processing
		 * @param {boolean} mSettings.X-async
		 *   eXperimental async switch, to be removed soon
		 * @returns {Element}
		 *   <code>oRootElement</code>
		 *
		 * @private
		 */
		process : function (oRootElement, oViewInfo, mSettings) {
			var bAsync,
				sCaller = oViewInfo.caller,
				bDebug
					= jQuery.sap.log.isLoggable(jQuery.sap.log.Level.DEBUG, sXMLPreprocessor),
				bCallerLoggedForWarnings = bDebug, // debug output already contains caller
				sCurrentName = oViewInfo.name, // current view or fragment name
				mFragmentCache = {},
				sName,
				iNestingLevel = 0,
				oScope = {}, // for BindingParser.complexParser()
				fnSupportInfo = oViewInfo._supportInfo,
				bWarning
					= jQuery.sap.log.isLoggable(jQuery.sap.log.Level.WARNING, sXMLPreprocessor);

			/**
			 * Returns a callback interface for visitor functions which provides access to private
			 * {@link sap.ui.core.util.XMLPreprocessor} functionality using the given "with"
			 * control.
			 *
			 * @param {sap.ui.core.util._with} oWithControl
			 *   The "with" control
			 * @returns {sap.ui.core.util.XMLPreprocessor.ICallback}
			 *  A callback interface
			 */
			function createCallbackInterface(oWithControl) {
				/**
				 * Callback interface for visitor functions which provides access to private
				 * {@link sap.ui.core.util.XMLPreprocessor} functionality using a map of currently
				 * known variables. Initially, these are the variables known to the XML
				 * pre-processor when it reaches the visitor's matching element (see
				 * {@link sap.ui.core.util.XMLPreprocessor.plugIn}). They can be overridden or
				 * replaced via {@link sap.ui.core.util.XMLPreprocessor.ICallback.with}.
				 *
				 * @interface
				 * @name sap.ui.core.util.XMLPreprocessor.ICallback
				 * @private
				 * @see sap.ui.core.util.XMLPreprocessor.plugIn
				 */
				return /** @lends sap.ui.core.util.XMLPreprocessor.ICallback */ {
					/**
					 * Returns the model's context which corresponds to the given simple binding
					 * path. Uses the map of currently known variables.
					 *
					 * @param {string} [sPath=""]
					 *   A simple binding path which may include a model name ("a variable"), for
					 *   example "var>some/relative/path", but not a binding ("{...}")
					 * @returns {sap.ui.model.Context}
					 *   The corresponding context which holds the model and the resolved, absolute
					 *   path
					 * @throws {Error}
					 *   If a binding is given, if the path refers to an unknown model, or if the
					 *   path cannot be resolved (typically because a relative path was given for a
					 *   model without a binding context)
					 */
					getContext : function (sPath) {
						var oBindingInfo,
							oModel,
							sResolvedPath;

						sPath = sPath || "";
						if (sPath[0] === "{") {
							throw new Error("Must be a simple path, not a binding: " + sPath);
						}
						oBindingInfo = BindingParser.simpleParser("{" + sPath + "}");
						oModel = oWithControl.getModel(oBindingInfo.model);
						if (!oModel) {
							throw new Error("Unknown model '" + oBindingInfo.model + "': " + sPath);
						}
						sResolvedPath = oModel.resolve(oBindingInfo.path,
							oWithControl.getBindingContext(oBindingInfo.model));
						if (!sResolvedPath) {
							throw new Error("Cannot resolve path: " + sPath);
						}
						return oModel.createBindingContext(sResolvedPath);
					},

					/**
					 * Interprets the given XML DOM attribute value as a binding and returns the
					 * resulting value. Takes care of unescaping and thus also of constant
					 * expressions; warnings are logged for (formatter) functions which are not
					 * found. Uses the map of currently known variables.
					 *
					 * @param {string} sValue
					 *   An XML DOM attribute value
					 * @param {Element} [oElement]
					 *   The XML DOM element the attribute value belongs to (needed only for
					 *   warnings which are logged to the console)
					 * @returns {any}
					 *   The resulting value
					 * @throws {Error}
					 *   If the binding is not ready (because it refers to a model which is not
					 *   available) or for other reasons (for example, an error thrown by a
					 *   formatter)
					 *
					 * @function
					 * @public
					 * @since 1.39.0
					 */
					getResult : function (sValue, oElement) {
						var vResult = getResolvedBinding(sValue, oElement, oWithControl, true);

						if (vResult === oUNBOUND) {
							throw new Error("Binding not ready: " + sValue);
						}
						return vResult;
					},

					/**
					 * Returns the settings object for XML template processing.
					 *
					 * @returns {object}
					 *   settings for the XML preprocessor; might contain the properties
					 *   "bindingContexts" and "models" and maybe others
					 *
					 * @function
					 * @public
					 * @since 1.41.0
					 */
					getSettings : function () {
						return mSettings;
					},

					/**
					 * Returns the view info object for XML template processing.
					 *
					 * @returns {object}
					 *   info object of the XML preprocessor's calling instance; might contain the
					 *   string properties "caller", "componentId", "name" and maybe others
					 *
					 * @function
					 * @public
					 * @since 1.41.0
					 */
					getViewInfo : function () {
						return jQuery.extend(true, {}, oViewInfo);
					},

					/**
					 * Inserts the fragment with the given name in place of the given element. Loads
					 * the fragment, takes care of caching (for the current pre-processor run) and
					 * visits the fragment's content once it has been imported into the element's
					 * owner document and put into place.
					 *
					 * @param {string} sFragmentName
					 *   The fragment's resolved name
					 * @param {Element} oElement
					 *   The XML DOM element to be replaced
					 * @throws {Error}
					 *   If a cycle is detected (same <code>sFragmentName</code> and
					 *   <code>oControl</code>)
					 *
					 * @function
					 * @public
					 * @since 1.39.0
					 */
					insertFragment : function (sFragmentName, oElement) {
						insertFragment(sFragmentName, oElement, oWithControl);
					},

					/**
					 * Visit the given attribute of the given element. If the attribute value
					 * represents a binding expression that can be resolved, it is replaced with
					 * the resulting value.
					 *
					 * @param {Element} oElement
					 *   The XML DOM element
					 * @param {Attr} oAttribute
					 *   One of the element's attribute nodes
					 *
					 * @function
					 * @public
					 * @see sap.ui.core.util.XMLPreprocessor.ICallback.visitAttributes
					 * @since 1.51.0
					 */
					visitAttribute : function (oElement, oAttribute) {
						visitAttribute(oElement, oAttribute, oWithControl);
					},

					/**
					 * Visits all attributes of the given element. If an attribute value represents
					 * a binding expression that can be resolved, it is replaced with the resulting
					 * value.
					 *
					 * @param {Element} oElement
					 *   The XML DOM element
					 *
					 * @function
					 * @public
					 * @see sap.ui.core.util.XMLPreprocessor.ICallback.getResult
					 * @since 1.39.0
					 */
					visitAttributes : function (oElement) {
						visitAttributes(oElement, oWithControl);
					},

					/**
					 * Visits all child nodes of the given node via {@link
					 * sap.ui.core.util.XMLPreprocessor.ICallback.visitNode visitNode}.
					 *
					 * @param {Node} oNode
					 *   The XML DOM node
					 *
					 * @function
					 * @public
					 * @since 1.39.0
					 */
					visitChildNodes : function (oNode) {
						visitChildNodes(oNode, oWithControl);
					},

					/**
					 * Visits the given node and either processes a template instruction, calls
					 * a visitor, or simply calls both {@link
					 * sap.ui.core.util.XMLPreprocessor.ICallback.visitAttributes visitAttributes}
					 * and {@link sap.ui.core.util.XMLPreprocessor.ICallback.visitChildNodes
					 * visitChildNodes}.
					 *
					 * @param {Node} oNode
					 *   The XML DOM node
					 *
					 * @function
					 * @public
					 * @since 1.39.0
					 */
					visitNode : function (oNode) {
						visitNode(oNode, oWithControl);
					},

					/**
					 * Returns a callback interface instance for the given map of variables which
					 * override currently known variables of the same name in <code>this</code>
					 * parent interface or replace them altogether. Each variable name becomes a
					 * named model with a corresponding object binding and can be used inside the
					 * XML template in the usual way, that is, with a binding expression like
					 * <code>"{var>some/relative/path}"</code> (see example).
					 *
					 * <b>Example:</b> Suppose the XML pre-processor knows a variable named "old"
					 * and a visitor defines a new variable relative to it as follows.
					 * Then {@link sap.ui.core.util.XMLPreprocessor.ICallback.getResult getResult}
					 * for a binding which refers to the new variable using a relative path
					 * ("{new>relative}") has the same result as for a binding to the old variable
					 * with a compound path ("{old>prefix/relative}").
					 *
					 * <pre>
					 * oInterface.with({"new" : oInterface.getContext("old>prefix")})
					 *     .getResult("{new>relative}")
					 *     === oInterface.getResult("{old>prefix/relative}"); // true
					 * </pre>
					 *
					 * BEWARE: Previous callback interface instances derived from the same parent
					 * (<code>this</code>) become invalid (that is, they forget about inherited
					 * variables) once a new instance is derived.
					 *
					 * @param {object} [mVariables={}]
					 *   Map from variable name (string) to value ({@link sap.ui.model.Context})
					 * @param {boolean} [bReplace=false]
					 *   Whether only the given variables are known in the new callback interface
					 *   instance, no inherited ones
					 * @returns {sap.ui.core.util.XMLPreprocessor.ICallback}
					 *   A callback interface instance
					 *
					 * @function
					 * @public
					 * @see sap.ui.core.util.XMLPreprocessor.ICallback.getResult
					 * @since 1.39.0
					 */
					"with" : function (mVariables, bReplace) {
						var oContext,
							bHasVariables = false,
							sName,
							oNewWithControl = new With();

						if (!bReplace) {
							oWithControl.setChild(oNewWithControl);
						}

						for (sName in mVariables) {
							oContext = mVariables[sName];
							bHasVariables = true;
							oNewWithControl.setModel(oContext.getModel(), sName);
							oNewWithControl.bindObject({
								model : sName,
								path : oContext.getPath()
							});
						}

						return bHasVariables || bReplace
							? createCallbackInterface(oNewWithControl)
							: this;
					}
				};
			}

			/*
			 * Outputs a debug message with the current nesting level; takes care not to construct
			 * the message or serialize XML in vain.
			 *
			 * @param {Element} [oElement]
			 *   any XML DOM element which is serialized to the details
			 * @param {...string} aTexts
			 *   the main text of the message is constructed from the rest of the arguments by
			 *   joining them separated by single spaces
			 */
			function debug(oElement) {
				if (bDebug) {
					jQuery.sap.log.debug(
						getNestingLevel() + Array.prototype.slice.call(arguments, 1).join(" "),
						oElement && serializeSingleElement(oElement), sXMLPreprocessor);
				}
			}

			/**
			 * Outputs a debug message "Finished" with the given nesting level; takes care not to
			 * serialize XML in vain.
			 *
			 * @param {Element} oElement
			 *   any XML DOM element which is serialized to the details
			 */
			function debugFinished(oElement) {
				if (bDebug) {
					jQuery.sap.log.debug(getNestingLevel() + "Finished",
						"</" + oElement.nodeName + ">", sXMLPreprocessor);
				}
			}

			/**
			 * Throws an error with the given message, prefixing it with the caller identification
			 * (separated by a colon) and appending the serialization of the given XML DOM element.
			 * Additionally logs the message and serialization as error with caller identification
			 * as details.
			 *
			 * @param {string} sMessage
			 *   an error message which must end with a space (and take into account that the
			 *   serialized XML is appended)
			 * @param {Element} oElement
			 *   the XML DOM element
			 */
			function error(sMessage, oElement) {
				sMessage = sMessage + serializeSingleElement(oElement);
				jQuery.sap.log.error(sMessage, sCaller, sXMLPreprocessor);
				throw new Error(sCaller + ": " + sMessage);
			}

			/**
			 * Determines the relevant children for the <template:if> element.
			 *
			 * @param {Element} oIfElement
			 *   the <template:if> XML DOM element
			 * @returns {Element[]}
			 *   the XML DOM element children (a <then>, zero or more <elseif> and possibly an
			 *   <else>) or null if there is no <then>
			 * @throws {Error}
			 *   if there is an unexpected child element
			 */
			function getIfChildren(oIfElement) {
				var oChild,
					aChildren = Array.prototype.filter.call(oIfElement.childNodes, isElementNode),
					i, n,
					bFoundElse = false;

				/*
				 * Tells whether the given XML DOM node is an element node.
				 *
				 * @param {Node} oNode - an XML DOM node
				 * @returns {boolean} whether the given node is an element node
				 */
				function isElementNode(oNode) {
					return oNode.nodeType === 1;
				}

				/*
				 * Tells whether the given XML DOM element has the template namespace and the given
				 * local name.
				 *
				 * @param {Element} oElement - an XML DOM element
				 * @param {string} sLocalName - a local name
				 * @returns {boolean} whether the given element has the given name
				 */
				function isTemplateElement(oElement, sLocalName) {
					return oElement.namespaceURI === sNAMESPACE
						&& oElement.localName === sLocalName;
				}

				if (!aChildren.length || !isTemplateElement(aChildren[0], "then")) {
					return null;
				}
				for (i = 1, n = aChildren.length; i < n; i += 1) {
					oChild = aChildren[i];
					if (bFoundElse) {
						error("Expected </" + oIfElement.prefix + ":if>, but instead saw ", oChild);
					}
					if (isTemplateElement(oChild, "else")) {
						bFoundElse = true;
					} else if (!isTemplateElement(oChild, "elseif")) {
						error("Expected <" + oIfElement.prefix + ":elseif> or <"
							+ oIfElement.prefix + ":else>, but instead saw ", aChildren[i]);
					}
				}
				return aChildren;
			}

			/**
			 * Returns the current nesting level as a string in square brackets with proper spacing.
			 *
			 * @returns {string}
			 *   "[<level>] "
			 */
			function getNestingLevel() {
				return (iNestingLevel < 10 ? "[ " : "[") + iNestingLevel + "] ";
			}

			/**
			 * Returns a JavaScript object which is identified by a dot-separated sequence of names.
			 * If the given compound name starts with a dot, it is interpreted relative to
			 * <code>oScope</code>.
			 *
			 * @param {string} sName
			 *   a dot-separated sequence of names that identify the required object
			 * @returns {object}
			 *   a JavaScript object which is identified by a sequence of names
			 */
			function getObject(sName) {
				// Note: jQuery.sap.getObject("", ...) === undefined
				return sName && sName.charAt(0) === "."
					? jQuery.sap.getObject(sName.slice(1), undefined, oScope)
					: jQuery.sap.getObject(sName);
			}

			/**
			 * Interprets the given value as a binding and returns the resulting value; takes care
			 * of unescaping and thus also of constant expressions.
			 *
			 * @param {string} sValue
			 *   an XML DOM attribute value
			 * @param {Element} oElement
			 *   the XML DOM element
			 * @param {sap.ui.core.util._with} oWithControl
			 *   the "with" control
			 * @param {boolean} bMandatory
			 *   whether a binding is actually required (e.g. by a <code>template:if</code>) and not
			 *   optional (e.g. for {@link resolveAttributeBinding}); if so, the binding parser
			 *   unescapes the given value (which is a prerequisite for constant expressions) and
			 *   warnings are logged for functions not found
			 * @param {function} [fnCallIfConstant]
			 *   optional function to be called in case the return value is obviously a constant,
			 *   not influenced by any binding
			 * @returns {any|Promise}
			 *   the resulting value or a <code>Promise</code> resolving with the property value (in
			 *   case async processing is allowed and supported by the respective model) or
			 *   <code>oUNBOUND</code> in case the binding is not ready (because it refers to a
			 *   model which is not available)
			 * @throws {Error}
			 */
			function getResolvedBinding(sValue, oElement, oWithControl, bMandatory,
					fnCallIfConstant) {
				var vBindingInfo;

				jQuery.sap.measure.average(sPerformanceGetResolvedBinding, "",
					aPerformanceCategories);
				vBindingInfo
					= BindingParser.complexParser(sValue, oScope, bMandatory, true, true)
					|| sValue; // in case there is no binding and nothing to unescape

				if (vBindingInfo.functionsNotFound) {
					if (bMandatory) {
						warn(oElement, 'Function name(s)',
							vBindingInfo.functionsNotFound.join(", "), 'not found');
					}
					jQuery.sap.measure.end(sPerformanceGetResolvedBinding);
					return oUNBOUND; // treat incomplete bindings as unrelated
				}

				if (typeof vBindingInfo === "object") {
					vBindingInfo = getAny(oWithControl, vBindingInfo, mSettings, oScope, bAsync);
					if (bMandatory && vBindingInfo === oUNBOUND) {
						warn(oElement, 'Binding not ready');
					}
				} else if (fnCallIfConstant) { // string
					fnCallIfConstant();
				}
				jQuery.sap.measure.end(sPerformanceGetResolvedBinding);
				return vBindingInfo;
			}

			/**
			 * Inserts the fragment with the given name in place of the given element. Loads the
			 * fragment, takes care of caching (for the current pre-processor run) and visits the
			 * fragment's content once it has been imported into the element's owner document and
			 * put into place. Loading of fragments is asynchronous if the template view is
			 * asynchronous.
			 *
			 * @param {string} sFragmentName
			 *   the fragment's resolved name
			 * @param {Element} oElement
			 *   the XML DOM element, e.g. <sap.ui.core:Fragment> or <core:ExtensionPoint>
			 * @param {sap.ui.core.util._with} oWithControl
			 *   the parent's "with" control
			 * @returns {sap.ui.base.SyncPromise}
			 *   A sync promise which resolves with <code>undefined</code> as soon as the fragment
			 *   has been inserted, or is rejected with a corresponding error if loading or visiting
			 *   fails.
			 * @throws {Error}
			 *   If a cycle is detected (same <code>sFragmentName</code> and
			 *   <code>oWithControl</code>)
			 */
			function insertFragment(sFragmentName, oElement, oWithControl) {
				var oFragmentPromise,
					fnLoad = bAsync
						? XMLTemplateProcessor.loadTemplatePromise
						: XMLTemplateProcessor.loadTemplate,
					sPreviousName = sCurrentName;

				// Note: It is perfectly valid to include the very same fragment again, as long as
				// the context is changed. So we check for cycles at the current "with" control.
				// A context change will create a new one.
				oWithControl.$mFragmentContexts = oWithControl.$mFragmentContexts || {};
				if (oWithControl.$mFragmentContexts[sFragmentName]) {
					error("Cyclic reference to fragment '" + sFragmentName + "' ", oElement);
				}

				iNestingLevel++;
				debug(oElement, "fragmentName =", sFragmentName);
				oWithControl.$mFragmentContexts[sFragmentName] = true;
				sCurrentName = sFragmentName;

				jQuery.sap.measure.average(sPerformanceInsertFragment, "", aPerformanceCategories);
				// take fragment promise from cache, then import fragment
				oFragmentPromise = mFragmentCache[sFragmentName];
				if (!oFragmentPromise) {
					mFragmentCache[sFragmentName] = oFragmentPromise
						= SyncPromise.resolve(fnLoad(sFragmentName, "fragment"));
				}
				return oFragmentPromise.then(function (oFragmentElement) {
					oFragmentElement = oElement.ownerDocument.importNode(oFragmentElement, true);
					jQuery.sap.measure.end(sPerformanceInsertFragment);

					requireFor(oFragmentElement);
					if (oFragmentElement.namespaceURI === "sap.ui.core"
						&& oFragmentElement.localName === "FragmentDefinition") {
						return liftChildNodes(oFragmentElement, oWithControl, oElement);
					}
					oElement.parentNode.insertBefore(oFragmentElement, oElement);
					return visitNode(oFragmentElement, oWithControl);
				}).then(function () {
					oElement.parentNode.removeChild(oElement);
					sCurrentName = sPreviousName;
					oWithControl.$mFragmentContexts[sFragmentName] = false;
					debugFinished(oElement);
					iNestingLevel--;
				});
			}

			/**
			 * Visits the child nodes of the given parent element. Lifts them up by inserting them
			 * before the target element.
			 *
			 * @param {Element} oParent the XML DOM DOM element
			 * @param {sap.ui.core.util._with} oWithControl the "with" control
			 * @param {Element} [oTarget=oParent] the target DOM element
			 * @returns {sap.ui.base.SyncPromise}
			 *   A sync promise which resolves with <code>undefined</code> as soon as visiting and
			 *   lifting is done, or is rejected with a corresponding error if visiting fails.
			 */
			function liftChildNodes(oParent, oWithControl, oTarget) {
				return visitChildNodes(oParent, oWithControl).then(function () {
					var oChild;

					oTarget = oTarget || oParent;
					while ((oChild = oParent.firstChild)) {
						oTarget.parentNode.insertBefore(oChild, oTarget);
					}
				});
			}

			/**
			 * Performs the test in the given element.
			 *
			 * @param {Element} oElement
			 *   the (<if> or <elseif>) XML DOM element
			 * @param {sap.ui.core.util._with} oWithControl
			 *   the "with" control
			 * @returns {sap.ui.base.SyncPromise}
			 *   A sync promise which resolves with the test result
			 */
			function performTest(oElement, oWithControl) {
				// constant test conditions are suspicious, but useful during development
				var fnCallIfConstant = warn.bind(null, oElement, 'Constant test condition'),
					vTest;

				try {
					vTest = getResolvedBinding(oElement.getAttribute("test"), oElement,
						oWithControl, true, fnCallIfConstant);
					if (vTest === oUNBOUND) {
						vTest = false;
					}
				} catch (ex) {
					warn(oElement, 'Error in formatter:', ex);
					vTest = undefined; // "test == undefined --> false" in debug log
				}
				return SyncPromise.resolve(vTest).then(function (vTest) {
					var bResult = !!vTest && vTest !== "false";

					if (bDebug) {
						if (typeof vTest === "string") {
							vTest = JSON.stringify(vTest);
						} else if (vTest === undefined) {
							vTest = "undefined";
						} else if (Array.isArray(vTest)) {
							vTest = "[object Array]";
						}
						debug(oElement, "test ==", vTest, "-->", bResult);
					}
					return bResult;
				});
			}

			/**
			 * Visit the given XML DOM attribute which represents any attribute of any element
			 * (other than template instructions). If the attribute value represents a binding
			 * expression, we try to resolve it using the "with" control instance.
			 *
			 * @param {Element} oElement
			 *   the owning XML DOM element
			 * @param {Attr} oAttribute
			 *   any XML DOM attribute node
			 * @param {sap.ui.core.util._with} oWithControl the "with" control
			 * @returns {sap.ui.base.SyncPromise}
			 *   A sync promise which resolves with <code>undefined</code> as soon as the binding
			 *   has been resolved, or is rejected with a corresponding error if getting the
			 *   binding's value fails.
			 */
			function resolveAttributeBinding(oElement, oAttribute, oWithControl) {
				return new SyncPromise(function (resolve) {
					resolve(getResolvedBinding(oAttribute.value, oElement, oWithControl, false));
				}).then(function (vValue) {
					if (vValue === oUNBOUND) {
						debug(oElement, 'Binding not ready for attribute', oAttribute.name);
					} else if (vValue === undefined) {
						// if the formatter returns null, the value becomes undefined
						// (the default value of _With.any)
						debug(oElement, "Removed attribute", oAttribute.name);
						oElement.removeAttribute(oAttribute.name);
					} else if (vValue !== oAttribute.value) {
						switch (typeof vValue) {
						case "boolean":
						case "number":
						case "string":
							debug(oElement, oAttribute.name, "=", vValue);
							oAttribute.value = vValue;
							break;

						default: // e.g. "function" or "object"; "undefined": see above
							debug(oElement, "Ignoring", fnToString.call(vValue),
								"value for attribute", oAttribute.name);
						}
					}
				}, function (oError) {
					// just don't replace XML attribute value
					debug(oElement, "Error in formatter of attribute", oAttribute.name, oError);
				});
			}

			/**
			 * Processes a <template:alias> instruction.
			 *
			 * @param {Element} oElement
			 *   the <template:alias> XML DOM element
			 * @param {sap.ui.core.util._with} oWithControl
			 *   the "with" control
			 * @returns {sap.ui.base.SyncPromise}
			 *   A sync promise which resolves with <code>undefined</code> as soon as the
			 *   <template:alias> instruction has been fully processed, or is rejected with a
			 *   corresponding error if visiting of child nodes fails.
			 * @throws {Error}
			 *   If the "name" attribute is not a proper relative name or if the "value" attribute
			 *   does not reference an object which is currently in scope
			 */
			function templateAlias(oElement, oWithControl) {
				var sName = oElement.getAttribute("name"),
					oNewValue,
					oOldValue,
					sValue = oElement.getAttribute("value");

				if (!sName || sName.length <= 1 || sName.lastIndexOf(".") !== 0) {
					error("Missing proper relative name in ", oElement);
				}
				sName = sName.slice(1);

				oNewValue = getObject(sValue);
				if (!oNewValue) {
					error("Invalid value in ", oElement);
				}

				oOldValue = oScope[sName];
				oScope[sName] = oNewValue;

				return liftChildNodes(oElement, oWithControl).then(function () {
					oElement.parentNode.removeChild(oElement);
					oScope[sName] = oOldValue; // no try/finally needed
				});
			}

			/**
			 * Replaces a <sap.ui.core:ExtensionPoint> element with the content of an XML fragment
			 * configured as a replacement (via component metadata, "customizing" and
			 * "sap.ui.viewExtensions"), or leaves it untouched in case no such replacement is
			 * currently configured.
			 *
			 * @param {Element} oElement
			 *   the <sap.ui.core:ExtensionPoint> XML DOM element
			 * @param {sap.ui.core.util._with} oWithControl
			 *   the parent's "with" control
			 * @returns {boolean}
			 *   whether the <sap.ui.core:ExtensionPoint> element has been replaced
			 */
			function templateExtensionPoint(oElement, oWithControl) {
				var sName = oElement.getAttribute("name"),
					vName = oUNBOUND,
					oViewExtension;

				try {
					// resolve name, no matter if CustomizingConfiguration is present!
					vName = getResolvedBinding(sName, oElement, oWithControl, true);
					if (vName !== oUNBOUND && vName !== sName) {
						// debug trace for dynamic names only
						debug(oElement, "name =", vName);
					}
				} catch (ex) {
					warn(oElement, 'Error in formatter:', ex);
				}

				var CustomizingConfiguration = sap.ui.require("sap/ui/core/CustomizingConfiguration");
				if (vName !== oUNBOUND && CustomizingConfiguration) {
					oViewExtension = CustomizingConfiguration.getViewExtension(sCurrentName, vName,
						oViewInfo.componentId);
					if (oViewExtension && oViewExtension.className === "sap.ui.core.Fragment"
							&& oViewExtension.type === "XML") {
						insertFragment(oViewExtension.fragmentName, oElement, oWithControl);
						return true;
					}
				}
				return false;
			}

			/**
			 * Loads and inlines the content of a <sap.ui.core:Fragment> element.
			 *
			 * @param {Element} oElement
			 *   the <sap.ui.core:Fragment> XML DOM element
			 * @param {sap.ui.core.util._with} oWithControl
			 *   the parent's "with" control
			 * @returns {sap.ui.base.SyncPromise}
			 *   A sync promise which resolves with <code>undefined</code> as soon as the fragment
			 *   has been inserted, or is rejected with a corresponding error if loading or visiting
			 *   fails.
			 */
			function templateFragment(oElement, oWithControl) {
				var sFragmentName = oElement.getAttribute("fragmentName"),
					vFragmentName;

				try {
					vFragmentName = getResolvedBinding(sFragmentName, oElement, oWithControl, true);
				} catch (ex) {
					warn(oElement, 'Error in formatter:', ex);
					return oSyncPromiseResolved;
				}

				if (vFragmentName !== oUNBOUND) {
					return SyncPromise.resolve(vFragmentName).then(function (sFragmentName) {
						return insertFragment(sFragmentName, oElement, oWithControl);
					});
				}
				return oSyncPromiseResolved;
			}

			/**
			 * Processes a <template:if> instruction.
			 *
			 * @param {Element} oIfElement
			 *   the <template:if> XML DOM element
			 * @param {sap.ui.core.util._with} oWithControl
			 *   the "with" control
			 * @returns {sap.ui.base.SyncPromise}
			 *   A sync promise which resolves with <code>undefined</code> as soon as the
			 *   <template:if> instruction has been fully processed, or is rejected with a
			 *   corresponding error if visiting child nodes fails.
			 */
			function templateIf(oIfElement, oWithControl) {
				iNestingLevel++;
				return stopAndGo(getIfChildren(oIfElement) || [oIfElement], function (oCandidate) {
					if (oCandidate.localName === "else") {
						return oSyncPromiseResolvedTrue;
					}
					if (oCandidate.localName === "then") {
						oCandidate = oIfElement;
					}
					return performTest(oCandidate, oWithControl);
				}).then(function (oSelectedElement) {
					// the selected element: <if>, <then>, <elseif>, <else>, or none at all
					return (oSelectedElement
						? liftChildNodes(oSelectedElement, oWithControl, oIfElement)
						: oSyncPromiseResolved
					).then(function () {
						oIfElement.parentNode.removeChild(oIfElement);
						debugFinished(oIfElement);
						iNestingLevel--;
					});
				});
			}

			/**
			 * Processes a <template:repeat> instruction.
			 *
			 * @param {Element} oElement
			 *   the <template:repeat> XML DOM element
			 * @param {sap.ui.core.template._with} oWithControl
			 *   the parent's "with" control
			 * @returns {sap.ui.base.SyncPromise}
			 *   A sync promise which resolves with <code>undefined</code> as soon as the loop is
			 *   done, or is rejected with a corresponding error if visiting child nodes fails.
			 * @throws {Error}
			 *   If the "name" attribute has an empty value, if the "list" attribute cannot be
			 *   parsed as a binding, or if that binding uses a model which is missing.
			 */
			function templateRepeat(oElement, oWithControl) {
				var sList = oElement.getAttribute("list") || "",
					oBindingInfo = BindingParser.complexParser(sList, oScope, false, true, true),
					aContexts,
					oListBinding,
					sModelName,
					oNewWithControl,
					sVar = oElement.getAttribute("var");

				if (sVar === "") {
					error("Missing variable name for ", oElement);
				}
				if (!oBindingInfo) {
					error("Missing binding for ", oElement);
				}
				if (oBindingInfo.functionsNotFound) {
					warn(oElement, 'Function name(s)', oBindingInfo.functionsNotFound.join(", "),
						'not found');
				}

				// set up a scope for the loop variable, so to say
				oNewWithControl = new Repeat();
				oWithControl.setChild(oNewWithControl);

				// use a list binding to get an array of contexts
				oBindingInfo.mode = BindingMode.OneTime;
				oNewWithControl.bindAggregation("list", oBindingInfo);
				oListBinding = oNewWithControl.getBinding("list");
				oNewWithControl.unbindAggregation("list", true);
				sModelName = oBindingInfo.model; // added by bindAggregation
				if (!oListBinding) {
					error("Missing model '" + sModelName + "' in ", oElement);
				}
				aContexts = oListBinding.getContexts(oBindingInfo.startIndex, oBindingInfo.length);

				// set up the model for the loop variable
				sVar = sVar || sModelName; // default loop variable is to keep the same model
				oNewWithControl.setModel(oListBinding.getModel(), sVar);

				// the actual loop
				iNestingLevel++;
				debug(oElement, "Starting");
				return stopAndGo(aContexts, function (oContext, i) {
					var oSourceNode = (i === aContexts.length - 1)
							? oElement
							: oElement.cloneNode(true);

					// Note: because sVar and sModelName refer to the same model instance, it is OK
					// to use sModelName's context for sVar as well (the name is not part of the
					// context!)
					oNewWithControl.setBindingContext(oContext, sVar);
					debug(oElement, sVar, "=", oContext.getPath());
					return liftChildNodes(oSourceNode, oNewWithControl, oElement);
				}).then(function () {
					debugFinished(oElement);
					iNestingLevel--;
					oElement.parentNode.removeChild(oElement);
				});
			}

			/**
			 * Processes a <template:with> instruction.
			 *
			 * @param {Element} oElement
			 *   the <template:with> XML DOM element
			 * @param {sap.ui.core.util._with} oWithControl
			 *   the parent's "with" control
			 * @returns {sap.ui.base.SyncPromise}
			 *   A sync promise which resolves with <code>undefined</code> as soon as the
			 *   <template:with> instruction has been fully processed, or is rejected with a
			 *   corresponding error if visiting of child nodes fails.
			 * @throws {Error}
			 *   If the "var" attribute is present with an empty value, or if the "path" attribute
			 *   refers to a missing model, or if the "helper" attribute does not refer to a
			 *   function which is currently in scope, or if that helper function returns a result
			 *   which is not a non-empty string.
			 */
			function templateWith(oElement, oWithControl) {
				var oBindingInfo,
					oModel,
					oNewWithControl,
					fnHelper,
					sHelper = oElement.getAttribute("helper"),
					vHelperResult,
					sPath = oElement.getAttribute("path"),
					sResolvedPath,
					sVar = oElement.getAttribute("var");

				if (sVar === "") {
					error("Missing variable name for ", oElement);
				}
				oNewWithControl = new With();
				oWithControl.setChild(oNewWithControl);

				oBindingInfo = BindingParser.simpleParser("{" + sPath + "}");
				sVar = sVar || oBindingInfo.model; // default variable is same model name

				if (sHelper || sVar) { // create a "named context"
					oModel = oWithControl.getModel(oBindingInfo.model);
					if (!oModel) {
						error("Missing model '" + oBindingInfo.model + "' in ", oElement);
					}
					sResolvedPath = oModel.resolve(oBindingInfo.path,
						oWithControl.getBindingContext(oBindingInfo.model));
					if (!sResolvedPath) {
						error("Cannot resolve path for ", oElement);
					}
					vHelperResult = oModel.createBindingContext(sResolvedPath);
					if (sHelper) {
						fnHelper = getObject(sHelper);
						if (typeof fnHelper !== "function") {
							error("Cannot resolve helper for ", oElement);
						}
						vHelperResult = fnHelper(vHelperResult);
					}
					if (vHelperResult instanceof Context) {
						oModel = vHelperResult.getModel();
						sResolvedPath = vHelperResult.getPath();
					} else if (vHelperResult !== undefined) {
						if (typeof vHelperResult !== "string" || vHelperResult === "") {
							error("Illegal helper result '" + vHelperResult + "' in ", oElement);
						}
						sResolvedPath = vHelperResult;
					}
					oNewWithControl.setModel(oModel, sVar);
					oNewWithControl.bindObject({
						model : sVar,
						path : sResolvedPath
					});
				} else {
					sResolvedPath = sPath;
					oNewWithControl.bindObject(sResolvedPath);
				}

				iNestingLevel++;
				debug(oElement, sVar, "=", sResolvedPath);
				if (oNewWithControl.getBindingContext(sVar)
						=== oWithControl.getBindingContext(sVar)) {
					// Warn and ignore the new "with" control when its binding context is
					// the same as a previous one.
					// We test identity because models cache and reuse binding contexts.
					warn(oElement, 'Set unchanged path:', sResolvedPath);
					oNewWithControl = oWithControl;
				}

				return liftChildNodes(oElement, oNewWithControl).then(function () {
					oElement.parentNode.removeChild(oElement);
					debugFinished(oElement);
					iNestingLevel--;
				});
			}

			/**
			 * Visits the given attribute of the given element. If the attribute value represents a
			 * binding expression that can be resolved, it is replaced with the resulting value.
			 *
			 * @param {Element} oElement the XML DOM element
			 * @param {Attr} oAttribute one of the element's attribute nodes
			 * @param {sap.ui.core.template._with} oWithControl the "with" control
			 * @returns {sap.ui.base.SyncPromise}
			 *   A sync promise which resolves with <code>undefined</code> as soon as the
			 *   attribute's value has been replaced, or is rejected with a corresponding error if
			 *   getting the binding's value fails.
			 */
			function visitAttribute(oElement, oAttribute, oWithControl) {
				if (fnSupportInfo) {
					fnSupportInfo({context:undefined /*context from node clone*/, env:{caller:"visitAttribute", before: {name: oAttribute.name, value: oAttribute.value}}});
				}
				return resolveAttributeBinding(oElement, oAttribute, oWithControl)
					.then(function () {
						if (fnSupportInfo) {
							fnSupportInfo({context:undefined /*context from node clone*/, env:{caller:"visitAttribute", after: {name: oAttribute.name, value: oAttribute.value}}});
						}
					});
			}

			/**
			 * Visits all attributes of the given element. If an attribute value represents a
			 * binding expression that can be resolved, it is replaced with the resulting value.
			 *
			 * @param {Element} oElement the XML DOM element
			 * @param {sap.ui.core.template._with} oWithControl the "with" control
			 * @returns {sap.ui.base.SyncPromise}
			 *   A sync promise which resolves with <code>undefined</code> as soon as all
			 *   attributes' values have been replaced, or is rejected with a corresponding error if
			 *   getting some binding's value fails.
			 */
			function visitAttributes(oElement, oWithControl) {
				/*
				 * Comparator for DOM attributes by name.
				 *
				 * @param {Attr} oAttributeA
				 * @param {Attr} oAttributeB
				 * @returns {number} <0, 0, >0
				 */
				function comparator(oAttributeA, oAttributeB) {
					return oAttributeA.name.localeCompare(oAttributeB.name);
				}

				return stopAndGo(
					// Note: iterate over a shallow copy to account for removal of attributes!
					// Note: sort attributes by name to achieve a stable log order across browsers
					Array.prototype.slice.apply(oElement.attributes).sort(comparator),
					function (oAttribute) {
						return visitAttribute(oElement, oAttribute, oWithControl);
					});
			}

			/**
			 * Visits all child nodes of the given node.
			 *
			 * @param {Node} oNode the XML DOM node
			 * @param {sap.ui.core.util._with} oWithControl the "with" control
			 * @returns {sap.ui.base.SyncPromise}
			 *   A sync promise which resolves with <code>undefined</code> as soon as visiting is
			 *   done, or is rejected with a corresponding error if visiting fails.
			 */
			function visitChildNodes(oNode, oWithControl) {
				return stopAndGo(
					// cache live collection so that removing a template node does not hurt
					Array.prototype.slice.apply(oNode.childNodes),
					function (oChild) {
						return visitNode(oChild, oWithControl);
					});
			}

			/**
			 * Visits the given node.
			 *
			 * @param {Node} oNode the XML DOM node
			 * @param {sap.ui.core.template._with} oWithControl the "with" control
			 * @returns {sap.ui.base.SyncPromise}
			 *   A sync promise which resolves with <code>undefined</code> as soon as visiting is
			 *   done, or is rejected with a corresponding error if visiting fails.
			 * @throws {Error}
			 *   If an unexpected tag in the template namespace is encountered, or if a plugged-in
			 *   visitor returns a value.
			 */
			function visitNode(oNode, oWithControl) {
				var fnVisitor,
					vVisitorResult;

				// process only ELEMENT_NODEs
				if (oNode.nodeType !== 1 /* Node.ELEMENT_NODE */) {
					return oSyncPromiseResolved;
				}
				if (fnSupportInfo) {
					fnSupportInfo({context:oNode, env:{caller:"visitNode", before: {name: oNode.tagName}}});
				}
				if (oNode.namespaceURI === sNAMESPACE) {
					switch (oNode.localName) {
					case "alias":
						return templateAlias(oNode, oWithControl);

					case "if":
						return templateIf(oNode, oWithControl);

					case "repeat":
						return templateRepeat(oNode, oWithControl);

					case "with":
						return templateWith(oNode, oWithControl);

					default:
						error("Unexpected tag ", oNode);
					}
				} else if (oNode.namespaceURI === "sap.ui.core") {
					switch (oNode.localName) {
					case "ExtensionPoint":
						if (templateExtensionPoint(oNode, oWithControl)) {
							return oSyncPromiseResolved;
						}
						break;

					case "Fragment":
						if (oNode.getAttribute("type") === "XML") {
							return templateFragment(oNode, oWithControl);
						}
						break;

					// no default
					}
				} else {
					fnVisitor = mVisitors[oNode.namespaceURI + " " + oNode.localName]
						|| mVisitors[oNode.namespaceURI];

					if (fnVisitor) {
						iNestingLevel++;
						debug(oNode, "Calling visitor");
						vVisitorResult = fnVisitor(oNode, createCallbackInterface(oWithControl));
						if (vVisitorResult !== undefined) {
							// prepare for later enhancements using return value
							error("Unexpected return value from visitor for ", oNode);
						}
						debugFinished(oNode);
						iNestingLevel--;
						return oSyncPromiseResolved;
					}
				}

				return visitAttributes(oNode, oWithControl).then(function () {
					return visitChildNodes(oNode, oWithControl);
				}).then(function () {
					if (fnSupportInfo) {
						fnSupportInfo({context:oNode, env:{caller:"visitNode", after: {name: oNode.tagName}}});
					}
				});
			}

			/*
			 * Outputs a warning message with the current nesting level; takes care not to
			 * construct the message or serialize XML in vain.
			 *
			 * @param {Element} [oElement]
			 *   any XML DOM element which is serialized to the details
			 * @param {...string} aTexts
			 *   the main text of the message is constructed from the rest of the arguments by
			 *   joining them separated by single spaces
			 */
			function warn(oElement) {
				if (bWarning) {
					if (!bCallerLoggedForWarnings) {
						bCallerLoggedForWarnings = true;
						jQuery.sap.log.warning("Warning(s) during processing of " + sCaller, null,
							sXMLPreprocessor);
					}
					jQuery.sap.log.warning(
						getNestingLevel() + Array.prototype.slice.call(arguments, 1).join(" "),
						oElement && serializeSingleElement(oElement), sXMLPreprocessor);
				}
			}

			jQuery.sap.measure.average(sPerformanceProcess, "", aPerformanceCategories);
			mSettings = mSettings || {};
			bAsync = !oViewInfo.sync && mSettings["X-async"];

			if (bDebug) {
				debug(undefined, "Start processing", sCaller);
				if (mSettings.bindingContexts instanceof Context) {
					debug(undefined, "undefined =", mSettings.bindingContexts);
				} else {
					for (sName in mSettings.bindingContexts) {
						debug(undefined, sName, "=", mSettings.bindingContexts[sName]);
					}
				}
			}
			if (fnSupportInfo) {
				fnSupportInfo({
						context: oRootElement,
						env: {
							caller:"view",
							viewinfo: jQuery.extend(true, {}, oViewInfo),
							settings: jQuery.extend(true, {}, mSettings),
							clone: oRootElement.cloneNode(true),
							type: "template"}
					});
			}
			requireFor(oRootElement);
			return visitNode(oRootElement, new With({
				models : mSettings.models,
				bindingContexts : mSettings.bindingContexts
			})).then(function () {
				debug(undefined, "Finished processing", sCaller);
				jQuery.sap.measure.end(sPerformanceProcess);
				return oRootElement;
			}).unwrap();
		}
	};
}, /* bExport= */ true);
