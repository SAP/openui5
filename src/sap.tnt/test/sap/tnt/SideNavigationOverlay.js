sap.ui.define([
	"sap/ui/core/mvc/XMLView"
], async function (XMLView) {
	"use strict";

	sap.ui.define("myView/Template.controller", [
		"sap/m/Button",
		"sap/m/Dialog",
		"sap/m/ResponsivePopover",
		"sap/m/Text",
		"sap/tnt/NavigationList",
		"sap/tnt/NavigationListGroup",
		"sap/tnt/NavigationListItem",
		"sap/tnt/SideNavigation",
		"sap/ui/Device",
		"sap/ui/core/InvisibleText",
		"sap/ui/core/mvc/Controller"
	], function(
		Button,
		Dialog,
		ResponsivePopover,
		Text,
		NavigationList,
		NavigationListGroup,
		NavigationListItem,
		SideNavigation,
		Device,
		InvisibleText,
		Controller
	) {
		return Controller.extend("myView.Template", {
			onInit: function (oEvent) {
				this.oInvText = new InvisibleText({id: this.oView.getId() + "-ariaText", text: "Main Navigation"}).toStatic();

				this.oInvDescText = new InvisibleText({id: this.oView.getId() + "-ariaDescText", text: "This is the main navigation. It contains navigation items that may have child items. Activating a navigation item opens a new page or dialog within this browser window or gives access to the child items. Navigation items can be grouped, too."}).toStatic();

				this.oSideNav = new SideNavigation({
					selectedKey: "page3",
					design: "Plain",
					itemSelect: this.onItemSelect.bind(this),
					item: new NavigationList("NL", {
						items: [
						new NavigationListItem({  key: "page1", text: "Home", icon: "sap-icon://home" }),
						new NavigationListGroup({

							text: "New",
							items: [
								new NavigationListItem({  key: "page2", text: "Cards", icon: "sap-icon://card" }),
								new NavigationListItem({ text: "Building", icon: "sap-icon://building" })
							]
						}),
						new NavigationListGroup({
							text: "Recently used with a long overflowing title",
							items: [
								new NavigationListItem({ text: "Example", icon: "sap-icon://example" }),
								new NavigationListItem({ text: "Heatmap Chart", icon: "sap-icon://heatmap-chart" }),
								new NavigationListItem({
									text: "Machine",
									icon: "sap-icon://machine",
									items: [
										new NavigationListItem({ text: "Supply Chain" }),
										new NavigationListItem({ selectable: false, href: "https://sap.com", target: "_blank", press: this.onItemSelect.bind(this), text: "External Link", icon: "sap-icon://attachment" }),
										new NavigationListItem({ text: "Schematics" })
									]
								})
							]
						}),
						new NavigationListItem({ key: "page3", text: "People", icon: "sap-icon://people-connected" }),
						new NavigationListItem({ key: "page4", text: "Overview Chart", icon: "sap-icon://overview-chart" }),
						new NavigationListItem({ text: "Managing My Area", icon: "sap-icon://kpi-managing-my-area" }),
						new NavigationListItem({ text: "Curriculum", icon: "sap-icon://curriculum" }),
						new NavigationListItem({ text: "Flight", icon: "sap-icon://flight" }),
						new NavigationListItem({ text: "Radar Chart", icon: "sap-icon://multiple-radar-chart" }),
						new NavigationListItem({ text: "Lateness", icon: "sap-icon://lateness" }),
						new NavigationListItem({ selectable: false, href: "https://sap.com", target: "_blank", press: this.onItemSelect.bind(this), text: "External Link", icon: "sap-icon://attachment" }),

						new NavigationListItem({ text: "Map", icon: "sap-icon://map-2" }),
						new NavigationListItem({ selectable: false, href: "https://sap.com", target: "_blank", press: this.onItemSelect.bind(this), text: "External Link", icon: "sap-icon://attachment" }),

						new NavigationListItem({ text: "Nutrition Activity", icon: "sap-icon://nutrition-activity" }),
						new NavigationListItem({ text: "Box", icon: "sap-icon://sap-box" }),
						new NavigationListItem({ text: "Pool", icon: "sap-icon://pool" }),
						new NavigationListGroup({
							text: "Restricted",
							enabled: false,
							items: [
								new NavigationListItem({ text: "Scissors", icon: "sap-icon://scissors" }),
								new NavigationListItem({ text: "Running", icon: "sap-icon://physical-activity" })
							]
						}),
						new NavigationListItem({ selectable: false, href: "https://sap.com", target: "_blank", press: this.onItemSelect.bind(this), text: "External Link", icon: "sap-icon://attachment" }),
						new NavigationListItem({ text: "Passenger Train", icon: "sap-icon://passenger-train" }),
						new NavigationListItem({
							text: "Mileage",
							icon: "sap-icon://mileage",
							items: [
								new NavigationListItem({ selectable: false, href: "https://sap.com", target: "_blank", press: this.onItemSelect.bind(this), text: "External Link", icon: "sap-icon://attachment" }),
								new NavigationListItem({ text: "Driven" }),
								new NavigationListItem({ text: "Walked" }),
								new NavigationListItem({ selectable: false, href: "https://sap.com", text: "No Target Link", press: this.onItemSelect.bind(this), icon: "sap-icon://attachment" })

							]
						})
					]
						}),
					fixedItem: new NavigationList({
							items: [
								new NavigationListItem({
									ariaHasPopup:"Dialog",
									id:"quickCreate",
									press: this.onQuickActionPress.bind(this),
									design:"Action",
									selectable: false,
									text: "Quick Create",
									icon:"sap-icon://write-new"
								}),
								new NavigationListItem({
									text: "Managing My Area",
									icon:"sap-icon://kpi-managing-my-area"
								}),
								new NavigationListItem({
									text: "Flight",
									icon:"sap-icon://flight"
								})
							]
						})
				});
			},

			onItemSelect: function (oEvent) {
				var oItem = oEvent.getParameter("item");
				var sKey = oItem.getKey();

				if (sKey && oItem.getSelectable()) {
					this.byId("pageContainer").to(this.byId(sKey));
				}

				if (this._oPopover.isOpen()) {
					this._oPopover.close();
				}
			},

			onQuickActionPress: function () {
				if (!this.oDefaultDialog) {
					this.oDefaultDialog = new Dialog({
						title: "Create Item",
						type: "Message",
						content: new Text({
							text: "Create New Navigation List Item"
						}),
						beginButton: new Button({
							type: "Emphasized",
							text: "Create",
							press: function () {
								this.oDefaultDialog.close();
							}.bind(this)
						}),
						endButton: new Button({
							text: "Cancel",
							press: function () {
								this.oDefaultDialog.close();
							}.bind(this)
						})
					});
					this.getView().addDependent(this.oDefaultDialog);
				}
				this.oDefaultDialog.open();

				if (this._oPopover.isOpen()) {
					//itemPressed event on side navigation will be good to close the popover for externalLinks, selections and actions
					this._oPopover.close();
				}
			},

			onToggleSideNav: function (oEvent) {
				if (!this._oPopover) {
					this._oPopover = new ResponsivePopover({
						ariaLabelledBy: this.oInvText.getId(),
						ariaDescribedBy: this.oInvDescText.getId(),
						placement: "Bottom",
						showHeader: false,
						content: this.oSideNav,
						verticalScrolling: false
					});
					this._oPopover.setShowHeader(Device.system.phone);
				}

				if (this._oPopover.isOpen()) {
					this._oPopover.close();
				} else {
					this._oPopover.openBy(oEvent.getSource());
				}
			}
		});
	});

	var oView = await XMLView.create({
		definition: `
			<mvc:View
				height="100%"
				controllerName="myView.Template"
				xmlns:core="sap.ui.core"
				xmlns:mvc="sap.ui.core.mvc"
				xmlns="sap.m"
				xmlns:tnt="sap.tnt">
				<App>
					<Page id="myPage" title="Side Navigation Example"  enableScrolling="true" class="sapUiResponsivePadding--header">
						<customHeader>
							<Bar>
								<contentLeft>
									<Button icon="sap-icon://menu2" press="onToggleSideNav" />
										<Title text="Title"/>
								</contentLeft>
							</Bar>
						</customHeader>
						<content>
							<HBox fitContainer="true" renderType="Bare">
								<VBox renderType="Bare" class="sideNavContianer">
								</VBox>
								<VBox renderType="Bare">
									<NavContainer id="pageContainer" initialPage="page3">
										<pages>
											<ScrollContainer
												id="page1"
												horizontal="false"
												vertical="true"
												height="100%"
												class="sapUiContentPadding">
												<Text text="This is page 1" />
											</ScrollContainer>
											<ScrollContainer
												id="page2"
												horizontal="false"
												vertical="true"
												height="100%"
												class="sapUiContentPadding">
												<Text text="This is page 2" />
											</ScrollContainer>
											<ScrollContainer
												id="page3"
												horizontal="false"
												vertical="true"
												height="100%"
												class="sapUiContentPadding">
												<Text text="Lorem ipsum dolor sit amet, consectetur adipisicing elit. A accusantium architecto autem dicta dolor dolores dolorum earum enim error esse eum ex exercitationem explicabo facilis fugit ipsum maiores, necessitatibus nemo nihil numquam odio officiis optio possimus quas qui quod quos, reiciendis similique sunt tempore tenetur ut vitae voluptate. Ab accusantium, aperiam, asperiores dolores fuga id incidunt itaque numquam placeat quidem recusandae veritatis voluptatibus. Delectus, dicta ea harum hic illo necessitatibus nisi odit quidem quo quod. Architecto at delectus error eum laborum modi, necessitatibus optio perspiciatis quaerat quam, quas quo recusandae repellat sed totam, veritatis voluptas voluptatem voluptates. Accusamus aliquid, asperiores assumenda consequuntur corporis cum debitis delectus doloremque earum esse explicabo fugiat id inventore iste laborum modi molestiae neque nihil obcaecati officia omnis porro quae quasi repellat sed sunt suscipit unde vel veritatis voluptatem! Dolor dolorum quis ratione. Aliquam consectetur eius facilis placeat quibusdam sint tenetur. Ab aliquid at, fuga qui quia soluta veritatis. Amet, eius est exercitationem incidunt magnam necessitatibus porro provident quas tempore velit. Aperiam architecto commodi deleniti dicta eius facere nemo possimus sit voluptate voluptatem. Accusamus ad, alias architecto autem blanditiis culpa cumque ea enim ex hic iste laboriosam laborum laudantium magni, maxime minus necessitatibus quibusdam quisquam repudiandae sapiente ullam vel velit. Adipisci aliquid amet, architecto at atque blanditiis corporis cupiditate dolorem ea enim esse ex, illum iste libero, magnam minus molestiae optio porro quaerat sed tempore vero voluptates! A ad alias aspernatur cumque cupiditate dicta doloremque eos ipsam maxime, molestias necessitatibus, nisi nulla quasi, qui quod sed sequi ut veritatis. Culpa et laboriosam maiores nemo nisi odit officiis praesentium. Animi cumque dolore eaque enim eveniet, hic neque omnis quae quo temporibus. Assumenda at aut dicta ducimus eius facere, laudantium maiores minima molestiae quis, quod saepe sint veniam? Ab ad animi architecto aut dolorem, earum ex exercitationem facere illum ipsum nisi officiis ratione repudiandae suscipit voluptas. Animi commodi dolores eveniet facere id nesciunt non provident vero. A adipisci aliquam architecto aspernatur assumenda atque autem blanditiis consequuntur debitis dolorem dolorum ducimus, ea earum eos explicabo fuga iste itaque iure iusto labore laudantium modi nobis pariatur porro quam repellat tempore unde ut voluptatem voluptatum? Doloribus ea eius excepturi explicabo iure molestias odit omnis pariatur qui rem, similique sunt veniam voluptatum. Adipisci aliquam amet aspernatur commodi, corporis cum dolor doloribus dolorum eos eum facere labore magni minus natus nostrum perspiciatis, reiciendis rerum sit soluta tempora tenetur unde vitae voluptatem. Accusantium architecto, dolor earum fuga iure laboriosam natus officiis quod quos, repellendus, soluta ut velit veritatis. Adipisci amet asperiores assumenda blanditiis consectetur consequatur delectus distinctio dolores doloribus eius fugiat harum illum incidunt ipsa iusto labore laboriosam libero maxime minus modi nam nesciunt nobis nulla obcaecati, odio omnis provident quasi qui quidem quod quos repellat sed unde! Ducimus, harum, odio? Accusantium asperiores atque cum cumque dicta distinctio, doloremque doloribus eaque earum enim eveniet expedita facere fugit impedit iure iusto labore libero maiores non odit pariatur possimus quas quibusdam suscipit tempora vel voluptas. Alias asperiores aspernatur aut culpa delectus deserunt dolor dolore eligendi enim ex facilis fugiat id ipsam iste libero modi perferendis placeat quas quisquam quod repudiandae saepe sequi similique tenetur, ut, veniam veritatis vero. Adipisci animi aut consectetur cumque cupiditate dignissimos, dolorem, error excepturi iure laudantium nihil officia porro qui quod sit temporibus voluptate. Ad adipisci aliquam ducimus ea eius eligendi error ipsam maiores natus nemo nesciunt officiis, repellat, soluta? Animi aspernatur autem blanditiis, culpa dolore ducimus eaque eius et exercitationem impedit ipsum magnam modi nostrum odio recusandae rem sint suscipit temporibus veniam vitae. Assumenda dolore illo illum incidunt ipsam modi molestiae necessitatibus odit omnis quam repellendus repudiandae sapiente soluta tempore, temporibus ullam unde vero! Aliquam aperiam aspernatur assumenda autem corporis, dolore doloribus, enim eum, incidunt nemo recusandae repellat unde. Ad aliquid architecto assumenda at beatae, culpa, dolore eaque earum enim excepturi impedit quas rerum, ut. Alias beatae cupiditate eum expedita explicabo harum impedit ipsum labore magni minus mollitia nemo, optio praesentium quod ut. Debitis dolor doloremque ducimus eos eveniet facere itaque minima minus modi ullam? Ad adipisci architecto beatae cum deserunt dolorum eaque ipsam itaque mollitia officia officiis pariatur reiciendis saepe, sint suscipit vero voluptas voluptates? Accusamus cumque debitis deleniti ducimus eum fuga fugit impedit inventore labore laborum laudantium, modi mollitia, numquam quod repudiandae rerum suscipit totam veritatis voluptas voluptatum? A et harum id impedit in, quasi quos saepe! Delectus deserunt eaque eligendi facere fugiat, harum id incidunt ipsum laborum magnam maiores maxime minus mollitia neque nihil nisi obcaecati officia provident qui rem, sequi, soluta tempore unde veniam veritatis vitae voluptate. Animi cum explicabo id molestias optio suscipit unde! Adipisci aperiam corporis cupiditate eligendi eveniet ex, in ipsum laboriosam maiores maxime modi nostrum perferendis perspiciatis porro quae recusandae repellat similique sit unde voluptatibus? Accusamus adipisci alias at autem consectetur dolor eaque facere illo, incidunt iste, itaque, iusto magnam maxime minima natus necessitatibus nesciunt nobis quam quasi quia rem repellat rerum temporibus ullam vel veniam voluptate? Animi, aperiam ea error eveniet inventore iure minima modi, nam obcaecati odit quam voluptatum! Accusantium, adipisci distinctio ducimus id laudantium minus rerum. Aliquam, itaque perferendis? Alias aperiam aut consequatur iste minus mollitia quasi suscipit! Asperiores aut blanditiis consequuntur dolor dolorem, doloremque dolores facere fuga, impedit itaque minus modi nostrum numquam odio perspiciatis quae qui quibusdam quisquam quod recusandae sapiente sint sit sunt tempora tenetur totam ut voluptas. Ab alias, at hic ipsa neque officia quisquam sequi sit sunt vitae voluptas, voluptatum. Amet delectus error explicabo non nulla, odio quae quas quos sint veniam. Ad aut cupiditate distinctio earum, expedita inventore quae quas repellat. Delectus, dicta esse est molestias perferendis sunt veniam. A, accusamus alias aliquam consectetur consequatur delectus dolore eaque exercitationem in incidunt laudantium nobis, quisquam recusandae rem repudiandae velit, vitae voluptates? Aliquam, aliquid corporis cum dolor, eius est eveniet excepturi impedit iusto laborum minus necessitatibus nisi nostrum officiis quidem rem repellat reprehenderit sit temporibus ullam unde veritatis vero voluptas voluptatibus voluptatum. Accusamus asperiores consectetur cumque iste magnam magni mollitia, nam porro quasi qui suscipit, voluptates voluptatum. Amet aspernatur, culpa cum debitis id itaque libero magni minus molestiae quae quas, quasi reprehenderit sit ut velit? Atque blanditiis dolorem et maxime nulla numquam obcaecati perspiciatis quam quisquam ratione reprehenderit sunt totam vel, voluptas voluptates? Accusantium adipisci aliquid assumenda ducimus eos error est exercitationem, ipsum iusto laudantium nisi porro quia, quos saepe sequi sint, vel voluptatum! Autem commodi consequuntur culpa dolore et fugit molestiae, nulla pariatur quae, quia rerum tempore vel. Aperiam, dicta doloribus ex nemo non quidem recusandae suscipit velit. Adipisci alias amet atque consequatur distinctio dolores dolorum iste itaque iure laborum magni minima molestiae nam nisi officia quibusdam, quis similique sint temporibus vitae? Cumque debitis dolore eligendi enim magnam natus quasi quos repudiandae? Ab architecto at atque corporis deleniti dignissimos ea eaque eius eligendi et ex fugiat, incidunt laborum natus necessitatibus obcaecati optio placeat porro quam quas quibusdam quis quod repellat saepe sapiente tempore ut velit. A accusamus assumenda at autem, beatae commodi deleniti doloremque ea fuga fugiat fugit inventore ipsum laborum libero maxime minima molestiae nobis obcaecati omnis optio porro quae, qui ratione repudiandae sapiente sed voluptas! Amet animi, consectetur consequuntur corporis eos error explicabo facere fugit impedit iste laudantium maiores perspiciatis possimus similique soluta. Ab accusamus alias aliquam amet atque cupiditate dignissimos distinctio ea earum et facilis iusto perspiciatis quibusdam quidem quod ratione, sapiente vitae? Assumenda culpa excepturi, facilis fugiat fugit hic, illum inventore libero nulla odit omnis perspiciatis quae quasi, ratione voluptatum! Aspernatur assumenda consectetur dolor dolorem doloribus eum, exercitationem, expedita facilis fugiat hic illo, iusto neque nulla omnis quas quidem quo vitae! Accusamus aspernatur autem dignissimos dolor, ex maxime necessitatibus nisi qui soluta? Ab adipisci consequuntur cupiditate deleniti dolore earum enim eos est facilis fuga fugiat hic illo impedit in ipsa ipsam iure iusto magnam modi nam nemo nobis nostrum odit officia optio quaerat quasi quibusdam, quo recusandae sed, sequi sit tempore tenetur velit veritatis voluptate voluptatibus! Aspernatur assumenda, dolore doloremque facere iure laudantium maxime minus obcaecati perspiciatis porro quaerat quos reiciendis repellendus sint voluptate voluptatem voluptatibus. Architecto, commodi consectetur consequatur cumque dolorem doloribus ducimus eligendi fugiat in inventore itaque iure laborum libero magnam minima minus nam nobis non nulla numquam odio pariatur quis sapiente sint vel. Accusantium ad aliquam autem distinctio dolores error est fugit harum nulla, odit officia pariatur quis ratione rem sunt, temporibus tenetur voluptas voluptate. Eveniet nesciunt quo rem! In molestias, vitae! Assumenda cum cupiditate dolores eveniet sunt! Adipisci eos mollitia non. Accusamus eaque ex illo, mollitia provident quos voluptatibus! Aliquid architecto esse est eum iusto nemo nobis odit rerum. Aliquam asperiores cumque dignissimos ea eos ipsa libero nisi sapiente sunt unde? Esse excepturi harum itaque perferendis quas, quis temporibus. Architecto commodi, debitis dignissimos dolorum eaque exercitationem fuga impedit in ipsam iusto magni maxime mollitia nam nostrum numquam odio perspiciatis quasi quia quidem, sunt suscipit totam vitae voluptate. Aspernatur assumenda beatae consectetur deserunt dolore eligendi est excepturi exercitationem facilis illo ipsum iusto laboriosam molestiae nam neque nobis obcaecati officiis provident quasi quibusdam quisquam ratione reiciendis rem repellendus repudiandae rerum sapiente tempora, velit vitae voluptatem! A amet atque aut consequuntur deserunt, dolores dolorum ducimus excepturi facere fugiat harum in itaque libero, magni minima minus modi necessitatibus officia praesentium quae quasi quo recusandae reiciendis rerum sint tempore totam voluptatum! Dolores earum eos error esse mollitia nam nobis quas voluptates. A id nisi quo reprehenderit similique? Ad, aperiam, architecto autem beatae cumque ex fugiat illum ipsa itaque libero magni, minus molestias mollitia nostrum officiis omnis saepe tenetur vel velit veniam! A accusantium assumenda consectetur consequuntur debitis deleniti deserunt, ducimus ea eaque eligendi est hic illum in incidunt iusto magni minima minus molestias nam, necessitatibus, nisi nobis numquam odio odit porro quaerat quibusdam quidem quos ratione repellat repellendus tenetur voluptate voluptatibus. Adipisci dignissimos molestiae possimus praesentium quo sed sint. Nobis quasi unde ut. Distinctio doloremque, molestias. Accusantium aliquid asperiores consectetur debitis dolorem dolores eaque error illo in inventore itaque iusto labore minima molestiae non numquam, perspiciatis quae qui, reiciendis repudiandae sed tenetur totam, veniam? Aliquid animi architecto consequatur deserunt distinctio maxime quas repellendus? At culpa dolores error exercitationem perspiciatis quo repellat rerum voluptatum. Esse, quas, similique. Aliquid aut deleniti dicta eligendi fugit hic in, inventore omnis perspiciatis quaerat quam voluptates, voluptatum? Aliquid est iusto ut vel! Debitis distinctio dolorum est hic, ipsa mollitia numquam quae recusandae totam vel! Ab aliquid animi blanditiis distinctio, eaque facere harum id officiis placeat quis reiciendis, sapiente tenetur voluptas. Animi atque aut id perspiciatis qui quis? Hic ipsa omnis quod sunt voluptatibus? Ducimus nulla placeat quibusdam? Accusantium aliquam beatae consequuntur dolorem enim expedita ipsum iure maxime minima minus nulla numquam, officia omnis pariatur perferendis possimus qui, sit soluta. Aspernatur beatae doloremque exercitationem facilis fugit nesciunt pariatur placeat provident quidem tempore. In laboriosam qui ullam ut. Accusantium consequatur debitis impedit molestiae officiis pariatur repudiandae velit voluptate? Assumenda autem, delectus fugiat inventore quos reprehenderit voluptate voluptatem. Commodi, eligendi eum inventore officiis qui saepe sit! Accusantium aliquam aperiam aut cum ea eius eveniet ex fugit hic iure minima modi qui quis repellat sequi, ullam voluptas, voluptate. Alias amet consequatur corporis dolor ducimus enim eos error eum excepturi exercitationem expedita harum id iure maxime molestiae necessitatibus nemo nesciunt nulla numquam odit officiis perspiciatis quam quas qui quo quod ratione recusandae reiciendis, saepe sed unde ut velit voluptatem! Architecto culpa cum dolore eveniet fuga libero nemo nihil porro qui, recusandae reprehenderit, tempora unde voluptas? Ab aspernatur consequuntur, dolore doloremque esse illum labore magnam, magni nisi nulla quae quia quos rerum tenetur totam ut voluptatem voluptates? A, aliquid aperiam corporis debitis dolorem et ex exercitationem ipsum molestiae nesciunt numquam quas, ullam voluptates. Distinctio, dolores dolorum ex fuga fugit quam reiciendis rem. Aliquam aliquid amet consequatur eos expedita facere hic itaque labore laboriosam, nobis omnis pariatur repudiandae, temporibus tenetur unde, veniam veritatis. Accusamus accusantium alias animi aperiam atque cum debitis dignissimos dolorem, dolorum eligendi ex explicabo facere inventore ipsum molestiae natus nemo odio optio provident, quam quas quibusdam recusandae repellat saepe tempora vel voluptate. Aliquam atque cum, dolor dolores ea expedita id in ipsa labore maiores nemo nobis pariatur perferendis perspiciatis sed. Expedita, unde?" />
											</ScrollContainer>
											<ScrollContainer
												id="page4"
												horizontal="false"
												vertical="true"
												height="100%"
												class="sapUiContentPadding">
												<Text text="This is page 4" />
											</ScrollContainer>
										</pages>
									</NavContainer>
								</VBox>
							</HBox>
						</content>
					</Page>
				</App>
			</mvc:View>
		`
	});
	oView.placeAt('content');
});