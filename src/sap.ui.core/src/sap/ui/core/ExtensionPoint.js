/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/future", "sap/base/Log", "sap/ui/core/mvc/View", "sap/ui/core/Component"],
	function(future, Log, View, Component) {
		"use strict";


		/**
		 * @alias sap.ui.core.ExtensionPoint
		 * @namespace
		 * @public
		 */
		const ExtensionPoint = {};

		/**
			 * API documentation see ExtensionPoint.load() (v2 API) and sap.ui.extensionpoint() (v1 API).
			 *
			 * Used only internally by this module, as well as the XMLTemplateProcessor.
			 *
			 * @param {sap.ui.core.mvc.View|sap.ui.core.Fragment} oContainer the containing UI5 element, either a View or a Fragment instance
			 * @param {string} sExtName the name of the extension-point
			 * @param {function} fnCreateDefaultContent a function which creates the default content of an extension-point. Either given via public API or statically defined in {@link sap.ui.core.XMLTemplateProcessor}.
			 * @param {sap.ui.core.Control} oTargetControl the target control into which the extension-point's content will be inserted
			 * @param {string} sAggregationName the aggregation name inside the target control. The content controls of the extension-point will be inserted into this aggregation.
			 * @private
			 */
		ExtensionPoint._factory = function(oContainer, sExtName, fnCreateDefaultContent, oTargetControl, sAggregationName) {
			var oExtensionConfig, oView, vResult, sViewOrFragmentName;

			// do we have a view to check or do we need to check for configuration for a fragment?
			if (oContainer) {
				if (oContainer.isA("sap.ui.core.mvc.View")) {
					sViewOrFragmentName = oContainer.sViewName;
					oView = oContainer;
				} else if (oContainer.isA("sap.ui.core.Fragment")) {
					sViewOrFragmentName = oContainer.getFragmentName();
					oView = oContainer._oContainingView;
				}

				// if customizing is enabled we read the extension-point from the merged manifests of the owner component
				oExtensionConfig = Component.getCustomizing(oContainer, {
					type: "sap.ui.viewExtensions",
					name: sViewOrFragmentName,
					extensionName: sExtName
				});
			}

			// Extension Point - is something configured?
			if (oExtensionConfig) {
				if (oExtensionConfig.className) {
					Log.info("Customizing: View extension found for extension point '" + sExtName
							+ "' in View '" + oView.sViewName + "': " + oExtensionConfig.className + ": " + (oExtensionConfig.viewName || oExtensionConfig.fragmentName));

					// create factory configuration
					var sId = oView && oExtensionConfig.id ? oView.createId(oExtensionConfig.id) : oExtensionConfig.id;
					var oFactoryConfig = {
						async: true,
						id: sId,
						type: oExtensionConfig.type
					};

					if (oExtensionConfig.className === "sap.ui.core.Fragment") {
						// We cannot model the Fragment class as a dependency of the ExtensionPoint class,
						// since the XML Fragments rely on the XMLTP for parsing and thus create a cyclic dependency:
						// XMLTP -> ExtensionPoint -> Fragment -> XMLTP
						var Fragment = sap.ui.require("sap/ui/core/Fragment");

						oFactoryConfig.fragmentName = oExtensionConfig.fragmentName;
						oFactoryConfig.containingView = oView;

						// Require Fragment factory if needed
						if (Fragment) {
							vResult = Fragment.load(oFactoryConfig);
						} else {
							vResult = new Promise(function(fnResolve, fnReject){
								sap.ui.require(["sap/ui/core/Fragment"], function(Fragment) {
									fnResolve(Fragment.load(oFactoryConfig));
								}, fnReject);
							});
						}

					} else if (oExtensionConfig.className === "sap.ui.core.mvc.View") {
						oFactoryConfig.viewName = oExtensionConfig.viewName;

						vResult = View.create(oFactoryConfig);
					} else {
						// unknown extension class
						future.warningThrows("Customizing: Unknown extension className configured in Component.js for extension point '" + sExtName
								+ "' in View '" + oView.sViewName + "': " + oExtensionConfig.className + ".", { suffix: "Extension className will be ignored."});
					}
				} else {
					future.warningThrows("Customizing: no extension className configured in Component.js for extension point '" + sExtName
							+ "' in View '" + oView.sViewName + "': " + oExtensionConfig.className);
				}
			} else if (ExtensionPoint._fnExtensionProvider) {
				var sExtensionProvider = ExtensionPoint._fnExtensionProvider(oView);

				// For Fragments we need to make sure to pass the correct View instance to the EP Provider.
				// We can infer the nearest View to the Fragment from the given controller (either explicitly given, or assigned via the containing view).
				var sFragmentId;
				if (oView.isA("sap.ui.core.Fragment")) {
					sFragmentId = oView._sExplicitId;
					// determine actual containing view instance
					var oController = oView.getController();
					oView = oController && typeof oController.isA === "function" && oController.isA("sap.ui.core.mvc.Controller") && oController.getView();
					if (oView) {
						// local ID of the fragment (minus the view-id prefix)
						// Might include ID prefixes for nested Fragments.
						sFragmentId = oView.getLocalId(sFragmentId) || sFragmentId;
					}
				}

				if (sExtensionProvider) {
					if (!oView) {
						// Someone could create a Fragment via the factory with a Controller without an associated view,
						// e.g. by creating a Controller instance via Controller.create().
						future.warningThrows("View instance could not be passed to ExtensionPoint Provider for extension point '" + sExtName + "' " +
									"in fragment '" + sFragmentId + "'.");
					}
					/**
					 * In case we have an ExtensionProvider assigned, we return a marker object.
					 * This marker object will be used later during the View processing to apply the ExtensionProvider
					 * once the target control (parent of the extension point) was instantiated.
					 *
					 * The marker object is defined below, including all available properties.
					 * Properties starting with an underscore will only be used internally for processing.
					 * All other properties are exposed to be used for applying flexibility changes.
					 *
					 * The properties will be correctly filled when applyExtensionPoint() is called on the ExtensionProvider module.
					 */
					return [{
						// Track the correct provider class for each ExtensionPoint instance
						providerClass: sExtensionProvider,

						// The containing view instance.
						view: oView,

						// The ID of the fragment, in case the ExtensionPoint is inside a Fragment
						// (undefined if the ExtensionPoint is contained in a View).
						// The EP Provider needs the Fragment ID to distinguish between multiple occurences of the same fragment.
						fragmentId: sFragmentId,

						// The extension point name.
						name: sExtName,

						// Callback, which can be called to create the default content of the ExtensionPoint if needed.
						// The fnCreateDefaultContent function can either return an array of controls OR a Promise,
						// which then resolves with an array of controls.
						// See:  {@link sap.ui.core.ExtensionPoint.load}
						// Also: {@link sap.ui.extensionpoint}
						createDefault: fnCreateDefaultContent,

						// The target control into which the ExtensionPoint content will be inserted.
						targetControl: undefined,

						// The name of the target aggregation inside the target control.
						aggregationName: undefined,

						// the index of the ExtensionPoint inside its target aggregation in the parent control
						index: undefined,

						// The ready() function needs to be called once the controls have been inserted into the
						// target aggregation of the target control.
						// An array of all inserted controls must be passed to the ready function.
						// The index of all following sibling ExtensionPoints will then be shifted via the the marker object by reference.
						ready: function(aControls) {
							// propagate index shift
							var next = this._nextSibling;
							while (next != null) {
								next.index += aControls.length;
								next = next._nextSibling;
							}

							this._aControls = aControls;
						},

						// the resolved controls of this ExtensionPoint
						_aControls: [],

						// only used internally to check for a marker object
						_isExtensionPoint: true,

						// reference to the next sibling ExtensionPoint OR null if none present in the XML DOM
						_nextSibling: null
					}];
				}
			}

			if (!vResult && typeof fnCreateDefaultContent === 'function') {
				// if there is no extension configured or found or customizing disabled - check for default content
				// do we have a callback function?
				vResult = fnCreateDefaultContent();
			}

			var fnProcessResult = function (vResult) {
				// if the result returned from the default content is no array, wrap it in one
				if (vResult && !Array.isArray(vResult)){
					vResult = [vResult];
				}

				//if we have any result from either default content or customizing AND a target control is provided:
				if (vResult && oTargetControl) {
					//directly add the extension to the corresponding aggregation at the target control:
					var oAggregationInfo = oTargetControl.getMetadata().getAggregation(sAggregationName);
					if (oAggregationInfo) {
						for (var i = 0, l = vResult.length; i < l; i++) {
							// call the corresponding mutator for each element within the extension point - may be one or multiple elements
							oTargetControl[oAggregationInfo._sMutator](vResult[i]);
						}
					} else {
						// the target control has no default aggregation, or the aggregationName provided doesn't match an existing aggregation as defined at the targetControl
						future.errorThrows("Creating extension point failed - Tried to add extension point with name " + sExtName + " to an aggregation of " +
								oTargetControl.getId() + " in view " + oView.sViewName + ", but sAggregationName was not provided correctly and I could not find a default aggregation");
					}
				}

				return vResult || [];
			};

			// if vResult was created via fnCreateDefaultContent and is a Promise (or SyncPromise)
			if (vResult && typeof vResult.then === 'function') {
				return vResult.then(fnProcessResult);
			} else {
				return fnProcessResult(vResult);
			}
		};

		/**
		 * Registers a function, which will be called by the XMLTemplateProcessor to retrieve an ExtensionProvider Class.
		 * The registered module will be loaded once an ExtensionPoint is encountered during XMLView processing.
		 *
		 * @param {function|undefined|null} fnExtensionProvider Accepted values are: <code>function</code>, <code>null</code> or <code>undefined</code>.
		 *       If a <code>function</code> is given it must either return the module path of the ExtensionProvider class
		 *       or <code>undefined</code> in case flex is not active.
		 *       If <code>null</code> or <code>undefined</code> is given, an already registered provider is removed.
		 * @private
		 * @ui5-restricted sap.ui.fl
		 * @since 1.78.0
		 */
		ExtensionPoint.registerExtensionProvider = function(fnExtensionProvider) {
			if (fnExtensionProvider == null) {
				// unset if null or undefined
				delete ExtensionPoint._fnExtensionProvider;
			} else if (typeof fnExtensionProvider == "function") {
				ExtensionPoint._fnExtensionProvider = fnExtensionProvider;
			} else {
				future.errorThrows("ExtensionPoint provider must be a function!");
			}
		};

		/**
			 * Creates 0..n UI5 controls from an <code>ExtensionPoint</code>.
			 *
			 * One control if the <code>ExtensionPoint</code> is e.g. filled with a <code>View</code>, zero for extension points without configured extension and
			 * n controls for multi-root <code>Fragments</code> as extension.
			 *
			 * @param {object} mOptions an object map (see below)
			 * @param {sap.ui.core.mvc.View|sap.ui.core.Fragment} mOptions.container The view or fragment containing the extension point
			 * @param {string} mOptions.name The <code>mOptions.name</code> is used to identify the extension point in the customizing
			 * @param {function} [mOptions.createDefaultContent] Optional callback function creating default content, returning an array of controls. It is executed
			 *        when there's no customizing, if not provided, no default content will be rendered.
			 *        <code>mOptions.createDefaultContent</code> might also return a Promise, which resolves with an array of controls.
			 *
			 * @returns {Promise<sap.ui.core.Control[]>} a Promise, which resolves with an array of 0..n controls created from an <code>ExtensionPoint</code>.
			 *        If <code>mOptions.createDefaultContent</code> is called and returns a Promise, that Promise is returned by <code>ExtensionPoint.load</code>.
			 * @since 1.56.0
			 * @public
			 * @static
			 */
		ExtensionPoint.load = function(mOptions) {
			return Promise.resolve(
				ExtensionPoint._factory(
					mOptions.container,
					mOptions.name,
					mOptions.createDefaultContent,
					null,
					null,
					true
				)
			);
		};

		return ExtensionPoint;
	});