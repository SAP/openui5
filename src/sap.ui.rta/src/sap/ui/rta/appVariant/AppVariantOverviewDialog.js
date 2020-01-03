/*!
 * ${copyright}
 */

// Provides control sap.ui.rta.appVariant.AppVariantOverviewDialog.
sap.ui.define([
	"sap/ui/core/ComponentContainer",
	"sap/m/Dialog",
	"sap/m/DialogRenderer",
	"sap/ui/rta/appVariant/manageApps/webapp/Component",
	"sap/ui/rta/Utils"
], function(
	ComponentContainer,
	Dialog,
	DialogRenderer,
	ManageAppsComponent,
	RtaUtils
) {
	"use strict";

	var AppVariantOverviewDialog = Dialog.extend("sap.ui.rta.appVariant.AppVariantOverviewDialog", {
		metadata : {
			properties: {
				idRunningApp : "string",
				isOverviewForKeyUser: {
					type: "boolean"
				},
				layer: "string"
			},
			events : {
				cancel : {}
			}
		},
		constructor: function() {
			Dialog.prototype.constructor.apply(this, arguments);
			this._oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

			// Create manage apps component
			this.oManageAppsComponent = new ManageAppsComponent("sap.ui.rta.appVariant.manageApps", {
				idRunningApp : this.getIdRunningApp(),
				isOverviewForKeyUser: this.getIsOverviewForKeyUser(),
				layer: this.getLayer()
			});

			// Place component in container and display
			this.oManageAppsComponentContainer = new ComponentContainer({
				component : this.oManageAppsComponent
			});

			this.addContent(this.oManageAppsComponentContainer);
			this._createButton();

			this.setContentWidth("1000px");
			this.setContentHeight("450px");

			this.setHorizontalScrolling(false);
			this.setTitle(this._oTextResources.getText("APP_VARIANT_OVERVIEW_DIALOG_TITLE"));

			this.addStyleClass(RtaUtils.getRtaStyleClassName());
		},
		destroy: function() {
			Dialog.prototype.destroy.apply(this, arguments);
		},
		renderer: DialogRenderer.render
	});

	AppVariantOverviewDialog.prototype._createButton = function() {
		this.addButton(new sap.m.Button({
			text: this._oTextResources.getText("APP_VARIANT_DIALOG_CLOSE"),
			press: function() {
				this.close();
				this.fireCancel();
			}.bind(this)
		}));
	};

	return AppVariantOverviewDialog;
});
