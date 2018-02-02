/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/dt/ScrollbarSynchronizer"
],
function(
	ScrollbarSynchronizer
) {
	"use strict";

	QUnit.start();

	QUnit.module("Given three elements with vertical and horizontal scrollbars...", {

		beforeEach : function(assert) {
			var $content = jQuery("#content");

			var fnCreatePanelWithBiggerSubPanel = function(sId, sColour){
				var $Panel = jQuery('<div/>', {
					id: sId
					}).css({
						'max-width': '100px',
						'max-height': '100px',
						'overflow': 'auto',
						'display': 'inline-block'
					}).appendTo($content);

				jQuery('<div/>', {
						id: sId + '-sub'
					}).css({
						'width': '200px',
						'height': '200px',
						'overflow': 'auto',
						'background': sColour
					}).appendTo($Panel);

				return $Panel;
			};

			this.$Panel1 = fnCreatePanelWithBiggerSubPanel('panel1', '#555');
			this.$Panel2 = fnCreatePanelWithBiggerSubPanel('panel2', '#abc');
			this.$Panel3 = fnCreatePanelWithBiggerSubPanel('panel3', '#def');

			this.oScrollbarSynchronizer = new ScrollbarSynchronizer();
		},
		afterEach : function() {
			this.$Panel1.remove();
			this.$Panel2.remove();
			this.$Panel3.remove();

			this.oScrollbarSynchronizer.destroy();
		}
	}, function(assert){
		QUnit.test("when panel1 and panel2 are both added as targets to the ScrollbarSynchronizer", function(assert) {
			var fnDone = assert.async();

			this.oScrollbarSynchronizer.addTarget(this.$Panel1[0]);
			this.oScrollbarSynchronizer.addTarget(this.$Panel2[0]);

			assert.deepEqual(this.oScrollbarSynchronizer.getTargets(), [this.$Panel1[0], this.$Panel2[0]], "then the function getTargets returns both elements");

			this.$Panel1.scrollTop(20);
			this.$Panel1.scrollLeft(30);
			setTimeout(function(){
				assert.equal(this.$Panel2.scrollTop(), 20, "then vertical scrolling on Panel1 is reflected on Panel2");
				assert.equal(this.$Panel2.scrollLeft(), 30, "then horizontal scrolling on Panel1 is reflected on Panel2");
				this.$Panel2.scrollTop(50);
				this.$Panel2.scrollLeft(70);
				setTimeout(function(){
					assert.equal(this.$Panel1.scrollTop(), 50, "then vertical scrolling on Panel2 is reflected on Panel1");
					assert.equal(this.$Panel1.scrollLeft(), 70, "then horizontal scrolling on Panel2 is reflected on Panel1");
					fnDone();
				}.bind(this), 200);
			}.bind(this), 200);
		});

		QUnit.test("when panel2 is removed from the targets", function(assert) {
			var fnDone = assert.async();

			this.oScrollbarSynchronizer.addTarget(this.$Panel1[0]);
			this.oScrollbarSynchronizer.addTarget(this.$Panel2[0]);
			this.$Panel1.scrollTop(20);
			this.$Panel1.scrollLeft(30);

			setTimeout(function(){
				this.oScrollbarSynchronizer.removeTarget(this.$Panel2[0]);

				this.$Panel1.scrollTop(40);
				this.$Panel1.scrollLeft(50);
				setTimeout(function(){
					assert.equal(this.$Panel2.scrollTop(), 20, "then further vertical scrolling on Panel1 is not reflected on Panel2");
					assert.equal(this.$Panel2.scrollLeft(), 30, "then further horizontal scrolling on Panel1 is not reflected on Panel2");

					this.$Panel2.scrollTop(80);
					this.$Panel2.scrollLeft(90);
					setTimeout(function(){
						assert.equal(this.$Panel1.scrollTop(), 40, "then vertical scrolling on Panel2 is not reflected on Panel1");
						assert.equal(this.$Panel1.scrollLeft(), 50, "then horizontal scrolling on Panel2 is not reflected on Panel1");
						fnDone();
					}.bind(this), 200);
				}.bind(this), 200);
			}.bind(this), 200);
		});

		QUnit.test("when panel1 and panel2 are both added as targets, then we set targets to panel1 and panel3", function(assert) {
			var fnDone = assert.async();

			this.oScrollbarSynchronizer.addTarget(this.$Panel1[0]);
			this.oScrollbarSynchronizer.addTarget(this.$Panel2[0]);

			this.$Panel1.scrollTop(20);
			this.$Panel1.scrollLeft(30);

			setTimeout(function(){
				this.oScrollbarSynchronizer.setTargets([this.$Panel1[0], this.$Panel3[0]]);

				this.$Panel1.scrollTop(40);
				this.$Panel1.scrollLeft(50);
				setTimeout(function(){
					assert.equal(this.$Panel3.scrollTop(), 40, "then vertical scrolling on Panel1 is reflected on Panel3");
					assert.equal(this.$Panel3.scrollLeft(), 50, "then horizontal scrolling on Panel1 is reflected on Panel3");
					assert.equal(this.$Panel2.scrollTop(), 20, "then vertical scrolling on Panel1 is no longer reflected on Panel2");
					assert.equal(this.$Panel2.scrollLeft(), 30, "then horizontal scrolling on Panel1 is no longer reflected on Panel2");
					fnDone();
				}.bind(this), 200);
			}.bind(this), 200);
		});

		QUnit.test("when panel1 is already scrolled when it is added as a target", function(assert) {
			var fnDone = assert.async();

			this.$Panel1.scrollTop(20);
			this.$Panel1.scrollLeft(30);

			this.oScrollbarSynchronizer.addTarget(this.$Panel1[0]);
			this.oScrollbarSynchronizer.addTarget(this.$Panel2[0]);

			setTimeout(function(){
				assert.equal(this.$Panel2.scrollTop(), 20, "then vertical scrolling on Panel1 is reflected on Panel2");
				assert.equal(this.$Panel2.scrollLeft(), 30, "then horizontal scrolling on Panel1 is reflected on Panel2");
				fnDone();
			}.bind(this), 200);
		});

		QUnit.test("when panel1 is a target, gets scrolled and then panel2 is added as a target", function(assert) {
			var fnDone = assert.async();

			this.oScrollbarSynchronizer.addTarget(this.$Panel1[0]);
			this.$Panel1.scrollTop(20);
			this.$Panel1.scrollLeft(30);
			this.oScrollbarSynchronizer.addTarget(this.$Panel2[0]);

			setTimeout(function(){
				assert.equal(this.$Panel2.scrollTop(), 20, "then vertical scrolling on Panel1 is reflected on Panel2");
				assert.equal(this.$Panel2.scrollLeft(), 30, "then horizontal scrolling on Panel1 is reflected on Panel2");
				fnDone();
			}.bind(this), 200);
		});

		QUnit.test("when Panel1 is added as Target and function 'hasTarget' is called with Panel1", function(assert) {
			this.oScrollbarSynchronizer.addTarget(this.$Panel1[0]);
			assert.ok(this.oScrollbarSynchronizer.hasTarget(this.$Panel1[0]), "then the function returns true");

			this.oScrollbarSynchronizer.removeTarget(this.$Panel1[0]);

			assert.notOk(this.oScrollbarSynchronizer.hasTarget(this.$Panel1[0]), "and after removing it from targets the function returns false");
		});

		QUnit.test("when Panel3 is added as Target and then removed from the DOM", function(assert) {
			this.oScrollbarSynchronizer.addTarget(this.$Panel3[0]);

			this.$Panel3.remove();

			this.oScrollbarSynchronizer.addTarget(this.$Panel1[0]);

			assert.deepEqual(this.oScrollbarSynchronizer.getTargets(), [this.$Panel1[0]], "then the function getTargets returns only Panel1");
		});

		QUnit.test("when addTarget is called without a parameter", function(assert) {
			this.oScrollbarSynchronizer.addTarget();

			assert.equal(this.oScrollbarSynchronizer.getTargets().length, 0, "then the function getTargets returns an empty array");
		});
	});
});