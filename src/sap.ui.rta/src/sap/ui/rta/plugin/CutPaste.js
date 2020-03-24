/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/plugin/CutPaste",
	"sap/ui/dt/Util",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/plugin/RTAElementMover",
	"sap/ui/rta/Utils"
],
function(
	ControlCutPaste,
	DtUtil,
	Plugin,
	RTAElementMover,
	Utils
) {
	"use strict";

	/**
	 * Constructor for a new CutPaste plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The CutPaste plugin adds functionality/styling required for RTA.
	 * @extends sap.ui.dt.plugin.CutPaste
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.plugin.CutPaste
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var CutPaste = ControlCutPaste.extend("sap.ui.rta.plugin.CutPaste", /** @lends sap.ui.rta.plugin.CutPaste.prototype */ {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				commandFactory : {
					type : "object",
					multiple : false
				}
			},
			events : {
				dragStarted : {},

				elementModified : {
					command : {
						type : "sap.ui.rta.command.BaseCommand"
					}
				}
			}
		}
	});

	// Extends the CutPaste Plugin with all the functions from our rta base plugin
	Utils.extendWith(CutPaste.prototype, Plugin.prototype, function(vDestinationValue, vSourceValue, sProperty) {
		return sProperty !== "getMetadata";
	});

	/**
	 * @override
	 */
	CutPaste.prototype.init = function() {
		ControlCutPaste.prototype.init.apply(this, arguments);
		this.setElementMover(new RTAElementMover({commandFactory: this.getCommandFactory()}));
	};

	/**
	 * @override
	 */
	CutPaste.prototype._isEditable = function(oOverlay, mPropertyBag) {
		return this.getElementMover().isEditable(oOverlay, mPropertyBag.onRegistration)
			.then(function(bEditable) {
				if (bEditable) {
					return true;
				}
				return this._isPasteEditable(oOverlay);
			}.bind(this));
	};

	CutPaste.prototype._isPasteEditable = function (oOverlay) {
		var oElementMover = this.getElementMover();
		if (!this.hasStableId(oOverlay)) {
			return Promise.resolve(false);
		}
		return oElementMover.isMoveAvailableOnRelevantContainer(oOverlay)
			.then(function(bMoveAvailable) {
				if (!bMoveAvailable) {
					return false;
				}
				return Utils.doIfAllControlsAreAvailable([oOverlay], function() {
					return oElementMover.isMoveAvailableForChildren(oOverlay);
				});
			});
	};

	/**
	 * @override
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} - true if the plugin is available
	 */
	CutPaste.prototype.isAvailable = function (aElementOverlays) {
		return aElementOverlays.every(function (oElementOverlay) {
			return oElementOverlay.getMovable();
		});
	};

	/**
	 * Register an overlay
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	CutPaste.prototype.registerElementOverlay = function() {
		ControlCutPaste.prototype.registerElementOverlay.apply(this, arguments);
		Plugin.prototype.registerElementOverlay.apply(this, arguments);
	};

	/**
	 * Additionally to super->deregisterOverlay this method detatches the browser events
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	CutPaste.prototype.deregisterElementOverlay = function() {
		ControlCutPaste.prototype.deregisterElementOverlay.apply(this, arguments);
		Plugin.prototype.removeFromPluginsList.apply(this, arguments);
	};

	/**
	 * @override
	 */
	CutPaste.prototype.paste = function(oTargetOverlay) {
		this._executePaste(oTargetOverlay);

		DtUtil.waitForSynced(this.getDesignTime())()
			.then(function() {
				return this.getElementMover().buildMoveCommand();
			}.bind(this))
			.then(function(oMoveCommand) {
				this.fireElementModified({
					command : oMoveCommand
				});
				this.stopCutAndPaste();
			}.bind(this))
			.catch(function(oMessage) {
				throw DtUtil.createError("CutPaste#paste", oMessage, "sap.ui.rta");
			});
	};

	/**
	 * @override
	 */
	CutPaste.prototype.cut = function(oOverlay) {
		return ControlCutPaste.prototype.cut.apply(this, arguments)
			.then(function() {
				oOverlay.setSelected(false);
			});
	};

	/**
	 * Retrieve the context menu item for the actions.
	 * Two items are returned here: one for "cut" and one for "paste".
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {object[]} - array of the items with required data
	 */
	CutPaste.prototype.getMenuItems = function (aElementOverlays) {
		var aMenuItems = [];
		var oPasteMenuItem = this.enhanceItemWithResponsibleElement({
			id: 'CTX_PASTE',
			text: sap.ui.getCore().getLibraryResourceBundle('sap.ui.rta').getText('CTX_PASTE'),
			handler: function (aElementOverlays) {
				return this.paste(aElementOverlays[0]);
			}.bind(this),
			enabled: function (aElementOverlays) {
				return this.isElementPasteable(aElementOverlays[0]);
			}.bind(this),
			rank: 80,
			icon: "sap-icon://paste"
		}, aElementOverlays, ["move"]);
		var aResponsibleElementOverlays = oPasteMenuItem.responsible || aElementOverlays;

		if (this.isAvailable(aResponsibleElementOverlays)) {
			var oCutMenuItem = this.enhanceItemWithResponsibleElement({
				id: 'CTX_CUT',
				text: sap.ui.getCore().getLibraryResourceBundle('sap.ui.rta').getText('CTX_CUT'),
				handler: function (aElementOverlays) {
					return this.cut(aElementOverlays[0]);
				}.bind(this),
				enabled: function (aElementOverlays) {
					return aElementOverlays.length === 1;
				},
				rank: 70,
				icon: "sap-icon://scissors"
			}, aElementOverlays, ["move"]);
			aMenuItems.push(oCutMenuItem, oPasteMenuItem);
			return aMenuItems;
		}
		return this._isPasteEditable(aElementOverlays[0])
			.then(function(bPasteEditable) {
				if (bPasteEditable) {
					aMenuItems.push(oPasteMenuItem);
				}
				return aMenuItems;
			});
	};

	return CutPaste;
});