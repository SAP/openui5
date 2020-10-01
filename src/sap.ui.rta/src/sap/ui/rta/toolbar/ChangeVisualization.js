/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/toolbar/ChangeIndicator",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/core/Component",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/m/library",
	"sap/ui/fl/Layer",
	"sap/base/util/each",
	"sap/base/util/includes"
], function(
	Fragment,
	jQuery,
	PersistenceWriteAPI,
	FlUtils,
	JSONModel,
	ChangeIndicator,
	OverlayRegistry,
	Component,
	JsControlTreeModifier,
	ChangesUtils,
	mobileLibrary,
	Layer,
	each,
	includes
) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	var ChangeVisualization = {
		changes: [],
		changeIndicators: [],
		rootControlId: ""
	};

	ChangeVisualization.updateCommandModel = function() {
		ChangeVisualization.aValidCommands = {
			all: [
				"createContainer",
				"addDelegateProperty",
				"reveal",
				"addIFrame",
				"move",
				"rename",
				"combine",
				"split",
				"remove"
			],
			add: [
				"createContainer",
				"addDelegateProperty",
				"reveal",
				"addIFrame"
			],
			move: [
				"move"
			],
			rename: [
				"rename"
			],
			combinesplit: [
				"combine",
				"split"
			],
			remove: [
				"remove"
			]

		};

		var oCommandModelData = {
			commands: []
		};
		var oOriginalRTATexts = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

		each(ChangeVisualization.aValidCommands, function(sKey, aValue) {
			oCommandModelData.commands.push({
				commands: aValue,
				text: oOriginalRTATexts.getText("TXT_CHANGEVISUALIZATION_OVERVIEW_" + sKey.toUpperCase()),
				count: 0,
				type: "Inactive"
			});
		});

		ChangeVisualization.changes.forEach(function(oChange) {
			var sCommand = oChange.getDefinition().support.command;
			if (sCommand !== "") {
				each(ChangeVisualization.aValidCommands, function(sKey, aValue) {
					var iIndex = aValue.indexOf(sCommand);
					if (iIndex > -1) {
						var i = Object.keys(ChangeVisualization.aValidCommands).indexOf(sKey);
						oCommandModelData.commands[i].count++;
						oCommandModelData.commands[i].type = "Active";
					}
				});
			}
		});
		var oModel = new JSONModel(oCommandModelData);
		ChangeVisualization.changesPopover.setModel(oModel, "commandModel");
	};

	ChangeVisualization.removeChangeIndicators = function() {
		if (ChangeVisualization.button && ChangeVisualization.changeIndicators) {
			ChangeVisualization.changeIndicators.forEach(function(oChangeIndicator) {
				oChangeIndicator.changeIndicator.remove();
				oChangeIndicator.changeIndicator.destroy();
			});
			ChangeVisualization.switchChangeVisualizationActive();
		}
		ChangeVisualization.changeIndicators = [];
	};

	ChangeVisualization.hideChangeIndicators = function() {
		if (ChangeVisualization.changeIndicators) {
			ChangeVisualization.changeIndicators.forEach(function(oChangeIndicator) {
				oChangeIndicator.changeIndicator.hide();
			});
		}
	};

	ChangeVisualization.revealChangeIndicators = function() {
		if (ChangeVisualization.changeIndicators) {
			ChangeVisualization.changeIndicators.forEach(function(oChangeIndicator) {
				oChangeIndicator.changeIndicator.reveal();
			});
		}
	};

	ChangeVisualization.changeIndicatorsExist = function() {
		return ChangeVisualization.changeIndicators.length > 0;
	};

	ChangeVisualization.switchChangeVisualizationActive = function() {
		var oOriginalRTATexts = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		if (ChangeVisualization.changeIndicators.length > 0) {
			ChangeVisualization.button.setType(ButtonType.Emphasized);
			ChangeVisualization.button.setTooltip(oOriginalRTATexts.getText("BUT_CHANGEVISUALIZATION_HIDECHANGES"));
			jQuery("body").on("keydown", function(oEvent) {
				if (oEvent.key === "Escape") {
					ChangeVisualization.removeChangeIndicators();
				}
			});
		} else {
			ChangeVisualization.button.setType(ButtonType.Transparent);
			ChangeVisualization.button.setTooltip(oOriginalRTATexts.getText("BUT_CHANGEVISUALIZATION_SHOWCHANGES"));
			jQuery("body").off("keydown");
		}
	};

	ChangeVisualization.showSpecificChanges = function(oEvent) {
		ChangeVisualization.changesPopover.close();

		var oBindingContext = oEvent.getSource().getBindingContext("commandModel");
		var aCommands = oBindingContext.getModel().getProperty(oBindingContext.getPath()).commands;

		ChangeVisualization.changes.forEach(function(oChange) {
			var sChangeCommand = oChange.getDefinition().support.command;
			if (includes(aCommands, sChangeCommand)) {
				ChangeVisualization.getChangedElements(oChange, false).then(function(aControls) {
					aControls.forEach(function(oControl) {
						var oChangeIndicator = ChangeVisualization.createChangeIndicator(oChange, oControl, "change");
						if (oChangeIndicator !== null) {
							ChangeVisualization.changeIndicators.push({
								elementId: oChangeIndicator.getParentId(),
								changeIndicator: oChangeIndicator
							});
							oChangeIndicator.placeAt(sap.ui.getCore().getStaticAreaRef());
						}
					});
					ChangeVisualization.switchChangeVisualizationActive();
				});
			}
		});
	};

	ChangeVisualization.createChangeIndicator = function(oChange, oChangedElement, sChangeIndicatorMode) {
		var oOverlay = OverlayRegistry.getOverlay(oChangedElement);
		var sCommand = oChange.getDefinition().support.command;
		while (!oOverlay || !oOverlay.isVisible()) {
			if (sCommand === "remove") {
				oChangedElement = oChangedElement.getParent();
				oOverlay = OverlayRegistry.getOverlay(oChangedElement.sId);
			} else {
				return null;
			}
		}
		var sOverlay = oOverlay.toString();
		var sOverlayId = "__" + sOverlay.split("__")[1];

		for (var i = 0; i < ChangeVisualization.changeIndicators.length; i++) {
			if (ChangeVisualization.changeIndicators[i].elementId === sOverlayId && sChangeIndicatorMode === "change") {
				ChangeVisualization.changeIndicators[i].changeIndicator.addChange(oChange);
				return null;
			}
		}

		var oChangeIndicator = new ChangeIndicator({
			mode: sChangeIndicatorMode,
			parentId: sOverlayId,
			changes: []
		});
		oChangeIndicator.addChange(oChange);
		oChangeIndicator.setModel(ChangeVisualization.button.getModel("i18n"), "i18n");
		oChangeIndicator.hideChangeIndicators = ChangeVisualization.hideChangeIndicators.bind(ChangeVisualization);
		oChangeIndicator.revealChangeIndicators = ChangeVisualization.revealChangeIndicators.bind(ChangeVisualization);
		oChangeIndicator.createChangeIndicator = ChangeVisualization.createChangeIndicator.bind(ChangeVisualization);
		oChangeIndicator.getChangedElements = ChangeVisualization.getChangedElements.bind(ChangeVisualization);
		return oChangeIndicator;
	};

	ChangeVisualization.getChangedElements = function(oChange, bDependent) {
		var oComponent = Component.get(ChangeVisualization.rootControlId);
		return ChangeVisualization.getInfoFromChangeHandler(oComponent, oChange).then(function(oInfoFromChangeHandler) {
			var aSelector = [oChange.getSelector()];
			if (oInfoFromChangeHandler) {
				if (bDependent) {
					aSelector = oInfoFromChangeHandler.dependentControls;
				} else {
					aSelector = oInfoFromChangeHandler.affectedControls;
				}
			}
			var aPromises = [];
			aSelector.forEach(function(oSelector) {
				aPromises.push(JsControlTreeModifier.bySelector(oSelector, oComponent));
			});
			return Promise.all(aPromises);
		});
	};

	ChangeVisualization.getChanges = function() {
		var oComponent = Component.get(ChangeVisualization.rootControlId);
		var mPropertyBag = {
			oComponent : oComponent,
			selector: oComponent,
			invalidateCache: false,
			includeVariants: true,
			//includeCtrlVariants: true,
			currentLayer: Layer.CUSTOMER
		};
		return PersistenceWriteAPI._getUIChanges(mPropertyBag);
	};

	ChangeVisualization.openChangePopover = function(oButton, sRootControlId) {
		ChangeVisualization.button = oButton;
		ChangeVisualization.rootControlId = sRootControlId;
		return ChangeVisualization.getChanges().then(function(aChanges) {
			ChangeVisualization.changes = aChanges;

			if (!ChangeVisualization.changesPopover) {
				return Fragment.load({
					name: "sap.ui.rta.toolbar.Changes",
					id: "fragment_changeVisualization",
					controller: ChangeVisualization
				}).then(function(oPopover) {
					ChangeVisualization.changesPopover = oPopover;
					ChangeVisualization.updateCommandModel();
					ChangeVisualization.changesPopover.openBy(oButton);
					return oPopover;
				});
			}
			if (ChangeVisualization.changesPopover.isOpen()) {
				ChangeVisualization.changesPopover.close();
			} else {
				ChangeVisualization.updateCommandModel();
				ChangeVisualization.changesPopover.openBy(oButton);
			}
		});
	};

	ChangeVisualization.getInfoFromChangeHandler = function(oAppComponent, oChange) {
		var oControl = JsControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
		if (oControl) {
			var mPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent,
				view: FlUtils.getViewForControl(oControl)
			};
			var mControl = ChangesUtils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag);
			return ChangesUtils.getChangeHandler(oChange, mControl, mPropertyBag)
			.then(function(oChangeHandler) {
				if (oChangeHandler && typeof oChangeHandler.getChangeVisualizationInfo === "function") {
					return oChangeHandler.getChangeVisualizationInfo(oChange, oAppComponent);
				}
			});
		}

		return Promise.resolve();
	};

	return ChangeVisualization;
});
