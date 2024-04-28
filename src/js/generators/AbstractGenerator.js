export default class AbstractGenerator {
    controller = null
    element = null
    
    constructor(controller) {
        this.controller = controller
        this.run()
    }
    
    run() {
        throw new Error('The "run" method was not implemented')
    }
}