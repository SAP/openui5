sap.ui.define(['sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/Device', './Button', './generated/templates/ToggleButtonTemplate.lit', './generated/themes/ToggleButton.css'], function (Keys, Device, Button, ToggleButtonTemplate_lit, ToggleButton_css) { 'use strict';

	const metadata = {
		tag: "ui5-toggle-button",
		altTag: "ui5-togglebutton",
		properties:  {
			pressed: {
				type: Boolean,
			},
		},
	};
	class ToggleButton extends Button {
		static get metadata() {
			return metadata;
		}
		static get template() {
			return ToggleButtonTemplate_lit;
		}
		static get styles() {
			return [Button.styles, ToggleButton_css];
		}
		_onclick() {
			this.pressed = !this.pressed;
			if (Device.isSafari()) {
				this.getDomRef().focus();
			}
		}
		_onkeyup(event) {
			if (Keys.isSpaceShift(event)) {
				event.preventDefault();
				return;
			}
			super._onkeyup(event);
		}
	}
	ToggleButton.define();

	return ToggleButton;

});
