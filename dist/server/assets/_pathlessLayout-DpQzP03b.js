import { Outlet } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/routes/_pathlessLayout.tsx?tsr-split=component
function PathlessLayoutComponent() {
	return /* @__PURE__ */ jsxs("div", {
		className: "p-2",
		children: [/* @__PURE__ */ jsx("div", { children: "I'm a pathless layout" }), /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Outlet, {}) })]
	});
}
//#endregion
export { PathlessLayoutComponent as component };
