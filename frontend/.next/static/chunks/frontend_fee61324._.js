(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn() {
    for(var _len = arguments.length, inputs = new Array(_len), _key = 0; _key < _len; _key++){
        inputs[_key] = arguments[_key];
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/ui/card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardAction",
    ()=>CardAction,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/utils.ts [app-client] (ecmascript)");
;
;
function Card(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/frontend/components/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Card;
function CardHeader(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/frontend/components/ui/card.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c1 = CardHeader;
function CardTitle(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("leading-none font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/frontend/components/ui/card.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c2 = CardTitle;
function CardDescription(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/frontend/components/ui/card.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_c3 = CardDescription;
function CardAction(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-action",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/frontend/components/ui/card.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
_c4 = CardAction;
function CardContent(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/frontend/components/ui/card.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
_c5 = CardContent;
function CardFooter(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex items-center px-6 [.border-t]:pt-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/frontend/components/ui/card.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
_c6 = CardFooter;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "Card");
__turbopack_context__.k.register(_c1, "CardHeader");
__turbopack_context__.k.register(_c2, "CardTitle");
__turbopack_context__.k.register(_c3, "CardDescription");
__turbopack_context__.k.register(_c4, "CardAction");
__turbopack_context__.k.register(_c5, "CardContent");
__turbopack_context__.k.register(_c6, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
            destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
            outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
            secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-9 px-4 py-2 has-[>svg]:px-3",
            sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
            lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
            icon: "size-9"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
function Button(param) {
    let { className, variant, size, asChild = false, ...props } = param;
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/frontend/components/ui/button.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
_c = Button;
;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/ui/badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge,
    "badgeVariants",
    ()=>badgeVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden", {
    variants: {
        variant: {
            default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
            secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
            destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
            outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
        }
    },
    defaultVariants: {
        variant: "default"
    }
});
function Badge(param) {
    let { className, variant, asChild = false, ...props } = param;
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "span";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "badge",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(badgeVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/frontend/components/ui/badge.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_c = Badge;
;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StressDashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '@/components/metric-card'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@/components/live-chart'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@/components/camera-feed'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@/components/status-indicator'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@/components/progress-bar'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/brain.js [app-client] (ecmascript) <export default as Brain>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/activity.js [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/pause.js [app-client] (ecmascript) <export default as Pause>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
// Mock data generation for demonstration
const generateMockData = ()=>({
        stressLevel: Math.random() * 100,
        breathingRate: 12 + Math.random() * 8,
        confidenceLevel: 70 + Math.random() * 30,
        heartRate: 60 + Math.random() * 40
    });
function StressDashboard() {
    _s();
    const [isMonitoring, setIsMonitoring] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentMetrics, setCurrentMetrics] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(generateMockData());
    const [chartData, setChartData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        stress: [],
        breathing: [],
        confidence: []
    });
    // Simulate real-time data updates
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StressDashboard.useEffect": ()=>{
            if (!isMonitoring) return;
            const interval = setInterval({
                "StressDashboard.useEffect.interval": ()=>{
                    const newMetrics = generateMockData();
                    setCurrentMetrics(newMetrics);
                    const currentTime = new Date().toLocaleTimeString();
                    setChartData({
                        "StressDashboard.useEffect.interval": (prev)=>({
                                stress: [
                                    ...prev.stress.slice(-19),
                                    {
                                        time: currentTime,
                                        value: newMetrics.stressLevel
                                    }
                                ],
                                breathing: [
                                    ...prev.breathing.slice(-19),
                                    {
                                        time: currentTime,
                                        value: newMetrics.breathingRate
                                    }
                                ],
                                confidence: [
                                    ...prev.confidence.slice(-19),
                                    {
                                        time: currentTime,
                                        value: newMetrics.confidenceLevel
                                    }
                                ]
                            })
                    }["StressDashboard.useEffect.interval"]);
                }
            }["StressDashboard.useEffect.interval"], 2000);
            return ({
                "StressDashboard.useEffect": ()=>clearInterval(interval)
            })["StressDashboard.useEffect"];
        }
    }["StressDashboard.useEffect"], [
        isMonitoring
    ]);
    const getStressStatus = (level)=>{
        if (level < 20) return "excellent";
        if (level < 40) return "good";
        if (level < 60) return "moderate";
        if (level < 80) return "poor";
        return "critical";
    };
    const getBreathingStatus = (rate)=>{
        if (rate >= 12 && rate <= 16) return "excellent";
        if (rate >= 10 && rate <= 18) return "good";
        if (rate >= 8 && rate <= 20) return "moderate";
        return "poor";
    };
    const handleStartMonitoring = ()=>{
        setIsMonitoring(true);
        // Initialize with some data points
        const initialTime = new Date().toLocaleTimeString();
        const initialMetrics = generateMockData();
        setChartData({
            stress: [
                {
                    time: initialTime,
                    value: initialMetrics.stressLevel
                }
            ],
            breathing: [
                {
                    time: initialTime,
                    value: initialMetrics.breathingRate
                }
            ],
            confidence: [
                {
                    time: initialTime,
                    value: initialMetrics.confidenceLevel
                }
            ]
        });
    };
    const handleStopMonitoring = ()=>{
        setIsMonitoring(false);
    };
    const handleReset = ()=>{
        setIsMonitoring(false);
        setChartData({
            stress: [],
            breathing: [],
            confidence: []
        });
        setCurrentMetrics(generateMockData());
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-background p-4 space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold text-foreground",
                                children: "Stress & Anxiety Monitor"
                            }, void 0, false, {
                                fileName: "[project]/frontend/app/page.tsx",
                                lineNumber: 93,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-muted-foreground",
                                children: "Real-time biometric analysis dashboard"
                            }, void 0, false, {
                                fileName: "[project]/frontend/app/page.tsx",
                                lineNumber: 94,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/app/page.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                            variant: isMonitoring ? "default" : "secondary",
                            className: "px-3 py-1",
                            children: isMonitoring ? "MONITORING" : "STANDBY"
                        }, void 0, false, {
                            fileName: "[project]/frontend/app/page.tsx",
                            lineNumber: 97,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/page.tsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/app/page.tsx",
                lineNumber: 91,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                    className: "h-5 w-5"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/app/page.tsx",
                                    lineNumber: 107,
                                    columnNumber: 13
                                }, this),
                                "Control Panel"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/app/page.tsx",
                            lineNumber: 106,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/page.tsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        className: "flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                onClick: isMonitoring ? handleStopMonitoring : handleStartMonitoring,
                                variant: isMonitoring ? "destructive" : "default",
                                className: "flex items-center gap-2",
                                children: isMonitoring ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__["Pause"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/app/page.tsx",
                                            lineNumber: 119,
                                            columnNumber: 17
                                        }, this),
                                        "Stop Monitoring"
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/app/page.tsx",
                                            lineNumber: 124,
                                            columnNumber: 17
                                        }, this),
                                        "Start Monitoring"
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/frontend/app/page.tsx",
                                lineNumber: 112,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                onClick: handleReset,
                                variant: "outline",
                                className: "flex items-center gap-2 bg-transparent",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/app/page.tsx",
                                        lineNumber: 130,
                                        columnNumber: 13
                                    }, this),
                                    "Reset"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/app/page.tsx",
                                lineNumber: 129,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/app/page.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/app/page.tsx",
                lineNumber: 104,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CameraFeed, {}, void 0, false, {
                            fileName: "[project]/frontend/app/page.tsx",
                            lineNumber: 139,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/page.tsx",
                        lineNumber: 138,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-2 space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricCard, {
                                        title: "Stress Level",
                                        value: currentMetrics.stressLevel,
                                        status: currentMetrics.stressLevel < 30 ? "low" : currentMetrics.stressLevel < 60 ? "normal" : currentMetrics.stressLevel < 80 ? "high" : "critical",
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__["Brain"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/app/page.tsx",
                                            lineNumber: 157,
                                            columnNumber: 21
                                        }, void 0)
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/app/page.tsx",
                                        lineNumber: 145,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricCard, {
                                        title: "Breathing Rate",
                                        value: currentMetrics.breathingRate,
                                        unit: " bpm",
                                        status: currentMetrics.breathingRate >= 12 && currentMetrics.breathingRate <= 16 ? "normal" : "high",
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/app/page.tsx",
                                            lineNumber: 164,
                                            columnNumber: 21
                                        }, void 0)
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/app/page.tsx",
                                        lineNumber: 159,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricCard, {
                                        title: "Confidence Level",
                                        value: currentMetrics.confidenceLevel,
                                        status: currentMetrics.confidenceLevel > 80 ? "normal" : "low",
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/app/page.tsx",
                                            lineNumber: 170,
                                            columnNumber: 21
                                        }, void 0)
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/app/page.tsx",
                                        lineNumber: 166,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricCard, {
                                        title: "Heart Rate",
                                        value: currentMetrics.heartRate,
                                        unit: " bpm",
                                        status: currentMetrics.heartRate >= 60 && currentMetrics.heartRate <= 80 ? "normal" : "high",
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/app/page.tsx",
                                            lineNumber: 177,
                                            columnNumber: 21
                                        }, void 0)
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/app/page.tsx",
                                        lineNumber: 172,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/app/page.tsx",
                                lineNumber: 144,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                            children: "Overall Status"
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/app/page.tsx",
                                            lineNumber: 184,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/app/page.tsx",
                                        lineNumber: 183,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                        className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusIndicator, {
                                                status: getStressStatus(currentMetrics.stressLevel),
                                                label: "Stress Level"
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/app/page.tsx",
                                                lineNumber: 187,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusIndicator, {
                                                status: getBreathingStatus(currentMetrics.breathingRate),
                                                label: "Breathing Pattern"
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/app/page.tsx",
                                                lineNumber: 188,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusIndicator, {
                                                status: currentMetrics.confidenceLevel > 80 ? "excellent" : currentMetrics.confidenceLevel > 60 ? "good" : "moderate",
                                                label: "Analysis Confidence"
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/app/page.tsx",
                                                lineNumber: 189,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/app/page.tsx",
                                        lineNumber: 186,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/app/page.tsx",
                                lineNumber: 182,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/app/page.tsx",
                        lineNumber: 143,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/app/page.tsx",
                lineNumber: 136,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LiveChart, {
                        title: "Stress Level Trend",
                        data: chartData.stress,
                        color: "chart-1",
                        yAxisDomain: [
                            0,
                            100
                        ]
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/page.tsx",
                        lineNumber: 206,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LiveChart, {
                        title: "Breathing Rate",
                        data: chartData.breathing,
                        color: "chart-2",
                        yAxisDomain: [
                            8,
                            24
                        ]
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/page.tsx",
                        lineNumber: 207,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LiveChart, {
                        title: "Confidence Level",
                        data: chartData.confidence,
                        color: "chart-3",
                        yAxisDomain: [
                            0,
                            100
                        ]
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/page.tsx",
                        lineNumber: 208,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/app/page.tsx",
                lineNumber: 205,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                            children: "Detailed Metrics"
                        }, void 0, false, {
                            fileName: "[project]/frontend/app/page.tsx",
                            lineNumber: 214,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/page.tsx",
                        lineNumber: 213,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProgressBar, {
                                label: "Stress Level",
                                value: currentMetrics.stressLevel,
                                color: currentMetrics.stressLevel < 50 ? "success" : currentMetrics.stressLevel < 75 ? "warning" : "danger"
                            }, void 0, false, {
                                fileName: "[project]/frontend/app/page.tsx",
                                lineNumber: 217,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProgressBar, {
                                label: "Breathing Stability",
                                value: Math.max(0, 100 - Math.abs(currentMetrics.breathingRate - 14) * 10),
                                color: "primary"
                            }, void 0, false, {
                                fileName: "[project]/frontend/app/page.tsx",
                                lineNumber: 222,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProgressBar, {
                                label: "Analysis Confidence",
                                value: currentMetrics.confidenceLevel,
                                color: "secondary"
                            }, void 0, false, {
                                fileName: "[project]/frontend/app/page.tsx",
                                lineNumber: 227,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/app/page.tsx",
                        lineNumber: 216,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/app/page.tsx",
                lineNumber: 212,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/app/page.tsx",
        lineNumber: 89,
        columnNumber: 5
    }, this);
} // import Image from "next/image";
 // import NavBar from "./components/NavBar";
 // export default function Home() {
 //   return (
 //     <div>
 //       <NavBar/>
 //     </div>
 //   );
 // }
 // "use client"
 // import { useState, useEffect, useRef } from "react"
 // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
 // import { Button } from "@/components/ui/button"
 // import { Badge } from "@/components/ui/badge"
 // import { Progress } from "@/components/ui/progress"
 // import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
 // import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts"
 // import { Camera, CameraOff, Activity, Heart, Brain, Zap, TrendingUp, AlertTriangle } from 'lucide-react'
 // // Mock data for demonstration
 // const generateMockData = () => ({
 //   stressLevel: Math.floor(Math.random() * 100),
 //   breathingRate: Math.floor(Math.random() * 30) + 12,
 //   confidenceLevel: Math.floor(Math.random() * 100),
 //   heartRate: Math.floor(Math.random() * 40) + 60,
 //   timestamp: new Date().toLocaleTimeString()
 // })
 // const historicalData = Array.from({ length: 20 }, (_, i) => ({
 //   time: `${i + 1}m`,
 //   stress: Math.floor(Math.random() * 100),
 //   breathing: Math.floor(Math.random() * 30) + 12,
 //   confidence: Math.floor(Math.random() * 100)
 // }))
 // export default function StressAnxietyDashboard() {
 //   const [isMonitoring, setIsMonitoring] = useState(false)
 //   const [currentData, setCurrentData] = useState(generateMockData())
 //   const [stream, setStream] = useState<MediaStream | null>(null)
 //   const videoRef = useRef<HTMLVideoElement>(null)
 //   // Simulate real-time data updates
 //   useEffect(() => {
 //     if (!isMonitoring) return
 //     const interval = setInterval(() => {
 //       setCurrentData(generateMockData())
 //     }, 2000)
 //     return () => clearInterval(interval)
 //   }, [isMonitoring])
 //   const startMonitoring = async () => {
 //     try {
 //       const mediaStream = await navigator.mediaDevices.getUserMedia({ 
 //         video: { width: 640, height: 480 },
 //         audio: false 
 //       })
 //       if (videoRef.current) {
 //         videoRef.current.srcObject = mediaStream
 //       }
 //       setStream(mediaStream)
 //       setIsMonitoring(true)
 //     } catch (error) {
 //       console.error("[v0] Error accessing camera:", error)
 //       alert("Unable to access camera. Please check permissions.")
 //     }
 //   }
 //   const stopMonitoring = () => {
 //     if (stream) {
 //       stream.getTracks().forEach(track => track.stop())
 //       setStream(null)
 //     }
 //     setIsMonitoring(false)
 //   }
 //   const getStressLevelColor = (level: number) => {
 //     if (level < 30) return "text-chart-3"
 //     if (level < 70) return "text-chart-2"
 //     return "text-chart-1"
 //   }
 //   const getStressLevelBadge = (level: number) => {
 //     if (level < 30) return { variant: "secondary" as const, text: "Low", color: "bg-chart-3" }
 //     if (level < 70) return { variant: "secondary" as const, text: "Moderate", color: "bg-chart-2" }
 //     return { variant: "destructive" as const, text: "High", color: "bg-chart-1" }
 //   }
 //   const barData = [
 //     { name: "Stress", value: currentData.stressLevel, color: "var(--color-chart-1)" },
 //     { name: "Breathing", value: (currentData.breathingRate / 30) * 100, color: "var(--color-chart-2)" },
 //     { name: "Confidence", value: currentData.confidenceLevel, color: "var(--color-chart-3)" }
 //   ]
 //   return (
 //     <div className="min-h-screen bg-background p-6">
 //       <div className="max-w-7xl mx-auto space-y-6">
 //         {/* Header */}
 //         <div className="flex items-center justify-between">
 //           <div>
 //             <h1 className="text-3xl font-bold text-foreground">Stress & Anxiety Monitor</h1>
 //             <p className="text-muted-foreground">Real-time biometric analysis dashboard</p>
 //           </div>
 //           <div className="flex items-center gap-4">
 //             <Badge variant={isMonitoring ? "default" : "secondary"} className="px-3 py-1">
 //               {isMonitoring ? "Monitoring Active" : "Monitoring Inactive"}
 //             </Badge>
 //             <Button
 //               onClick={isMonitoring ? stopMonitoring : startMonitoring}
 //               variant={isMonitoring ? "destructive" : "default"}
 //               className="flex items-center gap-2"
 //             >
 //               {isMonitoring ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
 //               {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
 //             </Button>
 //           </div>
 //         </div>
 //         {/* Main Dashboard Grid */}
 //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 //           {/* Camera Feed */}
 //           <Card className="lg:col-span-1">
 //             <CardHeader>
 //               <CardTitle className="flex items-center gap-2">
 //                 <Camera className="w-5 h-5" />
 //                 Live Camera Feed
 //               </CardTitle>
 //               <CardDescription>Facial and posture analysis</CardDescription>
 //             </CardHeader>
 //             <CardContent>
 //               <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
 //                 {isMonitoring ? (
 //                   <video
 //                     ref={videoRef}
 //                     autoPlay
 //                     muted
 //                     className="w-full h-full object-cover"
 //                   />
 //                 ) : (
 //                   <div className="flex items-center justify-center h-full text-muted-foreground">
 //                     <div className="text-center">
 //                       <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
 //                       <p>Click "Start Monitoring" to begin</p>
 //                     </div>
 //                   </div>
 //                 )}
 //               </div>
 //             </CardContent>
 //           </Card>
 //           {/* Real-time Metrics */}
 //           <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
 //             {/* Stress Level */}
 //             <Card>
 //               <CardHeader className="pb-3">
 //                 <CardTitle className="flex items-center gap-2 text-lg">
 //                   <Brain className="w-5 h-5 text-chart-1" />
 //                   Stress Level
 //                 </CardTitle>
 //               </CardHeader>
 //               <CardContent>
 //                 <div className="space-y-3">
 //                   <div className="flex items-center justify-between">
 //                     <span className={`text-3xl font-bold ${getStressLevelColor(currentData.stressLevel)}`}>
 //                       {currentData.stressLevel}%
 //                     </span>
 //                     <Badge {...getStressLevelBadge(currentData.stressLevel)}>
 //                       {getStressLevelBadge(currentData.stressLevel).text}
 //                     </Badge>
 //                   </div>
 //                   <Progress value={currentData.stressLevel} className="h-2" />
 //                 </div>
 //               </CardContent>
 //             </Card>
 //             {/* Breathing Rate */}
 //             <Card>
 //               <CardHeader className="pb-3">
 //                 <CardTitle className="flex items-center gap-2 text-lg">
 //                   <Activity className="w-5 h-5 text-chart-2" />
 //                   Breathing Rate
 //                 </CardTitle>
 //               </CardHeader>
 //               <CardContent>
 //                 <div className="space-y-3">
 //                   <div className="flex items-center justify-between">
 //                     <span className="text-3xl font-bold text-chart-2">
 //                       {currentData.breathingRate}
 //                     </span>
 //                     <span className="text-sm text-muted-foreground">breaths/min</span>
 //                   </div>
 //                   <Progress value={(currentData.breathingRate / 30) * 100} className="h-2" />
 //                 </div>
 //               </CardContent>
 //             </Card>
 //             {/* Confidence Level */}
 //             <Card>
 //               <CardHeader className="pb-3">
 //                 <CardTitle className="flex items-center gap-2 text-lg">
 //                   <Zap className="w-5 h-5 text-chart-3" />
 //                   Confidence Level
 //                 </CardTitle>
 //               </CardHeader>
 //               <CardContent>
 //                 <div className="space-y-3">
 //                   <div className="flex items-center justify-between">
 //                     <span className="text-3xl font-bold text-chart-3">
 //                       {currentData.confidenceLevel}%
 //                     </span>
 //                     <Badge variant="secondary">
 //                       {currentData.confidenceLevel > 70 ? "High" : currentData.confidenceLevel > 40 ? "Medium" : "Low"}
 //                     </Badge>
 //                   </div>
 //                   <Progress value={currentData.confidenceLevel} className="h-2" />
 //                 </div>
 //               </CardContent>
 //             </Card>
 //             {/* Heart Rate */}
 //             <Card>
 //               <CardHeader className="pb-3">
 //                 <CardTitle className="flex items-center gap-2 text-lg">
 //                   <Heart className="w-5 h-5 text-chart-4" />
 //                   Heart Rate
 //                 </CardTitle>
 //               </CardHeader>
 //               <CardContent>
 //                 <div className="space-y-3">
 //                   <div className="flex items-center justify-between">
 //                     <span className="text-3xl font-bold text-chart-4">
 //                       {currentData.heartRate}
 //                     </span>
 //                     <span className="text-sm text-muted-foreground">BPM</span>
 //                   </div>
 //                   <Progress value={(currentData.heartRate / 120) * 100} className="h-2" />
 //                 </div>
 //               </CardContent>
 //             </Card>
 //           </div>
 //         </div>
 //         {/* Charts Section */}
 //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 //           {/* Bar Chart */}
 //           <Card>
 //             <CardHeader>
 //               <CardTitle className="flex items-center gap-2">
 //                 <TrendingUp className="w-5 h-5" />
 //                 Current Metrics Overview
 //               </CardTitle>
 //               <CardDescription>Real-time comparison of key indicators</CardDescription>
 //             </CardHeader>
 //             <CardContent>
 //               <ChartContainer
 //                 config={{
 //                   value: {
 //                     label: "Value",
 //                     color: "hsl(var(--chart-1))",
 //                   },
 //                 }}
 //                 className="h-[300px]"
 //               >
 //                 <ResponsiveContainer width="100%" height="100%">
 //                   <BarChart data={barData}>
 //                     <CartesianGrid strokeDasharray="3 3" />
 //                     <XAxis dataKey="name" />
 //                     <YAxis domain={[0, 100]} />
 //                     <ChartTooltip content={<ChartTooltipContent />} />
 //                     <Bar dataKey="value" fill="var(--color-chart-1)" radius={4} />
 //                   </BarChart>
 //                 </ResponsiveContainer>
 //               </ChartContainer>
 //             </CardContent>
 //           </Card>
 //           {/* Historical Trend */}
 //           <Card>
 //             <CardHeader>
 //               <CardTitle className="flex items-center gap-2">
 //                 <Activity className="w-5 h-5" />
 //                 Historical Trends
 //               </CardTitle>
 //               <CardDescription>Last 20 minutes of monitoring data</CardDescription>
 //             </CardHeader>
 //             <CardContent>
 //               <ChartContainer
 //                 config={{
 //                   stress: {
 //                     label: "Stress Level",
 //                     color: "hsl(var(--chart-1))",
 //                   },
 //                   confidence: {
 //                     label: "Confidence",
 //                     color: "hsl(var(--chart-3))",
 //                   },
 //                 }}
 //                 className="h-[300px]"
 //               >
 //                 <ResponsiveContainer width="100%" height="100%">
 //                   <LineChart data={historicalData}>
 //                     <CartesianGrid strokeDasharray="3 3" />
 //                     <XAxis dataKey="time" />
 //                     <YAxis domain={[0, 100]} />
 //                     <ChartTooltip content={<ChartTooltipContent />} />
 //                     <Line 
 //                       type="monotone" 
 //                       dataKey="stress" 
 //                       stroke="var(--color-chart-1)" 
 //                       strokeWidth={2}
 //                       dot={{ r: 4 }}
 //                     />
 //                     <Line 
 //                       type="monotone" 
 //                       dataKey="confidence" 
 //                       stroke="var(--color-chart-3)" 
 //                       strokeWidth={2}
 //                       dot={{ r: 4 }}
 //                     />
 //                   </LineChart>
 //                 </ResponsiveContainer>
 //               </ChartContainer>
 //             </CardContent>
 //           </Card>
 //         </div>
 //         {/* Status and Recommendations */}
 //         <Card>
 //           <CardHeader>
 //             <CardTitle className="flex items-center gap-2">
 //               <AlertTriangle className="w-5 h-5" />
 //               Analysis & Recommendations
 //             </CardTitle>
 //           </CardHeader>
 //           <CardContent>
 //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 //               <div className="p-4 bg-muted rounded-lg">
 //                 <h4 className="font-semibold mb-2">Current Status</h4>
 //                 <p className="text-sm text-muted-foreground">
 //                   {isMonitoring 
 //                     ? `Monitoring active. Last update: ${currentData.timestamp}`
 //                     : "Start monitoring to begin real-time analysis"
 //                   }
 //                 </p>
 //               </div>
 //               <div className="p-4 bg-muted rounded-lg">
 //                 <h4 className="font-semibold mb-2">Breathing Pattern</h4>
 //                 <p className="text-sm text-muted-foreground">
 //                   {currentData.breathingRate > 20 
 //                     ? "Elevated breathing detected. Try deep breathing exercises."
 //                     : "Breathing pattern appears normal."
 //                   }
 //                 </p>
 //               </div>
 //               <div className="p-4 bg-muted rounded-lg">
 //                 <h4 className="font-semibold mb-2">Stress Indicators</h4>
 //                 <p className="text-sm text-muted-foreground">
 //                   {currentData.stressLevel > 70 
 //                     ? "High stress detected. Consider taking a break."
 //                     : "Stress levels appear manageable."
 //                   }
 //                 </p>
 //               </div>
 //             </div>
 //           </CardContent>
 //         </Card>
 //       </div>
 //     </div>
 //   )
 // }
 // export default function Home() {
 //   return (
 //     <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
 //       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
 //         <Image
 //           className="dark:invert"
 //           src="/next.svg"
 //           alt="Next.js logo"
 //           width={180}
 //           height={38}
 //           priority
 //         />
 //         <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
 //           <li className="mb-2 tracking-[-.01em]">
 //             Get started by editing{" "}
 //             <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
 //               app/page.tsx
 //             </code>
 //             .
 //           </li>
 //           <li className="tracking-[-.01em]">
 //             Save and see your changes instantly.
 //           </li>
 //         </ol>
 //         <div className="flex gap-4 items-center flex-col sm:flex-row">
 //           <a
 //             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
 //             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
 //             target="_blank"
 //             rel="noopener noreferrer"
 //           >
 //             <Image
 //               className="dark:invert"
 //               src="/vercel.svg"
 //               alt="Vercel logomark"
 //               width={20}
 //               height={20}
 //             />
 //             Deploy now
 //           </a>
 //           <a
 //             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
 //             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
 //             target="_blank"
 //             rel="noopener noreferrer"
 //           >
 //             Read our docs
 //           </a>
 //         </div>
 //       </main>
 //       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
 //         <a
 //           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
 //           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
 //           target="_blank"
 //           rel="noopener noreferrer"
 //         >
 //           <Image
 //             aria-hidden
 //             src="/file.svg"
 //             alt="File icon"
 //             width={16}
 //             height={16}
 //           />
 //           Learn
 //         </a>
 //         <a
 //           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
 //           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
 //           target="_blank"
 //           rel="noopener noreferrer"
 //         >
 //           <Image
 //             aria-hidden
 //             src="/window.svg"
 //             alt="Window icon"
 //             width={16}
 //             height={16}
 //           />
 //           Examples
 //         </a>
 //         <a
 //           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
 //           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
 //           target="_blank"
 //           rel="noopener noreferrer"
 //         >
 //           <Image
 //             aria-hidden
 //             src="/globe.svg"
 //             alt="Globe icon"
 //             width={16}
 //             height={16}
 //           />
 //           Go to nextjs.org →
 //         </a>
 //       </footer>
 //     </div>
 //   );
 // }
_s(StressDashboard, "rGzCtXWFTqUs5rVTKlRAarubbMc=");
_c = StressDashboard;
var _c;
__turbopack_context__.k.register(_c, "StressDashboard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=frontend_fee61324._.js.map