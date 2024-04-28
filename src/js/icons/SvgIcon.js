export default class SvgIcon {
    constructor(path) {
        this.path = path
        this.xmlns = 'http://www.w3.org/2000/svg'
        this.viewBox = '0 0 24 24'
        this.focusable = false
        this.style = 'width: 27px; height: 27px;'
    }
    
    render() {
        return `<svg xmlns="${this.xmlns}" viewBox="${this.viewBox}" focusable="${this.focusable}" style="${this.style}">
            <path d="${this.path}"></path>
        </svg>`
    }
}