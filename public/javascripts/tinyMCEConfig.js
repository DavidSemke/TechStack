function initializeTinyMCE(selector) {
    const tinyMCEElement = document.querySelector(selector)

    if (!tinyMCEElement) {
        return
    }

    const textarea = document.getElementById('tinymce-app')
    const initialContent = textarea.innerText
    console.log(textarea)
    console.log(textarea.innerText)
    
    tinymce.init({
        selector: selector,
        plugins: 'lists link image table code help wordcount',
        menubar: 'file edit view insert table tools help',
        toolbar: 'undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | numlist bullist',
        promotion: false,
        setup: (editor) => {
            editor.on('init', () => {
                editor.setContent(initialContent)
                const preview = document.querySelector('.blog-preview__content')
                preview.innerHTML = editor.getContent()
            })
    
            editor.on('change', () => {
                editor.save()
                const preview = document.querySelector('.blog-preview__content')
                preview.innerHTML = editor.getContent()
            })

            editor.on('submit', () => {
                const wordCountInput = document.getElementById('word-count')
                wordCountInput.value = editor.plugins.wordcount.getCount()
            })
        }
    });
}

export {
    initializeTinyMCE
}