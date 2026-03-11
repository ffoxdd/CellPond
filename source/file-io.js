//=========//
// FILE IO //
//=========//
const savePaddles = async () => {
	const pack = packPaddles()

	if (window.showSaveFilePicker) {
		try {
			const result = await showSaveFilePicker({
				excludeAcceptAllOption: true,
				suggestedName: 'spell',
				startIn: 'downloads',
				types: [{
					description: 'JSON',
					accept: {'application/json': [".json"]}
				}],
			})
			const writable = await result.createWritable();
			await writable.write(pack);
			await writable.close();
		} catch (err) {
			console.error('Failed to save file:', err);
		}
	} else {
		const blob = new Blob([pack], {type: 'application/json'});
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = 'spell.json';
		link.click();
		URL.revokeObjectURL(url);
	}
}

const openPaddles = () => {
	const opener = document.createElement('input')
	opener.type = "file"
	opener.onchange = async e => {
		const file = opener.files[0]
		const pack = await file.text()
		unpackPaddles(pack)
		Keyboard.Control = false
	}
	opener.click()
	Keyboard.Control = false
}

const copyPaddles = () => {
	const pack = packPaddles()
	print(pack)
	navigator.clipboard.writeText(pack)
}
