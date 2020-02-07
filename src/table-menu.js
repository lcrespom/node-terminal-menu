const { put, print, inverse, removeAnsiColorCodes } = require('./terminal')


let config = {}

function showItem(pos, text) {
    let col = pos % config.columns
    let row = Math.floor(pos / config.columns) - config.scrollStart
    process.stdout.moveCursor(col * config.columnWidth, row)
    print(text)
    process.stdout.moveCursor(0, - row - 1)
}

function showSelection(items, sel, oldSel) {
    showItem(oldSel, items[oldSel])
    showItem(sel, inverse(items[sel]))
}

function adjustScrollStart() {
    // Compute row of current selection
    let row = Math.floor(config.selection / config.columns)
    // Check if current row is below visible area
    if (config.scrollStart + config.height <= row) {
        config.scrollStart = row - config.height + 1
        return true
    }
    // Check if current row is above visible area
    else if (config.scrollStart > row) {
        // Set scroll start to current row
        config.scrollStart = row
        return true
    }
    return false    
}

function computeSelection(delta) {
    let col = config.selection % config.columns
    if (config.selection + delta < 0) {
        if (delta == -1) return
        config.selection = col
    }
    else if (config.selection + delta >= config.items.length) {
        if (delta == 1) return
        config.selection = config.columns * (config.rows - 1) + col
    }
    else {
        config.selection += delta
    }
}

function moveSelection(delta) {
    config.oldSel = config.selection
    computeSelection(delta)
    if (config.selection == config.oldSel)
        return  // Nothing changed, do not update
    config.menu.selection = config.selection
    if (adjustScrollStart())
        putTableMenu()
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
        case 'pagedown': return moveSelection(config.columns * (config.height - 1))
        case 'up': return moveSelection(-config.columns)
        case 'pageup': return moveSelection(- config.columns * (config.height - 1))
        //TODO: pageup, pagedown
    }
}

function padEndAnsi(str, maxLen, filler = ' ') {
    let len = removeAnsiColorCodes(str).length
    if (len >= maxLen)
        return str
    return str + filler.repeat(maxLen - len)
}

function putTableMenu() {
    let col = 0, row = 0
    let start = config.scrollStart * config.columns
    let end = start + config.height * config.columns
    let items = config.items.slice(start, end)
    for (let item of items) {
        put(padEndAnsi(item, config.columnWidth))
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

function initConfig() {
    // Initialize selection
    if (config.selection === undefined)
        config.selection = 0
    else if (config.selection >= config.items.length)
        config.selection = config.items.length - 1
    config.oldSel = 0
    // Compute total number of rows
    config.rows = Math.ceil(config.items.length / config.columns)
    // Initialize height
    if (config.initialHeight)
        // Ignore height of previous version of menu
        config.height = config.initialHeight
    else
        // Remember height of first menu
        config.initialHeight = config.height
    // Initialize menu height in rows
    if (config.height === undefined || config.height > config.rows)
        config.height = config.rows
    // Scroll starting row
    if (config.scrollStart === undefined)
        config.scrollStart = 0
    // Do not scroll past bottom
    if (config.scrollStart + config.height > config.rows)
        config.scrollStart = config.rows - config.height
}

function tableMenu(menuConfig, updating = false) {
    process.stdout.clearScreenDown()
    if (updating)
        config = { ...config, ...menuConfig }
    else
        config = menuConfig
    initConfig()
    if (updating)
        config.menu.selection = config.selection
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