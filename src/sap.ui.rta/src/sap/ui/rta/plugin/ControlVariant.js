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
	'sap/m/delegate/ValueStateMessage',
	'sap/ui/rta/command/CompositeCommand'
], function(Plugin, RenameHandler, Utils, ElementOverlay, OverlayRegistry, OverlayUtil, BaseTreeModifier, flUtils, VariantManagement, ManagedObject, ValueStateMessage, CompositeCommand) {
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
		var oControl = oOverlay.getElement(),
			oModel = this._getVariantModel(oControl),
			sVariantManagementReference;

		Plugin.prototype.registerElementOverlay.apply(this, arguments);

		if (!oModel){
			return;
		}

		if (oControl instanceof VariantManagement) {
			var oControl = oOverlay.getElement(),
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
		var oControl = oOverlay.getElement();
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
		var oElement = oOverlay.getElement(),
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
		var aVariants = [];
		if (this._isVariantManagementControl(oOverlay)) {
			var oElement = oOverlay.getElement(),
				sVariantManagementReference = oOverlay.getVariantManagement ? oOverlay.getVariantManagement() : undefined;
			if (!sVariantManagementReference) {
				return false;
			}
			var oModel = this._getVariantModel(oElement);
			if (oModel) {
				aVariants = oModel.getData()[sVariantManagementReference].variants.reduce(function(aReducedVariants, oVariant) {
					if (oVariant.visible) {
						return aReducedVariants.concat(oVariant);
					} else {
						return aReducedVariants;
					}
				}, []);
			}
			var bEnabled = aVariants.length > 1;
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
			oTargetElement = oTargetOverlay.getElement();

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
		this.setVariantManagementControlOverlay(aOverlays[0]);
		this.startEdit(aOverlays[0]);
	};

	ControlVariant.prototype.startEdit = function(oOverlay) {
		var oVariantManagementControl = oOverlay.getElement(),
			vDomRef = oOverlay.getDesignTimeMetadata().getDomRef();
		var oVariantTitleElement = oVariantManagementControl.getTitle();
		var sPreviousText = oVariantTitleElement.getText();
		var fnHandleStartEdit = RenameHandler.startEdit.bind( this, {
			overlay: oOverlay,
			domRef: vDomRef,
			pluginMethodName: "plugin.ControlVariant.startEdit"
		});

		if (oOverlay._triggerDuplicate) {
			var sCustomTextForDuplicate = this._getVariantTitleForCopy(
				sPreviousText,
				oOverlay.getVariantManagement(),
				this._getVariantModel(oVariantManagementControl).getData()
			);

			oVariantManagementControl.getTitle().setText(sCustomTextForDuplicate);

			oOverlay.attachEventOnce("geometryChanged", function() {
				fnHandleStartEdit();
			}, this);
		} else {
			fnHandleStartEdit();
		}
	};

	ControlVariant.prototype.stopEdit = function (bRestoreFocus) {
		if (this._oEditedOverlay._triggerDuplicate) {
			this._oEditedOverlay.getElementInstance().getTitle().getBinding("text").refresh(true);
			if (!this._oEditedOverlay.hasStyleClass("sapUiRtaErrorBg")) {
				delete this._oEditedOverlay._triggerDuplicate;
			}
		}

		RenameHandler._stopEdit.call(this, bRestoreFocus, "plugin.ControlVariant.stopEdit");
	};

	ControlVariant.prototype.isBusy = function(){
		return this._bPreventMenu;
	};

	ControlVariant.prototype._createDuplicateCommand = function (mPropertyBag) {
		var oDuplicateCommand = this.getCommandFactory().getCommandFor(mPropertyBag.element, "duplicate", {
			sourceVariantReference: mPropertyBag.currentVariantReference,
			newVariantTitle: mPropertyBag.newVariantTitle
		}, mPropertyBag.designTimeMetadata, mPropertyBag.variantManagementReference);
		return oDuplicateCommand;
	};

	/**
	 * @private
	 */
	ControlVariant.prototype._emitLabelChangeEvent = function() {
		var sText = RenameHandler._getCurrentEditableFieldText.call(this),
			oOverlay = this._oEditedOverlay,
			oDesignTimeMetadata = oOverlay.getDesignTimeMetadata(),
			oRenamedElement = oOverlay.getElement(),
			oModel = this._getVariantModel(oRenamedElement),
			sErrorText,
			oCommand,
			sVariantManagementReference = oOverlay.getVariantManagement(),
			bTextChanged = this.getOldValue() !== sText,
			bNewEntry = bTextChanged || oOverlay._triggerDuplicate,
			iDuplicateCount = bNewEntry
				? oModel._getVariantTitleCount(sText, sVariantManagementReference)
				: 0,
			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta"),
			sCurrentVariantReference = oModel.getCurrentVariantReference(sVariantManagementReference);

		//Remove border
		oOverlay.removeStyleClass("sapUiRtaErrorBg");

		//Close valueStateMessage
		if (this._oValueStateMessage) {
			this._oValueStateMessage.getPopup().attachClosed(function() {
				oRenamedElement.$().css("z-index", 1);
			});
			this._oValueStateMessage.close();
		}

		//Check for real change before creating a command and pass if warning text already set
		if (sText === '\xa0') { //Empty string
			sErrorText = "BLANK_ERROR_TEXT";
		} else if (iDuplicateCount > 0) {
			sErrorText = "DUPLICATE_ERROR_TEXT";
		} else if (bNewEntry) {

			var oSetTitleCommand = this._createSetTitleCommand({
				text: sText,
				element: oRenamedElement,
				designTimeMetadata: oDesignTimeMetadata,
				variantManagementReference: sVariantManagementReference
			});

			if (oOverlay._triggerDuplicate) {
				oCommand = new CompositeCommand({
					commands: [
						this._createDuplicateCommand({
							currentVariantReference: sCurrentVariantReference,
							designTimeMetadata: oDesignTimeMetadata,
							variantManagementReference: sVariantManagementReference,
							element: oRenamedElement,
							newVariantTitle: this.getOldValue()
						})
					]
				});
				if (bTextChanged) {
					oCommand.addCommand(oSetTitleCommand);
				}
			} else {
				oCommand = oSetTitleCommand;
			}
			this.fireElementModified({
				"command": oCommand
			});
			return oCommand;
		} else {
			jQuery.sap.log.info("Control Variant title unchanged");
		}


		if (sErrorText) {
			var sValueStateText = oResourceBundle.getText(sErrorText);
			this._prepareOverlayForValueState(oOverlay, sValueStateText);

			//Border
			oOverlay.addStyleClass("sapUiRtaErrorBg");

			Utils._showMessageBox("ERROR", "BLANK_DUPLICATE_TITLE_TEXT", sErrorText)
				.then(function () {
					//valueStateMessage
					if (!this._oValueStateMessage) {
						this._oValueStateMessage = new ValueStateMessage(oOverlay);
						this._oValueStateMessage.getPopup()._deactivateFocusHandle();
					}
					this._oValueStateMessage.open();

					this.startEdit(oOverlay);
				}.bind(this));
		}

	};

	/**
	 * Calculates title string for a duplicated variant
	 *
	 * For single copy - {0} is filled with the source variant title
	 * E.g. if resource bundle text pattern is {0} Copy;
	 * Duplicate (Source = 'Standard') -> 'Standard Copy'
	 *
	 * For multiple copies - {0} is filled with source variant title (no copy/counter) and {1} is filled with the highest counter of source variant tile
	 * E.g. if resource bundle text pattern is {0} Copy {1};
	 * Duplicate (Source = 'Standard Copy 1', with 'Standard Copy 5' already existing) -> 'Standard Copy 6'
	 *
	 * @param {String} sSourceVariantTitle Source variant title
	 * @param {String} sVariantManagementReference Variant management reference belonging to the variants
	 * @param {object} oData Variant Model (sap.ui.fl.variants.VariantModel) data
	 * @returns {String} Returns the duplicate variant title
	 * @private
	 */
	ControlVariant.prototype._getVariantTitleForCopy = function(sSourceVariantTitle, sVariantManagementReference, oData) {
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");
		// \ ^ $ * + ? . ( ) | { } [ ] escaped for regex
		var sCopyTextSingle =
			oResourceBundle.getText("VARIANT_COPY_SINGLE_TEXT")
				.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
				.replace("\\{0\\}", "(.*)");

		var sCopyTextMultiple =
			oResourceBundle.getText("VARIANT_COPY_MULTIPLE_TEXT")
				.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
				.replace("\\{0\\}", "(.*)")
				.replace("\\{1\\}", "([0-9]+)");

		var regexForCopy = new RegExp(sCopyTextSingle + "+");
		var regexForIncrement = new RegExp(sCopyTextMultiple);
		var sTitleTrimmed;
		var iIndexForCounter = sCopyTextMultiple.lastIndexOf("(.*)") > sCopyTextMultiple.lastIndexOf("([0-9]+)") ? 1 : 2;
		var iIndexForTrimmedTitle = (iIndexForCounter === 1) ? 2 : 1;
		var iTitleCounter = 0;

		if (regexForIncrement.test(sSourceVariantTitle)) { /* Case 1: when Copy already has a counter in the end of string */
			sTitleTrimmed = regexForIncrement.exec(sSourceVariantTitle)[iIndexForTrimmedTitle];
		} else {
			sTitleTrimmed =
				regexForCopy.test(sSourceVariantTitle)
					? regexForCopy.exec(sSourceVariantTitle)[1] /* Case 2: when Copy already exists at the end of string */
					: sSourceVariantTitle; /* Case 3: when there is no copy or counter in the end of string */
		}

		var aRegexExecOnVariantTitle = [];
		oData[sVariantManagementReference].variants.forEach( function(oVariant) {
			if (oVariant.visible) {
				aRegexExecOnVariantTitle =
					regexForIncrement.test(oVariant.title)
						? regexForIncrement.exec(oVariant.title)
						: regexForCopy.exec(oVariant.title);

				if (!aRegexExecOnVariantTitle) {
					return;
				}
				/* First copy with counter is matched, if not, then only copy is matched */
				if (aRegexExecOnVariantTitle.length === 3 &&
					sTitleTrimmed === aRegexExecOnVariantTitle[iIndexForTrimmedTitle]) {
					// Extract integer part & increment counter
					iTitleCounter =
						aRegexExecOnVariantTitle[iIndexForCounter]
							? (parseInt(aRegexExecOnVariantTitle[iIndexForCounter], 10) + 1)
							: iTitleCounter;

				} else if (aRegexExecOnVariantTitle.length === 2
					&& sTitleTrimmed === aRegexExecOnVariantTitle[1]) {
					iTitleCounter = iTitleCounter === 0 ? 1 : iTitleCounter;
				}
			}
		});
		return iTitleCounter > 0
			? oResourceBundle.getText("VARIANT_COPY_MULTIPLE_TEXT", [sTitleTrimmed, iTitleCounter])
			: oResourceBundle.getText("VARIANT_COPY_SINGLE_TEXT", [sTitleTrimmed]);
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
				newText: mPropertyBag.text
			}, mPropertyBag.designTimeMetadata, mPropertyBag.variantManagementReference);
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
		var oVariantManagementControl = aOverlays[0].getElement();
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
					aOverlays[0]._triggerDuplicate = true;
					this.renameVariant(aOverlays);
				}.bind(this),
				enabled: this.isVariantDuplicateEnabled.bind(this),
				rank: 220,
				icon: "sap-icon://duplicate"
			});
		}

		if (this.isVariantConfigureAvailable(oOverlay)){
			aMenuItems.push({
				id: "CTX_VARIANT_MANAGE",
				text: sap.ui.getCore().getLibraryResourceBundle('sap.ui.rta').getText('CTX_VARIANT_MANAGE'),
				handler: this.configureVariants.bind(this),
				enabled: this.isVariantConfigureEnabled.bind(this),
				startSection: true,
				rank: 230,
				icon: "sap-icon://action-settings"
			});
		}

		if (this.isVariantSwitchAvailable(oOverlay)){
			var oModel = this._getVariantModel(oOverlay.getElement());
			var sManagementReferenceId = oOverlay.getVariantManagement();

			var aSubmenuItems = oModel.getData()[sManagementReferenceId].variants.reduce(function(aReducedVariants, oVariant) {
				if (oVariant.visible) {
					var bCurrentItem = oModel.getData()[sManagementReferenceId].currentVariant === oVariant.key;
					var oItem = {
						id: oVariant.key,
						text: oVariant.title,
						icon: bCurrentItem ? "sap-icon://accept" : "blank",
						enabled: !bCurrentItem
					};
					return aReducedVariants.concat(oItem);
				} else {
					return aReducedVariants;
				}
			}, []);

			aMenuItems.push({
				id: "CTX_VARIANT_SWITCH_SUBMENU",
				text: sap.ui.getCore().getLibraryResourceBundle('sap.ui.rta').getText('CTX_VARIANT_SWITCH'),
				handler: function(aOverlays, mPropertyBag){
					var oEventItemCustomData = mPropertyBag.eventItem.data(),
						oTargetOverlay = aOverlays[0],
						sNewVariantKey = oEventItemCustomData.key,
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
