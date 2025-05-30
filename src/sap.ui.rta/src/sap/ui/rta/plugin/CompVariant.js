/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/isEmptyObject",
	"sap/m/MessageBox",
	"sap/ui/core/Lib",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/rta/plugin/rename/RenameDialog",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils"
], function(
	_omit,
	isEmptyObject,
	MessageBox,
	Lib,
	OverlayRegistry,
	DtUtil,
	ContextSharingAPI,
	RenameDialog,
	Plugin,
	Utils
) {
	"use strict";

	var CompVariant = Plugin.extend("sap.ui.rta.plugin.CompVariant", /** @lends sap.ui.rta.plugin.CompVariant.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				// needed for rename
				oldValue: {
					type: "string"
				}
			}
		}
	});

	function isCompVariant(oElement) {
		return oElement.getMetadata().getName() === "sap.ui.comp.smartvariants.SmartVariantManagement";
	}

	function createCommandAndFireEvent(oOverlay, aCommandNames, mProperties, oElement) {
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		var oTargetElement = oElement || oOverlay.getElement();
		return Promise.resolve()
		.then(function() {
			if (aCommandNames.length === 1) {
				return this.getCommandFactory().getCommandFor(oTargetElement, aCommandNames[0], mProperties, oDesignTimeMetadata);
			}
			var oCompositeCommand;
			return this.getCommandFactory().getCommandFor(oTargetElement, "composite")
			.then(function(_oCompositeCommand) {
				oCompositeCommand = _oCompositeCommand;
				var aCommandPromises = [];
				aCommandNames.forEach(function(sCommandName) {
					aCommandPromises.push(this.getCommandFactory().getCommandFor(
						oTargetElement,
						sCommandName,
						mProperties[sCommandName],
						oDesignTimeMetadata
					));
				}.bind(this));
				return Promise.all(aCommandPromises)
				.then(function(aCommands) {
					aCommands.forEach(oCompositeCommand.addCommand.bind(oCompositeCommand));
					return oCompositeCommand;
				});
			}.bind(this));
		}.bind(this))
		.then(function(oCommand) {
			this.fireElementModified({
				command: oCommand
			});
		}.bind(this))

		.catch(function(oMessage) {
			throw DtUtil.createError(aCommandNames[0], oMessage, "sap.ui.rta.plugin.CompVariant");
		});
	}

	function getAllVariants(oOverlay) {
		return oOverlay.getElement().getAllVariants();
	}

	CompVariant.prototype.init = function(...aArgs) {
		Plugin.prototype.init.apply(this, aArgs);
		this._oDialog = new RenameDialog();
	};

	// ------ rename ------
	async function renameVariant(aOverlays) {
		const [oOverlay] = aOverlays;
		const sVariantId = oOverlay.getElement().getPresentVariantId();
		const vDomRef = oOverlay.getDesignTimeMetadata().getData().variantRenameDomRef;
		const sNewText = await this._oDialog.openDialogAndHandleRename({
			overlay: oOverlay,
			domRef: vDomRef,
			action: this.getAction(oOverlay)
		});
		if (!sNewText) {
			return;
		}
		const mPropertyBag = {
			newVariantProperties: {
				[sVariantId]: {
					name: sNewText
				}
			}
		};
		createCommandAndFireEvent.call(this, oOverlay, ["compVariantUpdate"], mPropertyBag);
	}

	/**
	 * Checks if variant rename is available for the overlay.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay object
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	CompVariant.prototype.isRenameAvailable = function(oElementOverlay) {
		const oVariantManagementControl = oElementOverlay.getElement();
		if (isCompVariant(oVariantManagementControl)) {
			const aVariants = getAllVariants(oElementOverlay);
			const oCurrentVariant = aVariants.find(function(oVariant) {
				return oVariant.getVariantId() === oVariantManagementControl.getPresentVariantId();
			});
			const sLayer = this.getCommandFactory().getFlexSettings().layer;
			return oCurrentVariant.isRenameEnabled(sLayer);
		}
		return false;
	};

	/**
	 * Checks if variant rename is enabled for the overlays.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	CompVariant.prototype.isRenameEnabled = function(aElementOverlays) {
		return this.isRenameAvailable(aElementOverlays[0]);
	};

	// ------ configure ------
	function configureVariants(aOverlays) {
		var oVariantManagementControl = aOverlays[0].getElement();
		var mComponentPropertyBag = this.getCommandFactory().getFlexSettings();
		mComponentPropertyBag.variantManagementControl = oVariantManagementControl;
		const sSelectedVariantId = oVariantManagementControl.getCurrentVariantId();
		var mPropertyBag = {
			layer: this.getCommandFactory().getFlexSettings().layer,
			contextSharingComponentContainer: ContextSharingAPI.createComponent(mComponentPropertyBag),
			rtaStyleClass: Utils.getRtaStyleClassName()
		};
		oVariantManagementControl.openManageViewsDialogForKeyUser(mPropertyBag, function(oData) {
			if (!isEmptyObject(oData)) {
				createCommandAndFireEvent.call(this, aOverlays[0], ["compVariantUpdate"], {
					newVariantProperties: _omit(oData, ["default"]),
					newDefaultVariantId: oData.default,
					oldDefaultVariantId: oVariantManagementControl.getDefaultVariantId(),
					oldSelectedVariantId: sSelectedVariantId
				});
			}
		}.bind(this));
	}

	// ------ switch ------
	function onDirtySwitchWarningClose(oVariantManagementOverlay, sTargetVariantId, sAction) {
		if (sAction === MessageBox.Action.CANCEL) {
			return;
		}

		var oLibraryBundle = Lib.getResourceBundleFor("sap.ui.rta");
		var oVariantManagementControl = oVariantManagementOverlay.getElement();
		var mProperties;

		if (sAction === oLibraryBundle.getText("BTN_MODIFIED_VARIANT_SAVE")) {
			// Create composite command for compVariantUpdate + compVariantSwitch
			getCompVariantUpdateProperties(oVariantManagementControl)
			.then(function(oCompVariantUpdateProperties) {
				mProperties = {
					compVariantSwitch: {
						targetVariantId: sTargetVariantId,
						sourceVariantId: oVariantManagementControl.getPresentVariantId()
					},
					compVariantUpdate: oCompVariantUpdateProperties
				};
				createCommandAndFireEvent.call(this, oVariantManagementOverlay, ["compVariantUpdate", "compVariantSwitch"], mProperties);
			}.bind(this));
		}
		if (sAction === oLibraryBundle.getText("BTN_MODIFIED_VARIANT_DISCARD")) {
			createCommandAndFireEvent.call(this, oVariantManagementOverlay, ["compVariantSwitch"], {
				targetVariantId: sTargetVariantId,
				sourceVariantId: oVariantManagementControl.getPresentVariantId(),
				discardVariantContent: true
			});
		}
	}

	function isSwitchEnabled(aOverlays) {
		return getAllVariants(aOverlays[0]).length > 1;
	}

	function switchVariant(aOverlays, mPropertyBag) {
		var oVariantManagementOverlay = aOverlays[0];
		var oVariantManagementControl = oVariantManagementOverlay.getElement();

		// If the variant was modified, user must choose whether to save changes before switching
		if (oVariantManagementControl.getModified()) {
			var oLibraryBundle = Lib.getResourceBundleFor("sap.ui.rta");
			var sTargetVariantId = mPropertyBag.eventItem.getParameters().item.getProperty("key");
			MessageBox.warning(oLibraryBundle.getText("MSG_CHANGE_MODIFIED_VARIANT"), {
				onClose: onDirtySwitchWarningClose.bind(this, oVariantManagementOverlay, sTargetVariantId),
				actions: [
					oLibraryBundle.getText("BTN_MODIFIED_VARIANT_SAVE"),
					oLibraryBundle.getText("BTN_MODIFIED_VARIANT_DISCARD"),
					MessageBox.Action.CANCEL
				],
				emphasizedAction: oLibraryBundle.getText("BTN_MODIFIED_VARIANT_SAVE"),
				styleClass: Utils.getRtaStyleClassName(),
				id: "compVariantWarningDialog"
			});
		} else {
			createCommandAndFireEvent.call(this, oVariantManagementOverlay, ["compVariantSwitch"], {
				targetVariantId: mPropertyBag.eventItem.getParameters().item.getProperty("key"),
				sourceVariantId: oVariantManagementControl.getPresentVariantId()
			});
		}
	}

	// ------ save ------
	function getCompVariantUpdateProperties(oVariantManagementControl) {
		return oVariantManagementControl.getPresentVariantContent().then(function(oContent) {
			var oPropertyBag = {
				onlySave: true,
				newVariantProperties: {}
			};
			oPropertyBag.newVariantProperties[oVariantManagementControl.getPresentVariantId()] = {
				content: oContent
			};
			return oPropertyBag;
		});
	}

	function saveVariant(aOverlays) {
		var oVariantManagementControl = aOverlays[0].getElement();
		getCompVariantUpdateProperties(oVariantManagementControl)
		.then(function(oPropertyBag) {
			createCommandAndFireEvent.call(this, aOverlays[0], ["compVariantUpdate"], oPropertyBag);
		}.bind(this));
	}

	function isSaveEnabled(aOverlays) {
		return aOverlays[0].getElement().currentVariantGetModified();
	}

	// ------ save as ------
	function saveAsNewVariant(aOverlays, bImplicitSaveAs) {
		var oVariantManagementControl = aOverlays[0].getElement();
		var mComponentPropertyBag = this.getCommandFactory().getFlexSettings();
		mComponentPropertyBag.variantManagementControl = oVariantManagementControl;
		var oContextSharingComponentContainer = ContextSharingAPI.createComponent(mComponentPropertyBag);
		return new Promise(function(resolve) {
			oVariantManagementControl.openSaveAsDialogForKeyUser(Utils.getRtaStyleClassName(), function(oReturn) {
				if (oReturn) {
					createCommandAndFireEvent.call(this, aOverlays[0], ["compVariantSaveAs"], {
						newVariantProperties: {
							"default": oReturn.default,
							executeOnSelection: oReturn.executeOnSelection,
							content: oReturn.content,
							type: oReturn.type,
							text: oReturn.text,
							contexts: oReturn.contexts
						},
						previousDirtyFlag: oVariantManagementControl.getModified(),
						previousVariantId: oVariantManagementControl.getPresentVariantId(),
						previousDefault: oVariantManagementControl.getDefaultVariantId(),
						activateAfterUndo: !!bImplicitSaveAs
					});
				}
				resolve(oReturn);
			}.bind(this), oContextSharingComponentContainer);
		}.bind(this));
	}

	// ------ change content ------
	function onWarningClose(oVariantManagementControl, sVariantId, sAction) {
		var oLibraryBundle = Lib.getResourceBundleFor("sap.ui.rta");
		if (sAction === oLibraryBundle.getText("BTN_CREATE_NEW_VIEW")) {
			saveAsNewVariant.call(this, [OverlayRegistry.getOverlay(oVariantManagementControl)], true)
			.then(function(oReturn) {
				// in case the user cancels the save as the original variant is applied again and the changes are gone
				if (!oReturn) {
					oVariantManagementControl.activateVariant(sVariantId);
				}
			});
		} else {
			oVariantManagementControl.activateVariant(sVariantId);
		}
	}

	function changeContent(oAction, aOverlays) {
		var oLibraryBundle = Lib.getResourceBundleFor("sap.ui.rta");
		var oElementOverlay = aOverlays[0];
		var oControl = oElementOverlay.getElement();
		oAction = oAction.action || oAction;
		var oVariantManagementControl = oControl.getVariantManagement();
		// the modified flag might be changed before the dialog is closed, so it has to be saved here already
		var bIsModified = oVariantManagementControl.getModified();

		return oAction.handler(oControl, {styleClass: Utils.getRtaStyleClassName()}).then(function(aChangeContentData) {
			if (aChangeContentData && aChangeContentData.length) {
				var sPersistencyKey = aChangeContentData[0].changeSpecificData.content.persistencyKey;
				var aVariants = oVariantManagementControl.getAllVariants();
				var oCurrentVariant = aVariants.find(function(oVariant) {
					return oVariant.getVariantId() === oVariantManagementControl.getPresentVariantId();
				});

				// a variant that can't be overwritten must never get dirty,
				// instead the user needs to save the changes to a new variant
				if (oCurrentVariant.isEditEnabled(this.getCommandFactory().getFlexSettings().layer)) {
					createCommandAndFireEvent.call(this, oElementOverlay, ["compVariantContent"], {
						variantId: aChangeContentData[0].changeSpecificData.content.key,
						newContent: aChangeContentData[0].changeSpecificData.content.content,
						persistencyKey: sPersistencyKey,
						isModifiedBefore: bIsModified
					}, oVariantManagementControl);
				} else {
					MessageBox.warning(oLibraryBundle.getText("MSG_CHANGE_READONLY_VARIANT"), {
						onClose: onWarningClose.bind(this, oVariantManagementControl, oCurrentVariant.getVariantId()),
						actions: [oLibraryBundle.getText("BTN_CREATE_NEW_VIEW"), MessageBox.Action.CANCEL],
						emphasizedAction: oLibraryBundle.getText("BTN_CREATE_NEW_VIEW"),
						styleClass: Utils.getRtaStyleClassName()
					});
				}
			}
		}.bind(this));
	}

	CompVariant.prototype._isEditable = function(oOverlay) {
		return this.hasStableId(oOverlay) && !!this.getAction(oOverlay);
	};

	CompVariant.prototype.getMenuItems = function(aElementOverlays) {
		var oElementOverlay = aElementOverlays[0];
		var oVariantManagementControl = oElementOverlay.getElement();
		const oAction = this.getAction(oElementOverlay);
		var aMenuItems = [];
		if (this.isAvailable([oElementOverlay])) {
			if (oAction) {
				if (oAction.changeType === "variantContent") {
					aMenuItems.push({
						id: "CTX_COMP_VARIANT_CONTENT",
						additionalInfo: this._getAdditionalInfo(oElementOverlay, oAction),
						text: this.getActionText(oElementOverlay, oAction),
						handler: changeContent.bind(this, oAction),
						enabled: true,
						rank: this.getRank("CTX_COMP_VARIANT_CONTENT"),
						icon: "sap-icon://key-user-settings"
					});
				} else {
					var sLayer = this.getCommandFactory().getFlexSettings().layer;
					var oLibraryBundle = Lib.getResourceBundleFor("sap.ui.rta");
					var aVariants = getAllVariants(oElementOverlay);
					var oCurrentVariant = aVariants.find(function(oVariant) {
						return oVariant.getVariantId() === oVariantManagementControl.getPresentVariantId();
					});

					if (oCurrentVariant.isRenameEnabled(sLayer)) {
						aMenuItems.push({
							id: "CTX_COMP_VARIANT_RENAME",
							text: oLibraryBundle.getText("CTX_RENAME"),
							handler: renameVariant.bind(this),
							enabled: true,
							rank: this.getRank("CTX_COMP_VARIANT_RENAME"),
							icon: "sap-icon://edit"
						});
					}

					if (oCurrentVariant.isEditEnabled(sLayer)) {
						aMenuItems.push({
							id: "CTX_COMP_VARIANT_SAVE",
							text: oLibraryBundle.getText("CTX_VARIANT_SAVE"),
							handler: saveVariant.bind(this),
							enabled: isSaveEnabled,
							rank: this.getRank("CTX_COMP_VARIANT_SAVE"),
							icon: "sap-icon://save"
						});
					}

					aMenuItems.push({
						id: "CTX_COMP_VARIANT_SAVE_AS",
						text: oLibraryBundle.getText("CTX_VARIANT_SAVEAS"),
						handler: saveAsNewVariant.bind(this),
						enabled: true,
						rank: this.getRank("CTX_COMP_VARIANT_SAVE_AS"),
						icon: "sap-icon://duplicate"
					});

					aMenuItems.push({
						id: "CTX_COMP_VARIANT_MANAGE",
						text: oLibraryBundle.getText("CTX_VARIANT_MANAGE"),
						handler: configureVariants.bind(this),
						enabled: true,
						rank: this.getRank("CTX_COMP_VARIANT_MANAGE"),
						icon: "sap-icon://action-settings"
					});

					var aSubmenuItems = aVariants.map(function(oVariant) {
						var bCurrentItem = oVariantManagementControl.getPresentVariantId() === oVariant.getVariantId();
						var oItem = {
							id: oVariant.getVariantId(),
							text: oVariant.getText("variantName"),
							icon: bCurrentItem ? "sap-icon://accept" : "blank",
							enabled: !bCurrentItem
						};
						return oItem;
					});

					aMenuItems.push({
						id: "CTX_COMP_VARIANT_SWITCH",
						text: oLibraryBundle.getText("CTX_VARIANT_SWITCH"),
						handler: switchVariant.bind(this),
						enabled: isSwitchEnabled,
						submenu: aSubmenuItems,
						rank: this.getRank("CTX_COMP_VARIANT_SWITCH"),
						icon: "sap-icon://switch-views"
					});
				}
			}
		}

		return aMenuItems;
	};

	CompVariant.prototype.getActionName = function() {
		return "compVariant";
	};

	CompVariant.prototype.destroy = function(...args) {
		Plugin.prototype.destroy.apply(this, args);
		this._oDialog.destroy();
		delete this._oDialog;
	};

	return CompVariant;
});