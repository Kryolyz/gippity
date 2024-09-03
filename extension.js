// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { OpenAI } = require('openai');
// import OpenAI from 'openai';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, "gippity" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('gippity.helloWorld', function () {
		vscode.window.showInformationMessage('Hello World from gippity!');
	});

	let sendSelection = vscode.commands.registerCommand("gippity.sendSelection", async function () {
		const editor = vscode.window.activeTextEditor;

		// Check if a file is open
		if (!editor) {
			console.error("No active editor - no file is open.");
			return;
		}

		// Check if a text selection is made
		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);
		if (!selectedText) {
			console.error("No text selected.");
			return;
		}

		const apiKey = vscode.workspace.getConfiguration().get('gippity.apiKey');
		const openai = new OpenAI({ apiKey: apiKey });

		// Get the entire file content for context
		const fullText = editor.document.getText();

		// System message for the AI
		const systemMessage = `
            You are a helpful AI assistant. The user is working with code. You are presented with the entire file and a selection of text within in.
            Within the selected code, comments that start with "instruction" represent instructions 
            that you need to fulfill. Replace the selected text with your response. 
            Consider the full file for context, but only replace the selected part with your output.
        `;

		const modelName = vscode.workspace.getConfiguration().get('gippity.model');
		try {
			const response = await openai.chat.completions.create({
				model: modelName,
				temperature: 0, // Set temperature to 0 for deterministic responses
				messages: [
					{ role: "system", content: systemMessage },
					{
						role: "user",
						content: `Here is the entire file for context:\n\n${fullText}\n\nPlease fulfill the request in this selected code: ${selectedText}`,
					},
				],
				stream: true, // Enable streaming
			});

			// Stream and replace selected text in real-time
			let replacementText = "";
			let replacementTextFixed = "";
			let currentPosition = selection.start;
			let insideBackticks = false;
			let buffer = ""; // To accumulate text until we process it

			// Step 1: Delete the selected text first
			await editor.edit((editBuilder) => {
				editBuilder.delete(selection);
			});

			for await (const part of response) {
				let delta = part.choices[0].delta.content;
				if (delta) {
					// Accumulate the delta into the buffer until we process it
					buffer += delta;

					// Check if we are inside the triple backticks
					if (!insideBackticks) {
						const firstBacktickIndex = buffer.indexOf("\n");
						if (firstBacktickIndex !== -1) {
							// Found the first occurrence of triple backticks, start processing after it
							buffer = buffer.slice(firstBacktickIndex + 3); // Remove the backticks themselves
							insideBackticks = true; // Now we are inside the backticks
						} else {
							// If backticks haven't appeared yet, continue buffering
							continue;
						}
					}

					// If inside the triple backticks, process the content line by line
					let newlineIndex;
					while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
						let line = buffer.slice(0, newlineIndex + 1); // Extract the line including newline

						// Insert the full line into the file
						await editor.edit((editBuilder) => {
							editBuilder.insert(currentPosition, line);
						});

						// Update the current position to the end of the newly inserted line
						currentPosition = currentPosition.translate(1, 0); // Move to the start of the next line

						// Remove the processed line from the buffer
						buffer = buffer.slice(newlineIndex + 1);
					}

					// Check if there's an ending backtick
					const endBacktickIndex = buffer.indexOf("```");
					if (endBacktickIndex !== -1) {
						// Found the ending backticks, extract the content and stop further processing
						buffer = buffer.slice(0, endBacktickIndex);
						insideBackticks = false; // End processing after this
					}

					console.log(buffer);
				}
			}
			vscode.window.showInformationMessage(replacementText);
			// console.log(replacementText);
			// console.log(replacementTextFixed);

		} catch (error) {
			console.error("Failed to get a response from OpenAI API:", error);
			vscode.window.showErrorMessage("Failed to get response from OpenAI API. Check the console for details.");
		}
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(sendSelection);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
