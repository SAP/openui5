/*!
 * ${copyright}
 */

// Provides the <code>sap.ui.rta.appContexts.AppContextsOverviewDialog</code> control.
sap.ui.define([
	"sap/ui/core/ComponentContainer",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/DialogRenderer",
	"sap/ui/rta/appContexts/Component",
	"sap/ui/rta/Utils"
], function (
	ComponentContainer,
	Button,
	Dialog,
	DialogRenderer,
	ManageAppContextsComponent,
	RtaUtils
) {
	"use strict";

	var AppContextsOverviewDialog = Dialog.extend("sap.ui.rta.appContexts.AppVariantOverviewDialog", {
		metadata: {
			library: "sap.ui.rta",
			events: {
				cancel: {}
			},
			properties: {
				layer: "string"
			}
		},
		constructor: function () {
			Dialog.prototype.constructor.apply(this, arguments);
			this._oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

			// Create manage apps component
			this._oManageAppContextsComponent = new ManageAppContextsComponent("sap.ui.rta.appContexts", { layer: this.getLayer() });

			// Place component in container and display
			this._oManageAppsComponentContainer = new ComponentContainer({
				component: this._oManageAppContextsComponent
			});

			this.addContent(this._oManageAppsComponentContainer);
			this._createButton();

			this.setContentWidth("650px");
			this.setContentHeight("450px");

			this.setHorizontalScrolling(false);
			this.setTitle(this._oTextResources.getText("APP_CONTEXTS_OVERVIEW_DIALOG_TITLE"));

			this.addStyleClass(RtaUtils.getRtaStyleClassName());
		},
		destroy: function () {
			Dialog.prototype.destroy.apply(this, arguments);
		},
		renderer: DialogRenderer
	});

	AppContextsOverviewDialog.prototype._createButton = function () {
		this.addButton(new Button({
			text: this._oTextResources.getText("APP_VARIANT_DIALOG_CLOSE"),
			press: function () {
				this.close();
				this.fireCancel();
			}.bind(this)
		}));
	};


	return AppContextsOverviewDialog;
});
