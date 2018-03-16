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

sap.ui.define(['jquery.sap.global',
				'sap/ui/base/Object',
				'sap/ui/core/mvc/View',
				'./matchers/Ancestor',
				'./matchers/Interactable',
				'./matchers/Visible',
				'./pipelines/MatcherPipeline',
				'sap/ui/test/_opaCorePlugin',
				'sap/ui/test/_OpaLogger'],
	function ($, UI5Object, View, Ancestor, Interactable, Visible,
			MatcherPipeline, _opaCorePlugin, _OpaLogger) {

		var oMatcherPipeline = new MatcherPipeline(),
			oInteractableMatcher = new Interactable(),
			oVisibleMatcher = new Visible(),
			aControlSelectorsForMatchingControls = [
				"id",
				"viewName",
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
			 * Gets all the controls of a certain type that are currently instantiated.
			 * If the control type is omitted, nothing is returned.
			 *
			 * @param {Function} [fnConstructorType] the control type, e.g: sap.m.CheckBox
			 * @param {string} [sControlType] optional control type name, e.g: "sap.m.CheckBox"
			 * @returns {Array} an array of the found controls (can be empty)
			 * @public
			 */
			getAllControls : function (fnConstructorType, sControlType) {
				var aControls = _opaCorePlugin.getAllControls(fnConstructorType);
				this._oLogger.debug("Found " + aControls.length + " controls" +
					(fnConstructorType ? " of type '" + (sControlType || fnConstructorType) + "'" : "") + " in page");
				return aControls;
			},

			/**
			 * Returns the view with a specific name - if there are multiple views with that name only the first one is returned.
			 *
			 * @param {string} sViewName - the name of the view
			 * @returns {sap.ui.core.mvc.View} or undefined
			 * @public
			 */
			getView : function (sViewName) {
				var aViews = this.getAllControls(View, "View");

				return aViews.filter(function (oViewInstance) {
					return oViewInstance.getViewName() === sViewName;
				})[0];
			},

			/**
			 * Gets a control inside of the view (same as calling oView.byId)
			 * If no ID is provided, it will return all the controls inside of a view (also nested views and their children).<br/>
			 * eg : { id : "foo" } will search globally for a control with the ID foo<br/>
			 * eg : { id : "foo" , viewName : "bar" } will search for a control with the ID foo inside the view with the name bar<br/>
			 * eg : { viewName : "bar" } will return all the controls inside the view with the name bar<br/>
			 * eg : { viewName : "bar", controlType : sap.m.Button } will return all the Buttons inside a view with the name bar<br/>
			 * eg : { viewName : "bar", viewNamespace : "baz." } will return all the Controls in the view with the name baz.bar<br/>
			 *
			 * @param {object} oOptions that may contain a viewName, id, viewNamespace and controlType properties.
			 * @returns {sap.ui.core.Element|sap.ui.core.Element[]|null}
			 * If the passed id is a string it returns the found control or null.
			 * Else an array of matching controls, if the view is not found or no control is found for multiple ids an empty array is returned.
			 * @public
			 */
			getControlInView : function (oOptions) {
				var sOptionsViewName = (oOptions.viewNamespace || "") + "." + (oOptions.viewName || ""),
					sViewName = sOptionsViewName.replace(/\.+/g,'.').replace(/^\.|\.$/g, ""),
					oView = this.getView(sViewName),
					bSearchForSingleControl = typeof oOptions.id === "string";

				if (!oView) {
					this._oLogger.debug("Found no view with the name: '" + sViewName + "'");
					return bSearchForSingleControl ? null : [];
				}

				if ($.isArray(oOptions.id)) {
					var aControls = [];
					var aUnmatchedIds = [];
					$.each(oOptions.id, function (iIndex, sId) {
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
					var oControl = oView.byId(oOptions.id) || null;
					this._oLogger.debug("Found " + (oControl ? "" : "no ") + "control with ID '" + oOptions.id + "' in view '" + sViewName + "'");
					return oControl;
				}

				var aAllControlsOfTheView = this.getAllControlsWithTheParent(oView, oOptions.controlType, oOptions.sOriginalControlType);
				var bMatchById = $.type(oOptions.id) === "regexp";

				if (bMatchById) {
					var sViewId = oView.getId();
					aAllControlsOfTheView = aAllControlsOfTheView.filter(function (oControl) {
						var sUnprefixedControlId = oControl.getId().replace(sViewId, "");
						return oOptions.id.test(sUnprefixedControlId);
					});
				}

				this._oLogger.debug("Found " + aAllControlsOfTheView.length + " controls of type " + oOptions.sOriginalControlType +
					(bMatchById ? " with ID matching " + oOptions.id : "") + " in view '" + sViewName + "'");
				return aAllControlsOfTheView;
			},

			getAllControlsWithTheParent : function (oParent, fnControlType, sControlType) {
				var ancestorMatcher = new Ancestor(oParent);
				return this._filterUniqueControlsByCondition(this.getAllControls(fnControlType, sControlType), ancestorMatcher);
			},

			getAllControlsInContainer : function ($Container, fnControlType, sControlType, sContainerDescription) {
				var aControls = this._filterUniqueControlsByCondition($Container.find("*").control(), function (oControl) {
					return _opaCorePlugin.checkControlType(oControl, fnControlType);
				});
				this._oLogger.debug("Found " + aControls.length + " controls in " +
					(sContainerDescription ? sContainerDescription : "container") + " with controlType '" + sControlType + "'");
				return aControls;
			},

			/**
			 * Tries to find a control depending on the options provided.
			 *
			 * @param {object} [oOptions] a map of options used to describe the control you are looking for.
			 * @param {string} [oOptions.viewName] Controls will only be searched inside of the view.
			 * Inside means, if you are giving an ID - the control will be found by using the byId function of the view.
			 * If you are specifying other options than the id, the view has to be an ancestor of the control - when you call myControl.getParent,
			 * you have to reach the view at some point.
			 * @param {string|string[]} [oOptions.id] The ID if one or multiple controls. This can be a global ID or an ID used together with viewName. See the documentation of this parameter.
			 * @param {boolean} [oOptions.visible=true] States if a control need to have a visible domref (jQUery's :visible will be used to determine this).
			 * @param {boolean} [oOptions.interactable=false] @since 1.34 States if a control has to match the interactable matcher {@link sap.ui.test.matchers.Interactable}.
			 * @param {boolean} [oOptions.searchOpenDialogs] Only controls in the static UI area of UI5 are searched.
			 * @param {string|function} [oOptions.controlType] @since 1.40 Selects all control by their type.
			 * It is usually combined with viewName or searchOpenDialogs. If no control is matching the type, an empty
			 * array will be returned. Here are some samples:
			 * <code>
			 *     <pre>
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
			 *     </pre>
			 * </code>
			 * @returns {sap.ui.core.Element|sap.ui.core.Element[]|null}
			 * <ul>
			 *     <li>an array of found Controls depending on the options</li>
			 *     <li>an empty array if no id was given</li>
			 *     <li>the found control/element when an id as a string is specified</li>
			 *     <li>null if an id as string was specified</li>
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
					vResult = this.getAllControlsInContainer($("#sap-ui-static"), oOptions.controlType, oOptions.sOriginalControlType, "the static UI area");
				} else if (oOptions.viewName) {
					vResult = this.getControlInView(oOptions);
				} else if (oOptions.id) {
					vResult = this.getControlByGlobalId(oOptions);
				} else if (oOptions.controlType) {
					vResult = this.getAllControls(oOptions.controlType, oOptions.sOriginalControlType);
				} else {
					vResult = this.getAllControls();
				}

				if (!vResult || oOptions.visible === false) {
					return vResult;
				}

				// TODO: make all of the conditions above matchers and create this array in a factory
				var aMatchers = [];

				if (oOptions.interactable) {
					aMatchers.push(oInteractableMatcher);
				} else {
					aMatchers.push(oVisibleMatcher);
				}

				var vPipelineResult = oMatcherPipeline.process({
					control: vResult,
					matchers: aMatchers
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
			 * uses getMatchingControls to retrieve controls
			 * enforces use of Interactable matcher and autoWait when neccessary
			 * returns special marker FILTER_FOUND_NO_CONTROLS if nothing is found
			 * @private
			 */
			_getFilteredControls : function(oOptions) {
				var bPluginLooksForControls = this._isLookingForAControl(oOptions);
				// found control values can be null, a single control or an array of controls
				var vControl = null;
				var vResult = null;

				if (bPluginLooksForControls) {
					vControl = this.getMatchingControls(oOptions);
				}

				// conditions in which no control was found and return value should be the special marker FILTER_FOUND_NO_CONTROLS
				var aControlsNotFoundConditions = [
					typeof oOptions.id === "string" && !vControl, // search for single control by string ID
					!oOptions.id && (oOptions.viewName || oOptions.searchOpenDialogs) && !vControl.length, // search by control type in view or staic area
					$.type(oOptions.id) === "regexp" && !vControl.length, // search by regex ID
					$.isArray(oOptions.id) && (!vControl || vControl.length !== oOptions.id.length), // search by array of IDs
					oOptions.controlType && $.isArray(vControl) && !vControl.length // search by control type globally
				];

				if (aControlsNotFoundConditions.some(Boolean)) {
					return OpaPlugin.FILTER_FOUND_NO_CONTROLS;
				}

				/*
				 * If the plugin does not look for controls execute matchers even if vControl is falsy
				 * used when you smuggle in values to success through matchers:
				 * matchers: function () {return "foo";},
				 * success: function (sFoo) {}
				 */
				if ((vControl || !bPluginLooksForControls) && oOptions.matchers) {
					vResult = oMatcherPipeline.process({
						matchers: oOptions.matchers,
						control: vControl
					});

					// no control matched
					if (!vResult) {
						return OpaPlugin.FILTER_FOUND_NO_CONTROLS;
					}
				} else {
					vResult = vControl;
				}

				return vResult;
			},

			/**
			 * Returns a control by its ID.
			 * Accepts an object with properties id and controlType. The id property can be string, regex or array of strings and is recommended to exist.
			 * The controlType property is optional and will ensure the returned control is of a certain type.
			 * <ul>
			 * 	<li>a single string - function will return the control instance or null</li>
			 * 	<li>an array of strings - function will return an array of found controls or an empty array</li>
			 * 	<li>a regexp - function will return an array of found controls or an empty array</li>
			 * </ul>
			 *
			 * @param oOptions should contain an ID property which can be of the type string, regex or array of strings. Can contain optional controlType property.
			 * @returns {sap.ui.core.Element[]} all controls matched by the regex or the control matched by the string or null
			 * @public
			 */
			getControlByGlobalId : function (oOptions) {
				var oCoreElements = _opaCorePlugin.getCoreElements();

				if (typeof oOptions.id === "string") {
					var oControl = oCoreElements[oOptions.id] || null;

					if (oControl && !_opaCorePlugin.checkControlType(oControl, oOptions.controlType)) {
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
					for (var sPropertyName in oCoreElements) {
						if (!oCoreElements.hasOwnProperty(sPropertyName) || !oOptions.id.test(sPropertyName)) {
							continue;
						}
						aMatchIds.push(sPropertyName);
					}
				} else if ($.isArray(oOptions.id)) {
					aMatchIds = oOptions.id;
				}

				var aMatchingControls = [];
				var aUnmatchedIds = [];

				aMatchIds.forEach(function (sId) {
					var oControl = oCoreElements[sId];
					// only return defined controls
					if (oControl && _opaCorePlugin.checkControlType(oControl, oOptions.controlType) && !oControl.bIsDestroyed) {
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

				return fnControlType;
			},

			/**
			 * Checks if the option when they would be passed to getMatchingControls could return a result
			 * @param oOptions
			 * @returns boolean
			 * @private
			 */
			_isLookingForAControl : function (oOptions) {
				return Object.keys(oOptions).some(function (sKey) {
					return aControlSelectorsForMatchingControls.indexOf(sKey) !== -1 && !!oOptions[sKey];
				});
			},

			_filterUniqueControlsByCondition : function (aControls, fnCondition) {
				return aControls.filter(function (oControl, iPosition, aAllControls) {
					var bKeepMe = !!fnCondition(oControl);

					return bKeepMe && aAllControls.indexOf(oControl) === iPosition;
				});
			},

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
			}
		});

		/**
		 * marker for a return type
		 * @private
		 * @type {{}}
		 */
		OpaPlugin.FILTER_FOUND_NO_CONTROLS = "FILTER_FOUND_NO_CONTROL";

		return OpaPlugin;
	});

	if (original) {
		global.module = original;
	}
})(window);
