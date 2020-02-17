/*!
 * ${copyright}
 */

sap.ui.define([
	"./Base",
	"sap/m/Button"
],
function(
	Base,
	Button
) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.toolbar.Personalization control
	 *
	 * @class
	 * Contains implementation of personalization specific toolbar
	 * @extends sap.ui.rta.toolbar.Base
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.48
	 * @alias sap.ui.rta.toolbar.Personalization
	 * @experimental Since 1.48. This class is experimental. API might be changed in future.
	 */
	var Personalization = Base.extend("sap.ui.rta.toolbar.Personalization", {
		renderer: 'sap.ui.rta.toolbar.BaseRenderer',
		type: 'personalization',
		metadata: {
			events: {
				/**
				 * Events are fired when the Toolbar - Buttons are pressed
				 */
				exit: {},
				restore: {}
			}
		},
		constructor: function() {
			Base.apply(this, arguments);
			this.setJustifyContent("End");
		}
	});

	Personalization.prototype.buildContent = function() {
		[
			new Button("sapUiRta_restore", {
				type: "Transparent",
				text: "{i18n>BTN_RESTORE}",
				visible: true,
				press: this.eventHandler.bind(this, 'Restore')
			}).data('name', 'restore'),
			new Button("sapUiRta_exit", {
				type:"Emphasized",
				text: "{i18n>BTN_DONE}",
				press: this.eventHandler.bind(this, 'Exit')
			}).data('name', 'exit')
		].forEach(function (oControl) {
			this.addItem(oControl);
		}.bind(this));

		return Promise.resolve();
	};

	Personalization.prototype.setUndoRedoEnabled = function() {
	};

	Personalization.prototype.setPublishEnabled = function() {
	};

	Personalization.prototype.setRestoreEnabled = function (bEnabled) {
		this.getControl('restore').setEnabled(bEnabled);
	};

	return Personalization;
}, true);
