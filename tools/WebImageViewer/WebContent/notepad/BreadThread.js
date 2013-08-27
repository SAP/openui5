jQuery.sap.declare("notepad.BreadThread");
sap.ui.core.Control.extend("notepad.BreadThread", {
	metadata : {
		properties : {
			"width" : {
				type : "sap.ui.core.CSSSize",
			},
		},
		defaultAggregation : "items",
		aggregations : {
			"items" : {
				type : "sap.ui.core.Item",
				multiple : true,
				singularName : "item"
			},
		},
		events : {
			"select" : {},
		}
	},

	setItems : function(items) {
		this.destroyItems();
		var th = this;
		$.each(items || [], function() {
			th.addItem(this);
		});

	},

	destroyItems : function() {
		this.destroyAggregation('items');
		$.each(this._links || [], function() {
			this.destroy();
		});

		return this
	},

	addItem : function(item) {
		if(this.lastItem) {
			this.lastItem.setEnabled(true);
		}
		if( item instanceof sap.ui.core.Item) {
			this.lastItem = item;
		} else {
			this.lastItem = new sap.ui.core.Item(item);
		}
		this.lastItem.setEnabled(false);
		this.addAggregation("items", this.lastItem);
	},

	renderer : function(rm, ctrl) {
		rm.write("<div");
		rm.writeControlData(ctrl);
		rm.addClass("npBreadThread");
		rm.writeClasses();
		rm.addStyle("width", ctrl.getWidth());
		rm.writeStyles();
		rm.write(">");

		//links
		var items = ctrl.getAggregation('items') || [], btn;
		ctrl._links = [];
		$.each(items, function(i, item) {
			btn = new sap.ui.commons.Button({
				lite : true,
				text : item.getText(),
				enabled : item.getEnabled(),
				press : function() {
					ctrl.fireSelect({
						item : item,
						key : item.getKey()
					});
				}

			}).addStyleClass('nav-btn');
			ctrl._links.push(btn);
			rm.renderControl(btn);
			if(i < items.length - 1) {
				rm.write('<span');
				rm.addClass('nav-division');
				rm.writeClasses();
				rm.write('>></span>');
			}
		});


		rm.write("</div>");
	},

	exit : function() {
		$.each(this._links, function() {
			this.destroy();
		});

	}

});
