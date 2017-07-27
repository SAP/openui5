/*!
 * ${copyright}
 */

// Provides control sap.ui.rta.appVariant.ManageAppsDialog.
sap.ui.define([
		'sap/ui/base/ManagedObject',
		'sap/ui/core/ComponentContainer',
		'sap/m/Dialog',
		'sap/ui/rta/appVariant/manageApps/webapp/Component',
		"sap/ui/fl/Utils"
], function(
			ManagedObject,
			ComponentContainer,
			Dialog,
			ManageAppsComponent,
			FlexUtils) {

	"use strict";

	var _rootControl;

	var ManageAppsDialog = ManagedObject.extend("sap.ui.rta.appVariant.ManageAppsDialog", {
		metadata : {
			properties: {
				rootControl: {
					name: "rootControl",
					type: "object"
				}
			},
			events : {
				"opened" : {},
				"close" : {}
			}
		},
		constructor: function() {
			_rootControl = arguments[0].rootControl;
			ManagedObject.prototype.constructor.apply(this, arguments);
		}
	});

	ManageAppsDialog.prototype.init = function() {
		this._oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		this._oDialog = new Dialog("manageAppsDialog");

		var oRootControl = _rootControl;
		var oAdaptedAppDescriptorData = FlexUtils.getAppDescriptor(oRootControl);
		var sIdAppAdapted = oAdaptedAppDescriptorData["sap.app"].id;

		var oAdaptedAppProperties = {
			title : oAdaptedAppDescriptorData["sap.app"].title,
			subTitle : oAdaptedAppDescriptorData["sap.app"].subTitle || '',
			description : oAdaptedAppDescriptorData["sap.app"].description || '',
			icon : oAdaptedAppDescriptorData["sap.ui"].icons.icon || '',
			componentName : oAdaptedAppDescriptorData["sap.ui5"].componentName,
			idAppAdapted : sIdAppAdapted
		};

		// Create manage apps component
		this.oManageAppsComponent = new ManageAppsComponent("manageApps", { adaptedAppProperties : oAdaptedAppProperties });

		// Place component in container and display
		this.oManageAppsComponentContainer = new ComponentContainer({
			component : this.oManageAppsComponent
		});

		this._oDialog.addContent(this.oManageAppsComponentContainer);
		var oButton = this._createButton();
		this._oDialog.addButton(oButton);
		this._oDialog.setContentWidth("1000px");
		this._oDialog.setContentHeight("300px");
		this._oDialog.setShowHeader(false);
	};

	ManageAppsDialog.prototype.open = function() {
		return new Promise(function(resolve) {
			this._oDialog.oPopup.attachOpened(function (){
				this.fireOpened();
				resolve(this);
			}.bind(this));
			this._oDialog.open();
		}.bind(this));
	};

	ManageAppsDialog.prototype._createButton = function() {
		var oCancelButton = new sap.m.Button({
			text : this._oTextResources.getText("MAA_CLOSE_BUTTON"),
			press : [this._closeDialog, this]
		});
		return oCancelButton;
	};

	ManageAppsDialog.prototype._closeDialog = function() {
		return new Promise(function(resolve) {
			this._oDialog.oPopup.attachClosed(function (){
				this._oDialog.destroy();
				resolve(true);
			}.bind(this));
			this._oDialog.close();
			this.fireClose();
		}.bind(this));
	};

	ManageAppsDialog.prototype.exit = function() {
		this._oDialog.destroy();
	};

	return ManageAppsDialog;

}, /* bExport= */ true);
