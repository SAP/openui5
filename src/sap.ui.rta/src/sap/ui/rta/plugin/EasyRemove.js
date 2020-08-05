/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/Remove",
	"sap/m/Button",
	"sap/ui/thirdparty/jquery"
], function(
	Remove,
	Button,
	jQuery
) {
	"use strict";

	/**
	 * Constructor for a new EasyRemove Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The EasyRemove Plugin adds an Icon to an Overlay, which allows to trigger remove operations directly
	 * @extends sap.ui.rta.plugin.Remove
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.48
	 * @alias sap.ui.rta.plugin.EasyRemove
	 * @experimental Since 1.48. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var EasyRemove = Remove.extend("sap.ui.rta.plugin.EasyRemove", /** @lends sap.ui.rta.plugin.EasyRemove.prototype */ {
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
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	EasyRemove.prototype.registerElementOverlay = function(oOverlay) {
		var oControl = oOverlay.getElement();
		if (oControl.getMetadata().getName() === "sap.uxap.ObjectPageSection" && this.hasStableId(oOverlay)) {
			oOverlay.addStyleClass("sapUiRtaPersDelete");
		}

		if (oOverlay.hasStyleClass("sapUiRtaPersDelete") && oOverlay.$().children(".sapUiRtaPersDeleteClick").length <= 0) {
			var onDeletePressed = function(oOverlay) {
				this.handler([oOverlay]);
			}.bind(this);

			var oDeleteButton = this._addButton(oOverlay);
			oDeleteButton.attachBrowserEvent("contextmenu", function (oEvent) {
				oEvent.stopPropagation();
				oEvent.preventDefault();
			});

			var fnOnClick = function (oEvent) {
				var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id.replace("-DeleteIcon", ""));
				onDeletePressed(oOverlay);
				oEvent.stopPropagation();
				oEvent.preventDefault();
			};

			oDeleteButton
				.attachBrowserEvent("click", fnOnClick)
				.attachBrowserEvent("tap", fnOnClick);
		}

		Remove.prototype.registerElementOverlay.apply(this, arguments);
	};

	/**
	 * On Editable Change the enablement of the Button has to be adapted
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	EasyRemove.prototype._isEditable = function(oOverlay) {
		if (oOverlay._oDeleteButton) {
			oOverlay._oDeleteButton.setEnabled(this.isEnabled([oOverlay]));
		}
		return Remove.prototype._isEditable.apply(this, arguments);
	};

	EasyRemove.prototype._addButton = function(oOverlay) {
		var bEnabled = this.isEnabled([oOverlay]);
		var sId = oOverlay.getId() + "-DeleteIcon";
		var oHtmlIconWrapper = jQuery("<div class='sapUiRtaPersDeleteClick' draggable='true'> </div>");
		var oHtmlIconOuter = jQuery("<div class='sapUiRtaPersDeleteIconOuter'> </div>");

		oOverlay._oDeleteButton = new Button(sId, {
			icon : "sap-icon://less",
			tooltip: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("CTX_REMOVE"),
			enabled: bEnabled
		}).placeAt(oHtmlIconOuter.get(0));
		oHtmlIconWrapper.append(oHtmlIconOuter);
		oOverlay.$().append(oHtmlIconWrapper);

		oHtmlIconWrapper[0].addEventListener("dragstart", function(oEvent) {
			oEvent.stopPropagation();
			oEvent.preventDefault();
		});
		return oOverlay._oDeleteButton;
	};

	/**
	 * Deregister browser event for an overlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	EasyRemove.prototype.deregisterElementOverlay = function(oOverlay) {
		var oControl = oOverlay.getElement();
		if (oControl.getMetadata().getName() === "sap.uxap.ObjectPageSection") {
			oOverlay.removeStyleClass("sapUiRtaPersDelete");
			if (oOverlay._oDeleteButton) {
				oOverlay._oDeleteButton.destroy();
			}
		}
	};

	return EasyRemove;
});