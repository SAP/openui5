jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("sap.m.sample.MessageBox.C", {

	onInit : function() {
		// create any data and a model and set it to the view
		var oData = {
			checkBox1Text : "This checkBox is not checked",
			checkBox2Text : "This checkBox is checked"
		};
		var oModel = new sap.ui.model.json.JSONModel(oData);
		var oView = this.getView();
		oView.setModel(oModel)
	},

	handleConfirmationMessageBoxPress: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.confirm(
			"Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.", {
				styleClass: bCompact? "sapUiSizeCompact" : ""
			}
		);
	},

	handleAlertMessageBoxPress: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.alert(
			"Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.",
			{
				styleClass: bCompact? "sapUiSizeCompact" : ""
			}
		);
	},

	handleConfirmMessageBoxPress_InitialFocus: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.confirm(
				"Initial button focus is set by attribute \n initialFocus: sap.m.MessageBox.Action.CANCEL",
				{
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Set initial focus on a button",
					styleClass: bCompact? "sapUiSizeCompact" : "",
					initialFocus: sap.m.MessageBox.Action.CANCEL
				}
		);
	},

	handleShowMessageBoxPress_InitialFocus: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.show(
				'Initial button focus is set by attribute \n initialFocus: \"Custom button text\" \n Note: The name is not case sensitive',
				{
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Set initial focus on a button",
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO, "Custom button text"],
					styleClass: bCompact? "sapUiSizeCompact" : "",
					initialFocus: "Custom button text"
				}
		);
	},

	handleShowMessageBoxPress_InitialFocus_Control: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		var oLayout = sap.ui.xmlfragment("sap.m.sample.MessageBox.Layout", this);

		// get the view and add the layout as a dependent. Since the layout is being put
		// into an aggregation any possible binding will be 'forwarded' to the layout.
		var oView = this.getView();
		oView.addDependent(oLayout);
		var oCheck = sap.ui.getCore().byId("checkBoxId2");

		sap.m.MessageBox.show(oLayout, {
			icon: sap.m.MessageBox.Icon.WARNING,
			title: "Set initial focus on a control",
			actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
			onClose: function (oAction) {
				if (oAction === sap.m.MessageBox.Action.YES) {
					var sText = "Checkbox is " + (oCheck.getSelected() ? "" : "not ") + "checked";
					sap.m.MessageBox.alert(sText, {
						title: "Result of CheckBox"
					});
				}
			},
			dialogId: "messageBoxId1",
			initialFocus: oCheck
		});
	},

	handleShowMessageBoxPress_Scrolling: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

		var sLongText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Sed gravida sagittis semper. Maecenas non eros arcu. Aenean pharetra faucibus nisl sed cursus. Morbi ultrices lacus et facilisis venenatis. In porta pharetra libero, in maximus turpis semper vitae. Donec lectus mauris, consequat ut tincidunt pharetra, posuere vitae massa. Suspendisse rutrum ipsum dui, pulvinar mollis dolor ullamcorper a. Nam eleifend, neque sit amet dignissim commodo, mi lacus feugiat nunc, in elementum tortor enim congue purus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Sed gravida sagittis semper. Maecenas non eros arcu. Aenean pharetra faucibus nisl sed cursus. Morbi ultrices lacus et facilisis venenatis. In porta pharetra libero, in maximus turpis semper vitae. Donec lectus mauris, consequat ut tincidunt pharetra, posuere vitae massa. Suspendisse rutrum ipsum dui, pulvinar mollis dolor ullamcorper a. Nam eleifend, neque sit amet dignissim commodo, mi lacus feugiat nunc, in elementum tortor enim congue purus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Sed gravida sagittis semper. Maecenas non eros arcu. Aenean pharetra faucibus nisl sed cursus. Morbi ultrices lacus et facilisis venenatis. In porta pharetra libero, in maximus turpis semper vitae. Donec lectus mauris, consequat ut tincidunt pharetra, posuere vitae massa. Suspendisse rutrum ipsum dui, pulvinar mollis dolor ullamcorper a. Nam eleifend, neque sit amet dignissim commodo, mi lacus feugiat nunc, in elementum tortor enim congue purus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus.";

		var oLayout = new sap.ui.layout.VerticalLayout({
			width: "100%",
			content: [
				new sap.m.List({
					inset : false,
					width : "100%",
					items : [
						new sap.m.InputListItem({
							label : sLongText
						}), new sap.m.InputListItem({
							label : sLongText
						}), new sap.m.InputListItem({
							label : sLongText
						})
					]
				})
			]
		});

		sap.m.MessageBox.show(
				oLayout,
				{
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Information",
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO, "Custom button text"],
					onClose: function(oAction) {
						if ( oAction === sap.m.MessageBox.Action.YES ) {
							var oCheck = sap.ui.getCore().byId("checkBoxId");
							var sText = "Checkbox is " + (oCheck.getSelected() ? "" : "not ") + "checked";

							// alert(sMessage, fnCallBack, sTitle)
							sap.m.MessageBox.alert(sText, {
								title: "Result of CheckBox"
							});
						}
					},
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					initialFocus: "Custom button text",
					verticalScrolling: true,
					horizontalScrolling: true
				}
		);
	}
});
