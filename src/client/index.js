import './style.css'
import { createElement } from './dom.js'

// pointer position
let pointerPosition = { x: 0, y: 0 }
const onPointerMove = (e) => {
    pointerPosition.x = e.layerX
    pointerPosition.y = e.layerY
}
document.body.addEventListener('pointermove', onPointerMove);

// api
const update = async () => {
    const data = await fetch('/blocs')
    const blocks = await data.json()
    blocks.forEach(addBox)
}
const send = async ({ x, y, msg }) => {
    return fetch('/bloc', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ x, y, msg })
    }).then(x => x.json())
}

// automata
const Fse = () => {
    let state = undefined
    let x = undefined
    let y = undefined
    const tell = (msg, data) => {
        if (state === undefined) {
            if (msg === 'add') {
                state = 'where'
                document.body.classList.add('where')
            } else if (msg === 'mousedown') {
                state = 'moving'
            }
        } else if (state === 'moving') {
            if ((msg === 'pointerleave') || (msg === 'mouseup')) {
                state = undefined
            } else if (msg = 'pointermove') {
                window.scrollBy(-data.movementX, -data.movementY)
            }
        } else if (state === 'where') {
            const $input = document.getElementById("content")
            const $div = document.getElementsByTagName("div")[0]
            if (msg === 'there') {
                state = 'what'
                document.body.classList.remove('where')
                document.body.classList.add('what')
                x = pointerPosition.x
                y = pointerPosition.y
                $input.focus()
                $input.click()
            }
        } else if (state === 'what') {
            const $input = document.getElementById("content")
            const $div = document.getElementsByTagName("div")[0]
            const $addButton = document.getElementsByClassName("add")[0]
            if (msg == 'cancel') {
                state = undefined
                document.body.classList.remove('what')
                $input.value = ''
                $addButton.focus()
            } else if (msg === 'validate') {
                state = undefined
                document.body.classList.remove('what')
                const msg = $input.value
                $input.value = ''
                send({ x, y, msg }).then(addBox)
                $addButton.focus()
            }
        }
    }
    return {
        message: name => (e) => {
            tell(name, e)
            e?.stopPropagation()
        }
    }
}
const fse = Fse()

// dom
const addBox = (box = {}) => {
    const check = (isNaN(parseFloat(box.x)) === false) && (isNaN(parseFloat(box.y)) === false) && (box.msg?.length > 0)
    if (check) {
        const { x, y, msg } = box
        document.body.append(
            createElement('p', 'box', msg, {
                style: `left: ${x}px; top: ${y}px`
            })
        )
    }
}

{
    const bar = createElement('div')
    document.body.append(bar)

    bar.append(createElement('button', 'add', 'add', undefined, {
        onclick: fse.message('add')
    }))

    document.body.onclick = fse.message('there')

    bar.append(createElement('input', undefined, undefined, {
        placeholder: 'type your text',
        id: 'content'
    }))

    bar.append(createElement('button', 'validate', 'ok', undefined, {
        onclick: fse.message('validate')
    }))

    bar.append(createElement('button', 'cancel', 'cancel', undefined, {
        onclick: fse.message('cancel')
    }))

    bar.append(createElement('span', 'location', '22'))

}

var cumulativeOffset = function (element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while (element);

    return {
        top: top,
        left: left
    };
};

const setScrollFromURLParams = () => {
    const url = new URL(document.location)
    const params = new URLSearchParams(url.search);
    const sx = params.get('x') || 0
    const sy = params.get('y') || 0
    const x = parseInt(sx)
    const y = parseInt(sy)
    window.scrollTo(x, y)
}
setScrollFromURLParams()

setInterval(() => {
    let url = new URL(document.location)
    let params = new URLSearchParams()//url.search);

    /*
    const x = pointerPosition.x
    const y = pointerPosition.y
    */
    const x = parseInt(window.pageXOffset)
    const y = parseInt(window.pageYOffset)

    params.set('x', x);
    params.set('y', y);
    history.replaceState("no", "no", "?" + params.toString())

    const $location = document.getElementsByClassName('location')[0]
    $location.textContent = `${pointerPosition.x} ${pointerPosition.y}`

}, 100)

update()


document.documentElement.addEventListener('pointerleave', fse.message('pointerleave'))
//document.documentElement.addEventListener('pointerenter', () => console.log('in'))
document.documentElement.addEventListener('mousedown', fse.message('mousedown'))
document.documentElement.addEventListener('mouseup', fse.message('mouseup'))
document.documentElement.addEventListener('pointermove', fse.message('pointermove'))