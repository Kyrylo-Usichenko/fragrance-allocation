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
	function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
		setGender(event.target.value.toLowerCase());
	}
	const handleSearch = async (value: string) => {
		setResult(null);
		setCards([]);
		try {
			const response = await fetch(
				`https://api.scentcraft.ai/fragrances?s=${value}&page=${1}&perPage=${9999}`
			);
			const data = await response.json();
			const newFragrances = data.data.fragrances;
			setSearchResults(newFragrances);
		} catch (e) {
			setSearchResults([]);
		}
	};

	const handleSubmit = useCallback(async () => {
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
		} catch (error) {
			setResult('No results');
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
					type='text'
					placeholder='Type your favourite fragrances'
					onChange={(e) => {
						isDebounced(e.target.value);
						setSearch(e.target.value);
					}}
				/>
				<div className='searchField'>
					{searchResults?.map((fragrance: any, index: number) => (
						<div
							onClick={() => setSearchedFragrance(fragrance)}
							key={index}
						>
							{fragrance.name}
						</div>
					))}
				</div>
				{searchedFragrance && (
					<div>
						<h3>Here is your fragrance family: {searchedFragrance.family}</h3>
					</div>
				)}
				{cards.length !== 0 && (
					<div className='cardsWrapper'>
						<h3>Pick your fragrance description:</h3>
						{cards?.map((card: any, index: number) => (
							<div
								onClick={() => setFragrance(card)}
								key={index}
							>
								{JSON.stringify(card.description)}
							</div>
						))}
					</div>
				)}
				{!result?.message &&
					result?.map((item, index) => (
						<div
							key={index}
							className='result'
						>
							<h3>Your fragrance is:</h3>
							{/* map all result keys */}
							{Object.keys(item).map((key, index) => (
								<div key={index}>
									{key}: {JSON.stringify(item[key])}
								</div>
							))}
						</div>
					))}
				{result?.message && (
					<div>
						<h3>No results</h3>
					</div>
				)}
			</div>
		</>
	);
}

export default App;
