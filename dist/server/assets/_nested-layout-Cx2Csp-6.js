import { Link, Outlet } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/routes/_pathlessLayout/_nested-layout.tsx?tsr-split=component
function PathlessLayoutComponent() {
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", { children: "I'm a nested pathless layout" }),
		/* @__PURE__ */ jsxs("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ jsx(Link, {
				to: "/route-a",
				activeProps: { className: "font-bold" },
				children: "Go to route A"
			}), /* @__PURE__ */ jsx(Link, {
				to: "/route-b",
				activeProps: { className: "font-bold" },
				children: "Go to route B"
			})]
		}),
		/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Outlet, {}) })
	] });
}
//#endregion
export { PathlessLayoutComponent as component };
