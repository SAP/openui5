/*!
 * ${copyright}
 */

 /**
	 * @classdesc
	 * <h3>Overview</h3>
	 * ExecutionScope provides access to internal UI5 objects available for inspection
	 * <h3>Usage</h3>
	 * Each rule is passed three parameters when executed: check: oIssueManager, oCoreFacade, oScope
	 * An ExecutionScope instance is passed to every call of a rule's check method. Available objects
	 * are collected depending on the settings passed to Support Assistant's entry point - the analyze
	 * method
	 * @public
	 * @class sap.ui.support.ExecutionScope
	 */
sap.ui.define(["jquery.sap.global"],
	function(jQuery) {
		"use strict";

		var coreInstance = null,
			_context = null,
			elements = [];

		var globalContext = {
			setScope: function () {
				for (var i in coreInstance.mElements) {
					elements.push(coreInstance.mElements[i]);
				}
			}
		};

		var subtreeContext = {
			setScope: function () {
				var parent = sap.ui.getCore().byId(_context.parentId);
				//TODO: Handle parent not found
				elements = parent.findAggregatedObjects(true);
			}
		};

		var componentsContext = {
			setScope: function () {
				var set = {};
				_context.components.forEach(function (componentId) {
					var component = coreInstance.mObjects.component[componentId],
						aggregations = component.findAggregatedObjects(true);

					aggregations.forEach(function (agg) {
						set[agg.getId()] = agg;
					});
				});

				for (var i in set) {
					if (set.hasOwnProperty(i)){
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
			var oChildAsAggregation = oChild.getParent().getMetadata().getAggregation(oChild.sParentAggregationName);
			return !!oChildAsAggregation;
		}

		function getPublicElementsInside(oControlRoot) {
			var oRoot;

			if (oControlRoot.getRootControl) {
				oRoot = oControlRoot.getRootControl();
				if (oRoot) {
					//TODO also exclude clones of binding templates, but include the binding template
					//TODO also exclude customData etc.?
					return oRoot.findAggregatedObjects(true, isInPublicAggregation);
				}
			}

			return [];
		}

		function ExecutionScope(core, context) {
			coreInstance = core;
			elements = [];
			_context = context;

			contextTypes[_context.type].setScope();

			return {
				getElements: function () {
					return elements;
				},
				getPublicElements: function () {
					var aPublicElements = [];
					var mComponents = core.mObjects.component;
					var mUIAreas = core.mUIAreas;

					for (var i in mComponents) {
						aPublicElements = aPublicElements.concat(getPublicElementsInside(mComponents[i]));
					}

					for (var key in mUIAreas) {
						aPublicElements = aPublicElements.concat(getPublicElementsInside(mUIAreas[key]));
					}

					return aPublicElements;
				},
				/**
				 * Gets elements by their type
				 * @public
				 * @function
				 * @param {string|function} classNameSelector
				 * @alias sap.ui.support.ExecutionScope.getElementsByClassName
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
				 * @function
				 * @param {any} type Type of logged objects
				 * @alias sap.ui.support.ExecutionScope.getLoggedObjects
				 */
				getLoggedObjects: function (type) {
					var log = jQuery.sap.log.getLogEntries(),
						loggedObjects = [];

					// Add logEntries that have support info object,
					// and that have the same type as the type provided
					log.forEach(function (logEntry) {
						if (!logEntry.supportInfo) {
							return;
						}

						var elemIds = elements.map(function (element) {
							return element.getId();
						});

						var hasElemId = !!logEntry.supportInfo.elementId,
							typeMatch = logEntry.supportInfo.type === type || type === undefined,
							scopeMatch = !hasElemId || (jQuery.inArray(logEntry.supportInfo.elementId, elemIds) > -1);

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
				_getType: function () {
					return _context.type;
				},
				_getContext: function () {
					return _context;
				}
			};
		}

		ExecutionScope.possibleScopes = Object.getOwnPropertyNames(contextTypes);

		return ExecutionScope;
	}, true);