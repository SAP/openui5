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
				'./mapPolyfill',
				'./filterPolyfill'],
	function ($, HashChanger, UI5Object, View) {

		var mViews = {};

		/**
		 * @class A Plugin to search UI5 controls.
		 *
		 * @protected
		 * @name sap.ui.test.OpaPlugin
		 * @author SAP SE
		 * @since 1.22
		 */
		var OpaPlugin = UI5Object.extend("sap.ui.test.OpaPlugin", {

			constructor : function() {
				var that = this;

				sap.ui.getCore().registerPlugin({startPlugin: function(oCore) {
					that.oCore = oCore;
				},

				stopPlugin: function() {
					that.oCore = undefined;
				}});
			},

			/**
			 * Gets all the controls of a certain type that are currently instantiated.
			 *
			 * @param {Function} fnConstructorType the control type, e.g: sap.m.CheckBox
			 * @returns {Array} an array of the found controls (can be empty)
			 * @protected
			 */
			getAllControls : function (fnConstructorType) {
				var oControl,
					aResult = [],
					oCoreElements = this._getCoreElements();

				//Performance critical
				for (var sPropertyName in oCoreElements) {
					if (!oCoreElements.hasOwnProperty(sPropertyName)) {
						continue;
					}

					oControl = oCoreElements[sPropertyName];
					if (oControl instanceof fnConstructorType) {
						aResult.push(oControl);
					}
				}

				return aResult;
			},

			/**
			 * Sets the hash to the empty hash.
			 * @protected
			 */
			resetHash : function () {
				HashChanger.getInstance().setHash("");
			},

			/**
			 * Returns the view with a specific name
			 *
			 * @param {string} sViewName - the name of the view
			 * @returns {sap.ui.core.mvc.View} or undefined
			 * @protected
			 */
			getView : function (sViewName) {
				var oView = mViews[sViewName];

				if (!oView) {
					var aViews = this.getAllControls(View);

					oView = aViews.filter(function (oViewInstance) {
						return oViewInstance.getViewName() === sViewName;
					})[0];

					if (oView) {
						mViews[sViewName] = oView;
					}

				}

				return oView;
			},

			/**
			 * Gets a control inside of the view (same as calling oView.byId)
			 * If no id is provided, it will return all the controls inside of a view (also nested views and their children).<br/>
			 * eg : { id : "foo" } will search globally for a control with the id foo<br/>
			 * eg : { id : "foo" , viewName : "bar" } will search for a control with the id foo inside the view with the name bar<br/>
			 * eg : { viewName : "bar" } will return all the controls inside the view with the name bar<br/>
			 * eg : { viewName : "bar", controlType : sap.m.Button } will return all the Buttons inside a view with the name bar<br/>
			 * eg : { viewName : "bar", viewNamespace : "baz." } will return all the Controls in the view with the name baz.bar<br/>
			 *
			 * @param {object} oOptions that may contain a viewName, id, viewNamespace and controlType properties.
			 * @returns the found control, an array of matching controls, undefined or null
			 * @protected
			 */
			getControlInView : function (oOptions) {
				var sViewPath = oOptions.viewNamespace + oOptions.viewName,
					oView = this.getView(sViewPath),
					result = [],
					oControl;

				if (!oView) {
					jQuery.sap.log.info("Did not find the view: " + sViewPath);
					return null;
				}

				if ($.isArray(oOptions.id)) {
					jQuery.each(oOptions.id, function (iIndex, sId) {
						oControl = oView.byId(sId);

						if (oControl) {
							result.push(oControl);
						}
					});
					return result;
				}

				if (oOptions.id) {
					return oView.byId(oOptions.id);
				}

				return this.getAllControlsInContainer(oView.$(), oOptions.controlType);
			},

			getAllControlsInContainer : function ($Container, fnControlType) {
				return $Container.find("*").control().filter(function (oControl, iPosition, aAllControls) {
					var bKeepMe = true;

					if (fnControlType) {
						bKeepMe = oControl instanceof fnControlType;
					}

					return bKeepMe && aAllControls.indexOf(oControl) == iPosition;
				});
			},

			/**
			 * Tries to find a control depending on the options provided.
			 *
			 * @param {object} oOptions can have a control id property as string. Optional a viewName and a viewNamespace if it should search the control in a view
			 * @returns {sap.ui.core.Control} or undefined
			 * @protected
			 */
			getMatchingControls : function (oOptions) {
				var vResult;
				if (oOptions.searchOpenDialogs) {
					vResult = this.getAllControlsInContainer($("#sap-ui-static"), oOptions.controlType);
				} else if (oOptions.viewName) {
					vResult = this.getControlInView(oOptions);
				} else if (oOptions.id) {
					vResult = this.getControlByGlobalId(oOptions);
				} else if (oOptions.controlType) {
					vResult = this.getAllControlsInContainer($("body"), oOptions.controlType);
				} else {
					vResult = null;
				}

				if (!vResult || oOptions.visible === false) {
					return vResult;
				}

				if (vResult.$) {
					return vResult.$().is(":visible") ? vResult : null;
				}

				return vResult.filter(function (oControl) {
					return oControl.$().is(":visible");
				});
			},

			/**
			 * Returns a control by its id
			 * accepts an object with an id property the id can be
			 * will check a control type also, if defined
			 * <ul>
			 * 	<li>a single string - function will return the control instance or undefined</li>
			 * 	<li>an array of strings - function will return an array of found controls or an empty array</li>
			 * 	<li>a regexp - function will return an array of found controls or an empty array</li>
			 * </ul>
			 *
			 * @param oOptions should contain an id property. It can be of the type string or regex. If contains controlType property, will check it as well
			 * @returns all controls matched by the regex or the control matched by the string or null
			 * @protected
			 */
			getControlByGlobalId : function (oOptions) {
				var that = this,
					vStringOrArrayOrRegex = oOptions.id,
					vControl = [],
					aIds = [],
					oCoreElements = this._getCoreElements();

				if (typeof vStringOrArrayOrRegex === "string") {
					vControl = oCoreElements[vStringOrArrayOrRegex];
					return vControl && this._checkControlType(vControl, oOptions) ? vControl : null;
				}

				if (jQuery.type(vStringOrArrayOrRegex) === "regexp") {

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
					return that._checkControlType(oControl, oOptions) && oControl && !oControl.bIsDestroyed;
				});
			},

			_getCoreElements : function () {
				var oElements = {};

				if (!this.oCore) {
					return oElements;
				}

				return this.oCore.mElements || oElements;
			},

			_checkControlType : function(oControl, oOptions) {
				if (oOptions.controlType) {
					return oControl instanceof oOptions.controlType;
				} else {
					return true;
				}
			}
		});

		return OpaPlugin;
	}, /* bExport= */ true);

	if (original) {
		global.module = original;
	}
})(window);
