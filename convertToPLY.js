const parse = require('csv-parse');
const path = require('path');
const fs = require('fs');
const prepend = require('prepend-file');

const inPath = process.argv[2];
let outPath = "";

if(process.argv[3]){
    outPath = process.argv[3];
}
else{
    outPath = path.resolve(path.dirname(inPath), path.basename(inPath, '.csv') + ".ply");
}

let writeStream = fs.createWriteStream(outPath);

let count = 0;

let parser = parse({
    columns: true
});
parser.on('readable', function(){
    while (star = parser.read()){
        let d = 1.0 / star.parallax;
        let decrad = (Math.PI * star.dec) / 180.0;
        let rarad = (Math.PI * star.ra) / 180.0;
        let x = d * Math.cos(rarad) * Math.cos(decrad);
        let y = d * Math.sin(decrad);
        let z = d * Math.sin(rarad) * Math.cos(decrad);

        let buf = Buffer.alloc(15);
        buf.writeFloatLE(x, 0);
        buf.writeFloatLE(y, 4);
        buf.writeFloatLE(z, 8);
        buf.writeUInt8(1, 12);
        buf.writeUInt8(1, 13);
        buf.writeUInt8(1, 14);
        writeStream.write(buf);
        // writeStream.write('\n');
        ++count;
    }
});
process.nextTick

parser.on('end', function(){
    writeStream.close();

    let header = 
`ply
format binary_little_endian 1.0
element vertex ${count}
property float x
property float y
property float z
property uchar red
property uchar green
property uchar blue
end_header
`
    prepend(outPath, header, function(err){
        if(err) console.error(err);
        console.log("header prepended!");
    });
});

fs.createReadStream(inPath).pipe(parser);