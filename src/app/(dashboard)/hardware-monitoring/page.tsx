"use client";
import React, { useState } from "react";
import { Eye } from "lucide-react";

type EmployeeSystem = {
    id: number;
    ip: string;
    mac: string;
    name: string;
    nationalId: string;
    username: string;
    pcFa: string;
    pcEn: string;
    number: number;
};

const devicesData: EmployeeSystem[] = [
    { id: 1, ip: "-", mac: "-", name: "پرینتر مالی", nationalId: "-", username: "-", pcFa: "HP LaserJet", pcEn: "hp-printer", number: 5001 },
    { id: 2, ip: "-", mac: "-", name: "اسکنر بایگانی", nationalId: "-", username: "-", pcFa: "Canon Scanner", pcEn: "canon-scanner", number: 5002 },
    { id: 3, ip: "-", mac: "-", name: "سوئیچ طبقه اول", nationalId: "-", username: "-", pcFa: "Cisco Switch", pcEn: "cisco-switch", number: 5003 },
    { id: 4, ip: "-", mac: "-", name: "اکسس پوینت", nationalId: "-", username: "-", pcFa: "Ubiquiti AP", pcEn: "ubiquiti-ap", number: 5004 },
];

const mockData: EmployeeSystem[] = [
    { id: 1, ip: "192.168.1.10", mac: "BC:AE:CA:9C:5A:CC", name: "علی رضایی", nationalId: "1234567890", username: "arezai", pcFa: "کامپیوتر مالی", pcEn: "finance-pc", number: 2549 },
    { id: 2, ip: "192.168.1.11", mac: "AC:1E:1V:B4:B4:11", name: "محمد احمدی", nationalId: "1112223334", username: "mahmadi", pcFa: "کامپیوتر اداری", pcEn: "office-pc", number: 2548 },
    { id: 3, ip: "192.168.1.12", mac: "BC:11:22:33:44:55", name: "حسن محمدی", nationalId: "2223334445", username: "hmohammadi", pcFa: "کامپیوتر حسابداری", pcEn: "accounting-pc", number: 2547 },
    { id: 4, ip: "192.168.1.13", mac: "AA:BB:CC:DD:EE:FF", name: "رضا احمدی", nationalId: "3334445556", username: "rahmadi", pcFa: "کامپیوتر مدیریت", pcEn: "manager-pc", number: 2546 },
    { id: 5, ip: "192.168.1.14", mac: "11:22:33:44:55:66", name: "مریم کاظمی", nationalId: "4445556667", username: "mkazemi", pcFa: "کامپیوتر منابع انسانی", pcEn: "hr-pc", number: 2545 },
];

function TabBtn({
    active,
    children,
    onClick,
}: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-200
        ${active
                    ? "text-[#2f7f86] border-[#2f7f86]"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
        >
            {children}
        </button>
    );
}

function InfoModal({ open, onClose }: any) {
    const [tab, setTab] = useState<"hardware" | "software">("hardware");

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[700px] rounded-2xl shadow-[0_8px_35px_rgba(0,0,0,0.15)] overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center px-8 py-6 bg-slate-50 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-700">جزئیات سیستم</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-200 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Segmented Tabs */}
                <div className="px-8 pt-5 pb-3 border-b border-slate-200">
                    <div className="flex gap-4">

                        <button
                            onClick={() => setTab("hardware")}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all
                                ${tab === "hardware"
                                    ? "bg-[#2f7f86] text-white shadow-sm"
                                    : "text-slate-700 hover:bg-slate-100"
                                }`}>
                            اطلاعات سخت‌افزار
                        </button>

                        <button
                            onClick={() => setTab("software")}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition
                                ${tab === "software"
                                    ? "bg-[#2f7f86] text-white shadow-sm"
                                    : "text-slate-700 hover:bg-slate-100"
                                }`}>
                            اطلاعات نرم‌افزار
                        </button>

                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {tab === "hardware" && (
                        <div className="space-y-4">
                            {[
                                ["CPU", "Intel i7"],
                                ["RAM", "16GB DDR4"],
                                ["Motherboard", "ASUS B560M"],
                                ["Storage", "512GB NVMe SSD"],
                                ["GPU", "NVIDIA GeForce RTX 3060"],
                            ].map(([label, value], index, arr) => (
                                <div
                                    key={label}
                                    className={`flex justify-between items-center pb-3 
                                    ${index !== arr.length - 1 ? "border-b border-slate-200" : ""}`}
                                >
                                    <span className="text-slate-600 font-medium">{label}:</span>
                                    <span className="text-slate-900 font-semibold">{value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === "software" && (
                        <div className="space-y-4">
                            {[
                                ["OS", "Windows 11 Pro (23H2)"],
                                ["Office", "Microsoft Office 2021 Professional"],
                                ["Browser", "Google Chrome (v120)"],
                                ["IDE", "Visual Studio Code (v1.85)"],
                            ].map(([label, value], index, arr) => (
                                <div
                                    key={label}
                                    className={`flex justify-between items-center pb-3 
                                    ${index !== arr.length - 1 ? "border-b border-slate-200" : ""}`}
                                >
                                    <span className="text-slate-600 font-medium">{label}:</span>
                                    <span className="text-slate-900 font-semibold">{value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-slate-50 text-end border-t border-slate-200">
                    <button
                        className="px-7 py-2.5 border rounded-lg bg-white hover:bg-slate-100 transition font-medium"
                        onClick={onClose}
                    >
                        بستن
                    </button>
                </div>

            </div>
        </div>
    );
}



export default function HardwareMonitoringPage() {
    const [tab, setTab] = useState<"network" | "devices">("network");
    const [modalOpen, setModalOpen] = useState(false);

    const data = tab === "network" ? mockData : devicesData;

    return (
        <div className="space-y-6 pt-4 px-4">

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-6 -mb-px">
                    <TabBtn active={tab === "network"} onClick={() => setTab("network")}>
                        شبکه
                    </TabBtn>

                    <TabBtn active={tab === "devices"} onClick={() => setTab("devices")}>
                        تجهیزات
                    </TabBtn>
                </div>
            </div>



            {/* Table */}
            <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">

                <table className="min-w-full text-xs text-center">

                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-3 py-4">IP</th>
                            <th className="px-3 py-4">MAC</th>
                            <th className="px-3 py-4">نام</th>
                            <th className="px-3 py-4">کدملی</th>
                            <th className="px-3 py-4">یوزرنیم</th>
                            <th className="px-3 py-4">عنوان فارسی</th>
                            <th className="px-3 py-4">عنوان انگلیسی</th>
                            <th className="px-3 py-4">شماره</th>
                            <th className="px-3 py-4 w-16 text-center">عملیات</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50 transition-colors">

                                <td className="px-3 py-3">{row.ip}</td>
                                <td className="px-3 py-3">{row.mac}</td>
                                <td className="px-3 py-3">{row.name}</td>
                                <td className="px-3 py-3">{row.nationalId}</td>
                                <td className="px-3 py-3">{row.username}</td>
                                <td className="px-3 py-3">{row.pcFa}</td>
                                <td className="px-3 py-3">{row.pcEn}</td>
                                <td className="px-3 py-3">{row.number}</td>

                                <td className="px-3 py-3 w-16">
  <div className="flex items-center justify-center">
    <button
      onClick={() => setModalOpen(true)}
      className="text-[#2f7f86] hover:text-[#1f5f64]"
    >
      <Eye size={18} />
    </button>
  </div>
</td>


                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>



            <InfoModal open={modalOpen} onClose={() => setModalOpen(false)} />

        </div>
    );
}
