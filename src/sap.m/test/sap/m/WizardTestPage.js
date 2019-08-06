sap.ui.define(["sap/m/Wizard", "sap/m/WizardStep", "sap/m/MessageToast",
		"sap/m/Text", "sap/m/Label", "sap/m/Input", "sap/m/TextArea",
		"sap/m/CheckBox", "sap/m/Select", "sap/m/StandardListItem",
		"sap/m/Page", "sap/m/Button", "sap/m/Link", "sap/m/RadioButton",
		"sap/m/RadioButtonGroup", "sap/m/VBox", "sap/m/Dialog", "sap/m/List",
		"sap/m/SplitApp", "sap/ui/core/Item", "sap/ui/layout/form/SimpleForm"],
	function(Wizard, WizardStep, MessageToast, Text, Label, Input,
	         TextArea, CheckBox, Select, StandardListItem, Page, Button , Link,
	         RadioButton, RadioButtonGroup, VBox, Dialog, List, SplitApp, Item,
	         SimpleForm) {
		"use strict";

		var splitAppContainer = new SplitApp(),
			wizard, bindableWizard, branchingWizard,
			currentStepTest, iconOnlyWizard,
			dialogIntegrationTest;

		(function () {
			var checkStep4 = function() {
				var selected1 = sap.ui.getCore().byId("cBox1").getSelected(),
					selected2 = sap.ui.getCore().byId("cBox2").getSelected(),
					selected3 = sap.ui.getCore().byId("cBox3").getSelected(),
					selected4 = sap.ui.getCore().byId("cBox4").getSelected(),
					selected5 = sap.ui.getCore().byId("cBox5").getSelected();

				if ( (selected1 && selected2 && !selected5) || (selected3 && !selected4) || (selected4 && selected2 && selected1 ) ) {
					wizard.validateStep(step4);
				}
			};

			var step1 = new WizardStep({
				validated : false,
				id: "linear-wiz-step1",
				title : "User credentials",
				icon: "sap-icon://permission",
				content: [
					new Text({
						text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eget turpis quis felis luctus consectetur. Nulla eros sem, tincidunt sit amet ipsum at, laoreet fringilla risus. Curabitur tempus arcu sit amet volutpat gravida. Sed blandit leo vel lectus tempus, ac laoreet dui tempus. Curabitur placerat orci a faucibus rutrum. Praesent mattis ante vel enim posuere, a luctus lacus posuere. Aliquam imperdiet leo sit amet auctor vestibulum. Nunc consequat, turpis faucibus porttitor eleifend, nisi eros auctor est, in ultricies magna elit in quam. Phasellus risus felis, cursus at libero sed, consequat tristique lectus. Nullam quis eros diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce dignissim turpis quis elit finibus elementum. Fusce aliquet enim ante. Morbi vitae turpis urna."
					}),
					new SimpleForm({
						minWidth : 1024,
						maxContainerCols : 2,
						editable: true,
						content: [
							new Label({
								text:"User name",
								labelFor : "nameInput"
							}),
							new Input("nameInput", {
								liveChange : function(oEvent) {
									var val = oEvent.getParameter("value");
									if (val.length > 8) {
										wizard.validateStep(step1);
									} else {
										wizard.invalidateStep(step1);
									}
								}
							}),
							new Label({text: "E-mail"}),
							new Input(),
							new Label({text:"Password"}),
							new Input({type:"Password"}),
							new Label({text:"Repeat Password"}),
							new Input({type:"Password"})
						]
					}),
					new CheckBox("skip_details", {
						text: "Skip details (Changing the selection on a later stage, will discard the wizard progress!)",
						select: function (oEvent) {
							var oStep = sap.ui.getCore().byId("linear-wiz-step1"),
								bSelected = oEvent.getParameter("selected");

							oStep.setValidated(bSelected);
							wizard.discardProgress(oStep);
						}
					})
				]
			});
			var step2 = new WizardStep({
				id: "linear-wiz-step2",
				validated : true,
				title : "Personal information",
				icon: "sap-icon://person-placeholder",
				content: [
					new Text({
						text: "Donec dictum odio nec vestibulum finibus. In sit amet nulla id dolor aliquam mollis id sed urna. Maecenas porta, lacus aliquam rhoncus euismod, tellus dui efficitur tellus, et ornare enim magna non lorem. Nam accumsan commodo ultricies. Vivamus pellentesque accumsan purus, in ullamcorper justo semper nec. Quisque libero quam, lobortis sed accumsan at, accumsan at odio. Maecenas quis arcu dignissim, faucibus augue sit amet, varius nisi. Donec est turpis, imperdiet lacinia cursus ac, luctus et libero. Etiam pretium, ex facilisis varius lobortis, ipsum mauris gravida purus, sit amet cursus dui dolor ac nisl. Vivamus tortor neque, eleifend a est a, convallis posuere orci. Maecenas lacinia vestibulum egestas. Integer tempor justo et justo venenatis, quis consectetur nisl imperdiet. Nulla auctor pretium odio sit amet pulvinar"
					}),
					new VBox({
						items: [
							new Text({
								text: "Pressing NAVIGATE will set showNextButton to false and will then navigate to the next step."
							}),
							new Button({
								id: "navigate-nextstep-btn",
								text: "Navigate",
								type: "Accept",
								press: function () {
									wizard.setShowNextButton(false);
									wizard.nextStep();
								}
							})
						]
					}).addStyleClass("sapUiLargeMarginTop sapUiLargeMarginBottom")
				]
			});
			var step3 = new WizardStep({
				id: "linear-wiz-step3",
				validated: true,
				title: "Payment details",
				icon: "sap-icon://simple-payment",
				content: [
					new SimpleForm({
						minWidth: 1024,
						maxContainerCols: 2,
						editable: true,
						content: [
							new Label({
								text: 'Select'
							}),
							new Select({
								name: "select-name0",
								items: [
									new Item({
										key: "0",
										text: "item 0"
									}),
									new Item({
										key: "1",
										text: "item 1"
									}),
									new Item({
										key: "2",
										text: "item 2 is a little long"
									}),
									new Item({
										key: "3",
										text: "item 3"
									})
								]
							}),
							new Label({
								text: 'Link'
							}),
							new Link({
								text: 'SAP Germany',
								href: 'http://www.sap.com',
								target: '_blank'
							}),
							new Label({
								text: 'TextArea'
							}),
							new TextArea({
								placeholder: "Please add your comment",
								rows: 6,
								maxLength: 255,
								width: "100%"
							})
						]
					})
				]
			});
			var step4 = new WizardStep({
				validated : false,
				title : "Credit card information",
				icon: "sap-icon://credit-card",
				activate : function() {
					MessageToast.show("Credit card information step activated");
				},
				content : [
					new SimpleForm({
						minWidth : 1024,
						maxContainerCols : 2,
						editable: true,
						content: [
							new Label({
								text:"CC Number"
							}),
							new Input(),
							new Label({text: "Verification code"}),
							new Input(),
							new Label({text:"Lorem ipsum"}),
							new CheckBox("cBox1",{text: "Ilbris", select : checkStep4}),
							new CheckBox("cBox2",{ text: "Mohaseed", select : checkStep4 }),
							new CheckBox("cBox3",{ text: "Jukka", select : checkStep4 }),
							new CheckBox("cBox4",{ text: "Valvet", select : checkStep4 }),
							new CheckBox("cBox5",{ text: "Beerendes", select : checkStep4})
						]
					})
				]
			});
			var step5 = new WizardStep({
				validated : true,
				title: "Card contents",
				icon: "sap-icon://bar-code",
				content : [
					new Label({
						text:"CC Number"
					}),
					new Input({
						liveChange : function(oEvent) {

						}
					}),
					new Label({text: "Verification code"}),
					new Input(),
					new Label({text:"Lorem ipsum"}),
					new CheckBox({text: "Ilbris"}),
					new CheckBox({ text: "Mohaseed"}),
					new CheckBox({ text: "Jukka"}),
					new CheckBox({ text: "Valvet"}),
					new CheckBox({ text: "Beerendes"})
				]
			});
			var step6 = new WizardStep({
				title : "Finishing touches",
				icon: "sap-icon://detail-view",
				validated : true,
				content : [
					new Text({
						text: "Donec dictum odio nec vestibulum finibus. In sit amet nulla id dolor aliquam mollis id sed urna. Maecenas porta, lacus aliquam rhoncus euismod, tellus dui efficitur tellus, et ornare enim magna non lorem. Nam accumsan commodo ultricies. Vivamus pellentesque accumsan purus, in ullamcorper justo semper nec. Quisque libero quam, lobortis sed accumsan at, accumsan at odio. Maecenas quis arcu dignissim, faucibus augue sit amet, varius nisi. Donec est turpis, imperdiet lacinia cursus ac, luctus et libero. Etiam pretium, ex facilisis varius lobortis, ipsum mauris gravida purus, sit amet cursus dui dolor ac nisl. Vivamus tortor neque, eleifend a est a, convallis posuere orci. Maecenas lacinia vestibulum egestas. Integer tempor justo et justo venenatis, quis consectetur nisl imperdiet. Nulla auctor pretium odio sit amet pulvinar"
					}),
					new Button({
						text: "Verify final step",
						press : function() {
							wizard.validateStep(step6);
						}
					}),
					new Button({
						text : "Discard progress",
						press : function() {
							wizard.discardProgress(step1);
						}
					})
				]
			});

			wizard = new Wizard({
				id: "linear-wiz",
				width:"100%",
				showNextButton: true,
				complete : function() {
					MessageToast.show("Process finished");
				},
				steps: [step1, step2, step3, step4, step5, step6]
			});

		})();

		(function () {
			bindableWizard = new Wizard({
				steps: {
					path: "/steps",
					template: new WizardStep({
						title:"{title}",
						optional: "{optional}",
						content: new Button({
							text: "{button}"
						})
					})
				}
			});

			bindableWizard.setModel(new sap.ui.model.json.JSONModel({
				steps: [
					{
						title: "First",
						button: "1button1"
					},
					{
						title: "Second",
						optional: true,
						button: "22button22"
					},
					{
						title: "Third",
						button: "333button333"
					}
				]
			}));
		})();

		(function () {

			var step6 = new WizardStep({
				title : "Finishing touches",
				content : [
					new Text({
						text: "Donec dictum odio nec vestibulum finibus. In sit amet nulla id dolor aliquam mollis id sed urna. Maecenas porta, lacus aliquam rhoncus euismod, tellus dui efficitur tellus, et ornare enim magna non lorem. Nam accumsan commodo ultricies. Vivamus pellentesque accumsan purus, in ullamcorper justo semper nec. Quisque libero quam, lobortis sed accumsan at, accumsan at odio. Maecenas quis arcu dignissim, faucibus augue sit amet, varius nisi. Donec est turpis, imperdiet lacinia cursus ac, luctus et libero. Etiam pretium, ex facilisis varius lobortis, ipsum mauris gravida purus, sit amet cursus dui dolor ac nisl. Vivamus tortor neque, eleifend a est a, convallis posuere orci. Maecenas lacinia vestibulum egestas. Integer tempor justo et justo venenatis, quis consectetur nisl imperdiet. Nulla auctor pretium odio sit amet pulvinar"
					}),
					new Button({
						text: "Verify final step",
						press : function() {
							branchingWizard.validateStep(step6);
						}
					}),
					new Button({
						text : "Discard progress",
						press : function() {
							branchingWizard.discardProgress(step1);
						}
					})
				]
			});
			var stepDummy = new WizardStep("Dummy_Step", {
				nextStep: step6,
				title: "Dummy step",
				content: [new Text({text: "I am dummy!"})]
			});
			var step5 = new WizardStep("Card_Contents",{
				nextStep: stepDummy,
				title: "Card contents",
				content : [
					new Label({
						text:"CC Number"
					}),
					new Input({
						liveChange : function(oEvent) {

						}
					}),
					new Label({text: "Verification code"}),
					new Input(),
					new Label({text:"Lorem ipsum"}),
					new CheckBox({text: "Ilbris"}),
					new CheckBox({ text: "Mohaseed"}),
					new CheckBox({ text: "Jukka"}),
					new CheckBox({ text: "Valvet"}),
					new CheckBox({ text: "Beerendes"})
				]
			});
			var step4 = new WizardStep("CreditCard_Information",{
				nextStep: step6,
				title : "Credit card information",
				activate : function() {
					MessageToast.show("Credit card information step activated");
				},
				content : [
					new SimpleForm({
						minWidth : 1024,
						maxContainerCols : 2,
						editable: true,
						content: [
							new Label({
								text:"CC Number"
							}),
							new Input(),
							new Label({text: "Verification code"}),
							new Input(),
							new Label({text:"Lorem ipsum"})
						]
					})
				]
			});
			var step3 = new WizardStep("Payment_Details",{
				subsequentSteps: [step4, step5],
				title: "Payment details",
				optional: true,
				validated: false,
				complete: function () {
					var nextId = sap.ui.getCore().byId("step3Next").getSelectedButton().getText();
					var nextStep = sap.ui.getCore().byId(nextId);
					step3.setNextStep(nextStep);
				},
				content: [
					new SimpleForm({
						minWidth: 1024,
						maxContainerCols: 2,
						editable: true,
						content: [
							new Label({
								text:"Next Step"
							}),
							new RadioButtonGroup("step3Next", {
								select: function () {
									branchingWizard.discardProgress(step3);
								},
								buttons: [
									new RadioButton({ text:"Card_Contents" }),
									new RadioButton({ id: "credit-card-radio", text:"CreditCard_Information"})
								]
							}),
							new Button('validate-step',{
								text: "Validate step",
								press: function () {
									step3.setValidated(true);
								}
							})
						]
					})
				]
			});
			var step2 = new WizardStep("Personal_Information",{
				id: "branch-wiz-step2",
				title : "Personal information",
				nextStep: step3,
				content: [
					new Text({
						text: "Donec dictum odio nec vestibulum finibus. In sit amet nulla id dolor aliquam mollis id sed urna. Maecenas porta, lacus aliquam rhoncus euismod, tellus dui efficitur tellus, et ornare enim magna non lorem. Nam accumsan commodo ultricies. Vivamus pellentesque accumsan purus, in ullamcorper justo semper nec. Quisque libero quam, lobortis sed accumsan at, accumsan at odio. Maecenas quis arcu dignissim, faucibus augue sit amet, varius nisi. Donec est turpis, imperdiet lacinia cursus ac, luctus et libero. Etiam pretium, ex facilisis varius lobortis, ipsum mauris gravida purus, sit amet cursus dui dolor ac nisl. Vivamus tortor neque, eleifend a est a, convallis posuere orci. Maecenas lacinia vestibulum egestas. Integer tempor justo et justo venenatis, quis consectetur nisl imperdiet. Nulla auctor pretium odio sit amet pulvinar"
					})
				]
			});
			var step1 = new WizardStep({
				title : "User credentials",
				id: "branch-wiz-step1",
				complete : function() {
					var nextId = sap.ui.getCore().byId("step1Next").getSelectedButton().getText();
					var nextStep = sap.ui.getCore().byId(nextId);
					step1.setNextStep(nextStep);
				},
				subsequentSteps: [step2, step3],
				content: [
					new Text({
						text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eget turpis quis felis luctus consectetur. Nulla eros sem, tincidunt sit amet ipsum at, laoreet fringilla risus. Curabitur tempus arcu sit amet volutpat gravida. Sed blandit leo vel lectus tempus, ac laoreet dui tempus. Curabitur placerat orci a faucibus rutrum. Praesent mattis ante vel enim posuere, a luctus lacus posuere. Aliquam imperdiet leo sit amet auctor vestibulum. Nunc consequat, turpis faucibus porttitor eleifend, nisi eros auctor est, in ultricies magna elit in quam. Phasellus risus felis, cursus at libero sed, consequat tristique lectus. Nullam quis eros diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce dignissim turpis quis elit finibus elementum. Fusce aliquet enim ante. Morbi vitae turpis urna."
					}),
					new SimpleForm({
						minWidth : 1024,
						maxContainerCols : 2,
						editable: true,
						content: [
							new Label({
								text:"Next Step"
							}),
							new RadioButtonGroup("step1Next", {
								buttons: [
									new RadioButton({ text:"Personal_Information" }),
									new RadioButton({ id: "payment_details_radio", text:"Payment_Details"})
								]
							})
						]
					})
				]
			});

			branchingWizard = new Wizard('branch-wiz',{
				enableBranching: true,
				width:"100%",
				showNextButton: true,
				complete : function() {
					MessageToast.show("Process finished");
				},
				steps: [step1, step2, step3, step4, step5, stepDummy, step6]
			});

		})();

		(function () {
			var step1 = new WizardStep({
				validated : true,
				icon: "sap-icon://permission",
				complete : function() {
					MessageToast.show("First step is complete");
				},
				content: [
					new Text({
						text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eget turpis quis felis luctus consectetur. Nulla eros sem, tincidunt sit amet ipsum at, laoreet fringilla risus. Curabitur tempus arcu sit amet volutpat gravida. Sed blandit leo vel lectus tempus, ac laoreet dui tempus. Curabitur placerat orci a faucibus rutrum. Praesent mattis ante vel enim posuere, a luctus lacus posuere. Aliquam imperdiet leo sit amet auctor vestibulum. Nunc consequat, turpis faucibus porttitor eleifend, nisi eros auctor est, in ultricies magna elit in quam. Phasellus risus felis, cursus at libero sed, consequat tristique lectus. Nullam quis eros diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce dignissim turpis quis elit finibus elementum. Fusce aliquet enim ante. Morbi vitae turpis urna."
					})
				]
			});
			var step2 = new WizardStep({
				validated : true,
				icon: "sap-icon://person-placeholder",
				content: [
					new Text({
						text: "Donec dictum odio nec vestibulum finibus. In sit amet nulla id dolor aliquam mollis id sed urna. Maecenas porta, lacus aliquam rhoncus euismod, tellus dui efficitur tellus, et ornare enim magna non lorem. Nam accumsan commodo ultricies. Vivamus pellentesque accumsan purus, in ullamcorper justo semper nec. Quisque libero quam, lobortis sed accumsan at, accumsan at odio. Maecenas quis arcu dignissim, faucibus augue sit amet, varius nisi. Donec est turpis, imperdiet lacinia cursus ac, luctus et libero. Etiam pretium, ex facilisis varius lobortis, ipsum mauris gravida purus, sit amet cursus dui dolor ac nisl. Vivamus tortor neque, eleifend a est a, convallis posuere orci. Maecenas lacinia vestibulum egestas. Integer tempor justo et justo venenatis, quis consectetur nisl imperdiet. Nulla auctor pretium odio sit amet pulvinar"
					})
				]
			});
			var step3 = new WizardStep({
				validated: true,
				icon: "sap-icon://simple-payment",
				content: [
					new SimpleForm({
						minWidth: 1024,
						maxContainerCols: 2,
						editable: true,
						content: [
							new Label({
								text: 'Select'
							}),
							new Select({
								name: "select-name0",
								items: [
									new Item({
										key: "0",
										text: "item 0"
									}),
									new Item({
										key: "1",
										text: "item 1"
									}),
									new Item({
										key: "2",
										text: "item 2 is a little long"
									}),
									new Item({
										key: "3",
										text: "item 3"
									})
								]
							}),
							new Label({
								text: 'Link'
							}),
							new Link({
								text: 'SAP Germany',
								href: 'http://www.sap.com',
								target: '_blank'
							}),
							new Label({
								text: 'TextArea'
							}),
							new TextArea({
								placeholder: "Please add your comment",
								rows: 6,
								maxLength: 255,
								width: "100%"
							})
						]
					})
				]
			});


			iconOnlyWizard = new Wizard({
				width:"100%",
				showNextButton: true,
				complete : function() {
					MessageToast.show("Process finished");
				},
				stepActivate : function (oEvent) {
					//MessageToast.show("Step " + oEvent.getParameter("index"));
				},
				steps: [step1, step2, step3]
			});
		})();

		(function () {
			var step1 = new WizardStep({
				validated : true,
				icon: "sap-icon://permission",
				complete : function() {
					MessageToast.show("Complete 1");
				}
			});
			var step2 = new WizardStep({
				validated : true,
				icon: "sap-icon://person-placeholder",
				complete : function() {
					MessageToast.show("Complete 2");
				}
			});
			var step3 = new WizardStep({
				validated: true,
				icon: "sap-icon://simple-payment",
				complete : function() {
					MessageToast.show("Complete 3");
				}
			});
			var step4 = new WizardStep({
				validated: true,
				icon: "sap-icon://simple-payment",
				complete : function() {
					MessageToast.show("Complete 4");
				}
			});

			currentStepTest = new Wizard({
				width:"100%",
				showNextButton: true,
				currentStep: step4,
				steps: [step1, step2, step3, step4]
			});
		})();

		(function () {
			var step1 = new WizardStep({
				validated : true,
				icon: "sap-icon://permission",
				content: [new VBox({
					items: [
						new Input("input-in-wiz-dialog"),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"})
					]
				})]
			});
			var step2 = new WizardStep({
				validated : true,
				icon: "sap-icon://person-placeholder",
				content: [new VBox({
					items: [
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"})
					]
				})]
			});
			var step3 = new WizardStep({
				validated: true,
				icon: "sap-icon://simple-payment",
				content: [new VBox({
					items: [
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"})
					]
				})]
			});
			var step4 = new WizardStep({
				validated: true,
				icon: "sap-icon://simple-payment",
				content: [new VBox({
					items: [
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"}),
						new Text({text: "Sample text"})
					]
				})]
			});

			var wizard = new Wizard({
				width:"100%",
				showNextButton: true,
				currentStep: step1,
				steps: [step1, step2, step3, step4]
			});

			var dialog = new Dialog({
				id: "wiz-dialog",
				contentHeight: "50%",
				verticalScrolling: false,
				initialFocus: "input-in-wiz-dialog",
				beginButton: new Button({
					id: "navigate-btn",
					text: "Navigate",
					press: function () {
						wizard.nextStep();
					}
				}),
				endButton: new Button({
					id: "close-dialog-btn",
					text: "Close",
					press: function () {
						dialog.close();
					}
				}),
				content: [wizard]
			}).removeStyleClass("sapUiPopupWithPadding");

			var button = new Button({
				id: "open-dialog-btn",
				text: "Open Dialog",
				press: function() {
					dialog.open();
				}
			});

			dialogIntegrationTest = new Page({
				content: [button]
			});
		})();

		var masterPage = new Page({
			title: "Navigation",
			content: [
				new List({
					items: [
						new StandardListItem('fwd-wiz-sel',{
							title: "Forward wizard",
							type: "Active",
							press: function () {
								splitAppContainer.toDetail("fwd-wiz-page");
							}
						}),
						new StandardListItem('branch-wiz-sel',{
							title: "Branching wizard",
							type: "Active",
							press: function () {
								splitAppContainer.toDetail("branch-wiz-page");
							}
						}),
						new StandardListItem('bnd-wiz-sel',{
							title: "Wizard binding",
							type: "Active",
							press : function () {
								splitAppContainer.toDetail("bnd-wiz-page");
							}
						}),
						new StandardListItem('iconOnly-wiz-sel',{
							title: "Icon only wizard",
							type: "Active",
							press : function () {
								splitAppContainer.toDetail("iconOnly-wiz-page");
							}
						}),
						new StandardListItem('currentStep-wiz-sel',{
							title: "CurrentStep test",
							type: "Active",
							press : function () {
								splitAppContainer.toDetail("currentStep-wiz-page");
							}
						}),
						new StandardListItem('dialog-integration-wiz-sel',{
							title: "Dialog Integration Test",
							type: "Active",
							press : function () {
								splitAppContainer.toDetail("dialog-integration-wiz-page");
							}
						})
					]
				})
			]
		});

		splitAppContainer.addMasterPage(masterPage);

		splitAppContainer.addDetailPage(new Page("fwd-wiz-page", {
			showNavButton: jQuery.device.is.phone,
			navButtonText: "Back",
			navButtonPress: function() {
				splitAppContainer.backDetail();
			},
			content: [wizard]
		}));

		splitAppContainer.addDetailPage(new Page("bnd-wiz-page", {
			showNavButton: jQuery.device.is.phone,
			navButtonText: "Back",
			navButtonPress: function() {
				splitAppContainer.backDetail();
			},
			content: [bindableWizard]
		}));

		splitAppContainer.addDetailPage(new Page("branch-wiz-page", {
			showNavButton: jQuery.device.is.phone,
			navButtonText: "Back",
			navButtonPress: function() {
				splitAppContainer.backDetail();
			},
			content: [branchingWizard]
		}));

		splitAppContainer.addDetailPage(new Page("iconOnly-wiz-page", {
			showNavButton: jQuery.device.is.phone,
			navButtonText: "Back",
			navButtonPress: function() {
				splitAppContainer.backDetail();
			},
			content: [iconOnlyWizard]
		}));

		splitAppContainer.addDetailPage(new Page("currentStep-wiz-page", {
			showNavButton: jQuery.device.is.phone,
			navButtonText: "Back",
			navButtonPress: function() {
				splitAppContainer.backDetail();
			},
			content: [currentStepTest]
		}));
		splitAppContainer.addDetailPage(new Page("dialog-integration-wiz-page", {
			showNavButton: jQuery.device.is.phone,
			navButtonText: "Back",
			navButtonPress: function() {
				splitAppContainer.backDetail();
			},
			content: [dialogIntegrationTest]
		}));

		splitAppContainer.placeAt("content");

	});