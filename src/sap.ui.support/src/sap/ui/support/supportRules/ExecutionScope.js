/*!
 * ${copyright}
 */

sap.ui.define(
	["sap/base/Log", "sap/ui/core/Component", "sap/ui/core/Element", "sap/ui/core/UIArea"],
	function (Log, Component, Element, UIArea) {
		"use strict";

		var _context = null,
			elements = [];

		var globalContext = {
			setScope: function () {
				elements = Element.registry.filter(function() { return true;});
			}
		};

		var subtreeContext = {
			setScope: function () {
				var parent = Element.registry.get(_context.parentId);
				//TODO: Handle parent not found
				elements = parent.findAggregatedObjects(true);
			}
		};

		var componentsContext = {
			setScope: function () {
				var set = {};
				_context.components.forEach(function (componentId) {
					var component = Component.registry.get(componentId),
						aggregations = component.findAggregatedObjects(true);

					aggregations.forEach(function (agg) {
						set[agg.getId()] = agg;
					});
				});

				for (var i in set) {
					if (set.hasOwnProperty(i)) {
						elements.push(set[i]);
					}
				}
			}
		};

		var contextTypes = {
			global: globalContext,
			subtree: subtreeContext,
			components: componentsContext
		};

		function isInPublicAggregation(oChild) {
			// Try getting a child via its parent
			var oChildAsAggregation = oChild
				.getParent()
				.getMetadata()
				.getAggregation(oChild.sParentAggregationName);
			return !!oChildAsAggregation;
		}

		function getPublicElementsInside(oControlRoot) {
			var oRoot;

			if (oControlRoot.isA("sap.ui.core.Component")) {
				oRoot = oControlRoot.getRootControl();
			} else if (oControlRoot.getContent()) { // UIArea
				oRoot = oControlRoot.getContent()[0];
			}

			if (oRoot) {
				// TODO also exclude clones of binding templates, but include the binding template
				// TODO also exclude customData etc.?
				return [oRoot].concat(
					oRoot.findAggregatedObjects(true, isInPublicAggregation)
				);
			}

			return [];
		}

		function isClonedElementFromListBinding(oControl) {
			var sParentAggregationName = oControl.sParentAggregationName,
				oParent = oControl.getParent();
			if (oParent && sParentAggregationName) {
				var oBindingInfo = oParent.getBindingInfo(sParentAggregationName);

				if (
					oBindingInfo &&
					oControl instanceof oBindingInfo.template.getMetadata().getClass()
				) {
					return true;
				} else {
					return isClonedElementFromListBinding(oParent);
				}
			}
			return false;
		}

		function getClonedElementFromListBindingId(oControl) {
			var sParentAggregationName = oControl.sParentAggregationName,
				oParent = oControl.getParent();
			if (oParent && sParentAggregationName) {
				var oBindingInfo = oParent.getBindingInfo(sParentAggregationName);

				if (
					oBindingInfo &&
					oControl instanceof oBindingInfo.template.getMetadata().getClass()
				) {
					return oParent.getId();
				} else {
					return getClonedElementFromListBindingId(oParent);
				}
			}

			return null;
		}

		function intersect(a, b) {
			var res = [];

			for (var i = 0, l = a.length; i < l; i++) {
				for (var j = 0, s = b.length; j < s; j++) {
					if (a[i] === b[j]) {
						res.push(a[i]);
					}
				}
			}

			return res;
		}

		/**
		 * @class
		 * Allows to select the scope of analysis on an application.
		 *
		 * <h3>Overview</h3>
		 *
		 * The ExecutionScope provides access to internal UI5 objects available for inspection.
		 * The <code>getElements</code> API method allows the user to select a specific subset of
		 * elements valid for their case. It accepts one query object argument.
		 *
		 * <h3>Usage</h3>
		 * The ExecutionScope is passed as third argument to all rule check functions.
		 *
		 * When you analyze your application, available objects are collected depending on the settings
		 * passed to the Support Assistant at the moment when you start it.
		 *
		 * @public
		 * @since 1.48
		 * @hideconstructor
		 * @alias sap.ui.support.ExecutionScope
		 */
		function ExecutionScope(core, context) {
			elements = [];
			_context = context;

			contextTypes[_context.type].setScope();

			return /** @lends sap.ui.support.ExecutionScope.prototype */ {
				/**
				 * @param {object} oConfig Object with specific filtering options
				 * @param {string} oConfig.type Type name to filter by type
				 * @param {boolean} oConfig.public Option to exclude elements that are
				 * not public aggregations
				 * @param {boolean} oConfig.cloned Option to exclude elements that are
				 * clones of list bindings
				 * @public
				 * @returns {Array} Array of matched elements
				 */
				getElements: function (oConfig) {
					var that = this;

					var configKeys = {
						"type": null,
						"public": false,
						"cloned": true
					};

					if (oConfig && Object.keys(oConfig).length) {
						var filteredElements = elements;
						var oRepresentativeClones = {};

						Object.keys(configKeys).forEach(function (predefinedKey) {
							if (oConfig.hasOwnProperty(predefinedKey)) {
								switch (predefinedKey) {
									case "type":
										var elementsByType = that.getElementsByClassName(
											oConfig["type"]
										);
										filteredElements = intersect(
											filteredElements,
											elementsByType
										);
										break;
									case "public":
										if (oConfig["public"] === true) {
											var publicElements = that.getPublicElements();
											filteredElements = intersect(
												filteredElements,
												publicElements
											);
										}
										break;
									case "cloned":
										if (!oConfig["cloned"]) {
											filteredElements = filteredElements.filter(function (element) {
												var bIsClonedFromListBinding = isClonedElementFromListBinding(element);

												if (bIsClonedFromListBinding) {
													var sListBindingId = getClonedElementFromListBindingId(element);

													if (!oRepresentativeClones.hasOwnProperty(sListBindingId)) {
														oRepresentativeClones[sListBindingId] = element;
													}
												}

												return (bIsClonedFromListBinding === false);
											});
										}
										break;
								}
							}
						});

						Object.keys(oRepresentativeClones).forEach(function (sRepresentativeCloneId) {
							filteredElements.push(oRepresentativeClones[sRepresentativeCloneId]);
						});

						return filteredElements;
					}

					return elements;
				},
				/**
				 * Returns all public elements, i.e. elements that are part of public API
				 * aggregations
				 * @public
				 * @returns {Array} Array of matched elements
				 */
				getPublicElements: function () {
					var aPublicElements = [];
					var mUIAreas = UIArea.registry.all();

					Component.registry.forEach(function(oComponent) {
						aPublicElements = aPublicElements.concat(
							getPublicElementsInside(oComponent)
						);
					});

					for (var key in mUIAreas) {
						aPublicElements = aPublicElements.concat(
							getPublicElementsInside(mUIAreas[key])
						);
					}

					return aPublicElements;
				},
				/**
				 * Gets elements by their type
				 * @public
				 * @param {string|function} classNameSelector Either string or function
				 * to be used when selecting a subset of elements
				 * @returns {Array} Array of matched elements
				 */
				getElementsByClassName: function (classNameSelector) {
					if (typeof classNameSelector === "string") {
						return elements.filter(function (element) {
							return element.getMetadata().getName() === classNameSelector;
						});
					}

					if (typeof classNameSelector === "function") {
						return elements.filter(function (element) {
							return element instanceof classNameSelector;
						});
					}
				},
				/**
				 * Gets the logged objects by object type
				 * @public
				 * @param {any} type Type of logged objects
				 * @returns {Array} Array of logged objects
				 */
				getLoggedObjects: function (type) {
					var log = Log.getLogEntries(),
						loggedObjects = [], elemIds;

					// Add logEntries that have support info object,
					// and that have the same type as the type provided
					log.forEach(function (logEntry) {
						if (!logEntry.supportInfo) {
							return;
						}

						if (!elemIds){
							elemIds = elements.map(function (element) {
								return element.getId();
							});
						}

						var hasElemId = !!logEntry.supportInfo.elementId,
							typeMatch =
								logEntry.supportInfo.type === type || type === undefined,
							scopeMatch =
								!hasElemId ||
								elemIds.indexOf(logEntry.supportInfo.elementId) > -1;

						/**
						 * Give the developer the ability to pass filtering function
						 */
						if (typeof type === "function" && type(logEntry) && scopeMatch) {
							loggedObjects.push(logEntry);
							return;
						}

						if (typeMatch && scopeMatch) {
							loggedObjects.push(logEntry);
						}
					});

					return loggedObjects;
				},
				/**
				 * Gets the type of the execution scope
				 * @public
				 * @returns {string} The type of the execution scope. Possible values are <code>global</code>, <code>subtree</code> or <code>components</code>.
				 */
				getType: function () {
					return _context.type;
				},
				_getContext: function () {
					return _context;
				}
			};
		}

		ExecutionScope.possibleScopes = Object.getOwnPropertyNames(contextTypes);

		return ExecutionScope;
	},
	true
);
