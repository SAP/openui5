sap.ui.define(['sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/util/PopupUtils', './generated/i18n/i18n-defaults', './generated/templates/ResponsivePopoverTemplate.lit', './Popover', './Dialog', './Button', './Title', 'sap/ui/webc/common/thirdparty/icons/decline', './generated/themes/ResponsivePopover.css'], function (Device, i18nBundle, PopupUtils, i18nDefaults, ResponsivePopoverTemplate_lit, Popover, Dialog, Button, Title, decline, ResponsivePopover_css) { 'use strict';

	const POPOVER_MIN_WIDTH = 100;
	const metadata = {
		tag: "ui5-responsive-popover",
		properties:  {
			noStretch: {
				type: Boolean,
			},
			withPadding: {
				type: Boolean,
			},
			contentOnlyOnDesktop: {
				type: Boolean,
			},
			_hideHeader: {
				type: Boolean,
			},
			_hideCloseButton: {
				type: Boolean,
			},
		},
	};
	class ResponsivePopover extends Popover {
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return [Popover.styles, ResponsivePopover_css];
		}
		get classes() {
			const allClasses = super.classes;
			allClasses.header = {
				"ui5-responsive-popover-header": true,
				"ui5-responsive-popover-header-no-title": !this.headerText,
			};
			return allClasses;
		}
		static get template() {
			return ResponsivePopoverTemplate_lit;
		}
		static get dependencies() {
			return [
				Button,
				Dialog,
				Title,
			];
		}
		async showAt(opener, preventInitialFocus = false) {
			this.style.display = this._isPhone ? "contents" : "";
			if (this.isOpen() || (this._dialog && this._dialog.isOpen())) {
				return;
			}
			if (!Device.isPhone()) {
				if (!this.noStretch) {
					this._minWidth = Math.max(POPOVER_MIN_WIDTH, opener.getBoundingClientRect().width);
				}
				await super.showAt(opener, preventInitialFocus);
			} else {
				this.style.zIndex = PopupUtils.getNextZIndex();
				await this._dialog.show();
			}
		}
		close(escPressed = false, preventRegistryUpdate = false, preventFocusRestore = false) {
			if (!Device.isPhone()) {
				super.close(escPressed, preventRegistryUpdate, preventFocusRestore);
			} else {
				this._dialog.close();
			}
		}
		toggle(opener) {
			if (this.isOpen()) {
				return this.close();
			}
			this.showAt(opener);
		}
		isOpen() {
			return Device.isPhone() ? this._dialog.isOpen() : super.isOpen();
		}
		get styles() {
			const popoverStyles = super.styles;
			popoverStyles.root = {
				"min-width": `${this._minWidth}px`,
			};
			return popoverStyles;
		}
		get _dialog() {
			return this.shadowRoot.querySelector("[ui5-dialog]");
		}
		get _isPhone() {
			return Device.isPhone();
		}
		get _displayHeader() {
			return (this._isPhone || !this.contentOnlyOnDesktop) && super._displayHeader;
		}
		get _displayFooter() {
			return this._isPhone || !this.contentOnlyOnDesktop;
		}
		get _closeDialogAriaLabel() {
			return this.i18nBundle.getText(i18nDefaults.RESPONSIVE_POPOVER_CLOSE_DIALOG_BUTTON);
		}
		_afterDialogOpen(event) {
			this.opened = true;
			this._propagateDialogEvent(event);
		}
		_afterDialogClose(event) {
			this.opened = false;
			this._propagateDialogEvent(event);
		}
		_propagateDialogEvent(event) {
			const type = event.type.replace("ui5-", "");
			this.fireEvent(type, event.detail);
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
	}
	ResponsivePopover.define();

	return ResponsivePopover;

});
