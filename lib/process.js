const _ = require('underscore');
const { spawn } = require('child_process');

class Process {
    constructor(options) {
        this.options = Object.assign({
            relaunch : true            
        },options);
    }
    
    terminate() {
        if(this.process) {
            this.relaunch = false;
            this.process.kill('SIGTERM');
            delete this.process;
        }
        else {
            this.relaunch = false;
        }
    }

    restart() {
        if(this.process) {
            this.process.kill('SIGTERM');
        }
    }

    run() {
        //this.options.verbose && 
        console.log("running", this.options.args)
        if(this.process) {
            // throw new Error("Process is already running!");
            console.error("Process is already running",this);
            return;
        }

        this.relaunch = this.options.relaunch;

        let args = this.options.args.slice();

        let proc = args.shift();

        let cwd = this.options.cwd || __dirname;
        let windowsHide = this.options.windowsHide;
        this.process = spawn(proc, args, { cwd, windowsHide });


        // Good example here for piping directly to log files: https://nodejs.org/api/child_process.html#child_process_options_detached
        if(this.options.pipe) {
            this.process.stdout.pipe(process.stdout);
            this.process.stderr.pipe(process.stderr);
            this.stdin = process.openStdin();
            this.stdin.pipe(this.process.stdin);
        }
        else 
        if(this.options.splitLines) {
            this.process.stdout.on('data',(data) => {
                 data.toString('utf8').split('\n').map( l => console.log(l) );
                //process.stdout.write(data);
            });

            this.process.stderr.on('data',(data) => {
                 data.toString('utf8').split('\n').map( l => console.log(l) );
                //process.stderr.write(data);
            });
        }
        else {
            this.process.stdout.on('data',(data) => {
                 console.log(data.toString('utf8'));
                //process.stdout.write(data);
            });

            this.process.stderr.on('data',(data) => {
                 console.error(data.toString('utf8'));
                //process.stderr.write(data);
            });
        }

        this.process.on('exit', (code) => {
            let { ident } = this;
            if(code)
                console.log(`WARNING - child ${ident} exited with code ${code}`);
            delete this.process;
            if(this.relaunch) {
                console.log("Restarting OES");
                dpc(3000, () => {
                    if(this.relaunch)
                        this.run();
                });
            }else{
                if(this.options.onExit){
                    this.options.onExit()
                }
            }
        });
    }
}

module.exports = Process;