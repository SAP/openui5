/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
	"sap/ui/dt/OverlayRegistry",
	"sap/m/Button",
	"sap/ui/thirdparty/jquery"
], function(
	AdditionalElementsPlugin,
	OverlayRegistry,
	Button,
	jQuery
) {
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
	var EasyAdd = AdditionalElementsPlugin.extend("sap.ui.rta.plugin.EasyAdd", /** @lends sap.ui.rta.plugin.EasyAdd.prototype */ {
		metadata: {
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
		var oControl = oOverlay.getElement();
		if (oControl.getMetadata().getName() === "sap.uxap.ObjectPageSection" && this.hasStableId(oOverlay)) {
			oOverlay.addStyleClass("sapUiRtaPersAdd");
			oControl.addStyleClass("sapUiRtaMarginBottom");
		} else if (oControl.getMetadata().getName() === "sap.uxap.ObjectPageLayout" && this.hasStableId(oOverlay)) {
			oOverlay.addStyleClass("sapUiRtaPersAddTop");
			oControl.$("sectionsContainer").addClass("sapUiRtaPaddingTop");
		}

		var onAddPressed = function(bOverlayIsSibling, oOverlay, iIndex) {
			var sControlName;
			if (bOverlayIsSibling) {
				sControlName = oOverlay.getDesignTimeMetadata().getName().plural;
			} else {
				sControlName = oOverlay.getDesignTimeMetadata().getAggregation("sections").childNames.plural();
			}
			// This is needed to trigger the selection of available elements in the showAvailableElements method
			// Normally, getAllElements is called before showAvailableElements, here this is not the case
			this.clearCachedElements();
			this.showAvailableElements(bOverlayIsSibling, [oOverlay], iIndex, sControlName);
		}.bind(this);

		var fnAddButton = function(oOverlay, oOverlayDom, bSibling, vControlName, iIndex) {
			var fnCallback = function(oEvent) {
				var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id.replace("-AddButton", ""));
				onAddPressed(bSibling, oOverlay, iIndex);
				oEvent.stopPropagation();
			};
			var sControlName = typeof vControlName === "function" ? vControlName() : vControlName;
			this._addButton(oOverlay, fnCallback, oOverlayDom, sControlName, bSibling);
		}.bind(this);

		if (oOverlay.hasStyleClass("sapUiRtaPersAdd")) {
			var bAddButton = oOverlay.hasStyleClass("sapUiRtaPersAdd") && oOverlay.$().children(".sapUiRtaPersAddIconOuter").length <= 0;
			if (bAddButton) {
				fnAddButton(oOverlay, oOverlay.$(), true, oOverlay.getDesignTimeMetadata().getName().singular);
			}
		} else if (oOverlay.hasStyleClass("sapUiRtaPersAddTop")) {
			if (oOverlay.getAggregationOverlay("sections").$().children(".sapUiRtaPersAddIconOuter").length <= 0) {
				var $SectionsOverlay = oOverlay.getAggregationOverlay("sections").$();
				fnAddButton(oOverlay, $SectionsOverlay, false, oOverlay.getDesignTimeMetadata().getAggregation("sections").childNames.singular, 0);
			}
		}

		AdditionalElementsPlugin.prototype.registerElementOverlay.apply(this, arguments);
	};

	/**
	 * Deregister browser event for an overlay
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay object
	 * @override
	 */
	EasyAdd.prototype.deregisterElementOverlay = function(oOverlay) {
		var oControl = oOverlay.getElement();
		if (oOverlay._oAddButton) {
			oOverlay._oAddButton.destroy();
		}
		if (oControl.getMetadata().getName() === "sap.uxap.ObjectPageSection") {
			oOverlay.removeStyleClass("sapUiRtaPersAdd");
			oControl.removeStyleClass("sapUiRtaMarginBottom");
		} else if (oControl.getMetadata().getName() === "sap.uxap.ObjectPageLayout") {
			oOverlay.removeStyleClass("sapUiRtaPersAddTop");
			oControl.$("sectionsContainer").removeClass("sapUiRtaPaddingTop");
		}
	};

	/**
	 * On Editable Change the enablement of the Button has to be adapted
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	EasyAdd.prototype._isEditable = function(oOverlay) {
		return AdditionalElementsPlugin.prototype._isEditable.apply(this, arguments).then(function(bIsEditable) {
			if (oOverlay._oAddButton) {
				var bIsLayout = oOverlay.hasStyleClass("sapUiRtaPersAddTop");
				var sOverlayIsSibling = bIsLayout ? "asChild" : "asSibling";
				oOverlay._oAddButton.setEnabled(bIsEditable[sOverlayIsSibling]);
				if (bIsLayout) {
					var oLayout = oOverlay.getElement();
					oLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
						oLayout.$("sectionsContainer").addClass("sapUiRtaPaddingTop");
					});
				}
			}
			return bIsEditable;
		});
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - overlay object
	 * @param {function} fnCallback - callback function will be passed to the new button as on press event function
	 * @param {object} oOverlayDom - dom object of the overlay
	 * @param {string} sControlName - name of the control. This name will be displayed on the Add-Button
	 * @param {boolean} bOverlayIsSibling - defines if the button is added on a sibling or not
	 * @private
	 */
	EasyAdd.prototype._addButton = function(oOverlay, fnCallback, oOverlayDom, sControlName, bOverlayIsSibling) {
		var bIsEditable = oOverlay.getEditableByPlugins().indexOf(this._retrievePluginName(bOverlayIsSibling)) > -1;
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

		var sId = oOverlay.getId() + "-AddButton";
		var oHtmlButtonOuter = jQuery("<div class='sapUiRtaPersAddIconOuter' draggable='true' tabindex='-1'> </div>");
		oOverlay._oAddButton = new Button(sId, {
			text: oTextResources.getText("CTX_ADD_ELEMENTS", sControlName),
			icon: "sap-icon://add",
			enabled: bIsEditable
		})
			.placeAt(oHtmlButtonOuter.get(0))
			.attachBrowserEvent('click', fnCallback)
			.attachBrowserEvent('tap', fnCallback);
		oOverlayDom.append(oHtmlButtonOuter);

		oHtmlButtonOuter[0].addEventListener("mouseover", function(oEvent) {
			oEvent.stopPropagation();
			var oOverlay = oEvent.fromElement ? OverlayRegistry.getOverlay(oEvent.fromElement.id) : null;
			if (oOverlay && oOverlay.getMetadata().getName() === "sap.ui.dt.ElementOverlay") {
				var oParentContainer = oOverlay.getParentElementOverlay();
				oParentContainer.removeStyleClass("sapUiRtaOverlayHover");
			}
		});

		oHtmlButtonOuter[0].addEventListener("mouseleave", function(oEvent) {
			oEvent.stopPropagation();
			var oOverlay = oEvent.toElement ? OverlayRegistry.getOverlay(oEvent.toElement.id) : null;
			if (oOverlay && oOverlay.getMetadata().getName() === "sap.ui.dt.ElementOverlay") {
				var oParentContainer = oOverlay.getParentElementOverlay();
				if (oParentContainer.getMovable()) {
					oParentContainer.addStyleClass("sapUiRtaOverlayHover");
				}
			}
		});

		oHtmlButtonOuter[0].addEventListener("click", function(oEvent) {
			oEvent.stopPropagation();
		});

		oHtmlButtonOuter[0].addEventListener("contextmenu", function(oEvent) {
			oEvent.stopPropagation();
			oEvent.preventDefault();
		});

		oHtmlButtonOuter[0].addEventListener("dragstart", function(oEvent) {
			oEvent.stopPropagation();
			oEvent.preventDefault();
		});
	};

	return EasyAdd;
});