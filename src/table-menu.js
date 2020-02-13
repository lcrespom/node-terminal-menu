const { put, print, inverse, removeAnsiColorCodes } = require('./terminal')


/*
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
    showSelection(config.selection, config.oldSel)
    if (!updating) config.menu = {
        keyHandler,
        update: (menuConfig) => tableMenu(menuConfig, true),
        selection: config.selection
    }
    return config.menu
}
*/


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

function padEndAnsi(str, maxLen, colorizer, filler = ' ') {
    let len = removeAnsiColorCodes(str).length
    if (len >= maxLen)
        return str
    return colorizer(str + filler.repeat(maxLen - len))
}


class TableMenu {

    constructor(config) {
        process.stdout.clearScreenDown()
        this.config = config
        this.initConfig(this.config)
        this.putTableMenu(this.config)
        this.showSelection(config.selection, config.oldSel)
    }

    initConfig(config) {
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
        if (config.descs && config.descRows === undefined) {
            config.descRows = 0
            for (let desc of config.descs)
                if (desc)
                    config.descRows = Math.max(
                        config.descRows, desc.split('\n').length)
        }
        // Colors
        this.initColors(config)
    }

    initColors(config) {
        let identity = s => s
        if (!config.colors)
            config.colors = {}
        let cols = config.colors
        if (!cols.item) cols.item = identity
        if (!cols.scrollArea) cols.scrollArea = identity
        if (!cols.scrollBar) cols.scrollBar = identity
        if (!cols.desc) cols.desc = identity
    }

    putTableMenu(config) {
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
        this.putScrollBar()
    }

    putScrollBar() {
        let config = this.config
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

    showSelection(sel, oldSel) {
        this.showItem(oldSel, this.config.items[oldSel])
        this.showItem(sel, inverse(this.config.items[sel]))
        this.showDesc(sel)
    }

    showItem(pos, text) {
        let config = this.config
        let col = pos % config.columns
        let row = Math.floor(pos / config.columns) - config.scrollStart
        if (row < 0) return // Out of scroll pane view
        process.stdout.moveCursor(col * config.columnWidth, row)
        print(config.colors.item(text))
        process.stdout.moveCursor(0, - row - 1)
    }

    showDesc(sel) {
        let config = this.config
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

    keyHandler(ch, key) {
        let config = this.config
        if (!key) return
        if (key.name == 'tab' && key.shift)
            key.name = 'shift-tab'
        else if (ch == 'q')
            key.name = 'escape'
        let itemsPerPage = config.columns * (config.height - 1)
        switch (key.name) {
            case 'escape':   return config.done(-1)
            case 'return':   return config.done(config.selection)
            case 'tab':
            case 'right':    return this.moveSelection(1)
            case 'shift-tab':
            case 'left':     return this.moveSelection(-1)
            case 'down':     return this.moveSelection(config.columns)
            case 'pagedown': return this.moveSelection(itemsPerPage)
            case 'up':       return this.moveSelection(-config.columns)
            case 'pageup':   return this.moveSelection(-itemsPerPage)
        }
    }

    moveSelection(delta) {
        let config = this.config
        config.oldSel = config.selection
        this.computeSelection(delta)
        if (config.selection == config.oldSel)
            return  // Nothing changed, do not update
        this.selection = config.selection
        if (this.adjustScrollStart())
            this.putTableMenu(config)
        this.showSelection(config.selection, config.oldSel)
    }

    computeSelection(delta) {
        let config = this.config
        let col = config.selection % config.columns
        if (config.selection + delta < 0) {
            if (delta == -1) return
            config.selection = col
        }
        else if (config.selection + delta >= config.items.length) {
            if (delta == 1) return
            config.selection = config.columns * (config.rows - 1) + col
            config.selection = Math.min(config.selection, config.items.length -1)
        }
        else {
            config.selection += delta
        }
    }

    adjustScrollStart() {
        let config = this.config
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

}


module.exports = {
    TableMenu,
    computeTableLayout
}