const keypress = require('keypress')

const {
    hideCursor, showCursor, tableMenu, computeTableLayout
} = require('../src')


function listenKeyboard(kbHandler) {
    process.stdin.setRawMode(true)
    process.stdin.resume()
    keypress(process.stdin)
    process.stdin.on('keypress', (ch, key) => {
        kbHandler(ch, key)
    })
}

function menuDone(selection) {
    process.stdout.clearScreenDown()
    console.log('Selection: ' + selection + ' - ' + items[selection])
    showCursor()
    process.exit(0)
}

let items = []


function initItems(rows, cols) {
    let result = []
    let i = 1
    for (let row = 1; row <= rows; row++)
        for (let col = 1; col <= cols; col++)
        result.push(`${i++}: row ${row}, col ${col}`)
    return result
}

function main() {
    const ROWS = 30, COLS = 5, COL_WIDTH = 22
    items = initItems(ROWS, COLS)
    items.push('Lorem')
    items.push('Ipsum')
    //let { columns, columnWidth } = computeTableLayout(items)
    hideCursor()
    let menu = tableMenu({
        items,
        columns: COLS,
        columnWidth: COL_WIDTH,
        done: menuDone,
        height: 10,
        scrollBarCol: 110
    })
    listenKeyboard((ch, key) => {
        if (ch == 'u') {        // Convert items to uppercase
            items = items.map(i => i.toUpperCase())
            menu.update({ items })
        }
        else if (ch == 'd') {   // Delete selected item
            items.splice(menu.selection, 1)
            menu.update({ items })
        }
        else menu.keyHandler(ch, key)
    })
}

main()
