/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/ComponentContainer",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/documentation/sdk/controller/util/ControlsInfo",
		"sap/ui/documentation/sdk/controller/util/EntityInfo",
		"sap/ui/documentation/sdk/util/ToggleFullScreenHandler",
		"sap/ui/Device"
	], function (JSONModel, ComponentContainer, BaseController, ControlsInfo,
				 EntityInfo, ToggleFullScreenHandler, Device) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.Entity", {

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {

				this.router = this.getRouter();
				this.router.getRoute("entity").attachPatternMatched(this.onRouteMatched, this);

				// click handler for @link tags in JSdoc fragments
				this.getView().attachBrowserEvent("click", this.onJSDocLinkClick, this);

				ControlsInfo.listeners.push(this._loadSample.bind(this));

				this.getView().setModel(new JSONModel());
			},

			onExit: function() {
				this.getView().detachBrowserEvent("click", this.onJSDocLinkClick, this);
			},

			/* =========================================================== */
			/* begin: internal methods									 */
			/* =========================================================== */

			onTypeLinkPress: function (oEvt) {
				// navigate to entity
				var sType = oEvt.getSource().data("type");
				this.getRouter().navTo("entity", {id: sType}, false);
			},

			onAPIRefPress: function (oEvt) {
				var sEntityName = oEvt.getSource().data("name");
				this.getRouter().navTo("apiId", {id: sEntityName}, false);
			},

			onJSDocLinkClick: function (oEvt) {

				// get target
				var sType = oEvt.target.getAttribute("data-sap-ui-target");
				if ( sType && sType.indexOf('#') >= 0 ) {
					sType = sType.slice(0, sType.indexOf('#'));
				}

				if ( sType ) {
					this.getRouter().navTo("entity", {id : sType}, false);
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
				var sPath = oEvt.getSource().getBindingContext().getPath();
				var oSample = this.getView().getModel().getProperty(sPath);
				this.router.navTo("sample", {
					id: oSample.id
				});
			},

			_TAB_KEYS: ["samples", "about"],

			_loadSample: function () {

				if (!ControlsInfo.data) {
					return;
				}

				var sNewId = this._sNewId,
					sNewTab = this._sNewTab;

				var aFilteredEntities = ControlsInfo.data.entities.filter(function (entity) {
					return entity.id === sNewId;
				});
				var oEntity = aFilteredEntities.length ? aFilteredEntities[0] : undefined;

				// set data model
				var oData;
				if (this._sId !== sNewId) {

					// retrieve entity docu from server
					var oDoc = EntityInfo.getEntityDocu(sNewId, oEntity && oEntity.namespace);

					// route to not found page IF there is NO index entry AND NO docu from server
					if (!oEntity && !oDoc) {
						this.router.myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false, {path: sNewId});
						return;
					}

					// get view data
					oData = this._getViewData(sNewId, oDoc, oEntity);

					// set view model
					this.getView().getModel().setData(oData, false /* no merge with previous data */);


					// done, we can now switch the id
					this._sId = sNewId;

				} else {
					// get existing data model
					oData = this.getView().getModel().getData();
				}

				// handle unknown tab
				if (this._TAB_KEYS.indexOf(sNewTab) === -1) {
					sNewTab = "samples";
				}

				// handle invisible tab
				if (!oData.show[sNewTab]) {
					sNewTab = "samples";
				}
			},

			onRouteMatched: function (oEvt) {

				this._sNewId = oEvt.getParameter("arguments").id;
				this._sNewTab = oEvt.getParameter("arguments").part;

				this._loadSample();
			},

			onToggleFullScreen: function (oEvt) {
				ToggleFullScreenHandler.updateMode(oEvt, this.getView(), this);
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
				oData.entity = oEntity;

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
					values: oDoc.values,
					show: {
						baseType: (oDoc) ? !!oDoc.baseType : false,
						about: !!oDoc,
						values: false,
						introActive: false
					},
					count: {
						samples: 0
					},
					appComponent: this._getControlComponent(sId)
				};

				// no documentation !
				if (!oDoc) {
					return oData;
				}

				// determine if the parts shall be shown
				oData.show.values = Array.isArray(oData.values) && oData.values.length > 0;

				return oData;
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
				return (sDeprecation && sDeprecation.length > 0 ) ? (this._createDeprecatedMark(sDeprecation) + ": " + sDeprecation) : null;
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
				return (sDeprecated) ? this.getView().getModel("i18n").getProperty("deprecated") : "";
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
			}
		});
	}
);