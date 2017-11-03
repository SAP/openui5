/*!
 * ${copyright}
 */

// Provides control sap.ui.rta.appVariant.ManageAppsDialog.
sap.ui.define([
		'sap/ui/core/ComponentContainer',
		'sap/m/Dialog',
		'sap/m/DialogRenderer',
		'sap/ui/rta/appVariant/manageApps/webapp/Component',
		"sap/ui/fl/Utils",
		"sap/ui/rta/Utils"
], function(
			ComponentContainer,
			Dialog,
			DialogRenderer,
			ManageAppsComponent,
			FlexUtils,
			RtaUtils) {

	"use strict";

	var ManageAppsDialog = Dialog.extend("sap.ui.rta.appVariant.ManageAppsDialog", {
		metadata : {
			properties: {
				rootControl: {
					name: "rootControl",
					type: "object"
				}
			},
			events : {
				cancel : {}
			}
		},
		constructor: function() {
			Dialog.prototype.constructor.apply(this, arguments);
			this._oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

			var oRootControl = this.getRootControl();
			var oAdaptedAppDescriptor = FlexUtils.getAppDescriptor(oRootControl);

			// Create manage apps component
			this.oManageAppsComponent = new ManageAppsComponent("manageApps", { idRunningApp : oAdaptedAppDescriptor["sap.app"].id, rootControlRunningApp: oRootControl });

			// Place component in container and display
			this.oManageAppsComponentContainer = new ComponentContainer({
				component : this.oManageAppsComponent
			});

			this.addContent(this.oManageAppsComponentContainer);
			this._createButton();
			this.setContentWidth("1000px");
			this.setContentHeight("300px");
			this.setShowHeader(false);

			this.addStyleClass(RtaUtils.getRtaStyleClassName());
		},
		destroy: function() {
			var sNewAppVarianId = sap.ui.rta.appVariant.AppVariantUtils.getNewAppVariantId();
			if (sNewAppVarianId) {
				sap.ui.rta.appVariant.AppVariantUtils.setNewAppVariantId(null);
			}
			Dialog.prototype.destroy.apply(this, arguments);
		},
		renderer: DialogRenderer.render
	});

	ManageAppsDialog.prototype._createButton = function() {
		this.addButton(new sap.m.Button({
			text: this._oTextResources.getText("APP_VARIANT_DIALOG_CLOSE"),
			press: function() {
				this.close();
				this.fireCancel();
			}.bind(this)
		}));
	};

	return ManageAppsDialog;

}, /* bExport= */ true);
