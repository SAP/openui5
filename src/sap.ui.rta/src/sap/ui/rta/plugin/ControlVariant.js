/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.ControlVariant.
sap.ui.define([
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/rta/plugin/RenameHandler',
	'sap/ui/rta/Utils',
	'sap/ui/dt/ElementOverlay',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/fl/changeHandler/BaseTreeModifier',
	'sap/ui/fl/Utils',
	'sap/ui/fl/variants/VariantManagement',
	'sap/ui/base/ManagedObject',
	'sap/m/delegate/ValueStateMessage'
], function(Plugin, RenameHandler, Utils, ElementOverlay, OverlayRegistry, OverlayUtil, BaseTreeModifier, flUtils, VariantManagement, ManagedObject, ValueStateMessage) {
	"use strict";

	/**
	 * Constructor for a new ControlVariant Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The ControlVariant allows propagation of variantManagement key
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.50
	 * @alias sap.ui.rta.plugin.ControlVariant
	 * @experimental Since 1.50. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	/* Mix-in Variant Methods */
	ElementOverlay.prototype._variantManagement = undefined;
	ElementOverlay.prototype.getVariantManagement = function() { return this._variantManagement;};
	ElementOverlay.prototype.setVariantManagement = function(sKey) { this._variantManagement = sKey; };
	ElementOverlay.prototype.hasVariantManagement = function() { return this._variantManagement ? true : false; };

	var ControlVariant = Plugin.extend("sap.ui.rta.plugin.ControlVariant", /** @lends sap.ui.rta.plugin.ControlVariant.prototype */
	{
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.rta",
			properties : {
				oldValue : "string",
				variantManagementControlOverlay : {
					type : "any"
				}
			},
			associations: {},
			events: {}
		}
	});

	ControlVariant.MODEL_NAME = "$FlexVariants";

	/**
	 * Register an overlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	ControlVariant.prototype.registerElementOverlay = function(oOverlay) {
		var oControl = oOverlay.getElementInstance(),
			oModel = this._getVariantModel(oControl),
			sVariantManagementReference;

		Plugin.prototype.registerElementOverlay.apply(this, arguments);

		if (!oModel){
			return;
		}

		if (oControl instanceof VariantManagement) {
			var oControl = oOverlay.getElementInstance(),
				vAssociationElement = oControl.getFor(),
				aVariantManagementTargetElements;

			sVariantManagementReference = BaseTreeModifier.getSelector(oControl, flUtils.getComponentForControl(oControl)).id;

			if (!vAssociationElement ||
				(Array.isArray(vAssociationElement) && vAssociationElement.length === 0)) {
				oOverlay.setVariantManagement(sVariantManagementReference);
				return;
			}
			if (!this._isPersonalizationMode()) {
				oModel._setModelPropertiesForControl(sVariantManagementReference, true, oControl);
				oModel.checkUpdate(true);
			}

			aVariantManagementTargetElements = !jQuery.isArray(vAssociationElement) ? [vAssociationElement] : vAssociationElement;

			aVariantManagementTargetElements.forEach( function(sVariantManagementTargetElement) {
				var oVariantManagementTargetElement = sVariantManagementTargetElement instanceof ManagedObject ? sVariantManagementTargetElement : sap.ui.getCore().byId(sVariantManagementTargetElement),
					oVariantManagementTargetOverlay = OverlayRegistry.getOverlay(oVariantManagementTargetElement);
				this._propagateVariantManagement(oVariantManagementTargetOverlay , sVariantManagementReference);
			}.bind(this));
			oOverlay.attachEvent("editableChange", RenameHandler._manageClickEvent, this);
		} else if (!oOverlay.getVariantManagement()) {
			sVariantManagementReference = this._getVariantManagementFromParent(oOverlay);
			if (sVariantManagementReference) {
				oOverlay.setVariantManagement(sVariantManagementReference);
				oOverlay.attachEvent("editableChange", RenameHandler._manageClickEvent, this);
			}
		}
	};

	ControlVariant.prototype._isPersonalizationMode = function () {
		return this.getCommandFactory().getFlexSettings().layer === "USER";
	};

	/**
	 * Top-down approach for setting VariantManagement reference to all children overlays
	 *
	 * @param {sap.ui.dt.Overlay} oParentElementOverlay overlay object for which children overlays are computed
	 * @param {string} sVariantManagementReference VariantManagement reference to be set
	 * @returns {array} array of rendered ElementOverlays which have been set with passed VariantManagement reference
	 * @private
	 */
	ControlVariant.prototype._propagateVariantManagement = function(oParentElementOverlay, sVariantManagementReference) {
		var aElementOverlaysRendered = [];
		oParentElementOverlay.setVariantManagement(sVariantManagementReference);
		aElementOverlaysRendered = OverlayUtil.getAllChildOverlays(oParentElementOverlay);

		aElementOverlaysRendered.forEach( function(oElementOverlay) {
			aElementOverlaysRendered = aElementOverlaysRendered.concat(this._propagateVariantManagement(oElementOverlay, sVariantManagementReference));
		}.bind(this));

		return aElementOverlaysRendered;
	};

	/**
	 * Bottom-up approach for setting VariantManagement reference from parent ElementOverlays
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object for which VariantManagement reference is to be set
	 * @returns {string} VariantManagement reference
	 * @private
	 */
	ControlVariant.prototype._getVariantManagementFromParent = function(oOverlay) {
		var sVariantManagementReference = oOverlay.getVariantManagement();
		if (!sVariantManagementReference && oOverlay.getParentElementOverlay()) {
			return this._getVariantManagementFromParent(oOverlay.getParentElementOverlay());
		}
		return sVariantManagementReference;
	};

	/**
	 * Additionally to super->deregisterOverlay this method detatches the browser events
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	ControlVariant.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.detachEvent("editableChange", RenameHandler._manageClickEvent, this);
		oOverlay.detachBrowserEvent("click", RenameHandler._onClick, this);

		var oModel;
		var sVariantManagementReference;
		var oControl = oOverlay.getElementInstance();
		if (oControl instanceof VariantManagement) {
			oModel = this._getVariantModel(oControl);
			sVariantManagementReference = oOverlay.getVariantManagement();
			oModel._setModelPropertiesForControl(sVariantManagementReference, false, oControl);
			oModel.checkUpdate(true);
		}

		this.removeFromPluginsList(oOverlay);
		Plugin.prototype.deregisterElementOverlay.apply(this, arguments);
	};

	ControlVariant.prototype._getVariantModel = function(oElement) {
		var oAppComponent = flUtils.getAppComponentForControl(oElement);
		return oAppComponent ? oAppComponent.getModel(ControlVariant.MODEL_NAME) : undefined;
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay
	 * @returns {boolean} editable or not
	 * @private
	 */
	ControlVariant.prototype._isEditable = function(oOverlay) {
		if (this._isPersonalizationMode()) {
			return false;
		}
		return this._isVariantManagementControl(oOverlay);
	};

	ControlVariant.prototype._isVariantManagementControl = function(oOverlay) {
		var oElement = oOverlay.getElementInstance(),
			vAssociationElement = oElement.getAssociation("for");
		return !!(vAssociationElement && oElement instanceof VariantManagement);
	};

	/**
	 * Checks if variant switch is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	ControlVariant.prototype.isVariantSwitchAvailable = function(oOverlay) {
		return this._isVariantManagementControl(oOverlay);
	};

	/**
	 * Checks if Variant Switch is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if enabled
	 * @public
	 */
	ControlVariant.prototype.isVariantSwitchEnabled = function(oOverlay) {
		if (this._isVariantManagementControl(oOverlay)) {
			var oElement = oOverlay.getElementInstance(),
				sVariantManagementReference = oOverlay.getVariantManagement ? oOverlay.getVariantManagement() : undefined;
			if (!sVariantManagementReference) {
				return false;
			}
			var oModel = this._getVariantModel(oElement),
				aVariants = oModel ? oModel.getData()[sVariantManagementReference].variants : [],
				bEnabled = aVariants.length > 1;
			return bEnabled;
		} else {
			return false;
		}
	};

	/**
	 * @override
	 */
	ControlVariant.prototype.setDesignTime = function(oDesignTime) {
		RenameHandler._setDesignTime.call(this, oDesignTime);
	};

	/**
	 * Checks if variant rename is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	ControlVariant.prototype.isRenameAvailable = function(oOverlay) {
		return this._isVariantManagementControl(oOverlay);
	};

	/**
	 * Checks if variant rename is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	ControlVariant.prototype.isRenameEnabled = function(oOverlay) {
		return this._isVariantManagementControl(oOverlay);
	};

	/**
	 * Checks if variant duplicate is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	ControlVariant.prototype.isVariantDuplicateAvailable = function(oOverlay) {
		return this._isVariantManagementControl(oOverlay);
	};

	/**
	 * Checks if variant duplicate is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	ControlVariant.prototype.isVariantDuplicateEnabled = function(oOverlay) {
		var sVariantManagementReference = oOverlay.getVariantManagement ? oOverlay.getVariantManagement() : undefined;
		if (!sVariantManagementReference || !this._isVariantManagementControl(oOverlay)) {
			return false;
		}
		return true;
	};

	/**
	 * Checks if variant configure is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	ControlVariant.prototype.isVariantConfigureAvailable = function(oOverlay) {
		return this._isVariantManagementControl(oOverlay);
	};

	/**
	 * Checks if variant configure is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if available
	 * @public
	 */
	ControlVariant.prototype.isVariantConfigureEnabled = function(oOverlay) {
		return this._isVariantManagementControl(oOverlay);
	};

	/**
	 * Performs a variant switch
	 *
	 * @param {object} oTargetOverlay Target variant management overlay
	 * @param {String} sNewVariantReference The new variant reference
	 * @param {String} sCurrentVariantReference The current variant reference
	 * @public
	 */
	ControlVariant.prototype.switchVariant = function(oTargetOverlay, sNewVariantReference, sCurrentVariantReference) {
		var oDesignTimeMetadata = oTargetOverlay.getDesignTimeMetadata(),
			oTargetElement = oTargetOverlay.getElementInstance();

		var oSwitchCommand = this.getCommandFactory().getCommandFor(oTargetElement, "switch", {
			targetVariantReference: sNewVariantReference,
			sourceVariantReference: sCurrentVariantReference
		}, oDesignTimeMetadata);
		this.fireElementModified({
			"command" : oSwitchCommand
		});
	};

	/**
	 * Performs a variant set title
	 *
	 * @public
	 */
	ControlVariant.prototype.renameVariant = function(aOverlays) {
		this.startEdit(aOverlays[0]);
	};

	ControlVariant.prototype.startEdit = function(oOverlay) {
		var oVariantManagementControl = oOverlay.getElementInstance(),
			vDomRef = function () {
				return oVariantManagementControl.getTitle().getDomRef("inner");
			};

		RenameHandler.startEdit.call(this, oOverlay, vDomRef, "plugin.ControlVariant.startEdit");
	};

	ControlVariant.prototype.stopEdit = function (bRestoreFocus) {
		RenameHandler._stopEdit.call(this, bRestoreFocus, "plugin.ControlVariant.stopEdit");
	};

	/**
	 * Performs a variant duplicate
	 *
	 * @param {object} oOverlay Variant management overlay
	 * @public
	 */
	ControlVariant.prototype.duplicateVariant = function(oOverlay) {
		this.setVariantManagementControlOverlay(oOverlay);
		var sVariantManagementReference = oOverlay.getVariantManagement();
		var oElement = oOverlay.getElementInstance();
		var oModel = this._getVariantModel(oElement);
		var sCurrentVariantReference = oModel.getCurrentVariantReference(sVariantManagementReference);
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();

		var oDuplicateCommand = this.getCommandFactory().getCommandFor(oElement, "duplicate", {
			sourceVariantReference: sCurrentVariantReference
		}, oDesignTimeMetadata, sVariantManagementReference);
		this.fireElementModified({
			"command" : oDuplicateCommand,
			"action" : "setTitle"
		});
	};

	/**
	 * @private
	 */
	ControlVariant.prototype._emitLabelChangeEvent = function() {
		var sText = RenameHandler._getCurrentEditableFieldText.call(this),
			oOverlay = this._oEditedOverlay,
			oDesignTimeMetadata = oOverlay.getDesignTimeMetadata(),
			oRenamedElement = oOverlay.getElementInstance(),
			oModel = this._getVariantModel(oRenamedElement),
			sWarningText,
			sVariantManagementReference = oOverlay.getVariantManagement(),
			iDuplicateCount = oModel._getVariantLabelCount(sText, sVariantManagementReference),
			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

		//Remove border
		oOverlay.$().removeClass("sapUiErrorBg");

		//Close valueStateMessage
		if (this._oValueStateMessage) {
			this._oValueStateMessage.getPopup().attachClosed(function() {
				oRenamedElement.$().css("z-index", 1);
			});
			this._oValueStateMessage.close();
		}

		//For newly created variants, duplicate triggered on count of 2
		if (iDuplicateCount > 1) {
			sWarningText = "DUPLICATE_WARNING_TEXT";
		}

		//Check for real change before creating a command and pass if warning text already set
		if (this.getOldValue() !== sText && !sWarningText) {
			if (sText === '\xa0') { //Empty string
				sWarningText = "BLANK_WARNING_TEXT";
			} else if (iDuplicateCount > 0) {
				sWarningText = "DUPLICATE_WARNING_TEXT";
			} else if (!sWarningText) {
				return this._createSetTitleCommand({
					text: sText,
					element: oRenamedElement,
					designTimeMetadata: oDesignTimeMetadata,
					variantManagementReference: sVariantManagementReference
				});
			}
		}

		if (sWarningText) {
			var sValueStateText = oResourceBundle.getText(sWarningText);
			this._prepareOverlayForValueState(oOverlay, sValueStateText);

			return Utils._showMessageBox("WARNING", "BLANK_DUPLICATE_TITLE_TEXT", sWarningText)
				.then(function () {
					//valueStateMessage
					if (!this._oValueStateMessage) {
						this._oValueStateMessage = new ValueStateMessage(oOverlay);
						this._oValueStateMessage.getPopup()._deactivateFocusHandle();
					}
					this._oValueStateMessage.open();

					//Border
					oOverlay.$().addClass("sapUiErrorBg");

					this.startEdit(oOverlay);
				}.bind(this));
		}
	};

	/**
	 * sets the domref text, creates a setTitle command and fires element modified
	 * @param {map} mPropertyBag - (required) contains required properties to create the command
	 * @returns {object} setTitle command
	 * @private
	 */
	ControlVariant.prototype._createSetTitleCommand = function (mPropertyBag) {
		var oSetTitleCommand;
		this._$oEditableControlDomRef.text(mPropertyBag.text);
		try {
			oSetTitleCommand = this.getCommandFactory().getCommandFor(mPropertyBag.element, "setTitle", {
				renamedElement: mPropertyBag.element,
				newText: mPropertyBag.text
			}, mPropertyBag.designTimeMetadata, mPropertyBag.variantManagementReference);
			this.fireElementModified({
				"command": oSetTitleCommand
			});
		} catch (oError) {
			jQuery.sap.log.error("Error during rename : ", oError);
		}
		return oSetTitleCommand;
	};

	/**
	 * prepares overlay for showing a value state message
	 * @param {object} oOverlay Overlay which needs be prepared
	 * @param {string} sValueStateText value state text that needs to be set
	 * @private
	 */
	ControlVariant.prototype._prepareOverlayForValueState = function (oOverlay, sValueStateText) {
		//Prepare VariantManagement control overlay for valueStateMessage
		oOverlay.getValueState = function () {
			return "Error";
		};
		oOverlay.getValueStateText = function () {
			return sValueStateText;
		};
		oOverlay.getDomRefForValueStateMessage = function () {
			return this.$();
		};
	};

	/**
	 * Opens a dialog for Variant configuration
	 *
	 * @public
	 */
	ControlVariant.prototype.configureVariants = function(aOverlays) {
		var oVariantManagementControl = aOverlays[0].getElementInstance();
		var sVariantManagementReference = aOverlays[0].getVariantManagement();
		var oModel = this._getVariantModel(oVariantManagementControl);
		var oDesignTimeMetadata = aOverlays[0].getDesignTimeMetadata();

		oModel.manageVariants(oVariantManagementControl, sVariantManagementReference, this.getCommandFactory().getFlexSettings().layer).then(function(aConfiguredChanges) {
			var oConfigureCommand = this.getCommandFactory().getCommandFor(oVariantManagementControl, "configure", {
				control: oVariantManagementControl,
				changes: aConfiguredChanges
			}, oDesignTimeMetadata, sVariantManagementReference);
			this.fireElementModified({
				"command": oConfigureCommand
			});
		}.bind(this));
	};

	/**
	 * Retrieve the context menu item for the actions.
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay Overlay for which the context menu was opened
	 * @return {object[]}          Returns array containing the items with required data
	 */
	ControlVariant.prototype.getMenuItems = function(oOverlay){
		var aMenuItems = [];

		if (this.isRenameAvailable(oOverlay)){
			aMenuItems.push({
				id: "CTX_VARIANT_SET_TITLE",
				text: sap.ui.getCore().getLibraryResourceBundle('sap.ui.rta').getText('CTX_RENAME'),
				handler: this.renameVariant.bind(this),
				enabled: this.isRenameEnabled.bind(this),
				rank: 210,
				icon: "sap-icon://edit"
			});
		}

		if (this.isVariantDuplicateAvailable(oOverlay)){
			aMenuItems.push({
				id: "CTX_VARIANT_DUPLICATE",
				text: sap.ui.getCore().getLibraryResourceBundle('sap.ui.rta').getText('CTX_VARIANT_DUPLICATE'),
				handler: function(aOverlays){
					return this.duplicateVariant(aOverlays[0]);
				}.bind(this),
				enabled: this.isVariantDuplicateEnabled.bind(this),
				rank: 220,
				icon: "sap-icon://duplicate"
			});
		}

		if (this.isVariantConfigureAvailable(oOverlay)){
			aMenuItems.push({
				id: "CTX_VARIANT_CONFIGURE",
				text: sap.ui.getCore().getLibraryResourceBundle('sap.ui.rta').getText('CTX_VARIANT_CONFIGURE'),
				handler: this.configureVariants.bind(this),
				enabled: this.isVariantConfigureEnabled.bind(this),
				startSection: true,
				rank: 230,
				icon: "sap-icon://action-settings"
			});
		}

		if (this.isVariantSwitchAvailable(oOverlay)){
			var oModel = this._getVariantModel(oOverlay.getElementInstance());
			var sManagementReferenceId = oOverlay.getVariantManagement();

			var aSubmenuItems = oModel.getData()[sManagementReferenceId].variants.map(function(oVariant) {
				var bCurrentItem = oModel.getData()[sManagementReferenceId].currentVariant === oVariant.key;
				return {
					id: oVariant.key,
					text: oVariant.title,
					icon: bCurrentItem ? "sap-icon://accept" : "",
					enabled: !bCurrentItem
				};
			});

			aMenuItems.push({
				id: "CTX_VARIANT_SWITCH_SUBMENU",
				text: sap.ui.getCore().getLibraryResourceBundle('sap.ui.rta').getText('CTX_VARIANT_SWITCH'),
				handler: function(aOverlays, mPropertyBag){
					var oData = mPropertyBag.eventItem.data(),
						oTargetOverlay = aOverlays[0],
						sNewVariantKey = oData.key,
						sCurrentVariantKey = oModel.getData()[sManagementReferenceId].currentVariant;
					return this.switchVariant(oTargetOverlay, sNewVariantKey, sCurrentVariantKey);
				}.bind(this),
				enabled: this.isVariantSwitchEnabled.bind(this),
				submenu: aSubmenuItems,
				rank: 240,
				icon: "sap-icon://switch-views"
			});
		}

		return aMenuItems;
	};

	return ControlVariant;
}, /* bExport= */true);
