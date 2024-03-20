/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/UIComponent",
	"sap/ui/core/sample/common/Controller"
], function (MessageBox, UIComponent, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Draft.ObjectPage", {
		getKeyPredicate : function (oContext) {
			var sPath = oContext.getPath();

			return sPath.slice(sPath.indexOf("(", sPath.lastIndexOf("/")));
		},

		hasPendingChanges : function (vBindingOrContext, sVerb, bIgnoreKeptAlive) {
			if (vBindingOrContext.hasPendingChanges(bIgnoreKeptAlive)) {
				MessageBox.error(
					"There are unsaved changes which will be lost; save or reset changes before "
					+ sVerb);

				return true;
			}
			return false;
		},

		navTo : function (oContext, bShowList) {
			if (bShowList === undefined) {
				bShowList = this.getView().getModel("ui").getProperty("/bShowList");
			}

			UIComponent.getRouterFor(this)
				.navTo(bShowList ? "objectPage" : "objectPageNoList",
					{key : this.getKeyPredicate(oContext)}, true);
		},

		onCancel : function () {
			var oDraftContext = this.getView().getBindingContext(),
				that = this;

			function gotoActiveContext(oActiveContext) {
				that.oActiveContext = null; // not needed anymore
				oDraftContext.delete("$auto", true);
				that.navTo(oActiveContext);
			}

			if (this.oActiveContext) {
				oDraftContext.replaceWith(this.oActiveContext);
				gotoActiveContext(this.oActiveContext);
			} else {
				oDraftContext.getModel().bindContext("SiblingEntity(...)", oDraftContext,
						{$$inheritExpandSelect : true})
					.invoke("$auto", false, null, true).then(gotoActiveContext);
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
			oContext = oView.getModel().getKeepAliveContext(sPath, false,
				{$$patchWithoutSideEffects : true});
			oView.setBindingContext(oContext);
			oView.setBusy(true);
			oContext.requestProperty("IsActiveEntity").catch(function () {
				// ignore; it's logged anyway
			}).finally(function () {
				oView.setBusy(false);
			});
			this.setShowList(!oEvent.getParameter("config").pattern.endsWith("?noList"));
		},

		onSave : function () {
			this.toggleDraft("draftActivate").then(function (oDraftContext) {
				oDraftContext.delete(null);
			});
		},

		onShowList : function () {
			this.navTo(this.getView().getBindingContext(),
				!this.getView().getModel("ui").getProperty("/bShowList"));
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
				.invoke("$auto", false, null, true)
				.then(function (oSiblingContext) {
					that.oActiveContext
						= oSiblingContext.getProperty("IsActiveEntity") ? null : oContext;
					that.navTo(oSiblingContext);

					return oContext;
				});
		}
	});
});
