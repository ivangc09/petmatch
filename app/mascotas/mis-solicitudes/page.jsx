"use client";

import React from "react";
import Link from "next/link";
import VeterinarioHeader from "@/components/VeterinarioHeader";
import { useToast } from "@/components/FeedBack";

import useSolicitudes from "@/hooks/useSolicitudes";
import FiltersBar from "@/components/FiltersBar";
import SolicitudesTable from "@/components/SolicitudesTable";
import Pagination from "@/components/Pagination";
import SolicitudModal from "@/components/SolicitudModal";

export default function Page() {
	const { show } = useToast();

	const {
		items, count, loading, error,
		page, setPage, pageSize, setPageSize,
		search, setSearch, petId, setPetId,
		fetchData, token, baseUrl, formatDate, boolStr, totalPages,
	} = useSolicitudes({ defaultPageSize: 10 });

	// Modal
	const [detail, setDetail] = React.useState(null);

	return (
		<div>
			<VeterinarioHeader />

			<div className="min-h-screen bg-gradient-to-b from-[#fff6f1] to-[#fdeee7]">
				<div className="mx-auto max-w-6xl px-4 py-8">
					<header className="mb-6 flex items-center justify-between">
					<div>
						<nav className="text-sm text-[#6b7076]">
							<Link href="/veterinario" className="hover:underline">Panel</Link>
							<span className="mx-2">/</span>
							<span className="text-[#2b3136]/80 font-medium">Solicitudes</span>
						</nav>
						<h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-[#2b3136]">Solicitudes de mis mascotas</h1>
						<p className="text-sm text-[#6b7076] mt-1">{count ? `${count} resultado${count === 1 ? "" : "s"}` : "—"}</p>
					</div>
					</header>

					<FiltersBar
						search={search} setSearch={setSearch}
						petId={petId} setPetId={setPetId}
						pageSize={pageSize} setPageSize={(n) => { setPage(1); setPageSize(n); }}
						onApply={() => { setPage(1); fetchData(); }}
					/>

					<div className="bg-white rounded-2xl shadow p-6 md:p-8 space-y-6">
						<SolicitudesTable
							items={items}
							loading={loading}
							error={error}
							formatDate={formatDate}
							onOpenDetail={(s) => setDetail(s)}
						/>		
						<Pagination page={page} setPage={(p) => { setPage(p); }} totalPages={totalPages} />
					</div>
				</div>

				<SolicitudModal
					detail={detail}
					onClose={() => setDetail(null)}
					onAccepted={fetchData}
					baseUrl={baseUrl}
					token={token}
					formatDate={formatDate}
					boolStr={boolStr}
					show={show}
				/>
			</div>
		</div>
	);
}
