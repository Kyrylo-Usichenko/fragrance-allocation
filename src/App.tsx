import { useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import './styles/index.css';
import { sets } from './utils/families';

// const families = sets
// 	.map((set) => set.family)
// 	.filter((value, index, self) => self.indexOf(value) === index);

function App() {
	const [gender, setGender] = useState<string>('feminine');
	const [time, setTime] = useState('daylight');
	const [type, setType] = useState('sexy');
	const [search, setSearch] = useState('');
	const [searchedFragrance, setSearchedFragrance] = useState<any>(null);
	const [searchResults, setSearchResults] = useState<any>([]);
	const [cards, setCards] = useState<any>([]);
	const [fragrance, setFragrance] = useState<any>(null);
	const [result, setResult] = useState<any>(null);
	const [isSearching, setIsSearching] = useState(false);
	const [isAllocation, setIsAllocation] = useState(false);
	function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
		setGender(event.target.value.toLowerCase());
	}
	const handleSearch = async (value: string) => {
		setIsSearching(true);
		setResult(null);
		setCards([]);
		try {
			const response = await fetch(
				`https://api.scentcraft.ai/fragrances?s=${value}&page=${1}&perPage=${9999}`
			);
			const data = await response.json();
			const newFragrances = data.data.fragrances;
			setSearchResults(newFragrances);
			setIsSearching(false);
		} catch (e) {
			setSearchResults([]);
			setIsSearching(false);
		}
	};

	const handleSubmit = useCallback(async () => {
		setIsAllocation(true);
		let gend = 'male';
		if (gender === 'feminine') {
			gend = 'female';
		}
		if (gender === 'unisex') {
			gend = 'unisex';
		}

		try {
			const body = {
				gender: gend,
				familyPreference: [fragrance?.family],
				description: fragrance?.description,
			};
			console.log(body);

			const res = await fetch('https://api.scentcraft.ai/allocator', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});
			const data = await res.json();
			if (!data.message) {
				setResult(data.data);
			}
			setIsAllocation(false);
		} catch (error) {
			setResult('No results');
			setIsAllocation(false);
		}
	}, [fragrance?.description, fragrance?.family, gender]);
	useEffect(() => {
		if (!searchedFragrance) return;
		let filteredSets = sets;
		filteredSets = filteredSets
			.filter((set) => set.family === searchedFragrance?.family.toUpperCase())
			.map((set) => {
				if (set.family === 'CHYPRE & WOODY CHYPRE & FLORAL CHYPRE (3 familes combined)') {
					return {
						...set,
						family: 'WOODY CHYPRE',
					};
				}
				if (set.family === 'WOODY AQUATIC & AROMATIC AQUATIC COMBINED') {
					return {
						...set,
						family: 'WOODY AROMATIC',
					};
				}
				return set;
			});

		if (gender) filteredSets = filteredSets.filter((set) => set.gender.includes(gender));
		setCards(filteredSets);
	}, [searchedFragrance, gender]);

	useEffect(() => {
		if (!fragrance) return;
		handleSubmit();
	}, [fragrance, handleSubmit]);
	console.log(result);

	const isDebounced = useDebouncedCallback((value) => handleSearch(value), 500);
	return (
		<>
			<div className='wrapper'>
				<div>
					<label>Gender: </label>
					<select
						onChange={handleChange}
						value={gender}
					>
						<option value='feminine'>Feminine</option>
						<option value='masculine'>Masculine</option>
						<option value='unisex'>Unisex</option>
					</select>
				</div>
				<div>
					<label>Time: </label>
					<select
						onChange={(e) => setTime(e.target.value)}
						value={time}
					>
						<option value='feminine'>Daylight</option>
						<option value='masculine'>Moonlight</option>
					</select>
				</div>
				<div>
					<label>Type: </label>
					<select
						onChange={(e) => setType(e.target.value)}
						value={type}
					>
						<option value='Sexy'>Sexy</option>
						<option value='Elegant'>Elegant</option>
						<option value='Relaxed'>Relaxed</option>
						<option value='Elegant'>Fresh</option>
					</select>
				</div>
				<input
					value={search}
					className='search'
					type='text'
					placeholder='Type your favourite fragrances'
					onChange={(e) => {
						isDebounced(e.target.value);
						setSearch(e.target.value);
					}}
				/>
				<div className='searchField'>
					{isSearching && (
						<div className='lds-ring'>
							<div></div>
							<div></div>
							<div></div>
							<div></div>
						</div>
					)}
					{!isSearching &&
						searchResults?.map((fragrance: any, index: number) => (
							<span
								onClick={() => {
									setSearchedFragrance(fragrance);
									setResult(null);
								}}
								key={index}
							>
								{fragrance.name}
							</span>
						))}
				</div>
				{searchedFragrance && (
					<div>
						<h3>Here is your fragrance: </h3>
						<h4>family: {searchedFragrance.family}</h4>
						<h4>name: {searchedFragrance.name}</h4>
					</div>
				)}
				{cards.length !== 0 && (
					<div className='cardsWrapper'>
						<h3>Pick your fragrance description:</h3>
						{cards?.map((card: any, index: number) => (
							<button
								onClick={() => {
									setResult(null);
									setFragrance(card);
								}}
								key={index}
							>
								{JSON.stringify(card.description.join(' '))}
							</button>
						))}
					</div>
				)}
				{!result?.message &&
					result?.map((item: any, index: number) => (
						<div
							key={index}
							className='result'
						>
							<h3>Your fragrance is:</h3>
							{/* map all result keys */}
							<table>
								<tbody>
									<tr>
										<th>Name:</th>
										<td>{item.name}</td>
									</tr>
									<tr>
										<th>Code:</th>
										<td>{item.code}</td>
									</tr>
									<tr>
										<th>Notes</th>
										{/* item.notes is an object with fields, display it as a table */}
										<td>
											{Object.entries(item.notes).map(([key, value]) => (
												<div key={key}>
													<b>{key.toUpperCase()}</b>: {value}
												</div>
											))}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					))}
				{isAllocation && (
					<div className='lds-ring'>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				)}
				{!isAllocation && result?.message && (
					<div>
						<h3>No results</h3>
					</div>
				)}
			</div>
		</>
	);
}

export default App;
