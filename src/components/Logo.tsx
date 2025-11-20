import React from 'react';

type LogoProps = { compact?: boolean };

export default function Logo({ compact = false }: LogoProps) {
	if (compact) {
		return (
			<div className="flex items-center">
				<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded">
					<rect width="24" height="24" rx="5" fill="url(#g)" />
					<defs>
						<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0" stopColor="#0ea5e9" />
							<stop offset="1" stopColor="#2563eb" />
						</linearGradient>
					</defs>
					<g fill="white" opacity="0.95">
						<rect x="6" y="7" width="12" height="2" rx="1" />
						<rect x="6" y="11" width="12" height="2" rx="1" />
						<rect x="6" y="15" width="8" height="2" rx="1" />
					</g>
				</svg>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-3">
			<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-md">
				<rect width="24" height="24" rx="5" fill="url(#g2)" />
				<defs>
					<linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor="#0ea5e9" />
						<stop offset="1" stopColor="#2563eb" />
					</linearGradient>
				</defs>
				<g fill="white" opacity="0.98">
					<rect x="6" y="7" width="12" height="2" rx="1" />
					<rect x="6" y="11" width="12" height="2" rx="1" />
					<rect x="6" y="15" width="8" height="2" rx="1" />
				</g>
			</svg>
			<div className="leading-none">
				<div className="text-white font-bold">KampusConnect</div>
				<div className="text-slate-400 text-xs -mt-0.5">Forum Mahasiswa</div>
			</div>
		</div>
	);
}

