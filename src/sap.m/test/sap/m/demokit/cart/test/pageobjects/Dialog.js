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
									//console.log(jQuery("[role*='dialog']"));
									aBtn[0].$().focusin();
									aBtn[0].$().trigger("tap");
									console.log(aBtn);
									console.log(jQuery("[role*='dialog']"));
									console.log(jQuery("[id*='sap-ui-blocklayer-popup']"));
									//this.waitFor({
									//	check: function(){
									//		return jQuery("[id*='sap-ui-blocklayer-popup']").is(":hidden");
									//	}
									//});
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
										console.log("Check for dialog existence: ", jQuery("[role*='dialog']"));
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
