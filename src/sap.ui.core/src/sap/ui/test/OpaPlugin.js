/*!
 * ${copyright}
 */

/*global window */

//wrapper for loading signals and hasher if module is defined
(function (global) {
	"use strict";
	var original;
	if (global.module) {

		original = global.module;
		global.module = undefined;

	}

sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/base/Object',
	'sap/ui/core/Element',
	'sap/ui/core/mvc/View',
	'sap/ui/test/matchers/Ancestor',
	'sap/ui/test/matchers/MatcherFactory',
	'sap/ui/test/pipelines/MatcherPipeline',
	'sap/ui/test/_OpaLogger'
], function ($, UI5Object, UI5Element, View, Ancestor, MatcherFactory,
			MatcherPipeline, _OpaLogger) {

		var oMatcherFactory = new MatcherFactory();
		var oMatcherPipeline = new MatcherPipeline();
		var aControlSelectorsForMatchingControls = [
			"id",
			"viewName",
			"viewId",
			"controlType",
			"searchOpenDialogs"
		];

		/**
		 * @class A Plugin to search UI5 controls.
		 *
		 * @public
		 * @alias sap.ui.test.OpaPlugin
		 * @author SAP SE
		 * @since 1.22
		 */
		var OpaPlugin = UI5Object.extend("sap.ui.test.OpaPlugin", /** @lends sap.ui.test.OpaPlugin.prototype */ {

			constructor : function() {
				this._oLogger = _OpaLogger.getLogger("sap.ui.test.Opa5");
			},

			/**
			 * Gets all the controls or elements of a certain type that are currently instantiated.
			 * If the type is omitted, all controls and elements are returned.
			 *
			 * @param {Function} [fnConstructorType] the control type, e.g: sap.m.CheckBox
			 * @param {string} [sControlType] optional control type name, e.g: "sap.m.CheckBox"
			 * @returns {Array} an array of the found controls (can be empty)
			 * @public
			 */
			getAllControls : function (fnConstructorType, sControlType) {
				var aControls = UI5Element.registry.filter( makeTypeFilterFn(fnConstructorType) );
				this._oLogger.debug("Found " + aControls.length + " controls" +
					(fnConstructorType ? " of type '" + (sControlType || fnConstructorType) + "'" : "") + " in page");
				return aControls;
			},

			/**
			 * Returns the view with a specific name. The result should be a unique view.
			 * If there are multiple visible views with that name, none will be returned.
			 *
			 * @param {string} sViewName the name of the view
			 * @returns {sap.ui.core.mvc.View} or undefined
			 * @public
			 */
			getView: function (sViewName) {
				var aViews = this.getAllControls(View, "View");
				var aMatchingViews = aViews.filter(function (oViewInstance) {
					return oViewInstance.getViewName() === sViewName;
				});

				this._oLogger.debug("Found " + aMatchingViews.length + " views with viewName '" + sViewName + "'");

				if (aMatchingViews.length > 1) {
					aMatchingViews = aMatchingViews.filter(function (oViewInstance) {
						var oViewDomRef = oViewInstance.$();
						return oViewDomRef.length > 0 && oViewDomRef.is(":visible") && oViewDomRef.css("visibility") !== "hidden";
					});

					this._oLogger.debug("Found " + aMatchingViews.length + " visible views with viewName '" + sViewName + "'");

					if (aMatchingViews.length !== 1) {
						this._oLogger.debug("Cannot identify controls uniquely. Please provide viewId to locate the exact view.");
						aMatchingViews = [];
					}
				}

				return aMatchingViews[0];
			},

			// find view by ID and/or viewName
			_getMatchingView: function (oOptions) {
				var oView = null;
				var sViewName;

				if (oOptions.viewName) {
					var sOptionsViewName = (oOptions.viewNamespace || "") + "." + (oOptions.viewName || "");
					sViewName = sOptionsViewName.replace(/\.+/g,'.').replace(/^\.|\.$/g, "");
				}

				if (oOptions.viewId) {
					var oCoreElement = UI5Element.registry.get(oOptions.viewId);
					if (oCoreElement instanceof View && (!sViewName || oCoreElement.getViewName() === sViewName)) {
						oView = oCoreElement;
					}
				} else {
					oView = this.getView(sViewName);
				}

				this._oLogger.debug("Found " + (oView ? "" : "no ") + "view with ID '" + oOptions.viewId + "' and viewName '" + sViewName + "'");

				return oView;
			},

			/**
			 * Gets a control inside the view (same as calling oView.byId)
			 * Returns all matching controls inside a view (also nested views and their children).<br/>
			 * The view can be specified by viewName, viewNamespace, viewId, and any combination of three.
			 * eg : { id : "foo" } will search globally for a control with the ID foo<br/>
			 * eg : { id : "foo" , viewName : "bar" } will search for a control with the ID foo inside the view with the name bar<br/>
			 * eg : { viewName : "bar" } will return all the controls inside the view with the name bar<br/>
			 * eg : { viewName : "bar", controlType : sap.m.Button } will return all the Buttons inside a view with the name bar<br/>
			 * eg : { viewName : "bar", viewNamespace : "baz." } will return all the Controls in the view with the name baz.bar<br/>
			 * eg : { viewId : "viewBar" } will return all the controls inside the view with the ID viewBar<br/>
			 *
			 * @param {object} oOptions can contain a viewName, viewNamespace, viewId, fragmentId, id and controlType properties.
			 * oOptions.id can be string, array or regular expression
			 * @returns {sap.ui.core.Element|sap.ui.core.Element[]|null}
			 * If oOptions.id is a string, will return the control with such an ID or null.<br/>
			 * If the view is not found or no control matches the given criteria, will return an empty array <br/>
			 * Otherwise, will return an array of matching controls
			 * @public
			 */
			getControlInView : function (oOptions) {
				var oView = this._getMatchingView(oOptions);
				var bSearchForSingleControl = typeof oOptions.id === "string";

				if (!oView) {
					return bSearchForSingleControl ? null : [];
				}

				var sViewName = oView.getViewName();
				var sFragmentPrefix = oOptions.fragmentId ? oOptions.fragmentId + OpaPlugin.VIEW_ID_DELIMITER : "";

				if ($.isArray(oOptions.id)) {
					var aControls = [];
					var aUnmatchedIds = [];
					oOptions.id.map(function (sId) {
						return sFragmentPrefix + sId;
					}).forEach(function (sId) {
						var oControl = oView.byId(sId);
						if (oControl) {
							aControls.push(oControl);
						} else {
							aUnmatchedIds.push(sId);
						}
					});

					var sUnmatchedLog = aUnmatchedIds.length ? ". Found no controls matching the subset of IDs " + aUnmatchedIds : "";
					this._oLogger.debug("Found " + aControls.length + " controls with ID contained in " + oOptions.id + " in view '" + sViewName + "'" + sUnmatchedLog);
					return aControls;
				}

				if (bSearchForSingleControl) {
					var sId = sFragmentPrefix + oOptions.id;
					var oControl = oView.byId(sId) || null;
					this._oLogger.debug("Found " + (oControl ? "" : "no ") + "control with ID '" + sId + "' in view '" + sViewName + "'");
					return oControl;
				}

				var aAllControlsOfTheView = this.getAllControlsWithTheParent(oView, oOptions.controlType, oOptions.sOriginalControlType);
				var bMatchById = $.type(oOptions.id) === "regexp";

				if (bMatchById) {
					aAllControlsOfTheView = aAllControlsOfTheView.filter(function (oControl) {
						var sUnprefixedControlId = this._getUnprefixedControlId(oControl.getId(), oView.getId(), oOptions.fragmentId);
						return oOptions.id.test(sUnprefixedControlId);
					}.bind(this));
				}

				this._oLogger.debug("Found " + aAllControlsOfTheView.length + " controls of type " + oOptions.sOriginalControlType +
					(bMatchById ? " with ID matching " + oOptions.id : "") + " in view '" + sViewName + "'");
				return aAllControlsOfTheView;
			},

			// get all child controls of a certain control type
			// the parent is a control and can be an indirect ancestor
			getAllControlsWithTheParent : function (oParent, fnControlType, sControlType) {
				var ancestorMatcher = new Ancestor(oParent);
				return this._filterUniqueControlsByCondition(this.getAllControls(fnControlType, sControlType), ancestorMatcher);
			},

			// get all child controls of a certain control type
			// the parents are controls whose roots are under the DOM node $Container
			getAllControlsInContainer : function ($Container, fnControlType, sControlType, sContainerDescription) {
				var hasExpectedType = makeTypeFilterFn(fnControlType),
					aControls = this._filterUniqueControlsByCondition(this._getControlsInContainer($Container), hasExpectedType);
				this._oLogger.debug("Found " + aControls.length + " controls in " +
					(sContainerDescription ? sContainerDescription : "container") + " with controlType '" + sControlType + "'");
				return aControls;
			},

			// get control in static area that matches a control type, ID (string, array, regex), viewId, viewName, fragmentId
			_getControlsInStaticArea: function (oOptions) {
				var vControls = this._getControlsInContainer($("#sap-ui-static")) || [];

				if (oOptions.id) {
					vControls = this._filterUniqueControlsByCondition(vControls, function (oControl) {
						var sUnprefixedControlId = oControl.getId();
						var oView = this._getMatchingView(oOptions);

						if (oView) {
							// the view could be set globally or from page object. in this case, search inside open dialogs should take priority:
							// - if the control is actually inside the view - the control ID will be considered view-relative
							// - otherwise, the control ID will be considered global
							if (this._isControlInView(oControl, oView.getViewName())) {
								sUnprefixedControlId = this._getUnprefixedControlId(oControl.getId(), oView.getId(), oOptions.fragmentId);
							}
						}

						var bIdMatches = false;

						if (typeof oOptions.id === "string") {
							bIdMatches = sUnprefixedControlId === oOptions.id;
						}
						if ($.type(oOptions.id) === "regexp") {
							bIdMatches = oOptions.id.test(sUnprefixedControlId);
						}
						if ($.isArray(oOptions.id)) {
							bIdMatches = oOptions.id.filter(function (sId) {
								return sId === sUnprefixedControlId;
							}).length > 0;
						}

						return bIdMatches;
					}.bind(this));

					this._oLogger.debug("Found " + (vControls.length ? vControls.length : "no") + " controls in the static area with ID matching '" + oOptions.id + "'" +
						(oOptions.fragmentId ? " and fragmentId: '" + oOptions.fragmentId + "'" : ""));
				}

				if (vControls.length && oOptions.controlType) {
					var hasExpectedType = makeTypeFilterFn(oOptions.controlType);
					vControls = this._filterUniqueControlsByCondition(vControls, hasExpectedType);

					this._oLogger.debug("Found " + (vControls.length ? vControls.length : "no") + " controls in the static area with control type matching '" + oOptions.controlType + "'");
				}

				if (oOptions.id && typeof oOptions.id === "string") {
					return vControls[0] || null;
				} else {
					return vControls;
				}
			},

			// get controls whose roots are in the subtree of oJQueryElement
			_getControlsInContainer: function (oJQueryElement) {
				var aAllControls = oJQueryElement.find("*").control();
				var aResult = [];
				aAllControls.forEach(function (oControl) {
					var bUnique = !aResult.filter(function (oUniqueControl) {
						return oUniqueControl.getId() === oControl.getId();
					}).length;
					if (bUnique) {
						aResult.push(oControl);
					}
				});
				return aResult;
			},

			_isControlInView: function (oControl, sViewName) {
				if (!oControl) {
					return false;
				}
				if (oControl.getViewName && oControl.getViewName() === sViewName) {
					return true;
				} else {
					return this._isControlInView(oControl.getParent(), sViewName);
				}
			},

			/**
			 * Find a control matching the provided options
			 * autowait and Interactable matcher will be enforced if neccessary
			 * @param {object} [oOptions] a map of options used to describe the control you are looking for.
			 * @param {string} [oOptions.viewName] Controls will only be searched inside this view (ie: the view (as a control) has to be an ancestor of the control)
			 * If a control ID is given, the control will be found using the byId function of the view.
			 * @param {string} [oOptions.viewId] @since 1.62 Controls will only be searched inside this view (ie: the view (as a control) has to be an ancestor of the control)
			 * If a control ID is given, the control will be found using the byId function of the view.
			 * @param {string|string[]} [oOptions.id] The ID of one or multiple controls. This can be a global ID or an ID used together with viewName. See the documentation of this parameter.
			 * @param {boolean} [oOptions.visible=true] should the control have a visible DOM reference
			 * @param {boolean} [oOptions.interactable=false] @since 1.34 should the control match the interactable matcher {@link sap.ui.test.matchers.Interactable}.
			 * @param {boolean} [oOptions.enabled=false] @since 1.66 should the control be enabled.
			 * @param {boolean} [oOptions.searchOpenDialogs] Only controls in the static UI area of UI5 are searched.
			 * @param {string|function} [oOptions.controlType] @since 1.40 match all controls of a certain type
			 * It is usually combined with viewName or searchOpenDialogs. If no control matches the type, an empty array will be returned. Examples:
			 * <pre>
			 *         // will return an array of all visible buttons
			 *         new OpaPlugin().getMatchingControls({
			 *             controlType: "sap.m.Button"
			 *         });
			 *
			 *         // control type will also return controls that extend the control type
			 *         // this will return an array of visible sap.m.List and sap.m.Table since both extend List base
			 *         new OpaPlugin().getMatchingControls({
			 *             controlType: "sap.m.ListBase"
			 *         });
			 *
			 *         // control type is often combined with viewName - only controls that are inside of the view
			 *         // and have the correct type will be returned
			 *         // here all sap.m.Inputs inside of a view called 'my.View' will be returned
			 *         new OpaPlugin().getMatchingControls({
			 *             viewName: "my.View"
			 *             controlType: "sap.m.Input"
			 *         });
			 * </pre>
			 * @returns {sap.ui.core.Element|sap.ui.core.Element[]|null}
			 * <ul>
			 *     <li>if a oOptions.id is a string, will return the single matching control or null if no controls match</li>
			 *     <li>otherwise, will return an array of matching controls, or an empty array, if no controls match</li>
			 * </ul>
			 *
			 * @public
			 */
			getMatchingControls : function (oOptions) {
				var vResult = null;
				oOptions = oOptions || {};
				var bHasValidControlType = this._modifyControlType(oOptions);

				if (!bHasValidControlType) {
					return typeof oOptions.id === "string" ? vResult : [];
				}

				if (oOptions.searchOpenDialogs) {
					vResult = this._getControlsInStaticArea(oOptions);
				} else if (oOptions.viewName || oOptions.viewId) {
					vResult = this.getControlInView(oOptions);
				} else if (oOptions.id) {
					vResult = this.getControlByGlobalId(oOptions);
				} else if (oOptions.controlType) {
					vResult = this.getAllControls(oOptions.controlType, oOptions.sOriginalControlType);
				} else {
					vResult = this.getAllControls();
				}

				if (!vResult) {
					return vResult;
				}

				var oStateMatchers = oMatcherFactory.getStateMatchers({
					visible: oOptions.visible, // true by default
					interactable: oOptions.interactable, // false by default
					enabled: typeof oOptions.enabled === "undefined" ? oOptions.interactable : oOptions.enabled // by default, true when interactable, false elsewise
				});
				var vPipelineResult = oMatcherPipeline.process({
					control: vResult,
					matchers: oStateMatchers
				});

				// all controls are filtered out
				if (!vPipelineResult) {
					// backwards compatible - return empty array in this case
					if ($.isArray(vResult)) {
						return [];
					}
					// Single control - return null
					if (vResult) {
						return null;
					}
					// anything else
					return vResult;
				}

				// Return the matched controls
				return vPipelineResult;
			},

			/**
			 * retrieve controls with getMatchingControls and then pass them through the matcher pipeline
			 * @param {object} oOptions a map of options used to describe the control you are looking for.
			 * @returns {object|array|string} can return a single control or array of controls depending on options
			 * returns constant FILTER_FOUND_NO_CONTROLS if nothing is found
			 * @private
			 */
			_getFilteredControls : function(oOptions) {
				var vControl = this._filterControlsByCondition(oOptions);
				var oFilterOptions = $.extend({}, oOptions);

				// when on the root level of oOptions, these options are already processed (see _filterControlsByCondition) and should not be processed again,
				// as this results in error when no controls are passed to the matcher pipeline (see _filterControlsByMatchers)
				// - the pipeline should still be executed because there could be custom matchers
				["interactable", "visible", "enabled"].forEach(function (sProp) {
					delete oFilterOptions[sProp];
				});

				return vControl === OpaPlugin.FILTER_FOUND_NO_CONTROLS
					? OpaPlugin.FILTER_FOUND_NO_CONTROLS : this._filterControlsByMatchers(oFilterOptions, vControl);
			},

			// filter result of getMatchingControls and maps it to FILTER_FOUND_NO_CONTROLS when no controls are found
			_filterControlsByCondition: function (oOptions) {
				var vControl = null;
				var bPluginLooksForControls = this._isLookingForAControl(oOptions);

				if (bPluginLooksForControls) {
					vControl = this.getMatchingControls(oOptions);
				}

				// conditions in which no control was found and return value should be the special marker FILTER_FOUND_NO_CONTROLS
				var aControlsNotFoundConditions = [
					typeof oOptions.id === "string" && !vControl, // search for single control by string ID
					$.type(oOptions.id) === "regexp" && !vControl.length, // search by regex ID
					$.isArray(oOptions.id) && (!vControl || vControl.length !== oOptions.id.length), // search by array of IDs
					oOptions.controlType && $.isArray(vControl) && !vControl.length, // search by control type globally
					!oOptions.id && (oOptions.viewName || oOptions.viewId || oOptions.searchOpenDialogs) && !vControl.length // search by control type in view or staic area
				];

				return aControlsNotFoundConditions.some(Boolean)
					? OpaPlugin.FILTER_FOUND_NO_CONTROLS : vControl;
			},

			// instantiate any matchers with declarative syntax and run controls through matcher pipeline
			_filterControlsByMatchers: function (oOptions, vControl) {
				var oOptionsWithMatchers = $.extend({}, oOptions);
				var aMatchers = oMatcherFactory.getFilteringMatchers(oOptionsWithMatchers);
				var bPluginLooksForControls = this._isLookingForAControl(oOptions);
				var vResult = null;

				/*
				 * If the plugin does not look for controls execute matchers even if vControl is falsy.
				 * This is used when you smuggle in values to success through matchers:
				 * matchers: function () {return "foo";},
				 * success: function (sFoo) {}
				 */
				if ((vControl || !bPluginLooksForControls) && aMatchers.length) {
					vResult = oMatcherPipeline.process({
						matchers: aMatchers,
						control: vControl
					});

					if (!vResult) {
						return OpaPlugin.FILTER_FOUND_NO_CONTROLS;
					}
				} else {
					vResult = vControl;
				}

				return vResult;
			},

			/**
			 * Find a control by its global ID
			 *
			 * @param {object} oOptions a map of match conditions. Must contain an id property
			 * @param {string|string[]} [oOptions.id] required - ID to match. Can be string, regex or array
			 * @param {string|function} [oOptions.controlType] optional - control type to match
			 * @returns {sap.ui.core.Element|sap.ui.core.Element[]} all matching controls
			 * <ul>
			 *     <li>if a oOptions.id is a string, will return the single matching control or null if no controls match</li>
			 *     <li>otherwise, will return an array of matching controls, or an empty array, if no controls match</li>
			 * </ul>
			 *
			 * @param oOptions must contain ID property of type string, regex or array of strings; optionally it can contain a controlType property.
			 * @returns {sap.ui.core.Element|sap.ui.core.Element[]|null} all controls matched by the regex or the control matched by the string or null
			 * @public
			 */
			getControlByGlobalId : function (oOptions) {

				var hasExpectedType = makeTypeFilterFn(oOptions.controlType);

				if (typeof oOptions.id === "string") {
					var oControl = UI5Element.registry.get(oOptions.id) || null;

					if (oControl && !hasExpectedType(oControl)) {
						this._oLogger.error("A control with global ID '" + oOptions.id + "' is found but does not have required controlType '" +
							oOptions.sOriginalControlType + "'. Found control is '" + oControl + "' but null is returned instead");
						return null;
					}

					this._oLogger.debug("Found " + (oControl ? "" : "no ") + "control with the global ID '" + oOptions.id + "'");
					return oControl;
				}

				var aMatchIds = [];
				var bMatchById = $.type(oOptions.id) === "regexp";

				if (bMatchById) {
					//Performance critical
					UI5Element.registry.forEach(function(oElement, sId) {
						if (oOptions.id.test(sId)) {
							aMatchIds.push(sId);
						}
					});
				} else if ($.isArray(oOptions.id)) {
					aMatchIds = oOptions.id;
				}

				var aMatchingControls = [];
				var aUnmatchedIds = [];

				aMatchIds.forEach(function (sId) {
					var oControl = UI5Element.registry.get(sId);
					// only return defined controls
					if (oControl && hasExpectedType(oControl) && !oControl.bIsDestroyed) {
						aMatchingControls.push(oControl);
					} else {
						aUnmatchedIds.push(sId);
					}
				});

				var sUnmatchedLog = !bMatchById && aUnmatchedIds.length ? ". Found no controls of matching the subset of IDs " + aUnmatchedIds : "";
				this._oLogger.debug("Found " + aMatchingControls.length + " controls of type " + oOptions.sOriginalControlType +
					(bMatchById ? " with ID matching '" : " with ID contained in '") + oOptions.id + sUnmatchedLog);

				return aMatchingControls;

			},

			/**
			 * Gets the constructor function of a certain controlType
			 *
			 * @param {string} sControlType the name of the type eg: "sap.m.Button"
			 * @returns {null|function} When the type is loaded, the contstructor is returned, if it is a lazy stub or not yet loaded, null will be returned and there will be a log entry.
			 * @public
			 */
			getControlConstructor : function (sControlType) {
				if (sap.ui.lazyRequire._isStub(sControlType)) {
					this._oLogger.debug("The control type " + sControlType + " is currently a lazy stub.");
					return null;
				}

				var fnControlType = $.sap.getObject(sControlType);

				// no control type
				if (!fnControlType) {
					this._oLogger.debug("The control type " + sControlType + " is undefined.");
					return null;
				}

				// some control types only have static methods and cannot be instanciated (e.g.: sap.m.MessageToast)
				if (typeof fnControlType !== "function") {
					this._oLogger.debug("The control type " + sControlType + " must be a function.");
					return null;
				}

				return fnControlType;
			},

			/**
			 * Checks if oOptions contains conditions that would provoke control search
			 * @param {object} oOptions a map of match conditions
			 * @returns {boolean} true if oOptions contains required conditions
			 * @private
			 */
			_isLookingForAControl : function (oOptions) {
				return Object.keys(oOptions).some(function (sKey) {
					return aControlSelectorsForMatchingControls.indexOf(sKey) !== -1 && !!oOptions[sKey];
				});
			},

			// filter controls using a function and return a set of unique controls
			_filterUniqueControlsByCondition : function (aControls, fnCondition) {
				return aControls.filter(function (oControl, iPosition, aAllControls) {
					var bKeepMe = !!fnCondition(oControl);

					return bKeepMe && aAllControls.indexOf(oControl) === iPosition;
				});
			},

			// - if oOptions.controlType is the name of a control type, it will be replaced by the constructor for the control type
			// and the control type name will be saved in a new option sOriginalControlType
			// - if oOptions.controlType is not a string, it will be assumed that the control type is a lazy stub (and will not be resolved)
			// mutates oOptions!
			_modifyControlType : function (oOptions) {
				var vControlType = oOptions.controlType;
				//retrieve the constructor instance
				if (typeof vControlType !== "string") {
					if (vControlType && vControlType._sapUiLazyLoader) {
						// no way of getting the control type's name without actually calling it
						this._oLogger.debug("The control type is currently a lazy stub");
						return false;
					}
					// undefined - oOptions has no control type filter that's fine
					// defined - it is a constructor since we checked that it is no lazy stub
					return true;
				}

				var fnControlConstructor = this.getControlConstructor(vControlType);

				if (!fnControlConstructor) {
					return false;
				}

				oOptions.sOriginalControlType = vControlType;
				oOptions.controlType = fnControlConstructor;
				return true;
			},

			_getUnprefixedControlId: function (sControlId, sViewId, sFragmentId) {
				// viewID might not be a prefix. strip prefixes only when needed
				var sUnprefixedControlId = sControlId.replace(sViewId + OpaPlugin.VIEW_ID_DELIMITER, "");
				if (sFragmentId) {
					if (sUnprefixedControlId.startsWith(sFragmentId + OpaPlugin.VIEW_ID_DELIMITER)) {
						sUnprefixedControlId = sUnprefixedControlId.replace(sFragmentId + OpaPlugin.VIEW_ID_DELIMITER, "");
					} else {
						// don't match control that doesn't have the required fragment ID
						sUnprefixedControlId = "";
					}
				}
				return sUnprefixedControlId;
			}
		});

		/**
		 * Creates a filter function that returns true when a given element
		 * has the type <code>fnControlType</code>.
		 *
		 * When <code>fnControlType</code> is not defined, the returned
		 * filter function will accept any element.
		 *
		 * @param {function} [fnControlType] Constructor to use for <code>instanceof</code> checks or null
		 * @returns {function} Predicate function that returns true when a given element is of the expected type
		 * @private
		 */
		function makeTypeFilterFn(fnControlType) {
			return function (oElement) {
				if (!fnControlType) {
					return true;
				}

				return oElement instanceof fnControlType;
			};
		}

		/**
		 * marker for a return type
		 * @private
		 * @type {{}}
		 */
		OpaPlugin.FILTER_FOUND_NO_CONTROLS = "FILTER_FOUND_NO_CONTROL";

		// delimiter after view or fragment prefix in control IDs
		OpaPlugin.VIEW_ID_DELIMITER = "--";

		return OpaPlugin;
	});

	if (original) {
		global.module = original;
	}
})(window);
