let options = []
let sel = 0
let oldSel = 0
let menuDone = () => { }


function put(str) {
    process.stdout.write(str)
}

function print(str) {
    put(str + '\n')
}

function hideCursor() {
    put('\x1b[?25l')
}

function showCursor() {
    put('\x1b[?25h')
}

function showOption(row, text) {
    process.stdout.moveCursor(0, row)
    print(text)
    process.stdout.moveCursor(0, - row - 1)
}

function inverse(str) {
    return '\x1b[7m' + str + '\x1b[0m'
}

function showSelection(options, sel, oldSel) {
    showOption(oldSel, options[oldSel])
    showOption(sel, inverse(options[sel]))
}

function moveSelection(delta) {
    if (sel + delta < 0 || sel + delta >= options.length)
        return
    oldSel = sel
    sel += delta
    showSelection(options, sel, oldSel)
}

function kbHandler(ch, key) {
    switch (key.name) {
        case 'escape': return menuDone(-1)
        case 'return': return menuDone(sel)
        case 'down': return moveSelection(1)
        case 'up': return moveSelection(-1)
    }
}


//------------------------- Vertical menu -------------------------

function putVerticalMenu(options) {
    for (let o of options) {
        print(o)
    }
    process.stdout.moveCursor(0, -options.length)
}

function verticalMenu({ menuOptions, done }) {
    sel = 0
    oldSel = 0
    options = menuOptions
    menuDone = done
    putVerticalMenu(options)
    showSelection(options, sel, oldSel)
    return kbHandler
}


//------------------------- Table menu -------------------------

function putTableMenu(options) {
    for (let o of options) {
        print(o)
    }
    process.stdout.moveCursor(0, -options.length)
}

function tableMenu({ menuOptions, columns, columnWidth, done }) {
    sel = 0
    oldSel = 0
    options = menuOptions
    menuDone = done
    putTableMenu(options)
    showSelection(options, sel, oldSel)
    return kbHandler
}


module.exports = {
    hideCursor,
    showCursor,
    verticalMenu,
    tableMenu
}
