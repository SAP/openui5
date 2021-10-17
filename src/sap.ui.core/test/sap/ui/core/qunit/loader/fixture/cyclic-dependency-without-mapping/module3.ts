import module1 from "./module1";
export class moduleExport {
}
window["cyclic-dependency-without-mapping"].module3 = moduleExport;