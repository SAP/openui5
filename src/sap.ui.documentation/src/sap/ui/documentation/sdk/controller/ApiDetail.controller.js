/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/Device",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/sdk/controller/util/ControlsInfo",
		"sap/ui/documentation/sdk/util/ObjectSearch",
		"sap/ui/documentation/sdk/util/ToggleFullScreenHandler"
	], function (jQuery, Device, BaseController, JSONModel, ControlsInfo, ObjectSearch, ToggleFullScreenHandler) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.ApiDetail", {

			METHOD: 'method',
			EVENT: 'event',
			PARAM: 'param',
			NOT_AVAILABLE: 'N/A',

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

				// click handler for @link tags in JSdoc fragments
				this.getView().attachBrowserEvent("click", this.onJSDocLinkClick, this);

				ControlsInfo.listeners.push(function(){
					jQuery.sap.delayedCall(0, this, this._onControlsInfoLoaded);
				}.bind(this));
				ControlsInfo.init();
			},

			onBeforeRendering: function() {
				Device.orientation.detachHandler(jQuery.proxy(this._fnOrientationChange, this));
			},

			onAfterRendering: function() {
				Device.orientation.attachHandler(jQuery.proxy(this._fnOrientationChange, this));
			},

			onExit: function() {
				this.getView().detachBrowserEvent("click", this.onJSDocLinkClick, this);
				Device.orientation.detachHandler(jQuery.proxy(this._fnOrientationChange, this));
			},

			onJSDocLinkClick: function (oEvt) {
				// get target
				var sType = oEvt.target.getAttribute("data-sap-ui-target");
				if ( sType && sType.indexOf('#') >= 0 ) {
					sType = sType.slice(0, sType.indexOf('#'));
				}

				if ( sType ) {
					this.getRouter().navTo("apiId", {id : sType}, false);
					oEvt.preventDefault();
				}
			},

			onSampleLinkPress: function (oEvent) {
				// Navigate to Control Sample section
				var sEntityName = oEvent.getSource().data("name");
				this.getRouter().navTo("entity", {id: sEntityName, part: "samples"}, true);
			},

			onToggleFullScreen: function (oEvent) {
				ToggleFullScreenHandler.updateMode(oEvent, this.getView(), this);
			},

			/* =========================================================== */
			/* begin: internal methods									 */
			/* =========================================================== */

			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'api'
			 * @private
			 */
			_onTopicMatched: function (oEvent) {
				this._sTopicid = oEvent.getParameter("arguments").id;
				this._bindData(this._sTopicid);
				this._bindEntityData();

				this._scrollContentToTop();
				this.searchResultsButtonVisibilitySwitch(this.getView().byId("apiDetailBackToSearch"));

				if (this.extHookonTopicMatched) {
					this.extHookonTopicMatched(this._sTopicid);
				}
			},

			_scrollContentToTop: function () {
				if (this._objectPage && this._objectPage.$().length > 0   ) {
					this._objectPage.getScrollDelegate().scrollTo(0, 1);
				}
			},

			/**
			 * Callback function, executed once the <code>ControlsInfo</code> is loaded.
			 */
			_onControlsInfoLoaded : function () {
				this._bindEntityData();
			},

			/**
			 * Creates the <code>Entity</code> model,
			 * based on the <code>ControlsInfo</code> data.
			 * <b>Note:</b>
			 * The method is called in the <code>_onControlsInfoLoaded</code> callBack
			 * just once, when the <code>ControlsInfo</code> is loaded.
			 * After that, the method is called in <code>_onTopicMatched</code>,
			 * whenever a different topic has been selected.
			 */
			_bindEntityData : function () {
				if (!ControlsInfo || !ControlsInfo.data) {
					return;
				}

				var oLibData = {
					entityCount : ControlsInfo.data.entityCount,
					entities : ControlsInfo.data.entities
				}, oEntityModelData = this._getEntityData(oLibData);

				if (!this._oEntityModel) {
					this._oEntityModel = new JSONModel();
					this.setModel(this._oEntityModel, "entity");
				}

				this._oEntityModel.setData(oEntityModelData);
			},

			_bindData : function (sTopicId) {
				var aLibsData = this.getOwnerComponent().getModel("libsData").getData(),
					oControlData = aLibsData[sTopicId],
					aTreeData = this.getOwnerComponent().getModel("treeData").getData(),
					aControlChildren = this._getControlChildren(aTreeData, sTopicId),
					oModel,
					oMethodsModel = {methods: []},
					oEventsModel = {events: []},
					oUi5Metadata;

				if (!oControlData && !aControlChildren) {
					jQuery.sap.delayedCall(250, this, this._bindData, [sTopicId]);
					return;
				}

				if (aControlChildren) {
					if (!oControlData) {
						oControlData = {};
					}
					oControlData.controlChildren = aControlChildren;
					this._addChildrenDescription(aLibsData, oControlData.controlChildren);
				}

				oUi5Metadata = oControlData['ui5-metadata'];

				this.getView().byId('apiDetailPage').setBusy(false);
				this.getView().byId('apiDetailObjectPage').setVisible(true);

				if (oControlData.controlChildren) {
					oControlData.hasChildren = true;
				} else {
					oControlData.hasChildren = false;
				}

				if (oControlData.hasOwnProperty('properties') && this.hasPublicElement(oControlData.properties)) {
					oControlData.hasProperties = true;
				} else {
					oControlData.hasProperties = false;
				}

				oControlData.hasConstructor = oControlData.hasOwnProperty('constructor');

				if (oUi5Metadata && oUi5Metadata.properties && this.hasPublicElement(oUi5Metadata.properties)) {
					oControlData.hasControlProperties = true;
				} else {
					oControlData.hasControlProperties = false;
				}

				if (oUi5Metadata && oUi5Metadata.events) {
					oControlData.hasEvents = true;
				} else {
					oControlData.hasEvents = false;
				}

				oControlData.hasMethods = oControlData.hasOwnProperty('methods') &&
					this.hasPublicElement(oControlData.methods);

				if (oUi5Metadata && oUi5Metadata.associations && this.hasPublicElement(oUi5Metadata.associations)) {
					oControlData.hasAssociations = true;
				} else {
					oControlData.hasAssociations = false;
				}

				if (oUi5Metadata && oUi5Metadata.aggregations && this.hasPublicElement(oUi5Metadata.aggregations)) {
					oControlData.hasAggregations = true;
				} else {
					oControlData.hasAggregations = false;
				}

				if (oUi5Metadata && oUi5Metadata.specialSettings && this.hasPublicElement(oUi5Metadata.specialSettings)) {
					oControlData.hasSpecialSettings = true;
				} else {
					oControlData.hasSpecialSettings = false;
				}

				if (oControlData.hasMethods) {
					oMethodsModel.methods = this.buildMethodsModel(oControlData.methods);
				}

				if (oControlData.hasEvents) {
					oEventsModel.events = this.buildEventsModel(oUi5Metadata.events);
				}

				oControlData.isClass = oControlData.kind === "class";
				oControlData.isDerived = !!oControlData.extends;
				oControlData.extends = oControlData.extends || this.NOT_AVAILABLE;
				oControlData.since = oControlData.since || this.NOT_AVAILABLE;
				oModel = new JSONModel(oControlData);

				this.setModel(oModel, "topics");
				this.setModel(new JSONModel(oMethodsModel), 'methods');
				this.setModel(new JSONModel(oEventsModel), 'events');

				if (this.extHookbindData) {
					this.extHookbindData(sTopicId, oModel);
				}
			},

			_getControlChildren : function (aTreeData, sTopicId) {
				for (var i = 0; i < aTreeData.length; i++) {
					if (aTreeData[i].name === sTopicId) {
						return aTreeData[i].nodes;
					}
				}
			},

			_addChildrenDescription : function (aLibsData, aControlChildren) {
				for (var i = 0; i < aControlChildren.length; i++) {
					aControlChildren[i].description = aLibsData[aControlChildren[i].name].description;
					aControlChildren[i].link = "{@link " + aControlChildren[i].name + "}";
				}
			},

			/**
			 * Retrieves the <code>Entity</code> model data.
			 * @param {Object} oLibData
			 * @return {Object}
			 */
			_getEntityData: function (oLibData) {
				var sEntityName = this._sTopicid,
					oEntity = ObjectSearch.getEntityById(oLibData, sEntityName),
					sAppComponent = this._getControlComponent(sEntityName);

				return {
					appComponent: sAppComponent || this.NOT_AVAILABLE,
					sample: (oEntity && sEntityName) || this.NOT_AVAILABLE,
					hasSample: !!(oEntity && oEntity.sampleCount > 0)
				};
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

			_formatChildDescription: function (description) {
				if (description) {
					description = this._extractFirstSentence(description);
					description = this._wrapInSpanTag(description);
					return "<div>" + description + "<\div>";
				}
			},

			_extractFirstSentence: function (description) {
				var descriptionCopy = description.slice(), iSkipPosition;

				//Control description is not properly formatted and should be skipped.
				if (description.lastIndexOf("}") > description.lastIndexOf(".")) {
					return "";
				}

				descriptionCopy = this._sliceSpecialTags(descriptionCopy, "{", "}");
				descriptionCopy = this._sliceSpecialTags(descriptionCopy, "<code>", "</code>");
				iSkipPosition = description.length - descriptionCopy.length;
				description = description.slice(0, descriptionCopy.indexOf(".") + ".".length + iSkipPosition);
				return description;
			},

			_sliceSpecialTags: function (descriptionCopy, startSymbol, endSymbol) {
				var startIndex, endIndex;
				while (descriptionCopy.indexOf(startSymbol) !== -1 && descriptionCopy.indexOf(startSymbol) < descriptionCopy.indexOf(".")) {
					startIndex = descriptionCopy.indexOf(startSymbol);
					endIndex = descriptionCopy.indexOf(endSymbol);
					descriptionCopy = descriptionCopy.slice(0, startIndex) + descriptionCopy.slice(endIndex + endSymbol.length, descriptionCopy.length);
				}
				return descriptionCopy;
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

			backToSearch: function () {
				this.onNavBack();
			}


		});

	}
);