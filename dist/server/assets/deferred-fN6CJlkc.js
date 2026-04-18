import { n as Button, t as deferredQueryOptions } from "./deferred-OM3YDwLF.js";
import { Suspense, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useSuspenseQuery } from "@tanstack/react-query";
//#region src/routes/deferred.tsx?tsr-split=component
function Deferred() {
	const [count, setCount] = useState(0);
	return /* @__PURE__ */ jsxs("div", {
		className: "p-2",
		children: [
			/* @__PURE__ */ jsx(Suspense, {
				fallback: "Loading Middleman...",
				children: /* @__PURE__ */ jsx(DeferredQuery, {})
			}),
			/* @__PURE__ */ jsxs("div", { children: ["Count: ", count] }),
			/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Button, {
				onClick: () => setCount((value) => value + 1),
				size: "sm",
				children: "Increment"
			}) })
		]
	});
}
function DeferredQuery() {
	const deferredQuery = useSuspenseQuery(deferredQueryOptions());
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("h1", { children: "Deferred Query" }),
		/* @__PURE__ */ jsxs("div", { children: ["Status: ", deferredQuery.data.status] }),
		/* @__PURE__ */ jsxs("div", { children: ["Message: ", deferredQuery.data.message] }),
		/* @__PURE__ */ jsxs("div", { children: ["Time: ", deferredQuery.data.time.toISOString()] })
	] });
}
//#endregion
export { Deferred as component };
