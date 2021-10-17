import module2 from "./module2";
export class moduleExport {
}
window["cyclic-dependency-without-mapping"].module1 = moduleExport;