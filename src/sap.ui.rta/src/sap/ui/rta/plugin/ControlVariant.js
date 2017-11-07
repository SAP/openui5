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
			sVariantManagementReference;

		if (oControl.getMetadata().getName() === "sap.ui.fl.variants.VariantManagement") {
			var oControl = oOverlay.getElementInstance(),
				vAssociationElement = oControl.getAssociation("for"),
				aVariantManagementTargetElements;

			sVariantManagementReference = BaseTreeModifier.getSelector(oControl, flUtils.getComponentForControl(oControl)).id;

			if (!vAssociationElement) {
				oOverlay.setVariantManagement(sVariantManagementReference);
				return;
			}

			aVariantManagementTargetElements = !jQuery.isArray(vAssociationElement) ? [vAssociationElement] : vAssociationElement;

			aVariantManagementTargetElements.forEach( function(sVariantManagementTargetElement) {
				var oVariantManagementTargetElement = sVariantManagementTargetElement instanceof ManagedObject ? sVariantManagementTargetElement : sap.ui.getCore().byId(sVariantManagementTargetElement),
					oVariantManagementTargetOverlay = OverlayRegistry.getOverlay(oVariantManagementTargetElement);
				this._propagateVariantManagement(oVariantManagementTargetOverlay , sVariantManagementReference);
			}.bind(this));
		} else if (!oOverlay.getVariantManagement()) {
			var sVariantManagementReference = this._getVariantManagementFromParent(oOverlay);
			if (sVariantManagementReference) {
				oOverlay.setVariantManagement(sVariantManagementReference);
			}
		}
		oOverlay.attachEvent("editableChange", RenameHandler._manageClickEvent, this);
		Plugin.prototype.registerElementOverlay.apply(this, arguments);
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

		this.removeFromPluginsList(oOverlay);
		Plugin.prototype.deregisterElementOverlay.apply(this, arguments);
	};

	ControlVariant.prototype._getVariantModel = function(oElement) {
		var oAppComponent = flUtils.getAppComponentForControl(oElement);
		return oAppComponent.getModel(ControlVariant.MODEL_NAME);
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay
	 * @returns {boolean} editable or not
	 * @private
	 */
	ControlVariant.prototype._isEditable = function(oOverlay) {
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
		var oElement = oOverlay.getElementInstance(),
			sVariantManagementReference = oOverlay.getVariantManagement ? oOverlay.getVariantManagement() : undefined;
		if (!sVariantManagementReference) {
			return false;
		}
		var oModel = this._getVariantModel(oElement),
			aVariants = oModel ? oModel.getData()[sVariantManagementReference].variants : [],
			bEnabled = aVariants.length > 1;
		return bEnabled;
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
		return true;
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
		return false;
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
			oRenamedElement = oOverlay.getElementInstance(),
			oDesignTimeMetadata = oOverlay.getDesignTimeMetadata(),
			oModel = this._getVariantModel(oRenamedElement),
			oSetTitleCommand,
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
				this._$oEditableControlDomRef.text(sText);
				try {
					oSetTitleCommand = this.getCommandFactory().getCommandFor(oRenamedElement, "setTitle", {
						renamedElement: oRenamedElement,
						newText: sText
					}, oDesignTimeMetadata, sVariantManagementReference);
					this.fireElementModified({
						"command": oSetTitleCommand
					});
				} catch (oError) {
					jQuery.sap.log.error("Error during rename : ", oError);
				}
				return;
			}
		}

		if (sWarningText) {
			//Prepare VariantManagement control overlay for valueStateMessage
			oOverlay.getValueState = function () {
				return "Error";
			};
			oOverlay.getValueStateText = function () {
				return oResourceBundle.getText(sWarningText);
			};
			oOverlay.getDomRefForValueStateMessage = function () {
				return this.$();
			};

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
	 * Opens a dialog for Variant configuration
	 *
	 * @public
	 */
	ControlVariant.prototype.configureVariants = function() {
		return;
	};

	/**
	 * Retrieve the context menu item for the actions.
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay Overlay for which the context menu was opened
	 * @return {object[]}          Returns array containing the items with required data
	 */
	ControlVariant.prototype.getMenuItems = function(oOverlay){
		var VARIANT_MODEL_NAME = '$FlexVariants';
		var aMenuItems = [];

		if (this.isRenameAvailable(oOverlay)){
			aMenuItems.push({
				id: "CTX_VARIANT_SET_TITLE",
				text: sap.ui.getCore().getLibraryResourceBundle('sap.ui.rta').getText('CTX_VARIANT_SET_TITLE'),
				handler: this.renameVariant.bind(this),
				enabled: this.isRenameEnabled.bind(this),
				rank: 210
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
				rank: 220
			});
		}

		if (this.isVariantConfigureAvailable(oOverlay)){
			aMenuItems.push({
				id: "CTX_VARIANT_CONFIGURE",
				text: sap.ui.getCore().getLibraryResourceBundle('sap.ui.rta').getText('CTX_VARIANT_CONFIGURE'),
				handler: this.configureVariants.bind(this),
				enabled: this.isVariantConfigureEnabled.bind(this),
				startSection: true,
				rank: 230
			});
		}

		if (this.isVariantSwitchAvailable(oOverlay)){
			aMenuItems.push({
				id: "CTX_VARIANT_SWITCH_SUBMENU",
				text: sap.ui.getCore().getLibraryResourceBundle('sap.ui.rta').getText('CTX_VARIANT_SWITCH'),
				handler: function(aOverlays, mPropertyBag){
					var oData = mPropertyBag.eventItem.data(),
						oTargetOverlay = oData.targetOverlay,
						sNewVariantKey = oData.key,
						sCurrentVariantKey = oData.current;
					return this.switchVariant(oTargetOverlay, sNewVariantKey, sCurrentVariantKey);
				}.bind(this),
				enabled: this.isVariantSwitchEnabled.bind(this),
				submenu: {
					id: "{" + VARIANT_MODEL_NAME + ">key}",
					text: "{" + VARIANT_MODEL_NAME + ">title}",
					model: VARIANT_MODEL_NAME,
					current: function(oOverlay, oModel) {
						var sManagementReferenceId = oOverlay.getVariantManagement();
						return oModel.getData()[sManagementReferenceId].currentVariant;
					},
					items: function(oOverlay, oModel) {
						var sManagementReferenceId = oOverlay.getVariantManagement();
						return oModel.getData()[sManagementReferenceId].variants;
					}
				},
				type: "subMenuWithBinding",
				rank: 240
			});
		}

		return aMenuItems;
	};

	return ControlVariant;
}, /* bExport= */true);
