sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/tnt/SideNavigation",
  "sap/tnt/NavigationList",
  "sap/tnt/NavigationListItem",
  "sap/tnt/NavigationListGroup",
  "sap/m/ToggleButton",
  "sap/ui/Device",
  "sap/m/Button",
  "sap/ui/thirdparty/jquery"
], function(JSONModel, SideNavigation, NavigationList, NavigationListItem, NavigationListGroup, ToggleButton, Device, Button, jQuery) {
  "use strict";
  // Note: the HTML page 'SideNavigation.html' loads this module via data-sap-ui-on-init

  var model = new JSONModel();
  var data = {
	  navigation: [{
		  title: 'Root Item',
		  icon: 'sap-icon://employee',
		  expanded: true
	  }, {
		  title: 'Root Item',
		  icon: 'sap-icon://building',
		  enabled: false
	  }, {
		  title: 'Root Item',
		  icon: 'sap-icon://card',
		  expanded: false,
		  items: [{
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }, {
			  title: 'Child Item'
		  }]
	  }, {
		  title: 'Root Item',
		  icon: 'sap-icon://action',
		  expanded: false,
		  items: [{
			  title: 'Child Item 1'
		  }, {
			  title: 'Child Item 2'
		  }, {
			  title: 'Child Item 3',
			  enabled: false
		  }]
	  }, {
		  title: 'Root Item',
		  icon: 'sap-icon://action-settings',
		  expanded: true,
		  items: [{
			  title: 'Child Item 1'
		  }, {
			  title: 'Child Item 2'
		  }, {
			  title: 'Child Item 3'
		  }]
	  }, {
		  title: 'Root Item',
		  icon: 'sap-icon://activate',
		  expanded: false,
		  items: [{
			  title: 'Child Item 1'
		  }, {
			  title: 'Child Item 2'
		  }, {
			  title: 'Child Item 3'
		  }]
	  }, {
		  title: 'Root Item',
		  icon: 'sap-icon://activities',
		  expanded: false,
		  items: [{
			  title: 'Child Item 1'
		  }, {
			  title: 'Child Item 2'
		  }, {
			  title: 'Child Item 3'
		  }]
	  }, {
		  title: 'Root Item',
		  icon: 'sap-icon://add',
		  expanded: false,
		  items: [{
			  title: 'Child Item 1'
		  }, {
			  title: 'Child Item 2'
		  }, {
			  title: 'Child Item 3'
		  }]
	  }, {
		  title: 'Root Item',
		  icon: 'sap-icon://arobase',
		  expanded: false,
		  items: [{
			  title: 'Child Item 1'
		  }, {
			  title: 'Child Item 2'
		  }, {
			  title: 'Child Item 3'
		  }]
	  }, {
		  title: 'Root Item',
		  icon: 'sap-icon://attachment',
		  expanded: false,
		  items: [{
			  title: 'Child Item 1'
		  }, {
			  title: 'Child Item 2'
		  }, {
			  title: 'Child Item 3'
		  }]
	  }, {
		  title: 'Root Item',
		  icon: 'sap-icon://badge',
		  expanded: false,
		  items: [{
			  title: 'Child Item 1'
		  }, {
			  title: 'Child Item 2'
		  }, {
			  title: 'Child Item 3'
		  }]
	  }, {
		  title: 'Root Item',
		  icon: 'sap-icon://basket',
		  expanded: false,
		  items: [{
			  title: 'Child Item 1'
		  }, {
			  title: 'Child Item 2'
		  }, {
			  title: 'Child Item 3'
		  }]
	  }, {
		  title: 'Root Item',
		  icon: 'sap-icon://bed',
		  expanded: false,
		  items: [{
			  title: 'Child Item 1'
		  }, {
			  title: 'Child Item 2'
		  }, {
			  title: 'Child Item 3'
		  }]
	  }, {
		  title: 'Root Item',
		  icon: 'sap-icon://bookmark',
		  expanded: false,
		  items: [{
			  title: 'Child Item 1'
		  }, {
			  title: 'Child Item 2'
		  }, {
			  title: 'Child Item 3'
		  }]
	  }
	  ],
	  fixedNavigation: [{
		  title: 'Fixed Item 1',
		  icon: 'sap-icon://employee'
	  }, {
		  title: 'Fixed Item 2',
		  icon: 'sap-icon://building'
	  }, {
		  title: 'Fixed Item 3',
		  icon: 'sap-icon://card'
	  }]
  };
  model.setData(data);

  const sideNavWithGroups = new SideNavigation("sideNavWithGroups", {
	  item: new NavigationList({
		  items: [
			  new NavigationListItem({
				  text: "Item 1",
				  icon: "sap-icon://employee"
			  }),
			  new NavigationListGroup({
				  text: "Group 1 Group 1 Group 1 Group 1 Group 1",
				  items: [
					  new NavigationListItem({
						  text: "Child Item 1",
						  icon: "sap-icon://card"
					  }),
					  new NavigationListItem({
						  text: "Child Item 2",
						  icon: "sap-icon://building"
					  })
				  ]
			  }),
			  new NavigationListGroup({
				  text: "Group 2 Group 2 Group 2 Group 2 Group 2",
				  items: [
					  new NavigationListItem({
						  text: "Child Item",
						  icon: "sap-icon://card"
					  }),
					  new NavigationListItem({
						  text: "Child Item",
						  icon: "sap-icon://building"
					  })
				  ]
			  })
		  ]
	  })
  }).placeAt("col-0-content");

  var sideNavigationWithBinding = new SideNavigation({
	  item: new NavigationList({
		  items: [
			  new NavigationListItem({
				  text: "Item 1",
				  icon: "sap-icon://employee"
			  }),
			  new NavigationListGroup({
				  text: "Group 1 Group 1 Group 1 Group 1 Group 1",
				  items: [
					  new NavigationListItem({
						  text: "Child Item 1",
						  icon: "sap-icon://card"
					  }),
					  new NavigationListItem({
						  text: "Child Item 2",
						  icon: "sap-icon://building"
					  })
				  ]
			  })
		  ]
	  })
  }).placeAt("col-1-content");

  var sideNavigationWithBinding = new SideNavigation({
	  item: new NavigationList({
		  items: {
			  template: new NavigationListItem({
				  text: '{title}',
				  icon: '{icon}',
				  enabled: '{enabled}',
				  expanded: '{expanded}',
				  items: {
					  template: new NavigationListItem({
						  text: '{title}',
						  enabled: '{enabled}'
					  }),
					  path: 'items'
				  }
			  }),

			  path: '/navigation'
		  }
	  }),
	  fixedItem: new NavigationList({
		  items: {
			  template: new NavigationListItem({
				  text: '{title}',
				  icon: '{icon}'
			  }),
			  path: '/fixedNavigation'
		  }
	  })
  }).setModel(model).placeAt('col-1-content');

  var sideNavigation = new SideNavigation({
	  expanded: false,
	  ariaLabel: "Side navigation menu with options",
	  item: new NavigationList({
		  items: new NavigationListItem({
			  text: 'Root Item',
			  icon: 'sap-icon://employee',
			  items: [
				  new NavigationListItem({
					  text: 'Child Item 1'
				  }),
				  new NavigationListItem({
					  text: 'Child Item 2'
				  }),
				  new NavigationListItem({
					  text: 'Child Item 3'
				  })
			  ]
		  })
	  }),
	  fixedItem: new NavigationList({
		  items: [
			  new NavigationListItem({
				  text: 'Root Item',
				  icon: 'sap-icon://employee'
			  })
		  ]
	  })
  }).setModel(model).placeAt('col-2-content');

  var sideNavigationNoIcons = new SideNavigation({
	  expanded: true,
	  item: new NavigationList({
		  items: new NavigationListItem({
			  text: 'Root Item',
			  items: [
				  new NavigationListItem({
					  text: 'Child Item 1'
				  }),
				  new NavigationListItem({
					  text: 'Child Item 2'
				  }),
				  new NavigationListItem({
					  text: 'Child Item 3'
				  })
			  ]
		  })
	  }),
	  fixedItem: new NavigationList({
		  items: [
			  new NavigationListItem({
				  text: 'Root Item'
			  })
		  ]
	  })
  }).setModel(model).placeAt('col-3-content');

  new ToggleButton({
	  text: "Compact Mode",
	  pressed: !Device.system.phone && jQuery("html").hasClass("sapUiSizeCompact"),
	  press: function () {
		  jQuery("body").toggleClass("sapUiSizeCompact", this.getPressed());
		  jQuery("body").toggleClass("sapUiSizeCozy", !this.getPressed());
	  }
  }).placeAt('col-0-header')

  new Button({
	  text: 'toggle expanded property',
	  press: function () {
		  sideNavWithGroups.setExpanded(!sideNavWithGroups.getExpanded());
	  }
  }).placeAt('col-0-header');

  new Button({
	  text: 'toggle expanded property',
	  press: function () {
		  sideNavigationWithBinding.setExpanded(!sideNavigationWithBinding.getExpanded());
	  }
  }).placeAt('col-1-header');

  new Button({
	  text: 'toggle expanded property',
	  press: function () {
		  sideNavigation.setExpanded(!sideNavigation.getExpanded());
	  }
  }).placeAt('col-2-header');

  new Button({
	  text: 'toggle expanded property',
	  press: function () {
		  sideNavigationNoIcons.setExpanded(!sideNavigationNoIcons.getExpanded());
	  }
  }).placeAt('col-3-header');
});