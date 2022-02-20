let invoked = []


class Test {

    runs = []

    autorun(fn) {
        const number = this.runs.length

        invoked = [];
        fn();
        console.log([...invoked])
        this.runs[number] = {deps: invoked}
    }

}

class Observable {
    constructor(val) {
        this._value = val;
    }

    get value() {
        invoked.push(this)
        return this._value
    }
}


const test = new Test();

const A = new Observable("A")
const B = new Observable("B")
const C = new Observable("C")


test.autorun(() => {
    console.log(C.value)
    console.log(A.value)
})


test.autorun(() => {
    console.log(B.value)
    console.log(A.value)
    console.log(C.value)
})

console.log(test.runs)