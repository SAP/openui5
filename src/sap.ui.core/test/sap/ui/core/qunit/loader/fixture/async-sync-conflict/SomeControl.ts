import Log from "sap/base/Log";
import Renderer from "fixture/async-sync-conflict/SomeControlRenderer";
Log.info("executing SomeControl");
Renderer.someProperty = "some value";
Log.info("property attached");