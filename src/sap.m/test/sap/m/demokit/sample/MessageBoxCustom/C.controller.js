sap.ui.define([
		'sap/m/InputListItem',
		'sap/m/List',
		'sap/m/MessageBox',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/layout/VerticalLayout',
		'sap/ui/model/json/JSONModel'
	], function(InputListItem, List, MessageBox, Fragment, Controller, VerticalLayout, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.MessageBoxCustom.C", {
		onInit : function() {
			// create any data and a model and set it to the view
			var oData = {
				message : "Wanna see the status of the CheckBox in an additional MessageBox?",
				checkBoxText : "Lorem Ipsum for CheckBox",
				buttonCustomContentText : "Show Custom Content",
				buttonDisabledScrollingText: "Disabled Horizontal Scrolling"
			};
			var oModel = new JSONModel(oData);
			var oView = this.getView();
			oView.setModel(oModel);
		},

		showCustomContent: function(oEvent) {
			var oLayout = sap.ui.xmlfragment("sap.m.sample.MessageBoxCustom.Layout", this);

			// get the view and add the layout as a dependent. Since the layout is being put
			// into an aggregation any possible binding will be 'forwarded' to the layout.
			var oView = this.getView();
			oView.addDependent(oLayout);

			MessageBox.show(oLayout, {
				icon : MessageBox.Icon.WARNING,
				title : "Message Box with Custom Content",
				actions : [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose : function(oAction) {
					if ( oAction === MessageBox.Action.YES ) {
						var oCheck = sap.ui.getCore().byId("checkBoxId");
						var sText = "Checkbox is " + (oCheck.getSelected() ? "" : "not ") + "checked";

						MessageBox.alert(sText, {
							title: "Result of CheckBox"
						});
					}
				},
				dialogId : "messageBoxId"
			});
		},

		handleShowMessageBoxPress_Scrolling: function (oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var sLongText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Sed gravida sagittis semper. Maecenas non eros arcu. Aenean pharetra faucibus nisl sed cursus. Morbi ultrices lacus et facilisis venenatis. In porta pharetra libero, in maximus turpis semper vitae. Donec lectus mauris, consequat ut tincidunt pharetra, posuere vitae massa. Suspendisse rutrum ipsum dui, pulvinar mollis dolor ullamcorper a. Nam eleifend, neque sit amet dignissim commodo, mi lacus feugiat nunc, in elementum tortor enim congue purus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Sed gravida sagittis semper. Maecenas non eros arcu. Aenean pharetra faucibus nisl sed cursus. Morbi ultrices lacus et facilisis venenatis. In porta pharetra libero, in maximus turpis semper vitae. Donec lectus mauris, consequat ut tincidunt pharetra, posuere vitae massa. Suspendisse rutrum ipsum dui, pulvinar mollis dolor ullamcorper a. Nam eleifend, neque sit amet dignissim commodo, mi lacus feugiat nunc, in elementum tortor enim congue purus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Sed gravida sagittis semper. Maecenas non eros arcu. Aenean pharetra faucibus nisl sed cursus. Morbi ultrices lacus et facilisis venenatis. In porta pharetra libero, in maximus turpis semper vitae. Donec lectus mauris, consequat ut tincidunt pharetra, posuere vitae massa. Suspendisse rutrum ipsum dui, pulvinar mollis dolor ullamcorper a. Nam eleifend, neque sit amet dignissim commodo, mi lacus feugiat nunc, in elementum tortor enim congue purus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus.";

			var oLayout = new VerticalLayout({
				width: "100%",
				content: [
					new List({
						inset: false,
						items: [
							new InputListItem({
								label: sLongText
							}), new InputListItem({
								label: sLongText
							}), new InputListItem({
								label: sLongText
							})
						]
					})
				]
			});

			MessageBox.show(
					oLayout,
					{
						icon: MessageBox.Icon.INFORMATION,
						title: "Messege Box with Long Content",
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						onClose: function (oAction) {
							if (oAction === MessageBox.Action.YES) {
								var oCheck = sap.ui.getCore().byId("checkBoxId");
								var sText = "Checkbox is " + (oCheck.getSelected() ? "" : "not ") + "checked";

								// alert(sMessage, fnCallBack, sTitle)
								MessageBox.alert(sText, {
									title: "Result of CheckBox"
								});
							}
						},
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						initialFocus: "Custom button text",
						horizontalScrolling: false
					}
			);
		}
	});


	return CController;

});
