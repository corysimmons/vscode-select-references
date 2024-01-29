import * as vscode from 'vscode';

let referenceLocations: vscode.Location[] = [];
let currentIndex = 0;

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
		// Reset state when the active editor changes
		referenceLocations = [];
		currentIndex = 0;
	}));

	let disposableSelectAll = vscode.commands.registerCommand('vscode-select-references.addReferencesToSelection', async () => {
		console.log('Executing command: addReferencesToSelection');

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			console.log('No active text editor');
			return;
		}

		const selection = editor.selection;
		const word = editor.document.getText(selection);
		if (!word) {
			console.log('No word selected');
			return;
		}

		try {
			const locations = await vscode.commands.executeCommand<vscode.Location[]>('vscode.executeReferenceProvider', editor.document.uri, selection.start);
			if (locations && locations.length > 0) {
				console.log('Found references:', locations.length);
				referenceLocations = locations;
				currentIndex = 0; // Reset the index

				const selections = locations.map(location => new vscode.Selection(location.range.start, location.range.end));
				editor.selections = selections;
			} else {
				console.log('No references found');
				referenceLocations = []; // Clear references if none found
			}
		} catch (err) {
			console.error('Error finding references:', err);
		}
	});

	let disposableAddNext = vscode.commands.registerCommand('vscode-select-references.addNextReferenceToSelection', () => {
		console.log('Executing command: addNextReferenceToSelection');
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			console.log('Command not executed: No active text editor');
			return;
		}
		if (referenceLocations.length === 0) {
			console.log('Command not executed: No references. Current referenceLocations:', referenceLocations);
			return;
		}

		console.log('Current Index:', currentIndex, 'Total References:', referenceLocations.length);
		if (currentIndex < referenceLocations.length) {
			const nextRef = referenceLocations[currentIndex++];
			console.log('Adding next reference:', nextRef);
			editor.selections = [...editor.selections, new vscode.Selection(nextRef.range.start, nextRef.range.end)];
		} else {
			console.log('No more references to add');
		}
	});


	context.subscriptions.push(disposableSelectAll, disposableAddNext);
}

export function deactivate() { }
