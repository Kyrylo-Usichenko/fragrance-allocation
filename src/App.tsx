import { useState } from 'react';
import './styles/index.css';

type Gender = 'male' | 'female' | 'unisex';

function App() {
	const [gender, setGender] = useState<Gender>('female');
	const [word1, setWord1] = useState<string>('Sparkling');
	const [word2, setWord2] = useState<string>('Juicy');
	const [word3, setWord3] = useState<string>('Cheerful');
	const [families, setFamilies] = useState<string[]>(['FLORAL']);
	const [result, setResult] = useState<any>(null);
	function handleChange(event: any) {
		setGender(event.target.value.toLowerCase());
	}

	function handleFamilyChange(e: any, i: number) {
		const newFamilies = [...families];
		// if this i exists, update it
		if (newFamilies[i]) {
			newFamilies[i] = e.target.value;
			setFamilies(newFamilies);
			return;
		}
		// otherwise, add it
		newFamilies[i] = e.target.value;
		setFamilies(newFamilies);
	}

	function handleDeleteFamily(i: number) {
		const newFamilies = [...families];
		newFamilies.splice(i, 1);
		setFamilies(newFamilies);
	}

	function handleAddFamily() {
		const newFamilies = [...families];
		newFamilies.push('');
		setFamilies(newFamilies);
	}

	async function handleSubmit() {
		const words = [word1, word2, word3].filter((word) => word !== '');
		const lastFamilies = families.filter((family) => family !== '');
		try {
			const body = {
				gender,
				description: words,
				familyPreference: lastFamilies,
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
						<option value='female'>Female</option>
						<option value='male'>Male</option>
						<option value='unisex'>Unisex</option>
					</select>
				</div>
				<div>
					{families.map((family, i: number) => (
						<div key={i}>
							<input
								value={family}
								type='text'
								onChange={(e) => handleFamilyChange(e, i)}
							/>
							{families.length > 1 && i !== 0 && (
								<button onClick={() => handleDeleteFamily(i)}>Delete</button>
							)}
						</div>
					))}
					{families.length < 3 && <button onClick={handleAddFamily}>Add one more family</button>}
				</div>
				<div>
					<p>Description word 1:</p>
					<input
						type='text'
						value={word1}
						onChange={(e) => setWord1(e.target.value)}
					/>
				</div>
				<div>
					<p>Description word 2:</p>
					<input
						type='text'
						value={word2}
						onChange={(e) => setWord2(e.target.value)}
					/>
				</div>
				<div>
					<p>Description word 3:</p>
					<input
						type='text'
						value={word3}
						onChange={(e) => setWord3(e.target.value)}
					/>
				</div>
				<button onClick={handleSubmit}>Send</button>
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
