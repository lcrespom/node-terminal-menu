const {
    put, print, inverse, removeAnsiColorCodes, substrWithColors
} = require('./terminal')


let config = {}

function showItem(pos, text) {
    let col = pos % config.columns
    let row = Math.floor(pos / config.columns) - config.scrollStart
    if (row < 0) return // Out of scroll pane view
    process.stdout.moveCursor(col * config.columnWidth, row)
    if (removeAnsiColorCodes(text).length >= config.columnWidth)
        text = substrWithColors(text, 0, config.columnWidth - 1)
    print(text)
    process.stdout.moveCursor(0, - row - 1)
}

function showDesc(sel) {
    if (!config.descs) return
    let h = config.height
    process.stdout.moveCursor(0, h)
    process.stdout.clearScreenDown()
    let desc = config.descs[sel]
    if (desc) {
        let lines = desc.split('\n')
        h += lines.length
        let w = config.scrollBarCol || config.columns * config.columnWidth
        for (let line of lines)
            print(padEndAnsi(line, w, config.colors.desc))
    }
    process.stdout.moveCursor(0, -h)
}

function showSelection(sel, oldSel) {
    showItem(oldSel, config.colors.item(config.items[oldSel]))
    showItem(sel, config.colors.selectedItem(config.items[sel]))
    showDesc(sel)
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
        config.selection = Math.min(config.selection, config.items.length -1)
        //if (config.selection >= config.items.length) config.selection -= config.columns
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
    showSelection(config.selection, config.oldSel)
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
    }
}

function padEndAnsi(str, maxLen, colorizer, filler = ' ') {
    let len = removeAnsiColorCodes(str).length
    if (len >= maxLen) {
        str = substrWithColors(str, 0, maxLen - 1)
        len = maxLen - 1
    }
    return colorizer(str + filler.repeat(maxLen - len))
}

function putScrollBar() {
    if (config.scrollBarCol === undefined) return
    if (config.height >= config.rows) return
    let col = config.scrollBarCol
    // Paint scroll area
    process.stdout.moveCursor(col, -1)
    for (let i = 0; i < config.height; i++) {
        process.stdout.moveCursor(-1, 1)
        process.stdout.write(config.colors.scrollArea('\u2502'))
    }
    // Paint scroll bar
    let barH = Math.ceil(config.height * config.height / config.rows)
    let ssRate = config.scrollStart / (config.rows - config.height)
    let barY = Math.floor(ssRate * (config.height - barH))
    process.stdout.moveCursor(0, barY - config.height)
    for (let i = 0; i < barH; i++) {
        process.stdout.moveCursor(-1, 1)
        process.stdout.write(config.colors.scrollBar('\u2588'))
    }
    process.stdout.moveCursor(-col, 1 - barY - barH)
}

function putTableMenu() {
    let col = 0, row = 0
    let start = config.scrollStart * config.columns
    let end = start + config.height * config.columns
    let items = config.items.slice(start, end)
    for (let item of items) {
        put(padEndAnsi(item, config.columnWidth, config.colors.item))
        col++
        if (col >= config.columns) {
            print()
            col = 0
            row++
        }
    }
    if (col != 0) {
        process.stdout.clearScreenDown()
        for (let i = col; i < config.columns; i++)
            put(padEndAnsi('', config.columnWidth, config.colors.item))
        print()
        row++
    }
    for (let i = 0; i < config.descRows; i++)
        print()
    row += config.descRows
    // If no done function, menu is not interactive
    if (config.done)
        process.stdout.moveCursor(0, -row)
    putScrollBar()
}

function initColors() {
    let identity = s => s
    if (!config.colors)
        config.colors = {}
    let cols = config.colors
    if (!cols.item) cols.item = identity
    if (!cols.selectedItem) cols.selectedItem = inverse
    if (!cols.scrollArea) cols.scrollArea = identity
    if (!cols.scrollBar) cols.scrollBar = identity
    if (!cols.desc) cols.desc = identity
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
    else if (config.scrollStart + config.height > config.rows)
        config.scrollStart = config.rows - config.height
    // Descriptions
    config.descRows = 0
    if (config.descs && config.descRows === undefined) {
        for (let desc of config.descs)
            if (desc)
                config.descRows = Math.max(
                    config.descRows, desc.split('\n').length)
    }
    // Colors
    initColors()
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
    adjustScrollStart()
    putTableMenu()
    showSelection(config.selection, config.oldSel)
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