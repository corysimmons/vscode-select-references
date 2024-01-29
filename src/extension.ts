import * as vscode from 'vscode';

let referenceLocations: vscode.Location[] = [];
let currentIndex = 0;

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(() => {
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
				currentIndex = 0;
				const selections = locations.map(location => new vscode.Selection(location.range.start, location.range.end));
				editor.selections = selections;
			} else {
				console.log('No references found');
				referenceLocations = [];
			}
		} catch (err) {
			console.error('Error finding references:', err);
		}
	});

	context.subscriptions.push(disposableSelectAll);
}

export function deactivate() { }
