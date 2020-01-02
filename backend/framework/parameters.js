class Parameters {
    #commands = [];
    #flags = {};
    #params = {};

    constructor(argv) {
        let command = true, param = null;
        for(let arg of argv) {
            if(arg.startsWith('--')) {
                command = false;
                if(param == null) {
                    param = arg.substr(2)
                }else{
                    throw new Error(`value of ${param} cannot start with --`)
                }
            }else if(arg.startsWith('-')) {
                this.#flags[arg.substr(1)] = null
            }else if(param != null) {
                this.#params[param] = arg;
                param = null;
            }else if(command) {
                this.#commands.push(arg)
            }else{
                throw new Error(`${arg} is an alone param`)
            }
        }
    }

    containFlag(flag) {
        return flag in this.#flags
    }

    optParams(param, defaultValue) {
        let value = this.#params[param];
        if(value === undefined) return defaultValue;
        return value
    }
}

module.exports = Parameters;
