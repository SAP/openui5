sap.ui.define([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/PropertyStrictEquals'
	], function (Opa5, PropertyStrictEquals) {

		Opa5.createPageObjects({
			onTheDialog : {

				actions : {

					iPressDeleteButtonOnTheConfirmationDialog : function () {
						return this.waitFor({
								controlType : "sap.m.Button",
								matchers : new PropertyStrictEquals({name : "text", value : "Delete"}),
								success : function (aBtn) {
									aBtn[0].$().focusin();
									aBtn[0].$().trigger("tap");
									jQuery.sap.log.info(aBtn);
									jQuery.sap.log.info(jQuery("[role*='dialog']"));
									jQuery.sap.log.info(jQuery("[id*='sap-ui-blocklayer-popup']"));
								},
								errorMessage : "The delete button could not be pressed"
							}
						);
					},
					iPressCancelOnTheConfirmationDialog : function () {
						return this.waitFor({
							controlType : "sap.m.Button",
							matchers : new PropertyStrictEquals({name : "text", value : "Cancel"}),
							success : function (aBtn) {
								aBtn[0].$().focusin();
								aBtn[0].$().trigger("tap");
								this.waitFor({
									check: function(){
										jQuery.sap.log.info("Check for dialog existence: ", jQuery("[role*='dialog']"));
										return !jQuery("[role*='dialog']").length;
									}
								});
							},
							errorMessage : "The cancel button could not be pressed"
						});
					}
				},

				assertions : {

					iShouldBeTakenToTheConfirmationDialog : function () {
						return this.waitFor({
							controlType : "sap.m.Button",
							matchers : new PropertyStrictEquals({name : "text", value : "Delete"}),
							success : function (aControl) {
								Opa5.assert.ok(
									aControl,
									"The delete button was found"
								);
							},
							errorMessage : "The delete button was not found"
						});
					}
				}

			}
		});

	}
);
