function Queue() {
    let front = null
    let end = null

    function Node(value, next=null) {
        return { value, next }
    }

    function enqueue(value) {
        const node = Node(value)

        if (!front) {
            front = node
            end = node
        }
        else {
            end.next = node
            end = node
        }
    }

    function dequeue() {
        if (!front) {
            return undefined
        }
        
        const removedNode = front
        front = front.next
        
        if (!front) {
            end = null
        }

        return removedNode.value
    }

    function isEmpty() {
        return front === null
    }

    return {enqueue, dequeue, isEmpty}
}

function PromiseQueue() {
    const queue = Queue()
    let isProcessing = false

    async function enqueue(value) {
        queue.enqueue(value)

        if (isProcessing) {
            return
        }

        isProcessing = true

        while (!queue.isEmpty()) {
            const operation = queue.dequeue()
            await operation()
        }

        isProcessing = false
    }

    return {enqueue}
}


export {
    PromiseQueue
}