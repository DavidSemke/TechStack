function initializeTinyMCE(selector) {
    const tinyMCEElement = document.querySelector(selector)

    if (!tinyMCEElement) {
        return
    }

    // Variable backendData is data provided by backend for rendering
    // See root.pug for the script that defines it
    let initialContent = backendData.blogPost.content || ''
    
    tinymce.init({
        selector: selector,
        plugins: 'lists link image table code help wordcount',
        menubar: 'file edit view insert table tools help',
        toolbar: 'undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | numlist bullist',
        promotion: false,
        image_file_types: 'jpeg,jpg,png,webp,gif',
        setup: (editor) => {
            editor.on('init', () => {
                editor.setContent(initialContent)
                const preview = document.querySelector('.blog-post-fragment__content')
                preview.innerHTML = editor.getContent()
            })
    
            editor.on('change', () => {
                editor.save()
                const preview = document.querySelector('.blog-post-fragment__content')
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