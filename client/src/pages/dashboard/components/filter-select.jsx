import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { MdClear } from "react-icons/md";
export default function FilterSelect({
	label,
	options,
	value,
	onChange,
	displayKey,
	onClear,
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const dropdownRef = useRef(null);

	const filteredOptions = options.filter((option) =>
		option[displayKey].toLowerCase().includes(searchTerm.toLowerCase()),
	);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="relative w-full" ref={dropdownRef}>
			<label
				htmlFor={label}
				className="block text-lg font-medium text-gray-700 mb-2"
			>
				{label}
			</label>
			<div
				className="w-full bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-3 cursor-pointer flex items-center justify-between text-lg"
				onClick={() => setIsOpen(!isOpen)}
			>
				<span className="truncate">
					{value ? value[displayKey] : `Select ${label}`}
				</span>
				<div className="flex items-center">
					{value && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								onClear();
							}}
							className="mr-2 text-gray-400 hover:text-gray-600"
							aria-label="Clear selection"
						>
							<MdClear className="h-5 w-5" />
						</button>
					)}
					<FaChevronDown className="h-5 w-5 text-gray-400" />
				</div>
			</div>
			{isOpen && (
				<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
					<div className="p-3">
						<div className="relative">
							<input
								type="text"
								className="w-full px-4 py-3 border border-gray-300 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-primary text-lg"
								placeholder="Search..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							<CiSearch className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
						</div>
					</div>
					<ul className="max-h-72 overflow-auto">
						{filteredOptions.map((option) => (
							<li
								key={option.id}
								className="px-4 py-3 hover:bg-primary/10 cursor-pointer text-lg"
								onClick={() => {
									onChange(option);
									setIsOpen(false);
								}}
							>
								{option[displayKey]}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
