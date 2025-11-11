// THEMING
let theme = 'light'
document.querySelector('button#toggle-theme').addEventListener("click", async function () {

    if (theme === 'light') {
        theme = 'dark'
        document.querySelector('body').classList.add('dark-theme')
        monaco.editor.setTheme('catppuccin-frappe')
    } else {
        theme = 'light'
        document.querySelector('body').classList.remove('dark-theme')
        monaco.editor.setTheme('catppuccin-latte')
    }
})

/**
 * We use Catppuccin Frappe and Catppuccin Latte for dark and light mode theming in the editor
 * The specific color values used are retrieved from https://catppuccin.com/palette/
 * Theme definitions based off the Catppuccin VSCode theme found in https://github.com/catppuccin/vscode
 */

function defineCatppuccinFrappeTheme() {
    if (typeof monaco === 'undefined') {
        console.error('Monaco editor instance not found. Ensure the editor is loaded.');
        return;
    }

    monaco.editor.defineTheme('catppuccin-frappe', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '737994', fontStyle: 'italic' }, // subtext0
            { token: 'string', foreground: 'a6d189' }, // green
            { token: 'number', foreground: '99ccff' }, // blue
            { token: 'keyword', foreground: 'ca9ee6' }, // mauve
            { token: 'identifier', foreground: 'c6d0f5' }, // text
            { token: 'type', foreground: '89dceb' }, // teal
            { token: 'function', foreground: 'f0c6c6' }, // flamingo
            { token: 'variable', foreground: 'c6d0f5' }, // text
            { token: 'delimiter', foreground: '6e738d' }, // surface1
            { token: 'annotation', foreground: 'f4b8e4' }, // pink
            { token: 'operator', foreground: '89dceb' }, // teal
        ],
        colors: {
            'editor.background': '#303446', // base
            'editor.foreground': '#c6d0f5', // text
            'editor.inactiveForeground': '#6e738d', // surface1
            'editorIndentGuide.background': '#414559', // surface0
            'editorIndentGuide.activeBackground': '#51576d', // surface1 (darker for active)
            'editorRuler.foreground': '#51576d', // surface1
            'editor.selectionBackground': '#414559', // surface0
            'editor.selectionHighlightBackground': '#414559', // surface0
            'editor.wordHighlightBackground': '#414559', // surface0
            'editor.wordHighlightStrongBackground': '#51576d', // surface1
            'editorCursor.foreground': '#f4b8e4', // pink
            'editorLineNumber.foreground': '#6e738d', // surface1
            'editorLineNumber.activeForeground': '#9ca0b0', // subtext1
            'editorLink.activeForeground': '#89dceb', // teal
            'editorOverviewRuler.border': '#414559', // surface0
            'editorWidget.background': '#292c3c', // mantle
            'editorSuggestWidget.background': '#292c3c', // mantle
            'editorSuggestWidget.border': '#414559', // surface0
            'editorSuggestWidget.selectedBackground': '#51576d', // surface1
            'editorHoverWidget.background': '#292c3c', // mantle
            'editorHoverWidget.border': '#414559', // surface0
            'editorGutter.background': '#303446', // base
            'editor.lineHighlightBackground': '#414559', // surface0
            'editor.lineHighlightBorder': '#414559', // surface0
            'list.activeSelectionBackground': '#51576d', // surface1
            'list.inactiveSelectionBackground': '#414559', // surface0
            'list.hoverBackground': '#414559', // surface0
            'scrollbarSlider.background': '#51576d', // surface1
            'scrollbarSlider.hoverBackground': '#6e738d', // surface2
            'scrollbarSlider.activeBackground': '#6e738d', // surface2
            'editorError.foreground': '#e78284', // red
            'editorWarning.foreground': '#ef9f76', // peach
            'editorInfo.foreground': '#89dceb', // teal
        },
    });
}

function defineCatppuccinLatteTheme() {
    monaco.editor.defineTheme('catppuccin-latte', {
        base: 'vs',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '6c6f85', fontStyle: 'italic' }, // Subtext 0
            { token: 'string', foreground: '40a02b' }, // Green
            { token: 'number', foreground: '1e66f5' }, // Blue
            { token: 'keyword', foreground: '8839ef' }, // Mauve
            { token: 'identifier', foreground: '4c4f69' }, // Text
            { token: 'type', foreground: '179299' }, // Teal
            { token: 'function', foreground: 'dd7878' }, // Flamingo
            { token: 'variable', foreground: '4c4f69' }, // Text
            { token: 'delimiter', foreground: 'acb0be' }, // Surface 2
            { token: 'annotation', foreground: 'ea76cb' }, // Pink
            { token: 'operator', foreground: '179299' }, // Teal
        ],
        colors: {
            'editor.background': '#eff1f5', // Base
            'editor.foreground': '#4c4f69', // Text
            'editor.inactiveForeground': '#7c7f93', // Overlay 2
            'editorIndentGuide.background': '#ccd0da', // Surface 0
            'editorIndentGuide.activeBackground': '#bcc0cc', // Surface 1
            'editorRuler.foreground': '#bcc0cc', // Surface 1
            'editor.selectionBackground': '#ccd0da', // Surface 0
            'editor.selectionHighlightBackground': '#ccd0da', // Surface 0
            'editor.wordHighlightBackground': '#ccd0da', // Surface 0
            'editor.wordHighlightStrongBackground': '#acb0be', // Surface 2
            'editorCursor.foreground': '#ea76cb', // Pink
            'editorLineNumber.foreground': '#6c6f85', // Subtext 0
            'editorLineNumber.activeForeground': '#5c5f77', // Subtext 1
            'editorLink.activeForeground': '#179299', // Teal
            'editorOverviewRuler.border': '#ccd0da', // Surface 0
            'editorWidget.background': '#e6e9ef', // Mantle
            'editorSuggestWidget.background': '#e6e9ef', // Mantle
            'editorSuggestWidget.border': '#ccd0da', // Surface 0
            'editorSuggestWidget.selectedBackground': '#acb0be', // Surface 2
            'editorHoverWidget.background': '#e6e9ef', // Mantle
            'editorHoverWidget.border': '#ccd0da', // Surface 0
            'editorGutter.background': '#eff1f5', // Base
            'editor.lineHighlightBorder': '#ccd0da', // Surface 0
            'list.activeSelectionBackground': '#acb0be', // Surface 2
            'list.inactiveSelectionBackground': '#ccd0da', // Surface 0
            'list.hoverBackground': '#ccd0da', // Surface 0
            'scrollbarSlider.background': '#acb0be', // Surface 2
            'scrollbarSlider.hoverBackground': '#9ca0b0', // Overlay 0
            'scrollbarSlider.activeBackground': '#9ca0b0', // Overlay 0
            'editorError.foreground': '#d20f39', // Red
            'editorWarning.foreground': '#fe640b', // Peach
            'editorInfo.foreground': '#04a5e5', // Sky
        },
    });
}
