/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/ToolbarSpacer',
	'sap/m/Button',
	'sap/m/SegmentedButton',
	'sap/m/SegmentedButtonItem',
	'sap/m/MenuButton',
	'sap/m/MenuItem',
	'sap/m/Menu',
	'./Base'
],
function(
	ToolbarSpacer,
	Button,
	SegmentedButton,
	SegmentedButtonItem,
	MenuButton,
	MenuItem,
	Menu,
	Base
) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.toolbar.Adaptation control
	 *
	 * @class
	 * Contains implementation of Adaptation toolbar
	 * @extends sap.ui.rta.toolbar.Base
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.48
	 * @alias sap.ui.rta.toolbar.Adaptation
	 * @experimental Since 1.48. This class is experimental. API might be changed in future.
	 */
	var Adaptation = Base.extend("sap.ui.rta.toolbar.Adaptation", {
		renderer: 'sap.ui.rta.toolbar.BaseRenderer',
		animation: true,
		metadata: {
			events: {
				/**
				 * Events are fired when the Toolbar Buttons are pressed
				 */
				"undo": {},
				"redo": {},
				"exit": {},
				"restore": {},
				"transport": {},
				"modeChange": {},
				"manageApps": {},
				"appVariantOverview": {},
				"saveAs": {}
			},
			properties: {
				/** Determines whether publish button is visible */
				"publishVisible": {
					"type": "boolean",
					"defaultValue": false
				},

				/** Defines value of the switcher SegmentedButton */
				"modeSwitcher": {
					type: "string",
					defaultValue: "adaptation"
				}
			}
		}
	});

	Adaptation.prototype.onAfterRendering = function () {
		var iSign = -1;
		var bIgnore = false;
		var iWidth = this.getAggregation('content').reduce(function (iResult, oControl) {
			switch (oControl.data('name')) {
				case 'spacerLeft':
					iSign = 1;
					bIgnore = true;
					break;
				case 'spacerRight':
					bIgnore = false;
					break;
			}
			return !(oControl instanceof ToolbarSpacer) && !bIgnore
				? iResult + iSign * oControl.$().outerWidth(true)
				: iResult;
		}, 0);

		if (iWidth > 0) {
			this.getControl('spacerBalancer').setWidth(iWidth + 'px');
		}

		Base.prototype.onAfterRendering.apply(this, arguments);
	};

	Adaptation.prototype.buildControls = function () {
		return [
			new ToolbarSpacer().data('name', 'spacerBalancer'),
			new ToolbarSpacer().data('name', 'spacerLeft'),
			new SegmentedButton({
				width: "auto",
				selectedKey: this.getModeSwitcher(),
				items: [
					new SegmentedButtonItem({
						text: this.getTextResources().getText("BTN_ADAPTATION"),
						tooltip: this.getTextResources().getText("BTN_ADAPTATION"),
						width: "auto",
						key: "adaptation"
					}),
					new SegmentedButtonItem({
						text: this.getTextResources().getText("BTN_NAVIGATION"),
						tooltip: this.getTextResources().getText("BTN_NAVIGATION"),
						width: "auto",
						key: "navigation"
					})
				],
				select: this.eventHandler.bind(this, 'ModeChange')
			}).data('name', 'modeSwitcher'),
			new ToolbarSpacer().data('name', 'spacerRight'),
			new Button({
				type: "Transparent",
				icon: "sap-icon://undo",
				enabled: false,
				tooltip: this.getTextResources().getText("BTN_UNDO"),
				press: this.eventHandler.bind(this, 'Undo')
			}).data('name', 'undo'),
			new Button({
				type:"Transparent",
				icon: "sap-icon://redo",
				iconFirst: false,
				enabled: false,
				tooltip: this.getTextResources().getText("BTN_REDO"),
				press: this.eventHandler.bind(this, 'Redo')
			}).data('name', 'redo'),
			new Button({
				type:"Transparent",
				icon: "sap-icon://message-information",
				enabled: false,
				visible: false,
				tooltip: this.getTextResources().getText("BTN_MANAGE_APPS"),
				press: this.eventHandler.bind(this, 'ManageApps')
			}).data('name', 'manageApps'),
			new MenuButton({
				type:"Transparent",
				icon: "sap-icon://message-information",
				enabled: false,
				visible: false,
				tooltip: this.getTextResources().getText("BTN_MANAGE_APPS"),
				menu: new Menu({
					itemSelected: this.eventHandler.bind(this, 'AppVariantOverview'),
					items: [
						new MenuItem('keyUser', {
							text: this.getTextResources().getText("MENU_ITEM_KEY_USER")
						}),
						new MenuItem('developer', {
							text: this.getTextResources().getText("MENU_ITEM_SAP_DEVELOPER")
						})
					]
				})
			}).data('name', 'appVariantOverview'),
			new Button({
				type: "Transparent",
				text: this.getTextResources().getText("BTN_RESTORE"),
				visible: true,
				enabled: false,
				tooltip: this.getTextResources().getText("BTN_RESTORE"),
				press: this.eventHandler.bind(this, 'Restore')
			}).data('name', 'restore'),
			new Button({
				type: "Transparent",
				enabled: false,
				visible: this.getPublishVisible(),
				text: this.getTextResources().getText("BTN_PUBLISH"),
				tooltip: this.getTextResources().getText("BTN_PUBLISH"),
				press: this.eventHandler.bind(this, 'Transport') // Fixme: rename event
			}).data('name', 'publish'),
			new Button({
				type: "Transparent",
				text: this.getTextResources().getText("BTN_SAVE_AS"),
				enabled: false,
				visible: false,
				tooltip: this.getTextResources().getText("TOOLTIP_SAVE_AS"),
				press: this.eventHandler.bind(this, 'SaveAs')
			}).data('name', 'saveAs'),
			new Button({
				type:"Transparent",
				text: this.getTextResources().getText("BTN_EXIT"),
				tooltip: this.getTextResources().getText("BTN_EXIT"),
				press: this.eventHandler.bind(this, 'Exit')
			}).data('name', 'exit')
		];
	};

	Adaptation.prototype.setUndoRedoEnabled = function (bCanUndo, bCanRedo) {
		this.getControl('undo').setEnabled(bCanUndo);
		this.getControl('redo').setEnabled(bCanRedo);
	};

	Adaptation.prototype.setPublishEnabled = function (bEnabled) {
		this.getControl('publish').setEnabled(bEnabled);
	};

	Adaptation.prototype.setRestoreEnabled = function (bEnabled) {
		this.getControl('restore').setEnabled(bEnabled);
	};

	/* Methods propagation */
	Adaptation.prototype.show = function () { return Base.prototype.show.apply(this, arguments); };
	Adaptation.prototype.hide = function () { return Base.prototype.hide.apply(this, arguments); };

	return Adaptation;

}, true);
