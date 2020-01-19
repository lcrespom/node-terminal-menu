const { put, print, inverse } = require('./terminal')


let config = {}

function showOption(pos, text) {
    let cols = config.columns + 1
    let col = pos % cols
    let row = Math.floor(pos / cols)
    process.stdout.moveCursor(col * config.columnWidth, row)
    print(text)
    process.stdout.moveCursor(0, - row - 1)
}

function showSelection(options, sel, oldSel) {
    showOption(oldSel, options[oldSel])
    showOption(sel, inverse(options[sel]))
}

function moveSelection(delta) {
    if (config.selection + delta < 0 ||
        config.selection + delta >= config.options.length)
        return
    config.oldSel = config.selection
    config.selection += delta
    showSelection(config.options, config.selection, config.oldSel)
}

function kbHandler(ch, key) {
    if (!key) return
    if (key.name == 'tab' && key.shift)
        key.name = 'shift-tab'
    else if (ch == 'q')
        key.name = 'escape'
    switch (key.name) {
        case 'escape': return config.done(-1)
        case 'return': return config.done(config.selection)
        case 'tab':
        case 'right': return moveSelection(1)
        case 'shift-tab':
        case 'left': return moveSelection(-1)
        case 'down': return moveSelection(config.columns + 1)
        case 'up': return moveSelection(-(config.columns + 1))
    }
}

function putTableMenu() {
    let col = 0, row = 0
    for (let o of config.options) {
        put(o + ' '.repeat(config.columnWidth - o.length))
        col++
        if (col > config.columns) {
            print('')
            col = 0
            row++
        }
    }
    if (col != 0) {
        print('')
        row++
    }
    process.stdout.moveCursor(0, -row)
}

function tableMenu(menuConfig) {
    config = menuConfig
    if (config.selection === undefined)
        config.selection = 0
    config.oldSel = 0
    putTableMenu()
    showSelection(config.options, config.selection, config.oldSel)
    return kbHandler
}

function computeTableLayout(options,
        gap = 2, totalWidth = process.stdout.columns) {
    let maxw = 0
    for (let option of options)
        if (option.length > maxw)
            maxw = option.length
    let columnWidth = maxw + gap
    let columns = Math.floor(totalWidth / columnWidth) - 1
    return [columns, columnWidth]
}

module.exports = {
    tableMenu,
    computeTableLayout
}