import { wdi5Selector } from "wdio-ui5-service/dist/types/wdi5.types";

const inputSelector: wdi5Selector = {
	selector: {
		id: "addTodoItemInput",
		viewName: "sap.m.sample.TsTodos.webapp.view.App"
	}
};

describe("basic usage", () => {
	it("input for adding todo item is rendered", async () => {
		const inputControl = await browser.asControl(inputSelector);
		expect(inputControl.getVisible()).toBeTruthy();
	});
});
