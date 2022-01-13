/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/library",
	"sap/m/MessageBox",
	"sap/ui/core/UIComponent",
	"sap/ui/core/sample/common/Controller"
], function (library, MessageBox, UIComponent, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Draft.ObjectPage", {
		hasPendingChanges : function (vBindingOrContext, sVerb, bIgnoreKeptAlive) {
			if (vBindingOrContext.hasPendingChanges(bIgnoreKeptAlive)) {
				MessageBox.error(
					"There are unsaved changes which will be lost; save or reset changes before "
					+ sVerb);

				return true;
			}
			return false;
		},

		navTo : function (sKey, bShowList) {
			if (bShowList === undefined) {
				bShowList = this.getView().getModel("ui").getProperty("/bShowList");
			}

			UIComponent.getRouterFor(this)
				.navTo(bShowList ? "objectPage" : "objectPageNoList", {key : sKey}, true);
		},

		onCancel : function () {
			var oDraftContext = this.getView().getBindingContext(),
				sActiveKey = "(ID=" + oDraftContext.getProperty("ID") + ",IsActiveEntity=true)",
				that = this;

			function gotoActiveContext() {
				that.oActiveContext = null; // not needed anymore
				oDraftContext.delete("$auto", true);
				that.navTo(sActiveKey);
			}

			if (this.oActiveContext) {
				oDraftContext.replaceWith(this.oActiveContext);
				gotoActiveContext();
			} else {
				oDraftContext.getModel().bindContext("SiblingEntity(...)", oDraftContext,
						{$$inheritExpandSelect : true})
					.execute("$auto", false, null, true).then(gotoActiveContext);
			}
		},

		onEdit : function () {
			this.toggleDraft("draftEdit");
		},

		onInit : function () {
			var oRouter = UIComponent.getRouterFor(this);

			oRouter.getRoute("objectPage").attachPatternMatched(this.onPatternMatched, this);
			oRouter.getRoute("objectPageNoList").attachPatternMatched(this.onPatternMatched, this);
			this.oActiveContext = null; // the previous active context, while a draft is shown
		},

		onPatternMatched : function (oEvent) {
			var oContext,
				sPath = "/Products" + oEvent.getParameter("arguments").key,
				oView = this.getView();

			oContext = oView.getBindingContext();
			if (oContext && oContext !== this.oActiveContext) {
				oContext.setKeepAlive(false);
			}
			oContext = oView.getModel().getKeepAliveContext(sPath);
			if (!oContext) { // TODO needed because getKeepAliveContext is not finished
				oContext = oView.getModel().bindContext(sPath, undefined,
					{$$patchWithoutSideEffects : true}).getBoundContext();
			}
			oView.setBindingContext(oContext);
			oView.setBusy(true);
			oContext.requestProperty("ID").finally(function () {
				oView.setBusy(false);
			});
			this.setShowList(!oEvent.getParameter("config").pattern.endsWith("?noList"));
		},

		onRefreshProduct : function () {
			var oContext = this.byId("objectPage").getBindingContext();

			if (this.hasPendingChanges(oContext, "refreshing")) {
				return;
			}
			oContext.refresh(undefined, true);
		},

		onSave : function () {
			this.toggleDraft("draftActivate").then(function (oDraftContext) {
				oDraftContext.delete(null);
			});
		},

		onShowList : function () {
			var sPath = this.getView().getBindingContext().getPath(),
				sKey = sPath.slice(sPath.lastIndexOf("("));

			this.navTo(sKey, !this.getView().getModel("ui").getProperty("/bShowList"));
		},

		setShowList : function (bShowList) {
			var oModel = this.getView().getModel("ui");

			oModel.setProperty("/bShowList", bShowList);
			oModel.setProperty("/sShowListIcon",
				bShowList ? "sap-icon://close-command-field" : "sap-icon://open-command-field");
			oModel.setProperty("/sShowListTooltip", bShowList ? "Hide List" : "Show List");
		},

		toggleDraft : function (sAction) {
			var oView = this.getView(),
				oContext = oView.getBindingContext(),
				that = this;

			return oContext.getModel().bindContext("SampleService." + sAction + "(...)",
					oContext, {$$inheritExpandSelect : true})
				.execute("$auto", false, null, true)
				.then(function (oSiblingContext) {
					var oSiblingEntity = oSiblingContext.getObject(),
						sKey = "(ID=" + oSiblingEntity.ID + ",IsActiveEntity="
							+ oSiblingEntity.IsActiveEntity + ")";

					that.oActiveContext = oSiblingEntity.IsActiveEntity ? null : oContext;
					that.navTo(sKey);

					return oContext;
				});
		}
	});
});
