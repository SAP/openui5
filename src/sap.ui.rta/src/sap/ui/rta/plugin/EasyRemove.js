/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.EasyRemove.
sap.ui.define([
	'sap/ui/rta/plugin/Remove'
], function(Remove) {
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
	var EasyRemove = Remove.extend("sap.ui.rta.plugin.EasyRemove", /** @lends sap.ui.rta.plugin.EasyRemove.prototype */
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
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	EasyRemove.prototype.registerElementOverlay = function(oOverlay) {
		this._oDelegate = {
			"onAfterRendering" : function() {
				var onDeletePressed = function(oOverlay) {
					this._handleRemove([oOverlay]);
				}.bind(this);

				if (oOverlay.$().hasClass("sapUiRtaPersDelete") && oOverlay.$().children(".sapUiRtaPersDeleteClick").length <= 0) {
					var sId = oOverlay.getId() + "-DeleteIcon";
					var oHtmlIconWrapper = jQuery("<div class='sapUiRtaPersDeleteClick' draggable='true'> </div>");
					var oHtmlIconOuter = jQuery("<div class='sapUiRtaPersDeleteIconOuter'> </div>");
					oOverlay._oDeleteIcon = new sap.ui.core.Icon(sId, {
						src : "sap-icon://decline",
						tooltip: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("CTX_REMOVE"),
						press: function(oEvent) {
							var oOverlay = sap.ui.getCore().byId(oEvent.getSource().getId().replace("-DeleteIcon", ""));
							onDeletePressed(oOverlay);
							oEvent.cancelBubble();
						},
						noTabStop: true
					}).placeAt(oHtmlIconOuter.get(0));
					oHtmlIconWrapper.append(oHtmlIconOuter);
					oOverlay.$().append(oHtmlIconWrapper);

					oOverlay._oDeleteIcon.attachBrowserEvent("contextmenu", function(oEvent) {
						oEvent.stopPropagation();
						oEvent.preventDefault();
					});

					oHtmlIconWrapper[0].addEventListener("dragstart", function(oEvent) {
						oEvent.stopPropagation();
						oEvent.preventDefault();
					});
			}

				oOverlay.removeEventDelegate(this._oDelegate, this);
			}
		};

		var oControl = oOverlay.getElementInstance();
		if (oControl.getMetadata().getName() === "sap.uxap.ObjectPageSection" && this.hasStableId(oOverlay)) {
			oOverlay.addStyleClass("sapUiRtaPersDelete");
		}

		oOverlay.addEventDelegate(this._oDelegate, this);
		Remove.prototype.registerElementOverlay.apply(this, arguments);
	};

	/**
	 * Deregister browser event for an overlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	EasyRemove.prototype.deregisterElementOverlay = function(oOverlay) {
		var oControl = oOverlay.getElementInstance();
		if (oControl.getMetadata().getName() === "sap.uxap.ObjectPageSection") {
			oOverlay.removeStyleClass("sapUiRtaPersDelete");
			oOverlay.removeEventDelegate(this._oDelegate, this);
			if (oOverlay._oDeleteIcon) {
				oOverlay._oDeleteIcon.destroy();
			}
		}
	};

	return EasyRemove;
}, /* bExport= */true);
