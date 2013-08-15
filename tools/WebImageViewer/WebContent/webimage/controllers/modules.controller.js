sap.ui.controller("webimage.controllers.modules", {

	onInit : function() {
		this._links = [{
			text : "Modules",
			key : "modules"
		}];
		this.byId('brd_thd').setItems(this._links);
	},

	onBeforeRendering : function() {
		utils.storage.loadCategoryData(function() {
		});

	},

	displayModuleDetail : function(oEvent) {
		var ctt = oEvent.getSource().getBindingContext()
		var bus = sap.ui.getCore().getEventBus();

		var bp = this._links.slice();
		bp.push({
			text : ctt.getObject().categoryName,
			key : 'moduleDetail'
		});

		bus.publish('nav', 'to', {
			name : 'moduleDetail',
			data : {
				context : ctt,
				brdPath : bp
			},
		});
	},

	colHandle : function(evt) {
		var col = evt.getParameter('column');
		col.toggleSort();
	},

	formatEnable : function(fail) {
		return fail !== 0;
	}

});
