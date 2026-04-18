import { jsx } from "react/jsx-runtime";
//#region src/routes/index.tsx?tsr-split=component
function Home() {
	return /* @__PURE__ */ jsx("div", {
		className: "p-2",
		children: /* @__PURE__ */ jsx("h3", { children: "Welcome Home!!!" })
	});
}
//#endregion
export { Home as component };
