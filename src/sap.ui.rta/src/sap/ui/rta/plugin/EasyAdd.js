/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.EasyAdd.
sap.ui.define([
	'sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin',
	'sap/ui/dt/OverlayRegistry'
], function(AdditionalElementsPlugin, OverlayRegistry) {
	"use strict";

	/**
	 * Constructor for a new EasyAdd Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The EasyAdd Plugin adds an Icon to an Overlay, which allows to trigger add operations directly
	 * @extends sap.ui.rta.plugin.additionalElements.AdditionalElementsPlugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.48
	 * @alias sap.ui.rta.plugin.EasyAdd
	 * @experimental Since 1.48. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var EasyAdd = AdditionalElementsPlugin.extend("sap.ui.rta.plugin.EasyAdd", /** @lends sap.ui.rta.plugin.EasyAdd.prototype */
	{
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.rta",
			properties: {},
			associations: {},
			events: {}
		}
	});

	/**
	 * Register browser event for an overlay
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay object
	 * @override
	 */
	EasyAdd.prototype.registerElementOverlay = function(oOverlay) {
		this._oDelegate = {
			"onAfterRendering" : function() {
				var onAddPressed = function(bOverlayIsSibling, oOverlay, iIndex) {
					var sControlName = oOverlay.getDesignTimeMetadata().getName().plural;
					this.showAvailableElements(bOverlayIsSibling, [oOverlay], iIndex, sControlName);
				}.bind(this);

				var fnAddButton = function(oOverlay, oOverlayDom, bSibling, vControlName) {
					var fnCallback = function(oEvent) {
						var oOverlay = sap.ui.getCore().byId(oEvent.getSource().getId().replace("-AddButton", ""));
						onAddPressed(bSibling, oOverlay);
						oEvent.cancelBubble();
					};
					var sControlName = typeof vControlName === "function" ? vControlName() : vControlName;
					this._addButton(oOverlay, fnCallback, oOverlayDom, sControlName);
				}.bind(this);

				if (oOverlay.$().hasClass("sapUiRtaPersAdd")) {

					var oParentControl = oOverlay.getElementInstance().getParent();
					var oParentOverlay = OverlayRegistry.getOverlay(oParentControl);

					if (oOverlay.$().hasClass("sapUiRtaPersAdd") && oOverlay.$().children(".sapUiRtaPersAddIconOuter").length <= 0) {
						fnAddButton(oOverlay, oOverlay.$(), true, oOverlay.getDesignTimeMetadata().getName().singular);
					}

					if (oParentControl.getMetadata().getName() === "sap.uxap.ObjectPageLayout") {
						if (!this._hasVisibleSections(oParentControl)) {
							if (oParentOverlay.$().hasClass("sapUiRtaPersAddTop") && oParentOverlay.getAggregationOverlay("sections").$().children(".sapUiRtaPersAddIconOuter").length <= 0) {
								var oOverlayDom = oParentOverlay.getAggregationOverlay("sections").$();
								fnAddButton(oParentOverlay, oOverlayDom, false, oOverlay.getDesignTimeMetadata().getName().singular);
							}
						} else if (oParentOverlay._oAddButton) {
							oParentOverlay.getAggregationOverlay("sections").$().children(".sapUiRtaPersAddIconOuter").remove();
							oParentOverlay._oAddButton.destroy();
						}
					}
				} else if (oOverlay.$().hasClass("sapUiRtaPersAddTop")) {
					var oControl = oOverlay.getElementInstance();
					if (!this._hasVisibleSections(oControl)) {
						if (oOverlay.getAggregationOverlay("sections").$().children(".sapUiRtaPersAddIconOuter").length <= 0) {
							var $sectionsOverlay = oOverlay.getAggregationOverlay("sections").$();
							fnAddButton(oOverlay, $sectionsOverlay, false, oOverlay.getDesignTimeMetadata().getAggregation("sections").childNames.singular);
						}
					}
				}

				oOverlay.removeEventDelegate(this._oDelegate, this);
			}
		};

		var oControl = oOverlay.getElementInstance();
		if (oControl.getMetadata().getName() === "sap.uxap.ObjectPageSection" && this.hasStableId(oOverlay)) {
			oOverlay.addStyleClass("sapUiRtaPersAdd");
			oControl.addStyleClass("sapUiRtaMarginBottom");
		} else if (oControl.getMetadata().getName() === "sap.uxap.ObjectPageLayout" && this.hasStableId(oOverlay)) {
			oOverlay.addStyleClass("sapUiRtaPersAddTop");
		}

		oOverlay.addEventDelegate(this._oDelegate, this);
		AdditionalElementsPlugin.prototype.registerElementOverlay.apply(this, arguments);
	};

	/**
	 * Deregister browser event for an overlay
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay object
	 * @override
	 */
	EasyAdd.prototype.deregisterElementOverlay = function(oOverlay) {
		var oControl = oOverlay.getElementInstance();
		if (oOverlay._oAddButton) {
			oOverlay._oAddButton.destroy();
		}
		if (oControl.getMetadata().getName() === "sap.uxap.ObjectPageSection") {
			oOverlay.removeStyleClass("sapUiRtaPersAdd");
			oControl.removeStyleClass("sapUiRtaMarginBottom");
			oOverlay.removeEventDelegate(this._oDelegate, this);
		} else if (oControl.getMetadata().getName() === "sap.uxap.ObjectPageLayout") {
			oOverlay.removeStyleClass("sapUiRtaPersAddTop");
		}
	};

	/**
	 * @param {sap.ui.core.Element} oElement - element to check
	 * @returns {boolean} whether it is visible or not
	 * @private
	 */
	EasyAdd.prototype._hasVisibleSections = function(oElement) {
		var aSections = oElement.getSections();
		return aSections.some(function(oSection) {
			return oSection.getVisible();
		});
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - overlay object
	 * @param {function} fnCallback - callback function will be passed to the new button as on press event function
	 * @param {object} oOverlayDom - dom object of the overlay
	 * @private
	 */
	EasyAdd.prototype._addButton = function(oOverlay, fnCallback, oOverlayDom, sControlName) {
		var sId = oOverlay.getId() + "-AddButton";
		var oHtmlButtonOuter = jQuery("<div class='sapUiRtaPersAddIconOuter' draggable='true'> </div>");
		oOverlay._oAddButton = new sap.m.Button(sId, {
			text: "Add " + sControlName,
			icon: "sap-icon://add",
			press: fnCallback
		}).placeAt(oHtmlButtonOuter.get(0));
		oOverlayDom.append(oHtmlButtonOuter);

		oHtmlButtonOuter[0].addEventListener("mouseover", function(oEvent) {
			oEvent.stopPropagation();
			var oOverlay = oEvent.fromElement ? sap.ui.getCore().byId(oEvent.fromElement.id) : null;
			if (oOverlay && oOverlay.getMetadata().getName() === "sap.ui.dt.ElementOverlay") {
				var oParentContainer = oOverlay.getParentElementOverlay();
				oParentContainer.$().removeClass("sapUiRtaOverlayHover");
			}
		});

		oHtmlButtonOuter[0].addEventListener("mouseleave", function(oEvent) {
			oEvent.stopPropagation();
			var oOverlay = oEvent.toElement ? sap.ui.getCore().byId(oEvent.toElement.id) : null;
			if (oOverlay && oOverlay.getMetadata().getName() === "sap.ui.dt.ElementOverlay") {
				var oParentContainer = oOverlay.getParentElementOverlay();
				if (oParentContainer.getMovable()) {
					oParentContainer.$().addClass("sapUiRtaOverlayHover");
				}
			}
		});

		oHtmlButtonOuter[0].addEventListener("dragstart", function(oEvent) {
			oEvent.stopPropagation();
			oEvent.preventDefault();
		});
	};

	return EasyAdd;
}, /* bExport= */true);
