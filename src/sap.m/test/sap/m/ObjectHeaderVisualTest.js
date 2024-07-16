sap.ui.define([
  "sap/m/ObjectHeader",
  "sap/m/library",
  "sap/ui/core/library",
  "sap/m/ObjectAttribute",
  "sap/m/ObjectStatus",
  "sap/m/Button",
  "sap/m/Input",
  "sap/m/HeaderContainer"
], function(ObjectHeader, mobileLibrary, coreLibrary, ObjectAttribute, ObjectStatus, Button, Input, HeaderContainer) {
  "use strict";

  // shortcut for sap.ui.core.ValueState
  const ValueState = coreLibrary.ValueState;

  // shortcut for sap.ui.core.TextDirection
  const TextDirection = coreLibrary.TextDirection;

  // shortcut for sap.m.ObjectHeaderPictureShape
  const ObjectHeaderPictureShape = mobileLibrary.ObjectHeaderPictureShape;

  // Note: the HTML page 'ObjectHeaderVisualTest.html' loads this module via data-sap-ui-on-init

  var oh1 = new ObjectHeader("oh1", {
	  responsive: true,
	  intro: "Type XS",
	  introActive: true,
	  introPress: function() {},
	  title: "Responsive Object Header fullScreenOptimized with two states",
	  titleActive: true,
	  titlePress: function() {},
	  icon: "../../sap/m/images/Woman_04.png",
	  imageShape: ObjectHeaderPictureShape.Square,
	  number: "624,00",
	  numberUnit: "Euro",
	  numberTextDirection: TextDirection.LTR,
	  fullScreenOptimized: true,
	  showMarkers: true,
	  markFlagged: true,
	  markFavorite: true,
	  numberState: ValueState.Success,
	  attributes: [
		  new ObjectAttribute({
			  title: "Manufacturer",
			  text: "ACME Corp",
			  active: true
		  }),
		  new ObjectAttribute({
			  title: "Contact",
			  text: "Denis Smith"
		  })
	  ],
	  statuses: [
		  new ObjectStatus({
			  title: "Approval",
			  text: "Pending",
			  state: ValueState.Success
		  })
	  ]
  });

  var oa1 = new ObjectAttribute({
	  title: "Owner",
	  text: "ACME Corp"
  });

  var os1 = new ObjectStatus({
	  title: "Delivered",
	  text: "Pending",
	  state: ValueState.Error
  });

  oh1.placeAt("body");

  var fullScreenBtn = new Button("change_fullscreen", {
	  text: "Toggle fullscreen mode",
	  press: function() {
			  oh1.setFullScreenOptimized(!oh1.getFullScreenOptimized());
		  }
  });

  var statesBtn = new Button("add_states", {
	  text: "Add states",
	  press: function() {
			  oh1.addAttribute(oa1);
			  oh1.addStatus(os1);
		  }
  });

  var emptyAttribute = new ObjectAttribute({
	  title: "",
	  text: ""
  });

  var oneStateButton = new Button("one_state_empty_attribute", {
	  text: "Add one state and one empty attribute",
	  press: function() {
		  oh1.removeAllAttributes();
		  oh1.removeAllStatuses();
			  oh1.addAttribute(emptyAttribute);
			  oh1.addStatus(os1);
		  }
  });

  var typeBtn = new Button("change_OH_type", {
	  text: "Toggle responsive",
	  press: function() {
			  oh1.setResponsive(!oh1.getResponsive());
		  }
  });

  var shapeBtn = new Button("change_image_shape", {
	  text: "Set circle shape image",
	  press: function() {
			  oh1.setImageShape(ObjectHeaderPictureShape.Circle);
		  }
  });

  var condBtn = new Button("change_to_condensed", {
	  text: "Set to condensed mode",
	  press: function() {
			  oh1.setCondensed(true);
		  }
  });

  fullScreenBtn.placeAt("body");
  statesBtn.placeAt("body");
  oneStateButton.placeAt("body");
  typeBtn.placeAt("body");
  shapeBtn.placeAt("body");
  condBtn.placeAt("body");

  var oInput = new Input("typeSpace", {value: "test"}),
	  oOH = new ObjectHeader("ohSpace", {
		  title : "Test pressing space key inside input",
		  responsive : true,
		  headerContainer: [
			  new HeaderContainer({
				  content: [
					  oInput
				  ]
			  })
		  ]
	  });

  oOH.placeAt("body");
});