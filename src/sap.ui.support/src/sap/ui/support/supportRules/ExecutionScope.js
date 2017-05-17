/*!
 * ${copyright}
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

		function ExecutionScope(core, context) {
			coreInstance = core;
			elements = [];
			_context = context;

			contextTypes[_context.type].setScope();

			return {
				getElements: function () {
					return elements;
				},
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
				 */
				getLoggedObjects: function (type) {
					var log = jQuery.sap.log.getLog(),
						loggedObjects = [];

					/**
					 * Add logEntries that have support info object,
					 * ad that have the same type as the type provided
					 */
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