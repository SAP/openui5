sap.ui.define([
  "sap/ui/commons/layout/MatrixLayout",
  "sap/m/Label",
  "sap/m/Button",
  "sap/ui/commons/layout/MatrixLayoutCell",
  "sap/ui/core/Icon",
  "sap/ui/layout/FixFlex",
  "sap/ui/layout/HorizontalLayout",
  "sap/ui/layout/VerticalLayout",
  "sap/ui/layout/form/Form",
  "sap/ui/layout/form/GridLayout",
  "sap/ui/layout/form/FormContainer",
  "sap/ui/layout/form/FormElement",
  "sap/ui/table/Table",
  "sap/ui/table/Column",
  "sap/ui/unified/FileUploader",
  "sap/m/BusyIndicator",
  "sap/m/Bar",
  "sap/m/CheckBox",
  "sap/m/Carousel",
  "sap/m/FacetFilter",
  "sap/m/FacetFilterList",
  "sap/m/FeedInput",
  "sap/m/FlexBox",
  "sap/m/IconTabBar",
  "sap/m/Image",
  "sap/m/Input",
  "sap/m/Link",
  "sap/m/List",
  "sap/m/StandardListItem",
  "sap/m/NavContainer",
  "sap/m/ObjectAttribute",
  "sap/m/ObjectIdentifier",
  "sap/m/ObjectNumber",
  "sap/m/ObjectStatus",
  "sap/m/P13nColumnsPanel",
  "sap/m/P13nFilterPanel",
  "sap/m/P13nGroupPanel",
  "sap/m/P13nPanel",
  "sap/m/P13nSortPanel",
  "sap/m/Panel",
  "sap/m/ProgressIndicator",
  "sap/m/PullToRefresh",
  "sap/m/RadioButton",
  "sap/m/RadioButtonGroup",
  "sap/m/RatingIndicator",
  "sap/m/ScrollContainer",
  "sap/m/SearchField",
  "sap/m/SegmentedButton",
  "sap/m/SegmentedButtonItem",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/SelectList",
  "sap/m/Slider",
  "sap/m/Switch",
  "sap/m/Text",
  "sap/m/Token",
  "sap/m/Tokenizer",
  "sap/m/Toolbar",
  "sap/ui/thirdparty/jquery"
], function(
  MatrixLayout,
  Label,
  Button,
  MatrixLayoutCell,
  Icon,
  FixFlex,
  HorizontalLayout,
  VerticalLayout,
  Form,
  GridLayout,
  FormContainer,
  FormElement,
  Table,
  Column,
  FileUploader,
  BusyIndicator,
  Bar,
  CheckBox,
  Carousel,
  FacetFilter,
  FacetFilterList,
  FeedInput,
  FlexBox,
  IconTabBar,
  Image,
  Input,
  Link,
  List,
  StandardListItem,
  NavContainer,
  ObjectAttribute,
  ObjectIdentifier,
  ObjectNumber,
  ObjectStatus,
  P13nColumnsPanel,
  P13nFilterPanel,
  P13nGroupPanel,
  P13nPanel,
  P13nSortPanel,
  Panel,
  ProgressIndicator,
  PullToRefresh,
  RadioButton,
  RadioButtonGroup,
  RatingIndicator,
  ScrollContainer,
  SearchField,
  SegmentedButton,
  SegmentedButtonItem,
  Select,
  Item,
  SelectList,
  Slider,
  Switch,
  Text,
  Token,
  Tokenizer,
  Toolbar,
  jQuery
) {
  "use strict";
  // Note: the HTML page 'InvisibleControls.html' loads this module via data-sap-ui-on-init

  var aInvisibleControls = [];
  var oLayout = new MatrixLayout({
	  width: "95%"
  }).addStyleClass("displayTable").addDelegate({
	  onAfterRendering: function() {
		  var $Status = jQuery("#status_renderings");
		  $Status.text(parseInt($Status.text()) + 1);
	  }
  });

  function toggleVisible(i, oControl) {
	  oControl.setVisible(!oControl.getVisible());
  }

  function toggleAllVisible() {
	  jQuery.each(aInvisibleControls, toggleVisible);
  }

  function addRow(sTitle, oControl) {
	  var oInvisibleControl = oControl.clone().setVisible(false);
	  aInvisibleControls.push(oInvisibleControl);

	  oLayout.createRow(
		  new Label({ text: sTitle }),
		  oControl,
		  oInvisibleControl,
		  new Button({
			  text: "toggle",
			  press: function() {
				  toggleVisible(0, oInvisibleControl);
			  }
		  })
	  );
  }

  function addHeadingRow() {
	  var aRowArgs = [];

	  for (var i = 0; i < arguments.length; i++) {
		  var oContent = arguments[i];
		  if (typeof oContent === "string") {
			  oContent = new Label({text: oContent});
		  }
		  var oCell = new MatrixLayoutCell({content: oContent});
		  oCell.addStyleClass("heading");
		  aRowArgs.push(oCell);
	  }

	  switch (arguments.length) {
		  case 1:
			  oCell.setColSpan(4);
			  oCell.addStyleClass("groupsSeparator");
	  }

	  return oLayout.createRow.apply(oLayout, aRowArgs);
  }


  addHeadingRow(
	  "Control name",
	  "Visible",
	  "Invisible",
	  new Button({ text: "Toggle All", press: toggleAllVisible })
  );

  oLayout.getRows()[0].addStyleClass("firstRow");

  oLayout.placeAt("uiArea1");

  addHeadingRow("sap.ui.core");
  addRow("core/Icon", new Icon({src: "sap-icon://menu"}));

  addHeadingRow("sap.ui.layout");
  addRow("layout/FixFlex", new FixFlex({ fixContent: [new Button({ text: "A"}), new Button({ text: "B"})] }));
  addRow("layout/HorizontalLayout", new HorizontalLayout({ content: [new Button({ text: "A"}), new Button({ text: "B"})] }));
  addRow("layout/VerticalLayout", new VerticalLayout({ content: [new Button({ text: "A"}), new Button({ text: "B"})] }));

  addHeadingRow("sap.ui.layout.form");
  addRow("layout.form/Form", new Form({
	  title: "Test",
	  layout: new GridLayout(),
	  formContainers: [
		  new FormContainer({
			  formElements: [
				  new FormElement({
					  label: "A",
					  fields: [new Button({ text: "A"})]
				  })
			  ]
		  })
	  ]
  }));

  addHeadingRow("sap.ui.table");
  addRow("table/Table", new Table({
	  columns: [
		  new Column({
			  label: new Label({text: "Test"})
		  })
	  ]
  }));

  addHeadingRow("sap.ui.unified");
  addRow("unified/FileUploader", new FileUploader());


  addHeadingRow("sap.m");
  addRow("m/BusyIndicator", new BusyIndicator());
  addRow("m/Bar", new Bar({contentLeft: new Button({ text: "A"}), contentMiddle: new Button({ text: "B"}), contentRight: new Button({ text: "C"})}));
  addRow("m/Button", new Button({text: "A"}));
  addRow("m/CheckBox", new CheckBox({text: "A"}));
  addRow("m/Carousel", new Carousel({pages: [new Button({ text: "A"}), new Button({ text: "B"})]}));
  addRow("[TODO: Leads to double rendering] m/FacetFilter", new FacetFilter({lists: [new FacetFilterList({title: "A"}), new FacetFilterList({title: "B"})]}));
  addRow("m/FacetFilterList", new FacetFilterList({title: "A"}));
  addRow("m/FeedInput", new FeedInput({value: "A"}));
  addRow("m/FlexBox", new FlexBox({items: [new Button({ text: "A"}), new Button({ text: "B"})]}));
  addRow("m/IconTabBar", new IconTabBar({content: [new Button({ text: "A"}), new Button({ text: "B"})]}));
  // addRow("m/IconTabHeader", new sap.m.IconTabHeader({items: [new sap.m.IconTabFilter({ text: "A"}), new sap.m.IconTabFilter({ text: "B"})]}));
  addRow("m/Image", new Image({src: "https://sdk.openui5.org/resources/sap/ui/core/mimes/logo/icotxt_white_220x72_blue.png"}));
  addRow("m/Input(Base)", new Input({value: "A"}));
  addRow("m/Label", new Label({text: "A"}));
  addRow("m/Link", new Link({text: "Link", href: "https://sdk.openui5.org/resources/sap/ui/core/mimes/logo/icotxt_white_220x72_blue.png"}));
  addRow("m/List(Base),ListItem(Base)", new List({items: [new StandardListItem({title: "A"}), new StandardListItem({title: "B"})]}));
  addRow("m/NavContainer", new NavContainer({height: "20px", initialPage: "navpage1", pages: [new Button("navpage1", { text: "A"}), new Button({ text: "B"})]}));
  addRow("m/ObjectAttribute", new ObjectAttribute({text: "A"}));
  // addRow("m/ObjectHeader", new sap.m.ObjectHeader({title: "A"})); // TODO: Uses its own invisible logic in renderer, talk to owner..
  addRow("m/ObjectIdentifier", new ObjectIdentifier({text: "A"}));
  addRow("m/ObjectNumber", new ObjectNumber({number: 1, unit: "A"}));
  addRow("m/ObjectStatus", new ObjectStatus({text: "A"}));
  addRow("m/P13nColumnsPanel", new P13nColumnsPanel({title: "A"}));
  addRow("m/P13nFilterPanel", new P13nFilterPanel({title: "A"}));
  addRow("m/P13nGroupPanel", new P13nGroupPanel({title: "A"}));
  addRow("m/P13nPanel", new P13nPanel({title: "A"}));
  addRow("m/P13nSortPanel", new P13nSortPanel({title: "A"}));
  addRow("m/Panel", new Panel({headerText: "A"}));
  addRow("m/ProgressIndicator", new ProgressIndicator({percentValue: 33, displayValue: "33%"}));
  addRow("m/PullToRefresh", new PullToRefresh({description: "A"}));
  addRow("m/RadioButton", new RadioButton({text: "A"}));
  addRow("m/RadioButtonGroup", new RadioButtonGroup({buttons: [new RadioButton({text: "A"}), new RadioButton({text: "B"})]}));
  addRow("m/RatingIndicator", new RatingIndicator({text: "A"}));
  addRow("m/ScrollContainer", new ScrollContainer({content: [new Button({text: "A"})]}));
  addRow("m/SearchField", new SearchField({value: "A"}));
  addRow("m/SegmentedButton", new SegmentedButton({items: [new SegmentedButtonItem({text: "A"}), new SegmentedButtonItem({text: "B"})]}));
  addRow("m/Select", new Select({items: [new Item({text: "A"}), new Item({text: "B"})]}));
  addRow("m/SelectList", new SelectList({items: [new Item({text: "A"}), new Item({text: "B"})]}));
  addRow("m/Slider", new Slider());
  addRow("m/Switch", new Switch());
  addRow("m/Text", new Text({text: "A"}));
  addRow("m/Token", new Token({text: "A"}));
  addRow("m/Tokenizer", new Tokenizer({tokens: [new Token({text: "A"}), new Token({text: "B"})]}));
  addRow("m/Toolbar", new Toolbar({content: [new Button({text: "A"}), new Button({text: "B"})]}));
});