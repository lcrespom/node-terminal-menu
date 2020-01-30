const { put, print, inverse, removeAnsiColorCodes } = require('./terminal')


let config = {}

function showItem(pos, text) {
    let col = pos % config.columns
    let row = Math.floor(pos / config.columns)
    process.stdout.moveCursor(col * config.columnWidth, row)
    print(text)
    process.stdout.moveCursor(0, - row - 1)
}

function showSelection(items, sel, oldSel) {
    showItem(oldSel, items[oldSel])
    showItem(sel, inverse(items[sel]))
}

function moveSelection(delta) {
    if (config.selection + delta < 0 ||
        config.selection + delta >= config.items.length)
        return
    config.oldSel = config.selection
    config.selection += delta
    config.menu.selection = config.selection
    showSelection(config.items, config.selection, config.oldSel)
}

function keyHandler(ch, key) {
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
        case 'down': return moveSelection(config.columns)
        case 'up': return moveSelection(-config.columns)
    }
}

function putTableMenu() {
    let col = 0, row = 0
    for (let item of config.items) {
        let len = removeAnsiColorCodes(item).length
        put(item + ' '.repeat(config.columnWidth - len))
        col++
        if (col >= config.columns) {
            print('')
            col = 0
            row++
        }
    }
    if (col != 0) {
        print('')
        row++
    }
    // If no done function, menu is not interactive
    if (config.done)
        process.stdout.moveCursor(0, -row)
}

function tableMenu(menuConfig, updating = false) {
    if (updating) {
        process.stdout.clearScreenDown()
        config = { ...config, ...menuConfig }
        if (config.selection >= config.items.length)
            config.selection = config.items.length - 1
        config.menu.selection = config.selection
    }
    else {
        config = menuConfig
        if (config.selection === undefined)
            config.selection = 0
    }
    config.oldSel = 0
    putTableMenu()
    showSelection(config.items, config.selection, config.oldSel)
    if (!updating) config.menu = {
        keyHandler,
        update: (menuConfig) => tableMenu(menuConfig, true),
        selection: config.selection
    }
    return config.menu
}

function computeTableLayout(items,
        gap = 2, totalWidth = process.stdout.columns) {
    let maxw = 0
    for (let item of items)
        maxw = Math.max(maxw, removeAnsiColorCodes(item).length)
    let columnWidth = maxw + gap
    let columns = Math.floor(totalWidth / columnWidth)
    let rows = Math.ceil(items.length / columns)
    return { rows, columns, columnWidth }
}

module.exports = {
    tableMenu,
    computeTableLayout
}