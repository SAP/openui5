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
		"sap/ui/documentation/sdk/util/ToggleFullScreenHandler",
		"sap/uxap/ObjectPageSubSection"
	], function (jQuery, Device, BaseController, JSONModel, ControlsInfo, ObjectSearch, ToggleFullScreenHandler, ObjectPageSubSection) {
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

				this.setModel(new JSONModel(), "topics");
				this.setModel(new JSONModel(), 'methods');
				this.setModel(new JSONModel(), 'events');
				this.setModel(new JSONModel(), "entity");
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
				this._createMethodsSummary();
				this._createEventsSummary();
				this._bindEntityData();

				this._scrollContentToTop();
				this.searchResultsButtonVisibilitySwitch(this.getView().byId("apiDetailBackToSearch"));

				if (this.extHookonTopicMatched) {
					this.extHookonTopicMatched(this._sTopicid);
				}
			},

			_createMethodsSummary: function () {
				var oSummaryTable = sap.ui.xmlfragment(this.getView().getId() + "-methodsSummary", "sap.ui.documentation.sdk.view.ApiDetailMethodsSummary", this);
				var oSection = this.getView().byId("methods");
				if (oSection.getSubSections().length > 0) {
					return;
				}
				oSection.insertSubSection(new ObjectPageSubSection({
					title: "Summary",
					blocks: [
						oSummaryTable
					]
				}), 0);
			},

			_createEventsSummary: function () {
				var oSummaryTable = sap.ui.xmlfragment(this.getView().getId() + "-eventsSummary", "sap.ui.documentation.sdk.view.ApiDetailEventsSummary", this);
				var oSection = this.getView().byId("events");
				if (oSection.getSubSections().length > 0) {
					return;
				}
				oSection.insertSubSection(new ObjectPageSubSection({
					title: "Summary",
					blocks: [
						oSummaryTable
					]
				}), 0);
			},

			scrollToMethod: function (oEvent) {
				var oLink = oEvent.getSource();
				this._scrollToEntity("methods", oLink.getText());
			},

			scrollToEvent: function (oEvent) {
				var oLink = oEvent.getSource();
				this._scrollToEntity("events", oLink.getText());
			},

			_scrollToEntity: function (sSectionId, sSubSectionTitle) {

				var aSubSections = this.getView().byId(sSectionId).getSubSections();
				var aFilteredSubSections = aSubSections.filter(function (oSubSection) {
					return oSubSection.getTitle() === sSubSectionTitle;
				});

				if (aFilteredSubSections.length) {
					this.getView().byId("apiDetailObjectPage").scrollToSection(aFilteredSubSections[0].getId(), 250);
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
					this.getModel("entity").setData(this._oEntityModel, false /* no merge with previous data */);
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

				if (oControlData && oControlData.events) {
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
					oEventsModel.events = this.buildEventsModel(oControlData.events);
				}

				oControlData.isClass = oControlData.kind === "class";
				oControlData.isDerived = !!oControlData.extends;
				oControlData.extends = oControlData.extends || this.NOT_AVAILABLE;
				oControlData.since = oControlData.since || this.NOT_AVAILABLE;

				this.getModel("topics").setData(oControlData, false /* no merge with previous data */);
				this.getModel('methods').setData(oMethodsModel, false /* no merge with previous data */);
				this.getModel('methods').setDefaultBindingMode("OneWay");
				this.getModel('events').setData(oEventsModel, false /* no merge with previous data */);
				this.getModel('events').setDefaultBindingMode("OneWay");

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

				// No methods, do nothing
				if (!methods.length) {
					return methods;
				}

				var result = methods.filter(function (method) {
					return true; //method.visibility === "public";
				}).map(function (method) {
					method.parameters = method.parameters || [];

					// Handle multiple values
					method.parameters = method.parameters.map(function (param) {
						var types = (param.type || "").split("|");
						param.types = [];
						for (var i = 0; i < types.length; i++) {
							param.types.push({
								value: types[i],
								isLast: i === types.length - 1
							});
						}
						return param;
					});

					// Format return value
					if (method.returnValue) {
						var types = (method.returnValue.type || "").split("|");
						method.returnValue.types = [];
						for (var i = 0; i < types.length; i++) {
							method.returnValue.types.push({
								value: types[i],
								isLast: i === types.length - 1
							});
						}
					}

					return method;

				});

				// Prepend an empty item so that it is replaced by the summary subsection
				result.unshift({});

				return result;
			},

			/**
			 * Adjusts events info so that it can be easily displayed in a table
			 * @param events - the events array initially coming from the server
			 * @returns {Array} - the adjusted array
			 */
			buildEventsModel: function (events) {

				// No events, do nothing
				if (events.length === 0) {
					return events;
				}

				// Transform the key-value pairs of event parameters into an array
				var result = events.map(function (event) {
					if (event.parameters) {
						var aParameters = [];
						for (var i in event.parameters) {
							if (event.parameters.hasOwnProperty(i)) {
								aParameters.push(event.parameters[i]);
							}
						}
						event.parameters = aParameters;
					}
					return event;
				});

				// Prepend an empty item so that it is replaced by the summary subsection
				result.unshift({});

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

				if (deprecatedSince || deprecatedText) {
					result += "<span class=\"sapUiDocumentationDeprecated\">";

					if (deprecatedSince) {
						result += '<br/>Deprecated since version ' + deprecatedSince + '.';
					}

					if (deprecatedText) {
						if (deprecatedSince) {
							result += ' ' + deprecatedText;
						} else {
							result += '<br/>' + deprecatedText;
						}
					}

					result += "</span>";
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

				return eventInfo ? eventInfo.name : "";

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

					return methodInfo ? methodInfo.name : "";



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