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
				'sap/ui/core/routing/HashChanger',
				'sap/ui/base/Object',
				'sap/ui/core/mvc/View',
				'./matchers/Ancestor',
				'./matchers/Interactable',
				'./matchers/Visible',
				'./pipelines/MatcherPipeline'],
	function ($, HashChanger, UI5Object, View, Ancestor, Interactable, Visible, MatcherPipeline) {
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

			constructor : function(sLogPrefix) {
				var that = this;
				this._sLogPrefix = sLogPrefix || "sap.ui.test.OpaPlugin";

				sap.ui.getCore().registerPlugin({
					startPlugin: function(oCore) {
						that.oCore = oCore;
					},
					stopPlugin: function() {
						that.oCore = undefined;
					}
				});
			},

			/**
			 * Gets all the controls of a certain type that are currently instantiated.
			 * If the control type is omitted, nothing is returned.
			 *
			 * @param {Function} [fnConstructorType] the control type, e.g: sap.m.CheckBox
			 * @returns {Array} an array of the found controls (can be empty)
			 * @public
			 */
			getAllControls : function (fnConstructorType) {
				var oControl,
					sPropertyName,
					aResult = [],
					oCoreElements = this._getCoreElements();

				//Performance critical
				for (sPropertyName in oCoreElements) {
					if (!oCoreElements.hasOwnProperty(sPropertyName)) {
						continue;
					}

					oControl = oCoreElements[sPropertyName];

					if (this._checkControlType(oControl, fnConstructorType)) {
						aResult.push(oControl);
					}
				}

				return aResult;
			},

			/**
			 * Returns the view with a specific name - if there are multiple views with that name only the first one is returned.
			 *
			 * @param {string} sViewName - the name of the view
			 * @returns {sap.ui.core.mvc.View} or undefined
			 * @public
			 */
			getView : function (sViewName) {
				var aViews = this.getAllControls(View);

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
				var sViewName = (oOptions.viewNamespace || "") + oOptions.viewName,
					oView = this.getView(sViewName),
					aResult = [],
					oControl,
					bIdIsString = typeof oOptions.id === "string",
					sViewId;

				if (!oView) {
					$.sap.log.debug("Found no view with the name: '" + sViewName + "'", this._sLogPrefix);
					if (bIdIsString) {
						return null;
					}
					return [];
				}

				if ($.isArray(oOptions.id)) {
					$.each(oOptions.id, function (iIndex, sId) {
						oControl = oView.byId(sId);

						if (oControl) {
							aResult.push(oControl);
						}
					});
					return aResult;
				}

				if (bIdIsString) {
					var oElement = oView.byId(oOptions.id);
					if (!oElement) {
						$.sap.log.debug("Found no control with the id: '" + oOptions.id + "' in the view: '" + sViewName + "'", this._sLogPrefix);
						return null;
					}

					return oElement;
				}

				var aAllControlsOfTheView = this.getAllControlsWithTheParent(oView, oOptions.controlType);

				if ($.type(oOptions.id) === "regexp") {
					sViewId = oView.getId();
					aAllControlsOfTheView = aAllControlsOfTheView.filter(function (oControl) {
						var sUnprefixedControlId = oControl.getId().replace(sViewId, "");
						return oOptions.id.test(sUnprefixedControlId);
					});
				}

				return aAllControlsOfTheView;
			},

			getAllControlsWithTheParent : function (oParent, fnControlType) {
				var ancestorMatcher = new Ancestor(oParent);

				return this._filterUniqueControlsByCondition(this.getAllControls(fnControlType),ancestorMatcher);
			},

			getAllControlsInContainer : function ($Container, fnControlType) {
				return this._filterUniqueControlsByCondition($Container.find("*").control(),function (oControl) {
					return this._checkControlType(oControl, fnControlType);
				}.bind(this));
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
					vResult = this.getAllControlsInContainer($("#sap-ui-static"), oOptions.controlType);
				} else if (oOptions.viewName) {
					vResult = this.getControlInView(oOptions);
				} else if (oOptions.id) {
					vResult = this.getControlByGlobalId(oOptions);
				} else if (oOptions.controlType) {
					vResult = this.getAllControls(oOptions.controlType);
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
			 * Returns a control by its id
			 * accepts an object with an ID property the ID can be
			 * will check a control type also, if defined
			 * <ul>
			 * 	<li>a single string - function will return the control instance or undefined</li>
			 * 	<li>an array of strings - function will return an array of found controls or an empty array</li>
			 * 	<li>a regexp - function will return an array of found controls or an empty array</li>
			 * </ul>
			 *
			 * @param oOptions should contain an ID property. It can be of the type string or regex. If contains controlType property, will check it as well
			 * @returns {sap.ui.core.Element[]} all controls matched by the regex or the control matched by the string or null
			 * @public
			 */
			getControlByGlobalId : function (oOptions) {
				var that = this,
					vStringOrArrayOrRegex = oOptions.id,
					vControl = [],
					aIds = [],
					oCoreElements = this._getCoreElements();

				if (typeof vStringOrArrayOrRegex === "string") {
					vControl = oCoreElements[vStringOrArrayOrRegex];

					if (!this._checkControlType(vControl, oOptions.controlType)) {
						$.sap.log.error("An id: '" + oOptions.id + "' was passed together with the controlType '" + oOptions.sOriginalControlType +
								"' but the type does not match the id - null is returned", this._sLogPrefix);
						vControl = null;
					}

					if (!vControl) {
						$.sap.log.debug("Found no control with the global id: '" + vStringOrArrayOrRegex + "'", this._sLogPrefix);
						return null;
					}

					return vControl;
				}

				if ($.type(vStringOrArrayOrRegex) === "regexp") {

					//Performance critical
					for (var sPropertyName in oCoreElements) {
						if (!oCoreElements.hasOwnProperty(sPropertyName)) {
							continue;
						}
						if (!vStringOrArrayOrRegex.test(sPropertyName)) {
							continue;
						}
						aIds.push(sPropertyName);
					}

				} else if ($.isArray(vStringOrArrayOrRegex)) {
					aIds = vStringOrArrayOrRegex;
				}

				return aIds.map(function (sId) {
					return oCoreElements[sId];
				}).filter(function (oControl) {
					//only return defined controls
					return that._checkControlType(oControl, oOptions.controlType) && oControl && !oControl.bIsDestroyed;
				});
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
					$.sap.log.debug("The control type " + sControlType + " is currently a lazy stub.", this._sLogPrefix);
					return null;
				}

				var fnControlType = $.sap.getObject(sControlType);

				// no control type
				if (!fnControlType) {
					$.sap.log.debug("The control type " + sControlType + " is undefined.", this._sLogPrefix);
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

			_getCoreElements : function () {
				var oElements = {};

				if (!this.oCore) {
					return oElements;
				}

				return this.oCore.mElements || oElements;
			},

			_checkControlType : function(oControl, fnControlType) {
				if (fnControlType) {
					return oControl instanceof fnControlType;
				} else {
					return true;
				}
			},

			_modifyControlType : function (oOptions) {
				var vControlType = oOptions.controlType;
				//retrieve the constructor instance
				if (typeof vControlType !== "string") {
					if (vControlType && vControlType._sapUiLazyLoader) {
						// no way of getting the control type's name without actually calling it
						$.sap.log.debug("The control type is currently a lazy stub", this._sLogPrefix);
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

		return OpaPlugin;
	}, /* bExport= */ true);

	if (original) {
		global.module = original;
	}
})(window);
