import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let referenceLocations: vscode.Location[] = [];
	let currentIndex = 0;

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

	let disposableAddNext = vscode.commands.registerCommand('vscode-select-references.addNextReferenceToSelection', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			console.log('No active text editor');
			return;
		}

		if (referenceLocations.length === 0) {
			console.log('No references stored');
			return;
		}

		currentIndex = (currentIndex + 1) % referenceLocations.length;
		const nextReference = referenceLocations[currentIndex];
		const newSelection = new vscode.Selection(nextReference.range.start, nextReference.range.end);
		editor.selections = [...editor.selections, newSelection];
		editor.revealRange(newSelection, vscode.TextEditorRevealType.InCenter);
	});

	context.subscriptions.push(disposableSelectAll, disposableAddNext);
}

export function deactivate() { }
