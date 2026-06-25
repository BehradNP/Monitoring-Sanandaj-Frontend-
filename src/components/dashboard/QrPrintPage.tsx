"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown, FiSearch, FiDownload } from "react-icons/fi";

type HierNode = {
    id: string;
    title: string; // متن فارسی
    code?: string; // ComputerName مثل (MAY)
    children?: HierNode[];
};

type Row = {
    ip: string;
    mac: string;
    fullName: string;
    nationalId: string;
    userName: string;
    faTitle: string;
    computerName: string;
    number: string;
};

const BRAND_DARK = "#163647";
const BRAND_PRIMARY = "#2f7f86";
const BRAND_TOTAL = "#429195"; // همون رنگ سازمانی شما
const BRAND_SOFT = "#a1d0be";

const mockRegions = [
  { label: "مدیریت پیشگیری و ممیزی", value: "prevention" },
  { label: "Mashaghel", value: "mashaghel" },
  { label: "Area 1", value: "area1" },
  { label: "Area 2", value: "area2" },
  { label: "Area 3", value: "area3" },
  { label: "Area 4", value: "area4" },
];


const mockHierarchy: HierNode[] = [
    {
        id: "may",
        title: "شهرداری",
        code: "MAY",
        children: [
            {
                id: "mks",
                title: "سازمان حمل و نقل بار و مسافر",
                code: "MKS",
                children: [
                    { id: "to-mks-may", title: "کارشناس پایانه", code: "TO-MKS-MAY" },
                    { id: "to-mks-02", title: "پشتیبانی", code: "TO-MKS-02" },
                ],
            },
            {
                id: "san",
                title: "سازمان آتش نشانی",
                code: "SAN",
                children: [
                    { id: "to-san-ctrl", title: "اتاق فرمان", code: "TO-SAN-CTRL" },
                    { id: "to-san-02", title: "پشتیبانی", code: "TO-SAN-02" },
                ],
            },
        ],
    },
];

const mockRows: Row[] = [
    {
        ip: "172.16.28.39",
        mac: "CF:A4:6A:FA:D5:0E",
        fullName: "اردلان کسری",
        nationalId: "1234567890",
        userName: "Ardalan",
        faTitle: "کارشناس پایانه — سازمان حمل و نقل بار و مسافر",
        computerName: "TO-MKS-MAY",
        number: "1521",
    },
];

function Card({
    titleRight,
    titleLeft,
    children,
}: {
    titleRight: string;
    titleLeft?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div
                className="px-4 py-3 border-b border-slate-200 flex items-center justify-between rounded-t-2xl"
                style={{ backgroundColor: BRAND_DARK }}
            >

                <div className="text-white font-bold text-[13px]">{titleRight}</div>
                {titleLeft ? (
                    <div className="text-white/70 text-[12px]">{titleLeft}</div>
                ) : null}
            </div>
            {/* مهم: overflow-visible تا در حالت عادی هم کلیپ نشه */}
            <div className="p-4 overflow-visible">{children}</div>
        </section>
    );
}

/**
 * HierarchySelect
 * - dropdown با Portal رندر میشه => هیچوقت نصفه/بریده نمیشه
 * - با جستجو
 * - با باز/بسته شدن زیرمجموعه‌ها
 */
function HierarchySelect({
    label,
    placeholder,
    data,
    value,
    onChange,
}: {
    label: string;
    placeholder: string;
    data: HierNode[];
    value: HierNode | null;
    onChange: (node: HierNode | null) => void;
}) {
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [query, setQuery] = useState("");
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const [pos, setPos] = useState<{
        top: number;
        left: number;
        width: number;
    } | null>(null);

    useEffect(() => setMounted(true), []);

    const mockRegions = [
        { label: "مدیریت پیشگیری و ممیزی", value: "prevention" },
        { label: "Mashaghel", value: "mashaghel" },
        { label: "Area 1", value: "area1" },
        { label: "Area 2", value: "area2" },
        { label: "Area 3", value: "area3" },
        { label: "Area 4", value: "area4" },
    ];


    const close = () => {
        setOpen(false);
        setQuery("");
    };

    const recalc = () => {
        const el = btnRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setPos({
            top: r.bottom + 8,
            left: r.left,
            width: r.width,
        });
    };

    useEffect(() => {
        if (!open) return;
        recalc();

        const onScroll = () => recalc();
        const onResize = () => recalc();
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", onResize);
        };
    }, [open]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        if (open) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    // کلیک بیرون
    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            const t = e.target as Node;
            const btn = btnRef.current;
            if (!btn) return;
            if (btn.contains(t)) return;
            close();
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [open]);

    const flatMatches = useMemo(() => {
        if (!query.trim()) return null;

        const q = query.trim().toLowerCase();
        const results: HierNode[] = [];

        const walk = (nodes: HierNode[]) => {
            for (const n of nodes) {
                const text = `${n.title} ${n.code ?? ""}`.toLowerCase();
                if (text.includes(q) && n.code) results.push(n);
                if (n.children?.length) walk(n.children);
            }
        };

        walk(data);
        return results;
    }, [query, data]);

    const toggleExpand = (id: string) =>
        setExpanded((p) => ({ ...p, [id]: !p[id] }));

    const renderNode = (node: HierNode, depth = 0) => {
        const hasChildren = !!node.children?.length;
        const isExpanded = !!expanded[node.id];

        // وقتی جستجو فعاله، فقط نتایج flat نمایش داده میشن
        if (query.trim()) return null;

        return (
            <div key={node.id}>
                <div
                    className="flex items-center justify-between gap-2 py-2 px-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => {
                        // اگر leaf بود انتخاب کن
                        if (!hasChildren && node.code) {
                            onChange(node);
                            close();
                            return;
                        }
                        // اگر branch بود باز/بسته کن
                        if (hasChildren) toggleExpand(node.id);
                    }}
                    dir="rtl"
                    style={{ paddingRight: 8 + depth * 14 }}
                >
                    <div className="flex items-center gap-2">
                        {hasChildren ? (
                            <span
                                className="inline-flex w-6 h-6 items-center justify-center rounded-md hover:bg-slate-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(node.id);
                                }}
                                title="باز/بسته"
                            >
                                <span
                                    className={[
                                        "transition-transform",
                                        isExpanded ? "rotate-180" : "",
                                    ].join(" ")}
                                >
                                    ▾
                                </span>
                            </span>
                        ) : (
                            <span className="inline-block w-6" />
                        )}

                        <span className="text-[13px] text-slate-800 font-semibold">
                            {node.title}
                        </span>

                        {node.code ? (
                            <span className="text-[12px] text-slate-500">({node.code})</span>
                        ) : null}
                    </div>
                </div>

                {hasChildren && isExpanded ? (
                    <div>{node.children!.map((c) => renderNode(c, depth + 1))}</div>
                ) : null}
            </div>
        );
    };

    return (
        <div className="w-full">
            <label className="block text-[12px] font-bold text-slate-700 mb-2">
                {label}
            </label>

            <button
                ref={btnRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer"
                dir="rtl"
            >
                <span className="text-[13px] text-slate-700 truncate">
                    {value ? (
                        <>
                            {value.title}{" "}
                            {value.code ? (
                                <span className="text-slate-500">({value.code})</span>
                            ) : null}
                        </>
                    ) : (
                        <span className="text-slate-400">{placeholder}</span>
                    )}
                </span>

                <FiChevronDown className="text-slate-500 shrink-0" />
            </button>

            {mounted && open && pos
                ? createPortal(
                    <div
                        className="fixed inset-0 z-[9999]"
                        // کلیک روی بک‌دراپ => بستن
                        onMouseDown={() => close()}
                    >
                        <div
                            className="fixed bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
                            style={{
                                top: pos.top,
                                left: pos.left,
                                width: pos.width,
                            }}
                            // کلیک داخل خود پنل => بسته نشه
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            {/* Search */}
                            <div className="p-3 border-b border-slate-200">
                                <div className="relative">
                                    <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="جستجو..."
                                        className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-slate-200"
                                        dir="rtl"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* List */}
                            <div className="max-h-[320px] overflow-auto p-2">
                                {query.trim() && flatMatches ? (
                                    flatMatches.length ? (
                                        <div className="space-y-1">
                                            {flatMatches.map((n) => (
                                                <button
                                                    key={n.id}
                                                    type="button"
                                                    className="w-full text-right px-3 py-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                                                    dir="rtl"
                                                    onClick={() => {
                                                        onChange(n);
                                                        close();
                                                    }}
                                                >
                                                    <div className="text-[13px] font-semibold text-slate-800">
                                                        {n.title}
                                                        {n.code ? (
                                                            <span className="text-slate-500">
                                                                {" "}
                                                                ({n.code})
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-[13px] text-slate-500 py-10">
                                            چیزی پیدا نشد
                                        </div>
                                    )
                                ) : (
                                    <div>{data.map((n) => renderNode(n))}</div>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body
                )
                : null}
        </div>
    );
}

function SelectInput({
    label,
    placeholder,
    options,
    value,
    onChange,
}: {
    label: string;
    placeholder: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="w-full">
            <label className="block text-[12px] font-bold text-slate-700 mb-2">
                {label}
            </label>

            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none px-3 py-3 rounded-xl border border-slate-300 bg-white text-[13px] text-slate-800 font-medium outline-none focus:ring-2 focus:ring-slate-300"
                    dir="rtl"
                >
                    <option value="" className="text-slate-500">
                        {placeholder}
                    </option>

                    {options.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>

                {/* caret */}
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    ▾
                </span>
            </div>
        </div>
    );
}


function TextInput({
    label,
    placeholder,
    value,
    onChange,
}: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="w-full">
            <label className="block text-[12px] font-bold text-slate-700 mb-2">
                {label}
            </label>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-3 rounded-xl border border-slate-300 bg-white text-[13px] text-slate-800 placeholder:text-slate-500 font-medium outline-none focus:ring-2 focus:ring-slate-300"
                dir="rtl"
            />
        </div>
    );
}

export default function QrReportsPage() {
    const [region, setRegion] = useState<string>("");
    const [hier, setHier] = useState<HierNode | null>(null);
    const [number, setNumber] = useState<string>("");

    // اینجا فقط نمایش برای تست — در عمل شما با API فیلتر می‌کنی
    const filteredRows = useMemo(() => {
        // چون گفتی بک‌اند خودش از hier به computerName می‌رسه
        // اینجا شبیه‌سازی: اگر leaf انتخاب شد، همان code
        const selectedComputer = hier?.code ?? "";

        return mockRows.filter((r) => {
            if (number.trim() && !r.number.includes(number.trim())) return false;
            if (selectedComputer && r.computerName !== selectedComputer) return false;
            // region فعلاً نمایشی
            if (region.trim() && !region.includes(region.trim())) return false;
            return true;
        });
    }, [hier, number, region]);

    return (
        <div className="space-y-4">
            <Card titleRight="چاپ کیو آر کد" titleLeft="گزارشات تکمیلی">
                {/* Filters */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <SelectInput
                        label="انتخاب منطقه"
                        placeholder="انتخاب کنید..."
                        options={mockRegions}
                        value={region}
                        onChange={setRegion}
                    />


                    <HierarchySelect
                        label="دسته (سلسله مراتب)"
                        placeholder="انتخاب آیتم مورد نظر..."
                        data={mockHierarchy}
                        value={hier}
                        onChange={setHier}
                    />

                    <TextInput
                        label="شماره"
                        placeholder="مثلاً QR-1521"
                        value={number}
                        onChange={setNumber}
                    />
                </div>

                {/* ✅ دکمه‌ها زیر فیلترها */}
                <div className="mt-6 pt-2 flex flex-wrap gap-3 justify-start">
                    {/* جستجو - Primary */}
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold text-white shadow-md hover:shadow-lg transition cursor-pointer"
                        style={{ backgroundColor: BRAND_TOTAL }}
                        onClick={() => {
                            console.log("search", { region, hier, number });
                        }}
                    >
                        <FiSearch />
                        جستجو
                    </button>

                    {/* دانلود - Outline Contrast */}
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold border-2 transition cursor-pointer"
                        style={{
                            borderColor: BRAND_PRIMARY,
                            color: BRAND_PRIMARY,
                            backgroundColor: "white",
                        }}
                        onClick={() => {
                            console.log("download", { region, hier, number });
                        }}
                    >
                        <FiDownload />
                        دانلود گزارشات
                    </button>
                </div>

            </Card>

            {/* Results */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div className="font-bold text-[13px] text-slate-900">نتایج</div>
                    <div className="text-[12px] text-slate-600" dir="rtl">
                        تعداد: {filteredRows.length}
                    </div>
                </div>

                <div className="p-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-center">
                            <thead>
                                <tr className="text-[13px] text-slate-700 bg-slate-50">
                                    <th className="py-3 px-3 font-bold text-center">IP</th>
                                    <th className="py-3 px-3 font-bold text-center">MAC</th>
                                    <th className="py-3 px-3 font-bold text-center">نام و نام خانوادگی</th>
                                    <th className="py-3 px-3 font-bold text-center">کد ملی</th>
                                    <th className="py-3 px-3 font-bold text-center">UserName</th>
                                    <th className="py-3 px-3 font-bold text-center">عنوان فارسی کامپیوتر</th>
                                    <th className="py-3 px-3 font-bold text-center">Computer Name</th>
                                    <th className="py-3 px-3 font-bold text-center">شماره</th>
                                    <th className="py-3 px-3 font-bold text-center">عملیات</th>
                                </tr>
                            </thead>

                            <tbody className="text-[13px] text-slate-900">
                                {filteredRows.map((row, index) => (
                                    <tr
                                        key={index}
                                        className="border-t border-slate-200 hover:bg-slate-50 transition"
                                    >
                                        <td className="py-3 px-3 text-center">{row.ip}</td>
                                        <td className="py-3 px-3 text-center">{row.mac}</td>
                                        <td className="py-3 px-3 text-center font-semibold">{row.fullName}</td>
                                        <td className="py-3 px-3 text-center">{row.nationalId}</td>
                                        <td className="py-3 px-3 text-center">{row.userName}</td>
                                        <td className="py-3 px-3 text-center">{row.faTitle}</td>
                                        <td className="py-3 px-3 text-center font-mono">{row.computerName}</td>
                                        <td className="py-3 px-3 text-center">{row.number}</td>
                                        <td className="py-3 px-3 text-center">
                                            <div className="flex items-center justify-center gap-2">

                                                {/* دکمه اطلاعات */}
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
                                                    title="مشاهده اطلاعات سیستم"
                                                    onClick={() => {
                                                        // اینجا بعداً مودال رو باز می‌کنی
                                                        console.log("show system info", row);
                                                    }}
                                                >
                                                    i
                                                </button>

                                                {/* دکمه دانلود */}
                                                <button
                                                    type="button"
                                                    className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition shadow-sm"
                                                    style={{ backgroundColor: BRAND_DARK }}
                                                    onClick={() => {
                                                        console.log("download qr", row);
                                                    }}
                                                >
                                                    دانلود
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </section>
        </div>
    );
}
