import { n as Button, t as deferredQueryOptions } from "./deferred-OM3YDwLF.js";
import "react";
import { ErrorComponent, HeadContent, Link, Outlet, Scripts, createFileRoute, createRootRouteWithContext, createRouter, lazyRouteComponent, rootRouteId, useMatch, useRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import axios from "redaxios";
//#region src/components/DefaultCatchBoundary.tsx
function DefaultCatchBoundary({ error }) {
	const router = useRouter();
	const isRoot = useMatch({
		strict: false,
		select: (state) => state.id === rootRouteId
	});
	console.error(error);
	return /* @__PURE__ */ jsxs("div", {
		className: "min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6",
		children: [/* @__PURE__ */ jsx(ErrorComponent, { error }), /* @__PURE__ */ jsxs("div", {
			className: "flex gap-2 items-center flex-wrap",
			children: [/* @__PURE__ */ jsx(Button, {
				onClick: () => {
					router.invalidate();
				},
				size: "sm",
				children: "Try Again"
			}), isRoot ? /* @__PURE__ */ jsx(Button, {
				render: /* @__PURE__ */ jsx(Link, { to: "/" }),
				size: "sm",
				variant: "outline",
				children: "Home"
			}) : /* @__PURE__ */ jsx(Button, {
				render: /* @__PURE__ */ jsx(Link, {
					to: "/",
					onClick: (e) => {
						e.preventDefault();
						window.history.back();
					}
				}),
				size: "sm",
				variant: "outline",
				children: "Go Back"
			})]
		})]
	});
}
//#endregion
//#region src/components/NotFound.tsx
function NotFound({ children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-2 p-2",
		children: [/* @__PURE__ */ jsx("div", {
			className: "text-gray-600 dark:text-gray-400",
			children: children || /* @__PURE__ */ jsx("p", { children: "The page you are looking for does not exist." })
		}), /* @__PURE__ */ jsxs("p", {
			className: "flex items-center gap-2 flex-wrap",
			children: [/* @__PURE__ */ jsx(Button, {
				onClick: () => window.history.back(),
				size: "sm",
				children: "Go back"
			}), /* @__PURE__ */ jsx(Button, {
				render: /* @__PURE__ */ jsx(Link, { to: "/" }),
				size: "sm",
				variant: "outline",
				children: "Start Over"
			})]
		})]
	});
}
//#endregion
//#region src/styles/app.css?url
var app_default = "/assets/app-I2iutZ8x.css";
//#endregion
//#region src/utils/seo.ts
var seo = ({ title, description, keywords, image }) => {
	return [
		{ title },
		{
			name: "description",
			content: description
		},
		{
			name: "keywords",
			content: keywords
		},
		{
			name: "twitter:title",
			content: title
		},
		{
			name: "twitter:description",
			content: description
		},
		{
			name: "twitter:creator",
			content: "@tannerlinsley"
		},
		{
			name: "twitter:site",
			content: "@tannerlinsley"
		},
		{
			name: "og:type",
			content: "website"
		},
		{
			name: "og:title",
			content: title
		},
		{
			name: "og:description",
			content: description
		},
		...image ? [
			{
				name: "twitter:image",
				content: image
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "og:image",
				content: image
			}
		] : []
	];
};
//#endregion
//#region src/routes/__root.tsx
var Route$8 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			...seo({
				title: "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
				description: `TanStack Start is a type-safe, client-first, full-stack React framework. `
			})
		],
		links: [
			{
				rel: "stylesheet",
				href: app_default
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png"
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon-32x32.png"
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon-16x16.png"
			},
			{
				rel: "manifest",
				href: "/site.webmanifest",
				color: "#fffff"
			},
			{
				rel: "icon",
				href: "/favicon.ico"
			}
		]
	}),
	errorComponent: (props) => {
		return /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx(DefaultCatchBoundary, { ...props }) });
	},
	notFoundComponent: () => /* @__PURE__ */ jsx(NotFound, {}),
	component: RootComponent
});
function RootComponent() {
	return /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
function RootDocument({ children }) {
	return /* @__PURE__ */ jsxs("html", { children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "p-2 flex gap-2 text-lg",
			children: [
				/* @__PURE__ */ jsx(Link, {
					to: "/",
					activeProps: { className: "font-bold" },
					activeOptions: { exact: true },
					children: "Home"
				}),
				" ",
				/* @__PURE__ */ jsx(Link, {
					to: "/route-a",
					activeProps: { className: "font-bold" },
					children: "Pathless Layout"
				}),
				" ",
				/* @__PURE__ */ jsx(Link, {
					to: "/deferred",
					activeProps: { className: "font-bold" },
					children: "Deferred"
				}),
				" ",
				/* @__PURE__ */ jsx(Link, {
					to: "/this-route-does-not-exist",
					activeProps: { className: "font-bold" },
					children: "This Route Does Not Exist"
				})
			]
		}),
		/* @__PURE__ */ jsx("hr", {}),
		children,
		/* @__PURE__ */ jsx(TanStackRouterDevtools, { position: "bottom-right" }),
		/* @__PURE__ */ jsx(ReactQueryDevtools, { buttonPosition: "bottom-left" }),
		/* @__PURE__ */ jsx(Scripts, {})
	] })] });
}
//#endregion
//#region src/routes/deferred.tsx
var $$splitComponentImporter$5 = () => import("./deferred-fN6CJlkc.js");
var Route$7 = createFileRoute("/deferred")({
	loader: ({ context }) => {
		context.queryClient.prefetchQuery(deferredQueryOptions());
	},
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
//#endregion
//#region src/routes/_pathlessLayout.tsx
var $$splitComponentImporter$4 = () => import("./_pathlessLayout-DpQzP03b.js");
var Route$6 = createFileRoute("/_pathlessLayout")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
//#endregion
//#region src/routes/index.tsx
var $$splitComponentImporter$3 = () => import("./routes-DQ8y1Zqh.js");
var Route$5 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
//#endregion
//#region src/routes/api/users.ts
var Route$4 = createFileRoute("/api/users")({ server: { handlers: { GET: async ({ request }) => {
	console.info("Fetching users... @", request.url);
	const list = (await axios.get("https://jsonplaceholder.typicode.com/users")).data.slice(0, 10);
	return Response.json(list.map((u) => ({
		id: u.id,
		name: u.name,
		email: u.email
	})));
} } } });
//#endregion
//#region src/routes/_pathlessLayout/_nested-layout.tsx
var $$splitComponentImporter$2 = () => import("./_nested-layout-Cx2Csp-6.js");
var Route$3 = createFileRoute("/_pathlessLayout/_nested-layout")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
//#endregion
//#region src/routes/api/users.$id.ts
var Route$2 = createFileRoute("/api/users/$id")({ server: { handlers: { GET: async ({ request, params }) => {
	console.info(`Fetching users by id=${params.id}... @`, request.url);
	try {
		const res = await axios.get("https://jsonplaceholder.typicode.com/users/" + params.id);
		return Response.json({
			id: res.data.id,
			name: res.data.name,
			email: res.data.email
		});
	} catch (e) {
		console.error(e);
		return Response.json({ error: "User not found" }, { status: 404 });
	}
} } } });
//#endregion
//#region src/routes/_pathlessLayout/_nested-layout/route-b.tsx
var $$splitComponentImporter$1 = () => import("./route-b-C1sFaGHd.js");
var Route$1 = createFileRoute("/_pathlessLayout/_nested-layout/route-b")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
//#endregion
//#region src/routes/_pathlessLayout/_nested-layout/route-a.tsx
var $$splitComponentImporter = () => import("./route-a-D1mER2ks.js");
var Route = createFileRoute("/_pathlessLayout/_nested-layout/route-a")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
//#endregion
//#region src/routeTree.gen.ts
var DeferredRoute = Route$7.update({
	id: "/deferred",
	path: "/deferred",
	getParentRoute: () => Route$8
});
var PathlessLayoutRoute = Route$6.update({
	id: "/_pathlessLayout",
	getParentRoute: () => Route$8
});
var IndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$8
});
var ApiUsersRoute = Route$4.update({
	id: "/api/users",
	path: "/api/users",
	getParentRoute: () => Route$8
});
var PathlessLayoutNestedLayoutRoute = Route$3.update({
	id: "/_nested-layout",
	getParentRoute: () => PathlessLayoutRoute
});
var ApiUsersIdRoute = Route$2.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => ApiUsersRoute
});
var PathlessLayoutNestedLayoutRouteBRoute = Route$1.update({
	id: "/route-b",
	path: "/route-b",
	getParentRoute: () => PathlessLayoutNestedLayoutRoute
});
var PathlessLayoutNestedLayoutRouteChildren = {
	PathlessLayoutNestedLayoutRouteARoute: Route.update({
		id: "/route-a",
		path: "/route-a",
		getParentRoute: () => PathlessLayoutNestedLayoutRoute
	}),
	PathlessLayoutNestedLayoutRouteBRoute
};
var PathlessLayoutRouteChildren = { PathlessLayoutNestedLayoutRoute: PathlessLayoutNestedLayoutRoute._addFileChildren(PathlessLayoutNestedLayoutRouteChildren) };
var PathlessLayoutRouteWithChildren = PathlessLayoutRoute._addFileChildren(PathlessLayoutRouteChildren);
var ApiUsersRouteChildren = { ApiUsersIdRoute };
var rootRouteChildren = {
	IndexRoute,
	PathlessLayoutRoute: PathlessLayoutRouteWithChildren,
	DeferredRoute,
	ApiUsersRoute: ApiUsersRoute._addFileChildren(ApiUsersRouteChildren)
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
function getRouter() {
	const queryClient = new QueryClient();
	const router = createRouter({
		routeTree,
		context: { queryClient },
		defaultPreload: "intent",
		defaultErrorComponent: DefaultCatchBoundary,
		defaultNotFoundComponent: () => /* @__PURE__ */ jsx(NotFound, {})
	});
	setupRouterSsrQueryIntegration({
		router,
		queryClient
	});
	return router;
}
//#endregion
export { getRouter };
