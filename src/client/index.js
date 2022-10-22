import './style.css'
let pointerPosition = { x: 0, y: 0 }
const onPointerMove = (e) => {
    pointerPosition.x = e.layerX
    pointerPosition.y = e.layerY
}
document.body.addEventListener('pointermove', onPointerMove);

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
const addBox = (box = {}) => {
    const check = (isNaN(parseFloat(box.x)) === false) && (isNaN(parseFloat(box.y)) === false) && (box.msg?.length > 0)
    if (check) {
        const { x, y, msg } = box
        const $p = createElement('p', 'box', msg, {
            style: `left: ${x}px; top: ${y}px`
        })
        document.body.append($p)
    }
}
const Fse = () => {
    let state = undefined
    let x = undefined
    let y = undefined
    const tell = msg => {
        if (state === undefined) {
            if (msg === 'add') {
                state = 'where'
                document.body.classList.add('where')
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
            tell(name)
            e?.stopPropagation()
        }
    }
}

const fse = Fse()
import { createElement } from './dom.js'
{
    const bar = createElement('div')
    document.body.append(bar)
    {
        const $buttonAdd = createElement('button', 'add', 'add')
        $buttonAdd.onclick = fse.message('add')
        bar.append($buttonAdd)
    }

    document.body.onclick = fse.message('there')
    {
        const $textInput = createElement('input', undefined, undefined, {
            placeholder: 'type your text'
        })
        $textInput.id = 'content'
        bar.append($textInput)
    }

    {
        const $buttonValidate = createElement('button', 'validate', 'ok')
        $buttonValidate.onclick = fse.message('validate')
        bar.append($buttonValidate)
    }
    {
        const $buttonValidate = createElement('button', 'cancel', 'cancel')
        $buttonValidate.onclick = fse.message('cancel')
        bar.append($buttonValidate)
    }
    {
        const $location = createElement('span', 'location', '22')
        bar.append($location)
    }
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

setInterval(() => {
    let url = new URL(document.location)
    let params = new URLSearchParams()//url.search);

    params.set('x', pointerPosition.x);
    params.set('y', pointerPosition.y);
    history.replaceState("no", "no", "?" + params.toString())

    const $location = document.getElementsByClassName('location')[0]
    $location.textContent = `${pointerPosition.x} ${pointerPosition.y}`

}, 100)

update()
