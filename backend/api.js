const express 		= require('express');
const path			= require('path');
const bodyParser 	= require('body-parser');
const cookieParser	= require('cookie-parser');
const cors 			= require('cors');
const fileUpload	= require('express-fileupload');
const Jimp 			= require('jimp');
const pdf2png		= require('pdf2png');
const pdfPageCount  = require('pdf_page_count');

const Tesseract     = require('tesseract.js');


const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(fileUpload());

app.use('/public', express.static(__dirname + '/public'));

app.post('/upload', function(req, res){
	const file 		= req.files.uploads;
	const file_name = req.files.uploads.name;
	const file_ext  = req.body.extention;
console.log(file_ext);
	const targetFile = `${__dirname}/public/${file_name}`;
			
	if ( file_name !== '' ) {
		file.mv(targetFile, function(err){

			if (err) {
				return res.status(500).send('Upload failed.');
			} else {
				if ( file_ext === '.pdf' ) {
					pdfPageCount.count(targetFile, function(resp){
						if(!resp.success)
						{
							console.log("Something went wrong: " + resp.error);
							
							return;
						}
						// pdf page count
						const pageCount = resp.data;
						// orc result of each page of pdf
						let ocrResult = '';

						pdf2png.convert(targetFile, { returnFilePath: true }, pageCount, function(resp) {
							if(!resp.success) {
							        console.log("Something went wrong: " + resp.error);
							        
							        res.send( { result: "Can't handle the PDF file." } );
							}

							for (let i = 0; i < pageCount; i++) {
							    
							    console.log("Yayy the pdf got converted, now I'm gonna ocr it!");

							    Tesseract.recognize(resp.data[i])
											 .progress((p) => {
											 	//console.log('progress', p);
											 })
											 .then((result) => {
											 	ocrResult = ocrResult + result.text;
											 	if ( i === pageCount-1) {
													res.send({result: ocrResult});
											 		console.log(ocrResult);
											 	}
											 })
							}
						});

					});

					/*pdf2png.convert(targetFile, { returnFilePath: true }, function(resp){
				    
					    if(!resp.success)
					    {
					        console.log("Something went wrong: " + resp.error);
					        
					        res.send( { result: "Can't handle the PDF file." } );
					    }
					    
					    console.log("Yayy the pdf got converted, now I'm gonna save it!");

					    Tesseract.recognize(resp.data)
									 .progress((p) => {
									 	//console.log('progress', p);
									 })
									 .then((result) => {
									 	res.send({result:result.text});
									 	// console.log(result.text);
									 })
					});*/
				} else {
					let lenna = Jimp.read(targetFile)
							  .then(lenna => {
							    return lenna
							      .greyscale() // set greyscale
							      .normalize()
							      .write(targetFile); // save
							  })
							  .catch(err => {
							    console.error(err);
							  });
						
					lenna.then(Tesseract.recognize(targetFile)
							 .progress((p) => {
							 	//console.log('progress', p);
							 })
							 .then((result) => {
							 	//console.log(result);
							 	res.send({result:result.text});
							 }));
				}				
			}



			/*if( err ) {
				return res.status(500).send(err);
			} else {
					
			}*/
		});
	}

});

app.listen(3200, () => {
	console.log('Server started as http://localhost:3200');
});