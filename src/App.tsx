import { useEffect, useMemo, useState } from 'react';
import './styles/index.css';
import { ingredientGroups, sets } from './utils/families';

type Gender = 'feminine' | 'masculine' | 'unisex';

function App() {
	const [gender, setGender] = useState<Gender>('feminine');

	const [family, setFamily] = useState<any>(ingredientGroups[0].family);
	const [result, setResult] = useState<any>(null);
	const [description, setDescription] = useState<any>('');
	function handleChange(event: any) {
		setGender(event.target.value.toLowerCase());
	}
	console.log(description);

	function handleFamilyChange(e: any) {
		setFamily(e.target.value);
	}

	async function handleSubmit() {
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
				familyPreference: [family],
				description: description,
			};
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
	}

	const setExists = useMemo(() => {
		const array = sets.filter((set) => set.family.includes(family));
		const newArray = array.filter((set) => set.gender.includes(gender));
		return newArray.length > 0;
	}, [family, gender]);

	useEffect(() => {
		if (sets.some((set) => set.family.includes(family))) {
			const array = sets.filter((set) => set.family.includes(family));
			const newArray = array.filter((set) => set.gender.includes(gender));
			setDescription(newArray[0].description);
		}
	}, [family, gender, setExists]);

	return (
		<>
			<div className='wrapper'>
				<div>
					<label htmlFor='gender'>Gender: </label>
					<select
						id='gender'
						onChange={handleChange}
						value={gender}
					>
						<option value='feminine'>Female</option>
						<option value='masculine'>Male</option>
						<option value='unisex'>Unisex</option>
					</select>
				</div>
				<div>
					<select
						id='families'
						value={family}
						onChange={handleFamilyChange}
					>
						{ingredientGroups.map((f, i) => {
							return <option key={i}>{f.family}</option>;
						})}
					</select>
				</div>
				{setExists && (
					<div>
						<select
							name=''
							id=''
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						>
							{sets.map((set, i) => {
								if (set.family.includes(family)) {
									if (set.gender.includes(gender)) {
										return (
											<option
												key={i}
												value={set.description}
											>
												{set.description.join(', ')}
											</option>
										);
									}
								}
							})}
						</select>
						<div>
							<button onClick={handleSubmit}>Send</button>
						</div>
					</div>
				)}

				{result && !result.message && (
					<div>
						your result:
						{typeof result === 'object' &&
							result.map((item: any, i: any) => (
								<div key={i}>
									{Object.keys(item).map((key) => (
										<p key={key}>
											{JSON.stringify(key)}: {JSON.stringify(item[key])}
										</p>
									))}
								</div>
							))}
					</div>
				)}
				{result && result.message && <p>No results</p>}
			</div>
		</>
	);
}

export default App;
