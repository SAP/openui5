/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.Selection.
sap.ui.define([
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/rta/Utils',
	'sap/ui/fl/Utils'
],
function(Plugin, Utils, FlexUtils) {
	"use strict";

	/**
	 * Constructor for a new Selection plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The Selection plugin allows you to select or focus overlays with mouse or keyboard and navigate to others.
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.plugin.Selection
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Selection = Plugin.extend("sap.ui.rta.plugin.Selection", /** @lends sap.ui.dt.Plugin.prototype */
	{
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.rta",
			properties: {
				multiSelectionRequiredPlugins : {
					type : "string[]"
				}
			},
			associations: {},
			events: {
				elementEditableChange: {
					parameters: {
						editable: {
							type: "boolean"
						}
					}
				}
			}
		}
	});

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay to be checked for developer mode
	 * @returns {boolean} true if it's in developer mode
	 * @private
	 */
	Selection.prototype._checkDeveloperMode = function(oOverlay) {
		if (oOverlay.getDesignTimeMetadata()) {
			var bDeveloperMode = this.getCommandFactory().getFlexSettings().developerMode;
			if (bDeveloperMode && this.hasStableId(oOverlay)) {
				oOverlay.setEditable(true);
				oOverlay.setSelectable(true);
				this.fireElementEditableChange({
					editable: true
				});
				return true;
			}
		}
		return false;
	};

	/**
	 * Register an overlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	Selection.prototype.registerElementOverlay = function(oOverlay) {
		if (!this._checkDeveloperMode(oOverlay)) {
			oOverlay.attachEditableChange(this._onEditableChange, this);
			this._adaptSelectable(oOverlay);
		}

		oOverlay.attachBrowserEvent("click", this._selectOverlay, this);
		oOverlay.attachBrowserEvent("keydown", this._onKeyDown, this);
		oOverlay.attachBrowserEvent("mousedown", this._onMouseDown, this);
	};

	Selection.prototype._onEditableChange = function(oEvent) {
		var oOverlay = oEvent.getSource();
		this._adaptSelectable(oOverlay);
	};

	Selection.prototype._adaptSelectable = function(oOverlay) {
		var bSelectable = oOverlay.getEditable();
		if (oOverlay.getSelectable() !== bSelectable) {
			oOverlay.setSelectable(bSelectable);
			this.fireElementEditableChange({
				editable: bSelectable
			});
		}
	};

	/**
	 * Additionally to super->deregisterOverlay this method detatches the browser events
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	Selection.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.detachBrowserEvent("click", this._selectOverlay, this);
		oOverlay.detachBrowserEvent("keydown", this._onKeyDown, this);
		oOverlay.detachBrowserEvent("mousedown", this._onMouseDown, this);

		oOverlay.detachEditableChange(this._onEditableChange, this);
	};

	Selection.prototype._setFocusOnOverlay = function(oOverlay, oEvent) {
		if (oOverlay && oOverlay.getSelectable()) {
			oOverlay.focus();
			oEvent.stopPropagation();
		}
	};

	/**
	 * Handle keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	Selection.prototype._onKeyDown = function(oEvent) {
		var oOverlay = Utils.getFocusedOverlay();
		if (oEvent.keyCode === jQuery.sap.KeyCodes.ENTER) {
			this._selectOverlay(oEvent);
		} else if (oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_UP && oEvent.shiftKey === false && oEvent.altKey === false) {
			if (oOverlay) {
				var oParentOverlay = Utils.getFocusableParentOverlay(oOverlay);
				this._setFocusOnOverlay(oParentOverlay, oEvent);
				oEvent.preventDefault();
			}
		} else if (oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_DOWN && oEvent.shiftKey === false && oEvent.altKey === false) {
			if (oOverlay) {
				var oFirstChildOverlay = Utils.getFirstFocusableDescendantOverlay(oOverlay);
				this._setFocusOnOverlay(oFirstChildOverlay, oEvent);
				oEvent.preventDefault();
			}
		} else if (oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_LEFT && oEvent.shiftKey === false && oEvent.altKey === false) {
			if (oOverlay) {
				var oPrevSiblingOverlay = Utils.getPreviousFocusableSiblingOverlay(oOverlay);
				this._setFocusOnOverlay(oPrevSiblingOverlay, oEvent);
				oEvent.preventDefault();
			}
		} else if (oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_RIGHT && oEvent.shiftKey === false && oEvent.altKey === false) {
			if (oOverlay) {
				var oNextSiblingOverlay = Utils.getNextFocusableSiblingOverlay(oOverlay);
				this._setFocusOnOverlay(oNextSiblingOverlay, oEvent);
				oEvent.preventDefault();
			}
		}
	};

	Selection.prototype._selectOverlay = function (oEvent) {
		var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		var bMultiSelection = oEvent.metaKey || oEvent.ctrlKey;
		var oTargetClasses = oEvent.target.className;

		if (oOverlay.getSelectable() && oTargetClasses.indexOf("sapUiDtOverlay") > -1) {
			if (bMultiSelection) {
				this.getDesignTime().setSelectionMode(sap.ui.dt.SelectionMode.Multi);
			}

			oOverlay.setSelected(!oOverlay.getSelected());

			if (bMultiSelection) {
				this.getDesignTime().setSelectionMode(sap.ui.dt.SelectionMode.Single);
			}

			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	/**
	 * Handle MouseDown event
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	Selection.prototype._onMouseDown = function(oEvent) {
		if (sap.ui.Device.browser.name == "ie"){
			var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
			if (oOverlay.getSelectable()){
				oOverlay.focus();
				oEvent.stopPropagation();
			} else {
				oOverlay.getDomRef().blur();
			}
		}
	};

	/**
	 * @override
	 */
	Selection.prototype.setDesignTime = function(oDesignTime) {
		//detach from listener from old DesignTime instance
		if (this.getDesignTime()) {
			this.getDesignTime().detachSelectionChange(this._onDesignTimeSelectionChange, this);
		}

		//set new DesignTime instance in parent class
		Plugin.prototype.setDesignTime.apply(this, arguments);

		//attach listener back to the new DesignTime instance
		if (this.getDesignTime()) {
			this.getDesignTime().attachSelectionChange(this._onDesignTimeSelectionChange, this);
		}
	};

	Selection.prototype._onDesignTimeSelectionChange = function(oEvent) {
		if (this.getDesignTime().getSelectionMode() === sap.ui.dt.SelectionMode.Single) {
			return;
		}

		var oCurrentSelectedOverlay = oEvent.getParameter("selection")[oEvent.getParameter("selection").length - 1];
		var aSelections = this.getDesignTime().getSelection();
		if (aSelections && aSelections.length === 1) {
			oCurrentSelectedOverlay.setSelected(true);
			return;
		}
		if (!oCurrentSelectedOverlay || this.getDesignTime().getSelectionMode() === sap.ui.dt.SelectionMode.Single) {
			return;
		}

		//shared relevant container?
		var bMultiSelectisValid = _hasSharedMultiSelectionPlugins(aSelections, this.getMultiSelectionRequiredPlugins())
			&& _hasSharedRelevantContainer(aSelections);
		oCurrentSelectedOverlay.setSelected(bMultiSelectisValid);
	};

	function _hasSharedMultiSelectionPlugins(aSelections, aMultiSelectionRequiredPlugins){
		var aSharedMultiSelectionPlugins = aMultiSelectionRequiredPlugins;
		aSelections.forEach(function(oSelecedOverlay) {
			var aEditableByPlugins = oSelecedOverlay.getEditableByPlugins();
			aSharedMultiSelectionPlugins = aSharedMultiSelectionPlugins.reduce(function(aSharedPlugins, sPluginName){
				if (aEditableByPlugins.indexOf(sPluginName) !== -1){
					aSharedPlugins.push(sPluginName);
				}
				return aSharedPlugins;
			}, []);
		});
		return aSharedMultiSelectionPlugins.length > 0;
	}

	function _hasSharedRelevantContainer(aSelections){
		var oCurrentSelectedOverlay = aSelections[aSelections.length - 1];
		var oPreviousSelectedOverlay = aSelections[aSelections.length - 2];

		var oCurrentRelevantContainer = oCurrentSelectedOverlay.getRelevantContainer();
		var oPreviousRelevantContainer = oPreviousSelectedOverlay.getRelevantContainer();

		return oCurrentRelevantContainer === oPreviousRelevantContainer;
	}

	return Selection;
}, /* bExport= */true);
