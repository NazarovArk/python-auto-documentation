import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('python-auto-documentation.addComments', () => {
        vscode.window.showInformationMessage('Python Auto Documentation is running!');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('There is no active editor!');
            return;
        }

        const document = editor.document;
        const text = document.getText();
        const functionRegex = /\s*def\s+(\w+)\s*\((.*?)\):/g;
        const functionRegexWithReturn = /\s*def\s+(\w+)\s*\((.*?)\)\s+->\s+(\w+):/g;
        let edits: vscode.TextEdit[] = [];
        let match;

        while ((match = functionRegex.exec(text)) !== null) {
            const functionName = match[1];
            const args = match[2].split(',').map(arg => arg.trim()).filter(arg => arg);

            let commentLines = ['    \'\'\'', `    ${functionName}: *insert function description here*`, '', '    Arguments:'];
            for (const arg of args) {
                commentLines.push(`        ${arg}: *insert argument description here*`);
            }
            commentLines.push('');
            commentLines.push('    Returns:');
            commentLines.push('        *insert return description here*');
            commentLines.push('    \'\'\'');

            let functionStartPos = document.positionAt(match.index + match[0].length);
            let insertPos = document.lineAt(functionStartPos.line + 1).range.start;

            const commentText = commentLines.join('\n') + '\n';

            edits.push(vscode.TextEdit.insert(insertPos, commentText));
        }

        while ((match = functionRegexWithReturn.exec(text)) !== null) {
            const functionName = match[1];
            const args = match[2].split(',').map(arg => arg.trim()).filter(arg => arg);
            const returnValue = match[3];

            let commentLines = ['    \'\'\'', `    ${functionName}: *insert function description here*`, '', '    Arguments:'];
            for (const arg of args) {
                commentLines.push(`        ${arg}: *insert argument description here*`);
            }
            commentLines.push('');
            commentLines.push('    Returns:');
            commentLines.push(`        ${returnValue}: *insert return description here*`);
            commentLines.push('    \'\'\'');

            let functionStartPos = document.positionAt(match.index + match[0].length);
            let insertPos = document.lineAt(functionStartPos.line + 1).range.start;

            const commentText = commentLines.join('\n') + '\n';

            edits.push(vscode.TextEdit.insert(insertPos, commentText));
        }

        if (edits.length === 0) {
            vscode.window.showWarningMessage('Functions not found!');
            return;
        }

        const workspaceEdit = new vscode.WorkspaceEdit();
        workspaceEdit.set(document.uri, edits);
        vscode.workspace.applyEdit(workspaceEdit);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
