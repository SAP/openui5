/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Control",
	"sap/m/Text",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Icon",
	"sap/ui/dt/OverlayRegistry"
],
function(
	Fragment,
	JSONModel,
	Control,
	Text,
	DateFormat,
	Icon,
	OverlayRegistry
) {
	"use strict";

	return Control.extend("sap.ui.rta.toolbar.ChangeIndicator", {
		metadata: {
			properties : {
				mode: {type: "string", defaultValue: "change"},
				parentId:   {type : "string", defaultValue : ""},
				changes:     {type : "any", defaultValue : ""}
			},
			aggregations: {
				_popover : {type : "sap.m.Popover", multiple: false, visibility : "hidden"},
				_text : {type : "sap.m.Text", multiple: false, visibility : "hidden"},
				_icon : {type : "sap.ui.core.Icon", multiple: false, visibility : "hidden"}
			},
			defaultAggregation: "content"
		},

		init: function() {
			this.setAggregation("_text", new Text({
				text: this.getChanges().length
			}).addStyleClass("sapUiRtaChangeIndicatorText"));
			this.setAggregation("_icon", new Icon({
				src: "sap-icon://display",
				visible: false
			}).addStyleClass("sapUiRtaChangeIndicatorIcon"));
		},

		addChange: function(oChange) {
			this.getChanges().push(oChange);
			this.getAggregation("_text").setText(this.getChanges().length);
		},

		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.class("sapUiRtaChangeIndicator");
				oRm.class("sapUiRtaChangeIndicator-" + oControl.getMode());
				oRm.openEnd();
				oRm.openStart("div");
				oRm.openEnd();
				oRm.renderControl(oControl.getAggregation("_icon"));
				if (oControl.getChanges().length > 1) {
					oRm.renderControl(oControl.getAggregation("_text"));
				}
				oRm.close("div");
				oRm.close("div");
			}
		},

		onAfterRendering: function() {
			var oElement = document.getElementById(this.sId);
			var oParent = document.getElementById(this.getParentId());
			oParent.appendChild(oElement);

			var iHeight = oParent.offsetHeight;
			if (iHeight > 50) {
				iHeight = 50;
			}
			iHeight -= 2;
			oElement.style.width = iHeight + "px";
			oElement.style.height = iHeight + "px";
			if (this.getAggregation("_text").getDomRef()) {
				this.getAggregation("_text").getDomRef().style.fontSize = (iHeight / 3) + "px";
				if (iHeight < 25) {
					this.getAggregation("_text").getDomRef().style.height = iHeight + "px";
					this.getAggregation("_text").getDomRef().style.width = iHeight + "px";
					this.getAggregation("_text").getDomRef().style.fontSize = (iHeight - 2) + "px";
				}
			}
			if (this.getAggregation("_icon").getDomRef()) {
				this.getAggregation("_icon").getDomRef().style.fontSize = (iHeight * 0.5) + "px";
			}
			this.attachBrowserEvent("click", function(oEvent) {
				oEvent.stopPropagation();
				this.openDetailPopover();
			});
		},

		remove: function() {
			this.removeDependentElements();
			var sPrefix = "";
			if (!document.getElementById(this.sId)) {
				sPrefix = "sap-ui-invisible-";
			}
			document.getElementById(sPrefix + this.sId).remove();
		},

		hide: function() {
			this.setVisible(false);
		},

		reveal: function() {
			this.setVisible(true);
		},

		showDependentElements: function(oEvent) {
			this.detachBrowserEvent("click", this.openDetailPopover);
			this.getAggregation("_icon").setVisible(true);
			this.getAggregation("_text").setVisible(false);
			this.hideChangeIndicators();
			this.reveal();
			this.getAggregation("_popover").close();
			this.addStyleClass("sapUiRtaChangeIndicator-change-solid");
			this.aDependentElementsChangeIndicators = [];
			var oChange;
			if (this.getChanges().length > 1) {
				var oBindingContext = oEvent.getSource().getBindingContext("changesModel");
				oChange = oBindingContext.getModel().getProperty(oBindingContext.getPath()).change;
			} else {
				oChange = this.getChanges()[0];
			}
			this.getChangedElements(oChange, true).then(function(aControls) {
				aControls.forEach(function(oControl) {
					var oChangeIndicator = this.createChangeIndicator(oChange, oControl, "dependent");
					if (oChangeIndicator && oChangeIndicator.getParentId() !== this.getParentId()) {
						this.aDependentElementsChangeIndicators.push(oChangeIndicator);
						this.getParent().addContent(oChangeIndicator);
					}
				}.bind(this));
				this.attachBrowserEvent("click", this.hideDependentElements);
			}.bind(this));
		},

		removeDependentElements: function() {
			if (this.aDependentElementsChangeIndicators) {
				this.aDependentElementsChangeIndicators.forEach(function(oChangeIndicator) {
					oChangeIndicator.remove();
					oChangeIndicator.destroy();
				});
			}
			this.aDependentElementsChangeIndicators = [];
		},

		hideDependentElements: function() {
			this.detachBrowserEvent("click", this.hideDependentElements);
			this.removeDependentElements();
			this.revealChangeIndicators();
			this.getAggregation("_popover").openBy(this);
			this.getAggregation("_icon").setVisible(false);
			this.getAggregation("_text").setVisible(true);
			this.removeStyleClass("sapUiRtaChangeIndicator-change-solid");
			this.attachBrowserEvent("click", this.click);
		},

		getChangesModelItem: function(oChange) {
			return this.getChangedElements(oChange, false).then(function(aControls) {
				var oControl = aControls[0];
				var oOriginalRTATexts = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
				var sCommand = oChange.getDefinition().support.command;
				var sMode = this.getMode();
				var sChangeText;
				var sChangeTitle = (sCommand).charAt(0).toUpperCase() + (sCommand).slice(1);
				var sDate;
				var bEnableDetailButton = false;
				var sElementLabel = " ";
				var oOverlay = OverlayRegistry.getOverlay(oControl);
				if (oOverlay) {
					sElementLabel = "'" + oOverlay.getDesignTimeMetadata().getLabel(oControl) + "'";
				}
				sChangeText = oOriginalRTATexts.getText("TXT_CHANGEVISUALIZATION_" + sMode.toUpperCase() + "_" + sCommand.toUpperCase(), sElementLabel);
				sDate = DateFormat.getDateTimeInstance().format(new Date(oChange.getCreation()));
				bEnableDetailButton = (sMode === "change" && (sCommand === "move" || sCommand === "split"));
				var oChangesModelItem = {
					change: oChange,
					changeTitle: sChangeTitle,
					description: sChangeText,
					date: sDate,
					enableDetailButton: bEnableDetailButton
				};
				return oChangesModelItem;
			}.bind(this));
		},

		openDetailPopover: function() {
			var oChangesModel = {
				changes : []
			};
			var aPromises = [];
			this.getChanges().forEach(function(oChange) {
				aPromises.push(this.getChangesModelItem(oChange));
			}.bind(this));
			Promise.all(aPromises).then(function(aResult) {
				aResult.forEach(function(oItem) {
					oChangesModel.changes.push(oItem);
				});
				if (!this.getAggregation("_popover")) {
					var sFragment = "sap.ui.rta.toolbar.ChangeIndicatorPopover";
					if (oChangesModel.changes.length === 1) {
						sFragment = "sap.ui.rta.toolbar.SingleChangeIndicatorPopover";
					}
					Fragment.load({
						name: sFragment,
						id: this.getId() + "_fragment",
						controller: this
					}).then(function(pPopover) {
						var oModel = new JSONModel(oChangesModel);
						pPopover.setModel(oModel, "changesModel");
						this.setAggregation("_popover", pPopover);
						this.getAggregation("_popover").openBy(this);
					}.bind(this));
				} else {
					this.getAggregation("_popover").openBy(this);
				}
			}.bind(this));
		}
	});
});
