const keypress = require('keypress')

const { hideCursor, showCursor, verticalMenu } = require('../src')


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

function main() {
    items = ('zero one two three four five six seven-is-long ' +
        'eight nine ten eleven twelve thirteen fourteen').split(' ')
    hideCursor()
    let menu = verticalMenu({
        items,
        height: 5,
        selection: items.length - 1,
        done: menuDone
    })
    listenKeyboard((ch, key) => {
        if (ch == 'u') {        // Convert items to uppercase
            items = items.map(i => i.toUpperCase())
            menu.update({ items })
        }
        else if (ch == 'd') {   // Delete selected item
            items.splice(menu.selection, 1)
            menu.update({ items, selection: items.length - 1, scrollStart: 0 })
        }
        else menu.keyHandler(ch, key)
    })
}

main()
