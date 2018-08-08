var os 			= require("os")
var path 		= require("path")
var Process 	= require("./lib/process")
var imagesDir 	= path.join(__dirname, "images");
var BIN 		= path.join(__dirname, "bin"); 

var commandArgs = ["screencapture", "-x"];
switch(os.platform()){
	case "win32":
		commandArgs = [path.join(BIN, "windows", "screenCapture.exe")]
	break;
}
function capture(options, callback) {
	options = Object.assign({
		autoDelete: true
	}, options || {})

	if(options.filePath)
		options.autoDelete = false;

	var args = commandArgs.slice();
	var filePath = options.filePath || path.join(imagesDir, "screenshot.jpg");
	args.push(filePath);

	var proc =  new Process({
		relaunch: false,
		args:args,
		onExit:()=>{
			if(fs.existSync(filePath)){
				var content = fs.readFileSync(filePath);
			}else{
				var content = null;
			}

			if(options.autoDelete){
				if(fs.existSync(filePath))
					fs.unlinkSync(filePath)
			}

			callback(null, {content})
		}
	})

	proc.run();
}


module.exports = {capture}