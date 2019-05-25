import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
	constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, private http: HttpClient) {
		iconRegistry.addSvgIcon(
        	'thumbs-up',
        	sanitizer.bypassSecurityTrustResourceUrl('assets/attach_file.svg'));
    }

	title = 'ocr';
	fileName = '';
	fileSize = 0;
	fileExt  = '';
	results  = {};
	disabled = true;
	onload   = 'before';
	color    = 'primary';
  	mode     = 'determinate';

	uploadedFiles: Array < File > ;

	fileChange(element) {
        this.uploadedFiles = element.target.files;
        this.fileName = element.target.files[0].name;
        this.fileSize = element.target.files[0].size;
        this.fileExt  = this.fileName.match(/\.[0-9a-z]+$/i).join();
      	this.disabled  = false;
    }

	upload() {
	    let formData = new FormData();
	    for (var i = 0; i < this.uploadedFiles.length; i++) {
	        formData.append("uploads", this.uploadedFiles[i]);
	        formData.append("extention", this.fileExt);
	    }
	    this.onload = 'start';
	    this.http.post('http://localhost:3200/upload', formData)
	    .subscribe((response) => {
	        console.log('response received is ', response);
	        this.results = response;
	        this.onload = 'end';
    });
}
}
