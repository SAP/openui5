/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/sdk/controller/util/JSDocUtil",
		"sap/ui/Device"
	], function (BaseController, JSONModel, JSDocUtil, Device) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.ApiDetail", {

			METHOD: 'method',
			EVENT: 'event',
			PARAM: 'param',
			/**
			 * Determines if the type can be navigated to
			 */
			_baseTypes: [
				"sap.ui.core.any",
				"sap.ui.core.object",
				"sap.ui.core.function",
				"sap.ui.core.number", // TODO discuss with Thomas, type does not exist
				"sap.ui.core.float",
				"sap.ui.core.int",
				"sap.ui.core.boolean",
				"sap.ui.core.string",
				"sap.ui.core.URI", // TODO discuss with Thomas, type is not a base type (it has documentation)
				"sap.ui.core.ID", // TODO discuss with Thomas, type is not a base type (it has documentation)
				"sap.ui.core.void",
				"sap.ui.core.CSSSize", // TODO discuss with Thomas, type is not a base type (it has documentation)
				"null",
				"any",
				"object",
				"object[]",
				"function",
				"float",
				"int",
				"boolean",
				"string",
				"string[]"
			],

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {

				this._objectPage = this.byId("apiDetailObjectPage");

				this.getRouter().getRoute("apiId").attachPatternMatched(this._onTopicMatched, this);
			},

			onBeforeRendering: function() {
				Device.orientation.detachHandler(jQuery.proxy(this._fnOrientationChange, this));
			},

			onAfterRendering: function() {
				Device.orientation.attachHandler(jQuery.proxy(this._fnOrientationChange, this));
			},

			onExit: function() {
				Device.orientation.detachHandler(jQuery.proxy(this._fnOrientationChange, this));
			},

			/* =========================================================== */
			/* begin: internal methods									 */
			/* =========================================================== */

			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} event pattern match event in route 'api'
			 * @private
			 */
			_onTopicMatched: function (event) {
				var topicId = event.getParameter("arguments").id;
				this._bindData(topicId);
				this._scrollContentToTop();
				this.searchResultsButtonVisibilitySwitch(this.getView().byId("apiDetailBackToSearch"));
				if (this.extHookonTopicMatched) {
					this.extHookonTopicMatched(topicId);
				}
			},

			_scrollContentToTop: function () {
				if (this._objectPage && this._objectPage.$().length > 0   ) {
					this._objectPage.getScrollDelegate().scrollTo(0, 1);
				}
			},

			_bindData : function (sTopicId) {
				var controlData = sap.ui.getCore().getModel("libsData").getData()[sTopicId],
					that = this,
					model,
					methodsModel = {methods: []},
					eventsModel = {events: []},
					ui5Metadata;

				if (!controlData) {
					setTimeout(function() {
						that._bindData(sTopicId);
					}, 250);
					return;
				}

				ui5Metadata = controlData['ui5-metadata'];

				this.getView().byId('apiDetailPage').setBusy(false);
				this.getView().byId('apiDetailObjectPage').setVisible(true);

				if (controlData.hasOwnProperty('properties') && this.hasPublicElement(controlData.properties)) {
					controlData.hasProperties = true;
				} else {
					controlData.hasProperties = false;
				}

				controlData.hasConstructor = controlData.hasOwnProperty('constructor');

				if (ui5Metadata && ui5Metadata.properties && this.hasPublicElement(ui5Metadata.properties)) {
					controlData.hasControlProperties = true;
				} else {
					controlData.hasControlProperties = false;
				}

				if (ui5Metadata && ui5Metadata.events) {
					controlData.hasEvents = true;
				} else {
					controlData.hasEvents = false;
				}

				controlData.hasMethods = controlData.hasOwnProperty('methods') &&
					this.hasPublicElement(controlData.methods);

				if (ui5Metadata && ui5Metadata.associations && this.hasPublicElement(ui5Metadata.associations)) {
					controlData.hasAssociations = true;
				} else {
					controlData.hasAssociations = false;
				}

				if (ui5Metadata && ui5Metadata.aggregations && this.hasPublicElement(ui5Metadata.aggregations)) {
					controlData.hasAggregations = true;
				} else {
					controlData.hasAggregations = false;
				}

				if (controlData.hasMethods) {
					methodsModel.methods = this.buildMethodsModel(controlData.methods);
				}

				if (controlData.hasEvents) {
					eventsModel.events = this.buildEventsModel(ui5Metadata.events);
				}

				model = new JSONModel(controlData);

				this.setModel(model, "topics");
				this.setModel(new JSONModel(methodsModel), 'methods');
				this.setModel(new JSONModel(eventsModel), 'events');

				if (this.extHookbindData) {
					this.extHookbindData(sTopicId, model);
				}
			},

			_fnOrientationChange: function(e) {
				var page = this.getView().byId("apiDetailPage");

				if (e.landscape) {
					page.setShowHeader(false);
				} else {
					page.setShowHeader(true);
				}
			},

			/**
			 * Adjusts methods info so that it can be easily displayed in a table
			 * @param methods - the methods array initially coming from the server
			 * @returns {Array} - the adjusted array
			 */
			buildMethodsModel: function (methods) {
				var result = [],
					record, i, j, k,
					types,
					params,
					parameter,
					method,
					description;

				for (i = 0; i < methods.length; i++) {
					method = methods[i];
					params = method.parameters;
					if (method.visibility !== "public") {
						continue;
					}

					types = [];

					if (method.returnValue) {
						if (method.returnValue.type) {
							types = method.returnValue.type.split('|');
						}
						description = method.returnValue.description;
					} else {
						description = "";
					}

					record = {
						name: method.name,
						type: this.METHOD,
						returnType: {
							description: description,
							type: []
						},
						description: method.description,
						since: method.since,
						deprecated: method.deprecated
					};

					for (k = 0; k < types.length; k++) {
						record.returnType.type.push({
							value: types[k],
							isLast: k == types.length - 1
						});
					}

					result.push(record);

					if (!params || params.length == 0) {
						continue;
					}

					for (j = 0; j < params.length; j++) {
						parameter = params[j];
						types = parameter.type.split('|');
						record = {
							description: parameter.description,
							name: parameter.name,
							optional: parameter.optional,
							type: this.PARAM,
							returnType: {
								type: []
							},
							since: parameter.since
						};

						for (k = 0; k < types.length; k++) {
							record.returnType.type.push({
								value: types[k],
								isLast: k == types.length - 1
							});
						}

						result.push(record);
					}
				}

				return result;
			},

			/**
			 * Adjusts events info so that it can be easily displayed in a table
			 * @param events - the events array initially coming from the server
			 * @returns {Array} - the adjusted array
			 */
			buildEventsModel: function (events) {
				var result = [],
					event,
					params;

				for (var i = 0; i < events.length; i++) {
					event = {
						name: events[i].name,
						type: this.EVENT,
						description: events[i].description,
						since: events[i].since,
						deprecated: events[i].deprecated
					};

					result.push(event);

					params = events[i].parameters;
					if (!params) {
						continue;
					}

					for (var param in params) {
						event = {
							name: params[param].name,
							type: this.PARAM,
							description: params[param].description,
							paramType: params[param].type

						};

						result.push(event);
					}
				}

				return result;
			},

			/**
			 * Adds "deprecated" information if such exists to the header area
			 * @param deprecated - object containing information about deprecation
			 * @returns {string} - the deprecated text to display
			 */
			formatSubtitle: function (deprecated) {
				var result = "";

				if (deprecated) {
					result += "Deprecated in version: " + deprecated.since;
				}

				return result;
			},

			/**
			 * Formats the constructor of the class
			 * @param name
			 * @param params
			 * @returns string - The code needed to create an object of that class
			 */
			formatConstructor: function (name, params) {
				var result = "new ";

				if (name) {
					result += name + '(';
				}

				if (params) {
					params.forEach(function (element, index, array) {
						result += element.name;

						if (element.optional === "true") {
							result += '?';
						}

						if (index < array.length - 1) {
							result += ', ';
						}
					});
				}

				if (name) {
					result += ')';
				}

				return result;
			},

			/**
			 * Formats the default value of the property as a string.
			 * @param defaultValue - the default value of the property
			 * @returns string - The default value of the property formatted as a string.
			 */
			formatDefaultValue: function (defaultValue) {
				switch (defaultValue) {
					case null:
						return '';
					case undefined:
						return '';
					case '':
						return 'empty string';
					default:
						return defaultValue;
				}
			},

			/**
			 * Formats the description of the property
			 * @param description - the description of the property
			 * @param deprecatedText - the text explaining this property is deprecated
			 * @param deprecatedSince - the verstion when this property was deprecated
			 * @remturns string - the formatted description
			 */
			formatDescription: function (description, deprecatedText, deprecatedSince) {
				var result = description;

				if (deprecatedSince) {
					result += '\nDeprecated since version ' + deprecatedSince + '.';
				}

				if (deprecatedText) {
					if (deprecatedSince) {
						result += ' ' + deprecatedText;
					} else {
						result += '\n' + deprecatedText;
					}
				}

				result = this._wrapInSpanTag(result);
				return result;
			},

			/**
			 * Checks if the list has elements that have public visibility
			 * @param elements - a list of properties/methods/aggregations/associations etc.
			 * @returns {boolean} - true if the list has at least one public element
			 */
			hasPublicElement: function (elements) {
				for (var i = 0; i < elements.length; i++) {
					if (elements[i].visibility === 'public') {
						return true;
					}
				}

				return false;
			},

			/**
			 * Formats event or event parameter name
			 * @param eventInfo - object containing information about the event
			 * @returns {string} - the name of the event or if eventInfo is a event param - empty string
			 */
			formatEventsName: function (eventInfo) {
				if (eventInfo && eventInfo.type == this.EVENT) {
					return eventInfo.name;
				} else {
					return "";
				}
			},

			/**
			 * Helper function retrieving event parameter name
			 * @param eventInfo - object containing information about the event or the event parameter
			 * @returns {string} - Returns the name of the parameter or empty string
			 */
			formatEventsParam: function (eventInfo) {
				if (eventInfo && eventInfo.type != this.EVENT) {
					return eventInfo.name;
				} else {
					return "";
				}
			},

			/**
			 * Helper function retrieving event parameter type
			 * @param eventInfo - object containing information about the event or the event parameter
			 * @returns {string} - Returns the type of the parameter or empty string
			 */
			formatEventsType: function (eventInfo) {
				if (eventInfo && eventInfo.paramType) {
					return eventInfo.paramType;
				} else {
					return "";
				}
			},

			/**
			 * Helper function retrieving method name
			 * @param methodInfo - object containing information about the method or the method parameter
			 * @returns {string} - the name of the method or empty string
			 */
			formatMethodsName: function (methodInfo) {
				if (methodInfo && methodInfo.type == this.METHOD) {
					return methodInfo.name;
				} else {
					return "";
				}



			},

			/**
			 * Helper function retrieving method parameter name
			 * @param methodInfo - object containing information about the method or the method parameter
			 * @returns {string} - the name of the parameter or empty string
			 */
			formatMethodsParam: function (methodInfo) {
				if (methodInfo && methodInfo.type != this.METHOD) {
					return methodInfo.name;
				} else {
					return "";
				}
			},

			/**
			 * Helper function that checks if a link points to a base type (e.g. int, string, object etc)
			 * @param linkText - the text of the link
			 * @returns {boolean} - False if link points to a base type
			 */
			formatLinkEnabled: function (linkText) {
				return this._baseTypes.indexOf(linkText) === -1;
			},

			/**
			 * Helper function that checks if a link from the events table
			 * points to a base type (e.g. int, string, object etc)
			 * @param eventInfo - object containing information about the event
			 * @returns {boolean} - False if link points to a base type
			 */
			formatEventLinkEnabled: function (eventInfo) {
				var sEventText = this.formatEventsType(eventInfo);

				return this._baseTypes.indexOf(sEventText) === -1;
			},

			/**
			 * Event handler when a link pointing to a non-base type is pressed
			 * @param e
			 */
			onTypeLinkPress: function (e) {
				var type = e.getSource().getText();
				type = type.replace('[]', ''); // remove array brackets before navigation
				this.getRouter().navTo("apiId", {id: type}, true);
			},

			/**
			 * This function wraps a text in a span tag so that it can be represented in an HTML control.
			 * @param {string} text
			 * @returns {string}
			 * @private
			 */
			_wrapInSpanTag: function (text) {
				return '<span class="fs0875">' + JSDocUtil.formatTextBlock(text, {
						linkFormatter: function (target, text) {

							var p;

							target = target.trim().replace(/\.prototype\./g, "#");
							p = target.indexOf("#");
							if (p === 0) {
								// a relative reference - we can't support that
								return "<code>" + target.slice(1) + "</code>";
							}

							if (p > 0) {
								text = text || target; // keep the full target in the fallback text
								target = target.slice(0, p);
							}

							return "<a class=\"jsdoclink\" href=\"javascript:void(0);\" data-sap-ui-target=\"" + target + "\">" + (text || target) + "</a>";

						}
					}) + '</span>';
			},

			backToSearch: function () {
				this.onNavBack();
			}


		});

	}
);