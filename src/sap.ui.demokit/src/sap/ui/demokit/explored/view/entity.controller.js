/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/ui/core/Component",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demokit/EntityInfo",
	"sap/ui/demokit/util/JSDocUtil",
	"../util/ObjectSearch",
	"../util/ToggleFullScreenHandler",
	"../data",
	"sap/ui/demokit/explored/view/base.controller"
], function (jQuery, Device, Component, UIComponent, History, Controller, JSONModel, EntityInfo, JSDocUtil, ObjectSearch, ToggleFullScreenHandler, data, Base) {
	"use strict";

	return Base.extend("sap.ui.demokit.explored.view.entity", {

		descriptionText: function (text) {
			var html;
			if (text) {
				html = "<span>" + text + "</span>";
			}
			return html;
		},

		// ====== event handling ====================================================================
		onInit: function () {
			this.router = UIComponent.getRouterFor(this);
			this.router.attachRoutePatternMatched(this.onRouteMatched, this);
			this._component = Component.getOwnerComponentFor(this.getView());
			// click handler for @link tags in JSdoc fragments
			this.getView().attachBrowserEvent("click", this.onJSDocLinkClick, this);

			this.getView().addEventDelegate({
				onBeforeFirstShow: jQuery.proxy(this._applyViewConfigurations, this)
			});
		},

		onExit: function() {
			this.getView().detachBrowserEvent("click", this.onJSDocLinkClick, this);
		},

		onTypeLinkPress: function (oEvt) {

			// navigate to entity
			var sType = oEvt.getSource().data("type");
			this.router.navTo("entity", {
				id: sType,
				part: "samples"
			}, false);

			// notify master of selection change
			this._component.getEventBus().publish("app", "selectEntity", {id: sType});
		},

		onJSDocLinkClick: function (oEvt) {

			// get target
			var sType = oEvt.target.getAttribute("data-sap-ui-target");
			if ( sType && sType.indexOf('#') >= 0 ) {
				sType = sType.slice(0, sType.indexOf('#'));
			}

			if ( sType ) {

				this.router.navTo("entity", {
					id: sType,
					part: "samples"
				}, false);

				// notify master of selection change
				this._component.getEventBus().publish("app", "selectEntity", {id: sType});

				oEvt.preventDefault();
			}

		},

		onIntroLinkPress: function (oEvt) {
			// remove explored.html from URL
			var aParts = document.location.pathname.split("/"),
				sBaseLink = document.location.origin + aParts.splice(0, aParts.length - 1).join("/") + "/";

			// open a relative documentation window
			window.open(sBaseLink + this.getView().getModel().getProperty("/docuLink"), "_blank");
		},

		onTabSelect: function (oEvt) {
			// update URL without updating history
			var sTab = oEvt.getParameter("key");
			this.router.navTo("entity", {
				id: this._sId,
				part: sTab
			}, true);
		},

		onNavBack: function (oEvt) {
			this.router.myNavBack("home", {});
		},

		onNavToSample: function (oEvt) {
			var sPath = oEvt.getSource().getBindingContext("entity").getPath();
			var oSample = this.getView().getModel("entity").getProperty(sPath);
			this.router.navTo("sample", {
				id: oSample.id
			});
		},

		_TAB_KEYS: ["samples", "about", "properties", "aggregations", "associations", "events", "methods"],

		onRouteMatched: function (oEvt) {

			var sRouteName = oEvt.getParameter("name"),
				sNewId = oEvt.getParameter("arguments").id,
				sNewTab = oEvt.getParameter("arguments").part;

			// check route
			if (sRouteName !== "entity") {
				return;
			}

			// find entity in index
			// (can be null if the entity is not in the index, e.g. for base classes and types)
			var oEntModel = this.getView().getModel("entity");
			var sPath = ObjectSearch.getEntityPath(oEntModel.getData(), sNewId);
			var oEntity = (sPath) ? oEntModel.getProperty(sPath) : null;

			// set nav button visibility
			var bEntityIsInIndex = !!sPath;
			var oHistory = History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			var bShowNavButton = Device.system.phone || (!bEntityIsInIndex && !!oPrevHash);
			this.getView().byId("page").setShowNavButton(bShowNavButton);

			// set data model
			var oModel,
				oData;
			if (this._sId !== sNewId) {

				// retrieve entity docu from server
				var oDoc = EntityInfo.getEntityDocu(sNewId);

				// route to not found page IF there is NO index entry AND NO docu from server
				if (!oEntity && !oDoc) {
					this.router.myNavToWithoutHash("sap.ui.demokit.explored.view.notFound", "XML", false, {path: sNewId});
					return;
				}

				// get view data
				oData = this._getViewData(sNewId, oDoc, oEntity);

				// set view model
				oModel = new JSONModel(oData);
				this.getView().setModel(oModel);

				// set also the binding context for entity data
				this.getView().bindElement("entity>" + sPath);

				// done, we can now switch the id
				this._sId = sNewId;

			} else {
				oModel = this.getView().getModel();
				oModel.refresh(true);
				// get existing data model
				oData = oModel.getData();
			}

			// handle unknown tab
			if (this._TAB_KEYS.indexOf(sNewTab) === -1) {
				sNewTab = "samples";
			}
			// handle invisible tab
			if (!oData.show[sNewTab]) {
				sNewTab = "samples";
			}
			var oTab = this.getView().byId("tabBar");
			if (sNewTab !== oTab.getSelectedKey() && oTab.getExpanded()) {
				oTab.setSelectedKey(sNewTab);
			}
		},

		onToggleFullScreen: function (oEvt) {
			ToggleFullScreenHandler.updateMode(oEvt, this.getView());
		},

		// ========= internal ===========================================================================
		_getViewData: function (sId, oDoc, oEntity) {

			// convert docu
			var oData = this._convertEntityInfo(sId, oDoc),
				bShouldShowSamplesSection = false,
				iSamplesCount = 0;

			if (oEntity) {

				// show the description as intro text if the entity is not deprecated
				if (!oData.shortDescription && oEntity.description) {
					oData.shortDescription = oEntity.description;
				}

				// make intro text active if a documentation link is set
				if (oEntity.docuLink) {
					oData.show.introLink = true;
					oData.docuLink = oEntity.docuLink;
				}

				bShouldShowSamplesSection = oEntity.samples.length > 0;
				iSamplesCount = oEntity.samples.length;
			}

			// apply entity related stuff
			oData.show.samples = bShouldShowSamplesSection;
			oData.count.samples = iSamplesCount;

			// done
			return oData;
		},

		_convertEntityInfo: function (sId, oDoc) {

			// create skeleton data structure
			var oData = {
				name: sId,
				deprecated: (oDoc) ? this._formatDeprecated(oDoc.deprecation) : null,
				deprecatedMark: (oDoc) ? this._createDeprecatedMark(oDoc.deprecation) : null,
				baseType: (oDoc) ? this._formatType(oDoc.baseType) : null,
				baseTypeText: (oDoc) ? this._formatTypeText(oDoc.baseType) : "-",
				baseTypeNav: (oDoc) ? this._formatTypeNav(oDoc.baseType) : null,
				shortDescription: (oDoc) ? this._formatDeprecatedDescription(oDoc.deprecation) : null,
				description: (oDoc) ? this._wrapInSpanTag(oDoc.doc) : null,
				docuLink: null,
				properties: [],
				events: [],
				methods: [],
				aggregations: [],
				associations: [],
				values: [], // for enums!
				show: {
					baseType: (oDoc) ? !!oDoc.baseType : false,
					about: !!oDoc,
					// computed later in this function
					properties: false,
					events: false,
					methods: false,
					aggregations: false,
					associations: false,
					values: false,
					introActive: false
				},
				count: {
					properties: 0,
					events: 0,
					methods: 0,
					aggregations: 0,
					associations: 0
				},
				appComponent: this._takeControlComponent(sId)
			};

			var methodsCount = 0,
				eventsCount = 0;

			var sBaseName = sId.slice(sId.lastIndexOf('.') + 1);

			// no documentation !
			if (!oDoc) {
				return oData;
			}

			// fill data
			var key = null;
			for (key in oDoc.properties) {
				if (oDoc.properties.hasOwnProperty(key) && key.indexOf("_") !== 0) {
					var oProp = oDoc.properties[key];
					oProp.name = key;
					oProp.deprecatedDescription = this._formatDeprecatedSinceDescription(oProp.deprecation, oProp.deprecationSince);
					oProp.deprecated = this._formatDeprecated(oProp.deprecation);
					oProp.doc = this._wrapInSpanTag(oProp.doc);
					oProp.typeText = this._formatTypeText(oProp.type);
					oProp.typeNav = this._formatTypeNav(oProp.type);
					oProp.type = this._formatType(oProp.type);
					oProp.defaultValue = (oProp.defaultValue) ? String(oProp.defaultValue).replace("empty/undefined", "-") : "";
					oData.properties.push(oProp);
				}
			}
			for (key in oDoc.events) {
				if (oDoc.events.hasOwnProperty(key) && key.indexOf("_") !== 0) {
					var oEvent = oDoc.events[key];
					oEvent.name = key;
					oEvent.deprecatedDescription = this._formatDeprecatedDescription(oEvent.deprecation);
					oEvent.deprecated = this._formatDeprecated(oEvent.deprecation);
					oEvent.doc = this._wrapInSpanTag(oEvent.doc);
					oData.events.push(oEvent);
					eventsCount++;
					for (var p in oEvent.parameters) { // TODO why is parameters not an array ???
						if (oEvent.parameters.hasOwnProperty(p) && p.indexOf("_") !== 0) {
							oData.events.push({
								param: p,
								since: oEvent.parameters[p].since,
								typeText: this._formatTypeText(oEvent.parameters[p].type),
								typeNav: this._formatTypeNav(oEvent.parameters[p].type),
								type: this._formatType(oEvent.parameters[p].type),
								doc: this._wrapInSpanTag(oEvent.parameters[p].doc),
								deprecatedDescription: this._formatDeprecatedDescription(oEvent.parameters[p].deprecation),
								deprecated: this._formatDeprecated(oEvent.parameters[p].deprecation)
							});
						}
					}
				}
			}
			for (key in oDoc.methods) {
				if (oDoc.methods.hasOwnProperty(key) && key.indexOf("_") !== 0 && !oDoc.methods[key].synthetic ) {
					var oMethod = oDoc.methods[key];
					oMethod.name = oDoc.methods[key].static ? sBaseName + "." + key : key;
					oMethod.deprecatedDescription = this._formatDeprecatedDescription(oMethod.deprecation);
					oMethod.deprecated = this._formatDeprecated(oMethod.deprecation);
					oMethod.doc = this._wrapInSpanTag(oMethod.doc);
					oMethod.param = "returnValue";
					oMethod.typeText = this._formatTypeText(oMethod.type);
					oMethod.typeNav = this._formatTypeNav(oMethod.type);
					oMethod.type = this._formatType(oMethod.type);
					oData.methods.push(oMethod);
					methodsCount++;
					for (var i = 0; i < oMethod.parameters.length; i++) {
						var sParamName = oMethod.parameters[i].name;
						if (sParamName.indexOf("_") !== 0) {
							oData.methods.push({
								param: sParamName,
								since: oMethod.parameters[i].since,
								typeText: this._formatTypeText(oMethod.parameters[i].type),
								typeNav: this._formatTypeNav(oMethod.parameters[i].type),
								type: this._formatType(oMethod.parameters[i].type),
								doc: this._wrapInSpanTag(oMethod.parameters[i].doc),
								deprecatedDescription: this._formatDeprecatedDescription(oMethod.parameters[i].deprecation),
								deprecated: this._formatDeprecated(oMethod.parameters[i].deprecation)
							});
						}
					}
				}
			}
			for (key in oDoc.aggregations) {

				var oAggr = oDoc.aggregations[key];
				var bNotHidden = (!oAggr.hasOwnProperty("visibility") || oAggr.visibility !== "hidden");
				if (oDoc.aggregations.hasOwnProperty(key) && key.indexOf("_") !== 0 && bNotHidden) {
					oAggr.name = key;
					oAggr.deprecated = this._formatDeprecated(oAggr.deprecation);
					oAggr.deprecatedDescription = this._formatDeprecatedDescription(oAggr.deprecation);
					oAggr.doc = this._wrapInSpanTag(oAggr.doc);
					oAggr.typeText = this._formatTypeText(oAggr.type);
					oAggr.typeNav = this._formatTypeNav(oAggr.type);
					oAggr.type = this._formatType(oAggr.type);
					oData.aggregations.push(oAggr);
				}
			}
			for (key in oDoc.associations) {
				if (oDoc.associations.hasOwnProperty(key) && key.indexOf("_") !== 0) {
					var oAssoc = oDoc.associations[key];
					oAssoc.name = key;
					oAssoc.deprecatedDescription = this._formatDeprecatedDescription(oAssoc.deprecation);
					oAssoc.deprecated = this._formatDeprecated(oAssoc.deprecation);
					oAssoc.doc = this._wrapInSpanTag(oAssoc.doc);
					oAssoc.typeText = this._formatTypeText(oAssoc.type);
					oAssoc.typeNav = this._formatTypeNav(oAssoc.type);
					oAssoc.type = this._formatType(oAssoc.type);
					oData.associations.push(oAssoc);
				}
			}
			for (key in oDoc.values) {
				if (oDoc.values.hasOwnProperty(key) && key.indexOf("_") !== 0) {
					var oValue = oDoc.values[key];
					oValue.name = key;
					oValue.deprecatedDescription = this._formatDeprecatedDescription(oValue.deprecation);
					oValue.deprecated = this._formatDeprecated(oValue.deprecation);
					oData.values.push(oValue);
				}
			}

			// determine if the parts shall be shown
			oData.show.properties = oData.properties.length > 0;
			oData.show.events = eventsCount > 0;
			oData.show.methods = methodsCount > 0;
			oData.show.aggregations = oData.aggregations.length > 0;
			oData.show.associations = oData.associations.length > 0;
			oData.show.values = oData.values.length > 0;

			// set counts
			oData.count.properties = oData.properties.length;
			oData.count.events = eventsCount;
			oData.count.methods = methodsCount;
			oData.count.aggregations = oData.aggregations.length;
			oData.count.associations = oData.associations.length;

			return oData;
		},

		/**
		 * This function wraps a text in a span tag so that it can be represented in an HTML control.
		 * @param {string} sText
		 * @returns {string}
		 * @private
		 */
		_wrapInSpanTag: function (sText) {
			return '<span class="fs0875">' + JSDocUtil.formatTextBlock(sText, {
				linkFormatter: function (target, text) {

					var p;

					target = target.trim().replace(/\.prototype\./g, "#");
					p = target.indexOf("#");
					if ( p === 0 ) {
						// a relative reference - we can't support that
						return "<code>" + target.slice(1) + "</code>";
					}

					if ( p > 0 ) {
						text = text || target; // keep the full target in the fallback text
						target = target.slice(0, p);
					}

					return "<a class=\"jsdoclink\" href=\"#\" data-sap-ui-target=\"" + target + "\">" + (text || target) + "</a>";

				}
			}) + '</span>';
		},

		/**
		 * Sets the boolean-as-string flag
		 */
		_formatDeprecated: function (sDeprecation) {
			return (sDeprecation && sDeprecation.length > 0) ? "true" : "false";
		},

		/**
		 * Adds the string "Deprecated" in front of the deprecation description.
		 */
		_formatDeprecatedDescription: function (sDeprecation) {
			return (this._isDeprecated(sDeprecation)) ? (this._createDeprecatedMark(sDeprecation) + ": " + sDeprecation) : null;
		},

		/**
		 * Adds "Deprecated Since" release in front of the deprecation description.
		 */
		_formatDeprecatedSinceDescription: function (sDeprecation, sDeprecationSince) {
			return (this._isDeprecated(sDeprecation)) ? (this._createDeprecatedSinceMark() + " " + sDeprecationSince + ": " + sDeprecation) : null;
		},

		/**
		 * Checks if object is deprecated.
		 */
		_isDeprecated: function (sDeprecation) {
			return (sDeprecation && sDeprecation.length > 0);
		},

		/**
		 * Converts the type to navigable type
		 */
		_formatType: function (sType) {
			if (!sType) {
				return null;
			} else {
				// remove arrays
				return sType.replace("[]", "");
			}
		},

		/**
		 * Converts the type to a friendly readable text
		 */
		_formatTypeText: function (sType) {
			if (!sType) {
				return null;
			} else {
				// remove core prefix
				sType = sType.replace("sap.ui.core.", "");
				// only take text after last dot
				var index = sType.lastIndexOf(".");
				return (index !== -1) ? sType.substr(index + 1) : sType;
			}
		},

		/**
		 * Converts the deprecated boolean to a human readable text
		 */
		_createDeprecatedMark: function (sDeprecated) {
			return (sDeprecated) ? this._getI18nModel().getProperty("deprecated") : "";
		},

		/**
		 * Fetch deprecatedSince translatable label
		 */
		_createDeprecatedSinceMark: function () {
			return this._getI18nModel().getProperty("deprecatedSince");
		},

		/**
		 * Get i18n model
		 */
		_getI18nModel: function () {
			return this.getView().getModel("i18n");
		},

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
			"any",
			"object",
			"function",
			"float",
			"int",
			"boolean",
			"string"
		],
		_formatTypeNav: function (sType) {
			return this._baseTypes.indexOf(sType) === -1;
		},

		/**
		 * the actual component for the control
		 * @param {string} controlName
		 * @return {string} sActualControlComponent
		 */
		_takeControlComponent: function (controlName) {
			var oLibComponentModel = data.libComponentInfos;
			jQuery.sap.require("sap.ui.core.util.LibraryInfo");
			var LibraryInfo = sap.ui.require("sap/ui/core/util/LibraryInfo");
			var oLibInfo = new LibraryInfo();
			var sActualControlComponent = oLibInfo._getActualComponent(oLibComponentModel, controlName);
			return sActualControlComponent;
		}
	});
});
