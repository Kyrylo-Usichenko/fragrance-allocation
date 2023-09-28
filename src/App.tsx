import { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import './styles/index.css';

// const families = sets
// 	.map((set) => set.family)
// 	.filter((value, index, self) => self.indexOf(value) === index);
const BASE_URL = 'https://api.scentcraft.ai';
function App() {
	const [time, setTime] = useState('daylight');
	const [type, setType] = useState('sexy');
	const [search, setSearch] = useState('');
	const [searchedFragrance, setSearchedFragrance] = useState<any>(null);
	const [searchResults, setSearchResults] = useState<any>([]);
	const [cards, setCards] = useState<any>([]);
	const [result, setResult] = useState<any>(null);
	const [isSearching, setIsSearching] = useState(false);
	const [isAllocation, setIsAllocation] = useState(false);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(0);
	const [description, setDescription] = useState<any>(null);

	function shuffle(array: any) {
		let currentIndex = array.length,
			randomIndex;

		// While there remain elements to shuffle.
		while (currentIndex > 0) {
			// Pick a remaining element.
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}

		return array;
	}
	const handleSearch = async (value: string) => {
		setIsSearching(true);
		setResult(null);
		setCards([]);
		try {
			const response = await fetch(
				`https://api.scentcraft.ai/fragrances?s=${value}&page=${1}&perPage=${10}`
			);
			const data = await response.json();
			const newFragrances = data.data.fragrances;
			const newLimit = data.data.total;
			setPage(1);
			setLimit(newLimit);
			setSearchResults(newFragrances);
			setIsSearching(false);
		} catch (e) {
			setSearchResults([]);
			setIsSearching(false);
		}
	};

	const handlePaginate = async () => {
		setResult(null);
		try {
			const response = await fetch(
				`https://api.scentcraft.ai/fragrances?s=${search}&page=${page}&perPage=${10}`
			);
			const data = await response.json();
			const newFragrances = data.data.fragrances;
			const newLimit = data.data.total;
			setPage(page + 1);
			setLimit(newLimit);
			if (newFragrances.length === 0) {
				setResult([]);
				return;
			}
			setSearchResults([...searchResults, ...newFragrances]);
		} catch (e) {
			setSearchResults([]);
		}
	};

	const handleSubmit = useCallback(async () => {
		setIsAllocation(true);
		let gend = 'male';
		if (searchedFragrance.female === true) {
			gend = 'female';
			if (searchedFragrance.male === true) {
				gend = 'unisex';
			}
		}
		const family = searchedFragrance.family;
		const mainAccord = searchedFragrance.mainAccord.trim().replace(' ', ',');
		let finalFimaly = family.trim();
		if (searchedFragrance?.mainAccord !== '') {
			finalFimaly = `${family},${mainAccord}`;
		}
		const secondaryDescriptions = cards.filter(
			(desc: any) => JSON.stringify(desc) !== JSON.stringify(description)
		);

		try {
			const body = {
				gender: gend,
				familyPreference: finalFimaly,
				description: description,
				secondaryDescriptions: shuffle(secondaryDescriptions).slice(0, 2),
			};
			const res = await fetch(`${BASE_URL}/allocator`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});
			const data = await res.json();

			if (data.status !== 'ERROR') {
				setResult(data.data);
				setIsAllocation(false);
				return;
			}
		} catch (error) {
			setResult('No results found');
			setIsAllocation(false);
		}
	}, [
		searchedFragrance?.female,
		searchedFragrance?.family,
		searchedFragrance?.mainAccord,
		searchedFragrance?.description,
		searchedFragrance?.male,
		cards,
		description,
	]);
	useEffect(() => {
		if (!searchedFragrance) return;

		(async () => {
			let gend = 'male';
			if (searchedFragrance.female === true) {
				gend = 'female';
				if (searchedFragrance.male === true) {
					gend = 'unisex';
				}
			}
			const family = searchedFragrance.family;
			const mainAccord = searchedFragrance.mainAccord.trim().replace(' ', ',');
			let finalFimaly = family.trim();
			if (searchedFragrance?.mainAccord !== '') {
				finalFimaly = `${family},${mainAccord}`;
			}

			const newCardsRes = await fetch(
				`${BASE_URL}/fragrances/descriptions?gender=${gend}&families=${finalFimaly}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
			const newCards = await newCardsRes.json();
			setCards(newCards.data.descriptions);
		})();
	}, [searchedFragrance]);
	useEffect(() => {
		if (!description) return;
		handleSubmit();
	}, [description, handleSubmit]);
	useEffect(() => {
		handleSearch(search);
	}, []);
	const isDebounced = useDebouncedCallback((value) => handleSearch(value), 500);
	return (
		<>
			<div className='wrapper'>
				<div>
					<label>Choose your gender: </label>
					<select>
						<option value='feminine'>Feminine</option>
						<option value='masculine'>Masculine</option>
						<option value='unisex'>Unisex</option>
					</select>
				</div>
				<div>
					<label>IT'S MOSTLY FOR: </label>
					<select
						onChange={(e) => setTime(e.target.value)}
						value={time}
					>
						<option value='feminine'>Daylight</option>
						<option value='masculine'>Moonlight</option>
					</select>
				</div>
				<div>
					<label>LETS MAKE IT: </label>
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
				<h2>SELECT YOUR GO-TO FRAGRANCE</h2>
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
					{!isSearching && searchResults && (
						<InfiniteScroll
							dataLength={searchResults.length}
							next={handlePaginate}
							hasMore={searchResults.length < limit / 10}
							loader={<div />}
							endMessage={<div />}
							height={200}
						>
							{!isSearching &&
								searchResults?.map((fragrance: any, index: number) => {
									if (fragrance.family !== '')
										return (
											<span
												onClick={() => {
													setSearchedFragrance(fragrance);
													setResult(null);
												}}
												key={index}
											>
												{fragrance.name}
											</span>
										);
								})}
						</InfiniteScroll>
					)}
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
									setDescription(card);
								}}
								key={index}
							>
								{JSON.stringify(card.join(' '))}
							</button>
						))}
					</div>
				)}
				{!result?.message &&
					result?.mainScent?.map((item: any, index: number) => (
						<div
							key={index}
							className='result'
						>
							<h3>Your main fragrance is:</h3>
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
													<b>{key.toUpperCase()}</b>: {value as string}
												</div>
											))}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					))}
				{!result?.message && result?.secondaryScents && <h3>Your secondary fragrances is:</h3>}
				{!result?.message &&
					result?.secondaryScents?.map((item: any, index: number) => (
						<div
							key={index}
							className='result'
						>
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
											{Object.entries(item?.notes)?.map(([key, value]) => (
												<div key={key}>
													<b>{key.toUpperCase()}</b>: {value as string}
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
