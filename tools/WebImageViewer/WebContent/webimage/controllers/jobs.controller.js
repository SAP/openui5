sap.ui.controller('webimage.controllers.jobs', {

	onInit: function() {
		this.chart = this.getView().byId('jobsChart');
		this.table = this.byId('table');
		this._links = [{
			text: "Jobs",
			key: "jobs"
		}];
		this.byId('brd_thd').setItems(this._links);
		sap.ui.commons.Link.prototype.onAfterRendering = function() {
			if (!this.getEnabled()) {
				this.$().css('color', 'black');
				this.$().css('text-decoration', 'none');
			}
		};
	},

	onBeforeRendering: function() {
		var ctrl = this;
		utils.storage.loadJobData(function() {
			ctrl._refreshData();
		});

	},

	_refreshData: function() {
		this.table.sort(this.byId('fail_col'), 'Descending');
		var data = sap.ui.getCore().getModel().getData();
		//let table show all job data
		data.jobs = data.jobData;
		data.brdPath = this._links;
		sap.ui.getCore().getModel().updateBindings();
	},

	chartHandle: function(evt) {
		var data = sap.ui.getCore().getModel().getData();
		var indices = this.chart.getSelectedIndices();
		data.jobs = [];
		$.each(indices, function() {
			data.jobs.push(data.jobData[this]);
		});


		sap.ui.getCore().getModel().updateBindings();
	},

	displayJobDetail: function(oEvent) {
		var obj = oEvent.getSource().getBindingContext().getObject();
		var bus = sap.ui.getCore().getEventBus();
		var brdpath = this._links.slice();
		brdpath.push({
			text: obj.platform + '_' + obj.browser + '_' + obj.theme + '_' + obj.rtl,
			key: "jobDetail"
		});
		bus.publish('nav', 'to', {
			name: 'jobDetail',
			data: {
				context: oEvent.getSource().getBindingContext(),
				brdPath: brdpath
			},
		});
	},

	colHandle: function(evt) {
		var col = evt.getParameter('column');
		col.toggleSort();
	},

	formatEnable: function(fail) {
		return fail !== 0;
	}

});